import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  compareEnglishBlankAnswer,
  isEnglishBlankPunctuationOnly,
  isPartialWordCut,
  normalizeEnglishBlankAnswer,
  normalizeEnglishQuotes,
} from "./english-blank-normalize.js";

describe("normalizeEnglishQuotes", () => {
  it("normalizes smart apostrophe", () => {
    assert.equal(normalizeEnglishQuotes("it’s"), "it's");
  });
});

describe("normalizeEnglishBlankAnswer", () => {
  it("collapses spaces and NFC", () => {
    assert.equal(normalizeEnglishBlankAnswer("  bus   stops  "), "bus stops");
  });

  it("lowercases by default", () => {
    assert.equal(normalizeEnglishBlankAnswer("Dumping"), "dumping");
  });

  it("keeps case when caseSensitive", () => {
    assert.equal(
      normalizeEnglishBlankAnswer("Dumping", { caseSensitive: true }),
      "Dumping"
    );
  });
});

describe("compareEnglishBlankAnswer", () => {
  it("matches word ignoring case", () => {
    assert.equal(compareEnglishBlankAnswer("Dumping", "dumping"), true);
  });

  it("rejects dump vs dumping", () => {
    assert.equal(compareEnglishBlankAnswer("dump", "dumping"), false);
  });

  it("matches multi-word with extra spaces when ignoreExtraSpaces", () => {
    assert.equal(
      compareEnglishBlankAnswer("bus  stops", "bus stops", [], {
        ignoreExtraSpaces: true,
      }),
      true
    );
  });

  it("rejects bus stop vs bus stops", () => {
    assert.equal(compareEnglishBlankAnswer("bus stop", "bus stops"), false);
  });

  it("matches smart apostrophe it’s / it's", () => {
    assert.equal(compareEnglishBlankAnswer("it's", "it’s"), true);
  });

  it("does not auto-accept it is for it’s", () => {
    assert.equal(compareEnglishBlankAnswer("it is", "it’s"), false);
  });

  it("does not auto-accept neighbourhood", () => {
    assert.equal(
      compareEnglishBlankAnswer("neighbourhood", "neighborhood"),
      false
    );
  });

  it("accepts acceptedAnswers", () => {
    assert.equal(
      compareEnglishBlankAnswer("neighbourhood", "neighborhood", [
        "neighbourhood",
      ]),
      true
    );
  });

  it("caseSensitive rejects Dumping for dumping", () => {
    assert.equal(
      compareEnglishBlankAnswer("Dumping", "dumping", [], {
        caseSensitive: true,
      }),
      false
    );
  });
});

describe("isEnglishBlankPunctuationOnly", () => {
  it("detects punctuation", () => {
    assert.equal(isEnglishBlankPunctuationOnly("..."), true);
    assert.equal(isEnglishBlankPunctuationOnly("waste"), false);
  });
});

describe("isPartialWordCut", () => {
  it("detects mid-word cut", () => {
    const t = "permitted";
    assert.equal(isPartialWordCut(t, 3, 6), true); // mit
    assert.equal(isPartialWordCut(t, 0, 9), false);
  });
});
