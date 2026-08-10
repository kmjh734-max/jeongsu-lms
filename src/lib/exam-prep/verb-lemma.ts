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
