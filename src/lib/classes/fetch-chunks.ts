/** id 목록을 잘라 여러 번 읽고, 1000행씩 넘겨 가며 모두 모은다 (읽기 전용). */

const PAGE_SIZE = 1000;
const MAX_PAGES = 30;

export function chunkIds<T>(items: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < items.length; i += size) out.push(items.slice(i, i + size));
  return out;
}

type PageResult = PromiseLike<{ data: unknown; error: unknown }>;

export async function fetchInChunks<T>(
  ids: string[],
  build: (chunk: string[], from: number, to: number) => PageResult,
  chunkSize = 80
): Promise<T[]> {
  if (ids.length === 0) return [];
  const unique = [...new Set(ids)];
  const parts = await Promise.all(
    chunkIds(unique, chunkSize).map(async (chunk) => {
      const rows: T[] = [];
      for (let page = 0; page < MAX_PAGES; page++) {
        const from = page * PAGE_SIZE;
        const { data, error } = await build(chunk, from, from + PAGE_SIZE - 1);
        if (error || !Array.isArray(data)) break;
        rows.push(...(data as T[]));
        if (data.length < PAGE_SIZE) break;
      }
      return rows;
    })
  );
  return parts.flat();
}
