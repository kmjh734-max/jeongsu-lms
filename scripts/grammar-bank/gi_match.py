# -*- coding: utf-8 -*-
"""Grammar Inside 문항과 정답·해설을 맞댄다.

자리는 (단원, UNIT, 묶음 꼴, 묶음, 번호) 로 하나로 정해진다. 정답지가 적어 둔
본책 쪽(p.24 · pp.34-37)으로 한 번 더 검산한다 — 자리를 잘못 짚으면 쪽이 어긋난다.
Grammar for Writing·Review Test 는 UNIT 없이 단원마다 하나이므로 UNIT 을 안 본다.

  python scripts/grammar-bank/gi_match.py 문항.json 답.json 결과.json [어긋난것.json]
"""
import collections, io, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from gq_match import in_choices, usable
from jp_match import as_gq, ok_choice

log = io.open(1, "w", encoding="utf-8", closefd=False)
WIDE = {"GRAMMAR FOR WRITING", "REVIEW TEST"}
LETTERED = "ⓐⓑⓒⓓⓔⓕ"
CIRCLED = "①②③④⑤⑥"


def as_number(text):
    """CHECK UP 은 답을 ⓐⓑⓒ로 적는다 — 은행은 ①②③을 쓰니 바꿔 둔다"""
    t = str(text or "").strip()
    if t and all(c in LETTERED or c.isspace() or c in ",，" for c in t):
        return "，".join(CIRCLED[LETTERED.index(c)] for c in t if c in LETTERED)
    return t


def key_of(row):
    unit = None if row["section"] in WIDE else row.get("unit_no")
    return (row.get("chapter_no"), unit, row["section"], row.get("block"))


def fine(answer):
    """넣어도 되는 답인가.

    이 책은 정답지에 글자층이 살아 있어 한 낱말씩 눈으로 읽을 일이 없다. 그래서
    그림으로 읽은 책에 쓰던 깐깐한 검산(홑글자·대문자 자국)을 쓰지 않는다 — 그걸
    쓰면 「It’s」·「weren’t」처럼 아포스트로피가 든 멀쩡한 답이 버려진다.

    대신 옆 문항이 딸려 온 자국만 본다.
    """
    t = str(answer or "").strip()
    if not t or len(t) > 90:
        return False
    if t.count("[") != t.count("]") or t.count("(") != t.count(")"):
        return False
    # 한국말 해설이 영어 답에 딸려 온 것
    if re.search(r"[가-힣]{3}", t) and re.search(r"[A-Za-z]{3}", t):
        return False
    return True


def trim(answer):
    """다음 문항 번호가 뒤에 딸려 온 것을 떼어 낸다 (「There are four seasons 2」)"""
    return re.sub(r"\s+\d{1,2}$", "", str(answer or "").strip())


def main(q_path, a_path, out_path, bad_path=None):
    questions = json.load(open(q_path, encoding="utf-8"))
    boxes = json.load(open(a_path, encoding="utf-8"))

    blocks = collections.defaultdict(list)
    for q in questions:
        blocks[key_of(q)].append(q)
    for v in blocks.values():
        v.sort(key=lambda q: q["no"])

    matched, failed, dropped = [], [], 0
    for b in boxes:
        items = blocks.get(key_of(b))
        where = "단원%s UNIT%s %s 묶음%s" % (b.get("chapter_no"), b.get("unit_no"),
                                           b["section"], b.get("block"))
        if not items:
            failed.append({"자리": where, "까닭": "그 자리에 문항이 없음"})
            continue
        # 정답지가 적어 둔 본책 쪽과 맞는지 본다
        pages = set(b.get("pages") or [])
        if pages:
            mine = {q["printed_page"] for q in items}
            lo, hi = min(pages), max(pages)
            if not any(lo <= p <= hi for p in mine):
                failed.append({"자리": where, "까닭": "쪽이 어긋남 (정답지 %s · 본책 %s)"
                               % (sorted(pages), sorted(mine))})
                continue
        answers = {p["no"]: {**p, "text": as_number(trim(p["text"]))} for p in b["pieces"]}
        nos = {q["no"] for q in items}
        if not set(answers) & nos:
            failed.append({"자리": where, "까닭": "번호가 하나도 안 맞음"})
            continue
        pairs = [(q, answers[q["no"]]) for q in items if q["no"] in answers]

        # 고를 것이 정해진 문항은 답이 그 안에 있어야 한다
        looks = [(q, p) for q, p in pairs if q.get("choices") or as_gq(q)["picks"]]
        off = [1 for q, p in looks
               if not ok_choice(p["text"], q.get("choices")) or not in_choices(p["text"], as_gq(q)["picks"])]
        if off and len(off) > max(1, len(looks) * 0.3):
            failed.append({"자리": where, "까닭": "고를 것 밖의 답 %d개" % len(off)})
            continue

        for q, p in pairs:
            a = p["text"]
            if not (ok_choice(a, q.get("choices")) and in_choices(a, as_gq(q)["picks"])
                    and fine(a)):
                dropped += 1
                continue
            row = dict(q)
            row["answer"] = a
            if p.get("why"):
                row["explanation"] = p["why"]
            matched.append(row)

    Path(out_path).write_text(json.dumps(matched, ensure_ascii=False, indent=1), encoding="utf-8")
    if bad_path:
        Path(bad_path).write_text(json.dumps(failed, ensure_ascii=False, indent=1), encoding="utf-8")

    total = max(len(questions), 1)
    withwhy = sum(1 for r in matched if r.get("explanation"))
    print("문항 %d개 중 답을 붙인 것 %d개 (%d%%) · 해설 %d개 · 검산에 걸려 뺀 답 %d개"
          % (len(questions), len(matched), round(len(matched) / total * 100), withwhy, dropped),
          file=log)
    for k, n in collections.Counter(r["section"] for r in matched).most_common():
        print("   %-22s %d문항" % (k, n), file=log)
    for k, n in collections.Counter(f["까닭"].split(" (")[0] for f in failed).most_common(8):
        print("   ✕ %s: %d묶음" % (k, n), file=log)
    log.flush()


if __name__ == "__main__":
    main(*sys.argv[1:5])
