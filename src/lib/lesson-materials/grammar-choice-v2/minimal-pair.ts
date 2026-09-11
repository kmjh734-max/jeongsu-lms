import { stemVerb } from "@/lib/lesson-materials/grammar-choice-v2/local-validators";
import type { LocalRejectCode } from "@/lib/lesson-materials/grammar-choice-v2/types";

const LONG_ALLOW = new Set([
  "INDIRECT_QUESTION_ORDER",
  "INVERSION_NEGATIVE",
  "INVERSION_ONLY",
  "INVERSION_COMPLEMENT",
  "CLEFT_IT_THAT",
  "DUMMY_IT_SUBJECT",
  "CORRELATIVE_BOTH_AND",
  "CORRELATIVE_NOT_ONLY_BUT_ALSO",
  "CAUSATIVE_PASSIVE",
  "VOICE_BE_MADE_TO",
  "PERCEPTION_COMPLEMENT",
  "PARALLEL_VERBS",
  "PARALLEL_CLAUSES",
  "PARALLEL_SHARED_AUXILIARY",
]);

function tokens(text: string): string[] {
  return text.trim().split(/\s+/).filter(Boolean);
}

export function validateMinimalPair(input: {
  pointCode: string;
  sourceSpan: string;
  distractor: string;
  sentence: string;
}): LocalRejectCode | null {
  const correct = input.sourceSpan.trim();
  const wrong = input.distractor.trim();
  if (!correct || !wrong) return "SOURCE_ANSWER_MISMATCH";
  if (wrong === "∅") return "FUNCTION_WORD_OR_ARGUMENT_DROPPED";

  const bad = `${correct} ${wrong}`.toLowerCase();
  if (
    bad.includes("one bringing about") ||
    bad.includes("yet we not allowing") ||
    bad.includes("we not allowing") ||
    bad.includes("not allow ourselves")
  ) {
    return "IMPLAUSIBLE_CLAUSE_REWRITE";
  }
  if (/\bnot allowing\b/i.test(wrong) && !/\bare not allowing\b/i.test(wrong)) {
    return "UNREALISTIC_LEARNER_ERROR";
  }

  const cTok = tokens(correct);
  const wTok = tokens(wrong);
  const limit = LONG_ALLOW.has(input.pointCode) ? 8 : 4;
  if (cTok.length > limit || wTok.length > limit) return "NON_MINIMAL_SPAN";
  if (cTok.length > 6 && input.sentence.trim() === correct) {
    return "IMPLAUSIBLE_CLAUSE_REWRITE";
  }
  if (
    correct.length > 40 &&
    wrong.length > 40 &&
    input.sentence.includes(correct) &&
    correct.split(/\s+/).length > 6
  ) {
    return "IMPLAUSIBLE_CLAUSE_REWRITE";
  }

  if (isInsertionPair(cTok, wTok) && !insertionIsThePoint(input.pointCode)) {
    return "IMPLAUSIBLE_DISTRACTOR";
  }
  if (hasMultipleGrammarAxes(correct, wrong, input.pointCode)) {
    return "MULTI_AXIS_EDIT";
  }
  const diffs = alignedDiffs(cTok, wTok);
  if (
    diffs > 2 &&
    !LONG_ALLOW.has(input.pointCode) &&
    !isSingleAxisConstruction(correct, wrong) &&
    !isSingleVerbGroupAxis(correct, wrong)
  ) {
    return "MULTI_AXIS_EDIT";
  }
  if (dropsArgument(cTok, wTok)) return "FUNCTION_WORD_OR_ARGUMENT_DROPPED";
  return null;
}

/** 한쪽이 다른 쪽에 낱말을 끼워 넣은 것뿐인지(순서 유지). */
function isInsertionPair(a: string[], b: string[]): boolean {
  const [short, long] = a.length < b.length ? [a, b] : [b, a];
  if (short.length === 0 || long.length === short.length) return false;
  // 원형 / to부정사(stay / to stay)는 to 하나를 넣고 빼는 것이 곧 문법 축이다.
  if (long.length === short.length + 1 && long[0]?.toLowerCase() === "to") return false;
  let i = 0;
  for (const token of long) {
    if (i < short.length && token.toLowerCase() === short[i]!.toLowerCase()) i += 1;
  }
  return i === short.length;
}

/**
 * 낱말을 넣고 빼는 것 자체가 문법 포인트인 코드.
 * discuss (about) the issue, a friend you haven't seen (him), because (of), to sit (on),
 * be made (to) move, has (been) repaired처럼 끼워 넣은 낱말이 곧 틀린 곳이다.
 * 이 밖의 코드에서 끼워 넣기는 문항 축과 무관한 어색한 오답이 된다
 * (관측: [happiness / of happiness]가 that 명사절로, [new things / to new things]가
 * 동명사 목적어로, [moment / moment to be]가 5형식으로 나왔다).
 */
function insertionIsThePoint(code: string): boolean {
  return (
    /^(?:VOICE_|TENSE_|MODAL_|CONDITIONAL_|WISH_|AS_IF_|CORRELATIVE_|INVERSION_|PARTICIPIAL_CLAUSE_|INDIRECT_QUESTION_ORDER|NOUN_CLAUSE_DECLARATIVE_ORDER|RELATIVE_OMISSION|RELATIVE_WHAT|PREPOSITION_|CONJUNCTION_PREPOSITION|CAUSATIVE_|OBJECT_COMPLEMENT_(?:TO_V|BARE_V)|PERCEPTION_COMPLEMENT|INFINITIVE_(?:ADJECTIVE_ROLE|OBJECT_COMPLEMENT|PASSIVE|PERFECT)|GERUND_(?:PASSIVE|PERFECT)|ELLIPSIS_|SUBSTITUTE_DO|EMPHATIC_DO|PSEUDO_CLEFT_ALL|SO_AS_TO|IF_ONLY|MANDATIVE_|SENTENCE_SVOO|VERB_TRANSITIVE_INTRANSITIVE|PARALLEL_NOUN_PHRASES|PARALLEL_SHARED_TO|OTHERWISE_CONDITIONAL|WITHOUT_IF_CONDITION|IT_TAKES_TO|TOO_TO|ENOUGH_TO|ADVERB_CLAUSE_PURPOSE|NOUN_CLAUSE_WH_WORD)/.test(
      code
    )
  );
}

function norm(text: string): string {
  return text.trim().toLowerCase().replace(/[’]/g, "'");
}

function isSingleAxisConstruction(correct: string, wrong: string): boolean {
  const c = norm(correct);
  const w = norm(wrong);
  const pair = [c, w].sort().join("|");
  if (
    pair === "had|would have" ||
    pair === "were|would be" ||
    pair === "you have|do you have" ||
    pair === "things should|should things" ||
    // 목적 부사절: 규칙이 허용 쌍으로 적어 둔 고정 구 대비다.
    pair === "in order to|so that" ||
    pair === "in order that|in order to"
  ) {
    return true;
  }
  const cTok = tokens(c);
  const wTok = tokens(w);
  if (cTok.length === wTok.length && [...cTok].sort().join(" ") === [...wTok].sort().join(" ")) {
    return true;
  }
  // 낱말 하나를 넣거나 뺀 것(discussed the issue / about the issue, to me / me)은 축이 하나다.
  const [shorter, longer] = cTok.length < wTok.length ? [cTok, wTok] : [wTok, cTok];
  if (longer.length === shorter.length + 1) {
    for (let i = 0; i < longer.length; i++) {
      if ([...longer.slice(0, i), ...longer.slice(i + 1)].join(" ") === shorter.join(" ")) return true;
    }
  }
  return false;
}

function hasMultipleGrammarAxes(correct: string, wrong: string, pointCode: string): boolean {
  if (
    pointCode.startsWith("CONDITIONAL_") ||
    pointCode.startsWith("PARALLEL_") ||
    isSingleAxisConstruction(correct, wrong) ||
    isSingleVoiceOrParticipleAxis(correct, wrong, pointCode) ||
    isSingleVerbGroupAxis(correct, wrong)
  ) {
    return false;
  }
  const c = tokens(norm(correct));
  const w = tokens(norm(wrong));
  if (c.length === 0 || w.length === 0) return false;
  if (c.length === w.length && [...c].sort().join(" ") === [...w].sort().join(" ")) return false;

  const functionWord = new Set([
    "a", "an", "the", "to", "of", "be", "am", "is", "are", "was", "were",
    "been", "being", "do", "does", "did", "not", "and", "or", "but",
  ]);
  const onlyC = extraTokens(c, w);
  const onlyW = extraTokens(w, c);
  const extras = [...onlyC, ...onlyW];
  if (extras.length < 2) return false;

  const functionChanges = extras.filter((t) => functionWord.has(t));
  const contentChanges = extras.filter((t) => !functionWord.has(t));
  const finite = new Set(["am", "is", "are", "was", "were"]);
  if (functionChanges.some((token) => finite.has(token)) && contentChanges.length > 0) {
    return true;
  }
  if (functionChanges.some((token) => finite.has(token)) && sharedOrderChanged(c, w) && contentChanges.length > 0) {
    return true;
  }
  if (functionChanges.length > 0 && contentChanges.length > 0 && sharedOrderChanged(c, w)) {
    return true;
  }
  return false;
}

function isSingleVoiceOrParticipleAxis(
  correct: string,
  wrong: string,
  pointCode: string
): boolean {
  if (
    !pointCode.startsWith("VOICE_") &&
    !pointCode.includes("PARTICIPLE") &&
    !pointCode.startsWith("PASSIVE_")
  ) {
    return false;
  }
  const c = tokens(norm(correct));
  const w = tokens(norm(wrong));
  const aux = new Set(["be", "am", "is", "are", "was", "were", "been", "being"]);
  const finite = new Set(["am", "is", "are", "was", "were"]);
  const onlyC = extraTokens(c, w);
  const onlyW = extraTokens(w, c);
  const extras = [...onlyC, ...onlyW];
  const content = extras.filter((t) => !aux.has(t));
  const functionExtras = extras.filter((t) => aux.has(t));
  /**
   * 태를 바꾸면 표면은 두 군데가 움직인다 — be동사가 생기거나 사라지고 동사 형태가
   * 바뀐다(is set / sets). 그런데 문법 축은 하나(태)다.
   *
   * 예전에는 be동사가 움직였다는 것만 보고 축이 둘이라고 판정해서, 내신 어법의
   * 핵심인 능동태·수동태 문항이 항상 MULTI_AXIS_EDIT로 죽었다. 바뀐 내용어가
   * 같은 동사 가족이면(set/sets, obsessed/obsessing) 축은 하나다. 가족이 다르면
   * 그때는 태 말고 다른 것도 함께 바꾼 것이므로 예전처럼 막는다.
   */
  /**
   * 네모 안이 be동사와 그 동사 하나로만 이뤄져 있어야 태 하나만 묻는 문항이다.
   * are wonderfully made / wonderfully make처럼 부사를 끌고 들어오면 학생이 봐야 할
   * 것이 둘이 되므로 예전처럼 막는다.
   */
  const family = content.length ? verbFamily(content[0]!) : "";
  const verbPhraseOnly = [...c, ...w].every(
    (token) => aux.has(token) || verbFamily(token) === family
  );
  if (content.length === 0) return true;
  if (sameVerbFamily(content) && verbPhraseOnly) return true;
  if (functionExtras.some((token) => finite.has(token))) return false;
  return false;
}

const VERB_GROUP_AUX = new Set([
  "be", "am", "is", "are", "was", "were", "been", "being",
  "have", "has", "had", "having", "do", "does", "did",
  "will", "would", "shall", "should", "can", "could", "may", "might", "must",
  "not",
]);

const SUBJECT_PRONOUN = new Set(["i", "you", "he", "she", "it", "we", "they"]);

/** 축약형을 풀어 조동사를 낱말로 드러낸다. 's는 is/has/소유격이 겹쳐 풀지 않는다. */
function expandContractions(text: string): string[] {
  return tokens(
    norm(text)
      .replace(/\bwon't\b/g, "will not")
      .replace(/\bcan't\b/g, "can not")
      .replace(/\bshan't\b/g, "shall not")
      .replace(/n't\b/g, " not")
      .replace(/'ve\b/g, " have")
      .replace(/'ll\b/g, " will")
      .replace(/'re\b/g, " are")
      .replace(/'m\b/g, " am")
      .replace(/'d\b/g, " would")
  );
}

/**
 * 두 선택지가 동사 덩어리(조동사 + 한 동사의 형태)만 다르고 나머지는 같은지 본다.
 *
 * 시제·상·법은 표면에서 여러 낱말이 한꺼번에 움직인다: will have worked / has
 * worked, is belonging / belongs, I've been / I was, haven't seen / didn't see.
 * 그런데 묻는 축은 하나(동사의 형태)다. 낱말 수로만 축을 세면 이런 쌍이 전부
 * MULTI_AXIS_EDIT / DISTRACTOR_NOT_ALLOWED로 죽었다(관측: 8지문에서 모델이 낸
 * 시제 후보 10개 중 8개 탈락, 그중 3개가 이 경로).
 *
 * 조건: 바뀐 낱말이 모두 조동사이거나 한 동사 가족이고, 동사 덩어리 밖의 낱말
 * (주어, 목적어, 부사)은 순서까지 같다. 조동사는 본동사 앞에만 온다
 * (think not 같은 어순 바꾸기는 여기 해당하지 않는다).
 */
export function isSingleVerbGroupAxis(correct: string, wrong: string): boolean {
  const c = expandContractions(correct);
  const w = expandContractions(wrong);
  if (!c.length || !w.length) return false;
  const onlyC = extraTokens(c, w);
  const onlyW = extraTokens(w, c);
  const extras = [...onlyC, ...onlyW];
  if (extras.length === 0) return false;
  const lexical = extras.filter((t) => !VERB_GROUP_AUX.has(t));
  if (lexical.length > 0 && !sameVerbFamily(lexical)) return false;
  // 본동사 형태가 그대로면(will have worked / has worked) 끝의 같은 낱말이 본동사다.
  const sharedHead = c.at(-1) === w.at(-1) && !VERB_GROUP_AUX.has(c.at(-1) ?? "") ? c.at(-1)! : null;
  const family = lexical.length ? verbFamily(lexical[0]!) : sharedHead ? verbFamily(sharedHead) : null;

  const isVerbGroup = (t: string) =>
    VERB_GROUP_AUX.has(t) || (family !== null && verbFamily(t) === family);
  const outside = (list: string[]) => list.filter((t) => !isVerbGroup(t)).join(" ");
  if (outside(c) !== outside(w)) return false;
  // 동사 덩어리 밖에서 네모에 들어와도 되는 것은 주어 대명사뿐이다(I've been / I was).
  // 부사를 끌고 들어오면(are wonderfully made / wonderfully make) 봐야 할 것이 둘이 된다.
  if (c.filter((t) => !isVerbGroup(t)).some((t) => !SUBJECT_PRONOUN.has(t))) return false;

  // 조동사가 본동사 뒤에 오면 어순을 바꾼 것이다.
  const auxAfterVerb = (list: string[]) => {
    const verbAt = family === null ? -1 : list.findIndex((t) => verbFamily(t) === family);
    return verbAt >= 0 && list.slice(verbAt + 1).some((t) => VERB_GROUP_AUX.has(t) && t !== "not");
  };
  if (auxAfterVerb(c) || auxAfterVerb(w)) return false;
  return true;
}

/**
 * 같은 동사인지 본다.
 *
 * 예전에는 hold/make/do 세 개짜리 표에 규칙 접사 제거를 붙인 것이 전부여서
 * written/wrote 같은 불규칙이 서로 다른 동사로 보였다. 그래서 was written / wrote,
 * 즉 가장 표준적인 능동태·수동태 쌍이 축 둘로 판정돼 죽었다.
 * PR #1이 시제 판정을 고치며 만든 공용 표(stemVerb)를 그대로 쓴다.
 */
function verbFamily(word: string): string {
  return stemVerb(word);
}

function sameVerbFamily(words: string[]): boolean {
  if (words.length < 2) return true;
  const stems = words.map(verbFamily);
  return stems.every((stem) => stem.length >= 2 && stem === stems[0]);
}

function sharedOrderChanged(a: string[], b: string[]): boolean {
  const sharedA = a.filter((token) => b.includes(token));
  const sharedB = b.filter((token) => a.includes(token));
  return sharedA.join(" ") !== sharedB.join(" ");
}

function extraTokens(left: string[], right: string[]): string[] {
  const pool = [...right];
  const extra: string[] = [];
  for (const token of left) {
    const at = pool.indexOf(token);
    if (at >= 0) pool.splice(at, 1);
    else extra.push(token);
  }
  return extra;
}

function alignedDiffs(a: string[], b: string[]): number {
  const n = Math.max(a.length, b.length);
  let diffs = 0;
  for (let i = 0; i < n; i++) {
    if ((a[i] ?? "").toLowerCase() !== (b[i] ?? "").toLowerCase()) diffs += 1;
  }
  return diffs;
}

function dropsArgument(correct: string[], wrong: string[]): boolean {
  if (wrong.length >= correct.length) return false;
  const dropped = correct.length - wrong.length;
  return dropped >= 2;
}

type Token = { text: string; start: number; end: number };

function tokenSpans(text: string): Token[] {
  return [...text.matchAll(/\S+/g)].map((m) => ({
    text: m[0],
    start: m.index ?? 0,
    end: (m.index ?? 0) + m[0].length,
  }));
}

/**
 * 두 선택지에서 공통된 앞뒤 토큰을 잘라 실제로 다른 구간만 남긴다.
 *
 * 분석 모델이 절 병렬 같은 항목에서 절을 통째로 선택지로 내놓는 일이 있는데
 * (예: "We are wonderfully made, yet we don't allow ourselves to participate"),
 * 어법 선택은 다른 부분만 네모 안에 넣어야 읽을 수 있는 문항이 된다.
 *
 * 잘라낸 정답의 시작 오프셋을 함께 돌려주므로, 호출부는 이미 해석해 둔 원본
 * 스팬 위치에 더해 지문 내 위치를 다시 찾지 않고 계산할 수 있다.
 * 어순 문항은 앞쪽만 자른다. 뒤까지 자르면 어순 대비가 무너진다.
 */
export function trimToMinimalPair(
  correct: string,
  wrong: string,
  options?: { trimTrailing?: boolean }
): { correct: string; wrong: string; startOffset: number } | null {
  const c = tokenSpans(correct);
  const w = tokenSpans(wrong);
  if (c.length < 2 || w.length < 2) return null;

  const same = (a: Token, b: Token) => a.text.toLowerCase() === b.text.toLowerCase();
  const limit = Math.min(c.length, w.length) - 1;

  let lead = 0;
  while (lead < limit && same(c[lead]!, w[lead]!)) lead += 1;

  let trail = 0;
  if (options?.trimTrailing !== false) {
    while (
      lead + trail < limit &&
      same(c[c.length - 1 - trail]!, w[w.length - 1 - trail]!)
    ) {
      trail += 1;
    }
  }
  if (lead === 0 && trail === 0) return null;

  const cStart = c[lead]!.start;
  const cEnd = c[c.length - 1 - trail]!.end;
  const wStart = w[lead]!.start;
  const wEnd = w[w.length - 1 - trail]!.end;
  if (cEnd <= cStart || wEnd <= wStart) return null;

  let trimmedCorrect = correct.slice(cStart, cEnd);
  let trimmedWrong = wrong.slice(wStart, wEnd);

  // 양쪽에 똑같이 남은 꼬리 문장부호는 뗀다. 쉼표까지 네모에 넣으면 읽기 나쁘고,
  // 뗀 자리도 단어 경계라 원문에서 그대로 다시 찾을 수 있다.
  const tail = /[^A-Za-z0-9'’]+$/;
  const correctTail = tail.exec(trimmedCorrect)?.[0] ?? "";
  const wrongTail = tail.exec(trimmedWrong)?.[0] ?? "";
  if (correctTail && correctTail === wrongTail) {
    trimmedCorrect = trimmedCorrect.slice(0, -correctTail.length);
    trimmedWrong = trimmedWrong.slice(0, -wrongTail.length);
  }

  if (!trimmedCorrect.trim() || !trimmedWrong.trim()) return null;
  if (trimmedCorrect.toLowerCase() === trimmedWrong.toLowerCase()) return null;

  return { correct: trimmedCorrect, wrong: trimmedWrong, startOffset: cStart };
}
