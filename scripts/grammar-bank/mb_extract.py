# -*- coding: utf-8 -*-
"""중학영문법 3800제(정답 표기본)에서 문항과 답을 뽑는다 (바깥 서비스 없이).

이 책은 글자가 선으로 그려져 있어, 먼저 만들어 둔 **글자 모양표**로 글을
되살린다(mb_glyphs.py). 되살린 뒤의 쪽 짜임은 이렇다.

    PRACTICE 1-4                       ← 머리글 (검지 않은 빛깔)
    우리말과 같은 뜻이 되도록 …          ← 지시문 (검정)
    1 계속 연락합시다 = Let's keep in touch. (keep)
      └ 번호(빛깔) └ 문제 글(검정)  └ 답(하늘, 0.0/0.7/0.9)

빛깔이 뜻을 가른다 — 하늘색 글자가 곧 정답이다. 그래서 하늘색 자리를 빈칸으로
돌려놓으면 문제가 되고, 그 글자를 모으면 답이 된다.

꼬리말에 「CHAPTER 1 문장의 기초 19」가 쪽마다 있고, 인쇄 쪽과 PDF 쪽이 같다.

  python scripts/grammar-bank/mb_extract.py 모양표.json "…3800제.pdf" out.json
"""
import collections, io, json, re, sys
from pathlib import Path

import fitz

sys.path.insert(0, str(Path(__file__).parent))
from mb_glyphs import glyphs_of, rows_of
from mb_read import load_table

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
INK = (0.1, 0.1, 0.1)
BLUE = (0.0, 0.7, 0.9)
BLANK = "_____"
# 꼬리말 — 「CHAPTER 1 0 형용사 210」처럼 숫자가 띄어 쓰여 들어온다
FOOT = re.compile(r"C\s*H\s*A\s*P\s*T\s*E\s*R\s*((?:\d\s*){1,2})([^\d]{1,24}?)\s*((?:\d\s*){1,4})$")
HEAD = re.compile(r"P\s*[PRACTISE]{2,10}\s*(\d{1,2})\s*[-–]?\s*(\d{1,2})?")
NUM = re.compile(r"^(\d{1,2})\s*$")
# 단원 머리글 — 「UNIT 1-6 부정의문문」. 글자 모양표에서 UNIT 은 PS S 로, 붙임표는
# 2 로 읽히기도 해서, 앞머리의 영어·숫자는 걷어내고 우리말만 제목으로 삼는다.
UNIT = re.compile(r"^(?:P\s*S\s*S|U\s*N\s*I\s*T)[\s\dA-Za-z]*?([가-힣].*)$")


def say(glyphs, table, gap=1.6):
    """글자를 글로 되살린다. 조각 사이가 벌어지면 띄어쓰기를 넣는다.

    띄어쓰기 기준은 글자 크기에 맞춘다 — 우리말 글자는 넓어서, 고정된 틈으로
    보면 한 낱말이 「명 령 문」처럼 갈라진다.
    """
    out, last = [], None
    for g in glyphs:
        wide = max(gap, (g["y1"] - g["y"]) * 0.34)
        if last is not None and g["x"] - last > wide:
            out.append(" ")
        got = table.get(g["shape"])
        out.append(got["ch"] if got else "□")
        last = g["x1"]
    return re.sub(r"\s+", " ", "".join(out)).strip()


def lines_of(page, table):
    """쪽을 줄로 묶는다. 떨어져 나온 마침표 같은 조각은 가까운 줄에 붙인다."""
    rows = rows_of(glyphs_of(page), least=1)
    rows.sort(key=lambda r: (sum((g["y"] + g["y1"]) / 2 for g in r) / len(r),
                             min(g["x"] for g in r)))
    out = []
    for row in rows:
        mid = sum((g["y"] + g["y1"]) / 2 for g in row) / len(row)
        if len(row) <= 2 and out:
            near = min(out, key=lambda o: abs(o["mid"] - mid))
            if abs(near["mid"] - mid) < 9:
                near["gl"] += row
                near["gl"].sort(key=lambda g: g["x"])
                continue
        out.append({"mid": mid, "gl": row})
    for line in out:
        line["x"] = min(g["x"] for g in line["gl"])
        line["x1"] = max(g["x1"] for g in line["gl"])
        line["text"] = say(line["gl"], table)
    return out


def page_foot(lines, page, table):
    """꼬리말에서 단원 번호·이름과 인쇄 쪽"""
    h = page.rect.height
    for line in lines:
        if line["mid"] < h - 40:
            continue
        got = FOOT.match(line["text"])
        if got:
            no = re.sub(r"\s+", "", got.group(1))
            page_no = re.sub(r"\s+", "", got.group(3))
            return (int(no) if no.isdigit() else None, got.group(2).strip(),
                    int(page_no) if page_no.isdigit() else None)
    return None, None, None


def is_mark(glyph):
    """번호에 쓰는 빛깔인가 — 검정도 하늘색도 아니면 표시다"""
    c = glyph["color"]
    return c != INK and c != BLUE and c != (1.0, 1.0, 1.0)


def item_start(line):
    """이 줄이 새 문항의 머리인가 — 빛깔 번호로 시작한다"""
    head = []
    for g in line["gl"]:
        if is_mark(g):
            head.append(g)
        else:
            break
    if not head:
        return None
    text = "".join(c for c in say(head, {}) if c)      # 번호는 모양표 없이도 센다
    return head


def number_of(line, table):
    head = []
    for g in line["gl"]:
        if is_mark(g):
            head.append(g)
        else:
            break
    if not head:
        return None, line["gl"]
    text = re.sub(r"\s+", "", say(head, table))
    if not text.isdigit():
        return None, line["gl"]
    return int(text), line["gl"][len(head):]


def split_answer(glyphs, table):
    """문제 글과 답을 가른다 — 하늘색 자리가 답이고, 그 자리는 빈칸이 된다"""
    body, answer, run = [], [], []
    last = None
    for g in glyphs:
        if g["color"] == BLUE:
            run.append(g)
            continue
        if run:
            answer.append(say(run, table))
            body.append(" %s " % BLANK)
            run = []
        if last is not None and g["x"] - last > 1.6:
            body.append(" ")
        got = table.get(g["shape"])
        body.append(got["ch"] if got else "□")
        last = g["x1"]
    if run:
        answer.append(say(run, table))
        body.append(" %s" % BLANK)
    return re.sub(r"\s+", " ", "".join(body)).strip(), [a for a in answer if a]


def parse_page(page, page_no, table, carry):
    lines = lines_of(page, table)
    ch_no, ch_name, printed = page_foot(lines, page, table)
    if ch_no:
        carry["chapter_no"], carry["chapter"] = ch_no, ch_name
    h = page.rect.height
    body = [l for l in lines if 44 < l["mid"] < h - 44]

    # 쪽이 두 칸인지 재어 본다 — 번호가 놓인 x 를 본다
    marks = [l["x"] for l in body if number_of(l, table)[0] is not None]
    cut = None
    if marks:
        xs = sorted(set(round(x) for x in marks))
        far = [x for x in xs if x > xs[0] + 90]
        cut = (far[0] - 10) if far else None
    for line in body:
        line["col"] = 0 if (cut is None or line["x"] < cut) else 1
    body.sort(key=lambda l: (l["col"], l["mid"]))

    out, now, said = [], None, carry.get("said", "")
    for line in body:
        text = line["text"]
        said_unit = UNIT.match(text)
        if said_unit and len(text) < 44:
            # 제목 뒤에 붙은 쪽 안내(「페이지」·「□이지」·쪽 번호)는 걷어낸다
            name = re.sub(r"\s+", " ", said_unit.group(1)).strip()
            name = re.sub(r"\s*(?:[□페]이지|페이지)\s*\d*$", "", name).strip()
            name = re.sub(r"\s*\d{1,3}$", "", name).strip()
            carry["unit"] = name
            now = None
            continue
        got = HEAD.match(text)
        if got and len(text) < 40:
            now = None
            carry["block"] = "%s-%s" % (got.group(1), got.group(2) or "")
            said = ""
            continue
        no, rest = number_of(line, table)
        if no is not None and rest:
            piece, answer = split_answer(rest, table)
            now = {"no": no, "body": [piece], "answer": answer,
                   "prompt": said, "block": carry.get("block"),
                   "unit": carry.get("unit"),
                   "chapter_no": carry.get("chapter_no"), "chapter": carry.get("chapter"),
                   "printed_page": printed or page_no}
            now["_y"] = line["mid"]
            now["_x"] = rest[0]["x"] if rest else line["x"]
            out.append(now)
            continue
        # 이어지는 줄은 바로 아래에 붙어 있고 번호보다 안쪽에서 시작한다. 줄 사이가
        # 벌어지면 문항이 끝난 것이다 — 그러지 않으면 뒤따르는 설명까지 삼킨다.
        # 하늘색만으로 된 줄은 답이 아니라 곁에 적어 둔 풀이말이다
        #   (「Let's 청유문의 부정문 > Let's not」·「시간을 어기지 않고, 정각에」)
        if now is not None and line["gl"] and not any(g["color"] == INK for g in line["gl"]):
            continue
        if (now is not None and line["gl"] and line["x"] > 60
                and line["mid"] - now["_y"] < 22 and line["x"] >= now["_x"] - 6):
            now["_y"] = line["mid"]
            piece, answer = split_answer(line["gl"], table)
            if piece:
                now["body"].append(piece)
            now["answer"] += answer
            continue
        if now is not None and line["mid"] - now["_y"] >= 22:
            now = None
        # 문항 앞에 놓인 검은 줄은 지시문이다
        if all(g["color"] == INK for g in line["gl"]) and len(text) > 8:
            said = text
            now = None
    carry["said"] = said
    return out


def main(table_path, pdf, dst):
    table = load_table(table_path)
    doc = fitz.open(pdf)
    carry, out = {}, []
    for pno, page in enumerate(doc, 1):
        for row in parse_page(page, pno, table, carry):
            row.pop("_y", None)
            row.pop("_x", None)
            row["book"] = Path(pdf).stem
            row["question_kind"] = "단답·서술"
            row["choices"] = []
            row["bank"] = []
            out.append(row)
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("3800제 문항 %d개 저장: %s" % (len(out), dst), file=LOG)
    print("   답이 붙은 것 %d개 · 발문 있는 것 %d개 · 단원 %d가지"
          % (sum(1 for r in out if r["answer"]),
             sum(1 for r in out if r["prompt"]),
             len({r["chapter_no"] for r in out})), file=LOG)
    for ch, n in sorted(collections.Counter(r["chapter_no"] for r in out).items(),
                        key=lambda kv: (kv[0] or 0)):
        print("   단원%-3s %d문항" % (ch, n), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2], sys.argv[3])
