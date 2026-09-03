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
import { LessonMaterialLogicalFlow } from "@/components/lesson-materials/LessonMaterialLogicalFlow";
import { LessonMaterialComicFrame } from "@/components/lesson-materials/LessonMaterialComicFrame";
import type { LessonMaterialAnalysisCard } from "@/lib/lesson-materials/generate-organization";
import { translateLessonMaterialLinesAction } from "@/lib/lesson-materials/line-actions";
import {
  splitEnglishSentences,
  splitKoreanSentences,
  splitPassageIntoLinePairs,
} from "@/lib/lesson-materials/split-sentences";

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
  const [lines, setLines] = useState<PassageDraft[]>([]);
  const [selected, setSelected] = useState<Set<number>>(new Set([0]));
  const [editingEnglish, setEditingEnglish] = useState<Set<number>>(
    new Set()
  );
  const [translating, setTranslating] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [savedItemsCount, setSavedItemsCount] = useState<number>(0);

  const [analysisCards, setAnalysisCards] = useState<
    LessonMaterialAnalysisCard[] | null
  >(null);
  const [illustrationPrompt, setIllustrationPrompt] = useState<string>("");
  const [illustrationUrl, setIllustrationUrl] = useState<string | null>(null);
  const [comicCaptions, setComicCaptions] = useState<string[]>([]);
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

  function updateLine(index: number, patch: Partial<PassageDraft>) {
    setLines((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function selectAllLineIndexes(count: number) {
    setSelected(new Set(Array.from({ length: count }, (_, i) => i)));
  }

  async function fillKoreanForLines(current: PassageDraft[]) {
    const needIdx = current
      .map((l, i) => ({ i, english: l.english.trim(), korean: l.korean.trim() }))
      .filter((x) => x.english.length > 0 && x.korean.length === 0);
    if (needIdx.length === 0) return current;

    setTranslating(true);
    try {
      const res = await translateLessonMaterialLinesAction({
        lines: needIdx.map((x) => x.english),
      });
      if (!res.ok) {
        setError(res.message);
        return current;
      }
      const byNeed = new Map(needIdx.map((x, j) => [x.i, res.korean[j] ?? ""]));
      return current.map((l, i) =>
        byNeed.has(i) ? { ...l, korean: byNeed.get(i) ?? l.korean } : l
      );
    } finally {
      setTranslating(false);
    }
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

  async function runOrganization(
    items: Array<{ english: string; korean: string }>
  ) {
    setGeneratingOrganization(true);
    setError(null);
    setAnalysisCards(null);
    try {
      const res = await generateAction({ items });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      setAnalysisCards(res.analysisCards);
      setIllustrationPrompt(res.illustrationPrompt);
      setComicCaptions(res.comicCaptions ?? []);
      // 삽화는 버튼으로만 생성 (자동 생성하지 않음)
    } finally {
      setGeneratingOrganization(false);
    }
  }

  async function handleRegenerateFlow() {
    const filled = itemsForOrganization();
    if (filled.length === 0) return;
    await runOrganization(
      filled.map((it) => ({ english: it.english, korean: it.korean }))
    );
  }

  async function handleNext() {
    setError(null);
    if (!canGoNext()) {
      setError("영어 지문을 최소 30자 이상 입력해 주세요.");
      return;
    }
    const filled = itemsForOrganization();
    const splitLines = filled.flatMap((it) =>
      splitPassageIntoLinePairs({
        english: it.english,
        korean: it.korean,
      })
    );
    if (splitLines.length === 0) {
      setError("문장으로 나눌 영어 지문이 없습니다.");
      return;
    }

    setStep(2);
    setEditingEnglish(new Set());
    selectAllLineIndexes(splitLines.length);
    setLines(splitLines);

    const withKorean = await fillKoreanForLines(splitLines);
    setLines(withKorean);
    selectAllLineIndexes(withKorean.length);

    await runOrganization(
      filled.map((it) => ({ english: it.english, korean: it.korean }))
    );
  }

  function splitLineCard(idx: number) {
    const target = lines[idx];
    if (!target) return;
    const parts = splitEnglishSentences(target.english);
    if (parts.length <= 1) {
      setError("더 나눌 문장이 없습니다. 이미 한 줄입니다.");
      return;
    }
    const krParts = splitKoreanSentences(target.korean);
    const inserts = parts.map((english, i) => ({
      english,
      korean:
        krParts.length === parts.length
          ? (krParts[i] ?? "")
          : i === 0
            ? target.korean
            : "",
    }));
    setLines((prev) => {
      const next = [...prev];
      next.splice(idx, 1, ...inserts);
      selectAllLineIndexes(next.length);
      return next;
    });
    setEditingEnglish((prev) => {
      const next = new Set<number>();
      for (const i of prev) {
        if (i < idx) next.add(i);
        else if (i > idx) next.add(i + inserts.length - 1);
      }
      return next;
    });
  }

  async function translateOneLine(idx: number) {
    const target = lines[idx];
    if (!target?.english.trim()) return;
    setTranslating(true);
    setError(null);
    try {
      const res = await translateLessonMaterialLinesAction({
        lines: [target.english],
      });
      if (!res.ok) {
        setError(res.message);
        return;
      }
      updateLine(idx, { korean: res.korean[0] ?? "" });
    } finally {
      setTranslating(false);
    }
  }

  function insertLineAfter(idx: number) {
    setLines((prev) => {
      const next = [...prev];
      next.splice(idx + 1, 0, { english: "", korean: "" });
      selectAllLineIndexes(next.length);
      return next;
    });
    setEditingEnglish((prev) => {
      const next = new Set<number>();
      for (const i of prev) {
        if (i <= idx) next.add(i);
        else next.add(i + 1);
      }
      next.add(idx + 1);
      return next;
    });
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
        .map((idx) => lines[idx]!)
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
        illustrationCaptions:
          comicCaptions.length > 0 ? comicCaptions : null,
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
            지문을 한 줄(문장) 단위로 나누고, 각 줄의 한글 해석을 붙입니다.
          </p>
          {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

          <div className="mt-5 grid gap-4 lg:grid-cols-[1fr_420px]">
            <LessonMaterialLogicalFlow
              cards={analysisCards}
              loading={generatingOrganization && !analysisCards}
              regenerating={generatingOrganization}
              onRegenerate={() => void handleRegenerateFlow()}
            />

            <section className="rounded-xl border border-slate-200 bg-white p-4">
              <h3 className="text-sm font-bold text-slate-900">4컷 만화 삽화</h3>
              <p className="mt-1 text-xs text-slate-500">
                한글은 이미지에 그리지 않고, 아래 말풍선 문구를 화면에 올립니다.
              </p>
              <div className="mt-3">
                <LessonMaterialComicFrame
                  imageUrl={illustrationUrl}
                  captions={comicCaptions}
                  emptyHint={
                    generatingIllustration
                      ? "4컷 만화를 그리는 중입니다. 최대 1분 정도 걸릴 수 있습니다."
                      : "「삽화 만들기」를 누르면 생성됩니다."
                  }
                />
              </div>
              {comicCaptions.length > 0 ? (
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {comicCaptions.map((c, i) => (
                    <input
                      key={i}
                      className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-800"
                      style={{
                        fontFamily:
                          '"Malgun Gothic","Apple SD Gothic Neo","Noto Sans KR",sans-serif',
                      }}
                      value={c}
                      onChange={(e) => {
                        const v = e.target.value;
                        setComicCaptions((prev) => {
                          const next = [...prev];
                          next[i] = v;
                          return next;
                        });
                      }}
                      placeholder={`${i + 1}컷 한글 대사`}
                    />
                  ))}
                </div>
              ) : null}
              <div className="mt-3 flex flex-wrap gap-2">
                <Button
                  type="button"
                  size="sm"
                  className="bg-brand-600 hover:bg-brand-700"
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
                  {generatingIllustration
                    ? "생성 중…"
                    : illustrationUrl
                      ? "삽화만 다시 그리기"
                      : "삽화 만들기"}
                </Button>
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  disabled={generatingOrganization || generatingIllustration}
                  onClick={() => void handleRegenerateOrganization()}
                >
                  {generatingOrganization ? "생성 중…" : "논리 흐름만 다시 만들기"}
                </Button>
              </div>

              <div className="mt-3">
                <div className="text-xs font-semibold text-slate-600">
                  삽화 프롬프트 (수정 후 삽화 만들기)
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
            {lines.map((p, idx) => {
              const isChecked = selected.has(idx);
              const isEditing = editingEnglish.has(idx);
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
                          한줄해석
                        </span>
                      </div>

                      <div className="mt-3 grid gap-3 lg:grid-cols-[1fr_1fr_auto]">
                        <div className="rounded-xl bg-rose-50 p-3">
                          <div className="text-xs font-bold text-rose-600">
                            영어
                          </div>
                          {isEditing ? (
                            <textarea
                              className="mt-1 min-h-[56px] w-full resize-y rounded-lg border border-rose-200 bg-white px-3 py-2 text-sm leading-relaxed text-rose-900"
                              value={p.english}
                              onChange={(e) =>
                                updateLine(idx, { english: e.target.value })
                              }
                            />
                          ) : (
                            <div className="mt-1 whitespace-pre-wrap text-sm text-rose-900">
                              {p.english?.trim()
                                ? p.english
                                : "영어 지문이 비어 있습니다."}
                            </div>
                          )}
                        </div>

                        <div className="rounded-xl border border-slate-200 bg-white p-3">
                          <div className="text-xs font-bold text-slate-600">
                            한국어 해석
                          </div>
                          <textarea
                            className="mt-2 min-h-[56px] w-full resize-y rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm leading-relaxed text-slate-800"
                            placeholder="자동 번역 버튼을 누르거나 직접 입력"
                            value={p.korean}
                            onChange={(e) =>
                              updateLine(idx, { korean: e.target.value })
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
                          onClick={() => {
                            setEditingEnglish((prev) => {
                              const next = new Set(prev);
                              if (next.has(idx)) next.delete(idx);
                              else next.add(idx);
                              return next;
                            });
                          }}
                        >
                          ✏️ {isEditing ? "영어 편집 완료" : "영어 편집하기"}
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                          onClick={() => splitLineCard(idx)}
                        >
                          ✂️ 영어 나누기
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs text-brand-700 disabled:opacity-50"
                          disabled={translating || !p.english.trim()}
                          onClick={() => void translateOneLine(idx)}
                        >
                          🇰🇷 한글 해석 (자동)
                        </button>
                        <button
                          type="button"
                          className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-600"
                          onClick={() => insertLineAfter(idx)}
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
                setLines([]);
                setEditingEnglish(new Set());
                setAnalysisCards(null);
                setIllustrationPrompt("");
                setIllustrationUrl(null);
                setComicCaptions([]);
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
                translating ||
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
            한줄해석으로 나눠 저장했습니다. 자료함에서 확인할 수 있습니다.
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
                setLines([]);
                setEditingEnglish(new Set());
                setAnalysisCards(null);
                setIllustrationPrompt("");
                setIllustrationUrl(null);
                setComicCaptions([]);
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

