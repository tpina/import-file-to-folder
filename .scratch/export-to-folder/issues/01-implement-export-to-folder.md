# Implement Export to Folder command

Status: ready-for-agent
Category: feature

## Problem

There is no way to copy files/folders *out of* the workspace to an arbitrary destination. Import only supports the reverse direction (external files copied in). See [GitHub issue #9](https://github.com/tpina/import-file-to-folder/issues/9).

## Expected behavior

Add a new command `extension.exportFileToFolder`, labeled "Export to Folder…":

- **Trigger**: Explorer context menu when one or more Files and/or Folders are selected (multi-select allowed, mixed types allowed), plus Command Palette. No default keybinding.
- **Destination**: on invocation, open `vscode.window.showOpenDialog` with `canSelectFolders: true, canSelectFiles: false, canSelectMany: false` to let the user pick a Destination Folder.
- **Copy**:
  - A selected File is copied directly into the Destination Folder (same as today's Import copy).
  - A selected Folder is copied recursively: recreate `destination/<FolderName>/**`, preserving the full subtree including empty subdirectories.
  - Symlinks encountered during recursion are not followed or recreated — treat as a failed item for that path, surfaced the same way as any other per-item copy failure.
- **Collisions**: reuse the existing Filename Collision policy/modal (Overwrite / Overwrite All / Skip / Skip All, dismiss = Skip) unchanged. If the top-level `destination/<FolderName>` already exists, do not prompt once for the whole folder — walk in and resolve collisions per nested File, exactly as if copying into a partially-populated folder.
- **Result reporting**: same partial-failure contract as Import Operation — only report success when every selected item (and every file within every selected Folder) copied cleanly; otherwise surface per-item failures, no false "exported successfully" message.
- No progress/cancel UI, no persisted/remembered destination — resolve everything fresh per invocation.

## Implementation notes

- `src/importFiles.ts::importFiles` already parameterizes source/destination and contains the collision + partial-failure machinery; prefer generalizing it (e.g. accepting Files and Folders in the source list, adding recursive directory handling) over duplicating it, so both commands share one tested engine.
- `package.json` needs: new command contribution, `explorer/context` menu entry (no `explorerResourceIsFolder`-only restriction — must show for File and Folder selections), Command Palette entry. No keybinding entry.
- Extend `src/test/suite/importFiles.test.ts` (or a sibling test file) to cover: recursive folder copy including empty subdirectories, merge-collision behavior when the destination folder already exists, and symlink-skip-as-failure.

## Origin

Surfaced via `/grill-with-docs` on [GitHub issue #9](https://github.com/tpina/import-file-to-folder/issues/9), 2026-09-20. Full design discussion (all rounds) preserved in the conversation; canonical decisions recorded in `../spec.md`, `CONTEXT.md`, and `docs/adr/0001-export-copies-never-moves.md`.
