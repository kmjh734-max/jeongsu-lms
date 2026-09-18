import Link from "next/link";
import { classDaySet, compareLines } from "@/components/reports/ReportDashboard";
import type { StudentReport } from "@/lib/reports/types";

/**
 * 학습 리포트 C안(학부모 모바일형) — 카톡 링크로 여는 학부모 화면.
 * 한 문장 머리글 · 세 가지 수치 · 선생님 말씀 · 공부한 날 달력 · 과목별 막대 · 복습 단어 · PDF 저장.
 */

const NAVY = "#13294b";
const WEEKDAYS = ["월", "화", "수", "목", "금", "토", "일"];

function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function weekdayIndex(ymd: string): number {
  return (new Date(`${ymd}T00:00:00Z`).getUTCDay() + 6) % 7;
}
/** 이름 끝 두 글자로 부른다(김민지 → 민지) */
function callName(name: string): string {
  const n = name.trim();
  return /^[가-힣]{3}$/.test(n) ? n.slice(1) : n;
}

function Card({ children, tint = "#ffffff" }: { children: React.ReactNode; tint?: string }) {
  return (
    <section className="mx-4 flex flex-col gap-3 rounded-2xl p-[18px]" style={{ background: tint }}>
      {children}
    </section>
  );
}

export function ReportMobileParent({
  report,
  comment,
  academyName,
  studentName,
  printHref,
  expiresLabel,
}: {
  report: StudentReport;
  comment: string;
  academyName: string;
  studentName: string;
  printHref: string;
  expiresLabel: string;
}) {
  const o = report.overview;
  if (!o) return null;

  const first = addDays(o.calendarStart, -weekdayIndex(o.calendarStart));
  const last = addDays(o.calendarEnd, 6 - weekdayIndex(o.calendarEnd));
  const classDays_ = classDaySet(o);
  const changes = compareLines(o);
  const cells: Array<{ ymd: string; state: string }> = [];
  for (let d = first; d <= last && cells.length < 49; d = addDays(d, 1)) {
    const inside = d >= o.calendarStart && d <= o.calendarEnd;
    const studied = (o.activity[d] ?? 0) > 0;
    cells.push({ ymd: d, state: !inside ? "out" : studied ? "done" : !classDays_.has(weekdayIndex(d)) ? "off" : "missed" });
  }
  const classDays = cells.filter((c) => c.state === "done" || c.state === "missed").length;
  const style = (s: string) =>
    s === "done"
      ? { background: "#16a34a", color: "#fff" }
      : s === "missed"
        ? { background: "#fde2e2", color: "#b91c1c" }
        : s === "off"
          ? { background: "#f1f3f6", color: "#9aa3b0" }
          : { background: "transparent", color: "transparent" };

  const lessonTotal = report.courses.reduce((s, c) => s + c.totalLessons, 0);
  const lessonDone = report.courses.reduce((s, c) => s + c.completedLessons, 0);
  const dictTotal = o.listening.dictationTotal ?? 0;
  const dictPassed = o.listening.dictationPassed ?? 0;
  const vocabPct = o.vocab.setsStudied ? Math.round((o.vocab.setsPassed / o.vocab.setsStudied) * 100) : null;

  const areas = [
    { name: "단어", text: o.vocab.setsStudied ? `${o.vocab.setsStudied}세트 중 ${o.vocab.setsPassed} 합격` : "기록 없음", pct: vocabPct, color: "#16a34a" },
    { name: "듣기", text: o.listening.examAvg != null ? `평균 ${o.listening.examAvg}점` : "기록 없음", pct: o.listening.examAvg, color: "#7c3aed" },
    { name: "받아쓰기", text: dictTotal ? `${dictPassed}/${dictTotal}문항` : "기록 없음", pct: dictTotal ? Math.round((dictPassed / dictTotal) * 100) : null, color: "#ea580c" },
    { name: "영상", text: lessonTotal ? `${lessonTotal}강 중 ${lessonDone}강` : "기록 없음", pct: lessonTotal ? Math.round((lessonDone / lessonTotal) * 100) : null, color: "#0891b2" },
  ];

  return (
    <div className="min-h-screen" style={{ background: "#f4f6fa", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}>
      <div className="mx-auto flex max-w-md flex-col gap-3 pb-8">
        <header className="flex flex-col gap-1.5 px-[22px] pb-[60px] pt-7 text-white" style={{ background: NAVY }}>
          <p className="text-xs font-bold" style={{ color: "#9fb4d6" }}>
            {academyName} · {report.rangeLabel} 학습 리포트
          </p>
          <h1 className="text-2xl font-black leading-snug">
            {callName(studentName)}(이)가 {report.rangeLabel}
            <br />
            {o.activeDays}일 동안 공부했어요
          </h1>
        </header>

        <div className="mx-4 -mt-[52px] grid grid-cols-3 gap-2 rounded-2xl bg-white p-[18px] shadow-[0_6px_20px_rgba(19,41,75,0.12)]">
          {[
            [vocabPct != null ? `${vocabPct}%` : "—", "단어 합격", "#15803d"],
            [o.listening.examAvg != null ? `${o.listening.examAvg}점` : "—", "듣기 평균", "#6d28d9"],
            [`${lessonDone}강`, "영상 완료", "#0e7490"],
          ].map(([v, l, c]) => (
            <div key={l} className="flex flex-col items-center gap-0.5">
              <span className="text-[22px] font-black" style={{ color: c }}>
                {v}
              </span>
              <span className="text-[11px] text-slate-500">{l}</span>
            </div>
          ))}
        </div>

        {changes.length ? (
          <div className="mx-4 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">지난 기간보다</span>
            {changes.map((l) => (
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

        {comment.trim() ? (
          <Card>
            <h2 className="text-[15px] font-extrabold text-slate-900">선생님이 전해요</h2>
            <p className="whitespace-pre-wrap text-sm leading-7 text-slate-700">{comment.trim()}</p>
          </Card>
        ) : null}

        <Card>
          <div className="flex items-baseline justify-between">
            <h2 className="text-[15px] font-extrabold text-slate-900">공부한 날</h2>
            <span className="text-xs text-slate-500">
              {classDays}일 중 {o.activeDays}일
            </span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {WEEKDAYS.map((w) => (
              <span key={w} className="text-center text-[10px] font-bold text-slate-400">
                {w}
              </span>
            ))}
            {cells.map((c) => (
              <span
                key={c.ymd}
                className="flex h-9 items-center justify-center rounded-lg text-xs font-bold tabular-nums"
                style={style(c.state)}
              >
                {c.state === "out" ? "" : Number(c.ymd.slice(8))}
              </span>
            ))}
          </div>
          <div className="flex gap-3 text-[11px] text-slate-600">
            {[
              ["공부함", "#16a34a"],
              ["빠진 날", "#fde2e2"],
              ["쉬는 날", "#f1f3f6"],
            ].map(([t, c]) => (
              <span key={t} className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
                {t}
              </span>
            ))}
          </div>
        </Card>

        <Card>
          <h2 className="text-[15px] font-extrabold text-slate-900">과목별로 보기</h2>
          {areas.map((a) => (
            <div key={a.name} className="flex flex-col gap-1.5">
              <div className="flex justify-between text-[13px]">
                <b className="text-slate-900">{a.name}</b>
                <span className="text-slate-500">{a.text}</span>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full" style={{ background: "#edf0f4" }}>
                <div className="h-full rounded-full" style={{ width: `${a.pct ?? 0}%`, background: a.color }} />
              </div>
            </div>
          ))}
        </Card>

        {report.reviewWords.length ? (
          <Card tint="#fff7ed">
            <h2 className="text-[15px] font-extrabold" style={{ color: "#9a3412" }}>
              집에서 함께 복습해 주세요
            </h2>
            <div className="flex flex-wrap gap-1.5">
              {report.reviewWords.slice(0, 16).map((w) => (
                <span
                  key={w.itemId}
                  title={w.meaning}
                  className="rounded-full bg-white px-3 py-1 text-[13px] font-semibold"
                  style={{ color: "#9a3412" }}
                >
                  {w.word}
                  <span className="ml-1 font-normal text-slate-500">{w.meaning.split(/[;,]/)[0]}</span>
                </span>
              ))}
            </div>
          </Card>
        ) : null}

        <div className="mx-4">
          <Link
            href={printHref}
            className="flex min-h-12 items-center justify-center rounded-xl text-sm font-bold text-white"
            style={{ background: NAVY }}
          >
            PDF 저장 / 인쇄
          </Link>
        </div>
        <p className="text-center text-[11px] text-slate-400">{expiresLabel}까지 볼 수 있어요</p>
      </div>
    </div>
  );
}
