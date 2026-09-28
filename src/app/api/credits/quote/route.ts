import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createAdminClient } from "@/lib/supabase/admin";
import { getFeatureCost } from "@/lib/credits";

export const runtime = "nodejs";

/**
 * 만들기 전에 "얼마가 나가는지" 묻는다.
 *
 * 선생님 요청(2026-09-28): 제작을 누르면 곧바로 만들어져 크레딧이 나가 버린다.
 * 잘못 눌러도 되돌릴 수 없으니, 만들기 전에 드는 값과 남는 잔액을 보여 주고 한 번 더 묻는다.
 * 이 호출은 값을 읽기만 하고 차감하지 않는다.
 */
export async function POST(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile?.academy_id) {
    return NextResponse.json({ ok: false, message: "로그인이 필요합니다." }, { status: 401 });
  }

  let body: { items?: Array<{ feature?: unknown; quantity?: unknown }> };
  try {
    body = (await request.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, message: "요청을 읽지 못했습니다." }, { status: 400 });
  }

  const items = (Array.isArray(body.items) ? body.items : [])
    .map((it) => ({
      feature: String(it?.feature ?? "").trim(),
      quantity: Math.max(1, Math.floor(Number(it?.quantity) || 1)),
    }))
    .filter((it) => it.feature);
  if (items.length === 0) {
    return NextResponse.json({ ok: false, message: "무엇을 만들지 알 수 없습니다." }, { status: 400 });
  }

  const admin = createAdminClient();
  const lines: Array<{ feature: string; label: string; unitCost: number; quantity: number; cost: number }> = [];
  for (const it of items) {
    const pricing = await getFeatureCost(admin, it.feature);
    // 가격이 없거나 꺼져 있으면 값이 나가지 않는 기능이다. 줄에서 뺀다.
    if (!pricing || !pricing.active || pricing.cost <= 0) continue;
    lines.push({
      feature: it.feature,
      label: pricing.label,
      unitCost: pricing.cost,
      quantity: it.quantity,
      cost: pricing.cost * it.quantity,
    });
  }

  const total = lines.reduce((sum, l) => sum + l.cost, 0);
  const { data: wallet } = await admin
    .from("academy_wallets")
    .select("balance")
    .eq("academy_id", profile.academy_id)
    .maybeSingle();
  const balance = Number(wallet?.balance ?? 0);

  return NextResponse.json({
    ok: true,
    lines,
    total,
    balance,
    after: balance - total,
    enough: balance >= total,
    canCharge: profile.role === "admin",
  });
}
