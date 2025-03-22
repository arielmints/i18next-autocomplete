import * as vscode from "vscode";
import { flattenObject } from "./utils";
import { loadAndParseTranslationJSONFile } from "./parsers/json-parser";
import { ConfigDetails } from "./types";
import { extractI18nBackendLoadPathConfig } from "./parsers/config-file-parser";

/**
 * Retrieves translation file paths based on the provided config details
 * @param configDetails The configuration details containing supported languages and namespaces
 * @returns An array of objects containing translation file paths, translations, and flattened keys
 */
const getTranslationFilePaths = async (
  configDetails: ConfigDetails
): Promise<
  Array<{
    lng: string;
    namespace: string;
    path: string;
    translations: object;
    translationsFlattedKeys: string[];
  }>
> => {
  const paths: Array<{
    lng: string;
    namespace: string;
    path: string;
    translations: object;
    translationsFlattedKeys: string[];
  }> = [];
  for (const lng of configDetails?.supportedLngs ?? []) {
    for (const namespace of configDetails?.namespaces ?? []) {
      const builtPath = (configDetails?.absoluteLoadPath ?? "")
        .replace("{{lng}}", lng)
        .replace("{{ns}}", namespace);
      const translations = await loadAndParseTranslationJSONFile(builtPath);
      const translationsFlatted = flattenObject(translations);
      paths.push({
        lng,
        namespace,
        path: builtPath,
        translations,
        translationsFlattedKeys: Object.keys(translationsFlatted),
      });
    }
  }

  return paths;
};

const getPublicPathFromSettings = () => {
  // Get the TypeScript configuration section
  const typescriptConfig = vscode.workspace.getConfiguration(
    "i18next-autocomplete"
  );

  // Access specific properties from the TypeScript configuration
  // For example, to get the tsdk property:
  const publicPath = typescriptConfig.get("publicPath");
  console.log("TypeScript SDK path:", publicPath);

  // You can access other properties as needed
  const useCodeSnippets = typescriptConfig.get(
    "useCodeSnippetsOnMethodSuggest"
  );
  console.log("Use code snippets:", useCodeSnippets);

  // Return the actual value you need for your application
  // Replace this with the appropriate property you need
  return publicPath || "";
};

const convertTranslationsToCompletions = (
  translations: Array<{
    lng: string;
    namespace: string;
    path: string;
    translations: object;
    translationsFlattedKeys: string[];
  }>
): Record<
  string,
  {
    lngs: string[];
    path: string;
  }
> => {
  const completions: Record<
    string,
    {
      lngs: string[];
      path: string;
    }
  > = {};
  for (const translation of translations) {
    for (const key of translation.translationsFlattedKeys) {
      if (!completions[`${translation.namespace}:${key}`]) {
        completions[`${translation.namespace}:${key}`] = {
          lngs: [translation.lng],
          path: translation.path,
        };
      } else {
        completions[`${translation.namespace}:${key}`].lngs = Array.from(
          new Set([
            ...completions[`${translation.namespace}:${key}`].lngs,
            translation.lng,
          ])
        );
      }
    }
  }
  return completions;
};

const getLoadPathCompletions = async (configFile: string) => {
  // Handle loadPath configuration
  const configDetails = await extractI18nBackendLoadPathConfig(configFile);

  if (!configDetails) {
    vscode.window.showErrorMessage(
      "i18n-autocomplete: No config details found"
    );
    return { completions: {}, namespaces: [] };
  }

  const paths = await getTranslationFilePaths(configDetails);
  if (paths.length === 0) {
    vscode.window.showErrorMessage(
      "i18n-autocomplete: No translation files found"
    );
    return { completions: {}, namespaces: [] };
  }

  const completions = convertTranslationsToCompletions(paths);

  return {
    completions,
    namespaces: configDetails?.namespaces ?? [],
  };
};

export {
  convertTranslationsToCompletions,
  getPublicPathFromSettings,
  getTranslationFilePaths,
  getLoadPathCompletions,
};
