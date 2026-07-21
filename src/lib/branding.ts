import { academyConfig } from "@/config/academy";
import { ENGCORE } from "@/config/engcore";

/** 플랫폼(EngCore) 표시명 — 로그인·헤더·메타 */
export const SITE_NAME = ENGCORE.name;
export const SITE_NAME_FULL = ENGCORE.fullName;
export const LOGIN_TAGLINE = ENGCORE.tagline;
export const SITE_DESCRIPTION = ENGCORE.description;
export const SITE_SLOGANS = ENGCORE.slogans;
export const SITE_MEANING = ENGCORE.meaning;
export const ENGCORE_PRODUCTS = ENGCORE.products;

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? academyConfig.productionSiteUrl;

/** 학원 로고(테넌트) — 인쇄·리포트 등 학원 맥락 */
export const LOGO_SRC = academyConfig.logoPath;

/** 학원명(테넌트) — 인쇄물·학부모 메시지 등 */
export const ACADEMY_NAME = academyConfig.academyName;
export const ACADEMY_MOTTO = ENGCORE.slogans[1];
export const DIRECTOR_IMAGE_SRC = academyConfig.directorImagePath ?? "";
export const DIRECTOR_CAPTION = academyConfig.directorCaption ?? "";

export const PRIMARY_COLOR = academyConfig.primaryColor;

/** SNS·카카오톡 미리보기용 절대 URL */
export const OG_IMAGE_URL = new URL(LOGO_SRC, SITE_URL).toString();
