"use client";

import { continuationQuestionDisplayText } from "@/lib/listening/fix-continuation-question";
import { ListeningTableDisplay } from "@/components/listening/ListeningTableDisplay";
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
  const filledChoices = (question.choices ?? []).filter((c) => c?.trim());
  const table = normalizeTableData(question.table_data);
  const blankLine = continuationQuestionDisplayText(question.order_index);
  const av = question.answer_validation;

  return (
    <article className="rounded-xl border border-indigo-100 bg-white p-4 shadow-sm">
      <header className="mb-3 flex flex-wrap items-start justify-between gap-2 border-b border-slate-100 pb-2">
        <div>
          <p className="text-xs font-medium text-indigo-600">
            {question.order_index}번 · {question.question_type}
          </p>
          {question.instruction && (
            <p className="mt-2 text-sm font-medium text-slate-900">{question.instruction}</p>
          )}
        </div>
      </header>

      {audioNeedsRegeneration && (
        <p className="mb-2 rounded-lg bg-violet-50 px-2 py-1 text-xs text-violet-800">
          음원 재생성이 필요합니다.
        </p>
      )}

      <div className="mb-3">
        <p className="text-xs font-medium text-slate-500">대본</p>
        <ul className="mt-1 space-y-1 text-sm text-slate-700">
          {(question.segments ?? []).map((seg, i) => (
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
          {question.order_index === 14 &&
            question.source_facts_from_script &&
            question.source_facts_from_script.length > 0 && (
              <div className="mt-2 rounded-lg bg-slate-50 p-2 text-xs text-slate-800">
                <p className="font-medium">대본 기준 정보</p>
                <ul className="mt-1 space-y-0.5">
                  {question.source_facts_from_script.map((f, i) => (
                    <li key={i}>
                      {f.label}: {f.value}
                    </li>
                  ))}
                </ul>
              </div>
            )}
        </div>
      )}

      {blankLine && (
        <p className="mb-2 font-mono text-sm text-slate-800">{blankLine}</p>
      )}

      {(question.order_index === 19 || question.order_index === 20) && (
        <div className="mb-3 rounded-lg bg-slate-50 p-2 text-xs text-slate-700">
          {question.order_index === 19 && question.blank_speaker && (
            <p>
              <span className="font-medium">빈칸 화자:</span>{" "}
              {question.blank_speaker === "M" ? "남자 (Man)" : "여자 (Woman)"}
            </p>
          )}
          {question.order_index === 20 && question.blank_speaker && (
            <p>
              <span className="font-medium">빈칸 화자:</span>{" "}
              {question.blank_speaker === "W" ? "여자 (Woman)" : "남자 (Man)"}
            </p>
          )}
          {question.order_index === 20 && question.situation_type && (
            <p className="mt-1">
              <span className="font-medium">상황:</span> {question.situation_type}
            </p>
          )}
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
          {question.distractor_reason &&
            question.distractor_reason.filter(Boolean).length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {question.distractor_reason.map((d, i) =>
                d.trim() ? (
                  <li key={i}>{d}</li>
                ) : null
              )}
            </ul>
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
            {((question.choice_image_urls?.length ?? 0) > 1 &&
              question.choice_image_urls?.[i]?.trim()) ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={question.choice_image_urls[i]}
                alt=""
                className="mt-1 max-h-28 rounded border border-slate-200"
              />
            ) : (question.choice_image_urls?.length ?? 0) <= 1 &&
              question.choice_image_prompts?.[i]?.trim() ? (
              <p className="mt-0.5 text-xs text-slate-500">
                그림: {question.choice_image_prompts[i]}
              </p>
            ) : null}
          </li>
        ))}
      </ul>

      {(question.choice_image_urls?.length === 1 &&
        question.choice_image_urls[0]?.trim()) && (
        <div className="mb-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={question.choice_image_urls[0]}
            alt="문항 그림"
            className="max-h-64 w-auto rounded border border-slate-200"
          />
        </div>
      )}

      {(question.order_index === 1 ||
        question.order_index === 2 ||
        question.order_index === 3) &&
        question.needs_image_choices && (
        <p className="mb-2 text-xs text-violet-700">
          그림 선택지 문항
          {question.visual_choice_type
            ? ` (${question.visual_choice_type})`
            : ""}
          {(question.choice_image_urls ?? []).some((u) => u?.trim())
            ? " — 이미지 있음"
            : " — 이미지 미생성"}
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

      {question.order_index === 15 &&
        (question.requested_action ||
          question.requester ||
          question.request_expression) && (
        <div className="mb-3 rounded-lg bg-rose-50 p-2 text-xs text-rose-950">
          <p className="font-medium">부탁한 일 문항 정보</p>
          <p className="mt-1">
            부탁: {question.requester || "—"} → {question.requested_person || "—"}{" "}
            · 행동: {question.requested_action || "—"}
          </p>
          {question.request_expression && (
            <p className="mt-1 italic">{question.request_expression}</p>
          )}
          {question.mentioned_actions && question.mentioned_actions.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {question.mentioned_actions.map((m, i) => (
                <li key={i}>
                  {m.action}{" "}
                  <span className="text-slate-600">({m.role})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {question.order_index === 16 &&
        (question.suggested_action ||
          question.suggester ||
          question.suggestion_expression) && (
        <div className="mb-3 rounded-lg bg-sky-50 p-2 text-xs text-sky-950">
          <p className="font-medium">제안한 것 문항 정보</p>
          <p className="mt-1">
            제안: {question.suggester || "—"} → {question.suggested_to || "—"}{" "}
            · 행동: {question.suggested_action || "—"}
          </p>
          {question.suggestion_expression && (
            <p className="mt-1 italic">{question.suggestion_expression}</p>
          )}
          {question.mentioned_actions && question.mentioned_actions.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {question.mentioned_actions.map((m, i) => (
                <li key={i}>
                  {m.action}{" "}
                  <span className="text-slate-600">({m.role})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {question.order_index === 17 &&
        (question.planned_action ||
          question.target_time ||
          question.target_person) && (
        <div className="mb-3 rounded-lg bg-teal-50 p-2 text-xs text-teal-950">
          <p className="font-medium">특정 시점에 할 일 문항 정보</p>
          <p className="mt-1">
            대상: {question.target_person || "—"} · 시점:{" "}
            {question.target_time || "—"} · 활동:{" "}
            {question.planned_action || "—"}
          </p>
          {question.mentioned_other_actions &&
            question.mentioned_other_actions.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {question.mentioned_other_actions.map((m, i) => (
                <li key={i}>
                  {m.action}{" "}
                  <span className="text-slate-600">({m.role})</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {question.order_index === 18 &&
        (question.target_job ||
          question.target_person ||
          (question.job_clues?.length ?? 0) > 0) && (
        <div className="mb-3 rounded-lg bg-violet-50 p-2 text-xs text-violet-950">
          <p className="font-medium">직업 파악 문항 정보</p>
          <p className="mt-1">
            대상: {question.target_person || "—"} · 직업:{" "}
            {question.target_job || "—"}
          </p>
          {question.job_clues && question.job_clues.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {question.job_clues.map((clue, i) => (
                <li key={i} className="italic">
                  {clue}
                </li>
              ))}
            </ul>
          )}
          {question.distractor_jobs && question.distractor_jobs.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {question.distractor_jobs.map((d, i) => (
                <li key={i}>
                  {d.job}{" "}
                  <span className="text-slate-600">— {d.reason}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}

      {question.order_index === 13 &&
        (question.target_place || (question.place_clues?.length ?? 0) > 0) && (
        <div className="mb-3 rounded-lg bg-emerald-50 p-2 text-xs text-emerald-950">
          <p className="font-medium">대화 장소 파악 문항 정보</p>
          <p className="mt-1">
            대화 장소: {question.target_place || "—"}
          </p>
          {question.place_clues && question.place_clues.length > 0 && (
            <p className="mt-1">
              장소 단서: {question.place_clues.join(" · ")}
            </p>
          )}
          {question.distractor_places &&
            question.distractor_places.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {question.distractor_places.map((d, i) => (
                  <li key={i}>
                    {d.place}: {d.reason}
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}

      {question.order_index === 12 &&
        (question.reason_for_going ||
          question.target_place ||
          question.target_person) && (
        <div className="mb-3 rounded-lg bg-indigo-50 p-2 text-xs text-indigo-950">
          <p className="font-medium">이유 파악 문항 정보</p>
          <p className="mt-1">
            대상: {question.target_person || "—"} · 장소:{" "}
            {question.target_place || "—"} · 이유:{" "}
            {question.reason_for_going || "—"}
          </p>
          {question.mentioned_possible_reasons &&
            question.mentioned_possible_reasons.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {question.mentioned_possible_reasons.map((m, i) => (
                  <li key={i}>
                    {m.reason}{" "}
                    <span className="text-slate-600">({m.role})</span>
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}

      {question.order_index === 11 &&
        (question.final_transport ||
          question.destination ||
          (question.mentioned_transport_options?.length ?? 0) > 0) && (
        <div className="mb-3 rounded-lg bg-sky-50 p-2 text-xs text-sky-950">
          <p className="font-medium">이동 방법 파악 문항 정보</p>
          <p className="mt-1">
            목적지: {question.destination || "—"} · 최종 수단:{" "}
            {question.final_transport || "—"}
          </p>
          {question.mentioned_transport_options &&
            question.mentioned_transport_options.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {question.mentioned_transport_options.map((m, i) => (
                  <li key={i}>
                    {m.transport}{" "}
                    <span className="text-slate-600">
                      ({m.role}
                      {m.reason ? `: ${m.reason}` : ""})
                    </span>
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}

      {question.order_index === 10 &&
        (question.main_content || (question.content_clues?.length ?? 0) > 0) && (
        <div className="mb-3 rounded-lg bg-teal-50 p-2 text-xs text-teal-950">
          <p className="font-medium">핵심 내용 파악 문항 정보</p>
          <p className="mt-1">
            핵심 내용: {question.main_content || "—"}
          </p>
          {question.content_clues && question.content_clues.length > 0 && (
            <p className="mt-1">
              내용 단서: {question.content_clues.join(" · ")}
            </p>
          )}
          {question.topic_distractor_reasons &&
            question.topic_distractor_reasons.length > 0 && (
              <ul className="mt-2 space-y-0.5">
                {question.topic_distractor_reasons.map((d, i) => (
                  <li key={i}>
                    {d.choice}: {d.reason}
                  </li>
                ))}
              </ul>
            )}
        </div>
      )}

      {question.order_index === 9 &&
        (question.immediate_action || question.target_person) && (
        <div className="mb-3 rounded-lg bg-orange-50 p-2 text-xs text-orange-950">
          <p className="font-medium">대화 직후 할 일 문항 정보</p>
          <p className="mt-1">
            대상: {question.target_person || "—"} · 직후 행동:{" "}
            {question.immediate_action || "—"}
          </p>
          {question.mentioned_actions && question.mentioned_actions.length > 0 && (
            <ul className="mt-2 space-y-0.5">
              {question.mentioned_actions.map((m, i) => (
                <li key={i}>
                  {m.action}{" "}
                  <span className="text-slate-600">({m.role})</span>
                </li>
              ))}
            </ul>
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
