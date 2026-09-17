/**
 * 흑백 인쇄용 그림 규칙.
 *
 * 학원 대부분이 흑백 프린터를 쓴다(선생님 지적 2026-09-18). 색으로 답이 갈리는 그림은
 * 흑백으로 뽑으면 빨강·파랑이 비슷한 회색이 되어 문제를 풀 수 없다. 그래서
 *  1) 그림은 처음부터 검정 선화로 그리게 하고,
 *  2) 만들어진 PNG는 올리기 전에 회색조로 바꿔 색이 남지 않게 하며,
 *  3) 대본(지문)도 색이 정답 단서가 되지 않게 쓴다.
 */

/** 그림 프롬프트에 넣는 흑백 규칙 (영문 — 이미지 모델용) */
export const BW_FIGURE_RULES = `BLACK-AND-WHITE PRINT RULES (the worksheet is printed on a mono laser printer):
- Draw in BLACK AND WHITE ONLY: black ink line art on pure white. No colour of any kind, no coloured fills, no tinted background.
- Shade with plain grey fills, hatching, stripes, dots or cross-hatching — keep greys either clearly light or clearly dark, never several mid-greys that look alike.
- NEVER let colour carry meaning. Things are told apart by shape, outline, pattern, count, size, position or a printed word — never by "the red one" vs "the blue one".
- Thick, clean outlines and few large details, so everything stays readable when the sheet is printed small.`;

/** 대본(지문) 규칙 (한국어 — 문항 생성 모델용) */
export const BW_SCRIPT_RULE = `흑백 인쇄 규칙: 시험지는 흑백으로 인쇄된다. 색(red, blue, yellow …)으로만 정답이 갈리는 조건은 쓰지 않는다.
그림으로 답을 고르는 유형에서는 모양·무늬(줄무늬·물방울·체크)·개수·크기·붙어 있는 것(리본·주머니·손잡이)·적힌 글자로 구분한다.
색 이름을 말해야 자연스러운 대화라면 정답과 상관없는 곁가지로만 쓴다.`;

/**
 * PNG를 회색조로 바꾼다. 캔버스 모듈을 못 불러오면 원본을 그대로 쓴다.
 * 밝은 색(노랑 등)이 흰색과 붙어 보이지 않게 밝은 쪽을 조금 눌러 준다.
 */
export async function toPrintGrayscalePng(bytes: Buffer): Promise<Buffer> {
  try {
    const { createCanvas, loadImage } = await import("@napi-rs/canvas");
    const img = await loadImage(bytes);
    const canvas = createCanvas(img.width, img.height);
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(0, 0, img.width, img.height);
    ctx.drawImage(img, 0, 0);
    const data = ctx.getImageData(0, 0, img.width, img.height);
    const px = data.data;
    for (let i = 0; i < px.length; i += 4) {
      const y = 0.299 * px[i]! + 0.587 * px[i + 1]! + 0.114 * px[i + 2]!;
      // 아주 밝은 색(노랑·연한 하늘)은 흰 종이와 구별되게 조금 어둡게, 흰 배경(245 이상)은 그대로 둔다
      const v = y >= 245 ? y : Math.max(0, y * 0.9 - 6);
      const g = Math.round(Math.min(255, v));
      px[i] = g;
      px[i + 1] = g;
      px[i + 2] = g;
    }
    ctx.putImageData(data, 0, 0);
    return canvas.toBuffer("image/png");
  } catch {
    return bytes;
  }
}
