# -*- coding: utf-8 -*-
"""문법을 마중하다(문마중) 본책에서 문항을 뽑는다.

쪽 짜임
    POINT 01  지시대명사                     ← New-Value 9.5 + JalnanOTF 21 + JalnanGothic
    (설명·표)
    Ⓐ 다음 (  ) 안에서 알맞은 말을 고르시오.      ← JalnanOTF 22.8 + SDGyeokdong 9.9
      1  What's (this / that) right here?   ← ITCAvantGarde 10.8
    Ⓑ 다음 우리말과 같은 뜻이 되도록 …
      1  이것들은 여성들을 위한 재킷이다.          ← 우리말은 YDVYGO530
         ______ are jackets for women.
    56  Chapter 05                          ← 꼬리말(인쇄 쪽 + 단원)

정답지도 「POINT 01 지시대명사 p.56 / A 1 this 2 that …」 꼴이라 (POINT, 묶음,
번호)로 그대로 맞물린다. 글자층이 살아 있어 그림으로 읽을 일이 없다.

  python scripts/grammar-bank/mj_extract.py "…본책.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from gq_extract import BLANK, blank_rules, put_blanks

NUM_FONT = "ITCAvantGardeStd-Demi"
MARK_FONT = "JalnanOTF"
ASK_FONT = "SDGyeokdongGL2"
KO_FONT = "YDVYGO"
FOOT_FONT = "Gotham"
CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"
POINT_NO = re.compile(r"^(\d{1,2})$")


def lines_of(page):
    lines = []
    for block in page.get_text("dict")["blocks"]:
        for ln in block.get("lines", []):
            spans = [{"x": q["bbox"][0], "x1": q["bbox"][2], "t": q["text"]}
                     for q in ln["spans"] if q["text"].strip()]
            if not spans:
                continue
            sp = ln["spans"][0]
            lines.append({"x": ln["bbox"][0], "y": ln["bbox"][1], "bottom": ln["bbox"][3],
                          "font": sp["font"], "size": round(sp["size"], 1),
                          "spans": spans, "blanks": []})
    put_blanks([ln for ln in lines if not ln["font"].startswith(MARK_FONT)], blank_rules(page))
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
        ln["text"] = re.sub(r"\s+", " ", "".join(made)).strip()
    return lines


def page_head(rows, height):
    """이 쪽의 POINT 번호·이름, 인쇄 쪽, 단원"""
    point_no = point = printed = chapter = None
    for r in rows:
        flat = r["text"]
        if r["font"].startswith(MARK_FONT) and r["size"] > 18 and POINT_NO.match(flat) and r["y"] < 90:
            point_no = int(flat)
        if r["font"].startswith("JalnanGothic") and r["size"] > 13 and r["y"] < 90:
            point = flat
        if r["font"].startswith(FOOT_FONT) and r["y"] > height - 45 and re.fullmatch(r"\d{1,3}", flat):
            printed = int(flat)
        if r["y"] > height - 45 and flat.startswith("Chapter"):
            got = re.match(r"Chapter\s*(\d{1,2})", flat)
            chapter = int(got.group(1)) if got else None
    return point_no, point, printed, chapter


# 단원 이름은 단원 첫 쪽에만 큰 글씨로 한 번 나온다 — 미리 모아 두고 번호로 찾는다
def chapter_names(doc):
    out = {}
    no = None
    for page in doc:
        for block in page.get_text("dict")["blocks"]:
            for ln in block.get("lines", []):
                sp = ln["spans"][0]
                text = "".join(q["text"] for q in ln["spans"]).strip()
                if sp["font"].startswith("JalnanOTF") and sp["size"] > 60 and re.fullmatch(r"\d{1,2}", text):
                    no = int(text)
                if (sp["font"].startswith("OTOmniGothicH") and sp["size"] > 20
                        and re.search(r"[가-힣]", text) and no):
                    out.setdefault(no, text)
    return out


def marks(rows):
    """묶음 표시 Ⓐ·Ⓑ·Ⓒ — 왼쪽 끝의 큰 글자"""
    out = [r for r in rows
           if r["font"].startswith(MARK_FONT) and 18 < r["size"] < 28 and r["x"] < 90
           and re.fullmatch(r"[A-F]", r["text"])]
    out.sort(key=lambda r: r["y"])
    return out


def parse_page(page, page_no, carry):
    rows = lines_of(page)
    point_no, point, printed, chapter = page_head(rows, page.rect.height)
    if point_no:
        carry["point_no"], carry["point"] = point_no, point or carry.get("point")
    if printed:
        carry["printed"] = printed
    if chapter:
        carry["chapter"] = chapter

    body = [r for r in rows if 60 < r["y"] < page.rect.height - 40]
    marker = marks(body)
    if not marker:
        return []
    edges = [m["y"] - 12 for m in marker]
    bounds = [(edges[i], edges[i + 1] if i + 1 < len(edges) else page.rect.height,
               ord(marker[i]["text"]) - ord("A"), marker[i]) for i in range(len(marker))]
    out = []
    for top, bottom, block, mark in bounds:
        mine = [r for r in body if top <= r["y"] < bottom and r is not mark]
        out += parse_block(mine, block, mark, page_no, carry)
    return out


def parse_block(body, block, mark, page_no, carry):
    heads = []
    for r in body:
        if not r["font"].startswith(NUM_FONT):
            continue
        m = re.match(r"^(\d{1,2})\s*(.*)$", r["text"])
        if m and not m.group(2)[:1].isdigit():
            heads.append({"no": int(m.group(1)), "x": r["x"], "y": r["y"],
                          "lead": (m.group(2) or "").strip()})
    if not heads:
        return []

    # 지시문은 묶음 머리에 한 번 적혀 있다
    lead_in = ""
    top = min(h["y"] for h in heads)
    said = [r for r in body if r["font"].startswith(ASK_FONT) and r["y"] < top]
    if said:
        lead_in = max(said, key=lambda r: r["y"])["text"]

    for h in heads:
        h["prompt"], h["body"], h["choices"] = [], ([h["lead"]] if h["lead"] else []), []
    order = sorted(heads, key=lambda h: h["y"])

    def owner(r):
        best = None
        for h in order:
            if r["y"] >= h["y"] - 4:
                best = h
        return best

    for r in body:
        if r["font"].startswith(NUM_FONT) or r is mark:
            continue
        text = r["text"]
        if not text or (said and r in said):
            continue
        h = owner(r)
        if h is None:
            continue
        if r["font"].startswith(KO_FONT) and re.search(r"[가-힣]", text):
            h["prompt"].append(text)
        elif text[:1] in CIRCLED:
            h["choices"].append(text)
        else:
            h["body"].append(text)

    out = []
    for h in sorted(heads, key=lambda h: h["no"]):
        body_text = [b for b in h["body"] if b.strip()]
        choices = [{"no": CIRCLED.index(c[0]) + 1, "text": c[1:].strip()} for c in h["choices"]]
        if not body_text and not choices:
            continue
        prompt = " ".join(([lead_in] if lead_in else []) + h["prompt"]).strip()
        out.append({
            "page": page_no,
            "printed_page": carry.get("printed"),
            "chapter": carry.get("chapter"),
            "point_no": carry.get("point_no"),
            "point": carry.get("point"),
            "block": block,
            "no": h["no"],
            "prompt": prompt,
            "body": body_text,
            "choices": choices,
            "bank": [],
            "question_kind": "객관식" if choices else "단답·서술",
        })
    return out


def main(src, dst):
    doc = fitz.open(src)
    names = chapter_names(doc)
    carry = {"point_no": None, "point": None, "printed": None, "chapter": None}
    out = []
    for i, page in enumerate(doc):
        for row in parse_page(page, i + 1, carry):
            row["book"] = Path(src).stem
            row["chapter_no"] = row["chapter"]
            row["chapter"] = names.get(row["chapter"])
            out.append(row)
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")

    log = io.open(1, "w", encoding="utf-8", closefd=False)
    pts = collections.Counter((r["chapter"], r["point_no"], r["point"]) for r in out)
    print("문마중 문항 %d개 저장: %s" % (len(out), dst), file=log)
    print("POINT %d가지 · 인쇄 쪽 %d가지"
          % (len(pts), len({r["printed_page"] for r in out if r["printed_page"]})), file=log)
    for k, n in list(pts.items())[:6]:
        print("   %s · %s. %s — %d문항" % (k[0], k[1], k[2], n), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
