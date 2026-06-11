"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";
import { ACADEMY_NAME, LOGO_SRC } from "@/lib/branding";
import {
  itemsPerVocabPrintPage,
  paginateVocabItems,
  parseVocabPrintMode,
  type VocabPrintMode,
} from "@/lib/vocab/paginate-vocab-print";
import type { VocabItem } from "@/types/database";

interface VocabSetPrintViewProps {
  title: string;
  description?: string | null;
  items: VocabItem[];
  backHref: string;
  initialMode?: VocabPrintMode;
}

const MODE_LABELS: Record<VocabPrintMode, string> = {
  workbook: "단어장 (단어·뜻)",
  example: "예문 포함",
  test: "뜻 쓰기 (단어만)",
};

function formatNo(globalIndex: number) {
  return String(globalIndex + 1).padStart(3, "0");
}

export function VocabSetPrintView({
  title,
  description,
  items,
  backHref,
  initialMode = "workbook",
}: VocabSetPrintViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = parseVocabPrintMode(searchParams.get("mode") ?? initialMode);

  const perPage = itemsPerVocabPrintPage(mode);
  const pages = useMemo(
    () => paginateVocabItems(items, perPage),
    [items, perPage]
  );

  const setMode = useCallback(
    (next: VocabPrintMode) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", next);
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  if (items.length === 0) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p className="text-slate-600">저장된 단어가 없어 인쇄할 수 없습니다.</p>
        <Link href={backHref} className="mt-4 inline-block text-brand-600 hover:underline">
          돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white">
      <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div className="mx-auto flex max-w-[210mm] flex-wrap items-center justify-between gap-3 px-4 py-3">
          <div>
            <p className="text-xs font-medium text-slate-500">단어장 인쇄</p>
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">{items.length}단어 · {pages.length}페이지</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {(Object.keys(MODE_LABELS) as VocabPrintMode[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  mode === key
                    ? "bg-emerald-700 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {MODE_LABELS[key]}
              </button>
            ))}
            <Link
              href={backHref}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              돌아가기
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              className="rounded-lg bg-emerald-700 px-4 py-1.5 text-sm font-bold text-white hover:bg-emerald-800"
            >
              인쇄 / PDF 저장
            </button>
          </div>
        </div>
        <p className="mx-auto max-w-[210mm] border-t border-slate-100 px-4 py-2 text-xs text-slate-500">
          인쇄 대화상자에서 「PDF로 저장」을 선택하면 파일로 저장할 수 있습니다.
        </p>
      </div>

      <div className="mx-auto max-w-[210mm] space-y-6 py-8 print:space-y-0 print:py-0">
        <div id="vocab-print-root">
          {pages.map((pageItems, pageIndex) => (
            <article
              key={pageIndex}
              className={`vocab-print-page ${pageIndex < pages.length - 1 ? "vocab-print-page-break" : ""}`}
            >
              <header className="vocab-print-header">
                <div className="vocab-print-header-top">
                  <div className="vocab-print-brand">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={LOGO_SRC} alt="" className="vocab-print-logo" />
                    <div>
                      <p className="vocab-print-academy">{ACADEMY_NAME}</p>
                      <p className="vocab-print-label">VOCABULARY</p>
                    </div>
                  </div>
                  <div className="vocab-print-meta-fields">
                    <span>이름</span>
                    <span className="vocab-print-field-line" />
                    <span>날짜</span>
                    <span className="vocab-print-field-line vocab-print-field-short" />
                  </div>
                </div>
                <h2 className="vocab-print-title">{title}</h2>
                {description?.trim() ? (
                  <p className="vocab-print-desc">{description.trim()}</p>
                ) : null}
                <div className="vocab-print-header-foot">
                  <span>{MODE_LABELS[mode]}</span>
                  <span>
                    {pageIndex + 1} / {pages.length} 페이지
                  </span>
                </div>
              </header>

              <table className="vocab-print-table">
                <thead>
                  <tr>
                    <th className="col-no">NO</th>
                    <th className="col-check">✓</th>
                    <th className="col-word">WORD</th>
                    {mode === "test" ? (
                      <th className="col-meaning">뜻 쓰기</th>
                    ) : (
                      <th className="col-meaning">MEANING</th>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {pageItems.map((item, rowIndex) => {
                    const globalIndex = pageIndex * perPage + rowIndex;
                    return (
                      <tr key={item.id} className={rowIndex % 2 === 1 ? "alt" : ""}>
                        <td className="col-no">{formatNo(globalIndex)}</td>
                        <td className="col-check">
                          <span className="vocab-print-checkbox" />
                        </td>
                        <td className="col-word">
                          <span className="vocab-print-word">{item.word}</span>
                          {mode === "example" && item.example_sentence?.trim() ? (
                            <p className="vocab-print-example">{item.example_sentence}</p>
                          ) : null}
                        </td>
                        <td className="col-meaning">
                          {mode === "test" ? (
                            <span className="vocab-print-blank-lines" />
                          ) : (
                            <>
                              <span className="vocab-print-meaning">{item.meaning}</span>
                              {mode === "example" && item.example_meaning?.trim() ? (
                                <p className="vocab-print-example-meaning">
                                  {item.example_meaning}
                                </p>
                              ) : null}
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>

              <footer className="vocab-print-footer">
                <span>{ACADEMY_NAME}</span>
                <span>
                  {title} · p.{pageIndex + 1}
                </span>
              </footer>
            </article>
          ))}
        </div>
      </div>

    </div>
  );
}
