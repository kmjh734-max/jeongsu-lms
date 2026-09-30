import { NextResponse } from "next/server";
import { requireExamStaff } from "@/lib/exam-analysis/access";
import {
  isGrammarBankOpen,
  loadGrammarQuestions,
  loadGrammarQuestionsByIds,
  moveGrammarQuestionUnit,
} from "@/lib/grammar-bank/queries";

export const runtime = "nodejs";

/**
 * 중학 문법 문제 은행.
 *   GET ?level=2&chapter=4&tier=1 → 그 단원의 1단계 문항
 *   GET ?ids=1,2,3                              → 담아 둔 문항
 */
export async function GET(req: Request) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  if (!(await isGrammarBankOpen(auth.profile.academy_id))) {
    return NextResponse.json(
      { ok: false, message: "이 학원에서는 쓸 수 없는 기능입니다." },
      { status: 403 },
    );
  }

  const params = new URL(req.url).searchParams;

  const idsParam = params.get("ids");
  if (idsParam) {
    const ids = idsParam
      .split(",")
      .map((v) => Number(v.trim()))
      .filter((v) => Number.isFinite(v));
    if (ids.length === 0) return NextResponse.json({ ok: true, questions: [] });
    if (ids.length > 200) {
      return NextResponse.json(
        { ok: false, message: "한 번에 200문항까지 담을 수 있어요." },
        { status: 400 },
      );
    }
    return NextResponse.json({
      ok: true,
      questions: await loadGrammarQuestionsByIds(ids),
    });
  }

  const level = Number(params.get("level"));
  const chapterNo = Number(params.get("chapter"));
  if (!Number.isFinite(level) || !Number.isFinite(chapterNo)) {
    return NextResponse.json(
      { ok: false, message: "레벨과 단원을 골라 주세요." },
      { status: 400 },
    );
  }
  const tierRaw = params.get("tier");
  const questions = await loadGrammarQuestions({
    level,
    chapterNo,
    tier: tierRaw ? Number(tierRaw) : null,
  });
  return NextResponse.json({ ok: true, questions });
}

/**
 * 문항 하나의 세부 단원을 고친다.
 *   PATCH { id, unit } → 그 문항을 다른 세부 단원으로 옮긴다
 *
 * 세부는 문제를 보고 자동으로 붙인 것이라 더러 어긋난다. 눈에 걸리는 것을
 * 선생님이 바로 고칠 수 있게 열어 둔다. 같은 단원 안의 세부로만 옮길 수 있다.
 */
export async function PATCH(req: Request) {
  const auth = await requireExamStaff();
  if ("error" in auth) return auth.error;
  if (!(await isGrammarBankOpen(auth.profile.academy_id))) {
    return NextResponse.json(
      { ok: false, message: "이 학원에서는 쓸 수 없는 기능입니다." },
      { status: 403 },
    );
  }

  const body = (await req.json().catch(() => null)) as
    | { id?: number; unit?: string | null }
    | null;
  const id = Number(body?.id);
  const unit = typeof body?.unit === "string" ? body.unit.trim() : "";
  if (!Number.isFinite(id) || !unit) {
    return NextResponse.json(
      { ok: false, message: "문항과 세부 단원을 함께 보내 주세요." },
      { status: 400 },
    );
  }

  const moved = await moveGrammarQuestionUnit(id, unit);
  if (!moved.ok) {
    return NextResponse.json({ ok: false, message: moved.message }, { status: 400 });
  }
  return NextResponse.json({ ok: true });
}
