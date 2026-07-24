/** HTML → 줄 단위 텍스트 */

export function htmlToLines(html: string): string[] {
  const withoutNoise = html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/<!--[\s\S]*?-->/g, " ");

  const withBreaks = withoutNoise
    .replace(/<(br|\/p|\/div|\/li|\/tr|\/h[1-6])[^>]*>/gi, "\n")
    .replace(/<[^>]+>/g, "\n");

  const decoded = withBreaks
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
    .replace(/&quot;/gi, '"');

  return decoded
    .split(/\n+/)
    .map((s) => s.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

export function findAfter(
  lines: string[],
  label: string | RegExp,
  opts?: { within?: number }
): string | null {
  const within = opts?.within ?? 6;
  for (let i = 0; i < lines.length; i++) {
    const hit =
      typeof label === "string"
        ? lines[i] === label || lines[i].includes(label)
        : label.test(lines[i]);
    if (!hit) continue;
    for (let j = i + 1; j <= i + within && j < lines.length; j++) {
      const v = lines[j];
      if (!v) continue;
      if (typeof label === "string" && v === label) continue;
      return v;
    }
  }
  return null;
}

export function parsePercent(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const m = raw.replace(/,/g, "").match(/(\d+(?:\.\d+)?)\s*%/);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 0 && n <= 100 ? n : null;
}

export function parseScore(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const m = raw.replace(/,/g, "").match(/(\d+(?:\.\d+)?)/);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 0 && n <= 100 ? n : null;
}

export function parseTopPercentile(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const m = raw.replace(/,/g, "").match(/상위\s*(\d+(?:\.\d+)?)\s*%/);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 0 && n <= 100 ? n : null;
}

export function parseKoreanDate(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const m = raw.match(/(\d{4})[.\-/년]\s*(\d{1,2})[.\-/월]\s*(\d{1,2})/);
  if (!m) return null;
  const y = m[1];
  const mo = m[2].padStart(2, "0");
  const d = m[3].padStart(2, "0");
  return `${y}-${mo}-${d}`;
}

export function parseVocabSize(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const m = raw.replace(/,/g, "").match(/약?\s*(\d+)\s*단어/);
  if (!m) return null;
  return Number(m[1]);
}

export function normalizeLevelLabel(raw: string | null): string | null {
  if (!raw) return null;
  const s = raw
    .replace(/수준$/g, "")
    .replace(/~/g, "-")
    .replace(/～/g, "-")
    .replace(/\s+/g, " ")
    .trim();
  // 초3~초4 → keep as-is for display; map later
  if (!s || s.length > 40) return null;
  return s;
}
