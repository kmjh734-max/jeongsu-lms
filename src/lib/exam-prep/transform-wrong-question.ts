import type {
  ExamStepType,
  ExamWorkbookQuestion,
  ExamWorkbookQuestionPublic,
} from "@/lib/exam-prep/types";
import { sanitizeQuestionDataForStudent } from "@/lib/exam-prep/strip-answers";

/** 오답 재연습 시 다른 유형으로 변환 우선순위 */
const TRANSFORM_MAP: Partial<Record<string, ExamStepType>> = {
  grammar_vocab_choice: "english_blank",
  english_blank: "error_correction",
  korean_blank: "translation_practice",
  translation_practice: "english_blank",
  verb_form: "grammar_vocab_choice",
  error_correction: "english_blank",
  sentence_order: "english_blank",
  paragraph_order: "sentence_order",
  writing: "english_blank",
  comprehension: "english_blank",
};

export type WrongPracticeQuestion = ExamWorkbookQuestionPublic & {
  /** 변환된 연습 유형 (원본과 다를 수 있음) */
  practice_type: string;
  /** 채점용 — 클라이언트에 내려보내지 않음(서버만) */
  _correct_answer?: unknown;
  _acceptable_answers?: unknown;
};

/**
 * 오답 문항을 다른 유형 연습 문제로 변환.
 * 변환 불가하면 원본 유형 그대로(정답 제거).
 */
export function transformWrongQuestionForPractice(
  q: ExamWorkbookQuestion,
  mode: "same" | "transform" = "transform"
): WrongPracticeQuestion {
  const targetType =
    mode === "transform"
      ? TRANSFORM_MAP[q.question_type] ?? q.question_type
      : q.question_type;

  let question_data = { ...(q.question_data ?? {}) };
  let question_text = q.question_text;
  let practice_type = q.question_type;
  let correct_answer = q.correct_answer;
  let acceptable_answers = q.acceptable_answers;

  if (targetType !== q.question_type) {
    const converted = convertQuestion(q, targetType as ExamStepType);
    if (converted) {
      question_data = converted.question_data;
      question_text = converted.question_text;
      practice_type = targetType;
      correct_answer = converted.correct_answer;
      acceptable_answers = converted.acceptable_answers;
    }
  }

  const publicQ: ExamWorkbookQuestionPublic = {
    id: q.id,
    academy_id: q.academy_id,
    workbook_id: q.workbook_id,
    step_id: q.step_id,
    sentence_id: q.sentence_id,
    question_type: practice_type,
    question_order: q.question_order,
    question_text,
    question_data: sanitizeQuestionDataForStudent(practice_type, question_data),
    explanation: null,
    difficulty: q.difficulty,
    points: q.points,
    is_active: q.is_active,
    ai_generated: q.ai_generated,
    created_at: q.created_at,
    updated_at: q.updated_at,
  };

  return {
    ...publicQ,
    practice_type,
    _correct_answer: correct_answer,
    _acceptable_answers: acceptable_answers,
  };
}

function convertQuestion(
  q: ExamWorkbookQuestion,
  target: ExamStepType
): {
  question_text: string;
  question_data: Record<string, unknown>;
  correct_answer: unknown;
  acceptable_answers: unknown;
} | null {
  const data = q.question_data ?? {};
  const english =
    (typeof data.english === "string" && data.english) ||
    (typeof data.displayText === "string" &&
    !String(data.displayText).includes("____")
      ? String(data.displayText)
      : null) ||
    (typeof data.corruptedText === "string" ? null : null) ||
    extractEnglishFromAnswer(q);

  if (target === "english_blank" && english) {
    const words = english.split(/\s+/).filter(Boolean);
    if (words.length < 3) return null;
    const idx = Math.min(2, words.length - 1);
    const w = words[idx]!;
    const core = w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "") || w;
    const display = words.map((x, i) => (i === idx ? "____" : x)).join(" ");
    const blanks = [
      {
        id: "blank_1",
        answer: core,
        acceptableAnswers: [core, core.toLowerCase()],
      },
    ];
    return {
      question_text: "빈칸에 알맞은 영어 단어를 쓰세요. (오답 변형 연습)",
      question_data: {
        displayText: display,
        koreanHint: data.koreanHint ?? data.korean ?? null,
        blanks: blanks.map(({ id }) => ({ id })),
      },
      correct_answer: { blanks },
      acceptable_answers: blanks.map((b) => b.acceptableAnswers),
    };
  }

  if (target === "error_correction" && english) {
    const words = english.split(/\s+/).filter(Boolean);
    if (words.length < 3) return null;
    const idx = Math.min(1, words.length - 1);
    const core =
      words[idx]!.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "") || words[idx]!;
    const wrong = /s$/i.test(core) ? core.replace(/s$/i, "") : `${core}s`;
    const corrupted = words
      .map((w, i) => {
        if (i !== idx) return w;
        const lead = w.match(/^[^A-Za-z']+/)?.[0] ?? "";
        const trail = w.match(/[^A-Za-z']+$/)?.[0] ?? "";
        return `${lead}${wrong}${trail}`;
      })
      .join(" ");
    return {
      question_text: "어색한 부분을 고쳐 올바른 문장으로 쓰세요. (오답 변형)",
      question_data: {
        corruptedText: corrupted,
        koreanHint: data.koreanHint ?? data.korean ?? null,
      },
      correct_answer: { text: english },
      acceptable_answers: [english],
    };
  }

  if (target === "translation_practice" && english) {
    return {
      question_text: "영어 문장을 우리말로 해석하세요. (오답 변형)",
      question_data: { english },
      correct_answer: {
        text:
          typeof data.koreanHint === "string"
            ? data.koreanHint
            : typeof data.korean === "string"
              ? data.korean
              : "",
      },
      acceptable_answers: [],
    };
  }

  if (target === "grammar_vocab_choice" && english) {
    const words = english.split(/\s+/).filter(Boolean);
    const content = words
      .map((w) => w.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, ""))
      .filter((c) => c.length >= 3);
    if (content.length < 2) return null;
    const targetWord = content[0]!;
    const distractor = content[1] ?? `${targetWord}s`;
    const display = english.replace(
      new RegExp(`\\b${targetWord.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`),
      "____"
    );
    return {
      question_text: "문맥에 알맞은 말을 고르세요. (오답 변형)",
      question_data: {
        displayText: display,
        options: [
          { id: "a", text: targetWord },
          { id: "b", text: distractor },
          { id: "c", text: `${targetWord}ing` },
          { id: "d", text: `${distractor}ed` },
        ],
        choiceKind: "vocab",
      },
      correct_answer: { optionId: "a" },
      acceptable_answers: ["a"],
    };
  }

  return null;
}

function extractEnglishFromAnswer(q: ExamWorkbookQuestion): string | null {
  const ca = q.correct_answer;
  if (typeof ca === "string" && /[A-Za-z]/.test(ca)) return ca;
  if (ca && typeof ca === "object" && "text" in ca) {
    const t = String((ca as { text: unknown }).text ?? "");
    if (/[A-Za-z]/.test(t)) return t;
  }
  const data = q.question_data ?? {};
  if (typeof data.english === "string") return data.english;
  if (typeof data.englishHint === "string") return data.englishHint;
  if (Array.isArray(data.items)) {
    return (data.items as Array<{ text?: string }>)
      .map((it) => it.text ?? "")
      .filter(Boolean)
      .join(" ");
  }
  return null;
}

export function toPublicWrongPractice(
  q: WrongPracticeQuestion
): ExamWorkbookQuestionPublic & { practice_type: string } {
  const {
    _correct_answer: _c,
    _acceptable_answers: _a,
    ...rest
  } = q;
  return rest;
}
