"use client";

import { useMemo, useState } from "react";
import type { MsQuestion, MsUnit } from "@/lib/middle-school/queries";
import { useMaterialDesign } from "@/lib/lesson-materials/material-design";
import { MaterialDesignPicker } from "@/components/lesson-materials/MaterialDesignPicker";
import {
  MS_WB_TYPES,
  buildMsWorkbook,
  drawMsWorkbook,
  msWbCounts,
  type MsDrawLength,
  type MsWbGroup,
  type MsWbTypeKey,
} from "@/lib/middle-school/workbook";
import {
  MsLessonSheets,
  MsPrintFrame,
  MsWorkbookSheets,
  type MsLessonOptions,
} from "./MsSheets";
import { MsQuestionTab } from "./MsQuestionTab";

const TABS = [
  { id: "lesson", label: "수업용 자료", ready: true },
  { id: "workbook", label: "워크북 · 테스트지 뽑기", ready: true },
  { id: "questions", label: "문제", ready: true },
  { id: "analysis", label: "분석서", ready: false },
  { id: "final", label: "최종통합자료", ready: false },
] as const;
type TabId = (typeof TABS)[number]["id"];

const LESSON_SECTIONS: {
  key: keyof MsLessonOptions["sections"];
  label: string;
}[] = [
  { key: "words", label: "단어장" },
  { key: "grammar", label: "문법 정리" },
  { key: "dialogue", label: "대화문 (말차례별 해석)" },
  { key: "reading", label: "본문 (문장별 해석)" },
];

const DEFAULT_WB: MsWbTypeKey[] = [
  "r_line",
  "r_en_blank",
  "r_grammar",
  "r_word_order",
  "r_writing",
  "d_line",
  "w_en_ko",
];
const LENGTHS: { id: MsDrawLength; label: string }[] = [
  { id: "short", label: "짧게" },
  { id: "normal", label: "보통" },
  { id: "long", label: "길게" },
];

export function MiddleSchoolUnitWorkspace({
  unit,
  questions,
  academyName,
  base,
}: {
  unit: MsUnit;
  questions: MsQuestion[];
  academyName: string;
  base: string;
}) {
  const [tab, setTab] = useState<TabId>("lesson");
  const [design, setDesign] = useMaterialDesign();
  const [lesson, setLesson] = useState<MsLessonOptions>({
    sections: { words: true, grammar: true, dialogue: true, reading: true },
    translation: "show",
    wordExamples: true,
  });
  const [types, setTypes] = useState<MsWbTypeKey[]>(DEFAULT_WB);
  const [answers, setAnswers] = useState(true);
  const [length, setLength] = useState<MsDrawLength>("normal");
  /** 뽑은 테스트지(뽑을 때마다 새 seed) — null이면 워크북 전체 */
  const [drawSeed, setDrawSeed] = useState<string | null>(null);

  const counts = useMemo(() => msWbCounts(unit, unit.workbook), [unit]);
  const sheets = useMemo(
    () =>
      drawSeed
        ? drawMsWorkbook(unit, unit.workbook, types, length, drawSeed)
        : buildMsWorkbook(unit, unit.workbook, types),
    [unit, types, length, drawSeed],
  );

  const toggleType = (k: MsWbTypeKey, on: boolean) =>
    setTypes((cur) =>
      MS_WB_TYPES.map((t) => t.key).filter((x) =>
        x === k ? on : cur.includes(x),
      ),
    );

  return (
    <div className="space-y-4">
      <nav className="no-print flex flex-wrap gap-1 border-b border-slate-200 print:hidden">
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
            {!t.ready && (
              <span className="ml-1 text-[10px] font-normal">준비 중</span>
            )}
          </button>
        ))}
      </nav>

      {tab === "questions" ? (
        <MsQuestionTab
          unit={unit}
          questions={questions}
          design={design}
          setDesign={setDesign}
          academyName={academyName} base={base}
        />
      ) : (
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
          <aside className="no-print w-full shrink-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-sm print:hidden lg:sticky lg:top-4 lg:w-64">
            <MaterialDesignPicker value={design} onChange={setDesign} compact />

            {tab === "lesson" ? (
              <>
                <div>
                  <div className="mb-2 font-bold text-slate-800">넣을 자료</div>
                  {LESSON_SECTIONS.map((s) => (
                    <label
                      key={s.key}
                      className="flex items-center gap-2 py-0.5"
                    >
                      <input
                        type="checkbox"
                        checked={lesson.sections[s.key]}
                        onChange={(e) =>
                          setLesson({
                            ...lesson,
                            sections: {
                              ...lesson.sections,
                              [s.key]: e.target.checked,
                            },
                          })
                        }
                      />
                      {s.label}
                    </label>
                  ))}
                </div>
                <div>
                  <div className="mb-2 font-bold text-slate-800">
                    대화문·본문 해석
                  </div>
                  {(
                    [
                      ["show", "해석 함께"],
                      ["hide", "해석 지우고 쓰는 줄"],
                    ] as const
                  ).map(([v, label]) => (
                    <label key={v} className="flex items-center gap-2 py-0.5">
                      <input
                        type="radio"
                        name="ms-tr"
                        checked={lesson.translation === v}
                        onChange={() =>
                          setLesson({ ...lesson, translation: v })
                        }
                      />
                      {label}
                    </label>
                  ))}
                </div>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={lesson.wordExamples}
                    onChange={(e) =>
                      setLesson({ ...lesson, wordExamples: e.target.checked })
                    }
                  />
                  단어장에 예문
                </label>
              </>
            ) : (
              <>
                {(["본문", "대화문", "단어"] as MsWbGroup[]).map((g) => (
                  <div key={g}>
                    <div className="mb-1 font-bold text-slate-800">{g}</div>
                    {MS_WB_TYPES.filter((t) => t.group === g).map((t) => (
                      <label
                        key={t.key}
                        className={`flex items-center gap-2 py-0.5 ${counts[t.key] ? "" : "text-slate-300"}`}
                        title={t.hint}
                      >
                        <input
                          type="checkbox"
                          disabled={!counts[t.key]}
                          checked={types.includes(t.key)}
                          onChange={(e) => toggleType(t.key, e.target.checked)}
                        />
                        <span className="flex-1">{t.label}</span>
                        <span className="text-[11px] text-slate-400">
                          {counts[t.key]}
                        </span>
                      </label>
                    ))}
                  </div>
                ))}
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={answers}
                    onChange={(e) => setAnswers(e.target.checked)}
                  />
                  정답지 함께
                </label>
                <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
                  <div className="mb-2 font-bold text-violet-800">
                    테스트지 뽑기
                  </div>
                  <div className="mb-2 flex gap-1">
                    {LENGTHS.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => setLength(l.id)}
                        className={`flex-1 rounded-md border px-2 py-1 text-xs font-semibold ${
                          length === l.id
                            ? "border-violet-600 bg-violet-600 text-white"
                            : "border-violet-200 bg-white text-violet-700"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                  <p className="mb-2 text-[11px] leading-relaxed text-violet-700">
                    고른 유형에서 지문마다 유형당{" "}
                    {length === "short" ? 3 : length === "normal" ? 5 : 8}
                    문항(단어는{" "}
                    {length === "short" ? 10 : length === "normal" ? 15 : 25}
                    개)을 무작위로 뽑습니다. 누를 때마다 새로 뽑힙니다.
                  </p>
                  <button
                    type="button"
                    onClick={() => setDrawSeed(`${Date.now()}`)}
                    className="w-full rounded-lg bg-violet-600 py-1.5 text-sm font-semibold text-white hover:bg-violet-700"
                  >
                    {drawSeed ? "다시 뽑기" : "뽑기"}
                  </button>
                  {drawSeed ? (
                    <button
                      type="button"
                      onClick={() => setDrawSeed(null)}
                      className="mt-1 w-full text-xs text-violet-700 underline"
                    >
                      워크북 전체로 돌아가기
                    </button>
                  ) : null}
                </div>
              </>
            )}
            <button
              type="button"
              onClick={() => window.print()}
              className="w-full rounded-lg bg-slate-900 py-2 font-semibold text-white hover:bg-slate-800"
            >
              인쇄 · PDF 저장
            </button>
          </aside>

          <div className="min-w-0 flex-1 overflow-x-auto bg-slate-100 py-4 print:overflow-visible print:bg-white print:p-0">
            <MsPrintFrame design={design} academyName={academyName}>
              {tab === "lesson" ? (
                <MsLessonSheets unit={unit} options={lesson} />
              ) : (
                <MsWorkbookSheets
                  sheets={sheets}
                  answers={answers}
                  title={drawSeed ? "테스트" : "워크북"}
                  measureKey={`${unit.id}-${design}-${types.join(",")}-${drawSeed ?? "all"}-${length}-${answers}`}
                />
              )}
            </MsPrintFrame>
          </div>
        </div>
      )}
    </div>
  );
}
