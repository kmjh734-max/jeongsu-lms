/** 고3 듣기 35회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 35회",
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
          "Good morning, everyone. This is the head of the third year. " +
            "I am speaking about the study rooms during the final two months. " +
            "Until now the rooms were open to anyone who wanted a seat, " +
            "and by seven in the evening students were working in the corridor. " +
            "From next Monday each room will be assigned to two classes, " +
            "with a printed list on the door and a spare seat for visitors. " +
            "If your class is not listed on a door, that room is not yours that evening. " +
            "The arrangement changes every four weeks so that nobody keeps the quietest room. " +
            "Speak to me if it does not work for you. Thank you.",
        ],
      ],
      choices: [
        "자습실 배정 방식을 안내하려고",
        "자습실 운영 시간을 늘린다고 알리려고",
        "시험 일정을 안내하려고",
        "복도 공사를 알리려고",
        "상담 신청을 받으려고",
      ],
      answer: 1,
      clue: "From next Monday each room will be assigned to two classes.",
      explanation:
        "남자는 다음 주부터 자습실을 반별로 배정한다며 그 방식을 안내한다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 3학년 부장입니다. 남은 두 달 동안의 자습실에 대해 말씀드립니다. 지금까지는 자리를 원하는 사람이면 누구나 쓸 수 있었고, 저녁 일곱 시면 복도에서 공부하는 학생이 생겼습니다. 다음 주 월요일부터 각 자습실을 두 반씩 배정하고, 문에 명단을 붙이며 방문용 자리 하나를 남겨 둡니다. 문에 여러분 반이 없다면 그날 저녁 그 방은 여러분 자리가 아닙니다. 가장 조용한 방을 한 반이 계속 차지하지 않도록 배정은 네 주마다 바뀝니다. 잘 맞지 않으면 저에게 말해 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Seoyun, I've been told to write down my weak points every day."],
        ["W", "And how long is that list now?"],
        ["M", "Ninety-four items, going back to March."],
        ["W", "What have you done with the ones from March?"],
        ["M", "Nothing. I add to the list rather than work through it."],
        ["W", "Then the list has become a way of not studying."],
        ["M", "It feels like progress, though."],
        ["W", "Writing down a problem feels like solving it, and it is not."],
        ["M", "So should I stop keeping the list?"],
        ["W", "Keep it, and cross three items off before you add any more."],
        ["M", "That would slow the list down a great deal."],
        ["W", "The list is not the point. The crossing off is."],
      ],
      choices: [
        "약점 목록을 자세히 적어야 한다",
        "적기보다 하나씩 해결해 나가야 한다",
        "약점은 선생님과 상의해야 한다",
        "목록은 매일 새로 써야 한다",
        "약점보다 강점을 봐야 한다",
      ],
      answer: 2,
      clue: "Keep it, and cross three items off before you add any more.",
      explanation:
        "여자는 목록을 늘리는 것이 공부가 아니라며 하나씩 지워 나가라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 서윤아, 매일 약점을 적으라고 들었어.",
        "W: 그래서 그 목록이 지금 얼마나 길어?",
        "M: 3월까지 거슬러 올라가서 아흔네 개.",
        "W: 3월 것들은 어떻게 했어?",
        "M: 아무것도. 목록을 붙잡고 푸는 대신 더 적기만 했어.",
        "W: 그럼 그 목록이 공부를 안 하는 방법이 된 거야.",
        "M: 그래도 나아가는 느낌은 들어.",
        "W: 문제를 적으면 푼 것 같은 느낌이 들지만 푼 게 아니야.",
        "M: 그럼 목록을 그만 쓸까?",
        "W: 계속 써. 대신 더 적기 전에 세 개를 지워.",
        "M: 그러면 목록이 아주 느려질 텐데.",
        "W: 중요한 건 목록이 아니라 지우는 거야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Before an examination everyone asks how many hours you are studying, " +
            "and nobody asks what you are doing with the first ten minutes of each hour. " +
            "Those ten minutes decide the other fifty. " +
            "A session begun with a clear question runs itself. " +
            "A session begun by opening a book and waiting for interest " +
            "usually spends half its length getting started. " +
            "Write the question down before you sit. " +
            "What am I trying to be able to do by six o'clock? " +
            "An hour with an answer to that is worth two without one.",
        ],
      ],
      choices: [
        "공부 시간을 늘려야 한다",
        "공부를 시작할 때 목표를 정해야 한다",
        "공부 장소를 정해야 한다",
        "쉬는 시간을 늘려야 한다",
        "공부한 시간을 기록해야 한다",
      ],
      answer: 2,
      clue: "Write the question down before you sit.",
      explanation:
        "남자는 앉기 전에 무엇을 할 수 있게 되려는지 정하라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 시험을 앞두면 다들 몇 시간 공부하느냐고 묻고, 한 시간의 첫 10분을 어떻게 쓰느냐고 묻는 사람은 없습니다. 그 10분이 나머지 50분을 정합니다. 분명한 질문으로 시작한 시간은 저절로 굴러갑니다. 책을 펴고 흥미가 생기기를 기다리며 시작한 시간은 대개 절반을 시작하는 데 씁니다. 앉기 전에 질문을 적으세요. 여섯 시까지 나는 무엇을 할 수 있게 되려 하는가? 그 답을 가진 한 시간은 답이 없는 두 시간의 값을 합니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junho, is this the third year common room?"],
        ["M", "Yes, they gave it to us in September."],
        ["W", "A long sofa stands against the back wall."],
        ["M", "Six people can sit on it, at a squeeze."],
        ["W", "There's a round low table in front of the sofa."],
        ["M", "It came from the staff room when they changed theirs."],
        ["W", "A water cooler stands in the right corner."],
        ["M", "We fill it ourselves every other morning."],
        ["W", "Three posters hang on the left wall."],
        ["M", "Two, actually. The third came down last week."],
        ["W", "And a square clock hangs above the door."],
        ["M", "It's the only thing in here that was already here."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Two, actually. The third came down last week.",
      explanation:
        "여자가 포스터가 세 장이라고 하자 남자가 두 장이라고 바로잡는다. 그림에는 세 장이 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.42],
          [0.46, 0.72],
          [0.88, 0.42],
          [0.1, 0.24],
          [0.62, 0.07],
        ],
        scene:
          "A school common room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A LONG SOFA stands against the BACK wall across the middle of the picture. " +
          "A ROUND LOW TABLE stands on the floor in front of the sofa. " +
          "A WATER COOLER with a bottle on top stands in the RIGHT corner. " +
          "EXACTLY THREE BLANK RECTANGULAR POSTERS hang in a row on the LEFT wall, " +
          "evenly spaced and clearly separated so all three can be counted. " +
          "A SQUARE WALL CLOCK hangs on the BACK wall above a door.",
      },
      translation: [
        "W: 준호야, 여기가 3학년 휴게실이야?",
        "M: 응, 9월에 우리한테 줬어.",
        "W: 뒷벽에 긴 소파가 있네.",
        "M: 붙어 앉으면 여섯 명이 앉아.",
        "W: 소파 앞에는 둥근 낮은 탁자가 있고.",
        "M: 교무실에서 바꾸면서 준 거야.",
        "W: 오른쪽 구석에는 정수기가 있네.",
        "M: 이틀에 한 번 아침에 우리가 채워.",
        "W: 왼쪽 벽에는 포스터가 세 장 걸려 있어.",
        "M: 사실 두 장이야. 세 번째는 지난주에 내렸어.",
        "W: 그리고 문 위에는 네모난 시계가 걸려 있네.",
        "M: 여기서 원래부터 있던 건 그것뿐이야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taemin, the last mock test is on Wednesday."],
        ["M", "Have the papers arrived from the office?"],
        ["W", "All five subjects, and they're locked in the cupboard."],
        ["M", "What about the seating plan?"],
        ["W", "Printed and checked twice on Friday."],
        ["M", "Then the main things are done."],
        ["W", "Except the clocks. Two rooms have none at all."],
        ["M", "Can't the teachers just call out the time?"],
        ["W", "They do, and students complain about it every single time."],
        ["M", "Where would we even find two clocks?"],
        ["W", "There are spare ones in the store room downstairs."],
        ["M", "I'll fetch two clocks and hang them this afternoon."],
      ],
      choices: [
        "시험지를 옮기기",
        "좌석표를 인쇄하기",
        "시계를 가져와 걸기",
        "선생님께 알리기",
        "창고를 정리하기",
      ],
      answer: 3,
      clue: "I'll fetch two clocks and hang them this afternoon.",
      explanation:
        "남자는 오늘 오후에 시계 두 개를 가져와 걸겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 태민아, 마지막 모의고사가 수요일이야.",
        "M: 시험지는 행정실에서 왔어?",
        "W: 다섯 과목 다. 장에 잠가 뒀어.",
        "M: 좌석표는?",
        "W: 금요일에 인쇄하고 두 번 확인했어.",
        "M: 그럼 큰 건 다 됐네.",
        "W: 시계만 빼고. 두 교실에는 시계가 아예 없어.",
        "M: 선생님이 시간을 말해 주시면 안 돼?",
        "W: 그렇게 하시는데 매번 학생들이 불만이야.",
        "M: 시계를 어디서 구해?",
        "W: 아래층 창고에 여분이 있어.",
        "M: 오늘 오후에 두 개 가져와서 걸게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Good afternoon. Are you here about the study planners?"],
        ["W", "Yes, our class would like to order some."],
        ["M", "How many students are in the class?"],
        ["W", "Twenty-eight, but only twenty want one."],
        ["M", "A planner is eleven dollars each."],
        ["W", "Twenty of those, then."],
        ["M", "Would you like the school name printed on the cover?"],
        ["W", "How much does the printing add?"],
        ["M", "One dollar fifty for each planner."],
        ["W", "Print the name on all twenty, please."],
        ["M", "And orders over two hundred dollars get ten dollars off."],
        ["W", "Here is the class card, then."],
      ],
      choices: ["$240", "$250", "$230", "$220", "$260"],
      answer: 1,
      clue: "A planner is eleven dollars each.",
      explanation:
        "스무 권에 220달러이고 인쇄 서른 달러를 더하면 250달러이며, 10달러를 빼면 240달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요. 학습 계획표 때문에 오셨나요?",
        "W: 네, 우리 반에서 주문하려고요.",
        "M: 반에 학생이 몇 명인가요?",
        "W: 스물여덟 명인데 스무 명만 사요.",
        "M: 계획표는 한 권에 11달러입니다.",
        "W: 그럼 스무 권이요.",
        "M: 표지에 학교 이름을 찍어 드릴까요?",
        "W: 인쇄하면 얼마가 더 붙나요?",
        "M: 한 권에 1달러 50센트입니다.",
        "W: 스무 권 다 이름 찍어 주세요.",
        "M: 그리고 200달러가 넘는 주문은 10달러를 빼 드립니다.",
        "W: 그럼 여기 학급 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 학교에 일찍 오는 이유를 고르시오.",
      lines: [
        ["M", "Naeun, you've been arriving before seven all week."],
        ["W", "Since Monday, and I'll keep doing it until November."],
        ["M", "Is it to get a seat in the study room?"],
        ["W", "The seats are assigned now, so that isn't it."],
        ["M", "Then is your bus earlier than it used to be?"],
        ["W", "No, I study English listening in the empty classroom."],
        ["M", "You can't do that at home?"],
        ["W", "At home the house is awake by half past six."],
        ["M", "And listening needs an hour of real quiet."],
        ["W", "One noise and the whole passage is gone."],
      ],
      choices: [
        "자리를 맡으려고",
        "버스 시간이 바뀌어서",
        "조용한 곳에서 듣기를 하려고",
        "숙제를 하려고",
        "선생님을 만나려고",
      ],
      answer: 3,
      clue: "No, I study English listening in the empty classroom.",
      explanation:
        "여자는 조용한 빈 교실에서 듣기를 하려고 일찍 온다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 나은아, 일주일 내내 일곱 시 전에 오더라.",
        "W: 월요일부터. 11월까지 계속할 거야.",
        "M: 자습실 자리 맡으려고?",
        "W: 이제 자리는 배정되니까 그건 아니야.",
        "M: 그럼 버스 시간이 빨라졌어?",
        "W: 아니, 빈 교실에서 영어 듣기를 해.",
        "M: 집에서는 못 해?",
        "W: 집은 6시 반이면 다들 깨어 있어.",
        "M: 듣기는 한 시간 진짜 조용해야 하지.",
        "W: 소리 한 번이면 지문 하나가 통째로 날아가.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 면접 대비 특강에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Chaewon, are you taking the interview workshop this term?"],
        ["W", "I put my name down last week, but that's all I know."],
        ["M", "Then let me tell you what I heard from the careers teacher."],
        ["W", "Please do. The poster said almost nothing useful."],
        ["M", "It runs on two afternoons, the tenth and the seventeenth."],
        ["W", "Two sessions only? What happens in each?"],
        ["M", "The first is about answers, the second is practice on camera."],
        ["W", "On camera? That sounds uncomfortable."],
        ["M", "It is, and everyone says it was the useful part."],
        ["W", "Where is it held?"],
        ["M", "In the seminar room next to the careers office."],
        ["W", "How many places are there?"],
        ["M", "Twenty, and they filled fourteen on the first day."],
      ],
      choices: ["특강 날짜", "각 회차에 하는 것", "특강 장소", "정원", "신청하는 방법"],
      answer: 5,
      clue: "It runs on two afternoons, the tenth and the seventeenth.",
      explanation:
        "날짜, 내용, 장소, 정원은 말했지만 신청 방법은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 채원아, 이번 학기 면접 특강 들어?",
        "W: 지난주에 이름은 적었는데 아는 건 그게 다야.",
        "M: 그럼 진로 선생님께 들은 걸 말해 줄게.",
        "W: 말해 줘. 포스터에는 쓸 만한 게 거의 없었어.",
        "M: 오후에 두 번 해. 10일이랑 17일.",
        "W: 두 번만? 각각 뭘 해?",
        "M: 첫 번째는 답변에 대해, 두 번째는 카메라 앞에서 연습.",
        "W: 카메라 앞에서? 불편하겠다.",
        "M: 불편해. 그런데 다들 그게 도움이 됐대.",
        "W: 어디서 해?",
        "M: 진로실 옆 세미나실에서.",
        "W: 정원이 몇 명이야?",
        "M: 스무 명. 첫날에 열네 자리가 찼어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Nuri Youth Study Centre에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Nuri Youth Study Centre, which opened last spring. " +
            "The centre occupies the second and third floors of the district library. " +
            "It is open from nine in the morning until eleven at night, every day except Sunday. " +
            "There are a hundred and twenty seats, all of them free to use. " +
            "Seats cannot be booked, so students queue at the door in the morning. " +
            "Bags may be left in lockers, which cost five hundred won a day. " +
            "There is a small room where you may talk, on the third floor. " +
            "The centre closes for two weeks in August for cleaning.",
        ],
      ],
      choices: [
        "구립 도서관 2층과 3층을 쓰고 있다",
        "일요일을 빼고 매일 연다",
        "좌석은 무료로 쓸 수 있다",
        "좌석을 미리 예약할 수 있다",
        "8월에 두 주 동안 문을 닫는다",
      ],
      answer: 4,
      clue: "Seats cannot be booked, so students queue at the door in the morning.",
      explanation:
        "좌석은 예약할 수 없다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 지난봄에 문을 연 누리 청소년 공부방에 대해 알려 드립니다. 공부방은 구립 도서관 2층과 3층을 씁니다. 일요일을 빼고 매일 아침 아홉 시부터 밤 열한 시까지 엽니다. 자리는 백스무 개이고 모두 무료로 쓸 수 있습니다. 자리는 예약할 수 없어서 아침에 문 앞에 줄을 섭니다. 가방은 사물함에 둘 수 있고 하루에 500원입니다. 3층에는 말을 해도 되는 작은 방이 있습니다. 공부방은 8월에 두 주 동안 청소를 위해 닫습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 스터디룸을 고르시오.",
      lines: [
        ["M", "Hayoon, five study rooms are free on Saturday afternoon."],
        ["W", "We've been meeting in the corridor for two weeks."],
        ["M", "Then let's fix it today. How many are coming?"],
        ["W", "Nine, so we need room for at least nine."],
        ["M", "Two of these seat only six."],
        ["W", "Then they're out. Do any of them have a whiteboard?"],
        ["M", "Two of the three left do."],
        ["W", "We need one for the maths questions."],
        ["M", "And the price? We said under thirty thousand won."],
        ["W", "One of the last two is thirty-six thousand."],
        ["M", "So there's only one room for us."],
        ["W", "I'll book it before somebody else does."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Nine, so we need room for at least nine.",
      explanation:
        "9명 이상, 화이트보드 있음, 3만 원 미만인 방을 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Seats: 6 / Whiteboard: Yes / Price: 20,000 won" },
          { no: 2, label: "②", value: "Seats: 6 / Whiteboard: No / Price: 18,000 won" },
          { no: 3, label: "③", value: "Seats: 10 / Whiteboard: No / Price: 25,000 won" },
          { no: 4, label: "④", value: "Seats: 12 / Whiteboard: Yes / Price: 28,000 won" },
          { no: 5, label: "⑤", value: "Seats: 10 / Whiteboard: Yes / Price: 36,000 won" },
        ],
      },
      translation: [
        "M: 하윤아, 토요일 오후에 스터디룸 다섯 개가 비어 있어.",
        "W: 두 주째 복도에서 모였잖아.",
        "M: 그럼 오늘 해결하자. 몇 명 와?",
        "W: 아홉 명. 적어도 아홉 명은 들어가야 해.",
        "M: 두 개는 여섯 자리야.",
        "W: 그럼 빠지네. 화이트보드 있는 데 있어?",
        "M: 남은 셋 중 둘에 있어.",
        "W: 수학 문제 때문에 하나 필요해.",
        "M: 값은? 3만 원 아래로 하기로 했잖아.",
        "W: 남은 둘 중 하나는 3만 6천 원이야.",
        "M: 그럼 우리한테 맞는 건 하나뿐이네.",
        "W: 다른 사람이 잡기 전에 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaeyeon, did you get the exam timetable?"],
        ["W", "I saw it on the board but didn't write it down."],
        ["M", "There are copies in the office now."],
        ["W", "I can't leave the classroom this period."],
        ["M", "Shall I bring one up for you?"],
      ],
      choices: [
        "No, I have the timetable.",
        "Yes, please, that would help.",
        "The office is closed.",
        "I don't take the exam.",
        "You should copy mine.",
      ],
      answer: 2,
      clue: "Shall I bring one up for you?",
      explanation:
        "가져다줄지 물었으므로, 그래 주면 좋겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 채연아, 시험 시간표 받았어?",
        "W: 게시판에서 보긴 했는데 적어 오진 않았어.",
        "M: 지금 행정실에 사본이 있어.",
        "W: 이번 시간에는 교실을 못 비워.",
        "M: 내가 하나 가져다줄까?",
        "W: 응, 부탁해. 도움이 되겠다.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangwoo, are you going to the third floor later?"],
        ["M", "After lunch, to see my subject teacher."],
        ["W", "Could you drop these papers at the office?"],
        ["M", "Is there a deadline on them?"],
        ["W", "Today at three, and I have a class then."],
      ],
      choices: [
        "I'm not going upstairs.",
        "All right, I'll hand them in.",
        "The office is closed today.",
        "You should take them yourself.",
        "Three o'clock is too early.",
      ],
      answer: 2,
      clue: "Today at three, and I have a class then.",
      explanation:
        "오늘 세 시가 마감인데 수업이 있다고 했으므로, 대신 내겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 상우야, 이따 3층 가?",
        "M: 점심 먹고. 과목 선생님 뵈러.",
        "W: 이 서류 좀 행정실에 내 줄래?",
        "M: 마감이 있어?",
        "W: 오늘 세 시. 그때 나는 수업이 있어.",
        "M: 알겠어, 내가 내 줄게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Dohyun, how is the maths revision going this month?"],
        ["M", "I solve everything at home and freeze in the test."],
        ["W", "How do you practise at home?"],
        ["M", "I work through the questions with no clock anywhere."],
        ["W", "And in the test there is a clock on the wall."],
        ["M", "Which I look at every ninety seconds."],
        ["W", "So you've practised the questions but not the conditions."],
        ["M", "The questions are the hard part, surely."],
        ["W", "At home they are. In the room the clock is."],
        ["M", "Then what should I change tonight?"],
        ["W", "Set a timer and do ten questions under it."],
      ],
      choices: [
        "I never practise at home.",
        "That's the missing piece, I'll try it.",
        "Clocks are not a problem.",
        "I don't take maths tests.",
        "You should set my timer.",
      ],
      answer: 2,
      clue: "Set a timer and do ten questions under it.",
      explanation:
        "시간을 재고 풀어 보라는 조언이므로, 그것이 빠진 부분이라며 해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 도현아, 이번 달 수학 복습은 어때?",
        "M: 집에서는 다 푸는데 시험에서는 굳어.",
        "W: 집에서는 어떻게 연습해?",
        "M: 시계는 아무 데도 없이 문제를 풀어.",
        "W: 시험장에는 벽에 시계가 있지.",
        "M: 90초마다 쳐다보게 돼.",
        "W: 그럼 문제는 연습했는데 조건은 연습 안 한 거야.",
        "M: 어려운 건 문제잖아.",
        "W: 집에서는 그래. 시험장에서는 시계가 어려운 거야.",
        "M: 그럼 오늘 밤에 뭘 바꿔야 해?",
        "W: 타이머를 맞추고 열 문제를 그 안에서 풀어.",
        "M: 그게 빠진 부분이었네, 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyeon, you've been walking for twenty minutes after dinner."],
        ["W", "Every evening since the start of September."],
        ["M", "Is that not time you could be studying?"],
        ["W", "It was the only thing that fixed my evenings."],
        ["M", "What was wrong with your evenings?"],
        ["W", "I sat down at seven and started properly at eight."],
        ["M", "And the walk closes that hour?"],
        ["W", "I come back and begin within five minutes."],
        ["M", "So twenty minutes buys back fifty."],
        ["W", "Something like that, and I sleep better as well."],
        ["M", "Could I come with you this evening?"],
      ],
      choices: [
        "Of course, I leave at seven.",
        "I stopped walking last month.",
        "The park is closed now.",
        "You can't walk with me.",
        "I never eat dinner.",
      ],
      answer: 1,
      clue: "Could I come with you this evening?",
      explanation:
        "남자가 오늘 저녁 같이 가도 되는지 물었으므로, 일곱 시에 나간다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 서연아, 저녁 먹고 20분씩 걷는다며.",
        "W: 9월 초부터 매일 저녁에.",
        "M: 그 시간에 공부할 수도 있잖아.",
        "W: 내 저녁을 고쳐 준 건 그거 하나뿐이야.",
        "M: 저녁이 뭐가 문제였는데?",
        "W: 일곱 시에 앉아서 여덟 시에야 제대로 시작했어.",
        "M: 그 걷기가 그 한 시간을 없애 준 거야?",
        "W: 돌아와서 5분 안에 시작해.",
        "M: 그럼 20분이 50분을 되사 주는 거네.",
        "W: 그런 셈이야. 잠도 더 잘 자고.",
        "M: 오늘 저녁에 나도 같이 가도 돼?",
        "W: 그럼, 나는 일곱 시에 나가.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Minjae가 Chaewon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Minjae : ________________",
      lines: [
        [
          "M",
          "Minjae and Chaewon are preparing the third year revision booklet. " +
            "They have collected past questions from the last five years. " +
            "Chaewon has arranged them from the easiest to the hardest. " +
            "Minjae notices that the first eleven pages are all very easy questions. " +
            "A student with two weeks left would spend the first week on work they can do. " +
            "He thinks the questions should be mixed instead, as in the real paper. " +
            "There is still time to change the order before it is printed. " +
            "In this situation, what would Minjae most likely say to Chaewon?",
        ],
      ],
      choices: [
        "Let's use fewer past papers.",
        "We should print it next month.",
        "Mix the questions instead of ordering them.",
        "I'll write new questions myself.",
        "Eleven pages is far too short.",
      ],
      answer: 3,
      clue: "He thinks the questions should be mixed instead, as in the real paper.",
      explanation:
        "쉬운 문제만 앞에 몰려 있으므로 실제 시험처럼 섞자는 ③이 가장 적절하다.",
      translation: [
        "M: 민재와 채원이는 3학년 복습 문제집을 만들고 있습니다. 두 사람은 지난 5년치 기출 문제를 모았습니다. 채원이는 쉬운 것부터 어려운 것 순서로 배열했습니다. 민재는 앞 열한 쪽이 전부 아주 쉬운 문제라는 것을 알아챕니다. 두 주 남은 학생이라면 첫 주를 이미 할 줄 아는 문제에 쓰게 됩니다. 민재는 실제 시험처럼 문제를 섞어야 한다고 생각합니다. 인쇄에 들어가기 전에 순서를 바꿀 시간은 아직 있습니다. 이런 상황에서 민재가 채원이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to explain why a familiar word " +
            "suddenly looks wrong when you stare at it. " +
            "Reading is not a matter of examining letters one by one. " +
            "The brain matches the whole shape of a word against a stored pattern " +
            "and moves on within a fraction of a second. " +
            "Staring keeps that recognition running over and over on the same input, " +
            "and a response that fires repeatedly without a break grows weaker each time. " +
            "The pattern fades, the letters step forward as separate marks, " +
            "and the word looks like something a stranger invented. " +
            "Look away for two seconds and the whole effect vanishes, " +
            "because the response has had time to recover.",
        ],
      ],
      choices: [
        "how children learn to read words",
        "why a word looks wrong when you stare at it",
        "how spelling rules developed over time",
        "why some fonts are easier to read",
        "how the eye moves along a line of text",
      ],
      answer: 2,
      clue: "The pattern fades, the letters step forward as separate marks.",
      explanation:
        "여자는 같은 자극에 되풀이해 반응하면 인식이 약해져 낱말이 낯설어 보인다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 익숙한 낱말을 빤히 들여다보면 왜 갑자기 틀린 것처럼 보이는지 설명하려 합니다. 읽기는 글자를 하나하나 따져 보는 일이 아닙니다. 뇌는 낱말의 전체 모양을 저장된 무늬와 맞춰 보고 1초도 안 되어 넘어갑니다. 빤히 보면 그 알아보기가 같은 자극에 되풀이해 작동하고, 쉬지 못한 채 계속 일어나는 반응은 매번 약해집니다. 무늬가 흐려지고 글자들이 따로 떨어진 자국으로 앞에 나서면서, 그 낱말은 낯선 사람이 지어낸 것처럼 보입니다. 2초만 눈을 돌리면 그 느낌은 사라집니다. 반응이 회복할 시간을 얻었기 때문입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to explain why a familiar word suddenly looks wrong when you stare at it."],
        ["W", "The brain matches the whole shape of a word against a stored pattern."],
        ["W", "A response that fires repeatedly without a break grows weaker each time."],
        ["W", "The letters step forward as separate marks."],
        ["W", "Look away for two seconds and the whole effect vanishes."],
      ],
      choices: [
        "the brain matching a word against a stored pattern",
        "a repeated response growing weaker",
        "letters stepping forward as separate marks",
        "looking away making the effect vanish",
        "the number of words in a dictionary",
      ],
      answer: 5,
      clue: "The brain matches the whole shape of a word against a stored pattern.",
      explanation:
        "저장된 무늬와 맞춰 보는 뇌, 약해지는 되풀이 반응, 따로 떨어져 보이는 글자, 눈을 돌리면 사라지는 현상은 언급되지만 사전에 실린 낱말 수는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
