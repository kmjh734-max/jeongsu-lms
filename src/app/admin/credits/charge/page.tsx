import { PageHeader } from "@/components/ui/PageHeader";
import { CreditChargeClient } from "@/components/credits/CreditChargeClient";

export default function AdminCreditChargePage() {
  return (
    <div>
      <PageHeader
        title="크레딧 충전"
        description="충전 상품을 선택하고 카드로 결제합니다. (토스페이먼츠 테스트 결제)"
      />
      <CreditChargeClient />
    </div>
  );
}
