# -*- coding: utf-8 -*-
"""숨긴 문항 고친 결과(out_r*.json)를 검사해 적고, 고친 문항은 다시 보이게 한다.
   python scripts/grammar-bank/repair_apply.py [apply]"""
import json, re, sys, glob, subprocess
D = {q['id']: q for q in json.load(open('tmp-grammar-bank/bank-all.json', encoding='utf-8'))}
CIRC = '①②③④⑤⑥'
want = set()
for f in glob.glob('tmp-grammar-bank/repair/chunks/[rx]*.json'):
    want |= {q['id'] for q in json.load(open(f, encoding='utf-8'))}
ok, drop, bad, seen = [], [], [], set()
for f in sorted(glob.glob('tmp-grammar-bank/repair/out_[rx]*.json')):
    for e in json.load(open(f, encoding='utf-8')):
        i = e.get('id')
        if i not in want: bad.append((i, 'id')); continue
        if i in seen:
            if 'out_x' not in f: bad.append((i, 'dup')); continue
            drop = [x for x in drop if x['id'] != i]   # 다시 만든 것이 앞의 '고칠 수 없음'을 덮는다
        seen.add(i)
        if 'drop' in e: drop.append({'id': i, 'excluded_reason': ('고칠 수 없음: ' + e['drop'])[:120]}); continue
        need = ('prompt', 'body', 'choices', 'answer')
        if any(k not in e for k in need): bad.append((i, 'fields')); continue
        body, ch, ans = e['body'], e['choices'] or [], (e['answer'] or '').strip()
        why = None
        if not isinstance(body, list) or not all(isinstance(x, str) for x in body): why = 'body type'
        elif not (e['prompt'] or '').strip(): why = 'empty prompt'
        elif not ans: why = 'empty answer'
        elif ch and any(not str(c.get('text', '')).strip() for c in ch): why = 'empty choice'
        elif ch and [c['no'] for c in ch] != list(range(1, len(ch) + 1)): why = 'choice numbering'
        elif ch and all(c in CIRC + ', ' for c in ans) and any(CIRC.index(c) + 1 > len(ch) for c in ans if c in CIRC): why = 'answer out of range'
        elif re.search(r'\[\[(대표유형|풀이)', ' '.join(body) + ' '.join(c['text'] for c in ch)): why = 'meta left'
        if why: bad.append((i, why)); continue
        ok.append({'id': i, 'prompt': e['prompt'].strip(), 'body': body, 'choices': ch, 'answer': ans,
                   'explanation': (e.get('explanation') or '').strip() or None, 'excluded_reason': None})
missing = sorted(want - seen)
print(f'ok {len(ok)} / drop {len(drop)} / bad {len(bad)} / not yet {len(missing)}')
for b in bad[:20]: print('  bad', b)
if 'apply' in sys.argv:
    json.dump(ok + drop, open('tmp-grammar-bank/repair/apply.json', 'w', encoding='utf-8'), ensure_ascii=False)
    r = subprocess.run(['node', 'scripts/grammar-bank/bulk-update.mjs', 'tmp-grammar-bank/repair/apply.json'], capture_output=True, text=True, encoding='utf-8')
    print((r.stdout + r.stderr).strip()[-60:])
