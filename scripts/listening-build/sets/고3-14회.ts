/** 고3 듣기 14회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 14회",
  gradeLevel: "high3",
  speechSpeed: 0.8,
  folder: "고3 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good evening, parents and students. This is Mr. Ryu from the third-year office. " +
            "I am calling about the college application counselling that begins next week. " +
            "Until this year we booked those meetings by phone, and the line was busy for three days every November. " +
            "From Monday the booking moves entirely to the school website, under the career menu. " +
            "Each meeting lasts thirty minutes, and you may book one meeting per week. " +
            "Slots open at nine in the evening, exactly one week before the date you want. " +
            "If you cannot use the website at home, come to the third-year office and we will book it with you. " +
            "Please do not call the office to reserve a time; those calls can no longer be taken. Thank you.",
        ],
      ],
      choices: [
        "상담 시간이 늘어난 것을 알리려고",
        "진학 설명회 참석을 권하려고",
        "상담 예약 방법이 바뀐 것을 안내하려고",
        "원서 마감일을 알리려고",
        "상담 교사를 소개하려고",
      ],
      answer: 3,
      clue: "From Monday the booking moves entirely to the school website, under the career menu.",
      explanation:
        "전화로 받던 진학 상담 예약을 학교 누리집으로 옮긴다는 바뀐 방법을 알리고 있다. 따라서 말의 목적은 ③이다.",
      translation: [
        "M: 학부모님과 학생 여러분, 안녕하세요. 3학년부 류 선생님입니다. " +
          "다음 주에 시작하는 진학 상담에 대해 말씀드립니다. " +
          "올해까지는 전화로 상담을 예약했고, 해마다 11월이면 사흘 동안 전화가 통화 중이었습니다. " +
          "월요일부터 예약은 전부 학교 누리집 진로 메뉴로 옮깁니다. " +
          "상담은 한 번에 30분이고, 한 주에 한 번 예약할 수 있습니다. " +
          "예약 창은 원하는 날짜의 꼭 일주일 전 저녁 9시에 열립니다. " +
          "집에서 누리집을 쓰기 어려우시면 3학년 교무실로 오시면 함께 예약해 드립니다. " +
          "시간을 잡으려고 교무실로 전화하지는 말아 주세요. 그 전화는 이제 받지 않습니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Dohyun, are you rewriting your study plan again?"],
        ["M", "Not rewriting. I'm crossing things off it."],
        ["W", "Crossing off? You only wrote it on Sunday."],
        ["M", "And by Wednesday I was already two days behind."],
        ["W", "That happens to everyone. Just push it back."],
        ["M", "I did that in September, and by October the plan was a week behind every week."],
        ["W", "So what are you doing differently?"],
        ["M", "I write down only what fits in the hours I actually have, not the hours I wish I had."],
        ["W", "But then you cover less material."],
        ["M", "I cover less on paper and more in real life. A plan I can finish is the only kind that works."],
        ["W", "Maybe I should cut mine down too, then."],
      ],
      choices: [
        "계획은 매일 새로 세워야 한다",
        "공부 계획은 실제로 지킬 수 있는 분량으로 세워야 한다",
        "어려운 과목을 아침에 공부해야 한다",
        "계획은 친구와 함께 세우는 것이 좋다",
        "쉬는 시간을 충분히 넣어야 한다",
      ],
      answer: 2,
      clue: "I cover less on paper and more in real life. A plan I can finish is the only kind that works.",
      explanation:
        "남자는 바라는 시간이 아니라 실제로 있는 시간에 맞춰 지킬 수 있는 계획을 세워야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 도현아, 또 공부 계획을 다시 쓰는 거야?",
        "M: 다시 쓰는 게 아니라 지우는 거야.",
        "W: 지운다고? 일요일에 쓴 거잖아.",
        "M: 그런데 수요일에 벌써 이틀치가 밀렸어.",
        "W: 누구나 그래. 그냥 뒤로 미루면 되지.",
        "M: 9월에 그렇게 했는데, 10월에는 매주 일주일씩 밀려 있더라.",
        "W: 그럼 뭘 다르게 하는데?",
        "M: 있었으면 하는 시간 말고, 실제로 있는 시간에 들어가는 만큼만 적어.",
        "W: 그러면 진도가 줄잖아.",
        "M: 종이에서는 줄고 실제로는 늘어. 끝낼 수 있는 계획만이 통하는 계획이야.",
        "W: 그럼 나도 줄여야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "A question you cannot answer feels like a gap in what you know, and that is only half true. " +
            "Sometimes the gap is in the question. " +
            "Before you go looking for the answer, read the question once more and ask what it is actually asking for. " +
            "A number? A reason? A comparison? Many hours are lost answering a question nobody asked. " +
            "In an exam this costs marks; in a conversation it costs the other person's patience. " +
            "Understanding the question is not the step before the work. It is most of the work.",
        ],
      ],
      choices: [
        "모르는 것은 바로 물어보아야 한다",
        "답을 찾기 전에 문제가 무엇을 묻는지 먼저 파악해야 한다",
        "시험에서는 쉬운 문제부터 풀어야 한다",
        "질문은 짧게 하는 것이 좋다",
        "설명은 예를 들어 하는 것이 좋다",
      ],
      answer: 2,
      clue: "Understanding the question is not the step before the work. It is most of the work.",
      explanation:
        "답을 찾기 전에 문제가 무엇을 요구하는지 다시 읽고 파악하는 일이 작업의 대부분이라는 내용이다. 따라서 요지는 ②이다.",
      translation: [
        "W: 답할 수 없는 질문은 내가 모르는 부분처럼 느껴지지만, 그것은 절반만 맞습니다. " +
          "때로는 빈 곳이 질문 쪽에 있습니다. " +
          "답을 찾으러 가기 전에 질문을 한 번 더 읽고 무엇을 요구하는지 물어보세요. " +
          "숫자입니까? 이유입니까? 비교입니까? 아무도 묻지 않은 질문에 답하느라 많은 시간이 사라집니다. " +
          "시험에서는 점수를 잃고, 대화에서는 상대의 인내를 잃습니다. " +
          "질문을 이해하는 일은 작업 전의 단계가 아닙니다. 그것이 작업의 대부분입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Minseok, the third-year study room looks completely different now."],
        ["M", "We rearranged it during the holiday. What do you see first?"],
        ["W", "The wide clock above the door on the back wall."],
        ["M", "We moved it up so it's visible from every desk."],
        ["W", "On the left there's a locker unit with six doors."],
        ["M", "One for each class, for anything too heavy to carry home."],
        ["W", "In the middle I see four long desks in two rows."],
        ["M", "Two rows of two, so nobody sits facing a wall."],
        ["W", "By the window on the right, is that a water dispenser?"],
        ["M", "No, that's a vending machine. The dispenser is out in the corridor."],
        ["W", "I see. And next to the door there's a notice board with a calendar on it."],
        ["M", "The exam dates go up there as soon as they're announced."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, that's a vending machine. The dispenser is out in the corridor.",
      explanation:
        "남자는 창가에 있는 것이 정수기가 아니라 자동판매기라고 바로잡는다. 그림에는 정수기가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school study room seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "High on the back wall: one WIDE rectangular wall clock. " +
          "Left wall: a locker unit with exactly SIX doors, arranged in two rows of three. " +
          "Centre of the room: FOUR long study desks arranged in two rows of two. " +
          "By the window on the right: a tall WATER DISPENSER with a big upturned water bottle on top and a small tap. " +
          "Next to the door on the far right: a notice board with a blank month calendar grid pinned on it, no letters or numbers.",
      },
      translation: [
        "W: 민석아, 3학년 자습실이 완전히 달라졌네.",
        "M: 방학 동안 자리를 바꿨어. 뭐가 먼저 보여?",
        "W: 뒷벽 문 위에 있는 넓은 시계.",
        "M: 어느 자리에서든 보이라고 위로 올렸어.",
        "W: 왼쪽에는 문이 여섯 개인 사물함이 있고.",
        "M: 반마다 하나씩, 집에 들고 가기 무거운 걸 넣어 둬.",
        "W: 가운데에는 긴 책상이 두 줄로 네 개 보이네.",
        "M: 두 개씩 두 줄이야. 아무도 벽을 보고 앉지 않게.",
        "W: 오른쪽 창가에 있는 건 정수기야?",
        "M: 아니, 자동판매기야. 정수기는 복도에 있어.",
        "W: 그렇구나. 그리고 문 옆에는 달력이 붙은 게시판이 있고.",
        "M: 시험 날짜가 나오는 대로 거기에 붙여.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, the mock interview schedule has a problem."],
        ["W", "I sent it out yesterday. What's wrong with it?"],
        ["M", "Four students are down for the same slot on Thursday."],
        ["W", "The same slot? That can't be right."],
        ["M", "Two of them signed up twice, once in September and once last week."],
        ["W", "Ah, so they're counted twice in the list."],
        ["M", "Exactly. The real number is twenty-six, not twenty-eight."],
        ["W", "Then the last two slots are empty and nobody knows."],
        ["M", "Could you go through the list and remove the duplicates?"],
        ["W", "I'll clean it up this afternoon and send the corrected version."],
        ["M", "Thanks. Then I'll tell the two teachers about the free slots."],
      ],
      choices: [
        "면접 교사에게 연락하기",
        "신청자 명단에서 중복을 지우기",
        "면접실을 다시 예약하기",
        "학생들에게 문자 보내기",
        "면접 질문을 다시 만들기",
      ],
      answer: 2,
      clue: "I'll clean it up this afternoon and send the corrected version.",
      explanation:
        "여자는 오후에 명단에서 중복 신청을 지우고 고친 일정표를 보내기로 한다. 교사 연락은 남자가 맡았다. 따라서 답은 ②이다.",
      translation: [
        "M: 서연아, 모의 면접 일정표에 문제가 있어.",
        "W: 어제 보냈는데. 뭐가 잘못됐어?",
        "M: 목요일 같은 시간에 네 명이 잡혀 있어.",
        "W: 같은 시간에? 그럴 리가 없는데.",
        "M: 두 명이 9월에 한 번, 지난주에 한 번 두 번 신청했어.",
        "W: 아, 그래서 명단에 두 번 들어간 거구나.",
        "M: 그렇지. 실제 인원은 28명이 아니라 26명이야.",
        "W: 그럼 마지막 두 자리가 비어 있는데 아무도 모르는 거네.",
        "M: 명단 훑어서 중복 좀 지워 줄 수 있어?",
        "W: 오후에 정리해서 고친 걸 보낼게.",
        "M: 고마워. 그럼 나는 선생님 두 분께 빈자리 이야기를 할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good afternoon. Are you here to collect the printing?"],
        ["M", "Yes, the study booklets for our class."],
        ["W", "Twenty copies, wasn't it? They're seven dollars each."],
        ["M", "That's right. So one hundred and forty dollars."],
        ["W", "Correct. Would you like the covers laminated?"],
        ["M", "How much does that add?"],
        ["W", "One dollar per copy, and it does make them last longer."],
        ["M", "Then yes, all twenty."],
        ["W", "All right. And school orders get ten percent off the total."],
        ["M", "That helps. Can I take them now?"],
        ["W", "They're in the box by the door."],
        ["M", "Thank you. I'll pay by card."],
      ],
      choices: ["$126", "$140", "$144", "$154", "$160"],
      answer: 3,
      clue: "All right. And school orders get ten percent off the total.",
      explanation:
        "책자 7달러짜리 스무 권은 140달러이고, 코팅 1달러씩 스무 권을 더하면 160달러이다. 학교 주문 10퍼센트 할인을 빼면 144달러이므로 답은 ③이다.",
      translation: [
        "W: 안녕하세요. 인쇄물 찾으러 오셨나요?",
        "M: 네, 저희 반 학습 책자요.",
        "W: 스무 권 맞으시죠? 한 권에 7달러입니다.",
        "M: 맞습니다. 그럼 140달러네요.",
        "W: 맞습니다. 표지를 코팅해 드릴까요?",
        "M: 얼마나 더 드나요?",
        "W: 권당 1달러인데, 확실히 더 오래갑니다.",
        "M: 그럼 스무 권 다 해 주세요.",
        "W: 알겠습니다. 그리고 학교 주문은 전체 금액에서 10퍼센트 할인됩니다.",
        "M: 도움이 되네요. 지금 가져가도 되나요?",
        "W: 문 옆 상자에 있습니다.",
        "M: 감사합니다. 카드로 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 스터디 장소를 옮기려는 이유를 고르시오.",
      lines: [
        ["M", "Yerin, you want to move the study group out of the library?"],
        ["W", "I do, from next week if everyone agrees."],
        ["M", "Is it too expensive there? I thought it was free."],
        ["W", "It is free. That's not the problem."],
        ["M", "Then what? We've used that room since March."],
        ["W", "The library closes at eight now, and we always need until nine."],
        ["M", "Since when? It used to be ten."],
        ["W", "They cut the hours this month because of the staff schedule."],
        ["M", "So we lose an hour every session."],
        ["W", "Exactly. The community centre room is open until ten."],
      ],
      choices: [
        "이용료가 비싸서",
        "자리가 부족해서",
        "너무 시끄러워서",
        "문 닫는 시간이 빨라져서",
        "거리가 멀어서",
      ],
      answer: 4,
      clue: "The library closes at eight now, and we always need until nine.",
      explanation:
        "도서관이 이달부터 8시에 닫아 9시까지 쓰지 못하므로 장소를 옮기려 한다. 따라서 답은 ④이다.",
      translation: [
        "M: 예린아, 스터디를 도서관 밖으로 옮기고 싶다고?",
        "W: 응, 다들 괜찮으면 다음 주부터.",
        "M: 거기가 비싸? 무료인 줄 알았는데.",
        "W: 무료 맞아. 그게 문제가 아니야.",
        "M: 그럼 뭔데? 3월부터 그 방을 썼잖아.",
        "W: 도서관이 이제 8시에 닫는데 우리는 늘 9시까지 필요해.",
        "M: 언제부터? 원래 10시까지였잖아.",
        "W: 이번 달에 직원 근무 때문에 시간을 줄였대.",
        "M: 그럼 모일 때마다 한 시간씩 잃는 거네.",
        "W: 그렇지. 주민센터 방은 10시까지 열어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 논술 특강에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Chaewon, are you taking the essay class that starts next month?"],
        ["W", "I want to, but I only saw the title on the notice."],
        ["M", "It runs for six weeks, every Tuesday and Thursday evening."],
        ["W", "Evenings. How long is each session?"],
        ["M", "Ninety minutes, from seven to half past eight."],
        ["W", "Who teaches it?"],
        ["M", "A teacher from the Korean department and one outside lecturer."],
        ["W", "Is there a limit on how many can take it?"],
        ["M", "Twenty-four, and third years get the places first."],
        ["W", "Then I should be fine. I'll sign up tonight."],
        ["M", "Do it soon. Last year it closed in two days."],
      ],
      choices: ["진행 기간", "수업 시간", "담당 교사", "수강 인원", "제출 과제"],
      answer: 5,
      clue: "Twenty-four, and third years get the places first.",
      explanation:
        "기간(6주), 수업 시간(90분), 담당 교사(국어과 교사와 외부 강사), 수강 인원(24명)은 언급되지만 제출 과제는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 채원아, 다음 달에 시작하는 논술 특강 들을 거야?",
        "W: 듣고 싶은데 공지에서 제목만 봤어.",
        "M: 6주 동안 화요일이랑 목요일 저녁에 해.",
        "W: 저녁이구나. 한 번에 얼마나 해?",
        "M: 90분, 7시부터 8시 30분까지.",
        "W: 누가 가르쳐?",
        "M: 국어과 선생님 한 분이랑 외부 강사 한 분.",
        "W: 인원 제한이 있어?",
        "M: 24명, 3학년이 먼저 배정돼.",
        "W: 그럼 괜찮겠다. 오늘 밤에 신청할게.",
        "M: 빨리 해. 작년에는 이틀 만에 마감됐어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Open Lab Week에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is what you need to know about Open Lab Week at the city university. " +
            "It runs for five days, from the eleventh to the fifteenth of next month. " +
            "Nine laboratories take part, and each one opens for two hours in the afternoon. " +
            "High school students in their second and third years may apply, but each person may visit only one lab. " +
            "Applications are made through your school, not by the student, so speak to your homeroom teacher. " +
            "Lunch is not provided, so bring something with you or eat before you come. " +
            "The results of the selection are sent to schools on the fifth.",
        ],
      ],
      choices: [
        "다음 달 11일부터 15일까지 닷새 동안 열린다",
        "실험실마다 오후에 두 시간씩 연다",
        "한 사람이 한 곳만 방문할 수 있다",
        "학생이 직접 신청한다",
        "점심은 제공되지 않는다",
      ],
      answer: 4,
      clue: "Applications are made through your school, not by the student, so speak to your homeroom teacher.",
      explanation:
        "신청은 학생이 직접 하는 것이 아니라 학교를 통해 한다고 했다. 따라서 ④가 내용과 일치하지 않는다.",
      translation: [
        "W: 시립대학교 Open Lab Week에 관해 알아 두실 내용입니다. " +
          "다음 달 11일부터 15일까지 닷새 동안 진행됩니다. " +
          "아홉 개 실험실이 참여하고, 실험실마다 오후에 두 시간씩 엽니다. " +
          "고등학교 2학년과 3학년이 신청할 수 있고, 한 사람이 한 곳만 방문할 수 있습니다. " +
          "신청은 학생이 직접 하는 것이 아니라 학교를 통해 하니 담임 선생님과 상의하세요. " +
          "점심은 제공되지 않으니 준비해 오시거나 드시고 오세요. " +
          "선발 결과는 5일에 각 학교로 보냅니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 고를 인터넷 강좌를 고르시오.",
      lines: [
        ["W", "Junseo, these are the five online courses for the winter."],
        ["M", "Let's choose one. First, we both need the advanced level."],
        ["W", "Right, that takes out one of them straight away."],
        ["M", "Next, how many lectures are there? I can't get through more than thirty."],
        ["W", "Then another one is gone. Three left."],
        ["M", "Is there a workbook with any of them?"],
        ["W", "Two have one, and one doesn't. We need the questions."],
        ["M", "Two left, then. What do they cost?"],
        ["W", "We agreed on a hundred and fifty thousand won at the most."],
        ["M", "Then only one fits everything."],
        ["W", "I'll sign us both up this evening."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Then only one fits everything.",
      explanation:
        "기본 과정인 ②, 강의가 40개인 ③, 교재가 없는 ①을 뺀다. 남은 ④와 ⑤ 중 15만 원 이하인 것은 ⑤이므로 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "심화 / 24강 / 교재 없음 / 130,000원" },
          { no: 2, label: "②", value: "기본 / 20강 / 교재 있음 / 110,000원" },
          { no: 3, label: "③", value: "심화 / 40강 / 교재 있음 / 140,000원" },
          { no: 4, label: "④", value: "심화 / 28강 / 교재 있음 / 170,000원" },
          { no: 5, label: "⑤", value: "심화 / 30강 / 교재 있음 / 150,000원" },
        ],
      },
      translation: [
        "W: 준서야, 겨울에 들을 인터넷 강좌가 이 다섯 개야.",
        "M: 하나 고르자. 우선 둘 다 심화 과정이 필요해.",
        "W: 맞아, 그럼 하나가 바로 빠지네.",
        "M: 다음으로 강의가 몇 개야? 서른 개 넘으면 못 끝내.",
        "W: 그럼 하나 더 빠진다. 셋 남았어.",
        "M: 교재가 같이 오는 건 있어?",
        "W: 두 개는 있고 하나는 없어. 문제가 있어야 하잖아.",
        "M: 그럼 둘 남았네. 가격은?",
        "W: 15만 원까지로 정했잖아.",
        "M: 그럼 다 맞는 건 하나뿐이네.",
        "W: 오늘 저녁에 둘 다 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Did you get your transcript from the office?"],
        ["W", "Not yet. There was a long queue at lunchtime."],
        ["M", "Did you try the machine in the lobby?"],
        ["W", "I didn't know it printed transcripts."],
        ["M", "It does, and there's never anyone waiting."],
      ],
      choices: [
        "Then I'll use the machine tomorrow morning.",
        "The office closes at five today.",
        "I need three copies in total.",
        "My student card is in my bag.",
        "You should get yours printed too.",
      ],
      answer: 1,
      clue: "It does, and there's never anyone waiting.",
      explanation:
        "로비 기계로도 성적표를 뽑을 수 있고 줄도 없다는 말을 들었으므로, 내일 아침에 그 기계를 쓰겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 행정실에서 성적표 받았어?",
        "W: 아직. 점심시간에 줄이 길었어.",
        "M: 로비에 있는 기계는 써 봤어?",
        "W: 거기서 성적표가 나오는 줄 몰랐어.",
        "M: 나와. 그리고 거긴 기다리는 사람이 없어.",
        "W: 그럼 내일 아침에 그 기계를 써야겠다.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "You've been squinting at your screen all evening."],
        ["M", "The lecture videos are too small on my phone."],
        ["W", "Can't you watch them on a computer?"],
        ["M", "Mine broke last month and I haven't replaced it."],
        ["W", "The study room has four computers you can book for free."],
      ],
      choices: [
        "My phone screen is six inches.",
        "I watch two lectures a day.",
        "Then I'll book one for tomorrow.",
        "The videos are about an hour long.",
        "You should watch them with me.",
      ],
      answer: 3,
      clue: "The study room has four computers you can book for free.",
      explanation:
        "자습실 컴퓨터를 무료로 예약할 수 있다는 말을 들었으므로, 내일 것을 예약하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 저녁 내내 화면을 찡그리고 보네.",
        "M: 강의 영상이 휴대전화로는 너무 작아.",
        "W: 컴퓨터로 보면 안 돼?",
        "M: 지난달에 고장 났는데 아직 안 샀어.",
        "W: 자습실에 무료로 예약할 수 있는 컴퓨터가 네 대 있어.",
        "M: 그럼 내일 것으로 하나 예약할게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, how is the reading group going this term?"],
        ["M", "We meet every week, but the discussion dies after ten minutes."],
        ["W", "Dies how?"],
        ["M", "Everyone says the book was interesting, and then nobody has anything left."],
        ["W", "Do you decide what to talk about before you meet?"],
        ["M", "No. We just open the book and see what comes up."],
        ["W", "So six people arrive with nothing prepared."],
        ["M", "When you put it like that, it sounds hopeless."],
        ["W", "It isn't. Ask each person to bring one question in advance."],
        ["M", "Just one?"],
        ["W", "Six questions is an hour of talk, and nobody has to carry it alone."],
      ],
      choices: [
        "Then I'll ask everyone for one question next week.",
        "We read about eighty pages a week.",
        "I'll choose the next book myself.",
        "Our group has met since March.",
        "I'd rather read on my own from now on.",
      ],
      answer: 1,
      clue: "Six questions is an hour of talk, and nobody has to carry it alone.",
      explanation:
        "각자 질문을 하나씩 준비해 오게 하라는 조언을 들었으므로, 다음 주에 그렇게 부탁하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 태민아, 이번 학기 독서 모임은 잘돼 가?",
        "M: 매주 모이긴 하는데 10분이면 이야기가 끊겨.",
        "W: 어떻게 끊기는데?",
        "M: 다들 책이 재미있었다고 말하고 나면 더 할 말이 없어.",
        "W: 모이기 전에 무슨 이야기를 할지 정해?",
        "M: 아니. 그냥 책을 펴고 나오는 대로 이야기해.",
        "W: 그럼 여섯 명이 아무 준비 없이 오는 거네.",
        "M: 그렇게 말하니 가망 없게 들린다.",
        "W: 아니야. 각자 질문을 하나씩 준비해 오라고 해 봐.",
        "M: 하나만?",
        "W: 질문 여섯 개면 한 시간 분량이고, 아무도 혼자 끌지 않아도 돼.",
        "M: 그럼 다음 주에 다들 질문 하나씩 가져오라고 할게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Naeun, you said the practice tests are going badly again?"],
        ["W", "The scores are fine. It's the last twenty minutes that fall apart."],
        ["M", "What happens in the last twenty minutes?"],
        ["W", "I rush, I misread, and I lose marks on questions I can do."],
        ["M", "Where are you when the last twenty minutes start?"],
        ["W", "Usually around question thirty-five, with ten left."],
        ["M", "And how long did the first ten questions take you?"],
        ["W", "Almost half the time, I think. I check each one twice."],
        ["M", "So the easy ones are eating the time the hard ones need."],
        ["W", "I've never looked at it that way."],
        ["M", "Time the first ten separately next week and see how long they really take."],
      ],
      choices: [
        "I'll take two practice tests next week.",
        "Then I'll time the first ten questions on their own.",
        "The test has forty-five questions in total.",
        "I usually finish with five minutes left.",
        "My scores went up last month.",
      ],
      answer: 2,
      clue: "Time the first ten separately next week and see how long they really take.",
      explanation:
        "앞의 열 문제를 따로 시간을 재 보라는 조언을 들었으므로, 그렇게 하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나은아, 모의고사가 또 잘 안된다고 했지?",
        "W: 점수는 괜찮아. 마지막 20분이 무너져.",
        "M: 마지막 20분에 무슨 일이 생기는데?",
        "W: 서두르고, 잘못 읽고, 풀 수 있는 문제에서 점수를 잃어.",
        "M: 마지막 20분이 시작될 때 어디쯤 가 있어?",
        "W: 보통 35번쯤, 열 문제 남은 상태.",
        "M: 처음 열 문제에는 얼마나 걸렸는데?",
        "W: 거의 절반쯤 쓴 것 같아. 한 문제마다 두 번씩 확인하거든.",
        "M: 그럼 쉬운 문제가 어려운 문제에 필요한 시간을 먹고 있는 거네.",
        "W: 그렇게는 한 번도 안 봤어.",
        "M: 다음 주에는 앞의 열 문제만 따로 시간을 재서 실제로 얼마나 걸리는지 봐.",
        "W: 그럼 앞의 열 문제만 따로 재 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Ms. Kwon이 Jiho에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Ms. Kwon : ________________",
      lines: [
        [
          "M",
          "Ms. Kwon is a third-year homeroom teacher, and Jiho is one of her students. " +
            "Jiho has decided on the department he wants and has read a great deal about it. " +
            "He can name the professors, the courses and the buildings without looking anything up. " +
            "The difficulty is that he has written none of this into his application, which is due in nine days. " +
            "Every time he sits down to write, he opens another article and reads for two hours instead. " +
            "Ms. Kwon does not want him to stop reading; that knowledge is what makes him a strong candidate. " +
            "The trouble is that a reader who never writes has nothing to submit. " +
            "She wants to tell him to close the articles and write a rough draft first, however poor it is. " +
            "In this situation, what would Ms. Kwon most likely say to Jiho?",
        ],
      ],
      choices: [
        "You should read one more article before you write.",
        "I think you should choose a different department.",
        "Let's move your deadline to the end of the month.",
        "Close the articles and get a rough draft down first.",
        "Ask another teacher to check your reading list.",
      ],
      answer: 4,
      clue: "She wants to tell him to close the articles and write a rough draft first, however poor it is.",
      explanation:
        "권 선생님은 지호가 읽기를 그만두기를 바라는 것이 아니라, 우선 자료를 덮고 초고를 써 보라고 말하려 한다. 따라서 ④가 가장 적절하다.",
      translation: [
        "M: 권 선생님은 3학년 담임이고, 지호는 그 반 학생입니다. " +
          "지호는 가고 싶은 학과를 정했고 그에 관해 아주 많이 읽었습니다. " +
          "찾아보지 않고도 교수 이름과 과목, 건물까지 말할 수 있습니다. " +
          "문제는 그 내용을 원서에 한 줄도 쓰지 않았다는 점이고, 마감은 아흐레 뒤입니다. " +
          "쓰려고 앉을 때마다 다른 글을 열어 두 시간씩 읽고 맙니다. " +
          "권 선생님은 지호가 읽기를 그만두기를 바라지 않습니다. 그 지식이 지호의 강점입니다. " +
          "문제는 읽기만 하고 쓰지 않는 사람은 낼 것이 없다는 점입니다. " +
          "그래서 자료를 덮고 아무리 엉성해도 초고부터 쓰라고 말하고 싶습니다. " +
          "이런 상황에서 권 선생님이 지호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "남자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about how we learned to see the very small."],
        ["M", "For most of history, anything smaller than a grain of sand was simply invisible to us."],
        ["M", "The first simple microscope was a single curved lens, and it showed that pond water was full of living things."],
        ["M", "Adding a second lens made images larger, but blurred colour at the edges until makers combined two kinds of glass."],
        ["M", "Light itself then set the limit: nothing smaller than half a wavelength could ever be resolved."],
        ["M", "The electron microscope stepped around that wall by using electrons instead of light."],
        ["M", "Each of these steps began with a limit somebody refused to accept as final."],
        ["M", "What we call an instrument is really a record of those refusals."],
      ],
      choices: [
        "why scientists study pond water",
        "how glass is made and shaped",
        "the steps by which we learned to see very small things",
        "why light travels in waves",
        "how laboratories are organised today",
      ],
      answer: 3,
      clue: "Each of these steps began with a limit somebody refused to accept as final.",
      explanation:
        "남자는 단순 현미경, 두 개의 렌즈, 빛의 한계, 전자 현미경으로 이어지는 단계를 들며 작은 것을 보게 된 과정을 설명한다. 따라서 주제는 ③이다.",
      translation: [
        "M: 안녕하세요. 오늘은 우리가 아주 작은 것을 어떻게 보게 되었는지 이야기하려 합니다.",
        "M: 역사의 대부분 동안 모래알보다 작은 것은 우리에게 그저 보이지 않았습니다.",
        "M: 최초의 단순 현미경은 굽은 렌즈 하나였고, 연못물이 살아 있는 것들로 가득하다는 사실을 보여 주었습니다.",
        "M: 렌즈를 하나 더 붙이자 상은 커졌지만, 두 종류의 유리를 겹치기 전까지 가장자리 색이 번졌습니다.",
        "M: 그다음에는 빛 자체가 한계를 그었습니다. 파장의 절반보다 작은 것은 결코 구별할 수 없었습니다.",
        "M: 전자 현미경은 빛 대신 전자를 써서 그 벽을 돌아갔습니다.",
        "M: 이 단계들은 저마다 누군가가 최종이라고 받아들이기를 거부한 한계에서 시작되었습니다.",
        "M: 우리가 기구라고 부르는 것은 사실 그 거부들의 기록입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 것이 아닌 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about how we learned to see the very small."],
        ["M", "For most of history, anything smaller than a grain of sand was simply invisible to us."],
        ["M", "The first simple microscope was a single curved lens, and it showed that pond water was full of living things."],
        ["M", "Adding a second lens made images larger, but blurred colour at the edges until makers combined two kinds of glass."],
        ["M", "Light itself then set the limit: nothing smaller than half a wavelength could ever be resolved."],
        ["M", "The electron microscope stepped around that wall by using electrons instead of light."],
        ["M", "Each of these steps began with a limit somebody refused to accept as final."],
        ["M", "What we call an instrument is really a record of those refusals."],
      ],
      choices: ["a single curved lens", "two kinds of glass", "the wavelength of light", "electrons", "a glass mirror"],
      answer: 5,
      clue: "The electron microscope stepped around that wall by using electrons instead of light.",
      explanation:
        "굽은 렌즈 하나, 두 종류의 유리, 빛의 파장, 전자는 언급되지만 유리 거울은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
