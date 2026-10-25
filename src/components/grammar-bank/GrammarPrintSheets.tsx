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

/** 단계별 배점 — 내신 기출형에서 발문 뒤에 적는다 */
const POINTS: Record<number, number> = { 1: 3, 2: 4, 3: 5 };

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
type Page = { left: Block[]; right: Block[]; sheet: Sheet; wide?: boolean; withKey?: boolean };

/** 2026-10-25 새 서식(내신 기출형·포인트 라벨형·서술 연습형)인지 */
function isNewStyle(style: GrammarSheetStyle) {
  return style === "a" || style === "b" || style === "c";
}

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

function tierOf(q: GrammarQuestion) {
  return q.tier ?? 2;
}

function pad2(n: number) {
  return String(n).padStart(2, "0");
}

/** 보기 길이에 따라 한 줄에 몇 개를 놓을지 — 짧으면 가로로 늘어놓는다 */
function choiceColumns(q: GrammarQuestion) {
  const longest = Math.max(...q.choices.map((c) => c.text.length));
  // 3칸은 한 칸이 좁아 13자 넘는 보기(who are holding 등)가 두 줄로 꺾인다
  return longest <= 8 ? 5 : longest <= 12 ? 3 : longest <= 26 ? 2 : 1;
}

/** 서술 연습형의 단어 칸 수 — 정답 단어 수만큼, 대안 표기 [ ] 는 뺀다 */
function blankCount(q: GrammarQuestion) {
  const first = (q.answer ?? "").split(/\s*\/\s*/)[0] ?? "";
  const n = first.replace(/\[.*?\]/g, "").split(/\s+/).filter(Boolean).length;
  return Math.min(12, Math.max(1, n));
}

function hasKorean(s: string) {
  return /[가-힣]/.test(s);
}

function QuestionCard({
  q,
  no,
  style,
  measuring,
}: {
  q: GrammarQuestion;
  no: number;
  style: GrammarSheetStyle;
  measuring?: boolean;
}) {
  const written = isWritten(q);
  if (!isNewStyle(style)) {
    return (
      <section className="gb-q" data-gb-card={measuring ? "" : undefined}>
        <p className="gb-q-head">
          <span className="gb-no">{no}</span>
          <span className="gb-ask">
            {withUnderlines(q.prompt)}
            {written ? <span className="gb-tag">서술형</span> : null}
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

  const tier = tierOf(q);
  const arrow = /영작|배열|완성/.test(q.prompt) ? "=" : "→";
  return (
    <section className="gb-q" data-gb-card={measuring ? "" : undefined}>
      {style === "a" && (written || tier === 3) ? (
        <p className="gb-bds">
          {written ? <i className="gb-bd gb-bd--w">서술형</i> : null}
          {tier === 3 ? <i className="gb-bd gb-bd--h">고난도</i> : null}
        </p>
      ) : null}
      {style === "b" ? (
        <p className="gb-lab">
          {q.unit ? <span className="gb-lab-unit">{q.unit}</span> : null}
          <span className={`gb-lab-tier gb-lab-tier--${tier}`}>{tier}단계</span>
          {written ? <span className="gb-lab-wr">서술형</span> : null}
        </p>
      ) : null}
      <p className="gb-q-head">
        <span className="gb-no">{style === "b" ? pad2(no) : no}</span>
        <span className="gb-ask">
          {withUnderlines(q.prompt)}
          {style === "a" ? <em className="gb-pt">({POINTS[tier] ?? 4}점)</em> : null}
        </span>
      </p>
      {q.body.length > 0 ? (
        <div className="gb-body">
          {q.body.map((line, i) => (
            <p key={i} className={style === "c" ? (hasKorean(line) ? "gb-ko" : "gb-en") : undefined}>
              {withUnderlines(line)}
            </p>
          ))}
        </div>
      ) : null}
      {q.choices.length > 0 ? (
        <p className={`gb-ch gb-ch--${choiceColumns(q)}`}>
          {q.choices.map((c) => (
            <span key={c.no}>
              {CIRCLED[c.no - 1] ?? `${c.no}.`} {withUnderlines(c.text)}
            </span>
          ))}
        </p>
      ) : style === "c" ? (
        <p className="gb-blanks">
          {Array.from({ length: blankCount(q) }, (_, i) => (
            <i key={i} />
          ))}
        </p>
      ) : (
        <p className="gb-write-line">
          <span>{arrow}</span>
          <i />
        </p>
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
  style,
  measuring,
}: {
  q: GrammarQuestion;
  no: number;
  style: GrammarSheetStyle;
  measuring?: boolean;
}) {
  return (
    <div className="gb-why-row" data-gb-card={measuring ? "" : undefined}>
      <span className="gb-ans-no">{style === "b" ? pad2(no) : no}</span>
      <span className="gb-why-text">
        {style === "b" && q.unit ? <span className="gb-why-unit">{q.unit}</span> : null}
        <b>{q.answer ?? ""}</b>
        {q.explanation ? <span>{withUnderlines(q.explanation)}</span> : null}
      </span>
    </div>
  );
}

/** 정답 모아 쓰기 — 내신 기출형은 음영 상자, 포인트 라벨형은 격자표 */
function AnswerKey({
  questions,
  style,
  measuring,
}: {
  questions: GrammarQuestion[];
  style: GrammarSheetStyle;
  measuring?: boolean;
}) {
  if (style === "b") {
    const rows: GrammarQuestion[][] = [];
    for (let i = 0; i < questions.length; i += 12) rows.push(questions.slice(i, i + 12));
    return (
      <table className="gb-key-table" data-gb-key={measuring ? "" : undefined}>
        <tbody>
          {rows.map((row, r) => (
            <Fragment key={r}>
              <tr>
                {row.map((_, i) => (
                  <th key={i}>{pad2(r * 12 + i + 1)}</th>
                ))}
              </tr>
              <tr>
                {row.map((q, i) => (
                  <td key={i}>
                    {isWritten(q) ? <i>서술</i> : q.answer ?? ""}
                  </td>
                ))}
              </tr>
            </Fragment>
          ))}
        </tbody>
      </table>
    );
  }
  const mcq = questions.map((q, i) => [i + 1, q] as const).filter(([, q]) => !isWritten(q));
  const written = questions.map((q, i) => [i + 1, q] as const).filter(([, q]) => isWritten(q));
  return (
    <div className="gb-key" data-gb-key={measuring ? "" : undefined}>
      <p className="gb-key-title">정답</p>
      {mcq.length > 0 ? (
        <p className="gb-key-mcq">
          {mcq.map(([n, q]) => (
            <span key={n}>
              <b>{pad2(n)}</b> {q.answer ?? ""}
            </span>
          ))}
        </p>
      ) : null}
      {written.length > 0 ? (
        <div className="gb-key-written">
          {written.map(([n, q]) => (
            <p key={n}>
              <b>{pad2(n)}</b> {withUnderlines(q.answer ?? "")}
            </p>
          ))}
        </div>
      ) : null}
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

  const style = options.style;
  const fresh = isNewStyle(style);
  const oneColumn = style === "c";
  // 새 서식의 정답은 한 덩이로 모아 쓴다(음영 상자·격자표). 서술 연습형은 줄 목록 그대로.
  const useKey = fresh && style !== "c" && options.withAnswers;

  const answerQuestions = useMemo(() => {
    if (!options.withAnswers) return [];
    // 해설지가 답을 함께 적으므로, 서술 연습형은 둘 다 켜면 해설지만 뽑는다
    if (style === "c" && options.withExplanations) return [];
    if (useKey) return [];
    return questions;
  }, [questions, options.withAnswers, options.withExplanations, style, useKey]);
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
    const keyEl = root.querySelector<HTMLElement>("[data-gb-key]");
    const keyH = keyEl ? keyEl.offsetHeight + parseFloat(getComputedStyle(keyEl).marginBottom || "0") : 0;
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
      firstLimit: number,
      firstFlag?: Partial<Page>,
    ): Page[] {
      const out: Page[] = [];
      let page: Page = { left: [], right: [], sheet, wide: oneColumn || undefined, ...firstFlag };
      let column: "left" | "right" = "left";
      let used = 0;
      let limit = firstLimit;
      // 한 단에 담기지 않는 긴 문항은 쪽 너비로 눕혀 따로 모은다
      let long: Page | null = null;
      let longUsed = 0;

      const pushPage = () => {
        out.push(page);
        page = { left: [], right: [], sheet, wide: oneColumn || undefined };
        column = "left";
        used = 0;
        limit = base;
      };
      const closeLong = () => {
        if (long) out.push(long);
        long = null;
        longUsed = 0;
      };

      heights.forEach((narrowH, i) => {
        const block = { key: `${kind}-${i}`, kind, index: i } as Block;
        const h = oneColumn ? (wides[i] ?? narrowH) : narrowH;
        if (!oneColumn && h > limit) {
          // 단 하나로는 못 담는다 — 쪽 너비로 눕히면 높이가 절반쯤으로 준다.
          // 그냥 얹으면 쪽 밖으로 넘쳐 인쇄에서 잘려 나간다.
          if (page.left.length > 0 || page.right.length > 0 || page.withKey) pushPage();
          const tall = wides[i] ?? h;
          if (long && longUsed + tall > base) closeLong();
          if (!long) long = { left: [], right: [], sheet, wide: true };
          long.left.push(block);
          longUsed += tall;
          return;
        }
        closeLong();
        if ((used > 0 || page.withKey) && used + h > limit) {
          if (column === "left" && !oneColumn) {
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
      if (page.left.length > 0 || page.right.length > 0 || page.withKey) out.push(page);
      return out;
    }

    const sheetPages = fill(qHeights, qWide, "q", "q", firstPage);
    const answerPages =
      answerQuestions.length > 0 ? fill(aHeights, aWide, "a", "a", base) : [];
    let whyPages: Page[] = [];
    if (useKey && keyH > 0) {
      // 정답 상자를 해설지 첫 쪽 위에 얹는다. 해설이 없으면 정답 상자만 한 쪽.
      const room = base - keyH;
      if (whyQuestions.length > 0 && room > base * 0.25) {
        whyPages = fill(eHeights, eWide, "e", "e", room, { withKey: true });
      } else {
        whyPages = [
          { left: [], right: [], sheet: "a", withKey: true },
          ...(whyQuestions.length > 0 ? fill(eHeights, eWide, "e", "e", base) : []),
        ];
      }
    } else if (whyQuestions.length > 0) {
      whyPages = fill(eHeights, eWide, "e", "e", base);
    }
    setPages([...sheetPages, ...answerPages, ...whyPages]);
  }, [
    questions,
    answerQuestions,
    whyQuestions,
    options.showName,
    options.style,
    options.title,
    options.subtitle,
    options.timeLimit,
    oneColumn,
    useKey,
  ]);

  if (questions.length === 0) return null;

  const SHEET_NAME: Record<Sheet, string> = { q: "", a: " · 정답", e: " · 해설" };
  const SHEET_KICK: Record<Sheet, string> = { q: "", a: "정답", e: "정답 및 해설" };
  const kicker = options.subtitle || "중학 문법";

  const header = (page: number, total: number, sheet: Sheet) => {
    if (style === "a") {
      return (
        <header className="gb-head gb-band" data-gb-head="">
          <svg className="gb-band-blob" viewBox="0 0 300 60" preserveAspectRatio="none" aria-hidden>
            <path d="M0 60 C60 0 120 70 180 20 C220 -10 260 20 300 0 L300 60 Z" />
          </svg>
          <div className="gb-band-main">
            <p className="gb-kicker">{sheet === "q" ? kicker : SHEET_KICK[sheet]}</p>
            <h1 className="gb-title">{options.title || "중학 문법"}</h1>
          </div>
          <p className="gb-band-aside">
            {sheet === "q" ? (
              <>
                <b>{questions.length}</b>문항 · {page} / {total}
              </>
            ) : (
              <>
                {page} / {total}
              </>
            )}
          </p>
        </header>
      );
    }
    if (style === "b") {
      const grid = sheet === "q" && page === 1 && options.showName;
      return (
        <header className="gb-head" data-gb-head="">
          <div className="gb-head-main">
            <p className="gb-kicker">{sheet === "q" ? kicker : SHEET_KICK[sheet]}</p>
            <h1 className="gb-title">{options.title || "중학 문법"}</h1>
          </div>
          {grid ? (
            <table className="gb-grid">
              <tbody>
                <tr>
                  <th>반</th>
                  <th>이름</th>
                  <th>점수</th>
                </tr>
                <tr>
                  <td />
                  <td />
                  <td />
                </tr>
              </tbody>
            </table>
          ) : (
            <div className="gb-head-aside">
              <div>
                <b>{questions.length}</b>문항
              </div>
              <div>
                {options.timeLimit && sheet === "q" ? `${options.timeLimit} · ` : ""}
                {page} / {total}
              </div>
            </div>
          )}
        </header>
      );
    }
    if (style === "c") {
      return (
        <header className="gb-head" data-gb-head="">
          <div className="gb-band">
            <span className="gb-band-tab">{sheet === "q" ? "실전문제" : SHEET_KICK[sheet]}</span>
            <span className="gb-band-unit">{sheet === "q" ? kicker : "Answers & Explanations"}</span>
          </div>
          <p className="gb-c-title">
            <span>{options.title || "중학 문법"}</span>
            {sheet === "q" && page === 1 && options.showName ? (
              <span className="gb-c-name">
                이름 <i />
              </span>
            ) : (
              <span className="gb-c-page">
                {page} / {total}
              </span>
            )}
          </p>
        </header>
      );
    }
    return (
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
  };

  // 이름줄 — 내신 기출형은 날짜·제한 시간까지 한 줄, 라벨형·연습형은 머리글 안에 든다
  const nameRow =
    style === "a" ? (
      <div className="gb-name gb-info" data-gb-name="">
        <span>
          <b>날짜</b> 　월 　일
        </span>
        {options.timeLimit ? (
          <span>
            <b>제한 시간</b> {options.timeLimit}
          </span>
        ) : null}
        <span>
          <b>반</b> <i className="gb-ln gb-ln--s" />
        </span>
        <span>
          <b>이름</b> <i className="gb-ln" />
        </span>
        <span>
          <b>점수</b> <i className="gb-ln gb-ln--s" />
          /100점
        </span>
      </div>
    ) : style === "b" || style === "c" ? null : (
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

  const footer = (page: number, sheet: Sheet) => {
    if (style === "a" || style === "c") {
      return (
        <footer className="gb-foot" data-gb-foot="">
          <b className="gb-foot-page">{page}</b>
          {style === "c" ? <span className="gb-foot-logo">{options.academyName}</span> : null}
          <span className="gb-foot-right">
            {style === "a" ? `${options.academyName} · ` : ""}
            {options.title}
            {SHEET_NAME[sheet]}
          </span>
        </footer>
      );
    }
    if (style === "b") {
      return (
        <footer className="gb-foot" data-gb-foot="">
          <span>
            {options.title}
            {SHEET_NAME[sheet]}
          </span>
          <b className="gb-foot-page">{page}</b>
          <span className="gb-foot-right">{options.academyName}</span>
        </footer>
      );
    }
    return (
      <footer className="gb-foot" data-gb-foot="">
        <span>{options.academyName}</span>
        <span className="gb-foot-page">- {page} -</span>
        <span className="gb-foot-right">
          {options.title}
          {SHEET_NAME[sheet]}
        </span>
      </footer>
    );
  };

  // 해설지의 번호는 시험지의 문항 번호를 그대로 쓴다 — 해설이 달린 것만 추렸으므로
  // 자리로 세면 11번 해설이 3번으로 나와 선생님이 못 맞춰 본다.
  const whyNo = new Map(whyQuestions.map((q, i) => [i, questions.findIndex((x) => x.id === q.id) + 1]));

  const renderBlock = (block: Block) =>
    block.kind === "q" ? (
      <QuestionCard
        key={block.key}
        q={questions[block.index]}
        no={block.index + 1}
        style={style}
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
        style={style}
      />
    );

  const total = pages?.length ?? 1;

  return (
    <>
      {/* 쪽 나누기를 재는 숨은 틀 */}
      <div
        ref={measureRef}
        className={`gb-measure gb-sheet gb-sheet--${style}`}
        aria-hidden
      >
        {header(1, 1, "q")}
        {nameRow}
        <div style={{ width: COL_W }}>
          {questions.map((q, i) => (
            <QuestionCard key={`m-${q.id}`} q={q} no={i + 1} style={style} measuring />
          ))}
          {answerQuestions.map((q, i) => (
            <AnswerRow key={`ma-${q.id}`} q={q} no={i + 1} measuring />
          ))}
          {whyQuestions.map((q, i) => (
            <WhyRow key={`me-${q.id}`} q={q} no={i + 1} style={style} measuring />
          ))}
        </div>
        {/* 같은 문항을 쪽 너비로도 재 둔다 — 단 하나에 안 담기는 긴 문항을 눕히려면 필요하다 */}
        <div style={{ width: FULL_W }}>
          {questions.map((q, i) => (
            <QuestionCard key={`w-${q.id}`} q={q} no={i + 1} style={style} measuring />
          ))}
          {answerQuestions.map((q, i) => (
            <AnswerRow key={`wa-${q.id}`} q={q} no={i + 1} measuring />
          ))}
          {whyQuestions.map((q, i) => (
            <WhyRow key={`we-${q.id}`} q={q} no={i + 1} style={style} measuring />
          ))}
          {useKey ? <AnswerKey questions={questions} style={style} measuring /> : null}
        </div>
        {footer(1, "q")}
      </div>

      <div id="grammar-print-root">
        {(pages ?? []).map((page, i) => (
          <div key={i} className={`gb-sheet gb-sheet--${style}`}>
            {header(i + 1, total, page.sheet)}
            {options.showName && i === 0 && page.sheet === "q" ? nameRow : null}
            {page.withKey ? <AnswerKey questions={questions} style={style} /> : null}
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
