"use client";

import { useCallback, useEffect, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import {
  ListeningOmrSheet,
  type OmrAttemptResult,
} from "@/components/listening/ListeningOmrSheet";
import {
  StudentListeningAudioHub,
  type ListeningAudioItem,
} from "@/components/listening/StudentListeningAudioHub";

export interface ListeningExamQuestionItem {
  id: string;
  orderIndex: number;
  audioUrl: string | null;
}

interface StudentListeningExamHubProps {
  setId: string;
  setTitle: string;
  questions: ListeningExamQuestionItem[];
  canSubmitOmr: boolean;
  initialAttempt?: OmrAttemptResult | null;
}

function draftStorageKey(setId: string) {
  return `listening-omr-draft:${setId}`;
}

function readDraft(setId: string): Record<string, number> {
  if (typeof window === "undefined") return {};
  try {
    const raw = sessionStorage.getItem(draftStorageKey(setId));
    if (!raw) return {};
    const parsed = JSON.parse(raw) as Record<string, number>;
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

function writeDraft(setId: string, answers: Record<string, number>) {
  if (typeof window === "undefined") return;
  try {
    if (Object.keys(answers).length === 0) {
      sessionStorage.removeItem(draftStorageKey(setId));
      return;
    }
    sessionStorage.setItem(draftStorageKey(setId), JSON.stringify(answers));
  } catch {
    /* ignore quota */
  }
}

function clearDraft(setId: string) {
  if (typeof window === "undefined") return;
  try {
    sessionStorage.removeItem(draftStorageKey(setId));
  } catch {
    /* ignore */
  }
}

function answersFromAttempt(attempt: OmrAttemptResult | null | undefined) {
  const init: Record<string, number> = {};
  if (!attempt) return init;
  for (const row of attempt.results) {
    if (row.studentAnswer != null) init[row.questionId] = row.studentAnswer;
  }
  return init;
}

export function StudentListeningExamHub({
  setId,
  setTitle,
  questions,
  canSubmitOmr,
  initialAttempt,
}: StudentListeningExamHubProps) {
  const [answers, setAnswers] = useState<Record<string, number>>(() =>
    initialAttempt ? answersFromAttempt(initialAttempt) : {}
  );
  const [result, setResult] = useState<OmrAttemptResult | null>(
    initialAttempt ?? null
  );

  useEffect(() => {
    if (initialAttempt || result) return;
    const draft = readDraft(setId);
    if (Object.keys(draft).length > 0) {
      setAnswers(draft);
    }
  }, [setId, initialAttempt, result]);

  useEffect(() => {
    if (result) {
      clearDraft(setId);
      return;
    }
    writeDraft(setId, answers);
  }, [answers, result, setId]);

  const handleAnswersChange = useCallback(
    (next: Record<string, number>) => {
      setAnswers(next);
    },
    []
  );

  const handleResultChange = useCallback((next: OmrAttemptResult | null) => {
    setResult(next);
    if (!next) setAnswers({});
  }, []);

  const audioItems: ListeningAudioItem[] = questions.map((q) => ({
    orderIndex: q.orderIndex,
    audioUrl: q.audioUrl,
  }));

  return (
    <div className="min-h-screen bg-canvas pb-10">
      <div className="mx-auto max-w-lg px-4 pt-5">
        <header className="rounded-lg bg-side px-5 py-5 text-white shadow-card">
          <p className="flex items-center gap-1.5 text-[13px] font-semibold text-side-muted">
            <Icon name="headphones" size={16} />
            듣기 평가
          </p>
          <h1 className="mt-2 text-xl font-bold leading-snug">{setTitle}</h1>
          <p className="mt-1 text-sm text-side-text">듣기와 답안 입력을 한 화면에서</p>
        </header>
      </div>

      <div className="sticky top-0 z-20 bg-canvas/95 pt-3 backdrop-blur-sm">
        <div className="mx-auto max-w-lg px-4 pb-1">
          <div className="rounded-lg bg-side p-3 shadow-card-hover">
            <StudentListeningAudioHub
              setTitle={setTitle}
              items={audioItems}
              embedded
              compact
            />
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg px-4 pt-3">
        <ListeningOmrSheet
          setId={setId}
          setTitle={setTitle}
          questions={questions.map((q) => ({
            id: q.id,
            orderIndex: q.orderIndex,
          }))}
          canSubmit={canSubmitOmr}
          answers={answers}
          onAnswersChange={handleAnswersChange}
          result={result}
          onResultChange={handleResultChange}
        />
      </div>
    </div>
  );
}
