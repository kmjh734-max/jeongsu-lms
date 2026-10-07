/**
 * 어휘 진단 채점·보기·토큰 검사(DB 없이).  npx tsx scripts/test-vocab-diagnostic.ts
 */
import assert from "node:assert/strict";
import { allSenses, buildChoices, displayMeaning, personalOrder, sensesOverlap, type PoolWord } from "../src/lib/vocab-diagnostic/choices";
import { cleanAnswer, rateText, summarize } from "../src/lib/vocab-diagnostic/scoring";
import { cleanToken, diagToken, hashDiagToken } from "../src/lib/vocab-diagnostic/tokens";
import type { DiagAnswers, DiagQuestion } from "../src/lib/vocab-diagnostic/types";

process.env.SUPABASE_SERVICE_ROLE_KEY ||= "test-secret";

// 정답률: 정답 ÷ 전체 × 100, 소수 첫째 자리
assert.equal(rateText(27, 40), "67.5");
assert.equal(rateText(21, 30), "70.0");
assert.equal(rateText(40, 40), "100.0");
assert.equal(rateText(0, 30), "0.0");
assert.equal(rateText(1, 3), "33.3");

const q = (i: number): DiagQuestion => ({ itemId: `i${i}`, setId: "s", day: i + 1, word: `w${i}`, answer: `a${i}`, choices: [`a${i}`, "x", "y", "z"], answerIndex: 0 });
const qs = Array.from({ length: 40 }, (_, i) => q(i));
const answers: DiagAnswers = {};
for (let i = 0; i < 27; i++) answers[String(i)] = 0; // 정답 27
for (let i = 27; i < 33; i++) answers[String(i)] = 2; // 오답 6
for (let i = 33; i < 37; i++) answers[String(i)] = "unknown"; // 모르겠어요 4, 미응답 3
const s = summarize(qs, answers);
assert.equal(s.correct, 27);
assert.equal(s.wrong, 6);
assert.equal(s.unknown, 4);
assert.equal(s.blank, 3);
assert.equal(s.correct + s.wrong + s.unknown + s.blank, s.total);
assert.equal(s.rateText, "67.5");
assert.equal(summarize(qs, {}).rateText, "0.0");

// 보낸 답 거르기: 범위 밖·꼴이 다른 값은 버린다
assert.equal(cleanAnswer(3, 4), 3);
assert.equal(cleanAnswer(4, 4), undefined);
assert.equal(cleanAnswer("2", 4), undefined);
assert.equal(cleanAnswer(1.5, 4), undefined);
assert.equal(cleanAnswer("unknown", 4), "unknown");

// 응시자마다 섞어도 정답 짝이 유지된다
for (const seed of ["a", "b", "c", "d"]) {
  const mixed = personalOrder(qs, seed);
  assert.equal(mixed.length, qs.length);
  for (const m of mixed) assert.equal(m.choices[m.answerIndex], m.answer);
  assert.deepEqual(new Set(mixed.map((m) => m.word)), new Set(qs.map((x) => x.word)));
}
assert.notDeepEqual(personalOrder(qs, "a").map((m) => m.word), personalOrder(qs, "b").map((m) => m.word));

// 뜻 겹침
assert.equal(displayMeaning("기간, 임기; 용어; 조건, 조항"), "기간, 임기");
assert.equal(displayMeaning("물건, 것, 재료"), "물건, 것");
assert.ok(sensesOverlap("아이, 어린이", "어린이, 소년"));
assert.ok(sensesOverlap("사라지다, 없어지다", "없어지다"));
assert.ok(!sensesOverlap("벽, 담", "지붕"));
assert.deepEqual(allSenses("요리하다; 요리사"), ["요리하다", "요리사"]);

const pool: PoolWord[] = [
  { itemId: "1", word: "kid", meaning: "아이, 어린이" },
  { itemId: "2", word: "child", meaning: "어린이, 아동" },
  { itemId: "3", word: "wall", meaning: "벽, 담" },
  { itemId: "4", word: "roof", meaning: "지붕" },
  { itemId: "5", word: "voice", meaning: "목소리, 음성" },
  { itemId: "6", word: "head", meaning: "머리" },
  { itemId: "7", word: "boy", meaning: "소년, 남자아이" },
];
for (let k = 0; k < 30; k++) {
  const built = buildChoices(pool[0]!, pool, `seed${k}`);
  assert.ok(built);
  assert.equal(built.choices.length, 4);
  assert.equal(new Set(built.choices).size, 4);
  assert.equal(built.choices[built.answerIndex], "아이, 어린이");
  assert.ok(!built.choices.includes("어린이, 아동"), "뜻이 겹치는 child가 오답으로 나오면 안 된다");
}
// 오답 셋을 못 채우면 null
assert.equal(buildChoices(pool[0]!, pool.slice(0, 3), "x"), null);

// 토큰: 목적이 다르면 해시가 다르고, 같은 입력이면 같은 토큰
const t1 = diagToken("invite", "row", "n1");
assert.equal(t1, diagToken("invite", "row", "n1"));
assert.notEqual(t1, diagToken("result", "row", "n1"));
assert.notEqual(t1, diagToken("invite", "row", "n2"));
assert.notEqual(hashDiagToken("invite", t1), hashDiagToken("result", t1));
assert.equal(cleanToken(t1), t1);
assert.equal(cleanToken("short"), null);
assert.equal(cleanToken("../../etc"), null);

console.log("vocab-diagnostic: ok");
