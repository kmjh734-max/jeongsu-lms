# -*- coding: utf-8 -*-
"""I Love Grammar 문항과 정답을 맞댄다.

자리는 (쪽 꼴, 묶음, 본책 인쇄 쪽) 으로 하나로 정해진다. 정답지가 「p.14」로
본책 쪽을 그대로 적어 두어 짐작할 자리가 없다.

  python scripts/grammar-bank/ilg_match.py 문항.json 답.json 결과.json [어긋난것.json]
"""
import collections, io, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from gq_match import in_choices
from jp_match import as_gq, ok_choice

LOG = io.open(1, "w", encoding="utf-8", closefd=False)


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


def main(q_path, a_path, out_path, bad_path=None):
    questions = json.load(open(q_path, encoding="utf-8"))
    boxes = json.load(open(a_path, encoding="utf-8"))

    blocks = collections.defaultdict(list)
    for q in questions:
        blocks[(q["section"], q["block"], q["printed_page"])].append(q)
    for v in blocks.values():
        v.sort(key=lambda q: q["no"])

    def items_for(b):
        """시험 묶음은 「pp.18-20」처럼 여러 쪽에 걸친다 — 그 안의 문항을 다 모은다"""
        lo, hi = b.get("page"), b.get("upto") or b.get("page")
        if lo is None:
            return None
        got = []
        for p in range(lo, hi + 1):
            got += blocks.get((b["section"], b["block"], p), [])
        return sorted(got, key=lambda q: q["no"]) or None

    matched, failed, dropped = [], [], 0
    for b in boxes:
        items = items_for(b)
        where = "%s 묶음%s p%s" % (b["section"], b["block"], b.get("page"))
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
            if not (ok_choice(a, q.get("choices")) and in_choices(a, as_gq(q)["picks"]) and fine(a)):
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
