/** 고3 듣기 34회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 34회",
  gradeLevel: "high3",
  speechSpeed: 0.8,
  folder: "고3 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Good afternoon, students. This is Ms. Gu from the examinations office. " +
            "I am speaking about the seating for the November examination. " +
            "Every year a few of you arrive on the day and discover " +
            "that your room is not the one you sat in for the mock tests. " +
            "From this Friday the seating list will be on the wall outside this office, " +
            "with your room and your seat number beside your candidate number. " +
            "Check it once this week and once more on the day before. " +
            "If your name is missing, come to me the same morning, not the night before the exam. " +
            "Nothing else about the arrangements has changed. Thank you.",
        ],
      ],
      choices: [
        "시험 좌석 배치 확인을 안내하려고",
        "시험 날짜 변경을 알리려고",
        "수험표 발급을 안내하려고",
        "모의고사 일정을 알리려고",
        "시험장 공사를 알리려고",
      ],
      answer: 1,
      clue: "From this Friday the seating list will be on the wall outside this office.",
      explanation:
        "여자는 시험 좌석 명단을 붙일 테니 확인하라고 안내한다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 시험 관리실 구 선생님입니다. 11월 시험 좌석 배치에 대해 말씀드립니다. 해마다 몇 사람은 시험 당일에 와서야 자기 시험실이 모의고사 때 앉던 방이 아니라는 것을 알게 됩니다. 이번 주 금요일부터 이 사무실 밖 벽에 좌석 명단을 붙입니다. 수험 번호 옆에 시험실과 좌석 번호가 적혀 있습니다. 이번 주에 한 번, 시험 전날에 한 번 더 확인하세요. 이름이 없으면 시험 전날 밤이 아니라 그날 아침에 저에게 오세요. 그 밖의 사항은 달라지지 않았습니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Sangwoo, I've stopped doing anything except study."],
        ["M", "Nothing at all? No running, no music?"],
        ["W", "Not since the middle of September."],
        ["M", "And how have the last three weeks gone?"],
        ["W", "Worse than August, which is why I cut more out."],
        ["M", "You cut out the only things that were resting you."],
        ["W", "But every hour I spend running is an hour lost."],
        ["M", "An hour running buys back two hours of attention."],
        ["W", "That's easy to say and hard to believe."],
        ["M", "You measured it yourself in August without noticing."],
        ["W", "So I should put one of them back?"],
        ["M", "Put back the one you miss most, and watch what happens by Friday."],
      ],
      choices: [
        "수험 기간에는 공부만 해야 한다",
        "쉬는 활동을 하나는 남겨 두어야 한다",
        "공부 시간을 기록해야 한다",
        "잠을 줄여야 한다",
        "친구와 함께 공부해야 한다",
      ],
      answer: 2,
      clue: "Put back the one you miss most, and watch what happens by Friday.",
      explanation:
        "남자는 쉬게 해 주던 활동을 다 끊지 말고 하나는 되돌리라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 상우야, 나는 공부 말고는 아무것도 안 해.",
        "M: 아무것도? 달리기도, 음악도?",
        "W: 9월 중순부터 안 해.",
        "M: 그래서 지난 삼 주는 어땠어?",
        "W: 8월보다 나빴어. 그래서 더 줄였어.",
        "M: 너를 쉬게 해 주던 것만 골라서 끊은 거야.",
        "W: 달리는 한 시간은 잃는 한 시간이잖아.",
        "M: 달리는 한 시간이 집중하는 두 시간을 되사 줘.",
        "W: 말은 쉬운데 믿기는 어려워.",
        "M: 8월에 네가 모르는 사이에 직접 재 봤잖아.",
        "W: 그럼 하나는 되돌려 놓으라는 거야?",
        "M: 제일 아쉬운 하나를 되돌리고 금요일까지 어떻게 되는지 봐.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We remember advice and forget the conditions it came with. " +
            "Someone tells you they passed by studying from five in the morning, " +
            "and the sentence travels without the rest of their life attached to it. " +
            "They lived two minutes from school. They slept at nine. " +
            "None of that reaches you, and none of it is true for you. " +
            "Take the shape of the advice, not the numbers. " +
            "The useful part is that they studied when their mind was clearest. " +
            "Which hour that is remains yours to find out.",
        ],
      ],
      choices: [
        "조언은 많이 들어야 한다",
        "아침 공부가 가장 효과적이다",
        "조언은 기록해 두어야 한다",
        "성공한 사람의 방법을 그대로 따라야 한다",
        "조언은 자기 상황에 맞게 바꿔 받아들여야 한다",
      ],
      answer: 5,
      clue: "Take the shape of the advice, not the numbers.",
      explanation:
        "여자는 조언에 딸린 조건이 다르므로 숫자가 아니라 그 취지를 자기 상황에 맞게 받아들이라고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 우리는 조언은 기억하고 그 조언에 딸려 있던 조건은 잊습니다. 누군가 새벽 다섯 시부터 공부해서 합격했다고 말하면, 그 문장만 그 사람의 나머지 삶은 떼어 놓은 채 돌아다닙니다. 그 사람은 학교에서 2분 거리에 살았습니다. 아홉 시에 잤습니다. 그런 것은 우리에게 전해지지 않고, 우리에게는 사실도 아닙니다. 조언에서 숫자가 아니라 모양을 가져오세요. 쓸모 있는 부분은 그들이 머리가 가장 맑을 때 공부했다는 것입니다. 그 시간이 몇 시인지는 여러분이 찾아낼 몫입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Hayoon, is this the examination room they showed us?"],
        ["W", "Yes, we sat in it for the last mock test."],
        ["M", "Rows of single desks fill the middle of the room."],
        ["W", "Twenty-four of them, in four rows of six."],
        ["M", "There's a large clock on the front wall."],
        ["W", "It runs a minute slow, so they use the bell instead."],
        ["M", "A cupboard stands in the left corner."],
        ["W", "Bags go in there before the paper is handed out."],
        ["M", "Two notices hang beside the door."],
        ["W", "Three, actually. The smallest one is above the handle."],
        ["M", "And a wide window fills the right wall."],
        ["W", "They close the blind if the sun is on the desks."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Three, actually. The smallest one is above the handle.",
      explanation:
        "남자가 안내문이 두 장이라고 하자 여자가 세 장이라고 바로잡는다. 그림에는 두 장이 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.45, 0.6],
          [0.5, 0.07],
          [0.07, 0.4],
          [0.24, 0.24],
          [0.88, 0.4],
        ],
        scene:
          "A school examination room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "ROWS OF SINGLE DESKS with plain tops fill the MIDDLE of the room. " +
          "A LARGE ROUND CLOCK hangs high on the FRONT wall in the upper middle. " +
          "A CUPBOARD with closed doors stands in the LEFT corner. " +
          "EXACTLY TWO BLANK RECTANGULAR NOTICES hang side by side on the wall beside a door at the upper left, " +
          "clearly separated so both can be counted. " +
          "A WIDE WINDOW with a roller blind fills the RIGHT wall.",
      },
      translation: [
        "M: 하윤아, 여기가 우리한테 보여 준 시험실이야?",
        "W: 응, 지난 모의고사 때 여기서 봤어.",
        "M: 가운데를 1인용 책상 줄이 채우고 있네.",
        "W: 스물네 개. 여섯 개씩 네 줄이야.",
        "M: 앞 벽에는 큰 시계가 있고.",
        "W: 1분 느려서 종으로 신호를 줘.",
        "M: 왼쪽 구석에는 장이 있네.",
        "W: 시험지 나눠 주기 전에 가방을 거기 넣어.",
        "M: 문 옆에는 안내문이 두 장 붙어 있어.",
        "W: 사실 세 장이야. 제일 작은 건 손잡이 위에 있어.",
        "M: 그리고 오른쪽 벽은 넓은 창문이 차지하고 있어.",
        "W: 햇빛이 책상에 들면 가리개를 내려.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaewon, the farewell assembly is on Thursday morning."],
        ["W", "Has the order of the programme been settled?"],
        ["M", "Seven items, and the choir closes it."],
        ["W", "What about the slides behind the stage?"],
        ["M", "Finished on Monday, with photographs from every class."],
        ["W", "Then the main pieces are ready."],
        ["M", "Except the music. Nobody has checked the sound file."],
        ["W", "Isn't it the same file we used in June?"],
        ["M", "It is, but the hall system was replaced in August."],
        ["W", "And the new one refuses half the old formats."],
        ["M", "If it fails on the morning there is no second chance."],
        ["W", "I'll test the sound file in the hall this afternoon."],
      ],
      choices: [
        "발표 자료를 만들기",
        "합창단에 연락하기",
        "강당에서 음원을 점검하기",
        "사진을 모으기",
        "순서를 정하기",
      ],
      answer: 3,
      clue: "I'll test the sound file in the hall this afternoon.",
      explanation:
        "여자는 오늘 오후에 강당에서 음원을 확인하겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 채원아, 송별 조회가 목요일 아침이야.",
        "W: 식순은 정해졌어?",
        "M: 일곱 가지. 합창단이 마무리해.",
        "W: 무대 뒤에 띄울 자료는?",
        "M: 월요일에 끝냈어. 반마다 사진이 들어갔어.",
        "W: 그럼 큰 건 다 됐네.",
        "M: 음악만 빼고. 음원 파일을 아무도 확인 안 했어.",
        "W: 6월에 쓰던 파일 아니야?",
        "M: 맞아. 그런데 8월에 강당 음향 장비를 바꿨어.",
        "W: 새 장비가 예전 형식 절반을 안 받지.",
        "M: 아침에 안 되면 두 번째 기회가 없어.",
        "W: 오늘 오후에 강당에서 음원 확인할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good morning. Are you here about the class photographs?"],
        ["M", "Yes, I'd like to order prints for our class."],
        ["W", "When was the photograph taken?"],
        ["M", "Last Tuesday, the whole class outside the main building."],
        ["W", "I have it here. A standard print is nine dollars."],
        ["M", "We'd like six of those, please."],
        ["W", "Would you like any of them framed?"],
        ["M", "How much does a frame cost?"],
        ["W", "Seven dollars each, in wood or black metal."],
        ["M", "Frame two of them in wood."],
        ["W", "And orders over sixty dollars get ten percent off the prints."],
        ["M", "Here is the class card, then."],
      ],
      choices: ["$62.60", "$68", "$61.20", "$54", "$70"],
      answer: 1,
      clue: "I have it here. A standard print is nine dollars.",
      explanation:
        "사진 여섯 장 54달러에서 10퍼센트를 빼면 48달러 60센트이고, 액자 두 개 14달러를 더하면 62달러 60센트이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 학급 사진 때문에 오셨나요?",
        "M: 네, 우리 반 사진을 인화하려고요.",
        "W: 사진은 언제 찍으셨나요?",
        "M: 지난 화요일에요. 본관 앞에서 반 전체가요.",
        "W: 여기 있네요. 기본 인화는 9달러입니다.",
        "M: 여섯 장 주세요.",
        "W: 액자에 넣어 드릴 것도 있나요?",
        "M: 액자는 얼마예요?",
        "W: 하나에 7달러입니다. 나무나 검은 금속으로요.",
        "M: 두 장은 나무 액자에 넣어 주세요.",
        "W: 그리고 60달러가 넘는 주문은 인화비에서 10퍼센트를 빼 드립니다.",
        "M: 그럼 여기 학급 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 스터디 모임을 그만두려는 이유를 고르시오.",
      lines: [
        ["M", "Naeun, you're leaving the study group?"],
        ["W", "After this week, and I told them yesterday."],
        ["M", "Is it because the meetings run too late?"],
        ["W", "They finish at nine, which is fine for me."],
        ["M", "Then did something happen with the members?"],
        ["W", "Everyone is lovely. We spend the hour talking."],
        ["M", "Talking about the work, or about other things?"],
        ["W", "About other things, for almost all of it."],
        ["M", "So the group is good company and poor study."],
        ["W", "And this term I can't afford three lost evenings a week."],
      ],
      choices: [
        "모임이 늦게 끝나서",
        "회원들과 사이가 나빠서",
        "모임에서 공부가 안 되어서",
        "다른 모임에 들어가서",
        "이사를 가게 되어서",
      ],
      answer: 3,
      clue: "About other things, for almost all of it.",
      explanation:
        "여자는 모임에서 공부가 되지 않아 그만둔다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 나은아, 스터디 모임 나가?",
        "W: 이번 주까지만. 어제 말했어.",
        "M: 모임이 너무 늦게 끝나서야?",
        "W: 아홉 시에 끝나는데 나한테는 괜찮아.",
        "M: 그럼 회원들이랑 무슨 일 있었어?",
        "W: 다들 좋아. 한 시간 내내 이야기를 해.",
        "M: 공부 이야기야, 다른 이야기야?",
        "W: 거의 내내 다른 이야기야.",
        "M: 그럼 모임이 좋은 친구들이지 공부는 아니네.",
        "W: 이번 학기에는 일주일에 저녁 세 번을 버릴 수 없어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 수시 원서 설명회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Seoyun, are you going to the application briefing?"],
        ["W", "I want to, but I don't know the details."],
        ["M", "It's on the ninth, in the seventh period."],
        ["W", "Is that for the whole year group?"],
        ["M", "All of us, in the main hall, sitting by class."],
        ["W", "How long does it last?"],
        ["M", "Fifty minutes, with fifteen for questions at the end."],
        ["W", "Do we need to bring anything with us?"],
        ["M", "Your list of universities, if you have written one."],
        ["W", "Is there anything given out on the day?"],
        ["M", "A booklet with the dates for every stage."],
      ],
      choices: ["설명회 날짜와 교시", "설명회가 열리는 곳", "진행 시간", "가져가야 할 것", "설명하는 사람"],
      answer: 5,
      clue: "It's on the ninth, in the seventh period.",
      explanation:
        "날짜와 교시, 장소, 시간, 준비물은 말했지만 설명하는 사람은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 서윤아, 원서 설명회 갈 거야?",
        "W: 가고 싶은데 자세한 걸 몰라.",
        "M: 9일 7교시에 해.",
        "W: 학년 전체가 하는 거야?",
        "M: 우리 다. 대강당에서 반별로 앉아.",
        "W: 얼마나 걸려?",
        "M: 50분. 마지막 15분은 질문 시간이야.",
        "W: 뭘 가져가야 해?",
        "M: 써 둔 게 있으면 지망 대학 목록.",
        "W: 그날 나눠 주는 건 있어?",
        "M: 단계마다 날짜가 적힌 책자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Seorim Student Dormitory에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Seorim Student Dormitory, which opened in March. " +
            "The building stands ten minutes on foot from the university's east gate. " +
            "Each room is shared by two students and has its own bathroom. " +
            "The kitchen on every floor is open at all hours. " +
            "Breakfast and dinner are served in the ground floor dining hall on weekdays. " +
            "The main door locks at midnight, but residents may enter with a card at any time. " +
            "Guests must be signed in at the desk and may not stay overnight. " +
            "Rooms are allocated in February, and applications close at the end of January.",
        ],
      ],
      choices: [
        "대학 동문에서 걸어서 10분 거리이다",
        "한 방을 두 명이 쓴다",
        "평일에는 아침과 저녁이 제공된다",
        "자정 뒤에는 거주자도 들어갈 수 없다",
        "손님은 묵고 갈 수 없다",
      ],
      answer: 4,
      clue: "The main door locks at midnight, but residents may enter with a card at any time.",
      explanation:
        "자정 뒤에도 거주자는 카드로 들어갈 수 있다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 3월에 문을 연 서림 학생 기숙사에 대해 알려 드립니다. 건물은 대학 동문에서 걸어서 10분 거리에 있습니다. 방마다 학생 두 명이 함께 쓰고 욕실이 딸려 있습니다. 층마다 있는 부엌은 시간에 상관없이 열려 있습니다. 평일에는 1층 식당에서 아침과 저녁을 제공합니다. 정문은 자정에 잠기지만 거주자는 카드로 언제든 들어올 수 있습니다. 손님은 접수대에서 기록해야 하며 밤을 묵을 수는 없습니다. 방은 2월에 배정하고 신청은 1월 말에 마감합니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 신청할 자기소개서 첨삭을 고르시오.",
      lines: [
        ["M", "Chaeyeon, five feedback slots are still open this month."],
        ["W", "I need one before the twentieth, whatever else happens."],
        ["M", "Two of these are after the twentieth."],
        ["W", "Then they're out. How long is each session?"],
        ["M", "From twenty minutes up to an hour."],
        ["W", "Under thirty minutes is not enough for a whole statement."],
        ["M", "One of the three left is twenty-five minutes."],
        ["W", "And I'd like written comments afterwards, not only talk."],
        ["M", "One of the last two gives spoken feedback only."],
        ["W", "So there's just one slot for me."],
        ["M", "I'd book it before this evening."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "I need one before the twentieth, whatever else happens.",
      explanation:
        "20일 이전, 30분 이상, 서면 의견이 있는 것을 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Date: the 12th / Length: 25 min / Feedback: Written" },
          { no: 2, label: "②", value: "Date: the 15th / Length: 45 min / Feedback: Written" },
          { no: 3, label: "③", value: "Date: the 18th / Length: 60 min / Feedback: Spoken" },
          { no: 4, label: "④", value: "Date: the 22nd / Length: 45 min / Feedback: Written" },
          { no: 5, label: "⑤", value: "Date: the 25th / Length: 30 min / Feedback: Written" },
        ],
      },
      translation: [
        "M: 채연아, 이번 달에 첨삭 자리가 다섯 개 남아 있어.",
        "W: 무슨 일이 있어도 20일 전에는 받아야 해.",
        "M: 두 개는 20일 뒤야.",
        "W: 그럼 빠지네. 한 번에 몇 분이야?",
        "M: 20분부터 한 시간까지.",
        "W: 30분 아래로는 글 전체를 보기에 부족해.",
        "M: 남은 셋 중 하나는 25분이야.",
        "W: 그리고 말로만 말고 글로도 의견을 받고 싶어.",
        "M: 남은 둘 중 하나는 말로만 해 줘.",
        "W: 그럼 나한테 맞는 건 하나뿐이네.",
        "M: 오늘 저녁 전에 예약하는 게 좋겠어.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junseo, did you print your application draft?"],
        ["M", "Not yet. The printer queue is full of other files."],
        ["W", "The teacher wants it by four."],
        ["M", "There's another printer in the careers room."],
        ["W", "Shall I ask whether you can use it?"],
      ],
      choices: [
        "No, I already printed it.",
        "Yes, please, that would save me.",
        "I don't have a draft.",
        "The careers room is closed.",
        "You should print yours first.",
      ],
      answer: 2,
      clue: "Shall I ask whether you can use it?",
      explanation:
        "다른 인쇄기를 쓸 수 있는지 물어봐 줄지 제안했으므로, 그래 주면 좋겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준서야, 지원서 초고 인쇄했어?",
        "M: 아직. 인쇄 대기에 다른 파일이 가득해.",
        "W: 선생님이 네 시까지 달라고 하셨어.",
        "M: 진로실에 인쇄기가 하나 더 있어.",
        "W: 내가 써도 되는지 여쭤볼까?",
        "M: 응, 부탁해. 그러면 살겠다.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Dain, are you staying in the study room tonight?"],
        ["W", "Until about ten, if there's a seat."],
        ["M", "Could you keep the one beside you?"],
        ["W", "How late will you be?"],
        ["M", "Half an hour. I have a counselling session first."],
      ],
      choices: [
        "The room is already full.",
        "I'm going home now.",
        "You should sit elsewhere.",
        "Sure, I'll put my bag there.",
        "There is no session today.",
      ],
      answer: 4,
      clue: "Half an hour. I have a counselling session first.",
      explanation:
        "30분 늦는다며 자리를 맡아 달라고 했으므로, 가방을 놓아 두겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 다인아, 오늘 밤 자습실에 있어?",
        "W: 자리 있으면 열 시쯤까지.",
        "M: 네 옆자리 좀 맡아 줄래?",
        "W: 얼마나 늦어?",
        "M: 30분. 먼저 상담이 있어.",
        "W: 그래, 내 가방 놓아 둘게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Hayoon, how is the new revision timetable working out?"],
        ["W", "I keep falling behind by Wednesday and then giving up."],
        ["M", "What happens on Monday and Tuesday?"],
        ["W", "I do everything on the list, and usually a little extra."],
        ["M", "So the first two days are not the problem at all."],
        ["W", "They're the best two days I've had this term."],
        ["M", "And then Wednesday collapses."],
        ["W", "Every single week since the middle of September."],
        ["M", "How many hours did you plan for a Wednesday?"],
        ["W", "The same as every other day, five hours."],
        ["M", "Do you have anything else on a Wednesday?"],
        ["W", "Two hours of tutoring, now that you ask about it."],
        ["M", "Then plan three hours for Wednesday, not five."],
      ],
      choices: [
        "I have no timetable at all.",
        "That's obvious now, I'll change it.",
        "Five hours is not enough.",
        "I never study on Wednesday.",
        "You should make my timetable.",
      ],
      answer: 2,
      clue: "Then plan three hours for Wednesday, not five.",
      explanation:
        "수요일에는 세 시간으로 계획하라는 조언이므로, 고치겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 하윤아, 새 복습 시간표는 잘 굴러가?",
        "W: 수요일이면 밀려서 결국 포기하게 돼.",
        "M: 월요일이랑 화요일엔 어때?",
        "W: 목록에 있는 걸 다 하고 보통 조금 더 해.",
        "M: 그럼 앞 이틀은 문제가 아니네.",
        "W: 이번 학기에 제일 잘된 이틀이야.",
        "M: 그러다 수요일에 무너지고.",
        "W: 9월 중순부터 한 주도 안 빼고.",
        "M: 수요일에 몇 시간을 계획했는데?",
        "W: 다른 날이랑 똑같이 다섯 시간.",
        "M: 수요일에 다른 일정 있어?",
        "W: 말 나온 김에 보니 과외가 두 시간 있네.",
        "M: 그럼 수요일은 다섯 시간 말고 세 시간으로 잡아.",
        "W: 이제 보니 당연하네, 고칠게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, you've been cooking your own dinner on weekdays."],
        ["M", "Since August, when my parents' hours changed."],
        ["W", "Is that not a lot to manage in your final year?"],
        ["M", "Twenty-five minutes, and I stop thinking about school."],
        ["W", "So it works as a break as well."],
        ["M", "The best one I have, and I eat better than in August."],
        ["W", "What do you usually make?"],
        ["M", "Four dishes, in rotation, all of them simple."],
        ["W", "Four is enough for a whole week?"],
        ["M", "Nobody notices a repeat by Thursday."],
        ["W", "Could you write the four down for me?"],
      ],
      choices: [
        "Sure, I'll bring the list tomorrow.",
        "I don't cook at all.",
        "My parents cook every day.",
        "You can't use a kitchen.",
        "I stopped cooking in August.",
      ],
      answer: 1,
      clue: "Could you write the four down for me?",
      explanation:
        "여자가 네 가지를 적어 달라고 했으므로, 내일 목록을 가져오겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 태민아, 평일에 저녁을 직접 해 먹는다며.",
        "M: 8월부터. 부모님 근무 시간이 바뀌었거든.",
        "W: 고3인데 부담스럽지 않아?",
        "M: 25분이야. 그동안은 학교 생각을 안 하게 돼.",
        "W: 그럼 쉬는 시간도 되는 거네.",
        "M: 내가 가진 제일 좋은 휴식이야. 8월보다 잘 먹기도 하고.",
        "W: 보통 뭘 만들어?",
        "M: 네 가지를 돌려 가며 해. 다 간단한 거야.",
        "W: 네 가지로 한 주가 돼?",
        "M: 목요일쯤이면 아무도 되풀이인 걸 몰라.",
        "W: 그 네 가지 좀 적어 줄래?",
        "M: 그럼, 내일 목록 가져올게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Dohyun이 Naeun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Dohyun : ________________",
      lines: [
        [
          "M",
          "Dohyun and Naeun are putting together the third year class magazine. " +
            "Every student has written half a page about the last three years. " +
            "Naeun has arranged the pieces in alphabetical order by name. " +
            "Dohyun notices that the four longest pieces now sit together at the front. " +
            "A reader who opens the magazine meets eight dense pages before anything else. " +
            "There is still time to rearrange the order before it goes to print. " +
            "He wants to spread the long pieces out through the magazine. " +
            "In this situation, what would Dohyun most likely say to Naeun?",
        ],
      ],
      choices: [
        "Let's print fewer copies this year.",
        "We should cut the longest pieces.",
        "Spread the long pieces through the magazine.",
        "I'll write another piece myself.",
        "Alphabetical order is impossible.",
      ],
      answer: 3,
      clue: "He wants to spread the long pieces out through the magazine.",
      explanation:
        "긴 글이 앞에 몰려 있으므로 잡지 전체에 흩어 놓자는 ③이 가장 적절하다.",
      translation: [
        "M: 도현이와 나은이는 3학년 학급 문집을 만들고 있습니다. 학생마다 지난 3년에 대해 반 쪽씩 썼습니다. 나은이는 글을 이름 가나다순으로 배열했습니다. 도현이는 가장 긴 글 네 편이 앞쪽에 몰려 있는 것을 알아챕니다. 문집을 펼친 사람은 다른 것보다 먼저 빽빽한 여덟 쪽을 만나게 됩니다. 인쇄에 들어가기 전에 순서를 바꿀 시간은 아직 있습니다. 도현이는 긴 글을 문집 전체에 흩어 놓고 싶습니다. 이런 상황에서 도현이가 나은이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to explain why the second half of a journey " +
            "always feels shorter than the first, even when it takes the same time. " +
            "On the way out, everything your eye lands on is new, " +
            "and the brain stores a great many separate impressions. " +
            "When you look back, you judge how long something took " +
            "by how much of it you can remember, " +
            "and a crowded memory reads as a long stretch of time. " +
            "On the way home the same street produces almost nothing new to store. " +
            "The clock is unchanged. The record is thinner, so the journey shrinks. " +
            "The same rule explains why a summer of new things feels enormous in memory " +
            "and a month of routine disappears entirely.",
        ],
      ],
      choices: [
        "how the brain measures distance",
        "why a return journey feels shorter",
        "how memory is stored during sleep",
        "why routines are hard to break",
        "how travel changes the way we think",
      ],
      answer: 2,
      clue: "The clock is unchanged. The record is thinner, so the journey shrinks.",
      explanation:
        "여자는 돌아오는 길에는 새로 저장될 것이 적어 시간이 짧게 느껴진다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 같은 시간이 걸리는데도 여정의 뒷부분이 왜 늘 짧게 느껴지는지 설명하려 합니다. 갈 때는 눈에 닿는 모든 것이 새롭고, 뇌는 아주 많은 인상을 따로따로 저장합니다. 돌아보며 시간이 얼마나 걸렸는지 판단할 때 우리는 얼마나 많이 기억하는지로 잽니다. 빽빽한 기억은 긴 시간으로 읽힙니다. 돌아오는 길에는 같은 거리가 새로 저장할 것을 거의 만들지 않습니다. 시계는 그대로입니다. 기록이 얇아졌기에 여정이 줄어드는 것입니다. 같은 규칙이 새로운 일로 가득한 여름이 기억 속에서 거대해 보이고, 똑같이 흘러간 한 달이 통째로 사라지는 까닭도 설명해 줍니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to explain why the second half of a journey feels shorter."],
        ["W", "On the way out, everything your eye lands on is new."],
        ["W", "You judge how long something took by how much of it you can remember."],
        ["W", "On the way home the same street produces almost nothing new to store."],
        ["W", "A summer of new things feels enormous in memory."],
      ],
      choices: [
        "everything being new on the way out",
        "judging time by how much you remember",
        "the same street producing nothing new",
        "a summer of new things feeling enormous",
        "the average speed of a city bus",
      ],
      answer: 5,
      clue: "On the way out, everything your eye lands on is new.",
      explanation:
        "갈 때 모든 것이 새롭다는 것, 기억의 양으로 시간을 재는 것, 새로울 것이 없는 같은 거리, 거대해 보이는 여름은 언급되지만 시내버스의 평균 속도는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
