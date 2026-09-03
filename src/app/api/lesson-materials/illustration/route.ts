import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { generateLessonMaterialComicIllustration } from "@/lib/lesson-materials/generate-illustration";

export const runtime = "nodejs";
export const maxDuration = 120;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false as const, message }, { status });
}

export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return jsonError("권한이 없습니다.", 403);
    }
    if (profile.role === "teacher" && profile.is_active === false) {
      return jsonError("비활성화된 계정입니다.", 403);
    }
    const academyId = profile.academy_id;
    if (!academyId) return jsonError("소속 학원 정보가 없습니다.");

    const body = (await request.json()) as {
      illustrationPrompt?: string;
      passageHint?: string;
      captions?: string[];
    };

    const prompt = body.illustrationPrompt?.trim() ?? "";
    if (prompt.length < 8) {
      return jsonError("삽화 프롬프트가 비어 있습니다.");
    }

    const out = await generateLessonMaterialComicIllustration({
      academyId,
      illustrationPrompt: prompt,
      passageHint: body.passageHint,
      captions: body.captions,
    });

    return NextResponse.json({
      ok: true as const,
      url: out.url,
      prompt: out.prompt,
    });
  } catch (e) {
    return jsonError(
      e instanceof Error ? e.message : "삽화 생성에 실패했습니다."
    );
  }
}
