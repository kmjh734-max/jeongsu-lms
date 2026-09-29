# -*- coding: utf-8 -*-
"""읽어 낸 답 상자를 (본책 쪽, STEP, 문항 번호 → 답)으로 정리한다.

상자 머리말에 "PRACTICE … p.36" 또는 "… pp.39~40" 처럼 본책 쪽이 적혀 있다.
STEP·문항 번호는 도형 자리에서 이미 매겨져 왔으므로 여기서는 머리말만 읽으면 된다.

  python scripts/grammar-bank/gq_answers_parse.py box.json out.json
"""
import io, json, re, sys
from pathlib import Path

SECTION = re.compile(r"(P\s?R\s?A\s?C\s?T\s?I\s?C\s?E|Writing\s*Exercises|내신|Point)", re.I)
PAGEREF = re.compile(r"[pP]{1,2}\s*\.?\s*(\d{1,3})(?:\s*[~\-]\s*(\d{1,3}))?")


def head_of(text):
    m = SECTION.search(text or "")
    if not m:
        return None, []
    ref = PAGEREF.search(text)
    pages = []
    if ref:
        a = int(ref.group(1))
        b = int(ref.group(2)) if ref.group(2) else a
        if 1 <= a <= 400 and a <= b <= a + 4:
            pages = list(range(a, b + 1))
    return m.group(1), pages


def main(src, dst):
    boxes = json.load(open(src, encoding="utf-8"))
    out = []
    for b in boxes:
        section, pages = head_of(b.get("head"))
        if not section or not pages:
            continue
        steps = {}
        for p in b["pieces"]:
            steps.setdefault(p["step"], {})[p["no"]] = p["text"]
        if steps:
            out.append({"section": section, "book_pages": pages,
                        "answer_page": b["answer_page"], "steps": steps})
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    print("상자 %d개 중 본책 쪽을 아는 것 %d개 저장: %s" % (len(boxes), len(out), dst), file=log)
    for b in out[:4]:
        print("   %s 본책 p.%s" % (b["section"], b["book_pages"]), file=log)
        for s, v in sorted(b["steps"].items()):
            got = "  ".join("%s=%s" % (k, v[k]) for k in sorted(v)[:10])
            print("      STEP %s (%d개) %s" % (s, len(v), got), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
