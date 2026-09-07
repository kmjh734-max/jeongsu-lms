/**
 * Word-order semantic chunk quality tests (v3).
 * Run: npx tsx scripts/test-workbook-word-order-writing.ts
 */
import assert from "node:assert/strict";
import { WORD_ORDER_CHUNK_ALGORITHM_VERSION } from "../src/lib/lesson-materials/word-order-writing-constants";
import {
  buildFallbackWordOrderChunks,
  restoreEnglishFromChunks,
  validateWordOrderChunksDetailed,
} from "../src/lib/lesson-materials/word-order-chunking";

assert.equal(
  WORD_ORDER_CHUNK_ALGORITHM_VERSION,
  "word-order-semantic-chunks-v3"
);

function assertNoBadPatterns(chunks: { text: string }[], label: string) {
  const joined = chunks.map((c) => c.text);
  const bank = joined.join(" / ");
  assert.ok(
    !joined.some((t) => /\bthe$/i.test(t.trim()) || /\ba$/i.test(t.trim())),
    `${label}: ends with article — ${bank}`
  );
  assert.ok(
    !joined.some((t) => /^are being$/i.test(t.trim())),
    `${label}: bare are being — ${bank}`
  );
  assert.ok(
    !joined.some((t) => /,\s+(yet|but|and|they|we)\b/i.test(t)),
    `${label}: crosses clause boundary — ${bank}`
  );
  assert.ok(
    !/wonderfully\s*\/\s*made/i.test(bank),
    `${label}: wonderfully/made split — ${bank}`
  );
  assert.ok(
    !/occupy the\s*\//i.test(bank),
    `${label}: occupy the/ — ${bank}`
  );
  assert.ok(
    !/physical\s*\/\s*cues/i.test(bank),
    `${label}: physical/cues — ${bank}`
  );
  assert.ok(
    !/play,\s*they are/i.test(bank),
    `${label}: play, they are — ${bank}`
  );
}

function runFallback(id: string, en: string) {
  const chunks = buildFallbackWordOrderChunks(id, en);
  assert.ok(chunks, `fallback null for ${id}`);
  const v = validateWordOrderChunksDetailed(en, chunks!);
  assert.equal(v.ok, true, `${id}: ${v.reason} → ${chunks!.map((c) => c.text).join(" / ")}`);
  assert.equal(
    restoreEnglishFromChunks(chunks!),
    en.replace(/\s+/g, " ").trim().replace(/\s+/g, " ") || chunks // use normalize via restore compare already in validate
  );
  // restore already checked in validate via formatWorkbookPassage path
  assertNoBadPatterns(chunks!, id);
  console.log(`\n[${id}] (${chunks!.length})`, chunks!.map((c) => c.text).join(" / "));
  return chunks!;
}

// --- Regression 1 ---
{
  const en =
    "We are wonderfully made, yet we don’t allow ourselves to participate in the wonder for which we were created.";
  const chunks = runFallback("t1", en);
  assert.ok(chunks.some((c) => /wonderfully made/i.test(c.text)));
  assert.ok(chunks.some((c) => /yet we/i.test(c.text)));
  assert.ok(!chunks.some((c) => /made,\s*yet we/i.test(c.text)));
}

// --- Regression 2 ---
{
  const en =
    "We occupy the same square footage of a chair for hours and hours every day.";
  const chunks = runFallback("t2", en);
  assert.ok(chunks.some((c) => /the same square footage/i.test(c.text)));
  assert.ok(!chunks.some((c) => /^We occupy the$/i.test(c.text.trim())));
}

// --- Regression 3 ---
{
  const en =
    "Many kids today are being held captive by ‘smart’ devices like phones and tablets.";
  const chunks = runFallback("t3", en);
  assert.ok(
    chunks.some((c) => /are being held captive/i.test(c.text)) ||
      chunks.some((c) => /held captive/i.test(c.text))
  );
  assert.ok(!chunks.some((c) => /^are being$/i.test(c.text.trim())));
}

// --- Regression 4 ---
{
  const en =
    "They are not going outside to play, they are not learning how to socialize and read physical cues from others.";
  const chunks = runFallback("t4", en);
  assert.ok(chunks.some((c) => /physical cues/i.test(c.text)));
  assert.ok(!chunks.some((c) => /play,\s*they are/i.test(c.text)));
}

// --- Unseen generalizations (must not be hardcoded) ---
{
  runFallback(
    "g1",
    "Companies can have a stable revenue and build customer loyalty by using the subscription model."
  );
  runFallback(
    "g2",
    "To reduce confirmation bias, we should actively seek information that contradicts our beliefs."
  );
  runFallback(
    "g3",
    "The patients coughed onto a petri dish, which was then put into an incubator."
  );
}

// Law of Attraction still ok
{
  const en =
    "Perhaps you have heard of the Law of Attraction, which states that ‘like attracts like’ and that by focusing on positive or negative thoughts, one can bring about positive or negative results.";
  runFallback("loa", en);
}

console.log("\nALL word-order chunk quality tests passed");
