"use client";

import { useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/layout/NavIcon";
import type { StudentVocabSetSummary } from "@/types/database";

interface StudentVocabSetListProps {
  summaries: StudentVocabSetSummary[];
}

type SetStatus = "studying" | "passed" | "new";
type Filter = "all" | SetStatus;
type DotState = "done" | "cur" | "open" | "lock";

const STAGE_NAMES = ["뜻 익히기", "스펠링", "예문 빈칸", "종합테스트"];

const FILTERS: { key: Filter; label: string }[] = [
  { key: "all", label: "전체" },
  { key: "studying", label: "학습 중" },
  { key: "passed", label: "합격" },
  { key: "new", label: "시작 전" },
];

function statusOf(s: StudentVocabSetSummary): SetStatus {
  if (s.stage4Passed) return "passed";
  if (
    !s.stage1Completed &&
    !s.stage2Completed &&
    !s.stage3Completed &&
    s.stage4LastScore === 0 &&
    s.stage4BestScore === 0
  ) {
    return "new";
  }
  return "studying";
}

function stageDots(s: StudentVocabSetSummary): DotState[] {
  const done = [
    s.stage1Completed,
    s.stage2Completed,
    s.stage3Completed,
    s.stage4Passed,
  ];
  const firstOpen = done.findIndex((d) => !d);
  const isNew = statusOf(s) === "new";
  return done.map((d, i) => {
    if (d) return "done";
    if (i === firstOpen) return isNew ? "open" : "cur";
    return "lock";
  });
}

function metaText(s: StudentVocabSetSummary): string {
  const status = statusOf(s);
  if (status === "passed") return "종합테스트 합격";
  if (status === "new") return "새로 배정됨";
  const done = [s.stage1Completed, s.stage2Completed, s.stage3Completed];
  const idx = done.findIndex((d) => !d);
  const stage = idx === -1 ? 3 : idx;
  const text = `${stage + 1}단계 ${STAGE_NAMES[stage]}`;
  if (stage === 3 && s.stage4LastScore > 0) {
    return `${text} · 최근 ${s.stage4LastScore}점`;
  }
  return text;
}

function StepDots({ states }: { states: DotState[] }) {
  return (
    <div className="flex items-center" aria-hidden>
      {states.map((st, i) => (
        <div key={i} className="flex items-center">
          <span
            className={`flex h-5 w-5 items-center justify-center rounded-full text-[11px] font-bold tabular-nums ${
              st === "done"
                ? "bg-green-700 text-white"
                : st === "cur"
                  ? "bg-brand-600 text-white"
                  : st === "open"
                    ? "border-[1.5px] border-brand-600 bg-white text-brand-600"
                    : "bg-slate-100 text-slate-400"
            }`}
          >
            {st === "done" ? (
              <Icon name="check" size={12} strokeWidth={2.8} />
            ) : (
              i + 1
            )}
          </span>
          {i < states.length - 1 && (
            <span
              className={`h-0.5 w-3.5 ${
                st === "done" ? "bg-green-700" : "bg-slate-200"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function TestCell({ s }: { s: StudentVocabSetSummary }) {
  if (s.stage4Passed) {
    return (
      <span className="inline-flex h-[22px] items-center gap-1 whitespace-nowrap rounded bg-green-50 px-2 text-xs font-semibold tabular-nums text-green-700">
        <Icon name="trophy" size={12} strokeWidth={2} />
        최고 {s.stage4BestScore}점 합격
      </span>
    );
  }
  const score = Math.max(s.stage4BestScore, s.stage4LastScore);
  if (score > 0) {
    return (
      <span className="inline-flex h-[22px] items-center whitespace-nowrap rounded bg-slate-100 px-2 text-xs font-semibold tabular-nums text-slate-600">
        {score}점
      </span>
    );
  }
  return <span className="text-xs text-slate-400">테스트 전</span>;
}

function ActionCell({ s }: { s: StudentVocabSetSummary }) {
  if (s.itemCount < 1) {
    return (
      <span className="inline-flex h-11 w-full items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-3 text-[13px] font-semibold text-slate-400 md:h-8 md:w-auto">
        단어 없음
      </span>
    );
  }
  const status = statusOf(s);
  const label =
    status === "passed" ? "복습" : status === "new" ? "시작하기" : "이어서 학습";
  const primary = status !== "passed";
  return (
    <Link
      href={`/student/vocab/${s.set.id}`}
      className={`inline-flex h-11 w-full items-center justify-center whitespace-nowrap rounded-md border px-3.5 text-sm font-semibold transition md:h-8 md:w-auto md:text-[13px] ${
        primary
          ? "border-brand-600 bg-brand-600 text-white hover:border-brand-700 hover:bg-brand-700"
          : "border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
      }`}
    >
      {label}
    </Link>
  );
}

const ROW_GRID =
  "md:grid md:grid-cols-[minmax(0,1fr)_150px_120px_110px] md:items-center md:gap-5 lg:grid-cols-[minmax(0,1fr)_190px_130px_120px]";

export function StudentVocabSetList({ summaries }: StudentVocabSetListProps) {
  const [filter, setFilter] = useState<Filter>("all");

  if (summaries.length === 0) {
    return (
      <div className="flex flex-col items-center gap-2 rounded-lg border border-slate-200 bg-white px-6 py-14 text-center shadow-card">
        <span className="mb-1 flex h-11 w-11 items-center justify-center rounded-full bg-brand-50 text-brand-700">
          <Icon name="book" size={22} />
        </span>
        <p className="font-semibold text-slate-900">아직 배정된 단어장이 없어요</p>
        <p className="text-sm text-slate-500">
          선생님이 단어장을 배정하면 여기에 나와요.
        </p>
      </div>
    );
  }

  const counts: Record<Filter, number> = {
    all: summaries.length,
    studying: 0,
    passed: 0,
    new: 0,
  };
  for (const s of summaries) counts[statusOf(s)] += 1;
  const shown =
    filter === "all" ? summaries : summaries.filter((s) => statusOf(s) === filter);

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2" role="tablist">
          {FILTERS.map(({ key, label }) => {
            const on = filter === key;
            return (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={on}
                onClick={() => setFilter(key)}
                className={`flex h-10 items-center gap-1.5 rounded-md border px-3 text-[13px] font-semibold transition sm:h-8 ${
                  on
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 bg-white text-slate-700 hover:border-slate-300"
                }`}
              >
                {label}
                <span className="text-xs tabular-nums text-slate-400">
                  {counts[key]}
                </span>
              </button>
            );
          })}
        </div>
        <div className="flex items-center gap-3.5 text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-green-700" />
            끝낸 단계
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-brand-600" />
            지금 단계
          </span>
          <span className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300" />
            잠김
          </span>
        </div>
      </div>

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
        <div
          className={`hidden border-b border-slate-200 bg-slate-50 px-5 py-2.5 text-xs font-semibold text-slate-500 md:grid ${ROW_GRID}`}
        >
          <span>단어장</span>
          <span>1 · 2 · 3 · 4단계</span>
          <span>종합테스트</span>
          <span />
        </div>

        {shown.length === 0 ? (
          <p className="px-6 py-12 text-center text-sm text-slate-500">
            이 조건에 맞는 단어장이 없어요.
          </p>
        ) : (
          <ul>
            {shown.map((s) => (
              <li
                key={s.set.id}
                className={`flex flex-col gap-3 border-t border-slate-100 px-4 py-4 first:border-t-0 md:px-5 md:py-3.5 ${ROW_GRID}`}
              >
                <div className="flex min-w-0 flex-col gap-0.5">
                  {s.itemCount > 0 ? (
                    <Link
                      href={`/student/vocab/${s.set.id}`}
                      className="truncate text-[15px] font-semibold text-slate-900 hover:text-brand-700"
                    >
                      {s.set.title}
                    </Link>
                  ) : (
                    <span className="truncate text-[15px] font-semibold text-slate-500">
                      {s.set.title}
                    </span>
                  )}
                  <span className="text-xs tabular-nums text-slate-500">
                    {s.itemCount > 0
                      ? `${s.itemCount}단어 · ${metaText(s)}`
                      : "등록된 단어가 아직 없어요"}
                  </span>
                </div>
                <div className="flex items-center justify-between gap-3 md:contents">
                  <StepDots states={stageDots(s)} />
                  <div>
                    <TestCell s={s} />
                  </div>
                </div>
                <div className="md:flex md:justify-end">
                  <ActionCell s={s} />
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
