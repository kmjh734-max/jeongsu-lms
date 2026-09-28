# -*- coding: utf-8 -*-
"""
참고파일/교과서문법 의 PDF에서 교과서 문법 포인트를 뽑는다.

쪽마다 이런 모양이다:
    주격 관계대명사 that[who]        ← 포인트 이름 (첫 줄)
    고등 Grammar Build Up
    Lesson 1
    공통영어1│NE능률(민병천)
    - 1 -
    │Pattern 1│                      ← 패턴 번호
    (설명 문단)
    ▼ 교과서 예문
    • 예문 …

한 과(PDF)에 패턴이 여럿 있고, 같은 패턴이 여러 쪽에 걸치기도 한다.
AI를 부르지 않고 글만 읽어 규칙으로 가른다.
"""
import io
import json
import os
import re
import sys

import fitz

sys.stdout.reconfigure(encoding="utf-8")

SRC = "참고파일/교과서문법"
OUT = "scripts/grammar-bank/textbook-points.json"

PATTERN_RE = re.compile(r"│\s*Pattern\s*(\d+)\s*│")
LESSON_RE = re.compile(r"^Lesson\s*(\d+)", re.M)
EXAMPLE_HEAD = "▼ 교과서 예문"


def parse_name(path):
    """파일 이름에서 교과서·과를 읽는다."""
    base = os.path.basename(path)
    year = re.search(r"\)(\d{4})년_", base)
    book = re.search(r"\d{4}년_([^_]+)_([^_]+)_(\d+)과", base)
    if not book:
        return None
    return {
        "year": year.group(1) if year else "",
        "subject": book.group(1),   # 공통영어1 / 영어I …
        "publisher": book.group(2),  # NE능률(민병천)
        "lesson": int(book.group(3)),
    }


def clean(s):
    return re.sub(r"\s+", " ", s).strip()


def points_of(doc):
    """쪽을 훑어 패턴마다 (번호, 이름, 설명, 예문)을 모은다."""
    found = {}
    order = []
    for page in doc:
        text = page.get_text()
        m = PATTERN_RE.search(text)
        if not m:
            continue
        no = int(m.group(1))
        lines = [l.strip() for l in text.split("\n") if l.strip()]
        if not lines:
            continue
        title = lines[0]
        # 첫 줄이 머리말이면 그 다음 줄을 본다
        skip = ("고등 Grammar Build Up", "Lesson", "- ")
        i = 0
        while i < len(lines) and (
            lines[i].startswith(skip) or re.match(r"^-\s*\d+\s*-$", lines[i]) or "│" in lines[i]
        ):
            i += 1
        if i < len(lines):
            title = lines[i]

        # 설명: │Pattern n│ 다음부터 ▼ 교과서 예문 앞까지
        after = text.split(m.group(0), 1)[1] if m.group(0) in text else ""
        body = after.split(EXAMPLE_HEAD, 1)
        desc = clean(body[0])[:400]

        # 교과서 예문: • 로 시작하는 영어 줄
        examples = []
        if len(body) > 1:
            for line in body[1].split("\n"):
                line = line.strip()
                if not line.startswith("•"):
                    continue
                s = line.lstrip("•").strip()
                s = re.sub(r"\s*교과서 본문\s*$", "", s)
                if re.search(r"[A-Za-z]", s) and len(s) > 12:
                    examples.append(s)
                if len(examples) >= 2:
                    break

        if no not in found:
            found[no] = {"no": no, "title": title, "desc": desc, "examples": examples}
            order.append(no)
        else:
            # 같은 패턴이 이어지는 쪽 — 예문만 보탠다
            for e in examples:
                if len(found[no]["examples"]) < 3 and e not in found[no]["examples"]:
                    found[no]["examples"].append(e)
    return [found[n] for n in sorted(order)]


def main():
    files = sorted(f for f in os.listdir(SRC) if f.lower().endswith(".pdf"))
    out = []
    bad = []
    for i, f in enumerate(files, 1):
        path = os.path.join(SRC, f)
        meta = parse_name(path)
        if not meta:
            bad.append(f)
            continue
        try:
            doc = fitz.open(path)
        except Exception as e:  # noqa: BLE001
            bad.append(f"{f} — {e}")
            continue
        pts = points_of(doc)
        doc.close()
        if not pts:
            bad.append(f + " — 패턴 못 찾음")
            continue
        out.append({**meta, "file": f, "points": pts})
        if i % 20 == 0:
            print(f"  {i}/{len(files)} …")

    io.open(OUT, "w", encoding="utf-8", newline="\n").write(
        json.dumps(out, ensure_ascii=False, indent=1)
    )
    total = sum(len(b["points"]) for b in out)
    print(f"\n교과서 {len(out)}개 과 · 문법 포인트 {total}개 → {OUT}")
    if bad:
        print("못 읽은 것:", len(bad))
        for b in bad[:6]:
            print("  ", b[:80])


if __name__ == "__main__":
    main()
