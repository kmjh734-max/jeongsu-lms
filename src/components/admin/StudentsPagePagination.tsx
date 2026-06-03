import Link from "next/link";

interface StudentsPagePaginationProps {
  page: number;
  total: number;
  pageSize: number;
  search: string;
}

export function StudentsPagePagination({
  page,
  total,
  pageSize,
  search,
}: StudentsPagePaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  if (totalPages <= 1 && !search) return null;

  const q = search ? `&q=${encodeURIComponent(search)}` : "";

  return (
    <div className="flex flex-wrap items-center justify-between gap-2 text-sm text-slate-600">
      <span>
        전체 {total}명 · {page}/{totalPages}페이지
      </span>
      <div className="flex gap-2">
        {page > 1 && (
          <Link
            href={`/admin/students?page=${page - 1}${q}`}
            className="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50"
          >
            이전
          </Link>
        )}
        {page < totalPages && (
          <Link
            href={`/admin/students?page=${page + 1}${q}`}
            className="rounded-lg border border-slate-200 px-3 py-1 hover:bg-slate-50"
          >
            다음
          </Link>
        )}
      </div>
    </div>
  );
}
