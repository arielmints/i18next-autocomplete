import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";
import {
  convertTranslationsToCompletions,
  getLoadPathCompletions,
  getTranslationFilePaths,
} from "./backend-loadpath-utils.js";

import { extractI18nBackendLoadPathConfig } from "./parsers/config-file-parser.js";
import {
  detectI18nConfigType,
  findI18nConfigFile,
} from "./utils/config-file.utils.js";
import { getResources } from "./utils/resources-utils.js";

/**
 * Flattens a nested object structure into a single-level object with dot notation keys
 * @param obj The object to flatten
 * @param prefix Current key prefix (used in recursion)
 * @returns Flattened object with dot notation keys
 */
function flattenObject(obj: any, prefix = ""): Record<string, string> {
  return Object.keys(obj).reduce((acc: Record<string, string>, key: string) => {
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (
      typeof obj[key] === "object" &&
      obj[key] !== null &&
      !Array.isArray(obj[key])
    ) {
      Object.assign(acc, flattenObject(obj[key], prefixedKey));
    } else {
      acc[prefixedKey] = obj[key];
    }

    return acc;
  }, {});
}

const getTranslationOptions = async (): Promise<{
  completions: Record<string, { lngs: string[]; path: string }>;
  namespaces: string[];
}> => {
  const configFile = await findI18nConfigFile();
  if (!configFile) {
    vscode.window.showErrorMessage(
      "i18n-autocomplete: No i18n config file found"
    );
    return { completions: {}, namespaces: [] };
  }

  // Detect the config type - resources or loadPath
  const configType = await detectI18nConfigType(configFile);

  if (!configType) {
    vscode.window.showErrorMessage(
      "i18n-autocomplete: Could not determine i18n config type (resources or loadPath)"
    );
    return { completions: {}, namespaces: [] };
  }

  if (configType === "loadPath") {
    return getLoadPathCompletions(configFile);
  } else {
    // Handle resources configuration
    const parsed = await getResources(configFile);

    if (!parsed) {
      vscode.window.showErrorMessage(
        "i18n-autocomplete: Failed to parse resources from config file"
      );
      return { completions: {}, namespaces: [] };
    }

    // TODO: Convert parsed resources to completions format
    // This is a simplified version and may need to be expanded
    const completions: Record<string, { lngs: string[]; path: string }> = {};

    // Extract namespaces from the parsed resources
    // This assumes 'translation' is the default namespace if not specified
    const namespaces = ["translation"]; // TODO remove this default value

    return {
      completions,
      namespaces,
    };
  }
};

export {
  findI18nConfigFile,
  flattenObject,
  getTranslationOptions,
  detectI18nConfigType,
};
