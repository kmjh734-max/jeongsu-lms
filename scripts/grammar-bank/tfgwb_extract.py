# -*- coding: utf-8 -*-
"""Time for Grammar(YBM) 워크북에서 문항을 뽑는다.

쪽 짜임 — 본책과 같이 **지시문 한 줄**이 묶음의 머리다. 다른 점은 단원 이름이
쪽머리에 영어로 적혀 있다는 것이다.
    U N I T 02   Present and Past Tense of Be Verbs   ← SangSangTitleB 34
      괄호 안에서 알맞은 말을 고르시오.                 ← SDGothicNeoa-eMd 10
        1 You ( am / are / is ) very tall.           ← Whitney-Semibold 12

워크북에는 쪽 번호가 찍혀 있지 않다. 그런데 정답지가 「Past Tense of General
Verbs  pp.10~11」처럼 **단원 이름**으로 가리키므로 이름이 자리를 정해 준다.

  python scripts/grammar-bank/tfgwb_extract.py "…워크북.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
import tfg_extract as T

NAME_FONT = "SangSangTitle"      # 단원 이름
ASK_FONT = "SDGothicNeoa"        # 지시문
ITEM_FONT = "Whitney-Semibold"   # 문항 번호
# 쪽 꼬리말 — 「10 Chapter 02」 또는 「General Verbs 11」
FOOT = re.compile(r"^(?:\d{1,3}\s+)?Chapter\s*\d{1,2}$"
                  r"|^[A-Za-z][A-Za-z &',\-]{2,40}\s+\d{1,3}$")


def unit_of(rows):
    """쪽머리의 UNIT 이름 — 단원마다 첫 쪽에만 적혀 있다"""
    said = [r["text"] for r in rows
            if r["font"].startswith(NAME_FONT) and r["size"] > 20]
    return " ".join(said).strip() or None


def chapter_of(rows, page):
    """쪽 맨 위의 「Chapter 02  General Verbs」 — 쪽마다 적혀 있다"""
    top = [r for r in rows if r["y"] < 40 and r["font"].startswith("DINMittelschrift")]
    top.sort(key=lambda r: r["x"])
    no = name = None
    for r in top:
        # 「Chapter 01 Sentence Patterns」가 한 줄로 오는 쪽도 있고, 번호와 이름이
        # 다른 줄로 오는 쪽도 있다. 두 가지 다 받는다.
        got = re.match(r"Chapter\s*(\d{1,2})\s*(.*)$", r["text"].strip())
        if got:
            no = int(got.group(1))
            if got.group(2).strip():
                name = got.group(2).strip()
        elif no is not None and re.search(r"[A-Za-z]", r["text"]):
            name = (name + " " + r["text"].strip()) if name else r["text"].strip()
    return no, name


def cut_of(rows):
    """묶음이 두 칸으로 놓였으면 그 경계를 돌려준다.

    「1 set   2 see」처럼 한 줄에 두 문항이 놓이는 묶음이 있다. 한 칸으로 보면
    옆 문항의 낱말이 본문에 끌려 들어와, 학생이 무엇을 바꿔 쓸지 알 수 없다.
    """
    heads = T.heads_in(rows)
    for r in rows:
        r.pop("_head", None)
    xs = sorted({round(h["x"]) for h in heads})
    if not xs:
        return None
    far = [x for x in xs if x > xs[0] + 80]
    return (far[0] - 8) if far else None


def parse_page(page, page_no, carry):
    rows = T.lines_of(page)
    ch_no, ch_name = chapter_of(rows, page)
    if ch_no:
        carry["chapter_no"] = ch_no
    if ch_name:
        carry["chapter"] = ch_name
    got = unit_of(rows)
    if got:
        carry["unit"] = got
        carry["block"] = 0          # 단원이 바뀌면 묶음도 1번부터 센다
    if not carry.get("unit"):
        return []
    h = page.rect.height
    body = [r for r in rows if 40 < r["y"] < h - 30]
    asks = [r for r in body if r["font"].startswith(ASK_FONT) and 8 < r["size"] < 13
            and re.search(r"[가-힣]", r["text"]) and len(r["text"]) > 6]
    asks.sort(key=lambda r: r["y"])
    if not asks:
        return []
    out = []
    for i, a in enumerate(asks):
        top = a["y"] - 2
        bottom = asks[i + 1]["y"] - 2 if i + 1 < len(asks) else h
        mine = [r for r in body if top <= r["y"] < bottom and r is not a]
        cut = cut_of(mine)
        heads = T.heads_in(mine, cut)
        if not heads:
            continue
        made = T.pack(T.gather(mine, heads, cut), a["text"], page_no, carry["block"])
        for row in made:
            # 꼬리말(「10 Chapter 02」·「General Verbs 11」)이 본문 높이 안으로
            # 들어오는 쪽이 있다. 그대로 두면 문항에 쪽 번호가 적혀 나간다.
            row["body"] = [b for b in row["body"] if not FOOT.match(b.strip())]
            if not row["body"] and not row["choices"]:
                continue
            row["unit"] = carry["unit"]
            row["chapter_no"] = carry.get("chapter_no")
            row["chapter"] = carry.get("chapter")
        out += made
        carry["block"] += 1
    return out


def main(src, dst):
    T.ITEM_FONT = ITEM_FONT
    doc = fitz.open(src)
    carry, out = {}, []
    for page_no, page in enumerate(doc, 1):
        for row in parse_page(page, page_no, carry):
            row["book"] = Path(src).stem
            out.append(row)
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    print("워크북 문항 %d개 저장: %s" % (len(out), dst), file=log)
    print("   단원 %d가지 · 묶음 %d가지 · 발문 있는 것 %d개"
          % (len({r["unit"] for r in out}),
             len({(r["unit"], r["block"]) for r in out}),
             sum(1 for r in out if r["prompt"])), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
