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

  const update = (phase: GenerationPhase, index: number, sub: "generate" | "validate" = "generate") => {
    onProgress(generationProgressPercent(phase, index, total, sub), phase, [...items]);
  };

  onProgress(0, "generating", items);

  for (let i = 0; i < total; i++) {
    const slot = slots[i]!;
    items[i]!.status = "generating";
    update("generating", i, "generate");

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
        previousProblems: i > 0 ? questions[i - 1]?.problems : undefined,
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

    items[i]!.status = "validating";
    update("validating", i, "validate");

    const q = {
      ...data.question,
      needs_review: data.question.needs_review ?? data.needs_review,
      problems: data.problems,
    };
    questions.push(q);
    items[i]!.status = q.needs_review ? "review" : "passed";
    update("validating", i, "validate");
  }

  let schemaWarning: string | undefined;

  if (persist && questions.length > 0) {
    onProgress(generationProgressPercent("saving", 0, total), "saving", items);
    for (let i = 0; i < questions.length; i++) {
      items[i]!.status = "saving";
      onProgress(generationProgressPercent("saving", i, total), "saving", [...items]);

      const res = await fetch("/api/listening/generate-questions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ setId, questions: [questions[i]] }),
      });
      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        schemaWarning?: string;
        schemaMigrationNeeded?: boolean;
      };
      if (!data.ok) {
        items[i]!.status = "error";
        items[i]!.message = data.message ?? "저장 실패";
        return {
          questions,
          reviewCount: questions.filter((q) => q.needs_review).length,
          error: data.message ?? `${questions[i]!.order_index}번 저장 실패`,
        };
      }
      if (data.schemaMigrationNeeded && data.schemaWarning) {
        schemaWarning = data.schemaWarning;
      }
      items[i]!.status = "saved";
    }
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

  let okCount = 0;
  const failed: number[] = [];

  for (let i = 0; i < total; i++) {
    const q = questions[i]!;
    items[i]!.status = "audio";
    const percent = Math.round((i / total) * 100);
    onProgress(percent, `${q.order_index}번 문항 음원 생성 중`, [...items]);

    const res = await fetch("/api/listening/generate-audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        setId,
        questionId: q.id,
        speechSpeed,
      }),
    });

    const data = (await res.json()) as {
      ok?: boolean;
      message?: string;
      stage?: string;
    };

    if (!data.ok) {
      items[i]!.status = "error";
      items[i]!.message = data.message ?? "실패";
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
        : `전체 ${total}문항 음원 생성 완료`,
  };
}
