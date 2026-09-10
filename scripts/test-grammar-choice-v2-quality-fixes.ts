/**
 * Live-quality fixtures: both-grammatical what/that, ambiguous subject, code/explanation, safe shrink.
 * No OpenAI.
 * Run: npx tsx scripts/test-grammar-choice-v2-quality-fixes.ts
 */
import assert from "node:assert/strict";
import {
  ambiguousSubjectBoundary,
  bothWhatThatGrammatical,
  explanationFitsPair,
  repairChoice,
} from "../src/lib/lesson-materials/grammar-choice-v2/choice-repair";
import { canShrinkToSafePair } from "../src/lib/lesson-materials/grammar-choice-v2/coverage";
import { explanationContractMismatch } from "../src/lib/lesson-materials/grammar-choice-v2/assessment-contract";
import { explainChoice } from "../src/lib/lesson-materials/grammar-choice-v2/explanation-templates";
import { ontologyPoint } from "../src/lib/lesson-materials/grammar-choice-v2/grammar-ontology";
import { isDoubleDegreeMarking, rejectCandidate } from "../src/lib/lesson-materials/grammar-choice-v2/local-validators";
import { resolveAndFilter } from "../src/lib/lesson-materials/grammar-choice-v2/pipeline";
import type { GrammarCandidate, GrammarPointCode } from "../src/lib/lesson-materials/grammar-choice-v2/types";

const FLAW =
  "The common flaw in our understanding of this law is that we believe all we have to do is think about or visualize something to manifest it.";
const INSIGHT =
  "One of Charles Darwin's greatest insights was that variation is a prerequisite for natural selection to work.";
const GERUNDS =
  "Letting go of our need for control, being aware, is a lot about gathering the courage to face uncertainty.";
const OF_WHAT = "You can create beautiful poster boards full of images of what you want.";
const THAT_FOCUSING =
  "Perhaps you have heard of the Law of Attraction, which states that like attracts like and that by focusing on positive or negative thoughts, one can bring about positive or negative results.";
const INDIRECT = "Consider what limiting beliefs you have that contradict your desires.";
const BOTH_FIG = "Both figuratively and literally.";
const BOTH_CULTURE = "our species has many kinds of minds, both within a single culture and across cultures";
const IMAGINE = "Imagine if we all used pencil instead of ink to write in our calendars and planners.";
const PARALLEL = "we often feel frightened and become inflexible.";
const FOR_WHICH = "We are wonderfully made, yet we don’t allow ourselves to participate in the wonder for which we were created.";

assert.equal(bothWhatThatGrammatical(FLAW, "that", "what"), true);
assert.equal(bothWhatThatGrammatical(INSIGHT, "that", "what"), true);
assert.equal(bothWhatThatGrammatical(OF_WHAT, "what", "that"), false);
assert.equal(bothWhatThatGrammatical(THAT_FOCUSING, "that", "what"), false);
assert.equal(ambiguousSubjectBoundary(GERUNDS, "is"), true);
assert.equal(ambiguousSubjectBoundary(FLAW, "is"), false);

assert.equal(
  rejectCandidate({
    candidate: cand("NOUN_CLAUSE_THAT", "that", "what", FLAW),
    sentence: sent("s1", FLAW),
  }),
  "BOTH_GRAMMATICAL"
);
assert.equal(
  rejectCandidate({
    candidate: cand("NOUN_CLAUSE_THAT", "that", "what", INSIGHT),
    sentence: sent("s2", INSIGHT),
  }),
  "BOTH_GRAMMATICAL"
);
assert.equal(
  rejectCandidate({
    candidate: cand("AGREEMENT_LONG_SUBJECT", "is", "are", GERUNDS),
    sentence: sent("s3", GERUNDS),
  }),
  "AMBIGUOUS_SUBJECT_BOUNDARY"
);
assert.notEqual(
  rejectCandidate({
    candidate: cand("RELATIVE_WHAT", "what", "that", OF_WHAT),
    sentence: sent("s4", OF_WHAT),
  }),
  "BOTH_GRAMMATICAL"
);
assert.equal(
  rejectCandidate({
    candidate: cand("GERUND_PREPOSITION_OBJECT", "moving", "move", "She left instead of moving the box."),
    sentence: sent("moving", "She left instead of moving the box."),
  }),
  null
);
assert.equal(
  rejectCandidate({
    candidate: cand("INFINITIVE_NOUN_ROLE", "to know", "to knowing", "They wanted to know the answer."),
    sentence: sent("toknow", "They wanted to know the answer."),
  }),
  "MECHANICAL_INFINITIVE_MARKER"
);
assert.equal(
  rejectCandidate({
    candidate: cand("INFINITIVE_ADVERB_ROLE", "to face", "to facing", "They had to face the problem."),
    sentence: sent("toface", "They had to face the problem."),
  }),
  "MECHANICAL_INFINITIVE_MARKER"
);
assert.equal(
  rejectCandidate({
    candidate: cand("INFINITIVE_DUMMY_IT", "to be", "to being", "It is hard to be honest."),
    sentence: sent("tobe", "It is hard to be honest."),
  }),
  "MECHANICAL_INFINITIVE_MARKER"
);


const all = repairChoice({ pointCode: "AGREEMENT_LONG_SUBJECT", correct: "is", wrong: "are", sentence: FLAW });
assert.equal(all?.pointCode, "PSEUDO_CLEFT_ALL");
assert.equal(all?.correct, "is");
assert.equal(all?.wrong, "are");

const one = repairChoice({ pointCode: "AGREEMENT_LONG_SUBJECT", correct: "was", wrong: "were", sentence: INSIGHT });
assert.equal(one?.pointCode, "AGREEMENT_ONE_OF");
assert.equal(one?.correct, "was");

const which = repairChoice({
  pointCode: "RELATIVE_PREPOSITION_WHICH",
  correct: "for which",
  wrong: "which",
  sentence: FOR_WHICH,
});
assert.equal(which?.correct, "which");
assert.equal(which?.wrong, "that");

const byWhich = repairChoice({
  pointCode: "RELATIVE_NONRESTRICTIVE",
  correct: "which",
  wrong: "that",
  sentence: "Nothing turns me off, by which I mean a social habit.",
});
assert.equal(byWhich?.pointCode, "RELATIVE_PREPOSITION_WHICH");
assert.equal(byWhich?.correct, "which");
assert.equal(byWhich?.wrong, "that");

const eitherOr = repairChoice({
  pointCode: "CORRELATIVE_EITHER_OR",
  correct: "either made or messed up",
  wrong: "either made or messing up",
  sentence: "They will have either made or messed up the plan.",
});
assert.equal(eitherOr?.correct, "messed");
assert.equal(eitherOr?.wrong, "messing");

const quicker = repairChoice({
  pointCode: "COMPARATIVE",
  correct: "quicker",
  wrong: "quickest",
  sentence: "Nothing turns me off something quicker than bad advice.",
});
assert.equal(quicker?.correct, "than");
assert.equal(quicker?.wrong, "as");

const indirect = repairChoice({
  pointCode: "INDIRECT_QUESTION_ORDER",
  correct: "what limiting beliefs you have",
  wrong: "do you have",
  sentence: INDIRECT,
});
assert.equal(indirect?.correct, "you have");
assert.equal(indirect?.wrong, "do you have");

const both = repairChoice({
  pointCode: "CORRELATIVE_BOTH_AND",
  correct: "Both figuratively and literally",
  wrong: "Both figuratively or literally",
  sentence: BOTH_FIG,
});
assert.equal(both?.correct, "and");
assert.equal(both?.wrong, "or");

const used = repairChoice({
  pointCode: "CONDITIONAL_SECOND",
  correct: "if we all used pencil instead of ink",
  wrong: "if we all would use pencil instead of ink",
  sentence: IMAGINE,
});
assert.equal(used, null);

const become = repairChoice({
  pointCode: "PARALLEL_VERBS",
  correct: "feel frightened and become inflexible",
  wrong: "feel frightened and becoming inflexible",
  sentence: PARALLEL,
});
assert.equal(become?.correct, "become");
assert.equal(become?.wrong, "becoming");

assert.equal(ontologyPoint("PSEUDO_CLEFT_ALL")?.chapter, "C14");
const pseudo = explainChoice({ pointCode: "PSEUDO_CLEFT_ALL", correct: "is", wrong: "are" });
assert.match(pseudo.explanationKo, /All \(that\) S have to do \+ be \+ 동사원형/);
assert.match(pseudo.explanationKo, /해야 할 전부/);
assert.equal(explanationFitsPair(pseudo.explanationKo, "is", "are"), true);
assert.doesNotMatch(pseudo.explanationKo, /전치사구/);

const oneExp = explainChoice({ pointCode: "AGREEMENT_ONE_OF", correct: "was", wrong: "were" });
assert.match(oneExp.explanationKo, /단수 one/);
assert.match(oneExp.explanationKo, /was/);

const rel = explainChoice({ pointCode: "RELATIVE_PREPOSITION_WHICH", correct: "which", wrong: "that" });
assert.match(rel.explanationKo, /전치사 바로 뒤에는 관계대명사 which/);
assert.doesNotMatch(rel.explanationKo, /for which \/ which/);
assert.doesNotMatch(rel.explanationKo, /전치사 for 바로 뒤에는 관계대명사 which를 쓰며 that은 쓸 수 없다\.$/);

assert.equal(
  canShrinkToSafePair("what limiting beliefs you have", "do you have"),
  true
);
assert.equal(
  canShrinkToSafePair("Both figuratively and literally", "Both figuratively or literally"),
  true
);

const filtered = resolveAndFilter({
  sentences: [
    sent("flaw", FLAW),
    sent("insight", INSIGHT),
    sent("gerund", GERUNDS),
    sent("indirect", INDIRECT),
    sent("both", BOTH_FIG),
    sent("culture", BOTH_CULTURE),
    sent("imagine", IMAGINE),
    sent("parallel", PARALLEL),
    sent("which", FOR_WHICH),
  ],
  candidates: [
    cand("NOUN_CLAUSE_THAT", "that", "what", FLAW, "flaw"),
    cand("AGREEMENT_LONG_SUBJECT", "is", "are", FLAW, "flaw"),
    cand("NOUN_CLAUSE_THAT", "that", "what", INSIGHT, "insight"),
    cand("AGREEMENT_LONG_SUBJECT", "was", "were", INSIGHT, "insight"),
    cand("AGREEMENT_LONG_SUBJECT", "is", "are", GERUNDS, "gerund"),
    cand("INDIRECT_QUESTION_ORDER", "what limiting beliefs you have", "do you have", INDIRECT, "indirect"),
    cand("CORRELATIVE_BOTH_AND", "Both figuratively and literally", "Both figuratively or literally", BOTH_FIG, "both"),
    cand("CORRELATIVE_BOTH_AND", "both within a single culture and across cultures", "both within a single culture or across cultures", BOTH_CULTURE, "culture"),
    cand("CONDITIONAL_SECOND", "used", "would use", IMAGINE, "imagine"),
    cand("PARALLEL_VERBS", "feel frightened and become", "feel frightened and becoming", PARALLEL, "parallel"),
    cand("RELATIVE_PREPOSITION_WHICH", "for which", "which", FOR_WHICH, "which"),
  ],
});

const codes = filtered.resolved.map((item) => `${item.sentenceId}:${item.pointCode}:${item.correctAnswer}/${item.distractors[0]}`);
assert.ok(codes.some((c) => c.includes("PSEUDO_CLEFT_ALL") && c.includes("is/are")), codes.join("\n"));
assert.ok(codes.some((c) => c.includes("AGREEMENT_ONE_OF") && c.includes("was/were")), codes.join("\n"));
assert.ok(codes.some((c) => c.includes("you have/do you have")), codes.join("\n"));
assert.ok(codes.some((c) => c.includes("both:CORRELATIVE_BOTH_AND:and/or")), codes.join("\n"));
assert.ok(codes.some((c) => c.includes("culture:CORRELATIVE_BOTH_AND:and/or")), codes.join("\n"));
assert.equal(filtered.rejected.some((item) => item.sentenceId === "imagine" && item.reason === "BOTH_CHOICES_GRAMMATICAL_IN_CONTEXT"), true);
assert.ok(codes.some((c) => c.includes("PARALLEL_VERBS") && c.includes("become/becoming")), codes.join("\n"));
assert.ok(codes.some((c) => c.includes("which/that")), codes.join("\n"));
// 이 문장에서 확인할 것은 "긴 주어 뒤 수일치"가 주어 경계가 모호해 떨어진다는 것이다.
// 예전에는 이 문장의 후보가 그것뿐이어서 "이 문장에서 아무것도 살아남지 않는다"로
// 적어 두었는데, 검출기가 후보를 공급하게 되면서 같은 문장에서 전치사+동명사
// (about gathering / gather)가 정당하게 나온다. 원래 의도대로 코드를 집어 확인한다.
assert.equal(
  filtered.resolved.some(
    (item) => item.sentenceId === "gerund" && item.pointCode === "AGREEMENT_LONG_SUBJECT"
  ),
  false
);
assert.ok(
  filtered.resolved.some(
    (item) => item.sentenceId === "gerund" && item.pointCode === "GERUND_PREPOSITION_OBJECT"
  ),
  "검출기가 만든 전치사+동명사 후보가 살아남아야 한다"
);
assert.equal(filtered.rejected.some((item) => item.reason === "BOTH_GRAMMATICAL" && item.sentenceId === "flaw"), true);
assert.equal(filtered.rejected.some((item) => item.reason === "AMBIGUOUS_SUBJECT_BOUNDARY"), true);
assert.equal(filtered.resolved.some((item) => item.correctAnswer === "for which"), false);

assert.equal(isDoubleDegreeMarking("most greatest"), true);
assert.equal(isDoubleDegreeMarking("more likelier"), true);
assert.equal(isDoubleDegreeMarking("less likelier"), true);
assert.equal(isDoubleDegreeMarking("more easier"), true);
assert.equal(isDoubleDegreeMarking("most best"), true);
assert.equal(isDoubleDegreeMarking("more likely"), false);
assert.equal(
  rejectCandidate({
    candidate: cand("COMPARATIVE", "more likely", "more likelier", "more likely"),
    sentence: sent("deg", "A species with great variation will more likely have some survivors."),
  }),
  "DOUBLE_DEGREE_MARKING"
);
assert.equal(
  rejectCandidate({
    candidate: cand("COMPARATIVE", "less likely", "less likelier", "less likely"),
    sentence: sent("deg2", "so we're less likely to be wiped out."),
  }),
  "DOUBLE_DEGREE_MARKING"
);

const DARWIN = "One of Charles Darwin's greatest insights was that variation is a prerequisite for natural selection to work.";
const greatest = repairChoice({
  pointCode: "ONE_OF_SUPERLATIVE",
  correct: "greatest",
  wrong: "most greatest",
  sentence: DARWIN,
});
assert.equal(greatest?.correct, "insights");
assert.equal(greatest?.wrong, "insight");
assert.equal(greatest?.pointCode, "ONE_OF_SUPERLATIVE");

const thatWhich = explainChoice({ pointCode: "PARALLEL_CLAUSES", correct: "that", wrong: "which" });
assert.match(thatWhich.explanationKo, /완전한 내용절/);
assert.doesNotMatch(thatWhich.explanationKo, /유지할 수 있다/);

const magnetic = repairChoice({
  pointCode: "ADVERB_ADJECTIVE_MODIFIER",
  correct: "extremely magnetic",
  wrong: "extreme magnetic",
  sentence: "our thoughts and words are extremely magnetic.",
});
assert.equal(magnetic?.correct, "extremely");
assert.equal(magnetic?.wrong, "extreme");

const made = explainChoice({ pointCode: "VOICE_BE_MADE_TO", correct: "made to move", wrong: "made move" });
assert.match(made.explanationKo, /be made to \+ 동사원형/);
assert.doesNotMatch(made.explanationKo, /과거분사를 쓴다/);

const order = repairChoice({
  pointCode: "UNMAPPED_HIGH_VALUE_POINT",
  correct: "we are getting",
  wrong: "are we getting",
  sentence: "The point is we are getting further and further away from our design.",
});
assert.equal(order?.pointCode, "NOUN_CLAUSE_DECLARATIVE_ORDER");
assert.equal(
  rejectCandidate({
    candidate: cand("UNMAPPED_HIGH_VALUE_POINT", "it's", "is it", "I think it's a beautiful thing."),
    sentence: sent("unmapped", "I think it's a beautiful thing."),
  }),
  "UNMAPPED_ASSESSMENT_AXIS"
);

const thinking = repairChoice({
  pointCode: "PARALLEL_AND_OR_BUT",
  correct: "planning and thinking",
  wrong: "planning and to think",
  sentence: "But there's a difference between planning and thinking all your plans have to come to fruition.",
});
assert.equal(thinking?.correct, "thinking");
assert.equal(thinking?.wrong, "think");

const instead = repairChoice({
  pointCode: "CONJUNCTION_PREPOSITION_CONTRAST",
  correct: "instead of",
  wrong: "instead",
  sentence: IMAGINE,
});
assert.equal(instead?.pointCode, "PREPOSITION_INSTEAD_OF");
const insteadExp = explainChoice({ pointCode: "PREPOSITION_INSTEAD_OF", correct: "instead of", wrong: "instead" });
assert.match(insteadExp.explanationKo, /복합전치사 instead of/);
assert.doesNotMatch(insteadExp.explanationKo, /뒤에 오는 성분이 절이면 접속사/);

const wipe3 = repairChoice({
  pointCode: "VOICE_ACTIVE_PASSIVE",
  correct: "be completely wiped out",
  wrong: "be completely wiping out",
  sentence: "a species without much variation might be completely wiped out.",
});
assert.equal(wipe3?.correct, "wiped");
assert.equal(wipe3?.wrong, "wiping");
assert.equal(wipe3?.pointCode, "VOICE_MODAL_PASSIVE");

const wipe7 = repairChoice({
  pointCode: "VOICE_ACTIVE_PASSIVE",
  correct: "to be wiped out",
  wrong: "to be wiping out",
  sentence: "so we're less likely to be wiped out.",
});
assert.equal(wipe7?.pointCode, "INFINITIVE_PASSIVE");
assert.equal(wipe7?.correct, "be wiped");
assert.equal(wipe7?.wrong, "wipe");

const moveInstead = repairChoice({
  pointCode: "PREPOSITION_INSTEAD_OF",
  correct: "Instead of moving",
  wrong: "Instead of move",
  sentence: "Instead of moving anywhere and everywhere, most of us spend our time moving nowhere.",
});
assert.equal(moveInstead?.pointCode, "GERUND_PREPOSITION_OBJECT");
assert.equal(moveInstead?.correct, "moving");
assert.equal(moveInstead?.wrong, "move");

const planned = repairChoice({
  pointCode: "PARALLEL_AND_OR_BUT",
  correct: "planning and thinking",
  wrong: "planning and think",
  sentence: "But there's a difference between planning and thinking all your plans have to come to fruition.",
});
assert.equal(planned?.correct, "thinking");
assert.equal(planned?.wrong, "think");
assert.equal(planned?.pointCode, "PARALLEL_AND_OR_BUT");

const wipedOut = repairChoice({
  pointCode: "VOICE_ACTIVE_PASSIVE",
  correct: "wiped out",
  wrong: "wiping out",
  sentence: "so we're less likely to be wiped out.",
});
assert.equal(wipedOut?.pointCode, "INFINITIVE_PASSIVE");
assert.equal(wipedOut?.correct, "be wiped");
assert.equal(wipedOut?.wrong, "wipe");

const thatWhat = explainChoice({ pointCode: "PARALLEL_CLAUSES", correct: "that", wrong: "what" });
assert.match(thatWhat.explanationKo, /완전한 내용절/);
assert.match(thatWhat.explanationKo, /문장 성분을 맡지 않지만/);
assert.match(thatWhat.wrongReasonKo, /주어나 목적어/);
assert.doesNotMatch(insteadExp.explanationKo, /\bink\b/);
assert.equal(
  explanationContractMismatch({
    pointCode: "PREPOSITION_INSTEAD_OF",
    correct: "instead of",
    wrong: "instead",
    explanation: insteadExp.explanationKo,
  }),
  false
);
assert.equal(
  explanationContractMismatch({
    pointCode: "GERUND_PREPOSITION_OBJECT",
    correct: "moving",
    wrong: "move",
    explanation: explainChoice({ pointCode: "GERUND_PREPOSITION_OBJECT", correct: "moving", wrong: "move" }).explanationKo,
  }),
  false
);

console.log("quality-fixes ok", filtered.resolved.length, "resolved");

function sent(sentenceId: string, text: string) {
  return { sentenceId, text, passageStart: 0, passageEnd: text.length };
}

function cand(
  pointCode: GrammarPointCode,
  correct: string,
  wrong: string,
  _sentence: string,
  sentenceId = "s"
): GrammarCandidate {
  return {
    candidateId: `${sentenceId}-${pointCode}-${correct}`,
    sentenceId,
    pointCode,
    sourceSpan: correct,
    occurrenceIndex: 0,
    correctAnswer: correct,
    distractors: [wrong],
    transformCode: "FORM_SWAP",
    priority: "MANDATORY",
    difficulty: "CORE",
    evidence: "",
    ruleSummaryKo: "",
    riskLevel: "LOW",
  };
}
