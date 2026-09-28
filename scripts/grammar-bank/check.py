# -*- coding: utf-8 -*-
"""뽑아낸 문항에서 수상한 것을 골라낸다. 개수를 채우기보다 걸러내는 쪽이다."""
import re

MARKERS = "①②③④⑤"


def issues(question):
    found = []
    choices = question["choices"]
    answer = (question["answer"] or "").strip()
    prompt = question["prompt"].strip()
    body = question["body"]

    if not question["source_ref"]:
        found.append("고유번호 없음")
    if not prompt:
        found.append("발문 없음")
    if not answer:
        found.append("정답 없음")
    if not body and not choices:
        found.append("본문 없음")

    numbers = [c["no"] for c in choices]
    if choices:
        if numbers != sorted(numbers) or len(set(numbers)) != len(numbers):
            found.append("선택지 번호 어긋남 %s" % numbers)
        if numbers and numbers[0] != 1:
            found.append("선택지가 ①로 시작하지 않음")
        if len(choices) < 4:
            found.append("선택지 %d개" % len(choices))
        for choice in choices:
            if not choice["text"].strip():
                found.append("선택지 %s 비어 있음" % MARKERS[choice["no"] - 1])

    picked = [MARKERS.index(ch) + 1 for ch in answer if ch in MARKERS]
    if picked and not choices:
        found.append("정답은 번호인데 선택지가 없음")
    if picked and choices and max(picked) > len(choices):
        found.append("정답 %s이 선택지 %d개를 벗어남" % (answer, len(choices)))
    if choices and not picked and len(answer) > 0:
        found.append("선택지 문항인데 정답이 번호가 아님")

    if len(prompt) > 90:
        found.append("발문이 너무 긺(%d자) — 옆 문항과 섞였을 수 있음" % len(prompt))
    if re.search(r"[①②③④⑤]", prompt):
        found.append("발문에 선택지 번호가 섞임")
    return found


def report(data):
    rows = []
    for question in data["questions"]:
        found = issues(question)
        if found:
            rows.append((question["number"], question["source_ref"], found))
    return rows
