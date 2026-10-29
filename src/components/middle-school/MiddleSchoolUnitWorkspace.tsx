"use client";

import { useState } from "react";
import type { MsUnit } from "@/lib/middle-school/queries";
import { MsLessonPack, type MsLessonPackOptions } from "./MsLessonPack";

const TABS = [
  { id: "lesson", label: "수업용 자료", ready: true },
  { id: "analysis", label: "분석서", ready: false },
  { id: "workbook", label: "워크북", ready: false },
  { id: "questions", label: "문제", ready: false },
  { id: "final", label: "최종통합자료", ready: false },
] as const;

const SECTIONS: { key: keyof MsLessonPackOptions["sections"]; label: string }[] = [
  { key: "words", label: "단어장" },
  { key: "grammar", label: "문법 정리" },
  { key: "dialogue", label: "대화문" },
  { key: "reading", label: "본문" },
];

export function MiddleSchoolUnitWorkspace({ unit, academyName }: { unit: MsUnit; academyName: string }) {
  const [tab, setTab] = useState<(typeof TABS)[number]["id"]>("lesson");
  const [opts, setOpts] = useState<MsLessonPackOptions>({
    cover: true,
    sections: { words: true, grammar: true, dialogue: true, reading: true },
    translation: "show",
    wordExamples: true,
  });

  return (
    <div className="space-y-4">
      <nav className="no-print flex flex-wrap gap-1 border-b border-slate-200">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            disabled={!t.ready}
            onClick={() => setTab(t.id)}
            className={`-mb-px border-b-2 px-4 py-2 text-sm font-semibold ${
              tab === t.id
                ? "border-violet-600 text-violet-700"
                : t.ready
                  ? "border-transparent text-slate-600 hover:text-slate-900"
                  : "cursor-not-allowed border-transparent text-slate-300"
            }`}
          >
            {t.label}
            {!t.ready && <span className="ml-1 text-[10px] font-normal">준비 중</span>}
          </button>
        ))}
      </nav>

      {tab === "lesson" && (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <aside className="no-print w-full shrink-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-sm lg:sticky lg:top-4 lg:w-60">
            <div>
              <div className="mb-2 font-bold text-slate-800">넣을 자료</div>
              <label className="flex items-center gap-2 py-0.5">
                <input type="checkbox" checked={opts.cover} onChange={(e) => setOpts({ ...opts, cover: e.target.checked })} />
                표지
              </label>
              {SECTIONS.map((s) => (
                <label key={s.key} className="flex items-center gap-2 py-0.5">
                  <input
                    type="checkbox"
                    checked={opts.sections[s.key]}
                    onChange={(e) => setOpts({ ...opts, sections: { ...opts.sections, [s.key]: e.target.checked } })}
                  />
                  {s.label}
                </label>
              ))}
            </div>
            <div>
              <div className="mb-2 font-bold text-slate-800">대화문·본문 해석</div>
              {(
                [
                  ["show", "해석 함께"],
                  ["blank", "해석 지우고 쓰는 줄"],
                ] as const
              ).map(([v, label]) => (
                <label key={v} className="flex items-center gap-2 py-0.5">
                  <input type="radio" name="ms-tr" checked={opts.translation === v} onChange={() => setOpts({ ...opts, translation: v })} />
                  {label}
                </label>
              ))}
            </div>
            <label className="flex items-center gap-2">
              <input type="checkbox" checked={opts.wordExamples} onChange={(e) => setOpts({ ...opts, wordExamples: e.target.checked })} />
              단어장에 예문
            </label>
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full rounded-lg bg-violet-600 py-2 font-semibold text-white hover:bg-violet-700"
            >
              인쇄 · PDF 저장
            </button>
          </aside>
          <div className="min-w-0 flex-1 overflow-x-auto">
            <MsLessonPack unit={unit} options={opts} academyName={academyName} />
          </div>
        </div>
      )}
    </div>
  );
}
