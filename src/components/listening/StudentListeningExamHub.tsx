"use client";

import { useState } from "react";
import {
  ListeningOmrSheet,
  type OmrSubmitResult,
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
  initialAttempt?: {
    score: number;
    correctCount: number;
    totalCount: number;
    submittedAt: string;
    results: OmrSubmitResult[];
  } | null;
}

type HubTab = "listen" | "omr";

export function StudentListeningExamHub({
  setId,
  setTitle,
  questions,
  canSubmitOmr,
  initialAttempt,
}: StudentListeningExamHubProps) {
  const [tab, setTab] = useState<HubTab>("listen");

  const audioItems: ListeningAudioItem[] = questions.map((q) => ({
    orderIndex: q.orderIndex,
    audioUrl: q.audioUrl,
  }));

  return (
    <div className="min-h-screen bg-gradient-to-b from-sky-50 via-white to-cyan-50/40 px-4 py-6">
      <div className="mx-auto max-w-lg">
        <p className="text-center text-xs font-semibold tracking-[0.25em] text-sky-600">
          ENGLISH LISTENING
        </p>
        <h1 className="mt-2 text-center text-xl font-bold text-slate-900">
          {setTitle}
        </h1>

        <div className="mt-5 grid grid-cols-2 gap-2 rounded-2xl border border-sky-100 bg-white p-1 shadow-sm">
          <button
            type="button"
            onClick={() => setTab("listen")}
            className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              tab === "listen"
                ? "bg-sky-500 text-white shadow"
                : "text-sky-800 hover:bg-sky-50"
            }`}
          >
            듣기
          </button>
          <button
            type="button"
            onClick={() => setTab("omr")}
            className={`rounded-xl px-3 py-2.5 text-sm font-bold transition ${
              tab === "omr"
                ? "bg-slate-900 text-white shadow"
                : "text-slate-700 hover:bg-slate-50"
            }`}
          >
            OMR 답안
          </button>
        </div>

        <div className="mt-4">
          {tab === "listen" ? (
            <StudentListeningAudioHub setTitle={setTitle} items={audioItems} embedded />
          ) : (
            <ListeningOmrSheet
              setId={setId}
              setTitle={setTitle}
              questions={questions.map((q) => ({
                id: q.id,
                orderIndex: q.orderIndex,
              }))}
              canSubmit={canSubmitOmr}
              initialAttempt={initialAttempt}
            />
          )}
        </div>
      </div>
    </div>
  );
}
