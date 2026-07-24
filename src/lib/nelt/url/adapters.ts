import type { NeltExtractedDraft } from "@/lib/nelt/types-draft";
import {
  isLikelyNetutorNeltHtml,
  parseNetutorNeltHtml,
} from "@/lib/nelt/parse/netutor-html";
import { fetchPublicUrlSafe } from "@/lib/nelt/url/ssrf-guard";

export type NeltUrlAdapterResult =
  | { ok: true; draft: NeltExtractedDraft; adapter: string }
  | { ok: false; message: string; adapter?: string };

export async function netutorNeltUrlAdapter(
  url: string
): Promise<NeltUrlAdapterResult> {
  try {
    const fetched = await fetchPublicUrlSafe(url);
    const ct = fetched.contentType;

    if (ct.includes("application/pdf")) {
      return {
        ok: false,
        message:
          "이 링크는 PDF를 직접 반환합니다. PDF 업로드로 등록해 주세요.",
        adapter: "netutorNeltUrlAdapter",
      };
    }

    const html = fetched.body.toString("utf8");
    if (!isLikelyNetutorNeltHtml(html)) {
      return {
        ok: false,
        message:
          "이 링크에서는 NELT 성적을 자동으로 불러오지 못했습니다. 결과 화면을 PDF로 저장하여 업로드하거나 직접 입력해 주세요.",
        adapter: "netutorNeltUrlAdapter",
      };
    }

    const draft = parseNetutorNeltHtml(html, fetched.finalUrl);
    if (!draft.studentName && draft.domains.length === 0) {
      return {
        ok: false,
        message:
          "이 링크에서는 NELT 성적을 자동으로 불러오지 못했습니다. 결과 화면을 PDF로 저장하여 업로드하거나 직접 입력해 주세요.",
        adapter: "netutorNeltUrlAdapter",
      };
    }

    return { ok: true, draft, adapter: "netutorNeltUrlAdapter" };
  } catch (e) {
    return {
      ok: false,
      message:
        e instanceof Error
          ? e.message
          : "이 링크에서는 NELT 성적을 자동으로 불러오지 못했습니다. 결과 화면을 PDF로 저장하여 업로드하거나 직접 입력해 주세요.",
      adapter: "netutorNeltUrlAdapter",
    };
  }
}

export async function genericHtmlUrlAdapter(
  url: string
): Promise<NeltUrlAdapterResult> {
  try {
    const fetched = await fetchPublicUrlSafe(url);
    if (fetched.contentType.includes("application/pdf")) {
      return {
        ok: false,
        message: "PDF 링크는 PDF 업로드로 등록해 주세요.",
        adapter: "genericHtmlUrlAdapter",
      };
    }
    const html = fetched.body.toString("utf8");
    if (isLikelyNetutorNeltHtml(html)) {
      return {
        ok: true,
        draft: parseNetutorNeltHtml(html, fetched.finalUrl),
        adapter: "genericHtmlUrlAdapter",
      };
    }
    return {
      ok: false,
      message:
        "이 링크에서는 NELT 성적을 자동으로 불러오지 못했습니다. 결과 화면을 PDF로 저장하여 업로드하거나 직접 입력해 주세요.",
      adapter: "genericHtmlUrlAdapter",
    };
  } catch (e) {
    return {
      ok: false,
      message:
        e instanceof Error
          ? e.message
          : "이 링크에서는 NELT 성적을 자동으로 불러오지 못했습니다.",
      adapter: "genericHtmlUrlAdapter",
    };
  }
}

export async function resolveNeltUrl(url: string): Promise<NeltUrlAdapterResult> {
  let host = "";
  try {
    host = new URL(url).hostname.toLowerCase();
  } catch {
    return { ok: false, message: "올바른 URL 형식이 아닙니다." };
  }

  if (host === "www.netutor.co.kr" || host === "netutor.co.kr") {
    return netutorNeltUrlAdapter(url);
  }
  return genericHtmlUrlAdapter(url);
}
