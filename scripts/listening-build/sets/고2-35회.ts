/** 고2 듣기 35회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 35회",
  gradeLevel: "high2",
  speechSpeed: 0.8,
  folder: "고2 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good afternoon, students. This is Mr. Jang from the physical education office. " +
            "I want to explain what happens to the playground during the building work. " +
            "From Monday the northern half will be closed off with a fence, " +
            "which leaves us the track and about a third of the field. " +
            "Ball games will therefore move indoors for six weeks, " +
            "and each year group will have the gym on two fixed days. " +
            "The timetable goes up outside the equipment room on Friday. " +
            "Do not take a short cut through the fenced area, even when nobody is working. " +
            "The machines are left there overnight and the ground is uneven. Thank you.",
        ],
      ],
      choices: [
        "운동장 공사에 따른 변경 사항을 알리려고",
        "체육 대회 일정을 안내하려고",
        "동아리 모집을 알리려고",
        "체육복 착용을 당부하려고",
        "안전 교육 일정을 알리려고",
      ],
      answer: 1,
      clue: "From Monday the northern half will be closed off with a fence.",
      explanation:
        "남자는 공사로 운동장 절반이 막혀 구기 종목이 실내로 옮겨 간다고 알린다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 체육부 장 선생님입니다. 공사 기간 동안 운동장이 어떻게 되는지 설명드립니다. 월요일부터 북쪽 절반을 울타리로 막습니다. 그러면 트랙과 운동장의 3분의 1쯤이 남습니다. 그래서 구기 종목은 여섯 주 동안 실내로 옮기고, 학년마다 정해진 두 요일에 체육관을 씁니다. 시간표는 금요일에 기구실 앞에 붙입니다. 아무도 일하지 않는 때라도 울타리 안으로 질러가지 마세요. 기계를 밤새 그곳에 두고 바닥도 고르지 않습니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Seoyun, I've joined four clubs this term."],
        ["W", "Four? How many hours does that come to?"],
        ["M", "About seven a week, spread over five days."],
        ["W", "And how much have you done in any one of them?"],
        ["M", "I turn up and help with whatever is happening."],
        ["W", "So you've been a visitor in four rooms."],
        ["M", "That seems harsh. I'm a member of all of them."],
        ["W", "Being on a list is not the same as belonging somewhere."],
        ["M", "I didn't want to miss anything."],
        ["W", "You've missed the only thing that mattered, which is depth."],
        ["M", "So I should drop three and stay in one?"],
        ["W", "Stay in one long enough to be trusted with something."],
      ],
      choices: [
        "여러 동아리를 경험해야 한다",
        "한 곳에 오래 머물러야 한다",
        "동아리는 성적과 관련 있어야 한다",
        "동아리 활동 시간을 줄여야 한다",
        "친구와 같은 동아리에 들어야 한다",
      ],
      answer: 2,
      clue: "Stay in one long enough to be trusted with something.",
      explanation:
        "여자는 여러 곳을 스쳐 지나는 대신 한 곳에 오래 머물러야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 서윤아, 이번 학기에 동아리 네 개에 들어갔어.",
        "W: 네 개? 다 합쳐 몇 시간인데?",
        "M: 닷새에 나눠서 일주일에 일곱 시간쯤.",
        "W: 그중 한 곳에서 실제로 한 일은 얼마나 돼?",
        "M: 가서 그날 하는 일을 거들어.",
        "W: 그럼 네 방을 손님으로 다닌 거네.",
        "M: 심하다. 나는 다 부원인데.",
        "W: 명단에 있는 것과 어딘가에 속하는 건 달라.",
        "M: 뭐든 놓치기 싫었어.",
        "W: 정작 중요한 하나를 놓쳤어. 깊이 말이야.",
        "M: 그럼 세 개를 빼고 하나만 남기라는 거야?",
        "W: 뭔가를 맡길 만큼 신뢰받을 때까지 한 곳에 있어 봐.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Most arguments between friends are not about what they appear to be about. " +
            "Two people argue about who forgot to send a message, " +
            "when the real matter is that one of them felt left out last week. " +
            "If you answer only the surface, you will win the point and lose the evening, " +
            "because the thing underneath has not been touched at all. " +
            "Ask a gentle question instead of a sharp answer. " +
            "Nine times out of ten the second sentence they say " +
            "is closer to the truth than the first one was.",
        ],
      ],
      choices: [
        "다툼은 빨리 끝내야 한다",
        "다툴 때는 겉으로 드러난 말 뒤의 이유를 물어야 한다",
        "친구와는 다투지 말아야 한다",
        "사과를 먼저 해야 한다",
        "다툰 일은 기록해 두어야 한다",
      ],
      answer: 2,
      clue: "Ask a gentle question instead of a sharp answer.",
      explanation:
        "남자는 겉으로 드러난 말만 받아치지 말고 그 뒤의 이유를 물으라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 친구 사이의 다툼은 대개 겉으로 보이는 그 일에 관한 것이 아닙니다. 누가 연락을 깜빡했는지를 두고 다투지만, 진짜 문제는 지난주에 한 사람이 소외감을 느꼈다는 것입니다. 표면만 받아치면 말싸움은 이기고 저녁은 잃습니다. 아래에 있는 것은 건드리지도 못했기 때문입니다. 날 선 대답 대신 부드러운 질문을 하세요. 열에 아홉은 상대가 말하는 두 번째 문장이 첫 번째 문장보다 진실에 가깝습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Minjun, is this the art room after the refit?"],
        ["M", "Yes, the last table went in on Monday."],
        ["W", "A wide sink runs along the back wall."],
        ["M", "Six people can wash brushes there at once."],
        ["W", "There's a tall easel standing on the left."],
        ["M", "We keep the one unfinished painting on it."],
        ["W", "Two square tables stand in the middle of the floor."],
        ["M", "They're round, actually. The square ones went to the club room."],
        ["W", "A shelf of paint jars covers the right wall."],
        ["M", "Sorted by colour, and it never stays that way."],
        ["W", "And a long striped curtain hangs across the window."],
        ["M", "It stops the afternoon sun from bleaching the paper."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "They're round, actually. The square ones went to the club room.",
      explanation:
        "여자가 네모난 탁자라고 하자 남자가 둥근 탁자라고 바로잡는다. 그림에는 네모난 탁자가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.42],
          [0.1, 0.36],
          [0.45, 0.78],
          [0.88, 0.45],
          [0.66, 0.12],
        ],
        scene:
          "A school art room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A WIDE SINK with several taps runs along the BACK wall. " +
          "A TALL EASEL holding a blank canvas stands on the LEFT side of the room. " +
          "EXACTLY TWO SQUARE TABLES with straight edges and four corners stand in the MIDDLE of the floor, " +
          "well apart from each other so both shapes are easy to see. " +
          "A SHELF full of PAINT JARS covers the RIGHT wall. " +
          "A LONG CURTAIN with bold STRIPES hangs across a window in the upper right of the back wall.",
      },
      translation: [
        "W: 민준아, 여기가 새로 고친 미술실이야?",
        "M: 응, 마지막 탁자가 월요일에 들어왔어.",
        "W: 뒷벽을 따라 넓은 싱크대가 있네.",
        "M: 여섯 명이 한꺼번에 붓을 씻을 수 있어.",
        "W: 왼쪽에는 키 큰 이젤이 서 있고.",
        "M: 아직 안 끝낸 그림을 거기 올려 둬.",
        "W: 바닥 한가운데에 네모난 탁자가 두 개 있네.",
        "M: 사실 둥근 거야. 네모난 건 동아리방으로 갔어.",
        "W: 오른쪽 벽은 물감 통 선반이 덮고 있어.",
        "M: 색깔별로 정리하는데 그대로 있는 법이 없어.",
        "W: 그리고 창문에는 긴 줄무늬 커튼이 쳐져 있네.",
        "M: 오후 햇빛에 종이가 바래지 않게 해 줘.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaeyeon, the exchange visit is on Wednesday morning."],
        ["W", "Are the host families all arranged now?"],
        ["M", "Nine of them were, and the tenth confirmed last night."],
        ["W", "That's a relief after waiting three weeks."],
        ["M", "They were away on holiday until Sunday."],
        ["W", "And what about the welcome presentation?"],
        ["M", "The slides are finished and the music has been chosen."],
        ["W", "Then almost everything is ready for Wednesday."],
        ["M", "Except the name badges. Nobody has made them yet."],
        ["W", "How many of those do we need altogether?"],
        ["M", "Twenty, ten for the guests and ten for the hosts."],
        ["W", "Do they need the school name printed on them?"],
        ["M", "Both school names, and the student's own name underneath."],
        ["W", "I'll make the twenty name badges tonight."],
      ],
      choices: [
        "발표 자료를 만들기",
        "가정에 연락하기",
        "이름표를 만들기",
        "음악을 고르기",
        "손님을 마중하기",
      ],
      answer: 3,
      clue: "I'll make the twenty name badges tonight.",
      explanation:
        "여자는 오늘 밤에 이름표 스무 개를 만들겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 채연아, 교류 방문이 수요일 아침이야.",
        "W: 이제 머물 가정은 다 정해졌어?",
        "M: 아홉 집은 정해졌고 열 번째는 어젯밤에 확정됐어.",
        "W: 삼 주나 기다렸는데 다행이다.",
        "M: 일요일까지 휴가로 집을 비우셨대.",
        "W: 환영 발표는?",
        "M: 자료도 끝났고 음악도 다 골랐어.",
        "W: 그럼 수요일 준비는 거의 다 됐네.",
        "M: 이름표만 빼고. 아직 아무도 안 만들었어.",
        "W: 그건 모두 몇 개 필요해?",
        "M: 스무 개. 손님 열, 우리 쪽 열.",
        "W: 학교 이름도 찍어야 해?",
        "M: 두 학교 이름 다. 그 아래에 학생 이름.",
        "W: 오늘 밤에 이름표 스무 개 만들게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good morning. Are you booking the seminar room?"],
        ["M", "Yes, for a club meeting this Saturday."],
        ["W", "The eight person room is twenty-five dollars for three hours."],
        ["M", "We'll be twelve, so we need the bigger one."],
        ["W", "The twelve person room is thirty-five dollars for three hours."],
        ["M", "Do we pay more for a fourth hour?"],
        ["W", "Each extra hour is ten dollars."],
        ["M", "Four hours in the larger room, then."],
        ["W", "Would you like the tea and coffee set?"],
        ["M", "No, we'll bring our own drinks."],
        ["W", "School clubs get ten percent off the room charge."],
        ["M", "Here is the club card, then."],
      ],
      choices: ["$40.50", "$45", "$41.50", "$38", "$50"],
      answer: 1,
      clue: "The twelve person room is thirty-five dollars for three hours.",
      explanation:
        "12인실 네 시간은 45달러이고 학교 동아리 10퍼센트를 빼면 40달러 50센트이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 세미나실 예약하시나요?",
        "M: 네, 이번 토요일 동아리 모임으로요.",
        "W: 8인실은 세 시간에 25달러입니다.",
        "M: 저희는 열두 명이라 더 큰 방이 필요해요.",
        "W: 12인실은 세 시간에 35달러입니다.",
        "M: 네 시간째는 돈을 더 내야 하나요?",
        "W: 한 시간 더 쓸 때마다 10달러입니다.",
        "M: 그럼 큰 방으로 네 시간이요.",
        "W: 차와 커피 세트도 드릴까요?",
        "M: 아니요, 마실 건 저희가 가져와요.",
        "W: 학교 동아리는 방값에서 10퍼센트를 빼 드립니다.",
        "M: 그럼 여기 동아리 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 동아리 발표를 미룬 이유를 고르시오.",
      lines: [
        ["W", "Dohyun, you moved the club presentation to next week?"],
        ["M", "I did, and everyone agreed to it."],
        ["W", "Were the slides not ready in time?"],
        ["M", "They were finished on Sunday, all thirty of them."],
        ["W", "Then is somebody in the team away?"],
        ["M", "No, the hall has no working projector until Friday."],
        ["W", "I thought they fixed it last month."],
        ["M", "They fixed the sound. The lamp is the new problem."],
        ["W", "And a presentation without slides is not much use."],
        ["M", "Not with thirty pictures and almost no text."],
      ],
      choices: [
        "발표 자료가 안 끝나서",
        "팀원이 빠져서",
        "강당 영사기가 고장 나서",
        "시험이 겹쳐서",
        "장소를 못 빌려서",
      ],
      answer: 3,
      clue: "No, the hall has no working projector until Friday.",
      explanation:
        "남자는 금요일까지 강당 영사기를 쓸 수 없어서 발표를 미뤘다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 도현아, 동아리 발표를 다음 주로 옮겼어?",
        "M: 응, 다들 동의했어.",
        "W: 자료가 제때 안 됐어?",
        "M: 일요일에 서른 장 다 끝냈어.",
        "W: 그럼 팀에 빠진 사람이 있어?",
        "M: 아니, 금요일까지 강당 영사기를 쓸 수 없어.",
        "W: 지난달에 고친 줄 알았는데.",
        "M: 소리를 고친 거야. 이번엔 램프가 문제야.",
        "W: 자료 없이 발표하면 소용없지.",
        "M: 그림이 서른 장이고 글은 거의 없는데 더 그렇지.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 영어 연극 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Sangmin, is your class entering the English drama contest?"],
        ["M", "We are, and we chose the script two weeks ago."],
        ["W", "When exactly is the contest held?"],
        ["M", "On the twelfth, starting straight after lunch."],
        ["W", "How long can each class perform for?"],
        ["M", "Twelve minutes, and they stop you at thirteen."],
        ["W", "Is it in the hall or somewhere else?"],
        ["M", "In the hall, with the curtains and the stage lights."],
        ["W", "Do you have to write the script yourselves?"],
        ["M", "You may adapt a published play, as long as you say so."],
        ["W", "Then your class should do well this year."],
      ],
      choices: ["대회 날짜", "공연 시간의 길이", "공연하는 곳", "대본을 정하는 방법", "심사하는 사람"],
      answer: 5,
      clue: "On the twelfth, starting straight after lunch.",
      explanation:
        "날짜, 공연 길이, 장소, 대본은 말했지만 심사하는 사람은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 상민아, 너희 반 영어 연극 대회 나가?",
        "M: 나가. 두 주 전에 대본도 정했어.",
        "W: 대회는 정확히 언제야?",
        "M: 12일. 점심 끝나고 바로 시작해.",
        "W: 한 반이 몇 분 공연할 수 있어?",
        "M: 12분. 13분이면 끊어.",
        "W: 강당에서 해, 다른 데서 해?",
        "M: 강당에서. 막이랑 무대 조명도 써.",
        "W: 대본은 직접 써야 해?",
        "M: 밝히기만 하면 이미 나온 희곡을 고쳐 써도 돼.",
        "W: 그럼 올해 너희 반 잘하겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Hillside Community Garden에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is some information about the Hillside Community Garden, which opened four years ago. " +
            "The garden lies on the slope behind the primary school. " +
            "It is divided into forty small plots, and each family may rent one. " +
            "A plot costs thirty thousand won a year, and the waiting list is about six months. " +
            "Water taps are placed every ten metres along the main path. " +
            "Tools are kept in the shared shed and may be used by anyone with a plot. " +
            "Chemical sprays are not allowed anywhere in the garden. " +
            "The garden is open from sunrise to sunset, every day of the year.",
        ],
      ],
      choices: [
        "초등학교 뒤 비탈에 있다",
        "구획이 마흔 개로 나뉘어 있다",
        "연간 이용료는 3만 원이다",
        "연장은 각자 가져와야 한다",
        "농약은 쓸 수 없다",
      ],
      answer: 4,
      clue: "Tools are kept in the shared shed and may be used by anyone with a plot.",
      explanation:
        "연장은 공동 창고에 있어 구획이 있는 사람은 누구나 쓸 수 있다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "M: 4년 전에 문을 연 힐사이드 공동 텃밭에 대해 알려 드립니다. 텃밭은 초등학교 뒤 비탈에 있습니다. 작은 구획 마흔 개로 나뉘어 있고 한 가정이 하나씩 빌릴 수 있습니다. 한 구획은 1년에 3만 원이고 대기는 여섯 달쯤 됩니다. 물꼭지는 큰길을 따라 10미터마다 있습니다. 연장은 공동 창고에 있고 구획이 있는 사람은 누구나 쓸 수 있습니다. 텃밭 어디에서도 농약은 쓸 수 없습니다. 텃밭은 해 뜰 때부터 해 질 때까지 일 년 내내 엽니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 구입할 전자사전을 고르시오.",
      lines: [
        ["M", "Hayoon, these five electronic dictionaries are in stock."],
        ["W", "I've been saving up for one since the spring."],
        ["M", "Then let's narrow it down. What's your limit?"],
        ["W", "A hundred and fifty thousand won at the very most."],
        ["M", "That takes out the most expensive one."],
        ["W", "And the battery should last more than a week."],
        ["M", "One of the four left runs for only three days."],
        ["W", "I also want one that holds a Korean and a Japanese dictionary."],
        ["M", "Two of the remaining three have English only."],
        ["W", "So there's just one left for me."],
        ["M", "I'd buy it before the autumn sale ends."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "A hundred and fifty thousand won at the very most.",
      explanation:
        "15만 원 이하, 배터리 일주일 이상, 일본어까지 들어 있는 것을 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Price: 180,000 won / Battery: 10 days / Languages: 3" },
          { no: 2, label: "②", value: "Price: 145,000 won / Battery: 12 days / Languages: 3" },
          { no: 3, label: "③", value: "Price: 120,000 won / Battery: 3 days / Languages: 3" },
          { no: 4, label: "④", value: "Price: 99,000 won / Battery: 8 days / Languages: 1" },
          { no: 5, label: "⑤", value: "Price: 130,000 won / Battery: 9 days / Languages: 1" },
        ],
      },
      translation: [
        "M: 하윤아, 이 다섯 개가 재고에 있어.",
        "W: 봄부터 하나 사려고 돈 모았어.",
        "M: 그럼 줄여 보자. 얼마까지 쓸 수 있어?",
        "W: 아무리 많아야 15만 원.",
        "M: 그럼 제일 비싼 건 빠지네.",
        "W: 그리고 배터리가 일주일 넘게 가야 해.",
        "M: 남은 넷 중 하나는 사흘밖에 안 가.",
        "W: 국어랑 일본어 사전이 같이 든 것이면 좋겠어.",
        "M: 남은 셋 중 둘은 영어만 들어 있어.",
        "W: 그럼 나한테 남는 건 하나뿐이네.",
        "M: 가을 할인 끝나기 전에 사는 게 좋겠어.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Naeun, did you book the lab for Thursday?"],
        ["W", "I filled in the form but never sent it."],
        ["M", "The office closes at four thirty today."],
        ["W", "The form is still on my desk."],
        ["M", "Shall I take it down for you?"],
      ],
      choices: [
        "The lab is already booked.",
        "Yes, please, it's in the blue file.",
        "I don't need the lab.",
        "The office never closes.",
        "You should fill in the form.",
      ],
      answer: 2,
      clue: "Shall I take it down for you?",
      explanation:
        "대신 가져다줄지 물었으므로, 파란 서류철에 있다고 알려 주는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나은아, 목요일에 실험실 예약했어?",
        "W: 신청서는 썼는데 안 냈어.",
        "M: 오늘 행정실이 4시 30분에 닫아.",
        "W: 신청서는 아직 내 책상에 있어.",
        "M: 내가 대신 갖다줄까?",
        "W: 응, 부탁해. 파란 서류철에 있어.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junseo, are you staying for the study session?"],
        ["M", "Until about eight, if the room stays open."],
        ["W", "Could you keep the seat next to you?"],
        ["M", "How late will you be?"],
        ["W", "About twenty minutes. I have to see my teacher."],
      ],
      choices: [
        "The room is closed already.",
        "No problem, I'll save it.",
        "I'm going home now.",
        "You should sit elsewhere.",
        "The session was cancelled.",
      ],
      answer: 2,
      clue: "About twenty minutes. I have to see my teacher.",
      explanation:
        "20분 늦는다며 자리를 맡아 달라고 했으므로, 맡아 주겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준서야, 자습 시간에 남아?",
        "M: 교실이 열려 있으면 여덟 시쯤까지.",
        "W: 네 옆자리 좀 맡아 줄래?",
        "M: 얼마나 늦어?",
        "W: 20분쯤. 선생님을 뵈어야 해.",
        "M: 문제없어, 맡아 놓을게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taeyang, how is the school band doing this term?"],
        ["M", "We practise twice a week, but we never finish a song."],
        ["W", "What stops you from finishing one?"],
        ["M", "Somebody always wants to go back to the beginning."],
        ["W", "Because of a mistake in the first few bars?"],
        ["M", "Usually, and then we play the opening ten times."],
        ["W", "So the last half of every song is never practised."],
        ["M", "Which is exactly where we fall apart on stage."],
        ["W", "Have you tried starting the rehearsal from the end?"],
        ["M", "Starting from the end sounds strange."],
        ["W", "Play the last section first, while everyone is still fresh."],
      ],
      choices: [
        "We have no songs to play.",
        "The band stopped meeting.",
        "That's worth trying, I'll suggest it.",
        "We always finish our songs.",
        "You should join the band.",
      ],
      answer: 3,
      clue: "Play the last section first, while everyone is still fresh.",
      explanation:
        "마지막 부분부터 연습하라는 제안이므로, 해 볼 만하다며 제안하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 태양아, 이번 학기 밴드는 어때?",
        "M: 일주일에 두 번 연습하는데 곡을 끝까지 못 가.",
        "W: 왜 못 끝내는데?",
        "M: 누군가 늘 처음부터 다시 하자고 해.",
        "W: 앞부분에서 틀려서?",
        "M: 보통 그래. 그러다 앞부분만 열 번 쳐.",
        "W: 그럼 모든 곡의 뒤 절반은 연습을 못 하네.",
        "M: 무대에서 무너지는 데가 딱 거기야.",
        "W: 연습을 끝에서부터 시작해 본 적 있어?",
        "M: 끝에서 시작한다는 게 좀 이상한데.",
        "W: 다들 아직 쌩쌩할 때 마지막 부분부터 쳐 봐.",
        "M: 해 볼 만하다, 제안해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaewon, you've been cycling to the library on Sundays."],
        ["W", "Since March. It takes about twenty minutes."],
        ["M", "Why not use the one near your house?"],
        ["W", "The small one closes at five, and this one at nine."],
        ["M", "Four extra hours is worth a ride, I suppose."],
        ["W", "And there's a room where you can talk quietly."],
        ["M", "That would be useful for group work."],
        ["W", "We booked it three times last month."],
        ["M", "How far ahead do you have to book?"],
        ["W", "A week, and Sunday afternoons go first."],
        ["M", "Could you show me how to book it?"],
      ],
      choices: [
        "Sure, bring your phone tomorrow.",
        "I never book that room.",
        "The library closed last year.",
        "You should go on Saturday.",
        "I don't have a bicycle.",
      ],
      answer: 1,
      clue: "Could you show me how to book it?",
      explanation:
        "예약하는 법을 보여 달라고 했으므로, 내일 휴대폰을 가져오라는 ①이 가장 자연스럽다.",
      translation: [
        "M: 채원아, 일요일마다 자전거로 도서관에 간다며.",
        "W: 3월부터. 20분쯤 걸려.",
        "M: 집 근처 도서관은 왜 안 가?",
        "W: 작은 데는 다섯 시에 닫는데 거기는 아홉 시에 닫아.",
        "M: 네 시간이면 자전거 탈 만하네.",
        "W: 게다가 조용히 말할 수 있는 방이 있어.",
        "M: 조별 과제에 좋겠다.",
        "W: 지난달에 세 번 예약했어.",
        "M: 얼마나 미리 예약해야 해?",
        "W: 일주일. 일요일 오후가 제일 먼저 나가.",
        "M: 예약하는 법 좀 보여 줄래?",
        "W: 그럼, 내일 휴대폰 가져와.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Jieun이 Woohyuk에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Jieun : ________________",
      lines: [
        [
          "W",
          "Jieun and Woohyuk are preparing the school's volunteer day together. " +
            "Forty students have signed up to clean the riverside path on Saturday. " +
            "Woohyuk has ordered forty pairs of thin cotton gloves for the work. " +
            "Jieun remembers that last year the path was covered in broken glass, " +
            "and two students cut their hands through exactly that kind of glove. " +
            "She thinks they must order thick working gloves instead. " +
            "The order can still be changed until five this afternoon. " +
            "In this situation, what would Jieun most likely say to Woohyuk?",
        ],
      ],
      choices: [
        "Let's cancel the volunteer day.",
        "Forty students is far too many.",
        "Change the order to thick gloves.",
        "I'll bring my own gloves on Saturday.",
        "The path was clean last year.",
      ],
      answer: 3,
      clue: "She thinks they must order thick working gloves instead.",
      explanation:
        "얇은 장갑으로는 유리에 손을 베므로 두꺼운 작업 장갑으로 바꾸자는 뜻이다. 따라서 답은 ③이다.",
      translation: [
        "W: 지은이와 우혁이는 학교 봉사의 날을 함께 준비하고 있습니다. 토요일에 강변길을 청소하겠다고 마흔 명이 신청했습니다. 우혁이는 그 일에 쓸 얇은 면장갑 마흔 켤레를 주문했습니다. 지은이는 작년에 그 길에 깨진 유리가 널려 있었고, 바로 그런 장갑을 뚫고 두 학생이 손을 베었던 것을 기억합니다. 지은이는 두꺼운 작업 장갑으로 주문해야 한다고 생각합니다. 주문은 오늘 오후 다섯 시까지 바꿀 수 있습니다. 이런 상황에서 지은이가 우혁이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to explain why old photographs turn yellow. " +
            "A printed photograph is not a picture sitting on top of paper. " +
            "It is a thin layer of gelatine holding millions of tiny grains of silver, " +
            "and that layer is alive to everything around it. " +
            "Light breaks some of the dyes apart, which is why a photograph left in a window fades first. " +
            "Air is the second attacker. Oxygen and traces of sulphur in ordinary room air " +
            "slowly change the silver into compounds with a brown or yellow colour. " +
            "Heat speeds both processes up, and damp lets mould into the gelatine itself. " +
            "This is why an album in a cool dark drawer outlives one on a bright shelf " +
            "by a great many years.",
        ],
      ],
      choices: [
        "how a camera captures an image",
        "why old printed photographs turn yellow",
        "how photographs are copied onto paper",
        "why black and white film was replaced",
        "how museums light their exhibitions",
      ],
      answer: 2,
      clue: "Air is the second attacker.",
      explanation:
        "남자는 빛과 공기, 열과 습기가 사진의 은과 젤라틴을 바꾸어 누렇게 만든다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 오래된 사진이 왜 누렇게 변하는지 설명하려 합니다. 인화된 사진은 종이 위에 얹힌 그림이 아닙니다. 아주 작은 은 알갱이 수백만 개를 붙들고 있는 얇은 젤라틴 층이고, 그 층은 둘레의 모든 것에 민감합니다. 빛은 색소를 일부 부수는데, 그래서 창가에 둔 사진이 먼저 바랩니다. 두 번째 공격자는 공기입니다. 보통 실내 공기 속 산소와 미량의 황이 은을 갈색이나 노란색을 띠는 화합물로 천천히 바꿉니다. 열은 두 과정을 모두 빠르게 하고, 습기는 젤라틴 안으로 곰팡이를 들입니다. 그래서 서늘하고 어두운 서랍 속 앨범이 밝은 선반 위 앨범보다 아주 여러 해를 더 삽니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Today I want to explain why old photographs turn yellow."],
        ["M", "It is a thin layer of gelatine holding millions of tiny grains of silver."],
        ["M", "Light breaks some of the dyes apart."],
        ["M", "Oxygen and traces of sulphur slowly change the silver."],
        ["M", "Damp lets mould into the gelatine itself."],
      ],
      choices: [
        "a gelatine layer holding grains of silver",
        "light breaking some of the dyes apart",
        "oxygen and sulphur changing the silver",
        "damp letting mould into the gelatine",
        "the price of photographic paper",
      ],
      answer: 5,
      clue: "It is a thin layer of gelatine holding millions of tiny grains of silver.",
      explanation:
        "은 알갱이를 붙든 젤라틴 층, 색소를 부수는 빛, 은을 바꾸는 산소와 황, 곰팡이를 들이는 습기는 언급되지만 인화지의 값은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
