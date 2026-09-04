"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import {
  generateAnalysisReport,
  type AnalysisReportData,
} from "@/lib/lesson-materials/generate-analysis-report";

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

export async function generateAndSaveAnalysisReportAction(
  role: Role,
  input: { projectId: string; headerLabel?: string }
): Promise<
  | { ok: true; report: AnalysisReportData }
  | { ok: false; message: string }
> {
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };

  const projectId = input.projectId?.trim();
  if (!projectId) return { ok: false, message: "프로젝트 ID가 없습니다." };

  const supabase = await createClient();
  let pq = supabase
    .from("lesson_material_projects")
    .select("id,title,analysis_report_json")
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
    .select("id,english_text,korean_text,order_index")
    .eq("project_id", projectId)
    .order("order_index", { ascending: true });
  if (iErr) return { ok: false, message: iErr.message };

  const prev = (project.analysis_report_json ?? {}) as Partial<AnalysisReportData>;
  const headerLabel =
    input.headerLabel?.trim() ||
    prev.headerLabel ||
    "26년도 1학기 중간고사 대비";

  try {
    const report = await generateAnalysisReport({
      title: project.title,
      headerLabel,
      lines: (items ?? []).map((it) => ({
        id: it.id,
        english: it.english_text,
        korean: it.korean_text,
      })),
    });

    const { error: uErr } = await supabase
      .from("lesson_material_projects")
      .update({
        analysis_report_json: report,
        updated_at: new Date().toISOString(),
      })
      .eq("id", projectId);
    if (uErr) return { ok: false, message: uErr.message };

    revalidatePath(`/${role}/lesson-materials`);
    revalidatePath(`/${role}/lesson-materials/analysis-report`);
    revalidatePath(`/${role}/lesson-materials/project/${projectId}`);
    return { ok: true, report };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "분석서 생성 실패",
    };
  }
}

export async function saveAnalysisReportAction(
  role: Role,
  input: { projectId: string; report: AnalysisReportData }
): Promise<{ ok: true } | { ok: false; message: string }> {
  const { profile, error } = await requireRole(role);
  if (error) return { ok: false, message: error };

  const projectId = input.projectId?.trim();
  if (!projectId) return { ok: false, message: "프로젝트 ID가 없습니다." };

  const supabase = await createClient();
  let pq = supabase
    .from("lesson_material_projects")
    .select("id")
    .eq("id", projectId)
    .eq("academy_id", profile!.academy_id!)
    .is("deleted_at", null);
  if (role === "teacher") {
    pq = pq.or(`teacher_id.eq.${profile!.id},created_by.eq.${profile!.id}`);
  }
  const { data: project } = await pq.maybeSingle();
  if (!project) return { ok: false, message: "프로젝트를 찾을 수 없습니다." };

  const report: AnalysisReportData = {
    ...input.report,
    updatedAt: new Date().toISOString(),
  };

  const { error: uErr } = await supabase
    .from("lesson_material_projects")
    .update({
      analysis_report_json: report,
      updated_at: new Date().toISOString(),
    })
    .eq("id", projectId);
  if (uErr) return { ok: false, message: uErr.message };

  revalidatePath(`/${role}/lesson-materials`);
  revalidatePath(`/${role}/lesson-materials/analysis-report`);
  return { ok: true };
}
