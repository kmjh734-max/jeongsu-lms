# -*- coding: utf-8 -*-
"""모양표를 사람이 눈으로 고치도록, 글자 모양을 한 장에 모아 그린다.

기계가 줄을 읽어 만든 표에는 늘 같은 자리에서 틀리는 글자가 있다(「[」를 「d」로,
「'」를 「w」로). 그런 글자는 자주 나오므로, 많이 쓰이는 모양부터 한 장에 모아
놓고 사람이 한 번 보면 표 전체가 깨끗해진다.

  python scripts/grammar-bank/mb_sheet.py 모양표.json "…3800제.pdf" 몇째장 [한장에몇개]

그려 낸 그림의 번호와 기계가 읽은 글자를 함께 적어 두므로, 틀린 것만 골라
mb_fix.json 에 {"모양열쇠": "바른 글자"} 로 적으면 된다.
"""
import io, json, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from mb_glyphs import glyphs_of
from mb_read import load_table

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
OUT = Path("tmp-grammar-bank")


def places(pdf, want, upto=120):
    """모양마다 책에서 한 자리를 찾아 둔다"""
    doc = fitz.open(pdf)
    found = {}
    for pno in range(min(upto, len(doc))):
        for g in glyphs_of(doc[pno]):
            if g["shape"] in want and g["shape"] not in found:
                found[g["shape"]] = (pno, g["x"], g["y"], g["x1"], g["y1"])
        if len(found) >= len(want):
            break
    return doc, found


def main(table_path, pdf, sheet_no, per=120):
    said = json.loads(Path(table_path).read_text(encoding="utf-8"))
    table, seen = load_table(table_path), said["seen"]
    order = sorted(table, key=lambda s: -seen.get(s, 0))
    sheet_no, per = int(sheet_no), int(per)
    chunk = order[(sheet_no - 1) * per: sheet_no * per]
    if not chunk:
        print("더 그릴 모양이 없다.", file=LOG)
        LOG.flush()
        return

    doc, found = places(pdf, set(chunk))
    cols, cell = 12, 64
    rows = (len(chunk) + cols - 1) // cols
    out = fitz.open()
    page = out.new_page(width=cols * cell, height=rows * cell)
    legend = []
    for i, shape in enumerate(chunk):
        spot = found.get(shape)
        if not spot:
            continue
        pno, x0, y0, x1, y1 = spot
        # 테두리를 붙이지 않는다 — 글자가 촘촘해서 조금만 넓혀도 옆 글자가 끼어든다
        pix = doc[pno].get_pixmap(dpi=500, clip=fitz.Rect(x0, y0, x1, y1))
        if pix.width < 2 or pix.height < 2:
            continue          # 획이 한 줄뿐인 도형 — 그릴 거리가 없다
        # 글자 모양이 찌그러지지 않게, 칸 안에서 본디 비율을 지킨다
        room_w, room_h = cell - 10, cell - 22
        scale = min(room_w / pix.width, room_h / pix.height)
        w, h = pix.width * scale, pix.height * scale
        left = (i % cols) * cell + (cell - w) / 2
        top = (i // cols) * cell + 14 + (room_h - h) / 2
        box = fitz.Rect(left, top, left + w, top + h)
        page.insert_image(box, pixmap=pix)
        # 표가 말한 글자를 한글까지 그린다 — 눈으로 그림과 맞대어 보기 위해서다
        page.insert_text(fitz.Point((i % cols) * cell + 3, (i // cols) * cell + 11),
                         "%d" % (i + 1), fontsize=6.5)
        page.insert_text(fitz.Point((i % cols) * cell + cell - 20, (i // cols) * cell + 12),
                         str(table[shape]["ch"]), fontsize=9, fontname="korea",
                         color=(0.85, 0.1, 0.1))
        legend.append({"n": i + 1, "shape": shape, "ch": table[shape]["ch"],
                       "sure": table[shape]["sure"], "times": seen.get(shape, 0)})
    name = OUT / ("mb-sheet-%02d" % sheet_no)
    out.save(str(name) + ".pdf")
    fitz.open(str(name) + ".pdf")[0].get_pixmap(dpi=190).save(str(name) + ".png")
    (OUT / ("mb-sheet-%02d.json" % sheet_no)).write_text(
        json.dumps(legend, ensure_ascii=False), encoding="utf-8")
    covered = sum(seen.get(s, 0) for s in order[:sheet_no * per])
    print("%d째 장: 모양 %d개를 그렸다 (%s.png) — 여기까지가 글자의 %.1f%%"
          % (sheet_no, len(legend), name, covered * 100 / max(sum(seen.values()), 1)), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3], sys.argv[4] if len(sys.argv) > 4 else 120)
