# -*- coding: utf-8 -*-
"""문제 은행에서 변형본을 만든다.

문항 하나하나를 따로 뜯어본다. 그 문항에서 손대면 안 되는 말(밑줄·정답·해설이
집어 말한 말·선택지가 답의 자리인 말)을 먼저 확정하고, 남은 것만 바꾼다.
같은 치환은 본문과 선택지에 함께 적용되므로 보기 내용도 같이 바뀐다.
"""
import collections, json, random, sys, time
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from analyze import analyze
from variants import MARKERS, build_variant


def answer_index(answer):
    picked = [MARKERS.index(c) for c in (answer or "") if c in MARKERS]
    return picked[0] if len(picked) == 1 else None


def main(bank_path, out_path, seed=20260923):
    bank = json.loads(Path(bank_path).read_text(encoding="utf-8"))
    rng = random.Random(seed)
    spread = collections.Counter()
    made, skipped, rejected = [], collections.Counter(), collections.Counter()
    started = time.time()

    for index, question in enumerate(bank, 1):
        if index % 250 == 0 or index == len(bank):
            done = index * 100 / len(bank)
            print("  %5d/%d  %4.1f%%  변형 %d개  (%.0f초)"
                  % (index, len(bank), done, len(made), time.time() - started),
                  flush=True)

        if not question.get("is_primary", True):
            skipped["같은 문항이 이미 있음"] += 1
            continue

        report = analyze(question)            # ← 이 문항만 두고 따로 분석한다
        # 정답이 고르게 퍼지도록, 지금까지 가장 적게 쓰인 자리를 노린다.
        want = min(range(5), key=lambda i: spread[i]) if question["choices"] else None
        variant, applied, problems = build_variant(question, report, rng, want)

        if variant is None:
            skipped[problems[0] if problems else "바꿀 곳 없음"] += 1
            continue
        if problems:
            for problem in problems:
                rejected[problem] += 1
            continue

        at = answer_index(variant["answer"])
        if at is not None:
            spread[at] += 1
        made.append({
            "origin_ref": question["source_ref"],
            "origin_file": question["file"],
            "origin_number": question["number"],
            "level": question["level"], "level_name": question["level_name"],
            "chapter_no": question["chapter_no"], "chapter": question["chapter"],
            "unit_no": question.get("unit_no"), "unit": question.get("unit"),
            "kind": question["kind"], "round": question["round"],
            "question_kind": question["question_kind"],
            "difficulty": question.get("difficulty"),
            "badges": question.get("badges", []),
            "caution": report["caution"],
            "changes": applied,
            "table": variant.get("table") or {},
            "flipped": bool(variant.get("flipped")),
            "prompt": variant["prompt"], "body": variant["body"],
            "choices": variant["choices"], "answer": variant["answer"],
            "explanation": variant["explanation"],
        })

    Path(out_path).write_text(json.dumps(made, ensure_ascii=False), encoding="utf-8")

    print("\n원본 %d문항 → 변형 %d개\n" % (len(bank), len(made)))
    kinds = collections.Counter()
    for row in made:
        for change in row["changes"]:
            kinds[change.split()[0]] += 1
    print("[바꾼 곳]")
    for name, count in kinds.most_common():
        print("  %-12s %5d" % (name, count))
    print("\n[못 만든 까닭]")
    for name, count in skipped.most_common():
        print("  %-24s %5d" % (name, count))
    print("\n[검사에서 걸러낸 것]")
    if not rejected:
        print("  없음")
    for name, count in rejected.most_common():
        print("  %-24s %5d" % (name, count))
    total = sum(spread.values())
    print("\n[변형본 정답 분포]")
    for at in range(5):
        print("  %s %5d (%4.1f%%)" % (MARKERS[at], spread[at],
                                      spread[at] * 100 / max(total, 1)))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
