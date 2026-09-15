import type { ReactNode } from "react";
import { renderVocabShell } from "@/lib/vocab/render-vocab-shell";

export default async function TeacherVocabShellLayout({
  children,
}: {
  children: ReactNode;
}) {
  return renderVocabShell("teacher", children);
}
