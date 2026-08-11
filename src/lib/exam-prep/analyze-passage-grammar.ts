/**
 * 워크북 5단계(어법 고르기) — 지문 우선 분석
 *
 * 교재 반영:
 * - 고등 영어 어법서술형 GRAMMAR POINT 01–15
 * - 어법끝(개정) START UNIT/Point/CASE
 * - 처음 만나는 수능 어법 스타터(입문) UNIT 01–13
 *
 * 흐름: 지문 전체 분석 → 단원·CASE·문장 매핑 → [a/b] 출제
 */
import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import {
  GRAMMAR_HARD_BANS,
  GRAMMAR_TEXTBOOK_TITLES,
  GRAMMAR_UNIT_BANKS,
  grammarCatalogPromptBlock,
  pickGrammarFocus,
} from "@/lib/question-generator/grammar-catalog";
import {
  EXAM_PREP_MODEL_PRIMARY,
  getExamPrepPreferredModels,
  getExamPrepReasoningEffort,
} from "@/lib/exam-prep/exam-prep-openai";

/** 고등영어 어법서술형 교사용 — GRAMMAR POINT 01~15 */
export const SEOSULHYEONG_GRAMMAR_POINTS: Array<{
  point: number;
  title: string;
  unitKeys: string[];
}> = [
  { point: 1, title: "동사의 시제와 태", unitKeys: ["tense", "voice"] },
  { point: 2, title: "조동사", unitKeys: ["modal"] },
  { point: 3, title: "to부정사", unitKeys: ["verbal"] },
  { point: 4, title: "동명사", unitKeys: ["verbal"] },
  { point: 5, title: "분사구문", unitKeys: ["participle"] },
  { point: 6, title: "주의해야 할 분사구문", unitKeys: ["participle"] },
  { point: 7, title: "상관 접속사 · 명사절 접속사", unitKeys: ["prepconj"] },
  { point: 8, title: "부사절 접속사", unitKeys: ["prepconj"] },
  { point: 9, title: "관계대명사", unitKeys: ["relative"] },
  { point: 10, title: "관계부사 · 복합관계사", unitKeys: ["relative"] },
  { point: 11, title: "가정법", unitKeys: ["subjunctive"] },
  {
    point: 12,
    title: "5형식 / 가주어 · 가목적어 it",
    unitKeys: ["special", "verbal"],
  },
  { point: 13, title: "도치 · 강조 · 생략", unitKeys: ["special"] },
  { point: 14, title: "비교", unitKeys: ["compare"] },
  { point: 15, title: "수 일치", unitKeys: ["sv", "noun"] },
];

export type GrammarHitAnalysis = {
  sentenceId: string;
  unitKey: string;
  caseId: string;
  seosulPoint: number | null;
  koLabel: string;
  evidence: string;
  whyTestable: string;
  suggestedCorrect: string;
  suggestedWrong: string;
  priority: number;
};

export type PassageGrammarAnalysis = {
  overallTopic: string;
  overallMainIdea: string;
  hits: GrammarHitAnalysis[];
  focusBlock: string;
  textbooksUsed: string[];
  rawError?: string;
};

type SeedSentence = {
  id: string;
  english_text: string;
  sentence_order: number;
};

function syllabusBlock(): string {
  const seosul = SEOSULHYEONG_GRAMMAR_POINTS.map(
    (p) =>
      `  GP${String(p.point).padStart(2, "0")} ${p.title} → units:${p.unitKeys.join(",")}`
  ).join("\n");

  const units = GRAMMAR_UNIT_BANKS.map((u) => {
    const cases = u.cases
      .slice(0, 4)
      .map(
        (c) =>
          `    - ${c.id}: ${c.name} | pairs:${c.pairForms} | plant:${c.plant}`
      )
      .join("\n");
    return `  [${u.key}] ${u.title} (어법끝U${u.eobeopUnit ?? "-"}/처음U${u.cheoeumUnit ?? "-"})\n${cases}`;
  }).join("\n");

  return `교재 실라버스 (반드시 이 범위만 출제):
${GRAMMAR_TEXTBOOK_TITLES.map((t) => `· ${t}`).join("\n")}

[고등 영어 어법서술형] GRAMMAR POINT 01–15
${seosul}

[어법끝 START · 처음 만나는 수능 어법] UNIT×CASE
${units}

금지:
${GRAMMAR_HARD_BANS.map((b) => `✗ ${b}`).join("\n")}`;
}

/**
 * 1단계: 지문을 교재 단원 기준으로 분석 (문제 만들기 전)
 */
export async function analyzePassageGrammarForWorkbook(opts: {
  sentences: SeedSentence[];
  grade?: string;
}): Promise<PassageGrammarAnalysis> {
  const ordered = [...opts.sentences].sort(
    (a, b) => a.sentence_order - b.sentence_order
  );
  const fullPassage = ordered
    .map((s, i) => `[${s.id}|S${i + 1}] ${String(s.english_text ?? "").trim()}`)
    .join("\n");

  const focus = pickGrammarFocus(Math.min(5, Math.max(3, ordered.length)));
  const empty: PassageGrammarAnalysis = {
    overallTopic: "",
    overallMainIdea: "",
    hits: [],
    focusBlock: focus.focusBlock,
    textbooksUsed: [...GRAMMAR_TEXTBOOK_TITLES],
  };

  if (!fullPassage.trim()) return empty;

  const system = `당신은 고등 영어 내신·학력평가 어법 출제위원이다.
역할: **문제를 만들지 말고**, 지문을 먼저 분석해 출제 가능한 어법 포인트만 고른다.

${syllabusBlock()}

${grammarCatalogPromptBlock()}

분석 원칙 (교재 반영):
1. 지문 전체를 읽고 주제·논리를 파악한다.
2. 각 문장에서 어법끝 CASE / 처음만나는 Point / 어법서술형 GP와 맞는 **실제 구조**만 잡는다.
3. 단순 인접 is/are 함정, 철자 장난, 어휘 의미 함정은 제외.
4. 수일치(GP15/UNIT01)는 지문 전체에서 우선순위 높게 최대 1~2개.
5. 문장마다 가능한 포인트를 찾되, 없으면 억지로 만들지 않는다.
6. suggestedCorrect는 원문 부분문자열, suggestedWrong은 CASE 메커니즘 오답.

JSON만:
{
  "overallTopic":"한글 주제",
  "overallMainIdea":"한글 요지 1문장",
  "hits":[
    {
      "sentenceId":"...",
      "unitKey":"sv|voice|relative|...",
      "caseId":"카탈로그 case id 또는 gpNN",
      "seosulPoint":1,
      "koLabel":"한글 문법명",
      "evidence":"원문에서 근거가 되는 구",
      "whyTestable":"왜 내신 어법으로 좋은지 한 줄",
      "suggestedCorrect":"원문 형태",
      "suggestedWrong":"오답 형태",
      "priority":1
    }
  ]
}`;

  const user = JSON.stringify({
    task: "analyze_passage_grammar_before_stage5",
    grade: opts.grade ?? "고1",
    modelHint: EXAM_PREP_MODEL_PRIMARY,
    textbooks: GRAMMAR_TEXTBOOK_TITLES,
    focusHint: focus.focusBlock,
    requireCoverageNote:
      "가능하면 서로 다른 unitKey를 쓰고, 문장 수의 70% 이상에서 hit를 찾아라.",
    fullPassage,
    sentences: ordered.map((s) => ({
      id: s.id,
      order: s.sentence_order,
      english: s.english_text,
    })),
  });

  try {
    const raw = (await questionGeneratorChatJsonWithRetry({
      system,
      user,
      temperature: 0.2,
      maxTokens: 7000,
      reasoningEffort: getExamPrepReasoningEffort(),
      preferredModels: getExamPrepPreferredModels(),
    })) as Record<string, unknown>;

    const hitsRaw = Array.isArray(raw.hits) ? raw.hits : [];
    const hits: GrammarHitAnalysis[] = [];
    const knownUnits = new Set(GRAMMAR_UNIT_BANKS.map((u) => u.key));

    for (const h of hitsRaw) {
      if (!h || typeof h !== "object") continue;
      const o = h as Record<string, unknown>;
      const sentenceId = String(o.sentenceId ?? "").trim();
      if (!ordered.some((s) => s.id === sentenceId)) continue;
      let unitKey = String(o.unitKey ?? "").trim();
      if (!knownUnits.has(unitKey)) {
        const gp = Number(o.seosulPoint);
        const mapped = SEOSULHYEONG_GRAMMAR_POINTS.find((p) => p.point === gp);
        unitKey = mapped?.unitKeys[0] ?? "special";
      }
      const correct = String(o.suggestedCorrect ?? o.evidence ?? "").trim();
      const wrong = String(o.suggestedWrong ?? "").trim();
      if (!correct || !wrong) continue;
      hits.push({
        sentenceId,
        unitKey,
        caseId: String(o.caseId ?? `gp${o.seosulPoint ?? "?"}`).trim(),
        seosulPoint:
          o.seosulPoint != null && Number.isFinite(Number(o.seosulPoint))
            ? Number(o.seosulPoint)
            : null,
        koLabel: String(o.koLabel ?? unitKey).trim() || unitKey,
        evidence: String(o.evidence ?? correct).trim(),
        whyTestable: String(o.whyTestable ?? "").trim(),
        suggestedCorrect: correct,
        suggestedWrong: wrong,
        priority: Number(o.priority) || 1,
      });
    }

    // 분석 결과를 focusBlock으로 재구성 → 출제 프롬프트에 주입
    const focusLines = [
      "이번 지문 분석 결과 (교재 매핑 · 이 포인트만 우선 출제):",
      ...hits
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 16)
        .map(
          (h, i) =>
            `${i + 1}. [${h.unitKey}${h.seosulPoint ? `/GP${h.seosulPoint}` : ""}] ${h.koLabel} @${h.sentenceId}` +
            `\n   evidence: ${h.evidence}` +
            `\n   pair: ${h.suggestedCorrect} / ${h.suggestedWrong}` +
            (h.whyTestable ? `\n   why: ${h.whyTestable}` : "")
        ),
    ];

    return {
      overallTopic: String(raw.overallTopic ?? ""),
      overallMainIdea: String(raw.overallMainIdea ?? ""),
      hits,
      focusBlock:
        hits.length > 0
          ? focusLines.join("\n")
          : focus.focusBlock,
      textbooksUsed: [
        "고등 영어 어법서술형 (GRAMMAR POINT 01–15)",
        ...GRAMMAR_TEXTBOOK_TITLES,
      ],
    };
  } catch (e) {
    return {
      ...empty,
      rawError: e instanceof Error ? e.message : "지문 어법 분석 실패",
    };
  }
}

export function analysisHitsToSeedBlanks(
  analysis: PassageGrammarAnalysis
): Array<{
  sentenceId: string;
  correct: string;
  wrong: string;
  grammarSub: string;
  koLabel: string;
  koTip: string;
}> {
  return analysis.hits.map((h) => ({
    sentenceId: h.sentenceId,
    correct: h.suggestedCorrect,
    wrong: h.suggestedWrong,
    grammarSub: h.unitKey,
    koLabel: h.koLabel,
    koTip: h.whyTestable || h.evidence,
  }));
}
