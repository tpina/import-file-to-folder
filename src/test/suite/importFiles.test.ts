import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { importFiles } from "../../importFiles";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "import-file-to-folder-test-"));
}

function writeFile(dir: string, name: string, content = ""): string {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

suite("importFiles", () => {
  test("copies files that don't collide", () => {
    const sourceDir = makeTempDir();
    const targetDir = makeTempDir();
    const a = writeFile(sourceDir, "a.txt", "a");
    const b = writeFile(sourceDir, "b.txt", "b");

    const result = importFiles([a, b], targetDir);

    assert.deepStrictEqual(result, { imported: ["a.txt", "b.txt"], skipped: [], failed: [] });
    assert.strictEqual(fs.readFileSync(path.join(targetDir, "a.txt"), "utf8"), "a");
    assert.strictEqual(fs.readFileSync(path.join(targetDir, "b.txt"), "utf8"), "b");
  });

  test("skips a file that already exists in the target folder instead of overwriting it", () => {
    const sourceDir = makeTempDir();
    const targetDir = makeTempDir();
    const source = writeFile(sourceDir, "a.txt", "new content");
    writeFile(targetDir, "a.txt", "original content");

    const result = importFiles([source], targetDir);

    assert.deepStrictEqual(result, { imported: [], skipped: ["a.txt"], failed: [] });
    assert.strictEqual(fs.readFileSync(path.join(targetDir, "a.txt"), "utf8"), "original content");
  });

  test("reports a failed copy without stopping the rest of the batch", () => {
    const sourceDir = makeTempDir();
    const targetDir = makeTempDir();
    const missing = path.join(sourceDir, "does-not-exist.txt");
    const ok = writeFile(sourceDir, "ok.txt", "ok");

    const result = importFiles([missing, ok], targetDir);

    assert.strictEqual(result.imported.length, 1);
    assert.strictEqual(result.imported[0], "ok.txt");
    assert.strictEqual(result.failed.length, 1);
    assert.strictEqual(result.failed[0].file, "does-not-exist.txt");
    assert.strictEqual(result.skipped.length, 0);
  });
});
