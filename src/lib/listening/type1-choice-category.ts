/** 1번 선택지 같은 범주 검사 (휴리스틱) */

const ANIMAL =
  /\b(turtle|rabbit|bird|horse|snake|cat|dog|fish|bee|owl|penguin|dolphin|lion|tiger|frog|mouse|duck|pig|cow|sheep|monkey|elephant|bear|fox|wolf|chicken)\b/i;
const PLACE =
  /\b(library|bakery|hospital|museum|school|park|store|shop|market|station|airport|beach|farm|zoo|cinema|theater|restaurant|cafe|office|gym)\b/i;
const JOB =
  /\b(doctor|nurse|teacher|pilot|cook|chef|driver|farmer|singer|artist|police|firefighter|builder|engineer|scientist|dentist|vet)\b/i;

export type ChoiceCategory = "animal" | "place" | "job" | "object" | "unknown";

export function inferChoiceCategory(choice: string): ChoiceCategory {
  const c = choice.toLowerCase().replace(/^a\s+|^an\s+|^the\s+/i, "").trim();
  if (ANIMAL.test(c)) return "animal";
  if (PLACE.test(c)) return "place";
  if (JOB.test(c)) return "job";
  if (c.length > 0) return "object";
  return "unknown";
}

export function checkChoicesSameCategory(choices: string[]): {
  ok: boolean;
  dominant: ChoiceCategory | null;
  message?: string;
} {
  const cats = choices.map(inferChoiceCategory).filter((c) => c !== "unknown");
  if (cats.length < 2) return { ok: true, dominant: cats[0] ?? null };

  const counts = new Map<ChoiceCategory, number>();
  for (const c of cats) counts.set(c, (counts.get(c) ?? 0) + 1);
  const sorted = [...counts.entries()].sort((a, b) => b[1] - a[1]);
  const [top, second] = sorted;

  if (!top) return { ok: true, dominant: null };
  if (second && second[1] >= 2 && top[0] !== second[0]) {
    return {
      ok: false,
      dominant: top[0],
      message: "선택지 범주가 섞여 있습니다 (동물·사물·장소·직업 중 하나만).",
    };
  }
  return { ok: true, dominant: top[0] };
}
