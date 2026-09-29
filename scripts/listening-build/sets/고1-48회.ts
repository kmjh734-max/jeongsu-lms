/** 고1 듣기 48회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 48회",
  gradeLevel: "high1",
  speechSpeed: 0.8,
  folder: "고1 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good afternoon, everyone. This is the physical education office. " +
            "As you may have noticed, the gym has been closed since Monday " +
            "while the floor was sanded and coated for the first time in nine years. " +
            "The work is finished, and the gym reopens this Friday morning. " +
            "Before you go in, there are two things you must keep in mind. " +
            "The new coating stays soft for about two more weeks, " +
            "so only clean indoor shoes may be worn on the floor. " +
            "Outdoor shoes, even for a moment, leave marks that cannot be removed. " +
            "Also, no equipment may be dragged across the surface; " +
            "lift the goals and benches instead of pushing them. " +
            "Clubs should write their practice times on the sheet in the office.",
        ],
      ],
      choices: [
        "체육관 재개방과 지켜야 할 점을 알리려고",
        "체육 대회 일정을 안내하려고",
        "실내화 구입을 권하려고",
        "동아리 회원을 모집하려고",
        "공사 시작을 알리려고",
      ],
      answer: 1,
      clue: "the gym reopens this Friday morning",
      explanation:
        "체육관이 다시 열린다는 것과 지켜야 할 점을 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 체육부입니다. 아시다시피 월요일부터 체육관을 닫아 두었습니다. 9년 만에 바닥을 갈고 칠을 했습니다. 작업이 끝나 이번 주 금요일 아침에 다시 엽니다. 들어가기 전에 꼭 기억하실 것이 두 가지 있습니다. 새 칠이 두 주쯤 더 무른 상태라, 바닥에서는 깨끗한 실내화만 신을 수 있습니다. 바깥 신발은 잠깐이라도 지울 수 없는 자국을 남깁니다. 또 기구를 바닥에 끌지 마십시오. 골대와 의자는 밀지 말고 들어 옮겨 주세요. 동아리는 사무실에 있는 종이에 연습 시간을 적어 주시기 바랍니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaeyeon, you write your homework list the night before."],
        ["W", "Three items, no more, on a sticky note."],
        ["M", "Only three? I usually list everything I have to do."],
        ["W", "How much of your list gets done on a normal day?"],
        ["M", "Maybe half of it, honestly."],
        ["W", "So every evening ends with a page of unfinished lines."],
        ["M", "That does make me feel behind all the time."],
        ["W", "A list you finish teaches you that you can finish."],
        ["M", "But the other work doesn't disappear."],
        ["W", "It moves to tomorrow's three, where it gets done."],
        ["M", "So the point is the finishing, not the listing."],
        ["W", "A short list you complete beats a long one you abandon."],
        ["M", "I'll try three tonight and see."],
      ],
      choices: [
        "끝낼 수 있는 짧은 목록이 낫다",
        "할 일은 빠짐없이 적어야 한다",
        "공부는 아침에 하는 것이 좋다",
        "목록은 종이에 써야 한다",
        "일정은 남과 나눠야 한다",
      ],
      answer: 1,
      clue: "A short list you complete beats a long one you abandon.",
      explanation:
        "여자는 끝낼 수 있는 짧은 목록이 낫다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 채연아, 너는 전날 밤에 할 일을 적더라.",
        "W: 쪽지 하나에 세 가지, 그 이상은 안 적어.",
        "M: 세 가지만? 나는 보통 해야 할 걸 다 적는데.",
        "W: 보통 날에 그중 얼마나 끝내?",
        "M: 솔직히 절반쯤.",
        "W: 그럼 저녁마다 못 끝낸 줄이 가득한 쪽으로 끝나겠네.",
        "M: 그래서 늘 뒤처진 기분이 들긴 해.",
        "W: 끝내는 목록은 네가 끝낼 수 있다는 걸 가르쳐 줘.",
        "M: 그래도 나머지 일이 사라지지는 않잖아.",
        "W: 내일의 세 가지로 옮겨 가서 거기서 끝나.",
        "M: 그러니까 핵심은 적는 게 아니라 끝내는 거구나.",
        "W: 끝내는 짧은 목록이 포기하는 긴 목록보다 나아.",
        "M: 오늘 밤에 세 가지로 해 볼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We tend to judge an explanation by how easily it goes down. " +
            "If a lesson feels smooth, we believe we have understood it. " +
            "But smoothness is a property of the speaker, not of your memory. " +
            "A clear teacher removes every obstacle from the path, " +
            "and you walk it without once having to find your own way. " +
            "Later, alone with the problem, there is no path at all. " +
            "The lessons that feel awkward, where you must stop and work something out, " +
            "are the ones that leave something behind in you. " +
            "So do not measure a class by how pleasant it felt. " +
            "Measure it by what you can still do a week afterward.",
        ],
      ],
      choices: [
        "쉽게 느껴진 수업이 반드시 남는 것은 아니다",
        "설명은 간결할수록 좋다",
        "복습은 일주일 안에 해야 한다",
        "질문을 많이 해야 이해가 깊어진다",
        "어려운 과목부터 공부해야 한다",
      ],
      answer: 1,
      clue: "Measure it by what you can still do a week afterward.",
      explanation:
        "매끄럽게 느껴진 수업이 곧 남는 수업은 아니라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 우리는 설명이 얼마나 술술 넘어가는지로 그 설명을 판단하곤 합니다. 수업이 매끄럽게 느껴지면 이해했다고 믿습니다. 그러나 매끄러움은 말하는 사람의 성질이지 여러분 기억의 성질이 아닙니다. 또렷한 선생은 길에서 걸림돌을 모두 치워 주고, 여러분은 한 번도 스스로 길을 찾지 않은 채 그 길을 걷습니다. 나중에 문제 앞에 혼자 앉으면 길이라는 것이 아예 없습니다. 어색하게 느껴지는 수업, 멈춰 서서 스스로 풀어내야 하는 수업이 여러분 안에 무언가를 남깁니다. 그러니 수업을 얼마나 기분 좋았는지로 재지 마십시오. 일주일 뒤에도 할 수 있는 것으로 재십시오.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Sujin, is this the picture of the school café you set up?"],
        ["W", "Yes, the club opened it last Friday."],
        ["M", "There's a long counter along the right wall."],
        ["W", "Two people can serve from behind it at once."],
        ["M", "And a blackboard hangs above the counter."],
        ["W", "We write the drink of the day on it."],
        ["M", "I see three round tables in the middle."],
        ["W", "Two tables, actually. The third is a stool."],
        ["M", "There's a small plant on the window sill."],
        ["W", "It survived the whole summer break."],
        ["M", "And a bench stands by the door."],
        ["W", "People wait there when it gets busy."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Two tables, actually. The third is a stool.",
      explanation:
        "가운데 둥근 탁자가 세 개라고 했지만 두 개라고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A small school café room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A LONG COUNTER runs along the right wall. " +
          "A BLACKBOARD hangs on the wall above the counter. " +
          "THREE ROUND TABLES stand in the middle of the room. " +
          "A SMALL POTTED PLANT sits on the window sill at the left. " +
          "A BENCH stands beside the door.",
        spots: [
          [0.85, 0.55],
          [0.85, 0.2],
          [0.45, 0.6],
          [0.1, 0.35],
          [0.2, 0.82],
        ],
      },
      translation: [
        "M: 수진아, 이게 너희가 꾸민 학교 찻집 사진이야?",
        "W: 응, 지난 금요일에 동아리가 열었어.",
        "M: 오른쪽 벽을 따라 긴 계산대가 있네.",
        "W: 그 뒤에서 두 명이 동시에 일할 수 있어.",
        "M: 그리고 계산대 위에 칠판이 걸려 있고.",
        "W: 거기에 오늘의 음료를 적어.",
        "M: 가운데에 둥근 탁자가 세 개 보여.",
        "W: 사실 두 개야. 세 번째는 등받이 없는 의자야.",
        "M: 창턱에는 작은 화분이 있네.",
        "W: 여름 방학을 다 견뎌 냈어.",
        "M: 그리고 문 옆에 긴 의자가 있고.",
        "W: 바쁠 때 사람들이 거기서 기다려.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Yerin, the club exhibition opens in half an hour."],
        ["W", "The works are hung and the labels are on."],
        ["M", "Did anyone bring the visitors' book for comments?"],
        ["W", "It should be on the shelf in the club room."],
        ["M", "I looked there and the shelf is empty."],
        ["W", "Then it may still be in the teachers' room."],
        ["M", "We left it there after Monday's meeting."],
        ["W", "The teachers' room closes at four on Wednesdays."],
        ["M", "It's twenty to four right now."],
        ["W", "Then someone has to go immediately."],
        ["M", "I'll open the windows and turn on the lights."],
        ["W", "I'll go and get the visitors' book."],
      ],
      choices: [
        "창문을 열기",
        "작품을 걸기",
        "방명록을 가져오기",
        "이름표를 붙이기",
        "손님을 맞이하기",
      ],
      answer: 3,
      clue: "I'll go and get the visitors' book.",
      explanation:
        "여자는 교무실에 있는 방명록을 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "M: 예린아, 동아리 전시가 30분 뒤에 열어.",
        "W: 작품은 걸었고 이름표도 붙였어.",
        "M: 감상 적을 방명록은 누가 가져왔어?",
        "W: 동아리방 선반에 있을 텐데.",
        "M: 거기 봤는데 선반이 비었어.",
        "W: 그럼 아직 교무실에 있을지도 몰라.",
        "M: 월요일 회의 끝나고 거기 두고 왔어.",
        "W: 교무실은 수요일에 네 시에 닫아.",
        "M: 지금 네 시 20분 전이야.",
        "W: 그럼 누가 지금 바로 가야 해.",
        "M: 나는 창문 열고 불을 켤게.",
        "W: 내가 가서 방명록을 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the print shop. What can I help you with today?"],
        ["M", "I need forty copies of a notice that runs two pages."],
        ["W", "Black and white printing is fifty cents a page."],
        ["M", "Is color printing much more expensive than that?"],
        ["W", "Color is one dollar a page, so twice as much."],
        ["M", "The notice has no pictures in it at all."],
        ["W", "Then black and white will read just as clearly."],
        ["M", "Let's do black and white, then."],
        ["W", "So that is forty copies, two pages each."],
        ["M", "Do you charge anything for stapling them?"],
        ["W", "Stapling is free for orders over twenty copies."],
        ["M", "Good. Is there any discount for students?"],
        ["W", "Ten percent off the total with a school card."],
        ["M", "Here is my card, and I'll pay now."],
      ],
      choices: ["$32.00", "$36.00", "$38.00", "$40.00", "$72.00"],
      answer: 2,
      clue: "Black and white printing is fifty cents a page.",
      explanation:
        "두 쪽짜리 40부면 80쪽으로 40달러인데, 10퍼센트를 빼면 36달러이다. 따라서 답은 ②이다.",
      translation: [
        "W: 인쇄소에 오신 걸 환영합니다. 오늘은 무엇을 도와드릴까요?",
        "M: 두 쪽짜리 알림을 40부 뽑아야 해요.",
        "W: 흑백 인쇄는 한 쪽에 50센트입니다.",
        "M: 색으로 하면 그보다 많이 비싼가요?",
        "W: 색은 한 쪽에 1달러라 두 배입니다.",
        "M: 이 알림에는 그림이 하나도 없어요.",
        "W: 그럼 흑백으로도 똑같이 또렷합니다.",
        "M: 그럼 흑백으로 할게요.",
        "W: 그럼 두 쪽짜리로 40부입니다.",
        "M: 묶는 값도 받나요?",
        "W: 20부가 넘으면 묶는 건 무료입니다.",
        "M: 좋네요. 학생 할인은 있나요?",
        "W: 학생증이 있으면 전체에서 10퍼센트 할인됩니다.",
        "M: 여기 학생증이요. 지금 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 동아리를 옮긴 이유를 고르시오.",
      lines: [
        ["W", "Taemin, I heard you moved from the film club to the debate club."],
        ["W", "You were making a short film all last year."],
        ["M", "I finished it in February and it was shown at the festival."],
        ["W", "Did you fall out with someone there?"],
        ["M", "Not at all. I still eat lunch with them."],
        ["W", "Then was the work too heavy?"],
        ["M", "Filming is hard but I liked that part."],
        ["W", "So why change?"],
        ["M", "I found I could never explain my ideas out loud."],
        ["W", "And debate is exactly that."],
        ["M", "Every week I have to stand up and say what I think."],
        ["W", "That's a good reason to move."],
      ],
      choices: [
        "생각을 말로 표현하는 연습을 하고 싶어서",
        "동아리 사람들과 다퉈서",
        "작업이 너무 힘들어서",
        "영화를 다 만들어서",
        "시간이 겹쳐서",
      ],
      answer: 1,
      clue: "I found I could never explain my ideas out loud.",
      explanation:
        "남자는 생각을 말로 설명하는 것을 익히려고 옮겼다. 따라서 답은 ①이다.",
      translation: [
        "W: 태민아, 영화 동아리에서 토론 동아리로 옮겼다며.",
        "W: 작년 내내 단편을 만들었잖아.",
        "M: 2월에 다 만들었고 축제에서 상영했어.",
        "W: 거기서 누구랑 틀어졌어?",
        "M: 전혀. 아직도 같이 점심 먹어.",
        "W: 그럼 일이 너무 힘들었어?",
        "M: 찍는 건 힘들지만 그 부분은 좋았어.",
        "W: 그럼 왜 옮겼어?",
        "M: 내 생각을 소리 내어 설명하지 못한다는 걸 알게 됐어.",
        "W: 토론이 딱 그거지.",
        "M: 매주 일어서서 내 생각을 말해야 해.",
        "W: 옮길 만한 이유네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 독서 토론 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Bora, are you entering the reading debate contest?"],
        ["M", "The notice went up on the library door this morning."],
        ["W", "I saw it. When is it held?"],
        ["M", "On the third Thursday of next month, after school."],
        ["W", "How many students make up one team?"],
        ["M", "Four, and each team needs a leader."],
        ["W", "Do we choose the book ourselves?"],
        ["M", "The library picked one novel for everyone."],
        ["W", "How long does each round last?"],
        ["M", "Twenty minutes, with five minutes for questions."],
        ["W", "That's longer than last year."],
        ["M", "Apply at the library desk by next Wednesday."],
        ["W", "Then I'll find three people tomorrow."],
      ],
      choices: ["열리는 날", "한 팀의 인원", "읽어야 하는 책", "한 판의 시간", "우승 팀 상품"],
      answer: 5,
      clue: "On the third Thursday of next month, after school.",
      explanation:
        "날짜, 인원, 책, 시간은 말했지만 우승 상품은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 보라야, 독서 토론 대회에 나갈 거야?",
        "M: 오늘 아침에 도서관 문에 알림이 붙었어.",
        "W: 봤어. 언제 해?",
        "M: 다음 달 셋째 주 목요일, 방과 후에.",
        "W: 한 팀에 몇 명이야?",
        "M: 네 명이고 팀마다 팀장이 있어야 해.",
        "W: 책은 우리가 골라?",
        "M: 도서관에서 소설 한 권을 정해 줬어.",
        "W: 한 판은 얼마나 해?",
        "M: 20분이고 질문에 5분.",
        "W: 작년보다 길다.",
        "M: 다음 주 수요일까지 도서관 안내대에서 신청해.",
        "W: 그럼 내일 세 명을 찾아야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 학교 진로 체험의 날에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, students. Here is the plan for the career experience day. " +
            "It takes place on the second Thursday of next month. " +
            "Students visit a workplace in groups of six. " +
            "The school bus leaves the front gate at nine in the morning. " +
            "Each group spends about three hours at the workplace. " +
            "Lunch is provided by the school, so you need not bring one. " +
            "You must wear your school uniform, not casual clothes. " +
            "After you return, write one page about what you saw. " +
            "Hand the page to your homeroom teacher by the following Monday.",
        ],
      ],
      choices: [
        "다음 달 둘째 주 목요일에 한다",
        "여섯 명씩 모둠을 이루어 방문한다",
        "학교 버스가 아홉 시에 출발한다",
        "점심은 학교에서 제공한다",
        "편한 옷을 입고 가면 된다",
      ],
      answer: 5,
      clue: "You must wear your school uniform, not casual clothes.",
      explanation:
        "교복을 입어야 한다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 진로 체험의 날 계획을 알려 드립니다. 다음 달 둘째 주 목요일에 진행됩니다. 학생들은 여섯 명씩 모둠을 이루어 직장을 방문합니다. 학교 버스는 아침 아홉 시에 정문에서 출발합니다. 각 모둠은 직장에서 세 시간쯤 머뭅니다. 점심은 학교에서 제공하니 따로 가져오지 않으셔도 됩니다. 편한 옷이 아니라 교복을 입어야 합니다. 돌아온 뒤에는 본 것에 대해 한 쪽을 쓰십시오. 그다음 주 월요일까지 담임 선생님께 내 주세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 남자가 예약할 연습실을 고르시오.",
      lines: [
        ["W", "Seongjun, which practice room will your band book this month?"],
        ["M", "Five rooms are open at the youth center right now."],
        ["W", "How many of you are practising together these days?"],
        ["M", "Six of us, including the two new members."],
        ["W", "Then any room made for four people is out."],
        ["M", "Two of these only hold four at a time."],
        ["W", "What about the fee for each hour?"],
        ["M", "Under twenty thousand won. That is our whole budget."],
        ["W", "One of the rooms is above that amount."],
        ["M", "And we really need a drum set in the room."],
        ["W", "Carrying your own drums there would be impossible."],
        ["M", "We tried that once and it took an hour."],
        ["W", "Then only one room fits everything you need."],
        ["M", "I'll book it for Saturday afternoon tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Six of us, including the two new members.",
      explanation:
        "6명 수용, 시간당 2만 원 미만, 드럼이 있는 연습실은 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "People: 4 / Fee: 15,000 won / Drums: Yes" },
          { no: 2, label: "②", value: "People: 6 / Fee: 25,000 won / Drums: Yes" },
          { no: 3, label: "③", value: "People: 4 / Fee: 18,000 won / Drums: No" },
          { no: 4, label: "④", value: "People: 6 / Fee: 19,000 won / Drums: Yes" },
          { no: 5, label: "⑤", value: "People: 6 / Fee: 17,000 won / Drums: No" },
        ],
      },
      translation: [
        "W: 성준아, 이번 달에 너희 밴드는 어떤 연습실을 예약할 거야?",
        "M: 지금 청소년 센터에 다섯 개가 비어 있어.",
        "W: 요즘 몇 명이 같이 연습해?",
        "M: 새 회원 둘까지 여섯 명.",
        "W: 그럼 네 명용으로 만든 방은 빠지네.",
        "M: 이 중 두 곳은 한 번에 네 명까지만 돼.",
        "W: 한 시간에 얼마씩인데?",
        "M: 2만 원 미만. 그게 우리 예산 전부야.",
        "W: 그중 한 곳은 그 액수를 넘어.",
        "M: 그리고 방에 드럼이 꼭 있어야 해.",
        "W: 드럼을 직접 들고 가는 건 못 하겠지.",
        "M: 한 번 해 봤는데 한 시간 걸렸어.",
        "W: 그럼 네가 바라는 걸 다 갖춘 곳은 하나뿐이야.",
        "M: 오늘 밤에 토요일 오후로 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you chosen your subject for next year?"],
        ["M", "I'm still deciding between two of them."],
        ["W", "The form is due on Friday, you know."],
        ["M", "That's sooner than I expected."],
        ["W", "Do you want to look at the course list with me?"],
      ],
      choices: [
        "I already handed in the form.",
        "Yes, during lunch break.",
        "There is no form.",
        "I don't take any subjects.",
        "Friday was last week.",
      ],
      answer: 2,
      clue: "Do you want to look at the course list with me?",
      explanation:
        "같이 보자는 제안이므로, 점심시간에 하자는 ②가 가장 자연스럽다.",
      translation: [
        "W: 내년 과목 정했어?",
        "M: 아직 두 개 중에 고민 중이야.",
        "W: 신청서 마감이 금요일이야.",
        "M: 생각보다 빠르네.",
        "W: 나랑 같이 과목 목록 볼래?",
        "M: 응, 점심시간에.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, does the school store sell notebooks?"],
        ["W", "Yes, on the shelf by the window."],
        ["M", "Are they cheaper than outside?"],
        ["W", "About the same, but you save the walk."],
        ["M", "Is the store open during lunch?"],
      ],
      choices: [
        "The store closed last year.",
        "Only after school, actually.",
        "I don't buy notebooks.",
        "There is no window.",
        "You can't go outside.",
      ],
      answer: 2,
      clue: "Is the store open during lunch?",
      explanation:
        "점심시간에 여는지 물었으므로, 방과 후에만 연다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 학교 매점에서 공책을 파나요?",
        "W: 네, 창가 선반에 있어요.",
        "M: 밖보다 싼가요?",
        "W: 비슷한데 걸어 나갈 일이 없죠.",
        "M: 매점이 점심시간에 여나요?",
        "W: 사실 방과 후에만 열어요.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nayoung, how is the club recruiting going?"],
        ["W", "We need six new members and only two have signed up."],
        ["M", "Where did you advertise?"],
        ["W", "We put a poster on the board by the teachers' room."],
        ["M", "How many students walk past that board in a day?"],
        ["W", "Not many, now that I think about it."],
        ["M", "Where do students actually stop and stand?"],
        ["W", "In the line outside the cafeteria, mostly."],
        ["M", "And nobody has put anything there."],
        ["W", "Because we assumed it wasn't allowed."],
        ["M", "Have you ever asked whether it is?"],
      ],
      choices: [
        "No, I'll ask tomorrow.",
        "Yes, they said no.",
        "The cafeteria closed.",
        "We don't need members.",
        "I took the poster down.",
      ],
      answer: 1,
      clue: "Have you ever asked whether it is?",
      explanation:
        "물어본 적이 있는지 물었으므로, 내일 물어보겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 나영아, 동아리 모집은 잘돼 가?",
        "W: 여섯 명이 필요한데 두 명만 신청했어.",
        "M: 어디에 알렸어?",
        "W: 교무실 옆 게시판에 알림 종이를 붙였어.",
        "M: 하루에 그 게시판 앞을 몇 명이나 지나가?",
        "W: 생각해 보니 많지 않네.",
        "M: 학생들이 실제로 멈춰 서 있는 데가 어디야?",
        "W: 대부분 급식실 밖 줄이지.",
        "M: 그런데 거기엔 아무도 뭘 안 붙였지.",
        "W: 안 되는 줄 알았으니까.",
        "M: 되는지 물어본 적은 있어?",
        "W: 아니, 내일 물어볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Hyunbin, you said you wanted to improve your writing."],
        ["M", "I write an essay every weekend."],
        ["W", "Does anyone read them afterwards?"],
        ["M", "I read them over myself on Sunday night."],
        ["W", "And do you find much to change?"],
        ["M", "Not really. It all looks fine to me."],
        ["W", "It would. You wrote it, so you know what you meant."],
        ["M", "That's a fair point."],
        ["W", "A reader finds the sentence that says nothing."],
        ["M", "I've never shown my essays to anyone."],
        ["W", "Who could read the next one for you?"],
      ],
      choices: [
        "Nobody can read them.",
        "My sister, probably.",
        "I'll stop writing essays.",
        "I'll read it twice myself.",
        "There is no next one.",
      ],
      answer: 2,
      clue: "Who could read the next one for you?",
      explanation:
        "누가 읽어 줄 수 있는지 물었으므로, 누나가 읽어 줄 것 같다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 현빈아, 글쓰기를 늘리고 싶다고 했잖아.",
        "M: 주말마다 글을 한 편씩 써.",
        "W: 나중에 누가 읽어 줘?",
        "M: 일요일 밤에 내가 다시 읽어.",
        "W: 고칠 데가 많이 보여?",
        "M: 그렇진 않아. 나한테는 다 괜찮아 보여.",
        "W: 그렇겠지. 네가 썼으니 무슨 뜻인지 아니까.",
        "M: 맞는 말이네.",
        "W: 읽는 사람은 아무 말도 안 하는 문장을 찾아내.",
        "M: 내 글을 누구한테도 보여 준 적이 없어.",
        "W: 다음 글은 누가 읽어 줄 수 있을까?",
        "M: 아마 우리 누나.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Dain이 Seokjin에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Dain : ________________",
      lines: [
        [
          "W",
          "Dain and Seokjin are setting up the science fair booth together. " +
            "Seokjin has placed their model right at the edge of the table, " +
            "with one corner of its base hanging over the side. " +
            "Visitors will be walking past in a narrow space all afternoon, " +
            "and a single bump would send the model to the floor. " +
            "The model took the two of them three weeks to build. " +
            "Dain has already seen two people brush against the table. " +
            "She wants to tell him to move the model to the middle. " +
            "In this situation, what would Dain most likely say to Seokjin?",
        ],
      ],
      choices: [
        "Let's build another model.",
        "The fair starts tomorrow.",
        "Move it to the middle of the table.",
        "We should take the table away.",
        "Nobody will walk past here.",
      ],
      answer: 3,
      clue: "She wants to tell him to move the model to the middle.",
      explanation:
        "모형이 탁자 끝에 걸쳐 있어 위험하므로, 가운데로 옮기라는 ③이 가장 적절하다.",
      translation: [
        "W: 다인이와 석진이는 과학 전시회 부스를 함께 준비하고 있습니다. 석진이는 모형을 탁자 맨 끝에 놓았는데, 받침 한 귀퉁이가 밖으로 걸쳐 있습니다. 오후 내내 좁은 틈으로 관람객이 지나다닐 텐데, 한 번만 부딪혀도 모형이 바닥으로 떨어집니다. 그 모형은 둘이서 3주에 걸쳐 만든 것입니다. 다인이는 벌써 두 사람이 탁자를 스치는 것을 봤습니다. 그녀는 모형을 가운데로 옮기라고 말하고 싶습니다. 이런 상황에서 다인이가 석진이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about the surprising ways " +
            "that animals get their food without hunting for it themselves. " +
            "The honeyguide, a small African bird, leads humans to a bees' nest " +
            "and waits for them to open it before taking the wax left behind. " +
            "The cleaner wrasse sets up a station on the reef " +
            "where much larger fish queue to have their parasites removed. " +
            "Certain ants keep aphids the way people keep cattle, " +
            "protecting them from predators in exchange for a sweet liquid. " +
            "The oxpecker rides on the back of a buffalo all day, " +
            "eating the insects that the great animal cannot reach. " +
            "In each case two very different creatures have arrived " +
            "at an arrangement that neither of them ever negotiated.",
        ],
      ],
      choices: [
        "how different species feed through cooperation",
        "why some birds migrate across continents",
        "how predators choose their hunting grounds",
        "why insects are important to farmers",
        "how coral reefs support ocean life",
      ],
      answer: 1,
      clue: "an arrangement that neither of them ever negotiated",
      explanation:
        "서로 다른 종이 협력으로 먹이를 얻는 방식이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 동물들이 스스로 사냥하지 않고 먹이를 얻는 놀라운 방식을 이야기하려 합니다. 아프리카의 작은 새인 벌꿀길잡이새는 사람을 벌집으로 이끌고, 사람이 벌집을 열기를 기다렸다가 남은 밀랍을 먹습니다. 청소놀래기는 산호초에 자리를 잡고, 훨씬 큰 물고기들이 기생충을 떼어 내려고 줄을 섭니다. 어떤 개미들은 사람이 소를 치듯 진딧물을 치며, 단물을 얻는 대가로 천적에게서 지켜 줍니다. 소등쪼기새는 하루 종일 물소 등에 올라타, 그 큰 짐승이 닿지 못하는 벌레를 먹습니다. 어느 경우든 아주 다른 두 생물이 한 번도 협상한 적 없는 합의에 이르렀습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 동물이 아닌 것을 고르시오.",
      lines: [
        ["M", "The honeyguide leads humans to a bees' nest."],
        ["M", "The cleaner wrasse sets up a station on the reef."],
        ["M", "Certain ants keep aphids the way people keep cattle."],
        ["M", "The oxpecker rides on the back of a buffalo all day."],
        ["M", "Two very different creatures have arrived at an arrangement."],
      ],
      choices: ["honeyguides", "cleaner wrasses", "ants", "oxpeckers", "dolphins"],
      answer: 5,
      clue: "The oxpecker rides on the back of a buffalo all day.",
      explanation:
        "벌꿀길잡이새, 청소놀래기, 개미, 소등쪼기새는 언급되지만 돌고래는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
