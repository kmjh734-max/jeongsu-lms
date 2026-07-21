import { applyAcademyBrandingToReportHtml } from "@/lib/student-records/report-branding";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  getAcademyBranding,
  type AcademyBranding,
} from "@/lib/tenant/academy-branding";

export interface SharedStudentRecordPayload {
  studentName: string;
  html: string;
  generatedAt: string;
  expiresAt: string;
  academy: AcademyBranding;
}

export type SharedStudentRecordLookup =
  | { status: "ok"; payload: SharedStudentRecordPayload }
  | { status: "expired" }
  | { status: "not_found" };

export async function lookupSharedStudentRecord(
  token: string
): Promise<SharedStudentRecordLookup> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("shared_student_records")
      .select("student_name, html, generated_at, expires_at, academy_id, student_id")
      .eq("token", token)
      .maybeSingle();

    if (error || !data) {
      return { status: "not_found" };
    }

    const expiresAt = data.expires_at as string;
    if (new Date(expiresAt).getTime() < Date.now()) {
      return { status: "expired" };
    }

    let academyId = (data.academy_id as string | null) ?? null;
    if (!academyId && data.student_id) {
      const { data: student } = await admin
        .from("profiles")
        .select("academy_id")
        .eq("id", data.student_id as string)
        .maybeSingle();
      academyId = (student?.academy_id as string | null) ?? null;
    }

    const academy = await getAcademyBranding(academyId);

    return {
      status: "ok",
      payload: {
        studentName: (data.student_name as string) ?? "학생",
        html: applyAcademyBrandingToReportHtml(data.html as string, academy),
        generatedAt: data.generated_at as string,
        expiresAt,
        academy,
      },
    };
  } catch {
    return { status: "not_found" };
  }
}
