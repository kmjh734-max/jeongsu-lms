# -*- coding: utf-8 -*-
"""그래머큐 본책에서 문항을 뽑는다.

쪽 배치가 글꼴로 갈린다.
  지시문   TTMGothicB 9.5pt
  STEP     BauhausStd-Bold "STEP" + 숫자
  문항 번호 DIN-Bold 11pt
  문항 글   HelveticaNeueLTStd 11pt
  꼬리말    "36  Chapter 02  명사"

두 단이지만 한 STEP이 왼쪽 단에서 오른쪽 단으로 이어진다(왼 1~9, 오른 10~18).
그래서 단으로 가르지 않고, STEP 표시의 높이로 띠를 만들어 그 띠에 든 문항을 묶는다.

몇 쪽(학습 구성 안내)은 글꼴에 유니코드 표가 없어 한글이 깨져 나온다. 그런 쪽은 건너뛴다.

  python scripts/grammar-bank/gq_extract.py "참고파일/중등 문법/그래머큐_Starter 1권_.pdf" out.json
"""
import io, json, re, sys
from pathlib import Path
import fitz

NUM_FONT = "DIN-Bold"
INSTR_FONT = "TTMGothic"
STEP_FONT = "BauhausStd"
# 꼬리말은 쪽 번호와 단원 이름이 따로 떨어져 있다 — 단원 쪽만 본다
FOOT = re.compile(r"^Chapter\s+(?P<ch>\d{1,2})\s+(?P<title>.+)$", re.I)
ANSREF = re.compile(r"정답\s*및\s*해설\s*p{1,2}\.\s*(\d+)")
PICK = re.compile(r"\[([^\[\]]+?)\]")
# 글꼴이 깨져 나올 때 쓰이는 대역
BROKEN = re.compile(r"[԰-ࣿऀ-෿က-႟]")


def lines_of(page):
    out = []
    for block in page.get_text("dict")["blocks"]:
        for ln in block.get("lines", []):
            text = "".join(s["text"] for s in ln["spans"])
            if not text.strip():
                continue
            span = ln["spans"][0]
            out.append({
                "x": ln["bbox"][0], "y": ln["bbox"][1],
                "font": span["font"], "size": round(span["size"], 1),
                "text": text.rstrip(),
            })
    return out


def page_info(rows, height):
    """단원 번호·이름, 정답지 쪽, 그리고 본책에 인쇄된 쪽 번호

    인쇄 쪽 번호는 꼬리말 양 끝(FuturaStd-Heavy)에 홀로 있다.
    정답지가 "PRACTICE p.36" 처럼 이 번호로 가리키므로 꼭 함께 들고 간다.
    """
    chapter_no, chapter, ans_page, printed = None, None, None, None
    for r in rows:
        flat = re.sub(r"\s+", " ", r["text"]).strip()
        found = FOOT.match(flat)
        if found:
            chapter_no = int(found.group("ch"))
            chapter = found.group("title").strip()
        hit = ANSREF.search(flat)
        if hit:
            ans_page = int(hit.group(1))
        if r["y"] > height - 55 and r["font"].startswith("FuturaStd-Heavy"):
            m = re.match(r"^(\d{1,3})$", flat)
            if m:
                printed = int(m.group(1))
    return chapter_no, chapter, ans_page, printed


def question_kind(text):
    picks = PICK.findall(text)
    if len(picks) == 1:
        return "어법 고르기"
    if len(picks) > 1:
        return "어법 고르기(여럿)"
    if re.search(r"[○×]", text):
        return "판단 표시"
    return "단답·서술"


def parse_page(page, page_no, carry):
    rows = lines_of(page)
    flat = "\n".join(r["text"] for r in rows)
    # 이어지는 쪽에는 PRACTICE 글자가 없다 — STEP 표시가 있으면 문제 쪽으로 본다
    has_step = any(r["font"].startswith(STEP_FONT) and r["text"].strip().upper() == "STEP"
                   for r in rows)
    if not has_step and "P R A C T I C E" not in flat and "PRACTICE" not in flat:
        return []
    if len(BROKEN.findall(flat)) > 20:
        return []  # 글꼴이 깨진 안내 쪽

    ch_no, ch, ans_page, printed = page_info(rows, page.rect.height)
    if ch_no:
        carry["chapter_no"], carry["chapter"] = ch_no, ch

    # STEP 표시가 쪽 위쪽 60 언저리에 오기도 한다 — 그보다 위만 잘라 낸다
    top, bottom = 58, page.rect.height - 45
    body = [r for r in rows if top < r["y"] < bottom]

    steps, instrs, items = [], [], []
    for r in body:
        text = r["text"].strip()
        if r["font"].startswith(STEP_FONT) and text.upper() == "STEP":
            # 바로 아래 큰 숫자가 STEP 번호다. 쪽에 차례대로 놓이지 않으므로 번호를 읽는다.
            no = None
            for q in body:
                if (q["font"].startswith("FuturaStd-Medium") and q["size"] > 20
                        and abs(q["x"] - r["x"]) < 12 and 0 < q["y"] - r["y"] < 30):
                    hit = re.match(r"^(\d{1,2})$", q["text"].strip())
                    if hit:
                        no = int(hit.group(1))
                    break
            steps.append((r["y"], no))
            continue
        # STEP 번호로 쓰인 큰 숫자는 문항 번호가 아니다
        if r["font"].startswith("FuturaStd-Medium") and r["size"] > 20:
            continue
        if INSTR_FONT in r["font"] and r["size"] < 11:
            if ANSREF.search(text) or len(text) < 6:
                continue
            instrs.append((r["y"], r["x"], text))
            continue
        if r["font"].startswith(NUM_FONT):
            m = re.match(r"^(\d{1,2})[\s\t]*(.*)$", text)
            if m:
                items.append({"y": r["y"], "x": r["x"], "no": int(m.group(1)),
                              "text": m.group(2).strip()})
                continue
        # 번호 뒤에 이어지는 글 — 같은 단에서 가장 가까운 위 문항에 붙인다
        if items:
            same = [it for it in items if abs(it["x"] - r["x"]) < 40 and it["y"] <= r["y"]]
            if same:
                near = max(same, key=lambda it: it["y"])
                near["text"] = (near["text"] + " " + text).strip()

    steps.sort()

    def band(y):
        """이 높이가 어느 STEP 띠에 드는가 — 교재에 적힌 STEP 번호로 돌려준다"""
        got = 0
        for n, (sy, no) in enumerate(steps):
            if y >= sy - 8:
                got = no if no is not None else n + 1
        return got

    # 띠마다 지시문 — 그 띠에서 가장 위에 있는 것
    by_band = {}
    for y, x, text in instrs:
        by_band.setdefault(band(y), []).append((y, text))
    instr_of = {b: sorted(v)[0][1] for b, v in by_band.items()}

    out = []
    for it in sorted(items, key=lambda i: (band(i["y"]), i["x"] > page.rect.width / 2, i["y"])):
        text = re.sub(r"\s+", " ", it["text"]).strip()
        if len(text) < 2 or BROKEN.search(text):
            continue
        b = band(it["y"])
        out.append({
            "page": page_no,
            "printed_page": printed,
            "answer_page": ans_page,
            "chapter_no": carry["chapter_no"],
            "chapter": carry["chapter"],
            "step": b,
            "instruction": instr_of.get(b, ""),
            "no": it["no"],
            "text": text,
            "picks": PICK.findall(text),
            "question_kind": question_kind(text),
        })
    return out


def parse(path):
    doc = fitz.open(path)
    carry = {"chapter_no": None, "chapter": None}
    out = []
    for i, page in enumerate(doc):
        for row in parse_page(page, i + 1, carry):
            row["book"] = Path(path).stem
            out.append(row)
    return out


if __name__ == "__main__":
    rows = parse(sys.argv[1])
    Path(sys.argv[2]).write_text(json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
    out = io.open(1, "w", encoding="utf-8", closefd=False)
    print("문항 %d개 저장: %s" % (len(rows), sys.argv[2]), file=out)
    kinds = {}
    for r in rows:
        kinds[r["question_kind"]] = kinds.get(r["question_kind"], 0) + 1
    for k, n in sorted(kinds.items(), key=lambda kv: -kv[1]):
        print("   %-18s %d개" % (k, n), file=out)
    bad = [r for r in rows if not r["instruction"]]
    print("   지시문 없는 문항 %d개" % len(bad), file=out)
    out.flush()
