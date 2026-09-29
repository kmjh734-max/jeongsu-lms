import { createAdminClient } from "@/lib/supabase/admin";

/**
 * 모델 호출 사용량 기록.
 *
 * OpenAI를 부르는 곳이 서른다섯 군데라 자리마다 학원·기능을 넘기게 고치면 손이 많이 간다.
 * 대신 일을 시작하는 자리(액션·라우트)에서 한 번 감싸 두고, 호출기는 그 테두리를 읽는다.
 */
export type AiUsageContext = {
  academyId?: string | null;
  actorId?: string | null;
  /** feature_pricing.feature_key. 값을 받지 않는 보조 호출이면 비워 둔다. */
  featureKey?: string | null;
  /** 워크북 / 1장 테스트지처럼 어느 화면에서 썼는지 */
  usedFor?: string | null;
  projectId?: string | null;
};

/** context.ts가 여기에 테두리 보관함을 걸어 둔다(서버에서만). */
export const AI_USAGE_ALS_KEY = "__engcoreAiUsageAls__";

type Store = { getStore(): AiUsageContext | undefined };

export function currentAiUsage(): AiUsageContext {
  const als = (globalThis as Record<string, unknown>)[AI_USAGE_ALS_KEY] as Store | undefined;
  return als?.getStore() ?? {};
}

type Usage = {
  model: string;
  inputTokens: number;
  cachedInputTokens: number;
  outputTokens: number;
  requestId?: string | null;
  meta?: Record<string, unknown>;
};

/**
 * 한 줄 남긴다. 기록이 실패해도 만들기를 막지 않는다 — 기록은 곁다리다.
 * 호출마다 곧바로 쓰지 않고 잠깐 모았다가 한꺼번에 넣는다(한 지문에 서른 번씩 부른다).
 */
let pending: Array<Record<string, unknown>> = [];
let timer: ReturnType<typeof setTimeout> | null = null;

async function flush(): Promise<void> {
  const rows = pending;
  pending = [];
  timer = null;
  if (rows.length === 0) return;
  try {
    await createAdminClient().from("ai_usage_logs").insert(rows);
  } catch (e) {
    console.error("[ai-usage] 기록 실패", e);
  }
}

export function recordAiUsage(usage: Usage): void {
  if (!usage.model) return;
  const ctx = currentAiUsage();
  pending.push({
    academy_id: ctx.academyId ?? null,
    actor_id: ctx.actorId ?? null,
    feature_key: ctx.featureKey ?? null,
    used_for: ctx.usedFor ?? null,
    project_id: ctx.projectId ?? null,
    model: usage.model,
    input_tokens: Math.max(0, Math.floor(usage.inputTokens || 0)),
    cached_input_tokens: Math.max(0, Math.floor(usage.cachedInputTokens || 0)),
    output_tokens: Math.max(0, Math.floor(usage.outputTokens || 0)),
    request_id: usage.requestId ?? null,
    meta: usage.meta ?? {},
  });
  if (pending.length >= 40) {
    void flush();
    return;
  }
  if (!timer) timer = setTimeout(() => void flush(), 3000);
}

/** 일이 끝날 때 남은 것을 밀어 넣는다(서버가 곧 잠들 수 있다). */
export async function flushAiUsage(): Promise<void> {
  if (timer) {
    clearTimeout(timer);
    timer = null;
  }
  await flush();
}
