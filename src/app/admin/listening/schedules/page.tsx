import { PageHeader } from "@/components/ui/PageHeader";
import { ListeningScheduleListClient } from "@/components/listening/ListeningScheduleListClient";

export default function AdminListeningSchedulesPage() {
  return (
    <div>
      <PageHeader
        title="듣기 스케줄 과제"
        description="요일·일일 문항 수 기준으로 배정한 듣기 과제를 관리합니다."
      />
      <div className="mt-6">
        <ListeningScheduleListClient basePath="/admin/listening" />
      </div>
    </div>
  );
}
