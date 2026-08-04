import { notFound, redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { PassageForm } from "@/components/exam-prep/PassageForm";
import { SentenceEditor } from "@/components/exam-prep/SentenceEditor";
import { Stage2BlankEditor } from "@/components/exam-prep/Stage2BlankEditor";
import { Stage3BlankEditor } from "@/components/exam-prep/Stage3BlankEditor";
import { Stage4SettingsEditor } from "@/components/exam-prep/Stage4SettingsEditor";
import { Stage5VerbFormEditor } from "@/components/exam-prep/Stage5VerbFormEditor";
import { Stage6ChoiceEditor } from "@/components/exam-prep/Stage6ChoiceEditor";
import { Stage7ErrorEditor } from "@/components/exam-prep/Stage7ErrorEditor";
import { Stage8ReorderEditor } from "@/components/exam-prep/Stage8ReorderEditor";
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
import type { ExamStage4Setting } from "@/lib/exam-prep/stage4-types";
import type { ExamStage5Item } from "@/lib/exam-prep/stage5-types";
import type { ExamStage6Item } from "@/lib/exam-prep/stage6-types";
import type { ExamStage7Candidate } from "@/lib/exam-prep/stage7-types";
import type { ExamStage8Group } from "@/lib/exam-prep/stage8-types";
import { parseReorderChunks } from "@/lib/exam-prep/stage8-types";

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

  const [
    { data: sentences },
    { data: blanks2 },
    { data: blanks3 },
    { data: stage4Settings },
    { data: stage5Items },
    { data: stage6Items },
    { data: stage7Items },
    { data: stage8Items },
  ] = await Promise.all([
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
    supabase
      .from("exam_stage_translation_settings")
      .select("*")
      .eq("passage_id", id)
      .eq("stage_number", 4),
    supabase
      .from("exam_stage_blanks")
      .select("*")
      .eq("passage_id", id)
      .eq("stage_number", 5)
      .order("blank_order", { ascending: true }),
    supabase
      .from("exam_stage_blanks")
      .select("*")
      .eq("passage_id", id)
      .eq("stage_number", 6)
      .order("blank_order", { ascending: true }),
    supabase
      .from("exam_stage_blanks")
      .select("*")
      .eq("passage_id", id)
      .eq("stage_number", 7)
      .order("blank_order", { ascending: true }),
    supabase
      .from("exam_stage_blanks")
      .select("*")
      .eq("passage_id", id)
      .eq("stage_number", 8)
      .order("blank_order", { ascending: true }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        title="ì§€ë¬??¸ì§‘"
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
      <Stage4SettingsEditor
        passageId={id}
        sentences={(sentences ?? []) as ExamPassageSentence[]}
        initialSettings={(stage4Settings ?? []) as ExamStage4Setting[]}
        initiallyPublished={Boolean(
          (passage as ExamPassage).stage4_published
        )}
      />
      <Stage5VerbFormEditor
        passageId={id}
        sentences={(sentences ?? []) as ExamPassageSentence[]}
        initialItems={(stage5Items ?? []) as ExamStage5Item[]}
        initiallyPublished={Boolean(
          (passage as ExamPassage).stage5_published
        )}
      />
      <Stage6ChoiceEditor
        passageId={id}
        sentences={(sentences ?? []) as ExamPassageSentence[]}
        initialItems={(stage6Items ?? []) as ExamStage6Item[]}
        initiallyPublished={Boolean(
          (passage as ExamPassage).stage6_published
        )}
      />
      <Stage7ErrorEditor
        passageId={id}
        sentences={(sentences ?? []) as ExamPassageSentence[]}
        initialCandidates={(stage7Items ?? []) as ExamStage7Candidate[]}
        initiallyPublished={Boolean(
          (passage as ExamPassage).stage7_published
        )}
        initialRequiredErrorCount={
          (passage as ExamPassage).stage7_required_error_count ?? 3
        }
      />
      <Stage8ReorderEditor
        passageId={id}
        sentences={(sentences ?? []) as ExamPassageSentence[]}
        initialGroups={(stage8Items ?? []).map((row) => ({
          ...(row as ExamStage8Group),
          stage_number: 8 as const,
          reorder_chunks: parseReorderChunks(
            (row as { reorder_chunks: unknown }).reorder_chunks
          ),
        }))}
        initiallyPublished={Boolean(
          (passage as ExamPassage).stage8_published
        )}
      />
    </div>
  );
}
