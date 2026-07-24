"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import type { NeltStudentGroup } from "@/types/nelt";

interface NeltWorkspaceProps {
  role: "admin" | "teacher";
  academyName: string;
  initialGroups: NeltStudentGroup[];
}

/**
 * 학생부 분석과 동일: LMS 등록 학생과 무관.
 * 학생명은 PDF/링크에서 추출하거나 직접 입력한다.
 */
export function NeltWorkspace({
  role,
  academyName,
  initialGroups,
}: NeltWorkspaceProps) {
  const base = role === "admin" ? "/admin/nelt" : "/teacher/nelt";
  const [query, setQuery] = useState("");
  const [manualName, setManualName] = useState("");

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return initialGroups;
    return initialGroups.filter((g) =>
      g.studentName.toLowerCase().includes(q)
    );
  }, [initialGroups, query]);

  const startHref = manualName.trim()
    ? `${base}/import?name=${encodeURIComponent(manualName.trim())}`
    : `${base}/import`;

  return (
    <div className="space-y-8">
      <PageHeader
        title="NELT 성장 리포트"
        description={`${academyName} · 회차별 NELT 결과를 바탕으로 학생의 영어 실력 성장과 앞으로의 학습 방향을 분석합니다. (등록 학생 계정과 무관하게 이름만으로 관리)`}
      />

      <Card className="space-y-4 p-5 sm:p-6">
        <h2 className="text-sm font-semibold text-slate-800">새 결과 등록</h2>
        <p className="text-sm text-slate-600">
          1차·2차 NE Tutor 공유 링크를 각각 입력해 분석하면 성장 리포트가
          만들어집니다. LMS 학생 계정은 필요 없습니다.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <label className="block flex-1 text-sm font-medium text-slate-700">
            학생 이름 (선택)
            <input
              value={manualName}
              onChange={(e) => setManualName(e.target.value)}
              placeholder="예: 홍길동"
              className="ui-input mt-1"
            />
          </label>
          <ButtonLink href={startHref} variant="primary">
            1차·2차 링크 등록
          </ButtonLink>
        </div>
      </Card>

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
            아직 등록된 NELT 결과가 없습니다. 위에서 첫 회차를 등록해 주세요.
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
                    NELT 성적
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

      <p className="text-xs text-slate-400">
        링크 2개 이상이면 영역별 성장·어휘 증가·문법 O/X 변화·학부모 문구가
        학생 상세에서 바로 보입니다.
      </p>
    </div>
  );
}
