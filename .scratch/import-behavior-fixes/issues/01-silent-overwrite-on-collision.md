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

Extracted the copy logic into `src/importFiles.ts::importFiles`, which checks `fs.existsSync` on the destination before copying. On a collision it now asks (via a `resolveCollision` callback, wired in `src/extension.ts` to a modal `showWarningMessage` with Overwrite / Overwrite All / Skip / Skip All) rather than silently overwriting or unilaterally skipping. Dismissing the dialog defaults to Skip. Covered by `src/test/suite/importFiles.test.ts`.
