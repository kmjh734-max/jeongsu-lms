/**
 * Grammar-choice min-span / render tests (no OpenAI).
 * Run: npx tsx scripts/test-workbook-grammar-choice.ts
 */
import assert from "node:assert/strict";
import { tokenizeForWordOrder } from "../src/lib/lesson-materials/word-order-tokenize";
import {
  validateAndFilterCandidates,
} from "../src/lib/lesson-materials/grammar-choice-validate";
import { selectFinalGrammarChoices } from "../src/lib/lesson-materials/grammar-choice-select";
import {
  assignDisplaySides,
  buildGrammarChoiceItems,
  buildPassageSegmentsFromSource,
} from "../src/lib/lesson-materials/grammar-choice-display";
import { minimizeChoicePair } from "../src/lib/lesson-materials/grammar-choice-minimize";
import { buildHeuristicGrammarCandidates } from "../src/lib/lesson-materials/grammar-choice-fallback";
import {
  WORKBOOK_TYPE_CATALOG,
  formatWorkbookPassage,
  joinWorkbookPassageLines,
  type GrammarChoiceCandidate,
} from "../src/lib/lesson-materials/workbook-types";
import { GRAMMAR_CHOICE_PROMPT_VERSION } from "../src/lib/lesson-materials/grammar-choice-constants";

assert.equal(
  GRAMMAR_CHOICE_PROMPT_VERSION,
  "grammar-choice-v3-min-span"
);
assert.ok(!WORKBOOK_TYPE_CATALOG.some((t) => t.id === "vocab_example"));
assert.ok(
  WORKBOOK_TYPE_CATALOG.find((t) => t.id === "grammar_choice")?.ready === true
);

{
  const m = minimizeChoicePair(
    "the very thing that will help them learn",
    "the very thing what will help them learn"
  );
  assert.ok(m);
  assert.equal(m!.correctText, "that");
  assert.equal(m!.incorrectText, "what");
  console.log("minimize: that/what ok");
}

{
  const m = minimizeChoicePair(
    "are being held captive",
    "are holding captive"
  );
  assert.ok(m);
  assert.equal(m!.correctText, "are being held");
  assert.equal(m!.incorrectText, "are holding");
  console.log("minimize: are being held / are holding ok");
}

{
  const m = minimizeChoicePair(
    "the wonder for which we were created.",
    "the wonder for that we were created."
  );
  assert.ok(m);
  assert.equal(m!.correctText, "which");
  assert.equal(m!.incorrectText, "that");
  console.log("minimize: which/that ok");
}

const loaSentences = [
  {
    id: "1",
    english:
      "Perhaps you have heard of the Law of Attraction, which states that ‘like attracts like’ and that by focusing on positive or negative thoughts, one can bring about positive or negative results.",
  },
  {
    id: "2",
    english:
      "The common flaw in our understanding of this law is that we believe all we have to do is think about or visualize something to manifest it.",
  },
  {
    id: "3",
    english:
      "Consider what limiting beliefs you have that contradict your desires and upgrade them to beliefs that are in line with what you want to attract.",
  },
].map((s) => ({ id: s.id, english: formatWorkbookPassage(s.english) }));

const moveSentences = [
  {
    id: "a",
    english:
      "We are wonderfully made, yet we don’t allow ourselves to participate in the wonder for which we were created.",
  },
  {
    id: "b",
    english:
      "Instead of moving anywhere, many kids today are being held captive by smart devices like phones and tablets.",
  },
  {
    id: "c",
    english:
      "They are not learning how to socialize, and they miss the very thing that will help them learn from others.",
  },
  {
    id: "d",
    english:
      "Bodies were never meant to have so much square footage, and humans are meant to live extraordinary lives.",
  },
].map((s) => ({ id: s.id, english: formatWorkbookPassage(s.english) }));

for (const [name, sentences] of [
  ["loa", loaSentences],
  ["move", moveSentences],
] as const) {
  const heur = buildHeuristicGrammarCandidates({
    passageId: name,
    sentences,
  });
  const map = new Map(sentences.map((s) => [s.id, s.english]));
  const { accepted } = validateAndFilterCandidates(heur, map);
  const selected = selectFinalGrammarChoices(accepted, 10);
  const source = joinWorkbookPassageLines(sentences.map((s) => s.english));
  const items = buildGrammarChoiceItems(
    selected,
    `seed-${name}`,
    source,
    sentences.map((s) => s.id)
  );
  assert.ok(items, `${name}: char index failed`);
  const segments = buildPassageSegmentsFromSource(source, items!);
  assert.ok(segments, `${name}: segments failed`);

  // Restore with correct answers
  let rebuilt = "";
  for (const seg of segments!) {
    if (seg.type === "text") rebuilt += seg.text;
    else {
      const it = items!.find((x) => x.number === seg.number)!;
      rebuilt += it.correctText;
    }
  }
  assert.equal(rebuilt, source);

  // No overlong choice
  for (const it of items!) {
    assert.ok(tokenizeForWordOrder(it.correctText).length <= 7);
    assert.ok(it.correctText.length <= 60);
    assert.ok(!/[.!?]$/.test(it.correctText));
  }

  // Spacing should not be word-soup from tokenize join artifacts:
  // source must contain "Perhaps you" consecutively if present
  if (name === "loa") {
    assert.ok(source.includes("Perhaps you have heard"));
    assert.ok(selected.length >= 5, `loa selected=${selected.length}`);
  }
  if (name === "move") {
    assert.ok(selected.length >= 5, `move selected=${selected.length}`);
  }

  console.log(name, {
    selected: selected.length,
    texts: items!.map((i) => `${i.number}:${i.correctText}/${i.incorrectText}`),
  });
}

{
  const cands: GrammarChoiceCandidate[] = [
    {
      choiceId: "a",
      passageId: "p",
      sentenceId: "1",
      startTokenIndex: 0,
      endTokenIndex: 0,
      originalText: "which",
      correctText: "which",
      incorrectText: "that",
      grammarCategoryId: "g1",
      grammarCategoryName: "관계대명사",
      bookTerm: "전치사+관계대명사",
      explanationKo: "x",
      incorrectReasonKo: "y",
      difficulty: 3,
      learningValue: 4,
      ambiguityRisk: "low",
    },
    {
      choiceId: "b",
      passageId: "p",
      sentenceId: "1",
      startTokenIndex: 1,
      endTokenIndex: 1,
      originalText: "focusing",
      correctText: "focusing",
      incorrectText: "focused",
      grammarCategoryId: "g2",
      grammarCategoryName: "동명사",
      bookTerm: "전치사 뒤 동명사",
      explanationKo: "x",
      incorrectReasonKo: "y",
      difficulty: 3,
      learningValue: 4,
      ambiguityRisk: "low",
    },
  ];
  const sides = assignDisplaySides(cands, "seed");
  assert.deepEqual(sides, assignDisplaySides(cands, "seed"));
}

console.log("\nALL grammar-choice v3 min-span tests passed");
