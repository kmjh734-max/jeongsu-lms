/** 고3 듣기 42회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 42회",
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
          "Good morning, everyone. This is the school library. " +
            "For the last two years the study room has been open to anyone, " +
            "and for most of the year that has worked perfectly well. " +
            "From the middle of October it stops working at all. " +
            "Ninety seats and two hundred students is not a rule problem; " +
            "it is an arithmetic problem, and no amount of goodwill solves it. " +
            "So from Monday, seats in the study room are allotted by application. " +
            "Apply through the library page, once for the whole term. " +
            "Those who are not allotted a seat may use the reading room, " +
            "which has forty more seats and the same opening hours. " +
            "Applications close on Friday at six in the evening.",
        ],
      ],
      choices: [
        "열람실 좌석을 신청제로 바꾼다고 알리려고",
        "도서관 이용 시간 변경을 알리려고",
        "도서 반납을 독촉하려고",
        "열람실 공사를 안내하려고",
        "도서관 봉사자를 모집하려고",
      ],
      answer: 1,
      clue: "So from Monday, seats in the study room are allotted by application.",
      explanation:
        "월요일부터 열람실 좌석을 신청받아 배정한다고 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 학교 도서관입니다. 지난 두 해 동안 열람실은 누구에게나 열려 있었고, 한 해의 대부분은 그것으로 잘 굴러갔습니다. 10월 중순부터는 전혀 굴러가지 않습니다. 자리 아흔 개에 학생 이백 명은 규칙의 문제가 아니라 셈의 문제이고, 선의로는 풀리지 않습니다. 그래서 월요일부터 열람실 좌석은 신청을 받아 배정합니다. 도서관 쪽에서 학기당 한 번 신청해 주세요. 자리를 받지 못한 학생은 독서실을 쓸 수 있습니다. 자리가 마흔 개 더 있고 여는 시간도 같습니다. 신청은 금요일 저녁 여섯 시에 마감합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Seongjin, you marked your own mock exam again?"],
        ["M", "Before I looked at the marking scheme, yes."],
        ["W", "Isn't that just doing the same paper twice?"],
        ["M", "It is, and the second time is the useful one."],
        ["W", "The answer is already fixed, though."],
        ["M", "The answer is. My reason for it isn't."],
        ["W", "So you're checking the reason, not the answer."],
        ["M", "Half my correct answers came from a wrong reason."],
        ["W", "And the scheme would never tell you that."],
        ["M", "It only ever says right or wrong."],
        ["W", "So a right answer can hide a fault."],
        ["M", "Mark your own reasons before you see the scheme."],
        ["W", "I'll try that with Thursday's paper."],
      ],
      choices: [
        "채점 전에 자기 근거를 스스로 확인해야 한다",
        "모의고사는 자주 볼수록 좋다",
        "오답 노트를 만들어야 한다",
        "채점은 선생님께 맡겨야 한다",
        "시험 시간을 재며 풀어야 한다",
      ],
      answer: 1,
      clue: "Mark your own reasons before you see the scheme.",
      explanation:
        "남자는 정답표를 보기 전에 자기 근거부터 따져 보라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 성진아, 또 네 모의고사를 네가 채점했어?",
        "M: 정답표를 보기 전에, 응.",
        "W: 그건 같은 시험지를 두 번 푸는 거 아니야?",
        "M: 맞아, 그리고 두 번째가 쓸모 있는 쪽이야.",
        "W: 그래도 답은 이미 정해져 있잖아.",
        "M: 답은 그렇지. 내 근거는 아니야.",
        "W: 그러니까 답이 아니라 근거를 보는구나.",
        "M: 맞힌 것의 절반이 틀린 근거에서 나왔어.",
        "W: 정답표는 그걸 절대 안 알려 주지.",
        "M: 맞다 틀리다만 말해 주니까.",
        "W: 맞힌 답이 흠을 가릴 수도 있겠네.",
        "M: 정답표를 보기 전에 네 근거부터 채점해 봐.",
        "W: 목요일 시험지로 해 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "A plan that fails is usually blamed on a lack of will. " +
            "We say we were lazy, or that we wanted it less than we thought. " +
            "Look closely and most failed plans share a quieter fault: " +
            "they described an outcome and never described a first move. " +
            "Read more this year is an outcome. " +
            "Twenty pages before breakfast, book left on the table, is a move. " +
            "The second one can be done badly, half done, done late; " +
            "the first one can only be kept or broken. " +
            "A plan you can carry out badly is a plan you can carry out.",
        ],
      ],
      choices: [
        "계획은 결과가 아니라 첫 동작으로 세워야 한다",
        "계획은 크게 세워야 한다",
        "의지를 기르는 것이 중요하다",
        "계획은 남에게 알려야 한다",
        "계획은 자주 바꿔야 한다",
      ],
      answer: 1,
      clue: "A plan you can carry out badly is a plan you can carry out.",
      explanation:
        "결과가 아니라 첫 동작을 적은 계획이라야 실천된다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 무너진 계획은 대개 의지가 모자란 탓으로 돌려집니다. 우리는 게을렀다고, 혹은 생각만큼 원하지 않았다고 말합니다. 가까이 보면 무너진 계획 대부분에는 더 조용한 흠이 있습니다. 결과를 적어 놓고 첫 동작은 적지 않았다는 것입니다. 올해는 책을 더 읽자는 결과입니다. 아침 먹기 전에 스무 쪽, 책은 식탁에 두기는 동작입니다. 뒤엣것은 엉성하게도, 반만도, 늦게도 할 수 있습니다. 앞엣것은 지키거나 어기거나 둘뿐입니다. 엉성하게라도 해낼 수 있는 계획이라야 해낼 수 있는 계획입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Yeeun, is this a photo of the study room downstairs?"],
        ["W", "They finished rearranging it over the weekend."],
        ["M", "A row of desks runs along the window."],
        ["W", "Those are the seats everyone wants."],
        ["M", "And a clock hangs above the door."],
        ["W", "It's been five minutes fast for a year."],
        ["M", "There's a round table in the middle of the room."],
        ["W", "It's square, actually, not round."],
        ["M", "A tall bookcase stands in the right corner."],
        ["W", "The dictionaries are all kept there."],
        ["M", "And a notice board covers the back wall."],
        ["W", "The seat list goes up on it each Monday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "It's square, actually, not round.",
      explanation:
        "가운데 탁자가 둥글다고 했지만 네모나다고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A school study room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A ROW OF DESKS runs along the window on the left side. " +
          "A CLOCK hangs above the door. " +
          "A ROUND TABLE stands in the middle of the room. " +
          "A TALL BOOKCASE stands in the right corner. " +
          "A NOTICE BOARD covers the back wall.",
        spots: [
          [0.15, 0.55],
          [0.62, 0.15],
          [0.45, 0.62],
          [0.88, 0.45],
          [0.35, 0.22],
        ],
      },
      translation: [
        "M: 예은아, 이게 아래층 열람실 사진이야?",
        "W: 주말에 자리 옮기는 걸 끝냈어.",
        "M: 창가를 따라 책상이 한 줄 있네.",
        "W: 다들 앉고 싶어 하는 자리야.",
        "M: 그리고 문 위에 시계가 걸려 있고.",
        "W: 일 년째 5분 빨라.",
        "M: 방 가운데에 둥근 탁자가 있어.",
        "W: 사실 둥근 게 아니라 네모야.",
        "M: 오른쪽 구석에는 높은 책장이 있네.",
        "W: 사전은 다 거기에 둬.",
        "M: 그리고 뒷벽은 게시판이 덮고 있고.",
        "W: 월요일마다 자리 명단이 거기 붙어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Wonjae, the mock exam starts at nine tomorrow."],
        ["W", "Everything has to be in the hall before then."],
        ["M", "The desks are numbered and the papers are counted."],
        ["W", "Did anyone collect the answer sheets from the office?"],
        ["M", "I thought the homeroom teacher had them."],
        ["W", "She left for the district meeting at three."],
        ["M", "Then they are still sitting in the office."],
        ["W", "In the grey box beside the printer."],
        ["M", "And the office is locked after six."],
        ["W", "It's ten to six right now."],
        ["M", "Then I have to run for it."],
        ["W", "I'll finish numbering the back row."],
        ["M", "I'll go and collect the answer sheets."],
      ],
      choices: [
        "책상에 번호를 붙이기",
        "시험지를 세기",
        "답안지를 가져오기",
        "담임 선생님께 연락하기",
        "강당 문을 잠그기",
      ],
      answer: 3,
      clue: "I'll go and collect the answer sheets.",
      explanation:
        "남자는 교무실에서 답안지를 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 원재야, 모의고사는 내일 아홉 시에 시작해.",
        "W: 그 전에 다 강당에 들어가 있어야 해.",
        "M: 책상 번호는 붙였고 시험지도 세어 놨어.",
        "W: 사무실에서 답안지는 누가 가져왔어?",
        "M: 담임 선생님이 갖고 계신 줄 알았는데.",
        "W: 세 시에 지역 회의 가셨어.",
        "M: 그럼 아직 사무실에 그대로 있겠네.",
        "W: 복사기 옆 회색 상자 안에.",
        "M: 그리고 사무실은 여섯 시 넘으면 잠가.",
        "W: 지금 여섯 시 10분 전이야.",
        "M: 그럼 뛰어가야겠다.",
        "W: 나는 뒷줄 번호 붙이는 걸 마무리할게.",
        "M: 내가 가서 답안지를 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the bookshop. Can I help you find anything?"],
        ["W", "I'd like four workbooks and two dictionaries, please."],
        ["M", "The workbooks are twelve dollars each this month."],
        ["W", "Are the older editions any cheaper than that?"],
        ["M", "They are, but we sold the last one yesterday morning."],
        ["W", "Then the new ones will have to do."],
        ["M", "They have the same questions with a fuller answer section."],
        ["W", "That suits me better anyway."],
        ["M", "And the dictionaries are twenty-six dollars each."],
        ["W", "Do you have a smaller one at a lower price?"],
        ["M", "Only these, I'm afraid. The small ones sold out in March."],
        ["W", "That's fine. Is there a student discount here?"],
        ["M", "Ten percent off the total with a school card."],
        ["W", "Does that work on the dictionaries as well?"],
        ["M", "On everything in the shop except the magazines."],
        ["W", "Here is my card. I'll pay by card as well."],
      ],
      choices: ["$85.00", "$90.00", "$95.00", "$100.00", "$105.00"],
      answer: 2,
      clue: "The workbooks are twelve dollars each.",
      explanation:
        "문제집 4권 48달러와 사전 2권 52달러로 100달러인데, 10퍼센트를 빼면 90달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 서점에 오신 걸 환영합니다. 찾으시는 게 있나요?",
        "W: 문제집 네 권과 사전 두 권 주세요.",
        "M: 문제집은 이번 달에 한 권에 12달러입니다.",
        "W: 옛날 판은 그보다 더 싼가요?",
        "M: 싸지만 마지막 한 권이 어제 아침에 나갔어요.",
        "W: 그럼 새 판으로 할 수밖에 없네요.",
        "M: 문제는 같고 해설이 더 두툼합니다.",
        "W: 그럼 저한테는 더 낫네요.",
        "M: 그리고 사전은 한 권에 26달러입니다.",
        "W: 값이 더 싼 작은 건 없나요?",
        "M: 아쉽지만 이것뿐이에요. 작은 건 3월에 다 나갔어요.",
        "W: 괜찮아요. 여기 학생 할인이 있나요?",
        "M: 학생증이 있으면 전체에서 10퍼센트 할인됩니다.",
        "W: 사전에도 되나요?",
        "M: 잡지만 빼고 가게 안 모든 것에 됩니다.",
        "W: 여기 학생증이요. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 자습 장소를 바꾼 이유를 고르시오.",
      lines: [
        ["W", "Daehyun, I saw you in the reading room again."],
        ["W", "You had a seat in the study room all term."],
        ["M", "I did, and I kept it until last week."],
        ["W", "Was your seat given to someone else?"],
        ["M", "No, it's still mine until December."],
        ["W", "Is the reading room quieter, then?"],
        ["M", "The two rooms are about the same."],
        ["W", "So why did you move?"],
        ["M", "The study room has no plug at the desks."],
        ["W", "And you're using the recorded lectures now."],
        ["M", "My tablet lasts two hours, and I'm there for five."],
        ["W", "Then the reading room it is."],
      ],
      choices: [
        "책상에 콘센트가 없어서",
        "자리를 빼앗겨서",
        "너무 시끄러워서",
        "친구가 옮기자고 해서",
        "집에서 가까워서",
      ],
      answer: 1,
      clue: "The study room has no plug at the desks.",
      explanation:
        "열람실 책상에 콘센트가 없어 태블릿을 쓸 수 없어 옮겼다. 따라서 답은 ①이다.",
      translation: [
        "W: 대현아, 독서실에서 또 봤어.",
        "W: 학기 내내 열람실에 자리가 있었잖아.",
        "M: 있었지, 지난주까지 지켰어.",
        "W: 자리를 남한테 줬어?",
        "M: 아니, 12월까지는 아직 내 자리야.",
        "W: 그럼 독서실이 더 조용해?",
        "M: 두 방이 비슷해.",
        "W: 그럼 왜 옮겼어?",
        "M: 열람실 책상에는 콘센트가 없어.",
        "W: 요즘 녹화 강의를 듣지.",
        "M: 태블릿이 두 시간 가는데 나는 다섯 시간 있어.",
        "W: 그럼 독서실이 맞네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 진학 설명회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Nayoung, are you going to the university briefing this year?"],
        ["M", "The letter went home with us on Monday afternoon."],
        ["W", "I read it on the bus and put it on the fridge."],
        ["M", "Where is it being held this time?"],
        ["W", "In the main hall, not the science room like last year."],
        ["M", "That's a good thing. Nobody could hear at the back."],
        ["W", "The hall takes three hundred, so there will be room."],
        ["M", "And when exactly is it?"],
        ["W", "The eighth of November, at two in the afternoon."],
        ["M", "How long does the whole thing last?"],
        ["W", "Two hours, with a short break in the middle."],
        ["M", "Who is speaking to us?"],
        ["W", "Three admissions officers and two graduates."],
        ["M", "Can parents come along as well?"],
        ["W", "One parent for each student, the letter said."],
        ["M", "Then my mother will come with me."],
        ["W", "Sit near the front if you want to ask anything."],
      ],
      choices: ["열리는 곳", "열리는 날과 시각", "걸리는 시간", "말하는 사람", "신청 방법"],
      answer: 5,
      clue: "The eighth of November, at two in the afternoon.",
      explanation:
        "장소, 날짜와 시각, 시간, 발표자는 말했지만 신청 방법은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 나영아, 올해 진학 설명회 갈 거야?",
        "M: 월요일 오후에 가정통신문 받았잖아.",
        "W: 버스에서 읽고 냉장고에 붙여 놨어.",
        "M: 이번에는 어디서 해?",
        "W: 작년처럼 과학실이 아니라 대강당에서 해.",
        "M: 잘됐다. 작년엔 뒤에서 하나도 안 들렸어.",
        "W: 강당은 삼백 명이 들어가니까 자리는 넉넉할 거야.",
        "M: 정확히 언제야?",
        "W: 11월 8일 오후 두 시.",
        "M: 다 해서 얼마나 걸려?",
        "W: 중간에 잠깐 쉬면서 두 시간.",
        "M: 누가 말해 주는데?",
        "W: 입학 담당자 세 명과 졸업생 두 명.",
        "M: 학부모도 같이 올 수 있어?",
        "W: 통신문에는 학생 한 명당 한 분이라고 했어.",
        "M: 그럼 우리 어머니가 같이 오시겠다.",
        "W: 뭐 물어보고 싶으면 앞쪽에 앉아.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 겨울 논술 강좌에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, students. Here are the details of the winter essay course. " +
            "It runs for five weeks, beginning on the third of January. " +
            "Classes are held on Tuesdays and Fridays from two until four. " +
            "Twenty-four students are taken, twelve in each of two groups. " +
            "You write one essay a week and hand it in on Friday. " +
            "Essays are returned with comments, not with a score. " +
            "The course is free, but materials cost ten thousand won. " +
            "Apply at the teachers' room by the twentieth of December. " +
            "Those who applied in the summer are asked to apply again.",
        ],
      ],
      choices: [
        "1월 3일부터 다섯 주 동안 열린다",
        "화요일과 금요일에 수업한다",
        "스물네 명을 받는다",
        "한 주에 한 편씩 글을 쓴다",
        "글에 점수를 매겨 돌려준다",
      ],
      answer: 5,
      clue: "Essays are returned with comments, not with a score.",
      explanation:
        "점수가 아니라 의견을 붙여 돌려준다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 겨울 논술 강좌를 안내합니다. 1월 3일부터 다섯 주 동안 진행됩니다. 수업은 화요일과 금요일 두 시부터 네 시까지입니다. 스물네 명을 받고, 두 반에 열두 명씩 나눕니다. 한 주에 한 편씩 글을 써서 금요일에 냅니다. 글은 점수가 아니라 의견을 붙여 돌려드립니다. 강좌는 무료이지만 교재비로 1만 원이 듭니다. 12월 20일까지 교무실에서 신청해 주세요. 여름에 신청했던 학생도 다시 신청해 주시기 바랍니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 고를 문제집을 고르시오.",
      lines: [
        ["M", "Sujin, which workbook are you going to buy?"],
        ["W", "The shop has five of them for this subject."],
        ["M", "Do you want one with the answers explained?"],
        ["W", "That's the whole point of buying one."],
        ["M", "Two of these have answers only."],
        ["W", "Then those are out straight away."],
        ["M", "What about the number of questions?"],
        ["W", "At least four hundred, or it won't last the winter."],
        ["M", "One of the rest has fewer than that."],
        ["W", "And I can't spend more than twenty thousand won."],
        ["M", "That rules out one more of them."],
        ["W", "Then there's only one left to buy."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "At least four hundred, or it won't last the winter.",
      explanation:
        "해설이 있고, 문항이 400개 이상이며, 2만 원 이하인 것은 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Answers: Only / Questions: 500 / Price: 15,000 won" },
          { no: 2, label: "②", value: "Answers: Explained / Questions: 300 / Price: 17,000 won" },
          { no: 3, label: "③", value: "Answers: Only / Questions: 600 / Price: 19,000 won" },
          { no: 4, label: "④", value: "Answers: Explained / Questions: 450 / Price: 18,000 won" },
          { no: 5, label: "⑤", value: "Answers: Explained / Questions: 550 / Price: 24,000 won" },
        ],
      },
      translation: [
        "M: 수진아, 어느 문제집을 살 거야?",
        "W: 이 과목은 가게에 다섯 종류가 있어.",
        "M: 해설이 붙은 걸로 할 거야?",
        "W: 그러려고 사는 거지.",
        "M: 이 중 두 개는 답만 있어.",
        "W: 그럼 그건 바로 빠지네.",
        "M: 문항 수는?",
        "W: 적어도 400개, 아니면 겨울을 못 버텨.",
        "M: 나머지 중 하나는 그보다 적어.",
        "W: 그리고 2만 원 넘게는 못 써.",
        "M: 그럼 하나가 더 빠지네.",
        "W: 그럼 살 건 하나뿐이야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Have you applied for a study room seat yet?"],
        ["W", "I opened the page but didn't finish it."],
        ["M", "Applications close on Friday evening."],
        ["W", "I'd better do it tonight, then."],
        ["M", "Shall I send you the link after class?"],
      ],
      choices: [
        "Yes, please do.",
        "The seats were all taken last year.",
        "I never use the study room.",
        "The page has been closed.",
        "Friday is a holiday.",
      ],
      answer: 1,
      clue: "Shall I send you the link after class?",
      explanation:
        "수업 후에 주소를 보내 주겠다는 제안이므로, 그래 달라는 ①이 가장 자연스럽다.",
      translation: [
        "M: 열람실 자리 신청했어?",
        "W: 화면은 열었는데 끝까지 못 했어.",
        "M: 신청은 금요일 저녁에 마감이야.",
        "W: 그럼 오늘 밤에 해야겠다.",
        "M: 수업 끝나고 주소 보내 줄까?",
        "W: 응, 그래 줘.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, can I take this dictionary home?"],
        ["M", "The dictionaries stay in the study room."],
        ["W", "Even over the weekend?"],
        ["M", "Even then, I'm afraid."],
        ["W", "Is there any copy I could borrow instead?"],
      ],
      choices: [
        "All dictionaries are the same.",
        "There's a lending copy downstairs.",
        "The room closes at six.",
        "You can't read it here.",
        "We sold them last year.",
      ],
      answer: 2,
      clue: "Is there any copy I could borrow instead?",
      explanation:
        "빌릴 수 있는 책이 있는지 물었으므로, 아래층에 대출용이 있다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 이 사전을 집에 가져가도 되나요?",
        "M: 사전은 열람실 안에 두는 것입니다.",
        "W: 주말에도요?",
        "M: 아쉽지만 그때도요.",
        "W: 그럼 대신 빌릴 수 있는 책이 있나요?",
        "M: 아래층에 대출용이 한 권 있습니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Hyunsu, how is your revision timetable holding up?"],
        ["M", "I wrote it in September and abandoned it in October."],
        ["W", "What did the timetable actually say?"],
        ["M", "Three hours of maths every evening, without fail."],
        ["W", "And what happens on an evening with a test the next day?"],
        ["M", "The three hours go, and the whole week collapses."],
        ["W", "So one bad evening takes the rest with it."],
        ["M", "After two of those I stopped looking at it."],
        ["W", "A timetable with no slack breaks at the first knock."],
        ["M", "I thought a strict one would make me work harder."],
        ["W", "What would you leave in the week instead?"],
      ],
      choices: [
        "One more hour of maths.",
        "Two evenings kept empty.",
        "Nothing at all.",
        "A stricter rule than before.",
        "The same timetable again.",
      ],
      answer: 2,
      clue: "What would you leave in the week instead?",
      explanation:
        "빡빡한 계획이 무너진다는 이야기이므로, 저녁 두 번을 비워 두겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 현수야, 복습 계획표는 잘 지켜지고 있어?",
        "M: 9월에 짜서 10월에 버렸어.",
        "W: 계획표에 뭐라고 적었는데?",
        "M: 저녁마다 빠짐없이 수학 세 시간.",
        "W: 다음 날 시험이 있는 저녁에는 어떻게 돼?",
        "M: 세 시간이 날아가고 그 주가 통째로 무너져.",
        "W: 그러니까 하루가 나머지를 데려가는구나.",
        "M: 그런 일이 두 번 있고 나서 안 보게 됐어.",
        "W: 여유가 없는 계획표는 첫 번째 충격에 부서져.",
        "M: 빡빡하게 짜면 더 할 줄 알았어.",
        "W: 그럼 한 주에 무엇을 남겨 둘 거야?",
        "M: 저녁 두 번을 비워 둘래.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Jiwon, you said the English listening still catches you out."],
        ["W", "I lose one or two every time, always late in the paper."],
        ["M", "Which numbers do you usually lose?"],
        ["W", "Thirteen and fourteen, almost every time."],
        ["M", "Those are the long replies at the end of a conversation."],
        ["W", "By then I've stopped following who wants what."],
        ["M", "So it isn't the words; it's the thread."],
        ["W", "I understand every sentence and miss the whole thing."],
        ["M", "Listening harder won't fix a lost thread."],
        ["W", "Then what should I be holding on to while it runs?"],
        ["M", "Keep asking what each speaker wants."],
      ],
      choices: [
        "I'll write down every word.",
        "I'll try that from the first line.",
        "The paper is too long.",
        "I'll skip those numbers.",
        "Nothing can be done.",
      ],
      answer: 2,
      clue: "Keep asking what each speaker wants.",
      explanation:
        "각 사람이 무엇을 원하는지 계속 물으라는 조언이므로, 첫 줄부터 해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 지원아, 영어 듣기가 아직도 걸린다고 했지.",
        "W: 매번 한두 개 놓치는데 늘 뒤쪽이야.",
        "M: 보통 몇 번을 놓쳐?",
        "W: 거의 매번 13번이랑 14번.",
        "M: 대화 끝의 긴 응답들이네.",
        "W: 그쯤이면 누가 뭘 원하는지 따라가기를 놔 버려.",
        "M: 그럼 낱말이 아니라 흐름 문제네.",
        "W: 문장은 다 알아듣는데 전체를 놓쳐.",
        "M: 더 집중한다고 놓친 흐름이 돌아오지는 않아.",
        "W: 그럼 듣는 동안 무엇을 붙잡고 있어야 해?",
        "M: 각 사람이 무엇을 원하는지 계속 물어.",
        "W: 첫 줄부터 그렇게 해 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Minjae가 Sora에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Minjae : ________________",
      lines: [
        [
          "M",
          "Minjae and Sora are setting out the hall for tomorrow's mock exam. " +
            "Sora has stacked the question papers on the window ledge " +
            "so that the desks can be moved into rows. " +
            "The window above the ledge has been left open all afternoon, " +
            "and the forecast for tonight is heavy rain and wind. " +
            "Minjae knows the caretaker locks the hall at seven " +
            "and that nobody will come back in before the exam begins. " +
            "He wants her to move the papers into the cupboard instead. " +
            "In this situation, what would Minjae most likely say to Sora?",
        ],
      ],
      choices: [
        "Let's close the exam hall.",
        "We need more question papers.",
        "Put the papers in the cupboard.",
        "Open the window wider.",
        "The exam starts at seven.",
      ],
      answer: 3,
      clue: "He wants her to move the papers into the cupboard instead.",
      explanation:
        "열린 창가에 둔 시험지가 비에 젖을 수 있으므로, 장에 넣으라는 ③이 가장 적절하다.",
      translation: [
        "M: 민재와 소라는 내일 모의고사를 위해 강당을 준비하고 있습니다. 소라는 책상을 줄 맞춰 옮기려고 시험지를 창턱에 쌓아 두었습니다. 그 위 창문은 오후 내내 열려 있었고, 오늘 밤 날씨는 큰비와 바람입니다. 민재는 관리인이 일곱 시에 강당을 잠그고, 시험이 시작되기 전에는 아무도 다시 들어오지 않는다는 것을 압니다. 그는 시험지를 장 안에 옮겨 두기를 바랍니다. 이런 상황에서 민재가 소라에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why old maps " +
            "were so often wrong in ways that look strange to us now. " +
            "A mapmaker in the sixteenth century rarely travelled at all. " +
            "He worked from the notebooks of sailors and merchants, " +
            "and a coast described once became a coast drawn for two hundred years. " +
            "Errors survived because copying was cheaper than measuring, " +
            "and a copied map looked exactly as authoritative as a surveyed one. " +
            "An island reported by a single captain stayed on the charts " +
            "long after ships had sailed straight through where it should have been. " +
            "The map was not a picture of the world but a record of what had been said about it.",
        ],
      ],
      choices: [
        "why errors lasted so long on old maps",
        "how sailors navigated without instruments",
        "why mapmakers travelled to distant lands",
        "how islands are formed in the ocean",
        "why maps became cheaper to print",
      ],
      answer: 1,
      clue: "Errors survived because copying was cheaper than measuring.",
      explanation:
        "옛 지도의 잘못이 오래 남은 까닭이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 옛 지도가 지금 보면 이상한 방식으로 그토록 자주 틀렸던 까닭을 이야기하려 합니다. 16세기의 지도 제작자는 거의 여행하지 않았습니다. 그는 뱃사람과 상인의 공책을 보고 일했고, 한 번 적힌 해안선은 이백 년 동안 그려지는 해안선이 되었습니다. 잘못이 살아남은 것은 베끼는 일이 재는 일보다 쌌기 때문이고, 베낀 지도가 재어 그린 지도와 똑같이 믿음직해 보였기 때문입니다. 선장 한 사람이 알린 섬은 배들이 그 자리를 곧장 지나간 뒤에도 오래 해도에 남아 있었습니다. 지도는 세상의 그림이 아니라 세상에 대해 이야기된 것의 기록이었습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 것이 아닌 것을 고르시오.",
      lines: [
        ["M", "A mapmaker in the sixteenth century rarely travelled at all."],
        ["M", "He worked from the notebooks of sailors and merchants."],
        ["M", "Errors survived because copying was cheaper than measuring."],
        ["M", "An island reported by a single captain stayed on the charts."],
        ["M", "The map was a record of what had been said about the world."],
      ],
      choices: ["sailors", "merchants", "an island", "a captain", "a lighthouse"],
      answer: 5,
      clue: "An island reported by a single captain stayed on the charts.",
      explanation:
        "뱃사람, 상인, 섬, 선장은 언급되지만 등대는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
