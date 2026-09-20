# -*- coding: utf-8 -*-
"""참고 교재에서 듣기 유형(지시문)과 보기를 전수로 뽑는다.

    python scripts/listening-build/scan-types.py 고등
    python scripts/listening-build/scan-types.py 중등
"""
import sys, re, json, collections
import fitz

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

BOOKS = {
    "고등": [
        "참고파일/수능실감듣기(2024개정)_본문_.pdf",
        "참고파일/첫단추_듣기실전편(2026)_본문.pdf",
        "참고파일/첫단추_듣기유형편(2026)_본문.pdf",
    ],
    "중등": [
        "참고파일/Listening Q_2권 (중학).pdf",
        "참고파일/리스닝큐_1권 (중학).pdf",
        "참고파일/빠르게영어듣기_3_본문(2026개정) (중학).pdf",
    ],
}

# 지시문: "…고르시오." 또는 "…가장 적절한 것은?" 으로 끝나는 한국어 줄
ASK = re.compile(r"[^\n]*?(?:고르시오|가장 적절한 것은|아닌 것은|무엇인가요)\s*[.?]?", re.S)
CHOICE = re.compile(r"[①②③④⑤]\s*([^\n①②③④⑤]{1,90})")


def normalize(text: str) -> str:
    t = re.sub(r"\s+", " ", text).strip()
    t = re.sub(r"\[\d점\]", "", t).strip()
    # 고유명사·숫자는 유형을 가르는 요소가 아니므로 뭉갠다
    t = re.sub(r"\b[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*\b", "○○", t)
    t = re.sub(r"\d+", "N", t)
    return t


def scan(path: str):
    doc = fitz.open(path)
    out = []
    for page in doc:
        text = page.get_text()
        for m in ASK.finditer(text):
            ask = m.group(0).strip()
            if len(ask) < 12 or len(ask) > 140:
                continue
            if not re.search(r"[가-힣]", ask):
                continue
            tail = text[m.end(): m.end() + 420]
            choices = CHOICE.findall(tail)[:5]
            out.append({"ask": ask, "choices": [c.strip() for c in choices]})
    return out


def choice_language(choices: list[str]) -> str:
    if not choices:
        return "-"
    ko = sum(1 for c in choices if re.search(r"[가-힣]", c))
    return "한글" if ko > len(choices) / 2 else "영어"


def main() -> None:
    grade = sys.argv[1] if len(sys.argv) > 1 else "고등"
    rows = []
    for book in BOOKS[grade]:
        try:
            got = scan(book)
        except Exception as e:  # 파일이 없거나 열리지 않는 경우
            print("못 읽음:", book, e)
            continue
        print(f"{book.split('/')[-1]}: 지시문 {len(got)}개")
        rows.extend(got)

    groups = collections.defaultdict(lambda: {"n": 0, "ko": 0, "en": 0, "보기예시": []})
    for r in rows:
        key = normalize(r["ask"])
        g = groups[key]
        g["n"] += 1
        lang = choice_language(r["choices"])
        if lang == "한글":
            g["ko"] += 1
        elif lang == "영어":
            g["en"] += 1
        if r["choices"] and len(g["보기예시"]) < 2:
            g["보기예시"].append(r["choices"])

    ordered = sorted(groups.items(), key=lambda kv: -kv[1]["n"])
    print(f"\n== {grade} 유형 {len(ordered)}가지 ==\n")
    for key, g in ordered:
        if g["n"] < 2:
            continue
        lang = "한글" if g["ko"] >= g["en"] else "영어"
        print(f"[{g['n']}회 · 보기 {lang}] {key}")
        if g["보기예시"]:
            print("    예시:", " / ".join(g["보기예시"][0][:3]))

    out = sys.argv[2] if len(sys.argv) > 2 else None
    if out:
        json.dump(
            [{"ask": k, **v} for k, v in ordered],
            open(out, "w", encoding="utf8"),
            ensure_ascii=False,
            indent=1,
        )
        print("\n저장:", out)


if __name__ == "__main__":
    main()
