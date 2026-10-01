"use client";

import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import type { GrammarQuestion, GrammarSheetStyle } from "@/lib/grammar-bank/types";

const MM = 96 / 25.4; // 1mm = 3.78px
const SHEET_INNER_H = (296 - 11 - 8) * MM; // 쪽 안쪽 높이
const COLS_PAD_TOP = 3.6 * MM;
const COL_W = 85 * MM; // 오른쪽 단(좁은 쪽)에 맞춰 잰다
const FULL_W = 186 * MM; // 단을 가르지 않고 쪽 너비로 눕힐 때
const SLACK = 2 * MM;

const CIRCLED = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩"];

export type GrammarPrintOptions = {
  style: GrammarSheetStyle;
  title: string;
  subtitle: string;
  academyName: string;
  showName: boolean;
  timeLimit: string;
  withAnswers: boolean;
  withExplanations: boolean;
};

type Block = { key: string; kind: "q" | "a" | "e"; index: number };
type Sheet = "q" | "a" | "e";
type Page = { left: Block[]; right: Block[]; sheet: Sheet; wide?: boolean };

/** 본문 속 [[ ]] 는 밑줄 친 부분 */
function withUnderlines(line: string) {
  const parts = line.split(/(\[\[.*?\]\])/g);
  return parts.map((part, i) =>
    part.startsWith("[[") && part.endsWith("]]") ? (
      <u key={i}>{part.slice(2, -2)}</u>
    ) : (
      <Fragment key={i}>{part}</Fragment>
    ),
  );
}

function isWritten(q: GrammarQuestion) {
  return !q.choices || q.choices.length === 0;
}

function QuestionCard({
  q,
  no,
  measuring,
}: {
  q: GrammarQuestion;
  no: number;
  measuring?: boolean;
}) {
  return (
    <section className="gb-q" data-gb-card={measuring ? "" : undefined}>
      <p className="gb-q-head">
        <span className="gb-no">{no}</span>
        <span className="gb-ask">
          {withUnderlines(q.prompt)}
          {isWritten(q) ? <span className="gb-tag">서술형</span> : null}
        </span>
      </p>
      {q.body.length > 0 ? (
        <div className="gb-body">
          {q.body.map((line, i) => (
            <p key={i}>{withUnderlines(line)}</p>
          ))}
        </div>
      ) : null}
      {q.choices.length > 0 ? (
        <p className="gb-ch">
          {q.choices.map((c) => (
            <span key={c.no}>
              {CIRCLED[c.no - 1] ?? `${c.no}.`} {withUnderlines(c.text)}
            </span>
          ))}
        </p>
      ) : (
        <div className="gb-write" />
      )}
    </section>
  );
}

function AnswerRow({
  q,
  no,
  measuring,
}: {
  q: GrammarQuestion;
  no: number;
  measuring?: boolean;
}) {
  const written = isWritten(q);
  return (
    <div className="gb-ans-row" data-gb-card={measuring ? "" : undefined}>
      <span className="gb-ans-no">{no}</span>
      {written ? (
        <span className="gb-ans-text">{q.answer ?? ""}</span>
      ) : (
        <span className="gb-ans-mark">{q.answer ?? ""}</span>
      )}
    </div>
  );
}

/** 해설지 — 정답지는 답만 담으므로, 풀이는 따로 뽑는다 */
function WhyRow({
  q,
  no,
  measuring,
}: {
  q: GrammarQuestion;
  no: number;
  measuring?: boolean;
}) {
  return (
    <div className="gb-why-row" data-gb-card={measuring ? "" : undefined}>
      <span className="gb-ans-no">{no}</span>
      <span className="gb-why-text">
        <b>{q.answer ?? ""}</b>
        {q.explanation ? <span>{withUnderlines(q.explanation)}</span> : null}
      </span>
    </div>
  );
}

export function GrammarPrintSheets({
  questions,
  options,
}: {
  questions: GrammarQuestion[];
  options: GrammarPrintOptions;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<Page[] | null>(null);

  const answerQuestions = useMemo(
    () => (options.withAnswers ? questions : []),
    [questions, options.withAnswers],
  );
  // 해설이 달린 문항만 해설지에 올린다 — 빈 줄만 늘어놓으면 쪽만 먹는다
  const whyQuestions = useMemo(
    () => (options.withExplanations ? questions.filter((q) => q.explanation) : []),
    [questions, options.withExplanations],
  );

  useEffect(() => {
    const root = measureRef.current;
    if (!root || questions.length === 0) {
      setPages(null);
      return;
    }
    const headH = root.querySelector<HTMLElement>("[data-gb-head]")?.offsetHeight ?? 0;
    const nameH = options.showName
      ? (root.querySelector<HTMLElement>("[data-gb-name]")?.offsetHeight ?? 0)
      : 0;
    const footH = root.querySelector<HTMLElement>("[data-gb-foot]")?.offsetHeight ?? 0;
    const cards = [...root.querySelectorAll<HTMLElement>("[data-gb-card]")];

    // 문항 사이 여백까지 재야 한다. offsetHeight 는 아래 여백을 빼고 세므로,
    // 그것만 믿으면 문항 수만큼 조금씩 모자라 마지막 문항이 쪽 밖으로 넘친다.
    const takes = (el: HTMLElement) =>
      el.offsetHeight + parseFloat(getComputedStyle(el).marginBottom || "0");
    const half = cards.length / 2;   // 앞의 절반은 단 너비, 뒤의 절반은 쪽 너비로 잰 것
    const narrow = cards.slice(0, half).map(takes);
    const wide = cards.slice(half).map(takes);

    const qHeights = narrow.slice(0, questions.length);
    const aHeights = narrow.slice(questions.length, questions.length + answerQuestions.length);
    const eHeights = narrow.slice(questions.length + answerQuestions.length);
    const qWide = wide.slice(0, questions.length);
    const aWide = wide.slice(questions.length, questions.length + answerQuestions.length);
    const eWide = wide.slice(questions.length + answerQuestions.length);

    const base = SHEET_INNER_H - headH - footH - COLS_PAD_TOP - SLACK;
    const firstPage = base - nameH;

    function fill(
      heights: number[],
      wides: number[],
      kind: Sheet,
      sheet: Sheet,
      startsFirst: boolean,
    ): Page[] {
      const out: Page[] = [];
      let page: Page = { left: [], right: [], sheet };
      let column: "left" | "right" = "left";
      let used = 0;
      let limit = startsFirst ? firstPage : base;
      // 한 단에 담기지 않는 긴 문항은 쪽 너비로 눕혀 따로 모은다
      let long: Page | null = null;
      let longUsed = 0;

      const pushPage = () => {
        out.push(page);
        page = { left: [], right: [], sheet };
        column = "left";
        used = 0;
        limit = base;
      };
      const closeLong = () => {
        if (long) out.push(long);
        long = null;
        longUsed = 0;
      };

      heights.forEach((h, i) => {
        const block = { key: `${kind}-${i}`, kind, index: i } as Block;
        if (h > limit) {
          // 단 하나로는 못 담는다 — 쪽 너비로 눕히면 높이가 절반쯤으로 준다.
          // 그냥 얹으면 쪽 밖으로 넘쳐 인쇄에서 잘려 나간다.
          if (page.left.length > 0 || page.right.length > 0) pushPage();
          const tall = wides[i] ?? h;
          if (long && longUsed + tall > base) closeLong();
          if (!long) long = { left: [], right: [], sheet, wide: true };
          long.left.push(block);
          longUsed += tall;
          return;
        }
        closeLong();
        if (used > 0 && used + h > limit) {
          if (column === "left") {
            column = "right";
            used = 0;
          } else {
            pushPage();
          }
        }
        page[column].push(block);
        used += h;
      });
      closeLong();
      if (page.left.length > 0 || page.right.length > 0) out.push(page);
      return out;
    }

    const sheetPages = fill(qHeights, qWide, "q", "q", true);
    const answerPages =
      answerQuestions.length > 0 ? fill(aHeights, aWide, "a", "a", false) : [];
    const whyPages =
      whyQuestions.length > 0 ? fill(eHeights, eWide, "e", "e", false) : [];
    setPages([...sheetPages, ...answerPages, ...whyPages]);
  }, [
    questions,
    answerQuestions,
    whyQuestions,
    options.showName,
    options.style,
    options.title,
  ]);

  if (questions.length === 0) return null;

  const SHEET_NAME: Record<Sheet, string> = { q: "", a: " · 정답", e: " · 해설" };

  const header = (page: number, total: number, sheet: Sheet) => (
    <header className="gb-head" data-gb-head="">
      <div className="gb-head-main">
        <p className="gb-kicker">
          {options.academyName} · 중학 문법{SHEET_NAME[sheet]}
        </p>
        <h1 className="gb-title">{options.title || "중학 문법"}</h1>
        {options.subtitle ? <p className="gb-sub">{options.subtitle}</p> : null}
      </div>
      <div className="gb-head-aside">
        <div>
          <b>{questions.length}</b>문항
        </div>
        <div>
          {options.timeLimit && sheet === "q" ? `${options.timeLimit} · ` : ""}
          {page} / {total}
        </div>
      </div>
    </header>
  );

  const nameRow = (
    <div className="gb-name" data-gb-name="">
      <span>
        반 <i style={{ width: "16mm" }} />
      </span>
      <span>
        이름 <i style={{ width: "26mm" }} />
      </span>
      <span>
        점수 <i style={{ width: "16mm" }} />
      </span>
    </div>
  );

  const footer = (page: number, sheet: Sheet) => (
    <footer className="gb-foot" data-gb-foot="">
      <span>{options.academyName}</span>
      <span className="gb-foot-page">- {page} -</span>
      <span className="gb-foot-right">
        {options.title}
        {SHEET_NAME[sheet]}
      </span>
    </footer>
  );

  // 해설지의 번호는 시험지의 문항 번호를 그대로 쓴다 — 해설이 달린 것만 추렸으므로
  // 자리로 세면 11번 해설이 3번으로 나와 선생님이 못 맞춰 본다.
  const whyNo = new Map(whyQuestions.map((q, i) => [i, questions.findIndex((x) => x.id === q.id) + 1]));

  const renderBlock = (block: Block) =>
    block.kind === "q" ? (
      <QuestionCard
        key={block.key}
        q={questions[block.index]}
        no={block.index + 1}
      />
    ) : block.kind === "a" ? (
      <AnswerRow
        key={block.key}
        q={answerQuestions[block.index]}
        no={block.index + 1}
      />
    ) : (
      <WhyRow
        key={block.key}
        q={whyQuestions[block.index]}
        no={whyNo.get(block.index) ?? block.index + 1}
      />
    );

  const total = pages?.length ?? 1;

  return (
    <>
      {/* 쪽 나누기를 재는 숨은 틀 */}
      <div
        ref={measureRef}
        className={`gb-measure gb-sheet gb-sheet--${options.style}`}
        aria-hidden
      >
        {header(1, 1, "q")}
        {nameRow}
        <div style={{ width: COL_W }}>
          {questions.map((q, i) => (
            <QuestionCard key={`m-${q.id}`} q={q} no={i + 1} measuring />
          ))}
          {answerQuestions.map((q, i) => (
            <AnswerRow key={`ma-${q.id}`} q={q} no={i + 1} measuring />
          ))}
          {whyQuestions.map((q, i) => (
            <WhyRow key={`me-${q.id}`} q={q} no={i + 1} measuring />
          ))}
        </div>
        {/* 같은 문항을 쪽 너비로도 재 둔다 — 단 하나에 안 담기는 긴 문항을 눕히려면 필요하다 */}
        <div style={{ width: FULL_W }}>
          {questions.map((q, i) => (
            <QuestionCard key={`w-${q.id}`} q={q} no={i + 1} measuring />
          ))}
          {answerQuestions.map((q, i) => (
            <AnswerRow key={`wa-${q.id}`} q={q} no={i + 1} measuring />
          ))}
          {whyQuestions.map((q, i) => (
            <WhyRow key={`we-${q.id}`} q={q} no={i + 1} measuring />
          ))}
        </div>
        {footer(1, "q")}
      </div>

      <div id="grammar-print-root">
        {(pages ?? []).map((page, i) => (
          <div key={i} className={`gb-sheet gb-sheet--${options.style}`}>
            {header(i + 1, total, page.sheet)}
            {options.showName && i === 0 && page.sheet === "q" ? nameRow : null}
            {page.wide ? (
              <div className="gb-cols gb-cols--wide">
                <div className="gb-col">{page.left.map(renderBlock)}</div>
              </div>
            ) : (
              <div className="gb-cols">
                <div className="gb-col">{page.left.map(renderBlock)}</div>
                <div className="gb-col gb-col--right">
                  {page.right.map(renderBlock)}
                </div>
              </div>
            )}
            {footer(i + 1, page.sheet)}
          </div>
        ))}
      </div>
    </>
  );
}
