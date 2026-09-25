/** 고3 듣기 28회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 28회",
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
          "Good evening, third-year families. This is Ms. Chu from the school office. " +
            "I am writing about the exam-day transport we arrange every November. " +
            "For the past six years we have run two buses to the test centre, " +
            "leaving the front gate at half past six. " +
            "Last year eleven students who had booked a seat came by car instead, " +
            "and both buses left half empty while three students who asked late were turned away. " +
            "So this year we will confirm seats by message on the Monday before the exam. " +
            "If you do not reply by Tuesday evening, your seat goes to the waiting list. " +
            "Nothing else changes, and the buses still leave at half past six. Thank you.",
        ],
      ],
      choices: [
        "시험일 버스 좌석을 문자로 확정한다고 알리려고",
        "시험장 위치 변경을 알리려고",
        "버스 출발 시각 변경을 알리려고",
        "시험 준비물을 안내하려고",
        "학부모 설명회를 알리려고",
      ],
      answer: 1,
      clue: "So this year we will confirm seats by message on the Monday before the exam.",
      explanation:
        "여자는 예약해 놓고 오지 않는 일 때문에 올해는 시험 전 월요일에 문자로 좌석을 확정한다고 알린다. 따라서 답은 ①이다.",
      translation: [
        "W: 3학년 학부모님 여러분, 안녕하세요. 학교 행정실 추입니다. 해마다 11월에 마련하는 시험일 차편에 대해 알려 드립니다. 지난 6년 동안 고사장까지 버스 두 대를 운행했고, 정문에서 6시 30분에 출발했습니다. 작년에는 자리를 예약한 학생 열한 명이 승용차로 오는 바람에 버스 두 대가 절반씩 비어 갔고, 늦게 부탁한 학생 세 명은 타지 못했습니다. 그래서 올해는 시험 전 월요일에 문자로 좌석을 확정하겠습니다. 화요일 저녁까지 답하지 않으시면 그 자리는 대기자에게 넘어갑니다. 그 밖에 달라지는 것은 없고, 버스는 여전히 6시 30분에 출발합니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Jinwoo, I've been doing a full mock exam every single day."],
        ["M", "Every day? When do you go over the ones you got wrong?"],
        ["W", "In the evening, but usually there isn't time."],
        ["M", "So the papers pile up unreviewed."],
        ["W", "Eleven of them, on the corner of my desk."],
        ["M", "A mock exam tells you where you are. It doesn't move you."],
        ["W", "But the practice must be worth something."],
        ["M", "You're practising sitting an exam, which you already know how to do."],
        ["W", "And not practising the things I get wrong."],
        ["M", "Right. Do two a week and spend the other days on the eleven papers."],
        ["W", "That feels like doing less."],
        ["M", "It is less. Less measuring, more changing."],
      ],
      choices: [
        "모의고사는 매일 봐야 한다",
        "시험은 시간을 재고 봐야 한다",
        "오답 노트를 만들어야 한다",
        "모의고사 횟수를 줄이고 오답을 다뤄야 한다",
        "실전 감각이 가장 중요하다",
      ],
      answer: 4,
      clue: "Right. Do two a week and spend the other days on the eleven papers.",
      explanation:
        "남자는 모의고사가 위치를 알려 줄 뿐 실력을 옮기지는 않는다며, 횟수를 줄이고 틀린 문제를 다루라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "W: 진우야, 나 매일 모의고사를 한 세트씩 풀고 있어.",
        "M: 매일? 틀린 건 언제 봐?",
        "W: 저녁에. 그런데 보통 시간이 없어.",
        "M: 그럼 시험지가 안 본 채로 쌓이겠네.",
        "W: 열한 장. 책상 구석에.",
        "M: 모의고사는 네가 어디 있는지 알려 줄 뿐이야. 옮겨 주지는 않아.",
        "W: 그래도 연습이 되긴 하잖아.",
        "M: 시험 보는 연습을 하는 거지. 그건 이미 할 줄 알잖아.",
        "W: 그리고 틀리는 것들은 연습하지 않는 거고.",
        "M: 그래. 일주일에 두 번만 보고, 나머지 날은 그 열한 장에 써.",
        "W: 덜 하는 것 같은데.",
        "M: 덜 하는 거 맞아. 재는 건 덜 하고 바꾸는 걸 더 하는 거지.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We usually explain a person's behaviour by what kind of person they are, " +
            "and explain our own by the situation we were in. " +
            "Someone else was late because they are careless. " +
            "We were late because the train stopped. " +
            "Both explanations feel obvious from where we are standing, " +
            "and only one of them has access to the situation. " +
            "This matters more than it sounds, " +
            "because if you believe a problem is a person, you replace the person. " +
            "If you believe it is a situation, you change the situation, " +
            "and the next person does better. " +
            "Before you decide someone is careless, " +
            "ask what their morning looked like, " +
            "and whether anyone in that morning would have been on time.",
        ],
      ],
      choices: [
        "지각은 변명할 수 없다",
        "사람 탓을 하기 전에 상황을 살펴야 한다",
        "성격은 쉽게 바뀌지 않는다",
        "남을 이해하려 노력해야 한다",
        "문제는 빨리 해결해야 한다",
      ],
      answer: 2,
      clue: "Before you decide someone is careless, ask what their morning looked like.",
      explanation:
        "여자는 문제를 사람으로 보면 사람을 바꾸고 상황으로 보면 상황을 바꾼다며, 사람 탓 전에 상황을 물으라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 우리는 보통 남의 행동은 그 사람이 어떤 사람인가로 설명하고, 자기 행동은 자기가 처했던 상황으로 설명합니다. 다른 사람이 늦은 것은 그 사람이 덜렁대서입니다. 내가 늦은 것은 전철이 멈춰서입니다. 두 설명 모두 우리가 선 자리에서는 당연해 보이고, 그중 하나만 상황을 알고 있습니다. 이것은 들리는 것보다 중요합니다. 문제가 사람이라고 믿으면 사람을 바꾸게 되기 때문입니다. 상황이라고 믿으면 상황을 바꾸고, 다음 사람은 더 잘하게 됩니다. 누군가를 덜렁댄다고 판단하기 전에, 그 사람의 아침이 어땠는지, 그런 아침에 제시간에 올 수 있었을 사람이 있었을지 물어보세요.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Seonhwa, is this the corner you turned into a study booth?"],
        ["W", "Yes, I put it together over the holiday."],
        ["M", "There's a desk lamp clamped to the edge of the desk."],
        ["W", "A clamp saves the whole surface for books."],
        ["M", "And a corkboard hangs on the wall beside it."],
        ["W", "I pin the month's deadlines on it."],
        ["M", "I count three drawers in the unit under the desk."],
        ["W", "There are four. The bottom one is behind the chair."],
        ["M", "The cushion on the chair looks new."],
        ["W", "My mother made it from an old curtain."],
        ["M", "And a wastebasket sits at the left of the desk."],
        ["W", "It fills up twice a week with draft paper."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. The bottom one is behind the chair.",
      explanation:
        "남자가 서랍이 세 칸이라고 하자 여자가 네 칸이라고 바로잡는다. 그림에는 세 칸이 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A study booth corner drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A DESK LAMP is clamped to the edge of a desk. " +
          "A CORKBOARD with a few blank pinned notes hangs on the wall beside the desk. " +
          "A DRAWER UNIT under the desk has EXACTLY THREE DRAWERS, the three drawer fronts clearly separated and easy to count, and NO fourth drawer. " +
          "A CUSHION lies on the seat of the chair. " +
          "A WASTEBASKET stands on the floor at the left of the desk.",
      },
      translation: [
        "M: 선화야, 이게 공부 자리로 만든 구석이야?",
        "W: 응, 연휴 동안 짜 맞췄어.",
        "M: 책상 가장자리에 집게 스탠드가 물려 있네.",
        "W: 집게로 달면 책상 바닥을 다 쓸 수 있어.",
        "M: 그리고 그 옆 벽에 코르크판이 걸려 있어.",
        "W: 그 달의 마감을 거기 꽂아 둬.",
        "M: 책상 밑 수납장에 서랍이 세 칸 보여.",
        "W: 네 칸이야. 맨 아래는 의자 뒤에 있어.",
        "M: 의자에 놓인 방석은 새것 같네.",
        "W: 엄마가 오래된 커튼으로 만들어 주셨어.",
        "M: 그리고 책상 왼쪽에 휴지통이 있어.",
        "W: 일주일에 두 번은 초고 종이로 가득 차.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Jinwoo, the alumni panel starts at three in the seminar room."],
        ["M", "I know. Did all four panelists confirm?"],
        ["W", "All four. The last one replied at lunchtime."],
        ["M", "Good. And the question cards from the students?"],
        ["W", "Collected and sorted. Forty of them, by topic."],
        ["M", "Then what's still open?"],
        ["W", "The seminar room has no water for the panelists."],
        ["M", "Is there any in the staff kitchen?"],
        ["W", "A case of bottles, but it needs carrying up two floors."],
        ["M", "How many bottles do we need?"],
        ["W", "Eight, with the spares. I'd go, but I'm meeting them at the gate."],
        ["M", "Then I'll bring the eight bottles up."],
      ],
      choices: [
        "패널에게 연락하기",
        "질문 카드 분류하기",
        "물 가져오기",
        "패널 맞이하기",
        "세미나실 청소하기",
      ],
      answer: 3,
      clue: "Then I'll bring the eight bottles up.",
      explanation:
        "패널 확인과 질문 카드는 끝났고 여자는 정문에서 패널을 맞아야 하므로, 남자가 물 여덟 병을 가져오기로 한다. 따라서 답은 ③이다.",
      translation: [
        "W: 진우야, 동문 좌담회가 3시에 세미나실에서 시작해.",
        "M: 알아. 패널 네 분 다 확답 왔어?",
        "W: 네 분 다. 마지막 분이 점심때 답 주셨어.",
        "M: 좋아. 학생들 질문 카드는?",
        "W: 걷어서 주제별로 나눴어. 마흔 장.",
        "M: 그럼 아직 남은 게 뭐야?",
        "W: 세미나실에 패널분들 드릴 물이 없어.",
        "M: 교직원 탕비실에 있어?",
        "W: 병으로 한 상자. 그런데 두 층을 들고 올라와야 해.",
        "M: 몇 병 필요한데?",
        "W: 여분까지 여덟 병. 내가 가고 싶은데, 정문에서 맞아야 해.",
        "M: 그럼 내가 여덟 병 들고 올라갈게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Rowan Print Works. What can I do for you?"],
        ["W", "Ten copies of my portfolio, thirty pages each."],
        ["M", "Printing is forty cents a page, so twelve dollars a copy."],
        ["W", "So one hundred and twenty for the ten."],
        ["M", "That's right. Would you like a clear cover on each one?"],
        ["W", "How much are the covers?"],
        ["M", "Two dollars each, so twenty more."],
        ["W", "I'll take the covers. They get handled a lot."],
        ["M", "One hundred and forty, then. Are you a student?"],
        ["W", "I am, here's my card."],
        ["M", "Then I can take ten percent off the printing, but not the covers."],
        ["W", "Thank you. I'll pay now."],
      ],
      choices: ["$128.00", "$108.00", "$126.00", "$140.00", "$154.00"],
      answer: 1,
      clue: "Then I can take ten percent off the printing, but not the covers.",
      explanation:
        "인쇄비 120달러에서 10퍼센트를 빼면 108달러이고, 할인이 안 되는 표지 20달러를 더하면 128달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 로완 인쇄소입니다. 무엇을 도와드릴까요?",
        "W: 제 포트폴리오 열 부, 한 부에 서른 쪽이요.",
        "M: 인쇄는 한 쪽에 40센트라서 한 부에 12달러입니다.",
        "W: 그럼 열 부에 120달러네요.",
        "M: 맞습니다. 한 부씩 투명 표지도 하시겠어요?",
        "W: 표지는 얼마예요?",
        "M: 하나에 2달러라서 20달러가 더 붙습니다.",
        "W: 표지도 할게요. 손을 많이 타서요.",
        "M: 그럼 140달러입니다. 학생이세요?",
        "W: 네, 여기 학생증이요.",
        "M: 그럼 인쇄비에서 10퍼센트를 빼 드립니다. 표지는 안 돼요.",
        "W: 감사합니다. 지금 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 학생회 일을 그만두는 이유를 고르시오.",
      lines: [
        ["W", "Jinwoo, you're stepping down from the student council?"],
        ["M", "At the end of this month, yes."],
        ["W", "Is it because of your grades?"],
        ["M", "They've actually been steady since September."],
        ["W", "Then did something happen with the other members?"],
        ["M", "Nothing at all. I'll miss them."],
        ["W", "So what is it?"],
        ["M", "My father starts treatment next month and I'll be at home more."],
        ["W", "Oh, I'm sorry to hear that."],
        ["M", "It's manageable, but somebody has to be there in the afternoons."],
      ],
      choices: [
        "성적이 떨어져서",
        "회원들과 다퉈서",
        "전학을 가게 되어서",
        "집안일을 도와야 해서",
        "다른 동아리를 맡아서",
      ],
      answer: 4,
      clue: "My father starts treatment next month and I'll be at home more.",
      explanation:
        "성적도 회원 관계도 문제가 아니고, 아버지 치료 때문에 오후에 집에 있어야 하기 때문이다. 따라서 답은 ④이다.",
      translation: [
        "W: 진우야, 학생회에서 물러난다며.",
        "M: 이달 말에, 응.",
        "W: 성적 때문이야?",
        "M: 사실 9월부터는 꾸준해.",
        "W: 그럼 다른 부원들이랑 무슨 일 있었어?",
        "M: 전혀. 오히려 보고 싶을 거야.",
        "W: 그럼 뭔데?",
        "M: 아버지가 다음 달부터 치료를 시작하셔서 집에 더 있어야 해.",
        "W: 아, 마음이 안 좋다.",
        "M: 감당할 만해. 그래도 오후에는 누군가 있어야 해서.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Winter Debate Camp에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Jinwoo, are you applying to the Winter Debate Camp?"],
        ["M", "I looked at the page. When does it run?"],
        ["W", "Four days, the fifth to the eighth of January."],
        ["M", "Four days straight. Where is it held?"],
        ["W", "At the training centre on the university's east campus."],
        ["M", "That's a long ride. Do they arrange accommodation?"],
        ["W", "Everyone stays in the centre's dormitory for the three nights."],
        ["M", "That helps. What do they actually do there?"],
        ["W", "Two days on argument structure, then two days of practice rounds."],
        ["M", "And the cost?"],
        ["W", "A hundred thousand won, including all meals."],
        ["M", "Then let's apply before the deadline."],
      ],
      choices: ["운영 기간", "선발 방법", "장소", "숙박", "일정 내용"],
      answer: 2,
      clue: "선발 방법은 대화에서 언급되지 않았다.",
      explanation:
        "기간(1월 5일부터 8일까지), 장소(대학 동쪽 캠퍼스 연수원), 숙박(연수원 기숙사), 일정 내용(논증 구조와 실전 라운드)은 언급되지만 선발 방법은 언급되지 않았다. 따라서 답은 ②이다.",
      translation: [
        "W: 진우야, 겨울 토론 캠프 지원할 거야?",
        "M: 페이지는 봤어. 언제 해?",
        "W: 나흘, 1월 5일부터 8일까지.",
        "M: 나흘 연달아서. 어디서 해?",
        "W: 대학 동쪽 캠퍼스 연수원에서.",
        "M: 꽤 멀다. 숙박은 마련해 줘?",
        "W: 사흘 밤 다 연수원 기숙사에서 자.",
        "M: 다행이네. 거기서 뭘 하는데?",
        "W: 이틀은 논증 구조, 이틀은 실전 라운드.",
        "M: 비용은?",
        "W: 10만 원. 식사 전부 포함이야.",
        "M: 그럼 마감 전에 지원하자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Hillview Observatory Trail에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Let me tell you about the Hillview Observatory Trail. " +
            "The trail runs three kilometers from the car park to the observatory on the ridge. " +
            "It climbs about two hundred meters, all of it on a stepped path. " +
            "The gate is open from six in the morning until ten at night, all year. " +
            "There is no lighting on the path, so a torch is needed after dark. " +
            "Two rest points along the way each have a bench but no water. " +
            "The observatory itself is free to enter on Friday and Saturday evenings.",
        ],
      ],
      choices: [
        "주차장에서 3킬로미터이다",
        "계단 길로 200미터를 오른다",
        "일 년 내내 아침 6시부터 연다",
        "쉼터 두 곳에 벤치가 있다",
        "길에 조명이 설치되어 있다",
      ],
      answer: 5,
      clue: "There is no lighting on the path, so a torch is needed after dark.",
      explanation:
        "길에 조명이 없어 어두워지면 손전등이 필요하다고 했으므로 ⑤는 내용과 다르다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 힐뷰 천문대 산책로를 소개해 드리겠습니다. 이 길은 주차장에서 능선 위 천문대까지 3킬로미터 이어집니다. 200미터쯤 오르는데, 전부 계단 길입니다. 문은 일 년 내내 아침 6시부터 밤 10시까지 엽니다. 길에는 조명이 없어서 어두워지면 손전등이 필요합니다. 중간의 쉼터 두 곳에는 벤치가 있지만 물은 없습니다. 천문대 자체는 금요일과 토요일 저녁에 무료로 들어갈 수 있습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 첨삭 프로그램을 고르시오.",
      lines: [
        ["W", "Jinwoo, let's sign up for an essay feedback programme."],
        ["M", "Five listed. Written comments or a face-to-face session?"],
        ["W", "Face-to-face. I never understand written comments alone."],
        ["M", "Agreed. Should it cover more than one draft?"],
        ["W", "Yes. One round of feedback never changes anything."],
        ["M", "Right. And the fee? I have seventy thousand won."],
        ["W", "Same, so seventy thousand is the ceiling."],
        ["M", "Then only one programme clears all three."],
        ["W", "Applications close on the tenth."],
        ["M", "Let's register tonight, then."],
        ["W", "I'll send the link after dinner."],
        ["M", "I'll book the earliest slot they have."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Face-to-face. I never understand written comments alone.",
      explanation:
        "대면이고, 두 번 이상 첨삭해 주며, 7만 원 이하인 것을 고른다. 세 조건을 모두 채우는 것은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Format: Written / Drafts covered: 2 / Fee: 40,000 won" },
          { no: 2, label: "②", value: "Format: Face-to-face / Drafts covered: 1 / Fee: 45,000 won" },
          { no: 3, label: "③", value: "Format: Face-to-face / Drafts covered: 2 / Fee: 65,000 won" },
          { no: 4, label: "④", value: "Format: Face-to-face / Drafts covered: 3 / Fee: 95,000 won" },
          { no: 5, label: "⑤", value: "Format: Written / Drafts covered: 3 / Fee: 55,000 won" },
        ],
      },
      translation: [
        "W: 진우야, 글 첨삭 프로그램 신청하자.",
        "M: 다섯 개 있네. 서면 의견이야, 대면 상담이야?",
        "W: 대면. 서면 의견만으로는 무슨 말인지 모르겠어.",
        "M: 동의해. 초고를 두 번 이상 봐 줘야 할까?",
        "W: 응. 한 번 첨삭으로는 아무것도 안 바뀌어.",
        "M: 맞아. 비용은? 나는 7만 원 있어.",
        "W: 나도. 그럼 7만 원이 한계네.",
        "M: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "W: 신청은 10일에 닫혀.",
        "M: 그럼 오늘 밤에 등록하자.",
        "W: 저녁 먹고 링크 보낼게.",
        "M: 나는 제일 이른 시간으로 잡을게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Seonhwa, is the library open during the exam week?"],
        ["W", "It is, but the third floor is closed for repairs."],
        ["M", "That's where the quiet desks are."],
        ["W", "Use the reading room on two. It's just as quiet after four."],
      ],
      choices: [
        "I'll use the reading room, then.",
        "The library is closed all week.",
        "I don't study in libraries.",
        "The third floor is open.",
        "I'll come before four.",
      ],
      answer: 1,
      clue: "Use the reading room on two. It's just as quiet after four.",
      explanation:
        "여자가 2층 열람실을 쓰라고 했으므로, 그 열람실을 쓰겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 선화야, 시험 주간에 도서관 열어?",
        "W: 열어. 그런데 3층은 수리 때문에 닫아.",
        "M: 조용한 자리가 거기 있는데.",
        "W: 2층 열람실 써. 4시 넘으면 거기도 똑같이 조용해.",
        "M: 그럼 열람실 쓸게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Jinwoo, my recommendation request hasn't reached the teacher."],
        ["M", "Did you send it through the portal or by email?"],
        ["W", "The portal. It's been sitting there for a week."],
        ["M", "The portal only sends on Fridays. Email her directly today."],
      ],
      choices: [
        "My request already arrived.",
        "There is no portal.",
        "I'll wait another week.",
        "I'll email her today.",
        "The portal sends every day.",
      ],
      answer: 4,
      clue: "The portal only sends on Fridays. Email her directly today.",
      explanation:
        "남자가 오늘 직접 메일을 보내라고 했으므로, 오늘 메일을 보내겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 진우야, 내 추천서 요청이 선생님께 안 갔어.",
        "M: 포털로 보냈어, 메일로 보냈어?",
        "W: 포털로. 일주일째 거기 그대로야.",
        "M: 포털은 금요일에만 보내. 오늘 직접 메일 보내.",
        "W: 오늘 메일 보낼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Jinwoo, you've been rereading the same unit for two weeks."],
        ["M", "It hasn't gone in yet."],
        ["W", "How do you know when something has gone in?"],
        ["M", "When the page feels familiar, I suppose."],
        ["W", "Familiar is what rereading produces. It isn't the same as known."],
        ["M", "Then how would I tell the difference?"],
        ["W", "Shut the book and write the argument in your own words."],
        ["M", "That would go badly the first time."],
        ["W", "It would, and that's the information you've been missing."],
        ["M", "So the discomfort is the measurement."],
        ["W", "Do that tonight instead of a fifth reading."],
      ],
      choices: [
        "I'll read the unit once more.",
        "I'll write it out from memory tonight.",
        "The page already feels known.",
        "I've never reread anything.",
        "I'd rather skip the unit.",
      ],
      answer: 2,
      clue: "Do that tonight instead of a fifth reading.",
      explanation:
        "여자가 다섯 번째로 읽는 대신 책을 덮고 써 보라고 했으므로, 오늘 밤 기억으로 써 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 진우야, 2주째 같은 단원을 다시 읽고 있네.",
        "M: 아직 안 들어와서.",
        "W: 뭔가 들어왔다는 건 어떻게 알아?",
        "M: 쪽이 익숙해지면?",
        "W: 익숙함은 다시 읽기가 만들어 내는 거야. 아는 것과는 달라.",
        "M: 그럼 어떻게 구분해?",
        "W: 책을 덮고 그 논지를 네 말로 써 봐.",
        "M: 처음엔 엉망일 텐데.",
        "W: 그렇겠지. 그리고 그게 네가 놓치고 있던 정보야.",
        "M: 그럼 그 불편함이 측정인 거네.",
        "W: 다섯 번째로 읽는 대신 오늘 밤에 그걸 해.",
        "M: 오늘 밤에 기억으로 써 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seonhwa, you've been leaving the group chat on all night."],
        ["W", "Someone might need me. It feels rude to mute it."],
        ["M", "How many messages arrive after midnight?"],
        ["W", "Forty or fifty. Almost none of them are for me."],
        ["M", "And how does each one land while you're asleep?"],
        ["W", "The screen lights up. I wake and check."],
        ["M", "So fifty strangers get to decide when you wake."],
        ["W", "I hadn't put it in those words."],
        ["M", "Muting isn't rudeness. It's choosing when you read."],
        ["W", "But what if something urgent happens?"],
        ["M", "Mute the group and let calls through. Urgent things get called in."],
      ],
      choices: [
        "I'll keep it on all night.",
        "Nobody ever messages me.",
        "I never wake up at night.",
        "I'll leave the group entirely.",
        "I'll mute the group and allow calls.",
      ],
      answer: 5,
      clue: "Mute the group and let calls through. Urgent things get called in.",
      explanation:
        "남자가 단체방은 무음으로 하고 전화만 열어 두라고 했으므로, 그렇게 하겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 선화야, 너 밤새 단체방 알림을 켜 두더라.",
        "W: 누가 나를 찾을 수도 있잖아. 무음으로 하는 게 무례한 것 같아.",
        "M: 자정 넘어서 메시지가 몇 개나 와?",
        "W: 마흔에서 쉰 개. 그중 나한테 오는 건 거의 없어.",
        "M: 자는 동안 그게 하나씩 어떻게 도착해?",
        "W: 화면이 켜져. 깨서 확인하고.",
        "M: 그럼 남 쉰 명이 네가 언제 깰지 정하는 거네.",
        "W: 그렇게 말로 옮겨 본 적은 없어.",
        "M: 무음은 무례가 아니야. 언제 읽을지 네가 고르는 거지.",
        "W: 그런데 급한 일이 생기면?",
        "M: 단체방은 무음으로 하고 전화는 오게 둬. 급한 건 전화로 와.",
        "W: 단체방 무음으로 하고 전화만 열어 둘게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Soyul이 Gunwoo에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Soyul : ________________",
      lines: [
        [
          "W",
          "Soyul and Gunwoo are preparing the year group's farewell letter to their homeroom teacher. " +
            "Gunwoo has collected a handwritten line from every one of the thirty-two students " +
            "and pasted them onto one large sheet, which took him three evenings. " +
            "On Thursday Soyul looks at the sheet in daylight " +
            "and sees that eleven of the lines were written in pencil " +
            "and have already smudged where the sheet was handled. " +
            "The letter will be framed and kept, and pencil will keep fading. " +
            "There is a pen on every desk, and the eleven students are all in the building today. " +
            "She does not want the whole sheet remade, only those eleven lines rewritten in pen. " +
            "She wants to tell him to ask those eleven to go over their lines in pen. " +
            "In this situation, what would Soyul most likely say to Gunwoo?",
        ],
      ],
      choices: [
        "We should start the whole letter again.",
        "Let's leave the pencil lines as they are.",
        "Let's ask those eleven to go over their lines in pen.",
        "We should give the letter next year instead.",
        "Let's remove the pencil lines from the sheet.",
      ],
      answer: 3,
      clue: "She wants to tell him to ask those eleven to go over their lines in pen.",
      explanation:
        "소율이는 연필로 쓴 열한 명에게 펜으로 덧써 달라고 하자고 말하려 하므로 ③이 가장 적절하다.",
      translation: [
        "W: 소율이와 건우는 담임 선생님께 드릴 학년 전체의 작별 편지를 준비하고 있습니다. 건우는 서른두 명 모두에게서 손으로 쓴 한 줄씩을 받아 큰 종이 한 장에 붙였고, 저녁 사흘이 걸렸습니다. 목요일에 소율이는 햇빛 아래에서 그 종이를 보다가, 그중 열한 줄이 연필로 쓰였고 종이를 만질 때마다 이미 번지고 있다는 것을 봅니다. 이 편지는 액자에 넣어 보관할 것이고, 연필은 계속 흐려집니다. 책상마다 펜이 있고, 그 열한 명은 오늘 다 학교에 있습니다. 소율이는 종이를 통째로 다시 만들기를 바라지 않고, 그 열한 줄만 펜으로 다시 쓰기를 바랍니다. 소율이는 그 열한 명에게 자기 줄을 펜으로 덧써 달라고 하자고 말하고 싶습니다. 이런 상황에서 소율이가 건우에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why a paper cut hurts " +
            "more than a much deeper wound. " +
            "It seems unfair, and the reason lies in where and how the cut is made. " +
            "Fingertips carry far more nerve endings per square centimeter than almost anywhere else, " +
            "because that is where we gather information about the world. " +
            "A paper edge is also microscopically ragged, " +
            "so it tears rather than slices, leaving many irritated nerve endings rather than a clean line. " +
            "And because the cut is shallow, it bleeds very little, " +
            "so no clot forms to cover the exposed nerves. " +
            "The wound stays open to the air and to everything you touch, " +
            "reporting the same injury over and over for a day.",
        ],
      ],
      choices: [
        "why a shallow paper cut hurts so much",
        "how the skin heals a deep wound",
        "why fingertips are useful for reading braille",
        "how blood forms a clot over a cut",
        "why paper is made with rough edges",
      ],
      answer: 1,
      clue: "The wound stays open to the air and to everything you touch, reporting the same injury over and over for a day.",
      explanation:
        "여자는 손끝의 신경 밀도, 찢기는 상처, 피가 나지 않아 덮이지 않는 점 때문에 종이에 벤 상처가 아프다고 설명한다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 종이에 벤 상처가 왜 훨씬 깊은 상처보다 아픈지 이야기하려 합니다. 불공평해 보이는데, 이유는 그 상처가 어디에, 어떻게 났는지에 있습니다. 손끝은 1제곱센티미터에 다른 어느 곳보다도 훨씬 많은 신경 끝을 갖고 있습니다. 우리가 세상에 대한 정보를 모으는 곳이기 때문입니다. 종이의 가장자리는 아주 작게 보면 들쭉날쭉해서, 깨끗이 베는 것이 아니라 찢습니다. 그래서 반듯한 선 대신 성난 신경 끝이 잔뜩 남습니다. 게다가 상처가 얕아서 피가 거의 나지 않고, 그래서 드러난 신경을 덮어 줄 딱지가 생기지 않습니다. 그 상처는 공기와 여러분이 만지는 모든 것에 열린 채로 남아, 하루 동안 같은 부상을 되풀이해 보고합니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Hello, everyone. Today I want to talk about why a paper cut hurts more than a much deeper wound."],
        ["W", "Fingertips carry far more nerve endings per square centimeter than almost anywhere else."],
        ["W", "A paper edge is also microscopically ragged, so it tears rather than slices."],
        ["W", "And because the cut is shallow, it bleeds very little, so no clot forms to cover the exposed nerves."],
        ["W", "The wound stays open to the air and to everything you touch."],
        ["W", "reporting the same injury over and over for a day."],
      ],
      choices: [
        "fingertips having many nerve endings",
        "a paper edge tearing rather than slicing",
        "a shallow cut bleeding very little",
        "cold water easing the pain",
        "the wound staying open to the air",
      ],
      answer: 4,
      clue: "Fingertips carry far more nerve endings per square centimeter than almost anywhere else.",
      explanation:
        "손끝에 신경 끝이 많다는 것, 종이 가장자리가 찢는다는 것, 얕은 상처는 피가 거의 안 난다는 것, 상처가 공기에 열린 채 남는다는 것은 언급되지만 찬물이 통증을 덜어 준다는 것은 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
