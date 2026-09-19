"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, type ReactNode } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { ExamDeleteButton } from "@/components/exam-analysis/ExamDeleteButton";
import {
  EXAM_CATEGORIES,
  EXAM_LEVELS,
  EXAM_TYPE_CHOICES,
  type ExamAnalysisRow,
  type ExamItemRow,
  type ExamLevel,
} from "@/lib/exam-analysis/types";

/** 보고서 색: 크림 바탕 위 주황·남색 (승인된 A4 두 쪽 시안) */
const CREAM = "#fbf7ef";
const LINE = "#e8dcc5";
const SOFT = "#6b5f4b";
const NAVY = "#29335c";
const LV_BG: Record<ExamLevel, string> = { 하: "#f1e3c6", 중: "#f3a712", 상: "#e4572e" };
const LV_INK: Record<ExamLevel, string> = { 하: SOFT, 중: "#fff", 상: "#fff" };
const CAT_COLOR: Record<string, string> = {
  "대의 파악": "#e4572e",
  "세부 정보": "#29335c",
  "논리·추론": "#f3a712",
  "어법·어휘": "#669bbc",
  서술형: "#a8c686",
  기타: "#b8ad98",
};

const r1 = (x: number) => Math.round(x * 10) / 10;
const sum = (xs: (number | null)[]) => xs.reduce<number>((s, x) => s + (Number(x) || 0), 0);

function Donut({ parts, total }: { parts: { c: string; n: number }[]; total: number }) {
  const R = 98;
  const r = 60;
  let a = -Math.PI / 2;
  const n = sum(parts.map((p) => p.n)) || 1;
  const P = (ang: number, rad: number) => `${R + rad * Math.cos(ang)} ${R + rad * Math.sin(ang)}`;
  return (
    <svg viewBox="0 0 196 196" width="196" height="196" role="img" aria-label="영역별 문항 수">
      {parts.map((p) => {
        // 한 영역만 있으면 원 하나
        if (p.n === n) {
          return (
            <g key={p.c}>
              <circle cx={R} cy={R} r={(R + r) / 2} fill="none" stroke={CAT_COLOR[p.c]} strokeWidth={R - r} />
            </g>
          );
        }
        const a2 = a + (p.n / n) * Math.PI * 2;
        const big = a2 - a > Math.PI ? 1 : 0;
        const d = `M ${P(a, R)} A ${R} ${R} 0 ${big} 1 ${P(a2, R)} L ${P(a2, r)} A ${r} ${r} 0 ${big} 0 ${P(a, r)} Z`;
        a = a2;
        return <path key={p.c} d={d} fill={CAT_COLOR[p.c]} />;
      })}
      <text x={R} y={R} textAnchor="middle" fontSize="32" fontWeight="700" fill="#1f2937">
        {total}
      </text>
      <text x={R} y={R + 20} textAnchor="middle" fontSize="11" fill={SOFT}>
        문항
      </text>
    </svg>
  );
}

/** A4 한 쪽 (화면에서도 794×1123px, 인쇄는 210×297mm) */
function A4Page({ children, footer }: { children: ReactNode; footer: string }) {
  return (
    <section
      className="exam-a4 relative flex min-h-[1123px] w-[794px] shrink-0 flex-col gap-[18px] px-[50px] pb-[52px] pt-[48px] text-[12.5px] leading-normal text-[#1f2937] shadow-[0_8px_26px_rgb(15_25_40/0.16)]"
      style={{ background: CREAM }}
    >
      {children}
      <div
        className="absolute bottom-[22px] left-[50px] right-[50px] flex justify-between border-t pt-1.5 text-[10px]"
        style={{ borderColor: LINE, color: SOFT }}
      >
        <span>{footer}</span>
      </div>
    </section>
  );
}

export function ExamReportView({
  analysis,
  items: initialItems,
  academyName,
  listHref,
  mocks = [],
  generationsHref,
}: {
  analysis: ExamAnalysisRow;
  items: ExamItemRow[];
  academyName: string;
  listHref: string;
  /** 이 시험으로 만든 동형모의고사 */
  mocks?: { id: string; title: string; created_at: string; status: string }[];
  generationsHref: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
  // 수업자료 대조를 켜고 끄면 서버가 적중 칸을 다시 채운다 → 새 문항표로 바꾼다
  useEffect(() => setItems(initialItems), [initialItems]);
  const [matchOn, setMatchOn] = useState(analysis.match_materials);
  const [matchBusy, setMatchBusy] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editMeta, setEditMeta] = useState(false);
  const [meta, setMeta] = useState({
    schoolName: analysis.school_name ?? "",
    grade: analysis.grade ?? "",
    subject: analysis.subject ?? "",
    examLabel: analysis.exam_label ?? "",
  });
  const [saving, setSaving] = useState(false);

  const s = useMemo(() => {
    const total = r1(sum(items.map((i) => i.points)));
    const subj = items.filter((i) => i.is_subjective);
    const hard = items.filter((i) => i.level === "상");
    const matched = items.filter((i) => i.matched_item_id);
    const cats = EXAM_CATEGORIES.map((c) => {
      const list = items.filter((i) => i.category === c);
      return { c, n: list.length, pts: r1(sum(list.map((i) => i.points))) };
    }).filter((x) => x.n > 0);
    const levels = EXAM_LEVELS.map((l) => {
      const list = items.filter((i) => i.level === l);
      return { l, n: list.length, pts: r1(sum(list.map((i) => i.points))) };
    });
    const avg = items.length ? r1(sum(items.map((i) => i.difficulty)) / items.length) : 0;
    const subjPts = r1(sum(subj.map((i) => i.points)));
    const decisive = hard
      .slice()
      .sort((x, y) => (y.points ?? 0) - (x.points ?? 0) || y.difficulty - x.difficulty)
      .slice(0, 6);
    return { total, subj, subjPts, hard, matched, cats, levels, avg, decisive };
  }, [items]);
  const pct = (x: number) => (s.total ? Math.round((x / s.total) * 100) : 0);

  async function saveItem(id: string, patch: { typeName?: string; level?: ExamLevel; points?: number | null }) {
    const before = items;
    setItems((prev) =>
      prev.map((it) =>
        it.id === id
          ? {
              ...it,
              ...(patch.typeName ? { type_name: patch.typeName } : {}),
              ...(patch.level ? { level: patch.level, difficulty: patch.level === "상" ? 4 : patch.level === "하" ? 2 : 3 } : {}),
              ...("points" in patch ? { points: patch.points ?? null } : {}),
              edited: true,
            }
          : it
      )
    );
    const res = await fetch(`/api/exam-analysis/${analysis.id}/items/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(patch),
    });
    if (!res.ok) setItems(before);
    else if (patch.typeName) router.refresh();
  }

  async function saveMeta() {
    setSaving(true);
    await fetch(`/api/exam-analysis/${analysis.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(meta),
    });
    setSaving(false);
    setEditMeta(false);
    router.refresh();
  }

  async function toggleMatch() {
    setMatchBusy(true);
    const next = !matchOn;
    const res = await fetch(`/api/exam-analysis/${analysis.id}/match`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ enabled: next }),
    });
    setMatchBusy(false);
    if (res.ok) {
      setMatchOn(next);
      router.refresh();
    }
  }

  const title = [meta.schoolName || "학교 미입력", meta.grade ? `${meta.grade}학년` : "", meta.subject].filter(Boolean).join(" ");
  const examLine = [meta.examLabel, `선택형 ${items.length - s.subj.length} · 서술형 ${s.subj.length}문항`, `${s.total}점`]
    .filter(Boolean)
    .join(" · ");
  const footer = `${academyName} · 내신 시험 분석 · ${title}`;
  const showMatched = matchOn && s.matched.length > 0;
  const pageTotal = showMatched ? 3 : 2;
  const h3 = "mb-[7px] text-[13.5px] font-bold";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link href={listHref} className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-500 hover:text-slate-900">
          <Icon name="left" size={16} />
          시험 분석 목록
        </Link>
        <div className="flex flex-wrap gap-2">
          <Link
            href={`${listHref}/${analysis.id}/mock`}
            className="inline-flex h-9 items-center rounded-lg bg-brand-600 px-3.5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            동형모의고사 만들기
          </Link>
          <button
            type="button"
            onClick={() => setEditMeta((v) => !v)}
            className="h-9 rounded-lg border border-slate-300 bg-white px-3.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            시험 정보 고치기
          </button>
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={`h-9 rounded-lg border px-3.5 text-sm font-semibold ${editing ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            {editing ? "고치기 끝" : "문항표 고치기"}
          </button>
          <button
            type="button"
            onClick={toggleMatch}
            disabled={matchBusy}
            title="시험 지문이 우리 학원 수업자료 지문과 같은지 대조해요"
            className={`h-9 rounded-lg border px-3.5 text-sm font-semibold disabled:opacity-50 ${matchOn ? "border-emerald-600 bg-emerald-50 text-emerald-700" : "border-slate-300 bg-white text-slate-600 hover:bg-slate-50"}`}
          >
            {matchBusy ? "대조 중…" : matchOn ? "수업자료 대조 켜짐" : "수업자료 대조 꺼짐"}
          </button>
          <ExamDeleteButton id={analysis.id} label={title} redirectTo={listHref} variant="button" />
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Icon name="print" size={15} /> 인쇄 / PDF
          </button>
        </div>
      </div>

      {mocks.length ? (
        <div className="flex flex-wrap items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm print:hidden">
          <span className="font-semibold text-slate-700">만든 동형모의고사</span>
          {mocks.map((m) => (
            <Link key={m.id} href={`${generationsHref}/${m.id}`} className="rounded-full bg-brand-50 px-2.5 py-1 text-xs font-semibold text-brand-700 hover:bg-brand-100">
              {new Date(m.created_at).toLocaleString("ko-KR", { month: "numeric", day: "numeric", hour: "2-digit", minute: "2-digit" })}
              {m.status !== "completed" ? " · 만드는 중" : ""}
            </Link>
          ))}
        </div>
      ) : null}

      {editMeta ? (
        <div className="grid gap-2 rounded-xl border border-slate-200 bg-white p-3 sm:grid-cols-[repeat(4,minmax(0,1fr))_auto] print:hidden">
          {(["schoolName", "grade", "subject", "examLabel"] as const).map((k) => (
            <input
              key={k}
              id={`meta-${k}`}
              className="ui-input h-9 text-sm"
              value={meta[k]}
              placeholder={{ schoolName: "학교", grade: "학년 (예: 1)", subject: "과목", examLabel: "시험 (예: 2026 1학기 중간)" }[k]}
              onChange={(e) => setMeta({ ...meta, [k]: e.target.value })}
            />
          ))}
          <button type="button" onClick={saveMeta} disabled={saving} className="h-9 rounded-lg bg-brand-600 px-4 text-sm font-semibold text-white disabled:opacity-50">
            저장
          </button>
        </div>
      ) : null}

      {analysis.missing ? (
        <p className="rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800 print:hidden">
          올라온 시험지에 빠진 부분이 있어요: {analysis.missing}. 빠진 문항은 보고서에 넣지 않았어요.
        </p>
      ) : null}

      <div className="overflow-x-auto print:overflow-visible">
        <div id="exam-report-print-root" className="mx-auto flex w-[794px] flex-col gap-5">
          {/* 1쪽: 요약 */}
          <A4Page footer={`${footer} · 1 / ${pageTotal}`}>
            <div className="flex items-end justify-between gap-3">
              <div className="min-w-0">
                <span className="inline-block rounded-[3px] bg-[#1f2937] px-[9px] py-1 text-[10.5px] font-bold tracking-[0.1em]" style={{ color: CREAM }}>
                  EXAM REPORT
                </span>
                <h1 className="mb-0.5 mt-2 text-[27px] font-bold leading-tight tracking-tight">{title}</h1>
                <p style={{ color: SOFT }}>{examLine}</p>
              </div>
              <div className="shrink-0 text-right text-[11px]" style={{ color: SOFT }}>
                <b className="block text-[14px] text-[#1f2937]">{academyName}</b>
                분석일 {new Date(analysis.created_at).toLocaleDateString("ko-KR")}
              </div>
            </div>

            <div className={`grid gap-[9px] ${showMatched ? "grid-cols-5" : "grid-cols-4"}`}>
              {[
                { v: `${items.length}`, l: "전체 문항" },
                { v: `${s.subjPts}`, l: `서술형 배점 · ${pct(s.subjPts)}%` },
                { v: `${s.avg}`, l: "평균 난이도 / 5" },
                { v: `${s.hard.length}`, l: `고난도 문항 · ${r1(sum(s.hard.map((i) => i.points)))}점` },
                ...(showMatched ? [{ v: `${s.matched.length}`, l: `수업자료 적중 · ${Math.round((s.matched.length / items.length) * 100)}%` }] : []),
              ].map((k) => (
                <div key={k.l} className="rounded-[14px] bg-white px-[13px] py-[11px]">
                  <b className="block text-[29px] leading-[1.1] tabular-nums">{k.v}</b>
                  <span className="text-[11.5px]" style={{ color: SOFT }}>
                    {k.l}
                  </span>
                </div>
              ))}
            </div>

            <div className="grid grid-cols-[196px_1fr_1fr] items-center gap-5">
              <Donut parts={s.cats} total={items.length} />
              <div>
                <h3 className={h3} style={{ color: NAVY }}>
                  영역별
                </h3>
                {s.cats.map((c) => (
                  <div key={c.c} className="flex justify-between border-b border-dashed py-1" style={{ borderColor: LINE }}>
                    <span>
                      <i className="mr-1.5 inline-block h-[9px] w-[9px] rounded-full align-[-1px]" style={{ background: CAT_COLOR[c.c] }} />
                      {c.c}
                    </span>
                    <b className="tabular-nums">
                      {c.n}문항 · {c.pts}점
                    </b>
                  </div>
                ))}
              </div>
              <div>
                <h3 className={h3} style={{ color: NAVY }}>
                  난이도별
                </h3>
                {s.levels.map((l) => (
                  <div key={l.l} className="border-b border-dashed py-1" style={{ borderColor: LINE }}>
                    <div className="flex justify-between">
                      <span>
                        <i className="mr-1.5 inline-block h-[9px] w-[9px] rounded-full align-[-1px]" style={{ background: LV_BG[l.l] }} />
                        {l.l}
                      </span>
                      <b className="tabular-nums">
                        {l.n}문항 · {l.pts}점 ({pct(l.pts)}%)
                      </b>
                    </div>
                    <span className="mt-[3px] block h-[5px] overflow-hidden rounded-full bg-white">
                      <span className="block h-full rounded-full" style={{ width: `${pct(l.pts)}%`, background: LV_BG[l.l] }} />
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h3 className={h3} style={{ color: NAVY }}>
                문항 번호별 난이도
              </h3>
              <div className="flex flex-wrap gap-[5px]">
                {items.map((i) => (
                  <span
                    key={i.id}
                    title={`${i.item_no} ${i.type_name} · ${i.level}`}
                    className="flex h-[37px] w-[37px] items-center justify-center rounded-full text-[11px] font-bold tabular-nums"
                    style={{
                      background: LV_BG[i.level],
                      color: LV_INK[i.level],
                      boxShadow: i.is_subjective ? `0 0 0 2px ${CREAM}, 0 0 0 4px ${NAVY}` : undefined,
                    }}
                  >
                    {i.item_no.replace("서술 ", "서")}
                  </span>
                ))}
              </div>
              <p className="mt-[5px] text-[10.5px]" style={{ color: SOFT }}>
                연한색 하 · 노랑 중 · 주황 상 · 테두리 = 서술형
              </p>
            </div>

            <div>
              <h3 className={h3} style={{ color: NAVY }}>
                출제 특징
              </h3>
              <ul className="list-disc space-y-[3px] pl-4">
                {analysis.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>

            {s.decisive.length ? (
              <div>
                <h3 className={h3} style={{ color: NAVY }}>
                  점수가 갈린 문항{" "}
                  <span className="text-[11px] font-semibold" style={{ color: SOFT }}>
                    난이도 상 · 배점 큰 순
                  </span>
                </h3>
                <div className="grid grid-cols-2 gap-1.5">
                  {s.decisive.map((i) => (
                    <div key={i.id} className="rounded-[11px] bg-white px-[11px] py-2">
                      <div className="flex justify-between font-bold">
                        <span>
                          {i.item_no} · {i.type_name}
                        </span>
                        <span>{i.points ?? "–"}점</span>
                      </div>
                      <p className="mt-px text-[11px]" style={{ color: SOFT }}>
                        {(i.difficulty_reason ?? "").slice(0, 70)}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </A4Page>

          {/* 2쪽: 문항정보표 + 서술형·대비 전략 */}
          <A4Page footer={`${footer} · 2 / ${pageTotal}`}>
            <div className="flex items-baseline justify-between border-b-2 border-[#1f2937] pb-1.5">
              <b className="text-[15px]">{title} · 문항정보표</b>
              <span className="text-[11px]" style={{ color: SOFT }}>
                {meta.examLabel}
              </span>
            </div>
            <div className="grid flex-1 grid-cols-[1.12fr_1fr] gap-[18px]">
              <div className="self-start rounded-xl bg-white px-3 py-2">
                <table className="w-full border-collapse text-[11.5px]">
                  <thead>
                    <tr className="text-left text-[10.5px]" style={{ color: SOFT }}>
                      <th className="px-1 py-1 font-semibold">번호</th>
                      <th className="px-1 py-1 font-semibold">유형</th>
                      <th className="px-1 py-1 font-semibold">난이도</th>
                      <th className="px-1 py-1 text-right font-semibold">배점</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((i) => (
                      <tr key={i.id} className="border-t align-middle" style={{ borderColor: "#f1ead9" }}>
                        <td className="whitespace-nowrap px-1 py-[3.5px] font-bold">{i.item_no}</td>
                        <td className="px-1 py-[3.5px]">
                          {editing ? (
                            <select
                              id={`type-${i.id}`}
                              className="ui-input h-7 max-w-[170px] py-0 text-[11.5px]"
                              value={i.type_name}
                              onChange={(e) => saveItem(i.id, { typeName: e.target.value })}
                            >
                              {!EXAM_TYPE_CHOICES.some((g) => g.names.includes(i.type_name)) ? <option value={i.type_name}>{i.type_name}</option> : null}
                              {EXAM_TYPE_CHOICES.map((g) => (
                                <optgroup key={g.category} label={g.category}>
                                  {g.names.map((n) => (
                                    <option key={n} value={n}>
                                      {n}
                                    </option>
                                  ))}
                                </optgroup>
                              ))}
                            </select>
                          ) : (
                            <>
                              {i.type_name}
                              {i.matched_label ? (
                                <span className="block text-[10px]" style={{ color: SOFT }}>
                                  수업자료: {i.matched_label}
                                </span>
                              ) : null}
                            </>
                          )}
                        </td>
                        <td className="px-1 py-[3.5px]">
                          {editing ? (
                            <select
                              id={`level-${i.id}`}
                              className="ui-input h-7 py-0 text-[11.5px]"
                              value={i.level}
                              onChange={(e) => saveItem(i.id, { level: e.target.value as ExamLevel })}
                            >
                              {EXAM_LEVELS.map((l) => (
                                <option key={l} value={l}>
                                  {l}
                                </option>
                              ))}
                            </select>
                          ) : (
                            <span className="inline-block w-[22px] rounded-[3px] text-center text-[10.5px] font-bold" style={{ background: LV_BG[i.level], color: LV_INK[i.level] }}>
                              {i.level}
                            </span>
                          )}
                        </td>
                        <td className="whitespace-nowrap px-1 py-[3.5px] text-right tabular-nums">
                          {editing ? (
                            <input
                              id={`points-${i.id}`}
                              type="number"
                              step="0.1"
                              min="0"
                              className="ui-input h-7 w-14 py-0 text-right text-[11.5px]"
                              defaultValue={i.points ?? ""}
                              onBlur={(e) => {
                                const v = e.target.value === "" ? null : Number(e.target.value);
                                if (v !== i.points) saveItem(i.id, { points: v });
                              }}
                            />
                          ) : (
                            (i.points ?? "–")
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t" style={{ borderColor: "#f1ead9" }}>
                      <td className="px-1 py-[3.5px] font-bold">계</td>
                      <td className="px-1 py-[3.5px]">{items.length}문항</td>
                      <td />
                      <td className="px-1 py-[3.5px] text-right font-bold tabular-nums">{s.total}</td>
                    </tr>
                  </tbody>
                </table>
              </div>

              <div className="min-w-0">
                {s.subj.length ? (
                  <>
                    <h3 className={h3} style={{ color: NAVY }}>
                      서술형{" "}
                      <span className="text-[11px] font-semibold" style={{ color: SOFT }}>
                        {s.subj.length}문항 · {s.subjPts}점
                      </span>
                    </h3>
                    {s.subj.map((i) => (
                      <div key={i.id} className="mb-1.5 rounded-[11px] bg-white px-[11px] py-2">
                        <div className="flex justify-between font-bold">
                          <span>
                            {i.item_no} · {i.type_name}
                          </span>
                          <span>{i.points ?? "–"}점</span>
                        </div>
                        {i.conditions ? (
                          <p className="mt-px text-[11px]" style={{ color: SOFT }}>
                            {i.conditions}
                          </p>
                        ) : null}
                        {i.grammar_point ? (
                          <p className="text-[11px]" style={{ color: NAVY }}>
                            문법: {i.grammar_point}
                          </p>
                        ) : null}
                      </div>
                    ))}
                  </>
                ) : null}
                <h3 className={`${h3} mt-3`} style={{ color: NAVY }}>
                  다음 시험 대비 전략
                </h3>
                <ul className="list-disc space-y-[3px] pl-4">
                  {analysis.strategy.map((f) => (
                    <li key={f}>{f}</li>
                  ))}
                </ul>
              </div>
            </div>
          </A4Page>

          {/* 3쪽: 수업자료 적중 문항 (대조를 켰고 맞은 문항이 있을 때만) */}
          {showMatched ? (
            <A4Page footer={`${footer} · 3 / 3`}>
              <div className="flex items-baseline justify-between border-b-2 border-[#1f2937] pb-1.5">
                <b className="text-[15px]">{title} · 수업자료 적중 문항</b>
                <span className="text-[11px]" style={{ color: SOFT }}>
                  {meta.examLabel}
                </span>
              </div>
              <div className="grid grid-cols-3 gap-[9px]">
                {[
                  { v: `${s.matched.length}`, l: `적중 문항 / 전체 ${items.length}` },
                  { v: `${r1(sum(s.matched.map((i) => i.points)))}`, l: `적중 배점 · 총점의 ${pct(sum(s.matched.map((i) => i.points)))}%` },
                  { v: `${new Set(s.matched.map((i) => i.matched_item_id)).size}`, l: "맞은 수업자료 지문 수" },
                ].map((k) => (
                  <div key={k.l} className="rounded-[14px] bg-white px-[13px] py-[11px]">
                    <b className="block text-[29px] leading-[1.1] tabular-nums">{k.v}</b>
                    <span className="text-[11.5px]" style={{ color: SOFT }}>
                      {k.l}
                    </span>
                  </div>
                ))}
              </div>
              <div className="rounded-xl bg-white px-3 py-2">
                <table className="w-full border-collapse text-[11.5px]">
                  <thead>
                    <tr className="whitespace-nowrap text-left text-[10.5px]" style={{ color: SOFT }}>
                      <th className="px-1 py-1 font-semibold">번호</th>
                      <th className="px-1 py-1 font-semibold">유형</th>
                      <th className="px-1 py-1 font-semibold">난이도</th>
                      <th className="px-1 py-1 text-right font-semibold">배점</th>
                      <th className="px-1 py-1 font-semibold">수업자료</th>
                      <th className="px-1 py-1 font-semibold">시험지 지문 첫 부분</th>
                    </tr>
                  </thead>
                  <tbody>
                    {s.matched.map((i) => (
                      <tr key={i.id} className="border-t align-top" style={{ borderColor: "#f1ead9" }}>
                        <td className="whitespace-nowrap px-1 py-1 font-bold">{i.item_no}</td>
                        <td className="whitespace-nowrap px-1 py-1">{i.type_name}</td>
                        <td className="px-1 py-1">
                          <span className="inline-block w-[22px] rounded-[3px] text-center text-[10.5px] font-bold" style={{ background: LV_BG[i.level], color: LV_INK[i.level] }}>
                            {i.level}
                          </span>
                        </td>
                        <td className="px-1 py-1 text-right tabular-nums">{i.points ?? "–"}</td>
                        <td className="px-1 py-1 font-semibold" style={{ color: NAVY }}>
                          {i.matched_label}
                        </td>
                        <td className="px-1 py-1 text-[11px] italic" style={{ color: SOFT }}>
                          {(i.passage_excerpt ?? "").split(/\s+/).slice(0, 14).join(" ")}…
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-[11px]" style={{ color: SOFT }}>
                시험 지문 앞부분이 학원 수업자료에 넣어 둔 지문과 같은 문항입니다. 지문을 조금 바꿔 낸 문항도 포함됩니다.
              </p>
            </A4Page>
          ) : null}
        </div>
      </div>

    </div>
  );
}
