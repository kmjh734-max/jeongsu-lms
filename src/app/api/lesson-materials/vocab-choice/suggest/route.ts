import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth/get-profile";
import type { StoredVocabChoiceCache } from "@/lib/lesson-materials/vocab-choice";
import { suggestGrammarWrong, suggestVocabOpposite } from "@/lib/lesson-materials/choice-edit";
import { engcoreWordPos } from "@/lib/vocab/engcore-level";

export const runtime = "nodejs";

/**
 * 워크북 어법·어휘 선택에 선생님이 자리를 직접 더할 때, 그 자리에 넣을 틀린 말 후보.
 * 어법은 규칙(단어장 품사로 없는 활용형을 거른다), 어휘는 이 지문을 만들 때 나온 짝(검수를
 * 거친 것)·단어장 반의어·쉬운 반대말 표에서 찾는다. 모델은 부르지 않는다.
 */
export async function POST(request: Request) {
  try {
    const profile = await getCurrentProfile();
    if (!profile || (profile.role !== "admin" && profile.role !== "teacher") || !profile.academy_id) {
      return NextResponse.json({ ok: false, message: "권한이 없습니다." }, { status: 403 });
    }
    const body = (await request.json()) as { projectId?: string; word?: string; kind?: string };
    const projectId = String(body.projectId ?? "").trim();
    const raw = String(body.word ?? "").trim();
    const word = raw.toLowerCase();
    if (!projectId || !word) return NextResponse.json({ ok: true, suggestions: [] });
    if (body.kind === "grammar") {
      return NextResponse.json({ ok: true, suggestions: suggestGrammarWrong(raw, engcoreWordPos) });
    }

    const supabase = await createClient();
    const { data } = await supabase
      .from("lesson_material_projects")
      .select("lesson_pack_json")
      .eq("id", projectId)
      .eq("academy_id", profile.academy_id)
      .maybeSingle();
    const pack = (data?.lesson_pack_json ?? {}) as {
      vocabChoiceCache?: StoredVocabChoiceCache | null;
      vocab?: Array<{ word?: string; antonyms?: string[] }>;
    };
    const out: string[] = [];
    for (const p of pack.vocabChoiceCache?.pairs ?? []) {
      if (p.targetText.trim().toLowerCase() === word) out.push(p.wrongText.trim());
    }
    for (const v of pack.vocab ?? []) {
      const w = String(v.word ?? "").trim().toLowerCase();
      if (w && (w === word || word.startsWith(w))) out.push(...(v.antonyms ?? []).map((a) => String(a).trim()));
    }
    out.push(...suggestVocabOpposite(raw));
    const seen = new Set<string>();
    const suggestions = out.filter((s) => {
      const k = s.toLowerCase();
      if (!s || k === word || seen.has(k)) return false;
      seen.add(k);
      return true;
    });
    return NextResponse.json({ ok: true, suggestions: suggestions.slice(0, 6) });
  } catch (e) {
    return NextResponse.json({ ok: false, message: e instanceof Error ? e.message : "제안을 찾지 못했습니다." });
  }
}
