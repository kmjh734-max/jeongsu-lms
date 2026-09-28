# -*- coding: utf-8 -*-
"""같은 문제가 다른 회차에 또 실린 경우, 이미 만든 변형을 그대로 옮긴다.

족보 파일은 체크체크·확인문제·종합문제에 똑같은 문항을 거듭 싣는다.
발문·본문·보기·정답이 글자 하나까지 같으면 같은 문제이므로,
먼저 만들어 둔 변형을 그 문항에도 붙여 준다.
"""
import json, sys
from pathlib import Path


def sig(q, choices_key="choices"):
    return (q["prompt"].strip(),
            tuple(x.strip() for x in q["body"]),
            (q["answer"] or "").strip(),
            tuple(c["text"].strip() for c in q[choices_key]))


def main(bank_path, variants_path):
    bank = json.loads(Path(bank_path).read_text(encoding="utf-8"))
    made = json.loads(Path(variants_path).read_text(encoding="utf-8"))
    by_origin = {}
    for v in made:
        by_origin.setdefault((v["origin_file"], v["origin_number"]), v)

    seen = {}
    for q in bank:
        v = by_origin.get((q["file"], q["number"]))
        if v:
            seen.setdefault(sig(q), v)

    added = 0
    for q in bank:
        if (q["file"], q["number"]) in by_origin:
            continue
        v = seen.get(sig(q))
        if not v:
            continue
        copy = dict(v)
        copy.update({
            "origin_ref": q["source_ref"],
            "origin_file": q["file"], "origin_number": q["number"],
            "level": q["level"], "level_name": q["level_name"],
            "chapter_no": q["chapter_no"], "chapter": q["chapter"],
            "kind": q["kind"], "round": q["round"],
            "question_kind": q["question_kind"],
            "difficulty": q.get("difficulty"),
            "badges": q.get("badges", []),
        })
        made.append(copy)
        added += 1

    Path(variants_path).write_text(json.dumps(made, ensure_ascii=False), encoding="utf-8")
    print("같은 문제에 변형을 옮겨 붙인 것 %d개" % added)
    print("변형 전체 %d개" % len(made))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
