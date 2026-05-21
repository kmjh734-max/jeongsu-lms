export interface ParsedVocabRow {
  word: string;
  meaning: string;
  example_sentence: string;
  example_meaning: string;
}

const HEADER_PATTERNS = [
  /^단어\s*뜻/i,
  /^word\s*meaning/i,
  /^english\s*korean/i,
  /^단어\s*뜻\s*예문/i,
];

function isHeaderLine(line: string): boolean {
  const normalized = line.trim().toLowerCase();
  return HEADER_PATTERNS.some((p) => p.test(normalized));
}

function splitColumns(line: string): string[] {
  if (line.includes("\t")) {
    return line.split("\t").map((c) => c.trim());
  }
  if (line.includes(",")) {
    return line.split(",").map((c) => c.trim());
  }
  const parts = line.trim().split(/\s{2,}/);
  if (parts.length >= 2) return parts.map((c) => c.trim());
  const spaced = line.trim().split(/\s+/);
  if (spaced.length >= 2) {
    return [spaced[0], spaced.slice(1).join(" ")];
  }
  return [line.trim()];
}

export function parseBulkPaste(text: string): ParsedVocabRow[] {
  const lines = text
    .split(/\r?\n/)
    .map((l) => l.trim())
    .filter(Boolean);

  const rows: ParsedVocabRow[] = [];

  for (const line of lines) {
    if (isHeaderLine(line)) continue;

    const cols = splitColumns(line);
    const word = cols[0]?.trim() ?? "";
    const meaning = cols[1]?.trim() ?? "";
    if (!word || !meaning) continue;

    rows.push({
      word,
      meaning,
      example_sentence: cols[2]?.trim() ?? "",
      example_meaning: cols[3]?.trim() ?? "",
    });
  }

  return rows;
}

export function mergeParsedRows(
  existing: { word: string }[],
  incoming: ParsedVocabRow[]
): {
  merged: ParsedVocabRow[];
  duplicates: string[];
} {
  const seen = new Set(
    existing.map((r) => r.word.trim().toLowerCase()).filter(Boolean)
  );
  const merged: ParsedVocabRow[] = [];
  const duplicates: string[] = [];

  for (const row of incoming) {
    const key = row.word.trim().toLowerCase();
    if (seen.has(key)) {
      duplicates.push(row.word);
      continue;
    }
    seen.add(key);
    merged.push(row);
  }

  return { merged, duplicates };
}
