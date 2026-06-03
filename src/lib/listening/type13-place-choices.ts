/** 13번 대화 장소 파악 선택지 검사 */

export interface DistractorPlace {
  place: string;
  reason: string;
}

export const KOREAN_PLACES = [
  "보건실",
  "교무실",
  "신발 가게",
  "야구장",
  "약국",
  "서점",
  "도서관",
  "우체국",
  "식당",
  "영화관",
  "미술관",
  "기차역",
  "버스 정류장",
  "공항",
  "체육관",
  "음악실",
  "과학실",
  "미술실",
  "미용실",
  "동물병원",
  "빵집",
  "문구점",
] as const;

const PLACE_SET = new Set<string>(KOREAN_PLACES);

const NOT_PLACE =
  /^(약\s*사기|기침|침대|선생님|책|우표|신발|감정|이유|보건)$/;

const MOSTLY_ENGLISH = /^[A-Za-z0-9\s.,'"-]+$/;

/** 한글 장소 → 대본 직접 언급 검사용 영어 키워드 */
const PLACE_ENGLISH_HINTS: Record<string, RegExp[]> = {
  보건실: [/\bnurse'?s office\b/i, /\bhealth office\b/i, /\bschool clinic\b/i],
  "신발 가게": [/\bshoe store\b/i, /\bshoe shop\b/i],
  약국: [/\bpharmacy\b/i, /\bdrugstore\b/i],
  서점: [/\bbookstore\b/i, /\bbook shop\b/i],
  도서관: [/\blibrary\b/i],
  우체국: [/\bpost office\b/i],
  식당: [/\brestaurant\b/i, /\bcafe\b/i],
  영화관: [/\bmovie theater\b/i, /\bcinema\b/i],
  미술관: [/\bart museum\b/i, /\bmuseum\b/i],
  기차역: [/\btrain station\b/i, /\bplatform\b/i],
  "버스 정류장": [/\bbus stop\b/i, /\bbus station\b/i],
  공항: [/\bairport\b/i],
  체육관: [/\bgym\b/i, /\bgymnasium\b/i],
  동물병원: [/\banimal hospital\b/i, /\bvet(?:erinary)? clinic\b/i],
  빵집: [/\bbakery\b/i],
  문구점: [/\bstationery store\b/i, /\bstationery shop\b/i],
  야구장: [/\bbaseball stadium\b/i, /\bballpark\b/i],
  교무실: [/\bteacher'?s office\b/i, /\bstaff room\b/i],
  음악실: [/\bmusic room\b/i],
  과학실: [/\bscience (?:lab|room)\b/i],
  미술실: [/\bart room\b/i],
  미용실: [/\bhair salon\b/i, /\bbeauty salon\b/i],
};

const WEAK_PLACE_CLUE =
  /^(?:can I help you|thank you|please sit here|I'?m sorry|hello|good (?:morning|afternoon)|sure\.?)$/i;

export function normalizePlaceLabel(label: string): string {
  return label.trim().replace(/\s+/g, " ");
}

export function isKoreanPlaceChoice(choice: string): boolean {
  const t = normalizePlaceLabel(choice);
  if (!t || t.length < 2) return false;
  if (MOSTLY_ENGLISH.test(t) && !/[\uAC00-\uD7A3]/.test(t)) return false;
  if (!/[\uAC00-\uD7A3]/.test(t)) return false;
  if (NOT_PLACE.test(t.replace(/\s/g, ""))) return false;
  if (/(하기|위해서|하려고)$/.test(t)) return false;
  return PLACE_SET.has(t) || /(실|관|점|장|원|국|역|실|실)$/.test(t);
}

export function checkKoreanPlaceChoices(choices: string[]): {
  ok: boolean;
  message?: string;
} {
  const invalid = choices.filter((c) => c.trim() && !isKoreanPlaceChoice(c));
  if (invalid.length > 0) {
    return {
      ok: false,
      message: `장소명이 아닌 선택지: ${invalid.join(", ")}`,
    };
  }
  const normalized = choices.map((c) => normalizePlaceLabel(c));
  const unique = new Set(normalized.filter(Boolean));
  if (unique.size < choices.filter((c) => c.trim()).length) {
    return { ok: false, message: "선택지에 같은 장소가 중복되었습니다." };
  }
  return { ok: true };
}

export function placeMatchesChoice(
  targetPlace: string,
  choices: string[],
  correctIndex: number
): boolean {
  const target = normalizePlaceLabel(targetPlace);
  const choice = normalizePlaceLabel(choices[correctIndex - 1] ?? "");
  return !!target && !!choice && target === choice;
}

export function indexOfPlaceInChoices(
  choices: string[],
  place: string
): number {
  const target = normalizePlaceLabel(place);
  return choices.findIndex((c) => normalizePlaceLabel(c) === target);
}

export function normalizePlaceClues(raw: unknown): string[] {
  if (!Array.isArray(raw)) return [];
  return raw.map((x) => String(x).trim()).filter(Boolean);
}

export function normalizeDistractorPlaces(raw: unknown): DistractorPlace[] {
  if (!Array.isArray(raw)) return [];
  return raw
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const o = item as Record<string, unknown>;
      const place = String(o.place ?? "").trim();
      const reason = String(o.reason ?? "").trim();
      if (!place) return null;
      return { place, reason };
    })
    .filter((x): x is DistractorPlace => x !== null);
}

export function scriptDirectlyNamesPlace(
  script: string,
  targetPlace: string
): boolean {
  const place = normalizePlaceLabel(targetPlace);
  if (!place) return false;

  const core = place.replace(/\s/g, "");
  if (script.replace(/\s/g, "").includes(core)) return true;

  const hints = PLACE_ENGLISH_HINTS[place] ?? [];
  return hints.some((re) => re.test(script));
}

export function answerClueHasPlaceHints(clue: string): boolean {
  const c = clue.trim();
  if (!c || WEAK_PLACE_CLUE.test(c)) return false;
  const parts = c.split(/[/|]/).map((p) => p.trim()).filter(Boolean);
  if (parts.length >= 2) return parts.every((p) => p.length >= 8);
  return c.length >= 12 && !WEAK_PLACE_CLUE.test(c);
}

export function validateType13PlaceFields(q: {
  instruction: string;
  choices: string[];
  correct_answer: number;
  answer_clue: string;
  target_place?: string;
  place_clues?: string[];
  distractor_places?: DistractorPlace[];
  segments: Array<{ speaker: string; text: string }>;
}): { ok: boolean; issues: string[] } {
  const issues: string[] = [];
  const place = q.target_place?.trim() ?? "";
  const script = q.segments.map((s) => s.text).join(" ");

  if (!/대화하는\s*장소|장소로/.test(q.instruction)) {
    issues.push("지시문이 대화 장소 파악 유형에 맞지 않을 수 있습니다.");
  }

  if (!place) {
    issues.push("target_place(대화 장소)이 필요합니다.");
  } else {
    if (!isKoreanPlaceChoice(place)) {
      issues.push("target_place가 한글 장소명이어야 합니다.");
    }
    if (!placeMatchesChoice(place, q.choices, q.correct_answer)) {
      issues.push("target_place와 correct_answer 선택지가 일치하지 않습니다.");
    }
    if (script && scriptDirectlyNamesPlace(script, place)) {
      issues.push("대본에서 정답 장소명을 직접 언급하면 안 됩니다.");
    }
  }

  const clues = q.place_clues ?? [];
  if (clues.length < 2) {
    issues.push("place_clues에 장소 단서가 2개 이상 필요합니다.");
  }

  const distractors = q.distractor_places ?? [];
  if (distractors.length < 2) {
    issues.push("distractor_places에 오답 장소 설명이 2개 이상 필요합니다.");
  }

  if (!q.answer_clue?.trim()) {
    issues.push("answer_clue가 필요합니다.");
  } else if (!answerClueHasPlaceHints(q.answer_clue)) {
    issues.push("answer_clue에 장소 추론 단서 문장 2개 이상이 필요합니다.");
  }

  return { ok: issues.length === 0, issues };
}
