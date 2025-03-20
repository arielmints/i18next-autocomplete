import * as vscode from "vscode";

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

export { findI18nConfigFile };
