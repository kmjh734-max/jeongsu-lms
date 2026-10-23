import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { loadVocabStatusSimple } from "@/lib/vocab/load-status-simple";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * 단어학습 현황 — 학생 한 줄 요약(simple): 지금 하는 단어장·어디까지·최근·합격 수·그날 했는지
 * ?date=YYYY-MM-DD&classId=&name=
 * (2026-10-23 전에는 학생 × 단어장 진행표(grid)였다 — 책 끝 Day만 보여 거꾸로였다)
 */
export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return NextResponse.json(
      { ok: false, message: "권한이 없습니다." },
      { status: 403 }
    );
  }

  if (profile.role === "teacher" && profile.is_active === false) {
    return NextResponse.json(
      { ok: false, message: "비활성화된 계정입니다." },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(request.url);
  const dateIso = searchParams.get("date")?.trim() || getTodayIsoKorea();
  const classId = searchParams.get("classId") || undefined;
  const nameQuery = searchParams.get("name") ?? "";

  const supabase = await createClient();
  try {
    const simple = await loadVocabStatusSimple(supabase, profile.role, profile.id, {
      dateIso,
      classId,
      nameQuery,
    });
    return NextResponse.json({ ok: true, simple });
  } catch {
    return NextResponse.json(
      { ok: false, message: "현황을 불러오지 못했어요. 다시 해 주세요." },
      { status: 500 }
    );
  }
}
