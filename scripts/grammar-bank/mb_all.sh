#!/usr/bin/env bash
# 중학영문법 3800제 세 권을 한 번에 — 글자 모양표가 다 만들어진 뒤에 돌린다.
#   bash scripts/grammar-bank/mb_all.sh [모양표.json]
set -e
T=tmp-grammar-bank
B="참고파일/중등 문법/16차 개정판 중학영문법 3800제"
TABLE="${1:-$T/mb-glyphs-all.json}"

echo "== 글자 모양표를 짝으로 한 번 더 바로잡는다"
for g in 1 2 3; do
  python scripts/grammar-bank/mb_pair.py "$TABLE" "$B ${g}학년_본문(정답O).pdf" \
    $T/mb-pairs.json 200 | tail -2
done

echo "== 문항을 뽑는다"
for g in 1 2 3; do
  python scripts/grammar-bank/mb_extract.py "$TABLE" "$B ${g}학년_본문(정답O).pdf" $T/mb-$g.json | head -2
  python scripts/grammar-bank/mb_keep.py $T/mb-$g.json $T/mb-$g-keep.json | head -1
done

echo "== 은행 모양으로 맞춘다"
for g in 1 2 3; do
  python scripts/grammar-bank/new_books_to_bank.py $T/mb-bank-$g.json "3800제 ${g}학년" | tail -1
done
python - <<'PY'
import json
from pathlib import Path
rows = []
for g in (1, 2, 3):
    rows += json.loads(Path("tmp-grammar-bank/mb-bank-%d.json" % g).read_text(encoding="utf-8"))
Path("tmp-grammar-bank/mb-bank.json").write_text(
    json.dumps(rows, ensure_ascii=False, indent=1), encoding="utf-8")
print("세 권 모두 %d개" % len(rows))
PY

echo "== 변형본을 만든다"
python scripts/grammar-bank/make_variants.py $T/mb-bank.json $T/mb-variants.json | tail -3
