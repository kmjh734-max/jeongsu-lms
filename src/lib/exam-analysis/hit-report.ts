/**
 * 학교 시험지와 선생님이 만들어 둔 것을 대조해 「적중」을 뽑는다.
 *
 * 까닭(선생님 지시 2026-10-01): 지금은 지문이 같으면 「출처: 공통영어2 3과」처럼
 * 이름만 달아 준다. 그래서는 「그래서 내가 뭘 맞췄는데?」를 알 수 없다.
 * 같은 지문으로 내가 만든 <b>실제 문항</b>을 보여 주고, 유형까지 같으면 적중으로 센다.
 *
 * 적중의 뜻(선생님 결정): <b>지문 + 유형이 모두 같아야</b> 적중이다.
 * 지문만 같은 것은 「이 지문은 이 유형도 내야 한다」는 뜻이라 따로 모아 보여 준다.
 *
 * 대조하는 곳은 셋이다 — 변형문제 지문 · 수업자료 · 모의고사 지문 모음.
 * 모델을 부르지 않는다(글자 대조).
 */
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ExamItemRow } from "@/lib/exam-analysis/types";
import { examTypeToOptionKey } from "@/lib/exam-analysis/blueprint";
import { getWorkbookTypeMeta } from "@/lib/lesson-materials/workbook-types";
import { findPassageAt, typesNear } from "@/lib/exam-analysis/uploaded-material";
import {
  askedSameSpot,
  examAskedWords,
  examAskedWordsFromPage,
  myAskedWords,
  TYPE_ONLY_IS_ENOUGH,
} from "@/lib/exam-analysis/detail-match";

/** 적중 한 줄 — 시험지 문항 하나에 걸린 내 문항 하나 */
export type HitRow = {
  /** 어디서 온 문항인가 */
  from: "변형문제" | "수업자료" | "올린 자료";
  /** 보여 줄 이름 (예: 변형문제 「시각적 심상」 12번) */
  label: string;
  /** 유형 이름 */
  typeName: string;
  /** 유형까지 같은가 */
  sameType: boolean;
  /**
   * 묻는 자리까지 같은가 — 유형이 같아도 빈칸·밑줄 자리가 다르면 다른 문제다.
   * null 이면 잴 수 없었다는 뜻(시험지 쪽에 정답 짐작이 없다).
   */
  sameSpot?: boolean | null;
  /** 눌러서 펼쳐 볼 수 있게 — 변형문제면 문항 id */
  questionId?: string;
  /** 문항 미리보기(발문 한 줄) */
  preview?: string;
  /** 언제 만든 자료인가 */
  madeAt?: string;
  /** 시험지를 올리기 전에 만든 것인가 — 적중은 이것만 센다 */
  before: boolean;
};

export type ItemHit = {
  itemId: string;
  itemNo: string;
  typeName: string;
  /** 지문이 같은 내 문항들 (유형이 같은 것이 앞에 온다) */
  rows: HitRow[];
  /** 지문도 유형도 같은 것이 있는가 */
  hit: boolean;
  /** 묻는 자리까지 같은 것이 있는가 — 진짜 적중 */
  spotHit: boolean;
  /** 지문만 같은 것이 있는가 */
  passageOnly: boolean;
  /**
   * 이 지문이 어디서 온 것인가(모의고사·교과서·수업자료).
   *
   * 고등 시험지를 재 보니(2026-10-01) 지문이 거의 모의고사 지문 모음과 교과서에서
   * 나왔다. 못 맞춘 문항은 「어디서 가져올지」를 알려 주어야 다음에 만들 수 있다.
   */
  source: string | null;
};

export type HitReport = {
  items: ItemHit[];
  total: number;
  hit: number;
  passageOnly: number;
  missed: number;
  /** 적중을 가르는 기준 날짜(이 시험지를 올린 때) */
  cutoff: string | null;
  /** 시험 뒤에 만들어 적중으로 세지 않은 문항 수 */
  afterOnly: number;
  /** 묻는 자리까지 같은 문항 수 */
  spotHit: number;
};

/** 자료 갈래를 사람이 읽는 이름으로 */
const KIND_NAME: Record<string, string> = {
  lesson_pack: "수업용 자료",
  analysis_report: "지문 분석서",
  workbook: "워크북",
  one_page_test: "1장 테스트",
  one_page_summary: "1장 요약자료",
  integrated: "최종통합자료",
};

const words = (s: string) =>
  s
    .toLowerCase()
    .replace(/<\/?u>/g, " ")
    .replace(/[^a-z0-9'\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);

function shingles(ws: string[], n = 5): Set<string> {
  const out = new Set<string>();
  for (let i = 0; i + n <= ws.length; i++) out.add(ws.slice(i, i + n).join(" "));
  return out;
}

/** 시험지 지문과 내 지문이 같은 글인가 — match-materials 와 같은 잣대 */
const MIN_RATIO = 0.3;
const MIN_HITS = 5;

function samePassage(examSet: Set<string>, mineSet: Set<string>): boolean {
  if (examSet.size === 0 || mineSet.size === 0) return false;
  let hits = 0;
  for (const g of examSet) if (mineSet.has(g)) hits += 1;
  if (hits === 0) return false;
  return hits / examSet.size >= MIN_RATIO || hits >= MIN_HITS;
}

/** 워크북 갈래 → 학교 시험지 유형 이름 */
const WORKBOOK_TO_EXAM: Record<string, string[]> = {
  grammar_choice: ["어법 판단", "어법 (개수)"],
  grammar_fix: ["어법 오류 수정"],
  vocab_choice: ["어휘 판단", "어휘 (개수)"],
  vocab_fix: ["어휘 판단"],
  sentence_order: ["순서 배열"],
  word_order_writing: ["조건 영작(배열)", "우리말 조건 영작"],
  full_en_writing: ["조건 영작(배열)"],
  blank_fill: ["빈칸 영작", "본문 찾아 쓰기"],
  tf: ["내용 일치", "내용 불일치", "일치 개수"],
  one_line_ko: [],
};

/**
 * @param cutoff 이 시험지를 올린 때. 그보다 <b>앞서</b> 만든 자료만 적중으로 센다.
 *   선생님 말씀(2026-10-01): 「지금 올린 건 지난번 시험이니 적중이 0인 게 당연하다」.
 *   맞는 말이다. 시험이 끝난 뒤에 만든 자료를 적중이라고 하면 아무 뜻이 없다.
 */
export async function buildHitReport(
  admin: SupabaseClient,
  academyId: string,
  items: ExamItemRow[],
  cutoff?: string | null,
  /** 선생님이 올리신 자료에서 뽑은 글 (파일 이름 + 본문) */
  uploads: Array<{ name: string; text: string }> = []
): Promise<HitReport> {
  const cutoffMs = cutoff ? new Date(cutoff).getTime() : Number.POSITIVE_INFINITY;
  const madeBefore = (at: unknown) => {
    const t = at ? new Date(String(at)).getTime() : NaN;
    return Number.isFinite(t) ? t < cutoffMs : true;
  };
  const withPassage = items.filter((it) => (it.passage_excerpt ?? "").trim().length > 40);
  if (withPassage.length === 0) {
    return {
      items: [],
      total: items.length,
      hit: 0,
      passageOnly: 0,
      missed: items.length,
      cutoff: cutoff ?? null,
      afterOnly: 0,
      spotHit: 0,
    };
  }

  /*
   * 시험지 쪽 글 — 문항표에는 지문 앞 150자뿐이라 빈칸·밑줄이 없다. 쪽 글에는 남아 있다.
   * 「묻는 자리까지 같은가」는 이것으로 잰다(2026-10-01).
   */
  const analysisId = (items[0] as unknown as { analysis_id?: string })?.analysis_id ?? null;
  let pageText = "";
  if (analysisId) {
    const { data: pages } = await admin
      .from("school_exam_pages")
      .select("text")
      .eq("analysis_id", analysisId)
      .order("page_no");
    pageText = (pages ?? []).map((p) => String(p.text ?? "")).join("\n");
  }

  // ── 내 변형문제 지문과 그 지문으로 만든 문항
  const { data: passages } = await admin
    .from("english_source_passages")
    .select("id, title, passage")
    .limit(4000);
  const { data: made } = await admin
    .from("generated_english_questions")
    .select("id, passage_id, option_key, instruction, created_at, passage_modified, correct_answer, question_text, choices")
    .eq("academy_id", academyId)
    .limit(20000);
  const madeByPassage = new Map<string, NonNullable<typeof made>>();
  for (const q of made ?? []) {
    const k = String(q.passage_id ?? "");
    if (!k) continue;
    madeByPassage.set(k, [...(madeByPassage.get(k) ?? []), q]);
  }
  const passagePool = (passages ?? [])
    .filter((p) => madeByPassage.has(String(p.id)))
    .map((p) => ({
      id: String(p.id),
      title: String(p.title ?? "지문"),
      set: shingles(words(String(p.passage ?? ""))),
    }));

  // ── 수업자료 지문과 그 지문으로 만든 자료
  const { data: projects } = await admin
    .from("lesson_material_projects")
    .select("id, title")
    .eq("academy_id", academyId)
    .limit(3000);
  const projectIds = (projects ?? []).map((p) => String(p.id));
  const projectTitle = new Map(projectIds.map((id, i) => [id, String(projects![i]!.title ?? "수업자료")]));
  const sentences: Array<{ project_id: string; english_text: string }> = [];
  for (let i = 0; i < projectIds.length; i += 200) {
    const { data } = await admin
      .from("lesson_material_items")
      .select("project_id, english_text, order_index")
      .in("project_id", projectIds.slice(i, i + 200))
      .order("order_index")
      .limit(20000);
    sentences.push(...((data ?? []) as typeof sentences));
  }
  const textByProject = new Map<string, string>();
  for (const s of sentences) {
    const k = String(s.project_id);
    textByProject.set(k, `${textByProject.get(k) ?? ""} ${s.english_text ?? ""}`);
  }
  const { data: docs } = await admin
    .from("lesson_material_documents")
    .select("id, kind, name, project_ids, payload, created_at")
    .eq("academy_id", academyId)
    .is("deleted_at", null)
    .limit(3000);
  const docsByProject = new Map<string, NonNullable<typeof docs>>();
  for (const d of docs ?? []) {
    for (const pid of (d.project_ids as string[] | null) ?? []) {
      docsByProject.set(String(pid), [...(docsByProject.get(String(pid)) ?? []), d]);
    }
  }
  const materialPool = [...textByProject]
    .filter(([pid]) => docsByProject.has(pid))
    .map(([pid, text]) => ({ id: pid, title: projectTitle.get(pid) ?? "수업자료", set: shingles(words(text)) }));

  // ── 대조
  const out: ItemHit[] = [];
  for (const it of items) {
    const excerpt = (it.passage_excerpt ?? "").trim();
    const examSet = excerpt.length > 40 ? shingles(words(excerpt)) : new Set<string>();
    const want = examTypeToOptionKey(it);
    const rows: HitRow[] = [];

    if (examSet.size > 0) {
      for (const p of passagePool) {
        if (!samePassage(examSet, p.set)) continue;
        for (const q of madeByPassage.get(p.id) ?? []) {
          const code = String(q.option_key).split(":").pop() ?? "";
          const sameType = !want.substituted && String(q.option_key) === want.key;
          rows.push({
            from: "변형문제",
            label: `변형문제 「${p.title}」`,
            typeName: code,
            /*
             * 대체 유형(영영풀이 → 어휘추론처럼 비슷한 것으로 바꿔 둔 것)은 적중이 아니다.
             * 선생님 결정(2026-10-01): 지문 + 유형이 <b>같아야</b> 적중이다.
             */
            sameType,
            // 유형이 같을 때만 더 들어가 본다 — 유형이 다르면 자리를 견줄 까닭이 없다
            sameSpot: !sameType
              ? null
              : // 문장삽입·순서배열·무관한문장은 유형만 같으면 적중으로 친다
                TYPE_ONLY_IS_ENOUGH.has(code)
                ? true
                : askedSameSpot(
                  [
                    ...examAskedWordsFromPage(pageText, it.passage_excerpt ?? ""),
                    ...examAskedWords(it.answer_guess, it.grammar_point),
                  ],
                  myAskedWords({
                    passageModified: q.passage_modified as string | null,
                    correctAnswer: q.correct_answer,
                    questionText: q.question_text as string | null,
                    choices: q.choices as Array<{ text?: string }> | null,
                  })
                ),
            questionId: String(q.id),
            preview: String(q.instruction ?? "").slice(0, 60),
            madeAt: String(q.created_at ?? ""),
            before: madeBefore(q.created_at),
          });
        }
      }
      for (const m of materialPool) {
        if (!samePassage(examSet, m.set)) continue;
        for (const d of docsByProject.get(m.id) ?? []) {
          const payload = (d.payload ?? {}) as Record<string, unknown>;
          // 워크북은 selectedTypes 에 고른 갈래가 들어 있다(2026-10-01 확인)
          const kinds = Array.isArray(payload.selectedTypes) ? (payload.selectedTypes as string[]) : [];
          const name = String(d.name ?? "수업자료");
          if (kinds.length === 0) {
            rows.push({
              from: "수업자료",
              label: `${name} 「${m.title}」`,
              typeName: KIND_NAME[String(d.kind)] ?? String(d.kind),
              sameType: false,
              sameSpot: null,
              madeAt: String(d.created_at ?? ""),
              before: madeBefore(d.created_at),
            });
            continue;
          }
          const examName = it.type_name.split(" · ")[0]!.trim();
          for (const k of kinds) {
            rows.push({
              from: "수업자료",
              label: `${name} 「${m.title}」`,
              typeName: getWorkbookTypeMeta(k as never)?.title ?? k,
              sameType: (WORKBOOK_TO_EXAM[k] ?? []).includes(examName),
              // 워크북은 문항 속을 들여다볼 수 없어 자리까지는 못 잰다
              sameSpot: null,
              madeAt: String(d.created_at ?? ""),
              before: madeBefore(d.created_at),
            });
          }
        }
      }
    }

    /*
     * 올리신 자료 — 문항표가 없으므로 지문 자리를 찾고 그 가까이의 발문으로 유형을 읽는다.
     * 파일 전체에서 아무 발문이나 끌어오면 내지도 않은 유형을 맞췄다고 하게 된다.
     */
    if (excerpt.length > 40) {
      const examName = it.type_name.split(" · ")[0]!.trim();
      for (const u of uploads) {
        const at = findPassageAt(u.text, excerpt);
        if (at < 0) continue;
        const near = typesNear(u.text, at);
        if (near.length === 0) {
          rows.push({ from: "올린 자료", label: u.name, typeName: "지문 있음", sameType: false, sameSpot: null, before: true });
          continue;
        }
        for (const t of near) {
          rows.push({ from: "올린 자료", label: u.name, typeName: t, sameType: t === examName, sameSpot: null, before: true });
        }
      }
    }

    const rank = (r: HitRow) =>
      (r.sameType && r.before ? 2 : 0) + (r.sameSpot === true ? 1 : 0);
    rows.sort((a, b) => rank(b) - rank(a));
    // 적중은 시험지를 올리기 전에 만든 것만 센다
    const hit = rows.some((r) => r.sameType && r.before);
    const spotHit = rows.some((r) => r.sameType && r.before && r.sameSpot === true);
    out.push({
      itemId: it.id,
      itemNo: it.item_no,
      typeName: it.type_name,
      rows: rows.slice(0, 12),
      hit,
      spotHit,
      passageOnly: !hit && rows.length > 0,
      source:
        it.matched_mock_label ||
        it.matched_textbook_label ||
        it.matched_label ||
        null,
    });
  }

  return {
    items: out,
    total: out.length,
    hit: out.filter((x) => x.hit).length,
    passageOnly: out.filter((x) => x.passageOnly).length,
    missed: out.filter((x) => !x.hit && !x.passageOnly).length,
    cutoff: cutoff ?? null,
    afterOnly: out.filter((x) => !x.hit && x.rows.some((r) => r.sameType && !r.before)).length,
    spotHit: out.filter((x) => x.spotHit).length,
  };
}
