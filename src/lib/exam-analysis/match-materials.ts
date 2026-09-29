import type { SupabaseClient } from "@supabase/supabase-js";
import { loadAcademyMaterialPassages } from "@/lib/exam-analysis/material-passages";
import { loadAllMockPassages, mockPassageShortLabel } from "@/lib/mock-passages";
import { resolveTextbookPassageAcademyId } from "@/lib/textbooks/shared-passages";

/**
 * 시험지 지문이 학원 수업자료(lesson_material_items) 지문과 같은지 글자로 대조한다.
 * 맞은 것만 출처를 단다 — 짐작한 출처는 두지 않는다.
 * 시험지는 지문을 조금 바꿔 내기도 하므로, 지문 앞부분의 5단어 묶음 가운데 30% 이상이 수업자료에 있으면 같은 지문으로 본다.
 */
const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/<\/?u>/g, " ")
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

function shingles(ws: string[], n = 5): string[] {
  const out: string[] = [];
  for (let i = 0; i + n <= ws.length; i++) out.push(ws.slice(i, i + n).join(" "));
  return out;
}

type PoolEntry = { id: string; label: string; set: Set<string> };

/**
 * 지문마다 가장 많이 겹치는 것을 찾는다.
 *
 * 5낱말 묶음이 30% 넘게 겹치면 같은 지문으로 본다. 다만 발췌가 짧으면 묶음이 적어
 * 한 개 차이로 비율이 크게 흔들린다 — 스물다섯 낱말이면 묶음이 스물한 개뿐이라
 * 여섯 개가 겹쳐도 29%다. 그래서 겹친 <b>개수</b>가 다섯을 넘어도 같은 지문으로 본다.
 * 연속 다섯 낱말이 다섯 군데나 같으면 우연일 수 없다.
 *
 * 선생님과 함께 짚어 보니(2026-09-30) 발곡고 고1 19번이 25년 고1 6월 30번과
 * 여섯 군데 겹치는데 29%라 놓치고 있었다.
 */
const MIN_RATIO = 0.3;
const MIN_HITS = 5;

function bestMatches(
  pool: PoolEntry[],
  excerpts: { key: string; excerpt: string | null }[]
): Map<string, { id: string; label: string }> {
  const result = new Map<string, { id: string; label: string }>();
  if (pool.length === 0) return result;
  for (const { key, excerpt } of excerpts) {
    if (!excerpt || words(excerpt).length < 8) continue;
    const sh = shingles(words(excerpt));
    if (sh.length === 0) continue;
    let best: { id: string; label: string; hit: number } | null = null;
    for (const m of pool) {
      let hit = 0;
      for (const s of sh) if (m.set.has(s)) hit++;
      if (!best || hit > best.hit) best = { id: m.id, label: m.label, hit };
    }
    if (!best || best.hit === 0) continue;
    if (best.hit / sh.length >= MIN_RATIO || best.hit >= MIN_HITS) {
      result.set(key, { id: best.id, label: best.label });
    }
  }
  return result;
}

/**
 * 바꿔 쓴 지문을 고유명사로 잡는다.
 *
 * 선생님과 함께 살펴보니(2026-09-30) 학교가 교과서 지문을 다시 써서 내는 일이
 * 있다. 「wanted to experiment with how easily one can manipulate public opinion」이
 * 시험지에서는 「wanted to see how easy people could influence public opinion」이 된다.
 * 다섯 낱말 묶음으로는 하나도 안 겹쳐 출처를 못 단다.
 *
 * 고유명사는 바꿔 써도 남는다. 교과서 모음 전체에서 세 지문 이하에만 나오는
 * 낱말(Oobah·Butler 같은 것)이 두 개 넘게 한 지문에 몰리면 같은 글로 본다.
 *
 * 다만 낱말만 보면 같은 인물을 다루는 <b>다른 글</b>이 걸린다. 일곱 건을 짚어 보니
 * 넷이 그랬다 — Carol Dweck을 말하는 교과서 대화문과 시험지 설명글이 엮이는 식이다.
 * 그래서 세 낱말 묶음도 12% 넘게 겹칠 때만 인정한다. 맞는 것은 18%였고 엮인 넷은
 * 0~5%여서 이 선에서 갈린다.
 */
const RARE_MAX_DOCS = 3;
const MIN_RARE_HITS = 2;
const MIN_TRIGRAM = 0.12;

type ParaphrasePool = {
  id: string;
  label: string;
  rare: Set<string>;
  three: Set<string>;
};

function buildParaphrasePool(
  rows: { id: string; label: string; text: string }[]
): ParaphrasePool[] {
  const docFreq = new Map<string, number>();
  const wordSets = rows.map((r) => {
    const set = new Set(words(r.text).filter((w) => w.length >= 4));
    for (const w of set) docFreq.set(w, (docFreq.get(w) ?? 0) + 1);
    return set;
  });
  return rows.map((r, i) => ({
    id: r.id,
    label: r.label,
    rare: new Set([...wordSets[i]!].filter((w) => (docFreq.get(w) ?? 0) <= RARE_MAX_DOCS)),
    three: new Set(shingles(words(r.text), 3)),
  }));
}

/** 드문 낱말이 으뜸으로 몰리고 세 낱말 묶음도 겹치면 같은 지문으로 본다 */
function bestParaphraseMatch(
  pool: ParaphrasePool[],
  excerpt: string,
  rareWords: Set<string>
): { id: string; label: string } | null {
  const ws = words(excerpt);
  const mine = [...new Set(ws.filter((w) => w.length >= 4 && rareWords.has(w)))];
  if (mine.length < MIN_RARE_HITS) return null;
  const tri = shingles(ws, 3);
  if (tri.length === 0) return null;

  let best: { id: string; label: string; hits: number; tri: number } | null = null;
  let second = 0;
  for (const m of pool) {
    let hits = 0;
    for (const w of mine) if (m.rare.has(w)) hits++;
    if (!best || hits > best.hits) {
      second = best?.hits ?? 0;
      let t = 0;
      for (const g of tri) if (m.three.has(g)) t++;
      best = { id: m.id, label: m.label, hits, tri: t / tri.length };
    } else if (hits > second) {
      second = hits;
    }
  }
  if (!best || best.hits < MIN_RARE_HITS || best.hits <= second) return null;
  if (best.tri < MIN_TRIGRAM) return null;
  return { id: best.id, label: best.label };
}

export async function matchLessonMaterials(
  admin: SupabaseClient,
  academyId: string,
  excerpts: { key: string; excerpt: string | null }[]
): Promise<Map<string, { itemId: string; label: string }>> {
  if (!excerpts.some((e) => e.excerpt && words(e.excerpt).length >= 8)) return new Map();
  // 수업자료 하나 = 지문 하나(문장들을 이어 붙인 것)와 대조한다
  const pool = (await loadAcademyMaterialPassages(admin, academyId)).map((m) => ({
    id: m.firstItemId,
    label: `${m.folder} · ${m.title}`,
    set: new Set(shingles(words(m.text))),
  }));
  const out = new Map<string, { itemId: string; label: string }>();
  for (const [k, v] of bestMatches(pool, excerpts)) out.set(k, { itemId: v.id, label: v.label });
  return out;
}

/**
 * 교과서 본문과 대조 → 출처(예: 천재(조수경) 영어1 2과 본문3). 맞은 것만 단다.
 *
 * 이득희 선생님 말씀(2026-09-29): "저희 지역 학교가 지난번 서술형 포함하면
 * 교과서에서 70%가 나왔습니다. 이런 데이터가 없다면 70%라는 확률도 나오지 않기에
 * 분석지가 더 꼼꼼하게 작성되어 있으면 효율성의 면에서 도움이 되리라 봅니다."
 *
 * 그때까지는 수업자료와 모의고사만 대조했고 교과서 본문은 보지 않았다. 그래서
 * 분석한 여덟 시험 모두 교과서 적중이 0건이었다. 교과서 본문 891개를 넣어 보니
 * 호원고 고2가 77%, 의정부고 고2가 50%, 발곡고 고2가 41%로 바로 잡혔다.
 */
export async function matchTextbookPassages(
  admin: SupabaseClient,
  academyId: string,
  excerpts: { key: string; excerpt: string | null }[]
): Promise<Map<string, { textbookId: string; label: string }>> {
  if (!excerpts.some((e) => e.excerpt && words(e.excerpt).length >= 8)) return new Map();
  const ownerId = await resolveTextbookPassageAcademyId(admin, academyId);
  const rows: {
    id: string;
    subject: string;
    publisher: string;
    lesson: string;
    part: string;
    english_text: string;
  }[] = [];
  for (let from = 0; ; from += 1000) {
    const { data } = await admin
      .from("textbook_passages")
      .select("id, subject, publisher, lesson, part, english_text")
      .eq("academy_id", ownerId)
      .range(from, from + 999);
    rows.push(...((data ?? []) as typeof rows));
    if (!data || data.length < 1000) break;
  }
  const pool = rows.map((m) => ({
    id: m.id,
    label: `${m.publisher} ${m.subject} ${m.lesson} ${m.part}`,
    set: new Set(shingles(words(String(m.english_text ?? "")))),
  }));
  const out = new Map<string, { textbookId: string; label: string }>();
  for (const [k, v] of bestMatches(pool, excerpts)) out.set(k, { textbookId: v.id, label: v.label });

  /*
   * 글자로 못 잡은 것은 고유명사로 한 번 더 본다 — 학교가 지문을 바꿔 써서 내는
   * 일이 있다. 자세한 사정은 bestParaphraseMatch에 적었다.
   */
  const left = excerpts.filter((e) => !out.has(e.key) && e.excerpt && words(e.excerpt).length >= 8);
  if (left.length > 0) {
    const paraPool = buildParaphrasePool(
      rows.map((m) => ({
        id: m.id,
        label: `${m.publisher} ${m.subject} ${m.lesson} ${m.part}`,
        text: String(m.english_text ?? ""),
      }))
    );
    const rareWords = new Set<string>();
    for (const p of paraPool) for (const w of p.rare) rareWords.add(w);
    for (const e of left) {
      const hit = bestParaphraseMatch(paraPool, e.excerpt!, rareWords);
      if (hit) out.set(e.key, { textbookId: hit.id, label: hit.label });
    }
  }
  return out;
}

/** 모의고사 지문 모음과 대조 → 출처(예: 24년 고2 6월 학평 24번). 맞은 것만 단다. */
export async function matchMockPassages(
  admin: SupabaseClient,
  excerpts: { key: string; excerpt: string | null }[]
): Promise<Map<string, { mockId: string; label: string }>> {
  if (!excerpts.some((e) => e.excerpt && words(e.excerpt).length >= 8)) return new Map();
  const pool = (await loadAllMockPassages(admin)).map((m) => ({
    id: m.id,
    label: mockPassageShortLabel(m),
    set: new Set(shingles(words(m.english_text))),
  }));
  const out = new Map<string, { mockId: string; label: string }>();
  for (const [k, v] of bestMatches(pool, excerpts)) out.set(k, { mockId: v.id, label: v.label });
  return out;
}

/** 저장된 문항표를 수업자료와 다시 대조해 적중 칸을 채운다(끄면 비운다). AI는 쓰지 않는다. */
export async function refreshMaterialMatches(
  admin: SupabaseClient,
  analysisId: string,
  academyId: string,
  enabled: boolean
): Promise<number> {
  /*
   * 선생님이 손으로 단 출처는 건드리지 않는다 — 자동 대조가 덮어쓰면 다시 비어 버린다.
   */
  const { data: items } = await admin
    .from("school_exam_items")
    .select("id, passage_excerpt")
    .eq("analysis_id", analysisId)
    .eq("source_edited", false);
  const rows = items ?? [];
  const matches = enabled
    ? await matchLessonMaterials(
        admin,
        academyId,
        rows.map((r) => ({ key: r.id as string, excerpt: (r.passage_excerpt as string | null) ?? null }))
      )
    : new Map<string, { itemId: string; label: string }>();
  await Promise.all(
    rows.map((r) => {
      const m = matches.get(r.id as string);
      return admin
        .from("school_exam_items")
        .update({ matched_item_id: m?.itemId ?? null, matched_label: m?.label ?? null })
        .eq("id", r.id as string);
    })
  );
  await admin.from("school_exam_analyses").update({ match_materials: enabled }).eq("id", analysisId);
  return matches.size;
}
