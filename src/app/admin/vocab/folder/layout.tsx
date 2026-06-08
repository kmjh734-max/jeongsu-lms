import type { ReactNode } from "react";
import * as actions from "@/app/admin/vocab/actions";
import { renderVocabSetsSection } from "@/lib/vocab/vocab-sets-section-props";

export default async function AdminVocabFolderLayout({
  children,
}: {
  children: ReactNode;
}) {
  return renderVocabSetsSection(
    "admin",
    "/admin/classes",
    {
      createVocabFolder: actions.createVocabFolder,
      deleteVocabFolder: actions.deleteVocabFolder,
    },
    children
  );
}
