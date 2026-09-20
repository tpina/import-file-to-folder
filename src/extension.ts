// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from "vscode";
import * as fs from "fs";
import { CollisionDecision, CopyResult, copyPaths } from "./copyPaths";

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

/** Shows an error message for each failed item. Shared by Import and Export. */
function reportFailures(result: CopyResult, verb: "importing" | "exporting") {
  for (const failure of result.failed) {
    vscode.window.showErrorMessage(
      `Error ${verb} ${failure.file}: ${failure.message}`
    );
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

        const result = await copyPaths(fileUri.map(uri => uri.fsPath), targetFolder, resolveCollision);
        reportFailures(result, "importing");

        if (result.imported.length === fileUri.length) {
          vscode.window.showInformationMessage(`File${fileUri.length > 1 ? 's' : ''} imported successfully`);
        }
      });
    }
  );

  context.subscriptions.push(disposable);

  let exportDisposable = vscode.commands.registerCommand(
    "extension.exportFileToFolder",
    async (contextUri?: vscode.Uri, selectedUris?: vscode.Uri[]) => {
      const sourceUris = selectedUris && selectedUris.length > 0
        ? selectedUris
        : contextUri
          ? [contextUri]
          : [];

      if (sourceUris.length === 0) {
        vscode.window.showErrorMessage("Select one or more files or folders to export.");
        return;
      }

      const destinationUri = await vscode.window.showOpenDialog({
        canSelectFiles: false,
        canSelectFolders: true,
        canSelectMany: false,
        openLabel: "Export Here"
      });

      if (!destinationUri || destinationUri.length === 0) {
        return;
      }

      const targetFolder = destinationUri[0].fsPath;
      const result = await copyPaths(sourceUris.map(uri => uri.fsPath), targetFolder, resolveCollision);
      reportFailures(result, "exporting");

      if (result.failed.length === 0 && result.skipped.length === 0) {
        vscode.window.showInformationMessage("Exported successfully");
      }
    }
  );

  context.subscriptions.push(exportDisposable);
}

// this method is called when your extension is deactivated
export function deactivate() { }
