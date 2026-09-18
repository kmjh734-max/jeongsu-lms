import Link from "next/link";
import { createAdminClient } from "@/lib/supabase/admin";

/** 이 크레딧보다 적으면 알린다(분석서 4장쯤) */
const LOW_CREDIT = 3000;

/**
 * 학원 화면 맨 위 "크레딧이 얼마 안 남았어요" 띠.
 * 떨어지면 수업자료·문항을 만들 수 없어서, 미리 알려 충전하게 한다.
 * 원장님은 바로 충전하러, 선생님은 원장님께 요청하라고 안내한다.
 */
export async function LowCreditBanner({ academyId, canCharge }: { academyId: string | null | undefined; canCharge: boolean }) {
  if (!academyId) return null;
  const { data } = await createAdminClient().from("academy_wallets").select("balance").eq("academy_id", academyId).maybeSingle();
  const balance = Number(data?.balance ?? 0);
  if (balance >= LOW_CREDIT) return null;
  const empty = balance <= 0;
  return (
    <div
      className={`mb-4 flex flex-wrap items-center justify-between gap-2 rounded-lg px-4 py-2.5 text-sm ${
        empty ? "bg-rose-50 text-rose-800" : "bg-amber-50 text-amber-900"
      }`}
      role="status"
    >
      <span>
        {empty ? (
          <>크레딧을 다 썼어요. 충전해야 수업자료·문항을 만들 수 있어요.</>
        ) : (
          <>
            크레딧이 <b className="tabular-nums">{balance.toLocaleString("ko-KR")}</b> 남았어요. 떨어지면 자료 만들기가 멈춰요.
          </>
        )}
      </span>
      {canCharge ? (
        <Link href="/admin/credits/charge" className="font-semibold underline">
          충전하기
        </Link>
      ) : (
        <span className="text-xs opacity-80">원장님께 충전을 요청해 주세요.</span>
      )}
    </div>
  );
}
