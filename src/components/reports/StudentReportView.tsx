"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import {
  EyeIcon,
  formatKoreanDate,
  formatMonthDay,
  NameAvatar,
} from "@/components/reports/report-ui";
import { ReportDashboard } from "@/components/reports/ReportDashboard";
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
  accent = "#2563eb",
  children,
}: {
  title: string;
  aside?: ReactNode;
  accent?: string;
  children: ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4">
      <div className="mb-3 flex items-baseline justify-between gap-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-slate-900">
          <span className="inline-block h-3.5 w-1 rounded-full" style={{ background: accent }} />
          {title}
        </h3>
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
  const cells = [...done.map((d) => (d ? "done" : "todo")), set.stage4Passed ? "done" : stage4Failed ? "fail" : "todo"];
  return (
    <span className="flex w-28 shrink-0 gap-0.5" aria-hidden>
      {cells.map((c, i) => (
        <span
          key={i}
          title={`${STAGE_NAMES[i]} ${c === "done" ? (i === 3 ? "합격" : "완료") : c === "fail" ? "불합격" : "아직"}`}
          className={`flex h-5 flex-1 items-center justify-center rounded text-[10px] font-bold ${
            c === "done" ? "bg-green-600 text-white" : c === "fail" ? "bg-rose-500 text-white" : "bg-slate-100 text-slate-400"
          }`}
        >
          {i + 1}
        </span>
      ))}
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

      {report.overview ? (
        <div className="mt-4">
          <ReportDashboard report={report} />
        </div>
      ) : (
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
      )}

      <div className="mt-4 space-y-3">
        <Section title="단어학습" accent="#16a34a" aside={report.vocabSets.length ? `${report.vocabSets.length}세트` : undefined}>
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
                        {set.stage3BestScore ? ` · 예문 빈칸 ${set.stage3BestScore}점` : ""}
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

        <Section title="듣기 · 받아쓰기" accent="#9333ea">
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
                  <p className="font-medium text-slate-700">듣기 시험</p>
                  <ul className="mt-1.5 space-y-1.5">
                    {report.listeningExam.map((e) => (
                      <li key={e.setId} className="flex items-center gap-3 text-xs tabular-nums">
                        <span className="w-32 shrink-0 truncate text-slate-700 sm:w-40">{e.setTitle}</span>
                        <span className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-slate-100">
                          <span
                            className="block h-full rounded-full"
                            style={{ width: `${Math.max(0, Math.min(100, e.bestScore ?? 0))}%`, background: "#9333ea" }}
                          />
                        </span>
                        <span className="w-24 shrink-0 text-right text-slate-500">
                          {e.bestScore != null ? <b className="text-slate-800">{e.bestScore}점</b> : "—"} · {e.attemptCount}회
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              ) : null}
            </div>
          )}
        </Section>

        <Section title="영상 강좌" accent="#0891b2">
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
          accent="#ea580c"
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
