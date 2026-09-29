/** 고1 듣기 42회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 42회",
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
          "Good afternoon, students. This is Mr. Kang from the career department. " +
            "I want to tell you about the job shadowing day in November. " +
            "Twenty workplaces in our city have agreed to take two students each, " +
            "and you will spend a whole working day beside someone doing that job. " +
            "You do not choose the workplace from a list. " +
            "You write down the kind of work you are curious about " +
            "and we match you as closely as we can. " +
            "Applications open on Monday and close at the end of the following week. " +
            "Forty places sounds like many until you remember there are three hundred of you. " +
            "Come to the career room if you want to hear more. Thank you.",
        ],
      ],
      choices: [
        "진로 상담을 권하려고",
        "직업 체험의 날 신청을 안내하려고",
        "봉사 활동을 모집하려고",
        "진로 강연을 소개하려고",
        "학과 선택 방법을 설명하려고",
      ],
      answer: 2,
      clue: "Applications open on Monday and close at the end of the following week.",
      explanation:
        "남자는 11월에 있을 직업 체험의 날과 그 신청 방법을 안내한다. 따라서 답은 ②이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 진로부 강 선생님입니다. 11월에 있을 직업 체험의 날에 대해 말씀드립니다. 우리 시의 일터 스무 곳이 학생을 두 명씩 받기로 했고, 여러분은 그 일을 하는 사람 곁에서 하루를 온전히 보내게 됩니다. 목록에서 일터를 고르는 방식이 아닙니다. 어떤 일이 궁금한지 적어 내면 저희가 최대한 가깝게 이어 드립니다. 신청은 월요일에 시작해 그다음 주말에 마감합니다. 마흔 자리가 많아 보이지만 여러분이 삼백 명이라는 것을 떠올리면 그렇지 않습니다. 더 듣고 싶으면 진로실로 오세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Sujin, I've been listening to the same English clip for a week."],
        ["W", "The same three minutes, every day?"],
        ["M", "Yes, and I still miss about a fifth of it."],
        ["W", "Have you looked at the script at any point?"],
        ["M", "Not once. I want to train my ears, not my eyes."],
        ["W", "Then you'll hear the same wrong thing for another week."],
        ["M", "Isn't reading it cheating, though?"],
        ["W", "Listen first, then read, then listen once more."],
        ["M", "What does the last listening add?"],
        ["W", "That's when the sound finally attaches to the word you now know."],
        ["M", "So the script is a bridge, not an answer sheet."],
        ["W", "Exactly. Without it you're just guessing more confidently."],
      ],
      choices: [
        "듣기는 대본 없이 반복해야 한다",
        "듣기 뒤에 대본을 보고 다시 들어야 한다",
        "긴 자료를 들어야 한다",
        "받아쓰기를 매일 해야 한다",
        "속도를 늦춰 들어야 한다",
      ],
      answer: 2,
      clue: "Listen first, then read, then listen once more.",
      explanation:
        "여자는 먼저 듣고 대본을 읽은 뒤 한 번 더 들으라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 수진아, 일주일 내내 같은 영어 자료를 듣고 있어.",
        "W: 같은 3분을 매일?",
        "M: 응, 그런데 아직도 5분의 1쯤은 안 들려.",
        "W: 중간에 대본을 한 번이라도 봤어?",
        "M: 한 번도. 눈이 아니라 귀를 훈련하고 싶어.",
        "W: 그럼 앞으로 일주일도 똑같이 잘못 들을 거야.",
        "M: 그래도 대본을 보는 건 반칙 아니야?",
        "W: 먼저 듣고, 그다음 읽고, 한 번 더 들어.",
        "M: 마지막 듣기가 뭘 더해 주는데?",
        "W: 그때 소리가 네가 이제 아는 낱말에 가서 붙어.",
        "M: 그럼 대본은 정답지가 아니라 다리구나.",
        "W: 맞아. 그게 없으면 더 자신 있게 찍고 있는 것뿐이야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "A room tells you what to do in it long before you decide anything. " +
            "If your bed is two steps from your desk, you will lie down. " +
            "If your phone is charging beside your notebook, you will reach for it, " +
            "and you will believe each time that you chose to. " +
            "Willpower is a weak and tired thing by seven in the evening. " +
            "Arrangement never gets tired. " +
            "Move the charger to another room and the decision disappears, " +
            "because there is nothing left to decide about.",
        ],
      ],
      choices: [
        "의지를 기르는 방법을 배워야 한다",
        "휴대폰을 아예 쓰지 말아야 한다",
        "공부 시간을 짧게 나눠야 한다",
        "책상을 자주 바꿔야 한다",
        "공부 환경을 미리 정리해 두어야 한다",
      ],
      answer: 5,
      clue: "Move the charger to another room and the decision disappears.",
      explanation:
        "남자는 의지에 기대지 말고 방의 배치를 바꾸어 결정을 없애라고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 방은 여러분이 무엇을 정하기 훨씬 전에 그 안에서 무엇을 할지 일러 줍니다. 침대가 책상에서 두 걸음 거리면 여러분은 눕게 됩니다. 휴대폰이 공책 옆에서 충전되고 있으면 손이 가게 되고, 매번 스스로 골랐다고 믿게 됩니다. 의지는 저녁 일곱 시쯤이면 약하고 지친 것입니다. 배치는 결코 지치지 않습니다. 충전기를 다른 방으로 옮기면 그 결정은 사라집니다. 더 이상 정할 것이 남아 있지 않기 때문입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Sangwoo, is this the class garden you built?"],
        ["M", "Yes, we finished the beds two weeks ago."],
        ["W", "A wooden bench stands at the left end."],
        ["M", "We sit there while we wait for our turn."],
        ["W", "There's a tall watering can beside the bench."],
        ["M", "It holds enough for the whole row."],
        ["W", "I count three raised beds in the middle."],
        ["M", "There are four. The last one is behind the shed."],
        ["W", "A small shed stands on the right."],
        ["M", "The tools live in there when we're not using them."],
        ["W", "And a square sign is fixed to the fence at the back."],
        ["M", "The art club painted it for us in June."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. The last one is behind the shed.",
      explanation:
        "여자가 화단이 세 개라고 하자 남자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.09, 0.62],
          [0.22, 0.78],
          [0.5, 0.75],
          [0.85, 0.5],
          [0.55, 0.12],
        ],
        scene:
          "A school garden outdoors drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A WOODEN BENCH stands at the far LEFT end of the garden. " +
          "A TALL WATERING CAN stands on the ground right beside the bench. " +
          "EXACTLY THREE RECTANGULAR RAISED GARDEN BEDS with low wooden sides sit in a row across the MIDDLE of the picture, " +
          "clearly separated with gaps between them so all three are easy to count. " +
          "A SMALL GARDEN SHED with a sloped roof stands on the RIGHT. " +
          "A SQUARE BLANK SIGN BOARD is fixed to the FENCE running along the back.",
      },
      translation: [
        "W: 상우야, 여기가 너희가 만든 학급 텃밭이야?",
        "M: 응, 두 주 전에 화단을 다 만들었어.",
        "W: 왼쪽 끝에 나무 의자가 있네.",
        "M: 차례를 기다리면서 거기 앉아.",
        "W: 의자 옆에는 키 큰 물뿌리개가 있고.",
        "M: 한 줄 전체에 줄 만큼 들어가.",
        "W: 가운데에 화단이 세 개 보여.",
        "M: 네 개야. 마지막 하나는 창고 뒤에 있어.",
        "W: 오른쪽에는 작은 창고가 서 있네.",
        "M: 안 쓸 때는 연장을 거기에 둬.",
        "W: 그리고 뒤쪽 울타리에 네모난 표지가 붙어 있어.",
        "M: 6월에 미술 동아리가 그려 줬어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Dohyun, the class newspaper goes to print on Thursday."],
        ["M", "Are all the articles in the folder now?"],
        ["W", "Nine of them, and the tenth arrived this morning."],
        ["M", "Has anyone read them for spelling?"],
        ["W", "Two of us went through them yesterday evening."],
        ["M", "Then we're almost ready to send it."],
        ["W", "Except the photographs. Three articles have none."],
        ["M", "Which three are missing pictures?"],
        ["W", "The sports one, the interview and the food page."],
        ["M", "I took photos at the match last Friday."],
        ["W", "And the other two still need something."],
        ["M", "I'll take the two missing photos after school."],
      ],
      choices: [
        "기사를 교정하기",
        "인쇄소에 보내기",
        "빠진 사진을 찍기",
        "기사를 더 쓰기",
        "면 배치를 바꾸기",
      ],
      answer: 3,
      clue: "I'll take the two missing photos after school.",
      explanation:
        "남자는 방과 후에 빠진 사진 두 장을 찍겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 도현아, 학급 신문이 목요일에 인쇄 들어가.",
        "M: 기사는 이제 다 폴더에 있어?",
        "W: 아홉 개는 있었고 열 번째가 오늘 아침에 왔어.",
        "M: 맞춤법은 누가 봤어?",
        "W: 어제저녁에 둘이서 다 훑었어.",
        "M: 그럼 거의 보낼 준비가 됐네.",
        "W: 사진만 빼고. 기사 세 개에 사진이 없어.",
        "M: 어떤 셋에 사진이 없는데?",
        "W: 체육 기사, 인터뷰, 음식 면.",
        "M: 지난 금요일 경기에서는 내가 사진을 찍었어.",
        "W: 그럼 나머지 둘은 아직 필요하네.",
        "M: 방과 후에 빠진 사진 두 장 찍을게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the city pool. How can I help you?"],
        ["W", "I'd like to buy tickets for a school group."],
        ["M", "How many people are in the group?"],
        ["W", "Twelve students and one teacher."],
        ["M", "A student ticket is five dollars, and an adult is eight."],
        ["W", "Do we pay extra for the lockers?"],
        ["M", "A locker is one dollar, and each person needs one."],
        ["W", "Then thirteen lockers, please."],
        ["M", "Would you like to rent towels as well?"],
        ["W", "No, everyone has brought their own."],
        ["M", "Groups of ten or more get ten dollars off the total."],
        ["W", "Here is the school card, then."],
      ],
      choices: ["$71", "$74", "$81", "$68", "$78"],
      answer: 1,
      clue: "A student ticket is five dollars, and an adult is eight.",
      explanation:
        "학생 열두 명 60달러와 어른 8달러, 사물함 13달러를 더하면 81달러이고, 단체 할인 10달러를 빼면 71달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 시립 수영장에 오신 걸 환영합니다. 무엇을 도와드릴까요?",
        "W: 학교 단체 표를 사려고요.",
        "M: 몇 분이신가요?",
        "W: 학생 열두 명과 선생님 한 분이요.",
        "M: 학생 표는 5달러, 어른은 8달러입니다.",
        "W: 사물함은 따로 내야 하나요?",
        "M: 사물함은 하나에 1달러이고 한 사람에 하나씩 필요합니다.",
        "W: 그럼 열세 개요.",
        "M: 수건도 빌리시겠어요?",
        "W: 아니요, 다들 각자 가져왔어요.",
        "M: 열 명 이상 단체는 전체에서 10달러를 빼 드립니다.",
        "W: 그럼 여기 학교 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 동아리 모임에 늦은 이유를 고르시오.",
      lines: [
        ["M", "Chaeyeon, you came in twenty minutes after we started."],
        ["W", "I know, and I'm sorry about that."],
        ["M", "Did the last class run over again?"],
        ["W", "It finished exactly on time today."],
        ["M", "Then were you looking for the room?"],
        ["W", "No, I had to return the science equipment first."],
        ["M", "The set your group used this morning?"],
        ["W", "Yes, and the teacher was not in the lab until four."],
        ["M", "So you waited outside the lab for a while."],
        ["W", "About fifteen minutes, with the box in my arms."],
      ],
      choices: [
        "수업이 늦게 끝나서",
        "교실을 못 찾아서",
        "실험 기구를 돌려주느라",
        "버스를 놓쳐서",
        "선생님과 상담하느라",
      ],
      answer: 3,
      clue: "No, I had to return the science equipment first.",
      explanation:
        "여자는 실험 기구를 돌려주느라 늦었다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 채연아, 시작하고 20분이나 지나서 왔네.",
        "W: 알아. 미안해.",
        "M: 마지막 수업이 또 늦게 끝났어?",
        "W: 오늘은 정확히 제시간에 끝났어.",
        "M: 그럼 교실을 못 찾았어?",
        "W: 아니, 먼저 실험 기구를 돌려줘야 했어.",
        "M: 오늘 아침에 너희 조가 쓴 그거?",
        "W: 응, 그런데 선생님이 네 시까지 실험실에 안 계셨어.",
        "M: 그럼 실험실 앞에서 한참 기다린 거네.",
        "W: 15분쯤. 상자를 안고서.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 합창 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Junseo, is your class entering the choir contest?"],
        ["M", "We are, and we chose our song last week."],
        ["W", "When is the contest being held?"],
        ["M", "On the ninth of November, in the afternoon."],
        ["W", "Is it in the school hall as usual?"],
        ["M", "In the hall, and every class watches from the floor."],
        ["W", "How long can each class sing for?"],
        ["M", "Four minutes at most, including walking on and off."],
        ["W", "Do you have to wear something special?"],
        ["M", "School uniform, with one colour chosen by each class."],
        ["W", "That should look good from the back of the hall."],
      ],
      choices: ["대회 날짜", "대회가 열리는 곳", "노래할 수 있는 시간", "입어야 할 옷", "연습할 수 있는 장소"],
      answer: 5,
      clue: "On the ninth of November, in the afternoon.",
      explanation:
        "날짜, 장소, 시간, 복장은 말했지만 연습 장소는 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 준서야, 너희 반 합창 대회 나가?",
        "M: 나가. 지난주에 곡도 정했어.",
        "W: 대회는 언제 열려?",
        "M: 11월 9일 오후에.",
        "W: 늘 하던 대로 학교 강당에서 해?",
        "M: 강당에서 해. 모든 반이 바닥에 앉아서 봐.",
        "W: 한 반이 몇 분 부를 수 있어?",
        "M: 오르내리는 시간까지 넣어 최대 4분.",
        "W: 특별한 옷을 입어야 해?",
        "M: 교복에다 반마다 한 가지 색을 정해서 맞춰.",
        "W: 강당 뒤에서 봐도 보기 좋겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Cedar Hill Observatory에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Cedar Hill Observatory, which opened in two thousand and nine. " +
            "The observatory stands on the hill behind the old reservoir. " +
            "It is open to visitors on Friday and Saturday evenings only. " +
            "Doors open at seven, and the last group is admitted at ten. " +
            "The main telescope is used by staff, and visitors look through three smaller ones. " +
            "A short talk about the night sky is given every hour in the lecture room. " +
            "Entry is four thousand won, and school groups pay half that. " +
            "On cloudy nights the telescopes stay closed, but the talks go ahead as usual.",
        ],
      ],
      choices: [
        "옛 저수지 뒤 언덕에 있다",
        "금요일과 토요일 저녁에만 연다",
        "방문객은 작은 망원경으로 본다",
        "해설은 하루에 한 번만 한다",
        "흐린 밤에도 강의는 진행한다",
      ],
      answer: 4,
      clue: "A short talk about the night sky is given every hour in the lecture room.",
      explanation:
        "밤하늘 해설은 매시간 있다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 2009년에 문을 연 시더힐 천문대에 대해 알려 드립니다. 천문대는 옛 저수지 뒤 언덕 위에 있습니다. 방문객에게는 금요일과 토요일 저녁에만 엽니다. 문은 일곱 시에 열고 마지막 무리는 열 시에 들여보냅니다. 큰 망원경은 직원이 쓰고 방문객은 작은 망원경 세 대로 봅니다. 밤하늘에 대한 짧은 해설은 강의실에서 매시간 있습니다. 입장료는 4천 원이고 학교 단체는 그 절반을 냅니다. 흐린 밤에는 망원경을 열지 않지만 해설은 평소대로 진행합니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 남자가 구입할 자전거 자물쇠를 고르시오.",
      lines: [
        ["W", "Kiyoung, these five locks are all in the shop."],
        ["M", "I can't spend more than forty thousand won."],
        ["W", "Then the most expensive one is out."],
        ["M", "It also has to weigh under a kilogram."],
        ["W", "One of the remaining ones is one and a half."],
        ["M", "That would be heavy in a school bag all day."],
        ["W", "And do you want a key or a number lock?"],
        ["M", "A number, because I always lose keys."],
        ["W", "One of the last two uses a key."],
        ["M", "So there's only one lock left for me."],
        ["W", "I'd buy it today, before the sale ends."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "I can't spend more than forty thousand won.",
      explanation:
        "4만 원 이하, 1킬로그램 미만, 번호 자물쇠인 것을 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Price: 55,000 won / Weight: 0.8 kg / Type: Number" },
          { no: 2, label: "②", value: "Price: 30,000 won / Weight: 1.5 kg / Type: Number" },
          { no: 3, label: "③", value: "Price: 25,000 won / Weight: 0.9 kg / Type: Key" },
          { no: 4, label: "④", value: "Price: 38,000 won / Weight: 0.7 kg / Type: Number" },
          { no: 5, label: "⑤", value: "Price: 35,000 won / Weight: 0.6 kg / Type: Key" },
        ],
      },
      translation: [
        "W: 기영아, 이 다섯 개가 가게에 다 있어.",
        "M: 나는 4만 원 넘게는 못 써.",
        "W: 그럼 제일 비싼 건 빠지네.",
        "M: 무게도 1킬로그램 아래여야 해.",
        "W: 남은 것 중 하나는 1.5킬로그램이야.",
        "M: 하루 종일 가방에 넣고 다니기엔 무겁겠다.",
        "W: 열쇠식이 좋아, 번호식이 좋아?",
        "M: 번호식. 열쇠는 늘 잃어버려.",
        "W: 남은 둘 중 하나는 열쇠식이야.",
        "M: 그럼 나한테 남는 건 하나뿐이네.",
        "W: 할인 끝나기 전에 오늘 사는 게 좋겠어.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Minjae, did you collect the permission forms?"],
        ["M", "Eighteen so far. Four are still missing."],
        ["W", "The teacher needs all of them by three."],
        ["M", "Two of those students are in the library."],
        ["W", "Shall I go and find them for you?"],
      ],
      choices: [
        "No, the trip was cancelled.",
        "Yes, please, I'll wait here.",
        "I already have all the forms.",
        "The library is closed today.",
        "You should sign the form.",
      ],
      answer: 2,
      clue: "Shall I go and find them for you?",
      explanation:
        "대신 찾아 줄지 물었으므로, 여기서 기다리겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 민재야, 동의서 다 걷었어?",
        "M: 지금까지 열여덟 장. 네 장이 아직 없어.",
        "W: 선생님이 세 시까지 다 달라고 하셨어.",
        "M: 그중 두 명은 도서관에 있어.",
        "W: 내가 가서 찾아 줄까?",
        "M: 응, 부탁해. 나는 여기서 기다릴게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nayoung, is your group presenting on Monday?"],
        ["W", "On Tuesday, the first period."],
        ["M", "Have you booked the projector for that room?"],
        ["W", "I forgot about the projector completely."],
        ["M", "You can still book it at the office today."],
      ],
      choices: [
        "Thanks, I'll go there after class.",
        "We don't need a projector.",
        "The office is not open.",
        "Monday is fine for us.",
        "I booked it last week.",
      ],
      answer: 1,
      clue: "You can still book it at the office today.",
      explanation:
        "오늘 행정실에서 예약할 수 있다고 알려 주었으므로, 수업 끝나고 가겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 나영아, 너희 조 월요일에 발표해?",
        "W: 화요일 1교시에.",
        "M: 그 교실 영사기는 예약했어?",
        "W: 영사기는 완전히 잊고 있었어.",
        "M: 오늘 행정실에서 아직 예약할 수 있어.",
        "W: 고마워, 수업 끝나고 갈게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taeho, how is the debate practice going this term?"],
        ["M", "I keep losing the arguments I should be winning."],
        ["W", "What usually happens in the room?"],
        ["M", "I prepare my side and answer whatever comes."],
        ["W", "Do you prepare the other side as well?"],
        ["M", "Why would I? I'm not arguing for it."],
        ["W", "Because their strongest point decides your speech."],
        ["M", "I've always thought about my own points first."],
        ["W", "And then you meet theirs for the first time on the day."],
        ["M", "Which is exactly when I run out of answers."],
        ["W", "Write their three best arguments before you write yours."],
      ],
      choices: [
        "I never prepare anything.",
        "That's a useful order, I'll try it.",
        "The other side has no points.",
        "I'll leave the debate club.",
        "You should argue for me.",
      ],
      answer: 2,
      clue: "Write their three best arguments before you write yours.",
      explanation:
        "상대의 가장 강한 주장부터 적어 보라는 조언이므로, 해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태호야, 이번 학기 토론 연습은 어때?",
        "M: 이겨야 할 논쟁에서 자꾸 져.",
        "W: 보통 토론장에서 무슨 일이 일어나는데?",
        "M: 내 쪽을 준비하고 나오는 대로 답해.",
        "W: 상대 쪽도 준비해?",
        "M: 왜? 내가 주장할 쪽이 아닌데.",
        "W: 상대의 가장 강한 논점이 네 발언을 정하거든.",
        "M: 늘 내 논점부터 생각했어.",
        "W: 그러니 그들의 논점을 그날 처음 만나는 거지.",
        "M: 바로 그때 할 말이 떨어져.",
        "W: 네 주장을 쓰기 전에 상대의 가장 좋은 주장 세 개를 먼저 적어 봐.",
        "M: 순서가 쓸모 있겠다, 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yerin, you've been teaching your neighbour's son on Saturdays."],
        ["W", "Since the summer. He's in the fourth grade."],
        ["M", "What subject do you help him with?"],
        ["W", "Maths, mostly. He reads well but freezes at numbers."],
        ["M", "How do you get a ten year old to sit still?"],
        ["W", "We work for fifteen minutes and then play for five."],
        ["M", "Does that actually add up to much in an hour?"],
        ["W", "Forty-five minutes of real work, which is more than I managed at his age."],
        ["M", "And has his school work changed at all?"],
        ["W", "His last test was the first one he finished in time."],
        ["M", "Could I sit in one Saturday and watch?"],
      ],
      choices: [
        "Of course, come this Saturday.",
        "I stopped teaching in August.",
        "He doesn't study maths.",
        "You can't teach children.",
        "There are no lessons now.",
      ],
      answer: 1,
      clue: "Could I sit in one Saturday and watch?",
      explanation:
        "남자가 한 번 참관해도 되는지 물었으므로, 이번 토요일에 오라는 ①이 가장 자연스럽다.",
      translation: [
        "M: 예린아, 토요일마다 이웃집 아이를 가르친다며.",
        "W: 여름부터. 4학년이야.",
        "M: 무슨 과목을 도와줘?",
        "W: 주로 수학. 글은 잘 읽는데 숫자 앞에서 굳어.",
        "M: 열 살짜리를 어떻게 앉혀 둬?",
        "W: 15분 하고 5분 놀아.",
        "M: 한 시간에 그게 얼마나 되는데?",
        "W: 진짜 공부가 45분. 나는 그 나이에 그만큼도 못 했어.",
        "M: 학교 성적은 좀 달라졌어?",
        "W: 지난 시험이 시간 안에 끝낸 첫 시험이었어.",
        "M: 나도 토요일에 한 번 앉아서 봐도 돼?",
        "W: 그럼, 이번 토요일에 와.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Hyunjin이 Dayeon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Hyunjin : ________________",
      lines: [
        [
          "M",
          "Hyunjin and Dayeon are preparing the school open day together. " +
            "They have to print three hundred leaflets for the visiting parents. " +
            "Dayeon has just sent the file to the printing shop by email. " +
            "Hyunjin opens the same file and sees the date printed as the wrong Saturday. " +
            "Three hundred leaflets with the wrong date would be useless to everyone. " +
            "The shop begins printing in an hour and cannot stop once it starts. " +
            "Hyunjin wants her to call the shop immediately and hold the order. " +
            "In this situation, what would Hyunjin most likely say to Dayeon?",
        ],
      ],
      choices: [
        "Let's print four hundred instead.",
        "The leaflets look really beautiful.",
        "Call the shop now, the date is wrong.",
        "I'll design a new leaflet tonight.",
        "We should cancel the open day.",
      ],
      answer: 3,
      clue: "Hyunjin wants her to call the shop immediately and hold the order.",
      explanation:
        "날짜가 잘못된 채 인쇄되기 전에 가게에 전화해 멈춰야 하므로 ③이 가장 적절하다.",
      translation: [
        "M: 현진이와 다연이는 학교 개방일을 함께 준비하고 있습니다. 두 사람은 찾아오는 학부모를 위해 안내지 삼백 장을 인쇄해야 합니다. 다연이는 방금 그 파일을 인쇄소에 전자우편으로 보냈습니다. 현진이가 같은 파일을 열어 보니 날짜가 엉뚱한 토요일로 찍혀 있습니다. 날짜가 틀린 안내지 삼백 장은 아무에게도 쓸모가 없습니다. 인쇄소는 한 시간 뒤에 인쇄를 시작하고 한번 시작하면 멈출 수 없습니다. 현진이는 다연이가 지금 바로 전화해서 주문을 멈추기를 바랍니다. 이런 상황에서 현진이가 다연이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to explain why the sea is salty " +
            "while the rivers running into it are not. " +
            "Rain that falls on land is very slightly acidic, " +
            "and as it runs over rock it carries away tiny amounts of mineral salt. " +
            "Each river holds so little that we call its water fresh, " +
            "yet every one of them delivers that load to the sea without stopping. " +
            "The sea has no outlet. Water leaves it only by evaporating, " +
            "and evaporation takes the water and leaves every gram of salt behind. " +
            "Over hundreds of millions of years the tiny deliveries have added up, " +
            "and the sea we swim in is the result of a river that never emptied itself.",
        ],
      ],
      choices: [
        "how rivers shape valleys over time",
        "why the sea is salty while rivers are not",
        "how rain forms in the atmosphere",
        "why sea levels rise in warm periods",
        "how salt is taken from sea water",
      ],
      answer: 2,
      clue: "The sea has no outlet. Water leaves it only by evaporating.",
      explanation:
        "여자는 강이 실어 온 소금이 증발로 빠져나가지 못해 바다에 쌓인다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 바다로 흘러드는 강은 짜지 않은데 바다는 왜 짠지 설명하려 합니다. 땅에 내리는 비는 아주 약하게 산성이고, 바위 위를 흐르며 아주 적은 양의 광물 소금을 실어 갑니다. 강마다 실은 양이 너무 적어서 우리는 그 물을 민물이라고 부르지만, 모든 강이 그 짐을 쉬지 않고 바다로 나릅니다. 바다에는 나가는 곳이 없습니다. 물은 오직 증발로만 빠져나가는데, 증발은 물만 가져가고 소금은 한 그램도 남김없이 두고 갑니다. 수억 년 동안 그 작은 배달이 쌓였고, 우리가 헤엄치는 바다는 결코 비워지지 않은 강의 결과입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to explain why the sea is salty while rivers are not."],
        ["W", "Rain that falls on land is very slightly acidic."],
        ["W", "As it runs over rock it carries away tiny amounts of mineral salt."],
        ["W", "The sea has no outlet. Water leaves it only by evaporating."],
        ["W", "Over hundreds of millions of years the tiny deliveries have added up."],
      ],
      choices: [
        "rain being slightly acidic",
        "salt carried away from rock by water",
        "the sea having no outlet",
        "water leaving the sea by evaporating",
        "the deepest point of the ocean floor",
      ],
      answer: 5,
      clue: "Rain that falls on land is very slightly acidic.",
      explanation:
        "약한 산성인 비, 바위에서 씻겨 나오는 소금, 나가는 곳이 없는 바다, 증발로 빠져나가는 물은 언급되지만 바다의 가장 깊은 곳은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
