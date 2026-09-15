/** Supabase 한 번 응답은 최대 1000줄이라, 그보다 많을 수 있는 조회는 나눠서 모두 받는다. */
const PAGE_SIZE = 1000;
/** `.in()` 목록이 너무 길면 주소가 길어져 실패하므로 나눠서 조회한다. */
export const IN_CHUNK = 100;

type PageResult<T> = PromiseLike<{
  data: T[] | null;
  error: { message: string } | null;
}>;

export async function fetchAllPages<T>(
  build: (from: number, to: number) => PageResult<T>
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += PAGE_SIZE) {
    const { data, error } = await build(from, from + PAGE_SIZE - 1);
    if (error) throw new Error(error.message);
    const rows = data ?? [];
    out.push(...rows);
    if (rows.length < PAGE_SIZE) break;
  }
  return out;
}

export function chunkIds(ids: string[], size = IN_CHUNK): string[][] {
  const unique = [...new Set(ids)];
  const chunks: string[][] = [];
  for (let i = 0; i < unique.length; i += size) {
    chunks.push(unique.slice(i, i + size));
  }
  return chunks;
}

/** id 목록을 나눠 병렬 조회한 뒤 한 배열로 합친다. */
export async function fetchByIdChunks<T>(
  ids: string[],
  build: (chunk: string[], from: number, to: number) => PageResult<T>
): Promise<T[]> {
  if (ids.length === 0) return [];
  const parts = await Promise.all(
    chunkIds(ids).map((chunk) =>
      fetchAllPages<T>((from, to) => build(chunk, from, to))
    )
  );
  return parts.flat();
}
