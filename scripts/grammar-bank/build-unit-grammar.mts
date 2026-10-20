/**
 * 교과서·과 → 단원문법 표를 만든다(모델 호출 없음).
 *   npx tsx scripts/grammar-bank/build-unit-grammar.mts
 * 입력: scripts/grammar-bank/textbook-points.json (참고파일/교과서문법 PDF 파싱 결과)
 * 출력: src/lib/grammar/textbook-unit-grammar.generated.json
 *   { "공통영어1|NE능률(민병천)|1": [{ title, label, writing }] }
 *   label: 표준 이름(textbook-points), writing: 문장 감지 규칙이 있는 지정 문법 이름(없으면 null)
 */
import fs from "node:fs";
import { findTextbookPoint } from "@/lib/grammar/textbook-points";
import { WRITING_GRAMMARS } from "@/lib/question-generator/writing-grammar";

const raw = JSON.parse(fs.readFileSync("scripts/grammar-bank/textbook-points.json", "utf8")) as Array<{
  subject: string; publisher: string; lesson: number; points: Array<{ title: string }>;
}>;
/*
 * 이름이 비슷하다고 엉뚱한 표준 이름에 붙던 것을 바로잡는다(2026-10-20 선생님: 단원문법과 상관없는
 * 중요문장 배열 — 「may have+과거분사」가 「명사 수식 분사」로 붙어 과거분사만 있으면 다 잡혔다).
 * 앞에서부터 처음 맞는 것. writing이 null이면 감지하지 않는다(억지로 잡느니 빼는 편이 낫다).
 */
const TITLE_FIX: Array<[RegExp, string | null]> = [
  [/(?:조동사|may|might|must|could|should|would)\s*[+＋]?\s*have/i, "조동사 + have p.p."],
  [/with\s*[+＋]?\s*(?:\(대\))?(?:명사|목적어)|with\s*분사구문/i, "with + 명사 + 분사"],
  [/복합관계|whatever|whoever/i, "복합관계사"],
  [/형용사의 명사 후치|주격 관계대명사\s*\+\s*be동사|반복되는|관계부사 where의 계속적|동명사의 의미상|that절 진주어/, null],
];
const norm = (s: string) => s.replace(/\s+/g, "").replace(/[~∼〜]/g, "~").toLowerCase();
const writingByNorm = new Map(WRITING_GRAMMARS.filter((g) => g.check).map((g) => [norm(g.label), g.label] as const));
const out: Record<string, Array<{ title: string; label: string | null; writing: string | null }>> = {};
let total = 0, withLabel = 0, withWriting = 0;
const missing = new Map<string, number>();
for (const u of raw) {
  const key = `${u.subject}|${u.publisher}|${u.lesson}`;
  out[key] = u.points.map((pt) => {
    total++;
    const tp = findTextbookPoint(pt.title);
    if (tp) withLabel++;
    const cands = [pt.title, tp?.label, ...(tp?.aliases ?? [])].filter(Boolean) as string[];
    const fix = TITLE_FIX.find(([re]) => re.test(pt.title));
    const writing = fix ? fix[1] : (cands.map((c) => writingByNorm.get(norm(c))).find(Boolean) ?? null);
    if (writing) withWriting++;
    else { const k = tp?.label ?? `(표준 없음) ${pt.title}`; missing.set(k, (missing.get(k) ?? 0) + 1); }
    return { title: pt.title, label: fix ? fix[1] : (tp?.label ?? null), writing };
  });
}
fs.writeFileSync("src/lib/grammar/textbook-unit-grammar.generated.json", JSON.stringify(out, null, 1));
console.log("단원", Object.keys(out).length, "문법", total, "표준이름", withLabel, "감지규칙", withWriting);
console.log("감지 규칙 없는 것 상위:", [...missing.entries()].sort((a, b) => b[1] - a[1]).slice(0, 40).map(([k, v]) => `${k}(${v})`).join(", "));
