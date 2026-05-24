import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ListeningSetManageClient } from "@/components/listening/ListeningSetManageClient";
import { ListeningAssignPanel } from "@/components/listening/ListeningAssignPanel";
import { loadListeningSetForEditor } from "@/lib/listening/load-set-editor";

export default async function AdminListeningSetPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;
  const supabase = await createClient();
  const loaded = await loadListeningSetForEditor(supabase, setId);
  if (!loaded) notFound();

  const { data: classes } = await supabase
    .from("classes")
    .select("id, name")
    .eq("is_active", true)
    .order("name");

  return (
    <div className="space-y-6">
      <Link
        href="/admin/listening"
        className="text-sm text-indigo-600 hover:underline"
      >
        ← 듣기 세트 목록
      </Link>
      <ListeningSetManageClient
        setId={loaded.set.id}
        title={loaded.set.title}
        isPublished={loaded.set.is_published}
        speechSpeed={loaded.set.speech_speed ?? 0.9}
        questions={loaded.questions}
        role="admin"
      />
      <ListeningAssignPanel setId={setId} classes={classes ?? []} />
    </div>
  );
}
