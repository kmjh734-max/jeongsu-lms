"use client";

import { useMemo, useState } from "react";
import type { MsQuestion, MsUnit } from "@/lib/middle-school/queries";
import type { MaterialDesign } from "@/lib/lesson-materials/material-design";
import { MaterialDesignPicker } from "@/components/lesson-materials/MaterialDesignPicker";
import { seeded, shuffle } from "@/lib/middle-school/workbook";
import { MsPrintFrame } from "./MsSheets";
import { MsQuestionAnswerSheets, MsQuestionSheets } from "./MsQuestionSheets";

const AREAS = ["단어", "의사소통", "어법", "본문"] as const;
const COUNTS = [10, 20, 30] as const;

/** 문제 탭: 족보닷컴 예상문제를 출처·영역·유형으로 거르고, 그대로 또는 무작위로 뽑아 시험지·정답지로 낸다 */
export function MsQuestionTab({
  unit,
  questions,
  design,
  setDesign,
  academyName,
}: {
  unit: MsUnit;
  questions: MsQuestion[];
  design: MaterialDesign;
  setDesign: (d: MaterialDesign) => void;
  academyName: string;
}) {
  const sources = useMemo(() => [...new Set(questions.map((q) => q.source))], [questions]);
  const [src, setSrc] = useState<string[]>(sources);
  const [areas, setAreas] = useState<string[]>([...AREAS]);
  const [kinds, setKinds] = useState<("mc" | "sa")[]>(["mc", "sa"]);
  const [withReview, setWithReview] = useState(false);
  const [answers, setAnswers] = useState(true);
  const [expl, setExpl] = useState(false);
  const [draw, setDraw] = useState<{ n: number; seed: string } | null>(null);

  const pool = useMemo(
    () => questions.filter((q) => src.includes(q.source) && areas.includes(q.area) && kinds.includes(q.kind) && (withReview || !q.review)),
    [questions, src, areas, kinds, withReview],
  );
  const shown = useMemo(() => {
    if (!draw || pool.length <= draw.n) return pool;
    // 무작위로 고르되, 같은 지문 문항이 붙어 있게 원래 차례로 다시 늘어놓는다
    const keep = new Set(shuffle(pool.map((q) => q.id), seeded(draw.seed)).slice(0, draw.n));
    return pool.filter((q) => keep.has(q.id));
  }, [pool, draw]);

  function toggle<T>(list: T[], v: T, on: boolean): T[] {
    return on ? [...list, v] : list.filter((x) => x !== v);
  }
  const ids = shown.map((q) => q.id).join(".");

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <aside className="no-print w-full shrink-0 space-y-4 rounded-xl border border-slate-200 bg-white p-4 text-sm print:hidden lg:sticky lg:top-4 lg:w-64">
        <MaterialDesignPicker value={design} onChange={setDesign} compact />
        <div>
          <div className="mb-1 font-bold text-slate-800">출처</div>
          {sources.map((s) => (
            <label key={s} className="flex items-center gap-2 py-0.5">
              <input type="checkbox" checked={src.includes(s)} onChange={(e) => setSrc(toggle(src, s, e.target.checked))} />
              <span className="flex-1">{s}</span>
              <span className="text-[11px] text-slate-400">{questions.filter((q) => q.source === s && !q.review).length}</span>
            </label>
          ))}
        </div>
        <div>
          <div className="mb-1 font-bold text-slate-800">영역</div>
          <div className="flex flex-wrap gap-x-3">
            {AREAS.map((a) => (
              <label key={a} className="flex items-center gap-1.5 py-0.5">
                <input type="checkbox" checked={areas.includes(a)} onChange={(e) => setAreas(toggle(areas, a, e.target.checked))} />
                {a}
              </label>
            ))}
          </div>
        </div>
        <div className="flex gap-3">
          {(
            [
              ["mc", "객관식"],
              ["sa", "서술형"],
            ] as const
          ).map(([k, label]) => (
            <label key={k} className="flex items-center gap-1.5">
              <input type="checkbox" checked={kinds.includes(k)} onChange={(e) => setKinds(toggle(kinds, k, e.target.checked))} />
              {label}
            </label>
          ))}
        </div>
        <label className="flex items-center gap-2 text-xs text-slate-500" title="그림·표가 있어야 풀 수 있거나 자동 점검에 걸린 문항">
          <input type="checkbox" checked={withReview} onChange={(e) => setWithReview(e.target.checked)} />
          검수 필요 문항도 보기 ({questions.filter((q) => q.review).length})
        </label>
        <div className="space-y-1">
          <label className="flex items-center gap-2">
            <input type="checkbox" checked={answers} onChange={(e) => setAnswers(e.target.checked)} />
            정답지 함께
          </label>
          <label className={`flex items-center gap-2 ${answers ? "" : "text-slate-300"}`}>
            <input type="checkbox" disabled={!answers} checked={expl} onChange={(e) => setExpl(e.target.checked)} />
            정답지에 해설
          </label>
        </div>
        <div className="rounded-lg border border-violet-200 bg-violet-50 p-3">
          <div className="mb-2 font-bold text-violet-800">시험지 뽑기</div>
          <p className="mb-2 text-[11px] text-violet-700">고른 조건의 {pool.length}문항에서 무작위로 뽑습니다. 누를 때마다 새로 뽑힙니다.</p>
          <div className="flex gap-1">
            {COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => setDraw({ n, seed: `${Date.now()}` })}
                className="flex-1 rounded-md bg-violet-600 py-1 text-xs font-semibold text-white hover:bg-violet-700"
              >
                {n}문항
              </button>
            ))}
          </div>
          {draw ? (
            <button type="button" onClick={() => setDraw(null)} className="mt-1 w-full text-xs text-violet-700 underline">
              고른 조건 전체로 돌아가기
            </button>
          ) : null}
        </div>
        <button type="button" onClick={() => window.print()} className="w-full rounded-lg bg-slate-900 py-2 font-semibold text-white hover:bg-slate-800">
          인쇄 · PDF 저장
        </button>
      </aside>
      <div className="min-w-0 flex-1 overflow-x-auto bg-slate-100 py-4 print:overflow-visible print:bg-white print:p-0">
        <MsPrintFrame design={design} academyName={academyName}>
          <MsQuestionSheets
            questions={shown}
            title={draw ? "테스트" : "예상문제"}
            sub={`${shown.length}문항`}
            right={`${unit.grade} ${unit.publisher} ${unit.lessonNo}과`}
            measureKey={`${unit.id}-q-${design}-${ids}`}
          />
          {answers && shown.length ? (
            <MsQuestionAnswerSheets questions={shown} explanation={expl} title="정답" measureKey={`${unit.id}-qa-${design}-${expl}-${ids}`} />
          ) : null}
        </MsPrintFrame>
      </div>
    </div>
  );
}
