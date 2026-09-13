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
}) {
  const fixed = columnHeightMm != null;
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
      <header className="mb-4" data-wb-block="sheet-header">
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
        <p className="workbook-passage text-[13px] leading-relaxed text-slate-700">
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
      <p className="text-[13px] font-semibold text-slate-800">
        정답:{" "}
        {section.items.map((it) => `(${it.index}) ${it.answer}`).join("  ")}
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
        <p className="mb-2 text-[12px] font-semibold text-slate-500">
          {section.title}
          {section.source?.trim() ? ` · ${section.source.trim()}` : ""}
        </p>
      ) : (
        <>
          <p className="mb-1 text-[12px] font-semibold text-slate-500">
            {section.title}
          </p>
          {section.source?.trim() ? (
            <p className="mb-3 text-[12px] font-semibold text-slate-500">
              · {section.source.trim()}
            </p>
          ) : (
            <div className="mb-3" />
          )}
        </>
      )}
      <p className="mb-4 text-[13px] font-semibold text-slate-800">{instruction}</p>
      <p className="grammar-passage text-[13px] text-slate-900">
        {section.segments.map((seg, i) =>
          seg.type === "text" ? (
            <span key={`gct-${i}`}>{seg.text}</span>
          ) : (
            <span
              key={`gcc-${seg.number}-${i}`}
              className="grammar-choice"
            >
              {circledNumber(seg.number)}[{seg.leftText} / {seg.rightText}]
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
      <h3 className="mb-3 text-[16px] font-black" style={{ color: ACCENT }}>
        {typeOrder}. 어법 선택
        {multi ? ` · ${section.title}` : ""}
      </h3>
      <ol className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {section.items.map((it) => (
          <li
            key={it.choiceId}
            className="break-inside-avoid text-[12.5px] leading-relaxed text-slate-800"
          >
            <span className="font-bold">
              {circledNumber(it.number)} 정답: {it.correctText}
            </span>
            {it.labelHidden ? null : (
              <span className="ml-1.5 text-[11.5px] font-semibold text-slate-500">
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
      <h3 className="mb-3 text-[16px] font-black" style={{ color: ACCENT }}>
        {typeOrder}. 어휘 선택
        {multi ? ` · ${section.title}` : ""}
      </h3>
      <ol className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {section.items.map((it) => (
          <li
            key={it.choiceId}
            className="break-inside-avoid text-[12.5px] leading-relaxed text-slate-800"
          >
            <span className="font-bold">
              {circledNumber(it.number)} {it.correctText}
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
        <p className="mb-2 text-[12px] font-semibold text-slate-500">
          {section.title}
          {section.source?.trim() ? ` · ${section.source.trim()}` : ""}
        </p>
      ) : (
        <>
          <p className="mb-1 text-[12px] font-semibold text-slate-500">{section.title}</p>
          {section.source?.trim() ? (
            <p className="mb-3 text-[12px] font-semibold text-slate-500">
              · {section.source.trim()}
            </p>
          ) : (
            <div className="mb-3" />
          )}
        </>
      )}
      <p className="mb-4 text-[13px] font-semibold text-slate-800">
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
      <h3 className="mb-3 text-[16px] font-black" style={{ color: ACCENT }}>
        {typeOrder}. {label}
        {multi ? ` · ${section.title}` : ""}
      </h3>
      <ol className="grid grid-cols-1 gap-x-6 gap-y-1.5 sm:grid-cols-2">
        {section.answers.map((a, i) => (
          <li
            key={`gfk-${i}`}
            className="break-inside-avoid text-[12.5px] leading-relaxed text-slate-800"
          >
            <span className="font-bold">
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
        <p className="mb-2 text-[12px] font-semibold text-slate-500">
          {question.title}
          {question.source?.trim() ? ` · ${question.source.trim()}` : ""}
        </p>
      ) : null}
      <p className="mb-4 text-[13px] font-semibold text-slate-800">
        다음 문장들을 글의 흐름에 맞게 배열하세요.
      </p>
      {question.pinFirstSentence && question.givenSentence ? (
        <div className="mb-4 break-inside-avoid">
          <p className="mb-1 text-[12px] font-bold text-slate-600">주어진 문장</p>
          <p className="text-[13px] leading-relaxed text-slate-900">
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
        <p className="mb-3 text-[13px] font-bold text-slate-800">정답 순서:</p>
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
      <p className="text-[13px] font-semibold text-slate-800">
        <span className="font-black" style={{ color: ACCENT }}>
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
      <p className="mb-1 text-[12px] font-semibold text-slate-500">
        {section.title}
        {continued ? " (계속)" : ""}
      </p>
      {section.source?.trim() ? (
        <p className="mb-3 text-[12px] font-semibold text-slate-500">
          · {section.source.trim()}
        </p>
      ) : (
        <div className="mb-3" />
      )}
      {!continued ? (
        <p className="mb-4 text-[13px] font-semibold text-slate-800">
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

function LineTranslationAnswerBody({
  section,
  typeOrder,
  multi,
}: {
  section: WorkbookLineTranslationSection;
  typeOrder: number;
  multi: boolean;
}) {
  return (
    <div className="line-translation-answer-key">
      <h3 className="mb-3 text-[16px] font-black" style={{ color: ACCENT }}>
        {typeOrder}. 한줄해석
        {multi ? ` · ${section.title}` : ""}
      </h3>
      {!multi ? (
        <>
          <p className="mb-1 text-[12px] font-semibold text-slate-500">
            {section.title}
          </p>
          {section.source?.trim() ? (
            <p className="mb-3 text-[12px] font-semibold text-slate-500">
              · {section.source.trim()}
            </p>
          ) : null}
        </>
      ) : section.source?.trim() ? (
        <p className="mb-3 text-[12px] font-semibold text-slate-500">
          · {section.source.trim()}
        </p>
      ) : null}
      <div className="space-y-2.5">
        {section.items.map((it) => (
          <div
            key={`lta-${section.projectId}-${it.sentenceId}`}
            className="break-inside-avoid"
            style={{ pageBreakInside: "avoid" }}
          >
            <p className="line-translation-answer-key-english">
              <span className="font-bold">{it.orderIndex}.</span>{" "}
              {it.englishDisplay}
            </p>
            <p className="line-translation-answer-key-korean">{it.korean}</p>
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
      <p className="mb-1 text-[12px] font-semibold text-slate-500">
        {section.title}
        {continued ? " (계속)" : ""}
      </p>
      {section.source?.trim() ? (
        <p className="mb-3 text-[12px] font-semibold text-slate-500">
          · {section.source.trim()}
        </p>
      ) : (
        <div className="mb-3" />
      )}
      {!continued ? (
        <p className="mb-4 text-[13px] font-semibold text-slate-800">
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
}: {
  section: WorkbookFullEnWritingSection;
  typeOrder: number;
  multi: boolean;
}) {
  return (
    <div className="full-writing-answer-key">
      <h3 className="mb-3 text-[16px] font-black" style={{ color: ACCENT }}>
        {typeOrder}. 통문장 영작
        {multi ? ` · ${section.title}` : ""}
      </h3>
      {!multi ? (
        <>
          <p className="mb-1 text-[12px] font-semibold text-slate-500">
            {section.title}
          </p>
          {section.source?.trim() ? (
            <p className="mb-3 text-[12px] font-semibold text-slate-500">
              · {section.source.trim()}
            </p>
          ) : null}
        </>
      ) : section.source?.trim() ? (
        <p className="mb-3 text-[12px] font-semibold text-slate-500">
          · {section.source.trim()}
        </p>
      ) : null}
      <div className="space-y-4">
        {section.items.map((it) => (
          <div
            key={`fwa-${section.projectId}-${it.sentenceId}`}
            className="break-inside-avoid"
            style={{ pageBreakInside: "avoid" }}
          >
            <p className="full-writing-answer-key-korean">
              <span className="font-bold text-slate-700">{it.orderIndex}.</span>{" "}
              {it.korean}
            </p>
            <p className="full-writing-answer-key-english">
              {it.englishDisplay}
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
}: {
  section: WorkbookWordOrderWritingSection;
  typeOrder: number;
  multi: boolean;
}) {
  return (
    <div className="word-order-answer-key word-order-sheet">
      <h3 className="word-order-title mb-3 font-black" style={{ color: ACCENT }}>
        {typeOrder}. 어순배열 영작
        {multi ? ` · ${section.title}` : ""}
      </h3>
      {!multi ? (
        <>
          <p className="word-order-passage-title mb-1 font-semibold text-slate-500">
            {section.title}
          </p>
          {section.source?.trim() ? (
            <p className="word-order-source mb-3 font-semibold text-slate-500">
              · {section.source.trim()}
            </p>
          ) : null}
        </>
      ) : section.source?.trim() ? (
        <p className="word-order-source mb-3 font-semibold text-slate-500">
          · {section.source.trim()}
        </p>
      ) : null}
      <div className="space-y-2">
        {section.items.map((it) => (
          <div
            key={`woa-${it.questionId}`}
            className="break-inside-avoid"
            style={{ pageBreakInside: "avoid" }}
          >
            <p className="word-order-answer-key-korean">
              <span className="font-bold text-slate-700">{it.orderIndex}.</span>{" "}
              {it.korean}
            </p>
            <p className="word-order-answer-key-english">
              {it.originalEnglish}
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
      typeOrderBlank: number | null;
      typeOrderGrammarChoice: number | null;
      typeOrderGrammarFix: number | null;
      typeOrderVocabChoice: number | null;
      typeOrderVocabFix: number | null;
      typeOrderTf: number | null;
      typeOrderSentenceOrder: number | null;
      typeOrderLineKo: number | null;
      typeOrderFullEn: number | null;
      typeOrderWordOrder: number | null;
    };

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
  /** 그려 보니 넘친 2단 쪽: "유형:첫 지문 번호" → 그 쪽에 실을 수 있는 지문 수. */
  const [columnLimits, setColumnLimits] = useState<Record<string, number>>({});
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
  font-size: 13px;
  line-height: 1.5;
  margin-top: 2px;
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
  margin-top: 5px;
  font-size: 13px;
  line-height: 1.65;
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
  margin-top: 2px;
  font-size: 14px;
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
      out.push({
        kind: "answers",
        typeOrderBlank: typeOrders.get("blank_fill") ?? null,
        typeOrderGrammarChoice: typeOrders.get("grammar_choice") ?? null,
        typeOrderGrammarFix: typeOrders.get("grammar_fix") ?? null,
        typeOrderVocabChoice: typeOrders.get("vocab_choice") ?? null,
        typeOrderVocabFix: typeOrders.get("vocab_fix") ?? null,
        typeOrderTf: typeOrders.get("tf") ?? null,
        typeOrderSentenceOrder: typeOrders.get("sentence_order") ?? null,
        typeOrderLineKo: typeOrders.get("one_line_ko") ?? null,
        typeOrderFullEn: typeOrders.get("full_en_writing") ?? null,
        typeOrderWordOrder: typeOrders.get("word_order_writing") ?? null,
      });
    }
    return out;
  }, [workbook, typeOrders, flowPages, columnPacks]);

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
  }, [workbook]);

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
  }, [workbook, columnLimits]);

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
  }, [columnPacks, columnBodyMm, zoom]);

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
            <p className="mb-2 text-[12px] font-semibold text-slate-500">
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
          <p className="mb-1 text-[13px] font-black" style={{ color: ACCENT }}>
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
                    key={`col-${page.type}-${page.indices.join("-")}`}
                    pageNo={pageNo}
                    total={total}
                    workbookTitle={title}
                    showTypeTitle
                    typeTitle={`${page.typeOrder}. ${COLUMN_TYPE_TITLE[page.type]}`}
                    isLast={isLast}
                    columns={page.columns}
                    columnHeightMm={page.packed ? (columnBodyMm ?? undefined) : undefined}
                    columnKey={`${page.type}:${page.indices[0]}`}
                    columnCount={page.indices.length}
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
              return (
                <PageShell
                  key="answers"
                  pageNo={pageNo}
                  total={total}
                  workbookTitle={title}
                  showTypeTitle
                  typeTitle="정답"
                  isLast={isLast}
                >
                  {/* 정답은 유형 번호 순으로 보인다(CSS order). 유형 순서가 바뀌어도 여기를 고칠 필요가 없다. */}
                  <div className="flex flex-col gap-8">
                    {page.typeOrderBlank != null
                      ? workbook.blankSections.map((section, i) => (
                          <div key={`ba-${section.projectId}-${i}`} style={{ order: page.typeOrderBlank! }}>
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
                    {page.typeOrderGrammarChoice != null
                      ? gcSections.map((section, i) => (
                          <div key={`gca-${section.projectId}-${i}`} style={{ order: page.typeOrderGrammarChoice! }}>
                            <GrammarChoiceAnswerBody
                              section={section}
                              typeOrder={page.typeOrderGrammarChoice!}
                              multi={gcSections.length > 1}
                            />
                          </div>
                        ))
                      : null}
                    {page.typeOrderGrammarFix != null ? (
                      <div className="space-y-6" style={{ order: page.typeOrderGrammarFix }}>
                        {gfSections.map((section, i) => (
                          <div key={`gfa-${section.projectId}-${i}`}>
                            <GrammarFixAnswerBody
                              section={section}
                              typeOrder={page.typeOrderGrammarFix!}
                              multi={gfSections.length > 1}
                            />
                          </div>
                        ))}
                        {gfSkipped.length > 0 ? (
                          <ul className="space-y-1 text-[11px] text-amber-700">
                            {gfSkipped.map((s) => (
                              <li key={`gfs-${s.projectId}`}>
                                「{s.title}」 {s.reason}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                    {page.typeOrderVocabChoice != null ? (
                      <div className="space-y-6" style={{ order: page.typeOrderVocabChoice }}>
                        {vcSections.map((section, i) => (
                          <div key={`vca-${section.projectId}-${i}`}>
                            <VocabChoiceAnswerBody
                              section={section}
                              typeOrder={page.typeOrderVocabChoice!}
                              multi={vcSections.length > 1}
                            />
                          </div>
                        ))}
                        {vcSkipped.length > 0 ? (
                          <ul className="space-y-1 text-[11px] text-amber-700">
                            {vcSkipped.map((s) => (
                              <li key={`vcs-${s.projectId}`}>
                                「{s.title}」 {s.reason}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                    {page.typeOrderVocabFix != null ? (
                      <div className="space-y-6" style={{ order: page.typeOrderVocabFix }}>
                        {vfSections.map((section, i) => (
                          <div key={`vfa-${section.projectId}-${i}`}>
                            <GrammarFixAnswerBody
                              section={section}
                              typeOrder={page.typeOrderVocabFix!}
                              multi={vfSections.length > 1}
                              label="어휘 수정"
                            />
                          </div>
                        ))}
                        {vfSkipped.length > 0 ? (
                          <ul className="space-y-1 text-[11px] text-amber-700">
                            {vfSkipped.map((s) => (
                              <li key={`vfs-${s.projectId}`}>
                                「{s.title}」 {s.reason}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                    {page.typeOrderTf != null
                      ? workbook.sections.map((section, i) => (
                          <div key={`ta-${section.projectId}-${i}`} style={{ order: page.typeOrderTf! }}>
                            <TfAnswerBody
                              section={section}
                              typeOrder={page.typeOrderTf!}
                              multi={workbook.sections.length > 1}
                            />
                          </div>
                        ))
                      : null}
                    {page.typeOrderSentenceOrder != null ? (
                      <div style={{ order: page.typeOrderSentenceOrder }}>
                        <h3
                          className="mb-3 text-[16px] font-black"
                          style={{ color: ACCENT }}
                        >
                          {page.typeOrderSentenceOrder}. 문장 순서 배열
                        </h3>
                        <div className="space-y-3">
                          {soQuestions.map((q) => (
                            <SentenceOrderAnswerBody
                              key={`soa-${q.questionId}`}
                              question={q}
                              typeOrder={page.typeOrderSentenceOrder!}
                              all={soQuestions}
                            />
                          ))}
                        </div>
                        {soSkipped.length > 0 ? (
                          <ul className="mt-4 space-y-1 text-[11px] text-amber-700">
                            {soSkipped.map((s) => (
                              <li key={`sos-${s.projectId}`}>
                                「{s.title}」 {s.reason}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                    {page.typeOrderLineKo != null ? (
                      <div className="space-y-8" style={{ order: page.typeOrderLineKo }}>
                        {ltSections.map((section) => (
                          <LineTranslationAnswerBody
                            key={`lta-${section.projectId}`}
                            section={section}
                            typeOrder={page.typeOrderLineKo!}
                            multi={ltSections.length > 1}
                          />
                        ))}
                        {ltSkipped.length > 0 ? (
                          <ul className="space-y-1 text-[11px] text-amber-700">
                            {ltSkipped.map((s) => (
                              <li key={`lts-${s.projectId}`}>
                                「{s.title}」 {s.reason}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                    {page.typeOrderFullEn != null ? (
                      <div className="space-y-8" style={{ order: page.typeOrderFullEn }}>
                        {feSections.map((section) => (
                          <FullEnWritingAnswerBody
                            key={`fea-${section.projectId}`}
                            section={section}
                            typeOrder={page.typeOrderFullEn!}
                            multi={feSections.length > 1}
                          />
                        ))}
                        {feSkipped.length > 0 ? (
                          <ul className="space-y-1 text-[11px] text-amber-700">
                            {feSkipped.map((s) => (
                              <li key={`fes-${s.projectId}`}>
                                「{s.title}」 {s.reason}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                    {page.typeOrderWordOrder != null ? (
                      <div className="space-y-8" style={{ order: page.typeOrderWordOrder }}>
                        {woSections.map((section) => (
                          <WordOrderAnswerBody
                            key={`woa-${section.projectId}`}
                            section={section}
                            typeOrder={page.typeOrderWordOrder!}
                            multi={woSections.length > 1}
                          />
                        ))}
                        {woSkipped.length > 0 ? (
                          <ul className="space-y-1 text-[11px] text-amber-700">
                            {woSkipped.map((s) => (
                              <li key={`wos-${s.projectId}`}>
                                「{s.title}」 {s.reason}
                              </li>
                            ))}
                          </ul>
                        ) : null}
                      </div>
                    ) : null}
                  </div>
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
        <div className="pointer-events-none absolute left-0 top-0 h-0 w-0 overflow-hidden print:hidden" aria-hidden>
        <div
          ref={measureRef}
          className="-z-10 w-[210mm] opacity-0"
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
          <header className="mb-4" data-wb-measure="sheet-header">
            <p className="text-[13px] font-bold text-slate-800">{title}</p>
            <div
              className="mt-1.5 h-px w-full"
              style={{ backgroundColor: ACCENT }}
            />
            <h2
              className="mt-4 text-[18px] font-black tracking-tight"
              style={{ color: ACCENT }}
            >
              1. 한줄해석
            </h2>
          </header>
          {ltSections.map((section, si) => (
            <div key={`m-lt-${section.projectId}`}>
              <div data-wb-measure={`lt-intro-${si}`}>
                <p className="mb-1 text-[12px] font-semibold text-slate-500">
                  {section.title}
                </p>
                {section.source?.trim() ? (
                  <p className="mb-3 text-[12px] font-semibold text-slate-500">
                    · {section.source.trim()}
                  </p>
                ) : (
                  <div className="mb-3" />
                )}
                <p className="mb-4 text-[13px] font-semibold text-slate-800">
                  다음 영어 문장을 우리말로 해석하세요.
                </p>
              </div>
              <div data-wb-measure={`lt-cont-${si}`}>
                <p className="mb-1 text-[12px] font-semibold text-slate-500">
                  {section.title} (계속)
                </p>
                {section.source?.trim() ? (
                  <p className="mb-3 text-[12px] font-semibold text-slate-500">
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
                <p className="mb-1 text-[12px] font-semibold text-slate-500">
                  {section.title}
                </p>
                {section.source?.trim() ? (
                  <p className="mb-3 text-[12px] font-semibold text-slate-500">
                    · {section.source.trim()}
                  </p>
                ) : (
                  <div className="mb-3" />
                )}
                <p className="mb-4 text-[13px] font-semibold text-slate-800">
                  다음 우리말 뜻에 맞도록 영어 문장 전체를 쓰세요.
                </p>
              </div>
              <div data-wb-measure={`fe-cont-${si}`}>
                <p className="mb-1 text-[12px] font-semibold text-slate-500">
                  {section.title} (계속)
                </p>
                {section.source?.trim() ? (
                  <p className="mb-3 text-[12px] font-semibold text-slate-500">
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
                <p className="mb-1 text-[12px] font-semibold text-slate-500">
                  {section.title}
                </p>
                {section.source?.trim() ? (
                  <p className="mb-3 text-[12px] font-semibold text-slate-500">
                    · {section.source.trim()}
                  </p>
                ) : (
                  <div className="mb-3" />
                )}
                <p className="mb-4 text-[13px] font-semibold text-slate-800">
                  우리말 뜻과 일치하도록 주어진 영어 어절을 올바르게 배열하여
                  완전한 문장을 쓰세요.
                </p>
              </div>
              <div data-wb-measure={`wo-cont-${si}`}>
                <p className="mb-1 text-[12px] font-semibold text-slate-500">
                  {section.title} (계속)
                </p>
                {section.source?.trim() ? (
                  <p className="mb-3 text-[12px] font-semibold text-slate-500">
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
        <div id="workbook-print-root" className="flex flex-col gap-6 print:gap-0">
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
            {printPages}
          </div>
        </div>

        {measureBlock}
      </main>
    </div>
  );
}
