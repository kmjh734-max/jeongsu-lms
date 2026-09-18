import type { StudentReport } from "@/lib/reports/types";

/**
 * 학습 리포트 A안(대시보드형) — 선생님 화면과 A4 인쇄가 함께 쓴다.
 * 남색 머리글 · 다섯 가지 수치 동그라미 · 학습 달력 · 주차별 점수 · 과목 카드 · 선생님 한마디 · 복습 단어.
 * 인쇄에서도 색이 나오도록 색은 style로 직접 준다.
 */

const NAVY = "#13294b";
const GREEN = "#16a34a";
const PURPLE = "#7c3aed";
const ORANGE = "#ea580c";
const CYAN = "#0891b2";
const BLUE = "#2563eb";
const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function weekdayIndex(ymd: string): number {
  return (new Date(`${ymd}T00:00:00Z`).getUTCDay() + 6) % 7;
}

/** 지난 기간 대비 문구(바뀐 것만) */
export function compareLines(o: NonNullable<StudentReport["overview"]>): Array<{ text: string; up: boolean }> {
  const c = o.compare;
  if (!c) return [];
  const out: Array<{ text: string; up: boolean }> = [];
  const d = o.activeDays - c.activeDaysPrev;
  if (d !== 0) out.push({ text: `학습일 ${d > 0 ? "+" : ""}${d}일`, up: d > 0 });
  if (c.vocabNow != null && c.vocabPrev != null && c.vocabNow !== c.vocabPrev) {
    const v = c.vocabNow - c.vocabPrev;
    out.push({ text: `단어 시험 ${v > 0 ? "+" : ""}${v}점`, up: v > 0 });
  }
  if (c.listeningNow != null && c.listeningPrev != null && c.listeningNow !== c.listeningPrev) {
    const v = c.listeningNow - c.listeningPrev;
    out.push({ text: `듣기 시험 ${v > 0 ? "+" : ""}${v}점`, up: v > 0 });
  }
  return out;
}

/** 수업 요일(0=월 … 6=일). 반에 정해 두지 않았으면 월~금 */
export function classDaySet(o: NonNullable<StudentReport["overview"]>): Set<number> {
  return new Set(o.classWeekdays?.length ? o.classWeekdays : [0, 1, 2, 3, 4]);
}

function pct(done: number, total: number): number | null {
  return total > 0 ? Math.round((done / total) * 100) : null;
}
function md(iso: string | null | undefined): string {
  if (!iso) return "";
  const d = new Date(iso);
  return `${d.getMonth() + 1}. ${d.getDate()}`;
}

function Ring({ value, label, text, sub, color }: { value: number | null; label: string; text: string; sub: string; color: string }) {
  const C = 2 * Math.PI * 30;
  const v = Math.max(0, Math.min(100, value ?? 0));
  return (
    <div className="flex flex-col items-center gap-1 rounded-xl border border-slate-200 bg-white px-1.5 pb-2.5 pt-3">
      <svg width="74" height="74" viewBox="0 0 74 74" aria-hidden>
        <circle cx="37" cy="37" r="30" fill="none" stroke="#edf0f4" strokeWidth="8" />
        {value != null ? (
          <circle
            cx="37"
            cy="37"
            r="30"
            fill="none"
            stroke={color}
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={`${((C * v) / 100).toFixed(1)} ${C.toFixed(1)}`}
            transform="rotate(-90 37 37)"
          />
        ) : null}
        <text x="37" y="42" textAnchor="middle" fontSize="16" fontWeight="900" fill="#172033">
          {text}
        </text>
      </svg>
      <p className="text-[13px] font-bold text-slate-800">{label}</p>
      <p className="max-w-full truncate px-1 text-[11px] text-slate-500">{sub}</p>
    </div>
  );
}

function AreaCard({ title, big, unit, lines, tint, ink }: { title: string; big: string; unit: string; lines: string[]; tint: string; ink: string }) {
  return (
    <div className="flex flex-col gap-1.5 rounded-xl p-4" style={{ background: tint }}>
      <p className="text-[13px] font-extrabold" style={{ color: ink }}>
        {title}
      </p>
      <p className="text-[26px] font-black leading-tight text-slate-900">
        {big}
        <span className="ml-1 text-[13px] font-bold text-slate-500">{unit}</span>
      </p>
      <div className="text-xs leading-relaxed text-slate-600">
        {lines.map((l) => (
          <p key={l}>{l}</p>
        ))}
      </div>
    </div>
  );
}

export function ReportDashboard({
  report,
  comment,
  academyName,
  print = false,
}: {
  report: StudentReport;
  /** 선생님 한마디(학부모 안내문·리포트 글). 없으면 칸을 두지 않는다 */
  comment?: string;
  academyName?: string;
  /** A4: 화면 폭과 상관없이 5칸·2단 */
  print?: boolean;
}) {
  const o = report.overview;
  if (!o) return null;

  // ----- 달력: 학습함 / 빠진 날(평일) / 쉬는 날(주말) -----
  const first = addDays(o.calendarStart, -weekdayIndex(o.calendarStart));
  const last = addDays(o.calendarEnd, 6 - weekdayIndex(o.calendarEnd));
  const classDays_ = classDaySet(o);
  const cells: Array<{ ymd: string; state: "done" | "missed" | "off" | "out" }> = [];
  for (let d = first; d <= last && cells.length < 49; d = addDays(d, 1)) {
    const inside = d >= o.calendarStart && d <= o.calendarEnd;
    const studied = (o.activity[d] ?? 0) > 0;
    const noClass = !classDays_.has(weekdayIndex(d));
    cells.push({ ymd: d, state: !inside ? "out" : studied ? "done" : noClass ? "off" : "missed" });
  }
  const classDays = cells.filter((c) => c.state === "done" || c.state === "missed").length;
  const cellStyle = (s: string) =>
    s === "done"
      ? { background: GREEN, color: "#fff" }
      : s === "missed"
        ? { background: "#fde2e2", color: "#b91c1c" }
        : s === "off"
          ? { background: "#f1f3f6", color: "#9aa3b0" }
          : { background: "transparent", color: "transparent" };

  // ----- 수치 -----
  const lessonTotal = report.courses.reduce((s, c) => s + c.totalLessons, 0);
  const lessonDone = report.courses.reduce((s, c) => s + c.completedLessons, 0);
  const videoPct = pct(lessonDone, lessonTotal);
  const vocabPct = pct(o.vocab.setsPassed, o.vocab.setsStudied);
  const dictTotal = o.listening.dictationTotal ?? 0;
  const dictPassed = o.listening.dictationPassed ?? 0;
  const dayPct = pct(o.activeDays, Math.max(classDays, o.activeDays));

  const weeks = o.weeks ?? [];
  const hasWeekScores = weeks.some((w) => w.vocab != null || w.listening != null);
  const lastVideo = report.courses.map((c) => c.lastStudiedAt).filter(Boolean).sort().pop();
  const reviewWords = report.reviewWords.slice(0, 12);

  const periodText = `${report.rangeLabel} · ${o.calendarStart.replace(/-/g, ". ")} ~ ${o.calendarEnd.replace(/-/g, ". ")}`;

  return (
    <div
      className="overflow-hidden rounded-2xl border border-slate-200 bg-white"
      style={{ WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    >
      <div className="flex items-end justify-between gap-4 px-6 pb-5 pt-6 text-white sm:px-8" style={{ background: NAVY }}>
        <div className="min-w-0">
          <p className="text-[11px] font-bold tracking-[0.2em]" style={{ color: "#9fb4d6" }}>
            LEARNING REPORT
          </p>
          <p className="mt-1 truncate text-2xl font-black tracking-tight sm:text-[28px]">
            {report.student.name} 학생 학습 리포트
          </p>
          <p className="mt-1 truncate text-[13px]" style={{ color: "#c9d6ea" }}>
            {report.student.classNames.length ? `${report.student.classNames.join(", ")} · ` : ""}
            {periodText}
          </p>
        </div>
        {academyName ? (
          <p className="shrink-0 text-right text-[13px] font-semibold" style={{ color: "#c9d6ea" }}>
            {academyName}
          </p>
        ) : null}
      </div>

      <div className="space-y-4 p-5 sm:p-6">
        <div className={print ? "grid grid-cols-5 gap-2.5" : "grid grid-cols-2 gap-2.5 sm:grid-cols-3 lg:grid-cols-5"}>
          <Ring value={dayPct} label="학습한 날" text={`${o.activeDays}일`} sub={classDays ? `수업일 ${classDays}일 중` : "기록 없음"} color={BLUE} />
          <Ring
            value={vocabPct}
            label="단어 합격"
            text={vocabPct != null ? `${vocabPct}%` : "—"}
            sub={o.vocab.setsStudied ? `${o.vocab.setsStudied}세트 중 ${o.vocab.setsPassed}` : "기록 없음"}
            color={GREEN}
          />
          <Ring
            value={o.listening.examAvg}
            label="듣기 평균"
            text={o.listening.examAvg != null ? String(o.listening.examAvg) : "—"}
            sub={o.listening.examSets ? `${o.listening.examSets}회차 응시` : "기록 없음"}
            color={PURPLE}
          />
          <Ring
            value={pct(dictPassed, dictTotal)}
            label="받아쓰기"
            text={dictTotal ? `${pct(dictPassed, dictTotal)}%` : "—"}
            sub={dictTotal ? `${dictPassed}/${dictTotal}문항` : "기록 없음"}
            color={ORANGE}
          />
          <Ring
            value={videoPct}
            label="영상 진도"
            text={videoPct != null ? `${videoPct}%` : "—"}
            sub={lessonTotal ? `${lessonTotal}강 중 ${lessonDone}` : "기록 없음"}
            color={CYAN}
          />
        </div>

        {compareLines(o).length ? (
          <div className="flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">지난 기간보다</span>
            {compareLines(o).map((l) => (
              <span
                key={l.text}
                className="rounded-full px-2.5 py-1 font-bold"
                style={{ background: l.up ? "#dcfce7" : "#fee2e2", color: l.up ? "#166534" : "#b91c1c" }}
              >
                {l.up ? "▲" : "▼"} {l.text}
              </span>
            ))}
          </div>
        ) : null}

        <div className={`grid gap-4 ${print ? "grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]" : "md:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"}`}>
          <div className="rounded-xl border border-slate-200 p-4">
            <div className="flex items-baseline justify-between">
              <p className="text-sm font-extrabold text-slate-900">출석·학습 달력</p>
              <p className="text-[11px] text-slate-500">
                {classDays}일 중 <b style={{ color: "#15803d" }}>{o.activeDays}일</b> 학습
              </p>
            </div>
            <div className="mt-2.5 grid grid-cols-7 gap-1">
              {WEEKDAYS.map((w) => (
                <span key={w} className="text-center text-[10px] font-bold text-slate-400">
                  {w}
                </span>
              ))}
              {cells.map((c) => (
                <span
                  key={c.ymd}
                  title={c.state === "done" ? `${c.ymd} 학습함` : c.state === "missed" ? `${c.ymd} 빠진 날` : undefined}
                  className="flex h-7 items-center justify-center rounded-md text-[11px] font-bold tabular-nums"
                  style={cellStyle(c.state)}
                >
                  {c.state === "out" ? "" : Number(c.ymd.slice(8))}
                </span>
              ))}
            </div>
            <div className="mt-2.5 flex flex-wrap gap-3 text-[11px] text-slate-600">
              {[
                ["학습함", GREEN],
                ["빠진 날", "#fde2e2"],
                ["쉬는 날", "#f1f3f6"],
              ].map(([t, c]) => (
                <span key={t} className="flex items-center gap-1">
                  <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
                  {t}
                </span>
              ))}
            </div>
          </div>

          <div className="flex flex-col rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-extrabold text-slate-900">주차별 점수 변화</p>
            {hasWeekScores ? (
              <>
                <div className="mt-3 flex h-[150px] items-end gap-3 border-b border-slate-200 px-1">
                  {weeks.map((w) => (
                    <div key={w.label} className="flex flex-1 items-end justify-center gap-1">
                      {[
                        [w.vocab, GREEN],
                        [w.listening, PURPLE],
                      ].map(([v, c], i) => (
                        <div key={i} className="flex flex-col items-center gap-0.5">
                          {v != null ? <span className="text-[10px] font-bold text-slate-600">{v as number}</span> : null}
                          <span
                            className="block w-4 rounded-t"
                            style={{ height: `${Math.max(2, Math.round(((v as number | null) ?? 0) * 1.15))}px`, background: v != null ? (c as string) : "transparent" }}
                          />
                        </div>
                      ))}
                    </div>
                  ))}
                </div>
                <div className="mt-1 flex gap-3 px-1">
                  {weeks.map((w) => (
                    <span key={w.label} className="flex-1 text-center text-[11px] text-slate-500">
                      {w.label}
                    </span>
                  ))}
                </div>
                <div className="mt-2 flex gap-3 text-[11px] text-slate-600">
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: GREEN }} />
                    단어 종합테스트
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: PURPLE }} />
                    듣기 시험
                  </span>
                </div>
              </>
            ) : (
              <p className="mt-3 flex flex-1 items-center justify-center rounded-lg bg-slate-50 text-xs text-slate-400">
                이 기간에 본 시험 점수가 아직 없어요
              </p>
            )}
          </div>
        </div>

        <div className={print ? "grid grid-cols-3 gap-3" : "grid gap-3 sm:grid-cols-3"}>
          <AreaCard
            title="단어학습"
            big={o.vocab.setsStudied ? `${o.vocab.setsPassed} / ${o.vocab.setsStudied}` : "—"}
            unit="세트 합격"
            lines={[
              o.vocab.avgScore != null ? `종합테스트 평균 ${o.vocab.avgScore}점` : "종합테스트 전",
              `4단계 진행 ${o.vocab.stagesDone}/${o.vocab.stagesTotal}`,
              `복습할 단어 ${report.reviewWords.length}개`,
            ]}
            tint="#f0faf3"
            ink="#166534"
          />
          <AreaCard
            title="듣기"
            big={o.listening.examAvg != null ? String(o.listening.examAvg) : "—"}
            unit="점 평균"
            lines={[
              o.listening.examSets ? `${o.listening.examSets}회차 응시` : "시험 기록 없음",
              dictTotal ? `받아쓰기 ${dictPassed}/${dictTotal}문항 통과` : "받아쓰기 기록 없음",
              o.listening.tasksTotal ? `매일 과제 ${o.listening.tasksDone}/${o.listening.tasksTotal}` : "",
            ].filter(Boolean)}
            tint="#f5f1fe"
            ink="#5b21b6"
          />
          <AreaCard
            title="영상 강의"
            big={String(lessonDone)}
            unit="강 완료"
            lines={[
              report.courses.length ? report.courses.map((c) => c.courseTitle).slice(0, 1)[0]! : "기록 없음",
              videoPct != null ? `진도율 ${videoPct}%` : "",
              lastVideo ? `마지막 수강 ${md(lastVideo)}` : "",
            ].filter(Boolean)}
            tint="#eef7fb"
            ink="#0e7490"
          />
        </div>

        {comment?.trim() ? (
          <div className="rounded-xl border border-slate-200 p-4">
            <p className="text-sm font-extrabold text-slate-900">선생님 한마디</p>
            <p className="mt-1.5 whitespace-pre-wrap text-[13px] leading-7 text-slate-700">{comment.trim()}</p>
          </div>
        ) : null}

        {reviewWords.length ? (
          <div className="flex flex-wrap items-center gap-1.5">
            <span className="mr-1 text-xs font-extrabold" style={{ color: "#b45309" }}>
              복습할 단어
            </span>
            {reviewWords.map((w) => (
              <span
                key={w.itemId}
                className="rounded-full px-2.5 py-1 text-xs font-semibold"
                style={{ background: "#fff7ed", color: "#9a3412" }}
              >
                {w.word}
              </span>
            ))}
            {report.reviewWords.length > reviewWords.length ? (
              <span className="text-xs text-slate-400">외 {report.reviewWords.length - reviewWords.length}개</span>
            ) : null}
          </div>
        ) : null}
      </div>
    </div>
  );
}
