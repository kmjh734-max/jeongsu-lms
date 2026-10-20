import type {
  GrammarChoiceRenderSegment,
  WorkbookGrammarChoiceItem,
  WorkbookGrammarChoiceSection,
  WorkbookVocabChoiceItem,
  WorkbookVocabChoiceSection,
} from "@/lib/lesson-materials/workbook-types";

/**
 * 어법 선택·어휘 선택 문항을 선생님이 직접 고친다(지우기·더하기·틀린 말 바꾸기).
 *
 * 선생님 요청(2026-10-20): 어법·어휘 워크북에서 문항을 고르면 지워지고, 지문의 자리를
 * 고르면 그 자리에 알맞은 문항을 만들어 달라. 틀린 말은 제안하고 선생님이 고쳐 쓰게.
 * 모델을 부르지 않는다. 제안은 규칙(어법)과 저장된 짝·단어장 반의어(어휘)로 만든다.
 */

export type ChoiceSection = WorkbookGrammarChoiceSection | WorkbookVocabChoiceSection;
type AnyItem = WorkbookGrammarChoiceItem | WorkbookVocabChoiceItem;

const WORD_CHAR = /[A-Za-z0-9'’-]/;

/** 글자 위치가 든 낱말의 [시작, 끝). 낱말이 아니면 null. */
export function wordSpanAt(passage: string, index: number): { start: number; end: number } | null {
  if (index < 0 || index >= passage.length || !WORD_CHAR.test(passage[index]!)) return null;
  let start = index;
  let end = index + 1;
  while (start > 0 && WORD_CHAR.test(passage[start - 1]!)) start--;
  while (end < passage.length && WORD_CHAR.test(passage[end]!)) end++;
  // 낱말 끝의 따옴표·하이픈은 떼어 낸다.
  while (end > start && /['’-]/.test(passage[end - 1]!)) end--;
  while (start < end && /['’-]/.test(passage[start]!)) start++;
  return end > start ? { start, end } : null;
}

/**
 * 번호를 지문 차례대로 다시 매기고 지문 조각을 원문에서 다시 만든다.
 * 만들 때와 같은 방식(grammar-choice-display.ts buildPassageSegmentsFromSource)이다. 그 파일은
 * 서버 모듈(node:crypto)을 불러 브라우저에서 쓸 수 없어 여기 따로 둔다.
 */
function rebuild<S extends ChoiceSection>(section: S, items: AnyItem[]): S {
  const passage = section.sourcePassage;
  const ordered = [...items]
    .sort((a, b) => a.startCharIndex - b.startCharIndex)
    .map((it, i) => ({ ...it, number: i + 1 }));
  const segments: GrammarChoiceRenderSegment[] = [];
  let cursor = 0;
  for (const it of ordered) {
    if (
      it.startCharIndex < cursor ||
      it.endCharIndex > passage.length ||
      it.startCharIndex >= it.endCharIndex ||
      passage.slice(it.startCharIndex, it.endCharIndex) !== it.correctText
    ) {
      throw new Error("지문과 문항 자리가 맞지 않아 고칠 수 없습니다.");
    }
    if (cursor < it.startCharIndex) segments.push({ type: "text", text: passage.slice(cursor, it.startCharIndex) });
    segments.push({ type: "choice", number: it.number, leftText: it.leftText, rightText: it.rightText });
    cursor = it.endCharIndex;
  }
  if (cursor < passage.length) segments.push({ type: "text", text: passage.slice(cursor) });
  return { ...section, items: ordered, segments } as S;
}

export function removeChoiceItem<S extends ChoiceSection>(section: S, choiceId: string): S {
  return rebuild(
    section,
    (section.items as AnyItem[]).filter((it) => it.choiceId !== choiceId)
  );
}

function sides(correct: string, incorrect: string, side: "left" | "right") {
  return side === "left"
    ? { leftText: correct, rightText: incorrect }
    : { leftText: incorrect, rightText: correct };
}

export function updateChoiceIncorrect<S extends ChoiceSection>(
  section: S,
  choiceId: string,
  incorrectText: string
): S {
  const wrong = incorrectText.trim();
  if (!wrong) throw new Error("틀린 말을 적어 주세요.");
  const items = (section.items as AnyItem[]).map((it) =>
    it.choiceId === choiceId
      ? { ...it, incorrectText: wrong, ...sides(it.correctText, wrong, it.correctSide) }
      : it
  );
  return rebuild(section, items);
}

/** 이 자리가 이미 있는 문항과 겹치는지 */
export function overlapsChoice(section: ChoiceSection, start: number, end: number): boolean {
  return (section.items as AnyItem[]).some((it) => start < it.endCharIndex && it.startCharIndex < end);
}

export function addChoiceItem<S extends ChoiceSection>(
  section: S,
  input: { start: number; end: number; incorrectText: string; kind: "grammar" | "vocab" }
): S {
  const correct = section.sourcePassage.slice(input.start, input.end);
  const wrong = input.incorrectText.trim();
  if (!correct.trim()) throw new Error("지문에서 자리를 골라 주세요.");
  if (!wrong) throw new Error("틀린 말을 적어 주세요.");
  if (wrong.toLowerCase() === correct.toLowerCase()) throw new Error("원래 말과 다른 말을 적어 주세요.");
  if (overlapsChoice(section, input.start, input.end)) throw new Error("이미 문항이 있는 자리입니다.");
  // 맞는 말이 늘 한쪽에 있지 않게 자리로 정한다.
  const correctSide: "left" | "right" = input.start % 2 === 0 ? "left" : "right";
  const choiceId = `manual:${input.start}`;
  const common = {
    number: 0,
    choiceId,
    sentenceId: "",
    startCharIndex: input.start,
    endCharIndex: input.end,
    correctText: correct,
    incorrectText: wrong,
    correctSide,
    ...sides(correct, wrong, correctSide),
  };
  const item: AnyItem =
    input.kind === "grammar"
      ? ({
          ...common,
          startTokenIndex: -1,
          endTokenIndex: -1,
          originalText: correct,
          grammarCategoryId: "manual",
          grammarCategoryName: "직접 추가",
          bookTerm: "",
          // 정답지 괄호 안 어법 이름은 직접 만든 문항에는 없다.
          labelHidden: true,
          explanationKo: "",
          incorrectReasonKo: "",
          difficulty: 3,
          learningValue: 3,
        } satisfies WorkbookGrammarChoiceItem)
      : ({
          ...common,
          meaningKo: "",
          relation: "manual",
          learningValue: 3,
          grammarCategoryId: `vocab:manual:${correct.toLowerCase()}`,
        } satisfies WorkbookVocabChoiceItem);
  return rebuild(section, [...(section.items as AnyItem[]), item]);
}

// ---------------------------------------------------------------- 어법 제안

/** 짝으로 자주 묻는 어법 낱말. 왼쪽을 고르면 오른쪽들을 제안한다. */
const GRAMMAR_PAIRS: Array<[string, string[]]> = [
  ["which", ["what", "where", "who"]],
  ["what", ["which", "that"]],
  ["that", ["what", "which"]],
  ["who", ["which", "whom"]],
  ["whom", ["who", "which"]],
  ["whose", ["who", "which"]],
  ["where", ["which", "when"]],
  ["when", ["which", "where"]],
  ["how", ["what"]],
  ["whether", ["that", "what"]],
  ["if", ["whether", "that"]],
  ["is", ["are"]],
  ["are", ["is"]],
  ["was", ["were"]],
  ["were", ["was"]],
  ["has", ["have"]],
  ["have", ["has"]],
  ["does", ["do"]],
  ["do", ["does"]],
  ["it", ["them", "they"]],
  ["its", ["their"]],
  ["their", ["its"]],
  ["them", ["it", "themselves"]],
  ["themselves", ["them"]],
  ["himself", ["him"]],
  ["herself", ["her"]],
  ["itself", ["it"]],
  ["him", ["himself"]],
  ["her", ["herself"]],
  ["many", ["much"]],
  ["much", ["many"]],
  ["few", ["little"]],
  ["little", ["few"]],
  ["fewer", ["less"]],
  ["less", ["fewer"]],
  ["so", ["such"]],
  ["such", ["so"]],
  ["although", ["despite"]],
  ["though", ["despite"]],
  ["despite", ["although"]],
  ["because", ["because of"]],
  ["while", ["during"]],
  ["during", ["while"]],
  ["like", ["alike"]],
  ["alike", ["like"]],
  ["other", ["another", "others"]],
  ["another", ["other"]],
  ["others", ["other"]],
  ["each", ["every"]],
  ["almost", ["most"]],
  ["most", ["almost"]],
  ["to", ["-ing"]],
];

function keepCase(text: string, like: string): string {
  return /^[A-Z]/.test(like) ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

const VOWEL = /[aeiou]/;
function dropE(stem: string) {
  return stem.endsWith("e") && !stem.endsWith("ee") ? stem.slice(0, -1) : stem;
}
/**
 * 동사 원형 어림(-ing·-ed·-s를 벗긴다). 끝 e가 빠졌을 수 있어(placed → plac) 단어장으로
 * 확인할 때는 baseCandidates로 e를 붙인 꼴도 함께 본다.
 */
function verbBase(w: string): string {
  if (w.endsWith("ied")) return w.slice(0, -3) + "y";
  if (/([bcdfghjklmnpqrstvwxz])\1(ing|ed)$/.test(w)) return w.replace(/([a-z])\1(ing|ed)$/, "$1");
  if (w.endsWith("ing")) return w.slice(0, -3);
  if (w.endsWith("ed")) return w.slice(0, -2);
  if (w.endsWith("ies")) return w.slice(0, -3) + "y";
  if (/(ches|shes|sses|xes)$/.test(w)) return w.slice(0, -2);
  if (w.endsWith("s") && !w.endsWith("ss")) return w.slice(0, -1);
  return w;
}
function baseCandidates(w: string): string[] {
  const b = verbBase(w);
  return [...new Set([IRREGULAR_BASE[w] ?? "", b, `${b}e`].filter(Boolean))];
}
function ing(base: string) {
  if (base.endsWith("ie")) return base.slice(0, -2) + "ying";
  return dropE(base) + "ing";
}
/** 불규칙 과거분사 → 원형(made → make). PAST_PARTICIPLE을 뒤집어 만든다. */
let IRREGULAR_BASE: Record<string, string> = {};
/** 불규칙 과거분사(분사 자리에서 -ing와 맞서는 꼴) */
const PAST_PARTICIPLE: Record<string, string> = {
  rise: "risen", grow: "grown", know: "known", show: "shown", give: "given", take: "taken",
  make: "made", write: "written", speak: "spoken", break: "broken", choose: "chosen",
  drive: "driven", eat: "eaten", fall: "fallen", forget: "forgotten", hide: "hidden",
  see: "seen", begin: "begun", run: "run", come: "come", go: "gone", do: "done",
  find: "found", build: "built", bring: "brought", buy: "bought", think: "thought",
  teach: "taught", catch: "caught", keep: "kept", leave: "left", lose: "lost", hold: "held",
  tell: "told", feel: "felt", lead: "led", meet: "met", pay: "paid", sell: "sold",
  send: "sent", spend: "spent", stand: "stood", understand: "understood", win: "won",
  get: "gotten", sit: "sat", set: "set", put: "put", cut: "cut", hit: "hit", let: "let",
  shake: "shaken", freeze: "frozen", wear: "worn", tear: "torn", draw: "drawn", fly: "flown",
  throw: "thrown", blow: "blown", sing: "sung", drink: "drunk", swim: "swum", ring: "rung",
  hang: "hung", dig: "dug", feed: "fed", fight: "fought", seek: "sought", bind: "bound",
};
IRREGULAR_BASE = Object.fromEntries(
  Object.entries(PAST_PARTICIPLE).filter(([b, pp]) => b !== pp).map(([b, pp]) => [pp, b])
);
function ed(base: string) {
  if (PAST_PARTICIPLE[base]) return PAST_PARTICIPLE[base]!;
  if (base.endsWith("e")) return base + "d";
  if (/[^aeiou]y$/.test(base)) return base.slice(0, -1) + "ied";
  return base + "ed";
}
function third(base: string) {
  if (/(s|sh|ch|x|z|o)$/.test(base)) return base + "es";
  if (/[^aeiou]y$/.test(base)) return base.slice(0, -1) + "ies";
  return base + "s";
}

const POS_VERB = 1;
const POS_ADJ = 2;

/**
 * 고른 자리에 넣을 틀린 형태 몇 개(규칙으로 어림한다). 선생님이 고르거나 고쳐 쓴다.
 * 맞는 형태와 같은 말은 내지 않는다. posOf(원형 → 품사 묶음)가 있으면 동사에만 활용형을,
 * 형용사에만 -ly를 붙인다(없는 낱말 importanting을 내지 않게). 없으면 활용형이 보이는 낱말만 다룬다.
 */
export function suggestGrammarWrong(text: string, posOf?: (base: string) => number | null): string[] {
  const raw = text.trim();
  const w = raw.toLowerCase();
  const out: string[] = [];
  const push = (s: string) => {
    const v = keepCase(s, raw);
    if (v.toLowerCase() !== w && !out.includes(v)) out.push(v);
  };
  if (!w) return out;
  const pair = GRAMMAR_PAIRS.find(([k]) => k === w);
  if (pair) pair[1].filter((s) => s !== "-ing").forEach(push);
  if (w.includes(" ")) {
    // to V ↔ V-ing
    const m = w.match(/^to (\w+)$/);
    if (m) push(ing(m[1]!));
    return out;
  }
  // 활용형은 단어장 품사로 원형을 확인할 수 있을 때만 만든다(placed → plac 같은 헛짚기를 막는다).
  if (!posOf || !VOWEL.test(w) || w.length < 3) return out.slice(0, 4);
  /**
   * 단어장에 있는 원형. 규칙 어림(verbBase)·끝 e를 붙인 꼴·불규칙 원형 가운데 고른다.
   * -ing·-ed 꼴이 이미 동사임을 보여 주므로 품사는 따지지 않는다(place는 단어장에 「장소」뿐이다).
   */
  const knownBase = () => baseCandidates(w).find((b) => posOf(b) != null) ?? null;
  // 형용사 ↔ 부사
  if (w.endsWith("ly") && w.length > 4) {
    const adj = w.endsWith("ily") ? w.slice(0, -3) + "y" : w.endsWith("ally") ? w.slice(0, -4) : w.slice(0, -2);
    if ((posOf(adj) ?? 0) & POS_ADJ) push(adj);
    return out.slice(0, 4);
  }
  // 분사·동명사·시제
  if (w.endsWith("ing")) {
    const base = knownBase();
    if (base) {
      push(ed(base));
      push(`to ${base}`);
      push(base);
    }
  } else if (w.endsWith("ed") || IRREGULAR_BASE[w]) {
    const base = knownBase();
    if (base) {
      push(ing(base));
      push(base);
    }
  } else if (!pair) {
    const base = baseCandidates(w).find((b) => b !== w && (posOf(b) ?? 0) & POS_VERB) ?? w;
    const basePos = posOf(base) ?? 0;
    const selfPos = posOf(w) ?? 0;
    if (base !== w && basePos & POS_VERB) {
      // -s를 단 동사 ↔ 원형
      push(base);
      push(ing(base));
    } else if (selfPos & POS_VERB) {
      push(third(w));
      push(ing(w));
      push(ed(w));
    }
    if (selfPos & POS_ADJ) push(/[^aeiou]y$/.test(w) ? w.slice(0, -1) + "ily" : /le$/.test(w) ? w.slice(0, -1) + "y" : /ic$/.test(w) ? w + "ally" : w + "ly");
  }
  return out.slice(0, 4);
}

// ---------------------------------------------------------------- 어휘 제안

/** 어휘 문항에 자주 쓰는 쉬운 반대말. 저장된 짝·단어장 반의어가 없을 때 쓴다. */
const OPPOSITES: Array<[string, string]> = [
  ["increase", "decrease"], ["rise", "fall"], ["accept", "reject"], ["allow", "prevent"],
  ["include", "exclude"], ["strengthen", "weaken"], ["succeed", "fail"], ["win", "lose"],
  ["remember", "forget"], ["agree", "disagree"], ["appear", "disappear"], ["begin", "end"],
  ["open", "close"], ["push", "pull"], ["give", "take"], ["buy", "sell"], ["love", "hate"],
  ["help", "harm"], ["protect", "destroy"], ["create", "destroy"], ["gain", "lose"],
  ["easy", "difficult"], ["simple", "complex"], ["safe", "dangerous"], ["common", "rare"],
  ["possible", "impossible"], ["positive", "negative"], ["active", "passive"],
  ["strong", "weak"], ["high", "low"], ["large", "small"], ["big", "small"], ["long", "short"],
  ["wide", "narrow"], ["deep", "shallow"], ["fast", "slow"], ["early", "late"], ["old", "new"],
  ["rich", "poor"], ["happy", "sad"], ["good", "bad"], ["right", "wrong"], ["true", "false"],
  ["important", "unimportant"], ["necessary", "unnecessary"], ["useful", "useless"],
  ["similar", "different"], ["same", "different"], ["public", "private"], ["natural", "artificial"],
  ["success", "failure"], ["advantage", "disadvantage"], ["benefit", "harm"], ["strength", "weakness"],
  ["more", "less"], ["most", "least"], ["always", "never"], ["often", "rarely"],
  ["before", "after"], ["inside", "outside"], ["above", "below"], ["full", "empty"],
  ["hot", "cold"], ["warm", "cool"], ["light", "heavy"], ["hard", "soft"], ["clear", "unclear"],
  ["certain", "uncertain"], ["familiar", "unfamiliar"], ["visible", "invisible"],
  ["present", "absent"], ["cooperate", "compete"], ["expand", "shrink"], ["encourage", "discourage"],
  ["reduce", "increase"], ["improve", "worsen"], ["ignore", "notice"], ["hide", "reveal"],
];

function inflectLike(base: string, like: string): string {
  const w = like.toLowerCase();
  if (w.endsWith("ing")) return ing(base);
  if (w.endsWith("ed") || w.endsWith("ied")) return ed(base);
  if (w.endsWith("er") && !base.endsWith("er")) return base + (base.endsWith("e") ? "r" : "er");
  if (w.endsWith("s") && !w.endsWith("ss") && !base.endsWith("s")) return third(base);
  return base;
}

/** 내장 반대말 표에서 찾는다(활용형이면 같은 꼴로 바꿔 준다). */
export function suggestVocabOpposite(text: string): string[] {
  const raw = text.trim();
  const w = raw.toLowerCase();
  const bases = baseCandidates(w);
  const out: string[] = [];
  for (const [a, b] of OPPOSITES) {
    for (const [x, y] of [[a, b], [b, a]] as const) {
      if (x === w) out.push(keepCase(y, raw));
      else if (bases.includes(x)) out.push(keepCase(inflectLike(y, w), raw));
    }
  }
  return [...new Set(out)].slice(0, 4);
}
