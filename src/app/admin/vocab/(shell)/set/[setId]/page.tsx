import { renderVocabSetPage } from "@/lib/vocab/render-vocab-set-page";

interface PageProps {
  params: Promise<{ setId: string }>;
  searchParams: Promise<{ import?: string; tab?: string }>;
}

export default async function AdminVocabSetPage({ params, searchParams }: PageProps) {
  const { setId } = await params;
  const { import: importParam, tab } = await searchParams;
  return renderVocabSetPage("admin", setId, { importOpen: importParam === "1", tab });
}
