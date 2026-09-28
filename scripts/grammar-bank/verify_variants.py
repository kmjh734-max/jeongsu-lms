# -*- coding: utf-8 -*-
"""변형본을 원본과 맞대어 전수 검사한다.

가장 확실한 검사는 이것이다 — 순서만 섞은 변형이라면, 변형본의 정답 보기 내용은
원본의 정답 보기 내용과 글자 하나까지 같아야 한다. 다르면 정답이 어긋난 것이다.
"""
import collections, json, re, sys
from pathlib import Path

MARKERS = "①②③④⑤"
WORD = re.compile(r"[A-Za-z][A-Za-z']*")


def picked(answer):
    return [MARKERS.index(c) for c in (answer or "") if c in MARKERS]


def main(bank_path, variants_path):
    bank = json.loads(Path(bank_path).read_text(encoding="utf-8"))
    made = json.loads(Path(variants_path).read_text(encoding="utf-8"))
    index = {(q["file"], q["number"]): q for q in bank}

    problems = collections.Counter()
    samples = collections.defaultdict(list)
    checked_order = 0

    def note(kind, row):
        problems[kind] += 1
        if len(samples[kind]) < 3:
            samples[kind].append("%s %d번" % (row["origin_file"], row["origin_number"]))

    for row in made:
        if row.get("handmade"):
            continue          # 손으로 새로 쓴 것은 원본과 글이 달라야 정상이다
        origin = index[(row["origin_file"], row["origin_number"])]
        text_changed = any(not c.startswith("선택지") for c in row["changes"])

        # 1. 순서만 섞었다면 정답 보기의 내용이 그대로여야 한다.
        if not text_changed and row["choices"]:
            before, after = picked(origin["answer"]), picked(row["answer"])
            if len(before) != len(after):
                note("정답 개수가 달라짐", row)
            else:
                checked_order += 1
                for old, new in zip(before, after):
                    if (old < len(origin["choices"]) and new < len(row["choices"])
                            and origin["choices"][old]["text"].strip()
                            != row["choices"][new]["text"].strip()):
                        note("정답이 다른 보기를 가리킴", row)
                        break
                old_set = sorted(c["text"].strip() for c in origin["choices"])
                new_set = sorted(c["text"].strip() for c in row["choices"])
                if old_set != new_set:
                    note("보기 구성이 달라짐", row)

        # 2. 해설이 집어 말한 영어 낱말은 그대로여야 한다.
        told = replay(origin["explanation"] or "", row.get("table") or {}, False)
        old_words = collections.Counter(w.lower() for w in WORD.findall(told))
        new_words = collections.Counter(w.lower() for w in WORD.findall(row["explanation"] or ""))
        if old_words != new_words:
            note("해설 속 영어가 바뀜", row)

        # 3. 밑줄 친 부분은 그대로여야 한다.
        def spans(item):
            blob = " ".join([item["prompt"]] + list(item["body"])
                            + [c["text"] for c in item["choices"]])
            return sorted(re.findall(r"\[\[.*?\]\]", blob))
        if spans(origin) != spans(row):
            note("밑줄이 바뀜", row)

        # 4. 정답이 비었거나 범위를 벗어나면 안 된다.
        marks = picked(row["answer"])
        if not (row["answer"] or "").strip():
            note("정답이 비었음", row)
        if marks and max(marks) >= len(row["choices"]):
            note("정답 번호가 보기를 벗어남", row)

        # 5. 원본과 아무것도 안 달라졌으면 변형이 아니다.
        same = (row["prompt"] == origin["prompt"]
                and row["body"] == origin["body"]
                and [c["text"] for c in row["choices"]]
                    == [c["text"] for c in origin["choices"]])
        if same:
            note("원본과 같음", row)

    print("변형 %d개 / 그중 순서만 바꾼 것 %d개를 원본과 글자 단위로 대조함\n"
          % (len(made), checked_order))
    if not problems:
        print("어긋난 곳 없음")
    for kind, count in problems.most_common():
        print("  %-22s %4d건   예) %s" % (kind, count, "; ".join(samples[kind])))




# ── 끝까지 되짚는 검사 ──────────────────────────────────────────────────────

import sys as _sys
from pathlib import Path as _Path
_sys.path.insert(0, str(_Path(__file__).parent))
import gender as _gender


def replay(text, table, flip):
    """기록해 둔 바꿈표를 원본 글에 그대로 다시 적용한다."""
    out = text
    if table:
        english = [k for k in table if re.fullmatch(r"[A-Za-z ]+", k)]
        korean = [k for k in table if k not in english]
        parts = []
        if english:
            body = "|".join(re.escape(w) for w in sorted(english, key=len, reverse=True))
            parts.append(r"(?<![A-Za-z'])(%s)(?![A-Za-z'])" % body)
        parts += [re.escape(k) for k in sorted(korean, key=len, reverse=True)]
        out = re.compile("|".join(parts)).sub(lambda m: table[m.group(0)], out)
    if flip:
        out = _gender.flip(out)
    return out


def check_answer_content(bank_path, variants_path):
    bank = json.loads(_Path(bank_path).read_text(encoding="utf-8"))
    made = json.loads(_Path(variants_path).read_text(encoding="utf-8"))
    index = {(q["file"], q["number"]): q for q in bank}
    checked, bad = 0, []
    for row in made:
        if row.get("handmade"):
            continue
        origin = index[(row["origin_file"], row["origin_number"])]
        if not row["choices"] or not origin["choices"]:
            continue
        before, after = picked(origin["answer"]), picked(row["answer"])
        if len(before) != 1 or len(after) != 1:
            continue
        if before[0] >= len(origin["choices"]) or after[0] >= len(row["choices"]):
            continue
        want = replay(origin["choices"][before[0]]["text"],
                      row.get("table") or {}, row.get("flipped")).strip()
        got = row["choices"][after[0]]["text"].strip()
        checked += 1
        if want != got:
            bad.append((row, want, got))
    print("\n정답 보기 내용을 끝까지 되짚어 본 것 %d개" % checked)
    if not bad:
        print("  모두 일치")
    for row, want, got in bad[:6]:
        print("  %s %d번" % (row["origin_file"], row["origin_number"]))
        print("    있어야 할 정답 보기:", want[:70])
        print("    실제 정답 보기    :", got[:70])
    if len(bad) > 6:
        print("  … 그 밖 %d건" % (len(bad) - 6))


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
