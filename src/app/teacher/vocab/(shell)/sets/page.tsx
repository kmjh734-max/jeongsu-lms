import { renderVocabSetsPage } from "@/lib/vocab/render-vocab-sets-page";

interface PageProps {
  searchParams: Promise<{ view?: string }>;
}

export default async function TeacherVocabSetsPage({ searchParams }: PageProps) {
  const { view } = await searchParams;
  return renderVocabSetsPage(
    "teacher",
    view === "locked" ? { kind: "locked" } : { kind: "all" }
  );
}
