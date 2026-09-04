"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type CSSProperties, type ReactNode } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  buildChoiceList,
  vocabNeedsAntonymRefresh,
  type LessonPackVocabItem,
} from "@/lib/lesson-materials/generate-lesson-pack";
import type { LessonMaterialAnalysisCard } from "@/lib/lesson-materials/generate-organization";
import {
  generateAndSaveLessonPackVocabAction,
  ensureLessonMaterialTitleEnAction,
  saveLessonPackAction,
} from "@/lib/lesson-materials/lesson-pack-actions";
import { LOGO_SRC } from "@/lib/branding";

export type LessonPackProjectInput = {
  id: string;
  title: string;
  titleEn: string | null;
  source: string | null;
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
  className,
  footerLogoSrc,
}: {
  children: ReactNode;
  label: string;
  style?: CSSProperties;
  className?: string;
  footerLogoSrc?: string | null;
}) {
  return (
    <article
      className={`lesson-pack-a4-sheet relative box-border flex flex-col overflow-hidden bg-white shadow-xl print:shadow-none ${className ?? ""}`.trim()}
      style={{
        width: A4_WIDTH,
        height: A4_HEIGHT,
        minHeight: A4_HEIGHT,
        maxHeight: A4_HEIGHT,
        padding: A4_PAD,
        paddingBottom: footerLogoSrc ? "8mm" : A4_PAD,
        ...style,
      }}
    >
      <div className="min-h-0 flex-1">{children}</div>
      {footerLogoSrc ? (
        <div className="lesson-pack-footer-logo mt-auto flex shrink-0 items-center justify-center border-t border-slate-200 pt-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={footerLogoSrc}
            alt=""
            className="h-7 w-auto max-w-[32mm] object-contain opacity-90"
          />
        </div>
      ) : null}
      <span className="pointer-events-none absolute bottom-2 right-3 text-[10px] text-slate-400 print:hidden">
        {label}
      </span>
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
  logoSrc = LOGO_SRC,
}: {
  role: "admin" | "teacher";
  projects: LessonPackProjectInput[];
  logoSrc?: string;
}) {
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const [projects, setProjects] = useState(initialProjects);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [prepLoading, setPrepLoading] = useState(() =>
    initialProjects.some(
      (p) =>
        p.vocab.length === 0 ||
        vocabNeedsAntonymRefresh(p.vocab) ||
        !p.titleEn?.trim()
    )
  );
  const [prepProgress, setPrepProgress] = useState({
    done: 0,
    total: Math.max(
      1,
      initialProjects.filter(
        (p) =>
          p.vocab.length === 0 ||
          vocabNeedsAntonymRefresh(p.vocab) ||
          !p.titleEn?.trim()
      ).length
    ),
  });
  const [prepRetryKey, setPrepRetryKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [showKorean, setShowKorean] = useState(true);
  const [boldLessonBody, setBoldLessonBody] = useState(true);
  const [showLogo, setShowLogo] = useState(true);

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

  const project = projects[0] ?? null;

  type TestRow = {
    word: string;
    choices: string[];
    answers: string[];
  };

  const testsByProject = useMemo(() => {
    return projects.map((p) => {
      const poolBase = p.vocab.flatMap((v) => [
        ...v.synonyms,
        ...v.antonyms,
        v.word,
      ]);
      const syn: TestRow[] = p.vocab
        .filter((v) => v.synonyms.length > 0)
        .map((v) => {
          const pool = p.vocab
            .filter((o) => o.word !== v.word)
            .flatMap((o) => [...o.synonyms, ...o.antonyms, o.word]);
          return {
            word: v.word,
            choices: buildChoiceList(v.synonyms, v.antonyms, pool),
            answers: v.synonyms,
          };
        });
      const ant: TestRow[] = p.vocab
        .filter((v) => v.antonyms.length > 0)
        .map((v) => {
          const pool = p.vocab
            .filter((o) => o.word !== v.word)
            .flatMap((o) => [...o.synonyms, ...o.antonyms, o.word]);
          return {
            word: v.word,
            choices: buildChoiceList(v.antonyms, v.synonyms, pool),
            answers: v.antonyms,
          };
        });
      void poolBase;
      return { syn, ant };
    });
  }, [projects]);

  const packMeasureRef = useRef<HTMLDivElement>(null);
  const [pageChunks, setPageChunks] = useState<string[][]>([[]]);

  const vocabFingerprint = useMemo(
    () =>
      projects
        .map((p) =>
          p.vocab
            .map(
              (v) =>
                `${v.word}|${v.synonyms.join(",")}|${v.antonyms.join(",")}`
            )
            .join(";")
        )
        .join("||"),
    [projects]
  );

  /** All passages in selection order. New passages start on a fresh page. */
  const packBlocks = useMemo(() => {
    const blocks: Array<{
      id: string;
      keepTogether: boolean;
      stickToNext?: boolean;
      forceNewPage?: boolean;
    }> = [{ id: "doc-header", keepTogether: true }];

    projects.forEach((p, pi) => {
      const tests = testsByProject[pi] ?? { syn: [], ant: [] };
      const items = p.items
        .slice()
        .sort((a, b) => a.order_index - b.order_index);

      blocks.push({
        id: `p${pi}:passage-bar`,
        keepTogether: true,
        stickToNext: true,
        forceNewPage: pi > 0,
      });
      blocks.push({
        id: `p${pi}:vocab-heading`,
        keepTogether: true,
        stickToNext: true,
      });
      blocks.push({
        id: `p${pi}:vocab-head`,
        keepTogether: true,
        stickToNext: true,
      });
      for (let i = 0; i < p.vocab.length; i++) {
        blocks.push({ id: `p${pi}:vocab-row:${i}`, keepTogether: true });
      }

      blocks.push({
        id: `p${pi}:test-heading`,
        keepTogether: true,
        stickToNext: true,
      });
      if (tests.syn.length > 0 || tests.ant.length > 0) {
        blocks.push({ id: `p${pi}:test-questions`, keepTogether: true });
        blocks.push({ id: `p${pi}:test-answers`, keepTogether: true });
      } else {
        blocks.push({ id: `p${pi}:test-empty`, keepTogether: true });
      }

      blocks.push({
        id: `p${pi}:lesson-heading`,
        keepTogether: true,
        stickToNext: true,
        forceNewPage: true,
      });
      for (let i = 0; i < items.length; i++) {
        blocks.push({ id: `p${pi}:lesson-item:${i}`, keepTogether: true });
      }
      blocks.push({ id: `p${pi}:flow`, keepTogether: true });
    });

    return blocks;
  }, [projects, testsByProject]);

  useEffect(() => {
    const id = "lesson-pack-print-page-size-style";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
    }
    el.textContent = `
@media print {
  @page { size: 210mm 297mm; margin: 0; }
  @page app-print-a4 { size: 210mm 297mm; margin: 0; }
  #lesson-pack-print-root { transform: none !important; gap: 0 !important; }
}
`;
    document.body.appendChild(el);
    return () => {
      el?.remove();
    };
  }, []);

  // Auto-generate/refresh vocab; backfill English title without wiping good vocab
  useEffect(() => {
    const pending = projects
      .map((p, i) => ({ p, i }))
      .filter(
        ({ p }) =>
          p.vocab.length === 0 ||
          vocabNeedsAntonymRefresh(p.vocab) ||
          !p.titleEn?.trim()
      );
    if (pending.length === 0) {
      setPrepLoading(false);
      return;
    }

    let cancelled = false;
    setPrepLoading(true);
    setError(null);
    setPrepProgress({ done: 0, total: pending.length });

    void (async () => {
      let failed = false;
      for (let n = 0; n < pending.length; n++) {
        if (cancelled) return;
        const { p, i } = pending[n]!;
        setGenerating(true);
        try {
          const needsVocab =
            p.vocab.length === 0 || vocabNeedsAntonymRefresh(p.vocab);
          if (needsVocab) {
            const res = await generateAndSaveLessonPackVocabAction(role, {
              projectId: p.id,
            });
            if (!res.ok) {
              failed = true;
              setError(res.message);
            } else {
              setProjects((prev) =>
                prev.map((row, idx) =>
                  idx === i
                    ? {
                        ...row,
                        vocab: res.vocab,
                        headerLabel: res.headerLabel,
                        titleEn: res.titleEn ?? row.titleEn,
                      }
                    : row
                )
              );
              if (i === 0) setHeaderLabel(res.headerLabel);
            }
          } else if (!p.titleEn?.trim()) {
            const res = await ensureLessonMaterialTitleEnAction(role, {
              projectId: p.id,
            });
            if (!res.ok) {
              failed = true;
              setError(res.message);
            } else {
              setProjects((prev) =>
                prev.map((row, idx) =>
                  idx === i ? { ...row, titleEn: res.titleEn } : row
                )
              );
            }
          }
        } catch (e) {
          failed = true;
          setError(e instanceof Error ? e.message : "준비 실패");
        } finally {
          setGenerating(false);
        }
        if (!cancelled) {
          setPrepProgress({ done: n + 1, total: pending.length });
        }
      }
      if (!cancelled) {
        if (failed) {
          return;
        }
        setPrepLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.map((p) => p.id).join(","), prepRetryKey]);

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
            ? {
                ...p,
                vocab: res.vocab,
                headerLabel: res.headerLabel,
                titleEn: res.titleEn ?? p.titleEn,
              }
            : p
        )
      );
      if (idx === 0) setHeaderLabel(res.headerLabel);
      setMessage("단어를 자동으로 정리했습니다.");
    } finally {
      setGenerating(false);
    }
  }

  function updateVocabAt(
    pi: number,
    index: number,
    patch: Partial<LessonPackVocabItem>
  ) {
    setProjects((prev) =>
      prev.map((p, i) => {
        if (i !== pi) return p;
        const vocab = p.vocab.map((v, vi) =>
          vi === index ? { ...v, ...patch } : v
        );
        return { ...p, vocab };
      })
    );
  }

  function updateVocabListFieldAt(
    pi: number,
    index: number,
    field: "synonyms" | "antonyms",
    text: string
  ) {
    const list = text
      .split(/[,/|]/)
      .map((s) => s.trim())
      .filter(Boolean);
    updateVocabAt(pi, index, { [field]: list });
  }

  function removeVocabRowAt(pi: number, index: number) {
    setProjects((prev) =>
      prev.map((p, i) =>
        i === pi
          ? { ...p, vocab: p.vocab.filter((_, vi) => vi !== index) }
          : p
      )
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setMessage(null);
    try {
      for (const p of projects) {
        const res = await saveLessonPackAction(role, {
          projectId: p.id,
          headerLabel,
          vocab: p.vocab.filter((v) => v.word.trim()),
          title: p.title,
          titleEn: p.titleEn,
          source: p.source,
        });
        if (!res.ok) {
          setError(res.message);
          return;
        }
      }
      setMessage(
        projects.length > 1
          ? `${projects.length}개 지문을 저장했습니다.`
          : "저장되었습니다."
      );
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

  // Pack continuous blocks onto A4 pages. keepTogether → move whole block to next page
  // rather than clipping; stickToNext → don't leave a heading alone at page bottom.
  useLayoutEffect(() => {
    if (projects.length === 0) {
      setPageChunks([[]]);
      return;
    }
    const root = packMeasureRef.current;
    if (!root) return;

    const widthPx = root.offsetWidth || 1;
    const pxPerMm = widthPx / 210;
    // Extra bottom padding when footer logo is on (16mm vs 10mm)
    const bodyMm = showLogo ? 297 - A4_PAD_MM - 16 : A4_BODY_MM;
    const pageBodyPx = bodyMm * pxPerMm;
    const gapPx = 10;

    const heightById = new Map<string, number>();
    for (const el of Array.from(
      root.querySelectorAll<HTMLElement>("[data-pack-block]")
    )) {
      const id = el.dataset.packBlock;
      if (id) heightById.set(id, el.offsetHeight);
    }

    const pages: string[][] = [];
    let cur: string[] = [];
    let used = 0;

    const flush = () => {
      if (cur.length === 0) return;
      pages.push(cur);
      cur = [];
      used = 0;
    };

    for (let i = 0; i < packBlocks.length; i++) {
      const block = packBlocks[i]!;
      if (block.forceNewPage && cur.length > 0) {
        flush();
      }
      const h = heightById.get(block.id) ?? 24;
      const next = block.stickToNext ? packBlocks[i + 1] : undefined;
      const nh = next ? (heightById.get(next.id) ?? 24) : 0;

      // Keep heading with the full next block when that next block fits on one page.
      // Otherwise the title would sit alone at the bottom while content moves on.
      let placeHeight = h;
      if (next && nh <= pageBodyPx - 2) {
        placeHeight = h + gapPx + nh;
      }

      const leadingGap = cur.length > 0 ? gapPx : 0;
      if (cur.length > 0 && used + leadingGap + placeHeight > pageBodyPx - 2) {
        flush();
      } else if (cur.length > 0 && used + leadingGap + h > pageBodyPx - 2) {
        flush();
      }

      used += (cur.length > 0 ? gapPx : 0) + h;
      cur.push(block.id);
    }
    flush();
    setPageChunks(pages.length > 0 ? pages : [[]]);
  }, [
    projects,
    packBlocks,
    vocabFingerprint,
    fontSizePx,
    lineHeightPct,
    showKorean,
    boldLessonBody,
    themeColor,
    docTitle,
    headerLabel,
    testsByProject,
    showLogo,
    logoSrc,
  ]);

  const titleSizes = {
    headerLabel: 14,
    docTitle: 22,
    passageTitle: 18,
    section: 15,
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

  if (prepLoading) {
    const pct =
      prepProgress.total > 0
        ? Math.round((prepProgress.done / prepProgress.total) * 100)
        : 0;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-200">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl">
          <p className="text-center text-lg font-bold text-slate-900">
            수업용 자료 준비 중
          </p>
          <p className="mt-2 text-center text-sm text-slate-600">
            단어·동반의어를 생성하고 있습니다…
          </p>
          <div className="mt-6 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-violet-600 transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <p className="mt-3 text-center text-2xl font-bold text-violet-700">
            {pct}%
          </p>
          <p className="mt-1 text-center text-xs text-slate-400">
            {prepProgress.done}/{prepProgress.total} 지문 · 완료 후 미리보기가
            열립니다
          </p>
          {error ? (
            <div className="mt-4 space-y-3 text-center">
              <p className="text-sm text-rose-600">{error}</p>
              <button
                type="button"
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-semibold text-white hover:bg-violet-700"
                onClick={() => {
                  setError(null);
                  setPrepRetryKey((k) => k + 1);
                }}
              >
                다시 시도
              </button>
            </div>
          ) : null}
        </div>
      </div>
    );
  }

  const totalPages = Math.max(1, pageChunks.length);

  function parseBlockId(blockId: string): {
    pi: number;
    kind: string;
    sub: string | null;
  } | null {
    if (blockId === "doc-header") return { pi: -1, kind: "doc-header", sub: null };
    const m = /^p(\d+):([^:]+)(?::(.+))?$/.exec(blockId);
    if (!m) return null;
    return {
      pi: Number(m[1]),
      kind: m[2]!,
      sub: m[3] ?? null,
    };
  }

  function renderPackBlock(blockId: string, interactive: boolean): ReactNode {
    const parsed = parseBlockId(blockId);
    if (!parsed) return null;

    const accentTest =
      themeColor === "#DC2626" ? "#5b21b6" : themeColor;

    if (parsed.kind === "doc-header") {
      return (
        <div>
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
        </div>
      );
    }

    const board = projects[parsed.pi];
    if (!board) return null;
    const tests = testsByProject[parsed.pi] ?? { syn: [], ant: [] };
    const lessonItems = board.items
      .slice()
      .sort((a, b) => a.order_index - b.order_index);
    const pi = parsed.pi;

    if (parsed.kind === "passage-bar") {
      return (
        <div className="mt-4">
          {board.source?.trim() ? (
            <div
              className="mb-1.5 font-semibold"
              style={{ color: themeColor, fontSize: 12 }}
            >
              {board.source.trim()}
            </div>
          ) : null}
          <div className="rounded-xl bg-slate-100 px-4 py-3">
            <div
              className="font-bold leading-snug text-slate-900"
              style={{ fontSize: titleSizes.passageTitle }}
            >
              {String(pi + 1).padStart(2, "0")} {board.title}
            </div>
            {board.titleEn?.trim() ? (
              <div
                className="mt-1.5 text-slate-600"
                style={{ fontSize: 13.5, lineHeight: 1.4 }}
              >
                {board.titleEn.trim()}
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    if (parsed.kind === "vocab-heading") {
      return (
        <div className="mt-5">
          <div
            className="font-semibold"
            style={{ color: themeColor, fontSize: 12 }}
          >
            {headerLabel}
          </div>
          <h2
            className="mt-1 font-bold leading-tight text-slate-900"
            style={{ fontSize: 20 }}
          >
            1. 단어정리
          </h2>
          <div
            className="mt-2 h-0.5 w-full"
            style={{ backgroundColor: themeColor }}
          />
        </div>
      );
    }

    if (parsed.kind === "vocab-head") {
      return (
        <div
          className="mt-2 grid border-b border-slate-200 pb-1 text-slate-500"
          style={{
            fontSize: 10.5,
            gridTemplateColumns: interactive
              ? "5% 15% 22% 27% 27% 4%"
              : "5% 16% 23% 28% 28%",
          }}
        >
          <div className="font-semibold">No.</div>
          <div className="font-semibold">영어</div>
          <div className="font-semibold">뜻</div>
          <div className="font-semibold">동의어</div>
          <div className="font-semibold">반의어</div>
          {interactive ? <div className="print:hidden" /> : null}
        </div>
      );
    }

    if (parsed.kind === "vocab-row") {
      const i = Number(parsed.sub);
      const v = board.vocab[i];
      if (!v) return null;
      return (
        <div
          className="grid items-start border-b border-slate-100 py-1"
          style={{
            fontSize: 10.5,
            lineHeight: 1.3,
            gridTemplateColumns: interactive
              ? "5% 15% 22% 27% 27% 4%"
              : "5% 16% 23% 28% 28%",
          }}
        >
          <div className="pr-1 text-slate-400">{i + 1}</div>
          <div className="pr-1">
            {interactive ? (
              <input
                className="w-full border-0 bg-transparent font-bold outline-none placeholder:text-slate-300"
                style={{ color: themeColor, fontSize: "inherit" }}
                value={v.word}
                placeholder="단어"
                onChange={(e) =>
                  updateVocabAt(pi, i, { word: e.target.value })
                }
              />
            ) : (
              <span className="font-bold" style={{ color: themeColor }}>
                {v.word}
              </span>
            )}
          </div>
          <div className="pr-1">
            {interactive ? (
              <textarea
                className="w-full resize-none overflow-hidden border-0 bg-transparent outline-none"
                style={{ fontSize: "0.95em", lineHeight: 1.25 }}
                value={v.meaning}
                onChange={(e) =>
                  updateVocabAt(pi, i, { meaning: e.target.value })
                }
                rows={Math.max(1, Math.ceil(v.meaning.length / 20))}
              />
            ) : (
              <span style={{ fontSize: "0.95em" }}>{v.meaning}</span>
            )}
          </div>
          <div className="pr-1 text-slate-600">
            {interactive ? (
              <textarea
                className="w-full resize-none overflow-hidden break-words border-0 bg-transparent outline-none"
                style={{ fontSize: "0.88em", lineHeight: 1.25 }}
                value={v.synonyms.join(", ")}
                onChange={(e) =>
                  updateVocabListFieldAt(pi, i, "synonyms", e.target.value)
                }
                rows={Math.max(1, Math.ceil(v.synonyms.join(", ").length / 26))}
              />
            ) : (
              <span style={{ fontSize: "0.88em" }}>
                {v.synonyms.join(", ")}
              </span>
            )}
          </div>
          <div className="pr-1 text-slate-600">
            {interactive ? (
              <textarea
                className="w-full resize-none overflow-hidden break-words border-0 bg-transparent outline-none"
                style={{ fontSize: "0.88em", lineHeight: 1.25 }}
                value={v.antonyms.join(", ")}
                onChange={(e) =>
                  updateVocabListFieldAt(pi, i, "antonyms", e.target.value)
                }
                rows={Math.max(1, Math.ceil(v.antonyms.join(", ").length / 26))}
              />
            ) : (
              <span style={{ fontSize: "0.88em" }}>
                {v.antonyms.join(", ")}
              </span>
            )}
          </div>
          {interactive ? (
            <div className="print:hidden">
              <button
                type="button"
                className="text-rose-400"
                onClick={() => removeVocabRowAt(pi, i)}
              >
                ✕
              </button>
            </div>
          ) : null}
        </div>
      );
    }

    if (parsed.kind === "test-heading") {
      return (
        <div className="mt-6">
          <div
            className="font-semibold"
            style={{ color: accentTest, fontSize: 12 }}
          >
            {headerLabel}
          </div>
          <h2
            className="mt-1 font-bold leading-tight text-slate-900"
            style={{ fontSize: 20 }}
          >
            동/반의어 TEST
          </h2>
          <div
            className="mt-2 h-0.5 w-full"
            style={{ backgroundColor: accentTest }}
          />
        </div>
      );
    }

    if (parsed.kind === "test-empty") {
      return (
        <p className="mt-2 text-xs text-slate-500">
          동반의어가 있는 단어가 없어 테스트를 생략합니다.
        </p>
      );
    }

    if (parsed.kind === "test-questions") {
      return (
        <div
          className="mt-3 grid gap-3 md:grid-cols-2"
          style={{ fontSize: 11, lineHeight: 1.45 }}
        >
          {tests.syn.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-violet-200">
              <div className="flex items-center justify-between gap-2 bg-violet-100 px-3 py-2 text-[11px] font-semibold text-violet-900">
                <span className="min-w-0 truncate">[{board.title}]</span>
                <span className="shrink-0">동의어 찾기</span>
              </div>
              <ol className="space-y-2 px-3 py-2.5">
                {tests.syn.map((row, i) => (
                  <li key={`syn-q-${pi}-${i}`} className="break-words">
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
          {tests.ant.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-violet-200">
              <div className="flex items-center justify-between gap-2 bg-violet-100 px-3 py-2 text-[11px] font-semibold text-violet-900">
                <span className="min-w-0 truncate">[{board.title}]</span>
                <span className="shrink-0">반의어 찾기</span>
              </div>
              <ol className="space-y-2 px-3 py-2.5">
                {tests.ant.map((row, i) => (
                  <li key={`ant-q-${pi}-${i}`} className="break-words">
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
      );
    }

    if (parsed.kind === "test-answers") {
      return (
        <div className="mt-5">
          <div
            className="font-semibold"
            style={{ color: accentTest, fontSize: 12 }}
          >
            {headerLabel}
          </div>
          <h3
            className="mt-1 font-bold leading-tight text-slate-900"
            style={{ fontSize: 18 }}
          >
            동/반의어 TEST 정답
          </h3>
          <div
            className="mt-2 h-0.5 w-full"
            style={{ backgroundColor: accentTest }}
          />
          <div
            className="mt-3 grid gap-3 md:grid-cols-2"
            style={{ fontSize: 11, lineHeight: 1.45 }}
          >
            {tests.syn.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-violet-200">
                <div className="flex items-center justify-between gap-2 bg-violet-100 px-3 py-2 text-[11px] font-semibold text-violet-900">
                  <span className="min-w-0 truncate">[{board.title}]</span>
                  <span className="shrink-0">동의어</span>
                </div>
                <ol className="space-y-1.5 px-3 py-2.5">
                  {tests.syn.map((row, i) => (
                    <li key={`syn-a-${pi}-${i}`} className="break-words">
                      <span className="font-bold">
                        {String(i + 1).padStart(2, "0")} {row.word}
                      </span>
                      {": "}
                      {row.answers.join(", ")}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
            {tests.ant.length > 0 ? (
              <div className="overflow-hidden rounded-xl border border-violet-200">
                <div className="flex items-center justify-between gap-2 bg-violet-100 px-3 py-2 text-[11px] font-semibold text-violet-900">
                  <span className="min-w-0 truncate">[{board.title}]</span>
                  <span className="shrink-0">반의어</span>
                </div>
                <ol className="space-y-1.5 px-3 py-2.5">
                  {tests.ant.map((row, i) => (
                    <li key={`ant-a-${pi}-${i}`} className="break-words">
                      <span className="font-bold">
                        {String(i + 1).padStart(2, "0")} {row.word}
                      </span>
                      {": "}
                      {row.answers.join(", ")}
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    if (parsed.kind === "lesson-heading") {
      return (
        <div className="mt-2">
          <div
            className="font-semibold"
            style={{ color: themeColor, fontSize: 12 }}
          >
            {headerLabel}
          </div>
          <h2
            className="mt-1 font-bold leading-tight text-slate-900"
            style={{ fontSize: 20 }}
          >
            3. 수업용자료
          </h2>
          <div
            className="mt-2 h-0.5 w-full"
            style={{ backgroundColor: themeColor }}
          />
        </div>
      );
    }

    if (parsed.kind === "lesson-item") {
      const idx = Number(parsed.sub);
      const it = lessonItems[idx];
      if (!it) return null;
      return (
        <div
          className="mt-1 grid grid-cols-[22px_3fr_1fr] gap-2 border-b border-slate-100 pb-2"
          style={bodyStyle}
        >
          <div className="font-bold" style={{ color: themeColor }}>
            {idx + 1}
          </div>
          <div style={{ fontWeight: boldLessonBody ? 700 : 400 }}>
            {interactive
              ? markVocabInEnglish(it.english_text, board.vocab, themeColor)
              : it.english_text}
          </div>
          <div
            className="text-slate-700"
            style={{
              fontSize: "0.92em",
              fontWeight: 400,
              visibility: showKorean ? "visible" : "hidden",
            }}
            aria-hidden={!showKorean}
          >
            {it.korean_text?.trim() || (
              <span className="text-slate-400">—</span>
            )}
          </div>
        </div>
      );
    }

    if (parsed.kind === "flow") {
      return (
        <div className="mt-6">
          <h2
            className="mb-3 font-bold leading-snug"
            style={{ color: themeColor, fontSize: titleSizes.section }}
          >
            4. 논리 흐름 &amp; 삽화
          </h2>
          <div
            className={`grid gap-4 ${
              board.illustrationUrl
                ? "grid-cols-1 md:grid-cols-2"
                : "grid-cols-1"
            }`}
          >
            {board.analysisCards.length > 0 ? (
              <div
                className="rounded-xl bg-slate-100 p-4"
                style={{
                  fontSize: Math.max(11, fontSizePx - 1),
                  lineHeight: 1.45,
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
                  {board.analysisCards.map((c, i) => (
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
            {board.illustrationUrl ? (
              <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={board.illustrationUrl}
                  alt="4컷 삽화"
                  className="h-full w-full object-contain"
                />
              </div>
            ) : null}
          </div>
        </div>
      );
    }

    return null;
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

          {projects.map((p, pi) => (
            <div
              key={p.id}
              className="space-y-2 rounded-xl border border-slate-100 bg-slate-50/80 p-3"
            >
              <p className="text-[11px] font-bold text-slate-500">
                지문 {String(pi + 1).padStart(2, "0")}
              </p>
              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-slate-500">
                  한국어 제목
                </span>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={p.title}
                  onChange={(e) => {
                    const v = e.target.value;
                    setProjects((prev) =>
                      prev.map((row, i) =>
                        i === pi ? { ...row, title: v } : row
                      )
                    );
                  }}
                />
              </label>
              {p.titleEn?.trim() ? (
                <p className="text-xs text-slate-600">
                  <span className="font-bold text-slate-500">영어 제목 · </span>
                  {p.titleEn}
                </p>
              ) : (
                <p className="text-[11px] text-slate-400">
                  영어 제목은 AI가 자동으로 채웁니다
                </p>
              )}
              <label className="block space-y-1">
                <span className="text-[11px] font-bold text-slate-500">출처</span>
                <input
                  className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm"
                  value={p.source ?? ""}
                  placeholder="예: 2024 수능특강"
                  onChange={(e) => {
                    const v = e.target.value;
                    setProjects((prev) =>
                      prev.map((row, i) =>
                        i === pi ? { ...row, source: v } : row
                      )
                    );
                  }}
                />
              </label>
            </div>
          ))}

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
              <span className="text-xs font-bold text-slate-500">
                수업용자료 본문 줄간격
              </span>
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
              <span className="text-xs font-bold text-slate-500">학원 로고</span>
              <button
                type="button"
                onClick={() => setShowLogo((v) => !v)}
                className={`rounded-full px-3 py-1 text-xs font-bold ${
                  showLogo
                    ? "bg-violet-600 text-white"
                    : "bg-slate-100 text-slate-500"
                }`}
              >
                {showLogo ? "ON" : "OFF"}
              </button>
            </div>
            <p className="text-[11px] text-slate-400">
              각 페이지 하단(꼬리말)에 학원 로고를 표시합니다.
            </p>
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
            onClick={() => {
              void (async () => {
                for (let i = 0; i < projects.length; i++) {
                  await autoGenerate(projects[i]!.id, i);
                }
              })();
            }}
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

      {/* Preview canvas — continuous flow, soft A4 page breaks between blocks */}
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
            {pageChunks
              .filter((chunk) => chunk.length > 0)
              .map((chunk, pageI, pages) => (
              <A4Sheet
                key={`pack-page-${pageI}`}
                label={`${pageI + 1} / ${pages.length}`}
                footerLogoSrc={showLogo ? logoSrc : null}
                className={
                  pageI === pages.length - 1
                    ? "lesson-pack-a4-sheet--last"
                    : undefined
                }
              >
                <div className="flex flex-col gap-2.5">
                  {chunk.map((blockId) => (
                    <div key={`${pageI}-${blockId}`} className="break-inside-avoid">
                      {renderPackBlock(blockId, true)}
                    </div>
                  ))}
                </div>
              </A4Sheet>
            ))}

            {/* Off-screen measure — must match on-screen interactive heights */}
            <div
              aria-hidden
              className="lesson-pack-measure pointer-events-none absolute left-[-9999px] top-0 -z-10 w-[210mm] opacity-0 print:hidden"
              style={{ padding: A4_PAD, ...previewStyle }}
            >
              <div ref={packMeasureRef} className="flex flex-col gap-2.5">
                {packBlocks.map((b) => (
                  <div key={`m-${b.id}`} data-pack-block={b.id}>
                    {renderPackBlock(b.id, true)}
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
