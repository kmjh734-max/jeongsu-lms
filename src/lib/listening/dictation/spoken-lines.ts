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
