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
import { normalizePriceCalculation } from "@/lib/listening/price-check";
import { buildScriptText } from "@/lib/listening/script-text";
import { sanitizeSegmentTextForTts } from "@/lib/listening/sanitize-segment-text";
import type { ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import {
  examTypeCode,
  resolveExamTypesForGeneration,
  templateForSlot,
  type ExamTypeTemplate,
} from "@/lib/listening/exam-types";
import type { ListeningTypeKey } from "@/lib/listening/type-catalog";
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
import { generatorModelsForTypeKey } from "@/lib/listening/model-tier";
import { listeningMaxCompletionTokensForCount } from "@/lib/listening/openai-listening-model";
import {
  applyBalancedChoicePositions,
  applyRandomChoicePosition,
} from "@/lib/listening/balance-correct-answer";
import {
  blindSolveQuestion,
  blindSolveRetryNote,
  emotionAmbiguityCheck,
} from "@/lib/listening/blind-solve";
import { finalizeListeningQuestionFast } from "@/lib/listening/finalize-listening-question";
import {
  formatAnswerVarietyBlock,
  pickAnswerVariety,
} from "@/lib/listening/answer-variety-pool";
import {
  formatSlotPlanBlock,
  planSlotAssignments,
  type SlotPlan,
} from "@/lib/listening/slot-plan";
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
  scriptTooShortReason,
} from "@/lib/listening/parse-listening-response";
export interface GenerateQuestionsOptions {
  mode: ListeningGenerationMode;
  count: number;
  selectedTypeIds?: number[];
  difficultyMode?: ListeningDifficultyMode;
  gradeLevel?: ListeningGradeLevel;
  /** 같은 과정(학원·학년)에서 유형별로 이미 쓴 정답 — 다양화 풀이 덜 쓴 정답부터 고른다 */
  usedAnswersByType?: Record<number, string[]>;
  /** 같은 과정에서 이번이 몇 번째 회차인지 (0부터) — 상황·이름·첫 대사를 회차마다 돌려 쓴다 */
  rotation?: number;
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
  // 한 줄짜리처럼 잘린 대본은 저장하지 않고 다시 만들게 한다 (유형 번호 = 모듈 번호)
  const shapeTypeId =
    (typeHint ? examTypeCode(typeHint) : undefined) ??
    inferExamTypeIdForFixes(
      {
        order_index: typeof raw.order_index === "number" ? raw.order_index : index + 1,
        instruction: String(raw.instruction ?? ""),
        question_type: String(raw.question_type ?? ""),
      },
      gradeLevel
    );
  if (
    scriptTooShortReason(segments, shapeTypeId, gradeLevel, String(raw.instruction ?? ""))
  ) {
    return null;
  }

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

  // 고정 유형 슬롯이면 템플릿의 한글 라벨을 강제한다
  // (모델이 short_response 등 영어 키를 뱉어도 한글로 통일).
  const question_type =
    typeHint?.question_type?.trim() ||
    (typeof raw.question_type === "string" && raw.question_type.trim()
      ? raw.question_type.trim()
      : "듣기");

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
    price_calculation: normalizePriceCalculation(raw.price_calculation),
  };

  const typeId = typeHint ? examTypeCode(typeHint) : inferExamTypeIdForFixes(base, gradeLevel);
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
): {
  questions: GeneratedListeningQuestion[];
  /** questions[k]가 모델 응답의 몇 번째 항목이었는지 (실패한 항목만 다시 만들 때 슬롯을 맞춘다) */
  sourceIndexes: number[];
  failures: string[];
} {
  const list = extractQuestionsFromAiPayload(parsed);
  const questions: GeneratedListeningQuestion[] = [];
  const sourceIndexes: number[] = [];
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
          `${i + 1}번째: instruction 없음 (${diagnoseQuestionParseFailure(raw, examMode, { typeId: hint ? examTypeCode(hint) : undefined, gradeLevel }).join(", ")})`
        );
        return;
      }
      questions.push({ ...q, instruction });
      sourceIndexes.push(i);
      return;
    }
    failures.push(
      `${i + 1}번째: ${diagnoseQuestionParseFailure(raw, examMode, { typeId: hint ? examTypeCode(hint) : undefined, gradeLevel }).join(", ")}`
    );
  });

  if (list.length === 0) {
    failures.push('AI 응답에 "questions" 배열이 없습니다.');
  }

  return { questions, sourceIndexes, failures };
}

async function fetchParsedQuestions(
  apiKey: string,
  prompt: string,
  examMode: boolean,
  examTypes?: ExamTypeTemplate[],
  gradeLevel: ListeningGradeLevel = "middle1",
  questionCount = 1,
  temperature = 0.5,
  models?: string[]
): Promise<GeneratedListeningQuestion[]> {
  const system = `${getListeningSystemPrompt(gradeLevel)}\nOutput JSON only. Use exact keys: questions, segments, choices, correct_answer. speakers: M, W, ANN only.`;

  let lastFailures: string[] = [];

  for (let attempt = 0; attempt < 2; attempt++) {
    const parsed = await listeningChatJson<unknown>(apiKey, {
      temperature,
      system,
      user: attempt === 0 ? prompt : `${prompt}${PARSE_RETRY_SUFFIX}`,
      maxCompletionTokens: listeningMaxCompletionTokensForCount(questionCount),
      ...(models?.length ? { models } : {}),
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
    rotation = -1,
  } = options;
  const examMode = mode === "exam";
  const baseTypes = examMode
    ? resolveExamTypesForGeneration(count, selectedTypeIds, gradeLevel)
    : undefined;
  const itemCount = examMode ? baseTypes!.length : count;

  // 정답·상황 다양화: 풀이 있는 유형은 정답과 소재를 미리 정해 준다 (변형·대체 유형도 여기서 정한다)
  const planSlots = examMode ? baseTypes!.map((t, i) => ({ typeId: t.id, slotIndex: i + 1 })) : [];
  const plans = planSlotAssignments(planSlots, gradeLevel, rotation);
  const examTypes = examMode
    ? planSlots.map((s, i) => {
        const plan = plans.get(s.slotIndex);
        return templateForSlot({ ...s, typeKey: plan?.typeKey }, gradeLevel, plan?.variantId) ?? baseTypes![i]!;
      })
    : undefined;
  const basePrompt = examMode
    ? buildListeningExamPrompt(examTypes!, difficultyMode, gradeLevel)
    : buildListeningFreePrompt(itemCount, gradeLevel);
  const varietyBlocks = examMode
    ? [
        ...examTypes!.map((t) => {
          const code = examTypeCode(t);
          const pick = pickAnswerVariety(code, gradeLevel, options.usedAnswersByType?.[code] ?? [], [], t.variant, rotation);
          return pick ? formatAnswerVarietyBlock(pick, gradeLevel) : "";
        }),
        ...planSlots.map((s) => formatSlotPlanBlock(s, plans.get(s.slotIndex), gradeLevel)),
      ].filter(Boolean)
    : [];
  const prompt = varietyBlocks.length
    ? `${varietyBlocks.join("\n\n")}\n\n${basePrompt}`
    : basePrompt;

  const questions = await fetchParsedQuestions(
    apiKey,
    prompt,
    examMode,
    examTypes,
    gradeLevel,
    itemCount
  );
  // 선택지 섞기를 먼저 하고 규칙 검수를 해야 검수 결과(수 선택지 순서·해설 번호)가 저장본과 맞는다
  const numbered = questions.map((q, i) => ({ ...q, order_index: i + 1 }));
  const ordered = examMode ? applyBalancedChoicePositions(numbered) : numbered;
  return {
    questions: ordered.map((q, i) =>
      finalizeListeningQuestionFast(q, examTypes?.[i], gradeLevel)
    ),
  };
}

/**
 * 단일 유형 1문항 생성 (검수 포함).
 * typeId는 학년 배치표의 번호(유형 템플릿을 찾는 번호), variety.typeKey가 있으면 그 유형으로 만든다
 * (지금 배치표에 없는 유형 — 예전 배치로 만든 문항을 다시 만들 때).
 */
export async function generateSingleExamQuestion(
  apiKey: string,
  typeId: number,
  difficultyMode: ListeningDifficultyMode = "auto",
  previousProblems?: string[],
  gradeLevel: ListeningGradeLevel = "middle1",
  slotIndex?: number,
  type1Regeneration?: Type1RegenerationContext,
  variety?: { usedAnswers?: string[]; plan?: SlotPlan; typeKey?: ListeningTypeKey; variant?: string; rotation?: number }
) {
  // 소재 영역·정답 자리·변형 (세트 생성에서 넘겨받거나, 단독 생성이면 여기서 정한다)
  const planSlot = {
    typeId,
    slotIndex: slotIndex ?? typeId,
    typeKey: variety?.typeKey,
    variant: variety?.variant,
  };
  const plan =
    variety?.plan ??
    planSlotAssignments([planSlot], gradeLevel, variety?.rotation ?? -1).get(planSlot.slotIndex);
  const type =
    variety?.typeKey || plan?.typeKey || plan?.variantId || variety?.variant
      ? templateForSlot(
          { ...planSlot, typeKey: plan?.typeKey ?? variety?.typeKey },
          gradeLevel,
          plan?.variantId ?? variety?.variant
        )
      : resolveExamTypesForGeneration(1, [typeId], gradeLevel)[0];
  if (!type) throw new Error("유형을 찾을 수 없습니다.");
  // 유형별 규칙은 모듈 번호로 (중2·중3은 배치표 번호와 다르다)
  const code = examTypeCode(type);
  // 같은 과정에서 덜 쓴 정답·새 소재를 미리 정한다 (재시도해도 같은 배정 유지)
  const varietyPick = pickAnswerVariety(code, gradeLevel, variety?.usedAnswers ?? [], [], type.variant, plan?.rotation ?? -1);
  const planBlock = formatSlotPlanBlock(planSlot, plan, gradeLevel);
  const varietyBlock = [
    varietyPick ? formatAnswerVarietyBlock(varietyPick, gradeLevel, slotIndex) : "",
    planBlock,
  ]
    .filter(Boolean)
    .map((b) => `${b}\n\n`)
    .join("");

  let problems = [...(previousProblems ?? [])];
  let lastQuestion: GeneratedListeningQuestion | null = null;
  const isRegeneration = Boolean(
    type1Regeneration?.previousAnswer ||
      type1Regeneration?.previousScript ||
      (type1Regeneration?.excludeSubjectIds?.length ?? 0) > 0
  );

  for (let attempt = 0; attempt < 3; attempt++) {
    let prompt = `${varietyBlock}${buildListeningSingleTypePrompt(
      type,
      difficultyMode,
      problems.length ? problems : undefined,
      gradeLevel
    )}`;
    let type1Assignment: Type1SubjectAssignment | null = null;
    if (code === 1 && !isHighSchoolListeningGrade(gradeLevel)) {
      type1Assignment = pickType1Subject(
        problems,
        type1Regeneration?.excludeSubjectIds ?? [],
        // ‘these’ 변형이면 여러 개로 쓰는 물건에서 고른다(What are these?)
        { plural: type.variant === "these" }
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
      (code === 19 || code === 20) &&
      !isHighSchoolListeningGrade(gradeLevel)
    ) {
      const assignment = pickContinuationScenario(code, problems);
      const scenarioBlock = formatAssignedScenarioBlock(assignment, {
        upperMiddle: gradeLevel === "middle2" || gradeLevel === "middle3",
      });
      prompt = `${scenarioBlock}\n\n${prompt}`;
    }
    const questions = await fetchParsedQuestions(
      apiKey,
      prompt,
      true,
      [type],
      gradeLevel,
      1,
      isRegeneration ? 0.75 : 0.5,
      // 유형 등급에 맞는 모델 (쉬운 중등 유형은 싼 모델)
      generatorModelsForTypeKey(type.key)
    );
    const q = questions[0];
    if (!q) throw new Error("문항 생성 실패");
    lastQuestion = q;

    // 해설·단서가 비면 선생님 화면에 빈칸으로 남는다(한 문항만 다시 만들 때 두 번 있었다) → 다시 만든다
    if (String(q.explanation ?? "").trim().length < 10 || !String(q.answer_clue ?? "").trim()) {
      problems = [
        ...problems,
        "explanation_missing|해설(explanation)과 정답 단서(answer_clue)를 반드시 채울 것",
      ].slice(0, 12);
      continue;
    }

    if (code === 1 && type1Assignment) {
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

    if (code === 17 && !isHighSchoolListeningGrade(gradeLevel)) {
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

    /*
     * 마지막 관문: 정답을 가리고 직접 풀어 본다.
     * 규칙 검사만으로는 "다섯 항목이 다 대본에 나와 정답이 없는 문항", "지시문은 숙소를 묻는데
     * 대본은 요리 수업을 예약하는 문항" 같은 것이 그대로 지나갔다(2026-09-17 실측: 120문항 중 3개).
     * 여기서 걸리면 무엇이 어긋났는지 적어 다시 만들게 한다 — 검토 표시로 넘기지 않는다.
     */
    const placed = applyRandomChoicePosition({ ...q, order_index: slotIndex ?? typeId });
    const blind = await blindSolveQuestion(apiKey, placed);
    let gateNote = blindSolveRetryNote(blind, placed.correct_answer);
    if (!gateNote) {
      const emotion = await emotionAmbiguityCheck(apiKey, placed);
      if (
        !emotion.skipped &&
        emotion.defensible.length > 1 &&
        emotion.defensible.includes(placed.correct_answer)
      ) {
        gateNote = `emotion_tie|정답 말고 ${emotion.defensible
          .filter((n) => n !== placed.correct_answer)
          .join("·")}번 감정도 대본 근거가 대등하다. 대화 끝의 심정이 하나로만 읽히도록 다시 써라.`;
      }
    }
    if (gateNote && attempt < 2) {
      problems = [...problems, gateNote].slice(0, 12);
      lastQuestion = q;
      continue;
    }

    const finalized = finalizeListeningQuestionFast(placed, type, gradeLevel);
    if (!gateNote) return finalized;
    // 세 번을 고쳐도 걸리면 그때는 사람이 보도록 세워 둔다(그냥 내보내지 않는다)
    return {
      ...finalized,
      needs_review: true,
      problems: [gateNote.split("|").slice(1).join("|"), ...(finalized.problems ?? [])],
    };
  }

  if (!lastQuestion) throw new Error("문항 생성 실패");

  if (code === 17 && !isHighSchoolListeningGrade(gradeLevel)) {
    throw new Error(
      `${slotIndex ?? typeId}번 문항이 그림 대화 형식으로 생성되었습니다. 다시 생성해 주세요.`
    );
  }

  return finalizeListeningQuestionFast(
    applyRandomChoicePosition({ ...lastQuestion, order_index: slotIndex ?? typeId }),
    type,
    gradeLevel
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
  return finalizeListeningQuestionFast(
    applyRandomChoicePosition({ ...q, order_index: orderIndex }),
    undefined,
    gradeLevel
  );
}
