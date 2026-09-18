/**
 * 선택지판 그림에서 물건이 아닌 선과 바탕을 지운다.
 *
 * 선택지판을 칸별로 잘라 붙이면, 그림 모델이 그린 바닥선·칸 나눔 선·옆 칸에서 잘려 들어온 선이
 * 조각으로 남고, 칸마다 살짝 회색인 바탕이 상자처럼 비쳤다(선생님 지적 2026-09-18:
 * "박스가 아니고 자연스럽게"). 두 가지를 한다.
 *  1) 거의 흰색인 바탕은 흰색으로 — 회색 상자처럼 보이던 칸 바탕이 사라진다.
 *  2) 곧게 뻗은 가는 선 가운데 양 끝이 아무것에도 이어지지 않은 선만 지운다.
 *     물건의 테두리(지갑·상자의 아랫변)는 모서리에서 다른 선과 이어지므로 남는다.
 */

/** 이보다 밝으면 바탕(흰색)으로 본다 */
const PAPER = 232;
/** 이보다 어두우면 잉크 */
const INK = 215;

export function stripThinLines(
  data: Uint8ClampedArray,
  width: number,
  height: number
): number {
  const n = width * height;
  const lum = new Float32Array(n);
  for (let p = 0; p < n; p++) {
    const i = p * 4;
    const v = 0.299 * data[i]! + 0.587 * data[i + 1]! + 0.114 * data[i + 2]!;
    lum[p] = v;
    // 1) 거의 흰 바탕은 흰색으로
    if (v >= PAPER) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      lum[p] = 255;
    }
  }
  const ink = (x: number, y: number): boolean =>
    x >= 0 && y >= 0 && x < width && y < height && lum[y * width + x]! < INK;

  const minLen = Math.max(28, Math.round(Math.min(width, height) * 0.12));
  let erasedTotal = 0;
  /*
   * 여러 번 돈다: 서로 붙은 선(ㄱ자·십자)은 한쪽을 지워야 다른 쪽 끝이 풀린다.
   * 양 끝이 모두 떨어진 선은 지운다. 한쪽 끝만 떨어진 선은 옅은 회색일 때만 지운다 —
   * 칸 나눔 선은 옅게 그려지고, 물건의 막대(깃대·손잡이)는 검게 그려진다.
   */
  for (let pass = 0; pass < 4; pass++) {
  const erase: Array<[number, number, number, number]> = []; // x0, y0, x1, y1 (포함)
  const meanLum = (x0: number, y0: number, x1: number, y1: number): number => {
    let sum = 0;
    let c = 0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      sum += lum[y * width + x]!;
      c++;
    }
    return c ? sum / c : 255;
  };
  const shouldErase = (joinA: number, joinB: number, box: [number, number, number, number]): boolean => {
    const freeA = joinA <= 3;
    const freeB = joinB <= 3;
    if (freeA && freeB) return true;
    if (freeA || freeB) return meanLum(...box) > 110;
    return false;
  };

  /** (x,y) 둘레 반경 r 안에 잉크가 몇 칸인지 — 선 밖으로 이어지는 것이 있는지 본다 */
  const inkAround = (x0: number, y0: number, x1: number, y1: number): number => {
    let c = 0;
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) if (ink(x, y)) c++;
    return c;
  };

  // 가로선
  for (let y = 0; y < height; y++) {
    let x = 0;
    while (x < width) {
      if (!ink(x, y)) {
        x++;
        continue;
      }
      const start = x;
      while (x < width && ink(x, y)) x++;
      const end = x - 1;
      if (end - start + 1 < minLen) continue;
      // 두께: 위아래로 같은 폭이 이어지는 줄 수
      let top = y;
      let bottom = y;
      const covered = (yy: number) => {
        let c = 0;
        for (let xx = start; xx <= end; xx++) if (ink(xx, yy)) c++;
        return c / (end - start + 1);
      };
      while (top - 1 >= 0 && covered(top - 1) > 0.8 && y - top < 6) top--;
      while (bottom + 1 < height && covered(bottom + 1) > 0.8 && bottom - y < 6) bottom++;
      if (bottom - top > 5) continue; // 두꺼우면 선이 아니라 칠해진 면
      // 선 바로 위아래가 비어 있어야 떨어진 선이다
      if (covered(top - 2) > 0.2 || covered(bottom + 2) > 0.2) continue;
      // 양 끝이 다른 선과 이어지면(모서리) 물건의 테두리다
      const leftJoin = inkAround(start - 2, top - 6, start + 3, top - 2) + inkAround(start - 2, bottom + 2, start + 3, bottom + 6);
      const rightJoin = inkAround(end - 3, top - 6, end + 2, top - 2) + inkAround(end - 3, bottom + 2, end + 2, bottom + 6);
      if (!shouldErase(leftJoin, rightJoin, [start, top, end, bottom])) continue;
      erase.push([start, top, end, bottom]);
    }
  }

  // 세로선
  for (let x = 0; x < width; x++) {
    let y = 0;
    while (y < height) {
      if (!ink(x, y)) {
        y++;
        continue;
      }
      const start = y;
      while (y < height && ink(x, y)) y++;
      const end = y - 1;
      if (end - start + 1 < minLen) continue;
      let left = x;
      let right = x;
      const covered = (xx: number) => {
        let c = 0;
        for (let yy = start; yy <= end; yy++) if (ink(xx, yy)) c++;
        return c / (end - start + 1);
      };
      while (left - 1 >= 0 && covered(left - 1) > 0.8 && x - left < 6) left--;
      while (right + 1 < width && covered(right + 1) > 0.8 && right - x < 6) right++;
      if (right - left > 5) continue;
      if (covered(left - 2) > 0.2 || covered(right + 2) > 0.2) continue;
      const topJoin = inkAround(left - 6, start - 2, left - 2, start + 3) + inkAround(right + 2, start - 2, right + 6, start + 3);
      const bottomJoin = inkAround(left - 6, end - 3, left - 2, end + 2) + inkAround(right + 2, end - 3, right + 6, end + 2);
      if (!shouldErase(topJoin, bottomJoin, [left, start, right, end])) continue;
      erase.push([left, start, right, end]);
    }
  }

  for (const [x0, y0, x1, y1] of erase) {
    // 선의 번진 가장자리까지 1px 넓혀 지운다
    for (let y = Math.max(0, y0 - 1); y <= Math.min(height - 1, y1 + 1); y++) {
      for (let x = Math.max(0, x0 - 1); x <= Math.min(width - 1, x1 + 1); x++) {
        const i = (y * width + x) * 4;
        data[i] = 255;
        data[i + 1] = 255;
        data[i + 2] = 255;
        lum[y * width + x] = 255;
      }
    }
  }
  erasedTotal += erase.length;
  if (erase.length === 0) break;
  }
  return erasedTotal;
}
