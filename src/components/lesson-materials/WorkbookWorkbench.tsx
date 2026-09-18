"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
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
import type {
  generateWorkbookAction,
  generateGrammarChoicePassageAction,
} from "@/lib/lesson-materials/workbook-actions";
import { postJson } from "@/lib/lesson-materials/post-json";
import { closeTabOrGo } from "@/components/lesson-materials/open-new-document";
import type {
  createLessonMaterialDocument,
  getWorkbookDocument,
} from "@/lib/lesson-materials/document-actions";
import {
  DEFAULT_WORKBOOK_BLANK_OPTIONS,
  DEFAULT_WORKBOOK_GRAMMAR_FIX_OPTIONS,
  DEFAULT_WORKBOOK_TF_OPTIONS,
  clampGrammarFixErrors,
  clampTfCount,
  parseGrammarFixMode,
  GRAMMAR_FIX_ERROR_COUNTS,
  type WorkbookGrammarFixOptions,
  type WorkbookGrammarFixSection,
  type WorkbookVocabChoiceSection,
  defaultWorkbookTitle,
  formatWorkbookPassage,
  parseBlankDensity,
  parseBlankHintType,
  parseBlankTranslationLayout,
  sortWorkbookTypesByPrintOrder,
  workbookTypeDisplayTitle,
  WORKBOOK_COLUMN_TYPES,
  type BlankRenderToken,
  type WorkbookColumnTypeId,
  type WorkbookBlankSection,
  type WorkbookData,
  type WorkbookFullEnWritingSection,
  type WorkbookGrammarChoiceSection,
  type WorkbookGrammarChoiceSkip,
  type WorkbookLineTranslationSection,
  type WorkbookPassageSection,
  type WorkbookSentenceOrderQuestion,
  type WorkbookTypeId,
  type WorkbookWordOrderWritingSection,
} from "@/lib/lesson-materials/workbook-types";
import { formatAnswerOrderSequence } from "@/lib/lesson-materials/sentence-order-shuffle";
import {
  buildGrammarFixSections,
  buildVocabFixSections,
} from "@/lib/lesson-materials/grammar-fix";
import { circledNumber } from "@/lib/lesson-materials/grammar-choice-constants";
import "./workbook-print-styles.css";
import { watchPageNumbersById } from "@/lib/lesson-materials/page-numbers";

/*
 * 워크북 모양. 분석지·변형문제와 같은 시안 셋(A 교재 세리프 · B 깔끔한 산세리프 · C 클래식 인쇄)
 * 가운데 하나를 고른다(기본은 A). 문항 구성·크기는 같고 글꼴·색·선만 바꾼다 —
 * workbook-print-styles.css의 .wb-style-*.
 */
type WorkbookDesignStyle = "a" | "b" | "c";
const DESIGN_STYLE_KEY = "workbook-print-design-style";
/** 쪽번호를 넣을지 (선생님이 자료마다 고른다) */
const PAGE_NUMBER_KEY = "workbook-page-numbers";
const DESIGN_STYLES: Array<{ id: WorkbookDesignStyle; label: string; hint: string }> = [
  { id: "a", label: "A", hint: "교재 세리프" },
  { id: "b", label: "B", hint: "깔끔한 산세리프" },
  { id: "c", label: "C", hint: "클래식 인쇄" },
];
/** A·B·C가 쓰는 글꼴. */
const DESIGN_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,500&family=Literata:opsz,wght@7..72,400;7..72,500;7..72,600&family=Gowun+Batang:wght@400;700&display=swap";

function designClass(style: WorkbookDesignStyle): string {
  return `wb-style wb-style-${style}`;
}

/** "3. 어법 선택" 같은 제목의 번호. 모양마다 번호만 따로 꾸민다(점은 모양에 따라 감춘다). */
function TitleNo({ no }: { no: ReactNode }) {
  return (
    <span className="wb-title-no">
      {no}
      <span className="wb-title-dot">.</span>
    </span>
  );
}

/**
 * 동시에 띄우는 어법 선택 지문 요청 수. 지문 하나가 요청 하나라 함수 실행시간
 * 상한과는 무관하고, 순차로 돌리면 지문 수에 비례해 그대로 느려진다.
 *
 * 요청은 서버 액션이 아니라 API 라우트(/api/lesson-materials/grammar-choice)로
 * 보낸다. 브라우저에서 부른 서버 액션은 Next.js가 한 번에 하나씩 실행하므로, 이
 * 상한을 4에서 8로 올렸을 때도 실제로는 지문이 하나씩 돌고 있었다(post-json.ts).
 * 요청은 각각 별도 함수 호출이라 서로의 실행시간을 잡아먹지 않고, 순간 호출이
 * 늘어 429가 나도 openai-call의 재시도가 받는다.
 */
const GRAMMAR_CHOICE_PASSAGE_CONCURRENCY = 8;

/**
 * 지문마다 요청 하나씩, 여러 지문을 함께 보낸다(어휘 선택). 한 지문이 실패해도 나머지는
 * 살리고, 실패한 지문은 건너뛴 목록에 사유와 함께 둔다.
 */
async function runPassagesInParallel<S>(input: {
  ids: string[];
  url: string;
  body: (projectId: string) => Record<string, unknown>;
  isCancelled: () => boolean;
}): Promise<{ sections: S[]; skipped: WorkbookGrammarChoiceSkip[] }> {
  const results = new Array<S | null>(input.ids.length).fill(null);
  const skips = new Array<WorkbookGrammarChoiceSkip | null>(input.ids.length).fill(null);
  let next = 0;
  const worker = async () => {
    for (;;) {
      const i = next;
      next += 1;
      if (i >= input.ids.length || input.isCancelled()) return;
      const projectId = input.ids[i]!;
      const one = await postJson<
        | { ok: true; section: S | null; skipped: WorkbookGrammarChoiceSkip | null }
        | { ok: false; message: string }
      >(input.url, input.body(projectId));
      if (input.isCancelled()) return;
      if (!one.ok) {
        skips[i] = { projectId, title: projectId, reason: one.message };
      } else {
        results[i] = one.section;
        if (one.skipped) skips[i] = one.skipped;
      }
    }
  };
  await Promise.all(
    Array.from({ length: Math.min(GRAMMAR_CHOICE_PASSAGE_CONCURRENCY, input.ids.length) }, worker)
  );
  return {
    sections: results.filter((s): s is S => s !== null),
    skipped: skips.filter((s): s is WorkbookGrammarChoiceSkip => s !== null),
  };
}

/** 저장된 워크북(브라우저 세션·워크북 파일)은 옛 형식일 수 있어 빠진 목록을 채운다. */
function withWorkbookDefaults(w: WorkbookData): WorkbookData {
  return {
    ...w,
    blankSections: w.blankSections ?? [],
    blankOptions: w.blankOptions ?? DEFAULT_WORKBOOK_BLANK_OPTIONS,
    grammarChoiceSections: w.grammarChoiceSections ?? [],
    grammarChoiceSkipped: w.grammarChoiceSkipped ?? [],
    sentenceOrderQuestions: w.sentenceOrderQuestions ?? [],
    sentenceOrderSkipped: w.sentenceOrderSkipped ?? [],
    lineTranslationSections: w.lineTranslationSections ?? [],
    lineTranslationSkipped: w.lineTranslationSkipped ?? [],
    fullEnWritingSections: w.fullEnWritingSections ?? [],
    fullEnWritingSkipped: w.fullEnWritingSkipped ?? [],
    wordOrderWritingSections: w.wordOrderWritingSections ?? [],
    wordOrderWritingSkipped: w.wordOrderWritingSkipped ?? [],
    grammarFixSections: w.grammarFixSections ?? [],
    grammarFixSkipped: w.grammarFixSkipped ?? [],
    vocabChoiceSections: w.vocabChoiceSections ?? [],
    vocabChoiceSkipped: w.vocabChoiceSkipped ?? [],
    vocabFixSections: w.vocabFixSections ?? [],
    vocabFixSkipped: w.vocabFixSkipped ?? [],
  };
}

const A4_WIDTH = "210mm";
const A4_HEIGHT = "297mm";
const A4_PAD_MM = 14;
const A4_FOOTER_MM = 18;
const A4_PAD = `${A4_PAD_MM}mm`;
const ACCENT = "#F07167";
/** 2단에서 지문과 지문 사이 간격(.workbook-col-section의 margin-bottom과 같게). */
const COLUMN_SECTION_GAP_PX = 18;
/** 2단 유형의 쪽 제목. */
const COLUMN_TYPE_TITLE: Record<WorkbookColumnTypeId, string> = {
  grammar_choice: "어법 선택",
  grammar_fix: "어법 수정",
  vocab_choice: "어휘 선택",
  vocab_fix: "어휘 수정",
  blank_fill: "빈칸 채우기",
  tf: "T/F 문제",
  sentence_order: "문장 순서 배열",
};

/** 창 본문의 단 사이 간격. 화면·인쇄가 같아야 잰 단 수와 인쇄의 단 수가 같다. */
const WINDOW_GAP = "7mm";

/**
 * 한 쪽보다 긴 내용을 높이 heightMm의 단(1단 또는 2단)으로 끝까지 흘린다. 넘친 단은 오른쪽으로
 * 이어 붙으므로, index번째 쪽의 단이 본문 자리에 오도록 옆으로 옮긴다(본문 밖은 가려진다).
 * 쪽마다 같은 흐름을 그리므로 줄 나눔이 쪽 사이에서 어긋나지 않는다. probe는 쪽 수를 재는 용도.
 */
function WindowFlow({
  columns,
  heightMm,
  index,
  probe,
  children,
}: {
  columns: 1 | 2;
  heightMm: number;
  index: number;
  probe?: string;
  children: ReactNode;
}) {
  return (
    <div
      className={`workbook-window-flow${columns === 2 ? " workbook-two-col" : " workbook-one-col"}`}
      style={{
        height: `${heightMm}mm`,
        transform: index > 0 ? `translateX(calc(${-index} * (100% + ${WINDOW_GAP})))` : undefined,
      }}
      data-wb-probe={probe}
    >
      {children}
    </div>
  );
}

/**
 * 쪽 머리글(워크북 제목 · 선 · 유형 제목). 쪽과 쪽 나눔 측정 영역이 같은 모양을 쓴다.
 * 유형 제목이 "3. 어법 선택"꼴이면 번호를 따로 감싸 모양마다 꾸민다(글자는 그대로).
 */
function SheetHeader({
  workbookTitle,
  typeTitle,
  suffix,
  measure,
}: {
  workbookTitle: string;
  typeTitle?: string;
  suffix?: string;
  measure?: boolean;
}) {
  const m = typeTitle ? /^(\d+)\.\s+([\s\S]*)$/.exec(typeTitle) : null;
  return (
    <header
      className="wb-sheet-header mb-4"
      data-wb-block={measure ? undefined : "sheet-header"}
      data-wb-measure={measure ? "sheet-header" : undefined}
    >
      <p className="wb-sheet-title text-[13px] font-bold text-slate-800">{workbookTitle}</p>
      <div className="wb-sheet-rule mt-1.5 h-px w-full" style={{ backgroundColor: ACCENT }} />
      {typeTitle ? (
        <h2 className="wb-type-title mt-4 text-[18px] font-black tracking-tight" style={{ color: ACCENT }}>
          {m ? (
            <>
              <TitleNo no={m[1]} /> {m[2]}
            </>
          ) : (
            typeTitle
          )}
          {suffix}
        </h2>
      ) : null}
    </header>
  );
}

function PageShell({
  children,
  pageNo,
  total,
  workbookTitle,
  showTypeTitle,
  typeTitle,
  isLast,
  columns = 1,
  columnHeightMm,
  columnKey,
  columnCount,
  windowIndex,
  windowCount,
}: {
  children: ReactNode;
  pageNo: number;
  total: number;
  workbookTitle: string;
  showTypeTitle?: boolean;
  typeTitle?: string;
  isLast?: boolean;
  /** 본문 단 수. 2이면 본문을 두 단으로 흘린다. */
  columns?: 1 | 2;
  /**
   * 2단 본문 높이. 주면 왼쪽 단을 이 높이까지 채운 뒤 오른쪽 단으로 넘긴다.
   * 없으면 두 단 높이를 맞춰 나누고, 내용이 길면 쪽이 늘어난다.
   * (쪽 높이를 고정하는 방식은 인쇄 CSS가 쪽 높이를 auto로 되돌려 쓸 수 없다.)
   */
  columnHeightMm?: number;
  /** 넘침 검사용: "유형:첫 지문 번호"와 이 쪽에 실은 지문 수. */
  columnKey?: string;
  columnCount?: number;
  /**
   * 한 쪽보다 긴 지문(또는 정답 블록)을 여러 쪽에 이어 실을 때 이 쪽의 순서(0부터).
   * 내용을 columnHeightMm 높이의 단으로 끝까지 흘리고, 이 쪽에는 그중 windowIndex번째
   * 쪽에 해당하는 단만 보이게 옮겨 둔다(나머지 단은 앞뒤 쪽에 보인다).
   */
  windowIndex?: number;
  windowCount?: number;
}) {
  const fixed = columnHeightMm != null;
  const win = windowIndex != null && fixed;
  return (
    <article
      className={`workbook-a4-sheet lesson-pack-a4-sheet relative box-border bg-white shadow-xl print:shadow-none ${
        isLast ? "lesson-pack-a4-sheet--last" : ""
      }`}
      style={{
        width: A4_WIDTH,
        minHeight: A4_HEIGHT,
        padding: A4_PAD,
        paddingBottom: `${A4_FOOTER_MM}mm`,
        boxSizing: "border-box",
      }}
    >
      <SheetHeader
        workbookTitle={workbookTitle}
        typeTitle={showTypeTitle && typeTitle ? typeTitle : undefined}
        suffix={
          win && windowIndex > 0 && typeTitle && !typeTitle.endsWith("(계속)") ? " (계속)" : ""
        }
      />
      {win ? (
        <div
          className="workbook-a4-body overflow-hidden"
          style={{ height: `${columnHeightMm}mm` }}
          data-wb-window={`${windowIndex + 1}/${windowCount ?? 1}`}
        >
          <WindowFlow columns={columns} heightMm={columnHeightMm} index={windowIndex}>
            {children}
          </WindowFlow>
        </div>
      ) : (
        <div
          className={`workbook-a4-body${columns === 2 ? " workbook-two-col" : ""}`}
          style={
            fixed
              ? { height: `${columnHeightMm}mm`, ...(columns === 2 ? { columnFill: "auto" } : {}) }
              : undefined
          }
          data-col-body={fixed ? columnKey : undefined}
          data-col-count={fixed ? columnCount : undefined}
        >
          {children}
        </div>
      )}
      <p className="wb-page-no pointer-events-none absolute bottom-[8mm] left-0 right-0 text-center text-[12px] text-slate-500">
        - {pageNo} -
      </p>
      <span className="sheet-preview-page-label pointer-events-none absolute bottom-2 right-3 text-[10px] text-slate-400 print:hidden">
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
            <p className="wb-en text-[13px] leading-relaxed text-slate-900">
              {renderTokens(s.tokens)}
            </p>
            <p className="wb-ko mt-1 text-[12px] leading-relaxed text-slate-500">
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
          className="wb-sub-label mb-2 text-[14px] font-black"
          style={{ color: ACCENT }}
        >
          [해석]
        </p>
        <p className="workbook-passage wb-ko text-[13px] leading-relaxed text-slate-700">
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
    <ol className="grid grid-cols-4 gap-x-4 gap-y-0.5">
      {section.answers.map((a) => {
        const showLemma =
          a.lemma &&
          a.lemma.toLowerCase() !== a.answerText.toLowerCase();
        return (
          <li
            key={a.number}
            className="wb-ak-item break-inside-avoid text-[10.5px] leading-snug text-slate-800"
          >
            <span className="wb-ak-no font-bold">{a.number}.</span> {a.answerText}
            {showLemma ? (
              <span className="text-slate-500"> ({a.lemma})</span>
            ) : null}
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
        <p className="wb-passage-meta mb-2 text-[12px] font-semibold text-slate-500">
          {section.title}
          {section.source?.trim() ? ` · ${section.source.trim()}` : ""}
        </p>
      ) : null}
      <p className="workbook-passage text-[13px] leading-relaxed text-slate-900">
        {formatWorkbookPassage(section.passage)}
      </p>
      <div className="wb-divider my-4 h-px w-full bg-slate-200" />
      <ol className="space-y-3">
        {section.items.map((it) => (
          <li
            key={it.index}
            className="wb-tf-item break-inside-avoid text-[13px] leading-relaxed text-slate-900"
          >
            <span className="wb-tf-no font-semibold">({it.index})</span> {it.statement}{" "}
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
      <h3 className="wb-ak-title mb-1 text-[12.5px] font-black" style={{ color: ACCENT }}>
        <TitleNo no={typeOrder} /> T/F 문제
        {multi ? ` · ${section.title}` : ""}
      </h3>
      <p className="wb-ak-text text-[10.5px] font-semibold text-slate-800">
        {section.items.map((it, i) => (
          <span key={it.index}>
            {i > 0 ? "  " : ""}
            <span className="wb-ak-no">({it.index})</span> {it.answer}
          </span>
        ))}
      </p>
    </>
  );
}

function GrammarChoiceQuestionBody({
  section,
  multi,
  instruction = "다음 글의 번호별 선택지에서 문법상 알맞은 표현을 고르세요.",
}: {
  /** 어법 선택·어휘 선택 모두 같은 모양([A / B])으로 그린다. */
  section: Pick<WorkbookGrammarChoiceSection, "title" | "source" | "segments">;
  multi: boolean;
  instruction?: string;
}) {
  return (
    <>
      {multi ? (
        <p className="wb-passage-meta mb-2 text-[12px] font-semibold text-slate-500">
          {section.title}
          {section.source?.trim() ? ` · ${section.source.trim()}` : ""}
        </p>
      ) : (
        <>
          <p className="wb-passage-meta mb-1 text-[12px] font-semibold text-slate-500">
            {section.title}
          </p>
          {section.source?.trim() ? (
            <p className="wb-passage-meta mb-3 text-[12px] font-semibold text-slate-500">
              · {section.source.trim()}
            </p>
          ) : (
            <div className="mb-3" />
          )}
        </>
      )}
      <p className="wb-instruction mb-4 text-[13px] font-semibold text-slate-800">{instruction}</p>
      <p className="grammar-passage text-[13px] text-slate-900">
        {section.segments.map((seg, i) =>
          seg.type === "text" ? (
            <span key={`gct-${i}`}>{seg.text}</span>
          ) : (
            <span
              key={`gcc-${seg.number}-${i}`}
              className="grammar-choice"
            >
              <span className="grammar-choice-num">{circledNumber(seg.number)}</span>
              <span className="grammar-choice-br">[</span>
              {seg.leftText}
              <span className="grammar-choice-or"> / </span>
              {seg.rightText}
              <span className="grammar-choice-br">]</span>
            </span>
          )
        )}
      </p>
    </>
  );
}

function GrammarChoiceAnswerBody({
  section,
  typeOrder,
  multi,
}: {
  section: WorkbookGrammarChoiceSection;
  typeOrder: number;
  multi: boolean;
}) {
  return (
    <>
      <h3 className="wb-ak-title mb-1 text-[12.5px] font-black" style={{ color: ACCENT }}>
        <TitleNo no={typeOrder} /> 어법 선택
        {multi ? ` · ${section.title}` : ""}
      </h3>
      <ol className="grid grid-cols-3 gap-x-4 gap-y-0.5">
        {section.items.map((it) => (
          <li
            key={it.choiceId}
            className="wb-ak-item break-inside-avoid text-[10.5px] leading-snug text-slate-800"
          >
            <span className="font-bold">
              <span className="wb-ak-no">{circledNumber(it.number)}</span> {it.correctText}
            </span>
            {it.labelHidden ? null : (
              <span className="ml-1 text-[9.5px] font-semibold text-slate-500">
                [{it.bookTerm || it.grammarCategoryName}]
              </span>
            )}
          </li>
        ))}
      </ol>
    </>
  );
}

/** 워크북 왼쪽: 수정형(어법·어휘) 출제 방식과 틀린 곳 수. 바꾸면 바로 다시 만든다. */
function FixControls({
  label,
  options,
  available,
  onChange,
}: {
  label: string;
  options: WorkbookGrammarFixOptions;
  available: boolean;
  onChange: (patch: Partial<WorkbookGrammarFixOptions>) => void;
}) {
  return (
    <div className="space-y-1.5">
      <p className="text-[11px] font-bold text-slate-500">{label}</p>
      {available ? (
        <>
          <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
            {(
              [
                { id: "underline", label: "밑줄 표시" },
                { id: "find", label: "밑줄 없음" },
              ] as const
            ).map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onChange({ mode: opt.id })}
                className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                  options.mode === opt.id
                    ? "bg-violet-600 text-white"
                    : "text-slate-500 hover:bg-slate-50"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-1">
            <span className="mr-1 text-xs text-slate-700">틀린 곳</span>
            {GRAMMAR_FIX_ERROR_COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => onChange({ errorCount: n })}
                className={`rounded-md px-2 py-0.5 text-xs font-semibold ${
                  options.errorCount === n
                    ? "bg-violet-600 text-white"
                    : "border border-slate-200 text-slate-500 hover:bg-slate-50"
                }`}
              >
                {n}
              </button>
            ))}
          </div>
        </>
      ) : (
        <p className="text-[11px] leading-snug text-slate-400">
          이 워크북은 출제 방식을 바꿀 수 없습니다. 워크북을 다시 만들면 바꿀 수 있습니다.
        </p>
      )}
    </div>
  );
}

const VOCAB_CHOICE_INSTRUCTION = "다음 글의 번호별 선택지에서 문맥상 알맞은 낱말을 고르세요.";

function VocabChoiceAnswerBody({
  section,
  typeOrder,
  multi,
}: {
  section: WorkbookVocabChoiceSection;
  typeOrder: number;
  multi: boolean;
}) {
  return (
    <>
      <h3 className="wb-ak-title mb-1 text-[12.5px] font-black" style={{ color: ACCENT }}>
        <TitleNo no={typeOrder} /> 어휘 선택
        {multi ? ` · ${section.title}` : ""}
      </h3>
      <ol className="grid grid-cols-4 gap-x-4 gap-y-0.5">
        {section.items.map((it) => (
          <li
            key={it.choiceId}
            className="wb-ak-item break-inside-avoid text-[10.5px] leading-snug text-slate-800"
          >
            <span className="font-bold">
              <span className="wb-ak-no">{circledNumber(it.number)}</span> {it.correctText}
            </span>
          </li>
        ))}
      </ol>
    </>
  );
}

function GrammarFixQuestionBody({
  section,
  multi,
  kind = "grammar",
}: {
  section: WorkbookGrammarFixSection;
  multi: boolean;
  /** 어법 수정과 어휘 수정은 모양이 같고 지시문만 다르다. */
  kind?: "grammar" | "vocab";
}) {
  const errors = section.answers.length;
  return (
    <>
      {multi ? (
        <p className="wb-passage-meta mb-2 text-[12px] font-semibold text-slate-500">
          {section.title}
          {section.source?.trim() ? ` · ${section.source.trim()}` : ""}
        </p>
      ) : (
        <>
          <p className="wb-passage-meta mb-1 text-[12px] font-semibold text-slate-500">{section.title}</p>
          {section.source?.trim() ? (
            <p className="wb-passage-meta mb-3 text-[12px] font-semibold text-slate-500">
              · {section.source.trim()}
            </p>
          ) : (
            <div className="mb-3" />
          )}
        </>
      )}
      <p className="wb-instruction mb-4 text-[13px] font-semibold text-slate-800">
        {kind === "vocab"
          ? section.mode === "underline"
            ? `밑줄 친 낱말 중 문맥상 쓰임이 적절하지 않은 것 ${errors}개를 찾아 바르게 고치세요.`
            : `다음 글에서 문맥상 쓰임이 적절하지 않은 낱말 ${errors}개를 찾아 바르게 고치세요.`
          : section.mode === "underline"
            ? `밑줄 친 부분 중 어법상 틀린 것 ${errors}개를 찾아 바르게 고치세요.`
            : `다음 글에서 어법상 틀린 부분 ${errors}개를 찾아 바르게 고치세요.`}
      </p>
      <p className="grammar-passage text-[13px] text-slate-900">
        {section.segments.map((seg, i) =>
          seg.type === "text" ? (
            <span key={`gft-${i}`}>{seg.text}</span>
          ) : seg.number != null ? (
            <span key={`gfs-${i}`} className="grammar-fix-spot">
              <span className="grammar-fix-num">{circledNumber(seg.number)}</span>
              <span className="grammar-fix-underline">{seg.text}</span>
            </span>
          ) : (
            <span key={`gfs-${i}`}>{seg.text}</span>
          )
        )}
      </p>
      <div className="grammar-fix-answer-rows mt-4 break-inside-avoid">
        {section.answers.map((_, i) => (
          <div key={`gfa-${i}`} className="grammar-fix-answer-row">
            {section.mode === "underline" ? (
              <span className="grammar-fix-answer-no">(&nbsp;&nbsp;&nbsp;&nbsp;)</span>
            ) : (
              <span className="grammar-fix-answer-no">{i + 1})</span>
            )}
            <span className="grammar-fix-answer-line" />
            <span className="grammar-fix-answer-arrow">→</span>
            <span className="grammar-fix-answer-line" />
          </div>
        ))}
      </div>
    </>
  );
}

function GrammarFixAnswerBody({
  section,
  typeOrder,
  multi,
  label = "어법 수정",
}: {
  section: WorkbookGrammarFixSection;
  typeOrder: number;
  multi: boolean;
  label?: string;
}) {
  return (
    <>
      <h3 className="wb-ak-title mb-1 text-[12.5px] font-black" style={{ color: ACCENT }}>
        <TitleNo no={typeOrder} /> {label}
        {multi ? ` · ${section.title}` : ""}
      </h3>
      <ol className="grid grid-cols-3 gap-x-4 gap-y-0.5">
        {section.answers.map((a, i) => (
          <li
            key={`gfk-${i}`}
            className="wb-ak-item break-inside-avoid text-[10.5px] leading-snug text-slate-800"
          >
            <span className="wb-ak-no font-bold">
              {a.number != null ? `${circledNumber(a.number)} ` : `${i + 1}) `}
            </span>
            {a.wrongText} → <span className="font-bold">{a.correctText}</span>
          </li>
        ))}
      </ol>
    </>
  );
}

function sentenceOrderHeading(
  typeOrder: number,
  q: WorkbookSentenceOrderQuestion,
  all: WorkbookSentenceOrderQuestion[]
): string {
  const samePassage = all.filter((x) => x.passageId === q.passageId);
  if (samePassage.length > 1) {
    return `${typeOrder}-${q.setIndex}. 문장 순서 배열`;
  }
  return `${typeOrder}. 문장 순서 배열`;
}

function SentenceOrderQuestionBody({
  question,
  showPassageMeta,
}: {
  question: WorkbookSentenceOrderQuestion;
  showPassageMeta: boolean;
}) {
  const answerBoxCount = question.shuffledItems.length;

  return (
    <>
      {showPassageMeta ? (
        <p className="wb-passage-meta mb-2 text-[12px] font-semibold text-slate-500">
          {question.title}
          {question.source?.trim() ? ` · ${question.source.trim()}` : ""}
        </p>
      ) : null}
      <p className="wb-instruction mb-4 text-[13px] font-semibold text-slate-800">
        다음 문장들을 글의 흐름에 맞게 배열하세요.
      </p>
      {question.pinFirstSentence && question.givenSentence ? (
        <div className="mb-4 break-inside-avoid">
          <p className="wb-passage-meta mb-1 text-[12px] font-bold text-slate-600">주어진 문장</p>
          <p className="wb-en text-[13px] leading-relaxed text-slate-900">
            {question.givenSentence.englishDisplay}
          </p>
        </div>
      ) : null}
      <ol className="space-y-3">
        {question.shuffledItems.map((it) => (
          <li
            key={`${question.questionId}-${it.displayNumber}`}
            className="sentence-order-choice break-inside-avoid text-[13px] leading-relaxed text-slate-900"
            style={{ pageBreakInside: "avoid" }}
          >
            <span className="sentence-order-choice-num">
              ({it.displayNumber})
            </span>
            <span className="sentence-order-choice-text">
              {it.englishDisplay}
            </span>
          </li>
        ))}
      </ol>
      <div className="mt-6 break-inside-avoid">
        <p className="wb-instruction mb-3 text-[13px] font-bold text-slate-800">정답 순서:</p>
        <div className="sentence-order-answer-row flex flex-wrap items-center gap-y-2">
          {Array.from({ length: answerBoxCount }, (_, i) => (
            <span
              key={`ab-${question.questionId}-${i}`}
              className="sentence-order-answer-unit inline-flex items-center"
            >
              {i > 0 ? (
                <span className="sentence-order-answer-arrow px-1.5 text-[13px] text-slate-500">
                  →
                </span>
              ) : null}
              <span className="sentence-order-answer-box" aria-hidden />
            </span>
          ))}
        </div>
      </div>
    </>
  );
}

function SentenceOrderAnswerBody({
  question,
  typeOrder,
  all,
}: {
  question: WorkbookSentenceOrderQuestion;
  typeOrder: number;
  all: WorkbookSentenceOrderQuestion[];
}) {
  const samePassage = all.filter((x) => x.passageId === question.passageId);
  const heading =
    samePassage.length > 1
      ? `${typeOrder}-${question.setIndex}`
      : `${typeOrder}`;
  return (
    <div className="break-inside-avoid">
      <p className="wb-ak-text text-[10.5px] font-semibold text-slate-800">
        <span className="wb-ak-no font-black" style={{ color: ACCENT }}>
          {heading}.
        </span>{" "}
        {formatAnswerOrderSequence(question.answerOrderNumbers)}
      </p>
    </div>
  );
}

function LineTranslationQuestionBody({
  section,
  itemIndices,
  continued,
}: {
  section: WorkbookLineTranslationSection;
  itemIndices?: number[];
  continued?: boolean;
}) {
  const items =
    itemIndices != null
      ? itemIndices.map((i) => section.items[i]!).filter(Boolean)
      : section.items;

  return (
    <>
      <p className="wb-passage-meta mb-1 text-[12px] font-semibold text-slate-500">
        {section.title}
        {continued ? " (계속)" : ""}
      </p>
      {section.source?.trim() ? (
        <p className="wb-passage-meta mb-3 text-[12px] font-semibold text-slate-500">
          · {section.source.trim()}
        </p>
      ) : (
        <div className="mb-3" />
      )}
      {!continued ? (
        <p className="wb-instruction mb-4 text-[13px] font-semibold text-slate-800">
          다음 영어 문장을 우리말로 해석하세요.
        </p>
      ) : null}
      <div>
        {items.map((it) => (
          <div
            key={`${section.projectId}-${it.sentenceId}`}
            className="line-translation-item"
            data-wb-item={`lt-${section.projectId}-${it.orderIndex}`}
          >
            <div className="line-translation-question">
              <span className="line-translation-number">{it.orderIndex}.</span>
              <p className="line-translation-english">{it.englishDisplay}</p>
            </div>
            <div className="line-translation-answer">
              {Array.from({ length: it.answerLineCount }, (_, i) => (
                <div
                  key={`al-${it.sentenceId}-${i}`}
                  className="translation-answer-line"
                />
              ))}
            </div>
          </div>
        ))}
      </div>
    </>
  );
}

/** 정답지에서 쪽을 넘겨 이어지는 지문 위에 다는 한 줄. */
function AnswerContinued({
  typeOrder,
  label,
  title,
}: {
  typeOrder: number;
  label: string;
  title: string;
}) {
  return (
    <p className="wb-ak-cont mb-2 text-[12px] font-semibold text-slate-500">
      {typeOrder}. {label} · {title} (계속)
    </p>
  );
}

function LineTranslationAnswerBody({
  section,
  typeOrder,
  multi,
  itemIndices,
  showHeader = true,
}: {
  section: WorkbookLineTranslationSection;
  typeOrder: number;
  multi: boolean;
  /** 정답지 쪽 나눔: 이 문장들만 그린다(없으면 전부). */
  itemIndices?: number[];
  /** 유형 제목·지문 제목을 그린다. 쪽을 넘겨 이어지는 문장이면 false. */
  showHeader?: boolean;
}) {
  const items =
    itemIndices != null
      ? itemIndices.map((i) => section.items[i]!).filter(Boolean)
      : section.items;
  return (
    <div className="line-translation-answer-key">
      {showHeader ? (
      <>
      <h3 className="wb-ak-title mb-1 text-[12.5px] font-black" style={{ color: ACCENT }}>
        <TitleNo no={typeOrder} /> 한줄해석
        {multi ? ` · ${section.title}` : ""}
      </h3>
      {!multi ? (
        <>
          <p className="wb-ak-meta text-[10px] font-semibold text-slate-500">
            {section.title}
            {section.source?.trim() ? ` · ${section.source.trim()}` : ""}
          </p>
        </>
      ) : section.source?.trim() ? (
        <p className="wb-ak-meta text-[10px] font-semibold text-slate-500">
          · {section.source.trim()}
        </p>
      ) : null}
      </>
      ) : null}
      <div className="space-y-0.5">
        {items.map((it) => (
          <div
            key={`lta-${section.projectId}-${it.sentenceId}`}
            className="break-inside-avoid"
            style={{ pageBreakInside: "avoid" }}
          >
            <p className="line-translation-answer-key-korean">
              <span className="wb-ak-no font-bold text-slate-700">{it.orderIndex}.</span> {it.korean}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function FullEnWritingQuestionBody({
  section,
  itemIndices,
  continued,
}: {
  section: WorkbookFullEnWritingSection;
  itemIndices?: number[];
  continued?: boolean;
}) {
  const items =
    itemIndices != null
      ? itemIndices.map((i) => section.items[i]!).filter(Boolean)
      : section.items;

  return (
    <>
      <p className="wb-passage-meta mb-1 text-[12px] font-semibold text-slate-500">
        {section.title}
        {continued ? " (계속)" : ""}
      </p>
      {section.source?.trim() ? (
        <p className="wb-passage-meta mb-3 text-[12px] font-semibold text-slate-500">
          · {section.source.trim()}
        </p>
      ) : (
        <div className="mb-3" />
      )}
      {!continued ? (
        <p className="wb-instruction mb-4 text-[13px] font-semibold text-slate-800">
          다음 우리말 뜻에 맞도록 영어 문장 전체를 쓰세요.
        </p>
      ) : null}
      <div>
        {items.map((it) => (
          <section
            key={`${section.projectId}-${it.sentenceId}`}
            className="full-writing-item"
            data-wb-item={`fe-${section.projectId}-${it.orderIndex}`}
          >
            <div className="full-writing-prompt">
              <span className="full-writing-number">{it.orderIndex}.</span>
              <div className="full-writing-korean">{it.korean}</div>
            </div>
            <div className="full-writing-answer-area">
              {Array.from({ length: it.answerLineCount }, (_, i) => (
                <div
                  key={`fwal-${it.sentenceId}-${i}`}
                  className="full-writing-answer-line"
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </>
  );
}

function FullEnWritingAnswerBody({
  section,
  typeOrder,
  multi,
  itemIndices,
  showHeader = true,
}: {
  section: WorkbookFullEnWritingSection;
  typeOrder: number;
  multi: boolean;
  /** 정답지 쪽 나눔: 이 문장들만 그린다(없으면 전부). */
  itemIndices?: number[];
  /** 유형 제목·지문 제목을 그린다. 쪽을 넘겨 이어지는 문장이면 false. */
  showHeader?: boolean;
}) {
  const items =
    itemIndices != null
      ? itemIndices.map((i) => section.items[i]!).filter(Boolean)
      : section.items;
  return (
    <div className="full-writing-answer-key">
      {showHeader ? (
      <>
      <h3 className="wb-ak-title mb-1 text-[12.5px] font-black" style={{ color: ACCENT }}>
        <TitleNo no={typeOrder} /> 통문장 영작
        {multi ? ` · ${section.title}` : ""}
      </h3>
      {!multi ? (
        <>
          <p className="wb-ak-meta text-[10px] font-semibold text-slate-500">
            {section.title}
            {section.source?.trim() ? ` · ${section.source.trim()}` : ""}
          </p>
        </>
      ) : section.source?.trim() ? (
        <p className="wb-ak-meta text-[10px] font-semibold text-slate-500">
          · {section.source.trim()}
        </p>
      ) : null}
      </>
      ) : null}
      <div className="space-y-0.5">
        {items.map((it) => (
          <div
            key={`fwa-${section.projectId}-${it.sentenceId}`}
            className="break-inside-avoid"
            style={{ pageBreakInside: "avoid" }}
          >
            <p className="full-writing-answer-key-english">
              <span className="wb-ak-no font-bold text-slate-700">{it.orderIndex}.</span> {it.englishDisplay}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function WordOrderQuestionBody({
  section,
  itemIndices,
  continued,
}: {
  section: WorkbookWordOrderWritingSection;
  itemIndices?: number[];
  continued?: boolean;
}) {
  const items =
    itemIndices != null
      ? itemIndices.map((i) => section.items[i]!).filter(Boolean)
      : section.items;

  return (
    <div className="word-order-sheet">
      <p className="word-order-passage-title mb-1 font-semibold text-slate-500">
        {section.title}
        {continued ? " (계속)" : ""}
      </p>
      {section.source?.trim() ? (
        <p className="word-order-source mb-2 font-semibold text-slate-500">
          · {section.source.trim()}
        </p>
      ) : (
        <div className="mb-2" />
      )}
      {!continued ? (
        <p className="word-order-instruction mb-3 font-semibold text-slate-800">
          우리말 뜻과 일치하도록 주어진 영어 어절을 올바르게 배열하여 완전한
          문장을 쓰세요.
        </p>
      ) : null}
      <div>
        {items.map((it) => (
          <section
            key={it.questionId}
            className="word-order-item"
            data-wb-item={`wo-${section.projectId}-${it.orderIndex}`}
          >
            <div className="word-order-prompt">
              <span className="word-order-number">{it.orderIndex}.</span>
              <div className="word-order-korean">{it.korean}</div>
            </div>
            <div className="word-order-bank" aria-label="섞인 영어 의미 단위">
              {(it.shuffledChunks ?? []).map((chunk, index) => (
                <span key={chunk.chunkId} className="word-order-chunk-unit">
                  <span>{chunk.text}</span>
                  {index < (it.shuffledChunks?.length ?? 0) - 1 ? (
                    <span className="word-order-separator">/</span>
                  ) : null}
                </span>
              ))}
            </div>
            <div className="word-order-answer-area">
              {Array.from({ length: it.answerLineCount }, (_, i) => (
                <div
                  key={`woal-${it.questionId}-${i}`}
                  className="word-order-answer-line"
                />
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function WordOrderAnswerBody({
  section,
  typeOrder,
  multi,
  itemIndices,
  showHeader = true,
}: {
  section: WorkbookWordOrderWritingSection;
  typeOrder: number;
  multi: boolean;
  /** 정답지 쪽 나눔: 이 문장들만 그린다(없으면 전부). */
  itemIndices?: number[];
  /** 유형 제목·지문 제목을 그린다. 쪽을 넘겨 이어지는 문장이면 false. */
  showHeader?: boolean;
}) {
  const items =
    itemIndices != null
      ? itemIndices.map((i) => section.items[i]!).filter(Boolean)
      : section.items;
  return (
    <div className="word-order-answer-key word-order-sheet">
      {showHeader ? (
      <>
      <h3 className="wb-ak-title mb-1 text-[12.5px] font-black" style={{ color: ACCENT }}>
        <TitleNo no={typeOrder} /> 어순배열 영작
        {multi ? ` · ${section.title}` : ""}
      </h3>
      {!multi ? (
        <>
          <p className="wb-ak-meta text-[10px] font-semibold text-slate-500">
            {section.title}
            {section.source?.trim() ? ` · ${section.source.trim()}` : ""}
          </p>
        </>
      ) : section.source?.trim() ? (
        <p className="wb-ak-meta text-[10px] font-semibold text-slate-500">
          · {section.source.trim()}
        </p>
      ) : null}
      </>
      ) : null}
      <div className="space-y-0.5">
        {items.map((it) => (
          <div
            key={`woa-${it.questionId}`}
            className="break-inside-avoid"
            style={{ pageBreakInside: "avoid" }}
          >
            <p className="word-order-answer-key-english">
              <span className="wb-ak-no font-bold text-slate-700">{it.orderIndex}.</span> {it.originalEnglish}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

function parseTypes(raw: string | null): WorkbookTypeId[] {
  if (!raw?.trim()) return ["tf"];
  const list = raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .filter((id) => id !== "vocab_example") as WorkbookTypeId[];
  return sortWorkbookTypesByPrintOrder(list.length ? list : ["tf"]);
}

/**
 * 2단 유형의 한 쪽. 지문(문장 순서 배열은 문항) 여러 개를 왼쪽 단부터 이어 싣는다.
 * packed가 아니면 지문 하나가 한 쪽보다 길어 따로 한 쪽을 쓴다.
 */
type ColumnPage = {
  kind: "columns_q";
  type: WorkbookColumnTypeId;
  indices: number[];
  typeOrder: number;
  packed: boolean;
  columns: 1 | 2;
  /** 한 쪽보다 긴 지문을 여러 쪽에 이어 실을 때 이 쪽의 순서와 전체 쪽 수. */
  window?: { index: number; count: number };
};

/** 한줄해석·통문장 영작·어순배열 영작: 문항 단위로 쪽을 나누고 지문을 이어 싣는다. */
type FlowKind = "line_ko" | "full_en" | "word_order";
type FlowPart = { sectionIndex: number; itemIndices: number[]; continued: boolean };

const FLOW_KIND_BY_TYPE: Partial<Record<WorkbookTypeId, FlowKind>> = {
  one_line_ko: "line_ko",
  full_en_writing: "full_en",
  word_order_writing: "word_order",
};
const FLOW_TITLE: Record<FlowKind, string> = {
  line_ko: "한줄해석",
  full_en: "통문장 영작",
  word_order: "어순배열 영작",
};
/** 한 쪽에서 앞 지문과 다음 지문 사이 간격(.workbook-flow-part 여백·선과 같게). */
const FLOW_PART_GAP_PX = 34;

type WorkbookPage =
  | ColumnPage
  | {
      kind: "flow_q";
      flow: FlowKind;
      parts: FlowPart[];
      typeOrder: number;
    }
  | {
      kind: "answers";
      /** 이 쪽에 싣는 정답 블록(answerBlocks의 key). null이면 전부(쪽 나눔을 재기 전). */
      keys: string[] | null;
      continued: boolean;
      /** 한 쪽보다 긴 정답 블록 하나를 여러 쪽에 이어 실을 때 이 쪽의 순서와 전체 쪽 수. */
      window?: { index: number; count: number };
    };

/** 정답지 블록 사이 간격(px): 같은 유형 안 / 유형이 바뀔 때. */
/* 정답지는 촘촘하게(선생님 의견 2026-09-18: 글씨·줄간격을 줄이고 단을 늘려 종이를 아끼자). */
const ANSWER_GAP_SAME_PX = 8;
const ANSWER_GAP_TYPE_PX = 12;

/** 정답지의 한 덩어리(지문 하나의 정답, 또는 긴 유형은 문장 하나). */
type AnswerBlock = {
  key: string;
  /** 유형 번호. 블록은 이 순서로 놓인다. */
  order: number;
  /** 앞 블록과의 간격(px). 없으면 유형이 같은지로 정한다. */
  gap?: number;
  /** 쪽을 넘겨 이 블록부터 시작할 때 위에 다는 "(계속)" 줄. */
  cont?: ReactNode;
  node: ReactNode;
};

function answerGapBefore(prev: { order: number }, b: { order: number; gap?: number }): number {
  if (b.gap != null) return b.gap;
  return prev.order === b.order ? ANSWER_GAP_SAME_PX : ANSWER_GAP_TYPE_PX;
}

export function WorkbookWorkbench({
  role,
  embeddedDocId,
}: {
  role: "admin" | "teacher";
  /** 최종통합자료 안에 끼워 넣을 워크북 파일. 저장된 결과만 보여 주고 만들거나 고치지 않는다. */
  embeddedDocId?: string;
}) {
  const searchParams = useSearchParams();
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const [workbook, setWorkbook] = useState<WorkbookData | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<
    "MISSING_TRANSLATION" | "MISSING_LINE_TRANSLATION" | null
  >(null);
  const [lineTranslationExcludeIds, setLineTranslationExcludeIds] = useState<
    string[]
  >([]);
  const [generating, setGenerating] = useState(true);
  const [status, setStatus] = useState(
    searchParams.get("ids")
      ? "새로 만들고 있습니다…"
      : "기존 워크북을 불러오고 있습니다…"
  );
  const [sourceNote, setSourceNote] = useState<"new" | "existing" | null>(null);
  /** 나머지 유형을 먼저 보여 준 뒤 어법 선택을 만드는 중인지. */
  const [grammarChoicePending, setGrammarChoicePending] = useState(false);
  const [zoom, setZoom] = useState(85);
  /** 한줄해석·영작 유형의 쪽 배치(재 둔 높이로 나눈 것). */
  const [flowPages, setFlowPages] = useState<Partial<Record<FlowKind, FlowPart[][]>>>({});
  /** 2단 유형: 쪽마다 실을 지문(문항) 번호. packed가 아니면 한 쪽보다 긴 지문 하나. */
  const [columnPacks, setColumnPacks] = useState<
    Partial<Record<WorkbookColumnTypeId, { indices: number[]; packed: boolean }[]>>
  >({});
  /** 2단 쪽의 본문(단) 높이. 머리글 높이를 잰 뒤에 정해진다. */
  const [columnBodyMm, setColumnBodyMm] = useState<number | null>(null);
  /**
   * 한 쪽보다 긴 지문(packed가 아닌 쪽)·정답 블록이 차지하는 쪽 수. 키는 "유형:지문 번호" 또는
   * "answer:블록 key". 재기 전에는 없고, 그동안은 예전처럼 한 쪽에 싣는다.
   */
  const [windowCounts, setWindowCounts] = useState<Record<string, number>>({});
  /** 정답지 쪽마다 실을 블록(key). 재기 전에는 null(한 쪽에 전부). */
  const [answerPages, setAnswerPages] = useState<string[][] | null>(null);
  /** 한 쪽보다 긴 정답 블록(key). 쪽 수를 재어 여러 쪽에 이어 싣는다. */
  const [answerOversize, setAnswerOversize] = useState<string[]>([]);
  /** 글꼴을 다 받은 뒤 정답지 높이를 다시 잰다(글꼴이 바뀌면 줄 수가 달라진다). */
  const [fontsReady, setFontsReady] = useState(false);
  useEffect(() => {
    let alive = true;
    void document.fonts?.ready.then(() => {
      if (alive) setFontsReady(true);
    });
    return () => {
      alive = false;
    };
  }, []);
  /** 그려 보니 넘친 2단 쪽: "유형:첫 지문 번호" → 그 쪽에 실을 수 있는 지문 수. */
  const [columnLimits, setColumnLimits] = useState<Record<string, number>>({});
  /** 워크북 모양(A·B·C). 최종통합자료에 끼워 넣을 때도 같은 저장값을 읽는다. 옛 "base"는 A로 본다. */
  const [designStyle, setDesignStyle] = useState<WorkbookDesignStyle>("a");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DESIGN_STYLE_KEY);
      if (saved === "a" || saved === "b" || saved === "c") setDesignStyle(saved);
    } catch {
      /* 저장소를 못 쓰면 A */
    }
  }, []);
  /** 쪽번호 — 인쇄물 오른쪽 아래에 1부터 찍는다. 최종통합자료에 끼울 때는 통합자료가 센다. */
  const [pageNumbers, setPageNumbers] = useState(false);
  useEffect(() => {
    try {
      setPageNumbers(window.localStorage.getItem(PAGE_NUMBER_KEY) === "on");
    } catch {
      /* 저장소를 못 쓰면 끈 채로 */
    }
  }, []);
  const choosePageNumbers = (on: boolean) => {
    setPageNumbers(on);
    try {
      window.localStorage.setItem(PAGE_NUMBER_KEY, on ? "on" : "off");
    } catch {
      /* 무시 */
    }
  };
  useEffect(
    () => watchPageNumbersById("workbook-print-root", pageNumbers && !embeddedDocId),
    [pageNumbers, embeddedDocId]
  );

  const chooseDesignStyle = (style: WorkbookDesignStyle) => {
    setDesignStyle(style);
    try {
      window.localStorage.setItem(DESIGN_STYLE_KEY, style);
    } catch {
      /* 무시 */
    }
  };
  // 모양이 바뀌면 글자 폭이 달라지므로, 앞 모양에서 넘쳐 줄여 둔 2단 쪽 한도를 비우고 다시 잰다.
  useEffect(() => {
    setColumnLimits((prev) => (Object.keys(prev).length === 0 ? prev : {}));
  }, [designStyle]);
  /*
   * 모양 글꼴은 늦게 들어와 글자 폭이 달라진다. 쪽 나눔은 잰 높이로 하므로 글꼴이 들어온 뒤
   * 한 번 더 잰다(안 그러면 쪽이 넘쳐 아래가 잘린다).
   */
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
  }, [designStyle]);
  const measureRef = useRef<HTMLDivElement>(null);
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  /** 저장을 차례로 보낸다. 늦게 떠난 저장이 먼저 도착해 앞 내용으로 덮는 일을 막는다. */
  const saveChain = useRef<Promise<unknown>>(Promise.resolve());
  const saveSeq = useRef(0);

  useEffect(
    () => () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    },
    []
  );

  /**
   * 화면에서 고친 워크북(제목·지문 제목·출처·단 수)을 보여 주고, 브라우저와 워크북 파일에
   * 저장한다. 글자를 칠 때마다 보내지 않게 입력이 잠깐 멈춘 뒤에 보낸다.
   */
  function editWorkbook(mutate: (w: WorkbookData) => WorkbookData) {
    if (!workbook) return;
    const next = mutate(workbook);
    setWorkbook(next);
    saveWorkbookToSession(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    const docId = new URLSearchParams(window.location.search).get("doc")?.trim();
    if (!docId) return;
    setSaveState("saving");
    saveTimer.current = setTimeout(() => {
      saveTimer.current = null;
      const seq = ++saveSeq.current;
      saveChain.current = saveChain.current.then(async () => {
        const res = await postJson<{ ok: true }>("/api/lesson-materials/documents/workbook", {
          id: docId,
          workbook: next,
        });
        if (seq === saveSeq.current) setSaveState(res.ok ? "saved" : "error");
      });
    }, 800);
  }

  /** 탭을 닫고 자료함 탭으로 돌아간다. 아직 보내지 않은 고친 내용이 있으면 먼저 저장한다. */
  async function leaveWorkbook() {
    if (saveTimer.current && workbook) {
      clearTimeout(saveTimer.current);
      saveTimer.current = null;
      const docId = new URLSearchParams(window.location.search).get("doc")?.trim();
      if (docId) {
        await postJson<{ ok: true }>("/api/lesson-materials/documents/workbook", {
          id: docId,
          workbook,
        });
      }
    }
    await saveChain.current;
    closeTabOrGo(base);
  }

  /** 지문 제목·출처는 유형마다 따로 들어 있어 같은 지문을 모두 고친다. */
  function editPassage(projectId: string, patch: { title: string } | { source: string }) {
    const apply = <T extends { projectId: string; title: string; source: string | null }>(
      list: T[] | undefined
    ) => list?.map((s) => (s.projectId === projectId ? { ...s, ...patch } : s));
    editWorkbook((w) => ({
      ...w,
      sections: apply(w.sections) ?? [],
      blankSections: apply(w.blankSections) ?? [],
      grammarChoiceSections: apply(w.grammarChoiceSections),
      grammarFixSections: apply(w.grammarFixSections),
      vocabChoiceSections: apply(w.vocabChoiceSections),
      vocabFixSections: apply(w.vocabFixSections),
      lineTranslationSections: apply(w.lineTranslationSections),
      fullEnWritingSections: apply(w.fullEnWritingSections),
      wordOrderWritingSections: apply(w.wordOrderWritingSections),
      sentenceOrderQuestions: w.sentenceOrderQuestions?.map((q) =>
        q.passageId === projectId ? { ...q, ...patch } : q
      ),
    }));
  }

  /** 수정형 출제 방식·틀린 곳 수를 바꾸면 선택형 결과(어법·어휘)로 바로 다시 만든다. */
  function changeFix(kind: "grammar" | "vocab", patch: Partial<WorkbookGrammarFixOptions>) {
    editWorkbook((w) => {
      const options: WorkbookGrammarFixOptions = {
        ...((kind === "grammar" ? w.grammarFixOptions : w.vocabFixOptions) ??
          DEFAULT_WORKBOOK_GRAMMAR_FIX_OPTIONS),
        ...patch,
      };
      if (kind === "grammar") {
        const fix = buildGrammarFixSections(w.grammarChoiceSections ?? [], options);
        return {
          ...w,
          grammarFixOptions: options,
          grammarFixSections: fix.sections,
          grammarFixSkipped: fix.skipped,
        };
      }
      const fix = buildVocabFixSections(w.vocabChoiceSections ?? [], options);
      return {
        ...w,
        vocabFixOptions: options,
        vocabFixSections: fix.sections,
        vocabFixSkipped: fix.skipped,
      };
    });
  }

  function columnsFor(type: WorkbookColumnTypeId): 1 | 2 {
    return workbook?.columnLayout?.[type] === 2 ? 2 : 1;
  }

  /** 편집 칸에 보일 지문 목록(워크북에 든 지문마다 하나). */
  const editablePassages = useMemo(() => {
    if (!workbook) return [];
    const seen = new Map<string, { projectId: string; title: string; source: string }>();
    const add = (projectId: string, title: string, source: string | null) => {
      if (!seen.has(projectId)) seen.set(projectId, { projectId, title, source: source ?? "" });
    };
    for (const list of [
      workbook.grammarChoiceSections ?? [],
      workbook.grammarFixSections ?? [],
      workbook.vocabChoiceSections ?? [],
      workbook.vocabFixSections ?? [],
      workbook.blankSections,
      workbook.sections,
      workbook.lineTranslationSections ?? [],
      workbook.fullEnWritingSections ?? [],
      workbook.wordOrderWritingSections ?? [],
    ]) {
      for (const s of list) add(s.projectId, s.title, s.source);
    }
    for (const q of workbook.sentenceOrderQuestions ?? []) add(q.passageId, q.title, q.source);
    return [...seen.values()];
  }, [workbook]);

  /**
   * 생성을 다시 돌릴지 가르는 키. 파일을 만든 뒤 주소에 doc=를 붙이고 newDoc을 떼는 것은
   * 같은 요청이므로 키에서 뺀다(빼지 않으면 도는 중인 생성이 취소되고 처음부터 다시 돈다).
   */
  const requestKey = (() => {
    const p = new URLSearchParams(searchParams.toString());
    p.delete("doc");
    p.delete("newDoc");
    p.delete("docName");
    return p.toString();
  })();
  /** 이 탭에서 만들어 파일에 저장까지 끝낸 워크북 파일 id. */
  const producedDocRef = useRef<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const timers: {
      status: ReturnType<typeof setTimeout> | null;
      elapsed: ReturnType<typeof setInterval> | null;
    } = { status: null, elapsed: null };
    let docId = searchParams.get("doc")?.trim() || null;
    const freshRequest = searchParams.get("fresh") === "1";
    const newDocRequest = searchParams.get("newDoc") === "1" && !docId;
    // 저장 뒤 주소에서 fresh=1만 뗀 것이다. 화면의 워크북을 그대로 둔다.
    if (docId && !freshRequest && producedDocRef.current === docId) return;

    /** 다 만든 워크북을 워크북 파일에 저장하고, 새로 고쳐도 다시 만들지 않게 fresh=1을 뗀다. */
    const persistToDocument = async (finished: WorkbookData) => {
      if (!docId) return;
      const res = await postJson<{ ok: true }>("/api/lesson-materials/documents/workbook", {
        id: docId,
        workbook: finished,
      });
      if (!res.ok || cancelled) return;
      producedDocRef.current = docId;
      const params = new URLSearchParams(window.location.search);
      params.delete("fresh");
      params.delete("regen");
      window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
    };

    (async () => {
      setGenerating(true);
      setError(null);
      setErrorCode(null);
      setLineTranslationExcludeIds([]);
      setWorkbook(null);
      setGrammarChoicePending(false);

      if (embeddedDocId) {
        const doc = await postJson<Awaited<ReturnType<typeof getWorkbookDocument>>>(
          "/api/lesson-materials/documents/open",
          { op: "getWorkbook", role, id: embeddedDocId }
        );
        if (cancelled) return;
        if (!doc.ok || !doc.payload || typeof doc.payload !== "object") {
          setError(doc.ok ? "저장된 워크북 내용이 없습니다. 워크북을 먼저 열어 완성해 주세요." : doc.message);
          setGenerating(false);
          return;
        }
        setWorkbook(withWorkbookDefaults(doc.payload as WorkbookData));
        setGenerating(false);
        return;
      }

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

      // 제작 창에서 연 경우: 워크북 파일을 먼저 만들고 주소를 ?doc=로 바꾼다(생성은 이어서 한다).
      if (newDocRequest && ids.length > 0) {
        const sourceQuery = new URLSearchParams(searchParams.toString());
        const docName = sourceQuery.get("docName");
        for (const key of ["doc", "newDoc", "docName", "fresh", "t", "regen"]) sourceQuery.delete(key);
        // 서버 액션이 아니라 fetch로 부른다(api/lesson-materials/documents/open 참고).
        const created = await postJson<Awaited<ReturnType<typeof createLessonMaterialDocument>>>(
          "/api/lesson-materials/documents/open",
          {
            op: "create",
            role,
            kind: "workbook",
            projectIds: ids,
            name: docName || title,
            sourceQuery: sourceQuery.toString(),
          }
        );
        if (cancelled) return;
        if (created.ok) {
          docId = created.id;
          const params = new URLSearchParams(window.location.search);
          params.delete("newDoc");
          params.delete("docName");
          params.set("doc", created.id);
          window.history.replaceState(null, "", `${window.location.pathname}?${params.toString()}`);
        }
      }

      // 자료함의 워크북 파일을 연 경우: 저장된 결과를 그대로 보여 준다.
      if (docId && !freshRequest) {
        setStatus("워크북 파일을 불러오고 있습니다…");
        const doc = await postJson<Awaited<ReturnType<typeof getWorkbookDocument>>>(
          "/api/lesson-materials/documents/open",
          { op: "getWorkbook", role, id: docId }
        );
        if (cancelled) return;
        if (!doc.ok) {
          setError(doc.message);
          setGenerating(false);
          return;
        }
        if (doc.payload && typeof doc.payload === "object") {
          const saved = withWorkbookDefaults(doc.payload as WorkbookData);
          producedDocRef.current = docId;
          setSourceNote("existing");
          saveWorkbookToSession(saved);
          setWorkbook(saved);
          setGenerating(false);
          return;
        }
        // 결과를 저장하기 전에 탭이 닫힌 파일: 만든 조건 그대로 한 번 다시 만든다.
        const again = new URLSearchParams(doc.sourceQuery ?? "");
        if (!again.get("ids")) again.set("ids", doc.projectIds.join(","));
        if (again.get("types")) {
          again.set("doc", docId);
          again.set("fresh", "1");
          window.location.replace(`${window.location.pathname}?${again.toString()}`);
          return;
        }
        setError("저장된 워크북 내용이 없습니다. 지문자료에서 다시 만들어 주세요.");
        setGenerating(false);
        return;
      }

      if (ids.length === 0) {
        setStatus("기존 워크북을 불러오고 있습니다…");
        const cached = loadWorkbookFromSession();
        if (
          cached &&
          ((cached.sections?.length ?? 0) > 0 ||
            (cached.blankSections?.length ?? 0) > 0 ||
            (cached.grammarChoiceSections?.length ?? 0) > 0 ||
            (cached.sentenceOrderQuestions?.length ?? 0) > 0 ||
            (cached.lineTranslationSections?.length ?? 0) > 0 ||
            (cached.fullEnWritingSections?.length ?? 0) > 0 ||
            (cached.wordOrderWritingSections?.length ?? 0) > 0 ||
            (cached.grammarFixSections?.length ?? 0) > 0 ||
            (cached.vocabChoiceSections?.length ?? 0) > 0 ||
            (cached.vocabFixSections?.length ?? 0) > 0)
        ) {
          if (!cancelled) {
            setSourceNote("existing");
            setWorkbook(withWorkbookDefaults(cached));
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
      const wantGrammarChoice = types.includes("grammar_choice");
      const wantGrammarFix = types.includes("grammar_fix");
      // 어법 수정은 어법 선택 결과로 만든다(grammar-fix.ts). 둘 다 고르면 한 번만 만든다.
      const needGrammar = wantGrammarChoice || wantGrammarFix;
      const grammarFixOptions = {
        mode: parseGrammarFixMode(searchParams.get("gfMode")),
        errorCount: clampGrammarFixErrors(
          searchParams.get("gfErrors") ?? DEFAULT_WORKBOOK_GRAMMAR_FIX_OPTIONS.errorCount
        ),
      };
      const wantVocabChoice = types.includes("vocab_choice");
      const wantVocabFix = types.includes("vocab_fix");
      const needVocab = wantVocabChoice || wantVocabFix;
      const vocabFixOptions = {
        mode: parseGrammarFixMode(searchParams.get("vfMode")),
        errorCount: clampGrammarFixErrors(
          searchParams.get("vfErrors") ?? DEFAULT_WORKBOOK_GRAMMAR_FIX_OPTIONS.errorCount
        ),
      };
      const wantSentenceOrder = types.includes("sentence_order");
      const wantLineKo = types.includes("one_line_ko");
      const wantFullEn = types.includes("full_en_writing");
      const wantWordOrder = types.includes("word_order_writing");
      const ltExclude = (searchParams.get("ltExclude") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const multiReady =
        [
          wantBlank,
          wantTf,
          needGrammar,
          needVocab,
          wantSentenceOrder,
          wantLineKo,
          wantFullEn,
          wantWordOrder,
        ].filter(Boolean).length > 1;
      const creatingNew = searchParams.get("fresh") === "1";
      if (multiReady) {
        setStatus(
          creatingNew
            ? "새로 만들고 있습니다…"
            : "워크북을 만들고 있습니다…"
        );
      } else if (needGrammar) {
        setStatus(
          creatingNew
            ? "새로 만들고 있습니다…"
            : "어법 워크북을 만들고 있습니다…"
        );
      } else if (wantBlank) {
        setStatus(
          creatingNew
            ? "새로 만들고 있습니다…"
            : "빈칸 채우기 워크북을 만들고 있습니다…"
        );
      } else if (wantWordOrder) {
        setStatus(
          creatingNew
            ? "새로 만들고 있습니다…"
            : "어순배열 영작 워크북을 만들고 있습니다…"
        );
      } else if (wantFullEn) {
        setStatus(
          creatingNew
            ? "새로 만들고 있습니다…"
            : "통문장 영작 워크북을 만들고 있습니다…"
        );
      } else if (wantLineKo) {
        setStatus(
          creatingNew
            ? "새로 만들고 있습니다…"
            : "한줄해석 워크북을 만들고 있습니다…"
        );
      } else if (wantSentenceOrder) {
        setStatus(
          creatingNew
            ? "새로 만들고 있습니다…"
            : "문장 순서 배열 워크북을 만들고 있습니다…"
        );
      } else {
        setStatus(
          creatingNew
            ? `새로 만들고 있습니다… (지문 ${ids.length}개)`
            : `T/F 문제를 생성하고 있습니다… (지문 ${ids.length}개)`
        );
      }

      try {
        // 제작 창에서 "새 문항으로 다시 만들기"를 켠 경우만 저장된 재료 없이 처음부터 만든다.
        // 기본은 저장된 재료(어법·어휘·빈칸·어순)를 다시 써서 같은 지문을 여러 번 만들어도 비용이 들지 않는다.
        const forceRegenerate =
          searchParams.get("regen") === "1" || searchParams.get("forceRegen") === "1";
        /**
         * 어법 선택은 다른 유형과 동시에 시작하고, 다 끝나면 워크북을 한 번에 보여 준다.
         *
         * 예전에는 다른 유형이 다 끝난 뒤에 어법 선택을 시작하고 워크북을 먼저 보여 줬다.
         * 그러면 시간이 두 단계만큼 더해지고(7유형 4지문: 23초 + 40초), 화면을 켜면 그제야
         * 어법을 만들고 있었다. 선생님이 다른 워크북과 같이 만들어 달라고 했다(2026-09-13).
         * 어법 선택은 지문당 요청을 따로 보낸다. 한 요청에 다 묶으면 지문이 늘수록
         * 서버리스 실행시간 상한을 넘겨 통째로 실패한다.
         */
        const grammarTask = needGrammar
          ? (async () => {
              const results = new Array<WorkbookGrammarChoiceSection | null>(ids.length).fill(null);
              const skips = new Array<WorkbookGrammarChoiceSkip | null>(ids.length).fill(null);
              // 지문끼리는 서로 독립이므로 함께 띄운다. 요청 하나가 지문 하나라 함수 실행시간에는 영향이 없다.
              let next = 0;
              const worker = async () => {
                for (;;) {
                  const i = next;
                  next += 1;
                  if (i >= ids.length || cancelled) return;
                  const one = await postJson<
                    Awaited<ReturnType<typeof generateGrammarChoicePassageAction>>
                  >("/api/lesson-materials/grammar-choice", {
                    role,
                    projectId: ids[i]!,
                    forceRegenerate,
                  });
                  if (cancelled) return;
                  if (!one.ok) {
                    // 한 지문이 실패해도 나머지는 살린다. 끝난 지문은 이미 캐시에 있다.
                    skips[i] = { projectId: ids[i]!, title: ids[i]!, reason: one.message };
                  } else {
                    results[i] = one.section;
                    if (one.skipped) skips[i] = one.skipped;
                  }
                }
              };
              await Promise.all(
                Array.from({ length: Math.min(GRAMMAR_CHOICE_PASSAGE_CONCURRENCY, ids.length) }, worker)
              );
              return {
                sections: results.filter((section): section is WorkbookGrammarChoiceSection => section !== null),
                skipped: skips.filter((skip): skip is WorkbookGrammarChoiceSkip => skip !== null),
              };
            })()
          : Promise.resolve(null);

        // 어휘 선택·어휘 수정 재료도 지문마다 따로, 어법과 동시에 만든다.
        const vocabTask = needVocab
          ? runPassagesInParallel<WorkbookVocabChoiceSection>({
              ids,
              url: "/api/lesson-materials/vocab-choice",
              body: (projectId) => ({ role, projectId, forceRegenerate }),
              isCancelled: () => cancelled,
            })
          : Promise.resolve(null);

        const res = await postJson<Awaited<ReturnType<typeof generateWorkbookAction>>>(
          "/api/lesson-materials/workbook",
          {
            role,
            input: {
              projectIds: ids,
              selectedTypes: types,
              tfOptions: { count, language, difficulty },
              blankOptions,
              title,
              lineTranslationExcludeIds: ltExclude,
              forceRegenerate,
              deferGrammarChoice: wantGrammarChoice,
            },
          }
        );
        if (timers.status) clearTimeout(timers.status);
        timers.status = null;
        if (cancelled) return;
        if (!res.ok) {
          setError(res.message);
          const failure = res as { code?: string; lineTranslationExcludeIds?: string[] };
          if (failure.code === "MISSING_TRANSLATION") {
            setErrorCode("MISSING_TRANSLATION");
          } else if (failure.code === "MISSING_LINE_TRANSLATION") {
            setErrorCode("MISSING_LINE_TRANSLATION");
            setLineTranslationExcludeIds(failure.lineTranslationExcludeIds ?? []);
          } else {
            setErrorCode(null);
          }
          setGenerating(false);
          return;
        }

        const workbook = res.workbook;
        const grammar = await grammarTask;
        if (cancelled) return;
        if (grammar) {
          // 어법 수정만 골라도 어법 선택 결과를 둔다. 화면에서 출제 방식·틀린 곳 수를 바꿀 때
          // 이것으로 바로 다시 만든다(어법 선택 쪽은 유형을 고르지 않으면 인쇄되지 않는다).
          workbook.grammarChoiceSections = grammar.sections;
          if (wantGrammarChoice) workbook.grammarChoiceSkipped = grammar.skipped;
        }
        if (grammar && wantGrammarFix) {
          const fix = buildGrammarFixSections(grammar.sections, grammarFixOptions);
          workbook.grammarFixSections = fix.sections;
          workbook.grammarFixSkipped = [...grammar.skipped, ...fix.skipped];
          workbook.grammarFixOptions = grammarFixOptions;
        }
        const vocab = await vocabTask;
        if (cancelled) return;
        if (vocab) {
          // 어휘 수정만 골라도 어휘 선택 결과를 둔다(화면에서 출제 방식을 바꿀 때 쓴다).
          workbook.vocabChoiceSections = vocab.sections;
          if (wantVocabChoice) workbook.vocabChoiceSkipped = vocab.skipped;
          if (wantVocabFix) {
            const fix = buildVocabFixSections(vocab.sections, vocabFixOptions);
            workbook.vocabFixSections = fix.sections;
            workbook.vocabFixSkipped = [...vocab.skipped, ...fix.skipped];
            workbook.vocabFixOptions = vocabFixOptions;
          }
        }
        setSourceNote(creatingNew ? "new" : "existing");
        saveWorkbookToSession(workbook);
        setWorkbook(workbook);
        setGenerating(false);
        void persistToDocument(workbook);
      } catch (e) {
        if (timers.status) clearTimeout(timers.status);
        if (timers.elapsed) clearInterval(timers.elapsed);
        timers.status = null;
        timers.elapsed = null;
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
      if (timers.status) clearTimeout(timers.status);
      if (timers.elapsed) clearInterval(timers.elapsed);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- requestKey captures query
  }, [role, requestKey, embeddedDocId]);

  const ensureWorkbookPrintStyles = () => {
    const id = "workbook-print-page-size-style";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
      document.body.appendChild(el);
    }
    el.textContent = `
.grammar-passage {
  display: block;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  text-align: justify;
  white-space: normal;
  word-spacing: normal;
  letter-spacing: normal;
  line-height: 1.8;
  overflow-wrap: break-word;
  word-break: normal;
}
.grammar-choice {
  display: inline;
  max-width: 100%;
  white-space: normal;
  overflow-wrap: break-word;
  word-break: normal;
  font-weight: 700;
  color: #1e3a5f;
}
/* 워크북 본문은 양쪽 맞춤. 한 줄짜리(제목·지시문)는 왼쪽 그대로 보인다. */
.workbook-a4-body p,
.workbook-a4-body li,
.line-translation-english,
.word-order-korean,
.full-writing-korean,
.sentence-order-choice-text {
  text-align: justify;
  text-justify: inter-word;
}
.grammar-fix-spot {
  white-space: normal;
}
.grammar-fix-num {
  font-weight: 700;
  color: #1e3a5f;
  margin-right: 1px;
}
.grammar-fix-underline {
  text-decoration: underline;
  text-decoration-thickness: 1px;
  text-underline-offset: 3px;
}
.grammar-fix-answer-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;
  margin-top: 10px;
  font-size: 13px;
  color: #334155;
}
.grammar-fix-answer-no {
  flex: 0 0 auto;
  font-weight: 700;
  white-space: nowrap;
}
.grammar-fix-answer-line {
  flex: 1 1 0;
  height: 22px;
  border-bottom: 1px solid #94a3b8;
}
.grammar-fix-answer-arrow {
  flex: 0 0 auto;
  color: #64748b;
}
.sentence-order-choice {
  display: flex;
  align-items: flex-start;
  gap: 0.55rem;
  break-inside: avoid;
  page-break-inside: avoid;
}
.sentence-order-choice-num {
  flex: 0 0 auto;
  font-weight: 800;
  color: #1e3a5f;
  white-space: nowrap;
}
.sentence-order-choice-text {
  flex: 1 1 auto;
  min-width: 0;
}
.sentence-order-answer-unit {
  white-space: nowrap;
  break-inside: avoid;
  page-break-inside: avoid;
}
.sentence-order-answer-box {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 48px;
  height: 38px;
  border: 1.5px solid #64748b;
  border-radius: 5px;
  background: #ffffff;
  box-sizing: border-box;
}
.line-translation-item {
  margin-bottom: 14px;
  break-inside: avoid;
  page-break-inside: avoid;
}
.line-translation-question {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.line-translation-number {
  font-weight: 700;
  flex-shrink: 0;
  color: #172033;
}
.line-translation-english {
  font-size: 13px;
  line-height: 1.5;
  color: #172033;
  margin: 0;
}
.line-translation-answer {
  margin-top: 2px;
  margin-left: 1.25rem;
}
.translation-answer-line {
  height: 26px;
  border-bottom: 1px solid #94a3b8;
}
.line-translation-answer-key-english {
  font-size: 13px;
  line-height: 1.45;
  color: #1e3a5f;
  margin: 0;
}
.line-translation-answer-key-korean {
  font-size: 10.5px;
  line-height: 1.45;
  margin-top: 0;
  color: #475569;
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-wrap: break-word;
}
.full-writing-item {
  margin-bottom: 24px;
  break-inside: avoid;
  page-break-inside: avoid;
}
.full-writing-prompt {
  display: flex;
  align-items: flex-start;
  gap: 8px;
}
.full-writing-number {
  flex-shrink: 0;
  font-weight: 700;
  font-size: 13px;
  color: #172033;
}
.full-writing-korean {
  font-size: 13px;
  line-height: 1.75;
  color: #334155;
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-wrap: break-word;
}
.full-writing-answer-area {
  margin-top: 8px;
  padding-left: 1.5rem;
}
.full-writing-answer-line {
  height: 34px;
  border-bottom: 1px solid #94a3b8;
}
.full-writing-answer-key-korean {
  font-size: 13px;
  line-height: 1.65;
  color: #64748b;
  margin: 0;
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-wrap: break-word;
}
.full-writing-answer-key-english {
  margin-top: 0;
  font-size: 10.5px;
  line-height: 1.45;
  color: #172033;
  font-weight: 500;
}
.word-order-item {
  margin-bottom: 10px;
  break-inside: avoid;
  page-break-inside: avoid;
}
.word-order-prompt {
  display: flex;
  align-items: flex-start;
  gap: 6px;
}
.word-order-title {
  font-size: 22px;
  line-height: 1.3;
}
.word-order-passage-title {
  font-size: 14px;
  line-height: 1.45;
}
.word-order-source {
  font-size: 12px;
}
.word-order-instruction {
  font-size: 13px;
  line-height: 1.5;
}
.word-order-number {
  flex-shrink: 0;
  font-weight: 700;
  font-size: 13px;
  color: #172033;
}
.word-order-korean {
  font-size: 13px;
  line-height: 1.45;
  color: #334155;
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-wrap: break-word;
  margin-bottom: 2px;
}
.word-order-bank {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 2px 6px;
  padding: 5px 10px;
  margin-top: 3px;
  margin-bottom: 3px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
  font-size: 13px;
  line-height: 1.4;
  color: #172033;
}
.word-order-chunk-unit {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  white-space: nowrap;
}
.word-order-separator {
  color: #64748b;
  font-weight: 500;
}
.word-order-answer-area {
  margin-top: 0;
  padding-left: 1.25rem;
}
.word-order-answer-line {
  height: 24px;
  border-bottom: 1px solid #94a3b8;
}
.word-order-answer-key-korean {
  font-size: 14px;
  line-height: 1.45;
  color: #64748b;
  margin: 0;
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-wrap: break-word;
}
.word-order-answer-key-english {
  margin-top: 0;
  font-size: 10.5px;
  line-height: 1.45;
  color: #172033;
  font-weight: 500;
}
.word-order-sheet .workbook-a4-body > h2,
.workbook-a4-sheet:has(.word-order-sheet) h2 {
  font-size: 22px;
  line-height: 1.3;
}
.workbook-two-col {
  column-count: 2;
  column-gap: 26px;
  column-rule: 1px solid #e2e8f0;
  column-fill: balance;
}
/* 한 쪽보다 긴 내용: 고정 높이 단으로 흘려 여러 쪽에 나눠 보인다(WindowFlow). 간격은 화면·인쇄 같게. */
.workbook-window-flow {
  column-fill: auto;
  column-gap: 7mm;
}
.workbook-window-flow.workbook-one-col {
  column-count: 1;
}
.workbook-window-flow.workbook-two-col {
  column-gap: 7mm;
}
.workbook-window-flow li,
.workbook-window-flow .break-inside-avoid {
  break-inside: avoid;
  page-break-inside: avoid;
}
.workbook-two-col li,
.workbook-two-col .break-inside-avoid {
  break-inside: avoid;
  page-break-inside: avoid;
}
.workbook-flow-part + .workbook-flow-part {
  margin-top: 18px;
  border-top: 1px dashed #cbd5e1;
  padding-top: 15px;
}
.workbook-col-section {
  margin-bottom: 18px;
}
.workbook-col-section + .workbook-col-section {
  border-top: 1px dashed #cbd5e1;
  padding-top: 14px;
}
/* 지문 제목·지시문이 단 끝에 홀로 남지 않게 본문과 붙인다(본문 문단 자체는 단 사이로 나뉠 수 있다). */
.workbook-col-section > p:not(.workbook-passage):not(.grammar-passage) {
  break-after: avoid;
}
@media print {
  @page { size: 210mm 297mm; margin: 0; }
  @page app-print-a4 { size: 210mm 297mm; margin: 0; }
  #workbook-print-root { transform: none !important; zoom: 1 !important; gap: 0 !important; }
  .sentence-order-answer-box {
    width: 13mm;
    height: 10mm;
    border: 0.45mm solid #64748b;
  }
  .translation-answer-line {
    height: 7mm;
    border-bottom: 0.3mm solid #94a3b8;
  }
  .full-writing-answer-line {
    height: 9mm;
    border-bottom: 0.3mm solid #94a3b8;
  }
  .word-order-title {
    font-size: 16pt;
  }
  .word-order-passage-title {
    font-size: 10.5pt;
  }
  .word-order-source {
    font-size: 9.5pt;
  }
  .word-order-instruction {
    font-size: 10pt;
  }
  .word-order-number,
  .word-order-korean {
    font-size: 10.5pt;
  }
  .word-order-bank {
    font-size: 10pt;
  }
  .word-order-answer-line {
    height: 6.5mm;
    border-bottom: 0.3mm solid #94a3b8;
  }
  .workbook-two-col {
    column-gap: 7mm;
  }
  .workbook-a4-sheet:has(.word-order-sheet) h2 {
    font-size: 16pt;
  }
}
`;
  };

  useEffect(() => {
    ensureWorkbookPrintStyles();
    return () => {
      document.getElementById("workbook-print-page-size-style")?.remove();
    };
  }, []);

  // 저장된 옛 워크북도 지금의 유형 순서로 보이게 그릴 때마다 정렬한다.
  const typeOrders = useMemo(() => {
    const types = sortWorkbookTypesByPrintOrder(workbook?.selectedTypes ?? []);
    const map = new Map<WorkbookTypeId, number>();
    types.forEach((t, i) => map.set(t, i + 1));
    return map;
  }, [workbook?.selectedTypes]);

  const pages = useMemo(() => {
    if (!workbook) return [] as WorkbookPage[];
    const out: WorkbookPage[] = [];
    const types = sortWorkbookTypesByPrintOrder(workbook.selectedTypes);
    const soQuestions = workbook.sentenceOrderQuestions ?? [];
    const ltSections = workbook.lineTranslationSections ?? [];
    const feSections = workbook.fullEnWritingSections ?? [];
    const woSections = workbook.wordOrderWritingSections ?? [];
    const gcSections = workbook.grammarChoiceSections ?? [];
    const gfSections = workbook.grammarFixSections ?? [];
    const columnCounts: Record<WorkbookColumnTypeId, number> = {
      grammar_choice: gcSections.length,
      grammar_fix: gfSections.length,
      vocab_choice: (workbook.vocabChoiceSections ?? []).length,
      vocab_fix: (workbook.vocabFixSections ?? []).length,
      blank_fill: workbook.blankSections.length,
      tf: workbook.sections.length,
      sentence_order: soQuestions.length,
    };
    const flowSections: Record<FlowKind, Array<{ items: unknown[] }>> = {
      line_ko: ltSections,
      full_en: feSections,
      word_order: woSections,
    };
    for (const t of types) {
      const order = typeOrders.get(t) ?? 1;
      const columnType = (WORKBOOK_COLUMN_TYPES as readonly string[]).includes(t)
        ? (t as WorkbookColumnTypeId)
        : null;
      if (columnType) {
        const count = columnCounts[columnType];
        const columns = workbook.columnLayout?.[columnType] === 2 ? 2 : 1;
        // 배치를 재기 전(첫 그림)에는 지문마다 한 쪽씩 둔다.
        const packs =
          columnPacks[columnType]?.filter((p) => p.indices.every((i) => i < count)) ??
          Array.from({ length: count }, (_, i) => ({ indices: [i], packed: false }));
        for (const p of packs) {
          // 한 쪽보다 긴 지문: 잰 쪽 수만큼 같은 지문을 이어 싣는다(쪽마다 다음 단들이 보인다).
          const windows = p.packed ? 0 : (windowCounts[`${columnType}:${p.indices[0]}`] ?? 0);
          if (windows > 0) {
            for (let k = 0; k < windows; k++) {
              out.push({
                kind: "columns_q",
                type: columnType,
                indices: p.indices,
                typeOrder: order,
                packed: false,
                columns,
                window: { index: k, count: windows },
              });
            }
            continue;
          }
          out.push({
            kind: "columns_q",
            type: columnType,
            indices: p.indices,
            typeOrder: order,
            packed: p.packed,
            columns,
          });
        }
        continue;
      }
      const flow = FLOW_KIND_BY_TYPE[t];
      if (flow) {
        const sections = flowSections[flow];
        const measured = flowPages[flow];
        const valid =
          measured &&
          measured.every((page) =>
            page.every((part) => part.sectionIndex < sections.length)
          );
        // 재기 전에는 지문마다 한 쪽에 다 싣는다.
        const planned = valid
          ? measured
          : sections.map((sec, si) => [
              {
                sectionIndex: si,
                itemIndices: sec.items.map((_, i) => i),
                continued: false,
              },
            ]);
        for (const parts of planned) {
          out.push({ kind: "flow_q", flow, parts, typeOrder: order });
        }
      }
    }
    if (types.length > 0) {
      // 정답지도 A4 쪽으로 나눈다. 예전에는 한 장에 전부 실어 인쇄에서 여러 쪽으로
      // 잘렸고, 가운데 쪽들은 위아래 여백 없이 종이 끝까지 찍혔다.
      const planned = answerPages && answerPages.length > 0 ? answerPages : [null];
      planned.forEach((keys, i) => {
        // 한 쪽보다 긴 정답 블록 하나: 잰 쪽 수만큼 이어 싣는다.
        const windows =
          keys && keys.length === 1 ? (windowCounts[`answer:${keys[0]}`] ?? 0) : 0;
        if (windows > 1) {
          for (let k = 0; k < windows; k++) {
            out.push({
              kind: "answers",
              keys,
              continued: i > 0 || k > 0,
              window: { index: k, count: windows },
            });
          }
          return;
        }
        out.push({ kind: "answers", keys, continued: i > 0 });
      });
    }
    return out;
  }, [workbook, typeOrders, flowPages, columnPacks, answerPages, windowCounts]);

  useLayoutEffect(() => {
    ensureWorkbookPrintStyles();
  }, []);

  /**
   * 한줄해석·통문장 영작·어순배열 영작을 A4 쪽으로 나눈다(미리보기 = 인쇄).
   * 지문이 끝난 자리에서 다음 지문을 이어서 싣는다. 예전에는 지문마다 새 쪽에서 시작해
   * 짧은 지문 뒤에 여백이 크게 남았다. 지문을 시작할 때는 머리(제목·지시문)와 첫 문항이
   * 함께 들어갈 자리가 있어야 하고, 쪽을 넘기면 "(계속)" 머리를 단다.
   */
  useLayoutEffect(() => {
    ensureWorkbookPrintStyles();
    const root = measureRef.current;
    if (!workbook || !root) {
      setFlowPages({});
      return;
    }
    const pxPerMm = (root.offsetWidth || 1) / 210;
    const pageBodyPx = (297 - A4_PAD_MM - A4_FOOTER_MM) * pxPerMm;
    const sheetHeaderH =
      (root.querySelector('[data-wb-measure="sheet-header"]') as HTMLElement | null)
        ?.offsetHeight ?? 72;
    // 머리글 아래 여백(mb-4)과 쪽 번호와 겹치지 않을 여유를 뺀다.
    const budget = pageBodyPx - sheetHeaderH - 16 - 4 * pxPerMm;
    /** 요소 높이 + 아래 여백(문항 사이 간격은 문항의 margin-bottom이다). */
    const heightOf = (sel: string, fallback: number) => {
      const el = root.querySelector(sel) as HTMLElement | null;
      if (!el) return fallback;
      return el.offsetHeight + (parseFloat(getComputedStyle(el).marginBottom) || 0);
    };

    const packFlow = (prefix: string, sections: Array<{ items: unknown[] }>): FlowPart[][] => {
      const pages: FlowPart[][] = [];
      let page: FlowPart[] = [];
      let used = 0;
      const flush = () => {
        if (page.length) pages.push(page);
        page = [];
        used = 0;
      };
      sections.forEach((sec, si) => {
        // 머리 블록은 마지막 줄의 아래 여백(mb-3·mb-4)이 블록 밖으로 빠져 높이에 안 잡힌다.
        const introH = heightOf(`[data-wb-measure="${prefix}-intro-${si}"]`, 70) + 16;
        const contH = heightOf(`[data-wb-measure="${prefix}-cont-${si}"]`, 40) + 12;
        const heights = sec.items.map((_, i) =>
          heightOf(`[data-wb-measure="${prefix}-item-${si}-${i}"]`, 120)
        );
        // 쪽 끝에서 지문을 시작하면 머리와 문항 두 개(한 개뿐이면 그것)가 함께 들어가야 한다.
        const lead = page.length ? FLOW_PART_GAP_PX : 0;
        const opening = (heights[0] ?? 0) + (heights[1] ?? 0);
        if (page.length && used + lead + introH + opening > budget) flush();
        used += (page.length ? FLOW_PART_GAP_PX : 0) + introH;
        let part: FlowPart = { sectionIndex: si, itemIndices: [], continued: false };
        heights.forEach((h, i) => {
          if (part.itemIndices.length > 0 && used + h > budget) {
            page.push(part);
            flush();
            part = { sectionIndex: si, itemIndices: [], continued: true };
            used = contH;
          }
          used += h;
          part.itemIndices.push(i);
        });
        page.push(part);
      });
      flush();
      return pages;
    };

    const next: Partial<Record<FlowKind, FlowPart[][]>> = {};
    const lt = workbook.lineTranslationSections ?? [];
    const fe = workbook.fullEnWritingSections ?? [];
    const wo = workbook.wordOrderWritingSections ?? [];
    if (lt.length) next.line_ko = packFlow("lt", lt);
    if (fe.length) next.full_en = packFlow("fe", fe);
    if (wo.length) next.word_order = packFlow("wo", wo);
    setFlowPages((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [workbook, designStyle, fontsTick]);

  // 2단 유형: 단 너비로 잰 지문 높이로 쪽마다 실을 지문을 정한다(왼쪽 단 → 오른쪽 단 → 다음 쪽).
  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!workbook || !root) {
      setColumnPacks({});
      return;
    }
    const pxPerMm = (root.offsetWidth || 1) / 210;
    const pageBodyPx = (297 - A4_PAD_MM - A4_FOOTER_MM) * pxPerMm;
    const headerEl = root.querySelector('[data-wb-measure="sheet-header"]') as HTMLElement | null;
    // 머리글 아래 여백(mb-4)과, 쪽 번호와 겹치지 않을 여유를 뺀다.
    const columnPx = pageBodyPx - ((headerEl?.offsetHeight ?? 72) + 16) - 4 * pxPerMm;
    setColumnBodyMm(Math.floor((columnPx / pxPerMm) * 10) / 10);
    // 문항은 단 사이에서 쪼개지지 않고 통째로 넘어가 단 끝에 빈 줄이 생기므로 조금 덜 채운다.
    // 그래도 넘치면 그린 뒤에 넘친 쪽을 찾아 지문 하나를 다음 쪽으로 보낸다(columnLimits).
    const next: Partial<Record<WorkbookColumnTypeId, { indices: number[]; packed: boolean }[]>> = {};
    for (const t of WORKBOOK_COLUMN_TYPES) {
      if (!workbook.selectedTypes.includes(t)) continue;
      // 1단도 쪽에 자리가 남으면 다음 지문을 이어 싣는다.
      const capacity =
        workbook.columnLayout?.[t] === 2 ? columnPx * 2 - 40 : columnPx - 8;
      const heights = Array.from(
        root.querySelectorAll<HTMLElement>(`[data-wb-col="${t}"]`)
      ).map((el) => el.offsetHeight + COLUMN_SECTION_GAP_PX);
      const packs: { indices: number[]; packed: boolean }[] = [];
      let current: number[] = [];
      let used = 0;
      heights.forEach((h, i) => {
        const limit = current.length > 0 ? columnLimits[`${t}:${current[0]}`] : undefined;
        if (
          current.length > 0 &&
          (used + h > capacity || (limit != null && current.length >= limit))
        ) {
          packs.push({ indices: current, packed: true });
          current = [];
          used = 0;
        }
        current.push(i);
        used += h;
      });
      if (current.length) packs.push({ indices: current, packed: true });
      // 한 쪽에 다 들어가지 않는 지문 하나는 쪽을 늘려 두 단 높이를 맞춘다.
      for (const p of packs) {
        if (p.indices.length === 1 && heights[p.indices[0]!]! > capacity) p.packed = false;
      }
      next[t] = packs;
    }
    setColumnPacks((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [workbook, columnLimits, designStyle, fontsTick]);

  // 정답지: 블록(유형·지문별 정답) 높이를 재서 A4 쪽마다 나눈다. 본문 높이는 한줄해석과 같다.
  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!workbook || !root) {
      setAnswerPages(null);
      return;
    }
    const pxPerMm = (root.offsetWidth || 1) / 210;
    const pageBodyPx = (297 - A4_PAD_MM - A4_FOOTER_MM) * pxPerMm;
    const sheetHeaderH =
      (root.querySelector('[data-wb-measure="sheet-header"]') as HTMLElement | null)
        ?.offsetHeight ?? 72;
    const budget = pageBodyPx - sheetHeaderH - 16 - 4 * pxPerMm;
    /** 쪽을 넘겨 이어지는 문장 위의 "(계속)" 줄(flow-root라 아래 여백까지 잡힌다). */
    const contEl = root.querySelector<HTMLElement>("[data-wb-answer-conthead]");
    const contH = contEl ? contEl.offsetHeight : 26;
    const next: string[][] = [];
    let page: string[] = [];
    let used = 0;
    let prev: { order: number } | null = null;
    const oversize: string[] = [];
    root.querySelectorAll<HTMLElement>("[data-wb-answer]").forEach((el) => {
      const cur = {
        order: Number(el.dataset.wbAnswerOrder),
        gap: el.dataset.wbAnswerGap ? Number(el.dataset.wbAnswerGap) : undefined,
      };
      const gap = prev ? answerGapBefore(prev, cur) : 0;
      const h = el.offsetHeight;
      // 한 쪽보다 긴 블록은 혼자 쪽을 쓰고, 잰 쪽 수만큼 이어 싣는다(windowCounts).
      if (h > budget) oversize.push(el.dataset.wbAnswer!);
      if (page.length && used + gap + h > budget) {
        next.push(page);
        page = [];
        used = 0;
      }
      if (page.length) used += gap;
      else if (el.dataset.wbAnswerCont) used += contH;
      used += h;
      page.push(el.dataset.wbAnswer!);
      prev = cur;
    });
    if (page.length) next.push(page);
    setAnswerPages((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    setAnswerOversize((prev) => (prev.join("|") === oversize.join("|") ? prev : oversize));
  }, [workbook, typeOrders, fontsReady, designStyle, fontsTick]);

  /**
   * 한 쪽보다 긴 지문·정답 블록의 쪽 수: 측정 영역에 쪽 본문 높이로 흘려 본 단 수로 정한다
   * (예전에는 쪽이 길어지기만 해서 인쇄에서 다음 장으로 넘친 부분의 쪽 번호·여백이 어긋났다).
   */
  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root) return;
    const next: Record<string, number> = {};
    root.querySelectorAll<HTMLElement>("[data-wb-probe]").forEach((el) => {
      const perPage = el.classList.contains("workbook-two-col") ? 2 : 1;
      const gap = parseFloat(getComputedStyle(el).columnGap) || 0;
      const width = el.clientWidth || 1;
      const stride = (width - (perPage - 1) * gap) / perPage + gap;
      const cols = Math.max(1, Math.ceil((el.scrollWidth + gap - 2) / stride));
      next[el.dataset.wbProbe!] = Math.max(1, Math.ceil(cols / perPage));
    });
    setWindowCounts((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
  }, [workbook, columnPacks, answerOversize, columnBodyMm, fontsReady, designStyle, fontsTick]);

  // 그린 2단 쪽이 오른쪽 단 밖으로 넘치면(재 둔 높이와 실제가 다를 때) 그 쪽에 싣는 지문을 하나 줄인다.
  useLayoutEffect(() => {
    const over: Record<string, number> = {};
    document.querySelectorAll<HTMLElement>("[data-col-body]").forEach((el) => {
      const count = Number(el.dataset.colCount ?? "0");
      // 2단은 오른쪽 단 밖으로(가로), 1단은 본문 높이 밖으로(세로) 넘친다.
      if (
        count > 1 &&
        (el.scrollWidth > el.clientWidth + 2 || el.scrollHeight > el.clientHeight + 2)
      ) {
        over[el.dataset.colBody!] = count - 1;
      }
    });
    if (Object.keys(over).length > 0) {
      setColumnLimits((prev) => ({ ...prev, ...over }));
    }
  }, [columnPacks, columnBodyMm, zoom, designStyle, fontsTick]);

  /**
   * 미리보기 배율. transform: scale은 줄인 만큼의 높이를 그대로 남겨, 쪽이 많으면 마지막 쪽
   * 아래로 수천 px가 빈 채로 스크롤됐다. zoom은 줄인 크기대로 자리를 차지한다.
   */
  const previewStyle = useMemo((): CSSProperties => ({ zoom: zoom / 100 }), [zoom]);

  if (embeddedDocId && (generating || error || !workbook)) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 bg-white p-6 text-sm text-slate-500 print:hidden">
        {error ?? "워크북을 불러오고 있습니다…"}
      </div>
    );
  }

  if (generating) {
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-3 bg-slate-100 px-4">
        <div className="w-full max-w-md rounded-2xl bg-white px-8 py-6 text-center shadow">
          <p className="text-base font-bold text-slate-900">제작 중</p>
          <p className="mt-1 text-sm leading-relaxed text-slate-600">{status}</p>
          {/* 남은 양을 알 수 없으므로 채워지는 막대가 아니라 오가는 막대를 쓴다. */}
          <div
            className="mt-5 h-2 overflow-hidden rounded-full bg-slate-100"
            role="progressbar"
            aria-label="워크북 제작 중"
          >
            <div className="h-full w-2/5 animate-indeterminate rounded-full bg-violet-600" />
          </div>
        </div>
        <button
          type="button"
          onClick={() => closeTabOrGo(base)}
          className="text-xs font-semibold text-violet-700"
        >
          ← 자료함으로 돌아가기
        </button>
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
    const continueWithoutMissingLineKo = () => {
      const params = new URLSearchParams(searchParams.toString());
      const prev = (params.get("ltExclude") ?? "")
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const merged = [...new Set([...prev, ...lineTranslationExcludeIds])];
      if (merged.length) params.set("ltExclude", merged.join(","));
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
        <Alert variant="error">
          <span className="whitespace-pre-wrap">{error}</span>
        </Alert>
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
        ) : errorCode === "MISSING_LINE_TRANSLATION" ? (
          <div className="flex flex-wrap items-center justify-center gap-2">
            <Link
              href={lessonPackHref}
              className="inline-flex rounded-xl bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
            >
              수업용 자료로 이동
            </Link>
            <button
              type="button"
              className="inline-flex rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              onClick={continueWithoutMissingLineKo}
              disabled={lineTranslationExcludeIds.length === 0}
            >
              해석 누락 지문 제외하고 계속
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
        <p className="text-sm text-slate-600">
          {searchParams.get("ids")
            ? "새로 만들고 있습니다…"
            : "기존 워크북을 불러오고 있습니다…"}
        </p>
      </div>
    );
  }

  const title = workbook.metadata.title;
  const columnTypes = sortWorkbookTypesByPrintOrder(workbook.selectedTypes).filter(
    (t): t is WorkbookColumnTypeId =>
      (WORKBOOK_COLUMN_TYPES as readonly string[]).includes(t)
  );
  const total = pages.length;
  const blankOpts = workbook.blankOptions ?? DEFAULT_WORKBOOK_BLANK_OPTIONS;
  const soQuestions = workbook.sentenceOrderQuestions ?? [];
  const soSkipped = workbook.sentenceOrderSkipped ?? [];
  const ltSections = workbook.lineTranslationSections ?? [];
  const ltSkipped = workbook.lineTranslationSkipped ?? [];
  const feSections = workbook.fullEnWritingSections ?? [];
  const feSkipped = workbook.fullEnWritingSkipped ?? [];
  const woSections = workbook.wordOrderWritingSections ?? [];
  const woSkipped = workbook.wordOrderWritingSkipped ?? [];
  const gcSections = workbook.grammarChoiceSections ?? [];
  const gfSections = workbook.grammarFixSections ?? [];
  const gfSkipped = workbook.grammarFixSkipped ?? [];
  const vcSections = workbook.vocabChoiceSections ?? [];
  const vcSkipped = workbook.vocabChoiceSkipped ?? [];
  const vfSections = workbook.vocabFixSections ?? [];
  const vfSkipped = workbook.vocabFixSkipped ?? [];

  /**
   * 정답지 블록: 유형 번호 순, 같은 유형 안에서는 지문 순. 쪽 나눔(측정 영역)과 정답
   * 쪽이 같은 블록을 그린다. key는 answerPages가 가리키는 이름이다.
   */
  const answerBlocks: AnswerBlock[] = [];
  /**
   * 한줄해석·영작 정답은 지문 하나가 한 쪽보다 길 수 있어 문장마다 블록으로 나눈다.
   * 첫 블록에 유형·지문 제목을 함께 둬 제목만 쪽 끝에 남지 않게 하고, 쪽을 넘겨 이어지는
   * 문장 위에는 "(계속)" 줄을 단다.
   */
  const addSentenceBlocks = <S extends { title: string; items: unknown[] }>(
    prefix: string,
    order: number,
    label: string,
    sections: S[],
    itemGapPx: number,
    render: (section: S, itemIndex: number, showHeader: boolean) => ReactNode
  ) => {
    sections.forEach((section, si) => {
      section.items.forEach((_, ii) => {
        answerBlocks.push({
          key: `${prefix}-${si}-${ii}`,
          order,
          gap: ii === 0 ? undefined : itemGapPx,
          cont:
            ii === 0 ? undefined : (
              <AnswerContinued typeOrder={order} label={label} title={section.title} />
            ),
          node: render(section, ii, ii === 0),
        });
      });
    });
  };
  const addSkipped = (
    key: string,
    order: number,
    list: ReadonlyArray<{ projectId: string; title: string; reason: string }>
  ) => {
    if (list.length === 0) return;
    answerBlocks.push({
      key,
      order,
      node: (
        <ul className="space-y-1 text-[11px] text-amber-700">
          {list.map((s) => (
            <li key={`${key}-${s.projectId}`}>
              「{s.title}」 {s.reason}
            </li>
          ))}
        </ul>
      ),
    });
  };
  {
    const ob = typeOrders.get("blank_fill");
    if (ob != null) {
      workbook.blankSections.forEach((section, i) =>
        answerBlocks.push({
          key: `ba-${i}`,
          order: ob,
          node: (
            <>
              <h3 className="wb-ak-title mb-1 text-[12.5px] font-black" style={{ color: ACCENT }}>
                <TitleNo no={ob} /> 빈칸 채우기
                {workbook.blankSections.length > 1 ? ` · ${section.title}` : ""}
              </h3>
              <BlankAnswerBody section={section} />
            </>
          ),
        })
      );
    }
    const ogc = typeOrders.get("grammar_choice");
    if (ogc != null) {
      gcSections.forEach((section, i) =>
        answerBlocks.push({
          key: `gca-${i}`,
          order: ogc,
          node: <GrammarChoiceAnswerBody section={section} typeOrder={ogc} multi={gcSections.length > 1} />,
        })
      );
    }
    const ogf = typeOrders.get("grammar_fix");
    if (ogf != null) {
      gfSections.forEach((section, i) =>
        answerBlocks.push({
          key: `gfa-${i}`,
          order: ogf,
          node: <GrammarFixAnswerBody section={section} typeOrder={ogf} multi={gfSections.length > 1} />,
        })
      );
      addSkipped("gfs", ogf, gfSkipped);
    }
    const ovc = typeOrders.get("vocab_choice");
    if (ovc != null) {
      vcSections.forEach((section, i) =>
        answerBlocks.push({
          key: `vca-${i}`,
          order: ovc,
          node: <VocabChoiceAnswerBody section={section} typeOrder={ovc} multi={vcSections.length > 1} />,
        })
      );
      addSkipped("vcs", ovc, vcSkipped);
    }
    const ovf = typeOrders.get("vocab_fix");
    if (ovf != null) {
      vfSections.forEach((section, i) =>
        answerBlocks.push({
          key: `vfa-${i}`,
          order: ovf,
          node: (
            <GrammarFixAnswerBody
              section={section}
              typeOrder={ovf}
              multi={vfSections.length > 1}
              label="어휘 수정"
            />
          ),
        })
      );
      addSkipped("vfs", ovf, vfSkipped);
    }
    const otf = typeOrders.get("tf");
    if (otf != null) {
      workbook.sections.forEach((section, i) =>
        answerBlocks.push({
          key: `ta-${i}`,
          order: otf,
          node: <TfAnswerBody section={section} typeOrder={otf} multi={workbook.sections.length > 1} />,
        })
      );
    }
    const oso = typeOrders.get("sentence_order");
    if (oso != null) {
      answerBlocks.push({
        key: "so",
        order: oso,
        node: (
          <>
            <h3 className="wb-ak-title mb-1 text-[12.5px] font-black" style={{ color: ACCENT }}>
              <TitleNo no={oso} /> 문장 순서 배열
            </h3>
            <div className="grid grid-cols-4 gap-x-4 gap-y-0.5">
              {soQuestions.map((q) => (
                <SentenceOrderAnswerBody
                  key={`soa-${q.questionId}`}
                  question={q}
                  typeOrder={oso}
                  all={soQuestions}
                />
              ))}
            </div>
          </>
        ),
      });
      addSkipped("sos", oso, soSkipped);
    }
    // 문장 사이 간격은 각 정답 목록의 space-y(0.5 = 2px)와 같다.
    const olt = typeOrders.get("one_line_ko");
    if (olt != null) {
      addSentenceBlocks("lta", olt, "한줄해석", ltSections, 2, (section, ii, showHeader) => (
        <LineTranslationAnswerBody
          section={section}
          typeOrder={olt}
          multi={ltSections.length > 1}
          itemIndices={[ii]}
          showHeader={showHeader}
        />
      ));
      addSkipped("lts", olt, ltSkipped);
    }
    const ofe = typeOrders.get("full_en_writing");
    if (ofe != null) {
      addSentenceBlocks("fea", ofe, "통문장 영작", feSections, 2, (section, ii, showHeader) => (
        <FullEnWritingAnswerBody
          section={section}
          typeOrder={ofe}
          multi={feSections.length > 1}
          itemIndices={[ii]}
          showHeader={showHeader}
        />
      ));
      addSkipped("fes", ofe, feSkipped);
    }
    const owo = typeOrders.get("word_order_writing");
    if (owo != null) {
      addSentenceBlocks("woa", owo, "어순배열 영작", woSections, 2, (section, ii, showHeader) => (
        <WordOrderAnswerBody
          section={section}
          typeOrder={owo}
          multi={woSections.length > 1}
          itemIndices={[ii]}
          showHeader={showHeader}
        />
      ));
      addSkipped("wos", owo, woSkipped);
    }
  }
  answerBlocks.sort((a, b) => a.order - b.order);
  const answerBlockByKey = new Map(answerBlocks.map((b) => [b.key, b] as const));
  /**
   * 정답 블록 목록을 쪽 본문으로 그린다(블록 사이 간격은 쪽 나눔 계산과 같다). 쪽의 첫
   * 블록이 이어지는 문장이면 "(계속)" 줄을 먼저 단다. measure는 쪽 나눔 측정용.
   */
  const renderAnswerBlocks = (blocks: ReadonlyArray<AnswerBlock>, measure = false) =>
    blocks.map((b, i) => (
      <div
        key={`${measure ? "m-" : ""}${b.key}`}
        className="flow-root"
        style={{ marginTop: i === 0 ? 0 : answerGapBefore(blocks[i - 1]!, b) }}
        data-wb-answer={measure ? b.key : undefined}
        data-wb-answer-order={measure ? b.order : undefined}
        data-wb-answer-gap={measure && b.gap != null ? b.gap : undefined}
        data-wb-answer-cont={measure && b.cont ? "1" : undefined}
      >
        {!measure && i === 0 ? b.cont : null}
        {b.node}
      </div>
    ));

  /** 2단 쪽에 싣는 지문(문장 순서 배열은 문항) 하나. 쪽과 배치 측정이 같은 모양을 쓴다. */
  const renderColumnSection = (type: WorkbookColumnTypeId, i: number): ReactNode => {
    if (type === "grammar_choice") {
      const section = gcSections[i];
      return section ? (
        <GrammarChoiceQuestionBody section={section} multi={gcSections.length > 1} />
      ) : null;
    }
    if (type === "grammar_fix") {
      const section = gfSections[i];
      return section ? (
        <GrammarFixQuestionBody section={section} multi={gfSections.length > 1} />
      ) : null;
    }
    if (type === "vocab_choice") {
      const section = vcSections[i];
      return section ? (
        <GrammarChoiceQuestionBody
          section={section}
          multi={vcSections.length > 1}
          instruction={VOCAB_CHOICE_INSTRUCTION}
        />
      ) : null;
    }
    if (type === "vocab_fix") {
      const section = vfSections[i];
      return section ? (
        <GrammarFixQuestionBody section={section} multi={vfSections.length > 1} kind="vocab" />
      ) : null;
    }
    if (type === "blank_fill") {
      const section = workbook.blankSections[i];
      if (!section) return null;
      return (
        <>
          {workbook.blankSections.length > 1 ? (
            <p className="wb-passage-meta mb-2 text-[12px] font-semibold text-slate-500">
              {section.title}
              {section.source?.trim() ? ` · ${section.source.trim()}` : ""}
            </p>
          ) : null}
          <BlankQuestionBody
            section={section}
            showTranslation={blankOpts.showTranslation}
            layout={blankOpts.translationLayout}
          />
        </>
      );
    }
    if (type === "tf") {
      const section = workbook.sections[i];
      return section ? (
        <TfQuestionBody section={section} multi={workbook.sections.length > 1} />
      ) : null;
    }
    const question = soQuestions[i];
    if (!question) return null;
    const sets = soQuestions.filter((x) => x.passageId === question.passageId).length;
    return (
      <>
        {sets > 1 ? (
          <p className="wb-set-heading mb-1 text-[13px] font-black" style={{ color: ACCENT }}>
            {typeOrders.get("sentence_order") ?? 1}-{question.setIndex}
          </p>
        ) : null}
        <SentenceOrderQuestionBody question={question} showPassageMeta />
      </>
    );
  };
  const columnCountFor = (type: WorkbookColumnTypeId): number =>
    type === "grammar_choice"
      ? gcSections.length
      : type === "grammar_fix"
        ? gfSections.length
      : type === "vocab_choice"
        ? vcSections.length
      : type === "vocab_fix"
        ? vfSections.length
      : type === "blank_fill"
        ? workbook.blankSections.length
        : type === "tf"
          ? workbook.sections.length
          : soQuestions.length;
  /** 배치를 잴 유형(고른 유형 전부). 1단은 쪽 너비, 2단은 단 너비로 잰다. */
  const columnTypesOn = WORKBOOK_COLUMN_TYPES.filter((t) => workbook.selectedTypes.includes(t));

  /** 인쇄할 쪽들과 쪽 나눔 측정 영역. 최종통합자료에 끼워 넣을 때(embedded)도 같은 모양을 쓴다. */
  const printPages = (
    <>
            {pages.map((page, pageI) => {
              const pageNo = pageI + 1;
              const isLast = pageI === total - 1;

              if (page.kind === "columns_q") {
                return (
                  <PageShell
                    key={`col-${page.type}-${page.indices.join("-")}${page.window ? `-w${page.window.index}` : ""}`}
                    pageNo={pageNo}
                    total={total}
                    workbookTitle={title}
                    showTypeTitle
                    typeTitle={`${page.typeOrder}. ${COLUMN_TYPE_TITLE[page.type]}`}
                    isLast={isLast}
                    columns={page.columns}
                    columnHeightMm={
                      page.packed || page.window ? (columnBodyMm ?? undefined) : undefined
                    }
                    columnKey={`${page.type}:${page.indices[0]}`}
                    columnCount={page.indices.length}
                    windowIndex={page.window?.index}
                    windowCount={page.window?.count}
                  >
                    {page.indices.map((i) => (
                      <div key={`col-${page.type}-${i}`} className="workbook-col-section">
                        {renderColumnSection(page.type, i)}
                      </div>
                    ))}
                  </PageShell>
                );
              }

              if (page.kind === "flow_q") {
                return (
                  <PageShell
                    key={`flow-${page.flow}-${page.parts.map((p) => `${p.sectionIndex}.${p.itemIndices[0] ?? 0}`).join("-")}`}
                    pageNo={pageNo}
                    total={total}
                    workbookTitle={title}
                    showTypeTitle
                    typeTitle={`${page.typeOrder}. ${FLOW_TITLE[page.flow]}`}
                    isLast={isLast}
                  >
                    {page.parts.map((part) => (
                      <div
                        key={`part-${part.sectionIndex}-${part.continued ? "c" : "0"}-${part.itemIndices[0] ?? 0}`}
                        className="workbook-flow-part"
                      >
                        {page.flow === "line_ko" ? (
                          <LineTranslationQuestionBody
                            section={ltSections[part.sectionIndex]!}
                            itemIndices={part.itemIndices}
                            continued={part.continued}
                          />
                        ) : page.flow === "full_en" ? (
                          <FullEnWritingQuestionBody
                            section={feSections[part.sectionIndex]!}
                            itemIndices={part.itemIndices}
                            continued={part.continued}
                          />
                        ) : (
                          <WordOrderQuestionBody
                            section={woSections[part.sectionIndex]!}
                            itemIndices={part.itemIndices}
                            continued={part.continued}
                          />
                        )}
                      </div>
                    ))}
                  </PageShell>
                );
              }

              // answers
              const shown = page.keys
                ? page.keys
                    .map((k) => answerBlockByKey.get(k))
                    .filter((blk): blk is NonNullable<typeof blk> => !!blk)
                : answerBlocks;
              return (
                <PageShell
                  key={`answers-${pageI}`}
                  pageNo={pageNo}
                  total={total}
                  workbookTitle={title}
                  showTypeTitle
                  typeTitle={page.continued ? "정답 (계속)" : "정답"}
                  isLast={isLast}
                  columnHeightMm={page.window ? (columnBodyMm ?? undefined) : undefined}
                  windowIndex={page.window?.index}
                  windowCount={page.window?.count}
                >
                  {renderAnswerBlocks(shown)}
                </PageShell>
              );
            })}
    </>
  );
  const measureBlock = (
    <>
        {/*
          Off-screen measure tree: packs long bilingual sections into real A4 pages.
          높이 0인 틀 안에 둔다. 틀 없이 두면 측정용 내용 높이만큼 미리보기 아래가 스크롤됐다.
        */}
        <link rel="stylesheet" href={DESIGN_FONTS_HREF} />
        <div className="pointer-events-none absolute left-0 top-0 h-0 w-0 overflow-hidden print:hidden" aria-hidden>
        <div
          ref={measureRef}
          className={`font-print -z-10 w-[210mm] opacity-0 ${designClass(designStyle)}`}
          style={{
            padding: A4_PAD,
            paddingBottom: `${A4_FOOTER_MM}mm`,
            boxSizing: "border-box",
          }}
        >
          {columnTypesOn.map((t) => (
            <div
              key={`m-col-${t}`}
              style={{
                width: workbook.columnLayout?.[t] === 2 ? "calc((100% - 26px) / 2)" : "100%",
              }}
            >
              {columnCountFor(t) > 0
                ? Array.from({ length: columnCountFor(t) }, (_, i) => (
                    <div key={`m-col-${t}-${i}`} className="workbook-col-section" data-wb-col={t}>
                      {renderColumnSection(t, i)}
                    </div>
                  ))
                : null}
            </div>
          ))}
          <div>{renderAnswerBlocks(answerBlocks, true)}</div>
          {columnBodyMm != null ? (
            <div className="workbook-a4-body" style={{ height: 0, overflow: "hidden" }}>
              {columnTypesOn.flatMap((t) =>
                (columnPacks[t] ?? [])
                  .filter((p) => !p.packed && p.indices.length === 1)
                  .map((p) => (
                    <WindowFlow
                      key={`probe-${t}-${p.indices[0]}`}
                      columns={workbook.columnLayout?.[t] === 2 ? 2 : 1}
                      heightMm={columnBodyMm}
                      index={0}
                      probe={`${t}:${p.indices[0]}`}
                    >
                      <div className="workbook-col-section">
                        {renderColumnSection(t, p.indices[0]!)}
                      </div>
                    </WindowFlow>
                  ))
              )}
              {answerOversize.map((key) => {
                const block = answerBlockByKey.get(key);
                return block ? (
                  <WindowFlow
                    key={`probe-answer-${key}`}
                    columns={1}
                    heightMm={columnBodyMm}
                    index={0}
                    probe={`answer:${key}`}
                  >
                    {renderAnswerBlocks([block])}
                  </WindowFlow>
                ) : null;
              })}
            </div>
          ) : null}
          <div className="flow-root" data-wb-answer-conthead>
            <AnswerContinued typeOrder={1} label="한줄해석" title={title} />
          </div>
          <SheetHeader workbookTitle={title} typeTitle="1. 한줄해석" measure />
          {ltSections.map((section, si) => (
            <div key={`m-lt-${section.projectId}`}>
              <div data-wb-measure={`lt-intro-${si}`}>
                <p className="wb-passage-meta mb-1 text-[12px] font-semibold text-slate-500">
                  {section.title}
                </p>
                {section.source?.trim() ? (
                  <p className="wb-passage-meta mb-3 text-[12px] font-semibold text-slate-500">
                    · {section.source.trim()}
                  </p>
                ) : (
                  <div className="mb-3" />
                )}
                <p className="wb-instruction mb-4 text-[13px] font-semibold text-slate-800">
                  다음 영어 문장을 우리말로 해석하세요.
                </p>
              </div>
              <div data-wb-measure={`lt-cont-${si}`}>
                <p className="wb-passage-meta mb-1 text-[12px] font-semibold text-slate-500">
                  {section.title} (계속)
                </p>
                {section.source?.trim() ? (
                  <p className="wb-passage-meta mb-3 text-[12px] font-semibold text-slate-500">
                    · {section.source.trim()}
                  </p>
                ) : (
                  <div className="mb-3" />
                )}
              </div>
              {section.items.map((it, ii) => (
                <div
                  key={`m-lt-item-${it.sentenceId}`}
                  className="line-translation-item"
                  data-wb-measure={`lt-item-${si}-${ii}`}
                >
                  <div className="line-translation-question">
                    <span className="line-translation-number">
                      {it.orderIndex}.
                    </span>
                    <p className="line-translation-english">
                      {it.englishDisplay}
                    </p>
                  </div>
                  <div className="line-translation-answer">
                    {Array.from({ length: it.answerLineCount }, (_, i) => (
                      <div
                        key={`m-al-${it.sentenceId}-${i}`}
                        className="translation-answer-line"
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ))}
          {feSections.map((section, si) => (
            <div key={`m-fe-${section.projectId}`}>
              <div data-wb-measure={`fe-intro-${si}`}>
                <p className="wb-passage-meta mb-1 text-[12px] font-semibold text-slate-500">
                  {section.title}
                </p>
                {section.source?.trim() ? (
                  <p className="wb-passage-meta mb-3 text-[12px] font-semibold text-slate-500">
                    · {section.source.trim()}
                  </p>
                ) : (
                  <div className="mb-3" />
                )}
                <p className="wb-instruction mb-4 text-[13px] font-semibold text-slate-800">
                  다음 우리말 뜻에 맞도록 영어 문장 전체를 쓰세요.
                </p>
              </div>
              <div data-wb-measure={`fe-cont-${si}`}>
                <p className="wb-passage-meta mb-1 text-[12px] font-semibold text-slate-500">
                  {section.title} (계속)
                </p>
                {section.source?.trim() ? (
                  <p className="wb-passage-meta mb-3 text-[12px] font-semibold text-slate-500">
                    · {section.source.trim()}
                  </p>
                ) : (
                  <div className="mb-3" />
                )}
              </div>
              {section.items.map((it, ii) => (
                <section
                  key={`m-fe-item-${it.sentenceId}`}
                  className="full-writing-item"
                  data-wb-measure={`fe-item-${si}-${ii}`}
                >
                  <div className="full-writing-prompt">
                    <span className="full-writing-number">{it.orderIndex}.</span>
                    <div className="full-writing-korean">{it.korean}</div>
                  </div>
                  <div className="full-writing-answer-area">
                    {Array.from({ length: it.answerLineCount }, (_, i) => (
                      <div
                        key={`m-fwal-${it.sentenceId}-${i}`}
                        className="full-writing-answer-line"
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ))}
          {woSections.map((section, si) => (
            <div key={`m-wo-${section.projectId}`}>
              <div data-wb-measure={`wo-intro-${si}`}>
                <p className="wb-passage-meta mb-1 text-[12px] font-semibold text-slate-500">
                  {section.title}
                </p>
                {section.source?.trim() ? (
                  <p className="wb-passage-meta mb-3 text-[12px] font-semibold text-slate-500">
                    · {section.source.trim()}
                  </p>
                ) : (
                  <div className="mb-3" />
                )}
                <p className="wb-instruction mb-4 text-[13px] font-semibold text-slate-800">
                  우리말 뜻과 일치하도록 주어진 영어 어절을 올바르게 배열하여
                  완전한 문장을 쓰세요.
                </p>
              </div>
              <div data-wb-measure={`wo-cont-${si}`}>
                <p className="wb-passage-meta mb-1 text-[12px] font-semibold text-slate-500">
                  {section.title} (계속)
                </p>
                {section.source?.trim() ? (
                  <p className="wb-passage-meta mb-3 text-[12px] font-semibold text-slate-500">
                    · {section.source.trim()}
                  </p>
                ) : (
                  <div className="mb-3" />
                )}
              </div>
              {section.items.map((it, ii) => (
                <section
                  key={`m-wo-item-${it.questionId}`}
                  className="word-order-item"
                  data-wb-measure={`wo-item-${si}-${ii}`}
                >
                  <div className="word-order-prompt">
                    <span className="word-order-number">{it.orderIndex}.</span>
                    <div className="word-order-korean">{it.korean}</div>
                  </div>
                  <div className="word-order-bank">
                    {(it.shuffledChunks ?? []).map((chunk, index) => (
                      <span
                        key={chunk.chunkId}
                        className="word-order-chunk-unit"
                      >
                        <span>{chunk.text}</span>
                        {index < (it.shuffledChunks?.length ?? 0) - 1 ? (
                          <span className="word-order-separator">/</span>
                        ) : null}
                      </span>
                    ))}
                  </div>
                  <div className="word-order-answer-area">
                    {Array.from({ length: it.answerLineCount }, (_, i) => (
                      <div
                        key={`m-woal-${it.questionId}-${i}`}
                        className="word-order-answer-line"
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          ))}
        </div>
        </div>
    </>
  );

  if (embeddedDocId) {
    return (
      <div className="relative">
        <div
          id="workbook-print-root"
          className={`flex flex-col gap-6 print:gap-0 ${designClass(designStyle)}`}
        >
          {printPages}
        </div>
        {measureBlock}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-200 print:static print:z-auto print:block print:bg-white">
      <aside className="flex w-[260px] shrink-0 flex-col border-r border-slate-200 bg-white print:hidden">
        <div className="space-y-2 border-b border-slate-100 p-4">
          <button
            type="button"
            onClick={() => void leaveWorkbook()}
            className="text-left text-xs font-semibold text-violet-700"
          >
            ← 자료함
          </button>
          <h1 className="text-base font-bold text-slate-900">워크북</h1>
          <p className="text-xs font-semibold text-slate-700">
            {sourceNote === "new"
              ? "새로 만들었습니다"
              : sourceNote === "existing"
                ? "기존 워크북을 불러왔습니다"
                : "새로 만들었습니다"}
          </p>
          <p className="text-[11px] text-slate-400">
            {sortWorkbookTypesByPrintOrder(workbook.selectedTypes)
              .map((t) => workbookTypeDisplayTitle(t))
              .join(" · ")}
          </p>
        </div>
        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
          <label className="block space-y-1">
            <span className="text-[11px] font-bold text-slate-500">워크북 제목</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100"
              value={title}
              maxLength={80}
              onChange={(e) =>
                editWorkbook((w) => ({
                  ...w,
                  metadata: { ...w.metadata, title: e.target.value },
                }))
              }
            />
          </label>

          <div className="space-y-1.5">
            <p className="text-[11px] font-bold text-slate-500">워크북 모양</p>
            <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
              {DESIGN_STYLES.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  title={d.hint}
                  onClick={() => chooseDesignStyle(d.id)}
                  className={`rounded-md px-1 py-1.5 text-xs font-bold transition ${
                    designStyle === d.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
            <p className="text-[11px] text-slate-400">
              {DESIGN_STYLES.find((d) => d.id === designStyle)?.hint}
            </p>
          </div>

          <label className="flex items-center justify-between gap-2 rounded-lg border border-slate-200 px-3 py-2">
            <span className="text-[11px] font-bold text-slate-500">쪽번호 넣기</span>
            <input
              type="checkbox"
              checked={pageNumbers}
              onChange={(e) => choosePageNumbers(e.target.checked)}
              className="h-4 w-4 accent-violet-500"
            />
          </label>

          {columnTypes.length > 0 ? (
            <div className="space-y-1.5">
              <p className="text-[11px] font-bold text-slate-500">단 나누기</p>
              {columnTypes.map((t) => (
                <div key={t} className="flex items-center justify-between gap-2">
                  <span className="text-xs text-slate-700">{workbookTypeDisplayTitle(t)}</span>
                  <div className="inline-flex rounded-lg border border-slate-200 p-0.5">
                    {([1, 2] as const).map((n) => (
                      <button
                        key={n}
                        type="button"
                        onClick={() =>
                          editWorkbook((w) => ({
                            ...w,
                            columnLayout: { ...w.columnLayout, [t]: n },
                          }))
                        }
                        className={`rounded-md px-2.5 py-0.5 text-xs font-semibold ${
                          columnsFor(t) === n
                            ? "bg-violet-600 text-white"
                            : "text-slate-500 hover:bg-slate-50"
                        }`}
                      >
                        {n}단
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : null}

          {workbook.selectedTypes.includes("grammar_fix") ? (
            <FixControls
              label="어법 수정"
              options={workbook.grammarFixOptions ?? DEFAULT_WORKBOOK_GRAMMAR_FIX_OPTIONS}
              available={(workbook.grammarChoiceSections?.length ?? 0) > 0}
              onChange={(patch) => changeFix("grammar", patch)}
            />
          ) : null}
          {workbook.selectedTypes.includes("vocab_fix") ? (
            <FixControls
              label="어휘 수정"
              options={workbook.vocabFixOptions ?? DEFAULT_WORKBOOK_GRAMMAR_FIX_OPTIONS}
              available={(workbook.vocabChoiceSections?.length ?? 0) > 0}
              onChange={(patch) => changeFix("vocab", patch)}
            />
          ) : null}

          {editablePassages.length > 0 ? (
            <div className="space-y-2">
              <p className="text-[11px] font-bold text-slate-500">지문 제목 · 출처</p>
              {editablePassages.map((p, i) => (
                <div
                  key={p.projectId}
                  className="space-y-1 rounded-lg border border-slate-100 bg-slate-50 p-2"
                >
                  <input
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs font-semibold text-slate-900 outline-none focus:border-violet-300"
                    value={p.title}
                    maxLength={120}
                    placeholder={`지문 ${i + 1} 제목`}
                    aria-label={`지문 ${i + 1} 제목`}
                    onChange={(e) => editPassage(p.projectId, { title: e.target.value })}
                  />
                  <input
                    className="w-full rounded-md border border-slate-200 bg-white px-2 py-1 text-xs text-slate-600 outline-none focus:border-violet-300"
                    value={p.source}
                    maxLength={120}
                    placeholder="출처"
                    aria-label={`지문 ${i + 1} 출처`}
                    onChange={(e) => editPassage(p.projectId, { source: e.target.value })}
                  />
                </div>
              ))}
            </div>
          ) : null}

          {saveState !== "idle" ? (
            <p
              className={`text-[11px] ${
                saveState === "error" ? "text-rose-600" : "text-slate-400"
              }`}
            >
              {saveState === "saving"
                ? "저장 중…"
                : saveState === "saved"
                  ? "고친 내용을 저장했습니다."
                  : "저장하지 못했습니다. 잠시 후 다시 고쳐 보세요."}
            </p>
          ) : null}
        </div>
        {grammarChoicePending ? (
          <div className="mx-4 mt-4 rounded-xl border border-violet-200 bg-violet-50 px-3 py-3">
            <p className="text-xs font-bold text-violet-800">어법 선택 제작 중</p>
            <p className="mt-1 text-[11px] leading-relaxed text-violet-700">
              나머지 유형은 완성됐습니다. 어법 선택은 끝나는 대로 워크북에 붙습니다.
            </p>
            <div
              className="mt-2 h-1.5 overflow-hidden rounded-full bg-white"
              role="progressbar"
              aria-label="어법 선택 제작 중"
            >
              <div className="h-full w-2/5 animate-indeterminate rounded-full bg-violet-600" />
            </div>
          </div>
        ) : null}
        <div className="mt-auto space-y-2 border-t border-slate-100 p-4">
          <Button
            type="button"
            size="sm"
            className="w-full"
            disabled={grammarChoicePending}
            onClick={() => window.print()}
          >
            {grammarChoicePending ? "어법 선택 완성 후 인쇄" : "인쇄 / PDF 저장"}
          </Button>
          <p className="text-[10px] leading-relaxed text-slate-400">
            인쇄 대화상자에서 「PDF로 저장」을 선택하세요. 표지·빈 페이지 없이
            문제 → 정답 순입니다.
          </p>
        </div>
      </aside>

      <main className="relative min-w-0 flex-1 overflow-auto print:static print:overflow-visible">
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
            className={`flex origin-top flex-col gap-6 print:gap-0 print:!transform-none ${designClass(designStyle)}`}
            style={previewStyle}
          >
            {printPages}
          </div>
        </div>

        {measureBlock}
      </main>
    </div>
  );
}
