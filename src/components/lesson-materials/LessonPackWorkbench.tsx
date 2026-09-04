"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  buildChoiceList,
  type LessonPackVocabItem,
} from "@/lib/lesson-materials/generate-lesson-pack";
import type { LessonMaterialAnalysisCard } from "@/lib/lesson-materials/generate-organization";
import {
  generateAndSaveLessonPackVocabAction,
  saveLessonPackAction,
} from "@/lib/lesson-materials/lesson-pack-actions";

export type LessonPackProjectInput = {
  id: string;
  title: string;
  titleEn: string | null;
  folderName: string;
  analysisCards: LessonMaterialAnalysisCard[];
  headerLabel: string;
  vocab: LessonPackVocabItem[];
  illustrationUrl: string | null;
  items: Array<{
    id: string;
    english_text: string;
    korean_text: string | null;
    order_index: number;
  }>;
};

const FONT_OPTIONS = [
  { value: '"Noto Sans KR", "Malgun Gothic", sans-serif', label: "Noto Sans KR" },
  { value: '"Pretendard", "Apple SD Gothic Neo", sans-serif', label: "Pretendard" },
  { value: 'Georgia, "Times New Roman", serif', label: "Serif (영문)" },
  { value: "Arial, Helvetica, sans-serif", label: "Arial" },
];

/** A4 sheet */
const A4_WIDTH = "210mm";
const A4_HEIGHT = "297mm";
const A4_PAD_MM = 10;
const A4_PAD = `${A4_PAD_MM}mm`;
/** Usable body height inside padding (mm) */
const A4_BODY_MM = 297 - A4_PAD_MM * 2;

function A4Sheet({
  children,
  label,
  style,
}: {
  children: ReactNode;
  label: string;
  style?: CSSProperties;
}) {
  return (
    <article
      className="lesson-pack-a4-sheet relative box-border bg-white shadow-xl print:shadow-none"
      style={{
        width: A4_WIDTH,
        minHeight: A4_HEIGHT,
        padding: A4_PAD,
        ...style,
      }}
    >
      <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-slate-400 print:hidden">
        {label}
      </span>
      {children}
    </article>
  );
}

function markVocabInEnglish(
  english: string,
  vocab: LessonPackVocabItem[],
  accent: string
): ReactNode {
  if (!english || vocab.length === 0) return english;
  const sorted = [...vocab].sort((a, b) => b.word.length - a.word.length);
  const pattern = new RegExp(
    `\\b(${sorted
      .map((v) => v.word.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
      .join("|")})\\b`,
    "gi"
  );
  const indexByLower = new Map(
    sorted.map((v, i) => [v.word.toLowerCase(), i + 1])
  );
  const parts: ReactNode[] = [];
  let last = 0;
  let m: RegExpExecArray | null;
  const re = new RegExp(pattern.source, "gi");
  while ((m = re.exec(english)) !== null) {
    if (m.index > last) parts.push(english.slice(last, m.index));
    const n = indexByLower.get(m[0]!.toLowerCase()) ?? 0;
    parts.push(
      <span key={`${m.index}-${m[0]}`} className="font-semibold" style={{ color: accent }}>
        {m[0]}
        <sup className="text-[10px]">{n}</sup>
      </span>
    );
    last = m.index + m[0]!.length;
  }
  if (last < english.length) parts.push(english.slice(last));
  return parts;
}

export function LessonPackWorkbench({
  role,
  projects: initialProjects,
}: {
  role: "admin" | "teacher";
  projects: LessonPackProjectInput[];
}) {
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const [activeIdx, setActiveIdx] = useState(0);
  const [projects, setProjects] = useState(initialProjects);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showKorean, setShowKorean] = useState(true);
  const [boldLessonBody, setBoldLessonBody] = useState(true);

  // Document settings
  const [docTitle, setDocTitle] = useState(() => {
    const first = initialProjects[0];
    return first ? `${first.folderName} (총 ${initialProjects.length}지문)` : "수업용 자료";
  });
  const [headerLabel, setHeaderLabel] = useState(
    () => initialProjects[0]?.headerLabel || "26년도 1학기 중간고사 대비"
  );
  const [lineHeightPct, setLineHeightPct] = useState(180);
  const [fontFamily, setFontFamily] = useState(FONT_OPTIONS[0]!.value);
  const [fontSizePx, setFontSizePx] = useState(14);
  const [themeColor, setThemeColor] = useState("#DC2626");
  const [zoom, setZoom] = useState(70);

  const project = projects[activeIdx] ?? null;

  const sortedLessonItems = useMemo(() => {
    if (!project) return [];
    return project.items
      .slice()
      .sort((a, b) => a.order_index - b.order_index);
  }, [project]);

  const lessonMeasureRef = useRef<HTMLDivElement>(null);
  const [lessonPageChunks, setLessonPageChunks] = useState<number[][]>([[]]);

  // Auto-shuffle once when vocab content changes (no manual reshuffle)
  const vocabFingerprint = useMemo(
    () =>
      (project?.vocab ?? [])
        .map(
          (v) =>
            `${v.word}|${v.synonyms.join(",")}|${v.antonyms.join(",")}`
        )
        .join(";"),
    [project?.vocab]
  );

  const synTests = useMemo(() => {
    if (!project) return [];
    void vocabFingerprint;
    return project.vocab
      .filter((v) => v.synonyms.length > 0)
      .map((v) => {
        const pool = project.vocab
          .filter((o) => o.word !== v.word)
          .flatMap((o) => [...o.synonyms, ...o.antonyms, o.word]);
        return {
          word: v.word,
          choices: buildChoiceList(v.synonyms, v.antonyms, pool),
          answers: v.synonyms,
        };
      });
  }, [project, vocabFingerprint]);

  const antTests = useMemo(() => {
    if (!project) return [];
    void vocabFingerprint;
    return project.vocab
      .filter((v) => v.antonyms.length > 0)
      .map((v) => {
        const pool = project.vocab
          .filter((o) => o.word !== v.word)
          .flatMap((o) => [...o.synonyms, ...o.antonyms, o.word]);
        return {
          word: v.word,
          choices: buildChoiceList(v.antonyms, v.synonyms, pool),
          answers: v.antonyms,
        };
      });
  }, [project, vocabFingerprint]);

  useEffect(() => {
    const id = "lesson-pack-print-page-size-style";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
    }
    el.textContent =
      "@media print { @page { size: 210mm 297mm; margin: 0; } @page app-print-a4 { size: 210mm 297mm; margin: 0; } }";
    document.body.appendChild(el);
    return () => {
      el?.remove();
    };
  }, []);

  useEffect(() => {
    if (!project) return;
    if (project.vocab.length > 0) return;
    void autoGenerate(project.id, activeIdx);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [project?.id]);

  async function autoGenerate(projectId: string, idx: number) {
    setGenerating(true);
    setError(null);
    try {
      const res = await generateAndSaveLessonPackVocabAction(role, {
        projectId,
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setProjects((prev) =>
        prev.map((p, i) =>
          i === idx
            ? { ...p, vocab: res.vocab, headerLabel: res.headerLabel }
            : p
        )
      );
      if (idx === 0) setHeaderLabel(res.headerLabel);
      setMessage("단어를 자동으로 정리했습니다.");
    } finally {
      setGenerating(false);
    }
  }

  function updateVocab(index: number, patch: Partial<LessonPackVocabItem>) {
    setProjects((prev) =>
      prev.map((p, pi) => {
        if (pi !== activeIdx) return p;
        const vocab = p.vocab.map((v, vi) =>
          vi === index ? { ...v, ...patch } : v
        );
        return { ...p, vocab };
      })
    );
  }

  function updateVocabListField(
    index: number,
    field: "synonyms" | "antonyms",
    text: string
  ) {
    const list = text
      .split(/[,/|]/)
      .map((s) => s.trim())
      .filter(Boolean);
    updateVocab(index, { [field]: list });
  }

  function addVocabRow() {
    setProjects((prev) =>
      prev.map((p, pi) =>
        pi === activeIdx
          ? {
              ...p,
              vocab: [
                ...p.vocab,
                { word: "", meaning: "", synonyms: [], antonyms: [] },
              ],
            }
          : p
      )
    );
  }

  function removeVocabRow(index: number) {
    setProjects((prev) =>
      prev.map((p, pi) =>
        pi === activeIdx
          ? { ...p, vocab: p.vocab.filter((_, i) => i !== index) }
          : p
      )
    );
  }

  async function handleSave() {
    if (!project) return;
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      const res = await saveLessonPackAction(role, {
        projectId: project.id,
        headerLabel,
        vocab: project.vocab.filter((v) => v.word.trim()),
        titleEn: project.titleEn,
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setMessage("저장되었습니다.");
    } finally {
      setSaving(false);
    }
  }

  // Titles/subtitles stay fixed; only body blocks use fontSizePx / lineHeight.
  const previewStyle = useMemo((): CSSProperties => {
    return {
      fontFamily,
      ["--pack-accent" as string]: themeColor,
    };
  }, [fontFamily, themeColor]);

  const bodyStyle = useMemo((): CSSProperties => {
    return {
      fontSize: `${fontSizePx}px`,
      lineHeight: `${lineHeightPct / 100}`,
    };
  }, [fontSizePx, lineHeightPct]);

  // Pack lesson sentences into A4 pages without splitting a sentence mid-way.
  useLayoutEffect(() => {
    if (!project) {
      setLessonPageChunks([[]]);
      return;
    }
    const root = lessonMeasureRef.current;
    if (!root) return;

    const nodes = Array.from(
      root.querySelectorAll<HTMLElement>("[data-lesson-measure-item]")
    );
    if (nodes.length === 0) {
      setLessonPageChunks([[]]);
      return;
    }

    const widthPx = root.offsetWidth || 1;
    const pxPerMm = widthPx / 210;
    const pageBodyPx = A4_BODY_MM * pxPerMm;
    // Header budgets: first page has title + passage bar; continuations are shorter
    const headerFirst = Math.max(64, pageBodyPx * 0.1);
    const headerCont = Math.max(40, pageBodyPx * 0.055);
    const gapPx = Math.max(8, fontSizePx * 0.85);

    const heights = nodes.map((n) => n.offsetHeight);
    const pages: number[][] = [];
    let cur: number[] = [];
    let used = headerFirst;

    heights.forEach((h, i) => {
      const add = (cur.length > 0 ? gapPx : 0) + h;
      if (cur.length > 0 && used + add > pageBodyPx - 4) {
        pages.push(cur);
        cur = [i];
        used = headerCont + h;
      } else {
        used += add;
        cur.push(i);
      }
    });
    if (cur.length > 0) pages.push(cur);
    setLessonPageChunks(pages.length > 0 ? pages : [[]]);
  }, [
    project,
    sortedLessonItems,
    fontSizePx,
    lineHeightPct,
    showKorean,
    boldLessonBody,
    themeColor,
  ]);

  const titleSizes = {
    headerLabel: 14,
    docTitle: 24,
    passageTitle: 16,
    section: 16,
  } as const;

  if (!project) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <div className="text-center">
          <Alert variant="error">선택된 자료가 없습니다.</Alert>
          <Link href={base} className="mt-4 inline-block text-sm text-violet-700">
            ← 자료함으로
          </Link>
        </div>
      </div>
    );
  }

  const lessonPageCount = Math.max(1, lessonPageChunks.length);
  const totalPages = 1 + lessonPageCount + 1;

  function renderLessonRow(
    it: (typeof sortedLessonItems)[number],
    displayIdx: number
  ) {
    return (
      <div
        key={it.id}
        className={`break-inside-avoid grid gap-2 border-b border-slate-100 pb-2 ${
          showKorean ? "grid-cols-[22px_3fr_1fr]" : "grid-cols-[22px_1fr]"
        }`}
      >
        <div className="font-bold" style={{ color: themeColor }}>
          {displayIdx + 1}
        </div>
        <div style={{ fontWeight: boldLessonBody ? 700 : 400 }}>
          {markVocabInEnglish(it.english_text, project!.vocab, themeColor)}
        </div>
        {showKorean ? (
          <div
            className="text-slate-700"
            style={{ fontSize: "0.92em", fontWeight: 400 }}
          >
            {it.korean_text?.trim() || (
              <span className="text-slate-400">—</span>
            )}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-200 print:static print:z-auto print:block print:bg-white">
      {/* Settings sidebar */}
      <aside className="flex w-[300px] shrink-0 flex-col border-r border-slate-200 bg-white print:hidden">
        <div className="flex items-center gap-2 border-b border-slate-100 px-4 py-3">
          <Link
            href={base}
            className="rounded-lg px-2 py-1 text-sm font-semibold text-slate-600 hover:bg-slate-100"
          >
            ← 저장 후 닫기
          </Link>
          <span className="text-sm font-bold text-slate-900">문서 설정</span>
        </div>

        <div className="flex-1 space-y-5 overflow-y-auto px-4 py-4 text-sm">
          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-500">상단 라벨 (소제목)</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={headerLabel}
              onChange={(e) => setHeaderLabel(e.target.value)}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-500">자료 제목</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={docTitle}
              onChange={(e) => setDocTitle(e.target.value)}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-500">지문 한국어 제목</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={project.title}
              onChange={(e) => {
                const v = e.target.value;
                setProjects((prev) =>
                  prev.map((p, i) =>
                    i === activeIdx ? { ...p, title: v } : p
                  )
                );
              }}
            />
          </label>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-500">지문 영어 제목</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={project.titleEn ?? ""}
              placeholder="English title"
              onChange={(e) => {
                const v = e.target.value;
                setProjects((prev) =>
                  prev.map((p, i) =>
                    i === activeIdx ? { ...p, titleEn: v } : p
                  )
                );
              }}
            />
          </label>

          <div className="space-y-1.5">
            <span className="text-xs font-bold text-slate-500">테마 색상</span>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
                className="h-9 w-12 cursor-pointer rounded border border-slate-200"
              />
              <input
                className="flex-1 rounded-lg border border-slate-200 px-3 py-2 font-mono text-xs"
                value={themeColor}
                onChange={(e) => setThemeColor(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">본문 줄간격</span>
              <span className="text-xs text-slate-500">{lineHeightPct}%</span>
            </div>
            <input
              type="range"
              min={120}
              max={260}
              step={10}
              value={lineHeightPct}
              onChange={(e) => setLineHeightPct(Number(e.target.value))}
              className="w-full"
            />
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-bold text-slate-500">폰트</span>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2"
              value={fontFamily}
              onChange={(e) => setFontFamily(e.target.value)}
            >
              {FONT_OPTIONS.map((f) => (
                <option key={f.label} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </label>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">본문 폰트 크기</span>
              <span className="text-xs text-slate-500">{fontSizePx}px</span>
            </div>
            <input
              type="range"
              min={11}
              max={20}
              step={1}
              value={fontSizePx}
              onChange={(e) => setFontSizePx(Number(e.target.value))}
              className="w-full"
            />
            <p className="text-[11px] text-slate-400">
              제목·소제목은 고정, 단어/테스트/지문 본문만 조절됩니다.
            </p>
          </div>

          <div className="space-y-3 border-t border-slate-100 pt-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">한글 해석 표시</span>
              <button
                type="button"
                onClick={() => setShowKorean((v) => !v)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  showKorean
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {showKorean ? "ON" : "OFF"}
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">영어 본문 Bold</span>
              <button
                type="button"
                onClick={() => setBoldLessonBody((v) => !v)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  boldLessonBody
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {boldLessonBody ? "ON" : "OFF"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              수업용 자료 영어 문장을 Bold로 강조합니다. 한글은 일반 굵기입니다.
            </p>
          </div>

          {projects.length > 1 ? (
            <div className="space-y-2 border-t border-slate-100 pt-4">
              <span className="text-xs font-bold text-slate-500">지문 선택</span>
              <div className="space-y-1">
                {projects.map((p, i) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setActiveIdx(i)}
                    className={`block w-full truncate rounded-lg px-3 py-2 text-left text-xs ${
                      i === activeIdx
                        ? "bg-slate-900 text-white"
                        : "bg-slate-50 text-slate-700"
                    }`}
                  >
                    {String(i + 1).padStart(2, "0")} {p.title}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          {error ? <Alert variant="error">{error}</Alert> : null}
          {message ? <Alert variant="success">{message}</Alert> : null}
        </div>

        <div className="space-y-2 border-t border-slate-100 p-4">
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="w-full"
            disabled={generating}
            onClick={() => void autoGenerate(project.id, activeIdx)}
          >
            {generating ? "단어 생성 중…" : "단어 AI 재생성"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="primary"
            className="w-full"
            disabled={saving || generating}
            onClick={() => void handleSave()}
          >
            {saving ? "저장 중…" : "저장"}
          </Button>
          <button
            type="button"
            className="w-full rounded-lg border border-slate-200 bg-white py-2 text-xs font-bold text-slate-700"
            onClick={() => window.print()}
          >
            PDF / 인쇄
          </button>
        </div>
      </aside>

      {/* Preview canvas — scrollable A4 sheets (logical page splits) */}
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
          <span className="mx-1 text-xs text-slate-400">
            A4 · 스크롤 · {totalPages}쪽
          </span>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
            onClick={() => setShowKorean((v) => !v)}
          >
            한글 해석 {showKorean ? "숨기기" : "보이기"}
          </button>
          <button
            type="button"
            className="rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-700"
            onClick={() => setBoldLessonBody((v) => !v)}
          >
            영어 Bold {boldLessonBody ? "ON" : "OFF"}
          </button>
        </div>

        <div className="flex justify-center p-6 print:p-0">
          <div
            id="lesson-pack-print-root"
            className="flex origin-top flex-col gap-6 print:gap-0 print:!transform-none"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
              ...previewStyle,
            }}
          >
            {/* ===== PAGE 1: 단어정리 + 동반의어 TEST (compact) ===== */}
            <A4Sheet label={`1 / ${totalPages} · 단어·동반의어`}>
              <div
                className="font-semibold leading-snug"
                style={{ color: themeColor, fontSize: 12 }}
              >
                {headerLabel}
              </div>
              <h1
                className="mt-0.5 font-bold leading-tight text-slate-900"
                style={{ fontSize: 18 }}
              >
                {docTitle}
              </h1>
              <div
                className="mt-1.5 h-0.5 w-full"
                style={{ backgroundColor: themeColor }}
              />

              <div className="mt-2 rounded-lg bg-slate-100 px-3 py-1.5">
                <div
                  className="font-bold leading-snug text-slate-900"
                  style={{ fontSize: 13 }}
                >
                  {String(activeIdx + 1).padStart(2, "0")} {project.title}
                </div>
                {project.titleEn ? (
                  <div className="mt-0.5 text-slate-600" style={{ fontSize: 11 }}>
                    ({project.titleEn})
                  </div>
                ) : null}
              </div>

              <section className="mt-3">
                <h2
                  className="mb-1.5 font-bold leading-snug"
                  style={{ color: themeColor, fontSize: 13 }}
                >
                  1. 단어정리
                </h2>
                <table
                  className="w-full table-fixed text-left"
                  style={{ fontSize: 10.5, lineHeight: 1.3 }}
                >
                  <colgroup>
                    <col className="w-[5%]" />
                    <col className="w-[15%]" />
                    <col className="w-[22%]" />
                    <col className="w-[27%]" />
                    <col className="w-[27%]" />
                    <col className="w-[4%] print:hidden" />
                  </colgroup>
                  <thead>
                    <tr className="border-b border-slate-200 text-slate-500">
                      <th className="py-1 pr-1 font-semibold">No.</th>
                      <th className="py-1 pr-1 font-semibold">영어</th>
                      <th className="py-1 pr-1 font-semibold">뜻</th>
                      <th className="py-1 pr-1 font-semibold">동의어</th>
                      <th className="py-1 pr-1 font-semibold">반의어</th>
                      <th className="py-1 print:hidden" />
                    </tr>
                  </thead>
                  <tbody>
                    {project.vocab.map((v, i) => (
                      <tr key={i} className="border-b border-slate-100 align-top">
                        <td className="py-1 pr-1 text-slate-400">{i + 1}</td>
                        <td className="py-1 pr-1">
                          <input
                            className="w-full border-0 bg-transparent font-bold outline-none"
                            style={{ color: themeColor, fontSize: "inherit" }}
                            value={v.word}
                            onChange={(e) =>
                              updateVocab(i, { word: e.target.value })
                            }
                          />
                        </td>
                        <td className="py-1 pr-1">
                          <textarea
                            className="w-full resize-none overflow-hidden border-0 bg-transparent outline-none"
                            style={{ fontSize: "0.95em", lineHeight: 1.25 }}
                            value={v.meaning}
                            onChange={(e) =>
                              updateVocab(i, { meaning: e.target.value })
                            }
                            rows={Math.max(1, Math.ceil(v.meaning.length / 20))}
                          />
                        </td>
                        <td className="py-1 pr-1">
                          <textarea
                            className="w-full resize-none overflow-hidden break-words border-0 bg-transparent text-slate-600 outline-none"
                            style={{ fontSize: "0.88em", lineHeight: 1.25 }}
                            value={v.synonyms.join(", ")}
                            onChange={(e) =>
                              updateVocabListField(i, "synonyms", e.target.value)
                            }
                            rows={Math.max(
                              1,
                              Math.ceil(v.synonyms.join(", ").length / 26)
                            )}
                          />
                        </td>
                        <td className="py-1 pr-1">
                          <textarea
                            className="w-full resize-none overflow-hidden break-words border-0 bg-transparent text-slate-600 outline-none"
                            style={{ fontSize: "0.88em", lineHeight: 1.25 }}
                            value={v.antonyms.join(", ")}
                            onChange={(e) =>
                              updateVocabListField(i, "antonyms", e.target.value)
                            }
                            rows={Math.max(
                              1,
                              Math.ceil(v.antonyms.join(", ").length / 26)
                            )}
                          />
                        </td>
                        <td className="py-1 print:hidden">
                          <button
                            type="button"
                            className="text-rose-400"
                            onClick={() => removeVocabRow(i)}
                          >
                            ✕
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {generating ? (
                  <p className="mt-2 text-xs text-slate-500">단어를 생성하는 중…</p>
                ) : null}
                <div className="mt-2 flex justify-center print:hidden">
                  <button
                    type="button"
                    onClick={addVocabRow}
                    className="rounded-full border border-slate-200 px-3 py-1 text-xs text-slate-600"
                  >
                    + 단어 추가
                  </button>
                </div>
              </section>

              <section className="mt-3">
                <h2
                  className="mb-1.5 font-bold leading-snug"
                  style={{
                    color:
                      themeColor === "#DC2626" ? "#5b21b6" : themeColor,
                    fontSize: 13,
                  }}
                >
                  2. 동/반의어 TEST
                </h2>
                {synTests.length === 0 && antTests.length === 0 ? (
                  <p className="text-xs text-slate-500">
                    동반의어가 있는 단어가 없어 테스트를 생략합니다.
                  </p>
                ) : (
                  <>
                    <div
                      className="grid gap-2 md:grid-cols-2"
                      style={{ fontSize: 10, lineHeight: 1.35 }}
                    >
                      {synTests.length > 0 ? (
                        <div className="rounded-lg border border-violet-200">
                          <div
                            className="flex items-center justify-between gap-2 rounded-t-lg bg-violet-100 px-2 py-1 font-semibold text-violet-800"
                            style={{ fontSize: 10 }}
                          >
                            <span className="truncate">[{project.title}]</span>
                            <span>동의어 찾기</span>
                          </div>
                          <ol className="space-y-1 px-2 py-1.5">
                            {synTests.map((row, i) => (
                              <li key={`syn-${i}`} className="break-words">
                                <span className="font-bold">
                                  {String(i + 1).padStart(2, "0")} {row.word}
                                </span>
                                {" : "}
                                {row.choices.join(" / ")}
                              </li>
                            ))}
                          </ol>
                        </div>
                      ) : null}
                      {antTests.length > 0 ? (
                        <div className="rounded-lg border border-violet-200">
                          <div
                            className="flex items-center justify-between gap-2 rounded-t-lg bg-violet-100 px-2 py-1 font-semibold text-violet-800"
                            style={{ fontSize: 10 }}
                          >
                            <span className="truncate">[{project.title}]</span>
                            <span>반의어 찾기</span>
                          </div>
                          <ol className="space-y-1 px-2 py-1.5">
                            {antTests.map((row, i) => (
                              <li key={`ant-${i}`} className="break-words">
                                <span className="font-bold">
                                  {String(i + 1).padStart(2, "0")} {row.word}
                                </span>
                                {" : "}
                                {row.choices.join(" / ")}
                              </li>
                            ))}
                          </ol>
                        </div>
                      ) : null}
                    </div>
                    <div
                      className="mt-2 rounded border border-emerald-100 bg-emerald-50/50 px-2 py-1.5 text-emerald-900"
                      style={{ fontSize: 8.5, lineHeight: 1.3 }}
                    >
                      <div className="mb-0.5 font-bold">정답</div>
                      {synTests.length > 0 ? (
                        <p className="break-words">
                          <span className="font-semibold">동의어</span>{" "}
                          {synTests
                            .map(
                              (row, i) =>
                                `${i + 1}.${row.word}(${row.answers.join("/")})`
                            )
                            .join(" · ")}
                        </p>
                      ) : null}
                      {antTests.length > 0 ? (
                        <p className="mt-0.5 break-words">
                          <span className="font-semibold">반의어</span>{" "}
                          {antTests
                            .map(
                              (row, i) =>
                                `${i + 1}.${row.word}(${row.answers.join("/")})`
                            )
                            .join(" · ")}
                        </p>
                      ) : null}
                    </div>
                  </>
                )}
              </section>
            </A4Sheet>

            {/* ===== PAGE 2+: 수업용자료 (문장 단위로 다음 장 이어짐) ===== */}
            {lessonPageChunks.map((chunk, pageI) => (
              <A4Sheet
                key={`lesson-page-${pageI}`}
                label={`${pageI + 2} / ${totalPages} · 수업용자료${
                  pageI > 0 ? " (계속)" : ""
                }`}
              >
                <h2
                  className="mb-2 font-bold leading-snug"
                  style={{ color: themeColor, fontSize: titleSizes.section }}
                >
                  3. 수업용자료
                  {pageI > 0 ? (
                    <span className="ml-2 text-sm font-semibold text-slate-500">
                      (계속)
                    </span>
                  ) : null}
                </h2>
                {pageI === 0 ? (
                  <div className="mb-3 rounded-lg bg-slate-100 px-3 py-2">
                    <div
                      className="font-bold text-slate-900"
                      style={{ fontSize: 13 }}
                    >
                      {String(activeIdx + 1).padStart(2, "0")} {project.title}
                    </div>
                  </div>
                ) : (
                  <p className="mb-3 text-xs text-slate-500">
                    ← 이전 장에서 이어집니다
                  </p>
                )}
                <div className="space-y-3" style={bodyStyle}>
                  {chunk.map((itemIdx) => {
                    const it = sortedLessonItems[itemIdx];
                    if (!it) return null;
                    return renderLessonRow(it, itemIdx);
                  })}
                </div>
              </A4Sheet>
            ))}

            {/* ===== LAST: 논리흐름 + 삽화 ===== */}
            <A4Sheet label={`${totalPages} / ${totalPages} · 논리흐름·삽화`}>
              <h2
                className="mb-4 font-bold leading-snug"
                style={{ color: themeColor, fontSize: titleSizes.section }}
              >
                4. 논리 흐름 &amp; 삽화
              </h2>
              <div
                className={`grid gap-4 ${
                  project.illustrationUrl
                    ? "grid-cols-1 md:grid-cols-2"
                    : "grid-cols-1"
                }`}
              >
                {project.analysisCards.length > 0 ? (
                  <div
                    className="rounded-xl bg-slate-100 p-4"
                    style={{
                      fontSize: Math.max(11, fontSizePx - 1),
                      lineHeight: `${lineHeightPct / 100}`,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <span
                        className="h-4 w-1 rounded"
                        style={{ backgroundColor: themeColor }}
                      />
                      <h3
                        className="font-bold tracking-wide text-slate-900"
                        style={{ fontSize: 12 }}
                      >
                        LOGICAL FLOW (논리 흐름)
                      </h3>
                    </div>
                    <ol className="mt-3 space-y-2.5">
                      {project.analysisCards.map((c, i) => (
                        <li key={`${i}-${c.title}`} className="break-inside-avoid">
                          <div className="font-bold text-slate-900">
                            <span style={{ color: themeColor }}>{i + 1}.</span>{" "}
                            {c.title}
                          </div>
                          <p className="mt-0.5 text-slate-600">{c.desc}</p>
                        </li>
                      ))}
                    </ol>
                  </div>
                ) : (
                  <p className="text-sm text-slate-500">논리 흐름이 없습니다.</p>
                )}
                {project.illustrationUrl ? (
                  <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={project.illustrationUrl}
                      alt="4컷 삽화"
                      className="h-full w-full object-contain"
                    />
                  </div>
                ) : null}
              </div>
            </A4Sheet>

            {/* Off-screen measure: same width/styles as lesson body */}
            <div
              aria-hidden
              className="pointer-events-none absolute left-[-9999px] top-0 -z-10 w-[210mm] opacity-0"
              style={{ padding: A4_PAD, ...previewStyle }}
            >
              <div
                ref={lessonMeasureRef}
                className="space-y-3"
                style={bodyStyle}
              >
                {sortedLessonItems.map((it, idx) => (
                  <div
                    key={`m-${it.id}`}
                    data-lesson-measure-item
                    className={`grid gap-2 border-b border-slate-100 pb-2 ${
                      showKorean
                        ? "grid-cols-[22px_3fr_1fr]"
                        : "grid-cols-[22px_1fr]"
                    }`}
                  >
                    <div className="font-bold">{idx + 1}</div>
                    <div
                      style={{ fontWeight: boldLessonBody ? 700 : 400 }}
                    >
                      {it.english_text}
                    </div>
                    {showKorean ? (
                      <div
                        className="text-slate-700"
                        style={{ fontSize: "0.92em", fontWeight: 400 }}
                      >
                        {it.korean_text?.trim() || "—"}
                      </div>
                    ) : null}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );

}
