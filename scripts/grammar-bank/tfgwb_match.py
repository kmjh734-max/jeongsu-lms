# -*- coding: utf-8 -*-
"""Time for Grammar 워크북 문항과 정답을 맞댄다.

워크북에는 쪽 번호가 없다. 그런데 쪽머리에 단원 이름이 영어로 적혀 있고 정답지도
「Past Tense of General Verbs  pp.10~11」로 그 이름을 적어 두어, (단원 이름,
묶음 차례, 번호) 로 자리가 정해진다. 이름은 줄바꿈·띄어쓰기가 조금씩 다르므로
글자만 남겨 견준다.

  python scripts/grammar-bank/tfgwb_match.py 문항.json 답.json 결과.json [어긋난것.json]
"""
import collections, io, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from gq_match import in_choices
from jp_match import ok_choice
from tfg_match import SMALL, belongs, fine, shaped, trim

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
PICK = re.compile(r"[\[(]([^\[\]()]*/[^\[\]()]*)[\])]")


def as_gq(q):
    text = " ".join(q.get("body") or [])
    return {"text": text, "picks": PICK.findall(text)}


ONE = re.compile(r"^[a-fA-F]$")


def answerable(answer, q):
    """학생이 풀 수 있는 문항인가.

    「보기에서 골라 기호를 쓰시오」·「바르게 연결하시오」는 답이 a~f 글자 하나인데,
    고를 보기가 묶음의 다른 자리(보기 상자, 오른쪽 줄)에 있어 문항만 떼어 오면
    고를 거리가 없다. 그런 문항은 넣지 않는다.
    """
    if not ONE.match(str(answer or "").strip()):
        return True
    said = " ".join(q.get("body") or [])
    return len(__import__("re").findall(r"[a-f]\.", said)) >= 3


def flat(name):
    """이름을 견주기 좋게 — 글자만 남기고 작은 글자로"""
    return re.sub(r"[^a-z0-9]", "", str(name or "").lower())


def align(mine, theirs):
    """묶음 차례가 양쪽에서 어긋날 수 있어, 번호 꼴이 같은 것끼리 세워 맞춘다.

    문항 쪽은 지시문이 바뀔 때마다 묶음을 세고, 정답지 쪽은 번호가 1로 돌아갈
    때마다 센다. 한쪽에서 묶음이 하나 더 잡히면 그 뒤가 줄줄이 밀리므로, 차례는
    지키면서 번호 꼴이 맞는 자리끼리만 짝지운다.
    """
    def fits(q, a):
        return q and a and q <= a and max(q) == max(a)

    m, n = len(mine), len(theirs)
    score = [[0] * (n + 1) for _ in range(m + 1)]
    for i in range(1, m + 1):
        for j in range(1, n + 1):
            same = 1 if fits(mine[i - 1][1], theirs[j - 1][1]) else 0
            score[i][j] = max(score[i - 1][j], score[i][j - 1],
                              score[i - 1][j - 1] + same)
    pairs, i, j = [], m, n
    while i > 0 and j > 0:
        same = 1 if fits(mine[i - 1][1], theirs[j - 1][1]) else 0
        if same and score[i][j] == score[i - 1][j - 1] + 1:
            pairs.append((mine[i - 1][0], theirs[j - 1][0]))
            i -= 1
            j -= 1
        elif score[i - 1][j] >= score[i][j - 1]:
            i -= 1
        else:
            j -= 1
    return dict(pairs)


def main(q_path, a_path, out_path, bad_path=None):
    questions = json.load(open(q_path, encoding="utf-8"))
    boxes = json.load(open(a_path, encoding="utf-8"))

    # 단원마다 묶음을 차례대로 세워 맞춘다
    qside = collections.defaultdict(dict)
    for q in questions:
        qside[flat(q.get("unit"))].setdefault(q["block"], []).append(q)
    aside = collections.defaultdict(dict)
    for i, b in enumerate(boxes):
        aside[flat(b.get("unit"))][i] = b

    pair = {}
    for unit, blocks in qside.items():
        mine = [(k, {q["no"] for q in v}) for k, v in sorted(blocks.items())]
        theirs = [(k, {p["no"] for p in b["pieces"]})
                  for k, b in sorted(aside.get(unit, {}).items())]
        for qk, ak in align(mine, theirs).items():
            pair[(unit, ak)] = qk

    seats = collections.defaultdict(dict)
    for q in questions:
        seats[(flat(q.get("unit")), q["block"])][q["no"]] = q

    matched, failed, dropped = [], [], collections.Counter()
    for i, b in enumerate(boxes):
        unit = flat(b.get("unit"))
        if (unit, i) not in pair:
            failed.append({"자리": "%s 묶음%s" % (str(b.get("unit"))[:26], b["block"]),
                           "까닭": "번호 꼴이 맞는 묶음이 없음"})
            continue
        here = seats.get((unit, pair[(unit, i)])) or {}
        where = "%s 묶음%s" % (str(b.get("unit"))[:26], b["block"])
        if not here:
            failed.append({"자리": where, "까닭": "그 자리에 문항이 없음"})
            continue
        pairs = [(here[p["no"]], trim(p["text"])) for p in b["pieces"] if p["no"] in here]
        if not pairs:
            failed.append({"자리": where, "까닭": "번호가 하나도 안 맞음"})
            continue
        looks = [(q, a) for q, a in pairs if q.get("choices")]
        off = [1 for q, a in looks if not ok_choice(a, q["choices"])]
        if off and len(off) > max(1, len(looks) * 0.3):
            failed.append({"자리": where, "까닭": "고를 것 밖의 답 %d개" % len(off)})
            continue
        for q, a in pairs:
            why = None
            if not ok_choice(a, q.get("choices")):
                why = "보기 밖의 답"
            elif not in_choices(a, as_gq(q)["picks"]):
                why = "괄호 밖의 답"
            elif not fine(a):
                why = "답 모양이 이상하다"
            elif not belongs(a, q):
                why = "문항과 겹치는 말이 없다"
            elif not shaped(a, q):
                why = "보기 없는데 번호만 적혔다"
            elif not answerable(a, q):
                why = "고를 보기가 문항에 없다"
            if why:
                dropped[why] += 1
                continue
            row = dict(q)
            row["answer"] = a
            row["pages"] = b.get("pages")
            matched.append(row)

    Path(out_path).write_text(json.dumps(matched, ensure_ascii=False, indent=1), encoding="utf-8")
    if bad_path:
        Path(bad_path).write_text(json.dumps(failed, ensure_ascii=False, indent=1), encoding="utf-8")

    total = max(len(questions), 1)
    print("문항 %d개 중 답을 붙인 것 %d개 (%d%%)"
          % (len(questions), len(matched), round(len(matched) / total * 100)), file=LOG)
    for k, n in dropped.most_common():
        print("   검산에 걸려 뺌 — %s: %d개" % (k, n), file=LOG)
    for k, n in collections.Counter(f["까닭"].split(" (")[0] for f in failed).most_common(5):
        print("   ✕ %s: %d묶음" % (k, n), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(*sys.argv[1:5])
