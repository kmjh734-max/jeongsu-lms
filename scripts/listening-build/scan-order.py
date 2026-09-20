# -*- coding: utf-8 -*-
"""한 회차 안에서 문항 번호별 지시문이 무엇인지 차례대로 뽑는다.

    python scripts/listening-build/scan-order.py "참고파일/....pdf" [훑을 쪽수]
"""
import sys, re, collections
import fitz

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

path = sys.argv[1]
limit = int(sys.argv[2]) if len(sys.argv) > 2 else 40

# "01 대화를 듣고, …" 처럼 번호가 앞이나 뒤에 붙는 형태를 모두 잡는다
NUMBERED = re.compile(
    r"(?:^|\n)\s*(\d{1,2})\s*[.)]?\s*((?:다음|대화|녹음|[A-Za-z○]|그림|표)[^\n]{6,110}?(?:고르시오|것은)\s*[.?]?)",
    re.M,
)

doc = fitz.open(path)
byno = collections.defaultdict(collections.Counter)
for i in range(min(limit, doc.page_count)):
    text = doc[i].get_text()
    for m in NUMBERED.finditer(text):
        no = int(m.group(1))
        if not 1 <= no <= 20:
            continue
        ask = re.sub(r"\s+", " ", m.group(2)).strip()
        ask = re.sub(r"\[\d점\]", "", ask).strip()
        ask = re.sub(r"\b[A-Z][A-Za-z]+(?:\s+[A-Z][A-Za-z]+)*\b", "○○", ask)
        ask = re.sub(r"\d+", "N", ask)
        byno[no][ask] += 1

print(f"== {path.split('/')[-1]} · 앞 {limit}쪽 ==")
for no in sorted(byno):
    top = byno[no].most_common(2)
    print(f"{no:2}번: " + " || ".join(f"{a} ({c})" for a, c in top))
