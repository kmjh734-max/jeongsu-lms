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
  students: PickerStudent[];
}

/**
 * 반을 먼저 고르고 그 반 학생을 고른다.
 * 어느 반에도 없는 학생은 맨 뒤 '반 없음' 칸에 모인다.
 */
export function StudyPlanPicker({
  classes,
  selectedClassId,
  selectedStudentId,
  href,
}: {
  classes: PickerClass[];
  selectedClassId: string;
  selectedStudentId: string;
  /** 반·학생을 바꿨을 때 갈 주소 */
  href: (opts: { classId: string; studentId: string }) => string;
}) {
  const current = classes.find((c) => c.id === selectedClassId) ?? classes[0] ?? null;

  return (
    <div className="mb-4 flex flex-col gap-3 rounded-2xl border border-slate-200 bg-white p-4">
      <div className="flex flex-col gap-1.5">
        <span className="text-xs font-semibold text-slate-500">반 고르기</span>
        <div className="flex flex-wrap gap-1.5">
          {classes.map((c) => {
            const on = c.id === (current?.id ?? "");
            return (
              <Link
                key={c.id || "none"}
                href={href({ classId: c.id, studentId: c.students[0]?.id ?? "" })}
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
          {classes.length === 0 ? <span className="text-sm text-slate-500">아직 반이 없어요.</span> : null}
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
                  href={href({ classId: current.id, studentId: s.id })}
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
