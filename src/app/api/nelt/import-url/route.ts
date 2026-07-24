import { NextResponse } from "next/server";
import { requireNeltStaff } from "@/lib/nelt/require-nelt-staff";
import { resolveNeltUrl } from "@/lib/nelt/url/adapters";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(request: Request) {
  const auth = await requireNeltStaff();
  if (!auth.ok) return auth.error;

  let body: { urls?: string[] | string; studentName?: string };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: "요청 본문이 올바르지 않습니다." },
      { status: 400 }
    );
  }

  const rawList = Array.isArray(body.urls)
    ? body.urls
    : typeof body.urls === "string"
      ? body.urls.split(/\r?\n/)
      : [];

  const urls = [
    ...new Set(
      rawList
        .map((u) => u.trim())
        .filter((u) => u.length > 0 && !u.startsWith("#"))
    ),
  ].slice(0, 20);

  if (urls.length === 0) {
    return NextResponse.json(
      { ok: false, message: "등록할 링크를 한 줄 이상 입력해 주세요." },
      { status: 400 }
    );
  }

  const preferredName = body.studentName?.trim() || null;
  const results = [];

  for (const url of urls) {
    const resolved = await resolveNeltUrl(url);
    if (!resolved.ok) {
      results.push({
        ok: false as const,
        url,
        message: resolved.message,
        adapter: resolved.adapter ?? null,
      });
      continue;
    }

    const draft = { ...resolved.draft };
    if (preferredName) draft.studentName = preferredName;

    // duplicate check by same academy + name + date/url
    const name = draft.studentName?.trim() || preferredName || "";
    let duplicates: Array<{ id: string; test_date: string | null }> = [];
    if (name) {
      const { data } = await auth.supabase
        .from("nelt_reports")
        .select("id, test_date, test_name, source_url")
        .eq("academy_id", auth.academyId)
        .eq("student_name_raw", name);
      duplicates = (data ?? []).filter(
        (r) =>
          r.source_url === url ||
          (draft.testDate &&
            r.test_date === draft.testDate &&
            (r.test_name ?? "") === (draft.testName ?? ""))
      );
    }

    results.push({
      ok: true as const,
      url,
      adapter: resolved.adapter,
      draft,
      duplicates: duplicates.map((d) => ({
        id: d.id,
        testDate: d.test_date,
      })),
    });
  }

  return NextResponse.json({ ok: true, results });
}
