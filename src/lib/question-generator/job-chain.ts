import { createHmac, timingSafeEqual } from "node:crypto";
import {
  isGenerationJobStale,
  releaseStaleGenerationJob,
  runGenerationJob,
} from "@/lib/question-generator/run-generation-job";
import type { GenerationRequestConfig } from "@/lib/question-generator/types";

/**
 * 변형문제 생성 이어 받기. 서버 한 번 실행은 5분에 끊기므로 runGenerationJob은 시간 안에
 * 만들 수 있는 만큼만 만들고, 남으면 여기서 새 서버 요청(api/question-generator/continue)을
 * 보내 다음 실행을 시작한다. 그 요청은 로그인 쿠키가 없어 서버 비밀값으로 서명한다.
 */

function continueSecret(): string {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY가 설정되어 있지 않습니다.");
  return key;
}

export function continueToken(jobId: string): string {
  return createHmac("sha256", continueSecret()).update(`qg-continue:${jobId}`).digest("hex");
}

export function verifyContinueToken(jobId: string, token: unknown): boolean {
  if (typeof token !== "string" || !jobId) return false;
  const expected = Buffer.from(continueToken(jobId));
  const given = Buffer.from(token);
  return expected.length === given.length && timingSafeEqual(expected, given);
}

async function triggerContinue(jobId: string, origin: string): Promise<void> {
  try {
    const res = await fetch(`${origin}/api/question-generator/continue`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobId, token: continueToken(jobId) }),
      signal: AbortSignal.timeout(20_000),
    });
    if (!res.ok) console.error("qg continue rejected", jobId, res.status);
  } catch (e) {
    // 이어 붙이지 못해도 작업은 pending으로 남아 있어, 진행 화면이 조회할 때 이어 간다
    // (resumeGenerationJobIfIdle).
    console.error("qg continue trigger failed", jobId, e);
  }
}

/** 작업을 한 번 실행하고, 남았으면 다음 실행을 이어 붙인다. */
export async function runGenerationChunkAndChain(
  jobId: string,
  origin: string,
  opts: { continuation?: boolean } = {}
): Promise<void> {
  const { more } = await runGenerationJob(jobId, opts);
  if (more) await triggerContinue(jobId, origin);
}

/**
 * 진행 상황을 조회할 때 부른다. 실행이 끊겨 멈춘 작업이나, 다음 실행이 이어 받지 못하고
 * 남아 있는 작업이면 이어서 실행할 함수를 돌려준다(부른 쪽이 after로 돌린다). 여럿이
 * 동시에 불러도 작업을 가져가는 쪽은 하나뿐이다.
 */
export function resumeGenerationJobIfIdle(
  job: {
    id: string;
    status: string;
    created_at?: string | null;
    total_completed?: number | null;
    request_config?: unknown;
  },
  origin: string
): (() => Promise<void>) | null {
  if (isGenerationJobStale(job)) {
    return async () => {
      await releaseStaleGenerationJob(job.id);
      await runGenerationChunkAndChain(job.id, origin, { continuation: true });
    };
  }
  const run = (job.request_config as GenerationRequestConfig | null)?._run;
  if (job.status === "pending" && run && (job.total_completed ?? 0) > 0) {
    return () => runGenerationChunkAndChain(job.id, origin, { continuation: true });
  }
  return null;
}
