import type { ListeningTableData, ListeningTableRow } from "@/lib/listening/types";

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
      const value = String(row.value ?? "").trim();
      if (!label || !value) return null;
      return { no, label, value };
    })
    .filter((r): r is ListeningTableRow => r !== null);

  if (!title || rows.length !== 5) return null;

  const mismatch_no = Number(o.mismatch_no);
  if (!Number.isInteger(mismatch_no) || mismatch_no < 1 || mismatch_no > 5) {
    return null;
  }

  return {
    title,
    rows: rows.map((r, i) => ({ ...r, no: i + 1 })),
    mismatch_no,
    mismatch_reason: String(o.mismatch_reason ?? "").trim(),
  };
}
