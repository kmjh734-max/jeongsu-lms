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


def workbook_only(boxes):
    """정답지 뒤쪽의 워크북 부분만 남긴다.

    한 권의 정답지에 본책 답과 워크북 답이 함께 들어 있다. 본책 쪽에도 Ⓐ·Ⓑ 가
    있지만 그것은 상자 **안**에 찍혀 있고, 워크북은 상자 **위**에 있다. 그래서
    머리가 글자로 끝나는 상자는 워크북 것이다.

    본책 머리에도 어쩌다 글자가 걸릴 수 있으므로, 그런 상자가 몰려 있는 뒤쪽
    구간만 잘라 쓴다. 본책의 「p.47」 같은 쪽이 워크북 쪽으로 오해되는 것을 막는다.
    """
    hit = collections.Counter(b["answer_page"] for b in boxes
                              if LETTER.search(re.sub(r"\s+", " ", b.get("head") or "").strip()))
    if not hit:
        return boxes
    whole = sum(hit.values())
    pages = sorted(hit)
    start = pages[0]
    for page in pages:
        if sum(n for p, n in hit.items() if p >= page) < whole * 0.9:
            break
        start = page
    return [b for b in boxes if b["answer_page"] >= start]


def spots(boxes, units):
    """정답지 상자마다 (단원, Unit, 묶음번호)를 붙인다.

    묶음 Ⓐ 가 나오면 다음 Unit 으로 넘어가고, Ⓑ·Ⓒ·Ⓓ 는 그 Unit 을 물려받는다.
    머리에서 Unit 번호나 쪽을 읽었으면 그 자리에 다시 못을 박아, 한 군데가
    어긋나도 뒤로 번지지 않게 한다.

    `units` 는 (단원번호, Unit번호, Ⓐ가 실린 인쇄 쪽) 목록, 차례대로.
    """
    boxes = sorted(boxes, key=lambda b: (b["answer_page"], b["rect"][1]))
    by_page = {u[2]: i for i, u in enumerate(units) if u[2]}

    out = []
    at = -1
    for b in boxes:
        head = re.sub(r"\s+", " ", b.get("head") or "").strip()
        mark = LETTER.search(head)
        if not mark:
            continue                      # Chapter Test 등 — Unit 이 없어 버린다
        block = ord(mark.group(1)) - ord("A")
        if block == 0:
            told = PAGEREF.findall(head)
            page = int(told[-1]) if told else None
            said = UNIT.search(head)
            if page in by_page:
                at = by_page[page]        # 쪽이 읽혔다 — 그대로 못을 박는다
            elif said and at + 1 < len(units) and units[at + 1][1] == int(said.group(1)):
                at += 1
            else:
                at += 1
        if not 0 <= at < len(units):
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

    boxes = workbook_only(boxes)
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
