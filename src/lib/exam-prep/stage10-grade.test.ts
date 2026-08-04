import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  answersMatch,
  assembleTokens,
  canCompleteStage10,
  composeSegmentsToText,
  gradeItem,
  normalizeWritingAnswer,
  proposeFullSentenceSegments,
  toStudentStage10Item,
  tokenizeAnswerText,
  validateStage10Item,
  type ExamStage10Item,
  type Stage10ItemAnswerState,
  type Stage10ItemDraft,
} from "./stage10-types.js";

describe("stage10 normalize & tokens", () => {
  it("tokenizes and assembles", () => {
    assert.deepEqual(tokenizeAnswerText("have been dumping"), [
      "have",
      "been",
      "dumping",
    ]);
    assert.equal(assembleTokens(["have", "been", "dumping"]), "have been dumping");
  });

  it("normalizes case and spaces and terminal punctuation", () => {
    assert.equal(
      normalizeWritingAnswer("People  have been dumping their waste."),
      "people have been dumping their waste"
    );
  });

  it("matches accepted answers", () => {
    assert.equal(
      answersMatch("people have been dumping their waste", "People have been dumping their waste."),
      true
    );
    assert.equal(
      answersMatch("People have dumped their waste.", "People have been dumping their waste."),
      false
    );
  });
});

describe("stage10 segments & dto", () => {
  it("composes segments to original", () => {
    const segs = [
      { id: "1", segmentOrder: 1, segmentType: "fixed_text" as const, fixedText: "To " },
      {
        id: "2",
        segmentOrder: 2,
        segmentType: "answer_segment" as const,
        originalAnswerText: "fix this growing problem",
        answerTokens: ["fix", "this", "growing", "problem"],
      },
      { id: "3", segmentOrder: 3, segmentType: "fixed_text" as const, fixedText: "." },
    ];
    assert.equal(
      composeSegmentsToText(segs),
      "To fix this growing problem."
    );
  });

  it("validates item needs cues and answer", () => {
    const english = "People have been dumping their waste.";
    const draft: Stage10ItemDraft = {
      blank_order: 1,
      sentence_ids: ["s1"],
      korean_prompt: "사람들이...",
      full_english: english,
      writing_segments: proposeFullSentenceSegments(english),
      writing_cues: [],
      writing_input_mode: "guided_segments",
      writing_blank_display_mode: "token_slots",
    };
    assert.ok(validateStage10Item(english, draft)?.includes("제시어"));
    draft.writing_cues = [
      { id: "c1", cueOrder: 1, cueText: "dump" },
      { id: "c2", cueOrder: 2, cueText: "waste" },
    ];
    assert.equal(validateStage10Item(english, draft), null);
  });

  it("strips answers from student dto", () => {
    const item = {
      id: "i1",
      academy_id: "a",
      passage_id: "p",
      sentence_id: "s",
      stage_number: 10 as const,
      blank_order: 1,
      answer_text: "SECRET ANSWER",
      selected_text: "우리말",
      answer_snapshot: "SECRET ANSWER",
      accepted_answers: ["alt"],
      sentence_ids: ["s"],
      writing_segments: proposeFullSentenceSegments("SECRET ANSWER"),
      writing_cues: [
        {
          id: "c1",
          cueOrder: 1,
          cueText: "secret",
          linkedAnswerText: "SECRET",
        },
      ],
      writing_input_mode: "guided_segments" as const,
      writing_blank_display_mode: "token_slots" as const,
      hint: "h",
      explanation: "ex",
      is_required: true,
      created_at: "",
      updated_at: "",
    } as ExamStage10Item;
    const pub = toStudentStage10Item(item);
    const json = JSON.stringify(pub);
    assert.ok(!json.includes("SECRET ANSWER"));
    assert.ok(!json.includes("linkedAnswerText"));
    assert.ok(!json.includes("originalAnswerText"));
    assert.equal(pub.cues[0]?.cueText, "secret");
    assert.ok((pub.segments[0]?.tokenSlotCount ?? 0) > 0);
  });

  it("grades full sentence and complete condition", () => {
    const item = {
      id: "i1",
      is_required: true,
      answer_text: "Hello world.",
      accepted_answers: [],
      writing_input_mode: "full_sentence",
      writing_blank_display_mode: "phrase_input",
      writing_segments: [],
    } as unknown as ExamStage10Item;
    const state: Stage10ItemAnswerState = {
      segmentAnswers: {},
      fullSentenceAnswer: "hello world",
      attempts: 1,
      isCorrect: null,
      hintUsed: false,
      answerRevealed: false,
    };
    assert.equal(gradeItem(item, state), true);
    state.isCorrect = true;
    assert.equal(canCompleteStage10([item], { i1: state }), true);
  });
});
