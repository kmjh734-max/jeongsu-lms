import table from "@/lib/vocab/engcore-levels.generated.json";
import { isFunctionWord } from "@/lib/vocab/function-words";

/**
 * 지문의 어휘 수준을 우리 EngCore 단어장으로 잰다.
 *
 * 선생님 말(2026-09-28): "EngCore 우리 단어 있잖아? 그거 수준으로 보여 줘도 좋을 듯."
 * 렉사일처럼 밖에서 빌려 온 어림값이 아니라, 우리가 실제로 가르치는 단어장을 자로 쓴다.
 * "이 지문은 중학필수까지로 92%가 덮이고, 고교필수 단어가 6%, 단어장 밖이 2%"처럼
 * 근거를 댈 수 있다.
 *
 * 표는 scripts/build-engcore-vocab-levels.mjs 가 단어장에서 뽑아 둔다(단어장이 바뀌면 다시 돌린다).
 */

const LEVELS: string[] = (table as { levels: string[] }).levels;
const WORDS: Record<string, number> = (table as { words: Record<string, number> }).words;
/** 낱말 → 품사 묶음(1=동사, 2=형용사, 4=명사·그 밖). 단어장 뜻풀이로 어림한 값이다. */
const POS: Record<string, number> = (table as { pos?: Record<string, number> }).pos ?? {};

/** 화면에 쓰는 짧은 이름 */
export const LEVEL_LABELS = LEVELS.map((n) => n.replace(/^EngCore\s*/, ""));

/** 굴절을 벗겨 단어장에 있는 꼴로 맞춰 본다. 사전이 아니라 규칙 몇 개다. */
function lookup(raw: string): number | null {
  const w = raw.toLowerCase().replace(/[^a-z'-]/g, "");
  if (!w) return null;
  if (WORDS[w] !== undefined) return WORDS[w];

  const tries: string[] = [];
  if (w.endsWith("ies") && w.length > 4) tries.push(w.slice(0, -3) + "y");
  if (w.endsWith("es") && w.length > 3) tries.push(w.slice(0, -2));
  if (w.endsWith("s") && w.length > 3) tries.push(w.slice(0, -1));
  if (w.endsWith("ied") && w.length > 4) tries.push(w.slice(0, -3) + "y");
  if (w.endsWith("ed") && w.length > 3) {
    tries.push(w.slice(0, -2), w.slice(0, -1));
    if (/([bcdfghjklmnpqrstvwxz])\1ed$/.test(w)) tries.push(w.slice(0, -3));
  }
  if (w.endsWith("ing") && w.length > 4) {
    tries.push(w.slice(0, -3), w.slice(0, -3) + "e");
    if (/([bcdfghjklmnpqrstvwxz])\1ing$/.test(w)) tries.push(w.slice(0, -4));
  }
  if (w.endsWith("ly") && w.length > 3) tries.push(w.slice(0, -2));
  if (w.endsWith("er") && w.length > 3) tries.push(w.slice(0, -2), w.slice(0, -1));
  if (w.endsWith("est") && w.length > 4) tries.push(w.slice(0, -3), w.slice(0, -2));
  if (w.endsWith("'s")) tries.push(w.slice(0, -2));

  for (const t of tries) {
    if (WORDS[t] !== undefined) return WORDS[t];
  }
  return null;
}

/** 단어장 표에 굴절형이 없는 불규칙 과거·과거분사·비교급 → 원형 */
const IRREGULAR: Record<string, string> = {
  had: "have", has: "have", was: "be", were: "be", been: "be", went: "go", gone: "go",
  did: "do", done: "do", made: "make", took: "take", taken: "take", came: "come",
  gave: "give", given: "give", got: "get", gotten: "get", saw: "see", seen: "see",
  knew: "know", known: "know", thought: "think", brought: "bring", bought: "buy",
  found: "find", left: "leave", lost: "lose", kept: "keep", held: "hold", told: "tell",
  said: "say", felt: "feel", grew: "grow", grown: "grow", rose: "rise", risen: "rise",
  fell: "fall", fallen: "fall", began: "begin", begun: "begin", won: "win", built: "build",
  sent: "send", spent: "spend", taught: "teach", caught: "catch", fought: "fight",
  sought: "seek", led: "lead", met: "meet", paid: "pay", sold: "sell", stood: "stand",
  understood: "understand", wrote: "write", written: "write", spoke: "speak", spoken: "speak",
  chose: "choose", chosen: "choose", broke: "break", broken: "break", drove: "drive",
  driven: "drive", ate: "eat", eaten: "eat", ran: "run", forgot: "forget", forgotten: "forget",
  hid: "hide", hidden: "hide", shook: "shake", shaken: "shake", froze: "freeze", frozen: "freeze",
  better: "good", best: "good", worse: "bad", worst: "bad", less: "little", least: "little",
  more: "many", most: "many", fewer: "few", children: "child", men: "man", women: "woman",
  people: "person", feet: "foot", teeth: "tooth", mice: "mouse",
};

/**
 * 낱말 하나의 단어장 레벨(0=초등 Level 1 … 9=수능필수). 단어장에 없으면 null.
 * 불규칙 활용형은 원형으로, un-·in-·dis- 따위를 붙인 반대말은 바탕 낱말로 잰다.
 * -ness·-less·-ful·-ment로 만든 낱말은 바탕 낱말보다 한 단계 높게 친다.
 */
export function engcoreWordLevel(raw: string): number | null {
  const w = raw.toLowerCase().replace(/’/g, "'").replace(/n't$/, "").replace(/[^a-z'-]/g, "");
  if (!w) return null;
  if (w === "ca" || w === "wo") return 0; // can't, won't
  const direct = lookup(w);
  if (direct !== null) return direct;
  if (IRREGULAR[w]) return lookup(IRREGULAR[w]!);
  // easier·dirtier·happiest: 표에는 -y 꼴만 있다.
  const ier = w.match(/^(.{3,})i(er|est)$/);
  if (ier) {
    const lv = lookup(`${ier[1]}y`);
    if (lv !== null) return lv;
  }
  const neg = w.match(/^(un|in|im|il|ir|dis|non-?)(.{4,})$/);
  if (neg) {
    const lv = engcoreWordLevel(neg[2]!);
    if (lv !== null) return lv;
  }
  const derived = w.match(/^(.{3,}?)(ness|less|ful|ment)$/);
  if (derived) {
    const lv = engcoreWordLevel(derived[1]!.replace(/i$/, "y"));
    if (lv !== null) return Math.min(9, lv + 1);
  }
  return null;
}

/** 원형 낱말의 품사 묶음(1=동사, 2=형용사, 4=명사·그 밖). 단어장에 없으면 null. */
export function engcoreWordPos(base: string): number | null {
  const w = base.toLowerCase().replace(/[^a-z'-]/g, "");
  return POS[w] ?? null;
}

export type VocabLevelResult = {
  /** 잰 낱말 수(기능어를 뺀 내용어, 같은 낱말은 한 번만) */
  wordCount: number;
  /** 단어장 어디에도 없는 낱말의 비율(0~1) */
  beyondRatio: number;
  /** 90%가 덮이는 가장 낮은 레벨 번호. 못 정하면 null */
  levelIndex: number | null;
  /** 그 레벨의 짧은 이름 (예: 중학필수) */
  label: string | null;
  /** 레벨마다 몇 낱말인지 */
  byLevel: number[];
};

/**
 * 지문 하나의 어휘 수준.
 * 같은 낱말이 여러 번 나와도 한 번만 센다(the가 스무 번 나온다고 쉬운 글은 아니다).
 */
export function measureVocabLevel(text: string): VocabLevelResult {
  const raw = (String(text ?? "").match(/[A-Za-z][A-Za-z'-]*/g) ?? []).map((w) => w.toLowerCase());
  // 기능어(the, is, of…)는 뺀다. 어느 단어장에도 없지만 몰라서 못 읽는 낱말이 아니다.
  const uniq = [...new Set(raw)].filter((w) => !isFunctionWord(w));
  const byLevel = new Array(LEVELS.length).fill(0) as number[];
  let beyond = 0;
  for (const w of uniq) {
    const lv = lookup(w);
    if (lv === null) beyond++;
    else byLevel[lv]! += 1;
  }
  const total = uniq.length;
  if (total === 0) {
    return { wordCount: 0, beyondRatio: 0, levelIndex: null, label: null, byLevel };
  }

  /*
   * 레벨은 "단어장에 있는 낱말" 안에서 정한다.
   * 단어장 밖 낱말(고유명사·전문어·우리 책에 아직 없는 말)이 얼마나 되는지는 따로 알린다.
   * 이 둘을 섞으면, 단어장 밖이 10%만 넘어도 레벨을 아예 못 정하게 된다.
   */
  const known = total - beyond;
  let acc = 0;
  let levelIndex: number | null = null;
  if (known > 0) {
    for (let i = 0; i < byLevel.length; i++) {
      acc += byLevel[i]!;
      if (acc / known >= 0.9) {
        levelIndex = i;
        break;
      }
    }
  }

  return {
    wordCount: total,
    beyondRatio: Math.round((beyond / total) * 1000) / 1000,
    levelIndex,
    label: levelIndex === null ? null : LEVEL_LABELS[levelIndex]!,
    byLevel,
  };
}

/** "중학필수까지로 90%, 단어장 밖 3%" 같은 한 줄 */
export function vocabLevelLine(r: VocabLevelResult): string | null {
  if (r.wordCount === 0 || !r.label) return null;
  const beyond = Math.round(r.beyondRatio * 100);
  const tail = beyond > 0 ? ` 단어장에 없는 낱말은 ${beyond}%입니다.` : "";
  return `우리 단어장 ${r.label}까지로 내용어의 90%가 덮입니다.${tail}`;
}
