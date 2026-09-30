# -*- coding: utf-8 -*-
"""세부 단원 이름을 단원마다 한 벌로 추려 은행에 올린다.

  python scripts/grammar-bank/apply_units.py          (세어만 본다)
  python scripts/grammar-bank/apply_units.py --적용    (정말 올린다)

바깥 서비스는 부르지 않는다. 표대로 이름만 바꾼다.
"""
import collections, io, json, os, re, sys, urllib.request
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from unit_map import UNITS, settle

log = io.open(1, "w", encoding="utf-8", closefd=False)


def env():
    got = {}
    for line in Path(".env.local").read_text(encoding="utf-8").splitlines():
        m = re.match(r"^([A-Z0-9_]+)=(.*)$", line)
        if m:
            got[m.group(1)] = m.group(2).strip('"')
    return got


E = env()
BASE = E["NEXT_PUBLIC_SUPABASE_URL"] + "/rest/v1/grammar_bank_questions"
HEAD = {
    "apikey": E["SUPABASE_SERVICE_ROLE_KEY"],
    "Authorization": "Bearer " + E["SUPABASE_SERVICE_ROLE_KEY"],
    "Content-Type": "application/json",
}


def get(query):
    req = urllib.request.Request(BASE + query, headers=HEAD)
    with urllib.request.urlopen(req) as r:
        return json.loads(r.read().decode())


def patch(query, body):
    req = urllib.request.Request(
        BASE + query, headers={**HEAD, "Prefer": "return=minimal"},
        data=json.dumps(body).encode(), method="PATCH")
    with urllib.request.urlopen(req) as r:
        return r.status


def main(apply=False):
    rows = []
    step = 1000
    for start in range(0, 20000, step):
        got = get("?select=id,level,chapter,unit&order=id&offset=%d&limit=%d" % (start, step))
        rows += got
        if len(got) < step:
            break
    print("은행 %d문항" % len(rows), file=log)

    plan = collections.defaultdict(list)    # (지금 이름, 바꿀 이름) → id 들
    for r in rows:
        if not r.get("unit"):
            continue
        want = settle(r["level"], r["chapter"], r["unit"])
        if want != r["unit"]:
            plan[(r["level"], r["chapter"], r["unit"], want)].append(r["id"])

    moved = sum(len(v) for k, v in plan.items() if k[3])
    cleared = sum(len(v) for k, v in plan.items() if not k[3])
    print("이름을 바꿀 문항 %d개 · 세부를 지울 문항 %d개" % (moved, cleared), file=log)
    for key in sorted(plan, key=lambda k: (k[0], k[1], k[2])):
        lv, ch, now, want = key
        print("   [%d] %-16s %-28s → %s (%d개)"
              % (lv, ch, now, want or "(지움)", len(plan[key])), file=log)

    if not apply:
        print("\n세어만 봤습니다. 정말 올리려면 --적용 을 붙이세요.", file=log)
        log.flush()
        return

    for key, ids in plan.items():
        want = key[3]
        for i in range(0, len(ids), 100):
            chunk = ids[i:i + 100]
            where = "?id=in.(%s)" % ",".join(str(x) for x in chunk)
            patch(where, {"unit": want, **({} if want else {"unit_no": None})})
    print("\n올렸습니다.", file=log)

    after = []
    for start in range(0, 20000, step):
        got = get("?select=level,chapter,unit&order=id&offset=%d&limit=%d" % (start, step))
        after += got
        if len(got) < step:
            break
    by = collections.defaultdict(set)
    for r in after:
        if r.get("unit"):
            by[(r["level"], r["chapter"])].add(r["unit"])
    odd = {k: sorted(v - set(UNITS.get(k, []))) for k, v in by.items()}
    odd = {k: v for k, v in odd.items() if v}
    if odd:
        print("표에 없는 이름이 남았습니다:", file=log)
        for k, v in sorted(odd.items()):
            print("   [%d] %-18s %s" % (k[0], k[1], v), file=log)
    else:
        print("모든 세부 이름이 표 안에 듭니다.", file=log)
    log.flush()


if __name__ == "__main__":
    main("--적용" in sys.argv)
