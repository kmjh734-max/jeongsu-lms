import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";

export default async function TeacherVocabPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const teacherId = profile!.id;

  const [{ count: folderCount }, { count: setCount }, { count: classCount }] =
    await Promise.all([
      supabase
        .from("vocab_folders")
        .select("*", { count: "exact", head: true })
        .or(`teacher_id.eq.${teacherId},created_by.eq.${teacherId}`),
      supabase
        .from("vocab_sets")
        .select("*", { count: "exact", head: true })
        .or(`teacher_id.eq.${teacherId},created_by.eq.${teacherId}`),
      supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("teacher_id", teacherId),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">단어 관리</h1>
        <p className="mt-1 text-sm text-slate-600">
          폴더에 단어장을 만들고, 내 반에서 학생에게 배정하세요.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-violet-700">{folderCount ?? 0}</p>
          <p className="text-sm text-slate-600">폴더</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-emerald-700">{setCount ?? 0}</p>
          <p className="text-sm text-slate-600">단어장</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <p className="text-2xl font-bold text-slate-800">{classCount ?? 0}</p>
          <p className="text-sm text-slate-600">담당 반</p>
        </div>
      </div>

      <ul className="list-inside list-disc space-y-2 text-sm text-slate-600">
        <li>
          왼쪽 <strong>나의 폴더</strong>에서 단어세트를 만듭니다.
        </li>
        <li>
          학생 등록·단어장 배정은{" "}
          <Link
            href="/teacher/classes"
            className="text-brand-600 hover:underline"
          >
            반 관리
          </Link>
          에서 합니다.
        </li>
      </ul>
    </div>
  );
}
