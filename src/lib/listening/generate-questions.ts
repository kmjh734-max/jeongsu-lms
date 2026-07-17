import { applyQuestionFixes } from "@/lib/listening/apply-question-fixes";
import { inferExamTypeIdForFixes } from "@/lib/listening/infer-exam-type-id";
import { normalizeMentionPlan } from "@/lib/listening/type5-mention-plan";
import { normalizeMentionedTimes } from "@/lib/listening/type6-time-choices";
import { normalizeInterestClues } from "@/lib/listening/type7-career-choices";
import { normalizeEmotionClues } from "@/lib/listening/type8-emotion-choices";
import { normalizeMentionedActions } from "@/lib/listening/type9-action-choices";
import {
  normalizeContentClues,
  normalizeTopicDistractorReasons,
} from "@/lib/listening/type10-content-choices";
import { normalizeMentionedTransportOptions } from "@/lib/listening/type11-transport-choices";
import { normalizeMentionedPossibleReasons } from "@/lib/listening/type12-reason-choices";
import {
  normalizeDistractorPlaces,
  normalizePlaceClues,
} from "@/lib/listening/type13-place-choices";
import { normalizeSourceFactsFromScript } from "@/lib/listening/type14-table-validation";
import {
  detectType17Contamination,
  normalizeMentionedOtherActions,
} from "@/lib/listening/type17-schedule-choices";
import {
  normalizeDistractorJobs,
  normalizeJobClues,
} from "@/lib/listening/type18-job-choices";
import {
  distractorReasonsToStrings,
  normalizeDistractorReasons,
} from "@/lib/listening/type19-response-choices";
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
import { getListeningSystemPrompt } from "@/lib/listening/prompts/commonPrompt";
import {
  isHighSchoolListeningGrade,
  type ListeningGradeLevel,
} from "@/lib/listening/grade-level";
import {
  formatAssignedScenarioBlock,
  pickContinuationScenario,
} from "@/lib/listening/continuation-scenario-pool";
import {
  formatAssignedType1SubjectBlock,
  formatType1RegenerationAvoidBlock,
  normalizeType1AnswerLabel,
  pickType1Subject,
  type Type1SubjectAssignment,
} from "@/lib/listening/type1-subject-pool";

export interface Type1RegenerationContext {
  excludeSubjectIds?: string[];
  previousAnswer?: string;
  previousScript?: string;
}
import { listeningChatJson } from "@/lib/listening/openai-listening-chat";
import { listeningMaxCompletionTokensForCount } from "@/lib/listening/openai-listening-model";
import {
  applyBalancedChoicePositions,
  applyRandomChoicePosition,
} from "@/lib/listening/balance-correct-answer";
import { finalizeListeningQuestionFast } from "@/lib/listening/finalize-listening-question";
import type {
  GeneratedListeningQuestion,
  ListeningGenerationMode,
  ListeningScriptSegment,
} from "@/lib/listening/types";
import {
  diagnoseQuestionParseFailure,
  extractQuestionsFromAiPayload,
  normalizeCorrectAnswerIndex,
  normalizeListeningSpeaker,
} from "@/lib/listening/parse-listening-response";
export interface GenerateQuestionsOptions {
  mode: ListeningGenerationMode;
  count: number;
  selectedTypeIds?: number[];
  difficultyMode?: ListeningDifficultyMode;
  gradeLevel?: ListeningGradeLevel;
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
  const speaker = normalizeListeningSpeaker(raw.speaker);
  const text = sanitizeSegmentTextForTts(raw.text ?? "");
  if (!speaker || !text) return null;
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
  typeHint?: ExamTypeTemplate,
  gradeLevel: ListeningGradeLevel = "middle1"
): GeneratedListeningQuestion | null {
  const segmentsRaw = Array.isArray(raw.segments) ? raw.segments : [];
  const segments = segmentsRaw
    .map((s) => normalizeSegment(s as { speaker?: string; text?: string }))
    .filter((s): s is ListeningScriptSegment => s !== null);

  if (segments.length === 0) return null;

  const choices = normalizeChoices(raw.choices, examMode);
  if (!choices) return null;

  const correct = normalizeCorrectAnswerIndex(raw.correct_answer);
  if (correct == null) return null;

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

  const distractorEntries = normalizeDistractorReasons(
    raw.distractor_reasons ?? raw.distractor_reason,
    choices
  );
  const distractor_reason =
    distractorEntries.length > 0
      ? distractorReasonsToStrings(distractorEntries, choices)
      : Array.isArray(raw.distractor_reason)
        ? (raw.distractor_reason as unknown[]).map((x) => String(x))
        : [];

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
    distractor_reason,
    blank_speaker: String(raw.blank_speaker ?? "").trim(),
    situation_type: String(raw.situation_type ?? "").trim(),
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
    immediate_action: String(raw.immediate_action ?? "").trim(),
    mentioned_actions: normalizeMentionedActions(raw.mentioned_actions),
    main_content: String(raw.main_content ?? "").trim(),
    content_clues: normalizeContentClues(raw.content_clues),
    topic_distractor_reasons: normalizeTopicDistractorReasons(
      raw.topic_distractor_reasons ?? raw.distractor_reasons
    ),
    destination: String(raw.destination ?? "").trim(),
    final_transport: String(raw.final_transport ?? "").trim(),
    mentioned_transport_options: normalizeMentionedTransportOptions(
      raw.mentioned_transport_options
    ),
    target_place: String(raw.target_place ?? "").trim(),
    reason_for_going: String(raw.reason_for_going ?? "").trim(),
    mentioned_possible_reasons: normalizeMentionedPossibleReasons(
      raw.mentioned_possible_reasons
    ),
    place_clues: normalizePlaceClues(raw.place_clues),
    distractor_places: normalizeDistractorPlaces(raw.distractor_places),
    source_facts_from_script: normalizeSourceFactsFromScript(
      raw.source_facts_from_script
    ),
    requester: String(raw.requester ?? "").trim(),
    requested_person: String(raw.requested_person ?? "").trim(),
    requested_action: String(raw.requested_action ?? "").trim(),
    request_expression: String(raw.request_expression ?? "").trim(),
    suggester: String(raw.suggester ?? "").trim(),
    suggested_to: String(raw.suggested_to ?? "").trim(),
    suggested_action: String(raw.suggested_action ?? "").trim(),
    suggestion_expression: String(raw.suggestion_expression ?? "").trim(),
    target_time: String(raw.target_time ?? "").trim(),
    planned_action: String(raw.planned_action ?? "").trim(),
    mentioned_other_actions: normalizeMentionedOtherActions(
      raw.mentioned_other_actions
    ),
    target_job: String(raw.target_job ?? "").trim(),
    job_clues: normalizeJobClues(raw.job_clues),
    distractor_jobs: normalizeDistractorJobs(raw.distractor_jobs),
  };

  const typeId =
    typeHint?.id ?? inferExamTypeIdForFixes(base, gradeLevel);
  return applyQuestionFixes(base, typeId, gradeLevel);
}

const PARSE_RETRY_SUFFIX = `

[필수 출력 형식]
- 최상위 키는 반드시 "questions" 배열 하나만 사용한다.
- segments[].speaker 는 "M", "W", "ANN" 중 하나만 (Man/Woman 금지).
- 대화 유형: M(남)과 W(여)가 반드시 모두 나오고, 매 발화마다 M↔W가 교대한다 (M,M 또는 W,W 연속 금지).
- choices 는 영어 문자열 정확히 5개.
- correct_answer 는 1~5 정수.
- instruction 은 한국어 지시문을 반드시 포함한다.`;

export function parseQuestionsFromPayload(
  parsed: unknown,
  examMode: boolean,
  examTypes?: ExamTypeTemplate[],
  gradeLevel: ListeningGradeLevel = "middle1"
): { questions: GeneratedListeningQuestion[]; failures: string[] } {
  const list = extractQuestionsFromAiPayload(parsed);
  const questions: GeneratedListeningQuestion[] = [];
  const failures: string[] = [];

  list.forEach((item, i) => {
    if (!item || typeof item !== "object") {
      failures.push(`${i + 1}번째 항목: 객체가 아님`);
      return;
    }
    const raw = item as Record<string, unknown>;
    const hint = examTypes?.[i];
    const q = normalizeQuestion(raw, i, examMode, hint, gradeLevel);
    if (q) {
      const instruction =
        q.instruction.trim() || hint?.instruction?.trim() || "";
      if (!instruction) {
        failures.push(
          `${i + 1}번째: instruction 없음 (${diagnoseQuestionParseFailure(raw, examMode).join(", ")})`
        );
        return;
      }
      questions.push({ ...q, instruction });
      return;
    }
    failures.push(
      `${i + 1}번째: ${diagnoseQuestionParseFailure(raw, examMode).join(", ")}`
    );
  });

  if (list.length === 0) {
    failures.push('AI 응답에 "questions" 배열이 없습니다.');
  }

  return { questions, failures };
}

async function fetchParsedQuestions(
  apiKey: string,
  prompt: string,
  examMode: boolean,
  examTypes?: ExamTypeTemplate[],
  gradeLevel: ListeningGradeLevel = "middle1",
  questionCount = 1,
  temperature = 0.5
): Promise<GeneratedListeningQuestion[]> {
  const system = `${getListeningSystemPrompt(gradeLevel)}\nOutput JSON only. Use exact keys: questions, segments, choices, correct_answer. speakers: M, W, ANN only.`;

  let lastFailures: string[] = [];

  for (let attempt = 0; attempt < 2; attempt++) {
    const parsed = await listeningChatJson<unknown>(apiKey, {
      temperature,
      system,
      user: attempt === 0 ? prompt : `${prompt}${PARSE_RETRY_SUFFIX}`,
      maxCompletionTokens: listeningMaxCompletionTokensForCount(questionCount),
    });

    const { questions, failures } = parseQuestionsFromPayload(
      parsed,
      examMode,
      examTypes,
      gradeLevel
    );
    if (questions.length > 0) return questions;
    lastFailures = failures;
  }

  const detail =
    lastFailures.length > 0 ? ` (${lastFailures.slice(0, 3).join("; ")})` : "";
  throw new Error(`생성된 문항을 파싱하지 못했습니다.${detail}`);
}

export async function generateListeningQuestionsWithAi(
  apiKey: string,
  options: GenerateQuestionsOptions
): Promise<GenerateQuestionsResult> {
  const {
    mode,
    count,
    selectedTypeIds,
    difficultyMode = "auto",
    gradeLevel = "middle1",
  } = options;
  const examMode = mode === "exam";
  const examTypes = examMode
    ? resolveExamTypesForGeneration(count, selectedTypeIds, gradeLevel)
    : undefined;
  const itemCount = examMode ? examTypes!.length : count;

  const prompt = examMode
    ? buildListeningExamPrompt(examTypes!, difficultyMode, gradeLevel)
    : buildListeningFreePrompt(itemCount, gradeLevel);

  const questions = await fetchParsedQuestions(
    apiKey,
    prompt,
    examMode,
    examTypes,
    gradeLevel,
    itemCount
  );
  const finalized = questions.map((q, i) =>
    finalizeListeningQuestionFast(
      { ...q, order_index: i + 1 },
      examTypes?.[i],
      gradeLevel
    )
  );
  return {
    questions: examMode
      ? applyBalancedChoicePositions(finalized)
      : finalized,
  };
}

/** 단일 유형 1문항 생성 (검수 포함) */
export async function generateSingleExamQuestion(
  apiKey: string,
  typeId: number,
  difficultyMode: ListeningDifficultyMode = "auto",
  previousProblems?: string[],
  gradeLevel: ListeningGradeLevel = "middle1",
  slotIndex?: number,
  type1Regeneration?: Type1RegenerationContext
) {
  const type = resolveExamTypesForGeneration(1, [typeId], gradeLevel)[0];
  if (!type) throw new Error("유형을 찾을 수 없습니다.");

  let problems = [...(previousProblems ?? [])];
  let lastQuestion: GeneratedListeningQuestion | null = null;
  const isRegeneration = Boolean(
    type1Regeneration?.previousAnswer ||
      type1Regeneration?.previousScript ||
      (type1Regeneration?.excludeSubjectIds?.length ?? 0) > 0
  );

  for (let attempt = 0; attempt < 3; attempt++) {
    let prompt = buildListeningSingleTypePrompt(
      type,
      difficultyMode,
      problems.length ? problems : undefined,
      gradeLevel
    );
    let type1Assignment: Type1SubjectAssignment | null = null;
    if (typeId === 1 && !isHighSchoolListeningGrade(gradeLevel)) {
      type1Assignment = pickType1Subject(
        problems,
        type1Regeneration?.excludeSubjectIds ?? []
      );
      const regenBlock =
        isRegeneration && type1Regeneration
          ? `${formatType1RegenerationAvoidBlock({
              previousSubjectId: type1Regeneration.excludeSubjectIds?.[0],
              previousAnswer: type1Regeneration.previousAnswer,
              previousScript: type1Regeneration.previousScript,
            })}\n\n`
          : "";
      prompt = `${regenBlock}${formatAssignedType1SubjectBlock(type1Assignment)}\n\n${prompt}`;
    }
    if (
      (typeId === 19 || typeId === 20) &&
      !isHighSchoolListeningGrade(gradeLevel)
    ) {
      const assignment = pickContinuationScenario(typeId, problems);
      const scenarioBlock = formatAssignedScenarioBlock(assignment);
      prompt = `${scenarioBlock}\n\n${prompt}`;
    }
    const questions = await fetchParsedQuestions(
      apiKey,
      prompt,
      true,
      [type],
      gradeLevel,
      1,
      isRegeneration ? 0.75 : 0.5
    );
    const q = questions[0];
    if (!q) throw new Error("문항 생성 실패");
    lastQuestion = q;

    if (typeId === 1 && type1Assignment) {
      const actualAnswer = q.choices[(q.correct_answer ?? 1) - 1] ?? "";
      const expected = normalizeType1AnswerLabel(type1Assignment.answer);
      const actual = normalizeType1AnswerLabel(actualAnswer);
      if (actual !== expected) {
        problems = [
          ...problems,
          `subject_id:${type1Assignment.id}|wrong_answer:${actualAnswer}|배정 정답 ${type1Assignment.answer} 불일치`,
        ].slice(0, 12);
        continue;
      }
      if (
        type1Regeneration?.previousAnswer &&
        actual === normalizeType1AnswerLabel(type1Regeneration.previousAnswer)
      ) {
        problems = [
          ...problems,
          `subject_id:repeat|answer:${actualAnswer}|이전과 동일 정답`,
        ].slice(0, 12);
        continue;
      }
    }

    if (typeId === 17) {
      const contamination = detectType17Contamination(
        q.segments,
        q.choices,
        q.question_text
      );
      if (contamination) {
        problems = [...problems, contamination].slice(0, 12);
        continue;
      }
    }

    return applyRandomChoicePosition(
      finalizeListeningQuestionFast(
        { ...q, order_index: slotIndex ?? typeId },
        type,
        gradeLevel
      )
    );
  }

  if (!lastQuestion) throw new Error("문항 생성 실패");

  if (typeId === 17) {
    throw new Error(
      "17번 문항이 그림 대화 형식으로 생성되었습니다. 다시 생성해 주세요."
    );
  }

  return applyRandomChoicePosition(
    finalizeListeningQuestionFast(
      { ...lastQuestion, order_index: slotIndex ?? typeId },
      type,
      gradeLevel
    )
  );
}

/** 자유 모드 1문항 */
export async function generateSingleFreeQuestion(
  apiKey: string,
  orderIndex: number,
  previousProblems?: string[],
  gradeLevel: ListeningGradeLevel = "middle1"
) {
  const avoid =
    previousProblems && previousProblems.length > 0
      ? `\n피할 문제:\n${previousProblems.map((p) => `- ${p}`).join("\n")}\n`
      : "";
  const prompt = `${buildListeningFreePrompt(1, gradeLevel)}${avoid}\norder_index는 ${orderIndex}로 설정.`;
  const questions = await fetchParsedQuestions(apiKey, prompt, false, undefined, gradeLevel);
  const q = questions[0];
  if (!q) throw new Error("문항 생성 실패");
  return applyRandomChoicePosition(
    finalizeListeningQuestionFast(
      { ...q, order_index: orderIndex },
      undefined,
      gradeLevel
    )
  );
}
