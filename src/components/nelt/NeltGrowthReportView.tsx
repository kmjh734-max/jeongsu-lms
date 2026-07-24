"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { NeltShareActions } from "@/components/nelt/NeltShareActions";
import { NeltTrendCharts } from "@/components/nelt/NeltTrendCharts";
import { DOMAIN_LABEL } from "@/lib/nelt/compare/build-growth";
import type { NeltGrowthAnalysis } from "@/lib/nelt/compare/types";
import type { NeltDomain } from "@/types/nelt";

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

function domainOf(analysis: NeltGrowthAnalysis, domain: NeltDomain, which: "start" | "end") {
  const attempt = which === "start" ? analysis.start : analysis.end;
  return attempt.domains.find((d) => d.domain === domain) ?? null;
}

export function NeltGrowthReportView({
  analysis,
  parentView = false,
}: NeltGrowthReportViewProps) {
  const [copyMsg, setCopyMsg] = useState<string | null>(null);

  const period = useMemo(() => {
    return `${formatDateDots(analysis.start.testDate)} — ${formatDateDots(
      analysis.end.testDate
    )}`;
  }, [analysis]);

  const summaryHtml = useMemo(() => {
    const name = analysis.studentName;
    const n = analysis.attemptCount;
    const bits: string[] = [];
    if (
      (analysis.end.overallLevelOrder ?? 0) >
      (analysis.start.overallLevelOrder ?? 0)
    ) {
      bits.push(
        `종합 레벨이 <strong>${analysis.start.overallLevel ?? "—"}에서 ${
          analysis.end.overallLevel ?? "—"
        }로 상승</strong>했습니다`
      );
    }
    const vd = analysis.vocabularyGrowth.sizeDelta;
    if (vd != null && vd > 0) {
      bits.push(
        `어휘량이 <strong>약 ${vd.toLocaleString()}단어 증가</strong>했습니다`
      );
    }
    const reading = analysis.domainGrowth.find((d) => d.domain === "reading");
    if (reading && (reading.levelDelta ?? 0) > 0) {
      bits.push(
        `독해 판정 수준이 <strong>${reading.beforeLevel ?? "—"}에서 ${
          reading.afterLevel ?? "—"
        }로 향상</strong>되었습니다`
      );
    }
    if (n >= 3 && (analysis.attemptSteps?.length ?? 0) > 0) {
      bits.push(
        `<strong>1→${n}차</strong>로 이어지며 ${analysis.attemptSteps
          .map((s) => `${s.fromAttempt}→${s.toAttempt}차`)
          .join(", ")} 구간에서 변화가 확인됩니다`
      );
    }
    const head =
      bits.length > 0
        ? `${name} 학생은 NELT ${n}회차 평가에서 ${bits.join(", ")}. `
        : `${name} 학생의 NELT ${n}회차 결과를 비교했습니다. `;
    return (
      head +
      "서로 다른 난이도의 원점수는 단순 비교하지 않고, 판정 수준·난이도 코드·절대 개수의 변화를 중심으로 해석했습니다."
    );
  }, [analysis]);

  const maxLevelOrder = 12;

  async function copyParent() {
    try {
      await navigator.clipboard.writeText(analysis.parentCopy);
      setCopyMsg("학부모용 문구를 복사했습니다.");
      window.setTimeout(() => setCopyMsg(null), 2500);
    } catch {
      setCopyMsg("복사에 실패했습니다.");
    }
  }

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
          <Button
            type="button"
            variant="primary"
            size="sm"
            onClick={() => void copyParent()}
          >
            학부모 문구 복사
          </Button>
          {copyMsg && (
            <span className="self-center text-xs text-emerald-700">
              {copyMsg}
            </span>
          )}
        </div>
      )}

      {!parentView && (
        <NeltShareActions
          studentName={analysis.studentName}
          analysis={analysis}
        />
      )}

      <article className="overflow-hidden rounded-[22px] border border-[#dce3ed] bg-white shadow-[0_14px_38px_rgba(21,45,79,0.10)]">
        {/* Cover */}
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
                두 차례의 결과를 바탕으로 성장한 지점과 다음 학습 방향을
                분석했습니다.
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
          {/* Summary */}
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

          {/* Multi-attempt trends */}
          <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold text-[#172033]">
            <span className="inline-block h-5 w-1.5 rounded-lg bg-[#f28c28]" />
            {analysis.attemptCount >= 3
              ? `1차 → ${analysis.attemptCount}차 성장 추이`
              : "회차별 성장 추이"}
          </h3>
          <div className="mb-7">
            <NeltTrendCharts analysis={analysis} />
          </div>

          {/* Growth cards */}
          <div className="mb-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {analysis.highlights.map((h) => (
              <article
                key={h.key}
                className="relative min-h-[135px] overflow-hidden rounded-2xl border border-[#dce3ed] p-4"
              >
                <div className="absolute -right-6 -top-7 h-20 w-20 rounded-full bg-[#fff3e5]" />
                <div className="relative">
                  <div className="text-xs font-extrabold text-[#68748a]">
                    {h.title}
                  </div>
                  <div className="mt-2 text-2xl font-black tracking-tight text-[#152d4f]">
                    {h.beforeLabel} → {h.afterLabel}
                  </div>
                  {h.deltaLabel && (
                    <div className="mt-2 text-[13px] font-extrabold text-[#168f62]">
                      {h.deltaLabel}
                    </div>
                  )}
                  <div className="mt-1 text-xs text-[#68748a]">
                    {h.status === "advanced_challenge"
                      ? "상위 난이도 진입"
                      : h.status === "major_growth"
                        ? "크게 성장"
                        : "성장"}
                  </div>
                </div>
              </article>
            ))}
            {analysis.highlights.length === 0 && (
              <p className="text-sm text-slate-500 sm:col-span-3">
                강조할 성장 지표가 아직 충분하지 않습니다.
              </p>
            )}
          </div>

          {/* Charts */}
          <div className="mb-7 grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
            <section className="rounded-2xl border border-[#dce3ed] p-4">
              <h4 className="m-0 text-base font-bold text-[#172033]">
                영역별 판정 수준 변화
              </h4>
              <p className="mb-4 mt-1 text-xs text-[#68748a]">
                점수보다 시험 난이도와 판정 수준을 우선하여 비교합니다.
              </p>
              <div className="space-y-3.5">
                {(
                  ["vocabulary", "grammar", "listening", "reading"] as const
                ).map((domain) => {
                  const a = domainOf(analysis, domain, "start");
                  const b = domainOf(analysis, domain, "end");
                  const o1 = a?.evaluatedLevelOrder ?? 0;
                  const o2 = b?.evaluatedLevelOrder ?? 0;
                  const w1 = Math.max(3, (o1 / maxLevelOrder) * 100);
                  const w2 = Math.max(3, (o2 / maxLevelOrder) * 100);
                  return (
                    <div key={domain}>
                      <div className="mb-1.5 flex justify-between text-xs font-bold">
                        <span>{DOMAIN_LABEL[domain]}</span>
                        <span>
                          {a?.evaluatedLevel ?? "—"} →{" "}
                          {b?.evaluatedLevel ?? "—"}
                        </span>
                      </div>
                      <div className="relative h-3 overflow-hidden rounded-full bg-[#edf0f5]">
                        <div
                          className="absolute left-0 top-0 h-full rounded-full bg-[#b8c4d7]"
                          style={{ width: `${w1}%` }}
                        />
                        <div
                          className="absolute left-0 top-[3px] h-1.5 rounded-full bg-gradient-to-r from-[#f28c28] to-[#ffad52] opacity-90"
                          style={{ width: `${w2}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="mt-3 flex gap-4 text-[11px] text-[#68748a]">
                <span>
                  <i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#b8c4d7]" />
                  1차
                </span>
                <span>
                  <i className="mr-1 inline-block h-2 w-2 rounded-full bg-[#f28c28]" />
                  2차
                </span>
              </div>
            </section>

            <section className="rounded-2xl border border-[#dce3ed] p-4">
              <h4 className="m-0 text-base font-bold text-[#172033]">
                어휘량 성장
              </h4>
              <p className="mb-4 mt-1 text-xs text-[#68748a]">
                Vocabulary Size의 실제 증가 개수를 강조합니다.
              </p>
              <VocabBars analysis={analysis} />
            </section>
          </div>

          {/* Compare table */}
          <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold text-[#172033]">
            <span className="inline-block h-5 w-1.5 rounded-lg bg-[#f28c28]" />
            회차별 영역 비교
          </h3>
          <section className="mb-7 overflow-x-auto rounded-2xl border border-[#dce3ed] p-2 sm:p-4">
            <table className="w-full border-collapse text-[13px]">
              <thead>
                <tr className="text-left text-[11px] text-[#68748a]">
                  <th className="border-b border-[#dce3ed] px-2 py-2">영역</th>
                  <th className="border-b border-[#dce3ed] px-2 py-2">1차</th>
                  <th className="border-b border-[#dce3ed] px-2 py-2">2차</th>
                  <th className="border-b border-[#dce3ed] px-2 py-2">
                    성장 해석
                  </th>
                </tr>
              </thead>
              <tbody>
                {analysis.domainGrowth.map((d) => {
                  const pill =
                    d.scoreComparable && (d.scoreDelta ?? 0) > 0
                      ? "up"
                      : d.difficultyUp || (d.levelDelta ?? 0) > 0
                        ? "challenge"
                        : "neutral";
                  const pillText =
                    d.scoreComparable && (d.scoreDelta ?? 0) > 0
                      ? "점수 향상"
                      : d.difficultyUp && (d.levelDelta ?? 0) > 0
                        ? "수준 성장"
                        : d.difficultyUp
                          ? "상위 도전"
                          : (d.levelDelta ?? 0) > 0
                            ? "수준 향상"
                            : "다음 목표";
                  return (
                    <tr key={d.domain} className="border-b border-[#edf0f4] last:border-0">
                      <td className="px-2 py-3 font-bold">{d.label}</td>
                      <td className="px-2 py-3">
                        {d.beforeDifficulty ?? "—"} · {d.beforeScore ?? "—"}점
                        <br />
                        <small className="text-[#68748a]">
                          {d.beforeLevel ?? "—"}
                        </small>
                      </td>
                      <td className="px-2 py-3">
                        {d.afterDifficulty ?? "—"} · {d.afterScore ?? "—"}점
                        <br />
                        <small className="text-[#68748a]">
                          {d.afterLevel ?? "—"}
                        </small>
                      </td>
                      <td className="px-2 py-3">
                        <span
                          className={
                            pill === "up"
                              ? "inline-block rounded-full bg-[#eaf8f2] px-2 py-1 text-[11px] font-extrabold text-[#168f62]"
                              : pill === "challenge"
                                ? "inline-block rounded-full bg-[#edf4ff] px-2 py-1 text-[11px] font-extrabold text-[#244a78]"
                                : "inline-block rounded-full bg-[#f0f2f6] px-2 py-1 text-[11px] font-extrabold text-[#647086]"
                          }
                        >
                          {pillText}
                        </span>
                        <br />
                        <small className="text-[#68748a]">{d.narrative}</small>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </section>

          {/* Narratives */}
          <div className="mb-7 grid gap-3.5 md:grid-cols-2">
            <section className="rounded-2xl border border-[#cbeadc] bg-[#eaf8f2] p-4">
              <h4 className="m-0 mb-2 font-bold text-[#152d4f]">
                가장 크게 향상된 부분
              </h4>
              <p className="m-0 text-sm leading-relaxed text-[#172033]">
                {analysis.strengthsNarrative}
              </p>
            </section>
            <section className="rounded-2xl border border-[#f3dcc0] bg-[#fff8ef] p-4">
              <h4 className="m-0 mb-2 font-bold text-[#152d4f]">
                다음 성장 목표 및 지도 계획
              </h4>
              <p className="m-0 text-sm leading-relaxed text-[#172033]">
                {analysis.nextGoalsNarrative}
              </p>
            </section>
          </div>

          {/* NELT summaries from source */}
          <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold text-[#172033]">
            <span className="inline-block h-5 w-1.5 rounded-lg bg-[#f28c28]" />
            NELT 역량 총평 (최근 회차)
          </h3>
          <div className="mb-7 space-y-3">
            {analysis.domainGrowth
              .filter((d) => d.afterSummary)
              .map((d) => (
                <div
                  key={d.domain}
                  className="rounded-2xl border border-[#dce3ed] bg-[#fbfcfe] p-4"
                >
                  <p className="text-xs font-extrabold text-[#68748a]">
                    {d.label}
                  </p>
                  <p className="mt-1 text-sm leading-relaxed text-[#172033]">
                    {d.afterSummary}
                  </p>
                </div>
              ))}
          </div>

          {/* Grammar / subskills extras */}
          {(analysis.newlyCorrectGrammar.length > 0 ||
            analysis.subskillGrowth.length > 0) && (
            <>
              <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold text-[#172033]">
                <span className="inline-block h-5 w-1.5 rounded-lg bg-[#f28c28]" />
                세부 성장 지표
              </h3>
              <div className="mb-7 grid gap-3 md:grid-cols-2">
                {analysis.newlyCorrectGrammar.length > 0 && (
                  <div className="rounded-2xl border border-[#dce3ed] p-4">
                    <p className="text-sm font-bold text-[#152d4f]">
                      새롭게 확인한 문법
                    </p>
                    <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
                      {analysis.newlyCorrectGrammar.slice(0, 8).map((g) => (
                        <li key={g.detail}>
                          {g.category ? `${g.category}: ` : ""}
                          {g.detail}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
                {analysis.subskillGrowth.length > 0 && (
                  <div className="rounded-2xl border border-[#dce3ed] p-4">
                    <p className="text-sm font-bold text-[#152d4f]">
                      상승한 세부 역량
                    </p>
                    <ul className="mt-2 space-y-1 text-sm text-slate-700">
                      {analysis.subskillGrowth.map((s) => (
                        <li key={`${s.domain}-${s.name}`}>
                          {s.name}: {s.beforeAccuracy}% → {s.afterAccuracy}% (+
                          {s.delta}%p)
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Source links */}
          <h3 className="mb-3.5 flex items-center gap-2 text-lg font-bold text-[#172033]">
            <span className="inline-block h-5 w-1.5 rounded-lg bg-[#f28c28]" />
            원본 결과 링크
          </h3>
          <div className="flex flex-wrap gap-2.5">
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
              ) : null
            )}
          </div>

          <p className="mt-5 text-center text-[11px] text-[#68748a]">
            상위 비율은 이전보다 향상된 경우에만 성장 카드와 요약 문구에
            표시합니다. 서로 다른 난이도의 원점수는 단순 증감으로 판단하지
            않습니다.
          </p>

          {/* Parent copy (print-hidden detail) */}
          <details className="print:hidden mt-6 rounded-2xl border border-[#dce3ed] p-4">
            <summary className="cursor-pointer text-sm font-bold text-[#152d4f]">
              학부모 전달용 문구 전문
            </summary>
            <pre className="mt-3 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">
              {analysis.parentCopy}
            </pre>
          </details>
        </div>
      </article>
    </div>
  );
}

function VocabBars({ analysis }: { analysis: NeltGrowthAnalysis }) {
  const sizes = analysis.attempts.map(
    (a) => a.vocabulary?.vocabularySize ?? 0
  );
  const max = Math.max(1, ...sizes);
  return (
    <div className="flex h-[210px] items-end justify-center gap-8 border-b border-[#dce3ed] px-4 pt-4">
      {analysis.attempts.map((a, i) => {
        const size = a.vocabulary?.vocabularySize ?? 0;
        const h = Math.max(12, (size / max) * 160);
        const isLast = i === analysis.attempts.length - 1;
        return (
          <div
            key={a.id}
            className="flex h-full flex-1 flex-col justify-end text-center"
          >
            <div className="mb-1.5 font-black text-[#152d4f]">
              {size ? `${size.toLocaleString()}단어` : "—"}
            </div>
            <div
              className={`mx-auto w-[72%] max-w-[90px] rounded-t-xl ${
                isLast
                  ? "bg-gradient-to-b from-[#ffad52] to-[#f28c28]"
                  : "bg-[#bdc8d8]"
              }`}
              style={{ height: h, minHeight: 12 }}
            />
            <div className="mt-2 text-xs font-extrabold">
              {a.attemptNumber}차
            </div>
          </div>
        );
      })}
    </div>
  );
}
