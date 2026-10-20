/**
 * 교과서 본문 문장 분석(규칙, 모델 호출 없음) — 테스트 교재 「중요문장 어순배열」에 쓸 문장을 고른다.
 *
 * 선생님 요청(2026-10-20): 어순배열에는 단원문법이 든 문장을 꼭 넣고, 구문·구조가 어려운 문장도 넣는다.
 * 교과서별로 전부 분석해 DB(textbook_passages.key_sentences)에 저장해 둔다
 * — scripts/grammar-bank/build-textbook-key-sentences.mts.
 *
 * 어려운 문장: 절이 겹치거나(관계사절·명사절·부사절) 분사구문·도치·강조·가주어 같은 구조가 들고 길다.
 * 지정 문법 검사(WRITING_GRAMMARS.check)는 「that만 있어도 관계대명사」처럼 넓어서 여기서는 좁게 다시 본다.
 */
import { detectUnitGrammar, textbookUnitKey, unitGrammarFor } from "@/lib/grammar/textbook-unit-grammar";

/** 규칙이 바뀌면 올린다. 저장해 둔 분석이 옛 규칙이면 지문을 열 때 다시 계산한다. */
export const KEY_SENTENCE_VERSION = "ks-2";

export type KeySentence = {
  english: string;
  /** 그 과 단원문법(교과서가 부르는 이름) */
  unitGrammar: string[];
  /** 문장에 든 구조(어려운 문장 판정 근거) */
  structures: string[];
  score: number;
  hard: boolean;
};

export type KeySentenceAnalysis = {
  version: string;
  unitKey: string | null;
  sentences: KeySentence[];
};

const SUBORDINATOR = /\b(?:because|although|though|while|whereas|since|unless|once|until|whether|even if|even though|as soon as|as long as|so that|in order that)\b/gi;

/** [이름, 규칙] — 확실히 잡히는 꼴만 */
const STRUCTURES: Array<[string, RegExp]> = [
  [
    "관계사절",
    /\b(?:who|whom|whose)\b(?![^.?!]*\?)|[a-z]\s+which\b|,\s*which\b|\b[a-z]{3,}\s+that\s+(?:must|can|could|will|would|may|might|should|is|are|was|were|has|have|had|[a-z]+ed|[a-z]{3,}s)\b/i,
  ],
  ["관계사 what", /(?<!^\s*)\bwhat\b(?![^.?!]*\?)/i],
  ["전치사+관계대명사", /\b(?:in|on|at|for|with|to|from|of|by|about|through|under)\s+(?:which|whom)\b/i],
  ["명사절 that", /\b(?:know|knew|known|think|thought|believe|believed|realize|realized|say|said|show|shows|showed|shown|suggest|suggests|suggested|find|found|mean|means|meant|argue|argued|claim|claimed|learn|learned|discover|discovered|notice|noticed|understand|understood|feel|felt|hope|hoped|expect|expected|is|was)\s+that\b/i],
  ["동격의 that", /\b(?:fact|idea|belief|notion|evidence|news|possibility|assumption|feeling|sense|hope|truth|claim|thought|view|conclusion|sign|proof|chance|reason|realization)\s+that\b/i],
  ["분사구문", /^\s*(?:(?:not\s+)?[A-Z]?[a-z]+ing|(?:Having|Being)\s+\w+|[A-Z][a-z]+(?:ed|en|wn|rn)\s+(?:by|in|with|at|from|to|for|as|on)\b)[^,]{2,60},|,\s*(?:\w+ly\s+)?(?:[a-z]+ing)\b(?!\s+(?:and|or)\b)/],
  ["가주어·진주어", /\bit\s+(?:is|was|has been|will be|seems|seemed|becomes|became)\s+(?:\w+\s+){0,3}(?:to\s+[a-z]+|that\b|for\s+\w+\s+to\b)/i],
  ["가목적어", /\b(?:make|makes|made|making|find|finds|found|think|thinks|thought|consider|considers|considered)\s+it\s+(?:\w+\s+){0,2}(?:to\s+[a-z]+|that\b)/i],
  ["강조 구문", /\bit\s+(?:is|was)\s+(?:not\s+)?(?:\w+\s+){1,6}(?:that|who)\s+/i],
  ["도치", /^\s*(?:never|not only|not until|rarely|seldom|little|no sooner|hardly|scarcely|only\s+(?:when|after|then|by|in|if))\b/i],
  ["가정법", /\bif\b[^.]*\b(?:had\s+\w+|were)\b[^.]*\b(?:would|could|might)\b|\b(?:would|could|might)\s+have\s+\w+[^.]*\bif\b|\bas if\b|\bI wish\b|\bwithout\b[^.]*\b(?:would|could|might)\b/i],
  ["조동사+have p.p.", /\b(?:must|should|could|would|might|may)\s+(?:not\s+)?have\s+(?:been\s+)?[a-z]+(?:ed|en|wn|ne|ght|t|de)\b/i],
  // 분사가 명사 뒤에 오고 문장·구가 끝나는 꼴만(「with a designated base」「with a layer of red」는 아님)
  [
    "with+명사+분사",
    /\bwith\s+(?:(?:a|an|the|his|her|their|its|my|our|your|one's)\s+)?(?:[a-z]+\s+){0,2}[a-z]+\s+(?:[a-z]{2,}ing|[a-z]{3,}ed|done|gone|known|shown|broken|hidden|spread|shut|held|left|kept)\b(?=\s*[,.;!?”"]|\s*$|\s+(?:in|on|at|by|to|from|over|up|down|out|behind|around|and)\b)/i,
  ],
  ["상관접속사", /\bnot only\b[^.]*\bbut\b|\bneither\b[^.]*\bnor\b|\bnot\s+(?:\w+\s+){1,4}but\s+(?:also\s+)?(?:in|on|at|to|for|by|with)\b/i],
  ["the 비교급, the 비교급", /\bthe\s+(?:\w+er|more|less)\b[^.]*,\s*the\s+(?:\w+er|more|less)\b/i],
  ["so/such ~ that", /\b(?:so\s+\w+|such\s+(?:an?\s+)?(?:\w+\s+){1,3})that\b/i],
  ["복합관계사", /\b(?:whatever|whoever|whomever|whichever|whenever|wherever)\b|\bhowever\s+[a-z]/i],
  ["목적격보어 to부정사", /\b(?:allow|allows|allowed|enable|enables|enabled|encourage|encourages|encouraged|force|forced|cause|causes|caused|require|requires|required|lead|leads|led|ask|asked|want|wanted|expect|expected|persuade|persuaded|help|helps|helped)\s+(?:\w+\s+){1,3}to\s+[a-z]+/i],
  ["완료 수동·완료부정사", /\b(?:has|have|had)\s+(?:not\s+)?been\s+[a-z]+(?:ed|en|wn|t)\b|\bto\s+have\s+[a-z]+(?:ed|en|wn|t)\b/i],
];

function words(s: string): number {
  return s.split(/\s+/).filter(Boolean).length;
}

/** 문장 하나 */
export function analyzeSentence(english: string): { structures: string[]; score: number; hard: boolean } {
  const s = english.trim();
  const structures = STRUCTURES.filter(([, re]) => re.test(s)).map(([name]) => name);
  const subs = (s.match(SUBORDINATOR) ?? []).length;
  const w = words(s);
  // 구조 하나 1점, 부사절 접속사 0.6점, 15낱말 넘으면 8낱말마다 1점
  const score = Math.round((structures.length + subs * 0.6 + Math.max(0, w - 15) / 8) * 10) / 10;
  const hard = w >= 12 && score >= 2 && structures.length >= 1;
  return { structures, score, hard };
}

/** 지문 하나(문장 차례대로). source는 「공통영어2 천재(조수경) 3과 본문2」 꼴. */
export function analyzeKeySentences(sentences: string[], source: string | null | undefined): KeySentenceAnalysis {
  const unitKey = textbookUnitKey(source);
  const points = unitGrammarFor(unitKey);
  return {
    version: KEY_SENTENCE_VERSION,
    unitKey,
    sentences: sentences.map((english) => ({
      english,
      unitGrammar: points.length ? detectUnitGrammar(english, points) : [],
      ...analyzeSentence(english),
    })),
  };
}

/** 문장 맞추기용(따옴표·공백·대소문자 무시) */
export function keySentenceNorm(s: string): string {
  return s
    .toLowerCase()
    .replace(/[‘’“”"'`]/g, "")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}
