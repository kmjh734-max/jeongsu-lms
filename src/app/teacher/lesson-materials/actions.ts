"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { actionError, actionSuccess, type ActionResult } from "@/lib/vocab/actions-shared";
import {
  generateLessonMaterialsOrganizationDraft,
  type LessonMaterialAnalysisCard,
} from "@/lib/lesson-materials/generate-organization";
import { generateLessonMaterialComicIllustration } from "@/lib/lesson-materials/generate-illustration";

type PassageInput = { english: string; korean?: string };

function snippetTitle(text: string) {
  const first = text.trim().split(/\r?\n/)[0]?.trim() ?? "";
  if (!first) return "새 자료";
  const s = first.slice(0, 60);
  return s.length < first.length ? `${s}…` : s;
}

export async function saveLessonMaterialsFromWizard(input: {
  items: PassageInput[];
  projectTitle?: string | null;
  analysisCards?: LessonMaterialAnalysisCard[];
  illustrationPrompt?: string | null;
  illustrationUrl?: string | null;
  illustrationCaptions?: string[] | null;
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

  const projectTitle =
    input.projectTitle?.trim() || snippetTitle(items[0]!.english);

  const { data: projectInsert, error: projectInsertErr } = await supabase
    .from("lesson_material_projects")
    .insert({
      folder_id: folderId ?? null,
      title: projectTitle,
      teacher_id: profile.id,
      created_by: profile.id,
      academy_id: academyId,
      order_index: 0,
      analysis_json: input.analysisCards?.length ? input.analysisCards : null,
      illustration_prompt: input.illustrationPrompt?.trim()
        ? input.illustrationPrompt
        : null,
      illustration_url: input.illustrationUrl?.trim()
        ? input.illustrationUrl
        : null,
      illustration_captions: input.illustrationCaptions?.length
        ? input.illustrationCaptions
        : null,
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

export async function generateLessonMaterialsOrganizationDraftAction(input: {
  items: PassageInput[];
}): Promise<
  | {
      ok: true;
      passageTitle: string;
      analysisCards: LessonMaterialAnalysisCard[];
      illustrationPrompt: string;
      comicCaptions: string[];
    }
  | { ok: false; message: string }
> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher") {
    return { ok: false, message: "강사 권한이 필요합니다." };
  }
  if (profile.is_active === false) {
    return { ok: false, message: "비활성화된 계정입니다." };
  }

  const items = (input.items ?? []).filter((it) => (it.english ?? "").trim().length > 0);
  if (items.length === 0) {
    return { ok: false, message: "분석할 지문이 없습니다." };
  }

  try {
    const draft = await generateLessonMaterialsOrganizationDraft({ items });
    return {
      ok: true,
      passageTitle: draft.passageTitle,
      analysisCards: draft.analysisCards,
      illustrationPrompt: draft.illustrationPrompt,
      comicCaptions: draft.comicCaptions,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "AI 생성에 실패했습니다.",
    };
  }
}

export async function generateLessonMaterialsIllustrationAction(input: {
  illustrationPrompt: string;
  passageHint?: string;
  captions?: string[];
}): Promise<{ ok: true; url: string; prompt: string } | { ok: false; message: string }> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher") {
    return { ok: false, message: "강사 권한이 필요합니다." };
  }
  if (profile.is_active === false) {
    return { ok: false, message: "비활성화된 계정입니다." };
  }
  const academyId = profile.academy_id;
  if (!academyId) return { ok: false, message: "소속 학원 정보가 없습니다." };

  const prompt = input.illustrationPrompt?.trim() ?? "";
  if (prompt.length < 8) {
    return { ok: false, message: "삽화 프롬프트가 비어 있습니다." };
  }

  try {
    const out = await generateLessonMaterialComicIllustration({
      academyId,
      illustrationPrompt: prompt,
      passageHint: input.passageHint,
      captions: input.captions,
    });
    return { ok: true, url: out.url, prompt: out.prompt };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "삽화 생성에 실패했습니다.",
    };
  }
}

export async function updateLessonMaterialItemsKoreanText(input: {
  items: Array<{ id: string; korean: string }>;
}): Promise<ActionResult> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher") {
    return actionError("강사 권한이 필요합니다.");
  }
  if (profile.is_active === false) {
    return actionError("비활성화된 계정입니다.");
  }

  const supabase = await createClient();

  const itemIds = (input.items ?? []).map((row) => row.id);
  const { data: itemProjectRows } = await supabase
    .from("lesson_material_items")
    .select("project_id")
    .in("id", itemIds);

  const projectIds = Array.from(
    new Set((itemProjectRows ?? []).map((r) => r.project_id).filter(Boolean))
  );

  const updates = (input.items ?? []).map(async (row) => {
    const korean = row.korean?.trim() ?? "";
    const koreanText = korean.length > 0 ? korean : null;
    const { error } = await supabase
      .from("lesson_material_items")
      .update({ korean_text: koreanText })
      .eq("id", row.id);
    if (error) throw new Error(error.message);
  });

  try {
    await Promise.all(updates);
    for (const pid of projectIds) {
      revalidatePath(`/teacher/lesson-materials/project/${pid}`);
    }
    revalidatePath("/teacher/lesson-materials");
    return actionSuccess("한글 해석이 저장되었습니다.");
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "저장 실패");
  }
}

