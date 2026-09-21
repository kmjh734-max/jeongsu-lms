"use server";

import { revalidatePath } from "next/cache";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { createStudyPlan, saveStudyPlanRows, type PlanRow } from "@/lib/study-plan";
import { isStudyPlanEnabled } from "@/lib/study-plan/access";

type Result = { ok: boolean; message: string };

async function staff() {
  const profile = await getCurrentProfile();
  if (!profile || !["admin", "teacher"].includes(profile.role) || !profile.academy_id) return null;
  if (!(await isStudyPlanEnabled(profile.academy_id))) return null;
  return profile;
}

/** 이 학생의 그 달 일정표를 만든다(지난달이 있으면 영역·교재를 물려받는다) */
export async function createPlanAction(input: {
  studentId: string;
  year: number;
  month: number;
  sessionsPerWeek: number;
}): Promise<Result> {
  const profile = await staff();
  if (!profile) return { ok: false, message: "권한이 없어요." };
  const admin = createAdminClient();

  const { data: student } = await admin
    .from("profiles")
    .select("id, academy_id")
    .eq("id", input.studentId)
    .maybeSingle();
  if (!student || student.academy_id !== profile.academy_id) {
    return { ok: false, message: "우리 학원 학생이 아니에요." };
  }

  const prevMonth = input.month === 1 ? 12 : input.month - 1;
  const prevYear = input.month === 1 ? input.year - 1 : input.year;
  try {
    await createStudyPlan(admin, {
      academyId: profile.academy_id as string,
      studentId: input.studentId,
      year: input.year,
      month: input.month,
      sessionsPerWeek: input.sessionsPerWeek,
      teacherId: profile.id,
      createdBy: profile.id,
      copyFrom: { year: prevYear, month: prevMonth },
    });
  } catch (e) {
    return { ok: false, message: e instanceof Error ? e.message : "만들지 못했어요." };
  }
  revalidatePath("/admin/study-plans");
  return { ok: true, message: "일정표를 만들었어요." };
}

/** 표 저장 */
export async function savePlanAction(input: {
  planId: string;
  sessionsPerWeek: number;
  rows: Array<Omit<PlanRow, "id">>;
  sessionDates?: Record<string, string[]>;
}): Promise<Result> {
  const profile = await staff();
  if (!profile) return { ok: false, message: "권한이 없어요." };
  const admin = createAdminClient();

  const { data: plan } = await admin
    .from("study_plans")
    .select("id, academy_id")
    .eq("id", input.planId)
    .maybeSingle();
  if (!plan || plan.academy_id !== profile.academy_id) {
    return { ok: false, message: "우리 학원 일정표가 아니에요." };
  }

  await saveStudyPlanRows(admin, input.planId, input.sessionsPerWeek, input.rows, input.sessionDates);
  revalidatePath("/admin/study-plans");
  return { ok: true, message: "저장했어요." };
}
