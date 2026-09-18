/**
 * 두벌식 한글 조합 — 자체 한글 자판에서 자모를 하나씩 눌러 글자를 만든다.
 * 입력칸의 글자열 끝에 자모 하나를 더하거나(addJamo) 하나 지운다(removeJamo).
 * (ㄱ+ㅏ+ㄴ → 간, 간+ㅏ → 가나, 갈+ㄱ → 갉, ㅗ+ㅏ → ㅘ)
 */

const CHO = "ㄱㄲㄴㄷㄸㄹㅁㅂㅃㅅㅆㅇㅈㅉㅊㅋㅌㅍㅎ".split("");
const JUNG = "ㅏㅐㅑㅒㅓㅔㅕㅖㅗㅘㅙㅚㅛㅜㅝㅞㅟㅠㅡㅢㅣ".split("");
const JONG = ["", "ㄱ", "ㄲ", "ㄳ", "ㄴ", "ㄵ", "ㄶ", "ㄷ", "ㄹ", "ㄺ", "ㄻ", "ㄼ", "ㄽ", "ㄾ", "ㄿ", "ㅀ", "ㅁ", "ㅂ", "ㅄ", "ㅅ", "ㅆ", "ㅇ", "ㅈ", "ㅊ", "ㅋ", "ㅌ", "ㅍ", "ㅎ"];

/** 겹모음: 앞+뒤 → 합친 것 */
const VOWEL_PAIRS: Record<string, string> = {
  "ㅗㅏ": "ㅘ", "ㅗㅐ": "ㅙ", "ㅗㅣ": "ㅚ", "ㅜㅓ": "ㅝ", "ㅜㅔ": "ㅞ", "ㅜㅣ": "ㅟ", "ㅡㅣ": "ㅢ",
};
/** 겹받침: 앞+뒤 → 합친 것 */
const FINAL_PAIRS: Record<string, string> = {
  "ㄱㅅ": "ㄳ", "ㄴㅈ": "ㄵ", "ㄴㅎ": "ㄶ", "ㄹㄱ": "ㄺ", "ㄹㅁ": "ㄻ", "ㄹㅂ": "ㄼ", "ㄹㅅ": "ㄽ",
  "ㄹㅌ": "ㄾ", "ㄹㅍ": "ㄿ", "ㄹㅎ": "ㅀ", "ㅂㅅ": "ㅄ",
};
const splitPair = (map: Record<string, string>, joined: string): [string, string] | null => {
  for (const [pair, v] of Object.entries(map)) if (v === joined) return [pair[0]!, pair[1]!];
  return null;
};

const isVowel = (j: string) => JUNG.includes(j);
const isConsonant = (j: string) => CHO.includes(j) || JONG.includes(j);

function compose(cho: string, jung: string, jong = ""): string {
  const l = CHO.indexOf(cho);
  const v = JUNG.indexOf(jung);
  const t = JONG.indexOf(jong);
  if (l < 0 || v < 0 || t < 0) return cho + jung + jong;
  return String.fromCharCode(0xac00 + (l * 21 + v) * 28 + t);
}

function decompose(ch: string): { cho: string; jung: string; jong: string } | null {
  const code = ch.charCodeAt(0) - 0xac00;
  if (code < 0 || code > 11171) return null;
  return { cho: CHO[Math.floor(code / 588)]!, jung: JUNG[Math.floor((code % 588) / 28)]!, jong: JONG[code % 28]! };
}

/** 글자열 끝에 자모 하나를 더한다 */
export function addJamo(text: string, jamo: string): string {
  const head = text.slice(0, -1);
  const last = text.slice(-1);
  const syl = last ? decompose(last) : null;

  if (isVowel(jamo)) {
    if (syl) {
      if (syl.jong) {
        // 받침이 다음 글자의 첫소리로 넘어간다(겹받침이면 뒤쪽만)
        const pair = splitPair(FINAL_PAIRS, syl.jong);
        if (pair) return head + compose(syl.cho, syl.jung, pair[0]) + compose(pair[1], jamo);
        if (CHO.includes(syl.jong)) return head + compose(syl.cho, syl.jung) + compose(syl.jong, jamo);
        return text + jamo;
      }
      const joined = VOWEL_PAIRS[syl.jung + jamo];
      if (joined) return head + compose(syl.cho, joined);
      return text + jamo;
    }
    if (last && CHO.includes(last)) return head + compose(last, jamo);
    if (last && isVowel(last) && VOWEL_PAIRS[last + jamo]) return head + VOWEL_PAIRS[last + jamo];
    return text + jamo;
  }

  if (isConsonant(jamo)) {
    if (syl) {
      if (!syl.jong && JONG.includes(jamo)) return head + compose(syl.cho, syl.jung, jamo);
      if (syl.jong && FINAL_PAIRS[syl.jong + jamo]) return head + compose(syl.cho, syl.jung, FINAL_PAIRS[syl.jong + jamo]);
    }
    return text + jamo;
  }

  return text + jamo;
}

/** 글자열 끝에서 자모 하나를 지운다(글자 통째가 아니라 마지막으로 친 자모만) */
export function removeJamo(text: string): string {
  if (!text) return text;
  const head = text.slice(0, -1);
  const last = text.slice(-1);
  const syl = decompose(last);
  if (!syl) {
    const pair = splitPair(VOWEL_PAIRS, last);
    return pair ? head + pair[0] : head;
  }
  if (syl.jong) {
    const pair = splitPair(FINAL_PAIRS, syl.jong);
    return head + compose(syl.cho, syl.jung, pair ? pair[0] : "");
  }
  const vPair = splitPair(VOWEL_PAIRS, syl.jung);
  if (vPair) return head + compose(syl.cho, vPair[0]);
  return head + syl.cho;
}
