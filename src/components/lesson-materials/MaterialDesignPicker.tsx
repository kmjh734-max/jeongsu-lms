"use client";

import { useState, useTransition } from "react";
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
  /*
   * 디자인을 바꾸면 모든 쪽을 다시 재고 나눈다(통합자료는 수십 쪽). 선생님 지적(2026-10-21 「너무 느려」):
   * 누른 버튼은 바로 바뀌고, 쪽 다시 그리기는 뒤에서(transition) 하게 한다.
   */
  const [pending, startTransition] = useTransition();
  const [picked, setPicked] = useState<MaterialDesign | null>(null);
  const shown = pending && picked ? picked : value;
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold text-slate-500">{title}</p>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {MATERIAL_DESIGNS.map((d) => (
          <button
            key={d.id}
            type="button"
            title={d.hint}
            onClick={() => {
              if (d.id === value) return;
              setPicked(d.id);
              startTransition(() => onChange(d.id));
            }}
            className={`rounded-md px-1 py-1.5 text-[11px] font-bold transition ${
              shown === d.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
            }`}
          >
            {d.label}
          </button>
        ))}
      </div>
      <p className="text-[10.5px] leading-snug text-slate-400">
        {pending ? "디자인을 바꾸는 중…" : `${MATERIAL_DESIGNS.find((d) => d.id === value)?.hint} · 수업용 자료·분석서·워크북·통합자료에 같이 적용됩니다.`}
      </p>
    </div>
  );
}
