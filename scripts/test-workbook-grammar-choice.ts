/**
 * Grammar-choice v5 tests + live LOA/Movement pipeline report.
 * Run: npx tsx --env-file=.env.local scripts/test-workbook-grammar-choice.ts
 */
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import {
  BLOCKED_PAIR_FIXTURES,
  isBlockedLowQualityPair,
} from "../src/lib/lesson-materials/grammar-choice-quality-block";
import { generateWorkbookGrammarChoice } from "../src/lib/lesson-materials/generate-workbook-grammar-choice";
import { GRAMMAR_CHOICE_PROMPT_VERSION } from "../src/lib/lesson-materials/grammar-choice-constants";
import { circledNumber } from "../src/lib/lesson-materials/grammar-choice-constants";
import { formatWorkbookPassage } from "../src/lib/lesson-materials/workbook-types";
import type { AnalysisReportData } from "../src/lib/lesson-materials/generate-analysis-report";
import type { StoredGrammarChoiceV5Cache } from "../src/lib/lesson-materials/grammar-choice-v5-cache";

assert.ok(
  GRAMMAR_CHOICE_PROMPT_VERSION.includes("grammar-choice-generator-v8")
);

for (const row of BLOCKED_PAIR_FIXTURES) {
  const a = Array.isArray(row) ? row[0] : row.correct;
  const b = Array.isArray(row) ? row[1] : row.incorrect;
  assert.equal(
    isBlockedLowQualityPair(a, b).blocked,
    true,
    `should block ${a} / ${b}`
  );
}
console.log("blocked failure-case fixtures: ALL PASS");

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
      "Bodies were never meant to have so much square footage. We were made to move, and humans are meant to live extraordinary lives.",
  },
].map((s) => ({ id: s.id, english: formatWorkbookPassage(s.english) }));

const loaReport = {
  headerLabel: "LoA",
  sentences: [
    {
      itemId: "loa-1",
      enChunks: [{ text: loaSentences[0]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        {
          title: "계속적 용법의 관계대명사",
          detail: "which states",
          example: "which states",
          bookTerms: ["계속적 용법의 관계대명사"],
        },
        {
          title: "전치사 뒤 동명사",
          detail: "by focusing",
          example: "focusing",
          bookTerms: ["전치사 뒤 동명사"],
        },
      ],
    },
    {
      itemId: "loa-2",
      enChunks: [{ text: loaSentences[1]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        {
          title: "유사분열문",
          detail: "is think",
          example: "think",
          bookTerms: ["유사분열문"],
        },
      ],
    },
    {
      itemId: "loa-3",
      enChunks: [{ text: loaSentences[2]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        {
          title: "가주어·진주어",
          detail: "It is true that",
          example: "It",
          bookTerms: ["가주어·진주어"],
        },
        {
          title: "관계대명사 what",
          detail: "what you want",
          example: "what you want",
          bookTerms: ["관계대명사 what"],
        },
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
        {
          title: "allow O to V",
          detail: "to participate",
          example: "to participate",
          bookTerms: ["allow O to V"],
        },
      ],
    },
    {
      itemId: "mov-2",
      enChunks: [{ text: moveSentences[1]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        {
          title: "진행형 수동태",
          detail: "are being held",
          example: "are being held",
          bookTerms: ["진행형 수동태"],
        },
      ],
    },
    {
      itemId: "mov-3",
      enChunks: [{ text: moveSentences[2]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        {
          title: "help O + 동사원형",
          detail: "learn",
          example: "learn",
          bookTerms: ["help O + 동사원형"],
        },
      ],
    },
    {
      itemId: "mov-4",
      enChunks: [{ text: moveSentences[3]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        {
          title: "be made to V",
          detail: "to move",
          example: "to move",
          bookTerms: ["be made to V"],
        },
        {
          title: "be meant to V",
          detail: "to live",
          example: "to live",
          bookTerms: ["be meant to V"],
        },
      ],
    },
  ],
} as AnalysisReportData;

async function main() {
  let report = "";
  const cacheBag: { current: StoredGrammarChoiceV5Cache | null } = {
    current: null,
  };

  const first = await generateWorkbookGrammarChoice({
    forceRegenerate: true,
    passages: [
      {
        projectId: "fixture-loa",
        title: "Law of Attraction",
        source: "fixture",
        sentences: loaSentences,
        analysisReport: loaReport,
        grammarChoiceV5Cache: null,
      },
      {
        projectId: "fixture-mov",
        title: "Movement",
        source: "fixture",
        sentences: moveSentences,
        analysisReport: moveReport,
        grammarChoiceV5Cache: null,
      },
    ],
  });

  assert.ok(first.timing.openAiRequestCount >= 3, "expected ≥2 generate + 1 review");
  for (const { projectId, cache } of first.cachesToSave) {
    cacheBag.current = cache;
    void projectId;
  }
  // merge caches
  let merged: StoredGrammarChoiceV5Cache | null = null;
  for (const { cache } of first.cachesToSave) {
    merged = {
      algorithmVersion: cache.algorithmVersion,
      byPassageId: {
        ...(merged?.byPassageId ?? {}),
        ...cache.byPassageId,
      },
    };
  }

  for (const section of first.sections) {
    const d = section.diagnostics!;
    report += `\n======== ${section.title} (1st run) ========\n`;
    report += `desired=${d.desiredQuestionCount} discovered=${d.discoveredGrammarPointCount} sentencePoints=${JSON.stringify(d.sentencePointCounts)}\n`;
    report += `initialCandidates=${d.initialCandidateCount} initialApproved=${d.initialApprovedCount} topUpRounds=${d.topUpRoundCount} topUpCandidates=${d.topUpCandidateCount} topUpApproved=${d.topUpApprovedCount}\n`;
    report += `final=${d.finalQuestionCount} rendered=${d.renderedQuestionCount} mismatch=${d.countMismatch} mix=${JSON.stringify(d.difficultyMix)}\n`;
    report += `rejectReasons=${JSON.stringify(d.rejectReasonCounts)}\n`;
    report += `생성후보=${d.generatedCandidateCount} 코드통과=${d.codeValidatedCount} 검수승인=${d.reviewAcceptedCount} 최종=${d.finalCount}\n`;
    report += `forceRegenerate=${d.forceRegenerate} oldReuse=${d.oldQuestionReuseCount} generatorActual=${d.generatorActualModel} reviewerActual=${d.reviewerActualModel}\n`;
    report += `생성모델=${d.generatorModel} actual=${d.generatorActualResponseModel} effort=${d.generatorReasoningEffort}\n`;
    report += `검수모델=${d.reviewerModel} actual=${d.reviewerActualResponseModel} effort=${d.reviewerReasoningEffort}\n`;
    report += `openAICallCount=${d.openAICallCount} cacheHit=${d.cacheHit} localFallbackUsed=${d.localFallbackUsed}\n`;
    report += `versions=${d.generatorVersion}+${d.reviewerVersion}\n`;
    report += `apiCalls=${JSON.stringify(d.apiCalls)}\n`;
    report += `코드탈락: ${JSON.stringify(d.codeRejectSamples)}\n`;
    report += `검수탈락: ${JSON.stringify(d.reviewRejectSamples)}\n`;
    report += `\n【학생용】\n`;
    for (const seg of section.segments) {
      if (seg.type === "text") report += seg.text;
      else
        report += `${circledNumber(seg.number)}[${seg.leftText} / ${seg.rightText}]`;
    }
    report += `\n\n【정답】\n`;
    for (const it of section.items) {
      report += `${circledNumber(it.number)} 정답: ${it.correctText}\n문법: ${it.bookTerm}\n`;
      if (it.structureSummary) report += `구조: ${it.structureSummary}\n`;
      report += `설명: ${it.explanationKo}\n오답 이유: ${it.incorrectText} — ${it.incorrectReasonKo}\n\n`;
    }
    assert.equal(d.passageRestored, true);
    assert.equal(d.originalMismatchCount, 0);
    assert.ok(d.generateApiCalls >= 1 || d.cacheHit);
  }

  const second = await generateWorkbookGrammarChoice({
    passages: [
      {
        projectId: "fixture-loa",
        title: "Law of Attraction",
        source: "fixture",
        sentences: loaSentences,
        analysisReport: loaReport,
        grammarChoiceV5Cache: merged,
      },
      {
        projectId: "fixture-mov",
        title: "Movement",
        source: "fixture",
        sentences: moveSentences,
        analysisReport: moveReport,
        grammarChoiceV5Cache: merged,
      },
    ],
  });

  assert.equal(
    second.timing.openAiRequestCount,
    0,
    "cache hit must use 0 OpenAI"
  );
  report += `\n======== cache re-run ========\nOpenAI=${second.timing.openAiRequestCount}\n`;
  for (const s of second.sections) {
    report += `${s.title}: cacheHit=${s.diagnostics?.cacheHit} final=${s.diagnostics?.finalCount}\n`;
    assert.equal(s.diagnostics?.cacheHit, true);
  }

  writeFileSync("scripts/_gc-v5-report.txt", report, "utf8");
  console.log(report);
  console.log("\nALL grammar-choice v5 tests passed");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
