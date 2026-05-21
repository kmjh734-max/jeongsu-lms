import Link from "next/link";
import { createClient } from "@/lib/supabase/server";

export default async function AdminVocabPage() {
  const supabase = await createClient();

  const [{ count: folderCount }, { count: setCount }, { count: classCount }] =
    await Promise.all([
      supabase.from("vocab_folders").select("*", { count: "exact", head: true }),
      supabase.from("vocab_sets").select("*", { count: "exact", head: true }),
      supabase
        .from("classes")
        .select("*", { count: "exact", head: true })
        .eq("is_active", true),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-semibold text-slate-900">단어 관리</h1>
        <p className="mt-1 text-sm text-slate-600">
          폴더에 단어장을 만들고, 반 관리에서 클래스에 배정하세요.
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
          <p className="text-sm text-slate-600">활성 반</p>
        </div>
      </div>

      <ul className="list-inside list-disc space-y-2 text-sm text-slate-600">
        <li>
          왼쪽 <strong>나의 폴더</strong>에서 폴더를 선택한 뒤 단어세트를
          만듭니다.
        </li>
        <li>
          <strong>나의 클래스</strong>는 학생 등록·단어장 배정용입니다.{" "}
          <Link href="/admin/classes" className="text-brand-600 hover:underline">
            반 관리로 이동
          </Link>
        </li>
      </ul>
    </div>
  );
}
