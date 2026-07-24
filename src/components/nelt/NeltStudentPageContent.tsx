import Link from "next/link";
import { Alert } from "@/components/ui/Alert";
import { ButtonLink } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageHeader } from "@/components/ui/PageHeader";
import { NeltGrowthReportView } from "@/components/nelt/NeltGrowthReportView";
import { NeltStudentReportActions } from "@/components/nelt/NeltStudentReportActions";
import { buildNeltGrowthAnalysis, DOMAIN_LABEL } from "@/lib/nelt/compare/build-growth";
import type { NeltAttemptBundle } from "@/lib/nelt/compare/types";

interface NeltStudentPageContentProps {
  role: "admin" | "teacher";
  studentName: string;
  attempts: NeltAttemptBundle[];
}

export function NeltStudentPageContent({
  role,
  studentName,
  attempts,
}: NeltStudentPageContentProps) {
  const base = role === "admin" ? "/admin/nelt" : "/teacher/nelt";
  const analysis =
    attempts.length >= 2
      ? buildNeltGrowthAnalysis(studentName, attempts)
      : null;

  return (
    <div className="space-y-6">
      <PageHeader
        title={`${studentName} NELT 영어 성장 리포트`}
        description="회차별 NELT 결과를 바탕으로 학생의 영어 실력 성장과 앞으로의 학습 방향을 분석합니다."
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={base} variant="secondary" size="sm">
              목록
            </ButtonLink>
            <ButtonLink
              href={`${base}/import?name=${encodeURIComponent(studentName)}`}
              variant="primary"
              size="sm"
            >
              회차 추가
            </ButtonLink>
          </div>
        }
      />

      {attempts.length === 0 ? (
        <Alert variant="info">
          등록된 회차가 없습니다.{" "}
          <Link
            href={`${base}/import?name=${encodeURIComponent(studentName)}`}
            className="underline"
          >
            결과 링크를 등록
          </Link>
          해 주세요. 링크 2~3개를 한 번에 넣으면 1·2·3차 성장 리포트가
          만들어집니다.
        </Alert>
      ) : attempts.length === 1 ? (
        <>
          <Alert variant="info">
            1회차만 등록되어 있습니다. 같은 학생으로 2회차 이상 링크를 추가하면
            성장 비교 리포트가 생성됩니다.
          </Alert>
          <SingleAttemptDetail attempt={attempts[0]} />
        </>
      ) : analysis ? (
        <>
          <NeltStudentReportActions role={role} studentName={studentName} />
          <NeltGrowthReportView role={role} analysis={analysis} />
        </>
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
              <th>판정 수준</th>
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
      {attempt.domains.map(
        (d) =>
          d.evaluationSummary && (
            <div key={d.domain} className="rounded-lg bg-slate-50 p-3">
              <p className="text-xs font-semibold text-slate-500">
                {DOMAIN_LABEL[d.domain]} 총평
              </p>
              <p className="mt-1 text-sm leading-relaxed text-slate-700">
                {d.evaluationSummary}
              </p>
            </div>
          )
      )}
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
