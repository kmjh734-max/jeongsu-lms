/**
 * Full-sentence English writing workbook tests (reuses bilingual matching, no OpenAI).
 * Run: npx tsx scripts/test-workbook-full-en-writing.ts
 */
import assert from "node:assert/strict";
import { FULL_SENTENCE_WRITING_ALGORITHM_VERSION } from "../src/lib/lesson-materials/full-en-writing-constants";
import {
  generateWorkbookFullEnWriting,
  getFullSentenceWritingLineCount,
  mapLineTranslationToFullEnWriting,
  problemSheetLeaksEnglishAnswer,
} from "../src/lib/lesson-materials/generate-workbook-full-en-writing";
import {
  buildBilingualSentenceItems,
  generateWorkbookLineTranslation,
} from "../src/lib/lesson-materials/generate-workbook-line-translation";
import { computeSentenceSourceHash } from "../src/lib/lesson-materials/translation-meta";
import type { StoredSentenceTranslation } from "../src/lib/lesson-materials/translation-meta";
import { formatWorkbookPassage } from "../src/lib/lesson-materials/workbook-types";

assert.equal(
  FULL_SENTENCE_WRITING_ALGORITHM_VERSION,
  "full-sentence-writing-v1"
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

function mkPassage(n: number) {
  const sentences = Array.from({ length: n }, (_, i) => ({
    id: `s${i + 1}`,
    english: `This is unique sentence number ${i + 1} with enough words here.`,
    korean: `이것은 ${i + 1}번 문장에 대한 한글 해석입니다.`,
  }));
  const sentenceTranslations = sentences.map((s, i) =>
    stored(s.id, i + 1, s.english, s.korean)
  );
  return { sentences, sentenceTranslations };
}

// line counts
{
  assert.equal(getFullSentenceWritingLineCount("Movement is life to us."), 2);
  const mid = Array.from({ length: 20 }, (_, i) => `word${i}`).join(" ");
  assert.equal(getFullSentenceWritingLineCount(mid), 3);
  const long = Array.from({ length: 45 }, (_, i) => `word${i}`).join(" ");
  assert.equal(getFullSentenceWritingLineCount(long), 5);
}

// normal 6
{
  const { sentences, sentenceTranslations } = mkPassage(6);
  const t0 = Date.now();
  const result = generateWorkbookFullEnWriting({
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
  const ms = Date.now() - t0;
  assert.equal(result.openAiRequestCount, 0);
  assert.equal(result.blocking.length, 0);
  assert.equal(result.sections.length, 1);
  const sec = result.sections[0]!;
  assert.equal(sec.items.length, 6);
  assert.equal(sec.algorithmVersion, "full-sentence-writing-v1");
  for (let i = 0; i < 6; i++) {
    assert.equal(sec.items[i]!.orderIndex, i + 1);
    assert.equal(sec.items[i]!.korean, sentences[i]!.korean);
    assert.equal(
      sec.items[i]!.english,
      formatWorkbookPassage(sentences[i]!.english)
    );
    assert.ok(sec.items[i]!.answerLineCount >= 2);
  }
  assert.equal(problemSheetLeaksEnglishAnswer(sec), false);
  assert.ok(ms < 500, String(ms));
  console.log("6-sentence ok, ms=", ms);
}

// bilingual shared with one-line KO
{
  const { sentences, sentenceTranslations } = mkPassage(4);
  const bilingual = buildBilingualSentenceItems(
    "p",
    sentences,
    sentenceTranslations
  )!;
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
  const fe = mapLineTranslationToFullEnWriting(lt.sections);
  assert.deepEqual(
    bilingual.map((b) => b.sentenceId),
    fe[0]!.items.map((i) => i.sentenceId)
  );
  assert.deepEqual(
    bilingual.map((b) => b.korean),
    fe[0]!.items.map((i) => i.korean)
  );
  assert.deepEqual(
    bilingual.map((b) => b.english),
    fe[0]!.items.map((i) => i.english)
  );
  // answer lines differ from one-line KO
  assert.ok(
    fe[0]!.items[0]!.answerLineCount > lt.sections[0]!.items[0]!.answerLineCount
  );
}

// 11 sentences one section
{
  const { sentences, sentenceTranslations } = mkPassage(11);
  const result = generateWorkbookFullEnWriting({
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

// missing translation — no OpenAI
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
  const result = generateWorkbookFullEnWriting({
    passages: [
      {
        projectId: "pm",
        title: "Missing",
        source: null,
        sentences,
        sentenceTranslations,
      },
    ],
  });
  assert.equal(result.openAiRequestCount, 0);
  assert.equal(result.sections.length, 0);
  assert.equal(result.blocking.length, 1);
  assert.ok(result.blocking[0]!.reason.includes("2번"));
}

// problem sheet must not include english answers in korean field path
{
  const { sentences, sentenceTranslations } = mkPassage(3);
  const result = generateWorkbookFullEnWriting({
    passages: [
      {
        projectId: "p",
        title: "Law of Attraction Passage",
        source: "Source A",
        sentences,
        sentenceTranslations,
      },
    ],
  });
  const sec = result.sections[0]!;
  const problemText = [
    sec.title,
    sec.source ?? "",
    ...sec.items.map((it) => `${it.orderIndex}. ${it.korean}`),
  ].join("\n");
  for (const it of sec.items) {
    assert.ok(
      !problemText.includes(it.englishDisplay),
      `english leaked: ${it.englishDisplay}`
    );
  }
  // answer key does include english
  const answerText = sec.items
    .map((it) => `${it.korean}\n${it.englishDisplay}`)
    .join("\n");
  for (const it of sec.items) {
    assert.ok(answerText.includes(it.englishDisplay));
  }
}

// prebuilt path (shared bilingual call)
{
  const { sentences, sentenceTranslations } = mkPassage(3);
  const lt = generateWorkbookLineTranslation({
    passages: [
      {
        projectId: "shared",
        title: "Shared",
        source: null,
        sentences,
        sentenceTranslations,
      },
    ],
  });
  const fe = generateWorkbookFullEnWriting({
    passages: [],
    prebuiltLineSections: lt.sections,
    prebuiltSkipped: lt.skipped,
    prebuiltBlocking: lt.blocking,
  });
  assert.equal(fe.openAiRequestCount, 0);
  assert.equal(fe.sections[0]!.items.length, 3);
}

console.log("\nAll full-en-writing tests passed.");
