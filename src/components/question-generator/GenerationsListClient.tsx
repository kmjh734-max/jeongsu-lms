"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { PageHeader } from "@/components/ui/PageHeader";

export function GenerationsListClient({ basePath }: { basePath: string }) {
  const [jobs, setJobs] = useState<
    Array<{
      id: string;
      status: string;
      progress_message: string | null;
      total_requested: number;
      total_completed: number;
      total_failed: number;
      created_at: string;
      english_source_passages?: { title?: string } | null;
      request_config?: { title?: string };
    }>
  >([]);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/question-generator/jobs")
      .then((r) => r.json())
      .then((d) => {
        if (!d.ok) setError(d.message);
        else setJobs(d.jobs ?? []);
      })
      .catch(() => setError("목록을 불러오지 못했습니다."));
  }, []);

  return (
    <div>
      <PageHeader
        title="생성 기록"
        description="변형문제 생성 작업 이력을 확인합니다."
        action={
          <Link
            href={basePath}
            className="rounded-lg bg-brand-700 px-3 py-2 text-sm font-medium text-white"
          >
            새 생성
          </Link>
        }
      />
      {error && <Alert variant="error">{error}</Alert>}
      <div className="overflow-x-auto rounded-2xl border border-slate-200 bg-white shadow-card">
        <table className="ui-table w-full text-sm">
          <thead>
            <tr>
              <th>제목</th>
              <th>상태</th>
              <th>진행</th>
              <th>일시</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((j) => (
              <tr key={j.id}>
                <td>
                  {j.request_config?.title ||
                    j.english_source_passages?.title ||
                    "무제"}
                </td>
                <td>{j.status}</td>
                <td>
                  {j.total_completed}/{j.total_requested}
                  {j.total_failed > 0 ? ` (실패 ${j.total_failed})` : ""}
                </td>
                <td>{new Date(j.created_at).toLocaleString("ko-KR")}</td>
                <td>
                  <Link
                    href={`${basePath}/generations/${j.id}`}
                    className="text-brand-700 hover:underline"
                  >
                    보기
                  </Link>
                </td>
              </tr>
            ))}
            {jobs.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-slate-500">
                  생성 기록이 없습니다.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
