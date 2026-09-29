/** 고3 듣기 33회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 33회",
  gradeLevel: "high3",
  speechSpeed: 0.8,
  folder: "고3 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good morning, third year students. This is Mr. Im from the health room. " +
            "I want to say something about the last ten weeks before the examination. " +
            "Every year around this time students start skipping breakfast " +
            "and replacing sleep with coffee, believing the trade is worth it. " +
            "It is not, and the health room sees the result in November. " +
            "From next week there will be a simple sheet outside my door " +
            "with three things to keep and three to avoid, on one page. " +
            "None of it is new and none of it is difficult. " +
            "Read it once and put it somewhere you will see it at midnight. Thank you.",
        ],
      ],
      choices: [
        "수험 기간 건강 관리를 당부하려고",
        "예방 접종 일정을 알리려고",
        "급식 변경을 알리려고",
        "보건실 이전을 알리려고",
        "체육 수업 변경을 안내하려고",
      ],
      answer: 1,
      clue: "Every year around this time students start skipping breakfast.",
      explanation:
        "남자는 시험을 앞둔 시기에 아침을 거르고 잠을 줄이는 습관을 경계하라며 건강 관리를 당부한다. 따라서 답은 ①이다.",
      translation: [
        "M: 3학년 여러분, 안녕하세요. 보건실 임 선생님입니다. 시험까지 남은 열 주에 대해 한 말씀 드립니다. 해마다 이맘때면 학생들이 아침을 거르고 잠 대신 커피를 택하기 시작합니다. 그 맞바꿈이 값어치가 있다고 믿으면서요. 그렇지 않습니다. 보건실은 11월에 그 결과를 봅니다. 다음 주부터 제 방 앞에 한 쪽짜리 종이를 붙여 두겠습니다. 지킬 것 세 가지와 피할 것 세 가지가 적혀 있습니다. 새로운 것도 없고 어려운 것도 없습니다. 한 번 읽고 한밤중에 눈에 띌 자리에 붙여 두세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaeyeon, I've made a list of thirty things to revise."],
        ["W", "In what order will you go through them?"],
        ["M", "From the top. That's how I wrote them down."],
        ["W", "So the order is the order you happened to remember them in."],
        ["M", "Does the order really matter that much?"],
        ["W", "The first three get your best hours. The last three get none."],
        ["M", "I usually run out of time around item twenty."],
        ["W", "Then twenty-one to thirty were never really on the list."],
        ["M", "How should I have ordered them?"],
        ["W", "By how much a mark costs you, not by when you thought of it."],
        ["M", "That would put two of my weakest topics first."],
        ["W", "Which is exactly where your best hours should go."],
      ],
      choices: [
        "복습 목록은 길게 만들어야 한다",
        "복습 순서는 중요도에 따라 정해야 한다",
        "복습은 아침에 해야 한다",
        "복습은 친구와 함께 해야 한다",
        "복습 목록을 자주 바꿔야 한다",
      ],
      answer: 2,
      clue: "By how much a mark costs you, not by when you thought of it.",
      explanation:
        "여자는 떠오른 순서가 아니라 중요도에 따라 복습 순서를 정하라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 채연아, 복습할 것 서른 개를 목록으로 만들었어.",
        "W: 어떤 순서로 할 건데?",
        "M: 위에서부터. 적은 순서대로.",
        "W: 그럼 그 순서는 네가 우연히 떠올린 순서네.",
        "M: 순서가 그렇게 중요해?",
        "W: 첫 세 개가 네 가장 좋은 시간을 가져가. 마지막 세 개는 하나도 못 가져.",
        "M: 보통 스무 번째쯤에서 시간이 떨어져.",
        "W: 그럼 21번부터 30번은 애초에 목록에 있던 게 아니야.",
        "M: 그럼 어떻게 정렬했어야 해?",
        "W: 떠오른 때가 아니라 점수를 얼마나 잃게 하는지로.",
        "M: 그러면 내가 제일 약한 두 단원이 맨 앞에 오겠네.",
        "W: 네 가장 좋은 시간이 가야 할 자리가 바로 거기야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Students ask whether it is better to study alone or with others, " +
            "as though the two were doing the same job. " +
            "They are not. Reading, working through problems and memorising " +
            "are solitary tasks, and company slows every one of them. " +
            "Explaining, testing and arguing about a wrong answer " +
            "are impossible alone and almost effortless in a pair. " +
            "So the question is not which is better. " +
            "It is which part of this evening belongs to which, " +
            "and most people lose hours by giving the wrong half to the wrong setting.",
        ],
      ],
      choices: [
        "공부는 혼자 해야 한다",
        "일의 성격에 따라 혼자 할지 함께 할지 나눠야 한다",
        "모둠 공부를 늘려야 한다",
        "공부 장소를 자주 바꿔야 한다",
        "공부 시간을 기록해야 한다",
      ],
      answer: 2,
      clue: "It is which part of this evening belongs to which.",
      explanation:
        "남자는 혼자 할 일과 함께 할 일이 다르므로 나누어야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 학생들은 혼자 공부하는 것이 나은지 함께 공부하는 것이 나은지 묻습니다. 마치 둘이 같은 일을 하는 것처럼요. 그렇지 않습니다. 읽기, 문제 풀기, 외우기는 혼자 하는 일이고, 옆에 사람이 있으면 하나같이 느려집니다. 설명하기, 서로 확인하기, 틀린 답을 두고 다투기는 혼자서는 불가능하고 둘이면 거의 힘들이지 않고 됩니다. 그러니 질문은 어느 쪽이 나은가가 아닙니다. 오늘 저녁의 어느 부분이 어느 쪽에 속하는가입니다. 대부분은 엉뚱한 절반을 엉뚱한 자리에 주면서 시간을 잃습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Dohyun, is this the careers office after the refit?"],
        ["M", "Yes, they finished it during the summer holiday."],
        ["W", "A wide desk stands in the middle of the room."],
        ["M", "Two people can sit across it during an interview."],
        ["W", "There's a tall shelf of prospectuses on the left."],
        ["M", "Sorted by region, which nobody ever keeps to."],
        ["W", "A round wall clock hangs above the door."],
        ["M", "It's square, actually. The round one went to the staff room."],
        ["W", "Two armchairs stand by the window on the right."],
        ["M", "People wait there when the desk is busy."],
        ["W", "And a small plant sits on the corner of the desk."],
        ["M", "It has survived three careers teachers so far."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "It's square, actually. The round one went to the staff room.",
      explanation:
        "여자가 둥근 시계라고 하자 남자가 네모라고 바로잡는다. 그림에는 둥근 시계가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.45, 0.5],
          [0.08, 0.36],
          [0.55, 0.07],
          [0.86, 0.5],
          [0.62, 0.42],
        ],
        scene:
          "A school careers office drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A WIDE DESK stands in the MIDDLE of the room with a chair on each side. " +
          "A TALL SHELF full of booklets stands against the LEFT wall. " +
          "A ROUND WALL CLOCK with a clearly circular face hangs on the BACK wall above a door. " +
          "TWO ARMCHAIRS stand side by side beside a window on the RIGHT. " +
          "A SMALL POTTED PLANT sits on the right corner of the desk top.",
      },
      translation: [
        "W: 도현아, 여기가 새로 고친 진로실이야?",
        "M: 응, 여름 방학 동안 끝냈어.",
        "W: 방 한가운데에 넓은 책상이 있네.",
        "M: 상담할 때 마주 보고 두 사람이 앉아.",
        "W: 왼쪽에는 안내 책자가 꽂힌 키 큰 선반이 있고.",
        "M: 지역별로 정리해 뒀는데 아무도 지키지 않아.",
        "W: 문 위에는 둥근 벽시계가 걸려 있네.",
        "M: 사실 네모야. 둥근 건 교무실로 갔어.",
        "W: 오른쪽 창가에는 안락의자가 두 개 있어.",
        "M: 책상이 차 있을 때 거기서 기다려.",
        "W: 그리고 책상 모서리에 작은 화분이 있네.",
        "M: 지금까지 진로 선생님 세 분을 버텨 냈어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Sangwoo, the graduation ceremony is three weeks away."],
        ["M", "Has the hall been booked for the whole morning?"],
        ["W", "From eight until one, and the chairs arrive on the day."],
        ["M", "What about the programme order?"],
        ["W", "Agreed last week, and the speeches are timed."],
        ["M", "Then the main pieces are in place."],
        ["W", "Except the name list. Somebody has to check the spellings."],
        ["M", "Didn't the office print it from the records?"],
        ["W", "They did, and eleven names came out wrong last year."],
        ["M", "Reading two hundred names aloud is not a small job."],
        ["W", "And the names go on the certificates as well."],
        ["M", "I'll check the whole name list this evening."],
      ],
      choices: [
        "강당을 예약하기",
        "순서를 정하기",
        "이름 표기를 확인하기",
        "의자를 배치하기",
        "연설문을 쓰기",
      ],
      answer: 3,
      clue: "I'll check the whole name list this evening.",
      explanation:
        "남자는 오늘 저녁에 이름 목록 전체를 확인하겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 상우야, 졸업식이 세 주 남았어.",
        "M: 강당은 오전 내내 잡아 놨어?",
        "W: 여덟 시부터 한 시까지. 의자는 당일에 와.",
        "M: 식순은?",
        "W: 지난주에 정했고 연설 시간도 재 놨어.",
        "M: 그럼 큰 건 다 됐네.",
        "W: 이름 명단만 빼고. 누가 표기를 확인해야 해.",
        "M: 행정실에서 학적으로 뽑지 않았어?",
        "W: 뽑았는데 작년에 열한 명 이름이 틀리게 나왔어.",
        "M: 이름 200개를 소리 내어 읽는 게 작은 일은 아니지.",
        "W: 게다가 그 이름이 졸업장에도 들어가.",
        "M: 오늘 저녁에 명단 전체를 확인할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Good afternoon. Are you here about the graduation flowers?"],
        ["W", "Yes, I'd like to order some bouquets for our class."],
        ["M", "When is the ceremony being held?"],
        ["W", "On the twelfth, in the morning."],
        ["M", "Then I would suggest collecting them the evening before."],
        ["W", "That works for us. What sizes do you have?"],
        ["M", "A small bouquet is sixteen dollars."],
        ["W", "And a large one?"],
        ["M", "Twenty-four dollars each."],
        ["W", "Three small ones and one large one, please."],
        ["M", "Would you like a card with each bouquet?"],
        ["W", "How much is a card?"],
        ["M", "Two dollars each, written by hand."],
        ["W", "One card with the large bouquet only."],
        ["M", "And school orders over seventy dollars get ten percent off."],
        ["W", "Here is the school card, then."],
      ],
      choices: ["$66.60", "$74", "$72", "$64.80", "$70"],
      answer: 1,
      clue: "A small bouquet is sixteen dollars.",
      explanation:
        "작은 꽃다발 세 개 48달러와 큰 것 24달러를 더하면 72달러이고 10퍼센트를 빼면 64달러 80센트이며, 카드 2달러를 더하면 66달러 60센트이다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요. 졸업식 꽃 때문에 오셨나요?",
        "W: 네, 우리 반에서 쓸 꽃다발을 주문하려고요.",
        "M: 졸업식이 언제인가요?",
        "W: 12일 오전이요.",
        "M: 그러면 전날 저녁에 찾아가시길 권합니다.",
        "W: 그래도 괜찮아요. 어떤 크기가 있나요?",
        "M: 작은 꽃다발은 16달러입니다.",
        "W: 큰 것은요?",
        "M: 하나에 24달러입니다.",
        "W: 작은 것 세 개와 큰 것 하나 주세요.",
        "M: 꽃다발마다 카드를 넣어 드릴까요?",
        "W: 카드는 얼마예요?",
        "M: 손으로 써서 하나에 2달러입니다.",
        "W: 큰 꽃다발에만 카드 하나요.",
        "M: 그리고 70달러가 넘는 학교 주문은 10퍼센트 할인됩니다.",
        "W: 그럼 여기 학교 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 독서실을 옮긴 이유를 고르시오.",
      lines: [
        ["W", "Junho, you've been going to a different study room."],
        ["M", "Since Monday, the one behind the market."],
        ["W", "Was the old one too expensive?"],
        ["M", "The price was the same at both."],
        ["W", "Then were the seats uncomfortable?"],
        ["M", "No, the old one closes at ten and this one at one."],
        ["W", "So you needed the later hours."],
        ["M", "From this month I study until midnight most days."],
        ["W", "And being asked to leave at ten breaks the evening."],
        ["M", "It took me twenty minutes to start again at home."],
      ],
      choices: [
        "요금이 비싸서",
        "자리가 불편해서",
        "더 늦게까지 열어서",
        "집에서 가까워서",
        "친구가 다녀서",
      ],
      answer: 3,
      clue: "No, the old one closes at ten and this one at one.",
      explanation:
        "남자는 더 늦게까지 여는 곳이 필요해서 독서실을 옮겼다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 준호야, 다른 독서실에 다니더라.",
        "M: 월요일부터. 시장 뒤에 있는 데.",
        "W: 전에 다니던 데가 비쌌어?",
        "M: 값은 둘 다 같아.",
        "W: 그럼 자리가 불편했어?",
        "M: 아니, 전에 다니던 데는 열 시에 닫고 여기는 한 시에 닫아.",
        "W: 더 늦은 시간이 필요했구나.",
        "M: 이번 달부터는 거의 매일 자정까지 해.",
        "W: 열 시에 나가라고 하면 저녁이 끊기지.",
        "M: 집에서 다시 시작하는 데 20분이 걸렸어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 논술 특강에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Taemin, are you taking the essay workshop?"],
        ["M", "I signed up, but I've only seen the title."],
        ["W", "It runs for four weeks, every Wednesday after school."],
        ["M", "That's a whole month. Where is it held?"],
        ["W", "In the third year library on the second floor."],
        ["M", "How many students are in the group?"],
        ["W", "Fifteen, so everybody gets read at least once."],
        ["M", "Do we write during the session or at home?"],
        ["W", "You write at home and bring it in printed."],
        ["M", "Is there anything to bring on the first day?"],
        ["W", "Just a topic you care about and two pages on it."],
      ],
      choices: ["특강 기간", "특강 장소", "참여 인원", "첫날 준비물", "지도하는 선생님"],
      answer: 5,
      clue: "It runs for four weeks, every Wednesday after school.",
      explanation:
        "기간, 장소, 인원, 준비물은 말했지만 지도 교사는 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 태민아, 논술 특강 들어?",
        "M: 신청은 했는데 제목만 봤어.",
        "W: 네 주 동안, 수요일마다 방과 후에 해.",
        "M: 한 달이네. 어디서 해?",
        "W: 2층 3학년 도서실에서.",
        "M: 몇 명이나 들어?",
        "W: 열다섯 명. 그래서 다들 적어도 한 번은 글을 읽혀.",
        "M: 그 자리에서 써, 집에서 써?",
        "W: 집에서 써서 인쇄해 와.",
        "M: 첫날에 가져갈 게 있어?",
        "W: 마음이 가는 주제 하나랑 그것에 대한 두 쪽.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Daon Career Centre에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is some information about the Daon Career Centre, which opened this year. " +
            "The centre is on the fourth floor of the city youth building, beside the station. " +
            "It is open from one in the afternoon until eight, Tuesday to Saturday. " +
            "Anyone between fifteen and twenty-four may use it free of charge. " +
            "Counsellors give personal sessions of fifty minutes, booked online. " +
            "There is also a small library of university and job materials. " +
            "Mock interviews are held on Saturdays and must be booked two weeks ahead. " +
            "The centre is closed every Monday and on public holidays.",
        ],
      ],
      choices: [
        "시 청소년 회관 4층에 있다",
        "화요일부터 토요일까지 연다",
        "열다섯 살에서 스물네 살이면 무료로 쓸 수 있다",
        "상담은 방문한 날 바로 받을 수 있다",
        "월요일에는 문을 닫는다",
      ],
      answer: 4,
      clue: "Counsellors give personal sessions of fifty minutes, booked online.",
      explanation:
        "상담은 인터넷으로 예약해야 한다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "M: 올해 문을 연 다온 진로 센터에 대해 알려 드립니다. 센터는 역 옆 시 청소년 회관 4층에 있습니다. 화요일부터 토요일까지 오후 한 시부터 여덟 시까지 엽니다. 열다섯 살에서 스물네 살이면 누구나 무료로 이용할 수 있습니다. 상담사가 50분짜리 개인 상담을 해 주며 인터넷으로 예약해야 합니다. 대학과 직업 자료를 모은 작은 자료실도 있습니다. 모의 면접은 토요일에 있고 두 주 전에 예약해야 합니다. 센터는 월요일과 공휴일에는 닫습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 온라인 특강을 고르시오.",
      lines: [
        ["W", "Hayoon, five online lecture series start next week."],
        ["M", "We've been putting this off since the holiday."],
        ["W", "Then let's choose today. How many hours a week can you give?"],
        ["M", "Three at most, with everything else this term."],
        ["W", "Two of these ask for five hours."],
        ["M", "Then they're out. Are the lectures live or recorded?"],
        ["W", "Two of the three left are recorded only."],
        ["M", "I never watch a recording, so it has to be live."],
        ["W", "And the fee should stay under fifty thousand won."],
        ["M", "Is the remaining one within that?"],
        ["W", "It is, at forty-five thousand."],
        ["M", "Then that's the one. Sign us both up tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Three at most, with everything else this term.",
      explanation:
        "주당 3시간 이하, 실시간 강의, 5만 원 미만인 것을 고른다. 세 조건을 모두 채우는 것은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Hours a week: 5 / Type: Live / Fee: 40,000 won" },
          { no: 2, label: "②", value: "Hours a week: 5 / Type: Recorded / Fee: 35,000 won" },
          { no: 3, label: "③", value: "Hours a week: 3 / Type: Recorded / Fee: 30,000 won" },
          { no: 4, label: "④", value: "Hours a week: 2 / Type: Recorded / Fee: 48,000 won" },
          { no: 5, label: "⑤", value: "Hours a week: 3 / Type: Live / Fee: 45,000 won" },
        ],
      },
      translation: [
        "W: 하윤아, 다음 주에 온라인 특강 다섯 개가 시작해.",
        "M: 방학부터 미뤄 왔잖아.",
        "W: 그럼 오늘 고르자. 일주일에 몇 시간 쓸 수 있어?",
        "M: 이번 학기에 다른 것까지 하면 많아야 세 시간.",
        "W: 두 개는 다섯 시간을 요구해.",
        "M: 그럼 빠지네. 실시간이야, 녹화야?",
        "W: 남은 셋 중 둘은 녹화만 있어.",
        "M: 나는 녹화는 절대 안 보니까 실시간이어야 해.",
        "W: 그리고 수강료는 5만 원 아래여야 해.",
        "M: 남은 건 그 안에 들어?",
        "W: 들어. 4만 5천 원이야.",
        "M: 그럼 그걸로. 오늘 밤에 둘 다 신청해 줘.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyun, did you book a seat in the reading room?"],
        ["W", "I tried, but every slot was taken by seven."],
        ["M", "There are usually cancellations after nine."],
        ["W", "I didn't know they were released again."],
        ["M", "Shall I message you when one appears?"],
      ],
      choices: [
        "No, I found a seat already.",
        "Yes, please, that would help a lot.",
        "The reading room is closed.",
        "I never study there.",
        "You should book it yourself.",
      ],
      answer: 2,
      clue: "Shall I message you when one appears?",
      explanation:
        "자리가 나면 알려 줄지 물었으므로, 그래 주면 좋겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 서윤아, 열람실 자리 예약했어?",
        "W: 해 보려고 했는데 일곱 시면 다 차 있었어.",
        "M: 아홉 시 지나면 보통 취소가 나와.",
        "W: 다시 풀리는 줄 몰랐어.",
        "M: 자리 나오면 내가 알려 줄까?",
        "W: 응, 부탁해. 정말 도움이 되겠다.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Minjae, are you going to the careers office today?"],
        ["M", "After the fifth period, if it's still open."],
        ["W", "Could you pick up a form for me?"],
        ["M", "Which one do you need?"],
        ["W", "The reference request form, the green one."],
      ],
      choices: [
        "I'm not going there.",
        "Sure, I'll bring you one.",
        "The office has no forms.",
        "You should go yourself.",
        "The green one is mine.",
      ],
      answer: 2,
      clue: "The reference request form, the green one.",
      explanation:
        "어떤 서식이 필요한지 말해 주었으므로, 가져다주겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 민재야, 오늘 진로실 가?",
        "M: 5교시 끝나고. 아직 열려 있으면.",
        "W: 서식 하나만 받아다 줄래?",
        "M: 어떤 거 필요해?",
        "W: 추천서 요청서, 초록색 거.",
        "M: 그래, 하나 가져다줄게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Dohyun, how is the English listening practice going?"],
        ["M", "I score well on the school tests and badly on the real papers."],
        ["W", "What's different about the real papers?"],
        ["M", "They play everything once, and our teacher plays it twice."],
        ["W", "So you've been practising a different exam."],
        ["M", "I never thought of it that way."],
        ["W", "What do you do during the second playing?"],
        ["M", "I fix the answers I guessed the first time."],
        ["W", "And on the day there is no second time to fix anything."],
        ["M", "So how do I practise for one playing?"],
        ["W", "Play it once, mark it, and only then listen again."],
      ],
      choices: [
        "I don't practise listening.",
        "That's a clear change, I'll do that.",
        "Twice is always better.",
        "The real paper is too hard.",
        "You should listen for me.",
      ],
      answer: 2,
      clue: "Play it once, mark it, and only then listen again.",
      explanation:
        "한 번 듣고 채점한 뒤에 다시 들으라는 조언이므로, 그렇게 하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 도현아, 영어 듣기 연습은 어때?",
        "M: 학교 시험은 잘 보는데 실제 시험지에서는 못 봐.",
        "W: 실제 시험지는 뭐가 달라?",
        "M: 다 한 번만 틀어 줘. 우리 선생님은 두 번 틀어 주셔.",
        "W: 그럼 다른 시험을 연습해 온 거네.",
        "M: 그렇게는 생각 못 했어.",
        "W: 두 번째 들을 때 뭘 해?",
        "M: 처음에 찍은 답을 고쳐.",
        "W: 시험 날엔 고칠 두 번째가 없잖아.",
        "M: 그럼 한 번 듣기를 어떻게 연습해?",
        "W: 한 번 틀고, 채점하고, 그다음에야 다시 들어.",
        "M: 분명한 변화네, 그렇게 할게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Naeun, you've kept the same study notebook all year."],
        ["W", "One book, everything in it, in order of date."],
        ["M", "Not separate books for separate subjects?"],
        ["W", "I tried that in March and carried five books everywhere."],
        ["M", "How do you find anything in one book?"],
        ["W", "There's an index at the back, two lines per topic."],
        ["M", "Does the index not take a long time to keep up?"],
        ["W", "Thirty seconds at the end of each session."],
        ["M", "And it must save far more than that."],
        ["W", "I haven't lost a page since April."],
        ["M", "Could you show me how the index works?"],
      ],
      choices: [
        "Sure, I'll bring it tomorrow.",
        "I don't keep a notebook.",
        "The index is useless.",
        "You should use five books.",
        "I lost the notebook in April.",
      ],
      answer: 1,
      clue: "Could you show me how the index works?",
      explanation:
        "남자가 색인 방식을 보여 달라고 했으므로, 내일 가져오겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 나은아, 한 해 내내 같은 공책을 쓰네.",
        "W: 한 권에 다 적어. 날짜 순서대로.",
        "M: 과목별로 따로 안 써?",
        "W: 3월에 해 봤는데 다섯 권을 들고 다녔어.",
        "M: 한 권에서 어떻게 찾아?",
        "W: 뒤에 색인이 있어. 주제마다 두 줄씩.",
        "M: 색인 관리가 오래 걸리지 않아?",
        "W: 공부 끝날 때마다 30초.",
        "M: 그보다 훨씬 많이 아껴 주겠네.",
        "W: 4월 뒤로 한 쪽도 잃어버린 적 없어.",
        "M: 그 색인이 어떻게 되는지 보여 줄래?",
        "W: 그럼, 내일 가져올게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Suyeon이 Kiyoung에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Suyeon : ________________",
      lines: [
        [
          "W",
          "Suyeon and Kiyoung are preparing the class farewell party for their homeroom teacher. " +
            "They have collected a letter from every student in the class. " +
            "Kiyoung suggests reading all thirty letters aloud during the party. " +
            "Suyeon has timed one of them, and it takes about ninety seconds. " +
            "Thirty letters would fill the entire hour they have been given. " +
            "She thinks the letters should be bound into a book and handed over instead. " +
            "That way nothing is cut and the teacher can read them properly. " +
            "In this situation, what would Suyeon most likely say to Kiyoung?",
        ],
      ],
      choices: [
        "Let's cancel the party this year.",
        "We should ask for more letters.",
        "Bind them into a book and give it to her.",
        "I'll read all thirty letters myself.",
        "An hour is far too long for us.",
      ],
      answer: 3,
      clue: "She thinks the letters should be bound into a book and handed over instead.",
      explanation:
        "서른 통을 다 읽으면 한 시간이 다 차므로 묶어서 드리자는 ③이 가장 적절하다.",
      translation: [
        "W: 수연이와 기영이는 담임 선생님을 위한 학급 송별회를 준비하고 있습니다. 두 사람은 반 학생 모두에게서 편지를 한 통씩 모았습니다. 기영이는 송별회에서 서른 통을 모두 소리 내어 읽자고 제안합니다. 수연이가 한 통을 읽어 보니 90초쯤 걸립니다. 서른 통이면 주어진 한 시간을 통째로 채우게 됩니다. 수연이는 편지를 책으로 묶어 드리는 편이 낫다고 생각합니다. 그러면 아무것도 잘라 내지 않고 선생님이 제대로 읽으실 수 있습니다. 이런 상황에서 수연이가 기영이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to explain why a long queue " +
            "sometimes moves faster than a short one. " +
            "People choose a queue by looking at its length, " +
            "which is the one piece of information that matters least. " +
            "What decides your waiting time is the rate at which the front is served, " +
            "and that rate is invisible from the back. " +
            "A short queue at a counter handling complicated requests " +
            "can hold you for twenty minutes, " +
            "while a long queue feeding six quick tills clears in five. " +
            "Airports and banks exploit this by merging every queue into one, " +
            "which looks alarming and is almost always faster, " +
            "because one slow customer no longer blocks a whole line.",
        ],
      ],
      choices: [
        "how banks decide their opening hours",
        "why the length of a queue predicts little",
        "how airports are designed for safety",
        "why people dislike waiting in lines",
        "how shops decide the number of tills",
      ],
      answer: 2,
      clue: "What decides your waiting time is the rate at which the front is served.",
      explanation:
        "남자는 줄의 길이가 아니라 앞에서 처리되는 속도가 기다리는 시간을 정한다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 긴 줄이 때로 짧은 줄보다 빨리 줄어드는 까닭을 설명하려 합니다. 사람들은 줄을 길이로 고릅니다. 그런데 길이야말로 가장 덜 중요한 정보입니다. 기다리는 시간을 정하는 것은 맨 앞이 처리되는 속도이고, 그 속도는 뒤에서는 보이지 않습니다. 복잡한 일을 처리하는 창구 앞의 짧은 줄은 여러분을 20분 붙잡아 둘 수 있고, 빠른 계산대 여섯 개로 이어지는 긴 줄은 5분이면 빠집니다. 공항과 은행은 이 점을 이용해 모든 줄을 하나로 합칩니다. 보기에는 아찔하지만 거의 언제나 더 빠릅니다. 느린 손님 한 명이 줄 하나를 통째로 막지 않기 때문입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Today I want to explain why a long queue sometimes moves faster than a short one."],
        ["M", "People choose a queue by looking at its length."],
        ["M", "What decides your waiting time is the rate at which the front is served."],
        ["M", "Airports and banks merge every queue into one."],
        ["M", "One slow customer no longer blocks a whole line."],
      ],
      choices: [
        "people choosing a queue by its length",
        "the rate at which the front is served",
        "airports and banks merging queues",
        "one slow customer blocking a line",
        "the busiest hour of the day in shops",
      ],
      answer: 5,
      clue: "People choose a queue by looking at its length.",
      explanation:
        "길이로 줄을 고르는 사람들, 앞이 처리되는 속도, 줄을 합치는 공항과 은행, 줄을 막는 느린 손님은 언급되지만 가게가 가장 붐비는 시간은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
