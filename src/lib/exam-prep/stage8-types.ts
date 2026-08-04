import {
  isEnglishBlankPunctuationOnly,
  normalizeEnglishBlankAnswer,
  normalizeEnglishQuotes,
} from "@/lib/exam-prep/english-blank-normalize";
import { findOverlappingBlanks } from "@/lib/exam-prep/stage2-types";
import { shuffleOptionIds } from "@/lib/exam-prep/stage6-types";

export type Stage8Chunk = {
  id: string;
  chunkOrder: number;
  chunkText: string;
};

export type ExamStage8Group = {
  id: string;
  academy_id: string;
  passage_id: string;
  sentence_id: string;
  stage_number: 8;
  blank_order: number;
  answer_text: string;
  accepted_answers: string[];
  english_start: number;
  english_end: number;
  selected_text: string;
  answer_snapshot: string;
  reorder_chunks: Stage8Chunk[];
  hint: string | null;
  explanation: string | null;
  is_required: boolean;
  created_at: string;
  updated_at: string;
};

export type Stage8ChunkPublic = {
  id: string;
  text: string;
};

export type ExamStage8GroupPublic = {
  id: string;
  sentenceId: string;
  groupOrder: number;
  englishStart: number;
  englishEnd: number;
  chunks: Stage8ChunkPublic[];
  /** 셔플된 초기 제시 순서 (정답 순서 아님) */
  initialOrder: string[];
  hasHint: boolean;
  isRequired: boolean;
};

export type Stage8LayoutSeg =
  | { type: "fixed"; text: string }
  | { type: "reorder_group"; groupId: string };

export type Stage8AnswerState = {
  studentOrder: string[];
  initialOrder: string[];
  isCorrect: boolean | null;
  attempts: number;
  hintUsed: boolean;
  answerRevealed: boolean;
  hintText?: string | null;
  revealedOrder?: string[] | null;
};

export type ExamStage8Progress = {
  id: string;
  academy_id: string;
  assignment_student_id: string;
  passage_id: string;
  stage_number: number;
  answers: Record<string, Stage8AnswerState>;
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

export const STAGE8_DEFAULT_THRESHOLDS = {
  hintAfterWrong: 2,
  revealAfterWrong: 4,
  warnChunkCount: 12,
} as const;

export type Stage8GroupDraft = {
  id?: string;
  sentence_id: string;
  blank_order: number;
  english_start: number;
  english_end: number;
  original_text: string;
  chunks: Stage8Chunk[];
  hint?: string | null;
  explanation?: string | null;
  is_required?: boolean;
};

export function newChunkId(): string {
  return `chk-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

export function parseReorderChunks(raw: unknown): Stage8Chunk[] {
  if (!Array.isArray(raw)) return [];
  const out: Stage8Chunk[] = [];
  raw.forEach((o, i) => {
    if (!o || typeof o !== "object") return;
    const r = o as Record<string, unknown>;
    const text = String(r.chunkText ?? r.text ?? "").trim();
    if (!text) return;
    out.push({
      id: String(r.id ?? `chunk-${i + 1}`),
      chunkOrder: Number(r.chunkOrder ?? i + 1) || i + 1,
      chunkText: text,
    });
  });
  return out.sort((a, b) => a.chunkOrder - b.chunkOrder);
}

/** 공백 기준 초기 카드 제안 (구두점은 앞 단어에 유지) */
export function proposeChunksFromText(text: string): Stage8Chunk[] {
  const trimmed = text.trim();
  if (!trimmed) return [];
  const parts = trimmed.split(/\s+/).filter(Boolean);
  return parts.map((p, i) => ({
    id: newChunkId(),
    chunkOrder: i + 1,
    chunkText: p,
  }));
}

export function joinChunkTexts(texts: string[]): string {
  let out = "";
  for (const raw of texts) {
    const t = raw ?? "";
    if (!t) continue;
    if (!out) {
      out = t;
      continue;
    }
    if (/^[.,!?;:'")\]]/.test(t)) out += t;
    else if (/[(["']$/.test(out)) out += t;
    else out += ` ${t}`;
  }
  return out;
}

export function chunksMatchOriginal(
  chunks: Stage8Chunk[],
  originalText: string
): boolean {
  const joined = joinChunkTexts(
    [...chunks].sort((a, b) => a.chunkOrder - b.chunkOrder).map((c) => c.chunkText)
  );
  const a = normalizeEnglishQuotes(joined).replace(/\s+/g, " ").trim();
  const b = normalizeEnglishQuotes(originalText).replace(/\s+/g, " ").trim();
  return a === b;
}

export function mergeChunks(
  chunks: Stage8Chunk[],
  indices: number[]
): Stage8Chunk[] {
  const sorted = [...indices].sort((a, b) => a - b);
  if (sorted.length < 2) return chunks;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1]! + 1) {
      throw new Error("인접한 카드만 합칠 수 있습니다.");
    }
  }
  const start = sorted[0]!;
  const end = sorted[sorted.length - 1]!;
  const mergedText = joinChunkTexts(
    chunks.slice(start, end + 1).map((c) => c.chunkText)
  );
  const next: Stage8Chunk[] = [
    ...chunks.slice(0, start),
    {
      id: newChunkId(),
      chunkOrder: start + 1,
      chunkText: mergedText,
    },
    ...chunks.slice(end + 1),
  ];
  return next.map((c, i) => ({ ...c, chunkOrder: i + 1 }));
}

export function splitChunkAt(
  chunks: Stage8Chunk[],
  index: number,
  splitAt: number
): Stage8Chunk[] {
  const chunk = chunks[index];
  if (!chunk) return chunks;
  const text = chunk.chunkText;
  if (splitAt <= 0 || splitAt >= text.length) return chunks;
  const left = text.slice(0, splitAt).trimEnd();
  const right = text.slice(splitAt).trimStart();
  if (!left || !right) return chunks;
  const next: Stage8Chunk[] = [
    ...chunks.slice(0, index),
    { id: newChunkId(), chunkOrder: index + 1, chunkText: left },
    { id: newChunkId(), chunkOrder: index + 2, chunkText: right },
    ...chunks.slice(index + 1),
  ];
  return next.map((c, i) => ({ ...c, chunkOrder: i + 1 }));
}

export function buildSentenceLayout(
  englishText: string,
  groups: Array<{ id: string; english_start: number; english_end: number }>
): Stage8LayoutSeg[] {
  const sorted = [...groups].sort((a, b) => a.english_start - b.english_start);
  const out: Stage8LayoutSeg[] = [];
  let cursor = 0;
  for (const g of sorted) {
    if (g.english_start > cursor) {
      out.push({
        type: "fixed",
        text: englishText.slice(cursor, g.english_start),
      });
    }
    out.push({ type: "reorder_group", groupId: g.id });
    cursor = g.english_end;
  }
  if (cursor < englishText.length) {
    out.push({ type: "fixed", text: englishText.slice(cursor) });
  }
  return out;
}

export function toStudentStage8Group(
  g: ExamStage8Group,
  seed: string,
  existingInitial?: string[]
): ExamStage8GroupPublic {
  const chunks = parseReorderChunks(g.reorder_chunks);
  const ids = chunks.map((c) => c.id);
  let initial =
    existingInitial && existingInitial.length === ids.length
      ? existingInitial
      : shuffleOptionIds(ids, seed);
  // 정답 순서와 같으면 재셔플
  const correct = ids.join(",");
  let guard = 0;
  while (initial.join(",") === correct && ids.length >= 2 && guard < 8) {
    initial = shuffleOptionIds(ids, `${seed}:retry:${guard}`);
    guard++;
  }
  if (initial.join(",") === correct && ids.length === 2) {
    initial = [ids[1]!, ids[0]!];
  }
  return {
    id: g.id,
    sentenceId: g.sentence_id,
    groupOrder: g.blank_order,
    englishStart: g.english_start,
    englishEnd: g.english_end,
    chunks: chunks.map((c) => ({ id: c.id, text: c.chunkText })),
    initialOrder: initial,
    hasHint: Boolean(g.hint?.trim()),
    isRequired: g.is_required,
  };
}

export function gradeChunkOrder(
  chunks: Stage8Chunk[],
  studentOrder: string[],
  originalText: string
): boolean {
  const sorted = [...chunks].sort((a, b) => a.chunkOrder - b.chunkOrder);
  const correctIds = sorted.map((c) => c.id);
  if (
    studentOrder.length !== correctIds.length ||
    new Set(studentOrder).size !== studentOrder.length
  ) {
    return false;
  }
  for (const id of studentOrder) {
    if (!correctIds.includes(id)) return false;
  }
  // ID 순서 일치
  if (studentOrder.every((id, i) => id === correctIds[i])) return true;

  // 동일 텍스트 카드 예외: 완성 문자열이 원문과 같으면 인정
  const byId = new Map(chunks.map((c) => [c.id, c.chunkText]));
  const texts = studentOrder.map((id) => byId.get(id) ?? "");
  const hasDupText =
    new Set(sorted.map((c) => c.chunkText.toLowerCase())).size <
    sorted.length;
  if (!hasDupText) return false;
  const rendered = joinChunkTexts(texts);
  const a = normalizeEnglishBlankAnswer(rendered, {
    caseSensitive: false,
    ignoreExtraSpaces: true,
  });
  const b = normalizeEnglishBlankAnswer(originalText, {
    caseSensitive: false,
    ignoreExtraSpaces: true,
  });
  return a === b;
}

export function validateStage8GroupAgainstText(
  englishText: string,
  draft: Pick<
    Stage8GroupDraft,
    "english_start" | "english_end" | "original_text" | "chunks"
  >
): string | null {
  const { english_start: start, english_end: end } = draft;
  const original = draft.original_text;
  if (start < 0 || end <= start) return "배열 범위가 올바르지 않습니다.";
  if (end > englishText.length) return "배열 범위가 문장 길이를 초과합니다.";
  const slice = englishText.slice(start, end);
  if (slice !== original) {
    return `선택 「${original}」가 현재 원문의 [${start},${end}) 「${slice}」와 일치하지 않습니다.`;
  }
  if (!original.trim()) return "배열 범위가 비어 있습니다.";
  if (isEnglishBlankPunctuationOnly(original)) {
    return "문장 부호만 배열 구간으로 지정할 수 없습니다.";
  }
  const chunks = parseReorderChunks(draft.chunks);
  if (chunks.length < 2) return "배열 구간에는 카드가 최소 2개 필요합니다.";
  if (chunks.some((c) => !c.chunkText.trim())) {
    return "빈 카드가 있습니다.";
  }
  if (chunks.some((c) => isEnglishBlankPunctuationOnly(c.chunkText))) {
    return "문장 부호만 있는 카드가 있습니다.";
  }
  const ids = chunks.map((c) => c.id);
  if (new Set(ids).size !== ids.length) return "카드 ID가 중복됩니다.";
  if (!chunksMatchOriginal(chunks, original)) {
    return "카드를 합친 결과가 원문 구간과 일치하지 않습니다.";
  }
  const uniqueTexts = new Set(chunks.map((c) => c.chunkText.toLowerCase()));
  if (uniqueTexts.size === 1) {
    return "모든 카드 텍스트가 동일합니다.";
  }
  return null;
}

export function collectStage8Warnings(
  englishBySentence: Map<string, string>,
  drafts: Stage8GroupDraft[]
): string[] {
  const warnings: string[] = [];
  if (drafts.length === 0) {
    warnings.push("지문 전체에 배열 구간이 없습니다.");
  }
  const bySentence = new Map<string, Stage8GroupDraft[]>();
  for (const d of drafts) {
    const list = bySentence.get(d.sentence_id) ?? [];
    list.push(d);
    bySentence.set(d.sentence_id, list);
  }
  for (const [sid, list] of bySentence) {
    const english = englishBySentence.get(sid) ?? "";
    const overlap = findOverlappingBlanks(
      list.map((b) => ({
        korean_start: b.english_start,
        korean_end: b.english_end,
        id: b.id,
      }))
    );
    if (overlap) warnings.push(overlap.replace("빈칸", "배열 구간"));
    for (const d of list) {
      if (d.chunks.length >= STAGE8_DEFAULT_THRESHOLDS.warnChunkCount) {
        warnings.push(
          `「${d.original_text.slice(0, 20)}…」: 카드가 ${d.chunks.length}개입니다. 모바일에서 어려울 수 있습니다.`
        );
      }
      const err = validateStage8GroupAgainstText(english, d);
      if (err) warnings.push(err);
    }
  }
  return warnings;
}

export function canCompleteStage8(
  groups: ExamStage8Group[],
  answers: Record<string, Stage8AnswerState>
): boolean {
  const required = groups.filter((g) => g.is_required);
  if (required.length < 1) return false;
  for (const g of required) {
    const a = answers[g.id];
    if (!a?.isCorrect) return false;
  }
  return true;
}

export const STAGE8_STRUCTURE_HINTS = [
  "주어가 문장의 앞부분에 있는지 확인해 보세요.",
  "조동사와 본동사의 순서를 확인해 보세요.",
  "수식어가 꾸미는 명사 가까이에 있는지 확인해 보세요.",
  "전치사구의 위치를 확인해 보세요.",
  "접속사 뒤에 완전한 절이 이어지는지 확인해 보세요.",
  "관계절이 수식하는 명사 뒤에 있는지 확인해 보세요.",
  "주어와 동사를 먼저 찾아 배열해 보세요.",
] as const;

export function structureHintForAttempt(attempts: number): string {
  const i = Math.max(0, attempts - 1) % STAGE8_STRUCTURE_HINTS.length;
  return STAGE8_STRUCTURE_HINTS[i]!;
}

export function computeStage8Score(
  groups: ExamStage8Group[],
  correctIds: Set<string> | string[]
): number {
  const required = groups.filter((g) => g.is_required);
  if (required.length < 1) return 0;
  const set = correctIds instanceof Set ? correctIds : new Set(correctIds);
  const n = required.filter((g) => set.has(g.id)).length;
  return Math.round((n / required.length) * 100);
}

export { shuffleOptionIds };
