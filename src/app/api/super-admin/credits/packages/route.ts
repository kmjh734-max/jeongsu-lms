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
      .from("credit_packages")
      .select("*")
      .order("display_order", { ascending: true });

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true, packages: data ?? [] });
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
      id?: string;
      name?: string;
      payment_amount?: number;
      credit_amount?: number;
      bonus_credit?: number;
      is_active?: boolean;
      display_order?: number;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "요청 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const id = body.id?.trim();
    if (!id) {
      return NextResponse.json(
        { ok: false, message: "id가 필요합니다." },
        { status: 400 }
      );
    }

    const patch: Record<string, unknown> = {
      updated_at: new Date().toISOString(),
    };
    if (typeof body.name === "string") patch.name = body.name.trim();
    if (body.payment_amount != null) patch.payment_amount = Number(body.payment_amount);
    if (body.credit_amount != null) patch.credit_amount = Number(body.credit_amount);
    if (body.bonus_credit != null) patch.bonus_credit = Number(body.bonus_credit);
    if (typeof body.is_active === "boolean") patch.is_active = body.is_active;
    if (body.display_order != null) patch.display_order = Number(body.display_order);

    const { data, error } = await client.admin
      .from("credit_packages")
      .update(patch)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, package: data });
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

export async function POST(request: Request) {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    const client = getAdminClientSafe();
    if (!client.ok) return client.response;

    let body: {
      name?: string;
      payment_amount?: number;
      credit_amount?: number;
      bonus_credit?: number;
      display_order?: number;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "요청 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const name = body.name?.trim();
    const paymentAmount = Number(body.payment_amount);
    const creditAmount = Number(body.credit_amount);
    const bonus = Number(body.bonus_credit ?? 0);
    if (!name || !(paymentAmount > 0) || !(creditAmount > 0)) {
      return NextResponse.json(
        { ok: false, message: "이름·결제금액·기본 크레딧을 확인해 주세요." },
        { status: 400 }
      );
    }

    const { data, error } = await client.admin
      .from("credit_packages")
      .insert({
        name,
        payment_amount: paymentAmount,
        credit_amount: creditAmount,
        bonus_credit: Math.max(0, bonus),
        display_order: Number(body.display_order ?? 100),
        is_active: true,
      })
      .select("*")
      .single();

    if (error) {
      return NextResponse.json(
        { ok: false, message: error.message },
        { status: 400 }
      );
    }
    return NextResponse.json({ ok: true, package: data });
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
