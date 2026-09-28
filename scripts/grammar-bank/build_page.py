# -*- coding: utf-8 -*-
"""모아보기 페이지에 실을 자료를 만들고 bank.html에 끼워 넣는다.

쓰는 법:
    python scripts/grammar-bank/build_page.py <작업폴더> <bank.html>
"""
import json, sys
from pathlib import Path

HAND = "손으로"                      # 손으로 쓴 변형인지 가리는 말


def round_name(question):
    kind = question["kind"]
    return "%s(%d회)" % (kind, question["round"]) if question.get("round") else kind


def slim_question(question):
    return {
        "r": question["source_ref"],
        "n": question["number"],
        "L": question["level"],
        "Ln": question["level_name"],
        "c": question["chapter_no"],
        "ct": question["chapter"],
        "k": round_name(question),
        "t": question["question_kind"],
        "p": question["prompt"],
        "b": question["body"],
        "o": [c["text"] for c in question["choices"]],
        "a": question["answer"] or "",
        "w": question["explanation"] or "",
        "d": question.get("difficulty") or "",
        "g": question.get("badges") or [],
        "s": question.get("section") or "",
    }


def slim_unit(unit):
    return {
        "L": unit["level"],
        "Ln": unit["level_name"],
        "c": unit["chapter_no"],
        "ct": unit["chapter"],
        "u": unit["unit_no"],
        "ut": unit["unit"],
        "b": unit["body"],
        "pr": unit.get("practice") or [],
    }


def slim_variant(variant, index):
    changes = variant.get("changes") or []
    return {
        "i": index,
        "ch": changes,
        "tb": variant.get("table") or {},
        "hm": bool(changes and changes[0].startswith(HAND)),
        "p": variant["prompt"],
        "b": variant["body"],
        "o": [c["text"] for c in variant["choices"]],
        "a": variant["answer"] or "",
    }


def main(folder, page):
    folder = Path(folder)
    bank = json.loads((folder / "bank.json").read_text(encoding="utf-8"))
    units = json.loads((folder / "concepts-all.json").read_text(encoding="utf-8"))
    variants = json.loads((folder / "variants.json").read_text(encoding="utf-8"))

    where = {(q["file"], q["number"]): i for i, q in enumerate(bank)}
    rows, lost = [], 0
    for variant in variants:
        index = where.get((variant["origin_file"], variant["origin_number"]))
        if index is None:
            lost += 1
            continue
        rows.append(slim_variant(variant, index))

    data = {"q": [slim_question(q) for q in bank],
            "u": [slim_unit(u) for u in units],
            "v": rows}
    blob = json.dumps(data, ensure_ascii=False, separators=(",", ":"))
    (folder / "page-data.json").write_text(blob, encoding="utf-8")

    page = Path(page)
    lines = page.read_text(encoding="utf-8").split("\n")
    head = '<script type="application/json" id="qdata">'
    spot = next(i for i, line in enumerate(lines) if line.startswith(head))
    lines[spot] = head + blob + "</script>"
    page.write_text("\n".join(lines), encoding="utf-8")

    print("문항 %d · 개념 %d · 변형 %d(손으로 쓴 것 %d)"
          % (len(data["q"]), len(data["u"]), len(rows),
             sum(1 for r in rows if r["hm"])))
    if lost:
        print("원본을 못 찾은 변형 %d개" % lost)
    print("%s %.1fMB" % (page.name, page.stat().st_size / 1048576))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
