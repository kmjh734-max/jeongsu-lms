import { VocabOverview } from "@/components/vocab/VocabOverview";

/** sidebar 데이터는 layout(VocabManageShell)에서만 로드 */
export default function AdminVocabPage() {
  return (
    <VocabOverview role="admin" classesHref="/admin/classes" />
  );
}
