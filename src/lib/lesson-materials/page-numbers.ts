/**
 * 인쇄물 쪽번호.
 *
 * 브라우저의 @page 쪽번호는 미리보기 화면에 나오지 않고 자리도 마음대로 잡을 수 없다.
 * 이 자료들은 A4 한 장이 화면에서도 요소 하나(.lesson-pack-a4-sheet 등)라, 쪽이 다 나뉜 뒤
 * 차례대로 번호를 적어 두면 화면과 종이가 같은 번호를 보여 준다.
 * 번호는 data-page-no로 적고, 보이는 모양은 globals.css가 맡는다.
 */

/** 한 장에 해당하는 요소들 (자료 쪽 · 통합자료의 표지·목차·간지) */
export const PAGE_SHEET_SELECTOR =
  ".lesson-pack-a4-sheet, .qg-print-page, .final-bundle-sheet";

export interface PageNumberOptions {
  /** 첫 쪽에 적을 번호 (기본 1) */
  startAt?: number;
  /** 번호를 적지 않을 장 (표지·뒤표지). 번호 자체는 세되 적지만 않는다 */
  skip?: (sheet: HTMLElement, index: number) => boolean;
}

/** 지금 화면에 있는 장들에 번호를 적는다. 껐을 때는 적어 둔 번호를 지운다. */
export function stampPageNumbers(
  root: HTMLElement | null,
  enabled: boolean,
  opts: PageNumberOptions = {}
): void {
  if (!root) return;
  const sheets = Array.from(root.querySelectorAll<HTMLElement>(PAGE_SHEET_SELECTOR)).filter(
    (el) => el.offsetParent !== null || el.getClientRects().length > 0
  );
  if (!enabled) {
    for (const el of sheets) el.removeAttribute("data-page-no");
    return;
  }
  let n = opts.startAt ?? 1;
  sheets.forEach((el, i) => {
    if (opts.skip?.(el, i)) {
      el.removeAttribute("data-page-no");
    } else {
      const value = String(n);
      if (el.getAttribute("data-page-no") !== value) el.setAttribute("data-page-no", value);
    }
    n += 1;
  });
}

/**
 * 쪽이 다시 나뉘거나 자료가 바뀌면 번호도 다시 적는다.
 * 쪽 나눔이 여러 번에 걸쳐 끝나므로 바뀔 때마다 보고, 잠깐씩 쉬었다 적는다.
 */
export function watchPageNumbers(
  root: HTMLElement | null,
  enabled: boolean,
  opts: PageNumberOptions = {}
): () => void {
  if (!root) return () => {};
  let timer: ReturnType<typeof setTimeout> | null = null;
  const run = () => {
    if (timer) clearTimeout(timer);
    timer = setTimeout(() => stampPageNumbers(root, enabled, opts), 60);
  };
  run();
  const observer = new MutationObserver(run);
  observer.observe(root, { childList: true, subtree: true });
  const tick = setInterval(run, 1500);
  return () => {
    observer.disconnect();
    clearInterval(tick);
    if (timer) clearTimeout(timer);
  };
}

/** id로 인쇄 영역을 찾아 번호를 매긴다 (화면에서 ref를 따로 만들지 않아도 되게). */
export function watchPageNumbersById(
  rootId: string,
  enabled: boolean,
  opts: PageNumberOptions = {}
): () => void {
  if (typeof document === "undefined") return () => {};
  const root = document.getElementById(rootId);
  return watchPageNumbers(root, enabled, opts);
}
