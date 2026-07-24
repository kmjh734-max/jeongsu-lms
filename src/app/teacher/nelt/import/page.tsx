import { Suspense } from "react";
import { redirect } from "next/navigation";
import { isNeltEnabled } from "@/lib/academy-features";
import { NeltImportPanel } from "@/components/nelt/NeltImportPanel";

export default function TeacherNeltImportPage() {
  if (!isNeltEnabled()) redirect("/teacher");
  return (
    <Suspense fallback={<p className="text-sm text-slate-500">로딩 중…</p>}>
      <NeltImportPanel role="teacher" />
    </Suspense>
  );
}
