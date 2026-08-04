import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computePassageAverageScore,
  isBlankOrWhitespace,
  looksLikeEnglishCopy,
  meaningWeightSum,
  type Stage4SentenceAnswerState,
} from "./stage4-types.js";
import {
  precheckStage4Answer,
  validateStage4AiResult,
} from "./stage4-grade-ai.js";

describe("stage4 helpers", () => {
  it("detects blank", () => {
    assert.equal(isBlankOrWhitespace("   "), true);
    assert.equal(isBlankOrWhitespace("해석"), false);
  });

  it("detects english copy", () => {
    const en =
      "People have been dumping their waste in areas of our neighborhood.";
    assert.equal(looksLikeEnglishCopy(en, en), true);
    assert.equal(
      looksLikeEnglishCopy("사람들이 쓰레기를 버리고 있습니다.", en),
      false
    );
  });

  it("sums meaning weights", () => {
    assert.equal(
      meaningWeightSum([
        { id: "a", description: "x", weight: 40 },
        { id: "b", description: "y", weight: 60 },
      ]),
      100
    );
  });

  it("averages passage scores over required sentences", () => {
    const answers: Record<string, Stage4SentenceAnswerState> = {
      s1: {
        value: "a",
        status: "passed",
        attempts: 1,
        latestScore: 80,
        finalScore: 80,
        isPass: true,
        modelTranslationRevealed: false,
      },
      s2: {
        value: "b",
        status: "passed",
        attempts: 1,
        latestScore: 100,
        finalScore: 100,
        isPass: true,
        modelTranslationRevealed: false,
      },
    };
    assert.equal(computePassageAverageScore(answers, ["s1", "s2"]), 90);
  });
});

describe("precheckStage4Answer", () => {
  const base = {
    englishText: "Hello world example sentence here.",
    modelTranslation: "안녕하세요 세계입니다.",
    studentAnswer: "안녕하세요.",
    keyMeaningPoints: [] as {
      id: string;
      description: string;
      weight: number;
    }[],
    acceptedExpressions: [] as string[],
    commonErrors: [] as string[],
    maxScore: 100,
    minimumPassScore: 70,
  };

  it("blocks empty", () => {
    const r = precheckStage4Answer({ ...base, studentAnswer: "  " });
    assert.notEqual(r, "ok");
    if (r !== "ok") assert.equal(r.score, 0);
  });

  it("flags english copy for review", () => {
    const r = precheckStage4Answer({
      ...base,
      studentAnswer: base.englishText,
    });
    assert.notEqual(r, "ok");
    if (r !== "ok") assert.equal(r.requiresTeacherReview, true);
  });
});

describe("validateStage4AiResult", () => {
  it("accepts valid json shape", () => {
    const input = {
      englishText: "x",
      modelTranslation: "모범",
      studentAnswer: "학생",
      keyMeaningPoints: [{ id: "m1", description: "핵심", weight: 100 }],
      acceptedExpressions: [],
      commonErrors: [],
      maxScore: 100,
      minimumPassScore: 70,
    };
    const ok = validateStage4AiResult(
      {
        score: 100,
        isPass: true,
        meaningResults: [
          {
            meaningPointId: "m1",
            status: "correct",
            earnedScore: 100,
            feedback: "좋음",
          },
        ],
        missingMeanings: [],
        mistranslations: [],
        naturalnessFeedback: "자연스러움",
        overallFeedback: "잘했습니다.",
        requiresTeacherReview: false,
      },
      input
    );
    assert.ok(ok);
    assert.equal(ok?.score, 100);
  });

  it("rejects large score mismatch", () => {
    const input = {
      englishText: "x",
      modelTranslation: "모범",
      studentAnswer: "학생",
      keyMeaningPoints: [{ id: "m1", description: "핵심", weight: 100 }],
      acceptedExpressions: [],
      commonErrors: [],
      maxScore: 100,
      minimumPassScore: 70,
    };
    const bad = validateStage4AiResult(
      {
        score: 90,
        isPass: true,
        meaningResults: [
          {
            meaningPointId: "m1",
            status: "correct",
            earnedScore: 40,
            feedback: "부분",
          },
        ],
        missingMeanings: [],
        mistranslations: [],
        naturalnessFeedback: "",
        overallFeedback: "x",
        requiresTeacherReview: false,
      },
      input
    );
    assert.equal(bad, null);
  });
});
