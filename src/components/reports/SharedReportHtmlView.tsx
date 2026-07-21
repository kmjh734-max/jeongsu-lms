import Image from "next/image";
import Link from "next/link";
import { ACADEMY_NAME, LOGO_SRC } from "@/lib/branding";
import { formatLastStudiedDate } from "@/lib/progress/enrollment-progress";
import { computeReportMetrics } from "@/lib/reports/report-metrics";
import { parseReviewWordDisplay } from "@/lib/reports/review-word-display";
import { resolveLearningReportText } from "@/lib/reports/resolve-learning-report-text";
import type { StudentReport } from "@/lib/reports/types";

interface SharedReportHtmlViewProps {
  report: StudentReport;
  parentMessage: string;
  aiReportText: string;
  studentName: string;
  expiresAt: string;
  shareToken: string;
  academyName?: string;
  logoSrc?: string;
}

function formatExpiresLabel(iso: string): string {
  return new Date(iso).toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function vocabStatusShort(set: StudentReport["vocabSets"][number]): string {
  if (set.stage4Passed) return `합격 ${set.stage4BestScore}점`;
  if (set.stage4AttemptCount > 0) return `재도전 ${set.stage4LastScore}점`;
  if (set.stage3Completed) return "4단계 준비";
  if (set.stage2Completed) return "3단계 진행";
  if (set.stage1Completed) return "2단계 진행";
  return "학습 중";
}

function SectionCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-sm">
      <h2 className="text-base font-bold text-[#1e3a5f]">{title}</h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}

/** 학부모 공유용 — 모바일 친화 HTML 리포트 */
export function SharedReportHtmlView({
  report,
  parentMessage,
  aiReportText,
  studentName,
  expiresAt,
  shareToken,
  academyName = ACADEMY_NAME,
  logoSrc = LOGO_SRC,
}: SharedReportHtmlViewProps) {
  const metrics = computeReportMetrics(report);
  const learningReport = resolveLearningReportText(
    report,
    parentMessage,
    aiReportText
  );
  const generatedLabel = formatLastStudiedDate(report.generatedAt);
  const printHref = `/report/share/${shareToken}?view=print`;

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-100 to-slate-50">
      <header className="border-b border-slate-200/80 bg-white">
        <div className="mx-auto max-w-lg px-4 py-5 sm:max-w-2xl sm:px-6">
          <div className="flex items-center gap-3">
            <Image
              src={logoSrc}
              alt={academyName}
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 rounded-xl object-contain"
            />
            <div className="min-w-0">
              <p className="text-xs font-medium tracking-wide text-slate-500">
                {academyName}
              </p>
              <h1 className="text-lg font-bold leading-snug text-slate-900 sm:text-xl">
                학습 리포트
              </h1>
            </div>
          </div>

          <dl className="mt-4 space-y-2 text-sm">
            <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
              <dt className="text-slate-500">학생</dt>
              <dd className="font-semibold text-slate-900">{studentName}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
              <dt className="text-slate-500">기간</dt>
              <dd className="font-medium text-slate-800">{report.rangeLabel}</dd>
            </div>
            <div className="flex justify-between gap-3 border-b border-slate-100 pb-2">
              <dt className="text-slate-500">생성일</dt>
              <dd className="text-slate-800">{generatedLabel}</dd>
            </div>
            {report.student.classNames.length > 0 && (
              <div className="flex justify-between gap-3">
                <dt className="text-slate-500">소속 반</dt>
                <dd className="text-right text-slate-800">
                  {report.student.classNames.join(", ")}
                </dd>
              </div>
            )}
          </dl>

          <p className="mt-3 text-xs text-slate-500">
            {formatExpiresLabel(expiresAt)}까지 열람 가능
          </p>

          <Link
            href={printHref}
            className="mt-4 flex w-full items-center justify-center rounded-xl bg-[#1e3a5f] px-4 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#16304f]"
          >
            PDF 저장 / 인쇄
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-lg space-y-4 px-4 py-6 sm:max-w-2xl sm:px-6 sm:py-8">
        <div className="grid grid-cols-2 gap-3">
          <MetricTile
            label="영상 진도율"
            value={
              metrics.videoProgressPercent !== null
                ? `${metrics.videoProgressPercent}%`
                : "—"
            }
          />
          <MetricTile
            label="단어장 통과"
            value={`${metrics.vocabPassedCount}/${metrics.vocabTotalCount || 0}`}
          />
          <MetricTile
            label="복습 필요 단어"
            value={`${metrics.reviewWordCount}개`}
          />
          <MetricTile label="최근 학습일" value={metrics.lastStudiedLabel} />
        </div>

        <SectionCard title="학습 리포트">
          <p className="whitespace-pre-wrap text-[15px] leading-relaxed text-slate-700">
            {learningReport}
          </p>
        </SectionCard>

        <SectionCard title="영상 학습 현황">
          {report.courses.length === 0 ? (
            <p className="text-sm text-slate-600">
              배정된 영상 강좌가 없습니다.
            </p>
          ) : (
            <ul className="space-y-3">
              {report.courses.map((course) => (
                <li
                  key={course.courseId}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">
                      {course.courseTitle}
                    </p>
                    <span className="shrink-0 text-sm font-bold text-[#1e3a5f]">
                      {course.progressPercent}%
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500">
                    {course.completedLessons}/{course.totalLessons}강 완료 · 최근{" "}
                    {formatLastStudiedDate(course.lastStudiedAt)}
                  </p>
                  <div className="mt-2 h-2 overflow-hidden rounded-full bg-slate-200">
                    <div
                      className="h-full rounded-full bg-[#1e3a5f]"
                      style={{ width: `${course.progressPercent}%` }}
                    />
                  </div>
                  {course.completedLessonsList.length > 0 && (
                    <ul className="mt-3 space-y-1 border-t border-slate-200/80 pt-3 text-sm text-slate-600">
                      {course.completedLessonsList.map((title) => (
                        <li key={title} className="flex gap-2">
                          <span className="text-emerald-600">✓</span>
                          <span>{title}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="단어학습 현황">
          {report.vocabSets.length === 0 ? (
            <p className="text-sm text-slate-600">배정된 단어장이 없습니다.</p>
          ) : (
            <ul className="space-y-3">
              {report.vocabSets.map((set) => (
                <li
                  key={set.setId}
                  className="rounded-xl border border-slate-100 bg-slate-50/80 p-4"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p className="font-semibold text-slate-900">{set.setTitle}</p>
                    <span
                      className={`shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold ${
                        set.stage4Passed
                          ? "bg-[#e8f0f8] text-[#1e3a5f]"
                          : set.stage4AttemptCount > 0
                            ? "bg-rose-50 text-rose-700"
                            : "bg-slate-200 text-slate-600"
                      }`}
                    >
                      {vocabStatusShort(set)}
                    </span>
                  </div>
                  <p className="mt-2 text-xs text-slate-500">
                    단어 {set.itemCount}개 · 1~3단계{" "}
                    {[set.stage1Completed, set.stage2Completed, set.stage3Completed]
                      .map((d) => (d ? "✓" : "·"))
                      .join(" ")}
                  </p>
                </li>
              ))}
            </ul>
          )}
        </SectionCard>

        <SectionCard title="복습 필요 단어">
          {report.reviewWords.length === 0 ? (
            <p className="text-sm text-slate-600">
              현재 특별히 복습이 필요한 단어는 없습니다.
            </p>
          ) : (
            <ul className="space-y-2">
              {report.reviewWords.slice(0, 15).map((word) => {
                const { word: w, meaning, reason } = parseReviewWordDisplay(word);
                return (
                  <li
                    key={word.itemId}
                    className="rounded-lg border border-slate-100 bg-slate-50/80 px-3 py-2.5"
                  >
                    <p className="font-medium text-slate-900">
                      {w}
                      {meaning && (
                        <span className="ml-1.5 font-normal text-slate-600">
                          · {meaning}
                        </span>
                      )}
                    </p>
                    {reason && (
                      <p className="mt-0.5 text-xs text-slate-500">{reason}</p>
                    )}
                  </li>
                );
              })}
              {report.reviewWords.length > 15 && (
                <p className="text-center text-xs text-slate-500">
                  외 {report.reviewWords.length - 15}개
                </p>
              )}
            </ul>
          )}
        </SectionCard>

        <footer className="pb-6 text-center text-xs text-slate-500">
          <p>{academyName}</p>
          <p className="mt-1">온라인 학습 현황 안내</p>
        </footer>
      </main>
    </div>
  );
}

function MetricTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#1e3a5f]/10 bg-white p-4 shadow-sm">
      <p className="text-xs font-medium text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold text-[#1e3a5f]">{value}</p>
    </div>
  );
}
