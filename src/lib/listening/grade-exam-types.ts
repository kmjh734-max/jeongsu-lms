/**
 * 학년 배치표(grade-blueprints) + 유형 카탈로그(type-catalog) → 번호별 ExamTypeTemplate.
 *
 * - 중1·고등: 예전 템플릿(exam-types-middle1 / exam-types-high1)의 문구를 그대로 쓰고 key·code만 붙인다
 *   (생성 프롬프트가 예전과 한 글자도 달라지지 않게).
 * - 중2·중3: 배치가 중1과 달라 카탈로그에서 만든다. 옛 모듈이 있는 유형은 code가 옛 번호라
 *   typeN 프롬프트·fix-typeN·검수가 그대로 돈다.
 */
import type { ListeningDifficultyTier } from "@/lib/listening/exam-difficulty";
import type { ExamTypeTemplate } from "@/lib/listening/exam-type-template";
import {
  getGradeBlueprint,
  type BlueprintSlot,
} from "@/lib/listening/grade-blueprints";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import {
  findVariant,
  getTypeDef,
  instructionFor,
  responseDirectionOf,
  typeCode,
  type ListeningTypeKey,
} from "@/lib/listening/type-catalog";

/** 배치표 한 자리 → 카탈로그 문구로 만든 템플릿 (중2·중3) */
export function templateFromCatalog(
  key: ListeningTypeKey,
  position: number,
  opts?: { variants?: string[]; tier?: ListeningDifficultyTier; grade?: ListeningGradeLevel }
): ExamTypeTemplate {
  const def = getTypeDef(key);
  // 이 자리에서 변형이 하나로 정해져 있으면(중3 17 = 남→여) 그 지시문을 기본으로 쓴다
  const fixed = opts?.variants?.length === 1 ? opts.variants[0] : undefined;
  return {
    id: position,
    key,
    code: typeCode(key, fixed),
    ...(fixed ? { variant: fixed } : {}),
    question_type: def.label,
    instruction: instructionFor(key, fixed, opts?.grade),
    format_guide: def.format_guide,
    segment_guide: def.segment_guide,
    choice_guide: def.choice_guide,
    difficulty_tier: opts?.tier ?? def.tier,
  };
}

/** 예전 템플릿(번호 = 모듈 번호)에 key·code를 붙인다 — 문구는 건드리지 않는다 */
export function decorateLegacyTemplates(
  templates: ExamTypeTemplate[],
  grade: ListeningGradeLevel
): ExamTypeTemplate[] {
  const blueprint = getGradeBlueprint(grade);
  return templates.map((t) => {
    const slot = blueprint.find((s) => s.position === t.id);
    if (!slot) return t;
    // 응답 유형: 지시문에 방향이 적혀 있으면 그대로(중1 19 여→남·20 남→여), 없으면 배치표 방향(고등 11~14)
    const dir = responseDirectionOf({ instruction: t.instruction }) ?? slot.variants?.[0];
    return { ...t, key: slot.key, code: typeCode(slot.key, dir) };
  });
}

/** 중2·중3 배치표 → 템플릿 */
export function templatesFromBlueprint(grade: ListeningGradeLevel): ExamTypeTemplate[] {
  return getGradeBlueprint(grade).map((s: BlueprintSlot) =>
    templateFromCatalog(s.key, s.position, { variants: s.variants, grade })
  );
}

/**
 * 정한 변형을 템플릿에 반영한다 (지시문·모듈 번호).
 * variantId가 비어 있으면("" 또는 undefined) 템플릿 그대로 — 중1·고등은 예전 지시문이 남는다.
 */
export function withTemplateVariant(
  t: ExamTypeTemplate,
  variantId: string | undefined | null,
  grade?: ListeningGradeLevel
): ExamTypeTemplate {
  if (!t.key || !variantId) return t;
  const v = findVariant(t.key, variantId);
  if (!v) return t;
  return {
    ...t,
    variant: variantId,
    instruction: instructionFor(t.key, variantId, grade),
    code: typeCode(t.key, variantId),
  };
}
