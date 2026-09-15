import { GenerationsListClient } from "@/components/question-generator/GenerationsListClient";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { listGenerationJobs } from "@/lib/question-generator/list-jobs";
import { createClient } from "@/lib/supabase/server";

export default async function TeacherQuestionGeneratorPage() {
  // 목록을 서버에서 같이 읽어 넘긴다 (화면이 뜬 뒤 다시 목록 API 를 기다리지 않게)
  const profile = await getCurrentProfile();
  const initialJobs = profile?.academy_id
    ? (
        await listGenerationJobs(await createClient(), {
          academyId: profile.academy_id,
          role: profile.role,
          viewerId: profile.id,
        })
      ).jobs
    : null;
  return <GenerationsListClient basePath="/teacher/question-generator" initialJobs={initialJobs} />;
}
