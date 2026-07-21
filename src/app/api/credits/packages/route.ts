import { NextResponse } from "next/server";
import { requireAdminApi } from "@/lib/auth/require-admin-api";

export const runtime = "nodejs";

/** Active packages for academy admin charge UI */
export async function GET() {
  try {
    const auth = await requireAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    if (auth.profile.role !== "admin") {
      return NextResponse.json(
        { ok: false, message: "학원 관리자만 이용할 수 있습니다." },
        { status: 403 }
      );
    }

    const { data, error } = await auth.supabase
      .from("credit_packages")
      .select(
        "id, name, payment_amount, credit_amount, bonus_credit, is_active, display_order"
      )
      .eq("is_active", true)
      .order("display_order", { ascending: true });

    if (error) {
      return NextResponse.json(
        {
          ok: false,
          message:
            error.message.includes("credit_packages")
              ? "충전 상품 테이블이 없습니다. 마이그레이션 095를 적용해 주세요."
              : error.message,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      ok: true,
      packages: (data ?? []).map((p) => ({
        ...p,
        total_credit: Number(p.credit_amount) + Number(p.bonus_credit),
      })),
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
