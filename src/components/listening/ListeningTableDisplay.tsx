import type { ListeningTableData } from "@/lib/listening/types";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

interface ListeningTableDisplayProps {
  table: ListeningTableData;
  /** 관리자 미리보기: 불일치 행 강조 */
  highlightMismatchNo?: number | null;
  compact?: boolean;
}

export function ListeningTableDisplay({
  table,
  highlightMismatchNo = null,
  compact = false,
}: ListeningTableDisplayProps) {
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
                      불일치
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
