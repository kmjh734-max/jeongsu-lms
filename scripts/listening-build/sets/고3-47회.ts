/** 고3 듣기 47회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 47회",
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
          "Good afternoon, everyone. This is the school counsellor speaking. " +
            "Each November a number of students come to see me about the same thing. " +
            "They have decided what to apply for and told nobody at home. " +
            "They plan to say it once the decision cannot be changed. " +
            "I understand why; an argument avoided feels like an argument won. " +
            "But a decision explained in December is heard as an announcement, " +
            "and the people who hear it have had no part in it at all. " +
            "The same words in October are heard as a conversation. " +
            "So tell them now, while there is still something to discuss. " +
            "If you would rather not do it alone, come and we will do it together.",
        ],
      ],
      choices: [
        "진로 결정을 집에 미리 이야기하라고 권하려고",
        "상담 신청 방법을 알리려고",
        "원서 마감일을 알리려고",
        "진학 설명회를 안내하려고",
        "학부모 면담을 요청하려고",
      ],
      answer: 1,
      clue: "So tell them now, while there is still something to discuss.",
      explanation:
        "결정을 미루지 말고 집에 미리 이야기하라고 권하고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 상담 선생님입니다. 11월마다 여러 학생이 같은 일로 저를 찾아옵니다. 어디에 지원할지 정해 놓고 집에는 아무 말도 하지 않은 학생들입니다. 되돌릴 수 없게 된 뒤에 말하겠다는 것입니다. 왜 그런지 압니다. 피한 다툼은 이긴 다툼처럼 느껴지니까요. 그러나 12월에 설명하는 결정은 통보로 들리고, 그것을 듣는 사람은 그 일에 아무 몫도 갖지 못합니다. 같은 말이 10월에는 대화로 들립니다. 그러니 아직 의논할 것이 남아 있는 지금 이야기하십시오. 혼자 하기가 어렵다면 찾아오세요. 함께 하겠습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Hyerin, you turned down the study group invitation?"],
        ["W", "The one that meets four evenings a week, yes."],
        ["M", "Six of the best students in the year are in it."],
        ["W", "That's exactly why I thought about it for a day."],
        ["M", "And what made you say no in the end?"],
        ["W", "Four evenings is everything outside school."],
        ["M", "Surely studying with good people is worth it."],
        ["W", "It's worth something, and it costs everything else."],
        ["M", "You'd still have the weekend."],
        ["W", "A plan that leaves nothing over breaks in a month."],
        ["M", "Two evenings, then, rather than four."],
        ["W", "Take on what you can still be doing in March."],
        ["M", "I'll think about how many I've said yes to."],
      ],
      choices: [
        "3월까지 이어 갈 수 있는 만큼만 맡아야 한다",
        "좋은 친구들과 공부해야 한다",
        "공부는 혼자 해야 한다",
        "주말에는 쉬어야 한다",
        "거절은 빨리 해야 한다",
      ],
      answer: 1,
      clue: "Take on what you can still be doing in March.",
      explanation:
        "여자는 3월까지 이어 갈 수 있는 만큼만 맡으라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 혜린아, 스터디 제안을 거절했다며?",
        "W: 한 주에 저녁 네 번 모이는 그거, 맞아.",
        "M: 학년에서 제일 잘하는 여섯 명이 있잖아.",
        "W: 그래서 하루를 두고 생각했지.",
        "M: 그런데 왜 결국 안 한다고 했어?",
        "W: 저녁 네 번이면 학교 밖 전부야.",
        "M: 그래도 좋은 애들이랑 하면 값어치가 있잖아.",
        "W: 값어치는 있지, 그리고 나머지 전부를 가져가.",
        "M: 주말은 남잖아.",
        "W: 남는 게 없는 계획은 한 달이면 부서져.",
        "M: 그럼 네 번 말고 두 번 하면 되고.",
        "W: 3월에도 하고 있을 만큼만 맡아.",
        "M: 내가 몇 개를 하겠다고 했는지 세어 봐야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When we read about a subject we already know a little about, " +
            "we feel ourselves understanding, and we take that feeling as learning. " +
            "It is not the same thing. " +
            "Recognising a sentence is easy; producing it is hard, " +
            "and only the second one tells you whether it is yours. " +
            "A page you have just read feels obvious while you look at it " +
            "and disappears the moment the book is shut. " +
            "So close the book at the end of every section " +
            "and say what it said, out loud, in your own words. " +
            "What you cannot say, you have not yet read.",
        ],
      ],
      choices: [
        "읽은 것을 덮고 말해 봐야 안 것이다",
        "책은 여러 번 읽어야 한다",
        "모르는 분야부터 읽어야 한다",
        "중요한 부분에 표시해야 한다",
        "책은 소리 내어 읽어야 한다",
      ],
      answer: 1,
      clue: "What you cannot say, you have not yet read.",
      explanation:
        "책을 덮고 제 말로 말해 봐야 읽은 것이라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 조금 아는 분야에 대해 읽을 때 우리는 이해되고 있다고 느끼고, 그 느낌을 배움으로 여깁니다. 그 둘은 같지 않습니다. 문장을 알아보는 일은 쉽고, 만들어 내는 일은 어렵습니다. 그리고 그것이 내 것인지를 알려 주는 것은 뒤쪽뿐입니다. 방금 읽은 쪽은 들여다보는 동안에는 뻔해 보이다가, 책을 덮는 순간 사라집니다. 그러니 한 단락이 끝날 때마다 책을 덮고, 거기 적힌 것을 제 말로 소리 내어 말해 보십시오. 말하지 못하는 것은 아직 읽지 않은 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Dongmin, is this a photo of the counselling room?"],
        ["M", "They changed it around at the start of term."],
        ["W", "There's a low table between two chairs."],
        ["M", "That's where everyone sits to talk."],
        ["W", "And a bookshelf stands under the window."],
        ["M", "It's full of university handbooks."],
        ["W", "A clock hangs on the wall on the left."],
        ["M", "There's no clock at all, on purpose."],
        ["W", "There's a rug on the floor in front of the door."],
        ["M", "It quiets the footsteps from the corridor."],
        ["W", "And a plant stands in the right corner."],
        ["M", "The counsellor has kept it for six years."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There's no clock at all, on purpose.",
      explanation:
        "시계가 걸려 있다고 했지만 일부러 두지 않았다고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A school counselling room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A LOW TABLE stands between TWO CHAIRS in the middle of the room. " +
          "A BOOKSHELF stands under the window. " +
          "A CLOCK hangs on the wall on the left. " +
          "A RUG lies on the floor in front of the door. " +
          "A TALL POTTED PLANT stands in the right corner.",
        spots: [
          [0.45, 0.6],
          [0.62, 0.35],
          [0.1, 0.25],
          [0.35, 0.87],
          [0.88, 0.45],
        ],
      },
      translation: [
        "W: 동민아, 이게 상담실 사진이야?",
        "M: 학기 초에 자리를 바꿨어.",
        "W: 의자 두 개 사이에 낮은 탁자가 있네.",
        "M: 거기 앉아서 이야기해.",
        "W: 그리고 창 아래에 책장이 있고.",
        "M: 대학 안내서로 가득해.",
        "W: 왼쪽 벽에 시계가 걸려 있어.",
        "M: 시계는 일부러 하나도 안 걸어 놨어.",
        "W: 문 앞 바닥에는 깔개가 있네.",
        "M: 복도 발소리를 눌러 줘.",
        "W: 그리고 오른쪽 구석에 화분이 있고.",
        "M: 선생님이 여섯 해째 기르셔.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Areum, the parents' meeting starts at seven."],
        ["W", "The room is laid out and the name cards are placed."],
        ["M", "It looks better than the hall did last year."],
        ["W", "Thirty chairs fit in here without crowding."],
        ["M", "Did anyone print the handbooks for the parents?"],
        ["W", "Jaeho said he would run them off after lunch."],
        ["M", "He was taken to the dentist at two."],
        ["W", "Then nobody has printed a single copy."],
        ["M", "How many do we need for tonight?"],
        ["W", "Thirty, one for every chair."],
        ["M", "And the print room closes at half past six."],
        ["W", "It's twenty past six right now."],
        ["M", "Then somebody has to leave this minute."],
        ["W", "You can't; you're meeting the counsellor at the door."],
        ["M", "I'll stay and welcome the parents."],
        ["W", "I'll go and print the handbooks."],
      ],
      choices: [
        "학부모를 맞이하기",
        "안내 책자를 출력하기",
        "이름표를 놓기",
        "재호에게 연락하기",
        "의자를 놓기",
      ],
      answer: 2,
      clue: "I'll go and print the handbooks.",
      explanation:
        "여자는 인쇄실에 가서 안내 책자를 출력하겠다고 했다. 따라서 답은 ②이다.",
      translation: [
        "M: 아름아, 학부모 모임은 일곱 시에 시작해.",
        "W: 자리는 다 차렸고 이름표도 놨어.",
        "M: 작년 강당보다 낫다.",
        "W: 여기는 서른 개가 빡빡하지 않게 들어가.",
        "M: 학부모용 안내 책자는 누가 출력했어?",
        "W: 재호가 점심 먹고 뽑겠다고 했어.",
        "M: 두 시에 치과에 갔어.",
        "W: 그럼 한 부도 안 뽑혔네.",
        "M: 오늘 밤에 몇 부나 필요해?",
        "W: 서른 부, 의자마다 하나씩.",
        "M: 그리고 인쇄실은 여섯 시 반에 닫아.",
        "W: 지금 여섯 시 20분이야.",
        "M: 그럼 누군가 당장 나가야 해.",
        "W: 너는 안 돼. 문에서 상담 선생님 만나기로 했잖아.",
        "M: 나는 남아서 학부모를 맞을게.",
        "W: 내가 가서 안내 책자를 출력할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the frame shop. How can I help you?"],
        ["M", "I'd like three small frames and two large ones."],
        ["W", "The small frames are nine dollars each."],
        ["M", "Is the wooden one the same price?"],
        ["W", "The wooden ones are twice that, I'm afraid."],
        ["M", "Then the plain ones are fine."],
        ["W", "And the large frames are sixteen dollars each."],
        ["M", "Do they come with glass?"],
        ["W", "Glass is included in both sizes."],
        ["M", "Good. Is there a discount for schools?"],
        ["W", "Ten percent off the whole order with a school card."],
        ["M", "Here's the card. I'll pay now."],
      ],
      choices: ["$50.10", "$53.10", "$56.10", "$59.00", "$62.00"],
      answer: 2,
      clue: "The small frames are nine dollars each.",
      explanation:
        "작은 액자 3개 27달러와 큰 액자 2개 32달러로 59달러인데, 10퍼센트를 빼면 53.10달러이다. 따라서 답은 ②이다.",
      translation: [
        "W: 액자 가게에 오신 걸 환영합니다. 무엇을 도와드릴까요?",
        "M: 작은 액자 세 개와 큰 액자 두 개를 사려고요.",
        "W: 작은 액자는 하나에 9달러입니다.",
        "M: 나무로 된 것도 같은 값인가요?",
        "W: 아쉽지만 나무는 그 두 배입니다.",
        "M: 그럼 보통 것으로 할게요.",
        "W: 그리고 큰 액자는 하나에 16달러입니다.",
        "M: 유리도 들어 있나요?",
        "W: 두 크기 다 유리가 들어 있습니다.",
        "M: 좋네요. 학교 할인이 있나요?",
        "W: 학교 카드가 있으면 전체에서 10퍼센트 할인됩니다.",
        "M: 여기 카드요. 지금 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 지원 학과를 바꾼 이유를 고르시오.",
      lines: [
        ["M", "Nayeon, you changed the department on your form?"],
        ["M", "You'd been saying the same one since last spring."],
        ["W", "I had, and I only changed it last week."],
        ["M", "Were the grades not high enough?"],
        ["W", "My grades would have been fine for either."],
        ["M", "Did your parents ask you to change it?"],
        ["W", "They said it was entirely up to me."],
        ["M", "Then what made you switch?"],
        ["W", "I sat in on a first-year class in September."],
        ["M", "And it wasn't what you imagined."],
        ["W", "Three hours of what I thought was the interesting part."],
        ["M", "Then seeing it was worth more than reading about it."],
      ],
      choices: [
        "수업을 직접 들어 보고 나서",
        "성적이 모자라서",
        "부모님이 권해서",
        "친구가 같이 가자고 해서",
        "학비가 비싸서",
      ],
      answer: 1,
      clue: "I sat in on a first-year class in September.",
      explanation:
        "9월에 수업을 직접 들어 보고 생각과 달라 바꾸었다. 따라서 답은 ①이다.",
      translation: [
        "M: 나연아, 원서에 학과를 바꿨어?",
        "M: 지난봄부터 계속 같은 데를 말했잖아.",
        "W: 그랬지, 지난주에야 바꿨어.",
        "M: 성적이 모자랐어?",
        "W: 성적은 둘 다 됐어.",
        "M: 부모님이 바꾸라고 하셨어?",
        "W: 전적으로 내게 맡긴다고 하셨어.",
        "M: 그럼 왜 바꿨어?",
        "W: 9월에 1학년 수업을 들어가 봤어.",
        "M: 생각하던 것과 달랐구나.",
        "W: 재미있는 대목이라고 여겼던 것만 세 시간이었어.",
        "M: 그럼 읽는 것보다 보는 게 값졌네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 졸업생 초청 강연에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Sungho, are you going to the graduates' talk?"],
        ["W", "The poster went up by the stairs this morning."],
        ["M", "It's in the second-floor lecture room."],
        ["W", "Not in the hall?"],
        ["M", "The lecture room, so that people can ask questions."],
        ["W", "When is it being held?"],
        ["M", "The twenty-seventh of November, at four."],
        ["W", "How many graduates are coming?"],
        ["M", "Four, from four different fields."],
        ["W", "How long does each of them speak?"],
        ["M", "Fifteen minutes each, then questions."],
        ["W", "Do we have to sign up beforehand?"],
        ["M", "Just write your name on the sheet by the poster."],
        ["W", "Then I'll put mine down at lunchtime."],
      ],
      choices: ["열리는 곳", "열리는 날과 시각", "오는 졸업생 수", "말하는 시간", "강연 주제"],
      answer: 5,
      clue: "The twenty-seventh of November, at four.",
      explanation:
        "장소, 날짜와 시각, 인원, 말하는 시간은 말했지만 강연 주제는 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 성호야, 졸업생 강연 갈 거야?",
        "W: 오늘 아침에 계단 옆에 알림이 붙었더라.",
        "M: 2층 강의실에서 해.",
        "W: 강당이 아니고?",
        "M: 질문할 수 있게 강의실에서 해.",
        "W: 언제 해?",
        "M: 11월 27일 네 시에.",
        "W: 졸업생이 몇 명 와?",
        "M: 네 명, 서로 다른 분야에서.",
        "W: 한 사람이 얼마나 말해?",
        "M: 각자 15분씩 하고 질문을 받아.",
        "W: 미리 신청해야 해?",
        "M: 알림 옆 종이에 이름만 적으면 돼.",
        "W: 그럼 점심때 적어 놓을게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 겨울 방학 상담 주간에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. Here is news of the winter counselling week. " +
            "It runs from the twenty-ninth of December for five days. " +
            "Each appointment lasts thirty minutes, not the usual twenty. " +
            "Appointments are held in the counselling room on the first floor. " +
            "Book through the school website, not at the office. " +
            "You may bring one parent, but you do not have to. " +
            "Bring your own record of grades; we do not print it for you. " +
            "Three counsellors are available each day of the week. " +
            "Booking opens on the fifteenth of December at nine in the morning.",
        ],
      ],
      choices: [
        "12월 29일부터 닷새 동안 한다",
        "한 번에 30분씩 한다",
        "1층 상담실에서 한다",
        "학교 사무실에서 예약한다",
        "학부모 한 분과 함께 올 수 있다",
      ],
      answer: 4,
      clue: "Book through the school website, not at the office.",
      explanation:
        "사무실이 아니라 학교 누리집에서 예약한다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 겨울 방학 상담 주간을 알려 드립니다. 12월 29일부터 닷새 동안 진행합니다. 한 번에 평소 20분이 아니라 30분씩 합니다. 상담은 1층 상담실에서 합니다. 사무실이 아니라 학교 누리집으로 예약해 주세요. 학부모 한 분과 함께 오셔도 되고, 안 오셔도 됩니다. 성적 기록은 직접 챙겨 오세요. 저희가 뽑아 드리지 않습니다. 상담 선생님은 날마다 세 분 계십니다. 예약은 12월 15일 아침 아홉 시에 시작합니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 예약할 상담 시간을 고르시오.",
      lines: [
        ["M", "Bora, which counselling slot will you book?"],
        ["W", "Five are still open for that week."],
        ["M", "I looked at the page with you last night."],
        ["W", "They're all thirty minutes long."],
        ["M", "Can you come in the morning?"],
        ["W", "I work at my aunt's shop until one every day."],
        ["M", "Then the morning slots are out."],
        ["W", "Two of these five are in the morning."],
        ["M", "Which counsellor do you want to see?"],
        ["W", "Mr. Han, because he knows my file."],
        ["M", "One of the rest is with another counsellor."],
        ["W", "And it can't be on the thirty-first."],
        ["M", "That takes out one more of them."],
        ["W", "Then there's only one slot left for me."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "I work at my aunt's shop until one every day.",
      explanation:
        "오후이고, 한 선생님이며, 31일이 아닌 자리는 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Time: Morning / Counsellor: Mr. Han / Date: 29th" },
          { no: 2, label: "②", value: "Time: Morning / Counsellor: Ms. Oh / Date: 30th" },
          { no: 3, label: "③", value: "Time: Afternoon / Counsellor: Ms. Oh / Date: 30th" },
          { no: 4, label: "④", value: "Time: Afternoon / Counsellor: Mr. Han / Date: 31st" },
          { no: 5, label: "⑤", value: "Time: Afternoon / Counsellor: Mr. Han / Date: 2nd" },
        ],
      },
      translation: [
        "M: 보라야, 상담은 어느 시간으로 예약할 거야?",
        "W: 그 주에 다섯 자리가 아직 비어 있어.",
        "M: 어젯밤에 너랑 같이 화면을 봤잖아.",
        "W: 다 30분짜리야.",
        "M: 오전에 올 수 있어?",
        "W: 날마다 한 시까지 이모 가게에서 일해.",
        "M: 그럼 오전은 빠지네.",
        "W: 이 다섯 중 두 개가 오전이야.",
        "M: 어느 선생님께 받고 싶어?",
        "W: 한 선생님, 내 기록을 아시니까.",
        "M: 나머지 중 하나는 다른 선생님이야.",
        "W: 그리고 31일은 안 돼.",
        "M: 그럼 하나가 더 빠지네.",
        "W: 그럼 나한테 남는 자리는 하나뿐이야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Have you told your family which department you chose?"],
        ["W", "Not yet. I keep putting it off."],
        ["M", "It's easier while there's still time to talk about it."],
        ["W", "I know. I've been telling myself that for weeks."],
        ["M", "Why not say something at dinner tonight?"],
      ],
      choices: [
        "I already applied last year.",
        "Maybe I will, actually.",
        "My family moved away.",
        "There is no dinner tonight.",
        "I chose nothing at all.",
      ],
      answer: 2,
      clue: "Why not say something at dinner tonight?",
      explanation:
        "오늘 저녁에 말해 보라는 권유이므로, 그래 볼까 한다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 어느 학과를 골랐는지 집에 말했어?",
        "W: 아직. 계속 미루고 있어.",
        "M: 아직 의논할 시간이 있을 때가 더 쉬워.",
        "W: 알아. 몇 주째 나한테 그 말을 하고 있어.",
        "M: 오늘 저녁 먹을 때 말해 보는 게 어때?",
        "W: 그래 볼까 봐, 정말로.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, can I book a counselling slot at the office?"],
        ["M", "Booking is done through the school website."],
        ["W", "I tried last night but nothing came up."],
        ["M", "Booking doesn't open until the fifteenth."],
        ["W", "And what time on that day does it open?"],
      ],
      choices: [
        "Any time you like.",
        "At nine in the morning.",
        "The office is closed.",
        "Booking has ended.",
        "You can't book at all.",
      ],
      answer: 2,
      clue: "And what time on that day does it open?",
      explanation:
        "그날 몇 시에 열리는지 물었으므로, 아침 아홉 시라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 상담 예약은 사무실에서 하나요?",
        "M: 예약은 학교 누리집에서 합니다.",
        "W: 어젯밤에 해 봤는데 아무것도 안 떴어요.",
        "M: 예약은 15일에야 열립니다.",
        "W: 그날 몇 시에 열리나요?",
        "M: 아침 아홉 시입니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Suyeon, how did the mentoring programme go this year?"],
        ["W", "Twenty pairs started and six were still meeting in June."],
        ["M", "Did the mentors lose interest?"],
        ["W", "Most of them asked me when the next one starts."],
        ["M", "Then the will was there."],
        ["W", "They had to arrange every meeting themselves."],
        ["M", "Two students comparing timetables by message."],
        ["W", "It took four days to fix a single hour."],
        ["M", "And by then something else had come up."],
        ["W", "The pairs who kept going all had a fixed day."],
        ["M", "What would you set before the pairs even meet?"],
      ],
      choices: [
        "A longer list of mentors.",
        "The same hour every week.",
        "More pairs than last year.",
        "A written report each month.",
        "Nothing; they can arrange it.",
      ],
      answer: 2,
      clue: "What would you set before the pairs even meet?",
      explanation:
        "약속을 잡느라 무너졌으므로, 매주 같은 시간을 정해 두자는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수연아, 올해 멘토링은 어땠어?",
        "W: 스무 쌍이 시작해서 6월에 여섯 쌍이 남았어.",
        "M: 멘토들이 관심을 잃었어?",
        "W: 대부분은 다음 기수 언제 하냐고 물었어.",
        "M: 그럼 마음은 있었네.",
        "W: 만날 때마다 자기들끼리 약속을 잡아야 했어.",
        "M: 학생 둘이 문자로 시간표를 맞추는 거지.",
        "W: 한 시간 정하는 데 나흘이 걸렸어.",
        "M: 그쯤 되면 다른 일이 생기고.",
        "W: 끝까지 간 쌍들은 다 요일이 정해져 있었어.",
        "M: 만나기도 전에 무엇을 정해 두면 될까?",
        "W: 주마다 같은 시간을 정해 두자.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Wonho, you said you can't concentrate in the evening."],
        ["M", "After eight I read the same line four times."],
        ["W", "What do you study in the evening?"],
        ["M", "Whatever is hardest, because I have most time then."],
        ["W", "And in the morning?"],
        ["M", "I copy up notes, mostly."],
        ["W", "So the easy work gets your clearest hours."],
        ["M", "I'd never lined those two facts up."],
        ["W", "The hours aren't the problem; the order is."],
        ["M", "So I should swap them around."],
        ["W", "What will you do at seven tomorrow morning?"],
      ],
      choices: [
        "Copy up my notes again.",
        "Start with the hardest subject.",
        "Sleep for another hour.",
        "Read the same line twice.",
        "Nothing until the evening.",
      ],
      answer: 2,
      clue: "What will you do at seven tomorrow morning?",
      explanation:
        "맑은 시간에 어려운 것을 하라는 이야기이므로, 제일 어려운 과목부터 하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 원호야, 저녁에 집중이 안 된다고 했잖아.",
        "M: 여덟 시 넘으면 같은 줄을 네 번 읽어.",
        "W: 저녁에는 뭘 공부해?",
        "M: 제일 어려운 거. 그때 시간이 제일 많으니까.",
        "W: 아침에는?",
        "M: 주로 필기를 옮겨 적어.",
        "W: 그러니까 제일 맑은 시간을 쉬운 일에 주는구나.",
        "M: 그 두 가지를 나란히 놓고 본 적이 없어.",
        "W: 시간이 문제가 아니라 차례가 문제야.",
        "M: 그럼 둘을 바꿔야겠네.",
        "W: 내일 아침 일곱 시에 뭘 할 거야?",
        "M: 제일 어려운 과목부터 할게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Gyuri가 Seojun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Gyuri : ________________",
      lines: [
        [
          "W",
          "Gyuri and Seojun are tidying the counselling room after the parents' meeting. " +
            "Seojun is carrying the folders of student records out to the corridor " +
            "so that the chairs can be stacked against the wall. " +
            "The corridor is used by everyone on their way to the yard. " +
            "Gyuri knows the folders hold grades and family details " +
            "and that they are never meant to leave the room at all. " +
            "The cupboard behind the desk is empty and unlocked. " +
            "She wants him to put them in the cupboard instead. " +
            "In this situation, what would Gyuri most likely say to Seojun?",
        ],
      ],
      choices: [
        "Stack the chairs first.",
        "Take the folders to the office.",
        "Don't leave the records in the corridor.",
        "We need more folders.",
        "The meeting starts at seven.",
      ],
      answer: 3,
      clue: "She wants him to put them in the cupboard instead.",
      explanation:
        "학생 기록이 복도에 놓이면 안 되므로, 복도에 두지 말라는 ③이 가장 적절하다.",
      translation: [
        "W: 규리와 서준이는 학부모 모임이 끝난 뒤 상담실을 치우고 있습니다. 서준이는 의자를 벽에 쌓으려고 학생 기록 묶음을 복도로 내놓고 있습니다. 그 복도는 운동장으로 가는 사람이면 누구나 지나갑니다. 규리는 그 묶음에 성적과 가정 사정이 적혀 있다는 것과, 그것이 애초에 방 밖으로 나가서는 안 된다는 것을 압니다. 책상 뒤 장은 비어 있고 잠겨 있지도 않습니다. 그는 그것을 장 안에 넣기를 바랍니다. 이런 상황에서 규리가 서준이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why a language " +
            "can lose a sound that every speaker once used without thinking. " +
            "Sounds are not dropped by decision; they wear away at the edges. " +
            "A sound at the end of a word is spoken a little less clearly each generation, " +
            "because the listener can already tell what the word is without it. " +
            "Whatever the ear does not need, the mouth eventually stops making. " +
            "Spelling, fixed in books, keeps a record of the sound long after it is gone, " +
            "which is why so many written letters are no longer pronounced. " +
            "A language is not being ruined when this happens; it is being used.",
        ],
      ],
      choices: [
        "why languages lose sounds over time",
        "how children learn to pronounce words",
        "why spelling rules are so difficult",
        "how books changed the way we read",
        "why some languages have more letters",
      ],
      answer: 1,
      clue: "Whatever the ear does not need, the mouth eventually stops making.",
      explanation:
        "말소리가 세월에 따라 사라지는 까닭이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 모든 사람이 아무 생각 없이 내던 소리를 언어가 어떻게 잃어버리는지 이야기하려 합니다. 소리는 결정으로 버려지는 것이 아니라 가장자리부터 닳아 없어집니다. 낱말 끝의 소리는 세대가 지날수록 조금씩 덜 또렷하게 발음됩니다. 그것이 없어도 듣는 이가 무슨 낱말인지 알 수 있기 때문입니다. 귀가 필요로 하지 않는 것은 결국 입이 만들기를 그만둡니다. 책에 굳어진 철자는 소리가 사라진 뒤에도 오래도록 그 기록을 남깁니다. 그래서 적혀 있으면서도 발음되지 않는 글자가 그토록 많은 것입니다. 이런 일이 벌어질 때 언어는 망가지고 있는 것이 아니라 쓰이고 있는 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 것이 아닌 것을 고르시오.",
      lines: [
        ["M", "Sounds are not dropped by decision; they wear away at the edges."],
        ["M", "A sound at the end of a word is spoken less clearly each generation."],
        ["M", "Whatever the ear does not need, the mouth stops making."],
        ["M", "Spelling, fixed in books, keeps a record of the sound."],
        ["M", "Many written letters are no longer pronounced."],
      ],
      choices: ["the ear", "the mouth", "spelling", "books", "the hand"],
      answer: 5,
      clue: "Whatever the ear does not need, the mouth stops making.",
      explanation:
        "귀, 입, 철자, 책은 언급되지만 손은 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
