/**
 * 지문 경계를 넘지 않게 묶는다.
 *
 * 검수·유일성 풀은 지문 전체를 합친 전역 풀이라, 그냥 N개씩 자르면 한 묶음에
 * 서로 다른 지문의 항목이 섞이고 묶음 경계도 지문 개수에 따라 달라진다.
 * 그러면 같은 지문이라도 혼자 돌릴 때와 여러 개를 같이 돌릴 때 판정 묶음이
 * 달라져 결과가 흔들린다(관측: 4지문 동시 35문항 vs 하나씩 38문항).
 * 지문별로 먼저 나눈 뒤 자르면 한 지문의 판정 입력이 같이 돌린 지문 수와
 * 무관해진다.
 */
export function chunkByGroup<T>(
  items: T[],
  size: number,
  keyOf: (item: T) => string
): T[][] {
  const groups = new Map<string, T[]>();
  for (const item of items) {
    const key = keyOf(item);
    const list = groups.get(key);
    if (list) list.push(item);
    else groups.set(key, [item]);
  }
  const chunks: T[][] = [];
  for (const list of groups.values()) {
    for (let i = 0; i < list.length; i += size) {
      chunks.push(list.slice(i, i + size));
    }
  }
  return chunks;
}
