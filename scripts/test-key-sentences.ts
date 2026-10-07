/**
 * 워크북 중요문장 어순배열 — 문장 고르기 검사(DB 없이).  npx tsx scripts/test-key-sentences.ts
 */
import assert from "node:assert/strict";
import { pickKeySentenceIds, structureOf } from "../src/lib/lesson-materials/key-sentences";

// 구문 판정
assert.equal(structureOf("She also bandaged her legs, making it difficult to move without a cane."), "가목적어");
assert.equal(structureOf("We found it hard to believe that he had left the town."), "가목적어");
assert.equal(structureOf("It is important to read the instructions before you start."), "가주어");
assert.equal(structureOf("It was the teacher who changed my mind about science."), "강조구문");
assert.equal(structureOf("Never have I seen such a beautiful sunset in my life."), "도치");
assert.equal(structureOf("The more you practice, the better you become at speaking."), "the 비교급");
assert.equal(structureOf("This is what makes the city so special to its visitors."), "관계대명사 what");
assert.equal(structureOf("She first had the idea that designs for older people were needed."), "동격 that");
assert.equal(structureOf("The dog ran across the park and jumped into the lake."), null);

// 고르기: 주제문 꼬리표가 먼저, 예시·질문은 빠지고, 지문 차례대로, 최대 5개
const sentences = [
  { id: "a", english: "Many people think that success depends only on talent and luck." },
  { id: "b", english: "For example, a famous pianist practiced eight hours every single day." },
  { id: "c", english: "Why do some people give up so easily when things get hard?" },
  { id: "d", english: "It is important to keep trying even after you fail many times." },
  { id: "e", english: "Her brother went to the market and bought some apples yesterday." },
  { id: "f", english: "Therefore, effort matters more than talent in the long run of life." },
  { id: "g", english: "We found it hard to believe that practice could change so much." },
];
const ids = pickKeySentenceIds({
  sentences,
  analysisSentences: [{ itemId: "a", markup: { text: sentences[0]!.english, tags: ["주제문"] } }],
  coreSentenceIds: ["f"],
});
assert.ok(ids.includes("a"), "주제문 꼬리표");
assert.ok(ids.includes("f"), "핵심 문장");
assert.ok(ids.includes("g"), "가목적어 구조 문장");
assert.ok(!ids.includes("b") && !ids.includes("c") && !ids.includes("e"), "예시·질문·이야기 문장은 빠진다");
assert.ok(ids.length <= 5);
assert.deepEqual(ids, [...ids].sort((x, y) => x.localeCompare(y)), "지문 차례");

// 꼬리표가 붙은 원문이 바뀌었으면 믿지 않는다
const stale = pickKeySentenceIds({
  sentences,
  analysisSentences: [{ itemId: "e", markup: { text: "old text", tags: ["주제문"] } }],
});
assert.ok(!stale.includes("e"));

console.log("key-sentences: ok", ids);
