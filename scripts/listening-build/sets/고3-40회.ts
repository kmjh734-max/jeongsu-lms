/** 고3 듣기 40회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 40회",
  gradeLevel: "high3",
  speechSpeed: 0.8,
  folder: "고3 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Good morning, third year students. This is the school nurse. " +
            "I want to speak about the week of the examination itself. " +
            "Every year a number of you change everything at once on that Monday: " +
            "a new breakfast, a new bedtime, a new drink to stay awake. " +
            "The examination week is the worst possible week to test a new habit. " +
            "Whatever you have been doing since September, keep doing it. " +
            "If your body is used to toast at seven, give it toast at seven. " +
            "There is a short sheet on my door with the three things worth changing, " +
            "and none of them is a surprise. Thank you.",
        ],
      ],
      choices: [
        "시험 주간에 생활을 바꾸지 말라고 당부하려고",
        "보건실 운영 시간을 알리려고",
        "예방 접종을 안내하려고",
        "급식 변경을 알리려고",
        "건강 검진 일정을 알리려고",
      ],
      answer: 1,
      clue: "The examination week is the worst possible week to test a new habit.",
      explanation:
        "여자는 시험 주간에 새로운 습관을 시도하지 말고 하던 대로 하라고 당부한다. 따라서 답은 ①이다.",
      translation: [
        "W: 3학년 여러분, 안녕하세요. 보건 선생님입니다. 시험이 있는 그 주에 대해 말씀드립니다. 해마다 여러 명이 그 월요일에 모든 것을 한꺼번에 바꿉니다. 새 아침 식사, 새 취침 시간, 잠을 쫓을 새 음료까지요. 시험 주간은 새 습관을 시험해 보기에 가장 나쁜 주입니다. 9월부터 해 오던 것이 무엇이든 그대로 하세요. 몸이 일곱 시의 토스트에 익숙하다면 일곱 시에 토스트를 주세요. 제 방 문에 바꿀 만한 세 가지를 적은 짧은 종이가 있는데, 어느 것도 놀라운 이야기는 아닙니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junho, I've been doing three subjects every evening."],
        ["M", "Three in one evening? How long for each?"],
        ["W", "About an hour, with a short break between them."],
        ["M", "And how much of the first hour is still with you on Friday?"],
        ["W", "Almost none of it, now that I think about it."],
        ["M", "That's what happens when a subject gets one hour a week."],
        ["W", "But I'd fall behind if I dropped one."],
        ["M", "Give two subjects two hours each and rotate the third."],
        ["W", "So each one gets a proper session in turn."],
        ["M", "Two hours is long enough to reach the hard part."],
        ["W", "And one hour never gets past the easy pages."],
        ["M", "Which is why the easy pages are the only ones you know."],
      ],
      choices: [
        "하루에 여러 과목을 봐야 한다",
        "한 과목에 충분한 시간을 몰아 줘야 한다",
        "공부 시간을 기록해야 한다",
        "쉬는 시간을 늘려야 한다",
        "어려운 과목을 먼저 해야 한다",
      ],
      answer: 2,
      clue: "Give two subjects two hours each and rotate the third.",
      explanation:
        "남자는 한 시간씩 나누지 말고 한 과목에 두 시간씩 몰아 주라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 준호야, 저녁마다 세 과목씩 해.",
        "M: 하루 저녁에 셋? 과목마다 얼마씩?",
        "W: 한 시간쯤. 사이에 잠깐 쉬고.",
        "M: 그 첫 한 시간이 금요일에 얼마나 남아 있어?",
        "W: 생각해 보니 거의 안 남아.",
        "M: 한 과목이 일주일에 한 시간을 받으면 그렇게 돼.",
        "W: 하나를 빼면 밀릴 텐데.",
        "M: 두 과목에 두 시간씩 주고 세 번째는 번갈아 해.",
        "W: 그럼 과목마다 차례로 제대로 된 시간을 받네.",
        "M: 두 시간이면 어려운 데까지 갈 수 있어.",
        "W: 한 시간으로는 쉬운 쪽을 못 넘지.",
        "M: 그래서 네가 아는 게 쉬운 쪽뿐인 거야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "There is one question worth asking about any piece of advice: " +
            "what would have to be true for this to work? " +
            "Study in the morning assumes a quiet morning. " +
            "Read the chapter twice assumes a chapter short enough to read twice. " +
            "Most advice is not wrong. It is written for conditions you may not have. " +
            "So before you follow it, name the conditions out loud. " +
            "If two of them are missing from your life, the advice will fail, " +
            "and you will believe the failure was yours.",
        ],
      ],
      choices: [
        "조언은 많이 들어야 한다",
        "조언이 전제하는 조건을 따져 봐야 한다",
        "조언은 기록해 두어야 한다",
        "조언은 선생님께 구해야 한다",
        "조언은 바로 실천해야 한다",
      ],
      answer: 2,
      clue: "So before you follow it, name the conditions out loud.",
      explanation:
        "여자는 조언이 전제하는 조건을 확인한 뒤에 따르라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 어떤 조언이든 물어볼 만한 질문이 하나 있습니다. 이 조언이 통하려면 무엇이 참이어야 하는가? 아침에 공부하라는 말은 조용한 아침을 전제합니다. 한 단원을 두 번 읽으라는 말은 두 번 읽을 만큼 짧은 단원을 전제합니다. 대부분의 조언은 틀리지 않았습니다. 다만 여러분에게 없을 수도 있는 조건을 위해 쓰였을 뿐입니다. 그러니 따르기 전에 그 조건들을 소리 내어 짚어 보세요. 그중 둘이 여러분의 삶에 없다면 그 조언은 통하지 않을 것이고, 여러분은 그 실패가 자기 탓이라고 믿게 될 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Seoyun, is this the health room after the move?"],
        ["W", "Yes, they finished it at the end of last month."],
        ["M", "A desk stands near the door on the left."],
        ["W", "The nurse writes up every visit at it."],
        ["M", "There's a bed with a curtain on the right."],
        ["W", "The curtain goes all the way round now."],
        ["M", "A round wall clock hangs on the back wall."],
        ["W", "It's square, actually. The round one went to the office."],
        ["M", "Two cabinets stand side by side at the back."],
        ["W", "Bandages in one, everything else in the other."],
        ["M", "And a wide window fills the far wall."],
        ["W", "It opens at the top, which keeps the room fresh."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "It's square, actually. The round one went to the office.",
      explanation:
        "남자가 둥근 시계라고 하자 여자가 네모라고 바로잡는다. 그림에는 둥근 시계가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.14, 0.55],
          [0.86, 0.5],
          [0.46, 0.1],
          [0.5, 0.42],
          [0.72, 0.09],
        ],
        scene:
          "A school health room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A DESK with a chair stands near a door on the LEFT. " +
          "A BED with a CURTAIN RAIL around it stands on the RIGHT. " +
          "A ROUND WALL CLOCK with a clearly circular face hangs on the BACK wall in the upper middle. " +
          "TWO CABINETS with closed doors stand side by side against the BACK wall below the clock. " +
          "A WIDE WINDOW fills the far wall in the upper right.",
      },
      translation: [
        "M: 서윤아, 여기가 옮기고 난 보건실이야?",
        "W: 응, 지난달 말에 끝냈어.",
        "M: 왼쪽 문 근처에 책상이 있네.",
        "W: 보건 선생님이 방문 기록을 거기서 쓰셔.",
        "M: 오른쪽에는 커튼 달린 침대가 있고.",
        "W: 이제 커튼이 침대를 빙 둘러.",
        "M: 뒷벽에는 둥근 벽시계가 걸려 있어.",
        "W: 사실 네모야. 둥근 건 교무실로 갔어.",
        "M: 뒤쪽에는 장이 두 개 나란히 있네.",
        "W: 하나에는 붕대, 다른 하나에는 나머지.",
        "M: 그리고 저쪽 벽은 넓은 창문이 차지하고 있어.",
        "W: 위쪽이 열려서 방이 늘 상쾌해.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taemin, the third year assembly is on Monday morning."],
        ["M", "Has the hall been booked for the whole year group?"],
        ["W", "From eight thirty, and the caretaker sets out the chairs."],
        ["M", "Did he ask how many rows we need?"],
        ["W", "Eleven rows, one for each class, as always."],
        ["M", "Good. And the microphone?"],
        ["W", "Tested on Friday and left on the stage."],
        ["M", "Then the main pieces are ready."],
        ["W", "Except the speech. Nobody has written the opening."],
        ["M", "Isn't that the head of year's part?"],
        ["W", "He asked a student to write two minutes of it."],
        ["M", "I'll write the opening speech this evening."],
      ],
      choices: [
        "강당을 예약하기",
        "의자를 놓기",
        "여는 말을 쓰기",
        "마이크를 점검하기",
        "반 순서를 정하기",
      ],
      answer: 3,
      clue: "I'll write the opening speech this evening.",
      explanation:
        "남자는 오늘 저녁에 여는 말을 쓰겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 태민아, 3학년 조회가 월요일 아침이야.",
        "M: 학년 전체가 들어갈 강당은 잡았어?",
        "W: 8시 30분부터. 의자는 관리인 아저씨가 놓아 주셔.",
        "M: 몇 줄 필요한지 물어보셨어?",
        "W: 늘 그렇듯 반마다 한 줄씩 열한 줄.",
        "M: 좋아. 마이크는?",
        "W: 금요일에 확인하고 무대에 뒀어.",
        "M: 그럼 큰 건 다 됐네.",
        "W: 여는 말만 빼고. 아무도 안 썼어.",
        "M: 그건 학년 부장 선생님 몫 아니야?",
        "W: 그중 2분은 학생한테 쓰라고 하셨어.",
        "M: 오늘 저녁에 여는 말 쓸게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Good afternoon. Are you here about the class badges?"],
        ["W", "Yes, we'd like some for the graduation day."],
        ["M", "How many badges do you need?"],
        ["W", "Thirty, one for each student in the class."],
        ["M", "A metal badge is four dollars each."],
        ["W", "Is there a cheaper kind?"],
        ["M", "A plastic one is two dollars fifty."],
        ["W", "We'll take the metal ones. They last longer."],
        ["M", "Would you like a small box for each badge?"],
        ["W", "No boxes, thank you."],
        ["M", "And school orders over a hundred dollars get ten percent off."],
        ["W", "Here is the class card, then."],
      ],
      choices: ["$108", "$120", "$100", "$75", "$112"],
      answer: 1,
      clue: "A metal badge is four dollars each.",
      explanation:
        "금속 배지 서른 개는 120달러이고, 100달러가 넘어 10퍼센트를 빼면 108달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요. 학급 배지 때문에 오셨나요?",
        "W: 네, 졸업식에 쓸 걸 사려고요.",
        "M: 몇 개 필요하신가요?",
        "W: 서른 개요. 반 학생 한 사람에 하나씩.",
        "M: 금속 배지는 하나에 4달러입니다.",
        "W: 더 싼 것도 있나요?",
        "M: 플라스틱은 2달러 50센트입니다.",
        "W: 금속으로 할게요. 오래가니까요.",
        "M: 배지마다 작은 상자에 넣어 드릴까요?",
        "W: 상자는 괜찮아요.",
        "M: 그리고 100달러가 넘는 학교 주문은 10퍼센트 할인됩니다.",
        "W: 그럼 여기 학급 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 자습실을 바꾼 이유를 고르시오.",
      lines: [
        ["W", "Dohyun, you've moved to the second floor study room."],
        ["M", "Since Monday, and I should have done it in September."],
        ["W", "Was the old room too crowded?"],
        ["M", "There were always empty seats in it."],
        ["W", "Then were the desks too small?"],
        ["M", "No, the old room has no window at all."],
        ["W", "I hadn't noticed that about it."],
        ["M", "Four hours in there and my head aches every time."],
        ["W", "And the new room has three windows."],
        ["M", "Two of which open, which is the whole difference."],
      ],
      choices: [
        "자리가 부족해서",
        "책상이 작아서",
        "창문이 없어서",
        "너무 시끄러워서",
        "친구가 옮겨서",
      ],
      answer: 3,
      clue: "No, the old room has no window at all.",
      explanation:
        "남자는 예전 자습실에 창문이 없어 옮겼다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 도현아, 2층 자습실로 옮겼네.",
        "M: 월요일부터. 9월에 옮겼어야 했어.",
        "W: 예전 자습실이 너무 붐볐어?",
        "M: 늘 빈자리가 있었어.",
        "W: 그럼 책상이 작았어?",
        "M: 아니, 그 방에는 창문이 아예 없어.",
        "W: 그건 몰랐네.",
        "M: 거기서 네 시간 있으면 매번 머리가 아파.",
        "W: 새 방에는 창문이 세 개 있지.",
        "M: 그중 둘은 열려. 그게 전부야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 졸업 앨범 제작에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Naeun, when is the yearbook being finished?"],
        ["W", "The pages go to the printer on the twentieth."],
        ["M", "How many pages is it this year?"],
        ["W", "A hundred and sixty, which is twenty more than last year."],
        ["M", "Who is choosing the photographs?"],
        ["W", "Two students from each class, working together."],
        ["M", "Do we get to see it before it is printed?"],
        ["W", "A draft goes up in the corridor for three days."],
        ["M", "And when do we actually receive it?"],
        ["W", "On graduation day, at the end of the ceremony."],
        ["M", "Then I'd better check the draft carefully."],
      ],
      choices: ["인쇄소에 넘기는 날", "올해 쪽수", "사진을 고르는 사람", "받는 날", "제작 비용"],
      answer: 5,
      clue: "The pages go to the printer on the twentieth.",
      explanation:
        "인쇄일, 쪽수, 사진 선정, 받는 날은 말했지만 비용은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 나은아, 졸업 앨범 언제 끝나?",
        "W: 20일에 인쇄소로 넘겨.",
        "M: 올해는 몇 쪽이야?",
        "W: 160쪽. 작년보다 스무 쪽 많아.",
        "M: 사진은 누가 골라?",
        "W: 반마다 두 명씩 같이 골라.",
        "M: 인쇄 전에 볼 수 있어?",
        "W: 시안을 복도에 사흘 동안 붙여.",
        "M: 실제로는 언제 받아?",
        "W: 졸업식 날, 식이 끝날 때.",
        "M: 그럼 시안을 꼼꼼히 봐야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Mirae Study Hall에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Mirae Study Hall, which opened two years ago. " +
            "It stands on the third floor of the building opposite the post office. " +
            "The hall is open from seven in the morning until midnight, every day. " +
            "There are eighty seats, and each one has its own lamp and a locker. " +
            "A monthly place costs ninety thousand won, paid at the start of the month. " +
            "Drinks with lids are allowed, but food may only be eaten in the side room. " +
            "Seats are kept for the whole month, so nobody has to arrive early. " +
            "The hall closes for three days in the middle of August.",
        ],
      ],
      choices: [
        "우체국 맞은편 건물 3층에 있다",
        "매일 자정까지 연다",
        "자리마다 전등과 사물함이 있다",
        "음식은 어느 자리에서나 먹을 수 있다",
        "8월 중순에 사흘 동안 닫는다",
      ],
      answer: 4,
      clue: "Drinks with lids are allowed, but food may only be eaten in the side room.",
      explanation:
        "음식은 옆방에서만 먹을 수 있다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 2년 전에 문을 연 미래 독서실에 대해 알려 드립니다. 우체국 맞은편 건물 3층에 있습니다. 매일 아침 일곱 시부터 자정까지 엽니다. 자리는 여든 개이고 자리마다 전등과 사물함이 있습니다. 월 단위 자리는 9만 원이고 달 초에 냅니다. 뚜껑 있는 음료는 괜찮지만 음식은 옆방에서만 먹을 수 있습니다. 자리는 한 달 동안 그대로 유지되어 일찍 올 필요가 없습니다. 8월 중순에 사흘 동안 문을 닫습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 특강을 고르시오.",
      lines: [
        ["M", "Chaewon, five short courses start after the exam."],
        ["W", "I've been looking forward to this list all term."],
        ["M", "Then let's choose today. When can you start?"],
        ["W", "Any time after the twenty-fifth of November."],
        ["M", "Two of these begin on the twentieth."],
        ["W", "Then they're out. How many sessions does each have?"],
        ["M", "Between four and ten."],
        ["W", "Ten would run past the graduation."],
        ["M", "One of the three left has ten."],
        ["W", "And the fee should stay under sixty thousand won."],
        ["M", "One of the last two is seventy-five thousand."],
        ["W", "So there's only one course for us."],
        ["M", "I'll sign us both up tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Any time after the twenty-fifth of November.",
      explanation:
        "11월 25일 이후 시작, 10회 미만, 6만 원 미만인 강좌를 고른다. 세 조건을 모두 채우는 것은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Starts: Nov 20 / Sessions: 6 / Fee: 50,000 won" },
          { no: 2, label: "②", value: "Starts: Nov 20 / Sessions: 4 / Fee: 40,000 won" },
          { no: 3, label: "③", value: "Starts: Nov 27 / Sessions: 10 / Fee: 45,000 won" },
          { no: 4, label: "④", value: "Starts: Nov 28 / Sessions: 6 / Fee: 75,000 won" },
          { no: 5, label: "⑤", value: "Starts: Dec 1 / Sessions: 6 / Fee: 58,000 won" },
        ],
      },
      translation: [
        "M: 채원아, 시험 끝나고 시작하는 단기 강좌가 다섯 개 있어.",
        "W: 학기 내내 이 목록 기다렸어.",
        "M: 그럼 오늘 고르자. 언제부터 할 수 있어?",
        "W: 11월 25일 뒤면 언제든.",
        "M: 두 개는 20일에 시작해.",
        "W: 그럼 빠지네. 각각 몇 번 해?",
        "M: 네 번에서 열 번까지.",
        "W: 열 번이면 졸업식을 넘겨.",
        "M: 남은 셋 중 하나가 열 번이야.",
        "W: 그리고 수강료는 6만 원 아래여야 해.",
        "M: 남은 둘 중 하나는 7만 5천 원이야.",
        "W: 그럼 우리한테 맞는 건 하나뿐이네.",
        "M: 오늘 밤에 둘 다 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangwoo, did you check the seating list?"],
        ["M", "I looked for my number but couldn't find it."],
        ["W", "They added a second sheet this morning."],
        ["M", "Where is the second one?"],
        ["W", "Beside the first, a little lower down."],
      ],
      choices: [
        "I don't have a number.",
        "Then I'll look again at lunch.",
        "The list is not up yet.",
        "You should check yours.",
        "There is only one sheet.",
      ],
      answer: 2,
      clue: "Beside the first, a little lower down.",
      explanation:
        "둘째 명단이 어디 있는지 알려 주었으므로, 점심때 다시 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 상우야, 좌석 명단 확인했어?",
        "M: 내 번호를 찾아봤는데 없더라.",
        "W: 오늘 아침에 둘째 장을 덧붙였어.",
        "M: 둘째 장이 어디 있어?",
        "W: 첫 장 옆, 조금 아래에.",
        "M: 그럼 점심때 다시 볼게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Hayoon, are you going past the health room today?"],
        ["W", "After the fourth period, to collect a form."],
        ["M", "Could you pick up the sheet on the door?"],
        ["W", "The one about the examination week?"],
        ["M", "That one. I couldn't get near it this morning."],
      ],
      choices: [
        "I'm not going there.",
        "Sure, I'll bring you one.",
        "The health room is closed.",
        "You should read it yourself.",
        "There is no sheet.",
      ],
      answer: 2,
      clue: "That one. I couldn't get near it this morning.",
      explanation:
        "어떤 종이인지 확인해 주었으므로, 하나 가져다주겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 하윤아, 오늘 보건실 쪽 지나가?",
        "W: 4교시 끝나고. 서식 하나 받으러.",
        "M: 문에 붙은 종이 하나만 가져다줄래?",
        "W: 시험 주간에 대한 그거?",
        "M: 그거. 오늘 아침엔 근처에도 못 갔어.",
        "W: 그래, 하나 가져다줄게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaeyeon, how is the last month of revision going?"],
        ["W", "I work until one and wake at six, every day."],
        ["M", "Five hours of sleep, for four weeks."],
        ["W", "It's only four weeks. I can manage that."],
        ["M", "How many questions did you get wrong on Monday?"],
        ["W", "More than usual, and most of them were careless."],
        ["M", "Careless is what tiredness looks like on paper."],
        ["W", "I hadn't connected the two at all."],
        ["M", "Try seven hours for one week and count the careless ones again."],
        ["W", "And if there are just as many?"],
        ["M", "Then you've lost nothing and learned something."],
      ],
      choices: [
        "I never make careless mistakes.",
        "That's a fair test, I'll try it.",
        "Five hours is plenty for me.",
        "I don't do any questions.",
        "You should sleep less too.",
      ],
      answer: 2,
      clue: "Try seven hours for one week and count the careless ones again.",
      explanation:
        "일주일 동안 일곱 시간 자고 실수를 다시 세어 보라는 제안이므로, 해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 채연아, 마지막 한 달 복습은 어때?",
        "W: 매일 새벽 한 시까지 하고 여섯 시에 일어나.",
        "M: 네 주 동안 다섯 시간씩 자는 거네.",
        "W: 네 주뿐인걸. 견딜 수 있어.",
        "M: 월요일에 몇 문제나 틀렸어?",
        "W: 평소보다 많이. 대부분 실수였어.",
        "M: 실수라는 건 종이 위에 나타난 피로야.",
        "W: 그 둘을 연결해 본 적이 없어.",
        "M: 일주일만 일곱 시간 자고 실수를 다시 세어 봐.",
        "W: 똑같이 많으면?",
        "M: 그럼 잃은 것도 없고 알게 된 건 있지.",
        "W: 공평한 시험이네, 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Kiyoung, you've been packing your bag the night before."],
        ["M", "Since the first week of the term, without missing one."],
        ["W", "Does that really save any time?"],
        ["M", "Twelve minutes in the morning, by my own count."],
        ["W", "Twelve minutes is not very much."],
        ["M", "It isn't the minutes. It's the decisions."],
        ["W", "What do you mean by that?"],
        ["M", "Every decision at seven in the morning costs more than one at ten at night."],
        ["W", "So the morning has fewer things to go wrong."],
        ["M", "I haven't forgotten a book since March."],
        ["W", "Could you show me what you pack first?"],
      ],
      choices: [
        "Sure, come to my desk after class.",
        "I never pack my bag.",
        "I forget a book every day.",
        "You should pack in the morning.",
        "My bag is always empty.",
      ],
      answer: 1,
      clue: "Could you show me what you pack first?",
      explanation:
        "여자가 무엇부터 챙기는지 보여 달라고 했으므로, 수업 뒤에 오라는 ①이 가장 자연스럽다.",
      translation: [
        "W: 기영아, 전날 밤에 가방을 싸더라.",
        "M: 학기 첫 주부터 한 번도 안 빠뜨렸어.",
        "W: 그게 정말 시간이 절약돼?",
        "M: 내가 세어 보니 아침에 12분.",
        "W: 12분이면 많지는 않은데.",
        "M: 분이 문제가 아니야. 결정이 문제지.",
        "W: 그게 무슨 말이야?",
        "M: 아침 일곱 시의 결정 하나는 밤 열 시의 결정 하나보다 비싸.",
        "W: 그럼 아침에 잘못될 일이 줄어드는 거네.",
        "M: 3월 뒤로 책을 잊은 적이 없어.",
        "W: 뭘 제일 먼저 넣는지 보여 줄래?",
        "M: 그럼, 수업 끝나고 내 자리로 와.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Naeun이 Junseo에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Naeun : ________________",
      lines: [
        [
          "W",
          "Naeun and Junseo are preparing the graduation ceremony programme. " +
            "Eleven classes will each send one student to the stage. " +
            "Junseo has arranged the names in order of class number. " +
            "Naeun notices that four of the eleven have the same family name. " +
            "Read one after another, the audience will lose track of who is who. " +
            "Adding the class beside each name would solve it in a moment. " +
            "She wants him to change the list before it goes to print. " +
            "In this situation, what would Naeun most likely say to Junseo?",
        ],
      ],
      choices: [
        "Let's send fewer students to the stage.",
        "We should change the order completely.",
        "Put the class beside each name.",
        "I'll read the names aloud instead.",
        "Eleven classes is far too many.",
      ],
      answer: 3,
      clue: "Adding the class beside each name would solve it in a moment.",
      explanation:
        "같은 성이 여럿이어서 헷갈리므로 이름 옆에 반을 적자는 ③이 가장 적절하다.",
      translation: [
        "W: 나은이와 준서는 졸업식 식순을 준비하고 있습니다. 열한 개 반이 각각 한 명씩 무대에 올립니다. 준서는 이름을 반 번호 순서로 배열했습니다. 나은이는 열한 명 중 네 명이 성이 같다는 것을 알아챕니다. 잇달아 읽으면 청중은 누가 누구인지 놓치게 됩니다. 이름 옆에 반을 적으면 금방 해결됩니다. 나은이는 인쇄에 들어가기 전에 명단을 고치기를 바랍니다. 이런 상황에서 나은이가 준서에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to explain why a photograph taken indoors " +
            "so often comes out with an orange cast. " +
            "Ordinary indoor light is much redder than daylight, " +
            "and your eye corrects for it without telling you. " +
            "Walk from a street into a kitchen and a white plate stays white, " +
            "although the light falling on it has changed enormously. " +
            "The brain holds the idea of white steady and adjusts everything around it. " +
            "A camera has no such idea unless you give it one. " +
            "Left to itself it records exactly what arrives, orange and all. " +
            "This is what the white balance setting does: " +
            "it tells the camera which patch of the picture you consider to be white.",
        ],
      ],
      choices: [
        "how light bulbs are manufactured",
        "why indoor photographs look orange",
        "how the eye focuses at different distances",
        "why daylight changes through the day",
        "how cameras measure distance",
      ],
      answer: 2,
      clue: "A camera has no such idea unless you give it one.",
      explanation:
        "여자는 눈은 흰색을 보정하지만 카메라는 그러지 못해 실내 사진이 주황빛이 된다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 실내에서 찍은 사진이 왜 그렇게 자주 주황빛으로 나오는지 설명하려 합니다. 보통의 실내 조명은 햇빛보다 훨씬 붉은데, 우리 눈은 그것을 알리지 않고 알아서 보정합니다. 길에서 부엌으로 들어가도 흰 접시는 여전히 희게 보입니다. 거기에 닿는 빛은 엄청나게 달라졌는데도요. 뇌가 흰색이라는 기준을 붙들고 그 둘레를 모두 맞추기 때문입니다. 카메라에는 우리가 알려 주지 않는 한 그런 기준이 없습니다. 내버려 두면 도착한 그대로, 주황빛까지 그대로 담습니다. 화이트 밸런스 설정이 하는 일이 바로 이것입니다. 사진의 어느 부분을 흰색으로 볼지 카메라에게 알려 주는 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to explain why a photograph taken indoors comes out with an orange cast."],
        ["W", "Ordinary indoor light is much redder than daylight."],
        ["W", "The brain holds the idea of white steady and adjusts everything around it."],
        ["W", "Left to itself a camera records exactly what arrives."],
        ["W", "The white balance setting tells the camera which patch you consider to be white."],
      ],
      choices: [
        "indoor light being redder than daylight",
        "the brain holding the idea of white steady",
        "a camera recording exactly what arrives",
        "the white balance setting telling the camera",
        "the price of a camera lens",
      ],
      answer: 5,
      clue: "Ordinary indoor light is much redder than daylight.",
      explanation:
        "햇빛보다 붉은 실내 조명, 흰색 기준을 붙드는 뇌, 그대로 담는 카메라, 화이트 밸런스 설정은 언급되지만 렌즈 값은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
