import { LINE_TRANSLATION_ALGORITHM_VERSION } from "@/lib/lesson-materials/line-translation-constants";
import { computeSentenceSourceHash } from "@/lib/lesson-materials/translation-meta";
import type { StoredSentenceTranslation } from "@/lib/lesson-materials/translation-meta";
import {
  countEnglishWords,
  formatWorkbookPassage,
} from "@/lib/lesson-materials/workbook-types";
import { stripLeadingSentenceMarkers } from "@/lib/lesson-materials/sentence-order-shuffle";

export type LineTranslationItem = {
  sentenceId: string;
  orderIndex: number;
  english: string;
  englishDisplay: string;
  korean: string;
  sourceHash: string;
  answerLineCount: number;
};

export type WorkbookLineTranslationSection = {
  projectId: string;
  title: string;
  source: string | null;
  items: LineTranslationItem[];
  algorithmVersion: string;
};

export type LineTranslationIssue = {
  sentenceId: string;
  orderIndex: number;
  kind:
    | "missing"
    | "empty"
    | "stale"
    | "duplicate"
    | "orphan"
    | "order_mismatch";
  message: string;
};

export type TranslationValidationResult = {
  isValid: boolean;
  passageId: string;
  title: string;
  sentenceCount: number;
  translationCount: number;
  missingSentenceIds: string[];
  staleSentenceIds: string[];
  duplicatedSentenceIds: string[];
  emptyTranslationSentenceIds: string[];
  issues: LineTranslationIssue[];
};

export type LineTranslationSkip = {
  projectId: string;
  title: string;
  reason: string;
  issues: LineTranslationIssue[];
};

/** Whitespace-only normalize for English comparison (no spelling changes). */
export function normalizeEnglishSource(text: string): string {
  return String(text ?? "")
    .replace(/\s+/g, " ")
    .trim();
}

export function getTranslationAnswerLineCount(english: string): number {
  const wordCount = countEnglishWords(english);
  if (wordCount <= 12) return 1;
  if (wordCount <= 25) return 2;
  if (wordCount <= 40) return 3;
  return 4;
}

function stripHtmlLike(text: string): string {
  return String(text ?? "")
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?p[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

/**
 * Resolve Korean for one sentence without AI.
 * Priority: sentenceId+sourceHash → sentenceId+normalized english → fail.
 */
export function matchStoredKorean(input: {
  sentenceId: string;
  orderIndex: number;
  english: string;
  stored: StoredSentenceTranslation | undefined;
}):
  | { ok: true; korean: string; sourceHash: string }
  | { ok: false; kind: "missing" | "empty" | "stale"; message: string } {
  const en = formatWorkbookPassage(input.english);
  const hash = computeSentenceSourceHash(en);
  const stored = input.stored;

  if (!stored) {
    return {
      ok: false,
      kind: "missing",
      message: `${input.orderIndex}번 문장에 저장된 한글 해석이 없습니다.`,
    };
  }

  const ko = stripHtmlLike(stored.koreanTranslation);
  if (!ko) {
    return {
      ok: false,
      kind: "empty",
      message: `${input.orderIndex}번 문장의 한글 해석이 비어 있습니다.`,
    };
  }

  if (stored.sourceHash === hash) {
    return { ok: true, korean: ko, sourceHash: hash };
  }

  // Same sentenceId + normalized English text (legacy hash drift)
  if (
    normalizeEnglishSource(stored.english).toLowerCase() ===
    normalizeEnglishSource(en).toLowerCase()
  ) {
    return { ok: true, korean: ko, sourceHash: hash };
  }

  return {
    ok: false,
    kind: "stale",
    message: `${input.orderIndex}번 문장의 저장된 해석이 현재 영어 원문과 일치하지 않습니다.`,
  };
}

export function validatePassageLineTranslations(input: {
  passageId: string;
  title: string;
  sentences: Array<{ id: string; english: string }>;
  storedTranslations: StoredSentenceTranslation[];
}): TranslationValidationResult {
  const issues: LineTranslationIssue[] = [];
  const sentences = input.sentences
    .map((s, i) => ({
      id: s.id,
      english: formatWorkbookPassage(s.english),
      orderIndex: i + 1,
    }))
    .filter((s) => s.english);

  const idCounts = new Map<string, number>();
  for (const s of sentences) {
    idCounts.set(s.id, (idCounts.get(s.id) ?? 0) + 1);
  }
  const duplicatedSentenceIds = [...idCounts.entries()]
    .filter(([, n]) => n > 1)
    .map(([id]) => id);
  for (const id of duplicatedSentenceIds) {
    const s = sentences.find((x) => x.id === id)!;
    issues.push({
      sentenceId: id,
      orderIndex: s.orderIndex,
      kind: "duplicate",
      message: `${s.orderIndex}번 문장 ID가 중복되었습니다.`,
    });
  }

  const byId = new Map<string, StoredSentenceTranslation>();
  for (const row of input.storedTranslations) {
    if (!row?.sentenceId) continue;
    if (byId.has(row.sentenceId)) {
      if (!duplicatedSentenceIds.includes(row.sentenceId)) {
        duplicatedSentenceIds.push(row.sentenceId);
      }
      issues.push({
        sentenceId: row.sentenceId,
        orderIndex: row.order || 0,
        kind: "duplicate",
        message: `저장된 해석에 중복된 문장 ID가 있습니다.`,
      });
    } else {
      byId.set(row.sentenceId, row);
    }
  }

  const missingSentenceIds: string[] = [];
  const staleSentenceIds: string[] = [];
  const emptyTranslationSentenceIds: string[] = [];
  let translationCount = 0;

  for (const s of sentences) {
    if (duplicatedSentenceIds.includes(s.id)) continue;
    const matched = matchStoredKorean({
      sentenceId: s.id,
      orderIndex: s.orderIndex,
      english: s.english,
      stored: byId.get(s.id),
    });
    if (!matched.ok) {
      issues.push({
        sentenceId: s.id,
        orderIndex: s.orderIndex,
        kind: matched.kind,
        message: matched.message,
      });
      if (matched.kind === "missing") missingSentenceIds.push(s.id);
      if (matched.kind === "stale") staleSentenceIds.push(s.id);
      if (matched.kind === "empty") emptyTranslationSentenceIds.push(s.id);
      continue;
    }
    translationCount += 1;
  }

  // Orphan stored rows (not in current passage) — informational, not blocking
  const sentenceIdSet = new Set(sentences.map((s) => s.id));
  for (const row of input.storedTranslations) {
    if (row?.sentenceId && !sentenceIdSet.has(row.sentenceId)) {
      issues.push({
        sentenceId: row.sentenceId,
        orderIndex: row.order || 0,
        kind: "orphan",
        message: `현재 원문에 없는 이전 해석이 있습니다.`,
      });
    }
  }

  const blocking =
    missingSentenceIds.length > 0 ||
    staleSentenceIds.length > 0 ||
    duplicatedSentenceIds.length > 0 ||
    emptyTranslationSentenceIds.length > 0 ||
    sentences.length === 0 ||
    translationCount !== sentences.length;

  return {
    isValid: !blocking,
    passageId: input.passageId,
    title: input.title,
    sentenceCount: sentences.length,
    translationCount,
    missingSentenceIds,
    staleSentenceIds,
    duplicatedSentenceIds,
    emptyTranslationSentenceIds,
    issues: issues.filter((i) => i.kind !== "orphan"),
  };
}

export function buildLineTranslationItems(
  sentences: Array<{ id: string; english: string }>,
  storedTranslations: StoredSentenceTranslation[]
): LineTranslationItem[] | null {
  const validation = validatePassageLineTranslations({
    passageId: "_",
    title: "_",
    sentences,
    storedTranslations,
  });
  if (!validation.isValid) return null;

  const byId = new Map(
    storedTranslations.map((t) => [t.sentenceId, t] as const)
  );
  const items: LineTranslationItem[] = [];
  sentences
    .map((s, i) => ({
      id: s.id,
      english: formatWorkbookPassage(s.english),
      orderIndex: i + 1,
    }))
    .filter((s) => s.english)
    .forEach((s) => {
      const matched = matchStoredKorean({
        sentenceId: s.id,
        orderIndex: s.orderIndex,
        english: s.english,
        stored: byId.get(s.id),
      });
      if (!matched.ok) return;
      items.push({
        sentenceId: s.id,
        orderIndex: s.orderIndex,
        english: s.english,
        englishDisplay: stripLeadingSentenceMarkers(s.english),
        korean: matched.korean,
        sourceHash: matched.sourceHash,
        answerLineCount: getTranslationAnswerLineCount(s.english),
      });
    });

  if (items.length !== validation.sentenceCount) return null;
  return items;
}

/** Shared bilingual rows (한줄해석 / 통문장 영작 / 어순배열 영작). */
export type BilingualSentenceItem = {
  passageId: string;
  sentenceId: string;
  orderIndex: number;
  english: string;
  englishDisplay: string;
  korean: string;
  sourceHash: string;
};

export function buildBilingualSentenceItems(
  passageId: string,
  sentences: Array<{ id: string; english: string }>,
  savedTranslations: StoredSentenceTranslation[]
): BilingualSentenceItem[] | null {
  const items = buildLineTranslationItems(sentences, savedTranslations);
  if (!items) return null;
  return items.map((it) => ({
    passageId,
    sentenceId: it.sentenceId,
    orderIndex: it.orderIndex,
    english: it.english,
    englishDisplay: it.englishDisplay,
    korean: it.korean,
    sourceHash: it.sourceHash,
  }));
}

export function formatLineTranslationIssueMessage(
  title: string,
  issues: LineTranslationIssue[]
): string {
  return issues.map((i) => `‘${title}’ 지문의 ${i.message}`).join("\n");
}

export function generateWorkbookLineTranslation(input: {
  passages: Array<{
    projectId: string;
    title: string;
    source: string | null;
    sentences: Array<{ id: string; english: string; korean?: string | null }>;
    sentenceTranslations: StoredSentenceTranslation[];
  }>;
  /** Passages to skip for line-translation only */
  excludeProjectIds?: string[];
}): {
  sections: WorkbookLineTranslationSection[];
  skipped: LineTranslationSkip[];
  blocking: LineTranslationSkip[];
  openAiRequestCount: 0;
} {
  const exclude = new Set(input.excludeProjectIds ?? []);
  const sections: WorkbookLineTranslationSection[] = [];
  const skipped: LineTranslationSkip[] = [];
  const blocking: LineTranslationSkip[] = [];

  for (const p of input.passages) {
    if (exclude.has(p.projectId)) {
      skipped.push({
        projectId: p.projectId,
        title: p.title,
        reason: "해석 누락 지문으로 제외됨",
        issues: [],
      });
      continue;
    }

    // Prefer pack meta; seed from item korean only when meta row missing (legacy)
    const stored = [...(p.sentenceTranslations ?? [])];
    const have = new Set(stored.map((t) => t.sentenceId));
    for (let i = 0; i < p.sentences.length; i++) {
      const s = p.sentences[i]!;
      const id = s.id;
      const en = formatWorkbookPassage(s.english);
      const ko = String(s.korean ?? "").trim();
      if (!en || !ko || have.has(id)) continue;
      stored.push({
        sentenceId: id,
        order: i + 1,
        english: en,
        koreanTranslation: ko,
        sourceHash: computeSentenceSourceHash(en),
        translationSource: "legacy",
        updatedAt: new Date(0).toISOString(),
      });
      have.add(id);
    }

    const validation = validatePassageLineTranslations({
      passageId: p.projectId,
      title: p.title,
      sentences: p.sentences,
      storedTranslations: stored,
    });

    if (!validation.isValid) {
      const reason =
        validation.sentenceCount === 0
          ? "영어 문장이 없습니다."
          : formatLineTranslationIssueMessage(p.title, validation.issues);
      blocking.push({
        projectId: p.projectId,
        title: p.title,
        reason,
        issues: validation.issues,
      });
      continue;
    }

    const items = buildLineTranslationItems(p.sentences, stored);
    if (!items || items.length === 0) {
      blocking.push({
        projectId: p.projectId,
        title: p.title,
        reason: `‘${p.title}’ 지문의 한줄해석을 구성하지 못했습니다.`,
        issues: validation.issues,
      });
      continue;
    }

    sections.push({
      projectId: p.projectId,
      title: p.title,
      source: p.source,
      items,
      algorithmVersion: LINE_TRANSLATION_ALGORITHM_VERSION,
    });
  }

  return {
    sections,
    skipped,
    blocking,
    openAiRequestCount: 0,
  };
}
