import { randomUUID } from "node:crypto";
import { createAdminClient } from "@/lib/supabase/admin";
import {
  CreditError,
  InsufficientCreditsError,
  debitFeatureCredits,
  getFeatureCost,
} from "@/lib/credits";

/**
 * 수업자료 기능 크레딧(가격은 feature_pricing). 원가(2026-09-14 실측)의 약 2배로 잡았다.
 * 새로 만들 때만 차감하고, 저장해 둔 결과를 다시 쓰면 차감하지 않는다.
 */
export const LESSON_CREDIT_FEATURES = {
  /** 수업용 자료(어휘·번역·빈칸 후보), 지문당 */
  lessonPack: "lesson_pack",
  /** 지문 분석서, 지문당 */
  analysisReport: "lesson_analysis_report",
  /** 워크북 어법 선택(어법 수정 포함), 지문당 */
  workbookGrammarChoice: "lesson_workbook_grammar_choice",
  /** 워크북 어휘 선택(어휘 수정 포함), 지문당 */
  workbookVocabChoice: "lesson_workbook_vocab_choice",
  /** 워크북 T/F, 지문당(10문항 넘으면 2배) */
  workbookTf: "lesson_workbook_tf",
  /** 지문 삽화, 장당 */
  illustration: "lesson_illustration",
} as const;

export type LessonCreditFeature =
  (typeof LESSON_CREDIT_FEATURES)[keyof typeof LESSON_CREDIT_FEATURES];

/**
 * 만들기 전에 부른다. 잔액이 모자라면 안내 문구를, 넉넉하면(또는 가격이 꺼져 있으면) null.
 * 실제 차감은 새로 만든 뒤 debitLessonCredits로 한다. 만들다 실패하면 차감하지 않는다.
 */
export async function lessonCreditShortfall(
  academyId: string,
  featureKey: LessonCreditFeature | string,
  quantity = 1
): Promise<string | null> {
  const admin = createAdminClient();
  const pricing = await getFeatureCost(admin, featureKey);
  if (!pricing || !pricing.active || pricing.cost <= 0) return null;
  const need = pricing.cost * Math.max(1, Math.floor(quantity));
  const { data } = await admin
    .from("academy_wallets")
    .select("balance")
    .eq("academy_id", academyId)
    .maybeSingle();
  const balance = Number(data?.balance ?? 0);
  if (balance >= need) return null;
  return `크레딧이 부족합니다. ${pricing.label}에 ${need}크레딧이 필요한데 남은 크레딧은 ${balance}입니다. 학원 관리자에게 충전을 요청해 주세요.`;
}

/**
 * 새로 만든 뒤 차감한다(후불). 만들기 전 잔액 확인은 lessonCreditShortfall이 하고, 여기서는
 * 잔액이 모자라도 차감한다(잔액이 마이너스가 될 수 있다). 같은 잔액으로 동시에 시작한 작업들이
 * 모두 확인을 통과한 뒤 차감에 실패해 값을 받지 못하던 것을 막는다(마이그레이션 136).
 * 이미 만든 결과는 버리지 않으므로 차감이 실패해도 결과를 돌려준다. 가격 설정이 아직 없으면
 * 넘어간다. 차감했으면(또는 차감할 가격이 없으면) true.
 */
export async function debitLessonCredits(params: {
  academyId: string;
  actorId: string;
  featureKey: LessonCreditFeature | string;
  quantity?: number;
  projectId?: string;
  /** 같은 차감을 두 번 하지 않게 하는 키. 없으면 매번 새로 차감한다. */
  idempotencyKey?: string;
  metadata?: Record<string, unknown>;
  note?: string;
}): Promise<boolean> {
  // 키를 먼저 정해 두어 다시 시도해도 두 번 차감되지 않게 한다.
  const idempotencyKey =
    params.idempotencyKey ?? `${params.featureKey}:${params.projectId ?? "-"}:${randomUUID()}`;
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      await debitFeatureCredits(createAdminClient(), {
        academyId: params.academyId,
        featureKey: params.featureKey,
        actorId: params.actorId,
        idempotencyKey,
        metadata: {
          ...(params.projectId ? { project_id: params.projectId } : {}),
          ...(params.metadata ?? {}),
        },
        note: params.note,
        quantity: params.quantity,
        allowNegative: true,
      });
      return true;
    } catch (e) {
      if (e instanceof CreditError && e.code === "unknown_feature") return true;
      // 잔액 부족(136 미적용)·가격 꺼짐은 다시 해도 같다. 그 밖(네트워크 등)은 한 번 더 한다.
      const final =
        attempt > 0 ||
        e instanceof InsufficientCreditsError ||
        (e instanceof CreditError && e.code !== "credit_error");
      if (final) {
        console.error("[lesson-credits] debit failed", params.featureKey, e);
        return false;
      }
    }
  }
  return false;
}
