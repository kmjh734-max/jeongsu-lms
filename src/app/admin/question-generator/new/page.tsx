import { Suspense } from "react";
import { QuestionGeneratorClient } from "@/components/question-generator/QuestionGeneratorClient";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { isTextbookPassageOpen } from "@/lib/textbooks/shared-passages";

export default async function AdminQuestionGeneratorNewPage() {
  // 교과서 본문은 열어 준 학원에서만 불러올 수 있다.
  const profile = await getCurrentProfile();
  const textbookOpen = await isTextbookPassageOpen(createAdminClient(), profile?.academy_id);
  return (
    <Suspense fallback={<p className="p-6 text-sm text-slate-500">불러오는 중…</p>}>
      <QuestionGeneratorClient
        role="admin"
        basePath="/admin/question-generator"
        textbookOpen={textbookOpen}
      />
    </Suspense>
  );
}
