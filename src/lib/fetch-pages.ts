import { runWithConcurrency } from "@/lib/run-with-concurrency";

/** Supabase 한 번 응답은 최대 1000줄 */
export const PAGE_SIZE = 1000;

type PageResult<T> = PromiseLike<{
  data: T[] | null;
  error: unknown;
  count?: number | null;
}>;

/**
 * 1000줄씩 모두 읽되, 첫 쪽에서 전체 개수를 함께 받아 나머지 쪽은 동시에 읽는다.
 * (한 쪽씩 차례로 읽으면 쪽 수만큼 왕복이 쌓인다)
 *
 * `build(from, to, withCount)` 는 안정된 정렬과 `.range(from, to)` 를 걸고,
 * withCount 이면 `select(..., { count: "exact" })` 로 만든다.
 * 오류가 난 쪽은 건너뛴다 (예전 순차 읽기가 오류에서 멈추던 것과 같은 너그러움).
 */
export async function fetchPagesParallel<T>(
  build: (from: number, to: number, withCount: boolean) => PageResult<T>,
  opts?: { maxPages?: number; concurrency?: number }
): Promise<T[]> {
  const maxPages = Math.max(1, opts?.maxPages ?? 100);
  const concurrency = Math.max(1, opts?.concurrency ?? 6);

  const first = await build(0, PAGE_SIZE - 1, true);
  if (first.error || !Array.isArray(first.data)) return [];
  const rows: T[] = [...first.data];
  if (first.data.length < PAGE_SIZE || maxPages === 1) return rows;

  const total = typeof first.count === "number" ? first.count : null;
  if (total === null) {
    // 개수를 못 받았으면 예전처럼 차례로
    for (let page = 1; page < maxPages; page++) {
      const from = page * PAGE_SIZE;
      const res = await build(from, from + PAGE_SIZE - 1, false);
      if (res.error || !Array.isArray(res.data)) break;
      rows.push(...res.data);
      if (res.data.length < PAGE_SIZE) break;
    }
    return rows;
  }

  const pageCount = Math.min(maxPages, Math.ceil(total / PAGE_SIZE));
  const rest = Array.from({ length: Math.max(0, pageCount - 1) }, (_, i) => i + 1);
  const pages = await runWithConcurrency(rest, concurrency, async (page) => {
    const from = page * PAGE_SIZE;
    const res = await build(from, from + PAGE_SIZE - 1, false);
    return res.error || !Array.isArray(res.data) ? [] : res.data;
  });
  for (const part of pages) rows.push(...part);
  return rows;
}

export function chunkList<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}
