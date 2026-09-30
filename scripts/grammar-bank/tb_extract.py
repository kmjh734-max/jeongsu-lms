# -*- coding: utf-8 -*-
"""교과서 문법(고등 Grammar Build Up)에서 문항과 답을 뽑는다.

앞쪽은 문제, 뒤쪽은 정답 열쇠다. 둘이 (Pattern, Exercise, 번호)로 맞물린다.

  [문제 쪽]
    PATTERN 1│주격 관계대명사 that[who]        ← 쪽 머리
    7 다음 두 문장을 관계대명사 that을 사용하여 …    ← 연습문제 번호 + 지시문
    1. I respect the doctor. He always helps …1)  ← 끝의 윗첨자가 답 번호
       ➜ ______________________________

  [정답 열쇠 쪽]   Answer Key
    Pattern 1   Exercise 7
    1) the doctor that always helps people in need / who
    2) …

열쇠에 「실전문제」·「Warm-up」 묶음도 있지만, 실전문제는 답에 해설이 붙어 있어
넣지 않는다(정답지에는 답만 담는다).

  python scripts/grammar-bank/tb_extract.py out.json ["파일 하나"]
"""
import collections, glob, io, json, re, sys
from pathlib import Path

import fitz

BOOK_DIR = "참고파일/교과서문법"
HEAD = re.compile(r"PATTERN\s*(\d+)│\s*(.+)")
ASK = re.compile(r"^(\d{1,2})\s+(\S.*)$")
ITEM = re.compile(r"^(\d{1,2})\.\s*(.*?)(\d{1,2})\)\s*$")
KEY = re.compile(r"^(\d{1,3})\)\s*(.*)$")
EXERCISE = re.compile(r"Exercise\s*(\d{1,2})", re.I)
PATTERN_NO = re.compile(r"Pattern\s*(\d{1,2})", re.I)
BLANK = " _____ "
MID_X = 300           # 정답 열쇠 쪽은 두 단이다


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
    out.sort(key=lambda r: (r["y"], r["x"]))
    return out


def is_key_page(rows):
    return any(r["text"].startswith("Answer Key") for r in rows)


def read_questions(doc):
    """앞쪽 문제 쪽에서 (패턴, 연습문제, 답번호) → 문항"""
    out = {}
    pattern_no = title = None
    ask_no = ask = None
    for page in doc:
        rows = rows_of(page)
        if is_key_page(rows):
            continue
        for r in rows:
            got = HEAD.match(r["text"])
            if got:
                pattern_no = int(got.group(1))
                # 「주격 관계대명사 that[who] Lesson」에서 꼬리말을 떼어 낸다
                title = re.sub(r"\s+Lesson.*$", "", got.group(2)).strip()
                continue
        # 「실전 문제」 쪽은 답이 열쇠에 해설과 함께 실려 있어 넣지 않는다.
        # 문항까지 걷어 내지 않으면 연습문제 번호가 겹쳐 남의 답이 붙는다.
        if any("실전" in r["text"] and len(r["text"]) < 24 for r in rows):
            ask_no = None
            continue
        # 꼬리말(- 27 -)이 문항 아래 줄로 딸려 들어오지 않게 넉넉히 자른다
        body = [r for r in rows if 80 < r["y"] < page.rect.height - 55]
        now = None
        for r in body:
            if not r["font"].startswith("MalgunGothicBold"):
                # 주어진 낱말·<보기>는 문항 아래 줄에 따로 놓인다. 화살표와 빈칸만
                # 있는 줄은 답 쓸 자리이므로 뺀다.
                text = re.sub(r"[_➜→\s]+", " ", r["text"]).strip()
                if now is not None and len(text) > 3:
                    now["extra"].append(re.sub(r"_{3,}", BLANK, r["text"]).strip())
                continue
            hit = ITEM.match(r["text"])
            if hit and ask_no is not None:
                key = (pattern_no, ask_no, int(hit.group(3)))
                out[key] = {"pattern_no": pattern_no, "title": title,
                            "ask_no": ask_no, "prompt": ask,
                            "no": int(hit.group(1)),
                            "body": re.sub(r"_{3,}", BLANK, hit.group(2)).strip(),
                            "extra": []}
                now = out[key]
                continue
            head = ASK.match(r["text"])
            if head and re.search(r"[가-힣]", head.group(2)) and r["x"] < 80:
                ask_no, ask, now = int(head.group(1)), head.group(2).strip(), None
    return out


def read_answers(doc):
    """뒤쪽 열쇠 쪽에서 (패턴, 연습문제, 답번호) → 답"""
    out = {}
    for page in doc:
        rows = rows_of(page)
        if not is_key_page(rows):
            continue
        for col in (0, 1):
            mine = [r for r in rows if (0 if r["x"] < MID_X else 1) == col
                    and 60 < r["y"] < page.rect.height - 55]
            mine.sort(key=lambda r: r["y"])
            pattern_no = ask_no = None
            last = None
            for r in mine:
                bold = r["font"].startswith("MalgunGothicBold")
                if bold and PATTERN_NO.search(r["text"]):
                    pattern_no = int(PATTERN_NO.search(r["text"]).group(1))
                    ask_no, last = None, None
                    continue
                if bold and EXERCISE.search(r["text"]):
                    ask_no = int(EXERCISE.search(r["text"]).group(1))
                    last = None
                    continue
                if bold:                      # Warm-up·실전문제 — 넣지 않는다
                    ask_no, last = None, None
                    continue
                if ask_no is None or pattern_no is None:
                    continue
                got = KEY.match(r["text"])
                if got:
                    last = (pattern_no, ask_no, int(got.group(1)))
                    out[last] = got.group(2).strip()
                elif last and last in out:
                    out[last] = (out[last] + " " + r["text"]).strip()
    return out


def one(path):
    doc = fitz.open(path)
    asked = read_questions(doc)
    said = read_answers(doc)
    doc.close()

    book = Path(path).stem
    lesson = re.search(r"_(\d{1,2})과_", book)
    out = []
    for key, q in asked.items():
        answer = said.get(key)
        if not answer or not q["body"]:
            continue
        out.append({
            "book": book,
            "lesson": int(lesson.group(1)) if lesson else None,
            "pattern_no": q["pattern_no"],
            "title": q["title"],
            "ask_no": q["ask_no"],
            "no": q["no"],
            "prompt": q["prompt"] or "",
            "body": [re.sub(r"\s+", " ", b).strip()
                     for b in [q["body"]] + q.get("extra", []) if b.strip()],
            "choices": [],
            "answer": answer,
            "question_kind": "단답·서술",
        })
    return out


def main(dst, only=None):
    files = [only] if only else sorted(glob.glob(BOOK_DIR + "/*.pdf"))
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    out = []
    for n, path in enumerate(files, 1):
        got = one(path)
        out += got
        if n % 20 == 0 or n == len(files):
            print("  %d/%d 파일 · 문항 %d개" % (n, len(files), len(out)), file=log, flush=True)
    # 출판사가 달라도 같은 문제를 쓴다 — 열 중 일곱이 겹친다. 하나만 남긴다.
    seen, kept = set(), []
    for q in out:
        flat = re.sub(r"[^0-9a-z가-힣]+", " ",
                      (" ".join(q["body"]) + " | " + str(q["answer"])).lower()).strip()
        if flat in seen:
            continue
        seen.add(flat)
        kept.append(q)
    print("겹치는 것을 걸러 %d → %d문항" % (len(out), len(kept)), file=log)
    out = kept
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("교과서 문법 %d문항 저장: %s" % (len(out), dst), file=log)
    tally = collections.Counter(r["title"] for r in out)
    print("PATTERN %d가지" % len(tally), file=log)
    for k, v in tally.most_common(6):
        print("   %-28s %d문항" % (k, v), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2] if len(sys.argv) > 2 else None)
