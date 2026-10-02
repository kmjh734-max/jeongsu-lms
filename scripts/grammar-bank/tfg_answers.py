# -*- coding: utf-8 -*-
"""Time for Grammar(YBM) 정답및해설에서 답을 읽는다.

정답지 짜임
    U N I T 01   Personal Pronouns          p.11   ← Gotham-Bold + DINMittelschriftStd
      1 it   2 it   3 he   4 she   5 she            ← Whitney-Semibold 10
      6 he   7 we   8 they  9 she  10 they
      1 my   2 him  3 their                         ← 번호가 1로 돌아가면 새 묶음
    해설 …                                           ← SDGothicNeo…, 답이 아니다

묶음에 글자(A·B·C)가 없으므로, **번호가 1로 돌아가는 자리**를 묶음의 경계로 본다.
본책도 지시문마다 번호가 1부터 다시 시작하므로 차례가 그대로 맞물린다.

  python scripts/grammar-bank/tfg_answers.py "…정답.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
ANS_FONT = "Whitney-Semibold"
PAGEREF = re.compile(r"\bp\.\s*(\d{1,3})\b")
UNIT = re.compile(r"^U\s*N\s*I\s*T\s*(\d{1,2})", re.I)
ROW = 6.0
COL = 300.0
PIECE = re.compile(r"(?:^|\s)(\d{1,2})\s+(?=\S)")


def rows_of(page):
    """같은 높이의 조각을 왼쪽부터 한 줄로 묶는다 — 답이 한 줄에 다섯 개씩 놓인다"""
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
            text = re.sub(r"[ \t]+", " ", re.sub(r"[\x00-\x08\x0b-\x1f]", "", "".join(made))).strip()
            if text:
                raw.append({"x": ln["bbox"][0], "y": ln["bbox"][1],
                            "font": spans[0]["font"], "size": round(spans[0]["size"], 1),
                            "text": text})
    raw.sort(key=lambda r: (0 if r["x"] < COL else 1, r["y"], r["x"]))
    out = []
    for r in raw:
        if (out and abs(out[-1]["y"] - r["y"]) < ROW
                and (out[-1]["x"] < COL) == (r["x"] < COL) and r["x"] > out[-1]["x"]
                and out[-1]["font"].startswith(ANS_FONT) == r["font"].startswith(ANS_FONT)):
            out[-1]["text"] += "   " + r["text"]
        else:
            out.append(dict(r))
    return out


def main(src, dst):
    doc = fitz.open(src)
    out = []
    page_ref = [None]
    block = [0]
    said = []          # (번호, 답)
    last_piece = [None]

    def close():
        if said and page_ref[0]:
            out.append({"page": page_ref[0], "section": "연습", "block": block[0],
                        "pieces": [{"no": n, "text": t} for n, t in said]})
        said.clear()
        last_piece[0] = None

    for page_no, page in enumerate(doc, 1):
        for r in rows_of(page):
            t = r["text"]
            ref = PAGEREF.search(t)
            if ref and not r["font"].startswith(ANS_FONT):
                close()
                block[0] = 0
                page_ref[0] = int(ref.group(1))
                continue
            if not r["font"].startswith(ANS_FONT):
                continue
            # 「1 it   2 it   3 he」 를 번호마다 가른다
            hits = list(PIECE.finditer(" " + t))
            if not hits:
                # Long written answers wrap onto a second PDF text line. Those
                # continuation lines do not repeat the item number, so retain
                # them when they sit directly below the preceding answer.
                prev = last_piece[0]
                if (prev and prev["page"] == page_no
                        and prev["col"] == (0 if r["x"] < COL else 1)
                        and 0 < r["y"] - prev["y"] < 22
                        and r["x"] >= prev["x"] - 3):
                    no, old = said[-1]
                    said[-1] = (no, (old + " " + t).strip())
                    prev["y"] = r["y"]
                continue
            for i, m in enumerate(hits):
                no = int(m.group(1))
                end = hits[i + 1].start() if i + 1 < len(hits) else len(t) + 1
                text = (" " + t)[m.end():end].strip()
                if not text:
                    continue
                if no == 1 and said:
                    close()
                    block[0] += 1
                said.append((no, text))
                last_piece[0] = {"page": page_no,
                                 "col": 0 if r["x"] < COL else 1,
                                 "x": r["x"], "y": r["y"]}
    close()

    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("정답 묶음 %d개 저장 (답 %d개): %s"
          % (len(out), sum(len(b["pieces"]) for b in out), dst), file=LOG)
    for b in out[:5]:
        print("   p%s 묶음%s — %s"
              % (b["page"], b["block"], [(p["no"], p["text"][:14]) for p in b["pieces"]][:5]), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
