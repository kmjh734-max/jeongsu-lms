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

async function nextItemOrderIndex(
  supabase: Awaited<ReturnType<typeof createClient>>,
  projectId: string
) {
  const { data } = await supabase
    .from("lesson_material_items")
    .select("order_index")
    .eq("project_id", projectId)
    .order("order_index", { ascending: false })
    .limit(1)
    .maybeSingle();
  return ((data?.order_index as number | undefined) ?? -1) + 1;
}

export async function createLessonMaterialItem(
  role: Role,
  projectId: string,
  input: {
    title?: string;
    label?: string;
    summary?: string;
    sourcePassage?: string;
  }
): Promise<ActionResult & { itemId?: string }> {
  const { error } = await requireRole(role);
  if (error) return error;

  const passage = input.sourcePassage?.trim() ?? "";
  const title =
    input.title?.trim() ||
    (passage ? defaultProjectTitle(passage) : "새 지문");

  const supabase = await createClient();
  const orderIndex = await nextItemOrderIndex(supabase, projectId);

  const { data, error: insertError } = await supabase
    .from("lesson_material_items")
    .insert({
      project_id: projectId,
      title,
      label: input.label?.trim() || null,
      summary: input.summary?.trim() || null,
      source_passage: passage || null,
      order_index: orderIndex,
      content: {},
    })
    .select("id")
    .single();

  if (insertError) return actionError(insertError.message);

  await supabase
    .from("lesson_material_projects")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", projectId);

  revalidateLessonMaterialPaths(role, { projectId, itemId: data.id });
  return { ...actionSuccess("지문이 추가되었습니다."), itemId: data.id };
}

export async function updateLessonMaterialItem(
  role: Role,
  itemId: string,
  input: {
    title?: string;
    label?: string;
    summary?: string;
    sourcePassage?: string;
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
  if (input.label !== undefined) updates.label = input.label.trim() || null;
  if (input.summary !== undefined) updates.summary = input.summary.trim() || null;
  if (input.sourcePassage !== undefined) {
    updates.source_passage = input.sourcePassage.trim() || null;
  }

  if (input.contentPatch) {
    const { data: row, error: fetchError } = await supabase
      .from("lesson_material_items")
      .select("content")
      .eq("id", itemId)
      .maybeSingle();
    if (fetchError) return actionError(fetchError.message);
    if (!row) return actionError("지문을 찾을 수 없습니다.");
    updates.content = mergeProjectContent(
      parseProjectContent(row.content),
      input.contentPatch
    );
  }

  const { data: updated, error: updateError } = await supabase
    .from("lesson_material_items")
    .update(updates)
    .eq("id", itemId)
    .select("project_id")
    .single();

  if (updateError) return actionError(updateError.message);

  await supabase
    .from("lesson_material_projects")
    .update({ updated_at: new Date().toISOString() })
    .eq("id", updated.project_id as string);

  revalidateLessonMaterialPaths(role, {
    projectId: updated.project_id as string,
    itemId,
  });
  return actionSuccess("저장되었습니다.");
}

export async function deleteLessonMaterialItems(
  role: Role,
  itemIds: string[]
): Promise<ActionResult> {
  const { error } = await requireRole(role);
  if (error) return error;
  if (itemIds.length === 0) return actionError("삭제할 항목을 선택해 주세요.");

  const supabase = await createClient();
  const { data: rows } = await supabase
    .from("lesson_material_items")
    .select("project_id")
    .in("id", itemIds)
    .limit(1);

  const projectId = rows?.[0]?.project_id as string | undefined;

  const { error: deleteError } = await supabase
    .from("lesson_material_items")
    .delete()
    .in("id", itemIds);

  if (deleteError) return actionError(deleteError.message);

  if (projectId) {
    await supabase
      .from("lesson_material_projects")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", projectId);
    revalidateLessonMaterialPaths(role, { projectId });
  }
  return actionSuccess(`${itemIds.length}개 지문을 삭제했습니다.`);
}
