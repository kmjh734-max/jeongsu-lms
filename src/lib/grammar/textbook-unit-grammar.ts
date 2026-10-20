import raw from "@/lib/grammar/textbook-unit-grammar.generated.json";
import { WRITING_GRAMMARS } from "@/lib/question-generator/writing-grammar";

/**
 * 교과서 과 → 단원문법.
 *
 * 선생님 요청(2026-10-19): 테스트 교재의 중요문장 어순배열은 교과서 지문이면 그 과의 단원문법이
 * 든 문장을 써야 한다. 단원문법은 참고파일/교과서문법(출판사·과별 Grammar Build Up PDF)에서 뽑아
 * 미리 저장해 둔다 — scripts/grammar-bank/build-unit-grammar.mts (모델 호출 없음).
 *
 * 문장 감지는 변형문제 지정 문법(WRITING_GRAMMARS.check)을 쓰고, 거기 없는 몇 가지만 여기서 보탠다.
 */

export type UnitGrammarPoint = {
  /** 교과서가 부르는 이름 */
  title: string;
  /** 표준 이름(textbook-points) */
  label: string | null;
  /** 감지 규칙이 있는 지정 문법 이름 */
  writing: string | null;
};

const UNITS = raw as Record<string, UnitGrammarPoint[]>;

/** 지정 문법에 감지 규칙이 없는 표준 이름 — 확실히 잡히는 꼴만 */
const EXTRA_CHECKS: Record<string, RegExp> = {
  "so/such ~ that": /\b(?:so\s+(?:\w+\s+){1,2}|such\s+(?:an?\s+)?(?:\w+\s+){1,3})that\b/i,
  간접의문문: /\b(?:know|knows|knew|wonder|wondered|ask|asked|tell|told|understand|explain|explained|see|decide|decided|find out|figure out)\s+(?:what|why|how|where|when|who|whether|if)\b/i,
  "5형식 목적격보어 to부정사": /\b(?:want|wants|wanted|ask|asks|asked|allow|allows|allowed|enable|enables|enabled|encourage|encourages|encouraged|expect|expects|expected|tell|tells|told|force|forced|cause|causes|caused|require|requires|required|advise|advised|persuade|persuaded)\s+(?:\w+\s+){1,2}to\s+[a-z]+/i,
  현재완료: /\b(?:have|has)\s+(?:not\s+|never\s+|already\s+|just\s+)?(?:been|[a-z]+ed|[a-z]+en|done|made|said|found|built|grown)\b/i,
  "접속사 while / whereas": /\b(?:while|whereas)\b/i,
  "be being + 형용사": /\b(?:is|are|was|were)\s+being\s+[a-z]+/i,
};

/**
 * 지정 문법 검사보다 좁게 보는 것. 복합관계사는 문장 앞 연결어 「However,」를 빼고(쉼표가 바로 오면
 * 연결어), 조동사 + have p.p.는 사이에 not이 낀 「may not have realized」도 잡는다.
 */
const UNIT_CHECKS: Record<string, RegExp> = {
  복합관계사: /\b(?:whatever|whoever|whomever|whichever|whenever|wherever)\b|\bhowever\s+[a-z]/i,
  // 관계부사는 선행사(곳·때·이유) 뒤나 「, where」만(의문사 how·when은 빼고)
  관계부사:
    /\b(?:place|area|city|town|country|world|room|house|home|time|day|year|moment|period|era|age|reason|point|situation|case|spot|region|land|village|school|island|site|street|museum|market|office|park|station)s?\s+(?:where|when|why)\b|,\s*(?:where|when)\s+[a-z]+\s+[a-z]+/i,
  // 「while in space」「when asked」처럼 V-ing가 아닌 꼴도(접속사 바로 뒤 전치사·과거분사)
  "부사절의 「주어+be동사」 생략":
    /\b(?:when|while|if|though|although|unless|once|until)\s+(?:\w+ing|in|on|at|under|asked|given|done|finished|compared|used|needed|possible|necessary)\b/i,
  "with + 명사 + 분사":
    /\bwith\s+(?:(?:a|an|the|his|her|their|its|my|our|your|one's)\s+)?(?:[a-z]+\s+){0,2}[a-z]+\s+(?:[a-z]{2,}ing|[a-z]{3,}ed|done|gone|known|shown|broken|hidden|spread|shut|held|left|kept)\b(?=\s*[,.;!?”"]|\s*$|\s+(?:in|on|at|by|to|from|over|up|down|out|behind|around|and)\b)/i,
  "조동사 + have p.p.": /\b(?:must|should|could|would|might|may)\s+(?:not\s+|never\s+)?have\s+(?:been\s+)?[a-z]+(?:ed|en|wn|ne|ght|t|de)\b/i,
};

const CHECK_BY_LABEL = new Map<string, RegExp>([
  ...WRITING_GRAMMARS.filter((g) => g.check).map((g) => [g.label, g.check!] as const),
  ...Object.entries(UNIT_CHECKS),
]);

const SUBJECTS: Array<[RegExp, string]> = [
  [/공통\s*영어\s*1|공통영어I\b/, "공통영어1"],
  [/공통\s*영어\s*2|공통영어II\b/, "공통영어2"],
  [/영어\s*(?:II|Ⅱ|2)(?![0-9])/, "영어II"],
  [/영어\s*(?:I|Ⅰ|1)(?![0-9I])/, "영어I"],
];

const PUBLISHERS = [...new Set(Object.keys(UNITS).map((k) => k.split("|")[1]!))];

/**
 * 출처에서 교과서 과를 읽는다. 「공통영어2 YBM(박준언) 1과 본문1」·「영어2_YBM(박)_1과_본문6」 꼴.
 * 출판사는 저자 이름 앞 글자만 있어도 맞춘다. 못 읽으면 null.
 */
export function textbookUnitKey(source: string | null | undefined): string | null {
  const s = String(source ?? "").replace(/_/g, " ");
  const subject = SUBJECTS.find(([re]) => re.test(s))?.[1];
  const lesson = s.match(/(\d+)\s*과/)?.[1];
  if (!subject || !lesson) return null;
  const compact = s.replace(/\s+/g, "");
  // 같은 과목·과에 그 교과서가 있는 것만 본다(저자 이름만 적은 「영어2 김성연 1과」, 줄인 「능률(오)」도 맞춘다)
  const publisher = PUBLISHERS.find((p) => {
    if (!UNITS[`${subject}|${p}|${Number(lesson)}`]) return false;
    const m = p.match(/^(.+?)\((.+)\)$/);
    if (!m) return compact.includes(p);
    const [, brand, author] = m;
    if (compact.includes(author!)) return true;
    return [brand!, brand!.replace(/^NE/, "")].some((b) => {
      const hit = compact.match(new RegExp(`${b}\\((.+?)\\)`));
      return !!hit && author!.startsWith(hit[1]!);
    });
  });
  if (!publisher) return null;
  const key = `${subject}|${publisher}|${Number(lesson)}`;
  return UNITS[key] ? key : null;
}

export function unitGrammarFor(key: string | null): UnitGrammarPoint[] {
  return key ? (UNITS[key] ?? []) : [];
}

/** 문장에 든 단원문법(교과서가 부르는 이름) */
/**
 * 동격의 that: that 뒤에 바로 동사·조동사가 오면 관계대명사다(「news that had happened」).
 * 지정 문법 검사는 「news that」만 보므로 여기서 더 좁힌다.
 */
const APPOSITIVE_THAT =
  /\b(?:fact|idea|belief|notion|evidence|news|possibility|assumption|feeling|sense|hope|truth|rumor|claim|thought|view|conclusion|sign|proof|chance|reason|knowledge|realization|suggestion|promise|fear|doubt)\s+that\s+(?!(?:is|are|was|were|has|have|had|will|would|can|could|may|might|must|should|does|do|did|seems?|seemed|makes?|made|helps?|helped|allows?|allowed|leads?|led|causes?|caused|comes?|came)\b)[A-Za-z]/i;

export function detectUnitGrammar(sentence: string, points: UnitGrammarPoint[]): string[] {
  const out: string[] = [];
  for (const p of points) {
    const appositive = /동격/.test(`${p.title} ${p.label ?? ""} ${p.writing ?? ""}`);
    const re = appositive
      ? APPOSITIVE_THAT
      : (p.writing && CHECK_BY_LABEL.get(p.writing)) || (p.label && EXTRA_CHECKS[p.label]) || null;
    if (re && re.test(sentence) && !out.includes(p.title)) out.push(p.title);
  }
  return out;
}
