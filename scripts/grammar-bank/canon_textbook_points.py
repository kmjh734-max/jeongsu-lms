# -*- coding: utf-8 -*-
"""
교과서마다 다르게 부르는 문법 포인트 이름을 하나로 모은다.

출판사가 같은 것을 다르게 적는다 — 「가주어 it」·「it ~ to-v 구문」·「It ~ for … to부정사(구)」.
낱말을 보고 규칙으로 가른다(AI를 부르지 않는다).
못 가른 것은 따로 적어 두어 사람이 보고 규칙을 보탠다.
"""
import io
import json
import re
import sys
from collections import Counter, defaultdict

sys.stdout.reconfigure(encoding="utf-8")

SRC = "scripts/grammar-bank/textbook-points.json"
OUT = "src/lib/grammar/textbook-points.generated.json"
LEFT = "scripts/grammar-bank/textbook-points-unmatched.txt"

# (열쇠, 보여 줄 이름, 형태, 알아볼 규칙) — 위에서부터 먼저 맞는 것을 쓴다
CANON = [
    ("relative_what", "관계대명사 what", "what + 불완전한 절", r"관계대명사\s*what|what[^가-힣]*관계|강조의?\s*what"),
    ("relative_nonrestrictive", "관계대명사 계속적 용법", "…, which / …, who", r"계속적\s*용법"),
    ("relative_prep", "전치사 + 관계대명사", "전치사 + which/whom", r"전치사\s*\+?\s*관계대명사"),
    ("relative_compound", "복합관계사", "whatever / whoever / whenever", r"복합관계"),
    ("relative_adverb", "관계부사", "where / when / why / how", r"관계부사"),
    ("relative_pronoun", "관계대명사", "who / which / that", r"관계대명사|관계사절"),
    ("appositive_that", "동격의 that", "명사 + that + 완전한 절", r"동격"),
    ("emphasis_it_that", "It - that 강조구문", "It is ~ that …", r"강조\s*구문|It\s*~\s*that|It\s*is/?was.*that|강조의?\s*it"),
    ("fake_subject_it", "가주어 it, 진주어 to부정사", "It is ~ to V", r"가주어|it\s*~\s*to-?v|It\s*~\s*for"),
    ("fake_object_it", "가목적어 it", "make/find/think + it + 형용사 + to V", r"가목적어"),
    ("infinitive_agent", "to부정사 의미상 주어", "for + 목적격 + to V", r"의미상\s*주어"),
    ("inversion_negative", "부정어 도치", "Never/Not only + 조동사 + 주어", r"부정어\s*도치|도치"),
    ("subjunctive_past_perfect", "가정법 과거완료", "If + had p.p., would have p.p.", r"가정법\s*과거완료|혼합\s*가정법"),
    ("subjunctive_without", "without/but for 가정법", "Without ~, 주어 + would …", r"without\s*가정법|but\s*for|without\s*~"),
    ("subjunctive_wish", "I wish 가정법", "I wish + 과거/과거완료", r"wish\s*가정법|I\s*wish"),
    ("subjunctive_asif", "as if 가정법", "as if + 과거/과거완료", r"as\s*if"),
    ("subjunctive_past", "가정법 과거", "If + 과거동사, would + 동사원형", r"가정법"),
    ("mandative_should", "제안·요구 동사의 that절", "suggest/insist + that + (should) 동사원형", r"should.*동사원형|동사원형.*should|당위|요구.*that절|제안.*that절|should의"),
    ("participle_clause", "분사구문", "V-ing …, 주어 + 동사", r"분사구문"),
    ("participle_postmod", "명사 수식 분사", "V-ing / p.p. + 명사", r"분사.*수식|수식.*분사|꾸미는\s*분사|후치\s*수식|현재분사|과거분사"),
    ("perception_verb", "지각동사 목적격보어", "see/hear + 목적어 + 동사원형 / V-ing", r"지각동사"),
    ("causative_verb", "사역동사 목적격보어", "make/have/let + 목적어 + 동사원형", r"사역동사"),
    ("object_complement_to", "목적격보어 to부정사", "allow/expect/ask + 목적어 + to V", r"목적격\s*보어.*to\s*부정사|to\s*부정사.*목적격\s*보어"),
    ("gerund_prep", "전치사 + 동명사", "전치사 + V-ing", r"전치사\s*\+?\s*(동명사|-ing)"),
    ("gerund", "동명사", "V-ing", r"동명사"),
    ("infinitive_adj", "to부정사의 형용사적 용법", "명사 + to V", r"형용사적\s*용법"),
    ("infinitive_adv", "to부정사의 부사적 용법", "to V (목적·결과)", r"부사적\s*용법"),
    ("infinitive_noun", "to부정사의 명사적 용법", "to V (주어·목적어·보어)", r"명사적\s*용법"),
    ("noun_clause_that", "명사절 접속사 that", "that + 완전한 절", r"명사절.*that|that절"),
    ("noun_clause_whether", "명사절 whether/if", "whether/if + 절", r"whether|if절|접속사\s*if"),
    ("indirect_question", "간접의문문", "의문사 + 주어 + 동사", r"간접\s*의문"),
    ("passive_perfect", "현재완료 수동태", "have been + p.p.", r"현재완료\s*수동"),
    ("passive_progressive", "진행형 수동태", "be being + p.p.", r"진행형?\s*수동"),
    ("passive", "수동태", "be + p.p.", r"수동태|수동"),
    ("comparative_the_the", "the + 비교급, the + 비교급", "The 비교급 …, the 비교급 …", r"the\s*비교급.*the|비교급.*비교급"),
    ("superlative_one_of", "one of the + 최상급 + 복수명사", "one of the 최상급 + 복수명사", r"one\s*of\s*the"),
    ("superlative", "최상급", "the + 최상급", r"최상급"),
    ("comparative_as_as", "as ~ as 원급 비교", "as + 원급 + as", r"원급|as\s*\.?\.?\.?\s*as"),
    ("comparative", "비교급", "비교급 + than", r"비교급|비교\s*구문"),
    ("so_that", "so/such ~ that", "so + 형용사 + that / such + 명사 + that", r"so\s*[~+].*that|such\s*[~+].*that|so\s*\.\.\.\s*that"),
    ("too_enough", "too ~ to V / enough to V", "too + 형용사 + to V", r"too\s*~?\s*to|enough\s*to"),
    ("reflexive", "재귀대명사", "-self / -selves", r"재귀대명사"),
    ("correlative", "상관접속사", "not only A but also B", r"not\s*only|상관접속사|either|neither|both\s*A"),
    ("ellipsis_be", "부사절의 「주어+be동사」 생략", "when/while + V-ing", r"생략"),
    ("pro_verb_do", "대동사 do", "do / does / did", r"대동사"),
    ("tense_condition", "시간·조건 부사절의 현재시제", "when/if + 현재동사", r"조건\s*부사절|시간\s*부사절|부사절.*시제"),
    ("tense_perfect", "현재완료", "have + p.p.", r"현재완료"),
    ("agreement", "수일치", "주어에 맞춘 동사", r"수일치|수의\s*일치"),
    ("parallel", "병렬구조", "and/or/but로 이은 같은 꼴", r"병렬"),
    ("emphasis_do", "do 강조", "do/does/did + 동사원형", r"do\s*강조|강조.*do"),
    ("conjunction_as", "접속사 as / as long as", "as + 절", r"접속사\s*as|as\s*long\s*as"),
    ("modal_have_pp", "조동사 + have p.p.", "must/should have p.p.", r"조동사.*have|have\s*p\.?p"),
    # 아래는 못 가른 이름을 보고 보탠 것 (2026-09-29)
    ("with_participle", "with + 명사 + 분사", "with + 명사 + V-ing/p.p.", r"with\s*\+?\s*\(?대?\)?명사"),
    ("conjunction_condition", "조건의 접속사", "unless / in case / provided that", r"조건.*접속사|접속사.*조건|unless|in\s*case|provided\s*that|조건문"),
    ("tense_past_perfect", "과거완료", "had + p.p.", r"과거완료"),
    ("infinitive_perfect", "완료부정사", "to have + p.p.", r"완료\s*부정사"),
    ("infinitive_independent", "독립부정사", "to be sure, so to speak", r"독립\s*부정사"),
    ("wh_noun_clause", "wh- 명사절", "what/how + 절", r"wh-?\s*명사절|의문사\s*\+?\s*to\s*부정사|how\s*\+?\s*형용사"),
    ("emotion_to_one", "to one's + 감정명사", "to one's surprise", r"to\s*one|감정\s*명사"),
    ("pro_verb_do_so", "do so", "do so / do it", r"do\s*so"),
    ("fifth_form_to", "5형식 목적격보어 to부정사", "동사 + 목적어 + to V", r"5형식|동사\s*\+?\s*목적어\s*\+?\s*to"),
    ("help_bare", "help + 목적어 + 동사원형", "help + 목적어 + (to) V", r"help\s*\+"),
    ("not_a_but_b", "not A but B", "not A but B", r"not\s*A\s*but"),
    ("cannot_too", "cannot ~ too / enough", "cannot + 동사 + too", r"cannot"),
    ("as_many_as", "as many[much] + 명사 + as", "as many + 복수명사 + as", r"as\s*\+?\s*(many|much)"),
    ("purpose_so_that", "목적의 so that", "so that + 주어 + can", r"so\s*\(?that\)?|목적.*접속사"),
    ("reported_speech", "화법 전환", "ask if / tell + 목적어 + to V", r"화법"),
    ("conjunction_contrast", "접속사 while / whereas", "while / whereas + 절", r"while|whereas"),
    ("conjunction_vs_prep", "접속사와 전치사 구별", "절이면 접속사, 명사면 전치사", r"접속사\s*vs|전치사.*접속사"),
    ("all_subject_is", "「all + 주어 + 동사 + is ~」", "All you need is ~", r"all\s*\+?\s*주어"),
    ("be_being_adj", "be being + 형용사", "be being + 형용사/명사", r"be\s*being"),
    ("seem_to", "seem to + 동사", "seem to V / seem to have p.p.", r"seem\s*to"),
]

COMPILED = [(k, l, f, re.compile(rx, re.I)) for k, l, f, rx in CANON]


def canon_of(title):
    # 「」·따옴표·물결 같은 꾸밈 글자를 떼고 맞춰 본다
    t = re.sub(r"[「」『』‘’“”'\"]", " ", title).strip()
    for key, label, form, rx in COMPILED:
        if rx.search(t):
            return key, label, form
    return None


def main():
    books = json.load(io.open(SRC, encoding="utf-8"))
    groups = {}
    unmatched = Counter()
    seen_books = defaultdict(set)

    for b in books:
        book_name = f"{b['subject']} {b['publisher']}"
        for p in b["points"]:
            hit = canon_of(p["title"])
            if not hit:
                unmatched[p["title"]] += 1
                continue
            key, label, form = hit
            g = groups.setdefault(
                key,
                {"key": key, "label": label, "form": form, "aliases": [], "examples": [], "count": 0, "books": []},
            )
            g["count"] += 1
            if p["title"] not in g["aliases"]:
                g["aliases"].append(p["title"])
            for e in p["examples"]:
                if len(g["examples"]) < 3 and e not in g["examples"]:
                    g["examples"].append(e)
            seen_books[key].add(book_name)

    out = []
    for key, g in groups.items():
        g["books"] = sorted(seen_books[key])
        g["bookCount"] = len(g["books"])
        out.append(g)
    out.sort(key=lambda g: (-g["count"], g["label"]))

    io.open(OUT, "w", encoding="utf-8", newline="\n").write(
        json.dumps(out, ensure_ascii=False, indent=1)
    )
    io.open(LEFT, "w", encoding="utf-8", newline="\n").write(
        "\n".join(f"{c}\t{t}" for t, c in unmatched.most_common())
    )

    total = sum(g["count"] for g in out) + sum(unmatched.values())
    print(f"모은 포인트 {len(out)}가지 · 가른 것 {sum(g['count'] for g in out)}/{total}")
    print(f"못 가른 이름 {len(unmatched)}가지 → {LEFT}")
    print("\n--- 많이 나오는 것 20 ---")
    for g in out[:20]:
        print(f"  {g['count']:3}회 · 교과서 {g['bookCount']:2}종  {g['label']}  ({g['form']})")


if __name__ == "__main__":
    main()
