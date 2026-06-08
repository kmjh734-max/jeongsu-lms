import type { ReactNode } from "react";
import * as actions from "@/app/teacher/vocab/actions";
import { renderVocabSetsSection } from "@/lib/vocab/vocab-sets-section-props";

export default async function TeacherVocabSetsLayout({
  children,
}: {
  children: ReactNode;
}) {
  return renderVocabSetsSection(
    "teacher",
    "/teacher/classes",
    {
      createVocabFolder: actions.createVocabFolder,
      deleteVocabFolder: actions.deleteVocabFolder,
    },
    children
  );
}
