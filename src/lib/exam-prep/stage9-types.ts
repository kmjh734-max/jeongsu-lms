import { shuffleOptionIds } from "@/lib/exam-prep/stage6-types";

export type Stage9AnswerMode = "label_sequence" | "drag_blocks";

export type Stage9TeacherRole =
  | "introduction"
  | "background"
  | "problem"
  | "cause"
  | "example"
  | "development"
  | "contrast"
  | "result"
  | "solution"
  | "conclusion"
  | "closing"
  | "other";

export const STAGE9_ROLE_LABELS: Record<Stage9TeacherRole, string> = {
  introduction: "도입",
  background: "배경 설명",
  problem: "문제 제기",
  cause: "원인",
  example: "사례",
  development: "전개",
  contrast: "대조",
  result: "결과",
  solution: "해결책",
  conclusion: "결론",
  closing: "마무리",
  other: "기타",
};

export type Stage9CohesionClue = {
  text: string;
  type: string;
  explanation: string;
};

export type ExamStage9Block = {
  id: string;
  academy_id: string;
  passage_id: string;
  sentence_id: string;
  stage_number: 9;
  blank_order: number;
  answer_text: string;
  selected_text: string;
  answer_snapshot: string;
  sentence_ids: string[];
  display_label: string;
  teacher_role: Stage9TeacherRole | null;
  cohesion_clues: Stage9CohesionClue[];
  hint: string | null;
  explanation: string | null;
  is_required: boolean;
  created_at: string;
  updated_at: string;
};

export type Stage9PassageConfig = {
  fixedPrefix: string;
  fixedSuffix: string;
  answerMode: Stage9AnswerMode;
  structureHint: string | null;
  contentVersion: number;
  published: boolean;
};

export type ExamStage9BlockPublic = {
  id: string;
  displayLabel: string;
  blockText: string;
};

export type ExamStage9ProblemPublic = {
  fixedPrefix: string;
  fixedSuffix: string;
  answerMode: Stage9AnswerMode;
  contentVersion: number;
  blocks: ExamStage9BlockPublic[];
  hasStructureHint: boolean;
};

export type Stage9AttemptRecord = {
  attemptNumber: number;
  orderedBlockIds: string[];
  isCorrect: boolean;
  submittedAt: string;
};

export type Stage9AnswerState = {
  orderedBlockIds: string[];
  selectedLabels: string[];
  attempts: number;
  isCorrect: boolean | null;
  hintUsed: boolean;
  answerRevealed: boolean;
  hintText?: string | null;
  revealedLabels?: string[] | null;
  usedHintTypes?: string[];
  attemptHistory?: Stage9AttemptRecord[];
  contentVersion?: number;
};

export type ExamStage9Progress = {
  id: string;
  academy_id: string;
  assignment_student_id: string;
  passage_id: string;
  stage_number: number;
  answers: Stage9AnswerState;
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

export const STAGE9_DEFAULT_THRESHOLDS = {
  structureHintAfter: 1,
  firstRoleHintAfter: 2,
  cohesionHintAfter: 3,
  edgeHintAfter: 4,
  revealAfterWrong: 5,
  warnBlockCount: 7,
} as const;

export type Stage9BlockDraft = {
  id?: string;
  sentence_ids: string[];
  blank_order: number;
  display_label?: string;
  teacher_role?: Stage9TeacherRole | null;
  cohesion_clues?: Stage9CohesionClue[];
  hint?: string | null;
  explanation?: string | null;
  is_required?: boolean;
};

export type Stage9ConfigDraft = {
  fixedPrefix: string;
  fixedSuffix: string;
  answerMode: Stage9AnswerMode;
  structureHint?: string | null;
  blocks: Stage9BlockDraft[];
};

export function parseSentenceIds(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map(String).filter(Boolean);
}

export function parseCohesionClues(raw: unknown): Stage9CohesionClue[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((o) => {
      if (!o || typeof o !== "object") return null;
      const r = o as Record<string, unknown>;
      const text = String(r.text ?? "").trim();
      if (!text) return null;
      return {
        text,
        type: String(r.type ?? "other"),
        explanation: String(r.explanation ?? ""),
      };
    })
    .filter((x): x is Stage9CohesionClue => Boolean(x));
}

export function labelForIndex(index: number): string {
  return String.fromCharCode(65 + index); // A, B, C...
}

/** 정답 blank_order와 다른 라벨 순서로 A.. 배정 */
export function assignShuffledLabels(
  blockCount: number,
  seed: string
): string[] {
  const labels = Array.from({ length: blockCount }, (_, i) => labelForIndex(i));
  if (blockCount < 2) return labels;
  let shuffled = shuffleOptionIds(labels, seed);
  let guard = 0;
  while (shuffled.join("") === labels.join("") && guard < 8) {
    shuffled = shuffleOptionIds(labels, `${seed}:r${guard}`);
    guard++;
  }
  if (shuffled.join("") === labels.join("") && blockCount === 2) {
    shuffled = [labels[1]!, labels[0]!];
  }
  return shuffled;
}

export function renderBlockText(
  sentenceIds: string[],
  englishById: Map<string, string>
): string {
  return sentenceIds
    .map((id) => (englishById.get(id) ?? "").trim())
    .filter(Boolean)
    .join(" ");
}

export function areSentenceIdsContiguous(
  sentenceIds: string[],
  orderedSentenceIds: string[]
): boolean {
  if (sentenceIds.length === 0) return false;
  const index = new Map(orderedSentenceIds.map((id, i) => [id, i]));
  const positions: number[] = [];
  for (const id of sentenceIds) {
    const p = index.get(id);
    if (p == null) return false;
    positions.push(p);
  }
  positions.sort((a, b) => a - b);
  for (let i = 1; i < positions.length; i++) {
    if (positions[i] !== positions[i - 1]! + 1) return false;
  }
  return true;
}

export function sortSentenceIdsByPassage(
  sentenceIds: string[],
  orderedSentenceIds: string[]
): string[] {
  const index = new Map(orderedSentenceIds.map((id, i) => [id, i]));
  return [...sentenceIds].sort(
    (a, b) => (index.get(a) ?? 0) - (index.get(b) ?? 0)
  );
}

export function validateStage9Blocks(
  orderedSentenceIds: string[],
  drafts: Stage9BlockDraft[],
  opts?: { fixedPrefixSentenceIds?: string[]; fixedSuffixSentenceIds?: string[] }
): string | null {
  if (drafts.length < 2) {
    return "문단 배열 문제는 최소 2개의 배열 블록이 필요합니다.";
  }
  const used = new Set<string>();
  const labels = new Set<string>();
  const orders = new Set<number>();
  for (const d of drafts) {
    if (d.sentence_ids.length < 1) {
      return "비어 있는 문단 블록이 있습니다.";
    }
    if (!areSentenceIdsContiguous(d.sentence_ids, orderedSentenceIds)) {
      return "하나의 문단 블록에는 원문에서 연속된 문장만 포함할 수 있습니다.";
    }
    for (const sid of d.sentence_ids) {
      if (!orderedSentenceIds.includes(sid)) {
        return "존재하지 않는 문장이 블록에 포함되어 있습니다.";
      }
      if (used.has(sid)) {
        return "같은 문장이 여러 블록에 중복 포함되어 있습니다.";
      }
      used.add(sid);
    }
    if (orders.has(d.blank_order)) {
      return "blockOrder(정답 순서)가 중복됩니다.";
    }
    orders.add(d.blank_order);
    const label = (d.display_label ?? "").trim();
    if (label) {
      if (labels.has(label)) return "displayLabel이 중복됩니다.";
      labels.add(label);
    }
  }

  // blockOrder must match document order of blocks
  const byOrder = [...drafts].sort((a, b) => a.blank_order - b.blank_order);
  let lastEnd = -1;
  for (const d of byOrder) {
    const start = orderedSentenceIds.indexOf(d.sentence_ids[0]!);
    const end = orderedSentenceIds.indexOf(
      d.sentence_ids[d.sentence_ids.length - 1]!
    );
    if (start <= lastEnd) {
      return "정답 순서(blockOrder)가 원문 문장 순서와 일치하지 않습니다.";
    }
    lastEnd = end;
  }

  const fixed = new Set([
    ...(opts?.fixedPrefixSentenceIds ?? []),
    ...(opts?.fixedSuffixSentenceIds ?? []),
  ]);
  for (const sid of used) {
    if (fixed.has(sid)) {
      return "고정 영역 문장이 배열 블록에도 포함되어 있습니다.";
    }
  }

  return null;
}

export function collectStage9Warnings(
  orderedSentenceIds: string[],
  drafts: Stage9BlockDraft[],
  config: Pick<Stage9ConfigDraft, "fixedPrefix" | "fixedSuffix">
): string[] {
  const warnings: string[] = [];
  if (drafts.length >= STAGE9_DEFAULT_THRESHOLDS.warnBlockCount) {
    warnings.push(
      `문단 블록이 ${drafts.length}개로 많아 학생이 전체 흐름을 파악하기 어려울 수 있습니다.`
    );
  }
  const covered = new Set(drafts.flatMap((d) => d.sentence_ids));
  // if no fixed text, warn about uncovered body sentences
  const hasFixed =
    Boolean(config.fixedPrefix.trim()) || Boolean(config.fixedSuffix.trim());
  if (!hasFixed) {
    const missing = orderedSentenceIds.filter((id) => !covered.has(id));
    if (missing.length > 0) {
      warnings.push(
        `본문 문장 ${missing.length}개가 어느 블록에도 포함되지 않았습니다.`
      );
    }
  } else {
    const missing = orderedSentenceIds.filter((id) => !covered.has(id));
    if (missing.length > 0) {
      warnings.push(
        `배열 블록에 없는 문장이 ${missing.length}개입니다. 고정 도입/마무리로 처리했는지 확인하세요.`
      );
    }
  }
  const allSingle = drafts.every((d) => d.sentence_ids.length === 1);
  if (allSingle && drafts.length >= 3) {
    warnings.push(
      "모든 블록이 한 문장씩만 포함되어 문단 학습 취지와 맞지 않을 수 있습니다."
    );
  }
  const labels = drafts.map((d, i) => d.display_label || labelForIndex(i));
  const natural = drafts
    .map((_, i) => labelForIndex(i))
    .join("");
  if (labels.join("") === natural && drafts.length >= 2) {
    warnings.push(
      "표시 라벨 순서가 정답 순서와 같습니다. 공개 전 라벨을 섞어 주세요."
    );
  }
  return warnings;
}

export function correctBlockIds(blocks: ExamStage9Block[]): string[] {
  return [...blocks]
    .sort((a, b) => a.blank_order - b.blank_order)
    .map((b) => b.id);
}

export function gradeBlockOrder(
  blocks: ExamStage9Block[],
  orderedBlockIds: string[]
): boolean {
  const correct = correctBlockIds(blocks);
  if (orderedBlockIds.length !== correct.length) return false;
  if (new Set(orderedBlockIds).size !== orderedBlockIds.length) return false;
  const set = new Set(correct);
  for (const id of orderedBlockIds) {
    if (!set.has(id)) return false;
  }
  return orderedBlockIds.every((id, i) => id === correct[i]);
}

export function validateSubmittedOrder(
  blocks: ExamStage9Block[],
  orderedBlockIds: string[]
): string | null {
  const ids = blocks.map((b) => b.id);
  const set = new Set(ids);
  if (orderedBlockIds.length !== ids.length) {
    return "모든 문단의 순서를 정해 주세요.";
  }
  if (new Set(orderedBlockIds).size !== orderedBlockIds.length) {
    return "같은 문단을 두 번 사용할 수 없습니다.";
  }
  for (const id of orderedBlockIds) {
    if (!set.has(id)) {
      return "유효하지 않은 문단이 포함되어 있습니다.";
    }
  }
  return null;
}

export function toStudentStage9Problem(
  config: Stage9PassageConfig,
  blocks: ExamStage9Block[]
): ExamStage9ProblemPublic {
  const publicBlocks: ExamStage9BlockPublic[] = [...blocks]
    .sort((a, b) =>
      String(a.display_label).localeCompare(String(b.display_label))
    )
    .map((b) => ({
      id: b.id,
      displayLabel: b.display_label,
      blockText: b.selected_text || b.answer_text,
    }));
  return {
    fixedPrefix: config.fixedPrefix,
    fixedSuffix: config.fixedSuffix,
    answerMode: config.answerMode,
    contentVersion: config.contentVersion,
    blocks: publicBlocks,
    hasStructureHint: Boolean(config.structureHint?.trim()),
  };
}

export function canCompleteStage9(
  blocks: ExamStage9Block[],
  answer: Stage9AnswerState | null | undefined
): boolean {
  if (blocks.length < 2) return false;
  if (!answer || answer.isCorrect !== true) return false;
  return gradeBlockOrder(blocks, answer.orderedBlockIds ?? []);
}

export const STAGE9_FLOW_HINTS = [
  "글의 주제를 처음 제시하는 문단을 찾아보세요.",
  "앞 문단의 내용을 받는 지시어가 있는지 확인해 보세요.",
  "문제 상황 다음에 원인이나 결과가 이어지는지 확인해 보세요.",
  "시간을 나타내는 표현으로 순서를 확인해 보세요.",
  "Then, however, therefore 등의 연결 표현을 확인해 보세요.",
  "결론이나 해결책을 제시하는 문단을 마지막에 배치해 보세요.",
  "대명사가 가리키는 대상이 앞 문단에 있는지 확인해 보세요.",
] as const;

export function flowHintForAttempt(attempts: number): string {
  const i = Math.max(0, attempts - 1) % STAGE9_FLOW_HINTS.length;
  return STAGE9_FLOW_HINTS[i]!;
}

export function mergeBlocks(
  drafts: Stage9BlockDraft[],
  indices: number[]
): Stage9BlockDraft[] {
  const sorted = [...indices].sort((a, b) => a - b);
  if (sorted.length < 2) return drafts;
  for (let i = 1; i < sorted.length; i++) {
    if (sorted[i] !== sorted[i - 1]! + 1) {
      throw new Error("인접한 블록만 합칠 수 있습니다.");
    }
  }
  const start = sorted[0]!;
  const end = sorted[sorted.length - 1]!;
  const mergedIds = drafts
    .slice(start, end + 1)
    .flatMap((d) => d.sentence_ids);
  const next: Stage9BlockDraft[] = [
    ...drafts.slice(0, start),
    {
      ...drafts[start]!,
      id: undefined,
      sentence_ids: mergedIds,
    },
    ...drafts.slice(end + 1),
  ];
  return next.map((d, i) => ({ ...d, blank_order: i + 1 }));
}

export function splitBlockAt(
  drafts: Stage9BlockDraft[],
  index: number,
  splitAfterCount: number
): Stage9BlockDraft[] {
  const block = drafts[index];
  if (!block) return drafts;
  if (splitAfterCount < 1 || splitAfterCount >= block.sentence_ids.length) {
    return drafts;
  }
  const left = block.sentence_ids.slice(0, splitAfterCount);
  const right = block.sentence_ids.slice(splitAfterCount);
  const next: Stage9BlockDraft[] = [
    ...drafts.slice(0, index),
    { ...block, id: undefined, sentence_ids: left },
    {
      sentence_ids: right,
      blank_order: index + 2,
      teacher_role: null,
      cohesion_clues: [],
      is_required: true,
    },
    ...drafts.slice(index + 1),
  ];
  return next.map((d, i) => ({ ...d, blank_order: i + 1 }));
}

export { shuffleOptionIds };
