# -*- coding: utf-8 -*-
"""워크북 문항과 정답지 뒤쪽(워크북 답)을 맞댄다.

정답지 상자 머리를 보면 자리가 그대로 적혀 있다.

    CHAPTER 1 명사와 관사  01 셀 수 있는 명사  RULE  p 2   A   ← 쪽이 적힌 머리
    … 앞 상자 꼬리 …                                        B   ← 같은 쪽의 다음 묶음
    … 앞 상자 꼬리 …                                        C

쪽은 묶음 A에만 적혀 있고 B·C는 물려받는다. 워크북 쪽 짜임도 똑같이 A·B·C이므로
(쪽, 묶음글자) 하나로 못이 박힌다. 예전처럼 앞에서 뒤로 짚어 갈 일이 없어,
한 군데가 어긋나도 뒤가 줄줄이 밀리지 않는다.

검산은 본책과 같다 — 번호·보기·뭉개진 답을 본다. 여기에 「괄호 안 낱말」 검산을
더한다.

  python scripts/grammar-bank/jp_wb_match.py 문항.json 상자.json 결과.json [어긋난것.json]
"""
import collections, io, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from gq_match import in_choices, usable
from jp_match import as_gq, ok_choice

log = io.open(1, "w", encoding="utf-8", closefd=False)

PAGEREF = re.compile(r"[pP]{1,2}\s*\.?\s*(\d{1,3})")
RULE = re.compile(r"R\s?U\s?[LI]\s?E", re.I)
LETTER = re.compile(r"(?<![A-Za-z])([A-D])[\s.:]*$")
# 「… (drop)」·「… (a, soup)」처럼 쓸 낱말이 주어진 문항 — 답에 그 낱말이 있어야 한다
GIVEN = re.compile(r"\(([A-Za-z][A-Za-z ,'’/\-]{0,64})\)")


def stem(word):
    """굴절을 걷어낸 몸통. dropped→drop 처럼 겹자음도 되돌린다."""
    flat = word.lower().strip(" .,'")
    for tail in ("ing", "ies", "ed", "es", "s"):
        if len(flat) > len(tail) + 2 and flat.endswith(tail):
            flat = flat[: -len(tail)]
            break
    if len(flat) > 3 and flat[-1] == flat[-2] and flat[-1] not in "aeiou":
        flat = flat[:-1]          # dropp → drop
    return flat


def uses_given(question, answer):
    """쓸 낱말이 주어졌으면 답이 그 낱말을 써야 한다.

    「She _____ her phone yesterday. (drop)」에 'moved' 가 붙는 일을 막는다.
    주어진 낱말이 없으면 따지지 않는다.
    """
    # 「… (curious, be)」는 우리말 물음 끝에 붙기도 하고 영어 본문에 붙기도 한다
    body = " ".join([question.get("prompt") or ""]
                    + [str(b) for b in (question.get("body") or [])])
    hit = None
    for m in GIVEN.finditer(body):
        hit = m
    if not hit:
        return True
    want = [w for w in re.split(r"[,/\s]+", hit.group(1)) if len(w) > 1]
    # 낱말이 넷을 넘으면 주어진 낱말이 아니라 딴 글이다
    if not want or len(want) > 6:
        return True
    got = [stem(w) for w in re.findall(r"[A-Za-z']+", str(answer))]
    if not got:
        return False
    hit = sum(1 for w in want if stem(w) in got)
    # 「올바르게 배열하시오」는 준 낱말만으로 문장을 만드는 것이니 하나도 빠질 수
    # 없다. 그 밖에는 꼴이 바뀌어 사라지기도 하므로(be → Aren't) 절반만 본다.
    if "배열" in (question.get("prompt") or ""):
        return hit == len(want)
    return hit >= (len(want) + 1) // 2


def as_written(question, answer):
    """고를 것 안에 있는 답이면 문항에 적힌 그대로의 대소문자를 쓴다.

    문장 가운데 들어갈 말인데도 정답지 글자를 크게 읽어 「On」·「Or」로 나오는
    일이 있다. 고를 것에 「on」이라 적혀 있으면 그쪽을 따른다.
    """
    flat = str(answer).strip()
    for pick in re.split(r"\s*/\s*", " / ".join(as_gq(question)["picks"])):
        if pick.strip() and pick.strip().lower() == flat.lower():
            return pick.strip()
    return answer


def from_bank(question, answer):
    """「<보기>에서 골라」 문항이면 답이 <보기> 안의 말이어야 한다."""
    bank = question.get("bank") or []
    if not bank or "보기" not in (question.get("prompt") or ""):
        return True
    got = {stem(w) for w in re.findall(r"[A-Za-z']+", str(answer))}
    return any(stem(w) in got for w in bank)


def lexicon(*paths):
    """문제집에 나온 영어 낱말을 모두 거둔다.

    OCR이 「are loved」를 「areloved」로 붙여 읽는 일이 잦다. 문제집 어디에도 없는
    낱말이 답에 섞였다면 잘못 읽은 것이다. 바깥 자료를 쓰지 않고 책 자체로 본다.
    """
    words = set()
    for path in paths:
        for q in json.load(open(path, encoding="utf-8")):
            text = " ".join([q.get("prompt") or ""]
                            + [str(b) for b in (q.get("body") or [])]
                            + [c["text"] for c in (q.get("choices") or [])]
                            + list(q.get("bank") or []))
            for w in re.findall(r"[A-Za-z][A-Za-z'’\-]*", text):
                words.add(w.lower())
                words.add(stem(w))
    return words


def known(answer, words):
    """답에 든 낱말이 모두 책에 있는 말이어야 한다."""
    if re.search(r"[가-힣]", str(answer)):
        return False              # 우리말 답은 OCR을 믿기 어렵다 — 넣지 않는다
    for w in re.findall(r"[A-Za-z][A-Za-z'’\-]*", str(answer)):
        if len(w) < 3:
            continue
        if w.lower() not in words and stem(w) not in words:
            return False
    return True


def spots(boxes, pages, shift):
    """정답지 상자마다 (워크북 쪽, 묶음번호)를 붙인다.

    워크북 쪽마다 「Answer p. 36」이 적혀 있고, 정답지 상자도 제 쪽을 안다. 그래서
    한 정답지 쪽에 실릴 워크북 쪽이 어느 것들인지 미리 안다. 묶음 A가 나올 때마다
    그 가운데 다음 쪽으로 넘어가고, B·C는 물려받는다.

    쪽마다 다시 맞추므로 한 군데가 어긋나도 그 쪽 안에서 끝난다.
    `pages` 는 (워크북 쪽, 정답지 쪽) 목록, 쪽 차례대로.
    """
    order = {p: i for i, (p, _ap) in enumerate(pages)}
    boxes = sorted(boxes, key=lambda b: (b["answer_page"], b["rect"][1]))

    out = []
    at = -1
    for b in boxes:
        head = re.sub(r"\s+", " ", b.get("head") or "").strip()
        mark = LETTER.search(head)
        if not mark:
            continue                      # 통합·마무리 상자 — 단원이 없어 버린다
        block = ord(mark.group(1)) - ord("A")
        if block == 0:
            told = PAGEREF.findall(head)
            got = int(told[-1]) + shift if told and RULE.search(head) else None
            if got is not None and got in order:
                at = order[got]           # 머리에 쪽이 적혀 있다 — 그대로 못 박는다
            else:
                # 이 정답지 쪽이 맡은 워크북 쪽 가운데, 아직 안 쓴 다음 것
                nxt = [i for (p, ap), i in
                       ((pages[i], i) for i in range(len(pages)))
                       if i > at and ap == b["answer_page"]]
                at = nxt[0] if nxt else at + 1
        if not 0 <= at < len(pages):
            continue
        answers = {str(p["no"]): p["text"] for p in b["pieces"]}
        if answers:
            out.append((pages[at][0], block, b, answers))
    return out


def main(q_path, box_path, out_path, bad_path=None):
    questions = json.load(open(q_path, encoding="utf-8"))
    boxes = json.load(open(box_path, encoding="utf-8"))

    first_page = min(q["answer_page"] for q in questions if q.get("answer_page"))
    boxes = [b for b in boxes if b["answer_page"] >= first_page]

    blocks = collections.defaultdict(list)
    for q in questions:
        blocks[(q["printed_page"], q.get("block", 0))].append(q)
    for v in blocks.values():
        v.sort(key=lambda q: q["no"])

    words = lexicon(q_path)

    told = {}
    for q in questions:
        if q.get("answer_page"):
            told.setdefault(q["printed_page"], q["answer_page"])
    pages = sorted(told.items())

    # 워크북 PDF 쪽과 책에 찍힌 쪽은 앞표지만큼 어긋나 있다. 번호까지 그대로
    # 맞아떨어지는 상자가 가장 많은 어긋남을 골라 쓴다.
    def hits(shift):
        n = 0
        for page, block, _b, answers in spots(boxes, pages, shift):
            items = blocks.get((page, block))
            if items and set(answers) == {str(q["no"]) for q in items}:
                n += 1
        return n

    shift = max(range(0, 5), key=hits)
    placed = spots(boxes, pages, shift)
    print("워크북 쪽 어긋남 +%d · 자리 붙은 상자 %d개 가운데 번호까지 맞는 것 %d개"
          % (shift, len(placed), hits(shift)), file=log)

    matched, failed, dropped = [], [], 0
    for page, block, b, answers in placed:
        items = blocks.get((page, block))
        if not items:
            failed.append({"워크북쪽": page, "묶음": block, "답": len(answers),
                           "까닭": "그 자리에 문항이 없음"})
            continue
        nos = {str(q["no"]) for q in items}
        # 번호가 하나라도 어긋나면 자리를 잘못 짚은 것이다. 답 몇 개가 빠졌을
        # 뿐인 상자도 섞여 있지만, 받아들여 보니 남의 묶음 답이 함께 딸려 들어와
        # 열에 서넛이 틀렸다. 번호가 그대로 같을 때만 쓴다.
        if set(answers) != nos:
            failed.append({"워크북쪽": page, "묶음": block, "답": len(answers),
                           "까닭": "번호가 문항과 다름"})
            continue

        pairs = [(q, answers[str(q["no"])]) for q in items if str(q["no"]) in answers]

        # 한 상자는 한 묶음이다. 그 안에서 하나라도 검산에 걸리면 자리를 잘못
        # 짚었다는 뜻이므로, 남은 답도 믿을 수 없다 — 상자째 버린다. 걸러 내고
        # 나머지를 쓰면 엉뚱한 묶음의 답이 그럴듯한 것만 남아서 섞여 들어간다.
        # 검산에는 두 갈래가 있다.
        #  · 자리를 잘못 짚었다는 신호(보기·<보기>·괄호 낱말)는 그 상자 전체를
        #    믿을 수 없다는 뜻이므로 통째로 버린다.
        #  · 잘못 읽었다는 신호(뭉개진 글자, 책에 없는 낱말)는 그 답 하나만의
        #    일이므로 그것만 빼고 나머지는 쓴다.
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
            keep = [(q, a) for q, a in pairs
                    if usable(a, as_gq(q)) and known(a, words)]
            if len(keep) < len(pairs) * 0.5:
                why = "잘못 읽은 답이 절반을 넘음"
            else:
                dropped += len(pairs) - len(keep)
                pairs = keep
        if why:
            failed.append({"워크북쪽": page, "묶음": block, "답": len(answers),
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
    why = collections.Counter(f["까닭"] for f in failed)
    for k, n in why.most_common():
        print("   %s: %d상자" % (k, n), file=log)
    log.flush()


if __name__ == "__main__":
    main(*sys.argv[1:5])
