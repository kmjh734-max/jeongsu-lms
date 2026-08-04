import {
  blankInputSizeHint,
  type InputSizeHint,
} from "@/lib/exam-prep/korean-blank-normalize";
import {
  isEnglishBlankPunctuationOnly,
  isPartialWordCut,
} from "@/lib/exam-prep/english-blank-normalize";
import {
  findOverlappingBlanks,
  type Stage2BlankAnswerState,
} from "@/lib/exam-prep/stage2-types";

export type ExamStage3Blank = {
  id: string;
  academy_id: string;
  passage_id: string;
  sentence_id: string;
  stage_number: 3;
  target_language: "en";
  blank_order: number;
  answer_text: string;
  accepted_answers: string[];
  english_start: number;
  english_end: number;
  selected_text: string;
  answer_snapshot: string;
  linked_vocabulary_mark_id: string | null;
  linked_korean_text: string | null;
  linked_korean_start: number | null;
  linked_korean_end: number | null;
  hint: string | null;
  explanation: string | null;
  is_required: boolean;
  case_sensitive: boolean;
  ignore_extra_spaces: boolean;
  ignore_punctuation: boolean;
  created_at: string;
  updated_at: string;
};

export type ExamStage3BlankPublic = {
  id: string;
  sentenceId: string;
  blankOrder: number;
  englishStart: number;
  englishEnd: number;
  linkedKoreanText: string | null;
  hasHint: boolean;
  isRequired: boolean;
  inputSize: InputSizeHint;
};

export type Stage3BlankAnswerState = Stage2BlankAnswerState;

export type ExamStage3Progress = {
  id: string;
  academy_id: string;
  assignment_student_id: string;
  passage_id: string;
  stage_number: number;
  answers: Record<string, Stage3BlankAnswerState>;
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

export const STAGE3_DEFAULT_THRESHOLDS = {
  hintAfterWrong: 2,
  revealAfterWrong: 3,
} as const;

export type Stage3BlankDraft = {
  id?: string;
  sentence_id: string;
  blank_order: number;
  answer_text: string;
  accepted_answers: string[];
  english_start: number;
  english_end: number;
  selected_text: string;
  linked_vocabulary_mark_id?: string | null;
  linked_korean_text?: string | null;
  linked_korean_start?: number | null;
  linked_korean_end?: number | null;
  hint?: string | null;
  explanation?: string | null;
  is_required?: boolean;
  case_sensitive?: boolean;
  ignore_extra_spaces?: boolean;
  ignore_punctuation?: boolean;
};

export function toPublicStage3Blank(b: ExamStage3Blank): ExamStage3BlankPublic {
  return {
    id: b.id,
    sentenceId: b.sentence_id,
    blankOrder: b.blank_order,
    englishStart: b.english_start,
    englishEnd: b.english_end,
    linkedKoreanText: b.linked_korean_text,
    hasHint: Boolean(b.hint?.trim()),
    isRequired: b.is_required,
    inputSize: blankInputSizeHint(b.answer_text.length),
  };
}

export function validateEnglishBlankAgainstText(
  englishText: string,
  blank: Pick<
    Stage3BlankDraft,
    "english_start" | "english_end" | "answer_text" | "selected_text"
  >
): string | null {
  const { english_start: start, english_end: end, answer_text: answer } = blank;
  const selected = blank.selected_text || answer;
  if (start < 0 || end <= start) return "빈칸 범위가 올바르지 않습니다.";
  if (end > englishText.length) return "빈칸 범위가 문장 길이를 초과합니다.";
  const slice = englishText.slice(start, end);
  if (slice !== selected && slice !== answer) {
    return `선택 「${selected}」가 현재 원문의 [${start},${end}) 「${slice}」와 일치하지 않습니다.`;
  }
  if (!answer.trim() || /^\s+$/.test(answer)) {
    return "공백만 빈칸으로 만들 수 없습니다.";
  }
  if (isEnglishBlankPunctuationOnly(answer)) {
    return "문장 부호만 빈칸으로 만들 수 없습니다.";
  }
  return null;
}

export function collectEnglishBlankWarnings(
  englishText: string,
  blanks: Stage3BlankDraft[]
): string[] {
  const warnings: string[] = [];
  const overlap = findOverlappingBlanks(
    blanks.map((b) => ({
      korean_start: b.english_start,
      korean_end: b.english_end,
      id: b.id,
    }))
  );
  if (overlap) warnings.push(overlap.replace("빈칸", "영문 빈칸"));

  for (const b of blanks) {
    if (isPartialWordCut(englishText, b.english_start, b.english_end)) {
      warnings.push(
        `「${b.answer_text}」: 영어 단어의 일부만 빈칸으로 설정했습니다. 의도한 설정인지 확인해 주세요.`
      );
    }
    if (
      b.english_start === 0 &&
      b.english_end >= englishText.length &&
      englishText.length > 0
    ) {
      warnings.push("문장 전체가 하나의 빈칸으로 설정되었습니다.");
    }
  }
  const covered = blanks.reduce(
    (n, b) => n + Math.max(0, b.english_end - b.english_start),
    0
  );
  if (englishText.length > 0 && covered / englishText.length >= 0.6) {
    warnings.push(
      "이 문장의 60% 이상이 빈칸으로 설정되었습니다. 학생이 문맥을 파악하기 어려울 수 있습니다."
    );
  }
  return warnings;
}

export function buildEnglishWithBlankSlots(
  englishText: string,
  blanks: Array<{ id: string; english_start: number; english_end: number }>
): Array<{ type: "text"; text: string } | { type: "blank"; blankId: string }> {
  const sorted = [...blanks].sort((a, b) => a.english_start - b.english_start);
  const out: Array<
    { type: "text"; text: string } | { type: "blank"; blankId: string }
  > = [];
  let cursor = 0;
  for (const b of sorted) {
    if (b.english_start > cursor) {
      out.push({
        type: "text",
        text: englishText.slice(cursor, b.english_start),
      });
    }
    out.push({ type: "blank", blankId: b.id });
    cursor = b.english_end;
  }
  if (cursor < englishText.length) {
    out.push({ type: "text", text: englishText.slice(cursor) });
  }
  return out;
}
