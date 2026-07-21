"use client";

import Link from "next/link";
import { Button } from "@/components/ui/Button";
import type { QgJobProgressState } from "@/lib/question-generator/client-job-progress";

export function QgJobProgressBar({
  jobProgress,
  generating,
  pct,
  basePath,
  onOpenPdf,
  onDismiss,
}: {
  jobProgress: QgJobProgressState;
  generating: boolean;
  pct: number;
  basePath: string;
  onOpenPdf?: (jobId: string) => void;
  onDismiss: () => void;
}) {
  const label = jobProgress.title
    ? `「${jobProgress.title}」`
    : "변형문제";

  return (
    <div className="sticky top-0 z-30 mb-4 rounded-xl border border-brand-200 bg-brand-50 px-4 py-3 shadow-sm">
      {generating ? (
        <div className="flex flex-wrap items-center gap-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-brand-900">
              {label} 생성 중 · {jobProgress.completed + jobProgress.failed}/
              {jobProgress.total}
            </p>
            <p className="truncate text-xs text-brand-800">
              {jobProgress.message} · 이 페이지를 나가도 생성은 계속됩니다
            </p>
            <div className="mt-2 h-2 overflow-hidden rounded-full bg-white/80">
              <div
                className="h-full rounded-full bg-brand-700 transition-all duration-300"
                style={{ width: `${Math.max(pct, 4)}%` }}
              />
            </div>
          </div>
          <Link
            href={`${basePath}/generations/${jobProgress.jobId}`}
            className="shrink-0 rounded-lg border border-brand-300 bg-white px-3 py-2 text-xs font-medium text-brand-800"
          >
            상세 보기
          </Link>
        </div>
      ) : (
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm font-semibold text-brand-900">
            {label} 생성 완료
            {jobProgress.failed > 0
              ? ` · ${jobProgress.completed}/${jobProgress.total} (미생성 ${jobProgress.failed})`
              : ` · ${jobProgress.completed}문항`}
          </p>
          <div className="flex flex-wrap gap-2">
            {onOpenPdf && jobProgress.completed > 0 ? (
              <Button type="button" onClick={() => onOpenPdf(jobProgress.jobId)}>
                문제 PDF 열기
              </Button>
            ) : (
              <Link
                href={`${basePath}/generations/${jobProgress.jobId}/print?mode=exam`}
                className="inline-flex items-center rounded-lg bg-brand-700 px-3 py-2 text-sm font-medium text-white hover:bg-brand-800"
              >
                문제 PDF 열기
              </Link>
            )}
            <Button type="button" variant="secondary" onClick={onDismiss}>
              닫기
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
