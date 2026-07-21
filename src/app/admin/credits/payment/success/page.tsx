import { Suspense } from "react";
import { PaymentSuccessClient } from "@/components/credits/PaymentSuccessClient";

export default function PaymentSuccessPage() {
  return (
    <Suspense
      fallback={
        <div className="p-8 text-sm text-slate-600">결제 확인 중…</div>
      }
    >
      <PaymentSuccessClient />
    </Suspense>
  );
}
