# -*- coding: utf-8 -*-
"""열중 16강 문항과 정답·해설을 맞댄다.

자리는 (단원, 강, 묶음 꼴, 묶음) 으로 하나로 정해진다. 내신 적중 테스트와 서술형
내공 Up 은 단원마다 하나이므로 강을 보지 않는다. 정답지가 적어 둔 본책 쪽으로
한 번 더 검산한다.

이 책은 「빈칸에 알맞은 말을 쓰고, 문장을 해석하시오」 꼴이 많아 답에 우리말 뜻이
함께 적혀 있다. 해석을 묻지 않은 문항이면 뜻풀이는 떼어 낸다.

  python scripts/grammar-bank/yj_match.py 문항.json 답.json 결과.json [어긋난것.json]
"""
import collections, io, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from gq_match import in_choices
from jp_match import as_gq, ok_choice

log = io.open(1, "w", encoding="utf-8", closefd=False)
WIDE = {"내신 적중 테스트", "서술형 내공 Up", "문법정리 OX"}
CIRCLED = "①②③④⑤⑥⑦⑧⑨⑩"


def key_of(row):
    unit = None if row["section"] in WIDE else row.get("unit_no")
    return (row.get("chapter_no"), unit, row["section"], row.get("block"))


def peel(answer, prompt):
    """답에 붙은 우리말 뜻풀이를 떼어 낸다.

    「your, 나는 너의 새로운 머리 모양이 마음에 들어.」 처럼 적혀 있다. 해석을
    묻는 문항이면 그대로 두고, 아니면 영어 답만 남긴다.
    """
    t = re.sub(r"^\s*\d{1,2}\s+", "", str(answer or "").strip())
    if "해석" in str(prompt or "") or "우리말" in str(prompt or ""):
        return t
    if not re.search(r"[가-힣]", t):
        return t
    # 맨 앞 조각이 영어라면 그 뒤의 우리말은 뜻풀이다
    head = re.match(r"^([^,，]*[A-Za-z][^,，]*)[,，]\s*(.*)$", t)
    if head and re.search(r"[가-힣]", head.group(2)):
        return head.group(1).strip()
    return t


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
        where = "단원%s 강%s %s 묶음%s" % (b.get("chapter_no"), b.get("unit_no"),
                                         b["section"], b.get("block"))
        if not items:
            failed.append({"자리": where, "까닭": "그 자리에 문항이 없음"})
            continue
        pages = {p for p in (b.get("pages") or []) if p}
        if pages:
            mine = {q["printed_page"] for q in items if q["printed_page"]}
            lo, hi = min(pages), max(pages) + 3   # 시험은 여러 쪽에 걸친다
            if mine and not any(lo <= p <= hi for p in mine):
                failed.append({"자리": where, "까닭": "쪽이 어긋남 (정답지 %s · 본책 %s)"
                               % (sorted(pages), sorted(mine))})
                continue
        answers = {p["no"]: p for p in b["pieces"]}
        nos = {q["no"] for q in items}
        if not set(answers) & nos:
            failed.append({"자리": where, "까닭": "번호가 하나도 안 맞음"})
            continue
        pairs = [(q, answers[q["no"]]) for q in items if q["no"] in answers]

        looks = [(q, p) for q, p in pairs if q.get("choices")]
        off = [1 for q, p in looks if not ok_choice(peel(p["text"], q["prompt"]), q["choices"])]
        if off and len(off) > max(1, len(looks) * 0.3):
            failed.append({"자리": where, "까닭": "고를 것 밖의 답 %d개" % len(off)})
            continue

        for q, p in pairs:
            a = peel(p["text"], q["prompt"])
            if not (ok_choice(a, q.get("choices")) and in_choices(a, as_gq(q)["picks"]) and fine(a)):
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
    print("문항 %d개 중 답을 붙인 것 %d개 (%d%%) · 해설 %d개 · 검산에 걸려 뺀 답 %d개"
          % (len(questions), len(matched), round(len(matched) / total * 100),
             sum(1 for r in matched if r.get("explanation")), dropped), file=log)
    for k, n in collections.Counter(r["section"] for r in matched).most_common():
        print("   %-18s %d문항" % (k, n), file=log)
    for k, n in collections.Counter(f["까닭"].split(" (")[0] for f in failed).most_common(8):
        print("   ✕ %s: %d묶음" % (k, n), file=log)
    log.flush()


if __name__ == "__main__":
    main(*sys.argv[1:5])
