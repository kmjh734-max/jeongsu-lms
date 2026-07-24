"use client";

import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DOMAIN_LABEL } from "@/lib/nelt/compare/build-growth";
import type { NeltGrowthAnalysis } from "@/lib/nelt/compare/types";
import type { NeltGrowthStatus } from "@/types/nelt";

type Analysis = NeltGrowthAnalysis;

function statusTone(status: NeltGrowthStatus): string {
  switch (status) {
    case "major_growth":
      return "bg-emerald-100 text-emerald-900 border-emerald-200";
    case "growth":
      return "bg-teal-50 text-teal-900 border-teal-200";
    case "advanced_challenge":
      return "bg-sky-50 text-sky-900 border-sky-200";
    case "maintained":
      return "bg-slate-50 text-slate-700 border-slate-200";
    case "focus_needed":
      return "bg-amber-50 text-amber-900 border-amber-200";
  }
}

function statusText(status: NeltGrowthStatus): string {
  switch (status) {
    case "major_growth":
      return "크게 성장";
    case "growth":
      return "꾸준한 성장";
    case "advanced_challenge":
      return "상위 레벨 진입";
    case "maintained":
      return "안정 유지";
    case "focus_needed":
      return "다음 성장 목표";
  }
}

function LevelBars({ analysis }: { analysis: Analysis }) {
  const maxOrder = Math.max(
    13,
    ...analysis.attempts.flatMap((a) =>
      a.domains.map((d) => d.evaluatedLevelOrder ?? 0)
    )
  );

  return (
    <div className="space-y-4">
      {(Object.keys(DOMAIN_LABEL) as Array<keyof typeof DOMAIN_LABEL>).map(
        (domain) => (
          <div key={domain}>
            <p className="mb-2 text-sm font-semibold text-slate-800">
              {DOMAIN_LABEL[domain]}
            </p>
            <div className="flex flex-wrap items-end gap-3">
              {analysis.attempts.map((a) => {
                const d = a.domains.find((x) => x.domain === domain);
                const order = d?.evaluatedLevelOrder ?? 0;
                const h = Math.max(8, Math.round((order / maxOrder) * 96));
                return (
                  <div key={a.id} className="w-16 text-center">
                    <div className="flex h-24 items-end justify-center">
                      <div
                        className="w-8 rounded-t-md bg-emerald-500/80"
                        style={{ height: h }}
                        title={d?.evaluatedLevel ?? ""}
                      />
                    </div>
                    <p className="mt-1 text-[11px] font-medium text-slate-700">
                      {a.attemptNumber}차
                    </p>
                    <p className="text-[10px] leading-tight text-slate-500">
                      {d?.evaluatedLevel?.replace("초등학교 ", "초") ?? "—"}
                    </p>
                    <p className="text-[10px] text-slate-400">
                      {d?.difficultyCode ?? ""}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )
      )}
    </div>
  );
}

function VocabBars({ analysis }: { analysis: Analysis }) {
  const sizes = analysis.attempts.map(
    (a) => a.vocabulary?.vocabularySize ?? 0
  );
  const max = Math.max(1, ...sizes);
  return (
    <div className="flex flex-wrap items-end gap-4">
      {analysis.attempts.map((a, i) => {
        const size = a.vocabulary?.vocabularySize ?? 0;
        const h = Math.max(8, Math.round((size / max) * 120));
        return (
          <div key={a.id} className="w-20 text-center">
            <div className="flex h-32 items-end justify-center">
              <div
                className="w-10 rounded-t-md bg-indigo-500/80"
                style={{ height: h }}
              />
            </div>
            <p className="mt-1 text-xs font-semibold text-slate-800">
              {a.attemptNumber}차
            </p>
            <p className="text-xs text-slate-600">
              {size ? `약 ${size}` : "—"}
            </p>
            {i > 0 && sizes[i] > sizes[i - 1] && (
              <p className="text-[10px] text-emerald-700">
                +{sizes[i] - sizes[i - 1]}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}

interface NeltGrowthReportViewProps {
  analysis: NeltGrowthAnalysis;
  role: "admin" | "teacher";
}

export function NeltGrowthReportView({
  analysis,
  role: _role,
}: NeltGrowthReportViewProps) {
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const period = useMemo(() => {
    const dates = analysis.attempts
      .map((a) => a.testDate)
      .filter(Boolean) as string[];
    if (dates.length === 0) return `${analysis.attemptCount}회차`;
    return `${dates[0]} ~ ${dates[dates.length - 1]} · ${analysis.attemptCount}회차`;
  }, [analysis]);

  async function copyParent() {
    try {
      await navigator.clipboard.writeText(analysis.parentCopy);
      setCopyMsg("학부모용 문구를 복사했습니다.");
      window.setTimeout(() => setCopyMsg(null), 2500);
    } catch {
      setCopyMsg("복사에 실패했습니다. 아래 문구를 직접 선택해 주세요.");
    }
  }

  return (
    <div className="space-y-8">
      {/* 1. 학생·시험 정보 */}
      <Card className="space-y-2 p-5 sm:p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-emerald-700">
          NELT 영어 성장 리포트
        </p>
        <h2 className="text-xl font-bold text-slate-900">
          {analysis.studentName}
          {analysis.end.studentGradeRaw
            ? ` · ${analysis.end.studentGradeRaw}`
            : ""}
        </h2>
        <p className="text-sm text-slate-600">평가 기간 {period}</p>
        <p className="text-sm text-slate-600">
          종합 {analysis.start.overallLevel ?? analysis.start.overallBand ?? "—"}{" "}
          → {analysis.end.overallLevel ?? analysis.end.overallBand ?? "—"}
          {analysis.end.overallBand
            ? ` (${analysis.end.overallBand} 수준)`
            : ""}
        </p>
      </Card>

      {/* 2. 핵심 성장 요약 */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">핵심 성장 요약</h3>
        <Card className="space-y-3 border-emerald-100 bg-emerald-50/40 p-5">
          <p className="text-sm leading-relaxed text-slate-800">
            {analysis.overallNarrative}
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            {analysis.strengthsNarrative}
          </p>
          <p className="text-sm leading-relaxed text-slate-700">
            {analysis.stableNarrative}
          </p>
        </Card>
      </section>

      {/* 3. 대표 성장 카드 */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">대표 성장</h3>
        {analysis.highlights.length === 0 ? (
          <Alert variant="info">
            아직 강조할 성장 지표가 충분하지 않습니다. 회차를 더 등록해 주세요.
          </Alert>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {analysis.highlights.map((h) => (
              <div
                key={h.key}
                className={`rounded-xl border p-4 ${statusTone(h.status)}`}
              >
                <p className="text-xs font-semibold opacity-80">
                  {statusText(h.status)}
                </p>
                <p className="mt-1 text-sm font-bold">{h.title}</p>
                <p className="mt-2 text-sm">
                  {h.beforeLabel} → {h.afterLabel}
                </p>
                {h.deltaLabel && (
                  <p className="mt-1 text-xs font-medium opacity-90">
                    {h.deltaLabel}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. 영역별 수준 변화 */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">영역별 수준 변화</h3>
        <Card className="p-5">
          <LevelBars analysis={analysis} />
          <p className="mt-4 text-xs text-slate-500">
            막대는 판정 수준(정규화) 기준입니다. 난이도 코드는 막대 아래에
            표시됩니다.
          </p>
        </Card>
      </section>

      {/* 5. 어휘 성장 */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">어휘 성장</h3>
        <Card className="space-y-4 p-5">
          <VocabBars analysis={analysis} />
          <ul className="space-y-1 text-sm text-slate-700">
            {analysis.vocabularyGrowth.sizeDelta != null &&
              analysis.vocabularyGrowth.sizeDelta > 0 && (
                <li>
                  어휘량 약 {analysis.vocabularyGrowth.beforeSize} → 약{" "}
                  {analysis.vocabularyGrowth.afterSize}단어 (약{" "}
                  {analysis.vocabularyGrowth.sizeDelta}단어 증가
                  {analysis.vocabularyGrowth.sizeMultiplier != null &&
                  analysis.vocabularyGrowth.sizeMultiplier >= 2
                    ? ` · 약 ${
                        Math.round(
                          analysis.vocabularyGrowth.sizeMultiplier * 10
                        ) / 10
                      }배`
                    : ""}
                  )
                </li>
              )}
            {analysis.vocabularyGrowth.requiredPctDelta != null && (
              <li>
                초등 필수 어휘 이해도{" "}
                {analysis.vocabularyGrowth.beforeRequiredPct}% →{" "}
                {analysis.vocabularyGrowth.afterRequiredPct}%
                {analysis.vocabularyGrowth.requiredCountDelta != null &&
                  analysis.vocabularyGrowth.requiredCountDelta > 0 &&
                  ` (약 ${analysis.vocabularyGrowth.beforeRequiredCount}개 → 약 ${analysis.vocabularyGrowth.afterRequiredCount}개)`}
              </li>
            )}
            {analysis.vocabularyGrowth.csatPctDelta != null &&
              analysis.vocabularyGrowth.csatPctDelta > 0 && (
                <li>
                  수능 기출 어휘 이해도{" "}
                  {analysis.vocabularyGrowth.beforeCsatPct}% →{" "}
                  {analysis.vocabularyGrowth.afterCsatPct}%
                </li>
              )}
          </ul>
        </Card>
      </section>

      {/* 6. 영역별 성장 분석 + NELT 총평 */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">영역별 성장 분석</h3>
        <div className="space-y-4">
          {analysis.domainGrowth.map((d) => (
            <Card key={d.domain} className="space-y-3 p-5">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h4 className="text-base font-bold text-slate-900">{d.label}</h4>
                <span
                  className={`rounded-full border px-2.5 py-0.5 text-xs font-medium ${statusTone(
                    d.status
                  )}`}
                >
                  {statusText(d.status)}
                </span>
              </div>
              <p className="text-sm text-slate-700">{d.narrative}</p>
              <div className="grid gap-2 text-xs text-slate-600 sm:grid-cols-2">
                <p>
                  난이도: {d.beforeDifficulty ?? "—"} →{" "}
                  {d.afterDifficulty ?? "—"}
                </p>
                <p>
                  판정 수준: {d.beforeLevel ?? "—"} → {d.afterLevel ?? "—"}
                </p>
                {d.scoreComparable && d.scoreDelta != null ? (
                  <p>
                    동일 난이도 점수: {d.beforeScore} → {d.afterScore} (
                    {d.scoreDelta > 0 ? "+" : ""}
                    {d.scoreDelta}점)
                  </p>
                ) : (
                  <p>
                    점수(참고): {d.beforeScore ?? "—"} → {d.afterScore ?? "—"}
                    {!d.scoreComparable && " · 난이도가 달라 직접 비교하지 않음"}
                  </p>
                )}
                {d.percentileImproved && d.percentileDelta != null && (
                  <p>
                    동학년 상위: {d.beforePercentile}% → {d.afterPercentile}% (
                    {d.percentileDelta}%p 상승)
                  </p>
                )}
              </div>
              {d.afterSummary && (
                <div className="rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-700">
                  <p className="mb-1 text-xs font-semibold text-slate-500">
                    NELT 역량 총평 (최근 회차)
                  </p>
                  {d.afterSummary}
                </div>
              )}
              {d.beforeSummary && d.beforeSummary !== d.afterSummary && (
                <details className="text-sm">
                  <summary className="cursor-pointer text-xs font-medium text-slate-500">
                    이전 회차 총평 보기
                  </summary>
                  <p className="mt-2 leading-relaxed text-slate-600">
                    {d.beforeSummary}
                  </p>
                </details>
              )}
            </Card>
          ))}
        </div>
      </section>

      {/* 7. 세부 역량 성장 */}
      {analysis.subskillGrowth.length > 0 && (
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">
            상승한 세부 역량
          </h3>
          <Card className="p-0">
            <ul className="divide-y divide-slate-100">
              {analysis.subskillGrowth.map((s) => (
                <li
                  key={`${s.domain}-${s.name}`}
                  className="flex flex-wrap items-center justify-between gap-2 px-4 py-3 text-sm"
                >
                  <div>
                    <p className="font-medium text-slate-900">{s.name}</p>
                    <p className="text-xs text-slate-500">
                      {DOMAIN_LABEL[s.domain]}
                    </p>
                  </div>
                  <p className="font-semibold text-emerald-700">
                    {s.beforeAccuracy}% → {s.afterAccuracy}% (+{s.delta}%p)
                  </p>
                </li>
              ))}
            </ul>
          </Card>
        </section>
      )}

      {/* 8. 문법 항목 */}
      {(analysis.newlyCorrectGrammar.length > 0 ||
        analysis.focusGrammar.length > 0) && (
        <section className="space-y-3">
          <h3 className="text-lg font-bold text-slate-900">문법 항목 변화</h3>
          {analysis.newlyCorrectGrammar.length > 0 && (
            <Card className="space-y-2 p-5">
              <p className="text-sm font-semibold text-emerald-800">
                새롭게 확인한 문법
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {analysis.newlyCorrectGrammar.slice(0, 10).map((g) => (
                  <li key={`new-${g.detail}`}>
                    {g.category ? `${g.category}: ` : ""}
                    {g.detail}
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {analysis.focusGrammar.length > 0 && (
            <Card className="space-y-2 p-5">
              <p className="text-sm font-semibold text-amber-900">
                다음 학습 목표 문법
              </p>
              <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
                {analysis.focusGrammar.map((g) => (
                  <li key={`focus-${g.detail}`}>
                    {g.category ? `${g.category}: ` : ""}
                    {g.detail}
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </section>
      )}

      {/* 9. 다음 성장 목표 · 학습 계획 */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">다음 성장 목표</h3>
        <Card className="space-y-2 p-5">
          <p className="text-sm leading-relaxed text-slate-700">
            {analysis.nextGoalsNarrative}
          </p>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2">
          {(Object.keys(DOMAIN_LABEL) as Array<keyof typeof DOMAIN_LABEL>).map(
            (domain) => {
              const plan = analysis.learningPlan[domain];
              return (
                <Card key={domain} className="space-y-2 p-4">
                  <p className="text-sm font-bold text-slate-900">
                    {DOMAIN_LABEL[domain]}
                  </p>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">강점</span> · {plan.strength}
                  </p>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">다음 목표</span> ·{" "}
                    {plan.nextGoal}
                  </p>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">수업</span> · {plan.classFocus}
                  </p>
                  <p className="text-xs text-slate-600">
                    <span className="font-semibold">과제</span> · {plan.homework}
                  </p>
                </Card>
              );
            }
          )}
        </div>
      </section>

      {/* 10. 회차별 상세 */}
      <section className="space-y-3">
        <h3 className="text-lg font-bold text-slate-900">회차별 상세 결과</h3>
        {analysis.attempts.map((a) => (
          <Card key={a.id} className="space-y-3 p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-bold text-slate-900">
                {a.attemptNumber}차 · {a.testDate ?? "날짜 미상"}
              </p>
              <p className="text-sm text-slate-600">
                {a.overallLevel ?? "—"} · {a.overallBand ?? ""}
                {a.overallPercentile != null
                  ? ` · 상위 ${a.overallPercentile}%`
                  : ""}
              </p>
            </div>
            <div className="ui-table-wrap">
              <table className="ui-table text-sm">
                <thead>
                  <tr>
                    <th>영역</th>
                    <th>난이도</th>
                    <th>점수</th>
                    <th>판정 수준</th>
                    <th>상위%</th>
                    <th>소요(초)</th>
                  </tr>
                </thead>
                <tbody>
                  {a.domains.map((d) => (
                    <tr key={d.domain}>
                      <td>{DOMAIN_LABEL[d.domain]}</td>
                      <td>{d.difficultyCode ?? "—"}</td>
                      <td>{d.rawScore ?? "—"}</td>
                      <td>{d.evaluatedLevel ?? "—"}</td>
                      <td>{d.percentile ?? "—"}</td>
                      <td>{d.durationSeconds ?? "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {a.vocabulary && (
              <p className="text-xs text-slate-600">
                어휘량 약 {a.vocabulary.vocabularySize ?? "—"}단어 · 필수 어휘{" "}
                {a.vocabulary.elementaryRequiredPercentage ?? "—"}% · 수능 기출{" "}
                {a.vocabulary.csatVocabularyPercentage ?? "—"}%
              </p>
            )}
            {a.grammar && (
              <details className="text-sm">
                <summary className="cursor-pointer text-xs font-medium text-slate-500">
                  문법 O/X ({a.grammar.correctItemCount ?? 0}/
                  {a.grammar.totalItemCount ?? a.grammar.items.length})
                </summary>
                <ul className="mt-2 max-h-48 space-y-1 overflow-y-auto text-xs text-slate-600">
                  {a.grammar.items.map((item, i) => (
                    <li key={`${a.id}-g-${i}`}>
                      <span
                        className={
                          item.isCorrect
                            ? "font-semibold text-emerald-700"
                            : "font-semibold text-slate-400"
                        }
                      >
                        {item.isCorrect ? "O" : "X"}
                      </span>{" "}
                      {item.category ? `[${item.category}] ` : ""}
                      {item.detail}
                    </li>
                  ))}
                </ul>
              </details>
            )}
            {a.domains.some((d) => d.subskills.length > 0) && (
              <details className="text-sm">
                <summary className="cursor-pointer text-xs font-medium text-slate-500">
                  세부 역량 정답률
                </summary>
                <div className="mt-2 space-y-3">
                  {a.domains.map((d) =>
                    d.subskills.length === 0 ? null : (
                      <div key={d.domain}>
                        <p className="text-xs font-semibold text-slate-700">
                          {DOMAIN_LABEL[d.domain]}
                        </p>
                        <ul className="mt-1 space-y-1 text-xs text-slate-600">
                          {d.subskills.map((s) => (
                            <li key={s.name}>
                              {s.name}: {s.studentAccuracy ?? "—"}%
                              {s.levelAverageAccuracy != null
                                ? ` (레벨 평균 ${s.levelAverageAccuracy}%)`
                                : ""}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )
                  )}
                </div>
              </details>
            )}
            {a.sourceUrl && (
              <a
                href={a.sourceUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-block text-xs text-brand-600 hover:underline"
              >
                원본 링크 열기
              </a>
            )}
          </Card>
        ))}
      </section>

      {/* 11. 학부모 문구 */}
      <section className="space-y-3 print:hidden">
        <h3 className="text-lg font-bold text-slate-900">학부모 전달용 문구</h3>
        <Card className="space-y-3 p-5">
          <pre className="whitespace-pre-wrap rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-800">
            {analysis.parentCopy}
          </pre>
          <div className="flex flex-wrap items-center gap-2">
            <Button type="button" variant="primary" size="sm" onClick={() => void copyParent()}>
              문구 복사
            </Button>
            {copyMsg && <span className="text-xs text-emerald-700">{copyMsg}</span>}
          </div>
        </Card>
      </section>
    </div>
  );
}
