"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useMemo, useState } from "react";
import { VocabPrintExamConfig } from "@/components/vocab/VocabPrintExamConfig";
import { ACADEMY_NAME, LOGO_SRC } from "@/lib/branding";
import { generatePrintExamQuestions } from "@/lib/vocab/generate-print-test-questions";
import { highlightWordInSentence } from "@/lib/vocab/highlight-word-in-sentence";
import {
  itemsPerVocabPrintPage,
  paginateVocabItems,
  parseVocabPrintMode,
  tableHeadLabel,
  VOCAB_PRINT_MODE_LABELS,
  type VocabPrintMode,
} from "@/lib/vocab/paginate-vocab-print";
import {
  examConfigTotal,
  examQuestionsPerPage,
  examRowsPerColumn,
  examSettingsToSearchParams,
  parseExamPrintSettings,
  type ExamPrintSettings,
} from "@/lib/vocab/vocab-print-exam-config";
import {
  parseVocabPrintSize,
  VOCAB_PRINT_PAGE_DIMENSIONS,
  VOCAB_PRINT_SIZE_LABELS,
  type VocabPrintSize,
} from "@/lib/vocab/vocab-print-size";
import type {
  VocabPrintRow,
  VocabPrintSection,
} from "@/lib/vocab/vocab-print-types";
import type { PrintExamQuestion } from "@/lib/vocab/generate-print-test-questions";

interface VocabSetPrintViewProps {
  sections: VocabPrintSection[];
  backHref: string;
  documentTitle?: string;
}

const CHOICE_MARKS = ["①", "②", "③", "④", "⑤", "⑥"];

function formatNo(globalIndex: number) {
  return String(globalIndex + 1).padStart(4, "0");
}

function PrintPageHeader({
  sectionTitle,
}: {
  sectionTitle: string;
}) {
  return (
    <>
      <div className="vocab-print-top-line" />
      <header className="vocab-print-header">
        <div className="vocab-print-header-left">
          <div className="vocab-print-logo-box">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={LOGO_SRC} alt={ACADEMY_NAME} className="vocab-print-logo-img" />
          </div>
          <div className="vocab-print-book-meta">
            <p className="vocab-print-series">{ACADEMY_NAME}</p>
            <h2 className="vocab-print-book-title">{sectionTitle}</h2>
          </div>
        </div>
        <div className="vocab-print-header-right">
          <div className="vocab-print-meta-line">
            <span>이름</span>
            <i />
          </div>
          <div className="vocab-print-meta-line">
            <span>날짜</span>
            <i />
          </div>
        </div>
      </header>
    </>
  );
}

export function VocabSetPrintView({
  sections,
  backHref,
  documentTitle,
}: VocabSetPrintViewProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const mode = parseVocabPrintMode(searchParams.get("mode") ?? undefined);
  const size = parseVocabPrintSize(searchParams.get("size") ?? undefined);
  const [examSettings, setExamSettings] = useState<ExamPrintSettings>(() =>
    parseExamPrintSettings(searchParams)
  );

  const pageDims = VOCAB_PRINT_PAGE_DIMENSIONS[size];
  const perPage = itemsPerVocabPrintPage(mode, size);
  const examCols = examSettings.layout.columns;
  const examPerPage = examQuestionsPerPage(size, examCols);
  const examRowsPerCol = examRowsPerColumn(size);

  const allItems = useMemo(
    () => sections.flatMap((s) => s.items),
    [sections]
  );

  const totalItems = allItems.length;

  const examGenerated = useMemo(() => {
    if (mode !== "exam") return { questions: [] as PrintExamQuestion[], skipped: 0 };
    return generatePrintExamQuestions(allItems, examSettings.counts, {
      shuffle: examSettings.layout.shuffle,
      shuffleSeed: examSettings.shuffleSeed,
    });
  }, [
    mode,
    allItems,
    examSettings.counts,
    examSettings.layout.shuffle,
    examSettings.shuffleSeed,
  ]);

  const flatPages = useMemo(() => {
    if (mode === "exam") return [];
    const rows: {
      section: VocabPrintSection;
      pageItems: (VocabPrintRow | null)[];
      pageIndex: number;
      sectionPageTotal: number;
      globalPageNum: number;
      sectionStartIndex: number;
    }[] = [];
    let globalPageNum = 0;
    for (const section of sections) {
      const pages = paginateVocabItems(section.items, perPage);
      pages.forEach((pageItems, pageIndex) => {
        globalPageNum += 1;
        rows.push({
          section,
          pageItems,
          pageIndex,
          sectionPageTotal: pages.length,
          globalPageNum,
          sectionStartIndex: pageIndex * perPage,
        });
      });
    }
    return rows;
  }, [sections, perPage, mode]);

  const examPages = useMemo(() => {
    if (mode !== "exam") return [] as (PrintExamQuestion | null)[][];
    return paginateVocabItems(examGenerated.questions, examPerPage);
  }, [mode, examGenerated.questions, examPerPage]);

  const pageCount = mode === "exam" ? examPages.length : flatPages.length;

  useEffect(() => {
    setExamSettings(parseExamPrintSettings(searchParams));
  }, [searchParams]);

  useEffect(() => {
    const id = "vocab-print-page-size-style";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.head.appendChild(el);
    }
    el.textContent =
      size === "b5"
        ? "@page { size: B5 portrait; margin: 8mm; }"
        : "@page { size: A4 portrait; margin: 10mm; }";
    return () => {
      el?.remove();
    };
  }, [size]);

  const setQuery = useCallback(
    (key: "mode" | "size", value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set(key, value);
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const syncExamSettingsToUrl = useCallback(
    (next: ExamPrintSettings) => {
      const params = new URLSearchParams(searchParams.toString());
      params.set("mode", "exam");
      for (const key of [
        "word_mc",
        "word_sa",
        "meaning_mc",
        "meaning_sa",
        "example_mc",
        "example_sa",
        "exam_cols",
        "exam_spacing",
        "exam_shuffle",
        "exam_seed",
      ]) {
        params.delete(key);
      }
      for (const [k, v] of Object.entries(examSettingsToSearchParams(next))) {
        params.set(k, v);
      }
      router.replace(`?${params.toString()}`);
    },
    [router, searchParams]
  );

  const updateExamSettings = useCallback(
    (next: ExamPrintSettings) => {
      setExamSettings(next);
      syncExamSettingsToUrl(next);
    },
    [syncExamSettingsToUrl]
  );

  const reshuffleExam = useCallback(() => {
    const next = { ...examSettings, shuffleSeed: Date.now() };
    setExamSettings(next);
    syncExamSettingsToUrl(next);
  }, [examSettings, syncExamSettingsToUrl]);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const title =
    documentTitle ??
    (sections.length === 1
      ? sections[0]!.title
      : `${sections.length}개 단어세트`);

  const headerTitle =
    sections.length === 1 ? sections[0]!.title : title;

  if (totalItems === 0) {
    return (
      <div className="mx-auto max-w-lg p-8 text-center">
        <p className="text-slate-600">인쇄할 단어가 없습니다.</p>
        <Link href={backHref} className="mt-4 inline-block text-brand-600 hover:underline">
          돌아가기
        </Link>
      </div>
    );
  }

  const examTotal = examConfigTotal(examSettings.counts);

  return (
    <div className="min-h-screen bg-slate-200 print:bg-white">
      <div className="no-print sticky top-0 z-10 border-b border-slate-200 bg-white shadow-sm">
        <div
          className="mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-3"
          style={{ maxWidth: pageDims.width }}
        >
          <div>
            <p className="text-xs font-medium text-slate-500">단어장 인쇄</p>
            <h1 className="text-lg font-bold text-slate-900">{title}</h1>
            <p className="text-sm text-slate-500">
              {totalItems}단어 · {pageCount}페이지 · {VOCAB_PRINT_SIZE_LABELS[size]}
              {mode === "exam" && examGenerated.questions.length > 0
                ? ` · 문항 ${examGenerated.questions.length}개`
                : ""}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-medium text-slate-500">용지</span>
            {(["a4", "b5"] as VocabPrintSize[]).map((key) => (
              <button
                key={key}
                type="button"
                onClick={() => setQuery("size", key)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                  size === key
                    ? "bg-slate-800 text-white"
                    : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {VOCAB_PRINT_SIZE_LABELS[key]}
              </button>
            ))}
            <span className="mx-1 text-slate-300">|</span>
            {(Object.keys(VOCAB_PRINT_MODE_LABELS) as VocabPrintMode[]).map(
              (key) => (
                <button
                  key={key}
                  type="button"
                  onClick={() => setQuery("mode", key)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition ${
                    mode === key
                      ? "bg-emerald-700 text-white"
                      : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                  }`}
                >
                  {VOCAB_PRINT_MODE_LABELS[key]}
                </button>
              )
            )}
            <Link
              href={backHref}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              돌아가기
            </Link>
            <button
              type="button"
              onClick={handlePrint}
              disabled={mode === "exam" && examGenerated.questions.length === 0}
              className="rounded-lg bg-emerald-700 px-4 py-1.5 text-sm font-bold text-white hover:bg-emerald-800 disabled:opacity-50"
            >
              인쇄 / PDF 저장
            </button>
          </div>
        </div>

        {mode === "exam" ? (
          <div className="mx-auto px-4 pb-3" style={{ maxWidth: pageDims.width }}>
            <VocabPrintExamConfig
              settings={examSettings}
              onChange={updateExamSettings}
              onReshuffle={reshuffleExam}
              maxPool={totalItems}
            />
            {examTotal === 0 ? (
              <p className="mt-2 text-xs text-amber-700">
                문항 수를 입력하면 시험지가 생성됩니다.
              </p>
            ) : null}
            {examTotal > 0 && examGenerated.questions.length === 0 ? (
              <p className="mt-2 text-xs text-red-600">
                문항을 만들 수 없습니다. 객관식은 단어가 2개 이상 필요합니다.
              </p>
            ) : null}
            {examGenerated.skipped > 0 ? (
              <p className="mt-2 text-xs text-amber-700">
                {examGenerated.skipped}문항은 보기를 만들 수 없어 제외되었습니다.
              </p>
            ) : null}
          </div>
        ) : (
          <p
            className="mx-auto border-t border-slate-100 px-4 py-2 text-xs text-slate-500"
            style={{ maxWidth: pageDims.width }}
          >
            용지 크기({VOCAB_PRINT_SIZE_LABELS[size]})를 선택한 뒤 인쇄하세요.
          </p>
        )}
      </div>

      <div
        className="mx-auto space-y-6 py-8 print:space-y-0 print:py-0"
        style={{ maxWidth: pageDims.width }}
      >
        <div id="vocab-print-root" data-size={size}>
          {mode === "exam"
            ? examPages.map((pageQuestions, pageIndex) => (
                <article
                  key={`exam-${pageIndex}`}
                  className={`vocab-print-page vocab-print-page--${size} vocab-print-page--exam vocab-exam-cols-${examCols} vocab-exam-spacing-${examSettings.layout.lineSpacing} ${pageIndex < examPages.length - 1 ? "vocab-print-page-break" : ""}`}
                  data-size={size}
                  style={
                    {
                      ["--vocab-exam-cols" as string]: examCols,
                      ["--vocab-exam-rows-per-col" as string]: examRowsPerCol,
                      ["--vocab-rows-per-page" as string]: examPerPage,
                      ["--vocab-page-width" as string]: pageDims.width,
                      ["--vocab-page-height" as string]: pageDims.height,
                    } as React.CSSProperties
                  }
                >
                  <PrintPageHeader sectionTitle={headerTitle} />

                  <div className={`vocab-exam-list vocab-exam-list--${examCols}col`}>
                    {pageQuestions.map((q, rowIndex) => {
                      if (!q) {
                        return (
                          <div
                            key={`empty-${rowIndex}`}
                            className="vocab-exam-row empty"
                          />
                        );
                      }
                      return <PrintExamEntry key={q.number} question={q} />;
                    })}
                  </div>

                  <footer className="vocab-print-footer">
                    <span>{ACADEMY_NAME}</span>
                    <span>
                      {pageIndex + 1} / {examPages.length}
                    </span>
                  </footer>
                </article>
              ))
            : flatPages.map(
                (
                  {
                    section,
                    pageItems,
                    pageIndex,
                    sectionPageTotal,
                    globalPageNum,
                    sectionStartIndex,
                  },
                  flatIndex
                ) => (
                  <article
                    key={`${section.setId}-${pageIndex}`}
                    className={`vocab-print-page vocab-print-page--${size} ${flatIndex < flatPages.length - 1 ? "vocab-print-page-break" : ""}`}
                    data-size={size}
                    style={
                      {
                        ["--vocab-rows-per-page" as string]: perPage,
                        ["--vocab-page-width" as string]: pageDims.width,
                        ["--vocab-page-height" as string]: pageDims.height,
                      } as React.CSSProperties
                    }
                  >
                    <PrintPageHeader sectionTitle={section.title} />

                    <div className="vocab-print-table-head">
                      <div>NO.</div>
                      <div>WORD</div>
                      <div>{tableHeadLabel(mode)}</div>
                    </div>

                    <div className="vocab-print-list">
                      {pageItems.map((item, rowIndex) => {
                        const globalIndex = sectionStartIndex + rowIndex;
                        if (!item) {
                          return (
                            <div
                              key={`empty-${rowIndex}`}
                              className="vocab-print-row empty"
                            />
                          );
                        }
                        return (
                          <PrintEntry
                            key={item.id}
                            item={item}
                            globalIndex={globalIndex}
                            mode={mode}
                          />
                        );
                      })}
                    </div>

                    <footer className="vocab-print-footer">
                      <span>{ACADEMY_NAME}</span>
                      <span>
                        {pageIndex + 1} / {sectionPageTotal}
                        {sections.length > 1 ? ` · 전체 p.${globalPageNum}` : ""}
                      </span>
                    </footer>
                  </article>
                )
              )}
        </div>
      </div>
    </div>
  );
}

function PrintExamEntry({ question }: { question: PrintExamQuestion }) {
  return (
    <section className="vocab-exam-row">
      <div className="vocab-exam-q-head">
        <span className="vocab-exam-q-no">{question.number}.</span>
        <div className="vocab-exam-q-main">
          <p className="vocab-exam-prompt">{question.prompt}</p>
          {question.subPrompt ? (
            <p className="vocab-exam-sub">{question.subPrompt}</p>
          ) : null}
        </div>
      </div>
      {question.choices ? (
        <ul className="vocab-exam-choices">
          {question.choices.map((choice, i) => (
            <li key={i}>
              <span className="vocab-exam-choice-mark">
                {CHOICE_MARKS[i] ?? `${i + 1}.`}
              </span>
              {choice}
            </li>
          ))}
        </ul>
      ) : (
        <div className="vocab-exam-answer-line" />
      )}
    </section>
  );
}

function PrintEntry({
  item,
  globalIndex,
  mode,
}: {
  item: VocabPrintRow;
  globalIndex: number;
  mode: VocabPrintMode;
}) {
  const exampleSentence = item.example_sentence?.trim() ?? "";
  const exampleMeaning = item.example_meaning?.trim() ?? "";
  const synonyms = item.synonyms?.trim() ?? "";
  const antonyms = item.antonyms?.trim() ?? "";
  const showFull = mode === "full";
  const pos = item.part_of_speech?.trim();

  return (
    <section className="vocab-print-row">
      <div className="vocab-print-row-left">
        <div className="vocab-print-num">{formatNo(globalIndex)}</div>
        <div className="vocab-print-checks" aria-hidden>
          <span className="vocab-print-check" />
          <span className="vocab-print-check" />
        </div>
      </div>

      <div className="vocab-print-word-box">
        <h2 className="vocab-print-word">{item.word}</h2>
      </div>

      <div className="vocab-print-content">
        <div className="vocab-print-meaning-line">
          <span className="vocab-print-meaning">{item.meaning}</span>
          {pos ? <span className="vocab-print-pos">{pos}</span> : null}
        </div>

        {showFull && exampleSentence ? (
          <p className="vocab-print-example">
            {highlightWordInSentence(exampleSentence, item.word)}
          </p>
        ) : null}

        {showFull && exampleMeaning ? (
          <p className="vocab-print-translation">{exampleMeaning}</p>
        ) : null}

        {showFull && (synonyms || antonyms) ? (
          <div className="vocab-print-meta-tags">
            {synonyms ? (
              <span className="vocab-print-tag syn">
                <span className="label">유의어</span>
                {synonyms}
              </span>
            ) : null}
            {antonyms ? (
              <span className="vocab-print-tag ant">
                <span className="label">반의어</span>
                {antonyms}
              </span>
            ) : null}
          </div>
        ) : null}
      </div>
    </section>
  );
}
