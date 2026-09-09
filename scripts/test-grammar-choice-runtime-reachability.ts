/**
 * CH01–CH14 runtime reachability. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-runtime-reachability.ts
 */
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { COMPARISON_CH12_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/comparison-ch12";
import { CONDITIONAL_CH05_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/conditional-ch05";
import { CONJUNCTION_CH10_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/conjunction-ch10";
import { generationPolicyFor } from "../src/lib/lesson-materials/grammar-choice-v2/generation-policy";
import { GERUND_CH07_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/gerund-ch07";
import { INFINITIVE_CH06_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/infinitive-ch06";
import { MODAL_CH04_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/modal-ch04";
import { NONFINITE_CH09_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/nonfinite-ch09";
import { PARTICIPLE_CH08_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/participle-ch08";
import { PARTS_CH13_RULES, partsLocalDistractor } from "../src/lib/lesson-materials/grammar-choice-v2/parts-ch13";
import { RELATIVE_CH11_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/relative-ch11";
import { scanLocalMandatory } from "../src/lib/lesson-materials/grammar-choice-v2/mandatory-scan";
import { SENTENCE_CH01_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/sentence-ch01";
import { SPECIAL_CH14_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/special-ch14";
import { TENSE_CH02_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/tense-ch02";
import { compactOntologyForSentences } from "../src/lib/lesson-materials/grammar-choice-v2/trigger-router";
import { detectComparisonCh12 } from "../src/lib/lesson-materials/grammar-choice-v2/comparison-ch12";
import { detectConditionalCh05 } from "../src/lib/lesson-materials/grammar-choice-v2/conditional-ch05";
import { detectConjunctionCh10 } from "../src/lib/lesson-materials/grammar-choice-v2/conjunction-ch10";
import { detectGerundCh07 } from "../src/lib/lesson-materials/grammar-choice-v2/gerund-ch07";
import { detectInfinitiveCh06 } from "../src/lib/lesson-materials/grammar-choice-v2/infinitive-ch06";
import { detectModalCh04 } from "../src/lib/lesson-materials/grammar-choice-v2/modal-ch04";
import { detectNonfiniteCh09 } from "../src/lib/lesson-materials/grammar-choice-v2/nonfinite-ch09";
import { detectParticipleCh08 } from "../src/lib/lesson-materials/grammar-choice-v2/participle-ch08";
import { detectPartsCh13 } from "../src/lib/lesson-materials/grammar-choice-v2/parts-ch13";
import { detectRelativeCh11 } from "../src/lib/lesson-materials/grammar-choice-v2/relative-ch11";
import { detectSentenceCh01 } from "../src/lib/lesson-materials/grammar-choice-v2/sentence-ch01";
import { detectSpecialCh14 } from "../src/lib/lesson-materials/grammar-choice-v2/special-ch14";
import { detectTenseCh02 } from "../src/lib/lesson-materials/grammar-choice-v2/tense-ch02";
import { detectVoiceCh03 } from "../src/lib/lesson-materials/grammar-choice-v2/voice-ch03";
import { VOICE_CH03_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/voice-ch03";
import { canEmitQuestion } from "./audit-grammar-choice-v2-ontology";

type Rule = {
  code: string;
  subtype: string;
  analysisOnly?: boolean;
  secondaryAnalyzer?: boolean;
  emitsStudentQuestion?: boolean;
  allowedMinimalPairs?: Array<[string, string]>;
};

const CHAPTER_RULES: Record<string, Rule[]> = {
  CH01: SENTENCE_CH01_RULES,
  CH02: TENSE_CH02_RULES,
  CH03: VOICE_CH03_RULES,
  CH04: MODAL_CH04_RULES,
  CH05: CONDITIONAL_CH05_RULES,
  CH06: INFINITIVE_CH06_RULES,
  CH07: GERUND_CH07_RULES,
  CH08: PARTICIPLE_CH08_RULES,
  CH09: NONFINITE_CH09_RULES,
  CH10: CONJUNCTION_CH10_RULES,
  CH11: RELATIVE_CH11_RULES,
  CH12: COMPARISON_CH12_RULES,
  CH13: PARTS_CH13_RULES,
  CH14: SPECIAL_CH14_RULES,
};

const CH12_AXES = [
  "AS_AS",
  "COMPARATIVE",
  "THE_COMPARATIVE",
  "COMPARATIVE_AND_COMPARATIVE",
  "SUPERLATIVE",
  "ONE_OF_SUPERLATIVE",
  "COMPARISON_TARGET",
  "MULTIPLICATIVE_COMPARISON",
] as const;

const CH09_NEW = [
  "NONFINITE_MEMORY_COMPLEMENT",
  "NONFINITE_STOP_COMPLEMENT",
  "NONFINITE_TRY_COMPLEMENT",
  "NONFINITE_MEAN_COMPLEMENT",
  "NONFINITE_GO_ON_COMPLEMENT",
] as const;

/** Generalized frames only. Not copied into production routing. */
const EXTRA_FIXTURES: Array<{ chapter: string; code: string; text: string }> = [
  { chapter: "CH12", code: "AS_AS", text: "This method is not as reliable as the old one." },
  { chapter: "CH12", code: "AS_AS", text: "She is not so careful as her sister." },
  { chapter: "CH12", code: "COMPARATIVE", text: "This tool is far more effective than the old one." },
  { chapter: "CH12", code: "COMPARATIVE", text: "The plan is less useful than the last one." },
  { chapter: "CH12", code: "COMPARATIVE", text: "She is taller than her brother." },
  { chapter: "CH12", code: "COMPARATIVE", text: "This method is superior to the previous one." },
  { chapter: "CH12", code: "COMPARATIVE", text: "Many students prefer reading to memorizing rules." },
  { chapter: "CH12", code: "THE_COMPARATIVE", text: "The more carefully we examine it, the clearer it becomes." },
  { chapter: "CH12", code: "COMPARATIVE_AND_COMPARATIVE", text: "The problem is becoming more and more difficult." },
  { chapter: "CH12", code: "SUPERLATIVE", text: "This is by far the most effective method." },
  { chapter: "CH12", code: "SUPERLATIVE", text: "Seoul is the second largest city in the country." },
  { chapter: "CH12", code: "ONE_OF_SUPERLATIVE", text: "She is one of the most influential scientists in the field." },
  { chapter: "CH12", code: "COMPARISON_TARGET", text: "The climate here is milder than that of the northern region." },
  { chapter: "CH12", code: "MULTIPLICATIVE_COMPARISON", text: "The box is twice as large as the old one." },
  { chapter: "CH09", code: "NONFINITE_MEMORY_COMPLEMENT", text: "She remembered to lock the door before leaving." },
  { chapter: "CH09", code: "NONFINITE_STOP_COMPLEMENT", text: "He stopped to look at the map." },
  { chapter: "CH09", code: "NONFINITE_TRY_COMPLEMENT", text: "She tried to open the window quietly." },
  { chapter: "CH09", code: "NONFINITE_MEAN_COMPLEMENT", text: "He meant to call you yesterday." },
  { chapter: "CH09", code: "NONFINITE_GO_ON_COMPLEMENT", text: "She went on to explain the next rule." },
  { chapter: "CH01", code: "PERCEPTION_COMPLEMENT", text: "I saw him enter the building." },
  { chapter: "CH01", code: "OBJECT_COMPLEMENT_PP", text: "I had my car repaired." },
  { chapter: "CH02", code: "TENSE_EXPLICIT_TIME_MARKER", text: "The train leaves at six tomorrow." },
  { chapter: "CH02", code: "TENSE_SEQUENCE", text: "She said that he was tired." },
  { chapter: "CH03", code: "VOICE_SVOC_PASSIVE", text: "She was called a hero." },
  { chapter: "CH06", code: "INFINITIVE_DUMMY_IT", text: "It is important to finish the draft today." },
  { chapter: "CH06", code: "INFINITIVE_ADVERB_ROLE", text: "To be frank, the plan failed." },
  { chapter: "CH06", code: "SO_AS_TO", text: "She spoke slowly so as to be understood." },
  { chapter: "CH10", code: "PARALLEL_AND_OR_BUT", text: "She can read and write the report." },
  { chapter: "CH11", code: "RELATIVE_OMISSION", text: "The book I bought yesterday is useful." },
  { chapter: "CH13", code: "PRONOUN_ANTECEDENT", text: "It may change later." },
  { chapter: "CH14", code: "PSEUDO_CLEFT_ALL", text: "All we have to do is think about the result." },
  { chapter: "CH14", code: "ELLIPSIS_COMMON_ELEMENT", text: "Few mistakes, if any, remain in the draft." },
  { chapter: "CH14", code: "ELLIPSIS_SUBSTITUTION", text: "She runs faster than he does." },
  { chapter: "CH14", code: "PARTIAL_NEGATION", text: "Not all students passed the quiz." },
  { chapter: "CH14", code: "DOUBLE_NEGATION", text: "The plan was not without risk for the team." },
  {
    chapter: "CH10",
    code: "NOUN_CLAUSE_DECLARATIVE_ORDER",
    text: "The point is we are getting further away from our design.",
  },
  { chapter: "CH13", code: "PREPOSITION_INSTEAD_OF", text: "We used pencil instead of ink." },
];

function studentEmitter(rule: Rule): boolean {
  if (!canEmitQuestion(rule)) return false;
  return generationPolicyFor(rule.code) !== "NOT_QUESTIONABLE";
}

function promptCodes(text: string): Set<string> {
  const payload = compactOntologyForSentences([
    { sentenceId: "s1", text, passageStart: 0, passageEnd: text.length },
  ]);
  return new Set(payload.codes.map((row) => row.split("|")[0] ?? ""));
}

function scanCodes(text: string): Set<string> {
  return new Set(
    scanLocalMandatory([{ sentenceId: "s1", text, passageStart: 0, passageEnd: text.length }]).map(
      (hint) => hint.pointCode
    )
  );
}

function isRecognizedHit(hit: { exclusionReason?: string; code: string }) {
  return Boolean(hit.code) && !hit.exclusionReason;
}

function detectorHits(text: string) {
  return [
    ...detectSentenceCh01(text),
    ...detectTenseCh02(text),
    ...detectVoiceCh03(text),
    ...detectModalCh04(text),
    ...detectConditionalCh05(text),
    ...detectInfinitiveCh06(text),
    ...detectGerundCh07(text),
    ...detectParticipleCh08(text),
    ...detectNonfiniteCh09(text),
    ...detectConjunctionCh10(text),
    ...detectRelativeCh11(text),
    ...detectComparisonCh12(text),
    ...detectPartsCh13(text),
    ...detectSpecialCh14(text),
  ];
}

function quotedSentences(): string[] {
  const dir = path.join(process.cwd(), "scripts");
  const files = fs.readdirSync(dir).filter((name) => /^test-grammar-choice-ch\d+\.ts$/.test(name));
  const found = new Set<string>();
  for (const file of files) {
    const text = fs.readFileSync(path.join(dir, file), "utf8");
    for (const match of text.matchAll(/"([^"\r\n]{16,})"/g)) {
      const value = match[1] ?? "";
      if (!/[A-Za-z]/.test(value) || !/\s/.test(value)) continue;
      if (value.includes("/") || value.includes("assert.") || value.includes("=>")) continue;
      found.add(value);
    }
  }
  return [...found];
}

function pairKey(left: string, right: string) {
  return [left, right].map((item) => item.trim().toLowerCase()).sort().join("|");
}

const fixturesByCode = new Map<string, string[]>();
function addFixture(code: string, text: string) {
  const list = fixturesByCode.get(code) ?? [];
  if (!list.includes(text)) list.push(text);
  fixturesByCode.set(code, list);
}

for (const text of quotedSentences()) {
  for (const hit of detectorHits(text)) {
    if (!isRecognizedHit(hit)) continue;
    addFixture(hit.code, text);
  }
}
for (const item of EXTRA_FIXTURES) addFixture(item.code, item.text);

const chapterStats: Array<{ chapter: string; emittable: number; reachable: number; unreachable: string[] }> = [];
const newlyRouted = new Set<string>();
let unreachableTotal = 0;

for (const [chapter, rules] of Object.entries(CHAPTER_RULES)) {
  const emitting = rules.filter(studentEmitter);
  const axes = [...new Set(emitting.map((rule) => rule.code))];
  const missing: string[] = [];
  for (const code of axes) {
    const fixtures = fixturesByCode.get(code) ?? [];
    const hit = fixtures.find((text) => promptCodes(text).has(code) || scanCodes(text).has(code));
    if (!hit) {
      missing.push(code);
      continue;
    }
    const policy = generationPolicyFor(code);
    assert.ok(policy === "LOCAL_TEMPLATE" || policy === "REVIEWED_AI", `${chapter} ${code} policy ${policy}`);
    if (promptCodes(hit).has(code)) newlyRouted.add(code);
  }
  unreachableTotal += missing.length;
  chapterStats.push({
    chapter,
    emittable: axes.length,
    reachable: axes.length - missing.length,
    unreachable: missing,
  });
}

const ch12Emitting = COMPARISON_CH12_RULES.filter(studentEmitter);
const ch12Axes = [...new Set(ch12Emitting.map((rule) => rule.code))];
const ch12Reached = CH12_AXES.filter((code) => {
  const fixtures = fixturesByCode.get(code) ?? [];
  return fixtures.some((text) => promptCodes(text).has(code));
});

assert.deepEqual(ch12Axes.sort(), [...CH12_AXES].sort());
assert.equal(ch12Reached.length, 8, `CH12 prompt axes ${ch12Reached.join(",")}`);
assert.equal(unreachableTotal, 0, chapterStats.flatMap((row) => row.unreachable.map((code) => `${row.chapter}:${code}`)).join(", "));

const declarativePositive = "The point is we are getting further away from our design.";
const insteadPositive = "We used pencil instead of ink.";
assert.ok(promptCodes(declarativePositive).has("NOUN_CLAUSE_DECLARATIVE_ORDER"));
assert.notEqual(
  [...promptCodes(declarativePositive)].find((code) => code === "NOUN_CLAUSE_DECLARATIVE_ORDER"),
  "INDIRECT_QUESTION_ORDER"
);
assert.ok(promptCodes(insteadPositive).has("PREPOSITION_INSTEAD_OF"));
for (const negative of [
  "What is the point?",
  "The question is whether we are ready.",
  "The point is to remain calm.",
  "The point that she made was important.",
]) {
  assert.ok(!promptCodes(negative).has("NOUN_CLAUSE_DECLARATIVE_ORDER"), negative);
}
assert.ok(!promptCodes("We did not use ink. Instead, we used pencil.").has("PREPOSITION_INSTEAD_OF"));
assert.ok(!promptCodes(declarativePositive).has("UNMAPPED_HIGH_VALUE_POINT"));
assert.ok(!promptCodes(insteadPositive).has("UNMAPPED_HIGH_VALUE_POINT"));
assert.equal(
  Object.values(CHAPTER_RULES).some((rules) => rules.some((rule) => rule.code === "UNMAPPED_HIGH_VALUE_POINT")),
  false
);

for (const code of CH09_NEW) {
  const fixtures = fixturesByCode.get(code) ?? [];
  assert.ok(fixtures.some((text) => promptCodes(text).has(code) || scanCodes(text).has(code)), code);
}

assert.equal(partsLocalDistractor("COUNTABLE_UNCOUNTABLE", "information"), "informations");
assert.equal(partsLocalDistractor("COUNTABLE_UNCOUNTABLE", "advice"), "advices");
assert.notEqual(partsLocalDistractor("COUNTABLE_UNCOUNTABLE", "information"), "advices");
assert.notEqual(partsLocalDistractor("COUNTABLE_UNCOUNTABLE", "advice"), "informations");

const cross = "information|advices";
for (const rules of Object.values(CHAPTER_RULES)) {
  for (const rule of rules) {
    for (const pair of rule.allowedMinimalPairs ?? []) {
      assert.notEqual(pairKey(pair[0], pair[1]), cross, `${rule.code} cross pair`);
    }
  }
}

console.log("grammar-choice runtime reachability: PASS");
for (const row of chapterStats) {
  console.log(
    `${row.chapter} emittable=${row.emittable} reachable=${row.reachable} unreachable=${row.unreachable.length}${
      row.unreachable.length ? ` [${row.unreachable.join(", ")}]` : ""
    }`
  );
}
console.log(`CH12 emittable axis reachable: ${ch12Reached.length}/8`);
console.log(`newly routed sample: ${[...newlyRouted].sort().join(", ")}`);
