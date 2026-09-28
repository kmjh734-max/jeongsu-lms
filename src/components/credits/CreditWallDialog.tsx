"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";

/**
 * 크레딧이 떨어져 자료 만들기가 막히는 순간에 뜨는 안내.
 *
 * 지금까지는 "크레딧이 부족합니다"라는 글귀만 보이고 끝이라, 쓰는 사람이
 * 다음에 뭘 해야 하는지 알 수 없었다. 원장님은 충전 화면으로 바로 이어 주고,
 * 선생님은 누구에게 말하면 되는지(이름·연락처) 보여 준다.
 *
 * 크레딧이 모자라면 서버가 402로 답한다. 그 답을 지켜보다가 이 창을 띄운다.
 * 원래 응답은 그대로 흘려보내므로 부르는 쪽 동작은 달라지지 않는다.
 */
export function CreditWallDialog({
  canCharge,
  chargeHref,
  adminName,
  adminPhone,
}: {
  canCharge: boolean;
  chargeHref: string;
  adminName?: string | null;
  adminPhone?: string | null;
}) {
  const [message, setMessage] = useState<string | null>(null);
  const closeRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    const original = window.fetch;
    const call = original.bind(window); // 브라우저는 fetch를 window에 묶어 불러야 한다
    let alive = true;

    window.fetch = async function patched(...args: Parameters<typeof fetch>) {
      const res = await call(...args);
      if (!alive || res.status !== 402) return res;
      // 우리 API가 돌려준 402만 본다 (다른 서비스 호출은 건드리지 않는다)
      const url = typeof args[0] === "string" ? args[0] : (args[0] as Request)?.url ?? "";
      if (!/^\/api\//.test(url) && !/^https?:\/\/[^/]+\/api\//.test(url)) return res;
      try {
        const body = (await res.clone().json()) as { message?: unknown };
        const text = typeof body?.message === "string" ? body.message : "";
        setMessage(text || "크레딧을 다 썼어요.");
      } catch {
        setMessage("크레딧을 다 썼어요.");
      }
      return res;
    } as typeof fetch;

    return () => {
      alive = false;
      window.fetch = original;
    };
  }, []);

  useEffect(() => {
    if (!message) return;
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMessage(null);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [message]);

  if (!message) return null;

  const tel = (adminPhone ?? "").replace(/[^0-9+]/g, "");

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credit-wall-title"
    >
      <div className="w-full max-w-md rounded-xl border border-slate-200 bg-white p-6 shadow-lg">
        <p id="credit-wall-title" className="text-lg font-extrabold text-slate-900">
          크레딧을 다 썼어요
        </p>
        <p className="mt-2 text-sm leading-6 text-slate-600">{message}</p>

        {!canCharge && (adminName || adminPhone) ? (
          <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-sm text-slate-700">
            {adminName ? <b>{adminName}</b> : "원장님"} 원장님께 충전을 부탁해 주세요.
            {adminPhone ? (
              <>
                {" "}
                <a className="font-semibold underline" href={`tel:${tel}`}>
                  {adminPhone}
                </a>
              </>
            ) : null}
          </p>
        ) : null}

        <div className="mt-5 flex justify-end gap-2">
          <button
            ref={closeRef}
            type="button"
            onClick={() => setMessage(null)}
            className="inline-flex h-10 items-center rounded-md border border-slate-300 px-5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            닫기
          </button>
          {canCharge ? (
            <Link
              href={chargeHref}
              onClick={() => setMessage(null)}
              className="inline-flex h-10 items-center rounded-md bg-brand-600 px-5 text-sm font-semibold text-white hover:bg-brand-700"
            >
              충전하러 가기
            </Link>
          ) : null}
        </div>
      </div>
    </div>
  );
}
