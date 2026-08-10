import Image from "next/image";
import { ACADEMY_NAME, LOGO_SRC } from "@/lib/branding";
import { formatLastStudiedDate } from "@/lib/progress/enrollment-progress";
import { parseReviewWordDisplay } from "@/lib/reports/review-word-display";
import { resolveLearningReportText } from "@/lib/reports/resolve-learning-report-text";
import { computeReportMetrics } from "@/lib/reports/report-metrics";
import type { StudentReport } from "@/lib/reports/types";

interface A4ReportDocumentProps {
  report: StudentReport;
  parentMessage: string;
  /** 공개 페이지 등 parentMessage 없을 때 직접 전달 */
  learningReportText?: string;
  /** 공개 보기 화면에서는 로고 이미지 생략 가능 */
  showLogo?: boolean;
  academyName?: string;
  logoSrc?: string;
}

function stagePill(completed: boolean) {
  return (
    <span
      className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-semibold ${
        completed
          ? "bg-[#e8f0f8] text-[#1e3a5f]"
          : "bg-slate-100 text-slate-500"
      }`}
    >
      {completed ? "완료" : "미완료"}
    </span>
  );
}

function statusPill(set: StudentReport["vocabSets"][number]) {
  if (set.stage4Passed) {
    return (
      <span className="inline-block rounded bg-[#e8f0f8] px-1.5 py-0.5 text-[9px] font-semibold text-[#1e3a5f]">
        합격
      </span>
    );
  }
  if (set.stage4AttemptCount > 0) {
    return (
      <span className="inline-block rounded bg-rose-50 px-1.5 py-0.5 text-[9px] font-semibold text-rose-700">
        재도전
      </span>
    );
  }
  return (
    <span className="inline-block rounded bg-slate-100 px-1.5 py-0.5 text-[9px] font-semibold text-slate-500">
      진행중
    </span>
  );
}

export function A4ReportDocument({
  report,
  parentMessage,
  learningReportText,
  showLogo = true,
  academyName = ACADEMY_NAME,
  logoSrc = LOGO_SRC,
}: A4ReportDocumentProps) {
  const generatedLabel = formatLastStudiedDate(report.generatedAt);
  const printDate = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  const metrics = computeReportMetrics(report);
  const learningReport = resolveLearningReportText(
    report,
    parentMessage,
    learningReportText
  );

  const reviewRows = report.reviewWords.slice(0, 10);
  const reviewExtra = report.reviewWords.length - reviewRows.length;

  return (
    <article className="a4-report mx-auto box-border w-[210mm] min-h-[297mm] bg-white px-[18mm] py-[16mm] text-[10.5pt] leading-relaxed text-slate-800 shadow-sm print:shadow-none">
      <header className="border-b border-[#1e3a5f]/30 pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1">
            {showLogo && (
              <div className="mb-2 flex items-center gap-2">
                <Image
                  src={logoSrc}
                  alt={academyName}
                  width={36}
                  height={36}
                  className="h-9 w-9 object-contain"
                />
                <span className="text-[9pt] font-medium tracking-wide text-slate-500">
                  {academyName}
                </span>
              </div>
            )}
            <p className="text-[9pt] font-semibold uppercase tracking-widest text-slate-500">
              Learning Report
            </p>
            <h1 className="mt-0.5 text-[17pt] font-bold tracking-tight text-[#1e3a5f]">
              {academyName} 학습 리포트
            </h1>
            <p className="mt-1 text-[11pt] font-semibold text-slate-900">
              {report.student.name}
              <span className="ml-2 font-normal text-slate-500">
                {report.rangeLabel}
              </span>
            </p>
          </div>
          <dl className="shrink-0 text-right text-[9pt] text-slate-600">
            <div>
              <dt className="sr-only">아이디</dt>
              <dd>{report.student.loginId ?? "—"}</dd>
            </div>
            <div className="mt-1">
              <dt className="sr-only">소속 반</dt>
              <dd>
                {report.student.classNames.length > 0
                  ? report.student.classNames.join(", ")
                  : "—"}
              </dd>
            </div>
            <div className="mt-1">
              <dt className="sr-only">생성일</dt>
              <dd>생성 {generatedLabel}</dd>
            </div>
          </dl>
        </div>
      </header>

      <div className="mt-5 grid grid-cols-4 gap-2 break-inside-avoid">
        <MetricCard
          label="영상 진도율"
          value={
            metrics.videoProgressPercent !== null
              ? `${metrics.videoProgressPercent}%`
              : "—"
          }
        />
        <MetricCard
          label="단어장 통과"
          value={`${metrics.vocabPassedCount}/${metrics.vocabTotalCount || 0}`}
        />
        <MetricCard
          label="복습 필요 단어"
          value={`${metrics.reviewWordCount}개`}
        />
        <MetricCard label="최근 학습일" value={metrics.lastStudiedLabel} />
      </div>

      <section className="mt-5 break-inside-avoid">
        <h2 className="text-[11pt] font-bold text-[#1e3a5f]">학습 리포트</h2>
        <div className="mt-2 rounded border border-[#1e3a5f]/15 bg-[#f4f7fb] px-4 py-3">
          <p className="whitespace-pre-wrap text-[10pt] leading-[1.75] text-slate-700">
            {learningReport}
          </p>
        </div>
      </section>

      <section className="mt-5 break-inside-avoid">
        <h2 className="border-b border-slate-200 pb-1 text-[11pt] font-bold text-[#1e3a5f]">
          영상 학습 현황
        </h2>
        {report.courses.length === 0 ? (
          <p className="mt-2 text-[10pt] text-slate-600">
            현재 온라인 영상 강좌는 배정되어 있지 않습니다.
          </p>
        ) : (
          <table className="mt-2 w-full border-collapse text-[9.5pt]">
            <thead>
              <tr className="border-b border-[#1e3a5f]/25 text-slate-600">
                <th className="py-1.5 text-left font-semibold">강좌명</th>
                <th className="py-1.5 text-center font-semibold">완료</th>
                <th className="py-1.5 text-center font-semibold">전체</th>
                <th className="py-1.5 text-center font-semibold">진도율</th>
                <th className="py-1.5 text-right font-semibold">최근 학습일</th>
              </tr>
            </thead>
            <tbody>
              {report.courses.map((course) => (
                <tr key={course.courseId} className="border-b border-slate-100">
                  <td className="py-1.5 pr-2 font-medium text-slate-800">
                    <div>{course.courseTitle}</div>
                    {course.completedLessonsList.length > 0 && (
                      <ul className="mt-1 list-inside list-disc text-[8.5pt] font-normal text-slate-600">
                        {course.completedLessonsList.map((title) => (
                          <li key={title}>{title}</li>
                        ))}
                      </ul>
                    )}
                  </td>
                  <td className="py-1.5 text-center">{course.completedLessons}</td>
                  <td className="py-1.5 text-center">{course.totalLessons}</td>
                  <td className="py-1.5 text-center font-medium text-[#1e3a5f]">
                    {course.progressPercent}%
                  </td>
                  <td className="py-1.5 text-right text-slate-600">
                    {formatLastStudiedDate(course.lastStudiedAt)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-5 break-inside-avoid">
        <h2 className="border-b border-slate-200 pb-1 text-[11pt] font-bold text-[#1e3a5f]">
          듣기 스케줄 (일일 과제)
        </h2>
        {report.listeningSchedule.length === 0 ? (
          <p className="mt-2 text-[10pt] text-slate-600">
            배정된 듣기 스케줄이 없습니다.
          </p>
        ) : (
          <table className="mt-2 w-full border-collapse text-[9.5pt]">
            <thead>
              <tr className="border-b border-[#1e3a5f]/25 text-slate-600">
                <th className="py-1.5 text-left font-semibold">스케줄</th>
                <th className="py-1.5 text-center font-semibold">완료</th>
                <th className="py-1.5 text-center font-semibold">전체</th>
                <th className="py-1.5 text-left font-semibold">요약</th>
              </tr>
            </thead>
            <tbody>
              {report.listeningSchedule.map((s) => (
                <tr key={s.assignmentId} className="border-b border-slate-100">
                  <td className="py-1.5 pr-2 font-medium text-slate-800">
                    {s.title}
                  </td>
                  <td className="py-1.5 text-center">{s.completedTasks}</td>
                  <td className="py-1.5 text-center">{s.totalTasks}</td>
                  <td className="py-1.5 text-slate-600">{s.summaryLine}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-5 break-inside-avoid">
        <h2 className="border-b border-slate-200 pb-1 text-[11pt] font-bold text-[#1e3a5f]">
          단어학습 현황
        </h2>
        {report.vocabSets.length === 0 ? (
          <p className="mt-2 text-[10pt] text-slate-600">배정된 단어장이 없습니다.</p>
        ) : (
          <table className="mt-2 w-full border-collapse text-[8.5pt]">
            <thead>
              <tr className="border-b border-[#1e3a5f]/25 text-slate-600">
                <th className="py-1.5 text-left font-semibold">단어장</th>
                <th className="py-1.5 text-center font-semibold">단어</th>
                <th className="py-1.5 text-center font-semibold">1</th>
                <th className="py-1.5 text-center font-semibold">2</th>
                <th className="py-1.5 text-center font-semibold">3</th>
                <th className="py-1.5 text-center font-semibold">4단계</th>
                <th className="py-1.5 text-center font-semibold">점수</th>
                <th className="py-1.5 text-center font-semibold">상태</th>
              </tr>
            </thead>
            <tbody>
              {report.vocabSets.map((set) => (
                <tr key={set.setId} className="border-b border-slate-100">
                  <td className="max-w-[120px] truncate py-1.5 pr-1 font-medium">
                    {set.setTitle}
                  </td>
                  <td className="py-1.5 text-center">{set.itemCount}</td>
                  <td className="py-1.5 text-center">
                    {stagePill(set.stage1Completed)}
                  </td>
                  <td className="py-1.5 text-center">
                    {stagePill(set.stage2Completed)}
                  </td>
                  <td className="py-1.5 text-center">
                    {stagePill(set.stage3Completed)}
                  </td>
                  <td className="py-1.5 text-center text-slate-700">
                    {set.stage4AttemptCount > 0
                      ? `${set.stage4LastScore}점`
                      : "—"}
                  </td>
                  <td className="py-1.5 text-center text-slate-700">
                    {set.stage4BestScore > 0 ? `${set.stage4BestScore}점` : "—"}
                  </td>
                  <td className="py-1.5 text-center">{statusPill(set)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="mt-5 break-inside-avoid">
        <h2 className="border-b border-slate-200 pb-1 text-[11pt] font-bold text-[#1e3a5f]">
          복습 필요 단어
        </h2>
        {reviewRows.length === 0 ? (
          <p className="mt-2 text-[10pt] text-slate-600">
            현재 특별히 복습이 필요한 단어는 없습니다.
          </p>
        ) : (
          <>
            <table className="mt-2 w-full border-collapse text-[9.5pt]">
              <thead>
                <tr className="border-b border-[#1e3a5f]/25 text-slate-600">
                  <th className="py-1.5 text-left font-semibold">단어</th>
                  <th className="py-1.5 text-left font-semibold">뜻</th>
                  <th className="py-1.5 text-left font-semibold">복습 이유</th>
                </tr>
              </thead>
              <tbody>
                {reviewRows.map((word) => {
                  const { word: w, meaning, reason } =
                    parseReviewWordDisplay(word);
                  return (
                    <tr key={word.itemId} className="border-b border-slate-100">
                      <td className="py-1.5 font-medium">{w}</td>
                      <td className="py-1.5 text-slate-700">{meaning}</td>
                      <td className="py-1.5 text-slate-600">{reason}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
            {reviewExtra > 0 && (
              <p className="mt-1.5 text-[9pt] text-slate-500">외 {reviewExtra}개</p>
            )}
          </>
        )}
      </section>

      <footer className="mt-8 border-t border-slate-200 pt-4 text-[9.5pt] text-slate-600">
        <p>앞으로도 꾸준히 학습할 수 있도록 지도하겠습니다.</p>
        <p className="mt-2 font-semibold text-[#1e3a5f]">{academyName}</p>
        <p className="mt-1 text-slate-500">출력일: {printDate}</p>
      </footer>
    </article>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded border border-[#1e3a5f]/12 bg-[#f8fafc] px-2 py-2 text-center">
      <p className="text-[8pt] font-medium text-slate-500">{label}</p>
      <p className="mt-0.5 text-[11pt] font-bold text-[#1e3a5f]">{value}</p>
    </div>
  );
}
