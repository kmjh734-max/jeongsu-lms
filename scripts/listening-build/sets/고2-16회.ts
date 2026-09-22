/** 고2 듣기 16회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 16회",
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
          "Good afternoon, students. This is Ms. Yun from the science department. " +
            "I want to explain how the laboratory will be used outside class hours from next week. " +
            "Until now, any student could come in during lunch as long as a teacher was inside. " +
            "From Monday the lab is open only to students who have booked a two-hour slot in advance. " +
            "You book on the science page, and you must say which experiment you plan to run. " +
            "This is not to keep you out; it is so that the right equipment is on the bench when you arrive. " +
            "Last term three groups came for the same balance on the same afternoon. " +
            "Booking opens tomorrow morning. Please read the safety notice before you apply. Thank you.",
        ],
      ],
      choices: [
        "실험실 안전 규칙을 새로 알리려고",
        "실험실을 쓰려면 미리 예약해야 한다고 안내하려고",
        "과학 동아리 부원을 모집하려고",
        "실험 기구 구입을 요청하려고",
        "점심시간이 바뀐 것을 알리려고",
      ],
      answer: 2,
      clue: "From Monday the lab is open only to students who have booked a two-hour slot in advance.",
      explanation:
        "다음 주부터 실험실은 미리 두 시간 단위로 예약한 학생만 쓸 수 있다는 것을 알리고 있다. 따라서 말의 목적은 ②이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 과학과 윤 선생님입니다. " +
          "다음 주부터 수업 시간 외에 실험실을 쓰는 방법을 설명하겠습니다. " +
          "지금까지는 교사가 안에 있기만 하면 점심시간에 누구나 들어올 수 있었습니다. " +
          "월요일부터는 두 시간 단위로 미리 예약한 학생만 실험실을 쓸 수 있습니다. " +
          "과학과 누리집에서 예약하고, 어떤 실험을 할 것인지 적어야 합니다. " +
          "막으려는 것이 아닙니다. 여러분이 왔을 때 필요한 기구가 실험대에 나와 있게 하려는 것입니다. " +
          "지난 학기에는 같은 오후에 세 모둠이 같은 저울을 쓰러 왔습니다. " +
          "예약은 내일 아침에 시작합니다. 신청 전에 안전 안내문을 읽어 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Hyunjin, why do you read the questions before the passage?"],
        ["M", "Because otherwise I read the passage twice."],
        ["W", "Isn't that cheating yourself? You miss the flow."],
        ["M", "I thought so too, until I timed myself last month."],
        ["W", "What did you find?"],
        ["M", "Reading the passage first took eleven minutes and I still went back for every question."],
        ["W", "And the other way?"],
        ["M", "Seven minutes, and I only reread the parts the questions pointed at."],
        ["W", "But you lose the shape of the whole text."],
        ["M", "In an exam nobody asks about the shape. They ask five specific things."],
        ["W", "All right. I'll try it on tomorrow's practice set."],
      ],
      choices: [
        "지문은 소리 내어 읽어야 한다",
        "독해는 문제를 먼저 읽고 지문을 보는 것이 낫다",
        "모르는 단어는 바로 찾아보아야 한다",
        "긴 지문부터 푸는 것이 좋다",
        "문제는 풀고 나서 해설을 읽어야 한다",
      ],
      answer: 2,
      clue: "In an exam nobody asks about the shape. They ask five specific things.",
      explanation:
        "남자는 시간을 재어 보니 문제를 먼저 읽고 지문을 보는 편이 빠르고 정확했다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 현진아, 왜 지문보다 문제를 먼저 읽어?",
        "M: 안 그러면 지문을 두 번 읽게 되니까.",
        "W: 그건 스스로를 속이는 거 아니야? 흐름을 놓치잖아.",
        "M: 나도 그렇게 생각했어, 지난달에 시간을 재 보기 전까지는.",
        "W: 뭘 알게 됐는데?",
        "M: 지문을 먼저 읽으면 11분이 걸렸고, 그러고도 문제마다 다시 돌아갔어.",
        "W: 반대로 하면?",
        "M: 7분, 그리고 문제가 가리키는 부분만 다시 읽었어.",
        "W: 그래도 글 전체의 모양은 놓치잖아.",
        "M: 시험에서는 아무도 모양을 묻지 않아. 구체적인 다섯 가지를 물을 뿐이야.",
        "W: 알겠어. 내일 연습 문제에 해 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We are told to ask for feedback, and most of us do it in the worst possible way. " +
            "We hand over the whole thing and say, what do you think? " +
            "The reader then has to guess what kind of help we want, so they mention the easiest thing to see. " +
            "You get a comment about a comma when you needed one about the argument. " +
            "Ask a narrow question instead. Does the second paragraph follow from the first? " +
            "A small question gets a real answer; a large one gets politeness.",
        ],
      ],
      choices: [
        "조언은 여러 사람에게 구해야 한다",
        "글은 소리 내어 읽어 보아야 한다",
        "비판은 겸손하게 받아들여야 한다",
        "피드백은 구체적인 질문으로 구해야 한다",
        "초고는 남에게 보이지 않는 것이 좋다",
      ],
      answer: 4,
      clue: "A small question gets a real answer; a large one gets politeness.",
      explanation:
        "막연히 어떠냐고 묻지 말고 좁고 구체적인 질문을 해야 쓸모 있는 답을 얻는다는 내용이다. 따라서 요지는 ④이다.",
      translation: [
        "W: 우리는 조언을 구하라는 말을 듣지만, 대부분 가장 나쁜 방식으로 구합니다. " +
          "전체를 건네고 어떠냐고 묻습니다. " +
          "그러면 읽는 사람은 어떤 도움을 원하는지 짐작해야 하니, 가장 눈에 띄는 것을 말합니다. " +
          "논지에 대한 말이 필요했는데 쉼표에 대한 말을 듣게 됩니다. " +
          "대신 좁은 질문을 하세요. 두 번째 문단이 첫 번째 문단에서 이어집니까? " +
          "작은 질문은 진짜 답을 얻고, 큰 질문은 예의를 얻습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Dain, the new student lounge looks great in this picture."],
        ["W", "We opened it on Monday. What do you notice first?"],
        ["M", "The wide rectangular mirror on the back wall."],
        ["W", "It makes the room look twice as big."],
        ["M", "On the left there's a shelf with four board games stacked on it."],
        ["W", "Students borrow them at lunch and bring them back by five."],
        ["M", "In the middle there's a round table with four stools."],
        ["W", "Four is all that fits without blocking the door."],
        ["M", "By the window on the right, is that a piano?"],
        ["W", "No, it's a small bookcase. The piano stayed in the music room."],
        ["M", "I see. And next to the door there's a tall coat stand."],
        ["W", "People kept putting their coats on the table before we got it."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's a small bookcase. The piano stayed in the music room.",
      explanation:
        "여자는 창가에 있는 것이 피아노가 아니라 작은 책장이라고 바로잡는다. 그림에는 피아노가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school student lounge seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "Centre of the back wall: one WIDE rectangular mirror hanging on the wall. " +
          "Left wall: a shelf with exactly FOUR flat board game boxes stacked one on top of another. " +
          "Centre of the room: a ROUND table with exactly FOUR round stools around it. " +
          "By the window on the right: an UPRIGHT PIANO with a bench in front of it. " +
          "Next to the door on the far right: a tall COAT STAND with hooks at the top.",
      },
      translation: [
        "M: 다인아, 사진 보니 새 학생 휴게실이 참 좋다.",
        "W: 월요일에 열었어. 뭐가 먼저 보여?",
        "M: 뒷벽에 있는 넓은 직사각형 거울.",
        "W: 방이 두 배로 넓어 보이게 해 줘.",
        "M: 왼쪽 선반에는 보드게임이 네 개 쌓여 있고.",
        "W: 점심시간에 빌려 가서 5시까지 가져다 놔.",
        "M: 가운데에는 의자 네 개짜리 둥근 탁자가 있네.",
        "W: 문을 막지 않으려면 네 개가 딱이야.",
        "M: 오른쪽 창가에 있는 건 피아노야?",
        "W: 아니, 작은 책장이야. 피아노는 음악실에 그대로 있어.",
        "M: 그렇구나. 그리고 문 옆에는 키 큰 옷걸이가 있고.",
        "W: 그거 놓기 전에는 다들 탁자에 외투를 올려놨거든.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Jiho, the volunteer trip is on Saturday and one thing still isn't settled."],
        ["M", "I thought the bus and the gloves were done."],
        ["W", "They are. It's the meeting time."],
        ["M", "We said eight at the school gate, didn't we?"],
        ["W", "We did, but six students live near the river and the bus passes there first."],
        ["M", "So they'd walk to school and then ride back past their own houses."],
        ["W", "Exactly. It would be easier if the bus picked them up on the way."],
        ["M", "Then we need to tell those six a different place and time."],
        ["W", "Could you message them tonight? I have their numbers in the shared sheet."],
        ["M", "I'll send it before nine and ask each of them to reply."],
        ["W", "Thank you. Then I'll tell the driver about the extra stop."],
      ],
      choices: [
        "버스를 예약하기",
        "장갑을 준비하기",
        "여섯 명에게 모이는 곳을 따로 알리기",
        "기사에게 연락하기",
        "명단을 새로 만들기",
      ],
      answer: 3,
      clue: "I'll send it before nine and ask each of them to reply.",
      explanation:
        "남자는 강가에 사는 여섯 명에게 다른 장소와 시간을 문자로 알리고 답을 받기로 한다. 기사 연락은 여자가 맡았다. 따라서 답은 ③이다.",
      translation: [
        "W: 지호야, 봉사 활동이 토요일인데 아직 안 정해진 게 하나 있어.",
        "M: 버스랑 장갑은 다 된 줄 알았는데.",
        "W: 그건 됐어. 모이는 시간이 문제야.",
        "M: 8시에 교문 앞이라고 했잖아.",
        "W: 그랬지, 그런데 여섯 명이 강가에 사는데 버스가 거기를 먼저 지나가.",
        "M: 그럼 걔들은 학교까지 걸어왔다가 자기 집 앞을 다시 지나가는 거네.",
        "W: 그렇지. 오는 길에 태우면 훨씬 낫잖아.",
        "M: 그럼 그 여섯 명한테 다른 장소랑 시간을 알려야겠다.",
        "W: 오늘 밤에 문자 보내 줄 수 있어? 번호는 공유 문서에 있어.",
        "M: 9시 전에 보내고 한 명씩 답하라고 할게.",
        "W: 고마워. 그럼 나는 기사님께 정류장이 하나 는다고 말할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the print shop. What can I do for you?"],
        ["W", "I need our club posters printed for the festival."],
        ["M", "Our A2 posters are four dollars each."],
        ["W", "Fifteen of those, please."],
        ["M", "Fifteen at four dollars is sixty dollars."],
        ["W", "Do you laminate them as well?"],
        ["M", "We do, but only the ones that go outside. It's one dollar each."],
        ["W", "Then laminate five of them."],
        ["M", "All right. And orders over fifty dollars get ten percent off the printing."],
        ["W", "That helps. When can I collect them?"],
        ["M", "Thursday morning."],
        ["W", "Perfect. I'll pay now, by card."],
      ],
      choices: ["$54", "$59", "$60", "$65", "$70"],
      answer: 2,
      clue: "All right. And orders over fifty dollars get ten percent off the printing.",
      explanation:
        "포스터 4달러짜리 열다섯 장은 60달러이고, 10퍼센트 할인을 받으면 54달러이다. 코팅 1달러씩 다섯 장 5달러를 더하면 59달러이므로 답은 ②이다.",
      translation: [
        "M: 인쇄소입니다. 무엇을 도와드릴까요?",
        "W: 축제에 쓸 동아리 포스터를 인쇄하려고요.",
        "M: A2 포스터는 한 장에 4달러입니다.",
        "W: 열다섯 장 주세요.",
        "M: 열다섯 장에 4달러면 60달러입니다.",
        "W: 코팅도 하시나요?",
        "M: 합니다. 다만 밖에 붙일 것만요. 한 장에 1달러입니다.",
        "W: 그럼 다섯 장만 코팅해 주세요.",
        "M: 알겠습니다. 그리고 50달러가 넘는 주문은 인쇄비에서 10퍼센트 할인됩니다.",
        "W: 도움이 되네요. 언제 찾으러 오면 될까요?",
        "M: 목요일 오전입니다.",
        "W: 좋아요. 지금 카드로 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 학급 발표를 미루려는 이유를 고르시오.",
      lines: [
        ["W", "Seungmin, you asked the teacher to move your presentation?"],
        ["M", "To next week, yes. She said it was fine."],
        ["W", "Is it because you haven't finished the slides?"],
        ["M", "No, the slides were done on Sunday."],
        ["W", "Then why? You've been ready for days."],
        ["M", "My part depends on the survey results, and only nineteen people have answered."],
        ["W", "How many do you need?"],
        ["M", "At least fifty, or the numbers mean nothing."],
        ["W", "So another week gives people time to reply."],
        ["M", "That's the idea. I sent a reminder this morning."],
      ],
      choices: [
        "자료가 아직 완성되지 않아서",
        "몸이 아파서",
        "다른 일정과 겹쳐서",
        "설문 응답이 모자라서",
        "주제를 바꾸고 싶어서",
      ],
      answer: 4,
      clue: "My part depends on the survey results, and only nineteen people have answered.",
      explanation:
        "설문에 열아홉 명만 답해 적어도 쉰 명이 필요하므로 발표를 미루려 한다. 따라서 답은 ④이다.",
      translation: [
        "W: 승민아, 선생님께 발표를 미뤄 달라고 했다며?",
        "M: 다음 주로, 응. 괜찮다고 하셨어.",
        "W: 자료를 아직 못 끝내서야?",
        "M: 아니, 슬라이드는 일요일에 다 했어.",
        "W: 그럼 왜? 며칠째 준비돼 있었잖아.",
        "M: 내 부분이 설문 결과에 달렸는데 열아홉 명만 답했어.",
        "W: 몇 명이 필요한데?",
        "M: 적어도 쉰 명. 안 그러면 숫자가 아무 의미가 없어.",
        "W: 그럼 한 주 더 있으면 사람들이 답할 시간이 생기겠네.",
        "M: 그게 목적이야. 오늘 아침에 다시 알렸어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 영화 감상 주간에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Chaewon, have you seen the poster for the film week?"],
        ["W", "I saw it from a distance. What is it?"],
        ["M", "They show one film every afternoon for five days, from the ninth."],
        ["W", "Where are they shown?"],
        ["M", "In the big hall, right after the sixth period."],
        ["W", "What kind of films?"],
        ["M", "Four documentaries and one animation, all made in Korea."],
        ["W", "Do we have to sign up?"],
        ["M", "No, you just walk in. There are three hundred seats."],
        ["W", "Then I'll go on the first day."],
        ["M", "Come early. Last year people sat on the steps."],
      ],
      choices: ["진행 기간", "상영 장소", "상영 작품", "입장 방법", "관람 학년"],
      answer: 5,
      clue: "No, you just walk in. There are three hundred seats.",
      explanation:
        "기간(9일부터 닷새), 장소(대강당), 작품(다큐 네 편과 애니메이션 한 편), 입장 방법(신청 없이 입장)은 언급되지만 관람 학년은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 채원아, 영화 주간 포스터 봤어?",
        "W: 멀리서 봤어. 뭐야?",
        "M: 9일부터 닷새 동안 오후마다 한 편씩 틀어 줘.",
        "W: 어디서 하는데?",
        "M: 대강당에서, 6교시 끝나고 바로.",
        "W: 어떤 영화들인데?",
        "M: 다큐멘터리 네 편이랑 애니메이션 한 편, 전부 한국 작품이야.",
        "W: 신청해야 해?",
        "M: 아니, 그냥 들어가면 돼. 자리가 300석이야.",
        "W: 그럼 첫날에 가야지.",
        "M: 일찍 와. 작년에는 계단에 앉은 사람도 있었어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Saetbyeol Youth Library에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Saetbyeol Youth Library, which opened two years ago. " +
            "It is open from ten in the morning until nine at night, every day except the first Monday of the month. " +
            "Only students between thirteen and nineteen may borrow books, but anyone may read inside. " +
            "You can take out five books for two weeks, and you may renew them once online. " +
            "There is a quiet study floor upstairs, and you do not need to book a seat there. " +
            "Food is not allowed anywhere in the building, not even in the lobby. " +
            "The nearest bus stop is right outside the front door.",
        ],
      ],
      choices: [
        "2년 전에 문을 열었다",
        "매달 첫째 월요일에는 쉰다",
        "13세에서 19세만 책을 빌릴 수 있다",
        "한 번에 다섯 권을 2주 동안 빌릴 수 있다",
        "위층 열람실은 자리를 예약해야 한다",
      ],
      answer: 5,
      clue: "There is a quiet study floor upstairs, and you do not need to book a seat there.",
      explanation:
        "위층 열람실은 자리를 예약할 필요가 없다고 했다. 따라서 ⑤가 내용과 일치하지 않는다.",
      translation: [
        "W: 2년 전에 문을 연 Saetbyeol Youth Library를 소개합니다. " +
          "매달 첫째 월요일을 빼고 매일 아침 10시부터 밤 9시까지 엽니다. " +
          "책은 13세에서 19세 학생만 빌릴 수 있지만, 안에서 읽는 것은 누구나 할 수 있습니다. " +
          "한 번에 다섯 권을 2주 동안 빌릴 수 있고, 온라인으로 한 번 연장할 수 있습니다. " +
          "위층에는 조용한 열람실이 있고, 자리를 예약할 필요는 없습니다. " +
          "건물 안에서는 로비를 포함해 어디서도 음식을 먹을 수 없습니다. " +
          "가장 가까운 버스 정류장은 정문 바로 앞에 있습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 촬영 장비를 고르시오.",
      lines: [
        ["M", "Naeun, these are the five camera kits the media room still has free."],
        ["W", "Let's pick one. We're filming outdoors, so we need one that's weather sealed."],
        ["M", "Then one is out. It says indoor use only."],
        ["W", "Next, how long does the battery last? We film for four hours."],
        ["M", "One only lasts two hours, so that's gone as well."],
        ["W", "Three left. Do they all come with a tripod?"],
        ["M", "Two do. One doesn't, and we can't hold it steady for four hours."],
        ["W", "Two left, then. What about the deposit?"],
        ["M", "We can only leave thirty thousand won."],
        ["W", "Then only one fits. I'll book it for Saturday."],
        ["M", "Good. I'll bring the memory cards."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Then only one fits. I'll book it for Saturday.",
      explanation:
        "실내용인 ①, 배터리가 두 시간인 ②, 삼각대가 없는 ⑤를 뺀다. 남은 ③과 ④ 중 보증금이 3만 원 이하인 것은 ③이므로 답은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "실내용 / 6시간 / 삼각대 있음 / 20,000원" },
          { no: 2, label: "②", value: "야외 가능 / 2시간 / 삼각대 있음 / 25,000원" },
          { no: 3, label: "③", value: "야외 가능 / 5시간 / 삼각대 있음 / 30,000원" },
          { no: 4, label: "④", value: "야외 가능 / 6시간 / 삼각대 있음 / 40,000원" },
          { no: 5, label: "⑤", value: "야외 가능 / 5시간 / 삼각대 없음 / 22,000원" },
        ],
      },
      translation: [
        "M: 나은아, 미디어실에 아직 비어 있는 촬영 장비가 이 다섯 개야.",
        "W: 하나 고르자. 야외에서 찍으니까 방수되는 게 필요해.",
        "M: 그럼 하나 빠지네. 실내용이래.",
        "W: 다음으로 배터리가 얼마나 가? 우리는 네 시간 찍잖아.",
        "M: 하나는 두 시간밖에 안 가서 그것도 빠져.",
        "W: 셋 남았다. 다 삼각대가 같이 와?",
        "M: 둘은 와. 하나는 없는데, 네 시간을 손으로 들고 있을 수는 없잖아.",
        "W: 그럼 둘 남았네. 보증금은?",
        "M: 우리는 3만 원까지만 낼 수 있어.",
        "W: 그럼 하나만 맞네. 토요일로 예약할게.",
        "M: 좋아. 메모리 카드는 내가 가져갈게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you handed in the field trip report?"],
        ["M", "Not yet. I can't find the photo we took at the harbour."],
        ["W", "Wasn't it in the group chat?"],
        ["M", "I looked, but the chat only keeps a month of files."],
        ["W", "Seoyul saved them all in the shared album."],
      ],
      choices: [
        "Then I'll ask her for the album link.",
        "The report is due on Friday.",
        "I took about forty photos that day.",
        "The harbour was very windy.",
        "You should write your report first.",
      ],
      answer: 1,
      clue: "Seoyul saved them all in the shared album.",
      explanation:
        "서율이가 사진을 공유 앨범에 저장해 두었다는 말을 들었으므로, 앨범 주소를 물어보겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 현장학습 보고서 냈어?",
        "M: 아직. 항구에서 찍은 사진을 못 찾겠어.",
        "W: 단체 대화방에 없었어?",
        "M: 봤는데 대화방은 파일을 한 달만 보관해.",
        "W: 서율이가 공유 앨범에 다 저장해 뒀어.",
        "M: 그럼 서율이한테 앨범 주소를 물어봐야겠다.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "You've been eating lunch at your desk all week."],
        ["W", "The cafeteria queue takes twenty minutes now."],
        ["M", "Is it that long every day?"],
        ["W", "Only between twelve and twelve thirty."],
        ["M", "Our class can go at twelve forty. Nobody is there by then."],
      ],
      choices: [
        "I usually bring a sandwich.",
        "The cafeteria is on the first floor.",
        "Then I'll go at twelve forty tomorrow.",
        "My classroom is quite quiet.",
        "You should eat at your desk too.",
      ],
      answer: 3,
      clue: "Our class can go at twelve forty. Nobody is there by then.",
      explanation:
        "12시 40분에는 줄이 없다는 말을 들었으므로, 내일 그때 가겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 일주일 내내 자리에서 점심을 먹네.",
        "W: 요즘 급식 줄이 20분이나 걸려.",
        "M: 매일 그렇게 길어?",
        "W: 12시부터 12시 30분 사이에만.",
        "M: 우리 반은 12시 40분에 갈 수 있어. 그때는 아무도 없어.",
        "W: 그럼 내일은 12시 40분에 가 볼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Suhyeon, how is the school magazine going this term?"],
        ["W", "We print it every month, but hardly anyone picks it up."],
        ["M", "Where do you leave the copies?"],
        ["W", "On the table outside the staff room."],
        ["M", "Outside the staff room? Most students avoid that corridor."],
        ["W", "I hadn't thought about that. It's just where we've always put them."],
        ["M", "How many are left at the end of the month?"],
        ["W", "About seventy out of a hundred."],
        ["M", "So the magazine isn't the problem; the table is."],
        ["W", "That's a strange relief, actually."],
        ["M", "Put them by the cafeteria door for one month and count what's left."],
      ],
      choices: [
        "Then I'll move the table to the cafeteria door.",
        "We print a hundred copies each time.",
        "The magazine has sixteen pages.",
        "I'd rather stop printing it altogether.",
        "Our team has six members now.",
      ],
      answer: 1,
      clue: "Put them by the cafeteria door for one month and count what's left.",
      explanation:
        "한 달 동안 급식실 문 옆에 두고 남는 부수를 세어 보라는 조언을 들었으므로, 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 수현아, 이번 학기 학교 잡지는 잘돼 가?",
        "W: 매달 인쇄하는데 가져가는 사람이 거의 없어.",
        "M: 어디에 놔두는데?",
        "W: 교무실 앞 탁자에.",
        "M: 교무실 앞에? 학생들은 그 복도를 잘 안 지나가잖아.",
        "W: 그 생각은 못 했어. 늘 거기에 뒀거든.",
        "M: 월말에 몇 부나 남아?",
        "W: 100부 중에 70부쯤.",
        "M: 그럼 잡지가 문제가 아니라 탁자가 문제네.",
        "W: 이상하게 안심이 된다.",
        "M: 한 달만 급식실 문 옆에 두고 몇 부 남는지 세어 봐.",
        "W: 그럼 탁자를 급식실 문 옆으로 옮길게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Dohun, you've been learning Japanese on your own since spring, haven't you?"],
        ["M", "Seven months, and I still can't say a full sentence."],
        ["W", "What do you do each day?"],
        ["M", "Thirty new words every evening, from an app."],
        ["W", "Only words? No sentences at all?"],
        ["M", "The app gives sentences too, but I skip them. Words feel like progress."],
        ["W", "So you can name two thousand things and ask for none of them."],
        ["M", "When you put it that way, that's exactly my problem."],
        ["W", "Learn five words a day inside a sentence you would actually say."],
      ],
      choices: [
        "Then I'll learn five words in sentences from tonight.",
        "I know about two thousand words now.",
        "The app costs five dollars a month.",
        "I started studying Japanese in spring.",
        "You should learn Japanese with me.",
      ],
      answer: 1,
      clue: "Learn five words a day inside a sentence you would actually say.",
      explanation:
        "하루 다섯 낱말을 실제로 쓸 문장 안에서 익히라는 조언을 들었으므로, 오늘 밤부터 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 도훈아, 봄부터 혼자 일본어 공부하고 있지?",
        "M: 7개월째인데 아직 문장 하나를 못 말해.",
        "W: 매일 뭘 하는데?",
        "M: 저녁마다 앱으로 새 낱말 서른 개씩.",
        "W: 낱말만? 문장은 전혀 안 해?",
        "M: 앱에 문장도 있는데 건너뛰어. 낱말이 진도 나가는 느낌이라.",
        "W: 그럼 이천 가지 이름을 댈 수 있는데 그중 아무것도 달라고 못 하는 거네.",
        "M: 그렇게 말하니 딱 내 문제야.",
        "W: 하루에 다섯 낱말만, 네가 실제로 말할 문장 안에서 익혀 봐.",
        "M: 그럼 오늘 밤부터 다섯 낱말을 문장으로 익힐게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Ms. Gu가 Jiwon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Ms. Gu : ________________",
      lines: [
        [
          "M",
          "Ms. Gu leads the school newspaper, and Jiwon is her best interviewer. " +
            "Jiwon prepares carefully and asks questions nobody else thinks of. " +
            "In her last three interviews, however, she asked every question on her list in order. " +
            "Twice the person said something surprising, and Jiwon moved straight on to the next question. " +
            "Ms. Gu does not want her to prepare less; that preparation is why people trust her. " +
            "The trouble is that the best answer is usually the one you did not plan to ask about. " +
            "The next interview is with a former student who now works at sea. " +
            "She wants to tell Jiwon to follow the surprising answer instead of returning to the list. " +
            "In this situation, what would Ms. Gu most likely say to Jiwon?",
        ],
      ],
      choices: [
        "Try to prepare fewer questions next time.",
        "When an answer surprises you, follow it instead of your list.",
        "I think someone else should do this interview.",
        "You should record the interview on your phone.",
        "Let's move the interview to next month.",
      ],
      answer: 2,
      clue: "She wants to tell Jiwon to follow the surprising answer instead of returning to the list.",
      explanation:
        "구 선생님은 지원의 준비를 문제 삼지 않으면서, 뜻밖의 답이 나오면 목록으로 돌아가지 말고 그 답을 따라가라고 말하려 한다. 따라서 ②가 가장 적절하다.",
      translation: [
        "M: 구 선생님은 학교 신문을 맡고 있고, 지원이는 가장 좋은 인터뷰어입니다. " +
          "지원이는 꼼꼼히 준비하고 아무도 생각하지 못한 질문을 합니다. " +
          "그런데 최근 세 번의 인터뷰에서 목록의 질문을 순서대로 하나도 빠짐없이 물었습니다. " +
          "두 번은 상대가 뜻밖의 이야기를 꺼냈는데, 지원이는 곧바로 다음 질문으로 넘어갔습니다. " +
          "구 선생님은 지원이가 준비를 덜 하기를 바라지 않습니다. 그 준비 덕분에 사람들이 지원이를 믿습니다. " +
          "문제는 가장 좋은 답이 대개 물으려고 계획하지 않았던 것이라는 점입니다. " +
          "다음 인터뷰 상대는 지금 바다에서 일하는 졸업생입니다. " +
          "그래서 뜻밖의 답이 나오면 목록으로 돌아가지 말고 그 답을 따라가라고 말하고 싶습니다. " +
          "이런 상황에서 구 선생님이 지원이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "남자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about how we measured distance before satellites."],
        ["M", "A surveyor could not simply walk across a valley, so the answer had to come from geometry."],
        ["M", "Triangulation was the first method: measure one short baseline, then read the angles to a far point."],
        ["M", "The chain, a hundred links of iron, gave a fixed length that two people could drag across level ground."],
        ["M", "Sailors used the log line instead, a rope with knots thrown overboard and timed with a small glass."],
        ["M", "The odometer, a wheel that counted its own turns, measured roads while a cart simply drove along them."],
        ["M", "None of these tools could see the far end of what it measured."],
        ["M", "Each one turned a distance nobody could walk into a number somebody could write down."],
      ],
      choices: [
        "how satellites find their position",
        "why maps are never completely accurate",
        "the tools people used to measure distance",
        "how roads were built in the past",
        "why sailors needed better clocks",
      ],
      answer: 3,
      clue: "Each one turned a distance nobody could walk into a number somebody could write down.",
      explanation:
        "남자는 삼각측량, 측량 사슬, 통나무 밧줄, 바퀴식 거리계를 들며 거리를 재는 데 써 온 방법을 설명한다. 따라서 주제는 ③이다.",
      translation: [
        "M: 안녕하세요. 오늘은 인공위성이 있기 전에 거리를 어떻게 쟀는지 이야기하려 합니다.",
        "M: 측량사는 골짜기를 그냥 걸어 건널 수 없었으니 답은 기하학에서 나와야 했습니다.",
        "M: 첫 번째 방법은 삼각측량이었습니다. 짧은 기선 하나를 재고 먼 지점까지의 각도를 읽는 것입니다.",
        "M: 쇠고리 백 개로 된 측량 사슬은 두 사람이 평지에서 끌 수 있는 고정된 길이를 주었습니다.",
        "M: 뱃사람들은 대신 통나무 밧줄을 썼습니다. 매듭이 있는 밧줄을 배 밖으로 던지고 작은 모래시계로 시간을 쟀습니다.",
        "M: 바퀴가 제 회전을 세는 거리계는 수레가 달리기만 하면 길의 길이를 재 주었습니다.",
        "M: 이 도구들 가운데 재는 대상의 반대쪽 끝을 볼 수 있는 것은 하나도 없었습니다.",
        "M: 저마다 아무도 걸을 수 없는 거리를 누군가 적을 수 있는 숫자로 바꾸었습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 것이 아닌 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about how we measured distance before satellites."],
        ["M", "A surveyor could not simply walk across a valley, so the answer had to come from geometry."],
        ["M", "Triangulation was the first method: measure one short baseline, then read the angles to a far point."],
        ["M", "The chain, a hundred links of iron, gave a fixed length that two people could drag across level ground."],
        ["M", "Sailors used the log line instead, a rope with knots thrown overboard and timed with a small glass."],
        ["M", "The odometer, a wheel that counted its own turns, measured roads while a cart simply drove along them."],
        ["M", "None of these tools could see the far end of what it measured."],
        ["M", "Each one turned a distance nobody could walk into a number somebody could write down."],
      ],
      choices: ["triangulation", "the surveyor's chain", "the log line", "the odometer", "the compass"],
      answer: 5,
      clue: "The odometer, a wheel that counted its own turns, measured roads while a cart simply drove along them.",
      explanation:
        "삼각측량, 측량 사슬, 통나무 밧줄, 거리계는 언급되지만 나침반은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
