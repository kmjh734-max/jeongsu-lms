/** 고1 듣기 45회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 45회",
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
          "Good afternoon, everyone. This is the school counseling office. " +
            "Every year around this time we hear the same worry from first graders: " +
            "that choosing a subject now decides the rest of their life. " +
            "I want to tell you plainly that this is not true. " +
            "Next Wednesday we are opening a series of short talks after school, " +
            "one for each of the six subject areas you can choose from. " +
            "Each talk lasts thirty minutes and is given by a teacher of that subject. " +
            "You may come to as many as you like, or to none at all. " +
            "There is no sign-up sheet and no attendance record. " +
            "Come, listen, and ask the questions you have been carrying around. " +
            "The talks begin at four in the third floor classrooms.",
        ],
      ],
      choices: [
        "과목 선택 설명회를 안내하려고",
        "상담 신청 방법을 알리려고",
        "시험 일정 변경을 알리려고",
        "동아리 가입을 권하려고",
        "진학 자료실 개방을 알리려고",
      ],
      answer: 1,
      clue: "we are opening a series of short talks after school",
      explanation:
        "과목 영역마다 열리는 방과 후 설명회를 안내하고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 학교 상담실입니다. 해마다 이맘때면 1학년 학생들에게서 같은 걱정을 듣습니다. 지금 과목을 고르는 일이 남은 인생을 정해 버린다는 걱정입니다. 분명히 말씀드리는데 그렇지 않습니다. 다음 주 수요일부터 방과 후에 짧은 설명회를 엽니다. 여러분이 고를 수 있는 여섯 과목 영역마다 하나씩입니다. 설명회는 30분씩이고 그 과목 선생님이 직접 이야기합니다. 원하는 만큼 들어도 되고, 하나도 안 들어도 됩니다. 신청서도 없고 출석도 적지 않습니다. 오셔서 듣고, 그동안 품고 있던 질문을 하세요. 설명회는 3층 교실에서 네 시에 시작합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junsu, you turned down the offer to be class president."],
        ["M", "I said no to president but yes to the library committee."],
        ["W", "Isn't president the position that looks best later?"],
        ["M", "Looking good and doing something are different things."],
        ["W", "But you'd have real influence as president."],
        ["M", "I'd spend every lunch break in meetings about meetings."],
        ["W", "The library committee sounds much smaller."],
        ["M", "Four people, and we decide what books we buy."],
        ["W", "That does sound more concrete."],
        ["M", "I'd rather change one small thing than sit in on twenty."],
        ["W", "Most people would take the bigger title."],
        ["M", "A small job you actually do beats a big one you only hold."],
        ["W", "I might rethink what I signed up for."],
      ],
      choices: [
        "이름뿐인 큰 자리보다 실제로 해내는 작은 일이 낫다",
        "학생회 활동이 진학에 도움이 된다",
        "회의는 짧게 자주 하는 것이 좋다",
        "도서 선정은 학생이 맡아야 한다",
        "여러 활동을 겸하는 것이 좋다",
      ],
      answer: 1,
      clue: "A small job you actually do beats a big one you only hold.",
      explanation:
        "남자는 실제로 해내는 작은 일이 이름뿐인 큰 자리보다 낫다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 준수야, 반장 제안을 거절했다며.",
        "M: 반장은 거절하고 도서 위원은 하겠다고 했어.",
        "W: 나중에 보기 좋은 건 반장 아니야?",
        "M: 보기 좋은 것과 실제로 뭘 하는 건 달라.",
        "W: 그래도 반장이면 영향력이 있잖아.",
        "M: 점심시간마다 회의에 대한 회의를 하고 있겠지.",
        "W: 도서 위원은 훨씬 작아 보이는데.",
        "M: 네 명이서 어떤 책을 살지 우리가 정해.",
        "W: 그건 확실히 손에 잡히네.",
        "M: 스무 개 회의에 앉아 있느니 작은 것 하나를 바꾸겠어.",
        "W: 대부분은 더 큰 직함을 고를 텐데.",
        "M: 실제로 해내는 작은 일이 이름만 가진 큰 자리보다 나아.",
        "W: 내가 신청한 걸 다시 생각해 봐야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "We usually treat boredom as a problem to be solved. " +
            "The moment a gap opens in the day, we fill it with a screen. " +
            "But research on the wandering mind suggests something else. " +
            "When nothing demands your attention, the brain starts connecting " +
            "things it filed away separately: a conversation, a page, a walk. " +
            "That is where most of what we call an idea actually comes from. " +
            "A person who never lets a dull moment happen " +
            "is never giving those connections a chance to form. " +
            "So the next time you are waiting for a bus with nothing to do, " +
            "consider leaving your pocket alone and letting the boredom run.",
        ],
      ],
      choices: [
        "지루한 시간을 그대로 두어야 생각이 이어진다",
        "집중력을 기르려면 훈련이 필요하다",
        "휴대전화 사용 시간을 정해야 한다",
        "산책이 기억력을 높여 준다",
        "새로운 경험이 창의성을 키운다",
      ],
      answer: 1,
      clue: "letting the boredom run",
      explanation:
        "빈 시간을 채우지 않고 두어야 생각이 이어진다는 것이 요지이다. 따라서 답은 ①이다.",
      translation: [
        "M: 우리는 보통 지루함을 없애야 할 문제로 여깁니다. 하루에 틈이 생기는 순간 화면으로 그 틈을 메웁니다. 그러나 떠도는 마음에 대한 연구는 다른 이야기를 합니다. 아무것도 주의를 붙들지 않을 때, 뇌는 따로 넣어 두었던 것들을 이어 붙이기 시작합니다. 어떤 대화, 어떤 쪽, 어떤 산책 같은 것들 말입니다. 우리가 착상이라고 부르는 것 대부분이 실은 거기서 나옵니다. 지루한 순간을 한 번도 허락하지 않는 사람은 그 연결이 생길 기회를 주지 않는 것입니다. 그러니 다음에 할 일 없이 버스를 기다릴 때는 주머니를 그냥 두고 지루함이 흐르게 놔두어 보십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Yerin, is this a photo of your new study room?"],
        ["W", "Yes, we finished moving the furniture yesterday."],
        ["M", "There's a long desk under the window."],
        ["W", "Two of us can sit there at the same time."],
        ["M", "And a round clock hangs on the left wall."],
        ["W", "My brother put it up too high, actually."],
        ["M", "I see three shelves above the desk."],
        ["W", "Only two shelves. The bottom one is a drawer."],
        ["M", "There's a small rug in front of the chair."],
        ["W", "It keeps the floor from getting cold."],
        ["M", "And a lamp stands in the right corner."],
        ["W", "That one belonged to my grandmother."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Only two shelves. The bottom one is a drawer.",
      explanation:
        "책상 위 선반이 세 개라고 했지만 두 개라고 했다. 따라서 답은 ④이다.",
      figure: {
        kind: "figure5",
        scene:
          "A small home study room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A LONG DESK stands under the window. " +
          "A ROUND CLOCK hangs high on the left wall. " +
          "THREE SHELVES are mounted on the wall above the desk. " +
          "A SMALL RUG lies in front of the chair. " +
          "A FLOOR LAMP stands in the right corner.",
        spots: [
          [0.45, 0.6],
          [0.12, 0.18],
          [0.5, 0.3],
          [0.42, 0.85],
          [0.88, 0.45],
        ],
      },
      translation: [
        "M: 예린아, 이게 새 공부방 사진이야?",
        "W: 응, 어제 가구 옮기는 걸 끝냈어.",
        "M: 창문 아래에 긴 책상이 있네.",
        "W: 둘이 동시에 앉을 수 있어.",
        "M: 왼쪽 벽에는 둥근 시계가 걸려 있고.",
        "W: 사실 오빠가 너무 높이 달았어.",
        "M: 책상 위에 선반이 세 개 보여.",
        "W: 선반은 두 개야. 맨 아래는 서랍이야.",
        "M: 의자 앞에는 작은 깔개가 있네.",
        "W: 바닥이 차가워지지 않게 해 줘.",
        "M: 그리고 오른쪽 구석에 등이 서 있어.",
        "W: 그건 할머니가 쓰시던 거야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Dohyun, the debate starts in forty minutes."],
        ["M", "Our notes are printed and the timer works."],
        ["W", "Did anyone check the seats for the judges?"],
        ["M", "Three chairs are lined up at the front."],
        ["W", "The teacher said there would be four judges today."],
        ["M", "Four? Then we're one chair short."],
        ["W", "The spare chairs are in the room next door."],
        ["M", "That room is locked after lunch, though."],
        ["W", "The caretaker is still in the office until three."],
        ["M", "Then I should ask him before he leaves."],
        ["W", "I'll set out the water bottles meanwhile."],
        ["M", "I'll go and borrow the key for the spare chairs."],
      ],
      choices: [
        "물병을 놓기",
        "자료를 출력하기",
        "여분 의자를 위해 열쇠를 빌리러 가기",
        "심사위원을 맞이하기",
        "시계를 맞추기",
      ],
      answer: 3,
      clue: "I'll go and borrow the key for the spare chairs.",
      explanation:
        "남자는 여분 의자를 꺼내려고 열쇠를 빌리러 가겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 도현아, 토론이 40분 뒤에 시작해.",
        "M: 자료는 출력했고 시계도 잘 돼.",
        "W: 심사위원 자리는 누가 확인했어?",
        "M: 앞에 의자 세 개를 놓았어.",
        "W: 선생님이 오늘은 심사위원이 네 분이라고 하셨어.",
        "M: 네 분? 그럼 의자가 하나 모자라네.",
        "W: 여분 의자는 옆방에 있어.",
        "M: 그 방은 점심 지나면 잠기잖아.",
        "W: 관리 선생님이 세 시까지는 사무실에 계셔.",
        "M: 그럼 가시기 전에 여쭤봐야겠다.",
        "W: 나는 그동안 물병을 놓을게.",
        "M: 내가 가서 여분 의자 꺼낼 열쇠를 빌려 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the art supply store. How can I help you?"],
        ["W", "I need four sketchbooks and two sets of pencils."],
        ["M", "Sketchbooks are three dollars each this month."],
        ["W", "They were four dollars the last time I came."],
        ["M", "We lowered the price for the new term."],
        ["W", "And how much is one set of pencils?"],
        ["M", "Each set is eight dollars."],
        ["W", "That adds up quickly."],
        ["M", "Students with a school card get ten percent off."],
        ["W", "I have mine right here."],
        ["M", "Then the discount applies to everything."],
        ["W", "Good, I'll pay by card."],
      ],
      choices: ["$24.30", "$25.20", "$25.80", "$26.60", "$28.00"],
      answer: 2,
      clue: "Sketchbooks are three dollars each this month.",
      explanation:
        "스케치북 네 권 12달러와 연필 두 세트 16달러로 28달러인데, 10퍼센트를 빼면 25.20달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 미술 재료점에 오신 걸 환영합니다. 무엇을 도와드릴까요?",
        "W: 스케치북 네 권이랑 연필 두 세트가 필요해요.",
        "M: 이번 달 스케치북은 한 권에 3달러입니다.",
        "W: 지난번에 왔을 때는 4달러였는데요.",
        "M: 새 학기라 값을 내렸습니다.",
        "W: 연필 한 세트는 얼마예요?",
        "M: 한 세트에 8달러입니다.",
        "W: 금방 쌓이네요.",
        "M: 학생증이 있으면 10퍼센트 할인됩니다.",
        "W: 여기 있어요.",
        "M: 그럼 전체에 할인이 들어갑니다.",
        "W: 좋네요, 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 동아리 발표회에 늦게 온 이유를 고르시오.",
      lines: [
        ["M", "Chaeyeon, you missed the first two performances."],
        ["W", "I know, I ran all the way from the station."],
        ["M", "Did your train get delayed again?"],
        ["W", "The train was fine, actually right on time."],
        ["M", "Then did your afternoon class run long?"],
        ["W", "It ended at four as usual."],
        ["M", "So what held you up?"],
        ["W", "I stopped to help a lost child find his mother."],
        ["M", "Where was that?"],
        ["W", "At the station exit. It took almost twenty minutes."],
        ["M", "That's a good reason to be late."],
        ["W", "His mother was waiting on the wrong side."],
      ],
      choices: [
        "길 잃은 아이를 도와주느라",
        "기차가 늦어서",
        "수업이 늦게 끝나서",
        "몸이 아파서",
        "길을 잘못 들어서",
      ],
      answer: 1,
      clue: "I stopped to help a lost child find his mother.",
      explanation:
        "여자는 길 잃은 아이를 도와주느라 늦었다. 따라서 답은 ①이다.",
      translation: [
        "M: 채연아, 앞의 두 공연을 놓쳤네.",
        "W: 알아, 역에서부터 내내 뛰어왔어.",
        "M: 기차가 또 늦었어?",
        "W: 기차는 괜찮았어. 오히려 정시였어.",
        "M: 그럼 오후 수업이 길어졌어?",
        "W: 평소처럼 네 시에 끝났어.",
        "M: 그럼 뭐 때문에 늦었어?",
        "W: 길 잃은 아이가 엄마 찾는 걸 도와주느라 멈췄어.",
        "M: 어디서?",
        "W: 역 출구에서. 거의 20분 걸렸어.",
        "M: 늦을 만한 이유네.",
        "W: 아이 어머니가 반대쪽에서 기다리고 계셨어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 청소년 과학 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Seongjun, are you entering the youth science contest this year?"],
        ["M", "I'd really like to. When do we have to submit it?"],
        ["W", "By the last day of November, through the contest website."],
        ["M", "That gives us about eight weeks to work with."],
        ["W", "It sounds long until you start collecting the data."],
        ["M", "Can we enter as a team or only alone?"],
        ["W", "Up to three students may work together on one entry."],
        ["M", "Is there a set topic for this year?"],
        ["W", "Anything about energy in daily life is accepted."],
        ["M", "Then I already have two ideas in mind."],
        ["W", "Write them both down before you forget."],
        ["M", "How long should the final report be?"],
        ["W", "Between ten and twenty pages, with photographs included."],
        ["M", "And what do the winners actually receive?"],
        ["W", "A trip to the national science museum."],
        ["M", "Then I'll start looking for a partner today."],
      ],
      choices: ["제출 기한", "팀의 인원", "올해 주제", "보고서 분량", "심사 방법"],
      answer: 5,
      clue: "By the last day of November, through the contest website.",
      explanation:
        "기한, 인원, 주제, 분량은 말했지만 심사 방법은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 성준아, 올해 청소년 과학 대회에 낼 거야?",
        "M: 정말 내고 싶어. 언제까지 내야 해?",
        "W: 11월 마지막 날까지, 대회 누리집으로.",
        "M: 그럼 여덟 주쯤 남았네.",
        "W: 자료 모으기 시작하면 길게 안 느껴져.",
        "M: 팀으로 나갈 수 있어, 혼자만 돼?",
        "W: 한 작품에 세 명까지 함께 할 수 있어.",
        "M: 올해 정해진 주제가 있어?",
        "W: 생활 속 에너지에 관한 것이면 다 돼.",
        "M: 그럼 벌써 생각나는 게 두 개 있어.",
        "W: 잊어버리기 전에 둘 다 적어 둬.",
        "M: 최종 보고서는 얼마나 길어야 해?",
        "W: 사진을 넣어서 10쪽에서 20쪽 사이.",
        "M: 수상하면 실제로 뭘 받아?",
        "W: 국립 과학관 견학.",
        "M: 그럼 오늘부터 같이 할 사람을 찾아봐야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 교내 사진 전시회에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. Here is the news about the school photo exhibition. " +
            "The exhibition opens on the fifth of next month and runs for one week. " +
            "Photographs are shown in the hallway on the second floor. " +
            "Each student may submit up to two photographs. " +
            "This year's theme is the ordinary corners of our neighborhood. " +
            "Send your files to the art room email by this Friday. " +
            "Printing is done by the school, so you only send the file. " +
            "Visitors may write a short note on the board beside each work. " +
            "The three works with the most notes receive a small prize.",
        ],
      ],
      choices: [
        "다음 달 5일부터 일주일 동안 열린다",
        "2층 복도에 전시한다",
        "한 사람이 두 점까지 낼 수 있다",
        "주제는 동네의 평범한 구석이다",
        "인화는 각자 해서 가져와야 한다",
      ],
      answer: 5,
      clue: "Printing is done by the school, so you only send the file.",
      explanation:
        "인화는 학교에서 하고 학생은 파일만 보낸다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 교내 사진 전시회 소식입니다. 전시는 다음 달 5일에 시작해 일주일 동안 이어집니다. 사진은 2층 복도에 전시합니다. 학생 한 명이 사진 두 점까지 낼 수 있습니다. 올해 주제는 우리 동네의 평범한 구석입니다. 이번 주 금요일까지 미술실 전자우편으로 파일을 보내 주세요. 인화는 학교에서 하니 파일만 보내시면 됩니다. 관람하는 사람은 작품 옆 판에 짧은 글을 남길 수 있습니다. 글이 가장 많이 붙은 세 작품에 작은 상을 드립니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 공연을 고르시오.",
      lines: [
        ["M", "Suyeon, which performance should our club go to?"],
        ["W", "Five shows are on at the arts center this month."],
        ["M", "We can only go on a weekday evening."],
        ["W", "So the weekend shows are out for us."],
        ["M", "That still leaves more than one choice."],
        ["W", "The ticket has to stay under thirty thousand won."],
        ["M", "Our club budget is fixed at that amount."],
        ["W", "One of them is well above that price."],
        ["M", "And it should run under two hours."],
        ["W", "The last bus leaves the center at half past nine."],
        ["M", "Then only one show fits all three conditions."],
        ["W", "I'll book twelve seats tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "We can only go on a weekday evening.",
      explanation:
        "평일 저녁, 3만 원 미만, 2시간 미만인 공연은 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Saturday / Price: 25,000 won / Length: 100 min" },
          { no: 2, label: "②", value: "Day: Tuesday / Price: 35,000 won / Length: 110 min" },
          { no: 3, label: "③", value: "Day: Thursday / Price: 28,000 won / Length: 140 min" },
          { no: 4, label: "④", value: "Day: Wednesday / Price: 27,000 won / Length: 105 min" },
          { no: 5, label: "⑤", value: "Day: Sunday / Price: 22,000 won / Length: 95 min" },
        ],
      },
      translation: [
        "M: 수연아, 우리 동아리는 어떤 공연을 보러 갈까?",
        "W: 이번 달에 예술 회관에서 다섯 편을 해.",
        "M: 우리는 평일 저녁에만 갈 수 있어.",
        "W: 그럼 주말 공연은 빠지네.",
        "M: 그래도 고를 게 하나보다는 많아.",
        "W: 표는 3만 원 미만이어야 해.",
        "M: 동아리 예산이 딱 그만큼이야.",
        "W: 하나는 그보다 훨씬 비싸.",
        "M: 그리고 두 시간 미만이어야 해.",
        "W: 회관에서 나오는 막차가 아홉 시 반이야.",
        "M: 그럼 세 조건에 다 맞는 건 하나뿐이야.",
        "W: 오늘 밤에 열두 자리 예매할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Have you picked a topic for the science report?"],
        ["W", "I'm choosing between two of them."],
        ["M", "The deadline is Thursday, you know."],
        ["W", "That's sooner than I thought."],
        ["M", "Do you want to talk them through with me?"],
      ],
      choices: [
        "Yes, after sixth period.",
        "I already handed it in.",
        "There is no report.",
        "I don't take science.",
        "The deadline passed.",
      ],
      answer: 1,
      clue: "Do you want to talk them through with me?",
      explanation:
        "같이 이야기해 보자는 제안이므로, 6교시 후에 하자는 ①이 가장 자연스럽다.",
      translation: [
        "M: 과학 보고서 주제 정했어?",
        "W: 두 개 중에 고르는 중이야.",
        "M: 마감이 목요일이야.",
        "W: 생각보다 빠르네.",
        "M: 나랑 같이 짚어 볼래?",
        "W: 응, 6교시 끝나고.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, does this bus go past the library?"],
        ["M", "It stops two blocks away from it."],
        ["W", "Is there one that stops right in front?"],
        ["M", "Number nine does, but it comes every half hour."],
        ["W", "Should I wait for that one instead?"],
      ],
      choices: [
        "The library is closed today.",
        "Walking two blocks is faster.",
        "I don't ride buses.",
        "There is no number nine.",
        "You can't get there.",
      ],
      answer: 2,
      clue: "Should I wait for that one instead?",
      explanation:
        "그 버스를 기다릴지 물었으므로, 두 블록 걷는 게 빠르다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 이 버스가 도서관을 지나가나요?",
        "M: 거기서 두 블록 떨어진 데 섭니다.",
        "W: 바로 앞에 서는 버스가 있나요?",
        "M: 9번이 서는데 30분마다 옵니다.",
        "W: 그걸 기다리는 게 나을까요?",
        "M: 두 블록 걸으시는 게 빠릅니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, how is the school garden project going?"],
        ["M", "We planted forty seedlings and half of them died."],
        ["W", "That's a hard start. When did you plant them?"],
        ["M", "The second week of September, all on one afternoon."],
        ["W", "Did you water them right after planting?"],
        ["M", "We soaked the whole bed until it was muddy."],
        ["W", "Roots can drown as easily as they dry out."],
        ["M", "Nobody warned us about that."],
        ["W", "Did you check the soil before watering again?"],
        ["M", "We watered on a schedule, every morning."],
        ["W", "What would you do differently next time?"],
      ],
      choices: [
        "I'd plant eighty seedlings.",
        "I'd check the soil first.",
        "I'd water them twice a day.",
        "I'd stop gardening for good.",
        "I'd plant them in winter.",
      ],
      answer: 2,
      clue: "What would you do differently next time?",
      explanation:
        "다음엔 무엇을 달리할지 물었으므로, 흙부터 확인하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태민아, 학교 텃밭 일은 잘돼 가?",
        "M: 모종 마흔 개를 심었는데 절반이 죽었어.",
        "W: 시작이 힘들었네. 언제 심었어?",
        "M: 9월 둘째 주, 어느 오후에 한꺼번에.",
        "W: 심고 바로 물을 줬어?",
        "M: 흙이 질척해질 때까지 밭 전체에 흠뻑 줬어.",
        "W: 뿌리는 마르는 것만큼이나 쉽게 잠겨 죽어.",
        "M: 아무도 그런 말을 안 해 줬어.",
        "W: 다시 물 주기 전에 흙은 확인했어?",
        "M: 정해진 대로 매일 아침에 줬어.",
        "W: 다음에는 뭘 달리하겠어?",
        "M: 흙부터 확인하겠어.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nayoung, you said you wanted to learn the guitar."],
        ["W", "I borrowed one from the music room in March."],
        ["M", "How often do you practice these days?"],
        ["W", "Once a week, for about two hours."],
        ["M", "Two hours in one sitting is a lot for a beginner."],
        ["W", "My fingers hurt for two days afterwards."],
        ["M", "And then you don't touch it until next week."],
        ["W", "That's exactly what happens."],
        ["M", "Short practice on many days builds the fingers better."],
        ["W", "I never thought of splitting it up."],
        ["M", "How many minutes could you manage on a school day?"],
      ],
      choices: [
        "I can't practice at all.",
        "Maybe fifteen minutes.",
        "I'll practice four hours.",
        "I returned the guitar.",
        "Only on weekends.",
      ],
      answer: 2,
      clue: "How many minutes could you manage on a school day?",
      explanation:
        "학교 가는 날 몇 분을 낼 수 있는지 물었으므로, 15분쯤이라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나영아, 기타 배우고 싶다고 했잖아.",
        "W: 3월에 음악실에서 하나 빌렸어.",
        "M: 요즘 얼마나 자주 연습해?",
        "W: 일주일에 한 번, 두 시간쯤.",
        "M: 처음 배우는데 한 번에 두 시간은 많아.",
        "W: 그러고 나면 이틀은 손가락이 아파.",
        "M: 그러고는 다음 주까지 손도 안 대지.",
        "W: 딱 그래.",
        "M: 여러 날 짧게 하는 게 손가락이 더 잘 만들어져.",
        "W: 나눠서 할 생각은 못 했어.",
        "M: 학교 가는 날에는 몇 분쯤 낼 수 있어?",
        "W: 15분쯤은 될 것 같아.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Minseo가 Hyunbin에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Minseo : ________________",
      lines: [
        [
          "W",
          "Minseo and Hyunbin are on the same team for the school science fair. " +
            "Tomorrow they present their project to three judges, " +
            "and Hyunbin has prepared a set of thirty slides. " +
            "The rules give each team only five minutes to speak. " +
            "Minseo timed his rehearsal this afternoon and it ran thirteen minutes. " +
            "She knows the judges stop a team the moment the five minutes are over. " +
            "Half of their findings would never be heard at all. " +
            "She wants to tell him to cut the slides down to fit the time. " +
            "In this situation, what would Minseo most likely say to Hyunbin?",
        ],
      ],
      choices: [
        "Add ten more slides tonight.",
        "The fair was moved to next week.",
        "We need to cut it to five minutes.",
        "Let's skip the presentation.",
        "The judges will wait for us.",
      ],
      answer: 3,
      clue: "She wants to tell him to cut the slides down to fit the time.",
      explanation:
        "발표가 제한 시간을 넘으므로, 5분에 맞게 줄이자는 ③이 가장 적절하다.",
      translation: [
        "W: 민서와 현빈이는 교내 과학 전시회 같은 팀입니다. 내일 심사위원 세 분 앞에서 작품을 발표하는데, 현빈이는 서른 장짜리 발표 자료를 준비했습니다. 규정에 따르면 각 팀에게 말할 시간은 5분뿐입니다. 민서가 오늘 오후에 연습 시간을 재 보니 13분이 걸렸습니다. 그녀는 5분이 지나면 심사위원이 바로 팀을 멈춘다는 것을 압니다. 그러면 연구 결과의 절반은 들려주지도 못합니다. 그녀는 시간에 맞게 자료를 줄이자고 말하고 싶습니다. 이런 상황에서 민서가 현빈이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about how living things " +
            "keep their bodies at the right temperature without a thermostat. " +
            "Consider the elephant, whose huge ears are laced with blood vessels; " +
            "flapping them cools the blood before it returns to the body. " +
            "The fennec fox of the desert has ears nearly as large for its size, " +
            "and for exactly the same reason. " +
            "Honeybees do something stranger: on hot days they carry water " +
            "into the hive and fan it with their wings until it evaporates. " +
            "Penguins in the Antarctic take the opposite approach, " +
            "crowding into a tight huddle and slowly rotating " +
            "so that every bird takes a turn on the cold outer edge. " +
            "None of these animals decides to do this; " +
            "each simply inherited a body that solves the problem of heat.",
        ],
      ],
      choices: [
        "how animals control their body temperature",
        "why deserts are hotter than forests",
        "how bees build and repair their hives",
        "why some animals live in large groups",
        "how birds survive long migrations",
      ],
      answer: 1,
      clue: "each simply inherited a body that solves the problem of heat",
      explanation:
        "여러 동물이 몸의 온도를 다스리는 방식이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 생물들이 온도 조절 장치 없이 어떻게 몸을 알맞은 온도로 유지하는지 이야기하려 합니다. 코끼리를 보십시오. 거대한 귀에 핏줄이 그물처럼 퍼져 있어, 귀를 펄럭이면 피가 몸으로 돌아가기 전에 식습니다. 사막의 페넥여우도 몸집에 견주어 거의 그만큼 큰 귀를 가졌는데, 이유가 똑같습니다. 꿀벌은 더 기묘한 일을 합니다. 더운 날이면 벌집으로 물을 나르고 날개로 부채질해 증발시킵니다. 남극의 펭귄은 반대로 합니다. 빽빽하게 뭉쳐 서서 천천히 자리를 돌려, 모든 새가 차례로 차가운 바깥쪽에 섭니다. 이 동물들 가운데 어느 하나도 그렇게 하기로 마음먹지 않았습니다. 그저 열의 문제를 풀어 주는 몸을 물려받았을 뿐입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 동물이 아닌 것을 고르시오.",
      lines: [
        ["M", "Consider the elephant, whose huge ears are laced with blood vessels."],
        ["M", "The fennec fox of the desert has ears nearly as large for its size."],
        ["M", "Honeybees carry water into the hive and fan it with their wings."],
        ["M", "Penguins in the Antarctic crowd into a tight huddle and slowly rotate."],
        ["M", "None of these animals decides to do this."],
      ],
      choices: ["elephants", "fennec foxes", "honeybees", "penguins", "camels"],
      answer: 5,
      clue: "Penguins in the Antarctic crowd into a tight huddle and slowly rotate.",
      explanation:
        "코끼리, 페넥여우, 꿀벌, 펭귄은 언급되지만 낙타는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
