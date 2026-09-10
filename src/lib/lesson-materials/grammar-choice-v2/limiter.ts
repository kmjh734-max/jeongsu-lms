/**
 * 여러 지문이 공유하는 호출 동시성 게이트.
 *
 * 예전에는 지문 동시성(4)과 지문 안의 묶음 동시성(3)이 곱해지는 구조라,
 * 실제 상한이 "지문 수 x 묶음 수"에 따라 오락가락했다. 지문이 적으면 한가한
 * 슬롯이 남고, 많으면 느린 지문 하나가 자기 슬롯을 통째로 붙잡았다.
 * 전역 게이트를 하나 두면 상한이 지문 구성과 무관하게 일정해진다.
 */
export type Limiter = <T>(task: () => Promise<T>) => Promise<T>;

export function createLimiter(limit: number): Limiter {
  const max = Math.max(1, limit);
  let active = 0;
  const waiting: Array<() => void> = [];

  return async function run<T>(task: () => Promise<T>): Promise<T> {
    if (active >= max) {
      await new Promise<void>((resolve) => waiting.push(resolve));
    }
    active += 1;
    try {
      return await task();
    } finally {
      active -= 1;
      waiting.shift()?.();
    }
  };
}
