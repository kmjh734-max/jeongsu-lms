"use client";

import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { LessonPackWorkbench, type LessonPackProjectInput } from "@/components/lesson-materials/LessonPackWorkbench";
import {
  AnalysisReportWorkbench,
  type AnalysisReportProjectInput,
} from "@/components/lesson-materials/AnalysisReportWorkbench";
import { WorkbookWorkbench } from "@/components/lesson-materials/WorkbookWorkbench";
import { QuestionPrintView } from "@/components/question-generator/QuestionPrintView";
import { closeTabOrGo } from "@/components/lesson-materials/open-new-document";
import { usePdfPrefetch, usePdfSave } from "@/components/pdf/usePdfSave";
import { collectPrintPages } from "@/lib/pdf/download-sheets-pdf";
import { saveIntegratedDocument } from "@/lib/lesson-materials/document-actions";
import {
  COVER_PRESETS,
  INTEGRATED_EXTRA_KINDS,
  TEST_BOOK_PART_ORDER,
  coverPreset,
  integratedPartMeta,
  type IntegratedExtraKind,
  type IntegratedPartKind,
  type IntegratedPayload,
  type IntegratedSectionKind,
} from "@/lib/lesson-materials/integrated";
import {
  BackCover,
  ContentsPage,
  CoverThumb,
  DividerPage,
  FrontCover,
  type ContentsEntry,
} from "@/components/lesson-materials/integrated/BundleSheets";
import { watchPageNumbers } from "@/lib/lesson-materials/page-numbers";
import { askCreditConfirm } from "@/lib/credits/confirm-store";
import { postJson } from "@/lib/lesson-materials/post-json";
import type { prepareWorkbookExtrasAction } from "@/lib/lesson-materials/test-book-actions";
import {
  DEFAULT_TEST_BOOK_OPTIONS,
  TEST_BOOK_BLEED_COVER,
  TEST_BOOK_THEMES,
  buildTestSheet,
  buildVocabExam,
  buildWordTest,
  isTestBookProjectReady,
  type TestBookProjectInput,
} from "@/lib/lesson-materials/test-book";
import {
  AllVocabSheets,
  AnswerSheets,
  CoverSheet,
  CoverThumbAny,
  BlankNoteSheets,
  LessonSheets,
  PlanSheets,
  TEST_BOOK_CSS,
  TEST_BOOK_FONTS_HREF,
  TestBookBrand,
  TestSheets,
  TranslationBackSheets,
  VocabExamAnswerSheets,
  VocabExamSheets,
  VocabSheets,
  WordTestSheets,
  partStyle,
} from "@/components/lesson-materials/test-book/TestBookSheets";
import {
  LevelSwitch,
  LineModeSwitch,
  TRANSLATION_MODES,
  TypeChecks,
  VocabExamControls,
  WritingScopeSwitch,
} from "@/components/lesson-materials/test-book/TestBookControls";
import { TestDrawDialog } from "@/components/lesson-materials/test-book/TestDrawDialog";
import { RegenMaterials, type RegenPart } from "@/components/lesson-materials/test-book/LessonPackExtras";

export type FinalBundleMaterials = {
  lessonPacks: Array<{ docId: string; name: string; projects: LessonPackProjectInput[] }>;
  analyses: Array<{ docId: string; name: string; projects: AnalysisReportProjectInput[] }>;
  workbooks: Array<{ docId: string; name: string }>;
  questions: Array<{ jobId: string; title: string }>;
  /** 고른 파일들의 지문(계획표·전체 단어장·백지노트) */
  extraProjects: TestBookProjectInput[];
};

/** 쪽으로 세는 요소(각 자료의 A4 쪽). 테스트 교재 쪽은 쪽 나눔 측정 틀 안의 것을 뺀다. */
const PAGE_SELECTOR = ".lesson-pack-a4-sheet, .qg-print-page, .tb-sheet:not(.tb-measure .tb-sheet)";
const PDF_PAGE_SELECTOR =
  ":is(.final-bundle-sheet, .lesson-pack-a4-sheet, .qg-print-page, .tb-sheet:not(.tb-measure .tb-sheet))";

/** 테스트 교재 묶음의 색(목차 번호·쪽 꼬리표) — 테스트 교재와 같다 */
const EXTRA_COLOR: Record<IntegratedExtraKind, string> = {
  plan: "#2b2f38",
  vocab: "#1d2a8f",
  word_note: "#1d2a8f",
  blank_note: "#0f8a7e",
  tests: "#e8552e",
  tb_answers: "#475066",
};
/** 테스트지 자료는 교재 견본처럼 늘 같은 열쇠(새로 섞은 것은 「테스트지 뽑기」) */
const BOOK_SEED = "book";
const isExtra = (k: string): k is IntegratedExtraKind => (INTEGRATED_EXTRA_KINDS as string[]).includes(k);
type PrepareResult = Awaited<ReturnType<typeof prepareWorkbookExtrasAction>>;

const PRINT_CSS = `
/* 미리보기 배율은 화면에서만 건다. 인쇄 계산에 섞이면 쪽이 더 생긴다. */
@media screen {
  #final-bundle-print-root { zoom: var(--bundle-zoom, 1); }
}
@media print {
  @page { size: 210mm 297mm; margin: 0; }
  #final-bundle-print-root, #final-bundle-print-root * { visibility: visible; }
  #final-bundle-print-root {
    position: absolute !important; left: 0 !important; top: 0 !important;
    width: 210mm !important; zoom: 1 !important; gap: 0 !important;
  }
  /* 자료마다 자기 인쇄 틀을 맨 위 왼쪽에 고정하는데, 여기서는 차례로 흐르게 한다. */
  #final-bundle-print-root #lesson-pack-print-root,
  #final-bundle-print-root #analysis-report-print-root,
  #final-bundle-print-root #workbook-print-root,
  #final-bundle-print-root #qg-print-root {
    position: static !important; width: 210mm !important; transform: none !important;
    zoom: 1 !important; gap: 0 !important; padding: 0 !important; margin: 0 !important;
    /* 전역 CSS가 붙인 이름 붙은 쪽(app-print-a4)이 바뀌는 곳마다 빈 쪽이 끼어 끈다. */
    page: auto !important;
  }
  #final-bundle-print-root .final-bundle-sheet {
    height: 296.5mm !important; box-shadow: none !important;
    break-after: page; page-break-after: always;
  }
  #final-bundle-print-root .final-bundle-sheet--last { break-after: auto; page-break-after: auto; }
  /* 자료의 마지막 쪽 뒤에서도 쪽을 넘겨 다음 간지가 같은 쪽에 붙지 않게 한다. */
  #final-bundle-print-root .lesson-pack-a4-sheet--last,
  #final-bundle-print-root .qg-print-page-last {
    break-after: page !important; page-break-after: always !important;
  }
  #final-bundle-print-root .bundle-screen-only { display: none !important; }
  #final-bundle-print-root .tb-sheet { box-shadow: none !important; }
  /* 겹친 flex 상자는 인쇄에서 쪽 나눔이 어긋나 빈 쪽이 생긴다. 인쇄에서는 블록으로 흐르게 한다. */
  #final-bundle-print-root,
  #final-bundle-print-root .bundle-section,
  #final-bundle-print-root [data-bundle-section],
  #final-bundle-print-root #lesson-pack-print-root,
  #final-bundle-print-root #analysis-report-print-root,
  #final-bundle-print-root #workbook-print-root { display: block !important; }
}
`;

type SectionPlan = {
  key: string;
  kind: IntegratedPartKind | "answers";
  en: string;
  title: string;
  sub: string;
};

export function FinalBundleClient({
  role,
  docId,
  name,
  initialPayload,
  materials,
  logoSrc,
  academyName,
}: {
  role: "admin" | "teacher";
  docId: string;
  name: string;
  initialPayload: IntegratedPayload;
  materials: FinalBundleMaterials;
  logoSrc: string;
  academyName: string;
}) {
  const base = role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const qgBase = role === "admin" ? "/admin/question-generator" : "/teacher/question-generator";
  const [payload, setPayload] = useState<IntegratedPayload>(() => ({
    ...initialPayload,
    cover: {
      ...initialPayload.cover,
      title: initialPayload.cover.title || name,
      academy: initialPayload.cover.academy || academyName,
    },
  }));
  const [zoom, setZoom] = useState(60);
  /** PDF로 바로 저장(인쇄 창 없이) */
  const pdf = usePdfSave();
  // 미리 PDF를 만들어 두어 「PDF로 저장」을 누르면 바로 받아진다
  usePdfPrefetch("final-bundle-print-root", PDF_PAGE_SELECTOR);
  const [pageCounts, setPageCounts] = useState<Record<string, number>>({});
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const rootRef = useRef<HTMLDivElement>(null);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const preset = coverPreset(payload.cover.presetId);
  const bleedCover = payload.cover.presetId === TEST_BOOK_BLEED_COVER;

  const extraProjects = materials.extraProjects;
  const ready = useMemo(() => extraProjects.filter(isTestBookProjectReady), [extraProjects]);
  const vocabReady = extraProjects.filter((p) => (p.material?.vocab?.length ?? 0) > 0);
  /** 재료(1장 자료·단어 정리)가 없는 지문 — 단어장·단어 정리·테스트지에서 빠진다 */
  const vocabMissing = extraProjects.filter((p) => !isTestBookProjectReady(p));
  const tOpt = payload.tests;
  const testsAny = tOpt.types.length > 0 || tOpt.wordTest || tOpt.allWordTest;
  /** 파일 묶음은 고른 자료가 있을 때, 테스트 교재 묶음은 켰고 지문이 있을 때 */
  const has: Record<IntegratedPartKind, boolean> = {
    lesson_pack: materials.lessonPacks.length > 0,
    analysis_report: materials.analyses.length > 0,
    questions: materials.questions.length > 0,
    workbook: materials.workbooks.length > 0,
    plan: payload.extras.plan && extraProjects.length > 0,
    vocab: payload.extras.vocab && vocabReady.length > 0,
    word_note: payload.extras.word_note && ready.length > 0,
    blank_note: payload.extras.blank_note && extraProjects.length > 0,
    tests: payload.extras.tests && ready.length > 0 && testsAny,
    tb_answers: payload.extras.tb_answers && payload.extras.tests && ready.length > 0 && testsAny,
  };

  /** 테스트지 자료(지문마다 동반의어·품사 TEST + 유형별 테스트, 앞에 단어 시험지) */
  const book = useMemo(
    () =>
      ready.map((p) => ({
        project: p,
        word: buildWordTest(p, BOOK_SEED),
        sheet: buildTestSheet(p, tOpt.types, {
          seed: BOOK_SEED,
          blankMode: "same",
          writing: tOpt.writing,
          lineMode: tOpt.lineMode,
          level: tOpt.level,
        }),
      })),
    [ready, tOpt.types, tOpt.writing, tOpt.lineMode, tOpt.level]
  );
  const vocabExam = useMemo(
    () =>
      buildVocabExam(
        ready.map((p) => ({ passage: extraProjects.indexOf(p) + 1, vocab: p.material.vocab })),
        { ...tOpt.vocabExam, seed: `${BOOK_SEED}|vocab` }
      ),
    [ready, extraProjects, tOpt.vocabExam]
  );
  const updateTests = (patch: Partial<IntegratedPayload["tests"]>) => update({ tests: { ...payload.tests, ...patch } });
  const [drawOpen, setDrawOpen] = useState(false);
  // 글꼴이 늦게 들어오면 테스트 교재 쪽 나눔을 다시 잰다(먼저 잰 높이로 나누면 쪽이 넘친다)
  const [fontsTick, setFontsTick] = useState(0);
  useEffect(() => {
    if (typeof document === "undefined" || !document.fonts) return;
    let alive = true;
    const bump = () => alive && setFontsTick((t) => t + 1);
    void document.fonts.ready.then(bump);
    document.fonts.addEventListener?.("loadingdone", bump);
    return () => {
      alive = false;
      document.fonts.removeEventListener?.("loadingdone", bump);
    };
  }, []);

  // 목차·본문 순서. 고른 자료가 없는 유형은 뺀다. 변형문제 정답은 맨 뒤에 모은다.
  const sections: SectionPlan[] = useMemo(() => {
    const out: SectionPlan[] = payload.parts
      .filter((k) => has[k] && k !== "plan")
      .map((k) => ({ key: k, kind: k, ...integratedPartMeta(k) }));
    if (payload.answerKey && has.questions) {
      out.push({ key: "answers", kind: "answers", en: "ANSWER KEY", title: "정답", sub: "변형문제 정답" });
    }
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payload.parts, payload.extras, payload.answerKey, materials]);

  // 인쇄 CSS
  useEffect(() => {
    const el = document.createElement("style");
    el.id = "final-bundle-print-style";
    el.textContent = PRINT_CSS;
    document.head.appendChild(el);
    return () => el.remove();
  }, []);

  // 자료마다 쪽 수를 세어 목차 쪽 번호를 채운다(각 자료가 쪽 나눔을 마친 뒤 바뀌므로 계속 본다).
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    const count = () => {
      const next: Record<string, number> = {};
      root.querySelectorAll<HTMLElement>("[data-bundle-section]").forEach((sec) => {
        const n = Array.from(sec.querySelectorAll<HTMLElement>(PAGE_SELECTOR)).filter(
          (el) => el.offsetParent !== null
        ).length;
        const key = sec.dataset.bundleSection!;
        next[key] = (next[key] ?? 0) + n;
      });
      setPageCounts((prev) => (JSON.stringify(prev) === JSON.stringify(next) ? prev : next));
    };
    count();
    const observer = new MutationObserver(() => count());
    observer.observe(root, { childList: true, subtree: true });
    const timer = setInterval(count, 1500);
    return () => {
      observer.disconnect();
      clearInterval(timer);
    };
  }, []);

  /*
   * 쪽번호를 장마다 찍는다. 목차의 쪽 번호와 같은 셈법(앞표지 1, 목차 2, …)이라
   * 목차에 적힌 번호로 그 쪽을 찾을 수 있다. 표지와 뒤표지에는 번호를 적지 않는다.
   */
  useEffect(() => {
    return watchPageNumbers(rootRef.current, true, {
      skip: (el, i) => i === 0 || el.classList.contains("final-bundle-sheet--last"),
    });
  }, []);

  // 쪽 번호: 앞표지 1, (학습 계획표), 목차, 그다음 간지와 자료 쪽을 차례로 센다.
  const contents: ContentsEntry[] = [];
  let page = 3 + (has.plan ? (pageCounts.plan ?? 0) : 0);
  sections.forEach((s, i) => {
    if (payload.dividers) page += 1;
    const n = pageCounts[s.key] ?? 0;
    contents.push({
      number: String(i + 1).padStart(2, "0"),
      en: s.en,
      sub: s.sub,
      from: n > 0 ? page : null,
      to: n > 0 ? page + n - 1 : null,
    });
    page += n;
  });
  const totalPages = page; // 뒤표지 포함(page는 다음 쪽 번호이므로 뒤표지 번호와 같다)

  /** 설정을 바꾸면 화면에 바로 반영하고, 입력이 잠깐 멈춘 뒤 파일에 저장한다. */
  function update(patch: Partial<IntegratedPayload>) {
    const next = { ...payload, ...patch };
    setPayload(next);
    if (saveTimer.current) clearTimeout(saveTimer.current);
    setSaveState("saving");
    saveTimer.current = setTimeout(async () => {
      try {
        const res = await saveIntegratedDocument(role, { id: docId, payload: next });
        setSaveState(res.ok ? "saved" : "error");
      } catch {
        setSaveState("error");
      }
    }, 800);
  }
  const updateCover = (patch: Partial<IntegratedPayload["cover"]>) =>
    update({ cover: { ...payload.cover, ...patch } });

  /** 보이는 묶음끼리 자리를 바꾼다(꺼 둔 묶음은 건너뛴다). 파일 묶음 순서(order)도 맞춰 둔다. */
  function move(kind: IntegratedPartKind, dir: -1 | 1) {
    const parts = [...payload.parts];
    const shown = parts.filter((k) => k !== "plan" && (!isExtra(k) || payload.extras[k]));
    const a = shown.indexOf(kind);
    const b = a + dir;
    if (a < 0 || b < 0 || b >= shown.length) return;
    const i = parts.indexOf(shown[a]!);
    const j = parts.indexOf(shown[b]!);
    [parts[i], parts[j]] = [parts[j]!, parts[i]!];
    update({ parts, order: parts.filter((k): k is IntegratedSectionKind => !isExtra(k)) });
  }

  /** 「테스트 교재 구성」: 계획표·단어장·백지노트를 켜고 테스트 교재 차례로 놓는다 */
  function applyTestBookPreset() {
    const parts = [...TEST_BOOK_PART_ORDER];
    update({
      parts,
      order: parts.filter((k): k is IntegratedSectionKind => !isExtra(k)),
      extras: { plan: true, vocab: true, word_note: true, blank_note: true, tests: true, tb_answers: true },
      dividers: true,
    });
  }

  /** 단어장 재료가 없는 지문: 지문당 한 번 값을 받고 만든 뒤 다시 불러온다(워크북 새 유형과 같은 재료·같은 값) */
  const [preparing, setPreparing] = useState<string | null>(null);
  async function prepareVocab() {
    if (preparing || vocabMissing.length === 0) return;
    const go = await askCreditConfirm({
      title: "전체 단어장",
      description: "지문마다 단어 정리(품사·지문 속 뜻·파생어·동반의어)를 만듭니다. 워크북 새 유형과 같은 재료라, 이미 값을 낸 지문은 다시 받지 않습니다.",
      subject: `단어장 재료가 없는 지문 ${vocabMissing.length}개`,
      contents: vocabMissing.map((p) => p.title),
      items: [{ feature: "lesson_workbook_extras", quantity: vocabMissing.length }],
    });
    if (!go) return;
    const failed: string[] = [];
    for (let i = 0; i < vocabMissing.length; i++) {
      const p = vocabMissing[i]!;
      setPreparing(`단어장 재료를 만들고 있습니다… (${i + 1}/${vocabMissing.length})`);
      try {
        const res = await postJson<PrepareResult>("/api/lesson-materials/test-book", {
          role,
          op: "prepareWorkbook",
          projectId: p.id,
        });
        if (!res.ok) failed.push(`「${p.title}」 ${res.message}`);
      } catch (e) {
        failed.push(`「${p.title}」 ${e instanceof Error ? e.message : "만들지 못했습니다."}`);
      }
    }
    if (failed.length) {
      setPreparing(failed.join(" · "));
      return;
    }
    window.location.reload();
  }

  /** 기능마다 다시 만들기(단어 정리·직독직해·1장 자료 재료 — 값 없음) 뒤 다시 불러온다 */
  async function regenerateMaterials(ids: string[], parts: RegenPart[]) {
    if (preparing || !ids.length || !parts.length) return;
    const failed: string[] = [];
    for (let i = 0; i < ids.length; i++) {
      setPreparing(`다시 만들고 있습니다… (${i + 1}/${ids.length})`);
      try {
        const res = await postJson<PrepareResult>("/api/lesson-materials/test-book", {
          role,
          op: "prepareWorkbook",
          projectId: ids[i]!,
          regenerate: parts,
        });
        if (!res.ok) failed.push(res.message);
      } catch (e) {
        failed.push(e instanceof Error ? e.message : "다시 만들지 못했습니다.");
      }
    }
    if (failed.length) {
      setPreparing(failed.join(" · "));
      return;
    }
    window.location.reload();
  }

  /*
   * 표지 글자를 한 자 칠 때마다 본문 122쪽이 통째로 다시 그려져 입력이 버벅였다
   * (선생님 지적 2026-09-18). 본문은 고른 자료·순서에만 달렸으므로 따로 기억해 두고,
   * 표지 글자가 바뀌어도 다시 만들지 않는다.
   */
  const renderSection = (s: SectionPlan) => {
    if (s.kind !== "answers" && isExtra(s.kind)) {
      const no = String(sections.findIndex((x) => x.key === s.key) + 1).padStart(2, "0");
      const style = partStyle({ id: s.kind, no, en: s.en, ko: s.title, color: EXTRA_COLOR[s.kind] });
      const indexOf = (id: string) => extraProjects.findIndex((p) => p.id === id);
      const mk = `bundle-${s.kind}|${fontsTick}`;
      return (
        <div className="contents" style={style}>
          {s.kind === "vocab" ? (
            <AllVocabSheets projects={vocabReady} indexOf={indexOf} measureKey={mk} />
          ) : s.kind === "word_note" ? (
            <>
              {ready.map((p) => (
                <div key={p.id} className="contents">
                  <VocabSheets index={indexOf(p.id)} project={p} measureKey={mk} />
                  <LessonSheets index={indexOf(p.id)} project={p} translation={tOpt.translation} measureKey={`${mk}|${tOpt.translation}`} />
                </div>
              ))}
              {tOpt.translation === "back" ? <TranslationBackSheets projects={ready} measureKey={mk} /> : null}
            </>
          ) : s.kind === "blank_note" ? (
            extraProjects.map((p, i) => <BlankNoteSheets key={p.id} index={i} project={p} />)
          ) : s.kind === "tests" ? (
            <>
              {tOpt.allWordTest ? <VocabExamSheets exam={vocabExam} measureKey={mk} /> : null}
              {book.map((b) => (
                <div key={b.project.id} className="contents">
                  {tOpt.wordTest ? <WordTestSheets index={indexOf(b.project.id)} project={b.project} test={b.word} measureKey={mk} /> : null}
                  {tOpt.types.length ? (
                    <TestSheets index={indexOf(b.project.id)} project={b.project} sheet={b.sheet} title="테스트" measureKey={mk} />
                  ) : null}
                </div>
              ))}
            </>
          ) : s.kind === "tb_answers" ? (
            <>
              {tOpt.allWordTest ? <VocabExamAnswerSheets exam={vocabExam} measureKey={mk} /> : null}
              {tOpt.wordTest || tOpt.types.length ? (
                <AnswerSheets
                  title="테스트지 정답"
                  entries={book.map((b) => ({
                    index: indexOf(b.project.id),
                    project: b.project,
                    word: tOpt.wordTest ? b.word : undefined,
                    sheet: tOpt.types.length ? b.sheet : { ...b.sheet, sections: [] },
                  }))}
                  measureKey={mk}
                />
              ) : null}
            </>
          ) : null}
        </div>
      );
    }
    if (s.kind === "lesson_pack") {
      return materials.lessonPacks.map((m) => (
        <LessonPackWorkbench key={m.docId} role={role} projects={m.projects} logoSrc={logoSrc} embedded />
      ));
    }
    if (s.kind === "analysis_report") {
      return materials.analyses.map((m) => (
        <AnalysisReportWorkbench key={m.docId} role={role} projects={m.projects} logoSrc={logoSrc} embedded />
      ));
    }
    if (s.kind === "workbook") {
      return materials.workbooks.map((m) => <WorkbookWorkbench key={m.docId} role={role} embeddedDocId={m.docId} />);
    }
    const mode = s.kind === "answers" ? "answers" : "exam";
    return materials.questions.map((q) => (
      <QuestionPrintView
        key={`${q.jobId}-${mode}`}
        jobId={q.jobId}
        backHref={base}
        printBaseHref={`${qgBase}/generations/${q.jobId}`}
        mode={mode}
        academyName={academyName}
        logoSrc={logoSrc}
        embedded
      />
    ));
  };

  const sectionBodies = useMemo(() => {
    const out: Record<string, ReactNode> = {};
    for (const s of sections) out[s.key] = renderSection(s);
    return out;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sections, materials, role, logoSrc, academyName, base, qgBase, book, vocabExam, tOpt.translation, tOpt.wordTest, tOpt.allWordTest, fontsTick]);

  /** 학습 계획표 — 목차보다 앞, 앞표지 바로 뒤(선생님 2026-10-21) */
  const planBody = useMemo(
    () =>
      has.plan ? (
        <div data-bundle-section="plan" className="contents" style={partStyle({ id: "plan", no: "00", en: "STUDY PLAN", ko: "학습 계획표", color: EXTRA_COLOR.plan })}>
          <PlanSheets
            projects={extraProjects}
            measureKey={`bundle-plan|${fontsTick}`}
            options={{
              ...DEFAULT_TEST_BOOK_OPTIONS,
              ...tOpt,
              tests: has.tests,
              lesson: has.lesson_pack || has.word_note,
              blankNote: has.blank_note,
              analysis: has.analysis_report,
            }}
          />
        </div>
      ) : null,
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [has.plan, has.tests, has.lesson_pack, has.word_note, has.blank_note, has.analysis_report, extraProjects, tOpt, fontsTick]
  );

  /** 단어학습 단어장 등록(테스트 교재와 같다 — 다시 누르면 같은 단어장을 고친다) */
  const [vocabReg, setVocabReg] = useState<{ busy: boolean; msg: string | null; error: boolean; href: string | null }>({
    busy: false,
    msg: null,
    error: false,
    href: null,
  });
  async function registerVocab() {
    if (vocabReg.busy) return;
    setVocabReg({ busy: true, msg: null, error: false, href: null });
    try {
      const res = await postJson<{ ok: true; setId: string; count: number; created: boolean } | { ok: false; message: string }>(
        "/api/lesson-materials/test-book",
        {
          op: "registerVocab",
          role,
          id: docId,
          title: payload.cover.title.replace(/\s+/g, " ").trim() || name,
          projectIds: extraProjects.map((p) => p.id),
        }
      );
      if (!res.ok) {
        setVocabReg({ busy: false, msg: res.message, error: true, href: null });
        return;
      }
      // 파일에 남긴 단어장 id를 화면 설정에도 둔다(설정을 저장할 때 지워지지 않게)
      setPayload((p) => ({ ...p, vocabSetId: res.setId }));
      setVocabReg({
        busy: false,
        msg: `${res.created ? "단어장을 만들었습니다" : "단어장을 고쳤습니다"} · ${res.count}단어`,
        error: false,
        href: `/${role}/vocab/set/${res.setId}`,
      });
    } catch (e) {
      setVocabReg({ busy: false, msg: e instanceof Error ? e.message : "등록하지 못했습니다.", error: true, href: null });
    }
  }
  const brand = useMemo(() => ({ logoSrc: logoSrc || null, academy: payload.cover.academy || academyName }), [
    logoSrc,
    payload.cover.academy,
    academyName,
  ]);

  const inputClass =
    "w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-violet-300 focus:ring-2 focus:ring-violet-100";

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-200 print:static print:block print:bg-white">
      <aside className="flex w-[340px] shrink-0 flex-col border-r border-slate-200 bg-white print:hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <button type="button" onClick={() => closeTabOrGo(base)} className="text-sm font-semibold text-slate-500 hover:text-slate-800">
            ‹ 닫기
          </button>
          <p className="flex items-center gap-2 text-base font-black text-slate-900">
            <span className="rounded-md bg-violet-100 px-1.5 py-0.5 text-violet-700">🗂</span>
            통합 자료 프리뷰
          </p>
        </div>

        <div className="min-h-0 flex-1 space-y-4 overflow-auto p-4">
          <section className="space-y-2">
            <p className="text-xs font-bold text-slate-600">표지</p>
            <div className="grid grid-cols-2 gap-2.5">
              {/* 테스트 교재 표지(색 번짐 · 큰 글자) — 선생님 2026-10-21: 테스트북 기능을 모두 통합자료에도 */}
              <button
                type="button"
                onClick={() => updateCover({ presetId: TEST_BOOK_BLEED_COVER })}
                aria-pressed={bleedCover}
                className={`overflow-hidden rounded-lg border-2 bg-white text-left transition ${
                  bleedCover ? "border-violet-600 shadow-md" : "border-slate-200 hover:border-slate-300"
                }`}
              >
                <CoverThumbAny presetId={TEST_BOOK_BLEED_COVER} cover={payload.cover} range={payload.cover.label} logoSrc={logoSrc} widthPx={144} />
                <div className="px-2 py-1.5">
                  <p className="truncate text-[12px] font-bold text-slate-800">색 번짐</p>
                  <p className="truncate text-[10.5px] text-slate-500">테스트 교재 표지 · 큰 글자</p>
                </div>
              </button>
              {COVER_PRESETS.map((p) => {
                const on = !bleedCover && preset.id === p.id;
                return (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => updateCover({ presetId: p.id })}
                    aria-pressed={on}
                    className={`overflow-hidden rounded-lg border-2 bg-white text-left transition ${
                      on ? "border-violet-600 shadow-md" : "border-slate-200 hover:border-slate-300"
                    }`}
                  >
                    <CoverThumb preset={p} cover={payload.cover} widthPx={144} logoSrc={logoSrc} />
                    <div className="px-2 py-1.5">
                      <p className="truncate text-[12px] font-bold text-slate-800">{p.name}</p>
                      <p className="truncate text-[10.5px] text-slate-500">{p.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>

          <section className="space-y-2 rounded-xl bg-slate-50 p-3">
            <CoverField label="시험범위 라벨" value={payload.cover.label} placeholder="예: 호원고 3학년 · 26년도 1학기 중간고사 대비" inputClass={inputClass} onCommit={(v) => updateCover({ label: v })} />
            <CoverField label="표지 메인 제목 (엔터로 줄 구분)" value={payload.cover.title} placeholder={"예: 영어독해와작문\n천재(윤) 2과"} inputClass={inputClass} rows={2} onCommit={(v) => updateCover({ title: v })} />
            <CoverField label="제목 아래 한 줄 · 꼬릿말 (엔터로 줄 구분)" value={payload.cover.progress} placeholder={"예: Reading & Writing · Lesson 2\n2026. 3."} inputClass={inputClass} rows={2} onCommit={(v) => updateCover({ progress: v })} />
            <CoverField label="학원명" value={payload.cover.academy} inputClass={inputClass} onCommit={(v) => updateCover({ academy: v })} />
            {bleedCover ? (
              <CoverField
                label="큰 글자 (엔터로 줄 구분 · 비우면 read. test. note.)"
                value={payload.cover.headline ?? ""}
                placeholder={"예: 호원고 1학년\n기말 대비\n테스트북"}
                inputClass={inputClass}
                rows={3}
                onCommit={(v) => updateCover({ headline: v })}
              />
            ) : null}
          </section>

          <section className="space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-xs font-bold text-slate-600">구성</p>
              <button
                type="button"
                onClick={applyTestBookPreset}
                title="계획표 → 전체 단어장 → 수업용 자료 → 백지노트 → 분석서 → 워크북 → 변형문제"
                className="rounded-md border border-violet-200 bg-violet-50 px-2 py-0.5 text-[11px] font-bold text-violet-700 hover:bg-violet-100"
              >
                테스트 교재 구성
              </button>
            </div>
            <div className="space-y-1 rounded-xl bg-slate-50 p-2.5">
              {INTEGRATED_EXTRA_KINDS.map((k) => (
                <label key={k} className="flex items-center gap-2 text-sm text-slate-700">
                  <input
                    type="checkbox"
                    checked={payload.extras[k]}
                    onChange={(e) => update({ extras: { ...payload.extras, [k]: e.target.checked } })}
                  />
                  {integratedPartMeta(k).title}
                  <span className="text-[11px] text-slate-400">{integratedPartMeta(k).sub}</span>
                </label>
              ))}
              {(payload.extras.vocab || payload.extras.word_note || payload.extras.tests) && vocabMissing.length > 0 ? (
                <div className="mt-1 rounded-lg border border-amber-200 bg-amber-50 px-2.5 py-2 text-[11px] text-amber-800">
                  재료가 없는 지문 {vocabMissing.length}개는 단어장·단어 정리·테스트지에서 빠집니다.
                  <button
                    type="button"
                    disabled={!!preparing && preparing.endsWith(")")}
                    onClick={() => void prepareVocab()}
                    className="mt-1.5 block w-full rounded-md bg-amber-500 py-1 font-bold text-white hover:bg-amber-600 disabled:opacity-60"
                  >
                    재료 만들기 (지문 {vocabMissing.length}개)
                  </button>
                  {preparing ? <p className="mt-1">{preparing}</p> : null}
                </div>
              ) : null}
              {INTEGRATED_EXTRA_KINDS.some((k) => payload.extras[k]) ? (
                <div className="pt-1">
                  <p className="mb-1 text-[11px] font-bold text-slate-500">계획표·단어장·백지노트 디자인</p>
                  <div className="grid grid-cols-2 gap-1">
                    {TEST_BOOK_THEMES.map((t) => (
                      <button
                        key={t.key}
                        type="button"
                        onClick={() => update({ theme: t.key as IntegratedPayload["theme"] })}
                        aria-pressed={payload.theme === t.key}
                        className={`rounded-md border px-1 py-1 text-[11px] font-bold ${
                          payload.theme === t.key
                            ? "border-violet-500 bg-violet-600 text-white"
                            : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                        }`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {payload.extras.word_note ? (
                <div className="space-y-1 pt-1">
                  <p className="text-[11px] font-bold text-slate-500">문장별 해석</p>
                  <div className="grid grid-cols-3 gap-1 rounded-lg bg-slate-100 p-1">
                    {TRANSLATION_MODES.map((t) => (
                      <button
                        key={t.id}
                        type="button"
                        onClick={() => updateTests({ translation: t.id })}
                        className={`rounded-md px-1 py-1 text-[11px] font-bold ${tOpt.translation === t.id ? "bg-white text-slate-900 shadow-sm" : "text-slate-500"}`}
                      >
                        {t.label}
                      </button>
                    ))}
                  </div>
                </div>
              ) : null}
              {payload.extras.tests ? (
                <div className="space-y-2 rounded-lg border border-violet-200 bg-white p-2.5">
                  <p className="text-[11px] font-bold text-violet-900">테스트지 자료</p>
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <input type="checkbox" checked={tOpt.allWordTest} onChange={(e) => updateTests({ allWordTest: e.target.checked })} />
                    단어 시험지(지문 합침)
                  </label>
                  {tOpt.allWordTest ? <VocabExamControls value={tOpt.vocabExam} onChange={(v) => updateTests({ vocabExam: v })} /> : null}
                  <label className="flex items-center gap-2 text-xs font-semibold text-slate-700">
                    <input type="checkbox" checked={tOpt.wordTest} onChange={(e) => updateTests({ wordTest: e.target.checked })} />
                    지문마다 동반의어 · 품사 TEST
                  </label>
                  <TypeChecks value={tOpt.types} onChange={(types) => updateTests({ types })} />
                  <LevelSwitch value={tOpt.level} onChange={(level) => updateTests({ level })} />
                  {tOpt.types.includes("line") ? <LineModeSwitch value={tOpt.lineMode} onChange={(lineMode) => updateTests({ lineMode })} /> : null}
                  {tOpt.types.includes("writing") ? <WritingScopeSwitch value={tOpt.writing} onChange={(writing) => updateTests({ writing })} /> : null}
                </div>
              ) : null}
              {extraProjects.length ? (
                <div className="grid grid-cols-2 gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={() => setDrawOpen(true)}
                    className="rounded-lg border border-violet-300 bg-white py-1.5 text-[12px] font-bold text-violet-800 hover:bg-violet-50"
                  >
                    테스트지 뽑기
                  </button>
                  <button
                    type="button"
                    disabled={vocabReg.busy || !vocabReady.length}
                    onClick={() => void registerVocab()}
                    title="전체 단어(뜻·품사·동의어·반의어·지문 예문)를 단어학습 「테스트 교재」 폴더에 단어장으로 넣습니다"
                    className="rounded-lg border border-emerald-300 bg-white py-1.5 text-[12px] font-bold text-emerald-800 hover:bg-emerald-50 disabled:opacity-50"
                  >
                    {vocabReg.busy ? "등록 중…" : "단어학습에 등록"}
                  </button>
                </div>
              ) : null}
              {INTEGRATED_EXTRA_KINDS.some((k) => payload.extras[k]) && ready.length ? (
                <RegenMaterials
                  passages={ready.map((p) => ({ id: p.id, label: `${String(extraProjects.indexOf(p) + 1).padStart(2, "0")} · ${p.title}` }))}
                  busy={!!preparing && preparing.endsWith(")")}
                  onRun={(ids, parts) => void regenerateMaterials(ids, parts)}
                />
              ) : null}
              {preparing && !vocabMissing.length ? <p className="text-[11px] text-violet-700">{preparing}</p> : null}
              {vocabReg.msg ? (
                <p className={`text-[11px] font-semibold ${vocabReg.error ? "text-rose-600" : "text-emerald-700"}`}>
                  {vocabReg.msg}
                  {vocabReg.href ? (
                    <>
                      {" · "}
                      <a href={vocabReg.href} target="_blank" rel="noreferrer" className="underline">
                        단어장 열기
                      </a>
                    </>
                  ) : null}
                </p>
              ) : null}
            </div>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={payload.dividers} onChange={(e) => update({ dividers: e.target.checked })} />
              자료 사이에 간지 넣기
            </label>
            <label className="flex items-center gap-2 text-sm text-slate-700">
              <input type="checkbox" checked={payload.answerKey} onChange={(e) => update({ answerKey: e.target.checked })} />
              변형문제 정답을 맨 뒤에 모으기
            </label>
            <ol className="space-y-1">
              {payload.parts
                .filter((k) => k !== "plan" && (!isExtra(k) || payload.extras[k]))
                .map((k, i, shown) => (
                <li
                  key={k}
                  className={`flex items-center justify-between rounded-lg border px-2.5 py-1.5 text-sm ${
                    has[k] ? "border-slate-200 bg-white text-slate-800" : "border-dashed border-slate-200 text-slate-400"
                  }`}
                >
                  <span>
                    <span className="mr-1.5 font-bold text-violet-600">{i + 1}</span>
                    {integratedPartMeta(k).title}
                    {!has[k] ? (isExtra(k) ? " (지문 재료 없음)" : " (고른 자료 없음)") : ""}
                  </span>
                  <span className="flex gap-1">
                    <button type="button" disabled={i === 0} onClick={() => move(k, -1)} className="rounded px-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                      ‹
                    </button>
                    <button type="button" disabled={i === shown.length - 1} onClick={() => move(k, 1)} className="rounded px-1.5 text-slate-500 hover:bg-slate-100 disabled:opacity-30">
                      ›
                    </button>
                  </span>
                </li>
              ))}
            </ol>
          </section>
          {saveState !== "idle" ? (
            <p className={`text-[11px] ${saveState === "error" ? "text-rose-600" : "text-slate-400"}`}>
              {saveState === "saving" ? "저장 중…" : saveState === "saved" ? "설정을 저장했습니다." : "저장하지 못했습니다."}
            </p>
          ) : null}
        </div>

        <div className="border-t border-slate-100 p-4">
          <button
            type="button"
            onClick={() => window.print()}
            className="w-full rounded-xl bg-violet-600 py-3 text-sm font-bold text-white hover:bg-violet-700"
          >
            인쇄 ({totalPages}쪽)
          </button>
          <button
            type="button"
            disabled={!!pdf.busy}
            onClick={() =>
              void pdf.save(
                "통합자료",
                collectPrintPages(document.getElementById("final-bundle-print-root"), PDF_PAGE_SELECTOR),
                [payload.cover.title.replace(/\s+/g, " ") || name]
              )
            }
            className="mt-2 w-full rounded-xl border border-violet-300 bg-white py-2.5 text-sm font-bold text-violet-800 hover:bg-violet-50 disabled:opacity-50"
          >
            ⤓ PDF로 저장
          </button>
          {pdf.status ? (
            <p className={`mt-1 text-[11px] font-semibold ${pdf.busy ? "text-violet-700" : "text-rose-600"}`}>{pdf.status}</p>
          ) : null}
          <p className="mt-2 text-[10px] leading-relaxed text-slate-400">
            쪽 번호는 자료를 모두 불러온 뒤 맞춰집니다. 모두 불러온 뒤 저장하세요.
          </p>
        </div>
      </aside>

      <main className="relative min-w-0 flex-1 overflow-auto print:static print:overflow-visible">
        <div className="sticky top-0 z-10 flex items-center justify-center gap-2 border-b border-slate-200/80 bg-white/90 px-4 py-2 backdrop-blur print:hidden">
          <button type="button" className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs" onClick={() => setZoom((z) => Math.max(30, z - 10))}>
            −
          </button>
          <span className="text-xs font-semibold text-slate-600">{zoom}%</span>
          <button type="button" className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs" onClick={() => setZoom((z) => Math.min(120, z + 10))}>
            +
          </button>
        </div>
        {sections.some((s) => isExtra(s.kind)) ? (
          <>
            <link rel="stylesheet" href={TEST_BOOK_FONTS_HREF} />
            <style>{TEST_BOOK_CSS}</style>
          </>
        ) : null}
        <TestBookBrand.Provider value={brand}>
        <div className="flex justify-center p-6 print:p-0">
          <div
            ref={rootRef}
            id="final-bundle-print-root"
            className={`tb-theme-${payload.theme} flex flex-col items-center gap-6 print:gap-0 [&_.tb-sheet]:shadow-xl`}
            style={{ ["--bundle-zoom" as string]: String(zoom / 100) }}
          >
            {bleedCover ? (
              <CoverSheet cover={{ ...payload.cover, headline: payload.cover.headline ?? "" }} range={payload.cover.label} logoSrc={logoSrc} />
            ) : (
              <FrontCover preset={preset} cover={payload.cover} logoSrc={logoSrc} />
            )}
            {planBody}
            <ContentsPage entries={contents} cover={payload.cover} accent={preset.accent} />
            {sections.map((s, i) => (
              <div key={s.key} className="bundle-section flex flex-col items-center gap-6 print:gap-0">
                {payload.dividers ? (
                  <DividerPage
                    number={String(i + 1).padStart(2, "0")}
                    en={s.en}
                    title={s.title}
                    sub={s.sub}
                    preset={preset}
                    cover={payload.cover}
                  />
                ) : null}
                <div data-bundle-section={s.key} className="flex flex-col items-center gap-6 print:gap-0">
                  {sectionBodies[s.key]}
                </div>
              </div>
            ))}
            <BackCover preset={preset} cover={payload.cover} />
          </div>
        </div>
        </TestBookBrand.Provider>
        <TestDrawDialog role={role} projectIds={extraProjects.map((p) => p.id)} open={drawOpen} onClose={() => setDrawOpen(false)} />
      </main>
    </div>
  );
}

/**
 * 표지 글자 입력 칸. 타자는 이 칸 안에서만 돌고, 0.4초 쉬면 그때 표지에 반영한다.
 * 한 자마다 표지·본문을 다시 그리면 입력이 밀린다(선생님 지적 2026-09-18).
 */
function CoverField({
  label,
  value,
  placeholder,
  inputClass,
  rows,
  onCommit,
}: {
  label: string;
  value: string;
  placeholder?: string;
  inputClass: string;
  rows?: number;
  onCommit: (value: string) => void;
}) {
  const [text, setText] = useState(value);
  const typing = useRef(false);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  // 밖에서 값이 바뀌면(다른 자료를 열거나 되돌릴 때) 따라간다. 타자 중에는 건드리지 않는다.
  useEffect(() => {
    if (!typing.current) setText(value);
  }, [value]);
  useEffect(
    () => () => {
      if (timer.current) clearTimeout(timer.current);
    },
    []
  );
  const change = (next: string) => {
    typing.current = true;
    setText(next);
    if (timer.current) clearTimeout(timer.current);
    timer.current = setTimeout(() => {
      typing.current = false;
      onCommit(next);
    }, 400);
  };
  const flush = () => {
    if (timer.current) clearTimeout(timer.current);
    typing.current = false;
    if (text !== value) onCommit(text);
  };
  return (
    <label className="block space-y-1">
      <span className="text-[11px] font-bold text-slate-500">{label}</span>
      {rows ? (
        <textarea
          className={inputClass}
          rows={rows}
          value={text}
          placeholder={placeholder}
          onChange={(e) => change(e.target.value)}
          onBlur={flush}
        />
      ) : (
        <input
          className={inputClass}
          value={text}
          placeholder={placeholder}
          onChange={(e) => change(e.target.value)}
          onBlur={flush}
        />
      )}
    </label>
  );
}
