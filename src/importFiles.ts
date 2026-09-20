import * as fs from "fs";
import * as path from "path";

export interface ImportResult {
  imported: string[];
  skipped: string[];
  failed: { file: string; message: string }[];
}

/**
 * Copies each source file into targetFolder. A source whose name already
 * exists in targetFolder is skipped rather than overwritten.
 */
export function importFiles(sourcePaths: string[], targetFolder: string): ImportResult {
  const result: ImportResult = { imported: [], skipped: [], failed: [] };

  for (const sourcePath of sourcePaths) {
    const fileName = path.basename(sourcePath);
    const destination = path.join(targetFolder, fileName);

    if (fs.existsSync(destination)) {
      result.skipped.push(fileName);
      continue;
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
