import { notFound, redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PassageForm } from "@/components/exam-prep/PassageForm";
import { SentenceEditor } from "@/components/exam-prep/SentenceEditor";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";
import type {
  ExamPassage,
  ExamPassageSentence,
} from "@/lib/exam-prep/types";

const BASE = "/admin/exam-prep";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminExamPrepPassageEditPage({
  params,
}: PageProps) {
  if (!isExamPrepEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.academy_id) {
    redirect("/login");
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: passage } = await supabase
    .from("exam_passages")
    .select("*")
    .eq("id", id)
    .eq("academy_id", profile.academy_id)
    .maybeSingle();

  if (!passage) notFound();

  const { data: sentences } = await supabase
    .from("exam_passage_sentences")
    .select("*")
    .eq("passage_id", id)
    .order("sentence_order", { ascending: true });

  return (
    <div className="space-y-6">
      <PageHeader
        title="지문 편집"
        description={(passage as ExamPassage).title}
      />
      <ExamPrepStaffNav basePath={BASE} current="passages" />
      <PassageForm
        mode="edit"
        basePath={BASE}
        passageId={id}
        initial={passage as ExamPassage}
      />
      <SentenceEditor
        passageId={id}
        basePath={BASE}
        sentences={(sentences ?? []) as ExamPassageSentence[]}
      />
    </div>
  );
}
