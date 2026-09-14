import { createAdminClient } from "@/lib/supabase/admin";
import { analyzePassage } from "@/lib/question-generator/analyze-passage";
import {
  GENERATION_CONCURRENCY,
  MAX_REGENERATION_ATTEMPTS,
  MAX_SETS_PER_TYPE,
  MIN_SENTENCES_FOR_INSERTION_IRRELEVANT,
} from "@/lib/question-generator/constants";
import { syncExamVocabSetFromJob, diversifyJobHardWords } from "@/lib/question-generator/exam-vocab";
import { generateOneQuestion, SkipQuestionError } from "@/lib/question-generator/generate-question";
import { resolvePassages } from "@/lib/question-generator/passages";
import {
  expandCountRequests,
  findOptionByKey,
  sanitizeCounts,
} from "@/lib/question-generator/question-types";
import {
  shouldRegenerate,
  validateGeneratedQuestion,
} from "@/lib/question-generator/validate-question";
import { countEnglishSentences } from "@/lib/question-generator/text-utils";
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

function createProgressThrottler(minIntervalMs = 350) {
  let lastAt = 0;
  return async (
    jobId: string,
    patch: Record<string, unknown>,
    force = false
  ) => {
    const now = Date.now();
    if (!force && now - lastAt < minIntervalMs) return;
    lastAt = now;
    await updateJob(jobId, patch);
  };
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
    academyId: string;
    attempt: number;
    status: string;
    validationScore: number | null;
    errorMessage?: string | null;
  }
) {
  const approved = opts.status === "approved";
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
    hard_words: payload.hardWords ?? [],
    evidence: payload.evidence ?? [],
    scoring_guide: payload.scoringGuide ?? null,
    validation_result: payload.validation ?? null,
    validation_score: opts.validationScore,
    status: opts.status,
    generation_attempt: opts.attempt,
    error_message: opts.errorMessage ?? null,
    created_by: opts.userId,
    academy_id: opts.academyId,
    approved_by: approved ? opts.userId : null,
    approved_at: approved ? new Date().toISOString() : null,
    updated_at: new Date().toISOString(),
  };
}

async function generateWithValidation(opts: {
  passage: string;
  analysis: PassageAnalysis;
  option: QuestionTypeOption;
  grade: string;
  overallDifficulty: string;
  sourceDetail?: string;
  diversitySlot?: { index: number; total: number; label: string };
}): Promise<{
  payload: GeneratedQuestionPayload | null;
  status: "approved";
  attempt: number;
  error: string | null;
  skipped?: boolean;
}> {
  let lastError: string | null = null;

  for (let attempt = 1; attempt <= MAX_REGENERATION_ATTEMPTS + 1; attempt++) {
    try {
      const payload = await generateOneQuestion(opts);
      const validation = validateGeneratedQuestion({
        passage: opts.passage,
        option: opts.option,
        question: payload,
      });
      payload.validation = validation;

      if (!shouldRegenerate(validation)) {
        return { payload, status: "approved", attempt, error: null };
      }
      lastError = validation.warnings.join(" · ") || "형태 검수 미달";
    } catch (e) {
      if (e instanceof SkipQuestionError) {
        return {
          payload: null,
          status: "approved",
          attempt,
          error: e.message,
          skipped: true,
        };
      }
      lastError = e instanceof Error ? e.message : "생성 실패";
    }
  }

  // 미달·실패 문항은 저장하지 않고 폐기
  return {
    payload: null,
    status: "approved",
    attempt: MAX_REGENERATION_ATTEMPTS + 1,
    error: lastError ?? "생성 실패 — 문항 폐기",
  };
}

type WorkItem = {
  passageId: string;
  passageText: string;
  analysis: PassageAnalysis;
  option: QuestionTypeOption;
  sourceDetail?: string;
  label: string;
  diversitySlot: { index: number; total: number; label: string };
};

function slotKey(passageId: string, optionKey: string): string {
  return `${passageId}:${optionKey}`;
}

async function countSavedQuestions(jobId: string): Promise<number> {
  const admin = createAdminClient();
  const { count } = await admin
    .from("generated_english_questions")
    .select("id", { count: "exact", head: true })
    .eq("generation_job_id", jobId);
  return count ?? 0;
}

async function finalizeGenerationJob(
  jobId: string,
  opts: {
    totalRequested: number;
    skipped: number;
    errorMessage?: string | null;
  }
): Promise<void> {
  const completed = await countSavedQuestions(jobId);
  const failed = Math.max(0, opts.totalRequested - completed - opts.skipped);
  const finalStatus = completed > 0 ? "completed" : "failed";

  let progressMessage = "생성 완료";
  if (finalStatus === "completed") {
    if (failed > 0 && opts.skipped > 0) {
      progressMessage = `생성 완료 (${completed}/${opts.totalRequested}, 미생성 ${failed} · 생략 ${opts.skipped})`;
    } else if (failed > 0) {
      progressMessage = `생성 완료 (${completed}/${opts.totalRequested}, 미생성 ${failed})`;
    } else if (opts.skipped > 0) {
      progressMessage = `생성 완료 (생략 ${opts.skipped})`;
    }
  } else {
    progressMessage = "생성 실패";
  }

  await updateJob(jobId, {
    status: finalStatus,
    progress_message: progressMessage,
    error_message:
      finalStatus === "failed"
        ? opts.errorMessage ?? "선택한 유형 생성에 실패했습니다."
        : null,
    completed_at: new Date().toISOString(),
    total_completed: completed,
    total_failed: failed,
  });

  if (completed > 0) {
    try {
      await diversifyJobHardWords(jobId);
    } catch (e) {
      console.error("hard words diversify failed", e);
    }
    try {
      await syncExamVocabSetFromJob(jobId);
    } catch (e) {
      console.error("exam vocab sync failed", e);
    }
  }
}

/**
 * 한 번의 서버 실행(Vercel 함수)은 300초에 끊긴다. 예전에는 작업 전체를 한 실행에서
 * 돌려, 210문항짜리가 141번째에서 끊기고 "생성 중"으로 멈춰 있었다. 이제는 실행마다
 * 정해진 시간만큼만 새 문항을 시작하고, 남으면 작업을 pending으로 돌려놓고 다음 실행이
 * 이어 받는다(runGenerationJob의 반환값 more, api/question-generator/continue).
 */
/** 이 시간이 지나면 새 문항을 시작하지 않는다. 느린 호출(최대 1분 남짓)이 끝날 자리를 남긴다. */
const CHUNK_DISPATCH_MS = 180_000;
/** 이 시간까지 끝나지 않은 문항은 버리고(저장 안 함) 다음 실행에 넘긴다. */
const CHUNK_HARD_STOP_MS = 265_000;
/** 실행 하나가 살아 있을 수 있는 최대 시간(300초 + 여유). 넘으면 멈춘 작업으로 본다. */
const RUNNER_MAX_LIFETIME_MS = 330_000;
/** 이어 받기 횟수 상한(최대 500문항도 이 안에 끝난다). */
const MAX_CHUNKS = 20;

/** 실행 중으로 표시되는 상태. 이 상태의 작업은 실행 하나가 가져간 것이다. */
const HELD_STATUSES = ["analyzing", "generating", "validating"];
/** 실행이 새로 가져갈 수 있는 상태. */
const FREE_STATUSES = ["pending", "failed", "partially_completed"];

/**
 * 실행 중으로 표시돼 있지만 그 실행이 이미 끝났을(끊겼을) 작업인지. 실행을 가져간
 * 시각이 없으면(예전 작업) 작업을 만든 시각으로 판단한다.
 */
export function isGenerationJobStale(job: {
  status: string;
  created_at?: string | null;
  request_config?: unknown;
}): boolean {
  if (!HELD_STATUSES.includes(job.status)) return false;
  const run = (job.request_config as GenerationRequestConfig | null)?._run;
  const since = Date.parse(run?.claimedAt ?? job.created_at ?? "");
  if (!Number.isFinite(since)) return false;
  return Date.now() - since > RUNNER_MAX_LIFETIME_MS;
}

/**
 * 끊긴 작업을 다시 가져갈 수 있게 pending으로 돌린다. 여럿이 동시에 불러도 상태가
 * 바뀐 뒤에는 조건이 맞지 않아 한 번만 바뀐다. 바꿨으면 true.
 */
export async function releaseStaleGenerationJob(jobId: string): Promise<boolean> {
  const admin = createAdminClient();
  const { data: job } = await admin
    .from("question_generation_jobs")
    .select("id,status,created_at,request_config")
    .eq("id", jobId)
    .maybeSingle();
  if (!job || !isGenerationJobStale(job)) return false;
  const { data: updated } = await admin
    .from("question_generation_jobs")
    .update({ status: "pending", progress_message: "이어서 만드는 중…" })
    .eq("id", jobId)
    .eq("status", job.status)
    .select("id")
    .maybeSingle();
  return !!updated;
}

/**
 * 작업을 한 번 실행한다. 이미 다른 실행이 가져갔거나 끝난 작업이면 아무것도 하지 않는다.
 * 시간 안에 다 못 만들면 { more: true }를 돌려주고, 부른 쪽이 다음 실행을 이어 붙인다.
 * continuation은 이어 받는 실행(진행 문구와 이어 받기 횟수만 다르다).
 */
export async function runGenerationJob(
  jobId: string,
  opts: { continuation?: boolean } = {}
): Promise<{ more: boolean }> {
  const startedAt = Date.now();
  const admin = createAdminClient();
  const { data: job, error } = await admin
    .from("question_generation_jobs")
    .select("*")
    .eq("id", jobId)
    .single();

  if (error || !job) throw new Error("생성 작업을 찾을 수 없습니다.");

  let academyId = (job.academy_id as string | null) ?? null;
  if (!academyId && job.created_by) {
    const { data: creator } = await admin
      .from("profiles")
      .select("academy_id")
      .eq("id", job.created_by as string)
      .maybeSingle();
    academyId = (creator?.academy_id as string | null) ?? null;
  }
  if (!academyId) {
    throw new Error("생성 작업에 학원 정보가 없습니다.");
  }

  // 실행 중인 작업은 가져가지 않는다. 끊긴 작업은 releaseStaleGenerationJob이 먼저
  // pending으로 돌려놓는다.
  if (!FREE_STATUSES.includes(job.status)) return { more: false };

  const prevRun = (job.request_config as GenerationRequestConfig | null)?._run;
  const chunk = opts.continuation ? (prevRun?.chunk ?? 0) + 1 : 1;
  const config: GenerationRequestConfig = {
    ...(job.request_config as GenerationRequestConfig),
    _run: { claimedAt: new Date().toISOString(), chunk },
  };

  // 동시 실행 방지: 가져갈 수 있는 상태에서 실행 중 상태로 바꾼 쪽 하나만 이어 간다.
  // 둘이 동시에 바꾸려 해도 뒤쪽은 이미 바뀐 상태를 보고 0건이 된다.
  const { data: claimed, error: claimErr } = await admin
    .from("question_generation_jobs")
    .update({
      status: "analyzing",
      progress_message: opts.continuation ? "이어서 만드는 중…" : "준비 중…",
      error_message: null,
      request_config: config,
    })
    .eq("id", jobId)
    .in("status", FREE_STATUSES)
    .select("id")
    .maybeSingle();
  if (claimErr || !claimed) return { more: false };

  const { data: existingRows } = await admin
    .from("generated_english_questions")
    .select("passage_id, option_key")
    .eq("generation_job_id", jobId);
  const existingSlots = new Set(
    (existingRows ?? []).map((r) =>
      slotKey(String(r.passage_id), String(r.option_key ?? ""))
    )
  );
  const isResume = existingSlots.size > 0;

  // 신규 생성만 기존 문항 삭제. 재시도는 성공 문항 유지.
  if (!isResume) {
    await admin
      .from("generated_english_questions")
      .delete()
      .eq("generation_job_id", jobId);
  }

  config.counts = sanitizeCounts(config.counts, MAX_SETS_PER_TYPE);
  const userId = job.created_by as string;

  const passageIds =
    Array.isArray(config.passageIds) && config.passageIds.length > 0
      ? config.passageIds
      : [job.passage_id as string];

  const resolved = resolvePassages(config);
  const updateProgress = createProgressThrottler();

  try {
    if (!isResume) {
      await updateProgress(
        jobId,
        {
          progress_message: `지문 분석 중 (0/${passageIds.length})`,
        },
        true
      );
    }

    const options = expandCountRequests(config.counts ?? {});
    const work: WorkItem[] = [];

    const passageRows = await Promise.all(
      passageIds.map(async (passageId, pi) => {
        const { data: passageRow } = await admin
          .from("english_source_passages")
          .select("*")
          .eq("id", passageId)
          .single();
        return { passageId, passageRow, pi };
      })
    );

    for (const { passageId, passageRow, pi } of passageRows) {
      if (!passageRow) {
        await updateJob(jobId, {
          status: "failed",
          error_message: `지문 ${pi + 1}을(를) 찾을 수 없습니다.`,
          completed_at: new Date().toISOString(),
        });
        return { more: false };
      }
    }

    const analyzed = await Promise.all(
      passageRows.map(async ({ passageId, passageRow, pi }) => {
        if (!passageRow) return null;

        if (!isResume) {
          await updateProgress(jobId, {
            status: "analyzing",
            progress_message: `지문 분석 중 (${pi + 1}/${passageIds.length})`,
          });
        }

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

        return { passageId, passageRow, analysis, pi };
      })
    );

    for (const row of analyzed) {
      if (!row) continue;
      const { passageId, passageRow, analysis, pi } = row;
      const meta = resolved[pi];
      const sourceDetail =
        meta?.sourceDetail ||
        config.sourceDetail ||
        passageRow.source_detail ||
        undefined;

      for (const option of options) {
        const key = slotKey(passageId, option.key);
        if (existingSlots.has(key)) continue;
        work.push({
          passageId,
          passageText: passageRow.passage,
          analysis,
          option,
          sourceDetail,
          label:
            passageIds.length > 1
              ? `지문${pi + 1} · ${option.label}`
              : option.label,
          diversitySlot: {
            index: 0,
            total: 0,
            label: option.label,
          },
        });
      }
    }

    const totalRequested = existingSlots.size + work.length;

    // 지문별로 슬롯 번호 부여 (동의어·보기단어 다양화 힌트)
    const slotByPassage = new Map<string, number>();
    const totalByPassage = new Map<string, number>();
    for (const item of work) {
      totalByPassage.set(
        item.passageId,
        (totalByPassage.get(item.passageId) ?? 0) + 1
      );
    }
    for (const item of work) {
      const idx = slotByPassage.get(item.passageId) ?? 0;
      slotByPassage.set(item.passageId, idx + 1);
      item.diversitySlot = {
        index: idx,
        total: totalByPassage.get(item.passageId) ?? 1,
        label: item.label,
      };
    }

    // 재시도 시 남은 슬롯이 없으면 바로 완료 처리. 이어 받기가 너무 많이 반복되면
    // (계속 실패하는 유형 등) 거기서 끝낸다.
    if (work.length === 0 || chunk > MAX_CHUNKS) {
      await finalizeGenerationJob(jobId, {
        totalRequested,
        skipped: 0,
      });
      return { more: false };
    }

    const initialCompleted = existingSlots.size;

    await updateProgress(
      jobId,
      {
        status: "generating",
        progress_message: opts.continuation
          ? `${initialCompleted}/${totalRequested} 완료 · 이어서 만드는 중`
          : isResume
            ? `실패 유형 재생성 중 (0/${work.length})`
            : `문제 생성 중 (0/${work.length})`,
        total_requested: totalRequested,
        total_completed: initialCompleted,
        total_failed: 0,
      },
      true
    );

    let completed = initialCompleted;
    let failed = 0;
    let skipped = 0;
    /** 시간이 모자라 이번 실행에서 시작하지 않은 문항 수. */
    let deferred = 0;
    /** 시간 초과로 이번 실행을 접었다. 이후에 끝나는 문항은 저장하지 않는다. */
    let abandoned = false;
    const inserts = new Set<Promise<unknown>>();
    const dispatchUntil = startedAt + CHUNK_DISPATCH_MS;

    const pool = mapPool(work, GENERATION_CONCURRENCY, async (item) => {
      if (Date.now() > dispatchUntil) {
        deferred += 1;
        return;
      }
      // 문장삽입·무관한문장: 문장 5개 이하면 AI 호출 없이 생략
      if (
        (item.option.type === "sentence_insertion" ||
          item.option.type === "irrelevant_sentence") &&
        countEnglishSentences(item.passageText) <
          MIN_SENTENCES_FOR_INSERTION_IRRELEVANT
      ) {
        skipped += 1;
        await updateProgress(jobId, {
          total_completed: completed,
          total_failed: failed,
          progress_message: `${completed + failed + skipped}/${totalRequested} 완료${
            skipped > 0 ? ` (생략 ${skipped})` : ""
          }`,
        });
        return;
      }

      const result = await generateWithValidation({
        passage: item.passageText,
        analysis: item.analysis,
        option: item.option,
        grade: config.grade || "고1",
        overallDifficulty: config.overallDifficulty || "기본",
        sourceDetail: item.sourceDetail,
        diversitySlot: item.diversitySlot,
      });
      // 다음 실행이 이 문항을 다시 만든다. 여기서 저장하면 같은 칸이 두 번 생긴다.
      if (abandoned) return;

      if (result.skipped) {
        skipped += 1;
      } else if (!result.payload) {
        failed += 1;
      } else {
        completed += 1;
        const insert = admin.from("generated_english_questions").insert(
          toRow(result.payload, {
            passageId: item.passageId,
            jobId,
            option: item.option,
            userId,
            academyId,
            attempt: result.attempt,
            status: "approved",
            validationScore: result.payload.validation?.overallScore ?? null,
            errorMessage: null,
          })
        );
        const tracked = Promise.resolve(insert).finally(() => inserts.delete(tracked));
        inserts.add(tracked);
        await tracked;
      }

      await updateProgress(jobId, {
        total_completed: completed,
        total_failed: failed,
        progress_message: `${completed + failed + skipped}/${totalRequested} 완료${
          skipped > 0 ? ` (생략 ${skipped})` : ""
        }`,
      });
    });

    let hardStop: ReturnType<typeof setTimeout> | undefined;
    const finishedInTime = await Promise.race([
      pool.then(() => true),
      new Promise<false>((resolve) => {
        hardStop = setTimeout(
          () => resolve(false),
          Math.max(0, startedAt + CHUNK_HARD_STOP_MS - Date.now())
        );
      }),
    ]);
    clearTimeout(hardStop);

    if (!finishedInTime || deferred > 0) {
      // 남은 문항은 다음 실행에 넘긴다. 저장 중이던 문항까지 끝난 뒤에 세어야
      // 다음 실행이 이미 만든 칸을 다시 만들지 않는다.
      abandoned = true;
      await Promise.allSettled([...inserts]);
      const saved = await countSavedQuestions(jobId);
      await updateJob(jobId, {
        status: "pending",
        total_completed: saved,
        total_failed: 0,
        progress_message: `${saved}/${totalRequested} 완료 · 이어서 만드는 중`,
      });
      return { more: true };
    }

    await finalizeGenerationJob(jobId, {
      totalRequested,
      skipped,
    });
    return { more: false };
  } catch (e) {
    const saved = await countSavedQuestions(jobId);
    const totalRequested = (job.request_config as GenerationRequestConfig)
      ?.counts
      ? expandCountRequests(
          sanitizeCounts(
            (job.request_config as GenerationRequestConfig).counts ?? {},
            MAX_SETS_PER_TYPE
          )
        ).length *
        (Array.isArray(
          (job.request_config as GenerationRequestConfig).passageIds
        ) &&
        ((job.request_config as GenerationRequestConfig).passageIds?.length ??
          0) > 0
          ? (job.request_config as GenerationRequestConfig).passageIds!.length
          : 1)
      : saved;

    if (saved > 0) {
      await finalizeGenerationJob(jobId, {
        totalRequested: Math.max(totalRequested, saved),
        skipped: 0,
        errorMessage:
          e instanceof Error
            ? `일부 문항만 저장됨: ${e.message}`
            : "일부 문항만 저장됨",
      });
    } else {
      await updateJob(jobId, {
        status: "failed",
        error_message: e instanceof Error ? e.message : "생성 작업 실패",
        completed_at: new Date().toISOString(),
      });
    }
    return { more: false };
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
    .select("passage, grade, overall_difficulty, analysis, source_detail")
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
    sourceDetail: passageRow.source_detail || undefined,
  });

  if (!result.payload) {
    throw new Error(result.error ?? "재생성에 실패했습니다. 문항을 삭제하세요.");
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
    evidence: [],
    scoring_guide: result.payload.scoringGuide ?? null,
    validation_result: result.payload.validation ?? null,
    validation_score: result.payload.validation?.overallScore ?? null,
    status: "approved",
    generation_attempt: (q.generation_attempt ?? 1) + 1,
    error_message: null,
    approved_by: q.created_by,
    approved_at: new Date().toISOString(),
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
