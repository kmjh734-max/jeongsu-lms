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
import type { ListeningGenerationSlot } from "@/lib/listening/generation-slots";

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

  const update = (phase: GenerationPhase, index: number) => {
    onProgress(generationProgressPercent(phase, index, total), phase, [...items]);
  };

  onProgress(0, "generating", items);
  items.forEach((item) => {
    item.status = "generating";
  });
  onProgress(
    generationProgressPercent("generating", 0, total),
    "generating",
    [...items]
  );
  onProgress(15, "generating", items);

  const res = await fetch("/api/listening/generate-questions-batch", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      setId,
      slots,
      mode,
      difficultyMode,
      persist,
    }),
  });

  const data = (await res.json()) as {
    ok?: boolean;
    message?: string;
    questions?: GeneratedListeningQuestion[];
    schemaWarning?: string;
    schemaMigrationNeeded?: boolean;
  };

  if (!data.ok || !data.questions?.length) {
    items.forEach((item) => {
      item.status = "error";
      item.message = data.message ?? "생성 실패";
    });
    onProgress(generationProgressPercent("error", 0, total), "error", items);
    return {
      questions: data.questions ?? [],
      reviewCount: 0,
      error: data.message ?? "문항 생성 실패",
    };
  }

  const questions = data.questions.map((q, i) => ({
    ...q,
    order_index: slots[i]?.slotIndex ?? q.order_index,
    needs_review: false,
  }));

  if (questions.length < total) {
    items.forEach((item, i) => {
      item.status = i < questions.length ? "done" : "error";
      if (i >= questions.length) item.message = "미생성";
    });
    onProgress(generationProgressPercent("error", questions.length, total), "error", items);
    return {
      questions,
      reviewCount: 0,
      error: `${questions.length}/${total}문항만 생성되었습니다. 다시 시도해 주세요.`,
    };
  }

  if (persist) {
    items.forEach((item) => {
      item.status = "saved";
    });
    onProgress(100, "done", items);
  } else {
    items.forEach((item) => {
      item.status = "done";
    });
    onProgress(100, "done", items);
  }

  let schemaWarning: string | undefined;
  if (data.schemaMigrationNeeded && data.schemaWarning) {
    schemaWarning = data.schemaWarning;
  }

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
