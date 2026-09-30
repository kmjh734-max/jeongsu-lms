# -*- coding: utf-8 -*-
"""천일문 중등 GRAMMAR 워크북에서 문항을 뽑는다.

워크북 쪽 짜임
    Chapter 09  문장의 여러 형식        ← DIN-Medium 9pt (쪽 머리)
    Unit  03  SVOC                   ← MapoDPP + Intro 34pt + SDGyeokdong 20pt
    Ⓐ 다음 중 어법상 알맞은 것을 고르세요.  POINT 5·6   ← VAGRounded 18pt + YDVYGO 9.4pt
    1  We found Jieun [smart / smartly].          ← DIN-Bold 번호 + Myriad 본문
    …
    72  천일문 GRAMMAR LEVEL 1 WORKBOOK           ← 꼬리말에 인쇄 쪽

잘 풀리는 워크북과 짜임이 같다 — 묶음이 Ⓐ·Ⓑ·Ⓒ·Ⓓ 로 갈리고, 정답지 상자도
묶음마다 하나씩이다. 그래서 (인쇄 쪽, 묶음 글자)로 맞대면 된다.

Unit 이름이 그대로 세부 단원이 되고, 지시문 끝의 POINT 번호는 더 잔 갈래다.

  python scripts/grammar-bank/cw_wb_extract.py "…_워크북.pdf" out.json
"""
import io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from gq_extract import BLANK, blank_rules, put_blanks

# 번호 글꼴 이름이 권마다 조금 다르다 — 1·3권은 DIN-Bold, 2권은 DINBold
NUM_FONT = "DINBold"


def is_num(font):
    return str(font).replace("-", "").startswith(NUM_FONT)
MARK_FONT = "VAGRoundedStd-Black"
PAGE_FONT = "FuturaStd-Medium"
CHAPTER = re.compile(r"Chapter\s*(\d{1,2})\s*(.*)", re.I)
POINT = re.compile(r"POINT\s*([\d·,\s]+)", re.I)
CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"


def lines_of(page):
    """글줄을 걷는다. 빈칸 자리에는 밑줄을 되살려 넣는다."""
    lines = []
    for block in page.get_text("dict")["blocks"]:
        for ln in block.get("lines", []):
            spans = [{"x": q["bbox"][0], "x1": q["bbox"][2], "t": q["text"]}
                     for q in ln["spans"] if q["text"].strip()]
            if not spans:
                continue
            sp = ln["spans"][0]
            lines.append({
                "x": ln["bbox"][0], "y": ln["bbox"][1], "bottom": ln["bbox"][3],
                "font": sp["font"], "size": round(sp["size"], 1),
                "spans": spans, "blanks": [],
            })
    put_blanks([ln for ln in lines if not is_num(ln["font"])], blank_rules(page))
    for ln in lines:
        parts = [{"x": q["x"], "t": q["t"]} for q in ln["spans"]]
        parts += [{"x": x, "t": BLANK} for x in ln["blanks"]]
        parts.sort(key=lambda q: q["x"])
        ln["text"] = "".join(q["t"] for q in parts).rstrip()
    return lines


def page_head(rows, height):
    """이 쪽의 단원·Unit·인쇄 쪽

    Unit 은 「Unit」「03」「SVOC」 세 조각이 한 줄에 흩어져 있다. 글꼴이 달라
    한 줄로 묶이지 않으므로 y 가 가까운 것끼리 모아 읽는다.
    """
    chapter_no = chapter = unit_no = unit = printed = None
    for r in rows:
        flat = re.sub(r"\s+", " ", r["text"]).strip()
        got = CHAPTER.match(flat)
        if got and r["y"] < 60:
            chapter_no = int(got.group(1))
            chapter = got.group(2).strip() or chapter
        if r["font"].startswith(PAGE_FONT) and r["y"] > height - 45:
            if re.fullmatch(r"\d{1,3}", flat):
                printed = int(flat)
        if r["font"].startswith("Intro") and re.fullmatch(r"\d{1,2}", flat):
            unit_no = int(flat)
            beside = [q for q in rows
                      if q is not r and abs(q["y"] - r["y"]) < 22 and q["x"] > r["x"]
                      and q["size"] >= 14]
            if beside:
                unit = re.sub(r"\s+", " ", min(beside, key=lambda q: q["x"])["text"]).strip()
    return chapter_no, chapter, unit_no, unit, printed


def marks(rows):
    """쪽을 가르는 묶음 표시(Ⓐ·Ⓑ·Ⓒ·Ⓓ)"""
    out = []
    for r in rows:
        # 왼쪽 쪽은 x=83, 오른쪽 쪽은 x=112 에 놓인다 (한 Unit 이 두 쪽에 걸친다)
        if r["font"].startswith(MARK_FONT) and r["size"] > 14 and r["x"] < 130:
            if re.fullmatch(r"[A-F]", r["text"].strip()):
                out.append(r)
    out.sort(key=lambda r: r["y"])
    return out


def parse_page(page, page_no, carry):
    rows = lines_of(page)
    ch_no, ch, unit_no, unit, printed = page_head(rows, page.rect.height)
    if ch_no:
        carry["chapter_no"], carry["chapter"] = ch_no, ch or carry["chapter"]
    if unit_no:
        carry["unit_no"], carry["unit"] = unit_no, unit
    if printed:
        carry["printed"] = printed

    # 쪽 아래의 어휘 풀이(6.9pt)는 문항 글이 아니다 — 크기로 걸러 낸다
    body = [r for r in rows if 90 < r["y"] < page.rect.height - 45 and r["size"] >= 8]
    marker = marks(body)
    if not marker:
        return []
    # 묶음 번호는 쪽 안의 차례가 아니라 글자 그대로다. 한 Unit 이 좌·우 두 쪽에
    # 걸쳐 Ⓐ·Ⓑ / Ⓒ·Ⓓ 로 나뉘므로, 쪽마다 0부터 세면 Ⓒ 가 Ⓐ 자리에 앉는다.
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
        if not is_num(r["font"]):
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

    def owner(r):
        col = 0 if r["x"] < mid else 1
        best = None
        for h in heads:
            if h["col"] == col and r["y"] >= h["y"] - 12:
                best = h
        return best

    # 지시문은 묶음 표시와 같은 줄에 한 번 적혀 있다. 끝의 POINT 번호는 더 잔
    # 갈래라 따로 떼어 둔다.
    lead_in, point = "", None
    if mark is not None:
        beside = [r for r in body if abs(r["y"] - mark["y"]) < 16 and r["x"] > mark["x"] + 10
                  and re.search(r"[가-힣]", r["text"])]
        if beside:
            lead_in = re.sub(r"\s+", " ", beside[0]["text"]).strip()
            body = [r for r in body if r is not beside[0]]
            got = POINT.search(lead_in)
            if got:
                point = re.sub(r"\s+", "", got.group(1)).strip("·,")
                lead_in = POINT.sub("", lead_in).strip()

    # <보기> 낱말 상자 — 번호 없이 한 줄에 늘어서 있다. 묶음이 함께 갖는다.
    bank, drop = [], []
    top = min(h["y"] for h in heads)
    for r in body:
        if r["y"] < top and r["y"] > (mark["y"] if mark else 0) + 6 and r["size"] > 9:
            if re.fullmatch(r"[A-Za-z' ’\-]{2,80}", r["text"].strip()):
                bank += re.findall(r"[A-Za-z][A-Za-z'’\-]*", r["text"])
                drop.append(r)
    if drop:
        body = [r for r in body if r not in drop]

    for h in heads:
        h["prompt"], h["body"], h["choices"] = [], [], []
        if h["lead"]:
            h["body"].append(h["lead"])
    for r in body:
        if is_num(r["font"]):
            continue
        text = r["text"].strip()
        if not text or CHAPTER.match(text):
            continue
        h = owner(r)
        if h is None:
            continue
        if 8.5 <= r["size"] <= 10.6 and re.search(r"[가-힣]", text) and not h["body"]:
            h["prompt"].append(text)
        elif text[0] in CIRCLED:
            h["choices"].append(text)
        else:
            h["body"].append(text)

    out = []
    for h in sorted(heads, key=lambda h: h["no"]):
        body_text = [re.sub(r"\s+", " ", b).strip() for b in h["body"] if b.strip()]
        choices = [{"no": CIRCLED.index(c[0]) + 1, "text": c[1:].strip()} for c in h["choices"]]
        if not body_text and not choices:
            continue
        prompt = list(h["prompt"])
        if lead_in:
            prompt.insert(0, lead_in)
        out.append({
            "page": page_no,
            "printed_page": carry.get("printed"),
            "chapter_no": carry.get("chapter_no"),
            "chapter": carry.get("chapter"),
            "unit_no": carry.get("unit_no"),
            "unit": carry.get("unit"),
            "point": point,
            "block": block,
            "no": h["no"],
            "prompt": re.sub(r"\s+", " ", " ".join(prompt)).strip(),
            "body": body_text,
            "choices": choices,
            "bank": bank,
            "question_kind": "객관식" if choices else "단답·서술",
        })
    return out


def main(src, dst):
    doc = fitz.open(src)
    carry = {"chapter_no": None, "chapter": None, "unit_no": None, "unit": None,
             "printed": None}
    out = []
    for i, page in enumerate(doc):
        for row in parse_page(page, i + 1, carry):
            row["book"] = Path(src).stem
            out.append(row)
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")

    log = io.open(1, "w", encoding="utf-8", closefd=False)
    print("워크북 문항 %d개 저장: %s" % (len(out), dst), file=log)
    import collections

    units = collections.Counter((r["chapter"], r["unit_no"], r["unit"]) for r in out)
    print("Unit %d가지 · 인쇄 쪽 %d가지"
          % (len(units), len({r["printed_page"] for r in out if r["printed_page"]})), file=log)
    for key, n in list(units.items())[:8]:
        print("   %s · %s. %s — %d문항" % (key[0], key[1], key[2], n), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
