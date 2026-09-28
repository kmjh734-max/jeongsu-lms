/**
 * 시험지의 "수준"을 잰다.
 *
 * 선생님 요청(2026-09-28): 내신을 분석할 때 수준을 정확하게 파악하면 좋겠다.
 * 보기 문장 수준이라든가 단어 수준을. 그게 동형모의고사에 반영되면 좋겠다.
 *
 * 재는 것을 둘로 나눈다.
 *  - 여기(코드): 글에서 바로 셀 수 있는 것. 문장 수, 평균 문장 길이, 보기 평균 낱말 수,
 *    긴 낱말(3음절 이상) 비율. 같은 글이면 언제나 같은 값이 나온다.
 *  - 모델: 어휘 등급("고1 교과서", "수능", "수능 이상")처럼 세어서는 알 수 없는 것.
 *
 * 렉사일은 정식 측정값을 만들 수 없다(Lexile은 MetaMetrics의 측정이다). 대신 렉사일이
 * 쓰는 두 축 — 문장 길이와 낱말 난도 — 로 어림한 값을 내고, 화면에도 "추정"이라고 적는다.
 */

/** 영어 문장으로 끊는다. 약어(Mr. Dr. etc.)에서 잘못 끊기지 않게 한다. */
export function splitSentences(text: string): string[] {
  // 약어의 마침표를 잠깐 다른 글자로 바꿔 둔다. 제어 문자는 쓰지 않는다(린트가 막는다).
  const DOT = "․"; // ONE DOT LEADER — 보통 글에는 나오지 않는다
  const guarded = text
    .replace(/\b(Mr|Mrs|Ms|Dr|Prof|St|vs|etc|e\.g|i\.e)\./gi, (m) => m.replace(".", DOT))
    .replace(/\b([A-Z])\./g, `$1${DOT}`);
  return guarded
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.split(DOT).join(".").trim())
    .filter((s) => /[A-Za-z]/.test(s));
}

export function words(text: string): string[] {
  return (text.match(/[A-Za-z][A-Za-z'-]*/g) ?? []).map((w) => w.toLowerCase());
}

/**
 * 영어 낱말의 음절 수를 센다(어림). 렉사일·플레시 계열이 쓰는 방식과 같은 얼개다.
 * 정확한 사전 음절수는 아니지만, 같은 규칙을 모든 글에 똑같이 적용하므로 견주는 데는 쓸 수 있다.
 */
export function syllables(word: string): number {
  const w = word.toLowerCase().replace(/[^a-z]/g, "");
  if (w.length <= 3) return 1;
  const trimmed = w
    .replace(/(?:[^laeiouy]es|ed|[^laeiouy]e)$/, "")
    .replace(/^y/, "")
    // copying, studying처럼 y 다음에 모음이 오면 y는 따로 센다(co-py-ing)
    .replace(/y(?=[aeiou])/g, "y ");
  const groups = trimmed.match(/[aeiouy]{1,2}/g);
  return Math.max(1, groups?.length ?? 1);
}

export type TextMeasure = {
  /** 낱말 수 */
  wordCount: number;
  /** 문장 수 */
  sentenceCount: number;
  /** 평균 문장 길이(낱말) */
  sentenceWords: number;
  /** 3음절 이상 낱말 비율(0~1) */
  hardWordRatio: number;
  /** 어림한 렉사일. 글이 너무 짧으면 null */
  lexile: number | null;
};

/**
 * 어림 렉사일.
 *
 * 렉사일은 문장 길이(구문 부담)와 낱말 빈도(어휘 부담) 두 축으로 잰다. 낱말 빈도표가 없으므로
 * 긴 낱말 비율을 어휘 부담의 대리로 쓴다. 수능·고교 지문(평균 문장 18~22낱말, 긴 낱말 20~28%)이
 * 대개 1000~1200L로 나오도록 맞췄다. 정식 측정값이 아니므로 100 단위로 끊어 보여 준다.
 */
export function estimateLexile(m: { sentenceWords: number; hardWordRatio: number; wordCount: number }): number | null {
  if (m.wordCount < 40 || m.sentenceWords <= 0) return null;
  const raw = 180 + 34 * m.sentenceWords + 1250 * m.hardWordRatio;
  const clamped = Math.max(200, Math.min(1600, raw));
  return Math.round(clamped / 50) * 50;
}

export function measureText(text: string): TextMeasure {
  const ws = words(text);
  const ss = splitSentences(text);
  const wordCount = ws.length;
  const sentenceCount = Math.max(1, ss.length);
  const sentenceWords = wordCount === 0 ? 0 : Math.round((wordCount / sentenceCount) * 10) / 10;
  const hard = ws.filter((w) => syllables(w) >= 3).length;
  const hardWordRatio = wordCount === 0 ? 0 : Math.round((hard / wordCount) * 1000) / 1000;
  return {
    wordCount,
    sentenceCount,
    sentenceWords,
    hardWordRatio,
    lexile: estimateLexile({ sentenceWords, hardWordRatio, wordCount }),
  };
}

export type ChoiceMeasure = {
  lang: "en" | "ko" | "mixed";
  /** 선택지 하나의 평균 낱말 수(영어일 때만; 한글이면 0) */
  avgWords: number;
};

/** 선택지 다섯 개의 수준. 한글 선택지는 낱말 수를 재지 않는다. */
export function measureChoices(choices: string[]): ChoiceMeasure {
  const clean = choices.map((c) => String(c ?? "").trim()).filter(Boolean);
  if (clean.length === 0) return { lang: "ko", avgWords: 0 };
  const hasKo = clean.some((c) => /[가-힣]/.test(c));
  const hasEn = clean.some((c) => /[A-Za-z]{2,}/.test(c));
  const lang: ChoiceMeasure["lang"] = hasKo && hasEn ? "mixed" : hasKo ? "ko" : "en";
  if (lang === "ko") return { lang, avgWords: 0 };
  const counts = clean.map((c) => words(c).length).filter((n) => n > 0);
  const avg = counts.length === 0 ? 0 : counts.reduce((a, b) => a + b, 0) / counts.length;
  return { lang, avgWords: Math.round(avg * 10) / 10 };
}

/** 여러 값의 가운데값(하나도 없으면 null) */
export function median(values: number[]): number | null {
  const v = values.filter((n) => Number.isFinite(n)).sort((a, b) => a - b);
  if (v.length === 0) return null;
  const mid = Math.floor(v.length / 2);
  return v.length % 2 ? v[mid]! : Math.round(((v[mid - 1]! + v[mid]!) / 2) * 10) / 10;
}

/**
 * 동형모의고사를 만들 때 넘길 한 문단. 새 지문이 원래 시험지와 같은 수준으로 나오게 한다.
 * 잴 수 없었던 값은 넣지 않는다(빈 값을 지어내지 않는다).
 */
export function levelBriefFor(level: {
  sentenceWords?: number | null;
  choiceWords?: number | null;
  lexile?: number | null;
  vocabLevel?: string | null;
  passageWords?: number | null;
}): string {
  const lines: string[] = [];
  if (level.passageWords) lines.push(`지문 길이: 약 ${Math.round(level.passageWords)}낱말`);
  if (level.sentenceWords) lines.push(`평균 문장 길이: ${level.sentenceWords}낱말`);
  if (level.choiceWords) lines.push(`영어 선택지 평균 길이: ${level.choiceWords}낱말`);
  const band = readingBand(level.lexile);
  if (band) lines.push(`읽기 수준: ${band} 정도`);
  if (level.vocabLevel) lines.push(`어휘 수준: ${level.vocabLevel}`);
  if (lines.length === 0) return "";
  return [
    "원래 시험지의 수준이다. 새로 쓰는 지문과 선택지를 이 수준에 맞춘다.",
    ...lines.map((l) => `- ${l}`),
    "평균 문장 길이는 ±2낱말, 선택지 길이는 ±3낱말 안에서 맞춘다.",
    "더 쉽게 쓰지도, 더 어렵게 쓰지도 않는다. 어휘도 위 수준에 맞춘다.",
  ].join("\n");
}

/**
 * 읽어 둔 시험지 글자에서 시험 한 벌의 수준을 잰다.
 *
 * 모델에게 더 묻지 않는다. 쪽 글자(school_exam_pages)에 지문도 선택지도 다 있으므로
 * 여기서 갈라 재면 된다 — 값이 더 들지 않고, 같은 시험지면 언제나 같은 값이 나온다.
 *
 * 갈라내는 법
 *  - 선택지: 줄 맨 앞이 ①~⑤ 인 줄.
 *  - 발문·해설: 한글이 절반 넘는 줄은 지문이 아니다.
 *  - 지문: 나머지 가운데 영어 낱말이 5개 이상인 줄.
 */
export function measureExamPages(pageTexts: string[]): {
  passage: TextMeasure;
  choice: ChoiceMeasure;
} {
  const choiceLines: string[] = [];
  const passageLines: string[] = [];

  for (const page of pageTexts) {
    for (const rawLine of String(page ?? "").split(/\r?\n/)) {
      const line = rawLine.trim();
      if (!line) continue;
      if (/^[①②③④⑤]/.test(line)) {
        choiceLines.push(line.replace(/^[①②③④⑤]\s*/, ""));
        continue;
      }
      const ko = (line.match(/[가-힣]/g) ?? []).length;
      const en = (line.match(/[A-Za-z]/g) ?? []).length;
      if (ko > en) continue; // 발문·지시문·해설
      if (words(line).length < 5) continue; // 제목·번호 줄
      passageLines.push(line);
    }
  }

  return {
    passage: measureText(passageLines.join(" ")),
    choice: measureChoices(choiceLines),
  };
}

/**
 * 어림한 값을 선생님이 쓰는 말로 바꾼다.
 *
 * 선생님 말(2026-09-28): "렉사일이 별로면 빼도 돼."
 * 숫자를 그대로 내보이면 정식 렉사일로 오해하기 쉽다. 재는 것은 그대로 두되,
 * 화면과 프롬프트에는 학년 수준으로만 적는다.
 */
export function readingBand(lexile: number | null | undefined): string | null {
  if (!lexile) return null;
  if (lexile < 800) return "중3 이하";
  if (lexile < 950) return "고1";
  if (lexile < 1100) return "고2";
  if (lexile < 1250) return "수능";
  return "수능 이상";
}
