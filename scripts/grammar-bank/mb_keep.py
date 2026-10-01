# -*- coding: utf-8 -*-
"""중학영문법 3800제에서 뽑은 문항 가운데 **쓸 만한 것만** 고른다.

이 책은 글자를 모양표로 되살렸으므로, 표에 없는 모양은 □ 로 남는다. □ 가 든
문항은 학생에게 그대로 나가면 글이 뚫린 채로 보이므로 넣지 않는다. 답이 없는
것, 답이 빈칸·기호뿐인 것, 글이 너무 짧아 무엇을 묻는지 알 수 없는 것도 뺀다.

  python scripts/grammar-bank/mb_keep.py 뽑은것.json 고른것.json
"""
import collections, io, json, re, sys
from pathlib import Path

LOG = io.open(1, "w", encoding="utf-8", closefd=False)
BLANK = "_____"
MARKS = re.compile(r"^[\s_\-.,;:()\[\]'\"/·□■★→▶|ⓐ-ⓩ]*$")
# 「(down, under)」·「(at; on; in)」처럼 고를 말을 괄호에 적어 둔 자리
PICK = re.compile(r"\(([^()]{2,60}[,;][^()]{2,60})\)")


def tidy(text):
    text = re.sub(r"\s+", " ", str(text or "")).strip()
    # 빈칸이 여러 번 이어진 것은 하나로 줄인다
    return re.sub(r"(?:_{3,}\s*){2,}", BLANK + " ", text).strip()


def trim_answer(text):
    """답에 붙은 찌꺼기를 걷어낸다.

    곁에 적힌 낱말 풀이가 답 끝에 붙고(「boiled, depressing형 우울하게 만드는」),
    고르는 문항에서는 닫는 괄호가 따라온다(「who, that)」).
    """
    t = str(text or "").strip()
    # 「낱말 + 품사표시 + 우리말 뜻」이 뒤에 붙은 것
    t = re.sub(r"\s*[A-Za-z][A-Za-z'\-]*\s*[형명동부접감대]\s*[가-힣].*$", "", t).strip()
    # 한 글자 + 우리말이 꼬리처럼 붙은 것
    t = re.sub(r"\s*,?\s*[A-Za-z]\s+[가-힣]{1,4}$", "", t).strip()
    # 「short + en 단축하다」처럼 낱말 만드는 법을 곁들여 적어 둔 것
    t = re.split(r"\s[+]\s", t)[0].strip()
    # 짝이 맞지 않는 닫는 괄호
    if t.count(")") > t.count("("):
        t = t.rstrip(")").strip()
    return t.strip(" ,;")


def note(text):
    """답이 아니라 곁에 적어 둔 낱말 풀이인가.

    이 책은 어려운 낱말의 뜻을 하늘색으로 곁들여 적는다. 빛깔이 답과 같아서
    그대로 두면 「amazing / (+ dissatisfy 동 불만을 느끼게 하다)」처럼 답에
    풀이말이 따라붙는다. 우리말과 영어가 섞여 길게 이어지면 풀이말로 본다.
    """
    t = str(text or "").strip()
    if t.startswith(("(", "+", "cf", "※", "▶", "=")):
        return True
    if re.match(r"^[A-Za-z][A-Za-z\s'-]{2,}\s+[가-힣]", t):
        return True          # 「fish 명 물고기」 꼴
    return bool(re.search(r"[가-힣]", t) and re.search(r"[A-Za-z]{3}", t) and len(t) > 24)


def main(src, dst):
    rows = json.loads(Path(src).read_text(encoding="utf-8"))

    # 한 묶음 안에서 지시문이 빠진 문항은 같은 묶음의 지시문을 물려받는다.
    # 지시문은 묶음의 머리에 한 번만 적혀 있어, 쪽을 넘어가면 빠지기 때문이다.
    heads = collections.defaultdict(collections.Counter)
    for r in rows:
        if str(r.get("prompt") or "").strip():
            heads[(r.get("chapter_no"), r.get("block"))][r["prompt"]] += 1
    for r in rows:
        if not str(r.get("prompt") or "").strip():
            box = heads.get((r.get("chapter_no"), r.get("block")))
            if box:
                r["prompt"] = box.most_common(1)[0][0]

    out, why = [], collections.Counter()
    for r in rows:
        answer = [trim_answer(tidy(a)) for a in (r.get("answer") or [])]
        answer = [a for a in answer if a and not MARKS.match(a) and not note(a)]
        body = [tidy(b) for b in (r.get("body") or [])]
        # 쪽 가장자리에서 떨어져 나온 한두 글자 조각은 본문이 아니다
        body = [b for b in body if b and len(b) > 2]
        prompt = tidy(r.get("prompt"))
        said = " ".join([prompt] + body + answer)

        if not answer:
            why["답이 없다"] += 1
            continue
        if "□" in said:
            why["모르는 글자가 들었다"] += 1
            continue
        if not body:
            why["본문이 없다"] += 1
            continue
        if not prompt:
            why["발문이 없다"] += 1
            continue
        # 발문은 「~쓰세요」·「~고르시오」처럼 시키는 말로 끝난다. 그렇지 않으면
        # 보기 상자나 앞 문항의 글이 발문 자리에 끼어든 것이다.
        if not re.search(r"(?:세요|시오|쓰기|보세요|하세요)", prompt):
            why["발문이 시키는 말이 아니다"] += 1
            continue
        if re.search(r"[@`~¤■□|]", " ".join(answer)):
            why["답에 쓸 수 없는 글자가 있다"] += 1
            continue
        # 한글 사이에 영문자가 끼어든 것은 글자를 잘못 읽은 자리다(「추p과」).
        # 「여uestions」처럼 영어 낱말 앞머리를 한글로 읽은 자리도 함께 거른다.
        # (「be동사」·「3형식」처럼 제대로 붙여 쓰는 말은 거르지 않는다.)
        if re.search(r"[가-힣][A-Za-z](?![A-Za-z])|(?<![A-Za-z])[A-Za-z][가-힣]"
                     r"|[가-힣][A-Za-z]{2,}", said):
            why["우리말에 영문자가 끼었다"] += 1
            continue
        # 기호를 고르는 문항(답이 A~E 한 글자)은 고를 보기가 문항 밖에 있어
        # 떼어 오면 풀 수 없다
        if any(re.fullmatch(r"[A-EO]", a) for a in answer):
            why["고를 보기가 문항에 없다"] += 1
            continue
        # 「every two weeks = every second week」처럼 짝이 맞아야 하는 수가
        # 어긋난 것은 답이 옆 문항에서 넘어온 것이다
        pair = {"two": "second", "three": "third", "four": "fourth", "five": "fifth",
                "six": "sixth", "seven": "seventh", "eight": "eighth",
                "nine": "ninth", "ten": "tenth"}
        here = " ".join(body).lower()
        got = " ".join(answer).lower()
        said_ord = [o for o in pair.values() if re.search(r"%s" % o, got)]
        if said_ord:
            want = [c for c, o in pair.items() if o in said_ord]
            if want and not any(re.search(r"%s" % c, here) for c in want):
                why["수가 짝이 맞지 않는다"] += 1
                continue
        # 날짜 문항은 우리말 달과 영어 달이 맞아야 한다(「9월 … December」는 어긋난 것)
        MONTH = ["January", "February", "March", "April", "May", "June", "July",
                 "August", "September", "October", "November", "December"]
        said_month = [i + 1 for i, m in enumerate(MONTH) if m.lower() in got]
        here_month = [int(m) for m in re.findall(r"(\d{1,2})\s*월", here)]
        if said_month and here_month and not (set(said_month) & set(here_month)):
            why["달이 맞지 않는다"] += 1
            continue
        # 「고르세요」 문항은 괄호 안에 적힌 말 가운데 하나가 답이어야 한다
        if re.search(r"고르|골라", prompt):
            box = re.findall(r"\(([^()]{2,70})\)", " ".join(body))
            words = [w for b in box for w in re.split(r"[,;/\s]+", b)
                     if w and not set(w) <= set("_")]
            if len(words) >= 2 and not any(a.strip(" _.") in words for a in answer):
                why["고를 말 밖의 답"] += 1
                continue
        if len(" ".join(body)) < 12:
            why["글이 너무 짧다"] += 1
            continue
        if BLANK not in " ".join(body) and len(answer) == 1 and answer[0] in " ".join(body):
            why["빈칸이 없다"] += 1
            continue
        if sum(len(a) for a in answer) > 160:
            why["답이 너무 길다"] += 1
            continue
        # 고를 말을 괄호에 적어 둔 문항은 답이 그 안에 있어야 한다. 이 책은 고른
        # 자리에 동그라미를 쳐 두는데, 그 동그라미가 글자로 읽혀 엉뚱한 답이 된다.
        picks = [p.strip() for box in PICK.findall(" ".join(body))
                 for p in re.split(r"[,;/]", box) if p.strip()]
        if picks and not any(a.strip(" _.") in picks for a in answer):
            why["괄호 안의 말이 답에 없다"] += 1
            continue
        got = dict(r)
        got["prompt"], got["body"], got["answer"] = prompt, body, answer
        out.append(got)

    Path(dst).write_text(json.dumps(out, ensure_ascii=False, indent=1), encoding="utf-8")
    print("문항 %d개 가운데 %d개를 골랐다 (%.0f%%): %s"
          % (len(rows), len(out), 100 * len(out) / max(len(rows), 1), dst), file=LOG)
    for k, n in why.most_common():
        print("   뺀 까닭 — %s: %d개" % (k, n), file=LOG)
    LOG.flush()


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
