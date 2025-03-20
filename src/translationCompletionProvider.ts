import * as vscode from "vscode";
import { getTranslationOptions } from "./utils.js";

/**
 * Provides completion items for i18next namespaces and translation keys
 */
const provideCompletionItems = async (
  document: vscode.TextDocument,
  position: vscode.Position
) => {
  const lineText = document.lineAt(position).text;

  // Ensure we're inside t("...") function
  const regex = /t\(["'`](.*?)$/;
  const match = lineText.match(regex);
  if (!match) return;

  const { completions, namespaces } = await getTranslationOptions();

  if (!completions) return;

  const namespaceCompletions = namespaces.map((namespace) => {
    const item = new vscode.CompletionItem(
      namespace,
      vscode.CompletionItemKind.Property
    );
    item.insertText = namespace;
    item.documentation = new vscode.MarkdownString(
      `Namespace: **${namespace}**`
    );
    item.detail = `${namespace} | i18next-autocomplete`;
    return item;
  });

  const translationCompletions = Object.entries(completions).map(
    ([key, completionObject]) => {
      const item = new vscode.CompletionItem(
        key,
        vscode.CompletionItemKind.Module
      );
      item.insertText = key;
      item.documentation = new vscode.MarkdownString(
        `Translation key: **${key}**\n\n In locales: ${completionObject.lngs.join(
          ", "
        )}`
      );
      item.detail = `${completionObject.lngs.join(
        ", "
      )} | i18next-autocomplete`;
      return item;
    }
  );

  return [...namespaceCompletions, ...translationCompletions];
};

export default provideCompletionItems;
