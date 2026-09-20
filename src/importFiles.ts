import * as fs from "fs";
import * as path from "path";

export interface ImportResult {
  imported: string[];
  skipped: string[];
  failed: { file: string; message: string }[];
}

/** What to do about one filename collision. The "*All" variants apply to every remaining collision in the batch without asking again. */
export type CollisionDecision = "overwrite" | "skip" | "overwriteAll" | "skipAll";

/**
 * Copies each source file into targetFolder. When a source's name already
 * exists in targetFolder, resolveCollision is asked what to do; its answer
 * decides whether that file is overwritten or skipped.
 */
export async function importFiles(
  sourcePaths: string[],
  targetFolder: string,
  resolveCollision: (fileName: string) => Promise<CollisionDecision>
): Promise<ImportResult> {
  const result: ImportResult = { imported: [], skipped: [], failed: [] };
  let bulkDecision: "overwrite" | "skip" | undefined;

  for (const sourcePath of sourcePaths) {
    const fileName = path.basename(sourcePath);
    const destination = path.join(targetFolder, fileName);

    if (fs.existsSync(destination)) {
      const decision = bulkDecision ?? await resolveCollision(fileName);
      if (decision === "overwriteAll") {
        bulkDecision = "overwrite";
      } else if (decision === "skipAll") {
        bulkDecision = "skip";
      }

      const effective = bulkDecision ?? (decision === "overwrite" || decision === "skip" ? decision : "skip");
      if (effective === "skip") {
        result.skipped.push(fileName);
        continue;
      }
    }

    try {
      fs.copyFileSync(sourcePath, destination);
      result.imported.push(fileName);
    } catch (error) {
      const message = error instanceof Error ? error.message : String(error);
      result.failed.push({ file: fileName, message });
    }
  }

  return result;
}
