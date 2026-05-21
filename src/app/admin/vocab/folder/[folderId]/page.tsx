import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { VocabSetCreateLauncher } from "@/components/vocab/VocabSetCreateLauncher";
import * as actions from "@/app/admin/vocab/actions";
import type { Profile, VocabFolder, VocabSet } from "@/types/database";

interface PageProps {
  params: Promise<{ folderId: string }>;
}

export default async function AdminVocabFolderPage({ params }: PageProps) {
  const { folderId } = await params;
  const supabase = await createClient();

  const [{ data: folder }, { data: sets }, { data: teachers }, { data: itemRows }] =
    await Promise.all([
      supabase.from("vocab_folders").select("*").eq("id", folderId).single(),
      supabase
        .from("vocab_sets")
        .select("*, teacher:profiles!vocab_sets_teacher_id_fkey(id, name)")
        .eq("folder_id", folderId)
        .order("created_at", { ascending: false }),
      supabase
        .from("profiles")
        .select("*")
        .eq("role", "teacher")
        .eq("is_active", true)
        .order("name"),
      supabase.from("vocab_items").select("set_id"),
    ]);

  if (!folder) notFound();

  const itemCountBySet = new Map<string, number>();
  for (const row of itemRows ?? []) {
    itemCountBySet.set(
      row.set_id,
      (itemCountBySet.get(row.set_id) ?? 0) + 1
    );
  }

  const setList = (sets ?? []) as (VocabSet & {
    teacher: { id: string; name: string } | null;
  })[];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <Link
            href="/admin/vocab"
            className="text-sm text-brand-600 hover:underline"
          >
            ← 전체 보기
          </Link>
          <h1 className="mt-2 text-xl font-semibold text-slate-900">
            {(folder as VocabFolder).name}
          </h1>
          <p className="text-sm text-slate-500">
            이 폴더의 단어장 {setList.length}개
          </p>
        </div>
        <VocabSetCreateLauncher
          role="admin"
          folderId={folderId}
          teachers={(teachers ?? []) as Profile[]}
          basePath="/admin/vocab"
          onCreate={actions.createVocabSet}
        />
      </div>

      <div className="ui-table-wrap">
        <table className="ui-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>담당 강사</th>
              <th>단어 수</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {setList.length === 0 ? (
              <tr>
                <td colSpan={4} className="py-8 text-center text-slate-500">
                  이 폴더에 단어장이 없습니다. 단어세트를 만들어 주세요.
                </td>
              </tr>
            ) : (
              setList.map((set) => (
                <tr key={set.id}>
                  <td className="font-medium text-slate-900">{set.title}</td>
                  <td>{set.teacher?.name ?? "—"}</td>
                  <td>{itemCountBySet.get(set.id) ?? 0}</td>
                  <td>
                    <Link
                      href={`/admin/vocab/set/${set.id}`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      단어 입력
                    </Link>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
