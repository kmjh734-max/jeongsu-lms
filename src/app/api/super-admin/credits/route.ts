import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { getAdminClientSafe } from "@/lib/admin/api-json";
import {
  adjustAcademyCredits,
  creditsErrorResponse,
  grantAcademyCredits,
} from "@/lib/credits";

export const runtime = "nodejs";

/** 전체 학원 잔액 + 단가 */
export async function GET() {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    const client = getAdminClientSafe();
    if (!client.ok) return client.response;

    const [{ data: academies }, { data: wallets }, { data: pricing }] =
      await Promise.all([
        client.admin
          .from("academies")
          .select("id, name, slug, status")
          .order("name"),
        client.admin.from("academy_wallets").select("academy_id, balance, updated_at"),
        client.admin
          .from("feature_pricing")
          .select(
            "feature_key, label, credit_cost, billing_type, is_active, updated_at"
          )
          .order("feature_key"),
      ]);

    const bal = new Map(
      (wallets ?? []).map((w) => [w.academy_id as string, w])
    );

    return NextResponse.json({
      ok: true,
      academies: (academies ?? []).map((a) => ({
        ...a,
        balance: (bal.get(a.id as string)?.balance as number) ?? 0,
        wallet_updated_at: bal.get(a.id as string)?.updated_at ?? null,
      })),
      pricing: pricing ?? [],
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

/** 수동 지급/차감 */
export async function POST(request: Request) {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    const client = getAdminClientSafe();
    if (!client.ok) return client.response;

    let body: {
      action?: "grant" | "adjust";
      academy_id?: string;
      amount?: number;
      direction?: "grant" | "debit";
      note?: string;
      idempotency_key?: string;
    };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { ok: false, message: "요청 형식이 올바르지 않습니다." },
        { status: 400 }
      );
    }

    const academyId = body.academy_id?.trim();
    const amount = Number(body.amount);
    if (!academyId || !Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { ok: false, message: "학원과 양수 금액을 입력해 주세요." },
        { status: 400 }
      );
    }

    const idem =
      body.idempotency_key?.trim() ||
      `${body.action ?? "grant"}:${academyId}:${amount}:${Date.now()}:${Math.random().toString(36).slice(2, 8)}`;

    try {
      if (body.action === "adjust") {
        const direction = body.direction === "debit" ? "debit" : "grant";
        const tx = await adjustAcademyCredits(client.admin, {
          academyId,
          amount: Math.floor(amount),
          direction,
          actorId: auth.profile.id,
          note: body.note,
          idempotencyKey: idem,
        });
        return NextResponse.json({ ok: true, transaction: tx });
      }

      const tx = await grantAcademyCredits(client.admin, {
        academyId,
        amount: Math.floor(amount),
        actorId: auth.profile.id,
        note: body.note,
        idempotencyKey: idem,
      });
      return NextResponse.json({ ok: true, transaction: tx });
    } catch (err) {
      const mapped = creditsErrorResponse(err);
      return NextResponse.json(mapped.body, { status: mapped.status });
    }
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
