"use client";

import type { ExamPrintConfig } from "@/lib/vocab/vocab-print-exam-config";

interface VocabPrintExamConfigProps {
  config: ExamPrintConfig;
  onChange: (config: ExamPrintConfig) => void;
  maxPool: number;
}

const ROWS = [
  { label: "단어제시", mc: "word_mc" as const, sa: "word_sa" as const },
  { label: "의미제시", mc: "meaning_mc" as const, sa: "meaning_sa" as const },
  { label: "예문제시", mc: "example_mc" as const, sa: "example_sa" as const },
];

export function VocabPrintExamConfig({
  config,
  onChange,
  maxPool,
}: VocabPrintExamConfigProps) {
  function setCount(key: keyof ExamPrintConfig, raw: string) {
    const n = Number.parseInt(raw, 10);
    const value = Number.isFinite(n) && n > 0 ? Math.min(n, 99) : 0;
    onChange({ ...config, [key]: value });
  }

  return (
    <div className="w-full rounded-lg border border-slate-200 bg-slate-50 p-3">
      <p className="mb-2 text-xs font-semibold text-slate-600">
        시험지 문항 수 (세트 단어 {maxPool}개 기준)
      </p>
      <table className="w-full max-w-md border-collapse text-sm">
        <thead>
          <tr className="text-xs text-slate-500">
            <th className="pb-2 text-left font-medium" />
            <th className="pb-2 text-center font-semibold">객관식</th>
            <th className="pb-2 text-center font-semibold">주관식</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label}>
              <td className="py-1.5 pr-3 font-medium text-slate-700">{row.label}</td>
              <td className="px-1 py-1.5 text-center">
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={config[row.mc] || ""}
                  onChange={(e) => setCount(row.mc, e.target.value)}
                  className="w-16 rounded border border-slate-300 px-2 py-1 text-center text-sm"
                />
              </td>
              <td className="px-1 py-1.5 text-center">
                <input
                  type="number"
                  min={0}
                  max={99}
                  value={config[row.sa] || ""}
                  onChange={(e) => setCount(row.sa, e.target.value)}
                  className="w-16 rounded border border-slate-300 px-2 py-1 text-center text-sm"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
