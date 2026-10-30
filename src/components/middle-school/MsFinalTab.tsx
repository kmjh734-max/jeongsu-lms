"use client";

import { useEffect, useMemo, useState } from "react";
import type { MsQuestion, MsUnit } from "@/lib/middle-school/queries";
import type { MaterialDesign } from "@/lib/lesson-materials/material-design";
import { MaterialDesignPicker } from "@/components/lesson-materials/MaterialDesignPicker";
import {
  MS_WB_TYPES,
  buildMsWorkbook,
  drawMsWorkbook,
  msWbCounts,
  msWbLabel,
  seeded,
  shuffle,
  type MsDrawLength,
  type MsWbTypeKey,
} from "@/lib/middle-school/workbook";
import { QuestionPrintView } from "@/components/question-generator/QuestionPrintView";
import { encodeQuestionIds, msExamPreloaded } from "@/lib/middle-school/exam-print";
import { COVER_PRESETS, DEFAULT_INTEGRATED_COVER, type IntegratedCover } from "@/lib/lesson-materials/integrated";
import { CoverForm } from "@/components/lesson-materials/book-cover/CoverForm";
import { EMPTY_BOOK_COVER_SPEC, suggestedExam, type BookCoverSpec } from "@/lib/lesson-materials/book-cover";
import { DESIGN_STYLES } from "@/lib/lesson-materials/analysis-design";
import { ContentsSheet, CoverSheet, DividerSheet, partStyle, type BookPart } from "@/components/lesson-materials/test-book/TestBookSheets";
import {
  MsAnalysisSheets,
  MsLessonSheets,
  MsPrintFrame,
  MsWorkbookAnswerSheets,
  MsWorkbookSheets,
  msAnalyzed,
  type MsAnalysisOptions,
  type MsLessonOptions,
} from "./MsSheets";

/*
 * 최종통합자료(중학교): 표지 → 목차 → 수업용 자료 → 분석서 → 워크북(또는 뽑은 테스트지) → 문제 → 정답지.
 * 고등 최종통합자료·테스트 교재와 같은 부품(표지·목차·간지·쪽 번호)으로, 묶음마다 넣고 빼고 안을 고른다.
 * 크레딧 없음(정수학원만). 문제는 변형문제 인쇄 화면 그대로 끼워 넣는다(문제 탭과 같다).
 */

const DEFAULT_WB: MsWbTypeKey[] = ["r_line", "r_en_blank", "r_grammar", "r_word_order", "r_writing", "d_line", "w_en_ko"];
const AREAS = ["단어", "의사소통", "어법", "본문"] as const;
const COUNTS = [0, 10, 20, 30] as const;
const LENGTHS: { id: MsDrawLength; label: string }[] = [
  { id: "short", label: "짧게" },
  { id: "normal", label: "보통" },
  { id: "long", label: "길게" },
];
const LESSON_SECTIONS: { key: keyof MsLessonOptions["sections"]; label: string }[] = [
  { key: "words", label: "단어장" },
  { key: "grammar", label: "문법 정리" },
  { key: "dialogue", label: "대화문" },
  { key: "reading", label: "본문" },
];

type PartId = "lesson" | "analysis" | "workbook" | "questions" | "answers";

function Section({ title, on, onToggle, children }: { title: string; on?: boolean; onToggle?: (v: boolean) => void; children?: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-slate-200 p-2.5">
      <label className="flex items-center gap-2 font-bold text-slate-800">
        {onToggle ? <input type="checkbox" checked={!!on} onChange={(e) => onToggle(e.target.checked)} /> : null}
        {title}
      </label>
      {on !== false && children ? <div className="mt-2 space-y-1.5 pl-1 text-[12px]">{children}</div> : null}
    </div>
  );
}

function Toggle({ label, on, onChange, dim }: { label: string; on: boolean; onChange: (v: boolean) => void; dim?: boolean }) {
  return (
    <label className={`flex items-center gap-2 py-0.5 ${dim ? "text-slate-300" : ""}`}>
      <input type="checkbox" checked={on} disabled={dim} onChange={(e) => onChange(e.target.checked)} />
      {label}
    </label>
  );
}

export function MsFinalTab({
  unit,
  questions,
  design,
  setDesign,
  academyName,
  base,
}: {
  unit: MsUnit;
  questions: MsQuestion[];
  design: MaterialDesign;
  setDesign: (d: MaterialDesign) => void;
  academyName: string;
  base: string;
}) {
  const analyzedCount = msAnalyzed(unit).length;
  const sources = useMemo(() => [...new Set(questions.filter((q) => !q.review).map((q) => q.source))], [questions]);

  // ---------------------------------------------------------------- 표지
  const [presetId, setPresetId] = useState(DEFAULT_INTEGRATED_COVER.presetId);
  const [spec, setSpec] = useState<BookCoverSpec>(() => {
    const s = suggestedExam();
    return {
      ...EMPTY_BOOK_COVER_SPEC,
      grade: unit.grade,
      year: String(new Date().getFullYear()),
      semester: s.semester,
      exam: s.exam,
      material: "최종통합자료",
      textbook: "영어",
      publisher: unit.publisher,
      range: `${unit.lessonNo}과 ${unit.title}`,
      brand: academyName,
    };
  });
  const [coverOpen, setCoverOpen] = useState(false);
  const cover: IntegratedCover = useMemo(
    () => ({ ...DEFAULT_INTEGRATED_COVER, presetId, academy: academyName, title: spec.material, exam: spec }),
    [presetId, academyName, spec],
  );
  const range = `${unit.grade} ${unit.publisher} ${unit.lessonNo}과`;
  const bookTitle = `${unit.grade} ${unit.lessonNo}과 ${spec.material || "최종통합자료"}`;

  // ---------------------------------------------------------------- 묶음
  const [on, setOn] = useState<Record<PartId, boolean>>({
    lesson: true,
    analysis: analyzedCount > 0,
    workbook: true,
    questions: sources.length > 0,
    answers: true,
  });
  const [toc, setToc] = useState(true);
  const [dividers, setDividers] = useState(true);
  const [lesson, setLesson] = useState<MsLessonOptions>({
    sections: { words: true, grammar: true, dialogue: true, reading: true },
    translation: "show",
    wordExamples: true,
  });
  const [analysis, setAnalysis] = useState<MsAnalysisOptions>({ style: "a", translation: "full" });
  const [types, setTypes] = useState<MsWbTypeKey[]>(DEFAULT_WB);
  const [wbMode, setWbMode] = useState<"all" | MsDrawLength>("all");
  const [wbSeed, setWbSeed] = useState(`${Date.now()}`);
  const [src, setSrc] = useState<string[]>(sources.slice(0, 1));
  const [areas, setAreas] = useState<string[]>([...AREAS]);
  const [kinds, setKinds] = useState<("mc" | "sa")[]>(["mc", "sa"]);
  const [qCount, setQCount] = useState<number>(20);
  const [qSeed, setQSeed] = useState(`${Date.now()}`);

  const counts = useMemo(() => msWbCounts(unit, unit.workbook), [unit]);
  const sheets = useMemo(
    () => (wbMode === "all" ? buildMsWorkbook(unit, unit.workbook, types) : drawMsWorkbook(unit, unit.workbook, types, wbMode, wbSeed)),
    [unit, types, wbMode, wbSeed],
  );
  const pool = useMemo(
    () => questions.filter((q) => src.includes(q.source) && areas.includes(q.area) && kinds.includes(q.kind) && !q.review),
    [questions, src, areas, kinds],
  );
  const shown = useMemo(() => {
    if (!qCount || pool.length <= qCount) return pool;
    const keep = new Set(shuffle(pool.map((q) => q.id), seeded(qSeed)).slice(0, qCount));
    return pool.filter((q) => keep.has(q.id));
  }, [pool, qCount, qSeed]);
  const qIds = shown.map((q) => q.id);
  const preloaded = useMemo(() => msExamPreloaded(unit, shown, `${unit.grade} ${unit.lessonNo}과 문제`), [unit, shown]);

  const toggle = <T,>(list: T[], v: T, onIt: boolean): T[] => (onIt ? [...list, v] : list.filter((x) => x !== v));

  const lessonOn = on.lesson && Object.values(lesson.sections).some(Boolean);
  const analysisOn = on.analysis && analyzedCount > 0;
  const workbookOn = on.workbook && sheets.length > 0;
  const questionsOn = on.questions && shown.length > 0;
  const answersOn = on.answers && (workbookOn || questionsOn);

  /** 교재 묶음(목차·간지·쪽 색) — 켠 것만 차례로 번호 */
  const bookParts: BookPart[] = (
    [
      lessonOn
        ? {
            id: "lesson",
            en: "Lesson Materials",
            ko: "수업용 자료",
            sub: LESSON_SECTIONS.filter((s) => lesson.sections[s.key]).map((s) => s.label).join(" · "),
            color: "#1d2a8f",
          }
        : null,
      analysisOn ? { id: "analysis", en: "Analysis", ko: "분석서", sub: `문장 분석 · 본문 ${analyzedCount}개`, color: "#6a4bd8" } : null,
      workbookOn
        ? {
            id: "workbook",
            en: wbMode === "all" ? "Workbook" : "Test",
            ko: wbMode === "all" ? "워크북" : "테스트지",
            sub: types.filter((t) => counts[t]).map((t) => msWbLabel(t)).join(" · "),
            color: "#e8552e",
          }
        : null,
      questionsOn ? { id: "questions", en: "Questions", ko: "문제", sub: `${src.join(" · ")} · ${shown.length}문항`, color: "#0f8a7e" } : null,
      answersOn
        ? { id: "answers", en: "Answer Key", ko: "정답지", sub: [workbookOn ? "워크북 정답" : "", questionsOn ? "문제 해설" : ""].filter(Boolean).join(" · "), color: "#475066" }
        : null,
    ] as Array<Omit<BookPart, "no"> | null>
  )
    .filter((x): x is Omit<BookPart, "no"> => !!x)
    .map((x, i) => ({ ...x, no: String(i + 1).padStart(2, "0") }));
  const partOf = (id: PartId) => bookParts.find((x) => x.id === id);

  /** 목차 쪽 번호: 그린 쪽(테스트 교재 쪽·문제 쪽)을 차례로 세어 묶음의 첫 쪽을 찾는다 */
  const [tocPages, setTocPages] = useState<Record<string, number>>({});
  useEffect(() => {
    const root = document.getElementById("tb-print-root");
    if (!root) return;
    const count = () => {
      const sheets = Array.from(root.querySelectorAll<HTMLElement>(".tb-sheet, .qg-print-page")).filter((el) => !el.closest(".tb-measure"));
      const next: Record<string, number> = {};
      root.querySelectorAll<HTMLElement>("[data-toc]").forEach((w) => {
        const first = Array.from(w.querySelectorAll<HTMLElement>(".tb-sheet, .qg-print-page")).find((el) => !el.closest(".tb-measure"));
        if (first && w.dataset.toc) next[w.dataset.toc] = sheets.indexOf(first) + 1;
      });
      next.__total = sheets.length;
      setTocPages((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
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

  const divider = (id: PartId, items: Array<{ id: string; title: string; source?: string | null }>) => {
    const part = partOf(id);
    if (!part || !toc || !dividers) return null;
    return <DividerSheet part={part} title={bookTitle} items={items.map((x, i) => ({ id: x.id, index: i, title: x.title, source: x.source ?? null }))} />;
  };
  const mk = `${unit.id}-${design}-${lesson.translation}-${lesson.wordExamples}-${types.join(",")}-${wbMode}-${wbSeed}`;
  const qKey = `${qIds.join(".")}-${design}`;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:items-start">
      <aside className="no-print w-full shrink-0 space-y-3 rounded-xl border border-slate-200 bg-white p-4 text-sm print:hidden lg:sticky lg:top-4 lg:w-72 lg:max-h-[calc(100vh-2rem)] lg:overflow-y-auto">
        <MaterialDesignPicker value={design} onChange={setDesign} compact />

        <Section title="표지 · 목차">
          <div className="flex items-center gap-2">
            <span className="w-10 shrink-0 text-slate-500">표지</span>
            <select value={presetId} onChange={(e) => setPresetId(e.target.value)} className="min-w-0 flex-1 rounded border border-slate-300 px-1.5 py-1 text-[12px]">
              {COVER_PRESETS.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name}
                </option>
              ))}
            </select>
          </div>
          <button type="button" onClick={() => setCoverOpen((v) => !v)} className="text-[12px] text-violet-700 underline">
            {coverOpen ? "표지 칸 닫기" : "표지 칸 고치기 (학교·시험·범위)"}
          </button>
          {coverOpen ? (
            <div className="rounded-md border border-slate-200 bg-slate-50 p-2">
              <CoverForm spec={spec} onPatch={(patch) => setSpec((s) => ({ ...s, ...patch }))} />
            </div>
          ) : null}
          <Toggle label="목차" on={toc} onChange={setToc} />
          <Toggle label="묶음마다 간지" on={dividers} onChange={setDividers} dim={!toc} />
        </Section>

        <Section title="수업용 자료" on={on.lesson} onToggle={(v) => setOn({ ...on, lesson: v })}>
          <div className="flex flex-wrap gap-x-3">
            {LESSON_SECTIONS.map((s) => (
              <label key={s.key} className="flex items-center gap-1.5 py-0.5">
                <input
                  type="checkbox"
                  checked={lesson.sections[s.key]}
                  onChange={(e) => setLesson({ ...lesson, sections: { ...lesson.sections, [s.key]: e.target.checked } })}
                />
                {s.label}
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            {(
              [
                ["show", "해석 함께"],
                ["hide", "해석 쓰는 줄"],
              ] as const
            ).map(([v, label]) => (
              <label key={v} className="flex items-center gap-1.5">
                <input type="radio" name="ms-fin-tr" checked={lesson.translation === v} onChange={() => setLesson({ ...lesson, translation: v })} />
                {label}
              </label>
            ))}
          </div>
          <Toggle label="단어장에 예문" on={lesson.wordExamples} onChange={(v) => setLesson({ ...lesson, wordExamples: v })} />
        </Section>

        <Section title={`분석서${analyzedCount ? "" : " (준비 중)"}`} on={on.analysis && analyzedCount > 0} onToggle={(v) => setOn({ ...on, analysis: v })}>
          {analyzedCount ? (
            <>
              <div className="flex items-center gap-2">
                <span className="w-10 shrink-0 text-slate-500">모양</span>
                <div className="flex flex-1 gap-1">
                  {DESIGN_STYLES.map((d) => (
                    <button
                      key={d.id}
                      type="button"
                      title={d.hint}
                      onClick={() => setAnalysis({ ...analysis, style: d.id })}
                      className={`flex-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${
                        analysis.style === d.id ? "border-slate-900 bg-slate-900 text-white" : "border-slate-300 bg-white text-slate-700"
                      }`}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </div>
              <div className="flex gap-3">
                {(
                  [
                    ["full", "전체 해석"],
                    ["chunk", "직독직해"],
                  ] as const
                ).map(([v, label]) => (
                  <label key={v} className="flex items-center gap-1.5">
                    <input type="radio" name="ms-fin-an" checked={analysis.translation === v} onChange={() => setAnalysis({ ...analysis, translation: v })} />
                    {label}
                  </label>
                ))}
              </div>
            </>
          ) : null}
        </Section>

        <Section title="워크북 · 테스트지" on={on.workbook} onToggle={(v) => setOn({ ...on, workbook: v })}>
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setWbMode("all")}
              className={`flex-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${wbMode === "all" ? "border-violet-600 bg-violet-600 text-white" : "border-violet-200 bg-white text-violet-700"}`}
            >
              전체
            </button>
            {LENGTHS.map((l) => (
              <button
                key={l.id}
                type="button"
                onClick={() => {
                  setWbMode(l.id);
                  setWbSeed(`${Date.now()}`);
                }}
                className={`flex-1 rounded-md border px-2 py-0.5 text-xs font-semibold ${wbMode === l.id ? "border-violet-600 bg-violet-600 text-white" : "border-violet-200 bg-white text-violet-700"}`}
              >
                {l.label}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">전체 = 워크북 문항 모두. 짧게·보통·길게 = 무작위로 뽑은 테스트지(누를 때마다 새로).</p>
          <div className="columns-2 gap-2">
            {MS_WB_TYPES.map((t) => (
              <label key={t.key} className={`flex items-center gap-1.5 py-0.5 ${counts[t.key] ? "" : "text-slate-300"}`} title={t.hint}>
                <input
                  type="checkbox"
                  disabled={!counts[t.key]}
                  checked={types.includes(t.key)}
                  onChange={(e) => setTypes(MS_WB_TYPES.map((x) => x.key).filter((x) => (x === t.key ? e.target.checked : types.includes(x))))}
                />
                <span className="truncate">{t.label}</span>
              </label>
            ))}
          </div>
        </Section>

        <Section title={`문제${sources.length ? "" : " (문항 없음)"}`} on={on.questions && sources.length > 0} onToggle={(v) => setOn({ ...on, questions: v })}>
          {sources.map((s) => (
            <label key={s} className="flex items-center gap-2 py-0.5">
              <input type="checkbox" checked={src.includes(s)} onChange={(e) => setSrc(toggle(src, s, e.target.checked))} />
              <span className="flex-1">{s}</span>
              <span className="text-[11px] text-slate-400">{questions.filter((q) => q.source === s && !q.review).length}</span>
            </label>
          ))}
          <div className="flex flex-wrap gap-x-3">
            {AREAS.map((a) => (
              <label key={a} className="flex items-center gap-1.5 py-0.5">
                <input type="checkbox" checked={areas.includes(a)} onChange={(e) => setAreas(toggle(areas, a, e.target.checked))} />
                {a}
              </label>
            ))}
          </div>
          <div className="flex gap-3">
            {(
              [
                ["mc", "객관식"],
                ["sa", "서술형"],
              ] as const
            ).map(([k, label]) => (
              <label key={k} className="flex items-center gap-1.5">
                <input type="checkbox" checked={kinds.includes(k)} onChange={(e) => setKinds(toggle(kinds, k, e.target.checked))} />
                {label}
              </label>
            ))}
          </div>
          <div className="flex gap-1">
            {COUNTS.map((n) => (
              <button
                key={n}
                type="button"
                onClick={() => {
                  setQCount(n);
                  setQSeed(`${Date.now()}`);
                }}
                className={`flex-1 rounded-md border px-1 py-0.5 text-xs font-semibold ${qCount === n ? "border-violet-600 bg-violet-600 text-white" : "border-violet-200 bg-white text-violet-700"}`}
              >
                {n ? `${n}문항` : "전체"}
              </button>
            ))}
          </div>
          <p className="text-[11px] text-slate-500">
            고른 조건 {pool.length}문항 중 {shown.length}문항. 문항 수를 누를 때마다 새로 뽑힙니다.
          </p>
        </Section>

        <Section title="정답지" on={on.answers} onToggle={(v) => setOn({ ...on, answers: v })}>
          <p className="text-[11px] text-slate-500">워크북·테스트지 정답과 문제 해설을 맨 뒤에 모읍니다.</p>
        </Section>

        <button type="button" onClick={() => window.print()} className="w-full rounded-lg bg-slate-900 py-2 font-semibold text-white hover:bg-slate-800">
          인쇄 · PDF 저장
        </button>
      </aside>

      <div className="min-w-0 flex-1 overflow-x-auto bg-slate-100 py-4 print:overflow-visible print:bg-white print:p-0">
        <MsPrintFrame design={design} academyName={academyName}>
          <CoverSheet cover={cover} range={range} logoSrc={null} />
          {toc ? <ContentsSheet parts={bookParts} pages={tocPages} total={tocPages.__total ?? 0} title={bookTitle} range={range} /> : null}
          {lessonOn ? (
            <div data-toc="lesson" className="contents" style={partStyle(partOf("lesson"))}>
              {divider(
                "lesson",
                LESSON_SECTIONS.filter((s) => lesson.sections[s.key]).map((s) => ({ id: s.key, title: s.label })),
              )}
              <MsLessonSheets unit={unit} options={lesson} />
            </div>
          ) : null}
          {analysisOn ? (
            <div data-toc="analysis" className="contents" style={partStyle(partOf("analysis"))}>
              {divider(
                "analysis",
                msAnalyzed(unit).map((t) => ({ id: t.id, title: `${t.part} ${t.title ?? ""}`.trim() })),
              )}
              <MsAnalysisSheets unit={unit} options={analysis} measureKey={mk} />
            </div>
          ) : null}
          {workbookOn ? (
            <div data-toc="workbook" className="contents" style={partStyle(partOf("workbook"))}>
              {divider(
                "workbook",
                sheets.map((s) => ({ id: s.key, title: s.title, source: s.source })),
              )}
              <MsWorkbookSheets sheets={sheets} answers={false} title={wbMode === "all" ? "워크북" : "테스트"} measureKey={mk} />
            </div>
          ) : null}
          {questionsOn ? (
            <div data-toc="questions" className="contents" style={partStyle(partOf("questions"))}>
              {divider(
                "questions",
                src.map((s) => ({ id: s, title: s, source: `${questions.filter((q) => q.source === s && shown.includes(q)).length}문항` })),
              )}
              <QuestionPrintView
                key={`exam-${qKey}`}
                jobId={`ms-${unit.id}`}
                backHref={`${base}/${unit.id}`}
                printBaseHref={`${base}/${unit.id}/exam/${encodeQuestionIds(qIds)}`}
                mode="exam"
                layout="bySet"
                academyName={academyName}
                embedded
                design={design}
                preloaded={preloaded}
              />
            </div>
          ) : null}
          {answersOn ? (
            <div data-toc="answers" className="contents" style={partStyle(partOf("answers"))}>
              {divider(
                "answers",
                [...(workbookOn ? [{ id: "wb", title: wbMode === "all" ? "워크북 정답" : "테스트지 정답" }] : []), ...(questionsOn ? [{ id: "q", title: "문제 해설" }] : [])],
              )}
              {workbookOn ? <MsWorkbookAnswerSheets sheets={sheets} title={wbMode === "all" ? "워크북 정답" : "테스트 정답"} measureKey={mk} /> : null}
              {questionsOn ? (
                <QuestionPrintView
                  key={`answers-${qKey}`}
                  jobId={`ms-${unit.id}`}
                  backHref={`${base}/${unit.id}`}
                  printBaseHref={`${base}/${unit.id}/exam/${encodeQuestionIds(qIds)}`}
                  mode="answers"
                  layout="bySet"
                  academyName={academyName}
                  embedded
                  design={design}
                  preloaded={preloaded}
                />
              ) : null}
            </div>
          ) : null}
        </MsPrintFrame>
      </div>
    </div>
  );
}
