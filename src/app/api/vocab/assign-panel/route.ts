import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { createClient } from "@/lib/supabase/server";
import { loadVocabAssignPanelData } from "@/lib/vocab/load-assign-panel";

/** 배정 창 자료 — ?setIds=a,b,c (또는 ?setId=a) */
export async function GET(request: Request) {
  const profile = await getCurrentProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "teacher")) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const setIds = [
    ...(searchParams.get("setIds") ?? "").split(","),
    searchParams.get("setId") ?? "",
  ]
    .map((s) => s.trim())
    .filter(Boolean);

  if (setIds.length === 0) {
    return NextResponse.json({ error: "setIds required" }, { status: 400 });
  }

  const supabase = await createClient();
  try {
    const data = await loadVocabAssignPanelData(
      supabase,
      profile.role as "admin" | "teacher",
      profile.id,
      setIds
    );
    return NextResponse.json(data);
  } catch {
    return NextResponse.json(
      { error: "Failed to load assign panel" },
      { status: 500 }
    );
  }
}
