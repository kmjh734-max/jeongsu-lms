"use client";

import { useCallback, useEffect, useRef, useState, useTransition } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { submitStage3 } from "@/app/student/vocab/actions";
import type { Stage3Question } from "@/lib/vocab/build-stage3-questions";
import { STAGE3_PASS_SCORE } from "@/lib/vocab/build-stage3-questions";

function answerKey(q: Stage3Question): string {
  return `${q.itemId}:${q.questionType}`;
}

interface VocabStage3TestProps {
  setId: string;
  setTitle: string;
  questions: Stage3Question[];
}

export function VocabStage3Test({
  setId,
  setTitle,
  questions,
}: VocabStage3TestProps) {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  const current = questions[index];
  const isLast = index >= questions.length - 1;
  const currentKey = current ? answerKey(current) : "";

  useEffect(() => {
    if (!current || pending) return;
    const t = window.setTimeout(() => inputRef.current?.focus(), 50);
    return () => window.clearTimeout(t);
  }, [index, current, pending]);

  const goNext = useCallback(() => {
    setMessage(null);
    setIndex((i) => Math.min(i + 1, questions.length - 1));
  }, [questions.length]);

  function submitAll() {
    const unanswered = questions.filter(
      (q) => !(answers[answerKey(q)] ?? "").trim()
    ).length;
    const msg =
      unanswered > 0
        ? `미응답 ${unanswered}문항은 오답 처리됩니다. 제출할까요?`
        : "종합테스트를 제출할까요?";
    if (!confirm(msg)) return;

    startTransition(async () => {
      setMessage(null);
      const payload = questions.map((q) => ({
        itemId: q.itemId,
        studentAnswer: answers[answerKey(q)] ?? "",
        questionType: q.questionType,
      }));
      const result = await submitStage3(setId, payload);
      setMessage(result.message);
      if (result.ok && result.attemptId) {
        router.push(
          `/student/vocab/${setId}/stage3/result?attemptId=${result.attemptId}`
        );
      }
    });
  }

  function handleEnter() {
    if (!current || pending) return;
    const value = (answers[currentKey] ?? "").trim();
    if (!value) {
      setMessage("답을 입력해주세요.");
      inputRef.current?.focus();
      return;
    }
    setMessage(null);
    if (isLast) {
      submitAll();
    } else {
      goNext();
    }
  }

  if (questions.length === 0) {
    return <p className="text-center text-slate-600">단어가 없습니다.</p>;
  }

  const isMeaning = current?.questionType === "meaning";

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 px-2">
      <div>
        <Link
          href={`/student/vocab/${setId}`}
          className="text-sm text-brand-600 hover:underline"
        >
          ← 단어장으로
        </Link>
        <h1 className="mt-2 text-xl font-semibold">{setTitle} · 3단계 종합테스트</h1>
        <p className="text-sm text-slate-600">
          한글뜻 50% + 영어 스펠링 50% · {STAGE3_PASS_SCORE}점 이상 합격 · Enter로
          다음/제출
        </p>
      </div>

      {current && (
        <div className="min-h-[min(55vh,440px)] rounded-3xl border-2 border-amber-200 bg-white p-8">
          <p className="text-sm font-semibold text-amber-700">
            {index + 1} / {questions.length} ·{" "}
            {isMeaning ? "뜻 문제" : "스펠링 문제"}
          </p>
          <p className="mt-2 text-center text-sm text-slate-600">
            {current.promptExtra}
          </p>
          <p className="mt-4 text-center text-3xl font-bold">
            {current.questionText}
          </p>
          <input
            ref={inputRef}
            className="ui-input mt-8 min-h-[3.5rem] w-full text-center text-lg"
            value={answers[currentKey] ?? ""}
            onChange={(e) => {
              setAnswers((p) => ({ ...p, [currentKey]: e.target.value }));
              if (message === "답을 입력해주세요.") setMessage(null);
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                handleEnter();
              }
            }}
            placeholder={
              isMeaning ? "한글뜻 입력" : "영어 스펠링 입력"
            }
            autoComplete="off"
            spellCheck={false}
            disabled={pending}
            aria-label={isMeaning ? "한글뜻 입력" : "영어 스펠링 입력"}
          />
        </div>
      )}

      {message && (
        <p
          className={`text-center text-sm ${
            message === "답을 입력해주세요."
              ? "font-medium text-amber-700"
              : "text-slate-600"
          }`}
          role="status"
        >
          {message}
        </p>
      )}

      <div className="flex justify-between gap-3">
        <Button
          type="button"
          variant="ghost"
          disabled={index === 0 || pending}
          onClick={() => {
            setMessage(null);
            setIndex((i) => i - 1);
          }}
        >
          이전
        </Button>
        {isLast ? (
          <Button type="button" disabled={pending} onClick={submitAll}>
            {pending ? "제출 중..." : "제출하기"}
          </Button>
        ) : (
          <Button
            type="button"
            disabled={pending}
            onClick={() => {
              const value = (answers[currentKey] ?? "").trim();
              if (!value) {
                setMessage("답을 입력해주세요.");
                inputRef.current?.focus();
                return;
              }
              goNext();
            }}
          >
            다음
          </Button>
        )}
      </div>
    </div>
  );
}
