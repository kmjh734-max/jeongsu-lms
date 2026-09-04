"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type CSSProperties } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import {
  generateAndSaveAnalysisReportAction,
  saveAnalysisReportAction,
} from "@/lib/lesson-materials/analysis-report-actions";
import type {
  AnalysisChunkRole,
  AnalysisReportData,
  AnalysisSentence,
} from "@/lib/lesson-materials/generate-analysis-report";
import { LOGO_SRC } from "@/lib/branding";

export type AnalysisReportProjectInput = {
  id: string;
  title: string;
  titleEn: string | null;
  source: string | null;
  headerLabel: string;
  report: AnalysisReportData | null;
};

const ROLE_STYLE: Record<
  AnalysisChunkRole,
  { bg: string; text: string }
> = {
  s: { bg: "#d1fae5", text: "#065f46" },
  v: { bg: "#dbeafe", text: "#1e3a8a" },
  o: { bg: "#ffedd5", text: "#9a3412" },
  c: { bg: "#ede9fe", text: "#5b21b6" },
  M: { bg: "#f3e8ff", text: "#6b21a8" },
  other: { bg: "#f1f5f9", text: "#334155" },
};

function ChunkRow({
  chunks,
  kind,
}: {
  chunks: Array<{ text: string; role: AnalysisChunkRole }>;
  kind: "en" | "ko";
}) {
  return (
    <div className="flex flex-wrap items-end gap-x-1 gap-y-2">
      {chunks.map((c, i) => {
        const style = ROLE_STYLE[c.role] ?? ROLE_STYLE.other;
        return (
          <div key={`${kind}-${i}`} className="inline-flex items-end gap-1">
            {i > 0 ? (
              <span className="mb-1 text-slate-300" aria-hidden>
                /
              </span>
            ) : null}
            <div className="inline-flex flex-col items-center">
              <span
                className={`rounded px-1.5 py-0.5 leading-snug ${
                  kind === "en" ? "text-[13px] font-semibold" : "text-[12px]"
                }`}
                style={{ backgroundColor: style.bg, color: style.text }}
              >
                {c.text || "\u00a0"}
              </span>
              {kind === "en" ? (
                <span
                  className="mt-0.5 text-[10px] font-bold italic"
                  style={{ color: style.text }}
                >
                  {c.role === "other" ? "" : c.role}
                </span>
              ) : null}
            </div>
          </div>
        );
      })}
    </div>
  );
}

function SentenceBlock({
  sentence,
  index,
  accent,
}: {
  sentence: AnalysisSentence;
  index: number;
  accent: string;
}) {
  const koChunks = sentence.koChunks.map((text, i) => ({
    text,
    role: sentence.enChunks[i]?.role ?? ("other" as AnalysisChunkRole),
  }));

  return (
    <section className="break-inside-avoid border-b border-slate-200 pb-5 pt-4 last:border-b-0">
      <div className="mb-2 flex items-start gap-3">
        <span
          className="shrink-0 text-3xl font-black italic leading-none"
          style={{ color: accent }}
        >
          {index + 1}
        </span>
        <div className="min-w-0 flex-1 space-y-2">
          <ChunkRow chunks={sentence.enChunks} kind="en" />
          <ChunkRow chunks={koChunks} kind="ko" />
        </div>
      </div>

      <div className="mt-3 rounded-lg border-l-4 border-orange-400 bg-orange-50 px-3 py-2.5">
        <p className="text-[13px] leading-relaxed text-slate-800">
          <span className="font-bold text-orange-600">[쉬운 이해]</span>{" "}
          {sentence.easyUnderstanding}
        </p>
      </div>

      {sentence.grammarPoints.length > 0 ? (
        <div className="mt-2 rounded-lg border border-sky-200 bg-sky-50/60 px-3 py-2.5">
          <p className="mb-1.5 text-[13px] font-bold text-sky-800">[문법 분석]</p>
          <ol className="space-y-1.5">
            {sentence.grammarPoints.map((g, gi) => (
              <li key={gi} className="text-[12.5px] leading-relaxed text-slate-800">
                <span className="mr-1 font-bold text-rose-600">
                  {["①", "②", "③", "④"][gi] ?? `${gi + 1}.`}
                </span>
                {g.title ? (
                  <span className="font-bold text-slate-900">{g.title}</span>
                ) : null}
                {g.title && g.detail ? " · " : null}
                {g.detail ? <span>{g.detail}</span> : null}
                {g.example ? (
                  <span className="text-violet-700">
                    {" "}
                    ({g.example})
                  </span>
                ) : null}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </section>
  );
}

export function AnalysisReportWorkbench({
  role,
  projects: initialProjects,
  logoSrc = LOGO_SRC,
}: {
  role: "admin" | "teacher";
  projects: AnalysisReportProjectInput[];
  logoSrc?: string;
}) {
  const base =
    role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials";
  const [projects, setProjects] = useState(initialProjects);
  const [active, setActive] = useState(0);
  const [headerLabel, setHeaderLabel] = useState(
    () => initialProjects[0]?.headerLabel || "26년도 1학기 중간고사 대비"
  );
  const [accent] = useState("#DC2626");
  const [error, setError] = useState<string | null>(null);
  const [generating, setGenerating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [prepLoading, setPrepLoading] = useState(() =>
    initialProjects.some((p) => !p.report?.sentences?.length)
  );

  const project = projects[active];

  useEffect(() => {
    const id = "analysis-report-print-page-size-style";
    let el = document.getElementById(id) as HTMLStyleElement | null;
    if (!el) {
      el = document.createElement("style");
      el.id = id;
    }
    el.textContent = `
@media print {
  @page { size: 210mm 297mm; margin: 0; }
  @page app-print-a4 { size: 210mm 297mm; margin: 0; }
  #analysis-report-print-root { transform: none !important; gap: 0 !important; }
}
`;
    document.body.appendChild(el);
    return () => {
      el?.remove();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    const pending = projects
      .map((p, i) => ({ p, i }))
      .filter(({ p }) => !p.report?.sentences?.length);
    if (pending.length === 0) {
      setPrepLoading(false);
      return;
    }

    setPrepLoading(true);
    setGenerating(true);
    (async () => {
      let failed = false;
      for (const { p, i } of pending) {
        if (cancelled) return;
        const res = await generateAndSaveAnalysisReportAction(role, {
          projectId: p.id,
          headerLabel,
        });
        if (!res.ok) {
          failed = true;
          setError(res.message);
          break;
        }
        setProjects((prev) =>
          prev.map((row, idx) =>
            idx === i
              ? {
                  ...row,
                  report: res.report,
                  headerLabel: res.report.headerLabel || row.headerLabel,
                }
              : row
          )
        );
      }
      if (!cancelled && !failed) setPrepLoading(false);
      setGenerating(false);
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects.map((p) => p.id).join(",")]);

  const report = project?.report;

  async function handleRegen() {
    if (!project) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await generateAndSaveAnalysisReportAction(role, {
        projectId: project.id,
        headerLabel,
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setProjects((prev) =>
        prev.map((row, idx) =>
          idx === active
            ? {
                ...row,
                report: res.report,
                headerLabel: res.report.headerLabel || headerLabel,
              }
            : row
        )
      );
    } finally {
      setGenerating(false);
    }
  }

  async function handleSave() {
    if (!project?.report) return;
    setSaving(true);
    setError(null);
    try {
      const next: AnalysisReportData = {
        ...project.report,
        headerLabel,
      };
      const res = await saveAnalysisReportAction(role, {
        projectId: project.id,
        report: next,
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setProjects((prev) =>
        prev.map((row, idx) =>
          idx === active ? { ...row, report: next, headerLabel } : row
        )
      );
    } finally {
      setSaving(false);
    }
  }

  const sheetStyle = useMemo(
    (): CSSProperties => ({
      width: "210mm",
      minHeight: "297mm",
      padding: "12mm 12mm 16mm",
      boxSizing: "border-box",
    }),
    []
  );

  if (!project) {
    return (
      <div className="flex h-[80vh] items-center justify-center">
        <Alert variant="error">선택된 자료가 없습니다.</Alert>
      </div>
    );
  }

  if (prepLoading) {
    return (
      <div className="flex h-[80vh] items-center justify-center bg-slate-100">
        <div className="rounded-2xl bg-white px-8 py-6 text-center shadow">
          <p className="text-sm font-semibold text-slate-800">
            분석서를 만들고 있습니다…
          </p>
          <p className="mt-1 text-xs text-slate-500">문장 단위로 정리 중</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 flex bg-slate-200 print:static print:z-auto print:block print:bg-white">
      <aside className="flex w-[280px] shrink-0 flex-col border-r border-slate-200 bg-white print:hidden">
        <div className="space-y-3 border-b border-slate-100 p-4">
          <Link href={base} className="text-xs font-semibold text-violet-700">
            ← 자료함
          </Link>
          <h1 className="text-base font-bold text-slate-900">분석서</h1>
          {projects.length > 1 ? (
            <div className="flex flex-wrap gap-1">
              {projects.map((p, i) => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => {
                    setActive(i);
                    setHeaderLabel(p.headerLabel);
                  }}
                  className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                    i === active
                      ? "bg-violet-600 text-white"
                      : "bg-slate-100 text-slate-600"
                  }`}
                >
                  {String(i + 1).padStart(2, "0")}
                </button>
              ))}
            </div>
          ) : null}
        </div>

        <div className="flex-1 space-y-3 overflow-auto p-4">
          <label className="block space-y-1">
            <span className="text-[11px] font-bold text-slate-500">상단 라벨</span>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={headerLabel}
              onChange={(e) => setHeaderLabel(e.target.value)}
            />
          </label>
          <p className="text-xs text-slate-500">{project.title}</p>
          {project.source?.trim() ? (
            <p className="text-[11px] text-slate-400">출처: {project.source}</p>
          ) : null}
          {error ? <Alert variant="error">{error}</Alert> : null}
        </div>

        <div className="space-y-2 border-t border-slate-100 p-4">
          <Button
            type="button"
            size="sm"
            className="w-full"
            disabled={generating || saving}
            onClick={() => void handleRegen()}
          >
            {generating ? "생성 중…" : "분석서 다시 만들기"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="w-full"
            disabled={generating || saving || !report}
            onClick={() => void handleSave()}
          >
            {saving ? "저장 중…" : "저장"}
          </Button>
          <Button
            type="button"
            size="sm"
            variant="secondary"
            className="w-full"
            onClick={() => window.print()}
          >
            인쇄 / PDF
          </Button>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-auto print:overflow-visible">
        <div className="flex justify-center p-6 print:p-0">
          <div id="analysis-report-print-root" className="flex flex-col gap-6 print:gap-0">
            <article
              className="analysis-report-a4-sheet relative bg-white shadow-xl print:shadow-none"
              style={sheetStyle}
            >
              <header className="mb-4">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0 flex-1">
                    <p
                      className="text-sm font-semibold"
                      style={{ color: accent }}
                    >
                      {headerLabel}
                    </p>
                    <h1 className="mt-1 text-[22px] font-black leading-snug text-slate-900">
                      {project.title}
                    </h1>
                  </div>
                  <div
                    className="shrink-0 text-4xl font-black tabular-nums"
                    style={{ color: accent }}
                  >
                    {String(active + 1).padStart(2, "0")}
                  </div>
                </div>
                <div
                  className="mt-3 h-1 w-full"
                  style={{ backgroundColor: accent }}
                />
              </header>

              <div className="space-y-1">
                {(report?.sentences ?? []).map((s, i) => (
                  <SentenceBlock
                    key={s.itemId || i}
                    sentence={s}
                    index={i}
                    accent={accent}
                  />
                ))}
              </div>

              {logoSrc ? (
                <div className="pointer-events-none absolute bottom-[6mm] left-[12mm] right-[12mm] flex justify-center border-t border-slate-200 pt-2 print:flex">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoSrc}
                    alt=""
                    className="h-7 w-auto max-w-[32mm] object-contain opacity-90"
                  />
                </div>
              ) : null}
            </article>
          </div>
        </div>
      </main>
    </div>
  );
}
