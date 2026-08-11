import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { generateAndSaveChoiceImages } from "@/lib/listening/generate-choice-images";
import { createAdminClient } from "@/lib/supabase/admin";
import { assertListeningSetWritable } from "@/lib/listening/listening-api-auth";

export const maxDuration = 300;
export const dynamic = "force-dynamic";

/** 단일 문항 그림 생성 (choice_image_prompts → choice_image_urls) */
export async function POST(req: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
      return NextResponse.json(
        { ok: false, message: "권한이 없습니다." },
        { status: 403 }
      );
    }

    const body = (await req.json()) as {
      questionId?: string;
      setId?: string;
      force?: boolean;
    };
    const questionId = String(body.questionId ?? "").trim();
    if (!questionId) {
      return NextResponse.json(
        { ok: false, message: "questionId가 필요합니다." },
        { status: 400 }
      );
    }

    const admin = createAdminClient();
    const { data: q, error } = await admin
      .from("listening_questions")
      .select("id, set_id, choice_image_prompts")
      .eq("id", questionId)
      .maybeSingle();
    if (error || !q) {
      return NextResponse.json(
        { ok: false, message: error?.message ?? "문항 없음" },
        { status: 404 }
      );
    }

    const setId = String(body.setId ?? q.set_id ?? "").trim();
    const access = await assertListeningSetWritable(setId);
    if (!access.ok) {
      return NextResponse.json(
        { ok: false, message: access.message },
        { status: access.status }
      );
    }

    const prompts = Array.isArray(q.choice_image_prompts)
      ? (q.choice_image_prompts as string[])
          .map((p) => String(p).trim())
          .filter(Boolean)
      : [];
    if (prompts.length === 0) {
      return NextResponse.json(
        { ok: false, message: "choice_image_prompts가 비어 있습니다." },
        { status: 400 }
      );
    }

    const result = await generateAndSaveChoiceImages({
      setId,
      questionId,
      prompts,
      force: Boolean(body.force),
    });

    return NextResponse.json({ ok: true, ...result });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        message: e instanceof Error ? e.message : "그림 생성 실패",
      },
      { status: 500 }
    );
  }
}
