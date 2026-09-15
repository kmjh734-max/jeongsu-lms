"use client";

import { useSearchParams } from "next/navigation";
import { ButtonLink } from "@/components/ui/Button";
import { Icon } from "@/components/layout/NavIcon";

export function PaymentFailClient() {
  const sp = useSearchParams();
  const message = sp.get("message");

  return (
    <div className="mx-auto flex max-w-md flex-col items-center gap-4 rounded-lg border border-slate-200 bg-white px-6 py-10 text-center shadow-card sm:mt-6">
      <span className="flex h-12 w-12 items-center justify-center rounded-full bg-rose-50 text-rose-700">
        <Icon name="alert" size={22} />
      </span>
      <div>
        <h1 className="text-lg font-bold text-slate-900">결제가 끝나지 않았어요</h1>
        <p className="mt-1 text-sm text-slate-500">
          {message || "카드가 거절되었거나 결제 창이 닫혔을 수 있어요."}
        </p>
        <p className="mt-2 text-xs text-slate-400">크레딧은 들어가지 않았어요.</p>
      </div>
      <div className="flex flex-wrap justify-center gap-2 pt-1">
        <ButtonLink href="/admin/credits/charge">다시 충전하기</ButtonLink>
        <ButtonLink href="/admin/credits" variant="secondary">
          크레딧으로
        </ButtonLink>
      </div>
    </div>
  );
}
