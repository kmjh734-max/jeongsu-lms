"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  defaultDocumentName,
  uniqueDocumentName,
  type LessonMaterialDocumentKind,
} from "@/lib/lesson-materials/documents";

type Role = "admin" | "teacher";
type Fail = { ok: false; message: string };

const KINDS = new Set<LessonMaterialDocumentKind>(["lesson_pack", "analysis_report", "workbook"]);
const NAME_MAX = 80;

async function requireRole(role: Role) {
  const profile = await getCurrentProfile();
  if (!profile) return { profile: null, error: "로그인이 필요합니다." };
  if (profile.role !== role) return { profile: null, error: "권한이 없습니다." };
  if (role === "teacher" && profile.is_active === false) {
    return { profile: null, error: "비활성화된 계정입니다." };
  }
  if (!profile.academy_id) return { profile: null, error: "소속 학원 정보가 없습니다." };
  return { profile, error: null as null };
}

function cleanName(name: string | null | undefined): string {
  return String(name ?? "").replace(/\s+/g, " ").trim().slice(0, NAME_MAX);
}

/**
 * 지문자료에서 수업용 자료·분석서·워크북을 만들 때 파일 하나를 만든다.
 * 이름을 주지 않으면 수업용자료_0911처럼 짓고, 겹치면 -2, -3을 붙인다.
 */
export async function createLessonMaterialDocument(
  role: Role,
  input: {
    kind: LessonMaterialDocumentKind;
    projectIds: string[];
    name?: string | null;
    sourceQuery?: string | null;
  }
): Promise<{ ok: true; id: string; name: string } | Fail> {
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };
  if (!KINDS.has(input.kind)) return { ok: false, message: "알 수 없는 자료 종류입니다." };
  const projectIds = [...new Set((input.projectIds ?? []).map((id) => id.trim()).filter(Boolean))];
  if (projectIds.length === 0) return { ok: false, message: "선택된 지문이 없습니다." };

  const supabase = await createClient();
  const base = cleanName(input.name) || defaultDocumentName(input.kind);
  const { data: same } = await supabase
    .from("lesson_material_documents")
    .select("name")
    .eq("academy_id", profile!.academy_id!)
    .eq("kind", input.kind)
    .is("deleted_at", null)
    .like("name", `${base.replace(/[%_\\]/g, (c) => `\\${c}`)}%`);
  const name = uniqueDocumentName(base, (same ?? []).map((row) => row.name as string));

  const { data, error: insertError } = await supabase
    .from("lesson_material_documents")
    .insert({
      kind: input.kind,
      name,
      project_ids: projectIds,
      source_query: input.sourceQuery ?? null,
      teacher_id: role === "teacher" ? profile!.id : null,
      created_by: profile!.id,
      academy_id: profile!.academy_id,
    })
    .select("id,name")
    .single();
  if (insertError || !data) {
    return { ok: false, message: insertError?.message ?? "파일을 만들지 못했습니다." };
  }
  revalidatePath(`/${role}/lesson-materials`);
  return { ok: true, id: data.id as string, name: data.name as string };
}

export async function renameLessonMaterialDocument(
  role: Role,
  input: { id: string; name: string }
): Promise<{ ok: true; name: string } | Fail> {
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };
  const name = cleanName(input.name);
  if (!name) return { ok: false, message: "이름을 입력해 주세요." };
  const supabase = await createClient();
  const { data, error: updateError } = await supabase
    .from("lesson_material_documents")
    .update({ name, updated_at: new Date().toISOString() })
    .eq("id", input.id)
    .eq("academy_id", profile!.academy_id!)
    .select("id")
    .maybeSingle();
  if (updateError) return { ok: false, message: updateError.message };
  if (!data) return { ok: false, message: "파일을 찾을 수 없습니다." };
  revalidatePath(`/${role}/lesson-materials`);
  return { ok: true, name };
}

export async function trashLessonMaterialDocument(
  role: Role,
  input: { id: string }
): Promise<{ ok: true } | Fail> {
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };
  const supabase = await createClient();
  const { error: updateError } = await supabase
    .from("lesson_material_documents")
    .update({ deleted_at: new Date().toISOString() })
    .eq("id", input.id)
    .eq("academy_id", profile!.academy_id!);
  if (updateError) return { ok: false, message: updateError.message };
  revalidatePath(`/${role}/lesson-materials`);
  return { ok: true };
}

/** 워크북 파일을 연다: 저장된 결과가 있으면 그것을, 없으면 만든 조건을 돌려준다. */
export async function getWorkbookDocument(
  role: Role,
  input: { id: string }
): Promise<
  | {
      ok: true;
      name: string;
      projectIds: string[];
      payload: unknown | null;
      sourceQuery: string | null;
    }
  | Fail
> {
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };
  const supabase = await createClient();
  const { data, error: readError } = await supabase
    .from("lesson_material_documents")
    .select("name,project_ids,payload,source_query,kind")
    .eq("id", input.id)
    .eq("academy_id", profile!.academy_id!)
    .is("deleted_at", null)
    .maybeSingle();
  if (readError) return { ok: false, message: readError.message };
  if (!data || data.kind !== "workbook") return { ok: false, message: "워크북 파일을 찾을 수 없습니다." };
  return {
    ok: true,
    name: data.name as string,
    projectIds: (data.project_ids as string[]) ?? [],
    payload: data.payload ?? null,
    sourceQuery: (data.source_query as string | null) ?? null,
  };
}
