/**
 * forceRegenerate=true must ignore stored grammar-choice finals.
 * Run: npx tsx --env-file=.env.local scripts/force-regen-grammar-choice.ts
 */
import assert from "node:assert/strict";
import { generateWorkbookGrammarChoice } from "../src/lib/lesson-materials/generate-workbook-grammar-choice";
import { formatWorkbookPassage } from "../src/lib/lesson-materials/workbook-types";
import type { StoredGrammarChoiceV5Cache } from "../src/lib/lesson-materials/grammar-choice-v5-cache";
import { GRAMMAR_CHOICE_PROMPT_VERSION } from "../src/lib/lesson-materials/grammar-choice-constants";

const sentences = [
  {
    id: "loa-1",
    english: formatWorkbookPassage(
      "Perhaps you have heard of the Law of Attraction, which states that ‘like attracts like’ and that by focusing on positive or negative thoughts, one can bring about positive or negative results."
    ),
  },
];

const oldCache: StoredGrammarChoiceV5Cache = {
  algorithmVersion: GRAMMAR_CHOICE_PROMPT_VERSION,
  byPassageId: {
    "force-loa": {
      passageId: "force-loa",
      sourceHash: "old",
      analysisHintHash: "old",
      generatorModel: "gpt-4o",
      reviewerModel: "gpt-4o",
      generatorReasoningEffort: "none",
      reviewerReasoningEffort: "none",
      generatorVersion: "grammar-choice-generator-v7",
      reviewerVersion: "grammar-choice-reviewer-v3",
      candidates: [
        {
          choiceId: "OLD-REUSE-MUST-NOT-APPEAR",
          passageId: "force-loa",
          sentenceId: "loa-1",
          startTokenIndex: 0,
          endTokenIndex: 1,
          originalText: "which",
          correctText: "OLD-REUSE-MUST-NOT-APPEAR",
          incorrectText: "that",
          grammarCategoryId: "relative",
          grammarCategoryName: "relative",
          bookTerm: "old",
          explanationKo: "old cache item",
          incorrectReasonKo: "old",
          difficulty: 3,
          learningValue: 3,
          ambiguityRisk: "low",
        },
      ],
      createdAt: new Date().toISOString(),
    },
  },
};

async function main() {
  const result = await generateWorkbookGrammarChoice({
    forceRegenerate: true,
    passages: [
      {
        projectId: "force-loa",
        title: "Law of Attraction",
        source: "fixture",
        sentences,
        analysisReport: null,
        grammarChoiceV5Cache: oldCache,
      },
    ],
  });

  assert.ok(result.timing.openAiRequestCount >= 2, "expected generate+review");
  const section = result.sections[0];
  assert.ok(section, "expected a new section, not a skip of the old cache");
  const d = section.diagnostics!;
  const texts = section.items.map((it) => it.correctText).join(" | ");
  const report = {
    cacheHit: d.cacheHit,
    forceRegenerate: d.forceRegenerate,
    oldQuestionReuseCount: d.oldQuestionReuseCount,
    generatorActualModel: d.generatorActualModel,
    reviewerActualModel: d.reviewerActualModel,
    openAICallCount: d.openAICallCount,
    newQuestionCount: d.newQuestionCount,
    items: texts,
  };
  console.log(JSON.stringify(report, null, 2));
  assert.equal(d.cacheHit, false);
  assert.equal(d.forceRegenerate, true);
  assert.equal(d.oldQuestionReuseCount, 0);
  assert.ok(String(d.generatorActualModel).includes("gpt-5.6-sol"));
  assert.ok(String(d.reviewerActualModel).includes("gpt-5.6-sol"));
  assert.ok(d.openAICallCount >= 2);
  assert.equal(d.newQuestionCount, section.items.length);
  assert.equal(
    section.items.some((it) => it.correctText.includes("OLD-REUSE")),
    false
  );
  assert.equal(
    result.cachesToSave[0]?.cache.byPassageId["force-loa"]?.candidates.some(
      (c) => c.choiceId === "OLD-REUSE-MUST-NOT-APPEAR"
    ),
    false
  );
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
