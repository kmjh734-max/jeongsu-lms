/** 2번 선택지 같은 물건 범주 검사 */

export type ProductCategory =
  | "ice_cream"
  | "bag"
  | "hat"
  | "umbrella"
  | "doll"
  | "coat"
  | "drink"
  | "other";

const PATTERNS: Array<{ cat: ProductCategory; re: RegExp }> = [
  { cat: "ice_cream", re: /\b(ice cream|cone ice|cup ice)\b/i },
  { cat: "bag", re: /\b(bag|backpack)\b/i },
  { cat: "hat", re: /\b(hat|cap)\b/i },
  { cat: "umbrella", re: /\bumbrella\b/i },
  { cat: "doll", re: /\b(doll|firefighter|police officer|doctor)\b/i },
  { cat: "coat", re: /\b(coat|jacket)\b/i },
  { cat: "drink", re: /\b(drink|coffee|juice|tea|latte|smoothie)\b/i },
];

export function inferProductCategory(choice: string): ProductCategory {
  const c = choice.toLowerCase();
  for (const { cat, re } of PATTERNS) {
    if (re.test(c)) return cat;
  }
  return "other";
}

export function checkPurchaseChoicesSameProduct(choices: string[]): {
  ok: boolean;
  message?: string;
} {
  const cats = choices.map(inferProductCategory);
  const nonOther = cats.filter((c) => c !== "other");
  if (nonOther.length < 2) return { ok: true };

  const counts = new Map<ProductCategory, number>();
  for (const c of nonOther) counts.set(c, (counts.get(c) ?? 0) + 1);
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const [top, second] = sorted;

  if (second && second[1] >= 2 && top && top[0] !== second[0]) {
    return {
      ok: false,
      message: "선택지가 서로 다른 물건 종류로 섞여 있습니다 (같은 범주만).",
    };
  }
  return { ok: true };
}

const VAGUE_ONLY =
  /\b(cheap|expensive|popular|nice|good|best|favorite|great)\b/i;

export function hasVagueVisualConditions(choices: string[]): boolean {
  return choices.filter((c) => {
    const stripped = c.replace(VAGUE_ONLY, "").trim();
    return stripped.length < 8;
  }).length >= 2;
}
