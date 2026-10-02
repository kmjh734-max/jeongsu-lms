/** 제시어 배열 <보기> 정규화: 원형화 + 무작위 섞기 + 조건 정리 */

const FUNCTION_KEEP = new Set(
  [
    "a",
    "an",
    "the",
    "to",
    "of",
    "in",
    "on",
    "at",
    "for",
    "from",
    "with",
    "by",
    "as",
    "if",
    "or",
    "and",
    "but",
    "not",
    "no",
    "so",
    "than",
    "that",
    "this",
    "these",
    "those",
    "it",
    "its",
    "they",
    "them",
    "their",
    "he",
    "she",
    "him",
    "her",
    "we",
    "us",
    "our",
    "you",
    "your",
    "i",
    "me",
    "my",
    "who",
    "which",
    "what",
    "when",
    "where",
    "why",
    "how",
    "will",
    "would",
    "can",
    "could",
    "shall",
    "should",
    "may",
    "might",
    "must",
    "do",
    "does",
    "did",
    "be",
    "am",
    "is",
    "are",
    "was",
    "were",
    "been",
    "being",
    "have",
    "has",
    "had",
    "having",
  ].map((w) => w.toLowerCase())
);

/** 불규칙·자주 나오는 과거/과거분사 → 원형 */
const IRREGULAR: Record<string, string> = {
  been: "be",
  was: "be",
  were: "be",
  gone: "go",
  went: "go",
  known: "know",
  knew: "know",
  done: "do",
  did: "do",
  made: "make",
  taken: "take",
  took: "take",
  given: "give",
  gave: "give",
  seen: "see",
  saw: "see",
  came: "come",
  become: "become",
  became: "become",
  begun: "begin",
  began: "begin",
  broken: "break",
  broke: "break",
  brought: "bring",
  built: "build",
  bought: "buy",
  caught: "catch",
  chosen: "choose",
  chose: "choose",
  cut: "cut",
  drawn: "draw",
  drew: "draw",
  driven: "drive",
  drove: "drive",
  eaten: "eat",
  ate: "eat",
  fallen: "fall",
  fell: "fall",
  felt: "feel",
  found: "find",
  forgotten: "forget",
  forgot: "forget",
  gotten: "get",
  got: "get",
  grown: "grow",
  grew: "grow",
  heard: "hear",
  held: "hold",
  kept: "keep",
  left: "leave",
  lent: "lend",
  lost: "lose",
  meant: "mean",
  met: "meet",
  paid: "pay",
  put: "put",
  read: "read",
  ridden: "ride",
  rode: "ride",
  risen: "rise",
  rose: "rise",
  run: "run",
  ran: "run",
  said: "say",
  sold: "sell",
  sent: "send",
  set: "set",
  shown: "show",
  showed: "show",
  shut: "shut",
  sung: "sing",
  sang: "sing",
  sat: "sit",
  spoken: "speak",
  spoke: "speak",
  spent: "spend",
  stood: "stand",
  stolen: "steal",
  stole: "steal",
  stuck: "stick",
  swum: "swim",
  swam: "swim",
  taught: "teach",
  told: "tell",
  thought: "think",
  thrown: "throw",
  threw: "throw",
  understood: "understand",
  woken: "wake",
  woke: "wake",
  worn: "wear",
  wore: "wear",
  won: "win",
  written: "write",
  wrote: "write",
  allowed: "allow",
  allows: "allow",
  assumed: "assume",
  assumes: "assume",
  received: "receive",
  receives: "receive",
  reduced: "reduce",
  reduces: "reduce",
  tested: "test",
  tests: "test",
  provided: "provide",
  provides: "provide",
  required: "require",
  requires: "require",
  decided: "decide",
  decides: "decide",
  included: "include",
  includes: "include",
  created: "create",
  creates: "create",
};

const IRREGULAR_NOUN: Record<string, string> = {
  children: "child",
  men: "man",
  women: "woman",
  people: "person",
  teeth: "tooth",
  feet: "foot",
  mice: "mouse",
  geese: "goose",
  leaves: "leaf",
  lives: "life",
  knives: "knife",
  wives: "wife",
  selves: "self",
  monies: "money",
  moneys: "money",
  analyses: "analysis",
  crises: "crisis",
  theses: "thesis",
  phenomena: "phenomenon",
  criteria: "criterion",
  data: "datum",
};

function shuffleInPlace<T>(arr: T[]): T[] {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/** -ing로 끝나지만 분사가 아닌 기본형·명사 */
const ING_KEEP = new Set([
  "meaning",
  "feeling",
  "building",
  "ceiling",
  "sibling",
  "morning",
  "evening",
  "something",
  "anything",
  "nothing",
  "everything",
  "wedding",
  "meeting",
  "hearing",
  "during",
  "according",
  "regarding",
  "including",
  "excluding",
  "following",
  "outstanding",
  "understanding",
  "beginning",
  "clothing",
  "housing",
  "offering",
  "training",
  "warning",
]);

/** 동사 과거·3인칭 / 명사 복수 → 기본형 (고신뢰만; e 임의 추가·삭제 금지) */
const S_KEEP = new Set(
  [
    "always",
    "news",
    "means",
    "series",
    "species",
    "physics",
    "mathematics",
    "economics",
    "politics",
    "basics",
    "thanks",
    "towards",
    "afterwards",
    "focus",
    "campus",
    "status",
    "bonus",
    "virus",
    "process",
    "access",
    "success",
    "progress",
    "address",
    "business",
    "perhaps",
    "otherwise",
    "ourselves",
    "themselves",
    "yourselves",
    "analysis",
    "basis",
    "crisis",
    "thesis",
    "across",
    "unless",
    "whereas",
    "besides",
  ].map((w) => w.toLowerCase())
);

/**
 * 원래 낱말이 겹자음으로 끝나는 것들. 여기 걸리면 겹자음을 떼지 않는다.
 *
 * 선생님 지적(2026-09-28): 보기에 blessing이 bles로 잘려 나왔다.
 * running→run을 위한 규칙이 bless·call·add까지 잘라 버린 탓이다.
 * ff·ll·ss·zz로 끝나는 낱말은 원래 그 꼴이고(call, pass, off, buzz),
 * 그 밖에 겹자음으로 끝나는 낱말은 몇 개뿐이라 따로 적어 둔다.
 */
const DOUBLE_END_KEEP = new Set(["add", "ebb", "egg", "err", "inn", "odd", "purr"]);

/** -ves 가 f 로 돌아가는 낱말 (wolves → wolf) */
const VES_TO_F = new Set([
  "calf", "elf", "half", "leaf", "loaf", "scarf", "self", "sheaf", "shelf",
  "thief", "wharf", "wolf",
]);
/** -ves 가 fe 로 돌아가는 낱말 (knives → knife) */
const VES_TO_FE = new Set(["knife", "life", "wife"]);

function stripDoubledConsonant(stem: string): string | null {
  if (!/(.)\1$/.test(stem) || stem.length < 2) return null;
  if ("flsz".includes(stem.slice(-1))) return null;
  if (DOUBLE_END_KEEP.has(stem)) return null;
  return stem.slice(0, -1);
}

export function lemmaEnglishToken(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return trimmed;
  const lower = trimmed.toLowerCase();
  if (FUNCTION_KEEP.has(lower)) return lower;
  if (IRREGULAR[lower]) return IRREGULAR[lower];
  if (IRREGULAR_NOUN[lower]) return IRREGULAR_NOUN[lower];
  if (S_KEEP.has(lower)) return lower;

  // -ies → y (cities → city, studies → study)
  if (/^[a-z]+ies$/i.test(lower) && lower.length > 4) {
    return lower.slice(0, -3) + "y";
  }
  /*
   * -ves → f 는 정해 둔 낱말에만 쓴다.
   *
   * 선생님과 함께 전수조사(2026-09-30): 보기에 prof·detectif·motif 같은 말이
   * 나왔다. proves·detectives·motives처럼 ves 로 끝나기만 하면 f 를 붙인 탓이다.
   * f·fe 로 바뀌는 낱말은 몇 개뿐이라 적어 두고, 나머지는 -s 만 뗀다.
   */
  if (/^[a-z]+ves$/i.test(lower) && lower.length > 4) {
    const base = lower.slice(0, -3);
    if (VES_TO_F.has(`${base}f`)) return `${base}f`;
    if (VES_TO_FE.has(`${base}fe`)) return `${base}fe`;
    return lower.slice(0, -1);
  }
  // -oes → o (heroes → hero, goes → go)
  if (/^[a-z]+oes$/i.test(lower) && lower.length > 4) {
    return lower.slice(0, -2);
  }
  // -sses / -ches / -shes / -xes / -zes → drop -es
  if (/(?:ss|ch|sh|x|z)es$/i.test(lower)) {
    return lower.slice(0, -2);
  }
  // buses / gases → bus / gas
  if (/[aeiou]ses$/i.test(lower) && lower.length > 4) {
    return lower.slice(0, -2);
  }
  // -ied → y (studied → study)
  if (/^[a-z]+ied$/i.test(lower) && lower.length > 4) {
    return lower.slice(0, -3) + "y";
  }
  // -ed: 고신뢰만 — 불규칙 맵 또는 자음 중복 (stopped → stop). e 임의 부착 금지.
  if (/^[a-z]+ed$/i.test(lower) && lower.length > 4) {
    const stem = lower.slice(0, -2);
    if (stem.length >= 3) {
      const stripped = stripDoubledConsonant(stem);
      if (stripped) return stripped;
    }
    return lower;
  }
  // -ing: 명사 유지 · 자음 중복만 (running → run). making→make 등 추측 금지.
  if (/^[a-z]+ing$/i.test(lower) && lower.length > 5) {
    if (ING_KEEP.has(lower)) return lower;
    const stem = lower.slice(0, -3);
    const stripped = stripDoubledConsonant(stem);
    if (stripped) return stripped;
    return lower;
  }
  // 3인칭·복수 -s (allows → allow, consumers → consumer, changes → change)
  if (/^[a-z]+s$/i.test(lower) && lower.length > 4 && !/ss$/i.test(lower)) {
    if (/(?:ous|ius|us|is|ess|asis|esis|osis)$/i.test(lower)) return lower;
    // pages → page, changes → change
    if (/[bcdfghjklmnpqrstvwxyz]es$/i.test(lower)) {
      return lower.slice(0, -1);
    }
    if (/[^aeiou]s$/i.test(lower)) {
      return lower.slice(0, -1);
    }
  }

  return lower;
}

export function splitWordBank(raw: string): string[] {
  return raw
    .split(/\s*\/\s*|\s*,\s*|\n+/)
    .map((w) => w.trim())
    // \uC22B\uC790\uB3C4 \uB0B1\uB9D0\uC774\uB2E4(2018 \uB4F1) \u2014 \uC601\uBB38\uC790\uB9CC \uC138\uBA74 <\uBCF4\uAE30>\uC5D0\uC11C \uBE60\uC9C4\uB2E4
    .filter((w) => w && /[A-Za-z0-9]/.test(w) && !/[\uAC00-\uD7A3]/.test(w));
}

export function joinWordBank(words: string[]): string {
  return words.join(" / ");
}

/** 정답 영어 구 → 토큰 (구두점 제거) */
export function tokenizeAnswerPhrase(answer: string): string[] {
  return String(answer ?? "")
    .replace(/^[ⓐⓑⓒⓓⓔ]\s*[:：]?\s*/i, "")
    /*
     * 낱말 안의 홑따옴표는 살린다 — artist’s가 artists가 되면 정답을 쓸 수 없다
     * (선생님 지적 2026-09-29 요약문 빈칸). 낱말 밖의 따옴표만 걷어 낸다.
     */
    .replace(/[“”‘’"'`ʼ]/g, (mark, at: number, whole: string) => {
      const before = whole[at - 1] ?? "";
      const after = whole[at + 1] ?? "";
      return /[A-Za-z]/.test(before) && /[A-Za-z]/.test(after) ? "’" : "";
    })
    /*
     * 낱말 안의 붙임표도 살린다 — hip-hop이 hip과 hop으로 갈라지면 <보기>에 둘로
     * 나와서 붙여 쓸 길이 없고, 조건의 낱말 수와도 어긋난다.
     *
     * 선생님과 함께 전수조사(2026-09-29): 제시어배열어형변화 9월분 152문항 가운데
     * 여섯 개가 그랬다. English-speaking·self-worth·hip-hop이 갈라져 있었다.
     * 긴 줄표(— –)는 낱말 사이를 가르는 것이므로 그대로 공백으로 둔다.
     */
    .replace(/-/g, (mark, at: number, whole: string) => {
      const before = whole[at - 1] ?? "";
      const after = whole[at + 1] ?? "";
      return /[A-Za-z]/.test(before) && /[A-Za-z]/.test(after) ? "-" : " ";
    })
    .replace(/[.,!?;:()[\]{}…—–]/g, " ")
    .split(/\s+/)
    .map((w) => w.trim())
    /*
     * 숫자도 낱말이다. 영문자가 있어야만 센 탓에 「It was in 2018 that …」의 2018이
     * <보기>에서도 빠지고 낱말 수에서도 빠졌다. 조건은 「단어를 더하거나 빼지 말 것」인데
     * 보기에 없는 2018을 넣어야 답이 되었다(2026-10-01 Jayden 선생님 지적).
     */
    .filter((w) => w.length > 0 && /[A-Za-z0-9]/.test(w));
}

export type WordOrderBankMode = "basic" | "inflect" | "add";

/**
 * 정답에 쓰인 단어가 <보기>에 빠지지 않게 맞춤.
 * - basic / inflect: 보기 = 정답 토큰 다중집합 (어형변화 모드는 원형)
 * - add: 기존 보기 유지 + 정답의 내용어(전치사·관사 제외) 누락분 보강
 */
export function buildWordBankFromAnswer(
  correctAnswer: string,
  mode: WordOrderBankMode,
  existingBankRaw = ""
): string[] {
  const answerTokens = tokenizeAnswerPhrase(correctAnswer);
  if (answerTokens.length === 0) {
    return splitWordBank(scrubWordBankNoise(existingBankRaw)).map(lemmaEnglishToken);
  }

  if (mode === "add") {
    const bank = splitWordBank(scrubWordBankNoise(existingBankRaw)).map(
      lemmaEnglishToken
    );
    const contentNeeded = answerTokens
      .map(lemmaEnglishToken)
      .filter((t) => t && !FUNCTION_KEEP.has(t));
    for (const w of contentNeeded) {
      const need = contentNeeded.filter((x) => x === w).length;
      while (bank.filter((x) => x === w).length < need) {
        bank.push(w);
      }
    }
    return bank.filter(Boolean);
  }

  // basic: 형태 고정 → 정답 표면형 유지 / inflect: 원형
  return answerTokens
    .map((t) => (mode === "inflect" ? lemmaEnglishToken(t) : t.toLowerCase()))
    .filter(Boolean);
}

function countMap(tokens: string[]): Map<string, number> {
  const m = new Map<string, number>();
  for (const t of tokens) {
    m.set(t, (m.get(t) ?? 0) + 1);
  }
  return m;
}

/** 보기가 정답 토큰을 모두 커버하는지 (lemma 기준) */
export function wordBankMissingFromAnswer(
  bankRaw: string,
  correctAnswer: string,
  mode: WordOrderBankMode
): string[] {
  const bank = splitWordBank(scrubWordBankNoise(bankRaw)).map(lemmaEnglishToken);
  const bankCounts = countMap(bank);
  const answerTokens = tokenizeAnswerPhrase(correctAnswer).map(lemmaEnglishToken);
  const needed =
    mode === "add"
      ? answerTokens.filter((t) => t && !FUNCTION_KEEP.has(t))
      : answerTokens.filter(Boolean);

  const missing: string[] = [];
  const needCounts = countMap(needed);
  for (const [w, n] of needCounts) {
    const have = bankCounts.get(w) ?? 0;
    for (let i = have; i < n; i++) missing.push(w);
  }
  return missing;
}

export function normalizeAndShuffleWordBank(raw: string): string {
  const tokens = splitWordBank(scrubWordBankNoise(raw))
    .map(lemmaEnglishToken)
    .filter(Boolean);
  if (tokens.length === 0) return "";
  shuffleInPlace(tokens);
  return joinWordBank(tokens);
}

/**
 * 어형을 그대로 두고 섞기만 한다.
 *
 * 요약문 빈칸 영작처럼 「보기 단어를 모두 한 번씩」 쓰는 유형에 쓴다. 원형으로 바꾸면
 * expresses가 express로, child's가 child로 되어 정답과 맞지 않는다.
 */
export function shuffleWordBankKeepForms(raw: string): string {
  const tokens = splitWordBank(scrubWordBankNoise(raw)).filter(Boolean);
  if (tokens.length === 0) return "";
  shuffleInPlace(tokens);
  return joinWordBank(tokens);
}

/** 표시용: 원형만 (재섞기 없음 — 매 렌더마다 순서가 바뀌지 않게) */
export function lemmaWordBankOnly(raw: string): string {
  const tokens = splitWordBank(scrubWordBankNoise(raw))
    .map(lemmaEnglishToken)
    .filter(Boolean);
  if (tokens.length === 0) return "";
  return joinWordBank(tokens);
}

/** 보기에 섞인 «에 없는 단어 추가 가능»·한글 잔여 제거 */
const EXTRA_WORD_RE =
  /(?:<\/?보기>|\s*보기)?\s*에\s*없는\s*단어\s*추가\s*가능|없는\s*단어\s*추가\s*가능/gi;

export function scrubWordBankNoise(raw: string): string {
  return (raw || "")
    .replace(/<\/?보기>/gi, "")
    .replace(EXTRA_WORD_RE, " ")
    .replace(/^○\s*.+$/gm, " ")
    .replace(/[\uAC00-\uD7A3]+/g, " ")
    .replace(/\/\s*\//g, "/")
    .replace(/^\s*\/\s*|\s*\/\s*$/g, "")
    .replace(/\s{2,}/g, " ")
    .trim();
}

export function stripExtraWordHint(conditions: string): {
  conditions: string;
  allowExtraWords: boolean;
} {
  let allowExtraWords = EXTRA_WORD_RE.test(conditions);
  EXTRA_WORD_RE.lastIndex = 0;
  let next = conditions
    .replace(EXTRA_WORD_RE, "")
    .replace(/\s*\/\s*$/g, "")
    .replace(/^\s*\/\s*/g, "")
    .replace(/\n{2,}/g, "\n")
    .split(/\n+/)
    .map((l) => l.trim())
    .filter((l) => l && !/^○\s*$/.test(l) && !/^·\s*$/.test(l))
    .join("\n")
    .trim();
  // 한 줄에 여러 조건이 / 로 이어진 경우 줄바꿈
  if (!/\n/.test(next) && /\s\/\s/.test(next)) {
    next = next
      .split(/\s\/\s/)
      .map((s) => s.trim())
      .filter(Boolean)
      .map((s) => (s.startsWith("○") || s.startsWith("·") ? s : `○ ${s}`))
      .join("\n");
  }
  if (allowExtraWords || /추가\s*가능/.test(conditions)) {
    allowExtraWords = true;
  }
  return { conditions: next, allowExtraWords };
}

/** questionText의 <보기>·<조건>을 정리해 다시 조립.
 * correctAnswer가 있으면 정답에 필요한 단어가 보기에 빠지지 않게 보정한다.
 */
export function normalizeWordOrderQuestionText(
  questionText: string,
  opts?: { correctAnswer?: string; mode?: WordOrderBankMode }
): string {
  const cleaned = (questionText || "")
    .replace(/<보기>(의|를|에|만|와|과|로|을|은|이|가)/g, "보기$1")
    .trim();
  if (!/<조건>/.test(cleaned) || !/<보기>/.test(cleaned) || !/<해석>/.test(cleaned)) {
    return questionText;
  }
  let conditions =
    cleaned.match(/<조건>\s*([\s\S]*?)(?=<보기>|$)/)?.[1]?.trim() ?? "";
  let words =
    cleaned.match(/<보기>\s*([\s\S]*?)(?=<해석>|$)/)?.[1]?.trim() ?? "";
  const translation =
    cleaned.match(/<해석>\s*([\s\S]*?)$/)?.[1]?.trim() ?? "";

  // 보기 본문에 섞인 안내·중복 태그·한글 잔여 제거
  words = scrubWordBankNoise(words)
    .replace(/가정법[\s\S]*?(?=\n|$)/g, "")
    .trim();
  // 조건에 문법 팁이 잘못 들어간 경우 조건만 남김 (긴 문법 설명은 제거하지 않되 보기 힌트는 분리)
  const stripped = stripExtraWordHint(conditions);
  conditions = stripped.conditions;
  if (stripped.allowExtraWords && !/어형|중복|추가|사용/.test(conditions)) {
    conditions = "○ 단어 중복·어형 변화 가능";
  } else if (stripped.allowExtraWords && !/추가/.test(conditions)) {
    /* keep */
  }

  const mode: WordOrderBankMode =
    opts?.mode ??
    (stripped.allowExtraWords || /추가\s*가능/.test(conditions)
      ? "add"
      : /어형|변화/.test(conditions)
        ? "inflect"
        : "basic");

  const answer = String(opts?.correctAnswer ?? "").trim();
  if (answer) {
    const reconciled = buildWordBankFromAnswer(answer, mode, words);
    if (reconciled.length > 0) {
      shuffleInPlace(reconciled);
      words = joinWordBank(reconciled);
    } else {
      words = normalizeAndShuffleWordBank(words);
    }
  } else {
    words = normalizeAndShuffleWordBank(words);
  }

  const condBlock = conditions
    .split(/\n+/)
    .map((l) => l.trim())
    .filter(Boolean)
    .join("\n");

  // add 모드: 조건에 "단어 추가 가능" 이 반드시 있어야 한다
  if (mode === "add") {
    const hasDaneoAdd = /단어\s*추가\s*가능/.test(condBlock);
    const finalCond = hasDaneoAdd
      ? condBlock
      : `${condBlock}\n○ 단어 추가 가능`.trim();
    return `<조건>\n${finalCond}\n\n<보기>\n${words}\n\n<해석>\n${translation}`.trim();
  }

  return `<조건>\n${condBlock}\n\n<보기>\n${words}\n\n<해석>\n${translation}`.trim();
}

