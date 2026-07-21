import { createAdminClient } from "@/lib/supabase/admin";
import type { StudentReport } from "@/lib/reports/types";
import {
  getAcademyBranding,
  type AcademyBranding,
} from "@/lib/tenant/academy-branding";

export interface SharedReportPayload {
  report: StudentReport;
  parentMessage: string;
  aiReportText: string;
  expiresAt: string;
  studentName: string;
  academy: AcademyBranding;
}

export type SharedReportLookup =
  | { status: "ok"; payload: SharedReportPayload }
  | { status: "expired" }
  | { status: "not_found" };

export async function lookupSharedReport(
  token: string
): Promise<SharedReportLookup> {
  try {
    const admin = createAdminClient();
    const { data, error } = await admin
      .from("shared_reports")
      .select(
        "report_data, parent_message, ai_report_text, expires_at, student_id, academy_id"
      )
      .eq("token", token)
      .maybeSingle();

    if (error || !data) {
      return { status: "not_found" };
    }

    const expiresAt = data.expires_at as string;
    if (new Date(expiresAt).getTime() < Date.now()) {
      return { status: "expired" };
    }

    const { data: student } = await admin
      .from("profiles")
      .select("name, academy_id")
      .eq("id", data.student_id as string)
      .maybeSingle();

    const academyId =
      (data.academy_id as string | null) ??
      (student?.academy_id as string | null) ??
      null;
    const academy = await getAcademyBranding(academyId);

    return {
      status: "ok",
      payload: {
        report: data.report_data as StudentReport,
        parentMessage: (data.parent_message as string) ?? "",
        aiReportText: (data.ai_report_text as string) ?? "",
        expiresAt,
        studentName: (student?.name as string) ?? "학생",
        academy,
      },
    };
  } catch {
    return { status: "not_found" };
  }
}

/** @deprecated lookupSharedReport 사용 권장 */
export async function getSharedReportByToken(
  token: string
): Promise<SharedReportPayload | null> {
  const result = await lookupSharedReport(token);
  if (result.status === "ok") return result.payload;
  return null;
}
