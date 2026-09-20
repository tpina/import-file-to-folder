// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import { CollisionDecision, importFiles } from "./importFiles";

async function resolveCollision(fileName: string): Promise<CollisionDecision> {
  const choice = await vscode.window.showWarningMessage(
    `"${fileName}" already exists in the target folder. Overwrite it?`,
    { modal: true },
    "Overwrite", "Overwrite All", "Skip", "Skip All"
  );

  switch (choice) {
    case "Overwrite":
      return "overwrite";
    case "Overwrite All":
      return "overwriteAll";
    case "Skip All":
      return "skipAll";
    case "Skip":
    default:
      // Dismissing the dialog (Escape / clicking away) also lands here,
      // which is the safe default: don't overwrite without being told to.
      return "skip";
  }
}

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.importFileToFolder",
    () => {
      let targetFolder: string = vscode.workspace.workspaceFolders ? vscode.workspace.workspaceFolders[0].uri.fsPath : "";
      vscode.commands.executeCommand("copyFilePath").then(() => {
        vscode.env.clipboard.readText().then(copyPath => {
          const stat = fs.lstatSync(copyPath);
          if (stat.isDirectory() && fs.existsSync(copyPath)) {
              targetFolder = copyPath;
          }
        });
      });

      const options: vscode.OpenDialogOptions = {
        canSelectMany: true,
        openLabel: "Open",
        filters: {
          "Text files": ["*"],
          "All files": ["*"]
        }
      };

      vscode.window.showOpenDialog(options).then(async fileUri => {
        if (!fileUri) {
          return;
        }

        const result = await importFiles(fileUri.map(uri => uri.fsPath), targetFolder, resolveCollision);

        for (const failure of result.failed) {
          vscode.window.showErrorMessage(
            "Error importing file " + failure.file + ": " + failure.message
          );
        }

        if (result.imported.length === fileUri.length) {
          vscode.window.showInformationMessage(`File${fileUri.length > 1 ? 's' : ''} imported successfully`);
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
