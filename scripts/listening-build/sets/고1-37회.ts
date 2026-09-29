/** 고1 듣기 37회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 37회",
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
          "Good afternoon, students. This is Ms. Chung from the counselling room. " +
            "I am speaking about the peer mentoring programme that begins next month. " +
            "Second and third year students will be matched with first year students " +
            "who asked for help with a particular subject. " +
            "Each pair meets for forty minutes a week in the library, " +
            "and the pairing lasts for one term, not for a single session. " +
            "We need about thirty mentors, and twelve have applied so far. " +
            "You do not need top marks. You need patience and a fixed hour. " +
            "Application forms are on the table outside my room until Friday. " +
            "Please think about it and come and talk to me. Thank you.",
        ],
      ],
      choices: [
        "상담실 이전을 알리려고",
        "또래 멘토 지원을 권하려고",
        "도서관 이용 규칙을 안내하려고",
        "성적 향상 방법을 설명하려고",
        "학부모 상담 일정을 알리려고",
      ],
      answer: 2,
      clue: "We need about thirty mentors, and twelve have applied so far.",
      explanation:
        "여자는 또래 멘토링 제도를 설명하며 멘토로 지원해 달라고 권한다. 따라서 답은 ②이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 상담실 정 선생님입니다. 다음 달에 시작하는 또래 멘토링 제도에 대해 말씀드립니다. 특정 과목에서 도움을 요청한 1학년 학생과 2, 3학년 학생을 짝지어 줍니다. 각 짝은 도서관에서 일주일에 40분씩 만나며, 짝은 한 번이 아니라 한 학기 동안 이어집니다. 멘토가 서른 명쯤 필요한데 지금까지 열두 명이 지원했습니다. 성적이 최상위일 필요는 없습니다. 필요한 것은 참을성과 정해진 한 시간입니다. 신청서는 금요일까지 상담실 앞 탁자에 있습니다. 생각해 보시고 저에게 이야기하러 와 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, I've been studying with music in my ears all week."],
        ["W", "What kind of music are we talking about?"],
        ["M", "Songs, mostly. Ones I know by heart."],
        ["W", "Then part of your head is singing along."],
        ["M", "I don't notice it at all."],
        ["W", "You wouldn't. That's why the page takes twice as long."],
        ["M", "But silence makes me restless."],
        ["W", "Then use something without words. Rain, or an instrument."],
        ["M", "Isn't that the same thing to the brain?"],
        ["W", "Words compete with words. Notes don't."],
        ["M", "So I can keep the sound but drop the lyrics."],
        ["W", "That's it. Your reading and your song can't share one sentence."],
      ],
      choices: [
        "공부할 때는 가사 없는 소리를 들어야 한다",
        "공부는 완전히 조용한 곳에서 해야 한다",
        "음악은 공부 전에만 들어야 한다",
        "공부 시간을 짧게 나눠야 한다",
        "좋아하는 음악이 집중에 도움이 된다",
      ],
      answer: 1,
      clue: "Then use something without words. Rain, or an instrument.",
      explanation:
        "여자는 가사가 있는 노래는 읽기와 부딪히므로 말이 없는 소리를 들으라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 서연아, 이번 주 내내 음악을 들으면서 공부했어.",
        "W: 어떤 음악인데?",
        "M: 주로 노래. 다 외우는 것들.",
        "W: 그럼 네 머리 일부가 따라 부르고 있는 거야.",
        "M: 전혀 못 느끼는데.",
        "W: 못 느끼지. 그래서 한 쪽 읽는 데 두 배 걸리는 거야.",
        "M: 그렇다고 조용하면 좀이 쑤셔.",
        "W: 그럼 말이 없는 소리를 써. 빗소리나 악기 소리.",
        "M: 뇌한테는 똑같은 거 아니야?",
        "W: 말은 말과 싸워. 음은 안 그래.",
        "M: 그럼 소리는 두고 가사만 빼면 되네.",
        "W: 그거야. 네 읽기와 네 노래가 한 문장을 같이 쓸 수는 없어.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When you finish a chapter, most of you close the book and feel finished. " +
            "That feeling is the most expensive mistake in studying. " +
            "Recognising a page is not the same as being able to produce it. " +
            "Close the book and write down, from memory, what the chapter said. " +
            "It will be uncomfortable, and the gaps will appear at once. " +
            "Those gaps are the only useful information you have gained all evening, " +
            "because they tell you exactly where to reopen the book. " +
            "Reading again feels like progress and rarely is. " +
            "Recalling feels like failure and almost always is progress.",
        ],
      ],
      choices: [
        "책은 여러 번 읽어야 한다",
        "공부한 뒤에는 책을 덮고 떠올려 봐야 한다",
        "공부 계획을 매일 세워야 한다",
        "어려운 부분은 건너뛰어야 한다",
        "친구에게 설명하며 공부해야 한다",
      ],
      answer: 2,
      clue: "Close the book and write down, from memory, what the chapter said.",
      explanation:
        "남자는 다시 읽는 것보다 책을 덮고 기억에서 꺼내 써 보는 것이 진짜 공부라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 한 단원을 마치면 대부분 책을 덮고 끝냈다고 느낍니다. 그 느낌이 공부에서 가장 값비싼 착각입니다. 어떤 쪽을 알아보는 것과 그것을 스스로 꺼내 놓는 것은 다릅니다. 책을 덮고 그 단원이 무슨 말을 했는지 기억만으로 적어 보세요. 불편할 것이고 빈틈이 곧바로 드러납니다. 그 빈틈이야말로 그날 저녁에 얻은 유일하게 쓸모 있는 정보입니다. 어디를 다시 펼쳐야 하는지 정확히 알려 주기 때문입니다. 다시 읽기는 나아가는 느낌을 주지만 좀처럼 나아가지 않습니다. 떠올리기는 실패처럼 느껴지지만 거의 언제나 나아가는 일입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Hyunjin, is this the music room after the move?"],
        ["M", "Yes, we brought everything up from the basement."],
        ["W", "An upright piano stands against the left wall."],
        ["M", "It was tuned the week before we moved in."],
        ["W", "There's a round stool in front of the piano."],
        ["M", "The old bench broke, so we use that now."],
        ["W", "A large drum sits in the middle of the floor."],
        ["M", "We roll it aside whenever the whole class comes in."],
        ["W", "I count five music stands along the right wall."],
        ["M", "There are four. The fifth one is being repaired."],
        ["W", "And a square wall mirror hangs at the back."],
        ["M", "It helps us watch our posture while we play."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "There are four. The fifth one is being repaired.",
      explanation:
        "여자가 보면대가 다섯 개라고 하자 남자가 네 개라고 바로잡는다. 그림에는 다섯 개가 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.1, 0.34],
          [0.24, 0.72],
          [0.47, 0.78],
          [0.82, 0.5],
          [0.58, 0.12],
        ],
        scene:
          "A school music room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "An UPRIGHT PIANO stands against the LEFT wall. " +
          "A ROUND STOOL stands on the floor in front of the piano. " +
          "A LARGE DRUM sits on the floor in the MIDDLE of the room. " +
          "EXACTLY FIVE MUSIC STANDS stand in a row along the RIGHT wall, evenly spaced and clearly separated so all five can be counted. " +
          "A SQUARE WALL MIRROR hangs on the BACK wall in the upper middle.",
      },
      translation: [
        "W: 현진아, 여기가 옮기고 난 음악실이야?",
        "M: 응, 지하에 있던 걸 다 올려 왔어.",
        "W: 왼쪽 벽에 세로 피아노가 있네.",
        "M: 옮기기 전주에 조율했어.",
        "W: 피아노 앞에는 둥근 의자가 있고.",
        "M: 예전 긴 의자가 부서져서 지금은 저걸 써.",
        "W: 바닥 한가운데에는 큰 북이 있네.",
        "M: 반 전체가 들어올 때는 옆으로 밀어 둬.",
        "W: 오른쪽 벽을 따라 보면대가 다섯 개 보여.",
        "M: 네 개야. 다섯 번째는 수리 중이야.",
        "W: 그리고 뒤쪽에 네모난 거울이 걸려 있어.",
        "M: 연주할 때 자세를 보는 데 도움이 돼.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junseo, the school open day is on Saturday morning."],
        ["M", "Are the classrooms ready for the visitors?"],
        ["W", "Almost. The displays went up yesterday afternoon."],
        ["M", "What about the guides for the parents?"],
        ["W", "Eight students volunteered, and they know their routes."],
        ["M", "Then everything is in place."],
        ["W", "Except the signs. The front gate has no direction signs."],
        ["M", "Didn't we use the ones from last year?"],
        ["W", "They faded in the rain and nobody can read them."],
        ["M", "How many do we actually need?"],
        ["W", "Four, one at the gate and three inside the building."],
        ["M", "I'll make the four new signs this afternoon."],
      ],
      choices: [
        "전시물을 붙이기",
        "안내 학생을 모으기",
        "새 안내 표지를 만들기",
        "정문을 청소하기",
        "학부모에게 연락하기",
      ],
      answer: 3,
      clue: "I'll make the four new signs this afternoon.",
      explanation:
        "남자는 오늘 오후에 새 안내 표지 네 개를 만들겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 준서야, 학교 개방일이 토요일 아침이야.",
        "M: 교실은 손님 맞을 준비가 됐어?",
        "W: 거의. 전시물은 어제 오후에 붙였어.",
        "M: 학부모 안내할 학생들은?",
        "W: 여덟 명이 자원했고 각자 동선도 알아.",
        "M: 그럼 다 된 거네.",
        "W: 표지만 빼고. 정문에 방향 표지가 없어.",
        "M: 작년 것 쓰지 않았어?",
        "W: 비에 색이 날아가서 아무도 못 읽어.",
        "M: 몇 개나 필요해?",
        "W: 네 개. 정문에 하나, 건물 안에 셋.",
        "M: 오늘 오후에 새 표지 네 개 만들게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Hello. Are you booking tickets for the science museum?"],
        ["W", "Yes, for a school group this Friday."],
        ["M", "How many students are coming?"],
        ["W", "Twenty students and two teachers."],
        ["M", "A student ticket is four dollars, and a teacher pays six."],
        ["W", "Do teachers get in free with a group?"],
        ["M", "Only for groups of thirty or more, I'm afraid."],
        ["W", "I understand. What about the planetarium?"],
        ["M", "The show is three dollars more for each student."],
        ["W", "Please add the show for all twenty students."],
        ["M", "And school groups receive a twenty dollar discount."],
        ["W", "That's helpful. Here is the school card."],
      ],
      choices: ["$132", "$140", "$152", "$112", "$124"],
      answer: 1,
      clue: "A student ticket is four dollars, and a teacher pays six.",
      explanation:
        "학생 스무 명 80달러와 교사 두 명 12달러, 공연 60달러를 더하면 152달러이고, 단체 할인 20달러를 빼면 132달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요. 과학관 표 예약하시나요?",
        "W: 네, 이번 금요일에 학교 단체로요.",
        "M: 학생은 몇 명인가요?",
        "W: 학생 스무 명과 선생님 두 분이요.",
        "M: 학생 표는 4달러, 선생님은 6달러입니다.",
        "W: 단체면 선생님은 무료 아닌가요?",
        "M: 죄송하지만 서른 명 이상 단체만 그렇습니다.",
        "W: 알겠습니다. 천문관은요?",
        "M: 공연은 학생 한 명당 3달러가 더 붙습니다.",
        "W: 학생 스무 명 모두 공연을 넣어 주세요.",
        "M: 그리고 학교 단체는 20달러를 빼 드립니다.",
        "W: 도움이 되네요. 여기 학교 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 도서관에 가지 못하는 이유를 고르시오.",
      lines: [
        ["M", "Dayeon, aren't you coming to the library today?"],
        ["W", "I can't, and I'm sorry to miss it."],
        ["M", "Is it because of the family dinner you mentioned?"],
        ["W", "That's on Sunday, so it isn't that."],
        ["M", "Then are you helping at home again?"],
        ["W", "No, I have a dental appointment at four thirty."],
        ["M", "Is it the tooth that hurt last month?"],
        ["W", "The same one, and today they finish the work."],
      ],
      choices: [
        "가족 식사가 있어서",
        "집안일을 도와야 해서",
        "치과에 가야 해서",
        "동아리 모임이 있어서",
        "몸이 아파서",
      ],
      answer: 3,
      clue: "No, I have a dental appointment at four thirty.",
      explanation:
        "여자는 4시 30분에 치과 예약이 있어서 도서관에 갈 수 없다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 다연아, 오늘 도서관 안 와?",
        "W: 못 가. 못 가서 아쉬워.",
        "M: 말했던 가족 식사 때문이야?",
        "W: 그건 일요일이라 아니야.",
        "M: 그럼 또 집안일 돕는 거야?",
        "W: 아니, 4시 30분에 치과 예약이 있어.",
        "M: 지난달에 아팠던 그 이?",
        "W: 같은 이야. 오늘 치료를 끝낸대.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 밴드 공연에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Sungho, is your band playing at the autumn show this year?"],
        ["M", "We are, and we've been rehearsing twice a week since August."],
        ["W", "When exactly is the show held?"],
        ["M", "On the fourteenth, starting at six in the evening."],
        ["W", "That's a Saturday, isn't it? My family could come."],
        ["M", "It is, and the hall stays open until nine."],
        ["W", "How many songs will your band play?"],
        ["M", "Four altogether, and the last one is a song we wrote."],
        ["W", "Where is the stage this year?"],
        ["M", "In the gym, because the playground stage was far too windy."],
        ["W", "Does the school lend you the instruments?"],
        ["M", "Only the drums and the keyboard. We carry the rest ourselves."],
        ["W", "Then I'll sit in the front row and cheer for you."],
      ],
      choices: ["공연 날짜와 시각", "연주할 곡의 수", "무대가 있는 곳", "빌릴 수 있는 악기", "입장하는 방법"],
      answer: 5,
      clue: "On the fourteenth, starting at six in the evening.",
      explanation:
        "날짜와 시각, 곡 수, 무대, 빌릴 악기는 말했지만 입장 방법은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 성호야, 올해 가을 공연에 너희 밴드 나가?",
        "M: 나가. 8월부터 일주일에 두 번씩 연습했어.",
        "W: 공연은 정확히 언제야?",
        "M: 14일 저녁 여섯 시에 시작해.",
        "W: 토요일이네. 우리 가족도 올 수 있겠다.",
        "M: 맞아, 강당은 아홉 시까지 열어 둬.",
        "W: 몇 곡 연주해?",
        "M: 모두 네 곡. 마지막은 우리가 쓴 곡이야.",
        "W: 올해 무대는 어디야?",
        "M: 체육관에서. 운동장 무대는 바람이 너무 셌어.",
        "W: 악기는 학교에서 빌려줘?",
        "M: 드럼이랑 건반만. 나머지는 우리가 직접 들고 가.",
        "W: 그럼 맨 앞줄에 앉아서 응원할게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Lakeside Bird Centre에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is some information about the Lakeside Bird Centre, which opened three years ago. " +
            "The centre sits on the north shore of the lake, ten minutes from the bus stop. " +
            "It is open every day from nine in the morning until five. " +
            "Two hides along the path let visitors watch birds without being seen. " +
            "Binoculars are lent free of charge at the front desk. " +
            "A guided walk starts at ten and at two, and it lasts about an hour. " +
            "Entry costs two thousand won, and children under seven enter free. " +
            "Feeding the birds is not allowed anywhere in the grounds.",
        ],
      ],
      choices: [
        "호수 북쪽 기슭에 있다",
        "매일 아홉 시에 문을 연다",
        "쌍안경을 무료로 빌려준다",
        "해설 산책은 하루에 두 번 있다",
        "먹이를 주는 것이 허용된다",
      ],
      answer: 5,
      clue: "Feeding the birds is not allowed anywhere in the grounds.",
      explanation:
        "구역 어디에서도 새에게 먹이를 줄 수 없다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "M: 3년 전에 문을 연 레이크사이드 조류 센터에 대해 알려 드립니다. 센터는 호수 북쪽 기슭, 버스 정류장에서 10분 거리에 있습니다. 매일 아침 아홉 시부터 다섯 시까지 엽니다. 길을 따라 있는 관찰막 두 곳에서 모습을 보이지 않고 새를 볼 수 있습니다. 쌍안경은 접수대에서 무료로 빌려 드립니다. 해설 산책은 열 시와 두 시에 시작해 한 시간쯤 걸립니다. 입장료는 2천 원이고 일곱 살 미만은 무료입니다. 구역 안 어디에서도 새에게 먹이를 주면 안 됩니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 남자가 구입할 책상 의자를 고르시오.",
      lines: [
        ["W", "Kiyoung, these five chairs are all in stock."],
        ["M", "I can spend up to a hundred and twenty thousand won."],
        ["W", "Then the most expensive one is gone."],
        ["M", "I'd also like arm rests, since I write for hours."],
        ["W", "Two of the remaining ones have none."],
        ["M", "And I want a back that reclines."],
        ["W", "One of the last two has a fixed back."],
        ["M", "So there's only one chair left for me."],
        ["W", "It also comes with a five year guarantee."],
        ["M", "That settles it. I'll order it tonight."],
        ["W", "Ask them to deliver it on Saturday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "I can spend up to a hundred and twenty thousand won.",
      explanation:
        "12만 원 이하, 팔걸이 있음, 등받이가 젖혀지는 것을 고른다. 세 조건을 모두 채우는 것은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Price: 150,000 won / Arm rests: Yes / Back: Reclines" },
          { no: 2, label: "②", value: "Price: 85,000 won / Arm rests: No / Back: Reclines" },
          { no: 3, label: "③", value: "Price: 95,000 won / Arm rests: No / Back: Fixed" },
          { no: 4, label: "④", value: "Price: 118,000 won / Arm rests: Yes / Back: Reclines" },
          { no: 5, label: "⑤", value: "Price: 110,000 won / Arm rests: Yes / Back: Fixed" },
        ],
      },
      translation: [
        "W: 기영아, 이 다섯 개가 다 재고가 있어.",
        "M: 나는 12만 원까지 쓸 수 있어.",
        "W: 그럼 제일 비싼 건 빠지네.",
        "M: 그리고 몇 시간씩 쓰니까 팔걸이가 있으면 좋겠어.",
        "W: 남은 것 중 두 개는 팔걸이가 없어.",
        "M: 등받이는 젖혀지는 게 좋아.",
        "W: 남은 둘 중 하나는 등받이가 고정이야.",
        "M: 그럼 나한테 남는 건 하나뿐이네.",
        "W: 5년 보증도 같이 와.",
        "M: 그걸로 정했어. 오늘 밤에 주문할게.",
        "W: 토요일에 배달해 달라고 해.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yerin, did you bring the survey results?"],
        ["W", "They're on my laptop, not printed yet."],
        ["M", "The meeting starts in twenty minutes."],
        ["W", "The printer in the office is free now."],
        ["M", "Shall I go and print them for you?"],
      ],
      choices: [
        "No, the meeting is tomorrow.",
        "Yes, please, I'll send the file.",
        "I lost the survey results.",
        "The office is always closed.",
        "You should do the survey again.",
      ],
      answer: 2,
      clue: "Shall I go and print them for you?",
      explanation:
        "대신 인쇄해 줄지 물었으므로, 파일을 보내겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 예린아, 설문 결과 가져왔어?",
        "W: 내 노트북에 있어. 아직 인쇄는 안 했어.",
        "M: 회의가 20분 뒤에 시작해.",
        "W: 지금 교무실 인쇄기가 비어 있어.",
        "M: 내가 가서 인쇄해 줄까?",
        "W: 응, 부탁해. 파일 보낼게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Minjun, are you taking the late bus today?"],
        ["M", "I planned to, around six thirty."],
        ["W", "Could we go over the maths homework before that?"],
        ["M", "Which part are you stuck on?"],
        ["W", "The last three questions on page forty."],
      ],
      choices: [
        "I finished page fifty.",
        "The bus leaves at five.",
        "All right, let's meet at five thirty.",
        "I don't take the bus.",
        "There is no homework today.",
      ],
      answer: 3,
      clue: "The last three questions on page forty.",
      explanation:
        "버스 전에 숙제를 같이 보자고 했으므로, 5시 30분에 만나자는 ③이 가장 자연스럽다.",
      translation: [
        "W: 민준아, 오늘 늦은 버스 타?",
        "M: 6시 30분쯤 타려고 했어.",
        "W: 그 전에 수학 숙제 같이 봐 줄 수 있어?",
        "M: 어디가 막혔는데?",
        "W: 40쪽 마지막 세 문제.",
        "M: 그래, 5시 30분에 만나자.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangwoo, you look worried about the class election."],
        ["M", "I have to give a speech in front of everyone."],
        ["W", "How long does the speech have to be?"],
        ["M", "Two minutes, which sounds short until you stand up."],
        ["W", "Have you written anything down yet?"],
        ["M", "Four versions, and I hate all of them."],
        ["W", "What do the four have in common?"],
        ["M", "They all start by listing what I would do."],
        ["W", "That's where you lose the room. Nobody remembers a list."],
        ["M", "Then what should the first line be?"],
        ["W", "Start with one thing that actually happened in our class."],
      ],
      choices: [
        "I'm not running for anything.",
        "The election was cancelled.",
        "Lists are the best opening.",
        "That's a good idea, I'll rewrite it.",
        "You should give the speech.",
      ],
      answer: 4,
      clue: "Start with one thing that actually happened in our class.",
      explanation:
        "실제 있었던 일로 시작하라는 조언이므로, 다시 쓰겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 상우야, 반장 선거 때문에 걱정돼 보여.",
        "M: 다들 앞에서 연설해야 해.",
        "W: 연설은 얼마나 해야 해?",
        "M: 2분. 일어서기 전까지는 짧게 들리지.",
        "W: 써 놓은 건 있어?",
        "M: 네 가지 판이 있는데 다 마음에 안 들어.",
        "W: 그 넷의 공통점이 뭐야?",
        "M: 다 내가 하겠다는 것들을 나열하며 시작해.",
        "W: 거기서 청중을 놓치는 거야. 아무도 목록을 기억 못 해.",
        "M: 그럼 첫 줄은 뭐여야 해?",
        "W: 우리 반에서 실제로 있었던 일 하나로 시작해.",
        "M: 좋은 생각이야, 다시 쓸게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Hayoon, you've been walking home instead of taking the bus."],
        ["W", "Since the middle of September, almost every day."],
        ["M", "How long does the walk take you?"],
        ["W", "Thirty-five minutes along the river."],
        ["M", "Isn't that time you could be studying?"],
        ["W", "I thought so at first, and then I slept better."],
        ["M", "So the walk pays for itself at night."],
        ["W", "It does, and I arrive home much less tired."],
        ["M", "Could I walk with you tomorrow?"],
      ],
      choices: [
        "Sure, I leave at four fifteen.",
        "I take the bus every day.",
        "The river path is closed.",
        "Walking is bad for you.",
        "I never go home after school.",
      ],
      answer: 1,
      clue: "Could I walk with you tomorrow?",
      explanation:
        "남자가 같이 걸어도 되는지 물었으므로, 4시 15분에 출발한다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 하윤아, 버스 안 타고 걸어서 집에 가더라.",
        "W: 9월 중순부터 거의 매일.",
        "M: 걸으면 얼마나 걸려?",
        "W: 강을 따라 35분.",
        "M: 그 시간에 공부할 수도 있잖아.",
        "W: 처음엔 그렇게 생각했는데 잠이 더 잘 와.",
        "M: 그럼 밤에 그 값을 돌려받는 거네.",
        "W: 맞아. 집에 도착할 때 훨씬 덜 지쳐.",
        "M: 내일 같이 걸어도 돼?",
        "W: 그럼, 나는 4시 15분에 출발해.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Doyun이 Chaeyeon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Doyun : ________________",
      lines: [
        [
          "M",
          "Doyun and Chaeyeon run the school broadcasting club together. " +
            "Every Wednesday they record a short programme for the lunch break. " +
            "The programme is played through the speakers in every classroom. " +
            "Today Chaeyeon has written a script that takes nine minutes to read. " +
            "She has practised it twice and is proud of how it sounds. " +
            "The lunch break broadcast may last only five minutes in total, " +
            "and the last minute is always kept for announcements from the office. " +
            "That leaves four minutes for everything she wants to say. " +
            "Doyun wants to tell her that the script has to be shortened by half. " +
            "In this situation, what would Doyun most likely say to Chaeyeon?",
        ],
      ],
      choices: [
        "Let's record it again tomorrow.",
        "We need to cut this down to four minutes.",
        "The office has no announcements.",
        "Your voice is too quiet today.",
        "I'll read the script instead of you.",
      ],
      answer: 2,
      clue: "Doyun wants to tell her that the script has to be shortened by half.",
      explanation:
        "방송이 5분이고 마지막 1분은 행정실 안내이므로 4분으로 줄여야 한다. 따라서 답은 ②이다.",
      translation: [
        "M: 도윤이와 채연이는 학교 방송 동아리를 함께 운영합니다. 수요일마다 점심시간용 짧은 방송을 녹음합니다. 그 방송은 모든 교실 스피커로 나갑니다. 오늘 채연이는 읽는 데 9분이 걸리는 원고를 써 왔습니다. 두 번 연습해 보고 소리가 마음에 든다고 뿌듯해합니다. 점심시간 방송은 모두 합해 5분까지만 할 수 있고, 마지막 1분은 늘 행정실 안내를 위해 비워 둡니다. 그러면 채연이가 하고 싶은 말에 쓸 수 있는 시간은 4분입니다. 도윤이는 원고를 절반으로 줄여야 한다고 말하고 싶습니다. 이런 상황에서 도윤이가 채연이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why we feel dizzy after spinning. " +
            "Deep inside each ear are three small loops filled with fluid. " +
            "When your head turns, the fluid lags behind and pushes tiny hairs, " +
            "and those hairs tell the brain which way you are moving. " +
            "If you spin for long enough, the fluid finally catches up and turns with you, " +
            "so the hairs go quiet even though you are still going round. " +
            "Then you stop, and the fluid keeps moving for several seconds more. " +
            "Your ears now report a turn that your eyes cannot see, " +
            "and the brain, unable to agree with itself, makes the room appear to swing. " +
            "The feeling fades as soon as the fluid comes to rest.",
        ],
      ],
      choices: [
        "how the ear turns sound into signals",
        "why we feel dizzy after spinning around",
        "how balance improves with exercise",
        "why loud noise damages hearing",
        "how the brain measures distance",
      ],
      answer: 2,
      clue: "Then you stop, and the fluid keeps moving for several seconds more.",
      explanation:
        "여자는 귓속 관의 액체가 늦게 멈추면서 눈과 귀의 신호가 어긋나 어지러움이 생긴다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 빙빙 돌고 나면 왜 어지러운지 이야기하려 합니다. 귀 깊은 곳에는 액체가 찬 작은 고리가 세 개 있습니다. 머리가 돌면 액체는 뒤처지며 아주 작은 털을 밀고, 그 털이 어느 쪽으로 움직이는지 뇌에 알려 줍니다. 오래 돌면 액체가 마침내 따라잡아 함께 돌게 되고, 여전히 돌고 있는데도 털은 조용해집니다. 그러다 멈추면 액체는 몇 초 더 움직입니다. 이제 귀는 눈이 보지 못하는 회전을 보고하고, 서로 맞지 않는 신호를 받은 뇌는 방이 흔들리는 것처럼 느끼게 합니다. 액체가 멈추는 순간 그 느낌도 사라집니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to talk about why we feel dizzy after spinning."],
        ["W", "Deep inside each ear are three small loops filled with fluid."],
        ["W", "The fluid lags behind and pushes tiny hairs."],
        ["W", "Then you stop, and the fluid keeps moving for several seconds more."],
        ["W", "The brain makes the room appear to swing."],
      ],
      choices: [
        "three small loops filled with fluid",
        "tiny hairs pushed by the fluid",
        "fluid still moving after you stop",
        "the room appearing to swing",
        "the number of bones in the middle ear",
      ],
      answer: 5,
      clue: "Deep inside each ear are three small loops filled with fluid.",
      explanation:
        "액체가 찬 고리 세 개, 액체가 미는 작은 털, 멈춘 뒤에도 움직이는 액체, 흔들려 보이는 방은 언급되지만 가운데귀의 뼈 개수는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
