"use client";

import { continuationQuestionDisplayText } from "@/lib/listening/fix-continuation-question";
import { ListeningTableDisplay } from "@/components/listening/ListeningTableDisplay";
import { QuestionQualityBadges } from "@/components/listening/QuestionQualityBadges";
import { normalizeTableData } from "@/lib/listening/table-data";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

const CIRCLED = ["①", "②", "③", "④", "⑤"];

interface ListeningQuestionPreviewProps {
  question: GeneratedListeningQuestion;
  onRegenerate?: () => void;
  onRevalidate?: () => void;
  onGenerateAudio?: () => void;
  regenerateBusy?: boolean;
  revalidateBusy?: boolean;
  audioBusy?: boolean;
  showActions?: boolean;
  audioNeedsRegeneration?: boolean;
}

export function ListeningQuestionPreview({
  question,
  onRegenerate,
  onRevalidate,
  onGenerateAudio,
  regenerateBusy,
  revalidateBusy,
  audioBusy,
  showActions,
  audioNeedsRegeneration,
}: ListeningQuestionPreviewProps) {
  const filledChoices = question.choices.filter((c) => c.trim());
  const table = normalizeTableData(question.table_data);
  const blankLine = continuationQuestionDisplayText(question.order_index);
  const av = question.answer_validation;

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm ${
        question.needs_review ? "border-amber-300" : "border-indigo-100"
      }`}
    >
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <p className="text-xs font-medium text-indigo-600">
            {question.order_index}번 · {question.question_type}
          </p>
          {question.instruction && (
            <p className="mt-2 text-sm font-medium text-slate-900">{question.instruction}</p>
          )}
        </div>
        <QuestionQualityBadges question={question} />
      </header>

      {audioNeedsRegeneration && (
        <p className="mb-2 rounded-lg bg-violet-50 px-2 py-1 text-xs text-violet-800">
          음원 재생성이 필요합니다.
        </p>
      )}

      {(question.quality_issues?.length ?? 0) > 0 && (
        <ul className="mb-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-900">
          {question.quality_issues!.map((issue) => (
            <li key={issue.code}>· {issue.message}</li>
          ))}
        </ul>
      )}

      {question.problems && question.problems.length > 0 && (
        <ul className="mb-3 rounded-lg bg-red-50 p-2 text-xs text-red-900">
          {question.problems.map((p, i) => (
            <li key={i}>· {p}</li>
          ))}
        </ul>
      )}

      {question.suggestions && question.suggestions.length > 0 && (
        <ul className="mb-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
          {question.suggestions.map((s, i) => (
            <li key={i}>· {s}</li>
          ))}
        </ul>
      )}

      <div className="mb-3">
        <p className="text-xs font-medium text-slate-500">대본</p>
        <ul className="mt-1 space-y-1 text-sm text-slate-700">
          {question.segments.map((seg, i) => (
            <li key={i}>
              <span className="font-semibold text-slate-500">{seg.speaker}:</span> {seg.text}
            </li>
          ))}
        </ul>
        {question.script_translation && (
          <p className="mt-2 text-xs text-slate-500">
            <span className="font-medium">해석:</span> {question.script_translation}
          </p>
        )}
      </div>

      {table && (
        <div className="mb-3">
          <ListeningTableDisplay
            table={table}
            highlightMismatchNo={table.mismatch_no}
          />
          {table.mismatch_reason && (
            <p className="mt-2 text-xs text-amber-800">
              <span className="font-medium">불일치:</span> {table.mismatch_reason}
            </p>
          )}
        </div>
      )}

      {blankLine && (
        <p className="mb-2 font-mono text-sm text-slate-800">{blankLine}</p>
      )}

      {(question.order_index === 19 || question.order_index === 20) && (
        <div className="mb-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
          {question.previous_turn && (
            <p>
              <span className="font-medium">직전 발화:</span> {question.previous_turn}
            </p>
          )}
          {question.correct_response_function && (
            <p className="mt-1">
              <span className="font-medium">정답 기능:</span>{" "}
              {question.correct_response_function}
            </p>
          )}
          {typeof av?.response_context_score === "number" && (
            <p className="mt-1">
              <span className="font-medium">맥락 점수:</span> {av.response_context_score}
            </p>
          )}
        </div>
      )}

      <ul className="mb-3 space-y-2 text-sm">
        {filledChoices.map((c, i) => (
          <li
            key={i}
            className={
              question.correct_answer === i + 1 ? "font-semibold text-indigo-700" : ""
            }
          >
            <div>
              {CIRCLED[i] ?? `${i + 1}.`} {c}
              {question.correct_answer === i + 1 ? " ✓" : ""}
            </div>
            {question.choice_image_prompts?.[i]?.trim() && (
              <p className="mt-0.5 text-xs text-slate-500">
                그림: {question.choice_image_prompts[i]}
              </p>
            )}
          </li>
        ))}
      </ul>

      {(question.order_index === 1 ||
        question.order_index === 2 ||
        question.order_index === 3) &&
        question.needs_image_choices && (
        <p className="mb-2 text-xs text-violet-700">
          그림 선택지 문항
          {question.visual_choice_type
            ? ` (${question.visual_choice_type})`
            : ""}
          — 이미지 생성은 별도 기능
        </p>
      )}

      {question.order_index === 4 &&
        (question.target_intention || question.final_utterance) && (
        <div className="mb-3 rounded-lg bg-violet-50 p-2 text-xs text-violet-900">
          <p className="font-medium">의도 파악 문항 정보</p>
          <p className="mt-1">
            마지막 화자:{" "}
            {question.last_speaker === "M"
              ? "남자(M)"
              : question.last_speaker === "W"
                ? "여자(W)"
                : "—"}{" "}
            · 정답 의도: {question.target_intention || "—"}
          </p>
          {question.final_utterance && (
            <p className="mt-1">
              마지막 말: <span className="italic">{question.final_utterance}</span>
            </p>
          )}
          {question.intention_candidates &&
            question.intention_candidates.length > 0 && (
              <p className="mt-1">
                의도 후보: {question.intention_candidates.join(", ")}
              </p>
            )}
        </div>
      )}

      {question.order_index === 8 &&
        (question.target_emotion || question.target_person) && (
        <div className="mb-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-950">
          <p className="font-medium">심정 파악 문항 정보</p>
          <p className="mt-1">
            대상: {question.target_person || "—"} · 심정:{" "}
            {question.target_emotion || "—"}
          </p>
          {question.emotion_clues && question.emotion_clues.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-0.5 text-slate-700">
              {question.emotion_clues.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {question.order_index === 7 &&
        (question.dream_job || question.target_person) && (
        <div className="mb-3 rounded-lg bg-teal-50 p-2 text-xs text-teal-950">
          <p className="font-medium">장래 희망 문항 정보</p>
          <p className="mt-1">
            대상: {question.target_person || "—"} · 장래 희망:{" "}
            {question.dream_job || "—"}
          </p>
          {question.interest_clues && question.interest_clues.length > 0 && (
            <ul className="mt-2 list-inside list-disc space-y-0.5 text-slate-700">
              {question.interest_clues.map((c, i) => (
                <li key={i}>{c}</li>
              ))}
            </ul>
          )}
        </div>
      )}

      {question.order_index === 6 &&
        (question.final_time || question.time_question_target) && (
        <div className="mb-3 rounded-lg bg-indigo-50 p-2 text-xs text-indigo-950">
          <p className="font-medium">시각 파악 문항 정보</p>
          <p className="mt-1">
            질문 대상: {question.time_question_target || "—"} · 정답 시각:{" "}
            {question.final_time || "—"}
          </p>
          {question.mentioned_times && question.mentioned_times.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {question.mentioned_times.map((m, i) => (
                <li key={i}>
                  {m.time} — {m.role}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {question.order_index === 5 && question.mention_plan && (
        <div className="mb-3 rounded-lg bg-amber-50 p-2 text-xs text-amber-950">
          <p className="font-medium">언급/미언급 계획 (mention_plan)</p>
          {question.mention_plan.topic && (
            <p className="mt-1">주제: {question.mention_plan.topic}</p>
          )}
          <ul className="mt-2 space-y-1">
            {[...question.mention_plan.choice_items]
              .sort((a, b) => a.no - b.no)
              .map((item) => (
                <li key={item.no}>
                  {item.no}. {item.label}{" "}
                  {item.mentioned ? (
                    <span className="text-emerald-700">언급</span>
                  ) : (
                    <span className="font-medium text-red-700">미언급(정답)</span>
                  )}
                  {item.evidence && (
                    <span className="block text-slate-600 italic">
                      {item.evidence}
                    </span>
                  )}
                </li>
              ))}
          </ul>
        </div>
      )}

      {question.order_index === 3 &&
        (question.weather_target_location || question.weather_target_time) && (
        <div className="mb-3 rounded-lg bg-sky-50 p-2 text-xs text-sky-900">
          <p className="font-medium">날씨 문항 정보</p>
          <p className="mt-1">
            지역: {question.weather_target_location || "—"} · 질문 시점:{" "}
            {question.weather_target_time || "—"} · 정답 날씨:{" "}
            {question.weather_answer || "—"}
          </p>
          {question.mentioned_weather_by_time &&
            question.mentioned_weather_by_time.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {question.mentioned_weather_by_time.map((m, i) => (
                  <li key={i}>
                    {m.time}: {m.weather}
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}

      {question.order_index === 2 && question.selected_conditions && (
        <div className="mb-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
          <p className="font-medium text-slate-600">구매 조건</p>
          <ul className="mt-1 space-y-0.5">
            {question.selected_conditions.item_type && (
              <li>물건: {question.selected_conditions.item_type}</li>
            )}
            {question.selected_conditions.color && (
              <li>색: {question.selected_conditions.color}</li>
            )}
            {question.selected_conditions.pattern_or_shape && (
              <li>무늬/형태: {question.selected_conditions.pattern_or_shape}</li>
            )}
            {question.selected_conditions.extra_feature && (
              <li>특징: {question.selected_conditions.extra_feature}</li>
            )}
            {question.selected_conditions.final_choice_sentence && (
              <li className="text-emerald-800">
                최종: {question.selected_conditions.final_choice_sentence}
              </li>
            )}
          </ul>
        </div>
      )}

      <p className="mb-2 text-xs text-slate-600">
        <span className="font-medium">정답:</span> {CIRCLED[question.correct_answer - 1] ?? question.correct_answer}
      </p>

      {question.answer_clue && (
        <p className="mb-2 text-xs text-emerald-800">
          <span className="font-medium">정답 근거:</span> {question.answer_clue}
        </p>
      )}

      {question.explanation && (
        <p className="text-xs text-slate-600">
          <span className="font-medium">해설:</span> {question.explanation}
        </p>
      )}

      {showActions && (onRegenerate || onRevalidate || onGenerateAudio) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {onRegenerate && (
            <button
              type="button"
              disabled={regenerateBusy || revalidateBusy}
              onClick={onRegenerate}
              className="rounded-lg border border-amber-300 px-3 py-1.5 text-xs font-medium text-amber-800 disabled:opacity-50"
            >
              {regenerateBusy ? "재생성 중…" : "이 문항 다시 생성"}
            </button>
          )}
          {onRevalidate && (
            <button
              type="button"
              disabled={regenerateBusy || revalidateBusy}
              onClick={onRevalidate}
              className="rounded-lg border border-slate-300 px-3 py-1.5 text-xs font-medium text-slate-700 disabled:opacity-50"
            >
              {revalidateBusy ? "검수 중…" : "정답/선택지 다시 검수"}
            </button>
          )}
          {onGenerateAudio && (
            <button
              type="button"
              disabled={audioBusy}
              onClick={onGenerateAudio}
              className="rounded-lg border border-indigo-200 px-3 py-1.5 text-xs font-medium text-indigo-700 disabled:opacity-50"
            >
              {audioBusy ? "음원 생성 중…" : "음원 생성"}
            </button>
          )}
        </div>
      )}
    </article>
  );
}
