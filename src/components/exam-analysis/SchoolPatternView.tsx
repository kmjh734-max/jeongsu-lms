"use client";

import { useState } from "react";
import Link from "next/link";
import type { SchoolPattern } from "@/lib/exam-analysis/school-pattern";

/**
 * 학교별 출제 버릇.
 *
 * 선생님 지시(2026-10-01): 시험 하나씩만 보면 다음 시험에 무엇을 만들지 알 수 없다.
 * 같은 학교 것을 모아 「어디서 · 어떤 유형으로 내는가」를 보여 준다.
 * 이미 분석해 둔 것을 모으기만 하므로 값이 들지 않는다.
 */
export function SchoolPatternView({
  patterns,
  basePath,
}: {
  patterns: SchoolPattern[];
  basePath: string;
}) {
  const [open, setOpen] = useState<string | null>(patterns[0]?.key ?? null);

  if (patterns.length === 0) {
    return (
      <div className="rounded-xl border border-slate-200 bg-white p-6 text-center text-sm text-slate-500">
        분석해 둔 시험지가 아직 없습니다.{" "}
        <Link href={basePath} className="font-semibold text-brand-700 underline">
          시험지 분석하러 가기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {patterns.map((p) => {
        const isOpen = open === p.key;
        const topSources = p.sources.filter((s) => s.kind !== "수업자료").slice(0, 6);
        return (
          <div key={p.key} className="rounded-xl border border-slate-200 bg-white">
            <button
              type="button"
              onClick={() => setOpen(isOpen ? null : p.key)}
              className="flex w-full flex-wrap items-center justify-between gap-2 px-4 py-3 text-left"
            >
              <span className="flex flex-wrap items-baseline gap-2">
                <span className="text-sm font-bold text-slate-900">
                  {p.school} {p.grade ? `${p.grade}학년` : ""}
                </span>
                <span className="text-xs text-slate-500">
                  시험 {p.exams.length}회 · 문항 {p.totalItems}개 · 서술형 {p.subjectiveRatio}%
                </span>
              </span>
              <span className="text-xs font-semibold text-brand-700">{isOpen ? "접기" : "펼치기"}</span>
            </button>

            {isOpen ? (
              <div className="flex flex-col gap-4 border-t border-slate-100 px-4 py-3">
                {p.always.length > 0 ? (
                  <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-3">
                    <div className="text-xs font-bold text-emerald-900">
                      시험마다 빠짐없이 나온 유형 ({p.always.length}가지)
                    </div>
                    <p className="mt-1 text-[12.5px] text-emerald-800">{p.always.join(" · ")}</p>
                    <p className="mt-1 text-[11px] text-emerald-700">다음 시험에도 거의 나옵니다.</p>
                  </div>
                ) : null}

                <div>
                  <div className="text-xs font-bold text-slate-700">어디서 내는가</div>
                  {topSources.length ? (
                    <ul className="mt-1.5 flex flex-col gap-1">
                      {topSources.map((s) => (
                        <li key={s.name} className="flex flex-wrap items-center gap-2 text-[12.5px]">
                          <span
                            className={`rounded px-1.5 py-0.5 text-[11px] font-semibold ${
                              s.kind === "교과서"
                                ? "bg-indigo-100 text-indigo-800"
                                : "bg-sky-100 text-sky-800"
                            }`}
                          >
                            {s.kind}
                          </span>
                          <span className="font-medium text-slate-800">{s.name}</span>
                          <span className="tabular-nums text-slate-500">{s.count}문항</span>
                          {p.exams.length > 1 && s.exams > 1 ? (
                            <span className="text-[11px] text-emerald-700">{s.exams}회 모두</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="mt-1 text-[12.5px] text-slate-500">
                      지문 출처가 확인된 문항이 없습니다. 교과서 본문이나 모의고사 지문을 넣어 두시면 보입니다.
                    </p>
                  )}
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-700">어떤 유형으로 내는가</div>
                  <div className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.types.slice(0, 16).map((t) => (
                      <span
                        key={t.name}
                        className={`rounded-full border px-2 py-0.5 text-[12px] ${
                          t.subjective
                            ? "border-violet-200 bg-violet-50 text-violet-800"
                            : "border-slate-200 bg-slate-50 text-slate-700"
                        }`}
                      >
                        {t.name}{" "}
                        <span className="font-semibold tabular-nums">{t.count}</span>
                        {t.points ? <span className="text-slate-400"> · {t.points}점</span> : null}
                      </span>
                    ))}
                  </div>
                  <p className="mt-1.5 text-[11px] text-slate-400">보라색은 서술형입니다.</p>
                </div>

                <div>
                  <div className="text-xs font-bold text-slate-700">분석해 둔 시험</div>
                  <ul className="mt-1.5 flex flex-wrap gap-1.5">
                    {p.exams.map((e) => (
                      <li key={e.id}>
                        <Link
                          href={`${basePath}/${e.id}`}
                          className="rounded-full bg-slate-100 px-2.5 py-1 text-[12px] font-medium text-slate-700 hover:bg-slate-200"
                        >
                          {e.label} · {e.items}문항
                          {e.points ? ` · ${e.points}점` : ""}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ) : null}
          </div>
        );
      })}
    </div>
  );
}
