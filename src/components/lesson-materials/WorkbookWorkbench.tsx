"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useMemo,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  loadWorkbookFromSession,
  saveWorkbookToSession,
} from "@/components/lesson-materials/WorkbookCreateModal";
import { generateWorkbookAction } from "@/lib/lesson-materials/workbook-actions";
import {
  DEFAULT_WORKBOOK_BLANK_OPTIONS,
  DEFAULT_WORKBOOK_TF_OPTIONS,
  clampTfCount,
  defaultWorkbookTitle,
  formatWorkbookPassage,
  parseBlankDensity,
  parseBlankHintType,
  parseBlankTranslationLayout,
  sortWorkbookTypesByPrintOrder,
  workbookTypeDisplayTitle,
  type BlankRenderToken,
  type WorkbookBlankSection,
  type WorkbookData,
  type WorkbookPassageSection,
  type WorkbookTypeId,
} from "@/lib/lesson-materials/workbook-types";

const A4_WIDTH = "210mm";
const A4_HEIGHT = "297mm";
const A4_PAD = "14mm";
const ACCENT = "#F07167";

function PageShell({
  children,
  pageNo,
  total,
  workbookTitle,
  showTypeTitle,
  typeTitle,
  isLast,
}: {
  children: ReactNode;
  pageNo: number;
  total: number;
  workbookTitle: string;
  showTypeTitle?: boolean;
  typeTitle?: string;
  isLast?: boolean;
}) {
  return (
    <article
      className={`workbook-a4-sheet lesson-pack-a4-sheet relative box-border bg-white shadow-xl print:shadow-none ${
        isLast ? "lesson-pack-a4-sheet--last" : ""
      }`}
      style={{
        width: A4_WIDTH,
        minHeight: A4_HEIGHT,
        padding: A4_PAD,
        paddingBottom: "18mm",
        boxSizing: "border-box",
      }}
    >
      <header className="mb-4">
        <p className="text-[13px] font-bold text-slate-800">{workbookTitle}</p>
        <div className="mt-1.5 h-px w-full" style={{ backgroundColor: ACCENT }} />
        {showTypeTitle && typeTitle ? (
          <h2
            className="mt-4 text-[18px] font-black tracking-tight"
            style={{ color: ACCENT }}
          >
            {typeTitle}
          </h2>
        ) : null}
      </header>
      <div>{children}</div>
      <p className="pointer-events-none absolute bottom-[8mm] left-0 right-0 text-center text-[12px] text-slate-500">
        - {pageNo} -
      </p>
      <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-slate-400 print:hidden">
        {pageNo} / {total}
      </span>
    </article>
  );
}

function BlankInline({ token }: { token: Extract<BlankRenderToken, { type: "blank" }> }) {
  return (
    <span className="workbook-blank-unit">
      <sup className="blank-number">{token.number}</sup>
      <span className="blank-answer-area">
        {token.firstLetter != null ? (
          <span className="blank-first-letter">{token.firstLetter}</span>
        ) : null}
        <span className="blank-line" aria-hidden />
      </span>
    </span>
  );
}

function renderTokens(tokens: BlankRenderToken[]) {
  return tokens.map((t, i) =>
    t.type === "text" ? (
      <span key={`t-${i}`}>{t.text}</span>
    ) : (
      <BlankInline key={`b-${t.blankId}-${t.number}`} token={t} />
    )
  );
}

function BlankQuestionBody({
  section,
  showTranslation,
  layout,
}: {
  section: WorkbookBlankSection;
  showTranslation: boolean;
  layout: "chunk" | "sentence_pair";
}) {
  if (!showTranslation) {
    return (
      <p className="workbook-passage text-[13px] leading-relaxed text-slate-900">
        {renderTokens(section.passageTokens)}
      </p>
    );
  }

  if (layout === "sentence_pair") {
    return (
      <div className="space-y-4">
        {section.sentences.map((s) => (
          <div key={s.id} className="break-inside-avoid">
            <p className="text-[13px] leading-relaxed text-slate-900">
              {renderTokens(s.tokens)}
            </p>
            <p className="mt-1 text-[12px] leading-relaxed text-slate-500">
              {s.korean || "—"}
            </p>
          </div>
        ))}
        {section.translationWarning ? (
          <p className="text-[11px] text-amber-700">{section.translationWarning}</p>
        ) : null}
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <p className="workbook-passage text-[13px] leading-relaxed text-slate-900">
        {renderTokens(section.passageTokens)}
      </p>
      <div>
        <p
          className="mb-2 text-[14px] font-black"
          style={{ color: ACCENT }}
        >
          [해석]
        </p>
        <p className="workbook-passage text-[12.5px] leading-relaxed text-slate-700">
          {section.fullKorean || "—"}
        </p>
        {section.translationWarning ? (
          <p className="mt-2 text-[11px] text-amber-700">
            {section.translationWarning}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function BlankAnswerBody({ section }: { section: WorkbookBlankSection }) {
  return (
    <ol className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
      {section.answers.map((a) => {
        const showLemma =
          a.lemma &&
          a.lemma.toLowerCase() !== a.answerText.toLowerCase();
        return (
          <li
            key={a.number}
            className="break-inside-avoid text-[12.5px] leading-relaxed text-slate-800"
          >
            <span className="font-bold">{a.number}.</span> {a.answerText}
            {showLemma ? (
              <span className="text-slate-500"> ({a.lemma})</span>
            ) : null}{" "}
            — {a.meaningKo}
          </li>
        );
      })}
    </ol>
  );
}

function TfQuestionBody({
  section,
  multi,
}: {
  section: WorkbookPassageSection;
  multi: boolean;
}) {
  return (
    <>
      {multi ? (
        <p className="mb-2 text-[12px] font-semibold text-slate-500">
          {section.title}
          {section.source?.trim() ? ` · ${section.source.trim()}` : ""}
        </p>
      ) : null}
      <p className="workbook-passage text-[13px] leading-relaxed text-slate-900">
        {formatWorkbookPassage(section.passage)}
      </p>
      <div className="my-4 h-px w-full bg-slate-200" />
      <ol className="space-y-3">
        {section.items.map((it) => (
          <li
            key={it.index}
            className="break-inside-avoid text-[13px] leading-relaxed text-slate-900"
          >
            <span className="font-semibold">({it.index})</span> {it.statement}{" "}
            <span
              className="workbook-tf-mark ml-1 font-bold text-slate-500"
              style={{
                display: "inline-block",
                whiteSpace: "nowrap",
                wordBreak: "keep-all",
              }}
            >
              [ T / F ]
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

function TfAnswerBody({
  section,
  typeOrder,
  multi,
}: {
  section: WorkbookPassageSection;
  typeOrder: number;
  multi: boolean;
}) {
  return (
    <>
      <h3 className="mb-3 text-[16px] font-black" style={{ color: ACCENT }}>
        {typeOrder}. T/F 문제
        {multi ? ` · ${section.title}` : ""}
      </h3>
      <p className="mb-4 text-[13px] font-semibold text-slate-800">
        정답:{" "}
        {section.items.map((it) => `(${it.index}) ${it.answer}`).join("  ")}
      </p>
      <ol className="space-y-4">
        {section.items.map((it) => (
          <li
            key={it.index}
            className="break-inside-avoid text-[12.5px] leading-relaxed text-slate-800"
          >
            <p className="font-bold">
              ({it.index}) {it.answer}
            </p>
            <p className="mt-1 text-slate-700">{it.explanation}</p>
            {it.answer === "F" && it.correctedStatement ? (
              <p className="mt-1 text-slate-700">
                <span className="font-semibold text-rose-700">
                  바르게 고친 문장 ·{" "}
                </span>
                {it.correctedStatement}
              </p>
            ) : null}
          </li>
        ))}
      </ol>
    </>
  );
}

function parseTypes(raw: string | null): WorkbookTypeId[] {
  if (!raw?.trim()) return ["tf"];
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean) as WorkbookTypeId[];
  return sortWorkbookTypesByPrintOrder(list.length ? list : ["tf"]);
}

type WorkbookPage =
  | {
      kind: "blank_q";
      sectionIndex: number;
      typeOrder: number;
    }
  | {
      kind: "tf_q";
      sectionIndex: number;
      typeOrder: number;
    }
  | {
      kind: "answers";
      typeOrderBlank: number | null;
      typeOrderTf: number | null;
    };

export function WorkbookWorkbench({
  role,
}: {
  role: "admin" | "teacher";
}) {
  const searchParams = useSearchParams();
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const [workbook, setWorkbook] = useState<WorkbookData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<"MISSING_TRANSLATION" | null>(
    null
  );
  const [generating, setGenerating] = useState(true);
  const [status, setStatus] = useState("워크북을 준비하고 있습니다…");
  const [zoom, setZoom] = useState(85);

  const requestKey = searchParams.toString();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setGenerating(true);
      setError(null);
      setErrorCode(null);
      setWorkbook(null);

      const ids = (searchParams.get("ids") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const types = parseTypes(searchParams.get("types"));
      const count = clampTfCount(
        searchParams.get("count") ?? DEFAULT_WORKBOOK_TF_OPTIONS.count
      );
      const language = searchParams.get("lang") === "ko" ? "ko" : "en";
      const difficulty = searchParams.get("diff") === "hard" ? "hard" : "normal";
      const blankOptions = {
        hintType: parseBlankHintType(searchParams.get("blankHint")),
        showTranslation: searchParams.get("blankTr") !== "0",
        translationLayout: parseBlankTranslationLayout(
          searchParams.get("blankLayout")
        ),
        density: parseBlankDensity(searchParams.get("blankDensity")),
      };
      const title =
        searchParams.get("title")?.trim() || defaultWorkbookTitle();

      if (ids.length === 0) {
        const cached = loadWorkbookFromSession();
        if (
          cached &&
          ((cached.sections?.length ?? 0) > 0 ||
            (cached.blankSections?.length ?? 0) > 0)
        ) {
          if (!cancelled) {
            setWorkbook({
              ...cached,
              blankSections: cached.blankSections ?? [],
              blankOptions: cached.blankOptions ?? DEFAULT_WORKBOOK_BLANK_OPTIONS,
            });
            setGenerating(false);
          }
          return;
        }
        if (!cancelled) {
          setError(
            "생성된 워크북이 없습니다. 자료함에서 다시 만들어 주세요."
          );
          setGenerating(false);
        }
        return;
      }

      const wantBlank = types.includes("blank_fill");
      const wantTf = types.includes("tf");
      if (wantBlank && wantTf) {
        setStatus("워크북을 만들고 있습니다…");
      } else if (wantBlank) {
        setStatus("빈칸 채우기 워크북을 만들고 있습니다…");
      } else {
        setStatus(`T/F 문제를 생성하고 있습니다… (지문 ${ids.length}개)`);
      }

      try {
        const res = await generateWorkbookAction(role, {
          projectIds: ids,
          selectedTypes: types,
          tfOptions: { count, language, difficulty },
          blankOptions,
          title,
        });
        if (cancelled) return;
        if (!res.ok) {
          setError(res.message);
          setErrorCode(
            res.code === "MISSING_TRANSLATION" ? "MISSING_TRANSLATION" : null
          );
          setGenerating(false);
          return;
        }
        saveWorkbookToSession(res.workbook);
        setWorkbook(res.workbook);
        setGenerating(false);
      } catch (e) {
        if (cancelled) return;
        setError(
          e instanceof Error
            ? e.message
            : "워크북 생성 중 오류가 발생했습니다."
        );
        setGenerating(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- requestKey captures query
  }, [role, requestKey]);

  useEffect(() => {
    const id = "workbook-print-page-size-style";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
    }
    el.textContent = `
@media print {
  @page { size: 210mm 297mm; margin: 0; }
  @page app-print-a4 { size: 210mm 297mm; margin: 0; }
  #workbook-print-root { transform: none !important; gap: 0 !important; }
}
`;
    document.body.appendChild(el);
    return () => {
      el?.remove();
    };
  }, []);

  const typeOrders = useMemo(() => {
    const types = workbook?.selectedTypes ?? [];
    const map = new Map<WorkbookTypeId, number>();
    types.forEach((t, i) => map.set(t, i + 1));
    return map;
  }, [workbook?.selectedTypes]);

  const pages = useMemo(() => {
    if (!workbook) return [] as WorkbookPage[];
    const out: WorkbookPage[] = [];
    const types = workbook.selectedTypes;
    for (const t of types) {
      const order = typeOrders.get(t) ?? 1;
      if (t === "blank_fill") {
        workbook.blankSections.forEach((_, i) => {
          out.push({ kind: "blank_q", sectionIndex: i, typeOrder: order });
        });
      }
      if (t === "tf") {
        workbook.sections.forEach((_, i) => {
          out.push({ kind: "tf_q", sectionIndex: i, typeOrder: order });
        });
      }
    }
    if (types.length > 0) {
      out.push({
        kind: "answers",
        typeOrderBlank: typeOrders.get("blank_fill") ?? null,
        typeOrderTf: typeOrders.get("tf") ?? null,
      });
    }
    return out;
  }, [workbook, typeOrders]);

  const previewStyle = useMemo(
    (): CSSProperties => ({
      transform: `scale(${zoom / 100})`,
      transformOrigin: "top center",
    }),
    [zoom]
  );

  if (generating) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-3 bg-slate-100 px-4">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow">
          <p className="text-sm font-semibold text-slate-800">{status}</p>
          <p className="mt-2 text-xs text-slate-500">
            해석은 수업용자료에 저장된 내용을 재사용합니다. 저장 데이터가 있으면
            빈칸은 OpenAI 없이 바로 구성됩니다.
          </p>
        </div>
        <Link href={base} className="text-xs font-semibold text-violet-700">
          ← 자료함으로 돌아가기
        </Link>
      </div>
    );
  }

  if (error) {
    const ids = (searchParams.get("ids") ?? "")
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
    const continueWithoutTr = () => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("blankTr", "0");
      window.location.href = `${
        role === "admin"
          ? "/admin/lesson-materials/workbook"
          : "/teacher/lesson-materials/workbook"
      }?${params.toString()}`;
    };
    const lessonPackHref =
      ids.length > 0
        ? `${base}/lesson-pack?ids=${encodeURIComponent(ids.join(","))}`
        : `${base}/lesson-pack`;

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-4 px-4">
        <Alert variant="error">{error}</Alert>
        {errorCode === "MISSING_TRANSLATION" ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href={lessonPackHref}
              className="inline-flex rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              수업용자료로 이동
            </Link>
            <button
              type="button"
              className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={continueWithoutTr}
            >
              해석 미제공으로 계속
            </button>
            <Link
              href={base}
              className="inline-flex rounded-xl border border-slate-200 px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              취소
            </Link>
          </div>
        ) : (
          <Link href={base} className="text-sm font-semibold text-violet-700">
            ← 자료함
          </Link>
        )}
      </div>
    );
  }

  if (!workbook) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-100">
        <p className="text-sm text-slate-600">워크북을 불러오는 중…</p>
      </div>
    );
  }

  const title = workbook.metadata.title;
  const total = pages.length;
  const blankOpts = workbook.blankOptions ?? DEFAULT_WORKBOOK_BLANK_OPTIONS;

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-200 print:static print:z-auto print:block print:bg-white">
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white print:hidden">
        <div className="space-y-2 border-b border-slate-100 p-4">
          <Link href={base} className="text-xs font-semibold text-violet-700">
            ← 자료함
          </Link>
          <h1 className="text-base font-bold text-slate-900">워크북</h1>
          <p className="text-xs text-slate-500">{title}</p>
          <p className="text-[11px] text-slate-400">
            {workbook.selectedTypes
              .map((t) => workbookTypeDisplayTitle(t))
              .join(" · ")}
          </p>
        </div>
        <div className="mt-auto space-y-2 border-t border-slate-100 p-4">
          <Button
            type="button"
            size="sm"
            className="w-full"
            onClick={() => window.print()}
          >
            인쇄 / PDF 저장
          </Button>
          <p className="text-[10px] leading-relaxed text-slate-400">
            인쇄 대화상자에서 「PDF로 저장」을 선택하세요. 표지·빈 페이지 없이
            문제 → 정답 순입니다.
          </p>
        </div>
      </aside>

      <main className="relative min-w-0 flex-1 overflow-auto print:overflow-visible">
        <div className="sticky top-0 z-10 flex flex-wrap items-center justify-center gap-2 border-b border-slate-200/80 bg-white/90 px-4 py-2 backdrop-blur print:hidden">
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs"
            onClick={() => setZoom(100)}
          >
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

        <div className="flex justify-center p-6 print:p-0">
          <div
            id="workbook-print-root"
            className="flex origin-top flex-col gap-6 print:gap-0 print:!transform-none"
            style={previewStyle}
          >
            {pages.map((page, pageI) => {
              const pageNo = pageI + 1;
              const isLast = pageI === total - 1;

              if (page.kind === "blank_q") {
                const section = workbook.blankSections[page.sectionIndex]!;
                return (
                  <PageShell
                    key={`blank-q-${page.sectionIndex}`}
                    pageNo={pageNo}
                    total={total}
                    workbookTitle={title}
                    showTypeTitle
                    typeTitle={`${page.typeOrder}. 빈칸 채우기`}
                    isLast={isLast}
                  >
                    {workbook.blankSections.length > 1 ? (
                      <p className="mb-2 text-[12px] font-semibold text-slate-500">
                        {section.title}
                        {section.source?.trim()
                          ? ` · ${section.source.trim()}`
                          : ""}
                      </p>
                    ) : null}
                    <BlankQuestionBody
                      section={section}
                      showTranslation={blankOpts.showTranslation}
                      layout={blankOpts.translationLayout}
                    />
                  </PageShell>
                );
              }

              if (page.kind === "tf_q") {
                const section = workbook.sections[page.sectionIndex]!;
                return (
                  <PageShell
                    key={`tf-q-${page.sectionIndex}`}
                    pageNo={pageNo}
                    total={total}
                    workbookTitle={title}
                    showTypeTitle
                    typeTitle={`${page.typeOrder}. T/F 문제`}
                    isLast={isLast}
                  >
                    <TfQuestionBody
                      section={section}
                      multi={workbook.sections.length > 1}
                    />
                  </PageShell>
                );
              }

              // answers
              return (
                <PageShell
                  key="answers"
                  pageNo={pageNo}
                  total={total}
                  workbookTitle={title}
                  showTypeTitle
                  typeTitle="정답 및 해설"
                  isLast={isLast}
                >
                  <div className="space-y-8">
                    {page.typeOrderBlank != null
                      ? workbook.blankSections.map((section, i) => (
                          <div key={`ba-${section.projectId}-${i}`}>
                            <h3
                              className="mb-3 text-[16px] font-black"
                              style={{ color: ACCENT }}
                            >
                              {page.typeOrderBlank}. 빈칸 채우기
                              {workbook.blankSections.length > 1
                                ? ` · ${section.title}`
                                : ""}
                            </h3>
                            <BlankAnswerBody section={section} />
                          </div>
                        ))
                      : null}
                    {page.typeOrderTf != null
                      ? workbook.sections.map((section, i) => (
                          <div key={`ta-${section.projectId}-${i}`}>
                            <TfAnswerBody
                              section={section}
                              typeOrder={page.typeOrderTf!}
                              multi={workbook.sections.length > 1}
                            />
                          </div>
                        ))
                      : null}
                  </div>
                </PageShell>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
