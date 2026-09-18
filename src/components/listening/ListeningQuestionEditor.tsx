"use client";

import { useEffect, useState, type ReactNode } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { ListeningAudioBar } from "@/components/listening/ListeningAudioBar";
import {
  SegmentScriptEditor,
  type SegmentDraft,
} from "@/components/listening/SegmentScriptEditor";
import { ListeningTableDisplay } from "@/components/listening/ListeningTableDisplay";
import { Button } from "@/components/ui/Button";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { resolveQuestionTypeKey } from "@/lib/listening/legacy-type-map";
import { displayQuestionText, responseBlankLine } from "@/lib/listening/question-display";
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

/** 문항 점검에서 나온 경고 문구 (중복 제거) */
export function questionReviewWarnings(q: ListeningQuestionData): string[] {
  const out: string[] = [];
  for (const issue of q.quality_issues ?? []) {
    if (issue?.message?.trim()) out.push(issue.message.trim());
  }
  const av = q.answer_validation as Partial<AnswerValidationPayload> | undefined;
  for (const p of av?.problems ?? []) {
    if (typeof p === "string" && p.trim()) out.push(p.trim());
  }
  return [...new Set(out)];
}

/** 검토에서 「확인 필요」로 보일 문항 */
export function questionNeedsReview(q: ListeningQuestionData): boolean {
  return q.needs_review === true;
}

const SPEAKER_WORD: Record<string, string> = { W: "여자", M: "남자", ANN: "안내" };

function voiceCaption(segments: ListeningQuestionData["segments"]): string {
  const kinds = [...new Set(segments.map((s) => s.speaker_type))].filter(
    (k) => k === "W" || k === "M"
  );
  if (kinds.length === 0) return "안내 목소리";
  return `${kinds.map((k) => SPEAKER_WORD[k]).join(" · ")} 목소리`;
}

/** 유형 판단용 모양 (저장 행의 speaker_type → speaker) */
function typeProbe(q: ListeningQuestionData) {
  return {
    order_index: q.order_index,
    question_type: q.question_type,
    instruction: q.instruction,
    question_text: q.question_text,
    blank_speaker: q.blank_speaker,
    table_data: q.table_data,
    segments: q.segments.map((s) => ({ speaker: s.speaker_type })),
  };
}

interface ListeningQuestionEditorProps {
  setId: string;
  question: ListeningQuestionData;
  speechSpeed?: number;
  onUpdated: () => void;
  readOnly?: boolean;
  /** 저장 안 한 내용이 생기거나 없어질 때 */
  onDirtyChange?: (dirty: boolean) => void;
  /** 카드 맨 아래 (이전·다음 문항 버튼) */
  footer?: ReactNode;
  /** 세트 학년 — 번호가 아니라 유형으로 판단한다(중2·중3은 번호와 유형이 다름) */
  gradeLevel?: ListeningGradeLevel;
}

export function ListeningQuestionEditor({
  setId,
  question,
  speechSpeed = 0.75,
  onUpdated,
  readOnly = false,
  onDirtyChange,
  footer,
  gradeLevel,
}: ListeningQuestionEditorProps) {
  const applyQuestionToEditor = (q: ListeningQuestionData) => {
    setSegments(segmentsToDrafts(q.segments));
    setInstruction(q.instruction ?? "");
    setQuestionText(displayQuestionText(typeProbe(q), { grade: gradeLevel }) ?? q.question_text);
    setChoices(padChoices(q.choices));
    setImagePrompts(padImagePrompts(q.choice_image_prompts));
    setCorrectAnswer(q.correct_answer);
    setExplanation(q.explanation);
    setAnswerClue(q.answer_clue ?? "");
    setAudioUrl(q.audio_url);
    setLocalContentKey(questionContentKey(q));
    setDirty(false);
  };

  const [segments, setSegments] = useState<SegmentDraft[]>(() =>
    segmentsToDrafts(question.segments)
  );
  const [instruction, setInstruction] = useState(question.instruction ?? "");
  const [questionText, setQuestionText] = useState(
    () => displayQuestionText(typeProbe(question), { grade: gradeLevel }) ?? question.question_text
  );
  // 중등 응답 문항의 빈칸 줄("Man: ____")은 지시문 방향으로 정해져 고칠 수 없다 (번호가 아니라 유형으로 판단)
  const fixedBlankLine = responseBlankLine(typeProbe(question), gradeLevel);
  const isFixedContinuationPassage = fixedBlankLine != null;
  const typeKey = resolveQuestionTypeKey(typeProbe(question), gradeLevel);
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
  const [dirty, setDirty] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const serverContentKey = questionContentKey(question);

  useEffect(() => {
    if (serverContentKey !== localContentKey) {
      applyQuestionToEditor(question);
    }
  }, [serverContentKey, localContentKey, question]);

  useEffect(() => {
    onDirtyChange?.(dirty);
  }, [dirty, onDirtyChange]);

  useEffect(() => {
    if (!savedAt) return;
    const t = window.setTimeout(() => setSavedAt(null), 2500);
    return () => window.clearTimeout(t);
  }, [savedAt]);

  function edit<T>(setter: (value: T) => void) {
    return (value: T) => {
      setter(value);
      setDirty(true);
      setSavedAt(null);
    };
  }

  const filledChoiceCount = choices.filter((c) => c.trim()).length;
  const table = normalizeTableData(question.table_data);
  const blankLine = fixedBlankLine;
  const imageUrls = (question.choice_image_urls ?? []).filter((u) => String(u).trim());
  const promptCount = (question.choice_image_prompts ?? []).filter((p) => String(p).trim()).length;
  // 그림 선택지는 5칸 한 장으로 그린다 — 그림 1장이면 이미 다 만든 것이다
  const neededImageCount = promptCount === 5 ? 1 : promptCount;
  const canMakeImages = !readOnly && promptCount > 0 && imageUrls.length < neededImageCount;

  async function saveQuestion() {
    setBusy("save");
    setMessage(null);
    setError(null);
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
      setError(data.message ?? "저장하지 못했어요.");
      return;
    }
    setDirty(false);
    setSavedAt(Date.now());
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
      setError(data.message ?? "음성을 만들지 못했어요.");
      return;
    }
    if (!data.audioUrl) {
      setError("음성 파일을 받지 못했어요. 한 번 더 눌러 주세요.");
      return;
    }
    setAudioUrl(`${data.audioUrl}?t=${Date.now()}`);
    setMessage(
      segmentId
        ? "이 줄을 지금 대본대로 다시 읽었어요."
        : "대본 음성을 만들었어요. 지시문과 선택지는 읽지 않아요."
    );
    onUpdated();
  }

  async function regenerateQuestion() {
    if (
      !window.confirm(
        `${question.order_index}번 문항을 다시 만들어요. 지금 대본은 바뀌고 음성은 지워져요. 계속할까요?`
      )
    ) {
      return;
    }
    setBusy("regen");
    setMessage(null);
    setError(null);
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
        // 유형은 서버가 저장된 문항의 이름·지시문으로 정한다 (번호를 유형으로 보내지 않는다)
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
      setError(data.message ?? "다시 만들지 못했어요.");
      return;
    }
    if (data.question) {
      applyQuestionToEditor(
        normalizeRegeneratedQuestion(data.question, question)
      );
    }
    setMessage(
      data.audioNeedsRegeneration
        ? "문항을 다시 만들었어요. ③ 음성 만들기에서 음성도 다시 만들어 주세요."
        : "문항을 다시 만들었어요."
    );
    onUpdated();
  }

  /**
   * 비슷한 문항으로 다시 만들기 — 유형·구조·정답 자리는 그대로 두고
   * 이름·장소·물건·숫자만 바꾼 문항으로 바꿔 끼운다. 새로 만드는 것보다 적게 든다.
   */
  async function makeVariantQuestion() {
    if (
      !window.confirm(
        `${question.order_index}번 문항과 비슷한 문항을 만들어요. 유형과 정답 자리는 그대로 두고 이름·장소·물건·숫자만 바뀌어요. 지금 대본은 바뀌고 음성은 지워져요. 계속할까요?`
      )
    ) {
      return;
    }
    setBusy("variant");
    setMessage(null);
    setError(null);
    const res = await fetch("/api/listening/variant-question", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, questionId: question.id }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      audioNeedsRegeneration?: boolean;
      question?: Record<string, unknown>;
    };
    setBusy(null);
    if (!data.ok) {
      setError(data.message ?? "비슷한 문항을 만들지 못했어요.");
      return;
    }
    if (data.question) {
      applyQuestionToEditor(normalizeRegeneratedQuestion(data.question, question));
    }
    setMessage(
      data.audioNeedsRegeneration
        ? "비슷한 문항으로 바꿨어요. ③ 음성 만들기에서 음성도 다시 만들어 주세요."
        : "비슷한 문항으로 바꿨어요."
    );
    onUpdated();
  }

  async function makeImages() {
    setBusy("images");
    setMessage(null);
    setError(null);
    const res = await fetch("/api/listening/generate-choice-images", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ setId, questionId: question.id }),
    });
    const data = (await res.json().catch(() => ({}))) as { ok?: boolean; message?: string };
    setBusy(null);
    if (!data.ok) {
      setError(data.message ?? "그림을 만들지 못했어요. 한 번 더 눌러 주세요.");
      return;
    }
    setMessage("그림을 만들었어요.");
    onUpdated();
  }

  return (
    <article className="flex min-h-full flex-col gap-4 rounded-lg border border-slate-200 bg-white px-5 py-[18px] shadow-card">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <h3 className="text-base font-bold text-slate-900">
            {question.order_index}번 · {question.question_type}
          </h3>
          {/* 품질 점검 문구는 선생님께 보이지 않는다 — 만들 때 점검을 통과할 때까지 다시 쓴다(선생님 요청 2026-09-18) */}
        </div>
        {!readOnly ? (
          <div className="flex flex-wrap items-center gap-2">
            {dirty ? (
              <span className="text-xs font-medium text-amber-700">저장 안 한 내용이 있어요</span>
            ) : savedAt ? (
              <span className="inline-flex items-center gap-1 text-xs font-medium text-green-700">
                <Icon name="check" size={13} strokeWidth={2.4} />
                저장했어요
              </span>
            ) : null}
            <Button
              variant="secondary"
              size="sm"
              disabled={!!busy}
              onClick={makeVariantQuestion}
              title="유형과 정답 자리는 그대로 두고 이름·장소·물건·숫자만 바꿔요"
            >
              <Icon name="copy" size={15} />
              {busy === "variant" ? "만드는 중…" : "비슷한 문항으로 다시 만들기"}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              disabled={!!busy}
              onClick={regenerateQuestion}
            >
              <Icon name="rotate" size={15} />
              {busy === "regen" ? "다시 만드는 중…" : "이 문항 다시 만들기"}
            </Button>
            <Button size="sm" disabled={!!busy} onClick={() => void saveQuestion()}>
              {busy === "save" ? "저장 중…" : "저장"}
            </Button>
          </div>
        ) : null}
      </header>


      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        {/* 대본 · 음성 · 해설 */}
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-xs font-semibold text-slate-500">대본</span>
          <SegmentScriptEditor
            segments={segments}
            onChange={edit(setSegments)}
            readOnly={readOnly}
            renderRowAction={
              readOnly
                ? undefined
                : (seg) =>
                    seg.id ? (
                      <button
                        type="button"
                        disabled={!!busy}
                        onClick={() => void generateAudio(seg.id)}
                        title="이 줄만 다시 읽기"
                        aria-label="이 줄만 다시 읽기"
                        className={`mt-1 shrink-0 rounded p-1 hover:bg-brand-50 hover:text-brand-700 disabled:opacity-40 ${
                          busy === `seg-${seg.id}` ? "animate-pulse text-brand-600" : "text-slate-400"
                        }`}
                      >
                        <Icon name="speaker" size={14} />
                      </button>
                    ) : null
            }
          />
          {audioUrl ? (
            <ListeningAudioBar src={audioUrl} caption={voiceCaption(question.segments)} />
          ) : (
            <p className="flex h-11 items-center gap-2 rounded-lg border border-dashed border-slate-200 px-3 text-xs text-slate-500">
              <Icon name="speaker" size={14} />
              아직 음성이 없어요. ③ 음성 만들기에서 만들 수 있어요.
            </p>
          )}

          {table ? (
            <div className="mt-1">
              <span className="text-xs font-semibold text-slate-500">{table.kind === "flyer" ? "양식" : "표"}</span>
              <div className="mt-1">
                <ListeningTableDisplay
                  table={table}
                  highlightMismatchNo={table.kind === "flyer" ? null : table.mismatch_no}
                  highlightLabel={typeKey === "M_TABLE_SELECT" || typeKey === "H_TABLE" ? "정답" : "불일치"}
                />
              </div>
            </div>
          ) : null}

          {imageUrls.length === 1 ? (
            <div className="mt-1">
              <span className="text-xs font-semibold text-slate-500">그림</span>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrls[0]} alt="문항 그림" className="mt-1 max-h-64 w-auto rounded border border-slate-200" />
            </div>
          ) : null}
          {promptCount === 1 && imageUrls.length === 0 ? (
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-600">그림 설명</span> {question.choice_image_prompts?.[0]}
            </p>
          ) : null}
          {canMakeImages ? (
            <div>
              <Button variant="secondary" size="sm" disabled={!!busy} onClick={() => void makeImages()}>
                {busy === "images" ? "그림 만드는 중…" : "그림 만들기"}
              </Button>
            </div>
          ) : null}

          <label className="mt-1 block">
            <span className="text-xs font-semibold text-slate-500">해설</span>
            <textarea
              value={explanation}
              readOnly={readOnly}
              onChange={(e) => edit(setExplanation)(e.target.value)}
              className="mt-1.5 w-full rounded-lg border border-transparent bg-slate-50 px-3 py-2.5 text-[13px] leading-relaxed text-slate-700 focus:border-brand-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-100"
              rows={2}
            />
          </label>
          {answerClue ? (
            <p className="text-xs text-slate-500">
              <span className="font-semibold text-slate-600">정답 근거</span> {answerClue}
            </p>
          ) : null}
        </div>

        {/* 문제 · 선택지 */}
        <div className="flex min-w-0 flex-col gap-2">
          <span className="text-xs font-semibold text-slate-500">문제</span>
          <textarea
            value={instruction}
            readOnly={readOnly}
            onChange={(e) => edit(setInstruction)(e.target.value)}
            aria-label="지시문"
            rows={2}
            className="w-full resize-y rounded-md border border-transparent px-1 py-0.5 text-sm font-semibold leading-normal text-slate-900 hover:border-slate-200 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 read-only:hover:border-transparent"
          />
          {questionText.trim() || !readOnly ? (
            <textarea
              value={questionText}
              onChange={(e) => edit(setQuestionText)(e.target.value)}
              readOnly={readOnly || isFixedContinuationPassage}
              aria-label="질문"
              placeholder="질문 (필요할 때만)"
              rows={questionText.trim() ? 2 : 1}
              className="w-full resize-y rounded-md border border-slate-200 px-2.5 py-1.5 text-[13px] text-slate-700 placeholder:text-slate-400 focus:border-brand-500 focus:outline-none focus:ring-2 focus:ring-brand-100 read-only:bg-slate-50"
            />
          ) : null}
          {blankLine ? (
            <p className="font-mono text-sm text-slate-800">{blankLine}</p>
          ) : null}

          <ul className="flex flex-col gap-2">
            {choices.map((c, i) => {
              const isAnswer = correctAnswer === i + 1;
              if (readOnly && !c.trim()) return null;
              return (
                <li key={i}>
                  <div
                    className={`flex min-h-[38px] items-center gap-2 rounded-md border px-2 ${
                      isAnswer ? "border-green-700 bg-green-50" : "border-slate-200 bg-white"
                    }`}
                  >
                    <button
                      type="button"
                      disabled={readOnly}
                      onClick={() => edit(setCorrectAnswer)(i + 1)}
                      title={isAnswer ? "정답" : "정답으로 고르기"}
                      aria-label={`${i + 1}번을 정답으로`}
                      aria-pressed={isAnswer}
                      className={`shrink-0 rounded px-1 text-sm font-semibold disabled:cursor-default ${
                        isAnswer ? "text-green-700" : "text-slate-400 hover:text-slate-700"
                      }`}
                    >
                      {CIRCLED[i] ?? `${i + 1}.`}
                    </button>
                    <input
                      value={c}
                      readOnly={readOnly}
                      onChange={(e) => {
                        const next = [...choices];
                        next[i] = e.target.value;
                        edit(setChoices)(next);
                      }}
                      aria-label={`${i + 1}번 선택지`}
                      className={`min-w-0 flex-1 bg-transparent py-1.5 text-[13px] focus:outline-none ${
                        isAnswer ? "font-semibold text-green-700" : "text-slate-900"
                      }`}
                    />
                    {isAnswer ? (
                      <span className="shrink-0 rounded bg-green-700/10 px-2 py-0.5 text-xs font-semibold text-green-700">
                        정답
                      </span>
                    ) : null}
                  </div>
                  {/* 선택지마다 그림이 있는 유형(묘사·구입·날씨) — 번호가 아니라 그림 설명 개수로 판단 */}
                  {promptCount > 1 && imagePrompts[i]?.trim() ? (
                    imageUrls[i] ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={imageUrls[i]} alt="" className="mt-1 max-h-20 rounded border border-slate-200" />
                    ) : (
                      <p className="mt-1 pl-2 text-xs text-slate-500">그림: {imagePrompts[i]}</p>
                    )
                  ) : null}
                </li>
              );
            })}
          </ul>
          {!readOnly ? (
            <p className="text-xs text-slate-400">
              번호를 누르면 정답이 바뀌어요 (1~{filledChoiceCount || 5}).
            </p>
          ) : null}
        </div>
      </div>

      {error ? (
        <p className="rounded-md border border-rose-100 bg-rose-50 px-3 py-2 text-sm text-rose-700" role="alert">
          {error}
        </p>
      ) : null}
      {message ? (
        <p className="rounded-md border border-brand-100 bg-brand-50 px-3 py-2 text-sm text-brand-800" role="status">
          {message}
        </p>
      ) : null}

      {footer ? (
        <div className="mt-auto border-t border-slate-100 pt-3">{footer}</div>
      ) : null}
    </article>
  );
}
