import { questionGeneratorChatJson } from "@/lib/question-generator/openai";
import {
  generateRuleBasedQuestions,
  type GeneratedQuestionDraft,
} from "@/lib/exam-prep/generate-rule-questions";
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
  return `당신은 한국 중고등 영어 내신 대비 문제 출제 전문가다.
단계 유형: ${stepType} (${label})

절대 규칙:
1. 원문(english) 문장 내용을 바꾸거나 요약·의역해 새 지문을 만들지 않는다.
2. 빈칸/배열/오류는 제공된 문장만 사용해 출제한다.
3. 반드시 JSON만 출력한다. 형식: {"questions":[...]}
4. sentenceId는 입력 문장 id만 사용한다. 해당 없으면 null.
5. 학생용 questionData에는 정답 문자열을 노출하지 말 것. 정답은 correctAnswer / blanks[].answer 에만.

유형별 questionData 스키마:
- comprehension: { english, korean, vocabulary?, grammar_points? }, correctAnswer: { confirmed: true }
- korean_blank: { displayText(우리말 빈칸), englishHint, blanks:[{id,answer,acceptableAnswers}] }
- english_blank: { displayText(영문 ____), koreanHint, blanks:[...] }
- translation_practice: { english }, correctAnswer: { text: 우리말 }, acceptableAnswers: string[]
- verb_form: { displayText, baseForm, koreanHint?, blanks:[{id,answer,acceptableAnswers}] }
- grammar_vocab_choice: { displayText, options:[{id,text}] 4개, choiceKind:"grammar"|"vocab" }, correctAnswer: { optionId }
- error_correction: { corruptedText, koreanHint? }, correctAnswer: { text: 올바른 원문 }
- sentence_order: { items:[{id,text}], koreanHint? }, correctAnswer: { order: string[] }
- paragraph_order: { items:[{id,text}], mode:"sentence" }, correctAnswer: { order: string[] } (문장 여러 개 배열, sentenceId null)
- writing: { koreanPrompt, cueWords:string[] }, correctAnswer: { text: 원문 영문 }

문항 수: 문장이 많으면 핵심 5~12개. paragraph_order는 보통 1문항. comprehension은 문장마다 1개도 가능.
난이도에 맞게 빈칸 수·오답 매력도를 조절한다.`;
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
  switch (stepType) {
    case "comprehension":
      return "영문과 해석을 읽고 이해했으면 확인하세요.";
    case "korean_blank":
      return "영문을 보고 우리말 해석의 빈칸을 채우세요.";
    case "english_blank":
      return "우리말 해석을 참고하여 영문 빈칸을 채우세요.";
    case "translation_practice":
      return "영어 문장을 우리말로 해석하세요.";
    case "verb_form":
      return "동사 기본형을 문맥에 맞게 활용하세요.";
    case "grammar_vocab_choice":
      return "문맥에 알맞은 표현을 고르세요.";
    case "error_correction":
      return "어색한 부분을 찾아 올바른 문장으로 고쳐 쓰세요.";
    case "sentence_order":
      return "조각을 올바른 순서로 배열하세요.";
    case "paragraph_order":
      return "문장(문단)을 흐름에 맞게 배열하세요.";
    case "writing":
      return "제시어를 사용하여 영어 문장을 쓰세요.";
    default:
      return "문제를 풀어 주세요.";
  }
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
        Array.isArray(data.options) &&
        data.options.length >= 2 &&
        correct != null
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
