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

const LV_STYLE: Record<ExamLevel, string> = {
  하: "bg-[#c9d8f4] text-slate-900",
  중: "bg-[#5b86d8] text-white",
  상: "bg-[#16398a] text-white",
};
const LV_FILL: Record<ExamLevel, string> = { 하: "#c9d8f4", 중: "#5b86d8", 상: "#16398a" };
const CAT_COLOR: Record<string, string> = {
  "대의 파악": "#2159c7",
  "세부 정보": "#0f8a7e",
  "논리·추론": "#b7791f",
  "어법·어휘": "#8a4fc4",
  서술형: "#c2410c",
  기타: "#64748b",
};

const r1 = (x: number) => Math.round(x * 10) / 10;
const sum = (xs: (number | null)[]) => xs.reduce<number>((s, x) => s + (Number(x) || 0), 0);

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
    return { total, subj, hard, matched, cats, levels, avg, maxN: Math.max(1, ...cats.map((c) => c.n)) };
  }, [items]);

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

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 print:hidden">
        <Link href={listHref} className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-500 hover:text-slate-900">
          <Icon name="left" size={16} />
          시험 분석 목록
        </Link>
        <div className="flex flex-wrap gap-2">
          <button type="button" onClick={() => setEditing((v) => !v)}
            className={`h-9 rounded-lg border px-3.5 text-sm font-semibold ${editing ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 bg-white text-slate-700 hover:bg-slate-50"}`}>
            {editing ? "고치기 끝" : "문항표 고치기"}
          </button>
          <button type="button" onClick={() => window.print()}
            className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-slate-900 px-3.5 text-sm font-semibold text-white hover:bg-slate-800">
            <Icon name="print" size={15} /> 인쇄 / PDF
          </button>
        </div>
      </div>

      {analysis.missing ? (
        <p className="rounded-lg bg-amber-50 px-4 py-2.5 text-sm text-amber-800 print:hidden">
          올라온 시험지에 빠진 부분이 있어요: {analysis.missing}. 빠진 문항은 보고서에 넣지 않았어요.
        </p>
      ) : null}

      <article className="mx-auto max-w-[860px] space-y-8 rounded-md bg-white px-6 py-8 shadow-[0_10px_30px_rgb(20_30_50/0.10)] sm:px-11 sm:py-10 print:max-w-none print:p-0 print:shadow-none">
        <header className="flex flex-wrap items-end justify-between gap-4 border-b-2 border-slate-900 pb-4">
          <div className="min-w-0">
            <p className="text-xs font-semibold tracking-[0.08em] text-brand-700">내신 시험 분석 보고서</p>
            {editMeta ? (
              <div className="mt-2 grid gap-2 sm:grid-cols-4 print:hidden">
                {(["schoolName", "grade", "subject", "examLabel"] as const).map((k) => (
                  <input key={k} id={`meta-${k}`} className="ui-input h-9 text-sm" value={meta[k]}
                    placeholder={{ schoolName: "학교", grade: "학년", subject: "과목", examLabel: "시험" }[k]}
                    onChange={(e) => setMeta({ ...meta, [k]: e.target.value })} />
                ))}
                <div className="flex gap-2 sm:col-span-4">
                  <button type="button" onClick={saveMeta} disabled={saving} className="h-8 rounded-md bg-brand-600 px-3 text-sm font-semibold text-white">저장</button>
                  <button type="button" onClick={() => setEditMeta(false)} className="h-8 rounded-md border border-slate-300 px-3 text-sm">취소</button>
                </div>
              </div>
            ) : (
              <h1 className="mt-1.5 font-serif text-[28px] font-black leading-tight tracking-tight text-slate-900">
                {title}
                <button type="button" onClick={() => setEditMeta(true)} className="ml-2 align-middle text-xs font-semibold text-slate-400 hover:text-brand-700 print:hidden">
                  고치기
                </button>
              </h1>
            )}
            <p className="mt-1.5 text-sm text-slate-600">
              {[meta.examLabel, `선택형 ${items.length - s.subj.length}문항`, `서술형 ${s.subj.length}문항`, `${s.total}점`].filter(Boolean).join(" · ")}
            </p>
          </div>
          <div className="text-right text-xs text-slate-500">
            <b className="block text-[15px] text-slate-900">{academyName}</b>
            분석일 {new Date(analysis.created_at).toLocaleDateString("ko-KR")}
          </div>
        </header>

        <section>
          <h2 className="mb-3 text-[17px] font-bold">한눈에 보기</h2>
          <div className="grid grid-cols-2 overflow-hidden rounded-lg border border-slate-200 sm:grid-cols-4">
            {[
              { l: "전체 문항", v: `${items.length}`, u: "문항", d: `선택형 ${items.length - s.subj.length} · 서술형 ${s.subj.length}` },
              { l: "서술형 배점", v: `${r1(sum(s.subj.map((i) => i.points)))}`, u: "점", d: s.total ? `총점의 ${Math.round((sum(s.subj.map((i) => i.points)) / s.total) * 100)}%` : "" },
              { l: "평균 난이도", v: `${s.avg}`, u: " / 5", d: `상 ${s.hard.length}문항 · ${r1(sum(s.hard.map((i) => i.points)))}점` },
              { l: "수업자료 적중", v: `${s.matched.length}`, u: "문항", d: s.matched.length ? `${Math.round((s.matched.length / Math.max(1, items.length)) * 100)}% · 우리 학원 수업자료 지문` : "수업자료 지문과 맞는 문항 없음" },
            ].map((k) => (
              <div key={k.l} className="border-b border-r border-slate-200 px-4 py-3.5 last:border-r-0 sm:border-b-0">
                <p className="text-xs text-slate-500">{k.l}</p>
                <p className="text-[26px] font-bold leading-tight tabular-nums">
                  {k.v}
                  <small className="text-sm font-semibold text-slate-600">{k.u}</small>
                </p>
                <p className="text-xs text-slate-600">{k.d}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-7 md:grid-cols-[1.25fr_1fr]">
          <div>
            <h2 className="mb-3 text-[17px] font-bold">
              유형별 분포 <small className="ml-1 text-xs font-medium text-slate-500">문항 수 · 배점</small>
            </h2>
            <div className="space-y-2.5">
              {s.cats.map((c) => (
                <div key={c.c} className="grid grid-cols-[84px_minmax(0,1fr)_96px] items-center gap-2.5 text-[13px]">
                  <span>{c.c}</span>
                  <span className="h-3.5 overflow-hidden rounded-sm bg-slate-100">
                    <span className="block h-full rounded-sm" style={{ width: `${(c.n / s.maxN) * 100}%`, background: CAT_COLOR[c.c] }} />
                  </span>
                  <span className="text-right tabular-nums text-slate-600">
                    <b className="text-slate-900">{c.n}</b>문항 · {c.pts}점
                  </span>
                </div>
              ))}
            </div>
          </div>
          <div>
            <h2 className="mb-3 text-[17px] font-bold">
              난이도 분포 <small className="ml-1 text-xs font-medium text-slate-500">배점 기준</small>
            </h2>
            <div className="flex h-[34px] overflow-hidden rounded-md text-xs font-semibold">
              {s.levels.filter((l) => l.pts > 0).map((l) => (
                <span key={l.l} className={`flex items-center justify-center whitespace-nowrap ${LV_STYLE[l.l]}`} style={{ flex: l.pts }}>
                  {l.l} {s.total ? Math.round((l.pts / s.total) * 100) : 0}%
                </span>
              ))}
            </div>
            <div className="mt-2 flex flex-wrap gap-3.5 text-xs text-slate-600">
              {s.levels.map((l) => (
                <span key={l.l}>
                  <i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm align-[-1px]" style={{ background: LV_FILL[l.l] }} />
                  {l.l} {l.n}문항 · {l.pts}점
                </span>
              ))}
            </div>
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[17px] font-bold">
            시험지 순서대로 본 난이도 <small className="ml-1 text-xs font-medium text-slate-500">굵은 테두리 = 서술형</small>
          </h2>
          <div className="grid gap-[3px]" style={{ gridTemplateColumns: `repeat(${Math.min(items.length, 26)}, minmax(0, 1fr))` }}>
            {items.map((i) => (
              <span key={i.id} title={`${i.item_no} ${i.type_name} · ${i.level}`}
                className={`flex h-8 items-center justify-center rounded-[3px] text-[11px] font-semibold tabular-nums ${LV_STYLE[i.level]} ${i.is_subjective ? "outline outline-2 -outline-offset-2 outline-slate-900" : ""}`}>
                {i.item_no.replace("서술 ", "서")}
              </span>
            ))}
          </div>
        </section>

        <section>
          <h2 className="mb-3 text-[17px] font-bold">문항정보표</h2>
          <div className="overflow-x-auto rounded-lg border border-slate-200">
            <table className="w-full min-w-[760px] border-collapse text-[13px]">
              <thead>
                <tr className="bg-slate-50 text-left text-xs text-slate-600">
                  {["번호", "영역", "유형", "난이도", "배점", "수업자료", "평가 요소"].map((h) => (
                    <th key={h} className="whitespace-nowrap border-b border-slate-200 px-2.5 py-2 font-semibold">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.map((i) => (
                  <tr key={i.id} className="border-b border-slate-100 align-top last:border-0">
                    <td className="whitespace-nowrap px-2.5 py-1.5 font-bold">{i.item_no}</td>
                    <td className="whitespace-nowrap px-2.5 py-1.5">{i.category}</td>
                    <td className="whitespace-nowrap px-2.5 py-1.5">
                      {editing ? (
                        <select id={`type-${i.id}`} className="ui-input h-8 py-0 text-[13px]" value={i.type_name}
                          onChange={(e) => saveItem(i.id, { typeName: e.target.value })}>
                          {!EXAM_TYPE_CHOICES.some((g) => g.names.includes(i.type_name)) ? <option value={i.type_name}>{i.type_name}</option> : null}
                          {EXAM_TYPE_CHOICES.map((g) => (
                            <optgroup key={g.category} label={g.category}>
                              {g.names.map((n) => <option key={n} value={n}>{n}</option>)}
                            </optgroup>
                          ))}
                        </select>
                      ) : (
                        <>{i.type_name}{i.edited ? <span className="ml-1 text-[10px] text-brand-600 print:hidden">고침</span> : null}</>
                      )}
                    </td>
                    <td className="px-2.5 py-1.5">
                      {editing ? (
                        <select id={`level-${i.id}`} className="ui-input h-8 py-0 text-[13px]" value={i.level}
                          onChange={(e) => saveItem(i.id, { level: e.target.value as ExamLevel })}>
                          {EXAM_LEVELS.map((l) => <option key={l} value={l}>{l}</option>)}
                        </select>
                      ) : (
                        <span className={`inline-block min-w-[22px] rounded px-1.5 text-center text-xs font-bold ${LV_STYLE[i.level]}`}>{i.level}</span>
                      )}
                    </td>
                    <td className="whitespace-nowrap px-2.5 py-1.5 text-right tabular-nums">
                      {editing ? (
                        <input id={`points-${i.id}`} type="number" step="0.1" min="0" className="ui-input h-8 w-16 py-0 text-right text-[13px]"
                          defaultValue={i.points ?? ""}
                          onBlur={(e) => {
                            const v = e.target.value === "" ? null : Number(e.target.value);
                            if (v !== i.points) saveItem(i.id, { points: v });
                          }} />
                      ) : (i.points ?? "–")}
                    </td>
                    <td className="max-w-[160px] px-2.5 py-1.5 text-xs text-slate-600">{i.matched_label ?? ""}</td>
                    <td className="px-2.5 py-1.5 text-xs text-slate-500">{(i.grammar_point || i.difficulty_reason || "").slice(0, 70)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {s.subj.length ? (
          <section>
            <h2 className="mb-3 text-[17px] font-bold">
              서술형 분석 <small className="ml-1 text-xs font-medium text-slate-500">{s.subj.length}문항 · {r1(sum(s.subj.map((i) => i.points)))}점</small>
            </h2>
            <div className="space-y-2.5">
              {s.subj.map((i) => (
                <div key={i.id} className="grid grid-cols-[60px_minmax(0,1fr)_48px] gap-3 rounded-lg bg-slate-50 px-3.5 py-3">
                  <span className="font-bold">{i.item_no}</span>
                  <span>
                    <b>{i.type_name}</b>
                    {i.conditions ? <span className="block text-[13px] text-slate-600">{i.conditions}</span> : null}
                    {i.grammar_point ? <span className="block text-xs text-slate-500">문법: {i.grammar_point}</span> : null}
                  </span>
                  <span className="text-right font-bold tabular-nums">{i.points ?? "–"}점</span>
                </div>
              ))}
            </div>
          </section>
        ) : null}

        <section className="grid gap-7 md:grid-cols-2">
          <div>
            <h2 className="mb-3 text-[17px] font-bold">출제 특징</h2>
            <ul className="list-disc space-y-1.5 pl-5">{analysis.features.map((f) => <li key={f}>{f}</li>)}</ul>
          </div>
          <div>
            <h2 className="mb-3 text-[17px] font-bold">다음 시험 대비 전략</h2>
            <ul className="list-disc space-y-1.5 pl-5">{analysis.strategy.map((f) => <li key={f}>{f}</li>)}</ul>
          </div>
        </section>

        <footer className="flex flex-wrap justify-between gap-3 border-t border-slate-200 pt-3 text-[11px] text-slate-500">
          <span>{academyName} · 내신 시험 분석</span>
          <span>난이도는 지문 길이·어휘 수준·유형 난도·선택지·서술형 조건을 종합한 판단입니다.</span>
        </footer>
      </article>

      <div className="text-center print:hidden">
        <button type="button" onClick={remove} className="text-xs text-slate-400 hover:text-red-600">이 시험 분석 지우기</button>
      </div>
    </div>
  );
}
