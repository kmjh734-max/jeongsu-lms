import { redirect } from "next/navigation";
import { isNeltEnabled } from "@/lib/academy-features";

interface PageProps {
  searchParams: Promise<{ name?: string }>;
}

/** 예전 주소 — 목록 화면에서 「결과 넣기」 창을 열어 준다 */
export default async function TeacherNeltImportPage({ searchParams }: PageProps) {
  if (!isNeltEnabled()) redirect("/teacher");
  const { name } = await searchParams;
  const trimmed = name?.trim();
  redirect(
    trimmed
      ? `/teacher/nelt?import=1&name=${encodeURIComponent(trimmed)}`
      : "/teacher/nelt?import=1"
  );
}
