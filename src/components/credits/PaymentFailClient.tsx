"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Alert } from "@/components/ui/Alert";

export function PaymentFailClient() {
  const sp = useSearchParams();
  const code = sp.get("code");
  const message = sp.get("message");

  return (
    <div className="mx-auto max-w-lg space-y-4 px-4 py-10">
      <h1 className="text-xl font-semibold text-slate-900">결제 실패</h1>
      <Alert variant="error">
        {message || "결제가 완료되지 않았습니다."}
        {code ? ` (${code})` : ""}
      </Alert>
      <p className="text-sm text-slate-600">
        카드 정보가 거절되었거나 창이 닫힌 경우일 수 있습니다. 크레딧은
        지급되지 않았습니다.
      </p>
      <Link
        href="/admin/credits/charge"
        className="inline-block rounded-lg bg-brand-600 px-4 py-2 text-sm font-medium text-white hover:bg-brand-700"
      >
        다시 충전하기
      </Link>
    </div>
  );
}
