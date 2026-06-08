import type { ReactNode } from "react";
import { renderVocabShell } from "@/lib/vocab/render-vocab-shell";

export default async function TeacherVocabAssignLayout({
  children,
}: {
  children: ReactNode;
}) {
  return renderVocabShell("teacher", "assign", "/teacher/classes", children);
}
