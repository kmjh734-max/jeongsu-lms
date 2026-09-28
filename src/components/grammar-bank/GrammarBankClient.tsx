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

  const [questions, setQuestions] = useState<GrammarQuestion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [picked, setPicked] = useState<number[]>([]);
  const [pickedRows, setPickedRows] = useState<Map<number, GrammarQuestion>>(
    new Map(),
  );

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
    setQuestions([]);
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
    if (tier != null) params.set("tier", String(tier));
    fetch(`/api/grammar-bank/questions?${params.toString()}`, {
      signal: controller.signal,
    })
      .then((res) => res.json())
      .then((json) => {
        if (!json.ok) throw new Error(json.message ?? "문항을 불러오지 못했습니다.");
        setQuestions(json.questions as GrammarQuestion[]);
      })
      .catch((e) => {
        if (e.name === "AbortError") return;
        setError(e.message);
        setQuestions([]);
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [level, chapterNo, tier]);

  const pickedList = useMemo(
    () =>
      picked
        .map((id) => pickedRows.get(id))
        .filter((q): q is GrammarQuestion => Boolean(q)),
    [picked, pickedRows],
  );

  function toggle(q: GrammarQuestion) {
    setPicked((prev) =>
      prev.includes(q.id) ? prev.filter((id) => id !== q.id) : [...prev, q.id],
    );
    setPickedRows((prev) => {
      const next = new Map(prev);
      next.set(q.id, q);
      return next;
    });
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
  }

  const defaultTitle = chapter
    ? `${level?.level_name} ${chapter.chapter_no}과 ${chapter.chapter}`
    : "중학 문법";

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
              담은 문항 {pickedList.length}개
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
          </div>
        </div>

        <div className="overflow-x-auto">
          <GrammarPrintSheets questions={pickedList} options={options} />
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
                    <li key={q.id}>
                      <button
                        type="button"
                        onClick={() => toggle(q)}
                        className={`flex w-full gap-3 rounded-md border p-3 text-left transition ${
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
                              {GRAMMAR_TIERS.find((t) => t.tier === q.tier)?.label ??
                                "2단계 실력"}
                            </span>
                            {q.question_kind ? <span>{q.question_kind}</span> : null}
                            {q.point_label ? (
                              <span className="text-slate-500">{q.point_label}</span>
                            ) : null}
                            {q.choices.length === 0 ? (
                              <span className="rounded bg-slate-100 px-1.5 py-0.5 font-semibold text-slate-500">
                                서술형
                              </span>
                            ) : null}
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
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </div>
      </div>

      <div className="sticky bottom-0 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white p-4 shadow-sm">
        <p className="text-sm text-slate-600">
          담은 문항{" "}
          <b className="text-slate-900">{picked.length}</b>개
          {picked.length > 0 ? (
            <button
              type="button"
              onClick={() => setPicked([])}
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
    </div>
  );
}
