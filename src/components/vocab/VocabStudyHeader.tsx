import Link from "next/link";
import type { ReactNode } from "react";
import { Icon } from "@/components/layout/NavIcon";

interface VocabStudyHeaderProps {
  backHref: string;
  backLabel: string;
  /** 예: "1단계" */
  stageLabel: string;
  /** 예: "뜻 익히기" */
  title: string;
  progressLabel: string;
  percent: number;
  right?: ReactNode;
}

/** 단어 학습 단계 화면 공통 머리말 (뒤로 가기 · 단계 이름 · 진행 막대) */
export function VocabStudyHeader({
  backHref,
  backLabel,
  stageLabel,
  title,
  progressLabel,
  percent,
  right,
}: VocabStudyHeaderProps) {
  const clamped = Math.min(100, Math.max(0, Math.round(percent)));

  return (
    <div className="flex flex-col gap-3 sm:gap-3.5">
      <div className="flex items-center justify-between gap-3">
        <Link
          href={backHref}
          className="-ml-1 inline-flex min-h-[44px] min-w-0 items-center gap-1 px-1 text-[13px] font-medium text-slate-500 transition hover:text-slate-900 sm:min-h-0"
        >
          <Icon name="left" size={16} />
          <span className="truncate">{backLabel}</span>
        </Link>
        {right}
      </div>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-5">
        <div className="flex items-baseline gap-2 sm:min-w-[220px] sm:flex-col sm:items-start sm:gap-0.5">
          <span className="text-xs font-semibold text-brand-700">
            {stageLabel}
          </span>
          <h1 className="text-lg font-bold tracking-tight text-slate-900 sm:text-xl">
            {title}
          </h1>
        </div>
        <div className="flex flex-1 flex-col gap-1.5">
          <div className="flex justify-between gap-2 text-[13px] text-slate-500">
            <span className="tabular-nums">{progressLabel}</span>
            <span className="shrink-0 font-semibold tabular-nums text-slate-900">
              {clamped}%
            </span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-brand-600 transition-all duration-300"
              style={{ width: `${clamped}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
