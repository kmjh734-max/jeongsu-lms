# -*- coding: utf-8 -*-
"""그림에 ①②③④⑤ 라벨을 직접 찍는다.

그림 만드는 쪽에 라벨을 맡기면 번호가 빠지거나 겹쳐서 나온다(2026-09-21에 여러 번 겪음).
그래서 라벨 없는 그림을 받아 놓고, 눈으로 자리를 정해 여기서 찍는다.

    python scripts/listening-build/stamp-labels.py 들어갈그림.png 나갈그림.png 0.12,0.2 0.3,0.55 ...

자리는 그림 가로·세로를 1로 본 비율(0~1)로 적는다.
"""
import sys
from PIL import Image, ImageDraw, ImageFont

NUM = "①②③④⑤⑥⑦⑧⑨⑩"


def stamp(src: str, dst: str, spots: list[tuple[float, float]], scale: float = 1.0) -> None:
    im = Image.open(src).convert("RGB")
    d = ImageDraw.Draw(im)
    r = int(min(im.width, im.height) * 0.036 * scale)
    try:
        font = ImageFont.truetype("C:/Windows/Fonts/malgun.ttf", int(r * 1.55))
    except OSError:
        font = ImageFont.load_default()

    for i, (fx, fy) in enumerate(spots):
        cx, cy = int(im.width * fx), int(im.height * fy)
        # 흰 동그라미에 검은 테두리 — 그림 위에 놓아도 번호가 보인다
        d.ellipse([cx - r, cy - r, cx + r, cy + r], fill="white", outline="black", width=max(2, r // 7))
        d.text((cx, cy - r * 0.06), NUM[i], font=font, fill="black", anchor="mm")

    im.save(dst)
    print("찍음:", dst, im.size, f"· 라벨 {len(spots)}개")


if __name__ == "__main__":
    src, dst = sys.argv[1], sys.argv[2]
    spots = []
    for a in sys.argv[3:]:
        x, y = a.split(",")
        spots.append((float(x), float(y)))
    stamp(src, dst, spots)
