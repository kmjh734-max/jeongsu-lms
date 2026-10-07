"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { Button } from "@/components/ui/Button";
import {
  changeQuestionAction,
  confirmTestAction,
  deleteDraftAction,
  newVersionAction,
  reRecommendAction,
  updateDraftAction,
} from "@/app/admin/marketing/vocab-diagnostic/actions";
import type { DiagQuestion } from "@/lib/vocab-diagnostic/types";

type Props = {
  test: {
    id: string;
    status: "draft" | "confirmed";
    title: string;
    questionCount: number;
    minutes: number;
    intro: string;
    questions: DiagQuestion[];
  };
};

/**
 * 시험 검토·확정. 초안에서는 단어를 같은 Day의 다른 단어로 바꾸거나 보기만 다시 만들 수 있고,
 * 확정한 시험은 읽기만 한다(고치려면 새 버전).
 */
export function DiagTestEditor({ test }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [busy, setBusy] = useState<number | null>(null);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState(false);
  const [title, setTitle] = useState(test.title);
  const [count, setCount] = useState(test.questionCount);
  const [minutes, setMinutes] = useState(test.minutes);
  const [intro, setIntro] = useState(test.intro);
  const draft = test.status === "draft";
  const dirty = title !== test.title || count !== test.questionCount || minutes !== test.minutes || intro !== test.intro;

  const run = (fn: () => Promise<{ ok: boolean; error?: string }>, after?: () => void) =>
    start(async () => {
      setError("");
      const r = await fn();
      setBusy(null);
      if (!r.ok) return setError(r.error ?? "처리하지 못했습니다.");
      after?.();
      router.refresh();
    });

  const input = "h-9 w-full rounded-md border border-slate-300 bg-white px-2.5 text-sm disabled:bg-slate-50";
  return (
    <div className="mt-4 space-y-4">
      <section className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${draft ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>{draft ? "초안 — 학생에게 보낼 수 없음" : "출제 확정"}</span>
          {!draft && <span className="text-xs text-slate-500">확정한 시험은 바뀌지 않습니다. 고치려면 새 버전을 만드세요.</span>}
        </div>
        <div className="mt-3 grid gap-3 md:grid-cols-[1fr_8rem_8rem]">
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-slate-600">시험 제목</span>
            <input className={input} value={title} disabled={!draft} onChange={(e) => setTitle(e.target.value)} maxLength={80} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-slate-600">문항 수</span>
            <input className={input} type="number" min={5} max={100} value={count} disabled={!draft} onChange={(e) => setCount(Number(e.target.value))} />
          </label>
          <label className="text-sm">
            <span className="mb-1 block text-xs font-semibold text-slate-600">권장 시간(분)</span>
            <input className={input} type="number" min={1} max={120} value={minutes} disabled={!draft} onChange={(e) => setMinutes(Number(e.target.value))} />
          </label>
          <label className="text-sm md:col-span-3">
            <span className="mb-1 block text-xs font-semibold text-slate-600">안내 문구(시작 화면)</span>
            <textarea className="min-h-[4.5rem] w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm disabled:bg-slate-50" value={intro} disabled={!draft} onChange={(e) => setIntro(e.target.value)} maxLength={600} />
          </label>
        </div>
        {draft && dirty && (
          <div className="mt-3 flex items-center gap-2">
            <Button size="sm" disabled={pending} onClick={() => run(() => updateDraftAction(test.id, { title, questionCount: count, minutes, intro }))}>
              저장
            </Button>
            {count !== test.questionCount && <span className="text-xs text-amber-700">문항 수를 바꾸면 단어를 다시 추천합니다.</span>}
          </div>
        )}
      </section>

      <section className="flex flex-wrap items-center gap-2">
        {draft ? (
          <>
            <Button disabled={pending || dirty} onClick={() => { if (window.confirm("이대로 출제를 확정할까요? 확정한 뒤에는 단어와 보기를 바꿀 수 없습니다.")) run(() => confirmTestAction(test.id)); }}>
              출제 확정
            </Button>
            <Button variant="secondary" disabled={pending} onClick={() => { if (window.confirm("단어를 모두 다시 추천할까요? 지금 고른 단어는 사라집니다.")) run(() => reRecommendAction(test.id)); }}>
              전체 다시 추천
            </Button>
            <Button variant="danger" disabled={pending} onClick={() => { if (window.confirm("이 초안을 지울까요?")) run(() => deleteDraftAction(test.id), () => router.push("/admin/marketing/vocab-diagnostic")); }}>
              초안 지우기
            </Button>
          </>
        ) : (
          <Button variant="secondary" disabled={pending} onClick={() => start(async () => { const r = await newVersionAction(test.id); if (!r.ok) return setError(r.error); router.push(`/admin/marketing/vocab-diagnostic/tests/${r.id}`); })}>
            이 시험으로 새 버전 만들기
          </Button>
        )}
        <label className="ml-auto inline-flex items-center gap-1.5 text-sm text-slate-700">
          <input type="checkbox" checked={preview} onChange={(e) => setPreview(e.target.checked)} /> 학생 화면처럼 보기
        </label>
      </section>
      {error && <p className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800" role="alert">{error}</p>}
      <p className="text-xs text-slate-500">
        정답은 초록색입니다. 보기 가운데 정답과 뜻이 겹치거나 둘 다 맞을 수 있는 것이 있으면 「보기 다시」, 단어가 알맞지 않으면 「단어 바꾸기」(같은 Day의 다른 단어)를 누르세요. Day는 단어장 Day입니다(★ 표시는 수록 빈도이지 난도가 아닙니다).
      </p>

      {preview ? (
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          {test.questions.map((q, i) => (
            <div key={`${q.itemId}-${i}`} className="rounded-xl border border-slate-200 bg-white p-4">
              <p className="text-xs text-slate-500">{i + 1} / {test.questions.length}</p>
              <p className="mt-2 text-center text-2xl font-bold" lang="en">{q.word}</p>
              <div className="mt-3 space-y-1.5">
                {q.choices.map((c, k) => (
                  <div key={k} className="rounded-lg border-2 border-slate-200 px-3 py-2 text-sm">{k + 1}. {c}</div>
                ))}
                <div className="rounded-lg border-2 border-dashed border-slate-300 px-3 py-1.5 text-center text-xs text-slate-500">모르겠어요</div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
          <table className="w-full min-w-[820px] text-sm">
            <thead className="bg-slate-50 text-left text-xs text-slate-500">
              <tr>
                <th className="w-10 px-3 py-2">번호</th>
                <th className="w-16 px-3 py-2">Day</th>
                <th className="px-3 py-2">단어</th>
                <th className="px-3 py-2">보기</th>
                {draft && <th className="w-44 px-3 py-2" />}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {test.questions.map((q, i) => (
                <tr key={`${q.itemId}-${i}`} className={busy === i ? "opacity-50" : ""}>
                  <td className="px-3 py-2 text-slate-400">{i + 1}</td>
                  <td className="px-3 py-2 text-slate-600">{q.day}</td>
                  <td className="px-3 py-2 font-semibold text-slate-900" lang="en">{q.word}</td>
                  <td className="px-3 py-2">
                    <ol className="grid grid-cols-2 gap-x-4 gap-y-0.5">
                      {q.choices.map((c, k) => (
                        <li key={k} className={k === q.answerIndex ? "font-semibold text-emerald-700" : "text-slate-700"}>
                          {k + 1}. {c}
                        </li>
                      ))}
                    </ol>
                  </td>
                  {draft && (
                    <td className="px-3 py-2">
                      <div className="flex justify-end gap-1.5">
                        <Button size="sm" variant="secondary" disabled={pending} onClick={() => { setBusy(i); run(() => changeQuestionAction(test.id, i, "choices")); }}>보기 다시</Button>
                        <Button size="sm" variant="secondary" disabled={pending} onClick={() => { setBusy(i); run(() => changeQuestionAction(test.id, i, "word")); }}>단어 바꾸기</Button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
