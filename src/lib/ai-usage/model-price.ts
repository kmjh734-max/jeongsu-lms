/**
 * 모델 1M 토큰당 달러. OpenAI 공식 단가를 손으로 적어 둔다.
 *
 * 단가가 바뀌면 여기만 고친다. 목록에 없는 모델은 원가를 셈하지 않고 「단가 모름」으로
 * 따로 보여 준다 — 모르는 것을 아는 척 계산하면 원가율이 거짓이 된다.
 */
export type ModelPrice = { in: number; cachedIn: number; out: number };

export const MODEL_PRICES: Record<string, ModelPrice> = {
  // 2026-09-29 공식 가격표에서 옮겨 적음 (developers.openai.com/api/docs/pricing)
  "gpt-5.6-sol": { in: 4, cachedIn: 0.4, out: 20 },
  "gpt-5.6-terra": { in: 2, cachedIn: 0.2, out: 12 },
  "gpt-5.6-luna": { in: 0.2, cachedIn: 0.02, out: 1.2 },
  "gpt-5.5": { in: 5, cachedIn: 0.5, out: 30 },
  "gpt-5.4-nano": { in: 0.05, cachedIn: 0.005, out: 0.4 },
  "gpt-5.4-mini": { in: 0.25, cachedIn: 0.025, out: 2 },
  "gpt-5.4": { in: 2.5, cachedIn: 0.25, out: 15 },
  "gpt-5.2": { in: 1.75, cachedIn: 0.175, out: 14 },
  "gpt-5.1": { in: 1.25, cachedIn: 0.125, out: 10 },
  "gpt-5-mini": { in: 0.25, cachedIn: 0.025, out: 2 },
  "gpt-5-nano": { in: 0.05, cachedIn: 0.005, out: 0.4 },
  "gpt-5": { in: 1.25, cachedIn: 0.125, out: 10 },
  "gpt-4o-mini": { in: 0.15, cachedIn: 0.075, out: 0.6 },
  "gpt-4o": { in: 2.5, cachedIn: 1.25, out: 10 },
  /*
   * 되살리기용 모델(2026-10-01 확인). 평소에는 안 부르지만, 시험지를 못 읽었을 때·
   * 학생부 OCR·듣기 그림 계획에서 이 모델로 한 번 더 부른다. 단가가 없으면 그 호출만
   * 「단가 모름」으로 빠져, 정작 실패해서 두 번 부른 자리의 값이 원가에 안 잡힌다.
   */
  "gpt-4.1-mini": { in: 0.4, cachedIn: 0.1, out: 1.6 },
  "gpt-4.1": { in: 2, cachedIn: 0.5, out: 8 },
  // 그림 모델. 입력은 글·그림 단가가 다른데(글 $5·그림 $8) 사용량이 나뉘어 오지 않아
  // 글 쪽으로 잡는다. 삽화는 출력이 거의 전부라 차이가 작다.
  "gpt-image-1.5": { in: 5, cachedIn: 2, out: 32 },
  "gpt-image-1": { in: 5, cachedIn: 2.5, out: 40 },
};

/*
 * 두 가지는 여기서 셈하지 않는다 — 우리 호출에 해당하지 않아서다.
 *  · 입력이 272K를 넘으면 입력 2배·출력 1.5배. 우리 지문은 그 근처도 못 간다.
 *  · 지역 처리(data residency) 창구는 10% 더. 우리는 기본 창구를 쓴다.
 * gpt-5.6-sol의 $4/$20은 2026-11-21까지의 할인가다. 그 뒤에는 다시 확인해야 한다.
 */

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
