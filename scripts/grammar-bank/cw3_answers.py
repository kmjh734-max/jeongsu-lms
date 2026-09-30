# -*- coding: utf-8 -*-
"""천일문 3권 정답지를 글자로 읽어 답 상자 꼴로 옮긴다.

1·2권 정답지는 글자가 선으로 그려져 있어 그림으로 읽어야 했지만, 3권은 글자층이
살아 있다. 그대로 읽으면 훨씬 정확하다.

  Unit  01  and/but/or가 이루는 구조      p.62   ← 워크북 쪽이 적힌 머리
  Ⓐ  1 ①   2 ②   3 ①   4 ②                    ← DIN-Bold 8.9pt 이 답이다
     1 너는 장미나 백합 중 …                     ← DIN-Bold 7.4pt 는 해석이다
  Ⓑ  1 stay  2 nor  3 but  4 swimming

1·2권과 같은 상자 꼴(answer_page·rect·head·pieces)로 내보내, 맞대는 쪽은
그대로 쓴다.

  python scripts/grammar-bank/cw3_answers.py "…3권_정답.pdf" out.json
"""
import io, json, re, sys
from pathlib import Path

import fitz

MARK_FONT = "VAGRoundedStd-Black"
ANS_FONT = "DIN-Bold"
ANS_SIZE = (8.4, 9.6)     # 해석(7.4pt)과 갈리는 크기
MID_X = 320
UNIT_NO = re.compile(r"^(\d{1,2})$")
PAGEREF = re.compile(r"[pP]\.?\s*(\d{1,3})")
ITEM = re.compile(r"^(\d{1,2})\s+(\S.*)$")


def rows_of(page):
    out = []
    for block in page.get_text("dict")["blocks"]:
        for ln in block.get("lines", []):
            spans = [q for q in ln["spans"] if q["text"].strip()]
            if not spans:
                continue
            text = "".join(q["text"] for q in spans).strip()
            if text:
                out.append({"x": ln["bbox"][0], "y": ln["bbox"][1],
                            "font": spans[0]["font"], "size": round(spans[0]["size"], 1),
                            "text": text})
    return out


def unit_heads(rows):
    """「Unit 01 … p.62」 머리들 — (y, 번호, 이름, 쪽)"""
    out = []
    for r in rows:
        if not r["font"].startswith("Intro") or not UNIT_NO.match(r["text"]):
            continue
        near = [q for q in rows if q is not r and abs(q["y"] - r["y"]) < 14]
        name = [q for q in near if q["font"].startswith("SDGyeokdong")]
        page = [q for q in near if PAGEREF.match(q["text"])]
        out.append({"y": r["y"], "x": r["x"],
                    "no": int(r["text"]),
                    "name": name[0]["text"].strip() if name else "",
                    "page": int(PAGEREF.match(page[0]["text"]).group(1)) if page else None})
    return out


def pieces_of(lines):
    """답 줄을 문항 하나씩으로 가른다. 한 줄에 여럿이 나란히 있기도 하다."""
    out = []
    for text in lines:
        for part in re.split(r"\t+|\s{2,}(?=\d{1,2}\s)", text):
            got = ITEM.match(part.strip())
            if got:
                out.append({"no": int(got.group(1)), "text": got.group(2).strip()})
    return out


def main(src, dst):
    doc = fitz.open(src)
    boxes = []
    for page_no, page in enumerate(doc, 1):
        rows = rows_of(page)
        for col in (0, 1):
            mine = [r for r in rows if (0 if r["x"] < MID_X else 1) == col]
            mine.sort(key=lambda r: r["y"])
            heads = unit_heads(mine)
            marks = [r for r in mine if r["font"].startswith(MARK_FONT)
                     and re.fullmatch(r"[A-F]", r["text"].strip())]
            if not marks:
                continue
            for i, mark in enumerate(marks):
                stop = marks[i + 1]["y"] if i + 1 < len(marks) else 1e9
                said = [r["text"] for r in mine
                        if mark["y"] - 2 <= r["y"] < stop
                        and r["font"].startswith(ANS_FONT)
                        and ANS_SIZE[0] <= r["size"] <= ANS_SIZE[1]]
                bits = pieces_of(said)
                if not bits:
                    continue
                # 이 묶음 바로 위의 Unit 머리 — 있으면 첫 묶음이다
                above = [h for h in heads if h["y"] < mark["y"]]
                head = mark["text"].strip()
                if above and mark["y"] - above[-1]["y"] < 40:
                    last = above[-1]
                    head = "Unit %02d %s p.%s %s" % (last["no"], last["name"],
                                                     last["page"], head)
                boxes.append({"answer_page": page_no,
                              "rect": [mark["x"], mark["y"], mark["x"] + 200, stop],
                              "head": head,
                              "pieces": bits})
    Path(dst).write_text(json.dumps(boxes, ensure_ascii=False, indent=1), encoding="utf-8")

    log = io.open(1, "w", encoding="utf-8", closefd=False)
    unit = sum(1 for b in boxes if "Unit" in b["head"])
    print("답 상자 %d개 저장 (Unit 머리가 붙은 것 %d개): %s" % (len(boxes), unit, dst), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
