/**
 * 6·7단계 어법 — 『어법끝』·『처음 만나는 수능 어법』·『마더텅 고2 어휘·어법』
 * + 변형문제 grammar-catalog CASE/pairForms/심는 법 반영
 *
 * 마더텅식 포인트 고르기:
 *  - 긴 내용어가 아니라 「수능필수어법」 구조 포인트
 *  - 한 지문에 서로 다른 단원(정동사 vs 준동사·관계사·수일치·형부·사역 등)
 *  - 인접 단순 수일치·동일 형태 쌍 반복 금지
 */
import {
  GRAMMAR_UNIT_BANKS,
  type GrammarCase,
  type GrammarUnitBank,
} from "@/lib/question-generator/grammar-catalog";
import type { Stage6GrammarSub } from "@/lib/exam-prep/stage6-types";
import type { Stage7ErrorSub } from "@/lib/exam-prep/stage7-types";

export type WorkbookGrammarHit = {
  start: number;
  end: number;
  correct: string;
  wrong: string;
  unitKey: string;
  caseId: string;
  koLabel: string;
  koTip: string;
  stage6Sub: Stage6GrammarSub;
  stage7Sub: Stage7ErrorSub;
  /** 높을수록 우선 */
  priority: number;
  forChoice: boolean;
  forError: boolean;
};

function mapUnit(
  unitKey: string,
  caseId: string
): { stage6Sub: Stage6GrammarSub; stage7Sub: Stage7ErrorSub } {
  switch (unitKey) {
    case "sv":
      return {
        stage6Sub: "subject_verb_agreement",
        stage7Sub: "subject_verb_agreement",
      };
    case "voice":
      return { stage6Sub: "voice", stage7Sub: "voice" };
    case "tense":
      return { stage6Sub: "tense", stage7Sub: "tense" };
    case "modal":
      return { stage6Sub: "verb_form", stage7Sub: "verb_form" };
    case "subjunctive":
      return { stage6Sub: "verb_form", stage7Sub: "verb_form" };
    case "participle":
      return { stage6Sub: "participle", stage7Sub: "participle" };
    case "verbal":
      if (/slot|do-be|oc/i.test(caseId)) {
        return { stage6Sub: "verb_form", stage7Sub: "verb_form" };
      }
      if (/obj|to-v|ing/i.test(caseId)) {
        return { stage6Sub: "gerund", stage7Sub: "gerund" };
      }
      return { stage6Sub: "infinitive", stage7Sub: "infinitive" };
    case "special":
      return { stage6Sub: "word_order", stage7Sub: "word_order" };
    case "parallel":
      return { stage6Sub: "other_grammar", stage7Sub: "parallelism" };
    case "compare":
      return { stage6Sub: "comparison", stage7Sub: "comparison" };
    case "adjadv":
      return { stage6Sub: "adjective_adverb", stage7Sub: "adjective_adverb" };
    case "prepconj":
      return { stage6Sub: "conjunction", stage7Sub: "conjunction" };
    case "relative":
      if (/adv|where|when|why/i.test(caseId)) {
        return { stage6Sub: "relative_adverb", stage7Sub: "relative_adverb" };
      }
      return { stage6Sub: "relative_pronoun", stage7Sub: "relative_pronoun" };
    case "noun":
      return { stage6Sub: "pronoun", stage7Sub: "pronoun" };
    default:
      return { stage6Sub: "other_grammar", stage7Sub: "other" };
  }
}

function overlaps(
  used: Array<{ a: number; b: number }>,
  start: number,
  end: number
) {
  return used.some((u) => start < u.b && end > u.a);
}

type MechPlant = {
  unitKey: string;
  caseId: string;
  correct: RegExp;
  wrong: string | ((matched: string, groups: string[]) => string);
  priority: number;
  forChoice?: boolean;
  forError?: boolean;
  /** 인접 단순 수일치 등 금지 */
  ban?: boolean;
};

function toIngForm(word: string): string {
  const low = word.toLowerCase();
  let base = low;
  if (low.endsWith("ies") && low.length > 4) base = `${low.slice(0, -3)}y`;
  else if (low.endsWith("es") && low.length > 3) base = low.slice(0, -2);
  else if (low.endsWith("s") && !low.endsWith("ss") && low.length > 2) {
    base = low.slice(0, -1);
  }
  if (base.endsWith("ie")) return `${base.slice(0, -2)}ying`;
  if (base.endsWith("e") && !base.endsWith("ee") && base !== "be") {
    return `${base.slice(0, -1)}ing`;
  }
  return `${base}ing`;
}

/**
 * 교재 CASE ‘심는 법’을 지문에 적용할 수 있는 고빈도 패턴.
 * (마더텅 수능필수어법 + 변형문제 pickGrammarFocus와 정렬)
 */
const MECHANISM_PLANTS: MechPlant[] = [
  // ═══ 마더텅: 준동사 자리 (전치사·동사 뒤 V-ing / to-V) — 단일 know→knowing 금지 ═══
  {
    unitKey: "verbal",
    caseId: "verb-slot",
    correct:
      /\b((?:by|without|before|after|while|when|of|for|in|on|from|about)\s+)(allowing|moving|learning|causing|requiring|providing|creating|supporting|including|offering|appearing|remaining|becoming|happening|occurring|dumping|growing|leaving|taking|making|getting)\b/gi,
    wrong: (_m, g) => {
      const prep = g[0] ?? "by ";
      const ing = g[1] ?? "allowing";
      const base = ing.replace(/ing$/i, "").replace(/ll$/i, "l");
      return `${prep}${base || "allow"}`;
    },
    priority: 96,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "verbal",
    caseId: "verb-slot",
    correct:
      /\b((?:want|wants|wanted|need|needs|needed|decide|decides|decided|refuse|refuses|refused|hope|hopes|hoped|plan|plans|planned|fail|fails|failed|agree|agrees|agreed|afford|affords|afforded)\s+to\s+)(allow|move|learn|cause|require|provide|create|support|include|offer|appear|remain|become|dump|grow|leave|take|make|get)\b/gi,
    wrong: (_m, g) => {
      const head = g[0] ?? "want to ";
      const base = g[1] ?? "allow";
      return `${head}${toIngForm(base)}`;
    },
    priority: 96,
    forChoice: true,
    forError: true,
  },
  // 대동사 do vs be (마더텅 해설 단골)
  {
    unitKey: "verbal",
    caseId: "verb-do-be",
    correct: /\bdoes so\b/gi,
    wrong: "is so",
    priority: 97,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "verbal",
    caseId: "verb-do-be",
    correct: /\bdid so\b/gi,
    wrong: "was so",
    priority: 97,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "verbal",
    caseId: "verb-do-be",
    correct: /\bdo so\b/gi,
    wrong: "are so",
    priority: 96,
    forChoice: true,
    forError: true,
  },
  // 사역·지각 + 원형 (have students change / see an apple fall)
  {
    unitKey: "verbal",
    caseId: "verb-oc",
    correct:
      /\b((?:see|saw|hear|heard|watch|watched|feel|felt|make|made|let|have|had|help|helped)\s+(?:an?\s+|the\s+|my\s+|your\s+|his\s+|her\s+|their\s+|our\s+|college\s+)?[\w'-]+\s+)(fall|change|take|go|come|move|run|work|look|become)\b/gi,
    wrong: (matched, g) => {
      const bare = g[1] ?? "fall";
      return matched.replace(new RegExp(`\\b${bare}\\b`, "i"), `to ${bare}`);
    },
    priority: 95,
    forChoice: true,
    forError: true,
  },
  // 간접의문 어순 — know/ask/wonder 등 뒤에만 (관계부사 where절과 구분)
  {
    unitKey: "special",
    caseId: "sp-indirect",
    correct:
      /(?<=\b(?:know|knew|knows|ask|asked|asks|wonder|wondered|wonders|tell|told|tells|explain|explained|explains|understand|understood|understands|remember|remembered|remembers|see|saw|sees|show|showed|shows|decide|decided|decides)\s+(?:(?:me|him|her|us|them|you|someone|anyone)\s+)?)(what|where|how|why|when)\s+((?:the\s+)?[\w'-]+(?:\s+[\w'-]+)?)\s+(had|has|have|was|were|is|are|will|would|can|could|did|do|does)\b/gi,
    wrong: (_m, g) =>
      `${g[0] ?? "what"} ${g[2] ?? "had"} ${g[1] ?? "he"}`,
    priority: 94,
    forChoice: true,
    forError: true,
  },
  // —— relative (어법끝 / 마더텅 Unit IV-03)
  {
    unitKey: "relative",
    caseId: "rel-adv",
    correct: /\bwhere\b(?=\s+(?:it|they|he|she|we|you|there|the)\b)/i,
    wrong: "which",
    priority: 93,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "relative",
    caseId: "rel-vs-adv",
    correct: /\bwhy\b(?=\s+(?:it|they|he|she|we|you|the|there)\b)/i,
    wrong: "what",
    priority: 92,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "relative",
    caseId: "rel-case",
    correct: /\b(?:to|in|on|of|for|with|from|by|at)\s+which\b/gi,
    wrong: "which",
    priority: 91,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "relative",
    caseId: "rel-ante",
    correct: /\bwhich has\b/i,
    wrong: "that have",
    priority: 92,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "relative",
    caseId: "rel-that",
    correct: /\bwhich\b/i,
    wrong: "that",
    priority: 68,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "relative",
    caseId: "rel-who",
    correct: /\bwho\b/i,
    wrong: "which",
    priority: 75,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "relative",
    caseId: "rel-whom",
    correct: /\bwhom\b/i,
    wrong: "who",
    priority: 78,
    forChoice: true,
    forError: true,
  },
  // —— voice
  {
    unitKey: "voice",
    caseId: "voice-prog",
    correct: /\bbeen (\w+)ing\b/gi,
    wrong: (_m, g) => {
      const stem = g[0] ?? "dump";
      if (stem === "leav") return "been left";
      if (stem.endsWith("e")) return `been ${stem}d`;
      return `been ${stem}ed`;
    },
    priority: 90,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "voice",
    caseId: "voice-prog",
    correct: /\bare (\w+)ing\b/gi,
    wrong: (_m, g) => {
      const stem = g[0] ?? "leave";
      if (stem === "leav") return "are left";
      if (stem.endsWith("e")) return `are ${stem}d`;
      return `are ${stem}ed`;
    },
    priority: 85,
    forChoice: true,
    forError: false,
  },
  {
    unitKey: "voice",
    caseId: "voice-basic",
    correct: /\bis known\b/gi,
    wrong: "knows",
    priority: 88,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "voice",
    caseId: "voice-basic",
    correct: /\battracts\b/gi,
    wrong: "is attracted",
    priority: 86,
    forChoice: true,
    forError: false,
  },
  {
    unitKey: "voice",
    caseId: "voice-basic",
    correct: /\bis desperately needed\b/gi,
    wrong: "is desperate needed",
    priority: 87,
    forChoice: true,
    forError: true,
  },
  // —— verbal (to-V vs V-ing)
  {
    unitKey: "verbal",
    caseId: "verb-obj",
    correct: /\bto strengthen\b/gi,
    wrong: "strengthening",
    priority: 93,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "verbal",
    caseId: "verb-obj",
    correct: /\bto (fix|solve|protect|leave|prevent|improve|reduce|increase|learn|apologize)\b/gi,
    wrong: (_m, g) => `${g[0] ?? "fix"}ing`,
    priority: 72,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "verbal",
    caseId: "verb-it-obj",
    correct: /\b(make|find|think|consider)\s+it\s+(\w+)\s+to\b/gi,
    wrong: (_m, g) => `${g[0] ?? "make"} ${g[1] ?? "possible"} to`,
    priority: 94,
    forChoice: true,
    forError: true,
  },
  // —— adjadv (마더텅: specifically / automatically / increasingly)
  {
    unitKey: "adjadv",
    caseId: "adj-slot",
    correct: /\b(desperately|specifically|automatically|increasingly|extremely|completely|carefully|easily|clearly)\b/gi,
    wrong: (_m, g) => {
      const w = (g[0] ?? "desperate").toLowerCase();
      if (w.endsWith("ically") && w.length > 7) return `${w.slice(0, -6)}ic`;
      if (w.endsWith("ally") && w.length > 5) return w.slice(0, -4);
      if (w.endsWith("ly")) return w.slice(0, -2);
      return w;
    },
    priority: 89,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "adjadv",
    caseId: "adj-slot",
    correct: /\billegal\b(?=\s+\w+ing\b)/i,
    wrong: "illegally",
    priority: 88,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "adjadv",
    caseId: "adj-ly-meaning",
    correct: /\bhardly\b/i,
    wrong: "hard",
    priority: 70,
    forChoice: true,
    forError: true,
  },
  // —— compare (much more / very more)
  {
    unitKey: "compare",
    caseId: "cmp-very",
    correct: /\bmuch (more|better|worse|easier|harder|larger|smaller)\b/gi,
    wrong: (_m, g) => `very ${g[0] ?? "more"}`,
    priority: 90,
    forChoice: true,
    forError: true,
  },
  // —— participle (감정·수식·분사구문 능수동)
  {
    unitKey: "participle",
    caseId: "part-mod",
    correct: /\bdisgusting\b/i,
    wrong: "disgusted",
    priority: 83,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "participle",
    caseId: "part-emotion",
    correct: /\b(interested|interesting|surprised|surprising|bored|boring|excited|exciting|confused|confusing|frightened|frightening)\b/gi,
    wrong: (_m, g) => {
      const w = (g[0] ?? "interested").toLowerCase();
      if (w.endsWith("ed")) return `${w.slice(0, -2)}ing`;
      if (w.endsWith("ing")) return `${w.slice(0, -3)}ed`;
      return w;
    },
    priority: 86,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "participle",
    caseId: "part-abs",
    correct: /\b(Known|Based|Located|Called|Named|Found|Made|Built)\b(?=\s+as\b|\s+on\b|\s+in\b|\s+from\b)/g,
    wrong: (_m, g) => {
      const w = g[0] ?? "Known";
      const low = w.toLowerCase();
      if (low === "known") return "Knowing";
      if (low === "based") return "Basing";
      if (low === "located") return "Locating";
      if (low === "called") return "Calling";
      if (low === "named") return "Naming";
      if (low === "found") return "Finding";
      if (low === "made") return "Making";
      if (low === "built") return "Building";
      return w;
    },
    priority: 91,
    forChoice: true,
    forError: true,
  },
  // —— prepconj
  {
    unitKey: "prepconj",
    caseId: "pc-conj",
    correct: /\balthough\b/i,
    wrong: "despite",
    priority: 76,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "prepconj",
    caseId: "pc-conj",
    correct: /\bdespite\b/i,
    wrong: "although",
    priority: 76,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "prepconj",
    caseId: "pc-conj",
    correct: /\bduring\b/i,
    wrong: "while",
    priority: 73,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "prepconj",
    caseId: "pc-conj",
    correct: /\bwhile\b/i,
    wrong: "during",
    priority: 73,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "prepconj",
    caseId: "pc-because",
    correct: /\bbecause\b(?!\s+of\b)/i,
    wrong: "because of",
    priority: 71,
    forChoice: true,
    forError: true,
  },
  // —— noun (대명사 수·재귀)
  {
    unitKey: "noun",
    caseId: "noun-pron-num",
    correct: /\bthemselves\b/gi,
    wrong: "himself",
    priority: 80,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "noun",
    caseId: "noun-poss-refl",
    correct: /\byourself\b/gi,
    wrong: "you",
    priority: 82,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "noun",
    caseId: "noun-pron-num",
    correct: /\bthose\b(?=\s+(?:of|who|that|which)\b)/gi,
    wrong: "that",
    priority: 79,
    forChoice: true,
    forError: true,
  },
  // —— parallel
  {
    unitKey: "parallel",
    caseId: "par-correl",
    correct: /\bnot only\b/gi,
    wrong: "not",
    priority: 70,
    forChoice: false,
    forError: false,
  },
  // —— sv: 수식어·관계절 유인만 (마더텅 Unit V-03). 인접 단순 금지
  {
    unitKey: "sv",
    caseId: "sv-prep",
    correct:
      /\b(purpose|process|number|amount|variety|majority|group|series|set|type|kind|pair)\s+of\s+[\w'-]+(?:\s+[\w'-]+)?\s+(is|are|was|were|has|have)\b/gi,
    wrong: (matched, g) => {
      const verb = (g[1] ?? "is").toLowerCase();
      const flip: Record<string, string> = {
        is: "are",
        are: "is",
        was: "were",
        were: "was",
        has: "have",
        have: "has",
      };
      return matched.replace(new RegExp(`\\b${verb}\\b`, "i"), flip[verb] ?? verb);
    },
    priority: 92,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "sv",
    caseId: "sv-rel-ante",
    correct: /\bwhich has\b/i,
    wrong: "which have",
    priority: 80,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "sv",
    caseId: "sv-rel-ante",
    correct: /\bthat has\b/i,
    wrong: "that have",
    priority: 78,
    forChoice: true,
    forError: true,
  },
  {
    unitKey: "sv",
    caseId: "sv-there",
    correct: /\bthere (is|are|was|were)\b/gi,
    wrong: (_m, g) => {
      const v = (g[0] ?? "is").toLowerCase();
      const flip: Record<string, string> = {
        is: "are",
        are: "is",
        was: "were",
        were: "was",
      };
      return `there ${flip[v] ?? v}`;
    },
    priority: 74,
    forChoice: true,
    forError: true,
  },
  // —— tense markers (마더텅 시제 해설)
  {
    unitKey: "tense",
    caseId: "tense-adv",
    correct: /\bhave\s+(\w+ed|\w+en)\b(?=[^.]*\bsince\b)/gi,
    wrong: (_m, g) => `had ${g[0] ?? "been"}`,
    priority: 77,
    forChoice: true,
    forError: true,
  },
];

/** 어휘 [a/b] — PDF·워크북용 (어법과 함께) */
export const VOCAB_CHOICE_PLANTS: Array<{
  correct: RegExp;
  wrong: string;
  sub: string;
  priority: number;
}> = [
  // 마더텅 어휘편: 문맥·혼동어 위주
  { correct: /\bgrowing\b/i, wrong: "declining", sub: "increase_decrease", priority: 60 },
  { correct: /\bstrengthen\b/i, wrong: "weaken", sub: "strengthen_weaken", priority: 60 },
  { correct: /\bworse\b/i, wrong: "better", sub: "opposite_meaning", priority: 58 },
  { correct: /\billegal\b/i, wrong: "legal", sub: "opposite_meaning", priority: 55 },
  { correct: /\bpermitted\b/i, wrong: "prevented", sub: "similar_spelling", priority: 62 },
  { correct: /\bgarbage\b/i, wrong: "garage", sub: "similar_spelling", priority: 62 },
  { correct: /\bConsistent\b/, wrong: "Inconsistent", sub: "opposite_meaning", priority: 60 },
  { correct: /\bmore and more\b/i, wrong: "less and less", sub: "increase_decrease", priority: 61 },
  { correct: /\baffect\b/i, wrong: "effect", sub: "similar_spelling", priority: 64 },
  { correct: /\beffect\b/i, wrong: "affect", sub: "similar_spelling", priority: 63 },
  { correct: /\baccept\b/i, wrong: "except", sub: "similar_spelling", priority: 64 },
  { correct: /\braise\b/i, wrong: "rise", sub: "similar_spelling", priority: 63 },
  { correct: /\blie\b/i, wrong: "lay", sub: "similar_spelling", priority: 58 },
  { correct: /\bprincipal\b/i, wrong: "principle", sub: "similar_spelling", priority: 64 },
  { correct: /\bprinciple\b/i, wrong: "principal", sub: "similar_spelling", priority: 63 },
  { correct: /\baccess\b/i, wrong: "assess", sub: "similar_spelling", priority: 62 },
  { correct: /\bassure\b/i, wrong: "ensure", sub: "contextual_meaning", priority: 60 },
  { correct: /\bensure\b/i, wrong: "assure", sub: "contextual_meaning", priority: 60 },
  { correct: /\bremind\b/i, wrong: "remember", sub: "contextual_meaning", priority: 61 },
  { correct: /\bremember\b/i, wrong: "remind", sub: "contextual_meaning", priority: 58 },
  { correct: /\bearn\b/i, wrong: "gain", sub: "contextual_meaning", priority: 57 },
  { correct: /\bspend\b/i, wrong: "take", sub: "collocation", priority: 56 },
];

function findCase(
  unitKey: string,
  caseId: string
): { unit: GrammarUnitBank; c: GrammarCase } | null {
  const unit = GRAMMAR_UNIT_BANKS.find((u) => u.key === unitKey);
  if (!unit) return null;
  const c =
    unit.cases.find((x) => x.id === caseId) ??
    unit.cases[0];
  if (!c) return null;
  return { unit, c };
}

function isElementaryChoice(a: string, b: string): boolean {
  const x = a.toLowerCase().trim();
  const y = b.toLowerCase().trim();
  if (!x || !y) return true;
  // 관사 a/an/the — 초등 수준, 절대 출제 금지
  if (/^(a|an|the)$/i.test(x) || /^(a|an|the)$/i.test(y)) return true;
  if (/^(a|an|the)(\s|$)/i.test(x) || /^(a|an|the)(\s|$)/i.test(y)) return true;
  if (x === "—" || y === "—" || x === "-" || y === "-") return true;
  // few/little·many/much 단독
  const qty = new Set(["few", "little", "many", "much", "some", "any", "all", "each", "every"]);
  if (qty.has(x) && qty.has(y)) return true;
  // 단독 is/are·has/have (변형문제 HARD BAN)
  if (
    /^(is|are|was|were|has|have)$/i.test(x) &&
    /^(is|are|was|were|has|have)$/i.test(y)
  ) {
    return true;
  }
  // 양쪽 모두 초등 닫힌 부류 (대명사·전치사만)
  const CLOSED = new Set(
    "i you he she it we they me him her us them my your his its our their and or but not so if of in on at to for with by from as".split(
      " "
    )
  );
  if (CLOSED.has(x) && CLOSED.has(y)) return true;
  return false;
}

/**
 * 어이없는 [a/b] 쌍 — sometime/sometimes, whole/wholes, know/knowing 등.
 * 변형문제 품질 기준으로 출제 금지.
 */
export function isNonsenseChoicePair(correct: string, wrong: string): boolean {
  if (isElementaryChoice(correct, wrong)) return true;
  const a = correct.trim();
  const b = wrong.trim();
  if (!a || !b || a.toLowerCase() === b.toLowerCase()) return true;

  const aw = a.toLowerCase().replace(/[^a-z']/g, "");
  const bw = b.toLowerCase().replace(/[^a-z']/g, "");
  if (!aw || !bw) return true;

  // 부사 sometime ↔ sometimes
  if (
    (aw === "sometime" && bw === "sometimes") ||
    (aw === "sometimes" && bw === "sometime")
  ) {
    return true;
  }

  // 단일 토큰 ±s / ±es 만 다른 쌍 (whole/wholes, part/parts, rat/rats…)
  if (!/\s/.test(a) && !/\s/.test(b)) {
    if (
      aw + "s" === bw ||
      bw + "s" === aw ||
      aw + "es" === bw ||
      bw + "es" === aw ||
      (aw.endsWith("y") && aw.slice(0, -1) + "ies" === bw) ||
      (bw.endsWith("y") && bw.slice(0, -1) + "ies" === aw)
    ) {
      return true;
    }
    // know/knowing, allow/allowing — 문맥 없는 단순 -ing 장난
    const stemIng = (w: string) =>
      w.endsWith("ing") && w.length > 4 ? w.slice(0, -3) : null;
    const aIng = stemIng(aw);
    const bIng = stemIng(bw);
    if (aIng && (aIng === bw || aIng + "e" === bw || aIng.replace(/e$/, "") === bw)) {
      return true;
    }
    if (bIng && (bIng === aw || bIng + "e" === aw || bIng.replace(/e$/, "") === aw)) {
      return true;
    }
  }

  // 철자만 1글자 차이·길이 2 이하
  if (a.length <= 2 || b.length <= 2) return true;

  return false;
}

/** 변형문제는 pairForms를 지문에 맹목적으로 꽂지 않음 — CASE 메커니즘만 사용 */
export function scanWorkbookGrammarHits(english: string): WorkbookGrammarHit[] {
  const hits: WorkbookGrammarHit[] = [];
  const used: Array<{ a: number; b: number }> = [];

  for (const plant of MECHANISM_PLANTS) {
    if (plant.ban) continue;
    const re = new RegExp(
      plant.correct.source,
      plant.correct.flags.includes("g") ? plant.correct.flags : `${plant.correct.flags}g`
    );
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(english)) !== null) {
      if (m.index == null) continue;
      const start = m.index;
      const end = start + m[0].length;
      if (overlaps(used, start, end)) continue;
      const correct = m[0];
      const groups = m.slice(1).filter(Boolean);
      const wrong =
        typeof plant.wrong === "function"
          ? plant.wrong(correct, groups)
          : plant.wrong;
      if (!wrong || wrong.toLowerCase() === correct.toLowerCase()) continue;
      if (isNonsenseChoicePair(correct, wrong)) continue;
      used.push({ a: start, b: end });
      const meta = findCase(plant.unitKey, plant.caseId);
      const subs = mapUnit(plant.unitKey, plant.caseId);
      hits.push({
        start,
        end,
        correct,
        wrong,
        unitKey: plant.unitKey,
        caseId: plant.caseId,
        koLabel: meta?.c.koLabel ?? plant.unitKey,
        koTip: meta?.c.koTip ?? "",
        ...subs,
        priority: plant.priority,
        forChoice: plant.forChoice !== false,
        forError: plant.forError !== false,
      });
    }
  }

  return hits.sort((a, b) => b.priority - a.priority || a.start - b.start);
}

/**
 * QG pickGrammarFocus와 같이 유닛 다양성 확보.
 * - 서로 다른 unitKey 우선
 * - sv 최대 1개
 */
export function pickDiverseGrammarHits(
  hits: WorkbookGrammarHit[],
  max: number,
  opts?: { forChoice?: boolean; forError?: boolean }
): WorkbookGrammarHit[] {
  const filtered = hits.filter((h) => {
    if (opts?.forChoice && !h.forChoice) return false;
    if (opts?.forError && !h.forError) return false;
    return true;
  });
  const picked: WorkbookGrammarHit[] = [];
  const usedUnits = new Set<string>();
  const usedSpans: Array<{ a: number; b: number }> = [];
  let usedSv = false;

  const tryAdd = (h: WorkbookGrammarHit, requireNewUnit: boolean) => {
    if (picked.length >= max) return false;
    if (overlaps(usedSpans, h.start, h.end)) return false;
    if (h.unitKey === "sv") {
      if (usedSv) return false;
    }
    if (requireNewUnit && usedUnits.has(h.unitKey)) return false;
    picked.push(h);
    usedUnits.add(h.unitKey);
    usedSpans.push({ a: h.start, b: h.end });
    if (h.unitKey === "sv") usedSv = true;
    return true;
  };

  // 1차: 새 유닛만
  for (const h of filtered) {
    tryAdd(h, true);
  }
  // 2차: 간격만 맞으면 채움 (유닛 중복 허용하되 sv는 여전히 1)
  for (const h of filtered) {
    tryAdd(h, false);
  }

  return picked.sort((a, b) => a.start - b.start);
}

export function scanVocabChoiceHits(english: string): Array<{
  start: number;
  end: number;
  correct: string;
  wrong: string;
  sub: string;
  priority: number;
}> {
  const out: Array<{
    start: number;
    end: number;
    correct: string;
    wrong: string;
    sub: string;
    priority: number;
  }> = [];
  const used: Array<{ a: number; b: number }> = [];
  for (const p of VOCAB_CHOICE_PLANTS) {
    const re = new RegExp(p.correct.source, p.correct.flags.includes("g") ? p.correct.flags : `${p.correct.flags}g`);
    re.lastIndex = 0;
    let m: RegExpExecArray | null;
    while ((m = re.exec(english)) !== null) {
      if (m.index == null) continue;
      if (overlaps(used, m.index, m.index + m[0].length)) continue;
      if (isNonsenseChoicePair(m[0], p.wrong)) continue;
      used.push({ a: m.index, b: m.index + m[0].length });
      out.push({
        start: m.index,
        end: m.index + m[0].length,
        correct: m[0],
        wrong: p.wrong,
        sub: p.sub,
        priority: p.priority,
      });
    }
  }
  return out.sort((a, b) => b.priority - a.priority);
}

/** 지문 전체에서 마더텅식 다양 단원 포인트 (문장당 최대 2) */
export function pickPassageGrammarHits(
  sentences: Array<{ id: string; english_text: string; sentence_order: number }>,
  maxTotal = 8
): Array<{ sentenceId: string; hit: WorkbookGrammarHit }> {
  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  const pool: Array<{ sentenceId: string; hit: WorkbookGrammarHit }> = [];
  for (const s of ordered) {
    for (const h of scanWorkbookGrammarHits(s.english_text).filter((x) => x.forChoice)) {
      pool.push({ sentenceId: s.id, hit: h });
    }
  }
  pool.sort((a, b) => b.hit.priority - a.hit.priority);

  const picked: Array<{ sentenceId: string; hit: WorkbookGrammarHit }> = [];
  const usedUnits = new Set<string>();
  const perSentence = new Map<string, number>();
  let usedSv = false;

  const tryAdd = (row: { sentenceId: string; hit: WorkbookGrammarHit }, requireNewUnit: boolean) => {
    if (picked.length >= maxTotal) return false;
    if ((perSentence.get(row.sentenceId) ?? 0) >= 2) return false;
    if (
      picked.some(
        (p) =>
          p.sentenceId === row.sentenceId &&
          p.hit.start === row.hit.start &&
          p.hit.end === row.hit.end
      )
    ) {
      return false;
    }
    if (row.hit.unitKey === "sv" && usedSv) return false;
    if (requireNewUnit && usedUnits.has(row.hit.unitKey)) return false;
    picked.push(row);
    usedUnits.add(row.hit.unitKey);
    perSentence.set(row.sentenceId, (perSentence.get(row.sentenceId) ?? 0) + 1);
    if (row.hit.unitKey === "sv") usedSv = true;
    return true;
  };

  for (const row of pool) tryAdd(row, true);
  for (const row of pool) tryAdd(row, false);

  return picked.sort((a, b) => {
    const oa = ordered.findIndex((s) => s.id === a.sentenceId);
    const ob = ordered.findIndex((s) => s.id === b.sentenceId);
    return oa - ob || a.hit.start - b.hit.start;
  });
}

/** 지문 전체에서 7단계용 오류 3개 (서로 다른 단원) */
export function pickStage7Errors(
  sentences: Array<{ id: string; english_text: string; sentence_order: number }>,
  targetCount = 3
): Array<{
  sentenceId: string;
  hit: WorkbookGrammarHit;
}> {
  const ordered = [...sentences].sort((a, b) => a.sentence_order - b.sentence_order);
  const pool: Array<{ sentenceId: string; hit: WorkbookGrammarHit }> = [];
  for (const s of ordered) {
    const hits = scanWorkbookGrammarHits(s.english_text).filter(
      (h) => h.forError && !isNonsenseChoicePair(h.correct, h.wrong)
    );
    for (const h of hits) {
      pool.push({ sentenceId: s.id, hit: h });
    }
  }
  pool.sort((a, b) => b.hit.priority - a.hit.priority);

  const picked: Array<{ sentenceId: string; hit: WorkbookGrammarHit }> = [];
  const usedUnits = new Set<string>();
  const usedSentences = new Set<string>();
  let usedSv = false;

  for (const row of pool) {
    if (picked.length >= targetCount) break;
    if (usedSentences.has(row.sentenceId)) continue;
    if (usedUnits.has(row.hit.unitKey)) continue;
    if (row.hit.unitKey === "sv") {
      if (usedSv) continue;
      usedSv = true;
    }
    picked.push(row);
    usedUnits.add(row.hit.unitKey);
    usedSentences.add(row.sentenceId);
  }

  // 부족하면 문장 중복 허용·유닛만 다양
  if (picked.length < targetCount) {
    for (const row of pool) {
      if (picked.length >= targetCount) break;
      if (picked.some((p) => p.sentenceId === row.sentenceId && p.hit.start === row.hit.start)) {
        continue;
      }
      if (usedUnits.has(row.hit.unitKey) && picked.length >= 2) continue;
      if (row.hit.unitKey === "sv" && usedSv) continue;
      picked.push(row);
      usedUnits.add(row.hit.unitKey);
      if (row.hit.unitKey === "sv") usedSv = true;
    }
  }

  return picked;
}

export function grammarWorkbookSourceNote(): string {
  return [
    "마더텅 고2 어휘·어법(수능필수어법) · 어법끝 START · 처음 만나는 수능 어법",
    "정동사 vs 준동사·관계사·수일치(수식 유인)·형부·사역·간접의문 등 구조 포인트",
    "변형문제 grammar-catalog CASE/pairForms와 동일 뱅크",
  ].join(" / ");
}
