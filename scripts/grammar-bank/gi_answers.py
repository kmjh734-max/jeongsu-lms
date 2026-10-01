# -*- coding: utf-8 -*-
"""Grammar Inside 정답및해설에서 답과 해설을 읽는다.

정답지 짜임 (두 칸, 글자층이 살아 있다)
    Chapter 02 일반동사                        ← DINPro-Black 24.6
    UNIT 01  일반동사의 현재형                   ← DINPro-Black 9 + YDVYGOStd55 9
    CHECK UP                        p.24       ← VAGRound 9 + 쪽 가리킴
       1. ⓐ   2. ⓒ   3. ⓑ
    PRACTICE                        p.25
       STEP 1   1. eat  2. cries  3. have …
    Grammar for Writing          pp.32-33
       A  1. doesn't have a camera  2. opens at nine …
    Review Test                  pp.34-37
       1. ⑤  2. ③  …  33. I writes → I write
       1  ⑤ fly의 3인칭 단수 현재형: flies        ← 해설, 번호 + 풀이
       2  ③은 동사원형과 3인칭 단수 현재형, …

쪽 가리킴(p.24)이 본책 인쇄 쪽이라 검산에 쓴다. 답은 (단원, UNIT, 묶음, 번호)로
자리가 하나로 정해진다.

  python scripts/grammar-bank/gi_answers.py "…정답및해설.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

HEAD_FONT = "DINPro-Black"
NAME_FONT = "YDVYGOStd55"
CHAP = re.compile(r"^(\d{1,2})\s*(.*)$")
UNIT = re.compile(r"^UNIT\s*(\d{1,2})\s*(.*)$", re.I)
STEP = re.compile(r"^STEP\s*([1-9])\s*(.*)$", re.I)
MARK = re.compile(r"^([A-F])$")
PAGEREF = re.compile(r"^pp?\.\s*(\d{1,3})(?:\s*[-~]\s*(\d{1,3}))?$")
NUMBERED = re.compile(r"(?:^|\s)(\d{1,2})\.\s")
COL = 260.0


def rows_of(page):
    out = []
    for block in page.get_text("dict")["blocks"]:
        for ln in block.get("lines", []):
            spans = [q for q in ln["spans"] if q["text"].strip()]
            if not spans:
                continue
            # 조각 사이가 떨어져 있으면 띄어쓰기다
            made, last = [], None
            for q in spans:
                if last is not None and q["bbox"][0] - last > 1.0 and made and not made[-1].endswith(" "):
                    made.append(" ")
                made.append(q["text"])
                last = q["bbox"][2]
            text = re.sub(r"[ \t]+", " ", "".join(made)).strip()
            if text:
                out.append({"x": ln["bbox"][0], "y": ln["bbox"][1], "x1": ln["bbox"][2],
                            "font": spans[0]["font"], "size": round(spans[0]["size"], 1),
                            "text": text})
    out.sort(key=lambda r: (0 if r["x"] < COL else 1, r["y"]))
    return out


def split_items(text):
    """「1. eat 2. cries 3. have」 를 문항마다 가른다.

    번호는 1부터 하나씩 는다. 답 안에도 숫자가 있을 수 있으므로, 다음에 와야 할
    번호일 때만 새 문항으로 본다.
    """
    out, want = [], 1
    rest = " " + text
    while True:
        hit = re.search(r"(?:^|[\s])%d\.\s" % want, rest)
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


def split_why(text):
    """해설을 번호마다 가른다 — 「1 ⑤ fly의 … 2 ③은 …」"""
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
    now = {"chapter_no": None, "chapter": None, "unit_no": None, "unit": None}
    spot = None          # 지금 담고 있는 자리
    said = []            # 답이 담긴 줄
    why = []             # 해설이 담긴 줄 (Review Test 에만 있다)

    def close():
        nonlocal spot, said, why
        if spot and said:
            pieces = split_items(" ".join(said))
            if pieces:
                # 해설을 번호로 맞춰 붙인다
                notes = {w["no"]: w["text"] for w in split_why(" ".join(why))} if why else {}
                for q in pieces:
                    if notes.get(q["no"]):
                        q["why"] = notes[q["no"]]
                out.append({**spot, "pieces": pieces})
        spot, said, why = None, [], []

    for page_no, page in enumerate(doc, 1):
        for r in rows_of(page):
            t = r["text"]
            big = r["font"].startswith(HEAD_FONT)

            if big and r["size"] > 18 and CHAP.match(t):
                close()
                got = CHAP.match(t)
                now = {"chapter_no": int(got.group(1)), "chapter": got.group(2).strip(),
                       "unit_no": None, "unit": None}
                continue
            got = UNIT.match(t)
            if big and got and r["size"] < 14:
                close()
                now = {**now, "unit_no": int(got.group(1)), "unit": got.group(2).strip()}
                continue
            if r["font"].startswith(NAME_FONT) and now.get("unit_no") and not now.get("unit"):
                now["unit"] = t
                continue

            if r["font"].startswith("VAGRound") and "CHECK" in t:
                close()
                spot = {**now, "section": "CHECK UP", "block": 0, "pages": [], "answer_page": page_no}
                continue
            if big and t.startswith("PRACTICE"):
                close()
                spot = {**now, "section": "PRACTICE", "block": None, "pages": [], "answer_page": page_no}
                continue
            if big and re.match(r"^Grammar for Writing", t, re.I):
                close()
                spot = {**now, "section": "GRAMMAR FOR WRITING", "block": None,
                        "pages": [], "answer_page": page_no}
                continue
            if re.match(r"^Review Test", t, re.I):
                close()
                spot = {**now, "section": "REVIEW TEST", "block": 0, "pages": [], "answer_page": page_no}
                continue

            if spot is not None:
                ref = PAGEREF.match(t)
                if ref and not said:
                    spot["pages"] = [int(x) for x in ref.groups() if x]
                    continue
                got = STEP.match(t)
                if big and got and spot["section"] == "PRACTICE":
                    close_block = spot
                    if said:
                        pieces = split_items(" ".join(said))
                        if pieces:
                            out.append({**close_block, "pieces": pieces})
                    said = [got.group(2)] if got.group(2) else []
                    why = []
                    spot = {**close_block, "block": int(got.group(1))}
                    continue
                # 묶음 표시는 그 칸의 왼쪽 끝에 선다 — 왼쪽 칸은 x≈54, 오른쪽 칸은
                # x≈274 다. 한 값으로 못 박으면 오른쪽 칸 묶음을 다 놓친다.
                at_edge = r["x"] < 120 or COL <= r["x"] < COL + 60
                if big and MARK.match(t) and spot["section"] == "GRAMMAR FOR WRITING" and at_edge:
                    close_block = spot
                    if said:
                        pieces = split_items(" ".join(said))
                        if pieces:
                            out.append({**close_block, "pieces": pieces})
                    said, why = [], []
                    spot = {**close_block, "block": ord(t) - ord("A")}
                    continue
                if (spot["section"] == "REVIEW TEST" and not why
                        and re.match(r"^\d{1,2}(\s|$)", t) and not re.match(r"^\d{1,2}\.", t)):
                    why.append(t)
                    continue
                (why if why else said).append(t)
    close()

    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    print("정답 묶음 %d개 저장 (답 %d개 · 해설 %d개): %s"
          % (len(out), sum(len(b["pieces"]) for b in out),
             sum(1 for b in out for p in b["pieces"] if p.get("why")), dst), file=log)
    for k, n in collections.Counter(b["section"] for b in out).most_common():
        print("   %-22s %d묶음" % (k, n), file=log)
    for b in out[:6]:
        print("   단원%s UNIT%s %s 묶음%s p%s — %s"
              % (b["chapter_no"], b["unit_no"], b["section"], b["block"], b["pages"],
                 [(p["no"], p["text"][:18]) for p in b["pieces"]][:4]), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
