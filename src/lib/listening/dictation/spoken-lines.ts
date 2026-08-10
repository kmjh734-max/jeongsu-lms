export type DictationSpeaker = "M" | "W" | "ANN";

export interface SpokenLine {
  speaker: DictationSpeaker;
  text: string;
}

/** 화면 표시용 — 짧은 응답(Yes, OK 등)도 포함 */
const MIN_LINE_CHARS = 1;

function normalizeSpeaker(raw: string): DictationSpeaker | null {
  const sp = raw.trim().toUpperCase();
  if (sp === "M" || sp === "W" || sp === "ANN") return sp;
  if (sp === "N" || sp === "NARRATOR" || sp === "A") return "ANN";
  return null;
}

function pushLine(
  lines: SpokenLine[],
  speaker: DictationSpeaker,
  text: string
) {
  const trimmed = text.trim();
  if (trimmed.length < MIN_LINE_CHARS) return;
  lines.push({ speaker, text: trimmed });
}

/**
 * Dictation/표시용 발화 줄.
 * 대화(M/W)뿐 아니라 안내·담화(ANN)도 포함한다.
 * (과거에는 M/W만 써서 ANN-only 문항에서 빈칸이 비었다.)
 */
export function collectSpokenLines(opts: {
  scriptText: string;
  segments?: Array<{ speaker: string; text: string }>;
}): SpokenLine[] {
  const lines: SpokenLine[] = [];
  if (opts.segments?.length) {
    for (const seg of opts.segments) {
      const sp = normalizeSpeaker(seg.speaker);
      if (!sp) continue;
      pushLine(lines, sp, seg.text);
    }
  }
  if (!lines.length && opts.scriptText) {
    for (const raw of opts.scriptText.split(/\n+/)) {
      const m = raw.match(/^(M|W|ANN|NARRATOR|N)\s*:\s*(.+)$/i);
      if (!m) continue;
      const sp = normalizeSpeaker(m[1]!);
      if (!sp) continue;
      pushLine(lines, sp, m[2]!);
    }
  }
  // 화자 접두 없는 담화 대본 → 문장 단위로 ANN 취급
  if (!lines.length && opts.scriptText.trim()) {
    const plain = opts.scriptText
      .split(/\n+/)
      .map((l) => l.replace(/^(M|W|ANN)\s*:\s*/i, "").trim())
      .filter(Boolean)
      .join(" ");
    for (const part of splitEnglishSentences(plain)) {
      pushLine(lines, "ANN", part);
    }
  }
  return lines;
}

/** 담화·긴 발화를 . ! ? 기준 문장 단위로 분리 (빈칸 개수·배치용) */
export function splitEnglishSentences(text: string): string[] {
  const t = text.trim();
  if (!t) return [];

  const sentences: string[] = [];
  let start = 0;

  for (let i = 0; i < t.length; i++) {
    const ch = t[i]!;
    if (ch !== "." && ch !== "!" && ch !== "?") continue;
    if (i + 1 < t.length && !/\s/.test(t[i + 1]!)) continue;

    const chunk = t.slice(start, i + 1).trim();
    if (chunk.length >= 4) sentences.push(chunk);
    start = i + 1;
    while (start < t.length && /\s/.test(t[start]!)) start++;
  }

  const tail = t.slice(start).trim();
  if (tail.length >= 4) sentences.push(tail);

  return sentences.length > 0 ? sentences : [t];
}

/**
 * Dictation용 발화 줄 — 대화는 segment 그대로, 담화(한 줄에 여러 문장)는 문장별로 펼침.
 * M/W/ANN 모두 포함.
 */
export function collectDictationLines(opts: {
  scriptText: string;
  segments?: Array<{ speaker: string; text: string }>;
}): SpokenLine[] {
  const raw = collectSpokenLines(opts);
  const out: SpokenLine[] = [];

  for (const line of raw) {
    const parts = splitEnglishSentences(line.text);
    if (parts.length <= 1) {
      out.push(line);
      continue;
    }
    for (const part of parts) {
      out.push({ speaker: line.speaker, text: part });
    }
  }

  return out;
}
