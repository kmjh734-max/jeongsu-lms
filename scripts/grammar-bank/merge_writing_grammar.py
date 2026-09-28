# -*- coding: utf-8 -*-
"""
교과서 문법 포인트를 제시어 배열 「지정 문법」 목록에 합친다.

- 이미 있는 것은 교과서 몇 종에 나오는지만 붙인다(자주 나오는 것부터 보이게).
- 교과서에는 있는데 목록에 없던 것 가운데, <b>영작 조건으로 말이 되는 것</b>만 보탠다.
  「수일치」·「접속사와 전치사 구별」처럼 틀린 곳 고르기에만 쓰는 것은 넣지 않는다.
"""
import io
import json
import re
import sys

sys.stdout.reconfigure(encoding="utf-8")

POINTS = json.load(io.open("src/lib/grammar/textbook-points.generated.json", encoding="utf-8"))
TS = "src/lib/question-generator/writing-grammar.ts"

# 교과서 key → 이미 목록에 있는 이름
SAME = {
    "passive": "수동태",
    "tense_condition": "시간·조건 부사절의 현재시제",
    "mandative_should": "제안·요구 동사의 that절",
    "subjunctive_past": "가정법 과거",
    "subjunctive_past_perfect": "가정법 과거완료",
    "inversion_negative": "부정어 도치",
    "emphasis_it_that": "It - that 강조구문",
    "relative_pronoun": "관계대명사",
    "relative_what": "관계대명사 what",
    "relative_adverb": "관계부사",
    "relative_nonrestrictive": "관계대명사 계속적 용법",
    "participle_clause": "분사구문",
    "participle_postmod": "명사 수식 분사",
    "object_complement_to": "목적격보어 to부정사",
    "fifth_form_to": "목적격보어 to부정사",
    "causative_verb": "사역동사",
    "perception_verb": "지각동사",
    "fake_subject_it": "가주어 it, 진주어 to부정사",
    "infinitive_agent": "to부정사 의미상 주어",
    "comparative_as_as": "as ~ as 원급 비교",
    "comparative": "비교급 than",
    "comparative_the_the": "the + 비교급, the + 비교급",
    "so_that": "so ~ that / such ~ that",
    "too_enough": "too ~ to V / enough to V",
    "indirect_question": "간접의문문 어순",
    "reflexive": "재귀대명사",
}

# 교과서에 있고 영작 조건으로도 되는데 목록에 없던 것 — 보탠다
ADD = {
    "appositive_that": ("동격의 that", "명사 + that + 완전한 절", "the fact that처럼 앞 명사의 내용을 that절이 그대로 풀어 준다.", r"/\b(fact|idea|news|belief|thought|hope|rumor|possibility|chance|question)\s+that\b/i"),
    "passive_perfect": ("현재완료 수동태", "have been + p.p.", "지금까지 이어지는 일을 당하는 쪽에서 말한다.", r"/\b(have|has|had)\s+been\s+\w+(ed|en)\b/i"),
    "superlative_one_of": ("one of the + 최상급 + 복수명사", "one of the 최상급 + 복수명사", "가장 ~한 것 가운데 하나. 뒤에는 복수명사가 온다.", r"/\bone\s+of\s+the\s+\w+(est|most\s+\w+)?\s*\w*s\b/i"),
    "fake_object_it": ("가목적어 it", "make/find/think + it + 형용사 + to V", "목적어가 길면 it을 먼저 놓고 to부정사를 뒤로 보낸다.", r"/\b(make|makes|made|find|finds|found|think|thinks|thought|consider|considers|considered)\s+it\b[\s\S]{2,40}?\bto\s+\w+/i"),
    "correlative": ("상관접속사", "not only A but also B", "짝을 이루는 접속사. 앞뒤를 같은 꼴로 쓴다.", r"/\bnot\s+only\b[\s\S]*\bbut\b|\bboth\b[\s\S]*\band\b|\beither\b[\s\S]*\bor\b|\bneither\b[\s\S]*\bnor\b/i"),
    "relative_compound": ("복합관계사", "whatever / whoever / whenever", "선행사를 품은 관계사. ~하는 것은 무엇이든.", r"/\b(whatever|whoever|whomever|whenever|wherever|however)\b/i"),
    "subjunctive_asif": ("as if 가정법", "as if + 과거/과거완료", "사실이 아닌 것을 마치 그런 것처럼 말한다.", r"/\bas\s+if\b/i"),
    "subjunctive_without": ("without/but for 가정법", "Without ~, 주어 + would …", "~이 없다면. if절 없이 가정한다.", r"/\b(without|but\s+for)\b[\s\S]*\b(would|could|might)\b/i"),
    "with_participle": ("with + 명사 + 분사", "with + 명사 + V-ing/p.p.", "~한 채로. 곁따르는 상황을 덧붙인다.", r"/\bwith\s+\w+(\s+\w+)?\s+\w+(ing|ed|en)\b/i"),
    "conjunction_condition": ("조건의 접속사", "unless / in case / provided that", "~하지 않으면, ~할 경우에 대비해.", r"/\b(unless|in\s+case|provided\s+that|as\s+long\s+as)\b/i"),
    "ellipsis_be": ("부사절의 「주어+be동사」 생략", "when/while + V-ing", "주절과 주어가 같으면 부사절의 주어와 be동사를 줄인다.", r"/\b(when|while|if|though|although)\s+\w+ing\b/i"),
    "relative_prep": ("전치사 + 관계대명사", "전치사 + which/whom", "관계사절 안의 전치사를 관계대명사 앞으로 옮긴다.", r"/\b(in|on|at|for|with|to|from|of|by|about)\s+(which|whom)\b/i"),
    "modal_have_pp": ("조동사 + have p.p.", "must/should have p.p.", "지난 일에 대한 짐작·후회를 나타낸다.", r"/\b(must|should|could|would|might|may)\s+have\s+\w+(ed|en|n)\b/i"),
    "purpose_so_that": ("목적의 so that", "so that + 주어 + can", "~하기 위해서. 목적을 절로 나타낸다.", r"/\bso\s+that\b[\s\S]{0,40}?\b(can|could|will|would|may|might)\b/i"),
    "infinitive_perfect": ("완료부정사", "to have + p.p.", "본동사보다 앞선 때를 나타낸다.", r"/\bto\s+have\s+\w+(ed|en|n)\b/i"),
}
ADD.update({
    "as_many_as": ("as many[much] + 명사 + as", "as many + 복수명사 + as", "수·양이 같음을 나타낸다.", r"/\bas\s+(many|much)\s+\w+\s+as\b/i"),
    "cannot_too": ("cannot ~ too / enough", "cannot + 동사 + too", "아무리 ~해도 지나치지 않다.", r"/\b(cannot|can't)\b[\s\S]{0,30}?\b(too|enough)\b/i"),
    "not_a_but_b": ("not A but B", "not A but B", "A가 아니라 B다.", r"/\bnot\b[\s\S]{1,40}?\bbut\b/i"),
    "emotion_to_one": ("to one's + 감정명사", "to one's surprise", "~하게도. 문장 앞에 놓아 감정을 드러낸다.", r"/\bto\s+(my|his|her|their|our|one's)\s+(surprise|joy|delight|disappointment|relief|regret|horror)\b/i"),
    "help_bare": ("help + 목적어 + 동사원형", "help + 목적어 + (to) V", "help 뒤에는 to가 있어도 없어도 된다.", r"/\bhelps?\s+\w+\s+(to\s+)?\w+\b/i"),
    "wh_noun_clause": ("wh- 명사절", "what/how + 절", "의문사절이 주어·목적어·보어로 쓰인다.", r"/\b(what|how|who|which|where|when|why)\b[\s\S]{2,40}?\b(is|was|are|were|do|does|did)\b/i"),
    "noun_clause_whether": ("명사절 whether/if", "whether/if + 절", "~인지 아닌지. 주어·목적어로 쓰인다.", r"/\bwhether\b/i"),
    "gerund_prep": ("전치사 + 동명사", "전치사 + V-ing", "전치사 뒤에는 동명사가 온다.", r"/\b(in|on|at|for|with|by|of|about|after|before|without)\s+\w+ing\b/i"),
    "tense_past_perfect": ("과거완료", "had + p.p.", "과거의 어느 때보다 더 앞선 일.", r"/\bhad\s+\w+(ed|en|n)\b/i"),
    "infinitive_independent": ("독립부정사", "to be sure, so to speak", "문장 전체를 꾸미는 굳어진 to부정사.", r"/\b(to\s+be\s+sure|so\s+to\s+speak|to\s+begin\s+with|needless\s+to\s+say|to\s+tell\s+the\s+truth|strange\s+to\s+say)\b/i"),
})


def main():
    s = io.open(TS, encoding="utf-8").read()
    by_key = {p["key"]: p for p in POINTS}

    # 1) 이미 있는 것에 교과서 종수를 붙인다
    books = {}
    for key, label in SAME.items():
        p = by_key.get(key)
        if not p:
            continue
        books[label] = max(books.get(label, 0), p["bookCount"])

    added_books = 0
    for label, n in books.items():
        key = '    label: "%s",\n' % label
        if key not in s:
            print("   목록에 없음(건너뜀):", label)
            continue
        end = s.find("\n  },", s.find(key))
        s = s[:end] + "\n    textbookBooks: %d," % n + s[end:]
        added_books += 1

    # 2) 교과서에만 있던 것을 보탠다
    blocks = []
    for key, (label, form, hint, check) in ADD.items():
        p = by_key.get(key)
        if not p:
            print("   교과서에 없음(건너뜀):", label)
            continue
        blocks.append(
            "  {\n"
            '    label: "%s",\n'
            '    form: "%s",\n'
            '    hint: "%s",\n'
            "    check: %s,\n"
            "    textbookBooks: %d,\n"
            "  },\n" % (label, form, hint, check, p["bookCount"])
        )

    marker = "];\n\n/** 프롬프트에 싣는 목록"
    assert marker in s, "목록 끝을 못 찾음"
    s = s.replace(
        marker,
        "\n  // ── 교과서에서 가져온 것 (2026-09-29) ──\n" + "".join(blocks) + marker,
    )

    # 3) 타입에 칸 하나 더
    s = s.replace(
        "  check?: RegExp;\n};",
        "  check?: RegExp;\n  /** 이 어법이 나오는 고등 교과서 종수 — 자주 나오는 것부터 보여 준다 */\n  textbookBooks?: number;\n};",
    )

    io.open(TS, "w", encoding="utf-8", newline="\n").write(s)
    print("교과서 종수 붙임 %d · 새로 보탠 것 %d" % (added_books, len(blocks)))


if __name__ == "__main__":
    main()
