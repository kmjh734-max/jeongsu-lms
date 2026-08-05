/**
 * 2·3단계 / 워크북 빈칸: 중요 어휘·표현을 문장 전반에 분산 선택.
 * (앞에서부터 N개 자르기 금지)
 */
import { parseVocabMarks } from "@/lib/exam-prep/vocab-marks";

const EN_STOP = new Set(
  `the a an of to in on for and or is are was were be been being it this that with as by from at have has had do does did will would can could may might should must shall not but so if than then into over under about their its his her our your my we you they he she i am me him them us who whom whose which what when where why how all any each every both few more most other some such no nor only own same than too very just also even still already often usually really somehow something everything anything nothing someone anyone everyone nobody everybody perhaps maybe however therefore thus hence although though while during before after above below between through against among within without upon whether until unless because since until across around toward towards`.split(
    " "
  )
);

/** 의미는 있으나 빈칸 우선순위 낮은 영어 */
const EN_WEAK = new Set(
  `suppose example instance result fact case way thing things people person someone anyone everyone everybody nobody everything anything something nothing sometimes always never often usually really very quite rather just also even still already perhaps maybe however therefore thus hence although though while during before after good bad big small long short high low new old first last next much many more most less least little well better best worse worst true false right left same different such certain sure able unable possible impossible necessary know think say tell get put come go see look want like seem become keep let make`.split(
    " "
  )
);

const KO_LIGHT = new Set(
  "그 이 저 수 것 등 및 또 더 좀 잘 안 못 는 은 이 가 을 를 의 에 도 만 와 과 이나 또는 및 또한 매우 아주 다시 모든 어떤 이런 그런 저런 있는 없는 하는 되는 위해 대한 통해 따라 대해 관한 같은 다른 새로운 여러 각각 서로 우리 당신 여러분 사람들 사람 것으로 것이다 것입니다 있다 없다 한다 된다 된다 하자 보자 주세요".split(
    " "
  )
);

/** 담화·기능 우리말 (빈칸 비권장) */
const KO_WEAK = new Set(
  "예를 들어 들면 가정해 가정하면 결과 따라서 그러나 하지만 그래서 그리고 또한 또 즉 곧 사실 경우 때 점 부분 전체 이것 그것 저것 수 있다 없다 하다 되다 이다 아닙니다 것입니다 것입니다".split(
    " "
  )
);

export function englishCore(token: string): string {
  return token.replace(/^[^A-Za-z']+|[^A-Za-z']+$/g, "");
}

export function koreanCore(token: string): string {
  return token
    .replace(/[.,!?;:'"()\-…·]/g, "")
    .replace(/[은는이가을를의에도만와과이나]$/g, "")
    .trim();
}

export function scoreEnglishBlank(token: string): number {
  const core = englishCore(token);
  const low = core.toLowerCase();
  if (!core || core.length < 4) return -1;
  if (EN_STOP.has(low)) return -1;
  if (/^\d+$/.test(core)) return -1;
  let score = Math.min(core.length, 12);
  if (EN_WEAK.has(low)) return -1;
  if (core.length >= 7) score += 3;
  if (core.length >= 9) score += 2;
  if (/ing$|tion$|sion$|ment$|ness$|ity$|ous$|ive$|ical$|able$|ible$/i.test(core)) {
    score += 2;
  }
  // 축약·대명사형
  if (
    /(^'|n't$)/i.test(core) ||
    /^(you're|we're|they're|it's|that's|who's|what's|you've|we've|they've|i've|you'd|we'd|they'd|i'd|you'll|we'll|they'll|i'll|don't|doesn't|isn't|aren't|wasn't|weren't|haven't|hasn't|hadn't|won't|wouldn't|couldn't|shouldn't|can't|mustn't)$/i.test(
      core
    )
  ) {
    return -1;
  }
  return score;
}

export function scoreKoreanBlank(token: string): number {
  const hangul = token.replace(/[^\uAC00-\uD7A3]/g, "");
  if (hangul.length < 2) return -1;
  const core = koreanCore(token);
  if (!core || core.length < 2) return -1;
  if (KO_LIGHT.has(core) || KO_WEAK.has(core) || KO_LIGHT.has(hangul) || KO_WEAK.has(hangul)) {
    return -1;
  }
  let score = Math.min(hangul.length, 10);
  if (hangul.length >= 3) score += 2;
  if (hangul.length >= 4) score += 2;
  // 서술·담화 어미 덩어리
  if (/(하자|보자|주세요|습니다|됩니다|입니다)$/.test(hangul)) score -= 4;
  if (/^(예를|들어|들면|가정)/.test(hangul)) score -= 5;
  return score;
}

export function blankPickCount(
  candidateCount: number,
  difficulty: string,
  opts?: { max?: number }
): number {
  const max = opts?.max ?? 5;
  if (candidateCount <= 0) return 0;
  if (difficulty === "easy") {
    return Math.max(1, Math.min(2, Math.min(max, Math.ceil(candidateCount * 0.2))));
  }
  if (difficulty === "hard") {
    return Math.max(2, Math.min(max, Math.ceil(candidateCount * 0.4)));
  }
  // medium: PDF처럼 문장당 3~4개 전후, 앞쪽 몰림 없이
  return Math.max(2, Math.min(4, Math.min(max, Math.ceil(candidateCount * 0.35))));
}

/**
 * 점수 높은 후보를 문장 앞·중·뒤에 고르게 고른다.
 * @param items.index 단어 순번(0-based)
 */
export function pickSpreadByScore<T extends { index: number; score: number }>(
  items: T[],
  pickCount: number
): T[] {
  const eligible = items.filter((x) => x.score > 0).sort((a, b) => b.score - a.score);
  if (eligible.length === 0 || pickCount <= 0) return [];
  const n = pickCount;
  const maxIndex = Math.max(...eligible.map((x) => x.index), 1);
  const bandSize = Math.max(1, Math.ceil((maxIndex + 1) / 3));
  const bands = [0, 1, 2].map((b) =>
    eligible.filter((x) => Math.floor(x.index / bandSize) === b)
  );

  const picked: T[] = [];
  const used = new Set<number>();
  const minGap = Math.max(1, Math.floor(maxIndex / (n + 1)));

  const tryAdd = (cand: T | undefined) => {
    if (!cand || used.has(cand.index)) return false;
    if (picked.some((p) => Math.abs(p.index - cand.index) < minGap)) return false;
    picked.push(cand);
    used.add(cand.index);
    return true;
  };

  // 각 대역에서 최고점 1개
  for (const band of bands) {
    if (picked.length >= n) break;
    tryAdd(band[0]);
  }

  // 나머지: 점수순 + 간격
  for (const cand of eligible) {
    if (picked.length >= n) break;
    tryAdd(cand);
  }

  // 간격 완화 재시도
  if (picked.length < Math.min(n, eligible.length)) {
    const softGap = Math.max(1, Math.floor(minGap / 2));
    for (const cand of eligible) {
      if (picked.length >= n) break;
      if (used.has(cand.index)) continue;
      if (picked.some((p) => Math.abs(p.index - cand.index) < softGap)) continue;
      picked.push(cand);
      used.add(cand.index);
    }
  }

  // 그래도 부족하면 점수순으로 채움
  for (const cand of eligible) {
    if (picked.length >= n) break;
    if (used.has(cand.index)) continue;
    picked.push(cand);
    used.add(cand.index);
  }

  return picked.sort((a, b) => a.index - b.index);
}

export function vocabEnglishNeedles(vocabulary: unknown): string[] {
  return parseVocabMarks(vocabulary)
    .map((m) => (m.englishText || "").trim())
    .filter((t) => t.length >= 3);
}

export function vocabKoreanNeedles(vocabulary: unknown): string[] {
  return parseVocabMarks(vocabulary)
    .map((m) => (m.koreanText || "").trim())
    .filter((t) => t.length >= 2);
}

export { EN_STOP, EN_WEAK, KO_LIGHT, KO_WEAK };
