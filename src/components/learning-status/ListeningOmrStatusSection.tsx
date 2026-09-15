"use client";

import { Fragment, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import type { ListeningOmrStudentSummary } from "@/lib/learning-status/types";

function scoreTone(score: number): string {
  if (score >= 80) return "bg-green-50 text-green-700";
  if (score >= 60) return "bg-amber-50 text-amber-700";
  return "bg-rose-50 text-rose-700";
}

function ScorePill({ score }: { score: number | null }) {
  if (score === null) return <span className="text-slate-400">—</span>;
  return (
    <span
      className={`inline-flex min-w-[2.5rem] justify-center rounded px-2 py-0.5 text-xs font-bold tabular-nums ${scoreTone(score)}`}
    >
      {score}
    </span>
  );
}

interface ListeningOmrStatusSectionProps {
  omrByStudent: ListeningOmrStudentSummary[];
  loading?: boolean;
}

/** QR로 낸 시험(OMR) 결과 — 학생마다 한 줄, 누르면 응시 기록 */
export function ListeningOmrStatusSection({
  omrByStudent,
  loading,
}: ListeningOmrStatusSectionProps) {
  const [openId, setOpenId] = useState<string | null>(null);

  return (
    <section className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-card">
      <div className="flex items-baseline justify-between gap-3 border-b border-slate-100 px-4 py-3">
        <div className="flex items-baseline gap-2">
          <h2 className="text-sm font-bold text-slate-900">OMR 시험</h2>
          <span className="text-xs text-slate-500">QR로 답안을 낸 시험 결과예요</span>
        </div>
        {omrByStudent.length > 0 ? (
          <span className="text-xs tabular-nums text-slate-500">{omrByStudent.length}명</span>
        ) : null}
      </div>

      {loading && omrByStudent.length === 0 ? (
        <div className="m-4 h-16 animate-pulse rounded bg-slate-100" />
      ) : omrByStudent.length === 0 ? (
        <p className="px-4 py-8 text-center text-sm text-slate-500">이 달에 낸 OMR 시험이 없어요.</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-left text-[13px]">
            <thead>
              <tr className="bg-slate-50 text-xs font-semibold text-slate-500">
                <th className="px-4 py-2">학생</th>
                <th className="px-3 py-2">반</th>
                <th className="px-3 py-2 text-center">응시</th>
                <th className="px-3 py-2 text-center">최근</th>
                <th className="px-3 py-2 text-center">최고</th>
                <th className="px-3 py-2">최근 시험지</th>
                <th className="w-8 px-2 py-2" />
              </tr>
            </thead>
            <tbody>
              {omrByStudent.map((student) => {
                const open = openId === student.studentId;
                const latest = student.attempts[0];
                return (
                  <Fragment key={student.studentId}>
                    <tr
                      className="cursor-pointer border-t border-slate-100 hover:bg-slate-50"
                      onClick={() => setOpenId(open ? null : student.studentId)}
                    >
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{student.studentName}</td>
                      <td className="px-3 py-2.5 text-slate-500">{student.classLabel}</td>
                      <td className="px-3 py-2.5 text-center tabular-nums text-slate-700">
                        {student.attemptCount}회
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <ScorePill score={student.latestScore} />
                      </td>
                      <td className="px-3 py-2.5 text-center">
                        <ScorePill score={student.bestScore} />
                      </td>
                      <td className="max-w-[16rem] truncate px-3 py-2.5 text-slate-700">
                        {latest ? `${latest.setTitle} · ${latest.examDate.slice(5).replace("-", "/")}` : "—"}
                      </td>
                      <td className="px-2 py-2.5 text-slate-400">
                        <button
                          type="button"
                          aria-expanded={open}
                          aria-label={`${student.studentName} 응시 기록 ${open ? "접기" : "펼치기"}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenId(open ? null : student.studentId);
                          }}
                          className="rounded p-0.5 hover:bg-slate-200/60"
                        >
                          <Icon name="down" size={16} className={`transition-transform ${open ? "rotate-180" : ""}`} />
                        </button>
                      </td>
                    </tr>
                    {open ? (
                      <tr className="bg-slate-50/60">
                        <td colSpan={7} className="px-4 pb-3 pt-1">
                          <ul className="divide-y divide-slate-100 rounded-md border border-slate-200 bg-white">
                            {student.attempts.map((attempt, index) => (
                              <li
                                key={`${attempt.setId}-${attempt.examDate}-${index}`}
                                className="flex items-center gap-3 px-3 py-2"
                              >
                                <span className="w-20 shrink-0 tabular-nums text-slate-500">
                                  {attempt.examDate}
                                </span>
                                <span className="min-w-0 flex-1 truncate text-slate-800">{attempt.setTitle}</span>
                                <span className="shrink-0 tabular-nums text-slate-500">
                                  {attempt.correctCount}/{attempt.totalCount}
                                </span>
                                <ScorePill score={attempt.score} />
                              </li>
                            ))}
                          </ul>
                        </td>
                      </tr>
                    ) : null}
                  </Fragment>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
