import { VocabSetsOverview } from "@/components/vocab/VocabSetsOverview";

export default function AdminVocabSetsPage() {
  return (
    <VocabSetsOverview role="admin" classesHref="/admin/classes" />
  );
}
