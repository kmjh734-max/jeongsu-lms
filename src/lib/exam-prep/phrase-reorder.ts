/**
 * 8단계 순서배열 — 인천 WORKBOOK PDF형 어구 카드
 * 예: (where / been / not permitted / it’s / in areas of / …)
 */
import { newChunkId, type Stage8Chunk } from "@/lib/exam-prep/stage8-types";

/** 의미·관용·결합이 강한 다어절 구 (긴 것부터 매칭) */
const MULTI_PHRASES: RegExp[] = [
  /\bThank you for your time and consideration\b/gi,
  /\bTo Whom It May Concern\b/gi,
  /\bthe large buildup of\b/gi,
  /\bin a disgusting state\b/gi,
  /\bthis growing problem\b/gi,
  /\bmanagement and supervision\b/gi,
  /\banimals and insects\b/gi,
  /\bon street corners\b/gi,
  /\band at bus stops\b/gi,
  /\bat bus stops\b/gi,
  /\bin the community\b/gi,
  /\bof our neighborhood\b/gi,
  /\bour neighborhood\b/gi,
  /\bthe neighborhood\b/gi,
  /\bstreet corners\b/gi,
  /\bbus stops\b/gi,
  /\bthe cleanliness\b/gi,
  /\bdesperately needed\b/gi,
  /\bgrowing problem\b/gi,
  /\billegal dumping\b/gi,
  /\bnot permitted\b/gi,
  /\bin areas of\b/gi,
  /\bin those areas\b/gi,
  /\bmore and more\b/gi,
  /\bless and less\b/gi,
  /\beven though\b/gi,
  /\bfor example\b/gi,
  /\bas a result\b/gi,
  /\bin charge of\b/gi,
  /\bon board\b/gi,
  /\bas good as\b/gi,
  /\beach of its\b/gi,
  /\beach of\b/gi,
  /\bin spite of\b/gi,
  /\bbecause of\b/gi,
  /\binstead of\b/gi,
  /\baccording to\b/gi,
  /\bin order to\b/gi,
  /\bso that\b/gi,
  /\bsuch as\b/gi,
  /\bas well as\b/gi,
  /\brather than\b/gi,
  /\bdue to\b/gi,
  /\bout of\b/gi,
  /\bup to\b/gi,
  /\bthe situation\b/gi,
  /\bmy neighbors\b/gi,
  /\btheir garbage\b/gi,
  /\btheir waste\b/gi,
  /\bsome of\b/gi,
  /\bto protect\b/gi,
  /\bto leave\b/gi,
  /\bto fix\b/gi,
  /\bare doing\b/gi,
  /\bis getting\b/gi,
  /\bhas left\b/gi,
  /\bhave been\b/gi,
  /\bhas been\b/gi,
  /\bhad been\b/gi,
  /\bwill be\b/gi,
  /\bcan be\b/gi,
  /\bmight be\b/gi,
  /\bmust be\b/gi,
  /\band strict\b/gi,
  /\band at\b/gi,
  /\bin a\b/gi,
];

const GREETING_RE = /^(To Whom It May Concern:\s*|Dear\s+[^:]+:\s*)/i;
const CLOSING_RE =
  /(\s*Thank you for your time and consideration\.?\s*(?:Sincerely,?\s*)?(?:[A-Z][a-z]+(?:\s+[A-Z][a-z]+)?\s*)?)$/i;

/** 배열하지 않고 고정으로 두는 다리 구문 */
const FIXED_BRIDGES: RegExp[] = [
  /,\s*recently more and more\s+/gi,
  /\s+in a disgusting state\.?/gi,
];

const PREPS = new Set(
  "in on at of to for with from by into onto upon over under about after before without within among between through during against toward towards across".split(
    " "
  )
);
const DETS = new Set(
  "the a an our my their his her its your this that these those some any each every no such".split(
    " "
  )
);
const AUX_FINITE = new Set(
  "am is are was were be been being have has had do does did will would can could may might must should shall".split(
    " "
  )
);
const CONJ_SMALL = new Set("and or but so yet".split(" "));

function tokenCore(tok: string): string {
  return tok.toLowerCase().replace(/[^a-z']/g, "");
}

function looksLikeNounOrAdj(tok: string): boolean {
  const c = tokenCore(tok);
  if (!c || c.length < 2) return false;
  if (AUX_FINITE.has(c) || PREPS.has(c) || DETS.has(c) || CONJ_SMALL.has(c)) {
    return false;
  }
  if (
    /^(who|whom|whose|which|that|where|when|why|how|what|if|whether|because|although|though|while)$/i.test(
      c
    )
  ) {
    return false;
  }
  // 동사 활용형으로 보이면 명사구에 넣지 않음
  if (/ing$|ed$/.test(c) && c.length > 4) return false;
  return true;
}

function isFiniteOrAux(tok: string): boolean {
  const c = tokenCore(tok);
  return AUX_FINITE.has(c);
}

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
      const core = tokenCore(tokens[i]!);

      // 전치사구: on board / in charge / for startups — 뒤 동사(is/are…)는 절대 묶지 않음
      if (PREPS.has(core) && i + 1 < tokens.length) {
        let j = i + 1;
        if (DETS.has(tokenCore(tokens[j]!)) && j + 1 < tokens.length) {
          j += 1;
        }
        // 형용사 1개까지
        if (
          j + 1 < tokens.length &&
          looksLikeNounOrAdj(tokens[j]!) &&
          looksLikeNounOrAdj(tokens[j + 1]!) &&
          !isFiniteOrAux(tokens[j + 1]!)
        ) {
          j += 1;
        }
        if (j < tokens.length && looksLikeNounOrAdj(tokens[j]!)) {
          groups.push(tokens.slice(i, j + 1).join(" "));
          i = j + 1;
          continue;
        }
        // 전치사만 남으면 단독 (다음이 동사라면)
        groups.push(tokens[i]!);
        i += 1;
        continue;
      }

      // 관사/소유격 + 명사(구)
      if (DETS.has(core) && i + 1 < tokens.length) {
        let j = i + 1;
        if (
          j + 1 < tokens.length &&
          looksLikeNounOrAdj(tokens[j]!) &&
          looksLikeNounOrAdj(tokens[j + 1]!) &&
          !isFiniteOrAux(tokens[j + 1]!)
        ) {
          j += 1;
        }
        if (j < tokens.length && looksLikeNounOrAdj(tokens[j]!)) {
          groups.push(tokens.slice(i, j + 1).join(" "));
          i = j + 1;
          continue;
        }
      }

      // 조동사·be/have 단독 카드 (PDF형)
      if (AUX_FINITE.has(core) || core === "it's" || core === "it’s") {
        groups.push(tokens[i]!);
        i += 1;
        continue;
      }

      // to + 동사원형
      if (core === "to" && i + 1 < tokens.length && !isFiniteOrAux(tokens[i + 1]!)) {
        groups.push(tokens.slice(i, i + 2).join(" "));
        i += 2;
        continue;
      }

      // not + V
      if (core === "not" && i + 1 < tokens.length) {
        groups.push(tokens.slice(i, i + 2).join(" "));
        i += 2;
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

  // 카드가 너무 적으면 긴 구만 쪼개되, 전치사구·관용구는 유지
  while (finalGroups.length < 3 && finalGroups.some((g) => g.split(/\s+/).length > 2)) {
    const idx = finalGroups.findIndex((g) => {
      const n = g.split(/\s+/).length;
      if (n <= 2) return false;
      const low = g.toLowerCase();
      if (/^(on board|for example|as a result|in charge of|as good as)\b/.test(low)) {
        return false;
      }
      return true;
    });
    if (idx < 0) break;
    const parts = finalGroups[idx]!.split(/\s+/);
    const mid = Math.ceil(parts.length / 2);
    finalGroups = [
      ...finalGroups.slice(0, idx),
      parts.slice(0, mid).join(" "),
      parts.slice(mid).join(" "),
      ...finalGroups.slice(idx + 1),
    ];
  }

  // 안전망: "on board is" 같은 잘못된 묶음 분해
  finalGroups = finalGroups.flatMap((g) => {
    const parts = g.split(/\s+/);
    if (parts.length < 3) return [g];
    const last = tokenCore(parts[parts.length - 1]!);
    const first = tokenCore(parts[0]!);
    if (PREPS.has(first) && AUX_FINITE.has(last)) {
      return [parts.slice(0, -1).join(" "), parts[parts.length - 1]!];
    }
    return [g];
  });

  return finalGroups.map((g) => g.trim()).filter(Boolean);
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
