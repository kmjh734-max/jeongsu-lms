import { NextResponse } from "next/server";
import { requireSuperAdminApi } from "@/lib/auth/require-super-admin-api";
import { syncListeningCurriculumToAllAcademies } from "@/lib/listening/clone-curriculum";
import { syncVocabCurriculumToAllAcademies } from "@/lib/vocab/clone-curriculum";

export const runtime = "nodejs";
export const maxDuration = 300;

/**
 * 템플릿 학원(정수학원)의 교재(잠근 듣기·단어 세트)를 다른 모든 학원에 맞춘다. 이미 있는
 * 세트는 건너뛰고 빠지거나 덜 복사된 세트만 채운다. 교재를 새로 만든 뒤(예: 고2 듣기) 누른다.
 */
export async function POST() {
  try {
    const auth = await requireSuperAdminApi();
    if ("error" in auth && auth.error) return auth.error;
    const ownerId = "profile" in auth && auth.profile ? (auth.profile.id as string) : null;
    if (!ownerId) {
      return NextResponse.json({ ok: false, message: "관리자 정보를 찾을 수 없습니다." }, { status: 400 });
    }
    const listening = await syncListeningCurriculumToAllAcademies(ownerId);
    const vocab = await syncVocabCurriculumToAllAcademies(ownerId);
    const sum = (rows: Array<{ result: { setsCloned: number } }>) =>
      rows.reduce((n, r) => n + r.result.setsCloned, 0);
    return NextResponse.json({
      ok: true,
      message: `듣기 ${sum(listening)}세트, 단어 ${sum(vocab)}세트를 채웠습니다.`,
      listening,
      vocab,
    });
  } catch (e) {
    return NextResponse.json(
      { ok: false, message: e instanceof Error ? e.message : "교재를 맞추지 못했습니다." },
      { status: 500 }
    );
  }
}
