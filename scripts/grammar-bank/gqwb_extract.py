# -*- coding: utf-8 -*-
"""그래머큐 워크북에서 문항을 뽑는다.

워크북 쪽 짜임
    대명사 01                               ← 쪽 머리(단원)
    Unit 01  인칭대명사와 be동사   정답 및 해설 p. 18
    Ⓐ  주어진 명사를 대신할 수 있는 …            ← FuturaStd-Bold 30pt + TTMGothicB
      1  Mike(남) ( ) strong.               ← DIN-Bold 번호 + Helvetica 본문
         His brother ( ) strong.
    2  Chapter 01  대명사                    ← 꼬리말(인쇄 쪽 + 단원)

한 문항이 여러 줄에 걸치기도 한다(위 1번은 세 줄). 정답지도 「1 He is, He is,
They are」처럼 한 덩이로 적어 두므로 그대로 둔다.

천일문·잘 풀리는 워크북과 짜임이 같아, 묶음 표시 Ⓐ~Ⓓ 로 쪽을 가른다.

  python scripts/grammar-bank/gqwb_extract.py "…_워크북.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from gq_extract import BLANK, blank_rules, put_blanks

NUM_FONT = "DIN-Bold"
MARK_FONT = "FuturaStd-Bold"
FOOT_FONT = "FuturaStd-Heavy"
UNIT_FONT = "FuturaStd-Bold"       # Unit 번호는 37pt, 묶음 표시는 30pt
TITLE_FONT = "SDGtNeocUni"
CHAPTER = re.compile(r"Chapter\s*(\d{1,2})\s*(.*)", re.I)
CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"


def lines_of(page):
    lines = []
    for block in page.get_text("dict")["blocks"]:
        for ln in block.get("lines", []):
            spans = [{"x": q["bbox"][0], "x1": q["bbox"][2], "t": q["text"]}
                     for q in ln["spans"] if q["text"].strip()]
            if not spans:
                continue
            sp = ln["spans"][0]
            lines.append({"x": ln["bbox"][0], "y": ln["bbox"][1],
                          "bottom": ln["bbox"][3],
                          "font": sp["font"], "size": round(sp["size"], 1),
                          "spans": spans, "blanks": []})
    put_blanks([ln for ln in lines if not ln["font"].startswith(NUM_FONT)], blank_rules(page))
    for ln in lines:
        parts = [{"x": q["x"], "x1": q["x1"], "t": q["t"]} for q in ln["spans"]]
        parts += [{"x": x, "x1": x, "t": BLANK} for x in ln["blanks"]]
        parts.sort(key=lambda q: q["x"])
        made, last = [], None
        for q in parts:
            if last is not None and q["x"] - last > 1.2 and made and not made[-1].endswith(" "):
                made.append(" ")
            made.append(q["t"])
            last = q["x1"]
        ln["text"] = "".join(made).rstrip()
    return lines


def page_head(rows, height):
    """이 쪽의 Unit 번호·이름, 인쇄 쪽, 단원 이름"""
    unit_no = unit = printed = chapter = None
    for r in rows:
        flat = re.sub(r"\s+", " ", r["text"]).strip()
        if r["font"].startswith(UNIT_FONT) and r["size"] > 30 and re.fullmatch(r"\d{1,2}", flat):
            unit_no = int(flat)
        if r["font"].startswith(TITLE_FONT) and r["size"] > 18:
            unit = flat
        if r["font"].startswith(FOOT_FONT) and r["y"] > height - 45:
            if re.fullmatch(r"\d{1,3}", flat):
                printed = int(flat)
        got = CHAPTER.match(flat)
        if got and r["y"] > height - 45:
            chapter = got.group(2).strip()
    return unit_no, unit, printed, chapter


def marks(rows):
    out = [r for r in rows
           if r["font"].startswith(MARK_FONT) and 24 < r["size"] < 34 and r["x"] < 100
           and re.fullmatch(r"[A-F]", r["text"].strip())]
    out.sort(key=lambda r: r["y"])
    return out


def parse_page(page, page_no, carry):
    rows = lines_of(page)
    unit_no, unit, printed, chapter = page_head(rows, page.rect.height)
    if unit_no:
        carry["unit_no"], carry["unit"] = unit_no, unit
    if printed:
        carry["printed"] = printed
    if chapter:
        carry["chapter"] = chapter

    body = [r for r in rows if 60 < r["y"] < page.rect.height - 45]
    marker = marks(body)
    if not marker:
        return []
    edges = [m["y"] - 10 for m in marker]
    bounds = [(edges[i], edges[i + 1] if i + 1 < len(edges) else page.rect.height,
               ord(marker[i]["text"].strip()) - ord("A"), marker[i])
              for i in range(len(marker))]
    out = []
    for top, bottom, block, mark in bounds:
        mine = [r for r in body if top <= r["y"] < bottom and r is not mark]
        out += parse_block(mine, block, mark, page, page_no, carry)
    return out


def parse_block(body, block, mark, page, page_no, carry):
    heads = []
    for r in body:
        if not r["font"].startswith(NUM_FONT):
            continue
        m = re.match(r"^(\d{1,2})\s*(.*)$", r["text"].strip())
        if m and not m.group(2)[:1].isdigit():
            heads.append({"no": int(m.group(1)), "x": r["x"], "y": r["y"],
                          "lead": (m.group(2) or "").strip()})
    if not heads:
        return []
    xs = [h["x"] for h in heads]
    mid = (min(xs) + max(xs)) / 2 if max(xs) - min(xs) > 100 else page.rect.width
    for h in heads:
        h["col"] = 0 if h["x"] < mid else 1

    seen = sorted(h["no"] for h in heads)
    if seen != list(range(1, len(heads) + 1)) and len(heads) == max(seen):
        for i, h in enumerate(sorted(heads, key=lambda h: (h["col"], h["y"])), start=1):
            h["no"] = i

    def owner(r):
        col = 0 if r["x"] < mid else 1
        best = None
        for h in heads:
            if h["col"] == col and r["y"] >= h["y"] - 12:
                best = h
        return best

    # 지시문은 묶음 표시 오른쪽에 있고 두 줄로 넘어가기도 한다
    lead_in, drop = [], []
    if mark is not None:
        for r in body:
            # 지시문은 묶음 표시와 나란히 있다. 첫 문항 위라는 것만으로는 앞 문항의
            # 우리말까지 딸려 온다 — 표시에서 멀리 떨어진 줄은 보지 않는다.
            if (r["font"].startswith("TTMGothic")
                    and r["y"] < min(h["y"] for h in heads)
                    and abs(r["y"] - mark["y"]) < 45):
                lead_in.append(re.sub(r"\s+", " ", r["text"]).strip())
                drop.append(r)
    # <보기> 줄은 묶음 전체가 함께 갖는다
    bank = []
    for r in body:
        if r["font"].startswith("YDVYGO") and "보기" in r["text"]:
            bank += re.findall(r"[A-Za-z][A-Za-z'’\-]*", r["text"])
            drop.append(r)
    if drop:
        body = [r for r in body if r not in drop]

    for h in heads:
        h["body"], h["choices"] = ([h["lead"]] if h["lead"] else []), []
    for r in body:
        if r["font"].startswith(NUM_FONT):
            continue
        text = r["text"].strip()
        if not text or CHAPTER.match(text):
            continue
        h = owner(r)
        if h is None:
            continue
        if text[0] in CIRCLED:
            h["choices"].append(text)
        else:
            h["body"].append(text)

    out = []
    for h in sorted(heads, key=lambda h: h["no"]):
        body_text = [re.sub(r"\s+", " ", b).strip() for b in h["body"] if b.strip()]
        choices = [{"no": CIRCLED.index(c[0]) + 1, "text": c[1:].strip()} for c in h["choices"]]
        if not body_text and not choices:
            continue
        out.append({
            "page": page_no,
            "printed_page": carry.get("printed"),
            "chapter": carry.get("chapter"),
            "unit_no": carry.get("unit_no"),
            "unit": carry.get("unit"),
            "block": block,
            "no": h["no"],
            "prompt": " ".join(lead_in).strip(),
            "body": body_text,
            "choices": choices,
            "bank": bank,
            "question_kind": "객관식" if choices else "단답·서술",
        })
    return out


def main(src, dst):
    doc = fitz.open(src)
    carry = {"unit_no": None, "unit": None, "printed": None, "chapter": None}
    out = []
    for i, page in enumerate(doc):
        for row in parse_page(page, i + 1, carry):
            row["book"] = Path(src).stem
            out.append(row)
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")

    log = io.open(1, "w", encoding="utf-8", closefd=False)
    units = collections.Counter((r["chapter"], r["unit_no"], r["unit"]) for r in out)
    print("워크북 문항 %d개 저장: %s" % (len(out), dst), file=log)
    print("Unit %d가지" % len(units), file=log)
    for k, n in list(units.items())[:6]:
        print("   %s · %s. %s — %d문항" % (k[0], k[1], k[2], n), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
