import { renderVocabSetsPage } from "@/lib/vocab/render-vocab-sets-page";

interface PageProps {
  params: Promise<{ folderId: string }>;
}

export default async function TeacherVocabFolderPage({ params }: PageProps) {
  const { folderId } = await params;
  return renderVocabSetsPage("teacher", { kind: "folder", folderId });
}
