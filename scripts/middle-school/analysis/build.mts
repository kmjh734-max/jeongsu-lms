/**
 * 중학교 분석서 — 손으로 쓴 분석(따온 글자 형식) → 고등 분석서 형식(AnalysisReportData)으로 바꾸고 검증한다. 모델 호출 없음.
 *   npx tsx --env-file=.env.local --tsconfig tsconfig.json scripts/middle-school/analysis/build.mts <키 ...> [--저장]
 * 입력: in/<키>.json(dump.mjs — 본문 문장) + out/<키>.json(손으로 쓴 분석). 저장하면 ms_texts.analysis 에 넣는다.
 *
 * out/<키>.json 형식 — { "passages": { "<본문 id>": { titleEn, topicEn, topicKo, sentences: [ … ] } } }
 *   sentences 는 입력 문장과 같은 수·같은 차례. 각 문장: { translation, contextNote?, tags?, tagSpans?, roles?, brackets?, notes?, points?, callouts?, chunks? }
 *   q 는 원문에서 글자 그대로 따온 구간(같은 글자가 두 번이면 occ). 표기 규칙은 scripts/tmp-rv/ana-1027b/SPEC.md 와 같다(선생님 확정).
 *   중학교 수준: 성분 S·V·O·C·M(·A), 이름표·번호 설명은 그 과 문법(be동사·일반동사·…)과 시험에 나올 자리만.
 */
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { createClient } from "@supabase/supabase-js";
import { readAnalysisMarkup, resolveMarkupSpan, MARKUP_SENTENCE_TAGS } from "@/lib/lesson-materials/analysis-markup";
import { ANALYSIS_REPORT_FORMAT_VERSION, type AnalysisReportData, type AnalysisSentence } from "@/lib/lesson-materials/generate-analysis-report";

const DIR = path.dirname(fileURLToPath(import.meta.url));
const args = process.argv.slice(2);
const save = args.includes("--저장");
const keys = args.filter((a) => !a.startsWith("--"));

type Q = { q: string; occ?: number };
type AuthoredSentence = {
  translation: string;
  contextNote?: string;
  tags?: string[];
  tagSpans?: Array<Q & { tag: string; paraphrase?: string }>;
  roles?: Array<Q & { role: string; level?: number }>;
  brackets?: Array<Q & { kind: string }>;
  notes?: Array<Q & { label: string; gloss?: string }>;
  points?: Array<Q & { label: string; star?: boolean; explanation: string; rewrite?: string }>;
  callouts?: Array<Q & { title: string; body: string; tone?: string }>;
  chunks?: Array<{ en: string; ko: string }>;
};
type Authored = { passages: Record<string, { titleEn: string; topicEn: string; topicKo: string; sentences: AuthoredSentence[] }> };
type Input = { unitId: string; grade: string; publisher: string; lessonNo: number; title: string; passages: Array<{ id: string; part: string; title: string | null; lines: Array<{ en: string; ko: string }> }> };

const hash = (lines: string[]) =>
  createHash("sha256").update(lines.map((l) => String(l ?? "").replace(/\s+/g, " ").trim()).join("\n")).digest("hex").slice(0, 32);

const db = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!, { auth: { persistSession: false } });
let totalDrop = 0;

for (const key of keys) {
  const input = JSON.parse(fs.readFileSync(path.join(DIR, "in", `${key}.json`), "utf8")) as Input;
  const a = JSON.parse(fs.readFileSync(path.join(DIR, "out", `${key}.json`), "utf8")) as Authored;
  const headerLabel = `${input.grade} ${input.publisher} ${input.lessonNo}과`;
  for (const p of input.passages) {
    const ap = a.passages[p.id];
    const drops: string[] = [];
    if (!ap) { console.log(`${key} ${p.part}: 분석 없음(건너뜀)`); continue; }
    if (ap.sentences.length !== p.lines.length) drops.push(`문장 수 ${p.lines.length} ≠ 분석 ${ap.sentences.length}`);
    const sentences: AnalysisSentence[] = p.lines.map((src, idx) => {
      const text = src.en.replace(/\s+/g, " ").trim();
      const itemId = `${p.id}:${idx + 1}`;
      const s = ap.sentences[idx];
      if (!s) return { itemId, enChunks: [{ text, role: "other" }], koChunks: [src.ko ?? ""], grammarPoints: [] };
      const span = (x: Q, what: string) => {
        const r = resolveMarkupSpan(text, x.q, x.occ ?? 1);
        if (!r) drops.push(`#${idx + 1} ${what} 못 찾음: "${x.q}"`);
        return r;
      };
      const raw = {
        text,
        translation: s.translation,
        tags: (s.tags ?? []).filter((t) => (MARKUP_SENTENCE_TAGS as readonly string[]).includes(t)),
        roles: (s.roles ?? []).map((r) => ({ span: span(r, `성분 ${r.role}`), role: r.role, level: r.level ?? 0 })).filter((r) => r.span),
        brackets: (s.brackets ?? []).map((r) => ({ span: span(r, `괄호 ${r.kind}`), kind: r.kind })).filter((r) => r.span),
        notes: (s.notes ?? []).map((r) => ({ span: span(r, `이름표 ${r.label}`), label: r.label, gloss: r.gloss })).filter((r) => r.span),
        points: (s.points ?? []).map((r, i) => ({ span: span(r, `번호 ${r.label}`), index: i + 1, label: r.label, star: !!r.star, explanation: r.explanation, rewrite: r.rewrite })).filter((r) => r.span),
        callouts: (s.callouts ?? []).map((r) => ({ span: span(r, `상자 ${r.title}`), title: r.title, body: r.body, tone: r.tone === "blue" ? "blue" : "red" })).filter((r) => r.span),
        tagSpans: (s.tagSpans ?? []).map((r) => ({ span: span(r, `꼬리표 ${r.tag}`), tag: r.tag, paraphrase: r.paraphrase })).filter((r) => r.span),
        chunks: s.chunks,
      };
      const m = readAnalysisMarkup(raw, text);
      if (!m) drops.push(`#${idx + 1} 표시 전체 버려짐`);
      else {
        (["roles", "brackets", "notes", "points", "callouts"] as const).forEach((k) => {
          const before = (raw[k] as unknown[]).length, after = (m[k] as unknown[]).length;
          if (after < before) drops.push(`#${idx + 1} ${k} ${before}→${after}`);
        });
        if (s.chunks?.length && !m.chunks?.length) drops.push(`#${idx + 1} 직독직해 버려짐`);
      }
      return {
        itemId,
        enChunks: [{ text, role: "other" }],
        koChunks: [m?.translation ?? s.translation],
        contextNote: s.contextNote,
        grammarPoints: [],
        ...(m ? { markup: m } : {}),
      } as AnalysisSentence;
    });
    totalDrop += drops.length;
    console.log(`${key} ${p.part}: 문장 ${sentences.length} · 버려진 것 ${drops.length}`);
    for (const d of drops) console.log("   ", d);
    const report: AnalysisReportData = {
      headerLabel,
      titleEn: ap.titleEn,
      topicEn: ap.topicEn,
      topicKo: ap.topicKo,
      sentences,
      sourceHash: hash(p.lines.map((l) => l.en)),
      formatVersion: ANALYSIS_REPORT_FORMAT_VERSION,
      updatedAt: new Date().toISOString(),
    };
    fs.mkdirSync(path.join(DIR, "final"), { recursive: true });
    fs.writeFileSync(path.join(DIR, "final", `${key}-${p.part}.json`), JSON.stringify(report, null, 1));
    if (save) {
      if (drops.length) { console.log("   버려진 것이 있어 저장하지 않음"); continue; }
      const { error } = await db.from("ms_texts").update({ analysis: report }).eq("id", p.id);
      if (error) throw error;
      console.log("   저장");
    }
  }
}
console.log("버려진 것 합계", totalDrop);
