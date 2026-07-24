"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  copyKakaoPasteMessage,
  isKakaoShareConfigured,
  KAKAO_PRODUCT_LINK_HINT,
  loadKakaoSdkForReports,
  shareReportViaKakao,
  validateShareUrlForKakao,
} from "@/lib/kakao/share-report";
import type { NeltGrowthAnalysis } from "@/lib/nelt/compare/types";

interface NeltShareActionsProps {
  studentName: string;
  analysis: NeltGrowthAnalysis;
  academyName?: string;
}

export function NeltShareActions({
  studentName,
  analysis,
  academyName,
}: NeltShareActionsProps) {
  const kakaoConfigured = isKakaoShareConfigured();
  const [parentMessage, setParentMessage] = useState(analysis.parentCopy);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [msgLoading, setMsgLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const periodLabel =
    analysis.start.testDate && analysis.end.testDate
      ? `${analysis.start.testDate} ~ ${analysis.end.testDate} · ${analysis.attemptCount}회차`
      : `NELT ${analysis.attemptCount}회차`;

  useEffect(() => {
    if (kakaoConfigured) {
      void loadKakaoSdkForReports().catch(() => undefined);
    }
  }, [kakaoConfigured]);

  function flashOk(text: string) {
    setStatus(text);
    setError(null);
    window.setTimeout(() => setStatus(null), 5000);
  }
  function flashErr(text: string) {
    setError(text);
    window.setTimeout(() => setError(null), 6000);
  }

  async function generateParentMessage() {
    setMsgLoading(true);
    try {
      const res = await fetch("/api/nelt/parent-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentName, analysis }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "문구 생성 실패");
      }
      setParentMessage(json.message as string);
      flashOk(
        json.source === "ai"
          ? `학부모 안내 문구를 만들었습니다. (${json.model ?? "AI"})`
          : "기본 문구로 만들었습니다. (AI 키/모델 확인)"
      );
    } catch (e) {
      flashErr(e instanceof Error ? e.message : "문구 생성 오류");
    } finally {
      setMsgLoading(false);
    }
  }

  async function createShareLink(): Promise<string | null> {
    setLinkLoading(true);
    try {
      const res = await fetch("/api/nelt/share", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          parentMessage,
          analysis,
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok || !json.shareUrl) {
        throw new Error(json.message ?? "링크 생성 실패");
      }
      setShareUrl(json.shareUrl as string);
      setExpiresAt(json.expiresAt ?? null);
      if (json.parentMessage) setParentMessage(json.parentMessage as string);
      flashOk("학부모용 공유 링크를 만들었습니다. (30일)");
      return json.shareUrl as string;
    } catch (e) {
      flashErr(e instanceof Error ? e.message : "링크 생성 오류");
      return null;
    } finally {
      setLinkLoading(false);
    }
  }

  async function handleKakao() {
    setKakaoLoading(true);
    try {
      let url = shareUrl;
      if (!url) url = await createShareLink();
      if (!url) return;

      const paste = `${parentMessage.trim()}

아래 링크에서 성장 리포트를 확인해 주세요.
${url}`;

      const result = await shareReportViaKakao({
        studentName,
        periodLabel,
        shareUrl: url,
        feedTitle: `${studentName} 학생 NELT 영어 성장 리포트`,
        feedDescription: `${periodLabel} 성장 리포트입니다.`,
        buttonTitle: "성장 리포트 보기",
        pasteMessage: paste,
        academyName,
      });
      if (result.ok) {
        flashOk("카카오톡 공유 창이 열렸습니다. 채팅방을 선택해 주세요.");
      } else if (result.fallback) {
        flashOk(result.message);
      } else {
        flashErr(result.message);
      }
    } finally {
      setKakaoLoading(false);
    }
  }

  async function handlePasteCopy() {
    let url = shareUrl;
    if (!url) url = await createShareLink();
    if (!url) return;
    const paste = `${parentMessage.trim()}

아래 링크에서 성장 리포트를 확인해 주세요.
${url}`;
    try {
      await navigator.clipboard.writeText(paste);
      flashOk("카카오톡에 붙여넣을 안내+링크를 복사했습니다.");
    } catch {
      const r = await copyKakaoPasteMessage({
        studentName,
        periodLabel,
        shareUrl: url,
        academyName,
      });
      if (r.ok) flashOk(r.message);
      else flashErr(r.message);
    }
  }

  const warning = shareUrl
    ? validateShareUrlForKakao(shareUrl).warning
    : null;

  return (
    <section className="print:hidden space-y-3 rounded-2xl border border-[#dce3ed] bg-white p-5 shadow-sm">
      <div>
        <h3 className="text-base font-bold text-[#152d4f]">
          학부모 안내 · 카카오톡 공유
        </h3>
        <p className="mt-1 text-xs text-slate-500">
          안내 문구를 만든 뒤 공유 링크를 생성하고, 카카오톡으로 보내세요.
        </p>
      </div>

      <textarea
        className="ui-input min-h-[180px] w-full resize-y text-sm leading-relaxed"
        value={parentMessage}
        onChange={(e) => setParentMessage(e.target.value)}
        aria-label="학부모 안내 문구"
      />

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={msgLoading}
          onClick={() => void generateParentMessage()}
        >
          {msgLoading ? "작성 중…" : "학부모 안내 문구 만들기 (AI)"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={linkLoading}
          onClick={() => void createShareLink()}
        >
          {linkLoading ? "생성 중…" : "공유 링크 만들기"}
        </Button>
        <Button
          type="button"
          variant="primary"
          size="sm"
          disabled={kakaoLoading || linkLoading}
          onClick={() => void handleKakao()}
          title={
            kakaoConfigured
              ? "카카오톡 공유창"
              : "카카오 키가 없어도 붙여넣기 복사는 가능합니다"
          }
        >
          {kakaoLoading ? "준비 중…" : "카카오톡보내기"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          size="sm"
          disabled={linkLoading}
          onClick={() => void handlePasteCopy()}
        >
          카카오 붙여넣기용 복사
        </Button>
      </div>

      {shareUrl && (
        <div className="rounded-xl bg-[#edf4ff] px-3 py-2 text-xs text-[#244a78]">
          <p className="font-bold">공유 링크</p>
          <a
            href={shareUrl}
            target="_blank"
            rel="noreferrer"
            className="break-all underline"
          >
            {shareUrl}
          </a>
          {expiresAt && (
            <p className="mt-1 opacity-80">
              만료: {new Date(expiresAt).toLocaleDateString("ko-KR")}
            </p>
          )}
        </div>
      )}

      {status && <p className="text-xs text-emerald-700">{status}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {warning && <p className="text-xs text-amber-700">{warning}</p>}
      {!kakaoConfigured && (
        <p className="text-[11px] text-slate-400">{KAKAO_PRODUCT_LINK_HINT}</p>
      )}
    </section>
  );
}
