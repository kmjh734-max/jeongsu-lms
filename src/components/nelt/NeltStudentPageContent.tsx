"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
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
      `"${studentName}" 학생의 NELT 회차와 성장 리포트를 모두 삭제할까요?`
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
        throw new Error(json.message ?? "삭제 실패");
      }
      router.push(base);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "삭제 오류");
      setDeleting(false);
    }
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${studentName} NELT 영어 성장 리포트`}
        description={
          analysis
            ? `${analysis.attemptCount}회차 결과를 비교한 성장 리포트입니다.`
            : "회차별 NELT 결과를 등록하면 성장 리포트를 볼 수 있습니다."
        }
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={base} variant="secondary" size="sm">
              목록
            </ButtonLink>
            <ButtonLink
              href={`${base}/import?name=${encodeURIComponent(studentName)}`}
              variant="secondary"
              size="sm"
            >
              회차 추가
            </ButtonLink>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={deleting}
              onClick={() => void deleteAll()}
              className="!border-red-200 !text-red-700 hover:!bg-red-50"
            >
              {deleting ? "삭제 중…" : "전체 삭제"}
            </Button>
          </div>
        }
      />

      {error && <Alert variant="error">{error}</Alert>}

      {attempts.length === 0 ? (
        <Alert variant="info">
          등록된 회차가 없습니다.{" "}
          <Link
            href={`${base}/import?name=${encodeURIComponent(studentName)}`}
            className="underline"
          >
            결과 링크를 등록
          </Link>
          해 주세요.
        </Alert>
      ) : attempts.length === 1 ? (
        <>
          <Alert variant="info">
            1회차만 등록되어 있습니다. 2회차 이상 링크를 추가하면 성장 비교
            리포트가 열립니다.
          </Alert>
          <SingleAttemptDetail attempt={attempts[0]} />
          <ButtonLink
            href={`${base}/import?name=${encodeURIComponent(studentName)}`}
            variant="primary"
            size="sm"
          >
            2차 링크 등록하기
          </ButtonLink>
        </>
      ) : analysis ? (
        <NeltGrowthReportView role={role} analysis={analysis} />
      ) : (
        <Alert variant="error">성장 비교를 만들지 못했습니다.</Alert>
      )}
    </div>
  );
}

function SingleAttemptDetail({ attempt }: { attempt: NeltAttemptBundle }) {
  return (
    <Card className="space-y-4 p-5">
      <div>
        <p className="text-lg font-bold text-slate-900">
          1차 · {attempt.testDate ?? "날짜 미상"}
        </p>
        <p className="mt-1 text-sm text-slate-600">
          {attempt.overallLevel ?? "—"}
          {attempt.overallBand ? ` · ${attempt.overallBand}` : ""}
          {attempt.overallPercentile != null
            ? ` · 상위 ${attempt.overallPercentile}%`
            : ""}
        </p>
      </div>
      <div className="ui-table-wrap">
        <table className="ui-table text-sm">
          <thead>
            <tr>
              <th>영역</th>
              <th>난이도</th>
              <th>점수</th>
              <th>학년 수준</th>
              <th>상위%</th>
            </tr>
          </thead>
          <tbody>
            {attempt.domains.map((d) => (
              <tr key={d.domain}>
                <td>{DOMAIN_LABEL[d.domain]}</td>
                <td>{d.difficultyCode ?? "—"}</td>
                <td>{d.rawScore ?? "—"}</td>
                <td>{d.evaluatedLevel ?? "—"}</td>
                <td>{d.percentile ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {attempt.sourceUrl && (
        <a
          href={attempt.sourceUrl}
          target="_blank"
          rel="noreferrer"
          className="text-xs text-brand-600 hover:underline"
        >
          원본 링크 열기
        </a>
      )}
    </Card>
  );
}
