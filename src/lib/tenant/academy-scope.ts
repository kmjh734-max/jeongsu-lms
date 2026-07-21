/** 학원 관리자 API용 academy 스코프. super_admin은 제한 없음. */
export function staffAcademyScope(profile: {
  role: string;
  academy_id: string | null;
}): string | undefined {
  if (profile.role === "super_admin") return undefined;
  return profile.academy_id ?? undefined;
}
