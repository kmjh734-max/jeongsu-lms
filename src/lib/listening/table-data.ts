import type { ListeningTableData, ListeningTableRow } from "@/lib/listening/types";

/** AI가 value를 객체로 줄 때 String(obj) → "[object Object]" 방지 */
export function stringifyTableCell(value: unknown): string {
  if (value == null) return "";
  if (typeof value === "string") {
    const t = value.trim();
    return t === "[object Object]" ? "" : t;
  }
  if (typeof value === "number" || typeof value === "boolean") {
    return String(value);
  }
  if (Array.isArray(value)) {
    return value.map(stringifyTableCell).filter(Boolean).join(" / ");
  }
  if (typeof value === "object") {
    return Object.values(value as Record<string, unknown>)
      .map(stringifyTableCell)
      .filter(Boolean)
      .join(" / ");
  }
  return String(value).trim();
}

export function normalizeTableData(raw: unknown): ListeningTableData | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  const title = String(o.title ?? "").trim();
  const rowsRaw = Array.isArray(o.rows) ? o.rows : [];
  const rows: ListeningTableRow[] = rowsRaw
    .map((r, i) => {
      const row = r as Record<string, unknown>;
      const no = Number(row.no ?? i + 1);
      const label = String(row.label ?? "").trim();
      const value = stringifyTableCell(row.value);
      if (!label || !value) return null;
      return { no, label, value };
    })
    .filter((r): r is ListeningTableRow => r !== null);

  // 인쇄 양식(전단·티켓): 4~6줄, 두 줄의 값이 빈칸 (A)·(B)
  const flyer = String(o.kind ?? "").trim() === "flyer" || isFlyerRows(rows);
  if (!title) return null;
  if (flyer ? rows.length < 4 || rows.length > 6 : rows.length !== 5) return null;

  const mismatch_no = Number(o.mismatch_no);
  const validNo = Number.isInteger(mismatch_no) && mismatch_no >= 1 && mismatch_no <= 5;
  if (!validNo && !flyer) return null;

  return {
    ...(flyer ? { kind: "flyer" as const } : {}),
    title,
    rows: rows.map((r, i) => ({ ...r, no: i + 1 })),
    mismatch_no: validNo ? mismatch_no : 0,
    mismatch_reason: String(o.mismatch_reason ?? "").trim(),
  };
}

const BLANK_A = /^\(\s*A\s*\)$/i;
const BLANK_B = /^\(\s*B\s*\)$/i;

/** 값이 정확히 "(A)"·"(B)"인 줄이 하나씩 있으면 양식 */
function isFlyerRows(rows: ListeningTableRow[]): boolean {
  return (
    rows.filter((r) => BLANK_A.test(r.value.trim())).length === 1 &&
    rows.filter((r) => BLANK_B.test(r.value.trim())).length === 1
  );
}

/** 양식(전단·티켓)인지 */
export function isFlyerTable(t: ListeningTableData | null | undefined): boolean {
  return t?.kind === "flyer";
}

/** 양식 빈칸 줄 번호 (A)·(B) */
export function flyerBlankRows(t: ListeningTableData): { a?: ListeningTableRow; b?: ListeningTableRow } {
  return {
    a: t.rows.find((r) => BLANK_A.test(r.value.trim())),
    b: t.rows.find((r) => BLANK_B.test(r.value.trim())),
  };
}

/** "(A) City Hall – (B) $12" → { a: "City Hall", b: "$12" } */
export function parseFlyerChoice(choice: string): { a: string; b: string } | null {
  const m = String(choice ?? "").match(/\(\s*A\s*\)\s*(.+?)\s*[–—-]\s*\(\s*B\s*\)\s*(.+)$/i);
  if (!m) return null;
  return { a: m[1]!.trim(), b: m[2]!.trim() };
}
