# Export copies, never moves, files

Issue #9 asked for a way to "move" a development folder to a source folder. We implemented Export as a Copy instead, matching Import's existing non-destructive semantics: originals are always left in place, and Export never deletes anything from the workspace.

We considered making Export a true Move (deleting the source after a successful copy), since that's what the reporter literally described doing manually. We rejected it: a delete-on-success extension command is a much bigger blast-radius feature — a partially-failed batch, a wrong destination pick, or a collision-Skip decision could each leave the user in a state where files are neither at the source nor fully at the destination. Copy avoids all of that by construction. A Move mode can be added later as an explicit, separate, opt-in capability if requested.
