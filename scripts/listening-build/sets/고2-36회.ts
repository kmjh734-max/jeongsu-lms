/** 고2 듣기 36회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 36회",
  gradeLevel: "high2",
  speechSpeed: 0.8,
  folder: "고2 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Good morning, everyone. This is the school librarian speaking. " +
            "I want to tell you about a small change to the borrowing rules. " +
            "Until now a book could be borrowed for two weeks and renewed once, " +
            "and every term a few titles stayed out for months while forty people waited. " +
            "From next Monday a book with somebody waiting for it cannot be renewed. " +
            "You will see a short message when you try, telling you the date it is due. " +
            "Everything else stays the same, including the number of books you may hold. " +
            "If you are the one waiting, you will get a message when the book comes back. " +
            "Please return anything you have finished with. Thank you.",
        ],
      ],
      choices: [
        "도서 대출 규칙 변경을 안내하려고",
        "도서관 이전을 알리려고",
        "연체료 인상을 알리려고",
        "독서 행사를 소개하려고",
        "도서 기증을 부탁하려고",
      ],
      answer: 1,
      clue: "From next Monday a book with somebody waiting for it cannot be renewed.",
      explanation:
        "여자는 다음 주부터 예약자가 있는 책은 연장할 수 없다며 대출 규칙 변경을 안내한다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 학교 사서입니다. 대출 규칙이 조금 달라지는 점을 알려 드립니다. 지금까지는 책을 두 주 빌리고 한 번 연장할 수 있었는데, 학기마다 몇몇 책이 몇 달씩 나가 있는 동안 마흔 명이 기다리곤 했습니다. 다음 주 월요일부터는 기다리는 사람이 있는 책은 연장할 수 없습니다. 연장을 누르면 반납일을 알려 주는 짧은 안내가 뜹니다. 한 사람이 빌릴 수 있는 권수를 비롯해 나머지는 그대로입니다. 기다리는 쪽이라면 책이 들어올 때 알림을 받게 됩니다. 다 읽은 책은 돌려주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Dohyun, I've asked five people about my essay."],
        ["M", "Five? What did each of them say?"],
        ["W", "Different things. Two liked the opening, three hated it."],
        ["M", "And what have you done with all that?"],
        ["W", "Nothing yet. I don't know whose advice to follow."],
        ["M", "That's what happens when you ask everybody."],
        ["W", "Isn't more feedback better than less?"],
        ["M", "Only if you can weigh it. Five voices with no order is noise."],
        ["W", "So I should have asked fewer people?"],
        ["M", "One reader you trust, and one specific question."],
        ["W", "A question like what?"],
        ["M", "Where did you stop believing me? That one answer is worth the other five."],
      ],
      choices: [
        "글은 여러 사람에게 보여 줘야 한다",
        "믿는 한 사람에게 구체적으로 물어야 한다",
        "글은 소리 내어 읽어야 한다",
        "조언은 선생님께만 구해야 한다",
        "고쳐 쓰기는 하루 뒤에 해야 한다",
      ],
      answer: 2,
      clue: "One reader you trust, and one specific question.",
      explanation:
        "남자는 여러 사람의 말은 소음이 된다며 믿는 한 사람에게 구체적으로 물으라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 도현아, 내 글을 다섯 명한테 보여 줬어.",
        "M: 다섯 명? 다들 뭐래?",
        "W: 제각각이야. 둘은 도입부가 좋대고 셋은 싫대.",
        "M: 그래서 그걸로 뭘 했어?",
        "W: 아직 아무것도. 누구 말을 따라야 할지 모르겠어.",
        "M: 모두에게 물으면 그렇게 돼.",
        "W: 의견은 많을수록 좋지 않아?",
        "M: 견줄 수 있을 때만. 순서 없는 다섯 목소리는 소음이야.",
        "W: 그럼 더 적은 사람에게 물었어야 했다는 거야?",
        "M: 믿는 독자 한 명, 그리고 구체적인 질문 하나.",
        "W: 어떤 질문?",
        "M: 어디서부터 내 말이 안 믿겼어? 그 답 하나가 나머지 다섯보다 값져.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We treat a decision as a single moment, and it almost never is. " +
            "By the time you sit down to choose, most of the choosing has been done, " +
            "quietly, by what you have read, who you have listened to, " +
            "and what you happened to be looking at last week. " +
            "This is why two people can weigh the same facts and arrive in different places. " +
            "If you want to decide better, do not spend longer at the final moment. " +
            "Spend the month before it in wider company, reading things you did not agree with, " +
            "so that the quiet part of the decision has more than one voice in it.",
        ],
      ],
      choices: [
        "결정은 빨리 내려야 한다",
        "결정 전 몇 달 동안 다양한 견해를 접해야 한다",
        "중요한 결정은 미뤄야 한다",
        "결정은 혼자 내려야 한다",
        "결정의 이유를 적어야 한다",
      ],
      answer: 2,
      clue: "Spend the month before it in wider company, reading things you did not agree with.",
      explanation:
        "여자는 결정의 대부분이 그전에 읽고 들은 것에서 정해진다며 다양한 견해를 미리 접하라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 우리는 결정을 한순간의 일로 여기지만 거의 그렇지 않습니다. 앉아서 고르기 시작할 무렵이면 고르는 일의 대부분은 이미 끝나 있습니다. 무엇을 읽었는지, 누구의 말을 들었는지, 지난주에 무엇을 보고 있었는지가 조용히 그 일을 해 둔 것입니다. 그래서 같은 사실을 놓고도 두 사람이 서로 다른 곳에 닿습니다. 더 잘 결정하고 싶다면 마지막 순간에 더 오래 앉아 있지 마세요. 그 앞의 한 달을 더 넓은 사람들 사이에서 보내고, 동의하지 않는 글을 읽으세요. 그래야 결정의 조용한 부분에 하나 이상의 목소리가 담깁니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Nayeon, is this the student council room after the move?"],
        ["W", "Yes, we carried everything up on Saturday."],
        ["M", "A long meeting table stands in the middle."],
        ["W", "Twelve of us sit round it every Tuesday."],
        ["M", "There's a whiteboard on the left wall."],
        ["W", "The term's plan stays on it until December."],
        ["M", "A tall filing cabinet stands in the right corner."],
        ["W", "Every year's records are kept in there."],
        ["M", "I count four chairs along the near side of the table."],
        ["W", "There are five. One is pushed right under the corner."],
        ["M", "And a round clock hangs above the door."],
        ["W", "We end the meeting by it, whatever is left to say."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "There are five. One is pushed right under the corner.",
      explanation:
        "남자가 의자가 네 개라고 하자 여자가 다섯 개라고 바로잡는다. 그림에는 네 개가 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.45],
          [0.09, 0.32],
          [0.88, 0.45],
          [0.42, 0.82],
          [0.62, 0.09],
        ],
        scene:
          "A student council room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A LONG RECTANGULAR MEETING TABLE stands in the MIDDLE of the room. " +
          "A BLANK WHITEBOARD hangs on the LEFT wall. " +
          "A TALL FILING CABINET with drawers stands in the RIGHT corner. " +
          "EXACTLY FOUR CHAIRS stand in a row along the NEAR side of the table, facing away from the viewer, " +
          "evenly spaced and clearly separated so all four can be counted. " +
          "A ROUND WALL CLOCK hangs on the BACK wall above a door.",
      },
      translation: [
        "M: 나연아, 여기가 옮기고 난 학생회실이야?",
        "W: 응, 토요일에 다 올려 왔어.",
        "M: 가운데에 긴 회의 탁자가 있네.",
        "W: 화요일마다 열두 명이 둘러앉아.",
        "M: 왼쪽 벽에는 화이트보드가 있고.",
        "W: 학기 계획을 12월까지 거기에 붙여 둬.",
        "M: 오른쪽 구석에는 키 큰 서류장이 있어.",
        "W: 해마다의 기록이 다 거기 들어 있어.",
        "M: 탁자 이쪽 편에 의자가 네 개 보여.",
        "W: 다섯 개야. 하나는 모서리 밑에 바짝 밀어 넣었어.",
        "M: 그리고 문 위에 둥근 시계가 걸려 있네.",
        "W: 할 말이 남아도 그 시계를 보고 회의를 끝내.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, the winter concert is only two weeks away."],
        ["W", "Has the programme order been decided yet?"],
        ["M", "All eleven items, and the choir goes last as usual."],
        ["W", "Good. The choir always ends the evening well."],
        ["M", "They asked for that spot themselves this year."],
        ["W", "What about the tickets for the families?"],
        ["M", "Printed on Monday and given out to everyone yesterday."],
        ["W", "Then almost everything seems to be settled."],
        ["M", "Except the piano. Nobody has booked the tuner."],
        ["W", "Does it really need tuning again so soon?"],
        ["M", "It was moved right across the hall last month."],
        ["W", "That would knock any piano out of tune."],
        ["M", "And the tuner is usually busy all through December."],
        ["W", "I'll call the tuner and book a date this afternoon."],
      ],
      choices: [
        "표를 나눠 주기",
        "순서를 정하기",
        "조율사에게 예약 전화를 하기",
        "피아노를 옮기기",
        "합창단에 연락하기",
      ],
      answer: 3,
      clue: "I'll call the tuner and book a date this afternoon.",
      explanation:
        "여자는 오늘 오후에 조율사에게 전화해 날짜를 잡겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 서연아, 겨울 음악회가 두 주밖에 안 남았어.",
        "W: 순서는 이제 정해졌어?",
        "M: 열한 곡 다. 늘 그렇듯 합창단이 마지막이야.",
        "W: 좋네. 합창단이 늘 저녁을 잘 마무리하잖아.",
        "M: 올해는 자기들이 그 자리를 달라고 했어.",
        "W: 가족들한테 줄 표는?",
        "M: 월요일에 인쇄해서 어제 다 나눠 줬어.",
        "W: 그럼 거의 다 정리된 것 같은데.",
        "M: 피아노만 빼고. 조율사를 아무도 안 불렀어.",
        "W: 벌써 또 조율해야 해?",
        "M: 지난달에 강당 반대편까지 옮겼잖아.",
        "W: 그러면 어느 피아노든 음이 틀어지지.",
        "M: 게다가 12월 내내 조율사가 바빠.",
        "W: 오늘 오후에 조율사한테 전화해서 날짜 잡을게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good afternoon. Are you here about the class photos?"],
        ["M", "Yes, I'd like to order some prints."],
        ["W", "A small print is three dollars and a large one is six."],
        ["M", "Six small ones and two large ones, please."],
        ["W", "Would you like them in a paper folder?"],
        ["M", "How much is the folder?"],
        ["W", "Four dollars, and it holds up to ten prints."],
        ["M", "One folder will be enough for us."],
        ["W", "Do you want them delivered to the school?"],
        ["M", "No, I'll collect them on Friday."],
        ["W", "Then there's a five dollar discount for collecting."],
        ["M", "Here is my card, then."],
      ],
      choices: ["$29", "$34", "$30", "$25", "$39"],
      answer: 1,
      clue: "A small print is three dollars and a large one is six.",
      explanation:
        "작은 사진 여섯 장 18달러와 큰 사진 두 장 12달러, 보관지 4달러를 더하면 34달러이고, 5달러를 빼면 29달러이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 학급 사진 때문에 오셨나요?",
        "M: 네, 인화를 좀 주문하려고요.",
        "W: 작은 사진은 3달러, 큰 사진은 6달러입니다.",
        "M: 작은 것 여섯 장, 큰 것 두 장 주세요.",
        "W: 종이 보관지에 넣어 드릴까요?",
        "M: 보관지는 얼마예요?",
        "W: 4달러이고 열 장까지 들어갑니다.",
        "M: 하나면 충분해요.",
        "W: 학교로 배달해 드릴까요?",
        "M: 아니요, 금요일에 직접 찾아갈게요.",
        "W: 그러시면 5달러를 빼 드립니다.",
        "M: 그럼 여기 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 도서 대출을 못 한 이유를 고르시오.",
      lines: [
        ["M", "Chaeyeon, you came back from the library empty-handed."],
        ["W", "I did, and I walked all the way there for nothing."],
        ["M", "Was the book you wanted already out?"],
        ["W", "It was on the shelf, exactly where it should be."],
        ["M", "Then did you forget your student card again?"],
        ["W", "No, I have an overdue book at home."],
        ["M", "And they won't lend you anything until it comes back."],
        ["W", "Not a single title, they said, however short the book is."],
        ["M", "How late is the one at home?"],
        ["W", "Eleven days, and I genuinely thought it was three."],
      ],
      choices: [
        "책이 이미 대출 중이어서",
        "학생증을 잃어버려서",
        "연체된 책이 있어서",
        "도서관이 문을 닫아서",
        "대출 권수를 다 채워서",
      ],
      answer: 3,
      clue: "No, I have an overdue book at home.",
      explanation:
        "여자는 집에 연체된 책이 있어서 빌릴 수 없었다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 채연아, 도서관에서 빈손으로 왔네.",
        "W: 응, 거기까지 걸어갔는데 헛걸음했어.",
        "M: 원하던 책이 벌써 나가 있었어?",
        "W: 있어야 할 자리에 그대로 꽂혀 있었어.",
        "M: 그럼 또 학생증을 두고 갔어?",
        "W: 아니, 집에 연체된 책이 있어.",
        "M: 그게 들어올 때까지 아무것도 안 빌려주는구나.",
        "W: 아무리 얇은 책이라도 한 권도 안 된대.",
        "M: 집에 있는 건 얼마나 늦었는데?",
        "W: 열하루. 나는 정말로 사흘인 줄 알았어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 토론 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Hayoon, are you entering the debate competition this year?"],
        ["W", "I signed up, but I haven't read the rules yet."],
        ["M", "It takes place on the nineteenth, in the afternoon."],
        ["W", "That's a Friday, isn't it? How are the teams made?"],
        ["M", "Three to a team, and you may choose your own members."],
        ["W", "Do we know the topic beforehand?"],
        ["M", "The topic goes up a week ahead, but not which side you argue."],
        ["W", "So you have to prepare both sides."],
        ["M", "Both, and the side is drawn twenty minutes before you speak."],
        ["W", "Where does the competition take place?"],
        ["M", "In the library, with the tables moved into two rows."],
      ],
      choices: ["대회 날짜", "팀 구성 방법", "주제를 아는 시점", "대회가 열리는 곳", "발언 시간"],
      answer: 5,
      clue: "It takes place on the nineteenth, in the afternoon.",
      explanation:
        "날짜, 팀 구성, 주제 공개 시점, 장소는 말했지만 발언 시간은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 하윤아, 올해 토론 대회 나가?",
        "W: 신청은 했는데 규칙을 아직 안 읽었어.",
        "M: 19일 오후에 해.",
        "W: 금요일이네. 팀은 어떻게 짜?",
        "M: 세 명이 한 팀이고 팀원은 직접 고를 수 있어.",
        "W: 주제는 미리 알려 줘?",
        "M: 주제는 일주일 전에 붙는데 어느 쪽을 맡을지는 안 알려 줘.",
        "W: 그럼 양쪽 다 준비해야겠네.",
        "M: 둘 다. 어느 쪽인지는 발언 20분 전에 뽑아.",
        "W: 대회는 어디서 해?",
        "M: 도서관에서. 탁자를 두 줄로 옮겨 놓고 해.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Old Station Art Space에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Old Station Art Space, which opened last autumn. " +
            "It occupies the waiting hall of a railway station that closed in nineteen eighty-eight. " +
            "The space is open from eleven until seven, and it closes on Wednesdays. " +
            "Three exhibitions run at the same time, and they change every six weeks. " +
            "Entry is free, because the city pays the running costs. " +
            "A small café on the old platform sells drinks and simple food. " +
            "Visitors may sketch anywhere, but paints and easels are not allowed inside. " +
            "School groups of ten or more should book a week in advance.",
        ],
      ],
      choices: [
        "문을 닫은 기차역 대합실을 쓰고 있다",
        "수요일에는 문을 열지 않는다",
        "전시는 여섯 주마다 바뀐다",
        "입장료를 내야 한다",
        "안에서 물감은 쓸 수 없다",
      ],
      answer: 4,
      clue: "Entry is free, because the city pays the running costs.",
      explanation:
        "시에서 운영비를 대어 입장이 무료라고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 지난가을에 문을 연 옛 역 예술 공간에 대해 알려 드립니다. 1988년에 문을 닫은 기차역의 대합실을 쓰고 있습니다. 열한 시부터 일곱 시까지 열고 수요일에는 닫습니다. 전시 세 개가 동시에 열리며 여섯 주마다 바뀝니다. 시에서 운영비를 대기 때문에 입장은 무료입니다. 옛 승강장에 있는 작은 카페에서 음료와 간단한 음식을 팝니다. 어디서나 스케치를 해도 되지만 물감과 이젤은 안으로 들일 수 없습니다. 열 명 이상 학교 단체는 일주일 전에 예약해야 합니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 겨울 캠프를 고르시오.",
      lines: [
        ["M", "Dain, five winter camps are taking applications now."],
        ["W", "We've been talking about this since the summer."],
        ["M", "Then let's settle it today. How long can you go for?"],
        ["W", "Three nights at most. Four would clash with the family trip."],
        ["M", "Two of these run for five nights."],
        ["W", "Then they're out. What about the cost?"],
        ["M", "They range from a hundred and twenty thousand to two hundred."],
        ["W", "Under a hundred and eighty thousand, if we can."],
        ["M", "One of the three left is exactly two hundred."],
        ["W", "And I'd like one that includes an outdoor programme."],
        ["M", "One of the last two is all indoors."],
        ["W", "So there's only one camp for us."],
        ["M", "I'll send the forms tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Three nights at most. Four would clash with the family trip.",
      explanation:
        "3박 이하, 18만 원 미만, 야외 활동이 있는 캠프를 고른다. 세 조건을 모두 채우는 것은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Nights: 5 / Fee: 150,000 won / Outdoor: Yes" },
          { no: 2, label: "②", value: "Nights: 5 / Fee: 120,000 won / Outdoor: No" },
          { no: 3, label: "③", value: "Nights: 3 / Fee: 175,000 won / Outdoor: Yes" },
          { no: 4, label: "④", value: "Nights: 3 / Fee: 200,000 won / Outdoor: Yes" },
          { no: 5, label: "⑤", value: "Nights: 2 / Fee: 140,000 won / Outdoor: No" },
        ],
      },
      translation: [
        "M: 다인아, 겨울 캠프 다섯 개가 지금 신청을 받고 있어.",
        "W: 여름부터 이 얘기 했잖아.",
        "M: 그럼 오늘 정하자. 며칠까지 갈 수 있어?",
        "W: 많아야 3박. 4박이면 가족 여행이랑 겹쳐.",
        "M: 두 개는 5박이야.",
        "W: 그럼 빠지네. 비용은?",
        "M: 12만 원부터 20만 원까지 있어.",
        "W: 가능하면 18만 원 아래로.",
        "M: 남은 셋 중 하나는 딱 20만 원이야.",
        "W: 그리고 야외 활동이 있는 데가 좋아.",
        "M: 남은 둘 중 하나는 전부 실내야.",
        "W: 그럼 우리한테 맞는 건 하나뿐이네.",
        "M: 오늘 밤에 신청서 보낼게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangwoo, did you bring the club stamp?"],
        ["M", "It's in my locker, two floors down."],
        ["W", "We need it on the forms before four."],
        ["M", "I can get it during the next break."],
        ["W", "Would that leave us enough time?"],
      ],
      choices: [
        "The forms are already stamped.",
        "Yes, the break is at three twenty.",
        "I don't have a locker.",
        "We don't need the stamp.",
        "Four o'clock is too early.",
      ],
      answer: 2,
      clue: "Would that leave us enough time?",
      explanation:
        "시간이 충분한지 물었으므로, 쉬는 시간이 3시 20분이라 괜찮다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 상우야, 동아리 도장 가져왔어?",
        "M: 두 층 아래 내 사물함에 있어.",
        "W: 네 시 전에 신청서에 찍어야 해.",
        "M: 다음 쉬는 시간에 가져올 수 있어.",
        "W: 그러면 시간이 될까?",
        "M: 응, 쉬는 시간이 3시 20분이야.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yerin, are you going past the post office today?"],
        ["W", "On my way home, around five."],
        ["M", "Could you post this envelope for me?"],
        ["W", "Does it need a stamp first?"],
        ["M", "No, the stamp is already on it."],
      ],
      choices: [
        "I never go that way.",
        "All right, give it to me.",
        "You should buy a stamp.",
        "The post office is closed.",
        "I sent it yesterday.",
      ],
      answer: 2,
      clue: "No, the stamp is already on it.",
      explanation:
        "우표가 붙어 있다고 했으므로, 달라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 예린아, 오늘 우체국 지나가?",
        "W: 집에 가는 길에, 다섯 시쯤.",
        "M: 이 봉투 좀 부쳐 줄래?",
        "W: 우표 먼저 붙여야 해?",
        "M: 아니, 우표는 벌써 붙였어.",
        "W: 알겠어, 나한테 줘.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Suyeon, how is the peer tutoring going this term?"],
        ["W", "My student turns up, but he never asks a single question."],
        ["M", "Do you ask him whether he understands?"],
        ["W", "Every ten minutes, and he always says yes."],
        ["M", "Then the answer tells you nothing at all."],
        ["W", "I noticed that when he failed the same test twice."],
        ["M", "Nobody wants to say no to that question."],
        ["W", "So what should I ask him instead?"],
        ["M", "Ask him to explain the step back to you."],
        ["W", "That would show me exactly where it breaks."],
        ["M", "And he'll find it himself halfway through the sentence."],
      ],
      choices: [
        "He never comes to the session.",
        "I'll try that from tomorrow.",
        "Asking questions is useless.",
        "He understands everything.",
        "You should teach him instead.",
      ],
      answer: 2,
      clue: "Ask him to explain the step back to you.",
      explanation:
        "단계를 설명해 보게 하라는 조언이므로, 내일부터 해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수연아, 이번 학기 또래 도우미는 어때?",
        "W: 학생이 오기는 하는데 질문을 하나도 안 해.",
        "M: 이해했는지 물어봐?",
        "W: 10분마다. 늘 그렇다고 해.",
        "M: 그럼 그 대답은 아무것도 알려 주지 않아.",
        "W: 같은 시험을 두 번 틀렸을 때 알았어.",
        "M: 그 질문에 아니라고 말하고 싶은 사람은 없어.",
        "W: 그럼 대신 뭘 물어야 해?",
        "M: 그 단계를 너한테 설명해 보라고 해.",
        "W: 그러면 어디서 막히는지 정확히 보이겠다.",
        "M: 게다가 말하다가 자기가 먼저 찾아낼 거야.",
        "W: 내일부터 그렇게 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junho, you've been repairing bicycles at the community centre."],
        ["M", "Two Saturdays a month, since the spring."],
        ["W", "Where did you learn to do that?"],
        ["M", "From a retired mechanic who volunteers there."],
        ["W", "How many have you fixed so far?"],
        ["M", "About thirty, mostly brakes and chains."],
        ["W", "And the bicycles belong to whom?"],
        ["M", "People bring their own, and we charge nothing."],
        ["W", "That must save some families a lot."],
        ["M", "A new chain costs less than five thousand won."],
        ["W", "Could I come and watch one Saturday?"],
      ],
      choices: [
        "Sure, the next one is the twelfth.",
        "I stopped going in April.",
        "The centre has no bicycles.",
        "You can't repair anything.",
        "We charge for every repair.",
      ],
      answer: 1,
      clue: "Could I come and watch one Saturday?",
      explanation:
        "여자가 토요일에 보러 가도 되는지 물었으므로, 다음이 12일이라는 ①이 가장 자연스럽다.",
      translation: [
        "W: 준호야, 주민 센터에서 자전거를 고친다며.",
        "M: 봄부터 한 달에 두 번 토요일에.",
        "W: 그건 어디서 배웠어?",
        "M: 거기서 봉사하시는 은퇴한 정비사 아저씨한테.",
        "W: 지금까지 몇 대나 고쳤어?",
        "M: 서른 대쯤. 주로 브레이크랑 체인.",
        "W: 그 자전거는 누구 거야?",
        "M: 사람들이 자기 걸 가져와. 돈은 안 받아.",
        "W: 어떤 집들은 많이 아끼겠다.",
        "M: 새 체인이 5천 원도 안 해.",
        "W: 나도 토요일에 보러 가도 돼?",
        "M: 그럼, 다음이 12일이야.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Taemin이 Naeun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Taemin : ________________",
      lines: [
        [
          "M",
          "Taemin and Naeun are organising a fundraising concert for their club. " +
            "They have booked the hall and sold ninety tickets already. " +
            "Naeun has just written the poster, and it says the concert starts at six. " +
            "The hall, however, is only free from six thirty on that evening. " +
            "If the poster goes up as it is, ninety people will arrive to a locked door. " +
            "The printing shop has not started yet and can still change the file. " +
            "Taemin wants her to correct the time before it goes to print. " +
            "In this situation, what would Taemin most likely say to Naeun?",
        ],
      ],
      choices: [
        "Let's book a different hall tonight.",
        "The poster looks very good.",
        "Fix the time before it is printed.",
        "I'll open the hall at six myself.",
        "Ninety tickets is not enough.",
      ],
      answer: 3,
      clue: "Taemin wants her to correct the time before it goes to print.",
      explanation:
        "강당은 6시 30분부터 쓸 수 있으므로 인쇄 전에 시각을 고치자는 ③이 가장 적절하다.",
      translation: [
        "M: 태민이와 나은이는 동아리 모금 음악회를 준비하고 있습니다. 두 사람은 강당을 빌렸고 벌써 표 아흔 장을 팔았습니다. 나은이가 방금 포스터를 썼는데 음악회가 여섯 시에 시작한다고 적혀 있습니다. 그런데 그날 저녁 강당은 6시 30분부터만 쓸 수 있습니다. 포스터가 그대로 붙으면 아흔 명이 잠긴 문 앞에 서게 됩니다. 인쇄소는 아직 시작하지 않아 파일을 바꿀 수 있습니다. 태민이는 인쇄에 들어가기 전에 시각을 고치기를 바랍니다. 이런 상황에서 태민이가 나은이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to explain why a mirror seems to reverse left and right " +
            "but not up and down. " +
            "The honest answer is that it does neither. " +
            "A mirror reverses front and back, and nothing else. " +
            "Your reflected hand points towards you where your real hand points away. " +
            "We read that single change as a left and right swap " +
            "because of how we imagine getting into the mirror. " +
            "To face yourself, you picture turning around a vertical line, " +
            "and that imagined turn is what exchanges your two sides. " +
            "If you imagined turning head over heels instead, " +
            "the mirror would appear to have flipped you upside down " +
            "and left your left and right exactly where they were.",
        ],
      ],
      choices: [
        "how mirrors are made from glass and metal",
        "why a mirror seems to swap left and right",
        "how light bends when it enters water",
        "why some mirrors make things look larger",
        "how the eye judges distance in a reflection",
      ],
      answer: 2,
      clue: "A mirror reverses front and back, and nothing else.",
      explanation:
        "남자는 거울이 앞뒤만 뒤집는데 우리가 몸을 돌려 생각하기 때문에 좌우가 바뀐 것처럼 느낀다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 거울이 왜 좌우는 바꾸는 것 같은데 위아래는 그렇지 않은지 설명하려 합니다. 솔직한 답은 둘 다 바꾸지 않는다는 것입니다. 거울은 앞뒤를 뒤집을 뿐 그 밖에는 아무것도 바꾸지 않습니다. 실제 손은 앞을 가리키는데 비친 손은 여러분 쪽을 가리킵니다. 우리는 그 한 가지 변화를 좌우가 바뀐 것으로 읽습니다. 거울 속으로 들어가는 모습을 어떻게 상상하는지 때문입니다. 자기 자신과 마주 보려면 세로선을 축으로 돌아서는 모습을 그리게 되고, 그 상상 속의 회전이 두 옆면을 맞바꿉니다. 만약 앞으로 공중제비를 돌아 들어간다고 상상한다면, 거울은 여러분을 위아래로 뒤집고 좌우는 그대로 둔 것처럼 보일 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Today I want to explain why a mirror seems to reverse left and right."],
        ["M", "A mirror reverses front and back, and nothing else."],
        ["M", "Your reflected hand points towards you where your real hand points away."],
        ["M", "To face yourself, you picture turning around a vertical line."],
        ["M", "If you imagined turning head over heels, the mirror would appear to have flipped you upside down."],
      ],
      choices: [
        "a mirror reversing front and back",
        "a reflected hand pointing towards you",
        "imagining a turn around a vertical line",
        "imagining turning head over heels",
        "the thickness of the glass in a mirror",
      ],
      answer: 5,
      clue: "A mirror reverses front and back, and nothing else.",
      explanation:
        "앞뒤를 뒤집는 거울, 나를 가리키는 비친 손, 세로선을 축으로 한 회전, 공중제비 상상은 언급되지만 거울 유리의 두께는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
