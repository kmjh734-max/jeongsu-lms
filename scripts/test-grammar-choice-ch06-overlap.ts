/**
 * CH06 too/enough overlap reclassification. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ch06-overlap.ts
 */
import assert from "node:assert/strict";
import { CONJUNCTION_CH10_RULES, detectConjunctionCh10 } from "../src/lib/lesson-materials/grammar-choice-v2/conjunction-ch10";
import { INFINITIVE_CH06_RULES, detectInfinitiveCh06 } from "../src/lib/lesson-materials/grammar-choice-v2/infinitive-ch06";
import {
  auditIssues,
  auditRows,
  isActualQuestionDuplicate,
} from "./audit-grammar-choice-v2-ontology";

const duplicateTypes = new Set(["DUPLICATE_CODE", "DUPLICATE_EXACT_PAIR", "DUPLICATE_SUBTYPE"]);

function asked(text: string) {
  const ch06 = detectInfinitiveCh06(text).filter((hit) => hit.questionable);
  const ch10 = detectConjunctionCh10(text).filter((hit) => hit.questionable);
  return { ch06, ch10 };
}

function overlapRecords(form: string) {
  return auditIssues.filter((issue) => issue.type === "ANALYSIS_ONLY_OVERLAP" && issue.detail.startsWith(form));
}

const tooText = "The box is too heavy to lift.";
const enoughText = "She is old enough to drive.";
const tooAsked = asked(tooText);
const enoughAsked = asked(enoughText);

assert.equal(tooAsked.ch06.filter((hit) => hit.code === "TOO_TO").length, 1);
assert.equal(tooAsked.ch10.length, 0);
assert.equal(detectConjunctionCh10(tooText).some((hit) => hit.code === "RESULT_RELATION_TOO_TO" && !hit.questionable), true);
assert.equal(enoughAsked.ch06.filter((hit) => hit.code === "ENOUGH_TO").length, 1);
assert.equal(enoughAsked.ch10.length, 0);
assert.equal(detectConjunctionCh10(enoughText).some((hit) => hit.code === "RESULT_RELATION_ENOUGH_TO" && !hit.questionable), true);

assert.equal(overlapRecords("TOO_TO_FRAME").length, 1);
assert.equal(overlapRecords("ENOUGH_TO_FRAME").length, 1);
assert.equal(
  auditIssues.some((issue) => duplicateTypes.has(issue.type) && (issue.detail.includes("TOO_TO") || issue.detail.includes("ENOUGH_TO"))),
  false
);
assert.equal(auditRows.find((row) => row.chapter === "CH06")?.dup, 0);

const tooRule = INFINITIVE_CH06_RULES.find((rule) => rule.code === "TOO_TO");
const enoughRule = INFINITIVE_CH06_RULES.find((rule) => rule.code === "ENOUGH_TO");
const tooAnalysis = CONJUNCTION_CH10_RULES.find((rule) => rule.code === "RESULT_RELATION_TOO_TO");
const enoughAnalysis = CONJUNCTION_CH10_RULES.find((rule) => rule.code === "RESULT_RELATION_ENOUGH_TO");
const tooHit = detectInfinitiveCh06(tooText).find((hit) => hit.code === "TOO_TO");
const tooAnalysisHit = detectConjunctionCh10(tooText).find((hit) => hit.code === "RESULT_RELATION_TOO_TO");
const enoughHit = detectInfinitiveCh06(enoughText).find((hit) => hit.code === "ENOUGH_TO");
const enoughAnalysisHit = detectConjunctionCh10(enoughText).find((hit) => hit.code === "RESULT_RELATION_ENOUGH_TO");

assert.equal(
  isActualQuestionDuplicate(
    { ...tooRule!, sourceSpan: tooHit?.sourceSpan, occurrenceIndex: tooHit?.occurrenceIndex },
    { ...tooAnalysis!, sourceSpan: tooAnalysisHit?.sourceSpan, occurrenceIndex: tooAnalysisHit?.occurrenceIndex }
  ),
  false
);
assert.equal(
  isActualQuestionDuplicate(
    { ...enoughRule!, sourceSpan: enoughHit?.sourceSpan, occurrenceIndex: enoughHit?.occurrenceIndex },
    { ...enoughAnalysis!, sourceSpan: enoughAnalysisHit?.sourceSpan, occurrenceIndex: enoughAnalysisHit?.occurrenceIndex }
  ),
  false
);

assert.equal(
  isActualQuestionDuplicate(
    {
      code: "SAMPLE_BOTH_EMIT",
      subtype: "LEFT",
      assessmentAxis: "SAME_AXIS",
      emitsStudentQuestion: true,
      allowedMinimalPairs: [["to", "that"]],
      sourceSpan: "to",
      occurrenceIndex: 4,
    },
    {
      code: "SAMPLE_BOTH_EMIT",
      subtype: "RIGHT",
      assessmentAxis: "SAME_AXIS",
      emitsStudentQuestion: true,
      allowedMinimalPairs: [["that", "to"]],
      sourceSpan: "to",
      occurrenceIndex: 4,
    }
  ),
  true
);

const conflict = auditRows.reduce((sum, row) => sum + row.conflict, 0);
const duplicate = auditIssues.filter((issue) => duplicateTypes.has(issue.type)).length;
assert.equal(conflict, 0);
assert.equal(duplicate, 0);

console.log("grammar-choice ch06 overlap reclassification: PASS");
