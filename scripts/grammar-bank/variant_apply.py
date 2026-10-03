# -*- coding: utf-8 -*-
"""중복 문항을 바꿔 쓴 변형(out_v*.json)을 검사해 적고 다시 보이게 한다.
   python scripts/grammar-bank/variant_apply.py [apply]"""
import json, re, sys, glob, subprocess
from difflib import SequenceMatcher
CIRC = '①②③④⑤⑥'
pairs = {}
for f in glob.glob('tmp-grammar-bank/variant/chunks/v*.json'):
    for it in json.load(open(f, encoding='utf-8')): pairs[it['copy']['id']] = it
def text(q): return re.sub(r'\s+', ' ', re.sub(r'_+', '', ' '.join(q['body']) + ' ' + ' '.join(c['text'] for c in (q['choices'] or [])))).strip().lower()
ok, bad, seen = [], [], set()
for f in sorted(glob.glob('tmp-grammar-bank/variant/out_v*.json')):
    for e in json.load(open(f, encoding='utf-8')):
        i = e.get('id')
        if i not in pairs or i in seen: bad.append((i, 'id')); continue
        seen.add(i)
        o = pairs[i]['original']
        if any(k not in e for k in ('prompt', 'body', 'choices', 'answer')): bad.append((i, 'fields')); continue
        ch, ans = e['choices'] or [], (e['answer'] or '').strip()
        why = None
        if not ans: why = 'empty answer'
        elif len(ch) != len(o['choices'] or []): why = 'choice count'
        elif ch and [c['no'] for c in ch] != list(range(1, len(ch) + 1)): why = 'numbering'
        elif ch and any(c in CIRC and CIRC.index(c) + 1 > len(ch) for c in ans): why = 'answer range'
        else:
            sim = SequenceMatcher(None, text(e), text(o)).ratio()
            if sim > 0.92 and text(o): why = f'too similar {sim:.2f}'
        if why: bad.append((i, why)); continue
        ok.append({'id': i, 'prompt': e['prompt'].strip(), 'body': e['body'], 'choices': ch, 'answer': ans,
                   'explanation': (e.get('explanation') or '').strip() or None, 'excluded_reason': None})
print(f'ok {len(ok)} / bad {len(bad)} / not yet {len(set(pairs) - seen)}')
for b in bad[:30]: print('  bad', b)
if 'apply' in sys.argv:
    json.dump(ok, open('tmp-grammar-bank/variant/apply.json', 'w', encoding='utf-8'), ensure_ascii=False)
    r = subprocess.run(['node', 'scripts/grammar-bank/bulk-update.mjs', 'tmp-grammar-bank/variant/apply.json'], capture_output=True, text=True, encoding='utf-8')
    print((r.stdout + r.stderr).strip()[-60:])
