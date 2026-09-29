/**
 * 모델 1M 토큰당 달러. OpenAI 공식 단가를 손으로 적어 둔다.
 *
 * 단가가 바뀌면 여기만 고친다. 목록에 없는 모델은 원가를 셈하지 않고 「단가 모름」으로
 * 따로 보여 준다 — 모르는 것을 아는 척 계산하면 원가율이 거짓이 된다.
 */
export type ModelPrice = { in: number; cachedIn: number; out: number };

export const MODEL_PRICES: Record<string, ModelPrice> = {
  "gpt-5": { in: 1.25, cachedIn: 0.125, out: 10 },
  "gpt-5-mini": { in: 0.25, cachedIn: 0.025, out: 2 },
  "gpt-5-nano": { in: 0.05, cachedIn: 0.005, out: 0.4 },
  "gpt-4o": { in: 2.5, cachedIn: 1.25, out: 10 },
  "gpt-4o-mini": { in: 0.15, cachedIn: 0.075, out: 0.6 },
};

/** 1달러를 몇 원으로 볼지 */
export const WON_PER_USD = 1400;

/** 모델 이름 앞부분으로 단가를 찾는다(gpt-5-mini-2025-08-07 → gpt-5-mini) */
export function modelPrice(model: string): ModelPrice | null {
  const m = String(model ?? "").toLowerCase();
  for (const key of Object.keys(MODEL_PRICES).sort((a, b) => b.length - a.length)) {
    if (m.startsWith(key)) return MODEL_PRICES[key]!;
  }
  return null;
}

/** 이 호출이 얼마짜리인지(원). 단가를 모르면 null. */
export function usageWon(u: {
  model: string;
  input_tokens: number;
  cached_input_tokens: number;
  output_tokens: number;
}): number | null {
  const p = modelPrice(u.model);
  if (!p) return null;
  const fresh = Math.max(0, u.input_tokens - u.cached_input_tokens);
  const usd =
    (fresh * p.in + u.cached_input_tokens * p.cachedIn + u.output_tokens * p.out) / 1_000_000;
  return usd * WON_PER_USD;
}
