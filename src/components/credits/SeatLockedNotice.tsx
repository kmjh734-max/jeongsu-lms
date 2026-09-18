import Link from "next/link";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { hasActiveStudentSeat } from "@/lib/credits/seat-unlock";
import { createAdminClient } from "@/lib/supabase/admin";
import type { MonthlySeatKind } from "@/lib/credits";

/**
 * 출력 화면 앞에서 부른다. 학생 이용료가 나가고 있으면 null, 아니면 안내 화면을 돌려준다.
 * base: "/admin" 또는 "/teacher"
 */
export async function seatLockScreen(
  kind: MonthlySeatKind,
  base: "/admin" | "/teacher",
  backHref: string
) {
  const profile = await getCurrentProfile();
  if (!profile) return null;
  if (profile.role === "super_admin") return null;
  const open = await hasActiveStudentSeat(createAdminClient(), profile.academy_id, kind);
  if (open) return null;

  const name = kind === "vocab" ? "단어" : "듣기";
  const assignHref = `${base}/${kind === "vocab" ? "vocab" : "listening"}/assign`;
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-6">
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 text-center shadow-sm">
        <p className="text-lg font-extrabold text-slate-900">학생을 배정하면 출력할 수 있어요</p>
        <p className="mt-2 text-sm leading-6 text-slate-600">
          {name}학습 시험지·자료 출력은 {name}학습을 쓰는 학생이 한 명 이상 있을 때 열립니다.
          <br />
          학생에게 {name} 과제를 배정하면 바로 쓸 수 있어요.
        </p>
        <div className="mt-5 flex justify-center gap-2">
          <Link
            href={assignHref}
            className="inline-flex h-10 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
          >
            학생 배정하기
          </Link>
          <Link
            href={backHref}
            className="inline-flex h-10 items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            돌아가기
          </Link>
        </div>
      </div>
    </main>
  );
}
