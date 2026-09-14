import { after } from "next/server";
import {
  jsonError,
  jsonOk,
  requireStaffProfile,
} from "@/lib/question-generator/api-helpers";
import {
  resumeGenerationJobIfIdle,
  runGenerationChunkAndChain,
} from "@/lib/question-generator/job-chain";
import { isGenerationJobStale } from "@/lib/question-generator/run-generation-job";
import {
  chargeFeatureOrError,
  CREDIT_FEATURES,
} from "@/lib/credits/charge";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export const maxDuration = 300;

export async function GET(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireStaffProfile();
    const { id } = await ctx.params;
    const supabase = await createClient();

    let jobQuery = supabase
      .from("question_generation_jobs")
      .select("*, english_source_passages(*)")
      .eq("id", id);

    if (profile.role === "teacher") {
      jobQuery = jobQuery.eq("created_by", profile.id);
    }

    const { data: job, error } = await jobQuery.single();
    if (error || !job) return jsonError("작업을 찾을 수 없습니다.", 404);

    // 실행이 끊겨 멈췄거나 다음 실행이 이어 받지 못한 작업은 여기서 이어 간다.
    const resume = resumeGenerationJobIfIdle(job, new URL(req.url).origin);
    if (resume) after(resume);

    let qQuery = supabase
      .from("generated_english_questions")
      .select("*")
      .eq("generation_job_id", id)
      .order("created_at", { ascending: true });

    if (profile.role === "teacher") {
      qQuery = qQuery.eq("created_by", profile.id);
    }

    const { data: questions } = await qQuery;
    return jsonOk({ job, questions: questions ?? [] });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonError("조회에 실패했습니다.", 500);
  }
}

export async function POST(
  req: Request,
  ctx: { params: Promise<{ id: string }> }
) {
  try {
    const profile = await requireStaffProfile();
    const { id } = await ctx.params;
    const body = (await req.json().catch(() => ({}))) as { action?: string };

    if (body.action === "process" || body.action === "retry") {
      const supabase = await createClient();
      const admin = createAdminClient();

      const { data: jobRow } = await admin
        .from("question_generation_jobs")
        .select(
          "id, academy_id, created_by, total_requested, total_failed, total_completed, status, created_at, request_config"
        )
        .eq("id", id)
        .maybeSingle();
      if (!jobRow) return jsonError("작업을 찾을 수 없습니다.", 404);
      // 실행 중인 작업을 다시 시작하면 같은 문항이 두 번 만들어진다.
      if (
        ["analyzing", "generating", "validating"].includes(jobRow.status as string) &&
        !isGenerationJobStale(jobRow)
      ) {
        return jsonError("아직 만드는 중인 작업입니다. 끝난 뒤에 다시 시도해 주세요.", 409);
      }
      if (
        jobRow.academy_id &&
        profile.academy_id &&
        jobRow.academy_id !== profile.academy_id
      ) {
        return jsonError("다른 학원 작업입니다.", 403);
      }
      if (profile.role === "teacher" && jobRow.created_by !== profile.id) {
        return jsonError("권한이 없습니다.", 403);
      }

      const requested = Math.max(1, Number(jobRow.total_requested) || 1);
      const failed = Math.max(0, Number(jobRow.total_failed) || 0);
      const quantity =
        body.action === "retry" && failed > 0 ? failed : requested;

      const chargeErr = await chargeFeatureOrError({
        academyId: (jobRow.academy_id as string) || profile.academy_id,
        featureKey: CREDIT_FEATURES.qg_generate_job,
        actorId: profile.id,
        idempotencyKey: `qg_generate_job:${id}:${body.action === "retry" ? `retry-${Date.now()}` : "run"}`,
        quantity,
        note:
          body.action === "retry"
            ? `변형문제 재시도 ${quantity}문항`
            : `변형문제 생성 ${quantity}문항`,
        metadata: {
          job_id: id,
          action: body.action,
          quantity,
        },
      });
      if (chargeErr) return chargeErr;

      if (body.action === "retry") {
        const { data: updated, error: updErr } = await admin
          .from("question_generation_jobs")
          .update({
            status: "pending",
            error_message: null,
            progress_message: "재시도 대기",
            completed_at: null,
          })
          .eq("id", id)
          .in("status", [
            "failed",
            "partially_completed",
            "completed",
            "analyzing",
            "generating",
            "validating",
            "pending",
          ])
          .select("id")
          .maybeSingle();
        if (updErr) return jsonError(updErr.message, 500);
        if (!updated) {
          return jsonError("재시도할 수 없는 상태입니다.", 400);
        }
      }
      // 응답은 바로 하고 생성은 after에서 한다. 한 실행에 다 못 만들면 다음 실행이
      // 이어 받는다(job-chain.ts). 진행 상황은 화면이 GET으로 조회한다.
      const origin = new URL(req.url).origin;
      after(() => runGenerationChunkAndChain(id, origin));
      const { data: job } = await supabase
        .from("question_generation_jobs")
        .select("*")
        .eq("id", id)
        .single();
      return jsonOk({ job });
    }

    return jsonError("알 수 없는 요청입니다.");
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonError(
      e instanceof Error ? e.message : "처리에 실패했습니다.",
      500
    );
  }
}
