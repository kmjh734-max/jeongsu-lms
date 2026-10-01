import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { loadSchoolPatterns } from "@/lib/exam-analysis/school-pattern";
import { SchoolPatternView } from "@/components/exam-analysis/SchoolPatternView";

export default async function ExamPatternPage() {
  const profile = await getCurrentProfile();
  const patterns = await loadSchoolPatterns(createAdminClient(), profile!.academy_id!);
  return (
    <div className="mx-auto flex max-w-5xl flex-col gap-4 px-4 py-5">
      <div>
        <Link href="/teacher/exam-analysis" className="text-[13px] font-medium text-slate-500 hover:text-slate-900">
          ← 시험지 분석
        </Link>
        <h1 className="mt-1 text-xl font-extrabold tracking-tight text-slate-900">학교별 출제 버릇</h1>
        <p className="mt-1 text-sm text-slate-500">
          분석해 둔 시험을 학교별로 모아 어디서 어떤 유형으로 내는지 보여 줍니다. 다음 시험 전에 무엇을 만들지 고르실 때 보세요.
        </p>
      </div>
      <SchoolPatternView patterns={patterns} basePath="/teacher/exam-analysis" />
    </div>
  );
}
