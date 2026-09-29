/** 고3 듣기 36회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 36회",
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
          "Good afternoon, students. This is the librarian speaking. " +
            "I want to tell you about the past paper collection on the second floor. " +
            "Until last term the papers were kept in a single box, " +
            "and by October the box was empty and nobody knew where anything was. " +
            "From this week the papers are in labelled folders, one for each subject and year, " +
            "and they may be read in the library but not taken out. " +
            "There is a copier beside the desk if you need a page of your own. " +
            "Ten copies cost five hundred won, which goes back into the collection. " +
            "Please put each folder back in its own slot. Thank you.",
        ],
      ],
      choices: [
        "기출 문제 자료 이용 방법을 안내하려고",
        "도서관 이전을 알리려고",
        "복사기 고장을 알리려고",
        "도서 반납을 독촉하려고",
        "자료 기증을 부탁하려고",
      ],
      answer: 1,
      clue: "From this week the papers are in labelled folders, one for each subject and year.",
      explanation:
        "여자는 기출 문제 자료를 어떻게 보관하고 쓰는지 안내한다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 사서 선생님입니다. 2층 기출 문제 자료에 대해 말씀드립니다. 지난 학기까지는 시험지를 상자 하나에 담아 두었는데, 10월이면 상자가 비고 무엇이 어디 있는지 아무도 몰랐습니다. 이번 주부터는 과목과 연도별로 이름표를 붙인 서류철에 넣어 두었고, 도서관 안에서는 볼 수 있지만 밖으로 가져갈 수는 없습니다. 자기 것이 필요하면 접수대 옆 복사기를 쓰세요. 열 장에 500원이고 그 돈은 다시 자료를 채우는 데 씁니다. 서류철은 제자리에 꽂아 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Dohyun, I've been comparing my marks with everyone else's."],
        ["M", "Every test, or only the big ones?"],
        ["W", "Every single one, and I know where I stand in the class."],
        ["M", "And what does knowing that tell you to do next?"],
        ["W", "Nothing, now that you ask."],
        ["M", "That's the problem with the comparison."],
        ["W", "But it shows me whether I'm improving."],
        ["M", "It shows whether others moved, which you cannot control."],
        ["W", "So what should I be comparing instead?"],
        ["M", "This paper against your own last paper, question by question."],
        ["W", "That's a much slower kind of comparison."],
        ["M", "And the only one that ever tells you what to study tonight."],
      ],
      choices: [
        "친구와 성적을 비교해야 한다",
        "자신의 예전 시험과 비교해야 한다",
        "성적을 기록해 두어야 한다",
        "시험을 자주 봐야 한다",
        "등수를 목표로 잡아야 한다",
      ],
      answer: 2,
      clue: "This paper against your own last paper, question by question.",
      explanation:
        "남자는 남과 비교하지 말고 자기 지난 시험과 문항별로 비교하라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 도현아, 나는 내 점수를 다른 사람들 점수랑 비교해 왔어.",
        "M: 시험마다? 큰 시험만?",
        "W: 하나하나 다. 반에서 내 자리가 어딘지 알아.",
        "M: 그걸 알면 다음에 뭘 하라고 알려 줘?",
        "W: 말 나온 김에 보니 아무것도 안 알려 주네.",
        "M: 그게 그 비교의 문제야.",
        "W: 그래도 내가 나아지는지는 보여 주잖아.",
        "M: 남이 움직였는지를 보여 줘. 그건 네가 어쩔 수 없는 거야.",
        "W: 그럼 뭘 비교해야 해?",
        "M: 이번 시험지를 네 지난 시험지와 문항별로.",
        "W: 그건 훨씬 느린 비교야.",
        "M: 그리고 오늘 밤에 뭘 공부할지 알려 주는 유일한 비교야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "There is a habit that costs students more marks than any gap in knowledge. " +
            "It is answering the question you expected instead of the one in front of you. " +
            "You recognise a topic, the hand starts moving, " +
            "and four minutes later you have written a good answer to a different question. " +
            "The cure takes ten seconds. " +
            "Underline the verb in the instruction before you write anything. " +
            "Compare, explain, list and evaluate are four different tasks, " +
            "and only one of them is being asked for.",
        ],
      ],
      choices: [
        "문제를 많이 풀어야 한다",
        "문제의 요구 사항을 먼저 확인해야 한다",
        "답은 길게 써야 한다",
        "시간을 배분해야 한다",
        "아는 문제부터 풀어야 한다",
      ],
      answer: 2,
      clue: "Underline the verb in the instruction before you write anything.",
      explanation:
        "여자는 기대한 문제가 아니라 실제 요구 사항을 먼저 확인하라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 지식의 빈틈보다 더 많은 점수를 잃게 하는 습관이 있습니다. 눈앞에 있는 질문이 아니라 기대했던 질문에 답하는 것입니다. 주제를 알아보는 순간 손이 움직이기 시작하고, 4분 뒤에는 다른 질문에 대한 훌륭한 답을 써 놓게 됩니다. 고치는 데는 10초가 걸립니다. 무엇이든 쓰기 전에 지시문의 동사에 밑줄을 그으세요. 비교하라, 설명하라, 나열하라, 평가하라는 서로 다른 네 가지 일이고, 그중 하나만 요구되고 있습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Naeun, is this the library study area after the change?"],
        ["W", "Yes, they rearranged it during the holiday."],
        ["M", "Two long tables stand down the middle of the room."],
        ["W", "Eight people sit at each one now."],
        ["M", "There's a tall bookcase against the back wall."],
        ["W", "The reference books stay in this room."],
        ["M", "A round wall clock hangs on the left."],
        ["W", "We can hear it ticking when the room is empty."],
        ["M", "Three lamps hang above the tables."],
        ["W", "Two, actually. The middle fitting is still empty."],
        ["M", "And a noticeboard hangs beside the door."],
        ["W", "The opening hours go up on it every Monday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Two, actually. The middle fitting is still empty.",
      explanation:
        "남자가 등이 세 개라고 하자 여자가 두 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.46, 0.62],
          [0.5, 0.08],
          [0.08, 0.3],
          [0.32, 0.3],
          [0.88, 0.5],
        ],
        scene:
          "A library study area drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "TWO LONG TABLES with chairs stand side by side down the MIDDLE of the room. " +
          "A TALL BOOKCASE full of books stands against the BACK wall in the upper middle. " +
          "A ROUND WALL CLOCK hangs high on the LEFT wall. " +
          "EXACTLY THREE PENDANT LAMPS hang from the ceiling above the tables, " +
          "evenly spaced and clearly separated so all three can be counted. " +
          "A RECTANGULAR NOTICEBOARD hangs on the RIGHT wall beside a door.",
      },
      translation: [
        "M: 나은아, 여기가 바뀐 뒤의 도서관 자습 공간이야?",
        "W: 응, 방학 동안 배치를 바꿨어.",
        "M: 방 가운데를 따라 긴 탁자가 두 개 있네.",
        "W: 이제 하나에 여덟 명씩 앉아.",
        "M: 뒷벽에는 키 큰 책장이 있고.",
        "W: 참고 도서는 이 방에 둬.",
        "M: 왼쪽에는 둥근 벽시계가 걸려 있어.",
        "W: 방이 비면 초침 소리가 들려.",
        "M: 탁자 위에 등이 세 개 매달려 있네.",
        "W: 사실 두 개야. 가운데 자리는 아직 비어 있어.",
        "M: 그리고 문 옆에 게시판이 걸려 있어.",
        "W: 월요일마다 여는 시간을 거기에 붙여.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaeyeon, the third year photo day is on Friday."],
        ["W", "Has the photographer confirmed the time?"],
        ["M", "Nine o'clock, and he needs an hour to set up."],
        ["W", "What about the order the classes come down in?"],
        ["M", "Agreed with every homeroom teacher on Monday."],
        ["W", "Then the main pieces are ready."],
        ["M", "Except the background. The old cloth has a tear in it."],
        ["W", "How big is the tear?"],
        ["M", "Half a metre, right where the middle row stands."],
        ["W", "It would show in every single photograph."],
        ["M", "And the art room may have a spare one."],
        ["W", "I'll go and find a background cloth this afternoon."],
      ],
      choices: [
        "사진사에게 연락하기",
        "반 순서를 정하기",
        "배경 천을 찾아오기",
        "교실을 정리하기",
        "사진을 고르기",
      ],
      answer: 3,
      clue: "I'll go and find a background cloth this afternoon.",
      explanation:
        "여자는 오늘 오후에 배경 천을 찾아오겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 채연아, 3학년 사진 촬영일이 금요일이야.",
        "W: 사진사분 시간은 확정됐어?",
        "M: 아홉 시. 준비에 한 시간 필요하대.",
        "W: 반이 내려오는 순서는?",
        "M: 월요일에 담임 선생님들과 다 맞췄어.",
        "W: 그럼 큰 건 다 됐네.",
        "M: 배경만 빼고. 예전 천에 찢어진 데가 있어.",
        "W: 얼마나 찢어졌어?",
        "M: 반 미터. 가운데 줄이 서는 딱 그 자리야.",
        "W: 사진마다 다 나오겠다.",
        "M: 미술실에 여분이 있을지도 몰라.",
        "W: 오늘 오후에 배경 천 찾아올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good afternoon. Are you here about the revision booklets?"],
        ["M", "Yes, our class would like some printed before the exam."],
        ["W", "When do you need them by?"],
        ["M", "Friday morning, if that is possible at all."],
        ["W", "That is fine for an order of this size."],
        ["M", "Good. Then let me give you the details."],
        ["W", "How many pages is each booklet?"],
        ["M", "Forty pages, printed on both sides."],
        ["W", "That size is six dollars per copy."],
        ["M", "We need fifteen copies, please."],
        ["W", "Would you like a plastic cover on each one?"],
        ["M", "How much is the cover?"],
        ["W", "One dollar for each booklet."],
        ["M", "Put covers on all fifteen."],
        ["W", "And school orders over a hundred dollars get ten percent off."],
        ["M", "Here is the class card, then."],
      ],
      choices: ["$94.50", "$105", "$100", "$90", "$110"],
      answer: 1,
      clue: "That size is six dollars per copy.",
      explanation:
        "책자 열다섯 권 90달러와 표지 15달러를 더하면 105달러이고, 10퍼센트를 빼면 94달러 50센트이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 복습 책자 때문에 오셨나요?",
        "M: 네, 시험 전에 우리 반 것을 인쇄하려고요.",
        "W: 언제까지 필요하신가요?",
        "M: 가능하다면 금요일 아침까지요.",
        "W: 이 정도 수량이면 괜찮습니다.",
        "M: 다행이네요. 그럼 자세히 말씀드릴게요.",
        "W: 한 권에 몇 쪽인가요?",
        "M: 마흔 쪽이고 양면 인쇄예요.",
        "W: 그 분량이면 한 권에 6달러입니다.",
        "M: 열다섯 권 주세요.",
        "W: 한 권마다 비닐 표지를 씌워 드릴까요?",
        "M: 표지는 얼마예요?",
        "W: 한 권에 1달러입니다.",
        "M: 열다섯 권 다 씌워 주세요.",
        "W: 그리고 100달러가 넘는 학교 주문은 10퍼센트 할인됩니다.",
        "M: 그럼 여기 학급 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 상담 시간을 바꾼 이유를 고르시오.",
      lines: [
        ["W", "Sangwoo, you moved your counselling session to Thursday?"],
        ["M", "I changed it on Monday and told the teacher."],
        ["W", "Was Tuesday too soon to prepare for it?"],
        ["M", "I had everything ready by Sunday evening."],
        ["W", "Then did something come up at home?"],
        ["M", "No, my university list changes after Wednesday's results."],
        ["W", "The results of the last mock test?"],
        ["M", "Exactly, and half my questions depend on them."],
        ["W", "So talking before Wednesday would waste the session."],
        ["M", "We would spend it guessing at numbers I'll actually have.",],
      ],
      choices: [
        "준비할 시간이 필요해서",
        "집안일이 생겨서",
        "모의고사 결과를 봐야 해서",
        "선생님이 바빠서",
        "다른 일정이 겹쳐서",
      ],
      answer: 3,
      clue: "No, my university list changes after Wednesday's results.",
      explanation:
        "남자는 수요일에 나오는 모의고사 결과를 보고 이야기해야 해서 상담을 옮겼다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 상우야, 상담을 목요일로 옮겼어?",
        "M: 월요일에 바꾸고 선생님께 말씀드렸어.",
        "W: 화요일은 준비하기에 너무 빨랐어?",
        "M: 일요일 저녁에 다 준비해 뒀어.",
        "W: 그럼 집에 무슨 일이 생겼어?",
        "M: 아니, 수요일 결과가 나오면 지망 목록이 바뀌어.",
        "W: 지난 모의고사 결과?",
        "M: 맞아. 내 질문 절반이 거기 달려 있어.",
        "W: 그럼 수요일 전에 이야기하면 그 시간을 버리는 거네.",
        "M: 곧 손에 들어올 숫자를 두고 짐작만 하게 될 거야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 진로 상담 주간에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Taemin, have you heard about the counselling week?"],
        ["M", "Only the name, from the notice by the stairs."],
        ["W", "It's the one week everybody in our year gets a session."],
        ["M", "That sounds useful. When does it start?"],
        ["W", "On the eleventh, and it runs until the fifteenth."],
        ["M", "That's a whole week. How long is each session?"],
        ["W", "Thirty minutes, one student at a time."],
        ["M", "Where do the sessions take place?"],
        ["W", "In the three small rooms behind the careers office."],
        ["M", "Do we need to bring anything with us?"],
        ["W", "Your results from the last two mock tests."],
        ["M", "How do we book a time?"],
        ["W", "On the sheet outside the careers office, from Monday."],
      ],
      choices: ["상담 주간 기간", "한 번에 걸리는 시간", "상담하는 곳", "가져가야 할 것", "상담하는 선생님"],
      answer: 5,
      clue: "On the eleventh, and it runs until the fifteenth.",
      explanation:
        "기간, 시간, 장소, 준비물, 예약 방법은 말했지만 상담 교사는 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 태민아, 진로 상담 주간 얘기 들었어?",
        "M: 계단 옆 안내문에서 이름만 봤어.",
        "W: 우리 학년 전체가 상담을 한 번씩 받는 주야.",
        "M: 도움이 되겠다. 언제 시작해?",
        "W: 11일에 시작해서 15일까지 해.",
        "M: 한 주 내내네. 한 번에 얼마나 걸려?",
        "W: 30분. 한 번에 한 명씩.",
        "M: 상담은 어디서 해?",
        "W: 진로실 뒤 작은 방 세 곳에서.",
        "M: 뭘 가져가야 해?",
        "W: 지난 모의고사 두 번의 결과.",
        "M: 시간은 어떻게 예약해?",
        "W: 월요일부터 진로실 앞 종이에.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Hanul Science High School Open Day에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is some information about the Hanul Science High School Open Day. " +
            "It takes place on Saturday the eighteenth, from nine until three. " +
            "Visitors first gather in the gymnasium for a short introduction. " +
            "Each of the four departments then runs a laboratory demonstration. " +
            "Current students guide the tours, and each group has about fifteen visitors. " +
            "Lunch is provided free of charge in the school dining hall. " +
            "Booking is not required, but groups of more than five should tell us in advance. " +
            "Parking is available only in the public lot beside the stadium.",
        ],
      ],
      choices: [
        "18일 토요일에 열린다",
        "체육관에 먼저 모인다",
        "재학생이 안내를 맡는다",
        "점심값을 따로 내야 한다",
        "주차는 경기장 옆 공영 주차장만 된다",
      ],
      answer: 4,
      clue: "Lunch is provided free of charge in the school dining hall.",
      explanation:
        "점심은 학교 식당에서 무료로 제공된다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "M: 한울과학고등학교 개방일에 대해 알려 드립니다. 18일 토요일 아홉 시부터 세 시까지 진행됩니다. 방문객은 먼저 체육관에 모여 짧은 소개를 듣습니다. 이어서 네 개 학과가 각각 실험 시연을 합니다. 재학생이 안내를 맡고 한 무리에 열다섯 명쯤 함께 다닙니다. 점심은 학교 식당에서 무료로 제공합니다. 예약은 필요 없지만 다섯 명이 넘는 단체는 미리 알려 주시기 바랍니다. 주차는 경기장 옆 공영 주차장만 이용할 수 있습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 신청할 논술 강좌를 고르시오.",
      lines: [
        ["M", "Hayoon, five essay courses open at the centre this month."],
        ["W", "I need one that finishes before the November exam."],
        ["M", "Two of these run into December."],
        ["W", "Then they're out. How many students are in each class?"],
        ["M", "From six up to twenty."],
        ["W", "More than ten and my work never gets read."],
        ["M", "One of the three left has eighteen."],
        ["W", "And the fee should stay under ninety thousand won."],
        ["M", "One of the last two is a hundred and twenty."],
        ["W", "So there's only one course for me."],
        ["M", "I'd register tonight, before the list closes."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "I need one that finishes before the November exam.",
      explanation:
        "11월 시험 전에 끝나고, 정원 10명 이하이며, 9만 원 미만인 강좌를 고른다. 세 조건을 모두 채우는 것은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Ends: December / Students: 8 / Fee: 80,000 won" },
          { no: 2, label: "②", value: "Ends: December / Students: 10 / Fee: 70,000 won" },
          { no: 3, label: "③", value: "Ends: October / Students: 18 / Fee: 60,000 won" },
          { no: 4, label: "④", value: "Ends: October / Students: 8 / Fee: 120,000 won" },
          { no: 5, label: "⑤", value: "Ends: October / Students: 9 / Fee: 88,000 won" },
        ],
      },
      translation: [
        "M: 하윤아, 이번 달에 센터에서 논술 강좌 다섯 개가 열려.",
        "W: 11월 시험 전에 끝나는 게 필요해.",
        "M: 두 개는 12월까지 가.",
        "W: 그럼 빠지네. 한 반에 몇 명이야?",
        "M: 여섯 명부터 스무 명까지.",
        "W: 열 명 넘으면 내 글이 안 읽혀.",
        "M: 남은 셋 중 하나는 열여덟 명이야.",
        "W: 그리고 수강료는 9만 원 아래여야 해.",
        "M: 남은 둘 중 하나는 12만 원이야.",
        "W: 그럼 나한테 맞는 건 하나뿐이네.",
        "M: 명단 닫히기 전에 오늘 밤에 등록하는 게 좋겠어.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junho, did you collect your certificate from the office?"],
        ["M", "Not yet. I've been meaning to since Monday."],
        ["W", "They only keep them for two weeks."],
        ["M", "When exactly does the two weeks end?"],
        ["W", "On Friday, and the office shuts at four."],
      ],
      choices: [
        "I don't need a certificate.",
        "Then I'll go this afternoon.",
        "The office is never open.",
        "You should collect yours.",
        "Friday is too soon.",
      ],
      answer: 2,
      clue: "On Friday, and the office shuts at four.",
      explanation:
        "금요일까지만 보관한다고 했으므로, 오늘 오후에 가겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준호야, 행정실에서 확인서 받아 왔어?",
        "M: 아직. 월요일부터 가려고만 했어.",
        "W: 두 주만 보관해 줘.",
        "M: 그 두 주가 정확히 언제 끝나?",
        "W: 금요일에. 행정실은 네 시에 닫아.",
        "M: 그럼 오늘 오후에 갈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyun, are you using the small study room tonight?"],
        ["W", "From seven, with two others from my class."],
        ["M", "Is there space for one more person?"],
        ["W", "The room seats six, so yes."],
        ["M", "Do I need to add my name anywhere?"],
      ],
      choices: [
        "The room is full tonight.",
        "Just write it on the door sheet.",
        "I'm not using the room.",
        "You can't study with us.",
        "Seven is too late for me.",
      ],
      answer: 2,
      clue: "Do I need to add my name anywhere?",
      explanation:
        "이름을 어디에 적어야 하는지 물었으므로, 문에 붙은 종이에 적으라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 서윤아, 오늘 밤에 작은 스터디룸 써?",
        "W: 일곱 시부터. 우리 반 두 명이랑.",
        "M: 한 명 더 들어갈 자리 있어?",
        "W: 여섯 자리라서 있어.",
        "M: 어디에 이름을 적어야 해?",
        "W: 문에 붙은 종이에 적으면 돼.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaewon, how is the English reading practice going?"],
        ["W", "I finish every passage but understand about half."],
        ["M", "How fast are you reading them?"],
        ["W", "As fast as I can. There is never enough time."],
        ["M", "And then you read the questions and go back."],
        ["W", "Twice, usually, and sometimes three times."],
        ["M", "So the fast reading is costing you two more readings."],
        ["W", "When you put it that way it sounds absurd."],
        ["M", "One careful reading is often faster than three quick ones."],
        ["W", "Even with the clock running?"],
        ["M", "Try it on five passages and compare the total time."],
      ],
      choices: [
        "I never read the passages.",
        "That's worth measuring, I'll try it.",
        "Fast reading is always better.",
        "There are no questions.",
        "You should read them for me.",
      ],
      answer: 2,
      clue: "Try it on five passages and compare the total time.",
      explanation:
        "다섯 지문으로 시험해 전체 시간을 비교해 보라는 제안이므로, 재 볼 만하다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 채원아, 영어 읽기 연습은 어때?",
        "W: 지문은 다 끝내는데 절반쯤만 이해해.",
        "M: 얼마나 빨리 읽어?",
        "W: 최대한 빨리. 시간이 늘 모자라.",
        "M: 그러고 나서 문제를 읽고 다시 돌아가지.",
        "W: 보통 두 번. 어떨 땐 세 번.",
        "M: 그럼 빨리 읽은 값으로 두 번을 더 읽는 거네.",
        "W: 그렇게 말하니 말이 안 되게 들린다.",
        "M: 꼼꼼한 한 번이 빠른 세 번보다 빠를 때가 많아.",
        "W: 시간을 재는 중에도?",
        "M: 지문 다섯 개로 해 보고 전체 시간을 비교해 봐.",
        "W: 재 볼 만하네, 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Kiyoung, you've been going to bed at eleven all term."],
        ["M", "Since the first week of September, without exception."],
        ["W", "Even the night before a test?"],
        ["M", "Especially then. That was the hardest rule to keep."],
        ["W", "Most people study until two before a test."],
        ["M", "I did that in June and forgot half of it by nine."],
        ["W", "So the extra hours were spent twice over."],
        ["M", "Once at the desk and once in the exam, badly."],
        ["W", "And now?"],
        ["M", "Now I write faster and read the questions properly."],
        ["W", "Could you tell me how you get to bed on time?"],
      ],
      choices: [
        "Sure, I'll explain it at lunch.",
        "I sleep at three every night.",
        "I don't sleep at all.",
        "You should study until two.",
        "There are no tests this term.",
      ],
      answer: 1,
      clue: "Could you tell me how you get to bed on time?",
      explanation:
        "여자가 제시간에 자는 방법을 알려 달라고 했으므로, 점심때 설명하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 기영아, 이번 학기 내내 열한 시에 자더라.",
        "M: 9월 첫 주부터 한 번도 안 어겼어.",
        "W: 시험 전날 밤에도?",
        "M: 특히 그때. 그게 지키기 제일 어려운 규칙이었어.",
        "W: 대부분은 시험 전에 두 시까지 하잖아.",
        "M: 6월에 그렇게 했는데 아침 아홉 시엔 절반을 잊었어.",
        "W: 그럼 그 시간을 두 번 치른 거네.",
        "M: 한 번은 책상에서, 한 번은 시험장에서 엉망으로.",
        "W: 지금은?",
        "M: 지금은 더 빨리 쓰고 문제를 제대로 읽어.",
        "W: 제시간에 자는 방법 좀 알려 줄래?",
        "M: 그럼, 점심때 설명해 줄게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Dain이 Junseo에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Dain : ________________",
      lines: [
        [
          "W",
          "Dain and Junseo are preparing the third year farewell slideshow. " +
            "They have gathered photographs from every month of the last three years. " +
            "Junseo has set each photograph to stay on the screen for two seconds. " +
            "Dain has watched it once and cannot recognise anybody in it. " +
            "Two hundred photographs at that speed become a blur of colour. " +
            "There is no reason the show has to include every single picture. " +
            "She wants him to use fewer photographs and hold each one longer. " +
            "In this situation, what would Dain most likely say to Junseo?",
        ],
      ],
      choices: [
        "Let's cancel the slideshow this year.",
        "We need many more photographs.",
        "Use fewer photographs and hold each longer.",
        "I'll take new photographs tomorrow.",
        "Two seconds is far too slow.",
      ],
      answer: 3,
      clue: "She wants him to use fewer photographs and hold each one longer.",
      explanation:
        "너무 빨라 아무도 알아볼 수 없으므로 사진을 줄이고 더 길게 보여 주자는 ③이 가장 적절하다.",
      translation: [
        "W: 다인이와 준서는 3학년 송별 사진 영상을 준비하고 있습니다. 두 사람은 지난 3년의 달마다 사진을 모았습니다. 준서는 사진 하나를 2초씩 화면에 띄우게 맞춰 놓았습니다. 다인이는 한 번 보고 나서 누구도 알아볼 수 없었습니다. 그 속도로 사진 이백 장이면 색이 뒤섞인 덩어리가 됩니다. 모든 사진을 다 넣어야 할 이유는 없습니다. 다인이는 사진을 줄이고 하나하나를 더 길게 보여 주기를 바랍니다. 이런 상황에서 다인이가 준서에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to explain why an empty room echoes " +
            "and a furnished one does not. " +
            "Sound does not stop when it reaches a wall. " +
            "It bounces, and it keeps bouncing until something absorbs it. " +
            "A hard flat wall returns almost all of the energy that arrives, " +
            "so your voice comes back to you a fraction of a second later, " +
            "again and again, until it finally dies away. " +
            "A curtain, a sofa or a shelf of books is full of small spaces, " +
            "and sound entering those spaces is turned into a tiny amount of heat. " +
            "Furniture does not block the sound. It quietly eats it. " +
            "That is why a room sounds larger the day before you move in.",
        ],
      ],
      choices: [
        "how microphones record a voice",
        "why an empty room echoes",
        "how walls are built to be strong",
        "why some voices carry further",
        "how music halls are heated",
      ],
      answer: 2,
      clue: "Furniture does not block the sound. It quietly eats it.",
      explanation:
        "남자는 소리가 딴딴한 벽에서는 되튀고 가구에서는 흡수되어 빈방이 울린다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 빈방은 왜 울리고 가구가 있는 방은 왜 그렇지 않은지 설명하려 합니다. 소리는 벽에 닿으면 멈추지 않습니다. 되튀고, 무엇인가가 흡수할 때까지 계속 되튑니다. 딴딴하고 평평한 벽은 도달한 에너지를 거의 다 돌려보내서, 여러분의 목소리가 아주 짧은 시간 뒤에 되돌아오고, 그것이 사그라들 때까지 되풀이됩니다. 커튼이나 소파, 책이 꽂힌 선반은 작은 틈으로 가득해서, 그 틈으로 들어간 소리는 아주 적은 열로 바뀝니다. 가구는 소리를 막는 것이 아닙니다. 조용히 먹어 치우는 것입니다. 그래서 이사 들어가기 전날의 방이 더 크게 들립니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Today I want to explain why an empty room echoes."],
        ["M", "Sound bounces, and it keeps bouncing until something absorbs it."],
        ["M", "A hard flat wall returns almost all of the energy that arrives."],
        ["M", "Sound entering those small spaces is turned into a tiny amount of heat."],
        ["M", "Furniture does not block the sound. It quietly eats it."],
      ],
      choices: [
        "sound bouncing until something absorbs it",
        "a hard wall returning almost all the energy",
        "sound being turned into a tiny amount of heat",
        "furniture eating the sound rather than blocking it",
        "the speed of sound in cold air",
      ],
      answer: 5,
      clue: "Sound bounces, and it keeps bouncing until something absorbs it.",
      explanation:
        "흡수될 때까지 되튀는 소리, 에너지를 되돌려보내는 딴딴한 벽, 열로 바뀌는 소리, 소리를 먹는 가구는 언급되지만 찬 공기에서의 소리 속도는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
