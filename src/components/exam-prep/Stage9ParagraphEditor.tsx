"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getStage9PassageStatsAction,
  saveStage9ConfigAction,
  setStage9PublishedAction,
} from "@/lib/exam-prep/stage9-staff-actions";
import {
  STAGE9_DEFAULT_THRESHOLDS,
  STAGE9_ROLE_LABELS,
  collectStage9Warnings,
  labelForIndex,
  mergeBlocks,
  renderBlockText,
  splitBlockAt,
  validateStage9Blocks,
  type ExamStage9Block,
  type Stage9AnswerMode,
  type Stage9BlockDraft,
  type Stage9TeacherRole,
} from "@/lib/exam-prep/stage9-types";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

type LocalBlock = Stage9BlockDraft & { localKey: string };

function toLocal(rows: ExamStage9Block[]): LocalBlock[] {
  return rows.map((b) => ({
    localKey: b.id,
    id: b.id,
    sentence_ids: b.sentence_ids,
    blank_order: b.blank_order,
    display_label: b.display_label,
    teacher_role: b.teacher_role,
    cohesion_clues: b.cohesion_clues,
    hint: b.hint,
    explanation: b.explanation,
    is_required: b.is_required,
  }));
}

export function Stage9ParagraphEditor({
  passageId,
  sentences,
  initialBlocks,
  initiallyPublished,
  initialFixedPrefix = "",
  initialFixedSuffix = "",
  initialAnswerMode = "label_sequence",
  initialStructureHint = "",
}: {
  passageId: string;
  sentences: ExamPassageSentence[];
  initialBlocks: ExamStage9Block[];
  initiallyPublished: boolean;
  initialFixedPrefix?: string;
  initialFixedSuffix?: string;
  initialAnswerMode?: Stage9AnswerMode;
  initialStructureHint?: string | null;
}) {
  const ordered = useMemo(
    () => [...sentences].sort((a, b) => a.sentence_order - b.sentence_order),
    [sentences]
  );
  const orderedIds = useMemo(() => ordered.map((s) => s.id), [ordered]);
  const englishById = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of ordered) m.set(s.id, s.english_text ?? "");
    return m;
  }, [ordered]);

  const [blocks, setBlocks] = useState(() => toLocal(initialBlocks));
  const [selectedSentenceIds, setSelectedSentenceIds] = useState<string[]>([]);
  const [selectedBlockKeys, setSelectedBlockKeys] = useState<string[]>([]);
  const [fixedPrefix, setFixedPrefix] = useState(initialFixedPrefix);
  const [fixedSuffix, setFixedSuffix] = useState(initialFixedSuffix);
  const [answerMode, setAnswerMode] =
    useState<Stage9AnswerMode>(initialAnswerMode);
  const [structureHint, setStructureHint] = useState(
    initialStructureHint ?? ""
  );
  const [published, setPublished] = useState(initiallyPublished);
  const [preview, setPreview] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [stats, setStats] = useState<Awaited<
    ReturnType<typeof getStage9PassageStatsAction>
  > | null>(null);

  useEffect(() => {
    setBlocks(toLocal(initialBlocks));
  }, [initialBlocks]);

  const warnings = useMemo(() => {
    const issues: string[] = [];
    const err = validateStage9Blocks(orderedIds, blocks);
    if (err) issues.push(err);
    issues.push(
      ...collectStage9Warnings(orderedIds, blocks, { fixedPrefix, fixedSuffix })
    );
    return [...new Set(issues)];
  }, [orderedIds, blocks, fixedPrefix, fixedSuffix]);

  function toggleSentence(id: string) {
    setSelectedSentenceIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function createBlockFromSelection() {
    if (selectedSentenceIds.length < 1) {
      setMessage("연속된 문장을 선택한 뒤 블록으로 묶으세요.");
      return;
    }
    const used = new Set(blocks.flatMap((b) => b.sentence_ids));
    if (selectedSentenceIds.some((id) => used.has(id))) {
      setMessage("이미 다른 블록에 포함된 문장이 있습니다.");
      return;
    }
    if (!selectedSentenceIds.every((id) => orderedIds.includes(id))) {
      setMessage("존재하지 않는 문장입니다.");
      return;
    }
    const sorted = [...selectedSentenceIds].sort(
      (a, b) => orderedIds.indexOf(a) - orderedIds.indexOf(b)
    );
    const positions = sorted.map((id) => orderedIds.indexOf(id));
    for (let i = 1; i < positions.length; i++) {
      if (positions[i] !== positions[i - 1]! + 1) {
        setMessage(
          "하나의 문단 블록에는 원문에서 연속된 문장만 포함할 수 있습니다."
        );
        return;
      }
    }
    setBlocks((prev) => [
      ...prev,
      {
        localKey: `new-${Date.now()}`,
        sentence_ids: sorted,
        blank_order: prev.length + 1,
        display_label: labelForIndex(prev.length),
        teacher_role: null,
        cohesion_clues: [],
        is_required: true,
      },
    ]);
    setSelectedSentenceIds([]);
    setMessage("문단 블록을 추가했습니다. 정답 순서는 원문 순서로 맞추세요.");
  }

  function removeBlock(localKey: string) {
    setBlocks((prev) =>
      prev
        .filter((b) => b.localKey !== localKey)
        .map((b, i) => ({ ...b, blank_order: i + 1 }))
    );
  }

  function reorderBlocksByDocument() {
    setBlocks((prev) => {
      const sorted = [...prev].sort((a, b) => {
        const ai = orderedIds.indexOf(a.sentence_ids[0] ?? "");
        const bi = orderedIds.indexOf(b.sentence_ids[0] ?? "");
        return ai - bi;
      });
      return sorted.map((b, i) => ({ ...b, blank_order: i + 1 }));
    });
  }

  function applyMerge() {
    const indices = selectedBlockKeys
      .map((k) => blocks.findIndex((b) => b.localKey === k))
      .filter((i) => i >= 0)
      .sort((a, b) => a - b);
    try {
      const next = mergeBlocks(blocks, indices).map((b, i) => ({
        ...(b as LocalBlock),
        localKey: (b as LocalBlock).localKey ?? `m-${i}-${Date.now()}`,
        blank_order: i + 1,
      }));
      setBlocks(next);
      setSelectedBlockKeys([]);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "합치기 실패");
    }
  }

  function applySplit(localKey: string, after: number) {
    const idx = blocks.findIndex((b) => b.localKey === localKey);
    if (idx < 0) return;
    const next = splitBlockAt(blocks, idx, after).map((b, i) => ({
      ...(b as LocalBlock),
      localKey: (b as LocalBlock).localKey ?? `s-${i}-${Date.now()}`,
      blank_order: i + 1,
    }));
    setBlocks(next);
  }

  async function handleSave(reshuffleLabels = true) {
    setLoading(true);
    setMessage(null);
    reorderBlocksByDocument();
    const drafts = [...blocks]
      .sort((a, b) => {
        const ai = orderedIds.indexOf(a.sentence_ids[0] ?? "");
        const bi = orderedIds.indexOf(b.sentence_ids[0] ?? "");
        return ai - bi;
      })
      .map((b, i) => ({
        id: b.id,
        sentence_ids: b.sentence_ids,
        blank_order: i + 1,
        display_label: b.display_label,
        teacher_role: b.teacher_role,
        cohesion_clues: b.cohesion_clues,
        hint: b.hint,
        explanation: b.explanation,
        is_required: b.is_required ?? true,
      }));
    const result = await saveStage9ConfigAction(
      passageId,
      {
        fixedPrefix,
        fixedSuffix,
        answerMode,
        structureHint,
        blocks: drafts,
      },
      { reshuffleLabels }
    );
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    if (result.learningStudentsWarning) {
      setMessage(
        `저장했습니다 (${result.count}개). 라벨: ${result.labels?.join(", ")}. 현재 9단계를 학습 중인 학생이 있을 수 있습니다.`
      );
    } else {
      setMessage(
        `저장했습니다 (${result.count}개). 표시 라벨: ${result.labels?.join(" / ")}`
      );
    }
  }

  async function handlePublish(next: boolean) {
    setLoading(true);
    const result = await setStage9PublishedAction(passageId, next);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setPublished(next);
    setMessage(next ? "9단계를 공개했습니다." : "9단계를 비공개로 변경했습니다.");
  }

  const correctOrderLabels = [...blocks]
    .sort((a, b) => a.blank_order - b.blank_order)
    .map((b) => b.display_label || "?");

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            9단계 · 문단 배열하기
          </h2>
          <p className="text-sm text-slate-500">
            연속 문장을 문단 블록으로 묶고 A·B·C 라벨을 설정합니다. 우리말 해석은
            학생에게 기본 제공하지 않습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={loading} onClick={() => void handleSave(true)}>
            저장 (라벨 섞기)
          </Button>
          <Button
            type="button"
            disabled={loading}
            onClick={() => void handlePublish(!published)}
          >
            {published ? "비공개" : "공개"}
          </Button>
          <Button type="button" onClick={() => setPreview((p) => !p)}>
            {preview ? "편집 보기" : "학생 미리보기"}
          </Button>
          <Button
            type="button"
            onClick={() => void getStage9PassageStatsAction(passageId).then(setStats)}
          >
            결과 통계
          </Button>
        </div>
      </div>

      {message && (
        <p className="mb-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      )}
      {published && (
        <p className="mb-3 text-sm text-amber-800">
          공개된 상태입니다. 문단 구성이나 라벨을 변경하면 학습 중 학생 진행에
          영향을 줄 수 있습니다.
        </p>
      )}
      {warnings.length > 0 && (
        <ul className="mb-3 list-disc space-y-1 rounded-lg border border-amber-200 bg-amber-50 px-5 py-2 text-sm text-amber-900">
          {warnings.slice(0, 10).map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      <div className="mb-3 grid gap-3 md:grid-cols-2">
        <label className="block text-xs">
          고정 도입부
          <textarea
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
            rows={2}
            value={fixedPrefix}
            onChange={(e) => setFixedPrefix(e.target.value)}
          />
        </label>
        <label className="block text-xs">
          고정 마무리
          <textarea
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
            rows={2}
            value={fixedSuffix}
            onChange={(e) => setFixedSuffix(e.target.value)}
          />
        </label>
        <label className="block text-xs">
          답안 방식
          <select
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
            value={answerMode}
            onChange={(e) =>
              setAnswerMode(e.target.value as Stage9AnswerMode)
            }
          >
            <option value="label_sequence">라벨 선택 (권장)</option>
            <option value="drag_blocks">문단 드래그/이동</option>
          </select>
        </label>
        <label className="block text-xs">
          전체 구조 힌트
          <input
            className="mt-1 w-full rounded border px-2 py-1 text-sm"
            value={structureHint}
            onChange={(e) => setStructureHint(e.target.value)}
          />
        </label>
      </div>

      <div className="mb-3">
        <p className="mb-1 text-xs font-medium text-slate-500">
          원문 문장 (연속 선택 후 블록 생성)
        </p>
        <div className="space-y-1">
          {ordered.map((s) => {
            const used = blocks.some((b) => b.sentence_ids.includes(s.id));
            const on = selectedSentenceIds.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                disabled={used}
                onClick={() => toggleSentence(s.id)}
                className={`block w-full rounded border px-2 py-1.5 text-left text-sm ${
                  used
                    ? "border-slate-100 bg-slate-50 text-slate-400"
                    : on
                      ? "border-brand-400 bg-brand-50"
                      : "border-slate-200 bg-white"
                }`}
              >
                <span className="mr-2 text-xs text-slate-500">
                  {s.sentence_order}.
                </span>
                {s.english_text}
              </button>
            );
          })}
        </div>
        <div className="mt-2 flex flex-wrap gap-2">
          <Button type="button" onClick={createBlockFromSelection}>
            선택 문장 묶기
          </Button>
          <Button type="button" onClick={reorderBlocksByDocument}>
            정답 순서를 원문 순서로
          </Button>
          <Button type="button" onClick={applyMerge}>
            선택 블록 합치기
          </Button>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-xs font-medium text-slate-500">
          배열 블록 ({blocks.length}개)
          {blocks.length >= STAGE9_DEFAULT_THRESHOLDS.warnBlockCount &&
            " · 블록이 많습니다"}
        </p>
        {[...blocks]
          .sort((a, b) => a.blank_order - b.blank_order)
          .map((b) => {
            const on = selectedBlockKeys.includes(b.localKey);
            return (
              <div
                key={b.localKey}
                className={`rounded-lg border p-3 ${
                  on ? "border-brand-400" : "border-slate-200"
                }`}
              >
                <div className="mb-2 flex flex-wrap items-center gap-2">
                  <button
                    type="button"
                    className="rounded border px-2 py-0.5 text-xs"
                    onClick={() =>
                      setSelectedBlockKeys((prev) =>
                        prev.includes(b.localKey)
                          ? prev.filter((k) => k !== b.localKey)
                          : [...prev, b.localKey]
                      )
                    }
                  >
                    선택
                  </button>
                  <span className="text-sm font-semibold">
                    ({b.display_label || "?"}) · 정답 위치 {b.blank_order}
                  </span>
                  <select
                    className="rounded border px-1 py-0.5 text-xs"
                    value={b.teacher_role ?? ""}
                    onChange={(e) =>
                      setBlocks((prev) =>
                        prev.map((x) =>
                          x.localKey === b.localKey
                            ? {
                                ...x,
                                teacher_role: (e.target.value ||
                                  null) as Stage9TeacherRole | null,
                              }
                            : x
                        )
                      )
                    }
                  >
                    <option value="">역할(비공개)</option>
                    {Object.entries(STAGE9_ROLE_LABELS).map(([k, v]) => (
                      <option key={k} value={k}>
                        {v}
                      </option>
                    ))}
                  </select>
                  <Button
                    type="button"
                    onClick={() =>
                      applySplit(
                        b.localKey,
                        Math.max(1, Math.floor(b.sentence_ids.length / 2))
                      )
                    }
                  >
                    블록 나누기
                  </Button>
                  <button
                    type="button"
                    className="text-xs text-red-600"
                    onClick={() => removeBlock(b.localKey)}
                  >
                    해제
                  </button>
                </div>
                <p className="text-sm text-slate-800">
                  {renderBlockText(b.sentence_ids, englishById)}
                </p>
                <p className="mt-1 text-xs text-slate-500">
                  문장 {b.sentence_ids.length}개
                </p>
              </div>
            );
          })}
      </div>

      {preview && (
        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="mb-2 font-medium">학생 미리보기</p>
          {fixedPrefix && (
            <p className="mb-3 whitespace-pre-wrap text-slate-700">
              {fixedPrefix}
            </p>
          )}
          {[...blocks]
            .sort((a, b) =>
              String(a.display_label).localeCompare(String(b.display_label))
            )
            .map((b) => (
              <div key={b.localKey} className="mb-3 rounded border bg-white p-2">
                <p className="mb-1 text-xs font-semibold">({b.display_label})</p>
                <p className="whitespace-pre-wrap">
                  {renderBlockText(b.sentence_ids, englishById)}
                </p>
              </div>
            ))}
          {fixedSuffix && (
            <p className="mt-3 whitespace-pre-wrap text-slate-700">
              {fixedSuffix}
            </p>
          )}
          <p className="mt-2 text-xs text-emerald-800">
            정답 순서(강사만): {correctOrderLabels.join(" → ")}
          </p>
        </div>
      )}

      {stats && stats.ok && (
        <div className="mt-4 rounded-lg border p-3 text-sm">
          <p className="font-medium">9단계 결과 요약</p>
          <p className="mt-1 text-slate-600">
            학생 {stats.studentCount} · 완료 {stats.completedStudents} · 평균
            점수 {stats.avgScore} · 평균 시도 {stats.avgAttempts} · 첫시도
            정답률 {stats.firstTryCorrectRate}% · 힌트 {stats.hintUsers} ·
            정답확인 {stats.revealUsers}
          </p>
          <p className="mt-1 text-xs text-slate-500">
            정답 라벨: {stats.correctLabelOrder.join(" → ")}
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            {stats.topWrongSequences.map((w) => (
              <li key={w.sequence}>
                오답 순서 {w.sequence} ({w.count}회)
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
