/** 고1 듣기 41회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 41회",
  gradeLevel: "high1",
  speechSpeed: 0.8,
  folder: "고1 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Good morning, students. This is Ms. Oh from the third year office. " +
            "I am speaking about the study rooms on the fourth floor. " +
            "Since March those rooms have been open to anyone who walked in, " +
            "and by the second week of every month the chairs and desks were left in a state " +
            "that the next class had to spend ten minutes fixing. " +
            "From next Monday each room will be looked after by one class for a whole month, " +
            "and that class checks it at the end of the day. " +
            "The rota is on the wall beside the water cooler. " +
            "The opening hours and the booking system do not change. " +
            "Please leave the room as you would like to find it. Thank you.",
        ],
      ],
      choices: [
        "자습실 관리 방식 변경을 안내하려고",
        "자습실 신설을 알리려고",
        "시험 일정을 안내하려고",
        "정수기 고장을 알리려고",
        "자습실 이용 시간 연장을 알리려고",
      ],
      answer: 1,
      clue: "From next Monday each room will be looked after by one class for a whole month.",
      explanation:
        "여자는 다음 주부터 각 자습실을 한 반이 한 달씩 맡아 관리한다고 안내한다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 3학년 교무실 오 선생님입니다. 4층 자습실에 대해 말씀드립니다. 3월부터 그 방들은 누구나 들어와 쓸 수 있었고, 매달 둘째 주면 의자와 책상이 어질러져 다음 반이 10분씩 정리해야 했습니다. 다음 주 월요일부터는 각 방을 한 반이 한 달씩 맡아 관리하고, 그 반이 하루가 끝날 때 상태를 확인합니다. 순번표는 정수기 옆 벽에 붙여 두었습니다. 여는 시간과 예약 방식은 달라지지 않습니다. 여러분이 들어가고 싶은 모습 그대로 두고 나와 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Jiyoon, I've decided to study with four friends every evening."],
        ["M", "All four of you in the same room, at the same table?"],
        ["W", "That's the plan. We keep each other going."],
        ["M", "How long did last night's session actually last?"],
        ["W", "Three hours, though we talked for some of it."],
        ["M", "How much of the three hours was talking?"],
        ["W", "Maybe half, if I'm honest about it."],
        ["M", "Then you studied for ninety minutes and called it three hours."],
        ["W", "So group study is pointless?"],
        ["M", "Not pointless. It's for checking and explaining, not for reading."],
        ["W", "Read alone first, meet afterwards, you mean."],
        ["M", "Exactly. Bring questions to the table, not blank pages."],
      ],
      choices: [
        "혼자 공부한 뒤에 모여야 한다",
        "공부는 반드시 함께 해야 한다",
        "공부 시간을 기록해야 한다",
        "저녁보다 아침에 공부해야 한다",
        "친구를 바꾸어 가며 공부해야 한다",
      ],
      answer: 1,
      clue: "Read alone first, meet afterwards, you mean.",
      explanation:
        "남자는 모임은 확인하고 설명하는 자리라며 혼자 읽고 난 뒤에 모이라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 지윤아, 저녁마다 친구 넷이랑 같이 공부하기로 했어.",
        "M: 넷이 같은 방 같은 탁자에서?",
        "W: 그럴 계획이야. 서로 붙잡아 주니까.",
        "M: 어젯밤 모임은 실제로 얼마나 했어?",
        "W: 세 시간. 중간에 이야기도 좀 했지만.",
        "M: 그 세 시간 중에 이야기한 건 얼마나 돼?",
        "W: 솔직히 말하면 절반쯤.",
        "M: 그럼 90분 공부하고 세 시간이라고 부른 거네.",
        "W: 그럼 모여서 공부하는 게 소용없다는 거야?",
        "M: 소용없진 않아. 확인하고 설명하는 자리지 읽는 자리가 아니야.",
        "W: 혼자 읽고 나서 모이라는 말이구나.",
        "M: 맞아. 빈 쪽 말고 질문을 들고 와.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Everyone tells you to set a goal, and almost nobody tells you to set a floor. " +
            "A goal is what you reach on a good day. " +
            "A floor is the smallest amount you will do on your worst day, " +
            "the day you are tired and late and nothing has gone right. " +
            "Ten minutes is a floor. One page is a floor. " +
            "Without one, a bad Tuesday becomes a bad week, " +
            "because stopping is far easier the second time than the first. " +
            "A floor is not about how much you get done. " +
            "It is about never having to start again from nothing.",
        ],
      ],
      choices: [
        "목표는 높게 잡아야 한다",
        "힘든 날에도 지킬 최소한을 정해야 한다",
        "계획은 남에게 알려야 한다",
        "휴식을 정해 두어야 한다",
        "공부는 같은 시간에 해야 한다",
      ],
      answer: 2,
      clue: "A floor is the smallest amount you will do on your worst day.",
      explanation:
        "여자는 목표보다 가장 힘든 날에도 지킬 최소한을 정해 두어야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 누구나 목표를 세우라고 말하지만, 바닥을 정하라고 말해 주는 사람은 거의 없습니다. 목표는 좋은 날에 닿는 것입니다. 바닥은 가장 나쁜 날, 곧 피곤하고 늦고 아무것도 잘 풀리지 않은 날에도 해낼 가장 적은 양입니다. 10분도 바닥입니다. 한 쪽도 바닥입니다. 그것이 없으면 나쁜 화요일이 나쁜 한 주가 됩니다. 멈추는 일은 두 번째가 첫 번째보다 훨씬 쉽기 때문입니다. 바닥은 얼마나 해내느냐의 문제가 아닙니다. 다시 아무것도 없는 데서 시작하지 않아도 되게 하는 장치입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Hyerin, is this the photography club's darkroom?"],
        ["W", "Yes, we finished painting it over the holiday."],
        ["M", "A long sink runs along the back wall."],
        ["W", "We wash the prints there, three at a time."],
        ["M", "There's a round lamp hanging above the sink."],
        ["W", "It's the red one, so it doesn't spoil the paper."],
        ["M", "A wooden drying rack stands on the right."],
        ["W", "Prints hang on it overnight before we look at them."],
        ["M", "There are four clips on the line above the sink."],
        ["W", "Six, actually. Two of them are behind the lamp."],
        ["M", "And a striped stool sits in the left corner."],
        ["W", "Whoever is waiting for a print sits on it."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Six, actually. Two of them are behind the lamp.",
      explanation:
        "남자가 집게가 네 개라고 하자 여자가 여섯 개라고 바로잡는다. 그림에는 네 개가 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.58],
          [0.5, 0.1],
          [0.85, 0.42],
          [0.28, 0.33],
          [0.08, 0.72],
        ],
        scene:
          "A photography darkroom drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A LONG SINK runs along the BACK wall across the middle of the picture. " +
          "A ROUND HANGING LAMP hangs from the ceiling directly above the sink. " +
          "A WOODEN DRYING RACK with empty shelves stands on the RIGHT side of the room. " +
          "A THIN LINE is stretched across the wall above the sink with EXACTLY FOUR CLIPS on it, " +
          "evenly spaced and clearly separated so all four can be counted. " +
          "A STOOL with a STRIPED seat sits in the LEFT corner of the floor.",
      },
      translation: [
        "M: 혜린아, 여기가 사진 동아리 암실이야?",
        "W: 응, 연휴 동안 칠을 다 끝냈어.",
        "M: 뒷벽을 따라 긴 싱크대가 있네.",
        "W: 거기서 사진을 세 장씩 씻어.",
        "M: 싱크대 위에 둥근 등이 매달려 있어.",
        "W: 붉은 등이라 종이를 상하게 하지 않아.",
        "M: 오른쪽에는 나무 건조대가 서 있고.",
        "W: 사진을 하룻밤 걸어 두고 나서 봐.",
        "M: 싱크대 위 줄에 집게가 네 개 있네.",
        "W: 사실 여섯 개야. 두 개는 등 뒤에 가려 있어.",
        "M: 그리고 왼쪽 구석에는 줄무늬 의자가 있어.",
        "W: 사진 나오기를 기다리는 사람이 거기 앉아.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Naeun, the exchange students arrive on Wednesday morning."],
        ["W", "Have the host families all been confirmed?"],
        ["M", "Eight of the nine, and the last one answered last night."],
        ["W", "What about the welcome sign at the gate?"],
        ["M", "The art club painted it on Friday afternoon."],
        ["W", "Then the only thing left is the schedule."],
        ["M", "They need it in English, one page, for the whole week."],
        ["W", "Has anyone started translating it?"],
        ["M", "Nobody has. The Korean version was only finished this morning."],
        ["W", "One page takes about an hour to do properly."],
        ["M", "And the office wants copies before five today."],
        ["W", "I'll translate the schedule into English now."],
      ],
      choices: [
        "안내 표지를 그리기",
        "가정에 연락하기",
        "일정표를 영어로 옮기기",
        "복사를 해 오기",
        "학생들을 마중 나가기",
      ],
      answer: 3,
      clue: "I'll translate the schedule into English now.",
      explanation:
        "여자는 지금 일정표를 영어로 옮기겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 나은아, 교환 학생들이 수요일 아침에 도착해.",
        "W: 머물 가정은 다 정해졌어?",
        "M: 아홉 중 여덟. 마지막 한 집이 어젯밤에 답을 줬어.",
        "W: 정문에 걸 환영 표지는?",
        "M: 미술 동아리가 금요일 오후에 그렸어.",
        "W: 그럼 남은 건 일정표뿐이네.",
        "M: 영어로, 한 쪽에, 한 주 전체가 들어가야 해.",
        "W: 옮기기 시작한 사람 있어?",
        "M: 아무도 없어. 한국어 판도 오늘 아침에야 끝났어.",
        "W: 한 쪽을 제대로 하려면 한 시간쯤 걸려.",
        "M: 그런데 행정실에서 오늘 다섯 시 전에 복사본을 달래.",
        "W: 지금 일정표를 영어로 옮길게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good afternoon. Are you here about the T-shirt printing?"],
        ["M", "Yes, we need shirts for our club."],
        ["W", "A plain shirt is eight dollars each."],
        ["M", "We'd like ten of them, please."],
        ["W", "Printing on the front is three dollars per shirt."],
        ["M", "And on the back as well?"],
        ["W", "The back costs another two dollars per shirt."],
        ["M", "Front only, then. We'll keep the back plain."],
        ["W", "Do you need them in under three days?"],
        ["M", "No, the normal week is fine for us."],
        ["W", "Good. Orders over a hundred dollars get ten percent off."],
        ["M", "Here is the club card, then."],
      ],
      choices: ["$99", "$110", "$121", "$90", "$130"],
      answer: 1,
      clue: "Printing on the front is three dollars per shirt.",
      explanation:
        "한 장에 8달러와 앞면 인쇄 3달러를 더해 열 장이면 110달러이고, 100달러가 넘어 10퍼센트를 빼면 99달러이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 티셔츠 인쇄 때문에 오셨나요?",
        "M: 네, 동아리에서 쓸 티셔츠가 필요해요.",
        "W: 아무 무늬 없는 티셔츠는 한 장에 8달러입니다.",
        "M: 열 장 주세요.",
        "W: 앞면 인쇄는 한 장에 3달러입니다.",
        "M: 뒷면도요?",
        "W: 뒷면은 한 장에 2달러가 더 붙습니다.",
        "M: 그럼 앞면만요. 뒤는 비워 둘게요.",
        "W: 사흘 안에 필요하신가요?",
        "M: 아니요, 보통 일주일이면 괜찮아요.",
        "W: 좋습니다. 100달러가 넘는 주문은 10퍼센트 할인됩니다.",
        "M: 그럼 여기 동아리 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 오늘 점심을 사 먹지 않은 이유를 고르시오.",
      lines: [
        ["W", "Minjun, you brought your lunch from home today."],
        ["W", "You usually buy something at the school shop."],
        ["M", "I do, but not today and probably not tomorrow."],
        ["W", "Is the shop closed for repairs again?"],
        ["M", "It's open. I walked past it this morning."],
        ["W", "Then are you saving money for the trip?"],
        ["M", "No, my mother made too much food last night."],
        ["W", "So you're finishing what was left."],
        ["M", "Three containers of it, and none of it should be thrown away."],
      ],
      choices: [
        "매점이 문을 닫아서",
        "돈을 아끼려고",
        "어젯밤 남은 음식을 가져와서",
        "몸이 아파서",
        "급식을 신청하지 않아서",
      ],
      answer: 3,
      clue: "No, my mother made too much food last night.",
      explanation:
        "남자는 어머니가 어젯밤에 음식을 많이 만들어 남은 것을 가져왔다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 민준아, 오늘은 집에서 점심을 싸 왔네.",
        "W: 보통은 매점에서 사 먹잖아.",
        "M: 그러는데 오늘은 아니고 내일도 아마 아닐 거야.",
        "W: 매점이 또 공사로 닫았어?",
        "M: 열었어. 아침에 지나가면서 봤어.",
        "W: 그럼 여행비 모으려고?",
        "M: 아니, 어젯밤에 엄마가 음식을 너무 많이 만드셨어.",
        "W: 그럼 남은 걸 먹어 치우는 거구나.",
        "M: 통으로 세 개야. 하나도 버리면 안 돼.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 과학 전시회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Chaewon, are you taking part in the science exhibition?"],
        ["W", "I'd like to, but I only know the name of it."],
        ["M", "It opens on the eighteenth and runs for three days."],
        ["W", "That's two weeks from now. Where is it held?"],
        ["M", "In the big hall on the first floor, along both walls."],
        ["W", "Do we work alone or with a partner?"],
        ["M", "Up to three people in a team, and one person leads."],
        ["W", "What has to be submitted in the end?"],
        ["M", "A poster and a one page summary, both in English."],
        ["W", "Does the school provide the poster board?"],
        ["M", "They give each team one board and the tape."],
      ],
      choices: ["전시 기간", "전시가 열리는 곳", "팀 구성 방법", "제출해야 하는 것", "심사 결과 발표 방법"],
      answer: 5,
      clue: "It opens on the eighteenth and runs for three days.",
      explanation:
        "기간, 장소, 팀 구성, 제출물은 말했지만 결과 발표 방법은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 채원아, 과학 전시회에 참가할 거야?",
        "W: 하고 싶은데 이름만 알아.",
        "M: 18일에 시작해서 사흘 동안 해.",
        "W: 2주 뒤네. 어디서 열려?",
        "M: 1층 큰 강당 양쪽 벽을 따라서.",
        "W: 혼자 해? 짝이랑 해?",
        "M: 한 팀에 세 명까지. 한 명이 팀장을 맡아.",
        "W: 마지막에 뭘 내야 해?",
        "M: 포스터 한 장이랑 한 쪽짜리 요약. 둘 다 영어로.",
        "W: 포스터 판은 학교에서 줘?",
        "M: 팀마다 판 하나랑 테이프를 줘.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Maple Street Night Library에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Maple Street Night Library, which opened in April. " +
            "The library is open from six in the evening until one in the morning. " +
            "It stands two streets behind the bus terminal, next to the old bakery. " +
            "Anyone with a city library card may enter, and the card is free. " +
            "There are ninety seats, and thirty of them can be booked online in advance. " +
            "Hot drinks may be brought in, but food is not allowed in the reading area. " +
            "Staff are at the desk until eleven, and after that the building is unstaffed. " +
            "The library closes completely on the first Monday of every month.",
        ],
      ],
      choices: [
        "저녁 여섯 시에 문을 연다",
        "버스 터미널 뒤편에 있다",
        "좌석 중 서른 개는 미리 예약할 수 있다",
        "읽는 자리에서 음식을 먹을 수 있다",
        "매달 첫째 월요일에는 문을 닫는다",
      ],
      answer: 4,
      clue: "Hot drinks may be brought in, but food is not allowed in the reading area.",
      explanation:
        "읽는 자리에서는 음식을 먹을 수 없다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 4월에 문을 연 메이플가 야간 도서관에 대해 알려 드립니다. 도서관은 저녁 여섯 시부터 새벽 한 시까지 엽니다. 버스 터미널에서 두 블록 뒤, 오래된 빵집 옆에 있습니다. 시립 도서관 카드가 있으면 누구나 들어올 수 있고 카드는 무료입니다. 자리는 아흔 개이고 그중 서른 개는 미리 인터넷으로 예약할 수 있습니다. 따뜻한 음료는 가지고 들어올 수 있지만 읽는 자리에서 음식은 안 됩니다. 직원은 열한 시까지 접수대에 있고 그 뒤로는 직원이 없습니다. 매달 첫째 월요일에는 완전히 문을 닫습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 주말 봉사 활동을 고르시오.",
      lines: [
        ["M", "Seoyun, five volunteer programmes are open this month."],
        ["W", "We can only go on Sunday, remember."],
        ["M", "Then the two Saturday ones are out."],
        ["W", "How far is each of the others from here?"],
        ["M", "They range from ten minutes to an hour by bus."],
        ["W", "More than half an hour is too far for a Sunday."],
        ["M", "One of the three left takes a whole hour."],
        ["W", "And it should run for three hours or less."],
        ["M", "One of the last two runs for five hours."],
        ["W", "So there's only one programme we can take."],
        ["M", "I'll put both our names down this evening."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "We can only go on Sunday, remember.",
      explanation:
        "일요일, 30분 이내 거리, 3시간 이하인 활동을 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Saturday / Travel: 20 min / Hours: 3" },
          { no: 2, label: "②", value: "Day: Sunday / Travel: 25 min / Hours: 3" },
          { no: 3, label: "③", value: "Day: Sunday / Travel: 60 min / Hours: 2" },
          { no: 4, label: "④", value: "Day: Sunday / Travel: 15 min / Hours: 5" },
          { no: 5, label: "⑤", value: "Day: Saturday / Travel: 10 min / Hours: 2" },
        ],
      },
      translation: [
        "M: 서윤아, 이번 달에 봉사 활동 다섯 개가 열려 있어.",
        "W: 우리는 일요일에만 갈 수 있잖아.",
        "M: 그럼 토요일 두 개는 빠지네.",
        "W: 나머지는 여기서 얼마나 걸려?",
        "M: 버스로 10분에서 한 시간까지 있어.",
        "W: 일요일에 30분 넘는 건 너무 멀어.",
        "M: 남은 셋 중 하나는 한 시간이 꼬박 걸려.",
        "W: 그리고 세 시간 이하로 하는 데여야 해.",
        "M: 남은 둘 중 하나는 다섯 시간이야.",
        "W: 그럼 우리가 갈 수 있는 건 하나뿐이네.",
        "M: 오늘 저녁에 둘 다 이름 적을게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Dayeon, did you find the class photo album?"],
        ["W", "Not yet. It wasn't in the cupboard."],
        ["M", "The homeroom teacher may have taken it."],
        ["W", "She's not in the staff room right now."],
        ["M", "Shall I leave a note on her desk?"],
      ],
      choices: [
        "No, I found the album.",
        "The cupboard is locked.",
        "Yes, please, that's a good idea.",
        "She doesn't have a desk.",
        "I don't need the album.",
      ],
      answer: 3,
      clue: "Shall I leave a note on her desk?",
      explanation:
        "책상에 쪽지를 남길지 물었으므로, 그렇게 해 달라는 ③이 가장 자연스럽다.",
      translation: [
        "M: 다연아, 학급 사진첩 찾았어?",
        "W: 아직. 장 안에는 없었어.",
        "M: 담임 선생님이 가져가셨을 수도 있어.",
        "W: 지금 교무실에 안 계셔.",
        "M: 책상에 쪽지 남길까?",
        "W: 응, 부탁해. 좋은 생각이야.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, are you free during the fifth period?"],
        ["M", "That's my free period, yes."],
        ["W", "Our group needs one more person for the rehearsal."],
        ["M", "Where are you practising?"],
        ["W", "In the small hall, from one thirty."],
      ],
      choices: [
        "I have class then.",
        "The hall is closed today.",
        "All right, I'll be there at one thirty.",
        "You should rehearse alone.",
        "I don't know your group.",
      ],
      answer: 3,
      clue: "In the small hall, from one thirty.",
      explanation:
        "5교시가 빈 시간이라고 했고 장소와 시간을 들었으므로, 가겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 태민아, 5교시에 시간 돼?",
        "M: 응, 그때가 내 공강이야.",
        "W: 우리 조 연습에 한 명이 더 필요해.",
        "M: 어디서 연습해?",
        "W: 소강당에서, 1시 30분부터.",
        "M: 알겠어, 1시 30분에 갈게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Hyewon, you've rewritten that introduction four times."],
        ["W", "And I still don't like any of the four."],
        ["M", "What are you trying to do in the first sentence?"],
        ["W", "Explain the whole topic before anything else."],
        ["M", "That's the job of the second paragraph, not the first line."],
        ["W", "Then what should the first line carry?"],
        ["M", "One concrete thing the reader can picture."],
        ["W", "Mine begins with a definition from the textbook."],
        ["M", "Which is why it feels heavy before it has started."],
        ["W", "I suppose nobody pictures a definition."],
        ["M", "Open with the experiment you actually did on Tuesday."],
      ],
      choices: [
        "I never did an experiment.",
        "That's a better opening, I'll change it.",
        "Definitions are always best.",
        "I'll delete the introduction.",
        "You should write it for me.",
      ],
      answer: 2,
      clue: "Open with the experiment you actually did on Tuesday.",
      explanation:
        "실제로 한 실험으로 시작하라는 제안이므로, 그렇게 바꾸겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 혜원아, 그 머리말을 네 번이나 다시 썼네.",
        "W: 그런데 네 개 다 마음에 안 들어.",
        "M: 첫 문장에서 뭘 하려는 거야?",
        "W: 다른 것보다 먼저 주제 전체를 설명하려고.",
        "M: 그건 둘째 문단이 할 일이지 첫 줄이 할 일이 아니야.",
        "W: 그럼 첫 줄에는 뭘 담아야 해?",
        "M: 읽는 사람이 그려 볼 수 있는 구체적인 것 하나.",
        "W: 내 건 교과서에 있는 정의로 시작해.",
        "M: 그래서 시작도 전에 무겁게 느껴지는 거야.",
        "W: 정의를 머릿속에 그리는 사람은 없겠지.",
        "M: 화요일에 실제로 한 실험으로 시작해 봐.",
        "W: 그게 더 좋은 시작이네, 바꿀게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junho, you've been keeping a money notebook."],
        ["M", "Since January. Every won I spend goes in it."],
        ["W", "Isn't that tiring after a few weeks?"],
        ["M", "It takes about two minutes before bed."],
        ["W", "What has it actually changed for you?"],
        ["M", "I stopped buying drinks at the shop every afternoon."],
        ["W", "Did you decide to stop, or did it just happen?"],
        ["M", "Neither. I saw the same line eleven times in one week."],
        ["W", "So the notebook argued with you instead of your parents."],
        ["M", "That's exactly how it felt, and I couldn't disagree."],
        ["W", "Could you show me how you set the pages out?"],
      ],
      choices: [
        "Sure, I'll bring it tomorrow.",
        "I lost the notebook in June.",
        "I don't write anything down.",
        "You should spend more money.",
        "My parents keep the notebook.",
      ],
      answer: 1,
      clue: "Could you show me how you set the pages out?",
      explanation:
        "쪽을 어떻게 꾸미는지 보여 달라고 했으므로, 내일 가져오겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 준호야, 용돈 기록장을 쓰고 있다며.",
        "M: 1월부터. 쓰는 돈은 한 원까지 다 적어.",
        "W: 몇 주 지나면 지치지 않아?",
        "M: 자기 전에 2분쯤 걸려.",
        "W: 그게 실제로 뭘 바꿨어?",
        "M: 오후마다 매점에서 음료 사 먹는 걸 그만뒀어.",
        "W: 그만두기로 정한 거야, 저절로 그렇게 된 거야?",
        "M: 둘 다 아니야. 한 주에 같은 줄을 열한 번 봤거든.",
        "W: 부모님 대신 공책이 잔소리를 한 셈이네.",
        "M: 딱 그런 느낌이었어. 반박할 수가 없었어.",
        "W: 쪽을 어떻게 만드는지 보여 줄래?",
        "M: 그럼, 내일 가져올게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Sohee가 Kiyoung에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Sohee : ________________",
      lines: [
        [
          "W",
          "Sohee and Kiyoung are running the school radio together this term. " +
            "Every Friday they interview one teacher for the lunch programme. " +
            "Kiyoung has prepared twenty questions for tomorrow's guest. " +
            "The interview slot is only eight minutes long in total. " +
            "Last week they asked twelve questions and still had to stop in the middle. " +
            "Sohee knows that twenty questions cannot possibly fit into the time. " +
            "She wants to ask him to choose the six best questions instead. " +
            "In this situation, what would Sohee most likely say to Kiyoung?",
        ],
      ],
      choices: [
        "Let's cancel tomorrow's interview.",
        "We need a different teacher this week.",
        "Pick the six questions that matter most.",
        "I'll ask all twenty myself.",
        "The programme is far too short.",
      ],
      answer: 3,
      clue: "She wants to ask him to choose the six best questions instead.",
      explanation:
        "8분 안에 스무 개는 불가능하므로 중요한 여섯 개만 고르자는 뜻이다. 따라서 답은 ③이다.",
      translation: [
        "W: 소희와 기영이는 이번 학기에 학교 라디오를 함께 맡고 있습니다. 금요일마다 점심 방송에서 선생님 한 분을 인터뷰합니다. 기영이는 내일 손님을 위해 질문 스무 개를 준비했습니다. 인터뷰 시간은 모두 합해 8분뿐입니다. 지난주에는 열두 개를 물었는데도 중간에 끊어야 했습니다. 소희는 스무 개가 그 시간에 도저히 들어갈 수 없다는 것을 압니다. 소희는 대신 가장 좋은 질문 여섯 개를 고르자고 말하고 싶습니다. 이런 상황에서 소희가 기영이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to explain why a cut onion turns brown " +
            "while a cut onion in water does not. " +
            "Inside the cells of many fruits and vegetables sits an enzyme " +
            "that is kept apart from the substances it would change. " +
            "A knife breaks that separation, and the enzyme meets both those substances and the air. " +
            "Oxygen from the air is the third partner in the reaction, " +
            "and the brown colour is simply the product of the three meeting. " +
            "Water keeps the air away from the cut surface, which is why a slice kept under water stays pale. " +
            "Lemon juice works for a different reason. " +
            "Its acid slows the enzyme itself, so the reaction never gets started. " +
            "The same chemistry explains the brown ring on a bitten apple.",
        ],
      ],
      choices: [
        "how vegetables are stored in cold rooms",
        "why cut fruit and vegetables turn brown",
        "how lemons are grown and harvested",
        "why some foods taste sour when fresh",
        "how knives should be cleaned after cooking",
      ],
      answer: 2,
      clue: "Oxygen from the air is the third partner in the reaction.",
      explanation:
        "남자는 효소와 물질과 공기 중 산소가 만나 갈색이 생긴다며 물과 레몬즙이 막는 방식을 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 자른 양파는 갈색으로 변하는데 물에 담근 양파는 왜 그렇지 않은지 설명하려 합니다. 많은 과일과 채소의 세포 안에는 자기가 바꿀 물질과 떨어져 있는 효소가 들어 있습니다. 칼이 그 경계를 부수면 효소는 그 물질과 공기를 함께 만납니다. 공기 속 산소가 이 반응의 세 번째 짝이고, 갈색은 그 셋이 만난 결과일 뿐입니다. 물은 잘린 면에 공기가 닿지 못하게 하므로 물속에 둔 조각은 하얗게 남습니다. 레몬즙은 다른 이유로 듣습니다. 그 산이 효소 자체를 늦춰 반응이 아예 시작되지 않게 합니다. 같은 화학이 베어 문 사과에 생기는 갈색 테두리도 설명해 줍니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Today I want to explain why a cut onion turns brown."],
        ["M", "An enzyme is kept apart from the substances it would change."],
        ["M", "Oxygen from the air is the third partner in the reaction."],
        ["M", "Water keeps the air away from the cut surface."],
        ["M", "Lemon juice slows the enzyme itself."],
      ],
      choices: [
        "an enzyme kept apart inside the cells",
        "oxygen from the air joining the reaction",
        "water keeping air away from a cut surface",
        "lemon juice slowing the enzyme",
        "the number of onions grown each year",
      ],
      answer: 5,
      clue: "An enzyme is kept apart from the substances it would change.",
      explanation:
        "세포 안에 떨어져 있는 효소, 반응에 끼어드는 산소, 공기를 막는 물, 효소를 늦추는 레몬즙은 언급되지만 해마다 기르는 양파의 양은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
