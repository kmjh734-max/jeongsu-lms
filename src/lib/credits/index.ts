import type { SupabaseClient } from "@supabase/supabase-js";

export {
  CREDIT_WON_PER_UNIT,
  CREDIT_PACKS,
  creditsToWon,
  formatWon,
} from "./pricing-guide";

export const CREDIT_FEATURES = {
  qg_generate_job: "qg_generate_job",
  listening_generate_questions: "listening_generate_questions",
  listening_generate_audio: "listening_generate_audio",
  vocab_generate_examples: "vocab_generate_examples",
  vocab_extract_passage: "vocab_extract_passage",
  vocab_grade_meaning: "vocab_grade_meaning",
  student_record_analyze: "student_record_analyze",
  report_ai_draft: "report_ai_draft",
  vocab_student_monthly: "vocab_student_monthly",
  listening_student_monthly: "listening_student_monthly",
} as const;

export type CreditFeatureKey =
  (typeof CREDIT_FEATURES)[keyof typeof CREDIT_FEATURES];

export type CreditTransaction = {
  id: string;
  academy_id: string;
  type: "grant" | "debit" | "adjust" | "refund";
  amount: number;
  balance_after: number;
  feature_key: string | null;
  idempotency_key: string;
  actor_id: string | null;
  note: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
};

export type FeaturePricing = {
  feature_key: string;
  label: string;
  credit_cost: number;
  billing_type: "per_use" | "monthly_seat";
  is_active: boolean;
  updated_at: string;
};

export class InsufficientCreditsError extends Error {
  readonly code = "insufficient_credits" as const;
  constructor(message = "크레딧이 부족합니다. 학원 관리자에게 충전을 요청해 주세요.") {
    super(message);
    this.name = "InsufficientCreditsError";
  }
}

export class CreditError extends Error {
  constructor(
    message: string,
    public readonly code: string
  ) {
    super(message);
    this.name = "CreditError";
  }
}

function mapRpcError(message: string): never {
  const m = message.toLowerCase();
  if (m.includes("insufficient_credits")) {
    throw new InsufficientCreditsError();
  }
  if (m.includes("unknown_feature")) {
    throw new CreditError("알 수 없는 과금 기능입니다.", "unknown_feature");
  }
  if (m.includes("feature_inactive")) {
    throw new CreditError("비활성화된 과금 기능입니다.", "feature_inactive");
  }
  if (m.includes("zero_cost")) {
    throw new CreditError("무료 기능입니다.", "zero_cost");
  }
  if (m.includes("wallet_not_found")) {
    throw new CreditError("학원 지갑을 찾을 수 없습니다.", "wallet_not_found");
  }
  throw new CreditError(message || "크레딧 처리에 실패했습니다.", "credit_error");
}

/** YYYY-MM in Asia/Seoul */
export function koreaYearMonth(date = new Date()): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Seoul",
    year: "numeric",
    month: "2-digit",
  })
    .format(date)
    .slice(0, 7);
}

export async function getFeatureCost(
  admin: SupabaseClient,
  featureKey: string
): Promise<{ cost: number; active: boolean; label: string } | null> {
  const { data } = await admin
    .from("feature_pricing")
    .select("credit_cost, is_active, label")
    .eq("feature_key", featureKey)
    .maybeSingle();
  if (!data) return null;
  return {
    cost: data.credit_cost as number,
    active: Boolean(data.is_active),
    label: data.label as string,
  };
}

/**
 * 기능 단가로 차감. cost=0 또는 비활성(0)이면 스킵.
 * idempotency_key로 중복 차감 방지.
 */
export async function debitFeatureCredits(
  admin: SupabaseClient,
  params: {
    academyId: string;
    featureKey: string;
    actorId: string | null;
    idempotencyKey: string;
    metadata?: Record<string, unknown>;
    note?: string;
  }
): Promise<{ skipped: boolean; transaction: CreditTransaction | null }> {
  const pricing = await getFeatureCost(admin, params.featureKey);
  if (!pricing) {
    throw new CreditError(
      `과금 설정이 없습니다: ${params.featureKey}`,
      "unknown_feature"
    );
  }
  if (!pricing.active || pricing.cost <= 0) {
    return { skipped: true, transaction: null };
  }

  const { data, error } = await admin.rpc("debit_academy_credits", {
    p_academy_id: params.academyId,
    p_feature_key: params.featureKey,
    p_actor_id: params.actorId,
    p_idempotency_key: params.idempotencyKey,
    p_metadata: params.metadata ?? {},
    p_note: params.note ?? null,
  });

  if (error) mapRpcError(error.message);

  return {
    skipped: false,
    transaction: data as CreditTransaction,
  };
}

export async function grantAcademyCredits(
  admin: SupabaseClient,
  params: {
    academyId: string;
    amount: number;
    actorId: string;
    note?: string;
    idempotencyKey: string;
  }
): Promise<CreditTransaction> {
  const { data, error } = await admin.rpc("grant_academy_credits", {
    p_academy_id: params.academyId,
    p_amount: params.amount,
    p_actor_id: params.actorId,
    p_note: params.note ?? null,
    p_idempotency_key: params.idempotencyKey,
  });
  if (error) mapRpcError(error.message);
  return data as CreditTransaction;
}

export async function adjustAcademyCredits(
  admin: SupabaseClient,
  params: {
    academyId: string;
    amount: number;
    direction: "grant" | "debit";
    actorId: string;
    note?: string;
    idempotencyKey: string;
  }
): Promise<CreditTransaction> {
  const { data, error } = await admin.rpc("adjust_academy_credits", {
    p_academy_id: params.academyId,
    p_amount: params.amount,
    p_direction: params.direction,
    p_actor_id: params.actorId,
    p_note: params.note ?? null,
    p_idempotency_key: params.idempotencyKey,
  });
  if (error) mapRpcError(error.message);
  return data as CreditTransaction;
}

/** 학생·월 단위 좌석 차감 (같은 달·학생은 1회만) */
export async function debitMonthlyStudentSeat(
  admin: SupabaseClient,
  params: {
    academyId: string;
    studentId: string;
    kind: "vocab" | "listening";
    actorId: string | null;
  }
): Promise<{ skipped: boolean; transaction: CreditTransaction | null }> {
  const featureKey =
    params.kind === "vocab"
      ? CREDIT_FEATURES.vocab_student_monthly
      : CREDIT_FEATURES.listening_student_monthly;
  const ym = koreaYearMonth();
  const idempotencyKey = `${featureKey}:${params.academyId}:${params.studentId}:${ym}`;

  return debitFeatureCredits(admin, {
    academyId: params.academyId,
    featureKey,
    actorId: params.actorId,
    idempotencyKey,
    metadata: {
      student_id: params.studentId,
      year_month: ym,
      kind: params.kind,
    },
    note: `${params.kind === "vocab" ? "단어" : "듣기"}학습 ${ym} 학생 이용`,
  });
}

export function creditsErrorResponse(err: unknown): {
  status: number;
  body: { ok: false; message: string; code?: string };
} {
  if (err instanceof InsufficientCreditsError) {
    return {
      status: 402,
      body: { ok: false, message: err.message, code: err.code },
    };
  }
  if (err instanceof CreditError) {
    return {
      status: 400,
      body: { ok: false, message: err.message, code: err.code },
    };
  }
  const message =
    err instanceof Error ? err.message : "크레딧 처리에 실패했습니다.";
  return { status: 500, body: { ok: false, message } };
}
