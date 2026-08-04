import { compareEnglishBlankAnswer } from "@/lib/exam-prep/english-blank-normalize";
import { isEnglishBlankPunctuationOnly } from "@/lib/exam-prep/english-blank-normalize";
import { findOverlappingBlanks } from "@/lib/exam-prep/stage2-types";

export const STAGE7_ERROR_SUBS = [
  "subject_verb_agreement",
  "tense",
  "voice",
  "verb_form",
  "relative_pronoun",
  "relative_adverb",
  "conjunction",
  "preposition",
  "infinitive",
  "gerund",
  "participle",
  "adjective_adverb",
  "pronoun",
  "number",
  "article",
  "comparison",
  "parallelism",
  "word_order",
  "agreement",
  "other",
] as const;

export type Stage7ErrorSub = (typeof STAGE7_ERROR_SUBS)[number];

export const STAGE7_ERROR_SUB_LABELS: Record<Stage7ErrorSub, string> = {
  subject_verb_agreement: "주어·동사 수 일치",
  tense: "시제",
  voice: "능동태·수동태",
  verb_form: "동사 형태",
  relative_pronoun: "관계대명사",
  relative_adverb: "관계부사",
  conjunction: "접속사",
  preposition: "전치사",
  infinitive: "to부정사",
  gerund: "동명사",
  participle: "분사",
  adjective_adverb: "형용사·부사",
  pronoun: "대명사",
  number: "단수·복수",
  article: "관사",
  comparison: "비교 표현",
  parallelism: "병렬 구조",
  word_order: "어순",
  agreement: "일치",
  other: "기타",
};

export const STAGE7_ERROR_FEEDBACK: Record<Stage7ErrorSub, string> = {
  subject_verb_agreement: "주어의 수에 맞는 동사 형태를 확인해 보세요.",
  tense: "문장의 시제와 동사 형태를 확인해 보세요.",
  voice: "주어와 동작의 관계가 능동인지 수동인지 확인해 보세요.",
  verb_form: "이 자리에 필요한 동사 형태를 확인해 보세요.",
  relative_pronoun: "관계대명사와 뒤 절의 구조를 확인해 보세요.",
  relative_adverb: "관계사 뒤에 주어와 동사가 모두 있는지 확인해 보세요.",
  conjunction: "앞뒤 절을 연결하는 접속사를 확인해 보세요.",
  preposition: "전치사 사용이 자연스러운지 확인해 보세요.",
  infinitive: "urge + 목적어 다음에 오는 동사 형태를 확인해 보세요.",
  gerund: "동명사가 필요한 자리인지 확인해 보세요.",
  participle: "분사 형태가 문맥에 맞는지 확인해 보세요.",
  adjective_adverb: "형용사와 부사 중 어떤 품사가 필요한지 확인하세요.",
  pronoun: "대명사가 가리키는 대상을 확인해 보세요.",
  number: "단수·복수 형태를 확인해 보세요.",
  article: "관사 사용을 확인해 보세요.",
  comparison: "비교 표현을 확인해 보세요.",
  parallelism: "병렬 구조가 맞는지 확인해 보세요.",
  word_order: "어순이 자연스러운지 확인해 보세요.",
  agreement: "일치 관계를 확인해 보세요.",
  other: "문맥에 맞는 어법을 다시 생각해 보세요.",
};

export type ExamStage7Candidate = {
  id: string;
  academy_id: string;
  passage_id: string;
  sentence_id: string;
  stage_number: 7;
  blank_order: number;
  /** 수정 정답 (오류가 아니면 displayed와 동일하게 둠) */
  answer_text: string;
  accepted_answers: string[];
  english_start: number;
  english_end: number;
  selected_text: string;
  answer_snapshot: string;
  is_error: boolean;
  grammar_category: string[];
  hint: string | null;
  explanation: string | null;
  is_required: boolean;
  case_sensitive: boolean;
  ignore_extra_spaces: boolean;
  ignore_punctuation: boolean;
  created_at: string;
  updated_at: string;
};

export type ExamStage7CandidatePublic = {
  id: string;
  sentenceId: string;
  candidateOrder: number;
  displayStart: number;
  displayEnd: number;
  displayedText: string;
};

export type Stage7CandidateResult =
  | "correct_selection_and_correction"
  | "correct_selection_wrong_correction"
  | "wrong_selection"
  | "not_selected"
  | "incomplete";

export type Stage7AnswerState = {
  selected: boolean;
  correctionValue: string;
  selectionCorrect: boolean | null;
  correctionCorrect: boolean | null;
  result: Stage7CandidateResult | null;
  attempts: number;
  hintUsed: boolean;
  positionRevealed: boolean;
  answerRevealed: boolean;
  hintText?: string | null;
  revealedCorrection?: string | null;
  categoryFeedback?: string | null;
};

export type ExamStage7Progress = {
  id: string;
  academy_id: string;
  assignment_student_id: string;
  passage_id: string;
  stage_number: number;
  answers: Record<string, Stage7AnswerState>;
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

export const STAGE7_DEFAULT_THRESHOLDS = {
  hintAfterWrong: 2,
  positionRevealAfterWrong: 3,
  answerRevealAfterWrong: 4,
} as const;

export type Stage7CandidateDraft = {
  id?: string;
  sentence_id: string;
  blank_order: number;
  english_start: number;
  english_end: number;
  displayed_text: string;
  is_error: boolean;
  correction_text: string;
  accepted_corrections: string[];
  error_subcategory: string[];
  hint?: string | null;
  explanation?: string | null;
};

export function toStudentStage7Candidate(
  c: ExamStage7Candidate
): ExamStage7CandidatePublic {
  return {
    id: c.id,
    sentenceId: c.sentence_id,
    candidateOrder: c.blank_order,
    displayStart: c.english_start,
    displayEnd: c.english_end,
    displayedText: c.selected_text || c.answer_snapshot,
  };
}

export function formatRequiredErrorCountKo(n: number): string {
  const map: Record<number, string> = {
    1: "한",
    2: "두",
    3: "세",
    4: "네",
    5: "다섯",
  };
  return map[n] ?? String(n);
}

export function stage7GuideText(requiredErrorCount: number): string {
  const word = formatRequiredErrorCountKo(requiredErrorCount);
  return `밑줄 친 부분 중 어법상 어색한 것을 ${word} 개 찾아 알맞게 고쳐 쓰세요.`;
}

export function categoryFeedbackForSubs(subs: string[]): string {
  const msgs = subs
    .filter((c) => (STAGE7_ERROR_SUBS as readonly string[]).includes(c))
    .map((c) => STAGE7_ERROR_FEEDBACK[c as Stage7ErrorSub]);
  const unique = [...new Set(msgs.filter(Boolean))];
  return unique.join(" ") || "문맥에 맞는 어법을 다시 생각해 보세요.";
}

export function validateCandidateAgainstDisplay(
  displayText: string,
  draft: Pick<
    Stage7CandidateDraft,
    | "english_start"
    | "english_end"
    | "displayed_text"
    | "is_error"
    | "correction_text"
  >
): string | null {
  const { english_start: start, english_end: end } = draft;
  const displayed = draft.displayed_text.trim();
  if (start < 0 || end <= start) return "후보 범위가 올바르지 않습니다.";
  if (end > displayText.length) return "후보 범위가 문장 길이를 초과합니다.";
  const slice = displayText.slice(start, end);
  if (slice !== draft.displayed_text && slice !== displayed) {
    return `표시 「${draft.displayed_text}」가 현재 표시 문장의 [${start},${end}) 「${slice}」와 일치하지 않습니다.`;
  }
  if (!displayed) return "표시 텍스트가 비어 있습니다.";
  if (isEnglishBlankPunctuationOnly(displayed)) {
    return "문장 부호만 후보로 지정할 수 없습니다.";
  }
  if (draft.is_error) {
    if (!draft.correction_text.trim()) {
      return "오류 후보에는 수정 정답이 필요합니다.";
    }
  } else if (draft.correction_text.trim()) {
    return "올바른 후보에는 수정 정답을 두지 마세요.";
  }
  return null;
}

export function collectStage7Warnings(
  displayBySentence: Map<string, string>,
  drafts: Stage7CandidateDraft[],
  requiredErrorCount: number
): string[] {
  const warnings: string[] = [];
  const errorCount = drafts.filter((d) => d.is_error).length;
  const correctCount = drafts.filter((d) => !d.is_error).length;
  if (drafts.length === 0) warnings.push("지문 전체에 밑줄 후보가 없습니다.");
  if (errorCount === 0) warnings.push("오류 후보가 없습니다.");
  if (errorCount !== requiredErrorCount) {
    warnings.push(
      `설정된 오류 개수는 ${requiredErrorCount}개이지만 현재 오류 후보는 ${errorCount}개입니다.`
    );
  }
  if (correctCount === 0 && errorCount > 0) {
    warnings.push(
      "올바른 후보가 하나도 없습니다. 학생이 구별하기 어렵습니다."
    );
  }
  if (errorCount > 0 && correctCount === 0) {
    warnings.push("모든 밑줄 후보가 오류로 설정되어 있습니다.");
  }

  const bySentence = new Map<string, Stage7CandidateDraft[]>();
  for (const d of drafts) {
    const list = bySentence.get(d.sentence_id) ?? [];
    list.push(d);
    bySentence.set(d.sentence_id, list);
  }
  for (const [sid, list] of bySentence) {
    const display = displayBySentence.get(sid) ?? "";
    const overlap = findOverlappingBlanks(
      list.map((b) => ({
        korean_start: b.english_start,
        korean_end: b.english_end,
        id: b.id,
      }))
    );
    if (overlap) warnings.push(overlap.replace("빈칸", "밑줄 후보"));
    for (const d of list) {
      const err = validateCandidateAgainstDisplay(display, d);
      if (err) warnings.push(err);
    }
  }
  return warnings;
}

export function buildDisplayWithCandidateSlots(
  displayText: string,
  candidates: Array<{
    id: string;
    english_start: number;
    english_end: number;
  }>
): Array<{ type: "text"; text: string } | { type: "candidate"; id: string }> {
  const sorted = [...candidates].sort(
    (a, b) => a.english_start - b.english_start
  );
  const out: Array<
    { type: "text"; text: string } | { type: "candidate"; id: string }
  > = [];
  let cursor = 0;
  for (const c of sorted) {
    if (c.english_start > cursor) {
      out.push({
        type: "text",
        text: displayText.slice(cursor, c.english_start),
      });
    }
    out.push({ type: "candidate", id: c.id });
    cursor = c.english_end;
  }
  if (cursor < displayText.length) {
    out.push({ type: "text", text: displayText.slice(cursor) });
  }
  return out;
}

export function gradeStage7Candidate(
  candidate: Pick<
    ExamStage7Candidate,
    "is_error" | "answer_text" | "accepted_answers" | "case_sensitive" | "ignore_extra_spaces" | "ignore_punctuation"
  >,
  selected: boolean,
  correctionValue: string
): {
  selectionCorrect: boolean;
  correctionCorrect: boolean;
  result: Stage7CandidateResult;
} {
  if (!selected) {
    if (candidate.is_error) {
      return {
        selectionCorrect: false,
        correctionCorrect: false,
        result: "not_selected",
      };
    }
    return {
      selectionCorrect: true,
      correctionCorrect: true,
      result: "not_selected",
    };
  }

  if (!candidate.is_error) {
    return {
      selectionCorrect: false,
      correctionCorrect: false,
      result: "wrong_selection",
    };
  }

  const trimmed = correctionValue.trim();
  if (!trimmed) {
    return {
      selectionCorrect: true,
      correctionCorrect: false,
      result: "incomplete",
    };
  }

  const ok = compareEnglishBlankAnswer(
    correctionValue,
    candidate.answer_text,
    candidate.accepted_answers ?? [],
    {
      caseSensitive: candidate.case_sensitive,
      ignoreExtraSpaces: candidate.ignore_extra_spaces ?? true,
      ignorePunctuation: candidate.ignore_punctuation ?? false,
    }
  );

  return {
    selectionCorrect: true,
    correctionCorrect: ok,
    result: ok
      ? "correct_selection_and_correction"
      : "correct_selection_wrong_correction",
  };
}

/** 완료: 모든 오류를 선택·수정하고, 올바른 후보를 잘못 선택하지 않음 */
export function canCompleteStage7(
  candidates: ExamStage7Candidate[],
  answers: Record<string, Stage7AnswerState>
): boolean {
  const errors = candidates.filter((c) => c.is_error);
  if (errors.length < 1) return false;
  for (const c of errors) {
    const a = answers[c.id];
    if (!a?.selected) return false;
    if (a.result !== "correct_selection_and_correction") return false;
  }
  for (const c of candidates.filter((x) => !x.is_error)) {
    if (answers[c.id]?.selected) return false;
  }
  return true;
}

export function computeStage7Score(
  candidates: ExamStage7Candidate[],
  answers: Record<string, Stage7AnswerState>
): number {
  const errors = candidates.filter((c) => c.is_error);
  if (errors.length === 0) return 0;
  let earned = 0;
  for (const c of errors) {
    const a = answers[c.id];
    if (!a) continue;
    if (a.selectionCorrect) earned += 0.5;
    if (a.correctionCorrect) earned += 0.5;
  }
  return Math.round((earned / errors.length) * 100);
}

export function resultLabelKo(result: Stage7CandidateResult | null): string {
  switch (result) {
    case "correct_selection_and_correction":
      return "어색한 부분과 수정 답안을 정확히 찾았습니다.";
    case "correct_selection_wrong_correction":
      return "어색한 부분은 맞게 찾았습니다. 알맞은 형태로 다시 고쳐 보세요.";
    case "wrong_selection":
      return "이 부분은 어법상 올바른 표현입니다. 다른 밑줄 부분을 확인해 보세요.";
    case "incomplete":
      return "수정 답안을 입력해 주세요.";
    case "not_selected":
      return "";
    default:
      return "";
  }
}
