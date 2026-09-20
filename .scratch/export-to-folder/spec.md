# Export to Folder

Status: ready-for-agent

Implements [GitHub issue #9](https://github.com/tpina/import-file-to-folder/issues/9): a reverse of Import — copy selected Files/Folders from the workspace out to a user-picked Destination Folder, instead of picking source Files into a Target Folder.

Design settled via `/grill-with-docs`, 2026-09-20. Terms below are defined in `CONTEXT.md`; see `docs/adr/0001-export-copies-never-moves.md` for the copy-vs-move decision.

## Context

Today, Import only moves files *into* the workspace: right-click a folder → pick source Files via a dialog → copy them in. The reporter's workflow (Blender addon dev folder → external source folder) needs the opposite: pick source item(s) already in the workspace, then choose an external destination via a dialog.

## Decisions

- **New command** `extension.exportFileToFolder`, separate from `extension.importFileToFolder`, reusing/generalizing the `importFiles()` copy engine (`src/importFiles.ts`).
- **Semantics**: Copy only, never Move — originals stay in place (ADR 0001).
- **Source**: one or more Files and/or Folders, selected via Explorer multi-select right-click (mixed files+folders in one selection).
- **Destination Folder**: picked via a new native folder-picker dialog (`vscode.window.showOpenDialog` with `canSelectFolders: true`). No persistence/memory of the last-used destination — resolved fresh per invocation, same as Import.
- **Folder-as-source**: recursive. Recreates the full subtree at `destination/<FolderName>/**`, including empty subdirectories.
- **Collisions**: reuses the existing per-item modal (Overwrite / Overwrite All / Skip / Skip All, dismiss = Skip) unchanged. If the top-level Destination Folder already exists, it's a merge — collisions resolved per nested File, not one folder-level prompt.
- **Command label**: "Export to Folder…"

## Explicitly out of scope for v1

- No exclusion filtering of directories (e.g. `.git`, `node_modules`) — copies everything as selected.
- Symlinks are not followed or recreated — skipped and reported as a per-item failure, same channel as any other copy error.
- No progress/cancel UI during the copy.
- No default keybinding — context menu + Command Palette only.

These were deliberate v1 scope cuts, not oversights — don't reintroduce them without a fresh decision.

## Issues

- [01 - Implement Export to Folder command](./issues/01-implement-export-to-folder.md)
