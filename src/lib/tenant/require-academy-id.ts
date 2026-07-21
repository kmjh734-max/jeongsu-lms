import { NextResponse } from "next/server";

/** 스태프(admin/teacher) 프로필에서 학원 id 확보. 없으면 403 JSON. */
export function requireAcademyId(
  profile: { academy_id?: string | null; role?: string } | null | undefined
): { academyId: string } | { error: NextResponse } {
  const academyId = profile?.academy_id?.trim() || null;
  if (!academyId) {
    return {
      error: NextResponse.json(
        {
          ok: false,
          message:
            "소속 학원 정보가 없습니다. EngCore Admin에서 학원에 연결해 주세요.",
        },
        { status: 403 }
      ),
    };
  }
  return { academyId };
}

/** 서버 액션·비-JSON 경로용. 없으면 null. */
export function getAcademyIdOrNull(
  profile: { academy_id?: string | null } | null | undefined
): string | null {
  return profile?.academy_id?.trim() || null;
}
