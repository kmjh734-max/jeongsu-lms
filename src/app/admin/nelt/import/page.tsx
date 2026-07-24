import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isNeltEnabled } from "@/lib/academy-features";
import { NeltImportPanel } from "@/components/nelt/NeltImportPanel";

interface PageProps {
  searchParams: Promise<{ name?: string }>;
}

export default async function AdminNeltImportPage({ searchParams }: PageProps) {
  if (!isNeltEnabled()) redirect("/admin");
  const { name } = await searchParams;
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">로딩 중…</p>}>
      <NeltImportPanel
        role="admin"
        initialStudentName={name?.trim() ?? ""}
      />
    </Suspense>
  );
}
