/**
 * 1장 요약직보자료가 "정말 시험에 나올 자리"를 고르게 하는 기준.
 *
 * 선생님 지적(2026-09-20): "변형문제에 함축의미추론·어법·빈칸추론 로직을 잘 살펴봐. 거기는 좋은
 * 문제들이 많이 나온다." 변형문제 엔진이 쓰는 교재 단원별 어법 케이스(grammar-catalog)와
 * 함축의미·빈칸 출제 기준을 1장 자료에도 그대로 쓴다.
 */
import { GRAMMAR_HARD_BANS, GRAMMAR_UNIT_BANKS } from "@/lib/question-generator/grammar-catalog";

export type ExamGrammarCase = { id: string; unit: string; name: string; koLabel: string; koTip: string };

const CASES: ExamGrammarCase[] = GRAMMAR_UNIT_BANKS.flatMap((u) =>
  u.cases.map((c) => ({ id: c.id, unit: u.title, name: c.name, koLabel: c.koLabel, koTip: c.koTip }))
);

const BY_ID = new Map(CASES.map((c) => [c.id.toLowerCase(), c]));

/** 교재 빈출 어법 케이스(변형문제 어법추론이 쓰는 것과 같은 목록) */
export function examGrammarCase(id: string | undefined | null): ExamGrammarCase | null {
  return BY_ID.get(String(id ?? "").trim().toLowerCase()) ?? null;
}

/** 어법 프롬프트에 붙이는 빈출 자리 목록 */
export function examGrammarCaseBlock(): string {
  const lines: string[] = ["=== 내신·모의고사 어법 빈출 자리 (교재 단원별) ==="];
  for (const u of GRAMMAR_UNIT_BANKS) {
    lines.push(`[${u.title}]`);
    for (const c of u.cases) lines.push(`- ${c.id} | ${c.name} | 네모 형태: ${c.pairForms} | ${c.mechanism}`);
  }
  lines.push("", "=== 이런 자리는 시험에 나오지 않는다(넣지 마라) ===", ...GRAMMAR_HARD_BANS.map((b) => `- ${b}`));
  return lines.join("\n");
}

/**
 * 빈칸 추론 자리 고르기. 변형문제 문장빈칸(효자·학력평가형)이 쓰는 기준 그대로:
 * 글의 흐름을 떠받치는 자리를 빈칸으로 하고, 답은 앞뒤 논리로만 정해져야 한다.
 */
export function examBlankFocusRules(): string {
  return `빈칸 추론 자리 기준(학력평가 31~34번과 같게):
- 빈칸이 될 자리: 주제문·결론문, 또는 주제를 다시 말한 문장의 핵심 어구. 그 어구를 가리면 글의 요지가 사라져야 한다.
- 답을 정하는 근거가 빈칸 밖에 있어야 한다: 대조(but, however), 인과(because, so), 예시(for example)로 이어지는 앞뒤 문장, 같은 말을 달리 한 자리, 반복되는 대조 축.
- 다음은 빈칸으로 쓰지 않는다: 예시·숫자·고유명사·연구자 이름, 상식으로 채워지는 자리, 앞 문장을 그대로 베껴 넣으면 되는 자리, 빈칸 안에서 답이 보이는 자리.
- distractors(오답 방향)는 변형문제 오답 기법으로 적는다: 원인과 결과 바꾸기, 주체와 대상 바꾸기, 전체 주장을 세부 사례로 좁히기, 정도를 지나치게 넓히거나(always·only) 줄이기, 지문의 두 개념을 엉뚱하게 잇기, 글 속 통념을 필자 주장으로 오해하기.`;
}

/**
 * 바꿔 쓰기 표현 고르기. 변형문제 함축의미추론·특정표현의미서술이 쓰는 기준:
 * 사전 뜻이 아니라 이 문맥에서만 살아나는 표현을 고른다.
 */
export function examParaphraseFocusRules(): string {
  return `바꿔 쓰기 표현 기준(함축의미추론 21번·서술형 표현 쓰기와 같게):
- 고를 것: 이 문맥에서만 뜻이 살아나는 표현(비유·관용·완곡한 말), 주제문·결론문에서 요지를 떠받치는 구, 고등 내신 서술형에 그대로 나오는 구동사·숙어·구문.
- 뜻은 사전 뜻이 아니라 이 지문에서 가리키는 것으로 적는다. 예: do double duty → "두 가지 일을 한다"(X, 직역) / "한 가지 장치가 두 몫을 한다"(O, 문맥).
- 바꿔 쓴 영어 표현은 그 문맥 뜻을 담아야 하고, 지문의 다른 구절을 그대로 베끼지 않는다.
- 빼야 할 것: 누구나 아는 일상 표현(a lot of, in the past, more and more), 직역만으로 끝나는 구, 글의 흐름과 상관없는 표현, 고유명사·숫자가 들어간 구.`;
}
