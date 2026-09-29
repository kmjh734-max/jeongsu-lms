/** 고2 듣기 32회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 32회",
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
          "Good morning, students. This is Ms. Baek from the academic office. " +
            "I am speaking about the way subject reports will be submitted this term. " +
            "Until now each teacher collected paper copies in class, " +
            "and by the end of last term about forty reports had been lost between desks. " +
            "From this Monday every report goes into the school's online folder instead, " +
            "under your class number and your name, in that order. " +
            "The folder records the exact minute a file arrives, " +
            "so nobody has to argue about whether a report was handed in on time. " +
            "Paper copies will no longer be accepted, even on the deadline day. " +
            "Ask your homeroom teacher if you cannot find the folder. Thank you.",
        ],
      ],
      choices: [
        "보고서 주제를 안내하려고",
        "보고서 제출 방식 변경을 안내하려고",
        "제출 기한 연장을 알리려고",
        "도서관 이용을 안내하려고",
        "성적 처리 방법을 설명하려고",
      ],
      answer: 2,
      clue: "From this Monday every report goes into the school's online folder instead.",
      explanation:
        "여자는 이번 주 월요일부터 보고서를 학교 온라인 폴더에 내야 한다고 안내한다. 따라서 답은 ②이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 교무실 백 선생님입니다. 이번 학기 과목 보고서를 내는 방식에 대해 말씀드립니다. 지금까지는 선생님마다 수업 시간에 종이로 걷었고, 지난 학기가 끝날 무렵에는 책상 사이에서 사라진 보고서가 마흔 편쯤 되었습니다. 이번 주 월요일부터는 모든 보고서를 학교 온라인 폴더에 반 번호와 이름 순서로 올립니다. 그 폴더는 파일이 도착한 시각을 분 단위로 기록하므로, 제때 냈는지를 두고 다툴 일이 없습니다. 마감일이라도 종이 보고서는 더 이상 받지 않습니다. 폴더를 찾지 못하면 담임 선생님께 여쭤보세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Hyunwoo, I've written my university application essay six times."],
        ["M", "Six full versions, or six edits of the same one?"],
        ["W", "Six new starts. None of them sounded like me."],
        ["M", "What were you trying to sound like?"],
        ["W", "Serious, I suppose. The kind of student they would want."],
        ["M", "That's the problem, and it's the same one everybody has."],
        ["W", "So I shouldn't try to impress them?"],
        ["M", "Write about something you actually did, in the words you actually use."],
        ["W", "Mine are mostly small things, though."],
        ["M", "A small thing told honestly beats a large one borrowed."],
        ["W", "They must read thousands of these every year."],
        ["M", "Which is exactly why the honest one is the one they remember."],
      ],
      choices: [
        "지원서는 여러 번 고쳐 써야 한다",
        "지원서에는 큰 성과를 담아야 한다",
        "지원서는 자기 말로 솔직하게 써야 한다",
        "지원서는 선생님께 검토받아야 한다",
        "지원서는 일찍 시작해야 한다",
      ],
      answer: 3,
      clue: "Write about something you actually did, in the words you actually use.",
      explanation:
        "남자는 꾸미려 하지 말고 실제로 한 일을 자기 말로 솔직하게 쓰라고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 현우야, 대학 지원서를 여섯 번이나 썼어.",
        "M: 여섯 판을 새로 쓴 거야, 같은 걸 여섯 번 고친 거야?",
        "W: 여섯 번 새로 시작했어. 하나도 나 같지 않았어.",
        "M: 어떤 느낌을 내려고 했는데?",
        "W: 진지한 느낌. 그쪽이 원할 법한 학생 같은.",
        "M: 그게 문제야. 다들 똑같이 그래.",
        "W: 그럼 잘 보이려고 하지 말라는 거야?",
        "M: 네가 실제로 한 일을 네가 실제로 쓰는 말로 써.",
        "W: 내 건 대부분 사소한 일들인데.",
        "M: 솔직하게 말한 작은 일이 빌려 온 큰 일보다 나아.",
        "W: 해마다 수천 장을 읽을 텐데.",
        "M: 그래서 기억에 남는 게 솔직한 쪽인 거야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "You are told to find your passion, as though it were an object in a drawer. " +
            "Almost nobody finds one that way. " +
            "Interest is not discovered before the work. It grows out of it. " +
            "You become curious about a subject after you are no longer bad at it, " +
            "and you stop being bad at it only by spending months doing it badly. " +
            "Waiting to feel passionate before beginning is the surest way never to begin. " +
            "Pick something reasonable, stay with it past the uncomfortable months, " +
            "and see whether the feeling arrives. Very often it does.",
        ],
      ],
      choices: [
        "좋아하는 일을 빨리 찾아야 한다",
        "흥미는 해 보는 동안 생긴다",
        "여러 분야를 두루 경험해야 한다",
        "진로는 성적에 맞춰야 한다",
        "조언을 많이 들어야 한다",
      ],
      answer: 2,
      clue: "Interest is not discovered before the work. It grows out of it.",
      explanation:
        "여자는 열정을 먼저 찾는 것이 아니라 해 보는 동안 흥미가 자란다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 사람들은 열정을 찾으라고 말합니다. 서랍 속 물건이라도 되는 것처럼요. 그런 식으로 찾는 사람은 거의 없습니다. 흥미는 일보다 먼저 발견되는 것이 아닙니다. 일에서 자라나는 것입니다. 어떤 분야에 궁금해지는 것은 더 이상 못하지 않게 된 뒤이고, 못하지 않게 되는 길은 몇 달 동안 못하는 채로 해 보는 것뿐입니다. 열정이 느껴질 때까지 기다리는 것은 결코 시작하지 않는 가장 확실한 방법입니다. 그럴듯한 것을 하나 골라 불편한 몇 달을 지나 보내고, 그 느낌이 오는지 보세요. 아주 자주 옵니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, is this the study lounge they opened upstairs?"],
        ["W", "Yes, it was finished at the start of this month."],
        ["M", "A long shared desk runs down the middle of the room."],
        ["W", "Eight people can work at it without touching elbows."],
        ["M", "There's a round wall clock above the door."],
        ["W", "It's the only clock on this whole floor."],
        ["M", "I count two pendant lamps over the desk."],
        ["W", "There are three. The middle one is switched off."],
        ["M", "A water cooler stands in the left corner."],
        ["W", "We refill our bottles there between classes."],
        ["M", "And a tall bookcase covers the right wall."],
        ["W", "The reference books have to stay in this room."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "There are three. The middle one is switched off.",
      explanation:
        "남자가 등이 두 개라고 하자 여자가 세 개라고 바로잡는다. 그림에는 두 개가 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.62],
          [0.5, 0.08],
          [0.35, 0.28],
          [0.09, 0.5],
          [0.88, 0.45],
        ],
        scene:
          "A school study lounge drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A LONG SHARED DESK runs down the MIDDLE of the room from front to back with chairs on both sides. " +
          "A ROUND WALL CLOCK hangs on the BACK wall above a door. " +
          "EXACTLY TWO PENDANT LAMPS hang from the ceiling over the long desk, " +
          "clearly separated with a wide gap between them so both can be counted. " +
          "A WATER COOLER with a bottle on top stands in the LEFT corner. " +
          "A TALL BOOKCASE full of books covers the RIGHT wall.",
      },
      translation: [
        "M: 서연아, 여기가 위층에 새로 연 자습 공간이야?",
        "W: 응, 이번 달 초에 다 만들었어.",
        "M: 방 한가운데를 따라 긴 공용 책상이 있네.",
        "W: 여덟 명이 팔꿈치 안 부딪히고 앉을 수 있어.",
        "M: 문 위에는 둥근 벽시계가 있고.",
        "W: 이 층에 있는 시계는 그거 하나뿐이야.",
        "M: 책상 위에 매단 등이 두 개 보여.",
        "W: 세 개야. 가운데 것은 꺼 놨어.",
        "M: 왼쪽 구석에는 정수기가 있네.",
        "W: 쉬는 시간마다 거기서 물병을 채워.",
        "M: 그리고 오른쪽 벽은 키 큰 책장이 덮고 있어.",
        "W: 참고 도서는 이 방 밖으로 못 가져가.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junho, the mock interview session is on Thursday afternoon."],
        ["M", "Have all the volunteer interviewers confirmed their times?"],
        ["W", "Six of the seven have. The last one answered this morning."],
        ["M", "That's a relief. And what about the rooms?"],
        ["W", "Three rooms on the second floor, booked until six o'clock."],
        ["M", "Then everything looks more or less ready."],
        ["W", "Except the question sheets. Each interviewer needs one of those."],
        ["M", "Didn't we simply use last year's sheets again?"],
        ["W", "Half of the questions no longer match the new courses."],
        ["M", "So somebody has to sit down and rewrite them."],
        ["W", "Before Thursday, and nobody has started yet."],
        ["M", "How many pages are we talking about?"],
        ["W", "Two pages for each of the seven interviewers."],
        ["M", "I'll rewrite the question sheets tonight."],
      ],
      choices: [
        "면접관에게 연락하기",
        "교실을 예약하기",
        "질문지를 다시 쓰기",
        "일정표를 붙이기",
        "학생들을 모으기",
      ],
      answer: 3,
      clue: "I'll rewrite the question sheets tonight.",
      explanation:
        "남자는 오늘 밤에 질문지를 다시 쓰겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 준호야, 모의 면접이 목요일 오후야.",
        "M: 면접 도와주실 분들 시간은 다 정해졌어?",
        "W: 일곱 분 중 여섯 분. 마지막 분이 오늘 아침에 답 주셨어.",
        "M: 다행이다. 교실은?",
        "W: 2층에 세 개, 여섯 시까지 잡아 놨어.",
        "M: 그럼 대충 다 된 것 같은데.",
        "W: 질문지만 빼고. 면접관마다 한 부씩 필요해.",
        "M: 그냥 작년 질문지 다시 쓰면 안 돼?",
        "W: 절반이 새 학과랑 안 맞아.",
        "M: 그럼 누가 앉아서 다시 써야 하네.",
        "W: 목요일 전에. 아직 아무도 시작 안 했어.",
        "M: 몇 쪽이나 되는데?",
        "W: 면접관 일곱 분에게 두 쪽씩.",
        "M: 오늘 밤에 질문지 다시 쓸게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Good afternoon. Are you here about the study room?"],
        ["W", "Yes, I'd like to book one for Saturday."],
        ["M", "The four person room is twelve dollars for two hours."],
        ["W", "We'll be six, so we need the larger one."],
        ["M", "The six person room is eighteen dollars for two hours."],
        ["W", "We need it for four hours in total."],
        ["M", "Each extra hour after the first two is seven dollars."],
        ["W", "Is the whiteboard included in that?"],
        ["M", "The board is free, but the marker set is three dollars."],
        ["W", "We'll take one marker set, please."],
        ["M", "And members get five dollars off the room charge."],
        ["W", "Here is my membership card, then."],
      ],
      choices: ["$30", "$35", "$32", "$27", "$38"],
      answer: 1,
      clue: "The six person room is eighteen dollars for two hours.",
      explanation:
        "6인실 네 시간은 32달러이고 회원 할인 5달러를 빼면 27달러이며, 펜 세트 3달러를 더하면 30달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요. 스터디룸 때문에 오셨나요?",
        "W: 네, 토요일로 하나 예약하려고요.",
        "M: 4인실은 두 시간에 12달러입니다.",
        "W: 저희는 여섯 명이라 더 큰 방이 필요해요.",
        "M: 6인실은 두 시간에 18달러입니다.",
        "W: 모두 네 시간 써야 해요.",
        "M: 처음 두 시간 뒤로는 한 시간마다 7달러입니다.",
        "W: 화이트보드도 그 값에 들어가나요?",
        "M: 보드는 무료이고 펜 세트는 3달러입니다.",
        "W: 펜 세트 하나 주세요.",
        "M: 그리고 회원은 방값에서 5달러를 빼 드립니다.",
        "W: 그럼 여기 회원 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 학교 축제 준비 모임에 오지 못하는 이유를 고르시오.",
      lines: [
        ["M", "Dain, you're not coming to the festival meeting on Friday?"],
        ["W", "I can't, and I told the leader yesterday."],
        ["M", "Is it the family trip you mentioned in August?"],
        ["W", "That was moved to the winter, so it isn't that."],
        ["M", "Then are you working at the bookshop again?"],
        ["W", "No, I have the mock test that afternoon."],
        ["M", "I thought that was next week."],
        ["W", "It was moved forward, and it runs until five thirty."],
        ["M", "Then there's no way you could get here in time."],
        ["W", "None at all, and I'm sorry to miss it."],
      ],
      choices: [
        "가족 여행을 가야 해서",
        "아르바이트를 해야 해서",
        "모의고사를 봐야 해서",
        "몸이 아파서",
        "다른 동아리 모임이 있어서",
      ],
      answer: 3,
      clue: "No, I have the mock test that afternoon.",
      explanation:
        "여자는 그날 오후에 모의고사가 있어서 모임에 갈 수 없다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 다인아, 금요일 축제 준비 모임에 안 와?",
        "W: 못 가. 어제 부장한테 말했어.",
        "M: 8월에 말한 가족 여행 때문이야?",
        "W: 그건 겨울로 미뤄서 아니야.",
        "M: 그럼 또 서점에서 일해?",
        "W: 아니, 그날 오후에 모의고사가 있어.",
        "M: 다음 주인 줄 알았는데.",
        "W: 앞당겨졌어. 5시 30분까지 봐.",
        "M: 그럼 제시간에 올 방법이 없겠다.",
        "W: 전혀 없어. 못 가서 미안해.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 진로 캠프에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Sangwoo, are you applying for the career camp?"],
        ["M", "I'd like to, but I only saw the poster in passing."],
        ["W", "It runs for two days, on the seventh and the eighth."],
        ["M", "Is it held here or somewhere else?"],
        ["W", "At the youth centre near the river, not at school."],
        ["M", "How do we get there in the morning?"],
        ["W", "A bus leaves the school gate at eight thirty."],
        ["M", "What do we actually do during the two days?"],
        ["W", "Workshops in the morning and talks by graduates in the afternoon."],
        ["M", "How many students can take part?"],
        ["W", "Sixty, and about half the places are gone already."],
      ],
      choices: ["캠프 날짜", "캠프가 열리는 곳", "가는 방법", "진행하는 활동", "준비물"],
      answer: 5,
      clue: "It runs for two days, on the seventh and the eighth.",
      explanation:
        "날짜, 장소, 가는 방법, 활동은 말했지만 준비물은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 상우야, 진로 캠프 신청할 거야?",
        "M: 하고 싶은데 지나가면서 포스터만 봤어.",
        "W: 7일이랑 8일, 이틀 동안 해.",
        "M: 학교에서 해, 다른 데서 해?",
        "W: 학교 말고 강 근처 청소년 센터에서.",
        "M: 아침에 거기까지 어떻게 가?",
        "W: 여덟 시 반에 학교 정문에서 버스가 떠나.",
        "M: 이틀 동안 실제로 뭘 해?",
        "W: 오전에는 활동 수업, 오후에는 졸업생 강연.",
        "M: 몇 명이나 갈 수 있어?",
        "W: 예순 명. 벌써 절반쯤 찼어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Harbour Science Centre에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is some information about the Harbour Science Centre, which reopened this spring. " +
            "The centre sits at the end of the harbour road, beside the old ferry pier. " +
            "It is open from ten until six, and it closes on the first Tuesday of each month. " +
            "There are four floors, and the top one is a workshop for visitors. " +
            "In the workshop you may build a small machine and take it home. " +
            "Tickets are six thousand won, and students pay three thousand. " +
            "A guided tour runs at eleven and at two, and it must be booked online. " +
            "Photographs are allowed everywhere except in the workshop.",
        ],
      ],
      choices: [
        "항구 도로 끝 옛 선착장 옆에 있다",
        "매달 첫째 화요일에 문을 닫는다",
        "꼭대기 층은 방문객 작업실이다",
        "해설 관람은 예약 없이 참여할 수 있다",
        "작업실에서는 사진을 찍을 수 없다",
      ],
      answer: 4,
      clue: "A guided tour runs at eleven and at two, and it must be booked online.",
      explanation:
        "해설 관람은 인터넷으로 예약해야 한다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "M: 올봄에 다시 문을 연 하버 과학관에 대해 알려 드립니다. 과학관은 항구 도로 끝, 옛 나루터 옆에 있습니다. 열 시부터 여섯 시까지 열고 매달 첫째 화요일에는 닫습니다. 층은 네 개이고 꼭대기 층은 방문객을 위한 작업실입니다. 작업실에서는 작은 기계를 만들어 집으로 가져갈 수 있습니다. 표는 6천 원이고 학생은 3천 원입니다. 해설 관람은 열한 시와 두 시에 있으며 인터넷으로 예약해야 합니다. 작업실을 빼고는 어디서나 사진을 찍을 수 있습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 스터디룸을 고르시오.",
      lines: [
        ["W", "Taemin, five study rooms are still free on Sunday."],
        ["M", "Good, because last week we had nowhere to sit."],
        ["W", "How many of us are coming this time?"],
        ["M", "We'll be seven people this week, including the new member."],
        ["W", "Then anything under seven seats is out."],
        ["M", "That removes two of them straight away."],
        ["W", "We also want a room with a window."],
        ["M", "One of the three that are left has no window at all."],
        ["W", "And the price should stay under twenty thousand won."],
        ["M", "One of the last two is twenty-eight thousand."],
        ["W", "So there's only one room that we can take."],
        ["M", "I'll book it tonight before somebody else does."],
        ["W", "Ask for two in the afternoon, if that's possible."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "We'll be seven people this week.",
      explanation:
        "7인 이상, 창이 있는 방, 2만 원 미만인 방을 고른다. 세 조건을 모두 채우는 것은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Seats: 6 / Window: Yes / Price: 15,000 won" },
          { no: 2, label: "②", value: "Seats: 4 / Window: Yes / Price: 12,000 won" },
          { no: 3, label: "③", value: "Seats: 8 / Window: No / Price: 16,000 won" },
          { no: 4, label: "④", value: "Seats: 10 / Window: Yes / Price: 28,000 won" },
          { no: 5, label: "⑤", value: "Seats: 8 / Window: Yes / Price: 19,000 won" },
        ],
      },
      translation: [
        "W: 태민아, 일요일에 스터디룸 다섯 개가 아직 비어 있어.",
        "M: 잘됐다. 지난주엔 앉을 데가 없었잖아.",
        "W: 이번엔 몇 명 와?",
        "M: 새로 들어온 애까지 해서 일곱 명이야.",
        "W: 그럼 일곱 자리 아래인 데는 빠져.",
        "M: 그럼 두 개는 바로 빠지네.",
        "W: 창문이 있는 방이면 좋겠어.",
        "M: 남은 셋 중 하나는 창이 아예 없어.",
        "W: 그리고 값은 2만 원 아래여야 해.",
        "M: 남은 둘 중 하나는 2만 8천 원이야.",
        "W: 그럼 우리가 쓸 수 있는 건 하나뿐이네.",
        "M: 다른 사람이 잡기 전에 오늘 밤에 예약할게.",
        "W: 가능하면 오후 두 시로 부탁해.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Hyerin, did you upload the group report?"],
        ["M", "Not yet. The file is too large for the folder."],
        ["W", "You could split it into two parts."],
        ["M", "Would the teacher accept two files?"],
        ["W", "She said two is fine if you number them."],
      ],
      choices: [
        "The report is finished.",
        "Then I'll upload it in two parts.",
        "I don't have the report.",
        "The folder is closed now.",
        "You should write it again.",
      ],
      answer: 2,
      clue: "She said two is fine if you number them.",
      explanation:
        "번호를 붙이면 두 파일도 괜찮다고 했으므로, 두 부분으로 나눠 올리겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 혜린아, 조별 보고서 올렸어?",
        "M: 아직. 파일이 폴더에 올리기엔 너무 커.",
        "W: 두 부분으로 나눠도 되잖아.",
        "M: 선생님이 파일 두 개를 받아 주실까?",
        "W: 번호만 붙이면 두 개도 괜찮다고 하셨어.",
        "M: 그럼 두 부분으로 나눠서 올릴게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nayoung, are you going to the teachers' office now?"],
        ["W", "In about ten minutes, after I pack up."],
        ["M", "Could you hand in my attendance card?"],
        ["W", "Is your name already written on it?"],
        ["M", "Yes, and the date is on the back."],
      ],
      choices: [
        "I'm not going there today.",
        "Sure, give it to me now.",
        "You should write your name.",
        "The office is locked.",
        "I lost my own card.",
      ],
      answer: 2,
      clue: "Yes, and the date is on the back.",
      explanation:
        "이름과 날짜가 적혀 있다고 했으므로, 지금 달라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나영아, 지금 교무실 가?",
        "W: 정리하고 10분쯤 뒤에.",
        "M: 내 출석 카드 좀 내 줄래?",
        "W: 이름은 벌써 적혀 있어?",
        "M: 응, 날짜는 뒤에 있어.",
        "W: 그래, 지금 줘.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaewon, how is the reading club going this term?"],
        ["W", "We meet every week, but almost nobody has read the book."],
        ["M", "How long is the book you chose?"],
        ["W", "Four hundred pages, and we read it in a month."],
        ["M", "That's a hundred pages a week for busy students."],
        ["W", "It sounded reasonable when we voted on it."],
        ["M", "Voting in September always sounds reasonable."],
        ["W", "And then October arrives with the exams."],
        ["M", "Does the meeting still work if half have read it?"],
        ["W", "Not really. The discussion dies in ten minutes."],
        ["M", "Try a short book or a single chapter next time."],
      ],
      choices: [
        "Nobody comes to the meetings.",
        "That might save the club, I'll suggest it.",
        "Four hundred pages is short.",
        "We should stop meeting.",
        "I never read the books either.",
      ],
      answer: 2,
      clue: "Try a short book or a single chapter next time.",
      explanation:
        "짧은 책이나 한 장만 읽어 보라는 제안이므로, 제안해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 채원아, 이번 학기 독서 모임은 어때?",
        "W: 매주 모이는데 책을 읽어 오는 사람이 거의 없어.",
        "M: 고른 책이 얼마나 길어?",
        "W: 400쪽인데 한 달에 읽기로 했어.",
        "M: 바쁜 학생한테는 일주일에 100쪽이네.",
        "W: 투표할 때는 할 만해 보였어.",
        "M: 9월에 하는 투표는 늘 할 만해 보이지.",
        "W: 그러다 시험 있는 10월이 오고.",
        "M: 절반만 읽어 와도 모임이 굴러가?",
        "W: 아니. 10분이면 이야기가 끊겨.",
        "M: 다음엔 짧은 책이나 한 장만 읽어 봐.",
        "W: 그러면 모임이 살 것 같아, 제안해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Kiyoung, you've been running the school's second-hand book stall."],
        ["M", "Every Wednesday lunch, since the spring."],
        ["W", "Where do all the books come from?"],
        ["M", "Students leave them in a box outside the library."],
        ["W", "And what happens to the money you take?"],
        ["M", "It buys new books for the same library."],
        ["W", "How much has it come to so far?"],
        ["M", "Just over two hundred thousand won this year."],
        ["W", "That's more than I would have guessed."],
        ["M", "Most books sell for five hundred won, so it adds up slowly."],
        ["W", "Could I help you at the stall next Wednesday?"],
      ],
      choices: [
        "Of course, come at twelve thirty.",
        "The stall closed last month.",
        "I don't sell any books.",
        "You can't come to school.",
        "We stopped taking money.",
      ],
      answer: 1,
      clue: "Could I help you at the stall next Wednesday?",
      explanation:
        "여자가 다음 수요일에 돕겠다고 했으므로, 12시 30분에 오라는 ①이 가장 자연스럽다.",
      translation: [
        "W: 기영아, 학교 헌책 가판을 맡고 있다며.",
        "M: 봄부터 수요일 점심마다.",
        "W: 그 책들은 다 어디서 나와?",
        "M: 학생들이 도서관 앞 상자에 두고 가.",
        "W: 받은 돈은 어떻게 해?",
        "M: 그 도서관에 새 책을 사.",
        "W: 지금까지 얼마나 모였어?",
        "M: 올해 20만 원 조금 넘어.",
        "W: 생각보다 많다.",
        "M: 대부분 오백 원에 팔리니까 천천히 쌓여.",
        "W: 다음 수요일에 내가 도와도 돼?",
        "M: 그럼, 12시 30분에 와.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Jieun이 Minho에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Jieun : ________________",
      lines: [
        [
          "W",
          "Jieun and Minho are preparing a joint presentation for their history class. " +
            "They agreed that Minho would cover the causes and Jieun the results. " +
            "The night before, Minho sends Jieun his slides to look through. " +
            "She notices that he has copied three whole paragraphs from a website " +
            "without saying anywhere where they came from. " +
            "Their teacher has warned the class twice about exactly this. " +
            "Jieun wants him to add the source or rewrite the paragraphs himself. " +
            "In this situation, what would Jieun most likely say to Minho?",
        ],
      ],
      choices: [
        "Let's present next week instead.",
        "Your slides are far too short.",
        "You need to credit that website.",
        "I'll cover the causes as well.",
        "The teacher never checks slides.",
      ],
      answer: 3,
      clue: "Jieun wants him to add the source or rewrite the paragraphs himself.",
      explanation:
        "출처를 밝히지 않고 옮겨 왔으므로 출처를 적으라는 ③이 가장 적절하다.",
      translation: [
        "W: 지은이와 민호는 역사 수업 공동 발표를 준비하고 있습니다. 두 사람은 민호가 원인을, 지은이가 결과를 맡기로 했습니다. 발표 전날 밤 민호가 지은이에게 자기 발표 자료를 보내 봐 달라고 합니다. 지은이는 민호가 어느 누리집에서 세 문단을 통째로 옮겨 오고도 어디서 가져왔는지 적지 않은 것을 봅니다. 선생님은 바로 이 점을 두 번이나 경고하셨습니다. 지은이는 출처를 밝히거나 직접 다시 쓰기를 바랍니다. 이런 상황에서 지은이가 민호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to explain why a wet road looks black at night. " +
            "A dry road surface is rough at a very small scale, " +
            "and that roughness scatters the light from a headlamp in every direction, " +
            "including back towards the driver, which is how we see the road at all. " +
            "Rain fills the tiny hollows and lays a smooth film over the whole surface. " +
            "A smooth surface behaves like a mirror. " +
            "The light no longer scatters. It bounces forward at the same angle it arrived, " +
            "away from the driver and into the eyes of whoever is coming the other way. " +
            "The road itself sends almost nothing back, so it reads as a black band, " +
            "while every painted line and puddle glares. " +
            "That is why the same familiar street becomes hard to read in the rain.",
        ],
      ],
      choices: [
        "how road paint is made to last longer",
        "why a wet road looks black at night",
        "how headlamps are aimed in a car",
        "why rain makes tyres lose their grip",
        "how streetlights are spaced along a road",
      ],
      answer: 2,
      clue: "Rain fills the tiny hollows and lays a smooth film over the whole surface.",
      explanation:
        "남자는 비가 도로를 매끄럽게 만들어 빛이 운전자 쪽으로 되돌아오지 않는다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 젖은 도로가 밤에 왜 검게 보이는지 설명하려 합니다. 마른 노면은 아주 작은 규모에서 거칠고, 그 거칠기가 전조등 빛을 사방으로 흩뿌립니다. 운전자 쪽으로도 되돌려 보내지요. 그래서 우리가 길을 볼 수 있는 것입니다. 비는 그 작은 홈을 채우고 표면 전체에 매끄러운 막을 덮습니다. 매끄러운 면은 거울처럼 굴어서 빛이 더 이상 흩어지지 않습니다. 들어온 각도 그대로 앞으로 튀어 나가 운전자에게서 멀어지고, 맞은편에서 오는 사람의 눈으로 갑니다. 도로 자체는 거의 아무것도 되돌려 보내지 않아 검은 띠처럼 보이고, 칠해진 선과 물웅덩이만 번쩍입니다. 그래서 익숙한 길도 비가 오면 읽기 어려워집니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Today I want to explain why a wet road looks black at night."],
        ["M", "A dry road surface is rough at a very small scale."],
        ["M", "Rain fills the tiny hollows and lays a smooth film over the surface."],
        ["M", "A smooth surface behaves like a mirror."],
        ["M", "Every painted line and puddle glares."],
      ],
      choices: [
        "a dry road being rough at a small scale",
        "rain filling the tiny hollows",
        "a smooth surface behaving like a mirror",
        "painted lines and puddles glaring",
        "the speed limit on a wet road",
      ],
      answer: 5,
      clue: "A dry road surface is rough at a very small scale.",
      explanation:
        "마른 도로의 거칠기, 홈을 채우는 비, 거울처럼 구는 매끄러운 면, 번쩍이는 선과 웅덩이는 언급되지만 젖은 도로의 제한 속도는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
