"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
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
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialGroups;
    return initialGroups.filter((g) =>
      g.studentName.toLowerCase().includes(q)
    );
  }, [initialGroups, query]);

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
                  </p>
                </div>
                <div className="flex gap-2">
                  <Link
                    href={`${base}/student/${encodeURIComponent(g.studentName)}`}
                    className="rounded-lg bg-emerald-600 px-3 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                  >
                    성장 리포트
                  </Link>
                  <Link
                    href={`${base}/import?name=${encodeURIComponent(g.studentName)}`}
                    className="rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700 hover:bg-slate-50"
                  >
                    회차 추가
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
