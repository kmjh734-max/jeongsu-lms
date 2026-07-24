"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { NeltGrowthReportView } from "@/components/nelt/NeltGrowthReportView";
import { buildNeltGrowthAnalysis } from "@/lib/nelt/compare/build-growth";
import type { NeltAttemptBundle } from "@/lib/nelt/compare/types";
import type { NeltExtractedDraft } from "@/lib/nelt/types-draft";
import { resolveLevelOrder } from "@/lib/nelt/level-order";

interface NeltImportPanelProps {
  role: "admin" | "teacher";
}

type SlotState = {
  url: string;
  status: "idle" | "loading" | "ok" | "error";
  message: string;
  draft: NeltExtractedDraft | null;
  duplicates: Array<{ id: string; testDate: string | null }>;
};

function emptySlot(): SlotState {
  return {
    url: "",
    status: "idle",
    message: "입력 대기",
    draft: null,
    duplicates: [],
  };
}

function draftToAttempt(
  draft: NeltExtractedDraft,
  attemptNumber: number,
  sourceUrl: string
): NeltAttemptBundle {
  return {
    id: `local-${attemptNumber}`,
    attemptNumber,
    testDate: draft.testDate,
    testName: draft.testName,
    studentGradeRaw: draft.studentGradeRaw,
    overallLevel: draft.overallLevel,
    overallBand: draft.overallBand,
    overallLevelOrder: resolveLevelOrder(draft.overallBand),
    overallPercentile: draft.overallPercentile,
    totalDurationSeconds: draft.totalDurationSeconds,
    sourceType: "url",
    sourceUrl,
    domains: draft.domains.map((d) => ({
      domain: d.domain,
      difficultyCode: d.difficultyCode,
      rawScore: d.rawScore,
      evaluatedLevel: d.evaluatedLevel,
      evaluatedLevelOrder: resolveLevelOrder(d.evaluatedLevel),
      percentile: d.percentile,
      durationSeconds: d.durationSeconds,
      achievementGrade: d.achievementGrade,
      evaluationSummary: d.evaluationSummary,
      subskills: d.subskills,
    })),
    vocabulary: {
      vocabularySize: draft.vocabulary.vocabularySize,
      elementaryRequiredTotal: draft.vocabulary.elementaryRequiredTotal,
      elementaryRequiredPercentage:
        draft.vocabulary.elementaryRequiredPercentage,
      elementaryRequiredEstimatedCount:
        draft.vocabulary.elementaryRequiredTotal != null &&
        draft.vocabulary.elementaryRequiredPercentage != null
          ? Math.round(
              (draft.vocabulary.elementaryRequiredTotal *
                draft.vocabulary.elementaryRequiredPercentage) /
                100
            )
          : null,
      csatVocabularyPercentage: draft.vocabulary.csatVocabularyPercentage,
    },
    grammar: {
      elementaryGrammarPercentage: draft.grammar.elementaryGrammarPercentage,
      correctItemCount: draft.grammar.items.filter((i) => i.isCorrect).length,
      totalItemCount: draft.grammar.items.length,
      items: draft.grammar.items,
    },
  };
}

/** 프로토타입: 1차·2차 링크를 각각 입력 → 분석 → 성장 리포트 */
export function NeltImportPanel({ role }: NeltImportPanelProps) {
  const base = role === "admin" ? "/admin/nelt" : "/teacher/nelt";
  const router = useRouter();
  const [studentName, setStudentName] = useState("");
  const [slot1, setSlot1] = useState<SlotState>(emptySlot);
  const [slot2, setSlot2] = useState<SlotState>(emptySlot);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);

  const analysis = useMemo(() => {
    if (!slot1.draft || !slot2.draft) return null;
    const name =
      studentName.trim() ||
      slot2.draft.studentName ||
      slot1.draft.studentName ||
      "학생";
    const a1 = draftToAttempt(slot1.draft, 1, slot1.url);
    const a2 = draftToAttempt(slot2.draft, 2, slot2.url);
    return buildNeltGrowthAnalysis(name, [a1, a2]);
  }, [slot1, slot2, studentName]);

  async function analyzeSlot(
    attempt: 1 | 2,
    setter: typeof setSlot1,
    current: SlotState
  ) {
    const url = current.url.trim();
    if (!url) {
      setter((s) => ({
        ...s,
        status: "error",
        message: "링크를 입력해 주세요",
      }));
      return;
    }
    setter((s) => ({
      ...s,
      status: "loading",
      message: "서버 분석 중…",
      draft: null,
    }));
    setError(null);
    try {
      const res = await fetch("/api/nelt/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          attemptNumber: attempt,
          studentName: studentName.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "링크 분석에 실패했습니다.");
      }
      const result = Array.isArray(json.results) ? json.results[0] : null;
      if (!result?.ok) {
        throw new Error(
          result?.message ??
            json.message ??
            "링크에서 NELT 결과를 추출하지 못했습니다."
        );
      }
      const draft = result.draft as NeltExtractedDraft;
      if (!studentName.trim() && draft.studentName) {
        setStudentName(draft.studentName);
      }
      setter({
        url,
        status: "ok",
        message: "분석 완료",
        draft,
        duplicates: result.duplicates ?? [],
      });
    } catch (e) {
      setter((s) => ({
        ...s,
        status: "error",
        message: e instanceof Error ? e.message : "분석 오류",
        draft: null,
      }));
    }
  }

  async function analyzeBothSequential() {
    setError(null);
    const url1 = slot1.url.trim();
    const url2 = slot2.url.trim();
    if (!url1 || !url2) {
      setError("1차·2차 링크를 모두 입력해 주세요.");
      return;
    }
    setSlot1((s) => ({ ...s, status: "loading", message: "서버 분석 중…" }));
    setSlot2((s) => ({ ...s, status: "loading", message: "대기 중…" }));
    try {
      const res = await fetch("/api/nelt/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          urls: [url1, url2],
          studentName: studentName.trim() || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "링크 분석에 실패했습니다.");
      }
      const results = json.results as Array<{
        ok: boolean;
        url: string;
        message?: string;
        draft?: NeltExtractedDraft;
        duplicates?: Array<{ id: string; testDate: string | null }>;
      }>;

      const r1 = results.find((r) => r.url === url1) ?? results[0];
      const r2 = results.find((r) => r.url === url2) ?? results[1];

      if (r1?.ok && r1.draft) {
        if (!studentName.trim() && r1.draft.studentName) {
          setStudentName(r1.draft.studentName);
        }
        setSlot1({
          url: url1,
          status: "ok",
          message: "분석 완료",
          draft: r1.draft,
          duplicates: r1.duplicates ?? [],
        });
      } else {
        setSlot1({
          url: url1,
          status: "error",
          message: r1?.message ?? "1차 분석 실패",
          draft: null,
          duplicates: [],
        });
      }

      if (r2?.ok && r2.draft) {
        if (!studentName.trim() && r2.draft.studentName) {
          setStudentName(r2.draft.studentName);
        }
        setSlot2({
          url: url2,
          status: "ok",
          message: "분석 완료",
          draft: r2.draft,
          duplicates: r2.duplicates ?? [],
        });
      } else {
        setSlot2({
          url: url2,
          status: "error",
          message: r2?.message ?? "2차 분석 실패",
          draft: null,
          duplicates: [],
        });
      }

      if (r1?.ok && r2?.ok) setPreview(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석 오류");
      setSlot1((s) => ({ ...s, status: "error", message: "실패" }));
      setSlot2((s) => ({ ...s, status: "error", message: "실패" }));
    }
  }

  function patchDraft(
    which: 1 | 2,
    patch: (d: NeltExtractedDraft) => NeltExtractedDraft
  ) {
    const setter = which === 1 ? setSlot1 : setSlot2;
    setter((s) => (s.draft ? { ...s, draft: patch(s.draft) } : s));
  }

  async function saveAndOpenReport() {
    if (!slot1.draft || !slot2.draft) {
      setError("1차·2차 분석이 모두 완료되어야 합니다.");
      return;
    }
    const name =
      studentName.trim() ||
      slot2.draft.studentName ||
      slot1.draft.studentName ||
      "";
    if (!name) {
      setError("학생 이름을 입력해 주세요.");
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const res = await fetch("/api/nelt/reports/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: name,
          items: [
            {
              draft: { ...slot1.draft, studentName: name },
              sourceUrl: slot1.url,
              overwriteId: slot1.duplicates[0]?.id ?? null,
            },
            {
              draft: { ...slot2.draft, studentName: name },
              sourceUrl: slot2.url,
              overwriteId: slot2.duplicates[0]?.id ?? null,
            },
          ],
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "저장에 실패했습니다.");
      }
      router.push(`${base}/student/${encodeURIComponent(name)}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "저장 오류");
    } finally {
      setSaving(false);
    }
  }

  function resetAll() {
    setSlot1(emptySlot());
    setSlot2(emptySlot());
    setPreview(false);
    setError(null);
  }

  const statusClass = (s: SlotState["status"]) =>
    s === "ok"
      ? "text-emerald-700 font-bold"
      : s === "loading"
        ? "text-orange-600 font-bold"
        : s === "error"
          ? "text-red-700 font-bold"
          : "text-slate-500";

  return (
    <div className="space-y-6">
      <PageHeader
        title="NELT 성장 리포트"
        description="1차·2차 공유 링크를 나누어 등록하고 성장 중심 리포트를 생성합니다."
        action={
          <div className="flex flex-wrap gap-2">
            <ButtonLink href={base} variant="secondary" size="sm">
              목록
            </ButtonLink>
            {analysis && (
              <Button
                type="button"
                variant="primary"
                size="sm"
                onClick={() => {
                  setPreview(true);
                  document
                    .getElementById("nelt-growth-preview")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
              >
                리포트 생성
              </Button>
            )}
          </div>
        }
      />

      <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-950">
        <strong>안내:</strong> 링크는 브라우저에서 직접 열지 않고{" "}
        <code className="rounded bg-white/70 px-1">/api/nelt/import-url</code>{" "}
        서버 API로 분석합니다. 난이도가 다른 원점수는 단순 비교하지 않습니다.
      </div>

      <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
        <div className="mb-4 flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              1차·2차 NELT 결과 등록
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              회차별 링크를 구분하여 입력하면 두 결과를 비교합니다.
            </p>
          </div>
          <label className="block text-sm font-medium text-slate-700">
            학생 이름
            <input
              className="ui-input mt-1 w-48"
              value={studentName}
              onChange={(e) => setStudentName(e.target.value)}
              placeholder="분석 후 자동 채움"
            />
          </label>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              [1, slot1, setSlot1] as const,
              [2, slot2, setSlot2] as const,
            ] as const
          ).map(([attempt, slot, setter]) => (
            <article
              key={attempt}
              className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
            >
              <div className="mb-3 flex items-center justify-between">
                <span className="rounded-full bg-[#152d4f] px-3 py-1 text-xs font-extrabold text-white">
                  {attempt}차 결과
                </span>
                <span className={`text-xs ${statusClass(slot.status)}`}>
                  {slot.message}
                </span>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <input
                  type="url"
                  value={slot.url}
                  onChange={(e) =>
                    setter((s) => ({ ...s, url: e.target.value }))
                  }
                  placeholder="https://www.netutor.co.kr/s_url/?..."
                  className="ui-input min-w-0 flex-1 font-mono text-xs"
                />
                <Button
                  type="button"
                  variant="secondary"
                  disabled={slot.status === "loading"}
                  onClick={() => void analyzeSlot(attempt, setter, slot)}
                >
                  분석
                </Button>
              </div>
              <p className="mt-2 text-xs text-slate-500">
                {attempt}차 결과 공유 링크
              </p>
              {slot.draft && (
                <p className="mt-2 text-xs text-slate-600">
                  {slot.draft.testDate ?? "날짜?"} ·{" "}
                  {slot.draft.overallLevel ?? "레벨?"} ·{" "}
                  {slot.draft.domains
                    .map(
                      (d) =>
                        `${d.difficultyCode ?? "?"} ${d.rawScore ?? "—"}점`
                    )
                    .join(" · ")}
                </p>
              )}
            </article>
          ))}
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          <Button
            type="button"
            variant="primary"
            onClick={() => void analyzeBothSequential()}
          >
            두 링크 분석하기
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowEditor((v) => !v)}
            disabled={!slot1.draft || !slot2.draft}
          >
            추출 결과 직접 수정
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={() => {
              if (analysis) setPreview(true);
              else setError("먼저 1차·2차 링크를 분석해 주세요.");
            }}
            disabled={!analysis}
          >
            리포트 미리보기
          </Button>
          <Button type="button" variant="ghost" onClick={resetAll}>
            초기화
          </Button>
        </div>

        {showEditor && slot1.draft && slot2.draft && (
          <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <label className="text-xs font-bold text-slate-500">
              학생명
              <input
                className="ui-input mt-1"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </label>
            <label className="text-xs font-bold text-slate-500">
              1차 시험일
              <input
                type="date"
                className="ui-input mt-1"
                value={slot1.draft.testDate ?? ""}
                onChange={(e) =>
                  patchDraft(1, (d) => ({
                    ...d,
                    testDate: e.target.value || null,
                  }))
                }
              />
            </label>
            <label className="text-xs font-bold text-slate-500">
              2차 시험일
              <input
                type="date"
                className="ui-input mt-1"
                value={slot2.draft.testDate ?? ""}
                onChange={(e) =>
                  patchDraft(2, (d) => ({
                    ...d,
                    testDate: e.target.value || null,
                  }))
                }
              />
            </label>
            <label className="text-xs font-bold text-slate-500">
              종합 레벨 (표시용)
              <input
                className="ui-input mt-1"
                readOnly
                value={`${slot1.draft.overallLevel ?? "—"} → ${
                  slot2.draft.overallLevel ?? "—"
                }`}
              />
            </label>
            <label className="text-xs font-bold text-slate-500">
              1차 어휘량
              <input
                type="number"
                className="ui-input mt-1"
                value={slot1.draft.vocabulary.vocabularySize ?? ""}
                onChange={(e) =>
                  patchDraft(1, (d) => ({
                    ...d,
                    vocabulary: {
                      ...d.vocabulary,
                      vocabularySize: e.target.value
                        ? Number(e.target.value)
                        : null,
                    },
                  }))
                }
              />
            </label>
            <label className="text-xs font-bold text-slate-500">
              2차 어휘량
              <input
                type="number"
                className="ui-input mt-1"
                value={slot2.draft.vocabulary.vocabularySize ?? ""}
                onChange={(e) =>
                  patchDraft(2, (d) => ({
                    ...d,
                    vocabulary: {
                      ...d.vocabulary,
                      vocabularySize: e.target.value
                        ? Number(e.target.value)
                        : null,
                    },
                  }))
                }
              />
            </label>
            <label className="text-xs font-bold text-slate-500">
              1차 필수어휘 %
              <input
                type="number"
                className="ui-input mt-1"
                value={
                  slot1.draft.vocabulary.elementaryRequiredPercentage ?? ""
                }
                onChange={(e) =>
                  patchDraft(1, (d) => ({
                    ...d,
                    vocabulary: {
                      ...d.vocabulary,
                      elementaryRequiredPercentage: e.target.value
                        ? Number(e.target.value)
                        : null,
                    },
                  }))
                }
              />
            </label>
            <label className="text-xs font-bold text-slate-500">
              2차 필수어휘 %
              <input
                type="number"
                className="ui-input mt-1"
                value={
                  slot2.draft.vocabulary.elementaryRequiredPercentage ?? ""
                }
                onChange={(e) =>
                  patchDraft(2, (d) => ({
                    ...d,
                    vocabulary: {
                      ...d.vocabulary,
                      elementaryRequiredPercentage: e.target.value
                        ? Number(e.target.value)
                        : null,
                    },
                  }))
                }
              />
            </label>
            <label className="text-xs font-bold text-slate-500">
              1차 종합 상위 %
              <input
                type="number"
                className="ui-input mt-1"
                value={slot1.draft.overallPercentile ?? ""}
                onChange={(e) =>
                  patchDraft(1, (d) => ({
                    ...d,
                    overallPercentile: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
              />
            </label>
            <label className="text-xs font-bold text-slate-500">
              2차 종합 상위 %
              <input
                type="number"
                className="ui-input mt-1"
                value={slot2.draft.overallPercentile ?? ""}
                onChange={(e) =>
                  patchDraft(2, (d) => ({
                    ...d,
                    overallPercentile: e.target.value
                      ? Number(e.target.value)
                      : null,
                  }))
                }
              />
            </label>
          </div>
        )}

        {error && (
          <div className="mt-4">
            <Alert variant="error">{error}</Alert>
          </div>
        )}

        {slot1.draft && slot2.draft && (
          <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
            <Button
              type="button"
              variant="primary"
              disabled={saving}
              onClick={() => void saveAndOpenReport()}
            >
              {saving ? "저장 중…" : "저장하고 성장 리포트 열기"}
            </Button>
            <p className="self-center text-xs text-slate-500">
              검토·수정 후 저장하면 학생 상세에 1·2차로 등록됩니다.
            </p>
          </div>
        )}
      </section>

      {preview && analysis && (
        <div id="nelt-growth-preview">
          <NeltGrowthReportView role={role} analysis={analysis} />
        </div>
      )}
    </div>
  );
}
