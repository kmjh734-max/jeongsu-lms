# -*- coding: utf-8 -*-
"""그래머큐 정답지 뒤쪽(워크북 답)을 읽어 답 상자 꼴로 옮긴다.

본책 답은 연한 회색 상자 안에 있지만, 워크북 답은 상자 없이 맨 줄로 실려 있다.
그래서 상자를 찾는 눈으로는 하나도 잡히지 않는다. 대신 색과 띠로 가른다.

    ┌ Unit 01  인칭대명사와 be동사   pp. 2-3 ┐   ← 분홍 띠(1.0, 0.94, 0.92)
    Ⓐ 1 He is, He is, They are  2 …           ← Ⓐ 는 주황, 번호는 갈색, 답은 검정
    Ⓑ 1 He’s  2 We’re …

Ⓐ·Ⓑ·Ⓒ 글자 자리로 묶음을 가르고, 그 안은 본책과 같은 눈으로 읽는다.
띠 하나는 Unit 하나다 — 띠만 따로 읽어 Unit 번호를 얻는다.

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


def same(a, b):
    return a and len(a) == 3 and all(abs(x - y) < NEAR for x, y in zip(a, b))


def bars(page):
    """Unit 띠 — (rect, 단)"""
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
    # 같은 줄에 잘게 흩어진 조각은 하나로 본다
    kept = []
    for g in out:
        if kept and g["col"] == kept[-1]["col"] and abs(g["y"] - kept[-1]["y"]) < 4:
            continue
        kept.append(g)
    return kept


def run(pdf_path, out_path):
    import easyocr

    reader = easyocr.Reader(["ko", "en"], gpu=False, verbose=False)
    doc = fitz.open(pdf_path)
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    t0 = time.time()

    out, cache = [], {}
    for i, page in enumerate(doc):
        bar_rects = bars(page)
        if not bar_rects:
            continue
        glyphs = O.glyphs_in(page, page.rect)
        marks = letters(page, glyphs)
        if not marks:
            continue
        mid = page.rect.width / 2
        heads = {}
        for r in bar_rects:
            text, _ = O.read_crop(reader, page, fitz.Rect(r.x0 - 2, r.y0 - 2, r.x1 + 2, r.y1 + 2),
                                  dpi=600)
            heads[(0 if r.x0 < mid else 1, round(r.y0))] = text

        for n, g in enumerate(marks):
            col = g["col"]
            after = [m for m in marks[n + 1:] if m["col"] == col]
            stop = after[0]["y"] if after else page.rect.height
            for r in bar_rects:
                if (0 if r.x0 < mid else 1) == col and g["y"] < r.y0 < stop:
                    stop = r.y0
            x0 = 0 if col == 0 else mid
            x1 = mid if col == 0 else page.rect.width
            rect = fitz.Rect(x0, g["y"] - 3, x1, stop - 2)
            got, _labels = O.cuts(page, rect)
            pieces = []
            for c in got:
                text, score = O.run_text(reader, page, c["run"], cache)
                if text:
                    pieces.append({"step": c["step"], "no": c["no"], "text": text, "score": score})
            if not pieces:
                continue
            # 이 묶음 바로 위의 띠가 있으면 그 Unit 이 여기서 시작한다
            above = [r for r in bar_rects
                     if (0 if r.x0 < mid else 1) == col and r.y1 <= g["y"] + 2]
            head = ""
            if above and g["y"] - above[-1].y1 < 24:
                head = heads.get((col, round(above[-1].y0)), "Unit")
            out.append({"answer_page": i + 1,
                        "rect": [round(v, 1) for v in (rect.x0, rect.y0, rect.x1, rect.y1)],
                        "head": head,
                        "pieces": pieces})
        print("  %d/%d쪽 · 묶음 누적 %d개 · 읽은 모양 %d가지 · %.0f초"
              % (i + 1, doc.page_count, len(out), len(cache), time.time() - t0),
              file=log, flush=True)

    Path(out_path).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("워크북 답 묶음 %d개 저장: %s" % (len(out), out_path), file=log)
    log.flush()


if __name__ == "__main__":
    run(sys.argv[1], sys.argv[2])
