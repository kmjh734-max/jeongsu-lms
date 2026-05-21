import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabSetCreateLauncher } from "@/components/vocab/VocabSetCreateLauncher";
import { PageHeader } from "@/components/ui/PageHeader";
import * as actions from "@/app/teacher/vocab/actions";
import type { VocabSet } from "@/types/database";

export default async function TeacherVocabPage() {
  const profile = await getCurrentProfile();
  const supabase = await createClient();
  const teacherId = profile!.id;

  const [{ data: sets }, { data: itemRows }] = await Promise.all([
    supabase
      .from("vocab_sets")
      .select("*")
      .or(`teacher_id.eq.${teacherId},created_by.eq.${teacherId}`)
      .order("created_at", { ascending: false }),
    supabase.from("vocab_items").select("set_id"),
  ]);

  const itemCountBySet = new Map<string, number>();
  for (const row of itemRows ?? []) {
    itemCountBySet.set(
      row.set_id,
      (itemCountBySet.get(row.set_id) ?? 0) + 1
    );
  }

  const setList = (sets ?? []) as VocabSet[];

  return (
    <div className="space-y-8">
      <PageHeader
        title="단어학습"
        description="단어장을 만들고 담당 학생·반에 배정합니다."
        action={
          <VocabSetCreateLauncher
            role="teacher"
            basePath="/teacher/vocab"
            onCreate={actions.createVocabSet}
          />
        }
      />

      <div className="ui-table-wrap">
        <table className="ui-table">
          <thead>
            <tr>
              <th>제목</th>
              <th>단어 수</th>
              <th>관리</th>
            </tr>
          </thead>
          <tbody>
            {setList.length === 0 ? (
              <tr>
                <td colSpan={3} className="py-8 text-center text-slate-500">
                  만든 단어장이 없습니다. 위에서 단어세트를 생성해 주세요.
                </td>
              </tr>
            ) : (
              setList.map((set) => (
                <tr key={set.id}>
                  <td className="font-medium">{set.title}</td>
                  <td>{itemCountBySet.get(set.id) ?? 0}</td>
                  <td>
                    <Link
                      href={`/teacher/vocab/${set.id}`}
                      className="text-sm font-medium text-brand-600 hover:underline"
                    >
                      단어 입력 · 배정
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
