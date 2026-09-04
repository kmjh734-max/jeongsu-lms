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

/** A4 at CSS mm */
const A4_WIDTH = "210mm";
const A4_HEIGHT = "297mm";
const A4_PAD = "12mm";
/** Printable body height inside one A4 page (297 − 12×2) */
const A4_CONTENT_H_MM = 273;

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
  const [pageIdx, setPageIdx] = useState(0);
  const [pageCount, setPageCount] = useState(1);
  const pageInnerRef = useRef<HTMLDivElement>(null);

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

  const layoutKey = useMemo(
    () =>
      [
        vocabFingerprint,
        fontSizePx,
        lineHeightPct,
        showKorean,
        boldLessonBody,
        docTitle,
        headerLabel,
        project?.title,
        project?.titleEn,
        project?.items.map((it) => it.id).join(","),
        project?.illustrationUrl ?? "",
        project?.analysisCards.length ?? 0,
        synTests.length,
        antTests.length,
      ].join("|"),
    [
      vocabFingerprint,
      fontSizePx,
      lineHeightPct,
      showKorean,
      boldLessonBody,
      docTitle,
      headerLabel,
      project,
      synTests.length,
      antTests.length,
    ]
  );

  useLayoutEffect(() => {
    const el = pageInnerRef.current;
    if (!el) return;
    const widthPx = el.offsetWidth || 1;
    const pxPerMm = widthPx / 210;
    const pageBodyPx = A4_CONTENT_H_MM * pxPerMm;
    const pages = Math.max(1, Math.ceil(el.scrollHeight / pageBodyPx));
    setPageCount(pages);
    setPageIdx((p) => Math.min(p, pages - 1));
  }, [layoutKey]);

  useEffect(() => {
    setPageIdx(0);
  }, [project?.id]);

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

      {/* Preview canvas */}
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
          <span className="mx-1 text-xs text-slate-400">A4 · {pageCount}쪽</span>
          <div className="flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-1.5 py-0.5">
            <button
              type="button"
              className="rounded px-2 py-0.5 text-xs font-semibold text-slate-700 disabled:opacity-40"
              disabled={pageIdx <= 0}
              onClick={() => setPageIdx((p) => Math.max(0, p - 1))}
            >
              ‹
            </button>
            <span className="min-w-[3.5rem] text-center text-xs font-semibold text-slate-600">
              {pageIdx + 1} / {pageCount}
            </span>
            <button
              type="button"
              className="rounded px-2 py-0.5 text-xs font-semibold text-slate-700 disabled:opacity-40"
              disabled={pageIdx >= pageCount - 1}
              onClick={() =>
                setPageIdx((p) => Math.min(pageCount - 1, p + 1))
              }
            >
              ›
            </button>
          </div>
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
            className="origin-top print:!transform-none"
            style={{
              transform: `scale(${zoom / 100})`,
              transformOrigin: "top center",
            }}
          >
            <div
              className="lesson-pack-a4-clip relative box-border overflow-hidden bg-white shadow-xl print:overflow-visible print:shadow-none"
              style={{
                width: A4_WIDTH,
                height: A4_HEIGHT,
              }}
            >
              <div
                id="lesson-pack-print-root"
                ref={pageInnerRef}
                className="box-border"
                style={{
                  width: A4_WIDTH,
                  padding: A4_PAD,
                  transform: `translateY(-${pageIdx * A4_CONTENT_H_MM}mm)`,
                  ...previewStyle,
                }}
              >
              <div
                className="font-semibold leading-snug"
                style={{ color: themeColor, fontSize: titleSizes.headerLabel }}
              >
                {headerLabel}
              </div>
              <h1
                className="mt-1 font-bold leading-tight text-slate-900"
                style={{ fontSize: titleSizes.docTitle }}
              >
                {docTitle}
              </h1>
              <div
                className="mt-2 h-1 w-full"
                style={{ backgroundColor: themeColor }}
              />

              <div className="mt-4 rounded-xl bg-slate-100 px-4 py-3">
                <div
                  className="font-bold leading-snug text-slate-900"
                  style={{ fontSize: titleSizes.passageTitle }}
                >
                  {String(activeIdx + 1).padStart(2, "0")} {project.title}
                </div>
                {project.titleEn ? (
                  <div
                    className="mt-1 leading-snug text-slate-600"
                    style={{ fontSize: 13 }}
                  >
                    ({project.titleEn})
                  </div>
                ) : null}
              </div>

              {/* 1. 단어정리 */}
              <section className="mt-8 break-inside-avoid">
                <h2
                  className="mb-3 font-bold leading-snug"
                  style={{ color: themeColor, fontSize: titleSizes.section }}
                >
                  1. 단어정리
                </h2>
                <div style={bodyStyle}>
                  <table className="w-full table-fixed text-left">
                    <colgroup>
                      <col className="w-[6%]" />
                      <col className="w-[16%]" />
                      <col className="w-[22%]" />
                      <col className="w-[26%]" />
                      <col className="w-[26%]" />
                      <col className="w-[4%] print:hidden" />
                    </colgroup>
                    <thead>
                      <tr className="border-b border-slate-200 text-[0.85em] text-slate-500">
                        <th className="py-2 pr-1">No.</th>
                        <th className="py-2 pr-1">영어</th>
                        <th className="py-2 pr-1">뜻</th>
                        <th className="py-2 pr-1">동의어</th>
                        <th className="py-2 pr-1">반의어</th>
                        <th className="py-2 print:hidden" />
                      </tr>
                    </thead>
                    <tbody>
                      {project.vocab.map((v, i) => (
                        <tr key={i} className="border-b border-slate-100 align-top">
                          <td className="py-2 pr-1 text-slate-400">{i + 1}</td>
                          <td className="py-2 pr-1">
                            <input
                              className="w-full border-0 bg-transparent font-bold outline-none"
                              style={{ color: themeColor, fontSize: "inherit" }}
                              value={v.word}
                              onChange={(e) =>
                                updateVocab(i, { word: e.target.value })
                              }
                            />
                          </td>
                          <td className="py-2 pr-1">
                            <textarea
                              className="min-h-[40px] w-full resize-y border-0 bg-transparent outline-none"
                              style={{ fontSize: "inherit", lineHeight: "inherit" }}
                              value={v.meaning}
                              onChange={(e) =>
                                updateVocab(i, { meaning: e.target.value })
                              }
                              rows={2}
                            />
                          </td>
                          <td className="py-2 pr-1">
                            <textarea
                              className="min-h-[40px] w-full resize-y break-words border-0 bg-transparent text-slate-600 outline-none"
                              style={{ fontSize: "inherit", lineHeight: "inherit" }}
                              value={v.synonyms.join(", ")}
                              onChange={(e) =>
                                updateVocabListField(i, "synonyms", e.target.value)
                              }
                              rows={2}
                            />
                          </td>
                          <td className="py-2 pr-1">
                            <textarea
                              className="min-h-[40px] w-full resize-y break-words border-0 bg-transparent text-slate-600 outline-none"
                              style={{ fontSize: "inherit", lineHeight: "inherit" }}
                              value={v.antonyms.join(", ")}
                              onChange={(e) =>
                                updateVocabListField(i, "antonyms", e.target.value)
                              }
                              rows={2}
                            />
                          </td>
                          <td className="py-2 print:hidden">
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
                </div>
                {generating ? (
                  <p className="mt-3 text-sm text-slate-500">단어를 생성하는 중…</p>
                ) : null}
                <div className="mt-3 flex justify-center print:hidden">
                  <button
                    type="button"
                    onClick={addVocabRow}
                    className="rounded-full border border-slate-200 px-4 py-2 text-sm text-slate-600"
                  >
                    + 단어 추가
                  </button>
                </div>
              </section>

              {/* 2. 동/반의어 TEST */}
              <section className="mt-10">
                <h2
                  className="mb-3 font-bold leading-snug"
                  style={{
                    color:
                      themeColor === "#DC2626" ? "#5b21b6" : themeColor,
                    fontSize: titleSizes.section,
                  }}
                >
                  2. 동/반의어 TEST
                </h2>
                {synTests.length === 0 && antTests.length === 0 ? (
                  <p className="text-sm text-slate-500">
                    동반의어가 있는 단어가 없어 테스트를 생략합니다.
                  </p>
                ) : (
                  <>
                    <div className="grid gap-4 md:grid-cols-2" style={bodyStyle}>
                      {synTests.length > 0 ? (
                        <div className="break-inside-avoid rounded-xl border border-violet-200">
                          <div
                            className="flex items-center justify-between gap-2 rounded-t-xl bg-violet-100 px-3 py-2 font-semibold text-violet-800"
                            style={{ fontSize: 12 }}
                          >
                            <span className="truncate">[{project.title}]</span>
                            <span>동의어 찾기</span>
                          </div>
                          <ol className="space-y-3 p-4">
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
                        <div className="break-inside-avoid rounded-xl border border-violet-200">
                          <div
                            className="flex items-center justify-between gap-2 rounded-t-xl bg-violet-100 px-3 py-2 font-semibold text-violet-800"
                            style={{ fontSize: 12 }}
                          >
                            <span className="truncate">[{project.title}]</span>
                            <span>반의어 찾기</span>
                          </div>
                          <ol className="space-y-3 p-4">
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
                      className="mt-3 break-inside-avoid rounded-lg border border-emerald-100 bg-emerald-50/50 px-3 py-2 text-emerald-900"
                      style={{ fontSize: 9, lineHeight: 1.35 }}
                    >
                      <div className="mb-1 font-bold tracking-wide">정답</div>
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

              {/* 3. 수업용자료 & 흐름 */}
              <section className="mt-10">
                <h2
                  className="mb-3 font-bold leading-snug"
                  style={{ color: themeColor, fontSize: titleSizes.section }}
                >
                  3. 수업용자료 &amp; 흐름
                </h2>
                <div className="space-y-4" style={bodyStyle}>
                  {project.items
                    .slice()
                    .sort((a, b) => a.order_index - b.order_index)
                    .map((it, idx) => (
                      <div
                        key={it.id}
                        className={`grid gap-3 border-b border-slate-100 pb-3 ${
                          showKorean
                            ? "grid-cols-[24px_3fr_1fr]"
                            : "grid-cols-[24px_1fr]"
                        }`}
                      >
                        <div className="font-bold" style={{ color: themeColor }}>
                          {idx + 1}
                        </div>
                        <div
                          style={{
                            fontWeight: boldLessonBody ? 700 : 400,
                          }}
                        >
                          {markVocabInEnglish(
                            it.english_text,
                            project.vocab,
                            themeColor
                          )}
                        </div>
                        {showKorean ? (
                          <div
                            className="text-slate-700"
                            style={{
                              fontSize: "0.92em",
                              fontWeight: 400,
                            }}
                          >
                            {it.korean_text?.trim() || (
                              <span className="text-slate-400">—</span>
                            )}
                          </div>
                        ) : null}
                      </div>
                    ))}
                </div>

                <div
                  className={`mt-6 grid gap-4 ${
                    project.illustrationUrl
                      ? "md:grid-cols-[1.1fr_1fr]"
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
                          <li key={`${i}-${c.title}`}>
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
                    <p className="text-sm text-slate-500">
                      논리 흐름이 없습니다.
                    </p>
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
              </section>
            </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
