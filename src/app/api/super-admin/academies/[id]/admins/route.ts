import { NextResponse } from "next/server";
import { getAdminClientSafe } from "@/lib/admin/api-json";
import { createManagedAccount } from "@/lib/admin/manage-user";
import { requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    const { id: academyId } = await ctx.params;
    const admin = createAdminClient();

    const { data: academy, error: aErr } = await admin
      .from("academies")
      .select("id, name, slug")
      .eq("id", academyId)
      .maybeSingle();
    if (aErr || !academy) {
      return NextResponse.json(
        { ok: false, message: "학원을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    const { data: admins, error } = await admin
      .from("profiles")
      .select("id, name, email, username, role, is_active, academy_id, created_at")
      .eq("academy_id", academyId)
      .eq("role", "admin")
      .order("created_at", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      academy,
      admins: admins ?? [],
    });
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

export async function POST(
  request: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    const { id: academyId } = await ctx.params;
    const clientResult = getAdminClientSafe();
    if (!clientResult.ok) return clientResult.response;
    const admin = clientResult.admin;

    const { data: academy } = await admin
      .from("academies")
      .select("id, name, slug, status")
      .eq("id", academyId)
      .maybeSingle();
    if (!academy) {
      return NextResponse.json(
        { ok: false, message: "학원을 찾을 수 없습니다." },
        { status: 404 }
      );
    }

    let body: {
      action?: "create" | "link";
      name?: string;
      username?: string;
      password?: string;
      email?: string;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "요청 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    if (body.action === "link") {
      const email = (body.email ?? "").trim().toLowerCase();
      if (!email || !email.includes("@")) {
        return NextResponse.json(
          { ok: false, message: "연결할 이메일을 입력해 주세요." },
          { status: 400 }
        );
      }

      const { data: profile } = await admin
        .from("profiles")
        .select("id, name, email, role, academy_id")
        .eq("email", email)
        .maybeSingle();

      if (!profile) {
        return NextResponse.json(
          {
            ok: false,
            message:
              "해당 이메일의 계정이 없습니다. 먼저 계정을 만들거나 「새 관리자 생성」을 사용하세요.",
          },
          { status: 404 }
        );
      }

      if (profile.role === "super_admin") {
        return NextResponse.json(
          { ok: false, message: "슈퍼관리자는 학원 관리자로 연결할 수 없습니다." },
          { status: 400 }
        );
      }

      const { data: updated, error } = await admin
        .from("profiles")
        .update({
          role: "admin",
          academy_id: academyId,
          is_active: true,
        })
        .eq("id", profile.id)
        .select("id, name, email, username, role, is_active, academy_id, created_at")
        .single();

      if (error) {
        return NextResponse.json(
          { ok: false, message: error.message },
          { status: 500 }
        );
      }

      return NextResponse.json({
        ok: true,
        message: `${academy.name} 학원 관리자로 연결했습니다.`,
        admin: updated,
      });
    }

    // create
    const result = await createManagedAccount(admin, {
      name: body.name ?? "",
      username: body.username ?? "",
      password: body.password ?? "",
      role: "admin",
      academyId,
    });

    if (!result.ok) {
      return NextResponse.json(
        { ok: false, message: result.message },
        { status: result.status }
      );
    }

    // ensure academy_id (trigger/sync 누락 대비)
    await admin
      .from("profiles")
      .update({ academy_id: academyId, role: "admin" })
      .eq("id", result.profile.id as string);

    const { data: refreshed } = await admin
      .from("profiles")
      .select("id, name, email, username, role, is_active, academy_id, created_at")
      .eq("id", result.profile.id as string)
      .single();

    return NextResponse.json({
      ok: true,
      message: `${academy.name} 학원 관리자 계정을 만들었습니다.`,
      admin: refreshed ?? result.profile,
    });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        message: e instanceof Error ? e.message : "처리 실패",
      },
      { status: 500 }
    );
  }
}
