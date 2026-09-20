import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 학생 등록·수정에서 같이 받는 신상 정보.
 * 학습일정표·상담·문자 발송에 쓰려면 계정 만들 때 같이 받아 두어야 한다.
 */
export type StudentDetailsInput = {
  birthDate?: string | null;
  phone?: string | null;
  parentPhone?: string | null;
  school?: string | null;
  schoolGrade?: string | null;
  enrolledOn?: string | null;
  note?: string | null;
};

const text = (v: unknown) => {
  const s = String(v ?? "").trim();
  return s ? s : null;
};

/** 숫자만 남겨 010-1234-5678 꼴로 */
export function normalizePhone(v: unknown): string | null {
  const digits = String(v ?? "").replace(/\D/g, "");
  if (!digits) return null;
  if (digits.length === 11) return `${digits.slice(0, 3)}-${digits.slice(3, 7)}-${digits.slice(7)}`;
  if (digits.length === 10) return `${digits.slice(0, 3)}-${digits.slice(3, 6)}-${digits.slice(6)}`;
  return digits;
}

const date = (v: unknown) => {
  const s = String(v ?? "").trim();
  return /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : null;
};

export function pickStudentDetails(body: Record<string, unknown>): StudentDetailsInput {
  return {
    birthDate: date(body.birthDate),
    phone: normalizePhone(body.phone),
    parentPhone: normalizePhone(body.parentPhone),
    school: text(body.school),
    schoolGrade: text(body.schoolGrade),
    enrolledOn: date(body.enrolledOn),
    note: text(body.note),
  };
}

/** 빈 칸은 건드리지 않는다(등록 때 안 적은 것을 수정에서 지우지 않게) */
export async function saveStudentDetails(
  admin: SupabaseClient,
  studentId: string,
  details: StudentDetailsInput
): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (details.birthDate !== undefined) patch.birth_date = details.birthDate;
  if (details.phone !== undefined) patch.phone = details.phone;
  if (details.parentPhone !== undefined) patch.parent_phone = details.parentPhone;
  if (details.school !== undefined) patch.school = details.school;
  if (details.schoolGrade !== undefined) patch.school_grade = details.schoolGrade;
  if (details.enrolledOn !== undefined) patch.enrolled_on = details.enrolledOn;
  if (details.note !== undefined) patch.note = details.note;
  if (Object.keys(patch).length === 0) return;
  await admin.from("profiles").update(patch).eq("id", studentId);
}

export const STUDENT_DETAIL_COLUMNS =
  "birth_date, phone, parent_phone, school, school_grade, enrolled_on, note";
