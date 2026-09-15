/**
 * 새 중등 유형(모듈 번호 21~) 생성·저장 직전 정규화.
 * 옛 유형은 fix-typeN-question.ts가 맡고, 여기서는 새 유형의 형식만 맞춘다.
 */
import { buildScriptText } from "@/lib/listening/script-text";
import { isLabelOnlyChoiceSet } from "@/lib/listening/balance-correct-answer";
import type { ListeningGradeLevel } from "@/lib/listening/grade-level";
import { isHighSchoolListeningGrade } from "@/lib/listening/grade-level";
import { miniDialogueMarkerIndex } from "@/lib/listening/new-type-checks";
import { normalizeTableData } from "@/lib/listening/table-data";
import { getTypeDef, keyForCode } from "@/lib/listening/type-catalog";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

const CIRCLED = ["①", "②", "③", "④", "⑤"];
const NUMBER_WORDS = ["one", "two", "three", "four", "five"];

/** 번호 안내 줄을 "Number one." 형식으로, 화자는 ANN으로 */
function normalizeMiniSegments(q: GeneratedListeningQuestion): GeneratedListeningQuestion["segments"] {
  return q.segments.map((s) => {
    const n = miniDialogueMarkerIndex(s.text);
    if (n == null) return s;
    return { speaker: "ANN" as const, text: `Number ${NUMBER_WORDS[n - 1]}.` };
  });
}

/** 상황 설명 끝 문장의 A 이름 → "A: ______" */
function situationBlankLine(q: GeneratedListeningQuestion): string {
  const current = (q.question_text ?? "").trim();
  if (/^[A-Z][A-Za-z]+\s*:\s*_{3,}/.test(current)) return current;
  const last = q.segments[q.segments.length - 1]?.text ?? "";
  const name = last.match(/what would ([A-Z][a-z]+) (?:most likely )?say/)?.[1];
  return name ? `${name}: ______` : current;
}

export function fixNewTypeQuestion(
  q: GeneratedListeningQuestion,
  typeId: number,
  gradeLevel?: ListeningGradeLevel
): GeneratedListeningQuestion {
  if (typeId <= 20 || isHighSchoolListeningGrade(gradeLevel)) return q;
  const key = keyForCode(typeId, "middle");
  if (!key) return q;
  const label = getTypeDef(key).label;
  let out: GeneratedListeningQuestion = { ...q, question_type: q.question_type?.trim() || label };

  if (key === "M_PICTURE_SITUATION" || key === "M_AWKWARD_DIALOGUE") {
    const segments = normalizeMiniSegments(out);
    const prompts = (out.choice_image_prompts ?? []).map(String).filter((p) => p.trim());
    out = {
      ...out,
      segments,
      script_text: buildScriptText(segments),
      choices: [...CIRCLED],
      question_text: "",
      ...(key === "M_PICTURE_SITUATION"
        ? { needs_image_choices: true, visual_choice_type: "scene", choice_image_prompts: prompts.slice(0, 1) }
        : { needs_image_choices: false, visual_choice_type: "none", choice_image_prompts: [] }),
    };
  }

  if (key === "M_FLYER_BLANKS" || key === "M_TABLE_SELECT") {
    const table = normalizeTableData(out.table_data);
    if (table) {
      if (key === "M_FLYER_BLANKS") {
        out = {
          ...out,
          table_data: { ...table, kind: "flyer", mismatch_no: out.correct_answer },
          visual_choice_type: "flyer",
          question_text: "",
        };
      } else {
        const labelOnly = isLabelOnlyChoiceSet(out.choices);
        const correct =
          table.mismatch_no >= 1 && table.mismatch_no <= 5 ? table.mismatch_no : out.correct_answer;
        out = {
          ...out,
          table_data: { ...table, kind: undefined, mismatch_no: correct },
          visual_choice_type: "table",
          question_text: "",
          choices: labelOnly ? [...CIRCLED] : out.choices,
          correct_answer: labelOnly ? correct : out.correct_answer,
        };
      }
    }
  }

  if (key === "M_SITUATION_SAY") {
    out = { ...out, question_text: situationBlankLine(out) };
  }

  return out;
}
