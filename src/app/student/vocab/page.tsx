import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { PageHeader } from "@/components/ui/PageHeader";
import { StudentVocabSetList } from "@/components/vocab/StudentVocabSetList";
import { fetchStudentVocabSummaries } from "@/lib/vocab/student-sets";

export default async function StudentVocabPage() {
  const [profile, supabase] = await Promise.all([
    getCurrentProfile(),
    createClient(),
  ]);

  const summaries = await fetchStudentVocabSummaries(supabase, profile!.id);

  return (
    <div>
      <PageHeader
        title="단어학습"
        description="뜻 익히기 → 스펠링 → 예문 빈칸 → 종합테스트, 4단계를 차례로 끝내면 합격이에요."
      />
      <StudentVocabSetList summaries={summaries} />
    </div>
  );
}
