const ABBREVIATIONS = new Set([
  "mr",
  "mrs",
  "ms",
  "dr",
  "prof",
  "sr",
  "jr",
  "vs",
  "etc",
  "fig",
  "no",
  "vol",
  "st",
  "rd",
]);

function isAbbreviation(token: string): boolean {
  const last = token.replace(/["'”’)]+$/g, "");
  if (/^[A-Z]\.$/.test(last)) return true;
  const bare = last.replace(/[.]+$/, "").toLowerCase();
  return ABBREVIATIONS.has(bare);
}

export function splitEnglishSentences(text: string): string[] {
  const cleaned = String(text ?? "")
    .replace(/\r\n/g, "\n")
    .replace(/[ \t]+/g, " ")
    .trim();
  if (!cleaned) return [];

  const sentences: string[] = [];
  let buf = "";
  const chars = [...cleaned];

  for (let i = 0; i < chars.length; i++) {
    const ch = chars[i]!;
    if (ch === "\n") {
      const t = buf.trim();
      if (t) sentences.push(t);
      buf = "";
      continue;
    }

    buf += ch;
    if (!/[.!?]/.test(ch)) continue;

    let look = i + 1;
    while (
      look < chars.length &&
      /["'”’)]/.test(chars[look] ?? "")
    ) {
      buf += chars[look]!;
      i = look;
      look = i + 1;
    }

    const after = chars[i + 1];
    const after2 = chars[i + 2];
    const endOfText = after === undefined;
    const newline = after === "\n";
    const newSentence =
      after === " " && !!after2 && /[A-Z"“‘(]/.test(after2);

    if (!endOfText && !newline && !newSentence) continue;

    const t = buf.trim();
    const lastWord = t.split(/\s+/).pop() ?? "";
    if (isAbbreviation(lastWord) && !endOfText) continue;
    if (t) sentences.push(t);
    buf = "";
  }

  const rest = buf.trim();
  if (rest) sentences.push(rest);
  return sentences;
}

export function splitKoreanSentences(text: string): string[] {
  const cleaned = String(text ?? "").replace(/\r\n/g, "\n").trim();
  if (!cleaned) return [];
  return cleaned
    .split(/(?<=(?:다|요|까|니다|습니다|세요)[.!?]|[.!?])\s+|\n+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

export function splitPassageIntoLinePairs(input: {
  english: string;
  korean?: string;
}): Array<{ english: string; korean: string }> {
  const enLines = splitEnglishSentences(input.english);
  const krLines = splitKoreanSentences(input.korean ?? "");
  if (enLines.length === 0) return [];
  return enLines.map((english, i) => ({
    english,
    korean: krLines.length === enLines.length ? (krLines[i] ?? "") : "",
  }));
}
