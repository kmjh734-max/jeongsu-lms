/**
 * 워크북 6단계(어휘 고르기) — 지문 우선 분석
 *
 * 학평·내신 어휘고르기 표준 오답:
 * 1) 반의어·의미 방향 반전
 * 2) 철자·발음·형태가 비슷한 혼동어
 * 3) 문맥·연어만 미세하게 틀린 유의어형
 *
 * 흐름: 지문 전체 분석 → 문장별 [correct/wrong] 시드 → AI 출제
 */
import { questionGeneratorChatJsonWithRetry } from "@/lib/question-generator/openai";
import { workbookVocabChoiceCraft } from "@/lib/question-generator/choice-craft";
import {
  EXAM_PREP_MODEL_PRIMARY,
  getExamPrepPreferredModels,
  getExamPrepReasoningEffort,
} from "@/lib/exam-prep/exam-prep-openai";
import { STAGE6_VOCAB_SUBS } from "@/lib/exam-prep/stage6-types";

const VOCAB_SUB_SET = new Set<string>(STAGE6_VOCAB_SUBS);

export type VocabHitAnalysis = {
  sentenceId: string;
  vocabularySub: string;
  technique: "antonym" | "lookalike" | "context" | "collocation";
  koLabel: string;
  evidence: string;
  whyTestable: string;
  suggestedCorrect: string;
  suggestedWrong: string;
  priority: number;
};

export type PassageVocabAnalysis = {
  overallTopic: string;
  overallMainIdea: string;
  logicDirection: string;
  hits: VocabHitAnalysis[];
  focusBlock: string;
  rawError?: string;
};

type SeedSentence = {
  id: string;
  english_text: string;
  sentence_order: number;
  vocabulary?: unknown;
};

function normalizeSub(raw: string, technique: string): string {
  const s = raw.trim();
  if (VOCAB_SUB_SET.has(s)) return s;
  if (technique === "antonym") return "opposite_meaning";
  if (technique === "lookalike") return "similar_spelling";
  if (technique === "collocation") return "collocation";
  return "contextual_meaning";
}

function normalizeTechnique(
  raw: string
): VocabHitAnalysis["technique"] {
  const t = raw.toLowerCase();
  if (t.includes("look") || t.includes("spell") || t.includes("similar")) {
    return "lookalike";
  }
  if (t.includes("colloc")) return "collocation";
  if (t.includes("context") || t.includes("near")) return "context";
  return "antonym";
}

/**
 * 1단계: 문제를 만들기 전, 지문에서 어휘고르기 후보를 뽑는다.
 */
export async function analyzePassageVocabForWorkbook(opts: {
  sentences: SeedSentence[];
  grade?: string;
}): Promise<PassageVocabAnalysis> {
  const ordered = [...opts.sentences].sort(
    (a, b) => a.sentence_order - b.sentence_order
  );
  const fullPassage = ordered
    .map((s, i) => `[${s.id}|S${i + 1}] ${String(s.english_text ?? "").trim()}`)
    .join("\n");

  const empty: PassageVocabAnalysis = {
    overallTopic: "",
    overallMainIdea: "",
    logicDirection: "",
    hits: [],
    focusBlock: "",
  };

  if (!fullPassage.trim()) return empty;

  const system = `당신은 한국 고등 영어 내신·학력평가 **어휘 고르기** 출제위원이다.
역할: **최종 JSON 문항을 완성하지 말고**, 지문을 먼저 분석해 출제 후보만 고른다.

${workbookVocabChoiceCraft()}

분석 원칙:
1. 지문 전체 주제·논리 방향(긍정↑/부정↓, 증가/감소, 원인→결과 등)을 먼저 파악한다.
2. 각 문장에서 내용어(형용사·동사·부사·핵심 명사)를 고르고, 오답 기법을 지정한다.
3. 기법 배분: 전체 hit의 **약 40~50%는 antonym(반의)**, **30~40%는 lookalike(유사형태)**, 나머지는 context/collocation.
4. suggestedCorrect = 원문에 실제로 있는 부분문자열.
5. suggestedWrong = 같은 품사·시제·수. 문장에 끼워도 문법적으로는 자연스러워야 함.
6. 어법 함정(태·관계사·±s) 금지. 관사·be동사·주제 무관 단어 금지.
7. 가능하면 문장 수의 80% 이상에서 hit ≥1.

JSON만:
{
  "overallTopic":"한글 주제",
  "overallMainIdea":"한글 요지 1문장",
  "logicDirection":"이 지문의 어휘 논리 방향 한 줄 (예: 문제 악화→해결 필요)",
  "hits":[
    {
      "sentenceId":"...",
      "technique":"antonym|lookalike|context|collocation",
      "vocabularySub":"opposite_meaning|similar_spelling|contextual_meaning|collocation|positive_negative|increase_decrease|strengthen_weaken|word_form|other_vocabulary",
      "koLabel":"한글 유형명 (반의어/유사철자/문맥 등)",
      "evidence":"원문에서 근거가 되는 구",
      "whyTestable":"왜 이 쌍이 좋은지 한 줄",
      "suggestedCorrect":"원문 단어",
      "suggestedWrong":"오답 단어",
      "priority":1
    }
  ]
}`;

  const user = JSON.stringify({
    task: "analyze_passage_vocab_before_stage6",
    grade: opts.grade ?? "고1",
    modelHint: EXAM_PREP_MODEL_PRIMARY,
    requireMix:
      "antonym과 lookalike를 반드시 섞어라. 반의만 또는 유사철자만으로 채우지 마라.",
    requireCoverageNote:
      "문장 수의 80% 이상에서 hit를 찾고, 문장당 가능하면 1~2개.",
    fullPassage,
    sentences: ordered.map((s) => ({
      id: s.id,
      order: s.sentence_order,
      english: s.english_text,
      vocabularyHints: s.vocabulary ?? undefined,
    })),
  });

  try {
    const raw = (await questionGeneratorChatJsonWithRetry({
      system,
      user,
      temperature: 0.3,
      maxTokens: 8000,
      reasoningEffort: getExamPrepReasoningEffort(),
      preferredModels: getExamPrepPreferredModels(),
    })) as Record<string, unknown>;

    const hitsRaw = Array.isArray(raw.hits) ? raw.hits : [];
    const hits: VocabHitAnalysis[] = [];

    for (const h of hitsRaw) {
      if (!h || typeof h !== "object") continue;
      const o = h as Record<string, unknown>;
      const sentenceId = String(o.sentenceId ?? "").trim();
      if (!ordered.some((s) => s.id === sentenceId)) continue;
      const technique = normalizeTechnique(String(o.technique ?? ""));
      const correct = String(o.suggestedCorrect ?? o.evidence ?? "").trim();
      const wrong = String(o.suggestedWrong ?? "").trim();
      if (!correct || !wrong) continue;
      if (correct.toLowerCase() === wrong.toLowerCase()) continue;
      hits.push({
        sentenceId,
        technique,
        vocabularySub: normalizeSub(String(o.vocabularySub ?? ""), technique),
        koLabel: String(o.koLabel ?? technique).trim() || technique,
        evidence: String(o.evidence ?? correct).trim(),
        whyTestable: String(o.whyTestable ?? "").trim(),
        suggestedCorrect: correct,
        suggestedWrong: wrong,
        priority: Number(o.priority) || 1,
      });
    }

    const antonymN = hits.filter((h) => h.technique === "antonym").length;
    const lookalikeN = hits.filter((h) => h.technique === "lookalike").length;

    const focusLines = [
      "이번 지문 어휘 분석 (반의·유사형태 우선 · 이 쌍을 시드로 출제):",
      `논리 방향: ${String(raw.logicDirection ?? "").trim() || "(미기재)"}`,
      `기법 분포: 반의 ${antonymN} · 유사형태 ${lookalikeN} · 기타 ${hits.length - antonymN - lookalikeN}`,
      ...hits
        .sort((a, b) => a.priority - b.priority)
        .slice(0, 20)
        .map(
          (h, i) =>
            `${i + 1}. [${h.technique}/${h.vocabularySub}] ${h.koLabel} @${h.sentenceId}` +
            `\n   pair: ${h.suggestedCorrect} / ${h.suggestedWrong}` +
            `\n   evidence: ${h.evidence}` +
            (h.whyTestable ? `\n   why: ${h.whyTestable}` : "")
        ),
    ];

    return {
      overallTopic: String(raw.overallTopic ?? ""),
      overallMainIdea: String(raw.overallMainIdea ?? ""),
      logicDirection: String(raw.logicDirection ?? ""),
      hits,
      focusBlock: hits.length > 0 ? focusLines.join("\n") : "",
    };
  } catch (e) {
    return {
      ...empty,
      rawError: e instanceof Error ? e.message : "지문 어휘 분석 실패",
    };
  }
}

export function analysisVocabHitsToSeedBlanks(
  analysis: PassageVocabAnalysis
): Array<{
  sentenceId: string;
  correct: string;
  wrong: string;
  vocabularySub: string;
  questionKind: "vocabulary";
  koLabel: string;
  koTip: string;
}> {
  return analysis.hits.map((h) => ({
    sentenceId: h.sentenceId,
    correct: h.suggestedCorrect,
    wrong: h.suggestedWrong,
    vocabularySub: h.vocabularySub,
    questionKind: "vocabulary" as const,
    koLabel: h.koLabel,
    koTip: h.whyTestable || `${h.technique}: ${h.evidence}`,
  }));
}
