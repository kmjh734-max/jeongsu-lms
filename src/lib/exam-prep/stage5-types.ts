import { blankInputSizeHint, type InputSizeHint } from "@/lib/exam-prep/korean-blank-normalize";
import {
  isEnglishBlankPunctuationOnly,
  isPartialWordCut,
} from "@/lib/exam-prep/english-blank-normalize";
import {
  findOverlappingBlanks,
  type Stage2BlankAnswerState,
} from "@/lib/exam-prep/stage2-types";

export const STAGE5_GRAMMAR_CATEGORIES = [
  "simple_present",
  "simple_past",
  "present_progressive",
  "past_progressive",
  "present_perfect",
  "past_perfect",
  "perfect_progressive",
  "passive_voice",
  "subject_verb_agreement",
  "infinitive",
  "gerund",
  "present_participle",
  "past_participle",
  "adjective_form",
  "adverb_form",
  "negative_form",
  "imperative",
  "unchanged_form",
  "other",
] as const;

export type Stage5GrammarCategory = (typeof STAGE5_GRAMMAR_CATEGORIES)[number];

export const STAGE5_GRAMMAR_LABELS: Record<Stage5GrammarCategory, string> = {
  simple_present: "현재시제",
  simple_past: "과거시제",
  present_progressive: "진행형",
  past_progressive: "과거진행형",
  present_perfect: "완료형",
  past_perfect: "과거완료",
  perfect_progressive: "완료진행형",
  passive_voice: "수동태",
  subject_verb_agreement: "수 일치",
  infinitive: "to부정사",
  gerund: "동명사",
  present_participle: "현재분사",
  past_participle: "과거분사",
  adjective_form: "형용사형",
  adverb_form: "부사형",
  negative_form: "부정형",
  imperative: "명령문",
  unchanged_form: "형태 변화 없음",
  other: "기타",
};

/** 오답 시 문법 유형 기반 피드백 (AI 생성 아님) */
export const STAGE5_GRAMMAR_FEEDBACK: Record<Stage5GrammarCategory, string> = {
  simple_present: "현재시제 형태를 확인해 보세요.",
  simple_past: "과거시제 형태를 확인해 보세요.",
  present_progressive: "진행형의 현재분사 형태를 확인해 보세요.",
  past_progressive: "과거진행형 형태를 확인해 보세요.",
  present_perfect: "완료형에 필요한 형태를 확인해 보세요.",
  past_perfect: "과거완료 형태를 확인해 보세요.",
  perfect_progressive: "현재완료와 진행형을 함께 사용해 보세요.",
  passive_voice: "수동태의 be동사와 과거분사를 확인해 보세요.",
  subject_verb_agreement: "주어와 동사의 수 일치를 확인해 보세요.",
  infinitive: "to부정사가 필요한 자리인지 확인해 보세요.",
  gerund: "동명사가 필요한 자리인지 확인해 보세요.",
  present_participle: "현재분사 형태를 확인해 보세요.",
  past_participle: "과거분사 형태를 확인해 보세요.",
  adjective_form: "형용사형이 필요한 자리인지 확인해 보세요.",
  adverb_form: "부사형이 필요한 자리인지 확인해 보세요.",
  negative_form: "부정 표현이 빠지지 않았는지 확인해 보세요.",
  imperative: "명령문 형태를 확인해 보세요.",
  unchanged_form: "형태 변화 없이 그대로 쓰는 자리인지 확인해 보세요.",
  other: "문맥에 맞는 형태를 다시 생각해 보세요.",
};

export type ExamStage5Item = {
  id: string;
  academy_id: string;
  passage_id: string;
  sentence_id: string;
  stage_number: 5;
  target_language: "en";
  blank_order: number;
  answer_text: string;
  accepted_answers: string[];
  english_start: number;
  english_end: number;
  selected_text: string;
  answer_snapshot: string;
  cue_words: string[];
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

export type ExamStage5ItemPublic = {
  id: string;
  sentenceId: string;
  blankOrder: number;
  englishStart: number;
  englishEnd: number;
  cueWords: string[];
  cueDisplayText: string;
  grammarCategories: string[];
  grammarLabels: string[];
  hasHint: boolean;
  isRequired: boolean;
  inputSize: InputSizeHint;
};

export type Stage5ItemAnswerState = Stage2BlankAnswerState & {
  /** 문법 유형 피드백 (오답 시) */
  categoryFeedback?: string | null;
};

export type ExamStage5Progress = {
  id: string;
  academy_id: string;
  assignment_student_id: string;
  passage_id: string;
  stage_number: number;
  answers: Record<string, Stage5ItemAnswerState>;
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

export const STAGE5_DEFAULT_THRESHOLDS = {
  /** 1회 오답: 문법 유형 힌트 */
  categoryHintAfterWrong: 1,
  /** 2회 오답: 강사 힌트 */
  hintAfterWrong: 2,
  /** 3회 오답: 정답 확인 */
  revealAfterWrong: 3,
} as const;

export type Stage5ItemDraft = {
  id?: string;
  sentence_id: string;
  blank_order: number;
  answer_text: string;
  accepted_answers: string[];
  english_start: number;
  english_end: number;
  selected_text: string;
  cue_words: string[];
  grammar_category: string[];
  hint?: string | null;
  explanation?: string | null;
  is_required?: boolean;
  case_sensitive?: boolean;
  ignore_extra_spaces?: boolean;
  ignore_punctuation?: boolean;
};

export function formatCueDisplay(cueWords: string[]): string {
  return cueWords.map((w) => w.trim()).filter(Boolean).join(", ");
}

export function parseCueWords(raw: unknown): string[] {
  if (Array.isArray(raw)) {
    return raw.map((x) => String(x).trim()).filter(Boolean);
  }
  if (typeof raw === "string" && raw.trim()) {
    return raw
      .split(/[,，]/)
      .map((x) => x.trim())
      .filter(Boolean);
  }
  return [];
}

export function parseGrammarCategories(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((x) => String(x))
    .filter((c) =>
      (STAGE5_GRAMMAR_CATEGORIES as readonly string[]).includes(c)
    );
}

export function toPublicStage5Item(b: ExamStage5Item): ExamStage5ItemPublic {
  const cues = parseCueWords(b.cue_words);
  const cats = parseGrammarCategories(b.grammar_category);
  return {
    id: b.id,
    sentenceId: b.sentence_id,
    blankOrder: b.blank_order,
    englishStart: b.english_start,
    englishEnd: b.english_end,
    cueWords: cues,
    cueDisplayText: formatCueDisplay(cues),
    grammarCategories: cats,
    grammarLabels: cats.map(
      (c) => STAGE5_GRAMMAR_LABELS[c as Stage5GrammarCategory] ?? c
    ),
    hasHint: Boolean(b.hint?.trim()),
    isRequired: b.is_required,
    inputSize: blankInputSizeHint(b.answer_text.length),
  };
}

export function grammarCategoryFeedback(categories: string[]): string {
  const msgs = parseGrammarCategories(categories).map(
    (c) => STAGE5_GRAMMAR_FEEDBACK[c as Stage5GrammarCategory]
  );
  const unique = [...new Set(msgs.filter(Boolean))];
  return unique.join(" ") || "문맥에 맞는 형태를 다시 생각해 보세요.";
}

export function validateStage5ItemAgainstText(
  englishText: string,
  item: Pick<
    Stage5ItemDraft,
    | "english_start"
    | "english_end"
    | "answer_text"
    | "selected_text"
    | "cue_words"
  >
): string | null {
  const { english_start: start, english_end: end, answer_text: answer } = item;
  const selected = item.selected_text || answer;
  if (start < 0 || end <= start) return "정답 범위가 올바르지 않습니다.";
  if (end > englishText.length) return "정답 범위가 문장 길이를 초과합니다.";
  const slice = englishText.slice(start, end);
  if (slice !== selected && slice !== answer) {
    return `선택 「${selected}」가 현재 원문의 [${start},${end}) 「${slice}」와 일치하지 않습니다.`;
  }
  if (!answer.trim()) return "정답이 비어 있습니다.";
  if (isEnglishBlankPunctuationOnly(answer)) {
    return "문장 부호만 정답으로 지정할 수 없습니다.";
  }
  const cues = parseCueWords(item.cue_words);
  if (cues.length < 1) return "제시어가 최소 1개 필요합니다.";
  if (cues.some((c) => !c.trim())) return "공백만 제시어로 등록할 수 없습니다.";
  return null;
}

export function collectStage5Warnings(
  englishText: string,
  items: Stage5ItemDraft[]
): string[] {
  const warnings: string[] = [];
  const overlap = findOverlappingBlanks(
    items.map((b) => ({
      korean_start: b.english_start,
      korean_end: b.english_end,
      id: b.id,
    }))
  );
  if (overlap) warnings.push(overlap.replace("빈칸", "동사형 항목"));

  for (const b of items) {
    if (isPartialWordCut(englishText, b.english_start, b.english_end)) {
      warnings.push(
        `「${b.answer_text}」: 영어 단어의 일부만 선택했습니다. 의도한 설정인지 확인해 주세요.`
      );
    }
    if (
      b.english_start === 0 &&
      b.english_end >= englishText.length &&
      englishText.length > 0
    ) {
      warnings.push("문장 전체가 하나의 변형 항목으로 설정되었습니다.");
    }
    const cues = parseCueWords(b.cue_words);
    const cueSet = new Set(cues.map((c) => c.toLowerCase()));
    if (cueSet.size < cues.length) {
      warnings.push(`「${b.answer_text}」: 동일한 제시어가 반복됩니다.`);
    }
    const answerNorm = b.answer_text.trim().toLowerCase();
    const cueJoined = formatCueDisplay(cues).toLowerCase();
    if (
      answerNorm === cueJoined ||
      (cues.length === 1 && answerNorm === cues[0]!.toLowerCase())
    ) {
      const cats = parseGrammarCategories(b.grammar_category);
      if (!cats.includes("unchanged_form")) {
        warnings.push(
          `「${b.answer_text}」: 제시어와 정답이 같습니다. 「형태 변화 없음」 유형 설정을 권장합니다.`
        );
      }
    }
    const accepted = b.accepted_answers ?? [];
    if (accepted.some((a) => a.trim().toLowerCase() === answerNorm)) {
      warnings.push(
        `「${b.answer_text}」: acceptedAnswers에 원래 정답과 같은 값이 있습니다.`
      );
    }
  }
  return warnings;
}

export function buildEnglishWithVerbSlots(
  englishText: string,
  items: Array<{ id: string; english_start: number; english_end: number }>
): Array<{ type: "text"; text: string } | { type: "item"; itemId: string }> {
  const sorted = [...items].sort((a, b) => a.english_start - b.english_start);
  const out: Array<
    { type: "text"; text: string } | { type: "item"; itemId: string }
  > = [];
  let cursor = 0;
  for (const b of sorted) {
    if (b.english_start > cursor) {
      out.push({
        type: "text",
        text: englishText.slice(cursor, b.english_start),
      });
    }
    out.push({ type: "item", itemId: b.id });
    cursor = b.english_end;
  }
  if (cursor < englishText.length) {
    out.push({ type: "text", text: englishText.slice(cursor) });
  }
  return out;
}
