/** 고2 듣기 42회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 42회",
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
          "Good afternoon, students. This is the career counseling office. " +
            "Each year at this time we receive the same request from second graders: " +
            "a chance to speak with someone who actually does the work. " +
            "Reading about a job and hearing a person describe their Tuesday " +
            "turn out to be two completely different things. " +
            "Next month we are inviting eight graduates back to the school, " +
            "each working in a different field, from nursing to game design. " +
            "They will sit in the small seminar rooms on the third floor, " +
            "and you may move freely between rooms for the whole afternoon. " +
            "There is no application form and no attendance record. " +
            "Bring the questions you have never been able to look up.",
        ],
      ],
      choices: [
        "졸업생 초청 진로 만남을 안내하려고",
        "진로 상담 신청을 받으려고",
        "직업 관련 도서를 소개하려고",
        "학과 선택 방법을 알리려고",
        "봉사 활동 참가를 권하려고",
      ],
      answer: 1,
      clue: "we are inviting eight graduates back to the school",
      explanation:
        "졸업생 여덟 명을 초청해 여는 진로 만남을 안내하고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 진로 상담실입니다. 해마다 이맘때면 2학년 학생들에게서 같은 부탁을 받습니다. 그 일을 실제로 하는 사람과 이야기해 보고 싶다는 것입니다. 직업에 관한 글을 읽는 것과 어떤 사람이 자기 화요일을 들려주는 것은 전혀 다른 일로 드러납니다. 다음 달에 졸업생 여덟 분을 학교로 모십니다. 간호에서 게임 설계까지 저마다 다른 분야에서 일하는 분들입니다. 3층 작은 세미나실에 계시고, 여러분은 오후 내내 방 사이를 자유롭게 오가실 수 있습니다. 신청서도 없고 출석도 적지 않습니다. 그동안 어디서도 찾을 수 없던 물음을 가져오세요.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Jiwon, you spend the first ten minutes of study time doing nothing."],
        ["M", "Not nothing. I write down what I did yesterday."],
        ["W", "Wouldn't that time be better spent on new material?"],
        ["M", "New material on top of forgotten material is wasted."],
        ["W", "But you already covered yesterday's work once."],
        ["M", "Covering and keeping are different things entirely."],
        ["W", "How much do you actually remember by the next day?"],
        ["M", "Less than half, unless I go back and pull it out."],
        ["W", "So the ten minutes are buying back the whole hour."],
        ["M", "Exactly. Otherwise I relearn the same thing in November."],
        ["W", "I always thought review was what you did before a test."],
        ["M", "Review before you forget costs ten minutes; after, it costs an hour."],
        ["W", "I'll start tomorrow's session that way."],
      ],
      choices: [
        "잊기 전에 복습해야 시간이 적게 든다",
        "새 내용을 먼저 공부해야 한다",
        "시험 전에 몰아서 복습해야 한다",
        "공부 시간을 늘려야 한다",
        "필기를 자세히 해야 한다",
      ],
      answer: 1,
      clue: "Review before you forget costs ten minutes; after, it costs an hour.",
      explanation:
        "남자는 잊기 전에 복습해야 시간이 적게 든다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 지원아, 너는 공부 시작하고 처음 10분을 아무것도 안 하면서 보내더라.",
        "M: 아무것도 아니야. 어제 한 걸 적어 봐.",
        "W: 그 시간에 새 내용을 보는 게 낫지 않아?",
        "M: 잊어버린 것 위에 새것을 얹으면 낭비야.",
        "W: 어제 것은 이미 한 번 봤잖아.",
        "M: 훑는 것과 남기는 것은 완전히 달라.",
        "W: 다음 날이면 실제로 얼마나 기억나?",
        "M: 되짚어 꺼내지 않으면 절반도 안 돼.",
        "W: 그럼 그 10분이 한 시간을 되사는 거네.",
        "M: 맞아. 안 그러면 11월에 같은 걸 다시 배워.",
        "W: 나는 복습은 시험 전에 하는 건 줄 알았어.",
        "M: 잊기 전 복습은 10분, 잊은 뒤 복습은 한 시간이 들어.",
        "W: 내일은 그렇게 시작해 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We praise people for keeping their promises to others, " +
            "and we rarely notice the promises they keep to themselves. " +
            "Yet the second kind is where trust in yourself is built. " +
            "A person who says she will read twenty pages and then does not " +
            "has not only lost the pages; she has taught herself something. " +
            "Next time the same promise carries a little less weight, " +
            "until eventually she stops believing her own plans. " +
            "This is why the size of the promise matters so much at the start. " +
            "Two pages kept is worth more than twenty pages intended. " +
            "Make the promise small enough that breaking it would be strange.",
        ],
      ],
      choices: [
        "지킬 수 있는 작은 약속이 자신에 대한 믿음을 만든다",
        "다른 사람과의 약속을 먼저 지켜야 한다",
        "계획은 구체적으로 세워야 한다",
        "독서량을 늘려야 한다",
        "목표는 크게 세울수록 좋다",
      ],
      answer: 1,
      clue: "Make the promise small enough that breaking it would be strange.",
      explanation:
        "지킬 수 있는 작은 약속이 자신에 대한 믿음을 쌓는다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 우리는 남과의 약속을 지키는 사람을 칭찬하면서, 자기 자신과의 약속을 지키는 일은 좀처럼 알아보지 않습니다. 그런데 자신에 대한 믿음은 바로 두 번째 것에서 쌓입니다. 스무 쪽을 읽겠다고 말해 놓고 읽지 않은 사람은 그 쪽수만 잃은 것이 아닙니다. 자기 자신에게 무언가를 가르친 것입니다. 다음번에는 같은 약속이 조금 더 가벼워지고, 끝내는 자기 계획을 스스로 믿지 않게 됩니다. 그래서 처음에는 약속의 크기가 그토록 중요합니다. 지킨 두 쪽이 마음먹은 스무 쪽보다 값집니다. 어기는 것이 오히려 이상할 만큼 약속을 작게 만드십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Chaerin, is this the photo of the new study lounge?"],
        ["W", "Yes, they opened it at the start of this term."],
        ["M", "There's a long table down the middle of the room."],
        ["W", "Eight people can work at it at once."],
        ["M", "And a round clock hangs on the back wall."],
        ["W", "It's the one moved from the old reading room."],
        ["M", "I see two lamps standing in the corners."],
        ["W", "Only one lamp. The other shape is a coat stand."],
        ["M", "There's a low bookcase under the window."],
        ["W", "We keep the dictionaries there."],
        ["M", "And a rug lies beneath the table."],
        ["W", "It stops the chairs from scraping the floor."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Only one lamp. The other shape is a coat stand.",
      explanation:
        "구석에 등이 두 개라고 했지만 하나뿐이라고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A school study lounge, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A LONG TABLE runs down the middle of the room. " +
          "A ROUND CLOCK hangs on the back wall. " +
          "TWO FLOOR LAMPS stand in the two corners. " +
          "A LOW BOOKCASE stands under the window. " +
          "A RUG lies on the floor beneath the table.",
        spots: [
          [0.5, 0.55],
          [0.5, 0.14],
          [0.1, 0.4],
          [0.85, 0.62],
          [0.45, 0.85],
        ],
      },
      translation: [
        "M: 채린아, 이게 새 학습 휴게실 사진이야?",
        "W: 응, 이번 학기 초에 열었어.",
        "M: 방 가운데를 따라 긴 탁자가 있네.",
        "W: 한 번에 여덟 명이 앉아 할 수 있어.",
        "M: 그리고 뒷벽에 둥근 시계가 걸려 있고.",
        "W: 예전 열람실에서 옮겨 온 거야.",
        "M: 구석에 등이 두 개 서 있는 게 보여.",
        "W: 등은 하나뿐이야. 다른 하나는 옷걸이야.",
        "M: 창문 아래에는 낮은 책장이 있네.",
        "W: 거기에 사전을 둬.",
        "M: 그리고 탁자 밑에 깔개가 있고.",
        "W: 의자가 바닥을 긁지 않게 해 줘.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Seongho, the debate final starts in forty-five minutes."],
        ["M", "Our notes are printed and the timer is set."],
        ["W", "Did anyone bring the score sheets for the judges?"],
        ["M", "I thought the teacher was bringing them."],
        ["W", "She's been in a meeting since two o'clock."],
        ["M", "Then nobody has picked them up."],
        ["W", "They're in the box in the staff copy room."],
        ["M", "That room is locked after four on Fridays."],
        ["W", "It's ten past three, so there's still time."],
        ["M", "I should go before the meeting ends and it gets busy."],
        ["W", "I'll set out the water for the speakers."],
        ["M", "I'll go and get the score sheets."],
      ],
      choices: [
        "물을 놓기",
        "자료를 출력하기",
        "채점표를 가져오기",
        "선생님을 부르기",
        "시계를 맞추기",
      ],
      answer: 3,
      clue: "I'll go and get the score sheets.",
      explanation:
        "남자는 복사실에서 채점표를 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 성호야, 토론 결승이 45분 뒤에 시작해.",
        "M: 자료는 출력했고 시계도 맞춰 놨어.",
        "W: 심사위원 드릴 채점표는 누가 가져왔어?",
        "M: 선생님이 가져오시는 줄 알았는데.",
        "W: 두 시부터 회의에 계셔.",
        "M: 그럼 아무도 안 찾아왔네.",
        "W: 교직원 복사실 상자에 있어.",
        "M: 그 방은 금요일에는 네 시 넘으면 잠겨.",
        "W: 세 시 10분이니까 아직 시간 있어.",
        "M: 회의 끝나서 붐비기 전에 가야겠다.",
        "W: 나는 발표자들 마실 물을 놓을게.",
        "M: 내가 가서 채점표를 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the camera shop. What can I help you with?"],
        ["W", "I'd like to rent a camera for the weekend."],
        ["M", "The basic body is fifteen dollars a day."],
        ["W", "Does that include a lens?"],
        ["M", "One standard lens is included at no extra cost."],
        ["W", "I'll need it for Saturday and Sunday, then."],
        ["M", "Would you like a tripod as well?"],
        ["W", "Yes, please. How much is that?"],
        ["M", "Five dollars a day for the tripod."],
        ["W", "Is there any discount for students?"],
        ["M", "Ten percent off the total with a school card."],
        ["W", "Here it is. I'll pay now."],
      ],
      choices: ["$32.40", "$36.00", "$38.00", "$40.00", "$44.00"],
      answer: 2,
      clue: "The basic body is fifteen dollars a day.",
      explanation:
        "이틀이면 본체 30달러와 삼각대 10달러로 40달러인데, 10퍼센트를 빼면 36달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 사진기 가게에 오신 걸 환영합니다. 무엇을 도와드릴까요?",
        "W: 주말 동안 사진기를 빌리고 싶어요.",
        "M: 기본 본체는 하루에 15달러입니다.",
        "W: 거기에 렌즈도 들어 있나요?",
        "M: 기본 렌즈 하나는 추가 비용 없이 포함됩니다.",
        "W: 그럼 토요일과 일요일에 쓸게요.",
        "M: 삼각대도 필요하신가요?",
        "W: 네, 주세요. 얼마예요?",
        "M: 삼각대는 하루에 5달러입니다.",
        "W: 학생 할인은 있나요?",
        "M: 학생증이 있으면 전체에서 10퍼센트 할인됩니다.",
        "W: 여기 있어요. 지금 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 학교 축제 준비를 그만둔 이유를 고르시오.",
      lines: [
        ["M", "Dahye, I heard you left the festival planning team."],
        ["M", "You worked on it every day for three weeks."],
        ["W", "I handed my part over on Monday."],
        ["M", "Did you fall out with anyone on the team?"],
        ["W", "Not at all. I still eat lunch with them."],
        ["M", "Then was the work too much on top of classes?"],
        ["W", "It was heavy, but I could manage it."],
        ["M", "So what made you stop?"],
        ["W", "I was chosen for the regional math competition."],
        ["M", "When is that held?"],
        ["W", "The same week as the festival, and I have to prepare."],
        ["M", "Then you had no choice at all."],
      ],
      choices: [
        "수학 대회 준비를 해야 해서",
        "팀원들과 다퉈서",
        "일이 너무 많아서",
        "몸이 아파서",
        "부모님이 반대해서",
      ],
      answer: 1,
      clue: "I was chosen for the regional math competition.",
      explanation:
        "여자는 지역 수학 대회 준비 때문에 그만두었다. 따라서 답은 ①이다.",
      translation: [
        "M: 다혜야, 축제 준비팀에서 나왔다며.",
        "M: 3주 동안 매일 했잖아.",
        "W: 월요일에 내 몫을 넘겼어.",
        "M: 팀원이랑 틀어졌어?",
        "W: 전혀. 아직도 같이 점심 먹어.",
        "M: 그럼 수업까지 더해서 일이 너무 많았어?",
        "W: 벅차긴 했는데 감당은 됐어.",
        "M: 그럼 왜 그만뒀어?",
        "W: 지역 수학 대회에 뽑혔어.",
        "M: 그게 언제야?",
        "W: 축제랑 같은 주야. 준비를 해야 해.",
        "M: 그럼 달리 방법이 없었겠다.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 청소년 글쓰기 공모전에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Kiwon, are you entering the youth writing competition?"],
        ["W", "The poster went up in the library this morning."],
        ["M", "I saw it. When is the deadline?"],
        ["W", "The end of November, through the city website."],
        ["M", "What kind of writing do they accept?"],
        ["W", "Short stories and essays, but no poetry this year."],
        ["M", "How long can a piece be?"],
        ["W", "Between three thousand and six thousand letters."],
        ["M", "Is there a set theme?"],
        ["W", "A place you would return to."],
        ["M", "That's broad enough to work with."],
        ["W", "One entry per person, and it must be unpublished."],
        ["M", "Then I'll start something this weekend."],
      ],
      choices: ["제출 기한", "받는 글의 종류", "글의 분량", "올해 주제", "심사 위원"],
      answer: 5,
      clue: "The end of November, through the city website.",
      explanation:
        "기한, 종류, 분량, 주제는 말했지만 심사 위원은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 기원아, 청소년 글쓰기 공모전에 낼 거야?",
        "W: 오늘 아침에 도서관에 안내문이 붙었어.",
        "M: 봤어. 마감이 언제야?",
        "W: 11월 말까지, 시 누리집으로.",
        "M: 어떤 글을 받아?",
        "W: 단편과 산문. 올해는 시는 안 받아.",
        "M: 글은 얼마나 길어도 돼?",
        "W: 3천 자에서 6천 자 사이.",
        "M: 정해진 주제가 있어?",
        "W: 다시 돌아가고 싶은 장소.",
        "M: 그 정도면 쓸 만큼 넓네.",
        "W: 한 사람당 한 편이고 발표한 적 없는 글이어야 해.",
        "M: 그럼 이번 주말에 하나 시작해야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 겨울 방학 진로 탐방에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, students. Here is the plan for the winter career visit. " +
            "It takes place on the ninth and tenth of January, two days in all. " +
            "Each day a different group of twenty students goes out. " +
            "We visit a hospital on the first day and a design studio on the second. " +
            "The school bus leaves the front gate at nine in the morning. " +
            "You must wear your school uniform on both days. " +
            "Lunch is provided at each workplace, so bring nothing but a notebook. " +
            "After the visit, write one page about what surprised you. " +
            "Applications close at the career office next Friday.",
        ],
      ],
      choices: [
        "1월 9일과 10일 이틀 동안 진행된다",
        "하루에 스무 명씩 나간다",
        "첫날에는 병원을 방문한다",
        "교복을 입어야 한다",
        "점심을 각자 준비해야 한다",
      ],
      answer: 5,
      clue: "Lunch is provided at each workplace, so bring nothing but a notebook.",
      explanation:
        "점심은 방문지에서 제공된다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 겨울 진로 탐방 계획을 알려 드립니다. 1월 9일과 10일, 모두 이틀 동안 진행됩니다. 하루에 스무 명씩 다른 모둠이 나갑니다. 첫날에는 병원을, 둘째 날에는 디자인 작업실을 방문합니다. 학교 버스는 아침 아홉 시에 정문에서 출발합니다. 이틀 다 교복을 입으셔야 합니다. 점심은 방문지마다 제공되니 공책 말고는 아무것도 가져오지 않으셔도 됩니다. 다녀온 뒤에는 놀랐던 점에 대해 한 쪽을 쓰십시오. 신청은 다음 주 금요일에 진로 상담실에서 마감합니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 강좌를 고르시오.",
      lines: [
        ["M", "Areum, which winter course should we take together?"],
        ["W", "Five are open at the education center this year."],
        ["M", "We both have the mock exam in the first week of January."],
        ["W", "So anything starting before the tenth is out."],
        ["M", "That still leaves us more than one choice."],
        ["W", "The fee has to stay under a hundred thousand won."],
        ["M", "That's what my parents said as well."],
        ["W", "One of them is well above that amount."],
        ["M", "And it should meet in the evening, after five."],
        ["W", "We can't get there any earlier than that."],
        ["M", "Then only one course fits all three conditions."],
        ["W", "I'll register for both of us tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "So anything starting before the tenth is out.",
      explanation:
        "10일 이후 시작, 10만 원 미만, 저녁 수업인 강좌는 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Starts: Jan 5 / Fee: 80,000 won / Time: Evening" },
          { no: 2, label: "②", value: "Starts: Jan 12 / Fee: 120,000 won / Time: Evening" },
          { no: 3, label: "③", value: "Starts: Jan 15 / Fee: 90,000 won / Time: Morning" },
          { no: 4, label: "④", value: "Starts: Jan 14 / Fee: 95,000 won / Time: Evening" },
          { no: 5, label: "⑤", value: "Starts: Jan 8 / Fee: 70,000 won / Time: Evening" },
        ],
      },
      translation: [
        "M: 아름아, 겨울 강좌 뭘 같이 들을까?",
        "W: 올해 교육 센터에 다섯 개가 열려.",
        "M: 우리 둘 다 1월 첫째 주에 모의고사가 있어.",
        "W: 그럼 10일 전에 시작하는 건 빠지네.",
        "M: 그래도 고를 게 하나보다는 많아.",
        "W: 수강료는 10만 원 미만이어야 해.",
        "M: 우리 부모님도 그렇게 말씀하셨어.",
        "W: 하나는 그보다 훨씬 비싸.",
        "M: 그리고 다섯 시 넘어 저녁에 해야 해.",
        "W: 그보다 일찍은 도착을 못 하니까.",
        "M: 그럼 세 조건에 다 맞는 건 하나뿐이야.",
        "W: 오늘 밤에 둘 다 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you looked at the university brochures yet?"],
        ["M", "I picked up three from the counseling office."],
        ["W", "The application talk is on Thursday afternoon."],
        ["M", "I marked it on my calendar this morning."],
        ["W", "Shall we go to it together?"],
      ],
      choices: [
        "Sure, I'll wait by the stairs.",
        "The talk was last month.",
        "I don't need any brochures.",
        "There is no counseling office.",
        "Thursday is a holiday.",
      ],
      answer: 1,
      clue: "Shall we go to it together?",
      explanation:
        "같이 가자는 제안이므로, 계단 옆에서 기다리겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 대학 안내 책자 봤어?",
        "M: 상담실에서 세 권 가져왔어.",
        "W: 지원 설명회가 목요일 오후야.",
        "M: 오늘 아침에 달력에 표시했어.",
        "W: 같이 갈까?",
        "M: 좋아, 계단 옆에서 기다릴게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, can I use the seminar room after six?"],
        ["W", "Only if a teacher signs the form for you."],
        ["M", "Where do I get the form?"],
        ["W", "At the office, on the counter by the door."],
        ["M", "Does the teacher have to stay with me?"],
      ],
      choices: [
        "The seminar room is gone.",
        "No, signing is enough.",
        "I don't work here.",
        "There are no forms.",
        "You can't stay late.",
      ],
      answer: 2,
      clue: "Does the teacher have to stay with me?",
      explanation:
        "선생님이 같이 있어야 하는지 물었으므로, 서명만 하면 된다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 여섯 시 넘어서 세미나실을 쓸 수 있나요?",
        "W: 선생님이 서류에 서명해 주셔야만 돼요.",
        "M: 서류는 어디서 받나요?",
        "W: 사무실 문 옆 안내대에서요.",
        "M: 선생님이 저랑 같이 계셔야 하나요?",
        "W: 아니요, 서명만 하시면 됩니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Suyeon, how is the club's reading programme going?"],
        ["W", "We chose a book in March and nobody has finished it."],
        ["M", "How long is the book?"],
        ["W", "Six hundred pages, and rather dense."],
        ["M", "Did everyone agree to that at the start?"],
        ["W", "We voted, and it won by one vote."],
        ["M", "A book that wins by one vote is a book half the club dreads."],
        ["W", "I hadn't looked at the vote that way."],
        ["M", "What could you read together instead?"],
        ["W", "Something shorter that everyone actually finishes."],
        ["M", "How long should the next one be?"],
      ],
      choices: [
        "Six hundred pages again.",
        "Under two hundred pages.",
        "We won't read anything.",
        "The club is closing.",
        "Nobody likes reading.",
      ],
      answer: 2,
      clue: "How long should the next one be?",
      explanation:
        "다음 책이 얼마나 길어야 하는지 물었으므로, 200쪽 미만이라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수연아, 동아리 독서 활동은 잘돼 가?",
        "W: 3월에 책을 골랐는데 아무도 다 못 읽었어.",
        "M: 책이 얼마나 길어?",
        "W: 600쪽이고 꽤 빽빽해.",
        "M: 처음에 다들 동의했어?",
        "W: 투표했는데 한 표 차로 뽑혔어.",
        "M: 한 표 차로 뽑힌 책은 절반이 부담스러워하는 책이지.",
        "W: 그 투표를 그렇게 보지는 않았어.",
        "M: 대신 뭘 같이 읽으면 좋을까?",
        "W: 다들 정말로 끝낼 수 있는 짧은 것.",
        "M: 다음 책은 얼마나 길어야 할까?",
        "W: 200쪽 미만.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, you said your English listening score has not moved."],
        ["M", "The same score for four months now."],
        ["W", "How do you practice?"],
        ["M", "I listen to one test a week and check the answers."],
        ["W", "Do you listen again after checking?"],
        ["M", "Once I know the answer, I move on."],
        ["W", "Then you never hear what you missed."],
        ["M", "I suppose I only find out that I missed it."],
        ["W", "The second listening is where the gap closes."],
        ["M", "I never gave that part any time."],
        ["W", "How many minutes could you add for a second listening?"],
      ],
      choices: [
        "I won't listen again.",
        "Ten minutes, easily.",
        "I'll take two tests instead.",
        "Listening never helps.",
        "I'll stop checking answers.",
      ],
      answer: 2,
      clue: "How many minutes could you add for a second listening?",
      explanation:
        "두 번째 듣기에 몇 분을 더 쓸 수 있는지 물었으므로, 10분이라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태민아, 영어 듣기 점수가 안 움직인다고 했잖아.",
        "M: 넉 달째 같은 점수야.",
        "W: 어떻게 연습해?",
        "M: 일주일에 한 회분을 듣고 답을 맞춰 봐.",
        "W: 맞춰 보고 다시 들어?",
        "M: 답을 알고 나면 넘어가.",
        "W: 그럼 놓친 것을 한 번도 안 듣는 거네.",
        "M: 놓쳤다는 사실만 알게 되는 거구나.",
        "W: 두 번째 듣기에서 그 틈이 메워져.",
        "M: 그 부분에 시간을 준 적이 없어.",
        "W: 두 번째 듣기에 몇 분쯤 더 쓸 수 있어?",
        "M: 10분은 넉넉히.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Nayoung이 Junseo에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Nayoung : ________________",
      lines: [
        [
          "W",
          "Nayoung and Junseo are finishing the club's budget report together. " +
            "Junseo has added up every receipt from the whole year " +
            "and written the total at the bottom of the final page. " +
            "Nayoung has just checked the figures with a calculator " +
            "and found that one receipt has been counted twice. " +
            "The total is therefore forty thousand won higher than the real amount. " +
            "The report goes to the school office in an hour, " +
            "and a wrong total would have to be corrected in front of everyone. " +
            "She wants to tell him about the receipt counted twice. " +
            "In this situation, what would Nayoung most likely say to Junseo?",
        ],
      ],
      choices: [
        "Let's add another receipt.",
        "The report is due next week.",
        "One receipt is counted twice.",
        "We should throw the receipts away.",
        "The total looks too low.",
      ],
      answer: 3,
      clue: "She wants to tell him about the receipt counted twice.",
      explanation:
        "영수증 하나가 두 번 더해져 합계가 틀렸으므로, 그 사실을 알리는 ③이 가장 적절하다.",
      translation: [
        "W: 나영이와 준서는 동아리 예산 보고서를 함께 마무리하고 있습니다. 준서는 한 해 영수증을 모두 더해 마지막 쪽 아래에 합계를 적었습니다. 나영이는 방금 계산기로 숫자를 확인하다가 영수증 하나가 두 번 세어진 것을 발견했습니다. 그래서 합계가 실제 금액보다 4만 원 많습니다. 보고서는 한 시간 뒤에 학교 사무실로 가고, 합계가 틀리면 여러 사람 앞에서 고쳐야 합니다. 그녀는 두 번 세어진 영수증에 대해 말하고 싶습니다. 이런 상황에서 나영이가 준서에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about the ways animals " +
            "carry information across distances without making any sound. " +
            "The honeybee returning to the hive dances a figure of eight, " +
            "and the angle of that dance tells the others where the flowers are. " +
            "An ant walking home leaves a trail of chemicals behind it, " +
            "and a good find is marked by a stronger trail than a poor one. " +
            "The cuttlefish changes the colour of its skin in waves, " +
            "showing one message to the animal on its left " +
            "and a completely different one to the animal on its right. " +
            "Fireflies flash in patterns as exact as a spoken sentence. " +
            "Language, it seems, was invented many times and rarely with a voice.",
        ],
      ],
      choices: [
        "how animals communicate without sound",
        "why bees are important to farming",
        "how insects find their way home",
        "why some animals change colour",
        "how light travels through water",
      ],
      answer: 1,
      clue: "Language, it seems, was invented many times and rarely with a voice.",
      explanation:
        "소리 없이 정보를 주고받는 동물들의 방식이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 동물들이 아무 소리도 내지 않고 어떻게 정보를 멀리 전하는지 이야기하려 합니다. 벌집으로 돌아온 꿀벌은 여덟 자 모양으로 춤을 추는데, 그 춤의 각도가 꽃이 어디 있는지 다른 벌들에게 알려 줍니다. 집으로 걸어가는 개미는 뒤에 화학 물질 자취를 남기고, 좋은 먹이를 찾았을수록 자취가 진합니다. 갑오징어는 살갗 빛깔을 물결처럼 바꾸어, 왼쪽 상대에게는 이런 말을, 오른쪽 상대에게는 전혀 다른 말을 동시에 보여 줍니다. 반딧불이는 말로 된 문장만큼 정확한 무늬로 빛을 깜빡입니다. 말은 여러 번 따로 생겨났고, 목소리로 생긴 적은 드물었던 모양입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 동물이 아닌 것을 고르시오.",
      lines: [
        ["M", "The honeybee returning to the hive dances a figure of eight."],
        ["M", "An ant walking home leaves a trail of chemicals behind it."],
        ["M", "The cuttlefish changes the colour of its skin in waves."],
        ["M", "Fireflies flash in patterns as exact as a spoken sentence."],
        ["M", "Language was invented many times and rarely with a voice."],
      ],
      choices: ["honeybees", "ants", "cuttlefish", "fireflies", "whales"],
      answer: 5,
      clue: "Fireflies flash in patterns as exact as a spoken sentence.",
      explanation:
        "꿀벌, 개미, 갑오징어, 반딧불이는 언급되지만 고래는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
