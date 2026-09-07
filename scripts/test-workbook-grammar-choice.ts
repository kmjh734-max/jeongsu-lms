/**
 * Analysis-first grammar-choice fixtures + generation demo.
 * Run: npx tsx --env-file=.env.local scripts/test-workbook-grammar-choice.ts
 */
import assert from "node:assert/strict";
import { tokenizeForWordOrder } from "../src/lib/lesson-materials/word-order-tokenize";
import { validateAndFilterCandidates } from "../src/lib/lesson-materials/grammar-choice-validate";
import { selectFinalGrammarChoices } from "../src/lib/lesson-materials/grammar-choice-select";
import {
  assignDisplaySides,
  buildGrammarChoiceItems,
  buildPassageSegmentsFromSource,
} from "../src/lib/lesson-materials/grammar-choice-display";
import { minimizeChoicePair } from "../src/lib/lesson-materials/grammar-choice-minimize";
import { buildHeuristicGrammarCandidates } from "../src/lib/lesson-materials/grammar-choice-fallback";
import { extractRequiredAnalysisPoints } from "../src/lib/lesson-materials/grammar-choice-analysis-extract";
import { convertAnalysisPointLocally } from "../src/lib/lesson-materials/grammar-choice-analysis-convert";
import { generateWorkbookGrammarChoice } from "../src/lib/lesson-materials/generate-workbook-grammar-choice";
import type { AnalysisReportData } from "../src/lib/lesson-materials/generate-analysis-report";
import {
  WORKBOOK_TYPE_CATALOG,
  formatWorkbookPassage,
  joinWorkbookPassageLines,
  type GrammarChoiceCandidate,
} from "../src/lib/lesson-materials/workbook-types";
import { GRAMMAR_CHOICE_PROMPT_VERSION } from "../src/lib/lesson-materials/grammar-choice-constants";
import { circledNumber } from "../src/lib/lesson-materials/grammar-choice-constants";

assert.equal(
  GRAMMAR_CHOICE_PROMPT_VERSION,
  "grammar-choice-v3-analysis-first"
);
assert.ok(!WORKBOOK_TYPE_CATALOG.some((t) => t.id === "vocab_example"));
assert.ok(
  WORKBOOK_TYPE_CATALOG.find((t) => t.id === "grammar_choice")?.ready === true
);

{
  const m = minimizeChoicePair(
    "the very thing that will help them learn",
    "the very thing what will help them learn"
  );
  assert.ok(m);
  assert.equal(m!.correctText, "that");
  assert.equal(m!.incorrectText, "what");
}

{
  const m = minimizeChoicePair(
    "are being held captive",
    "are holding captive"
  );
  assert.ok(m);
  assert.equal(m!.correctText, "are being held");
  assert.equal(m!.incorrectText, "are holding");
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

const loaReport: AnalysisReportData = {
  headerLabel: "Law of Attraction",
  sentences: [
    {
      itemId: "loa-1",
      enChunks: [{ text: loaSentences[0]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        {
          title: "계속적 용법의 관계대명사",
          detail: "선행사 the Law of Attraction을 받아 뒤에서 부연 설명한다.",
          example: "which states",
          bookTerms: ["계속적 용법의 관계대명사"],
          wrongForms: ["that states"],
          wrongReasons: [
            "계속적 용법(쉼표 뒤)에서는 that을 쓰지 않고 which를 쓴다.",
          ],
        },
        {
          title: "전치사 뒤 동명사",
          detail: "전치사 by 뒤에는 동명사 focusing이 온다.",
          example: "focusing",
          bookTerms: ["전치사 뒤 동명사"],
          wrongForms: ["focused"],
          wrongReasons: ["전치사 뒤에는 동사 과거분사보다 동명사가 온다."],
        },
      ],
    },
    {
      itemId: "loa-2",
      enChunks: [{ text: loaSentences[1]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        {
          title: "유사분열문 보어의 동사원형",
          detail:
            "all we have to do is 뒤에 보어로 동사원형 think가 온다. 명확한 2지선다가 애매하면 제외 가능.",
          example: "think",
          bookTerms: ["유사분열문"],
          wrongForms: ["thinking"],
          wrongReasons: ["유사분열문의 보어는 동사원형이 자연스럽다."],
        },
        {
          title: "to부정사",
          detail: "visualize something to manifest it",
          example: "to manifest",
          bookTerms: ["to부정사"],
          wrongForms: ["manifesting"],
          wrongReasons: ["목적을 나타내는 to부정사가 적절하다."],
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
          detail: "It is true that …에서 It은 가주어, that절이 진주어이다.",
          example: "It",
          bookTerms: ["가주어·진주어"],
          wrongForms: ["There"],
          wrongReasons: ["가주어 구문에서는 It을 쓴다."],
        },
        {
          title: "동명사구 주어",
          detail: "attracting a great career …가 주어 역할을 한다.",
          example: "attracting",
          bookTerms: ["동명사구 주어"],
          wrongForms: ["attracted"],
          wrongReasons: ["주어 자리에는 동명사구가 온다."],
        },
        {
          title: "간접의문문",
          detail: "consider what limiting beliefs you have",
          example: "what limiting beliefs you have",
          bookTerms: ["간접의문문"],
          wrongForms: ["which limiting beliefs you have"],
          wrongReasons: ["의문사 what이 간접의문문을 이끈다."],
        },
        {
          title: "관계대명사절 수일치",
          detail: "선행사 beliefs에 맞춰 contradict(복수)가 온다.",
          example: "that contradict",
          bookTerms: ["관계대명사절 수일치"],
          wrongForms: ["that contradicts"],
          wrongReasons: ["선행사 beliefs가 복수이므로 contradict가 맞다."],
        },
        {
          title: "관계대명사 that",
          detail: "beliefs that are in line with …",
          example: "that are",
          bookTerms: ["관계대명사"],
          wrongForms: ["what are"],
          wrongReasons: ["선행사가 있을 때 what을 쓰지 않는다."],
        },
        {
          title: "선행사 포함 관계대명사 what",
          detail: "what you want = the thing that you want",
          example: "what you want",
          bookTerms: ["관계대명사 what"],
          wrongForms: ["which you want"],
          wrongReasons: ["선행사를 포함한 what이 필요하다."],
        },
      ],
    },
  ],
};

const moveReport: AnalysisReportData = {
  headerLabel: "Movement",
  sentences: [
    {
      itemId: "mov-1",
      enChunks: [{ text: moveSentences[0]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        {
          title: "allow O to V",
          detail: "allow ourselves to participate",
          example: "to participate",
          bookTerms: ["allow O to V"],
          wrongForms: ["participating"],
          wrongReasons: ["allow 다음에는 O + to V가 온다."],
        },
        {
          title: "전치사+관계대명사",
          detail: "for which we were created",
          example: "which",
          bookTerms: ["전치사+관계대명사"],
          wrongForms: ["that"],
          wrongReasons: ["전치사 뒤에는 which를 쓴다."],
        },
      ],
    },
    {
      itemId: "mov-2",
      enChunks: [{ text: moveSentences[1]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        {
          title: "전치사 뒤 동명사",
          detail: "Instead of moving",
          example: "moving",
          bookTerms: ["전치사 뒤 동명사"],
          wrongForms: ["move"],
          wrongReasons: ["전치사 of 뒤에는 동명사가 온다."],
        },
        {
          title: "진행형 수동태",
          detail: "are being held captive",
          example: "are being held",
          bookTerms: ["진행형 수동태"],
          wrongForms: ["are holding"],
          wrongReasons: ["진행형 수동은 be being + p.p.이다."],
        },
      ],
    },
    {
      itemId: "mov-3",
      enChunks: [{ text: moveSentences[2]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        {
          title: "의문사 + to부정사",
          detail: "how to socialize",
          example: "how to socialize",
          bookTerms: ["의문사+to부정사"],
          wrongForms: ["how socializing"],
          wrongReasons: ["의문사 뒤에는 to부정사가 온다."],
        },
        {
          title: "선행사 있는 관계대명사",
          detail: "the very thing that will help them",
          example: "that",
          bookTerms: ["관계대명사"],
          wrongForms: ["what"],
          wrongReasons: ["선행사 thing이 있으므로 what을 쓰지 않는다."],
        },
        {
          title: "help O + 동사원형 / 병렬구조",
          detail: "help them learn, communicate, create, and become",
          example: "learn",
          bookTerms: ["help O + 동사원형"],
          wrongForms: ["to learn"],
          wrongReasons: ["help 다음에는 목적어 + 동사원형이 온다."],
        },
      ],
    },
    {
      itemId: "mov-4",
      enChunks: [{ text: moveSentences[3]!.english, role: "other" }],
      koChunks: [],
      grammarPoints: [
        {
          title: "be meant to V",
          detail: "were never meant to have",
          example: "to have",
          bookTerms: ["be meant to V"],
          wrongForms: ["having"],
          wrongReasons: ["be meant 다음에는 to부정사가 온다."],
        },
        {
          title: "be made to V",
          detail: "We were made to move",
          example: "to move",
          bookTerms: ["be made to V"],
          wrongForms: ["moving"],
          wrongReasons: ["수동 make 구문에서는 be made to V이다."],
        },
        {
          title: "be meant to V",
          detail: "are meant to live",
          example: "to live",
          bookTerms: ["be meant to V"],
          wrongForms: ["living"],
          wrongReasons: ["be meant 다음에는 to부정사가 온다."],
        },
      ],
    },
  ],
};

// Unit: extraction + local convert prefer analysis
{
  const points = extractRequiredAnalysisPoints({
    report: loaReport,
    sentences: loaSentences,
  });
  assert.ok(points.length >= 8, `loa points=${points.length}`);
  const which = points.find((p) => /which states/i.test(p.targetExpression));
  assert.ok(which);
  const local = convertAnalysisPointLocally({
    passageId: "loa",
    point: which!,
  });
  assert.ok(local);
  assert.equal(local!.sourceType, "analysis_required");
  assert.ok(
    /which|states/i.test(local!.correctText),
    local!.correctText
  );
  console.log("local convert which:", local!.correctText, "/", local!.incorrectText);
}

{
  const points = extractRequiredAnalysisPoints({
    report: moveReport,
    sentences: moveSentences,
  });
  const held = points.find((p) => /are being held/i.test(p.targetExpression));
  assert.ok(held);
  const local = convertAnalysisPointLocally({
    passageId: "mov",
    point: held!,
  });
  assert.ok(local);
  assert.notEqual(local!.incorrectText.toLowerCase(), "are being hold");
  console.log(
    "local convert held:",
    local!.correctText,
    "/",
    local!.incorrectText
  );
}

// Heuristic still works without analysis
for (const [name, sentences] of [
  ["loa-heur", loaSentences],
  ["move-heur", moveSentences],
] as const) {
  const heur = buildHeuristicGrammarCandidates({
    passageId: name,
    sentences,
  });
  const map = new Map(sentences.map((s) => [s.id, s.english]));
  const { accepted } = validateAndFilterCandidates(heur, map);
  const selected = selectFinalGrammarChoices(accepted, 10);
  const source = joinWorkbookPassageLines(sentences.map((s) => s.english));
  const items = buildGrammarChoiceItems(
    selected,
    `seed-${name}`,
    source,
    sentences.map((s) => s.id)
  );
  assert.ok(items);
  const segments = buildPassageSegmentsFromSource(source, items!);
  assert.ok(segments);
  let rebuilt = "";
  for (const seg of segments!) {
    if (seg.type === "text") rebuilt += seg.text;
    else rebuilt += items!.find((x) => x.number === seg.number)!.correctText;
  }
  assert.equal(rebuilt, source);
}

{
  const cands: GrammarChoiceCandidate[] = [
    {
      choiceId: "a",
      passageId: "p",
      sentenceId: "1",
      startTokenIndex: 0,
      endTokenIndex: 0,
      originalText: "which",
      correctText: "which",
      incorrectText: "that",
      grammarCategoryId: "g1",
      grammarCategoryName: "관계대명사",
      bookTerm: "전치사+관계대명사",
      explanationKo: "x",
      incorrectReasonKo: "y",
      difficulty: 3,
      learningValue: 4,
      ambiguityRisk: "low",
      sourceType: "analysis_required",
    },
    {
      choiceId: "b",
      passageId: "p",
      sentenceId: "1",
      startTokenIndex: 1,
      endTokenIndex: 1,
      originalText: "focusing",
      correctText: "focusing",
      incorrectText: "focused",
      grammarCategoryId: "g2",
      grammarCategoryName: "동명사",
      bookTerm: "전치사 뒤 동명사",
      explanationKo: "x",
      incorrectReasonKo: "y",
      difficulty: 3,
      learningValue: 4,
      ambiguityRisk: "low",
      sourceType: "ai_supplement",
    },
  ];
  const selected = selectFinalGrammarChoices(cands, 1);
  assert.equal(selected.length, 1);
  assert.equal(selected[0]!.sourceType, "analysis_required");
  assert.deepEqual(
    assignDisplaySides(cands, "seed"),
    assignDisplaySides(cands, "seed")
  );
}

function renderStudentPassage(
  title: string,
  source: string,
  items: NonNullable<ReturnType<typeof buildGrammarChoiceItems>>
) {
  const segments = buildPassageSegmentsFromSource(source, items)!;
  let out = `【학생용 · ${title}】\n`;
  for (const seg of segments) {
    if (seg.type === "text") out += seg.text;
    else {
      out += `${circledNumber(seg.number)}[${seg.leftText} / ${seg.rightText}]`;
    }
  }
  return out;
}

function renderAnswerKey(
  title: string,
  items: NonNullable<ReturnType<typeof buildGrammarChoiceItems>>,
  points: ReturnType<typeof extractRequiredAnalysisPoints>
) {
  const byId = new Map(points.map((p) => [p.analysisPointId, p]));
  let out = `【정답 해설 · ${title}】\n`;
  for (const it of items) {
    out += `${circledNumber(it.number)} 정답: ${it.correctText}\n`;
    out += `문법: ${it.bookTerm || it.grammarCategoryName}\n`;
    out += `근거: ${it.explanationKo}\n`;
    out += `오답: ${it.incorrectText}${
      it.incorrectReasonKo ? ` — ${it.incorrectReasonKo}` : ""
    }\n`;
    out += `출처: ${
      it.sourceType === "analysis_required"
        ? "지문 분석지"
        : it.sourceType === "heuristic_supplement"
          ? "휴리스틱 보충"
          : "AI 보충"
    }\n\n`;
  }
  out += `【대응표 · ${title}】\n`;
  for (const it of items) {
    const p = it.analysisPointId ? byId.get(it.analysisPointId) : null;
    out += `${circledNumber(it.number)} [${it.correctText} / ${it.incorrectText}] ← ${
      p
        ? `${p.title} · example="${p.targetExpression}" · id=${p.analysisPointId}`
        : `(${it.sourceType ?? "unknown"})`
    }\n`;
  }
  return out;
}

async function runGenerationDemo() {
  const result = await generateWorkbookGrammarChoice({
    passages: [
      {
        projectId: "fixture-loa",
        title: "Law of Attraction",
        source: "fixture",
        sentences: loaSentences,
        analysisReport: loaReport,
        grammarChoiceCache: null,
      },
      {
        projectId: "fixture-mov",
        title: "Movement",
        source: "fixture",
        sentences: moveSentences,
        analysisReport: moveReport,
        grammarChoiceCache: null,
      },
    ],
  });

  assert.equal(result.skipped.length, 0, JSON.stringify(result.skipped));
  assert.equal(result.sections.length, 2);

  for (const section of result.sections) {
    const d = section.diagnostics!;
    console.log("\n==== DIAG", section.title, "====");
    console.log({
      analysisPointCount: d.analysisPointCount,
      corePointCount: d.corePointCount,
      convertibleCount: d.convertibleCount,
      analysisBasedCount: d.analysisBasedCount,
      aiSupplementCount: d.aiSupplementCount,
      coreReflectionRate: `${Math.round(d.coreReflectionRate * 100)}%`,
      originalMismatchCount: d.originalMismatchCount,
      bothPossibleCount: d.bothPossibleCount,
      lexicalExcludedCount: d.lexicalExcludedCount,
      finalCount: d.finalCount,
      passageRestored: d.passageRestored,
      openAiRequestCount: d.openAiRequestCount,
      exclusions: d.exclusions.map((e) => `${e.title}:${e.reason}`),
    });
    assert.equal(d.passageRestored, true);
    assert.equal(d.originalMismatchCount, 0);
    assert.ok(d.analysisBasedCount >= 5, section.title);
    assert.equal(d.coreReflectionRate, 1);

    const points = extractRequiredAnalysisPoints({
      report: section.title.includes("Attraction") ? loaReport : moveReport,
      sentences: section.title.includes("Attraction")
        ? loaSentences
        : moveSentences,
    });
    console.log(
      "\n" +
        renderStudentPassage(
          section.title,
          section.sourcePassage,
          section.items
        )
    );
    console.log("\n" + renderAnswerKey(section.title, section.items, points));

    for (const it of section.items) {
      assert.ok(tokenizeForWordOrder(it.correctText).length <= 7);
      assert.ok(!/are being hold/i.test(it.incorrectText));
    }
  }
}

runGenerationDemo()
  .then(() => {
    console.log("\nALL grammar-choice analysis-first tests passed");
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
