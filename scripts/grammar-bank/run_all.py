# -*- coding: utf-8 -*-
"""족보닷컴 문법 교재 네 권을 통째로 뽑아 문제 은행 자료를 만든다.

파일 이름이 곧 목차다 — "[기초] 1.be동사_체크체크.pdf".
"""
import collections, json, re, sys, traceback
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from extract import parse_pdf
from check import report
from stats import kind as question_kind

ROOT = Path(r"C:/video-app/참고파일/중등 문법/족보닷컴 영문법")
LEVELS = {"기초": 1, "기본": 2, "심화": 3, "완성": 4}
KINDS = ("체크체크", "확인문제", "종합문제")
NAME = re.compile(r"^\[(?P<level>[^\]]+)\]\s*(?P<no>\d+)\.(?P<title>.+?)_(?P<kind>[^_(]+)(?:\((?P<round>\d)회\))?$")


def targets():
    for path in sorted(ROOT.rglob("*.pdf")):
        if "unlocked" in path.name:
            continue
        found = NAME.match(path.stem)
        if not found or found.group("kind") not in KINDS:
            continue
        info = found.groupdict()
        if info["level"] not in LEVELS:
            continue
        yield path, info


def unify_chapter_titles(bank):
    """같은 챕터가 파일 이름 대소문자 때문에 둘로 갈라지지 않게 이름을 하나로 맞춘다."""
    votes = {}
    for question in bank:
        key = (question["level"], question["chapter_no"])
        votes.setdefault(key, collections.Counter())[question["chapter"]] += 1
    best = {key: counter.most_common(1)[0][0] for key, counter in votes.items()}
    for question in bank:
        question["chapter"] = best[(question["level"], question["chapter_no"])]


def main(out_dir):
    out_dir = Path(out_dir)
    (out_dir / "figs").mkdir(parents=True, exist_ok=True)
    bank, flagged, failed = [], [], []
    files = list(targets())
    print("PDF %d개" % len(files), flush=True)

    for index, (path, info) in enumerate(files, 1):
        try:
            data, blobs = parse_pdf(path)
        except Exception:
            failed.append("%s\n%s" % (path.name, traceback.format_exc()))
            continue
        for digest, blob in blobs.items():
            target = out_dir / "figs" / (digest + ".png")
            if not target.exists():
                target.write_bytes(blob)
        for question in data["questions"]:
            question.update({
                "level": LEVELS[info["level"]],
                "level_name": info["level"],
                "chapter_no": int(info["no"]),
                "chapter": info["title"].strip(),
                "kind": info["kind"],
                "round": int(info["round"]) if info["round"] else None,
                "question_kind": question_kind(question),
                "file": path.name,
            })
            bank.append(question)
        for number, ref, found in report(data):
            flagged.append({"file": path.name, "number": number,
                            "ref": ref, "issues": found})
        if index % 25 == 0:
            print("  %d/%d  (문항 %d)" % (index, len(files), len(bank)), flush=True)

    unify_chapter_titles(bank)
    (out_dir / "bank.json").write_text(
        json.dumps(bank, ensure_ascii=False), encoding="utf-8")
    (out_dir / "검수필요.json").write_text(
        json.dumps(flagged, ensure_ascii=False, indent=1), encoding="utf-8")
    if failed:
        (out_dir / "실패.txt").write_text("\n\n".join(failed), encoding="utf-8")
    print("\n문항 %d개 / 확인 필요 %d개 / 처리 실패 %d개"
          % (len(bank), len(flagged), len(failed)))


if __name__ == "__main__":
    main(sys.argv[1])
