# -*- coding: utf-8 -*-
"""본책에서 뽑은 문항과 정답지에서 읽은 답을 맞댄다 (잘 풀리는 영문법).

정답지는 본책 차례를 그대로 따라간다. 그래서 본책의 문항 묶음(한 쪽 안에서
번호가 1부터 다시 시작하는 단위)과 정답지의 상자를 앞에서부터 차례대로 맞댄다.
머리말에서 본책 쪽이 읽힌 상자는 그 쪽에 못을 박아 차례가 밀리지 않게 한다.

검산 — 하나라도 어긋나면 그 묶음은 넣지 않고 따로 남긴다.
  · 문항 수와 답 개수가 같아야 한다
  · ①~⑤ 로 고르는 문항은 답이 보기 안에 있어야 한다
  · 읽다가 뭉개진 답은 뺀다 (그래머큐와 같은 그물을 쓴다)

「마무리 실전문제」는 여러 단원에 걸쳐 있어 은행의 단원에 넣을 자리가 없다.
선생님 뜻에 따라 넣지 않는다.

  python scripts/grammar-bank/jp_match.py 문항.json 답.json 결과.json [어긋난것.json]
"""
import collections, io, json, re, sys
from pathlib import Path

CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"
FINAL = re.compile(r"마\s?무\s?리")
# 개념 설명 글이 발문으로 딸려 온 자국 — 문제가 아니라 규칙 풀이다
EXPLAIN = re.compile(r"라는 의미|의미로|사용한다|나타내며|해석한다|붙인다")
ASKING = re.compile(r"시오|세요|것은\?|고르|완성|배열|바꿔|고치|쓰")
# 보기 없이 번호만 답으로 온 것 — 옆 상자의 답이 섞인 자국이다
ONLY_NO = re.compile(r"^[1-9①-⑩]([,\s]+[1-9①-⑩])*$")
# 차례가 한두 묶음 밀리는 일이 있다 — 이만큼까지는 앞으로 훑어본다
REACH = 3

# 답을 걸러내는 그물은 그래머큐와 같은 것을 쓴다
sys.path.insert(0, str(Path(__file__).parent))
from gq_match import in_choices, usable


def answer_nos(answer):
    """'④' 또는 '4' 또는 '②, ⑤' 에서 보기 번호를 읽는다"""
    text = str(answer or "")
    got = [CIRCLED.index(c) + 1 for c in text if c in CIRCLED]
    if got:
        return got
    return [int(n) for n in re.findall(r"\b([1-9])\b", text)]


def ok_choice(answer, choices):
    if not choices:
        return True
    nos = answer_nos(answer)
    if not nos:
        return False
    have = {c["no"] for c in choices}
    return all(n in have for n in nos)


PICK = re.compile(r"\[([^\[\]]+?)\]")


def as_gq(q):
    """그래머큐 그물에 넣어 보려고 글과 고를 것을 꺼내 둔다.

    그래머큐는 문항 글이 text 한 줄이고 고를 것이 그 안의 [A / B] 인데,
    여기서는 글이 body 여러 줄이고 보기가 choices 로 따로 있다.
    """
    text = " ".join(q.get("body") or [])
    return {"text": text, "picks": PICK.findall(text)}


def blocks_of(items):
    """본책 문항을 묶음으로 나눈다 — (인쇄 쪽, 묶음 번호)

    한 쪽에 문제 묶음이 둘 이상이면 번호가 1부터 다시 시작한다. 정답지도
    묶음마다 상자가 따로 있으므로, 묶음을 단위로 맞대야 번호가 어긋나지 않는다.
    """
    by = collections.defaultdict(list)
    for q in items:
        by[(q.get("printed_page") or 0, q.get("block") or 0)].append(q)
    return [{"page": key[0], "block": key[1],
             "items": sorted(by[key], key=lambda q: q["no"])}
            for key in sorted(by)]


BACK = 30      # 이만큼 뒤로 돌아가면 제자리가 아니다
RESTART = 3    # 이만큼 잇따라 돌아가면 워크북이 시작된 것이다


def fits(items, answers):
    """이 묶음이 그 상자의 답과 맞는가.

    상자가 첫 줄이나 끝 줄을 못 읽어 답이 한둘 빠지기도 한다. 그러니 개수가 꼭
    같아야 한다고 보지 않고, 답의 번호가 모두 묶음 안에 있고 묶음의 절반을
    훨씬 넘게 채우는지를 본다. 작은 상자가 큰 묶음을 삼키지 못하게 막는다.
    """
    nos = {str(q["no"]) for q in items}
    if not set(answers) <= nos:
        return False
    return len(answers) >= len(items) * 0.75


def main_book_only(boxes):
    """정답지 뒤쪽에 붙은 워크북 답을 잘라 낸다.

    이 정답지는 본책 답 뒤에 워크북 답을 이어 싣는다. 워크북 쪽 번호가 본책과
    겹쳐서, 그대로 두면 워크북 답이 본책 문항에 붙는다.

    본책 쪽은 앞에서 뒤로 커진다. 한 번 툭 튀는 것은 잘못 읽은 것이니 쪽만
    버리고, 잇따라 뒤로 돌아가면 거기서부터 워크북이다.
    """
    out = []
    top = 0
    back = []
    for b in boxes:
        page = b.get("book_page")
        if page and page < top - BACK:
            back.append(b)
            if len(back) >= RESTART:
                break          # 워크북이 시작됐다 — 여기서 끊는다
            b = dict(b, book_page=None)   # 한 번 튄 것은 잘못 읽은 쪽이다
        elif page:
            back = []
            top = max(top, page)
        out.append(b)
    return out[:len(out) - len(back)] if len(back) < RESTART else out


def main(q_path, a_path, out_path, bad_path=None):
    questions = json.load(open(q_path, encoding="utf-8"))
    boxes = json.load(open(a_path, encoding="utf-8"))

    # 마무리 실전문제는 여러 단원에 걸쳐 있어 넣을 자리가 없다
    questions = [q for q in questions if not FINAL.search(str(q.get("section") or ""))]
    boxes = [b for b in boxes if b.get("kind") != "마무리"]
    # 규칙을 풀어 쓴 글이 발문으로 딸려 온 것은 문제가 아니다
    questions = [q for q in questions
                 if not (EXPLAIN.search(str(q.get("prompt") or ""))
                         and not ASKING.search(str(q.get("prompt") or "")[:40]))]

    blocks = blocks_of(questions)
    first_on = {}
    for i, blk in enumerate(blocks):
        first_on.setdefault(blk["page"], i)

    boxes.sort(key=lambda b: (b["answer_page"], b["order"]))
    boxes = main_book_only(boxes)

    matched, failed = [], []
    used = set()
    at = 0
    last_page = None
    carried = 0
    skip = 0
    for spot_in_list, b in enumerate(boxes):
        if skip:
            skip -= 1
            continue
        answers = b["answers"]
        # 머리말에서 본책 쪽을 읽은 상자만 쓴다. 쪽을 모르면 차례만 믿게 되는데,
        # 한 번 밀리면 그 뒤가 줄줄이 어긋나 엉뚱한 답이 붙는다.
        page = b.get("book_page")
        if page not in first_on and last_page is not None:
            # 「바로 풀리는 실전 문제」 상자에는 머리말에 쪽이 없다. 본책에서 그 문제는
            # 바로 앞 RULE 과 같은 쪽 아래에 있으므로, 앞 상자의 쪽을 그대로 쓴다.
            # 쪽을 옮기지 않으니 차례가 밀려도 엉뚱한 쪽으로 새지 않는다.
            page = last_page
        if page in first_on:
            at = first_on[page]
        else:
            # 쪽을 못 읽은 상자는 쓰지 않는다. 차례만 믿으면 한 번 밀린 뒤로
            # 줄줄이 엉뚱한 답이 붙는데, 붙고 나면 가려낼 길이 없다.
            failed.append({"정답지쪽": b["answer_page"], "본책쪽": b.get("book_page"),
                           "답": len(answers), "까닭": "본책 쪽을 읽지 못함"})
            continue
        # 이 자리부터 답 개수가 맞아떨어지는 묶음을 찾는다.
        # 통합 문제는 한 상자가 본책 두 쪽에 걸치므로 묶음을 이어 붙여서도 본다.
        # 이어 붙인 번호가 1부터 빠짐없이 이어질 때만 한 묶음으로 본다.
        # 통합 문제처럼 답이 많은 묶음은 정답지에서 상자 둘로 쪼개져 있기도 하다.
        # 뒤 상자의 번호가 앞 상자에 이어지면 한 상자로 보고 함께 맞댄다.
        joined = 0
        for extra in range(1, 3):
            nxt = spot_in_list + extra
            if nxt >= len(boxes) or boxes[nxt]["answer_page"] != b["answer_page"]:
                break
            if boxes[nxt].get("book_page") not in (None, page):
                break
            more = boxes[nxt]["answers"]
            if set(more) & set(answers):
                break
            answers = dict(answers, **more)
            joined = extra

        spot = span = None
        stay = page if b.get("book_page") not in first_on else None
        for step in range(REACH + 1):
            i = at + step
            if i >= len(blocks):
                break
            if stay is not None and blocks[i]["page"] != stay:
                break
            if i in used:
                continue
            got = []
            for take in range(1, 4):
                if i + take > len(blocks) or (i + take - 1) in used:
                    break
                got += blocks[i + take - 1]["items"]
                if fits(got, answers):
                    spot, span = i, take
                    break
            if spot is not None:
                break
        if spot is None and joined:
            # 이어 붙여도 안 맞으면 원래 상자만으로 다시 본다
            answers = b["answers"]
            joined = 0
            for step in range(REACH + 1):
                i = at + step
                if i >= len(blocks) or (stay is not None and blocks[i]["page"] != stay):
                    break
                if i in used:
                    continue
                got = []
                for take in range(1, 4):
                    if i + take > len(blocks) or (i + take - 1) in used:
                        break
                    got += blocks[i + take - 1]["items"]
                    if len(got) != len(answers):
                        continue
                    nos = [q["no"] for q in got]
                    if sorted(nos) == list(range(1, len(nos) + 1)):
                        spot, span = i, take
                        break
                if spot is not None:
                    break
        if spot is None:
            failed.append({"정답지쪽": b["answer_page"], "본책쪽": b.get("book_page"),
                           "답": len(answers), "까닭": "개수가 맞는 묶음을 찾지 못함"})
            continue
        skip = joined

        blk = {"page": blocks[spot]["page"],
               "items": [q for k in range(span) for q in blocks[spot + k]["items"]]}
        used.update(range(spot, spot + span))
        at = spot + span
        last_page = blk["page"]
        if b.get("book_page") in first_on:
            carried = 0
        pairs = [(q, answers[str(q["no"])]) for q in blk["items"]
                 if str(q["no"]) in answers]
        if not pairs:
            failed.append({"정답지쪽": b["answer_page"], "본책쪽": blk["page"],
                           "답": len(answers), "까닭": "번호가 맞지 않음"})
            continue
        # 보기 번호가 아닌 답이 하나 섞이면 그 낱말을 잘못 읽은 것이니 그것만 뺀다.
        # 여럿이 어긋나면 상자와 묶음이 어긋난 것이므로 통째로 넘긴다.
        looks = [(q, a) for q, a in pairs if q.get("choices")]
        bad = [1 for q, a in looks if not ok_choice(a, q.get("choices"))]
        if bad and len(bad) > max(1, len(looks) * 0.2):
            failed.append({"정답지쪽": b["answer_page"], "본책쪽": blk["page"],
                           "답": len(answers), "까닭": "보기에 없는 답 %d개" % len(bad)})
            continue
        pairs = [(q, a) for q, a in pairs if ok_choice(a, q.get("choices"))]
        # [A / B] 처럼 고를 것이 정해진 문항은 답이 그 안에 있어야 한다.
        # 몇 개가 어긋나면 그 낱말을 잘못 읽은 것이니 그것만 빼고, 여럿이 어긋나면
        # 상자와 묶음이 어긋난 것이므로 통째로 넘긴다.
        checked = [(q, a) for q, a in pairs if as_gq(q)["picks"]]
        off = [1 for q, a in checked if not in_choices(a, as_gq(q)["picks"])]
        if off and len(off) > max(1, len(checked) * 0.2):
            failed.append({"정답지쪽": b["answer_page"], "본책쪽": blk["page"],
                           "답": len(answers), "까닭": "고를 것 안에 없는 답 %d개" % len(off)})
            continue
        pairs = [(q, a) for q, a in pairs if in_choices(a, as_gq(q)["picks"])]
        # 보기가 없는 문항에 번호만 답으로 왔다면 옆 상자의 답이 섞인 것이다
        pairs = [(q, a) for q, a in pairs
                 if q.get("choices") or not ONLY_NO.match(str(a or "").strip())]
        # 읽다가 어긋난 답은 그것만 뺀다
        pairs = [(q, a) for q, a in pairs if usable(a, as_gq(q))]
        if not pairs:
            failed.append({"정답지쪽": b["answer_page"], "본책쪽": blk["page"],
                           "답": len(answers), "까닭": "읽은 답이 뭉개짐"})
            continue
        for q, a in pairs:
            row = dict(q)
            row["answer"] = a
            matched.append(row)

    Path(out_path).write_text(json.dumps(matched, ensure_ascii=False, indent=1), encoding="utf-8")
    if bad_path:
        Path(bad_path).write_text(json.dumps(failed, ensure_ascii=False, indent=1), encoding="utf-8")

    log = io.open(1, "w", encoding="utf-8", closefd=False)
    total = max(len(questions), 1)
    print("본책 문항 %d개(마무리 뺀 것) 중 답을 붙인 것 %d개 (%d%%)"
          % (len(questions), len(matched), round(len(matched) / total * 100)), file=log)
    why = collections.Counter(f["까닭"] for f in failed)
    for k, n in why.most_common():
        print("   %s: %d상자" % (k, n), file=log)
    log.flush()


if __name__ == "__main__":
    main(*sys.argv[1:5])
