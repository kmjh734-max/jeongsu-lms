/**
 * 올린 자료 대조(발문 읽기)가 제대로 도는지 시험지 자체로 재 본다.
 *
 * 시험지 글(school_exam_pages)을 「올린 자료」로 넣으면 지문이 있는 문항은 전부 적중이어야
 * 한다. 그래서 이 수치가 곧 발문 읽기의 정확도다. 모델을 부르지 않아 값이 안 든다.
 *
 * 선생님이 구현고 시험지를 그대로 올려 재 보셨을 때(2026-10-02) 30문항 중 6문항만 적중이었다.
 * 발문을 지문 앞뒤 2,500자에서 아무렇게나 긁어 오던 것을 고친 뒤 255문항 중 239문항이 됐다.
 * 남는 것은 문항표의 발문이 비었거나(묶음 머리글만 남음) 분석기가 적은 유형 이름이 발문과
 * 다른 것들이다.
 *
 *   npx tsx scripts/audit-upload-match.mts        # 시험지별 적중 수
 *   npx tsx scripts/audit-upload-match.mts -v     # 못 맞춘 문항의 발문까지
 *   npx tsx scripts/audit-upload-match.mts <pdf경로> <분석id>   # 실제 PDF(pdfjs 추출)로 재 본다
 */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { matchUploads } from "../src/lib/exam-analysis/uploaded-material";

const env = fs.readFileSync(".env.local", "utf8");
const url = env.match(/NEXT_PUBLIC_SUPABASE_URL=(.*)/)![1]!.trim();
const key = env.match(/SUPABASE_SERVICE_ROLE_KEY=(.*)/)![1]!.trim();
const admin = createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });

const verbose = process.argv.includes("-v");
const pdfPath = process.argv.find((a) => /\.pdf$/i.test(a));
const onlyId = process.argv.find((a) => /^[0-9a-f-]{36}$/.test(a));

async function pdfText(file: string): Promise<string> {
  const pdfjs = await import("pdfjs-dist/legacy/build/pdf.mjs");
  const pdf = await pdfjs.getDocument({ data: new Uint8Array(fs.readFileSync(file)) }).promise;
  const out: string[] = [];
  for (let n = 1; n <= pdf.numPages; n++) {
    const page = await pdf.getPage(n);
    const content = await page.getTextContent();
    out.push(
      (content.items as Array<{ str?: string }>)
        .map((i) => String(i.str ?? ""))
        .join(" ")
        .replace(/\s{2,}/g, " ")
        .trim()
    );
  }
  return out.join("\n");
}

let query = admin
  .from("school_exam_analyses")
  .select("id, school_name, exam_label")
  .eq("status", "ready")
  .order("created_at", { ascending: false })
  .limit(12);
if (onlyId) query = query.eq("id", onlyId);
const { data: analyses } = await query;

let total = 0;
let hits = 0;
for (const a of analyses ?? []) {
  let text: string;
  let from: string;
  if (pdfPath) {
    text = await pdfText(pdfPath);
    from = "PDF(pdfjs)";
  } else {
    const { data: pages } = await admin.from("school_exam_pages").select("text").eq("analysis_id", a.id).order("page_no");
    text = (pages ?? []).map((p) => String(p.text ?? "")).join("\n");
    from = "시험지 글";
  }
  const { data: items } = await admin
    .from("school_exam_items")
    .select("item_no, type_name, stem, passage_excerpt")
    .eq("analysis_id", a.id)
    .order("order_index");
  const withPassage = (items ?? []).filter((it) => (it.passage_excerpt ?? "").trim().length > 40);
  let n = 0;
  const misses: string[] = [];
  for (const it of withPassage) {
    const rows = matchUploads(
      { passageExcerpt: it.passage_excerpt, stem: it.stem, typeName: it.type_name },
      [{ name: from, text }]
    );
    if (rows.some((r) => r.sameType)) n += 1;
    else
      misses.push(
        `${it.item_no} [${it.type_name}] 시험=${(it.stem ?? "").replace(/\s+/g, " ").slice(0, 50)} / 자료=${
          rows[0]?.stem?.replace(/\s+/g, " ").slice(0, 50) ?? "(지문 못 찾음)"
        }`
      );
  }
  total += withPassage.length;
  hits += n;
  console.log(`${a.school_name ?? "?"} ${a.exam_label ?? ""} (${from}): ${n}/${withPassage.length}`);
  if (verbose) for (const m of misses) console.log("   ✗", m);
}
console.log(`합계 ${hits}/${total}`);
