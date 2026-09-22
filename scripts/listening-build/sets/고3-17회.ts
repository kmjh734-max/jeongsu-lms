/** 고3 듣기 17회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 17회",
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
          "Good evening, third-year students. This is Ms. Seon from the counselling office. " +
            "I want to explain one change to the way we run individual counselling from next week. " +
            "Until now you came in, sat down, and we began by asking what you wanted to talk about. " +
            "Most students spent the first ten of their thirty minutes deciding that. " +
            "From Monday you will write two sentences when you book: what you want to decide, and what you have already tried. " +
            "We read those before you arrive, so the thirty minutes start where they used to reach at minute ten. " +
            "Nothing else changes. The room, the length and the teachers are the same. " +
            "The new booking form opens tomorrow morning. Thank you.",
        ],
      ],
      choices: [
        "상담 시간을 늘리겠다고 알리려고",
        "상담 신청 시 미리 적어야 할 내용을 안내하려고",
        "상담 교사가 바뀐 것을 알리려고",
        "진학 설명회 참석을 권하려고",
        "상담실 위치가 바뀐 것을 알리려고",
      ],
      answer: 2,
      clue: "From Monday you will write two sentences when you book: what you want to decide, and what you have already tried.",
      explanation:
        "다음 주부터 상담을 신청할 때 정하고 싶은 것과 이미 해 본 것을 두 문장으로 적어야 한다는 것을 알리고 있다. 따라서 말의 목적은 ②이다.",
      translation: [
        "W: 3학년 학생 여러분, 안녕하세요. 상담실 선 선생님입니다. " +
          "다음 주부터 달라지는 개인 상담 운영 방식을 설명드리려 합니다. " +
          "지금까지는 들어와서 앉으면 무엇을 이야기하고 싶은지부터 물었습니다. " +
          "대부분 30분 중 첫 10분을 그것을 정하는 데 썼습니다. " +
          "월요일부터는 신청할 때 두 문장을 적게 됩니다. 무엇을 정하고 싶은지, 그리고 이미 무엇을 해 보았는지입니다. " +
          "오시기 전에 저희가 읽어 두므로, 예전에 10분째에 닿던 지점에서 30분이 시작됩니다. " +
          "그 밖에는 달라지지 않습니다. 장소도 시간도 선생님도 그대로입니다. " +
          "새 신청서는 내일 아침에 열립니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junhyuk, why do you do the practice test before you finish the unit?"],
        ["M", "Because finishing the unit tells me nothing about what I can do."],
        ["W", "But you'll get questions on things you haven't studied."],
        ["M", "That's the point. Then I know which ones to study."],
        ["W", "Isn't it discouraging to score badly on purpose?"],
        ["M", "It was the first three times. Now it's just information."],
        ["W", "I always finish everything first and then test myself."],
        ["M", "And how much of what you finished turns up in the test?"],
        ["W", "Honestly, less than half."],
        ["M", "So half your time went somewhere the test never looks."],
        ["W", "All right. I'll try a test before the next unit."],
      ],
      choices: [
        "문제는 많이 풀수록 좋다",
        "단원을 끝내기 전에 먼저 시험을 봐서 약한 곳을 찾아야 한다",
        "오답은 유형별로 모아야 한다",
        "공부 계획은 매일 세워야 한다",
        "해설은 스스로 써 보아야 한다",
      ],
      answer: 2,
      clue: "So half your time went somewhere the test never looks.",
      explanation:
        "남자는 단원을 다 끝내기 전에 시험을 봐야 어디를 공부할지 알 수 있다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 준혁아, 왜 단원을 끝내기도 전에 모의 문제를 풀어?",
        "M: 단원을 끝냈다는 건 내가 뭘 할 수 있는지 하나도 말해 주지 않으니까.",
        "W: 그런데 아직 공부 안 한 데서도 문제가 나오잖아.",
        "M: 그게 핵심이야. 그래야 어디를 공부할지 알거든.",
        "W: 일부러 점수를 낮게 받는 게 기운 빠지지 않아?",
        "M: 처음 세 번은 그랬어. 지금은 그냥 정보야.",
        "W: 나는 늘 다 끝내고 나서 시험을 봐.",
        "M: 그럼 끝낸 것 중에 시험에 나오는 게 얼마나 돼?",
        "W: 솔직히 절반도 안 돼.",
        "M: 그럼 네 시간의 절반은 시험이 들여다보지도 않는 데로 간 거네.",
        "W: 알겠어. 다음 단원은 시험부터 봐 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We treat a long to-do list as evidence that we are working hard. " +
            "It is usually evidence of something else: that we have not decided anything. " +
            "Twenty items means twenty small permissions to postpone, because there is always something easier on the list. " +
            "Three items force a choice, and a choice is what a plan actually is. " +
            "Write the twenty if writing them clears your head, then cross out seventeen. " +
            "The list is not the work. Deciding what will not happen today is the work.",
        ],
      ],
      choices: [
        "긴 목록은 결정을 미루게 하므로 오늘 할 일을 몇 개로 줄여야 한다",
        "할 일 목록은 손으로 써야 한다",
        "계획은 아침에 세우는 것이 좋다",
        "어려운 일을 먼저 해야 한다",
        "목록은 매일 점검해야 한다",
      ],
      answer: 1,
      clue: "The list is not the work. Deciding what will not happen today is the work.",
      explanation:
        "스무 개짜리 목록은 미룰 핑계를 스무 개 주므로, 오늘 하지 않을 것을 정해 몇 개로 줄여야 한다는 내용이다. 따라서 요지는 ①이다.",
      translation: [
        "W: 우리는 긴 할 일 목록을 열심히 일하고 있다는 증거로 여깁니다. " +
          "대개는 다른 것의 증거입니다. 아무것도 정하지 않았다는 증거지요. " +
          "스무 개는 미룰 수 있는 작은 허락 스무 개입니다. 목록에는 늘 더 쉬운 것이 있으니까요. " +
          "세 개는 선택을 강제하고, 계획이란 사실 그 선택입니다. " +
          "머리가 개운해진다면 스무 개를 적으세요. 그다음에 열일곱 개를 지우세요. " +
          "목록이 일이 아닙니다. 오늘 하지 않을 것을 정하는 것이 일입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Seoyul, the third-year study room looks much better now."],
        ["W", "We rearranged it over the weekend. What do you see first?"],
        ["M", "The wide clock above the door on the back wall."],
        ["W", "We moved it up so it's visible from the back row."],
        ["M", "On the left there's a locker unit with four doors."],
        ["W", "One for each class that uses the room."],
        ["M", "In the middle there's a long desk with three chairs."],
        ["W", "Three is all that fits without blocking the aisle."],
        ["M", "By the window on the right, is that a bookcase?"],
        ["W", "No, it's a filing cabinet. The bookcase went to the library."],
        ["M", "I see. And next to the door there's a round waste basket."],
        ["W", "We empty it ourselves every Friday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's a filing cabinet. The bookcase went to the library.",
      explanation:
        "여자는 창가에 있는 것이 책장이 아니라 서류함이라고 바로잡는다. 그림에는 책장이 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school study room seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "High on the back wall: one WIDE rectangular wall clock. " +
          "Left wall: a locker unit with exactly FOUR doors in a row, each with a small handle. " +
          "Centre of the room: one LONG desk with exactly THREE chairs tucked under it. " +
          "By the window on the right: a BOOKCASE with three shelves full of books. " +
          "Next to the door on the far right: one ROUND waste basket on the floor.",
      },
      translation: [
        "M: 서율아, 3학년 자습실이 훨씬 나아졌네.",
        "W: 주말에 자리를 바꿨어. 뭐가 먼저 보여?",
        "M: 뒷벽 문 위에 있는 넓은 시계.",
        "W: 뒷줄에서도 보이라고 위로 올렸어.",
        "M: 왼쪽에는 문이 네 개인 사물함이 있고.",
        "W: 이 방을 쓰는 반마다 하나씩이야.",
        "M: 가운데에는 의자 세 개가 있는 긴 책상이 있네.",
        "W: 통로를 막지 않으려면 세 개가 딱이야.",
        "M: 오른쪽 창가에 있는 건 책장이야?",
        "W: 아니, 서류함이야. 책장은 도서관으로 갔어.",
        "M: 그렇구나. 그리고 문 옆에는 둥근 휴지통이 있고.",
        "W: 금요일마다 우리가 직접 비워.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taemin, the mock interview list has a problem."],
        ["M", "I sent it out on Monday. What is it?"],
        ["W", "Three students are down for the ten o'clock slot on Friday."],
        ["M", "Three? Each slot takes one student."],
        ["W", "Two of them signed up twice, once in the office and once online."],
        ["M", "So the online list and the paper list were never merged."],
        ["W", "Exactly. There may be more duplicates further down."],
        ["M", "Then somebody has to compare the two lists line by line."],
        ["W", "I have the office copy in my folder."],
        ["M", "Send me a photo and I'll go through both tonight."],
        ["W", "Thanks. Then I'll tell the teachers once you send the clean list."],
      ],
      choices: [
        "선생님들께 연락하기",
        "면접실을 예약하기",
        "학생들에게 문자 보내기",
        "두 명단을 대조해 중복을 찾기",
        "일정표를 새로 인쇄하기",
      ],
      answer: 4,
      clue: "Send me a photo and I'll go through both tonight.",
      explanation:
        "남자는 온라인 명단과 종이 명단을 대조해 중복을 찾기로 한다. 교사 연락은 여자가 맡았다. 따라서 답은 ④이다.",
      translation: [
        "W: 태민아, 모의 면접 명단에 문제가 있어.",
        "M: 월요일에 보냈는데. 뭔데?",
        "W: 금요일 10시 자리에 세 명이 잡혀 있어.",
        "M: 세 명? 한 자리에 한 명이잖아.",
        "W: 두 명이 행정실에서 한 번, 온라인으로 한 번 두 번 신청했어.",
        "M: 그럼 온라인 명단이랑 종이 명단을 합치지 않은 거네.",
        "W: 그렇지. 아래쪽에 중복이 더 있을 수도 있어.",
        "M: 그럼 누가 두 명단을 한 줄씩 대조해야겠다.",
        "W: 행정실 사본은 내 서류철에 있어.",
        "M: 사진 보내 줘. 오늘 밤에 둘 다 훑어볼게.",
        "W: 고마워. 정리된 명단 보내 주면 내가 선생님들께 알릴게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Good afternoon. Are you here for the study booklets?"],
        ["W", "Yes, the ones our class ordered last week."],
        ["M", "Fifteen copies, wasn't it? Printing is six dollars each."],
        ["W", "That's right. So ninety dollars for the printing."],
        ["M", "Correct. Would you like them spiral bound?"],
        ["W", "How much does binding add?"],
        ["M", "Two dollars per copy, and they open flat on a desk."],
        ["W", "Then yes, all fifteen."],
        ["M", "All right. And school orders get ten percent off the printing."],
        ["W", "That helps. Can I collect them now?"],
        ["M", "They're in the box behind you."],
        ["W", "Thank you. I'll pay by card."],
      ],
      choices: ["$81", "$108", "$111", "$120", "$132"],
      answer: 3,
      clue: "All right. And school orders get ten percent off the printing.",
      explanation:
        "인쇄 6달러짜리 열다섯 부는 90달러이고, 10퍼센트 할인을 받으면 81달러이다. 제본 2달러씩 열다섯 부 30달러를 더하면 111달러이므로 답은 ③이다.",
      translation: [
        "M: 안녕하세요. 학습 책자 때문에 오셨나요?",
        "W: 네, 지난주에 저희 반이 주문한 거요.",
        "M: 열다섯 부 맞으시죠? 인쇄는 한 부에 6달러입니다.",
        "W: 맞습니다. 그럼 인쇄가 90달러네요.",
        "M: 맞습니다. 스프링 제본을 해 드릴까요?",
        "W: 제본은 얼마나 더 드나요?",
        "M: 한 부에 2달러인데, 책상에 평평하게 펴집니다.",
        "W: 그럼 열다섯 부 다 해 주세요.",
        "M: 알겠습니다. 그리고 학교 주문은 인쇄비에서 10퍼센트 할인됩니다.",
        "W: 도움이 되네요. 지금 찾아가도 되나요?",
        "M: 뒤에 있는 상자에 있습니다.",
        "W: 감사합니다. 카드로 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 스터디 모임을 옮기려는 이유를 고르시오.",
      lines: [
        ["W", "Dohun, you want to move the study group to the community centre?"],
        ["M", "From next week, if everyone agrees."],
        ["W", "Is the school room too small now?"],
        ["M", "No, six of us fit easily."],
        ["W", "Then what changed? We've used that room since March."],
        ["M", "The room is only open while a teacher is in the building."],
        ["W", "And they leave at seven."],
        ["M", "Right, but we need until nine on Tuesdays."],
        ["W", "So we lose two hours every week."],
        ["M", "Exactly. The community centre room is open until ten."],
      ],
      choices: [
        "방이 좁아서",
        "이용료가 비싸서",
        "쓸 수 있는 시간이 짧아서",
        "너무 시끄러워서",
        "거리가 멀어서",
      ],
      answer: 3,
      clue: "Right, but we need until nine on Tuesdays.",
      explanation:
        "학교 방은 교사가 있는 7시까지만 쓸 수 있는데 화요일에는 9시까지 필요하다. 따라서 답은 ③이다.",
      translation: [
        "W: 도훈아, 스터디를 주민센터로 옮기고 싶다고?",
        "M: 다들 괜찮으면 다음 주부터.",
        "W: 학교 방이 이제 좁아?",
        "M: 아니, 여섯 명은 넉넉해.",
        "W: 그럼 뭐가 달라졌는데? 3월부터 그 방을 썼잖아.",
        "M: 그 방은 건물에 교사가 있을 때만 열려 있어.",
        "W: 그리고 7시에 퇴근하시고.",
        "M: 그래, 그런데 화요일엔 9시까지 필요해.",
        "W: 그럼 매주 두 시간을 잃는 거네.",
        "M: 그렇지. 주민센터 방은 10시까지 열어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 논술 첨삭 프로그램에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Minjae, have you applied for the essay feedback programme?"],
        ["M", "Not yet. I saw the poster but I only know that it exists."],
        ["W", "You should read it. It's the most useful thing the school runs."],
        ["M", "All right, tell me. How long does it run?"],
        ["W", "Four weeks, every Monday and Thursday evening."],
        ["M", "Four weeks, twice a week. And how long is each session?"],
        ["W", "Eighty minutes, from seven until twenty past eight."],
        ["M", "That's longer than I expected. Who gives the feedback?"],
        ["W", "Two Korean teachers, and each one takes six students."],
        ["M", "Only six each? Twelve places in total, then."],
        ["W", "That's why it goes quickly."],
        ["M", "How do I apply?"],
        ["W", "On the career page. It closes on Wednesday evening."],
        ["M", "Then I'll do it tonight rather than tomorrow."],
        ["W", "You should. It filled in a day last year."],
      ],
      choices: ["진행 기간", "수업 시간", "담당 교사", "신청 방법", "제출 과제"],
      answer: 5,
      clue: "On the career page. It closes on Wednesday evening.",
      explanation:
        "기간(4주), 수업 시간(80분), 담당 교사(국어 교사 두 명), 신청 방법(진로 누리집)은 언급되지만 제출 과제는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 민재야, 논술 첨삭 프로그램 신청했어?",
        "M: 아직. 포스터는 봤는데 있다는 것만 알아.",
        "W: 읽어 봐. 학교에서 하는 것 중에 제일 쓸모 있어.",
        "M: 알겠어, 말해 봐. 얼마 동안 해?",
        "W: 4주 동안 월요일이랑 목요일 저녁에.",
        "M: 4주에 주 두 번이구나. 한 번에 얼마나 해?",
        "W: 80분, 7시부터 8시 20분까지.",
        "M: 생각보다 기네. 누가 봐 주시는데?",
        "W: 국어 선생님 두 분, 한 분이 여섯 명씩 맡으셔.",
        "M: 한 분당 여섯 명? 그럼 모두 열두 자리네.",
        "W: 그래서 금방 차는 거야.",
        "M: 신청은 어떻게 해?",
        "W: 진로 누리집에서. 수요일 저녁에 마감이야.",
        "M: 그럼 내일 말고 오늘 밤에 할게.",
        "W: 그래. 작년에는 하루 만에 찼어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Sori Public Reading Room에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is what you should know about the Sori Public Reading Room, which opened last spring. " +
            "It is open from seven in the morning until eleven at night, every day of the year. " +
            "A seat costs nothing, but you must tap your card at the gate so the system knows the room is full. " +
            "Seats are released after thirty minutes if nobody comes back to them. " +
            "Drinks in closed bottles are allowed; food of any kind is not. " +
            "There are twelve rooms for group study, and those must be booked a day ahead. " +
            "The building is directly above the subway exit, so you never go outside in winter.",
        ],
      ],
      choices: [
        "지난봄에 문을 열었다",
        "연중무휴로 운영된다",
        "자리 이용료를 내야 한다",
        "30분 동안 비우면 자리가 풀린다",
        "모둠실은 하루 전에 예약해야 한다",
      ],
      answer: 3,
      clue: "A seat costs nothing, but you must tap your card at the gate so the system knows the room is full.",
      explanation:
        "자리는 무료이고 카드만 대면 된다고 했으므로 이용료를 내야 한다는 ③이 내용과 일치하지 않는다.",
      translation: [
        "M: 지난봄에 문을 연 Sori Public Reading Room에 관해 알아 두실 내용입니다. " +
          "1년 내내 매일 아침 7시부터 밤 11시까지 엽니다. " +
          "자리는 무료이지만, 자리가 찼는지 알 수 있도록 입구에서 카드를 대야 합니다. " +
          "30분 동안 아무도 돌아오지 않으면 자리는 다시 풀립니다. " +
          "뚜껑 있는 병에 든 음료는 괜찮지만 음식은 어떤 것도 안 됩니다. " +
          "모둠 학습실이 열두 개 있고, 하루 전에 예약해야 합니다. " +
          "건물이 지하철 출구 바로 위에 있어서 겨울에도 밖으로 나갈 일이 없습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 인터넷 강의를 고르시오.",
      lines: [
        ["W", "Hyunwoo, these are the five online courses still open for December."],
        ["M", "Let's pick one. First, we need one that covers the whole exam range."],
        ["W", "Then one is out. It only covers the second half."],
        ["M", "Next, how many lectures? Fewer than twenty is not enough."],
        ["W", "One has sixteen, so that's gone as well."],
        ["M", "Three left. Do they all come with printed notes?"],
        ["W", "Two do. One is file only, and neither of us reads well on a screen."],
        ["M", "Two left, then. What do they cost?"],
        ["W", "We agreed on a hundred and twenty thousand won at the most."],
        ["M", "Then only one fits everything."],
        ["W", "I'll sign us both up tonight and send you the link."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Then only one fits everything.",
      explanation:
        "범위가 절반인 ①, 16강인 ②, 파일만 주는 ③을 뺀다. 남은 ④와 ⑤ 중 12만 원 이하인 것은 ⑤이므로 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "후반부만 / 24강 / 인쇄 교재 / 100,000원" },
          { no: 2, label: "②", value: "전 범위 / 16강 / 인쇄 교재 / 90,000원" },
          { no: 3, label: "③", value: "전 범위 / 24강 / 파일만 / 110,000원" },
          { no: 4, label: "④", value: "전 범위 / 28강 / 인쇄 교재 / 140,000원" },
          { no: 5, label: "⑤", value: "전 범위 / 22강 / 인쇄 교재 / 120,000원" },
        ],
      },
      translation: [
        "W: 현우야, 12월에 아직 열려 있는 인터넷 강의가 이 다섯 개야.",
        "M: 하나 고르자. 우선 시험 범위 전체를 다루는 거여야 해.",
        "W: 그럼 하나 빠지네. 후반부만 다루는 게 있어.",
        "M: 다음으로 강의 수는? 스무 개보다 적으면 부족해.",
        "W: 하나는 16강이라 그것도 빠져.",
        "M: 셋 남았다. 다 인쇄 교재가 와?",
        "W: 둘은 와. 하나는 파일만 주는데 우리 둘 다 화면으로는 잘 안 읽잖아.",
        "M: 그럼 둘 남았네. 가격은?",
        "W: 12만 원까지로 정했잖아.",
        "M: 그럼 다 맞는 건 하나뿐이네.",
        "W: 오늘 밤에 둘 다 신청하고 주소 보내 줄게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Did you get the recommendation form from the office?"],
        ["M", "Not yet. They said the new version isn't printed."],
        ["W", "Did you check the school website?"],
        ["M", "I didn't know it was there."],
        ["W", "The form has been downloadable since last Friday."],
      ],
      choices: [
        "The deadline is next Wednesday.",
        "Then I'll download it tonight.",
        "I need two copies of it.",
        "The office closes at five.",
        "You should get yours as well.",
      ],
      answer: 2,
      clue: "The form has been downloadable since last Friday.",
      explanation:
        "지난 금요일부터 누리집에서 내려받을 수 있다는 말을 들었으므로, 오늘 밤에 내려받겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 행정실에서 추천서 양식 받았어?",
        "M: 아직. 새 양식이 아직 인쇄가 안 됐대.",
        "W: 학교 누리집은 봤어?",
        "M: 거기 있는 줄 몰랐어.",
        "W: 지난 금요일부터 내려받을 수 있어.",
        "M: 그럼 오늘 밤에 내려받을게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "You've been carrying two water bottles around all week."],
        ["W", "The fountain on our floor has been broken since Monday."],
        ["M", "Did you report it?"],
        ["W", "I assumed somebody else had."],
        ["M", "Nothing gets fixed until one person writes it in the office book."],
      ],
      choices: [
        "My bottles are quite heavy.",
        "The fountain is by the stairs.",
        "I drink about two litres a day.",
        "You should report it instead.",
        "Then I'll write it in the book today.",
      ],
      answer: 5,
      clue: "Nothing gets fixed until one person writes it in the office book.",
      explanation:
        "누군가 행정실 대장에 적어야 고쳐진다는 말을 들었으므로, 오늘 적겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 일주일 내내 물병을 두 개씩 들고 다니네.",
        "W: 우리 층 음수대가 월요일부터 고장 났어.",
        "M: 신고는 했어?",
        "W: 다른 사람이 했겠거니 했어.",
        "M: 누군가 행정실 대장에 적기 전에는 아무것도 안 고쳐져.",
        "W: 그럼 오늘 대장에 적을게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Seungho, how is the university application going?"],
        ["M", "I've read about forty pages on each department."],
        ["W", "Forty pages each? How many departments?"],
        ["M", "Six, and I still can't say which one I'd choose."],
        ["W", "What does the reading tell you?"],
        ["M", "What each course contains. They all sound reasonable."],
        ["W", "Have you talked to anybody who actually studies one of them?"],
        ["M", "No. I thought the pages would be enough."],
        ["W", "A page tells you what a course is. A person tells you what a week is."],
        ["M", "I hadn't thought about the difference."],
        ["W", "Ask the career office to put you in touch with two graduates."],
      ],
      choices: [
        "Then I'll ask the office for two names tomorrow.",
        "I've read about two hundred pages in total.",
        "The application closes at the end of the month.",
        "I'd rather decide on my own.",
        "Six departments is too many to choose from.",
      ],
      answer: 1,
      clue: "Ask the career office to put you in touch with two graduates.",
      explanation:
        "진로부에 졸업생 두 명을 연결해 달라고 하라는 조언을 들었으므로, 내일 부탁하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 승호야, 대학 원서는 잘돼 가?",
        "M: 학과마다 마흔 쪽쯤 읽었어.",
        "W: 학과마다 마흔 쪽? 몇 개 학과인데?",
        "M: 여섯 개, 그런데 아직도 어디를 고를지 말 못 하겠어.",
        "W: 읽어 보면 뭘 알 수 있는데?",
        "M: 어떤 과목이 있는지. 다 그럴듯해 보여.",
        "W: 실제로 그중 하나를 공부하는 사람이랑 이야기해 봤어?",
        "M: 아니. 읽는 걸로 충분할 줄 알았어.",
        "W: 글은 그 전공이 무엇인지 알려 주고, 사람은 한 주가 어떤지 알려 줘.",
        "M: 그 차이는 생각 못 했어.",
        "W: 진로부에 졸업생 두 명만 연결해 달라고 해 봐.",
        "M: 그럼 내일 진로부에 두 명만 부탁드릴게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaewon, you said the English listening still costs you points?"],
        ["W", "Three or four every test, always near the end."],
        ["M", "Do you listen to those questions again?"],
        ["W", "I play the whole test again from the beginning."],
        ["M", "The whole thing? That's twenty-five minutes."],
        ["W", "And by the time I reach the hard ones I'm tired again."],
        ["M", "So you practise the easy part twice and the hard part once."],
        ["W", "When you say it like that, it's obviously backwards."],
        ["M", "Start from the question you missed and play only those."],
      ],
      choices: [
        "Then I'll play only the missed questions tonight.",
        "The listening section takes twenty-five minutes.",
        "I take one test every Saturday.",
        "My headphones are quite old.",
        "I'd rather read the script instead.",
      ],
      answer: 1,
      clue: "Start from the question you missed and play only those.",
      explanation:
        "틀린 문제부터 그 부분만 다시 들으라는 조언을 들었으므로, 오늘 밤에 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 채원아, 영어 듣기에서 아직 점수를 잃는다고 했지?",
        "W: 시험마다 서너 개, 늘 뒤쪽에서.",
        "M: 그 문제들 다시 들어?",
        "W: 처음부터 전체를 다시 틀어.",
        "M: 전체를? 25분이잖아.",
        "W: 그러다 어려운 데 닿으면 또 지쳐 있어.",
        "M: 그럼 쉬운 부분을 두 번, 어려운 부분을 한 번 연습하는 거네.",
        "W: 그렇게 말하니 완전히 거꾸로였네.",
        "M: 틀린 문제부터 시작해서 그 부분만 틀어 봐.",
        "W: 그럼 오늘 밤에는 틀린 문제만 들어 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Mr. Jang이 Nayeon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Mr. Jang : ________________",
      lines: [
        [
          "W",
          "Mr. Jang is a third-year teacher, and Nayeon is in his class. " +
            "Nayeon has prepared thoroughly for her university interview next month. " +
            "She has written answers, practised them aloud, and asked three teachers to listen. " +
            "The difficulty is that she has now asked eleven different people for advice. " +
            "Each of them suggested a small change, and the answers no longer sound like her. " +
            "Mr. Jang does not think she should stop asking; that openness is one of her strengths. " +
            "The trouble is that an answer built from eleven opinions belongs to nobody. " +
            "He wants to tell her to choose two advisers and ignore the rest until the interview. " +
            "In this situation, what would Mr. Jang most likely say to Nayeon?",
        ],
      ],
      choices: [
        "Try practising your answers a little more slowly.",
        "Pick two people to advise you and stop asking the others.",
        "I think you should write completely new answers.",
        "You should ask more teachers before Friday.",
        "Let's postpone your interview practice this week.",
      ],
      answer: 2,
      clue: "He wants to tell her to choose two advisers and ignore the rest until the interview.",
      explanation:
        "장 선생님은 나연의 개방성을 문제 삼지 않으면서, 조언자를 두 명으로 정하고 나머지는 면접 때까지 듣지 말라고 말하려 한다. 따라서 ②가 가장 적절하다.",
      translation: [
        "W: 장 선생님은 3학년 교사이고, 나연이는 그 반 학생입니다. " +
          "나연이는 다음 달 대학 면접을 아주 꼼꼼히 준비했습니다. " +
          "답을 적고, 소리 내어 연습하고, 선생님 세 분께 들어 봐 달라고 했습니다. " +
          "문제는 이제 열한 사람에게 조언을 구했다는 점입니다. " +
          "저마다 조금씩 고치라고 했고, 이제 그 답은 나연이의 말처럼 들리지 않습니다. " +
          "장 선생님은 나연이가 묻기를 그만두기를 바라지 않습니다. 그 열린 태도는 강점입니다. " +
          "문제는 열한 사람의 의견으로 지은 답은 누구의 것도 아니라는 점입니다. " +
          "그래서 조언자를 두 명으로 정하고 면접 때까지 나머지는 듣지 말라고 말하고 싶습니다. " +
          "이런 상황에서 장 선생님이 나연이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "여자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about how messages travelled before wires."],
        ["W", "A kingdom is only as large as the distance a warning can cross in a day."],
        ["W", "Beacon fires were the fastest: a chain of hilltops, each watching the one behind it."],
        ["W", "Relay riders carried what fire could not, a sentence, by changing horses every twenty kilometres."],
        ["W", "Semaphore towers put two arms on a roof and spelled out letters an operator could read by telescope."],
        ["W", "Carrier pigeons went where no road did, and they only ever flew one way, towards home."],
        ["W", "Each method traded something away: speed for detail, or reach for reliability."],
        ["W", "Nobody had all three at once until the wire arrived, and that is what made it feel like magic."],
      ],
      choices: [
        "how letters are delivered today",
        "why kingdoms went to war",
        "the ways messages were sent before the telegraph",
        "how birds find their way home",
        "why telescopes were invented",
      ],
      answer: 3,
      clue: "Each method traded something away: speed for detail, or reach for reliability.",
      explanation:
        "여자는 봉화, 파발, 수기 신호탑, 전서구를 들며 전신 이전에 소식을 전하던 방법들을 설명한다. 따라서 주제는 ③이다.",
      translation: [
        "W: 안녕하세요. 오늘은 전선이 있기 전에 소식이 어떻게 오갔는지 이야기하려 합니다.",
        "W: 한 나라의 크기는 경보가 하루에 건널 수 있는 거리만큼입니다.",
        "W: 봉화가 가장 빨랐습니다. 산꼭대기를 이어 놓고 저마다 뒤쪽을 지켜보는 방식이지요.",
        "W: 파발은 불이 전할 수 없는 것, 곧 문장을 날랐습니다. 20킬로미터마다 말을 바꿔 가면서요.",
        "W: 수기 신호탑은 지붕에 팔 두 개를 달아 글자를 만들었고, 통신원이 망원경으로 읽었습니다.",
        "W: 전서구는 길이 없는 곳까지 갔지만, 오직 한 방향, 집으로만 날았습니다.",
        "W: 각 방법은 무언가를 내주었습니다. 자세함을 주고 빠르기를 얻거나, 안정성을 주고 거리를 얻었습니다.",
        "W: 세 가지를 한꺼번에 가진 사람은 전선이 오기 전까지 없었고, 그래서 그것이 마법처럼 느껴졌습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 것이 아닌 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about how messages travelled before wires."],
        ["W", "A kingdom is only as large as the distance a warning can cross in a day."],
        ["W", "Beacon fires were the fastest: a chain of hilltops, each watching the one behind it."],
        ["W", "Relay riders carried what fire could not, a sentence, by changing horses every twenty kilometres."],
        ["W", "Semaphore towers put two arms on a roof and spelled out letters an operator could read by telescope."],
        ["W", "Carrier pigeons went where no road did, and they only ever flew one way, towards home."],
        ["W", "Each method traded something away: speed for detail, or reach for reliability."],
        ["W", "Nobody had all three at once until the wire arrived, and that is what made it feel like magic."],
      ],
      choices: ["beacon fires", "relay riders", "semaphore towers", "signal drums", "carrier pigeons"],
      answer: 4,
      clue: "Carrier pigeons went where no road did, and they only ever flew one way, towards home.",
      explanation:
        "봉화, 파발, 수기 신호탑, 전서구는 언급되지만 신호용 북은 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
