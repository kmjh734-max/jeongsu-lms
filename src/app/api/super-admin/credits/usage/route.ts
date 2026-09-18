import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { getAdminClientSafe } from "@/lib/admin/api-json";

export const runtime = "nodejs";

/**
 * 모든 학원·개인회원의 크레딧 사용 내역(최근 순) — 어디가 무엇에 얼마를 썼는지.
 * 차감·지급·조정·환불을 모두 싣고, 학원 이름·회원 구분·기능 이름·쓴 사람을 붙인다.
 */
export async function GET(request: Request) {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;

    const client = getAdminClientSafe();
    if (!client.ok) return client.response;

    const { searchParams } = new URL(request.url);
    const limit = Math.min(Math.max(Number(searchParams.get("limit") ?? 200), 1), 500);

    const { data: txns, error } = await client.admin
      .from("credit_transactions")
      .select("id, academy_id, type, amount, balance_after, feature_key, note, created_at, actor_id")
      .order("created_at", { ascending: false })
      .limit(limit);
    if (error) throw new Error(error.message);

    const academyIds = [...new Set((txns ?? []).map((t) => t.academy_id as string))];
    const actorIds = [...new Set((txns ?? []).map((t) => t.actor_id as string | null).filter(Boolean))] as string[];
    const [{ data: academies }, { data: actors }, { data: pricing }] = await Promise.all([
      academyIds.length
        ? client.admin.from("academies").select("id, name, settings").in("id", academyIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string; settings: unknown }> }),
      actorIds.length
        ? client.admin.from("profiles").select("id, name, role").in("id", actorIds)
        : Promise.resolve({ data: [] as Array<{ id: string; name: string; role: string }> }),
      client.admin.from("feature_pricing").select("feature_key, label"),
    ]);

    const academyById = new Map((academies ?? []).map((a) => [a.id as string, a]));
    const actorById = new Map((actors ?? []).map((a) => [a.id as string, a]));
    const labelByKey = new Map((pricing ?? []).map((p) => [p.feature_key as string, p.label as string]));

    return NextResponse.json({
      ok: true,
      usage: (txns ?? []).map((t) => {
        const academy = academyById.get(t.academy_id as string);
        const signup = (academy?.settings as { signup?: { member_type?: string } } | null)?.signup;
        const actor = t.actor_id ? actorById.get(t.actor_id as string) : null;
        return {
          id: t.id,
          academyId: t.academy_id,
          academyName: academy?.name ?? "(삭제된 학원)",
          memberType: signup?.member_type === "personal" ? "personal" : "academy",
          type: t.type,
          amount: t.amount,
          balanceAfter: t.balance_after,
          feature: t.feature_key ? (labelByKey.get(t.feature_key as string) ?? t.feature_key) : null,
          note: t.note,
          actorName: actor?.name ?? null,
          createdAt: t.created_at,
        };
      }),
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "조회 실패" },
      { status: 500 }
    );
  }
}
