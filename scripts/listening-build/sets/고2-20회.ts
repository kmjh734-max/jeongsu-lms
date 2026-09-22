/** 고2 듣기 20회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 20회",
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
          "Good afternoon, everyone. This is Ms. Hyun from the library. " +
            "I want to tell you about the books you borrow for a report and return two days later. " +
            "Every term the same twenty or so books are borrowed and brought back almost unread. " +
            "Meanwhile the students who wanted them were told the books were out. " +
            "From next week those twenty titles move to a shelf marked 'room only'. " +
            "You may read them, copy from them and photograph a page, but they stay in the building. " +
            "Nothing else changes; every other book is borrowed exactly as before. " +
            "This is not about trusting anybody less. It is about the same book being read four times instead of once. " +
            "The shelf goes up on Monday. Thank you for listening.",
        ],
      ],
      choices: [
        "일부 책을 관내에서만 보게 한다고 안내하려고",
        "도서관 이용 시간이 바뀐다고 알리려고",
        "빌린 책을 빨리 반납하라고 하려고",
        "새로 들어온 책을 소개하려고",
        "도서 도우미를 모집하려고",
      ],
      answer: 1,
      clue: "From next week those twenty titles move to a shelf marked 'room only'.",
      explanation:
        "다음 주부터 자주 찾는 스무 권을 관내 열람 전용 서가로 옮긴다는 안내이다. 따라서 말의 목적은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 도서관 현 선생님입니다. " +
          "보고서 때문에 빌렸다가 이틀 뒤에 돌려주는 책에 대해 말씀드리려 합니다. " +
          "학기마다 같은 스무 권쯤이 빌려졌다가 거의 읽히지 않은 채로 돌아옵니다. " +
          "그동안 그 책이 필요했던 학생들은 대출 중이라는 말을 들었습니다. " +
          "다음 주부터 그 스무 권은 '관내 열람' 서가로 옮깁니다. " +
          "읽고, 옮겨 적고, 한 쪽을 찍어 가는 것은 되지만 건물 밖으로는 나가지 않습니다. " +
          "다른 것은 그대로입니다. 나머지 책은 예전과 똑같이 빌릴 수 있습니다. " +
          "누구를 덜 믿어서가 아닙니다. 같은 책을 한 번이 아니라 네 번 읽히게 하려는 것입니다. " +
          "서가는 월요일에 놓입니다. 들어 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junseo, you've started leaving your last problem unfinished on purpose. Why?"],
        ["M", "So that tomorrow has a door I already know how to open."],
        ["W", "That sounds like an excuse for stopping early."],
        ["M", "It would be, if I stopped before I knew what to do."],
        ["W", "What's the difference?"],
        ["M", "I stop when I know the next line but haven't written it."],
        ["W", "And that matters the next day?"],
        ["M", "It's the whole day. Before, I opened the book and spent twenty minutes remembering where I was."],
        ["W", "Twenty minutes just to start."],
        ["M", "Every single evening. Now I sit down and my hand already knows the first move."],
        ["W", "Doesn't it bother you to leave something half done?"],
        ["M", "It did for a week. Then I noticed I was finishing more, not less."],
        ["W", "Because the hard part isn't the problem."],
        ["M", "The hard part is the first five minutes. I moved those to the night before."],
        ["W", "Then I'll stop mid-problem tonight."],
      ],
      choices: [
        "공부는 끝까지 마무리해야 한다",
        "다음에 할 것을 아는 채로 멈추면 시작이 쉬워진다",
        "공부 시간을 늘려야 한다",
        "어려운 문제는 미뤄 두는 것이 좋다",
        "계획은 하루 단위로 세워야 한다",
      ],
      answer: 2,
      clue: "The hard part is the first five minutes. I moved those to the night before.",
      explanation:
        "남자는 다음에 쓸 줄을 아는 채로 멈추면 다음 날 시작하는 데 드는 시간이 사라진다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 준서야, 마지막 문제를 일부러 안 끝내고 두기 시작했더라. 왜?",
        "M: 내일이 이미 여는 법을 아는 문을 하나 갖게 하려고.",
        "W: 그냥 일찍 그만두려는 핑계 같은데.",
        "M: 뭘 할지 모르는 채로 멈춘다면 그렇겠지.",
        "W: 뭐가 다른데?",
        "M: 다음 줄을 아는데 아직 안 쓴 상태에서 멈춰.",
        "W: 그게 다음 날에 그렇게 중요해?",
        "M: 하루가 걸려 있어. 예전엔 책을 펴고 어디까지 했는지 떠올리는 데 20분을 썼어.",
        "W: 시작하는 데만 20분.",
        "M: 저녁마다 그랬어. 지금은 앉으면 손이 첫 수를 이미 알아.",
        "W: 반쯤 하다 두는 게 찜찜하지 않아?",
        "M: 일주일은 찜찜했어. 그러다 오히려 더 많이 끝내고 있다는 걸 알았지.",
        "W: 어려운 건 문제가 아니라서.",
        "M: 어려운 건 처음 5분이야. 그 5분을 전날 밤으로 옮긴 거지.",
        "W: 그럼 나도 오늘 밤엔 문제 중간에 멈춰 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "A rule and a habit look the same from outside, and they behave completely differently under pressure. " +
            "A rule is something you decide again each time, and deciding costs you something every time you do it. " +
            "On an ordinary day the cost is invisible. On a tired day it is the whole difference. " +
            "This is why people who 'try to study every evening' stop in November and people who study at seven do not. " +
            "The second group is not stronger. They removed the decision, so there is nothing left to give up. " +
            "Build the thing that does not need you to choose, and save your choosing for what is actually new.",
        ],
      ],
      choices: [
        "규칙은 엄하게 지켜야 한다",
        "습관은 바꾸기 어렵다",
        "의지가 강한 사람이 끝까지 간다",
        "계획은 남에게 말해 두는 것이 좋다",
        "고르지 않아도 되게 만들어 두면 지친 날에도 무너지지 않는다",
      ],
      answer: 5,
      clue: "They removed the decision, so there is nothing left to give up.",
      explanation:
        "매번 결정해야 하는 규칙은 지친 날 무너지고, 결정을 없앤 사람은 그대로 간다는 내용이다. 따라서 요지는 ⑤이다.",
      translation: [
        "W: 규칙과 습관은 밖에서 보면 같아 보이지만, 힘들 때 완전히 다르게 움직입니다. " +
          "규칙은 그때마다 다시 정하는 것이고, 정하는 일에는 매번 값이 듭니다. " +
          "보통 날에는 그 값이 보이지 않습니다. 지친 날에는 그 값이 전부를 가릅니다. " +
          "'저녁마다 공부하려고 노력하는' 사람이 11월에 멈추고, '7시에 공부하는' 사람이 멈추지 않는 까닭이 그것입니다. " +
          "뒤쪽 사람이 더 강한 것이 아닙니다. 결정을 없앴기에 포기할 것이 남아 있지 않은 것입니다. " +
          "고르지 않아도 되는 것을 만들어 두고, 고르는 힘은 정말로 새로운 일에 쓰십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Chaerin, the student council room looks much better now."],
        ["W", "We tidied it during the holiday. What do you see?"],
        ["M", "On the back wall there's a wide whiteboard."],
        ["W", "We write the month's jobs on it and rub them out as they're done."],
        ["M", "On the left there's a tall shelf with four boxes on it."],
        ["W", "One box for each year, and one for things nobody claims."],
        ["M", "In the middle there's a long table with chairs around it."],
        ["W", "That's where the weekly meeting happens."],
        ["M", "By the window on the right, is that a printer?"],
        ["W", "No, it's a paper cutter. The printer is in the office."],
        ["M", "I see. And beside the door there's a tall coat stand."],
        ["W", "It was the first thing we brought in. Nobody puts coats on chairs now."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "No, it's a paper cutter. The printer is in the office.",
      explanation:
        "여자는 창가에 있는 것이 인쇄기가 아니라 재단기라고 바로잡는다. 그림에는 인쇄기가 그려져 있으므로 ④가 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A school student council room seen from the front, clean black line art on a plain white background, five things clearly separated with wide empty space between them and none overlapping, no writing or letters anywhere. " +
          "High on the back wall in the centre: a WIDE WHITEBOARD with a plain empty face and a narrow tray along its bottom edge. " +
          "On the far left of the floor: a TALL SHELF holding exactly FOUR closed storage boxes, one above another. " +
          "In the centre of the floor: a LONG TABLE with chairs around it. " +
          "By a window on the right: a PRINTER, a boxy machine with a paper tray sticking out of the front, standing on a low stand. " +
          "Beside the door on the far right: a TALL COAT STAND, a thin pole on a round base with hooks at the top.",
      },
      translation: [
        "M: 채린아, 학생회실이 훨씬 나아졌네.",
        "W: 방학 동안 정리했어. 뭐가 보여?",
        "M: 뒷벽에 넓은 화이트보드가 있네.",
        "W: 이달 할 일을 적어 두고 끝나면 지워.",
        "M: 왼쪽에는 상자 네 개가 놓인 키 큰 선반이 있고.",
        "W: 학년마다 하나씩, 그리고 주인 없는 물건용으로 하나.",
        "M: 가운데에는 긴 탁자에 의자가 둘러 있네.",
        "W: 거기서 주간 회의를 해.",
        "M: 오른쪽 창가에 있는 건 인쇄기야?",
        "W: 아니, 재단기야. 인쇄기는 행정실에 있어.",
        "M: 그렇구나. 그리고 문 옆에는 키 큰 옷걸이가 있고.",
        "W: 제일 먼저 들인 거야. 이제 아무도 의자에 외투를 안 걸어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taemin, there's a problem with the field trip permission slips."],
        ["M", "I collected twenty-eight of them yesterday. What's wrong?"],
        ["W", "The meeting point says the front gate, but the coach parks at the side gate."],
        ["M", "So twenty-eight families will be at the wrong gate at seven in the morning."],
        ["W", "In the dark, in November."],
        ["M", "Can we put someone at the front gate to send people round?"],
        ["W", "We'd need two people and we'd still lose ten minutes."],
        ["M", "Then I'll send a message to every family tonight with the right gate."],
        ["W", "Put the side gate in the first line. Nobody reads the second."],
        ["M", "I'll write it after dinner and send it before nine."],
        ["W", "Thanks. I'll ask the coach company to confirm the side gate in writing."],
      ],
      choices: [
        "신청서를 다시 걷기",
        "정문에 사람을 세우기",
        "버스 회사에 확인받기",
        "가정에 문자로 장소를 알리기",
        "출발 시각을 늦추기",
      ],
      answer: 4,
      clue: "Then I'll send a message to every family tonight with the right gate.",
      explanation:
        "남자는 오늘 밤에 모든 가정에 문자로 맞는 문을 알리기로 한다. 버스 회사 확인은 여자가 맡았다. 따라서 답은 ④이다.",
      translation: [
        "W: 태민아, 현장 학습 동의서에 문제가 있어.",
        "M: 어제 스물여덟 장 걷었는데. 뭐가 잘못됐어?",
        "W: 모이는 곳이 정문으로 적혀 있는데 버스는 옆문에 서.",
        "M: 그럼 스물여덟 가정이 아침 7시에 엉뚱한 문에 서 있겠네.",
        "W: 어두운 11월에.",
        "M: 정문에 사람을 세워서 돌려보내면 안 될까?",
        "W: 두 명이 필요하고 그래도 10분은 까먹어.",
        "M: 그럼 오늘 밤에 모든 가정에 맞는 문을 문자로 보낼게.",
        "W: 첫 줄에 옆문을 써. 둘째 줄은 아무도 안 읽어.",
        "M: 저녁 먹고 써서 9시 전에 보낼게.",
        "W: 고마워. 나는 버스 회사에 옆문 맞다고 글로 확인받을게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the bookshop. What can I help you find?"],
        ["W", "A workbook and some past paper collections for the exam."],
        ["M", "We have two workbooks for second years. The basic one is twelve dollars and the advanced one is twenty-four."],
        ["W", "The basic one, please. I want to get the easy questions right first."],
        ["M", "A sensible order. And the past paper collections are ten dollars each."],
        ["W", "Two of them, please."],
        ["M", "Twelve for the workbook and twenty for the collections. That comes to thirty-two dollars."],
        ["W", "Do you give a student discount?"],
        ["M", "We do. Five dollars off the total with a student card."],
        ["W", "Here it is, and here's my card."],
        ["M", "Thank you. Would you like a set of index tabs as well? They're three dollars."],
        ["W", "No, thank you. I have some at home."],
      ],
      choices: ["$24", "$27", "$30", "$32", "$35"],
      answer: 2,
      clue: "We do. Five dollars off the total with a student card.",
      explanation:
        "기본 문제집 12달러와 기출문제집 10달러짜리 두 권 20달러를 더하면 32달러이다. 학생 할인 5달러를 빼면 27달러이고 색인 스티커는 사지 않았으므로 답은 ②이다.",
      translation: [
        "M: 서점입니다. 무엇을 찾으세요?",
        "W: 시험에 쓸 문제집 한 권이랑 기출문제집이요.",
        "M: 2학년용 문제집은 두 가지입니다. 기본은 12달러, 심화는 24달러입니다.",
        "W: 기본으로요. 쉬운 것부터 확실히 맞히고 싶어서요.",
        "M: 순서가 좋으시네요. 기출문제집은 한 권에 10달러입니다.",
        "W: 두 권 주세요.",
        "M: 문제집 12달러에 기출 20달러, 모두 32달러입니다.",
        "W: 학생 할인 있나요?",
        "M: 있습니다. 학생증이 있으면 전체 금액에서 5달러 할인됩니다.",
        "W: 여기 있고요, 카드도 여기요.",
        "M: 고맙습니다. 색인 스티커도 하시겠어요? 3달러입니다.",
        "W: 아니요, 괜찮아요. 집에 있어요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 학교 신문을 그만두려는 이유를 고르시오.",
      lines: [
        ["M", "Nayeon, are you really leaving the school newspaper?"],
        ["W", "After this issue. I told the teacher on Monday."],
        ["M", "Is it the writing? Your last piece took three weeks."],
        ["W", "I like the writing. That's not it."],
        ["M", "Then why? You've been on it for two years."],
        ["W", "The deadline moved to the last Friday of the month."],
        ["M", "And that's a problem?"],
        ["W", "That's the week of the monthly test, every single month."],
        ["M", "So you'd be writing the night before the test."],
        ["W", "Every month until February. I'd rather leave than hand in something I'm not proud of."],
      ],
      choices: [
        "글쓰기가 어려워서",
        "부원들과 맞지 않아서",
        "마감이 시험 주간과 겹쳐서",
        "다른 동아리에 들어가서",
        "선생님과 의견이 달라서",
      ],
      answer: 3,
      clue: "That's the week of the monthly test, every single month.",
      explanation:
        "마감이 매달 마지막 금요일로 옮겨져 월례 시험 주간과 겹친다. 따라서 답은 ③이다.",
      translation: [
        "M: 나연아, 정말 학교 신문 그만둬?",
        "W: 이번 호까지만. 월요일에 선생님께 말씀드렸어.",
        "M: 글쓰기가 힘들어서야? 지난번 글은 3주 걸렸잖아.",
        "W: 글 쓰는 건 좋아해. 그건 아니야.",
        "M: 그럼 왜? 2년이나 했잖아.",
        "W: 마감이 매달 마지막 금요일로 옮겨졌어.",
        "M: 그게 문제야?",
        "W: 그 주가 매달 월례 시험 주간이야.",
        "M: 그럼 시험 전날 밤에 글을 쓰게 되네.",
        "W: 2월까지 매달. 부끄러운 글을 내느니 그만두는 게 나아.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 수학 경시대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Sohee, have you seen the notice about the maths contest?"],
        ["W", "I saw it but I assumed it was for the top class only."],
        ["M", "That's what everyone assumes, and it isn't."],
        ["W", "Anyone can enter?"],
        ["M", "Anyone in second year. That's the only condition."],
        ["W", "All right, I'm listening. How does it work?"],
        ["M", "Twelve questions in ninety minutes, and you may use a calculator for the last four."],
        ["W", "A calculator? That's unusual."],
        ["M", "Those four are about reading a graph, not about arithmetic."],
        ["W", "That actually sounds interesting. When is it?"],
        ["M", "The first Saturday of next month, in the morning."],
        ["W", "A Saturday morning. Where do we go?"],
        ["M", "The second-floor exam room, the one with the separate desks."],
        ["W", "Then I might enter after all. When do entries close?"],
        ["M", "Thursday, and there's no limit on numbers."],
      ],
      choices: ["참가 자격", "진행 방식", "열리는 날", "장소", "시상 내용"],
      answer: 5,
      clue: "The second-floor exam room, the one with the separate desks.",
      explanation:
        "참가 자격(2학년 누구나), 진행 방식(90분 12문항, 마지막 네 문항은 계산기 사용), 날짜(다음 달 첫째 토요일 오전), 장소(2층 고사실)는 언급되지만 시상 내용은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 소희야, 수학 경시대회 공지 봤어?",
        "W: 보긴 했는데 상위권만 나가는 줄 알았어.",
        "M: 다들 그렇게 생각하는데 아니야.",
        "W: 누구나 나갈 수 있어?",
        "M: 2학년이면 누구나. 조건은 그것뿐이야.",
        "W: 알겠어, 들어 볼게. 어떻게 진행돼?",
        "M: 90분에 열두 문항, 마지막 네 문항은 계산기를 써도 돼.",
        "W: 계산기? 특이하네.",
        "M: 그 네 문항은 계산이 아니라 그래프 읽기야.",
        "W: 그건 좀 재밌겠다. 언제 하는데?",
        "M: 다음 달 첫째 토요일 오전.",
        "W: 토요일 오전. 어디로 가?",
        "M: 2층 고사실, 책상이 떨어져 있는 그 방.",
        "W: 그럼 나갈까 싶기도 하네. 접수는 언제까지야?",
        "M: 목요일까지, 인원 제한은 없어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Mureung Forest Camp에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is what you should know about Mureung Forest Camp, which has run on the north side of the mountain for twelve years. " +
            "It takes students in the summer only, for three nights at a time. " +
            "There is no electricity in the sleeping huts, and phones are kept at the office until the last morning. " +
            "Meals are cooked by the students themselves in groups of six. " +
            "Anyone in middle or high school may apply, and places are given by lottery rather than first come. " +
            "The camp is free, but you pay for your own bus ticket to the village at the foot of the mountain.",
        ],
      ],
      choices: [
        "12년째 운영되고 있다",
        "여름에만 학생을 받는다",
        "잠자는 곳에 전기가 없다",
        "자리는 먼저 신청한 순서대로 준다",
        "참가비는 없다",
      ],
      answer: 4,
      clue: "Anyone in middle or high school may apply, and places are given by lottery rather than first come.",
      explanation:
        "자리는 선착순이 아니라 추첨으로 준다고 했다. 따라서 ④가 내용과 일치하지 않는다.",
      translation: [
        "M: 산 북쪽에서 12년째 이어 온 Mureung Forest Camp를 소개합니다. " +
          "여름에만 학생을 받고, 한 번에 3박을 합니다. " +
          "잠자는 오두막에는 전기가 없고, 휴대전화는 마지막 날 아침까지 사무실에 맡깁니다. " +
          "밥은 여섯 명씩 모둠을 지어 학생들이 직접 지어 먹습니다. " +
          "중·고등학생이면 누구나 신청할 수 있고, 자리는 선착순이 아니라 추첨으로 정합니다. " +
          "참가비는 없지만, 산 아래 마을까지 가는 버스표는 각자 부담합니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 체험을 고르시오.",
      lines: [
        ["W", "Dohun, these are the five one-day programmes still open."],
        ["M", "Let's pick one. I can't do Sunday because of my grandmother."],
        ["W", "Right, that takes out one of them."],
        ["M", "Next, how long are they? Over five hours is too much for one day."],
        ["W", "Then one more is gone. Three are left."],
        ["M", "What do they cost?"],
        ["W", "We said forty thousand won at the most."],
        ["M", "Then one more drops out. Two left."],
        ["W", "Do either of them count towards the school activity record?"],
        ["M", "Only one does, and I need one more this year."],
        ["W", "Then that's the one. I'll book both places tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 1,
      clue: "Then that's the one. I'll book both places tonight.",
      explanation:
        "일요일인 ②, 6시간인 ③, 50,000원인 ⑤를 뺀다. 남은 ①과 ④ 중 활동 실적이 인정되는 것은 ①이므로 답은 ①이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "토요일 / 4시간 / 40,000원 / 실적 인정" },
          { no: 2, label: "②", value: "일요일 / 4시간 / 35,000원 / 실적 인정" },
          { no: 3, label: "③", value: "토요일 / 6시간 / 35,000원 / 실적 인정" },
          { no: 4, label: "④", value: "토요일 / 3시간 / 30,000원 / 실적 없음" },
          { no: 5, label: "⑤", value: "토요일 / 4시간 / 50,000원 / 실적 인정" },
        ],
      },
      translation: [
        "W: 도훈아, 아직 자리가 있는 하루 체험이 이 다섯 개야.",
        "M: 하나 고르자. 할머니 때문에 일요일은 안 돼.",
        "W: 맞다, 그럼 하나가 빠지네.",
        "M: 다음으로 몇 시간짜리야? 하루에 다섯 시간 넘으면 무리야.",
        "W: 그럼 하나 더 빠진다. 세 개 남았어.",
        "M: 얼마야?",
        "W: 4만 원까지로 정했잖아.",
        "M: 그럼 하나 더 빠지고 둘 남았다.",
        "W: 둘 중에 학교 활동 실적으로 인정되는 게 있어?",
        "M: 한 곳만. 올해 하나가 더 필요해.",
        "W: 그럼 거기로 하자. 오늘 밤에 두 자리 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you booked the practice room for Thursday?"],
        ["M", "Not yet. The list outside the music room was full."],
        ["W", "Did you check the second list for after five?"],
        ["M", "I didn't know there was a second one."],
        ["W", "It goes up every Monday, and it's almost empty."],
      ],
      choices: [
        "The room has two pianos.",
        "Practice takes about an hour.",
        "Then I'll write my name on it now.",
        "Thursday is my busiest day.",
        "You should book one as well.",
      ],
      answer: 3,
      clue: "It goes up every Monday, and it's almost empty.",
      explanation:
        "5시 이후 두 번째 명단이 거의 비어 있다는 말을 들었으므로, 지금 이름을 적겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 목요일 연습실 예약했어?",
        "M: 아직. 음악실 앞 명단이 꽉 찼더라.",
        "W: 5시 이후 두 번째 명단은 봤어?",
        "M: 두 번째가 있는 줄 몰랐어.",
        "W: 월요일마다 붙는데 거의 비어 있어.",
        "M: 그럼 지금 가서 이름 적을게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "You've been carrying your laptop home every night."],
        ["W", "All my notes are on it and I work on them after dinner."],
        ["M", "Have you tried keeping them in the shared folder instead?"],
        ["W", "Wouldn't everyone be able to see them?"],
        ["M", "You can make a private one. It takes about a minute."],
      ],
      choices: [
        "My laptop is quite heavy.",
        "Then I'll make one tonight.",
        "I take notes in three subjects.",
        "The folder is on the school site.",
        "You should carry yours too.",
      ],
      answer: 2,
      clue: "You can make a private one. It takes about a minute.",
      explanation:
        "나만 보는 폴더를 1분이면 만들 수 있다는 말을 들었으므로, 오늘 밤에 만들겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 매일 밤 노트북을 집에 들고 가네.",
        "W: 필기가 다 거기 있어서, 저녁 먹고 그걸로 해.",
        "M: 대신 공유 폴더에 두는 건 해 봤어?",
        "W: 그러면 다들 볼 수 있지 않아?",
        "M: 나만 보는 폴더를 만들 수 있어. 1분이면 돼.",
        "W: 그럼 오늘 밤에 하나 만들게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junho, how is the club's new member training going?"],
        ["M", "Badly. Three of the five new people have stopped coming."],
        ["W", "What happens at a session?"],
        ["M", "I explain how everything works for the first hour."],
        ["W", "The whole first hour is you talking?"],
        ["M", "There's a lot they need to know before they can start."],
        ["W", "Is there, though? What did you need on your first day?"],
        ["M", "One thing, probably. Where to stand."],
        ["W", "And you got the rest by doing it."],
        ["M", "I'd forgotten that completely."],
        ["W", "Teach them one thing and let them try it in the first ten minutes."],
      ],
      choices: [
        "Then I'll cut it to one thing next time.",
        "The club meets twice a week.",
        "Five people joined in March.",
        "I've been in the club for two years.",
        "You should come and watch a session.",
      ],
      answer: 1,
      clue: "Teach them one thing and let them try it in the first ten minutes.",
      explanation:
        "한 가지만 가르치고 처음 10분 안에 해 보게 하라는 조언을 들었으므로, 다음엔 한 가지로 줄이겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 준호야, 동아리 신입 교육은 잘돼 가?",
        "M: 잘 안돼. 새로 온 다섯 중 셋이 안 나와.",
        "W: 모임에서 뭘 하는데?",
        "M: 첫 한 시간은 내가 전체가 어떻게 돌아가는지 설명해.",
        "W: 첫 한 시간이 통째로 네 설명이야?",
        "M: 시작하기 전에 알아야 할 게 많아.",
        "W: 정말 그럴까? 너는 첫날에 뭐가 필요했어?",
        "M: 한 가지쯤. 어디 서 있어야 하는지.",
        "W: 나머지는 하면서 알게 됐고.",
        "M: 그걸 까맣게 잊고 있었네.",
        "W: 한 가지만 가르치고 처음 10분 안에 해 보게 해.",
        "M: 그럼 다음엔 한 가지로 줄일게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yerin, you've been listening to the same English podcast for three months."],
        ["W", "Every day on the bus. Forty minutes each way."],
        ["M", "And has your listening score moved?"],
        ["W", "Not by one question."],
        ["M", "What do you do while it plays?"],
        ["W", "Look out of the window, mostly. It's on in the background."],
        ["M", "So it's eighty minutes a day of sound you're not looking at."],
        ["W", "When you say it like that, it sounds like nothing."],
        ["M", "Not nothing. But listening you don't check never turns into anything."],
        ["W", "So what should I change?"],
        ["M", "Pick five minutes of it and write down what you hear, word for word."],
      ],
      choices: [
        "The podcast is about science.",
        "Then I'll write out five minutes tonight.",
        "The bus ride takes forty minutes.",
        "I've been listening since September.",
        "You should listen to it too.",
      ],
      answer: 2,
      clue: "Pick five minutes of it and write down what you hear, word for word.",
      explanation:
        "5분만 골라 들리는 대로 받아쓰라는 조언을 들었으므로, 오늘 밤에 5분을 받아쓰겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 예린아, 석 달째 같은 영어 팟캐스트를 듣네.",
        "W: 버스에서 매일. 편도 40분씩.",
        "M: 듣기 점수는 움직였어?",
        "W: 한 문제도.",
        "M: 트는 동안 뭘 해?",
        "W: 주로 창밖을 봐. 그냥 틀어 놓는 거야.",
        "M: 그럼 하루 80분을 쳐다보지도 않는 소리로 보내는 거네.",
        "W: 그렇게 말하니 아무것도 아닌 것 같다.",
        "M: 아무것도 아니진 않아. 그런데 확인하지 않는 듣기는 아무것도 되지 않아.",
        "W: 그럼 뭘 바꿔야 해?",
        "M: 5분만 골라서 들리는 대로 한 마디씩 받아써.",
        "W: 그럼 오늘 밤에 5분을 받아쓸게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Mr. Eom이 Sujin에게 할 말로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Mr. Eom : ________________",
      lines: [
        [
          "M",
          "Mr. Eom runs the school volunteer club, and Sujin is the member families ask for by name. " +
            "She stays behind after every visit to finish whatever is not done. " +
            "Because of that the club has never once left a job half finished. " +
            "The difficulty is that the others have learned they can leave on time and Sujin will cover it. " +
            "Last month she stayed for two hours on her own and missed the last bus home. " +
            "Mr. Eom does not want her to care less; that care is why the club is trusted. " +
            "The trouble is that a club where one person carries the overflow teaches the rest nothing. " +
            "The next visit is on Saturday, and he wants to tell her to leave with everyone else and bring the unfinished part to the whole club instead. " +
            "In this situation, what would Mr. Eom most likely say to Sujin?",
        ],
      ],
      choices: [
        "Try to work a little faster next time.",
        "I think you should take a break from the club.",
        "Leave with everyone and bring what's left to the whole club.",
        "Let's cut the number of visits this term.",
        "You should catch an earlier bus home.",
      ],
      answer: 3,
      clue: "he wants to tell her to leave with everyone else and bring the unfinished part to the whole club instead",
      explanation:
        "엄 선생님은 수진의 책임감을 문제 삼지 않으면서, 다 같이 나오고 남은 일은 동아리 전체에 가져오라고 말하려 한다. 따라서 ③이 가장 적절하다.",
      translation: [
        "M: 엄 선생님은 학교 봉사 동아리를 맡고 있고, 수진이는 가정에서 이름을 대며 찾는 부원입니다. " +
          "수진이는 방문이 끝날 때마다 남아서 끝나지 않은 일을 마무리합니다. " +
          "그 덕분에 동아리는 한 번도 일을 반만 하고 온 적이 없습니다. " +
          "문제는 나머지 부원들이 제시간에 가도 수진이가 메워 준다는 것을 알게 됐다는 점입니다. " +
          "지난달에는 혼자 두 시간을 남아 있다가 막차를 놓쳤습니다. " +
          "엄 선생님은 수진이가 덜 신경 쓰기를 바라지 않습니다. 그 마음 덕분에 동아리가 믿음을 얻습니다. " +
          "문제는 한 사람이 남은 일을 다 떠안는 동아리는 나머지에게 아무것도 가르치지 못한다는 점입니다. " +
          "다음 방문은 토요일이고, 선생님은 다 같이 나오고 남은 일은 동아리 전체에 가져오라고 말하고 싶습니다. " +
          "이런 상황에서 엄 선생님이 수진이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "여자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about animals that keep other animals as a crop."],
        ["W", "We call it farming when people do it, and a few species were doing it long before we were."],
        ["W", "The leafcutter ant does not eat the leaves it carries; it chews them into a bed and grows a fungus on it."],
        ["W", "Some ants keep aphids the way we keep cattle, moving them to fresh stems and driving off anything that comes near."],
        ["W", "The damselfish weeds a patch of reef, pulling out every kind of seaweed except the one it eats."],
        ["W", "The ambrosia beetle carries fungus spores in a pocket on its body and plants them in the tunnel it bores."],
        ["W", "In each case the animal feeds and protects something it will later eat, which is the whole definition."],
        ["W", "The surprising part is not the growing. It is the weeding."],
      ],
      choices: [
        "how animals store food for winter",
        "why some animals live underground",
        "animals that grow or keep their own food",
        "how insects build their nests",
        "why fish defend a territory",
      ],
      answer: 3,
      clue: "In each case the animal feeds and protects something it will later eat, which is the whole definition.",
      explanation:
        "여자는 잎꾼개미, 진딧물을 치는 개미, 자리돔, 나무좀이 먹이를 직접 기르거나 돌보는 방식을 설명한다. 따라서 주제는 ③이다.",
      translation: [
        "W: 안녕하세요. 오늘은 다른 생물을 농작물처럼 기르는 동물에 대해 이야기하려 합니다.",
        "W: 사람이 하면 농사라고 부르는데, 몇몇 종은 우리보다 훨씬 전부터 그렇게 해 왔습니다.",
        "W: 잎꾼개미는 물어 나르는 잎을 먹지 않습니다. 잘게 씹어 바닥을 만들고 그 위에 버섯을 기릅니다.",
        "W: 어떤 개미는 우리가 소를 치듯 진딧물을 쳐서, 새 줄기로 옮겨 주고 다가오는 것은 쫓아냅니다.",
        "W: 자리돔은 산호초 한 뙈기에서 김을 매듯, 자기가 먹는 한 가지만 남기고 다른 해조를 모두 뽑아냅니다.",
        "W: 나무좀은 몸에 있는 주머니에 균 포자를 담고 다니다가 자기가 뚫은 굴에 심습니다.",
        "W: 어느 경우든 나중에 먹을 것을 먹이고 지켜 줍니다. 그것이 곧 농사의 정의입니다.",
        "W: 놀라운 것은 기르는 일이 아닙니다. 김매는 일입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 동물이 아닌 것은?",
      lines: [
        ["W", "Good afternoon. Today I want to talk about animals that keep other animals as a crop."],
        ["W", "We call it farming when people do it, and a few species were doing it long before we were."],
        ["W", "The leafcutter ant does not eat the leaves it carries; it chews them into a bed and grows a fungus on it."],
        ["W", "Some ants keep aphids the way we keep cattle, moving them to fresh stems and driving off anything that comes near."],
        ["W", "The damselfish weeds a patch of reef, pulling out every kind of seaweed except the one it eats."],
        ["W", "The ambrosia beetle carries fungus spores in a pocket on its body and plants them in the tunnel it bores."],
        ["W", "In each case the animal feeds and protects something it will later eat, which is the whole definition."],
        ["W", "The surprising part is not the growing. It is the weeding."],
      ],
      choices: ["leafcutter ant", "aphid", "damselfish", "ambrosia beetle", "honey badger"],
      answer: 5,
      clue: "The ambrosia beetle carries fungus spores in a pocket on its body and plants them in the tunnel it bores.",
      explanation:
        "잎꾼개미, 진딧물, 자리돔, 나무좀은 언급되지만 벌꿀오소리는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
