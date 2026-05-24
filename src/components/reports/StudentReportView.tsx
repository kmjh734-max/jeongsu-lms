"use client";

import { Badge } from "@/components/ui/Badge";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { formatLastStudiedDate } from "@/lib/progress/enrollment-progress";
import type { StudentReport } from "@/lib/reports/types";
import { ParentReportMessage } from "@/components/reports/ParentReportMessage";
import { TeacherCommentField } from "@/components/reports/TeacherCommentField";

interface StudentReportViewProps {
  report: StudentReport;
  teacherComment: string;
  onTeacherCommentChange: (value: string) => void;
}

function boolBadge(done: boolean, doneLabel = "완료", todoLabel = "미완료") {
  return (
    <Badge variant={done ? "success" : "neutral"}>
      {done ? doneLabel : todoLabel}
    </Badge>
  );
}

export function StudentReportView({
  report,
  teacherComment,
  onTeacherCommentChange,
}: StudentReportViewProps) {
  const generatedLabel = formatLastStudiedDate(report.generatedAt);

  return (
    <div className="space-y-6 print:space-y-4" id="student-report-print">
      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">학생 정보</h2>
        <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-slate-500">이름</dt>
            <dd className="font-medium text-slate-900">{report.student.name}</dd>
          </div>
          <div>
            <dt className="text-slate-500">아이디</dt>
            <dd className="font-medium text-slate-900">
              {report.student.loginId ?? "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">소속 반</dt>
            <dd className="font-medium text-slate-900">
              {report.student.classNames.length > 0
                ? report.student.classNames.join(", ")
                : "—"}
            </dd>
          </div>
          <div>
            <dt className="text-slate-500">리포트 기간</dt>
            <dd className="font-medium text-slate-900">{report.rangeLabel}</dd>
          </div>
          <div className="sm:col-span-2">
            <dt className="text-slate-500">리포트 생성일</dt>
            <dd className="font-medium text-slate-900">{generatedLabel}</dd>
          </div>
        </dl>
      </section>

      <section className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
        <h2 className="text-base font-semibold text-slate-900">종합 요약</h2>
        <ul className="mt-3 list-inside list-disc space-y-1 text-sm text-slate-700">
          <li>{report.summary.videoLine}</li>
          <li>{report.summary.vocabLine}</li>
          <li>{report.summary.reviewLine}</li>
        </ul>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">영상 강좌 학습 현황</h2>
        {report.courses.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">배정된 강좌가 없습니다.</p>
        ) : (
          <div className="mt-4 space-y-6">
            {report.courses.map((course) => (
              <article
                key={course.courseId}
                className="rounded-xl border border-slate-100 bg-slate-50/50 p-4"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold text-slate-900">{course.courseTitle}</h3>
                  <Badge variant="brand">
                    {course.completedLessons}/{course.totalLessons}강
                  </Badge>
                </div>
                <div className="mt-3">
                  <ProgressBar
                    percent={course.progressPercent}
                    label={`진도율 ${course.progressPercent}%`}
                    size="sm"
                  />
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  최근 학습일 ({report.rangeLabel}):{" "}
                  {formatLastStudiedDate(course.lastStudiedAt)}
                </p>
                <div className="mt-4 grid gap-4 md:grid-cols-2">
                  <div>
                    <p className="text-xs font-semibold text-emerald-700">
                      완료한 영상 ({course.completedLessonsList.length})
                    </p>
                    {course.completedLessonsList.length === 0 ? (
                      <p className="mt-1 text-sm text-slate-500">없음</p>
                    ) : (
                      <ul className="mt-1 max-h-40 overflow-y-auto text-sm text-slate-700">
                        {course.completedLessonsList.map((title) => (
                          <li key={title}>· {title}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-amber-700">
                      미완료 영상 ({course.incompleteLessonsList.length})
                    </p>
                    {course.incompleteLessonsList.length === 0 ? (
                      <p className="mt-1 text-sm text-slate-500">없음</p>
                    ) : (
                      <ul className="mt-1 max-h-40 overflow-y-auto text-sm text-slate-700">
                        {course.incompleteLessonsList.map((title) => (
                          <li key={title}>· {title}</li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">단어학습 현황</h2>
        {report.vocabSets.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">배정된 단어장이 없습니다.</p>
        ) : (
          <div className="ui-table-wrap mt-4">
            <table className="ui-table min-w-[640px]">
              <thead>
                <tr>
                  <th>단어장</th>
                  <th>단어 수</th>
                  <th>1단계</th>
                  <th>2단계</th>
                  <th>3단계</th>
                  <th>4단계</th>
                  <th>최근 점수</th>
                  <th>최고 점수</th>
                  <th>응시</th>
                  <th>최근 학습일</th>
                </tr>
              </thead>
              <tbody>
                {report.vocabSets.map((set) => (
                  <tr key={set.setId}>
                    <td className="font-medium">{set.setTitle}</td>
                    <td>{set.itemCount}</td>
                    <td>{boolBadge(set.stage1Completed)}</td>
                    <td>{boolBadge(set.stage2Completed)}</td>
                    <td>{boolBadge(set.stage3Completed)}</td>
                    <td>
                      {set.stage4Passed ? (
                        <Badge variant="success">합격</Badge>
                      ) : set.stage4AttemptCount > 0 ? (
                        <Badge variant="danger">불합격</Badge>
                      ) : (
                        <Badge variant="warning">미응시</Badge>
                      )}
                    </td>
                    <td>
                      {set.stage4AttemptCount > 0 ? `${set.stage4LastScore}점` : "—"}
                    </td>
                    <td>
                      {set.stage4BestScore > 0 ? `${set.stage4BestScore}점` : "—"}
                    </td>
                    <td>{set.stage4AttemptCount}</td>
                    <td>{formatLastStudiedDate(set.lastStudiedAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <h2 className="text-base font-semibold text-slate-900">복습 필요 단어</h2>
        {report.reviewWords.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">
            {report.rangeLabel} 기준 복습이 필요한 단어가 없습니다.
          </p>
        ) : (
          <div className="ui-table-wrap mt-4">
            <table className="ui-table min-w-[520px]">
              <thead>
                <tr>
                  <th>단어</th>
                  <th>뜻</th>
                  <th>오답 단계</th>
                  <th>오답 횟수</th>
                </tr>
              </thead>
              <tbody>
                {report.reviewWords.map((row) => (
                  <tr key={row.itemId}>
                    <td className="font-medium">{row.word}</td>
                    <td>{row.meaning}</td>
                    <td className="text-sm">{row.stages.join(", ")}</td>
                    <td>{row.wrongCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>

      <div className="print:hidden">
        <TeacherCommentField
          value={teacherComment}
          onChange={onTeacherCommentChange}
        />
      </div>

      <ParentReportMessage report={report} teacherComment={teacherComment} />
    </div>
  );
}
