import * as vscode from "vscode";
import * as path from "path";
import * as fs from "fs";
import { findI18nConfigFile } from "./utils.js";
import { TranslationResource } from "./types.js";

const COMMON_TRANSLATION_PATHS = [
  "**/locales/**/*.json",
  "**/public/locales/**/*.json",
  "**/src/i18n/**/*.json",
];

async function findTranslationFiles(): Promise<TranslationResource[]> {
  const translationFiles: TranslationResource[] = [];

  // 🔍 Get i18n config file path
  const configFilePath = await findI18nConfigFile();
  let translationPaths: string[] = [];

  if (configFilePath) {
    const configContent = fs.readFileSync(configFilePath, "utf-8");

    if (configFilePath.endsWith("package.json")) {
      try {
        const json = JSON.parse(configContent);
        if (json.i18next?.backend?.loadPath) {
          translationPaths.push(json.i18next.backend.loadPath);
        }
      } catch (error) {
        console.warn(`Failed to parse ${configFilePath}:`, error);
      }
    } else {
      // For JavaScript/TypeScript config files
      try {
        const content = fs.readFileSync(configFilePath, "utf-8");

        // Extract backend.loadPath using regex
        const loadPathMatch = content.match(/loadPath\s*:\s*["']([^"']+)["']/);
        if (loadPathMatch && loadPathMatch[1]) {
          translationPaths.push(loadPathMatch[1]);
        }

        // Extract supportedLngs or supportedLanguages
        const supportedLngsMatch = content.match(
          /supportedLngs\s*:\s*\[(.*?)\]/s
        );
        if (supportedLngsMatch && supportedLngsMatch[1]) {
          // Process the languages
          console.log("Supported languages:", supportedLngsMatch[1]);
        }

        // Extract namespaces (ns)
        const nsMatch = content.match(/ns\s*:\s*\[(.*?)\]/s);
        if (nsMatch && nsMatch[1]) {
          // Process the namespaces
          console.log("Namespaces:", nsMatch[1]);
        }

        // Extract locales path if present
        const localesMatch = content.match(/locales\s*:\s*["']([^"']+)["']/);
        if (localesMatch && localesMatch[1]) {
          translationPaths.push(localesMatch[1]);
        }

        // Extract resources if present
        const resourcesMatch = content.match(/resources\s*:\s*\{(.*?)\}/s);
        if (resourcesMatch) {
          console.log("Resources found in config");
        }
      } catch (error) {
        console.warn(`Failed to parse ${configFilePath}:`, error);
      }
    }
  }

  if (translationPaths.length === 0) {
    // Fallback to standard locations
    translationPaths = COMMON_TRANSLATION_PATHS;
  }

  // 🔎 Search for translation files
  const files = await vscode.workspace.findFiles(
    `{${translationPaths.join(",")}}`,
    "**/node_modules/**"
  );

  for (const file of files) {
    const filePath = file.fsPath;
    const parsedPath = path.parse(filePath);
    const parts = filePath.split(path.sep);

    // Detect language from the file path
    const lngMatch = parts.find((part: string) =>
      /^[a-z]{2}(-[A-Z]{2})?$/.test(part)
    );
    const lng = lngMatch || "default";

    // Detect namespace from the filename (optional, based on structure)
    let namespace: string | undefined;
    if (parsedPath.name !== lng) {
      namespace = parsedPath.name;
    }

    translationFiles.push({ filePath, locale: lng, namespace });
  }

  return translationFiles;
}

export default findTranslationFiles;
