"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";

type JobRow = {
  id: string;
  status: string;
  progress_message: string | null;
  total_requested: number;
  total_completed: number;
  total_failed: number;
  created_at: string;
  english_source_passages?: { title?: string } | null;
  request_config?: {
    title?: string;
    passages?: Array<{ text?: string }>;
    passageIds?: string[];
    passage?: string;
    grade?: string;
  };
};

function statusMeta(status: string): { label: string; className: string } {
  switch (status) {
    case "completed":
      return {
        label: "제작 완료",
        className: "bg-slate-800 text-white",
      };
    case "partially_completed":
      return {
        label: "일부 완료",
        className: "bg-amber-700 text-white",
      };
    case "failed":
      return {
        label: "실패",
        className: "bg-red-600 text-white",
      };
    case "pending":
      return {
        label: "처리 전",
        className: "bg-slate-400 text-white",
      };
    case "analyzing":
    case "generating":
    case "validating":
      return {
        label: "생성 중",
        className: "bg-brand-700 text-white",
      };
    default:
      return {
        label: status,
        className: "bg-slate-400 text-white",
      };
  }
}

function passageCount(j: JobRow): number {
  const ids = j.request_config?.passageIds;
  if (Array.isArray(ids) && ids.length > 0) return ids.length;
  const list = j.request_config?.passages;
  if (Array.isArray(list)) {
    const n = list.filter((p) => (p.text ?? "").trim()).length;
    if (n > 0) return n;
  }
  if ((j.request_config?.passage ?? "").trim()) return 1;
  return 1;
}

function shortId(id: string): string {
  return id.replace(/-/g, "").slice(0, 6).toUpperCase();
}

export function GenerationsListClient({ basePath }: { basePath: string }) {
  const [jobs, setJobs] = useState<JobRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/question-generator/jobs")
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) setError(d.message);
        else setJobs(d.jobs ?? []);
      })
      .catch(() => setError("목록을 불러오지 못했습니다."))
      .finally(() => setLoading(false));
  }, []);

  return (
    <div>
      <PageHeader
        title="영어 변형문제"
        description="만든 변형문제 자료를 모은 폴더입니다. 새로 만들기로 지문을 넣고 문제를 생성하세요."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`${basePath}/new`}
              className="rounded-lg bg-brand-700 px-3 py-2 text-sm font-medium text-white hover:bg-brand-800"
            >
              + 새로 만들기
            </Link>
            <Link
              href={`${basePath}/new`}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              변형문제 생성
            </Link>
          </div>
        }
      />

      <div className="mb-4 flex gap-1 border-b border-slate-200">
        <span className="border-b-2 border-brand-700 px-3 py-2 text-sm font-semibold text-brand-800">
          내 자료
        </span>
      </div>

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
        <table className="ui-table w-full text-sm">
          <thead>
            <tr>
              <th className="w-24">#</th>
              <th>제목</th>
              <th className="w-24">지문 수</th>
              <th className="w-28">문항</th>
              <th className="w-28">상태</th>
              <th className="w-40">작성일</th>
              <th className="w-36"></th>
            </tr>
          </thead>
          <tbody>
            {loading && (
              <tr>
                <td colSpan={7} className="py-10 text-center text-slate-500">
                  불러오는 중…
                </td>
              </tr>
            )}
            {!loading &&
              jobs.map((j) => {
                const st = statusMeta(j.status);
                const title =
                  j.request_config?.title ||
                  j.english_source_passages?.title ||
                  "무제";
                return (
                  <tr key={j.id} className="hover:bg-slate-50/80">
                    <td className="font-mono text-xs text-slate-500">
                      {shortId(j.id)}
                    </td>
                    <td>
                      <Link
                        href={`${basePath}/generations/${j.id}`}
                        className="font-medium text-slate-900 hover:text-brand-700 hover:underline"
                      >
                        {title}
                      </Link>
                      {j.request_config?.grade && (
                        <span className="ml-2 text-xs text-slate-400">
                          {j.request_config.grade}
                        </span>
                      )}
                    </td>
                    <td className="tabular-nums">{passageCount(j)}</td>
                    <td className="tabular-nums text-slate-700">
                      {j.total_completed}/{j.total_requested}
                      {j.total_failed > 0 ? (
                        <span className="ml-1 text-xs text-red-600">
                          실패 {j.total_failed}
                        </span>
                      ) : null}
                    </td>
                    <td>
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${st.className}`}
                      >
                        {st.label}
                      </span>
                    </td>
                    <td className="whitespace-nowrap text-slate-600">
                      {new Date(j.created_at).toLocaleString("ko-KR", {
                        month: "2-digit",
                        day: "2-digit",
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </td>
                    <td>
                      <div className="flex flex-wrap gap-2">
                        <Link
                          href={`${basePath}/generations/${j.id}`}
                          className="text-sm text-brand-700 hover:underline"
                        >
                          보기
                        </Link>
                        {(j.status === "completed" ||
                          j.status === "partially_completed") &&
                          j.total_completed > 0 && (
                            <>
                              <Link
                                href={`${basePath}/generations/${j.id}/print?mode=exam`}
                                className="text-sm text-slate-600 hover:underline"
                                target="_blank"
                              >
                                문제
                              </Link>
                              <Link
                                href={`${basePath}/generations/${j.id}/print?mode=answers`}
                                className="text-sm text-slate-600 hover:underline"
                                target="_blank"
                              >
                                해설
                              </Link>
                            </>
                          )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            {!loading && jobs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-12 text-center text-slate-500">
                  <p className="mb-3">아직 만든 변형문제가 없습니다.</p>
                  <Link
                    href={`${basePath}/new`}
                    className="inline-flex rounded-lg bg-brand-700 px-4 py-2 text-sm font-medium text-white"
                  >
                    + 새로 만들기
                  </Link>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
