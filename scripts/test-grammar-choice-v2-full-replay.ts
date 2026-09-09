/**
 * Replay a captured Grammar Choice V2 snapshot without network.
 * Run: npx tsx scripts/test-grammar-choice-v2-full-replay.ts <snapshot-dir>
 */
import { replaySnapshot } from "../src/lib/lesson-materials/grammar-choice-v2/replay";

const snapshotDir = process.argv[2];
if (!snapshotDir) {
  console.error("usage: npx tsx scripts/test-grammar-choice-v2-full-replay.ts <snapshot-dir>");
  process.exit(2);
}

const result = replaySnapshot(snapshotDir);
const failed = result.passages.filter(
  (row) => !row.ok || row.assertionErrors.length > 0
);
console.log(
  JSON.stringify(
    {
      snapshotDir,
      openAI: result.networkCalls,
      passages: result.passages.map((row) => ({
        sourceId: row.sourceId,
        ok: row.ok,
        reason: row.reason ?? null,
        itemCount: row.itemCount,
        digestMatch: row.digestMatch,
        assertionErrors: row.assertionErrors,
      })),
    },
    null,
    2
  )
);
if (result.networkCalls !== 0 || failed.length > 0) process.exit(1);
