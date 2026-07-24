"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { NeltShareActions } from "@/components/nelt/NeltShareActions";
import {
  DomainMetricsChart,
  NeltTrendCharts,
} from "@/components/nelt/NeltTrendCharts";
import {
  buildDomainSections,
  buildParentOverallSummary,
} from "@/lib/nelt/compare/domain-sections";
import type { NeltGrowthAnalysis } from "@/lib/nelt/compare/types";
import {
  applyAiNarratives,
  type NeltAiNarratives,
} from "@/lib/nelt/generate-report-narratives";

interface NeltGrowthReportViewProps {
  analysis: NeltGrowthAnalysis;
  role: "admin" | "teacher";
  /** 학부모 공개 페이지 — 공유/편집 UI 숨김 */
  parentView?: boolean;
  /** 이미 AI 서술 적용됨 — 마운트 시 자동 재생성 안 함 */
  narrativesReady?: boolean;
}

function formatDateDots(iso: string | null): string {
  if (!iso) return "—";
  return iso.replaceAll("-", ".");
}

export function NeltGrowthReportView({
  analysis,
  parentView = false,
  narrativesReady = false,
}: NeltGrowthReportViewProps) {
  const [ai, setAi] = useState<NeltAiNarratives | null>(
    analysis.aiNarratives ?? null
  );
  const [aiLoading, setAiLoading] = useState(false);
  const [aiStatus, setAiStatus] = useState<string | null>(null);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiElapsed, setAiElapsed] = useState(0);

  const displayAnalysis = useMemo(
    () => (ai ? applyAiNarratives(analysis, ai) : analysis),
    [analysis, ai]
  );

  const period = useMemo(() => {
    return `${formatDateDots(analysis.start.testDate)} — ${formatDateDots(
      analysis.end.testDate
    )}`;
  }, [analysis]);

  const summaryHtml = useMemo(() => {
    if (ai?.overallSummary?.trim()) {
      return ai.overallSummary.includes("<strong>")
        ? ai.overallSummary
        : ai.overallSummary;
    }
    return buildParentOverallSummary(analysis);
  }, [ai, analysis]);

  const domainSections = useMemo(
    () =>
      buildDomainSections(analysis, {
        explanations: ai?.domainExplanations,
        plans: ai?.domainPlans,
      }),
    [analysis, ai]
  );

  const parentHighlights = useMemo(
    () => analysis.highlights.filter((h) => h.parentVisible),
    [analysis.highlights]
  );

  async function loadNarratives(force = false) {
    if (parentView) return;
    setAiLoading(true);
    setAiStatus(null);
    setAiProgress(8);
    setAiElapsed(0);
    try {
      const res = await fetch("/api/nelt/report-narratives", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: analysis.studentName,
          analysis,
          force,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok || !json.narratives) {
        throw new Error(json.message ?? "서술 생성 실패");
      }
      setAiProgress(100);
      setAi(json.narratives as NeltAiNarratives);
      if (json.source === "ai") {
        setAiStatus(`AI 서술을 적용했습니다. (${json.model ?? "gpt-5.5"})`);
      } else if (json.source === "cache") {
        setAiStatus(
          json.model
            ? `저장된 AI 서술을 불러왔습니다. (${json.model})`
            : "저장된 서술을 불러왔습니다."
        );
      } else {
        setAiStatus(
          json.message
            ? `기본 문구를 사용합니다. (${json.message})`
            : "기본 문구를 사용합니다."
        );
      }
    } catch (e) {
      setAiStatus(e instanceof Error ? e.message : "서술 생성 오류");
    } finally {
      setAiLoading(false);
      setAiProgress(0);
      setAiElapsed(0);
    }
  }

  useEffect(() => {
    if (!aiLoading) return;
    const started = Date.now();
    const tick = window.setInterval(() => {
      const sec = Math.floor((Date.now() - started) / 1000);
      setAiElapsed(sec);
      setAiProgress((p) => (p >= 92 ? p : Math.min(92, p + (sec < 5 ? 3 : 1.5))));
    }, 400);
    return () => window.clearInterval(tick);
  }, [aiLoading]);

  useEffect(() => {
    if (parentView) return;
    if (narrativesReady || analysis.aiNarratives) {
      if (analysis.aiNarratives) setAi(analysis.aiNarratives);
      return;
    }
    void loadNarratives(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- 학생·회차·서술 변경 시
  }, [
    analysis.studentName,
    analysis.attemptCount,
    analysis.aiNarratives,
    narrativesReady,
    parentView,
  ]);

  return (
    <div className="nelt-proto space-y-4">
      {!parentView && (
        <div className="print:hidden flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
          >
            PDF·인쇄
          </Button>
          <Button
            type="button"
            variant="primary"
            size="sm"
            disabled={aiLoading}
            onClick={() => void loadNarratives(true)}
          >
            {aiLoading
              ? `AI 서술 작성 중… ${Math.max(1, Math.round(aiProgress))}%`
              : "AI로 서술 다듬기 (gpt-5.5)"}
          </Button>
          {aiStatus && (
            <span className="text-xs text-slate-500">{aiStatus}</span>
          )}
        </div>
      )}

      <article className="overflow-hidden rounded-[22px] border border-[#dce3ed] bg-white shadow-[0_14px_38px_rgba(21,45,79,0.10)]">
        <header
          className="px-6 py-8 text-white sm:px-9"
          style={{
            background:
              "radial-gradient(circle at 87% 16%, rgba(242,140,40,.24), transparent 30%), linear-gradient(135deg, #122844, #244b79)",
          }}
        >
          <div className="flex flex-col justify-between gap-5 sm:flex-row">
            <div>
              <small className="block text-xs font-bold tracking-[0.09em] opacity-70">
                ENGCORE LEARNING REPORT
              </small>
              <h2 className="mt-2 text-[28px] font-bold leading-tight sm:text-[31px]">
                NELT 영어 성장 리포트
              </h2>
              <p className="mt-1 text-sm opacity-75">
                {analysis.attemptCount}차례의 결과를 바탕으로 성장한 지점과 다음
                학습 방향을 정리했습니다.
              </p>
            </div>
            <div className="min-w-[210px] self-start rounded-[14px] border border-white/20 bg-white/10 px-4 py-3">
              <strong className="block text-lg">{analysis.studentName}</strong>
              <span className="text-sm opacity-75">{period}</span>
              {analysis.end.studentGradeRaw && (
                <span className="mt-1 block text-xs opacity-70">
                  {analysis.end.studentGradeRaw}
                </span>
              )}
            </div>
          </div>
        </header>

        <div className="px-5 py-7 sm:px-8 sm:py-9">
          {aiLoading && (
            <div className="mb-5 rounded-xl border border-[#c9dbf5] bg-[#edf4ff] px-4 py-3.5 text-[#244a78]">
              <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">
                <span>학부모용 서술을 AI로 다듬는 중입니다…</span>
                <span className="tabular-nums text-xs font-bold opacity-80">
                  {aiElapsed}초 · {Math.max(1, Math.round(aiProgress))}%
                </span>
              </div>
              <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-white/90">
                <div
                  className="h-full rounded-full bg-[#244a78] transition-[width] duration-300 ease-out"
                  style={{
                    width: `${Math.min(100, Math.max(4, aiProgress))}%`,
                  }}
                />
              </div>
            </div>
          )}

          <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold text-[#172033]">
            <span className="inline-block h-5 w-1.5 rounded-lg bg-[#f28c28]" />
            전체 성장 요약
          </h3>
          <div className="mb-7 rounded-[17px] border border-[#e6eaf1] bg-gradient-to-br from-[#f8fbff] to-[#fff8f0] px-5 py-4">
            <p
              className="text-[15px] leading-relaxed text-[#172033] [&_strong]:text-[#152d4f]"
              dangerouslySetInnerHTML={{ __html: summaryHtml }}
            />
          </div>

          <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold text-[#172033]">
            <span className="inline-block h-5 w-1.5 rounded-lg bg-[#f28c28]" />
            핵심 성장
          </h3>
          <div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {parentHighlights.map((h) => (
              <article
                key={h.key}
                className="relative min-h-[124px] overflow-hidden rounded-[15px] border border-[#dce3ed] bg-white p-[15px]"
              >
                <div className="absolute -right-6 -top-7 h-[74px] w-[74px] rounded-full bg-[#fff3e5]" />
                <div className="relative">
                  <div className="text-xs font-extrabold text-[#68748a]">
                    {h.title}
                  </div>
                  <div className="mt-2 text-[22px] font-black tracking-tight text-[#152d4f]">
                    {h.beforeLabel} → {h.afterLabel}
                  </div>
                  {h.deltaLabel && (
                    <div className="mt-2 text-[13px] font-extrabold text-[#168f62]">
                      {h.deltaLabel}
                    </div>
                  )}
                </div>
              </article>
            ))}
            {parentHighlights.length === 0 && (
              <p className="text-sm text-slate-500 sm:col-span-4">
                강조할 성장 지표가 아직 충분하지 않습니다.
              </p>
            )}
          </div>

          <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold text-[#172033]">
            <span className="inline-block h-5 w-1.5 rounded-lg bg-[#f28c28]" />
            전체 영역 수준 변화
          </h3>
          <div className="mb-8">
            <NeltTrendCharts analysis={displayAnalysis} />
          </div>

          {domainSections.map((section) => (
            <section
              key={section.domain}
              className="mb-5 overflow-hidden rounded-[18px] border border-[#dce3ed] bg-white"
            >
              <header className="flex flex-wrap items-center justify-between gap-3 border-b border-[#edf0f5] bg-[#fbfcfe] px-4 py-3.5 sm:px-5">
                <div className="flex items-center gap-3">
                  <div
                    className="flex h-10 w-10 items-center justify-center rounded-xl text-sm font-black text-white"
                    style={{
                      background:
                        section.domain === "vocabulary"
                          ? "#f28c28"
                          : section.domain === "grammar"
                            ? "#244a78"
                            : section.domain === "listening"
                              ? "#168f62"
                              : "#7c3aed",
                    }}
                  >
                    {section.icon}
                  </div>
                  <div>
                    <h3 className="m-0 text-base font-bold text-[#172033]">
                      {section.label} 영역 변화
                    </h3>
                    <p className="m-0 text-xs text-[#68748a]">
                      {section.subtitle}
                    </p>
                  </div>
                </div>
                <span
                  className={
                    section.badgeTone === "growth"
                      ? "rounded-full bg-[#eaf8f2] px-2.5 py-1 text-[11px] font-extrabold text-[#168f62]"
                      : section.badgeTone === "focus"
                        ? "rounded-full bg-[#fff3e5] px-2.5 py-1 text-[11px] font-extrabold text-[#b86a12]"
                        : "rounded-full bg-[#edf4ff] px-2.5 py-1 text-[11px] font-extrabold text-[#244a78]"
                  }
                >
                  {section.badge}
                </span>
              </header>

              <div className="space-y-4 px-4 py-4 sm:px-5 sm:py-5">
                <div className="flex flex-wrap items-center gap-2">
                  {section.stages.map((stage, i) => (
                    <div key={stage.attempt} className="flex items-center gap-2">
                      <div className="min-w-[88px] rounded-xl border border-[#e6eaf1] bg-[#f8fbff] px-3 py-2 text-center">
                        <small className="block text-[11px] font-bold text-[#68748a]">
                          {stage.attempt}차
                          {stage.difficulty ? ` · ${stage.difficulty}` : ""}
                        </small>
                        <strong className="text-sm text-[#152d4f]">
                          {stage.level}
                        </strong>
                      </div>
                      {i < section.stages.length - 1 && (
                        <span className="text-[#98a2b3]">→</span>
                      )}
                    </div>
                  ))}
                </div>

                <div className="grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                  <div className="rounded-2xl border border-[#dce3ed] p-3.5">
                    <h4 className="m-0 text-sm font-bold text-[#172033]">
                      {section.label} 성장 그래프
                    </h4>
                    <p className="mb-2 mt-1 text-xs text-[#68748a]">
                      회차별 핵심 지표 변화입니다.
                    </p>
                    <DomainMetricsChart section={section} />
                  </div>

                  <div className="space-y-3">
                    <div className="grid gap-2 sm:grid-cols-2">
                      {section.keyPoints.map((kp) => (
                        <div
                          key={kp.label}
                          className="rounded-xl border border-[#e6eaf1] bg-[#fbfcfe] px-3 py-2.5"
                        >
                          <small className="block text-[11px] font-bold text-[#68748a]">
                            {kp.label}
                          </small>
                          <strong className="mt-0.5 block text-[13px] leading-snug text-[#152d4f]">
                            {kp.value}
                          </strong>
                        </div>
                      ))}
                    </div>
                    <div className="rounded-xl border border-[#cbeadc] bg-[#eaf8f2] px-3.5 py-3">
                      <p className="m-0 text-xs font-extrabold text-[#168f62]">
                        성장 설명
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#172033]">
                        {section.explanation}
                      </p>
                    </div>
                    <div className="rounded-xl border border-[#f3dcc0] bg-[#fff8ef] px-3.5 py-3">
                      <p className="m-0 text-xs font-extrabold text-[#b86a12]">
                        다음 학습 계획
                      </p>
                      <p className="mt-1.5 text-sm leading-relaxed text-[#172033]">
                        {section.plan}
                      </p>
                    </div>
                  </div>
                </div>

                {section.subskills.length > 0 && (
                  <>
                    <p className="m-0 text-sm font-bold text-[#172033]">
                      {section.label} 세부 역량 변화
                    </p>
                    <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
                      {section.subskills.map((s) => (
                        <div
                          key={s.name}
                          className="rounded-xl border border-[#e6eaf1] px-3 py-2.5"
                        >
                          <small className="block text-[11px] font-bold text-[#68748a]">
                            {s.name}
                          </small>
                          <strong className="mt-0.5 block text-[13px] text-[#152d4f]">
                            {s.series}
                          </strong>
                        </div>
                      ))}
                    </div>
                  </>
                )}
              </div>
            </section>
          ))}

          <div className="mb-7 grid gap-3.5 md:grid-cols-2">
            <section className="rounded-2xl border border-[#cbeadc] bg-[#eaf8f2] p-4">
              <h4 className="m-0 mb-2 font-bold text-[#152d4f]">
                종합 성장 평가
              </h4>
              <p className="m-0 text-sm leading-relaxed text-[#172033]">
                {[
                  displayAnalysis.strengthsNarrative,
                  displayAnalysis.stableNarrative,
                ]
                  .filter((t) => t?.trim())
                  .join(" ")}
              </p>
            </section>
            <section className="rounded-2xl border border-[#f3dcc0] bg-[#fff8ef] p-4">
              <h4 className="m-0 mb-2 font-bold text-[#152d4f]">
                향후 지도 계획
              </h4>
              <p className="m-0 text-sm leading-relaxed text-[#172033]">
                {displayAnalysis.nextGoalsNarrative}
              </p>
            </section>
          </div>

          <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold text-[#172033]">
            <span className="inline-block h-5 w-1.5 rounded-lg bg-[#f28c28]" />
            원본 결과 링크
          </h3>
          <div className="mb-8 flex flex-wrap gap-2.5">
            {analysis.attempts.map((a) =>
              a.sourceUrl ? (
                <a
                  key={a.id}
                  href={a.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="max-w-full truncate rounded-[10px] bg-[#edf4ff] px-3 py-2 text-xs font-bold text-[#244a78] no-underline"
                >
                  {a.attemptNumber}차 원본 열기
                </a>
              ) : (
                <span
                  key={a.id}
                  className="rounded-[10px] bg-[#f0f2f6] px-3 py-2 text-xs font-bold text-[#647086]"
                >
                  {a.attemptNumber}차 (첨부/내부)
                </span>
              )
            )}
          </div>

          {!parentView && (
            <>
              <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold text-[#172033]">
                <span className="inline-block h-5 w-1.5 rounded-lg bg-[#f28c28]" />
                학부모 카카오톡 안내문
              </h3>
              <NeltShareActions
                studentName={analysis.studentName}
                analysis={
                  ai
                    ? { ...displayAnalysis, aiNarratives: ai }
                    : displayAnalysis
                }
              />
            </>
          )}

          <p className="mt-6 text-center text-[11px] text-[#98a2b3]">
            EngCore NELT 성장 리포트
          </p>
        </div>
      </article>
    </div>
  );
}
