// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import { importFiles } from "./importFiles";

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

      vscode.window.showOpenDialog(options).then(fileUri => {
        if (!fileUri) {
          return;
        }

        const result = importFiles(fileUri.map(uri => uri.fsPath), targetFolder);

        for (const fileName of result.skipped) {
          vscode.window.showWarningMessage(
            `Skipped importing "${fileName}": a file with that name already exists in the target folder.`
          );
        }

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
