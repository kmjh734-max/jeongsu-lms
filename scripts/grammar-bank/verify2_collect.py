# -*- coding: utf-8 -*-
"""2차 전수 확인(verify2/out_v*.json)을 모은다. 세부 항목 이동은 같은 학년 목록에 있는 이름만 받는다.
   python scripts/grammar-bank/verify2_collect.py [apply-units]"""
import json, sys, glob, subprocess
from collections import defaultdict, Counter
B = {r['id']: r for r in json.load(open('tmp-grammar-bank/bank-all.json', encoding='utf-8'))}
cat = defaultdict(lambda: defaultdict(set))
for r in B.values(): cat[r['level_name']][(r['chapter_no'], r['chapter'])].add(r['unit'])
units, tiers, gaps, answers, bad = [], [], [], [], []
files = sorted(glob.glob('tmp-grammar-bank/verify2/out_v*.json'))
for f in files:
    for e in json.load(open(f, encoding='utf-8')):
        i = e.get('id'); r = B.get(i)
        if not r: bad.append((i, 'id')); continue
        if e.get('answer_issue'): answers.append({'id': i, 'issue': e['answer_issue']})
        if e.get('gap'): gaps.append({'id': i, 'level': r['level_name'], 'chapter': r['chapter'], 'unit': r['unit'], 'gap': e['gap']})
        if e.get('tier') in (1, 2, 3) and e['tier'] != r['tier']:
            tiers.append({'id': i, 'from': r['tier'], 'tier': e['tier'], 'level': r['level_name'], 'reason': e.get('tier_reason', '')})
        if 'unit' in e:
            no, ch, un = e.get('chapter_no', r['chapter_no']), e.get('chapter', r['chapter']), e['unit']
            if un not in cat[r['level_name']].get((no, ch), ()): bad.append((i, f'{no} {ch}/{un}')); continue
            if (no, ch, un) != (r['chapter_no'], r['chapter'], r['unit']):
                units.append({'id': i, 'chapter_no': no, 'chapter': ch, 'unit': un, 'from': f"{r['chapter']}/{r['unit']}", 'note': e.get('note', '')})
print(f'files {len(files)} / unit {len(units)} / tier {len(tiers)} / gap {len(gaps)} / answer {len(answers)} / bad {len(bad)}')
print('tier', Counter(f"{t['from']}->{t['tier']}" for t in tiers))
print('gap', Counter((g['level'], g['gap']) for g in gaps).most_common(25))
for b in bad[:10]: print(' bad', b)
o = 'tmp-grammar-bank/verify2/'
for n, v in [('units', units), ('tiers', tiers), ('gaps', gaps), ('answers', answers)]:
    json.dump(v, open(o + n + '.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
if 'apply-units' in sys.argv:
    json.dump([{k: m[k] for k in ('id', 'chapter_no', 'chapter', 'unit')} for m in units], open(o + 'apply-units.json', 'w', encoding='utf-8'), ensure_ascii=False)
    r = subprocess.run(['node', 'scripts/grammar-bank/bulk-update.mjs', o + 'apply-units.json'], capture_output=True, text=True, encoding='utf-8')
    print((r.stdout + r.stderr).strip()[-80:])
