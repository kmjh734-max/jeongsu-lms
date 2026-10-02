# -*- coding: utf-8 -*-
"""Time for Grammar(YBM) 정답및해설 뒤쪽의 「WORKBOOK」 답을 읽는다.

정답지 짜임
    Past Tense of General Verbs        pp.10~11   ← Gotham-Book 9.7 + DIN 8.1
      1 set     2 saw     3 cut                   ← Whitney-Semibold 10, 세 개씩
      4 stayed  5 played  6 planned
      1 fixed   2 kicked  3 had                   ← 번호가 1로 돌아가면 새 묶음

워크북에는 쪽 번호가 없지만, 정답지가 **단원 이름**으로 가리키므로 이름과
묶음 차례로 자리가 정해진다. 본책 답과 섞이지 않도록 「pp.N~N」이 붙은 머리글
아래만 읽는다 — 본책 쪽은 「UNIT 01 … p.11」로 적는다.

  python scripts/grammar-bank/tfgwb_answers.py "…정답및해설.pdf" out.json
"""
import io, json, re, sys
from pathlib import Path

import fitz

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
NAME_FONT = "Gotham-Book"
PAGES_FONT = "DINMittelschrift"
ANS_FONT = ("Whitney-Semibold", "MyriadPro-Regular")
ROW = 5.0
PIECE = re.compile(r"(?:^|\s)(\d{1,2})\s+(?=\S)")
PAGES = re.compile(r"^pp?\.\s*(\d{1,3})\s*[~–-]\s*(\d{1,3})$")


def rows_of(page):
    raw = []
    for block in page.get_text("dict")["blocks"]:
        for ln in block.get("lines", []):
            spans = [q for q in ln["spans"] if q["text"].strip()]
            if not spans:
                continue
            made, last = [], None
            for q in spans:
                if last is not None and q["bbox"][0] - last > 1.0 and made and not made[-1].endswith(" "):
                    made.append(" ")
                made.append(q["text"])
                last = q["bbox"][2]
            text = re.sub(r"[ \t]+", " ",
                          re.sub(r"[\x00-\x08\x0b-\x1f]", " ", "".join(made))).strip()
            if text:
                raw.append({"x": ln["bbox"][0], "y": ln["bbox"][1],
                            "font": spans[0]["font"], "size": round(spans[0]["size"], 1),
                            "text": text})
    # 쪽이 두 칸이다. 높이만으로 세우면 오른쪽 칸이 왼쪽 칸 사이에 끼어들어
    # 묶음이 뒤섞인다. 왼쪽 칸을 다 읽고 오른쪽 칸으로 넘어간다.
    cut = page.rect.width / 2
    for r in raw:
        r["col"] = 0 if r["x"] < cut else 1
    raw.sort(key=lambda r: (r["col"], r["y"], r["x"]))
    # 한 줄에 세 개씩 놓인 답을 한 줄로 묶는다
    out = []
    for r in raw:
        # 답끼리만 묶는다. 머리글까지 묶으면 「이름 pp.10~11」이 한 줄이 되어
        # 쪽 가리킴을 못 찾는다.
        if (out and out[-1]["col"] == r["col"] and abs(out[-1]["y"] - r["y"]) < ROW
                and r["x"] > out[-1]["x"]
                and out[-1]["font"].startswith(ANS_FONT) and r["font"].startswith(ANS_FONT)):
            out[-1]["text"] += "   " + r["text"]
        else:
            out.append(dict(r))
    return out


def headers_of(rows, page):
    """쪽에 적힌 머리글 — (단원 이름, 쪽 범위, 칸, 높이).

    「pp.10~11」이 이름보다 **위에** 놓인 쪽이 있어, 읽는 차례대로 짝지으면
    이름과 쪽이 어긋난다. 그러니 같은 칸·비슷한 높이끼리 짝지어 둔다.
    """
    marks = [r for r in rows if r["font"].startswith(PAGES_FONT) and PAGES.match(r["text"])]
    out = []
    for m in marks:
        got = PAGES.match(m["text"])
        said = [r for r in rows
                if r["col"] == m["col"] and abs(r["y"] - m["y"]) < 22
                and r["font"].startswith(NAME_FONT) and 8 < r["size"] < 12
                and re.search(r"[A-Za-z]", r["text"])]
        said.sort(key=lambda r: r["y"])
        if not said:
            continue
        for r in said:
            r["_head"] = True
        m["_head"] = True
        out.append({"unit": " ".join(r["text"] for r in said).strip(),
                    "pages": (int(got.group(1)), int(got.group(2))),
                    "col": m["col"], "y": min(r["y"] for r in said + [m])})
    out.sort(key=lambda h: (h["col"], h["y"]))
    return out


def main(src, dst):
    doc = fitz.open(src)
    out = []

    # 워크북 답은 정답지 뒤쪽의 「WORKBOOK」 쪽에만 있다. 본책 답에도 「pp.19~22」
    # 같은 쪽 가리킴이 있어, 그 쪽부터 읽지 않으면 본책 답이 섞여 들어온다.
    start = None
    for i, page in enumerate(doc):
        if re.search(r"WORKBOOK", page.get_text(), re.I):
            start = i
            break
    if start is None:
        print("! 「WORKBOOK」 쪽을 찾지 못했다", file=LOG)
        start = doc.page_count

    now = {"unit": None, "pages": None}
    said, block = [], [0]
    last_piece = [None]

    def close():
        if said and now["unit"]:
            out.append({"unit": now["unit"], "pages": now["pages"], "block": block[0],
                        "pieces": [{"no": n, "text": t} for n, t in said]})
        said.clear()
        last_piece[0] = None

    for page in list(doc)[start:]:
        rows = rows_of(page)
        heads = headers_of(rows, page)
        for r in rows:
            if r.get("_head"):
                # 머리글 자리다 — 이 자리에서 단원이 바뀐다
                for h in heads:
                    if h["col"] == r["col"] and abs(h["y"] - r["y"]) < 23:
                        if h["unit"] != now["unit"] or h["pages"] != now["pages"]:
                            close()
                            now = {"unit": h["unit"], "pages": h["pages"]}
                            block[0] = 0
                        break
                continue
            if now["unit"] is None or not r["font"].startswith(ANS_FONT):
                continue
            hits = list(PIECE.finditer(" " + r["text"]))
            if not hits:
                # A prose answer may wrap to following PDF text lines. The
                # continuation has no repeated item number, so retain it when
                # it is directly below the preceding answer in the same column.
                prev = last_piece[0]
                if (prev and prev["col"] == r["col"]
                        and 0 < r["y"] - prev["y"] < 22
                        and r["x"] >= prev["x"] - 3):
                    no, old = said[-1]
                    said[-1] = (no, (old + " " + r["text"]).strip())
                    prev["y"] = r["y"]
                continue
            for i, m in enumerate(hits):
                no = int(m.group(1))
                stop = hits[i + 1].start() if i + 1 < len(hits) else len(r["text"]) + 1
                text = (" " + r["text"])[m.end():stop].strip()
                if not text:
                    continue
                if no == 1 and said:
                    close()
                    block[0] += 1
                said.append((no, text))
                last_piece[0] = {"col": r["col"], "x": r["x"], "y": r["y"]}
    close()

    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("워크북 정답 묶음 %d개 저장 (답 %d개): %s"
          % (len(out), sum(len(b["pieces"]) for b in out), dst), file=LOG)
    print("   단원 %d가지" % len({b["unit"] for b in out}), file=LOG)
    for b in out[:3]:
        print("   %s 묶음%s pp%s — %s" % (b["unit"][:30], b["block"], b["pages"],
              [(p["no"], p["text"][:12]) for p in b["pieces"]][:5]), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
