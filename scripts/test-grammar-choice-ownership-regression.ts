/**
 * Ownership regression. No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-ownership-regression.ts
 */
import assert from "node:assert/strict";
import { detectSentenceCh01 } from "../src/lib/lesson-materials/grammar-choice-v2/sentence-ch01";
import { detectInfinitiveCh06 } from "../src/lib/lesson-materials/grammar-choice-v2/infinitive-ch06";
import { detectGerundCh07 } from "../src/lib/lesson-materials/grammar-choice-v2/gerund-ch07";
import { detectConjunctionCh10 } from "../src/lib/lesson-materials/grammar-choice-v2/conjunction-ch10";
import { detectNonfiniteCh09, NONFINITE_CH09_RULES } from "../src/lib/lesson-materials/grammar-choice-v2/nonfinite-ch09";
import {
  auditIssues,
  auditRows,
  canEmitQuestion,
  isActualQuestionDuplicate,
} from "./audit-grammar-choice-v2-ontology";

const blocking = new Set([
  "ACTUAL_DUAL_EMITTER",
  "DUPLICATE_REGISTRY_ROW",
  "DUPLICATE_EXACT_PAIR",
  "REFERENCE_CHAPTER_MISMATCH",
  "MULTIPLE_MANDATORY_OWNER",
  "MISSING_REQUIRED_FIELD",
  "UNREACHABLE_RULE",
]);

function studentHits(hits: Array<{ questionable: boolean; code: string; sourceSpan: string; occurrenceIndex: number }>) {
  return hits.filter((hit) => hit.questionable);
}

const too = "The box is too heavy to lift.";
const tooCh06 = studentHits(detectInfinitiveCh06(too));
const tooCh10 = studentHits(detectConjunctionCh10(too));
assert.equal(tooCh06.filter((hit) => hit.code === "TOO_TO").length, 1);
assert.equal(tooCh10.length, 0);
assert.ok(detectConjunctionCh10(too).some((hit) => hit.code === "RESULT_RELATION_TOO_TO" && !hit.questionable));

const allow = "We must allow ourselves to participate in the work.";
assert.equal(studentHits(detectSentenceCh01(allow)).some((hit) => hit.code === "OBJECT_COMPLEMENT_TO_V"), true);
assert.equal(studentHits(detectNonfiniteCh09(allow)).length, 0);
assert.ok(detectNonfiniteCh09(allow).some((hit) => hit.code === "OBJECT_COMPLEMENT_TO_V_ANALYSIS" && !hit.questionable));

const movingBox = "She left instead of moving the box.";
const movingCh07 = studentHits(detectGerundCh07(movingBox)).filter((hit) => hit.code === "GERUND_PREPOSITION_OBJECT");
const movingCh09 = studentHits(detectNonfiniteCh09(movingBox));
const movingCh09Analysis = detectNonfiniteCh09(movingBox).filter((hit) => hit.code === "GERUND_PREP_OBJECT_ANALYSIS");
const prepAnalysisRule = NONFINITE_CH09_RULES.find((rule) => rule.code === "GERUND_PREP_OBJECT_ANALYSIS");
assert.equal(movingCh07.length, 1);
assert.equal(movingCh07[0]?.sourceSpan.toLowerCase(), "moving");
assert.equal(movingCh09.length, 0);
assert.ok(movingCh09Analysis.length > 0);
assert.ok(movingCh09Analysis.every((hit) => !hit.questionable));
assert.ok(
  movingCh09Analysis.every(
    (hit) =>
      hit.exclusionReason == null ||
      hit.exclusionReason === "SECONDARY_OWNER_SUPPRESSED" ||
      hit.exclusionReason === "ANALYSIS_ONLY"
  )
);
assert.equal(prepAnalysisRule?.analysisOnly, true);
assert.equal(prepAnalysisRule?.emitsStudentQuestion, false);
assert.equal(prepAnalysisRule?.secondaryAnalyzer, true);
assert.equal(
  movingBox.slice(movingCh07[0]!.occurrenceIndex, movingCh07[0]!.occurrenceIndex + movingCh07[0]!.sourceSpan.length),
  movingCh07[0]!.sourceSpan
);

assert.equal(
  isActualQuestionDuplicate(
    {
      code: "SAMPLE",
      subtype: "A",
      assessmentAxis: "AXIS",
      emitsStudentQuestion: true,
      allowedMinimalPairs: [["to", "that"]],
      sourceSpan: "to",
      occurrenceIndex: 3,
    },
    {
      code: "SAMPLE",
      subtype: "B",
      assessmentAxis: "OTHER",
      analysisOnly: true,
      emitsStudentQuestion: false,
      allowedMinimalPairs: [],
      sourceSpan: "to",
      occurrenceIndex: 3,
    }
  ),
  false
);

const mandatoryOwners = new Set(
  auditRows.flatMap((row) => [])
);
assert.ok(auditIssues.every((issue) => issue.type !== "MULTIPLE_MANDATORY_OWNER"));
assert.equal(auditIssues.filter((issue) => blocking.has(issue.type)).length, 0);
assert.equal(auditRows.reduce((sum, row) => sum + row.conflict, 0), 0);
assert.equal(auditRows.reduce((sum, row) => sum + row.dup, 0), 0);

const restored = detectInfinitiveCh06(too).find((hit) => hit.questionable && hit.code === "TOO_TO");
assert.ok(restored);
assert.equal(too.slice(restored.occurrenceIndex, restored.occurrenceIndex + restored.sourceSpan.length), restored.sourceSpan);

assert.equal(canEmitQuestion({ analysisOnly: true, emitsStudentQuestion: false }), false);
assert.equal(canEmitQuestion({ emitsStudentQuestion: true }), true);

console.log("grammar-choice ownership regression: PASS");
