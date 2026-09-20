# Import behavior fixes

Status: resolved (both issues), fixed in `fix/import-collision-and-partial-failure`, released as 0.12.0

Two behavior gaps surfaced during the repo's first grilling session (see `CONTEXT.md` for the resolved terms: Import Operation, Target Folder, Filename Collision), both in `src/extension.ts`.

## Context

The Import Operation's intended contract, per `CONTEXT.md`:

- An Import Operation succeeds only when every selected File copies cleanly.
- A Filename Collision (source File name already exists in the Target Folder) prompts the user to overwrite or skip, rather than silently overwriting.

The original implementation did neither. See `issues/01` and `issues/02` for the fixes; both now covered by `src/test/suite/importFiles.test.ts`.

## Issues

- [01 - Filename Collision silently overwrites](./issues/01-silent-overwrite-on-collision.md) — resolved
- [02 - Import Operation reports success despite partial failure](./issues/02-false-success-on-partial-failure.md) — resolved
