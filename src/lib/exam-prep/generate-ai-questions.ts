import { questionGeneratorChatJson } from "@/lib/question-generator/openai";
import {
  generateRuleBasedQuestions,
  type GeneratedQuestionDraft,
} from "@/lib/exam-prep/generate-rule-questions";
import { workbookPromptForStepType } from "@/lib/exam-prep/presets";
import { EXAM_STEP_LABELS, type ExamPassageSentence, type ExamStepType } from "@/lib/exam-prep/types";

type AiQuestionRaw = {
  sentenceId?: string | null;
  questionText?: string;
  questionData?: Record<string, unknown>;
  correctAnswer?: unknown;
  acceptableAnswers?: unknown;
  explanation?: string | null;
  points?: number;
  difficulty?: string;
};

function sentencePayload(sentences: ExamPassageSentence[]) {
  return sentences.map((s) => ({
    id: s.id,
    order: s.sentence_order,
    english: s.english_text,
    korean: s.korean_text,
    isImportantWriting: s.is_important_writing,
  }));
}

function systemPrompt(stepType: ExamStepType): string {
  const label = EXAM_STEP_LABELS[stepType] ?? stepType;
  const workbookPrompt =
    workbookPromptForStepType(stepType) ?? "문제를 풀어 보세요.";
  return `당신은 인천광역시 교육청 학력평가 10단계 WORKBOOK 형식의 내신 대비 출제 전문가다.
단계: ${stepType} (${label})
학생 발문(그대로 questionText에 사용): "${workbookPrompt}"

절대 규칙:
1. 원문(english)을 바꾸거나 새 지문을 만들지 않는다. 제공 문장만 사용.
2. 반드시 JSON만: {"questions":[...]}
3. sentenceId는 입력 문장 id만. paragraph_order는 null 가능.
4. questionText는 위 학생 발문을 우선 사용.
5. 학생용 questionData에 정답 문자열을 넣지 말 것.

스키마:
- comprehension: { english, korean, vocabulary?, grammar_points? }, correctAnswer:{confirmed:true}
- korean_blank: { displayText(우리말 ____), englishHint, blanks:[{id,answer,acceptableAnswers}] }
- english_blank: { displayText(영문 ____), koreanHint, blanks:[...] }
- translation_practice: { english }, correctAnswer:{text:우리말}
- verb_form: { displayText(동사 자리를 (  ) 또는 ____), baseForm, blanks:[{id,answer}] }
- grammar_vocab_choice: 인천 WORKBOOK 6단계처럼 영문 안 [a / b] 2지 선택(문장당 여러 개 가능). { displayText:"… [been dumping / been dumped] … [where / that] …", format:"inline_ab", koreanHint, choiceBlanks:[{id, options:[{id,text}] 정확히 2개, correctOptionId}], options:첫슬롯2개 }. correctAnswer:{ selections:{blankId:optionId}, optionId:첫슬롯 }
- error_correction: HWP 7단계처럼 한 문장에 오류 밑줄 여러 개. { corruptedText, fixTargets:[{wrong,correct}] }, correctAnswer:{ text:원문, fixes:[...] }. 가능하면 어색한 곳 3개.
- sentence_order: 인천 WORKBOOK 8단계처럼 우리말 + 고정영문 + (어구 / 어구 / …) 형식. { format:"pdf_phrase_reorder", displayText:"To Whom…\n(where / been / not permitted / …)", koreanHint, items:[{id,text}] 어구 카드(섞인 순), correctOrder:정답 id 배열 }
- paragraph_order: { items:[{id,text}], mode:"sentence" }, correctAnswer:{order:[]}
- writing: { koreanPrompt, cueWords:string[] }, correctAnswer:{text:원문}

문항 수: 문장별 출제(핵심 문장 우선). paragraph_order는 1문항.`;
}

function normalizeAiQuestions(
  stepType: ExamStepType,
  raw: unknown,
  sentences: ExamPassageSentence[],
  difficulty: string
): GeneratedQuestionDraft[] {
  if (!raw || typeof raw !== "object") return [];
  const list = (raw as { questions?: unknown }).questions;
  if (!Array.isArray(list)) return [];

  const byId = new Map(sentences.map((s) => [s.id, s]));
  const out: GeneratedQuestionDraft[] = [];
  let order = 1;

  for (const item of list) {
    if (!item || typeof item !== "object") continue;
    const q = item as AiQuestionRaw;
    const sid =
      typeof q.sentenceId === "string" && byId.has(q.sentenceId)
        ? q.sentenceId
        : stepType === "paragraph_order"
          ? null
          : sentences[0]?.id ?? null;

    const data =
      q.questionData && typeof q.questionData === "object"
        ? { ...(q.questionData as Record<string, unknown>) }
        : {};

    // 빈칸 메타가 correctAnswer에만 있으면 question_data로 복제
    if (
      (stepType === "english_blank" ||
        stepType === "korean_blank" ||
        stepType === "verb_form") &&
      !Array.isArray(data.blanks) &&
      q.correctAnswer &&
      typeof q.correctAnswer === "object" &&
      Array.isArray((q.correctAnswer as { blanks?: unknown }).blanks)
    ) {
      data.blanks = (q.correctAnswer as { blanks: unknown[] }).blanks;
    }

    if (!isPlausibleQuestion(stepType, data, q.correctAnswer)) continue;

    out.push({
      sentence_id: sid,
      question_type: stepType,
      question_order: order++,
      question_text:
        (typeof q.questionText === "string" && q.questionText.trim()) ||
        defaultPrompt(stepType),
      question_data: data,
      correct_answer: q.correctAnswer ?? null,
      acceptable_answers: q.acceptableAnswers ?? null,
      explanation:
        typeof q.explanation === "string" ? q.explanation : null,
      difficulty:
        typeof q.difficulty === "string" && q.difficulty
          ? q.difficulty
          : difficulty,
      points:
        typeof q.points === "number" && q.points > 0
          ? Math.min(10, Math.round(q.points))
          : defaultPoints(stepType),
      ai_generated: true,
    });
  }

  return out;
}

function defaultPrompt(stepType: ExamStepType): string {
  return (
    workbookPromptForStepType(stepType) ??
    EXAM_STEP_LABELS[stepType] ??
    "문제를 풀어 주세요."
  );
}

function defaultPoints(stepType: ExamStepType): number {
  if (stepType === "paragraph_order") return 3;
  if (stepType === "writing" || stepType === "translation_practice") return 2;
  if (stepType === "error_correction") return 2;
  return 1;
}

function isPlausibleQuestion(
  stepType: ExamStepType,
  data: Record<string, unknown>,
  correct: unknown
): boolean {
  switch (stepType) {
    case "comprehension":
      return Boolean(data.english);
    case "korean_blank":
    case "english_blank":
    case "verb_form":
      return (
        typeof data.displayText === "string" &&
        Array.isArray(data.blanks) &&
        data.blanks.length > 0
      );
    case "translation_practice":
      return typeof data.english === "string";
    case "grammar_vocab_choice":
      return (
        (Array.isArray(data.choiceBlanks) && data.choiceBlanks.length >= 1) ||
        (Array.isArray(data.options) &&
          data.options.length >= 2 &&
          correct != null)
      );
    case "error_correction":
      return typeof data.corruptedText === "string" && correct != null;
    case "sentence_order":
    case "paragraph_order":
      return Array.isArray(data.items) && data.items.length >= 2;
    case "writing":
      return typeof data.koreanPrompt === "string" || Array.isArray(data.cueWords);
    default:
      return Object.keys(data).length > 0;
  }
}

export type GenerateStepQuestionsResult = {
  questions: GeneratedQuestionDraft[];
  source: "ai" | "rule";
  aiError?: string;
};

/**
 * AI 문항 생성 → 변형 세트는 QG 엔진, 그 외는 JSON/규칙 폴백.
 */
export async function generateStepQuestionsWithAi(
  stepType: ExamStepType | string,
  sentences: ExamPassageSentence[],
  difficulty = "medium",
  opts?: {
    passageText?: string;
    settings?: Record<string, unknown> | null;
    grade?: string;
    sourceDetail?: string;
  }
): Promise<GenerateStepQuestionsResult> {
  const type = stepType as ExamStepType;

  if (String(stepType).startsWith("variant_")) {
    const passageText =
      opts?.passageText?.trim() ||
      sentences.map((s) => s.english_text).join(" ");
    const { generateVariantQuestionsForStep } = await import(
      "@/lib/exam-prep/generate-variant-questions"
    );
    const result = await generateVariantQuestionsForStep({
      stepType,
      passageText,
      difficulty,
      settings: opts?.settings,
      grade: opts?.grade,
      sourceDetail: opts?.sourceDetail,
    });
    if (result.questions.length === 0) {
      return {
        questions: [],
        source: "rule",
        aiError: result.errors.join("; ") || "변형 문항 생성 실패",
      };
    }
    return {
      questions: result.questions,
      source: "ai",
      aiError: result.errors.length ? result.errors.join("; ") : undefined,
    };
  }

  const fallback = () => ({
    questions: generateRuleBasedQuestions(type, sentences, difficulty).map(
      (q) => ({ ...q, ai_generated: false })
    ),
    source: "rule" as const,
  });

  if (!process.env.OPENAI_API_KEY?.trim()) {
    return { ...fallback(), aiError: "OPENAI_API_KEY 없음" };
  }
  if (!sentences.length) {
    return { questions: [], source: "rule", aiError: "문장 없음" };
  }

  try {
    const raw = await questionGeneratorChatJson({
      system: systemPrompt(type),
      user: JSON.stringify(
        {
          stepType: type,
          label: EXAM_STEP_LABELS[type] ?? type,
          difficulty,
          sentences: sentencePayload(sentences),
          instruction:
            "위 문장만 사용해 questions 배열을 작성하세요. 원문을 임의로 바꾸지 마세요.",
        },
        null,
        2
      ),
      temperature: 0.4,
      maxTokens: 6000,
    });

    const normalized = normalizeAiQuestions(type, raw, sentences, difficulty);
    if (normalized.length === 0) {
      return { ...fallback(), aiError: "AI 문항 검증 실패" };
    }
    return { questions: normalized, source: "ai" };
  } catch (e) {
    return {
      ...fallback(),
      aiError: e instanceof Error ? e.message : "AI 생성 실패",
    };
  }
}
