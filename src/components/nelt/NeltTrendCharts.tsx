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

/**
 * 성장이 크게 보이도록 세로축을 데이터 구간에 타이트하게 맞춤.
 * 시작은 아래쪽, 끝은 위쪽에 가깝게 그려 상승폭을 과장한다.
 */
export function computeDramaticYRange(
  values: number[],
  opts?: { absMin?: number; absMax?: number }
): { yMin: number; yMax: number } {
  const nums = values.filter((v) => Number.isFinite(v));
  if (nums.length === 0) return { yMin: 0, yMax: 1 };
  const dataMin = Math.min(...nums);
  const dataMax = Math.max(...nums);
  let span = dataMax - dataMin;
  // 변화가 작아도 최소 폭을 확보해 선이 거의 수평으로 안 보이게
  if (span < 1.2) span = 1.2;
  // 아래 여백을 크게 → 1차 점이 낮게, 위는 짧게 → 마지막이 높게
  let yMin = dataMin - span * 1.35;
  let yMax = dataMax + span * 0.2;
  if (opts?.absMin != null) yMin = Math.max(opts.absMin, yMin);
  if (opts?.absMax != null) yMax = Math.min(opts.absMax, yMax);
  if (yMax <= yMin) yMax = yMin + 1;
  return { yMin, yMax };
}

function shortLevelLabel(
  level: string | null | undefined,
  difficulty?: string | null
): string {
  if (!level) return "";
  const s = level
    .replace("초등학교 ", "초")
    .replace("중학교 ", "중")
    .replace("고등학교 ", "고")
    .replace("학년", "");
  return difficulty && !s.includes("(") ? `${s} (${difficulty})` : s;
}

function collectLevelOrders(analysis: NeltGrowthAnalysis): number[] {
  const out: number[] = [];
  for (const p of analysis.trendPoints ?? []) {
    for (const d of Object.keys(DOMAIN_LABEL) as NeltDomain[]) {
      const v = p.domains[d]?.levelOrder;
      if (v != null && Number.isFinite(v)) out.push(v);
    }
  }
  return out;
}

/** 전체 영역 수준 선그래프 + 회차 간 타임라인 */
export function NeltTrendCharts({ analysis }: { analysis: NeltGrowthAnalysis }) {
  const points = analysis.trendPoints ?? [];
  if (points.length < 2) return null;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#dce3ed] p-4">
        <p className="mb-3 mt-0 text-xs text-[#68748a]">
          어휘·문법·듣기·독해의{" "}
          <strong className="font-bold text-[#244a78]">학년 수준</strong>을
          같은 세로축으로 그렸습니다. 아래 영역별 그래프와 동일한 기준입니다.
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

  const allValues = series.flatMap((s) => s.values);
  const { yMin, yMax } = computeDramaticYRange(allValues, {
    absMin: 0,
    absMax: section.chart.kind === "level" ? 13 : undefined,
  });
  const ySpan = yMax - yMin || 1;

  const w = 420;
  const h = 210;
  const pad = { t: 34, r: 14, b: 34, l: 40 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const n = labels.length;
  const lineColor =
    section.chart.color ?? DOMAIN_COLORS[section.domain] ?? "#244a78";

  function xAt(i: number) {
    if (n === 1) return pad.l + innerW / 2;
    return pad.l + (i / (n - 1)) * innerW;
  }
  function yAt(v: number) {
    const clamped = Math.max(yMin, Math.min(yMax, v));
    return pad.t + innerH - ((clamped - yMin) / ySpan) * innerH;
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
        {series.map((s) => {
          const path = s.values
            .map((v, i) => `${i === 0 ? "M" : "L"}${xAt(i)},${yAt(v)}`)
            .join(" ");
          return (
            <g key={s.name}>
              <path
                d={path}
                fill="none"
                stroke={lineColor}
                strokeWidth={3}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
              {s.values.map((v, i) => (
                <g key={`${s.name}-${i}`}>
                  <text
                    x={xAt(i)}
                    y={yAt(v) - 12}
                    textAnchor="middle"
                    fontSize={13}
                    fontWeight={800}
                    fill={lineColor}
                  >
                    {s.display[i]}
                  </text>
                  <circle
                    cx={xAt(i)}
                    cy={yAt(v)}
                    r={5}
                    fill={lineColor}
                    stroke="#fff"
                    strokeWidth={2}
                  >
                    <title>
                      {labels[i]} · {s.name}: {s.display[i]}
                    </title>
                  </circle>
                </g>
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
        {series.map((s) => (
          <span key={s.name} className="inline-flex items-center gap-1.5">
            <i
              className="inline-block h-2 w-2 rounded-full"
              style={{ background: lineColor }}
            />
            {s.name}
            <span className="text-[#98a2b3]">(전체 그래프와 동일 기준)</span>
          </span>
        ))}
      </div>
    </div>
  );
}

function LevelLineChart({ analysis }: { analysis: NeltGrowthAnalysis }) {
  const points = analysis.trendPoints;
  const w = 520;
  const h = 232;
  const pad = { t: 30, r: 16, b: 40, l: 40 };
  const innerW = w - pad.l - pad.r;
  const innerH = h - pad.t - pad.b;
  const n = points.length;
  const { yMin, yMax } = computeDramaticYRange(collectLevelOrders(analysis), {
    absMin: 0,
    absMax: 13,
  });
  const ySpan = yMax - yMin || 1;

  function xAt(i: number) {
    if (n === 1) return pad.l + innerW / 2;
    return pad.l + (i / (n - 1)) * innerW;
  }
  function yAt(order: number | null) {
    const v = order ?? yMin;
    const clamped = Math.max(yMin, Math.min(yMax, v));
    return pad.t + innerH - ((clamped - yMin) / ySpan) * innerH;
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
              strokeWidth={2.8}
              strokeLinejoin="round"
              strokeLinecap="round"
            />
            {points.map((p, i) => (
              <g key={`${domain}-${p.attemptNumber}`}>
                <text
                  x={xAt(i)}
                  y={yAt(p.domains[domain].levelOrder) - 11}
                  textAnchor="middle"
                  fontSize={12}
                  fontWeight={800}
                  fill={DOMAIN_COLORS[domain]}
                >
                  {shortLevelLabel(
                    p.domains[domain].level,
                    p.domains[domain].difficulty
                  )}
                </text>
                <circle
                  cx={xAt(i)}
                  cy={yAt(p.domains[domain].levelOrder)}
                  r={5}
                  fill={DOMAIN_COLORS[domain]}
                  stroke="#fff"
                  strokeWidth={2}
                >
                  <title>
                    {p.label} · {DOMAIN_LABEL[domain]}:{" "}
                    {p.domains[domain].level ?? "—"}
                    {p.domains[domain].difficulty
                      ? ` (${p.domains[domain].difficulty})`
                      : ""}
                  </title>
                </circle>
              </g>
            ))}
          </g>
        );
      })}
      {points.map((p, i) => (
        <text
          key={p.attemptNumber}
          x={xAt(i)}
          y={h - 14}
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
