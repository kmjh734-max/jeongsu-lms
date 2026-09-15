import { ensureMwDialogueSegments } from "@/lib/listening/ensure-mw-dialogue";
import { inferExamTypeIdForFixes } from "@/lib/listening/infer-exam-type-id";
import {
  isHighSchoolListeningGrade,
  type ListeningGradeLevel,
} from "@/lib/listening/grade-level";
import { fixSwappedScriptLanguage } from "@/lib/listening/fix-script-language";
import { fixContinuationQuestion } from "@/lib/listening/fix-continuation-question";
import { fixType14Question } from "@/lib/listening/fix-type14-question";
import { fixType15Question } from "@/lib/listening/fix-type15-question";
import { fixType16Question } from "@/lib/listening/fix-type16-question";
import { fixType17Question } from "@/lib/listening/fix-type17-question";
import { fixType18Question } from "@/lib/listening/fix-type18-question";
import { fixType19Question } from "@/lib/listening/fix-type19-question";
import { fixType20Question } from "@/lib/listening/fix-type20-question";
import { fixType1Question } from "@/lib/listening/fix-type1-question";
import { fixType2Question } from "@/lib/listening/fix-type2-question";
import { fixType3Question } from "@/lib/listening/fix-type3-question";
import { fixType4Question } from "@/lib/listening/fix-type4-question";
import { fixType5Question } from "@/lib/listening/fix-type5-question";
import { fixType6Question } from "@/lib/listening/fix-type6-question";
import { fixType7Question } from "@/lib/listening/fix-type7-question";
import { fixType8Question } from "@/lib/listening/fix-type8-question";
import { fixType9Question } from "@/lib/listening/fix-type9-question";
import { fixType10Question } from "@/lib/listening/fix-type10-question";
import { fixType11Question } from "@/lib/listening/fix-type11-question";
import { fixType12Question } from "@/lib/listening/fix-type12-question";
import { fixType13Question } from "@/lib/listening/fix-type13-question";
import { fixNewTypeQuestion } from "@/lib/listening/fix-new-type-question";
import {
  fixPriceAnswer,
  isPriceQuestion,
  rebalancePriceChoices,
} from "@/lib/listening/price-check";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

/** 생성·저장 직전 유형별 정규화 */
export function applyQuestionFixes(
  q: GeneratedListeningQuestion,
  typeId?: number,
  gradeLevel?: ListeningGradeLevel
): GeneratedListeningQuestion {
  const slotOrder = q.order_index;
  // 고1·고2는 중등 1~20 유형 fix와 번호 의미가 다름 — 스크립트 언어·연속 화자·금액 검산만
  if (isHighSchoolListeningGrade(gradeLevel)) {
    const highId = typeId ?? inferExamTypeIdForFixes(q, gradeLevel);
    let out = fixSwappedScriptLanguage(q);
    out = ensureMwDialogueSegments(out, highId, gradeLevel, { mergeOnly: true });
    if (isPriceQuestion(out)) out = rebalancePriceChoices(fixPriceAnswer(out).question).question;
    return { ...out, order_index: slotOrder };
  }
  const id = typeId ?? inferExamTypeIdForFixes(q, gradeLevel);
  let out = fixSwappedScriptLanguage(q);
  // 화자 정리(같은 화자 연속 줄 합치기)를 먼저 해야 아래 유형 보정이 실제 화자로 지시문을 맞춘다.
  // 예전에는 보정 뒤에 M↔W를 억지로 번갈아 붙여 부탁·격려·직업 문항의 화자가 뒤집혔다.
  out = ensureMwDialogueSegments(out, id, gradeLevel);
  out = fixContinuationQuestion(out, id);
  out = fixType14Question(out, id, gradeLevel);
  out = fixType1Question(out, id, gradeLevel);
  out = fixType2Question(out, id);
  out = fixType3Question(out, id, gradeLevel);
  out = fixType4Question(out, id);
  out = fixType5Question(out, id, gradeLevel);
  out = fixType6Question(out, id);
  out = fixType7Question(out, id);
  out = fixType8Question(out, id);
  out = fixType9Question(out, id);
  out = fixType10Question(out, id);
  out = fixType11Question(out, id);
  out = fixType12Question(out, id);
  out = fixType13Question(out, id);
  out = fixType15Question(out, id);
  out = fixType16Question(out, id);
  out = fixType17Question(out, id);
  out = fixType18Question(out, id);
  out = fixType19Question(out, id);
  out = fixType20Question(out, id);
  // 새 중등 유형(모듈 번호 21~): 짧은 대화 5개·양식·표 선택·상황에 맞는 말 형식
  out = fixNewTypeQuestion(out, id, gradeLevel);
  // 중3 응답은 공식 문구 "마지막 말에 대한 …의 응답으로" (중1·중2는 "이어질 …의 말로")
  if (gradeLevel === "middle3" && (id === 19 || id === 20)) {
    out = {
      ...out,
      instruction: out.instruction.replace(/마지막 말에 이어질 (남자|여자)의 말로/, "마지막 말에 대한 $1의 응답으로"),
    };
  }
  // 유형 보정이 줄을 바꿨을 수 있으니 연속 줄만 한 번 더 합친다 (화자는 바꾸지 않음)
  out = ensureMwDialogueSegments(out, id, gradeLevel, { mergeOnly: true });
  if (isPriceQuestion(out)) out = rebalancePriceChoices(fixPriceAnswer(out).question).question;
  return { ...out, order_index: slotOrder };
}
