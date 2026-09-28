"use client";

import { useMemo, useState } from "react";

/**
 * 누구에게 배정할지 고르는 목록. 반과 학생을 같은 방식으로 고른다.
 *
 * 선생님 요청(2026-09-28): 단어학습·듣기학습에서도 학생에게 배정하게, 반 화면에서도
 * 배정할 수 있게, 기능이 어디서나 똑같이 나오게.
 * 그래서 이 부품 하나를 배정 창·반 상세·학생 화면이 함께 쓴다.
 */

export type TargetClass = { id: string; name: string; studentCount?: number };
export type TargetStudent = { id: string; name: string; classLabel?: string };

export function TargetPicker({
  classes,
  students,
  pickedClasses,
  pickedStudents,
  onChangeClasses,
  onChangeStudents,
  /** 처음 열 때 보여 줄 갈래 */
  initialTab = "class",
}: {
  classes: TargetClass[];
  students: TargetStudent[];
  pickedClasses: string[];
  pickedStudents: string[];
  onChangeClasses: (ids: string[]) => void;
  onChangeStudents: (ids: string[]) => void;
  initialTab?: "class" | "student";
}) {
  const [tab, setTab] = useState<"class" | "student">(initialTab);
  const [query, setQuery] = useState("");

  const pickedC = useMemo(() => new Set(pickedClasses), [pickedClasses]);
  const pickedS = useMemo(() => new Set(pickedStudents), [pickedStudents]);

  const q = query.trim().toLowerCase();
  const visibleClasses = classes.filter((c) => !q || c.name.toLowerCase().includes(q));
  const visibleStudents = students.filter(
    (s) => !q || `${s.name} ${s.classLabel ?? ""}`.toLowerCase().includes(q)
  );

  const rows = tab === "class" ? visibleClasses : visibleStudents;
  const picked = tab === "class" ? pickedC : pickedS;
  const apply = tab === "class" ? onChangeClasses : onChangeStudents;
  const visibleIds = rows.map((r) => r.id);
  const onCount = visibleIds.filter((id) => picked.has(id)).length;

  function setMany(ids: string[], on: boolean) {
    const next = new Set(picked);
    for (const id of ids) {
      if (on) next.add(id);
      else next.delete(id);
    }
    apply([...next]);
  }

  const tabBtn = (key: "class" | "student", label: string, count: number) => (
    <button
      key={key}
      type="button"
      onClick={() => setTab(key)}
      className={`h-9 rounded-lg px-4 text-[13px] font-bold transition ${
        tab === key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-800"
      }`}
    >
      {label}
      {count > 0 ? <span className="ml-1 text-brand-600">{count}</span> : null}
    </button>
  );

  return (
    <div className="flex min-h-0 flex-col gap-2.5">
      <div className="inline-flex self-start rounded-xl bg-slate-100 p-1">
        {tabBtn("class", "반", pickedC.size)}
        {tabBtn("student", "학생", pickedS.size)}
      </div>

      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={tab === "class" ? "반 이름으로 찾기" : "학생 이름으로 찾기"}
        aria-label={tab === "class" ? "반 찾기" : "학생 찾기"}
        className="ui-input h-10 px-3 text-sm"
      />

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setMany(visibleIds, true)}
          disabled={visibleIds.length === 0}
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          {tab === "class" ? "보이는 반 모두" : "보이는 학생 모두"}
        </button>
        <button
          type="button"
          onClick={() => setMany(visibleIds, false)}
          disabled={onCount === 0}
          className="h-9 rounded-lg border border-slate-300 bg-white px-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
        >
          모두 풀기
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto rounded-xl border border-slate-200">
        {rows.length === 0 ? (
          <p className="px-4 py-10 text-center text-sm text-slate-500">
            {q ? "찾는 것이 없어요." : tab === "class" ? "반이 없어요." : "학생이 없어요."}
          </p>
        ) : (
          <ul>
            {rows.map((r) => {
              const on = picked.has(r.id);
              const sub =
                tab === "class"
                  ? (r as TargetClass).studentCount != null
                    ? `학생 ${(r as TargetClass).studentCount}명`
                    : ""
                  : ((r as TargetStudent).classLabel ?? "");
              return (
                <li key={r.id} className="border-b border-slate-100 last:border-b-0">
                  <label
                    className={`flex cursor-pointer items-center gap-2.5 px-3 py-2.5 hover:bg-slate-50 ${
                      on ? "bg-brand-50" : ""
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-brand-600"
                      checked={on}
                      onChange={() => setMany([r.id], !on)}
                    />
                    <span className="min-w-0 flex-1 truncate text-[13px] font-semibold text-slate-900">
                      {r.name}
                    </span>
                    {sub ? <span className="text-[11.5px] text-slate-500">{sub}</span> : null}
                  </label>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}
