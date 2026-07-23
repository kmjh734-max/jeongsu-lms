import type { SupabaseClient } from "@supabase/supabase-js";
import type { UserRole } from "@/types/database";

export interface ListeningSetFolderRow {
  id: string;
  name: string;
  description: string | null;
  parent_id: string | null;
  teacher_id: string | null;
  created_by: string | null;
  order_index: number;
  created_at: string;
  updated_at: string;
}

export async function listListeningSetFolders(
  supabase: SupabaseClient,
  role: UserRole,
  _viewerId: string
): Promise<ListeningSetFolderRow[]> {
  // Teachers: RLS returns owned folders + curriculum folders in academy (098).
  // Admins: academy-scoped RLS.
  const { data, error } = await supabase
    .from("listening_set_folders")
    .select(
      "id, name, description, parent_id, teacher_id, created_by, order_index, created_at, updated_at"
    )
    .order("order_index", { ascending: true })
    .order("name", { ascending: true });

  if (error) throw new Error(error.message);
  return (data ?? []) as ListeningSetFolderRow[];
}

export async function assertFolderAccessible(
  supabase: SupabaseClient,
  role: UserRole,
  viewerId: string,
  folderId: string
): Promise<boolean> {
  if (role === "admin") return true;

  const { data } = await supabase
    .from("listening_set_folders")
    .select("id")
    .eq("id", folderId)
    .maybeSingle();

  return Boolean(data?.id);
}
