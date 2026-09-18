import type { ReportOverview } from "@/lib/reports/types";

/**
 * 리포트 맨 위 "한눈에 보기" — 기간 안에 실제로 한 학습을 숫자와 학습 달력으로 보여 준다.
 * 선생님 화면·A4 인쇄·학부모 링크가 함께 쓴다(인쇄에서도 색이 나오게 배경색을 직접 준다).
 */

const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

/** 월요일=0 … 일요일=6 */
function weekdayIndex(ymd: string): number {
  return (new Date(`${ymd}T00:00:00Z`).getUTCDay() + 6) % 7;
}

function cellColor(count: number): string {
  if (count <= 0) return "#f1f5f9";
  if (count <= 2) return "#bfdbfe";
  if (count <= 6) return "#60a5fa";
  return "#1d4ed8";
}

function Kpi({
  label,
  value,
  unit,
  sub,
  accent,
}: {
  label: string;
  value: string;
  unit?: string;
  sub?: string;
  accent: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 bg-white px-3 py-2.5" style={{ borderTop: `3px solid ${accent}` }}>
      <p className="text-[11px] font-semibold text-slate-500">{label}</p>
      <p className="mt-0.5 text-[22px] font-extrabold leading-tight tabular-nums tracking-tight text-slate-900">
        {value}
        {unit ? <span className="ml-0.5 text-xs font-semibold text-slate-500">{unit}</span> : null}
      </p>
      {sub ? <p className="mt-0.5 truncate text-[11px] tabular-nums text-slate-400">{sub}</p> : null}
    </div>
  );
}

function Bar({ label, done, total, color }: { label: string; done: number; total: number; color: string }) {
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;
  return (
    <div>
      <div className="flex items-baseline justify-between text-[11px]">
        <span className="font-semibold text-slate-600">{label}</span>
        <span className="tabular-nums text-slate-500">
          {total > 0 ? `${done}/${total} · ${pct}%` : "기록 없음"}
        </span>
      </div>
      <div className="mt-1 h-2 overflow-hidden rounded-full" style={{ background: "#e2e8f0" }}>
        <div className="h-full rounded-full" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export function ReportOverviewPanel({
  overview,
  print = false,
}: {
  overview: ReportOverview;
  /** A4 인쇄: 화면 폭과 상관없이 5칸·2단으로 */
  print?: boolean;
}) {
  const { vocab, listening, video } = overview;

  // 달력: 시작 주 월요일부터 끝 주 일요일까지
  const first = addDays(overview.calendarStart, -weekdayIndex(overview.calendarStart));
  const last = addDays(overview.calendarEnd, 6 - weekdayIndex(overview.calendarEnd));
  const days: string[] = [];
  for (let d = first; d <= last && days.length < 7 * 7; d = addDays(d, 1)) days.push(d);
  const periodDays = days.filter((d) => d >= overview.calendarStart && d <= overview.calendarEnd).length;

  return (
    <div className="space-y-3" style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
      <div className={print ? "grid grid-cols-5 gap-2" : "grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-5"}>
        <Kpi
          label="학습한 날"
          value={String(overview.activeDays)}
          unit="일"
          sub={periodDays ? `기간 ${periodDays}일 중` : undefined}
          accent="#2563eb"
        />
        <Kpi
          label="단어 합격"
          value={vocab.setsStudied ? `${vocab.setsPassed}/${vocab.setsStudied}` : "—"}
          unit={vocab.setsStudied ? "세트" : undefined}
          sub={vocab.avgScore != null ? `종합테스트 평균 ${vocab.avgScore}점` : "종합테스트 전"}
          accent="#16a34a"
        />
        <Kpi
          label="듣기 시험"
          value={listening.examAvg != null ? String(listening.examAvg) : "—"}
          unit={listening.examAvg != null ? "점" : undefined}
          sub={listening.examSets ? `${listening.examSets}회 응시 · 최고점 평균` : "응시 기록 없음"}
          accent="#9333ea"
        />
        <Kpi
          label="받아쓰기 통과"
          value={
            listening.dictationTotal
              ? `${listening.dictationPassed ?? 0}/${listening.dictationTotal}`
              : listening.dictationRate != null
                ? `${listening.dictationRate}%`
                : "—"
          }
          unit={listening.dictationTotal ? "문항" : undefined}
          sub={listening.dictationRate != null ? "받아쓰기한 회차의 전체 문항 중" : "기록 없음"}
          accent="#ea580c"
        />
        <Kpi
          label="영상 강의"
          value={String(video.lessonsDone)}
          unit="강 완료"
          sub={video.courses ? `${video.courses}개 강좌` : "기록 없음"}
          accent="#0891b2"
        />
      </div>

      <div className={`grid gap-3 ${print ? "grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]" : "md:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]"}`}>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <div className="flex items-baseline justify-between">
            <p className="text-xs font-bold text-slate-800">학습 달력</p>
            <p className="flex items-center gap-1 text-[10px] text-slate-400">
              적음
              {[0, 1, 3, 7].map((n) => (
                <span key={n} className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: cellColor(n) }} />
              ))}
              많음
            </p>
          </div>
          <div className="mt-2 grid grid-cols-7 gap-1">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-center text-[10px] font-semibold text-slate-400">
                {w}
              </span>
            ))}
            {days.map((d) => {
              const inside = d >= overview.calendarStart && d <= overview.calendarEnd;
              const count = overview.activity[d] ?? 0;
              return (
                <span
                  key={d}
                  title={inside ? `${d} · 학습 기록 ${count}개` : undefined}
                  className="flex aspect-square items-center justify-center rounded text-[10px] tabular-nums"
                  style={{
                    background: inside ? cellColor(count) : "transparent",
                    color: count > 6 ? "#fff" : inside ? "#475569" : "#cbd5e1",
                  }}
                >
                  {Number(d.slice(8))}
                </span>
              );
            })}
          </div>
        </div>

        <div className="flex flex-col justify-center gap-3 rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-xs font-bold text-slate-800">영역별 진행</p>
          <Bar label="단어 4단계 진행" done={vocab.stagesDone} total={vocab.stagesTotal} color="#16a34a" />
          <Bar label="듣기 매일 과제" done={listening.tasksDone} total={listening.tasksTotal} color="#9333ea" />
          <Bar
            label="단어 세트 합격"
            done={vocab.setsPassed}
            total={vocab.setsStudied}
            color="#2563eb"
          />
        </div>
      </div>
    </div>
  );
}
