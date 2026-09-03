"use client";

const STEPS = [
  { no: 1, label: "자료 입력하기" },
  { no: 2, label: "자료 정리하기" },
  { no: 3, label: "자료 저장하기" },
] as const;

export function LessonMaterialsStepTop({
  current,
}: {
  current: 1 | 2 | 3;
}) {
  return (
    <div className="mx-auto mb-8 max-w-5xl px-4">
      <div className="flex items-center justify-between">
        {STEPS.map((s, idx) => {
          const done = s.no < current;
          const active = s.no === current;
          return (
            <div key={s.no} className="flex flex-1 items-center">
              <div className="flex items-center gap-2">
                <div
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                    active
                      ? "bg-brand-600 text-white"
                      : done
                        ? "bg-brand-100 text-brand-700"
                        : "bg-slate-200 text-slate-500"
                  }`}
                >
                  {s.no}
                </div>
                <div
                  className={`hidden text-sm font-medium sm:block ${
                    active ? "text-brand-700" : done ? "text-brand-700" : "text-slate-500"
                  }`}
                >
                  {s.label}
                </div>
              </div>
              {idx < STEPS.length - 1 ? (
                <div className="mx-3 h-px flex-1 bg-slate-200 sm:mx-4" />
              ) : null}
            </div>
          );
        })}
      </div>
    </div>
  );
}

