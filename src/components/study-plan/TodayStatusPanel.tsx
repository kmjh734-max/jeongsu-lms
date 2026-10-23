"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  SingleKakaoNudgeDialog,
  useKakaoPreload,
  type KakaoNudge,
} from "@/components/learning-status/SequentialKakaoNudgeDialog";
import { todayStatusAction } from "@/app/admin/study-plans/actions";
import { toPublicShareUrl } from "@/lib/kakao/share-url";
import {
  buildTodayNudgeMessage,
  todayLabelOf,
  type TodayNudgeHomework,
  type TodayNudgeRecipient,
} from "@/lib/study-plan/build-today-nudge-message";
import { HOMEWORK_CHECK_LABELS, type HomeworkCheck } from "@/lib/study-plan";
import {
  TODAY_STUDY_KIND_LABELS,
  type TodayStudyItem,
  type TodayStudyState,
  type TodayStudyStatus,
} from "@/lib/study-plan/today-status";

/** 일정표에 적어 둔 이번 회차 숙제 한 줄 — 영역 이름 · 숙제 글 · 선생님이 찍은 확인 */
export interface SessionHomework extends TodayNudgeHomework {
  check: HomeworkCheck;
}

const STATE_LOOK: Record<TodayStudyState, { text: string; className: string }> = {
  done: { text: "했음", className: "border-emerald-300 bg-emerald-50 text-emerald-700" },
  partial: { text: "덜 함", className: "border-amber-300 bg-amber-50 text-amber-700" },
  missing: { text: "안 함", className: "border-rose-300 bg-rose-50 text-rose-700" },
  none: { text: "할 것 없음", className: "border-slate-200 bg-white text-slate-400" },
};

const CHECK_TONE: Record<Exclude<HomeworkCheck, "">, string> = {
  none: "border-rose-300 bg-rose-50 text-rose-700",
  weak: "border-amber-300 bg-amber-50 text-amber-700",
  done: "border-emerald-300 bg-emerald-50 text-emerald-700",
};

function StatePill({ state }: { state: TodayStudyState }) {
  const look = STATE_LOOK[state];
  return (
    <span className={`inline-flex h-6 shrink-0 items-center rounded-md border px-1.5 text-[11px] font-semibold ${look.className}`}>
      {look.text}
    </span>
  );
}

/**
 * 「오늘 학습 현황」 — 일정표 머리 아래에 붙는다.
 *
 * 선생님 요청(2026-10-23): 오늘 학생 숙제가 제대로 이행됐는지 단어·듣기·강좌 현황이
 * 같이 나오고, 안 했으면 카톡으로 알림을 보낼 수 있게.
 *
 * 왼쪽은 실제 기록(단어·듣기·강좌), 오른쪽은 일정표에 적어 둔 이번 회차 숙제.
 * 알림은 다른 현황 화면과 같은 카카오톡 공유 창을 쓴다 — 받는 분은 선생님이 창에서 고른다.
 */
export function TodayStatusPanel({
  studentId,
  studentName,
  academyName,
  homework,
  sessionLabel,
}: {
  studentId: string;
  studentName: string;
  academyName?: string;
  /** 일정표에서 오늘이 속한 회차의 숙제 — 회차 날짜가 없으면 null */
  homework: SessionHomework[] | null;
  /** "10/22 (수) 회차" */
  sessionLabel: string | null;
}) {
  const [status, setStatus] = useState<TodayStudyStatus | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [recipient, setRecipient] = useState<TodayNudgeRecipient>("student");
  const [open, setOpen] = useState(false);
  useKakaoPreload();

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    const r = await todayStatusAction({ studentId });
    if (r.ok) setStatus(r.status);
    else setError(r.message);
    setLoading(false);
  }, [studentId]);

  useEffect(() => {
    void load();
  }, [load]);

  const undone = useMemo(
    () => (status?.items ?? []).filter((i) => i.state === "missing" || i.state === "partial"),
    [status],
  );
  const hwLines = useMemo(() => (homework ?? []).filter((h) => h.homework.trim()), [homework]);

  const nudge = useMemo<KakaoNudge | null>(() => {
    if (!status) return null;
    if (undone.length === 0 && hwLines.length === 0) return null;
    const studyUrl = toPublicShareUrl("/student");
    const day = todayLabelOf(status.todayIso);
    return {
      message: buildTodayNudgeMessage({
        studentName,
        recipient,
        undone,
        homework: hwLines,
        todayIso: status.todayIso,
        studyUrl,
        ...(academyName ? { academyName } : {}),
      }),
      share: {
        studentName,
        periodLabel: day,
        shareUrl: studyUrl,
        feedTitle: `${studentName} 학생 오늘 학습 안내`,
        feedDescription:
          undone.length > 0
            ? `${day} 안 한 학습 ${undone.map((i) => TODAY_STUDY_KIND_LABELS[i.kind]).join("·")}`
            : `${day} 숙제 안내`,
        buttonTitle: "학습 바로가기",
      },
    };
  }, [status, undone, hwLines, studentName, recipient, academyName]);

  const dayLabel = status ? todayLabelOf(status.todayIso) : "오늘";

  return (
    <section className="rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h3 className="text-sm font-bold text-slate-900">
          오늘 학습 현황 <span className="font-normal text-slate-500">· {dayLabel}</span>
        </h3>
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex overflow-hidden rounded-lg border border-slate-200 text-xs font-semibold">
            {(["student", "parent"] as TodayNudgeRecipient[]).map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRecipient(r)}
                className={`px-2.5 py-1.5 transition ${
                  recipient === r ? "bg-slate-900 text-white" : "bg-white text-slate-500 hover:bg-slate-50"
                }`}
              >
                {r === "student" ? "학생에게" : "학부모께"}
              </button>
            ))}
          </div>
          <Button variant="secondary" size="sm" onClick={() => void load()} disabled={loading}>
            {loading ? "읽는 중…" : "새로 고침"}
          </Button>
          <Button size="sm" onClick={() => setOpen(true)} disabled={!status}>
            카카오톡 알림
          </Button>
        </div>
      </div>

      {error ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}

      <div className="mt-3 grid gap-3 md:grid-cols-2">
        {/* 실제 기록 */}
        <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
          {status
            ? status.items.map((item: TodayStudyItem) => (
                /*
                 * 마우스를 올리면(또는 탭으로 고르면) 무엇을 어디까지 했는지 자세한 줄이 뜬다.
                 * 선생님 요청(2026-10-23): 요약은 그대로 두고 올리면 구체적으로 보이게.
                 */
                <li
                  key={item.kind}
                  tabIndex={0}
                  className="group relative flex items-start gap-2 px-3 py-2 text-sm outline-none hover:bg-slate-50 focus:bg-slate-50"
                >
                  <span className="w-8 shrink-0 pt-0.5 text-xs font-bold text-slate-500">
                    {TODAY_STUDY_KIND_LABELS[item.kind]}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-slate-800">{item.title}</span>
                    {item.detail ? <span className="block text-xs text-slate-500">{item.detail}</span> : null}
                  </span>
                  <StatePill state={item.state} />
                  {item.details.length > 0 ? (
                    <div
                      role="tooltip"
                      className="pointer-events-none absolute left-2 right-2 top-full z-20 hidden rounded-lg border border-slate-200 bg-white p-3 text-xs text-slate-700 shadow-lg group-hover:block group-focus:block"
                    >
                      <p className="mb-1 font-bold text-slate-900">
                        {TODAY_STUDY_KIND_LABELS[item.kind]} · 어디까지 했나
                      </p>
                      <ul className="space-y-0.5">
                        {item.details.map((line, i) => (
                          <li key={i} className="flex gap-1.5">
                            <span className="text-slate-400">·</span>
                            <span className="min-w-0 break-words">{line}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ) : null}
                </li>
              ))
            : (["vocab", "listening", "course"] as const).map((k) => (
                <li key={k} className="flex items-center gap-2 px-3 py-2 text-sm text-slate-400">
                  <span className="w-8 shrink-0 text-xs font-bold text-slate-500">{TODAY_STUDY_KIND_LABELS[k]}</span>
                  {loading ? "읽는 중…" : "-"}
                </li>
              ))}
        </ul>

        {/* 일정표에 적어 둔 숙제 */}
        <div className="rounded-xl border border-slate-200 px-3 py-2 text-sm">
          <p className="text-xs font-bold text-slate-500">
            일정표 숙제{sessionLabel ? <span className="font-normal"> · {sessionLabel}</span> : null}
          </p>
          {homework === null ? (
            <p className="mt-1 text-xs text-slate-400">회차 날짜를 넣으면 오늘이 속한 회차의 숙제가 여기 보여요.</p>
          ) : homework.length === 0 ? (
            <p className="mt-1 text-xs text-slate-400">이 회차에 적어 둔 숙제가 없어요.</p>
          ) : (
            <ul className="mt-1 space-y-1">
              {homework.map((h) => (
                <li key={h.area} className="flex items-start gap-2">
                  <span className="w-12 shrink-0 truncate text-xs font-semibold text-slate-600" title={h.area}>
                    {h.area}
                  </span>
                  <span className={`min-w-0 flex-1 ${h.homework.trim() ? "text-slate-800" : "text-slate-400"}`}>
                    {h.homework.trim() || "-"}
                  </span>
                  {h.check ? (
                    <span className={`inline-flex h-6 shrink-0 items-center rounded-md border px-1.5 text-[11px] font-semibold ${CHECK_TONE[h.check]}`}>
                      {HOMEWORK_CHECK_LABELS[h.check]}
                    </span>
                  ) : null}
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {open ? (
        <SingleKakaoNudgeDialog
          title={recipient === "student" ? `${studentName} 학생에게 알림` : `${studentName} 학부모께 알림`}
          description={
            undone.length > 0
              ? `${dayLabel} 안 한 학습 ${undone.map((i) => TODAY_STUDY_KIND_LABELS[i.kind]).join(" · ")}`
              : `${dayLabel} 온라인 학습은 다 했어요`
          }
          nudge={nudge}
          emptyText={`${dayLabel} 온라인 학습을 다 했고 적어 둔 숙제도 없어요. 보낼 알림이 없어요.`}
          onClose={() => setOpen(false)}
        />
      ) : null}
    </section>
  );
}
