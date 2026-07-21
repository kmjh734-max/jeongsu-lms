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
      primary_color?: string | null;
      secondary_color?: string | null;
      description?: string | null;
      logo_url?: string | null;
      phone?: string | null;
      address?: string | null;
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
    if (body.primary_color !== undefined) {
      patch.primary_color =
        typeof body.primary_color === "string" && body.primary_color.trim()
          ? body.primary_color.trim()
          : null;
    }
    if (body.secondary_color !== undefined) {
      patch.secondary_color =
        typeof body.secondary_color === "string" && body.secondary_color.trim()
          ? body.secondary_color.trim()
          : null;
    }
    if (body.description !== undefined) {
      patch.description =
        typeof body.description === "string" ? body.description.trim() || null : null;
    }
    if (body.logo_url !== undefined) {
      const logo =
        typeof body.logo_url === "string" ? body.logo_url.trim() : "";
      patch.logo_url = logo || null;
    }
    if (body.phone !== undefined) {
      patch.phone =
        typeof body.phone === "string" ? body.phone.trim() || null : null;
    }
    if (body.address !== undefined) {
      patch.address =
        typeof body.address === "string" ? body.address.trim() || null : null;
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
