/** 고3 듣기 38회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 38회",
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
          "Good morning, everyone. This is the head of the school office. " +
            "I am speaking about the morning traffic outside the front gate. " +
            "Since September the number of cars dropping students off has doubled, " +
            "and twice last week a bus could not reach the stop at all. " +
            "From next Monday cars may not enter the gate between eight and half past. " +
            "There is a drop-off bay beside the stadium, two minutes away on foot. " +
            "Please tell whoever brings you to school about this change. " +
            "Nothing changes in the afternoon, when the traffic is spread out. " +
            "Thank you for helping us keep the gate clear.",
        ],
      ],
      choices: [
        "등교 시간 차량 통행 제한을 알리려고",
        "버스 노선 변경을 알리려고",
        "등교 시간 변경을 알리려고",
        "정문 공사를 알리려고",
        "교통 안전 교육을 안내하려고",
      ],
      answer: 1,
      clue: "From next Monday cars may not enter the gate between eight and half past.",
      explanation:
        "여자는 아침 시간에 차량이 정문으로 들어올 수 없다고 알린다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 행정실장입니다. 아침 정문 앞 차량 통행에 대해 말씀드립니다. 9월부터 학생을 내려 주는 차가 두 배로 늘었고, 지난주에는 두 번이나 버스가 정류장에 닿지 못했습니다. 다음 주 월요일부터 여덟 시부터 여덟 시 반까지는 차가 정문으로 들어올 수 없습니다. 경기장 옆에 걸어서 2분 거리인 하차 구역이 있습니다. 학교에 데려다주시는 분께 이 변경을 꼭 알려 주세요. 차가 분산되는 오후에는 달라지는 것이 없습니다. 정문을 비워 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junseo, I've been revising with a friend every evening."],
        ["M", "The same friend, for how many hours?"],
        ["W", "Three, and we go through the same subject together."],
        ["M", "Do you both know the subject equally well?"],
        ["W", "She's much stronger than me, which is why I asked her."],
        ["M", "Then she is teaching and you are watching."],
        ["W", "Isn't watching a good way to learn?"],
        ["M", "Watching someone solve a problem feels like solving it."],
        ["W", "And the feeling disappears in the test."],
        ["M", "Swap roles for half of every session. You explain, she listens."],
        ["W", "I'd be explaining badly for the first week."],
        ["M", "Explaining badly is the fastest way to find out what you don't know."],
      ],
      choices: [
        "잘하는 친구와 공부해야 한다",
        "설명하는 쪽이 되어 봐야 한다",
        "혼자 공부해야 한다",
        "공부 시간을 늘려야 한다",
        "과목을 나누어 공부해야 한다",
      ],
      answer: 2,
      clue: "Swap roles for half of every session. You explain, she listens.",
      explanation:
        "남자는 보기만 하지 말고 자기가 설명하는 쪽이 되어 보라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 준서야, 저녁마다 친구랑 복습해.",
        "M: 같은 친구랑 몇 시간씩?",
        "W: 세 시간. 같은 과목을 같이 봐.",
        "M: 둘 다 그 과목을 비슷하게 알아?",
        "W: 그 애가 나보다 훨씬 잘해. 그래서 부탁한 거야.",
        "M: 그럼 그 친구가 가르치고 너는 보고 있는 거네.",
        "W: 보는 것도 배우는 방법 아니야?",
        "M: 남이 푸는 걸 보면 내가 푼 것 같은 느낌이 들어.",
        "W: 그 느낌이 시험에서 사라지지.",
        "M: 매번 절반은 역할을 바꿔. 네가 설명하고 그 애가 들어.",
        "W: 첫 주는 엉성하게 설명하게 될 텐데.",
        "M: 엉성하게 설명하는 게 모르는 걸 가장 빨리 찾는 방법이야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "In the last weeks before an examination, " +
            "students give up the things that were holding the days together. " +
            "Meals become irregular, sleep moves every night, " +
            "and the walk that used to separate school from study disappears. " +
            "Then, when the work gets harder, there is no structure left to lean on. " +
            "Keep the frame and change what goes inside it. " +
            "The same hour for dinner, the same hour for bed, " +
            "and the study fits itself around them. " +
            "A routine costs nothing and carries you through the weeks that willpower cannot.",
        ],
      ],
      choices: [
        "공부 시간을 늘려야 한다",
        "생활 리듬을 그대로 지켜야 한다",
        "목표를 낮춰야 한다",
        "친구와 함께 지내야 한다",
        "휴식을 많이 취해야 한다",
      ],
      answer: 2,
      clue: "Keep the frame and change what goes inside it.",
      explanation:
        "여자는 식사와 잠 같은 생활의 틀을 그대로 지키라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 시험을 앞둔 마지막 몇 주에 학생들은 하루를 붙들어 주던 것들을 놓아 버립니다. 식사가 불규칙해지고, 자는 시간이 밤마다 달라지고, 학교와 공부를 갈라 주던 산책이 사라집니다. 그러다 공부가 더 힘들어지면 기댈 구조가 남아 있지 않습니다. 틀은 지키고 그 안에 담기는 것을 바꾸세요. 저녁은 같은 시각에, 잠자리도 같은 시각에. 공부는 그 둘레에 스스로 맞춰집니다. 규칙적인 생활은 값이 들지 않으면서, 의지로는 버티지 못하는 몇 주를 건너게 해 줍니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Chaeyeon, is this the room the study group uses?"],
        ["W", "Yes, we've had it since the start of October."],
        ["M", "A square table stands in the middle of the room."],
        ["W", "It's round, actually. The square one wouldn't fit through the door."],
        ["M", "There's a whiteboard on the back wall."],
        ["W", "We leave the week's questions on it until Friday."],
        ["M", "A tall bookcase stands on the left."],
        ["W", "Everyone leaves one book there for the others."],
        ["M", "Two chairs are pushed against the right wall."],
        ["W", "People sit there when they want to read alone."],
        ["M", "And a round clock hangs above the door."],
        ["W", "We stop at nine by that clock, whatever is unfinished."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 1,
      clue: "It's round, actually. The square one wouldn't fit through the door.",
      explanation:
        "남자가 네모난 탁자라고 하자 여자가 둥근 탁자라고 바로잡는다. 그림에는 네모난 탁자가 그려져 있으므로 답은 ①이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.45, 0.55],
          [0.5, 0.2],
          [0.08, 0.4],
          [0.88, 0.5],
          [0.62, 0.06],
        ],
        scene:
          "A small study room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A SQUARE TABLE with straight edges and four corners stands in the MIDDLE of the room with chairs around it. " +
          "A BLANK WHITEBOARD hangs on the BACK wall behind the table. " +
          "A TALL BOOKCASE stands against the LEFT wall. " +
          "TWO CHAIRS are pushed against the RIGHT wall side by side. " +
          "A ROUND WALL CLOCK hangs on the BACK wall above a door at the upper right.",
      },
      translation: [
        "M: 채연아, 여기가 스터디 모임이 쓰는 방이야?",
        "W: 응, 10월 초부터 썼어.",
        "M: 방 한가운데에 네모난 탁자가 있네.",
        "W: 사실 둥근 거야. 네모난 건 문으로 안 들어왔어.",
        "M: 뒷벽에는 화이트보드가 있고.",
        "W: 그 주 문제를 금요일까지 거기 적어 둬.",
        "M: 왼쪽에는 키 큰 책장이 있네.",
        "W: 다들 다른 사람들 보라고 책을 한 권씩 두고 가.",
        "M: 오른쪽 벽에는 의자 두 개가 붙어 있어.",
        "W: 혼자 읽고 싶을 때 거기 앉아.",
        "M: 그리고 문 위에 둥근 시계가 걸려 있어.",
        "W: 뭐가 남았든 저 시계로 아홉 시에 끝내.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Naeun, the third year concert is on Saturday evening."],
        ["W", "Have all the performers confirmed their pieces?"],
        ["M", "Eleven of the twelve. The last one answered last night."],
        ["W", "What about the hall and the lighting?"],
        ["M", "Booked, and the lights were set on Thursday."],
        ["W", "Then the main pieces are ready."],
        ["M", "Except the running order. Nobody has decided it."],
        ["W", "Can't we just go alphabetically?"],
        ["M", "Three of the pieces need the piano moved forward."],
        ["W", "So those three should be together, not spread out."],
        ["M", "And somebody has to work that out before Friday."],
        ["W", "I'll write the running order this evening."],
      ],
      choices: [
        "강당을 예약하기",
        "조명을 맞추기",
        "공연 순서를 정하기",
        "피아노를 옮기기",
        "연주자에게 연락하기",
      ],
      answer: 3,
      clue: "I'll write the running order this evening.",
      explanation:
        "여자는 오늘 저녁에 공연 순서를 정해 적겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 나은아, 3학년 음악회가 토요일 저녁이야.",
        "W: 출연자들 곡은 다 확정됐어?",
        "M: 열둘 중 열하나. 마지막 한 명이 어젯밤에 답했어.",
        "W: 강당이랑 조명은?",
        "M: 예약했고 조명은 목요일에 맞췄어.",
        "W: 그럼 큰 건 다 됐네.",
        "M: 순서만 빼고. 아무도 안 정했어.",
        "W: 그냥 이름 순서대로 하면 안 돼?",
        "M: 세 곡은 피아노를 앞으로 옮겨야 해.",
        "W: 그럼 그 셋은 흩어 놓지 말고 붙여야겠다.",
        "M: 그걸 금요일 전에 누가 정리해야 해.",
        "W: 오늘 저녁에 순서 정해서 적을게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good afternoon. Are you here about the concert programmes?"],
        ["M", "Yes, we need some printed for Saturday evening."],
        ["W", "When do you need to collect them?"],
        ["M", "Friday afternoon, if you can manage that."],
        ["W", "That is no trouble at all. How many pages is the programme?"],
        ["M", "Four pages, folded once in the middle."],
        ["W", "That size is one dollar fifty each."],
        ["M", "We'd like a hundred and twenty copies, please."],
        ["W", "Would you like them on thicker paper?"],
        ["M", "How much does the thicker paper add?"],
        ["W", "Fifty cents for each copy."],
        ["M", "The ordinary paper is fine for us this year."],
        ["W", "And school orders over two hundred dollars get ten percent off."],
        ["M", "We won't reach that. Here is the school card."],
      ],
      choices: ["$180", "$162", "$200", "$150", "$216"],
      answer: 1,
      clue: "That size is one dollar fifty each.",
      explanation:
        "한 부에 1달러 50센트인 안내지 백스무 부는 180달러이고, 두꺼운 종이를 쓰지 않으며 200달러를 넘지 않아 할인도 없다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 음악회 안내지 때문에 오셨나요?",
        "M: 네, 토요일 저녁에 쓸 걸 인쇄하려고요.",
        "W: 언제 찾아가셔야 하나요?",
        "M: 되신다면 금요일 오후에요.",
        "W: 전혀 문제없습니다. 안내지가 몇 쪽인가요?",
        "M: 네 쪽이고 가운데를 한 번 접어요.",
        "W: 그 크기는 한 부에 1달러 50센트입니다.",
        "M: 백스무 부 주세요.",
        "W: 더 두꺼운 종이로 하시겠어요?",
        "M: 두꺼운 종이는 얼마가 더 붙나요?",
        "W: 한 부에 50센트입니다.",
        "M: 올해는 보통 종이면 충분해요.",
        "W: 그리고 200달러가 넘는 학교 주문은 10퍼센트 할인됩니다.",
        "M: 거기까지는 안 되겠네요. 여기 학교 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 공연에 참여하지 못하는 이유를 고르시오.",
      lines: [
        ["M", "Hayoon, you're not playing at the concert on Saturday?"],
        ["W", "I withdrew on Monday and told the teacher."],
        ["M", "Is it because the piece was too difficult?"],
        ["W", "I had it ready three weeks ago."],
        ["M", "Then are you away that weekend?"],
        ["W", "No, I hurt my wrist in the gym last Wednesday."],
        ["M", "How long did the doctor say it would take?"],
        ["W", "Three weeks without playing, and the concert is in five days."],
        ["M", "That's the worst possible timing."],
        ["W", "I'll play the same piece at the graduation instead."],
      ],
      choices: [
        "곡이 너무 어려워서",
        "그 주말에 없어서",
        "손목을 다쳐서",
        "연습할 시간이 없어서",
        "다른 공연과 겹쳐서",
      ],
      answer: 3,
      clue: "No, I hurt my wrist in the gym last Wednesday.",
      explanation:
        "여자는 손목을 다쳐 연주할 수 없다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 하윤아, 토요일 음악회에서 연주 안 해?",
        "W: 월요일에 빠지겠다고 선생님께 말씀드렸어.",
        "M: 곡이 너무 어려워서야?",
        "W: 삼 주 전에 다 준비했어.",
        "M: 그럼 그 주말에 어디 가?",
        "W: 아니, 지난 수요일에 체육관에서 손목을 다쳤어.",
        "M: 의사 선생님이 얼마나 걸린대?",
        "W: 삼 주 동안 연주하지 말래. 음악회는 닷새 뒤고.",
        "M: 시기가 최악이네.",
        "W: 대신 졸업식에서 같은 곡을 연주할 거야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 졸업 사진 촬영에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Seoyun, when is the graduation photo being taken this year?"],
        ["W", "On the seventh, in the second and third periods."],
        ["M", "That's earlier than last year, isn't it?"],
        ["W", "Two weeks earlier, because of the exam schedule."],
        ["M", "Where do we gather for it?"],
        ["W", "On the steps in front of the main building."],
        ["M", "What are we supposed to wear?"],
        ["W", "School uniform, with the jacket, whatever the weather."],
        ["M", "How long does the whole thing take?"],
        ["W", "About ninety minutes for all eleven classes."],
        ["M", "Do we get a copy without paying?"],
        ["W", "One copy each, and extra prints are ordered later."],
        ["M", "Then I'll bring my jacket on Monday."],
      ],
      choices: ["촬영 날짜와 교시", "모이는 곳", "입어야 할 옷", "전체 소요 시간", "비가 올 때의 계획"],
      answer: 5,
      clue: "On the seventh, in the second and third periods.",
      explanation:
        "날짜와 교시, 장소, 복장, 시간은 말했지만 비가 올 때의 계획은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 서윤아, 올해 졸업 사진 언제 찍어?",
        "W: 7일 2교시와 3교시에.",
        "M: 작년보다 이르네.",
        "W: 시험 일정 때문에 두 주 빨라졌어.",
        "M: 어디로 모여?",
        "W: 본관 앞 계단에.",
        "M: 뭘 입어야 해?",
        "W: 교복에 재킷까지. 날씨에 상관없이.",
        "M: 전체가 얼마나 걸려?",
        "W: 열한 반 다 해서 90분쯤.",
        "M: 돈 안 내고 한 장 받아?",
        "W: 한 사람에 한 장. 더 뽑는 건 나중에 신청해.",
        "M: 그럼 월요일에 재킷 가져와야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Jinhae Student Music Festival에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is some information about the Jinhae Student Music Festival, held every December. " +
            "The festival runs for two days, on the twelfth and the thirteenth. " +
            "All the performances take place in the city arts hall by the river. " +
            "Any student group from the region may apply, up to eight members. " +
            "Each group performs for a maximum of twelve minutes. " +
            "There is no entry fee, and the hall is free for the performers. " +
            "Audience tickets cost three thousand won and go on sale in November. " +
            "Applications close on the last day of October.",
        ],
      ],
      choices: [
        "이틀 동안 열린다",
        "강가의 시립 예술회관에서 열린다",
        "한 팀은 최대 여덟 명이다",
        "참가비를 내야 한다",
        "관람권은 11월에 판매한다",
      ],
      answer: 4,
      clue: "There is no entry fee, and the hall is free for the performers.",
      explanation:
        "참가비가 없다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "M: 해마다 12월에 열리는 진해 학생 음악제에 대해 알려 드립니다. 축제는 12일과 13일 이틀 동안 열립니다. 모든 공연은 강가 시립 예술회관에서 진행됩니다. 이 지역 학생 단체면 누구나 신청할 수 있고 한 팀은 여덟 명까지입니다. 한 팀은 최대 12분 동안 공연합니다. 참가비는 없고 출연자에게는 회관을 무료로 빌려줍니다. 관람권은 3천 원이고 11월에 판매를 시작합니다. 신청은 10월 마지막 날에 마감합니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 연습실을 고르시오.",
      lines: [
        ["W", "Dohyun, five practice rooms are free on Saturday."],
        ["M", "We've been rehearsing in the corridor for two weeks."],
        ["W", "Then let's book one today. How many are we?"],
        ["M", "Seven, with the two new members."],
        ["W", "Two of these hold only four."],
        ["M", "Then they're out. Do any of them have a piano?"],
        ["W", "Two of the three left do."],
        ["M", "We need one, because the last piece is a duet."],
        ["W", "And the price? We agreed on under twenty thousand."],
        ["M", "One of the last two is twenty-six thousand."],
        ["W", "So there's only one room for us."],
        ["M", "I'll book it before the weekend."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Seven, with the two new members.",
      explanation:
        "7명 이상, 피아노 있음, 2만 원 미만인 방을 고른다. 세 조건을 모두 채우는 것은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Seats: 4 / Piano: Yes / Price: 12,000 won" },
          { no: 2, label: "②", value: "Seats: 4 / Piano: No / Price: 10,000 won" },
          { no: 3, label: "③", value: "Seats: 8 / Piano: Yes / Price: 19,000 won" },
          { no: 4, label: "④", value: "Seats: 10 / Piano: Yes / Price: 26,000 won" },
          { no: 5, label: "⑤", value: "Seats: 8 / Piano: No / Price: 15,000 won" },
        ],
      },
      translation: [
        "W: 도현아, 토요일에 연습실 다섯 개가 비어 있어.",
        "M: 두 주째 복도에서 연습했잖아.",
        "W: 그럼 오늘 하나 잡자. 우리 몇 명이야?",
        "M: 새로 들어온 둘까지 일곱 명.",
        "W: 두 개는 네 명까지야.",
        "M: 그럼 빠지네. 피아노 있는 데 있어?",
        "W: 남은 셋 중 둘에 있어.",
        "M: 마지막 곡이 이중주라 하나 필요해.",
        "W: 값은? 2만 원 아래로 하기로 했잖아.",
        "M: 남은 둘 중 하나는 2만 6천 원이야.",
        "W: 그럼 우리한테 맞는 건 하나뿐이네.",
        "M: 주말 전에 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaewon, did you get your certificate signed?"],
        ["W", "The teacher signed it, but I left it at home."],
        ["M", "It has to be handed in by four today."],
        ["W", "I can't go home and come back in time."],
        ["M", "Could somebody bring it to the gate?"],
      ],
      choices: [
        "No, it's already handed in.",
        "Yes, my brother finishes at two.",
        "I don't have a certificate.",
        "The gate is closed today.",
        "You should sign it yourself.",
      ],
      answer: 2,
      clue: "Could somebody bring it to the gate?",
      explanation:
        "누가 정문까지 가져다줄 수 있는지 물었으므로, 동생이 두 시에 끝난다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 채원아, 확인서에 서명받았어?",
        "W: 선생님이 해 주셨는데 집에 두고 왔어.",
        "M: 오늘 네 시까지 내야 해.",
        "W: 집에 갔다 제시간에 못 와.",
        "M: 누가 정문까지 가져다줄 수 없어?",
        "W: 응, 동생이 두 시에 끝나.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, are you free during the seventh period?"],
        ["M", "I have a free period then, yes."],
        ["W", "The concert team needs help carrying the stands."],
        ["M", "How many are there?"],
        ["W", "Twelve, from the music room to the hall."],
      ],
      choices: [
        "I have a class then.",
        "All right, I'll meet you there.",
        "The stands are too heavy.",
        "You should ask somebody else.",
        "The hall is locked today.",
      ],
      answer: 2,
      clue: "Twelve, from the music room to the hall.",
      explanation:
        "빈 시간이라 했고 옮길 곳을 들었으므로, 거기서 만나자는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태민아, 7교시에 시간 돼?",
        "M: 응, 그때가 공강이야.",
        "W: 음악회 팀에서 보면대 옮길 사람이 필요해.",
        "M: 몇 개인데?",
        "W: 열두 개. 음악실에서 강당으로.",
        "M: 알겠어, 거기서 만나자.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyeon, how is the science revision going?"],
        ["W", "I read the chapter and understand every line."],
        ["M", "And in the test?"],
        ["W", "I can't produce any of it from memory."],
        ["M", "Understanding and recalling are two different skills."],
        ["W", "I always thought the first one led to the second."],
        ["M", "Only if you practise the second on purpose."],
        ["W", "How would I practise recalling?"],
        ["M", "Close the book and draw the whole diagram from memory."],
        ["W", "The first attempt would be embarrassing."],
        ["M", "The gaps in it are exactly what to study next."],
      ],
      choices: [
        "I never read the chapter.",
        "That makes sense, I'll try it tonight.",
        "Understanding is enough.",
        "I don't take science.",
        "You should draw it for me.",
      ],
      answer: 2,
      clue: "Close the book and draw the whole diagram from memory.",
      explanation:
        "책을 덮고 기억으로 그려 보라는 조언이므로, 오늘 밤 해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 서연아, 과학 복습은 어때?",
        "W: 단원을 읽으면 줄마다 다 이해돼.",
        "M: 시험에서는?",
        "W: 기억에서 아무것도 못 꺼내.",
        "M: 이해하는 것과 떠올리는 건 다른 능력이야.",
        "W: 나는 앞엣것이 뒤엣것으로 이어지는 줄 알았어.",
        "M: 뒤엣것을 일부러 연습할 때만 그래.",
        "W: 떠올리기를 어떻게 연습해?",
        "M: 책을 덮고 그 그림을 통째로 기억에서 그려 봐.",
        "W: 첫 번째 시도는 창피할 거야.",
        "M: 거기 난 빈틈이 바로 다음에 공부할 것들이야.",
        "W: 말 되네, 오늘 밤에 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangwoo, you've been getting up at six all term."],
        ["M", "Since the first week, and I still don't enjoy it."],
        ["W", "Then why keep doing it?"],
        ["M", "The first hour of the day is the only quiet one at my house."],
        ["W", "What do you do with it?"],
        ["M", "The subject I like least, while nobody can interrupt."],
        ["W", "Most people save the worst subject for last."],
        ["M", "And then they never get to it at all."],
        ["W", "That is exactly what happens to me on a Thursday."],
        ["M", "Six o'clock has no Thursday. Every day is the same."],
        ["W", "Could you tell me how you wake up at six?"],
      ],
      choices: [
        "Sure, I'll explain it after class.",
        "I get up at nine every day.",
        "I don't have a quiet hour.",
        "You should sleep longer.",
        "Thursday is my best day.",
      ],
      answer: 1,
      clue: "Could you tell me how you wake up at six?",
      explanation:
        "여자가 여섯 시에 일어나는 방법을 알려 달라고 했으므로, 수업 뒤에 설명하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 상우야, 이번 학기 내내 여섯 시에 일어났다며.",
        "M: 첫 주부터. 그런데 아직도 좋지는 않아.",
        "W: 그럼 왜 계속해?",
        "M: 우리 집에서 조용한 시간은 하루의 첫 한 시간뿐이야.",
        "W: 그 시간에 뭘 해?",
        "M: 제일 싫은 과목. 아무도 방해할 수 없을 때.",
        "W: 대부분은 제일 싫은 과목을 마지막으로 미뤄.",
        "M: 그러다 끝내 손도 못 대지.",
        "W: 나는 목요일마다 딱 그래.",
        "M: 여섯 시에는 목요일이 없어. 날마다 똑같아.",
        "W: 여섯 시에 일어나는 방법 좀 알려 줄래?",
        "M: 그럼, 수업 끝나고 설명해 줄게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Kiyoung이 Dain에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Kiyoung : ________________",
      lines: [
        [
          "M",
          "Kiyoung and Dain are organising the third year concert on Saturday. " +
            "Twelve groups will perform, each for about ten minutes. " +
            "Dain has put the two loudest bands first and second on the programme. " +
            "The hall shares a wall with the room where the choir warms up. " +
            "The choir cannot hear a note while those two bands are playing. " +
            "Moving the bands to the end would solve it completely. " +
            "Kiyoung wants to suggest the change before the programme is printed. " +
            "In this situation, what would Kiyoung most likely say to Dain?",
        ],
      ],
      choices: [
        "Let's cancel the choir's performance.",
        "The bands should play more quietly.",
        "Move the two bands to the end.",
        "I'll find another hall for Saturday.",
        "Twelve groups is far too many.",
      ],
      answer: 3,
      clue: "Moving the bands to the end would solve it completely.",
      explanation:
        "합창단이 연습할 수 없으므로 시끄러운 밴드를 뒤로 옮기자는 ③이 가장 적절하다.",
      translation: [
        "M: 기영이와 다인이는 토요일 3학년 음악회를 준비하고 있습니다. 열두 팀이 각각 10분쯤 공연합니다. 다인이는 소리가 가장 큰 밴드 두 팀을 첫 번째와 두 번째에 넣었습니다. 강당은 합창단이 목을 푸는 방과 벽을 맞대고 있습니다. 그 두 밴드가 연주하는 동안 합창단은 한 음도 들을 수 없습니다. 밴드를 맨 뒤로 옮기면 문제가 완전히 풀립니다. 기영이는 안내지가 인쇄되기 전에 그 변경을 말하고 싶습니다. 이런 상황에서 기영이가 다인이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to explain why a printed page " +
            "is easier to proofread than the same page on a screen. " +
            "Part of the reason is physical. " +
            "A screen throws light at your eye while paper reflects it, " +
            "and the first tires the eye sooner. " +
            "The larger part, though, is habit. " +
            "You have read thousands of screens quickly, skimming for the point, " +
            "and that speed is now attached to the surface itself. " +
            "Paper carries the opposite habit, from years of slow careful reading. " +
            "Print the page and your eye slows down without being asked, " +
            "which is the whole trick of proofreading. " +
            "Changing the font has much the same effect for the same reason.",
        ],
      ],
      choices: [
        "how printers reproduce colour",
        "why proofreading is easier on paper",
        "how reading speed is measured",
        "why screens damage the eyes",
        "how fonts are designed for reading",
      ],
      answer: 2,
      clue: "Print the page and your eye slows down without being asked.",
      explanation:
        "남자는 화면과 종이에 붙은 읽기 습관 때문에 종이에서 교정이 잘된다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 같은 쪽이라도 화면보다 인쇄한 종이에서 교정이 왜 더 잘되는지 설명하려 합니다. 한 가지 이유는 몸에 있습니다. 화면은 빛을 눈으로 쏘고 종이는 빛을 되비추는데, 앞엣것이 눈을 더 빨리 지치게 합니다. 그런데 더 큰 이유는 습관입니다. 우리는 수천 개의 화면을 요점만 훑으며 빠르게 읽어 왔고, 그 속도가 이제 화면이라는 표면에 붙어 버렸습니다. 종이에는 여러 해 동안 천천히 꼼꼼히 읽어 온 반대의 습관이 붙어 있습니다. 쪽을 인쇄하면 시키지 않아도 눈이 느려지는데, 그것이 교정의 전부입니다. 글꼴을 바꾸는 것도 같은 이유로 비슷한 효과를 냅니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Today I want to explain why a printed page is easier to proofread."],
        ["M", "A screen throws light at your eye while paper reflects it."],
        ["M", "You have read thousands of screens quickly, skimming for the point."],
        ["M", "Print the page and your eye slows down without being asked."],
        ["M", "Changing the font has much the same effect."],
      ],
      choices: [
        "a screen throwing light while paper reflects it",
        "reading screens quickly and skimming",
        "the eye slowing down on a printed page",
        "changing the font having a similar effect",
        "the cost of printing a long document",
      ],
      answer: 5,
      clue: "A screen throws light at your eye while paper reflects it.",
      explanation:
        "빛을 쏘는 화면과 되비추는 종이, 훑어 읽는 습관, 종이에서 느려지는 눈, 글꼴 바꾸기는 언급되지만 인쇄 비용은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
