#!/usr/bin/env bash
# 3800제 변형본을 은행에 넣고 뒷정리까지 — mb_all.sh 를 돌린 뒤에 쓴다.
#   bash scripts/grammar-bank/mb_put.sh
set -e
T=tmp-grammar-bank
cp $T/mb-variants.json $T/new-variants.json
node scripts/grammar-bank/import_new_books.mjs --적용 | tail -6
node scripts/grammar-bank/grade-tiers.mjs --적용 | head -5
python scripts/grammar-bank/set_units.py --적용 | head -3
node scripts/grammar-bank/bank-audit.mjs | tail -13
node scripts/tmp-rv/_koen.mjs | head -4
node scripts/tmp-rv/gb-harness.mjs 160 | tail -2
node scripts/grammar-bank/bank-now.mjs | head -9
