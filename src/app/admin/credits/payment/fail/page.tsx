import { Suspense } from "react";
import { PaymentFailClient } from "@/components/credits/PaymentFailClient";

export default function PaymentFailPage() {
  return (
    <Suspense
      fallback={<div className="p-8 text-sm text-slate-600">불러오는 중…</div>}
    >
      <PaymentFailClient />
    </Suspense>
  );
}
