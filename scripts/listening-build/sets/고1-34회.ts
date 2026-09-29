/** 고1 듣기 34회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 34회",
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
          "Good afternoon, everyone. This is Mr. Yoon from the science department. " +
            "I am speaking about the laboratory on the third floor. " +
            "For the past two years any class could walk in and use the benches, " +
            "and twice this term we found burners left on after the last lesson. " +
            "From next week the laboratory will be locked between classes, " +
            "and a teacher will open it only for a booked session. " +
            "Your subject teacher books the room through the office, " +
            "so you do not need to do anything yourselves. " +
            "Club activities must also be booked, at least one day in advance. " +
            "The equipment and the seating plan stay exactly as they are. " +
            "Please do not prop the door open for a friend. Thank you for listening.",
        ],
      ],
      choices: [
        "실험 기구 구입을 알리려고",
        "과학 동아리 가입을 권하려고",
        "실험실 개방 방식 변경을 안내하려고",
        "안전 교육 일정을 알리려고",
        "실험 보고서 제출을 독촉하려고",
      ],
      answer: 3,
      clue: "From next week the laboratory will be locked between classes.",
      explanation:
        "남자는 다음 주부터 실험실을 수업 사이에 잠그고 예약된 수업에만 연다고 안내한다. 따라서 답은 ③이다.",
      translation: [
        "M: 여러분, 안녕하세요. 과학부 윤 선생님입니다. 3층 실험실에 대해 말씀드립니다. 지난 2년 동안은 어느 반이든 들어와 실험대를 쓸 수 있었고, 이번 학기에만 두 번 마지막 수업 뒤에 버너가 켜져 있는 것을 발견했습니다. 다음 주부터 실험실은 수업 사이에 잠급니다. 예약된 수업에만 선생님이 열어 줍니다. 과목 선생님이 행정실을 통해 예약하므로 여러분이 따로 할 일은 없습니다. 동아리 활동도 적어도 하루 전에 예약해야 합니다. 기구와 자리 배치는 지금 그대로입니다. 친구를 위해 문을 받쳐 열어 두지 말아 주세요. 들어 주셔서 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Sungho, I've made twelve slides for a five minute talk."],
        ["M", "Twelve? That's a new slide every twenty-five seconds."],
        ["W", "Each one has a picture and three lines of text."],
        ["M", "Then the audience will be reading while you are speaking."],
        ["W", "Isn't that helpful? They hear it and see it."],
        ["M", "They can't do both. Reading always wins, and your voice becomes background noise."],
        ["W", "So what should the slides hold?"],
        ["M", "One idea each, in as few words as you can manage."],
        ["W", "That feels almost empty."],
        ["M", "Empty slides make a full talk. The words belong in your mouth, not on the wall."],
        ["W", "I'd have to remember much more that way."],
        ["M", "You already know it. You wrote every line yourself."],
      ],
      choices: [
        "발표 자료에는 글을 적게 담아야 한다",
        "발표 시간을 길게 잡아야 한다",
        "그림보다 표를 써야 한다",
        "발표는 대본을 외워야 한다",
        "슬라이드 수를 늘려야 한다",
      ],
      answer: 1,
      clue: "One idea each, in as few words as you can manage.",
      explanation:
        "남자는 글이 많으면 청중이 읽느라 말을 듣지 않는다며 슬라이드에는 한 가지 생각만 적은 낱말로 담으라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 성호야, 5분짜리 발표에 슬라이드를 열두 장 만들었어.",
        "M: 열두 장? 25초마다 한 장씩 넘기는 거야.",
        "W: 한 장에 그림 하나랑 글 세 줄이 있어.",
        "M: 그럼 네가 말하는 동안 청중은 글을 읽고 있을 거야.",
        "W: 도움이 되지 않아? 듣고 보고 하잖아.",
        "M: 둘 다는 못 해. 읽기가 늘 이기고 네 목소리는 배경 소리가 돼.",
        "W: 그럼 슬라이드에는 뭘 넣어야 해?",
        "M: 한 장에 생각 하나. 되도록 적은 낱말로.",
        "W: 그러면 거의 비어 보이는데.",
        "M: 빈 슬라이드가 꽉 찬 발표를 만들어. 말은 벽이 아니라 네 입에 있어야 해.",
        "W: 그러면 외울 게 훨씬 많아지잖아.",
        "M: 이미 알고 있어. 그 줄들을 네가 다 썼잖아.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "When you set a new habit, almost everyone begins with the size of it. " +
            "An hour of exercise, thirty pages a night, two hundred words of English. " +
            "Size is the wrong place to start, because size is what breaks first. " +
            "Begin instead with the time and the place, " +
            "and make both so fixed that you never decide them again. " +
            "Ten minutes, at the same desk, right after dinner, " +
            "beats an hour whenever you happen to feel ready. " +
            "A habit that has a seat waiting for it survives a bad week. " +
            "Once the time and place hold, the size will grow by itself, " +
            "and you will not have to argue with yourself at eight o'clock every evening.",
        ],
      ],
      choices: [
        "습관은 양보다 시간과 장소를 고정해야 한다",
        "목표는 크게 세울수록 좋다",
        "습관은 친구와 함께 만들어야 한다",
        "기록을 남겨야 습관이 오래간다",
        "아침 시간을 활용해야 한다",
      ],
      answer: 1,
      clue: "Begin instead with the time and the place.",
      explanation:
        "여자는 습관을 만들 때 분량이 아니라 시간과 장소를 고정해야 오래간다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 새 습관을 들일 때 거의 모두가 분량부터 정합니다. 운동 한 시간, 밤마다 서른 쪽, 영어 단어 이백 개. 분량은 시작할 자리가 아닙니다. 가장 먼저 무너지는 것이 분량이기 때문입니다. 대신 시간과 장소부터 정하고, 둘을 다시는 고민하지 않을 만큼 고정하세요. 저녁을 먹고 바로 같은 책상에서 10분 하는 것이, 준비됐다고 느낄 때 한 시간 하는 것보다 낫습니다. 자리가 마련된 습관은 힘든 한 주도 버팁니다. 시간과 장소가 자리를 잡으면 분량은 저절로 늘고, 매일 여덟 시마다 자신과 싸우지 않아도 됩니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Yerin, is this the reading corner your class made?"],
        ["W", "Yes, we finished it the week before the exams."],
        ["M", "A striped rug covers the floor in the middle."],
        ["W", "We borrowed that from the kindergarten next door."],
        ["M", "There's a low round table on the left side."],
        ["W", "It holds the magazines that came in last month."],
        ["M", "The lamp beside the table has a square shade."],
        ["W", "It's round, actually. The square one broke in June."],
        ["M", "And a wide window fills the back wall."],
        ["W", "We open it whenever the room gets warm."],
        ["M", "There's a bookcase with three shelves on the right."],
        ["W", "The top shelf is for the books people are reading now."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "It's round, actually. The square one broke in June.",
      explanation:
        "남자가 전등갓이 네모라고 하자 여자가 둥글다고 바로잡는다. 그림에는 네모난 갓이 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.86],
          [0.2, 0.62],
          [0.12, 0.3],
          [0.55, 0.14],
          [0.85, 0.42],
        ],
        scene:
          "A school reading corner drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A STRIPED RUG covers the floor across the MIDDLE FRONT of the room. " +
          "A LOW ROUND TABLE holding magazines stands on the LEFT side of the rug. " +
          "A FLOOR LAMP with a clearly SQUARE BOX-SHAPED SHADE stands just behind and above the table on the far LEFT. " +
          "A WIDE WINDOW fills the BACK WALL in the upper middle. " +
          "A BOOKCASE WITH THREE SHELVES stands against the RIGHT wall.",
      },
      translation: [
        "M: 예린아, 여기가 너희 반이 만든 독서 공간이야?",
        "W: 응, 시험 전주에 다 만들었어.",
        "M: 가운데 바닥에 줄무늬 깔개가 깔려 있네.",
        "W: 옆 유치원에서 빌린 거야.",
        "M: 왼쪽에는 낮고 둥근 탁자가 있고.",
        "W: 지난달에 들어온 잡지를 올려 뒀어.",
        "M: 탁자 옆 전등은 갓이 네모나네.",
        "W: 사실 둥글어. 네모난 건 6월에 깨졌어.",
        "M: 그리고 뒷벽은 넓은 창문이 차지하고 있어.",
        "W: 방이 더워지면 열어.",
        "M: 오른쪽에는 세 칸짜리 책장이 있네.",
        "W: 맨 위 칸은 지금 읽는 중인 책들 자리야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaewon, the club trip leaves on Saturday morning."],
        ["W", "Everything is nearly ready, isn't it?"],
        ["M", "The bus is booked and the rooms are paid for."],
        ["W", "What about the food for the first evening?"],
        ["M", "Jihun is buying that on Friday after school."],
        ["W", "Then all that's left is the name list."],
        ["M", "The teacher asked for it twice yesterday."],
        ["W", "Does she need the phone numbers as well?"],
        ["M", "Names, classes and one guardian's number for each person."],
        ["W", "That takes a while to put together properly."],
        ["M", "She wants it before she leaves at five."],
        ["W", "I'll make the list and take it to her now."],
      ],
      choices: [
        "버스를 예약하기",
        "숙소 값을 내기",
        "먹을 것을 사 오기",
        "명단을 만들어 선생님께 드리기",
        "친구들에게 전화하기",
      ],
      answer: 4,
      clue: "I'll make the list and take it to her now.",
      explanation:
        "여자는 지금 명단을 만들어 선생님께 가져다 드리겠다고 말한다. 따라서 답은 ④이다.",
      translation: [
        "M: 채원아, 동아리 여행이 토요일 아침에 출발해.",
        "W: 준비는 거의 다 됐지?",
        "M: 버스는 예약했고 숙소 값도 냈어.",
        "W: 첫날 저녁 먹을 건?",
        "M: 지훈이가 금요일 방과 후에 사 와.",
        "W: 그럼 남은 건 명단뿐이네.",
        "M: 선생님이 어제 두 번이나 찾으셨어.",
        "W: 전화번호도 필요하셔?",
        "M: 이름, 반, 그리고 보호자 번호 하나씩.",
        "W: 제대로 만들려면 시간이 좀 걸려.",
        "M: 다섯 시에 퇴근하시기 전에 달라고 하셨어.",
        "W: 지금 명단 만들어서 갖다 드릴게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Hello. Are you here about the photo printing?"],
        ["M", "Yes, I'd like to print some pictures for a class album."],
        ["W", "How many pictures do you have?"],
        ["M", "Twenty in total, all the same size."],
        ["W", "A print of that size is one dollar fifty each."],
        ["M", "Do you also make the covers?"],
        ["W", "A hard cover is twelve dollars, a soft one is six."],
        ["M", "We'll take the hard cover, please."],
        ["W", "Do you want the pages glued or spiral bound?"],
        ["M", "Spiral, if that costs nothing extra."],
        ["W", "It's the same price, and there's a five dollar discount on orders over forty."],
        ["M", "That's good news. Here is my card."],
      ],
      choices: ["$37", "$42", "$47", "$35", "$40"],
      answer: 1,
      clue: "A print of that size is one dollar fifty each.",
      explanation:
        "사진 스무 장은 30달러이고 단단한 표지 12달러를 더하면 42달러이며, 40달러가 넘어 5달러를 빼면 37달러이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 사진 인화 때문에 오셨나요?",
        "M: 네, 학급 앨범에 넣을 사진을 인화하려고요.",
        "W: 사진이 몇 장인가요?",
        "M: 모두 스무 장이고 크기는 같아요.",
        "W: 그 크기는 한 장에 1달러 50센트입니다.",
        "M: 표지도 만들어 주시나요?",
        "W: 단단한 표지는 12달러, 부드러운 표지는 6달러입니다.",
        "M: 단단한 표지로 할게요.",
        "W: 쪽은 붙일까요, 스프링으로 묶을까요?",
        "M: 추가 요금이 없다면 스프링으로요.",
        "W: 값은 같고, 40달러가 넘는 주문에는 5달러를 빼 드립니다.",
        "M: 좋네요. 여기 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 봉사 활동에 참여하지 못하는 이유를 고르시오.",
      lines: [
        ["W", "Junseo, you're not joining the clean-up on Sunday?"],
        ["M", "I wanted to, but I can't be there."],
        ["W", "Is it because of your part-time work again?"],
        ["M", "I stopped that job at the end of August."],
        ["W", "Then are you going somewhere with your family?"],
        ["M", "No, I have to take the certificate exam that morning."],
        ["W", "The computer one you signed up for in July?"],
        ["M", "That's the one, and it's only held twice a year."],
      ],
      choices: [
        "아르바이트를 해야 해서",
        "가족 행사에 가야 해서",
        "자격증 시험을 봐야 해서",
        "몸이 아파서",
        "다른 봉사에 가야 해서",
      ],
      answer: 3,
      clue: "I have to take the certificate exam that morning.",
      explanation:
        "남자는 그날 아침에 자격증 시험이 있어서 봉사에 갈 수 없다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 준서야, 일요일 청소 봉사에 안 와?",
        "M: 가고 싶었는데 못 가.",
        "W: 또 아르바이트 때문이야?",
        "M: 그 일은 8월 말에 그만뒀어.",
        "W: 그럼 가족이랑 어디 가?",
        "M: 아니, 그날 아침에 자격증 시험을 봐야 해.",
        "W: 7월에 신청한 컴퓨터 시험?",
        "M: 그거야. 1년에 두 번밖에 안 봐.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 요리 경연 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Sujin, have you heard about the school cooking contest?"],
        ["W", "Only that it happens this term. When exactly?"],
        ["M", "On the second Thursday of November, from two until five."],
        ["W", "Do we enter alone or in teams?"],
        ["M", "Teams of three, and each team needs a name."],
        ["W", "Where does the cooking take place?"],
        ["M", "In the two home economics rooms on the second floor."],
        ["W", "Does the school provide the ingredients?"],
        ["M", "They give you rice, eggs and vegetables. Anything else you bring."],
        ["W", "And who decides the winner?"],
        ["M", "Three teachers and two students taste every dish."],
      ],
      choices: ["대회 날짜와 시간", "팀 구성 방법", "대회 장소", "재료 제공 범위", "우승 팀에게 주는 상"],
      answer: 5,
      clue: "On the second Thursday of November, from two until five.",
      explanation:
        "날짜와 시간, 팀 구성, 장소, 재료는 말했지만 상에 대해서는 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 수진아, 교내 요리 대회 얘기 들었어?",
        "W: 이번 학기에 한다는 것만. 정확히 언제야?",
        "M: 11월 둘째 목요일, 두 시부터 다섯 시까지.",
        "W: 혼자 나가? 팀으로 나가?",
        "M: 세 명이 한 팀이고 팀마다 이름이 있어야 해.",
        "W: 요리는 어디서 해?",
        "M: 2층 가정실 두 곳에서.",
        "W: 재료는 학교에서 줘?",
        "M: 쌀, 달걀, 채소는 줘. 그 밖에는 직접 가져와야 해.",
        "W: 누가 우승을 정해?",
        "M: 선생님 세 분과 학생 두 명이 모든 요리를 맛봐.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Green Hill Walking Course에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Green Hill Walking Course, which opened last spring. " +
            "The course begins at the car park behind the community centre. " +
            "It is four kilometres long and takes about ninety minutes at an easy pace. " +
            "The path is flat for the first half and climbs gently after the stream. " +
            "Benches stand every five hundred metres, and there are two drinking fountains. " +
            "The course is open all year, but the upper section closes after heavy rain. " +
            "Dogs are welcome as long as they are kept on a lead. " +
            "There is no lighting on the path, so the course should not be walked after sunset.",
        ],
      ],
      choices: [
        "주민 센터 뒤 주차장에서 시작한다",
        "길이가 4킬로미터이다",
        "500미터마다 의자가 있다",
        "개를 데려갈 수 있다",
        "밤에도 조명이 켜진다",
      ],
      answer: 5,
      clue: "There is no lighting on the path.",
      explanation:
        "길에 조명이 없어 해가 진 뒤에는 걷지 말라고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "W: 지난봄에 문을 연 그린힐 산책로에 대해 알려 드립니다. 이 길은 주민 센터 뒤 주차장에서 시작합니다. 길이는 4킬로미터이고 천천히 걸으면 아흔 분쯤 걸립니다. 앞 절반은 평평하고 개울을 지나면 완만하게 오릅니다. 500미터마다 의자가 있고 음수대가 두 곳 있습니다. 길은 일 년 내내 열려 있지만 비가 많이 오면 윗구간은 닫습니다. 목줄을 채우면 개도 데려올 수 있습니다. 길에는 조명이 없으니 해가 진 뒤에는 걷지 마시기 바랍니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 공연을 고르시오.",
      lines: [
        ["W", "Minseok, five plays are running at the arts centre this month."],
        ["M", "I've been waiting for this list since August."],
        ["W", "We can only go on a weekend, remember."],
        ["M", "Right, because your classes end late on weekdays."],
        ["W", "Then the two weekday ones are gone already."],
        ["M", "How long are the others? I get restless in long plays."],
        ["W", "They run from ninety minutes to two and a half hours."],
        ["M", "Anything over two hours is too long for us."],
        ["W", "Agreed. And what about the ticket price?"],
        ["M", "Under twenty-five thousand won, if that's possible."],
        ["W", "One of the remaining ones is thirty thousand."],
        ["M", "So there's only one play left for us."],
        ["W", "I'll book two seats this evening before they sell out."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "We can only go on a weekend, remember.",
      explanation:
        "주말, 2시간 이하, 2만 5천 원 미만인 공연을 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Saturday / Length: 150 min / Price: 22,000 won" },
          { no: 2, label: "②", value: "Day: Saturday / Length: 110 min / Price: 24,000 won" },
          { no: 3, label: "③", value: "Day: Sunday / Length: 100 min / Price: 30,000 won" },
          { no: 4, label: "④", value: "Day: Tuesday / Length: 90 min / Price: 18,000 won" },
          { no: 5, label: "⑤", value: "Day: Thursday / Length: 120 min / Price: 20,000 won" },
        ],
      },
      translation: [
        "W: 민석아, 이번 달에 예술회관에서 연극 다섯 편을 해.",
        "M: 8월부터 이 목록 기다렸어.",
        "W: 우리는 주말에만 갈 수 있잖아.",
        "M: 맞아, 네 수업이 평일엔 늦게 끝나니까.",
        "W: 그럼 평일 두 편은 벌써 빠지네.",
        "M: 나머지는 얼마나 길어? 긴 연극은 좀이 쑤셔.",
        "W: 아흔 분부터 두 시간 반까지야.",
        "M: 두 시간 넘는 건 우리한테 너무 길어.",
        "W: 그러자. 표값은 어때?",
        "M: 되도록 2만 5천 원 아래로.",
        "W: 남은 것 중 하나는 3만 원이야.",
        "M: 그럼 우리한테는 한 편만 남네.",
        "W: 표 떨어지기 전에 오늘 저녁에 두 자리 예매할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Hyunjun, did you finish the group slides?"],
        ["M", "All except the last two pages."],
        ["W", "We present first thing tomorrow morning."],
        ["M", "I know. I'll work on them tonight."],
        ["W", "Do you want me to check them afterwards?"],
      ],
      choices: [
        "No, we present next week.",
        "I haven't started the slides.",
        "Yes, please. I'll send them by ten.",
        "The presentation was cancelled.",
        "You should make your own slides.",
      ],
      answer: 3,
      clue: "Do you want me to check them afterwards?",
      explanation:
        "여자가 나중에 확인해 줄지 물었으므로, 열 시까지 보내겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 현준아, 조별 발표 자료 다 했어?",
        "M: 마지막 두 쪽만 빼고 다.",
        "W: 내일 아침 첫 시간에 발표야.",
        "M: 알아. 오늘 밤에 할게.",
        "W: 다 되면 내가 봐 줄까?",
        "M: 응, 부탁해. 열 시까지 보낼게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Dayeon, is the science room free at four?"],
        ["W", "Another class uses it until four thirty."],
        ["M", "Our club needs it for an experiment."],
        ["W", "You could book it for five instead."],
        ["M", "Who do I ask about booking it?"],
      ],
      choices: [
        "The room is never open.",
        "Ask Mr. Yoon in the office.",
        "I finished the experiment.",
        "You should use the gym.",
        "Four o'clock is fine.",
      ],
      answer: 2,
      clue: "Who do I ask about booking it?",
      explanation:
        "예약을 누구에게 물어야 하는지 물었으므로, 행정실의 윤 선생님께 물어보라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 다연아, 네 시에 과학실 비어 있어?",
        "W: 다른 반이 4시 30분까지 써.",
        "M: 우리 동아리가 실험 때문에 필요한데.",
        "W: 대신 다섯 시로 예약하면 되잖아.",
        "M: 예약은 누구한테 물어봐야 해?",
        "W: 행정실에 계신 윤 선생님께 여쭤봐.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyun, you look tired after every Monday."],
        ["W", "Monday is the day I do all my week's homework."],
        ["M", "All of it in one evening?"],
        ["W", "From six until almost one in the morning."],
        ["M", "And the rest of the week is empty?"],
        ["W", "Completely, which feels wonderful until the next Monday."],
        ["M", "So you trade six easy days for one terrible one."],
        ["W", "When you say it like that, it sounds foolish."],
        ["M", "Two hours a day would come to the same total."],
        ["W", "But Monday is the only day I really have free."],
        ["M", "Then try moving just the reading to Tuesday and Thursday."],
      ],
      choices: [
        "I have no homework at all.",
        "That could work, I'll try it.",
        "Monday is my favourite day.",
        "I never do my homework.",
        "You should study on Monday too.",
      ],
      answer: 2,
      clue: "Then try moving just the reading to Tuesday and Thursday.",
      explanation:
        "읽기만 화요일과 목요일로 옮겨 보라는 제안이므로, 해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 서윤아, 월요일마다 피곤해 보여.",
        "W: 월요일에 한 주 숙제를 다 해.",
        "M: 하루 저녁에 전부?",
        "W: 여섯 시부터 새벽 한 시 가까이까지.",
        "M: 그럼 나머지 날은 비어 있어?",
        "W: 완전히. 다음 월요일 전까지는 정말 좋아.",
        "M: 편한 엿새를 끔찍한 하루와 바꾸는 거네.",
        "W: 그렇게 말하니까 어리석게 들린다.",
        "M: 하루 두 시간이면 합계는 똑같아.",
        "W: 그런데 진짜로 비는 날은 월요일뿐이야.",
        "M: 그럼 읽기만 화요일이랑 목요일로 옮겨 봐.",
        "W: 그건 될 것 같아, 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Jaemin, you've started cycling to school, haven't you?"],
        ["M", "Since the first week of September."],
        ["W", "How long does the ride take you?"],
        ["M", "Twenty-five minutes, a little more when it's windy."],
        ["W", "Isn't the road by the market dangerous in the morning?"],
        ["M", "It is, so I take the river path instead."],
        ["W", "Does that not add a lot of distance?"],
        ["M", "About a kilometre, and no cars at all."],
        ["W", "Could you show me that route sometime?"],
      ],
      choices: [
        "Sure, let's ride together on Friday.",
        "I don't have a bicycle.",
        "The river path is closed.",
        "You should take the market road.",
        "I walk to school every day.",
      ],
      answer: 1,
      clue: "Could you show me that route sometime?",
      explanation:
        "여자가 그 길을 보여 달라고 했으므로, 금요일에 같이 타자는 ①이 가장 자연스럽다.",
      translation: [
        "W: 재민아, 자전거로 학교 오기 시작했지?",
        "M: 9월 첫 주부터.",
        "W: 타면 얼마나 걸려?",
        "M: 25분. 바람 불면 조금 더.",
        "W: 아침에 시장 옆 길은 위험하지 않아?",
        "M: 위험해서 대신 강변길로 가.",
        "W: 그러면 거리가 많이 늘지 않아?",
        "M: 1킬로미터쯤. 대신 차가 하나도 없어.",
        "W: 나중에 그 길 좀 보여 줄래?",
        "M: 그럼, 금요일에 같이 타자.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Taeho가 Eunbi에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Taeho : ________________",
      lines: [
        [
          "M",
          "Taeho and Eunbi are working together on a science project about water quality. " +
            "Eunbi has collected samples from the stream for four straight weeks. " +
            "Every Saturday she measures the temperature and writes down what she sees. " +
            "She writes each result on a separate loose sheet of paper. " +
            "The sheets are carried to school and back inside her folder. " +
            "This afternoon she cannot find the sheet from the second week anywhere. " +
            "Without that week the four measurements cannot be compared at all. " +
            "Taeho realises that the numbers will keep going missing on loose sheets. " +
            "He wants to suggest that she record everything in one bound notebook from now on. " +
            "In this situation, what would Taeho most likely say to Eunbi?",
        ],
      ],
      choices: [
        "Let's collect the samples again tomorrow.",
        "The stream is too far from school.",
        "Keep all the results in one notebook.",
        "We should change our project topic.",
        "I'll write the report by myself.",
      ],
      answer: 3,
      clue: "He wants to suggest that she record everything in one bound notebook from now on.",
      explanation:
        "낱장에 적으면 자료가 자꾸 사라지므로 한 권의 공책에 모아 적자는 뜻이다. 따라서 답은 ③이다.",
      translation: [
        "M: 태호와 은비는 물의 질에 관한 과학 과제를 함께 하고 있습니다. 은비는 네 주 동안 개울에서 시료를 모았습니다. 토요일마다 온도를 재고 본 것을 적습니다. 은비는 결과를 낱장 종이에 하나씩 적습니다. 그 종이들은 파일에 넣어 학교와 집을 오갑니다. 오늘 오후에 둘째 주 결과를 적은 종이를 어디서도 찾지 못합니다. 그 주가 빠지면 네 번의 측정을 비교할 수 없습니다. 태호는 낱장에 적으면 숫자가 계속 사라질 것임을 깨닫습니다. 태호는 앞으로는 묶인 공책 한 권에 모두 적자고 말하고 싶습니다. 이런 상황에서 태호가 은비에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to explain why a road is built with a slight slope. " +
            "If you stand at the edge of a straight road and look across it, " +
            "you will see that the middle is a little higher than both sides. " +
            "That shape is not an accident and it is not wear from traffic. " +
            "Rain that falls on a flat surface has nowhere to go " +
            "and spreads into a thin sheet that tyres cannot push away. " +
            "A car then rides on water instead of on the road. " +
            "By raising the centre by two or three centimetres for every metre, " +
            "engineers send every drop to the gutters at the sides within seconds. " +
            "The same idea shapes the roof over your head and the pavement under your feet.",
        ],
      ],
      choices: [
        "how asphalt is mixed and laid on a road",
        "why roads are built higher in the middle",
        "how traffic signs are placed along a highway",
        "why city roads need more repairs than country ones",
        "how drivers should slow down in the rain",
      ],
      answer: 2,
      clue: "By raising the centre by two or three centimetres for every metre.",
      explanation:
        "남자는 도로 가운데를 조금 높게 만들어 빗물을 양옆 배수로로 흘려보낸다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 도로를 왜 약간 기울게 만드는지 설명하려 합니다. 곧은 도로 가장자리에 서서 가로질러 보면 가운데가 양쪽보다 조금 높다는 것을 알 수 있습니다. 그 모양은 우연도 아니고 차가 다녀 닳은 것도 아닙니다. 평평한 면에 떨어진 비는 갈 곳이 없어 얇은 막처럼 퍼지고, 타이어는 그것을 밀어내지 못합니다. 그러면 차는 도로가 아니라 물 위를 달리게 됩니다. 기술자들은 1미터마다 가운데를 2~3센티미터 높여 모든 물방울을 몇 초 안에 양옆 배수로로 보냅니다. 같은 생각이 머리 위 지붕과 발밑 인도의 모양도 만듭니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Today I want to explain why a road is built with a slight slope."],
        ["M", "The middle is a little higher than both sides."],
        ["M", "Rain that falls on a flat surface spreads into a thin sheet that tyres cannot push away."],
        ["M", "Engineers raise the centre by two or three centimetres for every metre."],
        ["M", "The same idea shapes the roof over your head and the pavement under your feet."],
      ],
      choices: [
        "the middle of a road being higher than the sides",
        "a thin sheet of rain on a flat surface",
        "raising the centre by a few centimetres per metre",
        "the shape of a roof and a pavement",
        "the number of lanes on a highway",
      ],
      answer: 5,
      clue: "The middle is a little higher than both sides.",
      explanation:
        "가운데가 더 높다는 것, 얇은 물막, 1미터당 몇 센티미터를 높인다는 것, 지붕과 인도의 모양은 언급되지만 차선 수는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
