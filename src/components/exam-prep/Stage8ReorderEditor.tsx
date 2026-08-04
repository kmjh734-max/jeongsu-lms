"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getStage8PassageStatsAction,
  saveStage8GroupsAction,
  setStage8PublishedAction,
} from "@/lib/exam-prep/stage8-staff-actions";
import {
  STAGE8_DEFAULT_THRESHOLDS,
  buildSentenceLayout,
  collectStage8Warnings,
  joinChunkTexts,
  mergeChunks,
  newChunkId,
  parseReorderChunks,
  proposeChunksFromText,
  splitChunkAt,
  validateStage8GroupAgainstText,
  type ExamStage8Group,
  type Stage8GroupDraft,
} from "@/lib/exam-prep/stage8-types";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

type LocalGroup = Stage8GroupDraft & { localKey: string };

function toLocal(rows: ExamStage8Group[]): LocalGroup[] {
  return rows.map((g) => ({
    localKey: g.id,
    id: g.id,
    sentence_id: g.sentence_id,
    blank_order: g.blank_order,
    english_start: g.english_start,
    english_end: g.english_end,
    original_text: g.selected_text || g.answer_text,
    chunks: parseReorderChunks(g.reorder_chunks),
    hint: g.hint,
    explanation: g.explanation,
    is_required: g.is_required,
  }));
}

export function Stage8ReorderEditor({
  passageId,
  sentences,
  initialGroups,
  initiallyPublished,
}: {
  passageId: string;
  sentences: ExamPassageSentence[];
  initialGroups: ExamStage8Group[];
  initiallyPublished: boolean;
}) {
  const ordered = useMemo(
    () => [...sentences].sort((a, b) => a.sentence_order - b.sentence_order),
    [sentences]
  );
  const [groups, setGroups] = useState(() => toLocal(initialGroups));
  const [published, setPublished] = useState(initiallyPublished);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [activeSentenceId, setActiveSentenceId] = useState(ordered[0]?.id ?? "");
  const [selectedChunkIdx, setSelectedChunkIdx] = useState<number[]>([]);
  const [editingGroupKey, setEditingGroupKey] = useState<string | null>(null);
  const [splitAt, setSplitAt] = useState(0);
  const [stats, setStats] = useState<Awaited<
    ReturnType<typeof getStage8PassageStatsAction>
  > | null>(null);
  const englishRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    setGroups(toLocal(initialGroups));
  }, [initialGroups]);

  const activeSentence = ordered.find((s) => s.id === activeSentenceId);
  const sentenceGroups = groups
    .filter((g) => g.sentence_id === activeSentenceId)
    .sort((a, b) => a.english_start - b.english_start);

  const englishBySentence = useMemo(() => {
    const m = new Map<string, string>();
    for (const s of ordered) m.set(s.id, s.english_text ?? "");
    return m;
  }, [ordered]);

  const validationIssues = useMemo(() => {
    const issues: string[] = [];
    for (const s of ordered) {
      const english = s.english_text ?? "";
      const list = groups.filter((g) => g.sentence_id === s.id);
      for (const g of list) {
        const err = validateStage8GroupAgainstText(english, g);
        if (err) issues.push(`${s.sentence_order}번: ${err}`);
      }
    }
    issues.push(
      ...collectStage8Warnings(englishBySentence, groups).map((w) => w)
    );
    return [...new Set(issues)];
  }, [ordered, groups, englishBySentence]);

  function getSelectionOffsets(): { start: number; end: number; text: string } | null {
    const el = englishRef.current;
    if (!el || !activeSentence) return null;
    const sel = window.getSelection();
    if (!sel || sel.rangeCount === 0 || !sel.toString()) return null;
    const range = sel.getRangeAt(0);
    if (!el.contains(range.commonAncestorContainer)) return null;
    const pre = document.createRange();
    pre.selectNodeContents(el);
    pre.setEnd(range.startContainer, range.startOffset);
    const start = pre.toString().length;
    const text = sel.toString();
    const end = start + text.length;
    return { start, end, text };
  }

  function addGroupFromSelection() {
    const sel = getSelectionOffsets();
    if (!sel || !activeSentence) {
      setMessage("영어 원문에서 배열할 범위를 선택한 뒤 지정하세요.");
      return;
    }
    const english = activeSentence.english_text ?? "";
    if (english.slice(sel.start, sel.end) !== sel.text) {
      setMessage("선택 범위가 원문과 일치하지 않습니다.");
      return;
    }
    const overlap = sentenceGroups.some(
      (g) => !(sel.end <= g.english_start || sel.start >= g.english_end)
    );
    if (overlap) {
      setMessage("기존 배열 구간과 범위가 겹칩니다.");
      return;
    }
    const proposed = proposeChunksFromText(sel.text);
    if (proposed.length < 2) {
      setMessage("카드가 2개 이상 되도록 더 긴 범위를 선택하세요.");
      return;
    }
    const localKey = `new-${Date.now()}`;
    setGroups((prev) => [
      ...prev,
      {
        localKey,
        sentence_id: activeSentence.id,
        blank_order: prev.filter((g) => g.sentence_id === activeSentence.id)
          .length + 1,
        english_start: sel.start,
        english_end: sel.end,
        original_text: sel.text,
        chunks: proposed,
        is_required: true,
        hint: null,
        explanation: null,
      },
    ]);
    setEditingGroupKey(localKey);
    setMessage(
      "배열 구간이 추가되었습니다. 카드를 합치거나 나눈 뒤 저장하세요."
    );
  }

  function updateGroup(localKey: string, patch: Partial<LocalGroup>) {
    setGroups((prev) =>
      prev.map((g) => (g.localKey === localKey ? { ...g, ...patch } : g))
    );
  }

  function removeGroup(localKey: string) {
    setGroups((prev) => prev.filter((g) => g.localKey !== localKey));
    if (editingGroupKey === localKey) setEditingGroupKey(null);
  }

  function applyMerge(localKey: string) {
    const g = groups.find((x) => x.localKey === localKey);
    if (!g || selectedChunkIdx.length < 2) {
      setMessage("합칠 인접 카드를 2개 이상 선택하세요.");
      return;
    }
    try {
      const next = mergeChunks(g.chunks, selectedChunkIdx);
      updateGroup(localKey, { chunks: next });
      setSelectedChunkIdx([]);
    } catch (e) {
      setMessage(e instanceof Error ? e.message : "합치기에 실패했습니다.");
    }
  }

  function applySplit(localKey: string) {
    const g = groups.find((x) => x.localKey === localKey);
    if (!g || selectedChunkIdx.length !== 1) {
      setMessage("나눌 카드 하나를 선택하세요.");
      return;
    }
    const idx = selectedChunkIdx[0]!;
    const next = splitChunkAt(g.chunks, idx, splitAt);
    updateGroup(localKey, { chunks: next });
    setSelectedChunkIdx([]);
  }

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    const drafts: Stage8GroupDraft[] = groups.map((g, i) => ({
      id: g.id,
      sentence_id: g.sentence_id,
      blank_order: i + 1,
      english_start: g.english_start,
      english_end: g.english_end,
      original_text: g.original_text,
      chunks: g.chunks.map((c, idx) => ({
        ...c,
        chunkOrder: idx + 1,
        id: c.id || newChunkId(),
      })),
      hint: g.hint,
      explanation: g.explanation,
      is_required: g.is_required ?? true,
    }));
    const result = await saveStage8GroupsAction(passageId, drafts);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(
      `저장했습니다 (${result.count}개).${
        result.warnings?.length
          ? ` 경고: ${result.warnings.slice(0, 3).join(" / ")}`
          : ""
      }`
    );
  }

  async function handlePublish(next: boolean) {
    setLoading(true);
    setMessage(null);
    const result = await setStage8PublishedAction(passageId, next);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setPublished(next);
    setMessage(next ? "8단계를 공개했습니다." : "8단계를 비공개로 변경했습니다.");
  }

  async function loadStats() {
    const result = await getStage8PassageStatsAction(passageId);
    setStats(result);
  }

  const editing = groups.find((g) => g.localKey === editingGroupKey);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            8단계 · 순서 배열하기
          </h2>
          <p className="text-sm text-slate-500">
            원문에서 배열 범위를 지정하고 카드를 합치거나 나눕니다. 방해 선택지는
            추가하지 않습니다.
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="button" disabled={loading} onClick={() => void handleSave()}>
            저장
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
          <Button type="button" onClick={() => void loadStats()}>
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
          공개된 상태입니다. 카드 구성을 바꾸면 학습 중인 학생 진행에 영향을 줄 수
          있습니다.
        </p>
      )}

      {validationIssues.length > 0 && (
        <ul className="mb-3 list-disc space-y-1 rounded-lg border border-amber-200 bg-amber-50 px-5 py-2 text-sm text-amber-900">
          {validationIssues.slice(0, 12).map((w) => (
            <li key={w}>{w}</li>
          ))}
        </ul>
      )}

      <div className="mb-3 flex flex-wrap gap-2">
        {ordered.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => {
              setActiveSentenceId(s.id);
              setEditingGroupKey(null);
              setSelectedChunkIdx([]);
            }}
            className={`rounded-lg border px-3 py-1 text-sm ${
              activeSentenceId === s.id
                ? "border-brand-500 bg-brand-50 text-brand-900"
                : "border-slate-200 bg-white"
            }`}
          >
            {s.sentence_order}번
          </button>
        ))}
      </div>

      {activeSentence && (
        <div className="space-y-3">
          <div>
            <p className="text-xs font-medium text-slate-500">우리말</p>
            <p className="text-sm text-slate-800">
              {activeSentence.korean_text || "(해석 없음)"}
            </p>
          </div>
          <div>
            <p className="mb-1 text-xs font-medium text-slate-500">
              영어 원문 (드래그로 범위 선택)
            </p>
            <p
              ref={englishRef}
              className="rounded-lg border border-slate-200 bg-slate-50 p-3 text-sm leading-relaxed text-slate-900"
            >
              {activeSentence.english_text}
            </p>
            <div className="mt-2">
              <Button type="button" onClick={addGroupFromSelection}>
                배열 구간으로 지정
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            {sentenceGroups.map((g) => {
              const layout = buildSentenceLayout(
                activeSentence.english_text ?? "",
                sentenceGroups.map((x) => ({
                  id: x.localKey,
                  english_start: x.english_start,
                  english_end: x.english_end,
                }))
              );
              return (
                <div
                  key={g.localKey}
                  className={`rounded-lg border p-3 ${
                    editingGroupKey === g.localKey
                      ? "border-brand-400"
                      : "border-slate-200"
                  }`}
                >
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <button
                      type="button"
                      className="text-left text-sm font-medium text-slate-900"
                      onClick={() => {
                        setEditingGroupKey(g.localKey);
                        setSelectedChunkIdx([]);
                      }}
                    >
                      [{g.english_start},{g.english_end}) 「{g.original_text}」
                    </button>
                    <div className="flex items-center gap-2 text-xs">
                      <label className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={g.is_required !== false}
                          onChange={(e) =>
                            updateGroup(g.localKey, {
                              is_required: e.target.checked,
                            })
                          }
                        />
                        필수
                      </label>
                      <button
                        type="button"
                        className="text-red-600"
                        onClick={() => removeGroup(g.localKey)}
                      >
                        삭제
                      </button>
                    </div>
                  </div>
                  <p className="mb-2 text-xs text-slate-500">
                    카드:{" "}
                    {g.chunks.map((c) => c.chunkText).join(" / ")}
                    {g.chunks.length >=
                      STAGE8_DEFAULT_THRESHOLDS.warnChunkCount && (
                      <span className="text-amber-700">
                        {" "}
                        (카드 {g.chunks.length}개 — 모바일 주의)
                      </span>
                    )}
                  </p>
                  {preview && (
                    <div className="rounded bg-white p-2 text-sm">
                      {layout.map((seg, i) =>
                        seg.type === "fixed" ? (
                          <span key={`f-${i}`}>{seg.text}</span>
                        ) : seg.groupId === g.localKey ? (
                          <span
                            key={seg.groupId}
                            className="mx-0.5 inline-flex flex-wrap gap-1 rounded border border-dashed border-brand-300 bg-brand-50 px-1"
                          >
                            {[...g.chunks]
                              .sort(() => Math.random() - 0.5)
                              .map((c) => (
                                <span
                                  key={c.id}
                                  className="rounded border bg-white px-1.5 py-0.5 text-xs"
                                >
                                  {c.chunkText}
                                </span>
                              ))}
                          </span>
                        ) : (
                          <span
                            key={seg.groupId}
                            className="mx-0.5 inline-block rounded bg-slate-100 px-2 text-xs text-slate-400"
                          >
                            …
                          </span>
                        )
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {editing && (
            <div className="rounded-lg border border-brand-200 bg-brand-50/40 p-3">
              <p className="mb-2 text-sm font-medium">카드 편집</p>
              <div className="mb-2 flex flex-wrap gap-2">
                {editing.chunks.map((c, idx) => {
                  const on = selectedChunkIdx.includes(idx);
                  return (
                    <button
                      key={c.id}
                      type="button"
                      onClick={() => {
                        setSelectedChunkIdx((prev) =>
                          prev.includes(idx)
                            ? prev.filter((i) => i !== idx)
                            : [...prev, idx].sort((a, b) => a - b)
                        );
                        setSplitAt(Math.floor(c.chunkText.length / 2));
                      }}
                      className={`rounded-lg border px-2 py-1 text-sm ${
                        on
                          ? "border-brand-500 bg-white ring-2 ring-brand-300"
                          : "border-slate-300 bg-white"
                      }`}
                    >
                      {c.chunkText}
                    </button>
                  );
                })}
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  onClick={() => applyMerge(editing.localKey)}
                >
                  선택 카드 합치기
                </Button>
                <label className="flex items-center gap-1 text-xs">
                  나누기 위치
                  <input
                    type="number"
                    min={1}
                    className="w-16 rounded border px-1 py-0.5"
                    value={splitAt}
                    onChange={(e) => setSplitAt(Number(e.target.value) || 0)}
                  />
                </label>
                <Button
                  type="button"
                  onClick={() => applySplit(editing.localKey)}
                >
                  이 위치에서 나누기
                </Button>
                <Button
                  type="button"
                  onClick={() =>
                    updateGroup(editing.localKey, {
                      chunks: proposeChunksFromText(editing.original_text),
                    })
                  }
                >
                  공백 기준 다시 제안
                </Button>
              </div>
              <p className="mt-2 text-xs text-slate-600">
                합친 결과 확인:{" "}
                {joinChunkTexts(editing.chunks.map((c) => c.chunkText))}
              </p>
              <label className="mt-2 block text-xs">
                힌트 (선택)
                <input
                  className="mt-1 w-full rounded border px-2 py-1 text-sm"
                  value={editing.hint ?? ""}
                  onChange={(e) =>
                    updateGroup(editing.localKey, { hint: e.target.value })
                  }
                />
              </label>
            </div>
          )}
        </div>
      )}

      {stats && stats.ok && (
        <div className="mt-4 rounded-lg border border-slate-200 p-3 text-sm">
          <p className="font-medium">8단계 결과 요약</p>
          <p className="mt-1 text-slate-600">
            학생 {stats.studentCount}명 · 완료 {stats.completedStudents}명 · 평균
            점수 {stats.avgScore} · 평균 시도 {stats.avgAttempts}
          </p>
          <ul className="mt-2 space-y-1 text-xs text-slate-700">
            {stats.byGroup.slice(0, 8).map((g) => (
              <li key={g.groupId}>
                「{g.label}」 오답 {g.incorrect} / 정답 {g.correct} · 힌트{" "}
                {g.hint} · 정답확인 {g.revealed}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
