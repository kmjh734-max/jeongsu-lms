"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

type QuestionRow = {
  id: string;
  category: string;
  question_type: string;
  difficulty: string;
  choice_language: string | null;
  instruction: string;
  question_text: string;
  passage_modified: string | null;
  choices: Array<{ number: number; text: string }> | null;
  correct_answer: unknown;
  explanation: string;
  evidence: Array<{ sentence: string; description: string }> | null;
  scoring_guide: unknown;
  validation_score: number | null;
  validation_result: { warnings?: string[] } | null;
  status: string;
  error_message: string | null;
  option_key: string | null;
};

const CATEGORY_LABEL: Record<string, string> = {
  main_idea: "대의 파악",
  details: "세부 정보",
  inference: "추론 능력",
  grammar_vocabulary: "어법·어휘",
  subjective: "주관식·서술형",
};

const STATUS_LABEL: Record<string, string> = {
  pending: "대기",
  analyzing: "지문 분석 중",
  generating: "생성 중",
  validating: "검수 중",
  partially_completed: "일부 완료",
  completed: "완료",
  failed: "실패",
};

export function GenerationDetailClient({
  jobId,
  basePath,
}: {
  jobId: string;
  basePath: string;
}) {
  const [job, setJob] = useState<{
    status: string;
    progress_message: string | null;
    total_requested: number;
    total_completed: number;
    total_failed: number;
    error_message: string | null;
    request_config?: { title?: string };
    english_source_passages?: { title?: string; passage?: string };
  } | null>(null);
  const [questions, setQuestions] = useState<QuestionRow[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Partial<QuestionRow>>({});
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch(`/api/question-generator/jobs/${jobId}`);
    const data = await res.json();
    if (!data.ok) {
      setError(data.message ?? "불러오기 실패");
      return;
    }
    setJob(data.job);
    setQuestions(data.questions ?? []);
  }, [jobId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    if (!job) return;
    const running = ["pending", "analyzing", "generating", "validating"].includes(
      job.status
    );
    if (!running) return;
    const t = window.setInterval(() => void load(), 2500);
    return () => window.clearInterval(t);
  }, [job, load]);

  const grouped = useMemo(() => {
    const map = new Map<string, QuestionRow[]>();
    for (const q of questions) {
      const list = map.get(q.category) ?? [];
      list.push(q);
      map.set(q.category, list);
    }
    return map;
  }, [questions]);

  async function approveOne(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/question-generator/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message);
        return;
      }
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function approveAll() {
    const risky = questions.filter(
      (q) =>
        (q.validation_score != null && q.validation_score < 85) ||
        (q.validation_result?.warnings?.length ?? 0) > 0 ||
        q.status === "needs_review"
    );
    if (risky.length > 0) {
      const ok = window.confirm(
        `검수 점수·경고가 있는 문항 ${risky.length}개가 포함되어 있습니다. 그래도 일괄 승인할까요?`
      );
      if (!ok) return;
    }
    for (const q of questions) {
      if (q.status === "approved") continue;
      await fetch(`/api/question-generator/questions/${q.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "approved" }),
      });
    }
    await load();
  }

  async function runAction(id: string, action: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/question-generator/questions/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      const data = await res.json();
      if (!data.ok) setError(data.message ?? "처리 실패");
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function saveEdit(id: string) {
    setBusyId(id);
    try {
      const res = await fetch(`/api/question-generator/questions/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          instruction: editDraft.instruction,
          question_text: editDraft.question_text,
          passage_modified: editDraft.passage_modified,
          choices: editDraft.choices,
          correct_answer: editDraft.correct_answer,
          explanation: editDraft.explanation,
          evidence: editDraft.evidence,
        }),
      });
      const data = await res.json();
      if (!data.ok) {
        setError(data.message);
        return;
      }
      setEditingId(null);
      await load();
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string) {
    if (!window.confirm("이 문제를 삭제할까요?")) return;
    await fetch(`/api/question-generator/questions/${id}`, { method: "DELETE" });
    await load();
  }

  async function retryJob() {
    setError(null);
    void fetch(`/api/question-generator/jobs/${jobId}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "retry" }),
    });
    window.setTimeout(() => void load(), 800);
  }

  const running =
    job &&
    ["pending", "analyzing", "generating", "validating"].includes(job.status);

  return (
    <div>
      <PageHeader
        title={
          job?.request_config?.title ||
          job?.english_source_passages?.title ||
          "생성 결과"
        }
        description="유형별로 생성된 문제를 검토·수정·승인합니다."
        action={
          <div className="flex flex-wrap gap-2">
            <Link
              href={`${basePath}`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              ← 생성으로
            </Link>
            <Link
              href={`${basePath}/generations`}
              className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
            >
              생성 기록
            </Link>
            {questions.length > 0 && (
              <Button type="button" onClick={() => void approveAll()}>
                일괄 승인
              </Button>
            )}
          </div>
        }
      />

      {error && (
        <div className="mb-4">
          <Alert variant="error">{error}</Alert>
        </div>
      )}

      {job && (
        <div className="mb-6 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="rounded-full bg-slate-100 px-3 py-1 font-semibold text-slate-800">
              {STATUS_LABEL[job.status] ?? job.status}
            </span>
            <span className="text-slate-600">
              {job.progress_message || "—"}
            </span>
            <span className="text-slate-500">
              완료 {job.total_completed}/{job.total_requested}
              {job.total_failed > 0 ? ` · 실패 ${job.total_failed}` : ""}
            </span>
            {running && (
              <span className="animate-pulse text-brand-700">진행 중…</span>
            )}
            {(job.status === "failed" || job.status === "partially_completed") && (
              <Button type="button" variant="secondary" onClick={() => void retryJob()}>
                실패 유형 재시도
              </Button>
            )}
          </div>
          {job.error_message && (
            <p className="mt-2 text-sm text-red-600">{job.error_message}</p>
          )}
        </div>
      )}

      {[...grouped.entries()].map(([cat, list]) => (
        <section key={cat} className="mb-6">
          <h2 className="mb-3 text-base font-semibold text-slate-900">
            {CATEGORY_LABEL[cat] ?? cat}{" "}
            <span className="text-sm font-normal text-slate-500">
              {list.length}문항
            </span>
          </h2>
          <div className="space-y-4">
            {list.map((q) => {
              const editing = editingId === q.id;
              return (
                <article
                  key={q.id}
                  className="rounded-2xl border border-slate-200 bg-white p-4 shadow-card"
                >
                  <div className="mb-2 flex flex-wrap items-center gap-2 text-xs">
                    <span className="rounded bg-brand-50 px-2 py-0.5 font-semibold text-brand-800">
                      {q.question_type}
                    </span>
                    <span className="rounded bg-slate-100 px-2 py-0.5">
                      {q.difficulty}
                    </span>
                    {q.choice_language && (
                      <span className="rounded bg-slate-100 px-2 py-0.5">
                        {q.choice_language}
                      </span>
                    )}
                    <span
                      className={`rounded px-2 py-0.5 font-medium ${
                        q.status === "approved"
                          ? "bg-emerald-100 text-emerald-800"
                          : q.status === "needs_review"
                            ? "bg-amber-100 text-amber-900"
                            : "bg-slate-100 text-slate-700"
                      }`}
                    >
                      {q.status}
                    </span>
                    {q.validation_score != null && (
                      <span className="text-slate-600">
                        검수 {q.validation_score}점
                      </span>
                    )}
                  </div>

                  {(q.validation_result?.warnings?.length ?? 0) > 0 && (
                    <p className="mb-2 text-xs text-amber-800">
                      경고: {q.validation_result!.warnings!.join(" · ")}
                    </p>
                  )}
                  {q.error_message && (
                    <p className="mb-2 text-xs text-red-600">{q.error_message}</p>
                  )}

                  {editing ? (
                    <div className="space-y-2">
                      <label className="block text-xs">
                        발문
                        <textarea
                          className="ui-input mt-1 min-h-[60px]"
                          value={editDraft.instruction ?? ""}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              instruction: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="block text-xs">
                        문제
                        <textarea
                          className="ui-input mt-1 min-h-[80px]"
                          value={editDraft.question_text ?? ""}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              question_text: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="block text-xs">
                        변형 지문
                        <textarea
                          className="ui-input mt-1 min-h-[100px] font-serif"
                          value={editDraft.passage_modified ?? ""}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              passage_modified: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <label className="block text-xs">
                        선택지 (JSON)
                        <textarea
                          className="ui-input mt-1 min-h-[100px] font-mono text-xs"
                          value={JSON.stringify(editDraft.choices ?? [], null, 2)}
                          onChange={(e) => {
                            try {
                              setEditDraft((d) => ({
                                ...d,
                                choices: JSON.parse(e.target.value),
                              }));
                            } catch {
                              /* ignore while typing */
                            }
                          }}
                        />
                      </label>
                      <label className="block text-xs">
                        정답
                        <input
                          className="ui-input mt-1"
                          value={String(editDraft.correct_answer ?? "")}
                          onChange={(e) => {
                            const v = e.target.value;
                            const num = Number(v);
                            setEditDraft((d) => ({
                              ...d,
                              correct_answer: Number.isFinite(num) && v.trim() !== ""
                                ? num
                                : v,
                            }));
                          }}
                        />
                      </label>
                      <label className="block text-xs">
                        해설
                        <textarea
                          className="ui-input mt-1 min-h-[80px]"
                          value={editDraft.explanation ?? ""}
                          onChange={(e) =>
                            setEditDraft((d) => ({
                              ...d,
                              explanation: e.target.value,
                            }))
                          }
                        />
                      </label>
                      <div className="flex gap-2">
                        <Button
                          type="button"
                          disabled={busyId === q.id}
                          onClick={() => void saveEdit(q.id)}
                        >
                          저장
                        </Button>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setEditingId(null)}
                        >
                          취소
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-medium text-slate-900">
                        {q.instruction}
                      </p>
                      {q.passage_modified && (
                        <pre className="mt-2 whitespace-pre-wrap rounded-lg bg-slate-50 p-3 font-serif text-sm text-slate-800">
                          {q.passage_modified}
                        </pre>
                      )}
                      <p className="mt-2 whitespace-pre-wrap text-sm text-slate-800">
                        {q.question_text}
                      </p>
                      {q.choices && q.choices.length > 0 && (
                        <ul className="mt-2 space-y-1 text-sm">
                          {q.choices.map((c) => (
                            <li key={c.number}>
                              {c.number}. {c.text}
                            </li>
                          ))}
                        </ul>
                      )}
                      <p className="mt-2 text-sm">
                        <span className="font-semibold text-brand-800">정답</span>{" "}
                        {JSON.stringify(q.correct_answer)}
                      </p>
                      <p className="mt-1 text-sm text-slate-700">
                        <span className="font-semibold">해설</span> {q.explanation}
                      </p>
                      {q.evidence && q.evidence.length > 0 && (
                        <div className="mt-2 text-xs text-slate-600">
                          <p className="font-semibold">근거</p>
                          <ul className="list-disc pl-4">
                            {q.evidence.map((e, i) => (
                              <li key={i}>
                                {e.sentence} — {e.description}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </>
                  )}

                  <div className="mt-3 flex flex-wrap gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() => {
                        setEditingId(q.id);
                        setEditDraft(q);
                      }}
                    >
                      수정
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busyId === q.id}
                      onClick={() => void runAction(q.id, "regenerate")}
                    >
                      전체 재생성
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busyId === q.id}
                      onClick={() => void runAction(q.id, "regenerate_choices")}
                    >
                      선택지만 재생성
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      disabled={busyId === q.id}
                      onClick={() => void runAction(q.id, "revalidate")}
                    >
                      다시 검수
                    </Button>
                    <Button
                      type="button"
                      disabled={busyId === q.id || q.status === "approved"}
                      onClick={() => void approveOne(q.id)}
                    >
                      승인
                    </Button>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={() =>
                        void fetch(`/api/question-generator/questions/${q.id}`, {
                          method: "PATCH",
                          headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ status: "needs_review" }),
                        }).then(load)
                      }
                    >
                      검수 보류
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      onClick={() => void remove(q.id)}
                    >
                      삭제
                    </Button>
                    <Link
                      href={`${basePath}/questions/${q.id}`}
                      className="rounded-lg border border-slate-300 px-3 py-2 text-sm"
                    >
                      상세
                    </Link>
                  </div>
                </article>
              );
            })}
          </div>
        </section>
      ))}

      {!running && questions.length === 0 && job?.status === "completed" && (
        <Alert variant="info">생성된 문항이 없습니다.</Alert>
      )}
    </div>
  );
}
