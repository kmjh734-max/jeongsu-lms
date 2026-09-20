# -*- coding: utf-8 -*-
"""정답·해설 PDF에서 문항 번호별 대본을 뽑아 길이(낱말 수)와 발화 수를 잰다.

    python scripts/listening-build/scan-scripts.py "참고파일/첫단추_듣기실전편(2026)_정답.pdf"
"""
import sys, re, statistics, collections
import fitz

sys.stdout.reconfigure(encoding="utf-8", errors="replace")

path = sys.argv[1]
limit = int(sys.argv[2]) if len(sys.argv) > 2 else 200

doc = fitz.open(path)
full = "\n".join(doc[i].get_text() for i in range(min(limit, doc.page_count)))

# "01 ③" 또는 "01" 뒤에 W:/M: 로 시작하는 대본이 이어지는 형태
BLOCK = re.compile(r"(?:^|\n)\s*(\d{2})\s*[①②③④⑤]?\s*\n(.{40,3000}?)(?=\n\s*\d{2}\s*[①②③④⑤]?\s*\n|\Z)", re.S)
TURN = re.compile(r"^\s*(?:▶\s*)?([WMwm])\s*[::]\s*(.+)$", re.M)

by_no = collections.defaultdict(list)
for m in BLOCK.finditer(full):
    no = int(m.group(1))
    if not 1 <= no <= 20:
        continue
    body = m.group(2)
    turns = TURN.findall(body)
    if not turns:
        continue
    words = sum(len(re.findall(r"[A-Za-z']+", t)) for _, t in turns)
    if words < 25:
        continue
    by_no[no].append((len(turns), words))

print(f"== {path.split('/')[-1]} ==")
print("번호 | 표본 | 발화 수(중앙값) | 낱말 수(중앙값, 최소~최대)")
for no in sorted(by_no):
    rows = by_no[no]
    turns = [t for t, _ in rows]
    words = [w for _, w in rows]
    print(
        f"{no:4} | {len(rows):4} | {statistics.median(turns):6.0f} | "
        f"{statistics.median(words):6.0f}  ({min(words)}~{max(words)})"
    )
