"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Alert } from "@/components/ui/Alert";
import { LessonMaterialsStepTop } from "@/components/lesson-materials/LessonMaterialsStepTop";
import {
  generateLessonMaterialsOrganizationDraftAction as generateAdminOrganizationDraft,
  saveLessonMaterialsFromWizard as saveAdminLessonMaterialsFromWizard,
} from "@/app/admin/lesson-materials/actions";
import {
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

type PassageWorkbench = {
  english: string;
  korean: string;
  title: string;
  source: string;
  lines: PassageDraft[];
  selected: number[];
  editingEnglish: number[];
  analysisCards: LessonMaterialAnalysisCard[] | null;
  illustrationPrompt: string;
  illustrationUrl: string | null;
  comicCaptions: string[];
  generatingOrganization: boolean;
  generatingIllustration: boolean;
};

const EN_MAX = 2320;

function clampTextCount(text: string, max: number) {
  return Math.min(text.length, max);
}

function emptyWorkbench(english = "", korean = ""): PassageWorkbench {
  return {
    english,
    korean,
    title: "",
    source: "",
    lines: [],
    selected: [],
    editingEnglish: [],
    analysisCards: null,
    illustrationPrompt: "",
    illustrationUrl: null,
    comicCaptions: [],
    generatingOrganization: false,
    generatingIllustration: false,
  };
}

function allIndexes(count: number) {
  return Array.from({ length: count }, (_, i) => i);
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
  const [workbenches, setWorkbenches] = useState<PassageWorkbench[]>([]);
  const [activePassage, setActivePassage] = useState(0);
  const [translating, setTranslating] = useState(false);
  const [bulkBusy, setBulkBusy] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [savedProjectId, setSavedProjectId] = useState<string | null>(null);
  const [savedItemsCount, setSavedItemsCount] = useState<number>(0);
  const [savedProjectIds, setSavedProjectIds] = useState<string[]>([]);

  const saveAction =
    role === "admin"
      ? saveAdminLessonMaterialsFromWizard
      : saveTeacherLessonMaterialsFromWizard;

  const generateAction =
    role === "admin"
      ? generateAdminOrganizationDraft
      : generateTeacherOrganizationDraft;

  const totalEnCount = useMemo(
    () => passages.reduce((sum, p) => sum + (p.english?.length ?? 0), 0),
    [passages]
  );

  const wb = workbenches[activePassage] ?? null;
  const multi = workbenches.length > 1;

  function updatePassage(index: number, patch: Partial<PassageDraft>) {
    setPassages((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], ...patch };
      return next;
    });
  }

  function patchWorkbench(index: number, patch: Partial<PassageWorkbench>) {
    setWorkbenches((prev) => {
      const next = [...prev];
      const cur = next[index];
      if (!cur) return prev;
      next[index] = { ...cur, ...patch };
      return next;
    });
  }

  function updateLine(lineIdx: number, patch: Partial<PassageDraft>) {
    setWorkbenches((prev) => {
      const next = [...prev];
      const cur = next[activePassage];
      if (!cur) return prev;
      const lines = [...cur.lines];
      lines[lineIdx] = { ...lines[lineIdx]!, ...patch };
      next[activePassage] = { ...cur, lines };
      return next;
    });
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
    setPassages((prev) => prev.slice(0, -1));
  }

  function canGoNext() {
    return passages.some((p) => (p.english ?? "").trim().length >= 30);
  }

  async function runOrganizationForIndex(index: number): Promise<{
    illustrationPrompt: string;
    comicCaptions: string[];
  } | null> {
    const cur = workbenches[index];
    const english = cur?.english?.trim() || "";
    const korean = cur?.korean?.trim() || "";
    const prevTitle = cur?.title || "";
    if (!english) {
      setError("지문 영어가 비어 있습니다.");
      return null;
    }

    patchWorkbench(index, { generatingOrganization: true });
    setError(null);
    try {
      const res = await generateAction({
        items: [{ english, korean }],
      });
      if (!res.ok) {
        setError(res.message);
        return null;
      }
      const comicCaptions = res.comicCaptions ?? [];
      patchWorkbench(index, {
        title: res.passageTitle || prevTitle || "",
        analysisCards: res.analysisCards,
        illustrationPrompt: res.illustrationPrompt,
        comicCaptions,
        generatingOrganization: false,
      });
      return {
        illustrationPrompt: res.illustrationPrompt,
        comicCaptions,
      };
    } catch (e) {
      setError(e instanceof Error ? e.message : "분석 생성에 실패했습니다.");
      return null;
    } finally {
      patchWorkbench(index, { generatingOrganization: false });
    }
  }

  function resolveIllustrationPrompt(board: PassageWorkbench): string {
    const direct = board.illustrationPrompt.trim();
    if (direct.length >= 8) return direct;
    const hint = board.english.trim().slice(0, 600);
    if (hint.length >= 20) {
      return `One continuous 2x2 educational manhwa about this passage idea. Same characters in all panels. Soft narrative arc. No text, no speech bubbles in the art. Passage: ${hint}`;
    }
    return "";
  }

  async function runIllustrationForIndex(
    index: number,
    overrides?: { illustrationPrompt?: string; comicCaptions?: string[] }
  ) {
    const cur = workbenches[index];
    if (!cur) {
      setError("지문 정보가 없습니다. 이전 단계로 돌아가 다시 시도해 주세요.");
      return;
    }

    const prompt = (
      overrides?.illustrationPrompt?.trim() ||
      resolveIllustrationPrompt(cur)
    ).trim();
    const captions =
      overrides?.comicCaptions && overrides.comicCaptions.length > 0
        ? [...overrides.comicCaptions]
        : cur.comicCaptions.length > 0
          ? [...cur.comicCaptions]
          : [
              "이게 정말 맞을까?",
              "잠깐, 문제가 보이네",
              "다시 생각해 보자",
              "이제 이해가 됐어!",
            ];

    if (prompt.length < 8) {
      setError(
        "삽화에 쓸 내용이 없습니다. 「논리 흐름 재생성」을 한 뒤 다시 눌러 주세요."
      );
      return;
    }

    // Persist resolved prompt so later clicks keep working
    if (!cur.illustrationPrompt.trim() && prompt) {
      patchWorkbench(index, { illustrationPrompt: prompt });
    }

    patchWorkbench(index, { generatingIllustration: true });
    setError(null);
    try {
      const res = await fetch("/api/lesson-materials/illustration", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          illustrationPrompt: prompt,
          passageHint: cur.english.slice(0, 800),
          captions,
        }),
      });
      let img: { ok: true; url: string } | { ok: false; message: string };
      try {
        img = (await res.json()) as typeof img;
      } catch {
        setError(
          `삽화 응답을 읽지 못했습니다 (HTTP ${res.status}). 잠시 후 다시 시도해 주세요.`
        );
        return;
      }
      if (!res.ok || !img.ok) {
        setError(
          !img.ok
            ? img.message
            : `삽화 생성 실패 (HTTP ${res.status})`
        );
        return;
      }
      patchWorkbench(index, { illustrationUrl: img.url });
    } catch (e) {
      setError(
        e instanceof Error
          ? `삽화 생성 중 오류: ${e.message}`
          : "삽화 생성 중 오류가 발생했습니다."
      );
    } finally {
      patchWorkbench(index, { generatingIllustration: false });
    }
  }

  async function handleNext() {
    setError(null);
    if (!canGoNext()) {
      setError("영어 지문을 최소 30자 이상 입력해 주세요.");
      return;
    }

    const filled = passages
      .map((p) => ({
        english: p.english.trim(),
        korean: p.korean.trim(),
      }))
      .filter((p) => p.english.length > 0);

    if (filled.length === 0) {
      setError("문장으로 나눌 영어 지문이 없습니다.");
      return;
    }

    const boards: PassageWorkbench[] = filled.map((p) => {
      const lines = splitPassageIntoLinePairs(p);
      return {
        ...emptyWorkbench(p.english, p.korean),
        lines,
        selected: allIndexes(lines.length),
      };
    });

    setWorkbenches(boards);
    setActivePassage(0);
    setStep(2);

    for (let i = 0; i < boards.length; i++) {
      const withKorean = await fillKoreanForLines(boards[i]!.lines);
      boards[i] = {
        ...boards[i]!,
        lines: withKorean,
        selected: allIndexes(withKorean.length),
        generatingOrganization: true,
      };
      setWorkbenches(boards.map((b) => ({ ...b })));

      try {
        const res = await generateAction({
          items: [
            {
              english: boards[i]!.english,
              korean: boards[i]!.korean,
            },
          ],
        });
        if (!res.ok) {
          setError(res.message);
          boards[i] = { ...boards[i]!, generatingOrganization: false };
        } else {
          boards[i] = {
            ...boards[i]!,
            title: res.passageTitle || "",
            analysisCards: res.analysisCards,
            illustrationPrompt: res.illustrationPrompt,
            comicCaptions: res.comicCaptions ?? [],
            generatingOrganization: false,
          };
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : "분석 생성 실패");
        boards[i] = { ...boards[i]!, generatingOrganization: false };
      }
      setWorkbenches(boards.map((b) => ({ ...b })));
    }
  }

  function splitLineCard(idx: number) {
    const target = wb?.lines[idx];
    if (!target || !wb) return;
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
    const lines = [...wb.lines];
    lines.splice(idx, 1, ...inserts);
    const editing = wb.editingEnglish
      .filter((i) => i !== idx)
      .map((i) => (i > idx ? i + inserts.length - 1 : i));
    patchWorkbench(activePassage, {
      lines,
      selected: allIndexes(lines.length),
      editingEnglish: editing,
    });
  }

  async function translateOneLine(idx: number) {
    const target = wb?.lines[idx];
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

  async function handleBulkTranslate() {
    setBulkBusy(true);
    setError(null);
    try {
      for (let pi = 0; pi < workbenches.length; pi++) {
        const board = workbenches[pi]!;
        const withKorean = await fillKoreanForLines(board.lines);
        patchWorkbench(pi, {
          lines: withKorean,
          selected: allIndexes(withKorean.length),
        });
      }
    } finally {
      setBulkBusy(false);
    }
  }

  async function handleBulkIllustrations() {
    setBulkBusy(true);
    setError(null);
    try {
      const count = workbenches.length;
      for (let pi = 0; pi < count; pi++) {
        const draft = await runOrganizationForIndex(pi);
        await runIllustrationForIndex(
          pi,
          draft
            ? {
                illustrationPrompt: draft.illustrationPrompt,
                comicCaptions: draft.comicCaptions,
              }
            : undefined
        );
      }
    } finally {
      setBulkBusy(false);
    }
  }

  function insertLineAfter(idx: number) {
    if (!wb) return;
    const lines = [...wb.lines];
    lines.splice(idx + 1, 0, { english: "", korean: "" });
    const editing = wb.editingEnglish.map((i) => (i > idx ? i + 1 : i));
    editing.push(idx + 1);
    patchWorkbench(activePassage, {
      lines,
      selected: allIndexes(lines.length),
      editingEnglish: editing,
    });
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    try {
      const createdIds: string[] = [];
      let totalItems = 0;

      for (const board of workbenches) {
        const items = board.selected
          .slice()
          .sort((a, b) => a - b)
          .map((idx) => board.lines[idx]!)
          .map((p) => ({ english: p.english, korean: p.korean }))
          .filter((it) => it.english.trim().length > 0);

        if (items.length === 0) continue;

        const res = await saveAction({
          items,
          projectTitle: board.title.trim() || null,
          analysisCards: board.analysisCards ?? undefined,
          illustrationPrompt:
            board.illustrationPrompt.trim().length > 0
              ? board.illustrationPrompt
              : null,
          illustrationUrl: board.illustrationUrl,
          illustrationCaptions:
            board.comicCaptions.length > 0 ? board.comicCaptions : null,
        });
        if (!res.ok) {
          setError(res.message);
          return;
        }
        if (res.projectId) createdIds.push(res.projectId);
        totalItems += items.length;
      }

      if (createdIds.length === 0) {
        setError("저장할 문장이 없습니다. 체크박스를 확인해 주세요.");
        return;
      }

      setSavedProjectIds(createdIds);
      setSavedProjectId(createdIds[0] ?? null);
      setSavedItemsCount(totalItems);
      setStep(3);
    } finally {
      setSaving(false);
    }
  }

  function resetToStep1() {
    setStep(1);
    setWorkbenches([]);
    setActivePassage(0);
    setSavedProjectId(null);
    setSavedProjectIds([]);
    setSavedItemsCount(0);
  }

  return (
    <div className="px-4">
      <LessonMaterialsStepTop current={step} />

      {step === 1 ? (
        <div className="mx-auto max-w-6xl space-y-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">자료 입력</h1>
              <p className="mt-2 text-sm text-slate-600">
                영어 지문을 넣고, 필요하면 한글 해석도 직접 입력하세요. 지문이
                2개 이상이면 다음 단계에서 번호로 구분됩니다.
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
                    {passages.length > 1 && idx === passages.length - 1 ? (
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
                      placeholder="영어 텍스트를 입력하세요."
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
                      placeholder="없다면 비워두세요."
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
        </div>
      ) : null}

      {step === 2 && wb ? (
        <div className="mx-auto max-w-6xl space-y-4">
          {multi ? (
            <div className="flex justify-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-2 py-1.5 shadow-sm">
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                  disabled={activePassage <= 0}
                  onClick={() => setActivePassage((v) => Math.max(0, v - 1))}
                  aria-label="이전 지문"
                >
                  ‹
                </button>
                {workbenches.map((_, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setActivePassage(i)}
                    className={
                      i === activePassage
                        ? "flex h-9 w-9 items-center justify-center rounded-full bg-violet-600 text-sm font-bold text-white"
                        : "flex h-9 w-9 items-center justify-center rounded-full text-sm font-semibold text-slate-600 hover:bg-slate-100"
                    }
                  >
                    {i + 1}
                  </button>
                ))}
                <button
                  type="button"
                  className="flex h-9 w-9 items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 disabled:opacity-30"
                  disabled={activePassage >= workbenches.length - 1}
                  onClick={() =>
                    setActivePassage((v) =>
                      Math.min(workbenches.length - 1, v + 1)
                    )
                  }
                  aria-label="다음 지문"
                >
                  ›
                </button>
              </div>
            </div>
          ) : null}

          <div className="flex flex-wrap items-start justify-between gap-3">
            <div className="min-w-0 flex-1 rounded-2xl border border-slate-200 bg-white px-5 py-4 shadow-sm">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-[10px] font-bold tracking-wider text-slate-400">
                  TITLE
                </span>
                <button
                  type="button"
                  className="rounded-full border border-violet-200 bg-violet-50 px-2.5 py-0.5 text-[11px] font-semibold text-violet-700 disabled:opacity-50"
                  disabled={wb.generatingOrganization || bulkBusy}
                  onClick={() => void runOrganizationForIndex(activePassage)}
                >
                  {wb.generatingOrganization ? "생성 중…" : "제목 재생성 ▾"}
                </button>
              </div>
              <input
                className="mt-1 w-full border-0 bg-transparent text-lg font-bold text-slate-900 outline-none placeholder:text-slate-300"
                value={wb.title}
                onChange={(e) =>
                  patchWorkbench(activePassage, { title: e.target.value })
                }
                placeholder="지문 제목"
              />
              <div className="mt-3 flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">
                  출처
                </span>
                <input
                  className="min-w-[180px] flex-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm text-slate-700"
                  value={wb.source}
                  onChange={(e) =>
                    patchWorkbench(activePassage, { source: e.target.value })
                  }
                  placeholder="예: H1_2503_31"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                className="bg-violet-600 hover:bg-violet-700"
                disabled={bulkBusy}
                onClick={() => void handleBulkIllustrations()}
              >
                {bulkBusy ? "처리 중…" : "삽화 일괄 생성 ▾"}
              </Button>
              <Button
                type="button"
                size="sm"
                variant="secondary"
                disabled={bulkBusy || translating}
                onClick={() => void handleBulkTranslate()}
              >
                {translating || bulkBusy ? "번역 중…" : "전체 일괄 번역 ▾"}
              </Button>
            </div>
          </div>

          {error ? <Alert variant="error">{error}</Alert> : null}

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <div className="grid gap-4 lg:grid-cols-[1fr_420px]">
              <LessonMaterialLogicalFlow
                cards={wb.analysisCards}
                loading={wb.generatingOrganization && !wb.analysisCards}
                regenerating={wb.generatingOrganization}
                onRegenerate={() => void runOrganizationForIndex(activePassage)}
              />

              <section className="rounded-xl border border-slate-200 bg-white p-4">
                <h3 className="text-sm font-bold text-slate-900">
                  4컷 만화 삽화
                  {multi ? (
                    <span className="ml-2 text-xs font-medium text-slate-500">
                      지문 {activePassage + 1}
                    </span>
                  ) : null}
                </h3>
                <p className="mt-1 text-xs text-slate-500">
                  「삽화 만들기」를 누르면 OpenAI가 한글 말풍선이 들어간 4컷을 그립니다. (최대 약 1~2분)
                </p>
                <div className="mt-3">
                  <LessonMaterialComicFrame
                    imageUrl={wb.illustrationUrl}
                    emptyHint={
                      wb.generatingIllustration
                        ? "4컷 만화를 그리는 중입니다. 최대 1분 정도 걸릴 수 있습니다."
                        : "「삽화 만들기」를 누르면 생성됩니다."
                    }
                  />
                </div>
                {wb.comicCaptions.length > 0 ? (
                  <div className="mt-3 space-y-2">
                    <div className="text-xs font-semibold text-slate-600">
                      말풍선 대사 (수정 후 삽화 만들기)
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      {wb.comicCaptions.map((c, i) => (
                        <input
                          key={i}
                          className="rounded-lg border border-slate-200 px-2 py-1.5 text-xs text-slate-800"
                          value={c}
                          onChange={(e) => {
                            const v = e.target.value;
                            const next = [...wb.comicCaptions];
                            next[i] = v;
                            patchWorkbench(activePassage, {
                              comicCaptions: next,
                            });
                          }}
                          placeholder={`${i + 1}컷 대사`}
                        />
                      ))}
                    </div>
                  </div>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    size="sm"
                    className="bg-brand-600 hover:bg-brand-700"
                    disabled={
                      wb.generatingIllustration ||
                      wb.generatingOrganization ||
                      bulkBusy ||
                      (!wb.illustrationPrompt.trim() &&
                        wb.english.trim().length < 20)
                    }
                    onClick={() =>
                      void runIllustrationForIndex(activePassage, {
                        illustrationPrompt: wb.illustrationPrompt,
                        comicCaptions: wb.comicCaptions,
                      })
                    }
                  >
                    {wb.generatingIllustration
                      ? "생성 중…"
                      : wb.illustrationUrl
                        ? "삽화만 다시 그리기"
                        : "삽화 만들기"}
                  </Button>
                </div>
              </section>
            </div>

            <section className="mt-5 space-y-3">
              {wb.lines.map((p, idx) => {
                const isChecked = wb.selected.includes(idx);
                const isEditing = wb.editingEnglish.includes(idx);
                return (
                  <div
                    key={idx}
                    className="rounded-xl border border-slate-200 bg-white px-4 py-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <span className="rounded-md bg-slate-100 px-2 py-1 text-xs font-bold text-slate-600">
                            {multi
                              ? `지문${activePassage + 1} · 문장 ${idx + 1}`
                              : `문장 ${idx + 1}`}
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
                                const set = new Set(wb.selected);
                                if (set.has(idx)) set.delete(idx);
                                else set.add(idx);
                                patchWorkbench(activePassage, {
                                  selected: [...set],
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
                              const set = new Set(wb.editingEnglish);
                              if (set.has(idx)) set.delete(idx);
                              else set.add(idx);
                              patchWorkbench(activePassage, {
                                editingEnglish: [...set],
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

            <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
              <Button type="button" variant="ghost" onClick={resetToStep1}>
                ← 이전 단계
              </Button>
              <Button
                type="button"
                variant="primary"
                disabled={
                  saving ||
                  bulkBusy ||
                  translating ||
                  workbenches.every((b) => b.selected.length === 0)
                }
                onClick={() => void handleSave()}
                className="min-w-[220px]"
              >
                {saving ? "저장 중…" : "자료 저장 완료 →"}
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <div className="mx-auto max-w-6xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-bold text-slate-900">저장 완료</h2>
          <p className="mt-2 text-sm text-slate-600">
            {savedProjectIds.length > 1
              ? `지문 ${savedProjectIds.length}개를 각각 프로젝트로 저장했습니다.`
              : "한줄해석으로 나눠 저장했습니다. 자료함에서 확인할 수 있습니다."}{" "}
            (문장 {savedItemsCount}개)
          </p>
          {error ? <Alert variant="error" className="mt-4">{error}</Alert> : null}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-3">
            <Button type="button" variant="ghost" onClick={resetToStep1}>
              다시 입력
            </Button>
            <Link
              href={
                role === "admin"
                  ? "/admin/lesson-materials"
                  : "/teacher/lesson-materials"
              }
              className="inline-flex items-center justify-center rounded-lg bg-brand-600 px-4 py-2 text-sm font-bold text-white hover:bg-brand-700"
            >
              자료함으로 이동
            </Link>
          </div>

          {savedProjectId ? (
            <div className="mt-3 flex flex-wrap gap-2">
              {savedProjectIds.map((id, i) => (
                <Link
                  key={id}
                  href={
                    role === "admin"
                      ? `/admin/lesson-materials/project/${id}`
                      : `/teacher/lesson-materials/project/${id}`
                  }
                  className="inline-flex items-center justify-center rounded-xl bg-slate-900 px-4 py-2 text-sm font-bold text-white hover:bg-slate-800"
                >
                  {savedProjectIds.length > 1
                    ? `지문 ${i + 1} 프로젝트 열기 →`
                    : "프로젝트 열기 →"}
                </Link>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
