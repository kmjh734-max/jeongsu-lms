"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type Question = { word: string; choices: string[] };
type Answer = number | "unknown";
type Answers = Record<string, Answer>;

type Props = {
  token: string;
  initialState: "ready" | "in_progress" | "submitted";
  academyName: string;
  candidateName: string;
  candidateGrade: string;
  targetLabel: string;
  title: string;
  questionCount: number;
  minutes: number;
  intro: string;
};

/**
 * 어휘 진단 응시 화면(모바일 우선, 한 화면에 한 문항).
 * 답은 고를 때마다 서버에 저장하고(새로고침해도 서버 답으로 이어 감), 채점은 서버가 한다.
 */
export function DiagTakeClient(props: Props) {
  const api = `/api/diag/${props.token}`;
  const [phase, setPhase] = useState<"intro" | "loading" | "quiz" | "review" | "done" | "error">(
    props.initialState === "ready" ? "intro" : "loading",
  );
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Answers>({});
  const [index, setIndex] = useState(0);
  const [message, setMessage] = useState("");
  const [saveState, setSaveState] = useState<"idle" | "saving" | "saved" | "failed">("idle");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const pending = useRef<Answers | null>(null);
  const saving = useRef(false);

  const fail = (text: string) => {
    setMessage(text);
    setPhase("error");
  };

  // 이어 풀기·제출 완료: 서버에 있는 기록을 받아 온다
  useEffect(() => {
    if (props.initialState === "ready") return;
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch(api, { cache: "no-store" });
        const data = await res.json();
        if (cancelled) return;
        if (!data.ok) return fail(data.message ?? "시험을 불러오지 못했습니다.");
        if (data.state === "submitted") {
          setResultUrl(data.resultUrl ?? null);
          setPhase("done");
          return;
        }
        if (data.attempt) {
          setQuestions(data.attempt.questions);
          setAnswers(data.attempt.answers ?? {});
          const firstBlank = data.attempt.questions.findIndex((_: Question, i: number) => data.attempt.answers?.[String(i)] === undefined);
          setIndex(firstBlank >= 0 ? firstBlank : 0);
          setPhase("quiz");
        } else setPhase("intro");
      } catch {
        if (!cancelled) fail("인터넷 연결을 확인한 뒤 새로고침해 주세요.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [api, props.initialState]);

  /** 마지막으로 고른 답 묶음을 서버에 보낸다. 보내는 중에 또 고르면 끝난 뒤 한 번 더 보낸다. */
  const flush = useCallback(async () => {
    if (saving.current || !pending.current) return;
    saving.current = true;
    const snapshot = pending.current;
    pending.current = null;
    setSaveState("saving");
    try {
      const res = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "save", answers: snapshot }) });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.ok) {
        if (data.kind === "submitted") {
          setPhase("done");
          return;
        }
        throw new Error();
      }
      setSaveState("saved");
    } catch {
      pending.current = pending.current ?? snapshot;
      setSaveState("failed");
    } finally {
      saving.current = false;
      if (pending.current) void flush();
    }
  }, [api]);

  const choose = (value: Answer) => {
    const next = { ...answers, [String(index)]: value };
    setAnswers(next);
    pending.current = next;
    void flush();
  };

  const start = async () => {
    setPhase("loading");
    try {
      const res = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "start" }) });
      const data = await res.json();
      if (!data.ok) {
        if (data.kind === "submitted") return setPhase("done");
        return fail(data.message ?? "시험을 시작하지 못했습니다.");
      }
      setQuestions(data.attempt.questions);
      setAnswers(data.attempt.answers ?? {});
      setIndex(0);
      setPhase("quiz");
    } catch {
      fail("인터넷 연결을 확인한 뒤 다시 눌러 주세요.");
    }
  };

  const submit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await fetch(api, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ action: "submit", answers }) });
      const data = await res.json();
      if (!data.ok || !data.resultUrl) throw new Error(data.message);
      setResultUrl(data.resultUrl);
      setPhase("done");
      window.location.href = data.resultUrl;
    } catch (e) {
      setMessage(e instanceof Error && e.message ? e.message : "제출하지 못했습니다. 인터넷 연결을 확인한 뒤 다시 눌러 주세요.");
      setSubmitting(false);
    }
  };

  const total = questions.length;
  const answered = Object.keys(answers).length;
  const blank = total - answered;

  return (
    <main className="mx-auto min-h-dvh w-full max-w-md bg-white px-4 pb-10 pt-5 text-slate-900">
      <header className="mb-4">
        <p className="text-xs font-semibold text-brand-700">{props.academyName}</p>
        <h1 className="mt-0.5 text-lg font-bold leading-snug">{props.title}</h1>
      </header>

      {phase === "intro" && (
        <section className="space-y-4">
          <dl className="grid grid-cols-[5.5rem_1fr] gap-y-2 rounded-xl border border-slate-200 bg-slate-50 p-4 text-sm">
            <dt className="text-slate-500">응시자</dt>
            <dd className="font-semibold">{props.candidateName}{props.candidateGrade ? ` (${props.candidateGrade})` : ""}</dd>
            <dt className="text-slate-500">진단 대상</dt>
            <dd>{props.targetLabel}</dd>
            <dt className="text-slate-500">문항 수</dt>
            <dd>{props.questionCount}문항</dd>
            <dt className="text-slate-500">권장 시간</dt>
            <dd>{props.minutes}분 (시간이 지나도 계속 풀 수 있어요)</dd>
          </dl>
          {props.intro && <p className="whitespace-pre-line text-sm leading-relaxed text-slate-700">{props.intro}</p>}
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-600">
            <li>영어 단어를 보고 알맞은 우리말 뜻을 고릅니다.</li>
            <li>모르는 단어는 「모르겠어요」를 누르세요.</li>
            <li>답은 바로 저장되어, 창을 닫았다 열어도 이어서 풀 수 있어요.</li>
            <li>제출한 뒤에는 답을 바꿀 수 없습니다.</li>
          </ul>
          <p className="text-xs text-slate-500">응시자 정보가 다르면 시작하지 말고 학원에 알려 주세요.</p>
          <button type="button" onClick={start} className="h-14 w-full rounded-xl bg-brand-600 text-base font-bold text-white active:bg-brand-700">
            시험 시작
          </button>
        </section>
      )}

      {phase === "loading" && <p className="py-16 text-center text-sm text-slate-500">불러오는 중…</p>}

      {phase === "error" && (
        <section className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800" role="alert">
          {message}
        </section>
      )}

      {phase === "quiz" && total > 0 && (
        <section>
          <div className="mb-1 flex items-center justify-between text-xs text-slate-500">
            <span>
              <strong className="text-sm text-slate-900">{index + 1}</strong> / {total}
            </span>
            <span aria-live="polite">
              {saveState === "saving" ? "저장 중…" : saveState === "failed" ? "저장 실패 — 다시 시도 중" : saveState === "saved" ? "저장됨" : ""}
            </span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100" aria-hidden>
            <div className="h-full bg-brand-500 transition-all" style={{ width: `${(answered / total) * 100}%` }} />
          </div>

          <p className="mt-8 break-words text-center text-3xl font-bold tracking-tight" lang="en">
            {questions[index]!.word}
          </p>
          <p className="mt-1 text-center text-xs text-slate-500">알맞은 뜻을 고르세요</p>

          <div className="mt-6 space-y-2.5" role="radiogroup" aria-label={`${index + 1}번 문항 보기`}>
            {questions[index]!.choices.map((c, i) => {
              const on = answers[String(index)] === i;
              return (
                <button
                  key={i}
                  type="button"
                  role="radio"
                  aria-checked={on}
                  onClick={() => choose(i)}
                  className={`flex min-h-[3.25rem] w-full items-center gap-3 rounded-xl border-2 px-4 py-3 text-left text-base transition focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-300 ${
                    on ? "border-brand-600 bg-brand-50 font-semibold text-brand-800" : "border-slate-200 bg-white active:bg-slate-50"
                  }`}
                >
                  <span className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border text-xs ${on ? "border-brand-600 bg-brand-600 text-white" : "border-slate-300 text-slate-500"}`}>
                    {i + 1}
                  </span>
                  <span className="break-keep">{c}</span>
                </button>
              );
            })}
            <button
              type="button"
              role="radio"
              aria-checked={answers[String(index)] === "unknown"}
              onClick={() => choose("unknown")}
              className={`h-12 w-full rounded-xl border-2 text-sm transition focus:outline-none focus-visible:ring-2 focus-visible:ring-slate-300 ${
                answers[String(index)] === "unknown" ? "border-slate-700 bg-slate-700 font-semibold text-white" : "border-dashed border-slate-300 text-slate-600 active:bg-slate-50"
              }`}
            >
              모르겠어요
            </button>
          </div>

          <div className="mt-8 grid grid-cols-2 gap-2.5">
            <button type="button" disabled={index === 0} onClick={() => setIndex(index - 1)} className="h-12 rounded-xl border border-slate-300 text-sm font-semibold disabled:opacity-40">
              이전
            </button>
            {index < total - 1 ? (
              <button type="button" onClick={() => setIndex(index + 1)} className="h-12 rounded-xl bg-brand-600 text-sm font-semibold text-white active:bg-brand-700">
                다음
              </button>
            ) : (
              <button type="button" onClick={() => setPhase("review")} className="h-12 rounded-xl bg-brand-600 text-sm font-semibold text-white active:bg-brand-700">
                제출하기
              </button>
            )}
          </div>
          {index < total - 1 && (
            <button type="button" onClick={() => setPhase("review")} className="mt-3 w-full text-center text-xs text-slate-500 underline underline-offset-2">
              다 풀었어요 — 제출하러 가기
            </button>
          )}
        </section>
      )}

      {phase === "review" && (
        <section className="space-y-4">
          <h2 className="text-base font-bold">제출 전에 확인해 주세요</h2>
          <p className="text-sm text-slate-700">
            전체 {total}문항 가운데 <strong>{answered}</strong>문항에 답했습니다.
            {blank > 0 ? (
              <> 아직 <strong className="text-red-700">{blank}문항</strong>이 비어 있어요. 비운 채로도 제출할 수 있습니다.</>
            ) : null}
          </p>
          {blank > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {questions.map((_, i) =>
                answers[String(i)] === undefined ? (
                  <button key={i} type="button" onClick={() => { setIndex(i); setPhase("quiz"); }} className="h-9 min-w-9 rounded-lg border border-red-200 bg-red-50 px-2 text-sm font-semibold text-red-700">
                    {i + 1}
                  </button>
                ) : null,
              )}
            </div>
          )}
          <p className="text-xs text-slate-500">제출하면 답을 바꿀 수 없습니다.</p>
          {message && <p className="text-sm text-red-700" role="alert">{message}</p>}
          <div className="grid grid-cols-2 gap-2.5">
            <button type="button" onClick={() => setPhase("quiz")} className="h-12 rounded-xl border border-slate-300 text-sm font-semibold">
              돌아가기
            </button>
            <button type="button" disabled={submitting} onClick={submit} className="h-12 rounded-xl bg-brand-600 text-sm font-bold text-white disabled:opacity-60">
              {submitting ? "제출 중…" : "최종 제출"}
            </button>
          </div>
        </section>
      )}

      {phase === "done" && (
        <section className="space-y-4 text-center">
          <p className="pt-8 text-lg font-bold">제출을 마쳤습니다.</p>
          {resultUrl ? (
            <a href={resultUrl} className="inline-flex h-12 items-center justify-center rounded-xl bg-brand-600 px-6 text-sm font-bold text-white">
              내 결과 보기
            </a>
          ) : (
            <p className="text-sm text-slate-600">결과는 학원에서 안내해 드립니다.</p>
          )}
        </section>
      )}
    </main>
  );
}
