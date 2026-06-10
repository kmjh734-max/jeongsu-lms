import {
  ACADEMY_PRESETS,
  resolveAcademyId,
  type AcademyId,
  type AcademyPreset,
} from "@/config/academies";

const academyId: AcademyId = resolveAcademyId(
  process.env.NEXT_PUBLIC_ACADEMY_ID
);

/** Vercel 프로젝트별 `NEXT_PUBLIC_ACADEMY_ID` (jeongsu | iroom | allbarreun) */
export const ACADEMY_ID = academyId;

export const academyConfig: AcademyPreset = ACADEMY_PRESETS[academyId];

export type AcademyConfig = AcademyPreset;
