import { fixContinuationQuestion } from "@/lib/listening/fix-continuation-question";
import { fixTableQuestion } from "@/lib/listening/fix-table-question";
import { fixType1Question } from "@/lib/listening/fix-type1-question";
import { fixType2Question } from "@/lib/listening/fix-type2-question";
import { fixType3Question } from "@/lib/listening/fix-type3-question";
import { fixType4Question } from "@/lib/listening/fix-type4-question";
import { fixType5Question } from "@/lib/listening/fix-type5-question";
import { fixType6Question } from "@/lib/listening/fix-type6-question";
import { fixType7Question } from "@/lib/listening/fix-type7-question";
import { fixType8Question } from "@/lib/listening/fix-type8-question";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

/** 생성·저장 직전 유형별 정규화 */
export function applyQuestionFixes(
  q: GeneratedListeningQuestion,
  typeId?: number
): GeneratedListeningQuestion {
  const id = typeId ?? q.order_index;
  let out = fixContinuationQuestion(q, id);
  out = fixTableQuestion(out, id);
  out = fixType1Question(out, id);
  out = fixType2Question(out, id);
  out = fixType3Question(out, id);
  out = fixType4Question(out, id);
  out = fixType5Question(out, id);
  out = fixType6Question(out, id);
  out = fixType7Question(out, id);
  out = fixType8Question(out, id);
  return out;
}
