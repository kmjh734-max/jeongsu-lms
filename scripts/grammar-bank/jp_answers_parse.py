# -*- coding: utf-8 -*-
"""잘 풀리는 영문법 정답지의 답 상자를 (본책 쪽, 문항 번호 → 답)으로 정리한다.

정답지 짜임
    RULE 01  be동사의 현재형              p. 28
    [상자] 1 is  2 are  3 is  4 are  5 are  6 are
    1  지금은 점심시간이다.        ← 해석
    바로 풀리는 실전문제
    [상자] 1 ④   2 ②
    CHAPTER 1  통합 문제
    [상자] 1 ④  2 ③  …

상자 안에서 문항 번호는 초록, 답은 검은색이다(그래머큐와 같은 꼴).
본책 쪽은 RULE 머리말의 "p. 28" 에서 읽는다. '실전문제' 상자는 바로 위 RULE 의
쪽을 이어받는다. '통합 문제' 상자는 본책의 통합 문제 쪽을 따로 찾아 붙인다.

  python scripts/grammar-bank/jp_answers_parse.py box.json out.json
"""
import io, json, re, sys
from pathlib import Path

RULE = re.compile(r"R\s?U\s?[LI]\s?E\s*(\d{1,2})", re.I)
PAGEREF = re.compile(r"[pP]{1,2}\s*\.?\s*(\d{1,3})")
PRACTICE = re.compile(r"(실\s?전\s?문\s?제|통\s?합\s?문\s?제|마\s?무\s?리)")
CHAPTER = re.compile(r"CHAPTER\s*(\d{1,2})", re.I)


def main(src, dst):
    boxes = json.load(open(src, encoding="utf-8"))
    out = []
    last_page = None
    last_chapter = None
    for b in boxes:
        head = b.get("head") or ""
        ref = PAGEREF.search(head)
        page = int(ref.group(1)) if ref and 1 <= int(ref.group(1)) <= 400 else None
        ch = CHAPTER.search(head)
        if ch:
            last_chapter = int(ch.group(1))
        kind = None
        if RULE.search(head):
            kind = "RULE"
            if page:
                last_page = page
        elif PRACTICE.search(head):
            kind = "실전"
        if kind is None:
            continue
        answers = {}
        for p in b["pieces"]:
            answers[p["no"]] = p["text"]
        if not answers:
            continue
        out.append({
            "kind": kind,
            "chapter_no": last_chapter,
            "book_page": page or (last_page if kind == "실전" else None),
            "answer_page": b["answer_page"],
            "answers": answers,
        })
    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    print("상자 %d개 중 쓸 수 있는 것 %d개 저장: %s" % (len(boxes), len(out), dst), file=log)
    for b in out[:8]:
        got = "  ".join("%s=%s" % (k, b["answers"][k]) for k in sorted(b["answers"], key=int)[:10])
        print("   %s CH%s 본책 p.%s (%d개) %s"
              % (b["kind"], b["chapter_no"], b["book_page"], len(b["answers"]), got), file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
