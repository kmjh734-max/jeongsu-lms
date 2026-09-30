import type { StudyPlanReportSession } from "@/lib/reports/study-plan-section";

/**
 * 학습일정표 회차별 내용.
 *
 * 선생님 요청(2026-09-30): 학부모 리포트에도 회차별 내용이 전부 나오게 해 달라.
 * 영역별 한 줄 요약만으로는 어느 날 무엇을 했는지 알 수 없었다.
 *
 * 학부모 화면과 인쇄물이 어긋나지 않게 한 군데서 그린다. 인쇄는 글씨만 작게 한다.
 */
export function StudyPlanSessions({
  sessions,
  print = false,
}: {
  sessions: StudyPlanReportSession[];
  /** A4 인쇄용 — 글씨와 여백을 줄인다 */
  print?: boolean;
}) {
  if (sessions.length === 0) return null;

  const date = print ? "text-[10px]" : "text-[12px]";
  const area = print ? "text-[10px]" : "text-[11px]";
  const body = print ? "text-[10px] leading-4" : "text-[12.5px] leading-snug";
  const gap = print ? "py-1" : "py-2";

  return (
    <ul className="mt-2">
      {sessions.map((s) => (
        <li
          key={s.date}
          className={`flex gap-2.5 border-t border-slate-200 ${gap} first:border-t-0`}
        >
          <span className={`w-[4.6rem] shrink-0 font-bold text-slate-500 ${date}`}>
            <span className="block tabular-nums">{s.label}</span>
            {s.attendance ? (
              <span className="mt-0.5 block font-semibold text-slate-400">{s.attendance}</span>
            ) : null}
          </span>
          <span className="min-w-0 flex-1">
            {s.areas.length === 0 ? (
              <span className={`text-slate-400 ${body}`}>적어 둔 진도가 없습니다.</span>
            ) : (
              s.areas.map((a, i) => (
                <span key={`${a.area}-${i}`} className="mt-1 block first:mt-0">
                  <span className={`font-bold text-slate-500 ${area}`}>{a.area}</span>
                  {a.check ? (
                    <span
                      className={`ml-1.5 rounded-full px-1.5 py-0.5 font-semibold ${area} ${
                        a.check === "완료"
                          ? "bg-emerald-50 text-emerald-700"
                          : a.check === "미흡"
                            ? "bg-amber-50 text-amber-700"
                            : "bg-rose-50 text-rose-700"
                      }`}
                    >
                      {a.check}
                    </span>
                  ) : null}
                  {a.progress ? (
                    <span className={`ml-1.5 text-slate-800 ${body}`}>{a.progress}</span>
                  ) : null}
                  {a.homework ? (
                    <span className={`block text-brand-700 ${body}`}>숙제: {a.homework}</span>
                  ) : null}
                  {a.note ? (
                    <span className={`block text-slate-500 ${body}`}>{a.note}</span>
                  ) : null}
                </span>
              ))
            )}
          </span>
        </li>
      ))}
    </ul>
  );
}
