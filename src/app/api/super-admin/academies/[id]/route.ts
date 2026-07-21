import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

export async function PATCH(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    const { id } = await ctx.params;
    let body: {
      name?: string;
      status?: "active" | "suspended" | "inactive";
      primary_color?: string;
      secondary_color?: string;
      description?: string;
      logo_url?: string;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "요청 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof body.name === "string" && body.name.trim()) {
      patch.name = body.name.trim();
    }
    if (body.status) patch.status = body.status;
    if (typeof body.primary_color === "string") {
      patch.primary_color = body.primary_color;
    }
    if (typeof body.secondary_color === "string") {
      patch.secondary_color = body.secondary_color;
    }
    if (typeof body.description === "string") {
      patch.description = body.description;
    }
    if (typeof body.logo_url === "string") {
      patch.logo_url = body.logo_url;
    }

    const supabase = await createClient();
    const { data, error } = await supabase
      .from("academies")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, academy: data });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        message: e instanceof Error ? e.message : "수정 실패",
      },
      { status: 500 }
    );
  }
}
