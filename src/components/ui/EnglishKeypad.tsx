"use client";

import { useEffect, useReducer, useRef, useState } from "react";
import { addJamo, removeJamo } from "@/lib/hangul-compose";

/**
 * 휴대폰·태블릿에서 영어 답 칸에 띄우는 자체 영어 자판.
 *
 * 휴대폰 키보드는 추천 단어(자동완성)를 끄라는 표시를 무시해서, 몇 글자만 치고 추천 단어를 누르면
 * 답을 알 수 있었다(선생님 지적 2026-09-18). 답 칸에 inputMode="none"을 걸어 폰 키보드를 열지 않고,
 * 이 자판으로 한 글자씩 넣는다. 추천 단어 줄이 없다. 컴퓨터(마우스·키보드)에서는 뜨지 않는다.
 *
 * 쓰는 법: 답 칸에 {...englishKeypadProps}를 걸고, 학생 화면 어디든 <EnglishKeypad />를 한 번 둔다.
 */
export const englishKeypadProps = {
  inputMode: "none" as const,
  "data-keypad": "en",
};

/** 한글 뜻 칸: 두벌식 자판(글자 조합 포함) */
export const koreanKeypadProps = {
  inputMode: "none" as const,
  "data-keypad": "ko",
};

const ROWS = ["qwertyuiop", "asdfghjkl", "zxcvbnm"];
const KO_ROWS = ["ㅂㅈㄷㄱㅅㅛㅕㅑㅐㅔ", "ㅁㄴㅇㄹㅎㅗㅓㅏㅣ", "ㅋㅌㅊㅍㅠㅜㅡ"];
const KO_SHIFT: Record<string, string> = { "ㅂ": "ㅃ", "ㅈ": "ㅉ", "ㄷ": "ㄸ", "ㄱ": "ㄲ", "ㅅ": "ㅆ", "ㅐ": "ㅒ", "ㅔ": "ㅖ" };

function isKeypadInput(el: Element | null): el is HTMLInputElement {
  return (
    el instanceof HTMLInputElement &&
    (el.dataset.keypad === "en" || el.dataset.keypad === "ko") &&
    !el.disabled &&
    !el.readOnly
  );
}

/** React가 알아듣게 값을 바꾸고 input 이벤트를 보낸다 */
function setNativeValue(input: HTMLInputElement, value: string) {
  const setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, "value")?.set;
  setter?.call(input, value);
  input.dispatchEvent(new Event("input", { bubbles: true }));
}

export function EnglishKeypad() {
  const [target, setTarget] = useState<HTMLInputElement | null>(null);
  const [touch, setTouch] = useState(false);
  const [upper, setUpper] = useState(false);
  const keypadRef = useRef<HTMLDivElement>(null);
  const [, rerender] = useReducer((n: number) => n + 1, 0);

  useEffect(() => {
    const mq = window.matchMedia("(pointer: coarse)");
    const update = () => setTouch(mq.matches);
    update();
    mq.addEventListener("change", update);
    const onFocusIn = (e: FocusEvent) => {
      const el = e.target as Element | null;
      if (isKeypadInput(el)) setTarget(el);
    };
    const onFocusOut = (e: FocusEvent) => {
      const next = e.relatedTarget as Node | null;
      if (next && keypadRef.current?.contains(next)) return;
      // 다른 답 칸으로 옮겨 가는 중이면 focusin이 곧 다시 잡는다
      setTimeout(() => {
        if (!isKeypadInput(document.activeElement)) setTarget(null);
      }, 0);
    };
    document.addEventListener("focusin", onFocusIn);
    document.addEventListener("focusout", onFocusOut);
    return () => {
      mq.removeEventListener("change", update);
      document.removeEventListener("focusin", onFocusIn);
      document.removeEventListener("focusout", onFocusOut);
    };
  }, []);

  // 같은 칸이 영어 ↔ 한글 문항으로 바뀌면 자판도 바꾼다
  useEffect(() => {
    if (!target) return;
    const mo = new MutationObserver(() => rerender());
    mo.observe(target, { attributes: true, attributeFilter: ["data-keypad"] });
    return () => mo.disconnect();
  }, [target]);

  const shown = touch && Boolean(target);
  // 자판이 떠 있는 동안에는 화면 아래(정답 확인 버튼 등)가 가려지지 않게 여백을 준다
  useEffect(() => {
    if (!shown) return;
    const prev = document.body.style.paddingBottom;
    document.body.style.paddingBottom = "240px";
    target?.scrollIntoView({ block: "center", behavior: "smooth" });
    return () => {
      document.body.style.paddingBottom = prev;
    };
  }, [shown, target]);

  if (!shown || !target) return null;

  const press = (key: string) => {
    const input = target;
    if (!input.isConnected) return;
    if (key === "enter") {
      input.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", bubbles: true }));
      return;
    }
    const cur = input.value;
    const korean = input.dataset.keypad === "ko";
    const next = korean
      ? key === "back"
        ? removeJamo(cur)
        : key.length === 1 && /[ㄱ-ㅣ]/.test(key)
          ? addJamo(cur, upper ? (KO_SHIFT[key] ?? key) : key)
          : cur + key
      : key === "back"
        ? cur.slice(0, -1)
        : cur + (upper ? key.toUpperCase() : key);
    setNativeValue(input, next);
    if (upper && key.length === 1) setUpper(false);
    input.focus({ preventScroll: true });
  };

  // 누를 때 답 칸에서 초점이 빠지지 않게 한다
  const keep = (e: React.PointerEvent | React.MouseEvent) => e.preventDefault();

  const keyCls =
    "flex h-11 min-w-0 flex-1 items-center justify-center rounded-md bg-white text-[17px] font-semibold text-slate-900 shadow-[0_1px_0_rgba(15,23,42,0.25)] active:bg-slate-200";

  return (
    <div
      ref={keypadRef}
      className="fixed inset-x-0 bottom-0 z-[60] border-t border-slate-300 bg-slate-200/95 px-1 pb-[max(8px,env(safe-area-inset-bottom))] pt-2 backdrop-blur"
      role="group"
      aria-label={target.dataset.keypad === "ko" ? "한글 자판" : "영어 자판"}
      onPointerDown={keep}
      onMouseDown={keep}
    >
      <div className="mx-auto flex max-w-xl flex-col gap-1.5">
        {(target.dataset.keypad === "ko" ? KO_ROWS : ROWS).map((row, i) => (
          <div key={row} className={`flex gap-1 ${i === 1 ? "px-[5%]" : ""}`}>
            {i === 2 ? (
              <button type="button" aria-label="대문자" className={`${keyCls} flex-[1.4] text-sm ${upper ? "bg-slate-700 text-white" : ""}`} onClick={() => setUpper((u) => !u)}>
                ⇧
              </button>
            ) : null}
            {row.split("").map((ch) => (
              <button key={ch} type="button" className={keyCls} onClick={() => press(ch)}>
                {target.dataset.keypad === "ko" ? (upper ? (KO_SHIFT[ch] ?? ch) : ch) : upper ? ch.toUpperCase() : ch}
              </button>
            ))}
            {i === 2 ? (
              <button type="button" aria-label="지우기" className={`${keyCls} flex-[1.4] text-sm`} onClick={() => press("back")}>
                ⌫
              </button>
            ) : null}
          </div>
        ))}
        <div className="flex gap-1">
          {(target.dataset.keypad === "ko" ? [",", "~"] : ["'", "-"]).map((ch) => (
            <button key={ch} type="button" className={`${keyCls} flex-[0.8]`} onClick={() => press(ch)}>
              {ch}
            </button>
          ))}
          <button type="button" className={`${keyCls} flex-[4] text-sm text-slate-500`} onClick={() => press(" ")}>
            띄어쓰기
          </button>
          <button
            type="button"
            className={`${keyCls} flex-[1.8] bg-brand-600 text-sm text-white active:bg-brand-700`}
            onClick={() => press("enter")}
          >
            확인
          </button>
        </div>
      </div>
    </div>
  );
}
