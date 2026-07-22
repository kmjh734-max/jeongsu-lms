/** Supabase/PostgREST caps each response at 1000 rows by default. */
export const SUPABASE_PAGE_SIZE = 1000;

type PageResult<T> = {
  data: T[] | null;
  error: { message: string } | null;
};

/**
 * Drain a Supabase select past the default 1000-row cap via `.range()`.
 * `query` should return a fresh builder each call (filters/order already applied).
 */
export async function fetchAllRows<T>(
  query: (from: number, to: number) => PromiseLike<PageResult<T>>,
  pageSize = SUPABASE_PAGE_SIZE
): Promise<T[]> {
  const rows: T[] = [];
  for (let from = 0; ; from += pageSize) {
    const to = from + pageSize - 1;
    const { data, error } = await query(from, to);
    if (error) throw new Error(error.message);
    const chunk = data ?? [];
    rows.push(...chunk);
    if (chunk.length < pageSize) break;
  }
  return rows;
}

/** Chunk `.in()` filters to keep request URLs under gateway limits. */
export function chunkIds<T>(ids: T[], size = 80): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < ids.length; i += size) {
    out.push(ids.slice(i, i + size));
  }
  return out;
}
