"use server";

import { getCurrentProfile } from "@/lib/auth/get-profile";
import { translateEnglishLinesToKorean } from "@/lib/lesson-materials/translate-lines";

export async function translateLessonMaterialLinesAction(input: {
  lines: string[];
}): Promise<{ ok: true; korean: string[] } | { ok: false; message: string }> {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return { ok: false, message: "권한이 필요합니다." };
  }
  if (profile.role === "teacher" && profile.is_active === false) {
    return { ok: false, message: "비활성화된 계정입니다." };
  }

  const lines = (input.lines ?? []).map((l) => String(l ?? "").trim());
  if (lines.length === 0 || lines.some((l) => !l)) {
    return { ok: false, message: "번역할 영어 문장이 없습니다." };
  }

  try {
    const korean = await translateEnglishLinesToKorean(lines);
    return { ok: true, korean };
  } catch (e) {
    return {
      ok: false,
      message: e instanceof Error ? e.message : "한줄해석 생성에 실패했습니다.",
    };
  }
}
