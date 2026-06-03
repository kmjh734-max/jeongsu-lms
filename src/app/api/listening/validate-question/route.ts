import { NextResponse } from "next/server";
import { fetchListeningSetGradeLevel } from "@/lib/listening/fetch-set-grade";
import { getExamTypeById } from "@/lib/listening/exam-types";
import { assertListeningSetAccess } from "@/lib/listening/listening-api-auth";
import { assertListeningOpenAiEnv } from "@/lib/listening/assert-listening-openai";
import { validateAndRepairListeningQuestion } from "@/lib/listening/validate-and-repair";
import { normalizeTableData } from "@/lib/listening/table-data";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false, message }, { status });
}

function rowToGenerated(
  row: Record<string, unknown>,
  segments: Array<{ speaker_type: string; text: string }>
): GeneratedListeningQuestion {
  return {
    order_index: Number(row.order_index),
    question_type: String(row.question_type),
    instruction: String(row.instruction ?? ""),
    segments: segments.map((s) => ({
      speaker: s.speaker_type as "ANN" | "M" | "W",
      text: s.text,
    })),
    script_text: String(row.script_text ?? ""),
    script_translation: String(row.script_translation ?? ""),
    question_text: String(row.question_text ?? ""),
    choices: Array.isArray(row.choices) ? (row.choices as string[]) : [],
    correct_answer: Number(row.correct_answer),
    answer_clue: String(row.answer_clue ?? ""),
    explanation: String(row.explanation ?? ""),
    table_data: normalizeTableData(row.table_data),
    previous_turn: String(row.previous_turn ?? ""),
    correct_response_function: String(row.correct_response_function ?? ""),
    distractor_reason: Array.isArray(row.distractor_reason)
      ? (row.distractor_reason as string[])
      : [],
    blank_speaker: String(row.blank_speaker ?? ""),
    situation_type: String(row.situation_type ?? ""),
    needs_image_choices: Boolean(row.needs_image_choices),
    choice_image_prompts: Array.isArray(row.choice_image_prompts)
      ? (row.choice_image_prompts as string[])
      : [],
    visual_choice_type: String(row.visual_choice_type ?? ""),
    selected_conditions:
      row.selected_conditions && typeof row.selected_conditions === "object"
        ? (row.selected_conditions as GeneratedListeningQuestion["selected_conditions"])
        : undefined,
    weather_target_location: String(row.weather_target_location ?? ""),
    weather_target_time: String(row.weather_target_time ?? ""),
    weather_answer: String(row.weather_answer ?? ""),
    mentioned_weather_by_time: Array.isArray(row.mentioned_weather_by_time)
      ? (row.mentioned_weather_by_time as GeneratedListeningQuestion["mentioned_weather_by_time"])
      : [],
    last_speaker:
      row.last_speaker === "M" || row.last_speaker === "W"
        ? row.last_speaker
        : undefined,
    final_utterance: String(row.final_utterance ?? ""),
    target_intention: String(row.target_intention ?? ""),
    intention_candidates: Array.isArray(row.intention_candidates)
      ? (row.intention_candidates as string[])
      : [],
    mention_plan:
      row.mention_plan && typeof row.mention_plan === "object"
        ? (row.mention_plan as GeneratedListeningQuestion["mention_plan"])
        : null,
    time_question_target: String(row.time_question_target ?? ""),
    final_time: String(row.final_time ?? ""),
    mentioned_times: Array.isArray(row.mentioned_times)
      ? (row.mentioned_times as GeneratedListeningQuestion["mentioned_times"])
      : [],
    target_person: String(row.target_person ?? ""),
    dream_job: String(row.dream_job ?? ""),
    interest_clues: Array.isArray(row.interest_clues)
      ? (row.interest_clues as string[])
      : [],
    target_emotion: String(row.target_emotion ?? ""),
    emotion_clues: Array.isArray(row.emotion_clues)
      ? (row.emotion_clues as string[])
      : [],
    immediate_action: String(row.immediate_action ?? ""),
    mentioned_actions: Array.isArray(row.mentioned_actions)
      ? (row.mentioned_actions as GeneratedListeningQuestion["mentioned_actions"])
      : [],
    main_content: String(row.main_content ?? ""),
    content_clues: Array.isArray(row.content_clues)
      ? (row.content_clues as string[]).map(String)
      : [],
    topic_distractor_reasons: Array.isArray(row.topic_distractor_reasons)
      ? (row.topic_distractor_reasons as GeneratedListeningQuestion["topic_distractor_reasons"])
      : [],
    destination: String(row.destination ?? ""),
    final_transport: String(row.final_transport ?? ""),
    mentioned_transport_options: Array.isArray(row.mentioned_transport_options)
      ? (row.mentioned_transport_options as GeneratedListeningQuestion["mentioned_transport_options"])
      : [],
    target_place: String(row.target_place ?? ""),
    reason_for_going: String(row.reason_for_going ?? ""),
    mentioned_possible_reasons: Array.isArray(row.mentioned_possible_reasons)
      ? (row.mentioned_possible_reasons as GeneratedListeningQuestion["mentioned_possible_reasons"])
      : [],
    place_clues: Array.isArray(row.place_clues)
      ? (row.place_clues as string[]).map(String)
      : [],
    distractor_places: Array.isArray(row.distractor_places)
      ? (row.distractor_places as GeneratedListeningQuestion["distractor_places"])
      : [],
    source_facts_from_script: Array.isArray(row.source_facts_from_script)
      ? (row.source_facts_from_script as GeneratedListeningQuestion["source_facts_from_script"])
      : [],
    requester: String(row.requester ?? ""),
    requested_person: String(row.requested_person ?? ""),
    requested_action: String(row.requested_action ?? ""),
    request_expression: String(row.request_expression ?? ""),
    suggester: String(row.suggester ?? ""),
    suggested_to: String(row.suggested_to ?? ""),
    suggested_action: String(row.suggested_action ?? ""),
    suggestion_expression: String(row.suggestion_expression ?? ""),
    target_time: String(row.target_time ?? ""),
    planned_action: String(row.planned_action ?? ""),
    mentioned_other_actions: Array.isArray(row.mentioned_other_actions)
      ? (row.mentioned_other_actions as GeneratedListeningQuestion["mentioned_other_actions"])
      : [],
    target_job: String(row.target_job ?? ""),
    job_clues: Array.isArray(row.job_clues)
      ? (row.job_clues as string[]).map(String)
      : [],
    distractor_jobs: Array.isArray(row.distractor_jobs)
      ? (row.distractor_jobs as GeneratedListeningQuestion["distractor_jobs"])
      : [],
  };
}

export async function POST(request: Request) {
  try {
    let apiKey: string;
    try {
      ({ apiKey } = assertListeningOpenAiEnv());
    } catch (e) {
      return jsonError(e instanceof Error ? e.message : "OpenAI 설정 오류");
    }

    const body = (await request.json()) as {
      setId?: string;
      questionId?: string;
      question?: GeneratedListeningQuestion;
      persist?: boolean;
    };

    let q = body.question;
    const questionId = body.questionId?.trim();
    const setId = body.setId?.trim();

    if (questionId && setId) {
      const access = await assertListeningSetAccess(setId);
      if (!access.ok) return jsonError(access.message, access.status);

      const { data: row } = await access.admin
        .from("listening_questions")
        .select("*")
        .eq("id", questionId)
        .eq("set_id", setId)
        .maybeSingle();

      if (!row) return jsonError("문항을 찾을 수 없습니다.");

      const { data: segs } = await access.admin
        .from("listening_question_segments")
        .select("speaker_type, text")
        .eq("question_id", questionId)
        .order("order_index", { ascending: true });

      q = rowToGenerated(row, segs ?? []);
    }

    if (!q) return jsonError("question 또는 questionId가 필요합니다.");

    const gradeLevel = setId ? await fetchListeningSetGradeLevel(setId) : "middle1";
    const typeHint = getExamTypeById(q.order_index, gradeLevel) ?? undefined;
    const validated = await validateAndRepairListeningQuestion(
      apiKey,
      q,
      typeHint,
      gradeLevel
    );

    if (body.persist && questionId && setId) {
      const access = await assertListeningSetAccess(setId);
      if (!access.ok) return jsonError(access.message, access.status);

      await access.admin
        .from("listening_questions")
        .update({
          needs_review: validated.needs_review,
          quality_score: validated.quality_score,
          answer_clarity_score: validated.answer_clarity_score,
          quality_issues: validated.quality_issues,
          answer_validation: validated.answer_validation,
          answer_clue:
            validated.answer_clue?.trim() ||
            validated.answer_validation.answer_clue ||
            q.answer_clue,
        })
        .eq("id", questionId);
    }

    return NextResponse.json({
      ok: true,
      question: validated,
      validation: {
        quality_score: validated.quality_score,
        answer_clarity_score: validated.answer_clarity_score,
        is_answer_clear: validated.is_answer_clear,
        has_multiple_possible_answers: validated.has_multiple_possible_answers,
        has_answer_clue: validated.has_answer_clue,
        needs_review: validated.needs_review,
        problems: validated.problems,
        suggestions: validated.suggestions,
        quality_issues: validated.quality_issues,
        answer_validation: validated.answer_validation,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : "검수 실패";
    return jsonError(message);
  }
}
