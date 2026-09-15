import type { ListeningTableData } from "@/lib/listening/types";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

interface ListeningTableDisplayProps {
  table: ListeningTableData;
  /** 관리자 미리보기: 불일치(또는 정답) 행 강조 */
  highlightMismatchNo?: number | null;
  /** 강조한 행에 붙일 말 (표 정보 불일치 = "불일치", 표 보고 고르기 = "정답") */
  highlightLabel?: string;
  compact?: boolean;
}

/** 빈칸 (A)·(B) */
function isBlankValue(value: string): "A" | "B" | null {
  const m = value.trim().match(/^\(\s*([AB])\s*\)$/i);
  return m ? (m[1]!.toUpperCase() as "A" | "B") : null;
}

/** 인쇄 양식(전단·티켓·신청서) — 빈칸 (A)(B)는 네모 칸으로 */
export function ListeningFlyerDisplay({ table, compact = false }: { table: ListeningTableData; compact?: boolean }) {
  return (
    <div
      className={`mx-auto max-w-md rounded-lg border-2 border-slate-300 bg-white px-4 py-3 ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      <p className="mb-2 border-b border-dashed border-slate-300 pb-2 text-center font-bold tracking-wide text-slate-900">
        {table.title}
      </p>
      <dl className="grid grid-cols-[auto_minmax(0,1fr)] gap-x-3 gap-y-1.5">
        {table.rows.map((row) => {
          const blank = isBlankValue(row.value);
          return (
            <div key={row.no} className="contents">
              <dt className="font-semibold text-slate-600">{row.label}</dt>
              <dd className="text-slate-900">
                {blank ? (
                  <span className="inline-flex min-w-[5.5rem] items-center justify-center rounded border border-slate-400 px-2 py-0.5 font-semibold text-slate-700">
                    ({blank})
                  </span>
                ) : (
                  row.value
                )}
              </dd>
            </div>
          );
        })}
      </dl>
    </div>
  );
}

/**
 * 표 보고 고르기: 제목 "품목 (열1 / 열2 / 열3)" + 값 "열1: 값 / 열2: 값"이면 열마다 칸을 나눈다.
 * 모든 행이 이 형식일 때만 (아니면 null → 번호·항목·내용 3칸 표).
 */
export function splitTableColumns(
  table: ListeningTableData
): { title: string; columns: string[]; cells: string[][] } | null {
  const m = table.title.match(/^(.*?)\s*\(([^()]+\/[^()]+)\)\s*$/);
  if (!m) return null;
  const columns = m[2]!.split("/").map((c) => c.trim()).filter(Boolean);
  if (columns.length < 2) return null;
  const cells: string[][] = [];
  for (const row of table.rows) {
    const parts = row.value.split(/\s+\/\s+/).map((p) => p.trim());
    const byCol = new Map<string, string>();
    for (const p of parts) {
      const kv = p.match(/^([^:]+):\s*(.+)$/);
      if (kv) byCol.set(kv[1]!.trim().toLowerCase(), kv[2]!.trim());
    }
    // 첫 열이 행 이름(label)인 경우: "Class / Day / Fee"에서 Class = label
    const line = columns.map((c, i) => byCol.get(c.toLowerCase()) ?? (i === 0 ? row.label : ""));
    if (line.some((v) => !v)) return null;
    cells.push(line);
  }
  return { title: m[1]!.trim() || table.title, columns, cells };
}

export function ListeningTableDisplay({
  table,
  highlightMismatchNo = null,
  highlightLabel = "불일치",
  compact = false,
}: ListeningTableDisplayProps) {
  if (table.kind === "flyer") return <ListeningFlyerDisplay table={table} compact={compact} />;
  const grid = splitTableColumns(table);
  if (grid) {
    return (
      <div
        className={`overflow-x-auto rounded-lg border border-slate-200 bg-white ${
          compact ? "text-xs" : "text-sm"
        }`}
      >
        <p className="border-b border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-900">
          {grid.title}
        </p>
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-slate-600">
              <th className="w-10 px-2 py-1.5 font-medium" aria-label="번호" />
              {grid.columns.map((c) => (
                <th key={c} className="px-2 py-1.5 font-medium">
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => {
              const hit = highlightMismatchNo != null && row.no === highlightMismatchNo;
              return (
                <tr key={row.no} className={hit ? "bg-amber-50" : "border-t border-slate-100"}>
                  <td className="whitespace-nowrap px-2 py-1.5 font-medium text-slate-700">
                    {CIRCLED[row.no - 1] ?? row.no}
                    {/* 행 이름(A~E 등)이 첫 칸 값과 다르면 번호 옆에 (선택지가 행 이름일 때 대응) */}
                    {!/^[①②③④⑤]$/.test(row.label.trim()) && row.label.trim() !== grid.cells[ri]![0] ? (
                      <span className="ml-1 text-slate-500">{row.label}</span>
                    ) : null}
                    {hit && (
                      <span className="ml-1 rounded bg-amber-200 px-1 py-0.5 text-[10px] font-medium text-amber-900">
                        {highlightLabel}
                      </span>
                    )}
                  </td>
                  {grid.cells[ri]!.map((v, ci) => (
                    <td key={ci} className="px-2 py-1.5 text-slate-800">
                      {v}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }
  return (
    <div
      className={`overflow-x-auto rounded-lg border border-slate-200 bg-white ${
        compact ? "text-xs" : "text-sm"
      }`}
    >
      <p className="border-b border-slate-200 bg-slate-50 px-3 py-2 font-semibold text-slate-900">
        {table.title}
      </p>
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-slate-200 bg-slate-50/80 text-left text-slate-600">
            <th className="w-12 px-2 py-1.5 font-medium">번호</th>
            <th className="w-24 px-2 py-1.5 font-medium">항목</th>
            <th className="px-2 py-1.5 font-medium">내용</th>
          </tr>
        </thead>
        <tbody>
          {table.rows.map((row) => {
            const isMismatch =
              highlightMismatchNo != null && row.no === highlightMismatchNo;
            return (
              <tr
                key={row.no}
                className={
                  isMismatch
                    ? "bg-amber-50"
                    : "border-t border-slate-100"
                }
              >
                <td className="px-2 py-1.5 font-medium text-slate-700">
                  {CIRCLED[row.no - 1] ?? row.no}
                </td>
                <td className="px-2 py-1.5 text-slate-800">{row.label}</td>
                <td className="px-2 py-1.5 text-slate-800">
                  {row.value}
                  {isMismatch && (
                    <span className="ml-2 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-medium text-amber-900">
                      {highlightLabel}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
