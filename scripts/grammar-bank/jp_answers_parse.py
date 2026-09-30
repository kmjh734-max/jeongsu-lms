# -*- coding: utf-8 -*-
"""잘 풀리는 영문법 정답지의 답 상자를 차례대로 정리한다.

정답지 짜임
    RULE 01  be동사의 현재형              p. 28
    [상자] 1 is  2 are  3 is  4 are  5 are  6 are
    1  지금은 점심시간이다.        ← 해석
    바로 풀리는 실전문제
    [상자] 1 ④   2 ②
    응용까지 완벽한 CHAPTER 1 | 통합 문제   p. 15
    [상자] 1 ④  2 ③  …

상자 안에서 문항 번호는 주황, 답은 검은색이다(그래머큐와 같은 꼴).
본책 쪽은 머리말의 "p. 28" 에서 읽는데, 머리말이 없는 상자도 많다. 그런 상자는
쪽을 비워 두고, 맞대는 쪽에서 앞뒤 차례로 채운다.

「마무리 실전문제」는 여러 단원에 걸쳐 있어 은행의 단원에 넣을 자리가 없다.
여기서 갈래만 적어 두고 맞대는 쪽에서 버린다.

  python scripts/grammar-bank/jp_answers_parse.py box.json out.json
"""
import collections, io, json, re, sys
from pathlib import Path

PAGEREF = re.compile(r"[pP]{1,2}\s*\.?\s*(\d{1,3})(?:\s*[~\-]\s*(\d{1,3}))?")
RULE = re.compile(r"R\s?U\s?[LI]\s?E", re.I)
TONG = re.compile(r"통\s?합\s?문\s?제")
FINAL = re.compile(r"마\s?무\s?리")
CHAPTER = re.compile(r"CHAPTER\s*(\d{1,2})", re.I)


def main(src, dst):
    boxes = json.load(open(src, encoding="utf-8"))

    order = collections.Counter()
    out = []
    for b in boxes:
        head = b.get("head") or ""
        page = None
        for hit in PAGEREF.finditer(head):
            got = int(hit.group(1))
            if 1 <= got <= 400:
                page = got          # 머리말 끝쪽의 쪽 번호가 그 상자의 것이다
        chapter = CHAPTER.search(head)
        kind = "마무리" if FINAL.search(head) else ("통합" if TONG.search(head)
                                                 else ("RULE" if RULE.search(head) else None))
        answers = {str(p["no"]): p["text"] for p in b["pieces"]}
        if not answers:
            continue
        ap = b["answer_page"]
        order[ap] += 1
        out.append({
            "kind": kind,
            "chapter_no": int(chapter.group(1)) if chapter else None,
            "book_page": page,
            "answer_page": ap,
            "order": order[ap],
            "answers": answers,
        })

    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    log = io.open(1, "w", encoding="utf-8", closefd=False)
    known = sum(1 for b in out if b["book_page"])
    print("상자 %d개 중 쓸 수 있는 것 %d개 (본책 쪽 읽힌 것 %d개) 저장: %s"
          % (len(boxes), len(out), known, dst), file=log)
    for b in out[:5]:
        got = "  ".join("%s=%s" % (k, b["answers"][k]) for k in sorted(b["answers"], key=int)[:8])
        print("   %s 본책 p.%s (%d개) %s" % (b["kind"], b["book_page"], len(b["answers"]), got),
              file=log)
    log.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
