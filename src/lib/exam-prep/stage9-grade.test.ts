import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  areSentenceIdsContiguous,
  assignShuffledLabels,
  canCompleteStage9,
  gradeBlockOrder,
  toStudentStage9Problem,
  validateStage9Blocks,
  validateSubmittedOrder,
  type ExamStage9Block,
  type Stage9AnswerState,
} from "./stage9-types.js";

const ordered = ["s1", "s2", "s3", "s4", "s5", "s6"];

describe("stage9 sentence grouping", () => {
  it("accepts contiguous sentences", () => {
    assert.equal(areSentenceIdsContiguous(["s2", "s3"], ordered), true);
  });

  it("rejects non-contiguous sentences", () => {
    assert.equal(areSentenceIdsContiguous(["s1", "s3"], ordered), false);
  });

  it("detects duplicate and missing via validate", () => {
    const err = validateStage9Blocks(ordered, [
      { sentence_ids: ["s1", "s2"], blank_order: 1 },
      { sentence_ids: ["s2", "s3"], blank_order: 2 },
    ]);
    assert.ok(err?.includes("중복"));
  });

  it("requires at least 2 blocks", () => {
    const err = validateStage9Blocks(ordered, [
      { sentence_ids: ["s1", "s2"], blank_order: 1 },
    ]);
    assert.ok(err?.includes("최소 2"));
  });
});

describe("stage9 labels & grade", () => {
  it("shuffles labels away from natural A-B-C", () => {
    const labels = assignShuffledLabels(3, "passage:v1");
    assert.equal(labels.length, 3);
    assert.equal(new Set(labels).size, 3);
    assert.notEqual(labels.join(""), "ABC");
  });

  it("grades by block id order", () => {
    const blocks = [
      { id: "b1", blank_order: 1 },
      { id: "b2", blank_order: 2 },
      { id: "b3", blank_order: 3 },
    ] as ExamStage9Block[];
    assert.equal(gradeBlockOrder(blocks, ["b1", "b2", "b3"]), true);
    assert.equal(gradeBlockOrder(blocks, ["b3", "b2", "b1"]), false);
  });

  it("rejects incomplete submission", () => {
    const blocks = [
      { id: "b1", blank_order: 1 },
      { id: "b2", blank_order: 2 },
    ] as ExamStage9Block[];
    assert.ok(validateSubmittedOrder(blocks, ["b1"]));
    assert.ok(validateSubmittedOrder(blocks, ["b1", "b1"]));
    assert.equal(validateSubmittedOrder(blocks, ["b1", "b2"]), null);
  });

  it("strips blockOrder from student payload", () => {
    const blocks = [
      {
        id: "uuid-c",
        blank_order: 1,
        display_label: "C",
        selected_text: "intro",
        answer_text: "intro",
      },
      {
        id: "uuid-a",
        blank_order: 2,
        display_label: "A",
        selected_text: "body",
        answer_text: "body",
      },
      {
        id: "uuid-b",
        blank_order: 3,
        display_label: "B",
        selected_text: "end",
        answer_text: "end",
      },
    ] as ExamStage9Block[];
    const pub = toStudentStage9Problem(
      {
        fixedPrefix: "Dear,",
        fixedSuffix: "Sincerely,",
        answerMode: "label_sequence",
        structureHint: "secret",
        contentVersion: 2,
        published: true,
      },
      blocks
    );
    const json = JSON.stringify(pub);
    assert.ok(!json.includes("blank_order"));
    assert.ok(!json.includes("blockOrder"));
    assert.ok(!json.includes("secret"));
    assert.equal(pub.blocks[0]?.displayLabel, "A");
    assert.equal(pub.fixedPrefix, "Dear,");
    assert.equal(pub.hasStructureHint, true);
  });

  it("complete requires exact correct order", () => {
    const blocks = [
      { id: "b1", blank_order: 1 },
      { id: "b2", blank_order: 2 },
    ] as ExamStage9Block[];
    const ans: Stage9AnswerState = {
      orderedBlockIds: ["b2", "b1"],
      selectedLabels: ["B", "A"],
      attempts: 1,
      isCorrect: true,
      hintUsed: false,
      answerRevealed: false,
    };
    assert.equal(canCompleteStage9(blocks, ans), false);
    ans.orderedBlockIds = ["b1", "b2"];
    assert.equal(canCompleteStage9(blocks, ans), true);
  });
});
