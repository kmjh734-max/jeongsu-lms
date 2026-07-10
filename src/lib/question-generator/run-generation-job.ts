import { createAdminClient } from "@/lib/supabase/admin";
import { analyzePassage } from "@/lib/question-generator/analyze-passage";
import {
  GENERATION_CONCURRENCY,
  MAX_REGENERATION_ATTEMPTS,
} from "@/lib/question-generator/constants";
import { generateOneQuestion } from "@/lib/question-generator/generate-question";
import {
  expandCountRequests,
  findOptionByKey,
} from "@/lib/question-generator/question-types";
import {
  shouldRegenerate,
  validateGeneratedQuestion,
} from "@/lib/question-generator/validate-question";
import type {
  GenerationRequestConfig,
  GeneratedQuestionPayload,
  PassageAnalysis,
  QuestionTypeOption,
} from "@/lib/question-generator/types";

async function updateJob(
  jobId: string,
  patch: Record<string, unknown>
) {
  const admin = createAdminClient();
  await admin.from("question_generation_jobs").update(patch).eq("id", jobId);
}

async function mapPool<T, R>(
  items: T[],
  concurrency: number,
  fn: (item: T, index: number) => Promise<R>
): Promise<R[]> {
  const results: R[] = new Array(items.length);
  let next = 0;
  async function worker() {
    while (next < items.length) {
      const i = next++;
      results[i] = await fn(items[i]!, i);
    }
  }
  const workers = Array.from(
    { length: Math.min(concurrency, items.length) },
    () => worker()
  );
  await Promise.all(workers);
  return results;
}

function toRow(
  payload: GeneratedQuestionPayload,
  opts: {
    passageId: string;
    jobId: string;
    option: QuestionTypeOption;
    userId: string;
    attempt: number;
    status: string;
    validationScore: number | null;
    errorMessage?: string | null;
  }
) {
  return {
    passage_id: opts.passageId,
    generation_job_id: opts.jobId,
    option_key: opts.option.key,
    category: payload.category,
    question_type: payload.type,
    difficulty: payload.difficulty,
    choice_language: payload.choiceLanguage,
    passage_original: payload.passageOriginal,
    passage_modified: payload.passageModified ?? null,
    instruction: payload.instruction,
    question_text: payload.questionText,
    choices: payload.choices ?? null,
    correct_answer: payload.correctAnswer,
    acceptable_answers: payload.acceptableAnswers ?? null,
    explanation: payload.explanation,
    evidence: payload.evidence ?? [],
    scoring_guide: payload.scoringGuide ?? null,
    validation_result: payload.validation ?? null,
    validation_score: opts.validationScore,
    status: opts.status,
    generation_attempt: opts.attempt,
    error_message: opts.errorMessage ?? null,
    created_by: opts.userId,
    updated_at: new Date().toISOString(),
  };
}

async function generateWithValidation(opts: {
  passage: string;
  analysis: PassageAnalysis;
  option: QuestionTypeOption;
  grade: string;
  overallDifficulty: string;
}): Promise<{
  payload: GeneratedQuestionPayload | null;
  status: "draft" | "needs_review";
  attempt: number;
  error: string | null;
}> {
  let lastError: string | null = null;
  let lastPayload: GeneratedQuestionPayload | null = null;

  for (let attempt = 1; attempt <= MAX_REGENERATION_ATTEMPTS + 1; attempt++) {
    try {
      const payload = await generateOneQuestion(opts);
      lastPayload = payload;
      const validation = await validateGeneratedQuestion({
        passage: opts.passage,
        option: opts.option,
        question: payload,
      });
      payload.validation = validation;

      if (!shouldRegenerate(validation) || attempt > MAX_REGENERATION_ATTEMPTS) {
        const status =
          shouldRegenerate(validation) || validation.overallScore < 85
            ? "needs_review"
            : "draft";
        return {
          payload,
          status,
          attempt,
          error: status === "needs_review" ? "자동 검수 기준 미달 — 강사 검토 필요" : null,
        };
      }
    } catch (e) {
      lastError = e instanceof Error ? e.message : "생성 실패";
    }
  }

  if (lastPayload) {
    return {
      payload: lastPayload,
      status: "needs_review",
      attempt: MAX_REGENERATION_ATTEMPTS + 1,
      error: lastError ?? "검수 미통과",
    };
  }

  return {
    payload: null,
    status: "needs_review",
    attempt: MAX_REGENERATION_ATTEMPTS + 1,
    error: lastError ?? "생성 실패",
  };
}

/**
 * Long-running job processor. Safe to call once; ignores if already running/done.
 */
export async function runGenerationJob(jobId: string): Promise<void> {
  const admin = createAdminClient();
  const { data: job, error } = await admin
    .from("question_generation_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error || !job) throw new Error("생성 작업을 찾을 수 없습니다.");
  // pending / failed 만 시작. 진행 중·완료는 중복 실행 방지.
  if (job.status !== "pending" && job.status !== "failed") {
    return;
  }

  // 재시도 시 이전 문항 제거 후 다시 생성 (중복 방지)
  await admin
    .from("generated_english_questions")
    .delete()
    .eq("generation_job_id", jobId);

  const config = job.request_config as GenerationRequestConfig;
  const passageId = job.passage_id as string;
  const userId = job.created_by as string;

  const { data: passageRow } = await admin
    .from("english_source_passages")
    .select("*")
    .eq("id", passageId)
    .single();

  if (!passageRow) {
    await updateJob(jobId, {
      status: "failed",
      error_message: "지문을 찾을 수 없습니다.",
      completed_at: new Date().toISOString(),
    });
    return;
  }

  try {
    await updateJob(jobId, {
      status: "analyzing",
      progress_message: "지문 분석 중",
      error_message: null,
    });

    let analysis = passageRow.analysis as PassageAnalysis | null;
    if (!analysis) {
      analysis = await analyzePassage({
        passage: passageRow.passage,
        grade: passageRow.grade,
        overallDifficulty: passageRow.overall_difficulty,
      });
      await admin
        .from("english_source_passages")
        .update({
          analysis,
          updated_at: new Date().toISOString(),
        })
        .eq("id", passageId);
    }

    const options = expandCountRequests(config.counts ?? {});
    await updateJob(jobId, {
      status: "generating",
      progress_message: `문제 생성 중 (0/${options.length})`,
      total_requested: options.length,
      total_completed: 0,
      total_failed: 0,
    });

    let completed = 0;
    let failed = 0;

    await mapPool(options, GENERATION_CONCURRENCY, async (option) => {
      await updateJob(jobId, {
        progress_message: `${option.label} 생성 중 (${completed + failed}/${options.length})`,
        status: "generating",
      });

      const result = await generateWithValidation({
        passage: passageRow.passage,
        analysis: analysis!,
        option,
        grade: config.grade || passageRow.grade,
        overallDifficulty:
          config.overallDifficulty || passageRow.overall_difficulty,
      });

      if (!result.payload) {
        failed += 1;
        await admin.from("generated_english_questions").insert(
          toRow(
            {
              type: option.type,
              category: option.category,
              difficulty: option.difficulty,
              choiceLanguage: option.choiceLanguage,
              passageOriginal: passageRow.passage,
              instruction: "",
              questionText: "",
              correctAnswer: 1,
              explanation: "",
              evidence: [],
            },
            {
              passageId,
              jobId,
              option,
              userId,
              attempt: result.attempt,
              status: "needs_review",
              validationScore: 0,
              errorMessage: result.error,
            }
          )
        );
      } else {
        completed += 1;
        await admin.from("generated_english_questions").insert(
          toRow(result.payload, {
            passageId,
            jobId,
            option,
            userId,
            attempt: result.attempt,
            status: result.status,
            validationScore: result.payload.validation?.overallScore ?? null,
            errorMessage: result.error,
          })
        );
      }

      await updateJob(jobId, {
        total_completed: completed,
        total_failed: failed,
        progress_message: `${completed + failed}/${options.length} 완료`,
      });
    });

    const finalStatus =
      failed > 0 && completed > 0
        ? "partially_completed"
        : failed > 0 && completed === 0
          ? "failed"
          : "completed";

    await updateJob(jobId, {
      status: finalStatus,
      progress_message:
        finalStatus === "completed"
          ? "생성 완료"
          : finalStatus === "partially_completed"
            ? "일부 문항 생성 완료"
            : "생성 실패",
      error_message:
        finalStatus === "failed" ? "선택한 유형 생성에 실패했습니다." : null,
      completed_at: new Date().toISOString(),
      total_completed: completed,
      total_failed: failed,
    });
  } catch (e) {
    await updateJob(jobId, {
      status: "failed",
      error_message: e instanceof Error ? e.message : "생성 작업 실패",
      completed_at: new Date().toISOString(),
    });
  }
}

export async function regenerateSingleQuestion(opts: {
  questionId: string;
  mode: "full" | "choices";
}): Promise<void> {
  const admin = createAdminClient();
  const { data: q } = await admin
    .from("generated_english_questions")
    .select("*")
    .eq("id", opts.questionId)
    .single();

  if (!q) throw new Error("문제를 찾을 수 없습니다.");

  const { data: passageRow } = await admin
    .from("english_source_passages")
    .select("passage, grade, overall_difficulty, analysis")
    .eq("id", q.passage_id)
    .single();

  if (!passageRow) throw new Error("지문을 찾을 수 없습니다.");

  const option = findOptionByKey(q.option_key ?? "") ?? {
    key: q.option_key ?? `${q.question_type}:na:default`,
    type: q.question_type,
    category: q.category,
    label: q.question_type,
    difficulty: q.difficulty,
    choiceLanguage: q.choice_language,
    isObjective: true,
    preview: "",
  };

  let analysis = passageRow.analysis as PassageAnalysis | null;
  if (!analysis) {
    analysis = await analyzePassage({
      passage: passageRow.passage,
      grade: passageRow.grade,
      overallDifficulty: passageRow.overall_difficulty,
    });
  }

  const result = await generateWithValidation({
    passage: passageRow.passage,
    analysis,
    option: option as QuestionTypeOption,
    grade: passageRow.grade,
    overallDifficulty: passageRow.overall_difficulty,
  });

  if (!result.payload) {
    throw new Error(result.error ?? "재생성에 실패했습니다.");
  }

  const before = { ...q };
  const patch: Record<string, unknown> = {
    instruction: result.payload.instruction,
    question_text: result.payload.questionText,
    passage_modified: result.payload.passageModified ?? null,
    choices: result.payload.choices ?? null,
    correct_answer: result.payload.correctAnswer,
    acceptable_answers: result.payload.acceptableAnswers ?? null,
    explanation: result.payload.explanation,
    evidence: result.payload.evidence ?? [],
    scoring_guide: result.payload.scoringGuide ?? null,
    validation_result: result.payload.validation ?? null,
    validation_score: result.payload.validation?.overallScore ?? null,
    status: result.status,
    generation_attempt: (q.generation_attempt ?? 1) + 1,
    error_message: result.error,
    updated_at: new Date().toISOString(),
  };

  if (opts.mode === "choices") {
    // keep instruction/question stem if possible; still overwrite choices/answer/explanation
    delete patch.instruction;
    delete patch.question_text;
    delete patch.passage_modified;
  }

  await admin
    .from("generated_english_questions")
    .update(patch)
    .eq("id", opts.questionId);

  await admin.from("question_edit_history").insert({
    question_id: opts.questionId,
    before_data: before,
    after_data: patch,
    edited_by: q.created_by,
  });
}
