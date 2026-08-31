import { LessonMaterialsListClient } from "@/components/lesson-materials/LessonMaterialsListClient";

export default function AdminLessonMaterialsProjectsPage() {
  return (
    <LessonMaterialsListClient
      role="admin"
      title="전체 자료"
      description="지문을 입력한 뒤 탭별로 한줄해석·어휘·분석 등을 차례로 만듭니다."
    />
  );
}
