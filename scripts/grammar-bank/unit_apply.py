# -*- coding: utf-8 -*-
"""세부 항목 검사 결과(out_u*.json)를 검증해 적는다. 단원·세부는 같은 단계에 이미 있는 이름만 받는다.
   python scripts/grammar-bank/unit_apply.py [apply]"""
import json, sys, glob, subprocess, re
from collections import defaultdict
U = {r['id']: r for r in json.load(open('tmp-grammar-bank/units-now.json', encoding='utf-8'))}
cat = defaultdict(lambda: defaultdict(set))
for r in U.values(): cat[r['level_name']][(r['chapter_no'], r['chapter'])].add(r['unit'])
moves, notes, bad, done = [], [], [], 0
for f in sorted(glob.glob('tmp-grammar-bank/unit-audit/out_u*.json')):
    done += 1
    for e in json.load(open(f, encoding='utf-8')):
        i = e.get('id'); r = U.get(i)
        if not r: bad.append((i, 'id')); continue
        if e.get('tier_note'): notes.append({'id': i, 'tier': r['tier'], 'note': e['tier_note']})
        if 'unit' not in e: continue
        no, ch, un = e.get('chapter_no', r['chapter_no']), e.get('chapter', r['chapter']), e['unit']
        units = cat[r['level_name']].get((no, ch))
        if units is None or un not in units: bad.append((i, f'not in catalog: {no} {ch} / {un}')); continue
        if (no, ch, un) == (r['chapter_no'], r['chapter'], r['unit']): continue
        moves.append({'id': i, 'chapter_no': no, 'chapter': ch, 'unit': un, 'from': f"{r['chapter']}/{r['unit']}", 'note': e.get('note', '')})
# 맞는 세부 항목이 없어 '명사절을 이끄는 that' 으로 근사해 보낸 것은 적지 않고 따로 모은다(단원 신설 여부는 선생님 결정).
APPROX = re.compile(r'whether|if절|if/whether|명사절 if|if·whether|간접|indirect|so ?~ ?that|so that|화법|시제 ?일치', re.I)
held = [m for m in moves if m['unit'] == '명사절을 이끄는 that' and APPROX.search(m['note'])]
hid = {m['id'] for m in held}
moves = [m for m in moves if m['id'] not in hid]
json.dump(held, open('tmp-grammar-bank/unit-audit/held.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print(f'held {len(held)}')
print(f'files {done} / moves {len(moves)} (chapter changed {sum(1 for m in moves if m["chapter"] != U[m["id"]]["chapter"])}) / tier notes {len(notes)} / bad {len(bad)}')
for b in bad[:15]: print('  bad', b)
json.dump(notes, open('tmp-grammar-bank/unit-audit/tier-notes.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
json.dump(moves, open('tmp-grammar-bank/unit-audit/moves.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
if 'apply' in sys.argv:
    json.dump([{k: m[k] for k in ('id', 'chapter_no', 'chapter', 'unit')} for m in moves], open('tmp-grammar-bank/unit-audit/apply.json', 'w', encoding='utf-8'), ensure_ascii=False)
    r = subprocess.run(['node', 'scripts/grammar-bank/bulk-update.mjs', 'tmp-grammar-bank/unit-audit/apply.json'], capture_output=True, text=True, encoding='utf-8')
    print((r.stdout + r.stderr).strip()[-60:])
