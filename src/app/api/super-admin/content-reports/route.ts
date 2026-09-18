import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { createAdminClient } from "@/lib/supabase/admin";

export const runtime = "nodejs";

/** 슈퍼관리자: 오류 신고 목록 */
export async function GET(request: Request) {
  const auth = await requireSuperAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const status = new URL(request.url).searchParams.get("status") === "resolved" ? "resolved" : "open";
  const admin = createAdminClient();
  const { data: rows, error } = await admin
    .from("content_reports")
    .select("*")
    .eq("status", status)
    .order("created_at", { ascending: false })
    .limit(300);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });

  const ids = (k: string) => [...new Set((rows ?? []).map((r) => r[k]).filter(Boolean))] as string[];
  const [{ data: academies }, { data: people }, { data: lsets }, { data: vsets }] = await Promise.all([
    ids("academy_id").length ? admin.from("academies").select("id, name").in("id", ids("academy_id")) : Promise.resolve({ data: [] }),
    ids("reporter_id").length ? admin.from("profiles").select("id, name").in("id", ids("reporter_id")) : Promise.resolve({ data: [] }),
    ids("set_id").length ? admin.from("listening_sets").select("id, title").in("id", ids("set_id")) : Promise.resolve({ data: [] }),
    ids("set_id").length ? admin.from("vocab_sets").select("id, title").in("id", ids("set_id")) : Promise.resolve({ data: [] }),
  ]);
  const name = (list: Array<{ id: string; name?: string; title?: string }> | null, id: string | null) =>
    id ? (list ?? []).find((x) => x.id === id)?.name ?? (list ?? []).find((x) => x.id === id)?.title ?? null : null;

  return NextResponse.json({
    ok: true,
    reports: (rows ?? []).map((r) => ({
      ...r,
      academy_name: name(academies as never, r.academy_id),
      reporter_name: name(people as never, r.reporter_id),
      set_title: name((r.kind === "listening" ? lsets : vsets) as never, r.set_id),
    })),
  });
}

/** 슈퍼관리자: 처리 완료 / 다시 열기 */
export async function PATCH(request: Request) {
  const auth = await requireSuperAdminApi();
  if ("error" in auth && auth.error) return auth.error;
  const body = (await request.json().catch(() => ({}))) as { id?: string; status?: string };
  if (!body.id) return NextResponse.json({ ok: false, message: "id가 필요해요." }, { status: 400 });
  const status = body.status === "open" ? "open" : "resolved";
  const { error } = await createAdminClient()
    .from("content_reports")
    .update({ status, resolved_at: status === "resolved" ? new Date().toISOString() : null })
    .eq("id", body.id);
  if (error) return NextResponse.json({ ok: false, message: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
