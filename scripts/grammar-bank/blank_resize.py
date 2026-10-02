# -*- coding: utf-8 -*-
"""빈칸 너비를 답 길이에 맞춘다. 바깥 모델은 부르지 않는다.
   python scripts/grammar-bank/blank_resize.py        -> tmp-grammar-bank/blank-audit/resize.json 만 만든다
"""
import json, re, sys
from collections import Counter

d = json.load(open('tmp-grammar-bank/bank-all.json', encoding='utf-8'))
CIRC = '①②③④⑤'
RUN = re.compile(r'_{2,}')
LETTER = re.compile(r'\[\[\s*([ⓐ-ⓩ]|\([A-Ea-e]\)|[A-E]|㉠|㉡|㉢|㉣)\s*\]\]')
EMPTY = re.compile(r'\[\[\s*\]\]')

def split_answer(ans, n):
    """답을 빈칸 개수만큼 나눈다. 못 나누면 None"""
    a = ans.strip()
    parts = None
    m = re.findall(r'\(\d+\)\s*([^()]+?)(?=\s*\(\d+\)|$)', a)
    if len(m) == n: parts = m
    if parts is None:
        for sep in (' / ', ', ', ' - ', ' – ', ' – '):
            if a.count(sep) == n - 1:
                parts = a.split(sep); break
    if parts is None and n == 1: parts = [a]
    return [p.strip() for p in parts] if parts else None

def width_for(text, lo, hi):
    return max(lo, min(hi, len(text) + 2))

out = []
stat = Counter()
for q in d:
    body = list(q['body']); choices = [dict(c) for c in (q['choices'] or [])]
    ans = str(q['answer'] or '')
    texts = body + [c['text'] for c in choices]
    runs = RUN.findall('\n'.join(texts))
    is_mc = bool(choices) and ans.strip() != '' and all(ch in CIRC for ch in ans.strip())
    changed = False
    # 1) 글자 표식 빈칸 [[ⓐ]] -> ___ⓐ___ 
    def letter_fix(s):
        return LETTER.sub(lambda m: '___' + m.group(1) + '___', s)
    nb = [letter_fix(s) for s in body]; nc = [dict(c, text=letter_fix(c['text'])) for c in choices]
    np_ = letter_fix(q['prompt'] or '')
    if nb != body or [c['text'] for c in nc] != [c['text'] for c in choices]:
        changed = True; stat['letter'] += 1
    body, choices = nb, nc
    # 2) 밑줄 길이
    runs = RUN.findall('\n'.join(body + [c['text'] for c in choices]))
    if runs:
        in_choice = any(RUN.search(c['text']) for c in choices)
        if is_mc and in_choice:
            widths = [6] * len(runs)          # 보기 안 빈칸은 자리만 보이면 된다
        elif is_mc:
            longest = max(len(c['text']) for c in choices)
            w = width_for(' ' * (longest // len(runs)), 6, 14)
            widths = [w] * len(runs)
        else:
            parts = split_answer(ans, len(runs))
            if parts:
                widths = [width_for(p, 6, 36) for p in parts]
            else:
                # 나누지 못하면 평균으로
                w = width_for(' ' * (len(ans) // max(1, len(runs))), 6, 36)
                widths = [w] * len(runs)
        it = iter(widths)
        def resize(s):
            return RUN.sub(lambda m: '_' * max(len(m.group(0)), next(it)), s)   # 줄이지는 않는다
        nb = [resize(s) for s in body]
        nc = [dict(c, text=resize(c['text'])) for c in choices]
        if nb != body or [c['text'] for c in nc] != [c['text'] for c in choices]:
            changed = True; stat['resize'] += 1
            stat['resize_mc' if is_mc else 'resize_written'] += 1
        body, choices = nb, nc
    if changed:
        out.append({'id': q['id'], 'body': body, 'choices': choices if choices else None,
                    'prompt': np_ if np_ != (q['prompt'] or '') else None})
json.dump(out, open('tmp-grammar-bank/blank-audit/resize.json', 'w', encoding='utf-8'), ensure_ascii=False, indent=0)
print(stat, len(out))
