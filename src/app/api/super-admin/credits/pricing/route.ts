import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { getAdminClientSafe } from "@/lib/admin/api-json";

export const runtime = "nodejs";

export async function GET() {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    const client = getAdminClientSafe();
    if (!client.ok) return client.response;

    const { data, error } = await client.admin
      .from("feature_pricing")
      .select(
        "feature_key, label, credit_cost, billing_type, is_active, updated_at"
      )
      .order("feature_key");

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, pricing: data ?? [] });
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

export async function PATCH(request: Request) {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    const client = getAdminClientSafe();
    if (!client.ok) return client.response;

    let body: {
      feature_key?: string;
      credit_cost?: number;
      label?: string;
      is_active?: boolean;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "요청 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const key = body.feature_key?.trim();
    if (!key) {
      return NextResponse.json(
        { ok: false, message: "feature_key가 필요합니다." },
        { status: 400 }
      );
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof body.credit_cost === "number" && body.credit_cost >= 0) {
      patch.credit_cost = Math.floor(body.credit_cost);
    }
    if (typeof body.label === "string" && body.label.trim()) {
      patch.label = body.label.trim();
    }
    if (typeof body.is_active === "boolean") {
      patch.is_active = body.is_active;
    }

    const { data, error } = await client.admin
      .from("feature_pricing")
      .update(patch)
      .eq("feature_key", key)
      .select(
        "feature_key, label, credit_cost, billing_type, is_active, updated_at"
      )
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({ ok: true, pricing: data });
  } catch (e) {
    return NextResponse.json(
      {
        ok: false,
        message: e instanceof Error ? e.message : "저장 실패",
      },
      { status: 500 }
    );
  }
}
