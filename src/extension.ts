// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import * as path from "path";

// this method is called when your extension is activated
// your extension is activated the very first time the command is executed
export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand(
    "extension.importFileToFolder",
    () => {
      let targetFolder: string = "";
      vscode.commands.executeCommand("copyFilePath").then(() => {
        vscode.env.clipboard.readText().then(copyPath => {
          targetFolder = copyPath;
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
        if (fileUri && fileUri[0]) {
          const filePath = fileUri[0].fsPath.split("/");
          try {
            fs.copyFileSync(
              fileUri[0].fsPath,
              path.join(targetFolder, filePath[filePath.length - 1])
            );
          } catch (error) {
            vscode.window.showErrorMessage("Error importing your file", error);
          }
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() {}
