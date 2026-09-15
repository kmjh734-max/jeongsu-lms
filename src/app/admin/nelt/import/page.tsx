import { redirect } from "next/navigation";
import { isNeltEnabled } from "@/lib/academy-features";

interface PageProps {
  searchParams: Promise<{ name?: string }>;
}

/** 예전 주소 — 목록 화면에서 「결과 넣기」 창을 열어 준다 */
export default async function AdminNeltImportPage({ searchParams }: PageProps) {
  if (!isNeltEnabled()) redirect("/admin");
  const { name } = await searchParams;
  const trimmed = name?.trim();
  redirect(
    trimmed
      ? `/admin/nelt?import=1&name=${encodeURIComponent(trimmed)}`
      : "/admin/nelt?import=1"
  );
}
