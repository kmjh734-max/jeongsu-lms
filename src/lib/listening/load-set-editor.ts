import type { SupabaseClient } from "@supabase/supabase-js";
import type { ListeningQuestionData } from "@/components/listening/ListeningQuestionEditor";

export async function loadListeningSetForEditor(
  supabase: SupabaseClient,
  setId: string
) {
  const { data: set, error: setErr } = await supabase
    .from("listening_sets")
    .select(
      "id, title, is_published, teacher_id, created_by, speech_speed, voice_ann_id, voice_m_id, voice_w_id, grade_level"
    )
    .eq("id", setId)
    .maybeSingle();

  if (setErr || !set) return null;

  const { data: questions } = await supabase
    .from("listening_questions")
    .select(
      "id, order_index, question_type, instruction, question_text, choices, correct_answer, explanation, answer_clue, needs_review, quality_score, answer_clarity_score, quality_issues, answer_validation, table_data, previous_turn, correct_response_function, distractor_reason, blank_speaker, situation_type, needs_image_choices, choice_image_prompts, visual_choice_type, selected_conditions, weather_target_location, weather_target_time, weather_answer, mentioned_weather_by_time, last_speaker, final_utterance, target_intention, intention_candidates, mention_plan, time_question_target, final_time, mentioned_times, target_person, dream_job, interest_clues, target_emotion, emotion_clues, immediate_action, mentioned_actions, main_content, content_clues, topic_distractor_reasons, destination, final_transport, mentioned_transport_options, target_place, reason_for_going, mentioned_possible_reasons, place_clues, distractor_places, source_facts_from_script, requester, requested_person, requested_action, request_expression, suggester, suggested_to, suggested_action, suggestion_expression, target_time, planned_action, mentioned_other_actions, target_job, job_clues, distractor_jobs, script_text, script_translation, audio_url"
    )
    .eq("set_id", setId)
    .order("order_index", { ascending: true });

  const questionIds = (questions ?? []).map((q) => q.id);
  const { data: segments } =
    questionIds.length > 0
      ? await supabase
          .from("listening_question_segments")
          .select("id, question_id, order_index, speaker_type, text, audio_url")
          .in("question_id", questionIds)
          .order("order_index", { ascending: true })
      : { data: [] };

  const segmentsByQuestion = new Map<string, ListeningQuestionData["segments"]>();
  for (const seg of segments ?? []) {
    const list = segmentsByQuestion.get(seg.question_id) ?? [];
    list.push(seg);
    segmentsByQuestion.set(seg.question_id, list);
  }

  const questionRows: ListeningQuestionData[] = (questions ?? []).map((q) => ({
    ...q,
    choices: Array.isArray(q.choices) ? (q.choices as string[]) : [],
    quality_issues: Array.isArray(q.quality_issues)
      ? (q.quality_issues as ListeningQuestionData["quality_issues"])
      : [],
    answer_validation:
      q.answer_validation && typeof q.answer_validation === "object"
        ? q.answer_validation
        : {},
    table_data:
      q.table_data && typeof q.table_data === "object"
        ? (q.table_data as ListeningQuestionData["table_data"])
        : null,
    previous_turn: String(q.previous_turn ?? ""),
    correct_response_function: String(q.correct_response_function ?? ""),
    distractor_reason: Array.isArray(q.distractor_reason)
      ? (q.distractor_reason as string[])
      : [],
    blank_speaker: String(q.blank_speaker ?? ""),
    situation_type: String(q.situation_type ?? ""),
    needs_image_choices: Boolean(q.needs_image_choices),
    choice_image_prompts: Array.isArray(q.choice_image_prompts)
      ? (q.choice_image_prompts as string[]).map(String)
      : [],
    visual_choice_type: String(q.visual_choice_type ?? ""),
    selected_conditions:
      q.selected_conditions && typeof q.selected_conditions === "object"
        ? (q.selected_conditions as ListeningQuestionData["selected_conditions"])
        : null,
    weather_target_location: String(q.weather_target_location ?? ""),
    weather_target_time: String(q.weather_target_time ?? ""),
    weather_answer: String(q.weather_answer ?? ""),
    mentioned_weather_by_time: Array.isArray(q.mentioned_weather_by_time)
      ? (q.mentioned_weather_by_time as ListeningQuestionData["mentioned_weather_by_time"])
      : [],
    last_speaker: String(q.last_speaker ?? ""),
    final_utterance: String(q.final_utterance ?? ""),
    target_intention: String(q.target_intention ?? ""),
    intention_candidates: Array.isArray(q.intention_candidates)
      ? (q.intention_candidates as string[]).map(String)
      : [],
    mention_plan:
      q.mention_plan && typeof q.mention_plan === "object"
        ? (q.mention_plan as ListeningQuestionData["mention_plan"])
        : null,
    time_question_target: String(q.time_question_target ?? ""),
    final_time: String(q.final_time ?? ""),
    mentioned_times: Array.isArray(q.mentioned_times)
      ? (q.mentioned_times as ListeningQuestionData["mentioned_times"])
      : [],
    target_person: String(q.target_person ?? ""),
    dream_job: String(q.dream_job ?? ""),
    interest_clues: Array.isArray(q.interest_clues)
      ? (q.interest_clues as string[]).map(String)
      : [],
    target_emotion: String(q.target_emotion ?? ""),
    emotion_clues: Array.isArray(q.emotion_clues)
      ? (q.emotion_clues as string[]).map(String)
      : [],
    immediate_action: String(q.immediate_action ?? ""),
    mentioned_actions: Array.isArray(q.mentioned_actions)
      ? (q.mentioned_actions as ListeningQuestionData["mentioned_actions"])
      : [],
    main_content: String(q.main_content ?? ""),
    content_clues: Array.isArray(q.content_clues)
      ? (q.content_clues as string[]).map(String)
      : [],
    topic_distractor_reasons: Array.isArray(q.topic_distractor_reasons)
      ? (q.topic_distractor_reasons as ListeningQuestionData["topic_distractor_reasons"])
      : [],
    destination: String(q.destination ?? ""),
    final_transport: String(q.final_transport ?? ""),
    mentioned_transport_options: Array.isArray(q.mentioned_transport_options)
      ? (q.mentioned_transport_options as ListeningQuestionData["mentioned_transport_options"])
      : [],
    target_place: String(q.target_place ?? ""),
    reason_for_going: String(q.reason_for_going ?? ""),
    mentioned_possible_reasons: Array.isArray(q.mentioned_possible_reasons)
      ? (q.mentioned_possible_reasons as ListeningQuestionData["mentioned_possible_reasons"])
      : [],
    place_clues: Array.isArray(q.place_clues)
      ? (q.place_clues as string[]).map(String)
      : [],
    distractor_places: Array.isArray(q.distractor_places)
      ? (q.distractor_places as ListeningQuestionData["distractor_places"])
      : [],
    source_facts_from_script: Array.isArray(q.source_facts_from_script)
      ? (q.source_facts_from_script as ListeningQuestionData["source_facts_from_script"])
      : [],
    requester: String(q.requester ?? ""),
    requested_person: String(q.requested_person ?? ""),
    requested_action: String(q.requested_action ?? ""),
    request_expression: String(q.request_expression ?? ""),
    suggester: String(q.suggester ?? ""),
    suggested_to: String(q.suggested_to ?? ""),
    suggested_action: String(q.suggested_action ?? ""),
    suggestion_expression: String(q.suggestion_expression ?? ""),
    target_time: String(q.target_time ?? ""),
    planned_action: String(q.planned_action ?? ""),
    mentioned_other_actions: Array.isArray(q.mentioned_other_actions)
      ? (q.mentioned_other_actions as ListeningQuestionData["mentioned_other_actions"])
      : [],
    target_job: String(q.target_job ?? ""),
    job_clues: Array.isArray(q.job_clues)
      ? (q.job_clues as string[]).map(String)
      : [],
    distractor_jobs: Array.isArray(q.distractor_jobs)
      ? (q.distractor_jobs as ListeningQuestionData["distractor_jobs"])
      : [],
    segments: segmentsByQuestion.get(q.id) ?? [],
  }));

  return { set, questions: questionRows };
}
