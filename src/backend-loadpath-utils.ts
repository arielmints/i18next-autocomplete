import * as fs from "fs";
import * as path from "path";
import * as vscode from "vscode";

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
export { convertTranslationsToCompletions, getPublicPathFromSettings };
