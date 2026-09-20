# Import File to Folder

A VS Code extension that copies files between the workspace and a chosen folder, from the Explorer context menu or Command Palette.

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

**Export**:
Copying one or more selected Files and/or Folders from the workspace into a Destination Folder, leaving the originals in place. The reverse direction of Import.
_Avoid_: Move, transfer, upload, download

**Export Operation**:
A single invocation of the Export command against a set of selected Files/Folders and one Destination Folder. Each selected Folder is copied recursively, recreating its full subtree — including empty subdirectories — at the destination. Succeeds only when every selected item copies cleanly; a partial failure is not a success.
_Avoid_: Export (when meaning the whole operation, not the action)

**Destination Folder**:
The destination directory for an Export Operation, chosen by the user via a folder-picker dialog. Unlike a Target Folder, it is never inferred from Explorer context — it is always an explicit user choice.
_Avoid_: Target Folder (that term is Import-specific), output folder

**File**:
A single non-directory filesystem entry. An Import source must be a File; Folders cannot be selected for Import. An Export source may be either a File or a Folder.

**Folder**:
A directory selectable as an Export source, copied recursively. Not a valid Import source.
_Avoid_: Directory

**Filename Collision**:
When an item being copied (Import or Export) shares its name with an existing entry already in the destination. Policy: the user is prompted per collision to Overwrite, Skip, or apply that choice to the rest of the batch (Overwrite All / Skip All); dismissing the prompt defaults to Skip. When a Folder Export's Destination Folder already exists, this policy applies per nested File — there is no single whole-folder prompt.
