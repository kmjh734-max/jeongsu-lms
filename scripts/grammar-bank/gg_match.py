# -*- coding: utf-8 -*-
"""Good Grammar(YBM) 문항과 정답을 맞댄다.

자리는 (쪽 꼴, 묶음, 본책 인쇄 쪽) 으로 하나로 정해진다. 정답지가 「p. 14」로
본책 쪽을 그대로 적어 두어 짐작할 자리가 없다.

  python scripts/grammar-bank/gg_match.py 문항.json 답.json 결과.json [어긋난것.json]
"""
import collections, io, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from gq_match import in_choices
from jp_match import ok_choice

# 이 책은 고를 말을 「( A / B )」 괄호로 적는다. 대괄호만 보는 눈으로는 답이
# 괄호 밖이어도 그냥 지나가, 엉뚱한 답이 붙은 채로 들어간다.
PICK = re.compile(r"[\[(]([^\[\]()]*/[^\[\]()]*)[\])]")


def as_gq(q):
    text = " ".join(q.get("body") or [])
    return {"text": text, "picks": PICK.findall(text)}

LOG = io.open(1, "w", encoding="utf-8", closefd=False)


def clear(answer, q):
    """답의 낱말이 붙어 버리지 않았는가.

    정답지에서 두 낱말이 붙어 「roadthey, which」처럼 들어오는 데가 있다. 문항에
    없는 긴 영어 덩어리는 그렇게 뭉개진 것이다.
    """
    said = " ".join([str(q.get("prompt") or "")] + (q.get("body") or [])
                    + [c.get("text", "") for c in (q.get("choices") or [])]).lower()
    import re as _re
    for word in _re.findall(r"[a-z]{10,}", str(answer or "").lower()):
        if word not in said:
            return False
    return True


def fine(answer):
    """넣어도 되는 답인가 — 글자층이 살아 있어 가벼이 본다"""
    t = str(answer or "").strip()
    if not t or len(t) > 90:
        return False
    if t.count("[") != t.count("]") or t.count("(") != t.count(")"):
        return False
    if re.search(r"[가-힣]{3}", t) and re.search(r"[A-Za-z]{3}", t):
        return False
    return True


def trim(answer):
    return re.sub(r"\s+\d{1,2}$", "", str(answer or "").strip())


MARKS = re.compile(r"^[①-⑩○◦×xXOo✓\s,·]+$")


def belongs(answer, q):
    """이 답이 이 문항의 답인가 — 낱말이 하나도 안 겹치면 남의 답이다.

    번호가 조금만 어긋나도 옆 문항의 답이 붙는데, 보기가 없는 문항은 그것을
    가릴 길이 없다. 그런데 이 책의 답은 거의 다 문항에 나온 말(또는 괄호 안에
    준 말)을 그대로 쓴다. 그러니 겹치는 말이 하나도 없으면 버린다.
    """
    a = str(answer or "")
    if MARKS.match(a) or len(a) < 2:
        return True                      # ○·×·①~⑤ 같은 표시는 견줄 거리가 없다
    said = " ".join([str(q.get("prompt") or "")] + (q.get("body") or [])
                    + [c.get("text", "") for c in (q.get("choices") or [])]).lower()
    mine = [w for w in re.findall(r"[a-z]{3,}", a.lower()) if w not in SMALL]
    if not mine:
        return True                      # 한국말만 적힌 답은 뜻으로 가려야 하므로 두고 본다
    return any(w[:4] in said for w in mine)


# 어느 문장에나 있는 말 — 겹친다고 해서 같은 문항이라는 자국이 되지 못한다
SMALL = {
    "the", "and", "but", "for", "not", "are", "was", "were", "you", "your",
    "his", "her", "its", "our", "their", "they", "she", "him", "them", "this",
    "that", "these", "those", "there", "here", "with", "from", "into", "than",
    "then", "have", "has", "had", "been", "being", "can", "could", "will",
    "would", "shall", "should", "may", "might", "must", "did", "does", "done",
    "all", "any", "some", "one", "two", "who", "whom", "what", "when", "where",
    "which", "how", "why", "about", "very", "much", "many", "more", "most",
    "too", "also", "just", "only", "own", "same", "other", "others",
}


def main(q_path, a_path, out_path, bad_path=None):
    questions = json.load(open(q_path, encoding="utf-8"))
    boxes = json.load(open(a_path, encoding="utf-8"))

    # 쪽 번호가 권마다 비어 있는 데가 있어, 「실력 다지기」가 나온 차례로 맞춘다.
    # 본책과 정답지가 같은 차례로 적혀 있다.
    seats = collections.defaultdict(list)
    for q in questions:
        seats[(q.get("seq"), q["section"], q["block"])].append(q)
    for v in seats.values():
        v.sort(key=lambda q: q["no"])

    def items_for(b):
        return seats.get((b.get("seq"), b["section"], b["block"])) or None

    matched, failed, dropped = [], [], 0
    for b in boxes:
        items = items_for(b)
        where = "p%s %s 묶음%s" % (b.get("page"), b["section"], b["block"])
        if not items:
            failed.append({"자리": where, "까닭": "그 자리에 문항이 없음"})
            continue
        answers = {p["no"]: trim(p["text"]) for p in b["pieces"]}
        if not set(answers) & {q["no"] for q in items}:
            failed.append({"자리": where, "까닭": "번호가 하나도 안 맞음"})
            continue
        pairs = [(q, answers[q["no"]]) for q in items if q["no"] in answers]

        looks = [(q, a) for q, a in pairs if q.get("choices")]
        off = [1 for q, a in looks if not ok_choice(a, q["choices"])]
        if off and len(off) > max(1, len(looks) * 0.3):
            failed.append({"자리": where, "까닭": "고를 것 밖의 답 %d개" % len(off)})
            continue

        for q, a in pairs:
            if not (ok_choice(a, q.get("choices")) and in_choices(a, as_gq(q)["picks"])
                    and fine(a) and clear(a, q) and belongs(a, q)):
                dropped += 1
                continue
            row = dict(q)
            row["answer"] = a
            matched.append(row)

    Path(out_path).write_text(json.dumps(matched, ensure_ascii=False, indent=1), encoding="utf-8")
    if bad_path:
        Path(bad_path).write_text(json.dumps(failed, ensure_ascii=False, indent=1), encoding="utf-8")

    total = max(len(questions), 1)
    print("문항 %d개 중 답을 붙인 것 %d개 (%d%%) · 검산에 걸려 뺀 답 %d개"
          % (len(questions), len(matched), round(len(matched) / total * 100), dropped), file=LOG)
    for k, n in collections.Counter(r["section"] for r in matched).most_common():
        print("   %-20s %d문항" % (k, n), file=LOG)
    for k, n in collections.Counter(f["까닭"].split(" (")[0] for f in failed).most_common(6):
        print("   ✕ %s: %d묶음" % (k, n), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(*sys.argv[1:5])
