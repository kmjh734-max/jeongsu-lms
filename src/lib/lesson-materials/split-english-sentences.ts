/**
 * Code-based English sentence splitter (no OpenAI).
 * Preserves sentence text exactly; only chooses split boundaries.
 */

const ABBREVIATIONS = new Set(
  [
    "mr",
    "mrs",
    "ms",
    "dr",
    "prof",
    "sr",
    "jr",
    "st",
    "vs",
    "etc",
    "eg",
    "ie",
    "us",
    "uk",
    "am",
    "pm",
    "no",
    "vol",
    "fig",
    "approx",
    "dept",
    "inc",
    "ltd",
    "co",
  ].map((s) => s.toLowerCase())
);

function tokenBefore(text: string, dotIndex: number): string {
  let i = dotIndex - 1;
  while (i >= 0 && /[A-Za-z.]/.test(text[i]!)) i -= 1;
  return text.slice(i + 1, dotIndex);
}

function isProtectedDot(text: string, i: number): boolean {
  const prev = text[i - 1];
  const next = text[i + 1];
  if (prev && next && /\d/.test(prev) && /\d/.test(next)) return true;
  const token = tokenBefore(text, i).toLowerCase().replace(/\.$/, "");
  const compact = token.replace(/\./g, "");
  if (ABBREVIATIONS.has(compact) || ABBREVIATIONS.has(token)) return true;
  if (/^[a-z](?:\.[a-z])*$/i.test(token) && compact.length <= 3) return true;
  return false;
}

function isSentenceBoundaryAfter(text: string, end: number): boolean {
  const after = text.slice(end + 1);
  if (after.trim() === "") return true;
  return /^(\s+)([A-Z("'])/.test(after);
}

/**
 * Split passage on . ? ! (and ." / !" / ?") when followed by
 * whitespace + capital letter (or end of text). Periods inside
 * open double quotes are ignored unless they close the quote.
 */
export function splitEnglishPassageIntoSentences(passage: string): string[] {
  const text = String(passage ?? "").replace(/\s+/g, " ").trim();
  if (!text) return [];

  const cuts: number[] = [];
  let inDouble = false;

  for (let i = 0; i < text.length; i++) {
    const ch = text[i]!;

    if (ch === '"') {
      if (inDouble) {
        // Closing quote: if punct immediately before, may end sentence
        const prev = text[i - 1];
        if (prev && /[.!?]/.test(prev) && isSentenceBoundaryAfter(text, i)) {
          cuts.push(i);
        }
        inDouble = false;
      } else {
        inDouble = true;
      }
      continue;
    }

    if (inDouble) continue;
    if (ch !== "." && ch !== "!" && ch !== "?") continue;
    if (ch === "." && isProtectedDot(text, i)) continue;

    let end = i;
    while (end + 1 < text.length && /["')\]]/.test(text[end + 1]!)) end += 1;

    if (isSentenceBoundaryAfter(text, end)) {
      cuts.push(end);
      if (end > i) {
        // Skip ahead over consumed closing quotes
        i = end;
      }
    }
  }

  if (cuts.length === 0) return [text];

  const out: string[] = [];
  let start = 0;
  for (const end of cuts) {
    const piece = text.slice(start, end + 1).trim();
    if (piece) out.push(piece);
    start = end + 1;
    while (start < text.length && /\s/.test(text[start]!)) start += 1;
  }
  if (start < text.length) {
    const rest = text.slice(start).trim();
    if (rest) out.push(rest);
  }
  return out.length ? out : [text];
}

export function sentencesRestoreOriginal(
  original: string,
  sentences: string[]
): boolean {
  const norm = (s: string) => s.replace(/\s+/g, " ").trim();
  return norm(sentences.join(" ")) === norm(original);
}
