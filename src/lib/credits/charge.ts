import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CREDIT_FEATURES,
  creditsErrorResponse,
  debitFeatureCredits,
  debitMonthlyStudentSeat,
  type CreditFeatureKey,
} from "@/lib/credits";

export { CREDIT_FEATURES };

/** AI 사용 1회 차감. 실패 시 Response 반환, 성공 시 null */
export async function chargeFeatureOrError(params: {
  academyId: string | null | undefined;
  featureKey: CreditFeatureKey | string;
  actorId: string;
  idempotencyKey: string;
  metadata?: Record<string, unknown>;
  note?: string;
  /** 단가 × quantity (변형문제 문항 수 등) */
  quantity?: number;
}): Promise<NextResponse | null> {
  if (!params.academyId) {
    return NextResponse.json(
      { ok: false, message: "소속 학원 정보가 없습니다.", code: "no_academy" },
      { status: 403 }
    );
  }
  try {
    const admin = createAdminClient();
    await debitFeatureCredits(admin, {
      academyId: params.academyId,
      featureKey: params.featureKey,
      actorId: params.actorId,
      idempotencyKey: params.idempotencyKey,
      metadata: params.metadata,
      note: params.note,
      quantity: params.quantity,
    });
    return null;
  } catch (err) {
    const mapped = creditsErrorResponse(err);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}

/** 학생 월간 좌석 (단어/듣기). 같은 달 중복은 RPC에서 무시 */
export async function chargeMonthlySeatOrError(params: {
  academyId: string | null | undefined;
  studentId: string;
  kind: "vocab" | "listening";
  actorId: string;
}): Promise<NextResponse | null> {
  if (!params.academyId) {
    return NextResponse.json(
      { ok: false, message: "소속 학원 정보가 없습니다.", code: "no_academy" },
      { status: 403 }
    );
  }
  try {
    const admin = createAdminClient();
    await debitMonthlyStudentSeat(admin, {
      academyId: params.academyId,
      studentId: params.studentId,
      kind: params.kind,
      actorId: params.actorId,
    });
    return null;
  } catch (err) {
    const mapped = creditsErrorResponse(err);
    return NextResponse.json(mapped.body, { status: mapped.status });
  }
}

export async function chargeMonthlySeatsForStudents(params: {
  academyId: string;
  studentIds: string[];
  kind: "vocab" | "listening";
  actorId: string;
}): Promise<NextResponse | null> {
  const unique = [...new Set(params.studentIds.filter(Boolean))];
  for (const studentId of unique) {
    const err = await chargeMonthlySeatOrError({
      academyId: params.academyId,
      studentId,
      kind: params.kind,
      actorId: params.actorId,
    });
    if (err) return err;
  }
  return null;
}
