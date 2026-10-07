import Link from "next/link";
import { notFound } from "next/navigation";
import { DiagTestEditor } from "@/components/vocab-diagnostic/DiagTestEditor";
import { getDiagStaff } from "@/lib/vocab-diagnostic/access";
import { getTest } from "@/lib/vocab-diagnostic/admin-queries";
import { DIAG_TARGETS } from "@/lib/vocab-diagnostic/types";

export const dynamic = "force-dynamic";

export default async function DiagTestPage({ params }: { params: Promise<{ id: string }> }) {
  const staff = await getDiagStaff();
  if (!staff) notFound();
  const test = await getTest(staff.academyId, (await params).id);
  if (!test) notFound();
  const cfg = DIAG_TARGETS[test.target];
  return (
    <div className="p-4 sm:p-6">
      <Link href="/admin/marketing/vocab-diagnostic" className="text-xs font-semibold text-brand-700 hover:underline">← 어휘 진단</Link>
      <h1 className="mt-2 text-xl font-bold text-slate-900">
        {cfg.label} 어휘 진단 <span className="text-base font-normal text-slate-500">· {test.version}판 · {cfg.folderName}</span>
      </h1>
      <DiagTestEditor
        test={{
          id: test.id,
          status: test.status,
          title: test.title,
          questionCount: test.question_count,
          minutes: test.recommended_minutes,
          intro: test.intro_text,
          questions: test.questions,
        }}
      />
    </div>
  );
}
