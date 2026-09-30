#!/usr/bin/env bash
# 정답지를 다시 읽은 뒤, 맞대기부터 적재까지 한 번에 돌린다.
#
# 정답지에서 동그라미(○)를 놓치던 것을 고쳤으므로, 그 답이 빠져 번호가 어긋나
# 통째로 버려졌던 묶음들이 살아난다. 문항 뽑기는 그대로이고 맞대기부터 다시 한다.
#
#   bash scripts/grammar-bank/rebuild_after_reocr.sh
set -e
cd "$(dirname "$0")/../.."
T=tmp-grammar-bank

echo "── 그래머큐 본책"
for b in starter1 starter2 inter1 inter2 adv1 adv2; do
  python scripts/grammar-bank/gq_answers_parse.py $T/gq-$b-box.json $T/gq-$b-ans.json > /dev/null
  python scripts/grammar-bank/gq_match.py $T/gq-$b.json $T/gq-$b-ans.json \
    $T/gq-$b-matched.json $T/gq-$b-bad.json 2>&1 | grep -E "붙인|맞춘" || true
done

echo "── 잘 풀리는 본책"
for n in 1 2 3; do
  python scripts/grammar-bank/jp_answers_parse.py $T/jp-$n-box.json $T/jp-$n-ans.json > /dev/null
  python scripts/grammar-bank/jp_match.py $T/jp-$n.json $T/jp-$n-ans.json \
    $T/jp-$n-matched.json $T/jp-$n-bad.json 2>&1 | grep -E "붙인|맞춘" || true
done

echo "── 잘 풀리는 워크북"
for n in 1 2 3; do
  python scripts/grammar-bank/jp_wb_match.py $T/jpwb-$n.json $T/jp-$n-box.json \
    $T/jpwb-$n-matched.json $T/jpwb-$n-bad.json 2>&1 | grep 붙인
done

echo "── 그래머큐 워크북"
for k in s1 s2 i1 i2 a1 a2; do
  python scripts/grammar-bank/gqwb_match.py $T/gqwb-$k.json $T/gqwb-$k-box.json     $T/gqwb-$k-matched.json $T/gqwb-$k-bad.json 2>&1 | grep 붙인
done

echo "── 천일문 워크북"
for n in 1 2 3; do
  python scripts/grammar-bank/cw_wb_match.py $T/cwwb-$n.json $T/cw-$n-box.json \
    $T/cwwb-$n-matched.json $T/cwwb-$n-bad.json 2>&1 | grep 붙인
done

echo "── 은행 형식으로"
python scripts/grammar-bank/new_books_to_bank.py $T/redo-bank.json
python scripts/grammar-bank/make_variants.py $T/redo-bank.json $T/redo-variants.json | tail -2
