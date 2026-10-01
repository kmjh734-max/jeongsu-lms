# -*- coding: utf-8 -*-
"""모양표로 중학영문법 3800제의 글을 되살린다 (바깥 서비스 없이).

색이 뜻을 가른다
    검정 (0.1,0.1,0.1)   문제 글
    하늘 (0.0,0.7,0.9)   답 — 빈칸에 써 넣은 말, 고친 말, ★ 표시
    초록 (0.0,0.7,0.3)   문항 번호
    보라 (0.5,0.4,0.7)   작은 꼬리표

  python scripts/grammar-bank/mb_read.py 모양표.json "…3800제.pdf" 쪽번호
"""
import io, json, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from mb_glyphs import glyphs_of, rows_of

LOG = io.open(1, "w", encoding="utf-8", closefd=False)

INK = (0.1, 0.1, 0.1)
BLUE = (0.0, 0.7, 0.9)
GREEN = (0.0, 0.7, 0.3)
NAMES = {INK: "글", BLUE: "답", GREEN: "번호"}


def line_text(row, table, gap=1.6):
    """한 줄을 글로 되살린다. 조각 사이가 벌어지면 띄어쓰기를 넣는다."""
    out, last = [], None
    for g in row:
        if last is not None and g["x"] - last > gap:
            out.append(" ")
        got = table.get(g["shape"])
        out.append(got["ch"] if got else "□")   # 모르는 글자는 □
        last = g["x1"]
    return "".join(out).strip()


def main(table_path, pdf, pno):
    said = json.loads(Path(table_path).read_text(encoding="utf-8"))
    table = said["table"]
    doc = fitz.open(pdf)
    page = doc[int(pno) - 1]
    gl = glyphs_of(page)
    mid = page.rect.width / 2
    rows = rows_of(gl)
    rows.sort(key=lambda r: (0 if min(g["x"] for g in r) < mid else 1,
                             min(g["y"] for g in r)))
    unknown = total = 0
    for row in rows:
        text = line_text(row, table)
        unknown += text.count("□")
        total += len(row)
        kind = NAMES.get(row[0]["color"], "")
        print("%-4s %6.1f  %s" % (kind, row[0]["y"], text), file=LOG)
    print("\n글자 %d개 중 모르는 것 %d개 (%.1f%%)"
          % (total, unknown, unknown * 100 / max(total, 1)), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3])
