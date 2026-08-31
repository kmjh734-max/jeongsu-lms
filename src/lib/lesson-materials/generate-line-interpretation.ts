import type {
  LineInterpretationResult,
  LineInterpretationRow,
} from "@/lib/lesson-materials/types";

function asString(v: unknown, fallback = ""): string {
  return typeof v === "string" ? v.trim() : fallback;
}

export function normalizeLineInterpretation(raw: unknown): LineInterpretationResult {
  const obj =
    raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const linesRaw = Array.isArray(obj.lines) ? obj.lines : [];
  const lines: LineInterpretationRow[] = [];

  for (let i = 0; i < linesRaw.length; i++) {
    const row = linesRaw[i];
    if (!row || typeof row !== "object") continue;
    const r = row as Record<string, unknown>;
    const english = asString(r.english);
    const korean = asString(r.korean);
    if (!english) continue;
    const no =
      typeof r.no === "number" && Number.isFinite(r.no)
        ? Math.max(1, Math.round(r.no))
        : lines.length + 1;
    lines.push({ no, english, korean });
  }

  return {
    passageTitle: asString(obj.passageTitle) || asString(obj.title) || "지문",
    subtitle: asString(obj.subtitle) || undefined,
    lines,
  };
}

export function buildLineInterpretationPrompt(opts: {
  passage: string;
  lessonLabel?: string;
  passageTitle?: string;
}): { system: string; user: string } {
  const system = `You are an expert English teacher preparing Korean classroom materials.

Split the passage into sentence-level units for "one-line interpretation" (한줄해석) handouts used during lecture recording.

Rules:
1. Split at sentence boundaries. Keep each english unit as one clear sentence or closely related short clause group (do not merge unrelated sentences).
2. Provide natural Korean translation for each unit (수업용 해석체, not overly literal).
3. Preserve proper nouns and key terms accurately.
4. Number lines from 1 sequentially.
5. Infer a concise Korean+English friendly passage title if not given.
6. Return ONLY valid JSON.

Schema:
{
  "passageTitle": "string (Korean title, can include English subtitle in parentheses)",
  "subtitle": "string optional (e.g. lesson/unit label)",
  "lines": [
    { "no": 1, "english": "...", "korean": "..." }
  ]
}`;

  const user = JSON.stringify({
    lessonLabel: opts.lessonLabel?.trim() || null,
    passageTitleHint: opts.passageTitle?.trim() || null,
    passage: opts.passage.trim().slice(0, 12000),
  });

  return { system, user };
}
