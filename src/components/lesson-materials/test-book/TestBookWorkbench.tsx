"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { postJson } from "@/lib/lesson-materials/post-json";
import { runWithConcurrency } from "@/lib/run-with-concurrency";
import type { renameLessonMaterialDocument } from "@/lib/lesson-materials/document-actions";
import { defaultDocumentName } from "@/lib/lesson-materials/documents";
import type {
  prepareTestBookPassageAction,
  saveTestBookOptionsAction,
} from "@/lib/lesson-materials/test-book-actions";
import {
  ALL_TEST_BOOK_TYPES,
  BASIC_TEST_BOOK_TYPES,
  TEST_BOOK_TYPES,
  buildTestSheet,
  buildWordTest,
  isTestBookProjectReady,
  type BlankMode,
  type TestBookOptions,
  type TestBookProjectInput,
  type TestBookTypeKey,
} from "@/lib/lesson-materials/test-book";
import { closeTabOrGo, useCreateDocumentFromUrl } from "@/components/lesson-materials/open-new-document";
import { useScaledHeight } from "@/components/lesson-materials/use-scaled-height";
import { downloadSheetsPdf, pdfFileName } from "@/lib/pdf/download-sheets-pdf";
import {
  AnswerSheets,
  BlankNoteSheets,
  LessonSheets,
  PlanSheets,
  TEST_BOOK_CSS,
  TEST_BOOK_FONTS_HREF,
  TestSheets,
  TranslationBackSheets,
  VocabSheets,
  WordTestSheets,
} from "@/components/lesson-materials/test-book/TestBookSheets";

type Mode = "book" | "draw";
type PrepareResult = Awaited<ReturnType<typeof prepareTestBookPassageAction>>;

const CONCURRENCY = 3;
const BOOK_SEED = "book";

const TRANSLATION_MODES: Array<{ id: TestBookOptions["translation"]; label: string }> = [
  { id: "show", label: "해석 있음" },
  { id: "hide", label: "해석 지움" },
  { id: "back", label: "뒤쪽에 모음" },
];

function newSeed(): string {
  return `draw-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** 고른 유형 가운데 n개를 무작위로(전부면 그대로) */
function pickTypes(types: TestBookTypeKey[], n: number): TestBookTypeKey[] {
  if (n <= 0 || n >= types.length) return types;
  const a = [...types];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  const on = new Set(a.slice(0, n));
  return ALL_TEST_BOOK_TYPES.filter((k) => on.has(k));
}

function TypeChecks({
  value,
  onChange,
}: {
  value: TestBookTypeKey[];
  onChange: (next: TestBookTypeKey[]) => void;
}) {
  const on = new Set(value);
  const toggle = (k: TestBookTypeKey) =>
    onChange(ALL_TEST_BOOK_TYPES.filter((x) => (x === k ? !on.has(x) : on.has(x))));
  return (
    <div className="space-y-2">
      {[true, false].map((basic) => (
        <div key={String(basic)} className="space-y-0.5">
          <p className="text-[10.5px] font-bold tracking-wide text-slate-400">{basic ? "기본" : "선택"}</p>
          {TEST_BOOK_TYPES.filter((t) => t.basic === basic).map((t) => (
            <label key={t.key} className="flex min-h-[26px] cursor-pointer items-center gap-2 text-[13px] text-slate-800" title={t.hint}>
              <input type="checkbox" className="h-4 w-4 accent-violet-600" checked={on.has(t.key)} onChange={() => toggle(t.key)} />
              <span className="flex-1">{t.label}</span>
            </label>
          ))}
        </div>
      ))}
      <div className="flex gap-1.5">
        <button type="button" onClick={() => onChange(BASIC_TEST_BOOK_TYPES)} className="h-7 flex-1 rounded-md border border-violet-300 bg-white text-[11px] font-semibold text-violet-800">
          기본 8종
        </button>
        <button type="button" onClick={() => onChange(ALL_TEST_BOOK_TYPES)} className="h-7 flex-1 rounded-md border border-slate-200 bg-white text-[11px] font-semibold text-slate-600">
          전부
        </button>
      </div>
    </div>
  );
}

export function TestBookWorkbench({
  role,
  projects: initialProjects,
  docId,
  docName = null,
  savedOptions,
  initialMode,
}: {
  role: "admin" | "teacher";
  projects: TestBookProjectInput[];
  docId: string | null;
  docName?: string | null;
  savedOptions: TestBookOptions;
  initialMode: Mode;
}) {
  const base = role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const docIdRef = useRef<string | null>(docId);
  const [mode, setMode] = useState<Mode>(initialMode);

  // ---------------------------------------------------------------- 제목
  const [title, setTitleValue] = useState(docName ?? "");
  const titleRef = useRef(docName ?? "");
  const setTitle = (v: string) => {
    titleRef.current = v;
    setTitleValue(v);
  };
  const savedTitle = useRef(docName ?? "");
  const startTitle = useRef(docName ?? "");
  useEffect(() => {
    if (docName) return;
    const fromUrl = new URLSearchParams(window.location.search).get("docName")?.trim();
    startTitle.current = fromUrl || defaultDocumentName("test_book");
    setTitle(startTitle.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  async function commitTitle() {
    const id = docIdRef.current;
    const name = titleRef.current.replace(/\s+/g, " ").trim();
    if (!name) return setTitle(savedTitle.current);
    if (!id || name === savedTitle.current) return;
    const res = await postJson<Awaited<ReturnType<typeof renameLessonMaterialDocument>>>("/api/lesson-materials/documents/open", {
      op: "rename",
      role,
      id,
      name,
    });
    if (res.ok) {
      savedTitle.current = res.name;
      setTitle(res.name);
    }
  }

  // ---------------------------------------------------------------- 교재 설정
  const [options, setOptionsState] = useState<TestBookOptions>(savedOptions);
  const optionsRef = useRef(options);
  const saveOptions = useCallback(async () => {
    const id = docIdRef.current;
    if (!id) return;
    await postJson<Awaited<ReturnType<typeof saveTestBookOptionsAction>>>("/api/lesson-materials/test-book", {
      op: "saveOptions",
      role,
      id,
      options: optionsRef.current,
    });
  }, [role]);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const setOptions = (patch: Partial<TestBookOptions>) => {
    const next = { ...optionsRef.current, ...patch };
    optionsRef.current = next;
    setOptionsState(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => void saveOptions(), 600);
  };

  useCreateDocumentFromUrl(role, "test_book", initialProjects.map((p) => p.id), (id, name) => {
    docIdRef.current = id;
    savedTitle.current = name;
    const typed = titleRef.current.trim();
    if (!typed || typed === startTitle.current) setTitle(name);
    else void commitTitle();
    void saveOptions();
  });

  // ---------------------------------------------------------------- 재료 준비
  const [projects, setProjects] = useState(initialProjects);
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [started, setStarted] = useState(false);

  const runPrepare = useCallback(
    async (targets: TestBookProjectInput[], forceRegenerate: boolean) => {
      if (!targets.length) return;
      setPendingIds((prev) => new Set([...prev, ...targets.map((p) => p.id)]));
      setErrors((prev) => {
        const next = { ...prev };
        for (const p of targets) delete next[p.id];
        return next;
      });
      await runWithConcurrency(targets, CONCURRENCY, async (p) => {
        let message: string | null = null;
        try {
          const res = await postJson<PrepareResult>("/api/lesson-materials/test-book", {
            role,
            projectId: p.id,
            forceRegenerate,
          });
          if (res.ok) {
            setProjects((prev) =>
              prev.map((x) => (x.id === p.id ? { ...x, content: res.content, material: res.material, sentences: res.sentences } : x))
            );
          } else message = res.message;
        } catch (e) {
          message = e instanceof Error ? e.message : "만들지 못했습니다.";
        }
        if (message) setErrors((prev) => ({ ...prev, [p.id]: message! }));
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(p.id);
          return next;
        });
      });
    },
    [role]
  );

  /** 파일 없이 연 뽑기 화면은 재료를 새로 만들지 않는다(값이 들지 않게). 교재를 먼저 만든 지문만 뽑는다. */
  const drawOnly = initialMode === "draw" && !docId;
  useEffect(() => {
    if (started) return;
    setStarted(true);
    if (drawOnly) return;
    void runPrepare(initialProjects.filter((p) => !isTestBookProjectReady(p)), false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------- 뽑기
  const ready = projects.filter(isTestBookProjectReady);
  const [drawIds, setDrawIds] = useState<Set<string>>(() => new Set(initialProjects.map((p) => p.id)));
  const [drawTypes, setDrawTypes] = useState<TestBookTypeKey[]>(BASIC_TEST_BOOK_TYPES);
  const [drawCount, setDrawCount] = useState(3);
  const [blankMode, setBlankMode] = useState<BlankMode>("same");
  const [drawAnswers, setDrawAnswers] = useState(true);
  const [draw, setDraw] = useState<{ seed: string; picks: Record<string, TestBookTypeKey[]> } | null>(null);
  function runDraw() {
    const picks: Record<string, TestBookTypeKey[]> = {};
    for (const p of ready) if (drawIds.has(p.id)) picks[p.id] = pickTypes(drawTypes, drawCount);
    setDraw({ seed: newSeed(), picks });
  }

  // ---------------------------------------------------------------- 미리보기·인쇄
  const [zoom, setZoom] = useState(80);
  const scaled = useScaledHeight<HTMLDivElement>(zoom / 100);
  const [fontsTick, setFontsTick] = useState(0);
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    let alive = true;
    const bump = () => alive && setFontsTick((t) => t + 1);
    void document.fonts.ready.then(bump);
    document.fonts.addEventListener?.("loadingdone", bump);
    return () => {
      alive = false;
      document.fonts.removeEventListener?.("loadingdone", bump);
    };
  }, []);
  useEffect(() => {
    const el = document.createElement("style");
    el.textContent = `@media print{@page{size:210mm 297mm;margin:0}#tb-print-root{transform:none !important;gap:0 !important}}`;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);
  const [pdfBusy, setPdfBusy] = useState<string | null>(null);
  const [pdfError, setPdfError] = useState<string | null>(null);
  async function savePdf() {
    const root = document.getElementById("tb-print-root");
    if (!root) return;
    const pages = Array.from(root.querySelectorAll<HTMLElement>(".tb-sheet")).filter((el) => !el.closest(".tb-measure"));
    const part = mode === "book" ? "교재" : "테스트지";
    setPdfError(null);
    setPdfBusy(`0/${pages.length}`);
    try {
      await downloadSheetsPdf(pages, pdfFileName(title.trim() || "테스트 교재", part), {
        onProgress: (done, total) => setPdfBusy(`${done}/${total}`),
      });
    } catch (e) {
      setPdfError(e instanceof Error ? e.message : "PDF를 만들지 못했습니다.");
    } finally {
      setPdfBusy(null);
    }
  }

  const measureKey = `${fontsTick}|${options.translation}|${options.types.join(",")}|${mode}|${draw?.seed ?? ""}`;
  const previewStyle = useMemo((): CSSProperties => ({ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }), [zoom]);
  const indexOf = (id: string) => projects.findIndex((p) => p.id === id);
  const busy = pendingIds.size > 0;
  const errorList = projects.filter((p) => errors[p.id]);

  const book = useMemo(
    () =>
      ready.map((p) => ({
        project: p,
        word: buildWordTest(p, BOOK_SEED),
        sheet: buildTestSheet(p, options.types, { seed: BOOK_SEED, blankMode: "same" }),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready.map((p) => p.id).join(","), projects, options.types]
  );
  const drawn = useMemo(() => {
    if (!draw) return [];
    return ready
      .filter((p) => draw.picks[p.id])
      .map((p) => ({ project: p, sheet: buildTestSheet(p, draw.picks[p.id]!, { seed: draw.seed, blankMode }) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw, blankMode, projects]);

  if (projects.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Alert variant="error">선택된 자료가 없습니다.</Alert>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-200 print:static print:z-auto print:block print:bg-white">
      <aside className="flex w-[272px] shrink-0 flex-col border-r border-slate-200 bg-white print:hidden">
        <div className="space-y-2.5 border-b border-slate-100 p-4">
          <button type="button" onClick={() => closeTabOrGo(base)} className="text-left text-xs font-semibold text-violet-700">
            ← 자료함
          </button>
          <h1 className="flex items-center gap-1.5 text-base font-bold text-slate-900">
            테스트 교재 <span className="rounded bg-violet-600 px-1.5 py-0.5 text-[10px] font-bold text-white">NEW</span>
          </h1>
          <input
            className="w-full rounded-lg border border-slate-200 px-2.5 py-1.5 text-sm text-slate-900 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
            value={title}
            maxLength={80}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => void commitTitle()}
            onKeyDown={(e) => {
              if (e.key === "Enter") (e.target as HTMLInputElement).blur();
            }}
            aria-label="자료 제목"
          />
          <div className={`grid gap-1 rounded-lg bg-slate-100 p-1 ${drawOnly ? "grid-cols-1" : "grid-cols-2"}`}>
            {(drawOnly ? (["draw"] as const) : (["book", "draw"] as const)).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => setMode(m)}
                className={`rounded-md py-1.5 text-xs font-bold ${mode === m ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
              >
                {m === "book" ? "교재" : "테스트지 뽑기"}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            지문 {projects.length}개 · {busy ? `${ready.length}/${projects.length} 준비됨` : `${ready.length}개 준비됨`}
          </p>
        </div>

        <div className="flex-1 space-y-4 overflow-auto p-4">
          {mode === "book" ? (
            <>
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500">수업용 자료 해석</p>
                <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
                  {TRANSLATION_MODES.map((t) => (
                    <button
                      key={t.id}
                      type="button"
                      onClick={() => setOptions({ translation: t.id })}
                      className={`rounded-md px-1 py-1.5 text-[11px] font-bold ${options.translation === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-500">넣을 쪽</p>
                {(
                  [
                    ["plan", "학습 계획표·이수표 (맨 앞)"],
                    ["blankNote", "백지노트 2쪽 (지문마다)"],
                    ["answers", "정답지 (맨 뒤)"],
                  ] as const
                ).map(([k, label]) => (
                  <label key={k} className="flex min-h-[26px] items-center gap-2 text-[13px] text-slate-800">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-violet-600"
                      checked={options[k]}
                      onChange={(e) => setOptions({ [k]: e.target.checked } as Partial<TestBookOptions>)}
                    />
                    {label}
                  </label>
                ))}
              </div>
              <div className="space-y-2 rounded-lg border border-violet-200 bg-violet-50/60 p-3">
                <p className="text-xs font-bold text-violet-900">테스트 견본에 실을 유형</p>
                <TypeChecks value={options.types} onChange={(types) => setOptions({ types })} />
                <p className="text-[11px] leading-relaxed text-slate-500">
                  유형을 바꿔도 다시 만들지 않아 크레딧이 들지 않습니다. 학원 테스트지는 「테스트지 뽑기」에서 새로 뽑습니다.
                </p>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-500">범위</p>
                {projects.map((p, i) => (
                  <label key={p.id} className="flex min-h-[26px] items-center gap-2 text-[13px] text-slate-800">
                    <input
                      type="checkbox"
                      className="h-4 w-4 accent-violet-600"
                      disabled={!isTestBookProjectReady(p)}
                      checked={drawIds.has(p.id)}
                      onChange={() =>
                        setDrawIds((prev) => {
                          const next = new Set(prev);
                          if (next.has(p.id)) next.delete(p.id);
                          else next.add(p.id);
                          return next;
                        })
                      }
                    />
                    <span className="min-w-0 flex-1 truncate">
                      {String(i + 1).padStart(2, "0")} {p.title}
                    </span>
                    {!isTestBookProjectReady(p) && !pendingIds.has(p.id) ? (
                      <span className="shrink-0 text-[10px] font-semibold text-amber-600">먼저 교재 제작</span>
                    ) : null}
                  </label>
                ))}
              </div>
              <div className="space-y-2 rounded-lg border border-violet-200 bg-violet-50/60 p-3">
                <p className="text-xs font-bold text-violet-900">유형 (고른 것 중에서 무작위)</p>
                <TypeChecks value={drawTypes} onChange={setDrawTypes} />
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500">한 지문에 넣을 유형 수</p>
                <select
                  value={drawCount}
                  onChange={(e) => setDrawCount(Number(e.target.value))}
                  className="w-full rounded-lg border border-slate-200 px-2 py-1.5 text-sm"
                >
                  {[2, 3, 4, 5].map((n) => (
                    <option key={n} value={n}>
                      {n}개
                    </option>
                  ))}
                  <option value={0}>고른 유형 전부</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <p className="text-[11px] font-bold text-slate-500">빈칸 자리</p>
                <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                  {(
                    [
                      ["same", "견본과 같은 자리"],
                      ["diff", "다른 자리"],
                    ] as const
                  ).map(([id, label]) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setBlankMode(id)}
                      className={`rounded-md px-1 py-1.5 text-[11px] font-bold ${blankMode === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </div>
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input type="checkbox" checked={drawAnswers} onChange={(e) => setDrawAnswers(e.target.checked)} />
                정답지 함께
              </label>
              <Button type="button" className="w-full" disabled={!ready.some((p) => drawIds.has(p.id)) || !drawTypes.length} onClick={runDraw}>
                {draw ? "다시 뽑기" : "뽑기"}
              </Button>
              <p className="text-[11px] leading-relaxed text-slate-500">
                누를 때마다 문항·보기 순서가 새로 나옵니다. 중요문장은 교재와 같고, 어순배열은 같은 덩어리를 새로 섞습니다. 값이 들지 않습니다.
              </p>
            </>
          )}
          {errorList.length > 0 ? (
            <Alert variant="error">
              {errorList.map((p) => (
                <span key={p.id} className="block">
                  {String(indexOf(p.id) + 1).padStart(2, "0")}: {errors[p.id]}
                </span>
              ))}
            </Alert>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-slate-100 p-4">
          {errorList.length > 0 ? (
            <Button type="button" size="sm" variant="secondary" className="w-full" onClick={() => void runPrepare(errorList.filter((p) => !pendingIds.has(p.id)), false)}>
              못 만든 지문 다시 시도 ({errorList.length})
            </Button>
          ) : null}
          <Button type="button" size="sm" variant="secondary" className="w-full" disabled={busy || !!pdfBusy || (mode === "draw" && !drawn.length)} onClick={() => void savePdf()}>
            {pdfBusy ? `PDF 만드는 중… ${pdfBusy}` : "PDF로 저장"}
          </Button>
          {pdfError ? <p className="text-[11px] font-semibold text-rose-600">{pdfError}</p> : null}
          <Button type="button" size="sm" className="w-full" disabled={busy || (mode === "draw" && !drawn.length)} onClick={() => window.print()}>
            {busy ? `지문 준비 중 (${ready.length}/${projects.length})` : "인쇄"}
          </Button>
        </div>
      </aside>

      <main className="relative min-w-0 flex-1 overflow-auto print:static print:overflow-visible">
        <div className="sticky top-0 z-10 flex items-center justify-center gap-2 border-b border-slate-200/80 bg-white/90 px-4 py-2 backdrop-blur print:hidden">
          <span className="mr-2 text-xs font-semibold text-slate-500">A4</span>
          <button type="button" className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs" onClick={() => setZoom((z) => Math.max(40, z - 10))}>
            −
          </button>
          <span className="text-xs font-semibold text-slate-600">{zoom}%</span>
          <button type="button" className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs" onClick={() => setZoom((z) => Math.min(120, z + 10))}>
            +
          </button>
        </div>
        <link rel="stylesheet" href={TEST_BOOK_FONTS_HREF} />
        <style>{TEST_BOOK_CSS}</style>
        <div className="flex flex-col items-center p-6 print:block print:p-0">
          <div style={scaled.frameStyle} className="print:!h-auto print:!overflow-visible">
            <div ref={scaled.ref} id="tb-print-root" className="relative flex origin-top flex-col gap-6 print:gap-0 print:!transform-none [&_.tb-sheet]:shadow" style={previewStyle}>
              {mode === "book" ? (
                <>
                  {options.plan && ready.length ? <PlanSheets projects={ready} types={options.types} measureKey={measureKey} /> : null}
                  {projects.map((p, i) => {
                    const entry = book.find((b) => b.project.id === p.id);
                    if (!entry) {
                      return (
                        <div key={p.id} className="flex h-[50mm] w-[210mm] flex-col items-center justify-center rounded bg-white/70 text-sm text-slate-500 shadow print:hidden">
                          <span className="font-bold text-slate-700">
                            {String(i + 1).padStart(2, "0")} · {p.title}
                          </span>
                          <span className="mt-1 text-xs">
                            {pendingIds.has(p.id) ? "단어 정리·테스트 재료를 만들고 있습니다…" : (errors[p.id] ?? "준비되지 않았습니다.")}
                          </span>
                        </div>
                      );
                    }
                    return (
                      <div key={p.id} className="contents">
                        <VocabSheets index={i} project={entry.project} measureKey={measureKey} />
                        <WordTestSheets index={i} project={entry.project} test={entry.word} measureKey={measureKey} />
                        <LessonSheets index={i} project={entry.project} translation={options.translation} measureKey={measureKey} />
                        <TestSheets index={i} project={entry.project} sheet={entry.sheet} title="테스트 견본" measureKey={measureKey} />
                        {options.blankNote ? <BlankNoteSheets index={i} project={entry.project} /> : null}
                      </div>
                    );
                  })}
                  {options.translation === "back" && ready.length ? <TranslationBackSheets projects={ready} measureKey={measureKey} /> : null}
                  {options.answers && book.length ? (
                    <AnswerSheets
                      entries={book.map((b) => ({ index: indexOf(b.project.id), project: b.project, word: b.word, sheet: b.sheet }))}
                      measureKey={measureKey}
                    />
                  ) : null}
                </>
              ) : drawn.length ? (
                <>
                  {drawn.map((d) => (
                    <TestSheets key={d.project.id} index={indexOf(d.project.id)} project={d.project} sheet={d.sheet} title="테스트" measureKey={measureKey} />
                  ))}
                  {drawAnswers ? (
                    <AnswerSheets
                      title="테스트 정답"
                      entries={drawn.map((d) => ({ index: indexOf(d.project.id), project: d.project, sheet: d.sheet }))}
                      measureKey={measureKey}
                    />
                  ) : null}
                </>
              ) : (
                <div className="flex h-[60mm] w-[210mm] items-center justify-center rounded bg-white/70 text-sm text-slate-500 shadow print:hidden">
                  {busy ? "지문을 준비하고 있습니다…" : "왼쪽에서 범위와 유형을 고르고 「뽑기」를 누르세요."}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
