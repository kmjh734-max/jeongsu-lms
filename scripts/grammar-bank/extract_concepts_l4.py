# -*- coding: utf-8 -*-
"""완성(Level 4) 개념을 선생님이 만드신 hwpx에서 뽑는다.

완성 권은 「문법의 정수」 완성본이 아직 없어서 챕터별 hwpx를 쓴다.
hwpx는 압축 파일이라 풀면 한글이 그대로 읽힌다.

유닛 제목 표기가 챕터마다 다르다("1. should", "1) 소유격 관계대명사", "가정법 과거").
그래서 글자 서식표를 읽어, 본문보다 크고 굵은 글씨를 제목으로 본다.
"""
import collections, html, json, re, sys, zipfile
from pathlib import Path

ROOT = Path(r"C:/video-app/참고파일/중등 문법/족보닷컴 영문법/4. 완성 (작업 중)")
SECTION = re.compile(r"Contents/section\d+\.xml")
PARAGRAPH = re.compile(r"<hp:p\b(.*?)</hp:p>", re.S)
RUN_TEXT = re.compile(r"<hp:t>(.*?)</hp:t>", re.S)
CHAR_REF = re.compile(r'charPrIDRef="(\d+)"')
CHAR_PR = re.compile(r"<hh:charPr\b([^>]*)>(.*?)</hh:charPr>", re.S)
FILE_NAME = re.compile(r"^(\d+)[.\s]+(.+?)(?:\s*템플릿.*)?$")
NUMBER_HEAD = re.compile(r"^\d+[.)]\s*")
PRACTICE_HEAD = re.compile(r"^(연습\s*문제|실전\s*문제|확인\s*문제)$")
# 유닛 제목이 아니라 그냥 이름표인 것들
NOT_A_UNIT = ("예문", "참고", "주의", "비교", "정리", "해석", "TIP", "Tip",
              "모의고사/ 수능 예문 살펴보기", "모의고사/수능 예문 살펴보기")
NOISE = re.compile(r"^(I\d{3}-[A-Z]+(\([A-Z]+\))?-[\d-]+|-\s*\d+\s*-)$")


def char_styles(archive):
    """글자 서식표 — 번호마다 크기와 굵기."""
    xml = archive.read("Contents/header.xml").decode("utf-8")
    styles = {}
    for found in CHAR_PR.finditer(xml):
        attrs, inner = found.group(1), found.group(2)
        ident = re.search(r'id="(\d+)"', attrs)
        height = re.search(r'height="(\d+)"', attrs)
        if ident:
            styles[ident.group(1)] = (int(height.group(1)) if height else 1000,
                                      "<hh:bold" in inner)
    return styles


def paragraphs(path):
    """(글자 서식 번호, 글) 짝을 차례대로 돌려준다."""
    archive = zipfile.ZipFile(str(path))
    styles = char_styles(archive)
    names = sorted(n for n in archive.namelist() if SECTION.fullmatch(n))
    out = []
    for name in names:
        xml = archive.read(name).decode("utf-8")
        for block in PARAGRAPH.findall(xml):
            text = "".join(html.unescape(t) for t in RUN_TEXT.findall(block))
            text = re.sub(r"\s+", " ", text).strip()
            if not text:
                continue
            refs = CHAR_REF.findall(block)
            main = collections.Counter(refs).most_common(1)[0][0] if refs else "0"
            out.append((main, text))
    return styles, out


def heading_styles(styles, rows):
    """본문보다 크고 굵은 서식을 제목으로 본다. 가장 큰 하나는 챕터 제목이다."""
    heights = collections.Counter()
    for ref, text in rows:
        height, _ = styles.get(ref, (1000, False))
        heights[height] += len(text)
    body_height = heights.most_common(1)[0][0] if heights else 1000
    heads = {ref for ref, (height, bold) in styles.items()
             if bold and height > body_height}
    used = {ref for ref, _ in rows}
    heads &= used
    title = rows[0][0] if rows else None
    return heads - {title}, title


def parse_chapter(path, number):
    styles, rows = paragraphs(path)
    if not rows:
        return []
    heads, title_ref = heading_styles(styles, rows)
    chapter = NUMBER_HEAD.sub("", rows[0][1]).strip()

    units, current, order, in_practice = [], None, 0, False
    for ref, text in rows[1:]:
        if ref in heads and PRACTICE_HEAD.match(text):
            in_practice = True                  # 유닛이 아니라 연습 묶음이다
            continue
        if ref in heads and text.strip() in NOT_A_UNIT:
            if current is not None:
                current["body"].append(text)
            continue
        if ref in heads and len(text) < 70:
            in_practice = False
            order += 1
            found = NUMBER_HEAD.match(text)
            current = {
                "level": 4, "level_name": "완성",
                "chapter_no": number, "chapter": chapter,
                "unit_no": int(found.group(0).rstrip(".) ")) if found else order,
                "unit": NUMBER_HEAD.sub("", text).strip(),
                "body": [], "practice": [],
            }
            units.append(current)
            continue
        if current is not None:
            (current["practice"] if in_practice else current["body"]).append(text)
    return units


def parse_concept_pdf(path, number, title):
    """hwpx가 없는 챕터는 족보닷컴 개념완성 PDF에서 뽑는다."""
    import fitz
    doc = fitz.open(str(path))
    units, current = [], None
    for page in doc:
        for raw in page.get_text().splitlines():
            text = re.sub(r"\s+", " ", raw).strip()
            if not text or NOISE.match(text):
                continue
            found = re.match(r"^(\d+)\.\s*(\S.*)$", text)
            # 예문 속 번호와 섞이지 않게, 번호가 1부터 차례로 이어질 때만 유닛으로 본다.
            if found and len(text) < 30 and int(found.group(1)) == len(units) + 1:
                current = {
                    "level": 4, "level_name": "완성",
                    "chapter_no": number, "chapter": title,
                    "unit_no": int(found.group(1)), "unit": found.group(2).strip(),
                    "body": [], "practice": [],
                }
                units.append(current)
                continue
            if current is not None:
                current["body"].append(text)
    return units


def chapter_files():
    """챕터마다 쓸 hwpx를 고른다. 템플릿본보다 본문본을 앞세운다."""
    picked = {}
    for path in sorted(ROOT.glob("*/*.hwpx")):
        if "복사본" in path.name:
            continue
        found = FILE_NAME.match(path.stem.strip())
        if not found:
            continue
        number = int(found.group(1))
        is_template = "템플릿" in path.stem
        if number not in picked or (picked[number][1] and not is_template):
            picked[number] = (path, is_template)
    return {n: p for n, (p, _) in sorted(picked.items())}


CHAPTER_PDF = re.compile(r"^\[완성\]\s*(\d+)\.\s*(.+?)_개념완성")


def pdf_only_chapters(have):
    """hwpx가 없는 챕터를 개념완성 PDF로 메운다."""
    out = {}
    for path in sorted(ROOT.glob("*/*개념완성*.pdf")):
        found = CHAPTER_PDF.match(path.stem)
        if not found:
            continue
        number = int(found.group(1))
        if number in have:
            continue
        if number not in out or "unlocked" in path.stem:
            out[number] = (path, found.group(2).strip())
    return out


def main(out_path):
    all_units = []
    files = chapter_files()
    for number, path in files.items():
        units = parse_chapter(path, number)
        print("  %2d. %-12s %2d유닛  %s" % (
            number, units[0]["chapter"][:12] if units else "?", len(units),
            " / ".join(u["unit"][:16] for u in units[:4])))
        all_units += units
    for number, (path, title) in sorted(pdf_only_chapters(files).items()):
        units = parse_concept_pdf(path, number, title)
        print("  %2d. %-12s %2d유닛  (개념완성 PDF)" % (number, title[:12], len(units)))
        all_units += units
    all_units.sort(key=lambda u: (u["chapter_no"], u["unit_no"]))
    chapters = len({u["chapter_no"] for u in all_units})
    print("\n완성 %d챕터 / %d유닛" % (chapters, len(all_units)))
    Path(out_path).write_text(
        json.dumps(all_units, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main(sys.argv[1])
