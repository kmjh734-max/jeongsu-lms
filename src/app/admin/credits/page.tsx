import { PageHeader } from "@/components/ui/PageHeader";
import { CreditsDashboard } from "@/components/credits/CreditsDashboard";

export default function AdminCreditsPage() {
  return (
    <div>
      <PageHeader
        title="크레딧"
        description="학원 잔액과 AI·학습 이용 내역을 확인합니다."
      />
      <CreditsDashboard />
    </div>
  );
}
