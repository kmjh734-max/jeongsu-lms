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
  const questions: GeneratedListeningQuestion[] = [];

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

  const generated = data.questions.map((q, i) => ({
    ...q,
    order_index: slots[i]?.slotIndex ?? q.order_index,
    needs_review: false,
  }));

  if (generated.length < total) {
    items.forEach((item, i) => {
      item.status = i < generated.length ? "done" : "error";
      if (i >= generated.length) item.message = "미생성";
    });
    onProgress(generationProgressPercent("error", generated.length, total), "error", items);
    return {
      questions: generated,
      reviewCount: 0,
      error: `${generated.length}/${total}문항만 생성되었습니다. 다시 시도해 주세요.`,
    };
  }

  questions.push(...generated);

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

  let okCount = 0;
  const failed: number[] = [];

  for (let i = 0; i < total; i++) {
    const q = questions[i]!;
    items[i]!.status = "audio";
    const percent = Math.round((i / total) * 100);
    onProgress(
      percent,
      `${q.order_index}번 문항 음원 생성 중 (재생용 mp3 포함)`,
      [...items]
    );

    const res = await fetch("/api/listening/generate-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        questionId: q.id,
        speechSpeed,
      }),
    });

    let data: {
      ok?: boolean;
      message?: string;
      audioUrl?: string;
    };
    try {
      data = (await res.json()) as typeof data;
    } catch {
      data = { ok: false, message: "서버 응답을 읽지 못했습니다." };
    }

    if (!res.ok || !data.ok || !data.audioUrl) {
      items[i]!.status = "error";
      items[i]!.message = data.message ?? `HTTP ${res.status}`;
      failed.push(q.order_index);
    } else {
      items[i]!.status = "done";
      okCount++;
    }
  }

  onProgress(100, "완료", items);
  return {
    okCount,
    failed,
    message:
      failed.length > 0
        ? `${okCount}/${total}문항 음원 생성 완료 (실패: ${failed.join(", ")}번)`
        : `전체 ${total}문항 음원 생성 완료 (학생 재생용 mp3 저장됨)`,
  };
}
