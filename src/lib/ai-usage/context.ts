import { AsyncLocalStorage } from "node:async_hooks";
import type { AiUsageContext } from "@/lib/ai-usage/record";
import { AI_USAGE_ALS_KEY } from "@/lib/ai-usage/record";

/**
 * 「이 일은 어느 학원의 어느 기능인가」를 호출기까지 들고 가는 테두리.
 *
 * node:async_hooks는 서버에서만 쓸 수 있다. 그런데 호출기(openai-fetch)는 생성 모듈이
 * 가져다 쓰고, 그 생성 모듈을 화면(LessonPackWorkbench 등)이 함수 몇 개 때문에 또
 * 가져다 쓴다. 그래서 호출기 쪽에 node 모듈이 섞이면 브라우저 묶음이 깨진다.
 * 이 파일은 서버 액션에서만 부르므로 여기에만 둔다 — 호출기는 전역에 걸어 둔 것을 읽는다.
 */
const store = new AsyncLocalStorage<AiUsageContext>();

(globalThis as Record<string, unknown>)[AI_USAGE_ALS_KEY] = store;

/** 이 안에서 일어나는 모든 모델 호출에 이 테두리를 붙인다. */
export function withAiUsage<T>(ctx: AiUsageContext, run: () => Promise<T>): Promise<T> {
  return store.run(ctx, run);
}

/**
 * 이 자리부터 끝까지 테두리를 씌운다(감쌀 수 없는 긴 함수용).
 * 범위가 또렷하지 않으니 한 번 돌고 끝나는 작업에만 쓴다.
 */
export function setAiUsage(ctx: AiUsageContext): void {
  store.enterWith(ctx);
}

export { flushAiUsage } from "@/lib/ai-usage/record";
export type { AiUsageContext } from "@/lib/ai-usage/record";
