# -*- coding: utf-8 -*-
"""읽어 낸 답 상자를 (본책 쪽, STEP, 문항 번호 → 답)으로 정리한다.

상자 머리말에 "PRACTICE … p.36" 처럼 본책 쪽이 적혀 있다. 다만 글씨가 작아
읽히지 않을 때가 있으므로, 못 읽어도 버리지 않고 남긴다 — 맞대는 쪽에서
본책이 가리키는 "정답 및 해설 p.N" 으로 되짚어 채운다.

  python scripts/grammar-bank/gq_answers_parse.py box.json out.json
"""
import io, json, re, sys
from pathlib import Path

SECTION = re.compile(r"(P\s?R\s?A\s?C\s?T\s?I\s?C\s?E|Writing\s*Exercises|내신|Point)", re.I)
PAGEREF = re.compile(r"[pP]{1,2}\s*\.?\s*(\d{1,3})(?:\s*[~\-]\s*(\d{1,3}))?")


def head_of(text):
    m = SECTION.search(text or "")
    section = m.group(1) if m else None
    ref = PAGEREF.search(text or "")
    pages = []
    if ref:
        a = int(ref.group(1))
        b = int(ref.group(2)) if ref.group(2) else a
        if 1 <= a <= 400 and a <= b <= a + 4:
            pages = list(range(a, b + 1))
    return section, pages


def main(src, dst):
    boxes = json.load(open(src, encoding="utf-8"))
    out = []
    for order, b in enumerate(boxes):
        section, pages = head_of(b.get("head"))
        steps = {}
        for p in b["pieces"]:
            steps.setdefault(p["step"], {})[p["no"]] = p["text"]
        if not steps:
            continue
        out.append({"section": section or "", "book_pages": pages,
                    "answer_page": b["answer_page"], "order": order,
                    "rect": b.get("rect"), "steps": steps})
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    known = sum(1 for b in out if b["book_pages"])
    print("답 상자 %d개 (본책 쪽을 읽은 것 %d개) 저장: %s" % (len(out), known, dst), file=log)
    for b in out[:4]:
        print("   %s 본책 p.%s" % (b["section"], b["book_pages"] or "(모름)"), file=log)
        for s, v in sorted(b["steps"].items()):
            got = "  ".join("%s=%s" % (k, v[k]) for k in sorted(v)[:10])
            print("      STEP %s (%d개) %s" % (s, len(v), got), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
