/** 고3 듣기 37회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 37회",
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
          "Good morning, students. This is Mr. Wi from the third year office. " +
            "I am speaking about the practice interviews we hold in November. " +
            "Twenty former students of this school have agreed to come back " +
            "and sit on the other side of the desk for an afternoon. " +
            "They are at university now, and most of them were interviewed last winter. " +
            "Each of you may book one twenty minute session. " +
            "The list goes up on Friday and it fills within a day, " +
            "so decide this week whether you want a place. " +
            "Nothing you say in those rooms is recorded or reported. Thank you.",
        ],
      ],
      choices: [
        "모의 면접 신청을 안내하려고",
        "졸업생 초청 강연을 알리려고",
        "원서 접수 일정을 알리려고",
        "상담실 이전을 알리려고",
        "면접 복장을 안내하려고",
      ],
      answer: 1,
      clue: "Each of you may book one twenty minute session.",
      explanation:
        "남자는 11월에 있을 모의 면접과 그 신청 방법을 안내한다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 3학년 교무실 위 선생님입니다. 11월에 하는 모의 면접에 대해 말씀드립니다. 우리 학교를 졸업한 스무 명이 다시 와서 한나절 동안 책상 반대편에 앉아 주기로 했습니다. 지금은 대학생이고 대부분 지난겨울에 면접을 봤습니다. 여러분은 각자 20분짜리 한 번을 예약할 수 있습니다. 명단은 금요일에 붙고 하루면 다 차니, 자리를 원하는지 이번 주에 정하세요. 그 방에서 한 말은 녹음되지도, 어디에 전해지지도 않습니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaeyeon, I've been studying in a different place every day."],
        ["W", "Library, café, home, all in one week?"],
        ["M", "And two classrooms as well. I get bored otherwise."],
        ["W", "How long does it take you to start in each new place?"],
        ["M", "Fifteen minutes, perhaps twenty in the café."],
        ["W", "That's an hour and a half a week spent settling in."],
        ["M", "But the same desk makes me restless by Wednesday."],
        ["W", "Then keep one desk and change what you do at it."],
        ["M", "Change the subject rather than the room?"],
        ["W", "Or the task. Reading, then problems, then writing."],
        ["M", "So the variety is in the work, not the walls."],
        ["W", "The walls should be boring enough to disappear."],
      ],
      choices: [
        "공부 장소를 자주 바꿔야 한다",
        "장소는 고정하고 하는 일을 바꿔야 한다",
        "카페에서 공부하면 안 된다",
        "공부 시간을 늘려야 한다",
        "친구와 장소를 정해야 한다",
      ],
      answer: 2,
      clue: "Then keep one desk and change what you do at it.",
      explanation:
        "여자는 장소를 옮기며 시간을 버리지 말고 한 자리에서 하는 일을 바꾸라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 채연아, 나는 날마다 다른 데서 공부해.",
        "W: 도서관, 카페, 집, 한 주에 다?",
        "M: 교실 두 곳도. 안 그러면 지루해.",
        "W: 새 장소마다 시작하는 데 얼마나 걸려?",
        "M: 15분. 카페에서는 20분쯤.",
        "W: 그럼 한 주에 한 시간 반을 자리 잡는 데 쓰는 거야.",
        "M: 그래도 같은 책상은 수요일이면 좀이 쑤셔.",
        "W: 그럼 책상은 그대로 두고 거기서 하는 일을 바꿔.",
        "M: 방 대신 과목을 바꾸라고?",
        "W: 아니면 하는 일을. 읽기, 그다음 문제, 그다음 쓰기.",
        "M: 그러니까 변화가 벽이 아니라 일에 있어야 한다는 거네.",
        "W: 벽은 눈에 안 들어올 만큼 지루해야 해.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Every year students ask how to stop being nervous in an examination. " +
            "The honest answer is that you cannot, and that you do not need to. " +
            "Nerves are not the enemy of performance. Surprise is. " +
            "A racing heart in a room you have never sat in, " +
            "with a clock you have never used and a paper you have never timed, " +
            "is four unfamiliar things at once. " +
            "Remove three of them in advance and the fourth is manageable. " +
            "You are not trying to feel calm. You are trying to feel nothing new.",
        ],
      ],
      choices: [
        "긴장을 없애야 한다",
        "시험 전날 푹 자야 한다",
        "문제를 많이 풀어야 한다",
        "친구와 시험을 준비해야 한다",
        "낯선 조건을 미리 없애야 한다",
      ],
      answer: 5,
      clue: "Remove three of them in advance and the fourth is manageable.",
      explanation:
        "남자는 긴장 자체가 아니라 낯섦이 문제라며 낯선 조건을 미리 줄이라고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 해마다 학생들은 시험에서 긴장하지 않는 법을 묻습니다. 솔직한 답은 그럴 수 없고 그럴 필요도 없다는 것입니다. 긴장은 실력의 적이 아닙니다. 적은 낯섦입니다. 한 번도 앉아 본 적 없는 방에서, 써 본 적 없는 시계와 시간을 재 본 적 없는 시험지 앞에서 뛰는 심장은 낯선 것 네 가지가 한꺼번에 있는 것입니다. 그중 셋을 미리 없애면 나머지 하나는 감당할 만해집니다. 우리가 하려는 일은 차분해지는 것이 아닙니다. 새로운 것을 하나도 느끼지 않는 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Sangwoo, is this the room where the interviews will be held?"],
        ["M", "Yes, they showed it to us this morning."],
        ["W", "A single desk stands in the middle of the room."],
        ["M", "The candidate sits on this side of it."],
        ["W", "There are two chairs behind the desk."],
        ["M", "Three, actually. A third interviewer joins in the afternoon."],
        ["W", "A tall plant stands in the left corner."],
        ["M", "It has been there longer than any of the teachers."],
        ["W", "A round wall clock hangs above the door."],
        ["M", "They turn it to face the interviewers, not the candidate."],
        ["W", "And a wide window fills the right wall."],
        ["M", "The blind stays down so nobody watches from outside."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "Three, actually. A third interviewer joins in the afternoon.",
      explanation:
        "여자가 의자가 두 개라고 하자 남자가 세 개라고 바로잡는다. 그림에는 두 개가 그려져 있으므로 답은 ②이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.45, 0.62],
          [0.45, 0.34],
          [0.08, 0.4],
          [0.6, 0.07],
          [0.89, 0.42],
        ],
        scene:
          "A school interview room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A SINGLE DESK stands in the MIDDLE of the room, seen from the front. " +
          "EXACTLY TWO CHAIRS stand side by side BEHIND the desk, facing the viewer, " +
          "clearly separated with a gap between them so both can be counted. " +
          "A TALL POTTED PLANT stands in the LEFT corner. " +
          "A ROUND WALL CLOCK hangs on the BACK wall above a door. " +
          "A WIDE WINDOW with a lowered blind fills the RIGHT wall.",
      },
      translation: [
        "W: 상우야, 여기가 면접을 보는 방이야?",
        "M: 응, 오늘 아침에 보여 줬어.",
        "W: 방 한가운데에 책상이 하나 있네.",
        "M: 지원자는 이쪽에 앉아.",
        "W: 책상 뒤에는 의자가 두 개 있고.",
        "M: 사실 세 개야. 오후에는 면접관이 한 분 더 들어와.",
        "W: 왼쪽 구석에는 키 큰 화분이 있네.",
        "M: 선생님들보다 오래 저기 있었어.",
        "W: 문 위에는 둥근 벽시계가 걸려 있어.",
        "M: 지원자가 아니라 면접관 쪽을 보게 돌려 놔.",
        "W: 그리고 오른쪽 벽은 넓은 창문이 차지하고 있네.",
        "M: 밖에서 못 보게 가리개를 내려 둬.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junho, the mock interview day is on Tuesday."],
        ["M", "Have the twenty graduates confirmed?"],
        ["W", "Nineteen so far, and the last one answered this morning."],
        ["M", "What about the rooms?"],
        ["W", "Ten rooms booked, two sessions in each."],
        ["M", "Then the main pieces are ready."],
        ["W", "Except the timetable. Nobody has matched students to rooms."],
        ["M", "How many students booked a place?"],
        ["W", "A hundred and twelve, which is more than we expected."],
        ["M", "And they all need a room and a time."],
        ["W", "Before Monday, so it can go on the board."],
        ["M", "I'll make the interview timetable this evening."],
      ],
      choices: [
        "졸업생에게 연락하기",
        "교실을 예약하기",
        "면접 시간표를 만들기",
        "게시판을 정리하기",
        "학생들을 모으기",
      ],
      answer: 3,
      clue: "I'll make the interview timetable this evening.",
      explanation:
        "남자는 오늘 저녁에 면접 시간표를 만들겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 준호야, 모의 면접일이 화요일이야.",
        "M: 졸업생 스무 분 다 확정됐어?",
        "W: 지금까지 열아홉 분. 마지막 분이 오늘 아침에 답 주셨어.",
        "M: 교실은?",
        "W: 열 곳 예약했고 한 곳에 두 번씩 해.",
        "M: 그럼 큰 건 다 됐네.",
        "W: 시간표만 빼고. 학생과 교실을 아무도 안 맞췄어.",
        "M: 신청한 학생이 몇 명이야?",
        "W: 백열두 명. 생각보다 많아.",
        "M: 다들 교실과 시간이 있어야 하지.",
        "W: 월요일 전에. 그래야 게시판에 붙여.",
        "M: 오늘 저녁에 면접 시간표 만들게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Good afternoon. Are you here about the name cards?"],
        ["W", "Yes, we need some for the mock interview day next week."],
        ["M", "When exactly do you need them by?"],
        ["W", "Monday afternoon, if that is possible."],
        ["M", "That is no trouble for an order of this size."],
        ["W", "That's a relief. We left it rather late."],
        ["M", "How many cards do you need?"],
        ["W", "Forty, one for each interviewer and helper."],
        ["M", "A printed card is two dollars each."],
        ["W", "Forty of those, please."],
        ["M", "Would you like the plastic holders as well?"],
        ["W", "How much is a holder?"],
        ["M", "One dollar fifty each, and they can be reused."],
        ["W", "Take forty holders, then."],
        ["M", "And school orders over a hundred dollars get ten percent off."],
        ["W", "Here is the school card, then."],
      ],
      choices: ["$126", "$140", "$130", "$120", "$145"],
      answer: 1,
      clue: "A printed card is two dollars each.",
      explanation:
        "이름표 마흔 장 80달러와 걸이 마흔 개 60달러를 더하면 140달러이고, 10퍼센트를 빼면 126달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요. 이름표 때문에 오셨나요?",
        "W: 네, 다음 주 모의 면접일에 쓸 게 필요해요.",
        "M: 언제까지 필요하신가요?",
        "W: 가능하다면 월요일 오후까지요.",
        "M: 이 정도 수량이면 어렵지 않습니다.",
        "W: 다행이네요. 좀 늦게 왔거든요.",
        "M: 몇 장 필요하신가요?",
        "W: 마흔 장이요. 면접관과 도우미 한 사람에 하나씩.",
        "M: 인쇄한 이름표는 한 장에 2달러입니다.",
        "W: 마흔 장 주세요.",
        "M: 비닐 걸이도 하시겠어요?",
        "W: 걸이는 얼마예요?",
        "M: 하나에 1달러 50센트이고 다시 쓸 수 있습니다.",
        "W: 그럼 마흔 개 주세요.",
        "M: 그리고 100달러가 넘는 학교 주문은 10퍼센트 할인됩니다.",
        "W: 그럼 여기 학교 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 도서관 대신 교실에서 공부하는 이유를 고르시오.",
      lines: [
        ["M", "Hayoon, you've been in the classroom every evening."],
        ["M", "You always used to go to the library."],
        ["W", "I did, until the first week of this month."],
        ["M", "Did you lose your library card?"],
        ["W", "It's in my bag, and I still borrow books."],
        ["M", "Then is the library too crowded now?"],
        ["W", "No, my subject books are all too heavy to carry."],
        ["M", "How many are you using at the moment?"],
        ["W", "Six, and three of them are a kilogram each."],
        ["M", "So you keep them in your desk instead."],
      ],
      choices: [
        "도서관 카드를 잃어버려서",
        "도서관이 붐벼서",
        "책이 무거워 들고 다니기 어려워서",
        "교실이 더 조용해서",
        "친구와 함께 공부하려고",
      ],
      answer: 3,
      clue: "No, my subject books are all too heavy to carry.",
      explanation:
        "여자는 과목 책이 무거워 들고 다니기 어려워 교실에서 공부한다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 하윤아, 저녁마다 교실에 있더라.",
        "M: 예전엔 늘 도서관에 갔잖아.",
        "W: 이번 달 첫 주까지는 그랬어.",
        "M: 도서관 카드 잃어버렸어?",
        "W: 가방에 있어. 책도 계속 빌려.",
        "M: 그럼 도서관이 너무 붐벼?",
        "W: 아니, 과목 책이 다 너무 무거워서 못 들고 다녀.",
        "M: 지금 몇 권을 쓰는데?",
        "W: 여섯 권. 그중 세 권은 한 권에 1킬로그램이야.",
        "M: 그래서 책상에 넣어 두는구나.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 졸업 여행에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Naeun, are you going on the graduation trip?"],
        ["W", "I put my name down, but I don't know the details."],
        ["M", "It's three days, from the second to the fourth of February."],
        ["W", "Where does it go?"],
        ["M", "To the east coast, about three hours by bus."],
        ["W", "Where do we stay at night?"],
        ["M", "A youth centre near the harbour, six to a room."],
        ["W", "How much does it cost altogether?"],
        ["M", "A hundred and sixty thousand won, meals included."],
        ["W", "Do we need to bring anything special?"],
        ["M", "A warm coat, because the second day is mostly outdoors."],
      ],
      choices: ["여행 기간", "가는 곳", "묵는 곳", "여행 비용", "출발하는 시각"],
      answer: 5,
      clue: "It's three days, from the second to the fourth of February.",
      explanation:
        "기간, 장소, 숙소, 비용은 말했지만 출발 시각은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 나은아, 졸업 여행 갈 거야?",
        "W: 이름은 적었는데 자세한 건 몰라.",
        "M: 2월 2일부터 4일까지 사흘이야.",
        "W: 어디로 가?",
        "M: 동해안. 버스로 세 시간쯤.",
        "W: 밤에는 어디서 자?",
        "M: 항구 근처 청소년 수련원. 한 방에 여섯 명.",
        "W: 다 해서 얼마야?",
        "M: 16만 원. 식사 포함이야.",
        "W: 따로 가져갈 게 있어?",
        "M: 따뜻한 외투. 둘째 날은 거의 야외야.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Baram Language Exchange Club에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Baram Language Exchange Club, which began last year. " +
            "The club meets every Saturday afternoon at the district youth centre. " +
            "Each meeting lasts two hours, with a break of fifteen minutes. " +
            "Members are paired with a partner who is learning Korean. " +
            "You speak English for the first hour and Korean for the second. " +
            "Membership is free, but you must attend at least twice a month. " +
            "New members are accepted in March and September only. " +
            "Anyone over fifteen may join, and no test is required.",
        ],
      ],
      choices: [
        "토요일 오후마다 모인다",
        "한 번에 두 시간씩 한다",
        "한국어를 배우는 짝과 함께한다",
        "회비를 내야 한다",
        "3월과 9월에만 새 회원을 받는다",
      ],
      answer: 4,
      clue: "Membership is free, but you must attend at least twice a month.",
      explanation:
        "회비는 없다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 지난해에 시작한 바람 언어 교환 모임에 대해 알려 드립니다. 모임은 토요일 오후마다 구 청소년 센터에서 열립니다. 한 번에 두 시간이고 중간에 15분을 쉽니다. 회원은 한국어를 배우는 짝과 함께합니다. 앞 한 시간은 영어로, 뒤 한 시간은 한국어로 이야기합니다. 회비는 없지만 한 달에 두 번 이상 나와야 합니다. 새 회원은 3월과 9월에만 받습니다. 열다섯 살이 넘으면 누구나 들어올 수 있고 시험은 없습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 겨울 특강을 고르시오.",
      lines: [
        ["W", "Dohyun, five winter courses are taking applications."],
        ["M", "We said we'd choose before the exam."],
        ["W", "Then let's do it now. When can you start?"],
        ["M", "Not before the twentieth of December."],
        ["W", "Two of these begin on the fifteenth."],
        ["M", "Then they're out. How long does each one run?"],
        ["W", "Two weeks or four."],
        ["M", "Four weeks would eat the whole holiday."],
        ["W", "One of the three left is four weeks."],
        ["M", "And the fee should stay under a hundred thousand won."],
        ["W", "One of the last two is a hundred and thirty."],
        ["M", "So there's only one course for us."],
        ["W", "I'll register us both tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Not before the twentieth of December.",
      explanation:
        "12월 20일 이후 시작, 2주 과정, 10만 원 미만인 강좌를 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Starts: Dec 15 / Weeks: 2 / Fee: 80,000 won" },
          { no: 2, label: "②", value: "Starts: Dec 15 / Weeks: 4 / Fee: 90,000 won" },
          { no: 3, label: "③", value: "Starts: Dec 22 / Weeks: 4 / Fee: 70,000 won" },
          { no: 4, label: "④", value: "Starts: Dec 26 / Weeks: 2 / Fee: 95,000 won" },
          { no: 5, label: "⑤", value: "Starts: Dec 28 / Weeks: 2 / Fee: 130,000 won" },
        ],
      },
      translation: [
        "W: 도현아, 겨울 특강 다섯 개가 신청을 받고 있어.",
        "M: 시험 전에 고르기로 했잖아.",
        "W: 그럼 지금 하자. 언제부터 할 수 있어?",
        "M: 12월 20일 전에는 안 돼.",
        "W: 두 개는 15일에 시작해.",
        "M: 그럼 빠지네. 각각 얼마나 해?",
        "W: 2주 아니면 4주.",
        "M: 4주면 방학을 통째로 먹어.",
        "W: 남은 셋 중 하나가 4주야.",
        "M: 그리고 수강료는 10만 원 아래여야 해.",
        "W: 남은 둘 중 하나는 13만 원이야.",
        "M: 그럼 우리한테 맞는 건 하나뿐이네.",
        "W: 오늘 밤에 둘 다 등록할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, did you sign up for the mock interview?"],
        ["M", "Not yet. The list went up only this morning."],
        ["W", "Half the slots were gone by lunch."],
        ["M", "Where exactly is the list?"],
        ["W", "On the wall outside the third year office."],
      ],
      choices: [
        "I don't want an interview.",
        "The office is closed today.",
        "You should sign up first.",
        "Then I'll go there right now.",
        "There is no list this year.",
      ],
      answer: 4,
      clue: "On the wall outside the third year office.",
      explanation:
        "명단이 어디 있는지 알려 주었으므로, 지금 가겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 태민아, 모의 면접 신청했어?",
        "M: 아직. 명단이 오늘 아침에야 붙었어.",
        "W: 점심때 절반이 찼어.",
        "M: 명단이 정확히 어디 있어?",
        "W: 3학년 교무실 밖 벽에.",
        "M: 그럼 지금 바로 갈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyun, are you coming to the study room tonight?"],
        ["W", "From about seven, after I eat at home."],
        ["M", "Could you bring the physics summary you made?"],
        ["W", "The one with the diagrams?"],
        ["M", "That one. I only saw it for a minute."],
      ],
      choices: [
        "I never made a summary.",
        "Sure, I'll put it in my bag.",
        "You should draw your own.",
        "The study room is closed.",
        "I'm not coming tonight.",
      ],
      answer: 2,
      clue: "That one. I only saw it for a minute.",
      explanation:
        "그 요약을 가져다 달라고 했으므로, 가방에 넣어 가겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 서윤아, 오늘 밤에 자습실 와?",
        "W: 집에서 밥 먹고 일곱 시쯤부터.",
        "M: 네가 만든 물리 요약 좀 가져올래?",
        "W: 그림 그려 놓은 거?",
        "M: 그거. 1분밖에 못 봤어.",
        "W: 그래, 가방에 넣어 갈게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Kiyoung, how is the interview preparation going?"],
        ["M", "I've written answers to forty possible questions."],
        ["W", "Have you said any of them out loud?"],
        ["M", "Not yet. I've been polishing the writing."],
        ["W", "Then you've prepared forty essays, not forty answers."],
        ["M", "They're the same words either way."],
        ["W", "Written words are longer and more careful than spoken ones."],
        ["M", "So they would sound rehearsed in the room."],
        ["W", "And you would run out of breath halfway through."],
        ["M", "What should I do with the forty pages, then?"],
        ["W", "Say each one aloud once and keep only what survives."],
      ],
      choices: [
        "I have no answers written.",
        "That's a hard test, but I'll do it.",
        "Writing is always better.",
        "The interview is cancelled.",
        "You should answer for me.",
      ],
      answer: 2,
      clue: "Say each one aloud once and keep only what survives.",
      explanation:
        "소리 내어 말해 보고 남는 것만 남기라는 조언이므로, 해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 기영아, 면접 준비는 어때?",
        "M: 예상 질문 마흔 개에 답을 다 써 놨어.",
        "W: 그중 하나라도 소리 내어 말해 봤어?",
        "M: 아직. 글을 다듬고 있었어.",
        "W: 그럼 답 마흔 개가 아니라 글 마흔 편을 준비한 거야.",
        "M: 어차피 같은 말이잖아.",
        "W: 쓴 말은 말한 말보다 길고 조심스러워.",
        "M: 그럼 방에서 외운 것처럼 들리겠네.",
        "W: 게다가 중간에 숨이 찰 거야.",
        "M: 그럼 그 마흔 쪽을 어떻게 해?",
        "W: 하나씩 소리 내어 말해 보고 살아남는 것만 남겨.",
        "M: 힘든 시험이지만 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaewon, you've been keeping a one line diary all year."],
        ["W", "One sentence a night, since the second of January."],
        ["M", "Only one? That seems too little to be worth it."],
        ["W", "One is short enough that I have never missed a night."],
        ["M", "What do you write about?"],
        ["W", "Whatever I would have forgotten by Friday."],
        ["M", "Do you read the old ones?"],
        ["W", "On the first of every month, the whole month before."],
        ["M", "And what does that give you?"],
        ["W", "Proof that a terrible week was four bad days and three good ones."],
        ["M", "Could you show me one month of it?"],
      ],
      choices: [
        "Sure, I'll bring it tomorrow.",
        "I stopped writing in June.",
        "I don't keep a diary.",
        "You should write ten lines.",
        "The diary is not mine.",
      ],
      answer: 1,
      clue: "Could you show me one month of it?",
      explanation:
        "남자가 한 달 치를 보여 달라고 했으므로, 내일 가져오겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 채원아, 한 해 내내 한 줄 일기를 쓴다며.",
        "W: 1월 2일부터 밤마다 한 문장씩.",
        "M: 한 문장만? 그걸로 될까?",
        "W: 짧으니까 하루도 빠뜨린 적이 없어.",
        "M: 뭘 써?",
        "W: 금요일이면 잊어버렸을 것들.",
        "M: 예전 것도 읽어?",
        "W: 매달 1일에 지난 한 달 치를 다 읽어.",
        "M: 그러면 뭘 얻는데?",
        "W: 끔찍했던 한 주가 나쁜 나흘과 좋은 사흘이었다는 증거.",
        "M: 한 달 치만 보여 줄래?",
        "W: 그럼, 내일 가져올게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Hyerin이 Junseo에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Hyerin : ________________",
      lines: [
        [
          "W",
          "Hyerin and Junseo are preparing the notice for the mock interview day. " +
            "A hundred and twelve students have booked a session. " +
            "Junseo has written the notice with every student's full name on it. " +
            "Hyerin knows the notice will hang in the main corridor all week. " +
            "Anyone walking past would see who is applying to which university. " +
            "Candidate numbers would carry exactly the same information to each student. " +
            "She wants him to replace the names with numbers before it goes up. " +
            "In this situation, what would Hyerin most likely say to Junseo?",
        ],
      ],
      choices: [
        "Let's put the notice in the office instead.",
        "We should cancel the interview day.",
        "Use candidate numbers, not full names.",
        "I'll write the notice again myself.",
        "A hundred students is far too many.",
      ],
      answer: 3,
      clue: "She wants him to replace the names with numbers before it goes up.",
      explanation:
        "복도에 붙는 안내문이므로 이름 대신 수험 번호를 쓰자는 ③이 가장 적절하다.",
      translation: [
        "W: 혜린이와 준서는 모의 면접일 안내문을 준비하고 있습니다. 백열두 명이 면접을 신청했습니다. 준서는 학생들의 이름을 모두 적어 안내문을 썼습니다. 혜린이는 그 안내문이 한 주 내내 중앙 복도에 걸린다는 것을 압니다. 지나가는 사람은 누가 어느 대학에 지원하는지 보게 됩니다. 수험 번호를 쓰면 학생들에게는 똑같은 정보가 전해집니다. 혜린이는 붙이기 전에 이름을 번호로 바꾸기를 바랍니다. 이런 상황에서 혜린이가 준서에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to explain why we cannot tickle ourselves. " +
            "Every time you move, the brain sends the instruction to your hand " +
            "and at the same moment makes a prediction of what that hand will feel. " +
            "When the real sensation arrives and matches the prediction exactly, " +
            "the response is turned down before it reaches awareness. " +
            "This is not a curiosity. It is how you can tell " +
            "the touch of your own sleeve from the touch of another person. " +
            "A tickle depends on surprise, and your own hand can never surprise you. " +
            "Experiments with a small delay built into the movement " +
            "restore the feeling almost completely.",
        ],
      ],
      choices: [
        "how nerves carry signals to the brain",
        "why we cannot tickle ourselves",
        "how laughter affects the body",
        "why some people are more sensitive to touch",
        "how the brain controls balance",
      ],
      answer: 2,
      clue: "A tickle depends on surprise, and your own hand can never surprise you.",
      explanation:
        "여자는 뇌가 자기 손의 감각을 예측해 반응을 줄이기 때문에 스스로 간지럼을 못 태운다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 우리가 왜 스스로를 간지럽힐 수 없는지 설명하려 합니다. 움직일 때마다 뇌는 손에 명령을 보내고 그와 동시에 그 손이 무엇을 느낄지 예측을 만듭니다. 실제 감각이 도착해 그 예측과 정확히 들어맞으면, 그 반응은 우리가 알아채기 전에 줄어듭니다. 이것은 신기한 이야기로 그치지 않습니다. 내 소매가 스치는 것과 다른 사람이 닿는 것을 구별하는 방법이 바로 그것입니다. 간지럼은 놀라움에 기대는데 내 손은 나를 놀라게 할 수 없습니다. 움직임에 아주 짧은 지연을 넣은 실험에서는 그 느낌이 거의 그대로 살아납니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to explain why we cannot tickle ourselves."],
        ["W", "The brain makes a prediction of what that hand will feel."],
        ["W", "When the real sensation matches the prediction, the response is turned down."],
        ["W", "A tickle depends on surprise."],
        ["W", "Experiments with a small delay restore the feeling almost completely."],
      ],
      choices: [
        "the brain predicting what the hand will feel",
        "the response being turned down on a match",
        "a tickle depending on surprise",
        "a small delay restoring the feeling",
        "the age at which children laugh most",
      ],
      answer: 5,
      clue: "The brain makes a prediction of what that hand will feel.",
      explanation:
        "손의 감각을 예측하는 뇌, 예측과 맞으면 줄어드는 반응, 놀라움에 기대는 간지럼, 느낌을 되살리는 지연 실험은 언급되지만 아이들이 가장 많이 웃는 나이는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
