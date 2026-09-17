import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { generateLessonMaterialComicIllustration } from "@/lib/lesson-materials/generate-illustration";
import {
  debitLessonCredits,
  LESSON_CREDIT_FEATURES,
  lessonCreditShortfall,
} from "@/lib/credits/lesson-credits";

export const runtime = "nodejs";
export const maxDuration = 120;

function jsonError(message: string, status = 200) {
  return NextResponse.json({ ok: false as const, message }, { status });
}

/** 경로 상한(120초)에서 차감·저장할 자리를 뺀 그림 만들기 마감 */
const IMAGE_BUDGET_MS = 105_000;

export async function POST(request: Request) {
  const startedAt = Date.now();
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

    const shortfall = await lessonCreditShortfall(academyId, LESSON_CREDIT_FEATURES.illustration);
    if (shortfall) return jsonError(shortfall);

    // 그림이 실제로 나오면(저장 전) 바로 차감한다. 그림을 못 만들면 차감하지 않는다.
    const out = await generateLessonMaterialComicIllustration({
      academyId,
      illustrationPrompt: prompt,
      passageHint: body.passageHint,
      captions: body.captions,
      deadlineAt: startedAt + IMAGE_BUDGET_MS,
      onImageProduced: async () => {
        await debitLessonCredits({
          academyId,
          actorId: profile.id,
          featureKey: LESSON_CREDIT_FEATURES.illustration,
          note: "지문 삽화",
        });
      },
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
