"use client";

import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { createPlanAction, savePlanAction } from "@/app/admin/study-plans/actions";
import { WEEKS, emptyEntry, type PlanEntry, type StudyPlan } from "@/lib/study-plan";
import { UnitPickerModal } from "@/components/textbooks/UnitPickerModal";
import type { Textbook } from "@/lib/textbooks";

export type PlanStudent = {
  id: string;
  name: string;
  school: string | null;
  schoolGrade: string | null;
  phone: string | null;
  parentPhone: string | null;
  enrolledOn: string | null;
  className: string | null;
  classTime: string | null;
};

type Row = { week: number; area: string; textbook: string; orderIndex: number; entries: PlanEntry[] };

/** 학습일정표 편집 — 주차 × 영역 × 수업 회차 */
export function StudyPlanEditor({
  student,
  year,
  month,
  plan,
  books,
}: {
  student: PlanStudent;
  year: number;
  month: number;
  plan: StudyPlan | null;
  /** 올려 둔 교재 목차 — 진도 칸을 트리로 고른다 */
  books: Textbook[];
}) {
  const [sessions, setSessions] = useState(plan?.sessionsPerWeek ?? 3);
  const [rows, setRows] = useState<Row[]>(plan?.rows ?? []);
  const [dates, setDates] = useState<Record<string, string[]>>(plan?.sessionDates ?? {});
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  /** 목차에서 고르기: 어느 칸에 넣을지 */
  const [picking, setPicking] = useState<{ week: number; area: string; index: number } | null>(null);

  const areas = [...new Map(rows.filter((r) => r.week === WEEKS[0]).map((r) => [r.area, r.orderIndex])).keys()];

  function patch(week: number, area: string, apply: (r: Row) => Row) {
    setRows((prev) => prev.map((r) => (r.week === week && r.area === area ? apply(r) : r)));
  }

  function renameArea(oldName: string, next: string) {
    setRows((prev) => prev.map((r) => (r.area === oldName ? { ...r, area: next } : r)));
  }

  function setTextbook(area: string, textbook: string) {
    setRows((prev) => prev.map((r) => (r.area === area ? { ...r, textbook } : r)));
  }

  function addArea() {
    const name = `새 영역 ${areas.length + 1}`;
    setRows((prev) => [
      ...prev,
      ...WEEKS.map((week) => ({ week, area: name, textbook: "", orderIndex: areas.length, entries: Array.from({ length: sessions }, emptyEntry) })),
    ]);
  }

  function removeArea(area: string) {
    setRows((prev) => prev.filter((r) => r.area !== area));
  }

  function changeSessions(n: number) {
    setSessions(n);
    setRows((prev) =>
      prev.map((r) => ({
        ...r,
        entries: Array.from({ length: n }, (_, i) => r.entries[i] ?? emptyEntry()),
      }))
    );
  }

  async function create() {
    setBusy(true);
    const r = await createPlanAction({ studentId: student.id, year, month, sessionsPerWeek: sessions });
    setMsg({ ok: r.ok, text: r.message });
    setBusy(false);
  }

  async function save() {
    if (!plan) return;
    setBusy(true);
    const r = await savePlanAction({ planId: plan.id, sessionsPerWeek: sessions, rows, sessionDates: dates });
    setMsg({ ok: r.ok, text: r.message });
    setBusy(false);
  }

  if (!plan) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white p-8 text-center shadow-sm">
        <p className="text-base font-bold text-slate-900">
          {year}년 {month}월 일정표가 아직 없어요.
        </p>
        <p className="mt-1 text-sm text-slate-500">지난달 일정표가 있으면 영역과 교재명을 그대로 가져와요.</p>
        <div className="mt-4 flex items-center justify-center gap-2">
          <label className="text-sm text-slate-600">
            주당 수업
            <select value={sessions} onChange={(e) => setSessions(Number(e.target.value))} className="ui-input ml-2 inline-block h-9 w-24">
              {[2, 3, 4, 5].map((n) => (
                <option key={n} value={n}>
                  {n}회
                </option>
              ))}
            </select>
          </label>
          <Button onClick={create} disabled={busy}>
            {busy ? "만드는 중…" : "일정표 만들기"}
          </Button>
        </div>
        {msg ? <div className="mt-3"><Alert variant={msg.ok ? "success" : "error"}>{msg.text}</Alert></div> : null}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {/* 머리: 학생 정보 */}
      <div className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-x-6 gap-y-1 text-sm">
          <b className="text-base text-slate-900">{student.name}</b>
          <span className="text-slate-600">{[student.school, student.schoolGrade].filter(Boolean).join(" ") || "학교 미입력"}</span>
          <span className="text-slate-600">{student.className ?? "반 없음"}{student.classTime ? ` · ${student.classTime}` : ""}</span>
          <span className="text-slate-500">본인 {student.phone ?? "-"} · 학부모 {student.parentPhone ?? "-"}</span>
          {student.enrolledOn ? <span className="text-slate-500">입학 {student.enrolledOn}</span> : null}
        </div>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <label className="text-sm text-slate-600">
          주당 수업
          <select value={sessions} onChange={(e) => changeSessions(Number(e.target.value))} className="ui-input ml-2 inline-block h-9 w-24">
            {[2, 3, 4, 5].map((n) => (
              <option key={n} value={n}>
                {n}회
              </option>
            ))}
          </select>
        </label>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={addArea}>+ 영역 추가</Button>
          <Button onClick={save} disabled={busy}>{busy ? "저장 중…" : "저장"}</Button>
        </div>
      </div>

      {msg ? <Alert variant={msg.ok ? "success" : "error"}>{msg.text}</Alert> : null}

      {picking ? (
        <UnitPickerModal
          books={books}
          onPick={(text) => {
            patch(picking.week, picking.area, (r) => ({
              ...r,
              entries: r.entries.map((x, k) => (k === picking.index ? { ...x, progress: text } : x)),
            }));
            setPicking(null);
          }}
          onClose={() => setPicking(null)}
        />
      ) : null}

      {WEEKS.map((week) => (
        <section key={week} className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-sm">
          <table className="w-full min-w-[900px] border-collapse text-sm">
            <thead>
              <tr className="bg-slate-50 text-left text-xs font-bold text-slate-600">
                <th className="w-20 px-2 py-2">{week}주</th>
                <th className="w-28 px-2 py-2">영역</th>
                <th className="w-40 px-2 py-2">교재명</th>
                {Array.from({ length: sessions }, (_, i) => (
                  <th key={i} className="px-2 py-2">
                    <span className="block">
                      {i + 1}회차 <span className="font-normal text-slate-400">진도 / 숙제 / 특이사항</span>
                    </span>
                    <input
                      type="date"
                      value={dates[String(week)]?.[i] ?? ""}
                      onChange={(e) =>
                        setDates((prev) => {
                          const list = [...(prev[String(week)] ?? [])];
                          list[i] = e.target.value;
                          return { ...prev, [String(week)]: list };
                        })
                      }
                      className="ui-input mt-1 h-7 w-[9.5rem] text-xs font-normal"
                    />
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {areas.map((area) => {
                const row = rows.find((r) => r.week === week && r.area === area);
                if (!row) return null;
                return (
                  <tr key={area} className="border-t border-slate-100 align-top">
                    <td className="px-2 py-2 text-xs text-slate-400">{week === WEEKS[0] ? "" : ""}</td>
                    <td className="p-1">
                      {week === WEEKS[0] ? (
                        <div className="flex items-center gap-1">
                          <input
                            value={row.area}
                            onChange={(e) => renameArea(area, e.target.value)}
                            className="ui-input h-8 text-sm"
                          />
                          <button type="button" onClick={() => removeArea(area)} className="px-1 text-slate-300 hover:text-red-600" title="영역 빼기">
                            ✕
                          </button>
                        </div>
                      ) : (
                        <span className="px-1 text-slate-700">{row.area}</span>
                      )}
                    </td>
                    <td className="p-1">
                      {week === WEEKS[0] ? (
                        <input value={row.textbook} onChange={(e) => setTextbook(area, e.target.value)} className="ui-input h-8 text-sm" placeholder="교재명" />
                      ) : (
                        <span className="px-1 text-slate-500">{row.textbook}</span>
                      )}
                    </td>
                    {row.entries.map((entry, i) => (
                      <td key={i} className="p-1">
                        <div className="space-y-1">
                          <div className="flex items-center gap-1">
                            <input
                              value={entry.progress}
                              onChange={(e) =>
                                patch(week, area, (r) => ({
                                  ...r,
                                  entries: r.entries.map((x, k) => (k === i ? { ...x, progress: e.target.value } : x)),
                                }))
                              }
                              className="ui-input h-8 flex-1 text-sm"
                              placeholder="학습진도"
                            />
                            <button
                              type="button"
                              onClick={() => setPicking({ week, area, index: i })}
                              title="교재 목차에서 고르기"
                              className="h-8 shrink-0 rounded-md border border-slate-200 px-2 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                            >
                              목차
                            </button>
                          </div>
                          <input
                            value={entry.homework}
                            onChange={(e) =>
                              patch(week, area, (r) => ({
                                ...r,
                                entries: r.entries.map((x, k) => (k === i ? { ...x, homework: e.target.value } : x)),
                              }))
                            }
                            className="ui-input h-8 text-sm"
                            placeholder="숙제"
                          />
                          <input
                            value={entry.note}
                            onChange={(e) =>
                              patch(week, area, (r) => ({
                                ...r,
                                entries: r.entries.map((x, k) => (k === i ? { ...x, note: e.target.value } : x)),
                              }))
                            }
                            className="ui-input h-8 text-sm"
                            placeholder="특이사항"
                          />
                        </div>
                      </td>
                    ))}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </section>
      ))}
    </div>
  );
}
