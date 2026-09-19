"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import type { MockSlot } from "@/lib/exam-analysis/blueprint";
import type { MaterialPassage } from "@/lib/exam-analysis/load";

type Chosen =
  | { kind: "material"; id: string; label: string; words: number }
  | { kind: "text"; key: string; title: string; text: string };

const LV: Record<string, string> = { 하: "bg-[#f1e3c6] text-[#6b5f4b]", 중: "bg-[#f3a712] text-white", 상: "bg-[#e4572e] text-white" };

/** 동형모의고사 만들기: 시험 범위 지문을 고르고, 원래 시험의 지문 묶음마다 새 지문을 배정한다 */
export function ExamMockBuilder({
  analysisId,
  examTitle,
  slots,
  groupCount,
  materials,
  backHref,
  generationsHref,
  pricePerQuestion,
  round,
  initialPassageIds = [],
}: {
  analysisId: string;
  examTitle: string;
  slots: MockSlot[];
  groupCount: number;
  materials: MaterialPassage[];
  backHref: string;
  generationsHref: string;
  pricePerQuestion: number;
  /** 이번에 만들 회차(이 시험으로 만든 동형모의고사 수 + 1) */
  round: number;
  /** 수업자료에서 골라 들어온 지문(수업자료 id) — 고른 순서대로 미리 넣어 둔다 */
  initialPassageIds?: string[];
}) {
  const router = useRouter();
  const [tab, setTab] = useState<"material" | "paste">(materials.length ? "material" : "paste");
  const [query, setQuery] = useState("");
  const [chosen, setChosen] = useState<Chosen[]>(() =>
    initialPassageIds
      .map((id) => materials.find((m) => m.id === id))
      .filter((m): m is MaterialPassage => Boolean(m))
      .map((m) => ({ kind: "material", id: m.id, label: `${m.project} · ${m.title}`, words: m.words }))
  );
  const [draft, setDraft] = useState({ title: "", text: "" });
  const [override, setOverride] = useState<Record<number, number>>({});
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const groups = useMemo(() => {
    const out: MockSlot[][] = Array.from({ length: groupCount }, () => []);
    for (const s of slots) out[s.group]!.push(s);
    return out;
  }, [slots, groupCount]);
  const assignment = groups.map((_, g) => {
    const o = override[g];
    // 회차마다 한 칸씩 밀어 같은 지문이 같은 번호에 다시 오지 않게 한다
    return chosen.length ? (o !== undefined && o < chosen.length ? o : (g + round - 1) % chosen.length) : -1;
  });

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return materials.filter((m) => !q || `${m.project} ${m.title} ${m.preview}`.toLowerCase().includes(q)).slice(0, 200);
  }, [materials, query]);
  const byProject = useMemo(() => {
    const map = new Map<string, MaterialPassage[]>();
    for (const m of filtered) map.set(m.project, [...(map.get(m.project) ?? []), m]);
    return [...map.entries()];
  }, [filtered]);

  const isChosen = (id: string) => chosen.some((c) => c.kind === "material" && c.id === id);
  function toggleMaterial(m: MaterialPassage) {
    setChosen((prev) =>
      isChosen(m.id)
        ? prev.filter((c) => !(c.kind === "material" && c.id === m.id))
        : [...prev, { kind: "material", id: m.id, label: `${m.project} · ${m.title}`, words: m.words }]
    );
  }
  function addText() {
    const words = draft.text.trim().split(/\s+/).filter(Boolean).length;
    if (words < 40) {
      setMessage("영어 지문 전체(40단어 이상)를 붙여 넣어 주세요.");
      return;
    }
    setMessage(null);
    setChosen((prev) => [...prev, { kind: "text", key: `t${Date.now()}`, title: draft.title.trim() || `붙여 넣은 지문 ${prev.length + 1}`, text: draft.text.trim() }]);
    setDraft({ title: "", text: "" });
  }
  function move(i: number, d: -1 | 1) {
    setChosen((prev) => {
      const next = [...prev];
      const j = i + d;
      if (j < 0 || j >= next.length) return prev;
      [next[i], next[j]] = [next[j]!, next[i]!];
      return next;
    });
  }
  const labelOf = (c: Chosen) => (c.kind === "material" ? c.label : c.title);

  async function create() {
    setBusy(true);
    setMessage(null);
    try {
      const res = await fetch(`/api/exam-analysis/${analysisId}/mock`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          passages: chosen.map((c) => (c.kind === "material" ? { materialItemId: c.id } : { text: c.text, title: c.title })),
          assignment,
          round,
        }),
      });
      const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string; jobId?: string };
      if (!res.ok || !data.ok || !data.jobId) throw new Error(data.message ?? "만들지 못했어요.");
      router.push(`${generationsHref}/${data.jobId}`);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "만들지 못했어요.");
      setBusy(false);
    }
  }

  const total = slots.reduce((s, x) => s + (x.points ?? 0), 0);
  const substituted = slots.filter((s) => s.substituted).length;

  return (
    <div className="space-y-5">
      <div>
        <Link href={backHref} className="inline-flex items-center gap-1 text-[13px] font-medium text-slate-500 hover:text-slate-900">
          <Icon name="left" size={16} />
          분석 보고서
        </Link>
        <h1 className="mt-2 text-xl font-bold tracking-tight text-slate-900 sm:text-[22px]">동형모의고사 {round}회 만들기</h1>
        <p className="mt-1 text-sm text-slate-500">
          {examTitle}와 같은 번호·유형·난이도·배점으로 새 시험지를 만들어요. 시험 범위 지문만 골라 주세요.
        </p>
        <div className="mt-3 flex flex-wrap gap-2 text-xs">
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">{slots.length}문항 · {Math.round(total * 10) / 10}점</span>
          <span className="rounded-full bg-slate-100 px-2.5 py-1 font-semibold text-slate-700">원래 시험 지문 {groupCount}개</span>
          {round > 1 ? (
            <span className="rounded-full bg-brand-50 px-2.5 py-1 font-semibold text-brand-700">
              {round - 1}회와 지문 자리가 겹치지 않게 배정했어요
            </span>
          ) : null}
          {substituted ? (
            <span className="rounded-full bg-amber-50 px-2.5 py-1 font-semibold text-amber-800">비슷한 유형으로 만드는 문항 {substituted}</span>
          ) : null}
        </div>
      </div>

      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
        {/* 1. 지문 고르기 */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">1. 시험 범위 지문</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            원래 시험처럼 지문 {groupCount}개를 고르면 한 지문씩 배정돼요. 적게 고르면 돌아가며 여러 번 써요.
          </p>
          <div className="mt-3 flex gap-1 rounded-lg bg-slate-100 p-1 text-sm font-semibold">
            {(
              [
                ["material", `수업자료에서 고르기 ${materials.length ? `(${materials.length})` : ""}`],
                ["paste", "직접 붙여 넣기"],
              ] as const
            ).map(([k, l]) => (
              <button key={k} type="button" onClick={() => setTab(k)} className={`flex-1 rounded-md py-1.5 ${tab === k ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}>
                {l}
              </button>
            ))}
          </div>

          {tab === "material" ? (
            materials.length ? (
              <div className="mt-3">
                <input id="mock-search" className="ui-input h-9 text-sm" placeholder="자료 이름·지문으로 찾기" value={query} onChange={(e) => setQuery(e.target.value)} />
                <div className="mt-2 max-h-[420px] space-y-3 overflow-y-auto pr-1">
                  {byProject.map(([project, list]) => (
                    <div key={project}>
                      <p className="sticky top-0 bg-white py-1 text-xs font-bold text-slate-500">{project}</p>
                      <ul className="space-y-1">
                        {list.map((m) => (
                          <li key={m.id}>
                            <label className={`flex cursor-pointer gap-2 rounded-lg border px-2.5 py-2 text-sm ${isChosen(m.id) ? "border-brand-400 bg-brand-50/60" : "border-slate-200 hover:border-slate-300"}`}>
                              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-brand-600" checked={isChosen(m.id)} onChange={() => toggleMaterial(m)} />
                              <span className="min-w-0">
                                <b className="font-semibold text-slate-900">{m.title}</b>
                                <span className="ml-1.5 text-xs text-slate-400">{m.words}단어</span>
                                <span className="block truncate text-xs text-slate-500">{m.preview}…</span>
                              </span>
                            </label>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <p className="mt-3 rounded-lg bg-slate-50 px-3 py-4 text-sm text-slate-500">아직 수업자료가 없어요. 지문을 직접 붙여 넣어 주세요.</p>
            )
          ) : (
            <div className="mt-3 space-y-2">
              <input id="mock-paste-title" className="ui-input h-9 text-sm" placeholder="지문 이름 (예: 3과 본문)" value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} />
              <textarea id="mock-paste-text" rows={7} className="ui-input text-sm" placeholder="영어 지문 전체를 붙여 넣으세요" value={draft.text} onChange={(e) => setDraft({ ...draft, text: e.target.value })} />
              <button type="button" onClick={addText} className="h-9 rounded-lg border border-brand-300 bg-brand-50 px-3.5 text-sm font-semibold text-brand-700 hover:bg-brand-100">
                + 이 지문 추가
              </button>
            </div>
          )}

          <div className="mt-4">
            <p className="text-sm font-bold text-slate-900">고른 지문 {chosen.length}</p>
            {chosen.length ? (
              <ol className="mt-1.5 space-y-1">
                {chosen.map((c, i) => (
                  <li key={c.kind === "material" ? c.id : c.key} className="flex items-center gap-2 rounded-lg bg-slate-50 px-2.5 py-1.5 text-sm">
                    <span className="w-5 text-xs font-bold text-slate-400">{i + 1}</span>
                    <span className="min-w-0 flex-1 truncate">{labelOf(c)}</span>
                    <button type="button" aria-label="위로" onClick={() => move(i, -1)} className="text-[10px] text-slate-400 hover:text-slate-700">▲</button>
                    <button type="button" aria-label="아래로" onClick={() => move(i, 1)} className="text-[10px] text-slate-400 hover:text-slate-700">▼</button>
                    <button type="button" aria-label="빼기" onClick={() => setChosen((p) => p.filter((_, k) => k !== i))} className="text-slate-400 hover:text-red-600">
                      <Icon name="x" size={14} />
                    </button>
                  </li>
                ))}
              </ol>
            ) : (
              <p className="mt-1 text-xs text-slate-400">위에서 지문을 골라 주세요.</p>
            )}
          </div>
        </section>

        {/* 2. 설계도 */}
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <h2 className="text-base font-bold text-slate-900">2. 문항 설계도</h2>
          <p className="mt-0.5 text-xs text-slate-500">원래 시험의 지문 묶음마다 새 지문이 들어가요. 바꾸려면 오른쪽에서 고르세요.</p>
          {slots.some((s) => /^(sentence_insertion|irrelevant_sentence):/.test(s.optionKey)) ? (
            <p className="mt-1 text-xs text-slate-500">
              문장 삽입·무관한 문장은 6문장 이상인 지문에서 만들어요. 고른 지문이 모두 짧으면 같은 난이도의 순서 배열로 만들어요.
            </p>
          ) : null}
          <ul className="mt-3 space-y-2">
            {groups.map((g, gi) => (
              <li key={gi} className="rounded-lg border border-slate-200 p-2.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="text-xs font-bold text-slate-500">지문 {gi + 1}</span>
                  <select
                    id={`assign-${gi}`}
                    className="ui-input h-8 max-w-[260px] py-0 text-[13px]"
                    value={assignment[gi] ?? -1}
                    disabled={!chosen.length}
                    onChange={(e) => setOverride({ ...override, [gi]: Number(e.target.value) })}
                  >
                    {!chosen.length ? <option value={-1}>지문을 먼저 골라 주세요</option> : null}
                    {chosen.map((c, i) => (
                      <option key={i} value={i}>
                        {i + 1}. {labelOf(c)}
                      </option>
                    ))}
                  </select>
                </div>
                <ul className="mt-1.5 space-y-1">
                  {g.map((s) => (
                    <li key={s.no} className="flex items-center gap-2 text-[13px]">
                      <b className="w-12 shrink-0">{s.no}</b>
                      <span className={`w-6 shrink-0 rounded text-center text-[11px] font-bold ${LV[s.level]}`}>{s.level}</span>
                      <span className="min-w-0 flex-1 truncate">
                        {s.typeLabel}
                        {s.substituted ? <span className="ml-1 text-[11px] text-amber-700">(원래 {s.sourceType} → 비슷한 유형)</span> : null}
                      </span>
                      <span className="shrink-0 tabular-nums text-slate-500">{s.points ?? "–"}점</span>
                    </li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </section>
      </div>

      <div className="sticky bottom-3 flex flex-wrap items-center justify-end gap-3 rounded-xl border border-slate-200 bg-white/95 px-4 py-3 shadow-lg backdrop-blur">
        {message ? <span className="text-sm text-red-600">{message}</span> : null}
        <span className="text-sm text-slate-500">
          {slots.length}문항 · 약 {(slots.length * pricePerQuestion).toLocaleString("ko-KR")}크레딧 (만든 문항 수만큼)
        </span>
        <button
          type="button"
          onClick={create}
          disabled={busy || chosen.length === 0}
          className="h-10 rounded-lg bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-50"
        >
          {busy ? "만드는 중…" : `동형모의고사 ${round}회 만들기`}
        </button>
      </div>
    </div>
  );
}
