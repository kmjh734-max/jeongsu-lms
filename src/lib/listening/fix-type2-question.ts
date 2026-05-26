import { buildScriptText } from "@/lib/listening/script-text";
import { TYPE2_QUESTION_TYPE } from "@/lib/listening/prompts/type2PurchasePrompt";
import type {
  GeneratedListeningQuestion,
  PurchaseSelectedConditions,
} from "@/lib/listening/types";

function normalizeSelectedConditions(
  raw: unknown
): PurchaseSelectedConditions | undefined {
  if (!raw || typeof raw !== "object") return undefined;
  const o = raw as Record<string, unknown>;
  const item_type = String(o.item_type ?? "").trim();
  const final_choice_sentence = String(o.final_choice_sentence ?? "").trim();
  if (!item_type && !final_choice_sentence) return undefined;
  return {
    item_type,
    color: String(o.color ?? "").trim(),
    pattern_or_shape: String(o.pattern_or_shape ?? "").trim(),
    extra_feature: String(o.extra_feature ?? "").trim(),
    final_choice_sentence,
  };
}

function inferBuyerLabel(segments: GeneratedListeningQuestion["segments"]): {
  who: "남자" | "여자";
  verb: "구입한" | "주문한";
} {
  for (let i = segments.length - 1; i >= 0; i--) {
    const seg = segments[i]!;
    if (/I'?ll\s+(?:take|have|buy)/i.test(seg.text)) {
      const who = seg.speaker === "M" ? "남자" : "여자";
      const verb = /order/i.test(seg.text) ? "주문한" : "구입한";
      return { who, verb };
    }
  }
  return { who: "남자", verb: "구입한" };
}

function inferInstruction(q: GeneratedListeningQuestion): string {
  const raw = q.instruction?.trim();
  if (raw && !raw.includes("○○")) return raw;

  const { who, verb } = inferBuyerLabel(q.segments);
  return `대화를 듣고, ${who}가 ${verb} 것으로 가장 적절한 것을 고르시오.`;
}

/** 2번: 구입/주문 + 그림 선택지 */
export function fixType2Question(
  q: GeneratedListeningQuestion,
  typeId: number
): GeneratedListeningQuestion {
  if (typeId !== 2) return q;

  const choice_image_prompts = Array.isArray(q.choice_image_prompts)
    ? q.choice_image_prompts.map((p) => String(p).trim()).slice(0, 5)
    : [];
  while (choice_image_prompts.length < 5) choice_image_prompts.push("");

  return {
    ...q,
    order_index: 2,
    question_type: TYPE2_QUESTION_TYPE,
    instruction: inferInstruction(q),
    question_text: "",
    needs_image_choices: true,
    visual_choice_type: q.visual_choice_type?.trim() || "image",
    choice_image_prompts,
    selected_conditions:
      normalizeSelectedConditions(q.selected_conditions) ?? q.selected_conditions,
    script_text: q.script_text || buildScriptText(q.segments),
  };
}
