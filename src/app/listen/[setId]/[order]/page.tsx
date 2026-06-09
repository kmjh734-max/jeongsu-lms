import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { StudentListeningAudioOnly } from "@/components/listening/StudentListeningAudioOnly";
import { createClient } from "@/lib/supabase/server";

export default async function ListenAudioPage({
  params,
}: {
  params: Promise<{ setId: string; order: string }>;
}) {
  const { setId, order } = await params;
  const orderIndex = Number.parseInt(order, 10);
  if (!Number.isFinite(orderIndex) || orderIndex < 1) notFound();

  const profile = await getCurrentProfile();
  if (!profile) {
    redirect(
      `/login?redirect=${encodeURIComponent(`/listen/${setId}/${orderIndex}`)}`
    );
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

  const { data: question } = await supabase
    .from("listening_questions")
    .select("order_index, audio_url")
    .eq("set_id", setId)
    .eq("order_index", orderIndex)
    .maybeSingle();

  if (!question) notFound();

  return (
    <StudentListeningAudioOnly
      orderIndex={question.order_index}
      setTitle={set.title}
      audioUrl={question.audio_url}
    />
  );
}
