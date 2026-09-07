/**
 * Word-order writing workbook tests (reuses bilingual matching, no OpenAI).
 * Run: npx tsx scripts/test-workbook-word-order-writing.ts
 */
import assert from "node:assert/strict";
import { WORD_ORDER_WRITING_ALGORITHM_VERSION } from "../src/lib/lesson-materials/word-order-writing-constants";
import {
  createWordOrderQuestion,
  generateWorkbookWordOrderWriting,
  getWordOrderWritingLineCount,
  mapLineTranslationToWordOrderWriting,
  problemSheetLeaksOriginalEnglish,
} from "../src/lib/lesson-materials/generate-workbook-word-order-writing";
import { generateWorkbookLineTranslation } from "../src/lib/lesson-materials/generate-workbook-line-translation";
import {
  isRestorableToOriginal,
  tokenizeForWordOrder,
  validateWordOrderTokens,
} from "../src/lib/lesson-materials/word-order-tokenize";
import {
  buildWordOrderSeed,
  shuffleWordOrderTokens,
} from "../src/lib/lesson-materials/word-order-shuffle";
import { computeSentenceSourceHash } from "../src/lib/lesson-materials/translation-meta";
import type { StoredSentenceTranslation } from "../src/lib/lesson-materials/translation-meta";
import { formatWorkbookPassage } from "../src/lib/lesson-materials/workbook-types";

assert.equal(WORD_ORDER_WRITING_ALGORITHM_VERSION, "word-order-writing-v1");

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

function mkPassage(
  sentences: Array<{ id: string; english: string; korean: string }>
) {
  const sentenceTranslations = sentences.map((s, i) =>
    stored(s.id, i + 1, s.english, s.korean)
  );
  return { sentences, sentenceTranslations };
}

// --- short sentence ---
{
  const en = "Movement is life to us.";
  const tokens = tokenizeForWordOrder(en);
  assert.equal(tokens.length, 5);
  assert.ok(isRestorableToOriginal(en, tokens));
  assert.equal(getWordOrderWritingLineCount(en), 2);
  const seed = buildWordOrderSeed({
    workbookId: "wb",
    passageId: "p",
    sentenceId: "s1",
    sourceHash: "h",
  });
  const shuffled = shuffleWordOrderTokens(tokens, seed);
  assert.notEqual(
    shuffled.map((t) => t.tokenId).join("|"),
    tokens.map((t) => t.tokenId).join("|")
  );
  assert.equal(validateWordOrderTokens(en, tokens, shuffled).ok, true);
  console.log("short sentence ok");
}

// --- contraction ---
{
  const en = "We don't allow ourselves to participate.";
  const tokens = tokenizeForWordOrder(en);
  assert.ok(tokens.some((t) => t.surface === "don't"));
  assert.ok(!tokens.some((t) => t.surface === "don"));
  assert.ok(isRestorableToOriginal(en, tokens));
  console.log("contraction ok");
}

// --- possessive + hyphen ---
{
  const en = "A person's long-term memory can change.";
  const tokens = tokenizeForWordOrder(en);
  assert.ok(tokens.some((t) => t.surface === "person's"));
  assert.ok(tokens.some((t) => t.surface === "long-term"));
  assert.ok(isRestorableToOriginal(en, tokens));
  console.log("possessive/hyphen ok");
}

// --- duplicate words ---
{
  const en = "We believe that that belief matters.";
  const tokens = tokenizeForWordOrder(en);
  const thats = tokens.filter((t) => t.surface === "that");
  assert.equal(thats.length, 2);
  assert.notEqual(thats[0]!.tokenId, thats[1]!.tokenId);
  assert.equal(new Set(tokens.map((t) => t.tokenId)).size, tokens.length);
  console.log("duplicate that ok");
}

// --- long sentence line count ---
{
  const long = Array.from({ length: 45 }, (_, i) => `word${i}`).join(" ");
  assert.equal(getWordOrderWritingLineCount(long), 5);
  const tokens = tokenizeForWordOrder(long);
  assert.equal(tokens.length, 45);
  console.log("long sentence ok");
}

// --- quotes / semicolon ---
{
  const en =
    "Perhaps you heard ‘like attracts like’; results follow.";
  const tokens = tokenizeForWordOrder(en);
  assert.ok(tokens.some((t) => t.surface.includes("‘like") || t.surface === "‘like"));
  assert.ok(
    tokens.some(
      (t) => t.surface.endsWith(";") || t.surface.includes("like’;")
    ) || tokens.some((t) => t.surface.includes(";"))
  );
  assert.ok(isRestorableToOriginal(en, tokens));
  // punctuation stays attached — no lone "." token
  assert.ok(!tokens.some((t) => t.surface === "." || t.surface === ";"));
  console.log("quotes/semicolon ok", tokens.map((t) => t.surface).join(" | "));
}

// --- deterministic shuffle ---
{
  const en = "Our thoughts and words are extremely magnetic.";
  const tokens = tokenizeForWordOrder(en);
  const seedA = buildWordOrderSeed({
    workbookId: "wb1",
    passageId: "p1",
    sentenceId: "s1",
    sourceHash: computeSentenceSourceHash(formatWorkbookPassage(en)),
  });
  const seedB = buildWordOrderSeed({
    workbookId: "wb2",
    passageId: "p1",
    sentenceId: "s1",
    sourceHash: computeSentenceSourceHash(formatWorkbookPassage(en)),
  });
  const a1 = shuffleWordOrderTokens(tokens, seedA)
    .map((t) => t.tokenId)
    .join("|");
  const a2 = shuffleWordOrderTokens(tokens, seedA)
    .map((t) => t.tokenId)
    .join("|");
  const b1 = shuffleWordOrderTokens(tokens, seedB)
    .map((t) => t.tokenId)
    .join("|");
  assert.equal(a1, a2);
  assert.notEqual(a1, b1);
  console.log("deterministic shuffle ok");
}

// --- create question + no answer leak ---
{
  const en = "Our thoughts and words are extremely magnetic.";
  const ko = "우리의 생각과 말은 매우 끌어당기는 힘이 있습니다.";
  const hash = computeSentenceSourceHash(formatWorkbookPassage(en));
  const q = createWordOrderQuestion({
    workbookId: "wb",
    passageId: "p",
    sentenceId: "s1",
    orderIndex: 1,
    english: en,
    korean: ko,
    sourceHash: hash,
  });
  assert.ok(q);
  assert.equal(q!.originalEnglish, formatWorkbookPassage(en));
  assert.equal(q!.answerLineCount, 2);
  assert.notEqual(
    q!.shuffledTokens.map((t) => t.surface).join(" "),
    q!.originalEnglish
  );
  const section = {
    projectId: "p",
    title: "T",
    source: null,
    algorithmVersion: WORD_ORDER_WRITING_ALGORITHM_VERSION,
    items: [q!],
  };
  assert.equal(problemSheetLeaksOriginalEnglish(section), false);
  console.log("question / no leak ok");
  console.log(
    "problem sample:",
    `1. ${q!.korean}\n[ ${q!.shuffledTokens.map((t) => t.surface).join(" / ")} ]`
  );
  console.log("answer sample:", `1. ${q!.korean}\n   ${q!.originalEnglish}`);
}

// --- full generate, OpenAI 0 ---
{
  const { sentences, sentenceTranslations } = mkPassage([
    {
      id: "s1",
      english: "Movement is life to us.",
      korean: "움직임은 우리에게 생명입니다.",
    },
    {
      id: "s2",
      english: "We don't allow ourselves to participate.",
      korean: "우리는 스스로 참여하는 것을 허용하지 않습니다.",
    },
    {
      id: "s3",
      english: "A person's long-term memory can change.",
      korean: "사람의 장기 기억은 변할 수 있습니다.",
    },
    {
      id: "s4",
      english: "We believe that that belief matters.",
      korean: "우리는 그 믿음이 중요하다고 믿습니다.",
    },
  ]);
  const t0 = Date.now();
  const result = generateWorkbookWordOrderWriting({
    workbookId: "wb-test|2026",
    passages: [
      {
        projectId: "p1",
        title: "긍정적 사고의 한계와 믿음의 힘",
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
  assert.equal(result.sections[0]!.items.length, 4);
  for (let i = 0; i < 4; i++) {
    assert.equal(result.sections[0]!.items[i]!.orderIndex, i + 1);
  }
  assert.equal(problemSheetLeaksOriginalEnglish(result.sections[0]!), false);
  assert.ok(ms < 500, String(ms));
  console.log("generate 4 sentences ok, ms=", ms, "openAi=", result.openAiRequestCount);
}

// --- shared bilingual with line translation ---
{
  const { sentences, sentenceTranslations } = mkPassage([
    {
      id: "s1",
      english: "Movement is life to us.",
      korean: "움직임은 우리에게 생명입니다.",
    },
  ]);
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
  const wo = mapLineTranslationToWordOrderWriting(lt.sections, "wb|shared");
  assert.equal(wo[0]!.items.length, 1);
  assert.equal(wo[0]!.items[0]!.korean, sentences[0]!.korean);
  console.log("shared bilingual ok");
}

console.log("ALL word-order writing tests passed");
