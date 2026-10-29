"use client";

import { Fragment, type ReactNode } from "react";
import type { MsQuestion } from "@/lib/middle-school/queries";
import { DocHead, PagedSheet, type Block } from "@/components/lesson-materials/test-book/TestBookSheets";

/*
 * 중학교 문제 은행 시험지 — 족보닷컴 예상문제를 그대로, 수업자료 테스트지와 같은 디자인(tb-*)으로 그린다.
 */

const CIRC = "①②③④⑤⑥⑦⑧";

/** 글 안의 <u>…</u> 밑줄과 <blank/> 빈칸, 줄바꿈 */
export function Rich({ text }: { text: string }) {
  const parts = text.split(/(<u>.*?<\/u>|<blank\/>|\n)/g);
  return (
    <>
      {parts.map((p, i) => {
        if (p === "<blank/>") return <span key={i} className="tb-blank" style={{ minWidth: "28mm" }} />;
        if (p === "\n") return <br key={i} />;
        const u = p.match(/^<u>(.*)<\/u>$/);
        if (u) return <u key={i}>{u[1]}</u>;
        return <Fragment key={i}>{p}</Fragment>;
      })}
    </>
  );
}

function sameGroup(a: MsQuestion | undefined, b: MsQuestion): boolean {
  return !!a && !!a.groupLines && !!b.groupLines && a.groupLines.join("\n") === b.groupLines.join("\n");
}

export function MsQuestionSheets({
  questions,
  title,
  sub,
  right,
  measureKey,
}: {
  questions: MsQuestion[];
  title: string;
  sub: string;
  right: string;
  measureKey: string;
}) {
  const blocks: Block[] = [];
  questions.forEach((q, i) => {
    const n = i + 1;
    const parts: ReactNode[] = [];
    // 같은 지문을 쓰는 문항이 이어지면 지문은 처음에만
    if (q.groupLines?.length && !sameGroup(questions[i - 1], q)) {
      let last = n;
      while (last < questions.length && sameGroup(questions[last - 1], questions[last])) last++;
      parts.push(
        <div key="g" className="tb-q" style={{ marginTop: "1mm" }}>
          {last > n ? `[${n}~${last}] ` : ""}
          {q.groupLead ?? "다음 글을 읽고 물음에 답하시오."}
        </div>,
        <p key="gl" className="tb-psg tb-en">
          {q.groupLines.map((l, k) => (
            <Fragment key={k}>
              {k ? <br /> : null}
              <Rich text={l} />
            </Fragment>
          ))}
        </p>,
      );
    }
    parts.push(
      <div key="s" className="tb-q" style={{ fontWeight: 600 }}>
        <span className="tb-qn">{n}</span>
        <Rich text={q.stem} />
      </div>,
    );
    if (q.body.length) {
      parts.push(
        <div key="b" className="tb-box tb-en" style={{ display: "block", lineHeight: 1.65 }}>
          {q.body.map((l, k) => (
            <div key={k}>
              <Rich text={l} />
            </div>
          ))}
        </div>,
      );
    }
    if (q.choices.length) {
      const short = q.choices.every((c) => c.text.length <= 18 && !c.text.includes("\n"));
      parts.push(
        <div
          key="c"
          className="tb-en"
          style={{ display: "grid", gridTemplateColumns: short ? "repeat(3, 1fr)" : "1fr", gap: "0.6mm 4mm", margin: "1.2mm 0 0 2mm", fontSize: "9.6pt" }}
        >
          {q.choices.map((c) => (
            <div key={c.no} style={{ display: "flex", gap: "1.5mm" }}>
              <span>{CIRC[c.no - 1]}</span>
              <span>
                <Rich text={c.text} />
              </span>
            </div>
          ))}
        </div>,
      );
    } else if (!q.body.some((b) => b.includes("<blank/>"))) {
      parts.push(<div key="l" className="tb-line" />, <div key="l2" className="tb-line" />);
    }
    blocks.push({ key: `q${q.id}`, node: <div className="tb-b" style={{ marginBottom: "3.5mm" }}>{parts}</div> });
  });
  return (
    <PagedSheet
      blocks={blocks}
      measureKey={measureKey}
      head={(page) => <DocHead title={title} sub={page > 0 ? "(이어서)" : sub} label="EXAM" right={right} />}
    />
  );
}

export function MsQuestionAnswerSheets({
  questions,
  explanation,
  title,
  measureKey,
}: {
  questions: MsQuestion[];
  explanation: boolean;
  title: string;
  measureKey: string;
}) {
  const ans = (q: MsQuestion) =>
    q.kind === "mc" ? q.answer.split(/\s*,\s*/).map((x) => CIRC[Number(x) - 1] ?? x).join(", ") : q.answer;
  const blocks: Block[] = explanation
    ? questions.map((q, i) => ({
        key: `a${q.id}`,
        node: (
          <div className="tb-ss" style={{ alignItems: "baseline" }}>
            <span className="tb-i" style={{ fontWeight: 700 }}>{i + 1}</span>
            <div>
              <div className="tb-en" style={{ fontWeight: 700 }}>{ans(q)}</div>
              {q.explanation ? <div className="tb-ko">{q.explanation}</div> : null}
            </div>
          </div>
        ),
      }))
    : // 한 덩어리는 쪽을 넘지 못한다 — 40문항씩 끊는다
      Array.from({ length: Math.ceil(questions.length / 40) }, (_, k) => ({
        key: `grid${k}`,
        node: (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1.2mm 8mm", fontSize: "9.4pt", marginBottom: "1.2mm" }}>
            {questions.slice(k * 40, k * 40 + 40).map((q, j) => (
              <div key={q.id} className="tb-en" style={{ display: "flex", gap: "2mm", borderBottom: "0.5pt solid #e3e6eb", padding: "0.8mm 0" }}>
                <b style={{ minWidth: "7mm" }}>{k * 40 + j + 1}.</b>
                <span>{ans(q)}</span>
              </div>
            ))}
          </div>
        ),
      }));
  return <PagedSheet blocks={blocks} measureKey={measureKey} head={(page) => <DocHead title={title} sub={page > 0 ? "(이어서)" : ""} label="ANSWERS" />} />;
}
