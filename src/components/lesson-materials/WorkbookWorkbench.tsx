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
  type WorkbookFullEnWritingSection,
  type WorkbookGrammarChoiceSection,
  type WorkbookLineTranslationSection,
  type WorkbookPassageSection,
  type WorkbookSentenceOrderQuestion,
  type WorkbookTypeId,
  type WorkbookWordOrderWritingSection,
} from "@/lib/lesson-materials/workbook-types";
import { formatAnswerOrderSequence } from "@/lib/lesson-materials/sentence-order-shuffle";
import { circledNumber } from "@/lib/lesson-materials/grammar-choice-constants";

const A4_WIDTH = "210mm";
const A4_HEIGHT = "297mm";
const A4_PAD_MM = 14;
const A4_FOOTER_MM = 18;
const A4_PAD = `${A4_PAD_MM}mm`;
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
      <div className="workbook-a4-body">{children}</div>
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

function GrammarChoiceQuestionBody({
  section,
  multi,
}: {
  section: WorkbookGrammarChoiceSection;
  multi: boolean;
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
      <p className="mb-4 text-[13px] font-semibold text-slate-800">
        다음 글의 번호별 선택지에서 문법상 알맞은 표현을 고르세요.
      </p>
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
  const d = section.diagnostics;
  return (
    <>
      <h3 className="mb-3 text-[16px] font-black" style={{ color: ACCENT }}>
        {typeOrder}. 어법 선택
        {multi ? ` · ${section.title}` : ""}
      </h3>
      <ol className="space-y-4">
        {section.items.map((it) => (
          <li
            key={it.choiceId}
            className="break-inside-avoid text-[12.5px] leading-relaxed text-slate-800"
          >
            <p className="font-bold">
              {circledNumber(it.number)} 정답: {it.correctText}
            </p>
            <p className="mt-1 text-[12px] font-semibold text-slate-600">
              문법: {it.bookTerm || it.grammarCategoryName}
            </p>
            {it.structureSummary ? (
              <p className="mt-1 text-slate-700">구조: {it.structureSummary}</p>
            ) : null}
            <p className="mt-1 text-slate-700">설명: {it.explanationKo}</p>
            <p className="mt-1 text-slate-700">
              오답 이유: {it.incorrectText}
              {it.incorrectReasonKo ? ` — ${it.incorrectReasonKo}` : ""}
            </p>
          </li>
        ))}
      </ol>
      {d ? (
        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-3 text-[11px] leading-relaxed text-slate-600 print:hidden">
          <p className="font-bold text-slate-800">진단</p>
          <ul className="mt-1 space-y-0.5">
            <li>전체 문장 수: {d.sentenceCount}</li>
            <li>발견 포인트: {d.discoveredGrammarPointCount ?? "—"} {d.sentencePointCounts ? `(${d.sentencePointCounts.map((s) => s.count).join("/")})` : ""}</li>
            <li>최종/화면/정답지: {d.finalQuestionCount ?? d.finalCount} / {d.renderedQuestionCount ?? d.finalCount} / {d.renderedQuestionCount ?? d.finalCount}</li>
            <li>난이도: {d.difficultyMix ? `BASIC ${d.difficultyMix.BASIC} · CORE ${d.difficultyMix.CORE} · ADVANCED ${d.difficultyMix.ADVANCED}` : "—"}</li>
            <li>탈락 사유: {d.rejectReasonCounts ? JSON.stringify(d.rejectReasonCounts) : "—"}</li>
            <li>분석 힌트 수: {d.analysisHintCount}</li>
            <li>후보 생성 수: {d.generatedCandidateCount}</li>
            <li>1차 코드 검증 통과 수: {d.codeValidatedCount}</li>
            <li>원문 불일치 탈락 수: {d.originalMismatchCount}</li>
            <li>범위 오류 탈락 수: {d.rangeErrorCount}</li>
            <li>중복·겹침 탈락 수: {d.overlapDuplicateCount}</li>
            <li>전달 수: {d.reviewSubmittedCount}</li>
            <li>승인 수: {d.reviewAcceptedCount}</li>
            <li>양쪽 가능성 탈락 수: {d.bothPossibleRejectCount}</li>
            <li>어휘·숙어 탈락 수: {d.lexicalRejectCount}</li>
            <li>저급 오답 탈락 수: {d.trivialRejectCount}</li>
            <li>최종 문항 수: {d.finalCount}</li>
            <li>문법 범주 수: {d.grammarCategoryCount}</li>
            <li>평균 품질 점수: {d.averageQualityScore}</li>
            <li>원문 완전 복원: {d.passageRestored ? "예" : "아니오"}</li>
            <li>generatorModel: {d.generatorModel}</li>
            <li>generatorActualResponseModel: {d.generatorActualResponseModel ?? d.generatorResponseModel ?? "—"}</li>
            <li>generatorReasoningEffort: {d.generatorReasoningEffort ?? "—"}</li>
            <li>reviewerModel: {d.reviewerModel}</li>
            <li>reviewerActualResponseModel: {d.reviewerActualResponseModel ?? d.reviewerResponseModel ?? "—"}</li>
            <li>reviewerReasoningEffort: {d.reviewerReasoningEffort ?? "—"}</li>
            <li>openAICallCount: {d.openAICallCount ?? (d.generateApiCalls ?? 0) + (d.reviewApiCalls ?? 0)}</li>
            <li>cacheHit: {d.cacheHit ? "true" : "false"}</li>
            <li>forceRegenerate: {d.forceRegenerate ? "true" : "false"}</li>
            <li>oldQuestionReuseCount: {d.oldQuestionReuseCount ?? 0}</li>
            <li>generatorActualModel: {d.generatorActualModel ?? d.generatorActualResponseModel ?? "—"}</li>
            <li>reviewerActualModel: {d.reviewerActualModel ?? d.reviewerActualResponseModel ?? "—"}</li>
            <li>newQuestionCount: {d.newQuestionCount ?? d.finalCount}</li>
            <li>localFallbackUsed: {d.localFallbackUsed ? "true" : "false"}</li>
            <li>generatorVersion: {d.generatorVersion ?? "—"}</li>
            <li>engine: {d.generatorVersion?.startsWith("grammar-choice-v2") ? "v2" : "v1"}</li>
            {d.staffCompareNote ? <li>staffCompare: {d.staffCompareNote}</li> : null}
            <li>reviewerVersion: {d.reviewerVersion ?? "—"}</li>
            <li>생성 API 호출: {d.generateApiCalls}</li>
            <li>검토 호출: {d.reviewApiCalls}</li>
            {d.underTargetReason ? (
              <li>부족 사유: {d.underTargetReason}</li>
            ) : null}
          </ul>
        </div>
      ) : null}
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
      <div className="space-y-4">
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
      <div className="space-y-3">
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
      kind: "grammar_choice_q";
      sectionIndex: number;
      typeOrder: number;
    }
  | {
      kind: "sentence_order_q";
      questionIndex: number;
      typeOrder: number;
    }
  | {
      kind: "line_ko_q";
      sectionIndex: number;
      typeOrder: number;
      itemIndices?: number[];
      continued?: boolean;
    }
  | {
      kind: "full_en_q";
      sectionIndex: number;
      typeOrder: number;
      itemIndices?: number[];
      continued?: boolean;
    }
  | {
      kind: "word_order_q";
      sectionIndex: number;
      typeOrder: number;
      itemIndices?: number[];
      continued?: boolean;
    }
  | {
      kind: "answers";
      typeOrderBlank: number | null;
      typeOrderGrammarChoice: number | null;
      typeOrderTf: number | null;
      typeOrderSentenceOrder: number | null;
      typeOrderLineKo: number | null;
      typeOrderFullEn: number | null;
      typeOrderWordOrder: number | null;
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
  const [errorCode, setErrorCode] = useState<
    "MISSING_TRANSLATION" | "MISSING_LINE_TRANSLATION" | null
  >(null);
  const [lineTranslationExcludeIds, setLineTranslationExcludeIds] = useState<
    string[]
  >([]);
  const [generating, setGenerating] = useState(true);
  const [status, setStatus] = useState("워크북을 준비하고 있습니다…");
  const [zoom, setZoom] = useState(85);
  /** Measured A4 item chunks: key → pages of item indices */
  const [a4Chunks, setA4Chunks] = useState<Record<string, number[][]>>({});
  const measureRef = useRef<HTMLDivElement>(null);

  const requestKey = searchParams.toString();

  useEffect(() => {
    let cancelled = false;
    const timers: {
      status: ReturnType<typeof setTimeout> | null;
      elapsed: ReturnType<typeof setInterval> | null;
    } = { status: null, elapsed: null };
    (async () => {
      setGenerating(true);
      setError(null);
      setErrorCode(null);
      setLineTranslationExcludeIds([]);
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
            (cached.blankSections?.length ?? 0) > 0 ||
            (cached.grammarChoiceSections?.length ?? 0) > 0 ||
            (cached.sentenceOrderQuestions?.length ?? 0) > 0 ||
            (cached.lineTranslationSections?.length ?? 0) > 0 ||
            (cached.fullEnWritingSections?.length ?? 0) > 0 ||
            (cached.wordOrderWritingSections?.length ?? 0) > 0)
        ) {
          if (!cancelled) {
            setWorkbook({
              ...cached,
              blankSections: cached.blankSections ?? [],
              blankOptions: cached.blankOptions ?? DEFAULT_WORKBOOK_BLANK_OPTIONS,
              grammarChoiceSections: cached.grammarChoiceSections ?? [],
              grammarChoiceSkipped: cached.grammarChoiceSkipped ?? [],
              sentenceOrderQuestions: cached.sentenceOrderQuestions ?? [],
              sentenceOrderSkipped: cached.sentenceOrderSkipped ?? [],
              lineTranslationSections: cached.lineTranslationSections ?? [],
              lineTranslationSkipped: cached.lineTranslationSkipped ?? [],
              fullEnWritingSections: cached.fullEnWritingSections ?? [],
              fullEnWritingSkipped: cached.fullEnWritingSkipped ?? [],
              wordOrderWritingSections: cached.wordOrderWritingSections ?? [],
              wordOrderWritingSkipped: cached.wordOrderWritingSkipped ?? [],
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
      const wantGrammarChoice = types.includes("grammar_choice");
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
          wantGrammarChoice,
          wantSentenceOrder,
          wantLineKo,
          wantFullEn,
          wantWordOrder,
        ].filter(Boolean).length > 1;
      if (multiReady) {
        setStatus("워크북을 만들고 있습니다…");
      } else if (wantGrammarChoice) {
        setStatus("4%");
      } else if (wantBlank) {
        setStatus("빈칸 채우기 워크북을 만들고 있습니다…");
      } else if (wantWordOrder) {
        setStatus("어순배열 영작 워크북을 만들고 있습니다…");
      } else if (wantFullEn) {
        setStatus("통문장 영작 워크북을 만들고 있습니다…");
      } else if (wantLineKo) {
        setStatus("한줄해석 워크북을 만들고 있습니다…");
      } else if (wantSentenceOrder) {
        setStatus("문장 순서 배열 워크북을 만들고 있습니다…");
      } else {
        setStatus(`T/F 문제를 생성하고 있습니다… (지문 ${ids.length}개)`);
      }

      try {
        const startedAt = Date.now();
        if (wantGrammarChoice) {
          const passageCount = Math.max(1, ids.length);
          const expectedMs = Math.min(180_000, 70_000 + passageCount * 40_000);
          const tick = () => {
            if (cancelled) return;
            const elapsed = Date.now() - startedAt;
            const pct = Math.min(
              96,
              Math.max(4, Math.round((elapsed / expectedMs) * 96))
            );
            setStatus(`${pct}%`);
          };
          tick();
          timers.elapsed = setInterval(tick, 500);
        }
        const res = await generateWorkbookAction(role, {
          projectIds: ids,
          selectedTypes: types,
          tfOptions: { count, language, difficulty },
          blankOptions,
          title,
          lineTranslationExcludeIds: ltExclude,
          forceRegenerate: wantGrammarChoice && searchParams.get("forceRegen") === "1",
        });
        if (timers.status) clearTimeout(timers.status);
        if (timers.elapsed) clearInterval(timers.elapsed);
        timers.status = null;
        timers.elapsed = null;
        if (cancelled) return;
        if (!res.ok) {
          setError(res.message);
          if (res.code === "MISSING_TRANSLATION") {
            setErrorCode("MISSING_TRANSLATION");
          } else if (res.code === "MISSING_LINE_TRANSLATION") {
            setErrorCode("MISSING_LINE_TRANSLATION");
            setLineTranslationExcludeIds(res.lineTranslationExcludeIds ?? []);
          } else {
            setErrorCode(null);
          }
          setGenerating(false);
          return;
        }
        if (wantGrammarChoice) {
          setStatus("100%");
        }
        saveWorkbookToSession(res.workbook);
        setWorkbook(res.workbook);
        setGenerating(false);
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
  }, [role, requestKey]);

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
  text-align: left;
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
  margin-bottom: 22px;
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
  font-size: 15px;
  line-height: 1.75;
  color: #172033;
  margin: 0;
}
.line-translation-answer {
  margin-top: 8px;
  margin-left: 1.25rem;
}
.translation-answer-line {
  height: 34px;
  border-bottom: 1px solid #94a3b8;
}
.line-translation-answer-key-english {
  font-size: 14px;
  line-height: 1.55;
  color: #1e3a5f;
  margin: 0;
}
.line-translation-answer-key-korean {
  font-size: 14px;
  line-height: 1.65;
  margin-top: 4px;
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
  font-size: 15px;
  color: #172033;
}
.full-writing-korean {
  font-size: 15px;
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
  font-size: 14px;
  line-height: 1.65;
  color: #64748b;
  margin: 0;
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-wrap: break-word;
}
.full-writing-answer-key-english {
  margin-top: 5px;
  font-size: 15px;
  line-height: 1.65;
  color: #172033;
  font-weight: 500;
}
.word-order-item {
  margin-bottom: 16px;
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
  font-size: 15px;
  color: #172033;
}
.word-order-korean {
  font-size: 15px;
  line-height: 1.65;
  color: #334155;
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-wrap: break-word;
  margin-bottom: 5px;
}
.word-order-bank {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 6px;
  padding: 8px 12px;
  margin-top: 6px;
  margin-bottom: 7px;
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  background: #f8fafc;
  font-size: 14px;
  line-height: 1.55;
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
  margin-top: 6px;
  padding-left: 1.25rem;
}
.word-order-answer-line {
  height: 29px;
  border-bottom: 1px solid #94a3b8;
}
.word-order-answer-key-korean {
  font-size: 14px;
  line-height: 1.55;
  color: #64748b;
  margin: 0;
  white-space: pre-wrap;
  word-break: keep-all;
  overflow-wrap: break-word;
}
.word-order-answer-key-english {
  margin-top: 4px;
  font-size: 14px;
  line-height: 1.55;
  color: #172033;
  font-weight: 500;
}
.word-order-sheet .workbook-a4-body > h2,
.workbook-a4-sheet:has(.word-order-sheet) h2 {
  font-size: 22px;
  line-height: 1.3;
}
@media print {
  @page { size: 210mm 297mm; margin: 0; }
  @page app-print-a4 { size: 210mm 297mm; margin: 0; }
  #workbook-print-root { transform: none !important; gap: 0 !important; }
  .sentence-order-answer-box {
    width: 13mm;
    height: 10mm;
    border: 0.45mm solid #64748b;
  }
  .translation-answer-line {
    height: 9mm;
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
    height: 7.5mm;
    border-bottom: 0.3mm solid #94a3b8;
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
    const soQuestions = workbook.sentenceOrderQuestions ?? [];
    const ltSections = workbook.lineTranslationSections ?? [];
    const feSections = workbook.fullEnWritingSections ?? [];
    const woSections = workbook.wordOrderWritingSections ?? [];
    const gcSections = workbook.grammarChoiceSections ?? [];
    for (const t of types) {
      const order = typeOrders.get(t) ?? 1;
      if (t === "grammar_choice") {
        gcSections.forEach((_, i) => {
          out.push({
            kind: "grammar_choice_q",
            sectionIndex: i,
            typeOrder: order,
          });
        });
      }
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
      if (t === "sentence_order") {
        soQuestions.forEach((_, i) => {
          out.push({
            kind: "sentence_order_q",
            questionIndex: i,
            typeOrder: order,
          });
        });
      }
      if (t === "one_line_ko") {
        ltSections.forEach((section, i) => {
          const key = `lt-q-${i}`;
          const chunks =
            a4Chunks[key] ??
            (section.items.length
              ? [section.items.map((_, idx) => idx)]
              : [[]]);
          chunks.forEach((itemIndices, ci) => {
            out.push({
              kind: "line_ko_q",
              sectionIndex: i,
              typeOrder: order,
              itemIndices,
              continued: ci > 0,
            });
          });
        });
      }
      if (t === "full_en_writing") {
        feSections.forEach((section, i) => {
          const key = `fe-q-${i}`;
          const chunks =
            a4Chunks[key] ??
            (section.items.length
              ? [section.items.map((_, idx) => idx)]
              : [[]]);
          chunks.forEach((itemIndices, ci) => {
            out.push({
              kind: "full_en_q",
              sectionIndex: i,
              typeOrder: order,
              itemIndices,
              continued: ci > 0,
            });
          });
        });
      }
      if (t === "word_order_writing") {
        woSections.forEach((section, i) => {
          const key = `wo-q-${i}`;
          const chunks =
            a4Chunks[key] ??
            (section.items.length
              ? [section.items.map((_, idx) => idx)]
              : [[]]);
          chunks.forEach((itemIndices, ci) => {
            out.push({
              kind: "word_order_q",
              sectionIndex: i,
              typeOrder: order,
              itemIndices,
              continued: ci > 0,
            });
          });
        });
      }
    }
    if (types.length > 0) {
      out.push({
        kind: "answers",
        typeOrderBlank: typeOrders.get("blank_fill") ?? null,
        typeOrderGrammarChoice: typeOrders.get("grammar_choice") ?? null,
        typeOrderTf: typeOrders.get("tf") ?? null,
        typeOrderSentenceOrder: typeOrders.get("sentence_order") ?? null,
        typeOrderLineKo: typeOrders.get("one_line_ko") ?? null,
        typeOrderFullEn: typeOrders.get("full_en_writing") ?? null,
        typeOrderWordOrder: typeOrders.get("word_order_writing") ?? null,
      });
    }
    return out;
  }, [workbook, typeOrders, a4Chunks]);

  useLayoutEffect(() => {
    ensureWorkbookPrintStyles();
  }, []);

  // Measure long bilingual sections into true A4 pages (preview === print).
  useLayoutEffect(() => {
    ensureWorkbookPrintStyles();
    if (!workbook) {
      setA4Chunks({});
      return;
    }
    const root = measureRef.current;
    const ltSections = workbook.lineTranslationSections ?? [];
    const feSections = workbook.fullEnWritingSections ?? [];
    const woSections = workbook.wordOrderWritingSections ?? [];
    if (
      !root ||
      (ltSections.length === 0 &&
        feSections.length === 0 &&
        woSections.length === 0)
    ) {
      setA4Chunks({});
      return;
    }

    const widthPx = root.offsetWidth || 1;
    const pxPerMm = widthPx / 210;
    const pageBodyPx = (297 - A4_PAD_MM - A4_FOOTER_MM) * pxPerMm;
    const sheetHeaderH =
      (root.querySelector('[data-wb-measure="sheet-header"]') as HTMLElement | null)
        ?.offsetHeight ?? 72;
    const gapPx = 8;
    const next: Record<string, number[][]> = {};

    const packSection = (
      key: string,
      itemCount: number,
      introSel: string,
      contSel: string,
      itemSel: (i: number) => string
    ) => {
      const introH =
        (root.querySelector(introSel) as HTMLElement | null)?.offsetHeight ?? 70;
      const contH =
        (root.querySelector(contSel) as HTMLElement | null)?.offsetHeight ?? 40;
      const heights = Array.from({ length: itemCount }, (_, i) => {
        const el = root.querySelector(itemSel(i)) as HTMLElement | null;
        return el?.offsetHeight ?? 120;
      });
      const firstBudget = Math.max(80, pageBodyPx - sheetHeaderH - introH);
      const contBudget = Math.max(80, pageBodyPx - sheetHeaderH - contH);
      const packed: number[][] = [];
      let current: number[] = [];
      let used = 0;
      let budget = firstBudget;
      heights.forEach((h, i) => {
        const pad = current.length === 0 ? 0 : gapPx;
        if (current.length > 0 && used + pad + h > budget) {
          packed.push(current);
          current = [];
          used = 0;
          budget = contBudget;
        }
        used += (current.length === 0 ? 0 : gapPx) + h;
        current.push(i);
      });
      if (current.length) packed.push(current);
      next[key] = packed.length ? packed : [[]];
    };

    ltSections.forEach((sec, si) => {
      packSection(
        `lt-q-${si}`,
        sec.items.length,
        `[data-wb-measure="lt-intro-${si}"]`,
        `[data-wb-measure="lt-cont-${si}"]`,
        (i) => `[data-wb-measure="lt-item-${si}-${i}"]`
      );
    });
    feSections.forEach((sec, si) => {
      packSection(
        `fe-q-${si}`,
        sec.items.length,
        `[data-wb-measure="fe-intro-${si}"]`,
        `[data-wb-measure="fe-cont-${si}"]`,
        (i) => `[data-wb-measure="fe-item-${si}-${i}"]`
      );
    });
    woSections.forEach((sec, si) => {
      packSection(
        `wo-q-${si}`,
        sec.items.length,
        `[data-wb-measure="wo-intro-${si}"]`,
        `[data-wb-measure="wo-cont-${si}"]`,
        (i) => `[data-wb-measure="wo-item-${si}-${i}"]`
      );
    });

    setA4Chunks((prev) => {
      const same =
        Object.keys(next).length === Object.keys(prev).length &&
        Object.keys(next).every(
          (k) => JSON.stringify(next[k]) === JSON.stringify(prev[k])
        );
      return same ? prev : next;
    });
  }, [workbook]);

  const previewStyle = useMemo(
    (): CSSProperties => ({
      transform: `scale(${zoom / 100})`,
      transformOrigin: "top center",
    }),
    [zoom]
  );

  if (generating) {
    const pctOnly = /^\d+%$/.test(status);
    return (
      <div className="flex h-[80vh] flex-col items-center justify-center gap-3 bg-slate-100 px-4">
        <div className="max-w-md rounded-2xl bg-white px-8 py-6 text-center shadow">
          <p
            className={
              pctOnly
                ? "text-3xl font-black tabular-nums text-slate-800"
                : "text-sm font-semibold leading-relaxed text-slate-800"
            }
          >
            {status}
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
        <p className="text-sm text-slate-600">워크북을 불러오는 중…</p>
      </div>
    );
  }

  const title = workbook.metadata.title;
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

              if (page.kind === "grammar_choice_q") {
                const section = gcSections[page.sectionIndex]!;
                return (
                  <PageShell
                    key={`gc-q-${page.sectionIndex}`}
                    pageNo={pageNo}
                    total={total}
                    workbookTitle={title}
                    showTypeTitle
                    typeTitle={`${page.typeOrder}. 어법 선택`}
                    isLast={isLast}
                  >
                    <GrammarChoiceQuestionBody
                      section={section}
                      multi={gcSections.length > 1}
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

              if (page.kind === "sentence_order_q") {
                const question = soQuestions[page.questionIndex]!;
                return (
                  <PageShell
                    key={`so-q-${question.questionId}`}
                    pageNo={pageNo}
                    total={total}
                    workbookTitle={title}
                    showTypeTitle
                    typeTitle={sentenceOrderHeading(
                      page.typeOrder,
                      question,
                      soQuestions
                    )}
                    isLast={isLast}
                  >
                    <SentenceOrderQuestionBody
                      question={question}
                      showPassageMeta
                    />
                  </PageShell>
                );
              }

              if (page.kind === "line_ko_q") {
                const section = ltSections[page.sectionIndex]!;
                return (
                  <PageShell
                    key={`lt-q-${section.projectId}-${page.continued ? "c" : "0"}-${(page.itemIndices ?? []).join("-")}`}
                    pageNo={pageNo}
                    total={total}
                    workbookTitle={title}
                    showTypeTitle
                    typeTitle={`${page.typeOrder}. 한줄해석`}
                    isLast={isLast}
                  >
                    <LineTranslationQuestionBody
                      section={section}
                      itemIndices={page.itemIndices}
                      continued={page.continued}
                    />
                  </PageShell>
                );
              }

              if (page.kind === "full_en_q") {
                const section = feSections[page.sectionIndex]!;
                return (
                  <PageShell
                    key={`fe-q-${section.projectId}-${page.continued ? "c" : "0"}-${(page.itemIndices ?? []).join("-")}`}
                    pageNo={pageNo}
                    total={total}
                    workbookTitle={title}
                    showTypeTitle
                    typeTitle={`${page.typeOrder}. 통문장 영작`}
                    isLast={isLast}
                  >
                    <FullEnWritingQuestionBody
                      section={section}
                      itemIndices={page.itemIndices}
                      continued={page.continued}
                    />
                  </PageShell>
                );
              }

              if (page.kind === "word_order_q") {
                const section = woSections[page.sectionIndex]!;
                return (
                  <PageShell
                    key={`wo-q-${section.projectId}-${page.continued ? "c" : "0"}-${(page.itemIndices ?? []).join("-")}`}
                    pageNo={pageNo}
                    total={total}
                    workbookTitle={title}
                    showTypeTitle
                    typeTitle={`${page.typeOrder}. 어순배열 영작`}
                    isLast={isLast}
                  >
                    <WordOrderQuestionBody
                      section={section}
                      itemIndices={page.itemIndices}
                      continued={page.continued}
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
                    {page.typeOrderGrammarChoice != null
                      ? gcSections.map((section, i) => (
                          <div key={`gca-${section.projectId}-${i}`}>
                            <GrammarChoiceAnswerBody
                              section={section}
                              typeOrder={page.typeOrderGrammarChoice!}
                              multi={gcSections.length > 1}
                            />
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
                    {page.typeOrderSentenceOrder != null ? (
                      <div>
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
                      <div className="space-y-8">
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
                      <div className="space-y-8">
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
                      <div className="space-y-8">
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
          </div>
        </div>

        {/* Off-screen measure tree: packs long bilingual sections into real A4 pages */}
        <div
          ref={measureRef}
          className="pointer-events-none absolute left-[-9999px] top-0 -z-10 w-[210mm] opacity-0 print:hidden"
          style={{
            padding: A4_PAD,
            paddingBottom: `${A4_FOOTER_MM}mm`,
            boxSizing: "border-box",
          }}
          aria-hidden
        >
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
      </main>
    </div>
  );
}
