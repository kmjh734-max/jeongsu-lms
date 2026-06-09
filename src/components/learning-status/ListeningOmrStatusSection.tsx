import type { ListeningOmrStudentSummary } from "@/lib/learning-status/types";

function scoreTone(score: number): string {
  if (score >= 80) return "text-emerald-700 bg-emerald-50";
  if (score >= 60) return "text-amber-800 bg-amber-50";
  return "text-red-700 bg-red-50";
}

interface ListeningOmrStatusSectionProps {
  omrByStudent: ListeningOmrStudentSummary[];
  loading?: boolean;
}

export function ListeningOmrStatusSection({
  omrByStudent,
  loading,
}: ListeningOmrStatusSectionProps) {
  return (
    <section className="space-y-4 rounded-xl border border-indigo-200 bg-white p-4 shadow-sm">
      <div>
        <h2 className="text-lg font-bold text-slate-900">OMR 시험 현황</h2>
        <p className="mt-1 text-sm text-slate-600">
          학생별 QR 답안 제출·채점 결과입니다. 숙제 현황과 별도로 표시됩니다.
        </p>
      </div>

      {loading && omrByStudent.length === 0 ? (
        <div className="h-24 animate-pulse rounded-lg bg-slate-100" />
      ) : omrByStudent.length === 0 ? (
        <p className="rounded-lg border border-dashed border-slate-200 bg-slate-50 px-4 py-8 text-center text-sm text-slate-500">
          이번 달 OMR 시험 제출 기록이 없습니다.
        </p>
      ) : (
        <div className="space-y-4">
          {omrByStudent.map((student) => (
            <article
              key={student.studentId}
              className="overflow-hidden rounded-xl border border-indigo-100 bg-indigo-50/20"
            >
              <header className="flex flex-wrap items-center justify-between gap-2 border-b border-indigo-100 bg-white px-4 py-3">
                <div>
                  <p className="font-bold text-slate-900">{student.studentName}</p>
                  <p className="text-xs text-slate-500">{student.classLabel}</p>
                </div>
                <div className="flex flex-wrap items-center gap-2 text-xs">
                  <span className="rounded-full bg-indigo-100 px-2.5 py-1 font-semibold text-indigo-800">
                    {student.attemptCount}회 응시
                  </span>
                  <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-slate-700 ring-1 ring-slate-200">
                    최근 {student.latestScore}점
                  </span>
                  {student.bestScore != null &&
                    student.bestScore !== student.latestScore && (
                      <span className="rounded-full bg-white px-2.5 py-1 font-semibold text-emerald-700 ring-1 ring-emerald-100">
                        최고 {student.bestScore}점
                      </span>
                    )}
                </div>
              </header>

              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-sm">
                  <thead>
                    <tr className="bg-indigo-50/60 text-xs font-semibold text-indigo-900">
                      <th className="px-4 py-2">응시일</th>
                      <th className="px-4 py-2">시험지</th>
                      <th className="px-4 py-2 text-center">점수</th>
                      <th className="px-4 py-2 text-center">정답</th>
                    </tr>
                  </thead>
                  <tbody>
                    {student.attempts.map((attempt, index) => (
                      <tr
                        key={`${attempt.setId}-${attempt.examDate}-${index}`}
                        className="border-t border-indigo-100/80 bg-white"
                      >
                        <td className="px-4 py-2.5 whitespace-nowrap text-slate-700">
                          {attempt.examDate}
                        </td>
                        <td className="px-4 py-2.5 text-slate-800">
                          {attempt.setTitle}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span
                            className={`inline-flex min-w-[3rem] justify-center rounded-full px-2.5 py-0.5 text-sm font-bold tabular-nums ${scoreTone(attempt.score)}`}
                          >
                            {attempt.score}
                          </span>
                        </td>
                        <td className="px-4 py-2.5 text-center tabular-nums text-slate-700">
                          {attempt.correctCount}/{attempt.totalCount}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
