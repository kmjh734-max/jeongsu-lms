"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { postJson } from "@/lib/lesson-materials/post-json";
import { runWithConcurrency } from "@/lib/run-with-concurrency";
import type {
  prepareOnePageContentAction,
  saveOnePageTestAction,
} from "@/lib/lesson-materials/one-page-actions";
import type {
  generateGrammarChoicePassageAction,
  generateVocabChoicePassageAction,
} from "@/lib/lesson-materials/workbook-actions";
import {
  buildOnePageTestPassage,
  type OnePageChoiceSource,
  type OnePageContent,
  type OnePageProjectInput,
  type OnePageTestPassage,
  type OnePageTestPayload,
} from "@/lib/lesson-materials/one-page";
import {
  closeTabOrGo,
  useCreateDocumentFromUrl,
} from "@/components/lesson-materials/open-new-document";
import { useScaledHeight } from "@/components/lesson-materials/use-scaled-height";
import {
  ONE_PAGE_CSS,
  OnePageAnswerSheets,
  OnePageSummarySheet,
  OnePageTestSheet,
} from "@/components/lesson-materials/one-page/OnePageSheets";

/** 동시에 준비하는 지문 수. 테스트는 지문마다 어법·어휘 선택까지 불러 조금 낮춘다. */
const CONCURRENCY = { summary: 6, test: 4 } as const;

type Mode = "summary" | "test";

const MODE_LABEL: Record<Mode, string> = { summary: "1장 정리자료", test: "1장 테스트" };

type PrepareResult = Awaited<ReturnType<typeof prepareOnePageContentAction>>;
type GrammarResult = Awaited<ReturnType<typeof generateGrammarChoicePassageAction>>;
type VocabResult = Awaited<ReturnType<typeof generateVocabChoicePassageAction>>;

function choiceSource(
  res: GrammarResult | VocabResult | { ok: false; message: string }
): OnePageChoiceSource | null {
  if (!res.ok || !res.section || !res.section.items?.length) return null;
  return { sourcePassage: res.section.sourcePassage, items: res.section.items };
}

/** 저장된 시험지 중 지금 원문으로 만든 것만 쓴다. */
function initialTests(
  projects: OnePageProjectInput[],
  saved: OnePageTestPayload | null
): Record<string, OnePageTestPassage> {
  const out: Record<string, OnePageTestPassage> = {};
  for (const p of saved?.passages ?? []) {
    const project = projects.find((x) => x.id === p.projectId);
    if (project && p.sourceHash === project.sourceHash) out[p.projectId] = p;
  }
  return out;
}

/** 인쇄할 쪽들. 최종통합자료에 끼워 넣을 때(embedded)도 같은 모양을 쓴다. */
export function OnePageSheetList({
  mode,
  projects,
  tests,
  logoSrc,
  includeAnswers,
  placeholder,
}: {
  mode: Mode;
  projects: OnePageProjectInput[];
  tests: Record<string, OnePageTestPassage>;
  logoSrc?: string | null;
  includeAnswers: boolean;
  /** 아직 준비 중이거나 실패한 지문 자리에 넣을 것(화면 전용) */
  placeholder?: (project: OnePageProjectInput, index: number) => ReactNode;
}) {
  const ready = projects.filter((p) => (mode === "summary" ? !!p.content : !!tests[p.id]));
  const lastReadyId = ready[ready.length - 1]?.id;
  const testPassages = ready.map((p) => tests[p.id]!).filter(Boolean);
  const indexOf = (id: string) => projects.findIndex((p) => p.id === id);
  return (
    <>
      <style>{ONE_PAGE_CSS}</style>
      {projects.map((p, i) => {
        const isReady = mode === "summary" ? !!p.content : !!tests[p.id];
        if (!isReady) {
          return placeholder ? (
            <div key={p.id} id={`op-p-${p.id}`} className="print:hidden">
              {placeholder(p, i)}
            </div>
          ) : null;
        }
        const isLast = p.id === lastReadyId && !(mode === "test" && includeAnswers);
        return (
          <div key={p.id} id={`op-p-${p.id}`} className="scroll-mt-16">
            {mode === "summary" ? (
              <OnePageSummarySheet
                index={i}
                project={{ ...p, content: p.content as OnePageContent }}
                logoSrc={logoSrc}
                isLast={isLast}
              />
            ) : (
              <OnePageTestSheet index={i} passage={tests[p.id]!} isLast={isLast} />
            )}
          </div>
        );
      })}
      {mode === "test" && testPassages.length > 0 ? (
        <div id="op-answers" className={`contents ${includeAnswers ? "" : "print:hidden"}`}>
          <OnePageAnswerSheets passages={testPassages} indexOf={indexOf} isLastGroup={includeAnswers} />
        </div>
      ) : null}
    </>
  );
}

export function OnePageWorkbench({
  role,
  mode,
  projects: initialProjects,
  logoSrc,
  docId,
  savedTest = null,
}: {
  role: "admin" | "teacher";
  mode: Mode;
  projects: OnePageProjectInput[];
  logoSrc?: string | null;
  /** 열린 파일 id(?doc=). 제작 버튼으로 연 경우 파일을 만든 뒤 채워진다. */
  docId: string | null;
  /** 1장 테스트 파일에 저장된 시험지 */
  savedTest?: OnePageTestPayload | null;
}) {
  const base = role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const docIdRef = useRef<string | null>(docId);
  const [projects, setProjects] = useState(initialProjects);
  const [tests, setTests] = useState<Record<string, OnePageTestPassage>>(() =>
    initialTests(initialProjects, savedTest)
  );
  const [pendingIds, setPendingIds] = useState<Set<string>>(() => new Set());
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [active, setActive] = useState<string | null>(initialProjects[0]?.id ?? null);
  const [includeAnswers, setIncludeAnswers] = useState(true);
  const [zoom, setZoom] = useState(85);
  const [started, setStarted] = useState(false);
  const scaled = useScaledHeight<HTMLDivElement>(zoom / 100);
  /** 새로 조립한 시험지가 있어 파일에 저장해야 한다. */
  const needSave = useRef(false);
  /** 저장할 시험지. 상태는 렌더 뒤에야 바뀌므로, 조립하는 즉시 여기에도 넣는다. */
  const testsRef = useRef(tests);

  const saveTests = useCallback(async () => {
    const id = docIdRef.current;
    if (mode !== "test" || !id || !needSave.current) return;
    const passages = initialProjects
      .map((p) => testsRef.current[p.id])
      .filter((t): t is OnePageTestPassage => !!t);
    if (passages.length === 0) return;
    needSave.current = false;
    const payload: OnePageTestPayload = { version: 1, createdAt: new Date().toISOString(), passages };
    const res = await postJson<Awaited<ReturnType<typeof saveOnePageTestAction>>>("/api/lesson-materials/one-page", {
      op: "saveTest",
      role,
      id,
      payload,
    });
    if (!res.ok) needSave.current = true;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [mode, role]);

  useCreateDocumentFromUrl(
    role,
    mode === "summary" ? "one_page_summary" : "one_page_test",
    initialProjects.map((p) => p.id),
    (id) => {
      docIdRef.current = id;
      void saveTests();
    }
  );

  useEffect(() => {
    const id = "one-page-print-page-size-style";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
    }
    el.textContent = `
@media print {
  @page { size: 210mm 297mm; margin: 0; }
  #one-page-print-root { transform: none !important; gap: 0 !important; }
}
`;
    document.body.appendChild(el);
    return () => {
      el?.remove();
    };
  }, []);

  /** 지문 하나를 준비한다: 재료(없을 때만 만든다), 테스트면 어법·어휘 선택을 불러 시험지를 조립한다. */
  const preparePassage = useCallback(
    async (project: OnePageProjectInput, forceRegenerate: boolean): Promise<string | null> => {
      let content = forceRegenerate ? null : project.content;
      if (!content) {
        const res = await postJson<PrepareResult>("/api/lesson-materials/one-page", {
          role,
          projectId: project.id,
          forceRegenerate,
        });
        if (!res.ok) return res.message;
        content = res.content;
        const fresh = content;
        setProjects((prev) => prev.map((p) => (p.id === project.id ? { ...p, content: fresh } : p)));
      }
      if (mode === "test") {
        // 워크북 어법 선택·어휘 선택: 저장된 문항을 쓰고(차감 없음), 없으면 만든다(각 기능 가격).
        const [grammar, vocab] = await Promise.all([
          postJson<GrammarResult>("/api/lesson-materials/grammar-choice", { role, projectId: project.id }),
          postJson<VocabResult>("/api/lesson-materials/vocab-choice", { role, projectId: project.id }),
        ]);
        const passage = buildOnePageTestPassage({
          projectId: project.id,
          title: project.title,
          titleEn: project.titleEn,
          source: project.source,
          sentences: project.sentences,
          content,
          grammarSection: choiceSource(grammar),
          vocabSection: choiceSource(vocab),
        });
        testsRef.current = { ...testsRef.current, [project.id]: passage };
        needSave.current = true;
        setTests((prev) => ({ ...prev, [project.id]: passage }));
      }
      return null;
    },
    [mode, role]
  );

  const runPrepare = useCallback(
    async (targets: OnePageProjectInput[], forceRegenerate: boolean) => {
      if (targets.length === 0) return;
      setPendingIds((prev) => new Set([...prev, ...targets.map((p) => p.id)]));
      setErrors((prev) => {
        const next = { ...prev };
        for (const p of targets) delete next[p.id];
        return next;
      });
      await runWithConcurrency(targets, CONCURRENCY[mode], async (p) => {
        let message: string | null;
        try {
          message = await preparePassage(p, forceRegenerate);
        } catch (e) {
          message = e instanceof Error ? e.message : "만들지 못했습니다.";
        }
        if (message) setErrors((prev) => ({ ...prev, [p.id]: message }));
        setPendingIds((prev) => {
          const next = new Set(prev);
          next.delete(p.id);
          return next;
        });
      });
      await saveTests();
    },
    [mode, preparePassage, saveTests]
  );

  useEffect(() => {
    if (started) return;
    setStarted(true);
    const targets = initialProjects.filter((p) =>
      mode === "summary" ? !p.content : !initialTests(initialProjects, savedTest)[p.id]
    );
    void runPrepare(targets, false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const previewStyle = useMemo(
    (): CSSProperties => ({ transform: `scale(${zoom / 100})`, transformOrigin: "top center" }),
    [zoom]
  );

  const readyCount = projects.filter((p) => (mode === "summary" ? !!p.content : !!tests[p.id])).length;
  const total = projects.length;
  const busy = pendingIds.size > 0;
  const activeProject = projects.find((p) => p.id === active) ?? projects[0];
  const errorList = projects.filter((p) => errors[p.id]);

  if (projects.length === 0) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Alert variant="error">선택된 자료가 없습니다.</Alert>
      </div>
    );
  }

  if (readyCount === 0 && (busy || !started)) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow">
          <p className="text-sm font-semibold text-slate-800">{MODE_LABEL[mode]}를 만들고 있습니다…</p>
          <p className="mt-1 text-xs text-slate-500">
            {total > 1
              ? `지문 ${total}개 중 ${total - pendingIds.size}개 완료 · 첫 지문이 끝나면 바로 보여 드립니다`
              : mode === "test"
                ? "요약문·T/F·어법·어휘 문항을 준비 중"
                : "요약문·어법 포인트·동의어를 정리 중"}
          </p>
        </div>
      </div>
    );
  }

  function scrollTo(id: string) {
    setActive(id);
    document.getElementById(`op-p-${id}`)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-200 print:static print:z-auto print:block print:bg-white">
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white print:hidden">
        <div className="space-y-2.5 border-b border-slate-100 p-4">
          <button
            type="button"
            onClick={() => closeTabOrGo(base)}
            className="text-left text-xs font-semibold text-violet-700"
          >
            ← 자료함
          </button>
          <h1 className="text-base font-bold text-slate-900">{MODE_LABEL[mode]}</h1>
          <p className="text-[11px] text-slate-500">
            지문 {total}개 · {busy ? `${readyCount}/${total} 준비됨` : "지문마다 A4 한 쪽"}
          </p>
          {projects.length > 1 ? (
            <div className="flex flex-wrap gap-1">
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => scrollTo(p.id)}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    p.id === activeProject?.id ? "bg-violet-600 text-white" : "bg-slate-100 text-slate-600"
                  } ${pendingIds.has(p.id) ? "animate-pulse opacity-60" : ""} ${
                    errors[p.id] ? "ring-1 ring-rose-400" : ""
                  }`}
                  title={pendingIds.has(p.id) ? "만드는 중" : p.title}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex-1 space-y-3 overflow-auto p-4">
          {activeProject ? (
            <div className="space-y-0.5">
              <p className="text-xs font-semibold text-slate-700">{activeProject.title}</p>
              {activeProject.source?.trim() ? (
                <p className="text-[11px] text-slate-400">{activeProject.source}</p>
              ) : null}
            </div>
          ) : null}
          {mode === "test" ? (
            <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
              <input
                type="checkbox"
                checked={includeAnswers}
                onChange={(e) => setIncludeAnswers(e.target.checked)}
              />
              정답지 함께 인쇄
            </label>
          ) : null}
          {errorList.length > 0 ? (
            <Alert variant="error">
              {errorList.map((p) => (
                <span key={p.id} className="block">
                  {String(projects.indexOf(p) + 1).padStart(2, "0")}: {errors[p.id]}
                </span>
              ))}
            </Alert>
          ) : null}
        </div>

        <div className="space-y-2 border-t border-slate-100 p-4">
          {activeProject ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="w-full"
              disabled={busy}
              onClick={() => {
                if (!window.confirm(`${activeProject.title}\n이 지문의 1장 자료를 새로 만들까요? 크레딧이 차감됩니다.`)) return;
                void runPrepare([activeProject], true);
              }}
            >
              {pendingIds.has(activeProject.id) ? "만드는 중…" : "이 지문 다시 만들기"}
            </Button>
          ) : null}
          {errorList.length > 0 ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              className="w-full"
              disabled={busy}
              onClick={() => void runPrepare(errorList, false)}
            >
              못 만든 지문 다시 시도 ({errorList.length})
            </Button>
          ) : null}
          <Button type="button" size="sm" className="w-full" disabled={busy} onClick={() => window.print()}>
            {busy ? `나머지 지문 만드는 중 (${readyCount}/${total})` : "인쇄 / PDF"}
          </Button>
        </div>
      </aside>

      <main className="relative min-w-0 flex-1 overflow-auto print:static print:overflow-visible">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-center gap-2 border-b border-slate-200/80 bg-white/90 px-4 py-2 backdrop-blur print:hidden">
          <span className="mr-2 text-xs font-semibold text-slate-500">A4</span>
          <button type="button" className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs" onClick={() => setZoom(100)}>
            100%
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs"
            onClick={() => setZoom((z) => Math.max(40, z - 10))}
          >
            −
          </button>
          <span className="text-xs font-semibold text-slate-600">{zoom}%</span>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs"
            onClick={() => setZoom((z) => Math.min(120, z + 10))}
          >
            +
          </button>
        </div>

        <div className="flex flex-col items-center p-6 print:block print:p-0">
          <div style={scaled.frameStyle} className="print:!h-auto print:!overflow-visible">
            <div
              ref={scaled.ref}
              id="one-page-print-root"
              className="flex origin-top flex-col gap-6 print:gap-0 print:!transform-none"
              style={previewStyle}
            >
              <OnePageSheetList
                mode={mode}
                projects={projects}
                tests={tests}
                logoSrc={logoSrc}
                includeAnswers={includeAnswers}
                placeholder={(p, i) => (
                  <div className="flex h-[60mm] w-[210mm] flex-col items-center justify-center rounded bg-white/70 text-sm text-slate-500 shadow">
                    <span className="font-bold text-slate-700">
                      {String(i + 1).padStart(2, "0")} · {p.title}
                    </span>
                    <span className="mt-1 text-xs">
                      {pendingIds.has(p.id) ? "만들고 있습니다… 끝나면 자동으로 채워집니다." : (errors[p.id] ?? "준비되지 않았습니다.")}
                    </span>
                  </div>
                )}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
