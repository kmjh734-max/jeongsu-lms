# -*- coding: utf-8 -*-
"""I Love Grammar(YBM) 정답및해설에서 답을 읽는다.

정답지 짜임 (두 칸, 글자층이 살아 있다)
    Grammar Practice            p.14      ← ITCAvantGardeStd-Demi 10~11 + 쪽 가리킴
      A  1 Music and art are my favorite subjects.
         2 Is this exercise difficult?
      B  1 This pizza is, tasty
    Language Focus              p.17
      A  1 is, is, is, are, are, are
    해설 주어 Music and art가 복수이므로 …          ← 작은 글씨, 답이 아니다

쪽 가리킴(p.14)이 본책 인쇄 쪽이라 자리를 하나로 정해 준다.

  python scripts/grammar-bank/ilg_answers.py "…정답.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
HEAD_FONT = "ITCAvantGardeStd-Demi"
ANS_FONT = "MyriadPro"
PAGEREF = re.compile(r"^pp?\.\s*(\d{1,3})(?:\s*[-~]\s*(\d{1,3}))?$")
MARK = re.compile(r"^([A-F])\s+(.*)$")
COL = 290.0

NAMES = {"grammar practice": "Grammar Practice",
         "writing practice": "Writing Practice",
         "language focus": "LANGUAGE FOCUS",
         "actual test": "ACTUAL TEST"}


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
    """「1 … 2 … 3 …」 를 문항마다 가른다 — 다음에 와야 할 번호일 때만 가른다"""
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
    now = {"section": None, "page": None}
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
            if r["font"].startswith(HEAD_FONT) and r["size"] > 9.5:
                low = t.lower()
                for key, name in NAMES.items():
                    if low.startswith(key):
                        close()
                        now = {"section": name, "page": None, "upto": None}
                        # 시험 묶음은 묶음 글자 없이 바로 번호가 온다
                        if name == "ACTUAL TEST":
                            spot = {**now, "block": 0, "answer_page": page_no}
                            said = []
                        break
                else:
                    got = MARK.match(t)
                    if got and now["section"]:
                        close()
                        spot = {**now, "block": ord(got.group(1)) - ord("A"),
                                "answer_page": page_no}
                        said = [got.group(2)] if got.group(2) else []
                continue
            ref = PAGEREF.match(t)
            if ref:
                now["page"] = int(ref.group(1))
                now["upto"] = int(ref.group(2)) if ref.group(2) else None
                if spot and not said:
                    spot["page"], spot["upto"] = now["page"], now["upto"]
                continue
            if spot is not None:
                # 해설·우리말 뜻풀이는 작은 한글 글씨다 — 답이 아니다
                if r["font"].startswith("SDGothic") or r["font"].startswith("SDCompSans"):
                    continue
                if r["font"].startswith(ANS_FONT) or r["font"].startswith(HEAD_FONT):
                    said.append(t)
    close()

    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("정답 묶음 %d개 저장 (답 %d개): %s"
          % (len(out), sum(len(b["pieces"]) for b in out), dst), file=LOG)
    for k, n in collections.Counter(b["section"] for b in out).most_common():
        print("   %-20s %d묶음" % (k, n), file=LOG)
    for b in out[:5]:
        print("   %s 묶음%s p%s — %s"
              % (b["section"], b["block"], b["page"],
                 [(p["no"], p["text"][:22]) for p in b["pieces"]][:4]), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
