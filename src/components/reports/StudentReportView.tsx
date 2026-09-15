"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import {
  EyeIcon,
  formatKoreanDate,
  formatMonthDay,
  NameAvatar,
} from "@/components/reports/report-ui";
import { getReportRangeBounds } from "@/lib/reports/date-range";
import type { StudentReport, VocabReportSection } from "@/lib/reports/types";

interface StudentReportViewProps {
  report: StudentReport;
  /** 기간을 바꿔 다시 불러오는 중 */
  loading?: boolean;
  onPreview: () => void;
}

function percent(done: number, total: number): number | null {
  if (total <= 0) return null;
  return Math.round((done / total) * 100);
}

function reportTitle(report: StudentReport): string {
  if (report.range === "month") {
    const month = new Date(report.generatedAt).getMonth() + 1;
    return `${report.student.name} · ${month}월 학습 리포트`;
  }
  if (report.range === "all") return `${report.student.name} · 학습 리포트`;
  return `${report.student.name} · ${report.rangeLabel} 학습 리포트`;
}

function rangeText(report: StudentReport): string {
  if (report.range === "all") return "전체 기간";
  const bounds = getReportRangeBounds(report.range, new Date(report.generatedAt));
  if (!bounds.start) return report.rangeLabel;
  return `${formatKoreanDate(bounds.start.toISOString())} ~ ${formatKoreanDate(
    bounds.end.toISOString()
  )}`;
}

function MetricTile({
  label,
  value,
  unit,
  sub,
}: {
  label: string;
  value: ReactNode;
  unit?: string;
  sub?: string;
}) {
  return (
    <div className="rounded-md bg-slate-50 px-3.5 py-3">
      <p className="text-xs text-slate-500">{label}</p>
      <p className="mt-1 text-xl font-bold tabular-nums tracking-tight text-slate-900">
        {value}
        {unit ? (
          <span className="ml-1 text-xs font-medium text-slate-500">{unit}</span>
        ) : null}
      </p>
      {sub ? <p className="mt-0.5 text-xs tabular-nums text-slate-400">{sub}</p> : null}
    </div>
  );
}

function Section({
  title,
  aside,
  children,
}: {
  title: string;
  aside?: ReactNode;
  children: ReactNode;
}) {
  return (
    <section className="border-t border-slate-100 pt-4">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <h3 className="text-sm font-bold text-slate-900">{title}</h3>
        {aside ? <span className="text-xs text-slate-500">{aside}</span> : null}
      </div>
      {children}
    </section>
  );
}

function Empty({ children }: { children: ReactNode }) {
  return <p className="text-sm text-slate-400">{children}</p>;
}

const STAGE_NAMES = ["1단계 뜻 익히기", "2단계 스펠링", "3단계 예문 빈칸", "4단계 종합테스트"];

function StageDots({ set }: { set: VocabReportSection }) {
  const done = [set.stage1Completed, set.stage2Completed, set.stage3Completed];
  const stage4Failed = !set.stage4Passed && set.stage4AttemptCount > 0;
  return (
    <span className="flex shrink-0 items-center gap-1" aria-hidden>
      {done.map((d, i) => (
        <span
          key={i}
          title={`${STAGE_NAMES[i]} ${d ? "완료" : "미완료"}`}
          className={`h-2 w-2 rounded-full ${d ? "bg-green-700" : "bg-slate-200"}`}
        />
      ))}
      <span
        title={`${STAGE_NAMES[3]} ${
          set.stage4Passed ? "합격" : stage4Failed ? "불합격" : "미응시"
        }`}
        className={`h-2 w-2 rounded-full ${
          set.stage4Passed ? "bg-green-700" : stage4Failed ? "bg-rose-600" : "bg-slate-200"
        }`}
      />
    </span>
  );
}

function vocabResult(set: VocabReportSection): { text: string; tone: string } {
  if (set.stage4Passed) {
    return { text: `${set.stage4BestScore}점 합격`, tone: "text-green-700" };
  }
  if (set.stage4AttemptCount > 0) {
    return {
      text: `${set.stage4LastScore}점 불합격`,
      tone: "text-rose-700",
    };
  }
  const doneCount = [set.stage1Completed, set.stage2Completed, set.stage3Completed].filter(
    Boolean
  ).length;
  return { text: `${Math.min(doneCount + 1, 4)}단계 중`, tone: "text-brand-700" };
}

export function StudentReportView({ report, loading = false, onPreview }: StudentReportViewProps) {
  const lessonTotal = report.courses.reduce((sum, c) => sum + c.totalLessons, 0);
  const lessonDone = report.courses.reduce((sum, c) => sum + c.completedLessons, 0);
  const videoPct = percent(lessonDone, lessonTotal);

  const taskTotal = report.listeningSchedule.reduce((sum, s) => sum + s.totalTasks, 0);
  const taskDone = report.listeningSchedule.reduce((sum, s) => sum + s.completedTasks, 0);
  const listeningPct = percent(taskDone, taskTotal);

  const vocabPassed = report.vocabSets.filter((s) => s.stage4Passed).length;

  const dictationPassed = report.listeningDictation.reduce(
    (sum, d) => sum + d.passedQuestionCount,
    0
  );
  const dictationTotal = report.listeningDictation.reduce((sum, d) => sum + d.questionCount, 0);
  const wrongWords = [
    ...new Set(report.listeningDictation.flatMap((d) => d.frequentWrongWords)),
  ];

  const hasListening =
    report.listeningSchedule.length > 0 ||
    report.listeningDictation.length > 0 ||
    report.listeningExam.length > 0;

  return (
    <div className={`p-5 transition-opacity ${loading ? "opacity-60" : ""}`} aria-busy={loading}>
      <header className="flex items-start gap-3">
        <NameAvatar name={report.student.name} size="lg" active />
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-lg font-bold tracking-tight text-slate-900">
            {reportTitle(report)}
          </h2>
          <p className="mt-0.5 truncate text-xs text-slate-500">
            {report.student.classNames.length > 0
              ? `${report.student.classNames.join(", ")} · `
              : ""}
            {rangeText(report)}
          </p>
        </div>
        <Button variant="ghost" size="sm" onClick={onPreview}>
          <EyeIcon size={15} />
          미리보기
        </Button>
      </header>

      <div className="mt-4 grid grid-cols-2 gap-2.5 lg:grid-cols-4">
        <MetricTile
          label="영상 진도"
          value={videoPct ?? "—"}
          unit={videoPct != null ? "%" : undefined}
          sub={lessonTotal > 0 ? `${lessonDone}/${lessonTotal}강` : "기록 없음"}
        />
        <MetricTile
          label="듣기 수행"
          value={listeningPct ?? "—"}
          unit={listeningPct != null ? "%" : undefined}
          sub={taskTotal > 0 ? `${taskDone}/${taskTotal}일` : "기록 없음"}
        />
        <MetricTile
          label="단어 합격"
          value={report.vocabSets.length > 0 ? vocabPassed : "—"}
          unit={report.vocabSets.length > 0 ? `/ ${report.vocabSets.length}개` : undefined}
        />
        <MetricTile label="복습할 단어" value={report.reviewWords.length} unit="개" />
      </div>

      <div className="mt-5 space-y-4">
        <Section title="단어학습">
          {report.vocabSets.length === 0 ? (
            <Empty>이 기간에 공부한 단어장이 없어요.</Empty>
          ) : (
            <ul className="space-y-1.5">
              {report.vocabSets.map((set) => {
                const result = vocabResult(set);
                return (
                  <li key={set.setId} className="flex items-center gap-3 text-sm">
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-slate-800">{set.setTitle}</span>
                      <span className="block truncate text-xs tabular-nums text-slate-400">
                        {set.itemCount}단어
                        {set.stage4AttemptCount > 0
                          ? ` · 응시 ${set.stage4AttemptCount}회 · 최고 ${set.stage4BestScore}점`
                          : ""}
                        {set.lastStudiedAt ? ` · ${formatMonthDay(set.lastStudiedAt)} 공부` : ""}
                      </span>
                    </span>
                    <StageDots set={set} />
                    <span
                      className={`w-24 shrink-0 text-right text-xs font-semibold tabular-nums ${result.tone}`}
                    >
                      {result.text}
                    </span>
                  </li>
                );
              })}
            </ul>
          )}
        </Section>

        <Section title="듣기 · 받아쓰기">
          {!hasListening ? (
            <Empty>이 기간에 듣기 기록이 없어요.</Empty>
          ) : (
            <div className="space-y-3 text-sm">
              {report.listeningSchedule.map((s) => (
                <div key={s.assignmentId}>
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-medium text-slate-800">{s.title}</span>
                    <span className="text-xs text-slate-400">{s.periodLabel}</span>
                  </p>
                  <p className="mt-0.5 text-slate-600">{s.summaryLine}</p>
                  {s.recentTasks.length > 0 ? (
                    <ul className="mt-1 flex flex-wrap gap-1">
                      {s.recentTasks.map((t) => (
                        <li
                          key={`${s.assignmentId}-${t.taskDate}-${t.setTitle}`}
                          title={t.setTitle || undefined}
                          className="rounded bg-slate-50 px-1.5 py-0.5 text-xs tabular-nums text-slate-500"
                        >
                          {formatMonthDay(t.taskDate)} {t.statusLabel}
                          {t.totalCount > 0 ? ` ${t.completedCount}/${t.totalCount}` : ""}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </div>
              ))}

              {report.listeningDictation.length > 0 ? (
                <div>
                  <p className="text-slate-700">
                    받아쓰기 통과{" "}
                    <span className="font-semibold tabular-nums">
                      {dictationPassed}/{dictationTotal}문항
                    </span>
                    {wrongWords.length > 0 ? (
                      <span className="text-slate-400"> · 자주 틀린 단어</span>
                    ) : null}
                  </p>
                  {wrongWords.length > 0 ? (
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                      {wrongWords.map((w) => (
                        <span
                          key={w}
                          className="rounded bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-700"
                        >
                          {w}
                        </span>
                      ))}
                    </div>
                  ) : null}
                  <ul className="mt-1.5 space-y-0.5 text-xs text-slate-500">
                    {report.listeningDictation.map((d) => (
                      <li key={d.setId} className="tabular-nums">
                        {d.setTitle} · 통과 {d.passedQuestionCount}/{d.questionCount} · 시도{" "}
                        {d.totalAttempts}회
                        {d.averageBestScore != null ? ` · 평균 최고 ${d.averageBestScore}점` : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}

              {report.listeningExam.length > 0 ? (
                <div>
                  <p className="text-slate-700">듣기 시험</p>
                  <ul className="mt-0.5 space-y-0.5 text-xs text-slate-500">
                    {report.listeningExam.map((e) => (
                      <li key={e.setId} className="tabular-nums">
                        {e.setTitle} · {e.questionCount}문항 · 시도 {e.attemptCount}회
                        {e.bestScore != null ? (
                          <span className="font-semibold text-slate-700">
                            {" "}
                            · 최고 {e.bestScore}점
                          </span>
                        ) : null}
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </Section>

        <Section title="영상 강좌">
          {report.courses.length === 0 ? (
            <Empty>이 기간에 본 영상 강좌가 없어요.</Empty>
          ) : (
            <ul className="space-y-2.5">
              {report.courses.map((course) => (
                <li key={course.courseId} className="text-sm">
                  <div className="flex items-center gap-3">
                    <span className="w-32 shrink-0 truncate text-slate-800 sm:w-40">
                      {course.courseTitle}
                    </span>
                    <span className="h-1.5 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <span
                        className="block h-full rounded-full bg-brand-600"
                        style={{ width: `${Math.min(100, Math.max(0, course.progressPercent))}%` }}
                      />
                    </span>
                    <span className="w-16 shrink-0 text-right text-xs font-semibold tabular-nums text-slate-700">
                      {course.completedLessons}/{course.totalLessons}강
                    </span>
                  </div>
                  {course.completedLessonsList.length > 0 || course.lastStudiedAt ? (
                    <details className="group mt-1">
                      <summary className="cursor-pointer list-none text-xs text-slate-400 hover:text-slate-600">
                        진도 {course.progressPercent}%
                        {course.lastStudiedAt
                          ? ` · 마지막 ${formatMonthDay(course.lastStudiedAt)}`
                          : ""}
                        {course.completedLessonsList.length > 0
                          ? ` · 이 기간 완료 ${course.completedLessonsList.length}개 보기`
                          : ""}
                      </summary>
                      {course.completedLessonsList.length > 0 ? (
                        <ul className="mt-1 max-h-40 space-y-0.5 overflow-y-auto rounded-md bg-slate-50 px-3 py-2 text-xs text-slate-600">
                          {course.completedLessonsList.map((title) => (
                            <li key={title}>· {title}</li>
                          ))}
                        </ul>
                      ) : null}
                    </details>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </Section>

        <Section
          title="복습 필요 단어"
          aside={report.reviewWords.length > 0 ? `${report.reviewWords.length}개` : undefined}
        >
          {report.reviewWords.length === 0 ? (
            <Empty>복습이 필요한 단어가 없어요.</Empty>
          ) : (
            <div className="max-h-72 overflow-auto rounded-md border border-slate-100">
              <table className="w-full min-w-[420px] text-left text-sm">
                <thead className="sticky top-0 bg-slate-50 text-xs text-slate-500">
                  <tr>
                    <th className="px-3 py-1.5 font-semibold">단어</th>
                    <th className="px-3 py-1.5 font-semibold">뜻</th>
                    <th className="px-3 py-1.5 font-semibold">틀린 단계</th>
                    <th className="px-3 py-1.5 text-right font-semibold">횟수</th>
                  </tr>
                </thead>
                <tbody>
                  {report.reviewWords.map((row) => (
                    <tr key={row.itemId} className="border-t border-slate-100">
                      <td className="px-3 py-1.5 font-medium text-slate-900">{row.word}</td>
                      <td className="px-3 py-1.5 text-slate-600">{row.meaning}</td>
                      <td className="px-3 py-1.5 text-xs text-slate-500">
                        {row.stages.join(", ")}
                      </td>
                      <td className="px-3 py-1.5 text-right tabular-nums text-slate-700">
                        {row.wrongCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Section>

        <p className="text-right text-xs text-slate-400">
          {new Date(report.generatedAt).toLocaleString("ko-KR", {
            month: "numeric",
            day: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          기준
        </p>
      </div>
    </div>
  );
}
