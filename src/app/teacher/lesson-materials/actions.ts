"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { actionError, actionSuccess, type ActionResult } from "@/lib/vocab/actions-shared";

type PassageInput = { english: string; korean?: string };

function snippetTitle(text: string) {
  const first = text.trim().split(/\r?\n/)[0]?.trim() ?? "";
  if (!first) return "새 자료";
  const s = first.slice(0, 60);
  return s.length < first.length ? `${s}…` : s;
}

export async function saveLessonMaterialsFromWizard(input: {
  items: PassageInput[];
}): Promise<ActionResult & { projectId?: string }> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher") {
    return actionError("강사 권한이 필요합니다.");
  }
  if (profile.is_active === false) {
    return actionError("비활성화된 계정입니다.");
  }

  const academyId = profile.academy_id;
  if (!academyId) return actionError("소속 학원 정보가 없습니다.");

  const items = (input.items ?? [])
    .map((it) => ({
      english: it.english?.trim() ?? "",
      korean: it.korean?.trim() ?? "",
    }))
    .filter((it) => it.english.length > 0);

  if (items.length === 0) return actionError("저장할 지문이 없습니다.");

  const supabase = await createClient();

  const folderName = "기본 폴더";
  const { data: folderRow, error: folderSelectErr } = await supabase
    .from("lesson_material_folders")
    .select("id")
    .eq("name", folderName)
    .eq("created_by", profile.id)
    .maybeSingle();
  if (folderSelectErr) return actionError(folderSelectErr.message);

  let folderId = folderRow?.id as string | undefined;
  if (!folderId) {
    const { data: folderInsert, error: folderInsertErr } = await supabase
      .from("lesson_material_folders")
      .insert({
        name: folderName,
        teacher_id: profile.id,
        created_by: profile.id,
        academy_id: academyId,
      })
      .select("id")
      .single();
    if (folderInsertErr) return actionError(folderInsertErr.message);
    folderId = folderInsert?.id as string | undefined;
  }

  const projectTitle = snippetTitle(items[0]!.english);

  const { data: projectInsert, error: projectInsertErr } = await supabase
    .from("lesson_material_projects")
    .insert({
      folder_id: folderId ?? null,
      title: projectTitle,
      teacher_id: profile.id,
      created_by: profile.id,
      academy_id: academyId,
      order_index: 0,
    })
    .select("id")
    .single();
  if (projectInsertErr) return actionError(projectInsertErr.message);

  const projectId = projectInsert?.id as string | undefined;
  if (!projectId) return actionError("프로젝트 생성에 실패했습니다.");

  const rows = items.map((it, idx) => ({
    project_id: projectId,
    label: `문장 ${idx + 1}`,
    title: snippetTitle(it.english),
    english_text: it.english,
    korean_text: it.korean.length > 0 ? it.korean : null,
    order_index: idx,
    academy_id: academyId,
  }));

  const { error: itemsInsertErr } = await supabase
    .from("lesson_material_items")
    .insert(rows);
  if (itemsInsertErr) return actionError(itemsInsertErr.message);

  revalidatePath("/teacher/lesson-materials");

  return {
    ...actionSuccess("자료가 저장되었습니다."),
    projectId,
  };
}

