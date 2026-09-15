import { renderVocabSetPage } from "@/lib/vocab/render-vocab-set-page";

interface PageProps {
  params: Promise<{ setId: string }>;
  searchParams: Promise<{ import?: string; tab?: string }>;
}

export default async function TeacherVocabSetPage({ params, searchParams }: PageProps) {
  const { setId } = await params;
  const { import: importParam, tab } = await searchParams;
  return renderVocabSetPage("teacher", setId, { importOpen: importParam === "1", tab });
}
