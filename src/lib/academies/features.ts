import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * 학원마다 켜고 끄는 기능.
 *
 * 켠 학원만 그 기능을 쓸 수 있다. 값은 academies.settings.features 에 담아 두고,
 * 슈퍼관리자 화면의 「기능」 탭에서 켜고 끈다. 새 기능을 넣을 때는 여기에 한 줄 보태면
 * 슈퍼관리자 화면에도 저절로 나온다.
 */
export const ACADEMY_FEATURES = [
  {
    key: "textbook_passages",
    label: "교과서 지문 불러오기",
    hint: "수업자료 입력·동형모의고사·문제 만들기에서 교과서 본문을 골라 넣을 수 있습니다.",
  },
  {
    key: "grammar_bank",
    label: "중학 문법 문제 은행",
    hint: "레벨·단원별로 문법 문항을 골라 시험지와 정답지로 뽑을 수 있습니다.",
  },
  {
    /* 선생님 결정(2026-10-07): 마케팅 탭의 예비고1·예비중1 어휘 진단은 정수학원만 쓴다. */
    key: "vocab_diagnostic",
    label: "마케팅: 어휘 진단",
    hint: "예비고1·예비중1 학생에게 개인 링크로 어휘 진단을 보내고 결과 링크를 줍니다.",
  },
] as const;

export type AcademyFeatureKey = (typeof ACADEMY_FEATURES)[number]["key"];

export type AcademyFeatures = Record<AcademyFeatureKey, boolean>;

/** settings 안의 features를 읽어 빠진 것은 꺼진 것으로 채워 준다 */
export function readAcademyFeatures(settings: unknown): AcademyFeatures {
  const holder = (settings ?? {}) as { features?: Record<string, unknown> };
  const saved = holder.features ?? {};
  const out = {} as AcademyFeatures;
  for (const feature of ACADEMY_FEATURES) {
    out[feature.key] = saved[feature.key] === true;
  }
  return out;
}

/** 이 학원에서 그 기능을 켰는지 */
export async function isAcademyFeatureOn(
  admin: SupabaseClient,
  academyId: string | null | undefined,
  key: AcademyFeatureKey,
): Promise<boolean> {
  if (!academyId) return false;
  const { data } = await admin
    .from("academies")
    .select("settings")
    .eq("id", academyId)
    .maybeSingle();
  return readAcademyFeatures(data?.settings)[key];
}
