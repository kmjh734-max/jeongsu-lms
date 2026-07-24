"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button, ButtonLink } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";
import { NeltGrowthReportView } from "@/components/nelt/NeltGrowthReportView";
import { buildNeltGrowthAnalysis } from "@/lib/nelt/compare/build-growth";
import type { NeltAttemptBundle, NeltGrowthAnalysis } from "@/lib/nelt/compare/types";
import {
  applyAiNarratives,
  type NeltAiNarratives,
} from "@/lib/nelt/generate-report-narratives";
import type { NeltExtractedDraft } from "@/lib/nelt/types-draft";
import { resolveLevelOrder } from "@/lib/nelt/level-order";

interface NeltImportPanelProps {
  role: "admin" | "teacher";
  /** 메인(/nelt)에 바로 붙일 때 true — 이름 입력·페이지헤더 생략 */
  embedded?: boolean;
  /** 기존 학생에 회차 추가할 때 미리 채울 이름 */
  initialStudentName?: string;
}

type SlotState = {
  id: string;
  url: string;
  status: "idle" | "loading" | "ok" | "error";
  message: string;
  draft: NeltExtractedDraft | null;
  duplicates: Array<{ id: string; testDate: string | null }>;
};

let slotSeq = 0;
function emptySlot(): SlotState {
  slotSeq += 1;
  return {
    id: `slot-${slotSeq}`,
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

function statusClass(s: SlotState["status"]) {
  if (s === "ok") return "text-emerald-700 font-bold";
  if (s === "loading") return "text-orange-600 font-bold";
  if (s === "error") return "text-red-700 font-bold";
  return "text-slate-500";
}

/** 1·2차(+추가 회차) 링크 입력 → 분석 → 성장 리포트. 이름은 링크에서 추출 */
export function NeltImportPanel({
  role,
  embedded = false,
  initialStudentName = "",
}: NeltImportPanelProps) {
  const base = role === "admin" ? "/admin/nelt" : "/teacher/nelt";
  const router = useRouter();
  const [slots, setSlots] = useState<SlotState[]>(() => [
    emptySlot(),
    emptySlot(),
  ]);
  const [nameOverride, setNameOverride] = useState(initialStudentName);
  const [showEditor, setShowEditor] = useState(false);
  const [saving, setSaving] = useState(false);
  const [analyzingAll, setAnalyzingAll] = useState(false);
  /** links = URL 추출, ai = 서술 다듬기 */
  const [analyzeStage, setAnalyzeStage] = useState<"links" | "ai" | null>(null);
  const [analyzeProgress, setAnalyzeProgress] = useState(0);
  const [analyzeElapsed, setAnalyzeElapsed] = useState(0);
  const [analyzePhase, setAnalyzePhase] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  /** AI 서술까지 끝난 리포트 (미리보기는 이걸로만 표시) */
  const [polishedAnalysis, setPolishedAnalysis] =
    useState<NeltGrowthAnalysis | null>(null);

  const okSlots = useMemo(
    () => slots.filter((s) => s.status === "ok" && s.draft),
    [slots]
  );

  // 분석·AI 서술 중 진행률·경과 시간
  useEffect(() => {
    if (!analyzingAll || !analyzeStage) return;
    const started = Date.now();
    const tick = window.setInterval(() => {
      const sec = Math.floor((Date.now() - started) / 1000);
      setAnalyzeElapsed(sec);
      setAnalyzeProgress((p) => {
        if (analyzeStage === "links") {
          if (p >= 48) return p;
          return Math.min(48, p + (sec < 4 ? 3.5 : 1.8));
        }
        // AI 단계: 50~92
        if (p >= 92) return p;
        return Math.min(92, Math.max(50, p) + (sec < 6 ? 2.2 : 1.1));
      });
    }, 400);
    return () => window.clearInterval(tick);
  }, [analyzingAll, analyzeStage]);

  const extractedName = useMemo(() => {
    for (const s of okSlots) {
      const n = s.draft?.studentName?.trim();
      if (n) return n;
    }
    return "";
  }, [okSlots]);

  const studentName = nameOverride.trim() || extractedName;

  const analysis = useMemo(() => {
    if (okSlots.length < 2) return null;
    const name = studentName || "학생";
    const sorted = [...okSlots].sort((a, b) =>
      (a.draft?.testDate ?? "").localeCompare(b.draft?.testDate ?? "")
    );
    const attempts = sorted.map((s, i) =>
      draftToAttempt(s.draft!, i + 1, s.url)
    );
    return buildNeltGrowthAnalysis(name, attempts);
  }, [okSlots, studentName]);

  function updateSlot(id: string, patch: Partial<SlotState>) {
    setSlots((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  }

  function addSlot() {
    if (slots.length >= 6) return;
    setSlots((prev) => [...prev, emptySlot()]);
    setPreview(false);
    setPolishedAnalysis(null);
  }

  function removeSlot(id: string) {
    if (slots.length <= 2) return;
    setSlots((prev) => prev.filter((s) => s.id !== id));
    setPreview(false);
    setPolishedAnalysis(null);
  }

  async function analyzeOne(slot: SlotState, attemptNumber: number) {
    const url = slot.url.trim();
    if (!url) {
      updateSlot(slot.id, {
        status: "error",
        message: "링크를 입력해 주세요",
      });
      return false;
    }
    updateSlot(slot.id, {
      status: "loading",
      message: "서버 분석 중…",
      draft: null,
    });
    try {
      const res = await fetch("/api/nelt/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url,
          attemptNumber,
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
      if (!nameOverride.trim() && draft.studentName) {
        setNameOverride(draft.studentName);
      }
      updateSlot(slot.id, {
        url,
        status: "ok",
        message: "분석 완료",
        draft,
        duplicates: result.duplicates ?? [],
      });
      return true;
    } catch (e) {
      updateSlot(slot.id, {
        status: "error",
        message: e instanceof Error ? e.message : "분석 오류",
        draft: null,
      });
      return false;
    }
  }

  async function analyzeAll() {
    setError(null);
    const filled = slots.filter((s) => s.url.trim());
    if (filled.length < 2) {
      setError("최소 1차·2차 링크를 입력해 주세요.");
      return;
    }
    setAnalyzingAll(true);
    setAnalyzeStage("links");
    setAnalyzeProgress(6);
    setAnalyzeElapsed(0);
    setAnalyzePhase("링크를 가져오는 중…");
    setPreview(false);
    setPolishedAnalysis(null);
    try {
      const urls = filled.map((s) => s.url.trim());
      setSlots((prev) =>
        prev.map((s) =>
          s.url.trim()
            ? { ...s, status: "loading", message: "서버 분석 중…", draft: null }
            : s
        )
      );
      setAnalyzePhase("결과 페이지를 분석하는 중…");
      const res = await fetch("/api/nelt/import-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ urls }),
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

      let firstName = "";
      const nextSlots = filled
        .map((s) => {
          const r = results.find((x) => x.url === s.url.trim());
          if (r?.ok && r.draft) {
            if (!firstName && r.draft.studentName) {
              firstName = r.draft.studentName;
            }
            return {
              slot: s,
              draft: r.draft,
              duplicates: r.duplicates ?? [],
              ok: true as const,
            };
          }
          return {
            slot: s,
            draft: null,
            duplicates: [] as Array<{ id: string; testDate: string | null }>,
            ok: false as const,
            message: r?.message ?? "분석 실패",
          };
        });

      setSlots((prev) =>
        prev.map((s) => {
          const url = s.url.trim();
          if (!url) return s;
          const hit = nextSlots.find((x) => x.slot.id === s.id);
          if (!hit) return s;
          if (hit.ok && hit.draft) {
            return {
              ...s,
              status: "ok" as const,
              message: "분석 완료",
              draft: hit.draft,
              duplicates: hit.duplicates,
            };
          }
          return {
            ...s,
            status: "error" as const,
            message: "message" in hit ? hit.message : "분석 실패",
            draft: null,
            duplicates: [],
          };
        })
      );

      const name = nameOverride.trim() || firstName;
      if (!nameOverride.trim() && firstName) setNameOverride(firstName);

      const okItems = nextSlots
        .filter((x) => x.ok && x.draft)
        .sort((a, b) =>
          (a.draft!.testDate ?? "").localeCompare(b.draft!.testDate ?? "")
        );

      if (okItems.length < 2) {
        setAnalyzeProgress(100);
        setAnalyzePhase("분석을 마쳤습니다. (성공한 링크가 2개 미만입니다)");
        return;
      }
      if (!name) {
        setShowEditor(true);
        throw new Error(
          "링크에서 학생 이름을 찾지 못했습니다. 이름을 확인한 뒤 다시 분석해 주세요."
        );
      }

      // 바로 미리보기하지 않고 → AI 서술 다듬기까지 완료한 뒤 표시
      const built = buildNeltGrowthAnalysis(
        name,
        okItems.map((x, i) =>
          draftToAttempt(x.draft!, i + 1, x.slot.url.trim())
        )
      );
      if (!built) {
        throw new Error("성장 비교를 만들 수 없습니다.");
      }

      // 링크 결과만으로는 리포트를 열지 않음 → AI 서술 성공 후에만 출력
      setAnalyzeStage("ai");
      setAnalyzeProgress(52);
      setAnalyzePhase("AI로 서술 다듬는 중… (gpt-5.5)");
      setPreview(false);
      setPolishedAnalysis(null);

      let narratives: NeltAiNarratives | null = null;
      let modelLabel = "gpt-5.5";
      for (let attempt = 0; attempt < 2; attempt++) {
        setAnalyzePhase(
          attempt === 0
            ? "AI로 서술 다듬는 중… (gpt-5.5)"
            : "AI 서술 재시도 중…"
        );
        const aiRes = await fetch("/api/nelt/report-narratives", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            studentName: name,
            analysis: built,
            force: true,
          }),
        });
        const aiJson = await aiRes.json();
        if (
          aiRes.ok &&
          aiJson.ok &&
          aiJson.narratives &&
          (aiJson.source === "ai" || aiJson.source === "cache") &&
          aiJson.narratives.overallSummary
        ) {
          narratives = aiJson.narratives as NeltAiNarratives;
          modelLabel = (aiJson.model as string) || modelLabel;
          break;
        }
        if (attempt === 1) {
          throw new Error(
            aiJson.message ??
              "AI 서술 다듬기에 실패했습니다. 잠시 후 다시 시도해 주세요."
          );
        }
      }
      if (!narratives) {
        throw new Error("AI 서술 다듬기에 실패했습니다. 다시 시도해 주세요.");
      }

      const polished: NeltGrowthAnalysis = {
        ...applyAiNarratives(built, narratives),
        aiNarratives: narratives,
      };
      setPolishedAnalysis(polished);
      setAnalyzeProgress(100);
      setAnalyzePhase(`AI 서술 완료 (${modelLabel})`);
      setPreview(true);
      window.setTimeout(() => {
        document
          .getElementById("nelt-growth-preview")
          ?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 80);
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석 오류");
      setAnalyzePhase("");
      setPreview(false);
      setPolishedAnalysis(null);
    } finally {
      window.setTimeout(() => {
        setAnalyzingAll(false);
        setAnalyzeStage(null);
        setAnalyzeProgress(0);
        setAnalyzeElapsed(0);
        setAnalyzePhase("");
      }, 600);
    }
  }

  function patchDraftAt(
    index: number,
    patch: (d: NeltExtractedDraft) => NeltExtractedDraft
  ) {
    setSlots((prev) =>
      prev.map((s, i) =>
        i === index && s.draft ? { ...s, draft: patch(s.draft) } : s
      )
    );
  }

  async function saveAndOpenReport() {
    if (okSlots.length < 2) {
      setError("분석 완료된 회차가 2개 이상 필요합니다.");
      return;
    }
    const name = studentName;
    if (!name) {
      setError(
        "링크에서 학생 이름을 찾지 못했습니다. 아래에서 이름을 확인해 주세요."
      );
      setShowEditor(true);
      return;
    }
    setSaving(true);
    setError(null);
    try {
      const sorted = [...okSlots].sort((a, b) =>
        (a.draft?.testDate ?? "").localeCompare(b.draft?.testDate ?? "")
      );
      const res = await fetch("/api/nelt/reports/batch", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName: name,
          items: sorted.map((s) => ({
            draft: { ...s.draft!, studentName: name },
            sourceUrl: s.url,
            overwriteId: s.duplicates[0]?.id ?? null,
          })),
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
    setSlots([emptySlot(), emptySlot()]);
    setNameOverride(initialStudentName);
    setPreview(false);
    setPolishedAnalysis(null);
    setError(null);
    setShowEditor(false);
  }

  const form = (
    <section className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
      <div className="mb-4">
        <h2 className="text-lg font-bold text-slate-900">
          회차별 NELT 결과 링크
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          1차·2차 링크를 넣고 분석하세요. 필요하면 회차를 더 추가할 수 있습니다.
          학생 이름은 링크 결과에서 자동으로 가져옵니다.
        </p>
        {studentName && (
          <p className="mt-2 text-sm font-semibold text-[#152d4f]">
            학생: {studentName}
            {extractedName && nameOverride && nameOverride !== extractedName
              ? " (수정됨)"
              : ""}
          </p>
        )}
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {slots.map((slot, index) => (
          <article
            key={slot.id}
            className="rounded-2xl border border-slate-200 bg-slate-50/80 p-4"
          >
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="rounded-full bg-[#152d4f] px-3 py-1 text-xs font-extrabold text-white">
                {index + 1}차 결과
              </span>
              <div className="flex items-center gap-2">
                <span className={`text-xs ${statusClass(slot.status)}`}>
                  {slot.message}
                </span>
                {slots.length > 2 && (
                  <button
                    type="button"
                    className="text-xs text-slate-400 hover:text-red-600"
                    onClick={() => removeSlot(slot.id)}
                  >
                    삭제
                  </button>
                )}
              </div>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input
                type="url"
                value={slot.url}
                onChange={(e) =>
                  updateSlot(slot.id, {
                    url: e.target.value,
                    status: "idle",
                    message: "입력 대기",
                    draft: null,
                  })
                }
                placeholder="https://www.netutor.co.kr/s_url/?..."
                className="ui-input min-w-0 flex-1 font-mono text-xs"
              />
              <Button
                type="button"
                variant="secondary"
                disabled={slot.status === "loading" || analyzingAll}
                onClick={() => void analyzeOne(slot, index + 1)}
              >
                분석
              </Button>
            </div>
            {slot.draft && (
              <p className="mt-2 text-xs text-slate-600">
                {slot.draft.studentName ?? "이름?"} ·{" "}
                {slot.draft.testDate ?? "날짜?"} ·{" "}
                {slot.draft.overallLevel ?? "레벨?"} ·{" "}
                {slot.draft.domains
                  .map((d) => `${d.difficultyCode ?? "?"} ${d.rawScore ?? "—"}점`)
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
          disabled={analyzingAll}
          onClick={() => void analyzeAll()}
        >
          {analyzingAll
            ? analyzeStage === "ai"
              ? `AI 서술 작성 중… ${Math.max(1, Math.round(analyzeProgress))}%`
              : `링크 분석 중… ${Math.max(1, Math.round(analyzeProgress))}%`
            : "링크 모두 분석하기"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={analyzingAll || slots.length >= 6}
          onClick={addSlot}
        >
          회차 추가 ({slots.length}/6)
        </Button>
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowEditor((v) => !v)}
          disabled={analyzingAll || okSlots.length === 0}
        >
          추출 결과 수정
        </Button>
        <Button
          type="button"
          variant="secondary"
          disabled={analyzingAll || !polishedAnalysis}
          onClick={() => {
            if (!polishedAnalysis) {
              setError(
                "먼저 「링크 모두 분석하기」로 AI 서술까지 완료해 주세요."
              );
              return;
            }
            setPreview(true);
            window.setTimeout(() => {
              document
                .getElementById("nelt-growth-preview")
                ?.scrollIntoView({ behavior: "smooth" });
            }, 50);
          }}
        >
          리포트 미리보기
        </Button>
        <Button
          type="button"
          variant="ghost"
          disabled={analyzingAll}
          onClick={resetAll}
        >
          초기화
        </Button>
      </div>

      {analyzingAll && (
        <div className="mt-4 rounded-xl border border-[#c9dbf5] bg-[#edf4ff] px-4 py-3.5 text-[#244a78] shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-2 text-sm font-semibold">
            <span>{analyzePhase || "링크를 분석하는 중…"}</span>
            <span className="tabular-nums text-xs font-bold opacity-80">
              {analyzeElapsed}초 · {Math.max(1, Math.round(analyzeProgress))}%
            </span>
          </div>
          <div className="mt-2.5 h-2.5 overflow-hidden rounded-full bg-white/90">
            <div
              className="h-full rounded-full bg-[#244a78] transition-[width] duration-300 ease-out"
              style={{
                width: `${Math.min(100, Math.max(4, analyzeProgress))}%`,
              }}
            />
          </div>
          <p className="mt-2 text-xs font-medium opacity-75">
            {analyzeStage === "ai"
              ? "학부모용 문장을 AI로 다듬고 있습니다. 완료된 뒤에 리포트가 열립니다."
              : "링크를 읽은 뒤 AI 서술 다듬기까지 이어서 진행합니다. 잠시만 기다려 주세요."}
          </p>
        </div>
      )}

      {showEditor && okSlots.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs font-bold text-slate-500">
            학생명 (링크에서 추출 · 필요 시만 수정)
            <input
              className="ui-input mt-1"
              value={nameOverride || extractedName}
              onChange={(e) => setNameOverride(e.target.value)}
              placeholder="분석 후 자동"
            />
          </label>
          {slots.map((slot, index) =>
            slot.draft ? (
              <label
                key={slot.id}
                className="text-xs font-bold text-slate-500"
              >
                {index + 1}차 시험일
                <input
                  type="date"
                  className="ui-input mt-1"
                  value={slot.draft.testDate ?? ""}
                  onChange={(e) =>
                    patchDraftAt(index, (d) => ({
                      ...d,
                      testDate: e.target.value || null,
                    }))
                  }
                />
              </label>
            ) : null
          )}
        </div>
      )}

      {error && (
        <div className="mt-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {okSlots.length >= 2 && (
        <div className="mt-5 flex flex-wrap gap-2 border-t border-slate-100 pt-5">
          <Button
            type="button"
            variant="primary"
            disabled={saving}
            onClick={() => void saveAndOpenReport()}
          >
            {saving
              ? "저장 중…"
              : `${okSlots.length}회차 저장하고 성장 리포트 열기`}
          </Button>
          <p className="self-center text-xs text-slate-500">
            시험일 순으로 1·2·3차가 매겨집니다.
          </p>
        </div>
      )}
    </section>
  );

  return (
    <div className="space-y-6">
      {!embedded && (
        <PageHeader
          title="NELT 성장 리포트"
          description="회차별 공유 링크를 입력하면 성장 리포트를 만듭니다. 이름은 링크에서 자동 추출됩니다."
          action={
            <ButtonLink href={base} variant="secondary" size="sm">
              목록
            </ButtonLink>
          }
        />
      )}

      {form}

      {/* AI 서술 완료본만 표시 — 분석 중·미다듬기 결과는 절대 먼저 출력하지 않음 */}
      {preview && polishedAnalysis && !analyzingAll && (
        <div id="nelt-growth-preview">
          <NeltGrowthReportView
            role={role}
            analysis={polishedAnalysis}
            narrativesReady
          />
        </div>
      )}
    </div>
  );
}
