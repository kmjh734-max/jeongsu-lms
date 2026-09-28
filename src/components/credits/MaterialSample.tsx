"use client";

import type { CreditSampleKind } from "@/lib/credits/confirm-store";

/**
 * 만들기 전 확인 창에 보여 주는 견본 한 장.
 *
 * 선생님 요청(2026-09-28): 진짜로 만들어 보여 주면 그게 곧 생성이라 크레딧이 나간다.
 * 그래서 모양만 보여 주는 고정 견본을 둔다 — 값이 들지 않고 곧바로 뜬다.
 * 헷갈리지 않게 "예시" 딱지를 붙인다.
 */

const line = "text-[7.5px] leading-[1.75] text-slate-700";
const head = "text-[8px] font-semibold text-amber-700";

function Sheet({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="flex h-[404px] w-[286px] flex-col gap-2 overflow-hidden rounded-sm border border-slate-300 bg-white px-[15px] py-[16px] shadow-sm">
      <div className="flex items-baseline justify-between border-b-[1.5px] border-slate-900 pb-[5px]">
        <span className="text-[10px] font-semibold text-slate-900">{title}</span>
        <span className="text-[7px] text-slate-500">견본</span>
      </div>
      {children}
      <div className="mt-auto flex justify-between border-t border-slate-200 pt-[5px] text-[7px] text-slate-400">
        <span>EngCore</span>
        <span>1 / 1</span>
      </div>
    </div>
  );
}

export function MaterialSample({ kind }: { kind: CreditSampleKind }) {
  if (kind === "one_page_summary") {
    return (
      <Sheet title="1장 요약직보자료">
        <div>
          <div className={head}>요약문</div>
          <p className={line}>
            Copying keeps the hand busy while the understanding waits, so notes written in your own words are the
            only ones that still make sense later.
          </p>
        </div>
        <div>
          <div className={head}>중요 어법 포인트</div>
          <p className={line}>
            1. a page of your own sentences <u className="decoration-amber-600">is</u> shorter
            <br />
            <span className="text-slate-500">긴 주어의 핵은 page이므로 단수로 받는다</span>
            <br />
            2. the lesson <u className="decoration-amber-600">taught</u> in that minute
            <br />
            <span className="text-slate-500">lesson이 가르쳐지는 쪽이므로 과거분사를 쓴다</span>
          </p>
        </div>
        <div>
          <div className={head}>중요 표현</div>
          <p className={line}>clumsy 서툰 · in your own words 자기 말로 · make sense 뜻이 통하다</p>
        </div>
        <div>
          <div className={head}>내용 확인</div>
          <p className={line}>베껴 쓰기는 이해를 뒤로 미룬다. ( O / X )</p>
        </div>
      </Sheet>
    );
  }

  if (kind === "analysis_report") {
    return (
      <Sheet title="지문 분석서">
        <div>
          <p className={line}>
            <span className="border-b-[1.5px] border-amber-600">Most students</span> take notes by copying, / and
            copying is <span className="bg-amber-100">the one method</span> /{" "}
            <span className="text-amber-700">that</span> teaches you nothing.
          </p>
          <p className="text-[7px] leading-[1.7] text-slate-500">
            대부분의 학생은 베껴 쓰는 방식으로 필기를 하는데 / 베껴 쓰기는 ~한 유일한 방법이다 / 아무것도 가르쳐
            주지 않는
          </p>
        </div>
        <div>
          <p className={line}>
            <span className="border-b-[1.5px] border-amber-600">Listen</span> to the whole point, / then write it
            down / in <span className="bg-amber-100">your own words</span>.
          </p>
          <p className="text-[7px] leading-[1.7] text-slate-500">
            한 덩어리를 끝까지 듣고 / 그다음 그것을 적어라 / 자기 말로
          </p>
        </div>
        <div className="rounded-sm border border-slate-200 bg-slate-50 px-[9px] py-[8px]">
          <div className="mb-[3px] text-[7.5px] font-semibold text-slate-900">전체 해석</div>
          <p className="text-[7px] leading-[1.8] text-slate-600">
            대부분의 학생은 베껴 쓰는 방식으로 필기를 하는데, 베껴 쓰기는 아무것도 가르쳐 주지 않는 유일한
            방법이다. 한 덩어리를 끝까지 듣고, 서툴더라도 자기 말로 적어라.
          </p>
        </div>
      </Sheet>
    );
  }

  if (kind === "workbook") {
    return (
      <Sheet title="워크북">
        <div>
          <div className={head}>한줄해석</div>
          <p className={line}>
            1. Most students take notes by copying.
            <br />
            <span className="text-slate-400">→ ___________________________________</span>
          </p>
        </div>
        <div>
          <div className={head}>통문장 영작</div>
          <p className={line}>
            2. 자기 말로 쓴 한 쪽이 더 오래 간다.
            <br />
            <span className="text-slate-400">→ ___________________________________</span>
          </p>
        </div>
        <div>
          <div className={head}>어순배열 영작</div>
          <p className={line}>
            3. ( words / your / own / in )
            <br />
            <span className="text-slate-400">→ ___________________________________</span>
          </p>
        </div>
        <div>
          <div className={head}>빈칸 채우기</div>
          <p className={line}>4. Listen to the whole point, then write it down in your own ______.</p>
        </div>
      </Sheet>
    );
  }

  if (kind === "lesson_pack") {
    return (
      <Sheet title="수업용 자료">
        <div>
          <div className={head}>지문</div>
          <p className={line}>
            Most students take notes by copying, and copying is the one method that teaches you nothing.
          </p>
        </div>
        <div>
          <div className={head}>단어정리</div>
          <p className={line}>
            copy 베끼다 — 동의어 duplicate, reproduce / 반의어 create
            <br />
            clumsy 서툰 — 동의어 awkward, unskilled / 반의어 skillful
          </p>
        </div>
        <div>
          <div className={head}>해석</div>
          <p className={line}>
            대부분의 학생은 베껴 쓰는 방식으로 필기를 하는데, 베껴 쓰기는 아무것도 가르쳐 주지 않는 유일한
            방법이다.
          </p>
        </div>
      </Sheet>
    );
  }

  if (kind === "one_page_test") {
    return (
      <Sheet title="1장 테스트">
        <div>
          <div className={head}>1. 어법상 틀린 것은?</div>
          <p className={line}>
            ① is ② taught ③ writing ④ that ⑤ which
          </p>
        </div>
        <div>
          <div className={head}>2. 빈칸에 알맞은 말은?</div>
          <p className={line}>write it down in your own ______</p>
        </div>
        <div>
          <div className={head}>3. 다음 문장을 영작하시오.</div>
          <p className={line}>
            자기 말로 쓴 한 쪽이 더 오래 간다.
            <br />
            <span className="text-slate-400">→ ___________________________________</span>
          </p>
        </div>
      </Sheet>
    );
  }

  if (kind === "integrated") {
    return (
      <Sheet title="최종통합자료">
        <div className="rounded-sm border border-slate-300 px-[10px] py-[16px] text-center">
          <div className="text-[11px] font-semibold text-slate-900">2학기 중간고사 대비</div>
          <div className="mt-[4px] text-[7.5px] text-slate-500">공통영어1 · 3과 외 2지문</div>
        </div>
        <div>
          <div className={head}>차례</div>
          <p className={line}>
            1. 지문 분석서 ······· 2
            <br />
            2. 워크북 ············ 7
            <br />
            3. 1장 요약직보자료 ·· 14
            <br />
            4. 1장 테스트 ········ 16
          </p>
        </div>
        <p className="text-[7px] leading-[1.7] text-slate-500">
          고른 자료를 표지와 차례를 붙여 한 권으로 묶습니다.
        </p>
      </Sheet>
    );
  }

    if (kind === "question") {
    return (
      <Sheet title="변형문제">
        <div>
          <div className={head}>1. 다음 글의 요지로 가장 적절한 것은?</div>
          <p className={line}>
            Most students take notes by copying, and copying is the one method that teaches you
            nothing. A hand that is busy matching the board word for word leaves the understanding
            for later, and later never comes with the lesson still in the room. Listen to the whole
            point, then write it down in your own words, even clumsy ones.
          </p>
        </div>
        <div>
          <p className={line}>
            ① 필기는 많이 할수록 좋다
            <br />② 수업이 끝나면 바로 복습해야 한다
            <br />③ 필기는 베껴 쓰기보다 자기 말로 바꿔 써야 한다
            <br />④ 색깔 펜을 나눠 써야 한다
            <br />⑤ 친구와 필기를 바꿔 봐야 한다
          </p>
        </div>
        <p className="text-[7px] leading-[1.7] text-slate-500">
          고른 유형으로 지문마다 이런 문항을 만듭니다.
        </p>
      </Sheet>
    );
  }

if (kind === "exam_mock") {
    return (
      <Sheet title="동형모의고사">
        <p className="text-[7px] leading-[1.7] text-slate-500">
          분석해 둔 학교 시험과 같은 문항 차례·배점으로 새 시험지를 만듭니다.
        </p>
        <div>
          <div className={head}>18. 목적 파악 (2점)</div>
          <p className={line}>Dear members, …</p>
        </div>
        <div>
          <div className={head}>21. 함축 의미 (3점)</div>
          <p className={line}>the page that still makes sense …</p>
        </div>
        <div>
          <div className={head}>29. 어법 (3점)</div>
          <p className={line}>① is ② taught ③ writing ④ that ⑤ which</p>
        </div>
      </Sheet>
    );
  }

  // illustration
  return (
    <Sheet title="지문 삽화">
      <div className="flex h-[180px] items-center justify-center rounded-sm border border-slate-300 bg-slate-50">
        <svg width="72" height="72" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="1.2" aria-hidden="true">
          <rect x="3" y="4" width="18" height="15" rx="2"></rect>
          <circle cx="8.5" cy="9.5" r="1.6"></circle>
          <path d="m4.5 17 4.6-4.6a1.6 1.6 0 0 1 2.3 0L19.5 20"></path>
        </svg>
      </div>
      <p className="text-[7px] leading-[1.7] text-slate-500">
        지문 장면을 그림 한 장으로 그려 자료에 넣습니다. 장면 설명을 고쳐 다시 그릴 수 있습니다.
      </p>
    </Sheet>
  );
}
