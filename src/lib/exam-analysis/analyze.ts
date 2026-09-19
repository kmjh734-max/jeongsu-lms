import type { SupabaseClient } from "@supabase/supabase-js";
import { ALL_QUESTION_OPTIONS } from "@/lib/question-generator/question-types";
import { examChat } from "@/lib/exam-analysis/openai";
import { matchLessonMaterials } from "@/lib/exam-analysis/match-materials";
import { typeNameFromKey } from "@/lib/exam-analysis/types";

type RawItem = {
  no?: string | number;
  points?: number | null;
  format?: string;
  stem?: string;
  passage_excerpt?: string;
  passage_words?: number;
  type_key?: string;
  difficulty?: number;
  level?: string;
  difficulty_reason?: string;
  grammar_point?: string;
  subjective_conditions?: string;
  answer_guess?: string;
  confidence?: number;
};

type RawResult = {
  meta?: {
    school?: string;
    grade?: string | number;
    subject?: string;
    exam?: string;
    total_points?: number;
    missing?: string;
    note?: string;
  };
  items?: RawItem[];
  features?: string[];
  strategy?: string[];
};

function systemPrompt(): string {
  const typeList = ALL_QUESTION_OPTIONS.map((o) => `${o.key} = ${o.label}${o.isObjective ? "" : " (서술형)"}`).join("\n");
  return `당신은 한국 고등학교 영어 내신 시험을 분석하는 전문가다. 옮겨 적은 시험지 글을 보고 문항정보표를 만든다.
규칙:
- 시험지에 있는 모든 문항을 시험지 순서대로 빠짐없이 적는다(선택형·서술형 모두). 한 지문에 여러 문항이 달려도 문항마다 한 줄.
- no: 선택형은 "1", "2" …, 서술형은 "서술 1", "서술 2" … (시험지가 논술형·서답형이라 불러도 "서술 n").
- 배점은 시험지에 적힌 값 그대로. 없으면 null.
- 유형(type_key)은 아래 목록에서 가장 가까운 key 하나. 맞는 게 없으면 "other:유형이름"(예: other:대화문, other:영영풀이, other:우리말 조건 영작, other:본문 찾아 쓰기, other:요약표 수정).
- 난이도(difficulty 1~5, level 상/중/하)는 해당 학년 학생 기준. 근거(difficulty_reason)는 한 문장: 지문 길이·어휘 수준·유형 자체 난도·선택지 매력도·서술형 조건 수.
- passage_excerpt: 문항이 딸린 영어 지문의 첫 30단어 정도를 시험지 그대로(빈칸·밑줄 표시는 빼고). 지문이 없으면 "".
- grammar_point: 어법·서술형이면 묻는 문법 요소를 짧게.
- subjective_conditions: 서술형이면 조건(단어 수, 보기 단어 모두 사용, 어형 변화 등)을 짧게.
- answer_guess: 직접 풀어서 추정. 서술형은 모범답안 요지. 확신이 낮으면 confidence를 낮게. 학생 풀이 흔적은 정답 근거로 쓰지 않는다.
- 지문 출처(교과서·모의고사 등)는 짐작하지 않는다.
- 쪽 아래 "7-1", "2/8" 같은 쪽 번호와 문항 번호가 건너뛴 곳을 보고, 올라오지 않은 쪽·문항을 meta.missing 에 적는다(예: "7쪽 중 2·4·6쪽 없음 (6~9·15~20번)"). 빠짐이 없으면 "". 빠진 문항은 items에 넣지 않는다.
- features: 출제 특징 3~5개, strategy: 다음 시험 대비 전략 3~5개. 선생님이 학부모 상담에 그대로 쓸 수 있게 구체적으로.
JSON 하나만 출력:
{"meta":{"school":"","grade":"","subject":"","exam":"","total_points":0,"missing":"","note":""},
 "items":[{"no":"1","points":2.9,"format":"objective|subjective","stem":"발문","passage_excerpt":"","passage_words":0,
   "type_key":"","difficulty":3,"level":"중","difficulty_reason":"","grammar_point":"","subjective_conditions":"","answer_guess":"","confidence":0.0}],
 "features":[],"strategy":[]}

유형 목록:
${typeList}`;
}

const LEVELS = new Set(["상", "중", "하"]);

/** 읽어 둔 쪽 글자로 문항표를 만들어 저장하고, 수업자료와 대조한다 */
export async function analyzeExam(admin: SupabaseClient, analysisId: string, academyId: string): Promise<void> {
  const { data: pages } = await admin
    .from("school_exam_pages")
    .select("page_no, text")
    .eq("analysis_id", analysisId)
    .order("page_no");
  const transcript = (pages ?? []).map((p) => `===== ${p.page_no}쪽 =====\n${p.text}`).join("\n\n");
  if (!transcript.trim()) throw new Error("읽은 쪽이 없습니다.");

  const { text } = await examChat({
    model: "gpt-5.5",
    reasoning_effort: "medium",
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: systemPrompt() },
      { role: "user", content: transcript },
    ],
  });
  const raw = JSON.parse(text) as RawResult;
  const items = (raw.items ?? []).filter((i) => i && (i.no ?? "") !== "");
  if (items.length === 0) throw new Error("문항을 찾지 못했습니다. 시험지 쪽이 모두 올라왔는지 확인해 주세요.");

  const { data: opt } = await admin.from("school_exam_analyses").select("match_materials").eq("id", analysisId).maybeSingle();
  const matches =
    opt?.match_materials === false
      ? new Map<string, { itemId: string; label: string }>()
      : await matchLessonMaterials(
          admin,
          academyId,
          items.map((it, i) => ({ key: String(i), excerpt: it.passage_excerpt ?? null }))
        );

  const rows = items.map((it, i) => {
    const isSubjective = String(it.format ?? "").startsWith("sub") || String(it.no).includes("서");
    const { name, category } = typeNameFromKey(String(it.type_key ?? "other:기타"), isSubjective);
    const level = LEVELS.has(String(it.level)) ? String(it.level) : "중";
    const match = matches.get(String(i));
    return {
      analysis_id: analysisId,
      order_index: i,
      item_no: String(it.no).trim(),
      points: typeof it.points === "number" ? it.points : null,
      is_subjective: isSubjective,
      category,
      type_key: it.type_key ?? null,
      type_name: name,
      level,
      difficulty: Math.min(5, Math.max(1, Math.round(Number(it.difficulty) || 3))),
      difficulty_reason: it.difficulty_reason || null,
      stem: it.stem || null,
      passage_excerpt: it.passage_excerpt || null,
      passage_words: typeof it.passage_words === "number" ? it.passage_words : null,
      grammar_point: it.grammar_point || null,
      conditions: it.subjective_conditions || null,
      answer_guess: it.answer_guess || null,
      confidence: typeof it.confidence === "number" ? it.confidence : null,
      matched_item_id: match?.itemId ?? null,
      matched_label: match?.label ?? null,
    };
  });

  await admin.from("school_exam_items").delete().eq("analysis_id", analysisId);
  const { error } = await admin.from("school_exam_items").insert(rows);
  if (error) throw new Error(error.message);

  const meta = raw.meta ?? {};
  const { data: current } = await admin
    .from("school_exam_analyses")
    .select("school_name, grade, subject, exam_label")
    .eq("id", analysisId)
    .maybeSingle();
  const total = rows.reduce((s, r) => s + (r.points ?? 0), 0);
  await admin
    .from("school_exam_analyses")
    .update({
      // 선생님이 적어 둔 값이 있으면 그대로 둔다
      school_name: current?.school_name || meta.school || null,
      grade: current?.grade || (meta.grade != null ? String(meta.grade).replace(/학년/, "") : null),
      subject: current?.subject || meta.subject || null,
      exam_label: current?.exam_label || meta.exam || null,
      missing: meta.missing || null,
      note: meta.note || null,
      total_points: Math.round(total * 10) / 10,
      features: raw.features ?? [],
      strategy: raw.strategy ?? [],
      status: "ready",
      error: null,
      updated_at: new Date().toISOString(),
    })
    .eq("id", analysisId);
}
