"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import {
  copyKakaoPasteMessage,
  isKakaoShareConfigured,
  KAKAO_PRODUCT_LINK_HINT,
  loadKakaoSdkForReports,
  shareReportViaKakao,
  validateShareUrlForKakao,
} from "@/lib/kakao/share-report";
import {
  attachReportUrlToMessage,
  buildNeltParentMessageFallback,
  formatStudyDuration,
  NELT_MESSAGE_VERSION_COUNT,
  type NeltParentMessageTone,
} from "@/lib/nelt/generate-parent-message";
import type { NeltGrowthAnalysis } from "@/lib/nelt/compare/types";

const SENDER_STORAGE_KEY = "nelt-parent-message-sender-v1";

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
  const [tone, setTone] = useState<NeltParentMessageTone>("standard");
  const [parentTitle, setParentTitle] = useState("어머님");
  const [senderRole, setSenderRole] = useState("영어원장");
  const [senderName, setSenderName] = useState("");
  const [enrollmentDate, setEnrollmentDate] = useState("");
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [expiresAt, setExpiresAt] = useState<string | null>(null);
  const [msgLoading, setMsgLoading] = useState(false);
  const [linkLoading, setLinkLoading] = useState(false);
  const [kakaoLoading, setKakaoLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  /** 문구 다시 만들기마다 0→1→…→5 순환 */
  const [messageVersion, setMessageVersion] = useState(0);

  const studyDuration = useMemo(
    () => formatStudyDuration(enrollmentDate || null),
    [enrollmentDate]
  );

  const meta = useMemo(
    () => ({
      academyName,
      parentTitle,
      senderRole,
      senderName,
      enrollmentDate: enrollmentDate || null,
      studyDuration,
      reportUrl: shareUrl,
    }),
    [
      academyName,
      parentTitle,
      senderRole,
      senderName,
      enrollmentDate,
      studyDuration,
      shareUrl,
    ]
  );

  const [parentMessage, setParentMessage] = useState(() =>
    buildNeltParentMessageFallback(analysis, {
      academyName,
      parentTitle: "어머님",
      senderRole: "영어원장",
      senderName: "",
    })
  );

  const periodLabel =
    analysis.start.testDate && analysis.end.testDate
      ? `${analysis.start.testDate} ~ ${analysis.end.testDate} · ${analysis.attemptCount}회차`
      : `NELT ${analysis.attemptCount}회차`;

  useEffect(() => {
    if (kakaoConfigured) {
      void loadKakaoSdkForReports().catch(() => undefined);
    }
  }, [kakaoConfigured]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(SENDER_STORAGE_KEY);
      if (!raw) return;
      const saved = JSON.parse(raw) as {
        senderRole?: string;
        senderName?: string;
      };
      if (saved.senderRole) setSenderRole(saved.senderRole);
      if (saved.senderName) setSenderName(saved.senderName);
    } catch {
      /* ignore */
    }
  }, []);

  useEffect(() => {
    try {
      localStorage.setItem(
        SENDER_STORAGE_KEY,
        JSON.stringify({ senderRole, senderName })
      );
    } catch {
      /* ignore */
    }
  }, [senderRole, senderName]);

  function flashOk(text: string) {
    setStatus(text);
    setError(null);
    window.setTimeout(() => setStatus(null), 5000);
  }
  function flashErr(text: string) {
    setError(text);
    window.setTimeout(() => setError(null), 6000);
  }

  function pasteBody(message: string, url: string) {
    return attachReportUrlToMessage(message, url);
  }

  async function generateParentMessage() {
    setMsgLoading(true);
    const nextVersion = (messageVersion + 1) % NELT_MESSAGE_VERSION_COUNT;
    try {
      const res = await fetch("/api/nelt/parent-message", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentName,
          analysis,
          tone,
          messageVersion: nextVersion,
          previousMessage: parentMessage,
          meta: {
            ...meta,
            messageVersion: nextVersion,
            previousMessage: parentMessage,
            variationSeed: `${Date.now()}-${nextVersion}-${Math.random()
              .toString(36)
              .slice(2, 8)}`,
          },
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok) {
        throw new Error(json.message ?? "문구 생성 실패");
      }
      let message = json.message as string;
      if (shareUrl) message = attachReportUrlToMessage(message, shareUrl);
      setParentMessage(message);
      setMessageVersion(
        typeof json.versionIndex === "number" ? json.versionIndex : nextVersion
      );
      const verLabel =
        typeof json.versionLabel === "string" ? json.versionLabel : "";
      const verPart = verLabel
        ? ` · ${verLabel} (${(json.versionIndex ?? nextVersion) + 1}/${json.versionCount ?? NELT_MESSAGE_VERSION_COUNT})`
        : "";
      flashOk(`다른 버전으로 만들었습니다.${verPart}`);
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
          meta,
          // 저장된 UUID면 이름 조회 실패해도 공유 가능 / local-*면 서버가 자동 저장
          reportIds: analysis.attempts.map((a) => a.id),
        }),
      });
      const json = await res.json();
      if (!res.ok || !json.ok || !json.shareUrl) {
        throw new Error(json.message ?? "링크 생성 실패");
      }
      setShareUrl(json.shareUrl as string);
      setExpiresAt(json.expiresAt ?? null);
      if (json.parentMessage) {
        setParentMessage(json.parentMessage as string);
      } else {
        setParentMessage((prev) =>
          attachReportUrlToMessage(prev, json.shareUrl as string)
        );
      }
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

      const paste = pasteBody(parentMessage, url);
      setParentMessage(paste);

      const result = await shareReportViaKakao({
        studentName,
        periodLabel,
        shareUrl: url,
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

  async function copyMessageOnly() {
    try {
      await navigator.clipboard.writeText(parentMessage.trim());
      flashOk("안내문을 복사했습니다.");
    } catch {
      flashErr("복사에 실패했습니다.");
    }
  }

  async function copyShareUrlOnly() {
    let url = shareUrl;
    if (!url) url = await createShareLink();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      flashOk("공유 링크를 복사했습니다.");
    } catch {
      flashErr("링크 복사에 실패했습니다.");
    }
  }

  async function handlePasteCopy() {
    let url = shareUrl;
    if (!url) url = await createShareLink();
    if (!url) return;
    const paste = pasteBody(parentMessage, url);
    setParentMessage(paste);
    try {
      await navigator.clipboard.writeText(paste);
      flashOk("카카오톡에 붙여넣을 안내문을 복사했습니다.");
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
    <section className="print:hidden space-y-4 rounded-2xl border border-[#dce3ed] bg-[#fbfcfe] p-5">
      <div className="rounded-2xl border border-[#dce3ed] bg-white p-4">
        <h4 className="m-0 text-sm font-bold text-[#152d4f]">
          안내문 발신 정보
        </h4>
        <p className="mt-1 text-xs text-slate-500">
          학부모 호칭·발신자·수강 시작일을 넣으면 따뜻한 편지형 안내문이
          만들어집니다.
        </p>
        <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
          <label className="text-xs text-slate-600">
            학부모 호칭
            <select
              className="ui-input mt-1 h-9 w-full text-sm"
              value={parentTitle}
              onChange={(e) => setParentTitle(e.target.value)}
            >
              <option value="어머님">어머님</option>
              <option value="아버님">아버님</option>
              <option value="보호자님">보호자님</option>
            </select>
          </label>
          <label className="text-xs text-slate-600">
            발신자 직책
            <select
              className="ui-input mt-1 h-9 w-full text-sm"
              value={senderRole}
              onChange={(e) => setSenderRole(e.target.value)}
            >
              <option value="영어원장">영어원장</option>
              <option value="영어전임">영어전임</option>
              <option value="영어강사">영어강사</option>
            </select>
          </label>
          <label className="text-xs text-slate-600">
            발신자 이름
            <input
              className="ui-input mt-1 h-9 w-full text-sm"
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              placeholder="예: 최정민"
            />
          </label>
          <label className="text-xs text-slate-600">
            수강 시작일
            <input
              type="date"
              className="ui-input mt-1 h-9 w-full text-sm"
              value={enrollmentDate}
              onChange={(e) => setEnrollmentDate(e.target.value)}
            />
          </label>
        </div>
        {studyDuration && (
          <p className="mt-2 text-xs text-[#244a78]">
            함께한 기간: 약 {studyDuration}
          </p>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div className="rounded-2xl border border-[#dce3ed] bg-white p-4">
          <h4 className="m-0 text-sm font-bold text-[#152d4f]">
            리포트 공유 링크
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            링크를 만들면 안내문 본문에도 자동으로 들어갑니다.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
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
              variant="secondary"
              size="sm"
              disabled={linkLoading}
              onClick={() => void copyShareUrlOnly()}
            >
              링크 복사
            </Button>
          </div>
          {shareUrl ? (
            <div className="mt-3 rounded-xl bg-[#edf4ff] px-3 py-2 text-xs text-[#244a78]">
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
          ) : (
            <p className="mt-3 text-xs text-slate-400">
              아직 공유 링크가 없습니다.
            </p>
          )}
        </div>

        <div className="rounded-2xl border border-[#dce3ed] bg-white p-4">
          <h4 className="m-0 text-sm font-bold text-[#152d4f]">
            카카오톡 발송 문구
          </h4>
          <p className="mt-1 text-xs text-slate-500">
            기본·간단·상세 톤을 고른 뒤 문구를 다시 만드세요.
          </p>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <select
              className="ui-input h-9 w-auto min-w-[120px] text-sm"
              value={tone}
              onChange={(e) =>
                setTone(e.target.value as NeltParentMessageTone)
              }
              aria-label="안내문 톤"
            >
              <option value="standard">기본 안내</option>
              <option value="short">간단 안내</option>
              <option value="detail">상세 안내</option>
            </select>
            <Button
              type="button"
              variant="secondary"
              size="sm"
              disabled={msgLoading}
              onClick={() => void generateParentMessage()}
            >
              {msgLoading ? "작성 중…" : "문구 다시 만들기"}
            </Button>
            <Button
              type="button"
              variant="primary"
              size="sm"
              onClick={() => void copyMessageOnly()}
            >
              안내문 복사
            </Button>
          </div>
        </div>
      </div>

      <textarea
        className="ui-input min-h-[260px] w-full resize-y text-sm leading-relaxed"
        value={parentMessage}
        onChange={(e) => setParentMessage(e.target.value)}
        aria-label="학부모 안내 문구"
      />

      <div className="flex flex-wrap gap-2">
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
          안내문 복사 (링크 포함)
        </Button>
      </div>

      {status && <p className="text-xs text-emerald-700">{status}</p>}
      {error && <p className="text-xs text-red-600">{error}</p>}
      {warning && <p className="text-xs text-amber-700">{warning}</p>}
      {!kakaoConfigured && (
        <p className="text-[11px] text-slate-400">{KAKAO_PRODUCT_LINK_HINT}</p>
      )}
    </section>
  );
}
