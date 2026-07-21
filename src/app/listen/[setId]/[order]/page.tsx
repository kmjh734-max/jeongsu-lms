import { notFound, redirect } from "next/navigation";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { StudentListeningAudioOnly } from "@/components/listening/StudentListeningAudioOnly";
import { isStudentAssignedListeningSet } from "@/lib/listening/student-set-access";
import { createAdminClient } from "@/lib/supabase/admin";

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

  const admin = createAdminClient();

  const { data: set } = await admin
    .from("listening_sets")
    .select("id, title, academy_id")
    .eq("id", setId)
    .maybeSingle();

  if (!set) notFound();

  if (profile.role === "student") {
    const assigned = await isStudentAssignedListeningSet(
      admin,
      profile.id,
      setId
    );
    if (!assigned) notFound();
  } else if (
    (profile.role === "admin" || profile.role === "teacher") &&
    profile.academy_id &&
    set.academy_id &&
    set.academy_id !== profile.academy_id
  ) {
    notFound();
  }

  const { data: question } = await admin
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
