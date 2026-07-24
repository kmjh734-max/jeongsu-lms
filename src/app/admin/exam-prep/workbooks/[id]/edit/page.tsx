import { notFound, redirect } from "next/navigation";
import { ExamPrepStaffNav } from "@/components/exam-prep/ExamPrepStaffNav";
import { WorkbookReviewClient } from "@/components/exam-prep/WorkbookReviewClient";
import { PageHeader } from "@/components/ui/PageHeader";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { isExamPrepEnabled } from "@/lib/academy-features";
import { createClient } from "@/lib/supabase/server";
import type {
  ExamPassageSentence,
  ExamWorkbook,
  ExamWorkbookQuestion,
  ExamWorkbookStep,
} from "@/lib/exam-prep/types";

const BASE = "/admin/exam-prep";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function AdminExamPrepWorkbookEditPage({
  params,
}: PageProps) {
  if (!isExamPrepEnabled()) redirect("/admin");
  const profile = await getCurrentProfile();
  if (!profile || profile.role !== "admin" || !profile.academy_id) {
    redirect("/login");
  }

  const { id } = await params;
  const supabase = await createClient();
  const { data: workbook } = await supabase
    .from("exam_workbooks")
    .select("*, exam_passages(title)")
    .eq("id", id)
    .eq("academy_id", profile.academy_id)
    .maybeSingle();

  if (!workbook) notFound();

  const passageId = workbook.passage_id as string;
  const passageTitle =
    (workbook.exam_passages as { title: string } | null)?.title ?? "-";

  const [{ data: steps }, { data: questions }, { data: sentences }] =
    await Promise.all([
      supabase
        .from("exam_workbook_steps")
        .select("*")
        .eq("workbook_id", id)
        .order("step_order", { ascending: true }),
      supabase
        .from("exam_workbook_questions")
        .select("*")
        .eq("workbook_id", id)
        .order("question_order", { ascending: true }),
      supabase
        .from("exam_passage_sentences")
        .select("*")
        .eq("passage_id", passageId)
        .order("sentence_order", { ascending: true }),
    ]);

  const { exam_passages: _p, ...wbRest } = workbook as ExamWorkbook & {
    exam_passages: { title: string } | null;
  };

  return (
    <div>
      <PageHeader title="워크북 검수" description={passageTitle} />
      <ExamPrepStaffNav basePath={BASE} current="workbooks" />
      <WorkbookReviewClient
        basePath={BASE}
        workbook={wbRest as ExamWorkbook}
        steps={(steps ?? []) as ExamWorkbookStep[]}
        questions={(questions ?? []) as ExamWorkbookQuestion[]}
        sentences={(sentences ?? []) as ExamPassageSentence[]}
        passageTitle={passageTitle}
      />
    </div>
  );
}
