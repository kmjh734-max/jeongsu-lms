"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/Button";
import { ListeningPrintQrCode } from "@/components/listening/ListeningPrintQrCode";
import {
  paginatePrintPieces,
  splitPrintUnits,
  type PrintPiece,
  type PrintPiecePage,
  type PrintPiecePart,
  type PrintUnit,
} from "@/lib/question-generator/print-split";
import { ACADEMY_NAME, LOGO_SRC } from "@/lib/branding";
import {
  questionNeedsVocabGloss,
  parseHardWordsColumn,
} from "@/lib/question-generator/exam-vocab";
import {
  buildExamVocabUrl,
  buildExamVocabUrlForJob,
} from "@/lib/question-generator/exam-vocab-url";
import { groupQuestionsByPrintType } from "@/lib/question-generator/print-type-groups";
import {
  cleanQuestionText,
  normalizePassage,
  parseGrammarCorrectionBlocks,
  parseReferenceAnswerBlock,
  parseSummaryWritingBlocks,
  parseWordOrderBlocks,
  reflowPassageForPrint,
} from "@/lib/question-generator/text-utils";
import "./question-print-styles.css";

type QuestionRow = {
  id: string;
  instruction: string;
  question_text: string;
  passage_original: string;
  passage_modified: string | null;
  choices: Array<{ number: number; text: string }> | null;
  correct_answer: unknown;
  explanation: string;
  question_type?: string;
  category?: string;
  option_key?: string | null;
  hard_words?: Array<{ word: string; meaning: string }> | null;
  choice_language?: string | null;
};

type PrintLayoutMode = "mixed" | "byType";

type DisplayItem = {
  kind: "q";
  id: string;
  q: QuestionRow;
  num: number;
};

type SheetPage = PrintPiecePage & {
  /** 유형별 출력: 이 페이지가 새 유형의 첫 장일 때 소제목 */
  sectionLabel?: string;
};

const CIRCLED = ["①", "②", "③", "④", "⑤"];

/** A4 본문 열 폭(mm) — 여백·중간 구분선 반영 */
const COL_WIDTH_MM = 88;
const QUESTION_GAP_PX = 14;
const COLUMN_SAFETY_PX = 12;
const BRANDING_STORAGE_KEY = "qg-print-branding";

/*
 * 시험지 모양. 분석지와 같은 시안 셋(A 교재 세리프 · B 깔끔한 산세리프 · C 클래식 인쇄)을
 * 고를 수 있게 했다. 기본은 지금까지 쓰던 모양이다. 문항 구성은 같고 글꼴·색·테두리만
 * 바꾼다 — question-print-styles.css의 .qg-style-*.
 */
type QuestionDesignStyle = "base" | "a" | "b" | "c";
const DESIGN_STYLE_KEY = "question-print-design-style";
const DESIGN_STYLES: Array<{ id: QuestionDesignStyle; label: string; hint: string }> = [
  { id: "base", label: "기본", hint: "주황 머리선" },
  { id: "a", label: "A", hint: "교재 세리프" },
  { id: "b", label: "B", hint: "깔끔한 산세리프" },
  { id: "c", label: "C", hint: "클래식 인쇄" },
];
/** A·B·C가 쓰는 글꼴. 기본 모양에서는 불러오지 않는다. */
const DESIGN_FONTS_HREF =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;500;700&family=IBM+Plex+Sans+KR:wght@400;500;600;700&family=Source+Serif+4:ital,opsz,wght@0,8..60,400;0,8..60,500;0,8..60,600;1,8..60,500&family=Literata:opsz,wght@7..72,400;7..72,500;7..72,600&family=Gowun+Batang:wght@400;700&display=swap";

function designClass(style: QuestionDesignStyle): string {
  return style === "base" ? "" : `qg-style qg-style-${style}`;
}

type PrintBranding = {
  headerKicker: string;
  headerTitle: string;
  headerSub: string;
  footerLeft: string;
  footerRight: string;
  showLogo: boolean;
};

function formatAnswer(a: unknown): string {
  if (Array.isArray(a)) return a.join(" / ");
  if (typeof a === "number" && a >= 1 && a <= 5) {
    return CIRCLED[a - 1] ?? String(a);
  }
  return String(a ?? "");
}

function extractBannerNo(sourceDetail: string): string | null {
  const m = sourceDetail.match(/(\d{1,2})\s*번/);
  return m ? m[1] : null;
}

function padNo(n: number): string {
  return String(n).padStart(2, "0");
}

function questionPassage(q: QuestionRow): string {
  const mod = (q.passage_modified || "").trim();
  const orig = (q.passage_original || "").trim();
  if (mod && normalizePassage(mod) !== normalizePassage(orig)) return mod;
  return orig || mod;
}

function parseBogiLines(text: string): string[] {
  const cleaned = cleanQuestionText(text).trim();
  if (!cleaned) return [];
  const parts = cleaned
    .split(/(?=\(\d+\))/)
    .map((s) => s.trim())
    .filter(Boolean);
  if (parts.length >= 2) return parts;
  return cleaned.split(/\n+/).map((s) => s.trim()).filter(Boolean);
}

/** <u>…</u> 및 일반 텍스트를 인쇄용 노드로 변환 */
function renderMarkedText(text: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const re = /<u>([\s\S]*?)<\/u>/gi;
  let last = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > last) {
      nodes.push(
        <span key={`t${key++}`}>{text.slice(last, m.index)}</span>
      );
    }
    nodes.push(
      <u key={`u${key++}`} className="qg-print-u">
        {m[1]}
      </u>
    );
    last = m.index + m[0].length;
  }
  if (last < text.length) {
    nodes.push(<span key={`t${key++}`}>{text.slice(last)}</span>);
  }
  return nodes.length > 0 ? nodes : [text];
}

/**
 * 지문 조각을 문단별 <p>로 그린다. range가 있으면 그 조각만(단을 넘겨 이어지는 긴 지문).
 * 조각마다 data-qg-u를 달아 쪽 나눔 측정에서 조각 단위로 잘라 볼 수 있게 한다.
 * 같은 문단의 조각은 한 칸 띄워 이어 붙이므로 쪼개지 않은 문단은 예전과 똑같이 보인다.
 */
function PassageUnits({
  units,
  range,
  marked = true,
  pClass = "qg-print-passage-p",
}: {
  units: PrintUnit[];
  range?: { from: number; to: number };
  /** <u>…</u>를 밑줄로 그린다(개수형 지문·해설은 글자 그대로). */
  marked?: boolean;
  pClass?: string;
}) {
  const from = range?.from ?? 0;
  const to = range?.to ?? units.length;
  const paras: { para: number; items: { index: number; text: string; lead: boolean }[] }[] = [];
  for (let i = from; i < to; i++) {
    const u = units[i];
    if (!u) continue;
    const lead = i > 0 && units[i - 1]?.para === u.para;
    const last = paras[paras.length - 1];
    if (last && last.para === u.para) last.items.push({ index: i, text: u.text, lead });
    else paras.push({ para: u.para, items: [{ index: i, text: u.text, lead }] });
  }
  return (
    <>
      {paras.map((p) => (
        <p key={p.para} className={pClass} data-qg-para="">
          {p.items.map((it) => (
            <span key={it.index} data-qg-u={it.index}>
              {it.lead ? " " : null}
              {marked ? renderMarkedText(it.text) : it.text}
            </span>
          ))}
        </p>
      ))}
    </>
  );
}

function PassageParas({
  units,
  range,
}: {
  units: PrintUnit[];
  range?: { from: number; to: number };
}) {
  if (units.length === 0) return null;
  return (
    <div className="qg-print-passage qg-print-passage-block">
      <PassageUnits units={units} range={range} />
    </div>
  );
}

function WordOrderBoxes({
  blocks,
}: {
  blocks: NonNullable<ReturnType<typeof parseWordOrderBlocks>>;
}) {
  return (
    <div className="qg-print-word-order">
      <div className="qg-print-wo-box">
        <p className="qg-print-wo-label">&lt;조건&gt;</p>
        <div className="qg-print-wo-body">
          {blocks.conditions.split(/\n+/).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
      <div className="qg-print-wo-box">
        <p className="qg-print-wo-label">
          &lt;보기&gt;
          {blocks.allowExtraWords ? (
            <span className="qg-print-wo-hint"> · 없는 단어 추가 가능</span>
          ) : null}
        </p>
        <div className="qg-print-wo-body qg-print-wo-words">
          {blocks.words}
        </div>
      </div>
      <div className="qg-print-wo-box">
        <p className="qg-print-wo-label">&lt;해석&gt;</p>
        <div className="qg-print-wo-body">{blocks.translation}</div>
      </div>
      <p className="qg-print-wo-answer-line">
        ⓐ : _______________________________________________
      </p>
    </div>
  );
}

function SummaryWritingBoxes({
  blocks,
}: {
  blocks: NonNullable<ReturnType<typeof parseSummaryWritingBlocks>>;
}) {
  const labels =
    blocks.blankLabels.length > 0 ? blocks.blankLabels : ["ⓐ", "ⓑ"];
  return (
    <div className="qg-print-word-order">
      <div className="qg-print-wo-box">
        <p className="qg-print-wo-label">&lt;조건&gt;</p>
        <div className="qg-print-wo-body">
          {blocks.conditions.split(/\n+/).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
      {blocks.words != null && blocks.words.trim() ? (
        <div className="qg-print-wo-box">
          <p className="qg-print-wo-label">&lt;보기&gt;</p>
          <div className="qg-print-wo-body qg-print-wo-words">
            {blocks.words}
          </div>
        </div>
      ) : null}
      <div className="qg-print-wo-box">
        <p className="qg-print-wo-label">&lt;요약문&gt;</p>
        <div className="qg-print-wo-body qg-print-wo-summary">
          {blocks.summary}
        </div>
      </div>
      {labels.map((lab) => (
        <p key={lab} className="qg-print-wo-answer-line">
          {lab} : _______________________________________________
        </p>
      ))}
    </div>
  );
}

function GrammarCorrectionBoxes({
  blocks,
}: {
  blocks: NonNullable<ReturnType<typeof parseGrammarCorrectionBlocks>>;
}) {
  const rows = Array.from({ length: blocks.rowCount }, (_, i) => i);
  return (
    <div className="qg-print-word-order">
      <div className="qg-print-wo-box">
        <p className="qg-print-wo-label">&lt;조건&gt;</p>
        <div className="qg-print-wo-body">
          {blocks.conditions.split(/\n+/).map((line, i) => (
            <p key={i}>{line}</p>
          ))}
        </div>
      </div>
      <table className="qg-print-fix-table">
        <thead>
          <tr>
            <th>어법상 틀린 곳의 기호</th>
            <th>바르게 고친 것</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((i) => (
            <tr key={i}>
              <td>&nbsp;</td>
              <td>&nbsp;</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** 쪼갠 문항 부분에 붙이는 카드 class와 지문 범위. 끝 부분이 아니면 아래 구분선을 뺀다. */
function pieceProps(part: PrintPiecePart | undefined) {
  return {
    cardClass: part && !part.last ? " qg-print-card-cont" : "",
    range: part ? { from: part.from, to: part.to } : undefined,
    head: !part || part.first,
    tail: !part || part.last,
  };
}

function QuestionBlock({
  q,
  index,
  part,
}: {
  q: QuestionRow;
  index: number;
  /** 한 단보다 긴 문항을 나눠 실을 때 이 부분(없으면 문항 전체). */
  part?: PrintPiecePart;
}) {
  const { cardClass, range, head, tail } = pieceProps(part);
  const isCount = q.question_type === "content_count";
  const isInsertion = q.question_type === "sentence_insertion";
  const isIrrelevant = q.question_type === "irrelevant_sentence";
  const summaryWriting = parseSummaryWritingBlocks(q.question_text);
  const wordOrder = summaryWriting
    ? null
    : parseWordOrderBlocks(q.question_text);
  const grammarFix =
    summaryWriting || wordOrder
      ? null
      : parseGrammarCorrectionBlocks(q.question_text);
  const referenceAnswer =
    summaryWriting || wordOrder || grammarFix
      ? null
      : parseReferenceAnswerBlock(q.question_text);
  const extra =
    summaryWriting || wordOrder || referenceAnswer || grammarFix
      ? ""
      : cleanQuestionText(q.question_text);
  const passage = questionPassage(q);
  const bogiLines = isCount ? parseBogiLines(q.question_text) : [];
  const showChoices =
    !isCount &&
    !isInsertion &&
    !isIrrelevant &&
    !wordOrder &&
    !summaryWriting &&
    !referenceAnswer &&
    !grammarFix &&
    q.choices &&
    q.choices.length > 0 &&
    q.choices.some((c) => String(c.text ?? "").trim().length > 0);

  // 지문 조각(쪽 나눔 측정과 쪼갠 문항이 같은 조각을 쓴다)
  const units = splitPrintUnits(reflowPassageForPrint(passage));

  if (isCount) {
    return (
      <section className={`qg-print-card qg-print-count-card${cardClass}`}>
        {head ? (
          <p className="qg-print-q-head" data-qg-head="">
            <span className="qg-print-q-num qg-print-count-num">
              {padNo(index)}
            </span>{" "}
            {q.instruction}
          </p>
        ) : null}
        {units.length > 0 && (
          <div className="qg-print-count-box qg-print-passage-block">
            <PassageUnits units={units} range={range} marked={false} />
          </div>
        )}
        {tail ? (
          <div data-qg-tail="">
            <p className="qg-print-bogi-label">&lt;보기&gt;</p>
            <div className="qg-print-count-box qg-print-bogi-box">
              {bogiLines.map((line, i) => (
                <p key={i} className="qg-print-bogi-line">
                  {line}
                </p>
              ))}
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  return (
    <section className={`qg-print-card${cardClass}`}>
      {head ? (
        <div data-qg-head="">
          <p className="qg-print-q-head">
            <span className="qg-print-q-num">{padNo(index)}</span> {q.instruction}
          </p>
          {isInsertion && extra ? (
            <div className="qg-print-given-box">{extra}</div>
          ) : null}
        </div>
      ) : null}
      <PassageParas units={units} range={range} />
      {tail ? (
      <div data-qg-tail="">
      {summaryWriting ? (
        <SummaryWritingBoxes blocks={summaryWriting} />
      ) : null}
      {wordOrder ? <WordOrderBoxes blocks={wordOrder} /> : null}
      {grammarFix ? <GrammarCorrectionBoxes blocks={grammarFix} /> : null}
      {referenceAnswer
        ? referenceAnswer.labels.map((lab) => (
            <p key={lab} className="qg-print-wo-answer-line">
              {lab} : _______________________________________________
            </p>
          ))
        : null}
      {!isInsertion &&
      !wordOrder &&
      !summaryWriting &&
      !referenceAnswer &&
      !grammarFix &&
      extra ? (
        <p className="qg-print-extra">{extra}</p>
      ) : null}
      {showChoices && (
        <ul className="qg-print-choices">
          {q.choices!.map((c) => (
            <li key={c.number}>
              <span className="qg-print-choice-mark">
                {CIRCLED[c.number - 1] ?? `${c.number}.`}
              </span>
              {c.text.trim() ? <span>{c.text}</span> : null}
            </li>
          ))}
        </ul>
      )}
      </div>
      ) : null}
    </section>
  );
}

function AnswerBlock({
  q,
  index,
  part,
}: {
  q: QuestionRow;
  index: number;
  part?: PrintPiecePart;
}) {
  const { cardClass, range, head, tail } = pieceProps(part);
  // 해설이 한 단보다 길면 문장 단위로 나눠 다음 단에 잇는다.
  // (white-space: normal이라 줄바꿈은 원래도 한 칸으로 보였다)
  const explanation = String(q.explanation ?? "").replace(/\s+/g, " ").trim();
  const units = splitPrintUnits(explanation ? [explanation] : []);
  const hardWords = questionNeedsVocabGloss({
    choices: q.choices,
    questionType: q.question_type,
    optionKey: q.option_key,
    questionText: q.question_text,
    choiceLanguage: q.choice_language,
  })
    ? parseHardWordsColumn(q.hard_words)
    : [];
  return (
    <section className={`qg-print-card qg-print-answer-card${cardClass}`}>
      {head ? (
        <p className="qg-print-answer-head" data-qg-head="">
          <span className="qg-print-q-num">{padNo(index)}</span>{" "}
          <span className="qg-print-answer-mark">
            {formatAnswer(q.correct_answer)}
          </span>
        </p>
      ) : null}
      {units.length > 0 ? (
        <PassageUnits
          units={units}
          range={range}
          marked={false}
          pClass="qg-print-answer-body"
        />
      ) : (
        <p className="qg-print-answer-body" />
      )}
      {tail && hardWords.length > 0 ? (
        <div className="qg-print-hard-words" data-qg-tail="">
          <p className="qg-print-hard-words-label">보기 단어</p>
          <ul className="qg-print-hard-words-list">
            {hardWords.map((w) => (
              <li key={`${w.word}-${w.meaning}`}>
                <span className="qg-print-hw-en">{w.word}</span>
                <span className="qg-print-hw-ko">{w.meaning}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

/** 꼬리말 오른쪽 기본값: 자료 이름(정답지는 뒤에 "정답"). */
function defaultFooterRight(title: string, mode: "exam" | "answers"): string {
  const name = title.trim() || "영어 변형문제";
  return mode === "answers" ? `${name} · 정답` : name;
}

/**
 * 머리말·꼬리말 저장 위치. 학원 이름·로고는 학원마다(한 브라우저로 여러 학원에 들어가도 다른
 * 학원 이름이 남지 않게), 제목·출처·꼬리말은 자료마다 저장한다.
 */
function brandingKey(scope: { academy: string } | { jobId: string }): string {
  return "jobId" in scope
    ? `${BRANDING_STORAGE_KEY}:${scope.jobId}`
    : `${BRANDING_STORAGE_KEY}:academy:${scope.academy}`;
}

function loadStoredBranding(
  scope: { academy: string } | { jobId: string }
): Partial<PrintBranding> | null {
  try {
    const raw = localStorage.getItem(brandingKey(scope));
    if (!raw) return null;
    return JSON.parse(raw) as Partial<PrintBranding>;
  } catch {
    return null;
  }
}

export function QuestionPrintView({
  jobId,
  backHref,
  printBaseHref,
  mode = "exam",
  layout: layoutProp = "mixed",
  academyName = ACADEMY_NAME,
  logoSrc = LOGO_SRC,
  embedded = false,
}: {
  jobId: string;
  /** ← 뒤로: 내 자료 목록 */
  backHref: string;
  /** 문제지/해설지 전환용 (…/generations/{id}) */
  printBaseHref: string;
  mode?: "exam" | "answers";
  layout?: PrintLayoutMode;
  /** 학원별 인쇄 브랜딩 */
  academyName?: string;
  logoSrc?: string;
  /** 최종통합자료 안에 쪽만 끼워 넣는다(설정 창 없이). */
  embedded?: boolean;
}) {
  const [title, setTitle] = useState("영어 변형문제");
  const [grade, setGrade] = useState("");
  const [sourceDetail, setSourceDetail] = useState("");
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [printLayout, setPrintLayout] = useState<PrintLayoutMode>(layoutProp);
  const [vocabSetId, setVocabSetId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pages, setPages] = useState<SheetPage[]>([]);
  const [branding, setBranding] = useState<PrintBranding>({
    headerKicker: academyName,
    headerTitle: "",
    headerSub: "",
    footerLeft: academyName,
    footerRight: "영어 변형문제",
    showLogo: true,
  });
  const [brandingReady, setBrandingReady] = useState(false);
  const measureRef = useRef<HTMLDivElement>(null);
  const [designStyle, setDesignStyle] = useState<QuestionDesignStyle>("base");
  useEffect(() => {
    try {
      const saved = window.localStorage.getItem(DESIGN_STYLE_KEY);
      if (saved === "base" || saved === "a" || saved === "b" || saved === "c") setDesignStyle(saved);
    } catch {
      /* 저장소를 못 쓰면 기본값 */
    }
  }, []);
  const chooseDesignStyle = (style: QuestionDesignStyle) => {
    setDesignStyle(style);
    try {
      window.localStorage.setItem(DESIGN_STYLE_KEY, style);
    } catch {
      /* 무시 */
    }
  };
  /*
   * 모양을 바꾸면 글꼴이 늦게 들어와 글자 폭이 달라진다. 쪽 나눔은 잰 높이로 하므로
   * 글꼴이 다 들어온 뒤 한 번 더 잰다(안 그러면 쪽이 넘쳐 아래가 잘린다).
   */
  const [fontsTick, setFontsTick] = useState(0);
  useEffect(() => {
    if (designStyle === "base" || typeof document === "undefined" || !document.fonts) return;
    let alive = true;
    const bump = () => alive && setFontsTick((t) => t + 1);
    void document.fonts.ready.then(bump);
    document.fonts.addEventListener?.("loadingdone", bump);
    return () => {
      alive = false;
      document.fonts.removeEventListener?.("loadingdone", bump);
    };
  }, [designStyle]);

  const load = useCallback(async () => {
    const res = await fetch(`/api/question-generator/jobs/${jobId}`);
    const data = await res.json();
    if (!data.ok) {
      setError(data.message ?? "불러오기 실패");
      return;
    }
    const job = data.job;
    const nextTitle =
      job?.request_config?.title ||
      job?.english_source_passages?.title ||
      "영어 변형문제";
    const nextGrade =
      job?.request_config?.grade || job?.english_source_passages?.grade || "";
    const nextDetail =
      job?.request_config?.sourceDetail ||
      job?.english_source_passages?.source_detail ||
      "";
    setTitle(nextTitle);
    setGrade(nextGrade);
    setSourceDetail(nextDetail);
    setQuestions(data.questions ?? []);
    setVocabSetId(
      typeof job?.vocab_set_id === "string" ? job.vocab_set_id : null
    );

    // 보기 단어장 동기화 (QR용 vocab_set_id 확보)
    if ((data.questions ?? []).length > 0) {
      try {
        const vr = await fetch(
          `/api/question-generator/jobs/${jobId}/exam-vocab`,
          { method: "POST" }
        );
        const vd = (await vr.json()) as {
          ok?: boolean;
          vocabSetId?: string | null;
        };
        if (vd.ok && vd.vocabSetId) {
          setVocabSetId(vd.vocabSetId);
        }
      } catch {
        /* ignore */
      }
    }

    setBranding((prev) => {
      const shared =
        typeof window !== "undefined" ? loadStoredBranding({ academy: academyName }) : null;
      const own = typeof window !== "undefined" ? loadStoredBranding({ jobId }) : null;
      return {
        headerKicker:
          shared?.headerKicker ??
          prev.headerKicker ??
          `${academyName}${nextGrade ? ` · ${nextGrade}` : ""}`,
        headerTitle: own?.headerTitle || nextTitle,
        headerSub: own?.headerSub ?? nextDetail,
        footerLeft: shared?.footerLeft ?? academyName,
        footerRight: own?.footerRight ?? defaultFooterRight(nextTitle, mode),
        showLogo: shared?.showLogo ?? true,
      };
    });
    setBrandingReady(true);
  }, [jobId, mode, academyName]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!brandingReady) return;
    try {
      // 학원 이름·로고는 이 학원의 모든 자료에 같게, 제목·출처·꼬리말은 이 자료에만 저장한다.
      // 예전에는 전부 브라우저에 한 벌이라, 고친 제목이 다음 자료에, 한 학원 이름이 다른
      // 학원 계정의 머리말에 그대로 붙었다.
      const { headerKicker, footerLeft, showLogo, headerTitle, headerSub, footerRight } = branding;
      localStorage.setItem(
        brandingKey({ academy: academyName }),
        JSON.stringify({ headerKicker, footerLeft, showLogo })
      );
      localStorage.setItem(
        brandingKey({ jobId }),
        JSON.stringify({ headerTitle, headerSub, footerRight })
      );
    } catch {
      /* ignore */
    }
  }, [branding, brandingReady, jobId, academyName]);

  const bannerNo = extractBannerNo(sourceDetail);
  const sheetTitle =
    branding.headerTitle ||
    (mode === "answers" ? `${title} · 해설지` : title);

  const displayItems: DisplayItem[] = useMemo(() => {
    if (questions.length === 0) return [];
    if (printLayout !== "byType") {
      return questions.map((q, i) => ({
        kind: "q" as const,
        id: q.id,
        q,
        num: i + 1,
      }));
    }
    const groups = groupQuestionsByPrintType(questions);
    const items: DisplayItem[] = [];
    let num = 1;
    for (const g of groups) {
      for (const q of g.items) {
        items.push({ kind: "q", id: q.id, q, num });
        num++;
      }
    }
    return items;
  }, [questions, printLayout]);

  /** 유형별: 각 유형 구간 [start, end) — 새 페이지 강제용 */
  const typeRanges = useMemo(() => {
    if (printLayout !== "byType" || questions.length === 0) return [];
    const groups = groupQuestionsByPrintType(questions);
    const ranges: { start: number; end: number; label: string }[] = [];
    let start = 0;
    for (const g of groups) {
      const end = start + g.items.length;
      ranges.push({ start, end, label: g.label });
      start = end;
    }
    return ranges;
  }, [questions, printLayout]);

  useEffect(() => {
    if (displayItems.length === 0) {
      setPages([]);
      return;
    }

    const run = () => {
      const root = measureRef.current;
      if (!root) return;
      // offsetHeight로 잰다. getBoundingClientRect는 화면 배율(CSS zoom)이 곱해진 값이라,
      // 최종통합자료 미리보기(60%) 안에서는 문항이 실제보다 작게 재어져 한 쪽에 너무 많이
      // 담기고 인쇄에서 아래가 잘렸다.
      const heights = displayItems.map((item) => {
        const el = root.querySelector<HTMLElement>(
          `[data-measure-q="${item.id}"]`
        );
        return el ? el.offsetHeight + 1 : 40;
      });

      const mmToPx = (mm: number) => (mm * 96) / 25.4;
      const firstColMax = mmToPx(232);
      const nextColMax = mmToPx(240);

      /**
       * 한 단보다 긴 문항의 부분 높이: 측정용 문항을 복제해 머리·꼬리·지문 조각을 덜어 낸 뒤 잰다.
       * 실제 쪽의 부분(QuestionBlock part)과 같은 모양이 되게 덜어 낸다.
       */
      const measureEls = displayItems.map((item) =>
        root.querySelector<HTMLElement>(`[data-measure-q="${item.id}"]`)
      );
      const unitCount = (i: number) =>
        measureEls[i]?.querySelectorAll("[data-qg-u]").length ?? 0;
      const measurePart = (i: number, from: number, to: number, first: boolean, last: boolean) => {
        const src = measureEls[i];
        if (!src) return Infinity;
        const clone = src.cloneNode(true) as HTMLElement;
        clone.removeAttribute("data-measure-q");
        if (!first) clone.querySelectorAll("[data-qg-head]").forEach((el) => el.remove());
        if (!last) {
          clone.querySelectorAll("[data-qg-tail]").forEach((el) => el.remove());
          clone.querySelector(".qg-print-card")?.classList.add("qg-print-card-cont");
        }
        clone.querySelectorAll<HTMLElement>("[data-qg-u]").forEach((el) => {
          const u = Number(el.dataset.qgU);
          if (u < from || u >= to) el.remove();
        });
        clone.querySelectorAll("[data-qg-para]").forEach((p) => {
          if (!p.querySelector("[data-qg-u]")) p.remove();
        });
        root.appendChild(clone);
        const h = clone.offsetHeight + 1;
        clone.remove();
        return h;
      };
      const split = {
        unitCount,
        fit: (i: number, from: number, first: boolean, maxPx: number) => {
          const n = unitCount(i);
          const whole = measurePart(i, from, n, first, true);
          if (whole <= maxPx) return { to: n, height: whole };
          // 끝 부분(보기·선택지 포함)이 다 들어가지 않으면 지문만 들어가는 만큼 싣는다.
          let lo = from + 1;
          let hi = n - 1;
          if (lo > hi) return { to: from, height: 0 };
          const firstH = measurePart(i, from, lo, first, false);
          if (firstH > maxPx) return { to: from, height: 0 };
          let best = { to: lo, height: firstH };
          while (lo < hi) {
            const mid = Math.floor((lo + hi + 1) / 2);
            const h = measurePart(i, from, mid, first, false);
            if (h <= maxPx) {
              best = { to: mid, height: h };
              lo = mid;
            } else {
              hi = mid - 1;
            }
          }
          return best;
        },
      };
      const paginate = (slice: number[], offset: number, firstColumnMaxPx: number) =>
        paginatePrintPieces(
          slice,
          {
            firstColumnMaxPx,
            nextColumnMaxPx: nextColMax,
            questionGapPx: QUESTION_GAP_PX,
            columnSafetyPx: COLUMN_SAFETY_PX,
            // 이미 문항이 있는 단에 1/3도 안 남았으면 긴 문항은 다음 단에서 시작한다.
            minStartPx: nextColMax / 3,
          },
          {
            unitCount: (i) => split.unitCount(i + offset),
            fit: (i, from, first, maxPx) => split.fit(i + offset, from, first, maxPx),
          }
        )
          .filter((p) => p.left.length > 0 || p.right.length > 0)
          .map((p) => {
            const shift = (list: PrintPiece[]) =>
              list.map((piece) => ({ ...piece, item: piece.item + offset }));
            return { left: shift(p.left), right: shift(p.right) };
          });

      if (printLayout === "byType" && typeRanges.length > 0) {
        const all: SheetPage[] = [];
        const bannerReservePx = mmToPx(8); // 유형 소제목 배너
        let isDocFirstSection = true;
        for (const range of typeRanges) {
          if (range.end <= range.start) continue;
          const slice = heights.slice(range.start, range.end);
          const layouts = paginate(
            slice,
            range.start,
            (isDocFirstSection ? firstColMax : nextColMax) - bannerReservePx
          );
          layouts.forEach((layout, i) => {
            all.push({
              sectionLabel: i === 0 ? range.label : undefined,
              left: layout.left,
              right: layout.right,
            });
          });
          isDocFirstSection = false;
        }
        setPages(all);
        return;
      }

      setPages(paginate(heights, 0, firstColMax));
    };

    const t = window.setTimeout(run, 50);
    void document.fonts?.ready?.then(() => {
      window.setTimeout(run, 30);
    });
    return () => window.clearTimeout(t);
  }, [
    displayItems,
    mode,
    branding.headerTitle,
    branding.headerSub,
    printLayout,
    typeRanges,
    designStyle,
    fontsTick,
  ]);

  function runPrint() {
    const prev = document.title;
    document.title = sheetTitle;
    // 레이아웃·폰트 반영 후 인쇄 (빈 미리보기 방지)
    requestAnimationFrame(() => {
      window.setTimeout(() => {
        window.print();
        window.setTimeout(() => {
          document.title = prev;
        }, 500);
      }, 50);
    });
  }

  function patchBranding(patch: Partial<PrintBranding>) {
    setBranding((prev) => ({ ...prev, ...patch }));
  }

  function resetBranding() {
    setBranding({
      headerKicker: `${academyName}${grade ? ` · ${grade}` : ""}`,
      headerTitle: title,
      headerSub: sourceDetail,
      footerLeft: academyName,
      footerRight: defaultFooterRight(title, mode),
      showLogo: true,
    });
  }

  function renderHeader(compact: boolean, pageIdx: number, totalPages: number) {
    const showVocabQr =
      mode === "exam" &&
      !compact &&
      pageIdx === 0 &&
      questions.length > 0;
    return (
      <header
        className={`qg-print-header ${compact ? "qg-print-header-compact" : ""} ${
          mode === "answers" ? "qg-print-header-answer-sheet" : ""
        } ${showVocabQr ? "qg-print-header-with-qr" : ""}`}
      >
        <div className="qg-print-header-main">
          {branding.showLogo && logoSrc && (
            <div className="qg-print-logo-box">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={logoSrc}
                alt={academyName}
                className="qg-print-logo-img"
              />
            </div>
          )}
          <div className="qg-print-header-text">
            {branding.headerKicker && (
              <p className="qg-print-kicker">{branding.headerKicker}</p>
            )}
            {!compact && branding.headerTitle && (
              <h1 className="qg-print-title">{branding.headerTitle}</h1>
            )}
            {!compact && branding.headerSub && (
              <p className="qg-print-sub">{branding.headerSub}</p>
            )}
            {bannerNo && !compact && mode === "exam" && (
              <p className="qg-print-banner">┃3월 {bannerNo}번┃</p>
            )}
            {compact && branding.headerTitle && (
              <p className="qg-print-title qg-print-title-sm">
                {branding.headerTitle}
              </p>
            )}
          </div>
        </div>
        <div className="qg-print-header-aside">
          <div className="qg-print-header-aside-row">
            <div className="qg-print-header-aside-meta">
              <p className="qg-print-meta">
                {questions.length}문항{" "}
                <span className="qg-print-page-no">
                  {pageIdx + 1}/{totalPages}
                </span>
              </p>
            </div>
            {showVocabQr ? (
              <div className="qg-print-vocab-qr">
                <ListeningPrintQrCode
                  url={
                    vocabSetId
                      ? buildExamVocabUrl(vocabSetId)
                      : buildExamVocabUrlForJob(jobId)
                  }
                  sizePx={88}
                />
                <p className="qg-print-vocab-qr-label">
                  보기 단어
                  <br />
                  학습 QR
                </p>
              </div>
            ) : null}
          </div>
        </div>
      </header>
    );
  }

  function renderFooter(pageIdx: number) {
    return (
      <footer className="qg-print-footer">
        <div className="qg-print-footer-left">
          {branding.showLogo && logoSrc && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={logoSrc}
              alt=""
              className="qg-print-footer-logo"
            />
          )}
          <span>{branding.footerLeft || academyName}</span>
        </div>
        <span className="qg-print-footer-page">- {pageIdx + 1} -</span>
        <span className="qg-print-footer-right">
          {branding.footerRight || "영어 변형문제"}
        </span>
      </footer>
    );
  }

  if (error) return <p className="p-6 text-red-600">{error}</p>;

  const sheetPages =
    pages.length > 0
      ? pages
      : displayItems.length > 0
        ? [
            {
              left: displayItems.map((_, i): PrintPiece => ({ item: i })),
              right: [] as PrintPiece[],
            },
          ]
        : [];

  function renderDisplayItem(item: DisplayItem | undefined, part?: PrintPiecePart) {
    if (!item) return null;
    return mode === "exam" ? (
      <QuestionBlock q={item.q} index={item.num} part={part} />
    ) : (
      <AnswerBlock q={item.q} index={item.num} part={part} />
    );
  }

  function renderPiece(piece: PrintPiece) {
    const item = displayItems[piece.item];
    return (
      <div key={`${item?.id ?? piece.item}:${piece.part?.from ?? "all"}`}>
        {renderDisplayItem(item, piece.part)}
      </div>
    );
  }

  /** 측정 영역과 인쇄 쪽들. 최종통합자료에 끼워 넣을 때(embedded)도 같은 모양을 쓴다. */
  const printBody = (
    <>
          {designStyle !== "base" ? <link rel="stylesheet" href={DESIGN_FONTS_HREF} /> : null}
          <div
            ref={measureRef}
            aria-hidden
            className={`qg-print-measure font-print no-print ${designClass(designStyle)}`}
            style={{ width: `${COL_WIDTH_MM}mm` }}
          >
            {displayItems.map((item) => (
              <div key={item.id} data-measure-q={item.id}>
                {renderDisplayItem(item)}
              </div>
            ))}
          </div>

          <div
            id="qg-print-root"
            className={`max-w-[210mm] px-4 py-6 print:mx-0 print:max-w-none print:px-0 print:py-0 ${designClass(designStyle)}`}
          >
            {sheetPages.map((page, pageIdx) => (
              <article
                key={pageIdx}
                className={`qg-print-page qg-print-sheet ${
                  pageIdx < sheetPages.length - 1
                    ? "qg-print-page-break"
                    : "qg-print-page-last"
                }`}
              >
                {renderHeader(pageIdx > 0, pageIdx, sheetPages.length)}
                {page.sectionLabel ? (
                  <div className="qg-print-type-banner">
                    <p className="qg-print-type-banner-title">
                      {page.sectionLabel}
                    </p>
                  </div>
                ) : null}
                <div className="qg-print-cols">
                  <div className="qg-print-col">
                    {page.left.map(renderPiece)}
                  </div>
                  <div className="qg-print-col qg-print-col-right">
                    {page.right.map(renderPiece)}
                  </div>
                </div>
                {renderFooter(pageIdx)}
              </article>
            ))}
          </div>
    </>
  );

  if (embedded) return <div className="relative">{printBody}</div>;

  return (
    <div className="qg-print-app min-h-screen bg-slate-200 print:min-h-0 print:bg-white">
      <div className="flex min-h-screen print:block print:min-h-0">
        <aside className="no-print sticky top-0 flex h-screen w-[min(100%,320px)] shrink-0 flex-col gap-3 overflow-y-auto border-r border-slate-200 bg-white p-4 shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Link
              href={backHref}
              className="text-sm text-slate-700 hover:underline"
            >
              ← 뒤로
            </Link>
            <Button type="button" onClick={runPrint}>
              PDF 저장 / 인쇄
            </Button>
          </div>

          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              보기 전환
            </p>
            <Link
              href={`${printBaseHref}/print?mode=exam${printLayout === "byType" ? "&layout=byType" : ""}`}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                mode === "exam"
                  ? "bg-brand-700 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              문제지
            </Link>
            <Link
              href={`${printBaseHref}/print?mode=answers`}
              className={`rounded-lg px-3 py-2 text-xs font-semibold ${
                mode === "answers"
                  ? "bg-brand-700 text-white"
                  : "border border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
              }`}
            >
              해설지
            </Link>
          </div>

          {mode === "exam" && (
            <div className="flex flex-col gap-1.5">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
                출력 방식
              </p>
              <button
                type="button"
                className={`rounded-lg px-3 py-2 text-left text-xs font-semibold ${
                  printLayout === "mixed"
                    ? "bg-brand-700 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
                onClick={() => setPrintLayout("mixed")}
              >
                종합해서 출력
              </button>
              <button
                type="button"
                className={`rounded-lg px-3 py-2 text-left text-xs font-semibold ${
                  printLayout === "byType"
                    ? "bg-brand-700 text-white"
                    : "border border-slate-200 bg-white text-slate-700"
                }`}
                onClick={() => setPrintLayout("byType")}
              >
                유형별 출력
              </button>
            </div>
          )}

          <div className="flex flex-col gap-1.5">
            <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">
              시험지 모양
            </p>
            <div className="grid grid-cols-4 gap-1 rounded-lg bg-slate-100 p-1">
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

          <div className="rounded-xl border border-slate-200 bg-slate-50 p-3">
            <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs font-semibold text-slate-700">
                머릿말 · 꼬릿말
              </p>
              <button
                type="button"
                className="text-xs text-brand-700 hover:underline"
                onClick={resetBranding}
              >
                기본값으로
              </button>
            </div>
            <div className="grid gap-2">
              <label className="block text-xs text-slate-600">
                머릿말 상단
                <input
                  className="ui-input mt-1 py-1.5 text-sm"
                  value={branding.headerKicker}
                  onChange={(e) =>
                    patchBranding({ headerKicker: e.target.value })
                  }
                  placeholder={academyName}
                />
              </label>
              <label className="block text-xs text-slate-600">
                머릿말 제목
                <input
                  className="ui-input mt-1 py-1.5 text-sm"
                  value={branding.headerTitle}
                  onChange={(e) =>
                    patchBranding({ headerTitle: e.target.value })
                  }
                  placeholder="자료 제목"
                />
              </label>
              <label className="block text-xs text-slate-600">
                머릿말 부제
                <input
                  className="ui-input mt-1 py-1.5 text-sm"
                  value={branding.headerSub}
                  onChange={(e) => patchBranding({ headerSub: e.target.value })}
                  placeholder="출처·설명"
                />
              </label>
              <label className="block text-xs text-slate-600">
                꼬릿말 왼쪽
                <input
                  className="ui-input mt-1 py-1.5 text-sm"
                  value={branding.footerLeft}
                  onChange={(e) =>
                    patchBranding({ footerLeft: e.target.value })
                  }
                  placeholder={academyName}
                />
              </label>
              <label className="block text-xs text-slate-600">
                꼬릿말 오른쪽
                <input
                  className="ui-input mt-1 py-1.5 text-sm"
                  value={branding.footerRight}
                  onChange={(e) =>
                    patchBranding({ footerRight: e.target.value })
                  }
                  placeholder="영어 변형문제"
                />
              </label>
            </div>
            <label className="mt-2 flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={branding.showLogo}
                onChange={(e) => patchBranding({ showLogo: e.target.checked })}
              />
              학원 로고 표시
            </label>
          </div>
        </aside>

        <div className="min-w-0 flex-1">
          {printBody}
        </div>
      </div>
    </div>
  );
}
