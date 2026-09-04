"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  generateLessonPackVocab,
  vocabNeedsAntonymRefresh,
  type LessonPackData,
  type LessonPackVocabItem,
} from "@/lib/lesson-materials/generate-lesson-pack";
import { generateLessonMaterialsOrganizationDraft } from "@/lib/lesson-materials/generate-organization";

type Role = "admin" | "teacher";

async function requireRole(role: Role) {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== role) {
    return { profile: null as null, error: "권한이 없습니다." };
  }
  if (role === "teacher" && profile.is_active === false) {
    return { profile: null as null, error: "비활성화된 계정입니다." };
  }
  if (!profile.academy_id) {
    return { profile: null as null, error: "소속 학원 정보가 없습니다." };
  }
  return { profile, error: null as null };
}

export async function generateAndSaveLessonPackVocabAction(
  role: Role,
  input: { projectId: string }
): Promise<
  | {
      ok: true;
      vocab: LessonPackVocabItem[];
      headerLabel: string;
      titleEn: string | null;
    }
  | { ok: false; message: string }
> {
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };

  const projectId = input.projectId?.trim();
  if (!projectId) return { ok: false, message: "프로젝트 ID가 없습니다." };

  const supabase = await createClient();
  let pq = supabase
    .from("lesson_material_projects")
    .select("id,title,title_en,lesson_pack_json")
    .eq("id", projectId)
    .eq("academy_id", profile!.academy_id!)
    .is("deleted_at", null);
  if (role === "teacher") {
    pq = pq.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }
  const { data: project, error: pErr } = await pq.maybeSingle();
  if (pErr || !project) {
    return { ok: false, message: "프로젝트를 찾을 수 없습니다." };
  }

  const { data: items, error: iErr } = await supabase
    .from("lesson_material_items")
    .select("english_text,korean_text,order_index")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });
  if (iErr) return { ok: false, message: iErr.message };

  const english = (items ?? []).map((it) => it.english_text).join("\n");
  const korean = (items ?? [])
    .map((it) => it.korean_text ?? "")
    .filter(Boolean)
    .join("\n");

  try {
    const vocab = await generateLessonPackVocab({
      englishPassage: english,
      koreanPassage: korean,
      title: project.title,
    });
    const prev = (project.lesson_pack_json ?? {}) as Partial<LessonPackData>;
    const pack: LessonPackData = {
      headerLabel: prev.headerLabel || "26년도 1학기 중간고사 대비",
      vocab,
      updatedAt: new Date().toISOString(),
    };

    let titleEn = ((project.title_en as string | null) ?? "").trim() || null;
    if (!titleEn && (items ?? []).length > 0) {
      try {
        const org = await generateLessonMaterialsOrganizationDraft({
          items: (items ?? []).map((it) => ({
            english: it.english_text,
            korean: it.korean_text,
          })),
        });
        titleEn = org.passageTitleEn?.trim() || null;
      } catch {
        // title backfill is best-effort; vocab save still proceeds
      }
    }

    const patch: Record<string, unknown> = {
      lesson_pack_json: pack,
      updated_at: new Date().toISOString(),
    };
    if (titleEn) patch.title_en = titleEn;

    const { error: uErr } = await supabase
      .from("lesson_material_projects")
      .update(patch)
      .eq("id", projectId);
    if (uErr) return { ok: false, message: uErr.message };

    revalidatePath(`/${role}/lesson-materials`);
    revalidatePath(`/${role}/lesson-materials/lesson-pack`);
    revalidatePath(`/${role}/lesson-materials/project/${projectId}`);
    return {
      ok: true,
      vocab,
      headerLabel: pack.headerLabel,
      titleEn: titleEn ?? ((project.title_en as string | null) ?? null),
    };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "어휘 생성 실패",
    };
  }
}

export { vocabNeedsAntonymRefresh };

/** Backfill English title only (does not regenerate vocab/analysis cards). */
export async function ensureLessonMaterialTitleEnAction(
  role: Role,
  input: { projectId: string }
): Promise<
  | { ok: true; titleEn: string; title: string }
  | { ok: false; message: string }
> {
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };

  const projectId = input.projectId?.trim();
  if (!projectId) return { ok: false, message: "프로젝트 ID가 없습니다." };

  const supabase = await createClient();
  let pq = supabase
    .from("lesson_material_projects")
    .select("id,title,title_en")
    .eq("id", projectId)
    .eq("academy_id", profile!.academy_id!)
    .is("deleted_at", null);
  if (role === "teacher") {
    pq = pq.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }
  const { data: project, error: pErr } = await pq.maybeSingle();
  if (pErr || !project) {
    return { ok: false, message: "프로젝트를 찾을 수 없습니다." };
  }

  const existingEn = ((project.title_en as string | null) ?? "").trim();
  if (existingEn) {
    return {
      ok: true,
      titleEn: existingEn,
      title: String(project.title ?? ""),
    };
  }

  const { data: items, error: iErr } = await supabase
    .from("lesson_material_items")
    .select("english_text,korean_text,order_index")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });
  if (iErr) return { ok: false, message: iErr.message };
  if (!items?.length) {
    return { ok: false, message: "지문 문장이 없어 제목을 만들 수 없습니다." };
  }

  try {
    const org = await generateLessonMaterialsOrganizationDraft({
      items: items.map((it) => ({
        english: it.english_text,
        korean: it.korean_text,
      })),
    });
    const titleEn = org.passageTitleEn?.trim() || "";
    if (!titleEn) {
      return { ok: false, message: "영어 제목을 만들지 못했습니다." };
    }

    const patch: Record<string, unknown> = {
      title_en: titleEn,
      updated_at: new Date().toISOString(),
    };
    // Keep existing Korean title; only fill if somehow empty
    const title = String(project.title ?? "").trim() || org.passageTitle;

    const { error: uErr } = await supabase
      .from("lesson_material_projects")
      .update(patch)
      .eq("id", projectId);
    if (uErr) return { ok: false, message: uErr.message };

    revalidatePath(`/${role}/lesson-materials`);
    revalidatePath(`/${role}/lesson-materials/lesson-pack`);
    revalidatePath(`/${role}/lesson-materials/project/${projectId}`);
    return { ok: true, titleEn, title };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "영어 제목 생성 실패",
    };
  }
}

export async function saveLessonPackAction(
  role: Role,
  input: {
    projectId: string;
    headerLabel?: string;
    vocab: LessonPackVocabItem[];
    title?: string | null;
    titleEn?: string | null;
    source?: string | null;
  }
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };

  const projectId = input.projectId?.trim();
  if (!projectId) return { ok: false, message: "프로젝트 ID가 없습니다." };

  const supabase = await createClient();
  const pack: LessonPackData = {
    headerLabel: (input.headerLabel ?? "26년도 1학기 중간고사 대비").trim(),
    vocab: input.vocab,
    updatedAt: new Date().toISOString(),
  };

  const patch: Record<string, unknown> = {
    lesson_pack_json: pack,
    updated_at: new Date().toISOString(),
  };
  if (input.title !== undefined) {
    const t = input.title?.trim();
    if (t) patch.title = t;
  }
  if (input.titleEn !== undefined) {
    patch.title_en = input.titleEn?.trim() || null;
  }
  if (input.source !== undefined) {
    patch.source = input.source?.trim() || null;
  }

  let q = supabase
    .from("lesson_material_projects")
    .update(patch)
    .eq("id", projectId)
    .eq("academy_id", profile!.academy_id!);
  if (role === "teacher") {
    q = q.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }
  const { error: uErr } = await q;
  if (uErr) return { ok: false, message: uErr.message };

  revalidatePath(`/${role}/lesson-materials/lesson-pack`);
  revalidatePath(`/${role}/lesson-materials/project/${projectId}`);
  revalidatePath(`/${role}/lesson-materials`);
  return { ok: true };
}

export async function updateLessonMaterialProjectMeta(
  role: Role,
  input: {
    projectId: string;
    title?: string;
    titleEn?: string | null;
    source?: string | null;
  }
): Promise<{ ok: true; message: string } | { ok: false; message: string }> {
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };

  const projectId = input.projectId?.trim();
  if (!projectId) return { ok: false, message: "프로젝트 ID가 없습니다." };

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

  const supabase = await createClient();
  let q = supabase
    .from("lesson_material_projects")
    .update(patch)
    .eq("id", projectId)
    .eq("academy_id", profile!.academy_id!);
  if (role === "teacher") {
    q = q.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }
  const { error: uErr } = await q;
  if (uErr) return { ok: false, message: uErr.message };

  revalidatePath(`/${role}/lesson-materials`);
  revalidatePath(`/${role}/lesson-materials/project/${projectId}`);
  revalidatePath(`/${role}/lesson-materials/lesson-pack`);
  return { ok: true, message: "출처·영어 제목을 저장했습니다." };
}
