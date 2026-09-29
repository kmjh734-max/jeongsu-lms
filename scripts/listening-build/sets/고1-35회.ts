/** 고1 듣기 35회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 35회",
  gradeLevel: "high1",
  speechSpeed: 0.8,
  folder: "고1 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. This is the head of the cafeteria, Ms. Song. " +
            "I want to explain a change to the way lunch is served from next Monday. " +
            "Until now every class came down at the same bell, " +
            "and the line reached the stairs while the last students ate in ten minutes. " +
            "From Monday the grades will come down in three groups, " +
            "ten minutes apart, following the order posted at the cafeteria door. " +
            "The order changes every week, so please check it on Monday morning. " +
            "The menu, the price and the closing time are not changing at all. " +
            "If your class has a test that period, tell us the day before " +
            "and we will hold your group's places. Thank you for your patience.",
        ],
      ],
      choices: [
        "급식 메뉴 변경을 알리려고",
        "급식비 인상을 안내하려고",
        "급식실 공사를 알리려고",
        "점심시간 배식 방식 변경을 안내하려고",
        "잔반 줄이기를 당부하려고",
      ],
      answer: 4,
      clue: "From Monday the grades will come down in three groups.",
      explanation:
        "여자는 월요일부터 학년을 세 무리로 나누어 10분 간격으로 배식한다고 안내한다. 따라서 답은 ④이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 급식실 책임자 송입니다. 다음 주 월요일부터 점심 배식 방식이 달라지는 점을 설명드립니다. 지금까지는 모든 반이 같은 종에 내려왔고, 줄이 계단까지 닿아 마지막 학생들은 10분 만에 먹었습니다. 월요일부터는 학년을 세 무리로 나누어 10분 간격으로 내려옵니다. 순서는 급식실 문에 붙여 둡니다. 순서는 매주 바뀌니 월요일 아침에 꼭 확인해 주세요. 메뉴와 가격, 마감 시각은 전혀 달라지지 않습니다. 그 시간에 시험이 있는 반은 전날 알려 주시면 그 무리의 자리를 남겨 두겠습니다. 기다려 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Nayeon, I've been reading three books at the same time."],
        ["W", "How far are you into each of them?"],
        ["M", "Chapter four, chapter two and chapter six."],
        ["W", "And how long have you been at chapter two?"],
        ["M", "Since the start of the month, I think."],
        ["W", "So one of the three is not really being read at all."],
        ["M", "I'll get back to it when I'm in the mood."],
        ["W", "That mood rarely comes back once a story goes cold."],
        ["M", "But finishing one first feels slow."],
        ["W", "It only feels slow. Three half-read books take longer than three finished ones."],
        ["M", "Because I keep starting each chapter again?"],
        ["W", "Exactly. You pay the same first ten pages three times over."],
      ],
      choices: [
        "책은 한 권씩 끝내면서 읽어야 한다",
        "여러 분야의 책을 함께 읽어야 한다",
        "책을 읽고 기록을 남겨야 한다",
        "어려운 책부터 읽어야 한다",
        "읽는 속도를 높여야 한다",
      ],
      answer: 1,
      clue: "Three half-read books take longer than three finished ones.",
      explanation:
        "여자는 여러 권을 함께 읽으면 앞부분을 되풀이해 읽게 되므로 한 권씩 끝내는 편이 낫다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 나연아, 나 요즘 책 세 권을 같이 읽고 있어.",
        "W: 각각 어디까지 읽었는데?",
        "M: 4장, 2장, 6장.",
        "W: 2장에 머문 지는 얼마나 됐어?",
        "M: 이번 달 초부터인 것 같아.",
        "W: 그럼 셋 중 하나는 사실 읽고 있는 게 아니네.",
        "M: 마음이 생기면 다시 읽을 거야.",
        "W: 이야기가 식으면 그 마음은 좀처럼 안 돌아와.",
        "M: 그래도 한 권씩 끝내는 건 느리게 느껴져.",
        "W: 느껴질 뿐이야. 절반씩 읽은 세 권이 끝낸 세 권보다 오래 걸려.",
        "M: 매번 장 첫머리를 다시 읽어서?",
        "W: 그래. 같은 첫 열 쪽을 세 번 치르는 셈이야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When a group has to make a decision, the first voice usually decides it. " +
            "Whoever speaks first sets the shape of the discussion, " +
            "and everyone after that argues inside that shape instead of outside it. " +
            "The people with the quietest voices agree, not because they are convinced, " +
            "but because disagreeing now costs more than it did a minute ago. " +
            "There is a simple cure. Before anyone speaks, " +
            "give the group two minutes to write their own answer down. " +
            "Then read the papers. You will find opinions in that pile " +
            "that would never have survived the first sixty seconds of talking.",
        ],
      ],
      choices: [
        "회의는 짧게 끝내야 한다",
        "회의 전에 각자 의견을 적어 두어야 한다",
        "회의에는 사회자가 필요하다",
        "결정은 다수결로 해야 한다",
        "회의 기록을 남겨야 한다",
      ],
      answer: 2,
      clue: "Before anyone speaks, give the group two minutes to write their own answer down.",
      explanation:
        "남자는 먼저 말한 사람이 논의를 좌우한다며, 말하기 전에 각자 의견을 적게 하라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 어떤 모임이 결정을 내려야 할 때, 보통 첫 목소리가 결정을 합니다. 먼저 말한 사람이 논의의 틀을 정하고, 그 뒤 사람들은 그 틀 밖이 아니라 안에서 다툽니다. 목소리가 작은 사람들은 설득되어서가 아니라, 이제 와서 반대하는 값이 1분 전보다 비싸졌기 때문에 동의합니다. 방법은 간단합니다. 아무도 말하기 전에 2분 동안 각자 자기 답을 적게 하세요. 그런 다음 그 종이를 읽으세요. 말이 오간 첫 60초를 결코 넘기지 못했을 의견들이 그 더미 안에 있을 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Dohyun, is this the study room you set up at home?"],
        ["M", "Yes, my father and I finished it over the holiday."],
        ["W", "A wide desk stands under the window."],
        ["M", "The light falls on the page without a lamp until four."],
        ["W", "There's a wall clock hanging above the desk."],
        ["M", "It came from my grandmother's kitchen."],
        ["W", "I see four drawers in the cabinet on the left."],
        ["M", "There are three. The bottom one is a cupboard door."],
        ["W", "A swivel chair with wheels sits in front of the desk."],
        ["M", "It's the only thing we actually bought."],
        ["W", "And a small potted plant stands on the right corner of the desk."],
        ["M", "My sister waters it whenever she remembers."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "There are three. The bottom one is a cupboard door.",
      explanation:
        "여자가 서랍이 네 칸이라고 하자 남자가 세 칸이라고 바로잡는다. 그림에는 네 칸이 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.55],
          [0.52, 0.12],
          [0.12, 0.45],
          [0.12, 0.72],
          [0.76, 0.42],
        ],
        scene:
          "A home study room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A WIDE DESK stands in the middle of the room directly under a window. " +
          "A ROUND WALL CLOCK hangs on the wall above the desk. " +
          "A CABINET stands against the LEFT wall, and it has EXACTLY FOUR STACKED DRAWERS, " +
          "each with its own handle, drawn clearly so all four can be counted. " +
          "A SWIVEL CHAIR ON WHEELS sits in front of the desk, seen from behind. " +
          "A SMALL POTTED PLANT stands on the RIGHT corner of the desk top.",
      },
      translation: [
        "W: 도현아, 여기가 네가 집에 꾸민 공부방이야?",
        "M: 응, 연휴 동안 아버지랑 같이 끝냈어.",
        "W: 창문 아래에 넓은 책상이 있네.",
        "M: 네 시까지는 전등 없이도 책에 빛이 들어.",
        "W: 책상 위에는 벽시계가 걸려 있고.",
        "M: 할머니 부엌에 있던 거야.",
        "W: 왼쪽 수납장에 서랍이 네 칸 보여.",
        "M: 세 칸이야. 맨 아래는 여닫이문이야.",
        "W: 책상 앞에는 바퀴 달린 회전의자가 있네.",
        "M: 우리가 산 건 그거 하나뿐이야.",
        "W: 그리고 책상 오른쪽 모서리에 작은 화분이 있어.",
        "M: 동생이 생각날 때마다 물을 줘.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Seokjin, the charity concert is on Friday evening."],
        ["M", "Is the hall booked for the whole evening?"],
        ["W", "From six to nine, and the school already approved it."],
        ["M", "How are the tickets going?"],
        ["W", "A hundred and forty sold out of two hundred."],
        ["M", "That's better than last year at this point."],
        ["W", "It is. The problem is the programme sheet."],
        ["M", "Hasn't the design club finished the layout?"],
        ["W", "They have, but nobody has sent it to the print shop."],
        ["M", "The shop closes at six today, doesn't it?"],
        ["W", "At six, and they need a full day to print."],
        ["M", "Then I'll send the file to the print shop right now."],
      ],
      choices: [
        "표를 더 팔기",
        "강당을 예약하기",
        "인쇄소에 파일을 보내기",
        "안내지를 새로 디자인하기",
        "선생님께 허락을 받기",
      ],
      answer: 3,
      clue: "Then I'll send the file to the print shop right now.",
      explanation:
        "남자는 지금 바로 인쇄소에 파일을 보내겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 석진아, 자선 음악회가 금요일 저녁이야.",
        "M: 강당은 저녁 내내 잡아 놨어?",
        "W: 여섯 시부터 아홉 시까지. 학교 허가도 받았어.",
        "M: 표는 잘 나가?",
        "W: 200장 중에 140장 팔렸어.",
        "M: 작년 이맘때보다 낫네.",
        "W: 맞아. 문제는 공연 안내지야.",
        "M: 디자인 동아리가 배치 안 끝냈어?",
        "W: 끝냈는데 아무도 인쇄소에 안 보냈어.",
        "M: 그 가게 오늘 여섯 시에 닫지?",
        "W: 여섯 시에. 인쇄에 하루가 꼬박 걸려.",
        "M: 그럼 내가 지금 바로 인쇄소에 파일 보낼게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the city sports centre. How can I help you?"],
        ["W", "I'd like to buy a swimming pass for next month."],
        ["M", "A one month pass is forty dollars for adults."],
        ["W", "I'm a high school student. Is there a student rate?"],
        ["M", "A student pass is thirty dollars a month."],
        ["W", "I'd like two, one for me and one for my brother."],
        ["M", "Is your brother also in high school?"],
        ["W", "He's in middle school, so the same rate, isn't it?"],
        ["M", "It is. And a locker costs five dollars a month."],
        ["W", "One locker will be enough for the two of us."],
        ["M", "There's also a ten percent discount on two passes bought together."],
        ["W", "That helps. Here's my card, then."],
      ],
      choices: ["$59", "$60", "$65", "$54", "$61"],
      answer: 1,
      clue: "A student pass is thirty dollars a month.",
      explanation:
        "학생 정기권 두 장은 60달러이고 10퍼센트를 빼면 54달러이며, 사물함 5달러를 더하면 59달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 시립 체육센터에 오신 걸 환영합니다. 무엇을 도와드릴까요?",
        "W: 다음 달 수영 정기권을 사려고요.",
        "M: 한 달 정기권은 어른이 40달러입니다.",
        "W: 저는 고등학생인데 학생 요금이 있나요?",
        "M: 학생 정기권은 한 달에 30달러입니다.",
        "W: 두 장 주세요. 저랑 동생 거요.",
        "M: 동생도 고등학생인가요?",
        "W: 중학생인데 요금은 같죠?",
        "M: 같습니다. 그리고 사물함은 한 달에 5달러입니다.",
        "W: 저희 둘이 하나면 충분해요.",
        "M: 정기권을 두 장 함께 사면 10퍼센트를 빼 드립니다.",
        "W: 다행이네요. 그럼 여기 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 자전거를 타고 오지 않은 이유를 고르시오.",
      lines: [
        ["M", "Yerin, you came on the bus this morning."],
        ["W", "I did, and I had to leave twenty minutes earlier."],
        ["M", "Is your bicycle at the repair shop again?"],
        ["W", "No, it's standing in our yard, perfectly fine."],
        ["M", "Then was the weather too cold for you?"],
        ["W", "The river path is closed while they rebuild the bridge."],
        ["M", "I forgot that work started last week."],
        ["W", "The other road has no bicycle lane at all."],
      ],
      choices: [
        "자전거가 고장 나서",
        "날씨가 추워서",
        "늦잠을 자서",
        "강변길이 막혀서",
        "짐이 많아서",
      ],
      answer: 4,
      clue: "The river path is closed while they rebuild the bridge.",
      explanation:
        "여자는 다리 공사로 강변길이 막혀 자전거를 타지 못했다고 말한다. 따라서 답은 ④이다.",
      translation: [
        "M: 예린아, 오늘 아침에 버스 타고 왔네.",
        "W: 응, 20분이나 일찍 나와야 했어.",
        "M: 자전거 또 수리점에 있어?",
        "W: 아니, 우리 집 마당에 멀쩡히 서 있어.",
        "M: 그럼 날씨가 너무 추웠어?",
        "W: 다리를 다시 놓느라 강변길이 막혔어.",
        "M: 지난주에 공사 시작한 걸 잊었네.",
        "W: 다른 길에는 자전거 길이 아예 없어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 진로 특강에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Taemin, are you going to the career talk next week?"],
        ["M", "I'd like to. Which day is it on?"],
        ["W", "Next Wednesday, in the seventh period."],
        ["M", "Who is coming to speak to us?"],
        ["W", "A nurse and an engineer, both graduates of our school."],
        ["M", "Where does the talk take place?"],
        ["W", "In the small hall, because the big one is being painted."],
        ["M", "Do we have to sign up beforehand?"],
        ["W", "You write your name on the sheet outside the career room."],
        ["M", "Is there a limit on numbers?"],
        ["W", "Eighty seats, and they were half gone by yesterday."],
      ],
      choices: ["특강 날짜", "강연하는 사람", "특강 장소", "신청 방법", "질문하는 방법"],
      answer: 5,
      clue: "Next Wednesday, in the seventh period.",
      explanation:
        "날짜, 강연자, 장소, 신청 방법은 말했지만 질문하는 방법은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 태민아, 다음 주 진로 특강 갈 거야?",
        "M: 가고 싶어. 무슨 요일이야?",
        "W: 다음 주 수요일 7교시에.",
        "M: 누가 와서 강연해?",
        "W: 간호사 한 분이랑 기술자 한 분. 둘 다 우리 학교 졸업생이야.",
        "M: 강연은 어디서 해?",
        "W: 대강당은 칠하는 중이라 소강당에서.",
        "M: 미리 신청해야 해?",
        "W: 진로실 앞 종이에 이름을 적으면 돼.",
        "M: 인원 제한이 있어?",
        "W: 여든 자리인데 어제까지 절반이 찼어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Harbour Light Festival에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Let me tell you about the Harbour Light Festival, which returns this December. " +
            "The festival runs for ten days, from the fifth to the fourteenth. " +
            "Lights are switched on at five in the afternoon and stay on until midnight. " +
            "The whole harbour walkway is decorated, from the fish market to the old lighthouse. " +
            "Visitors can join a boat tour that leaves the pier every thirty minutes. " +
            "The walkway itself is free, but the boat tour costs eight thousand won. " +
            "Food stalls open along the north side of the harbour each evening. " +
            "The festival goes ahead in any weather, since almost everything is outdoors.",
        ],
      ],
      choices: [
        "열흘 동안 열린다",
        "불은 오후 다섯 시에 켜진다",
        "산책로는 무료로 걸을 수 있다",
        "배 여행은 한 시간마다 출발한다",
        "음식 가게는 항구 북쪽에 선다",
      ],
      answer: 4,
      clue: "Visitors can join a boat tour that leaves the pier every thirty minutes.",
      explanation:
        "배는 30분마다 떠난다고 했으므로 한 시간마다 출발한다는 ④가 일치하지 않는다.",
      translation: [
        "M: 이번 12월에 다시 열리는 하버 라이트 축제에 대해 말씀드리겠습니다. 축제는 5일부터 14일까지 열흘 동안 이어집니다. 불은 오후 다섯 시에 켜져 자정까지 켜져 있습니다. 어시장에서 옛 등대까지 항구 산책로 전체를 꾸밉니다. 방문객은 부두에서 30분마다 떠나는 배 여행에 참여할 수 있습니다. 산책로는 무료이지만 배 여행은 8천 원입니다. 저녁마다 항구 북쪽을 따라 음식 가게가 엽니다. 거의 모든 것이 야외라서 날씨와 상관없이 진행됩니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 구입할 헤드폰을 고르시오.",
      lines: [
        ["M", "Jieun, are these the headphones you were looking at?"],
        ["W", "These five are the ones still in stock."],
        ["M", "What matters most to you?"],
        ["W", "The price first. I can't go over a hundred thousand won."],
        ["M", "That takes two of them out straight away."],
        ["W", "And I want them to fold up for my bag."],
        ["M", "One of the cheaper ones doesn't fold at all."],
        ["W", "Then the battery. Twenty hours is my minimum."],
        ["M", "One of the two left runs for only fifteen."],
        ["W", "So there's just one pair that works for me."],
        ["M", "I'd order it before the sale ends tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "The price first. I can't go over a hundred thousand won.",
      explanation:
        "10만 원 이하, 접히는 것, 배터리 20시간 이상인 것을 고른다. 세 조건을 모두 채우는 것은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Price: 120,000 won / Folding: Yes / Battery: 30 h" },
          { no: 2, label: "②", value: "Price: 135,000 won / Folding: Yes / Battery: 25 h" },
          { no: 3, label: "③", value: "Price: 75,000 won / Folding: No / Battery: 22 h" },
          { no: 4, label: "④", value: "Price: 90,000 won / Folding: Yes / Battery: 15 h" },
          { no: 5, label: "⑤", value: "Price: 98,000 won / Folding: Yes / Battery: 24 h" },
        ],
      },
      translation: [
        "M: 지은아, 네가 보던 헤드폰이 이거야?",
        "W: 이 다섯 개가 아직 재고가 있는 거야.",
        "M: 너한테 제일 중요한 게 뭐야?",
        "W: 먼저 값. 10만 원은 못 넘어.",
        "M: 그럼 두 개는 바로 빠지네.",
        "W: 그리고 가방에 넣게 접혔으면 좋겠어.",
        "M: 싼 것 중 하나는 아예 안 접혀.",
        "W: 그다음은 배터리. 스무 시간이 최소야.",
        "M: 남은 둘 중 하나는 열다섯 시간밖에 안 가.",
        "W: 그럼 나한테 맞는 건 하나뿐이네.",
        "M: 오늘 밤 할인 끝나기 전에 주문하는 게 좋겠어.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaeyeon, have you seen the club camera?"],
        ["W", "It was in the cabinet yesterday evening."],
        ["M", "The cabinet is empty this morning."],
        ["W", "Maybe someone took it for the field trip."],
        ["M", "Should I ask the club leader about it?"],
      ],
      choices: [
        "The camera is broken.",
        "I don't use the cabinet.",
        "Yes, she'll know who has it.",
        "There is no field trip.",
        "You should buy a camera.",
      ],
      answer: 3,
      clue: "Should I ask the club leader about it?",
      explanation:
        "부장에게 물어볼지 묻고 있으므로, 부장이 누가 가져갔는지 알 거라는 ③이 가장 자연스럽다.",
      translation: [
        "M: 채연아, 동아리 사진기 봤어?",
        "W: 어제저녁엔 장 안에 있었어.",
        "M: 오늘 아침엔 장이 비어 있어.",
        "W: 누가 체험 학습 때문에 가져갔을지도 몰라.",
        "M: 부장한테 물어볼까?",
        "W: 응, 누가 가지고 있는지 알 거야.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junho, are you free during lunch tomorrow?"],
        ["M", "I think so. Why do you ask?"],
        ["W", "The class needs two people to move the desks."],
        ["M", "How many desks are we talking about?"],
        ["W", "Twelve, from the old room to the new one."],
      ],
      choices: [
        "I have no classes tomorrow.",
        "The desks are already gone.",
        "That's fine, count me in.",
        "I can't lift anything.",
        "Twelve people is too many.",
      ],
      answer: 3,
      clue: "Twelve, from the old room to the new one.",
      explanation:
        "책상 열두 개를 옮길 사람이 필요하다고 했으므로, 함께 하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 준호야, 내일 점심시간에 시간 돼?",
        "M: 될 것 같아. 왜?",
        "W: 반에서 책상 옮길 사람 두 명이 필요해.",
        "M: 책상이 몇 개인데?",
        "W: 열두 개. 옛 교실에서 새 교실로.",
        "M: 괜찮아, 나도 낄게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangwoo, how is the English speaking practice going?"],
        ["M", "I practise every evening, but I still freeze in class."],
        ["W", "What happens in the moment you freeze?"],
        ["M", "I think of the whole sentence before I open my mouth."],
        ["W", "So you're translating the ending before you say the start."],
        ["M", "That's exactly it, and by then the moment has passed."],
        ["W", "Native speakers don't know their ending either."],
        ["M", "They must plan something, surely."],
        ["W", "Only the first few words. The rest follows while they speak."],
        ["M", "I've never allowed myself to start without a plan."],
        ["W", "Try starting with just three words tomorrow and see what follows."],
      ],
      choices: [
        "I never speak in class.",
        "English is impossible for me.",
        "All right, I'll try that tomorrow.",
        "You should plan every sentence.",
        "I already finished the course.",
      ],
      answer: 3,
      clue: "Try starting with just three words tomorrow and see what follows.",
      explanation:
        "세 낱말만으로 시작해 보라는 제안이므로, 내일 해 보겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 상우야, 영어 말하기 연습은 어때?",
        "M: 저녁마다 연습하는데 수업에서는 여전히 굳어.",
        "W: 굳는 순간에 무슨 일이 일어나?",
        "M: 입을 열기 전에 문장 전체를 생각해.",
        "W: 그러니까 시작을 말하기 전에 끝을 옮기고 있는 거네.",
        "M: 딱 그거야. 그러는 사이에 순간이 지나가.",
        "W: 원어민도 자기 문장 끝을 몰라.",
        "M: 그래도 뭔가 계획은 하겠지.",
        "W: 앞 몇 낱말만. 나머지는 말하는 동안 따라와.",
        "M: 나는 계획 없이 시작해 본 적이 없어.",
        "W: 내일은 세 낱말만으로 시작해 보고 뭐가 따라오는지 봐.",
        "M: 알겠어, 내일 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Hyerin, you've been going to the community kitchen on Sundays."],
        ["W", "Since March. We cook for about sixty people."],
        ["M", "Is that not exhausting after a whole school week?"],
        ["W", "The first hour is, and then it stops feeling like work."],
        ["M", "What exactly do you do there?"],
        ["W", "I chop vegetables and wash the big pots."],
        ["M", "Do the same people come every week?"],
        ["W", "Mostly, and they know our names now."],
        ["M", "Could I come along one Sunday?"],
      ],
      choices: [
        "Of course, come this Sunday.",
        "The kitchen closed last year.",
        "I stopped going in March.",
        "You can't cook anything.",
        "Nobody comes to eat there.",
      ],
      answer: 1,
      clue: "Could I come along one Sunday?",
      explanation:
        "남자가 같이 가도 되는지 물었으므로, 이번 일요일에 오라는 ①이 가장 자연스럽다.",
      translation: [
        "M: 혜린아, 일요일마다 마을 부엌에 간다며.",
        "W: 3월부터. 예순 명쯤 먹을 걸 만들어.",
        "M: 학교 한 주 마치고 하면 지치지 않아?",
        "W: 첫 한 시간은 그런데 그다음엔 일 같지 않아져.",
        "M: 거기서 정확히 뭘 해?",
        "W: 채소를 썰고 큰 솥을 씻어.",
        "M: 매주 같은 사람들이 와?",
        "W: 대체로. 이제 우리 이름도 알아.",
        "M: 나도 일요일에 한번 따라가도 돼?",
        "W: 그럼, 이번 일요일에 와.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Sujin이 Hyunwoo에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Sujin : ________________",
      lines: [
        [
          "W",
          "Sujin and Hyunwoo are preparing the school festival booth together. " +
            "They agreed to open the booth at ten on Saturday morning. " +
            "Hyunwoo has ordered the materials from an online shop this afternoon. " +
            "Sujin checks the order page and sees that delivery takes four working days. " +
            "Saturday is only three days away, so the box will arrive after the festival. " +
            "She wants to tell him to cancel the order and buy the materials in town instead. " +
            "In this situation, what would Sujin most likely say to Hyunwoo?",
        ],
      ],
      choices: [
        "Let's open the booth an hour later.",
        "The materials are too expensive.",
        "We should order twice as much.",
        "Cancel it and buy them downtown today.",
        "I'll take care of the booth alone.",
      ],
      answer: 4,
      clue: "She wants to tell him to cancel the order and buy the materials in town instead.",
      explanation:
        "배송이 축제 뒤에 오므로 주문을 취소하고 시내에서 사자는 뜻이다. 따라서 답은 ④이다.",
      translation: [
        "W: 수진이와 현우는 학교 축제 부스를 함께 준비하고 있습니다. 두 사람은 토요일 아침 열 시에 부스를 열기로 했습니다. 현우는 오늘 오후에 인터넷 가게에서 재료를 주문했습니다. 수진이는 주문 화면을 보고 배송에 영업일로 나흘이 걸린다는 것을 알게 됩니다. 토요일까지는 사흘밖에 남지 않아 상자는 축제가 끝난 뒤에 옵니다. 수진이는 주문을 취소하고 시내에서 재료를 사자고 말하고 싶습니다. 이런 상황에서 수진이가 현우에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why onions make you cry. " +
            "An onion is not trying to hurt you. It is defending itself from animals. " +
            "Inside the cells sit two things that never meet while the onion is whole, " +
            "a sulphur compound and an enzyme that would change it. " +
            "The moment your knife breaks the walls, the two mix, " +
            "and a new gas rises from the cut surface within a second. " +
            "That gas reaches the wet surface of your eye and turns into a weak acid. " +
            "Your eye does the only sensible thing and washes it away with tears. " +
            "This is why a sharp knife makes you cry less than a blunt one: " +
            "it crushes fewer cells and releases less of the gas.",
        ],
      ],
      choices: [
        "how onions are grown and stored",
        "why cutting an onion makes your eyes water",
        "how to choose a good kitchen knife",
        "why some vegetables taste bitter",
        "how cooking changes the smell of food",
      ],
      answer: 2,
      clue: "The moment your knife breaks the walls, the two mix.",
      explanation:
        "여자는 양파를 자르면 두 물질이 섞여 기체가 생기고 그것이 눈물을 나게 한다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 양파가 왜 눈물을 나게 하는지 이야기하려 합니다. 양파는 우리를 아프게 하려는 것이 아닙니다. 동물로부터 자신을 지키는 것입니다. 세포 안에는 양파가 온전할 때는 결코 만나지 않는 두 가지가 있습니다. 황이 든 물질과 그것을 바꾸는 효소입니다. 칼이 세포벽을 부수는 순간 둘이 섞이고, 잘린 면에서 1초 안에 새로운 기체가 올라옵니다. 그 기체가 눈의 젖은 표면에 닿아 약한 산으로 바뀝니다. 눈은 가장 당연한 일을 합니다. 눈물로 씻어 내는 것이지요. 그래서 무딘 칼보다 잘 드는 칼로 썰 때 눈물이 덜 납니다. 부서지는 세포가 적어 기체도 적게 나오기 때문입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to talk about why onions make you cry."],
        ["W", "An onion is defending itself from animals."],
        ["W", "A sulphur compound and an enzyme never meet while the onion is whole."],
        ["W", "That gas reaches the wet surface of your eye and turns into a weak acid."],
        ["W", "A sharp knife crushes fewer cells and releases less of the gas."],
      ],
      choices: [
        "an onion defending itself from animals",
        "a sulphur compound and an enzyme inside the cells",
        "a gas turning into a weak acid on the eye",
        "a sharp knife crushing fewer cells",
        "the best country for growing onions",
      ],
      answer: 5,
      clue: "An onion is defending itself from animals.",
      explanation:
        "양파가 자신을 지킨다는 것, 황 화합물과 효소, 약한 산으로 바뀌는 기체, 잘 드는 칼은 언급되지만 양파를 기르기 좋은 나라는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
