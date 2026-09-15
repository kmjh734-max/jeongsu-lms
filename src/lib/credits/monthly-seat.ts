import { after } from "next/server";
import type { SupabaseClient } from "@supabase/supabase-js";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  InsufficientCreditsError,
  debitMonthlyStudentSeat,
  getFeatureCost,
  koreaYearMonth,
  monthlySeatFeatureKey,
  monthlySeatIdempotencyKey,
  type MonthlySeatKind,
} from "@/lib/credits";

/*
 * 학생 월 이용료(단어·듣기, 학생마다 한 달에 한 번).
 * - 배정할 때: 새로 배정받는 학생의 이번 달 이용료를 먼저 낸다(모자라면 배정하지 않는다).
 * - 공부할 때: 배정이 이어지는 학생이 새 달에 처음 공부하면 그 달 이용료를 낸다.
 *   학생 공부는 막지 않는다. 잔액이 모자라면 건너뛰고 기록만 남긴다(학원은 잔액 화면에서 본다).
 * 두 곳 모두 같은 차감 키(monthlySeatIdempotencyKey)를 써서 한 달에 두 번 차감되지 않는다.
 */

/** 이 서버 실행 안에서 이미 확인한 키 → 다시 확인할 시각 */
const checkedUntil = new Map<string, number>();
const PAID_RECHECK_MS = 6 * 60 * 60 * 1000;
const FAILED_RECHECK_MS = 10 * 60 * 1000;
const CHECKED_MAX_ENTRIES = 5000;

function rememberChecked(key: string, ms: number) {
  if (checkedUntil.size >= CHECKED_MAX_ENTRIES) checkedUntil.clear();
  checkedUntil.set(key, Date.now() + ms);
}

/** 학생이 지금 듣기 배정(스케줄 과제 또는 세트 배정)을 받고 있는지 */
async function hasActiveListeningAssignment(
  admin: SupabaseClient,
  studentId: string
): Promise<boolean> {
  const [{ data: direct }, { data: directSchedule }, { data: memberships }] =
    await Promise.all([
      admin
        .from("listening_assignments")
        .select("id")
        .eq("student_id", studentId)
        .limit(1)
        .maybeSingle(),
      admin
        .from("listening_schedule_assignments")
        .select("id")
        .eq("target_student_id", studentId)
        .eq("is_active", true)
        .limit(1)
        .maybeSingle(),
      admin.from("class_students").select("class_id").eq("student_id", studentId),
    ]);
  if (direct || directSchedule) return true;

  const classIds = (memberships ?? []).map((r) => r.class_id as string).filter(Boolean);
  if (classIds.length === 0) return false;

  const [{ data: classSchedule }, { data: classSet }] = await Promise.all([
    admin
      .from("listening_schedule_assignments")
      .select("id")
      .in("target_class_id", classIds)
      .eq("is_active", true)
      .limit(1)
      .maybeSingle(),
    admin
      .from("listening_assignments")
      .select("id")
      .in("class_id", classIds)
      .limit(1)
      .maybeSingle(),
  ]);
  return Boolean(classSchedule || classSet);
}

/** 학생이 단어장 배정을 받고 있는지(직접 또는 반) */
async function hasVocabAssignment(
  admin: SupabaseClient,
  studentId: string
): Promise<boolean> {
  const [{ data: direct }, { data: memberships }] = await Promise.all([
    admin
      .from("vocab_assignments")
      .select("id")
      .eq("student_id", studentId)
      .limit(1)
      .maybeSingle(),
    admin.from("class_students").select("class_id").eq("student_id", studentId),
  ]);
  if (direct) return true;
  const classIds = (memberships ?? []).map((r) => r.class_id as string).filter(Boolean);
  if (classIds.length === 0) return false;
  const { data: classRow } = await admin
    .from("vocab_assignments")
    .select("id")
    .in("class_id", classIds)
    .limit(1)
    .maybeSingle();
  return Boolean(classRow);
}

/**
 * 학생이 공부할 때 이번 달 이용료를 낸다(이미 냈으면 아무것도 하지 않는다).
 * 절대 던지지 않는다. assignmentVerified: 부른 쪽이 이미 배정을 확인했으면 true.
 */
export async function ensureStudentMonthlySeat(params: {
  academyId: string;
  studentId: string;
  kind: MonthlySeatKind;
  assignmentVerified?: boolean;
}): Promise<void> {
  const ym = koreaYearMonth();
  const key = monthlySeatIdempotencyKey({
    academyId: params.academyId,
    studentId: params.studentId,
    kind: params.kind,
    yearMonth: ym,
  });
  const until = checkedUntil.get(key);
  if (until && until > Date.now()) return;

  try {
    const admin = createAdminClient();
    const { data: paid } = await admin
      .from("credit_transactions")
      .select("id")
      .eq("academy_id", params.academyId)
      .eq("idempotency_key", key)
      .limit(1)
      .maybeSingle();
    if (paid) {
      rememberChecked(key, PAID_RECHECK_MS);
      return;
    }

    const pricing = await getFeatureCost(admin, monthlySeatFeatureKey(params.kind));
    if (!pricing || !pricing.active || pricing.cost <= 0) {
      rememberChecked(key, FAILED_RECHECK_MS);
      return;
    }

    if (!params.assignmentVerified) {
      const assigned =
        params.kind === "listening"
          ? await hasActiveListeningAssignment(admin, params.studentId)
          : await hasVocabAssignment(admin, params.studentId);
      if (!assigned) {
        rememberChecked(key, FAILED_RECHECK_MS);
        return;
      }
    }

    await debitMonthlyStudentSeat(admin, {
      academyId: params.academyId,
      studentId: params.studentId,
      kind: params.kind,
      actorId: null,
    });
    rememberChecked(key, PAID_RECHECK_MS);
  } catch (e) {
    rememberChecked(key, FAILED_RECHECK_MS);
    if (e instanceof InsufficientCreditsError) {
      console.warn("[monthly-seat] 잔액 부족으로 이번 달 이용료를 건너뜀", key);
      return;
    }
    console.error("[monthly-seat] 이번 달 이용료 차감 실패", key, e);
  }
}

/**
 * ensureStudentMonthlySeat를 응답을 보낸 뒤(after)에 돌린다. 학생 화면을 기다리게 하지 않는다.
 * 이미 확인한 키면 바로 끝낸다.
 */
export function scheduleStudentMonthlySeat(params: {
  academyId: string | null | undefined;
  studentId: string;
  kind: MonthlySeatKind;
  assignmentVerified?: boolean;
}): void {
  const academyId = params.academyId;
  if (!academyId || !params.studentId) return;
  const key = monthlySeatIdempotencyKey({
    academyId,
    studentId: params.studentId,
    kind: params.kind,
  });
  const until = checkedUntil.get(key);
  if (until && until > Date.now()) return;

  const run = () =>
    void ensureStudentMonthlySeat({
      academyId,
      studentId: params.studentId,
      kind: params.kind,
      assignmentVerified: params.assignmentVerified,
    });
  try {
    after(run);
  } catch {
    run();
  }
}

/**
 * 배정할 때: 학생들 중 이번 달 이용료를 아직 안 낸 학생 수만큼 잔액이 되는지 먼저 본다.
 * 모자라면 안내 문구, 되면(또는 가격이 꺼져 있으면) null.
 */
export async function monthlySeatShortfall(
  admin: SupabaseClient,
  params: { academyId: string; studentIds: string[]; kind: MonthlySeatKind }
): Promise<string | null> {
  const studentIds = [...new Set(params.studentIds.filter(Boolean))];
  if (studentIds.length === 0) return null;
  const pricing = await getFeatureCost(admin, monthlySeatFeatureKey(params.kind));
  if (!pricing || !pricing.active || pricing.cost <= 0) return null;

  const ym = koreaYearMonth();
  const keys = studentIds.map((studentId) =>
    monthlySeatIdempotencyKey({
      academyId: params.academyId,
      studentId,
      kind: params.kind,
      yearMonth: ym,
    })
  );
  const paidKeys = new Set<string>();
  for (let i = 0; i < keys.length; i += 100) {
    const { data } = await admin
      .from("credit_transactions")
      .select("idempotency_key")
      .eq("academy_id", params.academyId)
      .in("idempotency_key", keys.slice(i, i + 100));
    for (const row of data ?? []) paidKeys.add(row.idempotency_key as string);
  }
  const unpaid = keys.filter((k) => !paidKeys.has(k)).length;
  if (unpaid === 0) return null;

  const need = pricing.cost * unpaid;
  const { data: wallet } = await admin
    .from("academy_wallets")
    .select("balance")
    .eq("academy_id", params.academyId)
    .maybeSingle();
  const balance = Number(wallet?.balance ?? 0);
  if (balance >= need) return null;
  return `크레딧이 부족합니다. ${pricing.label} ${unpaid}명분 ${need}크레딧이 필요한데 남은 크레딧은 ${balance}입니다. 학원 관리자에게 충전을 요청해 주세요.`;
}

/**
 * 배정할 때: 학생마다 이번 달 이용료를 낸다(이미 낸 학생은 차감 키가 같아 넘어간다).
 * 한 명이라도 못 내면 그 안내 문구를 돌려준다.
 */
export async function chargeMonthlySeatsOnAssign(
  admin: SupabaseClient,
  params: {
    academyId: string;
    studentIds: string[];
    kind: MonthlySeatKind;
    actorId: string;
  }
): Promise<{ ok: true } | { ok: false; message: string }> {
  const studentIds = [...new Set(params.studentIds.filter(Boolean))];
  for (const studentId of studentIds) {
    try {
      await debitMonthlyStudentSeat(admin, {
        academyId: params.academyId,
        studentId,
        kind: params.kind,
        actorId: params.actorId,
      });
    } catch (e) {
      return {
        ok: false,
        message:
          e instanceof InsufficientCreditsError
            ? e.message
            : e instanceof Error
              ? e.message
              : "크레딧 차감 실패",
      };
    }
  }
  return { ok: true };
}
