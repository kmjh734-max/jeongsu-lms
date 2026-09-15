import { renderVocabSetsPage } from "@/lib/vocab/render-vocab-sets-page";

interface PageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function AdminVocabSetsPage({ searchParams }: PageProps) {
  const { view } = await searchParams;
  return renderVocabSetsPage(
    "admin",
    view === "locked" ? { kind: "locked" } : { kind: "all" }
  );
}
