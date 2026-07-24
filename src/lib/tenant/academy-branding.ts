import { cache } from "react";
import {
  ACADEMY_NAME,
  LOGO_SRC,
  PRIMARY_COLOR,
} from "@/lib/branding";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient } from "@/lib/supabase/server";

export type AcademyBranding = {
  id: string | null;
  name: string;
  slug: string | null;
  /** 웹 경로 또는 절대 URL */
  logoUrl: string;
  primaryColor: string;
};

/** env 프리셋 폴백 (DB 학원 없을 때) */
export function fallbackAcademyBranding(): AcademyBranding {
  return {
    id: null,
    name: ACADEMY_NAME,
    slug: null,
    logoUrl: LOGO_SRC,
    primaryColor: PRIMARY_COLOR,
  };
}

function mapAcademyRow(row: {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  primary_color: string | null;
}): AcademyBranding {
  return {
    id: row.id,
    name: row.name,
    slug: row.slug,
    // 다른 학원에 정수학원 로고가 붙지 않도록 — 없으면 빈 값(이름만 표시)
    logoUrl: row.logo_url?.trim() || "",
    primaryColor: row.primary_color?.trim() || PRIMARY_COLOR,
  };
}

/** academy_id로 학원 브랜딩 조회 (service role, 요청당 캐시) */
export const getAcademyBranding = cache(async function getAcademyBranding(
  academyId: string | null | undefined
): Promise<AcademyBranding> {
  if (!academyId) return fallbackAcademyBranding();

  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("academies")
      .select("id, name, slug, logo_url, primary_color")
      .eq("id", academyId)
      .maybeSingle();

    if (!data) return fallbackAcademyBranding();
    return mapAcademyRow(data);
  } catch {
    return fallbackAcademyBranding();
  }
});

/** 로그인 사용자 세션으로 조회 (RLS: 자기 학원 또는 super_admin) */
export async function getAcademyBrandingForCurrentUser(): Promise<AcademyBranding> {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return fallbackAcademyBranding();

    const { data: profile } = await supabase
      .from("profiles")
      .select("academy_id, role")
      .eq("id", user.id)
      .maybeSingle();

    if (!profile) return fallbackAcademyBranding();

    // super_admin은 기본(폴백) 또는 별도 지정 없음 → 폴백
    if (profile.role === "super_admin") {
      return fallbackAcademyBranding();
    }

    return getAcademyBranding(profile.academy_id as string | null);
  } catch {
    return fallbackAcademyBranding();
  }
}

/** slug로 조회 (활성 학원만). 없으면 null — 요청당 1회 캐시 */
export const getActiveAcademyBySlug = cache(async function getActiveAcademyBySlug(
  slug: string | null | undefined
): Promise<AcademyBranding | null> {
  const normalized = slug?.trim().toLowerCase().replace(/[^a-z0-9-]/g, "");
  if (!normalized) return null;
  try {
    const admin = createAdminClient();
    const { data } = await admin
      .from("academies")
      .select("id, name, slug, logo_url, primary_color, status")
      .eq("slug", normalized)
      .maybeSingle();
    if (!data || data.status !== "active") return null;
    return mapAcademyRow(data);
  } catch {
    return null;
  }
});

/** slug로 조회 (폴백 포함 — 인쇄 등) */
export async function getAcademyBrandingBySlug(
  slug: string | null | undefined
): Promise<AcademyBranding> {
  const found = await getActiveAcademyBySlug(slug);
  return found ?? fallbackAcademyBranding();
}
