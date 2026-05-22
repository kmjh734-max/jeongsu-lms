import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import { VocabTestRunner } from "@/components/vocab/VocabTestRunner";
import {
  canStartVocabTest,
  generateTestQuestions,
} from "@/lib/vocab/generate-test-questions";
import { fetchStudentVocabSummaries } from "@/lib/vocab/student-sets";
import { parseVocabTestTypeParam } from "@/lib/vocab/test-types";
import type { VocabItem } from "@/types/database";

interface PageProps {
  params: Promise<{ setId: string }>;
  searchParams: Promise<{ type?: string }>;
}

export default async function StudentVocabTestPage({
  params,
  searchParams,
}: PageProps) {
  const { setId } = await params;
  const { type: typeParam } = await searchParams;
  const testType = parseVocabTestTypeParam(typeParam);

  if (!testType) {
    redirect(`/student/vocab/${setId}`);
  }

  const profile = await getCurrentProfile();
  const supabase = await createClient();

  const summaries = await fetchStudentVocabSummaries(supabase, profile!.id);
  const summary = summaries.find((s) => s.set.id === setId);
  if (!summary) notFound();

  const { data: items } = await supabase
    .from("vocab_items")
    .select("*")
    .eq("set_id", setId)
    .order("order_index")
    .order("created_at");

  const itemList = (items ?? []) as VocabItem[];

  if (!canStartVocabTest(itemList.length)) {
    return (
      <div className="mx-auto max-w-lg px-4 py-12 text-center">
        <p className="text-slate-600">
          테스트를 보려면 단어가 2개 이상 필요합니다.
        </p>
        <Link
          href={`/student/vocab/${setId}`}
          className="mt-4 inline-block text-brand-600 hover:underline"
        >
          단어장으로 돌아가기
        </Link>
      </div>
    );
  }

  const questions = generateTestQuestions(itemList, testType);

  return (
    <div className="py-6 sm:py-10">
      <VocabTestRunner
        setId={setId}
        setTitle={summary.set.title}
        testType={testType}
        questions={questions}
      />
    </div>
  );
}
