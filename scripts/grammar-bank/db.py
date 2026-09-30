# -*- coding: utf-8 -*-
"""문법 은행 표를 읽고 쓰는 작은 손. 바깥 서비스는 부르지 않는다."""
import json, re, urllib.parse, urllib.request
from pathlib import Path

_E = {}
for _line in Path(".env.local").read_text(encoding="utf-8").splitlines():
    _m = re.match(r"^([A-Z0-9_]+)=(.*)$", _line)
    if _m:
        _E[_m.group(1)] = _m.group(2).strip('"')

BASE = _E["NEXT_PUBLIC_SUPABASE_URL"] + "/rest/v1/grammar_bank_questions"
HEAD = {
    "apikey": _E["SUPABASE_SERVICE_ROLE_KEY"],
    "Authorization": "Bearer " + _E["SUPABASE_SERVICE_ROLE_KEY"],
    "Content-Type": "application/json",
}


def _url(query):
    return BASE + "?" + urllib.parse.quote(query, safe='=&()",.[]*<>!')


def rows(select, where="", step=1000, cap=20000):
    """줄을 모두 읽어 온다"""
    out = []
    for start in range(0, cap, step):
        q = "select=%s&order=id&offset=%d&limit=%d" % (select, start, step)
        if where:
            q += "&" + where
        req = urllib.request.Request(_url(q), headers=HEAD)
        with urllib.request.urlopen(req) as r:
            got = json.loads(r.read().decode())
        out += got
        if len(got) < step:
            break
    return out


def update(ids, body, step=100):
    """id 들에 같은 값을 적는다"""
    for i in range(0, len(ids), step):
        chunk = ids[i:i + step]
        q = "id=in.(%s)" % ",".join(str(x) for x in chunk)
        req = urllib.request.Request(
            _url(q), headers={**HEAD, "Prefer": "return=minimal"},
            data=json.dumps(body).encode(), method="PATCH")
        with urllib.request.urlopen(req):
            pass
