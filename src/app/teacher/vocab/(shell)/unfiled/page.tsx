import { renderVocabSetsPage } from "@/lib/vocab/render-vocab-sets-page";

export default async function TeacherVocabUnfiledPage() {
  return renderVocabSetsPage("teacher", { kind: "unfiled" });
}
