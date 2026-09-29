/** 고2 듣기 43회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 43회",
  gradeLevel: "high2",
  speechSpeed: 0.8,
  folder: "고2 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good morning, students. This is the school library speaking. " +
            "Last year we bought two hundred new books for this library, " +
            "and forty of them have never once been borrowed. " +
            "The reason, we now think, is that nobody chose them but us. " +
            "This year we are handing that decision over to you. " +
            "From today until the end of the month, a box sits by the entrance " +
            "with slips of paper for you to write the title you want. " +
            "You may write as many slips as you like, one title on each. " +
            "We will buy as many of your requests as the budget allows, " +
            "and the list of what we bought goes up on the door in December. " +
            "Tell us what you would actually read.",
        ],
      ],
      choices: [
        "희망 도서 신청을 받으려고",
        "도서 반납을 당부하려고",
        "독서 행사 참가를 권하려고",
        "도서관 공사를 알리려고",
        "새로 들어온 책을 소개하려고",
      ],
      answer: 1,
      clue: "with slips of paper for you to write the title you want",
      explanation:
        "학생들이 읽고 싶은 책을 적어 내도록 신청을 받고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 학교 도서관입니다. 작년에 이 도서관에 새 책 200권을 들였는데, 그중 마흔 권은 한 번도 대출되지 않았습니다. 이제 와 생각해 보니 그 책들을 고른 사람이 저희뿐이었기 때문입니다. 올해는 그 결정을 여러분께 넘깁니다. 오늘부터 이번 달 말까지 입구 옆에 상자를 두고, 원하는 책 제목을 적을 쪽지를 함께 놓아 둡니다. 쪽지는 원하는 만큼 쓰셔도 되고, 한 장에 한 권씩 적어 주세요. 예산이 닿는 데까지 여러분이 신청한 책을 사겠습니다. 무엇을 샀는지는 12월에 문에 붙여 알려 드립니다. 여러분이 정말 읽을 책을 알려 주세요.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Bora, you always solve the problems before reading the explanation."],
        ["W", "Even when I have no idea how to start."],
        ["M", "Isn't that just wasting twenty minutes?"],
        ["W", "Those twenty minutes decide whether the explanation sticks."],
        ["M", "The explanation is the same either way, though."],
        ["W", "The explanation is. What you bring to it isn't."],
        ["M", "So you read it differently after struggling."],
        ["W", "I read it looking for one specific thing I couldn't do."],
        ["M", "I usually read it looking at nothing in particular."],
        ["W", "And an hour later it's gone, isn't it?"],
        ["M", "Every single time, honestly."],
        ["W", "An explanation only lands where a question already is."],
        ["M", "I'll try the problem first tonight."],
      ],
      choices: [
        "먼저 씨름해 봐야 해설이 제대로 들어온다",
        "해설을 꼼꼼히 읽어야 한다",
        "문제를 많이 풀어야 실력이 는다",
        "모르는 것은 바로 물어야 한다",
        "오답 노트를 만들어야 한다",
      ],
      answer: 1,
      clue: "An explanation only lands where a question already is.",
      explanation:
        "여자는 먼저 씨름해야 해설이 자리를 잡는다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 보라야, 너는 늘 해설을 읽기 전에 문제부터 풀더라.",
        "W: 어떻게 시작할지 모를 때도 그래.",
        "M: 그거 20분을 그냥 버리는 거 아니야?",
        "W: 그 20분이 해설이 남느냐 마느냐를 정해.",
        "M: 해설은 어차피 같은 해설이잖아.",
        "W: 해설은 같지. 네가 들고 가는 것이 다른 거야.",
        "M: 그러니까 씨름한 뒤에는 다르게 읽는다는 거구나.",
        "W: 내가 못 한 딱 한 가지를 찾으면서 읽어.",
        "M: 나는 보통 아무것도 안 찾으면서 읽어.",
        "W: 그러고 한 시간 뒤면 사라지지?",
        "M: 솔직히 매번 그래.",
        "W: 해설은 물음이 이미 있는 자리에만 내려앉아.",
        "M: 오늘 밤엔 문제부터 풀어 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When we cannot finish something, we usually blame the amount of time. " +
            "There was not enough of it, we say, and we half believe it. " +
            "But look closely at a week that ended badly. " +
            "The hours were there; they arrived in pieces of nine minutes. " +
            "Nine minutes before a class, seven while waiting for a bus, " +
            "twelve between dinner and the phone call that never came. " +
            "Work that needs an hour cannot live in those pieces, " +
            "but work that needs nine minutes can, and there is always some. " +
            "So keep a short list of nine-minute tasks beside the long one. " +
            "The week does not give you hours; it gives you fragments.",
        ],
      ],
      choices: [
        "짧은 자투리 시간에 맞는 일을 따로 준비해야 한다",
        "시간이 부족할 때는 계획을 줄여야 한다",
        "집중은 한 번에 오래 해야 한다",
        "휴식 시간을 정해 두어야 한다",
        "일정을 미리 적어 두어야 한다",
      ],
      answer: 1,
      clue: "keep a short list of nine-minute tasks beside the long one",
      explanation:
        "자투리 시간에 맞는 짧은 일 목록을 따로 두라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 무언가를 끝내지 못하면 우리는 대개 시간의 양을 탓합니다. 시간이 모자랐다고 말하고, 반쯤은 그렇게 믿습니다. 그러나 형편없이 끝난 한 주를 자세히 들여다보십시오. 시간은 있었습니다. 다만 9분짜리 조각으로 왔을 뿐입니다. 수업 전 9분, 버스를 기다리는 7분, 저녁 식사와 끝내 오지 않은 전화 사이의 12분. 한 시간이 필요한 일은 그 조각 안에 살 수 없지만, 9분이면 되는 일은 살 수 있고 그런 일은 언제나 있습니다. 그러니 긴 목록 옆에 9분짜리 일의 짧은 목록을 두십시오. 한 주는 우리에게 시간을 주지 않습니다. 조각을 줍니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junho, is this the photo of the club's darkroom?"],
        ["M", "Yes, we finished setting it up last weekend."],
        ["W", "There's a long sink against the right wall."],
        ["M", "All the washing happens there."],
        ["W", "And a red lamp hangs from the ceiling."],
        ["M", "It's the only light we can use with the film."],
        ["W", "I see three trays lined up on the bench."],
        ["M", "Four trays, actually. One is behind the others."],
        ["W", "There's a clock on the wall above the bench."],
        ["M", "We time the developing with it."],
        ["W", "And a shelf of bottles sits under the window."],
        ["M", "The window is covered, of course."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Four trays, actually. One is behind the others.",
      explanation:
        "쟁반이 세 개라고 했지만 네 개라고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A photography darkroom, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A LONG SINK stands against the right wall. " +
          "A RED LAMP hangs from the ceiling in the middle. " +
          "THREE FLAT TRAYS are lined up on a bench. " +
          "A CLOCK hangs on the wall above the bench. " +
          "A SHELF OF BOTTLES stands under the covered window.",
        spots: [
          [0.86, 0.55],
          [0.5, 0.12],
          [0.42, 0.62],
          [0.42, 0.3],
          [0.12, 0.66],
        ],
      },
      translation: [
        "W: 준호야, 이게 동아리 암실 사진이야?",
        "M: 응, 지난 주말에 꾸미기를 끝냈어.",
        "W: 오른쪽 벽에 긴 개수대가 있네.",
        "M: 씻는 건 다 거기서 해.",
        "W: 그리고 천장에 빨간 등이 달려 있고.",
        "M: 필름을 다룰 때 쓸 수 있는 유일한 빛이야.",
        "W: 작업대에 쟁반이 세 개 놓여 있는 게 보여.",
        "M: 사실 네 개야. 하나가 뒤에 가려졌어.",
        "W: 작업대 위 벽에 시계가 있네.",
        "M: 그걸로 현상 시간을 재.",
        "W: 그리고 창문 아래에 병이 놓인 선반이 있고.",
        "M: 창문은 당연히 가려 놨어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Yerin, the exhibition opens in fifty minutes."],
        ["W", "The works are hung and the labels are on."],
        ["M", "Did anyone bring the folding table for the leaflets?"],
        ["W", "I thought it was already in the hallway."],
        ["M", "I checked twice and there's nothing there."],
        ["W", "Then it's still in the storage room downstairs."],
        ["M", "That room is locked after four on Fridays."],
        ["W", "It's ten to four right now."],
        ["M", "Then somebody has to run down this minute."],
        ["W", "I know where the caretaker keeps the key."],
        ["M", "I'll finish taping the labels here."],
        ["W", "I'll go and bring the folding table up."],
      ],
      choices: [
        "이름표를 붙이기",
        "작품을 걸기",
        "접이식 탁자를 가져오기",
        "안내지를 인쇄하기",
        "손님을 맞이하기",
      ],
      answer: 3,
      clue: "I'll go and bring the folding table up.",
      explanation:
        "여자는 창고에서 접이식 탁자를 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "M: 예린아, 전시가 50분 뒤에 열어.",
        "W: 작품은 걸었고 이름표도 붙였어.",
        "M: 안내지 놓을 접이식 탁자는 누가 가져왔어?",
        "W: 복도에 이미 있는 줄 알았는데.",
        "M: 두 번 봤는데 아무것도 없었어.",
        "W: 그럼 아직 아래층 창고에 있겠다.",
        "M: 그 방은 금요일에 네 시 넘으면 잠겨.",
        "W: 지금 네 시 10분 전이야.",
        "M: 그럼 누가 당장 뛰어 내려가야 해.",
        "W: 관리 선생님이 열쇠를 어디 두시는지 알아.",
        "M: 나는 여기서 이름표 붙이는 걸 끝낼게.",
        "W: 내가 가서 접이식 탁자를 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the music shop. What are you looking for today?"],
        ["M", "I need two sets of guitar strings and one capo."],
        ["W", "The strings are nine dollars a set this month."],
        ["M", "Were they more expensive than that before?"],
        ["W", "Eleven dollars a set until the end of September."],
        ["M", "Good timing on my part, then."],
        ["W", "We lowered them when the new stock arrived."],
        ["M", "And how much is the capo?"],
        ["W", "The simple one is seven dollars, the metal one twelve."],
        ["M", "I'll take the simple one, please."],
        ["W", "Members of the music club get ten percent off."],
        ["M", "I joined back in March. Here is my card."],
        ["W", "Then the discount applies to everything you bought."],
        ["M", "Great, I'll pay by card."],
      ],
      choices: ["$20.70", "$21.60", "$22.00", "$22.50", "$25.00"],
      answer: 4,
      clue: "The strings are nine dollars a set this month.",
      explanation:
        "줄 두 세트 18달러와 카포 7달러로 25달러인데, 10퍼센트를 빼면 22.50달러이다. 따라서 답은 ④이다.",
      translation: [
        "W: 악기점에 오신 걸 환영합니다. 오늘은 무엇을 찾으세요?",
        "M: 기타 줄 두 세트랑 카포 하나가 필요해요.",
        "W: 이번 달 줄은 한 세트에 9달러입니다.",
        "M: 전에는 그보다 비쌌나요?",
        "W: 9월 말까지는 한 세트에 11달러였습니다.",
        "M: 때를 잘 맞춰 왔네요.",
        "W: 새 물건이 들어오면서 값을 내렸습니다.",
        "M: 카포는 얼마예요?",
        "W: 단순한 것은 7달러, 금속으로 된 것은 12달러입니다.",
        "M: 단순한 걸로 주세요.",
        "W: 음악 동아리 회원은 10퍼센트 할인됩니다.",
        "M: 3월에 가입했어요. 여기 카드요.",
        "W: 그럼 사신 것 전부에 할인이 들어갑니다.",
        "M: 좋네요, 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 모의고사를 다시 보게 된 이유를 고르시오.",
      lines: [
        ["M", "Chaewon, I heard you're taking the mock exam again on Saturday."],
        ["M", "You already took it with everyone else last week."],
        ["W", "I sat in the same room and answered every question."],
        ["M", "Did you run out of time at the end?"],
        ["W", "I finished with ten minutes to spare, actually."],
        ["M", "Then were you unwell that morning?"],
        ["W", "I felt fine the whole way through."],
        ["M", "So why do it again?"],
        ["W", "My answer sheet was collected before I filled in the last page."],
        ["M", "The proctor took it early?"],
        ["W", "She misread the clock by five minutes."],
        ["M", "Then of course they have to let you take it again."],
      ],
      choices: [
        "답안지가 일찍 걷혀서",
        "시간이 모자라서",
        "몸이 아파서",
        "시험장을 잘못 찾아서",
        "문제지가 잘못 배부되어서",
      ],
      answer: 1,
      clue: "My answer sheet was collected before I filled in the last page.",
      explanation:
        "감독관이 시각을 잘못 봐 답안지가 일찍 걷혔다. 따라서 답은 ①이다.",
      translation: [
        "M: 채원아, 토요일에 모의고사를 다시 본다며.",
        "M: 지난주에 다들이랑 이미 봤잖아.",
        "W: 같은 교실에 앉아서 문제를 다 풀었어.",
        "M: 끝에 시간이 모자랐어?",
        "W: 오히려 10분 남기고 끝냈어.",
        "M: 그럼 그날 아침에 몸이 안 좋았어?",
        "W: 끝까지 멀쩡했어.",
        "M: 그럼 왜 다시 봐?",
        "W: 마지막 쪽을 채우기 전에 답안지가 걷혔어.",
        "M: 감독 선생님이 일찍 걷으셨어?",
        "W: 시계를 5분 잘못 보셨어.",
        "M: 그럼 당연히 다시 보게 해 줘야지.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 학교 토론 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Sangjun, are you entering the school debate contest?"],
        ["W", "The notice went up outside the staff room this morning."],
        ["M", "I read it. When does it take place?"],
        ["W", "On the second Wednesday of next month, after school."],
        ["M", "How many students make up a team?"],
        ["W", "Three, and one of them speaks last."],
        ["M", "Do we know the topic in advance?"],
        ["W", "It's announced one week before the contest."],
        ["M", "How long does each speech run?"],
        ["W", "Four minutes each, with two minutes for questions."],
        ["M", "That's tighter than last year."],
        ["W", "Sign up at the staff room by next Tuesday."],
        ["M", "Then I need to find two partners today."],
      ],
      choices: ["열리는 날", "한 팀의 인원", "주제를 알려 주는 때", "연설 시간", "심사 위원"],
      answer: 5,
      clue: "On the second Wednesday of next month, after school.",
      explanation:
        "날짜, 인원, 주제 공개 시점, 시간은 말했지만 심사 위원은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 상준아, 교내 토론 대회에 나갈 거야?",
        "W: 오늘 아침에 교무실 밖에 알림이 붙었어.",
        "M: 읽었어. 언제 해?",
        "W: 다음 달 둘째 주 수요일, 방과 후에.",
        "M: 한 팀이 몇 명이야?",
        "W: 세 명이고 그중 한 명이 마지막에 말해.",
        "M: 주제를 미리 알려 줘?",
        "W: 대회 일주일 전에 알려 줘.",
        "M: 한 사람이 얼마나 말해?",
        "W: 각자 4분, 질문에 2분.",
        "M: 작년보다 빡빡하네.",
        "W: 다음 주 화요일까지 교무실에서 신청해.",
        "M: 그럼 오늘 두 명을 찾아야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 학교 벼룩시장에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, students. Here is the plan for the school flea market. " +
            "It takes place next Saturday in the yard behind the gymnasium. " +
            "The market runs from ten in the morning until two in the afternoon. " +
            "Each class is given one table, and you share it among yourselves. " +
            "You may sell books, clothes, stationery and small household items. " +
            "Food and drinks may not be sold at any table this year. " +
            "Set your prices between one and five thousand won. " +
            "All the money raised goes to the animal shelter in our town. " +
            "Tables are set up from nine, so come a little early.",
        ],
      ],
      choices: [
        "체육관 뒤 마당에서 열린다",
        "오전 열 시부터 오후 두 시까지 한다",
        "반마다 탁자 하나를 받는다",
        "음식과 음료는 팔 수 없다",
        "수익금은 학급 운영비로 쓴다",
      ],
      answer: 5,
      clue: "All the money raised goes to the animal shelter in our town.",
      explanation:
        "수익금은 동물 보호소로 간다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 학교 벼룩시장 계획을 알려 드립니다. 다음 주 토요일에 체육관 뒤 마당에서 열립니다. 장터는 오전 열 시부터 오후 두 시까지 이어집니다. 반마다 탁자 하나를 받고, 그 안에서는 서로 나눠 쓰시면 됩니다. 책, 옷, 학용품, 작은 생활용품을 파실 수 있습니다. 올해는 어느 탁자에서도 음식과 음료를 팔 수 없습니다. 값은 천 원에서 오천 원 사이로 정해 주세요. 모인 돈은 모두 우리 동네 동물 보호소에 전달됩니다. 탁자는 아홉 시부터 놓으니 조금 일찍 오세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 남자가 예약할 스터디룸을 고르시오.",
      lines: [
        ["W", "Hyunwoo, which study room will your group book?"],
        ["M", "Five rooms are open at the city library this week."],
        ["W", "How many of you are meeting?"],
        ["M", "Seven, including the two who joined last month."],
        ["W", "Then rooms for four are out for you."],
        ["M", "Two of these only hold four people."],
        ["W", "What about the fee for each hour?"],
        ["M", "Under ten thousand won, that's what we agreed."],
        ["W", "One room is above that amount."],
        ["M", "And we need a whiteboard in the room."],
        ["W", "You can't work through problems without one."],
        ["M", "Then only one room fits everything."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Seven, including the two who joined last month.",
      explanation:
        "7명 수용, 시간당 1만 원 미만, 화이트보드가 있는 방은 ⑤이다. 따라서 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "People: 4 / Fee: 6,000 won / Whiteboard: Yes" },
          { no: 2, label: "②", value: "People: 8 / Fee: 12,000 won / Whiteboard: Yes" },
          { no: 3, label: "③", value: "People: 4 / Fee: 8,000 won / Whiteboard: No" },
          { no: 4, label: "④", value: "People: 8 / Fee: 9,000 won / Whiteboard: No" },
          { no: 5, label: "⑤", value: "People: 8 / Fee: 9,500 won / Whiteboard: Yes" },
        ],
      },
      translation: [
        "W: 현우야, 너희 모임은 어떤 스터디룸을 예약할 거야?",
        "M: 이번 주에 시립 도서관에 다섯 개가 비어 있어.",
        "W: 몇 명이 모여?",
        "M: 지난달에 들어온 둘까지 일곱 명.",
        "W: 그럼 네 명짜리 방은 빠지네.",
        "M: 이 중 두 곳은 네 명까지만 돼.",
        "W: 한 시간에 얼마씩인데?",
        "M: 1만 원 미만, 그렇게 정했어.",
        "W: 한 곳은 그보다 비싸.",
        "M: 그리고 방에 화이트보드가 있어야 해.",
        "W: 그게 없으면 문제를 못 풀어 나가지.",
        "M: 그럼 다 맞는 건 하나뿐이야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Have you finished the lab report for chemistry?"],
        ["W", "I wrote everything except the conclusion."],
        ["M", "It has to be handed in before first period."],
        ["W", "I'll write the last part tonight."],
        ["M", "Shall we check each other's numbers tomorrow?"],
      ],
      choices: [
        "Sure, at the back table.",
        "The report was due last week.",
        "I don't take chemistry.",
        "There is no conclusion.",
        "I finished it in March.",
      ],
      answer: 1,
      clue: "Shall we check each other's numbers tomorrow?",
      explanation:
        "서로 숫자를 확인해 보자는 제안이므로, 뒷자리에서 하자는 ①이 가장 자연스럽다.",
      translation: [
        "M: 화학 실험 보고서 다 썼어?",
        "W: 결론 빼고 다 썼어.",
        "M: 1교시 전에 내야 해.",
        "W: 마지막 부분은 오늘 밤에 쓸게.",
        "M: 내일 서로 숫자를 확인해 볼까?",
        "W: 좋아, 뒷자리에서.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Excuse me, is the computer room open on Saturday?"],
        ["M", "From nine until noon, but only for seniors."],
        ["W", "I'm in the second grade. Can I still come?"],
        ["M", "Not on Saturday, I'm afraid."],
        ["W", "When could I use it, then?"],
      ],
      choices: [
        "The room is closed for repairs.",
        "Weekday afternoons are open to all.",
        "I don't use computers.",
        "You can't come to school.",
        "Only on Saturday mornings.",
      ],
      answer: 2,
      clue: "When could I use it, then?",
      explanation:
        "언제 쓸 수 있는지 물었으므로, 평일 오후에는 누구나 쓸 수 있다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 실례합니다, 컴퓨터실이 토요일에 여나요?",
        "M: 아홉 시부터 정오까지요. 다만 3학년만요.",
        "W: 저는 2학년인데 가도 되나요?",
        "M: 토요일에는 안 됩니다.",
        "W: 그럼 언제 쓸 수 있나요?",
        "M: 평일 오후에는 누구나 쓰실 수 있습니다.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Kiyoung, how is the club's recruiting video coming along?"],
        ["M", "It's finished, but nobody has watched it."],
        ["W", "Where did you put it?"],
        ["M", "On the club's website, on the second page."],
        ["W", "How does a new student find that page?"],
        ["M", "They would have to know the site exists first."],
        ["W", "And nothing points them to it."],
        ["M", "I suppose the video is hidden rather than published."],
        ["W", "Where do first graders actually look in March?"],
        ["M", "The noticeboard by the main entrance, mostly."],
        ["W", "What could you put there to send them to the video?"],
      ],
      choices: [
        "Nothing would work.",
        "A poster with a code to scan.",
        "I'll delete the video.",
        "The website is enough.",
        "I'll film another video.",
      ],
      answer: 2,
      clue: "What could you put there to send them to the video?",
      explanation:
        "게시판에 무엇을 붙일지 물었으므로, 찍을 수 있는 표가 있는 안내문이라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 기영아, 동아리 모집 영상은 잘돼 가?",
        "M: 다 만들었는데 아무도 안 봤어.",
        "W: 어디에 올렸어?",
        "M: 동아리 누리집 두 번째 쪽에.",
        "W: 새로 온 학생이 그 쪽을 어떻게 찾아?",
        "M: 먼저 그 누리집이 있다는 걸 알아야겠지.",
        "W: 그런데 거기로 가리키는 게 아무것도 없고.",
        "M: 영상이 올려진 게 아니라 숨겨진 셈이네.",
        "W: 3월에 1학년이 실제로 들여다보는 데가 어디야?",
        "M: 대부분 정문 옆 게시판.",
        "W: 거기에 뭘 붙이면 영상으로 보낼 수 있을까?",
        "M: 찍을 수 있는 표가 있는 안내문.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nari, you said you never finish the last page of a test."],
        ["W", "I run out of time in almost every subject."],
        ["M", "How do you work through the paper?"],
        ["W", "In order, from question one to the end."],
        ["M", "Even when question three takes fifteen minutes?"],
        ["W", "I can't leave a question unanswered."],
        ["M", "So the easy ones at the back never get seen."],
        ["W", "They're worth the same marks, aren't they?"],
        ["M", "Exactly the same, and they take one minute each."],
        ["W", "I've been spending my time in the worst order."],
        ["M", "What could you do differently in the next test?"],
      ],
      choices: [
        "I'll answer in order again.",
        "Skip the hard ones and return.",
        "I'll leave the last page blank.",
        "Nothing can be changed.",
        "I'll write faster next time.",
      ],
      answer: 2,
      clue: "What could you do differently in the next test?",
      explanation:
        "다음 시험에 무엇을 달리할지 물었으므로, 어려운 것은 건너뛰고 나중에 돌아온다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나리야, 시험 마지막 쪽을 늘 못 끝낸다고 했잖아.",
        "W: 거의 모든 과목에서 시간이 모자라.",
        "M: 시험지를 어떻게 풀어 나가?",
        "W: 1번부터 끝까지 순서대로.",
        "M: 3번에 15분이 걸려도?",
        "W: 문제를 비워 두고는 못 넘어가.",
        "M: 그럼 뒤에 있는 쉬운 것들은 보지도 못하지.",
        "W: 배점은 같잖아?",
        "M: 똑같아. 게다가 한 문제에 1분이면 돼.",
        "W: 내가 시간을 가장 나쁜 순서로 쓰고 있었네.",
        "M: 다음 시험에서는 뭘 달리할 수 있을까?",
        "W: 어려운 건 건너뛰고 나중에 돌아오기.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Seongmin이 Dahye에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Seongmin : ________________",
      lines: [
        [
          "M",
          "Seongmin and Dahye are preparing the club's presentation for tomorrow. " +
            "Dahye has built a set of slides full of detailed graphs, " +
            "each one packed with numbers written in very small type. " +
            "The presentation will be shown in the main hall, " +
            "where the students at the back sit twenty meters from the screen. " +
            "Seongmin walked to the back row this afternoon to check, " +
            "and the numbers were completely unreadable from there. " +
            "He wants to tell her to show fewer numbers in a larger size. " +
            "In this situation, what would Seongmin most likely say to Dahye?",
        ],
      ],
      choices: [
        "Add more graphs to the slides.",
        "The presentation is next week.",
        "Fewer numbers, printed larger.",
        "Let's cancel the presentation.",
        "Nobody sits at the back.",
      ],
      answer: 3,
      clue: "He wants to tell her to show fewer numbers in a larger size.",
      explanation:
        "뒷자리에서 숫자가 안 보이므로, 숫자를 줄이고 크게 하자는 ③이 가장 적절하다.",
      translation: [
        "M: 성민이와 다혜는 내일 있을 동아리 발표를 준비하고 있습니다. 다혜는 자세한 그래프로 가득한 발표 자료를 만들었는데, 하나하나에 아주 작은 글씨로 숫자가 빼곡합니다. 발표는 대강당에서 하는데, 뒷자리 학생은 화면에서 20미터 떨어져 앉습니다. 성민이는 오늘 오후에 맨 뒷줄까지 걸어가 확인해 봤고, 거기서는 숫자를 전혀 읽을 수 없었습니다. 그는 숫자를 줄이고 크게 보여 주자고 말하고 싶습니다. 이런 상황에서 성민이가 다혜에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about the ways animals " +
            "keep track of time without a clock of any kind. " +
            "The garden bee visits a flower at the hour it opens, " +
            "arriving day after day within a few minutes of the same moment. " +
            "Migrating birds begin their journey on nearly the same date each year, " +
            "reading the changing length of the day rather than the temperature. " +
            "A hibernating ground squirrel wakes at intervals underground " +
            "where there is no light to tell it anything at all. " +
            "Even a plant kept in a dark room opens its leaves in the morning " +
            "for several days before the rhythm slowly fades. " +
            "The clock, it turns out, is built into the body itself.",
        ],
      ],
      choices: [
        "how living things keep track of time",
        "why some birds fly south in winter",
        "how flowers attract insects",
        "why animals sleep through the winter",
        "how sunlight affects plant growth",
      ],
      answer: 1,
      clue: "The clock, it turns out, is built into the body itself.",
      explanation:
        "생물이 시계 없이 시간을 아는 방식이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 오늘은 동물들이 아무런 시계도 없이 어떻게 때를 아는지 이야기하려 합니다. 뜰의 꿀벌은 꽃이 열리는 시각에 맞춰 찾아오는데, 날마다 같은 순간에서 몇 분 안에 도착합니다. 철새는 해마다 거의 같은 날짜에 길을 떠나는데, 기온이 아니라 낮의 길이가 바뀌는 것을 읽습니다. 겨울잠을 자는 땅다람쥐는 아무것도 알려 줄 빛이 없는 땅속에서도 일정한 간격으로 깨어납니다. 어두운 방에 둔 식물조차 며칠 동안은 아침이면 잎을 폅니다. 그 뒤에야 리듬이 서서히 흐려집니다. 시계는 결국 몸 안에 들어 있는 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 생물이 아닌 것을 고르시오.",
      lines: [
        ["W", "The garden bee visits a flower at the hour it opens."],
        ["W", "Migrating birds begin their journey on nearly the same date each year."],
        ["W", "A hibernating ground squirrel wakes at intervals underground."],
        ["W", "Even a plant kept in a dark room opens its leaves in the morning."],
        ["W", "The clock is built into the body itself."],
      ],
      choices: ["bees", "migrating birds", "ground squirrels", "plants", "bats"],
      answer: 5,
      clue: "Even a plant kept in a dark room opens its leaves in the morning.",
      explanation:
        "꿀벌, 철새, 땅다람쥐, 식물은 언급되지만 박쥐는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
