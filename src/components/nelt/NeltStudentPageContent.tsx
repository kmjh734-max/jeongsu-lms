"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Alert } from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { ReportMenu, ReportMenuItem } from "@/components/reports/report-ui";
import { NeltGrowthReportView } from "@/components/nelt/NeltGrowthReportView";
import { buildNeltGrowthAnalysis, DOMAIN_LABEL } from "@/lib/nelt/compare/build-growth";
import type {
  NeltAttemptBundle,
  NeltGrowthAnalysis,
} from "@/lib/nelt/compare/types";

interface NeltStudentPageContentProps {
  role: "admin" | "teacher";
  studentName: string;
  attempts: NeltAttemptBundle[];
  /** DB에 저장된 AI 서술 — 있으면 재생성 없이 표시 */
  storedNarratives?: NeltGrowthAnalysis["aiNarratives"] | null;
}

export function NeltStudentPageContent({
  role,
  studentName,
  attempts,
  storedNarratives = null,
}: NeltStudentPageContentProps) {
  const base = role === "admin" ? "/admin/nelt" : "/teacher/nelt";
  const router = useRouter();
  const [deleting, setDeleting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const baseAnalysis =
    attempts.length >= 2
      ? buildNeltGrowthAnalysis(studentName, attempts)
      : null;
  const analysis = baseAnalysis
    ? {
        ...baseAnalysis,
        ...(storedNarratives ? { aiNarratives: storedNarratives } : {}),
      }
    : null;

  async function deleteAll() {
    const ok = window.confirm(
      `"${studentName}" 학생의 NELT 회차와 성장 리포트를 모두 삭제할까요?
삭제하면 되돌릴 수 없어요.`
    );
    if (!ok) return;
    setDeleting(true);
    setError(null);
    try {
      const res = await fetch("/api/nelt/students", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "삭제하지 못했어요.");
      }
      router.push(base);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제하지 못했어요.");
      setDeleting(false);
    }
  }

  const importHref = `${base}?import=1&name=${encodeURIComponent(studentName)}`;

  return (
    <div className="space-y-4">
      <div className="no-print">
        <ButtonLink href={base} variant="ghost" size="sm" className="-ml-2 mb-2">
          <Icon name="left" size={15} />
          목록
        </ButtonLink>
        <PageHeader
          title={`${studentName} 성장 리포트`}
          description={
            analysis
              ? `NELT ${analysis.attemptCount}회차 결과를 비교했어요.`
              : "회차별 NELT 결과를 넣으면 성장 리포트를 볼 수 있어요."
          }
          action={
            <div className="flex items-center gap-2">
              <ButtonLink href={importHref} variant="secondary">
                <Icon name="plus" size={15} />
                회차 추가
              </ButtonLink>
              <ReportMenu label={`${studentName} 메뉴`} disabled={deleting}>
                <ReportMenuItem icon="trash" danger onClick={() => void deleteAll()}>
                  {deleting ? "삭제 중…" : "전체 삭제"}
                </ReportMenuItem>
              </ReportMenu>
            </div>
          }
        />
      </div>

      {error && <Alert variant="error">{error}</Alert>}

      {attempts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-300 bg-white px-6 py-12 text-center">
          <p className="text-sm text-slate-500">아직 넣은 회차가 없어요.</p>
          <ButtonLink href={importHref} className="mt-4">
            <Icon name="plus" size={15} />
            결과 넣기
          </ButtonLink>
        </div>
      ) : attempts.length === 1 ? (
        <>
          <div className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-amber-100 bg-amber-50 px-4 py-3">
            <p className="text-sm text-amber-800">
              1회차만 있어요. 2회차 결과를 넣으면 성장 리포트가 열려요.
            </p>
            <ButtonLink href={importHref} size="sm">
              <Icon name="plus" size={14} />
              2차 결과 넣기
            </ButtonLink>
          </div>
          <SingleAttemptDetail attempt={attempts[0]} />
        </>
      ) : analysis ? (
        <NeltGrowthReportView role={role} analysis={analysis} />
      ) : (
        <Alert variant="error">성장 비교를 만들지 못했어요.</Alert>
      )}
    </div>
  );
}

function SingleAttemptDetail({ attempt }: { attempt: NeltAttemptBundle }) {
  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-base font-bold text-slate-900">
            1차 · {attempt.testDate ?? "날짜 없음"}
          </p>
          <p className="mt-0.5 text-sm text-slate-500">
            {[
              attempt.overallLevel,
              attempt.overallBand,
              attempt.overallPercentile != null ? `동학년 상위 ${attempt.overallPercentile}%` : null,
            ]
              .filter(Boolean)
              .join(" · ") || "—"}
          </p>
        </div>
        {attempt.sourceUrl && (
          <a
            href={attempt.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="text-xs font-semibold text-brand-700 hover:underline"
          >
            원본 결과 열기
          </a>
        )}
      </div>
      <div className="mt-4 overflow-x-auto rounded-md border border-slate-200">
        <table className="w-full min-w-[480px] text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs text-slate-500">
            <tr>
              <th className="px-4 py-2 font-semibold">영역</th>
              <th className="px-4 py-2 font-semibold">난이도</th>
              <th className="px-4 py-2 text-right font-semibold">점수</th>
              <th className="px-4 py-2 font-semibold">학년 수준</th>
              <th className="px-4 py-2 text-right font-semibold">상위 %</th>
            </tr>
          </thead>
          <tbody>
            {attempt.domains.map((d) => (
              <tr key={d.domain} className="border-b border-slate-100 last:border-0">
                <td className="px-4 py-2.5 font-medium text-slate-900">{DOMAIN_LABEL[d.domain]}</td>
                <td className="px-4 py-2.5 text-slate-600">{d.difficultyCode ?? "—"}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                  {d.rawScore ?? "—"}
                </td>
                <td className="px-4 py-2.5 text-slate-600">{d.evaluatedLevel ?? "—"}</td>
                <td className="px-4 py-2.5 text-right tabular-nums text-slate-700">
                  {d.percentile ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
