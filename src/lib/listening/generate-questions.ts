import { applyQuestionFixes } from "@/lib/listening/apply-question-fixes";
import { normalizeMentionPlan } from "@/lib/listening/type5-mention-plan";
import { normalizeMentionedTimes } from "@/lib/listening/type6-time-choices";
import { normalizeInterestClues } from "@/lib/listening/type7-career-choices";
import { normalizeEmotionClues } from "@/lib/listening/type8-emotion-choices";
import { normalizeTableData } from "@/lib/listening/table-data";
import { buildScriptText } from "@/lib/listening/script-text";
import { sanitizeSegmentTextForTts } from "@/lib/listening/sanitize-segment-text";
import type { ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import {
  resolveExamTypesForGeneration,
  type ExamTypeTemplate,
} from "@/lib/listening/exam-types";
import {
  buildListeningExamPrompt,
  buildListeningFreePrompt,
  buildListeningSingleTypePrompt,
} from "@/lib/listening/prompts/buildListeningPrompt";
import { LISTENING_SYSTEM_PROMPT } from "@/lib/listening/prompts/commonPrompt";
import {
  attachValidationToQuestion,
  attachValidationToQuestions,
} from "@/lib/listening/run-question-validation";
import type {
  GeneratedListeningQuestion,
  ListeningGenerationMode,
  ListeningScriptSegment,
} from "@/lib/listening/types";
import { isListeningSpeaker } from "@/lib/listening/speaker-voices";

export interface GenerateQuestionsOptions {
  mode: ListeningGenerationMode;
  count: number;
  selectedTypeIds?: number[];
  difficultyMode?: ListeningDifficultyMode;
}

export interface GenerateQuestionsResult {
  questions: Array<
    GeneratedListeningQuestion & {
      needs_review: boolean;
      quality_issues: Array<{ code: string; message: string }>;
      quality_score?: number;
    }
  >;
}

function normalizeSegment(raw: { speaker?: string; text?: string }): ListeningScriptSegment | null {
  const speaker = (raw.speaker ?? "").trim().toUpperCase();
  const text = sanitizeSegmentTextForTts(raw.text ?? "");
  if (!isListeningSpeaker(speaker) || !text) return null;
  return { speaker, text };
}

function normalizeChoices(raw: unknown, examMode: boolean): string[] | null {
  const choicesRaw = Array.isArray(raw) ? raw : [];
  const choices = choicesRaw
    .map((c) => {
      if (typeof c === "object" && c !== null && "label" in c) {
        const o = c as { label?: string; value?: string };
        return String(o.label ?? o.value ?? "").trim();
      }
      return String(c).trim();
    })
    .filter(Boolean);
  if (examMode) {
    if (choices.length !== 5) return null;
    return choices;
  }
  if (choices.length < 4 || choices.length > 5) return null;
  return choices;
}

function normalizeQuestion(
  raw: Record<string, unknown>,
  index: number,
  examMode: boolean,
  typeHint?: ExamTypeTemplate
): GeneratedListeningQuestion | null {
  const segmentsRaw = Array.isArray(raw.segments) ? raw.segments : [];
  const segments = segmentsRaw
    .map((s) => normalizeSegment(s as { speaker?: string; text?: string }))
    .filter((s): s is ListeningScriptSegment => s !== null);

  if (segments.length === 0) return null;

  const choices = normalizeChoices(raw.choices, examMode);
  if (!choices) return null;

  const correct = Number(raw.correct_answer);
  if (!Number.isInteger(correct) || correct < 1 || correct > 5) return null;

  const script_text =
    typeof raw.script_text === "string" && raw.script_text.trim()
      ? raw.script_text.trim()
      : buildScriptText(segments);

  const instruction =
    typeof raw.instruction === "string" && raw.instruction.trim()
      ? raw.instruction.trim()
      : typeHint?.instruction ?? "";

  const question_type =
    typeof raw.question_type === "string" && raw.question_type.trim()
      ? raw.question_type.trim()
      : typeHint?.question_type ?? "듣기";

  const order_index =
    typeof raw.order_index === "number" && raw.order_index > 0
      ? raw.order_index
      : typeHint?.id ?? index + 1;

  const base: GeneratedListeningQuestion = {
    order_index,
    question_type,
    instruction,
    segments,
    script_text,
    script_translation: String(raw.script_translation ?? "").trim(),
    question_text: String(raw.question_text ?? "").trim(),
    choices,
    correct_answer: correct,
    answer_clue: String(raw.answer_clue ?? "").trim(),
    explanation: String(raw.explanation ?? "").trim(),
    needs_review: false,
    quality_issues: [],
    table_data: normalizeTableData(raw.table_data),
    previous_turn: String(raw.previous_turn ?? "").trim(),
    correct_response_function: String(raw.correct_response_function ?? "").trim(),
    distractor_reason: Array.isArray(raw.distractor_reason)
      ? (raw.distractor_reason as unknown[]).map((x) => String(x))
      : [],
    needs_image_choices: Boolean(raw.needs_image_choices),
    visual_choice_type: String(raw.visual_choice_type ?? "").trim(),
    choice_image_prompts: Array.isArray(raw.choice_image_prompts)
      ? (raw.choice_image_prompts as unknown[]).map((x) => String(x))
      : [],
    selected_conditions:
      raw.selected_conditions && typeof raw.selected_conditions === "object"
        ? (raw.selected_conditions as GeneratedListeningQuestion["selected_conditions"])
        : undefined,
    weather_target_location: String(raw.weather_target_location ?? "").trim(),
    weather_target_time: String(raw.weather_target_time ?? "").trim(),
    weather_answer: String(raw.weather_answer ?? "").trim(),
    mentioned_weather_by_time: Array.isArray(raw.mentioned_weather_by_time)
      ? (raw.mentioned_weather_by_time as GeneratedListeningQuestion["mentioned_weather_by_time"])
      : [],
    quality_check_focus: Array.isArray(raw.quality_check_focus)
      ? (raw.quality_check_focus as unknown[]).map((x) => String(x))
      : [],
    last_speaker:
      raw.last_speaker === "M" || raw.last_speaker === "W"
        ? raw.last_speaker
        : undefined,
    final_utterance: String(raw.final_utterance ?? "").trim(),
    target_intention: String(raw.target_intention ?? "").trim(),
    intention_candidates: Array.isArray(raw.intention_candidates)
      ? (raw.intention_candidates as unknown[]).map((x) => String(x))
      : [],
    mention_plan: normalizeMentionPlan(raw.mention_plan),
    time_question_target: String(raw.time_question_target ?? "").trim(),
    final_time: String(raw.final_time ?? "").trim(),
    mentioned_times: normalizeMentionedTimes(raw.mentioned_times),
    target_person: String(raw.target_person ?? "").trim(),
    dream_job: String(raw.dream_job ?? "").trim(),
    interest_clues: normalizeInterestClues(raw.interest_clues),
    target_emotion: String(raw.target_emotion ?? "").trim(),
    emotion_clues: normalizeEmotionClues(raw.emotion_clues),
  };

  const typeId = typeHint?.id ?? order_index;
  return applyQuestionFixes(base, typeId);
}

async function fetchParsedQuestions(
  apiKey: string,
  prompt: string,
  examMode: boolean,
  examTypes?: ExamTypeTemplate[]
): Promise<GeneratedListeningQuestion[]> {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "gpt-4o-mini",
      temperature: 0.6,
      response_format: { type: "json_object" },
      messages: [
        { role: "system", content: LISTENING_SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    }),
  });

  if (!response.ok) {
    const bodyText = await response.text();
    throw new Error(`OpenAI 문항 생성 실패 (HTTP ${response.status}): ${bodyText.slice(0, 300)}`);
  }

  const data = (await response.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error("AI 응답이 비어 있습니다.");

  const parsed = JSON.parse(content) as { questions?: unknown[] };
  const list = Array.isArray(parsed.questions) ? parsed.questions : [];

  const questions: GeneratedListeningQuestion[] = [];
  list.forEach((item, i) => {
    const hint = examTypes?.[i];
    const q = normalizeQuestion(item as Record<string, unknown>, i, examMode, hint);
    if (q && q.instruction) questions.push(q);
  });

  if (questions.length === 0) {
    throw new Error("생성된 문항을 파싱하지 못했습니다.");
  }

  return questions;
}

export async function generateListeningQuestionsWithAi(
  apiKey: string,
  options: GenerateQuestionsOptions
): Promise<GenerateQuestionsResult> {
  const { mode, count, selectedTypeIds, difficultyMode = "auto" } = options;
  const examMode = mode === "exam";
  const examTypes = examMode
    ? resolveExamTypesForGeneration(count, selectedTypeIds)
    : undefined;
  const itemCount = examMode ? examTypes!.length : count;

  const prompt = examMode
    ? buildListeningExamPrompt(examTypes!, difficultyMode)
    : buildListeningFreePrompt(itemCount);

  const questions = await fetchParsedQuestions(apiKey, prompt, examMode, examTypes);
  const withQuality = await attachValidationToQuestions(apiKey, questions, examTypes);
  return { questions: withQuality };
}

/** 단일 유형 1문항 생성 (검수 포함) */
export async function generateSingleExamQuestion(
  apiKey: string,
  typeId: number,
  difficultyMode: ListeningDifficultyMode = "auto",
  previousProblems?: string[]
) {
  const type = resolveExamTypesForGeneration(1, [typeId])[0];
  if (!type) throw new Error("유형을 찾을 수 없습니다.");

  const prompt = buildListeningSingleTypePrompt(type, difficultyMode, previousProblems);
  const questions = await fetchParsedQuestions(apiKey, prompt, true, [type]);
  const q = questions[0];
  if (!q) throw new Error("문항 생성 실패");

  return attachValidationToQuestion(apiKey, { ...q, order_index: typeId }, type);
}

/** 자유 모드 1문항 */
export async function generateSingleFreeQuestion(
  apiKey: string,
  orderIndex: number,
  previousProblems?: string[]
) {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n피할 문제:\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";
  const prompt = `${buildListeningFreePrompt(1)}${avoid}\norder_index는 ${orderIndex}로 설정.`;
  const questions = await fetchParsedQuestions(apiKey, prompt, false);
  const q = questions[0];
  if (!q) throw new Error("문항 생성 실패");
  return attachValidationToQuestion(apiKey, { ...q, order_index: orderIndex });
}
