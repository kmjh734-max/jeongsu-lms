/** 고2 듣기 40회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 40회",
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
          "Good afternoon, students. This is Ms. Seo from the second year office. " +
            "I want to explain how the class trip rooms will be arranged this year. " +
            "In previous years students chose their own rooms on the morning of the trip, " +
            "and every year a handful of people were left standing in the corridor. " +
            "This year you will write three names you would like to share with, " +
            "and we will match the lists before we leave. " +
            "Nobody will be told who asked for whom, and nobody will be left to ask in public. " +
            "The slips go out in homeroom tomorrow and come back on Friday. " +
            "If you would rather we placed you, leave the slip blank and hand it in. Thank you.",
        ],
      ],
      choices: [
        "수학여행 방 배정 방식을 안내하려고",
        "수학여행 일정을 알리려고",
        "여행 경비를 안내하려고",
        "준비물을 알리려고",
        "안전 규칙을 설명하려고",
      ],
      answer: 1,
      clue: "This year you will write three names you would like to share with.",
      explanation:
        "여자는 올해 방 배정을 미리 적어 낸 이름으로 맞춘다고 안내한다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 2학년 교무실 서 선생님입니다. 올해 수학여행 방을 어떻게 배정하는지 설명드립니다. 지난 몇 해 동안은 여행 가는 날 아침에 학생들이 직접 방을 정했고, 해마다 몇 사람은 복도에 서 있게 되었습니다. 올해는 같이 쓰고 싶은 이름을 세 명 적어 내면, 떠나기 전에 저희가 그 목록을 맞춥니다. 누가 누구를 적었는지는 아무에게도 알리지 않고, 사람들 앞에서 묻게 되는 일도 없습니다. 쪽지는 내일 조회 시간에 나눠 주고 금요일에 걷습니다. 저희가 정해 주기를 바란다면 빈칸으로 내 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Dohyun, I've been studying with music, videos and my phone nearby."],
        ["M", "All three at once, in the same hour?"],
        ["W", "It makes the work less lonely."],
        ["M", "And how much do you finish in that hour?"],
        ["W", "About half of what I planned, if I'm honest."],
        ["M", "So the company costs you thirty minutes a day."],
        ["W", "But working in silence is unbearable."],
        ["M", "Then keep the music and move the phone to another room."],
        ["W", "Why the phone rather than the music?"],
        ["M", "Because the music never asks you a question."],
        ["W", "And the phone interrupts whether I answer or not."],
        ["M", "Remove the one thing that talks back. That's the whole rule."],
      ],
      choices: [
        "공부할 때는 완전히 조용해야 한다",
        "방해가 되는 것 하나만 치워도 된다",
        "공부 시간을 짧게 나눠야 한다",
        "음악은 절대 듣지 말아야 한다",
        "친구와 함께 공부해야 한다",
      ],
      answer: 2,
      clue: "Remove the one thing that talks back. That's the whole rule.",
      explanation:
        "남자는 되묻는 것 하나, 곧 휴대폰만 치우면 된다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 도현아, 나는 음악이랑 영상이랑 휴대폰을 옆에 두고 공부해.",
        "M: 같은 한 시간에 셋 다?",
        "W: 그래야 덜 외로워.",
        "M: 그 한 시간에 얼마나 끝내는데?",
        "W: 솔직히 계획한 것의 절반쯤.",
        "M: 그럼 그 동무들 값이 하루 30분이네.",
        "W: 그래도 조용한 데서는 못 견디겠어.",
        "M: 그럼 음악은 두고 휴대폰만 다른 방으로 옮겨.",
        "W: 왜 음악이 아니라 휴대폰이야?",
        "M: 음악은 너한테 질문을 하지 않으니까.",
        "W: 휴대폰은 내가 답하든 말든 끼어들지.",
        "M: 되묻는 것 하나만 치워. 규칙은 그게 다야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We praise people for being busy, and busy is not the same as useful. " +
            "A day can be full from morning to night " +
            "and leave nothing behind that anyone will notice next week. " +
            "Before you add another thing to the list, ask what it is for. " +
            "If the honest answer is that it fills a gap, take it off. " +
            "A short list that you finish teaches you more about yourself " +
            "than a long one you carry around unfinished for a month. " +
            "Doing less is not laziness. It is the only way to see what your work is worth.",
        ],
      ],
      choices: [
        "일정을 촘촘히 채워야 한다",
        "할 일을 줄이고 끝내야 한다",
        "계획은 아침에 세워야 한다",
        "바쁜 사람을 본받아야 한다",
        "여러 일을 동시에 해야 한다",
      ],
      answer: 2,
      clue: "A short list that you finish teaches you more about yourself.",
      explanation:
        "여자는 바쁜 것과 쓸모 있는 것은 다르다며 할 일을 줄여 끝내라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 우리는 바쁜 사람을 칭찬하지만, 바쁜 것과 쓸모 있는 것은 다릅니다. 하루가 아침부터 밤까지 꽉 차 있어도 다음 주에 누가 알아볼 만한 것은 아무것도 남지 않을 수 있습니다. 목록에 무언가를 더하기 전에 그것이 무엇을 위한 것인지 물으세요. 솔직한 답이 빈자리를 채우기 위해서라면 빼 버리세요. 끝까지 해내는 짧은 목록이, 한 달 동안 끝내지 못한 채 들고 다니는 긴 목록보다 자신에 대해 더 많이 가르쳐 줍니다. 덜 하는 것은 게으름이 아닙니다. 자기 일이 얼마나 값어치 있는지 볼 수 있는 유일한 방법입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Hayoon, is this the school café you helped set up?"],
        ["W", "Yes, we served the first drinks in September."],
        ["M", "A long counter runs across the back of the room."],
        ["W", "Three of us can work behind it at once."],
        ["M", "There's a round wall clock above the counter."],
        ["W", "We close at four, whatever the queue looks like."],
        ["M", "A tall plant stands in the left corner."],
        ["W", "It survived the summer holiday somehow."],
        ["M", "Four square tables stand in the middle of the floor."],
        ["W", "They're round, actually. The square ones wouldn't fit."],
        ["M", "And a noticeboard hangs on the right wall."],
        ["W", "The week's drinks go up on it every Monday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "They're round, actually. The square ones wouldn't fit.",
      explanation:
        "남자가 네모난 탁자라고 하자 여자가 둥근 탁자라고 바로잡는다. 그림에는 네모난 탁자가 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.36],
          [0.5, 0.07],
          [0.08, 0.4],
          [0.45, 0.78],
          [0.89, 0.32],
        ],
        scene:
          "A small school café drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A LONG COUNTER runs across the BACK of the room from left to right. " +
          "A ROUND WALL CLOCK hangs on the back wall directly above the counter. " +
          "A TALL POTTED PLANT stands in the LEFT corner of the room. " +
          "EXACTLY FOUR SQUARE TABLES with straight edges and four corners stand in the MIDDLE of the floor, " +
          "well apart from one another so all four shapes are easy to see and count. " +
          "A RECTANGULAR NOTICEBOARD hangs on the RIGHT wall.",
      },
      translation: [
        "M: 하윤아, 여기가 네가 여는 걸 도운 학교 카페야?",
        "W: 응, 9월에 처음 음료를 팔았어.",
        "M: 방 뒤쪽을 가로질러 긴 계산대가 있네.",
        "W: 뒤에서 셋이 한꺼번에 일할 수 있어.",
        "M: 계산대 위에는 둥근 벽시계가 있고.",
        "W: 줄이 아무리 길어도 네 시에 닫아.",
        "M: 왼쪽 구석에는 키 큰 화분이 있어.",
        "W: 여름 방학을 어떻게든 버텨 냈어.",
        "M: 바닥 한가운데에는 네모난 탁자가 네 개 있네.",
        "W: 사실 둥근 거야. 네모난 건 자리가 안 나왔어.",
        "M: 그리고 오른쪽 벽에는 게시판이 걸려 있어.",
        "W: 월요일마다 그 주 음료를 붙여.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junseo, the school quiz night is on Friday evening."],
        ["M", "Have the teams all registered?"],
        ["W", "Sixteen teams, and the last one signed up this morning."],
        ["M", "What about the hall and the seating?"],
        ["W", "Booked, and the caretaker sets out the tables at four."],
        ["M", "Then the main pieces are ready."],
        ["W", "Except the questions. We have sixty and we need ninety."],
        ["M", "Didn't three people write twenty each?"],
        ["W", "Two of them did. The third never sent anything."],
        ["M", "So thirty questions are missing."],
        ["W", "And they have to be checked before Friday."],
        ["M", "I'll write the thirty missing questions tonight."],
      ],
      choices: [
        "팀을 모으기",
        "강당을 예약하기",
        "빠진 문제를 쓰기",
        "탁자를 놓기",
        "심사위원을 부르기",
      ],
      answer: 3,
      clue: "I'll write the thirty missing questions tonight.",
      explanation:
        "남자는 오늘 밤에 빠진 문제 서른 개를 쓰겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 준서야, 학교 퀴즈의 밤이 금요일 저녁이야.",
        "M: 팀은 다 등록했어?",
        "W: 열여섯 팀. 마지막 팀이 오늘 아침에 신청했어.",
        "M: 강당이랑 자리는?",
        "W: 예약했고 관리인 아저씨가 네 시에 탁자를 놔 주셔.",
        "M: 그럼 큰 건 다 됐네.",
        "W: 문제만 빼고. 예순 개 있는데 아흔 개가 필요해.",
        "M: 세 명이 스무 개씩 쓰기로 하지 않았어?",
        "W: 둘은 썼어. 세 번째 사람이 아무것도 안 보냈어.",
        "M: 그럼 서른 개가 모자라네.",
        "W: 게다가 금요일 전에 검토도 해야 해.",
        "M: 오늘 밤에 빠진 서른 개를 쓸게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Good afternoon. Are you here about the banner printing?"],
        ["W", "Yes, we need one for the school festival."],
        ["M", "A two metre banner is thirty dollars."],
        ["W", "We'd like a four metre one, if you make them."],
        ["M", "A four metre banner is fifty dollars."],
        ["W", "Do you charge extra for eyelets along the edge?"],
        ["M", "Eyelets are six dollars for the whole banner."],
        ["W", "We'll need those, since it hangs outdoors."],
        ["M", "Would you like it delivered to the school?"],
        ["W", "No, we'll collect it on Thursday."],
        ["M", "Then I can take eight dollars off for collection."],
        ["W", "Here is the school card, then."],
      ],
      choices: ["$48", "$56", "$50", "$44", "$62"],
      answer: 1,
      clue: "A four metre banner is fifty dollars.",
      explanation:
        "4미터 현수막 50달러에 고리 6달러를 더하면 56달러이고, 직접 찾아가 8달러를 빼면 48달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요. 현수막 인쇄 때문에 오셨나요?",
        "W: 네, 학교 축제에 쓸 게 하나 필요해요.",
        "M: 2미터짜리는 30달러입니다.",
        "W: 만드신다면 4미터짜리로요.",
        "M: 4미터짜리는 50달러입니다.",
        "W: 가장자리에 고리를 다는 건 돈을 더 내야 하나요?",
        "M: 고리는 현수막 전체에 6달러입니다.",
        "W: 밖에 거는 거라 필요해요.",
        "M: 학교로 배달해 드릴까요?",
        "W: 아니요, 목요일에 직접 찾아갈게요.",
        "M: 그러시면 8달러를 빼 드릴 수 있습니다.",
        "W: 그럼 여기 학교 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 자전거 대신 버스를 타는 이유를 고르시오.",
      lines: [
        ["W", "Sangmin, you've been taking the bus all week."],
        ["W", "You usually ride even when it rains."],
        ["M", "I do, but not this week and probably not next."],
        ["W", "Is the bicycle at the repair shop?"],
        ["M", "It's standing in our yard, perfectly fine."],
        ["W", "Then are you carrying something heavy?"],
        ["M", "No, the cycle path is dug up near the bridge."],
        ["W", "I heard they were replacing the water pipes."],
        ["M", "The detour adds fifteen minutes and goes along the main road."],
        ["W", "That road has no lane for bicycles at all."],
      ],
      choices: [
        "자전거가 고장 나서",
        "짐이 무거워서",
        "자전거 길이 공사 중이어서",
        "날씨가 추워서",
        "늦잠을 자서",
      ],
      answer: 3,
      clue: "No, the cycle path is dug up near the bridge.",
      explanation:
        "남자는 다리 근처 자전거 길이 공사 중이라 버스를 탄다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 상민아, 일주일 내내 버스 타더라.",
        "W: 보통은 비가 와도 자전거 타잖아.",
        "M: 그러는데 이번 주는 아니고 다음 주도 아마 아닐 거야.",
        "W: 자전거가 수리점에 있어?",
        "M: 우리 집 마당에 멀쩡히 서 있어.",
        "W: 그럼 무거운 걸 들고 다녀?",
        "M: 아니, 다리 근처 자전거 길을 파헤쳐 놨어.",
        "W: 수도관을 바꾼다고 들었어.",
        "M: 돌아가면 15분이 더 걸리고 큰길을 따라가야 해.",
        "W: 그 길에는 자전거 길이 아예 없지.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 영어 말하기 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Taemin, are you entering the English speaking contest?"],
        ["M", "I signed up, but I haven't seen the details."],
        ["W", "It's on the seventeenth, in the sixth and seventh periods."],
        ["M", "Where does it take place?"],
        ["W", "In the small hall, with everyone sitting in a semicircle."],
        ["M", "How long does each speech have to be?"],
        ["W", "Between three and four minutes, and they time you."],
        ["M", "Can we choose the topic ourselves?"],
        ["W", "Three topics go up a week before, and you pick one."],
        ["M", "Do we have to memorise it, or can we hold notes?"],
        ["W", "One card, and you may glance at it but not read from it."],
      ],
      choices: ["대회 날짜와 교시", "대회가 열리는 곳", "발표 시간의 길이", "메모 사용 여부", "참가 인원"],
      answer: 5,
      clue: "It's on the seventeenth, in the sixth and seventh periods.",
      explanation:
        "날짜와 교시, 장소, 발표 길이, 메모 사용은 말했지만 참가 인원은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 태민아, 영어 말하기 대회 나가?",
        "M: 신청은 했는데 자세한 건 못 봤어.",
        "W: 17일 6교시와 7교시에 해.",
        "M: 어디서 해?",
        "W: 소강당에서. 다들 반원으로 둘러앉아.",
        "M: 발표는 얼마나 해야 해?",
        "W: 3분에서 4분 사이. 시간도 재.",
        "M: 주제는 우리가 골라?",
        "W: 일주일 전에 세 주제가 붙고 그중 하나를 골라.",
        "M: 외워야 해, 메모 들고 있어도 돼?",
        "W: 카드 한 장. 흘끗 봐도 되지만 읽으면 안 돼.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Eastport Maritime Museum에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is some information about the Eastport Maritime Museum, which reopened last year. " +
            "The museum stands at the end of the harbour, in a former warehouse. " +
            "It is open from ten until five, and it closes on the last Monday of each month. " +
            "The main hall holds a fishing boat built in nineteen thirty-one. " +
            "Visitors may climb onto the deck but not go below it. " +
            "Entry costs four thousand won, and under-sevens go in free. " +
            "A guided tour in Korean runs at eleven, one and three. " +
            "The museum lends wheelchairs at the entrance, without any charge.",
        ],
      ],
      choices: [
        "옛 창고 건물을 쓰고 있다",
        "매달 마지막 월요일에는 닫는다",
        "배 갑판 위에는 올라갈 수 있다",
        "해설 관람은 하루에 한 번만 있다",
        "휠체어를 무료로 빌려준다",
      ],
      answer: 4,
      clue: "A guided tour in Korean runs at eleven, one and three.",
      explanation:
        "해설 관람은 하루 세 번 있다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "M: 지난해에 다시 문을 연 이스트포트 해양 박물관에 대해 알려 드립니다. 박물관은 항구 끝, 옛 창고 건물에 있습니다. 열 시부터 다섯 시까지 열고 매달 마지막 월요일에는 닫습니다. 큰 전시실에는 1931년에 만든 고깃배가 있습니다. 관람객은 갑판 위까지 올라갈 수 있지만 그 아래로는 내려갈 수 없습니다. 입장료는 4천 원이고 일곱 살 미만은 무료입니다. 한국어 해설 관람은 열한 시, 한 시, 세 시에 있습니다. 입구에서 휠체어를 무료로 빌려 드립니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 주말 강좌를 고르시오.",
      lines: [
        ["W", "Chaeyeon, five weekend courses open at the centre next month."],
        ["M", "We said we'd pick one before the end of October."],
        ["W", "Then let's do it now. Which day suits you?"],
        ["M", "Sunday only. I work at the shop on Saturdays."],
        ["W", "Two of these run on Saturday."],
        ["M", "Then they're out. How many weeks does each one last?"],
        ["W", "Between four and ten."],
        ["M", "Ten weeks would run into the exam period."],
        ["W", "One of the three left is ten weeks."],
        ["M", "And the fee should stay under seventy thousand won."],
        ["W", "One of the last two is eighty-five thousand."],
        ["M", "So there's only one course for us."],
        ["W", "I'll register us both this evening."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Sunday only. I work at the shop on Saturdays.",
      explanation:
        "일요일, 10주 미만, 7만 원 미만인 강좌를 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Saturday / Weeks: 6 / Fee: 60,000 won" },
          { no: 2, label: "②", value: "Day: Saturday / Weeks: 4 / Fee: 50,000 won" },
          { no: 3, label: "③", value: "Day: Sunday / Weeks: 10 / Fee: 55,000 won" },
          { no: 4, label: "④", value: "Day: Sunday / Weeks: 6 / Fee: 68,000 won" },
          { no: 5, label: "⑤", value: "Day: Sunday / Weeks: 4 / Fee: 85,000 won" },
        ],
      },
      translation: [
        "W: 채연아, 다음 달에 센터에서 주말 강좌 다섯 개가 열려.",
        "M: 10월 안에 하나 고르기로 했잖아.",
        "W: 그럼 지금 하자. 너는 무슨 요일이 돼?",
        "M: 일요일만. 토요일에는 가게에서 일해.",
        "W: 두 개는 토요일이야.",
        "M: 그럼 빠지네. 각각 몇 주야?",
        "W: 4주에서 10주 사이.",
        "M: 10주면 시험 기간에 걸려.",
        "W: 남은 셋 중 하나가 10주야.",
        "M: 그리고 수강료는 7만 원 아래여야 해.",
        "W: 남은 둘 중 하나는 8만 5천 원이야.",
        "M: 그럼 우리한테 맞는 건 하나뿐이네.",
        "W: 오늘 저녁에 둘 다 등록할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Kiyoung, did you set up the chairs in the hall?"],
        ["M", "Six rows are done, four to go."],
        ["W", "The rehearsal starts at four thirty."],
        ["M", "I could finish it faster with one more person."],
        ["W", "Shall I come and help you now?"],
      ],
      choices: [
        "The rehearsal was cancelled.",
        "Yes, please, that would save time.",
        "I've finished all the rows.",
        "There are no chairs left.",
        "You should sit down.",
      ],
      answer: 2,
      clue: "Shall I come and help you now?",
      explanation:
        "도와줄지 물었으므로, 그러면 시간이 절약된다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 기영아, 강당에 의자 다 놨어?",
        "M: 여섯 줄 했고 네 줄 남았어.",
        "W: 연습이 4시 30분에 시작해.",
        "M: 한 명만 더 있으면 더 빨리 끝낼 수 있어.",
        "W: 내가 지금 가서 도울까?",
        "M: 응, 부탁해. 그럼 시간이 줄겠다.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Naeun, is the science room open during lunch?"],
        ["W", "It is, but only with a teacher inside."],
        ["M", "I need to leave a sample in the fridge."],
        ["W", "Mr. Kwon is usually there until one."],
        ["M", "Do I need to write it in a book?"],
      ],
      choices: [
        "The fridge is broken.",
        "Yes, the log is by the door.",
        "I don't use the science room.",
        "Mr. Kwon left the school.",
        "Lunch ends at twelve thirty.",
      ],
      answer: 2,
      clue: "Do I need to write it in a book?",
      explanation:
        "기록해야 하는지 물었으므로, 문 옆에 기록장이 있다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나은아, 점심시간에 과학실 열어?",
        "W: 열어. 다만 선생님이 안에 계실 때만.",
        "M: 냉장고에 시료를 하나 넣어 둬야 해.",
        "W: 권 선생님이 보통 한 시까지 계셔.",
        "M: 장부에 적어야 해?",
        "W: 응, 기록장이 문 옆에 있어.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyun, how is the class book club going?"],
        ["W", "Eleven members, and three or four turn up each week."],
        ["M", "When do you hold the meetings?"],
        ["W", "Friday, right after school."],
        ["M", "That's the hour everyone wants to go home."],
        ["W", "It's the only hour the room is free, though."],
        ["M", "Is the room free at lunch on any day?"],
        ["W", "Wednesday, now that you mention it."],
        ["M", "People are already in the building at lunch."],
        ["W", "And nobody has to give up an evening."],
        ["M", "Try one Wednesday lunch and count the chairs."],
      ],
      choices: [
        "Nobody reads the books.",
        "That's worth testing, I'll suggest it.",
        "Friday is the best day.",
        "We have no room at all.",
        "I'll close the book club.",
      ],
      answer: 2,
      clue: "Try one Wednesday lunch and count the chairs.",
      explanation:
        "수요일 점심에 한 번 해 보라는 제안이므로, 해 볼 만하다며 제안하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 서윤아, 학급 독서 모임은 어때?",
        "W: 회원은 열한 명인데 매주 서넛만 와.",
        "M: 모임을 언제 해?",
        "W: 금요일, 방과 후 바로.",
        "M: 다들 집에 가고 싶어 하는 시간이네.",
        "W: 그래도 그때만 교실이 비어.",
        "M: 점심시간에는 어느 요일에 비어?",
        "W: 말 나온 김에 보니 수요일이 비네.",
        "M: 점심때는 다들 이미 학교에 있잖아.",
        "W: 저녁을 포기할 필요도 없고.",
        "M: 수요일 점심에 한 번 해 보고 의자를 세어 봐.",
        "W: 해 볼 만하다, 제안해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junho, you've been running the school's lost property table."],
        ["M", "Every Thursday lunch, since April."],
        ["W", "How many things come in each week?"],
        ["M", "About twenty, and half of them go home again."],
        ["W", "What happens to the other half?"],
        ["M", "They wait four weeks and then go to a charity shop."],
        ["W", "Does anything ever come back after that?"],
        ["M", "One boy recognised his coat in the shop window."],
        ["W", "That must have been an awkward afternoon."],
        ["M", "He bought it back for two thousand won and laughed about it."],
        ["W", "Could I help you at the table next Thursday?"],
      ],
      choices: [
        "Sure, we start at twelve forty.",
        "The table closed in June.",
        "Nothing is ever lost here.",
        "You can't come to school.",
        "I stopped doing it in April.",
      ],
      answer: 1,
      clue: "Could I help you at the table next Thursday?",
      explanation:
        "여자가 다음 목요일에 돕겠다고 했으므로, 12시 40분에 시작한다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 준호야, 학교 분실물 창구를 맡고 있다며.",
        "M: 4월부터 목요일 점심마다.",
        "W: 일주일에 몇 개나 들어와?",
        "M: 스무 개쯤. 그중 절반은 주인에게 돌아가.",
        "W: 나머지 절반은 어떻게 돼?",
        "M: 네 주 기다렸다가 나눔 가게로 보내.",
        "W: 그 뒤에 돌아오는 것도 있어?",
        "M: 한 학생이 가게 진열창에서 자기 외투를 알아봤어.",
        "W: 어색한 오후였겠다.",
        "M: 2천 원에 도로 사면서 웃었대.",
        "W: 다음 목요일에 내가 창구 도와도 돼?",
        "M: 그럼, 우리는 12시 40분에 시작해.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Dain이 Sangwoo에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Dain : ________________",
      lines: [
        [
          "W",
          "Dain and Sangwoo are preparing the school's open day tour. " +
            "Twelve student guides will lead visiting families around the building. " +
            "Sangwoo has written a single route that goes through the science corridor. " +
            "That corridor is being repainted and the floor is covered in sheets. " +
            "The work finishes on Monday, but the open day is this Saturday. " +
            "There is a second staircase that reaches the same rooms from the library side. " +
            "Dain wants him to change the route before the guides learn it. " +
            "In this situation, what would Dain most likely say to Sangwoo?",
        ],
      ],
      choices: [
        "Let's cancel the tour this year.",
        "We need more student guides.",
        "Change the route to the library stairs.",
        "I'll repaint the corridor myself.",
        "Saturday is far too early.",
      ],
      answer: 3,
      clue: "Dain wants him to change the route before the guides learn it.",
      explanation:
        "과학 복도가 공사 중이므로 도서관 쪽 계단으로 동선을 바꾸자는 ③이 가장 적절하다.",
      translation: [
        "W: 다인이와 상우는 학교 개방일 안내를 준비하고 있습니다. 학생 안내자 열두 명이 찾아온 가족들을 데리고 건물을 돕니다. 상우는 과학 복도를 지나가는 동선 하나를 짜 두었습니다. 그 복도는 지금 새로 칠하는 중이라 바닥이 천으로 덮여 있습니다. 공사는 월요일에 끝나는데 개방일은 이번 토요일입니다. 도서관 쪽에서 같은 교실들로 올라가는 계단이 하나 더 있습니다. 다인이는 안내자들이 동선을 외우기 전에 바꾸기를 바랍니다. 이런 상황에서 다인이가 상우에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to explain why food tastes dull " +
            "when your nose is blocked by a cold. " +
            "The tongue is a coarse instrument. " +
            "It reports five things only: sweet, sour, salty, bitter and savoury. " +
            "Everything beyond that, and it is almost everything, " +
            "comes from molecules drifting up the back of the throat into the nose. " +
            "That path is called retronasal smell, and it does most of the work " +
            "that we casually give the tongue the credit for. " +
            "Block the path with a cold and a strawberry becomes merely sweet, " +
            "a coffee merely bitter. " +
            "Nothing has changed on your tongue at all. " +
            "You have simply lost the instrument that was doing the describing.",
        ],
      ],
      choices: [
        "how the tongue detects five basic tastes",
        "why a blocked nose makes food taste dull",
        "how colds spread between people",
        "why some people dislike bitter food",
        "how cooking changes the texture of food",
      ],
      answer: 2,
      clue: "That path is called retronasal smell, and it does most of the work.",
      explanation:
        "남자는 맛의 대부분이 코로 올라가는 냄새에서 오므로 코가 막히면 맛이 밋밋해진다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 감기로 코가 막히면 음식이 왜 밋밋해지는지 설명하려 합니다. 혀는 거친 도구입니다. 단맛, 신맛, 짠맛, 쓴맛, 감칠맛 다섯 가지만 알려 줍니다. 그 밖의 모든 것은, 그리고 사실상 거의 전부는, 목 뒤로 올라가 코로 들어가는 분자에서 옵니다. 그 길을 코뒤 후각이라고 부르는데, 우리가 무심코 혀의 공으로 돌리는 일의 대부분을 그 길이 합니다. 감기로 그 길이 막히면 딸기는 그저 달고 커피는 그저 씁니다. 혀에서는 아무것도 달라지지 않았습니다. 설명해 주던 도구를 잃었을 뿐입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Today I want to explain why food tastes dull when your nose is blocked."],
        ["M", "The tongue reports five things only: sweet, sour, salty, bitter and savoury."],
        ["M", "Molecules drift up the back of the throat into the nose."],
        ["M", "That path is called retronasal smell."],
        ["M", "Block the path with a cold and a strawberry becomes merely sweet."],
      ],
      choices: [
        "the tongue reporting only five things",
        "molecules drifting up into the nose",
        "the path called retronasal smell",
        "a strawberry becoming merely sweet",
        "the number of taste buds on a tongue",
      ],
      answer: 5,
      clue: "The tongue reports five things only: sweet, sour, salty, bitter and savoury.",
      explanation:
        "다섯 가지만 알려 주는 혀, 코로 올라가는 분자, 코뒤 후각이라는 길, 그저 달아지는 딸기는 언급되지만 혀의 미뢰 개수는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
