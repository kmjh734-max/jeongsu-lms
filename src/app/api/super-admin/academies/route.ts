import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { cloneListeningCurriculumToAcademy } from "@/lib/listening/clone-curriculum";
import { cloneVocabCurriculumToAcademy } from "@/lib/vocab/clone-curriculum";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academies")
      .select("*")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, academies: data ?? [] });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        message: e instanceof Error ? e.message : "조회 실패",
      },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    let body: {
      name?: string;
      slug?: string;
      primary_color?: string;
      secondary_color?: string;
      description?: string;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "요청 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const name = (body.name ?? "").trim();
    const slug = (body.slug ?? "")
      .trim()
      .toLowerCase()
      .replace(/[^a-z0-9-]/g, "");
    if (!name || !slug) {
      return NextResponse.json(
        { ok: false, message: "학원명과 slug는 필수입니다." },
        { status: 400 }
      );
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academies")
      .insert({
        name,
        slug,
        primary_color: body.primary_color || "#2563EB",
        secondary_color: body.secondary_color || body.primary_color || "#2563EB",
        description: body.description ?? null,
        status: "active",
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    let curriculum = null as Awaited<
      ReturnType<typeof cloneListeningCurriculumToAcademy>
    > | null;
    let vocabCurriculum = null as Awaited<
      ReturnType<typeof cloneVocabCurriculumToAcademy>
    > | null;
    let curriculumError: string | null = null;
    try {
      const ownerId =
        "profile" in auth && auth.profile ? auth.profile.id : null;
      if (ownerId && data?.id) {
        curriculum = await cloneListeningCurriculumToAcademy({
          targetAcademyId: data.id as string,
          ownerProfileId: ownerId,
        });
        vocabCurriculum = await cloneVocabCurriculumToAcademy({
          targetAcademyId: data.id as string,
          ownerProfileId: ownerId,
        });
      }
    } catch (e) {
      curriculumError = e instanceof Error ? e.message : "커리큘럼 복제 실패";
      console.error("[academies] curriculum clone failed", e);
    }

    return NextResponse.json({
      ok: true,
      academy: data,
      curriculum,
      vocabCurriculum,
      curriculumError,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        message: e instanceof Error ? e.message : "생성 실패",
      },
      { status: 500 }
    );
  }
}
