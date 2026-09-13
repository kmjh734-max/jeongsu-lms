import { useLayoutEffect, useState, type CSSProperties } from "react";

/**
 * 미리보기를 transform: scale로 줄이면 줄어든 만큼의 높이가 빈 채로 남아, 마지막 쪽 아래로
 * 한참 더 스크롤됐다. 줄인 요소를 이 틀로 감싸 틀 높이를 "실제 높이 × 배율"로 맞춘다.
 * 인쇄에서는 배율을 풀므로 틀 높이도 풀어야 한다(print:!h-auto print:!overflow-visible).
 *
 * ref는 콜백이다. 줄일 요소가 로딩 화면 뒤에 늦게 나타나도 그때부터 잰다.
 */
export function useScaledHeight<T extends HTMLElement>(scale: number) {
  const [el, setEl] = useState<T | null>(null);
  const [height, setHeight] = useState<number | null>(null);

  useLayoutEffect(() => {
    if (!el) return;
    const update = () => setHeight(Math.ceil(el.offsetHeight * scale));
    update();
    const observer = new ResizeObserver(update);
    observer.observe(el);
    return () => observer.disconnect();
  }, [el, scale]);

  // 아래쪽 그림자가 잘리지 않게 조금 남긴다.
  const frameStyle: CSSProperties | undefined =
    height == null ? undefined : { height: height + 24, overflow: "hidden" };
  return { ref: setEl, frameStyle };
}
