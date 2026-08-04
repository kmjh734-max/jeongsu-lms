"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  completeStage1Action,
  saveStage1ProgressAction,
} from "@/lib/exam-prep/stage1-actions";
import {
  buildHighlightSegments,
  parseVocabMarks,
  VOCAB_STYLE_CLASSES,
  type VocabMark,
} from "@/lib/exam-prep/vocab-marks";
import type {
  ExamPassage,
  ExamPassageSentence,
  ExamStage1Progress,
} from "@/lib/exam-prep/types";

function HighlightedText({
  text,
  marks,
  side,
  onMarkClick,
}: {
  text: string;
  marks: VocabMark[];
  side: "english" | "korean";
  onMarkClick?: (mark: VocabMark) => void;
}) {
  const segs = buildHighlightSegments(text, marks, side);
  return (
    <span className="leading-relaxed">
      {segs.map((seg, i) => {
        if (!seg.mark) {
          return <span key={i}>{seg.text}</span>;
        }
        const style = VOCAB_STYLE_CLASSES[seg.mark.styleKey];
        const cls = side === "english" ? style.en : style.ko;
        return (
          <button
            key={i}
            type="button"
            className={`mx-0.5 inline rounded px-0.5 ${cls}`}
            title={
              [seg.mark.meaning, seg.mark.memo].filter(Boolean).join(" · ") ||
              seg.mark.englishText
            }
            onClick={() => onMarkClick?.(seg.mark!)}
          >
            <sup
              className={`mr-0.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-bold ${style.badge}`}
            >
              {style.label}
            </sup>
            {seg.text}
          </button>
        );
      })}
    </span>
  );
}

export function Stage1FamiliarizeView({
  assignmentStudentId,
  stepId,
  passage,
  sentences,
  initialProgress,
  totalSteps,
  canStartStage2 = false,
  onStartStage2,
  onStage1Completed,
}: {
  assignmentStudentId: string;
  stepId: string;
  passage: Pick<
    ExamPassage,
    | "id"
    | "title"
    | "school_level"
    | "grade"
    | "source"
    | "exam_name"
    | "passage_number"
  >;
  sentences: ExamPassageSentence[];
  initialProgress: ExamStage1Progress | null;
  totalSteps: number;
  canStartStage2?: boolean;
  onStartStage2?: () => void;
  onStage1Completed?: () => void;
}) {
  const router = useRouter();
  const ordered = useMemo(
    () =>
      [...sentences].sort((a, b) => a.sentence_order - b.sentence_order),
    [sentences]
  );

  const [checked, setChecked] = useState<Set<string>>(
    () => new Set(initialProgress?.completed_sentence_ids ?? [])
  );
  const [activeMark, setActiveMark] = useState<VocabMark | null>(null);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [stageDone, setStageDone] = useState(
    () => Boolean(initialProgress?.completed_at)
  );

  const allDone =
    ordered.length > 0 && ordered.every((s) => checked.has(s.id));

  const persist = useCallback(
    async (next: Set<string>, lastId: string | null) => {
      setSaving(true);
      const result = await saveStage1ProgressAction({
        assignmentStudentId,
        passageId: passage.id,
        completedSentenceIds: [...next],
        lastViewedSentenceId: lastId,
        totalSentenceCount: ordered.length,
      });
      setSaving(false);
      if (!result.ok) {
        setMessage(result.message);
      }
    },
    [assignmentStudentId, ordered.length, passage.id]
  );

  function toggleSentence(id: string) {
    if (stageDone) return;
    setChecked((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      void persist(next, id);
      return next;
    });
  }

  function resetAll() {
    if (stageDone) return;
    if (!confirm("확인한 문장 표시를 모두 지울까요?")) return;
    const empty = new Set<string>();
    setChecked(empty);
    setMessage(null);
    void persist(empty, null);
  }

  async function handleComplete() {
    if (!allDone || stageDone) return;
    setCompleting(true);
    setMessage(null);
    const result = await completeStage1Action({
      assignmentStudentId,
      passageId: passage.id,
      stepId,
      completedSentenceIds: [...checked],
      totalSentenceCount: ordered.length,
    });
    setCompleting(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setStageDone(true);
    setMessage(result.message);
    onStage1Completed?.();
    router.refresh();
  }

  useEffect(() => {
    const last = initialProgress?.last_viewed_sentence_id;
    if (!last) return;
    const el = document.getElementById(`stage1-sent-${last}`);
    el?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, [initialProgress?.last_viewed_sentence_id]);

  const metaBits = [
    [passage.school_level, passage.grade].filter(Boolean).join(" · "),
    passage.source || passage.exam_name,
    passage.passage_number ? `문항 ${passage.passage_number}` : "",
  ].filter(Boolean);

  return (
    <div className="space-y-6">
      <header className="rounded-xl border border-indigo-100 bg-indigo-50/60 p-4">
        <p className="text-xs font-medium uppercase tracking-wide text-indigo-700">
          내신대비학습
        </p>
        <h2 className="mt-1 text-lg font-semibold text-slate-900">
          {passage.title}
        </h2>
        {metaBits.length > 0 && (
          <p className="mt-1 text-sm text-slate-600">{metaBits.join(" · ")}</p>
        )}
        <p className="mt-3 text-sm font-medium text-slate-800">
          현재 단계: 1단계 · 지문 익히기
          <span className="ml-2 text-slate-500">
            (1 / {Math.max(totalSteps, 10)})
          </span>
        </p>
        <p className="mt-2 text-sm text-slate-600">
          영문과 우리말 해석을 함께 읽으며 문장의 의미를 이해해 보세요.
        </p>
        <p className="mt-2 text-xs text-slate-500">
          확인 {checked.size} / {ordered.length}
          {saving ? " · 저장 중…" : ""}
        </p>
      </header>

      {ordered.length === 0 ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
          등록된 문장이 없습니다. 선생님에게 문장 등록을 요청해 주세요.
        </p>
      ) : (
        <div className="space-y-3">
          {/* Desktop: side-by-side headers */}
          <div className="hidden grid-cols-[1fr_1fr_auto] gap-3 px-1 text-xs font-semibold text-slate-500 sm:grid">
            <span>영어 원문</span>
            <span>우리말 해석</span>
            <span className="w-24 text-center">확인</span>
          </div>

          {ordered.map((s) => {
            const marks = parseVocabMarks(s.vocabulary);
            const done = checked.has(s.id);
            return (
              <div
                key={s.id}
                id={`stage1-sent-${s.id}`}
                className={`rounded-xl border p-3 sm:grid sm:grid-cols-[1fr_1fr_auto] sm:gap-3 sm:p-4 ${
                  done
                    ? "border-emerald-200 bg-emerald-50/40"
                    : "border-slate-200 bg-white"
                }`}
              >
                {s.is_paragraph_start ? (
                  <p className="mb-2 text-[11px] font-medium text-slate-400 sm:col-span-3">
                    문단 {s.paragraph_number}
                  </p>
                ) : null}

                <div className="text-sm text-slate-900">
                  <span className="mr-2 inline-block min-w-6 text-xs font-semibold text-slate-400">
                    {s.sentence_order}.
                  </span>
                  <HighlightedText
                    text={s.english_text}
                    marks={marks}
                    side="english"
                    onMarkClick={setActiveMark}
                  />
                </div>

                <div className="mt-2 text-sm text-slate-700 sm:mt-0">
                  <span className="mr-2 inline-block min-w-6 text-xs font-semibold text-slate-400 sm:invisible">
                    {s.sentence_order}.
                  </span>
                  {s.korean_text ? (
                    <HighlightedText
                      text={s.korean_text}
                      marks={marks}
                      side="korean"
                      onMarkClick={setActiveMark}
                    />
                  ) : (
                    <span className="text-slate-400">(해석 없음)</span>
                  )}
                  {s.student_note ? (
                    <p className="mt-1 text-xs text-slate-500">
                      {s.student_note}
                    </p>
                  ) : null}
                </div>

                <div className="mt-3 flex items-center justify-end sm:mt-0 sm:w-24 sm:justify-center">
                  <button
                    type="button"
                    disabled={stageDone}
                    onClick={() => toggleSentence(s.id)}
                    className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${
                      done
                        ? "bg-emerald-600 text-white"
                        : "border border-slate-300 text-slate-700 hover:bg-slate-50"
                    } disabled:opacity-60`}
                  >
                    {done ? "확인함" : "확인했어요"}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {activeMark && (
        <div className="rounded-xl border border-slate-200 bg-white p-4 text-sm shadow-sm">
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-semibold text-slate-900">
                {activeMark.englishText}
                {activeMark.koreanText ? (
                  <span className="font-normal text-slate-600">
                    {" "}
                    · {activeMark.koreanText}
                  </span>
                ) : null}
              </p>
              {activeMark.meaning ? (
                <p className="mt-1 text-slate-700">뜻: {activeMark.meaning}</p>
              ) : null}
              {activeMark.memo ? (
                <p className="mt-1 text-slate-500">{activeMark.memo}</p>
              ) : null}
            </div>
            <button
              type="button"
              className="text-xs text-slate-500 hover:underline"
              onClick={() => setActiveMark(null)}
            >
              닫기
            </button>
          </div>
        </div>
      )}

      {stageDone ? (
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-900">
          <p className="font-semibold">1단계 학습을 완료했습니다.</p>
          {canStartStage2 ? (
            <p className="mt-1">2단계 「우리말 빈칸 완성하기」를 시작할 수 있습니다.</p>
          ) : (
            <p className="mt-1">
              2단계가 아직 공개되지 않았거나 준비 중입니다.
            </p>
          )}
        </div>
      ) : null}

      {message && !stageDone ? (
        <p className="text-sm text-amber-800" role="status">
          {message}
        </p>
      ) : null}
      {message && stageDone ? (
        <p className="text-sm text-emerald-800" role="status">
          {message}
        </p>
      ) : null}

      <div className="flex flex-wrap items-center gap-2 border-t border-slate-100 pt-4">
        <Link
          href="/student/exam-prep"
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          이전 화면
        </Link>
        <Button
          type="button"
          variant="secondary"
          onClick={resetAll}
          disabled={stageDone || checked.size === 0}
        >
          처음부터 다시 보기
        </Button>
        <Button
          type="button"
          onClick={() => void handleComplete()}
          disabled={!allDone || stageDone || completing}
        >
          {completing ? "저장 중…" : "1단계 학습 완료"}
        </Button>
        {stageDone && canStartStage2 && (
          <Button type="button" onClick={() => onStartStage2?.()}>
            2단계 시작하기
          </Button>
        )}
      </div>
    </div>
  );
}
