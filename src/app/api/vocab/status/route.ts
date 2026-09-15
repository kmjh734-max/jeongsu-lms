import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { getTodayIsoKorea } from "@/lib/date/korea-today";
import { loadVocabStatusGrid } from "@/lib/vocab/load-status-grid";
import { createClient } from "@/lib/supabase/server";

export const runtime = "nodejs";

/**
 * 단어학습 현황 — 오늘 학습 여부(table)와 학생 × 단어장 진행표(grid)
 * ?date=YYYY-MM-DD&classId=&name=&scope=recent|unfiled|<folderId>
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
  const scope = searchParams.get("scope")?.trim() || "recent";

  const supabase = await createClient();
  try {
    const { grid, table } = await loadVocabStatusGrid(supabase, profile.role, profile.id, {
      dateIso,
      classId,
      nameQuery,
      scope,
    });
    return NextResponse.json({ ok: true, table, grid });
  } catch {
    return NextResponse.json(
      { ok: false, message: "현황을 불러오지 못했어요. 다시 해 주세요." },
      { status: 500 }
    );
  }
}
