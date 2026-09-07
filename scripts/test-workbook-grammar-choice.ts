/**
 * Grammar-choice blueprint-first tests (no OpenAI when formal report present).
 * Run: npx tsx --env-file=.env.local scripts/test-workbook-grammar-choice.ts
 */
import assert from "node:assert/strict";
import { generateWorkbookGrammarChoice } from "../src/lib/lesson-materials/generate-workbook-grammar-choice";
import { ensureGrammarBlueprint } from "../src/lib/lesson-materials/ensure-grammar-blueprint";
import { assessAnalysisCompleteness } from "../src/lib/lesson-materials/grammar-blueprint-completeness";
import { buildPassageSentenceSpans } from "../src/lib/lesson-materials/grammar-blueprint-sentences";
import {
  BLOCKED_PAIR_FIXTURES,
  isBlockedLowQualityPair,
} from "../src/lib/lesson-materials/grammar-choice-quality-block";
import { minimizeChoicePair } from "../src/lib/lesson-materials/grammar-choice-minimize";
import {
  WORKBOOK_TYPE_CATALOG,
  formatWorkbookPassage,
} from "../src/lib/lesson-materials/workbook-types";
import {
  GRAMMAR_BLUEPRINT_VERSION,
  GRAMMAR_CHOICE_PROMPT_VERSION,
} from "../src/lib/lesson-materials/grammar-choice-constants";
import type { AnalysisReportData } from "../src/lib/lesson-materials/generate-analysis-report";

assert.equal(
  GRAMMAR_CHOICE_PROMPT_VERSION,
  "grammar-choice-v4-blueprint-first"
);
assert.equal(
  GRAMMAR_BLUEPRINT_VERSION,
  "grammar-blueprint-v1-complete-sentence"
);
assert.ok(!WORKBOOK_TYPE_CATALOG.some((t) => t.id === "vocab_example"));

for (const [a, b] of BLOCKED_PAIR_FIXTURES) {
  assert.equal(isBlockedLowQualityPair(a, b).blocked, true, `${a}/${b}`);
}
console.log("blocked low-quality fixtures ok");

{
  const m = minimizeChoicePair(
    "the very thing that will help them learn",
    "the very thing what will help them learn"
  );
  assert.ok(m);
  assert.equal(m!.correctText, "that");
  assert.equal(m!.incorrectText, "what");
}

const loaSentences = [
  {
    id: "loa-1",
    english:
      "Perhaps you have heard of the Law of Attraction, which states that ‘like attracts like’ and that by focusing on positive or negative thoughts, one can bring about positive or negative results.",
  },
  {
    id: "loa-2",
    english:
      "The common flaw in our understanding of this law is that we believe all we have to do is think about or visualize something to manifest it.",
  },
  {
    id: "loa-3",
    english:
      "It is true that attracting a great career, relationship or lifestyle may be your desire, but first consider what limiting beliefs you have that contradict your desires and upgrade them to beliefs that are in line with what you want to attract.",
  },
].map((s) => ({ id: s.id, english: formatWorkbookPassage(s.english) }));

const moveSentences = [
  {
    id: "mov-1",
    english:
      "We are wonderfully made, yet we don’t allow ourselves to participate in the wonder for which we were created.",
  },
  {
    id: "mov-2",
    english:
      "Instead of moving anywhere, many kids today are being held captive by smart devices like phones and tablets.",
  },
  {
    id: "mov-3",
    english:
      "They are not learning how to socialize, and they miss the very thing that will help them learn, communicate, create, and become emotionally mature.",
  },
  {
    id: "mov-4",
    english:
      "Bodies were never meant to have so much square footage, We were made to move, and humans are meant to live extraordinary lives.",
  },
].map((s) => ({ id: s.id, english: formatWorkbookPassage(s.english) }));

function gp(
  title: string,
  detail: string,
  example: string,
  bookTerms: string[],
  wrongForms: string[] = [],
  wrongReasons: string[] = []
) {
  return { title, detail, example, bookTerms, wrongForms, wrongReasons };
}

const loaReport = {
  headerLabel: "Law of Attraction",
  sentences: [
    {
      itemId: "loa-1",
      enChunks: [{ text: loaSentences[0]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        gp("계속적 용법의 관계대명사", "선행사 LoA", "which states", ["계속적 용법의 관계대명사"], ["that states"], ["that 불가"]),
        gp("전치사 뒤 동명사", "by focusing", "focusing", ["전치사 뒤 동명사"], ["focused"]),
        gp("that절 병렬", "that ... and that ...", "that", ["명사절 that"], [], []),
      ],
    },
    {
      itemId: "loa-2",
      enChunks: [{ text: loaSentences[1]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        gp("유사분열문", "is think", "think", ["유사분열문"], ["thinking"]),
        gp("병렬구조", "think about or visualize", "visualize", ["병렬구조"], ["visualizing"]),
        gp("to부정사", "to manifest", "to manifest", ["to부정사"], ["manifesting"]),
      ],
    },
    {
      itemId: "loa-3",
      enChunks: [{ text: loaSentences[2]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        gp("가주어·진주어", "It is true that", "It", ["가주어·진주어"], ["There"]),
        gp("동명사구 주어", "attracting", "attracting", ["동명사구 주어"], ["attracted"]),
        gp("간접의문문", "what limiting beliefs", "what", ["간접의문문"], ["which"]),
        gp("관계대명사절 수일치", "that contradict", "contradict", ["수일치"], ["contradicts"]),
        gp("관계대명사 that", "that are", "that", ["관계대명사"], ["what"]),
        gp("관계대명사 what", "what you want", "what you want", ["관계대명사 what"], ["which you want"]),
      ],
    },
  ],
} as AnalysisReportData;

const moveReport = {
  headerLabel: "Movement",
  sentences: [
    {
      itemId: "mov-1",
      enChunks: [{ text: moveSentences[0]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        gp("allow O to V", "to participate", "to participate", ["allow O to V"], ["participating"]),
        gp("전치사+관계대명사", "which", "which", ["전치사+관계대명사"], ["that"]),
        gp("수동태", "were created", "were created", ["수동태"], ["created"]),
      ],
    },
    {
      itemId: "mov-2",
      enChunks: [{ text: moveSentences[1]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        gp("전치사 뒤 동명사", "moving", "moving", ["전치사 뒤 동명사"], ["move"]),
        gp("진행형 수동태", "are being held", "are being held", ["진행형 수동태"], ["are holding"]),
      ],
    },
    {
      itemId: "mov-3",
      enChunks: [{ text: moveSentences[2]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        gp("의문사+to부정사", "how to socialize", "how to socialize", ["의문사+to부정사"], ["how socializing"]),
        gp("관계대명사", "that", "that", ["관계대명사"], ["what"]),
        gp("help O + 동사원형", "learn", "learn", ["help O + 동사원형"], ["to learn"]),
      ],
    },
    {
      itemId: "mov-4",
      enChunks: [{ text: moveSentences[3]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        gp("be meant to V", "to have", "to have", ["be meant to V"], ["having"]),
        gp("be made to V", "to move", "to move", ["be made to V"], ["moving"]),
        gp("be meant to V", "to live", "to live", ["be meant to V"], ["living"]),
      ],
    },
  ],
} as AnalysisReportData;

{
  const { spans } = buildPassageSentenceSpans(loaSentences);
  const c = assessAnalysisCompleteness({ spans, report: loaReport });
  assert.equal(c.completeness, "COMPLETE");
  assert.equal(c.missingSentenceIds.length, 0);
}

async function main() {
  for (const [title, sentences, report] of [
    ["Law of Attraction", loaSentences, loaReport],
    ["Movement", moveSentences, moveReport],
  ] as const) {
    const ensured = await ensureGrammarBlueprint({
      passageId: `fix-${title}`,
      sentences,
      analysisReport: report,
      blueprintCache: null,
    });
    assert.equal(ensured.openAiRequestCount, 0, `${title} should use formal only`);
    assert.equal(ensured.blueprint.sentenceCount, sentences.length);
    assert.equal(
      ensured.blueprint.analyzedSentenceCount,
      sentences.length,
      `${title} analysis rate`
    );
    assert.equal(ensured.blueprint.completeness, "COMPLETE");

    const points = ensured.blueprint.sentences.flatMap((s) =>
      s.grammarPoints.map((p) => `${s.sentenceId}:${p.bookTerm}:${p.targetText}`)
    );
    console.log(`\n=== ${title} blueprint points (${points.length}) ===`);
    for (const line of points) console.log(" -", line);

    if (title === "Movement") {
      const hay = points.join(" | ").toLowerCase();
      assert.ok(/allow/.test(hay), "allow O to V analyzed");
      assert.ok(/help/.test(hay), "help O analyzed");
      assert.ok(/made/.test(hay), "be made to V analyzed");
      assert.ok(/meant/.test(hay), "be meant to V analyzed");
    }
  }

  const result = await generateWorkbookGrammarChoice({
    passages: [
      {
        projectId: "fixture-loa",
        title: "Law of Attraction",
        source: "fixture",
        sentences: loaSentences,
        analysisReport: loaReport,
        grammarChoiceCache: null,
        grammarBlueprintCache: null,
      },
      {
        projectId: "fixture-mov",
        title: "Movement",
        source: "fixture",
        sentences: moveSentences,
        analysisReport: moveReport,
        grammarChoiceCache: null,
        grammarBlueprintCache: null,
      },
    ],
  });

  assert.equal(result.skipped.length, 0);
  for (const section of result.sections) {
    const d = section.diagnostics!;
    console.log(`\n=== ${section.title} diagnostics ===`);
    console.log({
      sentenceAnalysisRate: `${Math.round(d.sentenceAnalysisRate * 100)}%`,
      coreReflectionRate: `${Math.round(d.coreReflectionRate * 100)}%`,
      finalCount: d.finalCount,
      formal: d.formalAnalysisPointCount,
      openAi: d.openAiRequestCount,
      restored: d.passageRestored,
      mismatch: d.originalMismatchCount,
      both: d.bothPossibleCount,
    });
    assert.equal(d.sentenceAnalysisRate, 1);
    assert.equal(d.coreReflectionRate, 1);
    assert.equal(d.passageRestored, true);
    assert.equal(d.originalMismatchCount, 0);
    assert.equal(d.openAiRequestCount, 0);

    console.log("\n학생용:");
    let passage = "";
    for (const seg of section.segments) {
      if (seg.type === "text") passage += seg.text;
      else
        passage += `${seg.number}[${seg.leftText}/${seg.rightText}]`;
    }
    console.log(passage);

    console.log("\n정답:");
    for (const it of section.items) {
      console.log(
        `${it.number}. ${it.correctText} | ${it.bookTerm} | ${it.analysisOriginLabel}`
      );
    }
  }

  console.log("\nALL grammar-choice blueprint-first tests passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
