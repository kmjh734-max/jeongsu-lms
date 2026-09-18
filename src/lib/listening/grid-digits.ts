/**
 * 선택지판 번호(①~⑤)를 선으로 직접 그린다.
 *
 * 예전에는 canvas의 글자 그리기(sans-serif)로 숫자를 얹었는데, 서버에는 글꼴이 없어
 * 동그라미만 찍히고 숫자가 비었다(2026-09-18에 확인). 글꼴에 기대지 않도록 1~5를
 * 선으로 그린다 — 어느 서버에서든 같은 모양이 나온다.
 */
type Ctx = {
  beginPath(): void;
  moveTo(x: number, y: number): void;
  lineTo(x: number, y: number): void;
  arc(x: number, y: number, r: number, a0: number, a1: number, ccw?: boolean): void;
  stroke(): void;
  lineWidth: number;
  lineCap: string;
  lineJoin: string;
};

/**
 * 한 자리 숫자(1~5)를 (cx, cy) 가운데에 size 높이로 그린다.
 * size = 숫자의 세로 길이. 선 두께는 size의 약 1/6.
 */
export function strokeDigit(ctx: Ctx, digit: number, cx: number, cy: number, size: number): void {
  const h = size;
  const w = size * 0.62;
  const top = cy - h / 2;
  const bottom = cy + h / 2;
  const left = cx - w / 2;
  const right = cx + w / 2;

  ctx.lineWidth = Math.max(2, h * 0.17);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.beginPath();

  switch (digit) {
    case 1:
      ctx.moveTo(cx - w * 0.3, top + h * 0.22);
      ctx.lineTo(cx, top);
      ctx.lineTo(cx, bottom);
      break;
    case 2:
      // 위쪽 반원 → 비스듬히 내려와 → 아래 가로줄
      ctx.arc(cx, top + h * 0.26, w * 0.5, Math.PI * 0.9, Math.PI * 2.05);
      ctx.moveTo(right, top + h * 0.34);
      ctx.lineTo(left, bottom);
      ctx.lineTo(right, bottom);
      break;
    case 3:
      ctx.moveTo(left, top);
      ctx.lineTo(right, top);
      ctx.lineTo(cx - w * 0.05, cy - h * 0.06);
      ctx.moveTo(cx - w * 0.18, cy - h * 0.06);
      ctx.arc(cx - w * 0.05, cy + h * 0.2, h * 0.28, Math.PI * 1.55, Math.PI * 0.62);
      break;
    case 4:
      ctx.moveTo(right - w * 0.12, top);
      ctx.lineTo(left, cy + h * 0.16);
      ctx.lineTo(right, cy + h * 0.16);
      ctx.moveTo(right - w * 0.12, top);
      ctx.lineTo(right - w * 0.12, bottom);
      break;
    case 5:
      ctx.moveTo(right, top);
      ctx.lineTo(left, top);
      ctx.lineTo(left, cy - h * 0.02);
      ctx.lineTo(cx, cy - h * 0.06);
      ctx.arc(cx - w * 0.02, cy + h * 0.2, h * 0.29, Math.PI * 1.6, Math.PI * 0.6);
      break;
    default:
      break;
  }
  ctx.stroke();
}
