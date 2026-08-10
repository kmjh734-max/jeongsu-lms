"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  approveWorkbookAction,
  fillEmptyWorkbookQuestionsAction,
  regenerateStepQuestionsAction,
  updateQuestionAction,
} from "@/lib/exam-prep/staff-actions";
import {
  EXAM_STEP_LABELS,
  type ExamPassageSentence,
  type ExamWorkbook,
  type ExamWorkbookQuestion,
  type ExamWorkbookStep,
  type ExamStepType,
} from "@/lib/exam-prep/types";

function QuestionPreview({ q }: { q: ExamWorkbookQuestion }) {
  const data = (q.question_data ?? {}) as Record<string, unknown>;
  const type = q.question_type;

  if (type === "comprehension") {
    return (
      <div className="mt-2 space-y-1 text-sm">
        <p className="font-serif text-slate-900">{String(data.english ?? "")}</p>
        {data.korean ? (
          <p className="text-slate-600">{String(data.korean)}</p>
        ) : (
          <p className="text-xs text-amber-700">우리말 해석이 비어 있습니다.</p>
        )}
      </div>
    );
  }

  if (
    type === "english_blank" ||
    type === "korean_blank" ||
    type === "verb_form"
  ) {
    return (
      <div className="mt-2 space-y-1 text-sm">
        {data.englishHint ? (
          <p className="font-serif text-slate-900">{String(data.englishHint)}</p>
        ) : null}
        {data.koreanHint ? (
          <p className="text-slate-600">{String(data.koreanHint)}</p>
        ) : null}
        {data.baseForm ? (
          <p className="text-xs text-slate-500">기본형: {String(data.baseForm)}</p>
        ) : null}
        {Array.isArray(data.baseForms) &&
        (data.baseForms as unknown[]).length > 0 &&
        !data.baseForm ? (
          <p className="text-xs text-slate-500">
            기본형:{" "}
            {(data.baseForms as string[]).map((b) => `(${b})`).join(" ")}
          </p>
        ) : null}
        {data.displayText ? (
          <p className="font-mono text-slate-800">{String(data.displayText)}</p>
        ) : null}
      </div>
    );
  }

  if (type === "translation_practice") {
    return (
      <p className="mt-2 font-serif text-sm text-slate-900">
        {String(data.english ?? "")}
      </p>
    );
  }

  if (type === "grammar_vocab_choice") {
    const format = String(data.format ?? "");
    const choiceBlanks = (
      Array.isArray(data.choiceBlanks) ? data.choiceBlanks : []
    ) as { options?: { text?: string }[] }[];
    return (
      <div className="mt-2 space-y-1 text-sm">
        {data.koreanHint ? (
          <p className="text-slate-600">{String(data.koreanHint)}</p>
        ) : null}
        <p className="font-serif leading-relaxed text-slate-900">
          {String(data.displayText ?? "")}
        </p>
        {format !== "inline_ab" && choiceBlanks.length === 0 ? (
          <ul className="text-xs text-slate-600">
            {(
              (Array.isArray(data.options) ? data.options : []) as {
                text?: string;
              }[]
            ).map((o, i) => (
              <li key={i}>
                {String.fromCharCode(9312 + i)} {o.text}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    );
  }

  if (type === "error_correction") {
    const raw = String(data.corruptedText ?? data.displayText ?? "");
    const parts = raw.split(/(<u>[\s\S]*?<\/u>)/gi);
    return (
      <p className="mt-2 text-sm leading-relaxed font-serif text-slate-900">
        {parts.map((part, i) => {
          const m = part.match(/^<u>([\s\S]*)<\/u>$/i);
          if (m) {
            return (
              <u
                key={i}
                className="mx-0.5 underline decoration-2 decoration-slate-800 underline-offset-4"
              >
                {m[1]}
              </u>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </p>
    );
  }

  if (type === "sentence_order" || type === "paragraph_order") {
    const items = (
      Array.isArray(data.items) ? data.items : []
    ) as { text?: string }[];
    const displayText = String(data.displayText ?? "");
    const isPdf = String(data.format ?? "") === "pdf_phrase_reorder" || displayText.includes("(");
    return (
      <div className="mt-2 space-y-1 text-sm">
        {data.koreanHint ? (
          <p className="text-slate-600">{String(data.koreanHint)}</p>
        ) : null}
        {isPdf && displayText ? (
          <p className="font-serif leading-relaxed text-slate-900 whitespace-pre-wrap">
            {displayText}
          </p>
        ) : (
          <p className="font-serif text-slate-800">
            ({items.map((it) => it.text).filter(Boolean).join(" / ")})
          </p>
        )}
      </div>
    );
  }

  if (type === "writing") {
    const cues = Array.isArray(data.cueWords)
      ? (data.cueWords as string[])
      : [];
    const displayText = String(data.displayText ?? "");
    return (
      <div className="mt-2 space-y-2 text-sm">
        <p className="text-slate-800">{String(data.koreanPrompt ?? "")}</p>
        {cues.length > 0 ? (
          <p className="rounded bg-slate-100 px-2 py-1 font-serif text-slate-800">
            {cues.join(", ")}
          </p>
        ) : null}
        {displayText ? (
          <p className="font-serif leading-relaxed tracking-wide text-slate-900 whitespace-pre-wrap">
            {displayText}
          </p>
        ) : null}
      </div>
    );
  }

  return null;
}

export function WorkbookReviewClient({
  basePath,
  workbook,
  steps,
  questions,
  sentences,
  passageTitle,
}: {
  basePath: string;
  workbook: ExamWorkbook;
  steps: ExamWorkbookStep[];
  questions: ExamWorkbookQuestion[];
  sentences: ExamPassageSentence[];
  passageTitle: string;
}) {
  const router = useRouter();
  const [selectedStepId, setSelectedStepId] = useState(steps[0]?.id ?? "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const autoFillTried = useRef(false);

  const sortedSteps = useMemo(
    () => [...steps].sort((a, b) => a.step_order - b.step_order),
    [steps]
  );

  const stepQuestions = useMemo(
    () =>
      questions
        .filter((q) => q.step_id === selectedStepId)
        .sort((a, b) => a.question_order - b.question_order),
    [questions, selectedStepId]
  );

  const sentenceById = useMemo(() => {
    const map = new Map<string, ExamPassageSentence>();
    for (const s of sentences) map.set(s.id, s);
    return map;
  }, [sentences]);

  const hasEmptyStep = useMemo(() => {
    return sortedSteps.some(
      (st) => !questions.some((q) => q.step_id === st.id && q.is_active)
    );
  }, [sortedSteps, questions]);

  useEffect(() => {
    if (autoFillTried.current) return;
    if (!hasEmptyStep || workbook.status === "approved") return;
    autoFillTried.current = true;
    void (async () => {
      setLoading(true);
      const result = await fillEmptyWorkbookQuestionsAction(workbook.id);
      setLoading(false);
      if (result.ok && result.filledQuestions > 0) {
        setMessage(result.message);
        router.refresh();
      }
    })();
  }, [hasEmptyStep, workbook.id, workbook.status, router]);

  async function toggleActive(q: ExamWorkbookQuestion) {
    setLoading(true);
    setMessage(null);
    const result = await updateQuestionAction(q.id, {
      is_active: !q.is_active,
    });
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    router.refresh();
  }

  async function regenerate(stepId: string) {
    if (
      !confirm(
        "이 단계의 문항을 다시 생성합니다. 기존 문항이 삭제됩니다. 계속할까요?"
      )
    ) {
      return;
    }
    setLoading(true);
    setMessage(null);
    const result = await regenerateStepQuestionsAction(stepId);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    const src =
      "source" in result && result.source === "ai"
        ? "AI"
        : "source" in result && result.source === "rule"
          ? "규칙"
          : "";
    const credit =
      "creditWarning" in result && result.creditWarning
        ? ` (크레딧: ${result.creditWarning})`
        : "";
    setMessage(
      `${result.count}개 문항 생성${src ? ` · ${src}` : ""}${credit}`
    );
    router.refresh();
  }

  async function generateAll() {
    setLoading(true);
    setMessage(null);
    const fill = await fillEmptyWorkbookQuestionsAction(workbook.id);
    if (fill.ok && fill.filledQuestions > 0) {
      setMessage(fill.message);
      setLoading(false);
      router.refresh();
      return;
    }
    try {
      const res = await fetch("/api/exam-prep/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ workbookId: workbook.id, force: true }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        setMessage(json.message ?? "생성 실패");
      } else {
        setMessage(json.message ?? `${json.questionCount}개 문항 생성`);
        router.refresh();
      }
    } catch {
      setMessage("생성 요청 중 오류가 발생했습니다.");
    }
    setLoading(false);
  }

  async function approve() {
    if (!confirm("이 워크북을 승인할까요? 승인 후 학생에게 배정할 수 있습니다.")) {
      return;
    }
    setLoading(true);
    setMessage(null);
    const result = await approveWorkbookAction(workbook.id);
    setLoading(false);
    if (!result.ok) {
      setMessage(result.message);
      return;
    }
    setMessage("승인되었습니다.");
    router.refresh();
  }

  function stepLabel(step: ExamWorkbookStep) {
    const key = step.step_type as ExamStepType;
    return step.title || EXAM_STEP_LABELS[key] || step.step_type;
  }

  return (
    <div className="space-y-4">
      <div className="ui-section-card flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            {workbook.title}
          </h2>
          <p className="mt-1 text-sm text-slate-600">
            지문: {passageTitle} · 상태: {workbook.status} · 프리셋:{" "}
            {workbook.preset_type ?? "-"}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() =>
              router.push(`${basePath}/workbooks/${workbook.id}/print`)
            }
          >
            인쇄 / PDF
          </Button>
          {workbook.status !== "approved" && (
            <Button
              type="button"
              variant="secondary"
              disabled={loading}
              onClick={() => void generateAll()}
            >
              빈 단계 자동 채우기
            </Button>
          )}
          {workbook.status !== "approved" && (
            <Button type="button" disabled={loading} onClick={() => void approve()}>
              승인
            </Button>
          )}
        </div>
      </div>

      {message && (
        <p className="rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
          {message}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">단계</h3>
          <ul className="space-y-1">
            {sortedSteps.map((st, idx) => {
              const count = questions.filter(
                (q) => q.step_id === st.id && q.is_active
              ).length;
              const active = st.id === selectedStepId;
              return (
                <li key={st.id}>
                  <button
                    type="button"
                    onClick={() => setSelectedStepId(st.id)}
                    className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                      active
                        ? "bg-brand-700 text-white"
                        : "text-slate-700 hover:bg-slate-50"
                    }`}
                  >
                    {idx + 1}. {stepLabel(st)}
                    <span
                      className={`mt-0.5 block text-xs ${
                        active ? "text-brand-100" : "text-slate-400"
                      }`}
                    >
                      {count}문항
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <h3 className="mb-2 mt-4 text-sm font-semibold text-slate-800">
            문장
          </h3>
          <ul className="max-h-48 space-y-1 overflow-auto text-xs text-slate-600">
            {[...sentences]
              .sort((a, b) => a.sentence_order - b.sentence_order)
              .map((s) => (
                <li key={s.id}>
                  <span className="font-medium text-slate-500">
                    #{s.sentence_order}
                  </span>{" "}
                  {s.english_text.slice(0, 80)}
                  {s.english_text.length > 80 ? "…" : ""}
                </li>
              ))}
          </ul>
        </aside>

        <section className="rounded-xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
            <h3 className="font-semibold text-slate-900">문항</h3>
            {selectedStepId && workbook.status !== "approved" && (
              <Button
                type="button"
                variant="secondary"
                size="sm"
                disabled={loading}
                onClick={() => regenerate(selectedStepId)}
              >
                단계 문항 재생성
              </Button>
            )}
          </div>

          {stepQuestions.length === 0 ? (
            <div className="space-y-3 text-sm text-slate-600">
              <p>
                {loading
                  ? "문항을 자동으로 채우는 중…"
                  : "이 단계에 문항이 없습니다. 잠시 후 자동 생성되거나 「빈 단계 자동 채우기」를 눌러 주세요."}
              </p>
              {!loading && workbook.status !== "approved" && (
                <Button
                  type="button"
                  size="sm"
                  onClick={() => void generateAll()}
                >
                  지금 자동 채우기
                </Button>
              )}
            </div>
          ) : (
            <ul className="space-y-3">
              {stepQuestions.map((q) => {
                const sentence = q.sentence_id
                  ? sentenceById.get(q.sentence_id)
                  : undefined;
                return (
                  <li
                    key={q.id}
                    className={`rounded-xl border p-3 ${
                      q.is_active
                        ? "border-slate-200"
                        : "border-slate-100 bg-slate-50 opacity-70"
                    }`}
                  >
                    <div className="mb-1 flex flex-wrap items-center justify-between gap-2">
                      <span className="text-xs font-medium text-slate-500">
                        #{q.question_order} ·{" "}
                        {EXAM_STEP_LABELS[q.question_type as ExamStepType] ||
                          q.question_type}{" "}
                        · {q.points}점
                        {q.difficulty ? ` · ${q.difficulty}` : ""}
                      </span>
                      <label className="flex items-center gap-1.5 text-xs text-slate-600">
                        <input
                          type="checkbox"
                          checked={q.is_active}
                          disabled={loading}
                          onChange={() => toggleActive(q)}
                        />
                        활성
                      </label>
                    </div>
                    <p className="text-sm font-medium text-slate-800">
                      {q.question_text}
                    </p>
                    {sentence && (
                      <p className="mt-1 text-xs text-slate-500">
                        문장 #{sentence.sentence_order}
                      </p>
                    )}
                    <QuestionPreview q={q} />
                    {q.explanation && (
                      <p className="mt-1 text-xs text-slate-500">
                        해설: {q.explanation}
                      </p>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </div>
    </div>
  );
}
