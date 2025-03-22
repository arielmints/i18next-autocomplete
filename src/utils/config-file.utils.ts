import * as vscode from "vscode";
import * as fs from "fs";
import { ConfigType } from "../types";

/**
 * Searches for an i18n configuration file in the workspace
 * Looks for .js, .ts, or .tsx files within any i18n directory
 * Excludes files in node_modules
 * @returns Path to the first matching config file found, or null if none found
 */
async function findI18nConfigFile(): Promise<string | null> {
  const files = await vscode.workspace.findFiles(
    "**/i18n/**/*.{js,ts,tsx}",
    "**/node_modules/**",
    10
  );
  return files[0]?.fsPath ?? null;
}

/**
 * Determines whether an i18n config file uses resources or loadPath for translation configuration
 * @param configFilePath Path to the i18n config file
 * @returns The configuration type ('resources' or 'loadPath') or null if not detected
 */
async function detectI18nConfigType(
  configFilePath?: string
): Promise<ConfigType | null> {
  try {
    // Find i18n config file if not provided
    if (!configFilePath) {
      const foundConfigFile = await findI18nConfigFile();
      if (!foundConfigFile) {
        vscode.window.showErrorMessage(
          "i18n-autocomplete: No i18n config file found"
        );
        return null;
      }
      configFilePath = foundConfigFile;
    }

    // Read the file content
    const content = await fs.promises.readFile(configFilePath, "utf8");

    // Check for backend loadPath pattern
    const loadPathRegex =
      /backend\s*:\s*{[^}]*loadPath\s*:\s*["'`]([^"'`]+)["'`][^}]*}/s;
    const usesLoadPath = loadPathRegex.test(content);

    // Check for resources pattern - look for various forms of resources definitions
    const resourcesRegex1 = /resources\s*:\s*{/;
    const resourcesRegex2 = /const\s+resources\s*=\s*{/;
    const resourcesRegex3 = /i18n[\s\S]*?\.init\s*\(\s*{[\s\S]*?resources\s*:/;

    const usesResources =
      resourcesRegex1.test(content) ||
      resourcesRegex2.test(content) ||
      resourcesRegex3.test(content);

    // Determine the config type based on our findings
    if (usesLoadPath && !usesResources) {
      return "loadPath";
    } else if (usesResources && !usesLoadPath) {
      return "resources";
    } else if (usesResources && usesLoadPath) {
      // If both are detected, prioritize loadPath as it's more common in newer projects
      return "loadPath";
    } else {
      // Neither detected
      return null;
    }
  } catch (error) {
    console.error("Error detecting i18n config type:", error);
    return null;
  }
}

export { detectI18nConfigType, findI18nConfigFile };
