# -*- coding: utf-8 -*-
"""A 판단 묶음 결과를 검증하고 적는다.  python scripts/grammar-bank/a_verify_apply.py [apply] [a00 a01 ...]"""
import json, re, sys, glob, subprocess
D = {q['id']: q for q in json.load(open('tmp-grammar-bank/bank-all.json', encoding='utf-8'))}
def norm(s): return re.sub(r'\s+', ' ', (s or '').replace('[[', '').replace(']]', '').replace('<보기>', '')).strip()
def same(a, b): return norm(a) == norm(b)
want = [a for a in sys.argv[1:] if a != 'apply']
files = sorted(glob.glob('tmp-grammar-bank/a-audit/out_a*.json'))
if want: files = [f for f in files if any(f.endswith(w + '.json') for w in want)]
ACCEPT = {48762,50009,50088,50095,50265,50308,50309,50372,50378,50401}   # 손으로 확인한 되붙임
ok, bad, excl = [], [], []
for f in files:
    for e in json.load(open(f, encoding='utf-8')):
        q = D.get(e['id'])
        if not q: bad.append((e['id'], 'no such id')); continue
        if 'exclude' in e: excl.append({'id': e['id'], 'excluded_reason': e['exclude'][:120]}); continue
        patch = {'id': e['id']}
        good = True
        if e.get('body') is not None:
            if len(e['body']) != len(q['body']) or any(not same(a, b) for a, b in zip(e['body'], q['body'])):
                # 줄 수가 달라도 전체 글이 같으면 허용 (보기 줄 합침 없음이 원칙이지만 안전하게)
                if not same(' '.join(e['body']), ' '.join(q['body'])): good = False
            patch['body'] = e['body']
        if e.get('choices') is not None:
            qc = q['choices'] or []
            if len(e['choices']) != len(qc) or any(not same(a['text'], b['text']) for a, b in zip(e['choices'], qc)): good = False
            patch['choices'] = e['choices']
        if e.get('prompt') is not None:
            newp, oldp = norm(e['prompt']), norm(q['prompt'])
            # 발문은 줄이기만 허용: 새 발문의 낱말이 모두 옛 발문에 있어야 한다
            if not newp or any(w not in oldp for w in newp.split()): good = False
            patch['prompt'] = e['prompt']
        if len(patch) == 1: continue
        if not good and e.get('body') is not None and e.get('choices') is not None:
            # 보기 꼬리가 본문으로 떨어진 것을 되붙인 경우: 전체 글이 같으면 허용
            whole_new = norm(' '.join(e['body']) + ' ' + ' '.join(c['text'] for c in e['choices']))
            whole_old = norm(' '.join(q['body']) + ' ' + ' '.join(c['text'] for c in (q['choices'] or [])))
            if re.sub(r'_+', '', whole_new) == re.sub(r'_+', '', whole_old) and len(e['choices']) == len(q['choices'] or []): good = True
        if e['id'] in ACCEPT: good = True
        (ok if good else bad).append(patch if good else (e['id'], 'text changed beyond markers'))
print(f'ok {len(ok)} / bad {len(bad)} / exclude {len(excl)}')
for b in bad[:15]: print('  bad', b)
if 'apply' in sys.argv:
    json.dump(ok + excl, open('tmp-grammar-bank/a-audit/apply.json', 'w', encoding='utf-8'), ensure_ascii=False)
    for e in ok:
        for k in ('prompt', 'body', 'choices'):
            if k in e: D[e['id']][k] = e[k]
    json.dump(list(D.values()), open('tmp-grammar-bank/bank-all.json', 'w', encoding='utf-8'), ensure_ascii=False)
    print(subprocess.run(['node', 'scripts/grammar-bank/bulk-update.mjs', 'tmp-grammar-bank/a-audit/apply.json'], capture_output=True, text=True, encoding='utf-8').stdout.strip()[-40:])
