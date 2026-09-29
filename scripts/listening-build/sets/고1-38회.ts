/** 고1 듣기 38회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 38회",
  gradeLevel: "high1",
  speechSpeed: 0.8,
  folder: "고1 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good morning, students. This is the head of the physical education department. " +
            "I want to explain how the gym will be shared from next month. " +
            "Until now any club could use the gym after school on a first come basis, " +
            "and twice last term two clubs arrived at the same hour and neither could practise. " +
            "From October the gym will be divided into three fixed slots each evening, " +
            "and every club will hold the same slot for the whole term. " +
            "The timetable is on the noticeboard by the equipment room. " +
            "Clubs that need an extra evening should speak to me by Friday. " +
            "The weekend arrangements are not changing at all. Thank you for listening.",
        ],
      ],
      choices: [
        "체육 대회 일정을 알리려고",
        "운동 기구 구입을 알리려고",
        "체육관 사용 방식 변경을 안내하려고",
        "동아리 모집을 알리려고",
        "안전 규칙을 설명하려고",
      ],
      answer: 3,
      clue: "From October the gym will be divided into three fixed slots each evening.",
      explanation:
        "남자는 10월부터 체육관을 저녁마다 세 시간대로 나누어 동아리에 고정 배정한다고 안내한다. 따라서 답은 ③이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 체육부장입니다. 다음 달부터 체육관을 어떻게 나눠 쓰는지 설명드립니다. 지금까지는 어느 동아리든 방과 후에 먼저 온 순서로 썼고, 지난 학기에 두 번은 두 동아리가 같은 시간에 와서 둘 다 연습하지 못했습니다. 10월부터 체육관은 저녁마다 세 시간대로 나뉘고, 각 동아리는 한 학기 내내 같은 시간대를 씁니다. 시간표는 기구실 옆 게시판에 있습니다. 저녁 시간이 더 필요한 동아리는 금요일까지 저에게 말해 주세요. 주말 운영은 달라지지 않습니다. 들어 주셔서 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taemin, I've made a study plan for the whole month."],
        ["M", "Every day filled in, from morning to night?"],
        ["W", "Every hour of every day, actually."],
        ["M", "What happens on the day you get sick?"],
        ["W", "I suppose I'd move everything forward."],
        ["M", "And then the plan is wrong for the next twenty days."],
        ["W", "So a plan is useless?"],
        ["M", "A plan is useful. A plan with no empty space is not."],
        ["W", "How much space are we talking about?"],
        ["M", "One free day a week, at least. Call it the repair day."],
        ["W", "That feels like losing four days a month."],
        ["M", "It saves the other twenty-six from collapsing at once."],
      ],
      choices: [
        "계획에는 비워 두는 시간이 있어야 한다",
        "계획은 하루 단위로 세워야 한다",
        "계획은 친구와 함께 세워야 한다",
        "계획보다 실천이 중요하다",
        "계획은 자주 바꾸어야 한다",
      ],
      answer: 1,
      clue: "One free day a week, at least. Call it the repair day.",
      explanation:
        "남자는 빈틈없는 계획은 하루만 어긋나도 무너진다며 일주일에 하루는 비워 두라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 태민아, 한 달치 공부 계획을 다 세웠어.",
        "M: 아침부터 밤까지 매일 다 채웠어?",
        "W: 사실 하루하루 시간마다 다 채웠어.",
        "M: 아픈 날이 생기면 어떻게 돼?",
        "W: 그럼 전부 하루씩 밀어야겠지.",
        "M: 그러면 남은 스무 날 계획이 다 틀어져.",
        "W: 그럼 계획이 쓸모없다는 거야?",
        "M: 계획은 쓸모 있어. 빈칸 없는 계획이 쓸모없는 거지.",
        "W: 얼마나 비워 둬야 하는데?",
        "M: 적어도 일주일에 하루. 고치는 날이라고 불러.",
        "W: 한 달에 나흘을 버리는 것 같은데.",
        "M: 나머지 스물여섯 날이 한꺼번에 무너지는 걸 막아 줘.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "When someone asks you for advice, the first thing you want to give is an answer. " +
            "Hold it for a minute. The question people say out loud " +
            "is almost never the question that brought them to you. " +
            "Ask what they have already tried, and listen to the order they say it in. " +
            "The real difficulty usually appears in the third or fourth sentence, " +
            "long after the first one that sounded like the problem. " +
            "An answer given to the wrong question is worse than no answer, " +
            "because the person walks away believing they have been helped.",
        ],
      ],
      choices: [
        "조언은 짧게 해야 한다",
        "조언하기 전에 진짜 고민을 먼저 들어야 한다",
        "조언은 경험한 사람만 할 수 있다",
        "고민은 글로 적어야 한다",
        "조언을 구할 상대를 잘 골라야 한다",
      ],
      answer: 2,
      clue: "Ask what they have already tried, and listen to the order they say it in.",
      explanation:
        "여자는 입 밖으로 나온 질문이 진짜 고민이 아닌 경우가 많으므로 먼저 들으라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 누군가 조언을 구하면 가장 먼저 주고 싶은 것은 답입니다. 잠깐 참으세요. 사람들이 소리 내어 말하는 질문은 그들을 여러분에게 오게 만든 질문이 아닌 경우가 거의 대부분입니다. 무엇을 이미 해 봤는지 묻고, 말하는 순서를 들으세요. 진짜 어려움은 보통 세 번째나 네 번째 문장에서 나옵니다. 문제처럼 들렸던 첫 문장보다 한참 뒤에 말이지요. 엉뚱한 질문에 준 답은 답이 없는 것보다 나쁩니다. 그 사람이 도움을 받았다고 믿으며 돌아가기 때문입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Chaerin, is this the school café your club opened?"],
        ["W", "Yes, we served our first drinks last Tuesday."],
        ["M", "There's a wide counter along the back wall."],
        ["W", "We built it from the old library shelves."],
        ["M", "A hanging lamp with a cone shade is above the counter."],
        ["W", "My uncle gave it to us when his shop closed."],
        ["M", "There are two square tables in the middle of the room."],
        ["W", "They're round, actually. The square ones wouldn't fit."],
        ["M", "A tall plant stands in the corner on the left."],
        ["W", "It has grown twenty centimetres since April."],
        ["M", "And a noticeboard hangs on the right wall."],
        ["W", "We put the week's drinks on it every Monday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "They're round, actually. The square ones wouldn't fit.",
      explanation:
        "남자가 네모난 탁자라고 하자 여자가 둥근 탁자라고 바로잡는다. 그림에는 네모난 탁자가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.36],
          [0.5, 0.08],
          [0.45, 0.78],
          [0.08, 0.4],
          [0.88, 0.3],
        ],
        scene:
          "A small school café drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A WIDE COUNTER runs along the BACK wall across the middle of the picture. " +
          "A HANGING LAMP with a CONE-SHAPED SHADE hangs from the ceiling directly above the counter. " +
          "EXACTLY TWO SQUARE TABLES with straight edges and four corners stand in the MIDDLE of the floor, " +
          "well apart from each other so both shapes are easy to see. " +
          "A TALL POTTED PLANT stands in the LEFT corner of the room. " +
          "A RECTANGULAR NOTICEBOARD hangs on the RIGHT wall.",
      },
      translation: [
        "M: 채린아, 여기가 너희 동아리가 연 학교 카페야?",
        "W: 응, 지난 화요일에 처음 음료를 팔았어.",
        "M: 뒷벽을 따라 넓은 계산대가 있네.",
        "W: 옛 도서관 책장으로 만든 거야.",
        "M: 계산대 위에는 고깔 모양 갓이 달린 등이 있고.",
        "W: 삼촌 가게가 문 닫을 때 주셨어.",
        "M: 방 한가운데에 네모난 탁자가 두 개 있네.",
        "W: 사실 둥근 거야. 네모난 건 자리가 안 나왔어.",
        "M: 왼쪽 구석에는 키 큰 화분이 있어.",
        "W: 4월부터 20센티미터나 자랐어.",
        "M: 그리고 오른쪽 벽에는 게시판이 걸려 있네.",
        "W: 월요일마다 그 주 음료를 적어 붙여.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Naeun, the class charity sale is tomorrow at lunch."],
        ["W", "Have all the goods been brought in?"],
        ["M", "Three boxes, and everything is priced."],
        ["W", "What about the table in the front hall?"],
        ["M", "The office approved it this morning."],
        ["W", "Then the only thing left is the cash box."],
        ["M", "We need coins, or nobody will get change."],
        ["W", "How much change should we start with?"],
        ["M", "About thirty thousand won in small coins."],
        ["W", "The bank near the station closes at four."],
        ["M", "And nobody has been there yet."],
        ["W", "I'll go to the bank and get the coins now."],
      ],
      choices: [
        "물건에 값을 붙이기",
        "탁자를 빌리기",
        "행정실에 허락을 받기",
        "은행에 가서 잔돈을 바꾸기",
        "상자를 옮기기",
      ],
      answer: 4,
      clue: "I'll go to the bank and get the coins now.",
      explanation:
        "여자는 지금 은행에 가서 동전을 바꿔 오겠다고 말한다. 따라서 답은 ④이다.",
      translation: [
        "M: 나은아, 학급 자선 바자회가 내일 점심이야.",
        "W: 물건은 다 들어왔어?",
        "M: 상자 세 개. 값도 다 붙였어.",
        "W: 앞 현관 탁자는?",
        "M: 오늘 아침에 행정실에서 허락해 줬어.",
        "W: 그럼 남은 건 돈통뿐이네.",
        "M: 동전이 필요해. 안 그러면 거스름돈을 못 줘.",
        "W: 잔돈을 얼마나 준비해야 해?",
        "M: 동전으로 3만 원쯤.",
        "W: 역 근처 은행이 네 시에 닫아.",
        "M: 그런데 아직 아무도 안 갔어.",
        "W: 지금 은행 가서 동전 바꿔 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good afternoon. What can I do for you?"],
        ["M", "I'd like to order some flowers for a teacher."],
        ["W", "A single rose is two dollars, and a lily is three."],
        ["M", "Six roses and four lilies, please."],
        ["W", "Would you like them wrapped as a bouquet?"],
        ["M", "Yes, how much does the wrapping cost?"],
        ["W", "Simple paper is free, and the ribbon wrap is five dollars."],
        ["M", "We'll take the ribbon wrap, then."],
        ["W", "Do you want a card with a message?"],
        ["M", "No card, thank you. We'll write our own."],
        ["W", "And there's a ten percent discount for students today."],
        ["M", "Here is my student card, then."],
      ],
      choices: ["$26.10", "$29", "$27", "$25.20", "$24.30"],
      answer: 1,
      clue: "A single rose is two dollars, and a lily is three.",
      explanation:
        "장미 여섯 송이 12달러와 백합 네 송이 12달러, 리본 포장 5달러를 더하면 29달러이고, 10퍼센트를 빼면 26달러 10센트이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 무엇을 도와드릴까요?",
        "M: 선생님께 드릴 꽃을 주문하려고요.",
        "W: 장미는 한 송이에 2달러, 백합은 3달러입니다.",
        "M: 장미 여섯 송이랑 백합 네 송이 주세요.",
        "W: 꽃다발로 포장해 드릴까요?",
        "M: 네, 포장은 얼마예요?",
        "W: 단순한 종이는 무료이고 리본 포장은 5달러입니다.",
        "M: 그럼 리본 포장으로 할게요.",
        "W: 글을 적을 카드도 드릴까요?",
        "M: 카드는 괜찮아요. 저희가 직접 쓸게요.",
        "W: 그리고 오늘 학생은 10퍼센트 할인됩니다.",
        "M: 그럼 여기 학생증이요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 오늘 일찍 등교한 이유를 고르시오.",
      lines: [
        ["W", "Hyunwoo, you were already in the classroom before seven this morning."],
        ["M", "I was, and the corridor lights were still switched off."],
        ["W", "Did you have to finish your homework here?"],
        ["M", "No, I finished all of that at home last night."],
        ["W", "Then were you meeting one of the teachers early?"],
        ["M", "Not that either. I had to water the class plants before assembly."],
        ["W", "Isn't that Jimin's job for this whole week?"],
        ["M", "She's away on a family trip, so I took her turn."],
        ["W", "That's why the leaves looked so green today."],
        ["M", "They dry out fast on the window side of the room."],
      ],
      choices: [
        "숙제를 끝내려고",
        "선생님을 만나려고",
        "교실 화분에 물을 주려고",
        "시험공부를 하려고",
        "청소를 하려고",
      ],
      answer: 3,
      clue: "I had to water the class plants before assembly.",
      explanation:
        "남자는 조회 전에 교실 화분에 물을 주려고 일찍 왔다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 현우야, 오늘 아침 일곱 시 전에 벌써 교실에 있더라.",
        "M: 응, 복도 불도 아직 꺼져 있었어.",
        "W: 여기서 숙제 끝내야 했어?",
        "M: 아니, 그건 어젯밤에 집에서 다 했어.",
        "W: 그럼 선생님을 일찍 만나러 왔어?",
        "M: 그것도 아니야. 조회 전에 교실 화분에 물을 줘야 했어.",
        "W: 이번 주는 지민이 차례 아니야?",
        "M: 지민이가 가족 여행을 가서 내가 대신 했어.",
        "W: 그래서 오늘 잎이 그렇게 푸르렀구나.",
        "M: 창가 쪽은 금방 마르거든.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 영어 에세이 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Sujin, are you entering the English essay contest?"],
        ["W", "I'd like to, but I don't know the details yet."],
        ["M", "The deadline is the twentieth, at five in the afternoon."],
        ["W", "That gives us about two weeks. How long should it be?"],
        ["M", "Between six hundred and eight hundred words."],
        ["W", "Is there a set topic this year?"],
        ["M", "Two topics, and you choose one of them."],
        ["W", "Where do we send the finished essay?"],
        ["M", "To the English department email, as a single file."],
        ["W", "Do they announce the results at assembly?"],
        ["M", "On the noticeboard first, and then at assembly."],
      ],
      choices: ["제출 마감일", "글의 길이", "주제를 정하는 방법", "제출하는 방법", "심사하는 사람"],
      answer: 5,
      clue: "The deadline is the twentieth, at five in the afternoon.",
      explanation:
        "마감일, 길이, 주제, 제출 방법은 말했지만 심사하는 사람은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 수진아, 영어 에세이 대회 나갈 거야?",
        "W: 나가고 싶은데 아직 자세한 걸 몰라.",
        "M: 마감은 20일 오후 다섯 시야.",
        "W: 그럼 2주쯤 남았네. 길이는 얼마나 써야 해?",
        "M: 600자에서 800자 사이.",
        "W: 올해 정해진 주제가 있어?",
        "M: 주제가 두 개인데 그중 하나를 고르면 돼.",
        "W: 다 쓴 글은 어디로 보내?",
        "M: 영어과 전자우편으로. 파일 하나로.",
        "W: 결과는 조회 때 발표해?",
        "M: 게시판에 먼저 붙이고 그다음에 조회에서.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Riverbank Book Fair에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Riverbank Book Fair, which takes place next weekend. " +
            "The fair runs for two days, on Saturday and Sunday, from ten until six. " +
            "It is held in the open square in front of the city library. " +
            "About forty publishers and twenty second-hand sellers will set up tables. " +
            "Entry is free, and no ticket or booking is needed. " +
            "Writers will read from their work on the small stage every hour. " +
            "Books bought at the fair can be wrapped free at the desk by the gate. " +
            "If it rains, the whole fair moves indoors to the library hall.",
        ],
      ],
      choices: [
        "토요일과 일요일 이틀 동안 열린다",
        "시립 도서관 앞 광장에서 열린다",
        "매시간 작가 낭독이 있다",
        "입장권을 미리 예매해야 한다",
        "비가 오면 실내로 옮긴다",
      ],
      answer: 4,
      clue: "Entry is free, and no ticket or booking is needed.",
      explanation:
        "입장은 무료이고 표나 예약이 필요 없다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 다음 주말에 열리는 리버뱅크 책 축제에 대해 말씀드리겠습니다. 축제는 토요일과 일요일 이틀 동안 열 시부터 여섯 시까지 이어집니다. 시립 도서관 앞 열린 광장에서 열립니다. 출판사 마흔 곳과 헌책 판매자 스무 곳이 탁자를 놓습니다. 입장은 무료이고 표나 예약은 필요 없습니다. 작은 무대에서는 매시간 작가들이 자기 작품을 낭독합니다. 축제에서 산 책은 정문 옆 창구에서 무료로 포장해 드립니다. 비가 오면 축제 전체를 도서관 강당 안으로 옮깁니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 선택할 사진 강좌를 고르시오.",
      lines: [
        ["M", "Dain, five photography courses start at the centre next month."],
        ["W", "I've wanted to take one of these since last winter."],
        ["M", "Then let's decide today. Which ones can you attend?"],
        ["W", "We can only go on weekday evenings, remember."],
        ["M", "Right, that takes out the two weekend ones straight away."],
        ["W", "How many students are in each class?"],
        ["M", "They range from eight up to twenty."],
        ["W", "More than fifteen is too many for us to get help."],
        ["M", "One of the three that are left has eighteen."],
        ["W", "And the fee should stay under eighty thousand won."],
        ["M", "One of the last two is ninety-five thousand."],
        ["W", "So only one course is left for the two of us."],
        ["M", "I'll sign us both up tomorrow morning before class."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "We can only go on weekday evenings.",
      explanation:
        "평일 저녁, 정원 15명 이하, 8만 원 미만인 강좌를 고른다. 세 조건을 모두 채우는 것은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Saturday / Students: 10 / Fee: 70,000 won" },
          { no: 2, label: "②", value: "Day: Sunday / Students: 8 / Fee: 60,000 won" },
          { no: 3, label: "③", value: "Day: Tuesday / Students: 18 / Fee: 65,000 won" },
          { no: 4, label: "④", value: "Day: Wednesday / Students: 12 / Fee: 95,000 won" },
          { no: 5, label: "⑤", value: "Day: Thursday / Students: 14 / Fee: 78,000 won" },
        ],
      },
      translation: [
        "M: 다인아, 다음 달에 센터에서 사진 강좌 다섯 개가 시작해.",
        "W: 지난겨울부터 하나 듣고 싶었어.",
        "M: 그럼 오늘 정하자. 너는 언제 갈 수 있어?",
        "W: 우리는 평일 저녁에만 갈 수 있잖아.",
        "M: 맞아, 그럼 주말 두 개는 바로 빠지네.",
        "W: 한 반에 몇 명씩이야?",
        "M: 여덟 명부터 스무 명까지 있어.",
        "W: 열다섯 명 넘으면 봐 주기 어려울 만큼 많아.",
        "M: 남은 셋 중 하나는 열여덟 명이야.",
        "W: 그리고 수강료는 8만 원 아래여야 해.",
        "M: 남은 둘 중 하나는 9만 5천 원이야.",
        "W: 그럼 우리 둘한테 남는 건 하나뿐이네.",
        "M: 내일 아침 수업 전에 둘 다 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junho, are the club photos ready for the yearbook?"],
        ["M", "I chose twelve, but they're still on my camera."],
        ["W", "The editor wants them by tomorrow."],
        ["M", "I can move them to a folder tonight."],
        ["W", "Do you want me to send them for you?"],
      ],
      choices: [
        "No, I haven't taken any photos.",
        "Yes, please, I'll share the folder.",
        "The yearbook is finished.",
        "You should choose the photos.",
        "My camera is broken.",
      ],
      answer: 2,
      clue: "Do you want me to send them for you?",
      explanation:
        "대신 보내 줄지 물었으므로, 폴더를 공유하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준호야, 졸업 앨범에 들어갈 동아리 사진 준비됐어?",
        "M: 열두 장 골랐는데 아직 사진기에 있어.",
        "W: 편집 담당이 내일까지 달래.",
        "M: 오늘 밤에 폴더로 옮길 수 있어.",
        "W: 내가 대신 보내 줄까?",
        "M: 응, 부탁해. 폴더 공유할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyun, is the art room open after school today?"],
        ["W", "Until five, I think. The teacher stays late on Tuesdays."],
        ["M", "I need to finish my poster before Friday."],
        ["W", "Do you have your own paints?"],
        ["M", "Only two colours. Could I borrow yours?"],
      ],
      choices: [
        "The art room is closed all week.",
        "Of course, they're in my locker.",
        "I don't paint at all.",
        "You should finish it at home.",
        "Friday is too late.",
      ],
      answer: 2,
      clue: "Only two colours. Could I borrow yours?",
      explanation:
        "물감을 빌려 달라고 했으므로, 사물함에 있다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 서윤아, 오늘 방과 후에 미술실 열어?",
        "W: 다섯 시까지일걸. 화요일에는 선생님이 늦게까지 계셔.",
        "M: 금요일 전에 포스터를 끝내야 해.",
        "W: 네 물감은 있어?",
        "M: 두 색뿐이야. 네 거 빌려도 돼?",
        "W: 그럼, 내 사물함에 있어.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Hyerin, how is the school garden project going?"],
        ["W", "The vegetables grow well, but people stop coming."],
        ["M", "How many turned up last Saturday?"],
        ["W", "Three, and two of them were the leaders."],
        ["M", "It started with twenty, didn't it?"],
        ["W", "Twenty-two, and they all seemed excited in March."],
        ["M", "What changes between March and September?"],
        ["W", "Nothing visible happens for weeks, so it feels pointless."],
        ["M", "Then people need to see what they did."],
        ["W", "Perhaps, but how would I show that?"],
        ["M", "Take a photo of the same bed every week and put them side by side."],
      ],
      choices: [
        "Nobody uses the garden now.",
        "That would show the change, I'll start.",
        "The vegetables are all dead.",
        "We should close the garden.",
        "I don't have a camera at all.",
      ],
      answer: 2,
      clue: "Take a photo of the same bed every week and put them side by side.",
      explanation:
        "같은 자리를 매주 찍어 나란히 놓으라는 제안이므로, 변화가 보이겠다며 시작하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 혜린아, 학교 텃밭 활동은 어떻게 돼 가?",
        "W: 채소는 잘 자라는데 사람들이 안 와.",
        "M: 지난 토요일에 몇 명 왔는데?",
        "W: 세 명. 그중 둘은 운영진이야.",
        "M: 스무 명으로 시작했잖아.",
        "W: 스물두 명. 3월엔 다들 신나 했어.",
        "M: 3월과 9월 사이에 뭐가 달라진 걸까?",
        "W: 몇 주 동안 눈에 보이는 게 없으니 헛되게 느껴지는 거지.",
        "M: 그럼 사람들이 자기가 한 걸 봐야 해.",
        "W: 그럴지도. 근데 그걸 어떻게 보여 줘?",
        "M: 같은 이랑을 매주 찍어서 나란히 놓아 봐.",
        "W: 그러면 변화가 보이겠다, 시작해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangmin, you've been going to the pool before school these days."],
        ["M", "Three mornings a week, from six thirty until seven fifteen."],
        ["W", "Is it not hard to wake up that early in autumn?"],
        ["M", "The first ten days were terrible, honestly."],
        ["W", "What changed after those first ten days?"],
        ["M", "Now I wake up before the alarm on swimming days."],
        ["W", "Does all that swimming not make you sleepy in class?"],
        ["M", "The opposite. The first two periods are my best ones."],
        ["W", "My brother says the same thing about running."],
        ["M", "Anything that wakes the body seems to wake the head."],
        ["W", "Could I come with you one morning?"],
      ],
      choices: [
        "Sure, come on Wednesday.",
        "I stopped swimming in June.",
        "The pool opens at noon.",
        "You can't swim at all.",
        "I go in the evening now.",
      ],
      answer: 1,
      clue: "Could I come with you one morning?",
      explanation:
        "여자가 같이 가도 되는지 물었으므로, 수요일에 오라는 ①이 가장 자연스럽다.",
      translation: [
        "W: 상민아, 요즘 학교 오기 전에 수영장 가더라.",
        "M: 일주일에 세 번, 6시 30분부터 7시 15분까지.",
        "W: 가을에 그렇게 일찍 일어나기 힘들지 않아?",
        "M: 솔직히 첫 열흘은 끔찍했어.",
        "W: 그 첫 열흘 뒤에는 뭐가 달라졌어?",
        "M: 수영 가는 날엔 알람 전에 눈이 떠져.",
        "W: 그렇게 수영하면 수업 시간에 졸리지 않아?",
        "M: 반대야. 1, 2교시가 제일 잘돼.",
        "W: 우리 오빠도 달리기에 대해 똑같이 말해.",
        "M: 몸을 깨우는 건 뭐든 머리도 깨우나 봐.",
        "W: 나도 한 번 같이 가도 돼?",
        "M: 그럼, 수요일에 와.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Nayeon이 Junhyuk에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Nayeon : ________________",
      lines: [
        [
          "W",
          "Nayeon and Junhyuk are organising the class trip together. " +
            "They have to send the final number of students to the bus company. " +
            "Junhyuk counted the names on the sign-up sheet this morning. " +
            "He wrote down thirty, but four students added their names at lunch. " +
            "If the wrong number is sent, four people will have no seat on the bus. " +
            "The company closes its office in half an hour. " +
            "Nayeon wants him to check the sheet again before he sends the message. " +
            "In this situation, what would Nayeon most likely say to Junhyuk?",
        ],
      ],
      choices: [
        "Let's cancel the trip this year.",
        "The bus company is very slow.",
        "Count the sheet again before you send it.",
        "I'll drive the students myself.",
        "Thirty students is far too many.",
      ],
      answer: 3,
      clue: "Nayeon wants him to check the sheet again before he sends the message.",
      explanation:
        "점심때 네 명이 더 적어 넣었으므로 보내기 전에 다시 세어야 한다. 따라서 답은 ③이다.",
      translation: [
        "W: 나연이와 준혁이는 학급 여행을 함께 준비하고 있습니다. 두 사람은 버스 회사에 최종 학생 수를 보내야 합니다. 준혁이는 오늘 아침에 신청서에 적힌 이름을 세었습니다. 서른 명이라고 적었는데 점심시간에 네 명이 더 이름을 적었습니다. 잘못된 숫자를 보내면 네 사람은 버스에 자리가 없습니다. 회사 사무실은 30분 뒤에 문을 닫습니다. 나연이는 메시지를 보내기 전에 신청서를 다시 확인하기를 바랍니다. 이런 상황에서 나연이가 준혁이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to explain why a thermos keeps drinks hot. " +
            "Heat leaves a liquid in three ways, and a thermos blocks all three. " +
            "Inside the outer case there are two walls of glass or steel, " +
            "and the space between them has been emptied of almost all air. " +
            "Heat cannot travel by touch through a vacuum, because there is nothing to touch, " +
            "and it cannot travel by moving air either, for the same reason. " +
            "That leaves radiation, the heat that travels as invisible light, " +
            "so the facing surfaces are coated with a mirror-bright silver layer " +
            "that throws the heat back towards the liquid. " +
            "The only real weakness is the lid, which is why a thermos cools faster when opened often.",
        ],
      ],
      choices: [
        "how glass bottles are made and shaped",
        "why a thermos keeps a drink hot for hours",
        "how mirrors reflect visible light",
        "why hot drinks taste different when cold",
        "how air pressure changes with altitude",
      ],
      answer: 2,
      clue: "Heat leaves a liquid in three ways, and a thermos blocks all three.",
      explanation:
        "남자는 진공과 은도금으로 열이 나가는 세 가지 길을 모두 막는다며 보온병의 원리를 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 보온병이 어떻게 음료를 뜨겁게 유지하는지 설명하려 합니다. 열은 액체에서 세 가지 길로 빠져나가는데 보온병은 그 셋을 모두 막습니다. 바깥 껍데기 안에는 유리나 강철로 된 벽이 두 겹 있고, 그 사이 공간에서는 공기를 거의 다 빼냈습니다. 진공에서는 닿을 것이 없으니 맞닿아 전해지는 열이 지나갈 수 없고, 같은 이유로 공기가 움직여 옮기는 열도 지나갈 수 없습니다. 그러면 눈에 보이지 않는 빛으로 옮겨 가는 복사열이 남는데, 마주 보는 면에 거울처럼 빛나는 은막을 입혀 그 열을 액체 쪽으로 되돌려 보냅니다. 유일한 약점은 뚜껑입니다. 그래서 자주 열면 빨리 식습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Today I want to explain why a thermos keeps drinks hot."],
        ["M", "Inside the outer case there are two walls of glass or steel."],
        ["M", "The space between them has been emptied of almost all air."],
        ["M", "The facing surfaces are coated with a mirror-bright silver layer."],
        ["M", "The only real weakness is the lid."],
      ],
      choices: [
        "two walls inside the outer case",
        "air removed from the space between the walls",
        "a mirror-bright silver coating",
        "the lid being the weak point",
        "the price of a steel thermos",
      ],
      answer: 5,
      clue: "Inside the outer case there are two walls of glass or steel.",
      explanation:
        "두 겹의 벽, 사이 공간의 공기를 뺀 것, 은막, 약점인 뚜껑은 언급되지만 보온병의 값은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
