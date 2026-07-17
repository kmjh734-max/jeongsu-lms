import {
  buildDifficultyPromptBlock,
  type ListeningDifficultyMode,
} from "@/lib/listening/exam-difficulty";
import { getExamTypeById } from "@/lib/listening/exam-types";
import type { ExamTypeTemplate } from "@/lib/listening/exam-types";
import {
  formatAssignedScenarioBlock,
  pickContinuationScenario,
} from "@/lib/listening/continuation-scenario-pool";
import {
  formatAssignedType1SubjectBlock,
  pickType1Subject,
} from "@/lib/listening/type1-subject-pool";
import { applyBalancedChoicePositions } from "@/lib/listening/balance-correct-answer";
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
} from "@/lib/listening/prompts/commonPrompt";
import { getCommonPrompt } from "@/lib/listening/prompts/commonPrompt";
import { getAllMiddle2TypePromptBlocks } from "@/lib/listening/prompts/middle2TypePrompts";
import { getAllMiddle3TypePromptBlocks } from "@/lib/listening/prompts/middle3TypePrompts";
import { getAllHigh1TypePromptBlocks } from "@/lib/listening/prompts/high1TypePrompts";
import { getAllHigh2TypePromptBlocks } from "@/lib/listening/prompts/high2TypePrompts";
import { getAllTypePromptBlocks } from "@/lib/listening/prompts/typePrompts";
import { listeningChatJson } from "@/lib/listening/openai-listening-chat";
import { runWithConcurrency } from "@/lib/run-with-concurrency";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";
const SLOT_CHUNK_SIZE = 5;
const CHUNK_PARALLEL = 2;

/** 고등 16·17은 동일 음원 — 16 대본을 17에 복사 */
function syncHighSchoolPairedScripts(
  questions: GeneratedListeningQuestion[],
  slots: ListeningGenerationSlot[]
): GeneratedListeningQuestion[] {
  const typeBySlot = new Map(slots.map((s) => [s.slotIndex, s.typeId]));
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
  types: ExamTypeTemplate[]
): string {
  const uniqueTypeIds = [...new Set(slots.map((s) => s.typeId))];
  const difficultyBlock = buildDifficultyPromptBlock(
    types,
    difficultyMode,
    gradeLevel
  );
  const typeBlocks =
    gradeLevel === "high2"
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
        `${i + 1}번째 문항: order_index=${s.slotIndex}, 유형 ${s.typeId} (${types[i]!.question_type})`
    )
    .join("\n");

  let scenarioBlocks = "";
  if (!isHighSchoolListeningGrade(gradeLevel)) {
    const usedType1Problems: string[] = [];
    for (const slot of slots) {
      if (slot.typeId === 1) {
        const assignment = pickType1Subject(usedType1Problems);
        usedType1Problems.push(`subject_id:${assignment.id}`);
        scenarioBlocks += `${formatAssignedType1SubjectBlock(assignment)}\n\n`;
      }
      if (slot.typeId === 19 || slot.typeId === 20) {
        scenarioBlocks += `${formatAssignedScenarioBlock(
          pickContinuationScenario(slot.typeId)
        )}\n\n`;
      }
    }
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

${getJsonOutputSchema(gradeLevel)}
`.trim();
}

async function fetchSlotChunkQuestions(
  apiKey: string,
  slots: ListeningGenerationSlot[],
  difficultyMode: ListeningDifficultyMode,
  gradeLevel: ListeningGradeLevel
): Promise<GeneratedListeningQuestion[]> {
  const types = slots.map((s) => {
    const t = getExamTypeById(s.typeId, gradeLevel);
    if (!t) throw new Error(`유형 ${s.typeId}을 찾을 수 없습니다.`);
    return t;
  });

  const prompt = buildSlotsBatchPrompt(
    slots,
    difficultyMode,
    gradeLevel,
    types
  );
  const system = `${getListeningSystemPrompt(gradeLevel)}\nOutput JSON only. questions array length must be ${slots.length}. speakers: M, W, ANN only.`;

  const parsed = await listeningChatJson<unknown>(apiKey, {
    system,
    user: prompt,
    temperature: 0.5,
    maxCompletionTokens: listeningMaxCompletionTokensForCount(slots.length),
  });

  const { questions, failures } = parseQuestionsFromPayload(
    parsed,
    true,
    types,
    gradeLevel
  );

  if (questions.length < slots.length) {
    const detail =
      failures.length > 0 ? ` (${failures.slice(0, 2).join("; ")})` : "";
    throw new Error(
      `${slots.length}문항 중 ${questions.length}개만 파싱됨${detail}`
    );
  }

  return slots.map((slot, i) => {
    const q = questions[i]!;
    return finalizeListeningQuestionFast(
      { ...q, order_index: slot.slotIndex },
      types[i],
      gradeLevel
    );
  });
}

async function generateSlotChunk(
  apiKey: string,
  slots: ListeningGenerationSlot[],
  difficultyMode: ListeningDifficultyMode,
  gradeLevel: ListeningGradeLevel,
  prior: GeneratedListeningQuestion[]
): Promise<GeneratedListeningQuestion[]> {
  try {
    return await fetchSlotChunkQuestions(
      apiKey,
      slots,
      difficultyMode,
      gradeLevel
    );
  } catch {
    const out: GeneratedListeningQuestion[] = [];
    for (let i = 0; i < slots.length; i++) {
      const slot = slots[i]!;
      const prevProblems =
        slot.typeId === 19 || slot.typeId === 20
          ? [
              ...prior,
              ...out,
            ].flatMap((q) => q.problems ?? [])
          : out[out.length - 1]?.problems;

      const q = await generateSingleExamQuestion(
        apiKey,
        slot.typeId,
        difficultyMode,
        prevProblems?.length ? prevProblems : undefined,
        gradeLevel,
        slot.slotIndex
      );
      out.push({ ...q, order_index: slot.slotIndex, needs_review: false });
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

/** 슬롯 목록을 최소 API 호출로 생성 (5문항 단위 일괄, 청크는 2개까지 병렬) */
export async function generateExamQuestionsFromSlots(
  apiKey: string,
  slots: ListeningGenerationSlot[],
  difficultyMode: ListeningDifficultyMode = "auto",
  gradeLevel: ListeningGradeLevel = "middle1"
): Promise<GeneratedListeningQuestion[]> {
  if (slots.length === 0) return [];

  if (slots.length === 1) {
    const slot = slots[0]!;
    const q = await generateSingleExamQuestion(
      apiKey,
      slot.typeId,
      difficultyMode,
      undefined,
      gradeLevel,
      slot.slotIndex
    );
    return [{ ...q, order_index: slot.slotIndex, needs_review: false }];
  }

  const chunks = chunkSlots(slots);
  const chunkResults = await runWithConcurrency(
    chunks,
    CHUNK_PARALLEL,
    async (chunk) =>
      generateSlotChunk(apiKey, chunk, difficultyMode, gradeLevel, [])
  );

  const bySlotIndex = new Map<number, GeneratedListeningQuestion>();
  for (const list of chunkResults) {
    for (const q of list) {
      bySlotIndex.set(q.order_index, q);
    }
  }

  const ordered = slots.map((slot) => {
    const q = bySlotIndex.get(slot.slotIndex);
    if (!q) throw new Error(`${slot.slotIndex}번 문항 생성 실패`);
    return q;
  });
  const synced = isHighSchoolListeningGrade(gradeLevel)
    ? syncHighSchoolPairedScripts(ordered, slots)
    : ordered;
  return applyBalancedChoicePositions(synced);
}

/** 자유 모드: 문항 수만큼 1회 API 호출 */
export async function generateFreeQuestionsFromSlots(
  apiKey: string,
  slots: ListeningGenerationSlot[],
  gradeLevel: ListeningGradeLevel = "middle1"
): Promise<GeneratedListeningQuestion[]> {
  if (slots.length === 1) {
    const slot = slots[0]!;
    const q = await generateSingleFreeQuestion(
      apiKey,
      slot.slotIndex,
      undefined,
      gradeLevel
    );
    return [{ ...q, order_index: slot.slotIndex, needs_review: false }];
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

  if (questions.length < count) {
    throw new Error(`${count}문항 중 ${questions.length}개만 생성됨`);
  }

  const finalized = slots.map((slot, i) =>
    finalizeListeningQuestionFast(
      { ...questions[i]!, order_index: slot.slotIndex },
      undefined,
      gradeLevel
    )
  );
  return applyBalancedChoicePositions(finalized);
}
