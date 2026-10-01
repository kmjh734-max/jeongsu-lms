# -*- coding: utf-8 -*-
"""Good Grammar 2nd Edition(YBM) 정답및해설에서 답을 읽는다.

정답지 짜임 (두 칸, 글자층이 살아 있다)
    Chapter 02  일반동사
      Unit 04  일반동사의 현재형            p. 25   ← DIN-Bold + 쪽 가리킴
        실력 다지기                                ← designhouseOTFBold 10.8
          A 1 send   2 take   3 opens   4 speak    ← MyriadPro-Bold/Semibold
            5 goes   6 clean  7 says
          B 1 plays  …
    해설 …                                          ← SDGothicNeo…, 답이 아니다

한 줄에 답이 여러 개 따로 놓여 있어, 같은 높이의 조각을 왼쪽부터 이어 붙인 뒤
번호로 가른다. 쪽 가리킴(p. 25)이 본책 인쇄 쪽이라 자리가 하나로 정해진다.

  python scripts/grammar-bank/gg_answers.py "…정답.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
TITLE_FONT = "designhouse"
ANS_FONT = "MyriadPro"
# 쪽 가리킴은 「Unit 04 일반동사의 현재형   p. 25」처럼 한 줄에 함께 있다
PAGEREF = re.compile(r"p\.\s*(\d{1,3})")
MARK = re.compile(r"^([A-F])\s+(.*)$")
COL = 290.0
ROW = 6.0

DRILL = "실력 다지기"
WRITE = "서술형 대비"
TEST = "실력 완성"
NAMES = {"실력 다지기": DRILL, "서술형": WRITE, "실력 완성": TEST, "내신대비": TEST}


def rows_of(page):
    """같은 높이의 조각을 한 줄로 묶는다 — 답이 한 줄에 네댓 개씩 떨어져 있다"""
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
                and (out[-1]["x"] < COL) == (r["x"] < COL) and r["x"] > out[-1]["x"]):
            out[-1]["text"] += "   " + r["text"]
            out[-1]["y"] = min(out[-1]["y"], r["y"])
        else:
            out.append(dict(r))
    return out


def split_items(text):
    out, want = [], 1
    rest = " " + text
    while True:
        hit = re.search(r"(?:^|\s)%d\s" % want, rest)
        if not hit:
            break
        if out:
            out[-1]["text"] = rest[:hit.start()].strip()
        rest = rest[hit.end():]
        out.append({"no": want, "text": ""})
        want += 1
    if out:
        out[-1]["text"] = rest.strip()
    return [c for c in out if c["text"]]


def main(src, dst):
    doc = fitz.open(src)
    out = []
    now = {"page": None, "section": None}
    seq = {}
    spot, said = None, []

    def close():
        nonlocal spot, said
        if spot and said:
            got = split_items(" ".join(said))
            if got:
                out.append({**spot, "pieces": got})
        spot, said = None, []

    for page_no, page in enumerate(doc, 1):
        for r in rows_of(page):
            t = r["text"]
            # 「Unit   p. 25   일반동사의 현재형」 — 새 Unit 이 열린다
            if t.startswith("Unit"):
                close()
                ref = PAGEREF.search(t)
                now = {"page": int(ref.group(1)) if ref else None, "section": None}
                continue
            # 쪽 꼴 머리글
            flat = re.sub(r"\s+", "", t)
            hit = None
            for key, name in NAMES.items():
                if flat.startswith(re.sub(r"\s+", "", key)):
                    hit = name
                    break
            if hit:
                close()
                seq[hit] = seq.get(hit, 0) + 1
                now = {**now, "section": hit, "seq": seq[hit]}
                if hit != DRILL:
                    spot = {**now, "block": 0, "answer_page": page_no}
                    said = []
                continue
            if now.get("section") is None:
                continue
            # 해설·우리말 뜻풀이는 한글 글씨다 — 답이 아니다
            if r["font"].startswith(("SDGothic", "SDCompSans", "SDSwagger", "YDVY")):
                continue
            got = MARK.match(t)
            if got and r["font"].startswith(ANS_FONT) and now["section"] == DRILL:
                close()
                spot = {**now, "block": ord(got.group(1)) - ord("A"), "answer_page": page_no}
                said = [got.group(2)] if got.group(2) else []
                continue
            if spot is not None and r["font"].startswith(ANS_FONT):
                said.append(t)

    close()

    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("정답 묶음 %d개 저장 (답 %d개): %s"
          % (len(out), sum(len(b["pieces"]) for b in out), dst), file=LOG)
    for k, n in collections.Counter(b["section"] for b in out).most_common():
        print("   %-14s %d묶음" % (k, n), file=LOG)
    for b in out[:5]:
        print("   p%s %s 묶음%s — %s"
              % (b.get("page"), b["section"], b["block"],
                 [(p["no"], p["text"][:16]) for p in b["pieces"]][:5]), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
