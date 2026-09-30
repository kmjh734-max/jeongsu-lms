# -*- coding: utf-8 -*-
"""그래머큐 워크북 문항과 정답지 뒤쪽(워크북 답)을 맞댄다.

정답지 한 권에 본책 답과 워크북 답이 함께 들어 있고, 워크북 답이 뒤쪽이다.
상자 머리에 자리가 적혀 있다.

    Unit 01   인칭대명사와 be동사    pp. 2-3    ← 쪽이 적힌 머리
    Ⓐ 1 He is, He is, They are  2 …
    Ⓑ …

묶음 Ⓐ 가 나오면 다음 Unit 으로 넘어가고 Ⓑ·Ⓒ·Ⓓ 는 물려받는다. 머리에서 읽은
Unit 번호로 Unit 마다 다시 못을 박아, 한 군데가 어긋나도 그 Unit 안에서 끝난다.

검산은 천일문·잘 풀리는 워크북과 같다.

  python scripts/grammar-bank/gqwb_match.py 문항.json 상자.json 결과.json [어긋난것.json]
"""
import collections, io, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from gq_match import in_choices, usable
from jp_match import as_gq, ok_choice
from jp_wb_match import as_written, from_bank, known, lexicon, uses_given

log = io.open(1, "w", encoding="utf-8", closefd=False)

UNIT = re.compile(r"U\s?n\s?[il1]\s?t\s*(\d{1,2})", re.I)
LETTER = re.compile(r"(?<![A-Za-z])([A-D])[\s.:]*$")
MID_X = 300
MARKS = "ⓐⓑⓒⓓⓔ①②③④⑤ⓞⓧ○×"


def order(boxes):
    return sorted(boxes, key=lambda b: (b["answer_page"],
                                        0 if b["rect"][0] < MID_X else 1,
                                        round(b["rect"][1])))


def by_mark(question, answer):
    if "기호" not in (question.get("prompt") or ""):
        return True
    return any(c in MARKS for c in str(answer)) or len(str(answer).strip()) <= 3


def spots(boxes, units):
    """정답지 상자마다 (Unit 번호, 묶음번호)를 붙인다."""
    where = {u: i for i, u in enumerate(units)}
    out = []
    at, block = -1, None
    for b in order(boxes):
        head = re.sub(r"\s+", " ", b.get("head") or "").strip()
        said = UNIT.search(head)
        if said:
            no = int(said.group(1))
            at = where[no] if no in where else at + 1
            block = 0
        elif block is None:
            continue
        else:
            block += 1
        if not 0 <= at < len(units) or block > 5:
            continue
        answers = {str(p["no"]): p["text"] for p in b["pieces"]}
        if answers:
            out.append((units[at], block, answers))
    return out


def main(q_path, box_path, out_path, bad_path=None):
    questions = json.load(open(q_path, encoding="utf-8"))
    boxes = json.load(open(box_path, encoding="utf-8"))
    words = lexicon(q_path)

    blocks = collections.defaultdict(list)
    for q in questions:
        blocks[(q["unit_no"], q["block"])].append(q)
    for v in blocks.values():
        v.sort(key=lambda q: q["no"])

    units = sorted({q["unit_no"] for q in questions if q.get("unit_no")})

    # 본책 답이 앞쪽에 있다. 시작 자리를 하나씩 옮겨 가며 번호까지 맞아떨어지는
    # 상자가 가장 많은 자리를 고른다.
    def fits(start):
        got = 0
        for un, bl, ans in spots([b for b in boxes if b["answer_page"] >= start], units):
            items = blocks.get((un, bl))
            if items and set(ans) == {str(q["no"]) for q in items}:
                got += 1
        return got

    pages = sorted({b["answer_page"] for b in boxes})
    first = max(pages, key=lambda p: (fits(p), p)) if pages else 0
    boxes = [b for b in boxes if b["answer_page"] >= first]
    placed = spots(boxes, units)
    exact = sum(1 for un, bl, ans in placed
                if blocks.get((un, bl))
                and set(ans) == {str(q["no"]) for q in blocks[(un, bl)]})
    print("워크북 답은 정답지 %d쪽부터 · Unit %d개 · 자리 붙은 상자 %d개 가운데 번호까지 맞는 것 %d개"
          % (first, len(units), len(placed), exact), file=log)

    matched, failed, dropped = [], [], 0
    for un, bl, answers in placed:
        items = blocks.get((un, bl))
        if not items:
            failed.append({"Unit": un, "묶음": bl, "답": len(answers), "까닭": "그 자리에 문항이 없음"})
            continue
        nos = {str(q["no"]) for q in items}
        if set(answers) != nos:
            failed.append({"Unit": un, "묶음": bl, "답": len(answers), "까닭": "번호가 문항과 다름"})
            continue
        pairs = [(q, answers[str(q["no"])]) for q in items]
        why = None
        for q, a in pairs:
            if not ok_choice(a, q.get("choices")):
                why = "보기에 없는 답"
            elif not in_choices(a, as_gq(q)["picks"]):
                why = "고를 것 안에 없는 답"
            elif not uses_given(q, a):
                why = "괄호 안에 주어진 낱말을 안 씀"
            elif not from_bank(q, a):
                why = "<보기> 밖의 답"
            elif not by_mark(q, a):
                why = "기호를 쓰라는데 기호가 아닌 답"
            if why:
                break
        if not why:
            keep = [(q, a) for q, a in pairs if usable(a, as_gq(q)) and known(a, words)]
            if len(keep) < len(pairs) * 0.5:
                why = "잘못 읽은 답이 절반을 넘음"
            else:
                dropped += len(pairs) - len(keep)
                pairs = keep
        if why:
            failed.append({"Unit": un, "묶음": bl, "답": len(answers), "까닭": why})
            continue
        for q, a in pairs:
            row = dict(q)
            row["answer"] = as_written(q, a)
            matched.append(row)

    Path(out_path).write_text(json.dumps(matched, ensure_ascii=False, indent=1), encoding="utf-8")
    if bad_path:
        Path(bad_path).write_text(json.dumps(failed, ensure_ascii=False, indent=1), encoding="utf-8")

    print("잘못 읽어 뺀 답 %d개" % dropped, file=log)
    print("워크북 문항 %d개 중 답을 붙인 것 %d개 (%d%%)"
          % (len(questions), len(matched), round(len(matched) / max(len(questions), 1) * 100)),
          file=log)
    for k, n in collections.Counter(f["까닭"] for f in failed).most_common():
        print("   %s: %d상자" % (k, n), file=log)
    log.flush()


if __name__ == "__main__":
    main(*sys.argv[1:5])
