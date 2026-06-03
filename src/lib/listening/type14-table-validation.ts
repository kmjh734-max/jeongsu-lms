/** 14번 표 정보 불일치 검사 */

import type { ListeningTableData } from "@/lib/listening/types";
import { normalizeTableData } from "@/lib/listening/table-data";

export interface SourceFactFromScript {
  label: string;
  value: string;
}

export function buildType14Instruction(title: string): string {
  const t = title.trim();
  if (!t) {
    return "○○에 관한 다음 내용을 듣고, 표의 내용과 일치하지 않는 것을 고르시오.";
  }
  return `${t}에 관한 다음 내용을 듣고, 표의 내용과 일치하지 않는 것을 고르시오.`;
}

export function normalizeSourceFactsFromScript(
  raw: unknown
): SourceFactFromScript[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const label = String(o.label ?? "").trim();
      const value = String(o.value ?? "").trim();
      if (!label || !value) return null;
      return { label, value };
    })
    .filter((x): x is SourceFactFromScript => x !== null);
}

export function choicesFromTableLabels(table: ListeningTableData): string[] {
  return table.rows.map((r) => r.label.trim()).filter(Boolean);
}

export function choicesAlignWithTable(
  choices: string[],
  table: ListeningTableData
): boolean {
  if (choices.length !== 5 || table.rows.length !== 5) return false;
  return table.rows.every((row, i) => {
    const choice = choices[i]?.trim() ?? "";
    const label = row.label.trim();
    if (!choice) return false;
    return choice === label || choice.startsWith(`${label} -`) || choice.startsWith(`${label}-`);
  });
}

export function getMonologueSpeaker(
  segments: Array<{ speaker: string; text: string }>
): "M" | "W" | "ANN" | null {
  const speakers = new Set(
    segments
      .filter((s) => s.text.trim())
      .map((s) => s.speaker)
      .filter((s) => s === "M" || s === "W" || s === "ANN")
  );
  if (speakers.size === 1) {
    return [...speakers][0] as "M" | "W" | "ANN";
  }
  if (speakers.size === 2 && speakers.has("M") && speakers.has("W")) {
    return null;
  }
  return speakers.size === 1 ? ([...speakers][0] as "M" | "W" | "ANN") : null;
}

export function validateType14TableFields(q: {
  instruction: string;
  choices: string[];
  correct_answer: number;
  answer_clue: string;
  table_data?: ListeningTableData | null;
  source_facts_from_script?: SourceFactFromScript[];
  segments: Array<{ speaker: string; text: string }>;
  visual_choice_type?: string;
  needs_image_choices?: boolean;
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const table = q.table_data ?? null;

  if (!/표.*일치하지|일치하지\s*않는/.test(q.instruction)) {
    issues.push("지시문이 표 정보 불일치 유형에 맞지 않을 수 있습니다.");
  }

  if (q.needs_image_choices) {
    issues.push("needs_image_choices는 false여야 합니다.");
  }

  if (q.visual_choice_type && q.visual_choice_type !== "table") {
    issues.push('visual_choice_type은 "table"이어야 합니다.');
  }

  if (!table) {
    issues.push("table_data가 필요합니다.");
    return { ok: false, issues };
  }

  if (!table.title?.trim()) {
    issues.push("table_data.title이 필요합니다.");
  }

  if (table.rows.length !== 5) {
    issues.push(`table_data.rows는 5개여야 합니다 (${table.rows.length}개).`);
  }

  for (const row of table.rows) {
    if (!row.label?.trim() || !row.value?.trim()) {
      issues.push("각 row에 label과 value가 필요합니다.");
      break;
    }
  }

  if (table.mismatch_no < 1 || table.mismatch_no > 5) {
    issues.push("table_data.mismatch_no는 1~5여야 합니다.");
  }

  if (q.correct_answer !== table.mismatch_no) {
    issues.push("correct_answer와 mismatch_no가 일치해야 합니다.");
  }

  if (!table.mismatch_reason?.trim()) {
    issues.push("table_data.mismatch_reason이 필요합니다.");
  }

  if (!choicesAlignWithTable(q.choices, table)) {
    issues.push("choices가 table_data.rows의 label과 같은 순서여야 합니다.");
  }

  const facts = q.source_facts_from_script ?? [];
  if (facts.length > 0 && facts.length < 5) {
    issues.push("source_facts_from_script는 5개 권장(대본 기준 정보).");
  }

  const speaker = getMonologueSpeaker(q.segments);
  const dialogueSpeakers = new Set(
    q.segments.filter((s) => s.text.trim()).map((s) => s.speaker)
  );
  if (dialogueSpeakers.has("M") && dialogueSpeakers.has("W")) {
    issues.push("14번은 M 또는 W 한 명의 안내문 형식이어야 합니다.");
  }

  if (!speaker && q.segments.some((s) => s.text.trim())) {
    issues.push("14번은 단일 화자(M/W/ANN) 안내문이어야 합니다.");
  }

  if (!q.answer_clue?.trim()) {
    issues.push("answer_clue(불일치 근거)가 필요합니다.");
  }

  return { ok: issues.length === 0, issues };
}

export function normalizeType14TableData(raw: unknown): ListeningTableData | null {
  return normalizeTableData(raw);
}
