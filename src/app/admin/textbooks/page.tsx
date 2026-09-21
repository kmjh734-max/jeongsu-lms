import { notFound } from "next/navigation";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { listTextbooks } from "@/lib/textbooks";
import { isStudyPlanEnabled } from "@/lib/study-plan/access";
import { TextbookBoard } from "@/components/textbooks/TextbookBoard";

/** 교재 목차 — 한 번 올려 두면 학습일정표에서 트리로 골라 쓴다 */
export default async function TextbooksPage() {
  const profile = await getCurrentProfile();
  if (!(await isStudyPlanEnabled(profile?.academy_id))) notFound();
  const books = profile?.academy_id ? await listTextbooks(createAdminClient(), profile.academy_id) : [];
  return (
    <div>
      <PageHeader
        title="교재 목차"
        description="교재 목차를 올려 두면 학습일정표에서 단원을 골라 진도를 적을 수 있어요."
      />
      <TextbookBoard books={books} />
    </div>
  );
}
