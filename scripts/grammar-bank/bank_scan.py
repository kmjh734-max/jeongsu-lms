# -*- coding: utf-8 -*-
"""문법 은행 전수조사 — 문항을 한 줄씩 훑어 흠을 종류별로 모은다.

선생님이 그대로 인쇄해 쓰시는 자료라, 글이 뚫려 있거나 쓸데없는 기호·꼬리말이
섞여 있으면 그대로 학생에게 나간다. 그런 자리를 **종류별로** 모아 두면 사람이
한 종류씩 보고 고치거나 뺄 수 있다.

  python scripts/grammar-bank/bank_scan.py [내려받은것.json]
흠은 tmp-grammar-bank/scan-<종류>.json 으로 갈라 적는다.
"""
import collections, io, json, re, sys
from pathlib import Path

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
OUT = Path("tmp-grammar-bank")

JAMO = re.compile(r"[ㄱ-ㅎㅏ-ㅣ]")
JUNK = re.compile(r"[□■◇◆@`¤~¬\\^{}<>]")
FOOT = re.compile(r"(?i)^\s*(?:\d{1,3}\s*)?chapter\s*\d|중학영문법\s*3800제|^\s*정답\s*p\.|"
                  r"페이지\s*$|^\s*p\.\s*\d{1,3}\s*$")
NOTE = re.compile(r"\bcf\)|VOCA|Voca\s*Tip|voca|▶|※")
ONLY_MARK = re.compile(r"^[\s_\-.,;:()\[\]'\"/·|!?]*$")
BLANK = re.compile(r"_{3,}")
POS = re.compile(r"[A-Za-z][A-Za-z'\-]*\s*[형명동부접감대]\s*[가-힣]")


def text_of(r):
    return " ".join([str(r.get("prompt") or "")]
                    + [str(b) for b in (r.get("body") or [])]
                    + [str(c.get("text", "")) for c in (r.get("choices") or [])]
                    + [str(r.get("answer") or "")])


def look(r):
    """이 문항의 흠을 모두 돌려준다"""
    bad = []
    prompt = str(r.get("prompt") or "")
    body = [str(b) for b in (r.get("body") or [])]
    choices = [str(c.get("text", "")) for c in (r.get("choices") or [])]
    answer = str(r.get("answer") or "")
    said = text_of(r)

    if JUNK.search(said):
        bad.append("모르는 글자·쓸데없는 기호")
    if JAMO.search(said):
        bad.append("홀로 선 자음·모음")
    if any(FOOT.search(b) for b in body + [prompt]):
        bad.append("쪽 꼬리말이 섞였다")
    if NOTE.search(said):
        bad.append("곁에 적은 풀이말이 섞였다")
    if POS.search(answer):
        bad.append("답에 낱말 풀이가 붙었다")
    if any(len(b.strip()) <= 2 for b in body):
        bad.append("본문에 한두 글자 조각")
    if answer and ONLY_MARK.match(answer):
        bad.append("답이 기호뿐")
    if answer.count(")") != answer.count("(") or answer.count("]") != answer.count("["):
        bad.append("답의 괄호가 안 맞는다")
    if prompt and not re.search(r"(?:시오|세요|쓰기|하기|것은\?|것\?|고르면\?|고른\?)", prompt):
        bad.append("발문이 시키는 말이 아니다")
    if len(prompt) > 110:
        bad.append("발문이 너무 길다")
    if re.search(r"(?:시오|세요)\s*\.?\s*(?:다음|괄호|우리말|주어진|밑줄|빈칸)", prompt):
        bad.append("발문이 둘 이상 겹쳤다")
    seats = [c.get("no") for c in (r.get("choices") or [])]
    if seats and (len(set(seats)) != len(seats) or len(seats) > 6):
        bad.append("보기가 겹치거나 너무 많다")
    if any(not c.strip() for c in choices):
        bad.append("보기가 비었다")
    if re.search(r"[가-힣][A-Za-z]{2,}", said):
        bad.append("우리말에 영문자가 끼었다")
    if BLANK.search(prompt):
        bad.append("발문에 빈칸이 들었다")
    if not choices and not BLANK.search(" ".join(body)) and len(answer) > 2 \
            and not re.search(r"(?:바꿔|바꾸어|다시 쓰|고쳐|영작|배열|완성|전환|옮기)", prompt):
        bad.append("빈칸도 보기도 없다")
    return bad


def main(src="tmp-grammar-bank/bank-all.json"):
    rows = json.loads(Path(src).read_text(encoding="utf-8"))
    box = collections.defaultdict(list)
    hurt = 0
    for r in rows:
        bad = look(r)
        if bad:
            hurt += 1
        for kind in bad:
            box[kind].append(r)

    print("은행 %d문항 가운데 흠이 있는 것 %d개 (%.1f%%)"
          % (len(rows), hurt, 100 * hurt / max(len(rows), 1)), file=LOG)
    for kind, got in sorted(box.items(), key=lambda kv: -len(kv[1])):
        name = re.sub(r"[^가-힣]", "", kind)[:12]
        Path(OUT / ("scan-%s.json" % name)).write_text(
            json.dumps(got, ensure_ascii=False, indent=1), encoding="utf-8")
        books = collections.Counter(x["source_file"] for x in got)
        print("   %-22s %5d개   (%s)"
              % (kind, len(got), ", ".join("%s %d" % (b[:16], n) for b, n in books.most_common(3))),
              file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(*sys.argv[1:2])
