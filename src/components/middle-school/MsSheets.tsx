"use client";

import { useEffect, type ReactNode } from "react";
import type { TestBookProjectInput } from "@/lib/lesson-materials/test-book";
import type { MaterialDesign } from "@/lib/lesson-materials/material-design";
import type { MsGrammar, MsText, MsUnit, MsWord } from "@/lib/middle-school/queries";
import type { MsWbSheet } from "@/lib/middle-school/workbook";
import type { AnalysisReportData } from "@/lib/lesson-materials/generate-analysis-report";
import { DESIGN_FONTS_HREF, designClass, type AnalysisDesignStyle } from "@/lib/lesson-materials/analysis-design";
import {
  AnalysisSheets,
  AnswerSheets,
  DocHead,
  LessonSheets,
  PagedSheet,
  TEST_BOOK_CSS,
  TEST_BOOK_FONTS_HREF,
  TestBookBrand,
  TestSheets,
  type Block,
} from "@/components/lesson-materials/test-book/TestBookSheets";

/*
 * 중학교 수업자료를 고등 수업자료(테스트 교재·테스트지)와 같은 부품·같은 디자인으로 그린다
 * (선생님 2026-10-29 「디자인은 원래 수업자료에서 만든 걸 그대로」).
 */

/** 인쇄 틀: 글꼴·디자인 바탕·쪽 번호·A4 용지 */
export function MsPrintFrame({ design, academyName, children }: { design: MaterialDesign; academyName: string; children: ReactNode }) {
  useEffect(() => {
    const root = document.getElementById("tb-print-root");
    if (!root) return;
    const count = () => {
      // 최종통합자료에 끼운 문제(변형문제 쪽 .qg-print-page)도 같은 번호 줄기로 센다
      const all = Array.from(root.querySelectorAll<HTMLElement>(".tb-sheet, .qg-print-page")).filter((el) => !el.closest(".tb-measure"));
      all.forEach((el, i) => {
        const no = el.querySelector<HTMLElement>(":scope > .tb-foot .tb-pgno") ?? el.querySelector<HTMLElement>(".qg-print-footer-page");
        if (no && no.textContent !== `- ${i + 1} -`) no.textContent = `- ${i + 1} -`;
      });
    };
    count();
    let frame = 0;
    const observer = new MutationObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(count);
    });
    observer.observe(root, { childList: true, subtree: true });
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, []);
  return (
    <>
      <link rel="stylesheet" href={TEST_BOOK_FONTS_HREF} />
      <style>{TEST_BOOK_CSS}</style>
      <style>{"@media print{@page{size:210mm 297mm;margin:0}#tb-print-root{transform:none !important;gap:0 !important}}"}</style>
      {/* 끼워 넣은 문제(변형문제 인쇄 부품): 전역 규칙이 맨 위에 절대 위치로 고정하고 이름 붙은 쪽을 쓰는데, 여기서는 차례로 흐르게 한다 */}
      <style>{"#tb-print-root #qg-print-root{padding:0}@media print{#tb-print-root #qg-print-root{position:static !important;width:210mm !important;max-width:210mm !important;margin:0 !important;padding:0 !important;page:auto !important}#tb-print-root .qg-print-page-last{break-after:page !important;page-break-after:always !important}}"}</style>
      <TestBookBrand.Provider value={{ logoSrc: null, academy: academyName }}>
        <div id="tb-print-root" className={`tb-theme-${design} relative flex flex-col items-center gap-6 print:gap-0 [&_.tb-sheet]:shadow`}>
          {children}
        </div>
      </TestBookBrand.Provider>
    </>
  );
}

function asProject(
  id: string,
  title: string,
  titleEn: string | null,
  source: string,
  sentences: TestBookProjectInput["sentences"],
  analysis: AnalysisReportData | null = null,
): TestBookProjectInput {
  return { id, title, titleEn, source, sentences, content: null, material: null, analysis };
}

export function msSource(unit: Pick<MsUnit, "grade" | "publisher" | "lessonNo">): string {
  return `${unit.grade} ${unit.publisher} ${unit.lessonNo}과`;
}

/** 분석이 들어 있는 본문만 */
export function msAnalyzed(unit: MsUnit): MsText[] {
  return unit.passages.filter((t) => (t.analysis?.sentences?.length ?? 0) > 0);
}

const WORD_GRID = "8mm 34mm 10mm 52mm 1fr";
const POS = /^((?:n|v|a|adj|adv|prep|conj|pron|int)\.)\s*/;

function WordListSheets({ unit, examples, measureKey }: { unit: MsUnit; examples: boolean; measureKey: string }) {
  const head = (
    <div className="tb-row tb-th tb-vrow" style={{ gridTemplateColumns: WORD_GRID }}>
      <div />
      <div>단어</div>
      <div />
      <div>뜻</div>
      <div>{examples ? "예문" : ""}</div>
    </div>
  );
  const blocks: Block[] = [];
  let n = 0;
  for (const sec of ["대화문", "본문"] as const) {
    const ws = unit.words.filter((w) => w.section === sec);
    if (!ws.length) continue;
    blocks.push({ key: `h-${sec}`, node: <div className="tb-q" style={{ margin: "2mm 0 1mm" }}>{sec} 단어</div> });
    ws.forEach((w: MsWord) => {
      n++;
      const pos = w.meaning.match(POS)?.[1] ?? "";
      blocks.push({
        key: `w${n}`,
        node: (
          <div className="tb-row tb-vrow" style={{ gridTemplateColumns: WORD_GRID }}>
            <div className="tb-n">{n}</div>
            <div className="tb-w tb-en">{w.word}</div>
            <div className="tb-pos">{pos}</div>
            <div>{w.meaning.replace(POS, "")}</div>
            <div className="tb-en" style={{ color: "#6a707c" }}>
              {examples ? (w.examples?.[0]?.en ?? "") : ""}
            </div>
          </div>
        ),
      });
    });
  }
  return (
    <PagedSheet
      blocks={blocks}
      measureKey={measureKey}
      head={(page) => (
        <>
          <DocHead title="단어장" sub={page > 0 ? "(이어서)" : `${unit.words.length}단어`} label="WORDS" right={`${unit.grade} ${unit.publisher} ${unit.lessonNo}과`} />
          {head}
        </>
      )}
    />
  );
}

function GrammarSheets({ unit, measureKey }: { unit: MsUnit; measureKey: string }) {
  const blocks: Block[] = unit.grammar.flatMap((g: MsGrammar, gi) => [
    {
      key: `g${gi}`,
      node: (
        <div className="tb-b" style={{ marginTop: gi ? "4mm" : 0 }}>
          <div className="tb-q">
            <span className="tb-qn">{gi + 1}</span>
            {g.title}
          </div>
          <ul style={{ margin: "1.5mm 0 0", paddingLeft: "5mm", listStyle: "disc", fontSize: "9.5pt", lineHeight: 1.6 }}>
            {g.points.map((p, i) => {
              const [text, eg] = p.split(" | ");
              return (
                <li key={i} style={{ margin: "1mm 0" }}>
                  {text}
                  {eg ? <div className="tb-en tb-tip" style={{ fontSize: "8.8pt" }}>e.g. {eg}</div> : null}
                </li>
              );
            })}
          </ul>
        </div>
      ),
    },
    ...g.examples.map((x, i) => ({
      key: `g${gi}-x${i}`,
      node: (
        <div className="tb-ss">
          <span className="tb-i">{String(i + 1).padStart(2, "0")}</span>
          <div>
            <div className="tb-en">
              {x.en}
              {x.fromText ? <span className="tb-tip" style={{ marginLeft: "2mm" }}>교과서 본문</span> : null}
            </div>
            <div className="tb-ko">{x.ko}</div>
          </div>
        </div>
      ),
    })),
  ]);
  return (
    <PagedSheet
      blocks={blocks}
      measureKey={measureKey}
      head={(page) => <DocHead title="문법 정리" sub={page > 0 ? "(이어서)" : unit.grammar.map((g) => g.title).join(" · ")} label="GRAMMAR" right={`${unit.grade} ${unit.publisher} ${unit.lessonNo}과`} />}
    />
  );
}

/** 대화문: 대화마다 소제목 + 말차례별 해석(짧은 대화가 한 쪽씩 차지하지 않게 이어 싣는다) */
function DialogueSheets({ unit, translation, measureKey }: { unit: MsUnit; translation: "show" | "hide"; measureKey: string }) {
  const blocks: Block[] = unit.dialogues.flatMap((t, ti) => [
    {
      key: `dh${ti}`,
      node: (
        <div className="tb-q" style={{ marginTop: ti ? "4mm" : 0 }}>
          <span className="tb-qn">{ti + 1}</span>
          {t.title ?? t.part}
        </div>
      ),
    },
    ...t.lines.map((l, i) => ({
      key: `d${ti}-${i}`,
      node: (
        <div className="tb-ss">
          <span className="tb-i">{l.speaker}</span>
          <div>
            <div className="tb-en">{l.en}</div>
            {translation === "show" ? <div className="tb-ko">{l.ko}</div> : <div className="tb-line" />}
          </div>
        </div>
      ),
    })),
  ]);
  return (
    <PagedSheet
      blocks={blocks}
      measureKey={measureKey}
      head={(page) => (
        <DocHead
          title="대화문 · 말차례별 해석"
          sub={page > 0 ? "(이어서)" : translation === "show" ? "해석 있음" : "해석 쓰기"}
          label="DIALOGUE"
          right={`${unit.grade} ${unit.publisher} ${unit.lessonNo}과`}
        />
      )}
    />
  );
}

export type MsLessonOptions = {
  sections: { words: boolean; grammar: boolean; dialogue: boolean; reading: boolean };
  translation: "show" | "hide";
  wordExamples: boolean;
};

/** 수업용 자료: 단어장 → 문법 정리 → 대화문(말차례별 해석) → 본문(문장별 해석) */
export function MsLessonSheets({ unit, options }: { unit: MsUnit; options: MsLessonOptions }) {
  const source = `${unit.grade} ${unit.publisher} ${unit.lessonNo}과`;
  const mk = `${unit.id}-${options.translation}-${options.wordExamples}`;
  const text = (t: MsText, i: number) => (
    <LessonSheets
      key={t.id}
      index={i}
      project={asProject(
        t.id,
        `${t.part} ${t.title ?? ""}`.trim(),
        i === 0 ? unit.title : null,
        source,
        t.lines.map((l) => ({ english: l.speaker ? `${l.speaker}: ${l.en}` : l.en, korean: l.ko })),
      )}
      translation={options.translation}
      measureKey={mk}
    />
  );
  return (
    <>
      {options.sections.words ? <WordListSheets unit={unit} examples={options.wordExamples} measureKey={mk} /> : null}
      {options.sections.grammar && unit.grammar.length ? <GrammarSheets unit={unit} measureKey={mk} /> : null}
      {options.sections.dialogue && unit.dialogues.length ? <DialogueSheets unit={unit} translation={options.translation} measureKey={mk} /> : null}
      {options.sections.reading ? unit.passages.map((t, i) => text(t, i)) : null}
    </>
  );
}

/** 워크북·뽑은 테스트지: 지문마다 테스트지 + 정답 */
export function MsWorkbookSheets({ sheets, answers, title, measureKey }: { sheets: MsWbSheet[]; answers: boolean; title: string; measureKey: string }) {
  const proj = (s: MsWbSheet) => asProject(s.key, s.title, s.titleEn, s.source, []);
  return (
    <>
      {sheets.map((s) => (
        <TestSheets key={s.key} index={s.index} project={proj(s)} sheet={s.sheet} title={title} measureKey={measureKey} />
      ))}
      {answers && sheets.length ? (
        <AnswerSheets title={`${title} 정답`} entries={sheets.map((s) => ({ index: s.index, project: proj(s), sheet: s.sheet }))} measureKey={measureKey} />
      ) : null}
    </>
  );
}

export type MsAnalysisOptions = { style: AnalysisDesignStyle; translation: "full" | "chunk" };

/**
 * 분석서: 본문마다 문장 분석(고등 「분석 자료」 부품 그대로 — 성분·괄호·이름표·번호 설명·해석).
 * 분석은 직접 써서 ms_texts.analysis 에 넣어 둔 것만 싣는다(모델 호출 없음).
 */
export function MsAnalysisSheets({ unit, options, measureKey }: { unit: MsUnit; options: MsAnalysisOptions; measureKey: string }) {
  const source = msSource(unit);
  const list = msAnalyzed(unit);
  if (!list.length) return null;
  return (
    <div className={`contents ${designClass(options.style)}`}>
      <link rel="stylesheet" href={DESIGN_FONTS_HREF} />
      {list.map((t) => {
        const i = unit.passages.indexOf(t);
        return (
          <AnalysisSheets
            key={t.id}
            index={i}
            project={asProject(t.id, `${t.part} ${t.title ?? ""}`.trim(), i === 0 ? unit.title : null, source, [], t.analysis ?? null)}
            translation={options.translation}
            measureKey={`${measureKey}|${options.style}|${options.translation}`}
          />
        );
      })}
    </div>
  );
}

/** 워크북·테스트지 정답만(최종통합자료의 정답지 묶음) */
export function MsWorkbookAnswerSheets({ sheets, title, measureKey }: { sheets: MsWbSheet[]; title: string; measureKey: string }) {
  if (!sheets.length) return null;
  return (
    <AnswerSheets
      title={title}
      entries={sheets.map((s) => ({ index: s.index, project: asProject(s.key, s.title, s.titleEn, s.source, []), sheet: s.sheet }))}
      measureKey={measureKey}
    />
  );
}
