import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildDisplayWithCandidateSlots,
  canCompleteStage7,
  gradeStage7Candidate,
  stage7GuideText,
  toStudentStage7Candidate,
  validateCandidateAgainstDisplay,
  type ExamStage7Candidate,
} from "./stage7-types.js";

describe("stage7 helpers", () => {
  it("formats guide with required count", () => {
    assert.match(stage7GuideText(3), /세 개/);
  });

  it("strips isError for student", () => {
    const c = {
      id: "c1",
      academy_id: "a",
      passage_id: "p",
      sentence_id: "s",
      stage_number: 7 as const,
      blank_order: 1,
      answer_text: "where",
      accepted_answers: [],
      english_start: 0,
      english_end: 5,
      selected_text: "which",
      answer_snapshot: "which",
      is_error: true,
      grammar_category: ["relative_adverb"],
      hint: "h",
      explanation: "secret",
      is_required: true,
      case_sensitive: false,
      ignore_extra_spaces: true,
      ignore_punctuation: false,
      created_at: "",
      updated_at: "",
    } satisfies ExamStage7Candidate;
    const pub = toStudentStage7Candidate(c);
    assert.equal(pub.displayedText, "which");
    assert.ok(!JSON.stringify(pub).includes("where"));
    assert.ok(!JSON.stringify(pub).includes("is_error"));
    assert.ok(!JSON.stringify(pub).includes("secret"));
  });

  it("validates display range", () => {
    const display = "neighborhood which it's not permitted.";
    assert.equal(
      validateCandidateAgainstDisplay(display, {
        english_start: 13,
        english_end: 18,
        displayed_text: "which",
        is_error: true,
        correction_text: "where",
      }),
      null
    );
    assert.ok(
      validateCandidateAgainstDisplay(display, {
        english_start: 13,
        english_end: 18,
        displayed_text: "which",
        is_error: true,
        correction_text: "",
      })
    );
  });

  it("grades selection and correction separately", () => {
    const errorCand = {
      is_error: true,
      answer_text: "where",
      accepted_answers: [],
      case_sensitive: false,
      ignore_extra_spaces: true,
      ignore_punctuation: false,
    };
    assert.equal(
      gradeStage7Candidate(errorCand, true, "where").result,
      "correct_selection_and_correction"
    );
    assert.equal(
      gradeStage7Candidate(errorCand, true, "which").result,
      "correct_selection_wrong_correction"
    );
    assert.equal(
      gradeStage7Candidate(
        { ...errorCand, is_error: false, answer_text: "are leaving" },
        true,
        "x"
      ).result,
      "wrong_selection"
    );
  });

  it("completes only when all errors fixed and no wrong picks", () => {
    const cands = [
      {
        id: "e1",
        is_error: true,
      },
      {
        id: "ok1",
        is_error: false,
      },
    ] as ExamStage7Candidate[];
    // minimal fields for canComplete — cast
    const full = cands.map((c, i) => ({
      id: c.id,
      academy_id: "a",
      passage_id: "p",
      sentence_id: "s",
      stage_number: 7 as const,
      blank_order: i + 1,
      answer_text: "where",
      accepted_answers: [],
      english_start: 0,
      english_end: 1,
      selected_text: "x",
      answer_snapshot: "x",
      is_error: c.is_error,
      grammar_category: [],
      hint: null,
      explanation: null,
      is_required: true,
      case_sensitive: false,
      ignore_extra_spaces: true,
      ignore_punctuation: false,
      created_at: "",
      updated_at: "",
    }));
    assert.equal(
      canCompleteStage7(full, {
        e1: {
          selected: true,
          correctionValue: "where",
          selectionCorrect: true,
          correctionCorrect: true,
          result: "correct_selection_and_correction",
          attempts: 1,
          hintUsed: false,
          positionRevealed: false,
          answerRevealed: false,
        },
      }),
      true
    );
    assert.equal(
      canCompleteStage7(full, {
        e1: {
          selected: true,
          correctionValue: "where",
          selectionCorrect: true,
          correctionCorrect: true,
          result: "correct_selection_and_correction",
          attempts: 1,
          hintUsed: false,
          positionRevealed: false,
          answerRevealed: false,
        },
        ok1: {
          selected: true,
          correctionValue: "",
          selectionCorrect: false,
          correctionCorrect: false,
          result: "wrong_selection",
          attempts: 1,
          hintUsed: false,
          positionRevealed: false,
          answerRevealed: false,
        },
      }),
      false
    );
  });

  it("builds slots", () => {
    const slots = buildDisplayWithCandidateSlots("A which B that C", [
      { id: "1", english_start: 2, english_end: 7 },
      { id: "2", english_start: 10, english_end: 14 },
    ]);
    assert.equal(slots.filter((s) => s.type === "candidate").length, 2);
  });
});
