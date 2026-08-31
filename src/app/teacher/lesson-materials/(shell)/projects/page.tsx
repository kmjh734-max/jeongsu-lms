import { LessonMaterialsListClient } from "@/components/lesson-materials/LessonMaterialsListClient";

export default function TeacherLessonMaterialsProjectsPage() {
  return (
    <LessonMaterialsListClient
      role="teacher"
      title="전체 자료"
      description="교재·단원별 자료함을 만들고, 안에 지문을 추가해 한줄해석 등을 제작합니다."
    />
  );
}
