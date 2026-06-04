import { ensureMwDialogueSegments } from "@/lib/listening/ensure-mw-dialogue";
import { inferExamTypeIdForFixes } from "@/lib/listening/infer-exam-type-id";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
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
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

/** 생성·저장 직전 유형별 정규화 */
export function applyQuestionFixes(
  q: GeneratedListeningQuestion,
  typeId?: number,
  gradeLevel?: ListeningGradeLevel
): GeneratedListeningQuestion {
  const id = typeId ?? inferExamTypeIdForFixes(q, gradeLevel);
  let out = fixSwappedScriptLanguage(q);
  out = fixContinuationQuestion(out, id);
  out = fixType14Question(out, id);
  out = fixType1Question(out, id);
  out = fixType2Question(out, id);
  out = fixType3Question(out, id);
  out = fixType4Question(out, id);
  out = fixType5Question(out, id);
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
  out = ensureMwDialogueSegments(out, id);
  return out;
}
