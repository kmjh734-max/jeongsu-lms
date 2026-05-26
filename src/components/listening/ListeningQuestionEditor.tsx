"use client";

import { useEffect, useState } from "react";
import {
  SegmentScriptEditor,
  type SegmentDraft,
} from "@/components/listening/SegmentScriptEditor";
import { displayQuestionTextForOrder } from "@/lib/listening/fix-continuation-question";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

export interface ListeningQuestionData {
  id: string;
  order_index: number;
  question_type: string;
  instruction: string;
  question_text: string;
  choices: string[];
  correct_answer: number;
  explanation: string;
  answer_clue?: string;
  needs_review?: boolean;
  script_translation: string;
  audio_url: string | null;
  segments: Array<{
    id: string;
    speaker_type: string;
    text: string;
    audio_url: string | null;
  }>;
}

interface ListeningQuestionEditorProps {
  setId: string;
  question: ListeningQuestionData;
  speechSpeed?: number;
  onUpdated: () => void;
}

function padChoices(choices: string[]): string[] {
  const next = [...choices];
  while (next.length < 5) next.push("");
  return next.slice(0, 5);
}

export function ListeningQuestionEditor({
  setId,
  question,
  speechSpeed = 0.9,
  onUpdated,
}: ListeningQuestionEditorProps) {
  const [segments, setSegments] = useState<SegmentDraft[]>(
    question.segments.map((s) => ({
      id: s.id,
      speaker: (s.speaker_type === "M" || s.speaker_type === "W"
        ? s.speaker_type
        : "ANN") as SegmentDraft["speaker"],
      text: s.text,
    }))
  );
  const [instruction, setInstruction] = useState(question.instruction ?? "");
  const [questionText, setQuestionText] = useState(
    () =>
      displayQuestionTextForOrder(question.order_index, question.question_text) ??
      question.question_text
  );
  const isFixedContinuationPassage =
    question.order_index === 19 || question.order_index === 20;
  const [choices, setChoices] = useState(padChoices(question.choices));
  const [correctAnswer, setCorrectAnswer] = useState(question.correct_answer);
  const [explanation, setExplanation] = useState(question.explanation);
  const [audioUrl, setAudioUrl] = useState(question.audio_url);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setAudioUrl(question.audio_url);
  }, [question.audio_url]);

  const filledChoiceCount = choices.filter((c) => c.trim()).length;
  const hasFinalAudio = !!audioUrl;

  async function saveQuestion() {
    setBusy("save");
    setMessage(null);
    const res = await fetch(`/api/listening/questions/${question.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        segments: segments.map((s) => ({ speaker: s.speaker, text: s.text })),
        instruction,
        question_text: questionText,
        choices: choices.filter((c) => c.trim()),
        correct_answer: correctAnswer,
        explanation,
        script_translation: question.script_translation,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(null);
    if (!data.ok) {
      setMessage(data.message ?? "저장 실패");
      return;
    }
    setMessage("저장되었습니다.");
    onUpdated();
  }

  async function mergeAudioOnly() {
    setBusy("merge");
    setMessage(null);
    setError(null);
    const res = await fetch("/api/listening/merge-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, questionId: question.id }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      audioUrl?: string;
    };
    setBusy(null);
    if (!data.ok || !data.audioUrl) {
      setError(data.message ?? "최종 mp3 병합 실패");
      return;
    }
    setAudioUrl(`${data.audioUrl}?t=${Date.now()}`);
    setMessage("segment를 합쳐 최종 mp3를 만들었습니다.");
    onUpdated();
  }

  async function generateAudio(segmentId?: string) {
    setBusy(segmentId ? `seg-${segmentId}` : "audio");
    setMessage(null);
    setError(null);
    const res = await fetch("/api/listening/generate-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        questionId: question.id,
        segmentId,
        speechSpeed,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      audioUrl?: string;
    };
    setBusy(null);
    if (!data.ok) {
      setError(data.message ?? "음원 생성 실패");
      return;
    }
    if (!data.audioUrl) {
      setError("음원 URL을 받지 못했습니다. 「최종 mp3만 병합」을 시도해 보세요.");
      return;
    }
    setAudioUrl(`${data.audioUrl}?t=${Date.now()}`);
    setMessage(
      segmentId
        ? "해당 줄만 화면에 보이는 대본 그대로 다시 읽었습니다."
        : "ElevenLabs로 대본 음원을 생성했습니다. (지시문·선택지는 읽지 않습니다.)"
    );
    onUpdated();
  }

  async function regenerateQuestion() {
    if (
      !window.confirm(
        `${question.order_index}번 문항을 AI로 다시 만듭니다. 기존 대본·음원이 삭제됩니다. 계속할까요?`
      )
    ) {
      return;
    }
    setBusy("regen");
    setMessage(null);
    const res = await fetch("/api/listening/regenerate-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        questionId: question.id,
        typeId: question.order_index,
      }),
    });
    const data = (await res.json()) as { ok?: boolean; message?: string };
    setBusy(null);
    if (!data.ok) {
      setMessage(data.message ?? "재생성 실패");
      return;
    }
    setMessage("문항을 다시 생성했습니다.");
    onUpdated();
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">
            {question.order_index}번 · {question.question_type}
            {question.needs_review && (
              <span className="ml-2 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-medium text-amber-800">
                검토 필요
              </span>
            )}
            <span
              className={`ml-2 text-xs font-normal ${hasFinalAudio ? "text-emerald-600" : "text-amber-600"}`}
            >
              {hasFinalAudio ? "● 최종 음원 있음" : "○ 최종 음원 없음"}
            </span>
          </h3>
          {instruction && (
            <p className="mt-1 text-sm text-slate-700">{instruction}</p>
          )}
          {question.answer_clue && (
            <p className="mt-1 text-xs text-emerald-700">
              정답 근거: {question.answer_clue}
            </p>
          )}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            disabled={!!busy}
            onClick={regenerateQuestion}
            className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-800 disabled:opacity-50"
          >
            {busy === "regen" ? "재생성 중…" : "이 문항 다시 생성"}
          </button>
          <button
            type="button"
            disabled={!!busy}
            onClick={() => saveQuestion()}
            className="rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {busy === "save" ? "저장 중…" : "대본·문항 저장"}
          </button>
          <button
            type="button"
            disabled={!!busy}
            onClick={() => generateAudio()}
            className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white disabled:opacity-50"
          >
            {busy === "audio" ? "ElevenLabs 생성 중…" : "음원 생성 (ElevenLabs)"}
          </button>
          <button
            type="button"
            disabled={!!busy}
            onClick={mergeAudioOnly}
            className="rounded-lg border border-emerald-300 bg-emerald-50 px-3 py-1.5 text-xs font-medium text-emerald-800 disabled:opacity-50"
          >
            {busy === "merge" ? "병합 중…" : "최종 mp3만 병합"}
          </button>
        </div>
      </header>

      <label className="mb-3 block text-sm">
        <span className="font-medium text-slate-700">지시문 (한국어)</span>
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          rows={2}
        />
      </label>

      <SegmentScriptEditor segments={segments} onChange={setSegments} />

      <div className="mt-3 space-y-1">
        {question.segments.map((seg, i) => (
          <div
            key={seg.id}
            className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500"
          >
            <span>
              [{seg.speaker_type}] {segments[i]?.text?.slice(0, 40) ?? seg.text.slice(0, 40)}
              {seg.audio_url ? " · 음원 있음" : ""}
            </span>
            <button
              type="button"
              disabled={!!busy}
              onClick={() => generateAudio(seg.id)}
              className="text-indigo-600 hover:underline disabled:opacity-50"
            >
              {busy === `seg-${seg.id}` ? "생성 중…" : "이 줄만 다시 생성"}
            </button>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <label className="block text-sm">
          <span className="font-medium text-slate-700">질문/표</span>
          <textarea
            value={questionText}
            onChange={(e) => setQuestionText(e.target.value)}
            readOnly={isFixedContinuationPassage}
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm read-only:bg-slate-50"
            rows={3}
          />
        </label>
        <div className="grid gap-2 sm:grid-cols-2">
          {choices.map((c, i) => (
            <label key={i} className="block text-sm">
              <span className="text-slate-600">
                {CIRCLED[i] ?? `${i + 1}.`} 선택지
              </span>
              <input
                value={c}
                onChange={(e) => {
                  const next = [...choices];
                  next[i] = e.target.value;
                  setChoices(next);
                }}
                className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
              />
            </label>
          ))}
        </div>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">정답 (1~{filledChoiceCount || 5})</span>
          <input
            type="number"
            min={1}
            max={filledChoiceCount || 5}
            value={correctAnswer}
            onChange={(e) => setCorrectAnswer(Number(e.target.value))}
            className="mt-1 w-20 rounded-md border border-slate-200 px-2 py-1.5 text-sm"
          />
        </label>
        <label className="block text-sm">
          <span className="font-medium text-slate-700">해설</span>
          <textarea
            value={explanation}
            onChange={(e) => setExplanation(e.target.value)}
            className="mt-1 w-full rounded-md border border-slate-200 px-2 py-1.5 text-sm"
            rows={2}
          />
        </label>
      </div>

      {audioUrl && (
        <div className="mt-4">
          <p className="mb-1 text-xs font-medium text-slate-500">미리듣기 (최종 mp3)</p>
          <audio controls src={audioUrl} className="w-full max-w-md" preload="metadata" />
        </div>
      )}

      {error && (
        <p className="mt-2 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700" role="alert">
          {error}
        </p>
      )}
      {message && (
        <p className="mt-2 text-sm text-slate-600" role="status">
          {message}
        </p>
      )}
    </article>
  );
}
