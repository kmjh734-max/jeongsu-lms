# -*- coding: utf-8 -*-
"""손으로 쓴 변형을 문제 은행에 합친다.

규칙으로는 못 바꾸는 문항 — 영작·서술형처럼 모든 낱말이 정답의 일부인 것들 —
은 사람이 문장을 보고 새로 쓴다. 그 결과를 여기서 합친다.
"""
import json, sys
from pathlib import Path

HERE = Path(__file__).parent / "handmade"


def load_all():
    rows = []
    for path in sorted(HERE.glob("*.json")):
        data = json.loads(path.read_text(encoding="utf-8"))
        for row in data["문항"]:
            row["_출처파일"] = path.name
            rows.append(row)
    return rows


def main(bank_path, variants_path):
    bank = json.loads(Path(bank_path).read_text(encoding="utf-8"))
    made = json.loads(Path(variants_path).read_text(encoding="utf-8"))
    index = {(q["file"], q["number"]): q for q in bank}
    already = {(r["origin_file"], r["origin_number"]) for r in made}

    added, missing, dup = 0, [], 0
    for row in load_all():
        key = (row["file"], row["number"])
        if key not in index:
            missing.append(key)
            continue
        if key in already:
            dup += 1
            continue
        origin = index[key]
        made.append({
            "origin_ref": origin["source_ref"],
            "origin_file": origin["file"], "origin_number": origin["number"],
            "level": origin["level"], "level_name": origin["level_name"],
            "chapter_no": origin["chapter_no"], "chapter": origin["chapter"],
            "kind": origin["kind"], "round": origin["round"],
            "question_kind": origin["question_kind"],
            "difficulty": origin.get("difficulty"),
            "badges": origin.get("badges", []),
            "caution": None,
            "changes": ["손으로 새로 씀 — " + row["포인트"]],
            "table": {}, "flipped": False, "handmade": True,
            "prompt": row["prompt"], "body": row["body"],
            "choices": [{"no": i + 1, "text": t}
                        for i, t in enumerate(row.get("choices", []))],
            "answer": row["answer"], "explanation": row.get("explanation", ""),
        })
        added += 1

    Path(variants_path).write_text(json.dumps(made, ensure_ascii=False), encoding="utf-8")
    print("손으로 쓴 변형 %d개 합침 (이미 있던 것 %d개 건너뜀)" % (added, dup))
    if missing:
        print("원본을 못 찾은 것:", missing)
    print("변형 전체 %d개" % len(made))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
