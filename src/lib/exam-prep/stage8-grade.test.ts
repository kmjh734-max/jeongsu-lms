import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  buildSentenceLayout,
  canCompleteStage8,
  chunksMatchOriginal,
  gradeChunkOrder,
  joinChunkTexts,
  mergeChunks,
  proposeChunksFromText,
  splitChunkAt,
  toStudentStage8Group,
  validateStage8GroupAgainstText,
  type ExamStage8Group,
  type Stage8AnswerState,
  type Stage8Chunk,
} from "./stage8-types.js";
import { shuffleOptionIds } from "./stage6-types.js";

describe("stage8 chunks merge/split/join", () => {
  it("proposes space-split chunks", () => {
    const chunks = proposeChunksFromText("some of my neighbors");
    assert.equal(chunks.length, 4);
    assert.equal(chunks[0]?.chunkText, "some");
  });

  it("merges adjacent chunks keeping spaces", () => {
    const base: Stage8Chunk[] = [
      { id: "1", chunkOrder: 1, chunkText: "some" },
      { id: "2", chunkOrder: 2, chunkText: "of" },
      { id: "3", chunkOrder: 3, chunkText: "my" },
      { id: "4", chunkOrder: 4, chunkText: "neighbors" },
    ];
    const merged = mergeChunks(base, [0, 1]);
    assert.equal(merged.length, 3);
    assert.equal(merged[0]?.chunkText, "some of");
    assert.ok(chunksMatchOriginal(merged, "some of my neighbors"));
  });

  it("splits chunk at position", () => {
    const base: Stage8Chunk[] = [
      { id: "1", chunkOrder: 1, chunkText: "have been dumping" },
    ];
    const split = splitChunkAt(base, 0, 4);
    assert.equal(split.length, 2);
    assert.equal(split[0]?.chunkText, "have");
    assert.equal(split[1]?.chunkText, "been dumping");
  });

  it("joins without space before punctuation", () => {
    assert.equal(joinChunkTexts(["areas", ","]), "areas,");
    assert.equal(joinChunkTexts(["Hello", "world"]), "Hello world");
  });
});

describe("stage8 layout & range", () => {
  it("builds fixed + reorder layout", () => {
    const en = "To fix this, I urge the city.";
    const segs = buildSentenceLayout(en, [
      { id: "g1", english_start: 3, english_end: 11 },
      { id: "g2", english_start: 15, english_end: 28 },
    ]);
    assert.equal(segs[0]?.type, "fixed");
    assert.equal(segs[0] && segs[0].type === "fixed" ? segs[0].text : "", "To ");
    assert.equal(segs[1]?.type, "reorder_group");
  });

  it("validates range against english", () => {
    const en = "People have been dumping their waste.";
    const chunks = proposeChunksFromText("People have been dumping");
    const err = validateStage8GroupAgainstText(en, {
      english_start: 0,
      english_end: 24,
      original_text: "People have been dumping",
      chunks,
    });
    assert.equal(err, null);

    const bad = validateStage8GroupAgainstText(en, {
      english_start: 0,
      english_end: 10,
      original_text: "People have been dumping",
      chunks,
    });
    assert.ok(bad);
  });
});

describe("stage8 shuffle & grade", () => {
  it("seeded shuffle is stable", () => {
    const ids = ["a", "b", "c", "d"];
    assert.deepEqual(
      shuffleOptionIds(ids, "s:g:1"),
      shuffleOptionIds(ids, "s:g:1")
    );
  });

  it("grades by chunk id order", () => {
    const chunks: Stage8Chunk[] = [
      { id: "c1", chunkOrder: 1, chunkText: "People" },
      { id: "c2", chunkOrder: 2, chunkText: "have" },
      { id: "c3", chunkOrder: 3, chunkText: "been" },
    ];
    assert.equal(gradeChunkOrder(chunks, ["c1", "c2", "c3"], "People have been"), true);
    assert.equal(gradeChunkOrder(chunks, ["c2", "c1", "c3"], "People have been"), false);
  });

  it("allows same-text card swap when rendered equals original", () => {
    const chunks: Stage8Chunk[] = [
      { id: "t1", chunkOrder: 1, chunkText: "the" },
      { id: "t2", chunkOrder: 2, chunkText: "the" },
      { id: "of", chunkOrder: 3, chunkText: "of" },
    ];
    assert.equal(
      gradeChunkOrder(chunks, ["t2", "t1", "of"], "the the of"),
      true
    );
  });

  it("strips chunkOrder from student payload", () => {
    const group = {
      id: "g1",
      academy_id: "a",
      passage_id: "p",
      sentence_id: "s",
      stage_number: 8 as const,
      blank_order: 1,
      answer_text: "People have",
      accepted_answers: [],
      english_start: 0,
      english_end: 11,
      selected_text: "People have",
      answer_snapshot: "People have",
      reorder_chunks: [
        { id: "c1", chunkOrder: 1, chunkText: "People" },
        { id: "c2", chunkOrder: 2, chunkText: "have" },
      ],
      hint: null,
      explanation: null,
      is_required: true,
      created_at: "",
      updated_at: "",
    } as ExamStage8Group;
    const pub = toStudentStage8Group(group, "seed");
    assert.ok(!JSON.stringify(pub).includes("chunkOrder"));
    assert.equal(pub.chunks.length, 2);
    assert.equal(pub.initialOrder.length, 2);
    assert.notDeepEqual(pub.initialOrder, ["c1", "c2"]);
  });

  it("complete requires all required groups correct", () => {
    const groups = [
      { id: "g1", is_required: true },
      { id: "g2", is_required: true },
      { id: "g3", is_required: false },
    ] as ExamStage8Group[];
    const answers: Record<string, Stage8AnswerState> = {
      g1: {
        studentOrder: [],
        initialOrder: [],
        isCorrect: true,
        attempts: 1,
        hintUsed: false,
        answerRevealed: false,
      },
      g2: {
        studentOrder: [],
        initialOrder: [],
        isCorrect: false,
        attempts: 1,
        hintUsed: false,
        answerRevealed: false,
      },
    };
    assert.equal(canCompleteStage8(groups, answers), false);
    answers.g2!.isCorrect = true;
    assert.equal(canCompleteStage8(groups, answers), true);
  });
});
