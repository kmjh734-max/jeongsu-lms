"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { BookCoverSpec } from "@/lib/lesson-materials/book-cover";
import { ExamPicker } from "@/components/lesson-materials/book-cover/ExamPicker";

/**
 * 표지에 들어갈 말 — 통합자료 · 테스트 교재가 같이 쓴다(선생님 2026-10-22: 자질구레하지 않고 명시적으로).
 * 꼭 필요한 넷만 앞에: 누구(학교 · 학년) / 어떤 시험(단추) / 어떤 교재(교과서 · 출판사 · 범위) / 자료 이름.
 * 나머지(특장점 · 시리즈 · 큰 영문 · 학원명)는 「더 넣기」를 열어야 보인다.
 * 값은 자료 이름 · 지문 출처에서 읽어 미리 채워 두고, 고친 칸만 onPatch로 올린다.
 */
export function CoverForm({ spec, onPatch }: { spec: BookCoverSpec; onPatch: (patch: Partial<BookCoverSpec>) => void }) {
  const [more, setMore] = useState(false);
  const set = (key: keyof BookCoverSpec) => (v: string) => onPatch({ [key]: v });
  return (
    <div className="space-y-3">
      <Group title="누구">
        <div className="grid grid-cols-[1fr_72px] gap-2">
          <Field label="학교" value={spec.school} placeholder="호원고" onCommit={set("school")} />
          <Field label="학년" value={spec.grade} placeholder="1" onCommit={set("grade")} />
        </div>
      </Group>
      <Group title="시험">
        <ExamPicker exam={spec.exam} semester={spec.semester} onPick={onPatch} />
        <div className="grid grid-cols-[1fr_72px] gap-2">
          <Field label="시험 이름 (직접 쓰기)" value={spec.exam} placeholder="3월 모의고사" onCommit={set("exam")} />
          <Field label="연도" value={spec.year} placeholder="2026" onCommit={set("year")} />
        </div>
      </Group>
      <Group title="교재">
        <div className="grid grid-cols-2 gap-2">
          <Field label="교과서" value={spec.textbook} placeholder="영어독해와작문" onCommit={set("textbook")} />
          <Field label="출판사 · 저자" value={spec.publisher} placeholder="천재(윤)" onCommit={set("publisher")} />
        </div>
        <Field label="시험 범위" value={spec.range} placeholder="2과~4과 · 외부지문" onCommit={set("range")} />
        <Field label="자료 이름" value={spec.material} placeholder="통합 테스트북 · 변형문제" onCommit={set("material")} />
      </Group>
      <button
        type="button"
        onClick={() => setMore((v) => !v)}
        className="flex w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-[12px] font-bold text-slate-600 hover:border-slate-300"
        aria-expanded={more}
      >
        더 넣기 <span className="font-normal text-slate-400">특장점 · 시리즈 · 큰 영문 · 학원명 {more ? "▲" : "▼"}</span>
      </button>
      {more ? (
        <div className="space-y-2">
          <Field label="특장점 (줄마다 한 항목)" value={spec.points} rows={3} onCommit={set("points")} />
          <Field label="시리즈 (왼쪽 위 띠)" value={spec.series} placeholder="EngCore 내신" onCommit={set("series")} />
          <Field label="큰 영문 (비우면 시험에서: 기말 → Final)" value={spec.wordmark} placeholder="Final" onCommit={set("wordmark")} />
          <Field label="학원명 (로고가 없을 때 표지에 글자로)" value={spec.brand} onCommit={set("brand")} />
        </div>
      ) : null}
    </div>
  );
}

function Group({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-2 rounded-xl border border-slate-200 bg-white p-3">
      <p className="text-[12px] font-black text-slate-800">{title}</p>
      {children}
    </section>
  );
}

/** 칸 하나. 타자를 멈추면(0.5초) 올리고, 칸을 떠날 때도 올린다. 밖에서 값이 바뀌면 따라간다(타자 중엔 그대로). */
function Field({
  label,
  value,
  placeholder,
  rows,
  onCommit,
}: {
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  onCommit: (v: string) => void;
}) {
  const [text, setText] = useState(value);
  const typing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    if (!typing.current) setText(value);
  }, [value]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  const commit = (v: string) => {
    if (timer.current) clearTimeout(timer.current);
    typing.current = false;
    if (v !== value) onCommit(v);
  };
  const change = (v: string) => {
    typing.current = true;
    setText(v);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => commit(v), 500);
  };
  const cls =
    "w-full rounded-md border border-slate-200 bg-white px-2.5 py-1.5 text-[13px] text-slate-900 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100";
  return (
    <label className="block min-w-0 space-y-1">
      <span className="text-[11px] font-semibold text-slate-500">{label}</span>
      {rows ? (
        <textarea className={cls} rows={rows} value={text} placeholder={placeholder} onChange={(e) => change(e.target.value)} onBlur={() => commit(text)} />
      ) : (
        <input className={cls} value={text} placeholder={placeholder} onChange={(e) => change(e.target.value)} onBlur={() => commit(text)} />
      )}
    </label>
  );
}
