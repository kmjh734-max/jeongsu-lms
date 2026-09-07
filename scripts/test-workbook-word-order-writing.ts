/**
 * Word-order semantic chunk tests.
 * Run: npx tsx scripts/test-workbook-word-order-writing.ts
 */
import assert from "node:assert/strict";
import { WORD_ORDER_CHUNK_ALGORITHM_VERSION } from "../src/lib/lesson-materials/word-order-writing-constants";
import {
  createWordOrderQuestion,
  generateWorkbookWordOrderWriting,
  getWordOrderWritingLineCount,
  mapLineTranslationToWordOrderWriting,
  problemSheetLeaksOriginalEnglish,
} from "../src/lib/lesson-materials/generate-workbook-word-order-writing";
import { generateWorkbookLineTranslation } from "../src/lib/lesson-materials/generate-workbook-line-translation";
import {
  buildFallbackWordOrderChunks,
  restoreEnglishFromChunks,
  validateWordOrderChunks,
  wordCountInChunk,
} from "../src/lib/lesson-materials/word-order-chunking";
import { tokenizeForWordOrder } from "../src/lib/lesson-materials/word-order-tokenize";
import {
  buildWordOrderSeed,
  shuffleWordOrderChunks,
} from "../src/lib/lesson-materials/word-order-shuffle";
import { computeSentenceSourceHash } from "../src/lib/lesson-materials/translation-meta";
import type { StoredSentenceTranslation } from "../src/lib/lesson-materials/translation-meta";
import { formatWorkbookPassage } from "../src/lib/lesson-materials/workbook-types";

assert.equal(
  WORD_ORDER_CHUNK_ALGORITHM_VERSION,
  "word-order-semantic-chunks-v2"
);

function stored(
  id: string,
  order: number,
  english: string,
  korean: string
): StoredSentenceTranslation {
  const en = formatWorkbookPassage(english);
  return {
    sentenceId: id,
    order,
    english: en,
    koreanTranslation: korean,
    sourceHash: computeSentenceSourceHash(en),
    translationSource: "teacher",
    updatedAt: new Date().toISOString(),
  };
}

const S1 =
  "Perhaps you have heard of the Law of Attraction, which states that ‘like attracts like’ and that by focusing on positive or negative thoughts, one can bring about positive or negative results.";
const S2 =
  "The common flaw in our understanding of this law is that we believe all we have to do is think about or visualize something to manifest it.";

// line counts
{
  assert.equal(getWordOrderWritingLineCount("Movement is life to us."), 2);
  const mid = Array.from({ length: 25 }, (_, i) => `word${i}`).join(" ");
  assert.equal(getWordOrderWritingLineCount(mid), 3);
  const long = Array.from({ length: 45 }, (_, i) => `word${i}`).join(" ");
  assert.equal(getWordOrderWritingLineCount(long), 4);
}

// --- sentence 1: semantic chunks, not word soup ---
{
  const tokens = tokenizeForWordOrder(S1);
  assert.ok(tokens.length >= 30, `token count ${tokens.length}`);
  const chunks = buildFallbackWordOrderChunks("s1", S1);
  const v = validateWordOrderChunks(S1, chunks);
  assert.equal(v.ok, true, v.ok === false ? v.reason : "");
  assert.ok(
    chunks.length >= 8 && chunks.length <= 12,
    `chunk count ${chunks.length}: ${chunks.map((c) => c.text).join(" | ")}`
  );
  assert.ok(chunks.length < tokens.length * 0.5, "still too word-like");
  assert.ok(
    chunks.some((c) => /Law of Attraction/i.test(c.text)),
    "Law of Attraction should stay together"
  );
  assert.ok(
    chunks.some((c) => /bring about/i.test(c.text)),
    "bring about intact"
  );
  assert.equal(
    restoreEnglishFromChunks(chunks),
    formatWorkbookPassage(S1)
  );
  console.log(
    "S1 chunks (" + chunks.length + "):",
    chunks.map((c) => c.text)
  );
}

// --- sentence 2 ---
{
  const tokens = tokenizeForWordOrder(S2);
  const chunks = buildFallbackWordOrderChunks("s2", S2);
  const v = validateWordOrderChunks(S2, chunks);
  assert.equal(v.ok, true, v.ok === false ? v.reason : "");
  assert.ok(chunks.length >= 8 && chunks.length <= 12, String(chunks.length));
  assert.ok(chunks.some((c) => /think about/i.test(c.text)));
  assert.ok(chunks.some((c) => /to manifest it/i.test(c.text)));
  assert.ok(chunks.some((c) => /^is$/i.test(c.text.trim()) || c.text === "is"));
  assert.equal(restoreEnglishFromChunks(chunks), formatWorkbookPassage(S2));
  console.log(
    "S2 chunks (" + chunks.length + "):",
    chunks.map((c) => c.text)
  );
}

// --- phrasal verbs / contractions ---
{
  const en = "We don't allow ourselves to participate.";
  const chunks = buildFallbackWordOrderChunks("s", en);
  assert.equal(validateWordOrderChunks(en, chunks).ok, true);
  assert.ok(chunks.some((c) => c.text.includes("don't")));
  assert.ok(!chunks.some((c) => c.text === "don" || c.text === "'t"));
}

{
  const en = "A person's long-term memory can change.";
  const chunks = buildFallbackWordOrderChunks("s", en);
  assert.equal(validateWordOrderChunks(en, chunks).ok, true);
  const blob = chunks.map((c) => c.text).join(" ");
  assert.ok(blob.includes("person's"));
  assert.ok(blob.includes("long-term"));
}

// --- not all singles ---
{
  const en = "Movement is life to us.";
  const chunks = buildFallbackWordOrderChunks("s", en);
  assert.ok(chunks.length >= 2);
  assert.ok(chunks.some((c) => wordCountInChunk(c.text) >= 2));
}

// --- deterministic chunk shuffle ---
{
  const chunks = buildFallbackWordOrderChunks("s1", S1);
  const seedA = buildWordOrderSeed({
    workbookId: "wb1",
    passageId: "p",
    sentenceId: "s1",
    sourceHash: "h",
  });
  const seedB = buildWordOrderSeed({
    workbookId: "wb2",
    passageId: "p",
    sentenceId: "s1",
    sourceHash: "h",
  });
  const a1 = shuffleWordOrderChunks(chunks, seedA)
    .map((c) => c.chunkId)
    .join("|");
  const a2 = shuffleWordOrderChunks(chunks, seedA)
    .map((c) => c.chunkId)
    .join("|");
  const b1 = shuffleWordOrderChunks(chunks, seedB)
    .map((c) => c.chunkId)
    .join("|");
  assert.equal(a1, a2);
  assert.notEqual(a1, b1);
}

// --- question + no leak ---
{
  const chunks = buildFallbackWordOrderChunks("s1", S1);
  const q = createWordOrderQuestion({
    workbookId: "wb",
    passageId: "p",
    sentenceId: "s1",
    orderIndex: 1,
    english: S1,
    korean: "해석",
    sourceHash: "h",
    chunks,
    chunkSource: "fallback",
  });
  assert.ok(q);
  assert.equal(q!.answerLineCount, 3); // ~35 words → 3 lines
  assert.ok(q!.shuffledChunks.length >= 8);
  const section = {
    projectId: "p",
    title: "T",
    source: null,
    algorithmVersion: WORD_ORDER_CHUNK_ALGORITHM_VERSION,
    items: [q!],
  };
  assert.equal(problemSheetLeaksOriginalEnglish(section), false);
  console.log(
    "problem bank:",
    q!.shuffledChunks.map((c) => c.text).join(" / ")
  );
}

async function main() {
  // --- async generate without forcing OpenAI ---
  {
    const sentences = [
      {
        id: "s1",
        english: S1,
        korean: "끌어당김의 법칙에 대해 들어본 적이 있을 것입니다.",
      },
      {
        id: "s2",
        english: S2,
        korean: "이 법칙에 대한 이해의 공통적인 결함입니다.",
      },
    ];
    const sentenceTranslations = sentences.map((s, i) =>
      stored(s.id, i + 1, s.english, s.korean)
    );
    const t0 = Date.now();
    const result = await generateWorkbookWordOrderWriting({
      workbookId: "wb|test",
      passages: [
        {
          projectId: "p1",
          title: "긍정적 사고",
          source: "2026년 고2 6월 22번",
          sentences,
          sentenceTranslations,
          wordOrderChunkCache: null,
        },
      ],
    });
    const ms = Date.now() - t0;
    assert.equal(result.blocking.length, 0);
    assert.equal(result.sections.length, 1);
    assert.equal(result.sections[0]!.items.length, 2);
    assert.ok(result.sections[0]!.items[0]!.originalChunks.length < 20);
    assert.ok(result.sections[0]!.items[0]!.originalChunks.length >= 8);
    assert.ok(result.openAiRequestCount <= 1);
    assert.ok(ms < 90_000, String(ms));
    console.log(
      "generate ok ms=",
      ms,
      "openAi=",
      result.openAiRequestCount,
      "sources=",
      result.sections[0]!.items.map((i) => i.chunkSource)
    );
  }

  // shared bilingual map
  {
    const sentences = [
      {
        id: "s1",
        english: "Movement is life to us.",
        korean: "움직임은 생명입니다.",
      },
    ];
    const sentenceTranslations = sentences.map((s, i) =>
      stored(s.id, i + 1, s.english, s.korean)
    );
    const lt = generateWorkbookLineTranslation({
      passages: [
        {
          projectId: "p",
          title: "T",
          source: null,
          sentences,
          sentenceTranslations,
        },
      ],
    });
    const wo = mapLineTranslationToWordOrderWriting(lt.sections, "wb|x");
    assert.equal(wo[0]!.items[0]!.originalChunks.length >= 2, true);
  }

  console.log("ALL word-order semantic chunk tests passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
