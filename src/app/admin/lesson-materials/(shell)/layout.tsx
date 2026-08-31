import type { ReactNode } from "react";
import * as actions from "@/app/admin/lesson-materials/actions";
import { renderLessonMaterialsShell } from "@/lib/lesson-materials/render-shell";

export default async function AdminLessonMaterialsShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  return renderLessonMaterialsShell("admin", children, {
    createFolder: actions.createLessonMaterialFolder,
    deleteFolder: actions.deleteLessonMaterialFolder,
  });
}
