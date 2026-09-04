"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  actionError,
  actionSuccess,
  type ActionResult,
} from "@/lib/vocab/actions-shared";

type Role = "admin" | "teacher";

function revalidateLibrary(role: Role) {
  revalidatePath(`/${role}/lesson-materials`);
}

async function requireRole(role: Role) {
  const profile = await getCurrentProfile();
  if (!profile) return { profile: null, error: actionError("로그인이 필요합니다.") };
  if (profile.role !== role) {
    return { profile: null, error: actionError("권한이 없습니다.") };
  }
  if (role === "teacher" && profile.is_active === false) {
    return { profile: null, error: actionError("비활성화된 계정입니다.") };
  }
  if (!profile.academy_id) {
    return { profile: null, error: actionError("소속 학원 정보가 없습니다.") };
  }
  return { profile, error: null as null };
}

export async function createLessonMaterialFolder(
  role: Role,
  input: { name: string; parentId?: string | null }
): Promise<ActionResult & { folderId?: string }> {
  const { profile, error } = await requireRole(role);
  if (error) return error;

  const name = input.name.trim();
  if (!name) return actionError("폴더 이름을 입력해 주세요.");
  if (name === "미분류" || name === "휴지통") {
    return actionError("예약된 폴더 이름은 사용할 수 없습니다.");
  }

  const parentId = input.parentId?.trim() || null;
  const supabase = await createClient();

  if (parentId) {
    const { data: parent } = await supabase
      .from("lesson_material_folders")
      .select("id")
      .eq("id", parentId)
      .eq("academy_id", profile!.academy_id!)
      .maybeSingle();
    if (!parent) return actionError("상위 폴더를 찾을 수 없습니다.");
  }

  const { data, error: insertError } = await supabase
    .from("lesson_material_folders")
    .insert({
      name,
      parent_id: parentId,
      teacher_id: role === "teacher" ? profile!.id : null,
      created_by: profile!.id,
      academy_id: profile!.academy_id,
      order_index: 0,
    })
    .select("id")
    .single();

  if (insertError) return actionError(insertError.message);
  revalidateLibrary(role);
  return { ...actionSuccess("폴더가 생성되었습니다."), folderId: data.id };
}

export async function renameLessonMaterialFolder(
  role: Role,
  input: { folderId: string; name: string }
): Promise<ActionResult> {
  const { profile, error } = await requireRole(role);
  if (error) return error;

  const name = input.name.trim();
  if (!name) return actionError("폴더 이름을 입력해 주세요.");
  if (name === "미분류" || name === "휴지통") {
    return actionError("예약된 폴더 이름은 사용할 수 없습니다.");
  }

  const supabase = await createClient();
  let q = supabase
    .from("lesson_material_folders")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", input.folderId)
    .eq("academy_id", profile!.academy_id!);

  if (role === "teacher") {
    q = q.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }

  const { error: updateError } = await q;
  if (updateError) return actionError(updateError.message);
  revalidateLibrary(role);
  return actionSuccess("폴더 이름을 수정했습니다.");
}

export async function deleteLessonMaterialFolder(
  role: Role,
  input: { folderId: string }
): Promise<ActionResult> {
  const { profile, error } = await requireRole(role);
  if (error) return error;

  const supabase = await createClient();
  let q = supabase
    .from("lesson_material_folders")
    .delete()
    .eq("id", input.folderId)
    .eq("academy_id", profile!.academy_id!);

  if (role === "teacher") {
    q = q.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }

  const { error: deleteError } = await q;
  if (deleteError) return actionError(deleteError.message);
  revalidateLibrary(role);
  return actionSuccess("폴더를 삭제했습니다. 하위 자료는 미분류로 이동합니다.");
}

export async function moveLessonMaterialProjects(
  role: Role,
  input: { projectIds: string[]; folderId: string | null }
): Promise<ActionResult> {
  const { profile, error } = await requireRole(role);
  if (error) return error;

  const ids = (input.projectIds ?? []).filter(Boolean);
  if (ids.length === 0) return actionError("이동할 자료를 선택해 주세요.");

  if (input.folderId) {
    const supabaseCheck = await createClient();
    const { data: folder } = await supabaseCheck
      .from("lesson_material_folders")
      .select("id")
      .eq("id", input.folderId)
      .maybeSingle();
    if (!folder) return actionError("대상 폴더를 찾을 수 없습니다.");
  }

  const supabase = await createClient();
  let q = supabase
    .from("lesson_material_projects")
    .update({
      folder_id: input.folderId,
      deleted_at: null,
      updated_at: new Date().toISOString(),
    })
    .in("id", ids)
    .eq("academy_id", profile!.academy_id!);

  if (role === "teacher") {
    q = q.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }

  const { error: updateError } = await q;
  if (updateError) return actionError(updateError.message);

  revalidateLibrary(role);
  return actionSuccess(`${ids.length}개 자료를 이동했습니다.`);
}

export async function trashLessonMaterialProjects(
  role: Role,
  input: { projectIds: string[] }
): Promise<ActionResult> {
  const { profile, error } = await requireRole(role);
  if (error) return error;

  const ids = (input.projectIds ?? []).filter(Boolean);
  if (ids.length === 0) return actionError("휴지통으로 보낼 자료를 선택해 주세요.");

  const supabase = await createClient();
  let q = supabase
    .from("lesson_material_projects")
    .update({
      deleted_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .in("id", ids)
    .eq("academy_id", profile!.academy_id!);

  if (role === "teacher") {
    q = q.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }

  const { error: updateError } = await q;
  if (updateError) return actionError(updateError.message);

  revalidateLibrary(role);
  return actionSuccess(`${ids.length}개 자료를 휴지통으로 보냈습니다.`);
}

export async function restoreLessonMaterialProjects(
  role: Role,
  input: { projectIds: string[]; folderId?: string | null }
): Promise<ActionResult> {
  const { profile, error } = await requireRole(role);
  if (error) return error;

  const ids = (input.projectIds ?? []).filter(Boolean);
  if (ids.length === 0) return actionError("복원할 자료를 선택해 주세요.");

  const supabase = await createClient();
  const patch: Record<string, unknown> = {
    deleted_at: null,
    updated_at: new Date().toISOString(),
  };
  if (input.folderId !== undefined) {
    patch.folder_id = input.folderId;
  }

  let q = supabase
    .from("lesson_material_projects")
    .update(patch)
    .in("id", ids)
    .eq("academy_id", profile!.academy_id!);

  if (role === "teacher") {
    q = q.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }

  const { error: updateError } = await q;
  if (updateError) return actionError(updateError.message);

  revalidateLibrary(role);
  return actionSuccess(`${ids.length}개 자료를 복원했습니다.`);
}

export async function permanentlyDeleteLessonMaterialProjects(
  role: Role,
  input: { projectIds: string[] }
): Promise<ActionResult> {
  const { profile, error } = await requireRole(role);
  if (error) return error;

  const ids = (input.projectIds ?? []).filter(Boolean);
  if (ids.length === 0) return actionError("삭제할 자료를 선택해 주세요.");

  const supabase = await createClient();
  let q = supabase
    .from("lesson_material_projects")
    .delete()
    .in("id", ids)
    .eq("academy_id", profile!.academy_id!)
    .not("deleted_at", "is", null);

  if (role === "teacher") {
    q = q.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }

  const { error: deleteError } = await q;
  if (deleteError) return actionError(deleteError.message);

  revalidateLibrary(role);
  return actionSuccess(`${ids.length}개 자료를 영구 삭제했습니다.`);
}

export async function copyLessonMaterialProjects(
  role: Role,
  input: { projectIds: string[]; folderId: string | null }
): Promise<ActionResult & { copied?: number }> {
  const { profile, error } = await requireRole(role);
  if (error) return error;

  const ids = (input.projectIds ?? []).filter(Boolean);
  if (ids.length === 0) return actionError("복사할 자료를 선택해 주세요.");

  const supabase = await createClient();

  if (input.folderId) {
    const { data: folder } = await supabase
      .from("lesson_material_folders")
      .select("id")
      .eq("id", input.folderId)
      .maybeSingle();
    if (!folder) return actionError("대상 폴더를 찾을 수 없습니다.");
  }

  let projectQuery = supabase
    .from("lesson_material_projects")
    .select(
      "id,title,title_en,source,analysis_json,illustration_prompt,illustration_url,illustration_captions,teacher_id,lesson_pack_json,analysis_report_json"
    )
    .in("id", ids)
    .eq("academy_id", profile!.academy_id!)
    .is("deleted_at", null);

  if (role === "teacher") {
    projectQuery = projectQuery.or(
      `teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`
    );
  }

  const { data: projects, error: projectsErr } = await projectQuery;
  if (projectsErr) return actionError(projectsErr.message);
  if (!projects?.length) return actionError("복사할 자료를 찾을 수 없습니다.");

  const { data: items, error: itemsErr } = await supabase
    .from("lesson_material_items")
    .select(
      "project_id,label,title,english_text,korean_text,order_index"
    )
    .in(
      "project_id",
      projects.map((p) => p.id)
    )
    .order("order_index", { ascending: true });
  if (itemsErr) return actionError(itemsErr.message);

  const itemsByProject = new Map<string, typeof items>();
  for (const it of items ?? []) {
    const list = itemsByProject.get(it.project_id) ?? [];
    list.push(it);
    itemsByProject.set(it.project_id, list);
  }

  let copied = 0;
  for (const src of projects) {
    const { data: inserted, error: insertErr } = await supabase
      .from("lesson_material_projects")
      .insert({
        folder_id: input.folderId,
        title: `${src.title} 복사본`,
        title_en: src.title_en ?? null,
        source: src.source ?? null,
        teacher_id:
          role === "teacher" ? profile!.id : (src.teacher_id ?? null),
        created_by: profile!.id,
        academy_id: profile!.academy_id,
        order_index: 0,
        analysis_json: src.analysis_json ?? null,
        illustration_prompt: src.illustration_prompt ?? null,
        illustration_url: src.illustration_url ?? null,
        illustration_captions: src.illustration_captions ?? null,
        lesson_pack_json: src.lesson_pack_json ?? null,
        analysis_report_json: src.analysis_report_json ?? null,
        deleted_at: null,
      })
      .select("id")
      .single();
    if (insertErr || !inserted?.id) {
      return actionError(insertErr?.message ?? "복사에 실패했습니다.");
    }

    const srcItems = itemsByProject.get(src.id) ?? [];
    if (srcItems.length > 0) {
      const rows = srcItems.map((it) => ({
        project_id: inserted.id,
        label: it.label,
        title: it.title,
        english_text: it.english_text,
        korean_text: it.korean_text,
        order_index: it.order_index,
        academy_id: profile!.academy_id,
      }));
      const { error: itemInsertErr } = await supabase
        .from("lesson_material_items")
        .insert(rows);
      if (itemInsertErr) return actionError(itemInsertErr.message);
    }
    copied += 1;
  }

  revalidateLibrary(role);
  return {
    ...actionSuccess(`${copied}개 자료를 복사했습니다.`),
    copied,
  };
}

export async function saveLessonMaterialProjectWorkspace(
  role: Role,
  input: {
    projectId: string;
    title?: string;
    titleEn?: string | null;
    source?: string | null;
    analysisCards?: Array<{ title: string; desc: string }> | null;
    illustrationPrompt?: string | null;
    illustrationUrl?: string | null;
    illustrationCaptions?: string[] | null;
    items?: Array<{ id: string; english: string; korean: string }>;
  }
): Promise<ActionResult> {
  const { profile, error } = await requireRole(role);
  if (error) return error;

  const projectId = input.projectId?.trim();
  if (!projectId) return actionError("프로젝트 ID가 없습니다.");

  const supabase = await createClient();

  let projectQ = supabase
    .from("lesson_material_projects")
    .select("id")
    .eq("id", projectId)
    .eq("academy_id", profile!.academy_id!);
  if (role === "teacher") {
    projectQ = projectQ.or(
      `teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`
    );
  }
  const { data: project } = await projectQ.maybeSingle();
  if (!project) return actionError("프로젝트를 찾을 수 없습니다.");

  const patch: Record<string, unknown> = {
    updated_at: new Date().toISOString(),
  };
  if (typeof input.title === "string") {
    const t = input.title.trim();
    if (t) patch.title = t;
  }
  if (input.titleEn !== undefined) {
    patch.title_en = input.titleEn?.trim() || null;
  }
  if (input.source !== undefined) {
    patch.source = input.source?.trim() || null;
  }
  if (input.analysisCards !== undefined) {
    patch.analysis_json = input.analysisCards?.length
      ? input.analysisCards
      : null;
  }
  if (input.illustrationPrompt !== undefined) {
    patch.illustration_prompt = input.illustrationPrompt?.trim() || null;
  }
  if (input.illustrationUrl !== undefined) {
    patch.illustration_url = input.illustrationUrl?.trim() || null;
  }
  if (input.illustrationCaptions !== undefined) {
    patch.illustration_captions = input.illustrationCaptions?.length
      ? input.illustrationCaptions
      : null;
  }

  const { error: updateErr } = await supabase
    .from("lesson_material_projects")
    .update(patch)
    .eq("id", projectId);
  if (updateErr) return actionError(updateErr.message);

  if (input.items?.length) {
    for (const row of input.items) {
      const { error: itemErr } = await supabase
        .from("lesson_material_items")
        .update({
          english_text: row.english.trim(),
          korean_text: row.korean.trim() || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", row.id)
        .eq("project_id", projectId);
      if (itemErr) return actionError(itemErr.message);
    }
  }

  revalidatePath(`/${role}/lesson-materials/project/${projectId}`);
  revalidateLibrary(role);
  return actionSuccess("저장되었습니다.");
}

export async function reorderLessonMaterialProjects(
  role: Role,
  input: { orderedIds: string[] }
): Promise<ActionResult> {
  const { profile, error } = await requireRole(role);
  if (error) return error;

  const orderedIds = input.orderedIds
    .map((id) => id.trim())
    .filter(Boolean);
  if (orderedIds.length === 0) {
    return actionError("순서 정보가 없습니다.");
  }

  const supabase = await createClient();

  for (let i = 0; i < orderedIds.length; i++) {
    const id = orderedIds[i]!;
    let q = supabase
      .from("lesson_material_projects")
      .update({ order_index: i })
      .eq("id", id)
      .eq("academy_id", profile!.academy_id!)
      .is("deleted_at", null);

    if (role === "teacher") {
      q = q.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
    }

    const { error: updateErr } = await q;
    if (updateErr) return actionError(updateErr.message);
  }

  revalidateLibrary(role);
  return actionSuccess("순서가 저장되었습니다.");
}
