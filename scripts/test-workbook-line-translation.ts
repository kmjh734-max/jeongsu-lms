/**
 * One-line Korean translation workbook tests (no OpenAI).
 * Run: npx tsx scripts/test-workbook-line-translation.ts
 */
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { LINE_TRANSLATION_ALGORITHM_VERSION } from "../src/lib/lesson-materials/line-translation-constants";
import {
  buildLineTranslationItems,
  generateWorkbookLineTranslation,
  getTranslationAnswerLineCount,
  matchStoredKorean,
  normalizeEnglishSource,
  validatePassageLineTranslations,
} from "../src/lib/lesson-materials/generate-workbook-line-translation";
import { computeSentenceSourceHash } from "../src/lib/lesson-materials/translation-meta";
import type { StoredSentenceTranslation } from "../src/lib/lesson-materials/translation-meta";
import { formatWorkbookPassage } from "../src/lib/lesson-materials/workbook-types";

assert.equal(LINE_TRANSLATION_ALGORITHM_VERSION, "line-translation-v1");

function stored(
  id: string,
  order: number,
  english: string,
  korean: string,
  hash?: string
): StoredSentenceTranslation {
  const en = formatWorkbookPassage(english);
  return {
    sentenceId: id,
    order,
    english: en,
    koreanTranslation: korean,
    sourceHash: hash ?? computeSentenceSourceHash(en),
    translationSource: "teacher",
    updatedAt: new Date().toISOString(),
  };
}

function mkPassage(n: number) {
  const sentences = Array.from({ length: n }, (_, i) => ({
    id: `s${i + 1}`,
    english: `This is unique sentence number ${i + 1} with enough words here.`,
    korean: `이것은 ${i + 1}번 문장 해석입니다.`,
  }));
  const sentenceTranslations = sentences.map((s, i) =>
    stored(s.id, i + 1, s.english, s.korean)
  );
  return { sentences, sentenceTranslations };
}

// normalize
{
  assert.equal(normalizeEnglishSource("  a\n\nb  "), "a b");
}

// answer line counts
{
  assert.equal(getTranslationAnswerLineCount("Movement is life to us."), 1);
  const mid =
    "Perhaps you have heard of the Law of Attraction which states that like attracts like and more.";
  assert.ok(getTranslationAnswerLineCount(mid) >= 2);
  const long = Array.from({ length: 45 }, (_, i) => `word${i}`).join(" ");
  assert.equal(getTranslationAnswerLineCount(long), 4);
}

// normal 6-sentence passage
{
  const { sentences, sentenceTranslations } = mkPassage(6);
  const t0 = Date.now();
  const result = generateWorkbookLineTranslation({
    passages: [
      {
        projectId: "p6",
        title: "Six",
        source: "2026년 고2 6월 22번",
        sentences,
        sentenceTranslations,
      },
    ],
  });
  const elapsed = Date.now() - t0;
  assert.equal(result.openAiRequestCount, 0);
  assert.equal(result.blocking.length, 0);
  assert.equal(result.sections.length, 1);
  const sec = result.sections[0]!;
  assert.equal(sec.items.length, 6);
  assert.equal(sec.algorithmVersion, "line-translation-v1");
  for (let i = 0; i < 6; i++) {
    assert.equal(sec.items[i]!.orderIndex, i + 1);
    assert.equal(sec.items[i]!.english, formatWorkbookPassage(sentences[i]!.english));
    assert.equal(sec.items[i]!.korean, sentences[i]!.korean);
    assert.ok(sec.items[i]!.answerLineCount >= 1);
  }
  assert.ok(elapsed < 500, `too slow: ${elapsed}ms`);
  console.log("6-sentence ok, ms=", elapsed);
}

// 11 sentences — one section, numbers 1..11
{
  const { sentences, sentenceTranslations } = mkPassage(11);
  const result = generateWorkbookLineTranslation({
    passages: [
      {
        projectId: "p11",
        title: "Eleven",
        source: null,
        sentences,
        sentenceTranslations,
      },
    ],
  });
  assert.equal(result.sections.length, 1);
  assert.equal(result.sections[0]!.items.length, 11);
  assert.deepEqual(
    result.sections[0]!.items.map((x) => x.orderIndex),
    [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11]
  );
}

// missing translation blocks
{
  const sentences = [
    { id: "a", english: "One sentence is enough here now.", korean: "하나" },
    { id: "b", english: "Two sentence is also here right now.", korean: "" },
    { id: "c", english: "Three sentence completes this short set.", korean: "셋" },
  ];
  const sentenceTranslations = [
    stored("a", 1, sentences[0]!.english, "하나"),
    stored("c", 3, sentences[2]!.english, "셋"),
  ];
  const validation = validatePassageLineTranslations({
    passageId: "pm",
    title: "Missing",
    sentences,
    storedTranslations: sentenceTranslations,
  });
  assert.equal(validation.isValid, false);
  assert.ok(validation.missingSentenceIds.includes("b"));

  const result = generateWorkbookLineTranslation({
    passages: [
      {
        projectId: "pm",
        title: "긍정적 사고의 한계와 믿음의 힘",
        source: null,
        sentences,
        sentenceTranslations,
      },
    ],
  });
  assert.equal(result.openAiRequestCount, 0);
  assert.equal(result.sections.length, 0);
  assert.equal(result.blocking.length, 1);
  assert.ok(result.blocking[0]!.reason.includes("2번 문장"));
  console.log("missing message:", result.blocking[0]!.reason);
}

// stale hash
{
  const en = "Original english sentence stays exactly here.";
  const sentences = [
    { id: "s1", english: en, korean: "해석" },
    { id: "s2", english: "Second english sentence stays exactly here.", korean: "둘" },
    { id: "s3", english: "Third english sentence stays exactly here.", korean: "셋" },
  ];
  const badHash = createHash("sha256").update("old").digest("hex").slice(0, 24);
  const sentenceTranslations = [
    stored("s1", 1, "Changed english that no longer matches.", "해석", badHash),
    stored("s2", 2, sentences[1]!.english, "둘"),
    stored("s3", 3, sentences[2]!.english, "셋"),
  ];
  // Force stale: different english in stored vs current, wrong hash
  sentenceTranslations[0]!.english = "Changed english that no longer matches.";
  sentenceTranslations[0]!.sourceHash = badHash;

  const matched = matchStoredKorean({
    sentenceId: "s1",
    orderIndex: 1,
    english: en,
    stored: sentenceTranslations[0],
  });
  assert.equal(matched.ok, false);
  if (!matched.ok) assert.equal(matched.kind, "stale");

  const result = generateWorkbookLineTranslation({
    passages: [
      {
        projectId: "pstale",
        title: "Stale",
        source: null,
        sentences,
        sentenceTranslations,
      },
    ],
  });
  assert.equal(result.openAiRequestCount, 0);
  assert.equal(result.blocking.length, 1);
  assert.ok(result.blocking[0]!.issues.some((i) => i.kind === "stale"));
}

// exclude missing and continue with other passage
{
  const good = mkPassage(4);
  const bad = {
    sentences: [
      { id: "x1", english: "Only one good english sentence is present.", korean: "하나" },
      {
        id: "x2",
        english: "Second english sentence has no stored korean yet.",
        korean: "",
      },
      {
        id: "x3",
        english: "Third english sentence also needs a korean line.",
        korean: "셋",
      },
    ],
    sentenceTranslations: [
      stored(
        "x1",
        1,
        "Only one good english sentence is present.",
        "하나"
      ),
      stored(
        "x3",
        3,
        "Third english sentence also needs a korean line.",
        "셋"
      ),
    ],
  };
  const result = generateWorkbookLineTranslation({
    passages: [
      {
        projectId: "bad",
        title: "Bad",
        source: null,
        ...bad,
      },
      {
        projectId: "good",
        title: "Good",
        source: null,
        ...good,
      },
    ],
    excludeProjectIds: ["bad"],
  });
  assert.equal(result.blocking.length, 0);
  assert.equal(result.sections.length, 1);
  assert.equal(result.sections[0]!.projectId, "good");
  assert.equal(result.skipped.length, 1);
}

// duplicate english distinct ids
{
  const sentences = [
    { id: "a", english: "Movement is life to us.", korean: "하나" },
    { id: "b", english: "Movement is life to us.", korean: "둘" },
    { id: "c", english: "Stillness is death to us.", korean: "셋" },
  ];
  const sentenceTranslations = sentences.map((s, i) =>
    stored(s.id, i + 1, s.english, s.korean)
  );
  const items = buildLineTranslationItems(sentences, sentenceTranslations);
  assert.ok(items);
  assert.equal(items!.length, 3);
  assert.equal(items![0]!.korean, "하나");
  assert.equal(items![1]!.korean, "둘");
}

// same items for problem + answer (identity)
{
  const { sentences, sentenceTranslations } = mkPassage(3);
  const items = buildLineTranslationItems(sentences, sentenceTranslations)!;
  const result = generateWorkbookLineTranslation({
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
  assert.deepEqual(
    result.sections[0]!.items.map((x) => x.sentenceId),
    items.map((x) => x.sentenceId)
  );
  assert.deepEqual(
    result.sections[0]!.items.map((x) => x.korean),
    items.map((x) => x.korean)
  );
}

console.log("\nAll line-translation tests passed.");
