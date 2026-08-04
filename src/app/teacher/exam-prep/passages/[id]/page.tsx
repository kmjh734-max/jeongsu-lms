import { notFound, redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PassageForm } from "@/components/exam-prep/PassageForm";
import { SentenceEditor } from "@/components/exam-prep/SentenceEditor";
import { Stage2BlankEditor } from "@/components/exam-prep/Stage2BlankEditor";
import { Stage3BlankEditor } from "@/components/exam-prep/Stage3BlankEditor";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";
import type {
  ExamPassage,
  ExamPassageSentence,
} from "@/lib/exam-prep/types";
import type { ExamKoreanBlank } from "@/lib/exam-prep/stage2-types";
import type { ExamStage3Blank } from "@/lib/exam-prep/stage3-types";

const BASE = "/teacher/exam-prep";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function TeacherExamPrepPassageEditPage({
  params,
}: PageProps) {
  if (!isExamPrepEnabled()) redirect("/teacher");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "teacher" || !profile.academy_id) {
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

  const [{ data: sentences }, { data: blanks2 }, { data: blanks3 }] =
    await Promise.all([
      supabase
        .from("exam_passage_sentences")
        .select("*")
        .eq("passage_id", id)
        .order("sentence_order", { ascending: true }),
      supabase
        .from("exam_stage_blanks")
        .select("*")
        .eq("passage_id", id)
        .eq("stage_number", 2)
        .order("blank_order", { ascending: true }),
      supabase
        .from("exam_stage_blanks")
        .select("*")
        .eq("passage_id", id)
        .eq("stage_number", 3)
        .order("blank_order", { ascending: true }),
    ]);

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
      <Stage2BlankEditor
        passageId={id}
        sentences={(sentences ?? []) as ExamPassageSentence[]}
        initialBlanks={(blanks2 ?? []) as ExamKoreanBlank[]}
        initiallyPublished={Boolean(
          (passage as ExamPassage).stage2_published
        )}
      />
      <Stage3BlankEditor
        passageId={id}
        sentences={(sentences ?? []) as ExamPassageSentence[]}
        initialBlanks={(blanks3 ?? []) as ExamStage3Blank[]}
        initiallyPublished={Boolean(
          (passage as ExamPassage).stage3_published
        )}
      />
    </div>
  );
}
