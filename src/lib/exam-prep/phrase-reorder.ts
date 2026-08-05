/**
 * 8단계 순서배열 — 인천 WORKBOOK PDF형 어구 카드
 * 예: (where / been / not permitted / it’s / in areas of / …)
 */
import { newChunkId, type Stage8Chunk } from "@/lib/exam-prep/stage8-types";

/** PDF에 자주 나오는 다어절 구 */
const MULTI_PHRASES: RegExp[] = [
  /\beven though\b/gi,
  /\bmore and more\b/gi,
  /\bless and less\b/gi,
  /\bnot permitted\b/gi,
  /\bin areas of\b/gi,
  /\bour neighborhood\b/gi,
  /\bthe neighborhood\b/gi,
  /\bon street corners\b/gi,
  /\bstreet corners\b/gi,
  /\band at bus stops\b/gi,
  /\bat bus stops\b/gi,
  /\bbus stops\b/gi,
  /\bthe large buildup of\b/gi,
  /\banimals and insects\b/gi,
  /\bmanagement and supervision\b/gi,
  /\bin the community\b/gi,
  /\bof our neighborhood\b/gi,
  /\bthe cleanliness\b/gi,
  /\bdesperately needed\b/gi,
  /\bto protect\b/gi,
  /\band strict\b/gi,
  /\bsome of\b/gi,
  /\bmy neighbors\b/gi,
  /\btheir garbage\b/gi,
  /\btheir waste\b/gi,
  /\bto leave\b/gi,
  /\bin those areas\b/gi,
  /\bthe situation\b/gi,
  /\bare doing\b/gi,
  /\bis getting\b/gi,
  /\bhas left\b/gi,
  /\bin a disgusting state\b/gi,
  /\bin a\b/gi,
  /\bto fix\b/gi,
  /\bthis growing problem\b/gi,
  /\bgrowing problem\b/gi,
  /\billegal dumping\b/gi,
  /\band at\b/gi,
  /\bThank you for your time and consideration\b/gi,
  /\bTo Whom It May Concern\b/gi,
];

const GREETING_RE = /^(To Whom It May Concern:\s*|Dear\s+[^:]+:\s*)/i;
const CLOSING_RE =
  /(\s*Thank you for your time and consideration\.?\s*(?:Sincerely,?\s*)?(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s*)?)$/i;

/** 배열하지 않고 고정으로 두는 다리 구문 */
const FIXED_BRIDGES: RegExp[] = [
  /,\s*recently more and more\s+/gi,
  /\s+in a disgusting state\.?/gi,
];

export type ReorderPlanPart =
  | { type: "fixed"; text: string }
  | { type: "reorder"; text: string; start: number; end: number };

/**
 * PDF처럼 고정 인사/다리/맺음 + 배열 구간으로 나눈다.
 */
export function planPhraseReorderParts(english: string): ReorderPlanPart[] {
  const src = english.trim();
  if (!src) return [];

  const parts: ReorderPlanPart[] = [];
  let rest = src;
  let baseOffset = 0;

  const greet = rest.match(GREETING_RE);
  if (greet) {
    parts.push({ type: "fixed", text: greet[0]! });
    baseOffset += greet[0]!.length;
    rest = rest.slice(greet[0]!.length);
  }

  let closing = "";
  const close = rest.match(CLOSING_RE);
  if (close) {
    closing = close[1] ?? close[0]!;
    rest = rest.slice(0, rest.length - closing.length);
  }

  // 고정 다리로 분할
  type Seg = { kind: "fixed" | "body"; text: string };
  const segs: Seg[] = [{ kind: "body", text: rest }];
  for (const re of FIXED_BRIDGES) {
    const next: Seg[] = [];
    for (const seg of segs) {
      if (seg.kind !== "body") {
        next.push(seg);
        continue;
      }
      re.lastIndex = 0;
      let last = 0;
      let m: RegExpExecArray | null;
      const text = seg.text;
      let matched = false;
      while ((m = re.exec(text)) !== null) {
        matched = true;
        if (m.index > last) {
          next.push({ kind: "body", text: text.slice(last, m.index) });
        }
        next.push({ kind: "fixed", text: m[0]! });
        last = m.index + m[0]!.length;
      }
      if (matched) {
        if (last < text.length) next.push({ kind: "body", text: text.slice(last) });
      } else {
        next.push(seg);
      }
    }
    segs.length = 0;
    segs.push(...next);
  }

  // 긴 body는 콤마로 추가 분할 (양쪽 모두 배열 가능하면)
  const expanded: Seg[] = [];
  for (const seg of segs) {
    if (seg.kind !== "body") {
      expanded.push(seg);
      continue;
    }
    const t = seg.text.trim();
    if (t.split(/\s+/).length >= 14 && t.includes(",")) {
      const pieces = t.split(/(?<=,)\s+/);
      for (let i = 0; i < pieces.length; i++) {
        const p = pieces[i]!;
        if (!p.trim()) continue;
        expanded.push({ kind: "body", text: p });
        // 콤마는 body에 포함되어 있음 → 배열 구간에서 제거
      }
    } else {
      expanded.push(seg);
    }
  }

  let cursor = baseOffset;
  // rest started after greeting; rebuild offsets from original src
  // Simpler: search each segment text in src sequentially
  cursor = greet ? greet[0]!.length : 0;
  for (const seg of expanded) {
    const raw = seg.text;
    if (!raw) continue;
    if (seg.kind === "fixed") {
      parts.push({ type: "fixed", text: raw });
      const idx = src.indexOf(raw, cursor);
      cursor = idx >= 0 ? idx + raw.length : cursor + raw.length;
      continue;
    }
    const cleaned = raw.replace(/^[,;\s]+/, "").replace(/[,;.\s]+$/u, "").trim();
    if (cleaned.split(/\s+/).filter(Boolean).length < 3) {
      parts.push({ type: "fixed", text: raw });
      cursor += raw.length;
      continue;
    }
    const idx = src.indexOf(cleaned, Math.max(0, cursor - 2));
    const start = idx >= 0 ? idx : cursor;
    const end = start + cleaned.length;
    parts.push({ type: "reorder", text: cleaned, start, end });
    cursor = end;
  }

  if (closing) {
    parts.push({ type: "fixed", text: closing.startsWith(" ") ? closing : ` ${closing}` });
  }

  // 배열 구간이 하나도 없으면 전체(인사 제외)를 배열
  if (!parts.some((p) => p.type === "reorder")) {
    const bodyStart = greet ? greet[0]!.length : 0;
    const bodyEnd = closing ? src.length - closing.length : src.length;
    const body = src.slice(bodyStart, bodyEnd).replace(/[.!?]+$/u, "").trim();
    if (body.split(/\s+/).length >= 3) {
      return [
        ...(greet ? [{ type: "fixed" as const, text: greet[0]! }] : []),
        { type: "reorder", text: body, start: bodyStart, end: bodyStart + body.length },
        ...(closing
          ? [{ type: "fixed" as const, text: closing.startsWith(" ") ? closing : ` ${closing}` }]
          : []),
      ];
    }
  }

  return parts;
}

/** 의미 단위 어구로 쪼갠 문자열 목록 (정답 순서) */
export function buildPhraseChunkTexts(text: string): string[] {
  const trimmed = text.trim().replace(/[,;:.!?]+$/u, "");
  if (!trimmed) return [];

  type Span = { start: number; end: number; text: string };
  const locked: Span[] = [];
  for (const re of MULTI_PHRASES) {
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(trimmed)) !== null) {
      if (m.index == null) continue;
      const start = m.index;
      const end = start + m[0].length;
      if (locked.some((u) => start < u.end && end > u.start)) continue;
      locked.push({ start, end, text: trimmed.slice(start, end) });
    }
  }
  locked.sort((a, b) => a.start - b.start);

  const groups: string[] = [];
  let cursor = 0;

  const flushTokens = (slice: string) => {
    const tokens = slice
      .split(/\s+/)
      .map((t) => t.trim())
      .filter((t) => t && !/^[.,!?;:]+$/.test(t))
      .map((t) => t.replace(/^[.,!?;:]+|[.,!?;:]+$/g, ""))
      .filter(Boolean);
    let i = 0;
    while (i < tokens.length) {
      const t = tokens[i]!.toLowerCase().replace(/[^a-z']/g, "");
      if (
        ["in", "on", "at", "of", "to", "for", "with", "from", "by", "into"].includes(t) &&
        i + 2 < tokens.length
      ) {
        groups.push(tokens.slice(i, i + 3).join(" "));
        i += 3;
        continue;
      }
      if (
        ["the", "a", "an", "our", "my", "their", "this", "those", "some"].includes(t) &&
        i + 1 < tokens.length
      ) {
        const next = tokens[i + 1]!.toLowerCase().replace(/[^a-z']/g, "");
        if (["and", "or"].includes(next) && i + 3 < tokens.length) {
          groups.push(tokens.slice(i, i + 4).join(" "));
          i += 4;
          continue;
        }
        groups.push(tokens.slice(i, i + 2).join(" "));
        i += 2;
        continue;
      }
      // PDF: have / been / dumping / are / is 단독 카드
      if (["have", "has", "had", "been", "are", "is", "was", "were", "it's", "it’s"].includes(t)) {
        groups.push(tokens[i]!);
        i += 1;
        continue;
      }
      groups.push(tokens[i]!);
      i += 1;
    }
  };

  for (const lock of locked) {
    if (cursor < lock.start) flushTokens(trimmed.slice(cursor, lock.start));
    groups.push(lock.text);
    cursor = lock.end;
  }
  if (cursor < trimmed.length) flushTokens(trimmed.slice(cursor));

  let finalGroups = groups.map((g) => g.trim()).filter(Boolean);
  while (finalGroups.length < 3 && finalGroups.some((g) => g.split(/\s+/).length > 1)) {
    const idx = finalGroups.findIndex((g) => g.split(/\s+/).length > 1);
    if (idx < 0) break;
    const parts = finalGroups[idx]!.split(/\s+/);
    finalGroups = [
      ...finalGroups.slice(0, idx),
      ...parts,
      ...finalGroups.slice(idx + 1),
    ];
  }

  // PDF 미리보기용: 문두 대문자 유지하되 카드는 원문 그대로
  return finalGroups;
}

export function toStage8Chunks(texts: string[]): Stage8Chunk[] {
  return texts.map((chunkText, idx) => ({
    id: newChunkId(),
    chunkOrder: idx + 1,
    chunkText,
  }));
}

/** 워크북/미리보기: (a / b / c) — 표시용으로 섞을 수 있음 */
export function formatParenSlashChunks(
  chunks: string[],
  opts?: { shuffle?: boolean }
): string {
  const list = [...chunks];
  if (opts?.shuffle && list.length > 1) {
    for (let i = list.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [list[i], list[j]] = [list[j]!, list[i]!];
    }
  }
  return `(${list.join(" / ")})`;
}

/** PDF형 한 줄 미리보기 문자열 */
export function buildPdfReorderDisplay(english: string, shuffle = true): {
  displayText: string;
  parts: ReorderPlanPart[];
  reorderChunks: string[][];
} {
  const parts = planPhraseReorderParts(english);
  const reorderChunks: string[][] = [];
  let display = "";
  let prevReorder = false;
  for (const p of parts) {
    if (p.type === "fixed") {
      display += p.text;
      prevReorder = false;
      continue;
    }
    const chunks = buildPhraseChunkTexts(p.text);
    if (chunks.length < 2) {
      display += p.text;
      prevReorder = false;
      continue;
    }
    if (prevReorder && !/,\s*$/.test(display)) {
      display += ", ";
    }
    reorderChunks.push(chunks);
    display += formatParenSlashChunks(chunks, { shuffle });
    prevReorder = true;
  }
  return { displayText: display.trim(), parts, reorderChunks };
}
