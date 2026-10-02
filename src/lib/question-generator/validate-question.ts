import { VALIDATION_PASS_SCORE } from "@/lib/question-generator/constants";
import type {
  GeneratedQuestionPayload,
  QuestionTypeOption,
  QuestionValidation,
} from "@/lib/question-generator/types";
import { validateVocabularyConsistency } from "@/lib/question-generator/vocabulary-consistency";
import {
  scrubWordBankNoise,
  splitWordBank,
  tokenizeAnswerPhrase,
} from "@/lib/question-generator/word-order-normalize";

/** 밑줄 태그·기호·빈칸을 걷어 내고 따옴표를 통일한 본문 */
function plainText(text: string): string {
  return String(text ?? "")
    .replace(/<\/?u>/g, "")
    .replace(/<\/?b>/gi, "")
    .replace(/\*\*/g, "")
    .replace(/[ⓐ-ⓩ①-⑳]/g, " ")
    .replace(/_{3,}/g, " ")
    .replace(/[’‘]/g, "'")
    .replace(/[“”]/g, '"')
    .replace(/\s+/g, " ")
    .trim();
}

/** 영어 문장 단위(짧은 조각은 뺀다) */
function sentencesOf(text: string): string[] {
  return plainText(text)
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => s.length > 15);
}

function wordCount(text: string): number {
  return plainText(text).split(/\s+/).filter(Boolean).length;
}

/** 지문에서 낱말만 뽑아 센다(밑줄 기호·문장부호는 뺀다) */
function passageWords(text: string): string[] {
  return (text || "")
    .replace(/<\/?u>/g, " ")
    .replace(/[ⓐ-ⓩ①-⑳]/g, " ")
    .toLowerCase()
    .replace(/[^a-z' ]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

/**
 * 어법·어휘는 지문을 다시 쓰면 안 된다(선생님 지적 2026-09-20: "어법 개수가 지문을 재진술한다").
 * 밑줄 자리의 낱말만 바뀌어야 하므로, 원문 낱말이 그대로 남은 비율로 가린다.
 * 재진술을 켜고 만든 문항은 이 검사를 건너뛴다.
 */
export function passageKeptRatio(original: string, modified: string): number {
  const a = passageWords(original);
  const b = passageWords(modified);
  if (a.length < 20 || b.length < 20) return 1;
  const bag = new Map<string, number>();
  for (const w of a) bag.set(w, (bag.get(w) ?? 0) + 1);
  let same = 0;
  for (const w of b) {
    const n = bag.get(w) ?? 0;
    if (n > 0) {
      same++;
      bag.set(w, n - 1);
    }
  }
  return same / b.length;
}

/** 어법·어휘에서 지문을 그대로 두었다고 볼 최저선(밑줄 6곳이 바뀌어도 넘는 값) */
export const PASSAGE_KEEP_MIN = 0.9;

/** 로컬 형태 검수만 (AI 검수 호출 없음 — 속도 우선) */
export function validateGeneratedQuestion(opts: {
  passage: string;
  option: QuestionTypeOption;
  question: GeneratedQuestionPayload;
  /** 지문 재진술을 켜고 만든 문항이면 원문 대조를 건너뛴다 */
  allowParaphrase?: boolean;
}): QuestionValidation {
  const q = opts.question;
  const option = opts.option;
  const warnings: string[] = [];
  let score = 100;

  if (option.isObjective) {
    const slotInPassage =
      option.type === "sentence_insertion" ||
      option.type === "irrelevant_sentence" ||
      (option.type === "vocabulary" && option.aingkaCode === "어휘추론") ||
      // 어법 추론: 밑줄 ①~⑤가 지문 안에 있고 아래 보기는 없다
      (option.type === "grammar" &&
        (option.aingkaCode === "어법추론" || option.aingkaCode === "어법모두고르기"));

    if (slotInPassage) {
      if (option.type === "grammar") {
        const marks = (q.passageModified ?? "").match(/[①②③④⑤ⓐⓑⓒⓓⓔ]/g) ?? [];
        if (new Set(marks).size < 5) {
          warnings.push("지문에 밑줄 번호 5개가 없습니다.");
          score -= 40;
        }
      }
      if (
        option.type === "sentence_insertion" &&
        !(q.questionText || "").trim()
      ) {
        warnings.push("주어진 문장이 없습니다.");
        score -= 40;
      }
    } else if (!q.choices || q.choices.length !== 5) {
      warnings.push("선택지 개수가 5개가 아닙니다.");
      score -= 40;
    }

    const nums = new Set((q.choices ?? []).map((c) => c.number));
    if (!slotInPassage && nums.size !== (q.choices?.length ?? 0)) {
      warnings.push("선택지 번호가 중복되었습니다.");
      score -= 15;
    }
    if (!slotInPassage) {
      const empty = (q.choices ?? []).some((c) => !c.text.trim());
      if (empty) {
        warnings.push("빈 선택지가 있습니다.");
        score -= 20;
      }
    }

    // 개수형: 1개~5개 고정 검증
    if (
      (option.type === "grammar" && option.aingkaCode === "어법개수") ||
      (option.type === "vocabulary" && option.aingkaCode === "어휘개수")
    ) {
      const texts = (q.choices ?? []).map((c) => c.text.trim());
      if (texts.join("|") !== "1개|2개|3개|4개|5개") {
        warnings.push("개수 보기가 1개~5개 형식이 아닙니다.");
        score -= 40;
      }
    }
  }

  // 어법·어휘: 밑줄 자리 말고 지문을 고쳐 쓰면 버린다
  if (
    !opts.allowParaphrase &&
    (option.type === "grammar" || option.type === "vocabulary") &&
    (q.passageModified ?? "").trim()
  ) {
    const kept = passageKeptRatio(opts.passage, q.passageModified ?? "");
    if (kept < PASSAGE_KEEP_MIN) {
      warnings.push(`지문을 고쳐 썼습니다(원문 유지 ${Math.round(kept * 100)}%). 원문 그대로 다시 만듭니다.`);
      score -= 45;
    } else {
      /*
       * 낱말 주머니 90%로는 못 잡는 것이 있다(100문항 대조 2026-10-02).
       * 170낱말 지문에 12낱말짜리 가정법 문장을 새로 끼워 넣어도 93%라 통과했고,
       * 원문 한 절을 14낱말짜리 구문으로 바꿔 밑줄을 쳐도 통과했다.
       * 밑줄 하나하나를 원문과 견주고, 문장 수가 늘었는지 본다.
       */
      const original = plainText(opts.passage);
      const foreign = [...String(q.passageModified).matchAll(/<u>([\s\S]*?)<\/u>/g)]
        .map((m) => plainText(m[1] ?? ""))
        // 여섯 낱말부터 잡는다 — 「keep their children mildly supervise」(목적격보어, 다섯 낱말)는 정상이었다
        .filter((u) => u && !original.includes(u) && wordCount(u) > 5);
      if (foreign.length > 0) {
        warnings.push(
          `밑줄이 원문과 다르게 길게 고쳐졌습니다: "${foreign[0]!.slice(0, 40)}". 원문 낱말 한두 개만 바꿔야 합니다.`
        );
        score -= 45;
      } else if (sentencesOf(q.passageModified ?? "").length > sentencesOf(opts.passage).length) {
        warnings.push("원문에 없는 문장을 지문에 넣었습니다. 원문 문장 안에서만 밑줄을 쳐야 합니다.");
        score -= 45;
      }
    }
  }

  /*
   * 아래 넷은 100문항 대조(2026-10-02)에서 검수기가 못 잡던 꼴이다.
   */
  const modifiedText = String(q.passageModified ?? "");
  const code = option.aingkaCode ?? "";
  const answerStr = typeof q.correctAnswer === "string" ? q.correctAnswer : "";

  // 빈칸추론: 원문 문장을 비운 것이 아니라 새 문장을 끼워 넣음 (#23·#72)
  if (option.type === "sentence_blank" && code !== "연결어빈칸" && /_{3,}/.test(modifiedText)) {
    const modPlain = plainText(modifiedText);
    const removed = sentencesOf(opts.passage).filter((s) => !modPlain.includes(s));
    if (removed.length === 0) {
      warnings.push("원문 문장을 비우지 않고 새 문장을 끼워 넣었습니다. 원문 문장 하나를 빈칸으로 바꿔야 합니다.");
      score -= 45;
    }
  }

  // 문장삽입: 번호 두 개 사이에 문장이 없어 같은 자리가 됨 (#98 「③ ④ If hip-hop…」)
  if (option.type === "sentence_insertion" && modifiedText) {
    const segments = modifiedText.replace(/<\/?u>/g, "").split(/[①②③④⑤]/);
    if (segments.length >= 3) {
      const between = segments.slice(1, -1);
      const empty = between.findIndex((s) => wordCount(s) < 3);
      if (empty >= 0) {
        const marks = "①②③④⑤";
        warnings.push(`삽입 자리 ${marks[empty]}과 ${marks[empty + 1]} 사이에 문장이 없습니다. 자리마다 문장이 있어야 합니다.`);
        score -= 45;
      }
    }
  }

  // 요약문 2·3단어: ⓐ 말고 다른 빈칸은 1~2단어여야 한다 (#74 「expand their territory」)
  if (option.type === "summary_short" && /요약문빈칸[23]단어$/.test(code) && answerStr) {
    for (const m of answerStr.matchAll(/([ⓑ-ⓔ])\s*[:：]\s*([^/]+)/g)) {
      const n = wordCount(m[2] ?? "");
      if (n > 2) {
        warnings.push(`${m[1]} 답이 ${n}단어입니다. ⓐ 말고 다른 빈칸은 본문 1~2단어여야 합니다.`);
        score -= 45;
        break;
      }
    }
  }

  // 제시어 배열(지문 그대로): 원문 문장을 하나만 비워야 한다 (#82는 두 문장을 지웠다).
  // 조건 영작은 문장을 고쳐 써서 내므로 원문 문장이 빠지는 것이 정상이라 여기서 보지 않는다.
  if (/제시어배열/.test(code) && /_{3,}/.test(modifiedText)) {
    const modPlain = plainText(modifiedText);
    const removed = sentencesOf(opts.passage).filter((s) => !modPlain.includes(s));
    if (removed.length >= 2) {
      warnings.push(`원문 문장을 ${removed.length}개 지웠습니다. 빈칸으로 비울 문장 하나만 지워야 합니다.`);
      score -= 45;
    }
  }

  // 어형변화: 보기가 정답 꼴 그대로면 바꿀 어형이 없다 (#37 aren't·is가 보기에 그대로)
  if (code === "제시어배열어형변화") {
    const bankLine = (q.questionText ?? "").match(/<보기>\s*\n?([^\n]+)/)?.[1] ?? "";
    const bank = splitWordBank(scrubWordBankNoise(bankLine)).map((t) => t.toLowerCase());
    const answerTokens = tokenizeAnswerPhrase(String(q.correctAnswer ?? "")).map((t) => t.toLowerCase());
    if (bank.length > 0 && bank.length === answerTokens.length) {
      const sorted = (a: string[]) => [...a].sort().join("\u0001");
      if (sorted(bank) === sorted(answerTokens)) {
        warnings.push("어형변화 유형인데 보기가 정답 꼴 그대로라 바꿀 어형이 없습니다. 보기는 원형으로 주어야 합니다.");
        score -= 45;
      }
    }
  }

  /*
   * 아래는 382문항 전수 대조(2026-10-02, 선생님이 새로 만든 작업)에서 나온 꼴이다.
   */
  const originalPlain = plainText(opts.passage);

  // 문장삽입: 번호가 문장 중간에 찍힘(#46 「leaves, ④ chew them」), 하 난이도인데 원문에 없는 문장을 넣음(#145)
  if (option.type === "sentence_insertion" && modifiedText) {
    const body = modifiedText.replace(/<\/?[ub]>/gi, "");
    const midSentence = [...body.matchAll(/[①②③④⑤]/g)].find((m) => {
      const before = body.slice(0, m.index).replace(/\s+$/, "");
      if (!before) return false;
      return !/[.!?]["'’”)]*$/.test(before);
    });
    if (midSentence) {
      warnings.push(`삽입 자리 ${midSentence[0]}가 문장 중간에 있습니다. 번호는 문장과 문장 사이에만 둡니다.`);
      score -= 45;
    } else if (!opts.allowParaphrase && option.difficulty === "low") {
      const origN = sentencesOf(opts.passage).length;
      const modN = sentencesOf(modifiedText).length;
      if (origN >= 3 && modN > origN - 1) {
        warnings.push("원문에 없는 문장을 지문에 넣었습니다. 주어진 문장만 빼고 나머지는 원문 그대로 둡니다.");
        score -= 45;
      }
    }
  }

  // 어법 문장 수정: 정답으로 적은 번호의 문장이 원문과 같다 = 오류를 심지 않았다 (#124 「정답을 구성할 수 없다」, #219 번호 밀림)
  if (code === "어법문장오류수정" && !opts.allowParaphrase && modifiedText && answerStr) {
    const body = modifiedText.replace(/<\/?[ub]>/gi, "");
    const segments = new Map<string, string>();
    const parts = body.split(/([①②③④⑤])/);
    for (let i = 1; i < parts.length; i += 2) segments.set(parts[i]!, plainText(parts[i + 1] ?? ""));
    for (const m of answerStr.matchAll(/([①②③④⑤])\s*[:：]/g)) {
      const seg = segments.get(m[1]!);
      if (seg && seg.length > 10 && originalPlain.includes(seg)) {
        warnings.push(`정답 ${m[1]}의 문장이 원문과 같습니다. 그 문장에 틀린 곳이 없습니다.`);
        score -= 45;
        break;
      }
    }
  }

  // 어법 수정 2·3: 밑줄 수가 발문(ⓐ~ⓔ / ⓐ~ⓖ)과 다름 (#220 7개, #221 5개)
  if (code === "어법오류수정2" || code === "어법오류수정3") {
    const n = (modifiedText.match(/<u>/gi) ?? []).length;
    const need = code === "어법오류수정2" ? 5 : 7;
    if (n > 0 && n !== need) {
      warnings.push(`밑줄이 ${n}개입니다. ${code === "어법오류수정2" ? "ⓐ~ⓔ 다섯" : "ⓐ~ⓖ 일곱"} 개여야 합니다.`);
      score -= 45;
    }
  }

  /*
   * 밑줄마다 앞뒤 두 낱말을 붙여 원문과 견준다. 바뀐 밑줄의 자리와 수가 정답과 맞아야 한다.
   *  - 어법추론·어휘추론: 바뀐 밑줄이 하나뿐이고 그 번호가 정답 (#224는 ④를 바꾸고 정답을 3이라 했다)
   *  - 어법개수·어휘개수: 바뀐 밑줄 수 = 정답 개수
   * 바뀐 낱말이 지문 다른 곳에 우연히 있어도 앞뒤 낱말까지 보면 가려진다.
   */
  if (
    !opts.allowParaphrase &&
    (option.type === "grammar" || option.type === "vocabulary") &&
    /(어법추론|어휘추론|어법개수|어휘개수)$/.test(code) &&
    modifiedText
  ) {
    const windows = [...modifiedText.matchAll(
      /((?:[A-Za-z’'-]+[\s,;:]+){0,2})(?:[ⓐ-ⓖ①-⑤]\s*)?<u>([\s\S]*?)<\/u>((?:[\s,;:]+[A-Za-z’'-]+){0,2})/g
    )];
    const changed = windows
      .map((m, i) => ({ i, text: plainText(`${m[1] ?? ""}${m[2] ?? ""}${m[3] ?? ""}`) }))
      .filter((w) => w.text && !originalPlain.includes(w.text));
    const no = Number(q.correctAnswer);
    if (/추론$/.test(code) && windows.length >= 4) {
      if (changed.length !== 1) {
        warnings.push(`원문과 다른 밑줄이 ${changed.length}개입니다. 하나만 바꿔야 합니다.`);
        score -= 45;
      } else if (Number.isFinite(no) && changed[0]!.i + 1 !== no) {
        warnings.push(`바뀐 밑줄은 ${changed[0]!.i + 1}번인데 정답은 ${no}번입니다.`);
        score -= 45;
      }
    } else if (/개수$/.test(code) && windows.length >= 4 && Number.isFinite(no) && changed.length !== no) {
      warnings.push(`원문과 다른 밑줄이 ${changed.length}개인데 정답은 ${no}개입니다.`);
      score -= 45;
    }
    // 어휘는 낱말 하나를 바꾸는 유형이다 — 「carry away from the nest」처럼 구를 통째로 바꾸면 어휘 문항이 아니다 (#86)
    if (option.type === "vocabulary") {
      const long = windows.find((m) => wordCount(m[2] ?? "") > 2);
      if (long) {
        warnings.push(`어휘 밑줄 "${plainText(long[2] ?? "").slice(0, 30)}"이 세 낱말 넘습니다. 낱말 하나(많아야 둘)만 밑줄 칩니다.`);
        score -= 45;
      }
    }
  }

  // 빈칸추론: 두 보기가 말만 바꾼 같은 뜻이면 정답이 둘이다 (#139 「limits … apparent」 vs 「shortcomings … clear」)
  if (option.type === "sentence_blank" && Array.isArray(q.choices) && q.choices.length >= 5) {
    const bag = (s: string) =>
      new Set(
        plainText(s)
          .toLowerCase()
          .replace(/[^a-z' ]/g, " ")
          .split(/\s+/)
          .filter((w) => w.length >= 3)
      );
    const bags = q.choices.map((c) => bag(String(c?.text ?? "")));
    // 「not·only·less」 같은 말 하나로 뜻이 뒤집히는 보기는 같은 말이 아니다 (#233 「matter」 vs 「do not matter」)
    const POLARITY = /^(not|no|never|only|less|least|fewer|little|more|most|without|rather|instead|hardly|cannot|unlike|merely|although|despite|secondary|equally)$/;
    outer: for (let a = 0; a < bags.length; a++) {
      for (let b = a + 1; b < bags.length; b++) {
        const A = bags[a]!;
        const B = bags[b]!;
        if (A.size < 4 || B.size < 4) continue;
        let both = 0;
        for (const w of A) if (B.has(w)) both++;
        const jaccard = both / (A.size + B.size - both);
        const diff = [...A].filter((w) => !B.has(w)).concat([...B].filter((w) => !A.has(w)));
        if (jaccard >= 0.6 && !diff.some((w) => POLARITY.test(w))) {
          warnings.push(`보기 ${"①②③④⑤"[a]}과 ${"①②③④⑤"[b]}가 거의 같은 말입니다. 오답은 뜻이 달라야 합니다.`);
          score -= 45;
          break outer;
        }
      }
    }
  }

  if (!q.instruction.trim()) {
    warnings.push("발문이 없습니다.");
    score -= 30;
  }
  if (!q.explanation.trim()) {
    warnings.push("해설이 없습니다.");
    score -= 25;
  }
  if (q.type !== option.type) {
    warnings.push("요청 유형과 생성 유형이 다릅니다.");
    score -= 30;
  }

  if (
    option.type === "vocabulary" &&
    (option.aingkaCode === "어휘추론" || option.aingkaCode === "어휘개수")
  ) {
    const consistency = validateVocabularyConsistency({
      code: option.aingkaCode,
      passageModified: q.passageModified,
      correctAnswer: q.correctAnswer,
      explanation: q.explanation,
    });
    if (!consistency.ok) {
      warnings.push(...consistency.problems);
      score -= 80;
    }
  }

  // 요지인데 요약문완성(빈칸·…… 쌍)으로 나온 경우 폐기
  if (option.type === "summary_mcq") {
    const blob = [
      q.questionText,
      q.instruction,
      ...(q.choices ?? []).map((c) => c.text),
    ]
      .join("\n")
      .toLowerCase();
    const looksLikeSummaryBlank =
      /요약문/.test(blob) ||
      (/\(a\)/.test(blob) && /\(b\)/.test(blob)) ||
      (q.choices ?? []).some((c) => /……|\.{2,}\s*\S+\s*\.{2,}|…{2,}/.test(c.text));
    if (looksLikeSummaryBlank) {
      warnings.push("요약문완성 형식이 감지되어 요지 문항으로 사용할 수 없습니다.");
      score -= 80;
    }
  }

  /*
   * 아래 다섯 가지는 전수 대조(선생님 지시 2026-10-01)에서 나온 흠이다.
   * 검수기(scripts/check-questions.mts)로만 보고 있었는데, 만들 때 막지 않으면
   * 다시 생긴다. 그래서 여기로 옮겨 왔다.
   */
  const marksOf = (t: string) => [...String(t ?? "").matchAll(/([ⓐ-ⓖ])\s*[:：]/g)].map((m) => m[1]!);
  const ansText = typeof q.correctAnswer === "string" ? q.correctAnswer : "";

  // 1) 정답이 본문에 없는 기호를 가리킨다
  if (ansText && (q.passageModified ?? "").includes("<u>")) {
    const inBody = new Set(
      [...String(q.passageModified).matchAll(/([ⓐ-ⓖ①-⑤])\s*<u>/g)].map((m) => m[1]!)
    );
    if (inBody.size > 0) {
      const missing = marksOf(ansText).filter((mk) => !inBody.has(mk));
      if (missing.length > 0) {
        warnings.push(`정답이 본문에 없는 기호를 가리킵니다: ${missing.join(" ")}`);
        score -= 45;
      }
    }
  }

  /*
   * 2) 객관식인데 해설이 다른 번호를 정답이라고 못 박는다.
   *    정답을 말로만 풀고 오답 번호만 나열하는 것은 정상 꼴이라 건드리지 않는다
   *    (전수 5,696개에서 그 꼴 세 건이 모두 옳은 해설이었다). 「③이 알맞다」처럼
   *    번호를 정답으로 지목한 것만 본다.
   */
  if (Array.isArray(q.choices) && q.choices.length >= 4) {
    const no = Number(q.correctAnswer);
    if (Number.isFinite(no)) {
      const claimed = new Set<number>();
      const push = (ch: string) => {
        const at = "①②③④⑤".indexOf(ch);
        if (at >= 0) claimed.add(at + 1);
      };
      for (const m of q.explanation.matchAll(
        /([①-⑤])\s*(?:이|가|은|는|을|를|번)?\s*(?:정답|알맞|적절하다|적절한|맞다|들어가)/g
      )) push(m[1]!);
      for (const m of q.explanation.matchAll(/정답[^①-⑤가-힣]{0,4}([①-⑤])/g)) push(m[1]!);
      if (claimed.size > 0 && !claimed.has(no)) {
        warnings.push(`정답은 ${no}번인데 해설은 ${[...claimed].join(",")}번을 정답이라고 합니다.`);
        score -= 40;
      }
    }
  }

  /*
   * 3) 「본문에서 찾아 쓰기」인데 정답이 본문에 없다.
   *
   * 형태를 바꿔 쓰라고 한 문항은 그대로 있을 수가 없다(요약표 (A)(B)(C) —
   * 선생님 지적 2026-10-01: 「답이 너무 직관적이다」). 그때는 어간으로 본다.
   */
  const formChanged = /형태를 바꿔|어형을 바꿔|형태를 변형/.test(q.questionText ?? "");
  if (ansText && formChanged) {
    const bodyWords = `${opts.passage} ${q.passageModified ?? ""}`.toLowerCase().match(/[a-z]{3,}/g) ?? [];
    const parts = [...ansText.matchAll(/\([A-G]\)\s*[:：]\s*([^/]+)/g)].map((m) => m[1]!.trim());
    for (const text of parts) {
      const w = text.toLowerCase().replace(/[^a-z]/g, "");
      if (w.length < 4) continue;
      const stem = w.slice(0, Math.max(4, Math.floor(w.length * 0.6)));
      if (!bodyWords.some((b) => b.startsWith(stem) || w.startsWith(b.slice(0, Math.max(4, Math.floor(b.length * 0.6)))))) {
        warnings.push(`본문에 없는 낱말을 답으로 썼습니다: "${text.slice(0, 24)}"`);
        score -= 45;
        break;
      }
    }
  } else if (ansText && /본문에서 찾아|본문에 나오는|본문의 한 단어|본문에서 정확히/.test(q.questionText ?? "")) {
    const body = `${opts.passage} ${q.passageModified ?? ""}`.toLowerCase().replace(/[^a-z]/g, "");
    const parts = [
      ...[...ansText.matchAll(/[ⓐ-ⓖ]\s*[:：]\s*([^/]+)/g)].map((m) => m[1]!.trim()),
      ...[...ansText.matchAll(/\([A-G]\)\s*[:：]\s*([^/]+)/g)].map((m) => m[1]!.trim()),
    ];
    for (const text of parts.length ? parts : [ansText]) {
      const key = text.toLowerCase().replace(/[^a-z]/g, "");
      if (key.length >= 4 && !body.includes(key)) {
        warnings.push(`본문에서 찾아 쓰는 문항인데 정답이 본문에 없습니다: "${text.slice(0, 30)}"`);
        score -= 45;
        break;
      }
    }
  }

  /*
   * 4) 「개수」 유형: 정답 숫자와 해설이 든 틀린 개수가 다르다.
   *
   * 처음에는 「ⓑ (틀림)」 꼴만 읽어서, 가장 흔한 「· ⓑ to rehearse → rehearse : …」를
   * 통째로 못 읽었다(2026-10-01). 일부만 읽히면 개수를 적게 세어 멀쩡한 문항을 버린다.
   * 그래서 세 가지 꼴을 모두 읽고, 기호마다 맞다/틀리다가 다 가려졌을 때만 센다.
   */
  if (/개수$/.test(option.aingkaCode ?? "") && option.type !== "vocabulary") {
    const no = Number(q.correctAnswer);
    const expl = q.explanation;
    const wrong = new Set<string>();
    const right = new Set<string>();
    /*
     * 줄 단위로 가린다. 한 줄이 기호 하나를 말하는 것이 해설의 꼴이다.
     * 글자 사이 거리로 재면 「ⓒ z는 올바른 표현이다」의 한글 조사에 막혀 못 읽는다.
     */
    for (const line of expl.split("\n")) {
      const mk = line.match(/[ⓐ-ⓖ①-⑤]/);
      if (!mk) continue;
      const isList = /(?:어색한|틀린)\s*것은/.test(line);
      if (isList) {
        for (const m of line.matchAll(/[ⓐ-ⓖ①-⑤]/g)) wrong.add(m[0]!);
        continue;
      }
      if (/→|->|⇒|틀림|틀리다|어색|부적절/.test(line)) wrong.add(mk[0]!);
      else if (/맞음|맞다|맞습니다|올바른|알맞|적절하다/.test(line)) right.add(mk[0]!);
    }
    // 머리글이 한 줄에 다 들어온 해설도 읽는다
    const listed = expl.match(/(?:어색한|틀린)\s*것은[^\n]{1,60}/);
    if (listed) for (const m of listed[0]!.matchAll(/[ⓐ-ⓖ①-⑤]/g)) wrong.add(m[0]!);

    const inBody = new Set(
      [...String(q.passageModified ?? "").matchAll(/([ⓐ-ⓖ①-⑤])\s*<u>/g)].map((m) => m[1]!)
    );
    /*
     * 본문에 있는 기호만 센다. 「정답은 ⑤이다」의 ⑤는 보기 번호이지 틀린 자리가 아니다 —
     * 그것까지 세어 멀쩡한 문항을 버리던 것을 막는다.
     */
    for (const mk of [...wrong]) if (!inBody.has(mk)) wrong.delete(mk);
    for (const mk of [...right]) if (!inBody.has(mk)) right.delete(mk);
    // 기호마다 맞다/틀리다가 다 가려졌을 때만 센다 — 덜 읽고 버리면 안 된다
    const judged = new Set([...wrong, ...right]);
    const allJudged = inBody.size > 0 && [...inBody].every((mk) => judged.has(mk));
    if (Number.isFinite(no) && allJudged && wrong.size !== no) {
      warnings.push(`정답은 ${no}개인데 해설은 ${wrong.size}개를 틀렸다고 합니다.`);
      score -= 40;
    }
  }

  // 5) 해설 끝에 이 문장과 무관한 문법 포인트 꼬리표가 붙었다
  if (/제시어배열/.test(option.aingkaCode ?? "")) {
    const tail = q.explanation.split(/(?<=[.다])\s+/).filter((line) => /^\s*GP\d{2}/.test(line));
    if (tail.length > 0) {
      warnings.push("해설 끝에 문법 포인트 꼬리표가 붙었습니다.");
      // 통과선(70)을 넘겨야 다시 만든다
      score -= 35;
    }
  }

  /*
   * 보기 다섯 개가 같은 말로 시작하면 틀로 굳은 것이다.
   *
   * 윌링어학원 세트(2F4D57)를 보니 주제추론 열넷 가운데 셋이 다섯 보기를 전부
   * 「The ~」나 「How ~」로 시작했다. 학생이 내용이 아니라 틀을 보고 가른다.
   * 저장된 문항 전체로 재 보니 주제추론 14%·내용일치 21%·요지추론 14%가 그랬다.
   *
   * 빈칸추론·함축의미추론은 뺀다 — 거기서는 다섯 보기가 같은 꼴로 늘어서는 것이 맞다.
   */
  const HEAD_VARIETY_TYPES = new Set(["title", "topic", "main_idea", "content_true", "content_false"]);
  if (HEAD_VARIETY_TYPES.has(option.type) && Array.isArray(q.choices) && q.choices.length >= 5) {
    const heads = q.choices
      // 보기는 {number, text} 꼴이다. 문자열로 읽어 규칙이 한 번도 안 걸리던 것을 고친다.
      .map((c) => String(c?.text ?? "").trim().split(/\s+/)[0]?.toLowerCase() ?? "")
      .filter(Boolean);
    if (heads.length >= 5) {
      const cnt = new Map<string, number>();
      for (const h of heads) cnt.set(h, (cnt.get(h) ?? 0) + 1);
      const [word, n] = [...cnt].sort((a, b) => b[1] - a[1])[0]!;
      if (n >= 4) {
        warnings.push(`보기 ${n}개가 "${word}"로 시작합니다. 틀을 바꿔 주세요.`);
        score -= 35;
      }
    }
  }

  return {
    singleCorrectAnswer: true,
    answerMatchesExplanation: Boolean(q.explanation.trim()),
    evidenceExists: true,
    ambiguityRisk: score < 70 ? "high" : "low",
    difficultyMatch: true,
    grammarChecked: true,
    overallScore: Math.max(0, Math.min(100, score)),
    warnings,
    typeMatch: q.type === option.type,
  };
}

export function shouldRegenerate(v: QuestionValidation): boolean {
  if (v.overallScore < VALIDATION_PASS_SCORE) return true;
  if (!v.answerMatchesExplanation) return true;
  if (v.typeMatch === false) return true;
  if (!v.singleCorrectAnswer) return true;
  return false;
}
