"use client";

import type {
  ExamColumnCount,
  ExamLineSpacing,
  ExamPrintConfig,
  ExamPrintLayout,
  ExamPrintSettings,
} from "@/lib/vocab/vocab-print-exam-config";
import {
  EXAM_COLUMN_LABELS,
  EXAM_LINE_SPACING_LABELS,
  clampExamConfigToPool,
  examConfigTotal,
} from "@/lib/vocab/vocab-print-exam-config";

interface VocabPrintExamConfigProps {
  settings: ExamPrintSettings;
  onChange: (settings: ExamPrintSettings) => void;
  onReshuffle: () => void;
  maxPool: number;
}

const ROWS = [
  { label: "단어제시", mc: "word_mc" as const, sa: "word_sa" as const },
  { label: "의미제시", mc: "meaning_mc" as const, sa: "meaning_sa" as const },
  { label: "예문제시", mc: "example_mc" as const, sa: "example_sa" as const },
];

const COLUMNS: ExamColumnCount[] = [1, 2, 3, 4];
const SPACINGS: ExamLineSpacing[] = ["compact", "normal", "wide"];

export function VocabPrintExamConfig({
  settings,
  onChange,
  onReshuffle,
  maxPool,
}: VocabPrintExamConfigProps) {
  const { counts, layout } = settings;

  const total = examConfigTotal(counts);
  const overPool = total > maxPool;

  function setCounts(next: ExamPrintConfig) {
    onChange({
      ...settings,
      counts: clampExamConfigToPool(next, maxPool),
    });
  }

  function setLayout(next: Partial<ExamPrintLayout>) {
    onChange({
      ...settings,
      layout: { ...layout, ...next },
      shuffleSeed: layout.shuffle !== next.shuffle ? Date.now() : settings.shuffleSeed,
    });
  }

  function setCount(key: keyof ExamPrintConfig, raw: string) {
    const n = Number.parseInt(raw, 10);
    const value =
      Number.isFinite(n) && n > 0 ? Math.min(n, Math.max(maxPool, 0), 99) : 0;
    setCounts({ ...counts, [key]: value });
  }

  return (
    <div className="w-full space-y-3">
      <p className="text-[13px] font-medium text-slate-600">
        문항 수 · 단어 {maxPool}개라 합계 {maxPool}문항까지 (예문 문항은 마지막에 1단)
      </p>
      <p
        className={`text-xs font-medium ${
          overPool ? "text-amber-700" : "text-slate-500"
        }`}
      >
        현재 합계 {Math.min(total, maxPool)} / {maxPool}문항
        {overPool ? " · 단어 수보다 많을 수 없어 알아서 줄여요." : ""}
      </p>

      <table className="w-full border-collapse text-sm">
        <thead>
          <tr className="text-[13px] text-slate-500">
            <th className="pb-2 text-left font-medium" />
            <th className="pb-2 text-center font-semibold">객관식</th>
            <th className="pb-2 text-center font-semibold">주관식</th>
          </tr>
        </thead>
        <tbody>
          {ROWS.map((row) => (
            <tr key={row.label}>
              <td className="py-1.5 pr-3 text-[13px] font-medium text-slate-700">{row.label}</td>
              <td className="px-1 py-1.5 text-center">
                <input
                  type="number"
                  min={0}
                  max={maxPool || 0}
                  value={counts[row.mc] || ""}
                  onChange={(e) => setCount(row.mc, e.target.value)}
                  className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-center text-sm tabular-nums focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </td>
              <td className="px-1 py-1.5 text-center">
                <input
                  type="number"
                  min={0}
                  max={maxPool || 0}
                  value={counts[row.sa] || ""}
                  onChange={(e) => setCount(row.sa, e.target.value)}
                  className="w-16 rounded-md border border-slate-300 px-2 py-1.5 text-center text-sm tabular-nums focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100"
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-200 pt-3">
        <span className="w-full text-[13px] font-medium text-slate-600">
          단 구성 (단어·의미)
        </span>
        {COLUMNS.map((col) => (
          <button
            key={col}
            type="button"
            onClick={() => setLayout({ columns: col })}
            className={`rounded-md border px-3 py-1.5 text-[13px] font-semibold ${
              layout.columns === col
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {EXAM_COLUMN_LABELS[col]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="w-full text-[13px] font-medium text-slate-600">문항 간격</span>
        {SPACINGS.map((spacing) => (
          <button
            key={spacing}
            type="button"
            onClick={() => setLayout({ lineSpacing: spacing })}
            className={`rounded-md border px-3 py-1.5 text-[13px] font-semibold ${
              layout.lineSpacing === spacing
                ? "border-brand-600 bg-brand-50 text-brand-700"
                : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
            }`}
          >
            {EXAM_LINE_SPACING_LABELS[spacing]}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-[13px] text-slate-700">
          <input
            type="checkbox"
            checked={layout.shuffle}
            onChange={(e) => setLayout({ shuffle: e.target.checked })}
            className="h-4 w-4 accent-brand-600"
          />
          문항 순서 섞기
        </label>
        <button
          type="button"
          onClick={onReshuffle}
          className="rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
        >
          순서 다시 섞기
        </button>
      </div>
    </div>
  );
}
