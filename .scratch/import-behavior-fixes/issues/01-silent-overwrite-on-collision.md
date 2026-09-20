# Filename Collision silently overwrites

Status: resolved
Category: bug

## Problem

`fs.copyFileSync` in `src/extension.ts` overwrites an existing file of the same name in the Target Folder with no warning, prompt, or skip. Per `CONTEXT.md`'s definition of **Filename Collision**, the intended behavior is warn-and-skip, not silent overwrite.

## Where

`src/extension.ts`, inside the `fileUri.map(...)` loop, the `fs.copyFileSync(uri.fsPath, path.join(targetFolder, filePath[filePath.length - 1]))` call.

## Expected behavior

Before copying, check whether a file of the same name already exists at the destination. If it does, skip that file and warn the user (e.g. via `vscode.window.showWarningMessage`) instead of overwriting silently. The Import Operation should still proceed for the remaining files.

## Origin

Surfaced during the repo's first grilling session (`/grill-with-docs`), 2026-09-20.

## Resolution

Extracted the copy logic into `src/importFiles.ts::importFiles`, which now checks `fs.existsSync` on the destination before copying and reports the file as skipped instead of overwriting it. `src/extension.ts` shows a `showWarningMessage` per skipped file. Covered by `src/test/suite/importFiles.test.ts`.
