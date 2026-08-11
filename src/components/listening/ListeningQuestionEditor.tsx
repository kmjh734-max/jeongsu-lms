"use client";

import { useEffect, useState } from "react";
import {
  SegmentScriptEditor,
  type SegmentDraft,
} from "@/components/listening/SegmentScriptEditor";
import { displayQuestionTextForOrder } from "@/lib/listening/fix-continuation-question";
import { ListeningTableDisplay } from "@/components/listening/ListeningTableDisplay";
import { normalizeTableData } from "@/lib/listening/table-data";
import type { AnswerValidationPayload, QualityIssuePayload } from "@/lib/listening/types";

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
  quality_score?: number | null;
  answer_clarity_score?: number | null;
  quality_issues?: QualityIssuePayload[];
  answer_validation?: AnswerValidationPayload | Record<string, unknown>;
  table_data?: import("@/lib/listening/types").ListeningTableData | null;
  previous_turn?: string;
  correct_response_function?: string;
  distractor_reason?: string[];
  blank_speaker?: string;
  situation_type?: string;
  needs_image_choices?: boolean;
  choice_image_prompts?: string[];
  choice_image_urls?: string[];
  visual_choice_type?: string;
  selected_conditions?: import("@/lib/listening/types").PurchaseSelectedConditions | null;
  weather_target_location?: string;
  weather_target_time?: string;
  weather_answer?: string;
  mentioned_weather_by_time?: import("@/lib/listening/types").MentionedWeatherByTime[];
  last_speaker?: string;
  final_utterance?: string;
  target_intention?: string;
  intention_candidates?: string[];
  mention_plan?: import("@/lib/listening/type5-mention-plan").MentionPlan | null;
  time_question_target?: string;
  final_time?: string;
  mentioned_times?: import("@/lib/listening/type6-time-choices").MentionedTimeEntry[];
  target_person?: string;
  dream_job?: string;
  interest_clues?: string[];
  target_emotion?: string;
  emotion_clues?: string[];
  immediate_action?: string;
  mentioned_actions?: import("@/lib/listening/type9-action-choices").MentionedActionEntry[];
  main_content?: string;
  content_clues?: string[];
  topic_distractor_reasons?: import("@/lib/listening/type10-content-choices").TopicDistractorReason[];
  destination?: string;
  final_transport?: string;
  mentioned_transport_options?: import("@/lib/listening/type11-transport-choices").MentionedTransportEntry[];
  target_place?: string;
  reason_for_going?: string;
  mentioned_possible_reasons?: import("@/lib/listening/type12-reason-choices").MentionedPossibleReason[];
  place_clues?: string[];
  distractor_places?: import("@/lib/listening/type13-place-choices").DistractorPlace[];
  source_facts_from_script?: import("@/lib/listening/type14-table-validation").SourceFactFromScript[];
  requester?: string;
  requested_person?: string;
  requested_action?: string;
  request_expression?: string;
  suggester?: string;
  suggested_to?: string;
  suggested_action?: string;
  suggestion_expression?: string;
  target_time?: string;
  planned_action?: string;
  mentioned_other_actions?: import("@/lib/listening/type17-schedule-choices").MentionedOtherActionEntry[];
  target_job?: string;
  job_clues?: string[];
  distractor_jobs?: import("@/lib/listening/type18-job-choices").DistractorJobEntry[];
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

function padImagePrompts(prompts?: string[]): string[] {
  const next = [...(prompts ?? [])];
  while (next.length < 5) next.push("");
  return next.slice(0, 5);
}

function segmentsToDrafts(
  segments: ListeningQuestionData["segments"]
): SegmentDraft[] {
  return (segments ?? []).map((s) => ({
    id: s.id,
    speaker: (s.speaker_type === "M" || s.speaker_type === "W"
      ? s.speaker_type
      : "ANN") as SegmentDraft["speaker"],
    text: s.text,
  }));
}

function questionContentKey(q: ListeningQuestionData): string {
  return [
    q.instruction,
    q.question_text,
    q.correct_answer,
    q.explanation,
    q.answer_clue ?? "",
    q.choices.join("\x1f"),
    (q.choice_image_prompts ?? []).join("\x1f"),
    q.segments.map((s) => `${s.id}:${s.speaker_type}:${s.text}`).join("\x1f"),
    q.audio_url ?? "",
  ].join("\x1e");
}

function normalizeRegeneratedQuestion(
  raw: Record<string, unknown>,
  fallback: ListeningQuestionData
): ListeningQuestionData {
  const rawSegments = Array.isArray(raw.segments) ? raw.segments : [];
  const segments =
    rawSegments.length > 0
      ? rawSegments.map((seg, index) => {
          const row = seg as Record<string, unknown>;
          const fallbackSeg = fallback.segments[index];
          return {
            id: String(row.id ?? fallbackSeg?.id ?? `seg-${index}`),
            speaker_type: String(
              row.speaker_type ?? row.speaker ?? fallbackSeg?.speaker_type ?? "M"
            ),
            text: String(row.text ?? ""),
            audio_url:
              (row.audio_url as string | null | undefined) ??
              fallbackSeg?.audio_url ??
              null,
          };
        })
      : fallback.segments;

  return {
    ...fallback,
    instruction: String(raw.instruction ?? fallback.instruction),
    question_text: String(raw.question_text ?? fallback.question_text),
    choices: Array.isArray(raw.choices)
      ? (raw.choices as string[])
      : fallback.choices,
    correct_answer: Number(raw.correct_answer ?? fallback.correct_answer),
    explanation: String(raw.explanation ?? fallback.explanation),
    answer_clue: String(raw.answer_clue ?? fallback.answer_clue ?? ""),
    script_translation: String(
      raw.script_translation ?? fallback.script_translation
    ),
    audio_url: (raw.audio_url as string | null | undefined) ?? null,
    choice_image_prompts: Array.isArray(raw.choice_image_prompts)
      ? (raw.choice_image_prompts as string[])
      : fallback.choice_image_prompts,
    situation_type: String(raw.situation_type ?? fallback.situation_type ?? ""),
    segments,
  };
}

export function ListeningQuestionEditor({
  setId,
  question,
  speechSpeed = 0.75,
  onUpdated,
}: ListeningQuestionEditorProps) {
  const applyQuestionToEditor = (q: ListeningQuestionData) => {
    setSegments(segmentsToDrafts(q.segments));
    setInstruction(q.instruction ?? "");
    setQuestionText(
      displayQuestionTextForOrder(q.order_index, q.question_text) ??
        q.question_text
    );
    setChoices(padChoices(q.choices));
    setImagePrompts(padImagePrompts(q.choice_image_prompts));
    setCorrectAnswer(q.correct_answer);
    setExplanation(q.explanation);
    setAnswerClue(q.answer_clue ?? "");
    setAudioUrl(q.audio_url);
    setLocalContentKey(questionContentKey(q));
  };

  const [segments, setSegments] = useState<SegmentDraft[]>(() =>
    segmentsToDrafts(question.segments)
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
  const [imagePrompts, setImagePrompts] = useState(() =>
    padImagePrompts(question.choice_image_prompts)
  );
  const [correctAnswer, setCorrectAnswer] = useState(question.correct_answer);
  const [explanation, setExplanation] = useState(question.explanation);
  const [answerClue, setAnswerClue] = useState(question.answer_clue ?? "");
  const [audioUrl, setAudioUrl] = useState(question.audio_url);
  const [localContentKey, setLocalContentKey] = useState(() =>
    questionContentKey(question)
  );
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const serverContentKey = questionContentKey(question);

  useEffect(() => {
    if (serverContentKey !== localContentKey) {
      applyQuestionToEditor(question);
    }
  }, [serverContentKey, localContentKey, question]);

  const filledChoiceCount = choices.filter((c) => c.trim()).length;
  const hasFinalAudio = !!audioUrl;
  const table = normalizeTableData(question.table_data);
  const blankLine =
    question.order_index === 19 || question.order_index === 20
      ? displayQuestionTextForOrder(question.order_index, questionText)
      : null;

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
      setError("음원 URL을 받지 못했습니다. 음원 생성을 다시 시도해 주세요.");
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
        `${question.order_index}번 문항을 AI로 다시 만듭니다. 기존 대본은 교체되고 음원은 초기화됩니다. 계속할까요?`
      )
    ) {
      return;
    }
    setBusy("regen");
    setMessage(null);
    const prevProblems = [
      ...(question.quality_issues?.map((i) => i.message) ?? []),
      ...((question.answer_validation as AnswerValidationPayload | undefined)
        ?.problems ?? []),
    ].filter(Boolean);
    const res = await fetch("/api/listening/regenerate-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        questionId: question.id,
        typeId: question.order_index,
        previousProblems: prevProblems,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      audioNeedsRegeneration?: boolean;
      question?: Record<string, unknown>;
    };
    setBusy(null);
    if (!data.ok) {
      setMessage(data.message ?? "재생성 실패");
      return;
    }
    if (data.question) {
      applyQuestionToEditor(
        normalizeRegeneratedQuestion(data.question, question)
      );
    }
    setMessage(
      data.audioNeedsRegeneration
        ? "문항을 다시 생성했습니다. 음원을 다시 생성해 주세요."
        : "문항을 다시 생성했습니다."
    );
    onUpdated();
  }

  return (
    <article className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <header className="mb-3 flex flex-wrap items-center justify-between gap-2">
        <div>
          <h3 className="font-semibold text-slate-900">
            {question.order_index}번 · {question.question_type}
            <span
              className={`ml-2 text-xs font-normal ${hasFinalAudio ? "text-emerald-600" : "text-amber-600"}`}
            >
              {hasFinalAudio ? "● 최종 음원 있음" : "○ 최종 음원 없음"}
            </span>
          </h3>
          {instruction && (
            <p className="mt-1 text-sm text-slate-700">{instruction}</p>
          )}
          {answerClue && (
            <p className="mt-1 text-xs text-emerald-700">
              정답 근거: {answerClue}
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

      {table && (
        <div className="mt-4">
          <p className="mb-1 text-xs font-medium text-slate-500">표 (14번)</p>
          <ListeningTableDisplay
            table={table}
            highlightMismatchNo={table.mismatch_no}
          />
        </div>
      )}

      {blankLine && (
        <p className="mt-3 font-mono text-sm text-slate-800">{blankLine}</p>
      )}

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
              {busy === `seg-${seg.id}` ? "생성 중…" : "이 줄만 음원 생성"}
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
              {(question.order_index === 1 ||
                question.order_index === 2 ||
                question.order_index === 3) &&
                imagePrompts[i]?.trim() && (
                  <p className="mt-1 text-xs text-slate-500">
                    그림: {imagePrompts[i]}
                  </p>
                )}
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
