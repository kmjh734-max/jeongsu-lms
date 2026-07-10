import {
  jsonError,
  jsonOk,
  requireStaffProfile,
} from "@/lib/question-generator/api-helpers";
import {
  MAX_PASSAGES,
  MAX_SETS_PER_TYPE,
  MAX_TOTAL_QUESTIONS,
  MIN_PASSAGE_WORDS,
} from "@/lib/question-generator/constants";
import {
  resolvePassages,
  wordCount,
} from "@/lib/question-generator/passages";
import {
  sanitizeCounts,
  sumCounts,
} from "@/lib/question-generator/question-types";
import type { GenerationRequestConfig } from "@/lib/question-generator/types";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  try {
    const profile = await requireStaffProfile();
    const supabase = await createClient();
    let query = supabase
      .from("question_generation_jobs")
      .select(
        "id, status, progress_message, total_requested, total_completed, total_failed, error_message, created_at, completed_at, passage_id, request_config, english_source_passages(title)"
      )
      .order("created_at", { ascending: false })
      .limit(50);

    if (profile.role === "teacher") {
      query = query.eq("created_by", profile.id);
    }

    const { data, error } = await query;
    if (error) return jsonError(error.message, 500);
    return jsonOk({ jobs: data ?? [] });
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
    };
    const config = body.config;
    if (!config) return jsonError("설정이 필요합니다.");

    config.counts = sanitizeCounts(config.counts, MAX_SETS_PER_TYPE);

    const passages = resolvePassages(config);
    if (passages.length === 0) {
      return jsonError("영어 지문을 1개 이상 입력해 주세요.");
    }
    if (passages.length > MAX_PASSAGES) {
      return jsonError(`지문은 최대 ${MAX_PASSAGES}개까지 넣을 수 있습니다.`);
    }

    for (let i = 0; i < passages.length; i++) {
      const wc = wordCount(passages[i]!.text);
      if (wc < Math.min(15, MIN_PASSAGE_WORDS)) {
        return jsonError(
          `지문 ${i + 1}이(가) 너무 짧습니다. 더 긴 영어 지문을 입력해 주세요.`
        );
      }
    }

    const perPassage = sumCounts(config.counts ?? {}).total;
    if (perPassage <= 0) {
      return jsonError("생성할 문항 수를 1개 이상 선택해 주세요.");
    }
    const total = perPassage * passages.length;
    if (total > MAX_TOTAL_QUESTIONS) {
      return jsonError(
        `한 번에 최대 ${MAX_TOTAL_QUESTIONS}문항까지 생성할 수 있습니다. (지문 ${passages.length}개 × ${perPassage}문항 = ${total})`
      );
    }
    for (const n of Object.values(config.counts ?? {})) {
      if (n < 0 || n > MAX_SETS_PER_TYPE) {
        return jsonError(`유형별 세트 수는 0~${MAX_SETS_PER_TYPE}입니다.`);
      }
    }

    const supabase = await createClient();
    const passageIds: string[] = [];

    for (const p of passages) {
      const { data: passageRow, error: pErr } = await supabase
        .from("english_source_passages")
        .insert({
          title: p.title,
          passage: p.text,
          school_name: config.schoolName?.trim() || null,
          grade: config.grade || "고1",
          source_type: config.sourceType || "자체 지문",
          source_detail: p.sourceDetail || null,
          overall_difficulty: config.overallDifficulty || "기본",
          draft_config: config,
          created_by: profile.id,
        })
        .select("id")
        .single();

      if (pErr || !passageRow) {
        return jsonError(pErr?.message ?? "지문 저장에 실패했습니다.", 500);
      }
      passageIds.push(passageRow.id);
    }

    const primaryId = passageIds[0]!;
    const requestConfig: GenerationRequestConfig = {
      ...config,
      passage: passages[0]!.text,
      passages: passages.map((p, i) => ({
        clientId: p.clientId,
        title: p.title,
        sourceDetail: p.sourceDetail,
        text: p.text,
      })),
      passageIds,
    };

    const { data: job, error: jErr } = await supabase
      .from("question_generation_jobs")
      .insert({
        passage_id: primaryId,
        generation_mode: config.mode || "custom",
        preset_id: config.presetId || null,
        request_config: requestConfig,
        status: "pending",
        total_requested: total,
        created_by: profile.id,
        progress_message: "대기 중",
      })
      .select("id")
      .single();

    if (jErr || !job) {
      return jsonError(jErr?.message ?? "작업 생성에 실패했습니다.", 500);
    }

    return jsonOk({
      jobId: job.id,
      passageId: primaryId,
      passageIds,
    });
  } catch (e) {
    if (e instanceof Response) return e;
    return jsonError(
      e instanceof Error ? e.message : "생성 요청에 실패했습니다.",
      500
    );
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
