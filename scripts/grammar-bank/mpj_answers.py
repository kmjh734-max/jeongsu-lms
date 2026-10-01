# -*- coding: utf-8 -*-
"""문제로 풀자 중학영문법(YBM) 정답및해설에서 답을 읽는다.

정답지 짜임 (두 칸, 글자층이 살아 있다)
    CHAPTER 01  문장의 종류                 ← Gotham-Bold 11 + TTOmniGothicH 12
      POINT 1 | be동사 문장과 인칭대명사   p. 14   ← Gotham-Bold 9 + Gotham-Medium 7
        CHECK                              ← Gotham-Black 6.5
          1 am      2 They're     3 is
        PRACTICE                           ← Gotham-Black 6.5
          A  1 are / ~이다   2 am / ~이다
          B  1 She's my sister.
    해설 …                                  ← YDVYGOStd53 8, 답이 아니다

쪽 가리킴(p. 14)이 본책 인쇄 쪽이라 자리를 하나로 정해 준다.

  python scripts/grammar-bank/mpj_answers.py "…정답.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
TAG_FONT = "Gotham-Black"
ANS_FONT = "Gotham-Bold"
PAGE_FONT = "Gotham-Medium"
POINT = re.compile(r"^POINT\s*(\d{1,2})\s*\|?\s*(.*)$")
PAGEREF = re.compile(r"^p\.\s*(\d{1,3})$")
MARK = re.compile(r"^([A-F])\s+(.*)$")
TESTS = re.compile(r"실전\s*TEST|내신\s*대비|중간·기말|서술형")
COL = 300.0

CHECK = "CHECK"
PRACTICE = "PRACTICE"
TEST = "실전 TEST"


def rows_of(page):
    out = []
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
                out.append({"x": ln["bbox"][0], "y": ln["bbox"][1],
                            "font": spans[0]["font"], "size": round(spans[0]["size"], 1),
                            "text": text})
    out.sort(key=lambda r: (0 if r["x"] < COL else 1, r["y"]))
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
    now = {"chapter_no": None, "point": None, "page": None, "run": 0}
    spot, said = None, []
    waiting = [False]        # POINT 머리글을 막 지났는가 — 그 다음 「p.N」은 POINT 의 쪽이다

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
            got = re.match(r"^CHAPTER\s*(\d{1,2})", t)
            if got and r["size"] > 10:
                close()
                now = {"chapter_no": int(got.group(1)), "point": None, "page": None}
                continue
            got = POINT.match(t)
            if got and r["font"].startswith(ANS_FONT):
                close()
                now = {**now, "point": int(got.group(1)), "page": None,
                       "run": now.get("run", 0) + 1}
                waiting[0] = True
                continue
            ref = PAGEREF.match(t)
            if ref:
                now["page"] = int(ref.group(1))
                if waiting[0]:
                    waiting[0] = False
                    if spot and not said:
                        spot["page"] = now["page"]
                else:
                    # POINT 머리글 없이 홀로 선 쪽 가리킴 — 실전 TEST 의 답이 뒤따른다
                    close()
                    spot = {**now, "section": TEST, "block": 0, "answer_page": page_no}
                    said = []
                continue
            if r["font"].startswith(TAG_FONT):
                if t.startswith("CHECK"):
                    close()
                    spot = {**now, "section": CHECK, "block": 0, "answer_page": page_no}
                    said = [re.sub(r"^CHECK\s*", "", t).strip()] if t.strip() != "CHECK" else []
                elif t.startswith("PRACTICE"):
                    close()
                    spot = {**now, "section": PRACTICE, "block": None, "answer_page": page_no}
                continue
            if spot is None:
                continue
            # 해설·우리말 뜻풀이는 작은 한글 글씨다 — 답이 아니다
            if r["font"].startswith(("YDVY", "SDGothic", "TTOmni", "HelveticaNeue")):
                continue
            got = MARK.match(t)
            if got and r["font"].startswith(ANS_FONT) and spot["section"] == PRACTICE:
                if said and spot.get("block") is not None:
                    pieces = split_items(" ".join(said))
                    if pieces:
                        out.append({**spot, "pieces": pieces})
                said = [got.group(2)] if got.group(2) else []
                spot = {**spot, "block": ord(got.group(1)) - ord("A")}
                continue
            if spot.get("block") is None:
                continue
            said.append(t)
    close()

    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("정답 묶음 %d개 저장 (답 %d개): %s"
          % (len(out), sum(len(b["pieces"]) for b in out), dst), file=LOG)
    for k, n in collections.Counter(b["section"] for b in out).most_common():
        print("   %-14s %d묶음" % (k, n), file=LOG)
    for b in out[:5]:
        print("   단원%s POINT%s %s 묶음%s p%s — %s"
              % (b["chapter_no"], b["point"], b["section"], b["block"], b.get("page"),
                 [(p["no"], p["text"][:20]) for p in b["pieces"]][:4]), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
