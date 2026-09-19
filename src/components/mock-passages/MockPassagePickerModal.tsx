"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";

export type PickedMockPassage = { id: string; itemNo: string; label: string; shortLabel: string; text: string };

type ExamSummary = { key: string; year: number; month: number; grade: number; kind: string; count: number };
type PassageRow = PickedMockPassage & { words: number };

/** 모의고사 지문 모음에서 지문 불러오기: 학년 → 시험 → 번호 고르기 (여러 시험에서 섞어 골라도 된다) */
export function MockPassagePickerModal({
  max,
  onPick,
  onClose,
}: {
  /** 더 넣을 수 있는 지문 수 (없으면 제한 없음) */
  max?: number;
  onPick: (list: PickedMockPassage[]) => void;
  onClose: () => void;
}) {
  const [exams, setExams] = useState<ExamSummary[] | null>(null);
  const [grade, setGrade] = useState(1);
  const [examKey, setExamKey] = useState<string | null>(null);
  const [cache, setCache] = useState<Record<string, PassageRow[]>>({});
  const [picked, setPicked] = useState<Map<string, PassageRow>>(new Map());
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/mock-passages")
      .then((r) => r.json())
      .then((d: { ok?: boolean; exams?: ExamSummary[]; message?: string }) => {
        if (d.ok) setExams(d.exams ?? []);
        else setError(d.message ?? "목록을 불러오지 못했어요.");
      })
      .catch(() => setError("목록을 불러오지 못했어요."));
  }, []);

  const gradeExams = useMemo(() => (exams ?? []).filter((e) => e.grade === grade), [exams, grade]);
  const years = useMemo(() => [...new Set(gradeExams.map((e) => e.year))], [gradeExams]);

  // 학년을 바꾸면 가장 최근 시험을 연다
  useEffect(() => {
    if (gradeExams.length && !gradeExams.some((e) => e.key === examKey)) setExamKey(gradeExams[0].key);
  }, [gradeExams, examKey]);

  useEffect(() => {
    if (!examKey || cache[examKey]) return;
    fetch(`/api/mock-passages?exam=${examKey}`)
      .then((r) => r.json())
      .then((d: { ok?: boolean; passages?: PassageRow[]; message?: string }) => {
        if (d.ok) setCache((c) => ({ ...c, [examKey]: d.passages ?? [] }));
        else setError(d.message ?? "지문을 불러오지 못했어요.");
      })
      .catch(() => setError("지문을 불러오지 못했어요."));
  }, [examKey, cache]);

  const rows = examKey ? cache[examKey] : undefined;
  const allOn = !!rows?.length && rows.every((r) => picked.has(r.id));
  const full = max !== undefined && picked.size >= max;

  function toggle(r: PassageRow) {
    setPicked((prev) => {
      const next = new Map(prev);
      if (next.has(r.id)) next.delete(r.id);
      else if (max === undefined || next.size < max) next.set(r.id, r);
      return next;
    });
  }

  function toggleAll() {
    if (!rows) return;
    setPicked((prev) => {
      const next = new Map(prev);
      if (allOn) rows.forEach((r) => next.delete(r.id));
      else for (const r of rows) if (max === undefined || next.size < max) next.set(r.id, r);
      return next;
    });
  }

  const pickedInExam = (key: string) => {
    const list = cache[key];
    return list ? list.filter((r) => picked.has(r.id)).length : 0;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4" role="dialog" aria-modal="true" onClick={onClose}>
      <div className="flex max-h-[88vh] w-full max-w-4xl flex-col rounded-2xl bg-white shadow-xl" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-3 border-b border-slate-100 px-5 py-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">모의고사 지문 불러오기</h2>
            <p className="mt-0.5 text-sm text-slate-500">학력평가·모의평가 영어 지문 원문을 번호로 골라 넣어요. 여러 시험에서 섞어 골라도 됩니다.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="닫기" className="text-slate-400 hover:text-slate-700">
            <Icon name="x" size={18} />
          </button>
        </div>

        {error ? <p className="mx-5 mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</p> : null}

        <div className="grid min-h-0 flex-1 grid-cols-1 sm:grid-cols-[240px_minmax(0,1fr)]">
          {/* 학년 · 시험 */}
          <div className="min-h-0 overflow-y-auto border-b border-slate-100 p-3 sm:border-b-0 sm:border-r">
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
              {[1, 2, 3].map((g) => (
                <button
                  key={g}
                  type="button"
                  onClick={() => setGrade(g)}
                  className={`rounded-md py-1.5 text-sm font-semibold ${grade === g ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  고{g}
                </button>
              ))}
            </div>
            {!exams && !error ? <p className="py-6 text-center text-sm text-slate-500">불러오는 중…</p> : null}
            <div className="mt-3 space-y-3">
              {years.map((y) => (
                <div key={y}>
                  <p className="px-1 text-xs font-bold text-slate-400">{y}년</p>
                  <div className="mt-1 flex flex-wrap gap-1 sm:flex-col sm:flex-nowrap">
                    {gradeExams
                      .filter((e) => e.year === y)
                      .map((e) => {
                        const n = pickedInExam(e.key);
                        return (
                          <button
                            key={e.key}
                            type="button"
                            onClick={() => setExamKey(e.key)}
                            className={`flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-left text-sm ${
                              examKey === e.key ? "bg-brand-50 font-semibold text-brand-800" : "text-slate-700 hover:bg-slate-50"
                            }`}
                          >
                            <span>
                              {e.month}월 <span className="text-xs font-normal text-slate-500">{e.kind}</span>
                            </span>
                            {n ? <span className="rounded-full bg-brand-600 px-1.5 text-[11px] font-bold text-white">{n}</span> : null}
                          </button>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 번호 */}
          <div className="flex min-h-0 min-w-0 flex-col">
            {rows ? (
              <label className="flex items-center gap-2 border-b border-slate-100 px-4 py-2 text-sm font-semibold text-slate-700">
                <input type="checkbox" checked={allOn} onChange={toggleAll} className="h-4 w-4 accent-brand-600" />
                이 시험 전체 ({rows.length}지문)
              </label>
            ) : null}
            <ul className="min-h-[240px] flex-1 overflow-y-auto px-2 py-1">
              {examKey && !rows ? <li className="py-6 text-center text-sm text-slate-500">불러오는 중…</li> : null}
              {(rows ?? []).map((r) => {
                const on = picked.has(r.id);
                return (
                  <li key={r.id}>
                    <label
                      className={`flex cursor-pointer items-start gap-3 rounded-lg px-2 py-2 ${on ? "bg-brand-50/60" : "hover:bg-slate-50"} ${
                        !on && full ? "cursor-not-allowed opacity-50" : ""
                      }`}
                    >
                      <input type="checkbox" checked={on} disabled={!on && full} onChange={() => toggle(r)} className="mt-0.5 h-4 w-4 shrink-0 accent-brand-600" />
                      <b className="w-12 shrink-0 text-sm tabular-nums text-slate-900">{r.itemNo}번</b>
                      <span className="min-w-0 flex-1 truncate font-serif text-[13px] text-slate-600">{r.text}</span>
                      <span className="shrink-0 text-xs tabular-nums text-slate-400">{r.words}단어</span>
                    </label>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-100 px-5 py-3">
          <span className="text-sm text-slate-600">
            {picked.size}개 고름{max !== undefined ? ` · 최대 ${max}개` : ""}
          </span>
          <div className="flex gap-2">
            <button type="button" onClick={onClose} className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-100">
              닫기
            </button>
            <button
              type="button"
              disabled={picked.size === 0}
              onClick={() => onPick([...picked.values()].map(({ id, itemNo, label, shortLabel, text }) => ({ id, itemNo, label, shortLabel, text })))}
              className="rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700 disabled:opacity-40"
            >
              {picked.size ? `${picked.size}개 불러오기` : "불러오기"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
