# -*- coding: utf-8 -*-
"""빈칸 보정 결과를 검증하고 DB 에 적는다. 바깥 모델은 부르지 않는다.
   python scripts/grammar-bank/blank_verify_apply.py verify   -> 검증만
   python scripts/grammar-bank/blank_verify_apply.py apply    -> 검증 통과분을 DB 에 적는다 (원본은 backup.json)
"""
import json, re, sys, glob, urllib.request
sys.path.insert(0, 'scripts/grammar-bank')
import db

D = {q['id']: q for q in json.load(open('tmp-grammar-bank/bank-all.json', encoding='utf-8'))}
AUD = 'tmp-grammar-bank/blank-audit/'

def norm(s):
    return re.sub(r'\s+', ' ', re.sub(r'_+', '', s or '')).strip()

def same_words(a, b):
    return norm(a) == norm(b)

END_BLANK = re.compile(r'_{2,}\s*$')
START_BLANK = re.compile(r'^\s*_{2,}')
CONT = re.compile(r'^\s*(?:[a-z]|[,.?!;:)])')   # 소문자나 문장 부호로 시작하면 앞줄에서 꺾인 줄
LABEL = re.compile(r'^\s*(?:[A-Z]\s*:|[ⓐ-ⓩ]|\(\d|\d+[.)]|<|→|=|➜)')

def join_blank_wraps(body):
    """빈칸에서 줄이 꺾인 곳만 이어 붙인다 — '... ________' / 'Luna.' 처럼"""
    out = list(body)
    i = 0
    while i < len(out) - 1:
        a, b = out[i], out[i + 1]
        if END_BLANK.search(a) and CONT.match(b) and not LABEL.match(b):
            out[i] = a.rstrip() + ('' if re.match(r'^\s*[,.?!;:)]', b) else ' ') + b.lstrip(); del out[i + 1]; continue
        if START_BLANK.match(b) and a.strip() and not re.search(r'[.?!:]\s*$', a) and not LABEL.match(b) and len(a) < 60:
            out[i] = a.rstrip() + ' ' + b.lstrip(); del out[i + 1]; continue
        i += 1
    return out

ok, bad, skip, manual = [], [], [], []
seen = set()
PREFIX = [a for a in sys.argv[1:] if a.startswith('fill_')]
for f in sorted(glob.glob(AUD + (PREFIX[0] if PREFIX else 'fill_c*') + '.json')):
    for e in json.load(open(f, encoding='utf-8')):
        i = e['id']
        if i in seen: bad.append((i, 'dup')); continue
        seen.add(i)
        if 'skip' in e: skip.append((i, e['skip'])); continue
        if 'manual' in e: manual.append((i, e['manual'])); continue
        q = D[i]
        body = e.get('body') or q['body']
        choices = e.get('choices') or q['choices']
        if len(body) != len(q['body']) or any(not same_words(a, b) for a, b in zip(body, q['body'])):
            bad.append((i, 'body words changed')); continue
        if choices and ([c['text'] for c in choices] and (not q['choices'] or len(choices) != len(q['choices'])
                or any(not same_words(a['text'], b['text']) for a, b in zip(choices, q['choices'])))):
            bad.append((i, 'choice words changed')); continue
        if not re.search(r'_{2,}', '\n'.join(body + [c['text'] for c in (choices or [])])):
            bad.append((i, 'no blank inserted')); continue
        ok.append({'id': i, 'body': join_blank_wraps(body), 'choices': choices if choices and choices != q['choices'] else None})
missing = [] if PREFIX else [i for i in json.load(open('tmp-grammar-bank/noblank-ids.json')) if i not in seen]
print(f'ok {len(ok)} / bad {len(bad)} / skip {len(skip)} / manual {len(manual)} / missing {len(missing)}')
json.dump({'ok': ok, 'bad': bad, 'skip': skip, 'manual': manual, 'missing': missing},
          open(AUD + 'verify.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=1)

if len(sys.argv) > 1 and sys.argv[1] == 'apply':
    if PREFIX:
        patches = ok
    else:
        resize = json.load(open(AUD + 'resize.json', encoding='utf-8'))
        filled = {e['id'] for e in ok}
        for e in resize: e['body'] = join_blank_wraps(e['body'])
        patches = ok + [e for e in resize if e['id'] not in filled]
        patches += json.load(open(AUD + 'manual_fixes.json', encoding='utf-8'))
    # 원본을 남긴다
    json.dump([{k: D[e['id']][k] for k in ('id', 'prompt', 'body', 'choices')} for e in patches],
              open(AUD + 'backup.json', 'w', encoding='utf-8'), ensure_ascii=False)
    n = 0
    for e in patches:
        body = {'body': e['body']}
        if e.get('choices'): body['choices'] = e['choices']
        if e.get('prompt'): body['prompt'] = e['prompt']
        req = urllib.request.Request(db._url('id=eq.%d' % e['id']), headers={**db.HEAD, 'Prefer': 'return=minimal'},
                                     data=json.dumps(body).encode(), method='PATCH')
        with urllib.request.urlopen(req): pass
        n += 1
        if n % 200 == 0: print('  ', n, '/', len(patches), flush=True)
    print('applied', n)
