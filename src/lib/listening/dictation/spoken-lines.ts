export interface SpokenLine {
  speaker: "M" | "W";
  text: string;
}

/** 화면 표시용 — 짧은 응답(Yes, OK 등)도 포함 */
const MIN_LINE_CHARS = 1;

export function collectSpokenLines(opts: {
  scriptText: string;
  segments?: Array<{ speaker: string; text: string }>;
}): SpokenLine[] {
  const lines: SpokenLine[] = [];
  if (opts.segments?.length) {
    for (const seg of opts.segments) {
      const sp = seg.speaker.toUpperCase();
      if (sp !== "M" && sp !== "W") continue;
      const text = seg.text.trim();
      if (text.length < MIN_LINE_CHARS) continue;
      lines.push({ speaker: sp, text });
    }
  }
  if (!lines.length && opts.scriptText) {
    for (const raw of opts.scriptText.split(/\n+/)) {
      const m = raw.match(/^(M|W)\s*:\s*(.+)$/i);
      if (!m) continue;
      const text = m[2]!.trim();
      if (text.length < MIN_LINE_CHARS) continue;
      lines.push({ speaker: m[1]!.toUpperCase() as "M" | "W", text });
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
 * Dictation용 M/W 줄 — 대화는 segment 그대로, 담화(한 줄에 여러 문장)는 문장별로 펼침
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
