"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "@/components/layout/NavIcon";
import { markRecordJobSeen, useRecordJob } from "@/lib/student-records/record-job-runner";

/**
 * 상단 바의 학생부 분석 알림 — 다른 메뉴에 있는 동안 진행 상황과 완료를 알려 주고,
 * 누르면 학생부 분석 화면으로 돌아간다. 작업이 없거나 이미 그 화면에 있으면 숨긴다.
 */
export function StudentRecordJobIndicator() {
  const job = useRecordJob();
  const pathname = usePathname();

  if (job.status === "idle" || !job.input) return null;
  const href = job.input.returnPath;
  if (pathname === href) return null;
  if (job.status !== "running" && job.seen) return null;

  const base =
    "inline-flex h-8 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full px-3 text-[13px] font-semibold transition";

  if (job.status === "running") {
    return (
      <Link
        href={href}
        prefetch={false}
        title="학생부 분석 화면으로 가기"
        className={`${base} bg-brand-50 text-brand-700 hover:bg-brand-100`}
      >
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-brand-600 opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-brand-600" />
        </span>
        학생부 분석 중 · <span className="tabular-nums">{job.percent}%</span>
      </Link>
    );
  }

  const done = job.status === "done";
  return (
    <Link
      href={href}
      prefetch={false}
      onClick={markRecordJobSeen}
      className={`${base} ${
        done
          ? "bg-green-50 text-green-700 hover:bg-green-100"
          : "bg-rose-50 text-rose-700 hover:bg-rose-100"
      }`}
    >
      <Icon name={done ? "check" : "alert"} size={15} strokeWidth={2.25} />
      {done ? "학생부 분석 완료 · 보기" : "학생부 분석 실패 · 다시 보기"}
    </Link>
  );
}
