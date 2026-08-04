/** 1단계 「지문 익히기」 어휘 강조 — 텍스트+occurrence 기반(인덱스만 쓰지 않음) */

export const VOCAB_STYLE_KEYS = [
  "vocab-1",
  "vocab-2",
  "vocab-3",
  "vocab-4",
  "vocab-5",
  "vocab-6",
] as const;

export type VocabStyleKey = (typeof VOCAB_STYLE_KEYS)[number];

export type VocabMark = {
  id: string;
  englishText: string;
  koreanText: string;
  /** 문장 내 동일 문자열의 n번째 출현 (0-based). 없으면 첫 출현 */
  englishOccurrence?: number;
  koreanOccurrence?: number;
  styleKey: VocabStyleKey;
  meaning?: string;
  memo?: string;
};

export const VOCAB_STYLE_CLASSES: Record<
  VocabStyleKey,
  { en: string; ko: string; badge: string; label: string }
> = {
  "vocab-1": {
    en: "bg-amber-100 font-semibold underline decoration-amber-600 decoration-2",
    ko: "bg-amber-100 font-semibold underline decoration-amber-600 decoration-2",
    badge: "bg-amber-600 text-white",
    label: "1",
  },
  "vocab-2": {
    en: "bg-sky-100 font-semibold underline decoration-sky-600 decoration-2",
    ko: "bg-sky-100 font-semibold underline decoration-sky-600 decoration-2",
    badge: "bg-sky-600 text-white",
    label: "2",
  },
  "vocab-3": {
    en: "bg-emerald-100 font-semibold underline decoration-emerald-600 decoration-2",
    ko: "bg-emerald-100 font-semibold underline decoration-emerald-600 decoration-2",
    badge: "bg-emerald-600 text-white",
    label: "3",
  },
  "vocab-4": {
    en: "bg-violet-100 font-semibold underline decoration-violet-600 decoration-2",
    ko: "bg-violet-100 font-semibold underline decoration-violet-600 decoration-2",
    badge: "bg-violet-600 text-white",
    label: "4",
  },
  "vocab-5": {
    en: "bg-rose-100 font-semibold underline decoration-rose-600 decoration-2",
    ko: "bg-rose-100 font-semibold underline decoration-rose-600 decoration-2",
    badge: "bg-rose-600 text-white",
    label: "5",
  },
  "vocab-6": {
    en: "bg-orange-100 font-semibold underline decoration-orange-600 decoration-2",
    ko: "bg-orange-100 font-semibold underline decoration-orange-600 decoration-2",
    badge: "bg-orange-600 text-white",
    label: "6",
  },
};

export function nextVocabStyleKey(existing: VocabMark[]): VocabStyleKey {
  return VOCAB_STYLE_KEYS[existing.length % VOCAB_STYLE_KEYS.length]!;
}

export function parseVocabMarks(raw: unknown): VocabMark[] {
  if (!Array.isArray(raw)) return [];
  const out: VocabMark[] = [];
  for (const item of raw) {
    if (!item || typeof item !== "object") continue;
    const o = item as Record<string, unknown>;
    // 구형 { word, meaning } 호환
    if (typeof o.word === "string" && o.word.trim()) {
      out.push({
        id: String(o.id ?? `legacy-${out.length + 1}`),
        englishText: o.word.trim(),
        koreanText: String(o.koreanText ?? o.meaning ?? "").trim(),
        styleKey: VOCAB_STYLE_KEYS[out.length % VOCAB_STYLE_KEYS.length]!,
        meaning: String(o.meaning ?? "").trim() || undefined,
        memo: typeof o.memo === "string" ? o.memo : undefined,
      });
      continue;
    }
    const englishText = String(o.englishText ?? "").trim();
    if (!englishText) continue;
    const styleRaw = String(o.styleKey ?? "");
    const styleKey = (VOCAB_STYLE_KEYS as readonly string[]).includes(styleRaw)
      ? (styleRaw as VocabStyleKey)
      : VOCAB_STYLE_KEYS[out.length % VOCAB_STYLE_KEYS.length]!;
    out.push({
      id: String(o.id ?? `mark-${out.length + 1}`),
      englishText,
      koreanText: String(o.koreanText ?? "").trim(),
      englishOccurrence:
        typeof o.englishOccurrence === "number"
          ? o.englishOccurrence
          : undefined,
      koreanOccurrence:
        typeof o.koreanOccurrence === "number" ? o.koreanOccurrence : undefined,
      styleKey,
      meaning: String(o.meaning ?? "").trim() || undefined,
      memo: typeof o.memo === "string" ? o.memo : undefined,
    });
  }
  return out;
}

/** 문장에서 needle의 n번째 출현 구간 [start, end) */
export function findNthOccurrence(
  haystack: string,
  needle: string,
  occurrence = 0
): { start: number; end: number } | null {
  if (!needle) return null;
  let from = 0;
  let found = -1;
  for (let i = 0; i <= occurrence; i++) {
    found = haystack.indexOf(needle, from);
    if (found < 0) return null;
    from = found + Math.max(needle.length, 1);
  }
  return { start: found, end: found + needle.length };
}

export type HighlightSegment = {
  text: string;
  mark: VocabMark | null;
};

/** 한 문장(영어 또는 우리말)을 강조 세그먼트로 분할 */
export function buildHighlightSegments(
  text: string,
  marks: VocabMark[],
  side: "english" | "korean"
): HighlightSegment[] {
  type Range = { start: number; end: number; mark: VocabMark };
  const ranges: Range[] = [];
  for (const mark of marks) {
    const needle = side === "english" ? mark.englishText : mark.koreanText;
    if (!needle) continue;
    const occ =
      side === "english"
        ? (mark.englishOccurrence ?? 0)
        : (mark.koreanOccurrence ?? 0);
    const hit = findNthOccurrence(text, needle, occ);
    if (!hit) continue;
    ranges.push({ start: hit.start, end: hit.end, mark });
  }
  ranges.sort((a, b) => a.start - b.start || b.end - a.end);

  const merged: Range[] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r.start < last.end) continue; // overlap skip
    merged.push(r);
  }

  if (merged.length === 0) return [{ text, mark: null }];

  const segs: HighlightSegment[] = [];
  let cursor = 0;
  for (const r of merged) {
    if (r.start > cursor) {
      segs.push({ text: text.slice(cursor, r.start), mark: null });
    }
    segs.push({ text: text.slice(r.start, r.end), mark: r.mark });
    cursor = r.end;
  }
  if (cursor < text.length) {
    segs.push({ text: text.slice(cursor), mark: null });
  }
  return segs;
}

export function countOccurrences(haystack: string, needle: string): number {
  if (!needle) return 0;
  let count = 0;
  let from = 0;
  while (true) {
    const i = haystack.indexOf(needle, from);
    if (i < 0) break;
    count++;
    from = i + Math.max(needle.length, 1);
  }
  return count;
}
