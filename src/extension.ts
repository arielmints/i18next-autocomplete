import * as vscode from "vscode";
import provideCompletionItems from "./translationCompletionProvider.js";

const DOCUMENT_SELECTOR = [
  { scheme: "file", language: "javascript" },
  { scheme: "file", language: "typescript" },
  { scheme: "file", language: "javascriptreact" },
  { scheme: "file", language: "typescriptreact" },
];

export function activate(context: vscode.ExtensionContext) {
  vscode.window.showInformationMessage("Activated");
  // Register completion provider for both namespaces and translation keys
  const provider = vscode.languages.registerCompletionItemProvider(
    DOCUMENT_SELECTOR,
    {
      provideCompletionItems: provideCompletionItems,
    },
    '"',
    "'" // Trigger on quote marks
  );

  context.subscriptions.push(provider);
}

export function deactivate() {}
