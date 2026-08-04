import {
  isBlankPunctuationOnly,
  type InputSizeHint,
  blankInputSizeHint,
} from "@/lib/exam-prep/korean-blank-normalize";

export type ExamKoreanBlank = {
  id: string;
  academy_id: string;
  passage_id: string;
  sentence_id: string;
  blank_order: number;
  answer_text: string;
  accepted_answers: string[];
  korean_start: number;
  korean_end: number;
  answer_snapshot: string;
  linked_vocabulary_mark_id: string | null;
  linked_english_text: string | null;
  linked_english_start: number | null;
  linked_english_end: number | null;
  linked_english_occurrence: number | null;
  hint: string | null;
  explanation: string | null;
  is_required: boolean;
  ignore_punctuation: boolean;
  flexible_spacing: boolean;
  created_at: string;
  updated_at: string;
};

/** 학생에게 내려주는 빈칸 (정답·해설 제외) */
export type ExamKoreanBlankPublic = {
  id: string;
  sentenceId: string;
  blankOrder: number;
  koreanStart: number;
  koreanEnd: number;
  linkedEnglishText: string | null;
  linkedEnglishOccurrence: number | null;
  hasHint: boolean;
  isRequired: boolean;
  inputSize: InputSizeHint;
};

export type Stage2BlankAnswerState = {
  value: string;
  isCorrect: boolean | null;
  attempts: number;
  hintUsed: boolean;
  answerRevealed: boolean;
  /** 정답 공개 후 표시용 (revealed일 때만 서버가 채움) */
  revealedAnswer?: string | null;
  hintText?: string | null;
};

export type ExamStage2Progress = {
  id: string;
  academy_id: string;
  assignment_student_id: string;
  passage_id: string;
  stage_number: number;
  answers: Record<string, Stage2BlankAnswerState>;
  correct_blank_ids: string[];
  incorrect_blank_ids: string[];
  completed_blank_ids: string[];
  attempt_count: number;
  hint_used_blank_ids: string[];
  revealed_answer_blank_ids: string[];
  score: number;
  progress_percent: number;
  revision: number;
  started_at: string;
  last_attempt_at: string | null;
  completed_at: string | null;
  created_at: string;
  updated_at: string;
};

export const STAGE2_DEFAULT_THRESHOLDS = {
  hintAfterWrong: 2,
  revealAfterWrong: 3,
} as const;

export type BlankDraft = {
  id?: string;
  sentence_id: string;
  blank_order: number;
  answer_text: string;
  accepted_answers: string[];
  korean_start: number;
  korean_end: number;
  linked_vocabulary_mark_id?: string | null;
  linked_english_text?: string | null;
  linked_english_start?: number | null;
  linked_english_end?: number | null;
  linked_english_occurrence?: number | null;
  hint?: string | null;
  explanation?: string | null;
  is_required?: boolean;
  ignore_punctuation?: boolean;
  flexible_spacing?: boolean;
};

export function toPublicBlank(b: ExamKoreanBlank): ExamKoreanBlankPublic {
  return {
    id: b.id,
    sentenceId: b.sentence_id,
    blankOrder: b.blank_order,
    koreanStart: b.korean_start,
    koreanEnd: b.korean_end,
    linkedEnglishText: b.linked_english_text,
    linkedEnglishOccurrence: b.linked_english_occurrence,
    hasHint: Boolean(b.hint?.trim()),
    isRequired: b.is_required,
    inputSize: blankInputSizeHint(b.answer_text.length),
  };
}

export function validateBlankAgainstKorean(
  koreanText: string,
  blank: Pick<
    BlankDraft,
    "korean_start" | "korean_end" | "answer_text"
  >
): string | null {
  const { korean_start: start, korean_end: end, answer_text: answer } = blank;
  if (start < 0 || end <= start) return "빈칸 범위가 올바르지 않습니다.";
  if (end > koreanText.length) return "빈칸 범위가 문장 길이를 초과합니다.";
  const slice = koreanText.slice(start, end);
  if (slice !== answer) {
    return `정답 「${answer}」가 현재 해석의 [${start},${end}) 「${slice}」와 일치하지 않습니다.`;
  }
  if (!answer.trim()) return "정답이 비어 있습니다.";
  if (!answer.trim() || /^\s+$/.test(answer)) return "공백만 빈칸으로 만들 수 없습니다.";
  if (isBlankPunctuationOnly(answer)) return "문장 부호만 빈칸으로 만들 수 없습니다.";
  return null;
}

export function findOverlappingBlanks(
  blanks: Array<{ korean_start: number; korean_end: number; id?: string }>
): string | null {
  const sorted = [...blanks].sort((a, b) => a.korean_start - b.korean_start);
  for (let i = 1; i < sorted.length; i++) {
    const prev = sorted[i - 1]!;
    const cur = sorted[i]!;
    if (cur.korean_start < prev.korean_end) {
      return `빈칸 범위가 겹칩니다 (${prev.korean_start}-${prev.korean_end} / ${cur.korean_start}-${cur.korean_end}).`;
    }
  }
  return null;
}

export function blankCoverageRatio(
  koreanText: string,
  blanks: Array<{ korean_start: number; korean_end: number }>
): number {
  if (!koreanText.length) return 0;
  let covered = 0;
  for (const b of blanks) {
    covered += Math.max(0, b.korean_end - b.korean_start);
  }
  return covered / koreanText.length;
}

export function buildKoreanWithBlankSlots(
  koreanText: string,
  blanks: Array<{ id: string; korean_start: number; korean_end: number }>
): Array<{ type: "text"; text: string } | { type: "blank"; blankId: string }> {
  const sorted = [...blanks].sort((a, b) => a.korean_start - b.korean_start);
  const out: Array<
    { type: "text"; text: string } | { type: "blank"; blankId: string }
  > = [];
  let cursor = 0;
  for (const b of sorted) {
    if (b.korean_start > cursor) {
      out.push({ type: "text", text: koreanText.slice(cursor, b.korean_start) });
    }
    out.push({ type: "blank", blankId: b.id });
    cursor = b.korean_end;
  }
  if (cursor < koreanText.length) {
    out.push({ type: "text", text: koreanText.slice(cursor) });
  }
  return out;
}
