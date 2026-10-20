"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { postJson } from "@/lib/lesson-materials/post-json";
import { askCreditConfirm } from "@/lib/credits/confirm-store";
import { runWithConcurrency } from "@/lib/run-with-concurrency";
import type { renameLessonMaterialDocument } from "@/lib/lesson-materials/document-actions";
import { defaultDocumentName } from "@/lib/lesson-materials/documents";
import type {
  prepareTestBookPassageAction,
  registerTestBookVocabAction,
  saveTestBookOptionsAction,
} from "@/lib/lesson-materials/test-book-actions";
import {
  ALL_TEST_BOOK_TYPES,
  BASIC_TEST_BOOK_TYPES,
  TEST_BOOK_TYPES,
  buildTestSheet,
  buildWordTest,
  isTestBookProjectReady,
  TEST_BOOK_BLEED_COVER,
  TEST_BOOK_DEFAULT_HEADLINE,
  testBookTypeLabel,
  type BlankMode,
  type WritingScope,
  type LineMode,
  type TestBookOptions,
  type TestBookProjectInput,
  type TestBookTypeKey,
} from "@/lib/lesson-materials/test-book";
import { closeTabOrGo, useCreateDocumentFromUrl } from "@/components/lesson-materials/open-new-document";
import { useScaledHeight } from "@/components/lesson-materials/use-scaled-height";
import { downloadSheetsPdf, pdfFileName } from "@/lib/pdf/download-sheets-pdf";
import type { generateAndSaveAnalysisReportAction } from "@/lib/lesson-materials/analysis-report-actions";
import type { generateGrammarChoicePassageAction } from "@/lib/lesson-materials/workbook-actions";
import { DESIGN_FONTS_HREF, DESIGN_STYLES, designClass } from "@/lib/lesson-materials/analysis-design";
import { COVER_PRESETS, coverPreset, type IntegratedCover } from "@/lib/lesson-materials/integrated";
import {
  AllVocabSheets,
  AnalysisSheets,
  CoverSheet,
  ContentsSheet,
  DividerSheet,
  PassageDividerSheet,
  partStyle,
  type BookPart,
  AllWordAnswerSheets,
  AllWordTestSheets,
  AnswerSheets,
  BlankNoteSheets,
  LessonSheets,
  PlanSheets,
  TEST_BOOK_CSS,
  TestBookBrand,
  TEST_BOOK_FONTS_HREF,
  TestSheets,
  TranslationBackSheets,
  VocabSheets,
  WordTestSheets,
} from "@/components/lesson-materials/test-book/TestBookSheets";

type Mode = "book" | "draw";
type AnalysisResult = Awaited<ReturnType<typeof generateAndSaveAnalysisReportAction>>;
type GrammarChoiceResult = Awaited<ReturnType<typeof generateGrammarChoicePassageAction>>;
type PrepareResult = Awaited<ReturnType<typeof prepareTestBookPassageAction>>;
type RegisterResult = Awaited<ReturnType<typeof registerTestBookVocabAction>>;

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

/** 표지 고르기 썸네일 — A4 표지를 썸네일 폭에 맞춰 줄인다 */
function CoverThumbAny({
  presetId,
  cover,
  range,
  logoSrc,
  widthPx,
}: {
  presetId: string;
  cover: IntegratedCover;
  range: string;
  logoSrc?: string | null;
  widthPx: number;
}) {
  const scale = widthPx / 793.7;
  return (
    <div className="pointer-events-none relative overflow-hidden" style={{ width: widthPx, height: widthPx * (297 / 210) }}>
      <link rel="stylesheet" href={TEST_BOOK_FONTS_HREF} />
      <style>{TEST_BOOK_CSS}</style>
      <div style={{ transform: `scale(${scale})`, transformOrigin: "top left", width: "210mm" }}>
        <CoverSheet cover={{ ...cover, presetId }} range={range} logoSrc={logoSrc} />
      </div>
    </div>
  );
}

/** 왼쪽 「교재 차례」 한 줄(켜면 아래 세부 설정이 열린다) */
function PartRow({
  checked,
  onChange,
  n,
  label,
  hint,
  children,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  n: number;
  label: string;
  hint?: string;
  children?: ReactNode;
}) {
  return (
    <div className={`rounded-lg border ${checked ? "border-slate-200 bg-white" : "border-transparent bg-slate-50"} px-2 py-1`}>
      <label className="flex min-h-[26px] cursor-pointer items-center gap-2 text-[13px] text-slate-800">
        <input type="checkbox" className="h-4 w-4 accent-violet-600" checked={checked} onChange={(e) => onChange(e.target.checked)} />
        <span className="w-4 text-[10px] font-bold text-slate-400">{n}</span>
        <span className={`flex-1 font-semibold ${checked ? "" : "text-slate-400"}`}>{label}</span>
        {hint ? <span className="text-[10.5px] text-slate-400">{hint}</span> : null}
      </label>
      {checked && children ? <div className="space-y-1.5 pb-1.5 pl-[42px] pt-0.5">{children}</div> : null}
    </div>
  );
}

function SubRow({ checked, onChange, label }: { checked: boolean; onChange: (v: boolean) => void; label: string }) {
  return (
    <label className="flex min-h-[22px] cursor-pointer items-center gap-2 text-[12px] text-slate-700">
      <input type="checkbox" className="h-3.5 w-3.5 accent-violet-600" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

/** 표지 글자 칸: 칠 때는 칸 안에만 두고, 칸을 벗어날 때 저장한다(교재 전체를 글자마다 다시 그리지 않게) */
function CoverInput({
  label,
  value,
  placeholder,
  rows,
  onCommit,
}: {
  label: string;
  value: string;
  placeholder?: string;
  rows?: number;
  onCommit: (v: string) => void;
}) {
  const [text, setText] = useState(value);
  useEffect(() => setText(value), [value]);
  /** 다 지우면 기본 글(교재 이름 등)로 돌아간다 */
  const blur = () => {
    if (text !== value) onCommit(text);
    if (!text.trim()) setText(value);
  };
  const cls = "w-full rounded-md border border-slate-200 px-2 py-1 text-[12px] text-slate-900 outline-none focus:border-violet-300";
  return (
    <label className="block space-y-0.5">
      <span className="text-[10.5px] font-semibold text-slate-500">{label}</span>
      {rows ? (
        <textarea className={cls} rows={rows} value={text} placeholder={placeholder} onChange={(e) => setText(e.target.value)} onBlur={blur} />
      ) : (
        <input className={cls} value={text} placeholder={placeholder} onChange={(e) => setText(e.target.value)} onBlur={blur} />
      )}
    </label>
  );
}

/** 한줄해석: 전체 해석 · 직독직해 */
function LineModeSwitch({ value, onChange }: { value: LineMode; onChange: (v: LineMode) => void }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold text-slate-500">한줄해석</p>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {(
          [
            ["full", "전체 해석"],
            ["chunk", "직독직해"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`rounded-md px-1 py-1 text-[11px] font-bold ${value === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
}

/** 통문장 영작 범위 고르기 */
function WritingScopeSwitch({ value, onChange }: { value: WritingScope; onChange: (v: WritingScope) => void }) {
  return (
    <div className="space-y-1">
      <p className="text-[11px] font-bold text-slate-500">통문장 영작</p>
      <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
        {(
          [
            ["all", "모든 문장"],
            ["key", "중요문장만"],
          ] as const
        ).map(([id, label]) => (
          <button
            key={id}
            type="button"
            onClick={() => onChange(id)}
            className={`rounded-md px-1 py-1 text-[11px] font-bold ${value === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  );
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
  logoSrc = null,
  academyName = "",
}: {
  role: "admin" | "teacher";
  projects: TestBookProjectInput[];
  docId: string | null;
  docName?: string | null;
  savedOptions: TestBookOptions;
  initialMode: Mode;
  logoSrc?: string | null;
  academyName?: string;
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
    // 새로 만드는 교재(확인 창에서 어법선택 값까지 보고 만든 것)는 재료에 이어 어법선택도 만든다.
    // 이미 있는 교재를 다시 열 때는 값이 몰래 나가지 않게 만들지 않는다(「어법선택 만들기」로).
    const autoGrammar = !docId && initialMode === "book";
    void runPrepare(initialProjects.filter((p) => !isTestBookProjectReady(p)), false).then(() => {
      if (autoGrammar) void runGrammar(initialProjects.filter((p) => !p.grammarChoice?.items?.length));
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---------------------------------------------------------------- 뽑기
  const ready = projects.filter(isTestBookProjectReady);
  const [drawIds, setDrawIds] = useState<Set<string>>(() => new Set(initialProjects.map((p) => p.id)));
  const [drawTypes, setDrawTypes] = useState<TestBookTypeKey[]>(BASIC_TEST_BOOK_TYPES);
  const [blankMode, setBlankMode] = useState<BlankMode>("same");
  const [drawWriting, setDrawWriting] = useState<WritingScope>("all");
  const [drawLineMode, setDrawLineMode] = useState<LineMode>("full");
  const [drawAnswers, setDrawAnswers] = useState(true);
  const [draw, setDraw] = useState<{ seed: string; picks: Record<string, TestBookTypeKey[]> } | null>(null);
  /** 뽑을 때마다 값(지문 수 × 유형 수)을 받는다 — 확인 창을 띄우고, 서버에서 차감된 뒤에만 보여 준다 */
  const [drawBusy, setDrawBusy] = useState(false);
  const [drawError, setDrawError] = useState<string | null>(null);
  async function runDraw() {
    const picks: Record<string, TestBookTypeKey[]> = {};
    for (const p of ready) if (drawIds.has(p.id)) picks[p.id] = drawTypes;
    const projectIds = Object.keys(picks);
    if (!projectIds.length || !drawTypes.length) return;
    const ok = await askCreditConfirm({
      title: "테스트지 뽑기",
      description: "고른 지문과 유형으로 테스트지를 새로 뽑습니다. 누를 때마다 문항·보기 순서가 새로 나옵니다.",
      subject: `지문 ${projectIds.length}개 × 유형 ${drawTypes.length}개`,
      contents: drawTypes.map((t) => testBookTypeLabel(t)),
      items: [{ feature: "lesson_test_draw", quantity: projectIds.length * drawTypes.length }],
      sample: "one_page_test",
    });
    if (!ok) return;
    const seed = newSeed();
    setDrawBusy(true);
    setDrawError(null);
    try {
      const res = await postJson<{ ok: true } | { ok: false; message: string }>("/api/lesson-materials/test-book", {
        op: "chargeDraw",
        role,
        seed,
        projectIds,
        typeCount: drawTypes.length,
      });
      if (res.ok) setDraw({ seed, picks });
      else setDrawError(res.message);
    } catch (e) {
      setDrawError(e instanceof Error ? e.message : "뽑지 못했습니다.");
    } finally {
      setDrawBusy(false);
    }
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
  /** 단어학습 등록 */
  const [vocabReg, setVocabReg] = useState<{ busy: boolean; msg?: string; href?: string; error?: boolean }>({ busy: false });
  async function registerVocab() {
    setVocabReg({ busy: true });
    const res = await postJson<RegisterResult>("/api/lesson-materials/test-book", {
      op: "registerVocab",
      role,
      id: docIdRef.current,
      title: titleRef.current,
      projectIds: projects.map((p) => p.id),
    });
    if (res.ok) {
      setVocabReg({
        busy: false,
        msg: `${res.created ? "등록했습니다" : "새 내용으로 맞췄습니다"} · ${res.count}단어`,
        href: `/${role}/vocab/set/${res.setId}`,
      });
    } else setVocabReg({ busy: false, msg: res.message, error: true });
  }
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
        sheet: buildTestSheet(p, options.types, { seed: BOOK_SEED, blankMode: "same", writing: options.writing, lineMode: options.lineMode }),
      })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ready.map((p) => p.id).join(","), projects, options.types, options.writing, options.lineMode]
  );
  const drawn = useMemo(() => {
    if (!draw) return [];
    return ready
      .filter((p) => draw.picks[p.id])
      .map((p) => ({ project: p, sheet: buildTestSheet(p, draw.picks[p.id]!, { seed: draw.seed, blankMode, writing: drawWriting, lineMode: drawLineMode }) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [draw, blankMode, drawWriting, drawLineMode, projects]);

  // ---------------------------------------------------------------- 교재 차례·목차
  const testsOn = options.tests && book.length > 0 && (options.allWordTest || options.wordTest || options.types.length > 0);
  const withAnalysis = ready.filter((p) => (p.analysis?.sentences?.length ?? 0) > 0);
  /** 표지 「범위」: 같은 교과서는 과를 모아(「공통영어2 천재(조수경) 3·4과」), 나머지는 출처 그대로 */
  const rangeLabel = useMemo(() => {
    const books = new Map<string, Set<string>>();
    const others: string[] = [];
    for (const p of ready) {
      const src = (p.source ?? "").trim();
      const m = src.match(/^(.*?)\s*(\d+)\s*과/);
      if (m) {
        const set = books.get(m[1]!.trim()) ?? new Set<string>();
        set.add(m[2]!);
        books.set(m[1]!.trim(), set);
      } else if (src && !others.includes(src)) others.push(src);
    }
    const parts = [
      ...[...books.entries()].map(([b, ls]) => `${b} ${[...ls].sort((x, y) => Number(x) - Number(y)).join("·")}과`),
      ...others,
    ];
    return parts.length > 3 ? `${parts.slice(0, 3).join(" · ")} 외 ${parts.length - 3}` : parts.join(" · ") || `지문 ${ready.length}개`;
  }, [ready]);
  /** 교재 묶음(목차·간지·쪽 색). 켠 것만 차례대로 번호를 매긴다. */
  const bookParts: BookPart[] = (
    [
    options.plan ? { id: "plan", en: "Study Plan", ko: "학습 계획표 · 이수표", sub: "날짜 · 점수 · 통과 확인", color: "#2b2f38" } : null,
    options.lesson
      ? { id: "lesson", en: "Lesson Materials", ko: "수업용 자료", sub: options.allVocab ? "전체 단어장 · 단어 정리 · 문장별 해석" : "단어 정리 · 문장별 해석", color: "#1d2a8f" }
      : null,
    options.blankNote ? { id: "note", en: "Blank Note", ko: "백지노트", sub: "원문 · 동반의어 · 중요 내용 · 오답 다시 쓰기", color: "#0f8a7e" } : null,
    options.analysis && withAnalysis.length ? { id: "analysis", en: "Analysis", ko: "분석 자료", sub: `문장 분석 · ${withAnalysis.length}지문`, color: "#6a4bd8" } : null,
    testsOn
      ? {
          id: "tests",
          en: "Tests",
          ko: "테스트지 자료",
          sub: [options.allWordTest ? "전체 단어 TEST" : "", options.wordTest ? "동반의어 TEST" : "", options.types.length ? "테스트 견본" : ""].filter(Boolean).join(" · "),
          color: "#e8552e",
        }
      : null,
    options.answers && testsOn ? { id: "answers", en: "Answer Key", ko: "정답지", sub: "정답만 싣습니다", color: "#475066" } : null,
    ] as Array<Omit<BookPart, "no"> | null>
  )
    .filter((x): x is Omit<BookPart, "no"> => !!x)
    .map((x, i) => ({ ...x, no: String(i + 1).padStart(2, "0") }));
  const partOf = (id: string) => bookParts.find((x) => x.id === id);
  const bookTitle = title.trim() || "테스트 교재";
  /** 바닥줄 로고·학원명 */
  const brand = useMemo(() => ({ logoSrc: logoSrc || null, academy: academyName }), [logoSrc, academyName]);
  /** 표지에 찍을 글자(빈 칸은 교재 이름·학원명으로) */
  const coverShown = {
    ...options.coverInfo,
    title: options.coverInfo.title.trim() || bookTitle,
    academy: options.coverInfo.academy.trim() || academyName,
  };
  /** 지문 간지(묶음 안에서 지문마다 첫 쪽) — 이 묶음에서 그 지문에 이어질 쪽 이름을 싣는다 */
  const passageDivider = (id: string, p: TestBookProjectInput, next: string[]) => {
    const part = partOf(id);
    if (!part || !options.toc || !options.passageDividers) return null;
    return <PassageDividerSheet part={part} index={indexOf(p.id)} project={p} next={next.filter(Boolean)} title={bookTitle} />;
  };
  /** 묶음 간지(지문마다 이 묶음에서 시작하는 쪽) — 목차를 켰을 때만 */
  const dividerFor = (id: string, items: TestBookProjectInput[]) => {
    const part = partOf(id);
    if (!part || !options.toc || !options.dividers) return null;
    return (
      <DividerSheet
        part={part}
        title={bookTitle}
        items={items.map((x) => ({ id: x.id, index: indexOf(x.id), title: x.title, source: x.source, page: tocPages[`${id}:${x.id}`] }))}
      />
    );
  };
  /** 목차 쪽 번호: 그린 쪽을 차례로 세어 묶음·지문의 첫 쪽을 찾는다(바뀔 때만 다시 그린다) */
  const [tocPages, setTocPages] = useState<Record<string, number>>({});
  useEffect(() => {
    const root = document.getElementById("tb-print-root");
    if (!root) return;
    /** 쪽이 바뀔 때마다(묶음마다 쪽 나누기가 따로 끝난다) 다시 센다. 같은 값이면 아무것도 바꾸지 않는다. */
    const count = () => {
      const sheets = Array.from(root.querySelectorAll<HTMLElement>(".tb-sheet")).filter((el) => !el.closest(".tb-measure"));
      // 바닥줄 쪽 번호(표지가 1쪽 — 목차 쪽 번호와 같다)
      sheets.forEach((el, i) => {
        const no = el.querySelector<HTMLElement>(":scope > .tb-foot .tb-pgno");
        if (no && no.textContent !== `- ${i + 1} -`) no.textContent = `- ${i + 1} -`;
      });
      if (mode !== "book") return;
      const next: Record<string, number> = {};
      root.querySelectorAll<HTMLElement>("[data-toc]").forEach((w) => {
        const first = Array.from(w.querySelectorAll<HTMLElement>(".tb-sheet")).find((el) => !el.closest(".tb-measure"));
        if (first && w.dataset.toc) next[w.dataset.toc] = sheets.indexOf(first) + 1;
      });
      next.__total = sheets.length;
      setTocPages((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    count();
    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(count);
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [mode]);

  // ---------------------------------------------------------------- 워크북 어법 선택 만들기(어법선택)
  const withGrammar = ready.filter((p) => (p.grammarChoice?.items?.length ?? 0) > 0);
  const [grammarBusy, setGrammarBusy] = useState<string | null>(null);
  const [grammarError, setGrammarError] = useState<string | null>(null);
  async function makeGrammar() {
    const targets = ready.filter((p) => !(p.grammarChoice?.items?.length));
    if (!targets.length) return;
    if (!window.confirm(`어법선택이 없는 지문 ${targets.length}개를 만듭니다. 어법선택 값이 지문마다 듭니다. 지문마다 1~3분 걸릴 수 있습니다. 만들까요?`)) return;
    await runGrammar(targets);
  }
  /** 어법선택(워크북과 같은 엔진)을 지문마다 만든다. 이미 만든 지문은 값을 돌려받는다. */
  async function runGrammar(targets: Array<{ id: string; title: string }>) {
    if (!targets.length) return;
    setGrammarError(null);
    let done = 0;
    setGrammarBusy(`0/${targets.length}`);
    const failed: string[] = [];
    await runWithConcurrency(targets, CONCURRENCY, async (p) => {
      try {
        const res = await postJson<GrammarChoiceResult>("/api/lesson-materials/grammar-choice", {
          role,
          projectId: p.id,
          usedIn: "test_book",
        });
        if (res.ok && res.section) setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, grammarChoice: res.section } : x)));
        else failed.push(`${p.title}: ${res.ok ? "어법 선택 자리를 찾지 못했습니다." : res.message}`);
      } catch (e) {
        failed.push(`${p.title}: ${e instanceof Error ? e.message : "만들지 못했습니다."}`);
      }
      done++;
      setGrammarBusy(`${done}/${targets.length}`);
    });
    setGrammarBusy(null);
    if (failed.length) setGrammarError(failed.join(" · "));
  }

  // ---------------------------------------------------------------- 분석서 만들기(분석 자료)
  const [analysisBusy, setAnalysisBusy] = useState<string | null>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  async function makeAnalysis() {
    const targets = ready.filter((p) => !(p.analysis?.sentences?.length));
    if (!targets.length) return;
    if (!window.confirm(`분석서가 없는 지문 ${targets.length}개의 분석서를 만듭니다. 수업자료 분석서와 같은 값이 지문마다 듭니다. 만들까요?`)) return;
    setAnalysisError(null);
    let done = 0;
    setAnalysisBusy(`0/${targets.length}`);
    const failed: string[] = [];
    await runWithConcurrency(targets, CONCURRENCY, async (p) => {
      try {
        const res = await postJson<AnalysisResult>("/api/lesson-materials/analysis-report", {
          role,
          projectId: p.id,
          onlyIfChanged: true,
        });
        if (res.ok) setProjects((prev) => prev.map((x) => (x.id === p.id ? { ...x, analysis: res.report } : x)));
        else failed.push(`${p.title}: ${res.message}`);
      } catch (e) {
        failed.push(`${p.title}: ${e instanceof Error ? e.message : "만들지 못했습니다."}`);
      }
      done++;
      setAnalysisBusy(`${done}/${targets.length}`);
    });
    setAnalysisBusy(null);
    if (failed.length) setAnalysisError(failed.join(" · "));
  }


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
              <div className="space-y-1">
                <p className="text-[11px] font-bold text-slate-500">교재 차례 · 넣을 것</p>
                <PartRow checked={options.cover} onChange={(v) => setOptions({ cover: v })} n={1} label="표지">
                  <div className="grid grid-cols-3 gap-1.5">
                    {[TEST_BOOK_BLEED_COVER, ...COVER_PRESETS.map((x) => x.id)].map((id) => {
                      const on = options.coverInfo.presetId === id;
                      return (
                        <button
                          key={id}
                          type="button"
                          title={id === TEST_BOOK_BLEED_COVER ? "색 번짐" : coverPreset(id).name}
                          onClick={() => setOptions({ coverInfo: { ...options.coverInfo, presetId: id } })}
                          className={`overflow-hidden rounded-md border-2 ${on ? "border-violet-600" : "border-slate-200 hover:border-slate-300"}`}
                        >
                          <CoverThumbAny presetId={id} cover={coverShown} range={rangeLabel} logoSrc={logoSrc} widthPx={58} />
                        </button>
                      );
                    })}
                  </div>
                  {options.coverInfo.presetId === TEST_BOOK_BLEED_COVER ? (
                    <CoverInput
                      label="큰 글자 (엔터로 줄 구분)"
                      value={options.coverInfo.headline || TEST_BOOK_DEFAULT_HEADLINE}
                      rows={3}
                      onCommit={(headline) => setOptions({ coverInfo: { ...options.coverInfo, headline } })}
                    />
                  ) : null}
                  <CoverInput label="범위 라벨 (다 지우면 지문 출처로)" value={options.coverInfo.label || rangeLabel} onCommit={(label) => setOptions({ coverInfo: { ...options.coverInfo, label } })} />
                  <CoverInput label="제목 (엔터로 줄 구분, 다 지우면 교재 이름)" value={options.coverInfo.title || bookTitle} rows={2} onCommit={(t) => setOptions({ coverInfo: { ...options.coverInfo, title: t } })} />
                  <CoverInput label="제목 아래 · 진도 (엔터로 줄 구분)" value={options.coverInfo.progress} rows={2} onCommit={(progress) => setOptions({ coverInfo: { ...options.coverInfo, progress } })} />
                  <CoverInput label="학원명" value={options.coverInfo.academy || academyName} onCommit={(academy) => setOptions({ coverInfo: { ...options.coverInfo, academy } })} />
                </PartRow>
                <PartRow checked={options.toc} onChange={(v) => setOptions({ toc: v })} n={2} label="목차" hint="쪽 번호 자동">
                  <SubRow checked={options.dividers} onChange={(v) => setOptions({ dividers: v })} label="묶음마다 간지(지문별 시작 쪽)" />
                  <SubRow checked={options.passageDividers} onChange={(v) => setOptions({ passageDividers: v })} label="지문마다 간지" />
                </PartRow>
                <PartRow checked={options.plan} onChange={(v) => setOptions({ plan: v })} n={3} label="학습 계획표·이수표" />
                <PartRow checked={options.lesson} onChange={(v) => setOptions({ lesson: v })} n={4} label="수업용 자료" hint="단어·해석">
                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
                    {TRANSLATION_MODES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => setOptions({ translation: t.id })}
                        className={`rounded-md px-1 py-1 text-[11px] font-bold ${options.translation === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                  <SubRow checked={options.allVocab} onChange={(v) => setOptions({ allVocab: v })} label="맨 앞 전체 단어장" />
                </PartRow>
                <PartRow checked={options.blankNote} onChange={(v) => setOptions({ blankNote: v })} n={5} label="백지노트" hint="지문마다 2쪽" />
                <PartRow checked={options.analysis} onChange={(v) => setOptions({ analysis: v })} n={6} label="분석 자료" hint={`분석서 ${withAnalysis.length}/${ready.length}지문`}>
                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
                    {DESIGN_STYLES.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        title={d.hint}
                        onClick={() => setOptions({ analysisStyle: d.id as TestBookOptions["analysisStyle"] })}
                        className={`rounded-md px-1 py-1 text-[11px] font-bold ${options.analysisStyle === d.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                      >
                        {d.label}
                      </button>
                    ))}
                  </div>
                  <p className="text-[10.5px] text-slate-400">{DESIGN_STYLES.map((d) => `${d.label} ${d.hint}`).join(" · ")}</p>
                  <div className="grid grid-cols-2 gap-1 rounded-lg bg-slate-100 p-1">
                    {(
                      [
                        ["full", "전체 해석"],
                        ["chunk", "직독직해"],
                      ] as const
                    ).map(([id, label]) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setOptions({ analysisTranslation: id })}
                        className={`rounded-md px-1 py-1 text-[11px] font-bold ${options.analysisTranslation === id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                  {ready.length > withAnalysis.length ? (
                    <div className="space-y-1">
                      <p className="text-[11px] leading-snug text-slate-500">
                        분석서가 없는 지문 {ready.length - withAnalysis.length}개는 빠집니다. 만들면 수업자료 분석서와 같은 값이 지문마다 듭니다.
                      </p>
                      <Button type="button" size="sm" variant="secondary" className="w-full" disabled={!!analysisBusy || busy} onClick={() => void makeAnalysis()}>
                        {analysisBusy ? `분석서 만드는 중… ${analysisBusy}` : `분석서 만들기 (${ready.length - withAnalysis.length}지문)`}
                      </Button>
                      {analysisError ? <p className="text-[11px] font-semibold text-rose-600">{analysisError}</p> : null}
                    </div>
                  ) : null}
                </PartRow>
                <PartRow checked={options.tests} onChange={(v) => setOptions({ tests: v })} n={7} label="테스트지 자료">
                  <SubRow checked={options.allWordTest} onChange={(v) => setOptions({ allWordTest: v })} label="맨 앞 전체 단어 TEST" />
                  <SubRow checked={options.wordTest} onChange={(v) => setOptions({ wordTest: v })} label="지문마다 동반의어·품사 TEST" />
                  <div className="space-y-2 rounded-lg border border-violet-200 bg-violet-50/60 p-2.5">
                    <p className="text-[11px] font-bold text-violet-900">테스트 견본 유형</p>
                    <TypeChecks value={options.types} onChange={(types) => setOptions({ types })} />
                    {options.types.includes("line") ? <LineModeSwitch value={options.lineMode} onChange={(lineMode) => setOptions({ lineMode })} /> : null}
                    {options.types.includes("writing") ? <WritingScopeSwitch value={options.writing} onChange={(writing) => setOptions({ writing })} /> : null}
                    {options.types.includes("grammar") ? (
                      <div className="space-y-1">
                        <p className="text-[11px] font-bold text-slate-500">
                          어법선택 {withGrammar.length}/{ready.length}지문
                        </p>
                        {ready.length > withGrammar.length ? (
                          <>
                            <p className="text-[10.5px] leading-snug text-slate-500">
                              어법선택이 아직 없는 지문은 간단한 어법 자리로 냅니다. 만들면 어법선택 값이 지문마다 듭니다(이미 만든 지문은 값 없음).
                            </p>
                            <Button type="button" size="sm" variant="secondary" className="w-full" disabled={!!grammarBusy || busy} onClick={() => void makeGrammar()}>
                              {grammarBusy ? `어법선택 만드는 중… ${grammarBusy}` : `어법선택 만들기 (${ready.length - withGrammar.length}지문)`}
                            </Button>
                          </>
                        ) : null}
                        {grammarError ? <p className="text-[11px] font-semibold text-rose-600">{grammarError}</p> : null}
                      </div>
                    ) : null}
                  </div>
                </PartRow>
                <PartRow checked={options.answers} onChange={(v) => setOptions({ answers: v })} n={8} label="정답지" hint="맨 뒤 · 정답만" />
                <p className="pt-1 text-[11px] leading-relaxed text-slate-500">
                  넣고 빼도 다시 만들지 않아 크레딧이 들지 않습니다. 학원 테스트지는 「테스트지 뽑기」에서 새로 뽑습니다.
                </p>
              </div>
              <div className="space-y-1.5 rounded-lg border border-emerald-200 bg-emerald-50/60 p-3">
                <p className="text-xs font-bold text-emerald-900">단어학습 단어장</p>
                <p className="text-[11px] leading-relaxed text-slate-600">
                  전체 단어(뜻·품사·동의어·반의어·지문 예문)를 단어학습 「테스트 교재」 폴더에 단어장으로 넣습니다. 다시 누르면 같은 단어장을 고칩니다.
                </p>
                <Button type="button" size="sm" variant="secondary" className="w-full" disabled={vocabReg.busy || busy || !ready.length} onClick={() => void registerVocab()}>
                  {vocabReg.busy ? "등록 중…" : "단어학습에 등록"}
                </Button>
                {vocabReg.msg ? (
                  <p className={`text-[11px] font-semibold ${vocabReg.error ? "text-rose-600" : "text-emerald-700"}`}>
                    {vocabReg.msg}
                    {vocabReg.href ? (
                      <>
                        {" · "}
                        <a href={vocabReg.href} target="_blank" rel="noreferrer" className="underline">
                          단어장 열기
                        </a>
                      </>
                    ) : null}
                  </p>
                ) : null}
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
                <p className="text-xs font-bold text-violet-900">유형 (고른 유형을 모두 싣고, 문항은 누를 때마다 새로 섞음)</p>
                <TypeChecks value={drawTypes} onChange={setDrawTypes} />
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
              {drawTypes.includes("line") ? <LineModeSwitch value={drawLineMode} onChange={setDrawLineMode} /> : null}
              {drawTypes.includes("writing") ? <WritingScopeSwitch value={drawWriting} onChange={setDrawWriting} /> : null}
              <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                <input type="checkbox" checked={drawAnswers} onChange={(e) => setDrawAnswers(e.target.checked)} />
                정답지 함께
              </label>
              <Button type="button" className="w-full" disabled={drawBusy || !ready.some((p) => drawIds.has(p.id)) || !drawTypes.length} onClick={() => void runDraw()}>
                {drawBusy ? "뽑는 중…" : draw ? "다시 뽑기" : "뽑기"}
              </Button>
              {drawError ? <p className="text-[11px] font-semibold text-rose-600">{drawError}</p> : null}
              <p className="text-[11px] leading-relaxed text-slate-500">
                누를 때마다 문항·보기 순서가 새로 나옵니다. 중요문장은 교재와 같고, 어순배열은 같은 덩어리를 새로 섞습니다. 뽑을 때마다 지문·유형마다 값이 듭니다.
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
            <TestBookBrand.Provider value={brand}>
            <div ref={scaled.ref} id="tb-print-root" className="relative flex origin-top flex-col gap-6 print:gap-0 print:!transform-none [&_.tb-sheet]:shadow" style={previewStyle}>
              {mode === "book" ? (
                <>
                  {projects.map((p, i) =>
                    isTestBookProjectReady(p) ? null : (
                      <div key={p.id} className="flex h-[50mm] w-[210mm] flex-col items-center justify-center rounded bg-white/70 text-sm text-slate-500 shadow print:hidden">
                        <span className="font-bold text-slate-700">
                          {String(i + 1).padStart(2, "0")} · {p.title}
                        </span>
                        <span className="mt-1 text-xs">
                          {pendingIds.has(p.id) ? "단어 정리·테스트 재료를 만들고 있습니다…" : (errors[p.id] ?? "준비되지 않았습니다.")}
                        </span>
                      </div>
                    )
                  )}
                  {/* 교재 차례(선생님 2026-10-20): 표지 → 목차 → 계획표 → 수업용 자료 → 백지노트 → 분석 자료 → 테스트지 자료 → 정답지.
                      data-toc 묶음의 첫 쪽을 세어 목차 쪽 번호를 넣는다. */}
                  {options.cover && ready.length ? <CoverSheet cover={coverShown} range={rangeLabel} logoSrc={logoSrc} /> : null}
                  {options.toc && ready.length ? (
                    <ContentsSheet parts={bookParts} pages={tocPages} total={tocPages.__total ?? 0} title={bookTitle} range={rangeLabel} />
                  ) : null}
                  {options.plan && ready.length ? (
                    <div data-toc="plan" className="contents" style={partStyle(partOf("plan"))}>
                      <PlanSheets projects={ready} options={options} measureKey={measureKey} />
                    </div>
                  ) : null}
                  {options.lesson && book.length ? (
                    <div data-toc="lesson" className="contents" style={partStyle(partOf("lesson"))}>
                      {dividerFor("lesson", ready)}
                      {options.allVocab ? <AllVocabSheets projects={ready} indexOf={indexOf} measureKey={measureKey} /> : null}
                      {book.map((b) => (
                        <div key={b.project.id} data-toc={`lesson:${b.project.id}`} className="contents">
                          {passageDivider("lesson", b.project, ["단어 정리", "수업용 자료 · 문장별 해석"])}
                          <VocabSheets index={indexOf(b.project.id)} project={b.project} measureKey={measureKey} />
                          <LessonSheets index={indexOf(b.project.id)} project={b.project} translation={options.translation} measureKey={measureKey} />
                        </div>
                      ))}
                      {options.translation === "back" ? <TranslationBackSheets projects={ready} measureKey={measureKey} /> : null}
                    </div>
                  ) : null}
                  {options.blankNote && book.length ? (
                    <div data-toc="note" className="contents" style={partStyle(partOf("note"))}>
                      {dividerFor("note", ready)}
                      {book.map((b) => (
                        <div key={b.project.id} data-toc={`note:${b.project.id}`} className="contents">
                          {passageDivider("note", b.project, ["백지노트 1 · 원문 · 동반의어 정리", "백지노트 2 · 중요 내용 · 오답 다시 쓰기"])}
                          <BlankNoteSheets index={indexOf(b.project.id)} project={b.project} />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {options.analysis && withAnalysis.length ? (
                    <div data-toc="analysis" className={`contents ${designClass(options.analysisStyle)}`} style={partStyle(partOf("analysis"))}>
                      <link rel="stylesheet" href={DESIGN_FONTS_HREF} />
                      {dividerFor("analysis", withAnalysis)}
                      {withAnalysis.map((p) => (
                        <div key={p.id} data-toc={`analysis:${p.id}`} className="contents">
                          {passageDivider("analysis", p, ["문장 분석"])}
                          <AnalysisSheets
                            index={indexOf(p.id)}
                            project={p}
                            translation={options.analysisTranslation}
                            measureKey={`${measureKey}|${options.analysisStyle}|${options.analysisTranslation}`}
                          />
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {testsOn ? (
                    <div data-toc="tests" className="contents" style={partStyle(partOf("tests"))}>
                      {dividerFor("tests", ready)}
                      {options.allWordTest ? <AllWordTestSheets projects={ready} indexOf={indexOf} measureKey={measureKey} /> : null}
                      {book.map((b) => (
                        <div key={b.project.id} data-toc={`tests:${b.project.id}`} className="contents">
                          {passageDivider("tests", b.project, [
                            options.wordTest ? "동반의어 · 품사 TEST" : "",
                            options.types.length ? `테스트 견본 · ${options.types.map((t) => testBookTypeLabel(t)).join(" · ")}` : "",
                          ])}
                          {options.wordTest ? <WordTestSheets index={indexOf(b.project.id)} project={b.project} test={b.word} measureKey={measureKey} /> : null}
                          {options.types.length ? (
                            <TestSheets index={indexOf(b.project.id)} project={b.project} sheet={b.sheet} title="테스트 견본" measureKey={measureKey} />
                          ) : null}
                        </div>
                      ))}
                    </div>
                  ) : null}
                  {options.answers && testsOn ? (
                    <div data-toc="answers" className="contents" style={partStyle(partOf("answers"))}>
                      {options.allWordTest ? <AllWordAnswerSheets projects={ready} indexOf={indexOf} measureKey={measureKey} /> : null}
                      {options.wordTest || options.types.length ? (
                        <AnswerSheets
                          entries={book.map((b) => ({
                            index: indexOf(b.project.id),
                            project: b.project,
                            word: options.wordTest ? b.word : undefined,
                            sheet: options.types.length ? b.sheet : { ...b.sheet, sections: [] },
                          }))}
                          measureKey={measureKey}
                        />
                      ) : null}
                    </div>
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
            </TestBookBrand.Provider>
          </div>
        </div>
      </main>
    </div>
  );
}
