/** 고1 듣기 52회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 52회",
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
          "Good afternoon, students. This is the school office speaking. " +
            "The heating in the east wing has not worked since Tuesday, " +
            "and the engineer tells us the part will arrive on Friday. " +
            "Until then the classrooms on that side stay cold in the morning. " +
            "From tomorrow, first and second period for those classes " +
            "will be held in the rooms on the third floor of the west wing. " +
            "Your homeroom teacher will tell you which room to go to. " +
            "Take everything you need for the morning with you, " +
            "because you will not come back to your own room until lunch. " +
            "Afternoon classes return to normal once the sun warms the building. " +
            "We are sorry for the trouble and hope to fix it by the weekend.",
        ],
      ],
      choices: [
        "난방 고장으로 교실을 옮긴다고 알리려고",
        "공사 일정을 안내하려고",
        "겨울옷 준비를 당부하려고",
        "시험 일정 변경을 알리려고",
        "보건실 이용을 안내하려고",
      ],
      answer: 1,
      clue: "will be held in the rooms on the third floor of the west wing",
      explanation:
        "난방 고장으로 오전 수업 교실을 옮긴다고 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 학교 행정실입니다. 화요일부터 동관 난방이 되지 않고 있고, 기술자 말로는 부품이 금요일에 온다고 합니다. 그때까지 그쪽 교실은 아침에 춥습니다. 내일부터 그 학급들의 1교시와 2교시는 서관 3층 교실에서 합니다. 어느 교실로 갈지는 담임 선생님이 알려 주십니다. 점심때까지는 제 교실로 돌아오지 않으니 오전에 필요한 것을 모두 챙겨 가세요. 오후 수업은 해가 건물을 데운 뒤라 평소대로 합니다. 불편을 드려 죄송하고 주말까지는 고치겠습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Hyunwoo says you never study with music on."],
        ["W", "Not with words in it, anyway."],
        ["M", "Does music with words really make a difference?"],
        ["W", "Reading and listening to words use the same part of the brain."],
        ["M", "So the song is competing with the page."],
        ["W", "Every line you hear is a line you half-read."],
        ["M", "But silence makes me sleepy."],
        ["W", "Then use something without words at all."],
        ["M", "I always thought any music was the same."],
        ["W", "The tiredness you feel at nine is partly that competition."],
        ["M", "I'd never connected the two."],
        ["W", "Words in your ear cost you words on the page."],
        ["M", "I'll try instrumental music tonight."],
      ],
      choices: [
        "가사 있는 음악은 읽기를 방해한다",
        "공부할 때는 음악을 꺼야 한다",
        "조용한 곳에서 공부해야 한다",
        "음악은 기분을 좋게 한다",
        "휴식 시간에 음악을 들어야 한다",
      ],
      answer: 1,
      clue: "Words in your ear cost you words on the page.",
      explanation:
        "여자는 가사 있는 음악이 읽기를 방해한다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 현우가 그러는데 너는 음악 틀고는 공부를 안 한다며.",
        "W: 적어도 가사 있는 건 안 틀어.",
        "M: 가사 있는 음악이 정말 차이가 나?",
        "W: 읽는 것과 말을 듣는 것이 뇌의 같은 데를 써.",
        "M: 그럼 노래가 책하고 다투는 거네.",
        "W: 네가 듣는 한 줄이 곧 반만 읽은 한 줄이야.",
        "M: 그런데 조용하면 졸려.",
        "W: 그럼 가사가 아예 없는 걸 틀어.",
        "M: 나는 음악이면 다 같은 줄 알았어.",
        "W: 아홉 시쯤 느끼는 피로도 일부는 그 다툼 때문이야.",
        "M: 둘을 이어 볼 생각을 못 했어.",
        "W: 귀에 든 말이 종이 위의 말을 잡아먹어.",
        "M: 오늘 밤엔 연주곡으로 해 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "A question asked badly will get a useless answer, every time. " +
            "Students come to me and say they do not understand a chapter. " +
            "There is nothing I can do with that sentence. " +
            "But when someone says the third step of the proof lost them, " +
            "the whole conversation takes about ninety seconds. " +
            "The work of narrowing the question is the work of learning. " +
            "You cannot point at the exact place you got lost " +
            "unless you have walked back and found it yourself. " +
            "By the time your question is sharp enough to ask, " +
            "you have usually answered most of it already.",
        ],
      ],
      choices: [
        "질문을 좁히는 과정 자체가 공부다",
        "모르는 것은 바로 물어야 한다",
        "선생님께 질문을 자주 해야 한다",
        "증명은 단계별로 익혀야 한다",
        "복습은 그날 안에 해야 한다",
      ],
      answer: 1,
      clue: "The work of narrowing the question is the work of learning.",
      explanation:
        "질문을 좁히는 일 자체가 배움이라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 엉성하게 던진 질문은 언제나 쓸모없는 답을 받습니다. 학생들이 와서 어떤 단원을 모르겠다고 말합니다. 그 문장으로 제가 할 수 있는 일은 없습니다. 그러나 누군가 증명의 세 번째 단계에서 길을 잃었다고 말하면, 대화 전체가 90초쯤이면 끝납니다. 질문을 좁히는 일이 곧 배우는 일입니다. 스스로 되짚어 가서 찾아내지 않으면 어디서 길을 잃었는지 짚을 수 없습니다. 질문이 물어볼 만큼 날카로워졌을 무렵이면, 여러분은 대개 그 답의 대부분을 이미 낸 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Dain, is this the photo of the school garden shed?"],
        ["W", "Yes, the club finished painting it last month."],
        ["M", "There's a wide door in the middle of the front."],
        ["W", "It's wide enough to carry a wheelbarrow through."],
        ["M", "And a small window on the left of the door."],
        ["W", "On the right, actually. The left side is solid wall."],
        ["M", "I see a watering can beside the door."],
        ["W", "We fill it from the tap behind the shed."],
        ["M", "There's a row of pots along the front wall."],
        ["W", "Six pots, all of them herbs."],
        ["M", "And a wooden sign hangs above the door."],
        ["W", "Minji carved it during the summer break."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "On the right, actually. The left side is solid wall.",
      explanation:
        "창문이 문 왼쪽에 있다고 했지만 오른쪽이라고 했다. 따라서 답은 ②이다.",
      figure: {
        kind: "figure5",
        scene:
          "A small wooden garden shed seen from the front, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A WIDE DOOR stands in the middle of the front wall. " +
          "A SMALL WINDOW is set on the LEFT side of the door. " +
          "A WATERING CAN stands on the ground beside the door. " +
          "A ROW OF SIX POTS with herbs lines the front wall. " +
          "A WOODEN SIGN hangs on the wall above the door.",
        spots: [
          [0.5, 0.55],
          [0.2, 0.42],
          [0.68, 0.78],
          [0.42, 0.9],
          [0.5, 0.22],
        ],
      },
      translation: [
        "M: 다인아, 이게 학교 텃밭 창고 사진이야?",
        "W: 응, 지난달에 동아리가 칠을 끝냈어.",
        "M: 앞면 가운데에 넓은 문이 있네.",
        "W: 손수레가 지나갈 만큼 넓어.",
        "M: 그리고 문 왼쪽에 작은 창문이 있고.",
        "W: 사실 오른쪽이야. 왼쪽은 막힌 벽이야.",
        "M: 문 옆에 물뿌리개가 보여.",
        "W: 창고 뒤 수도에서 물을 받아.",
        "M: 앞벽을 따라 화분이 줄지어 있네.",
        "W: 여섯 개, 전부 허브야.",
        "M: 그리고 문 위에 나무 간판이 걸려 있고.",
        "W: 민지가 여름 방학에 깎아 만들었어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Bora, the science fair opens in forty minutes."],
        ["W", "Our poster is up and the model is on the table."],
        ["M", "Did anyone print the handouts for the judges?"],
        ["W", "I made the file but never pressed print."],
        ["M", "Three judges need one copy each."],
        ["W", "The computer room printer was broken this morning."],
        ["M", "The library printer works, though."],
        ["W", "The library closes at four on Wednesdays."],
        ["M", "It's half past three right now."],
        ["W", "Then there's just enough time if I leave now."],
        ["M", "I'll finish arranging the model on the table."],
        ["W", "I'll go and print the handouts at the library."],
      ],
      choices: [
        "포스터를 붙이기",
        "모형을 놓기",
        "도서관에서 유인물을 출력하기",
        "심사위원을 맞이하기",
        "인쇄기를 고치기",
      ],
      answer: 3,
      clue: "I'll go and print the handouts at the library.",
      explanation:
        "여자는 도서관에서 유인물을 출력하겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "M: 보라야, 과학 전시회가 40분 뒤에 열어.",
        "W: 포스터는 붙였고 모형도 탁자에 올렸어.",
        "M: 심사위원 드릴 유인물은 누가 출력했어?",
        "W: 파일은 만들었는데 인쇄를 안 눌렀어.",
        "M: 심사위원 세 분께 한 부씩 필요해.",
        "W: 오늘 아침에 컴퓨터실 인쇄기가 고장 났어.",
        "M: 도서관 인쇄기는 되잖아.",
        "W: 도서관은 수요일에 네 시에 닫아.",
        "M: 지금 세 시 반이야.",
        "W: 지금 나가면 시간이 딱 되겠다.",
        "M: 나는 탁자에 모형 놓는 걸 마무리할게.",
        "W: 내가 도서관에서 유인물을 출력할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the bookshop. Are you finding everything?"],
        ["M", "I'd like three paperbacks and two notebooks."],
        ["W", "The paperbacks on that table are seven dollars each."],
        ["M", "Are the ones by the window the same price?"],
        ["W", "Those are nine dollars, they came in last week."],
        ["M", "I'll take three from the table, then."],
        ["W", "And the notebooks are three dollars each."],
        ["M", "That comes to quite a lot together."],
        ["W", "Members of our reading club get ten percent off."],
        ["M", "I joined in September. Here's my card."],
        ["W", "Then the discount applies to the whole purchase."],
        ["M", "Good, I'll pay by card."],
      ],
      choices: ["$21.60", "$22.50", "$23.40", "$24.30", "$27.00"],
      answer: 4,
      clue: "The paperbacks on that table are seven dollars each.",
      explanation:
        "문고본 세 권 21달러와 공책 두 권 6달러로 27달러인데, 10퍼센트를 빼면 24.30달러이다. 따라서 답은 ④이다.",
      translation: [
        "W: 서점에 오신 걸 환영합니다. 찾으시는 건 있으세요?",
        "M: 문고본 세 권이랑 공책 두 권 주세요.",
        "W: 저 탁자에 있는 문고본은 한 권에 7달러입니다.",
        "M: 창가에 있는 것도 같은 값인가요?",
        "W: 그건 9달러예요. 지난주에 들어왔습니다.",
        "M: 그럼 탁자에서 세 권 고를게요.",
        "W: 공책은 한 권에 3달러입니다.",
        "M: 다 합치면 꽤 되네요.",
        "W: 저희 독서 모임 회원은 10퍼센트 할인됩니다.",
        "M: 9월에 가입했어요. 여기 카드요.",
        "W: 그럼 전체 구매에 할인이 들어갑니다.",
        "M: 좋네요, 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 방과 후 강좌를 그만둔 이유를 고르시오.",
      lines: [
        ["W", "Seongjun, I heard you dropped the after-school course."],
        ["W", "You went every Tuesday for two months."],
        ["M", "I sent the form in last Friday."],
        ["W", "Was the course too difficult for you?"],
        ["M", "It was hard, but I liked that about it."],
        ["W", "Then did it cost too much?"],
        ["M", "My parents had already paid for the whole term."],
        ["W", "So what happened?"],
        ["M", "They moved it from four o'clock to six."],
        ["W", "And your bus home leaves at six fifteen."],
        ["M", "I'd never make it, and the next one is at eight."],
        ["W", "That's a shame. Maybe it will move back."],
      ],
      choices: [
        "수업 시간이 바뀌어 차 시간과 맞지 않아서",
        "수업이 너무 어려워서",
        "수강료가 비싸서",
        "몸이 아파서",
        "다른 강좌를 듣게 되어서",
      ],
      answer: 1,
      clue: "They moved it from four o'clock to six.",
      explanation:
        "수업이 여섯 시로 옮겨져 버스 시간과 맞지 않게 되었다. 따라서 답은 ①이다.",
      translation: [
        "W: 성준아, 방과 후 강좌를 그만뒀다며.",
        "W: 두 달 동안 화요일마다 갔잖아.",
        "M: 지난 금요일에 서류를 냈어.",
        "W: 수업이 너무 어려웠어?",
        "M: 어렵긴 했는데 그게 좋았어.",
        "W: 그럼 수강료가 비쌌어?",
        "M: 부모님이 이미 한 학기 치를 다 내셨어.",
        "W: 그럼 무슨 일이 있었어?",
        "M: 수업을 네 시에서 여섯 시로 옮겼어.",
        "W: 그리고 네가 타는 버스가 여섯 시 15분에 떠나지.",
        "M: 절대 못 타. 다음 차는 여덟 시야.",
        "W: 아쉽다. 다시 돌아올지도 모르지.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 합창 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Taeho, is your class entering the choir contest?"],
        ["W", "The notice went up on the hall door yesterday."],
        ["M", "I saw it. When is it held?"],
        ["W", "On the last Friday of this month, in the main hall."],
        ["M", "How many songs does each class sing?"],
        ["W", "Two, and one of them has to be in English."],
        ["M", "How long can each class take?"],
        ["W", "Eight minutes altogether, including walking on and off."],
        ["M", "Is there anything we must not do?"],
        ["W", "No recorded backing music, only live playing."],
        ["M", "That makes the piano part important."],
        ["W", "Apply at the music room by Thursday."],
        ["M", "Then I'll ask our class this afternoon."],
      ],
      choices: ["열리는 날과 장소", "부르는 곡 수", "한 반에 주어지는 시간", "금지된 것", "심사 기준"],
      answer: 5,
      clue: "On the last Friday of this month, in the main hall.",
      explanation:
        "날짜와 장소, 곡 수, 시간, 금지 사항은 말했지만 심사 기준은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 태호야, 너희 반 합창 대회 나가?",
        "W: 어제 강당 문에 알림이 붙었어.",
        "M: 봤어. 언제 해?",
        "W: 이번 달 마지막 금요일, 대강당에서.",
        "M: 한 반이 몇 곡을 불러?",
        "W: 두 곡. 그중 한 곡은 영어여야 해.",
        "M: 한 반에 시간이 얼마나 주어져?",
        "W: 드나드는 시간까지 합쳐 8분.",
        "M: 하면 안 되는 게 있어?",
        "W: 녹음 반주는 안 되고 직접 연주만 돼.",
        "M: 그럼 피아노 맡는 사람이 중요하겠네.",
        "W: 목요일까지 음악실에서 신청해.",
        "M: 그럼 오늘 오후에 우리 반에 물어볼게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 학교 자전거 점검의 날에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. Here is the plan for the bicycle check day. " +
            "It takes place next Wednesday in the yard behind the gymnasium. " +
            "Two repair workers from the city come from one until four. " +
            "They check the brakes, the chain and the lights on each bicycle. " +
            "Small repairs are done on the spot at no cost to you. " +
            "Parts that need replacing must be paid for by the owner. " +
            "Bring your bicycle at any time during those three hours. " +
            "You do not need to sign up in advance. " +
            "Students who walk to school may bring a family member's bicycle.",
        ],
      ],
      choices: [
        "체육관 뒤 마당에서 한다",
        "한 시부터 네 시까지 진행된다",
        "브레이크와 체인, 등을 점검한다",
        "간단한 수리는 무료로 해 준다",
        "미리 신청해야 한다",
      ],
      answer: 5,
      clue: "You do not need to sign up in advance.",
      explanation:
        "미리 신청할 필요가 없다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 자전거 점검의 날 계획을 알려 드립니다. 다음 주 수요일에 체육관 뒤 마당에서 진행됩니다. 시에서 오신 수리 기사 두 분이 한 시부터 네 시까지 계십니다. 자전거마다 브레이크, 체인, 등을 점검해 주십니다. 간단한 수리는 그 자리에서 돈을 받지 않고 해 드립니다. 부품을 갈아야 하는 경우에는 주인이 부품값을 내셔야 합니다. 그 세 시간 안에 아무 때나 자전거를 가져오시면 됩니다. 미리 신청하실 필요는 없습니다. 걸어서 등교하는 학생은 가족의 자전거를 가져오셔도 됩니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 고를 견학 장소를 고르시오.",
      lines: [
        ["M", "Chaewon, which place should our class visit for the field trip?"],
        ["W", "Five places sent us their information this week."],
        ["M", "We leave at nine and must be back by three."],
        ["W", "So anywhere more than an hour away is out."],
        ["M", "That still leaves us a few to choose from."],
        ["W", "The fee has to stay under ten thousand won each."],
        ["M", "The school covers exactly that much per student."],
        ["W", "One of them is above that amount."],
        ["M", "And it has to take thirty students at one time."],
        ["W", "Two of these only take twenty at once."],
        ["M", "Then only one place fits all three conditions."],
        ["W", "I'll call them tomorrow morning to book it."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "We leave at nine and must be back by three.",
      explanation:
        "한 시간 이내, 1만 원 미만, 30명 수용인 곳은 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Travel: 90 min / Fee: 8,000 won / Capacity: 30" },
          { no: 2, label: "②", value: "Travel: 40 min / Fee: 12,000 won / Capacity: 30" },
          { no: 3, label: "③", value: "Travel: 50 min / Fee: 9,000 won / Capacity: 20" },
          { no: 4, label: "④", value: "Travel: 30 min / Fee: 7,000 won / Capacity: 20" },
          { no: 5, label: "⑤", value: "Travel: 45 min / Fee: 9,500 won / Capacity: 30" },
        ],
      },
      translation: [
        "M: 채원아, 현장 학습은 어디로 갈까?",
        "W: 이번 주에 다섯 곳에서 안내를 보내왔어.",
        "M: 아홉 시에 떠나서 세 시까지 돌아와야 해.",
        "W: 그럼 한 시간 넘게 걸리는 데는 빠지네.",
        "M: 그래도 고를 게 몇 곳 남아.",
        "W: 비용은 한 사람에 1만 원 미만이어야 해.",
        "M: 학교에서 딱 그만큼 대 줘.",
        "W: 하나는 그보다 비싸.",
        "M: 그리고 서른 명을 한 번에 받아야 해.",
        "W: 이 중 두 곳은 스무 명까지만 돼.",
        "M: 그럼 세 조건에 다 맞는 곳은 하나뿐이야.",
        "W: 내일 아침에 전화해서 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Have you decided what to write about for the essay?"],
        ["W", "I have two ideas but neither feels right."],
        ["M", "The draft is due on Thursday morning."],
        ["W", "That gives me two more evenings."],
        ["M", "Shall we talk them both through after school?"],
      ],
      choices: [
        "The essay was last term.",
        "Sure, in the library.",
        "I never write essays.",
        "Thursday already passed.",
        "There is no draft.",
      ],
      answer: 2,
      clue: "Shall we talk them both through after school?",
      explanation:
        "방과 후에 같이 얘기하자는 제안이므로, 도서관에서 하자는 ②가 가장 자연스럽다.",
      translation: [
        "M: 글 주제 정했어?",
        "W: 생각은 둘인데 둘 다 마음에 안 들어.",
        "M: 초고가 목요일 아침까지야.",
        "W: 그럼 저녁이 이틀 남네.",
        "M: 방과 후에 둘 다 짚어 볼까?",
        "W: 좋아, 도서관에서.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, can I borrow a laptop from the library?"],
        ["M", "Yes, for three hours at a time."],
        ["W", "Do I need to leave my student card?"],
        ["M", "We only write the number down."],
        ["W", "Can I take it out of the building?"],
      ],
      choices: [
        "The library has no laptops.",
        "No, it stays inside.",
        "I don't have a card.",
        "Three hours is too long.",
        "You can't come in.",
      ],
      answer: 2,
      clue: "Can I take it out of the building?",
      explanation:
        "건물 밖으로 가져가도 되는지 물었으므로, 안에서만 쓴다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 도서관에서 노트북을 빌릴 수 있나요?",
        "M: 네, 한 번에 세 시간까지요.",
        "W: 학생증을 맡겨야 하나요?",
        "M: 번호만 적어 둡니다.",
        "W: 건물 밖으로 가져가도 되나요?",
        "M: 아니요, 건물 안에서만 쓰셔야 합니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Kiyoung, how is the club's new website going?"],
        ["M", "It's been up for a month and nobody visits."],
        ["W", "How do people find out that it exists?"],
        ["M", "We told everyone at the first meeting in March."],
        ["W", "That was seven months ago, though."],
        ["M", "I suppose most of them have forgotten."],
        ["W", "Where do club members actually look every week?"],
        ["M", "The group chat, mostly. It never stops."],
        ["W", "And the website address has never been posted there."],
        ["M", "I never thought to put it in the chat."],
        ["W", "When could you post it?"],
      ],
      choices: [
        "Nobody reads the chat.",
        "Tonight, after dinner.",
        "We'll close the website.",
        "There is no group chat.",
        "I posted it in March.",
      ],
      answer: 2,
      clue: "When could you post it?",
      explanation:
        "언제 올릴 수 있는지 물었으므로, 오늘 밤 저녁 먹고라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 기영아, 동아리 새 누리집은 잘돼 가?",
        "M: 한 달째 열려 있는데 아무도 안 와.",
        "W: 사람들이 그게 있다는 걸 어떻게 알아?",
        "M: 3월 첫 모임에서 다들한테 말했어.",
        "W: 그게 일곱 달 전이잖아.",
        "M: 대부분 잊었겠지.",
        "W: 동아리 회원들이 매주 실제로 들여다보는 데가 어디야?",
        "M: 대부분 단체 대화방. 거긴 쉬지를 않아.",
        "W: 그런데 누리집 주소를 거기 올린 적이 없지.",
        "M: 대화방에 올릴 생각을 못 했어.",
        "W: 언제 올릴 수 있어?",
        "M: 오늘 밤, 저녁 먹고.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nari, you said your notes are useless when you review."],
        ["W", "I write down everything the teacher says."],
        ["M", "How many pages is one lesson, then?"],
        ["W", "Six or seven, sometimes more."],
        ["M", "And when you read them back?"],
        ["W", "Everything looks equally important."],
        ["M", "Because nothing on the page says what mattered."],
        ["W", "I hadn't thought about marking anything."],
        ["M", "One line at the top would do it."],
        ["W", "A line saying what the lesson was really about."],
        ["M", "When could you write that line?"],
      ],
      choices: [
        "I'd write it next year.",
        "In the minute after class.",
        "I'll write ten pages instead.",
        "Nothing matters in class.",
        "I'll stop taking notes.",
      ],
      answer: 2,
      clue: "When could you write that line?",
      explanation:
        "언제 그 한 줄을 쓸 수 있는지 물었으므로, 수업 직후 1분이라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나리야, 복습할 때 네 필기가 쓸모없다고 했잖아.",
        "W: 선생님 말씀을 다 받아 적어.",
        "M: 그럼 한 수업이 몇 쪽이야?",
        "W: 예닐곱 쪽, 더 될 때도 있어.",
        "M: 그걸 다시 읽으면?",
        "W: 다 똑같이 중요해 보여.",
        "M: 쪽 어디에도 뭐가 중요한지 적혀 있지 않으니까.",
        "W: 표시할 생각은 못 했어.",
        "M: 맨 위에 한 줄이면 돼.",
        "W: 그 수업이 결국 뭐였는지 적는 한 줄.",
        "M: 그 한 줄을 언제 쓸 수 있어?",
        "W: 수업 끝나고 1분 안에.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Junho가 Seoyeon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Junho : ________________",
      lines: [
        [
          "M",
          "Junho and Seoyeon are packing up after the club's outdoor shoot. " +
            "Seoyeon is about to put the camera into her backpack " +
            "while the lens cap is still lying on the bench beside her. " +
            "The bag is full of books and a water bottle that has leaked before. " +
            "Junho knows the front of the lens scratches easily " +
            "and that a scratch there shows up in every photograph afterwards. " +
            "The cap is right there and takes one second to put on. " +
            "He wants to tell her to put the cap on before packing it. " +
            "In this situation, what would Junho most likely say to Seoyeon?",
        ],
      ],
      choices: [
        "Take more photographs first.",
        "The shoot is tomorrow.",
        "Put the lens cap on first.",
        "Leave the camera on the bench.",
        "We should buy a new camera.",
      ],
      answer: 3,
      clue: "He wants to tell her to put the cap on before packing it.",
      explanation:
        "뚜껑을 씌우지 않고 가방에 넣으려 하므로, 뚜껑부터 씌우라는 ③이 가장 적절하다.",
      translation: [
        "M: 준호와 서연이는 동아리 야외 촬영을 마치고 정리하고 있습니다. 서연이는 렌즈 뚜껑이 옆 의자에 놓인 채로 사진기를 배낭에 넣으려고 합니다. 가방에는 책이 가득하고, 전에 새어 나온 적 있는 물병도 들어 있습니다. 준호는 렌즈 앞면이 쉽게 긁히고, 거기 난 흠집이 그 뒤 모든 사진에 나타난다는 것을 압니다. 뚜껑은 바로 옆에 있고 씌우는 데 1초면 됩니다. 그는 넣기 전에 뚜껑부터 씌우라고 말하고 싶습니다. 이런 상황에서 준호가 서연이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about how living things " +
            "make light inside their own bodies, without any heat at all. " +
            "The firefly mixes two chemicals in its lower abdomen " +
            "and flashes a pattern that only its own species answers. " +
            "Deep in the ocean, the anglerfish dangles a glowing lure " +
            "grown from bacteria that live nowhere else but in that organ. " +
            "Certain mushrooms on rotting wood shine faintly all night, " +
            "drawing insects that carry their spores away to new trees. " +
            "Some squid release a cloud of light instead of ink, " +
            "leaving a bright shape behind while they disappear into the dark. " +
            "In every case the light is a message, not a mistake.",
        ],
      ],
      choices: [
        "how living things produce their own light",
        "why deep oceans are completely dark",
        "how insects find their way at night",
        "why mushrooms grow on rotting wood",
        "how squid escape from predators",
      ],
      answer: 1,
      clue: "In every case the light is a message, not a mistake.",
      explanation:
        "생물들이 스스로 빛을 내는 방식이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 오늘은 생물들이 열 없이 제 몸 안에서 어떻게 빛을 만드는지 이야기하려 합니다. 반딧불이는 배 아래쪽에서 두 가지 물질을 섞어, 제 종만 답하는 무늬로 빛을 깜빡입니다. 깊은 바다에서 아귀는 빛나는 미끼를 늘어뜨리는데, 그 빛은 그 기관 말고는 어디에도 살지 않는 세균에서 나옵니다. 썩은 나무에 난 어떤 버섯은 밤새 희미하게 빛나, 홀씨를 새 나무로 옮겨 줄 벌레를 불러들입니다. 어떤 오징어는 먹물 대신 빛 구름을 뿜어, 밝은 형체를 남겨 두고 어둠 속으로 사라집니다. 어느 경우든 그 빛은 실수가 아니라 전하는 말입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 생물이 아닌 것을 고르시오.",
      lines: [
        ["W", "The firefly mixes two chemicals in its lower abdomen."],
        ["W", "The anglerfish dangles a glowing lure deep in the ocean."],
        ["W", "Certain mushrooms on rotting wood shine faintly all night."],
        ["W", "Some squid release a cloud of light instead of ink."],
        ["W", "In every case the light is a message."],
      ],
      choices: ["fireflies", "anglerfish", "mushrooms", "squid", "jellyfish"],
      answer: 5,
      clue: "Some squid release a cloud of light instead of ink.",
      explanation:
        "반딧불이, 아귀, 버섯, 오징어는 언급되지만 해파리는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
