import {
  jsonError,
  jsonOk,
  requireStaffProfile,
} from "@/lib/question-generator/api-helpers";
import { MAX_SETS_PER_TYPE } from "@/lib/question-generator/constants";
import { sanitizeCounts } from "@/lib/question-generator/question-types";
import type { GenerationRequestConfig } from "@/lib/question-generator/types";
import { listGenerationJobs } from "@/lib/question-generator/list-jobs";
import { createJobFromConfig } from "@/lib/question-generator/create-job";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const profile = await requireStaffProfile();
    const supabase = await createClient();
    const { jobs, error } = await listGenerationJobs(supabase, {
      academyId: profile.academy_id!,
      role: profile.role,
      viewerId: profile.id,
    });
    if (error) return jsonError(error, 500);
    return jsonOk({ jobs });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonError("목록을 불러오지 못했습니다.", 500);
  }
}

export async function POST(req: Request) {
  try {
    const profile = await requireStaffProfile();
    const body = (await req.json()) as {
      config?: GenerationRequestConfig;
      start?: boolean;
      /** 기존 작업 설정을 복사해 새 생성 작업 만들기 */
      copyFromIds?: string[];
      /** 복사·불러오기한 작업에 이어서 생성 (새 작업 만들지 않음) */
      reuseJobId?: string;
    };

    // ── 선택 복사·재생성 ──
    if (Array.isArray(body.copyFromIds) && body.copyFromIds.length > 0) {
      const ids = body.copyFromIds.filter(
        (id) => typeof id === "string" && id.length > 0
      );
      // ── 선택 복사 (생성은 시작하지 않음) ──
      if (ids.length === 0) return jsonError("복사할 항목을 선택해 주세요.");
      if (ids.length > 5) {
        return jsonError("한 번에 최대 5개까지 복사할 수 있습니다.");
      }

      const supabase = await createClient();
      let q = supabase
        .from("question_generation_jobs")
        .select("id, request_config, created_by")
        .in("id", ids);
      if (profile.role === "teacher") {
        q = q.eq("created_by", profile.id);
      }
      const { data: sources, error: sErr } = await q;
      if (sErr) return jsonError(sErr.message, 500);
      if (!sources?.length) {
        return jsonError("복사할 수 있는 항목이 없습니다.", 404);
      }

      const created: Array<{ jobId: string; sourceId: string; title: string }> =
        [];

      for (const src of sources) {
        const raw = (src.request_config ?? {}) as GenerationRequestConfig;
        const baseTitle = (raw.title || "무제").trim() || "무제";
        const title = /·\s*복사\s*$/.test(baseTitle)
          ? baseTitle
          : `${baseTitle} · 복사`;

        const config: GenerationRequestConfig = {
          title,
          schoolName: raw.schoolName || "",
          grade: raw.grade || "고1",
          sourceType: raw.sourceType || "자체 지문",
          sourceDetail: raw.sourceDetail || "",
          overallDifficulty: raw.overallDifficulty || "기본",
          passage: raw.passage || "",
          passages: Array.isArray(raw.passages)
            ? raw.passages.map((p) => ({
                clientId: p.clientId,
                title: p.title,
                sourceDetail: p.sourceDetail,
                text: p.text,
              }))
            : undefined,
          mode: raw.mode || "custom",
          presetId: raw.presetId || null,
          counts: sanitizeCounts(raw.counts, MAX_SETS_PER_TYPE),
        };

        const result = await createJobFromConfig(
          supabase,
          profile.id,
          profile.academy_id!,
          config
        );
        if ("error" in result) {
          return jsonError(result.error, result.status ?? 400);
        }
        created.push({
          jobId: result.jobId,
          sourceId: src.id as string,
          title,
        });
      }

      return jsonOk({
        copied: created.length,
        jobs: created,
        jobId: created[0]?.jobId,
      });
    }

    const config = body.config;
    if (!config) return jsonError("설정이 필요합니다.");

    const supabase = await createClient();
    const reuseJobId =
      typeof body.reuseJobId === "string" && body.reuseJobId.length > 0
        ? body.reuseJobId
        : undefined;
    const result = await createJobFromConfig(
      supabase,
      profile.id,
      profile.academy_id!,
      config,
      reuseJobId
        ? { reuseJobId, role: profile.role }
        : undefined
    );
    if ("error" in result) {
      return jsonError(result.error, result.status ?? 400);
    }

    return jsonOk({
      jobId: result.jobId,
      passageId: result.passageId,
      passageIds: result.passageIds,
      reused: Boolean(reuseJobId),
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonError(
      e instanceof Error ? e.message : "생성 요청에 실패했습니다.",
      500
    );
  }
}

/** 자료함 변형문제 탭 순서 저장: orderedIds 순서대로 library_order를 매긴다. */
export async function PATCH(req: Request) {
  try {
    const profile = await requireStaffProfile();
    const body = (await req.json().catch(() => ({}))) as { orderedIds?: string[] };
    const orderedIds = Array.isArray(body.orderedIds)
      ? body.orderedIds.filter((id) => typeof id === "string" && id.length > 0)
      : [];
    if (orderedIds.length === 0) return jsonError("순서를 바꿀 항목이 없습니다.");
    if (orderedIds.length > 200) return jsonError("한 번에 최대 200개까지 정렬할 수 있습니다.");

    const admin = createAdminClient();
    let ownQuery = admin
      .from("question_generation_jobs")
      .select("id")
      .in("id", orderedIds)
      .eq("academy_id", profile.academy_id!);
    if (profile.role === "teacher") ownQuery = ownQuery.eq("created_by", profile.id);
    const { data: owned, error: ownErr } = await ownQuery;
    if (ownErr) return jsonError(ownErr.message, 500);
    const allowed = new Set((owned ?? []).map((r) => r.id as string));

    const updates = orderedIds
      .map((id, index) => ({ id, index }))
      .filter((u) => allowed.has(u.id));
    const results = await Promise.all(
      updates.map((u) =>
        admin.from("question_generation_jobs").update({ library_order: u.index + 1 }).eq("id", u.id)
      )
    );
    const failed = results.find((r) => r.error);
    if (failed?.error) return jsonError(failed.error.message, 500);

    return jsonOk({ updated: updates.length });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonError(e instanceof Error ? e.message : "순서를 저장하지 못했습니다.", 500);
  }
}

/** 선택 삭제: 문항 → 작업 순으로 제거 */
export async function DELETE(req: Request) {
  try {
    const profile = await requireStaffProfile();
    const body = (await req.json().catch(() => ({}))) as { ids?: string[] };
    const ids = Array.isArray(body.ids)
      ? body.ids.filter((id) => typeof id === "string" && id.length > 0)
      : [];
    if (ids.length === 0) return jsonError("삭제할 항목을 선택해 주세요.");
    if (ids.length > 50) return jsonError("한 번에 최대 50개까지 삭제할 수 있습니다.");

    const supabase = await createClient();

    let jobQuery = supabase
      .from("question_generation_jobs")
      .select("id")
      .in("id", ids);
    if (profile.role === "teacher") {
      jobQuery = jobQuery.eq("created_by", profile.id);
    }
    const { data: owned, error: ownErr } = await jobQuery;
    if (ownErr) return jsonError(ownErr.message, 500);

    const allowed = (owned ?? []).map((r) => r.id as string);
    if (allowed.length === 0) {
      return jsonError("삭제할 수 있는 항목이 없습니다.", 403);
    }

    const { error: qErr } = await supabase
      .from("generated_english_questions")
      .delete()
      .in("generation_job_id", allowed);
    if (qErr) return jsonError(qErr.message, 500);

    let del = supabase
      .from("question_generation_jobs")
      .delete()
      .in("id", allowed);
    if (profile.role === "teacher") {
      del = del.eq("created_by", profile.id);
    }
    const { error: jErr } = await del;
    if (jErr) return jsonError(jErr.message, 500);

    return jsonOk({ deleted: allowed.length, ids: allowed });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonError(
      e instanceof Error ? e.message : "삭제에 실패했습니다.",
      500
    );
  }
}
