/**
 * 5단계·워크북 동사형: 활용형 → 원형(dictionary form)
 * are/is/was → be, brought → bring
 */

const VERB_FORM_TO_BASE: Record<string, string> = {
  am: "be",
  is: "be",
  are: "be",
  was: "be",
  were: "be",
  been: "be",
  being: "be",
  "'s": "be",
  "'re": "be",
  "'m": "be",
  has: "have",
  had: "have",
  having: "have",
  "'ve": "have",
  "'d": "have",
  does: "do",
  did: "do",
  done: "do",
  doing: "do",
  went: "go",
  gone: "go",
  going: "go",
  made: "make",
  making: "make",
  took: "take",
  taken: "take",
  taking: "take",
  came: "come",
  coming: "come",
  saw: "see",
  seen: "see",
  seeing: "see",
  got: "get",
  gotten: "get",
  getting: "get",
  said: "say",
  saying: "say",
  left: "leave",
  leaving: "leave",
  felt: "feel",
  feeling: "feel",
  found: "find",
  finding: "find",
  gave: "give",
  given: "give",
  giving: "give",
  knew: "know",
  known: "know",
  knowing: "know",
  thought: "think",
  thinking: "think",
  told: "tell",
  telling: "tell",
  became: "become",
  becoming: "become",
  began: "begin",
  begun: "begin",
  beginning: "begin",
  ran: "run",
  running: "run",
  wrote: "write",
  written: "write",
  writing: "write",
  spoke: "speak",
  spoken: "speak",
  speaking: "speak",
  brought: "bring",
  bringing: "bring",
  bought: "buy",
  buying: "buy",
  caught: "catch",
  catching: "catch",
  taught: "teach",
  teaching: "teach",
  built: "build",
  building: "build",
  kept: "keep",
  keeping: "keep",
  lost: "lose",
  losing: "lose",
  meant: "mean",
  meaning: "mean",
  met: "meet",
  meeting: "meet",
  paid: "pay",
  paying: "pay",
  put: "put",
  putting: "put",
  read: "read",
  reading: "read",
  sent: "send",
  sending: "send",
  set: "set",
  setting: "set",
  shown: "show",
  showed: "show",
  showing: "show",
  sold: "sell",
  selling: "sell",
  spent: "spend",
  spending: "spend",
  stood: "stand",
  standing: "stand",
  understood: "understand",
  understanding: "understand",
  won: "win",
  winning: "win",
  broke: "break",
  broken: "break",
  breaking: "break",
  chose: "choose",
  chosen: "choose",
  choosing: "choose",
  drove: "drive",
  driven: "drive",
  driving: "drive",
  ate: "eat",
  eaten: "eat",
  eating: "eat",
  fell: "fall",
  fallen: "fall",
  falling: "fall",
  flew: "fly",
  flown: "fly",
  flying: "fly",
  forgot: "forget",
  forgotten: "forget",
  forgetting: "forget",
  froze: "freeze",
  frozen: "freeze",
  freezing: "freeze",
  grew: "grow",
  grown: "grow",
  growing: "grow",
  hid: "hide",
  hidden: "hide",
  hiding: "hide",
  held: "hold",
  holding: "hold",
  hurt: "hurt",
  hurting: "hurt",
  laid: "lay",
  laying: "lay",
  lain: "lie",
  lying: "lie",
  led: "lead",
  leading: "lead",
  lent: "lend",
  lending: "lend",
  lit: "light",
  lighting: "light",
  rode: "ride",
  ridden: "ride",
  riding: "ride",
  rang: "ring",
  rung: "ring",
  ringing: "ring",
  rose: "rise",
  risen: "rise",
  rising: "rise",
  sang: "sing",
  sung: "sing",
  singing: "sing",
  sank: "sink",
  sunk: "sink",
  sinking: "sink",
  sat: "sit",
  sitting: "sit",
  slept: "sleep",
  sleeping: "sleep",
  stole: "steal",
  stolen: "steal",
  stealing: "steal",
  swam: "swim",
  swum: "swim",
  swimming: "swim",
  threw: "throw",
  thrown: "throw",
  throwing: "throw",
  wore: "wear",
  worn: "wear",
  wearing: "wear",
  woke: "wake",
  woken: "wake",
  waking: "wake",
  drew: "draw",
  drawn: "draw",
  drawing: "draw",
  drank: "drink",
  drunk: "drink",
  drinking: "drink",
  hung: "hang",
  hanging: "hang",
  swore: "swear",
  sworn: "swear",
  tore: "tear",
  torn: "tear",
  bound: "bind",
  assumed: "assume",
  assuming: "assume",
  dumped: "dump",
  dumping: "dump",
  permitted: "permit",
  permitting: "permit",
  supposed: "suppose",
  supposing: "suppose",
  thanked: "thank",
  thanking: "thank",
  thanks: "thank",
};

/** 동사가 아닌데 -s/-ing/-ed 휴리스틱에 잡히기 쉬운 단어 */
export const NON_VERB_TOKENS = new Set(
  `sometimes always usually often never already still perhaps maybe however therefore thus hence although though while during before after above below between through against among within without upon whether until unless because since across around toward towards afterwards afterwards besides otherwise somehow anyway anyways everyone everything everyone someone something anyone anything nothing nobody everybody somebody anybody everybody somehow somewhere anywhere elsewhere somehow somehow this that these those thus plus minus versus via onto into unto upon among amongst amid amidst under over under underneath underneath throughout without within within without something everything anything nothing someone anyone everyone nobody everybody morning evening building ceiling feeling meaning warning housing meeting wedding shopping cooking reading writing learning understanding interesting exciting amazing following remaining existing outstanding united related limited detailed crowded according including regarding concerning during towards always sometimes usually often never already still perhaps really very quite rather just also even only own same such other another each every most many much more few little good bad big small long short high low new old great real true false next last first second garbage ocean plastic problem people rats tourists laws day days year years time times way ways part parts place places thing things fact case state world country city school student students child children man men woman women`.split(
    /\s+/
  )
);

const LY_VERB_EXCEPTIONS = new Set([
  "reply",
  "apply",
  "supply",
  "rely",
  "imply",
  "comply",
  "multiply",
]);

export function normalizeVerbToken(raw: string): string {
  return raw.toLowerCase().replace(/[^a-z']/g, "");
}

/** 활용형 → 원형. are→be, brought→bring, sometimes→sometimes(비동사면 그대로) */
export function verbLemma(raw: string): string {
  const w = normalizeVerbToken(raw);
  if (!w) return raw.toLowerCase();

  if (VERB_FORM_TO_BASE[w]) return VERB_FORM_TO_BASE[w]!;

  // contractions: you're → be, you've → have, it's → be
  const m = w.match(
    /^(?:i|you|we|they|he|she|it|that|what|who)'(s|re|m|ve|d|ll)$/
  );
  if (m) {
    const part = m[1]!;
    if (part === "s" || part === "re" || part === "m") return "be";
    if (part === "ve") return "have";
    if (part === "d") return "have";
    if (part === "ll") return "will";
  }

  if (w.endsWith("ying") && w.length > 5) return `${w.slice(0, -4)}y`;
  if (w.endsWith("ing") && w.length > 5) {
    const base = w.slice(0, -3);
    if (base.length >= 2 && base[base.length - 1] === base[base.length - 2]) {
      return base.slice(0, -1);
    }
    if (base.endsWith("v")) return `${base}e`;
    return base;
  }
  if (w.endsWith("ied") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith("ed") && w.length > 4) {
    const base = w.slice(0, -2);
    if (base.endsWith("i")) return `${base.slice(0, -1)}y`;
    if (
      base.length >= 2 &&
      base[base.length - 1] === base[base.length - 2] &&
      !/[aeiou]/.test(base[base.length - 1]!)
    ) {
      return base.slice(0, -1);
    }
    return base;
  }
  if (w.endsWith("ies") && w.length > 4) return `${w.slice(0, -3)}y`;
  if (w.endsWith("es") && w.length > 4 && /[sxz]|[cs]h$/.test(w.slice(0, -2))) {
    return w.slice(0, -2);
  }
  if (w.endsWith("s") && w.length > 3 && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}

export function isLikelyNonVerbToken(raw: string): boolean {
  const w = normalizeVerbToken(raw);
  if (!w) return true;
  if (NON_VERB_TOKENS.has(w)) return true;
  if (w.endsWith("ly") && !LY_VERB_EXCEPTIONS.has(verbLemma(w))) return true;
  return false;
}

/** 조동사 중 형태 변화가 거의 없는 것 (빈칸 제외) */
export const MODAL_VERBS = new Set(
  "can could will would may might must should shall".split(" ")
);

export const BE_HAVE_DO = new Set(
  "am is are was were be been being have has had do does did done doing".split(
    " "
  )
);

/**
 * 5단계 정형·활용 동사 원형 목록.
 * (원형 그대로 쓰인 suppose/know/assume 등도 빈칸 대상으로 잡기 위함)
 */
export const COMMON_VERB_LEMMAS = new Set(
  `
be have do go make take give come see get say know think tell become begin run write speak
bring buy catch teach build keep lose mean meet pay put read send set show sell spend stand
understand win break choose drive eat fall fly forget freeze grow hide hold hurt lay lie lead
lend light ride ring rise sing sink sit sleep steal swim throw wear wake draw drink hang swear
tear bind assume suppose dump permit thank protect urge fix attract leave need seem appear
suggest drift scan emerge angle gather drain perish feel let live look want like try help hope
wish expect believe remember decide refuse agree allow force cause enable create include
provide require remain continue start stop finish move turn call ask answer work play learn
study use find change happen occur exist contain consist depend rely consider notice realize
recognize describe explain discuss mention prove support oppose prefer enjoy hate love fear
avoid prevent reduce increase improve develop produce offer accept receive return strengthen
manage supervise
`
    .split(/\s+/)
    .filter(Boolean)
);

/** 동사처럼 보이지만 명사 자리가 흔한 단어 (in charge / an increase 등) */
export const VERB_LOOKALIKE_NOUNS = new Set(
  `
charge board result example instance fact case way thing part place state time world
people person home work school day year life land food light waste trash garbage problem
situation increase decrease change challenge process progress research access control
demand supply experience practice report review influence damage benefit form force
issue impact attempt concern interest visit travel account amount number rate level
point effect record present past future question answer order cause reason purpose
support need use help hope love fear play call show move start finish return offer
`
    .split(/\s+/)
    .filter(Boolean)
);

/** 관사·소유격·지시 뒤면 명사 자리로 본다 */
export const NOUN_DETERMINERS = new Set(
  "a an the this that these those my your our their his her its any some no every each another other such".split(
    " "
  )
);

/** 앞에 오면 뒤 단어가 명사일 확률이 높은 형용사·수량 표현 */
const NOUN_PREMODIFIERS =
  /^(significant|sharp|sudden|gradual|rapid|large|small|great|further|overall|percent|percentage|dramatic|slight|steady|annual|total|average|major|minor|recent|current|growing|increasing|decreasing)$/i;

/** 뒤에 전치사가 오면 명사구(increase in / change of) */
const NOUN_FOLLOW_PREP =
  /^(in|of|on|to|for|from|into|with|by|about|over|under|between|among|as)$/i;

/**
 * 동사·명사 동형(increase 등)이 명사 자리인지 판별.
 * 예: an increase / significant increase / increase in sales
 */
export function isLikelyNounSlot(
  tokenLow: string,
  prevLow: string | undefined,
  nextLow: string | undefined
): boolean {
  const lemma = verbLemma(tokenLow);
  const dual =
    VERB_LOOKALIKE_NOUNS.has(tokenLow) || VERB_LOOKALIKE_NOUNS.has(lemma);
  if (!dual) return false;
  if (prevLow && NOUN_DETERMINERS.has(prevLow)) return true;
  if (prevLow && NOUN_PREMODIFIERS.test(prevLow)) return true;
  if (prevLow && /(?:ous|ive|al|ful|less|ic|able|ary|ent|ant|ing|ed)$/i.test(prevLow)) {
    // significant / growing increase — 형용사·분사 수식
    if (!BE_HAVE_DO.has(prevLow) && !MODAL_VERBS.has(prevLow)) return true;
  }
  if (nextLow && NOUN_FOLLOW_PREP.test(nextLow)) return true;
  return false;
}
