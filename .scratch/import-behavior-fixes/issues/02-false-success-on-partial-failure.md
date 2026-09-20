# Import Operation reports success despite partial failure

Status: needs-triage
Category: bug

## Problem

Per `CONTEXT.md`'s definition of **Import Operation**, it "succeeds only when every selected File copies cleanly; a partial failure is not a success." The current implementation violates this: each file copy is wrapped in its own try/catch that shows a per-file error message, but the final `vscode.window.showInformationMessage("File(s) imported successfully")` call fires unconditionally after the loop, regardless of whether any individual copy failed.

## Where

`src/extension.ts`, in the `activate` function: the `fileUri.map(...)` loop's per-file try/catch, followed by the unconditional success message after the loop.

## Expected behavior

Track whether any file in the batch failed to copy. Only show the "imported successfully" message when all files succeeded; when there's a partial failure, the per-file error messages should be the only feedback (or a summary reflecting the mixed outcome), not a follow-up success message.

## Origin

Surfaced during the repo's first grilling session (`/grill-with-docs`), 2026-09-20.
