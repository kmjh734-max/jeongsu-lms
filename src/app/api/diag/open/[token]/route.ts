import { NextResponse } from "next/server";
import { createEntry, loadOpenLink } from "@/lib/vocab-diagnostic/server";
import { cleanToken, invitePath } from "@/lib/vocab-diagnostic/tokens";
import { isDiagTarget } from "@/lib/vocab-diagnostic/types";
import { closedResponse, NO_STORE, sameOrigin } from "../../shared";

/**
 * 어휘 진단 공용 링크: 들어온 사람이 예비고1·예비중1을 고르고 이름·학교를 적어 보내면 무작위 문항으로 개인 응시를 만들고
 * 그 개인 응시 주소를 돌려준다(로그인 없음, 미들웨어 공개 경로).
 */

export const dynamic = "force-dynamic";

const clip = (v: unknown, n: number) => String(v ?? "").replace(/\s+/g, " ").trim().slice(0, n);

export async function POST(request: Request, { params }: { params: Promise<{ token: string }> }) {
  if (!sameOrigin(request)) return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 403 });
  const token = cleanToken((await params).token);
  if (!token) return closedResponse("invalid");
  let body: { target?: unknown; name?: unknown; school?: unknown; agree?: unknown };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: "잘못된 요청입니다." }, { status: 400 });
  }
  const name = clip(body.name, 20);
  const school = clip(body.school, 30);
  if (name.length < 2) return NextResponse.json({ ok: false, message: "이름을 두 글자 이상 적어 주세요." }, { status: 400, headers: NO_STORE });
  if (!isDiagTarget(body.target)) return NextResponse.json({ ok: false, message: "예비고1인지 예비중1인지 골라 주세요." }, { status: 400, headers: NO_STORE });
  if (body.agree !== true) return NextResponse.json({ ok: false, message: "개인정보 이용에 동의해 주세요." }, { status: 400, headers: NO_STORE });

  const open = await loadOpenLink(token);
  if (open.kind !== "ok") return closedResponse(open.kind);
  const test = open.tests.find((t) => t.target === body.target);
  if (!test) return closedResponse("inactive");
  try {
    const { inviteToken } = await createEntry(test, { name, school });
    return NextResponse.json({ ok: true, url: invitePath(inviteToken) }, { headers: NO_STORE });
  } catch (e) {
    console.error("[vocab-diag:open]", e instanceof Error ? e.message : e);
    return NextResponse.json({ ok: false, message: "시험을 만들지 못했습니다. 잠시 뒤 다시 눌러 주세요." }, { status: 500, headers: NO_STORE });
  }
}
