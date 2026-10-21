"use client";

import { MATERIAL_DESIGNS, type MaterialDesign } from "@/lib/lesson-materials/material-design";

/** 자료 디자인 고르기 — 모든 자료가 같은 것을 쓴다(선생님 2026-10-21) */
export function MaterialDesignPicker({
  value,
  onChange,
  title = "디자인",
}: {
  value: MaterialDesign;
  onChange: (d: MaterialDesign) => void;
  title?: string;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold text-slate-500">{title}</p>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {MATERIAL_DESIGNS.map((d) => (
          <button
            key={d.id}
            type="button"
            title={d.hint}
            onClick={() => onChange(d.id)}
            className={`rounded-md px-1 py-1.5 text-[11px] font-bold transition ${
              value === d.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <p className="text-[10.5px] leading-snug text-slate-400">
        {MATERIAL_DESIGNS.find((d) => d.id === value)?.hint} · 수업용 자료·분석서·워크북·통합자료에 같이 적용됩니다.
      </p>
    </div>
  );
}
