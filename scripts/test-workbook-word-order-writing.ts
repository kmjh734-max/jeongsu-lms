/**
 * Word-order chunk refine (v4-final) tests.
 * Run: npx tsx scripts/test-workbook-word-order-writing.ts
 */
import assert from "node:assert/strict";
import { WORD_ORDER_CHUNK_ALGORITHM_VERSION } from "../src/lib/lesson-materials/word-order-writing-constants";
import {
  buildFallbackWordOrderChunks,
  restoreEnglishFromChunks,
  validateWordOrderChunksDetailed,
} from "../src/lib/lesson-materials/word-order-chunking";
import { refineSemanticChunks } from "../src/lib/lesson-materials/word-order-chunk-refine";
import { formatWorkbookPassage } from "../src/lib/lesson-materials/workbook-types";

assert.equal(
  WORD_ORDER_CHUNK_ALGORITHM_VERSION,
  "word-order-semantic-chunks-v4-final"
);

function pipeline(id: string, en: string) {
  const raw = buildFallbackWordOrderChunks(id, en);
  assert.ok(raw, `raw null ${id}`);
  const refined = refineSemanticChunks(raw!, en);
  const v = validateWordOrderChunksDetailed(en, refined);
  assert.equal(
    v.ok,
    true,
    `${id}: ${v.reason} → ${refined.map((c) => c.text).join(" / ")}`
  );
  assert.equal(
    restoreEnglishFromChunks(refined),
    formatWorkbookPassage(en)
  );
  console.log(`\n[${id}]`, refined.map((c) => c.text).join(" / "));
  return refined;
}

function assertForbidden(chunks: { text: string }[], patterns: RegExp[]) {
  const bank = chunks.map((c) => c.text).join(" / ");
  for (const p of patterns) {
    assert.ok(!p.test(bank), `forbidden ${p} in ${bank}`);
  }
  assert.ok(!chunks.some((c) => /^how$/i.test(c.text.trim())));
  assert.ok(!chunks.some((c) => /^outside$/i.test(c.text.trim())));
}

// --- Primary regression: going outside / how to socialize ---
{
  const en =
    "They are not going outside to play, they are not learning how to socialize and read physical cues from others.";
  const chunks = pipeline("t4", en);
  assert.ok(chunks.some((c) => /going outside/i.test(c.text)));
  assert.ok(chunks.some((c) => /how to socialize/i.test(c.text)));
  assert.ok(chunks.some((c) => /physical cues/i.test(c.text)));
  assertForbidden(chunks, [
    /\bhow\s*\/\s*to socialize/i,
    /\bgoing\s*\/\s*outside\b/i,
    /play,\s*they are/i,
    /physical\s*\/\s*cues/i,
  ]);
  assert.ok(chunks.length >= 3);
}

// --- phones and tablets ---
{
  const en =
    "Many kids today are being held captive by ‘smart’ devices like phones and tablets.";
  const chunks = pipeline("t3", en);
  assert.ok(chunks.some((c) => /are being held captive/i.test(c.text)));
  assert.ok(
    chunks.some((c) => /like phones and tablets/i.test(c.text)) ||
      chunks.some((c) => /phones and tablets/i.test(c.text))
  );
  assertForbidden(chunks, [/phones\s*\/\s*and tablets/i, /^are being$/i]);
}

// --- Generalized WH-infinitive / coordination / inside ---
{
  const a = pipeline(
    "g-how",
    "Students need to learn how to evaluate information."
  );
  assert.ok(a.some((c) => /how to evaluate/i.test(c.text)));
  assert.ok(!a.some((c) => /^how$/i.test(c.text.trim())));
}
{
  const b = pipeline(
    "g-whether",
    "We must decide whether to accept or reject the proposal."
  );
  assert.ok(b.some((c) => /whether to accept/i.test(c.text)));
}
{
  const c = pipeline(
    "g-coord",
    "The program supports teachers and students."
  );
  assert.ok(c.some((c) => /teachers and students/i.test(c.text)));
}
{
  const d = pipeline(
    "g-wh2",
    "People should know when to stop and how to respond."
  );
  assert.ok(d.some((c) => /when to stop/i.test(c.text)));
  assert.ok(d.some((c) => /how to respond/i.test(c.text)));
}
{
  const e = pipeline(
    "g-inside",
    "She stayed inside because it was raining."
  );
  assert.ok(e.some((c) => /stayed inside/i.test(c.text)));
  assert.ok(!e.some((c) => /^inside$/i.test(c.text.trim())));
}

// --- Preserve good chunks ---
{
  const s1 = pipeline(
    "occ",
    "We occupy the same square footage of a chair for hours and hours every day."
  );
  assert.ok(s1.some((c) => /the same square footage/i.test(c.text)));
  assert.ok(s1.some((c) => /for hours and hours/i.test(c.text)));
}
{
  const s2 = pipeline(
    "made",
    "We are wonderfully made, yet we don’t allow ourselves to participate in the wonder for which we were created."
  );
  assert.ok(s2.some((c) => /wonderfully made/i.test(c.text)));
  assert.ok(s2.some((c) => /^for which$/i.test(c.text.trim()) || /for which/i.test(c.text)));
  assert.ok(!s2.some((c) => /made,\s*yet we/i.test(c.text)));
}
{
  const s3 = pipeline(
    "loa",
    "Perhaps you have heard of the Law of Attraction, which states that ‘like attracts like’ and that by focusing on positive or negative thoughts, one can bring about positive or negative results."
  );
  assert.ok(s3.some((c) => /Law of Attraction/i.test(c.text)));
  assert.ok(s3.some((c) => /bring about/i.test(c.text)));
}

console.log("\nALL v4-final refine tests passed");
