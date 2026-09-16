/**
 * 받아쓰기 빈칸으로 쓸 만한 단어인지 규칙으로 판정·점수화.
 *
 * 예전에는 빈칸을 문항마다 모델 호출로 만들어 문항당 ~40원이 들었다.
 * 좋은 빈칸의 조건은 이미 알고 있다 — (1) 내용어(명사·동사·형용사·부사)이고
 * (2) What·Yes 같은 뻔한 말이 아니며 (3) 대본에 그대로 나오고 (4) 이름·숫자가 아니다.
 * 이 규칙으로 충분한 개수가 나오면 모델을 부르지 않는다.
 */

/** 기능어 — 들어도 문제가 되지 않는 말 */
const FUNCTION_WORDS = new Set([
  "a", "an", "the", "this", "that", "these", "those", "there", "here",
  "i", "you", "he", "she", "it", "we", "they", "me", "him", "her", "us", "them",
  "my", "your", "his", "its", "our", "their", "mine", "yours",
  "am", "is", "are", "was", "were", "be", "been", "being",
  "do", "does", "did", "done", "have", "has", "had",
  "can", "could", "will", "would", "shall", "should", "may", "might", "must",
  "to", "of", "in", "on", "at", "by", "for", "with", "from", "about", "into", "over",
  "and", "or", "but", "so", "if", "than", "then", "as", "too", "also", "not", "no",
  "what", "who", "whom", "whose", "which", "when", "where", "why", "how",
  "yes", "yeah", "ok", "okay", "oh", "well", "hi", "hello", "bye", "sure", "please", "thanks",
  "let", "lets", "let's", "get", "got", "go", "going", "come", "very", "really", "just",
  "some", "any", "all", "one", "two", "up", "out", "down", "off", "again", "now",
  "i'm", "it's", "that's", "don't", "doesn't", "didn't", "can't", "won't", "isn't", "you're",
  "we're", "they're", "i'll", "we'll", "you'll", "i've", "there's", "here's", "what's", "let's",
]);

/** 내용어다운 꼬리 (명사·동사·형용사·부사 어미) */
const CONTENT_SUFFIXES = [
  "tion", "sion", "ment", "ness", "ship", "ity", "ance", "ence", "able", "ible",
  "ful", "less", "ous", "ive", "al", "ic", "ly", "ing", "ed", "er", "est", "y",
];

/**
 * 내용어이긴 하지만 들어도 정보가 거의 없는 말(반응·가벼운 동사·막연한 대명사).
 * 빼지는 않고 점수만 낮춰 둔다 — 짧은 줄에서 다른 후보가 없을 때는 이 말이라도 써야 한다.
 */
const LOW_VALUE_WORDS = new Set([
  "great", "good", "nice", "fine", "sorry", "right", "sure", "true", "okay",
  "want", "need", "know", "think", "take", "make", "look", "looks", "looking",
  "give", "keep", "help", "like", "love", "find", "tell", "said", "says",
  "thing", "things", "something", "anything", "everything", "someone", "everyone",
  "much", "many", "more", "most", "other", "another", "already", "always", "still",
  "actually", "maybe", "welcome", "thanks", "thank", "sounds", "sound", "hear",
  "yeah", "right", "little", "better", "best", "back", "next", "last", "first",
]);

export interface ContentWordCandidate {
  word: string;
  score: number;
}

function isLikelyProperNoun(word: string, sentence: string): boolean {
  if (!/^[A-Z]/.test(word)) return false;
  // 문장 첫 단어의 대문자는 이름 표시가 아니다
  const head = sentence.replace(/^(M|W|ANN)\s*:\s*/i, "").trim();
  const first = head.split(/\s+/)[0]?.replace(/[^A-Za-z']/g, "") ?? "";
  if (first.toLowerCase() === word.toLowerCase()) return false;
  return true;
}

/**
 * 한 줄에서 빈칸 후보와 점수를 뽑는다.
 * 점수: 길이 + 내용어 어미 + 대본에서 한 번만 나오는 말(변별력) − 흔한 말.
 * wordFrequency = 대본 전체에서 그 단어가 몇 번 나오는지 (없으면 1로 본다).
 */
export function scoreContentWords(
  line: string,
  wordFrequency?: Map<string, number>
): ContentWordCandidate[] {
  const tokens = line.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? [];
  const out: ContentWordCandidate[] = [];
  const seen = new Set<string>();
  for (const raw of tokens) {
    const word = raw.replace(/^['"]|['"]$/g, "");
    const key = word.toLowerCase();
    if (seen.has(key)) continue;
    if (key.length < 4) continue;
    if (FUNCTION_WORDS.has(key)) continue;
    if (isLikelyProperNoun(word, line)) continue;
    seen.add(key);

    let score = Math.min(8, 2 + Math.floor(word.length / 2));
    if (CONTENT_SUFFIXES.some((s) => key.length > s.length + 2 && key.endsWith(s))) score += 2;
    const freq = wordFrequency?.get(key) ?? 1;
    if (freq === 1) score += 2;
    else if (freq >= 3) score -= 2;
    if (LOW_VALUE_WORDS.has(key)) score -= 5;
    out.push({ word, score });
  }
  return out.sort((a, b) => b.score - a.score);
}

/** 대본 전체의 단어 빈도 */
export function buildWordFrequency(lines: string[]): Map<string, number> {
  const map = new Map<string, number>();
  for (const line of lines) {
    for (const raw of line.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? []) {
      const key = raw.toLowerCase();
      map.set(key, (map.get(key) ?? 0) + 1);
    }
  }
  return map;
}

/**
 * 내용어 후보가 하나도 없는 짧은 줄(“Sure, I will do that.”)을 위한 느슨한 후보.
 * 문장마다 빈칸 하나는 있어야 해서, 기능어·뻔한 말만 빼고 남은 단어를 점수 낮게 돌려준다.
 * 이 단계까지 두어야 모델을 부르지 않고도 모든 줄을 채울 수 있다.
 */
export function scoreFallbackWords(line: string): ContentWordCandidate[] {
  const tokens = line.match(/[A-Za-z]+(?:'[A-Za-z]+)?/g) ?? [];
  const out: ContentWordCandidate[] = [];
  const seen = new Set<string>();
  for (const raw of tokens) {
    const word = raw.replace(/^['"]|['"]$/g, "");
    const key = word.toLowerCase();
    if (seen.has(key) || key.length < 3) continue;
    if (FUNCTION_WORDS.has(key)) continue;
    seen.add(key);
    out.push({ word, score: Math.max(1, word.length - 3) });
  }
  return out.sort((a, b) => b.score - a.score);
}

/** 빈칸 하나가 규칙을 모두 만족하는지 (대본에 그대로 있는지는 호출 쪽에서 본다) */
export function isGoodRuleBlank(word: string, sentence: string): boolean {
  const key = word.trim().toLowerCase();
  if (key.length < 3) return false;
  if (FUNCTION_WORDS.has(key)) return false;
  if (isLikelyProperNoun(word.trim(), sentence)) return false;
  return /^[a-z]+(?:'[a-z]+)?$/.test(key);
}
