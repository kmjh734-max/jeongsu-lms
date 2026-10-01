# -*- coding: utf-8 -*-
"""중학영문법 3800제의 차례를 읽어 (단원, PRACTICE 번호, 이름, 쪽) 를 모은다.

차례 쪽에 이렇게 적혀 있다 (글자 모양표로 되살린 글이다).
    CHAPTER 1 문장의 기초
      PRACTICE 1-1  명사의 종류        5
      PRACTICE 1-2  셀 수 있는 명사와 be동사   6

본문 쪽에도 「PRACTICE 1 4」 머리글이 있어 단원 번호가 문항마다 붙지만, 이름은
차례가 더 깨끗하다. 이름이 있어야 「문장의 기초」처럼 여러 갈래가 섞인 단원을
가를 수 있다.

  python scripts/grammar-bank/mb_toc.py 모양표.json "…3800제.pdf" out.json
"""
import io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from mb_glyphs import glyphs_of, rows_of
from mb_read import line_text

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
# 「PPSS 1 -1 명사의 종류 5」 — PRACTICE 가 글자 모양표에서 PPSS 로 읽히기도 한다
ITEM = re.compile(r"P\s*[PRACTISE]{1,8}\s*(\d{1,2})\s*[-–]\s*(\d{1,2})\s*(.*?)\s*([\d ]{1,6})$")
CHAPTER = re.compile(r"CHAPTER\s*(\d{1,2})\s*([^A-Z]{1,24})")


def tidy(text):
    return re.sub(r"\s+", " ", text).strip()


def main(table_path, pdf, dst, upto=12):
    table = json.loads(Path(table_path).read_text(encoding="utf-8"))["table"]
    doc = fitz.open(pdf)
    chapters, items = {}, []
    for pno in range(min(int(upto), len(doc))):
        rows = rows_of(glyphs_of(doc[pno]), least=2)
        rows.sort(key=lambda r: (min(g["y"] for g in r), min(g["x"] for g in r)))
        for row in rows:
            text = tidy(line_text(row, table))
            for m in CHAPTER.finditer(text):
                chapters.setdefault(int(m.group(1)), tidy(m.group(2)))
            got = ITEM.match(text)
            if got:
                page = re.sub(r"\s+", "", got.group(4))
                items.append({"chapter_no": int(got.group(1)), "no": int(got.group(2)),
                              "title": tidy(got.group(3)),
                              "page": int(page) if page.isdigit() else None})
    Path(dst).write_text(json.dumps({"chapters": chapters, "items": items},
                                    ensure_ascii=False, indent=1), encoding="utf-8")
    print("차례에서 단원 %d개 · PRACTICE %d개를 읽었다: %s"
          % (len(chapters), len(items), dst), file=LOG)
    for no in sorted(chapters)[:4]:
        print("   CHAPTER %d %s" % (no, chapters[no]), file=LOG)
    for it in items[:6]:
        print("   PRACTICE %s-%s %s (p%s)"
              % (it["chapter_no"], it["no"], it["title"][:28], it["page"]), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(*sys.argv[1:5])
