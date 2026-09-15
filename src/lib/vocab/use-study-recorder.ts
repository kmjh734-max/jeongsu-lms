"use client";

import { useCallback, useEffect, useRef } from "react";

/*
 * 단어학습 중간 기록을 모아서 보내는 훅.
 * - 답마다 서버를 기다리지 않는다. 한 번에 한 요청만 보내고, 그동안 쌓인 답은 다음 요청에 묶는다.
 *   (서버 액션은 화면 이동과 한 줄로 서서 차례를 기다리므로, 빨리 풀면 기록이 밀리고
 *   다른 곳으로 가면 남은 기록이 사라졌다.)
 * - fetch keepalive라 화면을 닫아도 보낸 기록은 끝까지 저장된다. 화면을 떠날 때 남은 답도 바로 보낸다.
 * - flush()는 남은 기록을 모두 보낸 뒤 결과를 돌려준다(단계 완료 직전에 쓴다).
 */

export type RecorderResult = {
  ok: boolean;
  message: string;
  completed?: boolean;
};

const ENDPOINT = "/api/student/vocab/record";
const NETWORK_MESSAGE = "인터넷 연결을 확인해 주세요. 연결되면 이어서 저장해요.";

type Options = {
  stage: 1 | 2 | 3;
  setId: string;
  /** false면 아무것도 보내지 않는다 (QR 게스트 학습) */
  enabled: boolean;
  /** 보낼 때마다 함께 실어 보낼 값 (1단계: 지금까지 본 카드) */
  extra?: () => Record<string, unknown>;
  /** 서버가 기록을 거절했을 때 */
  onError?: (message: string) => void;
};

export function useStudyRecorder<T>({ stage, setId, enabled, extra, onError }: Options) {
  const queueRef = useRef<T[]>([]);
  const inflightRef = useRef<Promise<RecorderResult> | null>(null);
  const lastRef = useRef<RecorderResult>({ ok: true, message: "" });
  const retryTimerRef = useRef<number | null>(null);
  const extraRef = useRef(extra);
  extraRef.current = extra;
  const onErrorRef = useRef(onError);
  onErrorRef.current = onError;

  const post = useCallback(
    async (batch: T[]): Promise<RecorderResult> => {
      try {
        const res = await fetch(ENDPOINT, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            stage,
            setId,
            entries: batch,
            ...(extraRef.current?.() ?? {}),
          }),
          keepalive: true,
          credentials: "same-origin",
        });
        const json = (await res.json().catch(() => null)) as RecorderResult | null;
        if (!json) {
          return { ok: false, message: "저장하지 못했어요. 잠시 뒤 다시 시도해 주세요." };
        }
        return json;
      } catch {
        // 연결이 끊긴 것 — 다시 보낼 수 있게 표시
        return { ok: false, message: NETWORK_MESSAGE, completed: undefined };
      }
    },
    [stage, setId]
  );

  /** 쌓인 답을 한 요청으로 보낸다 (이미 보내는 중이면 끝난 뒤 이어서) */
  const pump = useCallback((): Promise<RecorderResult> => {
    if (inflightRef.current) return inflightRef.current;
    if (queueRef.current.length === 0) return Promise.resolve(lastRef.current);
    const batch = queueRef.current.splice(0, queueRef.current.length);
    const p = post(batch).then((result) => {
      inflightRef.current = null;
      lastRef.current = result;
      if (!result.ok) {
        if (result.message === NETWORK_MESSAGE) {
          // 못 보낸 답은 앞에 다시 넣고 잠시 뒤 다시 보낸다
          queueRef.current = [...batch, ...queueRef.current];
          if (retryTimerRef.current == null) {
            retryTimerRef.current = window.setTimeout(() => {
              retryTimerRef.current = null;
              void pump();
            }, 2000);
          }
        }
        onErrorRef.current?.(result.message);
      } else if (queueRef.current.length > 0) {
        void pump();
      }
      return result;
    });
    inflightRef.current = p;
    return p;
  }, [post]);

  const push = useCallback(
    (entry: T) => {
      if (!enabled) return;
      queueRef.current.push(entry);
      void pump();
    },
    [enabled, pump]
  );

  /**
   * 남은 기록을 모두 보내고 마지막 결과를 돌려준다.
   * final을 주면 남은 답은 그 함수(서버 액션)로 보낸다 — 답이 없어도 한 번은 부른다.
   */
  const flush = useCallback(
    async (final?: (batch: T[]) => Promise<RecorderResult>): Promise<RecorderResult> => {
      if (!enabled) return { ok: true, message: "" };
      for (let attempt = 0; attempt < 3; attempt++) {
        if (retryTimerRef.current != null) {
          window.clearTimeout(retryTimerRef.current);
          retryTimerRef.current = null;
        }
        if (final) {
          // 보내는 중인 기록은 기다리지 않고 나란히 보낸다 (마무리에는 전체 상태가 함께 실린다)
          const inflight = inflightRef.current;
          const batch = queueRef.current.splice(0, queueRef.current.length);
          let result: RecorderResult;
          try {
            [, result] = await Promise.all([inflight, final(batch)]);
          } catch {
            result = { ok: false, message: NETWORK_MESSAGE };
          }
          lastRef.current = result;
          if (result.ok || result.message !== NETWORK_MESSAGE) return result;
          queueRef.current = [...batch, ...queueRef.current];
        } else {
          if (inflightRef.current) await inflightRef.current;
          if (queueRef.current.length === 0) return lastRef.current.ok ? lastRef.current : { ok: true, message: "" };
          const result = await pump();
          if (queueRef.current.length === 0 && (result.ok || result.message !== NETWORK_MESSAGE)) {
            return result;
          }
        }
        await new Promise((r) => window.setTimeout(r, 800));
      }
      return { ok: false, message: NETWORK_MESSAGE };
    },
    [enabled, pump]
  );

  // 화면을 떠나거나 앱을 내리면 남은 답을 바로 보낸다 (keepalive라 닫혀도 전송된다)
  useEffect(() => {
    if (!enabled) return;
    const sendRest = () => {
      if (queueRef.current.length === 0) return;
      const batch = queueRef.current.splice(0, queueRef.current.length);
      void post(batch);
    };
    const onHide = () => {
      if (document.visibilityState === "hidden") sendRest();
    };
    window.addEventListener("pagehide", sendRest);
    document.addEventListener("visibilitychange", onHide);
    return () => {
      window.removeEventListener("pagehide", sendRest);
      document.removeEventListener("visibilitychange", onHide);
      if (retryTimerRef.current != null) window.clearTimeout(retryTimerRef.current);
      sendRest();
    };
  }, [enabled, post]);

  return { push, flush };
}
