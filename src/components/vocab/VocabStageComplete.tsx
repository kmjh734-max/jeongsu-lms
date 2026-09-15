"use client";

import { useEffect, useRef, type ReactNode } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";
import { notifyStudentTodayChanged } from "@/lib/student/today-refresh";

export type StageCompleteStat = {
  label: string;
  value: ReactNode;
  tone?: "good" | "bad" | "neutral";
};

export type StageCompleteWord = {
  id: string;
  word: string;
  meaning?: string | null;
};

export type StageCompletePhase = "saving" | "done" | "error";

interface VocabStageCompleteProps {
  phase: StageCompletePhase;
  /** 예: "1단계 · 뜻 익히기" */
  stageLabel: string;
  /** 예: "1단계 완료!" */
  title: string;
  /** 예: "40개 단어를 모두 익혔어요" */
  subtitle: string;
  stats: StageCompleteStat[];
  /** 다시 볼 단어 (몰라요·틀렸던 단어) */
  reviewTitle?: string;
  reviewWords?: StageCompleteWord[];
  /** 저장 실패 문구 */
  errorMessage?: string | null;
  onRetry?: () => void;
  /** 다음 단계 (없으면 단어장 버튼이 주 버튼) */
  next?: { href: string; label: string } | null;
  back: { href: string; label: string };
  /** 예: 몰라요 단어만 다시 보기 */
  extraAction?: { label: string; onClick: () => void } | null;
  /** 로그인 학생 화면이면 왼쪽 메뉴 '오늘 할 일'을 새로 읽게 한다 */
  notifyToday?: boolean;
}

const TONE: Record<NonNullable<StageCompleteStat["tone"]>, string> = {
  good: "text-green-700",
  bad: "text-rose-700",
  neutral: "text-slate-900",
};

const LINK_BTN =
  "inline-flex h-12 items-center justify-center gap-1.5 whitespace-nowrap rounded-md border px-5 text-[15px] font-semibold transition focus:outline-none focus:ring-4 sm:h-11";

/** 단계를 끝낸 뒤 보여 주는 완료 화면 (저장이 끝나야 다음 단계 버튼이 열린다) */
export function VocabStageComplete({
  phase,
  stageLabel,
  title,
  subtitle,
  stats,
  reviewTitle = "다시 볼 단어",
  reviewWords = [],
  errorMessage,
  onRetry,
  next,
  back,
  extraAction,
  notifyToday = false,
}: VocabStageCompleteProps) {
  const router = useRouter();
  const primaryRef = useRef<HTMLAnchorElement>(null);
  const done = phase === "done";
  const nextHref = next?.href;
  const backHref = back.href;

  useEffect(() => {
    if (!done) return;
    primaryRef.current?.focus({ preventScroll: true });
    if (nextHref) router.prefetch(nextHref);
    router.prefetch(backHref);
    if (notifyToday) notifyStudentTodayChanged();
  }, [done, nextHref, backHref, router, notifyToday]);

  const primary = next ?? back;
  const secondary = next ? back : null;

  return (
    <div className="mx-auto flex w-full max-w-[640px] flex-col gap-4" aria-live="polite">
      <div className="flex flex-col items-center gap-3 rounded-lg border border-slate-200 bg-white px-5 py-6 text-center shadow-card sm:px-8 sm:py-7">
        <span
          className={`flex h-12 w-12 items-center justify-center rounded-full ${
            phase === "error"
              ? "bg-rose-50 text-rose-700"
              : done
                ? "bg-green-700 text-white"
                : "bg-brand-50 text-brand-600"
          }`}
        >
          {phase === "error" ? (
            <Icon name="alert" size={24} strokeWidth={2.2} />
          ) : done ? (
            <Icon name="check" size={26} strokeWidth={2.6} />
          ) : (
            <span className="h-6 w-6 animate-spin rounded-full border-[3px] border-brand-200 border-t-brand-600" />
          )}
        </span>
        <div className="flex flex-col gap-1">
          <span className="text-xs font-semibold text-brand-700">{stageLabel}</span>
          <h2 className="text-[22px] font-bold tracking-tight text-slate-900 sm:text-2xl">
            {phase === "error"
              ? "저장하지 못했어요"
              : done
                ? title
                : "기록을 저장하고 있어요"}
          </h2>
          <p className="break-keep text-sm text-slate-500">
            {phase === "error"
              ? errorMessage || "잠시 뒤 다시 시도해 주세요."
              : done
                ? subtitle
                : "잠시만 기다려 주세요."}
          </p>
        </div>

        {stats.length > 0 && (
          <div
            className="grid w-full gap-2 pt-1"
            style={{ gridTemplateColumns: `repeat(${stats.length}, minmax(0, 1fr))` }}
          >
            {stats.map((s) => (
              <div
                key={s.label}
                className="flex flex-col items-center gap-0.5 rounded-md bg-slate-50 px-2 py-2.5"
              >
                <span
                  className={`text-xl font-bold tabular-nums ${TONE[s.tone ?? "neutral"]}`}
                >
                  {s.value}
                </span>
                <span className="text-xs text-slate-500">{s.label}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* 다음 버튼을 먼저 — 휴대폰에서도 스크롤 없이 누를 수 있게 */}
      {phase === "error" ? (
        <div className="grid gap-2.5 sm:grid-cols-2">
          <Link href={back.href} className={`${LINK_BTN} border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus:ring-slate-100`}>
            {back.label}
          </Link>
          <Button
            type="button"
            className="h-12 px-5 text-[15px] sm:h-11"
            onClick={onRetry}
          >
            <Icon name="rotate" size={16} strokeWidth={2} />
            다시 저장
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-2.5">
          {extraAction && done && (
            <Button
              type="button"
              variant="secondary"
              className="h-12 px-5 text-[15px] sm:h-11"
              onClick={extraAction.onClick}
            >
              <Icon name="rotate" size={16} strokeWidth={2} />
              {extraAction.label}
            </Button>
          )}
          <div className={`grid gap-2.5 ${secondary ? "grid-cols-2" : ""}`}>
            {secondary &&
              (done ? (
                <Link
                  href={secondary.href}
                  className={`${LINK_BTN} border-slate-300 bg-white text-slate-800 hover:bg-slate-50 focus:ring-slate-100`}
                >
                  {secondary.label}
                </Link>
              ) : (
                <span className={`${LINK_BTN} cursor-wait border-slate-200 bg-white text-slate-400`}>
                  {secondary.label}
                </span>
              ))}
            {done ? (
              <Link
                ref={primaryRef}
                href={primary.href}
                className={`${LINK_BTN} border-brand-600 bg-brand-600 text-white hover:border-brand-700 hover:bg-brand-700 focus:ring-brand-100`}
              >
                {primary.label}
                {next && <Icon name="chevron" size={16} strokeWidth={2} />}
              </Link>
            ) : (
              <span
                className={`${LINK_BTN} cursor-wait border-brand-600 bg-brand-600 text-white opacity-50`}
              >
                저장 중…
              </span>
            )}
          </div>
        </div>
      )}

      {reviewWords.length > 0 && (
        <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
          <div className="flex items-center justify-between gap-3 px-4 pb-2 pt-3">
            <h3 className="text-sm font-bold text-slate-900">{reviewTitle}</h3>
            <span className="text-xs tabular-nums text-slate-500">
              {reviewWords.length}개
            </span>
          </div>
          <ul className="grid max-h-[40vh] overflow-y-auto border-t border-slate-100 sm:grid-cols-2">
            {reviewWords.map((w) => (
              <li
                key={w.id}
                className="flex min-w-0 items-baseline gap-2.5 border-b border-slate-100 px-4 py-2"
              >
                <span className="shrink-0 text-sm font-semibold text-slate-900">
                  {w.word}
                </span>
                {w.meaning && (
                  <span className="min-w-0 truncate text-[13px] text-slate-500">
                    {w.meaning}
                  </span>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
