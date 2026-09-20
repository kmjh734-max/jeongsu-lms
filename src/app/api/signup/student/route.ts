import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { createManagedAccount } from "@/lib/admin/manage-user";
import { academyByJoinCode, phoneAsUsername } from "@/lib/academy/join-code";
import { pickStudentDetails, saveStudentDetails } from "@/lib/accounts/student-details";

export const runtime = "nodejs";

/** 같은 곳에서 몰아 가입하지 못하게 (서버 한 대 안에서의 간단한 제한) */
const recent = new Map<string, number[]>();
function tooMany(ip: string): boolean {
  const now = Date.now();
  const list = (recent.get(ip) ?? []).filter((t) => now - t < 60 * 60 * 1000);
  list.push(now);
  recent.set(ip, list);
  return list.length > 10;
}

const jsonError = (message: string, status = 400) =>
  NextResponse.json({ ok: false, message }, { status });

/**
 * 학생 가입 — 학원 가입 코드로 들어와 스스로 계정을 만든다.
 * 아이디는 학생 휴대전화 번호. 가입 뒤에는 학원이 승인해야 쓸 수 있다.
 */
export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
    if (tooMany(ip)) return jsonError("잠시 뒤에 다시 시도해 주세요.", 429);

    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const admin = createAdminClient();

    const academy = await academyByJoinCode(admin, String(body.code ?? ""));
    if (!academy) return jsonError("가입 코드가 맞지 않아요. 학원에서 받은 코드를 다시 확인해 주세요.");

    const name = String(body.name ?? "").trim();
    if (name.length < 2) return jsonError("이름을 적어 주세요.");

    const username = phoneAsUsername(String(body.phone ?? ""));
    if (!username) return jsonError("휴대전화 번호를 010으로 시작하는 숫자로 적어 주세요.");

    const password = String(body.password ?? "");
    if (password.length < 6) return jsonError("비밀번호는 6자 이상으로 정해 주세요.");

    const { data: taken } = await admin
      .from("profiles")
      .select("id")
      .eq("username", username)
      .maybeSingle();
    if (taken) return jsonError("이미 가입된 번호예요. 로그인하거나 학원에 문의해 주세요.");

    const result = await createManagedAccount(admin, {
      name,
      username,
      password,
      role: "student",
      academyId: academy.id,
    });
    if (!result.ok) return jsonError(result.message, result.status);

    const newId = (result.profile as { id?: string } | null)?.id;
    if (newId) {
      // 학원 코드가 있는 링크로 들어온 학생은 바로 쓸 수 있다(선생님 결정 2026-09-20).
      await saveStudentDetails(admin, newId, {
        ...pickStudentDetails(body),
        phone: String(body.phone ?? ""),
      });
    }

    return NextResponse.json({
      ok: true,
      message: `${academy.name} 학생으로 가입했어요. 바로 로그인해서 공부를 시작하세요.`,
      academyName: academy.name,
    });
  } catch (error) {
    console.error("[POST /api/signup/student]", error);
    return jsonError("가입하지 못했어요. 잠시 뒤 다시 해 주세요.", 500);
  }
}

/** 코드가 맞는지 먼저 확인해 학원 이름을 보여 준다 */
export async function GET(request: Request) {
  const code = new URL(request.url).searchParams.get("code") ?? "";
  const academy = await academyByJoinCode(createAdminClient(), code);
  return NextResponse.json({ ok: !!academy, academyName: academy?.name ?? null });
}
