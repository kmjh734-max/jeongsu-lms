"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/vocab/actions-shared";
import { revalidateLessonMaterialPaths } from "@/lib/lesson-materials/revalidate";

type Role = "admin" | "teacher";

async function requireRole(role: Role) {
  const profile = await getCurrentProfile();
  if (!profile) return { profile: null, error: actionError("로그인이 필요합니다.") };
  if (profile.role !== role) {
    return { profile: null, error: actionError("권한이 없습니다.") };
  }
  if (role === "teacher" && profile.is_active === false) {
    return { profile: null, error: actionError("비활성화된 계정입니다.") };
  }
  return { profile, error: null };
}

export async function createLessonMaterialFolder(
  role: Role,
  input: { name: string; teacherId?: string }
): Promise<ActionResult & { folderId?: string }> {
  const { profile, error } = await requireRole(role);
  if (error) return error;

  const name = input.name.trim();
  if (!name) return actionError("폴더 이름을 입력해 주세요.");

  const academyId = profile!.academy_id;
  if (!academyId) {
    return actionError(
      "소속 학원 정보가 없습니다. EngCore Admin에서 학원에 연결해 주세요."
    );
  }

  const supabase = await createClient();
  const { data, error: insertError } = await supabase
    .from("lesson_material_folders")
    .insert({
      name,
      teacher_id: role === "teacher" ? profile!.id : input.teacherId || null,
      created_by: profile!.id,
      academy_id: academyId,
    })
    .select("id")
    .single();

  if (insertError) return actionError(insertError.message);

  revalidateLessonMaterialPaths(role);
  return { ...actionSuccess("폴더가 생성되었습니다."), folderId: data.id };
}

export async function deleteLessonMaterialFolder(
  role: Role,
  folderId: string
): Promise<ActionResult> {
  const { profile, error } = await requireRole(role);
  if (error) return error;

  const supabase = await createClient();

  if (role === "teacher") {
    const { data: folder } = await supabase
      .from("lesson_material_folders")
      .select("id")
      .eq("id", folderId)
      .or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`)
      .maybeSingle();

    if (!folder) {
      return actionError("이 폴더를 삭제할 권한이 없습니다.");
    }
  }

  const { error: deleteError } = await supabase
    .from("lesson_material_folders")
    .delete()
    .eq("id", folderId);

  if (deleteError) return actionError(deleteError.message);

  revalidateLessonMaterialPaths(role);
  return actionSuccess(
    "폴더가 삭제되었습니다. 안의 자료는 미분류로 이동됩니다."
  );
}
