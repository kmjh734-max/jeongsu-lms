import Link from "next/link";

export interface PickerStudent {
  id: string;
  name: string;
  school: string | null;
}

export interface PickerClass {
  /** 반 없음 칸은 "" */
  id: string;
  name: string;
  /** "월수금 17:00~19:00" 같은 한 줄 */
  time: string | null;
  /** 담당 선생님 — 없으면 "" (담당 없음) */
  teacherId: string;
  students: PickerStudent[];
}

export interface PickerTeacher {
  /** 담당 없음 칸은 "" */
  id: string;
  name: string;
}

/**
 * 선생님 → 반 → 학생 차례로 고른다.
 * 담당 선생님이 없는 반과, 어느 반에도 없는 학생은 맨 뒤 칸에 모인다.
 */
export function StudyPlanPicker({
  teachers,
  classes,
  selectedTeacherId,
  selectedClassId,
  selectedStudentId,
  href,
}: {
  teachers: PickerTeacher[];
  classes: PickerClass[];
  selectedTeacherId: string;
  selectedClassId: string;
  selectedStudentId: string;
  /** 선생님·반·학생을 바꿨을 때 갈 주소 */
  href: (opts: { teacherId: string; classId: string; studentId: string }) => string;
}) {
  const mine = classes.filter((c) => c.teacherId === selectedTeacherId);
  const current = mine.find((c) => c.id === selectedClassId) ?? mine[0] ?? null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-slate-500">선생님 고르기</span>
        <div className="flex flex-wrap gap-1.5">
          {teachers.map((t) => {
            const on = t.id === selectedTeacherId;
            const first = classes.find((c) => c.teacherId === t.id);
            return (
              <Link
                key={t.id || "none"}
                href={href({
                  teacherId: t.id,
                  classId: first?.id ?? "",
                  studentId: first?.students[0]?.id ?? "",
                })}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                  on
                    ? "border-slate-900 bg-slate-900 text-white"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {t.name}
                <span className={`ml-1.5 text-xs font-medium ${on ? "text-slate-300" : "text-slate-400"}`}>
                  반 {classes.filter((c) => c.teacherId === t.id).length}개
                </span>
              </Link>
            );
          })}
          {teachers.length === 0 ? <span className="text-sm text-slate-500">아직 반이 없어요.</span> : null}
        </div>
      </div>

      <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
        <span className="text-xs font-semibold text-slate-500">반 고르기</span>
        <div className="flex flex-wrap gap-1.5">
          {mine.map((c) => {
            const on = c.id === (current?.id ?? "");
            return (
              <Link
                key={c.id || "none"}
                href={href({
                  teacherId: selectedTeacherId,
                  classId: c.id,
                  studentId: c.students[0]?.id ?? "",
                })}
                className={`rounded-lg border px-3 py-1.5 text-sm font-semibold transition ${
                  on
                    ? "border-brand-600 bg-brand-50 text-brand-700"
                    : "border-slate-200 text-slate-600 hover:bg-slate-50"
                }`}
              >
                {c.name}
                <span className={`ml-1.5 text-xs font-medium ${on ? "text-brand-600" : "text-slate-400"}`}>
                  {c.students.length}명
                </span>
              </Link>
            );
          })}
          {mine.length === 0 ? (
            <span className="text-sm text-slate-500">이 선생님이 맡은 반이 없어요.</span>
          ) : null}
        </div>
      </div>

      {current ? (
        <div className="flex flex-col gap-1.5 border-t border-slate-100 pt-3">
          <span className="text-xs font-semibold text-slate-500">
            {current.name}
            {current.time ? <span className="ml-1.5 font-medium text-slate-400">{current.time}</span> : null}
          </span>
          <div className="flex flex-wrap gap-1.5">
            {current.students.map((s) => {
              const on = s.id === selectedStudentId;
              return (
                <Link
                  key={s.id}
                  href={href({ teacherId: selectedTeacherId, classId: current.id, studentId: s.id })}
                  className={`rounded-lg border px-3 py-1.5 text-sm transition ${
                    on
                      ? "border-slate-900 bg-slate-900 font-semibold text-white"
                      : "border-slate-200 text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  {s.name}
                  {s.school ? (
                    <span className={`ml-1.5 text-xs ${on ? "text-slate-300" : "text-slate-400"}`}>{s.school}</span>
                  ) : null}
                </Link>
              );
            })}
            {current.students.length === 0 ? (
              <span className="text-sm text-slate-500">이 반에 학생이 없어요.</span>
            ) : null}
          </div>
        </div>
      ) : null}
    </div>
  );
}
