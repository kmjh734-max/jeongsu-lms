"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { LessonMaterialsStepTop } from "@/components/lesson-materials/LessonMaterialsStepTop";
import {
  generateLessonMaterialsIllustrationAction as generateAdminIllustration,
  generateLessonMaterialsOrganizationDraftAction as generateAdminOrganizationDraft,
  saveLessonMaterialsFromWizard as saveAdminLessonMaterialsFromWizard,
} from "@/app/admin/lesson-materials/actions";
import {
  generateLessonMaterialsIllustrationAction as generateTeacherIllustration,
  generateLessonMaterialsOrganizationDraftAction as generateTeacherOrganizationDraft,
  saveLessonMaterialsFromWizard as saveTeacherLessonMaterialsFromWizard,
} from "@/app/teacher/lesson-materials/actions";
import type { LessonMaterialAnalysisCard } from "@/lib/lesson-materials/generate-organization";

type PassageDraft = {
  english: string;
  korean: string;
};

const EN_MAX = 2320;

function clampTextCount(text: string, max: number) {
  return Math.min(text.length, max);
}

export function LessonMaterialsInputWizard({
  role,
}: {
  role: "admin" | "teacher";
}) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [passages, setPassages] = useState<PassageDraft[]>([
    { english: "", korean: "" },
  ]);
  const [selected, setSelected] = useState<Set<number>>(new Set([0]));

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [savedItemsCount, setSavedItemsCount] = useState<number>(0);

  const [analysisCards, setAnalysisCards] = useState<
    LessonMaterialAnalysisCard[] | null
  >(null);
  const [illustrationPrompt, setIllustrationPrompt] = useState<string>("");
  const [illustrationUrl, setIllustrationUrl] = useState<string | null>(null);
  const [generatingOrganization, setGeneratingOrganization] = useState(false);
  const [generatingIllustration, setGeneratingIllustration] = useState(false);

  const saveAction =
    role === "admin"
      ? saveAdminLessonMaterialsFromWizard
      : saveTeacherLessonMaterialsFromWizard;

  const generateAction =
    role === "admin"
      ? generateAdminOrganizationDraft
      : generateTeacherOrganizationDraft;

  const generateIllustrationAction =
    role === "admin" ? generateAdminIllustration : generateTeacherIllustration;

  const totalEnCount = useMemo(
    () => passages.reduce((sum, p) => sum + (p.english?.length ?? 0), 0),
    [passages]
  );

  function updatePassage(index: number, patch: Partial<PassageDraft>) {
    setPassages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function addPassage() {
    setPassages((prev) => [...prev, { english: "", korean: "" }]);
  }

  function removeLastPassage() {
    if (passages.length <= 1) return;
    const lastIdx = passages.length - 1;

    // 마지막 문장을 제거할 때 체크 상태도 함께 정리합니다.
    setSelected((prevSelected) => {
      const next = new Set(prevSelected);
      next.delete(lastIdx);
      return next;
    });

    setPassages((prev) => prev.slice(0, -1));
  }

  function canGoNext() {
    const validEnglish = passages.some(
      (p) => (p.english ?? "").trim().length >= 30
    );
    return validEnglish;
  }

  function itemsForOrganization() {
    const filled = passages
      .map((p, idx) => ({ idx, english: p.english, korean: p.korean }))
      .filter((it) => it.english.trim().length > 0);
    return filled;
  }

  async function runIllustration(prompt: string, passageHint: string) {
    setGeneratingIllustration(true);
    try {
      const img = await generateIllustrationAction({
        illustrationPrompt: prompt,
        passageHint,
      });
      if (!img.ok) {
        setError(img.message);
        return;
      }
      setIllustrationUrl(img.url);
    } finally {
      setGeneratingIllustration(false);
    }
  }

  async function runOrganization(items: Array<{ english: string; korean: string }>) {
    setGeneratingOrganization(true);
    setError(null);
    setAnalysisCards(null);
    setIllustrationUrl(null);
    try {
      const res = await generateAction({ items });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setAnalysisCards(res.analysisCards);
      setIllustrationPrompt(res.illustrationPrompt);
      await runIllustration(
        res.illustrationPrompt,
        items.map((it) => it.english).join("\n\n").slice(0, 800)
      );
    } finally {
      setGeneratingOrganization(false);
    }
  }

  async function handleNext() {
    setError(null);
    if (!canGoNext()) {
      setError("영어 지문을 최소 30자 이상 입력해 주세요.");
      return;
    }
    const filled = itemsForOrganization();
    setSelected(new Set(filled.map((it) => it.idx)));
    setStep(2);
    await runOrganization(
      filled.map((it) => ({ english: it.english, korean: it.korean }))
    );
  }

  async function handleRegenerateOrganization() {
    const filled = itemsForOrganization().filter((it) => selected.has(it.idx));
    const items =
      filled.length > 0
        ? filled
        : itemsForOrganization();
    if (items.length === 0) return;
    await runOrganization(
      items.map((it) => ({ english: it.english, korean: it.korean }))
    );
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const selectedSorted = [...selected].sort((a, b) => a - b);
      const items = selectedSorted
        .map((idx) => passages[idx]!)
        .map((p) => ({
          english: p.english,
          korean: p.korean,
        }))
        .filter((it) => it.english.trim().length > 0);

      const res = await saveAction({
        items,
        analysisCards: analysisCards ?? undefined,
        illustrationPrompt:
          illustrationPrompt.trim().length > 0 ? illustrationPrompt : null,
        illustrationUrl,
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setSavedProjectId(res.projectId ?? null);
      setSavedItemsCount(items.length);
      setStep(3);
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="px-4">
      <LessonMaterialsStepTop current={step} />

      {step === 1 ? (
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">
                자료 입력
              </h1>
              <p className="mt-2 text-sm text-slate-600">
                영어 지문을 넣고, 필요하면 한글 해석도 직접 입력하세요.
              </p>
            </div>
            <div className="shrink-0 text-right text-xs text-slate-500">
              총 {totalEnCount}자
            </div>
          </div>

          {error ? <Alert variant="error">{error}</Alert> : null}

          {passages.map((p, idx) => {
            const enCount = clampTextCount(p.english ?? "", EN_MAX);
            return (
              <section
                key={idx}
                className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <div className="mb-4 flex items-center justify-between gap-3">
                  <h2 className="text-sm font-bold text-slate-700">
                    Passage {idx + 1}
                  </h2>
                  <div className="flex items-center gap-2">
                    {passages.length > 1 ? (
                      <Button
                        type="button"
                        size="sm"
                        variant="ghost"
                        onClick={() => removeLastPassage()}
                      >
                        마지막 제거
                      </Button>
                    ) : null}
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="block">
                    <div className="mb-2 text-xs font-semibold text-slate-600">
                      영어 지문
                    </div>
                    <textarea
                      className="min-h-[240px] w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800"
                      placeholder="영어 텍스트를 입력하세요. (이미지/PDF 드래그는 다음 단계에서 추가)"
                      value={p.english}
                      onChange={(e) =>
                        updatePassage(idx, {
                          english: e.target.value.slice(0, EN_MAX),
                        })
                      }
                    />
                    <div className="mt-2 text-right text-xs text-slate-400">
                      {enCount} / {EN_MAX}자
                    </div>
                  </label>

                  <label className="block">
                    <div className="mb-2 text-xs font-semibold text-slate-600">
                      한글 해석 (선택)
                    </div>
                    <textarea
                      className="min-h-[240px] w-full resize-y rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm leading-relaxed text-slate-800"
                      placeholder="없다면 비워두세요. 이후에 한줄해석을 생성할 수 있습니다."
                      value={p.korean}
                      onChange={(e) =>
                        updatePassage(idx, { korean: e.target.value })
                      }
                    />
                  </label>
                </div>
              </section>
            );
          })}

          <div className="flex items-center justify-between gap-4">
            <button
              type="button"
              onClick={addPassage}
              className="flex flex-1 items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-200 bg-white py-3 text-sm font-semibold text-slate-500 hover:border-slate-300 hover:text-slate-700"
            >
              <span aria-hidden>+</span> 지문 추가하기
            </button>

            <div className="shrink-0">
              <Button
                type="button"
                size="md"
                variant="secondary"
                onClick={() => void handleNext()}
                disabled={!canGoNext()}
              >
                다음 단계로 →
              </Button>
            </div>
          </div>

          <p className="text-xs text-slate-500">
            Step 1은 자료 입력만 진행하고, Step 2에서 분석/삽화 프롬프트 생성 후 저장합니다.
          </p>
        </div>
      ) : null}

      {step === 2 ? (
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">
            자료 정리하기
          </h2>
          <p className="mt-2 text-sm text-slate-600">
            입력한 지문을 분석하고, 교육용 4컷 만화 삽화를 생성합니다.
          </p>
          {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_420px]">
            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-sm font-bold text-slate-900">
                  분석 &amp; 요약
                </h3>
                <div className="text-xs text-slate-400">
                  {generatingOrganization ? "생성 중…" : "지문 기준"}
                </div>
              </div>
              <div className="mt-3 space-y-4">
                {generatingOrganization && !analysisCards ? (
                  <div className="rounded-lg bg-slate-50 p-6 text-sm text-slate-500">
                    지문을 읽고 분석을 만드는 중입니다.
                  </div>
                ) : null}
                {(analysisCards ?? []).map((row, i) => (
                  <div key={i} className="rounded-lg bg-slate-50 p-3">
                    <div className="flex items-center gap-2">
                      <div className="flex h-7 w-7 items-center justify-center rounded bg-brand-100 text-xs font-bold text-brand-700">
                        {i + 1}
                      </div>
                      <div className="text-sm font-semibold text-slate-900">
                        {row.title}
                      </div>
                    </div>
                    <div className="mt-2 text-sm text-slate-600">
                      {row.desc}
                    </div>
                  </div>
                ))}
                {!generatingOrganization && !analysisCards ? (
                  <div className="rounded-lg bg-slate-50 p-6 text-sm text-slate-500">
                    아직 분석이 없습니다. 다시 생성을 눌러 주세요.
                  </div>
                ) : null}
              </div>
            </section>

            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-bold text-slate-900">4컷 만화 삽화</h3>
              <div className="mt-3 overflow-hidden rounded-xl border border-slate-200 bg-slate-50">
                {illustrationUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={illustrationUrl}
                    alt="수업자료 4컷 삽화"
                    className="aspect-square w-full object-contain bg-white"
                  />
                ) : (
                  <div className="flex aspect-square flex-col items-center justify-center gap-3 p-4">
                    <div className="text-xs text-slate-400">
                      {generatingIllustration || generatingOrganization
                        ? "4컷 만화를 그리는 중입니다. 최대 1분 정도 걸릴 수 있습니다."
                        : "이미지 없음"}
                    </div>
                  </div>
                )}
              </div>
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-brand-600 hover:bg-brand-700"
                  disabled={generatingOrganization || generatingIllustration}
                  onClick={() => void handleRegenerateOrganization()}
                >
                  {generatingOrganization || generatingIllustration
                    ? "생성 중…"
                    : "분석·삽화 다시 만들기"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={
                    generatingIllustration ||
                    generatingOrganization ||
                    illustrationPrompt.trim().length < 8
                  }
                  onClick={() =>
                    void runIllustration(
                      illustrationPrompt,
                      passages.map((p) => p.english).join("\n\n").slice(0, 800)
                    )
                  }
                >
                  삽화만 다시 그리기
                </Button>
              </div>

              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-600">
                  삽화 프롬프트 (수정 후 다시 만들기)
                </div>
                <textarea
                  className="mt-2 min-h-[88px] w-full resize-y rounded-lg border border-slate-200 px-3 py-2 text-sm text-slate-800"
                  value={illustrationPrompt}
                  onChange={(e) => setIllustrationPrompt(e.target.value)}
                />
              </div>
            </section>
          </div>

          {/* 하단: 문장 카드 목록 */}
          <section className="mt-5 space-y-3">
            {passages.map((p, idx) => {
              const isChecked = selected.has(idx);
              return (
                <div
                  key={idx}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                >
                  <div className="flex items-start justify-between gap-4">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                          문장 {idx + 1}
                        </span>
                        <span className="text-xs text-slate-500">
                          영어/한글 입력
                        </span>
                      </div>

                      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                        <div className="rounded-xl bg-rose-50 p-3">
                          <div className="text-xs font-bold text-rose-600">
                            영어
                          </div>
                          <div className="mt-1 whitespace-pre-wrap text-sm text-rose-900">
                            {p.english?.trim() ? p.english : "영어 지문이 비어 있습니다."}
                          </div>
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="text-xs font-bold text-slate-600">
                            한국어 해석
                          </div>
                          <textarea
                            className="mt-2 min-h-[72px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-800"
                            placeholder="자동 번역 버튼을 누르거나 직접 입력"
                            value={p.korean}
                            onChange={(e) =>
                              updatePassage(idx, { korean: e.target.value })
                            }
                          />
                        </div>

                        <div className="flex items-start justify-end">
                          <input
                            type="checkbox"
                            className="mt-2 h-4 w-4"
                            checked={isChecked}
                            onChange={() => {
                              setSelected((prev) => {
                                const next = new Set(prev);
                                if (next.has(idx)) next.delete(idx);
                                else next.add(idx);
                                return next;
                              });
                            }}
                          />
                        </div>
                      </div>

                      <div className="mt-3 flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                          onClick={() => {}}
                        >
                          ✏️ 영어 편집하기
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                          onClick={() => {}}
                        >
                          ✂️ 영어 나누기
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs text-brand-700"
                          onClick={() => {}}
                        >
                          🇰🇷 한글 해석 (자동)
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                          onClick={() => {}}
                        >
                          🧩 정리 추가하기
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* 하단 액션 바 */}
          <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStep(1);
                setAnalysisCards(null);
                setIllustrationPrompt("");
                setIllustrationUrl(null);
              }}
            >
              ← 이전 단계
            </Button>
            <Button
              type="button"
              variant="primary"
              disabled={
                saving ||
                generatingOrganization ||
                generatingIllustration ||
                selected.size === 0
              }
              onClick={() => void handleSave()}
              className="min-w-[220px]"
            >
              {saving ? "저장 중…" : "자료 저장 완료 →"}
            </Button>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">저장 완료</h2>
          <p className="mt-2 text-sm text-slate-600">
            이제 다음에 “한줄해석 생성” 화면(생성 버튼/미리보기/내보내기)을
            이 자료에 연결하면 됩니다.
          </p>
          {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              onClick={() => {
                setStep(1);
                setSavedProjectId(null);
                setSavedItemsCount(0);
                setAnalysisCards(null);
                setIllustrationPrompt("");
                setIllustrationUrl(null);
              }}
            >
              다시 입력
            </Button>
            <Link
              href={role === "admin" ? "/admin/lesson-materials" : "/teacher/lesson-materials"}
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
            >
              자료함으로 이동
            </Link>
          </div>

          {savedProjectId ? (
            <div className="mt-3">
              <Link
                href={
                  role === "admin"
                    ? `/admin/lesson-materials/project/${savedProjectId}`
                    : `/teacher/lesson-materials/project/${savedProjectId}`
                }
                className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
              >
                프로젝트 열기 →
              </Link>
            </div>
          ) : null}

          {savedProjectId ? (
            <p className="mt-4 text-xs text-slate-500">
              savedProjectId: {savedProjectId} / saved items: {savedItemsCount}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

