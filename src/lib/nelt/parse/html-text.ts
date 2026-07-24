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

/** 전각 ％ 등 정규화 */
export function normalizePercentGlyphs(raw: string): string {
  return raw
    .replace(/％/g, "%")
    .replace(/﹪/g, "%")
    .replace(/\u00a0/g, " ");
}

export function parsePercent(raw: string | null | undefined): number | null {
  if (!raw) return null;
  const s = normalizePercentGlyphs(raw).replace(/,/g, "");
  // "상위 88%" 같은 석차는 이해율로 쓰지 않음
  if (/상위\s*\d/.test(s) && !/약\s*\d/.test(s)) {
    const approx = s.match(/약\s*(\d+(?:\.\d+)?)\s*%/);
    if (approx) {
      const n = Number(approx[1]);
      return n >= 0 && n <= 100 ? n : null;
    }
    return null;
  }
  const m = s.match(/약?\s*(\d+(?:\.\d+)?)\s*%/);
  if (!m) return null;
  const n = Number(m[1]);
  return n >= 0 && n <= 100 ? n : null;
}

/**
 * 라벨 근처에서 이해율(%)을 읽는다.
 * - "약 25%" / "25%" / "약 25"+"%" 줄바꿈
 * - "상위 N%" 석차는 제외
 */
export function findLabeledPercent(
  lines: string[],
  labelMatchers: Array<string | RegExp>,
  opts?: { within?: number }
): number | null {
  const within = opts?.within ?? 10;
  for (let i = 0; i < lines.length; i++) {
    const line = normalizePercentGlyphs(lines[i]);
    const hit = labelMatchers.some((m) =>
      typeof m === "string" ? line.includes(m) : m.test(line)
    );
    if (!hit) continue;

    // 같은 줄에 이미 %가 있으면 우선
    const sameLine = parsePercentPreferApprox(line);
    if (sameLine != null) return sameLine;

    const window = lines
      .slice(i, Math.min(lines.length, i + within + 1))
      .map(normalizePercentGlyphs);
    // 줄바꿈으로 갈라진 "약 25" / "%" 합치기
    const joined = window.join(" ").replace(/(\d+(?:\.\d+)?)\s+%/g, "$1%");
    const fromJoined = parsePercentPreferApprox(joined);
    if (fromJoined != null) return fromJoined;

    for (const w of window.slice(1)) {
      if (/상위/.test(w) && /%/.test(w) && !/약/.test(w)) continue;
      const p = parsePercentPreferApprox(w);
      if (p != null) return p;
    }
  }
  return null;
}

function parsePercentPreferApprox(raw: string): number | null {
  const s = normalizePercentGlyphs(raw).replace(/,/g, "");
  const approx = s.match(/약\s*(\d+(?:\.\d+)?)\s*%/);
  if (approx) {
    const n = Number(approx[1]);
    if (n >= 0 && n <= 100) return n;
  }
  // 석차 문장 안의 일반 %는 버림
  if (/상위\s*\d+(?:\.\d+)?\s*%/.test(s) && !/약\s*\d/.test(s)) {
    return null;
  }
  return parsePercent(s);
}

/** 긴 총평 문장에서 패턴으로 이해율 추출 */
export function extractPercentFromProse(
  text: string,
  patterns: RegExp[]
): number | null {
  const s = normalizePercentGlyphs(text).replace(/\s+/g, " ");
  for (const re of patterns) {
    const m = s.match(re);
    if (!m) continue;
    const n = Number(m[1]);
    if (n >= 0 && n <= 100) return n;
  }
  return null;
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
