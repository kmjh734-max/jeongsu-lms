# -*- coding: utf-8 -*-
"""문마중 정답지에서 답과 해설을 읽는다.

정답지 짜임 (글자층이 살아 있어 그대로 읽힌다)
    POINT 01   지시대명사      p.56
    A  1 this  2 that  3 these  4 Those  5 That
       6 this
    B  1 These  2 that  3 this  4 those
    C  1 these  2 That  3 this  4 those  5 This

해설은 그 아래 작은 글씨로 따로 붙는다(「6 hour는 셀 수 있는 명사이며 …」).

  python scripts/grammar-bank/mj_answers.py "…정답 및 해설.pdf" out.json
"""
import io, json, re, sys
from pathlib import Path

import fitz

POINT_FONT = "New-Value"
MARK_FONT = "JalnanOTF"
WHY_FONT = "YDVYGO"
PAGEREF = re.compile(r"[pP]\.?\s*(\d{1,3})")
POINT_NO = re.compile(r"POINT\s*(\d{1,2})", re.I)
MID_X = 290


def rows_of(page):
    out = []
    for block in page.get_text("dict")["blocks"]:
        for ln in block.get("lines", []):
            spans = [q for q in ln["spans"] if q["text"].strip()]
            if not spans:
                continue
            # 조각 사이가 떨어져 있으면 띄어쓰기다 — 붙여 두면 「puppy2 cold」가 된다
            made, last = [], None
            for q in spans:
                if last is not None and q["bbox"][0] - last > 1.0 and made and not made[-1].endswith(" "):
                    made.append(" ")
                made.append(q["text"])
                last = q["bbox"][2]
            text = re.sub(r"\s+", " ", "".join(made)).strip()
            if text:
                out.append({"x": ln["bbox"][0], "y": ln["bbox"][1],
                            "font": spans[0]["font"], "size": round(spans[0]["size"], 1),
                            "text": text})
    out.sort(key=lambda r: (0 if r["x"] < MID_X else 1, r["y"]))
    return out


def split_items(text):
    """「1 this 2 that 3 these」 를 문항마다 가른다.

    번호는 1부터 하나씩 는다. 답 안에도 숫자가 있을 수 있으므로, 다음에 와야 할
    번호일 때만 새 문항으로 본다.
    """
    out, want, now = [], 1, None
    for piece in text.split(" "):
        if piece == str(want):
            if now is not None:
                out.append({"no": want - 1, "text": " ".join(now).strip(" ,")})
            now, want = [], want + 1
            continue
        if now is not None:
            now.append(piece)
    if now is not None:
        out.append({"no": want - 1, "text": " ".join(now).strip(" ,")})
    return [c for c in out if c["text"]]


def main(src, dst):
    doc = fitz.open(src)
    out = []
    for page_no, page in enumerate(doc, 1):
        rows = rows_of(page)
        now = None          # 지금 보고 있는 POINT
        block = None        # 지금 보고 있는 묶음
        said = []
        for r in rows:
            text = r["text"]
            got = POINT_NO.search(text)
            if r["font"].startswith(POINT_FONT) and got:
                # 앞 묶음을 닫는다
                if now is not None and block is not None and said:
                    out.append({**now, "block": block, "pieces": split_items(" ".join(said))})
                said, block = [], None
                now = {"answer_page": page_no, "point_no": int(got.group(1)), "book_page": None}
                continue
            if now is not None and now["book_page"] is None and PAGEREF.fullmatch(text):
                now["book_page"] = int(PAGEREF.fullmatch(text).group(1))
                continue
            head = re.match(r"^([A-F])\s*(.*)$", text)
            if r["font"].startswith(MARK_FONT) and head and now is not None:
                if block is not None and said:
                    out.append({**now, "block": block, "pieces": split_items(" ".join(said))})
                block = ord(head.group(1)) - ord("A")
                said = [head.group(2)] if head.group(2) else []
                continue
            # 해설·설명은 번호 목록이 아니므로 묶음에 담지 않는다
            if block is not None and not r["font"].startswith(WHY_FONT):
                said.append(text)
        if now is not None and block is not None and said:
            out.append({**now, "block": block, "pieces": split_items(" ".join(said))})

    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    print("정답 묶음 %d개 저장 (답 %d개): %s"
          % (len(out), sum(len(b["pieces"]) for b in out), dst), file=log)
    for b in out[:4]:
        print("   POINT %s p.%s %s — %s" % (b["point_no"], b["book_page"], "ABC"[b["block"]],
                                            [(p["no"], p["text"][:16]) for p in b["pieces"]][:5]), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
