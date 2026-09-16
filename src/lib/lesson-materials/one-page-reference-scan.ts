/**
 * 지문에서 지칭 표현 후보를 코드로 훑는다.
 *
 * 2026-09-16 선생님 지적: "대명사가 다 출제를 안 되고 있다. 지칭어를 모두 기록해야 한다."
 * 만드는 모델에게 "빠짐없이"라고 일러도 15문장짜리 지문에서 네 개만 내놓는 일이 있었다. 그래서
 * 후보는 모델의 성실함에 기대지 않고 여기서 규칙으로 모두 뽑고, 모델에게는 "이 후보가 가리키는
 * 말이 무엇이냐"만 되묻는다(generate-one-page의 보충 호출).
 */

/** 앞말을 받는 대명사. 글쓴이·읽는이를 가리키는 I·you·we는 넣지 않는다. */
const PRONOUNS = new Set([
  "it",
  "its",
  "itself",
  "they",
  "them",
  "their",
  "theirs",
  "themselves",
  "he",
  "him",
  "his",
  "himself",
  "she",
  "her",
  "hers",
  "herself",
  "one",
  "ones",
  "another",
  "others",
  "such",
]);

/** 뒤에 명사를 데리고 앞말을 받는 한정사 */
const DETERMINERS = new Set(["this", "that", "these", "those", "such", "the"]);

/** 한정사 바로 뒤에 오면 명사구가 아니다(동사·전치사·접속사·관계사 따위). */
const NOT_A_NOUN = new Set([
  "is","are","was","were","be","been","being","am","do","does","did","have","has","had","can","could",
  "will","would","shall","should","may","might","must","of","in","on","at","for","from","by","with",
  "to","as","than","that","which","who","whom","whose","and","or","but","if","because","so","not",
  "also","however","therefore","thus","then","when","where","while","after","before","during","since",
  "there","here","only","just","even","still","yet","both","all","many","much","more","most","some",
  "any","no","other","one","ones","it","its","they","them","their","he","she","we","you","i","my",
  "the","a","an","this","these","those","such","our","your","his","her",
  "somehow","somewhat","sometimes","always","never","often","again","rather","really","actually",
  "perhaps","maybe","instead","indeed","truly","simply","clearly","surely","almost","quite",
]);

/** 한정사와 명사 사이에 낄 만한 말(형용사 꼴). 이런 말이면 한 낱말 더 묶는다. */
const ADJECTIVE_HINTS = new Set([
  "new","old","same","whole","entire","first","second","third","last","very","general","human","social",
  "natural","early","late","high","low","large","small","single","simple","complex","common","different",
  "similar","basic","main","key","major","minor","modern","ancient","young","strong","weak","good","bad",
  "long","short","broad","narrow","deep","free","real","true","false","open","closed","global","local",
]);
const ADJECTIVE_SUFFIX = /(?:al|ic|ical|ive|ous|ful|less|able|ible|ary|ent|ant|ing|ed)$/;

/** 홀로 선 this·that 뒤에 오면 그 말이 주어·목적어로 앞 내용을 받는다는 표시(That is why…, How could that be?) */
const VERB_AFTER_DEMONSTRATIVE = new Set([
  "is","was","are","were","be","been","seems","seemed","sounds","sounded","means","meant","will","would",
  "can","could","may","might","should","must","does","do","did","has","have","had","happens","happened",
  "explains","shows","makes","made","becomes","became","matters","works","helps","leads","comes","gives",
]);

/** 앞 내용을 통째로 받는 '껍데기 명사'. the+이 명사는 앞에 같은 말이 없어도 지칭이 된다. */
const SHELL_NOUNS = new Set([
  "answer","reason","reasons","problem","problems","idea","ideas","question","questions","result","results",
  "fact","facts","point","points","case","situation","process","processes","phenomenon","effect","effects",
  "finding","findings","approach","method","solution","solutions","theory","claim","argument","example",
  "examples","story","quote","difference","change","changes","trend","practice","behavior","mechanism",
  "system","conclusion","view","opposite","latter","former","others","rest","same","efforts","effort",
]);

/** 가주어·가목적어·날씨/시간의 it(가리킬 말이 없으므로 지칭 문제가 되지 않는다) */
const DUMMY_IT_AFTER =
  /^\s+(?:is|was|'s|’s|seems|seemed|appears|appeared|becomes|became|remains|remained|takes|took|turns out|turned out|feels|felt|matters|helps|pays|makes sense)\b[^.;:!?]*?\b(?:to\s+[a-z]+|that\s+[a-z]+|whether|how|why|when)\b/i;
const DUMMY_IT_BEFORE = /\b(?:make|makes|made|find|finds|found|consider|considers|considered|think|thinks|thought|deem|deems|deemed|keep|keeps|kept)\s*$/i;
const WEATHER_IT =
  /^\s+(?:is|was|'s|’s|gets|got|rains|rained|snows|snowed)\s+(?:raining|snowing|sunny|rainy|cloudy|cold|hot|warm|dark|light|late|early|noon|midnight|\d)/i;

export type ReferenceCandidate = {
  sentenceIndex: number;
  /** 그 문장에 나온 그대로 */
  surface: string;
  start: number;
  end: number;
  /** 그 문장에서 같은 말이 몇 번째로 나왔는지(0부터) */
  occurrence: number;
};

/** 낱말 하나의 어근을 대충 자른다(the + 명사가 앞에 나온 말을 받는지 볼 때 쓴다). */
function stem(word: string): string {
  return word
    .toLowerCase()
    .replace(/[^a-z]/g, "")
    .replace(/(?:ies|es|s)$/, "")
    .replace(/(?:ing|ed)$/, "");
}

/**
 * 한정사 뒤의 명사구 길이(낱말 수). 형용사처럼 보이는 말은 지나쳐 뒤의 명사까지 묶는다
 * (this essential survival mechanism). 명사로 볼 만한 말이 없으면 0.
 */
function nounPhraseWords(words: string[], from: number, joined: (k: number) => boolean): number {
  let taken = 0;
  while (taken < 3) {
    const raw = words[from + taken];
    // 쉼표·따옴표가 끼면 명사구가 거기서 끝난다(that, once 같은 토막을 막는다).
    if (!raw || !joined(from + taken)) break;
    const w = raw.toLowerCase().replace(/[^a-z'’-]/g, "");
    if (!w || w.length < 2 || NOT_A_NOUN.has(w)) break;
    taken += 1;
    // 형용사처럼 보이면 한 낱말 더 본다(뒤에 명사가 온다).
    if (!(ADJECTIVE_HINTS.has(w) || ADJECTIVE_SUFFIX.test(w))) break;
  }
  return taken;
}

/**
 * 지문에서 지칭 표현 후보를 모두 뽑는다(문장 순서, 문장 안 자리 순서).
 * - 대명사(it, they, their, one, such…)와 앞말을 받는 명사구(this/that/these/those/such/the + 명사)
 * - 가주어·가목적어 it, 날씨·시간의 it, I·you·we는 뺀다.
 * - the + 명사는 그 명사(어근)가 앞 문장에 이미 나왔을 때만 후보로 둔다(첫 언급의 the는 지칭이 아니다).
 */
export function scanReferenceCandidates(sentences: string[]): ReferenceCandidate[] {
  const out: ReferenceCandidate[] = [];
  const seenStems = new Set<string>();
  sentences.forEach((sentence, sentenceIndex) => {
    const taken: Array<{ start: number; end: number }> = [];
    const counts = new Map<string, number>();
    const stemsHere: string[] = [];
    // 낱말과 그 자리
    const tokens: Array<{ text: string; start: number; end: number }> = [];
    const re = /[A-Za-z][A-Za-z'’-]*/g;
    let m: RegExpExecArray | null;
    while ((m = re.exec(sentence))) tokens.push({ text: m[0], start: m.index, end: m.index + m[0].length });
    const words = tokens.map((t) => t.text);

    tokens.forEach((tok, i) => {
      const lower = tok.text.toLowerCase();
      const isDeterminer = DETERMINERS.has(lower);
      const isPronoun = PRONOUNS.has(lower);
      if (!isDeterminer && !isPronoun) return;
      // 문장 첫 낱말이 대문자로 시작하는 고유명사(He/She)는 그대로 둔다(지칭이 맞다).

      let end = tok.end;
      let words2 = 0;
      if (isDeterminer) {
        words2 = nounPhraseWords(words, i + 1, (k) =>
          /^\s*$/.test(sentence.slice(tokens[k - 1]!.end, tokens[k]!.start))
        );
        if (words2 > 0) end = tokens[i + words2]!.end;
      }

      // the는 명사구일 때만 본다. 앞에 같은 말이 나왔거나(the story) 앞 내용을 받는 껍데기
      // 명사일 때만(the answer, the latter) 지칭으로 본다.
      if (lower === "the") {
        if (words2 === 0 || sentenceIndex === 0) return;
        const headWord = words[i + words2]!.toLowerCase().replace(/[^a-z]/g, "");
        const head = stem(headWord);
        if (!(head && seenStems.has(head)) && !SHELL_NOUNS.has(headWord)) return;
      }
      // 홀로 선 this·that은 뒤에 동사가 올 때만 본다(접속사·관계사의 that을 거른다).
      if ((lower === "that" || lower === "this" || lower === "such") && words2 === 0) {
        const next = words[i + 1]?.toLowerCase().replace(/[^a-z'’]/g, "") ?? "";
        if (!VERB_AFTER_DEMONSTRATIVE.has(next)) return;
      }

      if (lower === "it") {
        const after = sentence.slice(tok.end);
        const before = sentence.slice(0, tok.start);
        if (DUMMY_IT_AFTER.test(after) || WEATHER_IT.test(after) || DUMMY_IT_BEFORE.test(before)) return;
      }
      // one of / one another는 지칭이 아니다.
      if (lower === "one" && /^\s+(?:of|another)\b/i.test(sentence.slice(tok.end))) return;

      const surface = sentence.slice(tok.start, end);
      if (taken.some((t) => tok.start < t.end && t.start < end)) return;
      taken.push({ start: tok.start, end });
      const key = surface.toLowerCase();
      const occurrence = counts.get(key) ?? 0;
      counts.set(key, occurrence + 1);
      out.push({ sentenceIndex, surface, start: tok.start, end, occurrence });
    });

    for (const w of words) {
      const st = stem(w);
      if (st.length >= 3) stemsHere.push(st);
    }
    for (const st of stemsHere) seenStems.add(st);
  });
  return out;
}
