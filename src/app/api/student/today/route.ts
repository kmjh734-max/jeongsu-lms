import { NextResponse } from "next/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { loadStudentToday } from "@/lib/student/today";

/** 왼쪽 메뉴의 '오늘 할 일' 카드용 (읽기만) */
export async function GET() {
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    return NextResponse.json({ ok: false }, { status: 403 });
  }
  try {
    const today = await loadStudentToday(profile.id);
    return NextResponse.json({
      ok: true,
      doneCount: today.doneCount,
      items: today.items.map((i) => ({ short: i.short, done: i.done, href: i.href })),
    });
  } catch {
    return NextResponse.json({ ok: false }, { status: 200 });
  }
}
