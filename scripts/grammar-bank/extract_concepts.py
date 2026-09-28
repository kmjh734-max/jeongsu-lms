# -*- coding: utf-8 -*-
"""「문법의 정수」 완성본에서 챕터·유닛별 개념을 뽑는다.

이 책은 선생님이 hwp로 새로 짜신 것이라 한글이 그대로 읽힌다.
쪽마다 UNIT 번호와 제목이 큰 글씨로 박혀 있어 그걸 경계로 삼는다.
"""
import json, re, sys
from pathlib import Path

import fitz

# 권마다 제목 글꼴이 다르다(1·3권 Thin, 2권 Black). 크기로 가른다.
TITLE_PREFIX = "NotoSansKR-"
HEAD_SIZE = 17                          # 이보다 작으면 쪽 위 단원명


def is_title(span):
    return span["font"].startswith(TITLE_PREFIX) and span["size"] >= HEAD_SIZE


def is_head(span):
    return span["font"].startswith(TITLE_PREFIX) and span["size"] < HEAD_SIZE
CHAPTER_HEAD = re.compile(r"CHAPTER\s*(\d+)\.?")
# hwp 서식에 남아 있는 자리표시
PLACEHOLDER = ("교재명을 입력해주세요.", "내용을 입력해주세요.")
FOOTER = re.compile(r"^문법의\s*정수\s*\d*$")
# 연습문제 머리: "A 다음 문장을 부정문으로 바꾸세요."
# 개념 예문은 "A He is a pilot."처럼 영어로 이어지므로 한글로 갈린다.
PRACTICE_HEAD = re.compile(r"^[A-Z]\s+[가-힣].*(세요|시오)\.?\s*$")


def spans(page):
    out = []
    for block in page.get_text("dict")["blocks"]:
        if block["type"] != 0:
            continue
        for line in block["lines"]:
            for span in line["spans"]:
                if not span["text"].strip():
                    continue
                out.append({
                    "x": span["bbox"][0], "y": span["bbox"][1],
                    "x1": span["bbox"][2],
                    "font": span["font"].split("+")[-1],
                    "size": round(span["size"], 1),
                    "text": span["text"],
                })
    out.sort(key=lambda s: (round(s["y"] / 5), s["x"]))
    return out


def join_line(items):
    out, prev = "", None
    for item in items:
        if prev is not None and item["x"] - prev["x1"] > 1.5 and not out.endswith(" "):
            out += " "
        out += item["text"]
        prev = item
    return re.sub(r"\s+", " ", out).strip()


def to_lines(items):
    lines, current, key = [], [], None
    for item in items:
        this = round(item["y"] / 5)
        if key is not None and this != key:
            lines.append(current)
            current = []
        current.append(item)
        key = this
    if current:
        lines.append(current)
    return lines


def read_chapter_cover(items):
    """챕터 표지: CHAPTER / 01 / Be동사"""
    big = [s for s in items if is_title(s)]
    number = next((s["text"] for s in big if s["size"] > 55), None)
    title = next((s["text"] for s in big if 38 < s["size"] < 55), None)
    if number and title and number.strip().isdigit():
        return int(number), title.strip()
    return None


def read_unit_head(items):
    """유닛 쪽머리: UNIT / 1 / 개념"""
    big = [s for s in items if is_title(s)]
    if not any(s["text"].strip() == "UNIT" for s in big):
        return None
    number = next((s for s in big if 45 < s["size"] < 60), None)
    if not number or not number["text"].strip().isdigit():
        return None
    title = " ".join(s["text"].strip() for s in big
                     if 25 < s["size"] < 40 and s["y"] > number["y"] - 30)
    return int(number["text"].strip()), re.sub(r"\s+", " ", title).strip()


LONE_MARKER = re.compile(r"^[A-Z]$")
HAS_MARKER = re.compile(r"^[A-Z]\s")


def attach_markers(lines):
    """따로 떨어진 예문 표시(A·B·C)를 제 문장에 붙인다.

    조판에 따라 표시가 문장 뒤에 오기도 하고 앞에 오기도 해서 양쪽을 다 본다.
    """
    out, waiting = [], None
    for text in lines:
        if LONE_MARKER.match(text):
            if out and not HAS_MARKER.match(out[-1]):
                out[-1] = text + " " + out[-1]
            else:
                waiting = text
            continue
        if waiting and not HAS_MARKER.match(text):
            text = waiting + " " + text
            waiting = None
        out.append(text)
    return out


def split_practice(lines):
    """개념과 연습문제를 가른다. "A 다음 문장을 …하세요."에서 연습이 시작된다."""
    for index, text in enumerate(lines):
        if PRACTICE_HEAD.match(text):
            return lines[:index], lines[index:]
    return lines, []


def parse_book(path, level, level_name):
    doc = fitz.open(str(path))
    units, chapter, chapter_title, current = [], None, None, None

    for index in range(doc.page_count):
        items = spans(doc[index])
        if not items:
            continue

        cover = read_chapter_cover(items)
        if cover:
            chapter, chapter_title = cover
            current = None
            continue

        head = read_unit_head(items)
        if head and current is not None                 and (current["unit_no"], current["chapter_no"]) == (head[0], chapter):
            current["in_practice"] = True      # 같은 유닛의 연습 쪽이 이어진다
            head = None
        if head:
            current = {
                "level": level, "level_name": level_name,
                "chapter_no": chapter, "chapter": chapter_title,
                "unit_no": head[0], "unit": head[1],
                "page": index + 1, "body": [], "practice": [],
            }
            units.append(current)

        if current is None:
            continue

        body = [s for s in items if not is_title(s) and not is_head(s)]
        for line in to_lines(body):
            text = join_line(line)
            if not text or re.fullmatch(r"\d{1,3}", text):     # 쪽 번호
                continue
            if text in PLACEHOLDER or FOOTER.match(text):
                continue
            current["body"].append(text)

    for unit in units:
        unit.pop("in_practice", None)
        unit["body"], unit["practice"] = split_practice(attach_markers(unit["body"]))
    return [u for u in units if u["chapter_no"]]


BOOKS = [
    ("1. 기초*/문법의 정수 LEVEL 1.pdf", 1, "기초"),
    ("2. 기본*/문법의 정수 LEVEL 2.pdf", 2, "기본"),
    ("3. 심화*/문법의 정수 LEVEL 3.pdf", 3, "심화"),
]
ROOT = Path(r"C:/video-app/참고파일/중등 문법/족보닷컴 영문법")


def main(out_path):
    all_units = []
    for pattern, level, name in BOOKS:
        hits = sorted(ROOT.glob(pattern))
        if not hits:
            print("없음:", pattern)
            continue
        units = parse_book(hits[0], level, name)
        chapters = len({u["chapter_no"] for u in units})
        print("Level %d %s — %d챕터 / %d유닛" % (level, name, chapters, len(units)))
        all_units += units
    Path(out_path).write_text(
        json.dumps(all_units, ensure_ascii=False, indent=1), encoding="utf-8")
    print("\n전체 %d유닛" % len(all_units))


if __name__ == "__main__":
    main(sys.argv[1])
