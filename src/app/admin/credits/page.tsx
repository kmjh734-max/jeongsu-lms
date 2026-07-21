import { PageHeader } from "@/components/ui/PageHeader";
import { CreditsDashboard } from "@/components/credits/CreditsDashboard";

export default function AdminCreditsPage() {
  return (
    <div>
      <PageHeader
        title="크레딧"
        description="학원 잔액 확인, 카드 충전, 이용·결제 내역을 관리합니다."
      />
      <CreditsDashboard canCharge />
    </div>
  );
}
