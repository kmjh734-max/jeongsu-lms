import { isEnglishBlankPunctuationOnly } from "@/lib/exam-prep/english-blank-normalize";
import { findOverlappingBlanks } from "@/lib/exam-prep/stage2-types";

export const STAGE6_GRAMMAR_SUBS = [
  "voice",
  "tense",
  "verb_form",
  "subject_verb_agreement",
  "relative_pronoun",
  "relative_adverb",
  "conjunction",
  "preposition",
  "adjective_adverb",
  "participle",
  "infinitive",
  "gerund",
  "pronoun",
  "number",
  "article",
  "comparison",
  "word_order",
  "other_grammar",
] as const;

export const STAGE6_VOCAB_SUBS = [
  "opposite_meaning",
  "similar_spelling",
  "contextual_meaning",
  "collocation",
  "positive_negative",
  "increase_decrease",
  "strengthen_weaken",
  "word_form",
  "other_vocabulary",
] as const;

export type Stage6GrammarSub = (typeof STAGE6_GRAMMAR_SUBS)[number];
export type Stage6VocabSub = (typeof STAGE6_VOCAB_SUBS)[number];

export const STAGE6_GRAMMAR_SUB_LABELS: Record<Stage6GrammarSub, string> = {
  voice: "능동태·수동태",
  tense: "시제",
  verb_form: "동사 형태",
  subject_verb_agreement: "주어·동사 수 일치",
  relative_pronoun: "관계대명사",
  relative_adverb: "관계부사",
  conjunction: "접속사",
  preposition: "전치사",
  adjective_adverb: "형용사·부사",
  participle: "분사",
  infinitive: "to부정사",
  gerund: "동명사",
  pronoun: "대명사",
  number: "단수·복수",
  article: "관사",
  comparison: "비교 표현",
  word_order: "어순",
  other_grammar: "기타 어법",
};

export const STAGE6_VOCAB_SUB_LABELS: Record<Stage6VocabSub, string> = {
  opposite_meaning: "반대 의미",
  similar_spelling: "유사 철자",
  contextual_meaning: "문맥상 의미",
  collocation: "연어",
  positive_negative: "긍정·부정",
  increase_decrease: "증가·감소",
  strengthen_weaken: "강화·약화",
  word_form: "품사·형태",
  other_vocabulary: "기타 어휘",
};

export const STAGE6_GRAMMAR_FEEDBACK: Record<Stage6GrammarSub, string> = {
  voice: "주어와 동작의 관계가 능동인지 수동인지 확인해 보세요.",
  tense: "현재 문장의 시제와 동사 형태를 확인하세요.",
  verb_form: "이 자리에 필요한 동사 형태를 확인해 보세요.",
  subject_verb_agreement: "주어의 수에 맞는 동사 형태를 고르세요.",
  relative_pronoun: "관계사 뒤 문장이 완전한지 불완전한지 확인해 보세요.",
  relative_adverb: "앞의 선행사와 뒤 문장의 구조를 확인해 보세요.",
  conjunction: "앞뒤 절을 연결하는 접속사를 확인해 보세요.",
  preposition: "명사·동사와 자연스럽게 연결되는 전치사를 고르세요.",
  adjective_adverb:
    "이 자리에는 형용사와 부사 중 어떤 품사가 필요한지 확인하세요.",
  participle:
    "명사를 수식하는 표현인지, 주어의 감정을 나타내는 표현인지 확인하세요.",
  infinitive: "to부정사가 필요한 자리인지 확인해 보세요.",
  gerund: "동명사가 필요한 자리인지 확인해 보세요.",
  pronoun: "대명사가 가리키는 대상을 확인해 보세요.",
  number: "단수·복수 형태를 확인해 보세요.",
  article: "관사 사용이 자연스러운지 확인해 보세요.",
  comparison: "비교 표현을 확인해 보세요.",
  word_order: "어순이 자연스러운지 확인해 보세요.",
  other_grammar: "문맥에 맞는 어법을 다시 생각해 보세요.",
};

export const STAGE6_VOCAB_FEEDBACK: Record<Stage6VocabSub, string> = {
  opposite_meaning: "문장 전체의 긍정·부정 흐름을 확인해 보세요.",
  similar_spelling: "두 단어의 철자가 비슷하지만 뜻은 다릅니다.",
  contextual_meaning: "문맥상 의미에 맞는 단어를 고르세요.",
  collocation: "목적어와 자연스럽게 연결되는 표현을 확인하세요.",
  positive_negative: "문장 전체의 긍정·부정 흐름을 확인해 보세요.",
  increase_decrease:
    "앞뒤 문맥에서 상황이 좋아지는지 나빠지는지 확인하세요.",
  strengthen_weaken:
    "이 문맥에서 문제를 강화하는지 약화하는지 확인하세요.",
  word_form: "이 자리에 맞는 품사·형태를 고르세요.",
  other_vocabulary: "문맥에 맞는 어휘를 다시 생각해 보세요.",
};

export type Stage6ChoiceOption = {
  id: string;
  text: string;
  isCorrect: boolean;
  explanation?: string | null;
};

export type Stage6ChoiceOptionPublic = {
  id: string;
  text: string;
};

export type ExamStage6Item = {
  id: string;
  academy_id: string;
  passage_id: string;
  sentence_id: string;
  stage_number: 6;
  target_language: "en";
  blank_order: number;
  answer_text: string;
  accepted_answers: string[];
  english_start: number;
  english_end: number;
  selected_text: string;
  answer_snapshot: string;
  choice_options: Stage6ChoiceOption[];
  question_category: "grammar" | "vocabulary" | null;
  grammar_subcategory: string[];
  vocabulary_subcategory: string[];
  shuffle_options: boolean;
  hint: string | null;
  explanation: string | null;
  is_required: boolean;
  case_sensitive: boolean;
  ignore_extra_spaces: boolean;
  ignore_punctuation: boolean;
  created_at: string;
  updated_at: string;
};

export type ExamStage6ItemPublic = {
  id: string;
  sentenceId: string;
  blankOrder: number;
  englishStart: number;
  englishEnd: number;
  questionCategory: "grammar" | "vocabulary" | null;
  grammarSubLabels: string[];
  vocabularySubLabels: string[];
  options: Stage6ChoiceOptionPublic[];
  hasHint: boolean;
  isRequired: boolean;
  shuffleOptions: boolean;
};

export type Stage6AnswerState = {
  selectedOptionId: string | null;
  isCorrect: boolean | null;
  attempts: number;
  hintUsed: boolean;
  answerRevealed: boolean;
  revealedOptionId?: string | null;
  revealedText?: string | null;
  hintText?: string | null;
  categoryFeedback?: string | null;
  optionOrder: string[];
};

export type ExamStage6Progress = {
  id: string;
  academy_id: string;
  assignment_student_id: string;
  passage_id: string;
  stage_number: number;
  answers: Record<string, Stage6AnswerState>;
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

export const STAGE6_DEFAULT_THRESHOLDS = {
  categoryHintAfterWrong: 1,
  hintAfterWrong: 2,
  revealAfterWrong: 3,
} as const;

export type Stage6ItemDraft = {
  id?: string;
  sentence_id: string;
  blank_order: number;
  answer_text: string;
  english_start: number;
  english_end: number;
  selected_text: string;
  choice_options: Stage6ChoiceOption[];
  question_category: "grammar" | "vocabulary";
  grammar_subcategory: string[];
  vocabulary_subcategory: string[];
  shuffle_options?: boolean;
  hint?: string | null;
  explanation?: string | null;
  is_required?: boolean;
};

export function parseChoiceOptions(raw: unknown): Stage6ChoiceOption[] {
  if (!Array.isArray(raw)) return [];
  const out: Stage6ChoiceOption[] = [];
  raw.forEach((o, i) => {
    if (!o || typeof o !== "object") return;
    const r = o as Record<string, unknown>;
    const text = String(r.text ?? "").trim();
    if (!text) return;
    out.push({
      id: String(r.id ?? `option-${i + 1}`),
      text,
      isCorrect: Boolean(r.isCorrect),
      explanation: typeof r.explanation === "string" ? r.explanation : null,
    });
  });
  return out;
}

/** 학생용 — isCorrect·해설 제거 */
export function toStudentStage6Item(
  b: ExamStage6Item,
  optionOrder?: string[]
): ExamStage6ItemPublic {
  const options = parseChoiceOptions(b.choice_options);
  const order =
    optionOrder && optionOrder.length > 0
      ? optionOrder
      : options.map((o) => o.id);
  const byId = new Map(options.map((o) => [o.id, o]));
  const ordered = order
    .map((id) => byId.get(id))
    .filter((o): o is Stage6ChoiceOption => Boolean(o));
  for (const o of options) {
    if (!ordered.find((x) => x.id === o.id)) ordered.push(o);
  }

  const gSubs = (b.grammar_subcategory ?? []).filter((c) =>
    (STAGE6_GRAMMAR_SUBS as readonly string[]).includes(c)
  ) as Stage6GrammarSub[];
  const vSubs = (b.vocabulary_subcategory ?? []).filter((c) =>
    (STAGE6_VOCAB_SUBS as readonly string[]).includes(c)
  ) as Stage6VocabSub[];

  return {
    id: b.id,
    sentenceId: b.sentence_id,
    blankOrder: b.blank_order,
    englishStart: b.english_start,
    englishEnd: b.english_end,
    questionCategory: b.question_category,
    grammarSubLabels: gSubs.map((c) => STAGE6_GRAMMAR_SUB_LABELS[c]),
    vocabularySubLabels: vSubs.map((c) => STAGE6_VOCAB_SUB_LABELS[c]),
    options: ordered.map((o) => ({ id: o.id, text: o.text })),
    hasHint: Boolean(b.hint?.trim()),
    isRequired: b.is_required,
    shuffleOptions: b.shuffle_options !== false,
  };
}

export function categoryFeedbackForItem(
  category: "grammar" | "vocabulary" | null,
  grammarSubs: string[],
  vocabSubs: string[]
): string {
  if (category === "grammar") {
    const msgs = grammarSubs
      .filter((c) => (STAGE6_GRAMMAR_SUBS as readonly string[]).includes(c))
      .map((c) => STAGE6_GRAMMAR_FEEDBACK[c as Stage6GrammarSub]);
    const unique = [...new Set(msgs.filter(Boolean))];
    return unique.join(" ") || "문맥에 맞는 어법을 다시 생각해 보세요.";
  }
  if (category === "vocabulary") {
    const msgs = vocabSubs
      .filter((c) => (STAGE6_VOCAB_SUBS as readonly string[]).includes(c))
      .map((c) => STAGE6_VOCAB_FEEDBACK[c as Stage6VocabSub]);
    const unique = [...new Set(msgs.filter(Boolean))];
    return unique.join(" ") || "문맥에 맞는 어휘를 다시 생각해 보세요.";
  }
  return "문맥에 맞는 표현을 다시 생각해 보세요.";
}

/** assignment+item 고정 시드 셔플 (같은 시도에서 순서 유지) */
export function shuffleOptionIds(
  optionIds: string[],
  seed: string
): string[] {
  const arr = [...optionIds];
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  for (let i = arr.length - 1; i > 0; i--) {
    h = Math.imul(h ^ (h >>> 13), 1274126177);
    const j = Math.abs(h) % (i + 1);
    const tmp = arr[i]!;
    arr[i] = arr[j]!;
    arr[j] = tmp;
  }
  return arr;
}

export function gradeSelectedOption(
  options: Stage6ChoiceOption[],
  selectedOptionId: string | null | undefined
): boolean {
  if (!selectedOptionId) return false;
  const opt = options.find((o) => o.id === selectedOptionId);
  return Boolean(opt?.isCorrect);
}

export function validateStage6ItemAgainstText(
  englishText: string,
  item: Pick<
    Stage6ItemDraft,
    | "english_start"
    | "english_end"
    | "answer_text"
    | "selected_text"
    | "choice_options"
    | "question_category"
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
    return "문장 부호만 문제로 지정할 수 없습니다.";
  }
  const options = parseChoiceOptions(item.choice_options);
  if (options.length < 2) return "선택지는 최소 2개여야 합니다.";
  const correct = options.filter((o) => o.isCorrect);
  if (correct.length !== 1) return "단일 선택 문제는 정답이 정확히 1개여야 합니다.";
  if (correct[0]!.text !== answer.trim() && correct[0]!.text !== selected.trim()) {
    return "정답 선택지가 영어 원문의 해당 표현과 다릅니다.";
  }
  const norms = options.map((o) => o.text.trim().toLowerCase());
  if (new Set(norms).size !== norms.length) {
    return "동일한 선택지 문자열이 중복됩니다.";
  }
  if (!item.question_category) return "문제 유형(어법/어휘)을 선택해 주세요.";
  return null;
}

export function collectStage6Warnings(
  englishText: string,
  items: Stage6ItemDraft[]
): string[] {
  const warnings: string[] = [];
  const overlap = findOverlappingBlanks(
    items.map((b) => ({
      korean_start: b.english_start,
      korean_end: b.english_end,
      id: b.id,
    }))
  );
  if (overlap) warnings.push(overlap.replace("빈칸", "선택형 항목"));

  for (const b of items) {
    if (
      b.english_start === 0 &&
      b.english_end >= englishText.length &&
      englishText.length > 0
    ) {
      warnings.push("문장 전체가 하나의 선택형 문제로 설정되었습니다.");
    }
    if (b.question_category === "grammar" && b.grammar_subcategory.length < 1) {
      warnings.push(`「${b.answer_text}」: 어법 세부 유형이 없습니다.`);
    }
    if (
      b.question_category === "vocabulary" &&
      b.vocabulary_subcategory.length < 1
    ) {
      warnings.push(`「${b.answer_text}」: 어휘 세부 유형이 없습니다.`);
    }
    for (const o of b.choice_options) {
      if (o.text.length > 80) {
        warnings.push(`선택지 「${o.text.slice(0, 20)}…」가 깁니다.`);
      }
    }
  }
  return warnings;
}

export function buildEnglishWithChoiceSlots(
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

export function newOptionId(): string {
  return `opt-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}
