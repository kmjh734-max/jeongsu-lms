"use client";

import {
  Fragment,
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  circledHangul,
  circledLetter,
  circledNumber,
  referenceMark,
  splitSentenceForSummary,
  splitSummaryByKeywords,
  stripMarkup,
  type OnePageChoiceBlock,
  type OnePageContent,
  type OnePageRun,
  type OnePageTestPassage,
} from "@/lib/lesson-materials/one-page";

/**
 * 1장 요약직보자료·1장 테스트 인쇄 쪽. 지문 하나가 A4 한 쪽에 들어가도록 글자 크기를 줄여 맞추고
 * (FitSheet), 가장 작게 줄여도 넘치면 자르지 않고 다음 쪽으로 이어지게 둔다. 크기는 모두 em이라
 * 쪽의 글자 크기 하나만 바꾸면 전체가 함께 줄어든다. 최종통합자료에도 그대로 끼워 넣으므로
 * 스타일은 인쇄 루트 id가 아니라 op- 클래스에 건다.
 */

const A4_W_MM = 210;
const A4_H_MM = 297;
const PAD_Y_MM = 10;
const PAD_X_MM = 11;

export const ONE_PAGE_CSS = `
.op-sheet{position:relative;box-sizing:border-box;width:${A4_W_MM}mm;height:${A4_H_MM}mm;padding:${PAD_Y_MM}mm ${PAD_X_MM}mm;background:#fff;color:#111827;overflow:hidden;-webkit-print-color-adjust:exact;print-color-adjust:exact}
.op-sheet--grow{height:auto;min-height:${A4_H_MM}mm;overflow:visible;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.op-body{line-height:1.45;word-break:keep-all;overflow-wrap:break-word}
.op-en{font-family:"Times New Roman",Georgia,"Noto Serif",serif}
.op-sans{font-family:ui-sans-serif,system-ui,sans-serif}
.op-head{display:flex;align-items:center;gap:.75em;padding:.5em .9em;border:1px solid #e3dcf7;background:#f6f3fe;border-radius:.75em}
.op-head .op-no{font-size:2em;font-weight:900;color:#6b4fd3;line-height:1;font-variant-numeric:tabular-nums}
.op-head h1{flex:1;min-width:0;margin:0;font-size:1.4em;font-weight:800;line-height:1.25}
.op-head .op-src{font-size:.8em;color:#6b7280;white-space:nowrap}
.op-head img{height:2.4em;width:auto;max-width:30mm;object-fit:contain}
.op-meta{margin:.65em 0 0;display:grid;grid-template-columns:auto 1fr;column-gap:.7em;row-gap:.3em}
.op-meta dt{font-weight:700;color:#9ca3af;white-space:nowrap}
.op-meta dt b{color:#6b4fd3;margin-right:.3em}
.op-meta dd{margin:0}
.op-just{text-align:justify}
.op-kw{font-weight:700;text-decoration:underline;text-underline-offset:.16em}
.op-ko{color:#4b5563;font-size:.86em;margin-top:.12em;line-height:1.4}
.op-h{display:flex;align-items:baseline;gap:.55em;margin:.85em 0 .4em;padding-bottom:.28em;border-bottom:1px solid #e5e7eb;font-size:1em;font-weight:700;color:#374151;break-after:avoid}
.op-h::before{content:"";align-self:stretch;width:3px;border-radius:2px;background:#7c6ae0}
.op-legend{margin-left:auto;font-weight:500;font-size:.8em;color:#6b7280}
.op-passage{text-align:justify;line-height:2.45;font-size:1.05em;margin:0}
.op-sn{font-family:ui-sans-serif,system-ui,sans-serif;font-size:.86em;color:#4b5563;margin-right:.18em}
ruby.op-voc{ruby-position:under;ruby-align:center;font-weight:700;white-space:nowrap}
ruby.op-voc rt{font-family:ui-sans-serif,system-ui,sans-serif;font-size:.5em;font-weight:500;color:#0f766e;line-height:1.1;letter-spacing:0}
.op-g{text-decoration:underline;text-decoration-color:#dc2626;text-decoration-thickness:1.4px;text-underline-offset:.2em}
.op-x{background:#e3ecff;border-radius:2px;-webkit-box-decoration-break:clone;box-decoration-break:clone}
.op-r{text-decoration:underline;text-decoration-style:dotted;text-decoration-color:#b45309;text-decoration-thickness:1.2px;text-underline-offset:.2em}
.op-gm,.op-xm,.op-rm{font-family:ui-sans-serif,system-ui,sans-serif;font-size:.74em;font-weight:700;vertical-align:.55em;line-height:0;margin-right:.08em}
.op-gm{color:#dc2626}.op-xm{color:#2563eb}.op-rm{color:#b45309}
.op-refs{margin:0;line-height:1.5;font-size:.92em;text-align:justify}
.op-refs .op-rsep{color:#d1d5db;margin:0 .35em}
.op-flow{display:flex;align-items:stretch;gap:.3em}
.op-fbox{flex:1 1 0;min-width:0;border:1px solid #e3dcf7;border-radius:.55em;padding:.4em .5em;text-align:center}
.op-fbox b{display:block;font-size:.92em;line-height:1.28}
.op-fbox span{display:block;font-size:.8em;color:#6b7280;margin-top:.15em;line-height:1.3}
.op-fbox--end{background:#f6f3fe;border-color:#c4b5fd}
.op-farr{align-self:center;color:#a78bfa;font-size:.9em}
.op-grid2{display:grid;grid-template-columns:1fr 1fr;column-gap:1.3em}
.op-list{margin:0;padding:0;list-style:none}
.op-list li{margin:.25em 0;line-height:1.42;font-size:.94em;padding-left:1.3em;text-indent:-1.3em}
.op-list .op-tag{display:inline-block;text-indent:0;font-size:.82em;font-weight:700;color:#6b4fd3;background:#f1edfd;border-radius:.3em;padding:0 .35em;margin:0 .3em}
.op-strike{color:#9ca3af;text-decoration:line-through}
.op-given{border:1px solid #cabff3;background:#f6f3fe;border-radius:.4em;padding:.35em .7em;margin:.15em 0 .4em}
.op-oitem{padding-left:2.1em;text-indent:-2.1em;margin:.28em 0;text-align:justify}
.op-oitem b{font-family:ui-sans-serif,system-ui,sans-serif;font-weight:800;margin-right:.3em}
.op-ansline{margin-top:.5em;color:#6b4fd3;font-weight:700;font-family:ui-sans-serif,system-ui,sans-serif}
.op-ansline i{display:inline-block;width:3.2em;border-bottom:1.3px solid #374151;margin:0 .35em;vertical-align:-.1em}
.op-blank{display:inline-block;border-bottom:1.2px solid #111827;margin:0 .25em;vertical-align:-.12em;height:1em}
.op-tf li{margin:.28em 0;padding-left:1.8em;text-indent:-1.8em}
.op-num{font-family:ui-sans-serif,system-ui,sans-serif;font-weight:700;color:#6b4fd3;margin-right:.3em}
.op-tfmark{font-family:ui-sans-serif,system-ui,sans-serif;color:#9ca3af;margin-left:.3em}
.op-two{display:grid;grid-template-columns:1fr 1fr;column-gap:1.5em;align-items:start}
.op-choice{text-align:justify;line-height:1.62;margin:0}
.op-choice sup{font-family:ui-sans-serif,system-ui,sans-serif;font-size:.68em;margin-right:.05em}
.op-choice b{font-weight:800;white-space:nowrap}
.op-w{margin-top:.5em;break-inside:avoid}
.op-w .op-chunks{font-family:ui-sans-serif,system-ui,sans-serif;font-weight:700;font-size:.95em;line-height:1.45;padding-left:1.35em;text-indent:-1.35em}
.op-w .op-wko{background:#f3f4f6;border-radius:.35em;padding:.22em .6em;margin:.25em 0 0 1.35em;font-size:.85em;color:#4b5563}
.op-w .op-wline{border-bottom:1.2px dashed #9ca3af;height:2.1em;margin-left:1.35em}
.op-ans{break-inside:avoid;border:1px solid #e5e7eb;border-radius:.5em;padding:.45em .8em;margin-bottom:.7em}
.op-ans h3{margin:0 0 .3em;font-size:1.02em;font-weight:800}
.op-ans h3 span{color:#6b4fd3;margin-right:.4em}
.op-arow{display:grid;grid-template-columns:6.2em 1fr;column-gap:.5em;margin:.14em 0;line-height:1.45}
.op-arow dt{font-weight:700;color:#6b7280}
.op-arow dd{margin:0}
.op-ai{display:inline-block;margin-right:1.1em;white-space:nowrap}
.op-ai b{font-family:ui-sans-serif,system-ui,sans-serif;color:#6b4fd3;margin-right:.3em}
.op-label{position:absolute;bottom:2mm;right:3mm;font-size:9px;color:#94a3b8}
@media print{.op-label{display:none}}
`;

// ---------------------------------------------------------------- 한 쪽 맞추기

// 선생님 요청: 분량이 많으면 억지로 줄이지 말고 두 쪽으로 넘긴다(읽을 수 있는 크기를 지킨다).
const FIT_MIN = 0.88;
/** 짧은 지문은 글자를 조금 키워 아래 빈 곳을 줄인다. */
const FIT_MAX = 1.12;

/**
 * A4 한 쪽. 쪽에 들어가는 가장 큰 글자 크기를 이분 탐색으로 찾는다(짧으면 조금 키우고 넘치면
 * 줄인다). 가장 작게 줄여도 넘치면 쪽 높이를 풀어(op-sheet--grow) 인쇄에서 다음 쪽으로
 * 이어진다. fitKey가 바뀌면 다시 잰다.
 */
export function FitSheet({
  baseFontPx,
  fitKey,
  label,
  isLast,
  children,
}: {
  baseFontPx: number;
  fitKey: string;
  label?: string;
  isLast?: boolean;
  children: ReactNode;
}) {
  const sheetRef = useRef<HTMLElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const [fit, setFit] = useState<{ scale: number; grow: boolean }>({ scale: 1, grow: false });

  const measure = useCallback(() => {
    const sheet = sheetRef.current;
    const body = bodyRef.current;
    if (!sheet || !body || sheet.offsetWidth === 0) return;
    const pxPerMm = sheet.offsetWidth / A4_W_MM;
    // 화면과 인쇄의 반올림 차이로 넘치지 않게 조금 남긴다.
    const avail = (A4_H_MM - PAD_Y_MM * 2) * pxPerMm * 0.985;
    const fits = (s: number) => {
      body.style.fontSize = `${baseFontPx * s}px`;
      return body.scrollHeight <= avail;
    };
    let scale = FIT_MAX;
    let grow = false;
    if (!fits(FIT_MAX)) {
      if (!fits(FIT_MIN)) {
        scale = FIT_MIN;
        grow = true;
      } else {
        let lo = FIT_MIN;
        let hi = FIT_MAX;
        for (let i = 0; i < 8; i++) {
          const mid = (lo + hi) / 2;
          if (fits(mid)) lo = mid;
          else hi = mid;
        }
        scale = Math.floor(lo * 1000) / 1000;
      }
    }
    body.style.fontSize = `${baseFontPx * scale}px`;
    setFit((prev) => (prev.scale === scale && prev.grow === grow ? prev : { scale, grow }));
  }, [baseFontPx]);

  useLayoutEffect(() => {
    measure();
  }, [measure, fitKey]);

  useEffect(() => {
    let alive = true;
    void document.fonts?.ready.then(() => {
      if (alive) measure();
    });
    return () => {
      alive = false;
    };
  }, [measure, fitKey]);

  return (
    <article
      ref={sheetRef}
      className={`op-sheet one-page-a4-sheet shadow-xl print:shadow-none ${fit.grow ? "op-sheet--grow" : ""} ${
        isLast ? "one-page-a4-sheet--last" : ""
      }`}
    >
      <div ref={bodyRef} className="op-body" style={{ fontSize: `${baseFontPx * fit.scale}px` }}>
        {children}
      </div>
      {label ? <span className="op-label">{label}</span> : null}
    </article>
  );
}

// ---------------------------------------------------------------- 1장 요약직보자료

export type OnePageSummaryInput = {
  id: string;
  title: string;
  titleEn: string | null;
  source: string | null;
  sentences: Array<{ english: string; korean: string }>;
  content: OnePageContent;
};

function RunText({ run }: { run: OnePageRun }) {
  const markers = (
    <>
      {run.grammarStart.map((g) => (
        <span key={`g${g}`} className="op-gm">
          {circledLetter(g)}
        </span>
      ))}
      {run.expressionStart.map((x) => (
        <span key={`x${x}`} className="op-xm">
          {circledHangul(x)}
        </span>
      ))}
      {run.referenceStart.map((r) => (
        <span key={`r${r}`} className="op-rm">
          {referenceMark(r)}
        </span>
      ))}
    </>
  );
  const cls = `${run.grammar.length ? "op-g" : ""} ${run.expression.length ? "op-x" : ""} ${
    run.reference.length ? "op-r" : ""
  }`.trim();
  return (
    <>
      {markers}
      {cls ? <span className={cls}>{run.text}</span> : run.text}
    </>
  );
}

/**
 * 낱말 아래 적을 동·반의어. 선생님 요청대로 동의어·반의어를 2개씩 싣는다(있는 만큼).
 * 주석이 낱말보다 넓으면 그만큼 낱말 양옆이 벌어지므로, 주석 글자는 본문의 절반 크기로 두고
 * 쪽 맞추기(자동 축소)가 남은 넓이를 흡수한다.
 */
function vocabNote(v: OnePageContent["vocab"][number]): string {
  const syn = v.synonyms.slice(0, 2);
  const ant = v.antonyms.slice(0, 2);
  return [syn.length ? `≒ ${syn.join(", ")}` : "", ant.length ? `↔ ${ant.join(", ")}` : ""]
    .filter(Boolean)
    .join(" ");
}

export function OnePageSummarySheet({
  index,
  project,
  logoSrc,
  isLast,
}: {
  index: number;
  project: OnePageSummaryInput;
  logoSrc?: string | null;
  isLast?: boolean;
}) {
  const c = project.content;
  const references = c.references ?? [];
  const title = (project.titleEn ?? "").trim() || c.titleEn || project.title;
  const summaryParts = splitSummaryByKeywords(c.summaryEn, c.summaryKeywords);
  return (
    <FitSheet
      baseFontPx={11.5}
      fitKey={`${project.id}|${c.createdAt}|${logoSrc ?? ""}`}
      isLast={isLast}
      label={project.title}
    >
      <header className="op-head">
        <span className="op-no">{String(index + 1).padStart(2, "0")}</span>
        <h1 className="op-en">{title}</h1>
        {project.source?.trim() ? <span className="op-src">{project.source.trim()}</span> : null}
        {logoSrc ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={logoSrc} alt="" />
        ) : null}
      </header>

      <dl className="op-meta">
        <dt>
          <b>1.</b>한글 주제
        </dt>
        <dd>{c.topicKo}</dd>
        <dt>
          <b>2.</b>영어 제목
        </dt>
        <dd className="op-en">{c.titleEn}</dd>
        <dt>
          <b>3.</b>요약문
        </dt>
        <dd>
          <p className="op-en op-just" style={{ margin: 0 }}>
            {summaryParts.map((p, i) =>
              p.keywordIndex === null ? (
                <Fragment key={i}>{p.text}</Fragment>
              ) : (
                <span key={i} className="op-kw">
                  {p.text}
                </span>
              )
            )}
          </p>
          <p className="op-ko" style={{ marginBottom: 0 }}>
            {c.summaryKo}
          </p>
        </dd>
      </dl>

      <h2 className="op-h">
        원문
        <span className="op-legend">
          <span className="op-gm" style={{ verticalAlign: 0 }}>
            ⓐ
          </span>
          어법 포인트 ·{" "}
          <span className="op-xm" style={{ verticalAlign: 0 }}>
            ㉠
          </span>
          바꿔 쓰기 표현 ·{" "}
          <span className="op-rm" style={{ verticalAlign: 0 }}>
            1
          </span>
          지칭어 · 낱말 아래 <span style={{ color: "#0f766e" }}>≒ 동의어 ↔ 반의어</span>
        </span>
      </h2>
      <p className="op-passage op-en">
        {project.sentences.map((s, si) => (
          <Fragment key={si}>
            <span className="op-sn">{circledNumber(si)}</span>
            {splitSentenceForSummary(s.english, si, c).map((seg, gi) => {
              const runs = seg.runs.map((run, ri) => <RunText key={ri} run={run} />);
              if (seg.vocab === null) return <Fragment key={gi}>{runs}</Fragment>;
              const note = vocabNote(c.vocab[seg.vocab]!);
              return (
                <ruby key={gi} className="op-voc">
                  <span>{runs}</span>
                  <rt>{note}</rt>
                </ruby>
              );
            })}{" "}
          </Fragment>
        ))}
      </p>

      {c.flow.length > 0 ? (
        <>
          <h2 className="op-h">도식화</h2>
          <div className="op-flow">
            {c.flow.map((f, i) => (
              <Fragment key={i}>
                {i > 0 ? <span className="op-farr">→</span> : null}
                <div className={`op-fbox ${i === c.flow.length - 1 ? "op-fbox--end" : ""}`}>
                  <b>{f.en}</b>
                  <span>{f.ko}</span>
                </div>
              </Fragment>
            ))}
          </div>
        </>
      ) : null}

      <div className="op-grid2">
        <section>
          <h2 className="op-h">중요 어법 포인트</h2>
          <ol className="op-list">
            {c.grammar.map((g, i) => (
              <li key={i}>
                <span className="op-gm" style={{ verticalAlign: 0, fontSize: "1em" }}>
                  {circledLetter(i)}
                </span>{" "}
                <b className="op-en">{g.right || g.target}</b>
                {g.wrong ? (
                  <>
                    {" "}
                    <span className="op-strike op-en">{g.wrong}</span>
                  </>
                ) : null}
                {g.point ? <span className="op-tag">{g.point}</span> : " "}
                {g.explanation}
              </li>
            ))}
          </ol>
        </section>
        <section>
          <h2 className="op-h">중요 표현 바꿔 쓰기</h2>
          <ol className="op-list">
            {c.paraphrases.map((p, i) => (
              <li key={i}>
                <span className="op-xm" style={{ verticalAlign: 0, fontSize: "1em" }}>
                  {circledHangul(i)}
                </span>{" "}
                <b className="op-en">{p.expression}</b>
                {p.meaningKo ? <span style={{ color: "#6b7280" }}> ({p.meaningKo})</span> : null}
                <span style={{ color: "#2563eb" }}> → </span>
                <span className="op-en">{p.paraphrases.join(", ")}</span>
              </li>
            ))}
          </ol>
        </section>
      </div>

      {references.length > 0 ? (
        <section>
          <h2 className="op-h">지칭 정리</h2>
          <p className="op-refs">
            {references.map((r, i) => (
              <Fragment key={i}>
                {i > 0 ? <span className="op-rsep">/</span> : null}
                <span className="op-rm" style={{ verticalAlign: ".35em" }}>
                  {referenceMark(i)}
                </span>
                <b className="op-en">{r.surface}</b>
                <span style={{ color: "#b45309" }}> → </span>
                <span className="op-en">{r.referent}</span>
              </Fragment>
            ))}
          </p>
        </section>
      ) : null}
    </FitSheet>
  );
}

// ---------------------------------------------------------------- 1장 테스트

function SectionTitle({ children }: { children: ReactNode }) {
  return <h2 className="op-h">{children}</h2>;
}

function ChoicePassage({ block }: { block: OnePageChoiceBlock }) {
  return (
    <p className="op-choice op-en">
      {block.segments.map((seg, i) =>
        seg.type === "text" ? (
          <Fragment key={i}>{stripMarkup(seg.text)}</Fragment>
        ) : (
          <Fragment key={i}>
            <sup>{seg.number}</sup>
            <b>
              [{seg.leftText} / {seg.rightText}]
            </b>
          </Fragment>
        )
      )}
    </p>
  );
}

export function OnePageTestSheet({
  index,
  passage,
  isLast,
}: {
  index: number;
  passage: OnePageTestPassage;
  isLast?: boolean;
}) {
  let no = 0;
  const next = () => ++no;
  return (
    <FitSheet
      baseFontPx={11}
      fitKey={`${passage.projectId}|${passage.sourceHash}|${passage.grammar?.from}|${passage.vocab?.from}`}
      isLast={isLast}
      label={passage.title}
    >
      <header className="op-head" style={{ padding: ".3em .8em", marginBottom: ".2em" }}>
        <span className="op-no" style={{ fontSize: "1.5em" }}>
          {String(index + 1).padStart(2, "0")}
        </span>
        <h1 className="op-en" style={{ fontSize: "1.15em" }}>
          {passage.titleEn || passage.title}
        </h1>
        {passage.source?.trim() ? <span className="op-src">{passage.source.trim()}</span> : null}
      </header>

      {passage.order ? (
        <section className="op-q">
          <SectionTitle>{next()}. 문장 순서 배열</SectionTitle>
          <div className="op-given op-en">{passage.order.given}</div>
          {passage.order.items.map((it) => (
            <p key={it.label} className="op-oitem op-en">
              <b>({it.label})</b>
              {it.text}
            </p>
          ))}
          <p className="op-ansline" style={{ marginBottom: 0 }}>
            Answer :
            {passage.order.items.map((it, i) => (
              <Fragment key={it.label}>
                {i > 0 ? "→" : null}
                <i />
              </Fragment>
            ))}
          </p>
        </section>
      ) : null}

      {passage.summary ? (
        <section className="op-q">
          <SectionTitle>{next()}. 요약문 완성</SectionTitle>
          <p className="op-en op-just" style={{ margin: 0, lineHeight: 1.75 }}>
            {passage.summary.segments.map((seg, i) =>
              seg.type === "text" ? (
                <Fragment key={i}>{seg.text}</Fragment>
              ) : (
                <span
                  key={i}
                  className="op-blank"
                  style={{ width: `${Math.max(6, Math.min(14, seg.answer.length * 0.6 + 2.5))}em` }}
                />
              )
            )}
          </p>
          <p className="op-ko" style={{ marginBottom: 0 }}>
            {passage.summary.ko}
          </p>
        </section>
      ) : null}

      {passage.tf.length > 0 ? (
        <section className="op-q">
          <SectionTitle>{next()}. T/F</SectionTitle>
          <ol className="op-list op-tf">
            {passage.tf.map((t, i) => (
              <li key={i} className="op-en">
                <span className="op-num">({i + 1})</span>
                {t.statement}
                <span className="op-tfmark">[T/F]</span>
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {passage.grammar || passage.vocab ? (
        <div className={passage.grammar && passage.vocab ? "op-two" : ""}>
          {passage.grammar ? (
            <section className="op-q">
              <SectionTitle>{next()}. 어법 선택</SectionTitle>
              <ChoicePassage block={passage.grammar} />
            </section>
          ) : null}
          {passage.vocab ? (
            <section className="op-q">
              <SectionTitle>{next()}. 어휘 선택</SectionTitle>
              <ChoicePassage block={passage.vocab} />
            </section>
          ) : null}
        </div>
      ) : null}

      {passage.writing.length > 0 ? (
        <section className="op-q">
          <SectionTitle>{next()}. 주요문장 영작</SectionTitle>
          {passage.writing.map((w, i) => (
            <div key={i} className="op-w">
              <p className="op-chunks" style={{ margin: 0 }}>
                <span style={{ marginRight: ".35em" }}>{i + 1}.</span>
                {w.words.join(" / ")}
              </p>
              <p className="op-wko" style={{ marginBottom: 0 }}>
                해석 : {w.korean}
              </p>
              <div className="op-wline" />
            </div>
          ))}
        </section>
      ) : null}
    </FitSheet>
  );
}

// ---------------------------------------------------------------- 정답

/** 시험지와 같은 차례로 번호를 매긴 정답 줄들(정답만 싣는다). */
function answerRows(p: OnePageTestPassage): Array<{ label: string; value: ReactNode }> {
  const rows: Array<{ label: string; value: ReactNode }> = [];
  let no = 0;
  const label = (name: string) => `${++no}. ${name}`;
  const items = (list: Array<[string, string]>, en = true) => (
    <span className={en ? "op-en" : undefined}>
      {list.map(([no, text], i) => (
        <span key={i} className="op-ai">
          <b>{no}</b>
          {text}
        </span>
      ))}
    </span>
  );
  if (p.order) rows.push({ label: label("순서 배열"), value: p.order.answer.map((a) => `(${a})`).join(" → ") });
  if (p.summary) {
    rows.push({
      label: label("요약문"),
      value: items(
        p.summary.segments
          .filter((s): s is Extract<typeof s, { type: "blank" }> => s.type === "blank")
          .map((s) => [circledNumber(s.number - 1), s.answer])
      ),
    });
  }
  if (p.tf.length) rows.push({ label: label("T/F"), value: items(p.tf.map((t, i) => [`(${i + 1})`, t.answer]), false) });
  const choice = (b: OnePageChoiceBlock) => items(b.answers.map((a, i) => [String(i + 1), a]));
  if (p.grammar) rows.push({ label: label("어법 선택"), value: choice(p.grammar) });
  if (p.vocab) rows.push({ label: label("어휘 선택"), value: choice(p.vocab) });
  if (p.writing.length) {
    rows.push({
      label: label("영작"),
      value: (
        <span className="op-en">
          {p.writing.map((w, i) => (
            <span key={i} style={{ display: "block" }}>
              {i + 1}. {w.answer}
            </span>
          ))}
        </span>
      ),
    });
  }
  return rows;
}

export function OnePageAnswerBlock({ index, passage }: { index: number; passage: OnePageTestPassage }) {
  return (
    <section className="op-ans" data-op-answer={passage.projectId}>
      <h3>
        <span>{String(index + 1).padStart(2, "0")}</span>
        <span className="op-en" style={{ color: "#111827" }}>
          {passage.titleEn || passage.title}
        </span>
      </h3>
      <dl style={{ margin: 0 }}>
        {answerRows(passage).map((r, i) => (
          <div key={i} className="op-arow">
            <dt>{r.label}</dt>
            <dd>{r.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

const ANSWER_FONT_PX = 10.5;

/**
 * 정답 쪽들. 지문별 정답 묶음을 숨은 틀에서 재어 쪽마다 들어가는 만큼 담는다(묶음은 쪽을
 * 넘기며 자르지 않는다).
 */
export function OnePageAnswerSheets({
  passages,
  indexOf,
  isLastGroup,
}: {
  passages: OnePageTestPassage[];
  /** 시험지에서의 지문 번호(0부터) */
  indexOf: (projectId: string) => number;
  isLastGroup?: boolean;
}) {
  const measureRef = useRef<HTMLDivElement>(null);
  const [pages, setPages] = useState<number[][]>(() => [passages.map((_, i) => i)]);
  const key = passages.map((p) => `${p.projectId}:${p.sourceHash}`).join(",");

  useLayoutEffect(() => {
    const root = measureRef.current;
    if (!root || root.offsetWidth === 0) return;
    const pxPerMm = root.offsetWidth / (A4_W_MM - PAD_X_MM * 2);
    const avail = (A4_H_MM - PAD_Y_MM * 2) * pxPerMm * 0.97;
    const title = root.querySelector("[data-op-answer-title]") as HTMLElement | null;
    const blocks = Array.from(root.querySelectorAll("[data-op-answer]")) as HTMLElement[];
    const out: number[][] = [];
    let cur: number[] = [];
    let used = title?.offsetHeight ?? 0;
    blocks.forEach((el, i) => {
      const style = getComputedStyle(el);
      const h = el.offsetHeight + parseFloat(style.marginBottom || "0");
      if (cur.length > 0 && used + h > avail) {
        out.push(cur);
        cur = [];
        used = 0;
      }
      cur.push(i);
      used += h;
    });
    if (cur.length) out.push(cur);
    setPages(out.length ? out : [[]]);
  }, [key]);

  if (passages.length === 0) return null;
  const titleEl = (
    <h2 className="op-h" data-op-answer-title style={{ marginTop: 0 }}>
      정답
    </h2>
  );
  return (
    <>
      {pages.map((chunk, pi) => (
        <article
          key={pi}
          className={`op-sheet one-page-a4-sheet shadow-xl print:shadow-none ${
            isLastGroup && pi === pages.length - 1 ? "one-page-a4-sheet--last" : ""
          }`}
        >
          <div className="op-body" style={{ fontSize: `${ANSWER_FONT_PX}px` }}>
            {pi === 0 ? titleEl : null}
            {chunk.map((i) => (
              <OnePageAnswerBlock key={passages[i]!.projectId} index={indexOf(passages[i]!.projectId)} passage={passages[i]!} />
            ))}
          </div>
          <span className="op-label">
            정답 {pi + 1} / {pages.length}
          </span>
        </article>
      ))}
      <div className="pointer-events-none absolute left-0 top-0 h-0 w-0 overflow-hidden print:hidden" aria-hidden>
        <div
          ref={measureRef}
          className="op-body font-print opacity-0"
          style={{ width: `${A4_W_MM - PAD_X_MM * 2}mm`, fontSize: `${ANSWER_FONT_PX}px` }}
        >
          {titleEl}
          {passages.map((p) => (
            <OnePageAnswerBlock key={p.projectId} index={indexOf(p.projectId)} passage={p} />
          ))}
        </div>
      </div>
    </>
  );
}
