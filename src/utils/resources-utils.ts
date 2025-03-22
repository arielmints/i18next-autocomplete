import { extractI18nConfigFileResources } from "../parsers/config-file-parser";
import * as vscode from "vscode";
import { TranslationResource } from "../types";
import * as fs from "fs";
import * as path from "path";
import { flattenObject } from "../utils";

/**
 * Parses translation resource files and extracts flattened keys with their supported locales
 * @param resources Array of TranslationResource objects
 * @returns Object mapping flattened keys to arrays of supported locales
 */
async function parseTranslationResources(
  resources: TranslationResource[]
): Promise<Record<string, string[]>> {
  const result: Record<string, string[]> = {};

  // Process each resource file
  for (const resource of resources) {
    try {
      const { locale, filePath } = resource;
      let content: string;

      try {
        // Read the file content
        content = await fs.promises.readFile(filePath, "utf8");
      } catch (error) {
        // If the direct path doesn't work, try resolving relative to the workspace
        const workspaceFolders = vscode.workspace.workspaceFolders;
        if (workspaceFolders && workspaceFolders.length > 0) {
          const workspacePath = workspaceFolders[0].uri.fsPath;
          const resolvedPath = path.resolve(workspacePath, filePath);
          content = await fs.promises.readFile(resolvedPath, "utf8");
        } else {
          throw error;
        }
      }

      // Handle JS/TS files by extracting the exported object
      let translationData: any;
      if (
        filePath.endsWith(".js") ||
        filePath.endsWith(".ts") ||
        filePath.endsWith(".tsx")
      ) {
        // Use TypeScript's parser to properly handle the file
        const ts = await import("typescript");
        const sourceFile = ts.createSourceFile(
          filePath,
          content,
          ts.ScriptTarget.Latest,
          true
        );

        // Find either a default export declaration or a const declaration
        let exportedObject: string | null = null;
        ts.forEachChild(sourceFile, (node: any) => {
          if (
            ts.isExportAssignment(node) &&
            node.expression &&
            ts.isObjectLiteralExpression(node.expression)
          ) {
            exportedObject = node.expression.getText();
          } else if (
            ts.isVariableStatement(node) &&
            node.declarationList.declarations.length > 0
          ) {
            const declaration = node.declarationList.declarations[0];
            if (
              declaration.initializer &&
              ts.isObjectLiteralExpression(declaration.initializer) &&
              ts.isIdentifier(declaration.name)
            ) {
              // Check if this variable is later exported
              const varName = declaration.name.getText();
              let isExported = false;
              ts.forEachChild(sourceFile, (n: any) => {
                if (
                  ts.isExportAssignment(n) &&
                  ts.isIdentifier(n.expression) &&
                  n.expression.getText() === varName
                ) {
                  isExported = true;
                }
              });
              if (isExported) {
                exportedObject = declaration.initializer.getText();
              }
            }
          }
        });

        if (exportedObject) {
          try {
            // Convert the object literal text to valid JSON
            const jsonStr = exportedObject;
            // .replace(/(['"])?([a-zA-Z0-9_]+)(['"])?:/g, '"$2":') // Ensure property names are quoted
            // .replace(/'/g, '"'); // Replace single quotes with double quotes

            translationData = JSON.parse(jsonStr);
          } catch (parseError) {
            console.error(
              `Error parsing JS/TS export in ${filePath}:`,
              parseError
            );
            continue;
          }
        } else {
          console.error(`Could not extract export from ${filePath}`);
          continue;
        }
      } else {
        // JSON files can be parsed directly
        try {
          translationData = JSON.parse(content);
        } catch (parseError) {
          console.error(`Error parsing JSON in ${filePath}:`, parseError);
          continue;
        }
      }

      // Flatten the translation object
      const flattenedTranslations = flattenObject(translationData);

      // Add each key to the result with the current locale
      for (const key of Object.keys(flattenedTranslations)) {
        if (!result[key]) {
          result[key] = [];
        }

        if (!result[key].includes(locale)) {
          result[key].push(locale);
        }
      }
    } catch (error) {
      console.error(`Error processing resource ${resource.filePath}:`, error);
    }
  }

  return result;
}

const getResources = async (configFile: string) => {
  const resources = await extractI18nConfigFileResources(configFile);
  if (resources.length === 0) {
    vscode.window.showErrorMessage("No resources found in i18n config file");
    return;
  }
  console.log("resources", resources);

  // const translationFiles = await findTranslationFiles();
  // console.log("translationFiles", translationFiles);

  const parsed = await parseTranslationResources(resources);
  return parsed;
};

export { getResources };
