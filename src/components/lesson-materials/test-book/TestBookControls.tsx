"use client";

/*
 * 테스트 교재 고르기 부품(유형·난이도·직독직해·영작 범위·단어 시험 문항 수·내지 디자인). 테스트 교재를
 * 워크북·최종통합자료로 합치며(2026-10-21) 세 화면이 같이 쓰게 따로 뺐다.
 */
import {
  ALL_TEST_BOOK_TYPES,
  BASIC_TEST_BOOK_TYPES,
  TEST_BOOK_THEMES,
  TEST_BOOK_TYPES,
  VOCAB_EXAM_KINDS,
  VOCAB_EXAM_ALL,
  VOCAB_EXAM_KIND_COUNTS,
  vocabExamRange,
  type LineMode,
  type TestBookOptions,
  type TestBookTheme,
  type TestBookTypeKey,
  type TestLevel,
  type VocabExamOptions,
  type WritingScope,
} from "@/lib/lesson-materials/test-book";
import type { ReactNode } from "react";
import type { VocabExamCaps } from "@/components/lesson-materials/test-book/useVocabExamCaps";

export const TRANSLATION_MODES: Array<{ id: TestBookOptions["translation"]; label: string }> = [
  { id: "show", label: "해석 있음" },
  { id: "hide", label: "해석 지움" },
  { id: "back", label: "뒤쪽에 모음" },
];

/**
 * 단어 시험지: 유형마다 문항 수(0이면 빼기). caps를 주면 고른 지문의 단어 수와 유형마다 낼 수 있는 최대 문항 수를 같이 보인다
 * (선생님 2026-10-27 — 만들기 전에 단어 개수를 알 수 있게). 단어가 모자란 유형은 있는 만큼만 나온다.
 */
export function VocabExamControls({
  value,
  onChange,
  caps,
}: {
  value: VocabExamOptions;
  onChange: (v: VocabExamOptions) => void;
  caps?: VocabExamCaps | null;
}) {
  const total = VOCAB_EXAM_KINDS.reduce((n, k) => n + (value.counts[k.key] ?? 0), 0);
  const real = caps ? VOCAB_EXAM_KINDS.reduce((n, k) => n + Math.min(value.counts[k.key] ?? 0, caps.perKind[k.key]), 0) : total;
  return (
    <div className="space-y-1 rounded-lg border border-slate-200 bg-slate-50 p-2">
      {caps ? (
        <p className="text-[11px] font-bold text-violet-700">
          고른 지문 단어 {caps.words}개{caps.missing ? ` · 단어 정리가 없는 지문 ${caps.missing}개는 만들 때 더해짐` : ""}
        </p>
      ) : null}
      <p className="text-[11px] font-bold text-slate-500">
        유형별 문항 수 · 모두{" "}
        {caps && real < total
          ? total >= VOCAB_EXAM_ALL
            ? `${real}문항`
            : `${real}문항(고른 ${total}문항 중 단어가 있는 만큼)`
          : total >= VOCAB_EXAM_ALL
            ? "단어가 있는 만큼"
            : `${total}문항`}
      </p>
      {VOCAB_EXAM_KINDS.map((k) => (
        <label key={k.key} className="flex items-center justify-between gap-2 text-[12px] text-slate-700" title={k.hint}>
          <span className={value.counts[k.key] ? "" : "text-slate-400"}>
            {k.label}
            {caps ? (
              <span className={`ml-1 text-[10.5px] ${(value.counts[k.key] ?? 0) > caps.perKind[k.key] && (value.counts[k.key] ?? 0) < VOCAB_EXAM_ALL ? "font-bold text-amber-600" : "text-slate-400"}`}>
                최대 {caps.perKind[k.key]}
              </span>
            ) : null}
          </span>
          <select
            value={value.counts[k.key] ?? 0}
            onChange={(e) => onChange({ counts: { ...value.counts, [k.key]: Number(e.target.value) } })}
            className="rounded-md border border-slate-200 bg-white px-1 py-0.5 text-[12px]"
          >
            {VOCAB_EXAM_KIND_COUNTS.map((n) => (
              <option key={n} value={n}>
                {n >= VOCAB_EXAM_ALL ? "전체" : n ? `${n}문항` : "빼기"}
              </option>
            ))}
          </select>
        </label>
      ))}
    </div>
  );
}

/**
 * 단어 시험지 출제 범위·번호순(윌링어학원 Jayden 선생님 2026-10-29): 전체 단어장 번호로 「1~50번」을 골라
 * 그 단어만 번호 순서대로 또는 무작위로 낸다. 0은 비움(전체).
 */
export function VocabExamRangeControls({
  wordCount,
  from,
  to,
  inOrder,
  onRange,
  onInOrder,
}: {
  wordCount: number;
  from: number;
  to: number;
  inOrder: boolean;
  onRange: (from: number, to: number) => void;
  onInOrder: (on: boolean) => void;
}) {
  if (!wordCount) return null;
  const range = vocabExamRange(from, to, wordCount);
  const readNo = (raw: string) => {
    const n = Number.parseInt(raw, 10);
    return Number.isFinite(n) && n > 0 ? Math.min(n, wordCount) : 0;
  };
  return (
    <div className="space-y-1.5 rounded-lg border border-slate-200 p-2">
      <p className="text-[11px] font-bold text-slate-500">출제 범위 (전체 단어장 번호)</p>
      <div className="flex items-center gap-1 text-[12px] text-slate-700">
        <input
          type="number"
          min={1}
          max={wordCount}
          value={from || ""}
          placeholder="1"
          onChange={(e) => onRange(readNo(e.target.value), to)}
          className="w-14 rounded-md border border-slate-200 px-1.5 py-1 text-center tabular-nums"
        />
        <span>번 ~</span>
        <input
          type="number"
          min={1}
          max={wordCount}
          value={to || ""}
          placeholder={String(wordCount)}
          onChange={(e) => onRange(from, readNo(e.target.value))}
          className="w-14 rounded-md border border-slate-200 px-1.5 py-1 text-center tabular-nums"
        />
        <span>번</span>
        {range ? (
          <button
            type="button"
            onClick={() => onRange(0, 0)}
            className="ml-auto rounded-md border border-slate-200 px-1.5 py-0.5 text-[11px] font-bold text-slate-500 hover:bg-slate-50"
          >
            전체
          </button>
        ) : null}
      </div>
      <p className="text-[11px] text-slate-400">
        {range ? `${range.from}~${range.to}번 단어 ${range.to - range.from + 1}개에서 냅니다` : `비워 두면 전체 ${wordCount}단어`}
      </p>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {[
          { on: true, label: "번호순" },
          { on: false, label: "무작위" },
        ].map((o) => (
          <button
            key={o.label}
            type="button"
            onClick={() => onInOrder(o.on)}
            className={`rounded-md py-1 text-[11px] font-bold ${inOrder === o.on ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 내지 디자인 고르기 */
export function ThemePicker({ value, onChange }: { value: TestBookTheme; onChange: (v: TestBookTheme) => void }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold text-slate-500">내지 디자인</p>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {TEST_BOOK_THEMES.map((t) => (
          <button
            key={t.key}
            type="button"
            title={t.hint}
            onClick={() => onChange(t.key)}
            className={`rounded-md px-1 py-1 text-[11px] font-bold ${value === t.key ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            {t.label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 난이도: 기본 · UP — 다시 만들지 않고 문항 내는 방식만 바꾼다(값 없음) */
export function LevelSwitch({ value, onChange }: { value: TestLevel; onChange: (v: TestLevel) => void }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold text-slate-500">난이도</p>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {(
          [
            ["basic", "기본"],
            ["up", "난이도 UP"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`rounded-md px-1 py-1 text-[11px] font-bold ${value === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </div>
      {value === "up" ? (
        <p className="text-[10.5px] leading-snug text-slate-500">
          빈칸 문장마다 둘 · 어순배열 덩어리 잘게(앞말 없음) · 영작 단어 수 숨김 · 바꿔 말하기 힌트 숨김 · T/F는 F를 고쳐 쓰기
        </p>
      ) : null}
    </div>
  );
}

/** 한줄해석: 전체 해석 · 직독직해 */
export function LineModeSwitch({ value, onChange }: { value: LineMode; onChange: (v: LineMode) => void }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold text-slate-500">해석 적기</p>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {(
          [
            ["full", "전체 해석"],
            ["chunk", "직독직해"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`rounded-md px-1 py-1 text-[11px] font-bold ${value === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 통문장 영작 범위 고르기 */
export function WritingScopeSwitch({ value, onChange }: { value: WritingScope; onChange: (v: WritingScope) => void }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold text-slate-500">통문장 영작</p>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {(
          [
            ["all", "모든 문장"],
            ["key", "중요문장만"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`rounded-md px-1 py-1 text-[11px] font-bold ${value === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TypeChecks({
  value,
  onChange,
  accessory,
}: {
  value: TestBookTypeKey[];
  onChange: (next: TestBookTypeKey[]) => void;
  /** 선택된 유형 오른쪽에 문항 수 같은 추가 설정을 붙인다. */
  accessory?: (type: TestBookTypeKey, selected: boolean) => ReactNode;
}) {
  const on = new Set(value);
  const toggle = (k: TestBookTypeKey) =>
    onChange(ALL_TEST_BOOK_TYPES.filter((x) => (x === k ? !on.has(x) : on.has(x))));
  return (
    <div className="space-y-2">
      {/* 워크북과 같은 차례로 한 목록(기본 유형은 「기본 8종」 단추로 고른다) */}
      <div className="space-y-0.5">
        {TEST_BOOK_TYPES.map((t) => {
          const selected = on.has(t.key);
          return (
            <div key={t.key} className="flex min-h-[28px] items-center gap-2 text-[13px] text-slate-800" title={t.hint}>
              <label className="flex min-w-0 flex-1 cursor-pointer items-center gap-2">
                <input type="checkbox" className="h-4 w-4 accent-violet-600" checked={selected} onChange={() => toggle(t.key)} />
                <span className="flex-1">{t.label}</span>
              </label>
              {accessory?.(t.key, selected)}
            </div>
          );
        })}
      </div>
      <div className="flex gap-1.5">
        <button type="button" onClick={() => onChange(BASIC_TEST_BOOK_TYPES)} className="h-7 flex-1 rounded-md border border-violet-300 bg-white text-[11px] font-semibold text-violet-800">
          기본 8종
        </button>
        <button type="button" onClick={() => onChange(ALL_TEST_BOOK_TYPES)} className="h-7 flex-1 rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-600">
          전부
        </button>
      </div>
    </div>
  );
}

