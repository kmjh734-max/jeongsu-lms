import type { ReactNode } from "react";
import * as actions from "@/app/teacher/vocab/actions";
import { renderVocabShell } from "@/lib/vocab/render-vocab-shell";

export default async function TeacherVocabFolderLayout({
  children,
}: {
  children: ReactNode;
}) {
  return renderVocabShell(
    "teacher",
    "sets",
    "/teacher/classes",
    children,
    {
      createVocabFolder: actions.createVocabFolder,
      deleteVocabFolder: actions.deleteVocabFolder,
    }
  );
}
