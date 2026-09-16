/**
 * 새 중등 유형(모듈 번호 21~) 규칙 검수 — 모델 호출 없음.
 * 옛 유형은 quality-check.ts의 typeId 분기가 보고, 여기서는 새 유형의 형식만 본다
 * (짧은 대화 5개 구조, 양식 빈칸, 인용 표현, 표 선택, 날짜·거스름돈, 상황에 맞는 말).
 */
import { enStems, overlapRatio } from "@/lib/listening/answer-leak-checks";
import { isLabelOnlyChoiceSet, numericChoiceValue } from "@/lib/listening/balance-correct-answer";
import type { GenericQualityIssue } from "@/lib/listening/generic-quality-checks";
import {
  isHighSchoolListeningGrade,
  type ListeningGradeLevel,
} from "@/lib/listening/grade-level";
import { flyerBlankRows, normalizeTableData, parseFlyerChoice } from "@/lib/listening/table-data";
import { spokenAmountForms } from "@/lib/listening/price-check";
import { keyForCode } from "@/lib/listening/type-catalog";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

const CIRCLED = ["①", "②", "③", "④", "⑤"];
const NUMBER_WORDS = ["one", "two", "three", "four", "five"];

/** "Number one." 같은 번호 안내 줄 */
export function miniDialogueMarkerIndex(text: string): number | null {
  const m = String(text ?? "").trim().match(/^number\s+(one|two|three|four|five|[1-5])\s*[.!]?$/i);
  if (!m) return null;
  const w = m[1]!.toLowerCase();
  const n = NUMBER_WORDS.indexOf(w);
  return n >= 0 ? n + 1 : Number(w);
}

/** 짧은 대화 5개로 나눈다 (번호 안내 기준). 구조가 맞지 않으면 null */
export function splitMiniDialogues(
  segments: Array<{ speaker: string; text: string }>
): Array<Array<{ speaker: string; text: string }>> | null {
  const groups: Array<Array<{ speaker: string; text: string }>> = [];
  for (const s of segments) {
    const n = s.speaker === "ANN" ? miniDialogueMarkerIndex(s.text) : null;
    if (n != null) {
      if (n !== groups.length + 1) return null;
      groups.push([]);
      continue;
    }
    if (groups.length === 0) return null;
    groups[groups.length - 1]!.push(s);
  }
  return groups.length === 5 ? groups : null;
}

function personCode(label: string | undefined): "M" | "W" | null {
  if (label === "남자") return "M";
  if (label === "여자") return "W";
  return null;
}

function norm(s: string): string {
  return String(s ?? "")
    .toLowerCase()
    .replace(/[‘’]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** 숫자 → 말로 읽는 형태 ("15" → "fifteen") */
function numberWord(n: number): string | null {
  if (!Number.isInteger(n) || n < 0 || n >= 1000) return null;
  return spokenAmountForms(n)[0]!.replace(/ dollars?$/, "");
}

/** 양식 빈칸 값이 대본에 나오는지 (숫자는 숫자·영어 단어 둘 다, 단어 일부만 맞아도 인정) */
function valueHeardInScript(value: string, script: string): boolean {
  // 시각 "11:00 a.m." → "11" (대본은 "eleven o'clock"처럼 말한다), "4:30 p.m." → "4 30"
  const v = norm(value)
    .replace(/[$,]/g, "")
    .replace(/\b(\d{1,2}):00\b/g, "$1")
    .replace(/\b(\d{1,2}):(\d{2})\b/g, "$1 $2")
    .replace(/\b[ap]\.?m\.?/g, "")
    .replace(/\.$/, "")
    .trim();
  if (!v) return false;
  const s = norm(script).replace(/[$,]/g, "");
  if (s.includes(v)) return true;
  const tokens = v.split(/[\s:–-]+/).filter((t) => t.length >= 2 || /\d/.test(t));
  return (
    tokens.length > 0 &&
    tokens.every((t) => {
      if (s.includes(t)) return true;
      const num = /^\d+$/.test(t) ? numberWord(Number(t)) : null;
      return num != null && s.includes(num);
    })
  );
}

export function newTypeQualityIssues(
  q: GeneratedListeningQuestion,
  typeId: number,
  gradeLevel: ListeningGradeLevel | undefined
): GenericQualityIssue[] {
  if (isHighSchoolListeningGrade(gradeLevel) || typeId <= 20) return [];
  const key = keyForCode(typeId, "middle");
  if (!key) return [];
  const issues: GenericQualityIssue[] = [];
  const choices = (q.choices ?? []).map((c) => String(c ?? "").trim());
  const segs = q.segments ?? [];
  const script = segs.map((s) => s.text).join(" ");
  const ins = q.instruction ?? "";

  if (key === "M_PICTURE_SITUATION" || key === "M_AWKWARD_DIALOGUE") {
    const groups = splitMiniDialogues(segs);
    if (!groups) {
      issues.push({
        code: "mini_dialogue_structure",
        message: "짧은 대화 5개 구조가 아닙니다 (ANN \"Number one.\"~\"Number five.\" 뒤에 각 대화).",
        weight: 35,
      });
    } else {
      const bad = groups.findIndex(
        (g) => g.length !== 2 || g.some((s) => s.speaker !== "M" && s.speaker !== "W") || g[0]!.speaker === g[1]!.speaker
      );
      if (bad >= 0) {
        issues.push({
          code: "mini_dialogue_pair",
          message: `${CIRCLED[bad]} 대화가 남녀 두 줄(말하기 → 대답)이 아닙니다.`,
          weight: 20,
        });
      }
    }
    if (choices.join("") !== CIRCLED.join("")) {
      issues.push({ code: "mini_dialogue_choices", message: "선택지는 ①~⑤여야 합니다.", weight: 25 });
    }
    if (key === "M_PICTURE_SITUATION") {
      const prompts = (q.choice_image_prompts ?? []).filter((p) => String(p).trim());
      if (prompts.length !== 1) {
        issues.push({
          code: "scene_image_prompt",
          message: "그림 상황 문항은 장면 그림 설명(choice_image_prompts)이 1개 있어야 합니다.",
          weight: 20,
        });
      } else if (/["“”]|\btext\b|\bsign that says\b|\bwritten\b|\bspeech bubble/i.test(prompts[0]!) && !/no (?:text|words|letters)/i.test(prompts[0]!)) {
        issues.push({
          code: "scene_image_text",
          message: "장면 그림 설명에 글자·말풍선이 들어가 있습니다(그림에는 글자를 넣지 않는다).",
          weight: 6,
        });
      }
    }
  }

  if (key === "M_FLYER_BLANKS") {
    const table = q.table_data ? normalizeTableData(q.table_data) : null;
    if (!table || table.kind !== "flyer") {
      issues.push({ code: "flyer_missing", message: "양식(전단·티켓) 표가 없거나 빈칸 (A)(B)가 없습니다.", weight: 35 });
    } else {
      const blanks = flyerBlankRows(table);
      if (!blanks.a || !blanks.b) {
        issues.push({ code: "flyer_blanks", message: "양식에 빈칸 (A)와 (B)가 하나씩 있어야 합니다.", weight: 25 });
      }
    }
    const pairs = choices.map(parseFlyerChoice);
    if (pairs.some((p) => !p)) {
      issues.push({ code: "flyer_choice_format", message: "선택지는 \"(A) 값 – (B) 값\" 형식이어야 합니다.", weight: 20 });
    } else {
      const key5 = pairs[q.correct_answer - 1]!;
      if (!valueHeardInScript(key5.a, script) || !valueHeardInScript(key5.b, script)) {
        issues.push({
          code: "flyer_answer_not_heard",
          message: "정답 짝의 (A)·(B) 값이 대본에 나오지 않습니다.",
          weight: 25,
        });
      }
      const keyStr = pairs.map((p) => `${norm(p!.a)}|${norm(p!.b)}`);
      if (new Set(keyStr).size !== 5) {
        issues.push({ code: "duplicate_choices", message: "같은 (A)(B) 짝이 두 번 있습니다.", weight: 30 });
      }
    }
  }

  if (key === "M_EXPRESSION_MEANING") {
    const quote = ins.match(/[“"]([^”"]+)[”"]/)?.[1]?.trim();
    if (!quote) {
      issues.push({ code: "expression_not_quoted", message: "지시문에 대본 속 영어 표현이 인용되어 있지 않습니다.", weight: 30 });
    } else {
      const who = personCode(ins.match(/(남자|여자)(?:의|가)/)?.[1]);
      const hit = segs.find((s) => norm(s.text).includes(norm(quote).replace(/[.!?]+$/, "")));
      if (!hit) {
        issues.push({ code: "expression_not_in_script", message: `인용한 표현 "${quote}"이 대본에 없습니다.`, weight: 35 });
      } else if (who && hit.speaker !== who) {
        issues.push({
          code: "expression_speaker_mismatch",
          message: "지시문의 화자와 대본에서 그 표현을 말한 화자가 다릅니다.",
          weight: 30,
        });
      }
    }
  }

  if (key === "M_TABLE_SELECT") {
    const table = q.table_data ? normalizeTableData(q.table_data) : null;
    if (!table || table.kind === "flyer") {
      issues.push({ code: "table_missing", message: "표 보고 고르기 문항에 표(5행)가 없습니다.", weight: 35 });
    } else if (table.mismatch_no !== q.correct_answer) {
      issues.push({
        code: "table_answer_row",
        message: `표의 정답 행(${table.mismatch_no})과 정답 번호(${q.correct_answer})가 다릅니다.`,
        weight: 30,
      });
    }
    if (!isLabelOnlyChoiceSet(choices)) {
      issues.push({ code: "table_choices", message: "표 보고 고르기 선택지는 표의 행 번호 ①~⑤여야 합니다.", weight: 10 });
    }
  }

  if (key === "M_DATE") {
    if (choices.length === 5 && choices.some((c) => numericChoiceValue(c) == null)) {
      issues.push({
        code: "date_choice_format",
        message: "날짜 선택지는 \"5월 12일\"(요일 문항은 \"월요일\") 형식이어야 합니다.",
        weight: 12,
      });
    }
  }

  if (key === "M_AMOUNT" && /거스름돈/.test(ins) && q.price_calculation && q.price_calculation.paid_amount == null) {
    issues.push({
      code: "change_paid_missing",
      message: "거스름돈 문항인데 낸 돈(paid_amount)이 계산식에 없어 정답을 검산할 수 없습니다.",
      weight: 8,
    });
  }

  if (key === "M_SITUATION_SAY") {
    const last = segs[segs.length - 1]?.text ?? "";
    if (!/in this situation, what would .+ (?:most likely )?say to .+\?\s*$/i.test(last)) {
      issues.push({
        code: "situation_ending",
        message: "상황 설명의 마지막 문장은 \"In this situation, what would A most likely say to B?\"여야 합니다.",
        weight: 15,
      });
    }
    if (!/^\s*[A-Z][A-Za-z]+\s*:\s*_{3,}/.test(q.question_text ?? "")) {
      issues.push({ code: "situation_blank", message: "question_text는 \"이름: ______\" 형식이어야 합니다.", weight: 8 });
    }
    if (segs.some((s) => s.speaker !== segs[0]?.speaker)) {
      issues.push({ code: "situation_one_narrator", message: "상황 설명은 나레이터 한 명이 읽어야 합니다.", weight: 15 });
    }
    // 나레이션이 "그는 …해 달라고 부탁하고 싶다"를 정답 문장과 같은 말로 쓰면 듣지 않아도 답이 보인다
    const answer = choices[q.correct_answer - 1] ?? "";
    const answerStems = enStems(answer);
    const narration = segs.map((s) => s.text).join(" ").replace(/in this situation.*$/i, "");
    // 내용어가 둘뿐인 짧은 정답은 사물 이름이 겹칠 수밖에 없어(중1) 셋 이상일 때만 본다
    if (answerStems.length >= 3 && overlapRatio(answerStems, enStems(narration)) >= 0.6) {
      issues.push({
        code: "situation_answer_echo",
        message: "상황 설명이 정답 문장과 같은 단어로 의도를 말해 답이 드러납니다. 의도는 밝히되 다른 표현으로 쓰세요.",
        weight: 10,
      });
    }
  }

  if (key === "M_RELATION" && choices.length === 5 && choices.some((c) => !/\s[–—-]\s/.test(c))) {
    issues.push({ code: "relation_choice_format", message: "관계 선택지는 \"손님 – 점원\"처럼 A – B 형식이어야 합니다.", weight: 8 });
  }

  if (key === "M_NOT_MENTIONED_DIALOGUE" && q.mention_plan) {
    const plan = q.mention_plan;
    const labels = plan.choice_items.map((i) => i.label);
    if (labels.join("|") !== choices.join("|")) {
      issues.push({ code: "mention_plan_order", message: "선택지 순서가 mention_plan 순서와 다릅니다.", weight: 8 });
    }
    if (plan.unmentioned_no && plan.unmentioned_no !== q.correct_answer) {
      issues.push({ code: "mention_plan_answer", message: "mention_plan의 언급되지 않은 항목과 정답이 다릅니다.", weight: 20 });
    }
  }

  return issues;
}
