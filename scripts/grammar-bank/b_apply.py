# -*- coding: utf-8 -*-
"""정답 검수(out_b*.json) 결과를 검증해 적는다.  python scripts/grammar-bank/b_apply.py [apply]"""
import json, re, sys, glob, subprocess
from collections import Counter
D = {q['id']: q for q in json.load(open('tmp-grammar-bank/bank-all.json', encoding='utf-8'))}
HAN = re.compile(r'[가-힣]')
CIRC = '①②③④⑤'
patches, excl, blank_missing, skipped = {}, [], [], Counter()
def pat(i): return patches.setdefault(i, {'id': i})
for f in sorted(glob.glob('tmp-grammar-bank/answer-audit/out_b*.json')):
    try: rows = json.load(open(f, encoding='utf-8'))
    except Exception as ex: print('bad json', f, ex); continue
    for e in rows:
        i = e.get('id'); q = D.get(i)
        if not q: skipped['no id'] += 1; continue
        iss = e.get('issue', '')
        note = e.get('note') or ''
        if iss == 'explanation_mismatch':
            fx = e.get('fix_explanation')
            if fx and fx.strip() and fx.strip() != (q['explanation'] or '').strip(): pat(i)['explanation'] = fx.strip()
            else: skipped['exp no fix'] += 1
        elif iss in ('answer_wrong', 'truncated_answer'):
            fa = e.get('fix_answer')
            if fa and fa.strip():
                # 객관식 정답은 ①~⑤ 또는 ⓐ~ⓔ 꼴만 받는다
                old_n = sum(c in CIRC for c in (q['answer'] or '')); new_n = sum(c in CIRC for c in fa)
                if q['choices'] and (new_n > max(old_n, 1) or (old_n and new_n == 0 and not any(c in 'ⓐⓑⓒⓓⓔ' for c in fa))):
                    skipped['mc answer odd'] += 1; excl.append({'id': i, 'excluded_reason': ('정답 의심: ' + note)[:120]})
                else: pat(i)['answer'] = fa.strip()
                if e.get('fix_explanation'): pat(i)['explanation'] = e['fix_explanation'].strip()
            else: excl.append({'id': i, 'excluded_reason': ('정답 틀림: ' + note)[:120]})
        elif iss == 'korean_mismatch':
            excl.append({'id': i, 'excluded_reason': ('우리말·영문 불일치: ' + note)[:120]})
        elif iss == 'answer_shifted':
            fa = e.get('fix_answer')
            if fa and fa.strip():
                pat(i)['answer'] = fa.strip()
                if q['explanation']: pat(i)['explanation'] = None   # 밀린 해설도 같이 지운다
            else: excl.append({'id': i, 'excluded_reason': ('정답 밀림: ' + note)[:120]})
        elif iss == 'garbled':
            allt = ' '.join(q['body']) + ' '.join(c['text'] for c in (q['choices'] or []))
            if re.search(r'밑줄', note) and '[[' in allt: skipped['underline already fixed'] += 1
            elif re.search(r'빈칸|밑줄.*(누락|빠짐|사라|없음)|blank', note): blank_missing.append(i)
            else: excl.append({'id': i, 'excluded_reason': ('본문 깨짐: ' + note)[:120]})
        else: skipped['unknown ' + iss] += 1
ex_ids = {e['id'] for e in excl}
out = [p for p in patches.values() if len(p) > 1 and p['id'] not in ex_ids] + excl
print(f'patches {len(out) - len(excl)} / exclude {len(excl)} / blank-missing {len(blank_missing)} / skipped {dict(skipped)}')
json.dump(blank_missing, open('tmp-grammar-bank/answer-audit/blank-missing-ids.json', 'w'))
if 'apply' in sys.argv:
    json.dump(out, open('tmp-grammar-bank/answer-audit/apply.json', 'w', encoding='utf-8'), ensure_ascii=False)
    for p in out:
        for k in ('answer', 'explanation', 'body'):
            if k in p: D[p['id']][k] = p[k]
    json.dump(list(D.values()), open('tmp-grammar-bank/bank-all.json', 'w', encoding='utf-8'), ensure_ascii=False)
    r = subprocess.run(['node', 'scripts/grammar-bank/bulk-update.mjs', 'tmp-grammar-bank/answer-audit/apply.json'], capture_output=True, text=True, encoding='utf-8')
    print((r.stdout + r.stderr).strip()[-80:])
