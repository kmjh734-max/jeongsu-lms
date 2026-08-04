"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import {
  completeStage8Action,
  gradeStage8Action,
  loadStage8StudentDataAction,
  requestStage8HintAction,
  requestStage8RevealAction,
  saveStage8DraftAction,
} from "@/lib/exam-prep/stage8-actions";
import {
  STAGE8_DEFAULT_THRESHOLDS,
  buildSentenceLayout,
  joinChunkTexts,
  type ExamStage8GroupPublic,
  type ExamStage8Progress,
  type Stage8AnswerState,
} from "@/lib/exam-prep/stage8-types";

type SentenceRow = {
  id: string;
  sentence_order: number;
  english_text: string;
  korean_text: string | null;
};

function GroupReorderUI({
  group,
  state,
  locked,
  onChange,
}: {
  group: ExamStage8GroupPublic;
  state: Stage8AnswerState;
  locked: boolean;
  onChange: (order: string[]) => void;
}) {
  const textById = useMemo(() => {
    const m = new Map(group.chunks.map((c) => [c.id, c.text]));
    return m;
  }, [group.chunks]);

  const order = state.studentOrder ?? [];
  const placed = new Set(order);
  const pool = (state.initialOrder?.length
    ? state.initialOrder
    : group.initialOrder
  ).filter((id) => !placed.has(id));

  const [dragFrom, setDragFrom] = useState<number | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [liveMsg, setLiveMsg] = useState("");

  function announce(msg: string) {
    setLiveMsg(msg);
  }

  function add(id: string) {
    if (locked || order.includes(id)) return;
    const next = [...order, id];
    onChange(next);
    announce(
      `${textById.get(id)} 추가됨. ${next.length} / ${group.chunks.length}`
    );
  }

  function removeAt(index: number) {
    if (locked) return;
    const id = order[index];
    if (!id) return;
    onChange(order.filter((_, i) => i !== index));
    announce(`${textById.get(id)} 제거됨`);
  }

  function move(index: number, to: number) {
    if (locked || to < 0 || to >= order.length) return;
    const next = [...order];
    const [moved] = next.splice(index, 1);
    if (!moved) return;
    next.splice(to, 0, moved);
    onChange(next);
    announce(
      `${textById.get(moved)} 위치 ${to + 1} / ${next.length}`
    );
  }

  function onDrop(targetIndex: number) {
    if (dragFrom === null || locked) {
      setDragFrom(null);
      return;
    }
    if (dragFrom === targetIndex) {
      setDragFrom(null);
      return;
    }
    const next = [...order];
    const [moved] = next.splice(dragFrom, 1);
    if (!moved) {
      setDragFrom(null);
      return;
    }
    next.splice(targetIndex, 0, moved);
    onChange(next);
    setDragFrom(null);
  }

  function onKeyDownCard(
    e: React.KeyboardEvent,
    id: string,
    index: number | null,
    zone: "pool" | "seq"
  ) {
    if (locked) return;
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      if (zone === "pool") add(id);
      else if (index != null) removeAt(index);
    }
    if (zone === "seq" && index != null) {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        move(index, index - 1);
      }
      if (e.key === "ArrowRight") {
        e.preventDefault();
        move(index, index + 1);
      }
      if (e.key === "Home") {
        e.preventDefault();
        move(index, 0);
      }
      if (e.key === "End") {
        e.preventDefault();
        move(index, order.length - 1);
      }
    }
    if (e.key === "Escape") setSelectedId(null);
  }

  return (
    <div className="space-y-3">
      <div aria-live="polite" className="sr-only">
        {liveMsg}
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-slate-500">제시 카드</p>
        <div className="flex flex-wrap gap-2">
          {pool.map((id) => (
            <button
              key={id}
              type="button"
              disabled={locked}
              aria-label={`카드 ${textById.get(id)}`}
              onClick={() => add(id)}
              onKeyDown={(e) => onKeyDownCard(e, id, null, "pool")}
              className="min-h-10 rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 text-left text-sm hover:bg-slate-50 disabled:opacity-60"
            >
              {textById.get(id) ?? id}
            </button>
          ))}
          {pool.length === 0 && (
            <span className="text-xs text-slate-400">모두 배치됨</span>
          )}
        </div>
      </div>
      <div>
        <p className="mb-1 text-xs font-medium text-slate-500">
          완성 영역 (클릭 제거 · 드래그/방향키로 순서 변경)
        </p>
        <div className="flex min-h-12 flex-wrap gap-2 rounded-lg border border-dashed border-brand-300 bg-brand-50/50 p-2">
          {order.map((id, index) => (
            <button
              key={id}
              type="button"
              disabled={locked}
              draggable={!locked}
              aria-label={`${textById.get(id)}, ${index + 1}번째 / ${order.length}`}
              aria-grabbed={selectedId === id}
              onDragStart={() => setDragFrom(index)}
              onDragOver={(e) => e.preventDefault()}
              onDrop={() => onDrop(index)}
              onClick={() => removeAt(index)}
              onKeyDown={(e) => onKeyDownCard(e, id, index, "seq")}
              onFocus={() => setSelectedId(id)}
              className="min-h-10 cursor-grab rounded-lg border border-brand-200 bg-white px-2.5 py-1.5 text-sm text-brand-900 active:cursor-grabbing disabled:cursor-default"
            >
              {textById.get(id) ?? id}
            </button>
          ))}
          {order.length === 0 && (
            <span className="text-xs text-slate-400">카드를 배치하세요</span>
          )}
        </div>
        {!locked && order.length > 0 && selectedId && (
          <div className="mt-2 flex flex-wrap gap-1">
            {(() => {
              const idx = order.indexOf(selectedId);
              if (idx < 0) return null;
              return (
                <>
                  <Button type="button" onClick={() => move(idx, 0)}>
                    맨 앞
                  </Button>
                  <Button type="button" onClick={() => move(idx, idx - 1)}>
                    왼쪽
                  </Button>
                  <Button type="button" onClick={() => move(idx, idx + 1)}>
                    오른쪽
                  </Button>
                  <Button
                    type="button"
                    onClick={() => move(idx, order.length - 1)}
                  >
                    맨 뒤
                  </Button>
                  <Button type="button" onClick={() => removeAt(idx)}>
                    제거
                  </Button>
                </>
              );
            })()}
          </div>
        )}
      </div>
    </div>
  );
}

export function Stage8ReorderView({
  assignmentStudentId,
  stepId,
  onGoStage7,
  onStage8Completed,
}: {
  assignmentStudentId: string;
  stepId: string;
  onGoStage7?: () => void;
  onStage8Completed?: () => void;
}) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [passage, setPassage] = useState<{
    id: string;
    title: string;
    school_level?: string | null;
    grade?: string | null;
    source?: string | null;
    exam_name?: string | null;
    passage_number?: string | null;
  } | null>(null);
  const [sentences, setSentences] = useState<SentenceRow[]>([]);
  const [groups, setGroups] = useState<ExamStage8GroupPublic[]>([]);
  const [states, setStates] = useState<Record<string, Stage8AnswerState>>({});
  const [revision, setRevision] = useState(0);
  const [stageDone, setStageDone] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<Record<string, string | null>>({});
  const [revealTexts, setRevealTexts] = useState<Record<string, string[]>>({});
  const [busy, setBusy] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const applyProgress = useCallback((progress: ExamStage8Progress | null) => {
    if (!progress) return;
    setRevision(progress.revision ?? 0);
    setStageDone(Boolean(progress.completed_at));
    setStates(progress.answers ?? {});
  }, []);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    setErrorCode(null);
    const result = await loadStage8StudentDataAction({ assignmentStudentId });
    setLoading(false);
    if (!result.ok) {
      setError(result.message);
      setErrorCode("code" in result ? (result.code as string) : null);
      if ("passage" in result && result.passage) setPassage(result.passage);
      return;
    }
    setPassage(result.passage);
    setSentences(result.sentences as SentenceRow[]);
    setGroups(result.groups);
    applyProgress(result.progress);
  }, [assignmentStudentId, applyProgress]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const groupsBySentence = useMemo(() => {
    const m = new Map<string, ExamStage8GroupPublic[]>();
    for (const g of groups) {
      const list = m.get(g.sentenceId) ?? [];
      list.push(g);
      m.set(g.sentenceId, list);
    }
    for (const [, list] of m) {
      list.sort((a, b) => a.groupOrder - b.groupOrder);
    }
    return m;
  }, [groups]);

  const required = useMemo(
    () => groups.filter((g) => g.isRequired),
    [groups]
  );
  const correctCount = required.filter(
    (g) => states[g.id]?.isCorrect === true
  ).length;
  const canComplete =
    required.length > 0 &&
    required.every((g) => states[g.id]?.isCorrect === true);

  function scheduleSave(nextStates: Record<string, Stage8AnswerState>) {
    if (!passage || stageDone) return;
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      const orders: Record<string, string[]> = {};
      for (const [id, s] of Object.entries(nextStates)) {
        if (s.isCorrect === true) continue;
        orders[id] = s.studentOrder;
      }
      void saveStage8DraftAction({
        assignmentStudentId,
        passageId: passage.id,
        orders,
        expectedRevision: revision,
      }).then((res) => {
        if (res.ok) applyProgress(res.progress);
      });
    }, 500);
  }

  function setOrder(groupId: string, studentOrder: string[]) {
    setStates((prev) => {
      const cur = prev[groupId];
      if (!cur || cur.isCorrect === true) return prev;
      const next = {
        ...prev,
        [groupId]: { ...cur, studentOrder, isCorrect: null },
      };
      scheduleSave(next);
      return next;
    });
    setFeedback((f) => ({ ...f, [groupId]: null }));
  }

  function resetGroup(groupId: string) {
    setStates((prev) => {
      const cur = prev[groupId];
      if (!cur || cur.isCorrect === true) return prev;
      const next = {
        ...prev,
        [groupId]: { ...cur, studentOrder: [], isCorrect: null },
      };
      scheduleSave(next);
      return next;
    });
  }

  async function grade(groupIds?: string[]) {
    if (!passage) return;
    setBusy(true);
    setMessage(null);
    const orders: Record<string, string[]> = {};
    for (const g of groups) {
      orders[g.id] = states[g.id]?.studentOrder ?? [];
    }
    const result = await gradeStage8Action({
      assignmentStudentId,
      passageId: passage.id,
      groupIds,
      orders,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      if ("progress" in result && result.progress) applyProgress(result.progress);
      return;
    }
    applyProgress(result.progress);
    if (result.feedback) setFeedback(result.feedback);
    setMessage(`채점 완료 · 점수 ${result.score}점`);
  }

  async function handleComplete() {
    if (!passage) return;
    setBusy(true);
    const result = await completeStage8Action({
      assignmentStudentId,
      passageId: passage.id,
      stepId,
    });
    setBusy(false);
    setMessage(result.message);
    if (result.ok) {
      setStageDone(true);
      onStage8Completed?.();
    }
  }

  async function hint(groupId: string) {
    setBusy(true);
    const result = await requestStage8HintAction({
      assignmentStudentId,
      groupId,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    applyProgress(result.progress);
    setFeedback((f) => ({ ...f, [groupId]: result.hint }));
  }

  async function reveal(groupId: string) {
    setBusy(true);
    const result = await requestStage8RevealAction({
      assignmentStudentId,
      groupId,
    });
    setBusy(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    applyProgress(result.progress);
    setRevealTexts((t) => ({ ...t, [groupId]: result.orderTexts }));
    setMessage("정답 순서를 확인했습니다. 직접 다시 배열한 뒤 채점하세요.");
  }

  if (loading) {
    return <p className="text-sm text-slate-500">8단계를 불러오는 중…</p>;
  }

  if (error) {
    return (
      <div className="space-y-3 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm">
        <p className="font-medium text-amber-900">{error}</p>
        {errorCode === "stage7_required" && (
          <Button type="button" onClick={onGoStage7}>
            7단계로 이동
          </Button>
        )}
        <Button type="button" onClick={() => void reload()}>
          다시 시도
        </Button>
        <Link href="/student/exam-prep" className="block text-brand-700">
          목록으로
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <header className="rounded-xl border border-slate-200 bg-white p-4">
        <p className="text-xs font-medium text-slate-500">내신대비학습</p>
        <h2 className="text-lg font-semibold text-slate-900">
          {passage?.title}
        </h2>
        <p className="mt-1 text-sm text-slate-600">
          {[passage?.school_level, passage?.grade, passage?.source]
            .filter(Boolean)
            .join(" · ")}
          {passage?.passage_number ? ` · ${passage.passage_number}` : ""}
        </p>
        <p className="mt-2 text-sm font-medium text-brand-800">
          현재 단계: 8단계 · 순서 배열하기 · 8 / 10
        </p>
        <p className="mt-1 text-sm text-slate-700">
          우리말과 같은 뜻이 되도록 주어진 단어와 어구를 바르게 배열해 보세요.
        </p>
        <p className="mt-2 text-sm text-slate-600">
          총 {required.length}개 배열 중 {correctCount}개 정답
        </p>
      </header>

      {sentences.map((s) => {
        const sGroups = groupsBySentence.get(s.id) ?? [];
        if (sGroups.length === 0) return null;
        const layout = buildSentenceLayout(
          s.english_text,
          sGroups.map((g) => ({
            id: g.id,
            english_start: g.englishStart,
            english_end: g.englishEnd,
          }))
        );
        return (
          <section
            key={s.id}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <p className="text-sm font-semibold text-slate-900">
              {s.sentence_order}번
            </p>
            <p className="mt-1 text-sm text-slate-700">
              {s.korean_text || "(해석 없음)"}
            </p>
            <div className="mt-3 rounded-lg bg-slate-50 p-3 text-sm leading-relaxed text-slate-800">
              {layout.map((seg, i) => {
                if (seg.type === "fixed") {
                  return <span key={`f-${s.id}-${i}`}>{seg.text}</span>;
                }
                const st = states[seg.groupId];
                const placed = st?.studentOrder ?? [];
                const g = sGroups.find((x) => x.id === seg.groupId);
                const map = new Map(g?.chunks.map((c) => [c.id, c.text]));
                const filled =
                  placed.length > 0
                    ? joinChunkTexts(placed.map((id) => map.get(id) ?? ""))
                    : "______";
                const mark =
                  st?.isCorrect === true
                    ? " ✓"
                    : st?.isCorrect === false
                      ? " ✗"
                      : "";
                return (
                  <span
                    key={seg.groupId}
                    className={`mx-0.5 inline rounded px-1 ${
                      st?.isCorrect === true
                        ? "bg-emerald-100"
                        : st?.isCorrect === false
                          ? "bg-red-100"
                          : "bg-white outline outline-1 outline-dashed outline-slate-300"
                    }`}
                  >
                    {filled}
                    <span className="sr-only">{mark}</span>
                    {st?.isCorrect === true && (
                      <span aria-label="정답"> ✓</span>
                    )}
                    {st?.isCorrect === false && (
                      <span aria-label="오답"> ✗</span>
                    )}
                  </span>
                );
              })}
            </div>

            <div className="mt-4 space-y-4">
              {sGroups.map((g) => {
                const st = states[g.id] ?? {
                  studentOrder: [],
                  initialOrder: g.initialOrder,
                  isCorrect: null,
                  attempts: 0,
                  hintUsed: false,
                  answerRevealed: false,
                };
                const locked = stageDone || st.isCorrect === true;
                return (
                  <div
                    key={g.id}
                    className="rounded-lg border border-slate-100 p-3"
                  >
                    <GroupReorderUI
                      group={g}
                      state={st}
                      locked={locked}
                      onChange={(order) => setOrder(g.id, order)}
                    />
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        disabled={busy || locked}
                        onClick={() => resetGroup(g.id)}
                      >
                        이 구간 초기화
                      </Button>
                      <Button
                        type="button"
                        disabled={busy || locked}
                        onClick={() => void grade([g.id])}
                      >
                        이 구간 채점
                      </Button>
                      {st.attempts >= STAGE8_DEFAULT_THRESHOLDS.hintAfterWrong &&
                        !locked && (
                          <Button
                            type="button"
                            disabled={busy}
                            onClick={() => void hint(g.id)}
                          >
                            힌트
                          </Button>
                        )}
                      {st.attempts >=
                        STAGE8_DEFAULT_THRESHOLDS.revealAfterWrong &&
                        !locked && (
                          <Button
                            type="button"
                            disabled={busy}
                            onClick={() => void reveal(g.id)}
                          >
                            정답 순서 확인
                          </Button>
                        )}
                    </div>
                    {(feedback[g.id] || st.hintText) && (
                      <p className="mt-2 text-sm text-slate-700">
                        {feedback[g.id] || st.hintText}
                      </p>
                    )}
                    {revealTexts[g.id] && (
                      <p className="mt-2 rounded bg-slate-100 px-2 py-1 text-sm text-slate-800">
                        정답 예시(직접 배열):{" "}
                        {revealTexts[g.id]!.join(" / ")}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </section>
        );
      })}

      {message && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      )}

      {stageDone && (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">8단계 학습을 완료했습니다.</p>
          <p className="mt-1">다음 단계는 준비 중입니다.</p>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          disabled={busy || stageDone}
          onClick={() => {
            if (
              window.confirm(
                "현재 배열한 내용을 모두 초기화하시겠습니까?"
              )
            ) {
              setStates((prev) => {
                const next = { ...prev };
                for (const g of groups) {
                  if (next[g.id]?.isCorrect === true) continue;
                  next[g.id] = {
                    ...(next[g.id] ?? {
                      initialOrder: g.initialOrder,
                      attempts: 0,
                      hintUsed: false,
                      answerRevealed: false,
                      isCorrect: null,
                      studentOrder: [],
                    }),
                    studentOrder: [],
                    isCorrect: null,
                  };
                }
                scheduleSave(next);
                return next;
              });
            }
          }}
        >
          단계 전체 초기화
        </Button>
        <Button
          type="button"
          disabled={busy || stageDone}
          onClick={() => void grade()}
        >
          전체 채점하기
        </Button>
        <Button
          type="button"
          disabled={!canComplete || stageDone || busy}
          onClick={() => void handleComplete()}
        >
          8단계 학습 완료
        </Button>
        <Link
          href="/student/exam-prep"
          className="rounded-lg border px-4 py-2 text-sm font-medium"
        >
          목록으로
        </Link>
      </div>
    </div>
  );
}
