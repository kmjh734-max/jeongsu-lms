import { createAdminClient } from "@/lib/supabase/admin";
import { applyQuestionFixes } from "@/lib/listening/apply-question-fixes";
import { buildScriptText } from "@/lib/listening/script-text";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";
import { sanitizeSegmentTextForTts } from "@/lib/listening/sanitize-segment-text";
import { voiceForSpeaker } from "@/lib/listening/speaker-voices";

const MIGRATION_HINT =
  "Supabase SQL Editor에서 supabase/migrations/RUN_LISTENING_027_THROUGH_036.sql (및 037~048)을 실행해 주세요.";

function isMissingColumnError(message: string): boolean {
  return /column|schema cache|PGRST204|does not exist/i.test(message);
}

/** 마이그레이션 027 이전 DB에도 저장 가능한 최소 필드 */
function baseQualityFields(q: GeneratedListeningQuestion) {
  return {
    answer_clue: q.answer_clue ?? "",
    needs_review: q.needs_review ?? false,
  };
}

/** 마이그레이션 027~036 적용 후 사용하는 확장 필드 */
function extendedQualityFields(q: GeneratedListeningQuestion) {
  return {
    ...baseQualityFields(q),
    quality_score:
      typeof q.quality_score === "number" ? Math.round(q.quality_score) : null,
    answer_clarity_score:
      typeof q.answer_clarity_score === "number"
        ? Math.round(q.answer_clarity_score)
        : null,
    quality_issues: q.quality_issues ?? [],
    answer_validation: q.answer_validation ?? {},
    table_data: q.table_data ?? null,
    previous_turn: q.previous_turn ?? "",
    correct_response_function: q.correct_response_function ?? "",
    distractor_reason: q.distractor_reason ?? [],
    blank_speaker: q.blank_speaker ?? "",
    situation_type: q.situation_type ?? "",
    needs_image_choices: q.needs_image_choices ?? false,
    choice_image_prompts: q.choice_image_prompts ?? [],
    visual_choice_type: q.visual_choice_type ?? "",
    selected_conditions: q.selected_conditions ?? null,
    weather_target_location: q.weather_target_location ?? "",
    weather_target_time: q.weather_target_time ?? "",
    weather_answer: q.weather_answer ?? "",
    mentioned_weather_by_time: q.mentioned_weather_by_time ?? [],
    last_speaker: q.last_speaker ?? "",
    final_utterance: q.final_utterance ?? "",
    target_intention: q.target_intention ?? "",
    intention_candidates: q.intention_candidates ?? [],
    mention_plan: q.mention_plan ?? {},
    time_question_target: q.time_question_target ?? "",
    final_time: q.final_time ?? "",
    mentioned_times: q.mentioned_times ?? [],
    target_person: q.target_person ?? "",
    dream_job: q.dream_job ?? "",
    interest_clues: q.interest_clues ?? [],
    target_emotion: q.target_emotion ?? "",
    emotion_clues: q.emotion_clues ?? [],
    immediate_action: q.immediate_action ?? "",
    mentioned_actions: q.mentioned_actions ?? [],
    main_content: q.main_content ?? "",
    content_clues: q.content_clues ?? [],
    topic_distractor_reasons: q.topic_distractor_reasons ?? [],
    destination: q.destination ?? "",
    final_transport: q.final_transport ?? "",
    mentioned_transport_options: q.mentioned_transport_options ?? [],
    target_place: q.target_place ?? "",
    reason_for_going: q.reason_for_going ?? "",
    mentioned_possible_reasons: q.mentioned_possible_reasons ?? [],
    place_clues: q.place_clues ?? [],
    distractor_places: q.distractor_places ?? [],
    source_facts_from_script: q.source_facts_from_script ?? [],
    requester: q.requester ?? "",
    requested_person: q.requested_person ?? "",
    requested_action: q.requested_action ?? "",
    request_expression: q.request_expression ?? "",
    suggester: q.suggester ?? "",
    suggested_to: q.suggested_to ?? "",
    suggested_action: q.suggested_action ?? "",
    suggestion_expression: q.suggestion_expression ?? "",
    target_time: q.target_time ?? "",
    planned_action: q.planned_action ?? "",
    mentioned_other_actions: q.mentioned_other_actions ?? [],
    target_job: q.target_job ?? "",
    job_clues: q.job_clues ?? [],
    distractor_jobs: q.distractor_jobs ?? [],
  };
}

function buildQuestionRow(
  setId: string,
  q: GeneratedListeningQuestion,
  script_text: string,
  extended: boolean
) {
  return {
    set_id: setId,
    order_index: q.order_index,
    question_type: q.question_type,
    instruction: q.instruction ?? "",
    script_text,
    script_translation: q.script_translation,
    question_text: q.question_text,
    choices: q.choices.filter(Boolean),
    correct_answer: q.correct_answer,
    explanation: q.explanation,
    ...(extended ? extendedQualityFields(q) : baseQualityFields(q)),
  };
}

/** 세트의 기존 문항·segment·음원 메타 일괄 삭제 (cascade) */
export async function clearListeningQuestionsForSet(
  setId: string
): Promise<void> {
  const admin = createAdminClient();
  const { error } = await admin
    .from("listening_questions")
    .delete()
    .eq("set_id", setId);
  if (error) throw new Error(error.message);
}

async function findQuestionIdByOrderIndex(
  admin: ReturnType<typeof createAdminClient>,
  setId: string,
  orderIndex: number
): Promise<string | null> {
  const { data, error } = await admin
    .from("listening_questions")
    .select("id")
    .eq("set_id", setId)
    .eq("order_index", orderIndex)
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (error) throw new Error(error.message);
  return data?.id ?? null;
}

export async function persistGeneratedQuestions(
  setId: string,
  questions: GeneratedListeningQuestion[],
  opts?: { replaceAll?: boolean }
): Promise<
  Array<
    GeneratedListeningQuestion & {
      id: string;
      segments: Array<{ id: string; speaker: string; text: string }>;
      schema_extended_saved?: boolean;
    }
  >
> {
  const admin = createAdminClient();

  if (opts?.replaceAll) {
    await clearListeningQuestionsForSet(setId);
  }

  const saved: Array<
    GeneratedListeningQuestion & {
      id: string;
      segments: Array<{ id: string; speaker: string; text: string }>;
      schema_extended_saved?: boolean;
    }
  > = [];

  for (const raw of questions) {
    if (!opts?.replaceAll) {
      const existingId = await findQuestionIdByOrderIndex(
        admin,
        setId,
        raw.order_index
      );
      if (existingId) {
        saved.push(await replaceGeneratedQuestion(setId, existingId, raw));
        continue;
      }
    }
    saved.push(await insertOneQuestion(admin, setId, raw));
  }

  return saved;
}

async function insertOneQuestion(
  admin: ReturnType<typeof createAdminClient>,
  setId: string,
  raw: GeneratedListeningQuestion
) {
  const q = applyQuestionFixes(raw, raw.order_index);
  const script_text = q.script_text || buildScriptText(q.segments);

  let schema_extended_saved = true;
  let questionRow: { id: string } | null = null;
  let lastError: string | undefined;

  for (const extended of [true, false]) {
    const { data, error: qErr } = await admin
      .from("listening_questions")
      .insert(buildQuestionRow(setId, q, script_text, extended))
      .select("id")
      .single();

    if (!qErr && data) {
      questionRow = data;
      schema_extended_saved = extended;
      break;
    }

    lastError = qErr?.message;
    if (!extended || !lastError || !isMissingColumnError(lastError)) {
      break;
    }
  }

  if (!questionRow) {
    const hint = lastError && isMissingColumnError(lastError) ? ` ${MIGRATION_HINT}` : "";
    throw new Error((lastError ?? "문항 저장 실패") + hint);
  }

  const segments = await insertSegments(admin, questionRow.id, q.segments);

  return {
    ...q,
    script_text,
    id: questionRow.id,
    segments,
    schema_extended_saved,
  };
}

async function insertSegments(
  admin: ReturnType<typeof createAdminClient>,
  questionId: string,
  segments: GeneratedListeningQuestion["segments"]
) {
  const segmentRows = segments.map((seg, idx) => ({
    question_id: questionId,
    order_index: idx,
    speaker_type: seg.speaker,
    text: sanitizeSegmentTextForTts(seg.text),
    voice_name: voiceForSpeaker(seg.speaker),
  }));

  const { data: segData, error: sErr } = await admin
    .from("listening_question_segments")
    .insert(segmentRows)
    .select("id, speaker_type, text, order_index");

  if (sErr) {
    throw new Error(sErr.message);
  }

  const ordered = (segData ?? []).sort((a, b) => a.order_index - b.order_index);
  return ordered.map((s) => ({
    id: s.id,
    speaker: s.speaker_type,
    text: s.text,
  }));
}

/** 재생성 시 기존 questionId 유지, 음원 초기화 */
export async function replaceGeneratedQuestion(
  setId: string,
  questionId: string,
  raw: GeneratedListeningQuestion
): Promise<
  GeneratedListeningQuestion & {
    id: string;
    segments: Array<{ id: string; speaker: string; text: string }>;
    schema_extended_saved?: boolean;
  }
> {
  const admin = createAdminClient();
  const q = applyQuestionFixes(raw, raw.order_index);
  const script_text = q.script_text || buildScriptText(q.segments);

  await admin.from("listening_question_segments").delete().eq("question_id", questionId);

  let schema_extended_saved = true;
  let lastError: string | undefined;

  for (const extended of [true, false]) {
    const { error: upErr } = await admin
      .from("listening_questions")
      .update({
        ...buildQuestionRow(setId, q, script_text, extended),
        audio_url: null,
      })
      .eq("id", questionId)
      .eq("set_id", setId);

    if (!upErr) {
      schema_extended_saved = extended;
      lastError = undefined;
      break;
    }

    lastError = upErr.message;
    if (!extended || !isMissingColumnError(lastError)) {
      break;
    }
  }

  if (lastError) {
    const hint = isMissingColumnError(lastError) ? ` ${MIGRATION_HINT}` : "";
    throw new Error(lastError + hint);
  }

  const segments = await insertSegments(admin, questionId, q.segments);

  return {
    ...q,
    script_text,
    id: questionId,
    segments,
    schema_extended_saved,
  };
}

export async function replaceQuestionSegments(
  questionId: string,
  segments: Array<{ speaker: string; text: string }>
): Promise<void> {
  const admin = createAdminClient();

  await admin.from("listening_question_segments").delete().eq("question_id", questionId);

  const rows = segments.map((seg, idx) => ({
    question_id: questionId,
    order_index: idx,
    speaker_type: seg.speaker,
    text: sanitizeSegmentTextForTts(seg.text),
    voice_name:
      seg.speaker === "ANN" || seg.speaker === "M" || seg.speaker === "W"
        ? voiceForSpeaker(seg.speaker)
        : null,
  }));

  const { error } = await admin.from("listening_question_segments").insert(rows);
  if (error) throw new Error(error.message);

  const script_text = buildScriptText(
    segments.map((s) => ({
      speaker: s.speaker as "ANN" | "M" | "W",
      text: s.text,
    }))
  );

  await admin
    .from("listening_questions")
    .update({ script_text, audio_url: null })
    .eq("id", questionId);
}
