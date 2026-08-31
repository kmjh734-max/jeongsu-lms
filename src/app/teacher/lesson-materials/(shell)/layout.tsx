import type { ReactNode } from "react";
import * as actions from "@/app/teacher/lesson-materials/actions";
import { renderLessonMaterialsShell } from "@/lib/lesson-materials/render-shell";

export default async function TeacherLessonMaterialsShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  return renderLessonMaterialsShell("teacher", children, {
    createFolder: actions.createLessonMaterialFolder,
    deleteFolder: actions.deleteLessonMaterialFolder,
  });
}
