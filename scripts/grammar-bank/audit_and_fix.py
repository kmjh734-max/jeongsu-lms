# -*- coding: utf-8 -*-
"""문법 은행 검수 — 모델 없이 글자와 정답 자리만 보고 고친다.

이상한 기호는 문장을 살릴 수 있으면 걷고, 분수 그림·보기 없는 번호 답처럼
고칠 수 없으면 문항을 뺀다.

  python scripts/grammar-bank/audit_and_fix.py          # 세어 보기
  python scripts/grammar-bank/audit_and_fix.py --계획     # 적용 파일만 쓴다
"""
import json
import re
import sys
import unicodedata
from pathlib import Path

SRC = Path("tmp-grammar-bank/bank-all.json")
OUT = Path("tmp-grammar-bank")
MARKS = "①②③④⑤⑥⑦⑧⑨⑩"
LATIN = "ⓐⓑⓒⓓⓔⓕⓖⓗⓘⓙ"
LATIN_TO_MARK = dict(zip(LATIN, MARKS))

# 장식·총알·제어 — 문장 내용이 아님
STRIP_CHARS = set(
    "\x00\x01\x02\x03\x04\x05\x06\x07\x08\x0b\x0c"
    "\x0e\x0f\x10\x11\x12\x13\x14\x15\x16\x17\x18\x19\x1a\x1b\x1c\x1d\x1e\x1f"
    "\u200b\u200c\u200d\u200e\u200f\u2028\u2029\u2060\ufeff\xad"
)
# 글꼴에만 있는 장식. 문장 자리에 있어도 영어·한글은 남아 있다.
PUA_MAP = {
    "\ue313": "",     # 줄 머리 총알
    "\ue6ef": "",     # 줄 사이 장식
    "\ue229": "○",    # 고르는 동그라미
    "\ue287": "○",    # O표
    "\ue2c6": "•",
    "\ue3f7": "→",    # 빈칸 사이 화살
    "\ue2ca": "",     # 빈칸 사이 상자 그림
    "\ue288": "",
    "\uf0fc": " / ",
}
FOOT_LINE = re.compile(
    r"(?i)^\s*(?:\d{1,3}|chapter\s*\d+|중학영문법\s*3800제|정답\s*p\.\s*\d+|p\.\s*\d+)\s*$"
)
ANSWER_KEY = re.compile(r"\s*\d{0,3}\s*Answer Key\s*$", re.I)
ONLY_MARKS = re.compile(r"^[\s①-⑩ⓐ-ⓙ0-9,./·()번및과와]+$")
CIRCLED = re.compile(r"[①-⑩ⓐ-ⓙ]")
JAMO_JUNK = re.compile(r"[ㄱ-ㅎㅏ-ㅣ]")
GARBAGE_KO = re.compile(r"광충|�|\ufffd")


def clean_text(s):
    if s is None:
        return s
    out = []
    for ch in str(s):
        if ch in STRIP_CHARS:
            continue
        if ch == "\xa0":
            out.append(" ")
            continue
        if ch in PUA_MAP:
            out.append(PUA_MAP[ch])
            continue
        out.append(ch)
    t = "".join(out)
    t = re.sub(r"[ \t]{2,}", " ", t)
    t = re.sub(r" ?\n ?", "\n", t)
    return t.strip(" \t")


def remaining_pua(s):
    return [ch for ch in s if 0xE000 <= ord(ch) <= 0xF8FF or 0xF0000 <= ord(ch)]


def clean_row(r):
    """글자를 걷은 새 문항. 바뀐 칸만 돌려준다."""
    patch = {}
    prompt = clean_text(r.get("prompt") or "")
    if prompt != (r.get("prompt") or ""):
        patch["prompt"] = prompt

    body = []
    body_changed = False
    for b in r.get("body") or []:
        nb = clean_text(b)
        if FOOT_LINE.match(nb or ""):
            body_changed = True
            continue
        if nb != b:
            body_changed = True
        if nb:
            body.append(nb)
    if body_changed:
        patch["body"] = body

    choices = r.get("choices") or []
    new_ch = []
    ch_changed = False
    for c in choices:
        t = clean_text(c.get("text") or "")
        if t != (c.get("text") or ""):
            ch_changed = True
        new_ch.append({**c, "text": t})
    if ch_changed:
        patch["choices"] = new_ch

    ans = str(r.get("answer") or "")
    nans = ANSWER_KEY.sub("", clean_text(ans) or "").strip()
    nans = nans.replace("ⓒ 3", "③").replace("③ 3", "③")
    for a, b in LATIN_TO_MARK.items():
        # 보기 번호가 라틴 동그라미로만 적힌 답
        if re.fullmatch(rf"\s*{a}\s*", nans):
            nans = b
    if nans != ans:
        patch["answer"] = nans or None

    exp = r.get("explanation")
    if exp:
        nexp = clean_text(exp)
        if nexp != exp:
            patch["explanation"] = nexp

    return patch


def merged(r, patch):
    out = dict(r)
    out.update(patch)
    return out


def blob(r):
    parts = [str(r.get("prompt") or "")]
    parts += [str(b) for b in (r.get("body") or [])]
    for c in r.get("choices") or []:
        parts.append(str(c.get("text") or ""))
    parts.append(str(r.get("answer") or ""))
    return "\n".join(parts)


def why_drop(r):
    """고칠 수 없으면 빼는 까닭. 없으면 남긴다."""
    prompt = str(r.get("prompt") or "")
    body = [str(b) for b in (r.get("body") or [])]
    choices = r.get("choices") or []
    answer = str(r.get("answer") or "").strip()
    said = blob(r)

    pua = remaining_pua(said)
    if pua:
        return "남는 이상한 기호 " + " ".join(
            "U+%04X" % ord(c) for c in sorted(set(pua))
        )

    if GARBAGE_KO.search(said):
        return "OCR 깨진 한글"

    # 보기 기호 답인데 보기가 본문에도 배열에도 없다
    if CIRCLED.search(answer) and ONLY_MARKS.match(answer):
        has_ch = bool(choices)
        has_inline = bool(CIRCLED.search("\n".join(body + [prompt])))
        has_보기 = "<보기>" in prompt or "보기" in "".join(body)
        if not has_ch and not has_inline:
            return "번호 답인데 보기가 없다"
        if has_보기 and not has_ch and not has_inline:
            return "보기 문항인데 보기가 없다"

    if not answer:
        return "답 없음"

    if not prompt.strip() and not any(body) and not choices:
        return "본문 없음"

    # 홀로 남은 자모가 보기 기호(ㄱ. ㄴ.)가 아닐 때
    for m in JAMO_JUNK.finditer(said):
        i = m.start()
        around = said[max(0, i - 1): i + 2]
        if re.match(r"[ㄱㄴㄷㄹㅁㅂㅅㅇ][.).、，]", said[i:i + 2]):
            continue
        if said[i:i + 2] in ("ㄴ.", "ㄱ.", "ㄷ.", "ㄹ.", "ㅁ."):
            continue
        return "홀로 선 자음·모음"

    nos = []
    for c in choices:
        n = c.get("no")
        if isinstance(n, int):
            nos.append(n)
    picked = [MARKS.index(c) + 1 for c in answer if c in MARKS]
    if nos and picked and any(p not in nos for p in picked):
        return "정답 번호가 보기 밖"

    return None


def main():
    sys.stdout.reconfigure(encoding="utf-8")
    rows = json.loads(SRC.read_text(encoding="utf-8"))
    updates = []
    deletes = []
    reasons = {}
    for r in rows:
        patch = clean_row(r)
        now = merged(r, patch)
        drop = why_drop(now)
        if drop:
            deletes.append({"id": r["id"], "source_file": r.get("source_file"),
                            "number": r.get("number"), "reason": drop,
                            "answer": now.get("answer"),
                            "prompt": str(now.get("prompt") or "")[:80]})
            reasons[drop.split(" ")[0]] = reasons.get(drop.split(" ")[0], 0) + 1
            continue
        if patch:
            updates.append({"id": r["id"], **patch})

    plan = {"updates": updates, "deletes": deletes}
    OUT.mkdir(parents=True, exist_ok=True)
    (OUT / "fix-plan.json").write_text(
        json.dumps(plan, ensure_ascii=False), encoding="utf-8"
    )

    print(f"은행 {len(rows)}문항")
    print(f"  글자 고침 {len(updates)}개")
    print(f"  뺌 {len(deletes)}개")
    from collections import Counter
    c = Counter(d["reason"] for d in deletes)
    for k, n in c.most_common():
        print(f"    · {k}: {n}")
    print("계획 tmp-grammar-bank/fix-plan.json")
    print("빼는 보기:")
    for d in deletes[:12]:
        print(f"  [{d['reason']}] {d['source_file']} #{d['number']}  A={d['answer']!r:.60}")


if __name__ == "__main__":
    main()
