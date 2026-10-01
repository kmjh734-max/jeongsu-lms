# -*- coding: utf-8 -*-
"""열중 16강 정답및해설에서 답과 해설을 읽는다.

정답지 짜임 (두 칸, 글자층이 살아 있다)
    Chapter 1   be동사와 일반동사            ← RockwellStd-Bold 16 + Md 17
    UNIT 1 인칭대명사와 be동사        p. 12   ← Oz-Bold 17 + 쪽 가리킴
      A                                   ← Oz-ExtraboldItalic 16
        (보기 문장의 우리말 뜻 — 답이 아니다)
        Check-up                          ← Oz-ExtraboldItalic 11.9
          1 your, 나는 너의 새로운 …
      B …
    내신 적중 테스트                  p. 16   ← SangSangTitleOTFB 17
      1 ② 2 ③ 3 ④ … 25 is, her, They
      1 '~에 있다'의 뜻은 be동사로 …          ← 해설, 번호 + 풀이
    서술형 내공 Up                   p. 19
      A 1 My parents' new car is red. …

Check-up 과 묶음 사이의 우리말 줄은 보기 문장의 뜻풀이다 — 답이 아니므로 담지
않는다. 그래서 묶음을 열고도 Check-up 을 만나기 전까지는 아무것도 모으지 않는다.

  python scripts/grammar-bank/yj_answers.py "…해설.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

CHAP_FONT = "RockwellStd-Bold"
UNIT_FONT = "Oz-Bold"
MARK_FONT = "Oz-ExtraboldItalic"
TEST_FONT = "SangSangTitleOTFB"
PAGEREF = re.compile(r"^p\.\s*(\d{1,3})$")
UNIT = re.compile(r"^UNIT\s*(\d{1,2})\s*(.*)$", re.I)
MARK = re.compile(r"^([A-F])\s*(.*)$")
COL = 300.0

UNIT_PAGE = "UNIT"
TEST_PAGE = "내신 적중 테스트"
WRITE_PAGE = "서술형 내공 Up"
OX_PAGE = "문법정리 OX"


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
            text = re.sub(r"[ \t]+", " ", "".join(made)).strip()
            if text:
                out.append({"x": ln["bbox"][0], "y": ln["bbox"][1],
                            "font": spans[0]["font"], "size": round(spans[0]["size"], 1),
                            "text": text})
    out.sort(key=lambda r: (0 if r["x"] < COL else 1, r["y"]))
    return out


def split_items(text):
    """「1 your, … 2 mine, …」 를 문항마다 가른다.

    번호는 1부터 하나씩 는다. 답 안에도 숫자가 있을 수 있으므로, 다음에 와야 할
    번호일 때만 새 문항으로 본다.
    """
    out, want = [], 1
    rest = " " + text
    while True:
        hit = re.search(r"(?:^|\s)%d\s*" % want, rest)
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
    book_page = [None]        # 「p. 12」 — 묶음보다 먼저 나와 들고 있어야 한다
    spot = None
    said, why = [], []
    seen = set()          # 서술형에서 이미 닫은 묶음 — 되풀이되면 그 뒤는 해설이다

    def close():
        nonlocal spot, said, why
        if spot and said:
            pieces = split_items(" ".join(said))
            if pieces:
                notes = {w["no"]: w["text"] for w in split_items(" ".join(why))} if why else {}
                for q in pieces:
                    if notes.get(q["no"]):
                        q["why"] = notes[q["no"]]
                out.append({**spot, "pieces": pieces})
        spot, said, why = None, [], []

    for page_no, page in enumerate(doc, 1):
        for r in rows_of(page):
            t = r["text"]

            if r["font"].startswith(CHAP_FONT) and r["size"] > 13:
                got = re.match(r"^Chapter\s*(\d{1,2})", t)
                if got:
                    close()
                    now = {"chapter_no": int(got.group(1)), "chapter": None,
                           "unit_no": None, "unit": None}
                    continue
            if now.get("chapter_no") and now.get("chapter") is None and r["size"] > 15 \
                    and re.search(r"[가-힣]", t):
                now["chapter"] = t
                continue
            got = UNIT.match(t)
            if r["font"].startswith(UNIT_FONT) and got and r["size"] > 14:
                close()
                now = {**now, "unit_no": int(got.group(1)), "unit": got.group(2).strip()}
                book_page[0] = None
                continue
            if r["font"].startswith(TEST_FONT):
                close()
                seen.clear()
                if "서술형" in t:
                    spot = {**now, "section": WRITE_PAGE, "block": None,
                            "pages": [book_page[0]], "answer_page": page_no, "open": False}
                elif "OX" in t.replace(" ", "") or "정리" in t:
                    spot = {**now, "section": OX_PAGE, "block": 0,
                            "pages": [book_page[0]], "answer_page": page_no, "open": True}
                else:
                    spot = {**now, "section": TEST_PAGE, "block": 0,
                            "pages": [book_page[0]], "answer_page": page_no, "open": True}
                continue

            # 묶음 표시 A~F
            got = MARK.match(t)
            write_mark = (spot and spot["section"] == WRITE_PAGE
                          and r["font"].startswith("Router") and got and r["size"] > 11)
            if got and (write_mark or (r["font"].startswith(MARK_FONT) and r["size"] > 14)):
                if spot and spot["section"] == WRITE_PAGE:
                    # 서술형은 묶음 표시 뒤에 바로 답이 온다. 답이 다 끝나면 같은
                    # A·B·C 꼴로 해설이 한 번 더 지나가므로, 되풀이된 묶음은 닫는다.
                    if said and spot.get("open"):
                        pieces = split_items(" ".join(said))
                        if pieces:
                            out.append({**spot, "pieces": pieces})
                    letter = got.group(1)
                    again = letter in seen
                    seen.add(letter)
                    said, why = ([] if again else ([got.group(2)] if got.group(2) else [])), []
                    spot = {**spot, "block": ord(letter) - ord("A"), "open": not again}
                else:
                    close()
                    seen.clear()
                    spot = {**now, "section": UNIT_PAGE,
                            "block": ord(got.group(1)) - ord("A"),
                            "pages": [book_page[0]], "answer_page": page_no, "open": False}
                continue
            # 강 쪽은 Check-up 뒤부터가 답이다 (그 앞은 보기 문장의 우리말 뜻)
            if r["font"].startswith(MARK_FONT) and t.startswith("Check"):
                if spot:
                    spot["open"] = True
                continue

            ref = PAGEREF.match(t)
            if ref:
                book_page[0] = int(ref.group(1))
                if spot is not None and not said:
                    spot["pages"] = [book_page[0]]
                continue

            if spot is not None:
                if not spot.get("open"):
                    continue
                # 해설은 번호에 「①」가 아닌 풀이가 붙는다 — 시험 묶음에만 있다
                if (spot["section"] == TEST_PAGE and not why
                        and re.match(r"^\d{1,2}\s", t) and re.search(r"[가-힣]{3}", t)
                        and not re.match(r"^\d{1,2}\s*[①-⑩]", t) and said):
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
        print("   %-18s %d묶음" % (k, n), file=log)
    for b in out[:5]:
        print("   단원%s 강%s %s 묶음%s p%s — %s"
              % (b["chapter_no"], b["unit_no"], b["section"][:8], b["block"], b["pages"],
                 [(p["no"], p["text"][:20]) for p in b["pieces"]][:4]), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
