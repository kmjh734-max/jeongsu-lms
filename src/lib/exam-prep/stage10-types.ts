import {
  compareEnglishBlankAnswer,
  normalizeEnglishBlankAnswer,
  normalizeEnglishQuotes,
} from "@/lib/exam-prep/english-blank-normalize";
import { parseSentenceIds } from "@/lib/exam-prep/stage9-types";

export type Stage10InputMode = "guided_segments" | "full_sentence";
export type Stage10BlankDisplayMode = "token_slots" | "phrase_input";
export type Stage10SegmentType = "fixed_text" | "answer_segment";

export type Stage10Segment = {
  id: string;
  segmentOrder: number;
  segmentType: Stage10SegmentType;
  fixedText?: string;
  originalAnswerText?: string;
  answerTokens?: string[];
  acceptedAnswers?: string[];
  englishStart?: number;
  englishEnd?: number;
  caseSensitive?: boolean;
  ignoreExtraSpaces?: boolean;
  ignoreTerminalPunctuation?: boolean;
};

export type Stage10Cue = {
  id: string;
  cueOrder: number;
  cueText: string;
  linkedSegmentId?: string | null;
  linkedAnswerText?: string | null;
};

export type ExamStage10Item = {
  id: string;
  academy_id: string;
  passage_id: string;
  sentence_id: string;
  stage_number: 10;
  blank_order: number;
  answer_text: string;
  selected_text: string;
  answer_snapshot: string;
  accepted_answers: string[];
  sentence_ids: string[];
  writing_segments: Stage10Segment[];
  writing_cues: Stage10Cue[];
  writing_input_mode: Stage10InputMode;
  writing_blank_display_mode: Stage10BlankDisplayMode;
  hint: string | null;
  explanation: string | null;
  is_required: boolean;
  created_at: string;
  updated_at: string;
};

export type Stage10SegmentPublic = {
  id: string;
  segmentOrder: number;
  segmentType: Stage10SegmentType;
  fixedText?: string;
  /** token_slots일 때만 칸 수 노출 (정답 텍스트 없음) */
  tokenSlotCount?: number;
};

export type Stage10CuePublic = {
  id: string;
  cueOrder: number;
  cueText: string;
};

export type ExamStage10ItemPublic = {
  id: string;
  itemOrder: number;
  koreanPrompt: string;
  inputMode: Stage10InputMode;
  blankDisplayMode: Stage10BlankDisplayMode;
  segments: Stage10SegmentPublic[];
  cues: Stage10CuePublic[];
  hasHint: boolean;
  isRequired: boolean;
};

export type Stage10SegmentAnswer = {
  inputMode: Stage10BlankDisplayMode | "phrase_input" | "token_slots";
  tokens?: string[];
  value?: string;
  assembledValue?: string;
  isCorrect?: boolean | null;
};

export type Stage10ItemAnswerState = {
  segmentAnswers: Record<string, Stage10SegmentAnswer>;
  fullSentenceAnswer?: string;
  attempts: number;
  isCorrect: boolean | null;
  hintUsed: boolean;
  answerRevealed: boolean;
  hintText?: string | null;
  revealedText?: string | null;
  usedHintTypes?: string[];
};

export type Stage10AttemptRecord = {
  attemptNumber: number;
  itemId: string;
  answer: Record<string, string>;
  isCorrect: boolean;
  submittedAt: string;
};

export type ExamStage10Progress = {
  id: string;
  academy_id: string;
  assignment_student_id: string;
  passage_id: string;
  stage_number: number;
  answers: Record<string, Stage10ItemAnswerState>;
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

export const STAGE10_DEFAULT_THRESHOLDS = {
  grammarHintAfter: 1,
  functionWordHintAfter: 2,
  firstTokenHintAfter: 3,
  segmentRevealAfter: 4,
  fullRevealAfter: 5,
  warnFixedRatio: 0.8,
} as const;

export type Stage10ItemDraft = {
  id?: string;
  blank_order: number;
  sentence_ids: string[];
  korean_prompt?: string;
  full_english?: string;
  writing_segments: Stage10Segment[];
  writing_cues: Stage10Cue[];
  writing_input_mode: Stage10InputMode;
  writing_blank_display_mode: Stage10BlankDisplayMode;
  accepted_answers?: string[];
  hint?: string | null;
  explanation?: string | null;
  is_required?: boolean;
};

export function newSegId(): string {
  return `seg-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function newCueId(): string {
  return `cue-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
}

export function tokenizeAnswerText(text: string): string[] {
  const t = normalizeEnglishQuotes(text ?? "").trim();
  if (!t) return [];
  return t.split(/\s+/).filter(Boolean);
}

export function assembleTokens(tokens: string[]): string {
  return tokens.map((t) => t.trim()).filter(Boolean).join(" ");
}

export function normalizeWritingAnswer(
  raw: string,
  opts?: {
    caseSensitive?: boolean;
    ignoreExtraSpaces?: boolean;
    ignoreTerminalPunctuation?: boolean;
  }
): string {
  let s = normalizeEnglishBlankAnswer(raw, {
    caseSensitive: opts?.caseSensitive ?? false,
    ignoreExtraSpaces: opts?.ignoreExtraSpaces ?? true,
  });
  if (opts?.ignoreTerminalPunctuation !== false) {
    s = s.replace(/[.!?]+$/g, "").trim();
  }
  return s;
}

export function answersMatch(
  student: string,
  correct: string,
  accepted: string[] = [],
  opts?: {
    caseSensitive?: boolean;
    ignoreExtraSpaces?: boolean;
    ignoreTerminalPunctuation?: boolean;
  }
): boolean {
  const a = normalizeWritingAnswer(student, opts);
  if (!a) return false;
  const list = [correct, ...accepted].map((x) =>
    normalizeWritingAnswer(x, opts)
  );
  return list.includes(a);
}

export function parseWritingSegments(raw: unknown): Stage10Segment[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((o, i) => {
      if (!o || typeof o !== "object") return null;
      const r = o as Record<string, unknown>;
      const type = String(r.segmentType ?? "answer_segment") as Stage10SegmentType;
      const seg: Stage10Segment = {
        id: String(r.id ?? `seg-${i + 1}`),
        segmentOrder: Number(r.segmentOrder ?? i + 1) || i + 1,
        segmentType: type === "fixed_text" ? "fixed_text" : "answer_segment",
      };
      if (seg.segmentType === "fixed_text") {
        seg.fixedText = String(r.fixedText ?? "");
      } else {
        seg.originalAnswerText = String(r.originalAnswerText ?? "");
        seg.answerTokens = Array.isArray(r.answerTokens)
          ? r.answerTokens.map(String)
          : tokenizeAnswerText(seg.originalAnswerText);
        seg.acceptedAnswers = Array.isArray(r.acceptedAnswers)
          ? r.acceptedAnswers.map(String)
          : [];
        seg.englishStart =
          r.englishStart != null ? Number(r.englishStart) : undefined;
        seg.englishEnd =
          r.englishEnd != null ? Number(r.englishEnd) : undefined;
        seg.caseSensitive = Boolean(r.caseSensitive);
        seg.ignoreExtraSpaces = r.ignoreExtraSpaces !== false;
        seg.ignoreTerminalPunctuation = r.ignoreTerminalPunctuation !== false;
      }
      return seg;
    })
    .filter((x): x is Stage10Segment => Boolean(x))
    .sort((a, b) => a.segmentOrder - b.segmentOrder);
}

export function parseWritingCues(raw: unknown): Stage10Cue[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((o, i) => {
      if (!o || typeof o !== "object") return null;
      const r = o as Record<string, unknown>;
      const cueText = String(r.cueText ?? "").trim();
      if (!cueText) return null;
      return {
        id: String(r.id ?? `cue-${i + 1}`),
        cueOrder: Number(r.cueOrder ?? i + 1) || i + 1,
        cueText,
        linkedSegmentId:
          typeof r.linkedSegmentId === "string" ? r.linkedSegmentId : null,
        linkedAnswerText:
          typeof r.linkedAnswerText === "string" ? r.linkedAnswerText : null,
      } as Stage10Cue;
    })
    .filter((x): x is Stage10Cue => Boolean(x))
    .sort((a, b) => a.cueOrder - b.cueOrder);
}

export function composeSegmentsToText(segments: Stage10Segment[]): string {
  return segments
    .map((s) =>
      s.segmentType === "fixed_text"
        ? s.fixedText ?? ""
        : s.originalAnswerText ?? ""
    )
    .join("");
}

export function proposeFullSentenceSegments(english: string): Stage10Segment[] {
  const text = english ?? "";
  return [
    {
      id: newSegId(),
      segmentOrder: 1,
      segmentType: "answer_segment",
      originalAnswerText: text,
      answerTokens: tokenizeAnswerText(text),
      acceptedAnswers: [],
      englishStart: 0,
      englishEnd: text.length,
      ignoreExtraSpaces: true,
      ignoreTerminalPunctuation: true,
    },
  ];
}

/** 원문에서 start~end를 answer, 나머지를 fixed로 분할 (단일 구간) */
export function splitRangeIntoSegments(
  english: string,
  start: number,
  end: number
): Stage10Segment[] {
  const segs: Stage10Segment[] = [];
  let order = 1;
  if (start > 0) {
    segs.push({
      id: newSegId(),
      segmentOrder: order++,
      segmentType: "fixed_text",
      fixedText: english.slice(0, start),
    });
  }
  if (end > start) {
    const ans = english.slice(start, end);
    segs.push({
      id: newSegId(),
      segmentOrder: order++,
      segmentType: "answer_segment",
      originalAnswerText: ans,
      answerTokens: tokenizeAnswerText(ans),
      acceptedAnswers: [],
      englishStart: start,
      englishEnd: end,
      ignoreExtraSpaces: true,
      ignoreTerminalPunctuation: true,
    });
  }
  if (end < english.length) {
    segs.push({
      id: newSegId(),
      segmentOrder: order++,
      segmentType: "fixed_text",
      fixedText: english.slice(end),
    });
  }
  return segs;
}

export function validateStage10Item(
  english: string,
  draft: Stage10ItemDraft
): string | null {
  if (!draft.sentence_ids.length) return "sourceSentenceIds가 비어 있습니다.";
  const segs = parseWritingSegments(draft.writing_segments);
  if (segs.length < 1) return "세그먼트가 없습니다.";
  const answerSegs = segs.filter((s) => s.segmentType === "answer_segment");
  if (draft.writing_input_mode === "guided_segments" && answerSegs.length < 1) {
    return "영작 구간이 없습니다.";
  }
  for (const s of answerSegs) {
    if (!String(s.originalAnswerText ?? "").trim()) {
      return "영작 구간 정답이 비어 있습니다.";
    }
    const tokens = s.answerTokens?.length
      ? s.answerTokens
      : tokenizeAnswerText(s.originalAnswerText ?? "");
    if (tokens.length < 1) return "정답 토큰이 비어 있습니다.";
    if (assembleTokens(tokens) !== (s.originalAnswerText ?? "").trim()) {
      // allow punctuation differences by normalizing spaces
      const a = normalizeWritingAnswer(assembleTokens(tokens));
      const b = normalizeWritingAnswer(s.originalAnswerText ?? "");
      if (a !== b) {
        return "token_slots의 토큰 합이 정답 구문과 다릅니다.";
      }
    }
  }
  const composed = composeSegmentsToText(segs);
  const a = normalizeWritingAnswer(composed, { ignoreTerminalPunctuation: false });
  const b = normalizeWritingAnswer(english, { ignoreTerminalPunctuation: false });
  if (a !== b) {
    // soft: allow if full_sentence mode and answer_text matches
    if (draft.writing_input_mode === "full_sentence") {
      const full = normalizeWritingAnswer(draft.full_english || english);
      if (full !== b) {
        return "세그먼트를 합친 결과가 원문과 다릅니다.";
      }
    } else {
      return "세그먼트를 합친 결과가 원문과 다릅니다.";
    }
  }
  const cues = parseWritingCues(draft.writing_cues);
  const orders = new Set(cues.map((c) => c.cueOrder));
  if (orders.size !== cues.length) return "cueOrder가 중복됩니다.";
  if (cues.length < 1) return "제시어가 없습니다.";
  return null;
}

export function collectStage10Warnings(
  english: string,
  draft: Stage10ItemDraft
): string[] {
  const warnings: string[] = [];
  const segs = parseWritingSegments(draft.writing_segments);
  const fixedLen = segs
    .filter((s) => s.segmentType === "fixed_text")
    .reduce((n, s) => n + (s.fixedText?.length ?? 0), 0);
  if (english.length > 0 && fixedLen / english.length >= STAGE10_DEFAULT_THRESHOLDS.warnFixedRatio) {
    warnings.push(
      "이 문항의 80% 이상이 고정 표현으로 제공됩니다. 영작 학습 분량이 충분한지 확인해 주세요."
    );
  }
  if (!String(draft.korean_prompt ?? "").trim()) {
    warnings.push("우리말 해석이 비어 있습니다.");
  }
  return warnings;
}

export function toStudentStage10Item(item: ExamStage10Item): ExamStage10ItemPublic {
  const segs = parseWritingSegments(item.writing_segments);
  const cues = parseWritingCues(item.writing_cues);
  return {
    id: item.id,
    itemOrder: item.blank_order,
    koreanPrompt: item.selected_text || "",
    inputMode: item.writing_input_mode || "guided_segments",
    blankDisplayMode: item.writing_blank_display_mode || "token_slots",
    segments: segs.map((s) => {
      if (s.segmentType === "fixed_text") {
        return {
          id: s.id,
          segmentOrder: s.segmentOrder,
          segmentType: "fixed_text" as const,
          fixedText: s.fixedText ?? "",
        };
      }
      const tokens = s.answerTokens?.length
        ? s.answerTokens
        : tokenizeAnswerText(s.originalAnswerText ?? "");
      return {
        id: s.id,
        segmentOrder: s.segmentOrder,
        segmentType: "answer_segment" as const,
        tokenSlotCount:
          item.writing_blank_display_mode === "token_slots"
            ? tokens.length
            : undefined,
      };
    }),
    cues: cues.map((c) => ({
      id: c.id,
      cueOrder: c.cueOrder,
      cueText: c.cueText,
    })),
    hasHint: Boolean(item.hint?.trim()),
    isRequired: item.is_required,
  };
}

export function assembleSegmentStudentValue(
  ans: Stage10SegmentAnswer | undefined,
  displayMode: Stage10BlankDisplayMode
): string {
  if (!ans) return "";
  if (displayMode === "token_slots" || ans.tokens) {
    return assembleTokens(ans.tokens ?? []);
  }
  return String(ans.value ?? ans.assembledValue ?? "").trim();
}

export function gradeSegment(
  seg: Stage10Segment,
  studentValue: string
): boolean {
  if (seg.segmentType !== "answer_segment") return true;
  return answersMatch(
    studentValue,
    seg.originalAnswerText ?? "",
    seg.acceptedAnswers ?? [],
    {
      caseSensitive: seg.caseSensitive,
      ignoreExtraSpaces: seg.ignoreExtraSpaces !== false,
      ignoreTerminalPunctuation: seg.ignoreTerminalPunctuation !== false,
    }
  );
}

export function gradeItem(
  item: ExamStage10Item,
  state: Stage10ItemAnswerState
): boolean {
  if (item.writing_input_mode === "full_sentence") {
    return answersMatch(
      state.fullSentenceAnswer ?? "",
      item.answer_text,
      item.accepted_answers ?? [],
      { ignoreTerminalPunctuation: true }
    );
  }
  const segs = parseWritingSegments(item.writing_segments).filter(
    (s) => s.segmentType === "answer_segment"
  );
  if (segs.length < 1) return false;
  for (const seg of segs) {
    const val = assembleSegmentStudentValue(
      state.segmentAnswers[seg.id],
      item.writing_blank_display_mode
    );
    if (!val.trim()) return false;
    if (!gradeSegment(seg, val)) return false;
  }
  return true;
}

export function analyzeTokenDiff(
  expected: string[],
  actual: string[]
): Array<{
  type: "missing_token" | "extra_token" | "wrong_order" | "spelling_error" | "ok";
  index: number;
  expected?: string;
  actual?: string;
}> {
  const out: Array<{
    type: "missing_token" | "extra_token" | "wrong_order" | "spelling_error" | "ok";
    index: number;
    expected?: string;
    actual?: string;
  }> = [];
  const max = Math.max(expected.length, actual.length);
  for (let i = 0; i < max; i++) {
    const e = expected[i];
    const a = actual[i];
    if (e == null && a != null) {
      out.push({ type: "extra_token", index: i, actual: a });
    } else if (e != null && a == null) {
      out.push({ type: "missing_token", index: i, expected: e });
    } else if (e != null && a != null) {
      const ne = normalizeWritingAnswer(e);
      const na = normalizeWritingAnswer(a);
      if (ne === na) out.push({ type: "ok", index: i, expected: e, actual: a });
      else if (expected.map((x) => normalizeWritingAnswer(x)).includes(na)) {
        out.push({ type: "wrong_order", index: i, expected: e, actual: a });
      } else {
        out.push({ type: "spelling_error", index: i, expected: e, actual: a });
      }
    }
  }
  return out;
}

export function feedbackForDiff(
  diffs: ReturnType<typeof analyzeTokenDiff>
): string {
  const miss = diffs.find((d) => d.type === "missing_token");
  if (miss) return "이 구간에 필요한 단어가 하나 빠졌습니다.";
  const order = diffs.find((d) => d.type === "wrong_order");
  if (order) return "단어의 순서를 다시 확인해 보세요.";
  const spell = diffs.find((d) => d.type === "spelling_error");
  if (spell) {
    return `${(spell.index ?? 0) + 1}번째 칸의 단어 형태를 다시 확인해 보세요.`;
  }
  return "원문의 표현과 다른 단어가 있습니다.";
}

export const STAGE10_FLOW_HINTS = [
  "제시어의 형태를 문맥에 맞게 바꿔 보세요.",
  "주어 다음에 필요한 동사 표현을 확인해 보세요.",
  "완료형과 진행형에 필요한 형태를 확인해 보세요.",
  "수동태에 필요한 be동사와 과거분사를 확인해 보세요.",
  "단수와 복수 형태를 확인해 보세요.",
  "명사 앞에 필요한 관사나 소유격을 확인해 보세요.",
  "전치사가 빠지지 않았는지 확인해 보세요.",
  "제시어는 순서대로 사용해야 합니다.",
] as const;

export function writingHintForAttempt(attempts: number): string {
  const i = Math.max(0, attempts - 1) % STAGE10_FLOW_HINTS.length;
  return STAGE10_FLOW_HINTS[i]!;
}

export function canCompleteStage10(
  items: ExamStage10Item[],
  answers: Record<string, Stage10ItemAnswerState>
): boolean {
  const required = items.filter((i) => i.is_required);
  if (required.length < 1) return false;
  for (const item of required) {
    if (answers[item.id]?.isCorrect !== true) return false;
  }
  return true;
}

export function computeStage10Score(
  items: ExamStage10Item[],
  correctIds: Set<string> | string[]
): number {
  const required = items.filter((i) => i.is_required);
  if (required.length < 1) return 0;
  const set = correctIds instanceof Set ? correctIds : new Set(correctIds);
  const n = required.filter((i) => set.has(i.id)).length;
  return Math.round((n / required.length) * 100);
}

export { parseSentenceIds, compareEnglishBlankAnswer };
