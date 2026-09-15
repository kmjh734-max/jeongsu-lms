"use client";

import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/layout/NavIcon";
import { Button } from "@/components/ui/Button";
import {
  ExternalIcon,
  KAKAO_FALLBACK_MESSAGE,
  KAKAO_UNAVAILABLE_MESSAGE,
  LinkIcon,
  ReportMenu,
  ReportMenuItem,
} from "@/components/reports/report-ui";
import {
  copyKakaoPasteMessage,
  isKakaoShareConfigured,
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
        throw new Error(json.message ?? "문구를 쓰지 못했어요.");
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
      flashOk(`안내 문구를 새로 썼어요.${verPart}`);
    } catch (e) {
      flashErr(e instanceof Error ? e.message : "문구를 쓰지 못했어요.");
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
        throw new Error(json.message ?? "링크를 만들지 못했어요.");
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
      flashOk("학부모용 링크를 만들었어요. 문구 끝에도 붙였어요.");
      return json.shareUrl as string;
    } catch (e) {
      flashErr(e instanceof Error ? e.message : "링크를 만들지 못했어요.");
      return null;
    } finally {
      setLinkLoading(false);
    }
  }

  async function handleKakao() {
    if (!kakaoConfigured) {
      flashErr(KAKAO_UNAVAILABLE_MESSAGE);
      return;
    }
    setKakaoLoading(true);
    try {
      let url = shareUrl;
      if (!url) url = await createShareLink();
      if (!url) return;

      // 화면/복사용에는 링크 포함, 카카오 본문에는 안내문만 (링크는 「자세히 보기」)
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
        flashOk(
          "카카오톡 창이 열렸어요. 리포트는 「자세히 보기」로 열 수 있어요."
        );
      } else if (result.fallback) {
        flashOk(KAKAO_FALLBACK_MESSAGE);
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
      flashOk("안내 문구를 복사했어요.");
    } catch {
      flashErr("복사하지 못했어요.");
    }
  }

  async function copyShareUrlOnly() {
    let url = shareUrl;
    if (!url) url = await createShareLink();
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
      flashOk("링크를 복사했어요.");
    } catch {
      flashErr("링크를 복사하지 못했어요.");
    }
  }

  async function openShareLink() {
    let url = shareUrl;
    if (!url) url = await createShareLink();
    if (url) window.open(url, "_blank", "noopener,noreferrer");
  }

  async function handlePasteCopy() {
    let url = shareUrl;
    if (!url) url = await createShareLink();
    if (!url) return;
    const paste = pasteBody(parentMessage, url);
    setParentMessage(paste);
    try {
      await navigator.clipboard.writeText(paste);
      flashOk("카카오톡에 붙여 넣을 문구를 복사했어요.");
    } catch {
      const r = await copyKakaoPasteMessage({
        studentName,
        periodLabel,
        shareUrl: url,
        academyName,
      });
      if (r.ok) flashOk("카카오톡에 붙여 넣을 문구를 복사했어요.");
      else flashErr(r.message);
    }
  }

  const warning = shareUrl
    ? validateShareUrlForKakao(shareUrl).warning
    : null;
  const busy = linkLoading || kakaoLoading;

  return (
    <section className="print:hidden rounded-lg border border-slate-200 bg-white p-4 shadow-card">
      <div className="flex items-center justify-between gap-2">
        <p className="text-xs font-medium text-slate-500">보내는 사람</p>
        <ReportMenu label="보내기 더 보기">
          <ReportMenuItem icon="send" onClick={() => void handlePasteCopy()}>
            카카오 붙여넣기용 복사
          </ReportMenuItem>
          <ReportMenuItem
            icon={<ExternalIcon />}
            onClick={() => void openShareLink()}
          >
            링크 열기
          </ReportMenuItem>
        </ReportMenu>
      </div>
      <div className="mt-1.5 grid grid-cols-2 gap-2 lg:grid-cols-5">
        <label className="text-xs text-slate-500">
          학부모 호칭
          <select
            className="ui-select mt-1 h-9 py-1.5"
            value={parentTitle}
            onChange={(e) => setParentTitle(e.target.value)}
          >
            <option value="어머님">어머님</option>
            <option value="아버님">아버님</option>
            <option value="보호자님">보호자님</option>
          </select>
        </label>
        <label className="text-xs text-slate-500">
          직책
          <select
            className="ui-select mt-1 h-9 py-1.5"
            value={senderRole}
            onChange={(e) => setSenderRole(e.target.value)}
          >
            <option value="영어원장">영어원장</option>
            <option value="영어전임">영어전임</option>
            <option value="영어강사">영어강사</option>
          </select>
        </label>
        <label className="text-xs text-slate-500">
          이름
          <input
            className="ui-input mt-1 h-9 py-1.5"
            value={senderName}
            onChange={(e) => setSenderName(e.target.value)}
            placeholder="예: 최정민"
          />
        </label>
        <label className="text-xs text-slate-500">
          수강 시작일
          <input
            type="date"
            className="ui-input mt-1 h-9 py-1.5"
            value={enrollmentDate}
            onChange={(e) => setEnrollmentDate(e.target.value)}
          />
        </label>
        <label className="col-span-2 text-xs text-slate-500 lg:col-span-1">
          문구 길이
          <select
            className="ui-select mt-1 h-9 py-1.5"
            value={tone}
            onChange={(e) => setTone(e.target.value as NeltParentMessageTone)}
          >
            <option value="standard">기본</option>
            <option value="short">간단하게</option>
            <option value="detail">자세하게</option>
          </select>
        </label>
      </div>
      {studyDuration && (
        <p className="mt-1.5 text-xs text-slate-500">
          함께한 기간: 약 {studyDuration}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between gap-2">
        <label
          htmlFor="nelt-parent-message"
          className="text-xs font-medium text-slate-500"
        >
          안내 문구
        </label>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="-mr-2"
          disabled={msgLoading}
          onClick={() => void generateParentMessage()}
        >
          <Icon
            name="rotate"
            size={14}
            className={msgLoading ? "animate-spin" : ""}
          />
          {msgLoading ? "쓰는 중…" : "다시 쓰기"}
        </Button>
      </div>
      <textarea
        id="nelt-parent-message"
        className="ui-input mt-1 min-h-[260px] w-full resize-y text-sm leading-relaxed"
        value={parentMessage}
        onChange={(e) => setParentMessage(e.target.value)}
        disabled={msgLoading}
      />
      <p className="mt-1.5 text-xs text-slate-400">
        {msgLoading
          ? "안내 문구를 쓰고 있어요…"
          : "성장 리포트로 초안을 만들었어요. 고쳐서 보내세요."}
      </p>

      {status && (
        <p className="mt-2 text-xs font-medium text-green-700" role="status">
          {status}
        </p>
      )}
      {error && (
        <p className="mt-2 text-xs font-medium text-rose-700" role="alert">
          {error}
        </p>
      )}
      {warning && <p className="mt-2 text-xs text-amber-700">{warning}</p>}

      <div className="mt-3 grid gap-2 sm:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
        <Button
          type="button"
          className="h-10"
          disabled={busy || msgLoading}
          onClick={() => void handleKakao()}
          title={kakaoConfigured ? undefined : KAKAO_UNAVAILABLE_MESSAGE}
        >
          <Icon name="send" size={16} />
          {kakaoLoading ? "보낼 준비 중…" : "카카오톡으로 보내기"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-10"
          disabled={busy}
          onClick={() => void copyShareUrlOnly()}
        >
          <LinkIcon size={15} />
          {linkLoading && !kakaoLoading ? "만드는 중…" : "링크 복사"}
        </Button>
        <Button
          type="button"
          variant="secondary"
          className="h-10"
          onClick={() => void copyMessageOnly()}
        >
          <Icon name="copy" size={15} />
          문구 복사
        </Button>
      </div>
      <p className="mt-2 text-center text-xs text-slate-400">
        링크는 30일 동안 열 수 있어요
        {shareUrl && expiresAt
          ? ` · ${new Date(expiresAt).toLocaleDateString("ko-KR")}까지`
          : ""}
      </p>
    </section>
  );
}
