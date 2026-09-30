# -*- coding: utf-8 -*-
"""그래머큐 정답지 뒤쪽(워크북 답)을 읽어 답 상자 꼴로 옮긴다.

본책 답은 연한 회색 상자 안에 있지만, 워크북 답은 상자 없이 맨 줄로 실려 있다.
그래서 상자를 찾는 눈으로는 하나도 잡히지 않는다. 색과 띠로 가른다.

    ┌ Unit 01  인칭대명사와 be동사   pp. 2-3 ┐   ← 분홍 띠(1.0, 0.94, 0.92)
    Ⓐ 1 He is, He is, They are  2 …           ← Ⓐ 는 주황, 번호는 갈색, 답은 검정
    Ⓑ 1 He’s  2 We’re …

본책처럼 낱말 하나씩 따로 읽으면 이 쪽에서는 글자가 작아 차례가 뒤엉킨다
(「He is」가 「iS, Heis」로 나왔다). 그래서 **줄을 통째로** 크게 키워 읽고,
그 글에서 문항 번호를 찾아 가른다.

  python scripts/grammar-bank/gqwb_answers.py "…정답.pdf" out.json
"""
import io, json, re, sys, time
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
import gq_answers_ocr as O

BAR = (1.0, 0.94, 0.92)      # Unit 띠 색
LETTER = (0.9, 0.41, 0.25)   # Ⓐ·Ⓑ·Ⓒ 글자 색
NEAR = 0.04
DPI = 500
CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"


def same(a, b):
    return a and len(a) == 3 and all(abs(x - y) < NEAR for x, y in zip(a, b))


def bars(page):
    out = []
    for d in page.get_drawings():
        if same(d.get("fill"), BAR) and d["rect"].width > 100 and 10 < d["rect"].height < 60:
            out.append(fitz.Rect(d["rect"]))
    out.sort(key=lambda r: (0 if r.x0 < page.rect.width / 2 else 1, r.y0))
    return out


def letters(page, glyphs):
    """묶음 표시 Ⓐ·Ⓑ·Ⓒ — 단 왼쪽 끝에 홀로 놓인 주황 글자"""
    mid = page.rect.width / 2
    left = {0: min((g["x"] for g in glyphs if g["x"] < mid), default=0),
            1: min((g["x"] for g in glyphs if g["x"] >= mid), default=mid)}
    out = []
    for g in glyphs:
        if not same(g["color"], LETTER):
            continue
        col = 0 if g["x"] < mid else 1
        if g["x"] - left[col] < 6 and (g["y1"] - g["y"]) < 9:
            out.append({"x": g["x"], "y": g["y"], "col": col})
    out.sort(key=lambda g: (g["col"], g["y"]))
    kept = []
    for g in out:
        if kept and g["col"] == kept[-1]["col"] and abs(g["y"] - kept[-1]["y"]) < 4:
            continue
        kept.append(g)
    return kept


def bands(glyphs, top, bottom, x0, x1):
    """묶음 안을 글줄로 가른다"""
    ys = sorted({round(g["y"] / 3) * 3 for g in glyphs
                 if x0 <= g["x"] < x1 and top <= g["y"] < bottom})
    out = []
    for y in ys:
        if out and y - out[-1][-1] < 6:
            out[-1].append(y)
        else:
            out.append([y])
    return out


def split_items(text):
    """「1 He is, He is 2 She is …」 를 문항마다 가른다.

    번호는 1부터 하나씩 늘어난다. 답 안에도 숫자가 있을 수 있으므로, 다음에
    와야 할 번호일 때만 새 문항으로 본다.
    """
    flat = re.sub(r"\s+", " ", text).strip()
    # 맨 앞의 묶음 글자(Ⓐ 가 R·P·@ 따위로 읽힌다)를 떼어 낸다
    flat = re.sub(r"^[^\d]{0,3}(?=\d)", "", flat)
    out, want, now = [], 1, None
    for piece in flat.split(" "):
        # 번호 뒤 글자가 붙어 나오기도 한다(「2is」) — 번호만 떼어 낸다
        hit = re.match(r"^%d(?![0-9])(.*)$" % want, piece)
        if hit:
            if now is not None:
                out.append({"no": want - 1, "text": " ".join(now).strip(" ,")})
            now, want = ([hit.group(1)] if hit.group(1) else []), want + 1
            continue
        if now is not None:
            now.append(piece)
    if now is not None:
        out.append({"no": want - 1, "text": " ".join(now).strip(" ,")})
    return [c for c in out if c["text"]]


def run(pdf_path, out_path):
    import easyocr

    reader = easyocr.Reader(["ko", "en"], gpu=False, verbose=False)
    doc = fitz.open(pdf_path)
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    t0 = time.time()

    out = []
    for i, page in enumerate(doc):
        bar_rects = bars(page)
        if not bar_rects:
            continue
        glyphs = O.glyphs_in(page, page.rect)
        marks = letters(page, glyphs)
        if not marks:
            continue
        mid = page.rect.width / 2
        # 띠 안의 글씨는 분홍 바탕에 주황이라 읽히지 않는다. 대신 띠 하나가
        # Unit 하나이고 차례대로 나오므로, 머리에는 「Unit」만 적어 둔다.
        # 맞대는 쪽에서 차례로 다음 Unit 을 짚는다.

        for n, g in enumerate(marks):
            col = g["col"]
            after = [m for m in marks[n + 1:] if m["col"] == col]
            stop = after[0]["y"] if after else page.rect.height
            for r in bar_rects:
                if (0 if r.x0 < mid else 1) == col and g["y"] < r.y0 < stop:
                    stop = r.y0
            x0 = 0 if col == 0 else mid
            x1 = mid if col == 0 else page.rect.width
            said = []
            for band in bands(glyphs, g["y"] - 2, stop - 2, x0, x1):
                rect = fitz.Rect(x0 + 2, band[0] - 2, x1 - 2, band[-1] + 9)
                png = page.get_pixmap(dpi=DPI, clip=rect).tobytes("png")
                got = reader.readtext(png, detail=0, paragraph=True)
                if got:
                    said.append(" ".join(got))
            pieces = split_items(" ".join(said))
            if not pieces:
                continue
            above = [r for r in bar_rects
                     if (0 if r.x0 < mid else 1) == col and r.y1 <= g["y"] + 2]
            head = ""
            # 띠 바로 아래 묶음이 그 Unit 의 첫 묶음이다 (틈 30 남짓, 다음 묶음은 78 넘음)
            if above and g["y"] - above[-1].y1 < 45:
                head = "Unit"
            out.append({"answer_page": i + 1,
                        "rect": [round(v, 1) for v in (x0, g["y"] - 3, x1, stop - 2)],
                        "head": head,
                        "pieces": [{"step": 1, "no": c["no"], "text": c["text"], "score": 1.0}
                                   for c in pieces]})
        print("  %d/%d쪽 · 묶음 누적 %d개 · %.0f초"
              % (i + 1, doc.page_count, len(out), time.time() - t0), file=log, flush=True)

    Path(out_path).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("워크북 답 묶음 %d개 저장: %s" % (len(out), out_path), file=log)
    log.flush()


if __name__ == "__main__":
    run(sys.argv[1], sys.argv[2])
