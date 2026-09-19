"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import {
  EXAM_CATEGORIES,
  EXAM_LEVELS,
  EXAM_TYPE_CHOICES,
  type ExamAnalysisRow,
  type ExamItemRow,
  type ExamLevel,
} from "@/lib/exam-analysis/types";

/** 보고서 색: 크림 바탕 위 주황·남색 (인포그래픽 시안) */
const CREAM = "#fbf7ef";
const LINE = "#e8dcc5";
const INK_SOFT = "#6b5f4b";
const LV_BG: Record<ExamLevel, string> = { 하: "#f1e3c6", 중: "#f3a712", 상: "#e4572e" };
const LV_INK: Record<ExamLevel, string> = { 하: INK_SOFT, 중: "#fff", 상: "#fff" };
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

/** 영역 도넛 (가운데에 전체 문항 수) */
function Donut({ parts, total }: { parts: { c: string; n: number }[]; total: number }) {
  const R = 100;
  const r = 62;
  let a = -Math.PI / 2;
  const n = sum(parts.map((p) => p.n)) || 1;
  const P = (ang: number, rad: number) => `${R + rad * Math.cos(ang)} ${R + rad * Math.sin(ang)}`;
  return (
    <svg viewBox="0 0 200 200" className="h-auto w-full max-w-[210px]" role="img" aria-label="영역별 문항 수">
      {parts.map((p) => {
        const a2 = a + (p.n / n) * Math.PI * 2;
        const big = a2 - a > Math.PI ? 1 : 0;
        const d =
          p.n === n
            ? `M ${R} ${R - R} A ${R} ${R} 0 1 1 ${R - 0.01} ${R - R} L ${R - 0.01} ${R - r} A ${r} ${r} 0 1 0 ${R} ${R - r} Z`
            : `M ${P(a, R)} A ${R} ${R} 0 ${big} 1 ${P(a2, R)} L ${P(a2, r)} A ${r} ${r} 0 ${big} 0 ${P(a, r)} Z`;
        a = a2;
        return <path key={p.c} d={d} fill={CAT_COLOR[p.c]} />;
      })}
      <text x={R} y={R - 2} textAnchor="middle" fontSize="34" fontWeight="700" fill="#1f2937">
        {total}
      </text>
      <text x={R} y={R + 20} textAnchor="middle" fontSize="12" fill={INK_SOFT}>
        문항
      </text>
    </svg>
  );
}

export function ExamReportView({
  analysis,
  items: initialItems,
  academyName,
  listHref,
}: {
  analysis: ExamAnalysisRow;
  items: ExamItemRow[];
  academyName: string;
  listHref: string;
}) {
  const router = useRouter();
  const [items, setItems] = useState(initialItems);
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
    return { total, subj, subjPts, hard, matched, cats, levels, avg };
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

  async function remove() {
    if (!window.confirm("이 시험 분석을 지울까요? 되돌릴 수 없어요.")) return;
    await fetch(`/api/exam-analysis/${analysis.id}`, { method: "DELETE" });
    router.push(listHref);
    router.refresh();
  }

  const title = [meta.schoolName || "학교 미입력", meta.grade ? `${meta.grade}학년` : "", meta.subject].filter(Boolean).join(" ");
  const showMatched = s.matched.length > 0;
  const h3 = "mb-2.5 text-[15px] font-bold text-[#29335c]";

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link href={listHref} className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-500 hover:text-slate-900">
          <Icon name="left" size={16} />
          시험 분석 목록
        </Link>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setEditing((v) => !v)}
            className={`h-9 rounded-lg border px-3.5 text-sm font-semibold ${editing ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}
          >
            {editing ? "고치기 끝" : "문항표 고치기"}
          </button>
          <button
            type="button"
            onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-sm font-semibold text-white hover:bg-slate-800"
          >
            <Icon name="print" size={15} /> 인쇄 / PDF
          </button>
        </div>
      </div>

      {analysis.missing ? (
        <p className="rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800 print:hidden">
          올라온 시험지에 빠진 부분이 있어요: {analysis.missing}. 빠진 문항은 보고서에 넣지 않았어요.
        </p>
      ) : null}

      <article
        className="mx-auto max-w-[860px] space-y-7 rounded-md px-5 py-8 text-[13px] leading-relaxed text-slate-900 shadow-[0_10px_30px_rgb(20_30_50/0.12)] [print-color-adjust:exact] sm:px-10 sm:py-10 print:max-w-none print:rounded-none print:shadow-none"
        style={{ background: CREAM }}
      >
        {/* 머리 */}
        <header className="flex flex-wrap items-end justify-between gap-4">
          <div className="min-w-0">
            <span className="inline-block rounded bg-[#1f2937] px-2.5 py-1 text-[11px] font-bold tracking-wider text-[#fbf7ef]">
              EXAM REPORT
            </span>
            {editMeta ? (
              <div className="mt-2 grid gap-2 sm:grid-cols-4 print:hidden">
                {(["schoolName", "grade", "subject", "examLabel"] as const).map((k) => (
                  <input
                    key={k}
                    id={`meta-${k}`}
                    className="ui-input h-9 text-sm"
                    value={meta[k]}
                    placeholder={{ schoolName: "학교", grade: "학년", subject: "과목", examLabel: "시험" }[k]}
                    onChange={(e) => setMeta({ ...meta, [k]: e.target.value })}
                  />
                ))}
                <div className="flex gap-2 sm:col-span-4">
                  <button type="button" onClick={saveMeta} disabled={saving} className="h-8 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white">
                    저장
                  </button>
                  <button type="button" onClick={() => setEditMeta(false)} className="h-8 rounded-md border border-slate-300 bg-white px-3 text-sm">
                    취소
                  </button>
                </div>
              </div>
            ) : (
              <h1 className="mt-2 text-[28px] font-bold leading-tight tracking-tight sm:text-[30px]">
                {title}
                <button
                  type="button"
                  onClick={() => setEditMeta(true)}
                  className="ml-2 align-middle text-xs font-semibold text-[#b8ad98] hover:text-brand-700 print:hidden"
                >
                  고치기
                </button>
              </h1>
            )}
            <p className="mt-1" style={{ color: INK_SOFT }}>
              {[meta.examLabel, `선택형 ${items.length - s.subj.length} · 서술형 ${s.subj.length}문항`, `${s.total}점`].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="text-right text-xs" style={{ color: INK_SOFT }}>
            <b className="block text-[15px] text-slate-900">{academyName}</b>
            분석일 {new Date(analysis.created_at).toLocaleDateString("ko-KR")}
          </div>
        </header>

        {/* 큰 숫자 */}
        <section className={`grid gap-2.5 ${showMatched ? "grid-cols-2 sm:grid-cols-5" : "grid-cols-2 sm:grid-cols-4"}`}>
          {[
            { v: `${items.length}`, l: "전체 문항" },
            { v: `${s.subjPts}`, l: `서술형 배점 · ${pct(s.subjPts)}%` },
            { v: `${s.avg}`, l: "평균 난이도 / 5" },
            { v: `${s.hard.length}`, l: `고난도 문항 · ${r1(sum(s.hard.map((i) => i.points)))}점` },
            ...(showMatched ? [{ v: `${s.matched.length}`, l: `수업자료 적중 · ${Math.round((s.matched.length / items.length) * 100)}%` }] : []),
          ].map((k) => (
            <div key={k.l} className="rounded-2xl bg-white px-4 py-3.5">
              <b className="block text-[32px] leading-tight tabular-nums">{k.v}</b>
              <span style={{ color: INK_SOFT }}>{k.l}</span>
            </div>
          ))}
        </section>

        {/* 영역 도넛 + 영역·난이도 목록 */}
        <section className="grid items-center gap-6 sm:grid-cols-[210px_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-[210px]">
            <Donut parts={s.cats} total={items.length} />
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div>
              <h3 className={h3}>영역별</h3>
              {s.cats.map((c) => (
                <div key={c.c} className="flex items-center justify-between border-b border-dashed py-1.5" style={{ borderColor: LINE }}>
                  <span>
                    <i className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-[-1px]" style={{ background: CAT_COLOR[c.c] }} />
                    {c.c}
                  </span>
                  <b className="tabular-nums">
                    {c.n}문항 · {c.pts}점
                  </b>
                </div>
              ))}
            </div>
            <div>
              <h3 className={h3}>난이도별</h3>
              {s.levels.map((l) => (
                <div key={l.l} className="border-b border-dashed py-1.5" style={{ borderColor: LINE }}>
                  <div className="flex items-center justify-between">
                    <span>
                      <i className="mr-2 inline-block h-2.5 w-2.5 rounded-full align-[-1px]" style={{ background: LV_BG[l.l] }} />
                      {l.l}
                    </span>
                    <b className="tabular-nums">
                      {l.n}문항 · {l.pts}점 ({pct(l.pts)}%)
                    </b>
                  </div>
                  <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-white">
                    <span className="block h-full rounded-full" style={{ width: `${pct(l.pts)}%`, background: LV_BG[l.l] }} />
                  </span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* 번호별 난이도 */}
        <section>
          <h3 className={h3}>문항 번호별 난이도</h3>
          <div className="flex flex-wrap gap-1.5">
            {items.map((i) => (
              <span
                key={i.id}
                title={`${i.item_no} ${i.type_name} · ${i.level}`}
                className={`flex h-10 w-10 items-center justify-center rounded-full text-xs font-bold tabular-nums ${i.is_subjective ? "ring-2 ring-[#29335c] ring-offset-1" : ""}`}
                style={{ background: LV_BG[i.level], color: LV_INK[i.level] }}
              >
                {i.item_no.replace("서술 ", "서")}
              </span>
            ))}
          </div>
          <p className="mt-2 text-xs" style={{ color: INK_SOFT }}>
            연한색 하 · 노랑 중 · 주황 상 · 테두리 = 서술형
          </p>
        </section>

        {/* 문항정보표 + 서술형·특징·전략 */}
        <section className="grid gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)]">
          <div className="min-w-0">
            <h3 className={h3}>문항정보표</h3>
            <div className="overflow-x-auto rounded-xl bg-white px-3 py-2">
              <table className="w-full border-collapse text-[12.5px]">
                <thead>
                  <tr className="text-left text-[11px]" style={{ color: INK_SOFT }}>
                    <th className="py-1.5 pr-2 font-semibold">번호</th>
                    <th className="py-1.5 pr-2 font-semibold">유형</th>
                    <th className="py-1.5 pr-2 font-semibold">난이도</th>
                    <th className="py-1.5 pr-2 text-right font-semibold">배점</th>
                    {showMatched ? <th className="py-1.5 pl-2 font-semibold">수업자료</th> : null}
                  </tr>
                </thead>
                <tbody>
                  {items.map((i) => (
                    <tr key={i.id} className="border-t align-middle" style={{ borderColor: "#f1ead9" }}>
                      <td className="whitespace-nowrap py-1 pr-2 font-bold">{i.item_no}</td>
                      <td className="py-1 pr-2">
                        {editing ? (
                          <select
                            id={`type-${i.id}`}
                            className="ui-input h-8 max-w-[180px] py-0 text-[12.5px]"
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
                            {i.edited ? <span className="ml-1 text-[10px] text-brand-600 print:hidden">고침</span> : null}
                          </>
                        )}
                      </td>
                      <td className="py-1 pr-2">
                        {editing ? (
                          <select
                            id={`level-${i.id}`}
                            className="ui-input h-8 py-0 text-[12.5px]"
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
                          <span
                            className="inline-block w-6 rounded text-center text-[11px] font-bold"
                            style={{ background: LV_BG[i.level], color: LV_INK[i.level] }}
                          >
                            {i.level}
                          </span>
                        )}
                      </td>
                      <td className="whitespace-nowrap py-1 pr-2 text-right tabular-nums">
                        {editing ? (
                          <input
                            id={`points-${i.id}`}
                            type="number"
                            step="0.1"
                            min="0"
                            className="ui-input h-8 w-16 py-0 text-right text-[12.5px]"
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
                      {showMatched ? <td className="max-w-[150px] py-1 pl-2 text-[11px]" style={{ color: INK_SOFT }}>{i.matched_label ?? ""}</td> : null}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <div className="min-w-0 space-y-6">
            {s.subj.length ? (
              <div>
                <h3 className={h3}>
                  서술형 <span className="text-xs font-semibold" style={{ color: INK_SOFT }}>{s.subj.length}문항 · {s.subjPts}점</span>
                </h3>
                <div className="space-y-2">
                  {s.subj.map((i) => (
                    <div key={i.id} className="rounded-xl bg-white px-3.5 py-2.5">
                      <div className="flex items-baseline justify-between gap-2">
                        <b>
                          {i.item_no} · {i.type_name}
                        </b>
                        <span className="shrink-0 font-bold tabular-nums">{i.points ?? "–"}점</span>
                      </div>
                      {i.conditions ? <p className="mt-0.5 text-xs" style={{ color: INK_SOFT }}>{i.conditions}</p> : null}
                      {i.grammar_point ? <p className="text-xs text-[#29335c]">문법: {i.grammar_point}</p> : null}
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
            <div>
              <h3 className={h3}>출제 특징</h3>
              <ul className="list-disc space-y-1 pl-4">
                {analysis.features.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className={h3}>다음 시험 대비 전략</h3>
              <ul className="list-disc space-y-1 pl-4">
                {analysis.strategy.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            </div>
          </div>
        </section>

        <footer className="flex flex-wrap justify-between gap-3 border-t pt-3 text-[11px]" style={{ borderColor: LINE, color: INK_SOFT }}>
          <span>{academyName} · 내신 시험 분석</span>
          <span>난이도는 지문 길이·어휘 수준·유형 난도·선택지·서술형 조건을 종합한 판단입니다.</span>
        </footer>
      </article>

      <div className="text-center print:hidden">
        <button type="button" onClick={remove} className="text-xs text-slate-400 hover:text-red-600">
          이 시험 분석 지우기
        </button>
      </div>
    </div>
  );
}
