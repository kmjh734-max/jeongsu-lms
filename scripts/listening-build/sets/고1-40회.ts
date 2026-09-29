/** 고1 듣기 40회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 40회",
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
          "Good afternoon, everyone. This is the librarian speaking. " +
            "I am calling for volunteers to help with the library move next month. " +
            "Our collection is going from the second floor to the new room on the ground floor, " +
            "and about eleven thousand books have to travel in the right order. " +
            "We will work in pairs, one packing and one labelling each box. " +
            "The work runs for three afternoons, from four until six. " +
            "You do not need to come on all three days, and one afternoon is a real help. " +
            "Write your name and the day you can come on the sheet at the front desk. " +
            "Books that arrive in order can be shelved in a day instead of a week. Thank you.",
        ],
      ],
      choices: [
        "도서관 이전 봉사자를 모으려고",
        "도서 반납을 독촉하려고",
        "새 책을 소개하려고",
        "독서 대회를 알리려고",
        "도서관 규칙을 안내하려고",
      ],
      answer: 1,
      clue: "I am calling for volunteers to help with the library move next month.",
      explanation:
        "남자는 도서관을 옮기는 일을 도울 자원봉사자를 모집한다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 사서 선생님입니다. 다음 달 도서관 이전을 도울 자원봉사자를 찾습니다. 우리 장서가 2층에서 1층 새 방으로 옮겨 가는데, 만천 권쯤 되는 책이 순서대로 옮겨져야 합니다. 두 사람씩 짝을 지어 한 명은 담고 한 명은 상자에 이름표를 붙입니다. 작업은 사흘 동안 오후 네 시부터 여섯 시까지 합니다. 사흘 다 나올 필요는 없고 하루만 와도 큰 도움이 됩니다. 접수대에 있는 종이에 이름과 올 수 있는 날을 적어 주세요. 순서대로 도착한 책은 일주일이 아니라 하루면 꽂을 수 있습니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Hyunjin, I've highlighted almost every line in this chapter."],
        ["W", "Then what does the highlighting tell you?"],
        ["M", "That the chapter is important, I suppose."],
        ["W", "A page of yellow says nothing. It's the same as a blank page."],
        ["M", "But I don't know what matters until the end."],
        ["W", "That's exactly why you should read it once with the pen down."],
        ["M", "And mark it on the second pass?"],
        ["W", "Two or three lines, no more, once you know the shape of it."],
        ["M", "Won't I forget the first reading by then?"],
        ["W", "You'll remember more, because you were reading instead of colouring."],
        ["M", "That does sound slower, though."],
        ["W", "One careful pass and one short mark beat three yellow pages."],
      ],
      choices: [
        "밑줄은 처음 읽을 때 그어야 한다",
        "먼저 읽고 두 번째에 조금만 표시해야 한다",
        "중요한 부분은 따로 옮겨 적어야 한다",
        "여러 색 펜을 써야 한다",
        "책은 소리 내어 읽어야 한다",
      ],
      answer: 2,
      clue: "Two or three lines, no more, once you know the shape of it.",
      explanation:
        "여자는 처음에는 펜을 놓고 읽고 두 번째에 두세 줄만 표시하라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 현진아, 이 단원에 거의 모든 줄에 형광펜을 그었어.",
        "W: 그러면 그 표시가 너한테 무엇을 알려 줘?",
        "M: 이 단원이 중요하다는 거겠지.",
        "W: 온통 노란 쪽은 아무 말도 안 해. 빈 쪽이랑 똑같아.",
        "M: 근데 끝까지 읽기 전엔 뭐가 중요한지 몰라.",
        "W: 바로 그래서 처음엔 펜을 놓고 읽어야 해.",
        "M: 그리고 두 번째에 표시하라고?",
        "W: 전체 모양을 알고 나서 두세 줄만.",
        "M: 그때쯤이면 처음 읽은 걸 잊지 않을까?",
        "W: 오히려 더 기억해. 색칠하지 않고 읽었으니까.",
        "M: 그래도 더 느리게 들리는데.",
        "W: 꼼꼼한 한 번과 짧은 표시가 노란 쪽 세 장보다 나아.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Most people apologise by explaining. " +
            "They say they were busy, or tired, or that the message never arrived. " +
            "Every one of those sentences moves the weight off the speaker " +
            "and puts it somewhere the other person cannot argue with. " +
            "A real apology has two short parts and no third. " +
            "Name what you did, and say what you will do differently. " +
            "The reason belongs in your own head, not in the apology. " +
            "The moment you explain, the person in front of you stops hearing sorry.",
        ],
      ],
      choices: [
        "사과는 빨리 해야 한다",
        "사과할 때는 이유를 설명하지 말아야 한다",
        "사과는 직접 만나서 해야 한다",
        "잘못은 기록해 두어야 한다",
        "사과를 받는 법도 배워야 한다",
      ],
      answer: 2,
      clue: "The reason belongs in your own head, not in the apology.",
      explanation:
        "남자는 이유를 대면 사과가 아니게 된다며 한 일과 앞으로 달리할 것만 말하라고 한다. 따라서 답은 ②이다.",
      translation: [
        "M: 대부분의 사람은 설명하면서 사과합니다. 바빴다고, 피곤했다고, 연락이 오지 않았다고 말합니다. 그런 문장은 하나같이 무게를 말하는 사람에게서 덜어 내어, 상대가 반박할 수 없는 곳에 놓아 둡니다. 진짜 사과에는 짧은 두 부분이 있고 세 번째는 없습니다. 자기가 한 일을 말하고, 앞으로 무엇을 달리하겠다고 말하는 것입니다. 이유는 사과가 아니라 자기 머릿속에 있어야 합니다. 설명을 시작하는 순간 앞에 있는 사람은 미안하다는 말을 더는 듣지 않습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Jiwoo, is this the new counselling room?"],
        ["M", "Yes, we moved in at the start of the term."],
        ["W", "A round table stands in the middle of the room."],
        ["M", "Four people can sit around it comfortably."],
        ["W", "There's a striped rug under the table."],
        ["M", "It hides the old marks on the floor."],
        ["W", "A bookshelf with two shelves stands on the left."],
        ["M", "It has three. The lowest one is behind the chair."],
        ["W", "A framed picture of a forest hangs on the back wall."],
        ["M", "Students say it makes the room feel wider."],
        ["W", "And a small clock sits on the desk in the right corner."],
        ["M", "We keep it there so nobody stares at the wall."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "It has three. The lowest one is behind the chair.",
      explanation:
        "여자가 책장이 두 칸이라고 하자 남자가 세 칸이라고 바로잡는다. 그림에는 두 칸이 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.45],
          [0.5, 0.82],
          [0.09, 0.42],
          [0.55, 0.1],
          [0.88, 0.55],
        ],
        scene:
          "A school counselling room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A ROUND TABLE stands in the MIDDLE of the room with chairs around it. " +
          "A STRIPED RUG lies on the floor underneath the round table. " +
          "A BOOKSHELF with EXACTLY TWO SHELVES stands against the LEFT wall, the two levels clearly drawn. " +
          "A FRAMED PICTURE OF A FOREST hangs on the BACK wall in the upper middle. " +
          "A SMALL DESK CLOCK sits on a small desk in the RIGHT corner of the room.",
      },
      translation: [
        "W: 지우야, 여기가 새 상담실이야?",
        "M: 응, 학기 시작할 때 옮겼어.",
        "W: 방 한가운데에 둥근 탁자가 있네.",
        "M: 네 명이 둘러앉기 편해.",
        "W: 탁자 아래에는 줄무늬 깔개가 있고.",
        "M: 바닥에 있던 오래된 자국을 가려 줘.",
        "W: 왼쪽에는 두 칸짜리 책장이 있네.",
        "M: 세 칸이야. 맨 아래 칸은 의자에 가려 있어.",
        "W: 뒷벽에는 숲 그림 액자가 걸려 있어.",
        "M: 학생들이 방이 넓어 보인대.",
        "W: 그리고 오른쪽 구석 책상 위에 작은 시계가 있네.",
        "M: 벽만 쳐다보지 않게 거기 두는 거야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, the English essay contest closes on Friday afternoon."],
        ["W", "Have all our club members finished writing their entries?"],
        ["M", "Seven of them have, and the other two are nearly there."],
        ["W", "That's better than I expected at this point."],
        ["M", "They started early because of the exam week."],
        ["W", "What about the cover page for each entry?"],
        ["M", "I made the template and shared it with everyone yesterday."],
        ["W", "Then everything seems to be in hand."],
        ["M", "Except the word counts. Three of the essays are over the limit."],
        ["W", "By how much are they over?"],
        ["M", "Between forty and ninety words each."],
        ["W", "They would be rejected without even being read."],
        ["M", "And the three writers still don't know about it."],
        ["W", "I'll tell those three students this afternoon."],
      ],
      choices: [
        "표지 서식을 만들기",
        "글을 대신 줄여 주기",
        "세 학생에게 알려 주기",
        "대회에 접수하기",
        "심사 기준을 확인하기",
      ],
      answer: 3,
      clue: "I'll tell those three students this afternoon.",
      explanation:
        "여자는 분량을 넘긴 세 학생에게 오늘 오후에 알려 주겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 서연아, 영어 에세이 대회가 금요일 오후에 마감이야.",
        "W: 우리 동아리 부원들은 작품을 다 썼어?",
        "M: 일곱 명은 끝냈고 나머지 두 명도 거의 다 했어.",
        "W: 이맘때치고는 생각보다 빠르네.",
        "M: 시험 주간 때문에 일찍 시작했거든.",
        "W: 각 작품 표지는?",
        "M: 어제 서식 만들어서 다 같이 쓰게 공유했어.",
        "W: 그럼 다 된 셈이네.",
        "M: 글자 수만 빼고. 세 편이 제한을 넘었어.",
        "W: 얼마나 넘었는데?",
        "M: 각각 마흔에서 아흔 자 정도.",
        "W: 읽어 보지도 않고 떨어뜨릴 텐데.",
        "M: 그런데 쓴 세 사람이 아직 몰라.",
        "W: 오늘 오후에 그 세 명한테 말할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Hello. Are you here to buy tickets for the concert?"],
        ["M", "Yes, four tickets for Saturday evening."],
        ["W", "The seats upstairs are fifteen dollars each."],
        ["M", "And how much are the ones on the ground floor?"],
        ["W", "Those are twenty-two dollars each."],
        ["M", "We'll take the upstairs seats, please."],
        ["W", "Would you like a programme book as well?"],
        ["M", "One book for the four of us."],
        ["W", "The programme book is six dollars."],
        ["M", "Is there a discount for school students?"],
        ["W", "Students pay ten percent less on the tickets."],
        ["M", "Here are our four student cards."],
      ],
      choices: ["$60", "$66", "$54", "$62", "$58"],
      answer: 1,
      clue: "The seats upstairs are fifteen dollars each.",
      explanation:
        "위층 좌석 네 장은 60달러이고 10퍼센트를 빼면 54달러이며, 안내 책자 6달러를 더하면 60달러이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 음악회 표 사러 오셨나요?",
        "M: 네, 토요일 저녁 표 네 장이요.",
        "W: 위층 좌석은 한 장에 15달러입니다.",
        "M: 1층 좌석은 얼마예요?",
        "W: 그쪽은 한 장에 22달러입니다.",
        "M: 위층 좌석으로 할게요.",
        "W: 안내 책자도 드릴까요?",
        "M: 넷이서 한 권만요.",
        "W: 안내 책자는 6달러입니다.",
        "M: 학생 할인이 있나요?",
        "W: 학생은 표값에서 10퍼센트를 덜 내십니다.",
        "M: 여기 학생증 네 장이요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 발표를 미룬 이유를 고르시오.",
      lines: [
        ["M", "Dain, you asked to present next week instead of today."],
        ["W", "I did, and the teacher allowed it without any trouble."],
        ["M", "Were the slides not finished in time?"],
        ["W", "They were done on Saturday, actually, all eighteen of them."],
        ["M", "Then did you feel too nervous to stand up today?"],
        ["W", "Not really. The survey results only arrive on Thursday."],
        ["M", "So half of your data is still missing."],
        ["W", "Exactly, and the talk makes no sense without the numbers."],
        ["M", "Who is collecting those results for you?"],
        ["W", "The three classes fill them in during homeroom."],
      ],
      choices: [
        "발표 자료를 못 만들어서",
        "긴장이 되어서",
        "설문 결과가 아직 안 나와서",
        "몸이 아파서",
        "다른 일정이 겹쳐서",
      ],
      answer: 3,
      clue: "Not really. The survey results only arrive on Thursday.",
      explanation:
        "여자는 설문 결과가 목요일에야 나와서 발표를 미뤘다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 다인아, 오늘 말고 다음 주에 발표하겠다고 했다며.",
        "W: 응, 선생님도 어렵지 않게 허락해 주셨어.",
        "M: 자료를 제때 못 끝냈어?",
        "W: 사실 토요일에 열여덟 장을 다 만들었어.",
        "M: 그럼 오늘 나서기가 너무 긴장돼서?",
        "W: 그건 아니야. 설문 결과가 목요일에야 나와.",
        "M: 그럼 자료 절반이 아직 없는 거네.",
        "W: 맞아. 숫자가 없으면 발표가 말이 안 돼.",
        "M: 그 결과는 누가 모아 주는데?",
        "W: 세 반이 조회 시간에 적어 줘.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 연극 공연에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Junseo, when is the drama club's play being performed this year?"],
        ["M", "On the twenty-second, at seven in the evening."],
        ["W", "That's a Thursday. Is there only one performance?"],
        ["M", "Only one this year, because of the exam schedule."],
        ["W", "Is it in the school hall as usual?"],
        ["M", "In the hall, yes, but with the new seating we bought."],
        ["W", "How long does the whole play run?"],
        ["M", "About ninety minutes, with one short break in the middle."],
        ["W", "Do we have to buy a ticket to get in?"],
        ["M", "Tickets are two thousand won, and all the money goes to charity."],
        ["W", "How many people can the hall hold altogether?"],
        ["M", "Two hundred and forty, and half of them are already booked."],
        ["W", "Then I'll reserve mine tonight before they run out."],
      ],
      choices: ["공연 날짜와 시각", "공연이 열리는 곳", "공연 시간의 길이", "표의 가격", "연극의 줄거리"],
      answer: 5,
      clue: "On the twenty-second, at seven in the evening.",
      explanation:
        "날짜와 시각, 장소, 공연 길이, 표값은 말했지만 줄거리는 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 준서야, 올해 연극 동아리 공연은 언제 해?",
        "M: 22일 저녁 일곱 시에.",
        "W: 목요일이네. 공연은 한 번뿐이야?",
        "M: 올해는 시험 일정 때문에 한 번만 해.",
        "W: 늘 하던 대로 학교 강당에서 해?",
        "M: 강당에서 해. 다만 새로 산 좌석을 놓았어.",
        "W: 공연은 얼마나 길어?",
        "M: 90분쯤. 중간에 짧게 한 번 쉬어.",
        "W: 들어가려면 표를 사야 해?",
        "M: 표는 2천 원이고 그 돈은 전부 기부해.",
        "W: 강당에는 모두 몇 명이나 들어가?",
        "M: 240명. 그중 절반이 벌써 예약됐어.",
        "W: 그럼 자리 떨어지기 전에 오늘 밤에 예약해야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Pine Valley Youth Camp에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Pine Valley Youth Camp, held every winter. " +
            "The camp lasts four days, from Monday morning until Thursday afternoon. " +
            "It takes place at the training centre at the foot of Pine Mountain. " +
            "Students sleep in rooms of six, and bedding is provided by the centre. " +
            "The programme includes hiking, cooking and a night walk with a guide. " +
            "Mobile phones are collected on the first evening and returned at the end. " +
            "The fee is a hundred thousand won, and all meals are included. " +
            "Students from any school may apply, but places are limited to sixty.",
        ],
      ],
      choices: [
        "월요일부터 목요일까지 진행된다",
        "소나무산 아래 연수원에서 열린다",
        "이불은 각자 가져가야 한다",
        "휴대폰은 첫날 저녁에 걷는다",
        "참가비에 식사가 포함된다",
      ],
      answer: 3,
      clue: "Students sleep in rooms of six, and bedding is provided by the centre.",
      explanation:
        "이불은 연수원에서 준다고 했으므로 ③이 일치하지 않는다.",
      translation: [
        "W: 해마다 겨울에 열리는 파인밸리 청소년 캠프에 대해 알려 드립니다. 캠프는 월요일 아침부터 목요일 오후까지 나흘 동안입니다. 소나무산 아래 연수원에서 진행합니다. 학생들은 여섯 명씩 한 방에서 자고 이불은 연수원에서 제공합니다. 프로그램에는 등산, 요리, 해설사와 함께하는 밤 산책이 있습니다. 휴대폰은 첫날 저녁에 걷고 마지막 날에 돌려줍니다. 참가비는 10만 원이고 모든 식사가 포함됩니다. 어느 학교 학생이든 신청할 수 있지만 정원은 예순 명입니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 선택할 온라인 강좌를 고르시오.",
      lines: [
        ["M", "Chaeyeon, five online courses open next week."],
        ["W", "I can give it about four hours a week, no more."],
        ["M", "Two of these ask for six or more."],
        ["W", "Then those are out for me."],
        ["M", "Do you want one with live classes or recorded ones?"],
        ["W", "Live, because I never watch the recordings."],
        ["M", "One of the three left is recorded only."],
        ["W", "And the fee has to stay under fifty thousand won."],
        ["M", "One of the last two is seventy thousand."],
        ["W", "So only one course fits everything."],
        ["M", "I'd register tonight, before it fills up."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "I can give it about four hours a week, no more.",
      explanation:
        "주당 4시간 이하, 실시간 수업, 5만 원 미만인 강좌를 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Hours a week: 6 / Class: Live / Fee: 40,000 won" },
          { no: 2, label: "②", value: "Hours a week: 8 / Class: Recorded / Fee: 30,000 won" },
          { no: 3, label: "③", value: "Hours a week: 3 / Class: Recorded / Fee: 35,000 won" },
          { no: 4, label: "④", value: "Hours a week: 4 / Class: Live / Fee: 48,000 won" },
          { no: 5, label: "⑤", value: "Hours a week: 4 / Class: Live / Fee: 70,000 won" },
        ],
      },
      translation: [
        "M: 채연아, 다음 주에 온라인 강좌 다섯 개가 열려.",
        "W: 나는 일주일에 네 시간쯤 쓸 수 있어. 더는 안 돼.",
        "M: 두 개는 여섯 시간 이상 필요해.",
        "W: 그럼 그건 빠지네.",
        "M: 실시간 수업이 좋아, 녹화가 좋아?",
        "W: 실시간. 녹화는 절대 안 보게 되더라.",
        "M: 남은 셋 중 하나는 녹화만 있어.",
        "W: 그리고 수강료는 5만 원 아래여야 해.",
        "M: 남은 둘 중 하나는 7만 원이야.",
        "W: 그럼 다 맞는 건 하나뿐이네.",
        "M: 자리 차기 전에 오늘 밤에 등록하는 게 좋겠어.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangwoo, did you book the room for the club meeting?"],
        ["M", "I asked yesterday, but the office was closed."],
        ["W", "The meeting is on Thursday afternoon."],
        ["M", "I can go there during the first break."],
        ["W", "Shall I write down the times we need?"],
      ],
      choices: [
        "The meeting was cancelled.",
        "Yes, please, that will be quicker.",
        "I don't need a room.",
        "The office never closes.",
        "You should book it yourself.",
      ],
      answer: 2,
      clue: "Shall I write down the times we need?",
      explanation:
        "필요한 시간을 적어 줄지 물었으므로, 그러면 더 빠르겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 상우야, 동아리 모임 방 예약했어?",
        "M: 어제 물어봤는데 행정실이 닫혀 있었어.",
        "W: 모임이 목요일 오후야.",
        "M: 1교시 쉬는 시간에 가 볼 수 있어.",
        "W: 필요한 시간을 내가 적어 줄까?",
        "M: 응, 부탁해. 그게 더 빠르겠다.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nayeon, are you going to the stationery shop today?"],
        ["W", "After school, around five o'clock."],
        ["M", "Our class needs two boxes of chalk."],
        ["W", "Did the teacher give you the money?"],
        ["M", "Not yet. Could you pay and I'll return it tomorrow?"],
      ],
      choices: [
        "I never go to that shop.",
        "Sure, I'll buy them for you.",
        "The shop has no chalk.",
        "You should ask the teacher.",
        "I paid you yesterday.",
      ],
      answer: 2,
      clue: "Not yet. Could you pay and I'll return it tomorrow?",
      explanation:
        "먼저 내 달라고 부탁했으므로, 사다 주겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나연아, 오늘 문구점 가?",
        "W: 방과 후, 다섯 시쯤에.",
        "M: 우리 반에 분필 두 통이 필요해.",
        "W: 선생님이 돈 주셨어?",
        "M: 아직. 네가 먼저 내 주면 내일 갚을게.",
        "W: 그래, 사다 줄게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Suyeon, you're still working on the same maths problem."],
        ["W", "Forty minutes on one question, and I'm nowhere."],
        ["M", "Have you tried anything new in those forty minutes?"],
        ["W", "The same three steps, over and over."],
        ["M", "Then it isn't forty minutes of work. It's one minute, forty times."],
        ["W", "That's an unpleasant way to put it."],
        ["M", "Get up and walk to the window for two minutes."],
        ["W", "Won't I lose everything I was holding in my head?"],
        ["M", "You'll lose the wrong path you were stuck on."],
        ["W", "And come back to it differently, you mean."],
        ["M", "Try it once, and read the question again from the start."],
      ],
      choices: [
        "I already solved the problem.",
        "All right, I'll take a short break.",
        "Walking never helps anyone.",
        "I don't have a maths problem.",
        "You should solve it for me.",
      ],
      answer: 2,
      clue: "Try it once, and read the question again from the start.",
      explanation:
        "잠시 일어났다가 문제를 다시 읽으라는 제안이므로, 잠깐 쉬겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수연아, 아직도 같은 수학 문제를 붙잡고 있네.",
        "W: 한 문제에 40분인데 아무 데도 못 갔어.",
        "M: 그 40분 동안 새로 해 본 건 있어?",
        "W: 같은 세 단계만 계속 되풀이했어.",
        "M: 그럼 40분 일한 게 아니야. 1분을 마흔 번 한 거지.",
        "W: 듣기 좋은 말은 아니네.",
        "M: 일어나서 2분만 창가까지 걸어 봐.",
        "W: 머릿속에 들고 있던 걸 다 잃지 않을까?",
        "M: 막혀 있던 잘못된 길을 잃는 거야.",
        "W: 그러고 다르게 다시 보라는 거구나.",
        "M: 한 번만 해 보고 문제를 처음부터 다시 읽어 봐.",
        "W: 알겠어, 잠깐 쉬었다 할게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Kiyoung, you've been cooking dinner at home on Fridays."],
        ["M", "Since the summer. My parents both work late that day."],
        ["W", "What do you usually make for everyone?"],
        ["M", "Something simple. Rice, soup and one main dish."],
        ["W", "Did you know how to cook before that?"],
        ["M", "Almost nothing. I burned the first three dinners."],
        ["W", "How did you learn in the end?"],
        ["M", "My grandmother wrote six recipes on cards for me."],
        ["W", "That sounds like a good place to start."],
        ["M", "It was, and I can cook all six without looking now."],
        ["W", "Could you copy one of those cards for me?"],
      ],
      choices: [
        "Of course, I'll bring it tomorrow.",
        "I lost all the cards.",
        "I don't cook at all.",
        "My grandmother can't write.",
        "You should buy dinner instead.",
      ],
      answer: 1,
      clue: "Could you copy one of those cards for me?",
      explanation:
        "여자가 요리 카드를 하나 베껴 달라고 했으므로, 내일 가져오겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 기영아, 금요일마다 집에서 저녁을 한다며.",
        "M: 여름부터. 그날은 부모님이 다 늦게 오셔.",
        "W: 보통 뭘 만들어?",
        "M: 간단한 거. 밥이랑 국이랑 반찬 하나.",
        "W: 그전에 요리할 줄 알았어?",
        "M: 거의 몰랐어. 처음 세 번은 태웠어.",
        "W: 결국 어떻게 배웠어?",
        "M: 할머니가 조리법 여섯 개를 카드에 적어 주셨어.",
        "W: 시작하기 좋았겠다.",
        "M: 그랬어. 지금은 여섯 개를 안 보고도 해.",
        "W: 그 카드 하나만 베껴 줄래?",
        "M: 그럼, 내일 가져올게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Minseo가 Hyunwoo에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Minseo : ________________",
      lines: [
        [
          "W",
          "Minseo and Hyunwoo are preparing a poster for the science fair together. " +
            "Hyunwoo has spent the last three evenings choosing the colours and the border. " +
            "He has redrawn the title in four different styles already. " +
            "The poster looks beautiful, but the results section is still completely empty. " +
            "All the measurements are written in their notebook, waiting to be copied across. " +
            "The fair opens the day after tomorrow and the judges read the results first. " +
            "Minseo thinks the numbers must go on before any more decoration. " +
            "She wants to ask him to fill in the results section tonight. " +
            "In this situation, what would Minseo most likely say to Hyunwoo?",
        ],
      ],
      choices: [
        "The colours look completely wrong.",
        "Let's enter the fair next year instead.",
        "Put the results in before decorating more.",
        "I'll choose a new border for you.",
        "We should make two posters.",
      ],
      answer: 3,
      clue: "She wants to ask him to fill in the results section tonight.",
      explanation:
        "꾸미기보다 결과를 먼저 채워야 하므로 ③이 가장 적절하다.",
      translation: [
        "W: 민서와 현우는 과학전에 낼 포스터를 함께 준비하고 있습니다. 현우는 지난 사흘 저녁을 색과 테두리를 고르는 데 썼습니다. 제목도 벌써 네 가지 모양으로 다시 그렸습니다. 포스터는 보기 좋지만 결과를 적는 칸은 아직 완전히 비어 있습니다. 측정한 값은 모두 공책에 적혀 옮겨 적히기만 기다리고 있습니다. 전시는 모레 열리고 심사위원은 결과부터 읽습니다. 민서는 더 꾸미기 전에 숫자부터 넣어야 한다고 생각합니다. 민서는 오늘 밤에 결과 칸을 채워 달라고 말하고 싶습니다. 이런 상황에서 민서가 현우에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why we yawn when we see someone else yawn. " +
            "A yawn passes from person to person more reliably than almost any other movement. " +
            "Seeing one, hearing one, even reading the word is often enough. " +
            "The effect is strongest between people who know each other well, " +
            "weaker between strangers, and weakest of all when the other face is unfamiliar. " +
            "That pattern is the clue. A contagious yawn is not about tiredness at all. " +
            "It belongs to the same family of responses as copying a smile or a posture, " +
            "the quiet machinery that keeps a group in step without a word being spoken. " +
            "Children under about four rarely catch yawns, " +
            "which fits the age at which reading other people begins in earnest.",
        ],
      ],
      choices: [
        "how much sleep a teenager needs",
        "why yawning spreads from person to person",
        "how the lungs take in oxygen",
        "why people smile when they are nervous",
        "how children learn to speak in groups",
      ],
      answer: 2,
      clue: "A contagious yawn is not about tiredness at all.",
      explanation:
        "여자는 하품이 옮는 현상이 피곤함이 아니라 상대를 따라 하는 반응이라고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 남이 하품하는 것을 보면 왜 우리도 하품하는지 이야기하려 합니다. 하품은 거의 어떤 동작보다도 사람에서 사람으로 잘 옮아갑니다. 보는 것, 듣는 것, 심지어 그 낱말을 읽는 것만으로도 충분할 때가 많습니다. 이 효과는 서로 잘 아는 사이에서 가장 강하고, 모르는 사이에서는 약하며, 낯선 얼굴일수록 가장 약합니다. 그 흐름이 실마리입니다. 옮는 하품은 피곤함과는 아무 상관이 없습니다. 그것은 미소나 자세를 따라 하는 것과 같은 갈래의 반응으로, 말 한마디 없이 무리의 발을 맞추는 조용한 장치입니다. 네 살 아래 아이들은 하품이 잘 옮지 않는데, 이는 남을 읽기 시작하는 나이와 들어맞습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to talk about why we yawn when we see someone else yawn."],
        ["W", "Seeing one, hearing one, even reading the word is often enough."],
        ["W", "The effect is strongest between people who know each other well."],
        ["W", "It belongs to the same family of responses as copying a smile or a posture."],
        ["W", "Children under about four rarely catch yawns."],
      ],
      choices: [
        "reading the word being enough to start a yawn",
        "the effect being strongest between close people",
        "copying a smile or a posture",
        "young children rarely catching yawns",
        "the average length of a single yawn",
      ],
      answer: 5,
      clue: "Seeing one, hearing one, even reading the word is often enough.",
      explanation:
        "낱말을 읽는 것만으로도 옮는다는 것, 가까운 사이에서 가장 강하다는 것, 미소나 자세를 따라 하는 것, 어린아이는 잘 옮지 않는다는 것은 언급되지만 하품 한 번의 평균 길이는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
