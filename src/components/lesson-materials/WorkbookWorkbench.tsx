"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { loadWorkbookFromSession } from "@/components/lesson-materials/WorkbookCreateModal";
import type { WorkbookData } from "@/lib/lesson-materials/workbook-types";

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

export function WorkbookWorkbench({
  role,
}: {
  role: "admin" | "teacher";
}) {
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const [workbook, setWorkbook] = useState<WorkbookData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(85);

  useEffect(() => {
    const data = loadWorkbookFromSession<WorkbookData>();
    if (!data?.sections?.length) {
      setError("생성된 워크북이 없습니다. 자료함에서 다시 만들어 주세요.");
      return;
    }
    setWorkbook(data);
  }, []);

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

  const pages = useMemo(() => {
    if (!workbook) return [] as Array<{ kind: "q" | "a"; sectionIndex: number }>;
    const q = workbook.sections.map((_, i) => ({
      kind: "q" as const,
      sectionIndex: i,
    }));
    const a = workbook.sections.map((_, i) => ({
      kind: "a" as const,
      sectionIndex: i,
    }));
    // One answers block after all questions (or per section if many)
    // Spec: questions then 정답 및 해설 — for multiple passages, all Q then all A
    return [...q, ...a];
  }, [workbook]);

  const previewStyle = useMemo(
    (): CSSProperties => ({
      transform: `scale(${zoom / 100})`,
      transformOrigin: "top center",
    }),
    [zoom]
  );

  if (error) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3 px-4">
        <Alert variant="error">{error}</Alert>
        <Link href={base} className="text-sm font-semibold text-violet-700">
          ← 자료함
        </Link>
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
            T/F · 지문 {workbook.sections.length}개 · 문항/지문{" "}
            {workbook.tfOptions.count}개
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
              const section = workbook.sections[page.sectionIndex]!;
              const pageNo = pageI + 1;
              const isLast = pageI === total - 1;
              const typeOrder = 1;

              if (page.kind === "q") {
                return (
                  <PageShell
                    key={`q-${page.sectionIndex}`}
                    pageNo={pageNo}
                    total={total}
                    workbookTitle={title}
                    showTypeTitle
                    typeTitle={`${typeOrder}. T/F 문제`}
                    isLast={isLast}
                  >
                      {workbook.sections.length > 1 ? (
                        <p className="mb-2 text-[12px] font-semibold text-slate-500">
                          {section.title}
                          {section.source?.trim()
                            ? ` · ${section.source.trim()}`
                            : ""}
                        </p>
                      ) : null}
                      <p className="whitespace-pre-wrap text-[13px] leading-relaxed text-slate-900">
                        {section.passage}
                      </p>
                      <div className="my-4 h-px w-full bg-slate-200" />
                      <ol className="space-y-3">
                        {section.items.map((it) => (
                          <li
                            key={it.index}
                            className="break-inside-avoid text-[13px] leading-relaxed text-slate-900"
                          >
                            <span className="font-semibold">({it.index})</span>{" "}
                            {it.statement}{" "}
                            <span className="ml-1 font-bold text-slate-500">
                              [ T / F ]
                            </span>
                          </li>
                        ))}
                      </ol>
                  </PageShell>
                );
              }

              return (
                <PageShell
                  key={`a-${page.sectionIndex}`}
                  pageNo={pageNo}
                  total={total}
                  workbookTitle={title}
                  showTypeTitle
                  typeTitle="정답 및 해설"
                  isLast={isLast}
                >
                    <h3
                      className="mb-3 text-[16px] font-black"
                      style={{ color: ACCENT }}
                    >
                      {typeOrder}. T/F 문제
                      {workbook.sections.length > 1
                        ? ` · ${section.title}`
                        : ""}
                    </h3>
                    <p className="mb-4 text-[13px] font-semibold text-slate-800">
                      정답:{" "}
                      {section.items
                        .map((it) => `(${it.index}) ${it.answer}`)
                        .join("  ")}
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
                </PageShell>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
