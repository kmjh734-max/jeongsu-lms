import { engcoreLevelOf } from "@/lib/vocab/engcore-lemma";
import { lemmaEnglishToken } from "@/lib/question-generator/word-order-normalize";
import { verbBaseForms } from "@/lib/question-generator/verb-forms";

/**
 * 단어장에 실을 원형. reducing·balanced·originated처럼 바뀐 꼴은 우리 단어장(EngCore)에 있는 원형으로 돌린다
 * (lemmaEnglishToken만으로는 -ing·-ed가 남았다). 후보 가운데 단어장에 있는 가장 긴 것을 고르고, 없으면 사전에
 * 있는 가장 긴 것, 그것도 없으면 lemmaEnglishToken 결과.
 */
function bestLemma(lower: string, dictionary: Set<string> | null): string {
  const simple = lemmaEnglishToken(lower) || lower;
  if (!/(?:s|ed|ing)$/.test(lower)) return simple;
  const cands = [...new Set([simple, ...verbBaseForms(lower)])].filter((c) => c.length >= 3 && c !== lower);
  const inList = cands.filter((c) => engcoreLevelOf(c) !== null).sort((a, b) => b.length - a.length);
  if (inList.length) return inList[0]!;
  if (engcoreLevelOf(lower) !== null) return lower;
  const inDict = cands.filter((c) => dictionary?.has(c)).sort((a, b) => b.length - a.length);
  return inDict[0] ?? simple;
}

/**
 * 수업용 자료 단어장에 실을 낱말을 코드가 고른다(선생님 2026-10-25).
 *
 * 전에는 모델이 「10~14개, 그중 40~50%는 쉬운 단어」로 골라 fire·room·story 같은 초등 낱말이 들어가고
 * restoration·reliable·asset처럼 정작 모르는 낱말이 빠졌다(15지문 실측: 중학고난도 이상 지문당 7.9개 빠짐).
 * 이제는 EngCore 단어장 수준으로 재서 **중학고난도(6) 이상은 모두** 넣고, 모자라면 중학필수(5)·중학기본(4)에서
 * 채워 **12~16개**로 맞춘다. 뜻·동의어·반의어는 모델이 이 목록에 붙인다.
 *
 * - 고유명사(문장 가운데 대문자)·숫자·세 글자 이하·기능어는 뺀다.
 * - 우리 단어장에 없는 낱말(수능필수 너머이거나 전문어)은 영어 사전에 있고 7글자 이상일 때만, 가장 어려운 쪽으로
 *   최대 3개 넣는다(homi·hanji 같은 우리말 표기는 사전에 없어 빠진다).
 */
export const LESSON_VOCAB_MIN = 12;
export const LESSON_VOCAB_MAX = 16;
/** 이 수준(EngCore 중학고난도)부터는 반드시 싣는다 */
export const LESSON_VOCAB_MUST_LEVEL = 6;
const BEYOND_MAX = 3;

const FUNCTION_WORDS = new Set(
  (
    "the a an and or but nor so yet of to in on at for with from by as is are was were be been being am it its this that these those " +
    "he she they them his her hers their theirs we our ours you your yours i my me mine not no if than then there here which who whom whose what when where why how " +
    "do does did done have has had having can could will would may might must shall should also very more most much many such only own same other another each every all any some both either neither " +
    "into onto over under about after before between through during while because although though since until up down out off again just even still already too one two three first second next last " +
    "like unlike well back away ever never always often sometimes once twice now today yes okay however therefore thus instead rather quite almost enough few little less least lot lots thing things " +
    "get got make made take took come came go went say said see saw know knew think thought want need use used let put keep give gave find found tell told ask asked seem seemed become became " +
    "people person man woman men women child children day days year years time times way ways life home house school work world"
  ).split(/\s+/)
);

export type LessonVocabCandidate = {
  /** 단어장에 실을 꼴(원형) */
  word: string;
  /** 지문에 나온 꼴 */
  surface: string;
  /** EngCore 수준(0~9). 단어장 밖(사전에만 있는 낱말)은 null */
  level: number | null;
  /** 지문 안 첫 자리(낱말 차례) */
  at: number;
};

/** 지문 문장들에서 후보를 모은다(지문 차례, 원형으로 하나씩). */
export function collectLessonVocabCandidates(
  sentences: string[],
  dictionary: Set<string> | null
): LessonVocabCandidate[] {
  const seen = new Map<string, LessonVocabCandidate>();
  let at = 0;
  for (const sentence of sentences) {
    const tokens = sentence.split(/\s+/).filter(Boolean);
    tokens.forEach((raw, i) => {
      at += 1;
      const tok = raw.replace(/^[^A-Za-z]+|[^A-Za-z]+$/g, "");
      if (!tok || /[^A-Za-z'-]/.test(tok) || tok.length <= 3) return;
      // 문장 가운데 대문자로 시작하면 고유명사(Louvre·Korea)
      if (i > 0 && /^[A-Z]/.test(tok)) return;
      // 전부 대문자(NASA·MBTI)도 뺀다
      if (/^[A-Z]{2,}$/.test(tok)) return;
      const lower = tok.toLowerCase();
      if (FUNCTION_WORDS.has(lower)) return;
      const lemma = bestLemma(lower, dictionary);
      if (lemma.length <= 3 || FUNCTION_WORDS.has(lemma)) return;
      const level = engcoreLevelOf(lemma) ?? engcoreLevelOf(lower);
      if (level === null) {
        // 우리 단어장 밖: 영어 사전에 있는 7글자 이상 낱말만. 문장 첫머리 대문자(Benjamin)는 이름일 수 있어 뺀다
        if (/^[A-Z]/.test(tok)) return;
        if (!dictionary || lemma.length < 7 || !(dictionary.has(lemma) || dictionary.has(lower))) return;
      }
      if (seen.has(lemma)) return;
      seen.set(lemma, { word: lemma, surface: tok, level, at });
    });
  }
  return [...seen.values()];
}

/**
 * 후보에서 단어장 목록을 고른다.
 * 1) 중학고난도(6) 이상 + 단어장 밖 낱말(최대 3개) — 16개를 넘으면 어려운 수준부터, 같은 수준이면 지문 차례.
 * 2) 12개가 안 되면 중학필수(5), 그래도 모자라면 중학기본(4)에서 지문 차례로 채운다.
 * 돌려주는 차례는 지문에 나온 차례다.
 */
export function pickLessonVocab(candidates: LessonVocabCandidate[]): LessonVocabCandidate[] {
  const beyond = candidates.filter((c) => c.level === null).sort((a, b) => a.at - b.at).slice(0, BEYOND_MAX);
  const must = candidates.filter((c) => c.level !== null && c.level >= LESSON_VOCAB_MUST_LEVEL);
  let chosen = [...must, ...beyond];
  if (chosen.length > LESSON_VOCAB_MAX) {
    // 단어장 밖 낱말은 중학고난도와 고교기본 사이로 친다
    const rank = (c: LessonVocabCandidate) => (c.level === null ? 6.5 : c.level);
    chosen = [...chosen].sort((a, b) => rank(b) - rank(a) || a.at - b.at).slice(0, LESSON_VOCAB_MAX);
  }
  for (const fill of [5, 4]) {
    if (chosen.length >= LESSON_VOCAB_MIN) break;
    const pool = candidates.filter((c) => c.level === fill).sort((a, b) => a.at - b.at);
    for (const c of pool) {
      if (chosen.length >= LESSON_VOCAB_MIN) break;
      chosen.push(c);
    }
  }
  return chosen.sort((a, b) => a.at - b.at);
}
