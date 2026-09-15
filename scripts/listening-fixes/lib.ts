/**
 * 듣기 문항 데이터 수정 스크립트 공통 도구.
 * - 기본은 미리보기(dry-run): 바뀔 내용만 출력한다. --apply 를 붙여야 저장한다.
 * - 저장 전에 바뀌는 행(문항 + segment)을 backups/<시각>-<이름>.json 에 통째로 백업한다.
 * - 정수학원(jeongsu) 원본을 고치고, 다른 6개 학원의 사본(같은 세트 제목 + 같은 문항 번호 +
 *   내용이 원본과 똑같은 것)에 똑같이 반영한다. 내용이 다른 사본은 건드리지 않고 알린다.
 */
import { mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export function loadEnvLocal() {
  const envPath = resolve(process.cwd(), ".env.local");
  for (const line of readFileSync(envPath, "utf8").split(/\r?\n/)) {
    const m = line.match(/^([^#=]+)=(.*)$/);
    if (!m) continue;
    const k = m[1]!.trim();
    const v = m[2]!.trim().replace(/^['"]|['"]$/g, "");
    if (!process.env[k]) process.env[k] = v;
  }
}
loadEnvLocal();

export const APPLY = process.argv.includes("--apply");
export const TEMPLATE_SLUG = "jeongsu";

export const admin: SupabaseClient = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { persistSession: false } }
);

export type Row = Record<string, unknown> & {
  id: string;
  set_id: string;
  order_index: number;
  question_type: string;
  instruction: string;
  script_text: string;
  question_text: string;
  choices: string[];
  correct_answer: number;
  explanation: string;
};

export type SegRow = {
  id: string;
  question_id: string;
  order_index: number;
  speaker_type: string;
  text: string;
  voice_name: string | null;
  audio_url: string | null;
  duration_ms: number | null;
};

export type SetRow = {
  id: string;
  title: string;
  academy_id: string;
  grade_level: string;
};

export type Loaded = {
  academies: Array<{ id: string; slug: string }>;
  sets: SetRow[];
  setById: Map<string, SetRow>;
  slugByAcademy: Map<string, string>;
  questions: Row[];
  segmentsByQuestion: Map<string, SegRow[]>;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = any;

async function selectAll<T>(
  table: string,
  cols: string,
  filter: (q: AnyQuery) => AnyQuery
): Promise<T[]> {
  const out: T[] = [];
  for (let from = 0; ; from += 1000) {
    const { data, error } = await filter(admin.from(table).select(cols))
      .order("id")
      .range(from, from + 999);
    if (error) throw new Error(`${table}: ${error.message}`);
    out.push(...((data ?? []) as T[]));
    if (!data || data.length < 1000) break;
  }
  return out;
}

/** 7개 학원의 듣기 세트·문항·segment를 모두 읽는다 (gradeLevels로 좁힐 수 있음) */
export async function loadAll(opts?: { gradeLevels?: string[]; titles?: string[] }): Promise<Loaded> {
  const { data: acs, error } = await admin.from("academies").select("id, slug");
  if (error) throw new Error(error.message);
  const academies = (acs ?? []) as Array<{ id: string; slug: string }>;
  const slugByAcademy = new Map(academies.map((a) => [a.id, a.slug]));
  let sets = await selectAll<SetRow>("listening_sets", "id, title, academy_id, grade_level", (q) =>
    q.in(
      "academy_id",
      academies.map((a) => a.id)
    )
  );
  if (opts?.gradeLevels) sets = sets.filter((s) => opts.gradeLevels!.includes(s.grade_level));
  if (opts?.titles) sets = sets.filter((s) => opts.titles!.includes(s.title));
  const setById = new Map(sets.map((s) => [s.id, s]));
  const setIds = sets.map((s) => s.id);
  const questions: Row[] = [];
  for (let i = 0; i < setIds.length; i += 40) {
    questions.push(
      ...(await selectAll<Row>("listening_questions", "*", (q) =>
        q.in("set_id", setIds.slice(i, i + 40))
      ))
    );
  }
  const segs: SegRow[] = [];
  const qIds = questions.map((q) => q.id);
  for (let i = 0; i < qIds.length; i += 150) {
    segs.push(
      ...(await selectAll<SegRow>(
        "listening_question_segments",
        "id, question_id, order_index, speaker_type, text, voice_name, audio_url, duration_ms",
        (q) => q.in("question_id", qIds.slice(i, i + 150))
      ))
    );
  }
  const segmentsByQuestion = new Map<string, SegRow[]>();
  for (const s of segs) {
    const list = segmentsByQuestion.get(s.question_id) ?? [];
    list.push(s);
    segmentsByQuestion.set(s.question_id, list);
  }
  for (const list of segmentsByQuestion.values()) list.sort((a, b) => a.order_index - b.order_index);
  return { academies, sets, setById, slugByAcademy, questions, segmentsByQuestion };
}

export function slugOf(d: Loaded, q: Row): string {
  const set = d.setById.get(q.set_id);
  return set ? d.slugByAcademy.get(set.academy_id) ?? "?" : "?";
}

export function keyOf(d: Loaded, q: Row): string {
  return `${d.setById.get(q.set_id)?.title}#${q.order_index}`;
}

export function templateQuestions(d: Loaded): Row[] {
  return d.questions.filter((q) => slugOf(d, q) === TEMPLATE_SLUG);
}

export function findTemplate(d: Loaded, title: string, orderIndex: number): Row | undefined {
  return templateQuestions(d).find(
    (q) => d.setById.get(q.set_id)?.title === title && q.order_index === orderIndex
  );
}

/** 사본이 원본과 같은지 볼 때 쓰는 내용 서명 */
export function contentSignature(d: Loaded, q: Row): string {
  const segs = (d.segmentsByQuestion.get(q.id) ?? []).map((s) => `${s.speaker_type}:${s.text}`);
  return JSON.stringify([
    q.instruction,
    q.script_text,
    q.choices,
    q.correct_answer,
    q.explanation,
    q.question_text,
    q.question_type,
    segs,
  ]);
}

/** 원본의 다른 학원 사본들. 내용이 원본과 다른 사본은 mismatched로 따로 돌려준다 */
export function copiesOf(d: Loaded, template: Row): { copies: Row[]; mismatched: Row[] } {
  const title = d.setById.get(template.set_id)?.title;
  const sig = contentSignature(d, template);
  const copies: Row[] = [];
  const mismatched: Row[] = [];
  for (const q of d.questions) {
    if (q.id === template.id) continue;
    if (q.order_index !== template.order_index) continue;
    if (d.setById.get(q.set_id)?.title !== title) continue;
    if (slugOf(d, q) === TEMPLATE_SLUG) continue;
    if (contentSignature(d, q) === sig) copies.push(q);
    else mismatched.push(q);
  }
  return { copies, mismatched };
}

/** 스크립트는 저장소 루트에서 실행한다 (npx tsx scripts/listening-fixes/...) */
const HERE = resolve(process.cwd(), "scripts", "listening-fixes");

/** 바뀌는 행을 통째로 백업 (문항 + segment) */
export function writeBackup(label: string, d: Loaded, rows: Row[]): string {
  const dir = resolve(HERE, "backups");
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = resolve(dir, `${stamp}-${label}.json`);
  const payload = rows.map((q) => ({
    academy: slugOf(d, q),
    key: keyOf(d, q),
    question: q,
    segments: d.segmentsByQuestion.get(q.id) ?? [],
  }));
  writeFileSync(file, JSON.stringify({ label, created_at: new Date().toISOString(), rows: payload }, null, 1));
  return file;
}

export function showDiff(before: Record<string, unknown>, patch: Record<string, unknown>): string[] {
  const lines: string[] = [];
  for (const [k, v] of Object.entries(patch)) {
    const b = JSON.stringify(before[k]);
    const a = JSON.stringify(v);
    if (a === b) continue;
    lines.push(`    ${k}:\n      - ${b}\n      + ${a}`);
  }
  return lines;
}

export async function updateQuestion(id: string, patch: Record<string, unknown>): Promise<void> {
  const { error } = await admin.from("listening_questions").update(patch).eq("id", id);
  if (error) throw new Error(`update ${id}: ${error.message}`);
}

/** 학생 풀이 기록 수 (선택 번호가 저장된 listening_exam_answers) */
export async function countExamAnswers(questionIds: string[]): Promise<Map<string, number>> {
  const counts = new Map<string, number>();
  for (let i = 0; i < questionIds.length; i += 100) {
    const chunk = questionIds.slice(i, i + 100);
    for (let from = 0; ; from += 1000) {
      const { data, error } = await admin
        .from("listening_exam_answers")
        .select("question_id")
        .in("question_id", chunk)
        .range(from, from + 999);
      if (error) throw new Error(error.message);
      for (const r of data ?? []) {
        const id = r.question_id as string;
        counts.set(id, (counts.get(id) ?? 0) + 1);
      }
      if (!data || data.length < 1000) break;
    }
  }
  return counts;
}

export type PlannedFix = {
  template: Row;
  /** 원본·사본 모두에 똑같이 넣을 값 */
  patch: Record<string, unknown>;
  reason: string;
  /** 정답 번호가 가리키는 선택지가 바뀌면 true (학생 기록 영향 집계용) */
  indexMeaningChanges?: boolean;
};

/**
 * 계획된 수정을 원본+사본에 반영한다 (dry-run이면 출력만).
 * 사본은 원본과 내용이 같을 때만 고친다.
 */
export async function runPlannedFixes(label: string, d: Loaded, fixes: PlannedFix[]): Promise<void> {
  const targets: Array<{ row: Row; patch: Record<string, unknown>; fix: PlannedFix }> = [];
  const perAcademy = new Map<string, number>();
  for (const fix of fixes) {
    const { copies, mismatched } = copiesOf(d, fix.template);
    console.log(`\n■ ${keyOf(d, fix.template)} — ${fix.reason}`);
    for (const line of showDiff(fix.template, fix.patch)) console.log(line);
    console.log(`    사본 ${copies.length}개 (${copies.map((c) => slugOf(d, c)).join(", ")})`);
    if (mismatched.length) {
      console.log(
        `    ⚠ 내용이 원본과 달라 건너뜀: ${mismatched.map((c) => slugOf(d, c)).join(", ")}`
      );
    }
    for (const row of [fix.template, ...copies]) {
      targets.push({ row, patch: fix.patch, fix });
      perAcademy.set(slugOf(d, row), (perAcademy.get(slugOf(d, row)) ?? 0) + 1);
    }
  }
  console.log(`\n합계: 원본 ${fixes.length}문항, 전체 ${targets.length}행`);
  console.log(`학원별: ${[...perAcademy.entries()].map(([k, v]) => `${k} ${v}`).join(", ")}`);

  const meaningIds = targets.filter((t) => t.fix.indexMeaningChanges).map((t) => t.row.id);
  if (meaningIds.length) {
    const counts = await countExamAnswers(meaningIds);
    const total = [...counts.values()].reduce((a, b) => a + b, 0);
    const withAttempts = [...counts.keys()].length;
    console.log(`정답 번호 의미가 바뀌는 문항 중 학생 풀이 기록이 있는 문항: ${withAttempts}개 (기록 ${total}건)`);
  }

  if (!APPLY) {
    console.log("\n(미리보기만 했습니다. 저장하려면 --apply 를 붙여 다시 실행하세요.)");
    return;
  }
  const file = writeBackup(label, d, targets.map((t) => t.row));
  console.log(`백업: ${file}`);
  let ok = 0;
  for (const t of targets) {
    await updateQuestion(t.row.id, t.patch);
    ok++;
  }
  console.log(`저장 완료: ${ok}행`);
}
