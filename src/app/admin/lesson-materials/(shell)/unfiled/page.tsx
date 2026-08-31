import { LessonMaterialsListClient } from "@/components/lesson-materials/LessonMaterialsListClient";

export default function AdminLessonMaterialsUnfiledPage() {
  return (
    <LessonMaterialsListClient
      role="admin"
      folderId={null}
      title="미분류"
      description="폴더에 넣지 않은 수업자료입니다."
    />
  );
}
