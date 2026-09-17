/**
 * 지문 삽화 — 6컷.
 *
 * 흐름: 지문 → (값싼 글 모델) 네 장면 → 네 그림을 한꺼번에 요청 → 캔버스에서 2×2 한 장으로 합침.
 * 예전에는 2×2 한 장을 통째로 시키고 말풍선 한글까지 그림 모델에 맡겼다. 한 번에 한 장이라
 * 55초 안팎 걸렸고, 지문 뒷부분이 빠지고 한글은 획이 뭉개졌다.
 * 지금은 네 컷을 나란히 요청하므로 가장 늦은 한 컷만큼만 기다리고, 컷마다 지문의 다른 대목을 맡는다.
 */
import { createAdminClient } from "@/lib/supabase/admin";
import { BEAT_COUNT, planIllustrationBeats } from "@/lib/lesson-materials/illustration-beats";
import { generatePanels } from "@/lib/lesson-materials/illustration-panels";
import { composeIllustrationSheet } from "@/lib/lesson-materials/illustration-sheet";

const BUCKET = "listening-images";

/** 장면 뽑기에 주는 시간 */
const BEATS_TIMEOUT_MS = 25_000;
/** 기본 마감: 경로 상한(120초)에서 합치기·저장·차감할 자리를 뺀 시간 */
const DEFAULT_BUDGET_MS = 100_000;
/** 그림이 이 수보다 적게 나오면 저장하지 않는다 — 반쪽짜리 판을 남기지 않는다 */
const MIN_PANELS = 3;

export async function generateLessonMaterialComicIllustration(input: {
  academyId: string;
  /** 지문 원문. 이게 있으면 여기서 장면을 뽑는다. */
  passageText?: string;
  /** 지문이 없을 때 쓰는 예전 설명 */
  illustrationPrompt?: string;
  passageHint?: string;
  /** 이 시각(ms)까지 끝내야 한다. 없으면 지금부터 DEFAULT_BUDGET_MS. */
  deadlineAt?: number;
  /** 그림이 실제로 나왔을 때(저장 전) 한 번 부른다 — 여기서 차감한다 */
  onImageProduced?: () => Promise<void>;
}): Promise<{ url: string; prompt: string; titles: string[]; panelCount: number }> {
  const apiKey = process.env.OPENAI_API_KEY?.trim();
  if (!apiKey) throw new Error("OPENAI_API_KEY가 설정되어 있지 않습니다.");
  const deadlineAt = input.deadlineAt ?? Date.now() + DEFAULT_BUDGET_MS;

  // 장면 뽑기는 그림 요청 앞이라, 여기서 오래 끌면 그림을 못 끝낸다
  const beatsController = new AbortController();
  const beatsTimer = setTimeout(
    () => beatsController.abort(),
    Math.min(BEATS_TIMEOUT_MS, Math.max(1_000, deadlineAt - Date.now() - 30_000))
  );
  let plan;
  try {
    plan = await planIllustrationBeats({
      passage: input.passageText ?? input.passageHint ?? "",
      fallbackHint: input.illustrationPrompt ?? input.passageHint ?? "",
      signal: beatsController.signal,
    });
  } finally {
    clearTimeout(beatsTimer);
  }

  const bytes = await generatePanels({
    beats: plan.beats,
    cast: plan.cast,
    deadlineAt,
    apiKey,
  });

  const panels = plan.beats.map((beat, i) => ({ title: beat.title, bytes: bytes[i] ?? null }));
  const drawnCount = panels.filter((p) => p.bytes).length;
  if (drawnCount < MIN_PANELS) {
    throw new Error(
      drawnCount === 0
        ? "삽화를 만들지 못했습니다. 잠시 뒤 다시 시도해 주세요."
        : `삽화 ${BEAT_COUNT}컷 중 ${drawnCount}컷만 그려져 저장하지 않았습니다. 다시 시도해 주세요.`
    );
  }

  const sheet = await composeIllustrationSheet(panels);
  // 그림은 이미 만들어졌다(값이 나갔다). 저장이 실패해도 차감은 한다.
  await input.onImageProduced?.();

  const admin = createAdminClient();
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  if (!supabaseUrl) throw new Error("NEXT_PUBLIC_SUPABASE_URL이 없습니다.");

  const storagePath = `lesson-materials/${input.academyId}/${crypto.randomUUID()}.png`;
  let { error } = await admin.storage.from(BUCKET).upload(storagePath, sheet, {
    contentType: "image/png",
    upsert: true,
  });
  if (error) {
    // 만든 그림을 버리지 않게 저장을 한 번 더 해 본다
    ({ error } = await admin.storage.from(BUCKET).upload(storagePath, sheet, {
      contentType: "image/png",
      upsert: true,
    }));
  }
  if (error) throw new Error(`삽화 저장 실패: ${error.message}`);

  const base = supabaseUrl.replace(/\/$/, "");
  const url = `${base}/storage/v1/object/public/${BUCKET}/${storagePath}?v=${Date.now()}`;
  return {
    url,
    prompt: plan.beats.map((b, i) => `${i + 1}. [${b.title}] ${b.draw}`).join("\n"),
    titles: panels.filter((p) => p.bytes).map((p) => p.title),
    panelCount: drawnCount,
  };
}
