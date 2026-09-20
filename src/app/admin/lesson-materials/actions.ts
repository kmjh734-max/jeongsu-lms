"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { nextOrderIndexInFolder } from "@/lib/lesson-materials/project-order";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { actionError, actionSuccess, type ActionResult } from "@/lib/vocab/actions-shared";
import {
  generateLessonMaterialsOrganizationDraft,
  type LessonMaterialAnalysisCard,
} from "@/lib/lesson-materials/generate-organization";
import { generateLessonMaterialComicIllustration } from "@/lib/lesson-materials/generate-illustration";
import {
  debitLessonCredits,
  LESSON_CREDIT_FEATURES,
  lessonCreditShortfall,
} from "@/lib/credits/lesson-credits";

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
  projectTitleEn?: string | null;
  projectSource?: string | null;
  analysisCards?: LessonMaterialAnalysisCard[];
  illustrationPrompt?: string | null;
  illustrationUrl?: string | null;
  illustrationCaptions?: string[] | null;
  /** 넣을 폴더 id. 비어 있거나 "unfiled"면 미분류. */
  folderId?: string | null;
}): Promise<ActionResult & { projectId?: string }> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return actionError("관리자 권한이 필요합니다.");
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

  /*
   * 자료함에서 폴더를 고른 채 "새 자료 추가"를 눌렀으면 그 폴더에 넣는다.
   * 고른 폴더가 없으면 미분류에 둔다(선생님 지적 2026-09-20: 기본 폴더를 만들지 말 것).
   */
  const wantedFolder = input.folderId?.trim() || null;
  let folderId: string | undefined;
  if (wantedFolder && wantedFolder !== "unfiled") {
    const { data: chosen } = await supabase
      .from("lesson_material_folders")
      .select("id")
      .eq("id", wantedFolder)
      .eq("academy_id", academyId)
      .maybeSingle();
    folderId = (chosen?.id as string | undefined) ?? undefined;
  }

  const projectTitle =
    input.projectTitle?.trim() || snippetTitle(items[0]!.english);
  const projectTitleEn = input.projectTitleEn?.trim() || null;
  const projectSource = input.projectSource?.trim() || null;

  // 새 지문은 그 폴더 맨 뒤에 붙인다(project-order.ts).
  const orderIndex = await nextOrderIndexInFolder(supabase, academyId, folderId ?? null);

  const { data: projectInsert, error: projectInsertErr } = await supabase
    .from("lesson_material_projects")
    .insert({
      folder_id: folderId ?? null,
      title: projectTitle,
      title_en: projectTitleEn,
      source: projectSource,
      teacher_id: null,
      created_by: profile.id,
      academy_id: academyId,
      order_index: orderIndex,
      analysis_json: input.analysisCards?.length
        ? input.analysisCards
        : null,
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

  // 저장한 지문이 자료함에 바로 보이도록 하위 경로까지 새로 고친다(첫 저장 뒤 목록이 옛것으로 보였다)
  revalidatePath("/admin/lesson-materials", "layout");

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
      passageTitleEn: string;
      analysisCards: LessonMaterialAnalysisCard[];
      illustrationPrompt: string;
      comicCaptions: string[];
    }
  | { ok: false; message: string }
> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return { ok: false, message: "관리자 권한이 필요합니다." };
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
      passageTitleEn: draft.passageTitleEn,
      analysisCards: draft.analysisCards,
      illustrationPrompt: draft.illustrationPrompt,
      comicCaptions: draft.comicCaptions,
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "생성에 실패했습니다.",
    };
  }
}

export async function generateLessonMaterialsIllustrationAction(input: {
  illustrationPrompt: string;
  passageHint?: string;
  captions?: string[];
}): Promise<{ ok: true; url: string; prompt: string } | { ok: false; message: string }> {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin") {
    return { ok: false, message: "관리자 권한이 필요합니다." };
  }
  const academyId = profile.academy_id;
  if (!academyId) return { ok: false, message: "소속 학원 정보가 없습니다." };

  const prompt = input.illustrationPrompt?.trim() ?? "";
  if (prompt.length < 8) {
    return { ok: false, message: "삽화 프롬프트가 비어 있습니다." };
  }

  // 화면은 /api/lesson-materials/illustration을 쓴다. 이 경로로 와도 같은 값을 받는다.
  const shortfall = await lessonCreditShortfall(academyId, LESSON_CREDIT_FEATURES.illustration);
  if (shortfall) return { ok: false, message: shortfall };

  try {
    const out = await generateLessonMaterialComicIllustration({
      academyId,
      illustrationPrompt: prompt,
      passageHint: input.passageHint,
      captions: input.captions,
      onImageProduced: async () => {
        await debitLessonCredits({
          academyId,
          actorId: profile.id,
          featureKey: LESSON_CREDIT_FEATURES.illustration,
          note: "지문 삽화",
        });
      },
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
  if (!profile || profile.role !== "admin") {
    return actionError("관리자 권한이 필요합니다.");
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
      revalidatePath(`/admin/lesson-materials/project/${pid}`);
    }
    revalidatePath("/admin/lesson-materials");
    return actionSuccess("한글 해석이 저장되었습니다.");
  } catch (err) {
    return actionError(err instanceof Error ? err.message : "저장 실패");
  }
}

