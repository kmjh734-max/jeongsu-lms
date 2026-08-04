import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { compareEnglishBlankAnswer } from "./english-blank-normalize.js";
import {
  buildEnglishWithVerbSlots,
  collectStage5Warnings,
  formatCueDisplay,
  grammarCategoryFeedback,
  parseCueWords,
  validateStage5ItemAgainstText,
} from "./stage5-types.js";

describe("stage5 cue & render", () => {
  it("formats cue display", () => {
    assert.equal(formatCueDisplay(["have", "be", "dump"]), "have, be, dump");
  });

  it("parses cue words from array or comma string", () => {
    assert.deepEqual(parseCueWords(["have", "be"]), ["have", "be"]);
    assert.deepEqual(parseCueWords("have, be, dump"), [
      "have",
      "be",
      "dump",
    ]);
  });

  it("builds slots for multi-cue ranges", () => {
    const en =
      "People have been dumping their waste where it is not permitted.";
    const slots = buildEnglishWithVerbSlots(en, [
      { id: "a", english_start: 7, english_end: 24 },
      { id: "b", english_start: 47, english_end: 63 },
    ]);
    assert.equal(slots[0]?.type, "text");
    assert.equal(slots[1]?.type, "item");
    assert.equal(slots[2]?.type, "text");
    assert.equal(slots[3]?.type, "item");
  });
});

describe("stage5 validation", () => {
  const en = "People have been dumping their waste.";

  it("accepts valid range with cues", () => {
    assert.equal(
      validateStage5ItemAgainstText(en, {
        english_start: 7,
        english_end: 24,
        answer_text: "have been dumping",
        selected_text: "have been dumping",
        cue_words: ["have", "be", "dump"],
      }),
      null
    );
  });

  it("rejects empty cues", () => {
    const err = validateStage5ItemAgainstText(en, {
      english_start: 7,
      english_end: 24,
      answer_text: "have been dumping",
      selected_text: "have been dumping",
      cue_words: [],
    });
    assert.ok(err);
  });

  it("rejects broken range after text change", () => {
    const err = validateStage5ItemAgainstText("People dumped waste.", {
      english_start: 7,
      english_end: 24,
      answer_text: "have been dumping",
      selected_text: "have been dumping",
      cue_words: ["have", "be", "dump"],
    });
    assert.ok(err);
  });

  it("warns on overlapping ranges", () => {
    const warnings = collectStage5Warnings(en, [
      {
        sentence_id: "s",
        blank_order: 1,
        answer_text: "have been",
        selected_text: "have been",
        accepted_answers: [],
        english_start: 7,
        english_end: 16,
        cue_words: ["have", "be"],
        grammar_category: [],
      },
      {
        sentence_id: "s",
        blank_order: 2,
        answer_text: "been dumping",
        selected_text: "been dumping",
        accepted_answers: [],
        english_start: 12,
        english_end: 24,
        cue_words: ["be", "dump"],
        grammar_category: [],
      },
    ]);
    assert.ok(warnings.some((w) => w.includes("겹")));
  });
});

describe("stage5 grading (exact form)", () => {
  it("accepts multi-word answer case-insensitively", () => {
    assert.equal(
      compareEnglishBlankAnswer(
        "Have been dumping",
        "have been dumping",
        [],
        { caseSensitive: false, ignoreExtraSpaces: true }
      ),
      true
    );
  });

  it("rejects wrong tense / missing auxiliaries", () => {
    assert.equal(
      compareEnglishBlankAnswer("have dumped", "have been dumping", []),
      false
    );
    assert.equal(
      compareEnglishBlankAnswer("been dumping", "have been dumping", []),
      false
    );
    assert.equal(
      compareEnglishBlankAnswer("not permitted", "is not permitted", []),
      false
    );
  });

  it("accepts sentence-start lower case when case-insensitive", () => {
    assert.equal(
      compareEnglishBlankAnswer("to fix", "To fix", [], {
        caseSensitive: false,
      }),
      true
    );
  });

  it("accepts acceptedAnswers only as extras", () => {
    assert.equal(
      compareEnglishBlankAnswer("are leaving", "are leaving", ["is leaving"]),
      true
    );
    assert.equal(
      compareEnglishBlankAnswer("is leaving", "are leaving", ["is leaving"]),
      true
    );
  });

  it("builds grammar feedback from categories", () => {
    const fb = grammarCategoryFeedback([
      "present_perfect",
      "present_progressive",
    ]);
    assert.match(fb, /완료형/);
    assert.match(fb, /진행형/);
  });
});
