# -*- coding: utf-8 -*-
"""검수 페이지에 실을 문항 자료를 만든다."""
import json, re, sys
from pathlib import Path
sys.path.insert(0, str(Path(__file__).parent))
from stats import kind

MARKERS = "①②③④⑤"


def main(folder, out):
    folder = Path(folder)
    items = []
    for path in sorted(folder.glob("*.json")):
        source = re.sub(r"^\[.*?\]\s*1\.", "", path.stem)
        source = re.sub(r"^[Bb]e동사_", "", source)
        for question in path_questions(path):
            question["source"] = source
            question["kind"] = kind(question)
            items.append(question)
    Path(out).write_text(json.dumps(items, ensure_ascii=False), encoding="utf-8")
    print("문항 %d개 / %.1fKB" % (len(items), Path(out).stat().st_size / 1024))


def path_questions(path):
    data = json.loads(path.read_text(encoding="utf-8"))
    for question in data["questions"]:
        yield {
            "ref": question["source_ref"],
            "no": question["number"],
            "prompt": question["prompt"],
            "body": question["body"],
            "choices": [c["text"] for c in question["choices"]],
            "answer": question["answer"] or "",
            "why": question["explanation"] or "",
            "level": question.get("difficulty") or "",
            "badges": question.get("badges", []),
        }


if __name__ == "__main__":
    main(sys.argv[1], sys.argv[2])
