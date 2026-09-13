"use client";

import type { LessonQuestionJobRow } from "@/lib/lesson-materials/load-library";

const STATUS_LABEL: Record<string, string> = {
  completed: "완료",
  queued: "대기 중",
  pending: "대기 중",
  running: "생성 중",
  processing: "생성 중",
  failed: "일부 실패",
  cancelled: "취소됨",
};

function formatWhen(iso: string): string {
  if (!iso) return "";
  return new Intl.DateTimeFormat("ko-KR", {
    timeZone: "Asia/Seoul",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
}

/**
 * 자료함 "변형문제" 탭: 자료함에서 지문을 골라 "문제 제작"으로 만든 AI 변형문제 목록.
 * 문제지·정답·상세는 AI 변형문제 화면을 새 탭으로 연다.
 */
export function LessonQuestionJobList({
  role,
  jobs,
}: {
  role: "admin" | "teacher";
  jobs: LessonQuestionJobRow[];
}) {
  const base = role === "admin" ? "/admin/question-generator" : "/teacher/question-generator";
  const open = (path: string) => window.open(path, "_blank", "noopener,noreferrer");
  const link =
    "rounded-lg px-2 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-100 disabled:opacity-40";

  return (
    <section className="mt-3">
      <h2 className="mb-2 text-sm font-bold text-slate-800">
        만든 변형문제 <span className="font-semibold text-slate-400">{jobs.length}</span>
      </h2>
      {jobs.length === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-200 px-4 py-6 text-center text-sm text-slate-500">
          지문자료 탭에서 지문을 골라 문제 제작을 누르면, 만든 변형문제가 여기에 모입니다.
        </p>
      ) : (
        <ul className="space-y-2">
          {jobs.map((job) => {
            const ready = (job.total_completed ?? 0) > 0;
            return (
              <li
                key={job.id}
                className="flex flex-wrap items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3"
              >
                <span className="text-base" aria-hidden>
                  ✒
                </span>
                <div className="min-w-0 flex-1">
                  <button
                    type="button"
                    onClick={() => open(`${base}/generations/${job.id}`)}
                    className="truncate text-left text-sm font-semibold text-slate-900 hover:text-violet-700 hover:underline"
                    title="새 탭에서 열기"
                  >
                    {job.title}
                  </button>
                  <p className="mt-0.5 text-xs text-slate-500">
                    지문 {job.project_ids.length}개 · 문항 {job.total_completed ?? 0}
                    {job.total_requested ? `/${job.total_requested}` : ""} ·{" "}
                    {STATUS_LABEL[job.status] ?? job.status} · {formatWhen(job.created_at)}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-1">
                  <button
                    type="button"
                    disabled={!ready}
                    onClick={() => open(`${base}/generations/${job.id}/print?mode=exam`)}
                    className={link}
                  >
                    문제지
                  </button>
                  <button
                    type="button"
                    disabled={!ready}
                    onClick={() => open(`${base}/generations/${job.id}/print?mode=answers`)}
                    className={link}
                  >
                    정답
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
