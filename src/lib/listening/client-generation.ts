import type { ItemProgressRow } from "@/components/listening/GenerationProgress";

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
