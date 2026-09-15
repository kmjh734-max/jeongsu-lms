import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { isHighSchoolListeningGrade } from "@/lib/listening/grade-level";
import { allTypeDefs, getTypeDef, keyForCode, typeCode } from "@/lib/listening/type-catalog";

/**
 * 담화·단독 화자 유형의 모듈 번호 (M/W 교대 불필요).
 * 고등 1·3·9·15·16·17, 중등 1·3·5·14 + 새 담화 유형(하는 말의 내용·설명 대상·방송 목적·상황에 맞는 말).
 */
export function getMonologueTypeIds(gradeLevel?: ListeningGradeLevel): Set<number> {
  if (isHighSchoolListeningGrade(gradeLevel)) {
    return new Set([1, 3, 9, 15, 16, 17]);
  }
  const middleMono = allTypeDefs()
    .filter((d) => d.family === "middle" && (d.scriptForm === "monologue" || d.scriptForm === "set_monologue"))
    .map((d) => typeCode(d.key));
  if (
    gradeLevel === "middle3" ||
    gradeLevel === "middle2" ||
    gradeLevel === "middle1"
  ) {
    return new Set(middleMono);
  }
  return new Set([1, 3, 5, 10, 14, 17, 18]);
}

/**
 * M/W가 번갈아 말하는 대화 유형인지 (typeId = 모듈 번호).
 * 짧은 대화 5개(그림 상황·어색한 대화)는 번호 안내(ANN)가 끼어 있어 대화 정리에서 뺀다.
 */
export function isDialogueExamType(
  typeId: number,
  gradeLevel?: ListeningGradeLevel,
  instruction?: string
): boolean {
  if (getMonologueTypeIds(gradeLevel).has(typeId)) return false;
  const families: Array<"middle" | "high"> = gradeLevel
    ? [isHighSchoolListeningGrade(gradeLevel) ? "high" : "middle"]
    : ["high", "middle"];
  for (const family of families) {
    const key = keyForCode(typeId, family);
    if (!key) continue;
    const form = getTypeDef(key).scriptForm;
    if (form === "dialogue") return true;
    if (form === "mini_dialogues") return false;
    if (form === "monologue" || form === "set_monologue") return false;
  }
  if (instruction && /대화/.test(instruction)) return true;
  return false;
}

/** @deprecated */
export function isMiddle1OnlyTypeFix(
  _fixForTypeId: number,
  _gradeLevel?: ListeningGradeLevel
): boolean {
  return false;
}
