/** 고2 듣기 48회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 48회",
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
          "Good afternoon, students. This is the school library speaking. " +
            "Every year we ask you to return books before the winter break, " +
            "and every year about a hundred books stay out until March. " +
            "We have looked at why, and the answer is not forgetfulness. " +
            "Most of those books belong to students who still need them. " +
            "So this year we are doing something different. " +
            "Any book you still need may be renewed for the whole break, " +
            "as long as you tell us before the twentieth of December. " +
            "Send one line to the library email with the title and your name. " +
            "Books nobody renews must come back by the twentieth as usual. " +
            "We would rather lend a book twice than lose it once.",
        ],
      ],
      choices: [
        "방학 중 대출 연장 방법을 알리려고",
        "도서 반납을 독촉하려고",
        "도서관 휴관을 알리려고",
        "새 책을 소개하려고",
        "독서 행사 참가를 권하려고",
      ],
      answer: 1,
      clue: "Any book you still need may be renewed for the whole break",
      explanation:
        "방학 동안 대출을 연장하는 방법을 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 학교 도서관입니다. 해마다 겨울 방학 전에 책을 반납해 달라고 말씀드리지만, 해마다 백 권쯤은 3월까지 나가 있습니다. 왜 그런지 살펴보았는데 답은 건망증이 아니었습니다. 그 책 대부분은 아직 그 책이 필요한 학생들이 가지고 있었습니다. 그래서 올해는 다르게 해 보려 합니다. 아직 필요한 책은 방학 내내 연장하실 수 있습니다. 12월 20일 전에 알려 주시기만 하면 됩니다. 도서관 전자우편으로 책 제목과 이름을 한 줄만 보내 주세요. 아무도 연장하지 않은 책은 예전처럼 20일까지 돌아와야 합니다. 책을 한 번 잃느니 두 번 빌려주는 편이 낫습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Yerin says you always stop studying before you feel finished."],
        ["M", "I stop in the middle of a problem I know how to solve."],
        ["W", "Why would you stop when it's going well?"],
        ["M", "Because tomorrow I have somewhere obvious to begin."],
        ["W", "I always finish a section and close the book."],
        ["M", "And the next day you face a blank new chapter."],
        ["W", "It does take me twenty minutes to get going."],
        ["M", "Those twenty minutes are the price of a tidy ending."],
        ["W", "So an unfinished line is a kind of bookmark."],
        ["M", "Your hand knows what to do before your head wakes up."],
        ["W", "I never thought stopping could be planned."],
        ["M", "Stop where you know what comes next, not where you are tired."],
        ["W", "I'll leave one problem open tonight."],
      ],
      choices: [
        "다음에 이어 갈 자리를 남기고 멈춰야 한다",
        "끝까지 마치고 쉬어야 한다",
        "공부 시간을 정해 두어야 한다",
        "어려운 문제부터 풀어야 한다",
        "쉬는 시간을 자주 가져야 한다",
      ],
      answer: 1,
      clue: "Stop where you know what comes next, not where you are tired.",
      explanation:
        "남자는 다음에 이어 갈 자리를 알고 멈추라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 예린이가 그러는데 너는 늘 다 끝난 느낌이 오기 전에 멈춘다며.",
        "M: 어떻게 푸는지 아는 문제 한가운데서 멈춰.",
        "W: 잘돼 갈 때 왜 멈춰?",
        "M: 내일 시작할 자리가 뻔해지니까.",
        "W: 나는 늘 한 단원을 끝내고 책을 덮어.",
        "M: 그러고 다음 날에는 텅 빈 새 단원을 마주하지.",
        "W: 시동 걸리는 데 20분은 걸리긴 해.",
        "M: 그 20분이 깔끔하게 끝낸 값이야.",
        "W: 그러니까 안 끝낸 줄이 일종의 책갈피구나.",
        "M: 머리가 깨기 전에 손이 뭘 할지 알아.",
        "W: 멈추는 걸 계획할 수 있다는 생각은 못 했어.",
        "M: 지친 자리가 아니라 다음이 뭔지 아는 자리에서 멈춰.",
        "W: 오늘 밤엔 한 문제를 열어 둘게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We judge our own understanding by how clear something feels. " +
            "But feeling clear and being able to explain are far apart. " +
            "A page of notes can be read three times with total comfort " +
            "and still leave you unable to say the idea out loud to a friend. " +
            "The gap appears only at the moment you try to speak. " +
            "This is why explaining to someone else is not a kindness to them; " +
            "it is the cheapest test you will ever run on yourself. " +
            "Choose one idea from today and say it to someone tonight. " +
            "Where you stumble is exactly where you did not understand.",
        ],
      ],
      choices: [
        "남에게 설명해 봐야 자기 이해가 드러난다",
        "필기는 여러 번 읽어야 한다",
        "친구와 함께 공부해야 한다",
        "이해가 안 되면 바로 물어야 한다",
        "복습은 그날 안에 해야 한다",
      ],
      answer: 1,
      clue: "Where you stumble is exactly where you did not understand.",
      explanation:
        "설명해 봐야 이해하지 못한 곳이 드러난다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 우리는 무언가가 얼마나 또렷하게 느껴지는지로 제 이해를 판단합니다. 그러나 또렷하게 느끼는 것과 설명할 수 있는 것은 멀리 떨어져 있습니다. 필기 한 쪽을 아주 편안하게 세 번 읽고도, 그 생각을 친구에게 소리 내어 말하지 못할 수 있습니다. 그 틈은 말하려고 하는 순간에만 드러납니다. 그래서 남에게 설명하는 일은 그 사람에게 베푸는 친절이 아닙니다. 여러분이 자신에게 해 볼 수 있는 가장 값싼 시험입니다. 오늘 배운 것 가운데 하나를 골라 오늘 밤 누군가에게 말해 보십시오. 말이 막히는 자리가 바로 이해하지 못한 자리입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Suyeon, is this the photo of the club's new office?"],
        ["W", "Yes, we moved in at the start of this month."],
        ["M", "There's a wide desk against the right wall."],
        ["W", "Two people can sit at it side by side."],
        ["M", "And a noticeboard hangs above the desk."],
        ["W", "We pin the week's schedule on it."],
        ["M", "I see three filing boxes under the window."],
        ["W", "Two boxes, actually. The third is a stool."],
        ["M", "There's a tall plant beside the door."],
        ["W", "It survived the whole summer with no water."],
        ["M", "And a clock hangs on the left wall."],
        ["W", "It runs five minutes fast on purpose."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Two boxes, actually. The third is a stool.",
      explanation:
        "창문 아래 상자가 세 개라고 했지만 두 개라고 했다. 따라서 답은 ③이다.",
      figure: {
        kind: "figure5",
        scene:
          "A small club office room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A WIDE DESK stands against the right wall. " +
          "A NOTICEBOARD hangs on the wall above the desk. " +
          "THREE FILING BOXES stand in a row under the window. " +
          "A TALL POTTED PLANT stands beside the door. " +
          "A CLOCK hangs on the left wall.",
        spots: [
          [0.84, 0.58],
          [0.84, 0.2],
          [0.45, 0.82],
          [0.2, 0.62],
          [0.1, 0.22],
        ],
      },
      translation: [
        "M: 수연아, 이게 동아리 새 사무실 사진이야?",
        "W: 응, 이번 달 초에 옮겨 왔어.",
        "M: 오른쪽 벽에 넓은 책상이 있네.",
        "W: 둘이 나란히 앉을 수 있어.",
        "M: 그리고 책상 위에 알림판이 걸려 있고.",
        "W: 그 주 일정을 거기에 꽂아 둬.",
        "M: 창문 아래에 서류 상자가 세 개 보여.",
        "W: 사실 두 개야. 세 번째는 등받이 없는 의자야.",
        "M: 문 옆에는 키 큰 화분이 있네.",
        "W: 여름 내내 물 없이 버텼어.",
        "M: 그리고 왼쪽 벽에 시계가 걸려 있고.",
        "W: 일부러 5분 빠르게 맞춰 놨어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Kiwon, the club's film screening starts in an hour."],
        ["M", "The chairs are out and the screen is down."],
        ["W", "Did anyone bring the cable to connect the laptop?"],
        ["M", "I thought it was in the box with the projector."],
        ["W", "I unpacked the whole box and there's no cable."],
        ["M", "Then it's still in the broadcasting room."],
        ["W", "We borrowed it for the assembly last Friday."],
        ["M", "And the broadcasting room closes at five."],
        ["W", "It's twenty to five right now."],
        ["M", "Then I have to go this minute."],
        ["W", "I'll finish setting out the programs here."],
        ["M", "I'll go and get the cable from the broadcasting room."],
      ],
      choices: [
        "순서지를 놓기",
        "화면을 내리기",
        "방송실에서 연결선을 가져오기",
        "의자를 놓기",
        "노트북을 켜기",
      ],
      answer: 3,
      clue: "I'll go and get the cable from the broadcasting room.",
      explanation:
        "남자는 방송실에서 연결선을 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "W: 기원아, 동아리 영화 상영이 한 시간 뒤에 시작해.",
        "M: 의자는 놓았고 화면도 내렸어.",
        "W: 노트북 연결할 선은 누가 가져왔어?",
        "M: 영사기 상자에 같이 있는 줄 알았는데.",
        "W: 상자를 다 풀어 봤는데 선이 없어.",
        "M: 그럼 아직 방송실에 있겠다.",
        "W: 지난 금요일 조회 때 빌려 갔잖아.",
        "M: 그리고 방송실은 다섯 시에 닫고.",
        "W: 지금 다섯 시 20분 전이야.",
        "M: 그럼 당장 가야겠다.",
        "W: 나는 여기서 순서지 놓는 걸 마무리할게.",
        "M: 내가 방송실에서 연결선을 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to the equipment rental desk. How can I help you?"],
        ["W", "I'd like to rent two tripods and one lamp."],
        ["M", "The tripods are six dollars a day each."],
        ["W", "Is that the same price at the weekend?"],
        ["M", "The same every day of the week."],
        ["W", "And how much is the lamp?"],
        ["M", "The lamp is eight dollars a day."],
        ["W", "We need everything for two days."],
        ["M", "Do you want a carrying bag as well?"],
        ["W", "No, thank you. We already have our own."],
        ["M", "Members of the school club get ten percent off."],
        ["W", "I joined back in April. Here is my card."],
        ["M", "Then the discount applies to the whole rental."],
        ["W", "Good, I'll pay now."],
      ],
      choices: ["$32.40", "$36.00", "$38.00", "$40.00", "$44.00"],
      answer: 2,
      clue: "The tripods are six dollars a day each.",
      explanation:
        "이틀이면 삼각대 두 대 24달러와 등 16달러로 40달러인데, 10퍼센트를 빼면 36달러이다. 따라서 답은 ②이다.",
      translation: [
        "M: 기자재 대여대에 오신 걸 환영합니다. 무엇을 도와드릴까요?",
        "W: 삼각대 두 대랑 등 하나를 빌리고 싶어요.",
        "M: 삼각대는 한 대에 하루 6달러입니다.",
        "W: 주말에도 같은 값인가요?",
        "M: 요일에 상관없이 같습니다.",
        "W: 등은 얼마예요?",
        "M: 등은 하루에 8달러입니다.",
        "W: 전부 이틀 동안 필요해요.",
        "M: 가방도 필요하신가요?",
        "W: 아니요, 저희 것이 이미 있어요.",
        "M: 학교 동아리 회원은 10퍼센트 할인됩니다.",
        "W: 4월에 가입했어요. 여기 카드요.",
        "M: 그럼 대여 전체에 할인이 들어갑니다.",
        "W: 좋네요, 지금 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 자리를 옮긴 이유를 고르시오.",
      lines: [
        ["W", "Junho, I noticed you moved to the back of the classroom."],
        ["W", "You sat in the second row for two whole terms."],
        ["M", "I moved on Monday, with the teacher's permission."],
        ["W", "Was someone bothering you at the front?"],
        ["M", "Not at all. I got on with everyone there."],
        ["W", "Then is it hard to see the board from the front?"],
        ["M", "The board was perfectly clear from the second row."],
        ["W", "So why change after two terms?"],
        ["M", "They put the new heater right beside my old desk."],
        ["W", "And it runs all morning in winter."],
        ["M", "I could not stay awake past ten o'clock."],
        ["W", "Then moving was the only sensible thing."],
      ],
      choices: [
        "난방기 옆이라 졸려서",
        "칠판이 잘 안 보여서",
        "옆자리 학생 때문에",
        "몸이 아파서",
        "친구와 앉고 싶어서",
      ],
      answer: 1,
      clue: "They put the new heater right beside my old desk.",
      explanation:
        "난방기 옆이라 졸려서 자리를 옮겼다. 따라서 답은 ①이다.",
      translation: [
        "W: 준호야, 교실 뒤로 자리를 옮겼더라.",
        "W: 두 학기 내내 둘째 줄에 앉았잖아.",
        "M: 월요일에 선생님 허락 받고 옮겼어.",
        "W: 앞자리에서 누가 괴롭혔어?",
        "M: 전혀. 거기 사람들이랑 잘 지냈어.",
        "W: 그럼 앞에서는 칠판이 잘 안 보였어?",
        "M: 둘째 줄에서 칠판은 아주 잘 보였어.",
        "W: 그럼 두 학기나 지나서 왜 바꿨어?",
        "M: 새 난방기를 내 옛 책상 바로 옆에 놨어.",
        "W: 겨울에는 오전 내내 돌아가지.",
        "M: 열 시 넘어서는 깨어 있을 수가 없었어.",
        "W: 그럼 옮기는 게 유일하게 말이 되는 일이었네.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 수학 경시대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Sangjun, are you taking the school maths competition?"],
        ["W", "The notice appeared outside the maths office this morning."],
        ["M", "I read it before class. When is it held?"],
        ["W", "On the first Saturday of next month, in the morning."],
        ["M", "How long does the paper take?"],
        ["W", "Ninety minutes, with twenty questions."],
        ["M", "Can we use a calculator?"],
        ["W", "No calculators, only pen and paper."],
        ["M", "Which grades can enter?"],
        ["W", "Second and third grade students only this year."],
        ["M", "That's different from last year."],
        ["W", "Sign up at the maths office by Thursday."],
        ["M", "Then I'll put my name down at lunch."],
      ],
      choices: ["열리는 날", "시험 시간과 문항 수", "계산기 사용 여부", "지원할 수 있는 학년", "상의 종류"],
      answer: 5,
      clue: "On the first Saturday of next month, in the morning.",
      explanation:
        "날짜, 시간과 문항 수, 계산기, 학년은 말했지만 상은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 상준아, 교내 수학 경시대회 볼 거야?",
        "W: 오늘 아침에 수학과 교무실 밖에 알림이 붙었어.",
        "M: 수업 전에 읽었어. 언제 해?",
        "W: 다음 달 첫째 주 토요일 오전에.",
        "M: 시험은 얼마나 걸려?",
        "W: 90분이고 스무 문제야.",
        "M: 계산기 쓸 수 있어?",
        "W: 계산기는 안 되고 펜이랑 종이만.",
        "M: 어느 학년이 나갈 수 있어?",
        "W: 올해는 2학년과 3학년만.",
        "M: 작년이랑 다르네.",
        "W: 목요일까지 수학과 교무실에서 신청해.",
        "M: 그럼 점심때 이름 적어야겠다.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 학교 동아리 발표회에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, students. Here is the plan for the club presentation day. " +
            "It takes place on the third Friday of next month, after school. " +
            "Twelve clubs present in the main hall, one after another. " +
            "Each club is given eight minutes, including setting up. " +
            "A projector and two microphones are provided by the school. " +
            "Clubs must bring their own laptops and any instruments. " +
            "The order of clubs is drawn by lot on the day. " +
            "Families are welcome and may sit in the back rows. " +
            "Sign up at the student council room by next Wednesday.",
        ],
      ],
      choices: [
        "다음 달 셋째 주 금요일 방과 후에 열린다",
        "열두 동아리가 차례로 발표한다",
        "한 동아리에 8분이 주어진다",
        "영사기와 마이크는 학교가 준비한다",
        "발표 순서는 미리 정해 알려 준다",
      ],
      answer: 5,
      clue: "The order of clubs is drawn by lot on the day.",
      explanation:
        "발표 순서는 당일에 추첨으로 정한다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 동아리 발표회 계획을 알려 드립니다. 다음 달 셋째 주 금요일 방과 후에 열립니다. 열두 동아리가 대강당에서 차례로 발표합니다. 동아리마다 준비하는 시간까지 8분이 주어집니다. 영사기와 마이크 두 대는 학교에서 준비합니다. 동아리는 노트북과 악기를 각자 가져와야 합니다. 발표 순서는 당일에 추첨으로 정합니다. 가족분들도 오셔서 뒷줄에 앉으실 수 있습니다. 다음 주 수요일까지 학생회실에서 신청해 주세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 고를 견학 장소를 고르시오.",
      lines: [
        ["W", "Dohyun, which place should our class visit next month?"],
        ["M", "Five places replied to our letter this week."],
        ["W", "We leave at nine and have to be back by two."],
        ["M", "So anywhere more than an hour away is out."],
        ["W", "That still leaves us a few to choose from."],
        ["M", "The fee has to stay under fifteen thousand won each."],
        ["W", "That's what the school will cover per student."],
        ["M", "One of them is above that amount."],
        ["W", "And it has to take thirty-two students at once."],
        ["M", "Two of these only take twenty-five."],
        ["W", "Then only one place fits all three conditions."],
        ["M", "I'll call them tomorrow morning to book it."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "We leave at nine and have to be back by two.",
      explanation:
        "한 시간 이내, 1만 5천 원 미만, 32명 수용인 곳은 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Travel: 80 min / Fee: 12,000 won / Capacity: 40" },
          { no: 2, label: "②", value: "Travel: 40 min / Fee: 18,000 won / Capacity: 40" },
          { no: 3, label: "③", value: "Travel: 50 min / Fee: 13,000 won / Capacity: 25" },
          { no: 4, label: "④", value: "Travel: 45 min / Fee: 14,000 won / Capacity: 40" },
          { no: 5, label: "⑤", value: "Travel: 30 min / Fee: 11,000 won / Capacity: 25" },
        ],
      },
      translation: [
        "W: 도현아, 다음 달에 우리 반은 어디로 갈까?",
        "M: 이번 주에 다섯 곳에서 답을 보내왔어.",
        "W: 아홉 시에 떠나서 두 시까지 돌아와야 해.",
        "M: 그럼 한 시간 넘게 걸리는 데는 빠지네.",
        "W: 그래도 고를 게 몇 곳 남아.",
        "M: 비용은 한 사람에 1만 5천 원 미만이어야 해.",
        "W: 학교에서 학생 한 명당 그만큼 대 줘.",
        "M: 하나는 그보다 비싸.",
        "W: 그리고 서른두 명을 한 번에 받아야 해.",
        "M: 이 중 두 곳은 스물다섯 명까지만 돼.",
        "W: 그럼 세 조건에 다 맞는 곳은 하나뿐이야.",
        "M: 내일 아침에 전화해서 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you filled in the university preference form?"],
        ["M", "I wrote two of the three choices."],
        ["W", "It has to be handed in on Wednesday."],
        ["M", "That gives me two more evenings."],
        ["W", "Shall we go over the third choice together?"],
      ],
      choices: [
        "The form was due in March.",
        "Sure, after fifth period.",
        "I don't need a form.",
        "There is no third choice.",
        "Wednesday already passed.",
      ],
      answer: 2,
      clue: "Shall we go over the third choice together?",
      explanation:
        "같이 살펴보자는 제안이므로, 5교시 후에 하자는 ②가 가장 자연스럽다.",
      translation: [
        "W: 대학 지원 서류 다 썼어?",
        "M: 셋 중에 둘은 썼어.",
        "W: 수요일에 내야 해.",
        "M: 그럼 저녁이 이틀 남네.",
        "W: 세 번째 지망을 같이 볼까?",
        "M: 좋아, 5교시 끝나고.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, is there a quiet room I can study in?"],
        ["W", "The reading room on the third floor is the quietest."],
        ["M", "Does it stay open after six?"],
        ["W", "Until eight during exam weeks."],
        ["M", "Is this week counted as an exam week?"],
      ],
      choices: [
        "The room is closed today.",
        "Yes, it started on Monday.",
        "I don't study there.",
        "There is no third floor.",
        "You can't stay after six.",
      ],
      answer: 2,
      clue: "Is this week counted as an exam week?",
      explanation:
        "이번 주가 시험 주간인지 물었으므로, 월요일부터 시작됐다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 조용히 공부할 방이 있나요?",
        "W: 3층 열람실이 가장 조용해요.",
        "M: 여섯 시 넘어서도 열어 두나요?",
        "W: 시험 주간에는 여덟 시까지요.",
        "M: 이번 주도 시험 주간인가요?",
        "W: 네, 월요일부터 시작됐어요.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Areum, how is the club's new member training going?"],
        ["W", "We explained everything at one long meeting in March."],
        ["M", "How long did that meeting run?"],
        ["W", "Almost three hours, with a break in the middle."],
        ["M", "How much do the new members remember now?"],
        ["W", "They ask me the same questions every week."],
        ["M", "Three hours in one day is hard to keep."],
        ["W", "I thought telling them once was enough."],
        ["M", "The same content spread over four weeks would stay."],
        ["W", "That would mean four short meetings instead."],
        ["M", "How long could each of those be?"],
      ],
      choices: [
        "Three hours each.",
        "About thirty minutes.",
        "We'll stop training them.",
        "One meeting is enough.",
        "There are no new members.",
      ],
      answer: 2,
      clue: "How long could each of those be?",
      explanation:
        "짧은 모임을 얼마나 할지 물었으므로, 30분쯤이라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 아름아, 동아리 새 회원 교육은 잘돼 가?",
        "W: 3월에 긴 모임 한 번으로 다 설명했어.",
        "M: 그 모임이 얼마나 걸렸어?",
        "W: 중간에 쉬는 시간 넣어서 거의 세 시간.",
        "M: 새 회원들이 지금 얼마나 기억해?",
        "W: 주마다 나한테 같은 걸 물어.",
        "M: 하루에 세 시간은 남기기 어렵지.",
        "W: 한 번 말해 주면 되는 줄 알았어.",
        "M: 같은 내용을 네 주에 나누면 남아.",
        "W: 그럼 짧은 모임을 네 번 하자는 거네.",
        "M: 한 번에 얼마나 하면 될까?",
        "W: 30분쯤.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, you said you keep losing marks for careless mistakes."],
        ["M", "Five or six every test, always small ones."],
        ["W", "Do you check your paper at the end?"],
        ["M", "I read it through from the first question."],
        ["W", "And by question ten you are reading what you meant."],
        ["M", "I suppose my eyes just slide over it."],
        ["W", "Checking backwards breaks that pattern."],
        ["M", "Start at the last question and work forward?"],
        ["W", "The brain cannot predict what comes next that way."],
        ["M", "That sounds strange but I can see why."],
        ["W", "Which test could you try it in first?"],
      ],
      choices: [
        "I won't try it at all.",
        "The maths test on Friday.",
        "I'll check it forwards again.",
        "Checking never helps.",
        "I'll stop taking tests.",
      ],
      answer: 2,
      clue: "Which test could you try it in first?",
      explanation:
        "어느 시험에서 먼저 해 볼지 물었으므로, 금요일 수학 시험이라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태민아, 실수로 점수를 계속 깎인다고 했잖아.",
        "M: 시험마다 대여섯 개, 늘 작은 것들이야.",
        "W: 끝나고 검토는 해?",
        "M: 1번부터 쭉 읽어 내려가.",
        "W: 그러다 10번쯤이면 쓰려던 걸 읽고 있지.",
        "M: 눈이 그냥 미끄러지는 것 같아.",
        "W: 거꾸로 검토하면 그 흐름이 끊겨.",
        "M: 마지막 문제부터 앞으로 오라는 거야?",
        "W: 그러면 뇌가 다음에 뭐가 올지 예측을 못 해.",
        "M: 이상하게 들리는데 왜 그런지는 알겠어.",
        "W: 어느 시험에서 먼저 해 볼래?",
        "M: 금요일 수학 시험.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Nari가 Seongjun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Nari : ________________",
      lines: [
        [
          "W",
          "Nari and Seongjun are preparing the club's display board. " +
            "Seongjun has written all the text by hand in pencil " +
            "because he wanted to be able to correct any mistakes. " +
            "The board will hang in the corridor for the whole of next month, " +
            "where hundreds of students brush past it every day. " +
            "Nari knows that pencil rubs off within a few days of that traffic, " +
            "and that by the second week the board would be almost blank. " +
            "She wants him to go over the writing in ink before it goes up. " +
            "In this situation, what would Nari most likely say to Seongjun?",
        ],
      ],
      choices: [
        "Write it in pencil again.",
        "The display comes down today.",
        "Go over the writing in ink.",
        "Let's hang it in the classroom.",
        "Nobody walks down that corridor.",
      ],
      answer: 3,
      clue: "She wants him to go over the writing in ink before it goes up.",
      explanation:
        "연필 글씨가 지워지므로, 잉크로 덧쓰라는 ③이 가장 적절하다.",
      translation: [
        "W: 나리와 성준이는 동아리 게시판을 준비하고 있습니다. 성준이는 잘못을 고칠 수 있게 하려고 글을 전부 연필로 손으로 썼습니다. 이 게시판은 다음 달 내내 복도에 걸리는데, 그곳은 날마다 수백 명이 스치고 지나갑니다. 나라는 그런 통행이면 연필 글씨가 며칠 만에 지워지고, 둘째 주쯤이면 게시판이 거의 비어 버린다는 것을 압니다. 그녀는 걸기 전에 잉크로 덧쓰기를 바랍니다. 이런 상황에서 나리가 성준이에게 할 말로 가장 적절한 것은 무엇일까요?",
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
            "make tools out of whatever happens to be lying around them. " +
            "A crow in the wild bends a twig into a hook " +
            "and pulls a grub out of a hole it could never reach with its beak. " +
            "The sea otter keeps one favourite stone under its arm " +
            "and uses the same stone for years to break open shells. " +
            "An octopus carries two halves of a coconut shell across the sea floor " +
            "and closes them around itself when something approaches. " +
            "Certain ants drop leaves onto spilled honey " +
            "and carry the soaked leaf home rather than drowning in it. " +
            "The hand, it turns out, was never the only requirement.",
        ],
      ],
      choices: [
        "how animals make and use tools",
        "why crows live near people",
        "how octopuses hide from predators",
        "why some animals collect stones",
        "how ants find food in groups",
      ],
      answer: 1,
      clue: "The hand, it turns out, was never the only requirement.",
      explanation:
        "동물들이 도구를 만들어 쓰는 방식이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 오늘은 동물들이 곁에 놓인 것으로 도구를 만들어 쓰는 방식을 이야기하려 합니다. 야생 까마귀는 잔가지를 구부려 갈고리를 만들고, 부리로는 결코 닿을 수 없는 구멍에서 애벌레를 끌어냅니다. 해달은 아끼는 돌 하나를 겨드랑이에 끼고 다니며, 몇 해 동안 같은 돌로 조개를 깨뜨립니다. 문어는 야자 껍데기 반쪽 두 개를 바닥으로 들고 다니다가 무언가 다가오면 제 몸을 감싸 닫습니다. 어떤 개미는 흘린 꿀 위에 잎을 떨어뜨리고, 거기 빠져 죽는 대신 꿀이 밴 잎을 집으로 나릅니다. 손이 유일한 조건이었던 적은 없었던 모양입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 동물이 아닌 것을 고르시오.",
      lines: [
        ["M", "A crow in the wild bends a twig into a hook."],
        ["M", "The sea otter keeps one favourite stone under its arm."],
        ["M", "An octopus carries two halves of a coconut shell."],
        ["M", "Certain ants drop leaves onto spilled honey."],
        ["M", "The hand was never the only requirement."],
      ],
      choices: ["crows", "sea otters", "octopuses", "ants", "chimpanzees"],
      answer: 5,
      clue: "Certain ants drop leaves onto spilled honey.",
      explanation:
        "까마귀, 해달, 문어, 개미는 언급되지만 침팬지는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
