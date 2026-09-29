/** 고2 듣기 50회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 50회",
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
          "Good morning, students. This is the career counseling office. " +
            "Every November the same thing happens in this office. " +
            "Forty students come in the last week before the deadline, " +
            "and we have time to give each of them nine minutes. " +
            "Nine minutes is not a conversation; it is a form being filled in. " +
            "So this year we are opening the diary from today. " +
            "Twenty-minute slots are available every afternoon until the end of term. " +
            "Take one now, even if you are not sure what to ask. " +
            "A conversation in October is worth five in the last week. " +
            "The booking sheet hangs on the door of the counseling office.",
        ],
      ],
      choices: [
        "진로 상담을 미리 신청하라고 권하려고",
        "상담실 이전을 알리려고",
        "진로 특강을 안내하려고",
        "원서 마감일을 알리려고",
        "상담 교사를 소개하려고",
      ],
      answer: 1,
      clue: "Take one now, even if you are not sure what to ask.",
      explanation:
        "마감 전에 몰리지 말고 미리 상담을 신청하라고 권하고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 진로 상담실입니다. 11월마다 이 방에서는 같은 일이 벌어집니다. 마감 직전 한 주에 마흔 명이 찾아오고, 저희는 한 사람에게 9분씩밖에 드릴 수 없습니다. 9분은 대화가 아니라 서류를 채우는 시간입니다. 그래서 올해는 오늘부터 상담 일정을 엽니다. 학기 말까지 오후마다 20분짜리 자리가 있습니다. 무엇을 물어야 할지 몰라도 지금 하나 잡아 두세요. 10월의 대화 한 번이 마지막 주의 다섯 번만큼 값집니다. 예약표는 상담실 문에 걸려 있습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junho, you always bring a printed copy to the meeting."],
        ["M", "One page, printed, for everyone at the table."],
        ["W", "Isn't it easier to share the file in the chat?"],
        ["M", "Easier to send, harder to look at together."],
        ["W", "Everyone has a phone, though."],
        ["M", "And everyone looks at a different part of it."],
        ["W", "That's true. We talk past each other constantly."],
        ["M", "With one page on the table, we all point at the same line."],
        ["W", "So the paper is not about reading; it's about pointing."],
        ["M", "Exactly. A shared surface keeps the discussion in one place."],
        ["W", "I always thought printing was old-fashioned."],
        ["M", "Five people with one page argue better than five with five screens."],
        ["W", "I'll print ours for Thursday."],
      ],
      choices: [
        "한 장을 함께 보아야 의논이 모인다",
        "회의 자료는 미리 보내야 한다",
        "종이를 아껴 써야 한다",
        "회의는 짧게 해야 한다",
        "발언 순서를 정해야 한다",
      ],
      answer: 1,
      clue: "Five people with one page argue better than five with five screens.",
      explanation:
        "남자는 한 장을 함께 보아야 의논이 한곳에 모인다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 준호야, 너는 회의에 늘 출력한 걸 들고 오더라.",
        "M: 한 장, 출력해서, 탁자에 앉은 모두에게.",
        "W: 대화방에 파일을 올리는 게 편하지 않아?",
        "M: 보내기는 편하고 같이 보기는 어렵지.",
        "W: 그래도 다들 휴대폰이 있잖아.",
        "M: 그리고 다들 그 안의 다른 데를 보고 있지.",
        "W: 맞아. 우리는 늘 서로 딴 얘기를 해.",
        "M: 탁자에 한 장이 놓이면 다 같은 줄을 가리켜.",
        "W: 그러니까 종이는 읽기가 아니라 가리키기 때문이구나.",
        "M: 맞아. 같이 보는 면이 있어야 의논이 한곳에 머물러.",
        "W: 출력은 구식인 줄 알았어.",
        "M: 한 장을 보는 다섯 명이 화면 다섯 개를 보는 다섯 명보다 잘 다퉈.",
        "W: 목요일 것은 내가 출력해 갈게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We assume that the best way to fix a weakness is to attack it directly. " +
            "If your writing is poor, write more; if your listening is weak, listen more. " +
            "This is true, but it hides a second question nobody asks. " +
            "Weakness is rarely evenly spread across a subject. " +
            "A student who says she is bad at listening " +
            "is often perfectly fine except with numbers and dates. " +
            "Ten hours of general practice moves that student very little. " +
            "One hour spent only on numbers moves her a great deal. " +
            "Before you decide to work harder, find out exactly what is failing.",
        ],
      ],
      choices: [
        "약점을 정확히 찾아낸 뒤에 연습해야 한다",
        "약한 과목에 시간을 더 써야 한다",
        "연습은 꾸준히 해야 한다",
        "기초부터 다시 봐야 한다",
        "여러 과목을 골고루 공부해야 한다",
      ],
      answer: 1,
      clue: "Before you decide to work harder, find out exactly what is failing.",
      explanation:
        "더 애쓰기 전에 무엇이 무너지는지 정확히 찾으라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 우리는 약점을 고치는 가장 좋은 길이 그것을 정면으로 치는 것이라고 여깁니다. 글이 약하면 더 쓰고, 듣기가 약하면 더 들으라는 식입니다. 맞는 말이지만, 아무도 묻지 않는 두 번째 물음을 가립니다. 약점은 한 과목에 고르게 퍼져 있는 경우가 드뭅니다. 듣기를 못한다고 말하는 학생이 실은 숫자와 날짜만 빼면 아주 멀쩡한 경우가 많습니다. 그런 학생에게 열 시간의 일반적인 연습은 거의 아무것도 바꾸지 못합니다. 숫자에만 쓴 한 시간이 크게 바꿉니다. 더 애쓰기로 마음먹기 전에, 정확히 무엇이 무너지는지부터 알아내십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Nari, is this the photo of the club's reading room?"],
        ["W", "Yes, we finished arranging it on Friday."],
        ["M", "There's a long shelf along the back wall."],
        ["W", "All the novels are kept there."],
        ["M", "And two armchairs face each other in the middle."],
        ["W", "One armchair, actually. The other is a sofa."],
        ["M", "I see a small table between them."],
        ["W", "We put the visitors' book on it."],
        ["M", "There's a floor lamp in the left corner."],
        ["W", "It's the only light we use in the evening."],
        ["M", "And a rug covers most of the floor."],
        ["W", "The caretaker gave it to us in March."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "One armchair, actually. The other is a sofa.",
      explanation:
        "안락의자가 두 개라고 했지만 하나뿐이라고 했다. 따라서 답은 ②이다.",
      figure: {
        kind: "figure5",
        scene:
          "A small reading room in a school, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A LONG SHELF of books runs along the back wall. " +
          "TWO ARMCHAIRS face each other in the middle of the room. " +
          "A SMALL TABLE stands between the two armchairs. " +
          "A FLOOR LAMP stands in the left corner. " +
          "A RUG covers most of the floor.",
        spots: [
          [0.5, 0.2],
          [0.3, 0.55],
          [0.5, 0.6],
          [0.1, 0.42],
          [0.5, 0.88],
        ],
      },
      translation: [
        "M: 나리야, 이게 동아리 독서실 사진이야?",
        "W: 응, 금요일에 정리를 끝냈어.",
        "M: 뒷벽을 따라 긴 선반이 있네.",
        "W: 소설은 다 거기에 둬.",
        "M: 그리고 가운데에 안락의자 두 개가 마주 놓여 있고.",
        "W: 사실 안락의자는 하나야. 다른 하나는 소파야.",
        "M: 둘 사이에 작은 탁자가 보여.",
        "W: 그 위에 방명록을 놔뒀어.",
        "M: 왼쪽 구석에는 스탠드가 있네.",
        "W: 저녁에는 그것만 켜.",
        "M: 그리고 바닥을 거의 다 덮은 깔개가 있고.",
        "W: 3월에 관리 선생님이 주셨어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taemin, the parents' evening starts in an hour."],
        ["M", "The chairs are out and the name cards are placed."],
        ["W", "Did anyone bring the projector remote from the office?"],
        ["M", "I thought the teacher had it in her bag."],
        ["W", "She went to the district meeting at two."],
        ["M", "Then nobody has picked it up at all."],
        ["W", "It's in the drawer beside her desk."],
        ["M", "The teachers' room closes at five on Thursdays."],
        ["W", "It's ten to five right now."],
        ["M", "Then I have to go this minute."],
        ["W", "I'll finish handing out the programs."],
        ["M", "I'll go and get the projector remote."],
      ],
      choices: [
        "순서지를 나눠 주기",
        "이름표를 놓기",
        "영사기 리모컨을 가져오기",
        "선생님께 전화하기",
        "의자를 놓기",
      ],
      answer: 3,
      clue: "I'll go and get the projector remote.",
      explanation:
        "남자는 교무실에서 영사기 리모컨을 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 태민아, 학부모의 밤이 한 시간 뒤에 시작해.",
        "M: 의자는 놓았고 이름표도 놨어.",
        "W: 사무실에서 영사기 리모컨은 누가 가져왔어?",
        "M: 선생님 가방에 있는 줄 알았는데.",
        "W: 두 시에 지역 회의 가셨어.",
        "M: 그럼 아무도 안 찾아왔네.",
        "W: 선생님 책상 옆 서랍에 있어.",
        "M: 교무실은 목요일에 다섯 시에 닫아.",
        "W: 지금 다섯 시 10분 전이야.",
        "M: 그럼 당장 가야겠다.",
        "W: 나는 순서지 나눠 주는 걸 마무리할게.",
        "M: 내가 가서 영사기 리모컨을 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the copy shop. What can I do for you?"],
        ["W", "I need twenty copies of a five-page handout."],
        ["M", "Black and white is fifty cents a page."],
        ["W", "Is there a cheaper rate for larger orders?"],
        ["M", "Not under a hundred copies, I'm afraid."],
        ["W", "Then twenty it is."],
        ["M", "Do you want them stapled?"],
        ["W", "Yes, please. Is that extra?"],
        ["M", "Stapling is free for orders over ten copies."],
        ["W", "And is there a student rate?"],
        ["M", "Ten percent off the total with a school card."],
        ["W", "Here's my card. I'll pay now."],
      ],
      choices: ["$40.00", "$45.00", "$50.00", "$55.00", "$60.00"],
      answer: 2,
      clue: "Black and white is fifty cents a page.",
      explanation:
        "다섯 쪽짜리 20부면 100쪽으로 50달러인데, 10퍼센트를 빼면 45달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 복사집에 오신 걸 환영합니다. 무엇을 도와드릴까요?",
        "W: 다섯 쪽짜리 유인물을 스무 부 뽑아야 해요.",
        "M: 흑백은 한 쪽에 50센트입니다.",
        "W: 많이 하면 값이 싸지나요?",
        "M: 아쉽지만 백 부 아래로는 그렇지 않습니다.",
        "W: 그럼 스무 부로 할게요.",
        "M: 묶어 드릴까요?",
        "W: 네, 부탁드려요. 값이 더 드나요?",
        "M: 열 부가 넘으면 묶는 건 무료입니다.",
        "W: 학생 할인은 있나요?",
        "M: 학생증이 있으면 전체에서 10퍼센트 할인됩니다.",
        "W: 여기 학생증이요. 지금 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 발표를 미룬 이유를 고르시오.",
      lines: [
        ["W", "Kiwon, I heard you asked to present next week instead."],
        ["W", "Your slides have been ready since Monday."],
        ["M", "They are, and I have practised twice."],
        ["W", "Then were you worried about speaking?"],
        ["M", "No more than usual, honestly."],
        ["W", "Did the teacher suggest the change?"],
        ["M", "She agreed to it, but the idea was mine."],
        ["W", "So what made you ask?"],
        ["M", "Our class is presenting right after the mock exam."],
        ["W", "On the same afternoon?"],
        ["M", "Nobody would hear a word of it, including me."],
        ["W", "Then waiting a week makes complete sense."],
      ],
      choices: [
        "모의고사 직후라 집중이 어려워서",
        "발표 자료를 못 만들어서",
        "긴장이 되어서",
        "선생님이 바꾸라고 하셔서",
        "몸이 아파서",
      ],
      answer: 1,
      clue: "Our class is presenting right after the mock exam.",
      explanation:
        "모의고사 직후라 아무도 집중하지 못할 것이라 미뤘다. 따라서 답은 ①이다.",
      translation: [
        "W: 기원아, 다음 주에 발표하겠다고 했다며.",
        "W: 발표 자료는 월요일부터 준비돼 있었잖아.",
        "M: 맞아. 연습도 두 번 했어.",
        "W: 그럼 말하는 게 걱정됐어?",
        "M: 솔직히 평소보다 더하지는 않아.",
        "W: 선생님이 바꾸자고 하셨어?",
        "M: 허락은 하셨는데 생각은 내가 했어.",
        "W: 그럼 왜 그랬어?",
        "M: 우리 반 발표가 모의고사 바로 다음이야.",
        "W: 같은 날 오후에?",
        "M: 나까지 포함해서 아무도 한 마디도 못 들을 거야.",
        "W: 그럼 일주일 미루는 게 아주 말이 되네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 연극 공연에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Suyeon, is the drama club performing this term?"],
        ["M", "I saw a notice on the hall door this morning."],
        ["W", "We perform on the last Thursday of November."],
        ["M", "Where is it held?"],
        ["W", "In the main hall, starting at four o'clock."],
        ["M", "How long is the play?"],
        ["W", "About fifty minutes, with no interval."],
        ["M", "How many people are in the cast?"],
        ["W", "Eleven on stage and four behind it."],
        ["M", "Do we need a ticket to come in?"],
        ["W", "No tickets. Just come and find a seat."],
        ["M", "Then I'll bring two friends with me."],
        ["W", "Come early if you want the front rows."],
      ],
      choices: ["공연하는 날", "공연하는 곳과 시각", "공연 길이", "출연 인원", "연습 기간"],
      answer: 5,
      clue: "We perform on the last Thursday of November.",
      explanation:
        "날짜, 장소와 시각, 길이, 인원은 말했지만 연습 기간은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 수연아, 이번 학기에 연극 동아리 공연해?",
        "M: 오늘 아침에 강당 문에 알림을 봤어.",
        "W: 11월 마지막 목요일에 공연해.",
        "M: 어디서 해?",
        "W: 대강당에서 네 시에 시작해.",
        "M: 연극이 얼마나 길어?",
        "W: 쉬는 시간 없이 50분쯤.",
        "M: 출연진이 몇 명이야?",
        "W: 무대에 열한 명, 뒤에 네 명.",
        "M: 들어가려면 표가 필요해?",
        "W: 표는 없어. 그냥 와서 자리 잡으면 돼.",
        "M: 그럼 친구 둘 데려갈게.",
        "W: 앞줄에 앉고 싶으면 일찍 와.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 겨울 방학 독서 프로그램에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, students. Here is the plan for the winter reading programme. " +
            "It runs for four weeks, from the fifth of January. " +
            "You may borrow five books at a time instead of the usual three. " +
            "Write one short review for each book you finish. " +
            "Reviews are sent to the library email, not written on paper. " +
            "Students who finish eight books receive a book coupon. " +
            "The library is open from ten until four on weekdays. " +
            "It is closed on Saturdays and Sundays during the break. " +
            "Sign up at the library desk before the break starts.",
        ],
      ],
      choices: [
        "1월 5일부터 4주 동안 진행된다",
        "한 번에 다섯 권까지 빌릴 수 있다",
        "다 읽은 책마다 짧은 감상을 쓴다",
        "감상은 전자우편으로 보낸다",
        "주말에도 도서관을 연다",
      ],
      answer: 5,
      clue: "It is closed on Saturdays and Sundays during the break.",
      explanation:
        "방학 중 주말에는 닫는다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 겨울 독서 프로그램 계획을 알려 드립니다. 1월 5일부터 4주 동안 진행됩니다. 평소 세 권 대신 한 번에 다섯 권까지 빌릴 수 있습니다. 다 읽은 책마다 짧은 감상을 한 편씩 써 주세요. 감상은 종이에 쓰지 말고 도서관 전자우편으로 보내 주세요. 여덟 권을 다 읽은 학생은 도서 상품권을 받습니다. 도서관은 평일 열 시부터 네 시까지 엽니다. 방학 중 토요일과 일요일에는 문을 닫습니다. 방학이 시작되기 전에 도서관 안내대에서 신청해 주세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 예약할 스터디룸을 고르시오.",
      lines: [
        ["M", "Chaewon, which study room will your group book?"],
        ["W", "Five rooms are open at the city library this week."],
        ["M", "How many of you are meeting?"],
        ["W", "Six, including the two who joined in October."],
        ["M", "Then rooms for four are out for you."],
        ["W", "Two of these hold only four people."],
        ["M", "What about the fee for each hour?"],
        ["W", "Under eight thousand won, that's what we agreed."],
        ["M", "One room is above that amount."],
        ["W", "And it has to be on the ground floor."],
        ["M", "Because of the boxes of books you carry."],
        ["W", "Then only one room fits everything."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Six, including the two who joined in October.",
      explanation:
        "6명 수용, 시간당 8천 원 미만, 1층인 방은 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "People: 4 / Fee: 5,000 won / Floor: Ground" },
          { no: 2, label: "②", value: "People: 8 / Fee: 10,000 won / Floor: Ground" },
          { no: 3, label: "③", value: "People: 4 / Fee: 6,000 won / Floor: 2nd" },
          { no: 4, label: "④", value: "People: 8 / Fee: 7,500 won / Floor: Ground" },
          { no: 5, label: "⑤", value: "People: 8 / Fee: 7,000 won / Floor: 2nd" },
        ],
      },
      translation: [
        "M: 채원아, 너희 모임은 어떤 스터디룸을 예약할 거야?",
        "W: 이번 주에 시립 도서관에 다섯 개가 비어 있어.",
        "M: 몇 명이 모여?",
        "W: 10월에 들어온 둘까지 여섯 명.",
        "M: 그럼 네 명짜리 방은 빠지네.",
        "W: 이 중 두 곳은 네 명까지만 돼.",
        "M: 한 시간에 얼마씩인데?",
        "W: 8천 원 미만, 그렇게 정했어.",
        "M: 한 곳은 그보다 비싸.",
        "W: 그리고 1층이어야 해.",
        "M: 책 상자를 들고 다니니까.",
        "W: 그럼 다 맞는 건 하나뿐이야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Have you booked your counseling slot yet?"],
        ["W", "I looked at the sheet but didn't write my name."],
        ["M", "The afternoon slots go quickly."],
        ["W", "I'd better do it soon, then."],
        ["M", "Shall we walk down and sign up together?"],
      ],
      choices: [
        "Sure, right after this class.",
        "The counseling ended last month.",
        "I don't need any advice.",
        "There is no sheet.",
        "The office moved away.",
      ],
      answer: 1,
      clue: "Shall we walk down and sign up together?",
      explanation:
        "같이 내려가 신청하자는 제안이므로, 이 수업 끝나고 하자는 ①이 가장 자연스럽다.",
      translation: [
        "M: 상담 자리 예약했어?",
        "W: 표는 봤는데 이름은 안 적었어.",
        "M: 오후 자리는 금방 차.",
        "W: 그럼 빨리 해야겠다.",
        "M: 같이 내려가서 신청할까?",
        "W: 좋아, 이 수업 끝나고 바로.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, can I take a book out of the reading room?"],
        ["M", "The ones on the blue shelf may not leave."],
        ["W", "What about the ones on the wooden shelf?"],
        ["M", "Those you can borrow for two weeks."],
        ["W", "How do I know which shelf a book came from?"],
      ],
      choices: [
        "The shelves are all the same.",
        "There's a colour mark on the spine.",
        "I don't work in the library.",
        "You can't borrow anything.",
        "Two weeks is too long.",
      ],
      answer: 2,
      clue: "How do I know which shelf a book came from?",
      explanation:
        "어느 선반 책인지 어떻게 아는지 물었으므로, 책등에 색 표시가 있다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 열람실에서 책을 가지고 나가도 되나요?",
        "M: 파란 선반에 있는 것은 나갈 수 없습니다.",
        "W: 나무 선반에 있는 것은요?",
        "M: 그건 두 주 동안 빌리실 수 있습니다.",
        "W: 어느 선반 책인지 어떻게 알 수 있나요?",
        "M: 책등에 색 표시가 있습니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangjun, how is the club's equipment list going?"],
        ["M", "We wrote one in March and nobody has looked at it since."],
        ["W", "Where is the list kept?"],
        ["M", "In a file on the club computer, in a folder."],
        ["W", "So checking it means turning on a computer."],
        ["M", "And the computer takes four minutes to start."],
        ["W", "Nobody checks a list that takes four minutes to open."],
        ["M", "That is probably why things keep going missing."],
        ["W", "Where do people stand when they take equipment out?"],
        ["M", "Right in front of the cupboard by the door."],
        ["W", "What could go on the cupboard door itself?"],
      ],
      choices: [
        "Nothing would fit there.",
        "A printed list, updated monthly.",
        "We'll buy a faster computer.",
        "The cupboard should be locked.",
        "Lists never work at all.",
      ],
      answer: 2,
      clue: "What could go on the cupboard door itself?",
      explanation:
        "장 문에 무엇을 붙일지 물었으므로, 달마다 고치는 출력본이라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 상준아, 동아리 기자재 목록은 잘돼 가?",
        "M: 3월에 하나 만들었는데 그 뒤로 아무도 안 봤어.",
        "W: 목록을 어디에 둬?",
        "M: 동아리 컴퓨터 안 폴더에 파일로.",
        "W: 그럼 확인하려면 컴퓨터를 켜야 하네.",
        "M: 그 컴퓨터는 켜지는 데 4분 걸려.",
        "W: 여는 데 4분 걸리는 목록은 아무도 안 봐.",
        "M: 그래서 물건이 자꾸 없어지는 걸 거야.",
        "W: 사람들이 기자재를 꺼낼 때 어디에 서 있어?",
        "M: 문 옆 장 바로 앞에.",
        "W: 그 장 문에는 뭘 붙이면 될까?",
        "M: 달마다 고쳐 붙이는 출력본.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Bora, you said you forget half of every lecture."],
        ["W", "By the evening it's mostly gone."],
        ["M", "Do you write anything down during class?"],
        ["W", "I write everything, as fast as I can."],
        ["M", "So your hand is busy the whole hour."],
        ["W", "I never look up from the page."],
        ["M", "Then you hear the words but never watch the explanation."],
        ["W", "I hadn't thought about what I was missing."],
        ["M", "Write less and look up more, and see what happens."],
        ["W", "That would mean choosing what not to write."],
        ["M", "What would you keep writing down?"],
      ],
      choices: [
        "Absolutely everything.",
        "Only what isn't in the book.",
        "I'll stop writing at all.",
        "Nothing is worth writing.",
        "I'll write even faster.",
      ],
      answer: 2,
      clue: "What would you keep writing down?",
      explanation:
        "무엇을 계속 적을지 물었으므로, 책에 없는 것만이라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 보라야, 수업의 절반을 잊어버린다고 했잖아.",
        "W: 저녁이면 거의 다 사라져.",
        "M: 수업 중에 뭔가 적어?",
        "W: 최대한 빠르게 전부 다 적어.",
        "M: 그럼 한 시간 내내 손이 바쁘겠네.",
        "W: 종이에서 고개를 든 적이 없어.",
        "M: 그럼 말은 듣지만 설명을 보지는 못하는 거야.",
        "W: 내가 뭘 놓치는지는 생각 못 했어.",
        "M: 덜 적고 더 올려다봐. 어떻게 되는지 보고.",
        "W: 그럼 뭘 안 적을지 골라야 한다는 거네.",
        "M: 뭘 계속 적을 거야?",
        "W: 책에 없는 것만.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Dohyun이 Yerin에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Dohyun : ________________",
      lines: [
        [
          "M",
          "Dohyun and Yerin are packing the club's equipment after the festival. " +
            "Yerin is putting the microphones into the case one by one, " +
            "and she has laid them on top of one another without the foam dividers. " +
            "The dividers are sitting on the table beside the case. " +
            "The case will be carried down two flights of stairs and across the yard. " +
            "Dohyun knows that microphones knocking together crack inside, " +
            "and the club would not be able to replace them this year. " +
            "He wants her to put the dividers in before closing the case. " +
            "In this situation, what would Dohyun most likely say to Yerin?",
        ],
      ],
      choices: [
        "Put more microphones in the case.",
        "The festival starts tomorrow.",
        "Don't forget the foam dividers.",
        "Let's leave the case here.",
        "We need a bigger case.",
      ],
      answer: 3,
      clue: "He wants her to put the dividers in before closing the case.",
      explanation:
        "칸막이 없이 마이크를 겹쳐 넣으면 부딪혀 상하므로, 칸막이를 넣으라는 ③이 가장 적절하다.",
      translation: [
        "M: 도현이와 예린이는 축제가 끝난 뒤 동아리 기자재를 챙기고 있습니다. 예린이는 마이크를 하나씩 가방에 넣고 있는데, 스펀지 칸막이를 빼놓은 채 서로 겹쳐 놓았습니다. 칸막이는 가방 옆 탁자에 놓여 있습니다. 이 가방은 계단 두 층을 내려가 마당을 가로질러 옮겨집니다. 도현이는 마이크끼리 부딪히면 안이 갈라지고, 올해 동아리가 새로 살 수 없다는 것을 압니다. 그는 가방을 닫기 전에 칸막이를 넣기를 바랍니다. 이런 상황에서 도현이가 예린이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about the ways animals " +
            "decide together without anyone giving an order. " +
            "A colony of bees choosing a new home sends out scouts, " +
            "and each scout dances longer for a site she judges better. " +
            "Other bees visit the site and dance for it themselves, " +
            "until one dance has more bees than any other and the swarm leaves. " +
            "Deer in a herd rise to their feet one at a time, " +
            "and the herd moves when more than half are standing. " +
            "Ants choosing between two food trails simply reinforce the shorter one, " +
            "because the round trip is faster and the chemical is fresher. " +
            "None of them counts, and yet the count is somehow made.",
        ],
      ],
      choices: [
        "how animal groups make decisions without a leader",
        "why bees build hives in hollow trees",
        "how deer protect themselves from wolves",
        "why ants follow the same paths",
        "how animals find food in winter",
      ],
      answer: 1,
      clue: "None of them counts, and yet the count is somehow made.",
      explanation:
        "우두머리 없이 무리가 결정을 내리는 방식이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 동물 무리가 아무도 명령하지 않는데 어떻게 함께 결정하는지 이야기하려 합니다. 새 집을 고르는 꿀벌 무리는 정찰벌을 내보내고, 정찰벌은 자기가 더 낫다고 여긴 자리일수록 더 오래 춤을 춥니다. 다른 벌들이 그 자리를 가 보고 스스로 그 자리를 위해 춤을 추다가, 어느 한 춤에 벌이 가장 많아지면 무리가 떠납니다. 무리 속 사슴은 한 마리씩 일어서고, 절반이 넘게 서면 무리가 움직입니다. 두 갈래 먹이 길 가운데 고르는 개미는 그저 짧은 쪽을 더 다질 뿐입니다. 왕복이 빠르니 그 냄새가 더 새롭기 때문입니다. 어느 쪽도 세지 않는데, 어찌 된 일인지 셈은 이루어집니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 동물이 아닌 것을 고르시오.",
      lines: [
        ["M", "A colony of bees choosing a new home sends out scouts."],
        ["M", "Other bees visit the site and dance for it themselves."],
        ["M", "Deer in a herd rise to their feet one at a time."],
        ["M", "Ants choosing between two food trails reinforce the shorter one."],
        ["M", "None of them counts, and yet the count is somehow made."],
      ],
      choices: ["bees", "deer", "ants", "scouts", "fish"],
      answer: 5,
      clue: "Ants choosing between two food trails reinforce the shorter one.",
      explanation:
        "꿀벌, 사슴, 개미, 정찰벌은 언급되지만 물고기는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
