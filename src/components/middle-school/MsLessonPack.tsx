"use client";

import { Fragment, useLayoutEffect, useMemo, useRef, useState, type ReactNode } from "react";
import type { MsGrammar, MsLine, MsText, MsUnit, MsWord } from "@/lib/middle-school/queries";
import "./ms-print.css";

export type MsLessonPackOptions = {
  cover: boolean;
  sections: { words: boolean; grammar: boolean; dialogue: boolean; reading: boolean };
  /** 대화문·본문 해석: 함께 보이기 / 지우고 쓰는 줄 */
  translation: "show" | "blank";
  wordExamples: boolean;
};

type Block = { key: string; node: ReactNode };
type Section = { key: string; label: string; blocks: Block[] };

const MM = 96 / 25.4;
/** 쪽 안 글 자리: 297 − 위 16 − 아래 14 − 머리줄 9 − 바닥줄 여유 9 (mm) */
const BODY_MM = 249;
const WORD_CHUNK = 6;
const SENT_CHUNK = 4;

function PartTitle({ no, ko, en }: { no: number; ko: string; en: string }) {
  return (
    <div className="ms-ptitle">
      <b>PART {no}</b>
      <h2>{ko}</h2>
      <span>{en}</span>
    </div>
  );
}

function WordRows({ words, start, examples, head }: { words: MsWord[]; start: number; examples: boolean; head: boolean }) {
  return (
    <table className="ms-wt">
      {head && (
        <thead>
          <tr>
            <th />
            <th>단어</th>
            <th>뜻</th>
            {examples && <th>예문</th>}
          </tr>
        </thead>
      )}
      <tbody>
        {words.map((w, i) => (
          <tr key={i}>
            <td className="no">{start + i + 1}</td>
            <td className="w">{w.word}</td>
            <td className="m">{w.meaning}</td>
            {examples && <td className="ex">{w.examples?.[0]?.en ?? ""}</td>}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function GrammarBox({ g, index }: { g: MsGrammar; index: number }) {
  return (
    <div className="ms-gbox">
      <div className="ms-gno">Point {index + 1}</div>
      <h3>{g.title}</h3>
      <ul>
        {g.points.map((p, i) => {
          const [text, eg] = p.split(" | ");
          return (
            <li key={i}>
              {text}
              {eg && <div className="ms-eg">e.g. {eg}</div>}
            </li>
          );
        })}
      </ul>
    </div>
  );
}

function Ko({ ko, mode }: { ko: string; mode: MsLessonPackOptions["translation"] }) {
  return mode === "show" ? <span className="ko">{ko}</span> : <span className="wline" />;
}

function DialogueBlock({ t, n, mode }: { t: MsText; n: number; mode: MsLessonPackOptions["translation"] }) {
  return (
    <div className="ms-dlg">
      <div className="ms-dh">
        <b>Dialogue {n}</b> <span>{t.title ?? ""}</span>
      </div>
      <table className={mode === "blank" ? "blank" : ""}>
        <tbody>
          {t.lines.map((l, i) => (
            <tr key={i}>
              <td className="sp">{l.speaker}</td>
              <td className="den">{l.en}</td>
              <td className="dko">{mode === "show" ? l.ko : <span className="wline" />}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function Sentences({ lines, start, mode }: { lines: MsLine[]; start: number; mode: MsLessonPackOptions["translation"] }) {
  return (
    <ol className="ms-sents" start={start + 1}>
      {lines.map((s, i) => (
        <li key={i}>
          {s.speaker && <span className="spk">{s.speaker}</span>}
          <span className="en">{s.en}</span>
          <Ko ko={s.ko} mode={mode} />
        </li>
      ))}
    </ol>
  );
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

function buildSections(unit: MsUnit, o: MsLessonPackOptions): Section[] {
  const out: Section[] = [];
  let partNo = 0;
  if (o.sections.words) {
    partNo++;
    const blocks: Block[] = [{ key: "w-title", node: <PartTitle no={partNo} ko="단어" en="Words" /> }];
    let n = 0;
    for (const sec of ["대화문", "본문"] as const) {
      const ws = unit.words.filter((w) => w.section === sec);
      if (!ws.length) continue;
      chunk(ws, WORD_CHUNK).forEach((c, i) => {
        blocks.push({
          key: `w-${sec}-${i}`,
          node: (
            <>
              {i === 0 && <h3 className="ms-sub">{sec} 단어</h3>}
              <WordRows words={c} start={n} examples={o.wordExamples} head={i === 0} />
            </>
          ),
        });
        n += c.length;
      });
    }
    out.push({ key: "words", label: "PART 단어", blocks });
  }
  if (o.sections.grammar && unit.grammar.length) {
    partNo++;
    const blocks: Block[] = [{ key: "g-title", node: <PartTitle no={partNo} ko="문법" en="Grammar" /> }];
    unit.grammar.forEach((g, i) => {
      blocks.push({ key: `g-${i}`, node: <GrammarBox g={g} index={i} /> });
      if (g.examples.length) {
        blocks.push({
          key: `g-ex-${i}`,
          node: (
            <>
              <h4 className="ms-h4">교과서 예문</h4>
              <ul className="ms-gex">
                {g.examples.map((x, k) => (
                  <li key={k}>
                    <span className="en">
                      {x.en}
                      {x.fromText && <i className="tag">교과서 본문</i>}
                    </span>
                    <span className="ko">{x.ko}</span>
                  </li>
                ))}
              </ul>
            </>
          ),
        });
      }
    });
    out.push({ key: "grammar", label: "PART 문법", blocks });
  }
  if (o.sections.dialogue && unit.dialogues.length) {
    partNo++;
    const blocks: Block[] = [{ key: "d-title", node: <PartTitle no={partNo} ko="대화문" en="Dialogue" /> }];
    unit.dialogues.forEach((t, i) => blocks.push({ key: `d-${t.id}`, node: <DialogueBlock t={t} n={i + 1} mode={o.translation} /> }));
    out.push({ key: "dialogue", label: "PART 대화문", blocks });
  }
  if (o.sections.reading && unit.passages.length) {
    partNo++;
    const blocks: Block[] = [{ key: "r-title", node: <PartTitle no={partNo} ko="본문" en="Reading" /> }];
    unit.passages.forEach((p, pi) => {
      let start = 0;
      chunk(p.lines, SENT_CHUNK).forEach((c, i) => {
        blocks.push({
          key: `r-${p.id}-${i}`,
          node: (
            <>
              {i === 0 && (
                <div className="ms-rh">
                  <b>본문 {pi + 1}</b> {p.title ?? ""}
                </div>
              )}
              <Sentences lines={c} start={start} mode={o.translation} />
            </>
          ),
        });
        start += c.length;
      });
    });
    out.push({ key: "reading", label: "PART 본문", blocks });
  }
  return out;
}

/** 블록 높이를 재서 A4 쪽에 채운다. PART마다 새 쪽에서 시작한다. */
function paginate(sections: Section[], heights: Map<string, number>): { label: string; blocks: Block[] }[] {
  const limit = BODY_MM * MM;
  const pages: { label: string; blocks: Block[] }[] = [];
  for (const s of sections) {
    let cur: Block[] = [];
    let used = 0;
    s.blocks.forEach((b, i) => {
      const h = heights.get(b.key) ?? 0;
      // 제목 블록은 다음 블록과 떨어지지 않게
      const isTitle = i === 0;
      if (cur.length && used + h > limit && !(isTitle && cur.length === 0)) {
        pages.push({ label: s.label, blocks: cur });
        cur = [];
        used = 0;
      }
      cur.push(b);
      used += h;
    });
    if (cur.length) pages.push({ label: s.label, blocks: cur });
  }
  return pages;
}

export function MsLessonPack({ unit, options, academyName }: { unit: MsUnit; options: MsLessonPackOptions; academyName: string }) {
  const sections = useMemo(() => buildSections(unit, options), [unit, options]);
  const measureRef = useRef<HTMLDivElement>(null);
  const [heights, setHeights] = useState<Map<string, number> | null>(null);

  useLayoutEffect(() => {
    let alive = true;
    const measure = () => {
      const root = measureRef.current;
      if (!root || !alive) return;
      const m = new Map<string, number>();
      root.querySelectorAll<HTMLElement>("[data-block]").forEach((el) => {
        const cs = getComputedStyle(el);
        m.set(el.dataset.block!, el.getBoundingClientRect().height + parseFloat(cs.marginTop) + parseFloat(cs.marginBottom));
      });
      setHeights(m);
    };
    measure();
    void document.fonts?.ready.then(measure);
    return () => {
      alive = false;
    };
  }, [sections]);

  const pages = heights ? paginate(sections, heights) : [];
  const head = `${unit.grade} ${unit.publisher} · Lesson ${unit.lessonNo} ${unit.title}`;
  const offset = options.cover ? 1 : 0;

  return (
    <>
      {/* 높이 재는 숨은 틀 — 쪽 글 자리와 같은 폭 */}
      <div ref={measureRef} className="ms-doc font-print ms-measure" aria-hidden>
        {sections.flatMap((s) =>
          s.blocks.map((b) => (
            <div key={b.key} data-block={b.key} className="ms-block">
              {b.node}
            </div>
          )),
        )}
      </div>

      {/* 용지를 이 화면에서 직접 정한다 — 이름 붙은 @page는 절대 위치 틀에 안 먹어 레터 용지로 잡히고 한 쪽이 두 장으로 갈렸다 */}
      <style>{"@media print { @page { size: 210mm 297mm; margin: 0; } }"}</style>
      <div id="ms-print-root" className="ms-doc font-print">
        {options.cover && (
          <section className="ms-sheet ms-cover">
            <div className="cv-top">
              <span>중학교 수업자료</span>
              <span>2022 개정 · {unit.publisher}</span>
            </div>
            <div className="cv-mid">
              <div className="cv-grade">{unit.grade}</div>
              <div className="cv-lesson">Lesson {unit.lessonNo}</div>
              <h1>{unit.title}</h1>
              <ol className="cv-toc">
                {sections.map((s, i) => (
                  <li key={s.key}>
                    <b>{String(i + 1).padStart(2, "0")}</b>
                    {s.label.replace("PART ", "")}
                  </li>
                ))}
              </ol>
            </div>
            <div className="cv-bot">
              <span>이름 ________________</span>
              <span>{academyName}</span>
            </div>
          </section>
        )}
        {pages.map((p, i) => (
          <section key={i} className="ms-sheet">
            <header className="ms-run">
              <span>{head}</span>
              <span>{p.label}</span>
            </header>
            {p.blocks.map((b) => (
              <Fragment key={b.key}>
                <div className="ms-block">{b.node}</div>
              </Fragment>
            ))}
            <footer className="ms-foot">
              <span>{academyName}</span>
              <span>{i + 1 + offset}</span>
            </footer>
          </section>
        ))}
        {!heights && <div className="no-print p-6 text-sm text-slate-500">쪽을 나누는 중…</div>}
      </div>
    </>
  );
}
