"use client";

import { useEffect, useMemo, useState } from "react";
import {
  GRAMMAR_SHEET_STYLES,
  GRAMMAR_TIERS,
  type GrammarChapterGroup,
  type GrammarQuestion,
  type GrammarSheetStyle,
} from "@/lib/grammar-bank/types";
import {
  GrammarPrintSheets,
  type GrammarPrintOptions,
} from "./GrammarPrintSheets";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

/** 단계가 비어 있는 문항은 2단계로 본다 (단원 목록의 개수와 같은 기준) */
function tierOf(q: GrammarQuestion) {
  return q.tier ?? 2;
}

/** 보기가 없으면 서술형 */
function kindOf(q: GrammarQuestion): "mcq" | "written" {
  return q.choices.length === 0 ? "written" : "mcq";
}

const KINDS = [
  { key: "mcq" as const, label: "객관식" },
  { key: "written" as const, label: "서술형" },
];

type Plan = Record<number, { mcq: number; written: number }>;

const EMPTY_PLAN: Plan = {
  1: { mcq: 0, written: 0 },
  2: { mcq: 0, written: 0 },
  3: { mcq: 0, written: 0 },
};

function shuffled<T>(list: T[]) {
  const out = [...list];
  for (let i = out.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j]!, out[i]!];
  }
  return out;
}

/** 목록에서는 밑줄 표시([[ ]])를 벗겨 보여 준다 */
function plain(text: string) {
  return text.replace(/\[\[(.*?)\]\]/g, "$1");
}

export function GrammarBankClient({
  groups,
  academyName,
}: {
  groups: GrammarChapterGroup[];
  academyName: string;
}) {
  const [levelIdx, setLevelIdx] = useState(0);
  const [chapterNo, setChapterNo] = useState<number | null>(null);
  const [tier, setTier] = useState<number | null>(null);

  const [allQuestions, setAllQuestions] = useState<GrammarQuestion[]>([]);
  const [unit, setUnit] = useState<string | null>(null);   // 세부 단원 ("" 는 세부 없는 것)
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [picked, setPicked] = useState<number[]>([]);
  const [pickedRows, setPickedRows] = useState<Map<number, GrammarQuestion>>(
    new Map(),
  );

  const [plan, setPlan] = useState<Plan>(EMPTY_PLAN);
  const [planOpen, setPlanOpen] = useState(true);
  const [planRandom, setPlanRandom] = useState(false);
  const [planNote, setPlanNote] = useState<string | null>(null);

  const [objectiveFirst, setObjectiveFirst] = useState(true);
  const [view, setView] = useState<"pick" | "print">("pick");
  const [options, setOptions] = useState<GrammarPrintOptions>({
    style: "f",
    title: "",
    subtitle: "",
    academyName,
    showName: true,
    timeLimit: "",
    withAnswers: true,
  });

  const level = groups[levelIdx];
  const chapter = level?.chapters.find((c) => c.chapter_no === chapterNo) ?? null;

  useEffect(() => {
    setChapterNo(null);
    setTier(null);
    setAllQuestions([]);
  }, [level]);

  useEffect(() => {
    if (!level || chapterNo == null) return;
    const controller = new AbortController();
    setLoading(true);
    setError(null);
    const params = new URLSearchParams({
      level: String(level.level),
      chapter: String(chapterNo),
    });
    fetch(`/api/grammar-bank/questions?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok) throw new Error(json.message ?? "문항을 불러오지 못했습니다.");
        setAllQuestions(json.questions as GrammarQuestion[]);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(e.message);
        setAllQuestions([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [level, chapterNo]);

  /** 이 단원의 세부 단원 — 문항이 있는 것만, 많은 차례로 */
  const unitOptions = useMemo(() => {
    const table = new Map<string, number>();
    for (const q of allQuestions) table.set(q.unit ?? "", (table.get(q.unit ?? "") ?? 0) + 1);
    const named = [...table.entries()]
      .filter(([name]) => name)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]));
    const blank = table.get("") ?? 0;
    return blank > 0 ? [...named, ["", blank] as [string, number]] : named;
  }, [allQuestions]);

  /** 세부 단원을 옮긴다 — 화면을 먼저 바꾸고, 어긋나면 되돌린다 */
  async function moveUnit(id: number, unit: string) {
    const before = allQuestions;
    setAllQuestions((prev) =>
      prev.map((q) => (q.id === id ? { ...q, unit } : q)),
    );
    try {
      const res = await fetch("/api/grammar-bank/questions", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, unit }),
      });
      const got = (await res.json()) as { ok: boolean; message?: string };
      if (!got.ok) throw new Error(got.message ?? "옮기지 못했습니다.");
    } catch (e) {
      setAllQuestions(before);
      setError(e instanceof Error ? e.message : "옮기지 못했습니다.");
    }
  }

  /** 세부 단원을 고르면 그 안에서만 담는다 */
  const scoped = useMemo(
    () => (unit == null ? allQuestions : allQuestions.filter((q) => (q.unit ?? "") === unit)),
    [allQuestions, unit],
  );

  const questions = useMemo(
    () => (tier == null ? scoped : scoped.filter((q) => tierOf(q) === tier)),
    [scoped, tier],
  );

  /** 이 단원에 단계·유형별로 몇 문항이 있는지 */
  const stock = useMemo(() => {
    const table: Plan = { 1: { mcq: 0, written: 0 }, 2: { mcq: 0, written: 0 }, 3: { mcq: 0, written: 0 } };
    for (const q of scoped) {
      const row = table[tierOf(q)];
      if (row) row[kindOf(q)] += 1;
    }
    return table;
  }, [scoped]);

  const pickedList = useMemo(
    () =>
      picked
        .map((id) => pickedRows.get(id))
        .filter((q): q is GrammarQuestion => Boolean(q)),
    [picked, pickedRows],
  );

  /** 담은 문항을 단계·유형별로 센 것 */
  const basket = useMemo(() => {
    const table: Plan = { 1: { mcq: 0, written: 0 }, 2: { mcq: 0, written: 0 }, 3: { mcq: 0, written: 0 } };
    let mcq = 0;
    let written = 0;
    for (const q of pickedList) {
      const row = table[tierOf(q)];
      if (row) row[kindOf(q)] += 1;
      if (kindOf(q) === "written") written += 1;
      else mcq += 1;
    }
    return { table, mcq, written };
  }, [pickedList]);

  const planTotal = useMemo(
    () =>
      GRAMMAR_TIERS.reduce(
        (sum, t) => sum + (plan[t.tier]?.mcq ?? 0) + (plan[t.tier]?.written ?? 0),
        0,
      ),
    [plan],
  );

  function setPlanCount(tierNo: number, kind: "mcq" | "written", value: number) {
    const max = stock[tierNo]?.[kind] ?? 0;
    const next = Math.max(0, Math.min(max, value));
    setPlan((prev) => ({ ...prev, [tierNo]: { ...prev[tierNo]!, [kind]: next } }));
    setPlanNote(null);
  }

  /** 정한 문항 수에 맞게 이 단원 문항을 담거나 뺀다 */
  function applyPlan() {
    let ids = [...picked];
    const rows = new Map(pickedRows);
    const short: string[] = [];

    for (const t of GRAMMAR_TIERS) {
      for (const kind of KINDS) {
        const want = plan[t.tier]?.[kind.key] ?? 0;
        const pool = scoped.filter(
          (q) => tierOf(q) === t.tier && kindOf(q) === kind.key,
        );
        const poolIds = new Set(pool.map((q) => q.id));
        const have = ids.filter((id) => poolIds.has(id));

        if (have.length > want) {
          const drop = new Set(have.slice(want));
          ids = ids.filter((id) => !drop.has(id));
          continue;
        }
        if (have.length === want) continue;

        const taken = new Set(ids);
        const rest = pool.filter((q) => !taken.has(q.id));
        const need = want - have.length;
        const chosen = (planRandom ? shuffled(rest) : rest).slice(0, need);
        for (const q of chosen) {
          ids.push(q.id);
          rows.set(q.id, q);
        }
        if (chosen.length < need) {
          short.push(`${t.label} ${kind.label} ${need - chosen.length}문항`);
        }
      }
    }

    setPicked(ids);
    setPickedRows(rows);
    setPlanNote(
      short.length > 0
        ? `${short.join(", ")}은 이 단원에 남은 문항이 모자라 담지 못했습니다.`
        : `정한 대로 ${planTotal}문항을 담았습니다.`,
    );
  }

  function fillPlanFromStock() {
    setPlan({
      1: { ...stock[1]! },
      2: { ...stock[2]! },
      3: { ...stock[3]! },
    });
    setPlanNote(null);
  }

  function toggle(q: GrammarQuestion) {
    setPicked((prev) =>
      prev.includes(q.id) ? prev.filter((id) => id !== q.id) : [...prev, q.id],
    );
    setPickedRows((prev) => {
      const next = new Map(prev);
      next.set(q.id, q);
      return next;
    });
    setPlanNote(null);
  }

  function pickAll() {
    setPicked((prev) => {
      const ids = new Set(prev);
      for (const q of questions) ids.add(q.id);
      return [...ids];
    });
    setPickedRows((prev) => {
      const next = new Map(prev);
      for (const q of questions) next.set(q.id, q);
      return next;
    });
    setPlanNote(null);
  }

  const defaultTitle = chapter
    ? `${level?.level_name} ${chapter.chapter_no}과 ${chapter.chapter}`
    : "중학 문법";

  /** 인쇄에 넘길 차례 — 객관식을 앞에 모을 수 있다 */
  const sheetQuestions = useMemo(() => {
    if (!objectiveFirst) return pickedList;
    return [...pickedList].sort(
      (a, b) =>
        (kindOf(a) === "written" ? 1 : 0) - (kindOf(b) === "written" ? 1 : 0),
    );
  }, [pickedList, objectiveFirst]);

  function openPrint() {
    setOptions((prev) => ({
      ...prev,
      title: prev.title || defaultTitle,
      subtitle: prev.subtitle,
    }));
    setView("print");
  }

  if (view === "print") {
    return (
      <div className="space-y-4">
        <div className="no-print flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4">
          <div>
            <p className="text-sm font-semibold text-slate-900">인쇄 설정</p>
            <p className="mt-0.5 text-xs text-slate-500">
              담은 문항 {pickedList.length}개 · 객관식 {basket.mcq}개 · 서술형{" "}
              {basket.written}개
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setView("pick")}
              className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              문항 고르기로
            </button>
            <button
              type="button"
              onClick={() => window.print()}
              className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700"
            >
              인쇄
            </button>
          </div>
        </div>

        <div className="no-print rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-xs font-semibold text-slate-500">서식</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-3 lg:grid-cols-5">
            {GRAMMAR_SHEET_STYLES.map((style) => (
              <button
                key={style.key}
                type="button"
                onClick={() =>
                  setOptions((prev) => ({
                    ...prev,
                    style: style.key as GrammarSheetStyle,
                  }))
                }
                className={`rounded-md border px-3 py-2 text-left transition ${
                  options.style === style.key
                    ? "border-brand-500 bg-brand-50"
                    : "border-slate-200 hover:bg-slate-50"
                }`}
              >
                <span className="block text-sm font-semibold text-slate-900">
                  {style.label}
                </span>
                <span className="mt-0.5 block text-[11px] leading-snug text-slate-500">
                  {style.hint}
                </span>
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">제목</span>
              <input
                className="ui-input mt-1"
                value={options.title}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, title: e.target.value }))
                }
                placeholder={defaultTitle}
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">부제</span>
              <input
                className="ui-input mt-1"
                value={options.subtitle}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, subtitle: e.target.value }))
                }
                placeholder="중2 내신 대비 · 1회"
              />
            </label>
            <label className="block">
              <span className="text-xs font-semibold text-slate-500">
                제한시간
              </span>
              <input
                className="ui-input mt-1"
                value={options.timeLimit}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, timeLimit: e.target.value }))
                }
                placeholder="20분"
              />
            </label>
          </div>

          <div className="mt-3 flex flex-wrap gap-4 text-sm text-slate-700">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.showName}
                onChange={(e) =>
                  setOptions((prev) => ({ ...prev, showName: e.target.checked }))
                }
              />
              이름·반·점수 줄 넣기
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={options.withAnswers}
                onChange={(e) =>
                  setOptions((prev) => ({
                    ...prev,
                    withAnswers: e.target.checked,
                  }))
                }
              />
              정답지 함께 뽑기
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={objectiveFirst}
                onChange={(e) => setObjectiveFirst(e.target.checked)}
              />
              객관식 먼저, 서술형 뒤로
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <GrammarPrintSheets questions={sheetQuestions} options={options} />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        {groups.map((group, i) => (
          <button
            key={group.level}
            type="button"
            onClick={() => setLevelIdx(i)}
            className={`rounded-md px-3 py-1.5 text-sm font-semibold transition ${
              i === levelIdx
                ? "bg-brand-600 text-white"
                : "bg-white text-slate-600 ring-1 ring-slate-200 hover:bg-slate-50"
            }`}
          >
            {group.level_name}
          </button>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[260px_minmax(0,1fr)]">
        <div className="rounded-lg border border-slate-200 bg-white">
          <p className="border-b border-slate-100 px-4 py-3 text-xs font-semibold text-slate-500">
            단원
          </p>
          <ul className="max-h-[560px] overflow-y-auto py-1">
            {(level?.chapters ?? []).map((c) => (
              <li key={c.chapter_no}>
                <button
                  type="button"
                  onClick={() => {
                    setChapterNo(c.chapter_no);
                    setTier(null);
                    setUnit(null);
                  }}
                  className={`flex w-full items-center justify-between gap-2 px-4 py-2 text-left text-sm transition ${
                    chapterNo === c.chapter_no
                      ? "bg-brand-50 font-semibold text-brand-700"
                      : "text-slate-700 hover:bg-slate-50"
                  }`}
                >
                  <span className="truncate">
                    {c.chapter_no}. {c.chapter}
                  </span>
                  <span className="shrink-0 text-xs text-slate-400">
                    {c.question_count}
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </div>

        <div className="space-y-4">
          {/* 세부 단원 — 「to부정사」 안에서 명사적·부사적처럼 더 좁혀 담는다 */}
          {chapterNo != null && unitOptions.length > 1 ? (
            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3">
              <p className="text-xs font-semibold text-slate-500">세부 단원</p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => setUnit(null)}
                  aria-pressed={unit === null}
                  className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                    unit === null
                      ? "bg-brand-600 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  전체 {allQuestions.length}
                </button>
                {unitOptions.map(([name, count]) => (
                  <button
                    key={name || "(없음)"}
                    type="button"
                    onClick={() => setUnit(unit === name ? null : name)}
                    aria-pressed={unit === name}
                    className={`rounded-full px-3 py-1 text-xs font-semibold transition ${
                      unit === name
                        ? "bg-brand-600 text-white"
                        : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                    }`}
                  >
                    {name || "세부 없음"} {count}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {chapterNo != null && allQuestions.length > 0 ? (
            <div className="rounded-lg border border-slate-200 bg-white">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">
                    단계별 출제 문항 수
                  </p>
                  <p className="mt-0.5 text-xs text-slate-500">
                    정한 수만큼 이 단원에서 골라 담습니다. 줄이면 담긴 문항도
                    함께 빠집니다.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPlanOpen((v) => !v)}
                  className="rounded px-2 py-1 text-xs font-semibold text-slate-500 hover:bg-slate-100"
                >
                  {planOpen ? "접기 ▲" : "펼치기 ▼"}
                </button>
              </div>

              {planOpen ? (
                <div className="px-4 py-3">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-xs text-slate-500">
                        <th className="pb-2 text-left font-semibold">단계</th>
                        {KINDS.map((k) => (
                          <th key={k.key} className="pb-2 text-center font-semibold">
                            {k.label}
                          </th>
                        ))}
                        <th className="pb-2 text-right font-semibold">합계</th>
                      </tr>
                    </thead>
                    <tbody>
                      {GRAMMAR_TIERS.map((t) => {
                        const row = plan[t.tier]!;
                        return (
                          <tr key={t.tier} className="border-t border-slate-100">
                            <td className="py-2 pr-2">
                              <span
                                className="font-medium text-slate-800"
                                title={t.hint}
                              >
                                {t.label}
                              </span>
                            </td>
                            {KINDS.map((k) => {
                              const max = stock[t.tier]?.[k.key] ?? 0;
                              return (
                                <td key={k.key} className="py-2 text-center">
                                  <div className="inline-flex items-center gap-1">
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPlanCount(t.tier, k.key, row[k.key] - 1)
                                      }
                                      disabled={row[k.key] <= 0}
                                      className="h-6 w-6 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                                    >
                                      −
                                    </button>
                                    <input
                                      type="number"
                                      min={0}
                                      max={max}
                                      value={row[k.key]}
                                      onChange={(e) =>
                                        setPlanCount(
                                          t.tier,
                                          k.key,
                                          Number(e.target.value) || 0,
                                        )
                                      }
                                      className="w-12 rounded border border-slate-200 py-0.5 text-center tabular-nums"
                                    />
                                    <button
                                      type="button"
                                      onClick={() =>
                                        setPlanCount(t.tier, k.key, row[k.key] + 1)
                                      }
                                      disabled={row[k.key] >= max}
                                      className="h-6 w-6 rounded border border-slate-300 text-slate-600 hover:bg-slate-50 disabled:opacity-30"
                                    >
                                      ＋
                                    </button>
                                    <span className="ml-1 w-8 text-left text-[11px] text-slate-400">
                                      /{max}
                                    </span>
                                  </div>
                                </td>
                              );
                            })}
                            <td className="py-2 text-right tabular-nums text-slate-600">
                              {row.mcq + row.written}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>

                  <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
                    <label className="flex items-center gap-2 text-xs text-slate-600">
                      <input
                        type="checkbox"
                        checked={planRandom}
                        onChange={(e) => setPlanRandom(e.target.checked)}
                      />
                      무작위로 고르기 (끄면 교재 차례대로)
                    </label>
                    <div className="flex flex-wrap items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setPlan(EMPTY_PLAN);
                          setPlanNote(null);
                        }}
                        className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        0으로
                      </button>
                      <button
                        type="button"
                        onClick={fillPlanFromStock}
                        className="rounded-md border border-slate-300 px-2.5 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                      >
                        이 단원 전부
                      </button>
                      <button
                        type="button"
                        onClick={applyPlan}
                        disabled={planTotal === 0}
                        className="rounded-md bg-slate-900 px-3 py-1.5 text-xs font-semibold text-white hover:bg-slate-800 disabled:opacity-40"
                      >
                        이대로 담기 ({planTotal}문항)
                      </button>
                    </div>
                  </div>

                  {planNote ? (
                    <p className="mt-2 text-xs text-slate-500">{planNote}</p>
                  ) : null}
                </div>
              ) : null}
            </div>
          ) : null}

          <div className="rounded-lg border border-slate-200 bg-white">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3">
              <div className="flex flex-wrap items-center gap-2">
                <button
                  type="button"
                  onClick={() => setTier(null)}
                  className={`rounded px-2.5 py-1 text-xs font-semibold ${
                    tier == null
                      ? "bg-slate-900 text-white"
                      : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                  }`}
                >
                  전체
                </button>
                {GRAMMAR_TIERS.map((t) => {
                  const found = chapter?.tiers.find((x) => x.tier === t.tier);
                  return (
                    <button
                      key={t.tier}
                      type="button"
                      title={t.hint}
                      onClick={() => setTier(t.tier)}
                      disabled={!found}
                      className={`rounded px-2.5 py-1 text-xs font-semibold disabled:opacity-40 ${
                        tier === t.tier
                          ? "bg-slate-900 text-white"
                          : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                      }`}
                    >
                      {t.label}
                      <span className="ml-1 font-normal text-slate-400">
                        {found?.question_count ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={pickAll}
                  disabled={questions.length === 0}
                  className="rounded-md border border-slate-300 px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40"
                >
                  모두 담기
                </button>
              </div>
            </div>

            <div className="max-h-[560px] overflow-y-auto px-4 py-3">
              {chapterNo == null ? (
                <p className="py-10 text-center text-sm text-slate-400">
                  왼쪽에서 단원을 고르세요.
                </p>
              ) : loading ? (
                <p className="py-10 text-center text-sm text-slate-400">
                  불러오는 중…
                </p>
              ) : error ? (
                <p className="py-10 text-center text-sm text-red-600">{error}</p>
              ) : questions.length === 0 ? (
                <p className="py-10 text-center text-sm text-slate-400">
                  문항이 없습니다.
                </p>
              ) : (
                <ul className="space-y-2">
                  {questions.map((q) => {
                    const on = picked.includes(q.id);
                    return (
                      <li key={q.id} className="relative">
                        <button
                          type="button"
                          onClick={() => toggle(q)}
                          className={`flex w-full gap-3 rounded-md border p-3 pr-[168px] text-left transition ${
                            on
                              ? "border-brand-400 bg-brand-50/60"
                              : "border-slate-200 hover:bg-slate-50"
                          }`}
                        >
                          <span
                            className={`mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center rounded border text-[10px] font-bold ${
                              on
                                ? "border-brand-600 bg-brand-600 text-white"
                                : "border-slate-300 text-transparent"
                            }`}
                          >
                            ✓
                          </span>
                          <span className="min-w-0 flex-1">
                            <span className="flex flex-wrap items-center gap-1.5 text-[11px] text-slate-400">
                              <span className="font-semibold text-slate-500">
                                {GRAMMAR_TIERS.find((t) => t.tier === tierOf(q))
                                  ?.label ?? "2단계 실력"}
                              </span>
                              {q.question_kind ? <span>{q.question_kind}</span> : null}
                              {q.point_label ? (
                                <span className="text-slate-500">{q.point_label}</span>
                              ) : null}
                              <span
                                className={`rounded px-1.5 py-0.5 font-semibold ${
                                  kindOf(q) === "written"
                                    ? "bg-amber-100 text-amber-700"
                                    : "bg-slate-100 text-slate-500"
                                }`}
                              >
                                {kindOf(q) === "written" ? "서술형" : "객관식"}
                              </span>
                            </span>
                            <span className="mt-1 block truncate text-sm font-medium text-slate-800">
                              {plain(q.prompt)}
                            </span>
                            {q.body.length > 0 ? (
                              <span className="mt-0.5 block truncate text-xs text-slate-500">
                                {plain(q.body.join(" "))}
                              </span>
                            ) : null}
                            {q.choices.length > 0 ? (
                              <span className="mt-0.5 block truncate text-xs text-slate-400">
                                {q.choices
                                  .map(
                                    (c) =>
                                      `${CIRCLED[c.no - 1] ?? c.no} ${plain(c.text)}`,
                                  )
                                  .join("  ")}
                              </span>
                            ) : null}
                          </span>
                        </button>
                        {/* 세부 단원은 문제를 보고 자동으로 붙인 것이라 더러 어긋난다 —
                            눈에 걸리면 여기서 바로 옮긴다 */}
                        {unitOptions.length > 1 ? (
                          <select
                            value={q.unit ?? ""}
                            onChange={(e) => moveUnit(q.id, e.target.value)}
                            aria-label="세부 단원"
                            title="세부 단원 — 어긋났으면 바꿔 주세요"
                            className="absolute right-3 top-3 h-7 max-w-[150px] rounded border border-slate-200 bg-white px-1.5 text-[11px] text-slate-500 hover:border-slate-300"
                          >
                            {unitOptions.map(([name]) => (
                              <option key={name || "(없음)"} value={name}>
                                {name || "세부 없음"}
                              </option>
                            ))}
                          </select>
                        ) : null}
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 space-y-2 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <p className="text-sm text-slate-600">
            담은 문항 <b className="text-slate-900">{picked.length}</b>개
            <span className="ml-2 text-xs text-slate-500">
              객관식 {basket.mcq} · 서술형 {basket.written}
            </span>
            {picked.length > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setPicked([]);
                  setPlanNote(null);
                }}
                className="ml-3 text-xs font-semibold text-slate-400 underline hover:text-slate-600"
              >
                비우기
              </button>
            ) : null}
          </p>
          <button
            type="button"
            onClick={openPrint}
            disabled={picked.length === 0}
            className="rounded-md bg-brand-600 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-700 disabled:opacity-40"
          >
            시험지 만들기
          </button>
        </div>
        {picked.length > 0 ? (
          <div className="flex flex-wrap gap-2 text-[11px] text-slate-500">
            {GRAMMAR_TIERS.map((t) => {
              const row = basket.table[t.tier]!;
              if (row.mcq + row.written === 0) return null;
              return (
                <span
                  key={t.tier}
                  className="rounded bg-slate-100 px-2 py-0.5 font-medium"
                >
                  {t.label} 객관식 {row.mcq} · 서술형 {row.written}
                </span>
              );
            })}
          </div>
        ) : null}
      </div>
    </div>
  );
}
