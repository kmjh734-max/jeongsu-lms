# -*- coding: utf-8 -*-
"""천일문 워크북 문항과 정답지를 맞댄다.

정답지 상자 머리에 자리가 적혀 있다.

    Unit 03  SVOC   p.72   Ⓐ     ← Unit 번호·이름과 워크북 쪽이 적힌 머리
    … 앞 상자 꼬리 …        Ⓑ
    … 앞 상자 꼬리 …        Ⓒ     ← 여기부터는 다음 쪽(p.73)이다
    … 앞 상자 꼬리 …        Ⓓ

한 Unit 이 워크북 두 쪽에 걸쳐 Ⓐ·Ⓑ / Ⓒ·Ⓓ 로 나뉜다. 워크북 쪽에도 같은 글자가
찍혀 있으므로 (Unit, 묶음 글자) 하나로 못이 박힌다.

검산은 잘 풀리는 워크북과 같다 — 자리를 잘못 짚은 신호면 묶음째, 잘못 읽은
신호면 그 답만 버린다.

  python scripts/grammar-bank/cw_wb_match.py 문항.json 상자.json 결과.json [어긋난것.json]
"""
import collections, io, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from gq_match import in_choices, usable
from jp_match import as_gq, ok_choice
from jp_wb_match import as_written, from_bank, known, lexicon, uses_given

log = io.open(1, "w", encoding="utf-8", closefd=False)

PAGEREF = re.compile(r"[pP]\s*\.?\s*(\d{1,3})")
UNIT = re.compile(r"U\s?n\s?i\s?t\s*(\d{1,2})", re.I)
LETTER = re.compile(r"(?<![A-Za-z])([A-D])[\s.:]*$")


MID_X = 300           # 정답지도 두 단이다 — 왼 단을 다 읽고 오른 단을 읽는다
HAS_UNIT = re.compile(r"U\s?n\s?[il1]\s?t", re.I)
IS_TEST = re.compile(r"T\s?e\s?s\s?t", re.I)


def order(boxes):
    """상자를 읽는 차례대로 세운다 — 쪽 → 왼 단 → 오른 단 → 위에서 아래로"""
    return sorted(boxes, key=lambda b: (b["answer_page"],
                                        0 if b["rect"][0] < MID_X else 1,
                                        round(b["rect"][1])))


MARKS = "ⓐⓑⓒⓓⓔ①②③④⑤ⓞⓧ○×"


def by_mark(question, answer):
    """「기호를 쓰세요」인데 영어 문장이 붙어 있으면 남의 묶음 답이다."""
    if "기호" not in (question.get("prompt") or ""):
        return True
    return any(c in MARKS for c in str(answer)) or len(str(answer).strip()) <= 3


def spots(boxes, units):
    """정답지 상자마다 (단원, Unit, 묶음번호)를 붙인다.

    묶음 표시 Ⓐ·Ⓑ·Ⓒ·Ⓓ 는 동그라미 안에 든 글자라 OCR 이 「시·8·D」로 흘려 읽는다.
    글자를 믿지 않고, 「01 Unit SVC p.68」 머리가 보이면 그 자리에서 새 Unit 이
    시작하고 그 뒤로는 차례대로 Ⓑ·Ⓒ·Ⓓ 라고 본다.

    머리에 적힌 워크북 쪽으로 Unit 마다 다시 못을 박으므로, 한 군데가 어긋나도
    그 Unit 안에서 끝난다. 「Chapter Test」 상자는 Unit 이 없어 버린다.

    `units` 는 (단원번호, Unit번호, Ⓐ가 실린 인쇄 쪽) 목록, 차례대로.
    """
    by_page = {u[2]: i for i, u in enumerate(units) if u[2]}

    out = []
    at, block = -1, None
    for b in order(boxes):
        head = re.sub(r"\s+", " ", b.get("head") or "").strip()
        told = PAGEREF.findall(head)
        page = int(told[-1]) if told else None
        if HAS_UNIT.search(head):
            at = by_page[page] if page in by_page else at + 1
            block = 0
        elif IS_TEST.search(head[-24:]):
            block = None              # 마무리 묶음 — 다음 Unit 을 기다린다
            continue
        elif block is None:
            continue
        else:
            block += 1
        if not 0 <= at < len(units) or block > 3:
            continue
        answers = {str(p["no"]): p["text"] for p in b["pieces"]}
        if answers:
            out.append((units[at][0], units[at][1], block, answers))
    return out


def main(q_path, box_path, out_path, bad_path=None):
    questions = json.load(open(q_path, encoding="utf-8"))
    boxes = json.load(open(box_path, encoding="utf-8"))
    words = lexicon(q_path)

    blocks = collections.defaultdict(list)
    for q in questions:
        blocks[(q["chapter_no"], q["unit_no"], q["block"])].append(q)
    for v in blocks.values():
        v.sort(key=lambda q: q["no"])

    units, seen = [], set()
    for q in sorted(questions, key=lambda q: (q["page"], q["block"])):
        key = (q["chapter_no"], q["unit_no"])
        if key in seen or None in key:
            continue
        seen.add(key)
        head = blocks.get((key[0], key[1], 0)) or []
        units.append((key[0], key[1], head[0]["printed_page"] if head else None))

    # 본책 답이 앞쪽에 있다. 워크북 쪽 번호가 적힌 Unit 머리가 처음 나오는
    # 자리부터가 워크북 부분이다.
    want = {u[2] for u in units if u[2]}
    first = min((b["answer_page"] for b in boxes
                 if HAS_UNIT.search(re.sub(r"\s+", " ", b.get("head") or ""))
                 and any(int(n) in want for n in PAGEREF.findall(b.get("head") or ""))),
                default=0)
    boxes = [b for b in boxes if b["answer_page"] >= first]
    placed = spots(boxes, units)
    exact = sum(1 for ch, un, bl, ans in placed
                if blocks.get((ch, un, bl))
                and set(ans) == {str(q["no"]) for q in blocks[(ch, un, bl)]})
    print("Unit %d개 · 자리 붙은 상자 %d개 가운데 번호까지 맞는 것 %d개"
          % (len(units), len(placed), exact), file=log)

    matched, failed, dropped = [], [], 0
    for ch, un, bl, answers in placed:
        items = blocks.get((ch, un, bl))
        if not items:
            failed.append({"단원": ch, "Unit": un, "묶음": bl, "답": len(answers),
                           "까닭": "그 자리에 문항이 없음"})
            continue
        nos = {str(q["no"]) for q in items}
        # 번호가 딱 맞으면 그 자체가 자리를 확인해 준다. 정답지가 번호를 몇 개
        # 덜 읽은 상자는 그 확인이 없어, 묶음이 통째로 밀린 상자가 섞여 들어온다.
        # 맞대어 볼 문항이 둘 이상 있을 때만 받아 보기도 했지만, 건진 것은 다섯
        # 문항뿐이고 그중에도 틀린 것이 있었다. 번호가 꼭 같을 때만 쓴다.
        if set(answers) != nos:
            failed.append({"단원": ch, "Unit": un, "묶음": bl, "답": len(answers),
                           "까닭": "번호가 문항과 다름"})
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
            failed.append({"단원": ch, "Unit": un, "묶음": bl, "답": len(answers),
                           "까닭": why})
            continue
        for q, a in pairs:
            row = dict(q)
            row["answer"] = as_written(q, a)
            matched.append(row)

    Path(out_path).write_text(json.dumps(matched, ensure_ascii=False, indent=1), encoding="utf-8")
    if bad_path:
        Path(bad_path).write_text(json.dumps(failed, ensure_ascii=False, indent=1), encoding="utf-8")

    print("잘못 읽어 뺀 답 %d개" % dropped, file=log)
    total = max(len(questions), 1)
    print("워크북 문항 %d개 중 답을 붙인 것 %d개 (%d%%)"
          % (len(questions), len(matched), round(len(matched) / total * 100)), file=log)
    for k, n in collections.Counter(f["까닭"] for f in failed).most_common():
        print("   %s: %d상자" % (k, n), file=log)
    log.flush()


if __name__ == "__main__":
    main(*sys.argv[1:5])
