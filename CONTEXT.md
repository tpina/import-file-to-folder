# Import File to Folder

A VS Code extension that copies user-selected files into a chosen destination folder from the Explorer context menu or Command Palette.

## Language

**Import**:
Copying one or more selected Files into a Target Folder, leaving the originals in place.
_Avoid_: Move, transfer, upload

**Import Operation**:
A single invocation of the Import command against a set of selected Files and one Target Folder. Succeeds only when every selected File copies cleanly; a partial failure is not a success.
_Avoid_: Import (when meaning the whole operation, not the action)

**Target Folder**:
The destination directory for an Import Operation. Resolves to the folder right-clicked in the Explorer; falls back to the workspace root when the command is invoked without folder context (e.g. via the Command Palette).
_Avoid_: Destination, output folder

**File**:
A single non-directory filesystem entry selectable as an import source. Folders are not currently importable; folder-importing is an unscoped future capability, not part of this term.

**Filename Collision**:
When a File being imported shares its name with an existing entry already in the Target Folder. Intended policy: warn and skip rather than silently overwrite (current implementation overwrites silently — tracked as a fix, not the intended behavior).
