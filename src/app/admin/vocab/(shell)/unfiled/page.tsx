import { renderVocabSetsPage } from "@/lib/vocab/render-vocab-sets-page";

export default async function AdminVocabUnfiledPage() {
  return renderVocabSetsPage("admin", { kind: "unfiled" });
}
