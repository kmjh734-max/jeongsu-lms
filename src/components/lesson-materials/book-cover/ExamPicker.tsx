"use client";

import { BOOK_COVER_EXAMS, BOOK_COVER_SEMESTERS, suggestedExam } from "@/lib/lesson-materials/book-cover";

/**
 * 내신 표지의 시험 · 학기 고르기. 자료에는 중간 · 기말 정보가 없어서(지문 출처는 교과서 · 과뿐) 라벨에서 읽거나
 * 여기서 고른다. 오늘 날짜로 짐작한 시험은 「추천」으로만 보이고 넣지는 않는다 — 학교마다 일정이 달라
 * 틀린 시험이 표지에 찍히면 안 된다.
 */
export function ExamPicker({
  exam,
  semester,
  onPick,
}: {
  exam: string;
  semester: string;
  onPick: (patch: { exam?: string; semester?: string }) => void;
}) {
  const hint = suggestedExam();
  const examOn = (e: string) => exam.replace(/\s+/g, "").includes(e.slice(0, 2));
  const chip = (on: boolean) =>
    `rounded-full border px-2.5 py-1 text-[11.5px] font-bold transition ${
      on ? "border-violet-600 bg-violet-600 text-white" : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
    }`;
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold text-slate-500">시험 · 학기</p>
      <div className="flex flex-wrap gap-1.5">
        {BOOK_COVER_EXAMS.map((e) => (
          <button key={e} type="button" className={chip(examOn(e))} aria-pressed={examOn(e)} onClick={() => onPick({ exam: e })}>
            {e}
            {!exam.trim() && hint.exam === e ? <span className="ml-1 text-[10px] font-semibold text-violet-500">추천</span> : null}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {BOOK_COVER_SEMESTERS.map((sm) => (
          <button key={sm} type="button" className={chip(semester.trim() === sm)} aria-pressed={semester.trim() === sm} onClick={() => onPick({ semester: sm })}>
            {sm}
            {!semester.trim() && hint.semester === sm ? <span className="ml-1 text-[10px] font-semibold text-violet-500">추천</span> : null}
          </button>
        ))}
      </div>
      {!exam.trim() ? (
        <p className="rounded-md bg-amber-50 px-2 py-1.5 text-[11px] leading-snug text-amber-800">
          라벨에 시험 이름이 없어 표지에 「Exam」으로 나갑니다. 위에서 시험을 고르세요.
        </p>
      ) : null}
    </div>
  );
}
