import type { ReactNode } from "react";
import { renderVocabShell } from "@/lib/vocab/render-vocab-shell";

export default async function AdminVocabAssignLayout({
  children,
}: {
  children: ReactNode;
}) {
  return renderVocabShell("admin", "assign", "/admin/classes", children);
}
