/**
 * 너무 쉬운 듣기 문항 대본 다시 쓰기 + 다시 녹음 (2026-09-16)
 *
 * 다시 쓴 내용(대본 segment·해석·해설·정답 근거·유형별 필드)은 검토를 마친
 * 08-rewrite-easy.data.json 에 있다. 지시문·선택지·정답 번호는 바꾸지 않는다.
 * before_sha = 바꾸기 전 정수학원 원본의 내용 서명. 원본·사본이 이 서명과 같을 때만 고친다.
 *
 *   npx --yes tsx --tsconfig tsconfig.json scripts/listening-fixes/08-rewrite-easy.ts
 *       미리보기: 문항마다 바뀌기 전/후 대본, 규칙 검수 결과, 사본 상태, 예상 녹음 수
 *   ... 08-rewrite-easy.ts --apply
 *       정수학원: 백업 → 문항·segment 저장(받아쓰기 초기화) → 음원 녹음(유료, ElevenLabs) → 음원 검증
 *   ... 08-rewrite-easy.ts --apply --no-audio      글만 저장 (녹음은 나중에 --audio --apply)
 *   ... 08-rewrite-easy.ts --audio --apply         새 대본인데 음원 검증 기록이 없는 문항만 녹음
 *   ... 08-rewrite-easy.ts --propagate [--apply]   사본 6곳에 새 대본·segment·음원 주소 복사 (원본 녹음 검증 후)
 *   공통 옵션: --only="고1 듣기 1회#6,중1 6회#4"  --limit=N  --include-later  --quiet
 *
 * 음원 파일 경로는 문항마다 하나(final.mp3, 덮어쓰기)이고 사본은 원본 파일을 함께 쓴다.
 * 그래서 녹음 뒤 audio_url 에 ?v=시각 을 붙여 브라우저·CDN 캐시가 옛 음원을 주지 않게 한다.
 * 녹음 결과는 backups/08-audio-state.json 에 남긴다 (다시 실행하면 이어서 한다).
 */
import { createHash } from "crypto";
import { existsSync, mkdirSync, readFileSync, writeFileSync } from "fs";
import { resolve } from "path";
import {
  APPLY,
  TEMPLATE_SLUG,
  admin,
  contentSignature,
  countExamAnswers,
  findTemplate,
  loadAll,
  slugOf,
  writeBackup,
  type Loaded,
  type Row,
  type SegRow,
} from "./lib";
import { easyGuards, runRuleChecks, toGenerated, type SimpleSeg } from "./check-lib";
import { isCriticalQualityCode } from "../../src/lib/listening/generic-quality-checks";
import { DICTATION_RESET_FIELDS } from "../../src/lib/listening/dictation/reset-fields";
import { generateQuestionAudio } from "../../src/lib/listening/generate-audio";
import type { ListeningGradeLevel } from "../../src/lib/listening/grade-level";
import type { PriceCalculation } from "../../src/lib/listening/price-check";

const HERE = resolve(process.cwd(), "scripts", "listening-fixes");
const DATA_FILE = resolve(HERE, "08-rewrite-easy.data.json");
const STATE_FILE = resolve(HERE, "backups", "08-audio-state.json");

const argv = process.argv.slice(2);
const has = (f: string) => argv.includes(f);
const opt = (name: string) => argv.find((a) => a.startsWith(`--${name}=`))?.slice(name.length + 3);
const MODE_PROPAGATE = has("--propagate");
const MODE_AUDIO_ONLY = has("--audio");
const NO_AUDIO = has("--no-audio");
const QUIET = has("--quiet");
const INCLUDE_LATER = has("--include-later");
const ONLY = opt("only")
  ?.split(",")
  .map((s) => s.trim())
  .filter(Boolean);
const LIMIT = opt("limit") ? Number(opt("limit")) : undefined;

type Item = {
  key: string;
  status: "ready" | "later";
  grade: ListeningGradeLevel;
  question_type: string;
  reason: string;
  before_sha: string;
  segments: SimpleSeg[];
  script_translation: string;
  answer_clue: string;
  explanation: string;
  choices?: string[];
  fields?: Record<string, unknown>;
  price_calculation?: PriceCalculation;
};

type AudioState = Record<
  string,
  {
    key: string;
    audio_url: string;
    bytes: number;
    duration_sec: number;
    old_duration_sec: number | null;
    words: number;
    old_words: number;
    ok: boolean;
    problems: string[];
    recorded_at: string;
    script_sha: string;
  }
>;

const sha = (s: string) => createHash("sha256").update(s).digest("hex");
const titleOf = (key: string) => key.slice(0, key.lastIndexOf("#"));
const orderOf = (key: string) => Number(key.slice(key.lastIndexOf("#") + 1));
const wordsOf = (segs: Array<{ text: string }>) =>
  segs.reduce((n, s) => n + s.text.trim().split(/\s+/).filter(Boolean).length, 0);

function loadState(): AudioState {
  return existsSync(STATE_FILE) ? (JSON.parse(readFileSync(STATE_FILE, "utf8")) as AudioState) : {};
}
function saveState(s: AudioState) {
  mkdirSync(resolve(HERE, "backups"), { recursive: true });
  writeFileSync(STATE_FILE, JSON.stringify(s, null, 1));
}

/** 옛 script_text 모양(화자 표시 유무)을 따라 새 script_text 를 만든다 */
function scriptTextFor(oldScript: string, segs: SimpleSeg[]): string {
  const prefixed = /^(M|W|ANN):/.test(String(oldScript ?? "").trim());
  if (!prefixed && segs.length === 1) return segs[0]!.text.trim();
  return segs.map((s) => `${s.speaker}: ${s.text.trim()}`).join("\n");
}

/** 원본·사본에 똑같이 넣을 글 필드 (answer_validation 은 행마다 자기 값에 answer_clue 만 바꿈) */
function textPatch(row: Row, it: Item): Record<string, unknown> {
  const p: Record<string, unknown> = {
    script_text: scriptTextFor(row.script_text, it.segments),
    script_translation: it.script_translation,
    answer_clue: it.answer_clue,
    explanation: it.explanation,
    ...(it.fields ?? {}),
    ...DICTATION_RESET_FIELDS,
  };
  if (it.choices) p.choices = it.choices;
  const av = row.answer_validation;
  if (av && typeof av === "object" && !Array.isArray(av)) {
    p.answer_validation = { ...(av as Record<string, unknown>), answer_clue: it.answer_clue };
  }
  return p;
}

function segsOf(d: Loaded, q: Row): SegRow[] {
  return d.segmentsByQuestion.get(q.id) ?? [];
}

/** 이 행이 이미 새 대본을 갖고 있는지 */
function hasNewText(d: Loaded, q: Row, it: Item): boolean {
  const segs = segsOf(d, q);
  return (
    q.script_text === scriptTextFor(q.script_text, it.segments) &&
    segs.length === it.segments.length &&
    segs.every((s, i) => s.speaker_type === it.segments[i]!.speaker && s.text === it.segments[i]!.text) &&
    q.explanation === it.explanation
  );
}

type Plan = {
  it: Item;
  template: Row;
  state: "old" | "new" | "changed";
  problems: string[];
  ruleBefore: number;
  ruleAfter: number;
};

function planItem(d: Loaded, it: Item): Plan {
  const template = findTemplate(d, titleOf(it.key), orderOf(it.key));
  if (!template) throw new Error(`정수학원 원본 없음: ${it.key}`);
  const curSha = sha(contentSignature(d, template));
  const state: Plan["state"] =
    curSha === it.before_sha ? "old" : hasNewText(d, template, it) ? "new" : "changed";

  // 규칙 검수 (앱의 무료 검수 + 쉬운 문항 추가 점검). 바꾸기 전에 없던 표시가 새로 생기면 멈춘다.
  const oldSegs = segsOf(d, template).map((s) => ({ speaker: s.speaker_type, text: s.text }));
  const oldForCheck = state === "old" ? template : null;
  const merged = { ...template, ...textPatch(template, it) };
  const after = runRuleChecks(toGenerated(merged, it.segments, it.price_calculation ?? null), it.grade);
  const before = oldForCheck
    ? runRuleChecks(toGenerated(template, oldSegs), it.grade)
    : { score: after.score, issues: after.issues };
  const beforeCodes = new Set(before.issues.map((i) => i.code));
  const problems: string[] = [];
  for (const i of after.issues) {
    if (isCriticalQualityCode(i.code)) problems.push(`치명 규칙 표시 ${i.code}: ${i.message}`);
    else if (!beforeCodes.has(i.code)) problems.push(`새 규칙 표시 ${i.code}: ${i.message}`);
  }
  if (state === "old") {
    problems.push(
      ...easyGuards({
        grade: it.grade,
        orderIndex: template.order_index,
        questionType: template.question_type,
        instruction: template.instruction,
        choices: it.choices ?? template.choices,
        correctAnswer: template.correct_answer,
        oldSegments: oldSegs,
        newSegments: it.segments,
        targetPerson: String((it.fields?.target_person as string) ?? template.target_person ?? ""),
        priceCalculation: it.price_calculation ?? null,
      })
    );
  }
  return { it, template, state, problems, ruleBefore: before.score, ruleAfter: after.score };
}

function printPlan(d: Loaded, p: Plan) {
  const { it, template } = p;
  const tag = p.state === "old" ? "바꿀 예정" : p.state === "new" ? "이미 새 대본" : "⚠ 원본이 달라져 건너뜀";
  console.log(`\n■ ${it.key} [${template.question_type}] ${tag} — ${it.reason}`);
  if (p.problems.length) for (const m of p.problems) console.log(`    ✗ ${m}`);
  if (QUIET || p.state !== "old") return;
  console.log(`    ${template.instruction}`);
  console.log(
    `    ${template.choices.map((c, i) => `${i + 1 === template.correct_answer ? "*" : ""}${c}`).join(" | ")}`
  );
  console.log("    - 전:");
  for (const s of segsOf(d, template)) console.log(`        ${s.speaker_type}: ${s.text}`);
  console.log("    + 후:");
  for (const s of it.segments) console.log(`        ${s.speaker}: ${s.text}`);
  console.log(`    해설 - ${template.explanation}`);
  console.log(`    해설 + ${it.explanation}`);
  console.log(`    근거 + ${it.answer_clue}`);
  if (it.fields) {
    for (const [k, v] of Object.entries(it.fields)) {
      const b = JSON.stringify(template[k]);
      const a = JSON.stringify(v);
      if (a !== b) console.log(`    ${k}: ${b} → ${a}`);
    }
  }
  console.log(`    규칙 점수 ${p.ruleBefore} → ${p.ruleAfter}, ${wordsOf(segsOf(d, template))} → ${wordsOf(it.segments)}단어`);
}

// ---------------------------------------------------------------------------
// mp3 길이 (MPEG 1/2/2.5 Layer III 프레임을 세어 계산)
// ---------------------------------------------------------------------------
const BR1 = [0, 32, 40, 48, 56, 64, 80, 96, 112, 128, 160, 192, 224, 256, 320];
const BR2 = [0, 8, 16, 24, 32, 40, 48, 56, 64, 80, 96, 112, 128, 144, 160];
const SR: Record<number, number[]> = { 3: [44100, 48000, 32000], 2: [22050, 24000, 16000], 0: [11025, 12000, 8000] };

export function mp3DurationSec(buf: Buffer): number {
  let i = 0;
  if (buf.length > 10 && buf.toString("latin1", 0, 3) === "ID3") {
    const size = ((buf[6]! & 0x7f) << 21) | ((buf[7]! & 0x7f) << 14) | ((buf[8]! & 0x7f) << 7) | (buf[9]! & 0x7f);
    i = 10 + size;
  }
  let sec = 0;
  while (i + 4 <= buf.length) {
    const b1 = buf[i + 1]!;
    if (buf[i] !== 0xff || (b1 & 0xe0) !== 0xe0) {
      i++;
      continue;
    }
    const ver = (b1 >> 3) & 3;
    const layer = (b1 >> 1) & 3;
    const b2 = buf[i + 2]!;
    const brIdx = (b2 >> 4) & 15;
    const srIdx = (b2 >> 2) & 3;
    const pad = (b2 >> 1) & 1;
    if (ver === 1 || layer !== 1 || brIdx === 0 || brIdx === 15 || srIdx === 3) {
      i++;
      continue;
    }
    const sr = SR[ver]![srIdx]!;
    const br = (ver === 3 ? BR1 : BR2)[brIdx]! * 1000;
    const samples = ver === 3 ? 1152 : 576;
    const len = Math.floor(((samples / 8) * br) / sr) + pad;
    if (len < 4) {
      i++;
      continue;
    }
    sec += samples / sr;
    i += len;
  }
  return sec;
}

async function download(url: string): Promise<{ ok: boolean; status: number; type: string; buf: Buffer }> {
  try {
    const res = await fetch(url, { cache: "no-store" });
    const buf = Buffer.from(await res.arrayBuffer());
    return { ok: res.ok, status: res.status, type: res.headers.get("content-type") ?? "", buf };
  } catch {
    return { ok: false, status: 0, type: "", buf: Buffer.alloc(0) };
  }
}

// ---------------------------------------------------------------------------
// 쓰기
// ---------------------------------------------------------------------------
async function replaceSegments(
  questionId: string,
  oldSegIds: string[],
  rows: Array<{ speaker_type: string; text: string; voice_name: string | null; audio_url: string | null; duration_ms: number | null }>
) {
  // 새 segment 를 먼저 넣고 옛 것을 지운다 (중간에 실패해도 대본이 비지 않게)
  const { error: insErr } = await admin.from("listening_question_segments").insert(
    rows.map((r, i) => ({ question_id: questionId, order_index: i, ...r }))
  );
  if (insErr) throw new Error(`segment 저장 실패 ${questionId}: ${insErr.message}`);
  if (oldSegIds.length) {
    const { error: delErr } = await admin.from("listening_question_segments").delete().in("id", oldSegIds);
    if (delErr) throw new Error(`옛 segment 삭제 실패 ${questionId}: ${delErr.message}`);
  }
}

async function writeTemplate(d: Loaded, p: Plan) {
  const { it, template } = p;
  const { error } = await admin.from("listening_questions").update(textPatch(template, it)).eq("id", template.id);
  if (error) throw new Error(`문항 저장 실패 ${it.key}: ${error.message}`);
  const oldSegs = segsOf(d, template);
  const voiceBySpeaker = new Map(oldSegs.map((s) => [s.speaker_type, s.voice_name]));
  await replaceSegments(
    template.id,
    oldSegs.map((s) => s.id),
    it.segments.map((s) => ({
      speaker_type: s.speaker,
      text: s.text,
      voice_name: voiceBySpeaker.get(s.speaker) ?? null,
      audio_url: null,
      duration_ms: null,
    }))
  );
}

async function recordAndVerify(d: Loaded, p: Plan, state: AudioState): Promise<boolean> {
  const { it, template } = p;
  const oldUrl = String(template.audio_url ?? "").trim();
  const oldWords = wordsOf(segsOf(d, template));
  // 덮어쓰기 전에 옛 음원 길이를 재어 둔다 (새 음원 길이가 그럴듯한지 비교용)
  let oldDur: number | null = null;
  if (oldUrl && !state[template.id]) {
    const old = await download(oldUrl);
    if (old.ok) oldDur = mp3DurationSec(old.buf);
  } else if (state[template.id]) {
    oldDur = state[template.id]!.old_duration_sec;
  }
  const { data: setRow } = await admin
    .from("listening_sets")
    .select("speech_speed")
    .eq("id", template.set_id)
    .maybeSingle();
  const result = await generateQuestionAudio({
    setId: template.set_id,
    questionId: template.id,
    speechSpeed: typeof setRow?.speech_speed === "number" ? setRow.speech_speed : undefined,
    skipRepair: true,
  });
  const url = `${result.audioUrl}?v=${Date.now()}`;
  const { error } = await admin.from("listening_questions").update({ audio_url: url }).eq("id", template.id);
  if (error) throw new Error(`audio_url 저장 실패 ${it.key}: ${error.message}`);

  // 검증: DB 주소, 내려받기, 길이
  const problems: string[] = [];
  const { data: back } = await admin.from("listening_questions").select("audio_url").eq("id", template.id).maybeSingle();
  if (back?.audio_url !== url) problems.push("DB audio_url 이 새 주소가 아님");
  const file = await download(url);
  if (!file.ok) problems.push(`내려받기 실패 (HTTP ${file.status})`);
  if (!/audio|mpeg|octet-stream/i.test(file.type)) problems.push(`content-type ${file.type}`);
  if (file.buf.length < 8000) problems.push(`파일이 너무 작음 (${file.buf.length}바이트)`);
  const dur = mp3DurationSec(file.buf);
  const words = wordsOf(it.segments);
  const spw = words ? dur / words : 0;
  if (dur < 8) problems.push(`길이가 너무 짧음 (${dur.toFixed(1)}초)`);
  if (spw < 0.25 || spw > 1.0) problems.push(`단어당 ${spw.toFixed(2)}초 (보통 0.35~0.7)`);
  if (oldDur && oldWords) {
    const ratio = spw / (oldDur / oldWords);
    if (ratio < 0.6 || ratio > 1.6) problems.push(`옛 음원보다 말 속도가 크게 다름 (비율 ${ratio.toFixed(2)})`);
  }
  state[template.id] = {
    key: it.key,
    audio_url: url,
    bytes: file.buf.length,
    duration_sec: Math.round(dur * 10) / 10,
    old_duration_sec: oldDur == null ? null : Math.round(oldDur * 10) / 10,
    words,
    old_words: oldWords,
    ok: problems.length === 0,
    problems,
    recorded_at: new Date().toISOString(),
    script_sha: sha(JSON.stringify(it.segments)),
  };
  saveState(state);
  console.log(
    `    ${problems.length ? "✗" : "✓"} 음원 ${dur.toFixed(1)}초 / ${words}단어 (옛 ${oldDur?.toFixed(1) ?? "?"}초 / ${oldWords}단어), ${Math.round(file.buf.length / 1024)}KB` +
      (problems.length ? ` — ${problems.join("; ")}` : "")
  );
  return problems.length === 0;
}

// ---------------------------------------------------------------------------
// 사본 복사
// ---------------------------------------------------------------------------
function copiesByTitle(d: Loaded, template: Row): Row[] {
  const title = d.setById.get(template.set_id)?.title;
  return d.questions.filter(
    (q) =>
      q.id !== template.id &&
      q.order_index === template.order_index &&
      d.setById.get(q.set_id)?.title === title &&
      slugOf(d, q) !== TEMPLATE_SLUG
  );
}

async function propagate(d: Loaded, plans: Plan[], state: AudioState) {
  const todo: Array<{ p: Plan; copy: Row }> = [];
  let done = 0;
  let waiting = 0;
  for (const p of plans) {
    const { it, template } = p;
    const copies = copiesByTitle(d, template);
    const audio = state[template.id];
    const audioReady =
      p.state === "new" && audio?.ok && audio.script_sha === sha(JSON.stringify(it.segments)) && template.audio_url === audio.audio_url;
    const line: string[] = [];
    for (const c of copies) {
      const cSha = sha(contentSignature(d, c));
      if (hasNewText(d, c, it) && c.audio_url === template.audio_url) {
        done++;
        line.push(`${slugOf(d, c)}:완료`);
      } else if (cSha === it.before_sha) {
        if (audioReady) {
          todo.push({ p, copy: c });
          line.push(`${slugOf(d, c)}:복사`);
        } else {
          waiting++;
          line.push(`${slugOf(d, c)}:원본 녹음 대기`);
        }
      } else {
        line.push(`${slugOf(d, c)}:⚠내용 다름-건너뜀`);
      }
    }
    if (!QUIET || line.some((l) => l.includes("⚠"))) console.log(`  ${it.key}: ${line.join(", ")}`);
  }
  console.log(`\n사본: 복사할 ${todo.length}행, 이미 완료 ${done}행, 원본 녹음 대기 ${waiting}행`);
  if (!APPLY || todo.length === 0) {
    if (!APPLY) console.log("(미리보기) --propagate --apply 로 저장합니다.");
    return;
  }
  console.log(`백업: ${writeBackup("08-rewrite-easy-copies", d, todo.map((t) => t.copy))}`);
  let n = 0;
  for (const { p, copy } of todo) {
    const patch = { ...textPatch(copy, p.it), audio_url: p.template.audio_url };
    const { error } = await admin.from("listening_questions").update(patch).eq("id", copy.id);
    if (error) throw new Error(`사본 저장 실패 ${slugOf(d, copy)} ${p.it.key}: ${error.message}`);
    await replaceSegments(
      copy.id,
      segsOf(d, copy).map((s) => s.id),
      segsOf(d, p.template).map((s) => ({
        speaker_type: s.speaker_type,
        text: s.text,
        voice_name: s.voice_name,
        audio_url: s.audio_url,
        duration_ms: s.duration_ms,
      }))
    );
    n++;
  }
  console.log(`사본 저장 완료: ${n}행`);
}

// ---------------------------------------------------------------------------
async function main() {
  const data = JSON.parse(readFileSync(DATA_FILE, "utf8")) as { items: Item[] };
  let items = data.items.filter((i) => INCLUDE_LATER || i.status === "ready");
  if (ONLY) items = items.filter((i) => ONLY.includes(i.key));
  if (LIMIT) items = items.slice(0, LIMIT);
  if (!items.length) throw new Error("대상 문항이 없습니다.");
  const d = await loadAll({ titles: [...new Set(items.map((i) => titleOf(i.key)))] });
  const plans = items.map((it) => planItem(d, it));
  const state = loadState();

  const count = (s: Plan["state"]) => plans.filter((p) => p.state === s).length;
  const blocked = plans.filter((p) => p.problems.length);
  console.log(
    `대상 ${plans.length}문항: 바꿀 예정 ${count("old")}, 이미 새 대본 ${count("new")}, 원본이 달라져 건너뜀 ${count("changed")}, 검수 문제 ${blocked.length}`
  );

  if (MODE_PROPAGATE) {
    await propagate(d, plans, state);
    return;
  }

  for (const p of plans) printPlan(d, p);

  const ids = plans.flatMap((p) => [p.template.id, ...copiesByTitle(d, p.template).map((c) => c.id)]);
  const answers = await countExamAnswers(ids);
  const withAnswers = [...answers.values()].filter((n) => n > 0).length;
  const total = [...answers.values()].reduce((a, b) => a + b, 0);
  console.log(
    `\n학생 풀이 기록: 대상 문항(원본+사본 ${ids.length}행) 중 ${withAnswers}행에 ${total}건 (선택지·정답 번호는 그대로라 채점은 바뀌지 않음)`
  );

  const needAudio = plans.filter(
    (p) =>
      !p.problems.length &&
      (p.state === "old" ||
        (p.state === "new" && !(state[p.template.id]?.ok && state[p.template.id]?.script_sha === sha(JSON.stringify(p.it.segments)))))
  );
  console.log(`녹음이 필요한 문항: ${needAudio.length}개 (ElevenLabs, 문항당 약 50원)`);

  if (!APPLY) {
    console.log("\n(미리보기만 했습니다. 저장하려면 --apply 를 붙여 다시 실행하세요.)");
    return;
  }
  if (blocked.some((p) => p.state === "old")) {
    throw new Error("검수 문제가 있는 문항이 있어 저장하지 않습니다. 데이터 파일을 고친 뒤 다시 실행하세요.");
  }

  if (MODE_AUDIO_ONLY) {
    const targets = needAudio.filter((p) => p.state === "new");
    let ok = 0;
    for (const [i, p] of targets.entries()) {
      console.log(`\n[${i + 1}/${targets.length}] ${p.it.key} 녹음`);
      if (await recordAndVerify(d, p, state)) ok++;
    }
    console.log(`\n녹음 검증 통과 ${ok}/${targets.length}`);
    return;
  }

  const targets = plans.filter((p) => p.state === "old");
  if (!targets.length) {
    console.log("\n바꿀 문항이 없습니다 (이미 새 대본). 녹음만 필요하면 --audio --apply");
    return;
  }
  console.log(`\n백업: ${writeBackup("08-rewrite-easy-jeongsu", d, targets.map((p) => p.template))}`);
  let saved = 0;
  let recorded = 0;
  for (const [i, p] of targets.entries()) {
    console.log(`\n[${i + 1}/${targets.length}] ${p.it.key}`);
    await writeTemplate(d, p);
    saved++;
    console.log("    대본·해설 저장 (받아쓰기 초기화)");
    if (NO_AUDIO) continue;
    try {
      if (await recordAndVerify(d, p, state)) recorded++;
    } catch (e) {
      console.log(`    ✗ 녹음 실패: ${e instanceof Error ? e.message : String(e)} (나중에 --audio --apply)`);
    }
  }
  console.log(`\n저장 ${saved}문항, 녹음 검증 통과 ${recorded}문항${NO_AUDIO ? " (녹음 생략)" : ""}`);
  console.log("다음 단계: --propagate 로 사본 6곳 미리보기 → --propagate --apply");
}

main().catch((e: unknown) => {
  console.error(e);
  process.exit(1);
});
