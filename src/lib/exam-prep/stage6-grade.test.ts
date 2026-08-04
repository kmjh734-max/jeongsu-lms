import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildEnglishWithChoiceSlots,
  gradeSelectedOption,
  shuffleOptionIds,
  toStudentStage6Item,
  validateStage6ItemAgainstText,
  type ExamStage6Item,
} from "./stage6-types.js";

describe("stage6 shuffle & grade", () => {
  it("shuffles deterministically for same seed", () => {
    const ids = ["a", "b", "c", "d"];
    const s1 = shuffleOptionIds(ids, "student-1:item-1");
    const s2 = shuffleOptionIds(ids, "student-1:item-1");
    assert.deepEqual(s1, s2);
    const s3 = shuffleOptionIds(ids, "student-2:item-1");
    // likely different but not required; at least same length
    assert.equal(s3.length, 4);
    assert.equal(new Set(s1).size, 4);
  });

  it("grades by optionId not index", () => {
    const options = [
      { id: "opt-wrong", text: "been dumped", isCorrect: false },
      { id: "opt-right", text: "been dumping", isCorrect: true },
    ];
    assert.equal(gradeSelectedOption(options, "opt-right"), true);
    assert.equal(gradeSelectedOption(options, "opt-wrong"), false);
    assert.equal(gradeSelectedOption(options, "missing"), false);
  });

  it("strips isCorrect for student payload", () => {
    const item = {
      id: "i1",
      academy_id: "a",
      passage_id: "p",
      sentence_id: "s",
      stage_number: 5 as unknown as 6,
      target_language: "en" as const,
      blank_order: 1,
      answer_text: "where",
      accepted_answers: [],
      english_start: 0,
      english_end: 5,
      selected_text: "where",
      answer_snapshot: "where",
      choice_options: [
        { id: "a", text: "where", isCorrect: true, explanation: "secret" },
        { id: "b", text: "that", isCorrect: false, explanation: "no" },
      ],
      question_category: "grammar" as const,
      grammar_subcategory: ["relative_adverb"],
      vocabulary_subcategory: [],
      shuffle_options: true,
      hint: "h",
      explanation: "ex",
      is_required: true,
      case_sensitive: false,
      ignore_extra_spaces: true,
      ignore_punctuation: false,
      created_at: "",
      updated_at: "",
    } as ExamStage6Item;
    item.stage_number = 6;
    const pub = toStudentStage6Item(item, ["b", "a"]);
    assert.equal(pub.options[0]?.id, "b");
    assert.equal(pub.options[0]?.text, "that");
    assert.equal(
      "isCorrect" in (pub.options[0] as object),
      false
    );
    assert.ok(!JSON.stringify(pub).includes("secret"));
  });
});

describe("stage6 range & validation", () => {
  const en = "People have been dumping their waste.";

  it("accepts valid two-option item", () => {
    assert.equal(
      validateStage6ItemAgainstText(en, {
        english_start: 12,
        english_end: 24,
        answer_text: "been dumping",
        selected_text: "been dumping",
        question_category: "grammar",
        choice_options: [
          { id: "a", text: "been dumping", isCorrect: true },
          { id: "b", text: "been dumped", isCorrect: false },
        ],
      }),
      null
    );
  });

  it("rejects wrong answer text vs original", () => {
    const err = validateStage6ItemAgainstText(en, {
      english_start: 12,
      english_end: 24,
      answer_text: "been dumping",
      selected_text: "been dumping",
      question_category: "grammar",
      choice_options: [
        { id: "a", text: "been dumped", isCorrect: true },
        { id: "b", text: "been dumping", isCorrect: false },
      ],
    });
    assert.ok(err);
  });

  it("builds multi slots", () => {
    const slots = buildEnglishWithChoiceSlots(
      "A attracts B which has C.",
      [
        { id: "1", english_start: 2, english_end: 10 },
        { id: "2", english_start: 13, english_end: 18 },
      ]
    );
    assert.equal(slots.filter((s) => s.type === "item").length, 2);
  });
});
