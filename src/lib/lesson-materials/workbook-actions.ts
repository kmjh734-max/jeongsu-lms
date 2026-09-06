"use server";

import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { generateWorkbookTf } from "@/lib/lesson-materials/generate-workbook-tf";
import {
  DEFAULT_WORKBOOK_TF_OPTIONS,
  clampTfCount,
  defaultWorkbookTitle,
  type WorkbookData,
  type WorkbookTfOptions,
  type WorkbookTypeId,
} from "@/lib/lesson-materials/workbook-types";

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

export async function generateWorkbookAction(
  role: Role,
  input: {
    projectIds: string[];
    selectedTypes: WorkbookTypeId[];
    tfOptions?: Partial<WorkbookTfOptions>;
    title?: string;
  }
): Promise<
  { ok: true; workbook: WorkbookData } | { ok: false; message: string }
> {
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };

  const ids = (input.projectIds ?? []).map((s) => s.trim()).filter(Boolean);
  if (ids.length === 0) return { ok: false, message: "선택된 자료가 없습니다." };

  const types = input.selectedTypes ?? [];
  if (!types.includes("tf")) {
    return {
      ok: false,
      message: "현재는 T/F 문제만 생성할 수 있습니다.",
    };
  }
  if (types.some((t) => t !== "tf")) {
    return {
      ok: false,
      message: "준비 중인 유형이 포함되어 있습니다. T/F만 선택해 주세요.",
    };
  }

  const tfOptions: WorkbookTfOptions = {
    count: clampTfCount(
      input.tfOptions?.count ?? DEFAULT_WORKBOOK_TF_OPTIONS.count
    ),
    language:
      input.tfOptions?.language === "ko"
        ? "ko"
        : DEFAULT_WORKBOOK_TF_OPTIONS.language,
    difficulty:
      input.tfOptions?.difficulty === "hard"
        ? "hard"
        : DEFAULT_WORKBOOK_TF_OPTIONS.difficulty,
  };

  const supabase = await createClient();
  let pq = supabase
    .from("lesson_material_projects")
    .select("id,title,source,deleted_at")
    .in("id", ids)
    .eq("academy_id", profile!.academy_id!)
    .is("deleted_at", null);
  if (role === "teacher") {
    pq = pq.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }
  const { data: projects, error: pErr } = await pq;
  if (pErr) return { ok: false, message: pErr.message };

  const byId = new Map((projects ?? []).map((p) => [p.id, p] as const));
  const ordered = ids.map((id) => byId.get(id)).filter(Boolean);
  if (ordered.length === 0) {
    return { ok: false, message: "프로젝트를 찾을 수 없습니다." };
  }

  const passages: Array<{
    projectId: string;
    title: string;
    source: string | null;
    englishLines: string[];
  }> = [];

  for (const p of ordered) {
    const { data: items, error: iErr } = await supabase
      .from("lesson_material_items")
      .select("english_text,order_index")
      .eq("project_id", p!.id)
      .order("order_index", { ascending: true });
    if (iErr) return { ok: false, message: iErr.message };
    passages.push({
      projectId: p!.id,
      title: p!.title,
      source: (p!.source as string | null) ?? null,
      englishLines: (items ?? []).map((it) => String(it.english_text ?? "")),
    });
  }

  try {
    const workbook = await generateWorkbookTf({
      title: input.title?.trim() || defaultWorkbookTitle(),
      passages,
      options: tfOptions,
    });
    return { ok: true, workbook };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "워크북 생성 실패",
    };
  }
}
