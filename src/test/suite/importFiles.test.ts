import * as assert from "assert";
import * as fs from "fs";
import * as os from "os";
import * as path from "path";
import { CollisionDecision, importFiles } from "../../importFiles";

function makeTempDir(): string {
  return fs.mkdtempSync(path.join(os.tmpdir(), "import-file-to-folder-test-"));
}

function writeFile(dir: string, name: string, content = ""): string {
  const filePath = path.join(dir, name);
  fs.writeFileSync(filePath, content);
  return filePath;
}

/** A resolver that fails the test if a collision was unexpectedly hit. */
async function unusedResolver(): Promise<CollisionDecision> {
  throw new Error("resolveCollision should not have been called");
}

suite("importFiles", () => {
  test("copies files that don't collide", async () => {
    const sourceDir = makeTempDir();
    const targetDir = makeTempDir();
    const a = writeFile(sourceDir, "a.txt", "a");
    const b = writeFile(sourceDir, "b.txt", "b");

    const result = await importFiles([a, b], targetDir, unusedResolver);

    assert.deepStrictEqual(result, { imported: ["a.txt", "b.txt"], skipped: [], failed: [] });
    assert.strictEqual(fs.readFileSync(path.join(targetDir, "a.txt"), "utf8"), "a");
    assert.strictEqual(fs.readFileSync(path.join(targetDir, "b.txt"), "utf8"), "b");
  });

  test("skips a colliding file when the resolver says skip", async () => {
    const sourceDir = makeTempDir();
    const targetDir = makeTempDir();
    const source = writeFile(sourceDir, "a.txt", "new content");
    writeFile(targetDir, "a.txt", "original content");

    const result = await importFiles([source], targetDir, async () => "skip");

    assert.deepStrictEqual(result, { imported: [], skipped: ["a.txt"], failed: [] });
    assert.strictEqual(fs.readFileSync(path.join(targetDir, "a.txt"), "utf8"), "original content");
  });

  test("overwrites a colliding file when the resolver says overwrite", async () => {
    const sourceDir = makeTempDir();
    const targetDir = makeTempDir();
    const source = writeFile(sourceDir, "a.txt", "new content");
    writeFile(targetDir, "a.txt", "original content");

    const result = await importFiles([source], targetDir, async () => "overwrite");

    assert.deepStrictEqual(result, { imported: ["a.txt"], skipped: [], failed: [] });
    assert.strictEqual(fs.readFileSync(path.join(targetDir, "a.txt"), "utf8"), "new content");
  });

  test("skipAll / overwriteAll apply to the rest of the batch without asking again", async () => {
    const sourceDir = makeTempDir();
    const targetDir = makeTempDir();
    const a = writeFile(sourceDir, "a.txt", "a-new");
    const b = writeFile(sourceDir, "b.txt", "b-new");
    writeFile(targetDir, "a.txt", "a-original");
    writeFile(targetDir, "b.txt", "b-original");

    let calls = 0;
    const result = await importFiles([a, b], targetDir, async () => {
      calls++;
      return "overwriteAll";
    });

    assert.strictEqual(calls, 1, "resolver should only be asked once for the whole batch");
    assert.deepStrictEqual(result, { imported: ["a.txt", "b.txt"], skipped: [], failed: [] });
    assert.strictEqual(fs.readFileSync(path.join(targetDir, "a.txt"), "utf8"), "a-new");
    assert.strictEqual(fs.readFileSync(path.join(targetDir, "b.txt"), "utf8"), "b-new");
  });

  test("reports a failed copy without stopping the rest of the batch", async () => {
    const sourceDir = makeTempDir();
    const targetDir = makeTempDir();
    const missing = path.join(sourceDir, "does-not-exist.txt");
    const ok = writeFile(sourceDir, "ok.txt", "ok");

    const result = await importFiles([missing, ok], targetDir, unusedResolver);

    assert.strictEqual(result.imported.length, 1);
    assert.strictEqual(result.imported[0], "ok.txt");
    assert.strictEqual(result.failed.length, 1);
    assert.strictEqual(result.failed[0].file, "does-not-exist.txt");
    assert.strictEqual(result.skipped.length, 0);
  });
});
