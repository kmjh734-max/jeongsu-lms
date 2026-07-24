"use client";

import { DOMAIN_LABEL } from "@/lib/nelt/compare/build-growth";
import type { NeltDomainSection } from "@/lib/nelt/compare/domain-sections";
import type { NeltGrowthAnalysis } from "@/lib/nelt/compare/types";
import type { NeltDomain } from "@/types/nelt";

const DOMAIN_COLORS: Record<NeltDomain, string> = {
  vocabulary: "#f28c28",
  grammar: "#244a78",
  listening: "#168f62",
  reading: "#7c3aed",
};

const SERIES_COLORS = ["#f28c28", "#244a78", "#168f62", "#7c3aed", "#0ea5e9"];

/** 전체 영역 수준 선그래프 + 회차 간 타임라인 */
export function NeltTrendCharts({ analysis }: { analysis: NeltGrowthAnalysis }) {
  const points = analysis.trendPoints ?? [];
  if (points.length < 2) return null;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#dce3ed] p-4">
        <h4 className="m-0 text-base font-bold text-[#172033]">
          전체 영역 수준 변화
        </h4>
        <p className="mb-3 mt-1 text-xs text-[#68748a]">
          1차부터 {points.length}차까지 어휘·문법·듣기·독해의 수준 흐름입니다.
        </p>
        <LevelLineChart analysis={analysis} />
        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-[#68748a]">
          {(Object.keys(DOMAIN_LABEL) as NeltDomain[]).map((d) => (
            <span key={d} className="inline-flex items-center gap-1.5">
              <i
                className="inline-block h-2 w-2 rounded-full"
                style={{ background: DOMAIN_COLORS[d] }}
              />
              {DOMAIN_LABEL[d]}
            </span>
          ))}
        </div>
      </section>

      {(analysis.attemptSteps?.length ?? 0) > 0 && (
        <section className="grid gap-3 md:grid-cols-3">
          {(analysis.attemptSteps ?? []).map((step) => (
            <div
              key={`${step.fromAttempt}-${step.toAttempt}`}
              className="rounded-2xl border border-[#dce3ed] bg-[#f8fbff] px-3.5 py-3"
            >
              <p className="text-sm font-bold text-[#152d4f]">
                {step.fromAttempt}차 → {step.toAttempt}차
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#172033]">
                {step.summary}
              </p>
              <span className="mt-2 inline-block rounded-full bg-[#edf4ff] px-2 py-0.5 text-[11px] font-bold text-[#244a78]">
                {step.domainLines.some(
                  (d) =>
                    d.status === "major_growth" || d.status === "growth"
                )
                  ? "성장 구간"
                  : "다음 목표 확인"}
              </span>
            </div>
          ))}
          {analysis.attemptCount >= 3 && (
            <div className="rounded-2xl border border-[#f3dcc0] bg-[#fff8ef] px-3.5 py-3 md:col-span-1">
              <p className="text-sm font-bold text-[#152d4f]">
                1차 → {analysis.attemptCount}차 누적
              </p>
              <p className="mt-1.5 text-sm leading-relaxed text-[#172033]">
                {analysis.strengthsNarrative}
              </p>
              <span className="mt-2 inline-block rounded-full bg-[#fff3e5] px-2 py-0.5 text-[11px] font-bold text-[#b86a12]">
                누적 성장 확인
              </span>
            </div>
          )}
        </section>
      )}
    </div>
  );
}

export function DomainMetricsChart({
  section,
}: {
  section: NeltDomainSection;
}) {
  const labels = section.stages.map((s) => `${s.attempt}차`);
  const series = section.chart.series;
  if (series.length === 0 || labels.length < 2) {
    return (
      <p className="py-8 text-center text-xs text-[#68748a]">
        그래프를 그릴 데이터가 부족합니다.
      </p>
    );
  }

  const w = 420;
  const h = 200;
  const pad = { t: 18, r: 14, b: 34, l: 34 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const maxY = Math.max(1, section.chart.maxY);
  const n = labels.length;

  function xAt(i: number) {
    if (n === 1) return pad.l + innerW / 2;
    return pad.l + (i / (n - 1)) * innerW;
  }
  function yAt(v: number) {
    const clamped = Math.max(0, Math.min(maxY, v));
    return pad.t + innerH - (clamped / maxY) * innerH;
  }

  return (
    <div>
      <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full max-w-full">
        {[0, 0.25, 0.5, 0.75, 1].map((t) => {
          const y = pad.t + innerH * (1 - t);
          return (
            <line
              key={t}
              x1={pad.l}
              x2={w - pad.r}
              y1={y}
              y2={y}
              stroke="#edf0f5"
              strokeWidth={1}
            />
          );
        })}
        {series.map((s, si) => {
          const color = SERIES_COLORS[si % SERIES_COLORS.length];
          const path = s.values
            .map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i)},${yAt(v)}`)
            .join(" ");
          return (
            <g key={s.name}>
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={2.4}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {s.values.map((v, i) => (
                <circle
                  key={`${s.name}-${i}`}
                  cx={xAt(i)}
                  cy={yAt(v)}
                  r={3.5}
                  fill={color}
                >
                  <title>
                    {labels[i]} · {s.name}: {s.display[i]}
                  </title>
                </circle>
              ))}
            </g>
          );
        })}
        {labels.map((label, i) => (
          <text
            key={label}
            x={xAt(i)}
            y={h - 10}
            textAnchor="middle"
            fontSize={11}
            fontWeight={700}
            fill="#68748a"
          >
            {label}
          </text>
        ))}
      </svg>
      <div className="mt-2 flex flex-wrap gap-3 text-[11px] text-[#68748a]">
        {series.map((s, si) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <i
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: SERIES_COLORS[si % SERIES_COLORS.length] }}
            />
            {s.name}
          </span>
        ))}
      </div>
    </div>
  );
}

function LevelLineChart({ analysis }: { analysis: NeltGrowthAnalysis }) {
  const points = analysis.trendPoints;
  const w = 520;
  const h = 200;
  const pad = { t: 16, r: 16, b: 36, l: 36 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const maxOrder = 13;
  const n = points.length;

  function xAt(i: number) {
    if (n === 1) return pad.l + innerW / 2;
    return pad.l + (i / (n - 1)) * innerW;
  }
  function yAt(order: number | null) {
    const v = Math.max(0, Math.min(maxOrder, order ?? 0));
    return pad.t + innerH - (v / maxOrder) * innerH;
  }

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="h-auto w-full max-w-full">
      {[0, 0.25, 0.5, 0.75, 1].map((t) => {
        const y = pad.t + innerH * (1 - t);
        return (
          <line
            key={t}
            x1={pad.l}
            x2={w - pad.r}
            y1={y}
            y2={y}
            stroke="#edf0f5"
            strokeWidth={1}
          />
        );
      })}
      {(Object.keys(DOMAIN_LABEL) as NeltDomain[]).map((domain) => {
        const path = points
          .map((p, i) => {
            const x = xAt(i);
            const y = yAt(p.domains[domain].levelOrder);
            return `${i === 0 ? "M" : "L"}${x},${y}`;
          })
          .join(" ");
        return (
          <g key={domain}>
            <path
              d={path}
              fill="none"
              stroke={DOMAIN_COLORS[domain]}
              strokeWidth={2.5}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {points.map((p, i) => (
              <circle
                key={`${domain}-${p.attemptNumber}`}
                cx={xAt(i)}
                cy={yAt(p.domains[domain].levelOrder)}
                r={4}
                fill={DOMAIN_COLORS[domain]}
              >
                <title>
                  {p.label} · {DOMAIN_LABEL[domain]}:{" "}
                  {p.domains[domain].level ?? "—"}
                  {p.domains[domain].difficulty
                    ? ` (${p.domains[domain].difficulty})`
                    : ""}
                </title>
              </circle>
            ))}
          </g>
        );
      })}
      {points.map((p, i) => (
        <text
          key={p.attemptNumber}
          x={xAt(i)}
          y={h - 12}
          textAnchor="middle"
          fontSize={11}
          fontWeight={700}
          fill="#68748a"
        >
          {p.label}
        </text>
      ))}
      {points.map((p, i) =>
        p.testDate ? (
          <text
            key={`d-${p.attemptNumber}`}
            x={xAt(i)}
            y={h - 2}
            textAnchor="middle"
            fontSize={9}
            fill="#98a2b3"
          >
            {p.testDate.slice(5).replace("-", ".")}
          </text>
        ) : null
      )}
    </svg>
  );
}
