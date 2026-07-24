"use client";

import { useMemo } from "react";
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

interface NeltGrowthReportViewProps {
  analysis: NeltGrowthAnalysis;
  role: "admin" | "teacher";
  /** 학부모 공개 페이지 — 공유/편집 UI 숨김 */
  parentView?: boolean;
}

function formatDateDots(iso: string | null): string {
  if (!iso) return "—";
  return iso.replaceAll("-", ".");
}

export function NeltGrowthReportView({
  analysis,
  parentView = false,
}: NeltGrowthReportViewProps) {
  const period = useMemo(() => {
    return `${formatDateDots(analysis.start.testDate)} — ${formatDateDots(
      analysis.end.testDate
    )}`;
  }, [analysis]);

  const summaryHtml = useMemo(
    () => buildParentOverallSummary(analysis),
    [analysis]
  );

  const domainSections = useMemo(
    () => buildDomainSections(analysis),
    [analysis]
  );

  const parentHighlights = useMemo(
    () => analysis.highlights.filter((h) => h.parentVisible),
    [analysis.highlights]
  );

  return (
    <div className="nelt-proto space-y-4">
      {!parentView && (
        <div className="print:hidden flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            size="sm"
            onClick={() => window.print()}
          >
            PDF·인쇄
          </Button>
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
          {/* 1. 전체 성장 요약 */}
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

          {/* 2. 핵심 성장 카드 */}
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

          {/* 3. 전체 영역 수준 선그래프 */}
          <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold text-[#172033]">
            <span className="inline-block h-5 w-1.5 rounded-lg bg-[#f28c28]" />
            전체 영역 수준 변화
          </h3>
          <div className="mb-8">
            <NeltTrendCharts analysis={analysis} />
          </div>

          {/* 4–7. 영역별 섹션 */}
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
                {/* 회차별 수준 */}
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

          {/* 8–9. 종합 / 향후 계획 */}
          <div className="mb-7 grid gap-3.5 md:grid-cols-2">
            <section className="rounded-2xl border border-[#cbeadc] bg-[#eaf8f2] p-4">
              <h4 className="m-0 mb-2 font-bold text-[#152d4f]">
                종합 성장 평가
              </h4>
              <p className="m-0 text-sm leading-relaxed text-[#172033]">
                {analysis.strengthsNarrative} {analysis.stableNarrative}
              </p>
            </section>
            <section className="rounded-2xl border border-[#f3dcc0] bg-[#fff8ef] p-4">
              <h4 className="m-0 mb-2 font-bold text-[#152d4f]">
                향후 지도 계획
              </h4>
              <p className="m-0 text-sm leading-relaxed text-[#172033]">
                {analysis.nextGoalsNarrative}
              </p>
            </section>
          </div>

          {/* 원본 링크 */}
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

          {/* 10. 학부모 카카오 안내 */}
          {!parentView && (
            <>
              <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold text-[#172033]">
                <span className="inline-block h-5 w-1.5 rounded-lg bg-[#f28c28]" />
                학부모 카카오톡 안내문
              </h3>
              <NeltShareActions
                studentName={analysis.studentName}
                analysis={analysis}
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
