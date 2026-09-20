import * as fs from "fs";
import * as path from "path";

export interface CopyResult {
  imported: string[];
  skipped: string[];
  failed: { file: string; message: string }[];
}

/** What to do about one filename collision. The "*All" variants apply to every remaining collision in the batch without asking again. */
export type CollisionDecision = "overwrite" | "skip" | "overwriteAll" | "skipAll";

interface CopyContext {
  targetFolder: string;
  resolveCollision: (fileName: string) => Promise<CollisionDecision>;
  result: CopyResult;
  bulkDecision?: "overwrite" | "skip";
}

/**
 * Copies each source (file or folder) into targetFolder. A folder is copied
 * recursively, recreating its full subtree - including empty subdirectories -
 * at the destination; its nested files are subject to collision resolution
 * individually, the same as any top-level file. Symlinks are not followed or
 * recreated; encountering one is reported as a failed item.
 *
 * When a source's name already exists at its destination, resolveCollision is
 * asked what to do; its answer decides whether that file is overwritten or
 * skipped.
 */
export async function copyPaths(
  sourcePaths: string[],
  targetFolder: string,
  resolveCollision: (fileName: string) => Promise<CollisionDecision>
): Promise<CopyResult> {
  const context: CopyContext = {
    targetFolder,
    resolveCollision,
    result: { imported: [], skipped: [], failed: [] }
  };

  for (const sourcePath of sourcePaths) {
    await copyEntry(sourcePath, path.basename(sourcePath), context);
  }

  return context.result;
}

async function copyEntry(sourcePath: string, relativeName: string, context: CopyContext): Promise<void> {
  let stat: fs.Stats;
  try {
    stat = fs.lstatSync(sourcePath);
  } catch (error) {
    context.result.failed.push({ file: relativeName, message: errorMessage(error) });
    return;
  }

  if (stat.isSymbolicLink()) {
    context.result.failed.push({ file: relativeName, message: "Symlinks are not supported" });
    return;
  }

  if (stat.isDirectory()) {
    fs.mkdirSync(path.join(context.targetFolder, relativeName), { recursive: true });
    for (const entry of fs.readdirSync(sourcePath)) {
      await copyEntry(path.join(sourcePath, entry), path.join(relativeName, entry), context);
    }
    return;
  }

  const destination = path.join(context.targetFolder, relativeName);

  if (fs.existsSync(destination)) {
    const decision = context.bulkDecision ?? await context.resolveCollision(relativeName);
    if (decision === "overwriteAll") {
      context.bulkDecision = "overwrite";
    } else if (decision === "skipAll") {
      context.bulkDecision = "skip";
    }

    const effective = context.bulkDecision ?? (decision === "overwrite" || decision === "skip" ? decision : "skip");
    if (effective === "skip") {
      context.result.skipped.push(relativeName);
      return;
    }
  }

  try {
    fs.copyFileSync(sourcePath, destination);
    context.result.imported.push(relativeName);
  } catch (error) {
    context.result.failed.push({ file: relativeName, message: errorMessage(error) });
  }
}

function errorMessage(error: unknown): string {
  return error instanceof Error ? error.message : String(error);
}
