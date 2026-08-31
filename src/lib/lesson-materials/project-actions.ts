"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/vocab/actions-shared";
import {
  defaultProjectTitle,
  mergeProjectContent,
  parseProjectContent,
  type LessonMaterialProjectContent,
} from "@/lib/lesson-materials/project-content";
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

export async function createLessonMaterialProject(
  role: Role,
  input: {
    title?: string;
    sourcePassage?: string;
    lessonLabel?: string;
    folderId?: string | null;
    teacherId?: string;
  }
): Promise<ActionResult & { projectId?: string }> {
  const { profile, error } = await requireRole(role);
  if (error) return error;

  const academyId = profile!.academy_id;
  if (!academyId) {
    return actionError(
      "소속 학원 정보가 없습니다. EngCore Admin에서 학원에 연결해 주세요."
    );
  }

  const sourcePassage = input.sourcePassage?.trim() ?? "";
  const title =
    input.title?.trim() ||
    (sourcePassage ? defaultProjectTitle(sourcePassage) : "새 수업자료");
  const folderId = input.folderId?.trim() || null;

  const supabase = await createClient();
  const { data, error: insertError } = await supabase
    .from("lesson_material_projects")
    .insert({
      title,
      lesson_label: input.lessonLabel?.trim() || null,
      source_passage: sourcePassage || null,
      folder_id: folderId,
      teacher_id: role === "teacher" ? profile!.id : input.teacherId || null,
      created_by: profile!.id,
      academy_id: academyId,
      content: {},
    })
    .select("id")
    .single();

  if (insertError) return actionError(insertError.message);

  revalidateLessonMaterialPaths(role, { folderId: folderId ?? undefined, projectId: data.id });
  return {
    ...actionSuccess("수업자료가 생성되었습니다."),
    projectId: data.id,
  };
}

export async function updateLessonMaterialProject(
  role: Role,
  projectId: string,
  input: {
    title?: string;
    lessonLabel?: string;
    sourcePassage?: string;
    folderId?: string | null;
    contentPatch?: Partial<LessonMaterialProjectContent>;
  }
): Promise<ActionResult> {
  const { error } = await requireRole(role);
  if (error) return error;

  const supabase = await createClient();

  const updates: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };

  if (input.title !== undefined) {
    const title = input.title.trim();
    if (!title) return actionError("제목을 입력해 주세요.");
    updates.title = title;
  }
  if (input.lessonLabel !== undefined) {
    updates.lesson_label = input.lessonLabel.trim() || null;
  }
  if (input.sourcePassage !== undefined) {
    updates.source_passage = input.sourcePassage.trim() || null;
  }
  if (input.folderId !== undefined) {
    updates.folder_id = input.folderId?.trim() || null;
  }

  if (input.contentPatch) {
    const { data: row, error: fetchError } = await supabase
      .from("lesson_material_projects")
      .select("content")
      .eq("id", projectId)
      .maybeSingle();

    if (fetchError) return actionError(fetchError.message);
    if (!row) return actionError("자료를 찾을 수 없습니다.");

    const merged = mergeProjectContent(
      parseProjectContent(row.content),
      input.contentPatch
    );
    updates.content = merged;
  }

  const { data: updated, error: updateError } = await supabase
    .from("lesson_material_projects")
    .update(updates)
    .eq("id", projectId)
    .select("folder_id")
    .single();

  if (updateError) return actionError(updateError.message);

  revalidateLessonMaterialPaths(role, {
    folderId: (updated.folder_id as string | null) ?? undefined,
    projectId,
  });
  return actionSuccess("저장되었습니다.");
}

export async function deleteLessonMaterialProject(
  role: Role,
  projectId: string
): Promise<ActionResult> {
  const { error } = await requireRole(role);
  if (error) return error;

  const supabase = await createClient();
  const { data: row } = await supabase
    .from("lesson_material_projects")
    .select("folder_id")
    .eq("id", projectId)
    .maybeSingle();

  const { error: deleteError } = await supabase
    .from("lesson_material_projects")
    .delete()
    .eq("id", projectId);

  if (deleteError) return actionError(deleteError.message);

  revalidateLessonMaterialPaths(role, {
    folderId: (row?.folder_id as string | null) ?? undefined,
  });
  return actionSuccess("자료가 삭제되었습니다.");
}
