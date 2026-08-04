import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  blankInputSizeHint,
  compareKoreanBlankAnswer,
  isBlankPunctuationOnly,
  normalizeKoreanBlankAnswer,
} from "./korean-blank-normalize.js";

describe("normalizeKoreanBlankAnswer", () => {
  it("trims and collapses spaces", () => {
    assert.equal(normalizeKoreanBlankAnswer("  쓰  레기  "), "쓰 레기");
  });

  it("applies NFC", () => {
    const nfd = "허가되".normalize("NFD");
    assert.equal(
      normalizeKoreanBlankAnswer(nfd),
      "허가되".normalize("NFC")
    );
  });

  it("strips newlines/tabs", () => {
    assert.equal(normalizeKoreanBlankAnswer("쓰\n레\t기"), "쓰 레 기");
  });

  it("flexible spacing removes spaces", () => {
    assert.equal(
      normalizeKoreanBlankAnswer("쓰 레 기", { flexibleSpacing: true }),
      "쓰레기"
    );
  });
});

describe("compareKoreanBlankAnswer", () => {
  it("exact match", () => {
    assert.equal(compareKoreanBlankAnswer("쓰레기", "쓰레기"), true);
  });

  it("rejects synonym by default", () => {
    assert.equal(compareKoreanBlankAnswer("폐기물", "쓰레기"), false);
  });

  it("accepts acceptedAnswers", () => {
    assert.equal(
      compareKoreanBlankAnswer("폐기물", "쓰레기", ["폐기물"]),
      true
    );
  });

  it("rejects particle attached", () => {
    assert.equal(compareKoreanBlankAnswer("쓰레기를", "쓰레기"), false);
  });

  it("rejects spaced variant unless flexible", () => {
    assert.equal(compareKoreanBlankAnswer("쓰 레 기", "쓰레기"), false);
    assert.equal(
      compareKoreanBlankAnswer("쓰 레 기", "쓰레기", [], {
        flexibleSpacing: true,
      }),
      true
    );
  });

  it("empty is incorrect", () => {
    assert.equal(compareKoreanBlankAnswer("  ", "쓰레기"), false);
  });
});

describe("isBlankPunctuationOnly", () => {
  it("detects punctuation", () => {
    assert.equal(isBlankPunctuationOnly("..."), true);
    assert.equal(isBlankPunctuationOnly("허가"), false);
  });
});

describe("blankInputSizeHint", () => {
  it("buckets without exposing exact length", () => {
    assert.equal(blankInputSizeHint(1), "sm");
    assert.equal(blankInputSizeHint(4), "md");
    assert.equal(blankInputSizeHint(9), "lg");
  });
});
