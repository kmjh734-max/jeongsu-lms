"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  getStage10PassageStatsAction,
  saveStage10ItemsAction,
  setStage10PublishedAction,
} from "@/lib/exam-prep/stage10-staff-actions";
import {
  newCueId,
  proposeFullSentenceSegments,
  splitRangeIntoSegments,
  tokenizeAnswerText,
  type ExamStage10Item,
  type Stage10BlankDisplayMode,
  type Stage10Cue,
  type Stage10InputMode,
  type Stage10ItemDraft,
  type Stage10Segment,
} from "@/lib/exam-prep/stage10-types";
import type { ExamPassageSentence } from "@/lib/exam-prep/types";

type LocalItem = Stage10ItemDraft & { localKey: string };

function toLocal(rows: ExamStage10Item[]): LocalItem[] {
  return rows.map((r) => ({
    localKey: r.id,
    id: r.id,
    blank_order: r.blank_order,
    sentence_ids: r.sentence_ids,
    korean_prompt: r.selected_text,
    full_english: r.answer_text,
    writing_segments: r.writing_segments,
    writing_cues: r.writing_cues,
    writing_input_mode: r.writing_input_mode,
    writing_blank_display_mode: r.writing_blank_display_mode,
    accepted_answers: r.accepted_answers,
    hint: r.hint,
    explanation: r.explanation,
    is_required: r.is_required,
  }));
}

export function Stage10WritingEditor({
  passageId,
  sentences,
  initialItems,
  initiallyPublished,
}: {
  passageId: string;
  sentences: ExamPassageSentence[];
  initialItems: ExamStage10Item[];
  initiallyPublished: boolean;
}) {
  const ordered = useMemo(
    () => [...sentences].sort((a, b) => a.sentence_order - b.sentence_order),
    [sentences]
  );
  const [items, setItems] = useState(() => toLocal(initialItems));
  const [published, setPublished] = useState(initiallyPublished);
  const [selectedSentenceIds, setSelectedSentenceIds] = useState<string[]>([]);
  const [activeKey, setActiveKey] = useState<string | null>(null);
  const [rangeStart, setRangeStart] = useState(0);
  const [rangeEnd, setRangeEnd] = useState(0);
  const [cueDraft, setCueDraft] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [preview, setPreview] = useState(false);
  const [stats, setStats] = useState<Awaited<
    ReturnType<typeof getStage10PassageStatsAction>
  > | null>(null);

  useEffect(() => {
    setItems(toLocal(initialItems));
  }, [initialItems]);

  const active = items.find((i) => i.localKey === activeKey);

  function addItemFromSentences() {
    if (selectedSentenceIds.length < 1) {
      setMessage("문장을 선택한 뒤 문항을 추가하세요.");
      return;
    }
    const sorted = [...selectedSentenceIds].sort(
      (a, b) =>
        ordered.findIndex((s) => s.id === a) -
        ordered.findIndex((s) => s.id === b)
    );
    const idxs = sorted.map((id) => ordered.findIndex((s) => s.id === id));
    for (let i = 1; i < idxs.length; i++) {
      if (idxs[i] !== idxs[i - 1]! + 1) {
        setMessage("연속된 문장만 하나의 문항으로 묶을 수 있습니다.");
        return;
      }
    }
    const english = sorted
      .map((id) => ordered.find((s) => s.id === id)?.english_text ?? "")
      .join(" ");
    const korean = sorted
      .map((id) => ordered.find((s) => s.id === id)?.korean_text ?? "")
      .filter(Boolean)
      .join(" ");
    const localKey = `new-${Date.now()}`;
    setItems((prev) => [
      ...prev,
      {
        localKey,
        blank_order: prev.length + 1,
        sentence_ids: sorted,
        korean_prompt: korean,
        full_english: english,
        writing_segments: proposeFullSentenceSegments(english),
        writing_cues: [],
        writing_input_mode: "guided_segments",
        writing_blank_display_mode: "token_slots",
        is_required: true,
      },
    ]);
    setActiveKey(localKey);
    setSelectedSentenceIds([]);
    setRangeEnd(english.length);
    setMessage("문항을 추가했습니다. 제시어와 영작 구간을 설정하세요.");
  }

  function updateActive(patch: Partial<LocalItem>) {
    if (!activeKey) return;
    setItems((prev) =>
      prev.map((i) => (i.localKey === activeKey ? { ...i, ...patch } : i))
    );
  }

  function applyAnswerRange() {
    if (!active) return;
    const english = active.full_english || "";
    if (rangeStart < 0 || rangeEnd <= rangeStart || rangeEnd > english.length) {
      setMessage("영작 범위가 올바르지 않습니다.");
      return;
    }
    updateActive({
      writing_segments: splitRangeIntoSegments(english, rangeStart, rangeEnd),
    });
  }

  function addCue() {
    const text = cueDraft.trim();
    if (!text || !active) return;
    const cues: Stage10Cue[] = [
      ...active.writing_cues,
      {
        id: newCueId(),
        cueOrder: active.writing_cues.length + 1,
        cueText: text,
      },
    ];
    updateActive({ writing_cues: cues });
    setCueDraft("");
  }

  async function handleSave() {
    setLoading(true);
    setMessage(null);
    const drafts: Stage10ItemDraft[] = items.map((i, idx) => ({
      id: i.id,
      blank_order: idx + 1,
      sentence_ids: i.sentence_ids,
      korean_prompt: i.korean_prompt,
      full_english: i.full_english,
      writing_segments: i.writing_segments,
      writing_cues: i.writing_cues,
      writing_input_mode: i.writing_input_mode,
      writing_blank_display_mode: i.writing_blank_display_mode,
      accepted_answers: i.accepted_answers,
      hint: i.hint,
      explanation: i.explanation,
      is_required: i.is_required ?? true,
    }));
    const result = await saveStage10ItemsAction(passageId, drafts);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage(
      `저장했습니다 (${result.count}개).${
        result.learningStudentsWarning
          ? " 학습 중인 학생이 있을 수 있습니다."
          : ""
      }`
    );
  }

  async function handlePublish(next: boolean) {
    setLoading(true);
    const result = await setStage10PublishedAction(passageId, next);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setPublished(next);
    setMessage(next ? "10단계를 공개했습니다." : "10단계를 비공개로 변경했습니다.");
  }

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            10단계 · 영작 연습하기
          </h2>
          <p className="text-sm text-slate-500">
            제시어와 영작 구간을 설정합니다. 정답은 1단계 원문 기준입니다.
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
          <Button
            type="button"
            onClick={() => void getStage10PassageStatsAction(passageId).then(setStats)}
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
          공개된 상태입니다. 영작 구간이나 제시어를 변경하면 학습 중 학생 진행에
          영향을 줄 수 있습니다.
        </p>
      )}

      <div className="mb-3">
        <p className="mb-1 text-xs font-medium text-slate-500">문장 선택 → 문항 추가</p>
        <div className="max-h-48 space-y-1 overflow-y-auto">
          {ordered.map((s) => {
            const on = selectedSentenceIds.includes(s.id);
            return (
              <button
                key={s.id}
                type="button"
                onClick={() =>
                  setSelectedSentenceIds((prev) =>
                    prev.includes(s.id)
                      ? prev.filter((x) => x !== s.id)
                      : [...prev, s.id]
                  )
                }
                className={`block w-full rounded border px-2 py-1 text-left text-sm ${
                  on ? "border-brand-400 bg-brand-50" : "border-slate-200"
                }`}
              >
                {s.sentence_order}. {s.english_text}
              </button>
            );
          })}
        </div>
        <Button type="button" className="mt-2" onClick={addItemFromSentences}>
          선택 문장으로 문항 추가
        </Button>
      </div>

      <div className="mb-3 flex flex-wrap gap-2">
        {items.map((it) => (
          <button
            key={it.localKey}
            type="button"
            onClick={() => {
              setActiveKey(it.localKey);
              setRangeEnd((it.full_english || "").length);
            }}
            className={`rounded border px-2 py-1 text-sm ${
              activeKey === it.localKey
                ? "border-brand-500 bg-brand-50"
                : "border-slate-200"
            }`}
          >
            {it.blank_order}번
          </button>
        ))}
      </div>

      {active && (
        <div className="space-y-3 rounded-lg border border-slate-200 p-3">
          <p className="text-sm text-slate-700">
            <span className="font-medium">우리말:</span> {active.korean_prompt}
          </p>
          <p className="text-sm text-slate-800">
            <span className="font-medium">원문:</span> {active.full_english}
          </p>
          <div className="flex flex-wrap gap-3 text-xs">
            <label>
              입력 방식{" "}
              <select
                className="rounded border px-1"
                value={active.writing_input_mode}
                onChange={(e) =>
                  updateActive({
                    writing_input_mode: e.target.value as Stage10InputMode,
                  })
                }
              >
                <option value="guided_segments">guided_segments</option>
                <option value="full_sentence">full_sentence</option>
              </select>
            </label>
            <label>
              빈칸 표시{" "}
              <select
                className="rounded border px-1"
                value={active.writing_blank_display_mode}
                onChange={(e) =>
                  updateActive({
                    writing_blank_display_mode: e.target
                      .value as Stage10BlankDisplayMode,
                  })
                }
              >
                <option value="token_slots">token_slots</option>
                <option value="phrase_input">phrase_input</option>
              </select>
            </label>
            <label className="flex items-center gap-1">
              <input
                type="checkbox"
                checked={active.is_required !== false}
                onChange={(e) =>
                  updateActive({ is_required: e.target.checked })
                }
              />
              필수
            </label>
            <button
              type="button"
              className="text-red-600"
              onClick={() => {
                setItems((prev) =>
                  prev
                    .filter((i) => i.localKey !== active.localKey)
                    .map((i, idx) => ({ ...i, blank_order: idx + 1 }))
                );
                setActiveKey(null);
              }}
            >
              문항 삭제
            </button>
          </div>

          <div className="flex flex-wrap items-end gap-2 text-xs">
            <label>
              영작 시작
              <input
                type="number"
                className="ml-1 w-16 rounded border px-1"
                value={rangeStart}
                onChange={(e) => setRangeStart(Number(e.target.value) || 0)}
              />
            </label>
            <label>
              영작 끝
              <input
                type="number"
                className="ml-1 w-16 rounded border px-1"
                value={rangeEnd}
                onChange={(e) => setRangeEnd(Number(e.target.value) || 0)}
              />
            </label>
            <Button type="button" onClick={applyAnswerRange}>
              선택 범위를 영작 구간으로
            </Button>
            <Button
              type="button"
              onClick={() =>
                updateActive({
                  writing_segments: proposeFullSentenceSegments(
                    active.full_english || ""
                  ),
                })
              }
            >
              문장 전체 영작으로
            </Button>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500">세그먼트</p>
            <ul className="mt-1 space-y-1 text-sm">
              {active.writing_segments.map((s: Stage10Segment) => (
                <li key={s.id} className="rounded bg-slate-50 px-2 py-1">
                  {s.segmentType === "fixed_text" ? (
                    <span>고정: 「{s.fixedText}」</span>
                  ) : (
                    <span>
                      영작: 「{s.originalAnswerText}」 (
                      {(s.answerTokens ?? tokenizeAnswerText(s.originalAnswerText ?? "")).join(
                        " / "
                      )}
                      )
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-xs font-medium text-slate-500">제시어</p>
            <p className="text-sm">
              {active.writing_cues.map((c) => c.cueText).join(" → ") || "(없음)"}
            </p>
            <div className="mt-1 flex gap-2">
              <input
                className="rounded border px-2 py-1 text-sm"
                value={cueDraft}
                onChange={(e) => setCueDraft(e.target.value)}
                placeholder="제시어 추가"
              />
              <Button type="button" onClick={addCue}>
                추가
              </Button>
            </div>
          </div>

          <label className="block text-xs">
            힌트
            <input
              className="mt-1 w-full rounded border px-2 py-1 text-sm"
              value={active.hint ?? ""}
              onChange={(e) => updateActive({ hint: e.target.value })}
            />
          </label>

          {preview && (
            <div className="rounded border bg-slate-50 p-3 text-sm">
              <p className="font-medium">학생 미리보기</p>
              <p className="mt-1">{active.korean_prompt}</p>
              <p className="mt-1 text-xs text-slate-500">
                {active.writing_cues.map((c) => c.cueText).join(" → ")}
              </p>
              <div className="mt-2 leading-relaxed">
                {active.writing_segments.map((s) =>
                  s.segmentType === "fixed_text" ? (
                    <span key={s.id}>{s.fixedText}</span>
                  ) : active.writing_blank_display_mode === "token_slots" ? (
                    <span key={s.id} className="mx-0.5 inline-flex flex-wrap gap-1">
                      {(s.answerTokens ?? []).map((_, i) => (
                        <span
                          key={i}
                          className="inline-block min-w-[3rem] border-b border-slate-400"
                        >
                          &nbsp;
                        </span>
                      ))}
                    </span>
                  ) : (
                    <span
                      key={s.id}
                      className="mx-1 inline-block min-w-[8rem] border-b border-slate-400"
                    >
                      &nbsp;
                    </span>
                  )
                )}
              </div>
              <p className="mt-2 text-xs text-emerald-800">
                정답(강사만): {active.full_english}
              </p>
            </div>
          )}
        </div>
      )}

      {stats && stats.ok && (
        <div className="mt-4 rounded-lg border p-3 text-sm">
          <p className="font-medium">10단계 결과 요약</p>
          <p className="mt-1 text-slate-600">
            학생 {stats.studentCount} · 완료 {stats.completedStudents} · 평균
            점수 {stats.avgScore} · 평균 시도 {stats.avgAttempts}
          </p>
          <ul className="mt-2 space-y-1 text-xs">
            {stats.byItem.slice(0, 8).map((g) => (
              <li key={g.itemId}>
                「{g.label}」 오답 {g.incorrect} / 정답 {g.correct}
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}
