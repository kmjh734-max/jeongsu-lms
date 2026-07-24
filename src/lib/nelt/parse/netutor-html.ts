import type {
  NeltDraftDomain,
  NeltDraftGrammarItem,
  NeltExtractedDraft,
} from "@/lib/nelt/types-draft";
import {
  extractPercentFromProse,
  findAfter,
  findLabeledPercent,
  htmlToLines,
  normalizeLevelLabel,
  parseKoreanDate,
  parsePercent,
  parseScore,
  parseTopPercentile,
  parseVocabSize,
} from "@/lib/nelt/parse/html-text";

const DOMAIN_ORDER = [
  "vocabulary",
  "grammar",
  "listening",
  "reading",
] as const;

const DOMAIN_MARKERS: Record<(typeof DOMAIN_ORDER)[number], RegExp> = {
  vocabulary: /^어휘$/,
  grammar: /^문법$/,
  listening: /^듣기$/,
  reading: /^독해$/,
};

const DIFFICULTY_RE = /^[VGLR]\d{2}$/i;

function sliceDomainBlocks(lines: string[]): Record<string, string[]> {
  const starts: Array<{ key: (typeof DOMAIN_ORDER)[number]; index: number }> =
    [];

  for (let i = 0; i < lines.length; i++) {
    if (lines[i] !== "응시 정보") continue;
    // look back for domain title
    for (let j = i - 1; j >= Math.max(0, i - 5); j--) {
      for (const key of DOMAIN_ORDER) {
        if (DOMAIN_MARKERS[key].test(lines[j])) {
          starts.push({ key, index: j });
          break;
        }
      }
      break;
    }
  }

  const blocks: Record<string, string[]> = {};
  for (let s = 0; s < starts.length; s++) {
    const { key, index } = starts[s];
    const end = s + 1 < starts.length ? starts[s + 1].index : lines.length;
    blocks[key] = lines.slice(index, end);
  }
  return blocks;
}

function parseSubskills(block: string[]): NeltDraftDomain["subskills"] {
  const out: NeltDraftDomain["subskills"] = [];
  const idx = block.findIndex((l) => l.includes("평가 항목별 역량"));
  if (idx < 0) return out;
  const end = block.findIndex(
    (l, i) => i > idx && (l.includes("동일 레벨 대비") || l === "항목별 세부 역량")
  );
  const slice = block.slice(idx, end > idx ? end : idx + 80);

  // Pattern: name, description, student%, avg%
  for (let i = 0; i < slice.length - 3; i++) {
    const name = slice[i];
    const desc = slice[i + 1];
    const a = slice[i + 2];
    const b = slice[i + 3];
    if (!/%$/.test(a) || !/%$/.test(b)) continue;
    if (name.length < 2 || name.length > 40) continue;
    if (
      ["평가 항목", "역량", "나의", "정답률", "응시 레벨의", "평균 정답률"].includes(
        name
      )
    ) {
      continue;
    }
    if (!desc || desc.length < 4) continue;
    out.push({
      name,
      description: desc,
      studentAccuracy: parsePercent(a),
      levelAverageAccuracy: parsePercent(b),
    });
    i += 3;
  }
  return out;
}

function parseGrammarItems(block: string[]): NeltDraftGrammarItem[] {
  const out: NeltDraftGrammarItem[] = [];
  const idx = block.findIndex((l) => l.includes("항목별 세부 역량"));
  if (idx < 0) return out;
  const slice = block.slice(idx);
  // After headers 문법항목 / 세부 내용 / O/X
  let i = slice.findIndex((l) => l === "O/X");
  if (i < 0) i = 3;
  else i += 1;

  while (i + 2 < slice.length) {
    const category = slice[i];
    const detail = slice[i + 1];
    const ox = slice[i + 2];
    if (ox !== "O" && ox !== "X") {
      i += 1;
      continue;
    }
    if (!detail || detail.length < 2) {
      i += 1;
      continue;
    }
    out.push({
      category: category && category.length <= 20 ? category : null,
      detail,
      isCorrect: ox === "O",
    });
    i += 3;
  }
  return out;
}

function parseDomainBlock(
  key: (typeof DOMAIN_ORDER)[number],
  block: string[],
  durationSeconds: number | null
): NeltDraftDomain {
  const difficulty =
    block.find((l) => DIFFICULTY_RE.test(l))?.toUpperCase() ?? null;

  let rawScore: number | null = null;
  const scoreIdx = block.findIndex(
    (l) => l.includes("내 점수") || l === "나의 점수"
  );
  if (scoreIdx >= 0) {
    for (let j = scoreIdx; j < Math.min(block.length, scoreIdx + 5); j++) {
      const s = parseScore(block[j]);
      if (s != null) {
        rawScore = s;
        break;
      }
    }
  }

  const levelKeys: Record<string, string[]> = {
    vocabulary: ["Vocabulary 수준"],
    grammar: ["Grammar 수준"],
    listening: ["Listening 수준"],
    reading: ["Reading 수준"],
  };
  let evaluatedLevel: string | null = null;
  for (const label of levelKeys[key]) {
    const v = findAfter(block, label, { within: 3 });
    evaluatedLevel = normalizeLevelLabel(v);
    if (evaluatedLevel) break;
  }

  const percentile = parseTopPercentile(
    block.find((l) => l.includes("상위")) ?? null
  );

  let achievementGrade: string | null = null;
  const gradeIdx = block.findIndex((l) => l.includes("예상 등급"));
  if (gradeIdx >= 0) {
    achievementGrade = block[gradeIdx + 1] ?? null;
    if (achievementGrade && achievementGrade.length > 10) {
      achievementGrade = null;
    }
  }

  const summaryIdx = block.findIndex((l) => l === "역량 총평 및 비교");
  let evaluationSummary: string | null = null;
  if (summaryIdx >= 0) {
    const cand = block[summaryIdx + 1];
    if (cand && cand.length > 40) evaluationSummary = cand;
  }

  return {
    domain: key,
    difficultyCode: difficulty,
    rawScore,
    evaluatedLevel,
    percentile,
    durationSeconds,
    achievementGrade,
    evaluationSummary,
    subskills: parseSubskills(block),
  };
}

function parseDurations(lines: string[]): {
  total: number | null;
  byDomain: Partial<Record<(typeof DOMAIN_ORDER)[number], number>>;
} {
  const byDomain: Partial<Record<(typeof DOMAIN_ORDER)[number], number>> = {};
  let total: number | null = null;
  const idx = lines.findIndex((l) => l.includes("나의 소요 시간"));
  if (idx < 0) return { total, byDomain };
  const slice = lines.slice(idx, idx + 30);
  for (let i = 0; i < slice.length; i++) {
    if (slice[i] === "총" && /^\d+$/.test(slice[i + 1] ?? "")) {
      total = Number(slice[i + 1]);
    }
    if (slice[i] === "어휘" && /^\d+$/.test(slice[i + 2] ?? "")) {
      byDomain.vocabulary = Number(slice[i + 2]);
    }
    if (slice[i] === "문법" && /^\d+$/.test(slice[i + 2] ?? "")) {
      byDomain.grammar = Number(slice[i + 2]);
    }
    if (slice[i] === "듣기" && /^\d+$/.test(slice[i + 2] ?? "")) {
      byDomain.listening = Number(slice[i + 2]);
    }
    if (slice[i] === "독해" && /^\d+$/.test(slice[i + 2] ?? "")) {
      byDomain.reading = Number(slice[i + 2]);
    }
  }
  return { total, byDomain };
}

/**
 * NE Tutor NELT 공유 HTML → 추출 초안
 * 예: https://www.netutor.co.kr/s_url/?...
 */
export function parseNetutorNeltHtml(
  html: string,
  sourceUrl: string
): NeltExtractedDraft {
  const lines = htmlToLines(html);
  const needsReviewFields: string[] = [];

  const nameLine =
    lines.find((l) => l.startsWith("성명")) ??
    findAfter(lines, "응시자 정보", { within: 2 });
  let studentName: string | null = null;
  let studentGradeRaw: string | null = null;

  if (nameLine?.startsWith("성명")) {
    studentName = nameLine.replace(/^성명\s*:\s*/, "").trim() || null;
  } else if (nameLine && /\(/.test(nameLine)) {
    const m = nameLine.match(/^(.+?)\((.+)\)$/);
    if (m) {
      studentName = m[1].trim();
      studentGradeRaw = m[2].trim();
    }
  }

  const gradeLine = lines.find((l) => l.startsWith("학년"));
  if (gradeLine) {
    studentGradeRaw = gradeLine.replace(/^학년\s*:\s*/, "").trim();
  }

  const dateLine =
    findAfter(lines, "시험일자", { within: 2 }) ??
    lines.find((l) => l.startsWith("일자"));
  const testDate = parseKoreanDate(
    dateLine?.startsWith("일자")
      ? dateLine.replace(/^일자\s*:\s*/, "")
      : dateLine
  );

  const testName =
    findAfter(lines, "테스트 명", { within: 3 }) ??
    findAfter(lines, "테스트 명", { within: 5 });

  const overallLevelRaw = findAfter(lines, "종합 레벨", { within: 3 });
  const overallLevel = overallLevelRaw?.match(/Lv\.?\s*\d+/i)?.[0]
    ? overallLevelRaw.match(/Lv\.?\s*\d+/i)![0].replace(/\s+/g, " ")
    : overallLevelRaw;

  const overallBand = normalizeLevelLabel(
    findAfter(lines, "종합 수준", { within: 3 })
  );

  const overallPercentile = parseTopPercentile(
    lines.find(
      (l, i) =>
        l.includes("상위") &&
        i < 120 &&
        lines.slice(Math.max(0, i - 3), i + 1).some((x) => x.includes("석차"))
    ) ?? lines.find((l) => /상위\s*\d+%/.test(l)) ?? null
  );

  const { total, byDomain } = parseDurations(lines);
  const blocks = sliceDomainBlocks(lines);

  const domains: NeltDraftDomain[] = DOMAIN_ORDER.filter((k) => blocks[k]).map(
    (k) => parseDomainBlock(k, blocks[k], byDomain[k] ?? null)
  );

  const vocaBlock = blocks.vocabulary ?? [];
  const grammarBlock = blocks.grammar ?? [];
  const fullText = lines.join("\n");

  const vocabularySize =
    parseVocabSize(
      vocaBlock.find((l) => /약?\s*\d+\s*단어/.test(l)) ??
        findAfter(lines, "Vocabulary Size", { within: 4 })
    ) ??
    (() => {
      const m = fullText.match(/Vocabulary Size[\s\S]{0,40}?약?\s*([\d,]+)\s*단어/i);
      return m ? Number(m[1].replace(/,/g, "")) : null;
    })();

  let elementaryRequiredTotal: number | null = null;
  for (const line of [...vocaBlock, ...lines]) {
    const totalM = line.match(/초등\s*필수\s*어휘\s*([\d,]+)\s*개/);
    if (totalM) {
      elementaryRequiredTotal = Number(totalM[1].replace(/,/g, ""));
      break;
    }
  }
  if (elementaryRequiredTotal == null) {
    const m = fullText.match(/초등\s*필수\s*어휘\s*([\d,]+)\s*개/);
    if (m) elementaryRequiredTotal = Number(m[1].replace(/,/g, ""));
  }

  const vocabPctLabels = [
    "초등 필수 어휘",
    "필수 어휘 이해",
    "필수어휘",
    /초등\s*필수\s*어휘/,
    /필수\s*어휘\s*이해율?/,
  ];
  const elementaryRequiredPercentage =
    findLabeledPercent(vocaBlock, vocabPctLabels, { within: 8 }) ??
    findLabeledPercent(lines, vocabPctLabels, { within: 8 }) ??
    extractPercentFromProse(fullText, [
      /초등\s*필수\s*어휘[^%]{0,60}?약?\s*(\d+(?:\.\d+)?)\s*%/,
      /필수\s*어휘\s*이해율[^%]{0,30}?약?\s*(\d+(?:\.\d+)?)\s*%/,
      /필수\s*어휘\s*[\d,]+\s*개\s*중\s*약?\s*(\d+(?:\.\d+)?)\s*%/,
    ]);

  const csatLabels = [
    "수능 기출 어휘",
    "수능 기출",
    /수능\s*기출\s*어휘/,
    /최근\s*5개년\s*수능/,
  ];
  const csatVocabularyPercentage =
    findLabeledPercent(vocaBlock, csatLabels, { within: 8 }) ??
    findLabeledPercent(lines, csatLabels, { within: 8 }) ??
    extractPercentFromProse(fullText, [
      /수능\s*기출\s*어휘[^%]{0,40}?약?\s*(\d+(?:\.\d+)?)\s*%/,
      /최근\s*5개년\s*수능\s*기출\s*어휘의?\s*약?\s*(\d+(?:\.\d+)?)\s*%/,
    ]);

  const grammarPctLabels = [
    "초등 필수 문법",
    "필수 문법 이해",
    "필수문법",
    "필수 문법 항목",
    /초등\s*필수\s*문법/,
    /필수\s*문법\s*이해율?/,
    /필수\s*문법\s*항목/,
  ];
  const elementaryGrammarPercentage =
    findLabeledPercent(grammarBlock, grammarPctLabels, { within: 10 }) ??
    findLabeledPercent(lines, grammarPctLabels, { within: 10 }) ??
    extractPercentFromProse(fullText, [
      /초등\s*필수\s*문법[^%]{0,40}?약?\s*(\d+(?:\.\d+)?)\s*%/,
      /필수\s*문법\s*이해율[^%]{0,30}?약?\s*(\d+(?:\.\d+)?)\s*%/,
      /필수\s*문법\s*항목의?\s*약?\s*(\d+(?:\.\d+)?)\s*%/,
    ]);

  const grammarItems = parseGrammarItems(
    grammarBlock.length > 0 ? grammarBlock : lines
  );

  if (!studentName) needsReviewFields.push("studentName");
  if (!testDate) needsReviewFields.push("testDate");
  if (domains.length < 4) needsReviewFields.push("domains");

  let confidence = 0.4;
  if (studentName) confidence += 0.15;
  if (testDate) confidence += 0.1;
  if (overallLevel) confidence += 0.1;
  if (domains.length >= 4) confidence += 0.15;
  if (vocabularySize) confidence += 0.05;
  if (elementaryRequiredPercentage != null) confidence += 0.03;
  if (elementaryGrammarPercentage != null) confidence += 0.03;
  if (grammarItems.length > 0) confidence += 0.05;

  return {
    studentName,
    studentGradeRaw,
    testDate,
    testName: testName && testName.length < 80 ? testName : "NELT",
    overallLevel: overallLevel ?? null,
    overallBand,
    overallPercentile,
    totalDurationSeconds: total,
    domains,
    vocabulary: {
      vocabularySize,
      elementaryRequiredTotal,
      elementaryRequiredPercentage,
      csatVocabularyPercentage,
    },
    grammar: {
      elementaryGrammarPercentage,
      items: grammarItems,
    },
    sourceUrl,
    extractionConfidence: Math.min(0.98, confidence),
    needsReviewFields,
    rawTextPreview: lines.slice(0, 80).join("\n"),
  };
}

export function isLikelyNetutorNeltHtml(html: string): boolean {
  // Real NELT pages put JS/CSS first; markers like "응시자 정보" often appear after 50KB.
  // Prefer stripped text lines so we don't miss body content.
  const text = htmlToLines(html).slice(0, 400).join("\n");
  const haystack = text.length >= 40 ? text : html;
  const hasNelt = /NELT/i.test(haystack) || /NELT/i.test(html);
  if (!hasNelt) return false;
  return (
    /netutor|nelt\.co\.kr|Neungyule|능률/i.test(haystack) ||
    haystack.includes("응시자 정보") ||
    haystack.includes("Vocabulary Size") ||
    haystack.includes("종합 레벨") ||
    haystack.includes("성적표") ||
    /netutor|nelt\.co\.kr|Neungyule/i.test(html) ||
    html.includes("응시자 정보") ||
    html.includes("Vocabulary Size") ||
    html.includes("종합 레벨")
  );
}
