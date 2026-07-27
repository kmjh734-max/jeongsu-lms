"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import {
  approveWorkbookAction,
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
    if (
      !confirm(
        "이 단계 문항을 AI로 다시 생성합니다. 기존 문항이 삭제됩니다. 크레딧이 차감될 수 있습니다."
      )
    ) {
      return;
    }
    setLoading(true);
    setMessage(null);
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
    return (
      step.title ||
      EXAM_STEP_LABELS[key] ||
      step.step_type
    );
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
            <>
              <Button
                type="button"
                variant="secondary"
                disabled={loading}
                onClick={generateAll}
              >
                AI로 문항 생성
              </Button>
              <Button type="button" disabled={loading} onClick={approve}>
                승인
              </Button>
            </>
          )}
          <Button
            type="button"
            variant="secondary"
            onClick={() => router.push(`${basePath}/workbooks`)}
          >
            목록
          </Button>
        </div>
      </div>

      {message && (
        <p
          className={`text-sm ${
            message.includes("승인") || message.includes("생성")
              ? "text-green-700"
              : "text-red-600"
          }`}
          role="status"
        >
          {message}
        </p>
      )}

      <div className="grid gap-4 lg:grid-cols-[240px_1fr]">
        <aside className="rounded-xl border border-slate-200 bg-white p-3">
          <h3 className="mb-2 text-sm font-semibold text-slate-800">단계</h3>
          <ul className="space-y-1">
            {sortedSteps.map((step) => (
              <li key={step.id}>
                <button
                  type="button"
                  onClick={() => setSelectedStepId(step.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm ${
                    selectedStepId === step.id
                      ? "bg-brand-600 text-white"
                      : "text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  {step.step_order}. {stepLabel(step)}
                </button>
              </li>
            ))}
          </ul>
          <h3 className="mb-2 mt-4 text-sm font-semibold text-slate-800">
            문장
          </h3>
          <ul className="max-h-64 space-y-1 overflow-y-auto text-xs text-slate-600">
            {sentences
              .slice()
              .sort((a, b) => a.sentence_order - b.sentence_order)
              .map((s) => (
                <li key={s.id} className="rounded border border-slate-100 p-2">
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
            <p className="text-sm text-slate-500">
              이 단계에 문항이 없습니다. 「AI로 문항 생성」을 눌러 주세요.
            </p>
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
                        #{q.question_order} · {q.question_type} · {q.points}점
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
                        문장 #{sentence.sentence_order}:{" "}
                        {sentence.english_text.slice(0, 100)}
                      </p>
                    )}
                    {q.explanation && (
                      <p className="mt-1 text-xs text-slate-500">
                        해설: {q.explanation}
                      </p>
                    )}
                    <pre className="mt-2 max-h-32 overflow-auto rounded-lg bg-slate-50 p-2 text-[11px] text-slate-600">
                      {JSON.stringify(
                        {
                          data: q.question_data,
                          answer: q.correct_answer,
                        },
                        null,
                        2
                      )}
                    </pre>
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
