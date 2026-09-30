"use client";

import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert } from "@/components/ui/Alert";
import { Button } from "@/components/ui/Button";
import { PageHeader } from "@/components/ui/PageHeader";

/**
 * 만들어 둔 문제를 유형별로 골라 새 시험지로 조립한다.
 *
 * 선생님 요청(2026-09-30): 한 묶음에 여러 유형이 있는데 거기서 한 유형만 쓰고
 * 새 유형을 더해 조립하고 싶다. 그게 안 되니 이미 만든 유형도 다시 만들게 된다.
 *
 * 전에는 만든 차례대로 백 개를 늘어놓기만 했다. 이제 유형으로 묶어 접었다 펴고,
 * 유형 하나를 통째로 고를 수 있다. 생성 묶음으로도 거른다.
 */

type Q = {
  id: string;
  category: string;
  question_type: string;
  option_key: string | null;
  difficulty: string;
  instruction: string;
  question_text: string;
  status: string;
  validation_score: number | null;
  created_at: string;
  generation_job_id: string | null;
};

/** "writing:na:default:제시어배열기본" → "제시어배열기본" */
function typeLabel(q: Q): string {
  const tail = (q.option_key ?? "").split(":").pop();
  return tail?.trim() || q.question_type || "기타";
}

export function QuestionBankListClient({
  basePath,
  status,
  title,
  description,
}: {
  basePath: string;
  status: string;
  title: string;
  description: string;
}) {
  const [questions, setQuestions] = useState<Q[]>([]);
  const [jobTitles, setJobTitles] = useState<Record<string, string>>({});
  const [selected, setSelected] = useState<Record<string, boolean>>({});
  const [error, setError] = useState<string | null>(null);
  const [setTitle, setSetTitle] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [savedSetId, setSavedSetId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [jobFilter, setJobFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  /*
   * 유형 묶음은 접힌 채로 연다. 다 펴 두면 천 문항이 한꺼번에 그려져
   * 화면이 한없이 길어진다. 유형을 하나로 걸러 두면 그것만 펴 준다.
   */
  const [opened, setOpened] = useState<Record<string, boolean>>({});

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `/api/question-generator/questions?status=${encodeURIComponent(status)}&limit=1000`
      );
      const d = await res.json();
      if (!d.ok) setError(d.message);
      else {
        setQuestions(d.questions ?? []);
        setJobTitles(d.jobTitles ?? {});
      }
    } catch {
      setError("목록을 불러오지 못했습니다.");
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => {
    void load();
  }, [load]);

  const pickable = status === "approved";

  /** 거른 뒤 유형별로 묶는다 */
  const groups = useMemo(() => {
    const rows = questions.filter(
      (q) =>
        (!jobFilter || q.generation_job_id === jobFilter) &&
        (!typeFilter || typeLabel(q) === typeFilter)
    );
    const map = new Map<string, Q[]>();
    for (const q of rows) {
      const key = typeLabel(q);
      const list = map.get(key) ?? [];
      list.push(q);
      map.set(key, list);
    }
    return [...map.entries()].sort((a, b) => b[1].length - a[1].length);
  }, [questions, jobFilter, typeFilter]);

  const allTypes = useMemo(
    () => [...new Set(questions.map(typeLabel))].sort(),
    [questions]
  );
  const allJobs = useMemo(() => {
    const ids = [
      ...new Set(questions.map((q) => q.generation_job_id).filter(Boolean)),
    ] as string[];
    return ids.map((id) => ({ id, label: jobTitles[id] ?? "이름 없는 묶음" }));
  }, [questions, jobTitles]);

  const chosenIds = useMemo(
    () => Object.entries(selected).filter(([, v]) => v).map(([id]) => id),
    [selected]
  );

  function toggleGroup(list: Q[], on: boolean) {
    setSelected((s) => {
      const next = { ...s };
      for (const q of list) next[q.id] = on;
      return next;
    });
  }

  async function createSet() {
    if (chosenIds.length === 0) {
      setError("문제를 골라 주세요.");
      return;
    }
    if (!setTitle.trim()) {
      setError("시험지 이름을 적어 주세요.");
      return;
    }
    setError(null);
    const res = await fetch("/api/question-generator/sets", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: setTitle,
        items: chosenIds.map((questionId, orderIndex) => ({
          questionId,
          orderIndex,
        })),
      }),
    });
    const data = await res.json();
    if (!data.ok) {
      setError(data.message);
      return;
    }
    setSavedSetId(data.set?.id ?? null);
    setMessage(`「${setTitle}」을 ${chosenIds.length}문항으로 만들었어요.`);
    setSelected({});
    setSetTitle("");
  }

  return (
    <div>
      <PageHeader
        title={title}
        description={description}
        action={
          <Link href={basePath} className="rounded-lg border px-3 py-2 text-sm">
            ← 생성
          </Link>
        }
      />
      {error && (
        <div className="mb-3">
          <Alert variant="error">{error}</Alert>
        </div>
      )}
      {message && (
        <div className="mb-3">
          <Alert variant="success">
            {message}
            {savedSetId ? (
              <>
                {" "}
                <Link
                  href={`${basePath}/sets/${savedSetId}/print?mode=exam`}
                  className="font-semibold underline"
                >
                  시험지 보기
                </Link>
              </>
            ) : null}
          </Alert>
        </div>
      )}

      {/* 거르개 */}
      <div className="mb-3 flex flex-wrap items-end gap-2 rounded-xl border border-slate-200 bg-white p-3">
        <label className="block">
          <span className="ui-label">생성 묶음</span>
          <select
            className="ui-input mt-1 h-9 w-56"
            value={jobFilter}
            onChange={(e) => setJobFilter(e.target.value)}
          >
            <option value="">전체</option>
            {allJobs.map((j) => (
              <option key={j.id} value={j.id}>
                {j.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="ui-label">유형</span>
          <select
            className="ui-input mt-1 h-9 w-48"
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
          >
            <option value="">전체</option>
            {allTypes.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <p className="ml-auto text-sm text-slate-500">
          {loading
            ? "불러오는 중…"
            : `${groups.reduce((s, [, l]) => s + l.length, 0)}문항 · 유형 ${groups.length}가지`}
        </p>
      </div>

      {/* 고른 것으로 시험지 만들기 */}
      {pickable && (
        <div className="mb-4 flex flex-wrap items-end gap-2 rounded-xl border border-brand-200 bg-brand-50/40 p-3">
          <label className="block grow">
            <span className="ui-label">고른 {chosenIds.length}문항으로 시험지 만들기</span>
            <input
              className="ui-input mt-1"
              value={setTitle}
              onChange={(e) => setSetTitle(e.target.value)}
              placeholder="시험지 이름 (예: 3과 어법·요약 모음)"
            />
          </label>
          <Button type="button" onClick={() => void createSet()}>
            시험지로 묶기
          </Button>
          {chosenIds.length > 0 ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => setSelected({})}
            >
              고른 것 비우기
            </Button>
          ) : null}
        </div>
      )}

      <div className="space-y-3">
        {groups.map(([type, list]) => {
          const on = list.filter((q) => selected[q.id]).length;
          const shut = !(opened[type] ?? Boolean(typeFilter));
          return (
            <section
              key={type}
              className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm"
            >
              <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2">
                <button
                  type="button"
                  onClick={() => setOpened((o) => ({ ...o, [type]: shut }))}
                  className="text-sm font-bold text-slate-900"
                >
                  {shut ? "▸" : "▾"} {type}
                  <span className="ml-1.5 text-xs font-normal text-slate-500">
                    {list.length}문항
                  </span>
                </button>
                {pickable && (
                  <div className="ml-auto flex items-center gap-2">
                    {on > 0 ? (
                      <span className="text-xs font-semibold text-brand-700">
                        {on}개 고름
                      </span>
                    ) : null}
                    <button
                      type="button"
                      onClick={() => toggleGroup(list, on !== list.length)}
                      className="rounded border border-slate-300 bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 hover:bg-slate-50"
                    >
                      {on === list.length ? "이 유형 빼기" : "이 유형 모두 고르기"}
                    </button>
                  </div>
                )}
              </div>
              {!shut && (
                <div className="divide-y divide-slate-100">
                  {list.map((q) => (
                    <label key={q.id} className="flex gap-3 px-3 py-2">
                      {pickable && (
                        <input
                          type="checkbox"
                          className="mt-1"
                          checked={!!selected[q.id]}
                          onChange={(e) =>
                            setSelected((s) => ({ ...s, [q.id]: e.target.checked }))
                          }
                        />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                          <span>{q.difficulty}</span>
                          {q.generation_job_id ? (
                            <span className="truncate">
                              {jobTitles[q.generation_job_id] ?? "묶음"}
                            </span>
                          ) : null}
                          {q.validation_score != null && (
                            <span>검수 {q.validation_score}</span>
                          )}
                          <span>
                            {new Date(q.created_at).toLocaleDateString("ko-KR")}
                          </span>
                        </div>
                        <p className="mt-0.5 truncate text-sm font-medium text-slate-900">
                          {q.instruction || q.question_text}
                        </p>
                        <Link
                          href={`${basePath}/questions/${q.id}`}
                          className="mt-0.5 inline-block text-xs text-brand-700 hover:underline"
                        >
                          상세 보기
                        </Link>
                      </div>
                    </label>
                  ))}
                </div>
              )}
            </section>
          );
        })}
        {!loading && groups.length === 0 && (
          <p className="py-10 text-center text-sm text-slate-500">
            보일 문제가 없어요.
          </p>
        )}
      </div>
    </div>
  );
}
