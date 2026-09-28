# -*- coding: utf-8 -*-
"""뽑아낸 문항을 사람이 읽을 수 있게 펼친다."""
import json, sys
from pathlib import Path

MARKERS = "①②③④⑤"


def render(data, limit=None):
    out = ["# %s — 문항 %d개" % (data["file"], len(data["questions"])), ""]
    for question in data["questions"][:limit]:
        tail = []
        if question.get("difficulty"):
            tail.append("난이도 %s" % question["difficulty"])
        tail += question.get("badges", [])
        out.append("[%s] %s번%s" % (question["source_ref"], question["number"],
                                   ("  — " + " · ".join(tail)) if tail else ""))
        out.append("  발문  %s" % question["prompt"])
        for line in question["body"]:
            out.append("  본문  %s" % line)
        for choice in question["choices"]:
            out.append("   %s  %s" % (MARKERS[choice["no"] - 1], choice["text"]))
        if question.get("figures"):
            out.append("  그림  %s" % ", ".join(question["figures"]))
        out.append("  정답  %s" % question["answer"])
        if question["explanation"]:
            out.append("  해설  %s" % question["explanation"])
        out.append("")
    return "\n".join(out)


if __name__ == "__main__":
    data = json.loads(Path(sys.argv[1]).read_text(encoding="utf-8"))
    limit = int(sys.argv[3]) if len(sys.argv) > 3 else None
    Path(sys.argv[2]).write_text(render(data, limit), encoding="utf-8")
    print("wrote", sys.argv[2])
