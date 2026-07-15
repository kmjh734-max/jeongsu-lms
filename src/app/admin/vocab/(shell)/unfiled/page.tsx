import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabFolderView } from "@/components/vocab/VocabFolderView";
import { loadVocabUnfiledPageData } from "@/lib/vocab/load-folder-page";

interface PageProps {
  searchParams: Promise<{ openAssign?: string }>;
}

export default async function AdminVocabUnfiledPage({
  searchParams,
}: PageProps) {
  const { openAssign } = await searchParams;
  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const data = await loadVocabUnfiledPageData(supabase, "admin", profile!.id);

  return (
    <VocabFolderView
      role="admin"
      initialAssignOpen={openAssign === "1"}
      folderId={null}
      folderName="미분류"
      academyName={data.academyName}
      ownerName={data.ownerName}
      ownerUsername={data.ownerUsername}
      sets={data.sets}
      folders={data.folderOptions}
      teachers={data.teachers}
    />
  );
}
