# -*- coding: utf-8 -*-
"""문마중 문항과 정답을 맞댄다.

본책과 정답지 모두 글자층이 살아 있어, (POINT 번호, 묶음, 문항 번호)가 양쪽에
그대로 있다. 그림으로 읽을 일이 없으므로 짐작할 자리도 없다.

그래도 정답지 쪽(p.56)과 본책 인쇄 쪽을 맞춰 한 번 더 확인한다 — POINT 번호는
단원마다 1부터 다시 시작해서, 쪽을 안 보면 다른 단원의 같은 번호에 붙는다.

  python scripts/grammar-bank/mj_match.py 문항.json 답.json 결과.json [어긋난것.json]
"""
import collections, io, json, re, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from gq_match import in_choices, usable
from jp_match import as_gq, ok_choice

log = io.open(1, "w", encoding="utf-8", closefd=False)


def main(q_path, a_path, out_path, bad_path=None):
    questions = json.load(open(q_path, encoding="utf-8"))
    boxes = json.load(open(a_path, encoding="utf-8"))

    blocks = collections.defaultdict(list)
    for q in questions:
        blocks[(q["point_no"], q["printed_page"], q["block"])].append(q)
    for v in blocks.values():
        v.sort(key=lambda q: q["no"])

    matched, failed, dropped = [], [], 0
    for b in boxes:
        # 한 쪽에 POINT 가 둘 있기도 하다 — POINT 번호까지 맞춰야 딴 자리에 안 붙는다
        items = blocks.get((b["point_no"], b.get("book_page"), b["block"]))
        if not items:
            failed.append({"POINT": b["point_no"], "본책쪽": b.get("book_page"),
                           "묶음": b["block"], "까닭": "그 자리에 문항이 없음"})
            continue
        answers = {str(p["no"]): p["text"] for p in b["pieces"]}
        nos = {str(q["no"]) for q in items}
        if not set(answers) & nos:
            failed.append({"POINT": b["point_no"], "본책쪽": b.get("book_page"),
                           "묶음": b["block"], "까닭": "번호가 하나도 안 맞음"})
            continue
        pairs = [(q, answers[str(q["no"])]) for q in items if str(q["no"]) in answers]

        # 고를 것이 정해진 문항은 답이 그 안에 있어야 한다 — 자리를 잘못 짚었는지 본다
        looks = [(q, a) for q, a in pairs if q.get("choices") or as_gq(q)["picks"]]
        off = [1 for q, a in looks
               if not ok_choice(a, q.get("choices")) or not in_choices(a, as_gq(q)["picks"])]
        if off and len(off) > max(1, len(looks) * 0.3):
            failed.append({"POINT": b["point_no"], "본책쪽": b.get("book_page"),
                           "묶음": b["block"], "까닭": "고를 것 밖의 답 %d개" % len(off)})
            continue

        keep = [(q, a) for q, a in pairs
                if ok_choice(a, q.get("choices")) and in_choices(a, as_gq(q)["picks"])
                and usable(a, as_gq(q))]
        dropped += len(pairs) - len(keep)
        for q, a in keep:
            row = dict(q)
            row["answer"] = a
            matched.append(row)

    Path(out_path).write_text(json.dumps(matched, ensure_ascii=False, indent=1), encoding="utf-8")
    if bad_path:
        Path(bad_path).write_text(json.dumps(failed, ensure_ascii=False, indent=1), encoding="utf-8")

    total = max(len(questions), 1)
    print("문마중 문항 %d개 중 답을 붙인 것 %d개 (%d%%) · 검산에 걸려 뺀 답 %d개"
          % (len(questions), len(matched), round(len(matched) / total * 100), dropped), file=log)
    for k, n in collections.Counter(f["까닭"] for f in failed).most_common():
        print("   %s: %d묶음" % (k, n), file=log)
    log.flush()


if __name__ == "__main__":
    main(*sys.argv[1:5])
