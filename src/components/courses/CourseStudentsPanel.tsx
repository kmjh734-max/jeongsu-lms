"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CourseAssignModal } from "@/components/courses/CourseAssignModal";
import { Icon } from "@/components/layout/NavIcon";

type Student = { id: string; name: string | null; username: string | null };

/**
 * 강좌 상세의 수강생 칸.
 * 선생님 요청(2026-09-28): 「배정하기」가 반 관리로 보내지 말고, 이 자리에서 바로 고르게.
 */
export function CourseStudentsPanel({
  courseId,
  courseTitle,
  students,
  canAssign,
}: {
  courseId: string;
  courseTitle: string;
  students: Student[];
  /** 보관·휴지통 강좌는 새로 배정할 수 없다 */
  canAssign: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-baseline justify-between gap-2">
        <h2 className="text-sm font-bold text-slate-900">수강생 {students.length}명</h2>
        {canAssign ? (
          <button
            type="button"
            onClick={() => setOpen(true)}
            className="flex items-center gap-1 text-xs font-semibold text-brand-700 hover:underline"
          >
            <Icon name="plus" size={13} strokeWidth={2.4} />
            배정하기
          </button>
        ) : null}
      </div>

      {students.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-3 py-4 text-center text-xs text-slate-500">
          {canAssign
            ? "아직 배정된 학생이 없어요. 위 ‘배정하기’로 반이나 학생을 고르세요."
            : "아직 배정된 학생이 없어요."}
        </p>
      ) : (
        <ul className="flex flex-wrap gap-1.5">
          {students.map((s) => (
            <li
              key={s.id}
              className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700"
            >
              {s.name ?? s.username ?? "학생"}
            </li>
          ))}
        </ul>
      )}

      {!canAssign ? (
        <p className="mt-2 text-[11px] leading-snug text-slate-400">
          보관하거나 휴지통에 넣은 강좌는 새로 배정할 수 없어요. 듣던 학생은 그대로 봅니다.
        </p>
      ) : null}

      <CourseAssignModal
        open={open}
        onClose={() => setOpen(false)}
        courseId={courseId}
        courseTitle={courseTitle}
        onChanged={() => router.refresh()}
      />
    </section>
  );
}
