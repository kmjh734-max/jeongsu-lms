import { buildHeuristicGrammarCandidates } from "../src/lib/lesson-materials/grammar-choice-fallback";
import { validateAndFilterCandidates } from "../src/lib/lesson-materials/grammar-choice-validate";
import { selectFinalGrammarChoices } from "../src/lib/lesson-materials/grammar-choice-select";
import { formatWorkbookPassage } from "../src/lib/lesson-materials/workbook-types";

const loa = [
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
];
const move = [
  {
    id: "a",
    english:
      "We are wonderfully made, yet we don’t allow ourselves to participate in the wonder for which we were created.",
  },
  {
    id: "b",
    english:
      "Instead of moving, many kids today are being held captive by smart devices like phones and tablets.",
  },
  {
    id: "c",
    english:
      "They are not going outside to play, they are not learning how to socialize and read physical cues from others.",
  },
  {
    id: "d",
    english:
      "Bodies were never meant to have so much square footage, and humans are meant to live in motion.",
  },
];

for (const [name, sentences] of [
  ["loa", loa],
  ["move", move],
] as const) {
  const rows = sentences.map((s) => ({
    id: s.id,
    english: formatWorkbookPassage(s.english),
  }));
  const heur = buildHeuristicGrammarCandidates({
    passageId: name,
    sentences: rows,
  });
  const map = new Map(rows.map((s) => [s.id, s.english]));
  const { accepted, rejected } = validateAndFilterCandidates(heur, map);
  const selected = selectFinalGrammarChoices(accepted, 10);
  console.log(
    name,
    JSON.stringify(
      {
        heur: heur.length,
        accepted: accepted.length,
        selected: selected.length,
        rejected: rejected.map((r) => r.reason),
        texts: selected.map((c) => c.correctText),
      },
      null,
      2
    )
  );
}
