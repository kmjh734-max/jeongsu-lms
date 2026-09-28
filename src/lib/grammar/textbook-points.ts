import raw from "@/lib/grammar/textbook-points.generated.json";

/**
 * 고등 교과서(2022개정)가 실제로 다루는 문법 포인트.
 *
 * 선생님 요청(2026-09-29): 참고파일/교과서문법 에 교과서 문법 포인트를 정리해 뒀으니,
 * 그것이 1장 요약자료·워크북·1장 테스트지의 어법 포인트로 나오고, 제시어 배열의
 * 지정 문법에서도 고를 수 있게 하라.
 *
 * 만든 방법 (AI 호출 없음):
 *   1) scripts/grammar-bank/extract_textbook_points.py
 *      — 교과서 145개 과 PDF에서 「│Pattern n│」 쪽마다 포인트 이름·설명·교과서 예문을 뽑는다.
 *   2) scripts/grammar-bank/canon_textbook_points.py
 *      — 출판사마다 다르게 부르는 이름(가주어 it / it ~ to-v 구문 / It ~ for … to부정사)을
 *        낱말 규칙으로 하나로 모은다. 289개가 63가지로 모였다.
 *
 * 교과서가 바뀌면 참고파일을 갈고 두 스크립트를 다시 돌리면 된다.
 */
export interface TextbookGrammarPoint {
  /** 코드 이름 */
  key: string;
  /** 화면·시험지에 적는 이름 */
  label: string;
  /** 이름 뒤 괄호에 붙이는 형태 */
  form: string;
  /** 교과서가 부르는 여러 이름 */
  aliases: string[];
  /** 교과서 예문 */
  examples: string[];
  /** 교과서 전체에서 몇 번 나오는지 */
  count: number;
  /** 몇 종의 교과서에 나오는지 */
  bookCount: number;
  /** 어느 교과서에 나오는지 */
  books: string[];
}

export const TEXTBOOK_GRAMMAR_POINTS = raw as TextbookGrammarPoint[];

/** 여러 교과서가 공통으로 다루는 것부터 — 자주 나오는 순 */
export const TEXTBOOK_POINTS_BY_FREQUENCY = [...TEXTBOOK_GRAMMAR_POINTS].sort(
  (a, b) => b.bookCount - a.bookCount || b.count - a.count || a.label.localeCompare(b.label, "ko")
);

/** 교과서 몇 종 이상에 나오는 것만 (기본 2종) */
export function commonTextbookPoints(minBooks = 2): TextbookGrammarPoint[] {
  return TEXTBOOK_POINTS_BY_FREQUENCY.filter((p) => p.bookCount >= minBooks);
}

const BY_LABEL = new Map(TEXTBOOK_GRAMMAR_POINTS.map((p) => [p.label, p]));
const BY_ALIAS = new Map<string, TextbookGrammarPoint>();
for (const p of TEXTBOOK_GRAMMAR_POINTS) {
  for (const a of p.aliases) BY_ALIAS.set(a, p);
}

/** 이름이나 교과서가 부르는 이름으로 찾기 */
export function findTextbookPoint(name: string): TextbookGrammarPoint | null {
  const t = (name ?? "").trim();
  return BY_LABEL.get(t) ?? BY_ALIAS.get(t) ?? null;
}
