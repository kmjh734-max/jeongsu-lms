"use client";

import { DOMAIN_LABEL } from "@/lib/nelt/compare/build-growth";
import type { NeltGrowthAnalysis } from "@/lib/nelt/compare/types";
import type { NeltDomain } from "@/types/nelt";

const DOMAIN_COLORS: Record<NeltDomain, string> = {
  vocabulary: "#f28c28",
  grammar: "#244a78",
  listening: "#168f62",
  reading: "#7c3aed",
};

/** 1·2·3차 판정 수준 / 어휘량 추이 (SVG, 의존성 없음) */
export function NeltTrendCharts({ analysis }: { analysis: NeltGrowthAnalysis }) {
  const points = analysis.trendPoints ?? [];
  if (points.length < 2) return null;

  return (
    <div className="space-y-4">
      <section className="rounded-2xl border border-[#dce3ed] p-4">
        <h4 className="m-0 text-base font-bold text-[#172033]">
          회차별 영역 수준 추이
        </h4>
        <p className="mb-3 mt-1 text-xs text-[#68748a]">
          1차 → {points.length}차까지 판정 수준(정규화)이 어떻게 변했는지
          보여 줍니다.
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

      <div className="grid gap-4 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#dce3ed] p-4">
          <h4 className="m-0 text-base font-bold text-[#172033]">
            어휘량 회차 추이
          </h4>
          <p className="mb-3 mt-1 text-xs text-[#68748a]">
            Vocabulary Size가 회차마다 어떻게 늘었는지 확인합니다.
          </p>
          <VocabTrendBars analysis={analysis} />
        </section>

        {(analysis.attemptSteps?.length ?? 0) > 0 && (
          <section className="rounded-2xl border border-[#dce3ed] p-4">
            <h4 className="m-0 text-base font-bold text-[#172033]">
              회차 간 변화 요약
            </h4>
            <p className="mb-3 mt-1 text-xs text-[#68748a]">
              바로 이전 회차와 비교한 성장입니다.
            </p>
            <ol className="space-y-3">
              {(analysis.attemptSteps ?? []).map((step) => (
                <li
                  key={`${step.fromAttempt}-${step.toAttempt}`}
                  className="rounded-xl bg-[#f8fbff] px-3 py-2.5"
                >
                  <p className="text-sm font-bold text-[#152d4f]">
                    {step.fromAttempt}차 → {step.toAttempt}차
                    {step.fromDate || step.toDate
                      ? ` · ${(step.fromDate ?? "").replaceAll("-", ".")} → ${(
                          step.toDate ?? ""
                        ).replaceAll("-", ".")}`
                      : ""}
                  </p>
                  <p className="mt-1 text-sm text-[#172033]">{step.summary}</p>
                  <ul className="mt-2 space-y-0.5 text-xs text-[#68748a]">
                    {step.domainLines
                      .filter(
                        (d) =>
                          d.status === "major_growth" ||
                          d.status === "growth" ||
                          d.status === "advanced_challenge"
                      )
                      .slice(0, 3)
                      .map((d) => (
                        <li key={d.domain}>· {d.line}</li>
                      ))}
                  </ul>
                </li>
              ))}
            </ol>
          </section>
        )}
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
              />
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
          {p.testDate ? `\n` : ""}
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

function VocabTrendBars({ analysis }: { analysis: NeltGrowthAnalysis }) {
  const sizes = analysis.trendPoints.map((p) => p.vocabularySize ?? 0);
  const max = Math.max(1, ...sizes);
  return (
    <div className="flex h-[200px] items-end justify-center gap-4 border-b border-[#dce3ed] px-2 pt-2">
      {analysis.trendPoints.map((p, i) => {
        const size = p.vocabularySize ?? 0;
        const h = Math.max(12, (size / max) * 150);
        const isLast = i === analysis.trendPoints.length - 1;
        const prev = i > 0 ? sizes[i - 1] : null;
        const delta = prev != null && size > 0 ? size - prev : null;
        return (
          <div
            key={p.attemptNumber}
            className="flex h-full flex-1 flex-col justify-end text-center"
          >
            <div className="mb-1 text-xs font-black text-[#152d4f]">
              {size ? size.toLocaleString() : "—"}
            </div>
            {delta != null && delta > 0 && (
              <div className="mb-0.5 text-[10px] font-bold text-[#168f62]">
                +{delta.toLocaleString()}
              </div>
            )}
            <div
              className={`mx-auto w-[70%] max-w-[72px] rounded-t-xl ${
                isLast
                  ? "bg-gradient-to-b from-[#ffad52] to-[#f28c28]"
                  : "bg-[#bdc8d8]"
              }`}
              style={{ height: h }}
            />
            <div className="mt-1.5 text-xs font-extrabold">{p.label}</div>
          </div>
        );
      })}
    </div>
  );
}
