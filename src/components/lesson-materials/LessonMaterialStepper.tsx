"use client";

const STEPS = [
  { no: 1, label: "자료 입력하기" },
  { no: 2, label: "자료 정리하기" },
  { no: 3, label: "자료 저장하기" },
] as const;

export function LessonMaterialStepper({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className="mx-auto flex max-w-2xl items-center justify-center gap-2 sm:gap-4">
      {STEPS.map((step, index) => {
        const done = step.no < current;
        const active = step.no === current;
        return (
          <li key={step.no} className="flex items-center gap-2 sm:gap-4">
            <div className="flex items-center gap-2">
              <span
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  active
                    ? "bg-brand-600 text-white"
                    : done
                      ? "bg-brand-100 text-brand-700"
                      : "bg-slate-200 text-slate-500"
                }`}
              >
                {step.no}
              </span>
              <span
                className={`hidden text-sm font-medium sm:inline ${
                  active ? "text-brand-700" : "text-slate-500"
                }`}
              >
                {step.label}
              </span>
            </div>
            {index < STEPS.length - 1 ? (
              <span className="hidden h-px w-8 bg-slate-200 sm:block lg:w-16" />
            ) : null}
          </li>
        );
      })}
    </ol>
  );
}
