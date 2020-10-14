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
        if (fileUri) {
          fileUri.map(uri => {
            const filePath = uri.fsPath.split(path.sep);
            try {
              fs.copyFileSync(
                uri.fsPath,
                path.join(targetFolder, filePath[filePath.length - 1])
              );
            } catch (error) {
              vscode.window.showErrorMessage(
                "Error importing file " + filePath[filePath.length - 1],
                error
              );
            }
          });
          vscode.window.showInformationMessage(`File${fileUri.length > 1 ? 's' : ''} imported successfully`);
        }
      });
    }
  );

  context.subscriptions.push(disposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
