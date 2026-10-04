# -*- coding: utf-8 -*-
"""정답·본문 바로잡기(verify4/out/v*.json)를 검사해 적는다. f* 는 신고된 문항, e* 는 전수 확인.
   python scripts/grammar-bank/verify4_apply.py [apply]"""
import json, re, sys, glob, subprocess
D = {q['id']: q for q in json.load(open('tmp-grammar-bank/bank-all.json', encoding='utf-8'))}
CIRC = '①②③④⑤⑥'
want = set()
for f in glob.glob('tmp-grammar-bank/verify4/chunks/v*.json'):
    want |= {q['id'] for q in json.load(open(f, encoding='utf-8'))}
ok, drop, bad, seen = [], [], [], set()
for f in sorted(glob.glob('tmp-grammar-bank/verify4/out/v*.json')):
    for e in json.load(open(f, encoding='utf-8')):
        i = e.get('id')
        if i not in want: bad.append((i, 'id')); continue
        if i in seen:
            bad.append((i, 'dup')); continue
        seen.add(i)
        if 'ok' in e: continue
        if 'drop' in e: drop.append({'id': i, 'excluded_reason': ('고칠 수 없음: ' + e['drop'])[:120]}); continue
        need = ('prompt', 'body', 'choices', 'answer')
        if any(k not in e for k in need): bad.append((i, 'fields')); continue
        body, ch, ans = e['body'], e['choices'] or [], (e['answer'] or '').strip()
        why = None
        if not isinstance(body, list) or not all(isinstance(x, str) for x in body): why = 'body type'
        elif not (e['prompt'] or '').strip(): why = 'empty prompt'
        elif not ans and (D[i].get('answer') or '').strip(): why = 'empty answer'
        elif ch and any(not str(c.get('text', '')).strip() for c in ch): why = 'empty choice'
        elif ch and [c['no'] for c in ch] != list(range(1, len(ch) + 1)): why = 'choice numbering'
        elif ch and all(c in CIRC + ', ' for c in ans) and any(CIRC.index(c) + 1 > len(ch) for c in ans if c in CIRC): why = 'answer out of range'
        elif re.search(r'\[\[(대표유형|풀이)', ' '.join(body) + ' '.join(c['text'] for c in ch)): why = 'meta left'
        if why: bad.append((i, why)); continue
        ok.append({'id': i, 'prompt': e['prompt'].strip(), 'body': body, 'choices': ch, 'answer': ans or None,
                   'explanation': (e.get('explanation') or '').strip() or None})
flag = set()
for f in glob.glob('tmp-grammar-bank/repair3/chunks/NONE*.json'): flag |= {q['id'] for q in json.load(open(f, encoding='utf-8'))}
missing = sorted(flag - seen)
print(f'ok {len(ok)} / drop {len(drop)} / bad {len(bad)} / not yet {len(missing)}')
for b in bad[:20]: print('  bad', b)
if 'apply' in sys.argv:
    json.dump(ok + drop, open('tmp-grammar-bank/verify4/apply.json', 'w', encoding='utf-8'), ensure_ascii=False)
    r = subprocess.run(['node', 'scripts/grammar-bank/bulk-update.mjs', 'tmp-grammar-bank/verify4/apply.json'], capture_output=True, text=True, encoding='utf-8')
    print((r.stdout + r.stderr).strip()[-60:])
