/** 고3 듣기 15회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 15회",
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
          "Good evening, third-year students. This is Ms. Cho from the school library. " +
            "I am writing about the night study room that opens next Monday. " +
            "Last year we let students choose any seat, and the same eight seats by the window were taken every night. " +
            "This year every seat is assigned for a whole week at a time. " +
            "You apply once on the library page, and the list goes up on the door each Sunday evening. " +
            "If you cannot come on a night, tell us by five that afternoon so someone else can use the seat. " +
            "Two unreported absences and the seat goes back into the pool for the following week. " +
            "Applications open tomorrow at nine. Please read the notice before you apply. Thank you.",
        ],
      ],
      choices: [
        "야간 자습실 이용 시간을 늘리겠다고 알리려고",
        "야간 자습실 좌석 배정 방식을 안내하려고",
        "도서관 봉사자를 모집하려고",
        "자습실 예절을 당부하려고",
        "시험 일정을 알리려고",
      ],
      answer: 2,
      clue: "This year every seat is assigned for a whole week at a time.",
      explanation:
        "올해부터 야간 자습실 좌석을 일주일 단위로 배정하고 신청하는 방식으로 바뀐 것을 알리고 있다. 따라서 말의 목적은 ②이다.",
      translation: [
        "W: 3학년 학생 여러분, 안녕하세요. 도서관 조 선생님입니다. " +
          "다음 주 월요일에 문을 여는 야간 자습실에 대해 말씀드립니다. " +
          "작년에는 자리를 자유롭게 고르게 했는데, 창가 여덟 자리는 매일 밤 같은 학생들이 차지했습니다. " +
          "올해는 모든 자리를 한 주 단위로 배정합니다. " +
          "도서관 누리집에서 한 번 신청하면, 일요일 저녁마다 명단을 문에 붙입니다. " +
          "못 오는 날이 있으면 그날 오후 5시까지 알려 주세요. 다른 학생이 쓸 수 있습니다. " +
          "알리지 않고 두 번 빠지면 그 자리는 다음 주 배정 대상으로 돌아갑니다. " +
          "신청은 내일 9시에 시작합니다. 신청 전에 안내문을 꼭 읽어 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Jiyu, why do you close the book before you check the answer?"],
        ["W", "Because I want to see whether I can explain it without looking."],
        ["M", "Isn't it faster to read the solution and move on?"],
        ["W", "Faster, yes. That was my whole September."],
        ["M", "And what happened?"],
        ["W", "Every solution made sense while I read it, and none of them came back in the test."],
        ["M", "So reading a solution feels like understanding."],
        ["W", "It feels exactly like it. That's what makes it dangerous."],
        ["M", "Then how do you know you actually understand?"],
        ["W", "I say the steps out loud with the page shut. If I can't, I never knew it."],
        ["M", "I'll try that tonight, then."],
      ],
      choices: [
        "문제는 시간을 재고 풀어야 한다",
        "해설을 읽는 것과 이해하는 것은 다르므로 스스로 설명해 보아야 한다",
        "오답은 유형별로 모아야 한다",
        "문제집은 한 권을 여러 번 풀어야 한다",
        "어려운 문제는 건너뛰는 것이 낫다",
      ],
      answer: 2,
      clue: "I say the steps out loud with the page shut. If I can't, I never knew it.",
      explanation:
        "여자는 해설을 읽으면 이해한 것처럼 느껴질 뿐이므로 책을 덮고 스스로 설명해 보아야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 지유야, 왜 답을 확인하기 전에 책을 덮어?",
        "W: 보지 않고 설명할 수 있는지 보려고.",
        "M: 해설 읽고 넘어가는 게 빠르지 않아?",
        "W: 빠르지. 9월 내내 그렇게 했어.",
        "M: 그래서 어떻게 됐는데?",
        "W: 읽을 때는 해설이 다 이해됐는데, 시험에서는 하나도 안 떠올랐어.",
        "M: 해설을 읽는 게 이해한 느낌을 주는구나.",
        "W: 딱 그 느낌이야. 그래서 위험한 거고.",
        "M: 그럼 정말 이해했는지 어떻게 알아?",
        "W: 책을 덮고 풀이를 소리 내어 말해 봐. 못 하면 원래 몰랐던 거야.",
        "M: 그럼 오늘 밤에 해 봐야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "In the last month before an exam, students often stop doing the things that were working. " +
            "Sleep goes first, then meals, then the walk that used to clear the head. " +
            "The reasoning sounds solid: those hours could be study hours instead. " +
            "But the hours you take from sleep come back as hours you sit at the desk without reading anything. " +
            "The routine was not competing with your study; it was holding it up. " +
            "Cut the things that were never helping, and leave the frame standing. " +
            "A month is too short to rebuild a body that you took apart in week one.",
        ],
      ],
      choices: [
        "시험 전에는 새로운 문제집을 시작하지 말아야 한다",
        "공부 시간은 아침에 확보해야 한다",
        "시험이 가까울수록 생활 습관을 무너뜨리지 말아야 한다",
        "계획은 주 단위로 세우는 것이 좋다",
        "쉬는 시간에는 몸을 움직여야 한다",
      ],
      answer: 3,
      clue: "The routine was not competing with your study; it was holding it up.",
      explanation:
        "시험이 다가올수록 잠과 식사, 산책 같은 생활 습관을 없애기 쉬우나 그것이 공부를 떠받치고 있으므로 무너뜨리면 안 된다는 내용이다. 따라서 요지는 ③이다.",
      translation: [
        "M: 시험 전 마지막 한 달이 되면 학생들은 잘 되고 있던 것들을 그만둡니다. " +
          "먼저 잠이 사라지고, 다음에 식사가, 그다음에 머리를 식혀 주던 산책이 사라집니다. " +
          "이유는 그럴듯합니다. 그 시간을 공부에 쓸 수 있다는 것이지요. " +
          "그러나 잠에서 빼낸 시간은 아무것도 읽지 못한 채 책상에 앉아 있는 시간으로 돌아옵니다. " +
          "그 습관은 공부와 경쟁하던 것이 아니라 공부를 떠받치고 있던 것입니다. " +
          "애초에 도움이 되지 않던 것을 걷어 내고, 틀은 그대로 세워 두세요. " +
          "첫 주에 해체한 몸을 한 달 만에 다시 세우기에는 시간이 너무 짧습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Seoyeon, the third-year lounge looks completely different in this photo."],
        ["W", "We finished it during the holiday. What do you see first?"],
        ["M", "The wide noticeboard on the back wall."],
        ["W", "The admission dates go up there as soon as they're announced."],
        ["M", "On the left there's a bookcase with three shelves."],
        ["W", "Past students left their books for us to use."],
        ["M", "In the middle there's a long sofa with three cushions on it."],
        ["W", "Three is all we had. People still argue over the middle one."],
        ["M", "By the window on the right, is that a coffee machine?"],
        ["W", "No, it's a water dispenser. The coffee machine wasn't allowed."],
        ["M", "I see. And next to the door there's a tall floor lamp."],
        ["W", "The ceiling light is too bright at night, so we use that instead."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's a water dispenser. The coffee machine wasn't allowed.",
      explanation:
        "여자는 창가에 있는 것이 커피 기계가 아니라 정수기라고 바로잡는다. 그림에는 커피 기계가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school lounge seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "Centre of the back wall: one WIDE rectangular cork noticeboard with a few blank cards pinned on it. " +
          "Left wall: a short bookcase holding books on exactly THREE shelves. " +
          "Centre of the room: a LONG sofa with exactly THREE cushions resting on it. " +
          "By the window on the right: a COFFEE MACHINE standing on a small cabinet, with a cup under its spout. " +
          "Next to the door on the far right: a tall FLOOR LAMP with a cone shade on a thin pole.",
      },
      translation: [
        "M: 서연아, 사진 보니 3학년 휴게실이 완전히 달라졌다.",
        "W: 방학 동안 다 했어. 뭐가 먼저 보여?",
        "M: 뒷벽에 있는 넓은 게시판.",
        "W: 입시 일정이 나오는 대로 거기에 붙여.",
        "M: 왼쪽에는 세 칸짜리 책장이 있고.",
        "W: 졸업한 선배들이 두고 간 책이야.",
        "M: 가운데에는 쿠션이 세 개 놓인 긴 소파가 있네.",
        "W: 세 개밖에 없어. 아직도 가운데 자리로 다투곤 해.",
        "M: 오른쪽 창가에 있는 건 커피 기계야?",
        "W: 아니, 정수기야. 커피 기계는 허락이 안 났어.",
        "M: 그렇구나. 그리고 문 옆에는 키 큰 스탠드 조명이 있고.",
        "W: 천장 등이 밤에는 너무 밝아서 대신 그걸 써.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Minho, the alumni talk is next Wednesday and one thing still worries me."],
        ["M", "I thought the room and the speakers were settled."],
        ["W", "They are. It's the question time at the end."],
        ["M", "Last year nobody asked anything for four minutes."],
        ["W", "Exactly. And the two questions that came were both about university names."],
        ["M", "Which is what the speakers can't really answer."],
        ["W", "Right. If we collect questions beforehand, we can sort them."],
        ["M", "So we need a form open from tomorrow to Monday."],
        ["W", "Could you make one and put the link on the year-group page?"],
        ["M", "I'll set it up tonight and post the link before homeroom tomorrow."],
        ["W", "Thank you. Then I'll group whatever comes in on Monday evening."],
      ],
      choices: [
        "강연자에게 연락하기",
        "질문을 미리 받을 양식을 만들어 올리기",
        "강당을 예약하기",
        "질문을 분류하기",
        "안내문을 인쇄하기",
      ],
      answer: 2,
      clue: "I'll set it up tonight and post the link before homeroom tomorrow.",
      explanation:
        "남자는 질문을 미리 받을 양식을 만들어 학년 게시판에 올리기로 한다. 분류는 여자가 맡았다. 따라서 답은 ②이다.",
      translation: [
        "W: 민호야, 졸업생 강연이 다음 주 수요일인데 아직 걱정되는 게 하나 있어.",
        "M: 장소랑 강연자는 정해진 줄 알았는데.",
        "W: 그건 됐어. 끝날 때 질문 시간이 문제야.",
        "M: 작년에는 4분 동안 아무도 질문을 안 했지.",
        "W: 그래. 그리고 나온 두 질문은 둘 다 대학 이름을 묻는 거였고.",
        "M: 강연자들이 답하기 어려운 질문이지.",
        "W: 맞아. 미리 질문을 받아 두면 정리할 수 있어.",
        "M: 그럼 내일부터 월요일까지 열어 둘 양식이 필요하겠네.",
        "W: 네가 하나 만들어서 학년 게시판에 주소를 올려 줄 수 있어?",
        "M: 오늘 밤에 만들어서 내일 조회 전에 올릴게.",
        "W: 고마워. 그럼 월요일 저녁에 들어온 질문을 묶어 볼게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Good afternoon. Are you here about the graduation photos?"],
        ["W", "Yes, I'd like to order some prints from our class shoot last week."],
        ["M", "Of course. We have two sizes, small and large."],
        ["W", "How much is each of them?"],
        ["M", "Small prints are six dollars, and large prints are eleven dollars each."],
        ["W", "I'll take the large ones. One for me and three for my grandparents."],
        ["M", "Four large prints, then. That comes to forty-four dollars."],
        ["W", "And do you do frames as well?"],
        ["M", "We do. A simple wooden frame is nine dollars, and a metal one is fifteen."],
        ["W", "The wooden one, please, just for the biggest photo."],
        ["M", "All right. And any order over fifty dollars gets ten percent off the total."],
        ["W", "That's good news. When can I collect them?"],
        ["M", "Thursday afternoon, after three."],
        ["W", "Perfect. I'll pay by card now."],
      ],
      choices: ["$44.00", "$47.70", "$50.00", "$53.00", "$53.70"],
      answer: 2,
      clue: "All right. And any order over fifty dollars gets ten percent off the total.",
      explanation:
        "큰 인화본 11달러짜리 네 장은 44달러, 액자 9달러를 더하면 53달러이다. 50달러가 넘어 10퍼센트 할인을 받으면 47.70달러이므로 답은 ②이다.",
      translation: [
        "M: 안녕하세요. 졸업 사진 때문에 오셨나요?",
        "W: 네, 지난주 반 촬영본에서 인화를 좀 주문하려고요.",
        "M: 네. 작은 것과 큰 것 두 가지가 있습니다.",
        "W: 각각 얼마예요?",
        "M: 작은 인화본은 6달러, 큰 인화본은 한 장에 11달러입니다.",
        "W: 큰 걸로 할게요. 제 것 하나랑 조부모님 것 세 장이요.",
        "M: 그럼 큰 인화본 네 장이네요. 44달러입니다.",
        "W: 액자도 하시나요?",
        "M: 합니다. 기본 나무 액자는 9달러, 금속 액자는 15달러입니다.",
        "W: 나무 액자로 하나만요, 제일 큰 사진에 넣게요.",
        "M: 알겠습니다. 그리고 50달러가 넘는 주문은 전체에서 10퍼센트 할인됩니다.",
        "W: 잘됐네요. 언제 찾으러 오면 될까요?",
        "M: 목요일 오후 3시 이후입니다.",
        "W: 좋아요. 지금 카드로 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 독서 모임을 그만두려는 이유를 고르시오.",
      lines: [
        ["W", "Junseo, is it true you're leaving the reading group?"],
        ["M", "After this month, yes. I told them on Monday."],
        ["W", "Is it because of the books? You didn't like the last one."],
        ["M", "No, the books are fine. I'd read them anyway."],
        ["W", "Then why? You started the group in your first year."],
        ["M", "My mock exam is on the same Saturday morning from November."],
        ["W", "Every Saturday?"],
        ["M", "Every other Saturday, and that's when we meet."],
        ["W", "So half the meetings are gone before they start."],
        ["M", "Right. I'd rather leave than show up half the time."],
      ],
      choices: [
        "책 내용이 어려워서",
        "회원들과 맞지 않아서",
        "모임 시간과 시험이 겹쳐서",
        "다른 동아리에 들어가서",
        "몸이 아파서",
      ],
      answer: 3,
      clue: "Every other Saturday, and that's when we meet.",
      explanation:
        "11월부터 격주 토요일 오전 모의고사와 모임 시간이 겹친다. 따라서 답은 ③이다.",
      translation: [
        "W: 준서야, 독서 모임 그만둔다는 게 사실이야?",
        "M: 이번 달까지만. 월요일에 말했어.",
        "W: 책 때문이야? 지난번 책은 별로라고 했잖아.",
        "M: 아니, 책은 괜찮아. 어차피 읽을 책들이야.",
        "W: 그럼 왜? 1학년 때 네가 만든 모임이잖아.",
        "M: 11월부터 모의고사가 같은 토요일 오전에 있어.",
        "W: 매주 토요일?",
        "M: 격주 토요일, 그때가 우리 모임 시간이야.",
        "W: 그럼 모임의 절반은 시작도 못 하는 거네.",
        "M: 그래. 반만 나가느니 그만두는 게 나아.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 자기소개서 첨삭 주간에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Dohyun, have you booked a slot for the statement review week?"],
        ["M", "Not yet. I only know it's happening."],
        ["W", "It runs from the seventh to the eleventh, after the seventh period."],
        ["M", "Five days. How long is one session?"],
        ["W", "Twenty minutes each, one student at a time."],
        ["M", "Who does the reviewing?"],
        ["W", "Four teachers from the third-year office, and you can choose which one."],
        ["M", "And how do I book?"],
        ["W", "On the career page. Slots open two days before each date."],
        ["M", "Then I'll check it tonight."],
        ["W", "Do. They went in an hour last year."],
      ],
      choices: ["진행 기간", "상담 시간", "담당 교사", "신청 방법", "준비 서류"],
      answer: 5,
      clue: "On the career page. Slots open two days before each date.",
      explanation:
        "기간(7일~11일), 상담 시간(1인 20분), 담당 교사(3학년부 교사 네 명), 신청 방법(진로 누리집)은 언급되지만 준비 서류는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 도현아, 자기소개서 첨삭 주간 예약했어?",
        "M: 아직. 한다는 것만 알아.",
        "W: 7일부터 11일까지, 7교시 끝나고 해.",
        "M: 닷새구나. 한 번에 얼마나 해?",
        "W: 한 사람당 20분씩, 한 명씩 들어가.",
        "M: 누가 봐 주시는데?",
        "W: 3학년부 선생님 네 분, 누구한테 받을지 고를 수 있어.",
        "M: 신청은 어떻게 해?",
        "W: 진로 누리집에서. 날짜마다 이틀 전에 열려.",
        "M: 그럼 오늘 밤에 봐야겠다.",
        "W: 그래. 작년에는 한 시간 만에 다 찼어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Nara Science Essay Award에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is what you need to know about the Nara Science Essay Award. " +
            "It has been held every year since two thousand and nine, so this is the eighteenth one. " +
            "Students in their second and third years may enter, and each person submits one essay. " +
            "The essay must be between two and three thousand words, written in Korean or English. " +
            "Entries are sent through the school, not by the student, and the deadline is the last day of this month. " +
            "There is no theme this year, which is new; in past years a topic was given. " +
            "The results are announced on the foundation's website in January.",
        ],
      ],
      choices: [
        "2009년부터 해마다 열렸다",
        "2학년과 3학년이 참가할 수 있다",
        "한국어나 영어로 쓸 수 있다",
        "학생이 직접 제출한다",
        "올해는 주제가 정해져 있지 않다",
      ],
      answer: 4,
      clue: "Entries are sent through the school, not by the student, and the deadline is the last day of this month.",
      explanation:
        "제출은 학생이 직접 하는 것이 아니라 학교를 통해 한다고 했다. 따라서 ④가 내용과 일치하지 않는다.",
      translation: [
        "M: Nara Science Essay Award에 관해 알아 두셔야 할 내용입니다. " +
          "2009년부터 해마다 열려 올해가 열여덟 번째입니다. " +
          "2학년과 3학년 학생이 참가할 수 있고, 한 사람이 한 편을 냅니다. " +
          "글은 2천 낱말에서 3천 낱말 사이여야 하고, 한국어나 영어로 쓸 수 있습니다. " +
          "접수는 학생이 직접 하는 것이 아니라 학교를 통해 하며, 마감은 이달 마지막 날입니다. " +
          "올해는 주제를 정하지 않았는데, 이는 새로운 점입니다. 예전에는 주제가 주어졌습니다. " +
          "결과는 1월에 재단 누리집에 발표됩니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 독서실 자리를 고르시오.",
      lines: [
        ["W", "Taemin, these are the five seats left at the study centre."],
        ["M", "Let's choose. First, I need one that's open until midnight."],
        ["W", "Then one is out. It closes at ten."],
        ["M", "Next, I can't use an open desk. I need a closed booth."],
        ["W", "One of them is an open desk, so that's gone too."],
        ["M", "Three left. What do they cost a month?"],
        ["W", "We said a hundred and eighty thousand won at the most."],
        ["M", "Then one more is out. Two are left."],
        ["W", "Is either of them near the entrance? The door noise bothers you."],
        ["M", "One is beside the entrance, so not that one."],
        ["W", "Then it's decided. I'll register for you this evening."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "One is beside the entrance, so not that one.",
      explanation:
        "10시에 닫는 ⑤, 개방형 책상인 ①, 20만 원인 ④를 뺀다. 남은 ②와 ③ 중 입구에서 떨어진 자리는 ③이므로 답은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "개방형 / 밤 12시까지 / 150,000원 / 안쪽" },
          { no: 2, label: "②", value: "1인 부스 / 밤 12시까지 / 170,000원 / 입구 옆" },
          { no: 3, label: "③", value: "1인 부스 / 밤 12시까지 / 180,000원 / 안쪽" },
          { no: 4, label: "④", value: "1인 부스 / 밤 12시까지 / 200,000원 / 안쪽" },
          { no: 5, label: "⑤", value: "1인 부스 / 밤 10시까지 / 140,000원 / 안쪽" },
        ],
      },
      translation: [
        "W: 태민아, 독서실에 남아 있는 자리가 이 다섯 개야.",
        "M: 골라 보자. 우선 밤 12시까지 열리는 데여야 해.",
        "W: 그럼 하나가 빠지네. 10시에 닫아.",
        "M: 다음으로 개방형 책상은 안 돼. 1인 부스여야 해.",
        "W: 하나가 개방형이니까 그것도 빠져.",
        "M: 셋 남았다. 한 달에 얼마야?",
        "W: 18만 원까지로 정했잖아.",
        "M: 그럼 하나 더 빠진다. 둘 남았어.",
        "W: 둘 중에 입구 근처인 데 있어? 너 문소리 신경 쓰이잖아.",
        "M: 하나가 입구 옆이야, 그건 빼고.",
        "W: 그럼 정해졌네. 오늘 저녁에 등록해 줄게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Did you get the recommendation letter from Mr. Han?"],
        ["W", "Not yet. He said he needs my activity list first."],
        ["M", "Didn't you send it last week?"],
        ["W", "I sent it to his personal address by mistake."],
        ["M", "He only checks the school one during term."],
      ],
      choices: [
        "Then I'll resend it to his school address.",
        "The deadline is the fifteenth.",
        "I've asked two other teachers as well.",
        "My activity list is four pages long.",
        "You should ask him instead.",
      ],
      answer: 1,
      clue: "He only checks the school one during term.",
      explanation:
        "학기 중에는 학교 주소만 확인한다는 말을 들었으므로, 그쪽으로 다시 보내겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 한 선생님께 추천서 받았어?",
        "W: 아직. 활동 목록을 먼저 달라고 하셨어.",
        "M: 지난주에 보내지 않았어?",
        "W: 실수로 개인 주소로 보냈어.",
        "M: 학기 중에는 학교 주소만 확인하셔.",
        "W: 그럼 학교 주소로 다시 보낼게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "You've been carrying that folder of past papers everywhere."],
        ["M", "I keep needing one and it's always in the wrong pile."],
        ["W", "Haven't you sorted them by year?"],
        ["M", "They're in the order I printed them."],
        ["W", "Put a tab on each year. It takes ten minutes."],
      ],
      choices: [
        "I printed about sixty of them.",
        "Then I'll tab them tonight.",
        "The folder is too heavy already.",
        "I usually do one paper a day.",
        "You should borrow mine instead.",
      ],
      answer: 2,
      clue: "Put a tab on each year. It takes ten minutes.",
      explanation:
        "연도마다 색인을 붙이면 10분이면 된다는 말을 들었으므로, 오늘 밤에 붙이겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 기출 문제 서류철을 어디든 들고 다니네.",
        "M: 자꾸 한 장이 필요한데 늘 엉뚱한 더미에 있어.",
        "W: 연도별로 정리 안 했어?",
        "M: 인쇄한 순서 그대로야.",
        "W: 연도마다 색인을 붙여. 10분이면 돼.",
        "M: 그럼 오늘 밤에 붙일게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaerin, how is the peer tutoring going this term?"],
        ["W", "The three of them come every Tuesday, but nothing sticks."],
        ["M", "Nothing sticks how?"],
        ["W", "I explain a topic, they nod, and the next week it's gone."],
        ["M", "Do they write anything down while you explain?"],
        ["W", "No, I give them my notes at the end instead."],
        ["M", "So they watch you work for an hour and take home your handwriting."],
        ["W", "When you say it out loud it sounds pointless."],
        ["M", "Not pointless, just backwards. Let them hold the pen."],
        ["W", "Even if they're slower than me?"],
        ["M", "Especially then. Have one of them explain the last step to the others."],
      ],
      choices: [
        "Then I'll have them explain the last step next week.",
        "I'll print my notes for them again.",
        "We meet in the library on Tuesdays.",
        "Three students is too many for one hour.",
        "I'd rather tutor only one person.",
      ],
      answer: 1,
      clue: "Especially then. Have one of them explain the last step to the others.",
      explanation:
        "학생들이 직접 쓰고 마지막 단계를 설명하게 하라는 조언을 들었으므로, 다음 주에 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 채린아, 이번 학기 또래 학습은 잘돼 가?",
        "W: 세 명이 화요일마다 오는데 남는 게 없어.",
        "M: 어떻게 안 남는데?",
        "W: 내가 한 단원을 설명하면 고개를 끄덕이는데, 다음 주면 사라져 있어.",
        "M: 설명하는 동안 애들이 뭘 적기는 해?",
        "W: 아니, 대신 끝나고 내 필기를 줘.",
        "M: 그럼 한 시간 동안 네가 푸는 걸 보고 네 글씨를 들고 가는 거네.",
        "W: 소리 내어 들으니 의미 없게 들린다.",
        "M: 의미가 없는 게 아니라 순서가 거꾸로인 거야. 펜을 애들이 잡게 해.",
        "W: 나보다 느려도?",
        "M: 그럴 때일수록. 한 명이 마지막 단계를 다른 애들한테 설명하게 해 봐.",
        "W: 그럼 다음 주에는 애들이 마지막 단계를 설명하게 할게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Seungho, you said the English listening section is still your weak point?"],
        ["M", "Every practice test. I lose four or five in the same place."],
        ["W", "Which questions?"],
        ["M", "The long ones near the end, where two speakers argue about a plan."],
        ["W", "Do you listen to them again afterwards?"],
        ["M", "I check the answer and read the script."],
        ["W", "Reading the script is not listening, though."],
        ["M", "I know, but hearing it a second time feels like wasted time."],
        ["W", "It isn't. The script tells you what was said; only the audio tells you what you missed."],
      ],
      choices: [
        "Then I'll listen to those questions again without the script.",
        "I take one practice test every day.",
        "The listening section has seventeen questions.",
        "I'd rather focus on the reading part.",
        "My headphones broke last week.",
      ],
      answer: 1,
      clue: "It isn't. The script tells you what was said; only the audio tells you what you missed.",
      explanation:
        "대본을 읽는 것과 듣는 것은 다르므로 다시 들어 보라는 조언을 들었으므로, 대본 없이 다시 듣겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 승호야, 영어 듣기가 아직 약하다고 했지?",
        "M: 모의고사마다. 늘 같은 데서 네다섯 개를 잃어.",
        "W: 어떤 문제인데?",
        "M: 뒤쪽 긴 문제들, 두 사람이 계획을 두고 의견이 갈리는 거.",
        "W: 나중에 다시 들어 봐?",
        "M: 답 확인하고 대본을 읽어.",
        "W: 그런데 대본을 읽는 건 듣는 게 아니잖아.",
        "M: 알아, 그런데 두 번 듣는 건 시간 낭비 같아서.",
        "W: 아니야. 대본은 무슨 말이 나왔는지 알려 주지만, 네가 뭘 놓쳤는지는 소리만 알려 줘.",
        "M: 그럼 그 문제들을 대본 없이 다시 들어 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Ms. Lim이 Junhyuk에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Ms. Lim : ________________",
      lines: [
        [
          "W",
          "Ms. Lim is a third-year teacher, and Junhyuk is one of her students. " +
            "Junhyuk has been preparing for an interview at a university he has wanted since first year. " +
            "He has written out answers to forty likely questions and memorised every one of them. " +
            "In the practice interview, however, he recited an answer that did not match the question he was asked. " +
            "When Ms. Lim stopped him, he could not continue without going back to the first line. " +
            "She does not think he should prepare less; that preparation is why he knows his subject so well. " +
            "The trouble is that a memorised paragraph cannot bend, and interview questions always bend. " +
            "She wants to tell him to keep three key points per answer and speak from those instead. " +
            "In this situation, what would Ms. Lim most likely say to Junhyuk?",
        ],
      ],
      choices: [
        "You should write out ten more answers before Friday.",
        "Try to speak more slowly during the interview.",
        "I think you should apply to a different university.",
        "Keep three points for each answer and speak from those.",
        "Let's cancel the practice interview this week.",
      ],
      answer: 4,
      clue: "She wants to tell him to keep three key points per answer and speak from those instead.",
      explanation:
        "임 선생님은 준혁이의 준비량을 줄이라는 것이 아니라, 통째로 외운 답 대신 핵심 세 가지를 잡고 말하라고 조언하려 한다. 따라서 ④가 가장 적절하다.",
      translation: [
        "W: 임 선생님은 3학년 교사이고, 준혁이는 그 반 학생입니다. " +
          "준혁이는 1학년 때부터 가고 싶어 한 대학의 면접을 준비해 왔습니다. " +
          "예상 질문 마흔 개에 대한 답을 적어 전부 외웠습니다. " +
          "그런데 모의 면접에서 받은 질문과 맞지 않는 답을 그대로 외워 말했습니다. " +
          "임 선생님이 말을 끊자 첫 줄로 돌아가지 않고는 이어 가지 못했습니다. " +
          "임 선생님은 준혁이가 준비를 덜 해야 한다고 생각하지 않습니다. 그 준비 덕분에 내용을 잘 압니다. " +
          "문제는 통째로 외운 문단은 휘어지지 않는데 면접 질문은 늘 휘어진다는 점입니다. " +
          "그래서 답마다 핵심 세 가지만 잡고 거기서 말하라고 말하고 싶습니다. " +
          "이런 상황에서 임 선생님이 준혁이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "여자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about how we learned to keep food cold."],
        ["W", "For most of history, cold was something you found in winter and could not make."],
        ["W", "Ice houses came first: thick stone rooms packed with winter ice that lasted into July."],
        ["W", "Then came the ice trade, in which ships carried blocks cut from northern lakes to hot cities."],
        ["W", "The first mechanical fridge used ammonia, which cooled well and poisoned anyone it leaked on."],
        ["W", "Safer gases replaced it, and then those gases turned out to be thinning the ozone layer."],
        ["W", "Every solution here solved the previous problem and created the next one."],
        ["W", "That pattern, not the machine itself, is what the history of cooling is really about."],
      ],
      choices: [
        "why frozen food tastes different",
        "how people learned to keep food cold",
        "the history of shipping between cities",
        "why the ozone layer became thinner",
        "how winter ice forms on lakes",
      ],
      answer: 2,
      clue: "Good afternoon. Today I want to talk about how we learned to keep food cold.",
      explanation:
        "여자는 얼음 창고, 얼음 무역, 암모니아 냉장고, 대체 기체로 이어지는 과정을 들며 음식을 차게 보관해 온 역사를 설명한다. 따라서 주제는 ②이다.",
      translation: [
        "W: 안녕하세요. 오늘은 우리가 음식을 차게 보관하는 법을 어떻게 배웠는지 이야기하려 합니다.",
        "W: 역사의 대부분 동안 차가움은 겨울에 찾는 것이었지 만들 수 있는 것이 아니었습니다.",
        "W: 먼저 얼음 창고가 있었습니다. 겨울 얼음을 채운 두꺼운 돌방으로, 7월까지 버텼습니다.",
        "W: 그다음에는 얼음 무역이 왔습니다. 북쪽 호수에서 잘라 낸 얼음덩이를 배로 더운 도시까지 날랐습니다.",
        "W: 최초의 기계식 냉장고는 암모니아를 썼는데, 잘 식히기는 했지만 새면 사람을 중독시켰습니다.",
        "W: 더 안전한 기체가 그것을 대신했고, 이번에는 그 기체가 오존층을 얇게 만든다는 것이 드러났습니다.",
        "W: 여기서 모든 해법은 앞의 문제를 풀고 다음 문제를 만들었습니다.",
        "W: 냉각의 역사가 정말로 다루는 것은 기계 자체가 아니라 그 되풀이되는 모양입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 것이 아닌 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about how we learned to keep food cold."],
        ["W", "For most of history, cold was something you found in winter and could not make."],
        ["W", "Ice houses came first: thick stone rooms packed with winter ice that lasted into July."],
        ["W", "Then came the ice trade, in which ships carried blocks cut from northern lakes to hot cities."],
        ["W", "The first mechanical fridge used ammonia, which cooled well and poisoned anyone it leaked on."],
        ["W", "Safer gases replaced it, and then those gases turned out to be thinning the ozone layer."],
        ["W", "Every solution here solved the previous problem and created the next one."],
        ["W", "That pattern, not the machine itself, is what the history of cooling is really about."],
      ],
      choices: ["ice houses", "the ice trade", "ammonia", "the ozone layer", "salt"],
      answer: 5,
      clue: "The first mechanical fridge used ammonia, which cooled well and poisoned anyone it leaked on.",
      explanation:
        "얼음 창고, 얼음 무역, 암모니아, 오존층은 언급되지만 소금은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
