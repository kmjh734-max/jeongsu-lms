/**
 * 그림을 흑백 인쇄용 회색조로 바꾼다. 캔버스 모듈을 쓰므로 서버에서만 부른다.
 * (규칙 글은 [print-bw.ts]에 있다 — 화면 쪽 코드가 캔버스를 끌어오지 않게 파일을 나눴다.)
 */
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
