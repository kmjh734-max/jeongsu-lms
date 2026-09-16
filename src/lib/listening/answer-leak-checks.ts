/**
 * 정답 노출·오답 설계·구어체 규칙 검수 (모델 호출 없음). 수치는 quality-rubric.md.
 * 예전 생성본에서 확인한 결함:
 * - 응답 유형이 모두 "Could you …? / Shall I …?"로 끝나고 정답이 "Sure, I'll …"로 앞말을 되풀이 (고1 11~14 전부)
 * - "The only thing left is …", "I feel proud because …"처럼 정답을 대본이 그대로 말함
 * - 오답이 대본과 무관(장래 희망·심정 오답 3~4개가 대본에 없음)
 * - 금액 정답이 선택지 최솟값·최댓값 (교재는 18문항 중 17개가 ②~④)
 * - 한 턴을 긴 한 문장으로만 써서 글말처럼 딱딱함 (평균 단어 길이 4.5 ↔ 교재 3.7~3.8)
 */
import { numericChoiceValue } from "@/lib/listening/balance-correct-answer";
import type { GenericQualityIssue } from "@/lib/listening/generic-quality-checks";
import {
  isHighSchoolListeningGrade,
  type ListeningGradeLevel,
} from "@/lib/listening/grade-level";
import { listeningTypeTarget } from "@/lib/listening/prompts/quality-craft";
import type { GeneratedListeningQuestion } from "@/lib/listening/types";

const EN_STOP = new Set(
  "the a an and or but to of in on at for with from by about as is are was were be been am do does did have has had will would can could should shall may might must you your yours i me my we our us he she his her they them their it its this that these those there here what which who when where why how not no yes okay ok sure well oh so just really very too also then than now today some any all more much many one let let's i'm you're it's that's don't can't i'll we'll i'd get got go going make want need think know like see good great sounds sound thanks thank please sorry right of course".split(
    " "
  )
);

function enStems(text: string): string[] {
  const words = String(text ?? "").match(/[A-Za-z’']{3,}/g) ?? [];
  return [
    ...new Set(
      words
        .map((w) => w.toLowerCase().replace(/’/g, "'"))
        .filter((w) => !EN_STOP.has(w))
        .map((w) => w.replace(/'s$/, "").replace(/(ing|ed|es|s)$/, "").slice(0, 6))
    ),
  ];
}

const KO_STOP = new Set([
  "하려", "위해", "하기", "해서", "대해", "대한", "관한", "하는", "한다", "있다", "없다", "것을", "것이",
  "수있", "해야", "되어", "되는", "하고", "에서", "에게", "으로", "이다", "있는", "가장", "것은", "많은",
  "적절", "좋다", "좋은", "필요", "중요", "하게", "했다",
]);

function koStems(text: string): string[] {
  return [
    ...new Set(
      (String(text ?? "").match(/[가-힣]{2,}/g) ?? [])
        .map((w) => w.slice(0, 2))
        .filter((s) => !KO_STOP.has(s))
    ),
  ];
}

function overlapRatio(a: string[], b: string[]): number {
  if (a.length === 0) return 0;
  const set = new Set(b);
  return a.filter((x) => set.has(x)).length / a.length;
}

function spoken(q: GeneratedListeningQuestion) {
  return (q.segments ?? []).filter((s) => s.speaker === "M" || s.speaker === "W");
}

/** 응답 고르기 유형 (고등 11~14, 중등 19·20) */
export function isResponseChoiceType(typeId: number, grade: ListeningGradeLevel | undefined): boolean {
  return isHighSchoolListeningGrade(grade) ? typeId >= 11 && typeId <= 14 : typeId === 19 || typeId === 20;
}

const YES_NO_REQUEST =
  /(?:^|[.!?]\s+|,\s*)(?:so\s+|then\s+|and\s+)?(?:can|could|would|will|shall|do|does|may)\s+(?:you|i|we)\b[^.!?]*\?\s*$/i;
const ACCEPT_START = /^\s*(?:sure|yes|yeah|of course|no problem|okay|ok|certainly|absolutely|all right|alright|definitely)\b/i;

/** 대본 문장 나누기 (약어 a.m./p.m./Mr. 는 끊지 않음) */
function sentencesOf(text: string): string[] {
  return String(text ?? "")
    .replace(/\b(a\.m|p\.m|Mr|Mrs|Ms|Dr)\./gi, "$1")
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter((s) => /[A-Za-z]/.test(s));
}

function wordCount(text: string): number {
  return (String(text ?? "").match(/[A-Za-z0-9$’'-]+/g) ?? []).length;
}

/** 대화 문장당 평균 단어 수 */
export function dialogueWordsPerSentence(q: GeneratedListeningQuestion): number | null {
  const lines = spoken(q);
  if (lines.length < 3) return null;
  const sentences = lines.flatMap((s) => sentencesOf(s.text));
  if (sentences.length === 0) return null;
  return sentences.reduce((n, s) => n + wordCount(s), 0) / sentences.length;
}

/** 대본 평균 단어 길이(글자) — 말하는 영어일수록 짧다 */
export function averageWordLength(q: GeneratedListeningQuestion): number | null {
  const words = (q.segments ?? []).flatMap((s) => s.text.match(/[A-Za-z]+/g) ?? []);
  if (words.length < 30) return null;
  return words.reduce((n, w) => n + w.length, 0) / words.length;
}

const GIVEAWAY = [
  /\bthe only (?:thing|task|job|one|item)s? (?:left|remaining|we (?:still )?need)\b/i,
  /\bthe (?:real|main|true) reason (?:is|was)\b/i,
  /\bthe last thing (?:left|we need)\b/i,
];

const EMOTION_SELF =
  /\bI(?:'m| am| feel| felt| was| got)\s+(?:so |really |very |a little |a bit |quite |kind of |pretty |totally )*(proud|relieved|disappointed|nervous|worried|excited|bored|embarrassed|surprised|satisfied|sad|upset|angry|scared|anxious|thrilled|jealous|lonely|annoyed|frustrated|confused|grateful)\b/i;

const JOB_WORDS =
  /\b(doctor|teacher|vet|veterinarian|nurse|chef|cook|pilot|writer|author|reporter|journalist|scientist|engineer|designer|artist|painter|photographer|programmer|developer|singer|dancer|actor|actress|athlete|soccer player|baseball player|police officer|firefighter|lawyer|farmer|baker|librarian|zookeeper|animal trainer|interpreter|translator|announcer|youtuber|director|architect|dentist|pharmacist|musician|pianist|cartoonist|webtoon artist|game designer|tour guide|flight attendant|hairdresser|zoo keeper|counselor|astronaut)s?\b/gi;

/**
 * 감정 선택지 → 대본에서 찾을 어간. relieved/relief, proud/pride처럼 형태가 달라도 잡히게
 * 앞 4~5글자만 쓴다. 감정 단어가 아니면 null.
 */
const EMOTION_WORDS = new Set([
  "proud", "relieved", "disappointed", "nervous", "worried", "excited", "bored",
  "embarrassed", "surprised", "satisfied", "sad", "upset", "angry", "scared",
  "anxious", "thrilled", "jealous", "lonely", "annoyed", "frustrated", "confused",
  "grateful", "curious", "regretful", "touched", "hopeful", "calm", "pleased",
]);

function emotionStem(choice: string): string | null {
  const w = String(choice ?? "").trim().toLowerCase().replace(/[^a-z]/g, "");
  if (!EMOTION_WORDS.has(w) || w.length < 5) return null;
  return w.slice(0, 5);
}

function personCode(label: string | undefined): "M" | "W" | null {
  if (label === "남자") return "M";
  if (label === "여자") return "W";
  return null;
}

/** 대본 근거로 오답을 만들어야 하는 한국어 선택지 유형 */
function needsGroundedDistractors(typeId: number, grade: ListeningGradeLevel | undefined): boolean {
  if (isHighSchoolListeningGrade(grade)) return [1, 2, 3, 5, 7].includes(typeId);
  // 새 유형: 한 일(23)·특정 정보(24)·목적(26)·하는 말의 내용(22)·방송 목적(36)
  return [9, 10, 12, 15, 16, 17, 22, 23, 24, 26, 36].includes(typeId);
}

export function answerLeakIssues(
  q: GeneratedListeningQuestion,
  typeId: number,
  gradeLevel: ListeningGradeLevel | undefined
): GenericQualityIssue[] {
  const issues: GenericQualityIssue[] = [];
  const choices = (q.choices ?? []).map((c) => String(c ?? "").trim());
  const key = choices[q.correct_answer - 1] ?? "";
  const lines = spoken(q);
  const high = isHighSchoolListeningGrade(gradeLevel);
  const scriptAll = (q.segments ?? []).map((s) => s.text).join(" ");

  // 1) 응답 유형: Yes/No 부탁 → 수락 되풀이, 마지막 말 단어 되풀이
  if (isResponseChoiceType(typeId, gradeLevel) && lines.length > 0 && key) {
    const last = lines[lines.length - 1]!.text;
    if (YES_NO_REQUEST.test(last) && ACCEPT_START.test(key)) {
      issues.push({
        code: "response_request_accept",
        message: "마지막 말이 Yes/No 부탁이고 정답이 수락(Sure/Yes …)이라 너무 쉽습니다. 실제 시험은 대부분 평서문·의문사 의문문에 새 정보로 반응합니다.",
        weight: 10,
      });
    }
    const keyStems = enStems(key);
    const shared = keyStems.filter((s) => enStems(last).includes(s));
    if (keyStems.length > 0 && shared.length >= 2 && shared.length / keyStems.length >= 0.5) {
      issues.push({
        code: "response_echo",
        message: `정답이 마지막 말의 단어(${shared.join(", ")})를 되풀이합니다.`,
        weight: 8,
      });
    }
  }

  // 1-1) 응답 선택지 길이 (교재: 중1 3~7, 중2 4~8, 중3 4~9, 고등 5~10단어)
  if (isResponseChoiceType(typeId, gradeLevel) && choices.length === 5) {
    const limit = listeningTypeTarget(typeId, gradeLevel)?.responseChoiceWords;
    const avg = choices.reduce((n, c) => n + wordCount(c), 0) / 5;
    if (limit && avg > limit[1] + 2) {
      issues.push({
        code: "response_choice_long",
        message: `응답 선택지가 평균 ${avg.toFixed(1)}단어로 깁니다(기준 ${limit[0]}~${limit[1]}단어).`,
        weight: 3,
      });
    }
  }

  // 2) 정답을 대본이 해설하듯 말함
  const giveaway = GIVEAWAY.find((re) => re.test(scriptAll));
  if (giveaway && !isResponseChoiceType(typeId, gradeLevel)) {
    issues.push({
      code: "giveaway_phrase",
      message: `대본이 정답을 해설하듯 말합니다 ("${scriptAll.match(giveaway)?.[0]}").`,
      weight: 6,
    });
  }

  // 3) 중2·중3 심정: 대상 화자가 감정 단어를 직접 말함 (중1 교재는 직접 말하는 경우가 많아 허용)
  if ((gradeLevel === "middle2" || gradeLevel === "middle3") && typeId === 8) {
    const target = personCode(q.instruction?.match(/(남자|여자)의 심정/)?.[1]);
    const said = lines.find((s) => (!target || s.speaker === target) && EMOTION_SELF.test(s.text));
    if (said) {
      issues.push({
        code: "emotion_word_stated",
        message: `대상 화자가 감정을 직접 말합니다 ("${said.text.match(EMOTION_SELF)?.[0]}"). 상황·반응으로 드러내야 합니다.`,
        weight: 8,
      });
    }
  }

  // 3-1) 심정: 선택지 감정 단어가 대본에 그대로 나옴.
  //      EMOTION_SELF는 "I'm relieved"만 잡아 "What a relief!" 같은 감탄문을 놓쳤다.
  //      정답이면 답이 그대로 들리고, 오답이면 그 오답도 답이 되어 어느 쪽이든 문항이 무너진다
  //      (생성본에 "What a relief!"를 쓰고 정답만 grateful로 둔 문항이 세 개 나왔다).
  if ((gradeLevel === "middle2" || gradeLevel === "middle3") && typeId === 8 && choices.length === 5) {
    const leaked: string[] = [];
    choices.forEach((c, i) => {
      const stem = emotionStem(c);
      if (!stem || !new RegExp(`\\b${stem}[a-z]*`, "i").test(scriptAll)) return;
      leaked.push(i + 1 === q.correct_answer ? `${c}(정답)` : c);
    });
    if (leaked.length > 0) {
      issues.push({
        code: "emotion_answer_in_script",
        message: `선택지 감정(${leaked.join(", ")})의 말이 대본에 그대로 나옵니다. 감정은 상황·반응으로만 드러내야 합니다.`,
        // 정답이 들리거나 오답이 정답처럼 들리는 가장 센 누출이라 이 문항 하나로 합격선 아래로 내린다
        weight: 22,
      });
    }
  }

  // 4) 중등 장래 희망: 대본에 다른 직업이 없어 오답 근거가 없음
  if (!high && typeId === 7) {
    const jobs = new Set((scriptAll.match(JOB_WORDS) ?? []).map((j) => j.toLowerCase().replace(/s$/, "")));
    if (jobs.size < 2) {
      issues.push({
        code: "career_no_distractor",
        message: "대본에 정답 외 다른 직업이 나오지 않아 오답 근거가 없습니다.",
        weight: 6,
      });
    }
  }

  // 4-1) 중등 구입: 마지막 말이 정답 선택지를 통째로 되풀이 (묘사 유형의 대상 이름 노출은 type1_direct_answer가 본다)
  if (!high && typeId === 2 && key && lines.length > 0) {
    const keyStems = enStems(key);
    const lastStems = enStems(lines[lines.length - 1]!.text);
    if (keyStems.length >= 3 && overlapRatio(keyStems, lastStems) >= 0.8) {
      issues.push({
        code: "purchase_answer_restated",
        message: "마지막 말이 정답 선택지의 조건을 모두 되풀이합니다. 앞에서 조건을 좁히고 마지막은 가리키기만 해야 합니다.",
        weight: 6,
      });
    }
  }

  // 5) 오답이 대본과 무관
  if (needsGroundedDistractors(typeId, gradeLevel) && q.script_translation && choices.length === 5) {
    const tr = koStems(q.script_translation);
    const distractors = choices.filter((_, i) => i !== q.correct_answer - 1);
    const ungrounded = distractors.filter((d) => /[가-힣]/.test(d) && overlapRatio(koStems(d), tr) === 0).length;
    if (ungrounded >= 3) {
      issues.push({
        code: "distractors_ungrounded",
        message: `오답 ${ungrounded}개가 대본 내용과 연결되지 않습니다. 오답은 대본에 나온 일·사물·이유로 만들어야 합니다.`,
        weight: 6,
      });
    }
  }

  // 6) 정답만 유난히 긴 선택지 (길이만 보고 고를 수 있음)
  if (choices.length === 5 && key && numericChoiceValue(key) == null && !/^[①②③④⑤A-E]$/.test(key)) {
    const len = (c: string) => (/[가-힣]/.test(c) ? c.replace(/\s/g, "").length : wordCount(c));
    const others = choices.filter((_, i) => i !== q.correct_answer - 1).map(len);
    const maxOther = Math.max(...others);
    if (len(key) >= 6 && len(key) > maxOther * 1.35) {
      issues.push({
        code: "key_longest",
        message: "정답 선택지만 다른 선택지보다 눈에 띄게 깁니다.",
        weight: 4,
      });
    }
  }

  // 7) 수 선택지(금액·시각) 정답이 맨 앞·맨 뒤
  const values = choices.map(numericChoiceValue);
  if (choices.length === 5 && values.every((v) => v != null)) {
    const sorted = [...values].sort((a, b) => a! - b!);
    const rank = sorted.indexOf(values[q.correct_answer - 1]!) + 1;
    if (rank === 1 || rank === 5) {
      issues.push({
        code: "numeric_answer_extreme",
        message: `정답이 수 선택지 중 ${rank === 1 ? "가장 작은" : "가장 큰"} 값입니다. 오답을 정답 위아래로 고르게 두어야 합니다.`,
        weight: 5,
      });
    }
  }

  // 8) 글말처럼 딱딱한 대본 (문장당 단어·긴 단어)
  const target = listeningTypeTarget(typeId, gradeLevel);
  const wps = dialogueWordsPerSentence(q);
  if (target && wps != null && !isResponseChoiceType(typeId, gradeLevel) && target.turns) {
    if (wps > target.dialogueWordsPerSentence[1] + 2.5) {
      issues.push({
        code: "long_dialogue_sentences",
        message: `대화 문장이 평균 ${wps.toFixed(1)}단어로 깁니다(목표 ${target.dialogueWordsPerSentence[0]}~${target.dialogueWordsPerSentence[1]}). 짧은 구어 문장으로 나눠야 합니다.`,
        weight: 4,
      });
    }
  }
  if (target?.turns && !isResponseChoiceType(typeId, gradeLevel) && lines.length >= 4) {
    const wpt = lines.reduce((n, s) => n + wordCount(s.text), 0) / lines.length;
    if (wpt < target.wordsPerTurn[0] - 2) {
      issues.push({
        code: "short_turns",
        message: `대화 한 턴이 평균 ${wpt.toFixed(1)}단어로 너무 짧아 끊기는 느낌입니다(목표 ${target.wordsPerTurn[0]}~${target.wordsPerTurn[1]}).`,
        weight: 4,
      });
    }
  }
  const avgLen = averageWordLength(q);
  const avgMax = high ? 4.3 : 4.1;
  if (avgLen != null && avgLen > avgMax) {
    issues.push({
      code: "written_style",
      message: `긴 단어가 많아 말보다 글처럼 들립니다(평균 단어 길이 ${avgLen.toFixed(2)}, 기준 ${avgMax} 이하).`,
      weight: 3,
    });
  }

  return issues;
}
