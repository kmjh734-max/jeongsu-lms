"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Icon } from "@/components/layout/NavIcon";
import { STAGE4_PASS_SCORE } from "@/lib/vocab/build-stage3-questions";
import {
  emptyExamGuestProgress,
  loadExamGuestProgress,
  type ExamGuestProgress,
} from "@/lib/vocab/exam-guest-progress";

type RowState = "done" | "current" | "locked";

const PILL = "inline-flex h-[22px] shrink-0 items-center gap-1 whitespace-nowrap rounded px-2 text-xs font-semibold";

function StatePill({ state, pass, fail }: { state: RowState; pass?: boolean; fail?: boolean }) {
  if (state === "locked") {
    return (
      <span className={`${PILL} bg-slate-100 text-slate-500`}>
        <Icon name="lock" size={12} strokeWidth={2.4} />
        잠김
      </span>
    );
  }
  if (pass) {
    return (
      <span className={`${PILL} bg-green-50 text-green-700`}>
        <Icon name="trophy" size={12} strokeWidth={2.4} />
        합격
      </span>
    );
  }
  if (fail) return <span className={`${PILL} bg-rose-50 text-rose-700`}>불합격</span>;
  if (state === "done") {
    return (
      <span className={`${PILL} bg-green-50 text-green-700`}>
        <Icon name="check" size={12} strokeWidth={2.4} />
        완료
      </span>
    );
  }
  return <span className={`${PILL} bg-brand-50 text-brand-700`}>지금 할 차례</span>;
}

export function ExamVocabGuestHub({
  setId,
  title,
  itemCount,
}: {
  setId: string;
  title: string;
  itemCount: number;
}) {
  const searchParams = useSearchParams();
  const [progress, setProgress] = useState<ExamGuestProgress>(
    emptyExamGuestProgress
  );
  const scoreParam = searchParams.get("score");
  const passedParam = searchParams.get("passed");

  useEffect(() => {
    setProgress(loadExamGuestProgress(setId));
  }, [setId, scoreParam]);

  const s1: RowState = progress.stage1Done ? "done" : "current";
  const s2: RowState = !progress.stage1Done
    ? "locked"
    : progress.stage2Done
      ? "done"
      : "current";
  const s4Locked = !progress.stage2Done;
  const s4Pass = progress.stage4Passed;
  const s4Fail = progress.stage4Attempts > 0 && !progress.stage4Passed;
  const s4: RowState = s4Locked ? "locked" : s4Pass ? "done" : "current";

  const rows = [
    {
      step: 1,
      title: "뜻 익히기",
      desc: "카드를 넘기며 단어를 보고 뜻을 익혀요.",
      href: `/exam-vocab/${setId}/stage1`,
      state: s1,
      button: progress.stage1Done ? "다시 보기" : "시작하기",
      lockedLabel: "",
    },
    {
      step: 2,
      title: "스펠링",
      desc: "한글 뜻만 보고 영어 스펠링을 입력해요.",
      href: `/exam-vocab/${setId}/stage2`,
      state: s2,
      button: progress.stage2Done ? "다시 하기" : "시작하기",
      lockedLabel: "1단계를 먼저 끝내세요",
    },
    {
      step: 3,
      title: "종합테스트",
      desc: `뜻 쓰기 50% + 스펠링 50%. ${STAGE4_PASS_SCORE}점 이상이면 합격이에요.`,
      href: `/exam-vocab/${setId}/stage4`,
      state: s4,
      button: progress.stage4Attempts > 0 ? "다시 도전하기" : "시작하기",
      lockedLabel: "2단계를 먼저 끝내세요",
      pass: s4Pass,
      fail: s4Fail,
    },
  ];

  const passed = passedParam === "1";

  return (
    <div className="min-h-screen bg-canvas px-4 py-6 sm:py-10">
      <div className="mx-auto flex w-full max-w-lg flex-col gap-4">
        <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-card">
          <p className="text-xs font-semibold text-brand-700">보기 단어 학습</p>
          <h1 className="mt-1 break-keep text-xl font-bold tracking-tight text-slate-900">
            {title}
          </h1>
          <p className="mt-1.5 text-[13px] leading-relaxed text-slate-500">
            로그인 없이 이용 · 진행은 이 기기에 저장됩니다 · {itemCount}단어
          </p>
        </div>

        {scoreParam != null && (
          <div
            className={`flex items-center gap-3 rounded-lg border px-4 py-3.5 ${
              passed
                ? "border-green-200 bg-green-50 text-green-700"
                : "border-rose-200 bg-rose-50 text-rose-700"
            }`}
          >
            <span
              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white ${
                passed ? "bg-green-700" : "bg-rose-700"
              }`}
            >
              <Icon name={passed ? "trophy" : "x"} size={18} strokeWidth={2.2} />
            </span>
            <div className="flex flex-col">
              <span className="text-xs font-semibold opacity-80">테스트 결과</span>
              <span className="text-base font-bold tabular-nums">
                {scoreParam}점 · {passed ? "합격" : "불합격"}
              </span>
            </div>
          </div>
        )}

        {rows.map((r) => {
          const current = r.state === "current";
          const locked = r.state === "locked";
          const done = r.state === "done";
          return (
            <div
              key={r.step}
              className={`flex flex-col gap-3.5 rounded-lg border bg-white p-4 shadow-card ${
                current ? "border-brand-600 ring-4 ring-brand-50" : "border-slate-200"
              }`}
            >
              <div className="flex items-start gap-3">
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    done
                      ? "bg-green-700 text-white"
                      : current
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-400"
                  }`}
                >
                  {done ? (
                    <Icon name="check" size={18} strokeWidth={2.6} />
                  ) : (
                    <span className="text-[15px] font-bold tabular-nums">{r.step}</span>
                  )}
                </span>
                <div className="min-w-0 flex-1">
                  <p
                    className={`text-xs font-semibold ${
                      locked ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {r.step}단계
                  </p>
                  <p
                    className={`text-base font-bold ${
                      locked ? "text-slate-400" : "text-slate-900"
                    }`}
                  >
                    {r.title}
                  </p>
                  <p
                    className={`mt-0.5 text-[13px] leading-relaxed ${
                      locked ? "text-slate-400" : "text-slate-500"
                    }`}
                  >
                    {r.desc}
                  </p>
                </div>
                <StatePill state={r.state} pass={r.pass} fail={r.fail} />
              </div>
              {r.step === 3 && progress.stage4Attempts > 0 && (
                <p className="text-xs tabular-nums text-slate-500">
                  최근 {progress.stage4Last}점 · 최고 {progress.stage4Best}점 · 응시{" "}
                  {progress.stage4Attempts}회
                </p>
              )}
              {locked ? (
                <span className="inline-flex h-11 w-full items-center justify-center rounded-md border border-slate-200 bg-slate-100 px-3 text-sm font-semibold text-slate-400">
                  {r.lockedLabel}
                </span>
              ) : (
                <Link
                  href={r.href}
                  className={`inline-flex h-11 w-full items-center justify-center rounded-md border px-4 text-[15px] font-semibold transition ${
                    current
                      ? "border-brand-600 bg-brand-600 text-white hover:border-brand-700 hover:bg-brand-700"
                      : "border-slate-300 bg-white text-slate-800 hover:border-slate-400 hover:bg-slate-50"
                  }`}
                >
                  {r.button}
                </Link>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
