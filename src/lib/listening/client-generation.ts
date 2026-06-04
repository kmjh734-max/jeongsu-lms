import {
  generationProgressPercent,
  type GenerationPhase,
} from "@/lib/listening/progress-weights";
import type { ItemProgressRow } from "@/components/listening/GenerationProgress";
import type {
  GeneratedListeningQuestion,
  ListeningGenerationMode,
} from "@/lib/listening/types";
import type { ListeningDifficultyMode } from "@/lib/listening/exam-difficulty";
import { buildContinuationAvoidList } from "@/lib/listening/continuation-scenario-pool";
import type { ListeningGenerationSlot } from "@/lib/listening/generation-slots";

function buildPreviousProblemsForSlot(
  prior: GeneratedListeningQuestion[],
  index: number,
  slot: ListeningGenerationSlot
): string[] | undefined {
  const lines: string[] = [];
  if (slot.typeId === 19 || slot.typeId === 20) {
    lines.push(...buildContinuationAvoidList(prior, slot.typeId));
  }
  const last = prior[index - 1]?.problems;
  if (last?.length) lines.push(...last);
  return lines.length > 0 ? lines : undefined;
}

export interface GenerateItemResult {
  ok: boolean;
  message?: string;
  question?: GeneratedListeningQuestion;
}

export async function generateQuestionsSequential(opts: {
  setId: string;
  slots: ListeningGenerationSlot[];
  mode?: ListeningGenerationMode;
  difficultyMode: ListeningDifficultyMode;
  persist: boolean;
  onProgress: (percent: number, phase: GenerationPhase, items: ItemProgressRow[]) => void;
}): Promise<{
  questions: GeneratedListeningQuestion[];
  reviewCount: number;
  error?: string;
  schemaWarning?: string;
}> {
  const {
    setId,
    slots,
    mode = "exam",
    difficultyMode,
    persist,
    onProgress,
  } = opts;
  const total = slots.length;
  const items: ItemProgressRow[] = slots.map((s) => ({
    orderIndex: s.slotIndex,
    status: "pending",
  }));
  const questions: GeneratedListeningQuestion[] = [];

  const update = (phase: GenerationPhase, index: number) => {
    onProgress(generationProgressPercent(phase, index, total), phase, [...items]);
  };

  onProgress(0, "generating", items);

  for (let i = 0; i < total; i++) {
    const slot = slots[i]!;
    items[i]!.status = "generating";
    update("generating", i);

    const res = await fetch("/api/listening/generate-question-item", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        typeId: mode === "exam" ? slot.typeId : undefined,
        orderIndex: slot.slotIndex,
        mode,
        difficultyMode,
        persist: false,
        previousProblems: buildPreviousProblemsForSlot(
          questions,
          i,
          slot
        ),
      }),
    });

    const data = (await res.json()) as GenerateItemResult & {
      question?: GeneratedListeningQuestion;
      needs_review?: boolean;
      problems?: string[];
    };

    if (!data.ok || !data.question) {
      items[i]!.status = "error";
      items[i]!.message = data.message ?? "생성 실패";
      update("error", i);
      return {
        questions,
        reviewCount: questions.filter((q) => q.needs_review).length,
        error: data.message ?? `${slot.slotIndex}번 생성 실패`,
      };
    }

    const q = {
      ...data.question,
      order_index: slot.slotIndex,
      needs_review: false,
      problems: data.problems ?? [],
    };
    questions.push(q);
    items[i]!.status = "done";
    update("generating", i);
  }

  let schemaWarning: string | undefined;

  if (persist && questions.length > 0) {
    onProgress(generationProgressPercent("saving", 0, total), "saving", items);
    for (let i = 0; i < questions.length; i++) {
      items[i]!.status = "saving";
    }
    onProgress(generationProgressPercent("saving", 0, total), "saving", [...items]);

    const res = await fetch("/api/listening/generate-questions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        questions: questions.map((q, i) => ({
          ...q,
          order_index: slots[i]?.slotIndex ?? i + 1,
        })),
        replaceAll: true,
      }),
    });
    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      schemaWarning?: string;
      schemaMigrationNeeded?: boolean;
    };
    if (!data.ok) {
      items.forEach((item) => {
        item.status = "error";
        item.message = data.message ?? "저장 실패";
      });
      return {
        questions,
        reviewCount: questions.filter((q) => q.needs_review).length,
        error: data.message ?? "문항 저장 실패",
      };
    }
    if (data.schemaMigrationNeeded && data.schemaWarning) {
      schemaWarning = data.schemaWarning;
    }
    items.forEach((item) => {
      item.status = "saved";
    });
  }

  onProgress(100, "done", items);
  return {
    questions,
    reviewCount: questions.filter((q) => q.needs_review).length,
    schemaWarning,
  };
}

export async function generateAudioSequential(opts: {
  setId: string;
  questions: Array<{ id: string; order_index: number }>;
  speechSpeed: number;
  onProgress: (percent: number, detail: string, items: ItemProgressRow[]) => void;
}): Promise<{ okCount: number; failed: number[]; message?: string }> {
  const { setId, questions, speechSpeed, onProgress } = opts;
  const total = questions.length;
  const items: ItemProgressRow[] = questions.map((q) => ({
    orderIndex: q.order_index,
    status: "pending",
  }));

  items.forEach((item) => {
    item.status = "audio";
  });
  onProgress(5, "음원 일괄 생성 중 (기존 음원은 건너뜀)", [...items]);

  const res = await fetch("/api/listening/generate-audio-batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      setId,
      speechSpeed,
      questionIds: questions.map((q) => q.id),
    }),
  });

  const data = (await res.json()) as {
    ok?: boolean;
    message?: string;
    results?: Array<{
      orderIndex: number;
      ok: boolean;
      message?: string;
    }>;
  };

  const resultByOrder = new Map(
    (data.results ?? []).map((r) => [r.orderIndex, r])
  );

  let okCount = 0;
  const failed: number[] = [];

  for (let i = 0; i < total; i++) {
    const q = questions[i]!;
    const row = resultByOrder.get(q.order_index);
    if (row?.ok) {
      items[i]!.status = "done";
      okCount++;
    } else {
      items[i]!.status = "error";
      items[i]!.message = row?.message ?? data.message ?? "실패";
      failed.push(q.order_index);
    }
  }

  onProgress(100, "완료", items);
  return {
    okCount,
    failed,
    message:
      data.message ??
      (failed.length > 0
        ? `${okCount}/${total}문항 음원 생성 완료 (실패: ${failed.join(", ")}번)`
        : `전체 ${total}문항 음원 생성 완료`),
  };
}
