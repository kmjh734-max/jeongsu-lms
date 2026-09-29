/** 고1 듣기 51회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 51회",
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
          "Good morning, everyone. This is the student council speaking. " +
            "Twice this month a student has been hurt on the back stairs, " +
            "both times in the two minutes right after the bell. " +
            "We looked at the stairs ourselves and found the reason. " +
            "Everyone going up and everyone coming down uses the same side. " +
            "From tomorrow we are painting a line down the middle of those stairs. " +
            "Keep to the right whether you are going up or down. " +
            "Council members will stand at the top and bottom this week " +
            "to remind anyone who forgets, and only for this week. " +
            "This takes nothing from you but two seconds of attention. " +
            "Please help us make the change stick.",
        ],
      ],
      choices: [
        "계단에서 우측통행을 지키도록 당부하려고",
        "계단 공사를 알리려고",
        "학생회 선거를 안내하려고",
        "보건실 이용 방법을 알리려고",
        "등교 시간 변경을 알리려고",
      ],
      answer: 1,
      clue: "Keep to the right whether you are going up or down.",
      explanation:
        "계단에서 우측통행을 지키자고 당부하고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 학생회입니다. 이번 달에 두 번, 학생이 뒤쪽 계단에서 다쳤습니다. 두 번 다 종이 친 직후 2분 사이였습니다. 저희가 직접 계단을 살펴보고 이유를 찾았습니다. 올라가는 사람과 내려오는 사람이 모두 같은 쪽을 씁니다. 내일부터 그 계단 한가운데에 선을 긋습니다. 올라가든 내려오든 오른쪽으로 다녀 주세요. 이번 주에는 학생회 임원이 계단 위아래에 서서 잊은 분께 알려 드립니다. 이번 주만 그렇게 합니다. 여러분께 드는 것은 2초의 주의뿐입니다. 이 변화가 자리 잡도록 도와주십시오.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Jiwon, you always finish your part of a group project first."],
        ["M", "I finish a rough version first, not a good one."],
        ["W", "Isn't a rough version a waste of everyone's time?"],
        ["M", "It gives the others something to argue with."],
        ["W", "They could argue with an empty page too."],
        ["M", "Nobody argues with an empty page. They just wait."],
        ["W", "That's true. Our group waited three weeks once."],
        ["M", "A bad first draft moves faster than a good plan."],
        ["W", "But then you rewrite everything you wrote."],
        ["M", "I'd rather rewrite than wait for someone to start."],
        ["W", "So the point is to make the work visible."],
        ["M", "Something wrong on paper beats something perfect in your head."],
        ["W", "I'll send mine rough tomorrow, then."],
      ],
      choices: [
        "거친 초안이라도 먼저 내놓아야 일이 움직인다",
        "조별 과제는 역할을 나눠야 한다",
        "계획을 세운 뒤에 시작해야 한다",
        "여러 번 고쳐 써야 좋은 글이 된다",
        "회의는 자주 해야 한다",
      ],
      answer: 1,
      clue: "Something wrong on paper beats something perfect in your head.",
      explanation:
        "남자는 거친 초안이라도 먼저 내놓아야 한다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 지원아, 너는 조별 과제에서 늘 네 몫을 먼저 끝내더라.",
        "M: 잘된 게 아니라 거친 판을 먼저 끝내는 거야.",
        "W: 거친 판은 다들 시간만 버리는 거 아니야?",
        "M: 다른 사람들한테 따질 거리를 주는 거지.",
        "W: 빈 종이를 두고도 따질 수 있잖아.",
        "M: 빈 종이를 두고는 아무도 안 따져. 그냥 기다려.",
        "W: 맞아. 우리 조는 한번은 3주를 기다렸어.",
        "M: 형편없는 초안이 훌륭한 계획보다 빨리 움직여.",
        "W: 그런데 결국 쓴 걸 다 다시 쓰잖아.",
        "M: 누가 시작하기를 기다리느니 다시 쓰겠어.",
        "W: 그러니까 핵심은 일을 눈에 보이게 만드는 거구나.",
        "M: 종이에 적힌 틀린 것이 머릿속의 완벽한 것보다 나아.",
        "W: 그럼 내 것도 내일 거칠게 보낼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We talk about habits as though the difficulty were doing them. " +
            "In truth the difficulty is starting them, every single time. " +
            "A person who runs every morning is not fighting the run; " +
            "she is fighting the eleven seconds before she stands up. " +
            "This is why the shape of the room matters so much. " +
            "Shoes by the door, a book on the pillow, a glass by the tap: " +
            "none of these makes the activity easier, " +
            "but each one removes a decision from the moment you are weakest. " +
            "Do not try to want it more tomorrow morning. " +
            "Arrange tonight so that tomorrow needs less wanting.",
        ],
      ],
      choices: [
        "습관은 의욕보다 시작을 쉽게 만드는 준비에 달려 있다",
        "습관은 매일 같은 시각에 해야 한다",
        "목표를 작게 나눠야 한다",
        "운동은 아침에 하는 것이 좋다",
        "기록을 남겨야 습관이 이어진다",
      ],
      answer: 1,
      clue: "Arrange tonight so that tomorrow needs less wanting.",
      explanation:
        "의욕보다 시작을 쉽게 만드는 준비가 습관을 만든다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 우리는 습관을 말할 때 어려운 것이 그 일을 하는 것인 양 말합니다. 사실 어려운 것은 매번 그것을 시작하는 일입니다. 아침마다 달리는 사람은 달리기와 싸우는 것이 아닙니다. 일어서기 전 열한 초와 싸우는 것입니다. 그래서 방의 생김새가 그토록 중요합니다. 문 옆의 운동화, 베개 위의 책, 수도 옆의 컵. 이 가운데 어느 것도 그 일을 더 쉽게 만들지는 않습니다. 그러나 하나하나가 여러분이 가장 약한 순간에서 결정을 하나씩 덜어 냅니다. 내일 아침에 더 하고 싶어지려고 애쓰지 마십시오. 내일이 덜 하고 싶어도 되도록 오늘 밤을 차려 두십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Seongho, is this the photo of the school shop you set up?"],
        ["M", "Yes, the club opened it at the start of the term."],
        ["W", "There's a counter along the left wall."],
        ["M", "Two of us stand behind it during break."],
        ["W", "And a noticeboard hangs above the counter."],
        ["M", "We put the price list up there."],
        ["W", "I see three shelves on the right wall."],
        ["M", "Two shelves, actually. The bottom one is a cabinet."],
        ["W", "There's a stool beside the door."],
        ["M", "Whoever waits for change sits there."],
        ["W", "And a small clock stands on the counter."],
        ["M", "It runs two minutes fast, on purpose."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Two shelves, actually. The bottom one is a cabinet.",
      explanation:
        "오른쪽 벽 선반이 세 개라고 했지만 두 개라고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A small school shop room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A COUNTER runs along the left wall. " +
          "A NOTICEBOARD hangs on the wall above the counter. " +
          "THREE SHELVES are mounted on the right wall. " +
          "A STOOL stands beside the door. " +
          "A SMALL CLOCK stands on top of the counter.",
        spots: [
          [0.14, 0.58],
          [0.14, 0.2],
          [0.85, 0.42],
          [0.55, 0.85],
          [0.3, 0.45],
        ],
      },
      translation: [
        "W: 성호야, 이게 너희가 차린 학교 매점 사진이야?",
        "M: 응, 학기 초에 동아리가 열었어.",
        "W: 왼쪽 벽을 따라 계산대가 있네.",
        "M: 쉬는 시간에 둘이서 그 뒤에 서 있어.",
        "W: 그리고 계산대 위에 알림판이 걸려 있고.",
        "M: 거기에 가격표를 붙여.",
        "W: 오른쪽 벽에 선반이 세 개 보여.",
        "M: 사실 두 개야. 맨 아래는 수납장이야.",
        "W: 문 옆에 등받이 없는 의자가 있네.",
        "M: 거스름돈 기다리는 사람이 거기 앉아.",
        "W: 그리고 계산대 위에 작은 시계가 있고.",
        "M: 일부러 2분 빠르게 맞춰 놨어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taemin, the school play starts in an hour."],
        ["M", "The stage is set and the costumes are out."],
        ["W", "Did anyone find the box of stage make-up?"],
        ["M", "It was in the drama room yesterday."],
        ["W", "I looked there this morning and it's gone."],
        ["M", "Maybe the art club borrowed it for the festival."],
        ["W", "They keep everything in the art room cupboard."],
        ["M", "The art teacher locks that room at five."],
        ["W", "It's twenty to five right now."],
        ["M", "Then I need to go this minute."],
        ["W", "I'll help the cast into their costumes."],
        ["M", "I'll go and get the make-up box from the art room."],
      ],
      choices: [
        "의상을 입히기",
        "무대를 꾸미기",
        "미술실에서 분장 상자를 가져오기",
        "연극부에 연락하기",
        "선생님을 모셔 오기",
      ],
      answer: 3,
      clue: "I'll go and get the make-up box from the art room.",
      explanation:
        "남자는 미술실에서 분장 상자를 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 태민아, 학교 연극이 한 시간 뒤에 시작해.",
        "M: 무대는 다 차렸고 의상도 꺼냈어.",
        "W: 분장 상자는 누가 찾았어?",
        "M: 어제는 연극반 방에 있었는데.",
        "W: 오늘 아침에 봤는데 없어졌어.",
        "M: 미술 동아리가 축제 때문에 빌려 갔을지도 몰라.",
        "W: 걔들은 다 미술실 장에 넣어 둬.",
        "M: 미술 선생님이 다섯 시에 그 방을 잠그셔.",
        "W: 지금 다섯 시 20분 전이야.",
        "M: 그럼 지금 당장 가야겠다.",
        "W: 나는 배우들 의상 입는 걸 도울게.",
        "M: 내가 미술실에서 분장 상자를 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the stationery shop. What do you need today?"],
        ["W", "Six folders and three packs of sticky notes, please."],
        ["M", "The folders are two dollars each this week."],
        ["W", "Were they more expensive than that before?"],
        ["M", "Three dollars each until the end of last month."],
        ["W", "Then I came at a good time."],
        ["M", "We lowered the price for the new term."],
        ["W", "And how much are the sticky notes?"],
        ["M", "Four dollars for a pack of five pads."],
        ["W", "That is a lot of paper altogether."],
        ["M", "Students with a school card get ten percent off."],
        ["W", "I have mine right here in my wallet."],
        ["M", "Then the discount applies to your whole order."],
        ["W", "Good, I'll pay by card.",],
      ],
      choices: ["$19.80", "$21.60", "$22.50", "$24.00", "$26.40"],
      answer: 2,
      clue: "Folders are two dollars each this week.",
      explanation:
        "서류철 여섯 개 12달러와 쪽지 세 묶음 12달러로 24달러인데, 10퍼센트를 빼면 21.60달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 문구점에 오신 걸 환영합니다. 오늘은 뭐가 필요하세요?",
        "W: 서류철 여섯 개랑 붙임쪽지 세 묶음 주세요.",
        "M: 이번 주 서류철은 하나에 2달러입니다.",
        "W: 전에는 그보다 비쌌나요?",
        "M: 지난달 말까지는 하나에 3달러였습니다.",
        "W: 때를 잘 맞춰 왔네요.",
        "M: 새 학기라 값을 내렸습니다.",
        "W: 붙임쪽지는 얼마예요?",
        "M: 다섯 개들이 한 묶음에 4달러입니다.",
        "W: 다 합치면 종이가 많네요.",
        "M: 학생증이 있으면 10퍼센트 할인됩니다.",
        "W: 여기 지갑에 있어요.",
        "M: 그럼 주문 전체에 할인이 들어갑니다.",
        "W: 좋네요, 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 발표 순서를 바꾼 이유를 고르시오.",
      lines: [
        ["M", "Areum, I heard you asked to present last instead of first."],
        ["M", "You were the one who wanted to go first."],
        ["W", "I did, and I still think first is better."],
        ["M", "Did your slides give you trouble?"],
        ["W", "They've been finished since Tuesday."],
        ["M", "Then are you nervous about speaking?"],
        ["W", "No more than usual, honestly."],
        ["M", "So why the change?"],
        ["W", "Our group's data only arrives on Thursday evening."],
        ["M", "And you present on Thursday afternoon."],
        ["W", "Going last buys us one more day."],
        ["M", "That makes sense. I'd do the same."],
      ],
      choices: [
        "자료가 늦게 도착해서",
        "발표 자료를 못 만들어서",
        "긴장이 되어서",
        "몸이 아파서",
        "다른 일정이 겹쳐서",
      ],
      answer: 1,
      clue: "Our group's data only arrives on Thursday evening.",
      explanation:
        "자료가 목요일 저녁에야 도착해 순서를 뒤로 미뤘다. 따라서 답은 ①이다.",
      translation: [
        "M: 아름아, 첫 번째 대신 마지막에 발표하겠다고 했다며.",
        "M: 원래 첫 번째로 하고 싶어 했잖아.",
        "W: 맞아. 지금도 첫 번째가 낫다고 생각해.",
        "M: 발표 자료에 문제가 있었어?",
        "W: 화요일부터 다 만들어 놨어.",
        "M: 그럼 말하는 게 떨려서?",
        "W: 솔직히 평소보다 더하지는 않아.",
        "M: 그럼 왜 바꿨어?",
        "W: 우리 조 자료가 목요일 저녁에야 와.",
        "M: 그런데 발표는 목요일 오후고.",
        "W: 마지막으로 가면 하루를 더 버는 거야.",
        "M: 그럴 만하네. 나라도 그러겠어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 학교 사진 동아리에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Kiwon, what does the photography club do exactly?"],
        ["W", "I'm thinking of joining in March."],
        ["M", "We go out and shoot together twice a month."],
        ["W", "Where do you usually go?"],
        ["M", "The river park, the old market, sometimes the station."],
        ["W", "Do I need my own camera?"],
        ["M", "The club has four cameras you can borrow."],
        ["W", "What happens to the photos afterwards?"],
        ["M", "We pick the best ones and print them for the hallway."],
        ["W", "How many members are there now?"],
        ["M", "Eleven, and three of them are leaving in February."],
        ["W", "Then there should be room for me."],
        ["M", "Come to the club room on Thursday and see."],
      ],
      choices: ["나가는 횟수", "가는 곳", "사진기 대여", "회원 수", "가입 신청 방법"],
      answer: 5,
      clue: "We go out and shoot together twice a month.",
      explanation:
        "횟수, 장소, 대여, 회원 수는 말했지만 가입 신청 방법은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 기원아, 사진 동아리는 정확히 뭘 해?",
        "W: 3월에 들어갈까 생각 중이야.",
        "M: 한 달에 두 번 같이 나가서 찍어.",
        "W: 보통 어디로 가?",
        "M: 강변 공원, 옛 시장, 가끔은 역.",
        "W: 내 사진기가 있어야 해?",
        "M: 동아리에 빌릴 수 있는 사진기가 네 대 있어.",
        "W: 찍은 사진은 나중에 어떻게 해?",
        "M: 잘 나온 걸 골라 인화해서 복도에 걸어.",
        "W: 지금 회원이 몇 명이야?",
        "M: 열한 명인데 그중 셋이 2월에 나가.",
        "W: 그럼 내 자리도 있겠네.",
        "M: 목요일에 동아리방으로 와서 봐.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 겨울 방학 자율 학습실 운영에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. Here is the plan for the winter study room. " +
            "It opens on the fifth of January and runs until the thirtieth. " +
            "The room is open from nine in the morning until five. " +
            "Fifty seats are available, and seats are not reserved. " +
            "Bring your own study materials and a water bottle. " +
            "Eating meals inside the room is not allowed at any time. " +
            "You may leave the building for lunch between twelve and one. " +
            "The room is closed on Saturdays and Sundays. " +
            "Come to the school office on the first day to sign in.",
        ],
      ],
      choices: [
        "1월 5일부터 30일까지 운영한다",
        "오전 아홉 시부터 오후 다섯 시까지 연다",
        "자리는 쉰 개이고 예약하지 않는다",
        "학습실 안에서 식사할 수 없다",
        "토요일에도 문을 연다",
      ],
      answer: 5,
      clue: "The room is closed on Saturdays and Sundays.",
      explanation:
        "토요일과 일요일에는 닫는다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 겨울 자율 학습실 운영 계획을 알려 드립니다. 1월 5일에 열어 30일까지 운영합니다. 오전 아홉 시부터 오후 다섯 시까지 열려 있습니다. 자리는 쉰 개이고 예약을 받지 않습니다. 공부할 자료와 물병은 각자 가져오세요. 학습실 안에서는 언제든 식사를 할 수 없습니다. 열두 시부터 한 시까지는 점심을 먹으러 건물 밖으로 나가셔도 됩니다. 토요일과 일요일에는 문을 닫습니다. 첫날에는 학교 사무실에 들러 명단에 적어 주세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 남자가 신청할 강좌를 고르시오.",
      lines: [
        ["W", "Dohyun, which after-school course will you take this term?"],
        ["M", "Five courses are open at our school this time."],
        ["W", "Which day works for you?"],
        ["M", "Not Monday. I have the debate club meeting then."],
        ["W", "So Monday courses are out for you."],
        ["M", "And I'd like one that meets in the morning."],
        ["W", "Two of these run in the evening."],
        ["M", "Evening classes finish after my last bus."],
        ["W", "That settles it, then."],
        ["M", "The fee also has to stay under forty thousand won."],
        ["W", "Then only one course fits all three conditions."],
        ["M", "I'll sign up tomorrow before it fills."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Not Monday. I have the debate club meeting then.",
      explanation:
        "월요일이 아니고 오전이며 4만 원 미만인 강좌는 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Monday / Time: Morning / Fee: 30,000 won" },
          { no: 2, label: "②", value: "Day: Tuesday / Time: Evening / Fee: 28,000 won" },
          { no: 3, label: "③", value: "Day: Wednesday / Time: Evening / Fee: 35,000 won" },
          { no: 4, label: "④", value: "Day: Thursday / Time: Morning / Fee: 38,000 won" },
          { no: 5, label: "⑤", value: "Day: Friday / Time: Morning / Fee: 45,000 won" },
        ],
      },
      translation: [
        "W: 도현아, 이번 학기에 어떤 방과 후 강좌 들을 거야?",
        "M: 이번에는 우리 학교에 다섯 개가 열려.",
        "W: 어느 요일이 돼?",
        "M: 월요일은 안 돼. 그때 토론 동아리 모임이 있어.",
        "W: 그럼 월요일 강좌는 빠지네.",
        "M: 그리고 오전에 하는 걸로 하고 싶어.",
        "W: 이 중 두 개는 저녁이야.",
        "M: 저녁 수업은 막차 지나서 끝나.",
        "W: 그럼 정해졌네.",
        "M: 수강료도 4만 원 미만이어야 해.",
        "W: 그럼 세 조건에 다 맞는 건 하나뿐이야.",
        "M: 자리 차기 전에 내일 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Did you finish the reading for tomorrow's class?"],
        ["M", "I read about half of the chapter last night."],
        ["W", "The second half is where it gets difficult."],
        ["M", "I'll finish it after dinner this evening."],
        ["W", "Shall we compare our notes tomorrow morning?"],
      ],
      choices: [
        "The class was cancelled.",
        "I never take notes.",
        "Sure, before the bell.",
        "There is no chapter.",
        "I finished it last week.",
      ],
      answer: 3,
      clue: "Shall we compare our notes tomorrow morning?",
      explanation:
        "내일 아침에 필기를 견줘 보자는 제안이므로, 종 치기 전에 하자는 ③이 가장 자연스럽다.",
      translation: [
        "W: 내일 수업에 쓸 자료 다 읽었어?",
        "M: 어젯밤에 단원 절반쯤 읽었어.",
        "W: 뒤쪽 절반부터 어려워져.",
        "M: 오늘 저녁 먹고 끝낼게.",
        "W: 내일 아침에 필기를 견줘 볼까?",
        "M: 좋아, 종 치기 전에.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, is there a lost and found in this building?"],
        ["W", "Yes, in the office on the first floor."],
        ["M", "How long do they keep things there?"],
        ["W", "About two weeks, then they give them away."],
        ["M", "Do I need to describe what I lost?"],
      ],
      choices: [
        "The office moved upstairs.",
        "Yes, they always ask.",
        "I don't lose things.",
        "Two weeks is too long.",
        "You can't go inside.",
      ],
      answer: 2,
      clue: "Do I need to describe what I lost?",
      explanation:
        "잃어버린 물건을 설명해야 하는지 물었으므로, 늘 물어본다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 이 건물에 분실물 보관하는 데가 있나요?",
        "W: 네, 1층 사무실에요.",
        "M: 거기서 얼마나 보관하나요?",
        "W: 두 주쯤요. 그다음에는 기부합니다.",
        "M: 잃어버린 물건을 설명해야 하나요?",
        "W: 네, 늘 물어보십니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Sujin, how is the club's charity sale going this week?"],
        ["W", "We have sold only nine things in three whole days."],
        ["M", "Where exactly is the table set up?"],
        ["W", "In the corridor just outside the science rooms."],
        ["M", "How many students pass that corridor at break time?"],
        ["W", "Not many at all, now that you ask me."],
        ["M", "The science rooms are empty except during lessons."],
        ["W", "We chose it because there was room for the table."],
        ["M", "And the cafeteria line is full of people doing nothing."],
        ["W", "We never asked whether we could stand there."],
        ["M", "Someone would have to ask the school office first."],
        ["W", "That sounds like a small thing to try."],
        ["M", "When could you ask them about it?"],
      ],
      choices: [
        "Nobody would allow it.",
        "Tomorrow at lunchtime.",
        "We'll close the sale.",
        "The office is gone.",
        "I already asked last year.",
      ],
      answer: 2,
      clue: "When could you ask them about it?",
      explanation:
        "언제 물어볼 수 있는지 물었으므로, 내일 점심때라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수진아, 이번 주 동아리 자선 판매는 잘돼 가?",
        "W: 꼬박 사흘 동안 아홉 개밖에 못 팔았어.",
        "M: 탁자를 정확히 어디에 놨어?",
        "W: 과학실 바로 밖 복도에.",
        "M: 쉬는 시간에 그 복도를 몇 명이나 지나가?",
        "W: 네가 물으니 알겠는데, 거의 없어.",
        "M: 과학실은 수업 때 말고는 비어 있잖아.",
        "W: 탁자 놓을 자리가 있어서 거기로 골랐어.",
        "M: 급식 줄에는 할 일 없이 서 있는 사람이 가득한데.",
        "W: 거기 서도 되는지 물어본 적이 없어.",
        "M: 먼저 누가 학교 사무실에 여쭤봐야겠지.",
        "W: 해 볼 만한 작은 일이네.",
        "M: 언제 여쭤볼 수 있어?",
        "W: 내일 점심때.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junho, you said your handwriting gets worse in exams."],
        ["M", "The teacher couldn't read half of my last answer."],
        ["W", "Do you write at the same speed as usual?"],
        ["M", "Much faster. I'm always afraid of running out of time."],
        ["W", "How much time was left when you finished?"],
        ["M", "About twelve minutes, actually."],
        ["W", "So the hurry was not really about the clock."],
        ["M", "I suppose it was just nerves."],
        ["W", "An unreadable answer scores the same as no answer."],
        ["M", "That's a frightening way to put it."],
        ["W", "What could you do in the first minute of the next exam?"],
      ],
      choices: [
        "I'd write even faster.",
        "Take a breath and slow down.",
        "I'll skip the first question.",
        "Nothing can be done.",
        "I'll stop taking exams.",
      ],
      answer: 2,
      clue: "What could you do in the first minute of the next exam?",
      explanation:
        "다음 시험 첫 1분에 무엇을 할지 물었으므로, 숨을 고르고 천천히 쓰겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준호야, 시험 때 글씨가 더 나빠진다고 했잖아.",
        "M: 지난번 답안은 선생님이 절반도 못 읽으셨어.",
        "W: 평소랑 같은 속도로 써?",
        "M: 훨씬 빨라. 시간이 모자랄까 봐 늘 겁이 나.",
        "W: 다 쓰고 나서 시간이 얼마나 남았어?",
        "M: 사실 12분쯤.",
        "W: 그럼 서두른 건 시계 때문이 아니었네.",
        "M: 그냥 긴장이었나 봐.",
        "W: 못 읽는 답은 안 쓴 답과 점수가 같아.",
        "M: 무섭게 말하네.",
        "W: 다음 시험 첫 1분에 뭘 할 수 있을까?",
        "M: 숨 한번 고르고 천천히 쓰기.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Bora가 Sangjun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Bora : ________________",
      lines: [
        [
          "W",
          "Bora and Sangjun are in charge of the club's shared computer. " +
            "All the club's photographs and records are kept on it. " +
            "Sangjun is about to install a program he downloaded this morning " +
            "from a site he has never used before, to make a poster faster. " +
            "Bora knows that three years of the club's work sits on that machine " +
            "and that there is no copy of any of it anywhere else. " +
            "If the program damages the files, nothing can be recovered. " +
            "She wants him to make a copy of the files before installing anything. " +
            "In this situation, what would Bora most likely say to Sangjun?",
        ],
      ],
      choices: [
        "Install two programs at once.",
        "The computer is already broken.",
        "Let's copy the files first.",
        "We don't need the photographs.",
        "Delete the old records now.",
      ],
      answer: 3,
      clue: "She wants him to make a copy of the files before installing anything.",
      explanation:
        "3년 치 자료가 사본 없이 그 컴퓨터에만 있으므로, 먼저 사본을 만들자는 ③이 가장 적절하다.",
      translation: [
        "W: 보라와 상준이는 동아리 공용 컴퓨터를 맡고 있습니다. 동아리의 사진과 기록이 모두 거기에 들어 있습니다. 상준이는 포스터를 더 빨리 만들려고, 오늘 아침에 처음 써 보는 곳에서 내려받은 프로그램을 설치하려고 합니다. 보라는 3년 치 동아리 자료가 그 컴퓨터에만 있고 다른 어디에도 사본이 없다는 것을 압니다. 그 프로그램이 파일을 망가뜨리면 아무것도 되살릴 수 없습니다. 그녀는 무엇이든 설치하기 전에 파일 사본을 만들기를 바랍니다. 이런 상황에서 보라가 상준이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about how animals sleep " +
            "in places where falling asleep should be impossible. " +
            "The dolphin shuts down one half of its brain at a time, " +
            "keeping one eye open and swimming steadily while the other half rests. " +
            "The frigate bird sleeps in the air during long flights over the ocean, " +
            "taking naps of a few seconds while its wings hold their shape. " +
            "The sea otter wraps itself in seaweed before drifting off " +
            "so that the current cannot carry it away during the night. " +
            "The swift can stay aloft for months at a time, " +
            "climbing at dusk and sleeping as it glides slowly down. " +
            "Sleep, it turns out, bends to fit the life around it.",
        ],
      ],
      choices: [
        "how animals sleep in difficult places",
        "why birds migrate across the ocean",
        "how sea animals find their food",
        "why sleep is necessary for the brain",
        "how ocean currents move animals",
      ],
      answer: 1,
      clue: "Sleep, it turns out, bends to fit the life around it.",
      explanation:
        "잠들기 어려운 곳에서 동물들이 어떻게 자는지가 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 잠들기가 불가능해 보이는 곳에서 동물들이 어떻게 자는지 이야기하려 합니다. 돌고래는 한 번에 뇌의 절반만 재웁니다. 한쪽 눈을 뜨고 꾸준히 헤엄치는 동안 나머지 절반이 쉽니다. 군함조는 바다 위를 오래 나는 동안 공중에서 잡니다. 날개가 모양을 유지하는 채로 몇 초씩 토막잠을 잡니다. 해달은 잠들기 전에 해초로 제 몸을 감습니다. 밤사이 물살에 떠내려가지 않게 하려는 것입니다. 칼새는 몇 달을 내리 하늘에 머물 수 있는데, 해 질 녘에 올라갔다가 천천히 미끄러져 내려오며 잡니다. 잠은 결국 그 둘레의 삶에 맞춰 휘어집니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 동물이 아닌 것을 고르시오.",
      lines: [
        ["M", "The dolphin shuts down one half of its brain at a time."],
        ["M", "The frigate bird sleeps in the air during long flights."],
        ["M", "The sea otter wraps itself in seaweed before drifting off."],
        ["M", "The swift can stay aloft for months at a time."],
        ["M", "Sleep bends to fit the life around it."],
      ],
      choices: ["dolphins", "frigate birds", "sea otters", "swifts", "penguins"],
      answer: 5,
      clue: "The swift can stay aloft for months at a time.",
      explanation:
        "돌고래, 군함조, 해달, 칼새는 언급되지만 펭귄은 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
