import Image from "next/image";
import Link from "next/link";
import { classDaySet, compareLines } from "@/components/reports/ReportDashboard";
import { ATTENDANCE_LABELS } from "@/lib/study-plan";
import { reviewWordSlice } from "@/lib/reports/report-shape";
import type { StudentReport } from "@/lib/reports/types";

/**
 * 학습 리포트 학부모 화면 — 카톡 링크로 여는 그 화면.
 *
 * 인쇄용 A4와 같은 것을 담되 모양만 휴대폰에 맞춘다. 학부모는 카톡에서 안내문구를
 * 이미 읽고 들어오므로, 여기서는 "그래서 어땠나"에 먼저 답하고 근거를 아래에 둔다.
 * 안 오는 요일은 달력에 그리지 않는다(월수금 반이면 세 칸).
 */

const NAVY = "#13294b";
const GREEN = "#16a34a";
const GREEN_INK = "#15803d";
const VIOLET = "#7c3aed";
const AMBER = "#ea580c";
const ROSE = "#e11d48";
const WEEKDAY_NAMES = ["월", "화", "수", "목", "금", "토", "일"];

function addDays(ymd: string, n: number): string {
  const d = new Date(`${ymd}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}
function weekdayIndex(ymd: string): number {
  return (new Date(`${ymd}T00:00:00Z`).getUTCDay() + 6) % 7;
}
/** "2026-09-01" → "2026. 09. 01" */
function dotted(ymd: string): string {
  return ymd.replace(/-/g, ". ");
}

function Card({
  title,
  note,
  tint,
  children,
}: {
  title: string;
  note?: string;
  tint?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      className="mx-4 rounded-2xl border border-slate-200 p-[18px]"
      style={{ background: tint ?? "#fff", borderColor: tint ? "transparent" : undefined }}
    >
      <div className="flex items-baseline justify-between gap-2">
        <h2 className="text-[15px] font-extrabold tracking-[-0.01em] text-slate-900">{title}</h2>
        {note ? <span className="text-[11px] tabular-nums text-slate-500">{note}</span> : null}
      </div>
      {children}
    </section>
  );
}

/** 제목 한 줄 + 표시 + 사실 한 조각 */
function Row({
  title,
  pill,
  pillTone = "go",
  fact,
}: {
  title: string;
  pill?: string;
  pillTone?: "ok" | "go";
  fact?: string;
}) {
  return (
    <li className="flex flex-wrap items-center gap-1.5 border-t border-slate-200 py-2 first:border-t-0 first:pt-0.5">
      <b className="min-w-0 basis-full text-[13px] font-bold leading-snug text-slate-900">{title}</b>
      {pill ? (
        <span
          className={`shrink-0 rounded-full px-2 py-0.5 text-[11px] font-bold tabular-nums ${
            pillTone === "ok" ? "bg-emerald-50 text-emerald-700" : "bg-slate-200 text-slate-600"
          }`}
        >
          {pill}
        </span>
      ) : null}
      {fact ? <span className="text-xs tabular-nums text-slate-500">{fact}</span> : null}
    </li>
  );
}

export function ReportMobileParent({
  report,
  comment,
  academyName,
  studentName,
  printHref,
  expiresLabel,
  logoSrc,
}: {
  report: StudentReport;
  comment: string;
  academyName: string;
  studentName: string;
  printHref: string;
  expiresLabel: string;
  logoSrc?: string;
}) {
  const o = report.overview;
  if (!o) return null;

  // ----- 달력: 이 아이가 오는 요일만 칸을 만든다 -----
  const classDays = [...classDaySet(o)].sort((a, b) => a - b);
  const weeks: Array<Array<{ ymd: string; state: "done" | "missed" | "none" }>> = [];
  const first = addDays(o.calendarStart, -weekdayIndex(o.calendarStart));
  for (let d = first; d <= o.calendarEnd; d = addDays(d, 7)) {
    const row = classDays.map((wd) => {
      const day = addDays(d, wd);
      if (day < o.calendarStart || day > o.calendarEnd) return { ymd: day, state: "none" as const };
      return { ymd: day, state: (o.activity[day] ?? 0) > 0 ? ("done" as const) : ("missed" as const) };
    });
    if (row.some((c) => c.state !== "none")) weeks.push(row);
  }
  const classDayCount = weeks.flat().filter((c) => c.state !== "none").length;
  const studiedOnClassDays = weeks.flat().filter((c) => c.state === "done").length;

  // ----- 수치 -----
  const changes = compareLines(o);
  const dict = report.listeningDictation;
  const dictAvg = dict.find((d) => d.averageBestScore != null)?.averageBestScore ?? null;
  const lessonTotal = report.courses.reduce((s, c) => s + c.totalLessons, 0);
  const lessonDone = report.courses.reduce((s, c) => s + c.completedLessons, 0);
  const { rows: reviewRows, extra: reviewExtra } = reviewWordSlice(report);

  // 한 것만 보여 준다 — 안 한 것을 '기록 없음'으로 적으면 읽을 것만 늘어난다
  const tiles: Array<[string, string, string, string]> = [
    [`${o.activeDays}일`, "학습한 날", `수업일 ${classDayCount}일 중`, GREEN_INK],
  ];
  if (o.vocab.setsStudied) {
    tiles.push([
      `${o.vocab.setsPassed}세트`,
      "단어 합격",
      `${o.vocab.setsStudied}세트 중`,
      GREEN_INK,
    ]);
  }
  if (dictAvg != null) tiles.push([`${dictAvg}점`, "받아쓰기", "평균", VIOLET]);
  else if (o.listening.examAvg != null) {
    tiles.push([`${o.listening.examAvg}점`, "듣기 평균", "시험", VIOLET]);
  }

  // ----- 한 줄 결론 — 숫자를 안 읽어도 이 문장이면 된다 -----
  const verdict: string[] = [];
  if (o.vocab.setsStudied) {
    verdict.push(
      `단어 ${o.vocab.setsStudied}세트 중 ${o.vocab.setsPassed}세트를 합격했고` +
        (o.vocab.avgScore != null ? `(종합테스트 ${o.vocab.avgScore}점)` : ""),
    );
  }
  if (dictAvg != null) verdict.push(`받아쓰기는 평균 ${dictAvg}점입니다.`);
  else if (verdict.length) verdict[verdict.length - 1] += ".";

  // ----- 출결 비율 — 일정표에 찍어 둔 것이 있을 때만 -----
  const att = report.studyPlan?.attendance;
  const attMarked = att ? att.present + att.late + att.absent + att.makeup : 0;
  const attRows = (att && attMarked > 0
    ? ([
        ["present", att.present, GREEN],
        ["late", att.late, AMBER],
        ["absent", att.absent, ROSE],
        ["makeup", att.makeup, VIOLET],
      ] as const)
    : []
  ).filter(([, n]) => n > 0);

  const period = [
    report.student.classNames.join(", "),
    report.rangeLabel,
    `${dotted(o.calendarStart)} ~ ${dotted(o.calendarEnd)}`,
  ]
    .filter(Boolean)
    .join(" · ");

  return (
    <div
      className="min-h-screen"
      style={{ background: "#eef1f6", WebkitPrintColorAdjust: "exact", printColorAdjust: "exact" }}
    >
      <div className="mx-auto flex max-w-md flex-col gap-3 pb-10">
        <header
          className="px-[22px] pb-[68px] pt-6 text-white"
          style={{ background: `linear-gradient(160deg, ${NAVY} 0%, #1d3a66 100%)` }}
        >
          <div className="flex items-center gap-2.5">
            {logoSrc ? (
              <Image
                src={logoSrc}
                alt={academyName}
                width={34}
                height={34}
                className="h-[34px] w-[34px] shrink-0 rounded-[9px] bg-white object-contain p-[3px]"
              />
            ) : null}
            <div className="min-w-0">
              <p className="text-[13px] font-bold">{academyName}</p>
              <p className="text-[10px] font-bold tracking-[0.22em]" style={{ color: "#93aacd" }}>
                LEARNING REPORT
              </p>
            </div>
          </div>
          <h1 className="mt-[18px] text-[23px] font-black leading-[1.35] tracking-[-0.01em]">
            {studentName} 학생 학습 리포트
          </h1>
          <p className="mt-2 text-xs" style={{ color: "#b9c8de" }}>
            {period}
          </p>
        </header>

        <div
          className="mx-4 -mt-[52px] grid gap-1 rounded-[18px] bg-white p-4 shadow-[0_8px_26px_rgba(19,41,75,0.14)]"
          style={{ gridTemplateColumns: `repeat(${tiles.length}, minmax(0, 1fr))` }}
        >
          {tiles.map(([value, label, sub, color]) => (
            <div key={label} className="flex flex-col items-center gap-px text-center">
              <b className="text-[21px] font-black leading-tight tabular-nums" style={{ color }}>
                {value}
              </b>
              <span className="text-[11px] text-slate-500">{label}</span>
              <span className="text-[10px] text-slate-400">{sub}</span>
            </div>
          ))}
        </div>

        {verdict.length ? (
          <p className="mx-4 text-[14.5px] leading-[1.7] text-slate-800">
            이번 달 {verdict.join(" ")}
          </p>
        ) : null}

        {changes.length ? (
          <div className="mx-4 flex flex-wrap items-center gap-1.5 text-xs">
            <span className="font-semibold text-slate-500">지난 기간보다</span>
            {changes.map((l) => (
              <span
                key={l.text}
                className="rounded-full px-2.5 py-1 font-bold"
                style={{
                  background: l.up ? "#dcfce7" : "#fee2e2",
                  color: l.up ? "#166534" : "#b91c1c",
                }}
              >
                {l.up ? "▲" : "▼"} {l.text}
              </span>
            ))}
          </div>
        ) : null}

        <Card title="출석·학습 달력" note={`수업일 ${classDayCount}일 중 ${studiedOnClassDays}일`}>
          <div
            className="mt-3 grid gap-2"
            style={{ gridTemplateColumns: `repeat(${classDays.length}, minmax(0, 1fr))` }}
          >
            {classDays.map((wd) => (
              <span key={wd} className="text-center text-[10px] font-bold text-slate-400">
                {WEEKDAY_NAMES[wd]}
              </span>
            ))}
            {weeks.flat().map((c) => (
              <span
                key={c.ymd}
                className="flex h-[42px] items-center justify-center rounded-[11px] text-sm font-bold tabular-nums"
                style={
                  c.state === "done"
                    ? { background: GREEN, color: "#fff" }
                    : c.state === "missed"
                      ? { background: "#fee2e2", color: "#be123c" }
                      : { background: "transparent", color: "transparent" }
                }
              >
                {c.state === "none" ? "" : Number(c.ymd.slice(8))}
              </span>
            ))}
          </div>
          <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-slate-600">
            {[
              ["학습함", GREEN],
              ["빠진 날", "#fee2e2"],
            ].map(([t, c]) => (
              <span key={t} className="flex items-center gap-1">
                <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: c }} />
                {t}
              </span>
            ))}
          </div>

          {attRows.length > 0 ? (
            <>
              <div className="mt-3 flex h-[9px] overflow-hidden rounded-full bg-slate-100">
                {attRows.map(([key, n, color]) => (
                  <span key={key} style={{ width: `${(n / attMarked) * 100}%`, background: color }} />
                ))}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-slate-600">
                {attRows.map(([key, n, color]) => (
                  <span key={key} className="flex items-center gap-1">
                    <span className="inline-block h-2.5 w-2.5 rounded-sm" style={{ background: color }} />
                    {ATTENDANCE_LABELS[key]} {n}회
                    <b className="tabular-nums text-slate-900">
                      {Math.round((n / attMarked) * 100)}%
                    </b>
                  </span>
                ))}
              </div>
            </>
          ) : null}
        </Card>

        {comment.trim() ? (
          <Card title="선생님 한마디">
            <p className="mt-2.5 whitespace-pre-wrap text-sm leading-7 text-slate-700">
              {comment.trim()}
            </p>
          </Card>
        ) : null}

        {reviewRows.length > 0 ? (
          <Card title="집에서 함께 복습해 주세요" tint="#fff7ed">
            <>
              <ul className="mt-3 flex flex-col gap-1.5">
                {reviewRows.map((w) => (
                  <li key={w.itemId} className="flex flex-wrap items-baseline gap-x-2 text-[13px]">
                    <b className="font-bold" style={{ color: "#9a3412" }}>
                      {w.word}
                    </b>
                    <span className="text-slate-600">{w.meaning.split(/[;,]/)[0]}</span>
                    {w.wrongCount > 0 ? (
                      <span className="text-[11px] tabular-nums text-slate-400">
                        {w.wrongCount}번 틀림
                      </span>
                    ) : null}
                  </li>
                ))}
              </ul>
              {reviewExtra > 0 ? (
                <p className="mt-2 text-[11px] text-slate-500">외 {reviewExtra}개</p>
              ) : null}
            </>
          </Card>
        ) : null}

        {report.vocabSets.length > 0 ? (
          <Card
            title="단어학습"
            note={
              o.vocab.setsStudied
                ? `${o.vocab.setsStudied}세트 중 ${o.vocab.setsPassed}세트 합격`
                : undefined
            }
          >
            <ul className="mt-2.5">
              {report.vocabSets.map((set) => (
                <Row
                  key={set.setId}
                  title={set.setTitle}
                  pill={set.stage4Passed ? "합격" : set.statusLabel}
                  pillTone={set.stage4Passed ? "ok" : "go"}
                  fact={
                    set.stage4AttemptCount > 0
                      ? `종합테스트 ${set.stage4BestScore}점`
                      : set.itemCount > 0
                        ? `낱말 ${set.itemCount}개`
                        : undefined
                  }
                />
              ))}
            </ul>
          </Card>
        ) : null}

        {dict.length > 0 || report.listeningExam.length > 0 ? (
          <Card title="듣기">
            <>
              <ul className="mt-2.5">
                {dict.map((d) => (
                  <Row
                    key={`d-${d.setId}`}
                    title={d.setTitle}
                    pill={`${d.passedQuestionCount}/${d.questionCount}문항`}
                    pillTone="ok"
                    fact={
                      [
                        d.averageBestScore != null ? `받아쓰기 ${d.averageBestScore}점` : "",
                        d.totalAttempts > 0 ? `${d.totalAttempts}회 응시` : "",
                      ]
                        .filter(Boolean)
                        .join(" · ") || undefined
                    }
                  />
                ))}
                {report.listeningExam.map((e) => (
                  <Row
                    key={`e-${e.setId}`}
                    title={`${e.setTitle} 시험`}
                    pill={e.bestScore != null ? `${e.bestScore}점` : undefined}
                    pillTone="ok"
                    fact={
                      [
                        `${e.questionCount}문항`,
                        e.attemptCount > 0 ? `${e.attemptCount}회 응시` : "",
                      ]
                        .filter(Boolean)
                        .join(" · ")
                    }
                  />
                ))}
              </ul>
              {dict.some((d) => d.frequentWrongWords.length > 0) ? (
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                  <span className="text-[11px] font-bold" style={{ color: "#9a3412" }}>
                    자주 틀린 낱말
                  </span>
                  {[...new Set(dict.flatMap((d) => d.frequentWrongWords))].slice(0, 8).map((w) => (
                    <span
                      key={w}
                      className="rounded-full px-2.5 py-0.5 text-[12.5px] font-bold"
                      style={{ background: "#fff7ed", color: "#9a3412" }}
                    >
                      {w}
                    </span>
                  ))}
                </div>
              ) : null}
            </>
          </Card>
        ) : null}

        {report.courses.length > 0 ? (
          <Card title="영상 강의" note={lessonTotal ? `${lessonTotal}강 중 ${lessonDone}강` : undefined}>
            <ul className="mt-2.5">
              {report.courses.map((c) => (
                <Row
                  key={c.courseId}
                  title={c.courseTitle}
                  pill={`${c.progressPercent}%`}
                  fact={`${c.totalLessons}강 중 ${c.completedLessons}강`}
                />
              ))}
            </ul>
          </Card>
        ) : null}

        <div className="mx-4">
          <Link
            href={printHref}
            className="flex min-h-[50px] items-center justify-center rounded-[14px] text-sm font-bold text-white"
            style={{ background: NAVY }}
          >
            PDF 저장 / 인쇄
          </Link>
        </div>
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          {logoSrc ? (
            <Image
              src={logoSrc}
              alt=""
              width={22}
              height={22}
              className="h-[22px] w-[22px] rounded-md bg-white object-contain p-0.5"
            />
          ) : null}
          {academyName} · {expiresLabel}까지 볼 수 있어요
        </p>
      </div>
    </div>
  );
}
