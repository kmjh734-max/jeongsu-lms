# -*- coding: utf-8 -*-
"""문제로 풀자 「실전문제 PLUS」 문항과 정답을 맞댄다.

자리는 (단원, 번호) 로 하나로 정해진다. 번호가 단원 안에서 01부터 이어지고,
정답지도 「CHAPTER 01 TEST」 아래 번호별로 적어 두었다.

  python scripts/grammar-bank/mpp_match.py 문항.json 답.json 결과.json [어긋난것.json]
"""
import collections, io, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from gq_match import in_choices
from jp_match import ok_choice

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
PICK = re.compile(r"[\[(]([^\[\]()]*/[^\[\]()]*)[\])]")
ONLY_NO = re.compile(r"^[①-⑩][\s,，①-⑩]*$")
MARKS = re.compile(r"^[①-⑩ⓐ-ⓕ○◦×xXOo✓\s,·]+$")


def as_gq(q):
    text = " ".join(q.get("body") or [])
    return {"text": text, "picks": PICK.findall(text)}


def fine(answer):
    """넣어도 되는 답인가 — 글자층이 살아 있어 가벼이 본다"""
    t = str(answer or "").strip()
    if not t or len(t) > 110:
        return False
    if t.count("[") != t.count("]") or t.count("(") != t.count(")"):
        return False
    if re.search(r"[가-힣]{4}", t) and re.search(r"[A-Za-z]{4}", t):
        return False               # 해설이 섞여 들어온 것이다
    return True


def whole(q):
    """한 문항의 보기만 들어 있는가.

    문항이 칸이나 쪽을 넘어가면 옆 문항의 보기까지 끌려 들어온다. 보기 번호가
    겹치거나 여섯 개를 넘으면 그런 것이다 — 섞인 문항은 넣지 않는다.
    """
    seats = [c["no"] for c in (q.get("choices") or [])]
    return len(seats) <= 6 and len(set(seats)) == len(seats)


def shaped(answer, q):
    """보기가 없는데 답이 번호뿐이면 남의 답이다"""
    return not (ONLY_NO.match(str(answer or "").strip()) and not q.get("choices"))


SMALL = {
    "the", "and", "but", "for", "not", "are", "was", "were", "you", "your",
    "his", "her", "its", "our", "their", "they", "she", "him", "them", "this",
    "that", "these", "those", "there", "here", "with", "from", "into", "than",
    "then", "have", "has", "had", "been", "being", "can", "could", "will",
    "would", "shall", "should", "may", "might", "must", "did", "does", "done",
    "all", "any", "some", "one", "two", "who", "whom", "what", "when", "where",
    "which", "how", "why", "about", "very", "much", "many", "more", "most",
}


def belongs(answer, q):
    """이 답이 이 문항의 답인가 — 글로 쓴 답은 문항에 나온 말을 거의 그대로 쓴다"""
    a = str(answer or "")
    if MARKS.match(a) or len(a) < 3:
        return True
    said = " ".join([str(q.get("prompt") or "")] + (q.get("body") or [])
                    + [c.get("text", "") for c in (q.get("choices") or [])]).lower()
    mine = [w for w in re.findall(r"[a-z]{3,}", a.lower()) if w not in SMALL]
    if not mine:
        return True
    return any(w[:4] in said for w in mine)


def main(q_path, a_path, out_path, bad_path=None):
    questions = json.load(open(q_path, encoding="utf-8"))
    boxes = json.load(open(a_path, encoding="utf-8"))

    seats = collections.defaultdict(dict)
    for q in questions:
        seats[q.get("chapter_no")][q["no"]] = q

    matched, failed, dropped = [], [], collections.Counter()
    for b in boxes:
        here = seats.get(b.get("chapter_no")) or {}
        where = "단원%s" % b.get("chapter_no")
        if not here:
            failed.append({"자리": where, "까닭": "그 단원의 문항이 없음"})
            continue
        pairs = [(here[p["no"]], p["text"]) for p in b["pieces"] if p["no"] in here]
        if not pairs:
            failed.append({"자리": where, "까닭": "번호가 하나도 안 맞음"})
            continue
        # 보기 밖의 답이 흔하면 단원이 어긋난 것이다 — 그 단원은 통째로 버린다
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
            elif not whole(q):
                why = "옆 문항의 보기가 섞였다"
            if why:
                dropped[why] += 1
                continue
            row = dict(q)
            row["answer"] = a.strip()
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
        print("   ✕ %s: %d단원" % (k, n), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(*sys.argv[1:5])
