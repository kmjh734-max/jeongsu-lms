# -*- coding: utf-8 -*-
"""손으로 다시 쓴 문항의 옛 변형을 치운다.

보기 순서만 섞였던 변형을 손으로 새로 쓴 것으로 갈아 끼울 때 쓴다.
merge_handmade는 이미 변형이 있는 문항을 건너뛰므로, 합치기 전에 먼저 치워야 한다.
"""
import json, sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))
from merge_handmade import load_all


def main(bank_path, variants_path):
    bank = json.loads(Path(bank_path).read_text(encoding="utf-8"))
    made = json.loads(Path(variants_path).read_text(encoding="utf-8"))
    wanted = {(r["file"], r["number"]) for r in load_all()}

    def sig(q):
        return (q["prompt"].strip(), tuple(x.strip() for x in q["body"]),
                (q["answer"] or "").strip(),
                tuple(c["text"].strip() for c in q["choices"]))

    # 같은 문제가 다른 회차에 실린 것까지 함께 치운다.
    marks = {sig(q) for q in bank if (q["file"], q["number"]) in wanted}
    drop = {(q["file"], q["number"]) for q in bank if sig(q) in marks}

    kept = [v for v in made
            if (v["origin_file"], v["origin_number"]) not in drop
            or v.get("handmade")]
    print("옛 변형 %d개 치움" % (len(made) - len(kept)))
    Path(variants_path).write_text(json.dumps(kept, ensure_ascii=False),
                                   encoding="utf-8")


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
