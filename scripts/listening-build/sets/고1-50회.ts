/** 고1 듣기 50회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 50회",
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
          "Good afternoon, students. This is the school library speaking. " +
            "For the past two years the study room has opened at eight in the morning, " +
            "which most of you told us was far too late during exam weeks. " +
            "Beginning next Monday the study room opens at seven instead. " +
            "The main library itself keeps its usual hours of nine to six. " +
            "Only the study room on the third floor opens early, " +
            "and only on weekdays during the four weeks before an exam. " +
            "Please enter through the side door, since the main entrance is locked until nine. " +
            "Keep your voice down in the stairwell; classes are not yet in session. " +
            "We hope the extra hour gives you a quieter start to the day.",
        ],
      ],
      choices: [
        "열람실 개방 시간 변경을 알리려고",
        "도서 반납을 당부하려고",
        "도서관 공사를 안내하려고",
        "독서 행사 참가를 권하려고",
        "자리 예약 방법을 알리려고",
      ],
      answer: 1,
      clue: "Beginning next Monday the study room opens at seven instead.",
      explanation:
        "열람실 개방 시간이 일곱 시로 앞당겨진다는 것을 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 학교 도서관입니다. 지난 두 해 동안 열람실은 아침 여덟 시에 열었는데, 시험 기간에는 너무 늦다고 여러분이 많이 말씀해 주셨습니다. 다음 주 월요일부터 열람실은 일곱 시에 엽니다. 도서관 본관은 아홉 시부터 여섯 시까지 그대로입니다. 3층 열람실만 일찍 열고, 그것도 시험 전 4주 동안 평일에만 그렇습니다. 아홉 시까지는 정문이 잠겨 있으니 옆문으로 들어와 주세요. 아직 수업 전이니 계단에서는 목소리를 낮춰 주시기 바랍니다. 한 시간이 더 생겨 하루를 더 조용히 시작하실 수 있기를 바랍니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, you put your phone in your bag during study time."],
        ["W", "In the bag, and the bag goes across the room."],
        ["M", "Isn't turning it face down enough?"],
        ["W", "Face down still means it's within reach of my hand."],
        ["M", "But you're not going to pick it up anyway."],
        ["W", "Deciding not to pick it up costs something every time."],
        ["M", "I never thought of deciding as costing anything."],
        ["W", "Twenty small refusals leave you tired by seven o'clock."],
        ["M", "So you remove the decision instead of winning it."],
        ["W", "Exactly. Distance does the work so I don't have to."],
        ["M", "That sounds easier than trying harder."],
        ["W", "Willpower runs out; distance doesn't."],
        ["M", "I'll leave mine in my locker tomorrow."],
      ],
      choices: [
        "의지로 참기보다 거리를 두는 편이 낫다",
        "공부할 때는 휴대폰을 꺼야 한다",
        "집중은 연습으로 기를 수 있다",
        "공부 시간을 정해 두어야 한다",
        "쉬는 시간을 자주 가져야 한다",
      ],
      answer: 1,
      clue: "Willpower runs out; distance doesn't.",
      explanation:
        "여자는 의지로 참기보다 거리를 두는 편이 낫다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 서연아, 너는 공부할 때 휴대폰을 가방에 넣더라.",
        "W: 가방에 넣고, 가방은 방 건너편에 둬.",
        "M: 엎어 놓는 걸로는 부족해?",
        "W: 엎어 놔도 손이 닿는 거리잖아.",
        "M: 어차피 집어 들지 않을 거면서.",
        "W: 집어 들지 않기로 하는 데도 매번 뭔가 든다고.",
        "M: 결정하는 데 뭐가 든다고는 생각 못 했어.",
        "W: 작은 거절을 스무 번 하면 일곱 시쯤엔 지쳐 있어.",
        "M: 그러니까 이기는 대신 결정 자체를 없애는 거구나.",
        "W: 맞아. 거리가 대신 해 주니까 내가 안 해도 돼.",
        "M: 더 애쓰는 것보다 쉬워 보이네.",
        "W: 의지는 바닥나지만 거리는 안 바닥나.",
        "M: 내일은 내 것도 사물함에 두고 와야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "When something goes wrong in a group, we look for the person who did it. " +
            "Someone forgot, someone was late, someone did not check. " +
            "This feels like an explanation, but it rarely is one. " +
            "If the same thing goes wrong with three different people, " +
            "the problem is not sitting inside any of those three. " +
            "It is in the way the work was handed over, or never written down. " +
            "Blaming a person ends the conversation and changes nothing; " +
            "asking what made the mistake easy changes it for everyone after. " +
            "So when the next thing goes wrong, resist the first question. " +
            "Ask how the situation invited it, not who walked into it.",
        ],
      ],
      choices: [
        "잘못을 사람에게 묻기보다 일하는 방식을 봐야 한다",
        "실수는 곧바로 알려야 한다",
        "모둠 활동은 역할을 나눠야 한다",
        "책임자를 정해 두어야 한다",
        "기록을 남기는 습관이 필요하다",
      ],
      answer: 1,
      clue: "Ask how the situation invited it, not who walked into it.",
      explanation:
        "사람을 탓하기보다 일이 돌아가는 방식을 봐야 한다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 모둠에서 일이 잘못되면 우리는 그것을 한 사람을 찾습니다. 누가 잊었고, 누가 늦었고, 누가 확인하지 않았다고 합니다. 설명처럼 들리지만 실은 설명인 경우가 드뭅니다. 서로 다른 세 사람에게서 같은 일이 잘못된다면, 문제는 그 셋 가운데 누구의 안에도 있지 않습니다. 일이 넘겨진 방식, 또는 아무도 적어 두지 않은 데에 있습니다. 사람을 탓하면 대화가 끝나고 아무것도 바뀌지 않습니다. 무엇이 그 실수를 쉽게 만들었는지 물으면 그 뒤의 모두에게 바뀝니다. 그러니 다음에 일이 잘못되면 가장 먼저 떠오르는 물음을 참으십시오. 누가 걸려들었는지가 아니라, 상황이 어떻게 그것을 불러들였는지 물으십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Nayoung, is this the photo of the club's new office?"],
        ["W", "Yes, we moved in at the start of the month."],
        ["M", "There's a long desk under the window."],
        ["W", "Three laptops fit on it side by side."],
        ["M", "And a round clock hangs above the door."],
        ["W", "A square one, actually. The round one belonged to the old room."],
        ["M", "I see a bookcase against the right wall."],
        ["W", "Four shelves, mostly old yearbooks."],
        ["M", "There's a small rug in front of the bookcase."],
        ["W", "It came from my house."],
        ["M", "And a wastebasket stands beside the desk."],
        ["W", "We empty it every Friday afternoon."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "A square one, actually. The round one belonged to the old room.",
      explanation:
        "문 위 시계가 둥글다고 했지만 네모난 시계라고 했다. 따라서 답은 ②이다.",
      figure: {
        kind: "figure5",
        scene:
          "A small club office room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A LONG DESK stands under the window. " +
          "A ROUND CLOCK hangs on the wall above the door. " +
          "A BOOKCASE with four shelves stands against the right wall. " +
          "A SMALL RUG lies in front of the bookcase. " +
          "A WASTEBASKET stands beside the desk.",
        spots: [
          [0.4, 0.6],
          [0.14, 0.15],
          [0.85, 0.45],
          [0.76, 0.82],
          [0.24, 0.8],
        ],
      },
      translation: [
        "M: 나영아, 이게 동아리 새 사무실 사진이야?",
        "W: 응, 이번 달 초에 옮겨 왔어.",
        "M: 창문 아래에 긴 책상이 있네.",
        "W: 노트북 세 대가 나란히 들어가.",
        "M: 그리고 문 위에 둥근 시계가 걸려 있고.",
        "W: 사실 네모난 거야. 둥근 건 예전 방 거였어.",
        "M: 오른쪽 벽에는 책장이 보여.",
        "W: 네 칸인데 대부분 예전 졸업 앨범이야.",
        "M: 책장 앞에 작은 깔개가 있네.",
        "W: 우리 집에서 가져온 거야.",
        "M: 그리고 책상 옆에 휴지통이 있고.",
        "W: 금요일 오후마다 비워.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaerin, the parents' meeting starts in thirty-five minutes."],
        ["W", "The chairs are set out and the name cards are placed."],
        ["M", "Did anyone check the projector in the hall?"],
        ["W", "I turned it on and the picture came up fine."],
        ["M", "What about the sound for the video?"],
        ["W", "I didn't try the sound at all."],
        ["M", "The speaker cable is in the broadcasting room."],
        ["W", "Someone borrowed it for the assembly last week."],
        ["M", "The broadcasting room closes at four o'clock."],
        ["W", "It's a quarter to four already."],
        ["M", "I'll finish putting out the handouts here."],
        ["W", "I'll go and get the speaker cable."],
      ],
      choices: [
        "유인물을 놓기",
        "이름표를 놓기",
        "스피커 선을 가져오기",
        "영사기를 켜기",
        "학부모를 맞이하기",
      ],
      answer: 3,
      clue: "I'll go and get the speaker cable.",
      explanation:
        "여자는 방송실에서 스피커 선을 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "M: 채린아, 학부모 모임이 35분 뒤에 시작해.",
        "W: 의자는 놓았고 이름표도 놨어.",
        "M: 강당 영사기는 누가 확인했어?",
        "W: 내가 켜 봤는데 화면은 잘 나왔어.",
        "M: 영상 나올 소리는?",
        "W: 소리는 아예 안 해 봤어.",
        "M: 스피커 선이 방송실에 있어.",
        "W: 지난주 조회 때 누가 빌려 갔어.",
        "M: 방송실은 네 시에 닫아.",
        "W: 벌써 네 시 15분 전이야.",
        "M: 나는 여기서 유인물 놓는 걸 마무리할게.",
        "W: 내가 가서 스피커 선을 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the sports center. How can I help you?"],
        ["M", "I'd like to book the badminton court for two hours."],
        ["W", "The court costs eight dollars an hour on weekdays."],
        ["M", "Is the weekend rate different?"],
        ["W", "It goes up to twelve dollars on Saturday and Sunday."],
        ["M", "We'll come on Thursday evening, then."],
        ["W", "Do you need to rent rackets as well?"],
        ["M", "Two rackets, please."],
        ["W", "Rackets are two dollars each for the whole booking."],
        ["M", "Is there a student rate?"],
        ["W", "Ten percent off the total with a school card."],
        ["M", "Here's my card. I'll pay now."],
      ],
      choices: ["$16.20", "$18.00", "$19.80", "$20.00", "$21.60"],
      answer: 2,
      clue: "The court costs eight dollars an hour on weekdays.",
      explanation:
        "코트 두 시간 16달러와 라켓 두 개 4달러로 20달러인데, 10퍼센트를 빼면 18달러이다. 따라서 답은 ②이다.",
      translation: [
        "W: 체육 센터에 오신 걸 환영합니다. 무엇을 도와드릴까요?",
        "M: 배드민턴 코트를 두 시간 예약하고 싶어요.",
        "W: 평일에는 한 시간에 8달러입니다.",
        "M: 주말에는 값이 다른가요?",
        "W: 토요일과 일요일에는 12달러로 오릅니다.",
        "M: 그럼 목요일 저녁에 올게요.",
        "W: 라켓도 빌리시겠어요?",
        "M: 두 개 주세요.",
        "W: 라켓은 예약 전체에 한 개당 2달러입니다.",
        "M: 학생 할인은 있나요?",
        "W: 학생증이 있으면 전체에서 10퍼센트 할인됩니다.",
        "M: 여기 학생증이요. 지금 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 도서관에 가지 못하는 이유를 고르시오.",
      lines: [
        ["W", "Junseo, aren't you coming to the library this evening?"],
        ["W", "We always study there on Tuesdays."],
        ["M", "I know, and I already packed my books."],
        ["W", "Did your afternoon class run long again?"],
        ["M", "It finished at the usual time, four o'clock."],
        ["W", "Then is it your part-time job?"],
        ["M", "I don't work on Tuesdays at all."],
        ["W", "So what came up?"],
        ["M", "My younger brother is home alone with a fever."],
        ["W", "Are your parents away?"],
        ["M", "They come back after eight tonight."],
        ["W", "Then you should be with him. I'll send you my notes."],
      ],
      choices: [
        "아픈 동생을 돌봐야 해서",
        "수업이 늦게 끝나서",
        "아르바이트를 해야 해서",
        "몸이 아파서",
        "책을 두고 와서",
      ],
      answer: 1,
      clue: "My younger brother is home alone with a fever.",
      explanation:
        "남자는 열이 나는 동생을 돌봐야 해서 갈 수 없다. 따라서 답은 ①이다.",
      translation: [
        "W: 준서야, 오늘 저녁에 도서관 안 와?",
        "W: 우리 화요일마다 거기서 공부하잖아.",
        "M: 알아. 책도 벌써 챙겼어.",
        "W: 오후 수업이 또 길어졌어?",
        "M: 평소대로 네 시에 끝났어.",
        "W: 그럼 아르바이트야?",
        "M: 화요일에는 일 안 해.",
        "W: 그럼 무슨 일이 생겼어?",
        "M: 동생이 열이 나는데 집에 혼자 있어.",
        "W: 부모님이 안 계셔?",
        "M: 오늘 여덟 시 넘어서 오셔.",
        "W: 그럼 동생 곁에 있어야지. 내 필기 보내 줄게.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 학교 텃밭 동아리에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Dahye, what does the garden club actually do?"],
        ["M", "I'm thinking of joining next term."],
        ["W", "We look after the beds behind the gymnasium."],
        ["M", "How often do you meet?"],
        ["W", "Twice a week, Tuesday and Friday after school."],
        ["M", "What are you growing at the moment?"],
        ["W", "Lettuce, green onions and a few herbs."],
        ["M", "Who teaches you how to plant things?"],
        ["W", "A farmer from the village comes once a month."],
        ["M", "What happens to the vegetables in the end?"],
        ["W", "They go straight to the school kitchen."],
        ["M", "That's better than I expected."],
        ["W", "Come along on Friday and see for yourself."],
      ],
      choices: ["활동하는 곳", "모이는 요일", "기르는 작물", "수확물의 쓰임", "회원 수"],
      answer: 5,
      clue: "We look after the beds behind the gymnasium.",
      explanation:
        "장소, 요일, 작물, 수확물 쓰임은 말했지만 회원 수는 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 다혜야, 텃밭 동아리는 실제로 뭘 해?",
        "M: 다음 학기에 들어갈까 생각 중이야.",
        "W: 체육관 뒤 텃밭을 돌봐.",
        "M: 얼마나 자주 모여?",
        "W: 일주일에 두 번, 화요일이랑 금요일 방과 후에.",
        "M: 지금은 뭘 기르고 있어?",
        "W: 상추, 파, 허브 몇 가지.",
        "M: 심는 법은 누가 가르쳐 줘?",
        "W: 마을 농부 한 분이 한 달에 한 번 오셔.",
        "M: 채소는 결국 어떻게 돼?",
        "W: 곧장 학교 급식실로 가.",
        "M: 생각보다 괜찮네.",
        "W: 금요일에 와서 직접 봐.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 교내 미술 전시회에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, students. Here is the news about the school art exhibition. " +
            "The exhibition opens next Tuesday and runs for five days. " +
            "Works are shown in the hallway on the first floor. " +
            "Paintings, photographs and small sculptures are all welcome. " +
            "Each student may submit one work only. " +
            "Bring your work to the art room by this Friday afternoon. " +
            "Please do not touch any of the works while visiting. " +
            "Visitors may leave a short note on the board beside each piece. " +
            "The exhibition closes at five on the final day.",
        ],
      ],
      choices: [
        "다음 주 화요일부터 닷새 동안 열린다",
        "1층 복도에 전시한다",
        "그림·사진·작은 조각을 낼 수 있다",
        "한 사람이 한 점만 낼 수 있다",
        "작품은 전시 당일에 가져오면 된다",
      ],
      answer: 5,
      clue: "Bring your work to the art room by this Friday afternoon.",
      explanation:
        "작품은 이번 주 금요일 오후까지 미술실에 가져오라고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 교내 미술 전시회 소식입니다. 전시는 다음 주 화요일에 시작해 닷새 동안 이어집니다. 작품은 1층 복도에 전시합니다. 그림, 사진, 작은 조각 모두 환영합니다. 학생 한 명이 한 점만 낼 수 있습니다. 이번 주 금요일 오후까지 미술실로 작품을 가져와 주세요. 관람하는 동안 작품에 손대지 말아 주세요. 관람하신 분은 작품 옆 판에 짧은 글을 남길 수 있습니다. 마지막 날에는 다섯 시에 전시를 닫습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 예약할 숙소를 고르시오.",
      lines: [
        ["M", "Sujin, which guesthouse will your family book for the trip?"],
        ["W", "Five places came up when I searched near the beach."],
        ["M", "How many of you are going this time?"],
        ["W", "Six of us, including my grandmother."],
        ["M", "Then any place that sleeps only four is out."],
        ["W", "Two of these take four guests at most."],
        ["M", "What about the price for one night?"],
        ["W", "Under a hundred thousand won, my father said."],
        ["M", "One of them is well above that amount."],
        ["W", "And my grandmother cannot climb stairs anymore."],
        ["M", "So the room has to be on the ground floor."],
        ["W", "She would never manage a second-floor room."],
        ["M", "Then only one place fits all three conditions."],
        ["W", "I'll book it before someone else takes it."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Six of us, including my grandmother.",
      explanation:
        "6인 수용, 10만 원 미만, 1층인 숙소는 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Sleeps: 4 / Price: 80,000 won / Floor: Ground" },
          { no: 2, label: "②", value: "Sleeps: 6 / Price: 120,000 won / Floor: Ground" },
          { no: 3, label: "③", value: "Sleeps: 4 / Price: 90,000 won / Floor: 2nd" },
          { no: 4, label: "④", value: "Sleeps: 6 / Price: 95,000 won / Floor: 2nd" },
          { no: 5, label: "⑤", value: "Sleeps: 6 / Price: 98,000 won / Floor: Ground" },
        ],
      },
      translation: [
        "M: 수진아, 너희 가족은 여행 때 어느 숙소를 예약할 거야?",
        "W: 해변 근처로 찾아보니 다섯 곳이 나왔어.",
        "M: 이번에 몇 명이 가?",
        "W: 할머니까지 여섯 명.",
        "M: 그럼 네 명까지만 되는 곳은 빠지네.",
        "W: 이 중 두 곳은 많아야 네 명이야.",
        "M: 하룻밤 값은?",
        "W: 아버지가 10만 원 미만이라고 하셨어.",
        "M: 하나는 그 액수를 훨씬 넘어.",
        "W: 그리고 할머니가 이제 계단을 못 오르셔.",
        "M: 그럼 방이 1층이어야 하네.",
        "W: 2층 방은 절대 못 쓰셔.",
        "M: 그럼 세 조건에 다 맞는 곳은 하나뿐이야.",
        "W: 다른 사람이 잡기 전에 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Have you started the group presentation yet?"],
        ["W", "I made the whole outline last night."],
        ["M", "We present on Monday morning, first period."],
        ["W", "That leaves us the whole weekend to practice."],
        ["M", "Shall we run through it together on Sunday?"],
      ],
      choices: [
        "The presentation is over.",
        "I don't have a group.",
        "There is no outline.",
        "Sure, at two o'clock.",
        "Monday was yesterday.",
      ],
      answer: 4,
      clue: "Shall we run through it together on Sunday?",
      explanation:
        "일요일에 같이 연습하자는 제안이므로, 두 시에 하자는 ④가 가장 자연스럽다.",
      translation: [
        "M: 조별 발표 시작했어?",
        "W: 어젯밤에 개요를 통째로 만들었어.",
        "M: 월요일 아침 1교시에 발표해.",
        "W: 그럼 주말이 통째로 남네.",
        "M: 일요일에 같이 맞춰 볼까?",
        "W: 좋아, 두 시에.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, can I use the practice room after school?"],
        ["M", "Yes, until six on weekdays."],
        ["W", "Do I need to book it in advance?"],
        ["M", "Only if you want it for more than an hour."],
        ["W", "Where would I book it?"],
      ],
      choices: [
        "The room is closed.",
        "At the office downstairs.",
        "I don't practice there.",
        "You can't book anything.",
        "Six is too late.",
      ],
      answer: 2,
      clue: "Where would I book it?",
      explanation:
        "어디서 예약하는지 물었으므로, 아래층 사무실이라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 방과 후에 연습실을 써도 되나요?",
        "M: 네, 평일에는 여섯 시까지요.",
        "W: 미리 예약해야 하나요?",
        "M: 한 시간 넘게 쓰실 때만요.",
        "W: 어디서 예약하나요?",
        "M: 아래층 사무실에서요.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Areum, how is the class recycling corner going?"],
        ["W", "Almost nobody uses it."],
        ["M", "Where did you put the bins?"],
        ["W", "At the back of the classroom, behind the last row."],
        ["M", "So a student has to walk past everyone to reach them."],
        ["W", "I chose there because it was out of the way."],
        ["M", "Out of the way also means out of use."],
        ["W", "I suppose nobody wants to cross the room."],
        ["M", "Where do people already stand every day?"],
        ["W", "By the door, waiting for the bell."],
        ["M", "Could the bins go there instead?"],
      ],
      choices: [
        "There is no space by the door.",
        "Yes, I'll move them tomorrow.",
        "Nobody recycles anything.",
        "I'll remove the bins.",
        "The door is always locked.",
      ],
      answer: 2,
      clue: "Could the bins go there instead?",
      explanation:
        "수거함을 문 옆으로 옮길 수 있는지 물었으므로, 내일 옮기겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 아름아, 학급 분리수거함은 잘돼 가?",
        "W: 거의 아무도 안 써.",
        "M: 통을 어디에 뒀어?",
        "W: 교실 뒤쪽, 맨 뒷줄 뒤에.",
        "M: 그럼 거기 가려면 다들 앞을 지나야 하잖아.",
        "W: 방해 안 되는 자리라서 거기로 골랐어.",
        "M: 방해 안 되는 자리는 안 쓰이는 자리이기도 해.",
        "W: 아무도 교실을 가로지르고 싶지 않겠지.",
        "M: 사람들이 매일 이미 서 있는 데가 어디야?",
        "W: 문 옆, 종 치기를 기다리면서.",
        "M: 통을 거기로 옮길 수 있을까?",
        "W: 응, 내일 옮길게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Minjun, you said your reading speed hasn't improved."],
        ["M", "I read the same number of pages as in March."],
        ["W", "How do you read a page, exactly?"],
        ["M", "I say every word quietly in my head."],
        ["W", "That sets your speed at talking speed."],
        ["M", "I didn't realize that was slowing me down."],
        ["W", "Your eyes can move much faster than your mouth."],
        ["M", "How would I stop doing it?"],
        ["W", "Try following the line with a finger, a little too fast."],
        ["M", "So the finger pulls the eyes along."],
        ["W", "When could you try that for ten minutes?"],
      ],
      choices: [
        "I never read anything.",
        "Tonight, before bed.",
        "I'll read out loud instead.",
        "Reading speed doesn't matter.",
        "I'll stop using my eyes.",
      ],
      answer: 2,
      clue: "When could you try that for ten minutes?",
      explanation:
        "언제 10분 동안 해 볼지 물었으므로, 오늘 밤 자기 전이라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 민준아, 읽는 속도가 안 늘었다고 했잖아.",
        "M: 3월이랑 똑같은 쪽수를 읽어.",
        "W: 한 쪽을 정확히 어떻게 읽어?",
        "M: 머릿속으로 낱말을 하나하나 소리 내어 읽어.",
        "W: 그럼 속도가 말하는 속도로 정해져.",
        "M: 그게 느리게 만드는 줄 몰랐어.",
        "W: 눈은 입보다 훨씬 빨리 움직일 수 있어.",
        "M: 어떻게 하면 안 그럴 수 있어?",
        "W: 손가락으로 줄을 조금 빠르게 따라가 봐.",
        "M: 손가락이 눈을 끌고 가는 거구나.",
        "W: 언제 10분쯤 해 볼 수 있어?",
        "M: 오늘 밤, 자기 전에.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Yerin이 Kiyoung에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Yerin : ________________",
      lines: [
        [
          "W",
          "Yerin and Kiyoung are preparing the club's yearly report together. " +
            "Kiyoung has written a careful account of everything the club did, " +
            "and he has attached photographs of each activity to the file. " +
            "The report must be sent to the school office by email tonight. " +
            "Yerin has just noticed that the file is now ninety megabytes, " +
            "while the office accepts attachments of ten megabytes at most. " +
            "The email would simply bounce back without anyone reading it. " +
            "She wants to tell him to make the photographs smaller first. " +
            "In this situation, what would Yerin most likely say to Kiyoung?",
        ],
      ],
      choices: [
        "Add more photographs to the file.",
        "The report is due next month.",
        "We should make the photos smaller.",
        "Let's send it by post instead.",
        "Nobody reads the report anyway.",
      ],
      answer: 3,
      clue: "She wants to tell him to make the photographs smaller first.",
      explanation:
        "파일이 너무 커서 메일이 되돌아오므로, 사진을 줄이자는 ③이 가장 적절하다.",
      translation: [
        "W: 예린이와 기영이는 동아리 한 해 보고서를 함께 준비하고 있습니다. 기영이는 동아리가 한 일을 꼼꼼히 적었고, 활동마다 사진을 파일에 붙였습니다. 보고서는 오늘 밤까지 학교 사무실로 전자우편으로 보내야 합니다. 예린이는 파일이 90메가바이트가 되었다는 것을 방금 알아챘는데, 사무실은 최대 10메가바이트까지만 받습니다. 그러면 아무도 읽지 못한 채 메일이 되돌아옵니다. 그녀는 먼저 사진을 작게 줄이자고 말하고 싶습니다. 이런 상황에서 예린이가 기영이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about how animals build " +
            "without any plan, any measurement, or anyone in charge. " +
            "The honeybee makes a wall of six-sided rooms " +
            "that uses the least wax for the most space, " +
            "though no single bee has ever seen the whole comb. " +
            "The termite raises a tower taller than a house, " +
            "with tunnels that pull cool air through it all day. " +
            "The weaver bird ties true knots in strips of grass, " +
            "hanging a nest that swings safely away from climbing snakes. " +
            "The caddisfly larva glues sand and shell into a tube " +
            "sized exactly to the body it will grow into. " +
            "Nothing here was designed, and yet everything fits.",
        ],
      ],
      choices: [
        "how animals build without any plan",
        "why insects live in large colonies",
        "how birds choose where to nest",
        "why towers need strong foundations",
        "how rivers shape the land over time",
      ],
      answer: 1,
      clue: "Nothing here was designed, and yet everything fits.",
      explanation:
        "설계 없이 짓는 동물들의 방식이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 동물들이 설계도도, 치수도, 지휘하는 이도 없이 어떻게 짓는지 이야기하려 합니다. 꿀벌은 여섯모 방으로 된 벽을 만드는데, 가장 적은 밀랍으로 가장 넓은 공간을 씁니다. 어느 벌 한 마리도 벌집 전체를 본 적이 없는데도 그렇습니다. 흰개미는 집보다 높은 탑을 세우고, 그 안의 굴이 하루 종일 시원한 공기를 끌어들입니다. 베짜기새는 풀잎을 진짜 매듭으로 묶어, 기어오르는 뱀에게서 안전하게 흔들리는 둥지를 매답니다. 날도래 애벌레는 모래와 조개껍데기를 붙여 관을 만드는데, 앞으로 자랄 제 몸에 꼭 맞는 크기입니다. 어느 것도 설계된 적이 없는데, 모든 것이 들어맞습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 동물이 아닌 것을 고르시오.",
      lines: [
        ["M", "The honeybee makes a wall of six-sided rooms."],
        ["M", "The termite raises a tower taller than a house."],
        ["M", "The weaver bird ties true knots in strips of grass."],
        ["M", "The caddisfly larva glues sand and shell into a tube."],
        ["M", "Nothing here was designed, and yet everything fits."],
      ],
      choices: ["honeybees", "termites", "weaver birds", "caddisfly larvae", "beavers"],
      answer: 5,
      clue: "The caddisfly larva glues sand and shell into a tube.",
      explanation:
        "꿀벌, 흰개미, 베짜기새, 날도래 애벌레는 언급되지만 비버는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
