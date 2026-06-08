import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { StudentListeningAudioHub } from "@/components/listening/StudentListeningAudioHub";
import { createClient } from "@/lib/supabase/server";

export default async function ListenHubPage({
  params,
}: {
  params: Promise<{ setId: string }>;
}) {
  const { setId } = await params;

  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "student") {
    redirect(`/login?redirect=${encodeURIComponent(`/listen/${setId}`)}`);
  }

  if (profile.is_active === false) {
    redirect("/login?inactive=1");
  }

  const supabase = await createClient();

  const { data: set } = await supabase
    .from("listening_sets")
    .select("id, title")
    .eq("id", setId)
    .eq("is_published", true)
    .maybeSingle();

  if (!set) notFound();

  const { data: questions } = await supabase
    .from("listening_questions")
    .select("order_index, audio_url")
    .eq("set_id", setId)
    .order("order_index", { ascending: true });

  return (
    <StudentListeningAudioHub
      setTitle={set.title}
      items={(questions ?? []).map((q) => ({
        orderIndex: q.order_index,
        audioUrl: q.audio_url,
      }))}
    />
  );
}
