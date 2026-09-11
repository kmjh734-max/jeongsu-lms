/**
 * 자체 문법 목록의 모든 출제 가능 코드가 로컬 게이트를 통과해 문항이 되는지 본다.
 * OpenAI 호출 없음. 모델 판정(유일성·검수) 전 단계까지만 확인한다.
 *
 * Run: npx tsx scripts/test-grammar-choice-v2-ontology-coverage.ts [--verbose]
 */
import assert from "node:assert/strict";
import { GRAMMAR_ONTOLOGY } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { generationPolicyFor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { resolveAndFilter } from "../src/lib/lesson-materials/grammar-choice-v2/pipeline";
import { explainChoice } from "../src/lib/lesson-materials/grammar-choice-v2/explanation-templates";
import type { GrammarCandidate, GrammarPointCode } from "../src/lib/lesson-materials/grammar-choice-v2/types";
import { ONTOLOGY_FIXTURES } from "./fixtures/grammar-choice-v2-ontology-fixtures";

const verbose = process.argv.includes("--verbose");

type Outcome = {
  code: GrammarPointCode;
  status: "OK" | "RECODED" | "REJECTED" | "MISSING";
  detail: string;
  label?: string;
};

function run(fixture: (typeof ONTOLOGY_FIXTURES)[number]): Outcome {
  const text = fixture.sentence;
  // 낱말 경계로 찾는다(to가 store 안에서 잡히지 않게).
  const escaped = fixture.correct.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const at = new RegExp(`(?<![A-Za-z])${escaped}(?![A-Za-z])`).exec(text)?.index ?? -1;
  assert.ok(at >= 0, `fixture correct not in sentence: ${fixture.code}`);
  const candidate: GrammarCandidate = {
    candidateId: `fx-${fixture.code}`,
    sentenceId: "s",
    pointCode: fixture.code,
    sourceSpan: fixture.correct,
    occurrenceIndex: 0,
    correctAnswer: fixture.correct,
    distractors: [fixture.wrong],
    transformCode: "FORM_SWAP",
    priority: "CORE",
    difficulty: "CORE",
    evidence: "",
    ruleSummaryKo: "",
    riskLevel: "LOW",
  };
  const { resolved, rejected } = resolveAndFilter({
    sentences: [{ sentenceId: "s", text, passageStart: 0, passageEnd: text.length }],
    candidates: [candidate],
  });
  const end = at + fixture.correct.length;
  // 픽스처가 가리키는 자리를 덮는 문항(모델 후보든 로컬 후보든)을 찾는다.
  // 한 자리에 두 문항이 겹치면(수동태 + 관계절 수일치) 픽스처 코드에 맞는 쪽을 먼저 본다.
  const overlapping = resolved.filter((item) => item.passageStart < end && item.passageEnd > at);
  const hit =
    overlapping.find((item) => item.pointCode === fixture.code || fixture.alsoAccept?.includes(item.pointCode)) ??
    overlapping[0];
  if (hit) {
    const label = explainChoice({
      pointCode: hit.pointCode,
      correct: hit.correctAnswer,
      wrong: hit.distractors[0] ?? "",
    }).titleKo;
    const pair = `${hit.correctAnswer} / ${hit.distractors[0] ?? ""}`;
    if (hit.pointCode === fixture.code || fixture.alsoAccept?.includes(hit.pointCode)) {
      return { code: fixture.code, status: "OK", detail: `${pair} <${hit.pointCode}>`, label };
    }
    return { code: fixture.code, status: "RECODED", detail: `${pair} -> ${hit.pointCode}`, label };
  }
  const mine = rejected.find((row) => row.candidateId === candidate.candidateId);
  if (mine) return { code: fixture.code, status: "REJECTED", detail: `${mine.reason}: ${mine.pair}` };
  return { code: fixture.code, status: "MISSING", detail: rejected.map((r) => `${r.pointCode}:${r.reason}`).join(", ") };
}

const questionable = GRAMMAR_ONTOLOGY.filter(
  (point) => generationPolicyFor(point.code) !== "NOT_QUESTIONABLE"
).map((point) => point.code);
const fixtureCodes = new Set(ONTOLOGY_FIXTURES.map((f) => f.code));
const withoutFixture = questionable.filter((code) => !fixtureCodes.has(code));

const outcomes = ONTOLOGY_FIXTURES.map(run);
const bad = outcomes.filter((o) => o.status !== "OK");
for (const o of verbose ? outcomes : bad) {
  console.log(`${o.status.padEnd(8)} ${o.code.padEnd(36)} ${o.detail}${o.label ? `  [${o.label}]` : ""}`);
}
const notQuestionableFixtures = ONTOLOGY_FIXTURES.filter(
  (f) => generationPolicyFor(f.code) === "NOT_QUESTIONABLE"
).map((f) => f.code);
console.log(
  `\n출제 가능 코드 ${questionable.length}개 · 픽스처 ${ONTOLOGY_FIXTURES.length}개 · 통과 ${outcomes.length - bad.length}개 · 실패 ${bad.length}개`
);
if (withoutFixture.length) console.log(`픽스처 없는 출제 가능 코드: ${withoutFixture.join(", ")}`);
if (notQuestionableFixtures.length) console.log(`정책상 출제 불가인데 픽스처가 있는 코드: ${notQuestionableFixtures.join(", ")}`);

assert.equal(withoutFixture.length, 0, "모든 출제 가능 코드에 픽스처가 있어야 한다");
assert.equal(bad.length, 0, "모든 픽스처가 로컬 게이트를 통과해야 한다");

/* ---------- 2026-09-11 선생님 검토에서 나온 문항들 ---------- */

function one(code: GrammarPointCode, text: string, correct: string, wrong: string) {
  const c: GrammarCandidate = {
    candidateId: "rv", sentenceId: "s", pointCode: code, sourceSpan: correct, occurrenceIndex: 0,
    correctAnswer: correct, distractors: [wrong], transformCode: "FORM_SWAP", priority: "CORE",
    difficulty: "CORE", evidence: "", ruleSummaryKo: "", riskLevel: "LOW",
  };
  const out = resolveAndFilter({
    sentences: [{ sentenceId: "s", text, passageStart: 0, passageEnd: text.length }],
    candidates: [c],
  });
  // 같은 코드·스팬의 로컬 후보가 있으면 그쪽이 자리를 차지하므로 위치로 찾는다.
  const at = text.indexOf(correct);
  return {
    item: out.resolved.find((r) => r.passageStart < at + correct.length && r.passageEnd > at),
    reason: out.rejected.find((r) => r.candidateId === "rv")?.reason,
  };
}

// 고등 수준에 너무 쉽거나 어색한 문항은 떨어진다.
for (const [code, text, correct, wrong] of [
  ["PRONOUN_SUBJECT_OBJECT_CASE", "My name is Minjun, and I am a sophomore at Jackson High School.", "I", "me"],
  ["DUMMY_REFERENTIAL_IT", "Only they will know, but I would say it’s not likely.", "it’s", "its"],
  ["THERE_BE_STRUCTURE", "Is there truly nothing but happiness in their lives?", "Is there", "Does there be"],
  ["NOUN_CLAUSE_THAT", "However, it seems you don’t feel up to the task.", "don’t", "not"],
  ["NOUN_CLAUSE_THAT", "Rather than giving up, you keep saying, “Ah, that sounds boring.”", "that", "what"],
  ["INDIRECT_QUESTION_ORDER", "To be happy, all you have to do is enjoy these small happy moments.", "you have", "do you have"],
] as const) {
  const r = one(code, text, correct, wrong);
  assert.equal(r.item, undefined, `${correct} / ${wrong} 는 떨어져야 한다 (${r.reason ?? "통과함"})`);
}

// 라벨: 확실하면 고치고, 아니면 싣지 않는다.
const partitive = one("AGREEMENT_PREPOSITIONAL_MODIFIER", "Most of our happiness is in the here and now.", "is", "are");
assert.equal(partitive.item?.pointCode, "AGREEMENT_PARTITIVE");
const relAgree = one("RELATIVE_SUBJECT", "You are probably used to the ending that concludes every fairy tale.", "concludes", "conclude");
assert.equal(relAgree.item?.pointCode, "RELATIVE_AGREEMENT");
const adjAdv = one("PARTICIPLE_NOUN_MODIFIER", "Happiness comes from accumulating small happy moments.", "happy", "happily");
assert.ok(adjAdv.item === undefined || adjAdv.item.labelHidden === true || adjAdv.item.pointCode !== "PARTICIPLE_NOUN_MODIFIER", "형용사/부사 쌍에 분사 라벨을 싣지 않는다");
// 목적어 자리 격은 고등 문항이라 남는다.
assert.ok(one("PRONOUN_SUBJECT_OBJECT_CASE", "Between you and me, the plan will not work.", "me", "I").item);

// 필터가 죽이던 시제 문항은 로컬 단계를 통과한다.
for (const [code, text, correct, wrong] of [
  ["TENSE_SINCE_FOR", "I’ve been nominated as a candidate, and I’ve been nervous ever since.", "I’ve been", "I was"],
  ["TENSE_PRESENT_PERFECT_PAST", "The person turns out to be a friend you haven’t seen in a while.", "haven’t seen", "didn’t see"],
  ["TENSE_TIME_CONDITION_CLAUSE", "Your enjoyment will diminish if you repeat one thing for too long.", "repeat", "will repeat"],
] as const) {
  const r = one(code, text, correct, wrong);
  assert.ok(r.item, `${correct} / ${wrong} 는 로컬 단계를 통과해야 한다 (${r.reason})`);
}
console.log("review regressions ok");
console.log("grammar-choice-v2 ontology coverage: PASS");
