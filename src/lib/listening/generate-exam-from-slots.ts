import {
  buildDifficultyPromptBlock,
  type ListeningDifficultyMode,
} from "@/lib/listening/exam-difficulty";
import {
  examTypeCode,
  templateForSlot,
  type ExamTypeTemplate,
} from "@/lib/listening/exam-types";
import {
  formatAssignedScenarioBlock,
  pickContinuationScenario,
} from "@/lib/listening/continuation-scenario-pool";
import {
  formatAssignedType1SubjectBlock,
  pickType1Subject,
} from "@/lib/listening/type1-subject-pool";
import { applyBalancedChoicePositions } from "@/lib/listening/balance-correct-answer";
import {
  formatAnswerVarietyBlock,
  pickAnswerVariety,
} from "@/lib/listening/answer-variety-pool";
import { finalizeListeningQuestionFast } from "@/lib/listening/finalize-listening-question";
import {
  generateSingleExamQuestion,
  generateSingleFreeQuestion,
  parseQuestionsFromPayload,
} from "@/lib/listening/generate-questions";
import { buildListeningFreePrompt } from "@/lib/listening/prompts/buildListeningPrompt";
import type { ListeningGenerationSlot } from "@/lib/listening/generation-slots";
import {
  isHighSchoolListeningGrade,
  type ListeningGradeLevel,
} from "@/lib/listening/grade-level";
import { listeningMaxCompletionTokensForCount } from "@/lib/listening/openai-listening-model";
import {
  getCopyrightBlock,
  getJsonOutputSchema,
  getListeningSystemPrompt,
  LISTENING_OUTPUT_GUARD_BLOCK,
} from "@/lib/listening/prompts/commonPrompt";
import { getCommonPrompt } from "@/lib/listening/prompts/commonPrompt";
import { getAllMiddle2TypePromptBlocks } from "@/lib/listening/prompts/middle2TypePrompts";
import { getAllMiddle3TypePromptBlocks } from "@/lib/listening/prompts/middle3TypePrompts";
import { getAllHigh1TypePromptBlocks } from "@/lib/listening/prompts/high1TypePrompts";
import { getAllHigh2TypePromptBlocks } from "@/lib/listening/prompts/high2TypePrompts";
import { getAllHigh3TypePromptBlocks } from "@/lib/listening/prompts/high3TypePrompts";
import { getAllTypePromptBlocks } from "@/lib/listening/prompts/typePrompts";
import { listeningChatJson } from "@/lib/listening/openai-listening-chat";
import { buildQualityCraftBlock } from "@/lib/listening/prompts/quality-craft";
import {
  formatSlotPlanBlock,
  planSlotAssignments,
  type SlotPlan,
} from "@/lib/listening/slot-plan";
import { runWithConcurrency } from "@/lib/run-with-concurrency";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";
const SLOT_CHUNK_SIZE = 5;
const CHUNK_PARALLEL = 2;

/**
 * 슬롯 → 유형 템플릿 (배치표 번호 + 계획에서 고른 대체 유형·변형).
 * 번호(typeId)는 배치표 자리일 뿐이고, 유형별 규칙은 템플릿의 모듈 번호(code)로 고른다.
 */
function resolveSlotTemplate(
  slot: ListeningGenerationSlot,
  gradeLevel: ListeningGradeLevel,
  plan?: SlotPlan
): ExamTypeTemplate {
  const t = templateForSlot(
    { ...slot, typeKey: plan?.typeKey ?? slot.typeKey },
    gradeLevel,
    plan?.variantId ?? slot.variant
  );
  if (!t) throw new Error(`유형 ${slot.typeId}을 찾을 수 없습니다.`);
  return t;
}

function slotCode(
  slot: ListeningGenerationSlot,
  gradeLevel: ListeningGradeLevel,
  plans?: Map<number, SlotPlan>
): number {
  return examTypeCode(resolveSlotTemplate(slot, gradeLevel, plans?.get(slot.slotIndex)));
}

/** 고등 16·17은 동일 음원 — 16 대본을 17에 복사 */
function syncHighSchoolPairedScripts(
  questions: GeneratedListeningQuestion[],
  slots: ListeningGenerationSlot[],
  gradeLevel: ListeningGradeLevel
): GeneratedListeningQuestion[] {
  const typeBySlot = new Map(slots.map((s) => [s.slotIndex, slotCode(s, gradeLevel)]));
  const q16 = questions.find((q) => typeBySlot.get(q.order_index) === 16);
  if (!q16) return questions;
  return questions.map((q) => {
    if (typeBySlot.get(q.order_index) !== 17) return q;
    return {
      ...q,
      segments: q16.segments.map((s) => ({ ...s })),
      script_text: q16.script_text,
      script_translation: q16.script_translation,
    };
  });
}

function buildSlotsBatchPrompt(
  slots: ListeningGenerationSlot[],
  difficultyMode: ListeningDifficultyMode,
  gradeLevel: ListeningGradeLevel,
  types: ExamTypeTemplate[],
  usedAnswersByType?: Record<number, string[]>,
  plans?: Map<number, SlotPlan>
): string {
  // 유형 번호 = 모듈 번호 (중2·중3은 문항 번호와 다르다)
  const codes = types.map((t) => examTypeCode(t));
  const uniqueTypeIds = [...new Set(codes)];
  const difficultyBlock = buildDifficultyPromptBlock(
    types,
    difficultyMode,
    gradeLevel
  );
  const typeBlocks =
    gradeLevel === "high3"
      ? getAllHigh3TypePromptBlocks(uniqueTypeIds)
      : gradeLevel === "high2"
        ? getAllHigh2TypePromptBlocks(uniqueTypeIds)
        : gradeLevel === "high1"
          ? getAllHigh1TypePromptBlocks(uniqueTypeIds)
          : gradeLevel === "middle3"
            ? getAllMiddle3TypePromptBlocks(uniqueTypeIds)
            : gradeLevel === "middle2"
              ? getAllMiddle2TypePromptBlocks(uniqueTypeIds)
              : getAllTypePromptBlocks(uniqueTypeIds);

  const slotSpec = slots
    .map(
      (s, i) =>
        `${i + 1}번째 문항: order_index=${s.slotIndex}, 유형 ${codes[i]} (${types[i]!.question_type})${
          codes[i] !== s.typeId || gradeLevel === "middle2" || gradeLevel === "middle3"
            ? ` — 지시문 틀: ${types[i]!.instruction}`
            : ""
        }`
    )
    .join("\n");

  let scenarioBlocks = "";
  if (!isHighSchoolListeningGrade(gradeLevel)) {
    const usedType1Problems: string[] = [];
    const usedContinuation: string[] = [];
    slots.forEach((_, i) => {
      const code = codes[i]!;
      if (code === 1) {
        const assignment = pickType1Subject(usedType1Problems);
        usedType1Problems.push(`subject_id:${assignment.id}`);
        scenarioBlocks += `${formatAssignedType1SubjectBlock(assignment)}\n\n`;
      }
      if (code === 19 || code === 20) {
        // 중2·중3은 같은 방향 응답이 두세 문항이라(중3 18·19) 한 묶음 안에서 같은 상황이 두 번 뽑히지 않게 한다
        const upperMiddle = gradeLevel === "middle2" || gradeLevel === "middle3";
        const scenario = pickContinuationScenario(code, upperMiddle ? usedContinuation : undefined);
        if (upperMiddle) usedContinuation.push(`scenario_id:${scenario.id}`);
        scenarioBlocks += `${formatAssignedScenarioBlock(scenario, { upperMiddle })}\n\n`;
      }
    });
  }
  // 정답·상황 다양화 풀: 같은 과정에서 덜 쓴 정답부터 배정 (이번 묶음 안에서도 겹치지 않게)
  const usedInBatch: Record<number, string[]> = {};
  const usedScenarios: string[] = [];
  slots.forEach((slot, i) => {
    const code = codes[i]!;
    const pick = pickAnswerVariety(
      code,
      gradeLevel,
      [...(usedAnswersByType?.[code] ?? []), ...(usedInBatch[code] ?? [])],
      usedScenarios,
      types[i]!.variant
    );
    if (!pick) return;
    (usedInBatch[code] ||= []).push(pick.answer);
    usedScenarios.push(pick.scenario);
    scenarioBlocks += `${formatAnswerVarietyBlock(pick, gradeLevel, slot.slotIndex)}\n\n`;
  });
  // 세트 전체에서 겹치지 않게 미리 정한 소재 영역·정답 자리
  for (const slot of slots) {
    const block = formatSlotPlanBlock(slot, plans?.get(slot.slotIndex), gradeLevel);
    if (block) scenarioBlocks += `${block}\n\n`;
  }

  const pairNote =
    isHighSchoolListeningGrade(gradeLevel) &&
    uniqueTypeIds.includes(16) &&
    uniqueTypeIds.includes(17)
      ? "\n중요: 유형 16과 17은 동일한 segments·script_text를 써야 한다.\n"
      : "";

  return `
${getCommonPrompt(gradeLevel)}

${getCopyrightBlock(gradeLevel)}

${scenarioBlocks}이번 요청: questions 배열에 정확히 ${slots.length}개 문항을 생성한다 (한 번에 출력).
${pairNote}
[문항 번호 — order_index]
${slotSpec}
order_index는 반드시 위 문항 번호와 일치한다 (유형 ID와 다를 수 있음).

난이도:
${difficultyBlock}

${typeBlocks}

${buildQualityCraftBlock(uniqueTypeIds, gradeLevel)}

${LISTENING_OUTPUT_GUARD_BLOCK}

${getJsonOutputSchema(gradeLevel)}
`.trim();
}

/**
 * 묶음 1회 호출. 파싱된 문항은 슬롯 번호로 돌려주고, 실패한 슬롯은 따로 알려 준다.
 * (예전에는 5문항 중 1개만 실패해도 5개를 모두 버리고 1문항씩 다시 만들어 호출이 6배로 늘었다.)
 */
async function fetchSlotChunkQuestions(
  apiKey: string,
  slots: ListeningGenerationSlot[],
  difficultyMode: ListeningDifficultyMode,
  gradeLevel: ListeningGradeLevel,
  usedAnswersByType?: Record<number, string[]>,
  plans?: Map<number, SlotPlan>
): Promise<{ made: GeneratedListeningQuestion[]; failedSlots: ListeningGenerationSlot[] }> {
  const types = slots.map((s) => resolveSlotTemplate(s, gradeLevel, plans?.get(s.slotIndex)));

  const prompt = buildSlotsBatchPrompt(
    slots,
    difficultyMode,
    gradeLevel,
    types,
    usedAnswersByType,
    plans
  );
  const system = `${getListeningSystemPrompt(gradeLevel)}\nOutput JSON only. questions array length must be ${slots.length}. speakers: M, W, ANN only.`;

  const parsed = await listeningChatJson<unknown>(apiKey, {
    system,
    user: prompt,
    temperature: 0.5,
    maxCompletionTokens: listeningMaxCompletionTokensForCount(slots.length),
  });

  const { questions, sourceIndexes, failures } = parseQuestionsFromPayload(
    parsed,
    true,
    types,
    gradeLevel
  );
  if (failures.length > 0) {
    console.error(`[listening] 묶음 파싱 실패 ${failures.length}건`, failures.slice(0, 2).join("; "));
  }

  const made: GeneratedListeningQuestion[] = [];
  const done = new Set<number>();
  questions.forEach((q, k) => {
    const i = sourceIndexes[k]!;
    const slot = slots[i];
    if (!slot || done.has(i)) return;
    done.add(i);
    made.push(
      finalizeListeningQuestionFast({ ...q, order_index: slot.slotIndex }, types[i], gradeLevel)
    );
  });
  return { made, failedSlots: slots.filter((_, i) => !done.has(i)) };
}

async function generateSlotChunk(
  apiKey: string,
  slots: ListeningGenerationSlot[],
  difficultyMode: ListeningDifficultyMode,
  gradeLevel: ListeningGradeLevel,
  prior: GeneratedListeningQuestion[],
  usedAnswersByType?: Record<number, string[]>,
  plans?: Map<number, SlotPlan>
): Promise<GeneratedListeningQuestion[]> {
  let made: GeneratedListeningQuestion[] = [];
  let failedSlots = slots;
  try {
    ({ made, failedSlots } = await fetchSlotChunkQuestions(
      apiKey,
      slots,
      difficultyMode,
      gradeLevel,
      usedAnswersByType,
      plans
    ));
  } catch (e) {
    console.error("[listening] 묶음 생성 실패", e instanceof Error ? e.message : e);
  }
  if (failedSlots.length === 0) return made;

  // 고등 16·17은 같은 담화라 둘 중 하나만 따로 만들면 대본과 선택지가 어긋난다 → 둘을 한 번에 다시 만든다
  let retrySlots = failedSlots;
  const codeOf = (s: ListeningGenerationSlot) => slotCode(s, gradeLevel, plans);
  if (isHighSchoolListeningGrade(gradeLevel)) {
    const pair = slots.filter((s) => codeOf(s) === 16 || codeOf(s) === 17);
    if (pair.length === 2 && failedSlots.some((s) => codeOf(s) === 16 || codeOf(s) === 17)) {
      made = made.filter((q) => !pair.some((p) => p.slotIndex === q.order_index));
      try {
        const again = await fetchSlotChunkQuestions(apiKey, pair, difficultyMode, gradeLevel, usedAnswersByType, plans);
        if (again.failedSlots.length === 0) made.push(...again.made);
        retrySlots = [
          ...failedSlots.filter((s) => codeOf(s) !== 16 && codeOf(s) !== 17),
          ...(again.failedSlots.length === 0 ? [] : pair),
        ];
      } catch {
        retrySlots = [...failedSlots.filter((s) => codeOf(s) !== 16 && codeOf(s) !== 17), ...pair];
      }
    }
  }

  {
    const out: GeneratedListeningQuestion[] = [...made];
    for (let i = 0; i < retrySlots.length; i++) {
      const slot = retrySlots[i]!;
      const code = codeOf(slot);
      const prevProblems =
        code === 19 || code === 20
          ? [
              ...prior,
              ...out,
            ].flatMap((q) => q.problems ?? [])
          : out[out.length - 1]?.problems;

      // 한 문항이 실패해도 앞뒤에서 만든 문항은 버리지 않는다(빠진 문항만 따로 다시 만든다)
      try {
        const q = await generateSingleExamQuestion(
          apiKey,
          slot.typeId,
          difficultyMode,
          prevProblems?.length ? prevProblems : undefined,
          gradeLevel,
          slot.slotIndex,
          undefined,
          {
            usedAnswers: [
              ...(usedAnswersByType?.[code] ?? []),
              ...out
                .filter((o) => {
                  const other = slots.find((s) => s.slotIndex === o.order_index);
                  return other != null && codeOf(other) === code;
                })
                .map((o) => o.choices[o.correct_answer - 1] ?? ""),
            ],
            plan: plans?.get(slot.slotIndex),
            typeKey: slot.typeKey,
            variant: slot.variant,
          }
        );
        // 규칙 검수의 검토 표시(needs_review)는 지우지 않는다
        out.push({ ...q, order_index: slot.slotIndex });
      } catch (e) {
        console.error(
          `[listening] ${slot.slotIndex}번 문항 생성 실패`,
          e instanceof Error ? e.message : e
        );
      }
    }
    return out;
  }
}

function chunkSlots(slots: ListeningGenerationSlot[]): ListeningGenerationSlot[][] {
  const chunks: ListeningGenerationSlot[][] = [];
  for (let i = 0; i < slots.length; i += SLOT_CHUNK_SIZE) {
    chunks.push(slots.slice(i, i + SLOT_CHUNK_SIZE));
  }
  return chunks;
}

/** 만든 문항과 만들지 못한 슬롯 번호. 만든 문항은 슬롯 순서대로, order_index = slotIndex. */
export type SlotGenerationResult = {
  questions: GeneratedListeningQuestion[];
  missingSlotIndexes: number[];
};

function throwIfMissing(result: SlotGenerationResult): GeneratedListeningQuestion[] {
  if (result.missingSlotIndexes.length > 0) {
    throw new Error(`${result.missingSlotIndexes[0]}번 문항 생성 실패`);
  }
  return result.questions;
}

/** 슬롯 목록을 최소 API 호출로 생성 (5문항 단위 일괄, 청크는 2개까지 병렬). 하나라도 빠지면 던진다. */
export async function generateExamQuestionsFromSlots(
  apiKey: string,
  slots: ListeningGenerationSlot[],
  difficultyMode: ListeningDifficultyMode = "auto",
  gradeLevel: ListeningGradeLevel = "middle1",
  opts?: SlotGenerationOptions
): Promise<GeneratedListeningQuestion[]> {
  return throwIfMissing(
    await generateExamQuestionsFromSlotsSettled(apiKey, slots, difficultyMode, gradeLevel, opts)
  );
}

export type SlotGenerationOptions = {
  /** 같은 과정(학원·학년)에서 유형 모듈 번호별로 이미 쓴 정답 — 다양화 풀이 덜 쓴 정답부터 고른다 */
  usedAnswersByType?: Record<number, string[]>;
};

/**
 * 선택지를 섞은 뒤 규칙 검수를 다시 돌린다 (검수는 무료 규칙만).
 * 섞기 전에 매긴 점수·검토 표시는 선택지 순서·해설 번호가 달라 저장본과 맞지 않는다.
 */
function refreshRuleChecks(
  questions: GeneratedListeningQuestion[],
  slots: ListeningGenerationSlot[],
  gradeLevel: ListeningGradeLevel,
  plans?: Map<number, SlotPlan>
): GeneratedListeningQuestion[] {
  return questions.map((q) => {
    const slot = slots.find((s) => s.slotIndex === q.order_index);
    const type = slot ? resolveSlotTemplate(slot, gradeLevel, plans?.get(slot.slotIndex)) : undefined;
    return finalizeListeningQuestionFast(q, type, gradeLevel);
  });
}

/**
 * generateExamQuestionsFromSlots와 같지만 일부 슬롯이 실패해도 만든 문항은 돌려준다.
 * (예전에는 한 문항이 실패하면 나머지 문항까지 모두 버려, 값만 들고 처음부터 다시 만들어야 했다.)
 */
export async function generateExamQuestionsFromSlotsSettled(
  apiKey: string,
  slots: ListeningGenerationSlot[],
  difficultyMode: ListeningDifficultyMode = "auto",
  gradeLevel: ListeningGradeLevel = "middle1",
  opts?: SlotGenerationOptions
): Promise<SlotGenerationResult> {
  if (slots.length === 0) return { questions: [], missingSlotIndexes: [] };

  if (slots.length === 1) {
    const slot = slots[0]!;
    try {
      const plan = planSlotAssignments([slot], gradeLevel).get(slot.slotIndex);
      const q = await generateSingleExamQuestion(
        apiKey,
        slot.typeId,
        difficultyMode,
        undefined,
        gradeLevel,
        slot.slotIndex,
        undefined,
        {
          usedAnswers: opts?.usedAnswersByType?.[slotCode(slot, gradeLevel, new Map([[slot.slotIndex, plan ?? {}]]))] ?? [],
          plan,
          typeKey: slot.typeKey,
          variant: slot.variant,
        }
      );
      return {
        questions: [{ ...q, order_index: slot.slotIndex }],
        missingSlotIndexes: [],
      };
    } catch (e) {
      console.error(
        `[listening] ${slot.slotIndex}번 문항 생성 실패`,
        e instanceof Error ? e.message : e
      );
      return { questions: [], missingSlotIndexes: [slot.slotIndex] };
    }
  }

  // 소재 영역·정답 자리는 청크를 나누기 전에 세트 전체로 정한다 (병렬 청크끼리 겹치지 않게)
  const plans = planSlotAssignments(slots, gradeLevel);
  const chunks = chunkSlots(slots);
  const chunkResults = await runWithConcurrency(
    chunks,
    CHUNK_PARALLEL,
    async (chunk) =>
      generateSlotChunk(
        apiKey,
        chunk,
        difficultyMode,
        gradeLevel,
        [],
        opts?.usedAnswersByType,
        plans
      )
  );

  const bySlotIndex = new Map<number, GeneratedListeningQuestion>();
  for (const list of chunkResults) {
    for (const q of list) {
      bySlotIndex.set(q.order_index, q);
    }
  }

  const ordered: GeneratedListeningQuestion[] = [];
  const missingSlotIndexes: number[] = [];
  for (const slot of slots) {
    const q = bySlotIndex.get(slot.slotIndex);
    if (q) ordered.push(q);
    else missingSlotIndexes.push(slot.slotIndex);
  }
  const synced = isHighSchoolListeningGrade(gradeLevel)
    ? syncHighSchoolPairedScripts(ordered, slots, gradeLevel)
    : ordered;
  return {
    questions: refreshRuleChecks(applyBalancedChoicePositions(synced), slots, gradeLevel, plans),
    missingSlotIndexes,
  };
}

/** 자유 모드: 문항 수만큼 1회 API 호출. 하나라도 빠지면 던진다. */
export async function generateFreeQuestionsFromSlots(
  apiKey: string,
  slots: ListeningGenerationSlot[],
  gradeLevel: ListeningGradeLevel = "middle1"
): Promise<GeneratedListeningQuestion[]> {
  return throwIfMissing(
    await generateFreeQuestionsFromSlotsSettled(apiKey, slots, gradeLevel)
  );
}

/** 자유 모드, 일부만 만들어져도 만든 문항은 돌려준다 */
export async function generateFreeQuestionsFromSlotsSettled(
  apiKey: string,
  slots: ListeningGenerationSlot[],
  gradeLevel: ListeningGradeLevel = "middle1"
): Promise<SlotGenerationResult> {
  if (slots.length === 0) return { questions: [], missingSlotIndexes: [] };
  if (slots.length === 1) {
    const slot = slots[0]!;
    try {
      const q = await generateSingleFreeQuestion(
        apiKey,
        slot.slotIndex,
        undefined,
        gradeLevel
      );
      return {
        questions: [{ ...q, order_index: slot.slotIndex }],
        missingSlotIndexes: [],
      };
    } catch (e) {
      console.error(
        `[listening] ${slot.slotIndex}번 문항 생성 실패`,
        e instanceof Error ? e.message : e
      );
      return { questions: [], missingSlotIndexes: [slot.slotIndex] };
    }
  }

  const count = slots.length;
  const prompt = `${buildListeningFreePrompt(count, gradeLevel)}\norder_index는 1부터 ${count}까지 순서대로.`;
  const system = `${getListeningSystemPrompt(gradeLevel)}\nOutput JSON only.`;

  const parsed = await listeningChatJson<unknown>(apiKey, {
    system,
    user: prompt,
    temperature: 0.5,
    maxCompletionTokens: listeningMaxCompletionTokensForCount(count),
  });

  const { questions } = parseQuestionsFromPayload(
    parsed,
    false,
    undefined,
    gradeLevel
  );

  // 덜 나왔으면 나온 만큼 앞 슬롯부터 채우고, 나머지는 빠진 슬롯으로 돌려준다
  const made = Math.min(count, questions.length);
  const numbered = slots
    .slice(0, made)
    .map((slot, i) => ({ ...questions[i]!, order_index: slot.slotIndex }));
  // 선택지를 섞은 뒤 규칙 검수를 해야 검수 결과가 저장본과 맞는다
  return {
    questions: applyBalancedChoicePositions(numbered).map((q) =>
      finalizeListeningQuestionFast(q, undefined, gradeLevel)
    ),
    missingSlotIndexes: slots.slice(made).map((slot) => slot.slotIndex),
  };
}
