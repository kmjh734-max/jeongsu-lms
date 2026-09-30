#!/usr/bin/env bash
# 맞대기가 끝난 뒤 은행에 넣고 뒷정리까지 한 번에 한다.
#
# 넣기 전에 반드시 표본을 눈으로 본다:
#   python scripts/grammar-bank/sample_check.py 6
#
#   bash scripts/grammar-bank/import_after_rebuild.sh
set -e
cd "$(dirname "$0")/../.."
T=tmp-grammar-bank

echo "── 변형 만들기"
python scripts/grammar-bank/make_variants.py $T/redo-bank.json $T/redo-variants.json | tail -2

echo "── 은행에 넣기"
cp $T/redo-variants.json $T/new-variants.json
node scripts/grammar-bank/import_new_books.mjs | tail -20

echo "── 난이도"
node scripts/grammar-bank/grade-tiers.mjs | tail -3

echo "── 세부 목차 채우기"
python scripts/grammar-bank/fill_units.py --적용 | tail -1
python scripts/grammar-bank/fill_by_neighbour.py --적용 | tail -1
python scripts/grammar-bank/fill_by_words.py --적용 | tail -1
python scripts/grammar-bank/force_fill.py --적용 | tail -1

echo "── 확인"
python - <<'PY'
import io, sys, collections
sys.path.insert(0, "scripts/grammar-bank")
import db
from official_units import units_of
log = io.open(1, "w", encoding="utf-8", closefd=False)
rows = db.rows("id,level,level_name,chapter,unit")
print("은행 %d문항 · 세부 빈 것 %d · 목차 밖 %d" % (
    len(rows),
    sum(1 for r in rows if not r.get("unit")),
    sum(1 for r in rows if r.get("unit") and r["unit"] not in units_of(r["level"], r["chapter"]))),
    file=log)
print("레벨: %s" % dict(collections.Counter(r["level_name"] for r in rows)), file=log)
log.flush()
PY

echo "── 인쇄"
node scripts/tmp-rv/gb-harness.mjs 160 | tail -2
