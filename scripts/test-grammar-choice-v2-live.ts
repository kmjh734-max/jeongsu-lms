/**
 * Grammar Choice V2 live fixture run.
 * Run: npx tsx --env-file=.env.local scripts/test-grammar-choice-v2-live.ts
 */
import assert from "node:assert/strict";
import { writeFileSync } from "node:fs";
import { generateWorkbookGrammarChoiceV2 } from "../src/lib/lesson-materials/grammar-choice-v2/generate";
import { formatWorkbookPassage } from "../src/lib/lesson-materials/workbook-types";

const loa = [
  "Perhaps you have heard of the Law of Attraction, which states that ‘like attracts like’ and that by focusing on positive or negative thoughts, one can bring about positive or negative results.",
  "The common flaw in our understanding of this law is that we believe all we have to do is think about or visualize something to manifest it.",
  "It is true that attracting a great career, relationship or lifestyle may be your desire, but first consider what limiting beliefs you have that contradict your desires and upgrade them to beliefs that are in line with what you want to attract.",
].map((english, i) => ({ id: `loa-${i + 1}`, english: formatWorkbookPassage(english) }));

const movement = [
  "We are wonderfully made, yet we don’t allow ourselves to participate in the wonder for which we were created.",
  "Instead of moving anywhere, many kids today are being held captive by smart devices like phones and tablets.",
  "They are not learning how to socialize, and they miss the very thing that will help them learn, communicate, create, and become emotionally mature.",
  "Bodies were never meant to have so much square footage. We were made to move, and humans are meant to live extraordinary lives.",
].map((english, i) => ({ id: `mov-${i + 1}`, english: formatWorkbookPassage(english) }));

const uncertainty = [
  "When people feel frightened and become silent, they rarely talk about facing uncertainty.",
  "They hold ideas about how things should be, and they hope those ideas will be and turn out true.",
  "Between fear and curiosity there is a narrow path.",
  "What matters is not the size of the risk but the habit of asking better questions.",
].map((english, i) => ({ id: `unc-${i + 1}`, english: formatWorkbookPassage(english) }));

const darwin = [
  "Because of limited resources, a species can be wiped out when the environment changes suddenly.",
  "Darwin argued that variation, not a single fixed type, is what allows life to continue.",
  "The members who are well suited to a new condition survive, while those whom the environment rejects disappear.",
  "Both genetic differences and learned habits matter.",
  "One of Darwin’s greatest insights was that variation is the raw material of change.",
  "If we all had the same kind of mind —if there were only one human nature— then when disaster struck, we might become extinct.",
].map((english, i) => ({ id: `dar-${i + 1}`, english: formatWorkbookPassage(english) }));

const passages = [
  { projectId: "loa", title: "Law of Attraction", source: null, sentences: loa },
  { projectId: "mov", title: "Movement", source: null, sentences: movement },
  { projectId: "unc", title: "Uncertainty", source: null, sentences: uncertainty },
  { projectId: "dar", title: "Variation and Darwin", source: null, sentences: darwin },
];

async function main() {
const firstStarted = Date.now();
const first = await generateWorkbookGrammarChoiceV2({
  forceRegenerate: true,
  passages,
});
const firstMs = Date.now() - firstStarted;

const secondStarted = Date.now();
const second = await generateWorkbookGrammarChoiceV2({
  forceRegenerate: false,
  passages: passages.map((p) => ({
    ...p,
    grammarChoiceV2Cache:
      first.cachesToSave.find((c) => c.projectId === p.projectId)?.cache ?? null,
  })),
});
const secondMs = Date.now() - secondStarted;

writeFileSync("scripts/_gc-v2-live.json", JSON.stringify({
  firstMs,
  secondMs,
  firstOpenAI: first.timing.openAiRequestCount,
  secondOpenAI: second.timing.openAiRequestCount,
  ontology: first.ontology,
  promptChars: first.promptChars,
  skipped: first.skipped,
  sections: first.sections.map((s) => ({
    title: s.title,
    count: s.items.length,
    restored: s.diagnostics?.passageRestored,
    model: s.diagnostics?.generatorActualResponseModel,
    items: s.items.map((it) => ({
      n: it.number,
      pair: `${it.leftText} / ${it.rightText}`,
      correct: it.correctText,
      grammar: it.bookTerm,
      explanation: it.explanationKo,
      wrong: it.incorrectReasonKo,
    })),
  })),
  reports: first.reports,
}, null, 2), "utf8");

assert.equal(second.timing.openAiRequestCount, 0, "cache rerun must be 0 OpenAI");
assert.ok(first.timing.openAiRequestCount >= 4, "first run should analyze each passage");
assert.ok(first.timing.openAiRequestCount <= 5, "no top-up; at most one auditor");

const report = {
  firstMs,
  secondMs,
  firstOpenAI: first.timing.openAiRequestCount,
  secondOpenAI: second.timing.openAiRequestCount,
  ontology: first.ontology,
  promptChars: first.promptChars,
  skipped: first.skipped,
  sections: first.sections.map((s) => ({
    title: s.title,
    count: s.items.length,
    restored: s.diagnostics?.passageRestored,
    model: s.diagnostics?.generatorActualResponseModel,
    items: s.items.map((it) => ({
      n: it.number,
      pair: `${it.leftText} / ${it.rightText}`,
      correct: it.correctText,
      grammar: it.bookTerm,
      explanation: it.explanationKo,
      wrong: it.incorrectReasonKo,
    })),
  })),
  reports: first.reports,
};
console.log(JSON.stringify({
  firstMs,
  secondMs,
  firstOpenAI: first.timing.openAiRequestCount,
  secondOpenAI: second.timing.openAiRequestCount,
  skipped: first.skipped,
  counts: first.sections.map((s) => [s.title, s.items.length]),
}, null, 2));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
