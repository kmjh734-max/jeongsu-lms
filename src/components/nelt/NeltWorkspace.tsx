"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { NeltImportPanel } from "@/components/nelt/NeltImportPanel";
import type { NeltStudentGroup } from "@/types/nelt";

interface NeltWorkspaceProps {
  role: "admin" | "teacher";
  academyName: string;
  initialGroups: NeltStudentGroup[];
}

/**
 * 메인에서 바로 1·2차(+추가) 링크 입력.
 * 학생 이름은 링크 분석 결과에서 추출.
 */
export function NeltWorkspace({
  role,
  academyName,
  initialGroups,
}: NeltWorkspaceProps) {
  const base = role === "admin" ? "/admin/nelt" : "/teacher/nelt";
  const router = useRouter();
  const [query, setQuery] = useState("");
  const [groups, setGroups] = useState(initialGroups);
  const [deletingName, setDeletingName] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setGroups(initialGroups);
  }, [initialGroups]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return groups;
    return groups.filter((g) => g.studentName.toLowerCase().includes(q));
  }, [groups, query]);

  async function deleteStudent(studentName: string) {
    const ok = window.confirm(
      `"${studentName}" 학생의 NELT 회차와 성장 리포트를 모두 삭제할까요?\n삭제 후에는 복구할 수 없습니다.`
    );
    if (!ok) return;

    setDeletingName(studentName);
    setError(null);
    try {
      const res = await fetch("/api/nelt/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "삭제에 실패했습니다.");
      }
      setGroups((prev) => prev.filter((g) => g.studentName !== studentName));
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제 오류");
    } finally {
      setDeletingName(null);
    }
  }

  return (
    <div className="space-y-8">
      <PageHeader
        title="NELT 성장 리포트"
        description={`${academyName} · 1차·2차 링크를 넣고 성장 리포트를 만듭니다. 학생 이름은 링크에서 자동으로 가져옵니다.`}
      />

      <NeltImportPanel role={role} embedded />

      <section className="space-y-3">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <h2 className="text-lg font-bold text-slate-900">등록된 NELT 학생</h2>
          <label className="text-sm font-medium text-slate-700">
            이름 검색
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="학생 이름"
              className="ui-input mt-1 w-48"
            />
          </label>
        </div>

        {error && <Alert variant="error">{error}</Alert>}

        {filtered.length === 0 ? (
          <Alert variant="info">
            아직 저장된 리포트가 없습니다. 위에서 링크를 분석·저장해 주세요.
          </Alert>
        ) : (
          <ul className="divide-y divide-slate-200 overflow-hidden rounded-xl border border-slate-200 bg-white">
            {filtered.map((g) => (
              <li
                key={g.studentName}
                className="flex flex-wrap items-center justify-between gap-3 px-4 py-3"
              >
                <div>
                  <p className="font-medium text-slate-900">{g.studentName}</p>
                  <p className="text-sm text-slate-500">
                    {g.reportCount}회차
                    {g.latestTestDate ? ` · 최근 ${g.latestTestDate}` : ""}
                    {g.latestOverallLevel
                      ? ` · ${g.latestOverallLevel}`
                      : ""}
                    {g.reportCount < 2 ? (
                      <span className="ml-1 text-amber-600">
                        · 성장 리포트는 2회차 이상 필요
                      </span>
                    ) : null}
                  </p>
                </div>
                <div className="flex flex-wrap gap-2">
                  {g.reportCount >= 2 ? (
                    <Link
                      href={`${base}/student/${encodeURIComponent(g.studentName)}`}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      성장 리포트
                    </Link>
                  ) : (
                    <Link
                      href={`${base}/import?name=${encodeURIComponent(g.studentName)}`}
                      className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                    >
                      2차 등록하기
                    </Link>
                  )}
                  <Link
                    href={`${base}/import?name=${encodeURIComponent(g.studentName)}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    회차 추가
                  </Link>
                  <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    disabled={deletingName === g.studentName}
                    onClick={() => void deleteStudent(g.studentName)}
                    className="!border-red-200 !text-red-700 hover:!bg-red-50"
                  >
                    {deletingName === g.studentName ? "삭제 중…" : "삭제"}
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
