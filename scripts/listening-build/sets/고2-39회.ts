/** 고2 듣기 39회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 39회",
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
          "Good afternoon, students. This is Mr. Ha from the school office. " +
            "I am speaking about the lockers in the second floor corridor. " +
            "Over the past two years a number of lockers have been used " +
            "by students who left the school long ago, " +
            "and forty of you are still sharing a locker with somebody else. " +
            "Next Wednesday we will open every locker that has no current name on it. " +
            "Anything inside will be kept in the office for four weeks and then given away. " +
            "If your name is missing from the door, write it on the list at the office by Tuesday. " +
            "The lockers freed up will be given to students who are sharing. Thank you.",
        ],
      ],
      choices: [
        "사물함 정리 계획을 안내하려고",
        "사물함 열쇠 분실을 알리려고",
        "복도 공사를 알리려고",
        "분실물을 찾아가라고 하려고",
        "교실 이동을 안내하려고",
      ],
      answer: 1,
      clue: "Next Wednesday we will open every locker that has no current name on it.",
      explanation:
        "남자는 이름이 없는 사물함을 열어 정리하고 함께 쓰는 학생에게 준다고 안내한다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 행정실 하 선생님입니다. 2층 복도 사물함에 대해 말씀드립니다. 지난 2년 동안 이미 학교를 떠난 학생들의 사물함이 여럿 그대로 쓰이고 있었고, 지금도 마흔 명이 사물함을 다른 사람과 함께 쓰고 있습니다. 다음 주 수요일에 현재 이름이 붙어 있지 않은 사물함을 모두 열겠습니다. 안에 든 물건은 4주 동안 행정실에 보관한 뒤 나눔으로 보냅니다. 문에 이름이 없다면 화요일까지 행정실 명단에 적어 주세요. 비워진 사물함은 지금 함께 쓰고 있는 학생들에게 드립니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Suyeon, I've written a reading plan for the whole year."],
        ["W", "Fifty-two books, one a week?"],
        ["M", "Exactly. I chose every title in September."],
        ["W", "So a book you pick up in June was chosen by a different person."],
        ["M", "It's the same me, surely."],
        ["W", "Not really. You'll know things in June that you don't know now."],
        ["M", "But a list keeps me from drifting."],
        ["W", "Keep the number and let go of the titles."],
        ["M", "So fifty-two books, but chosen along the way?"],
        ["W", "Each one chosen because of the last one you finished."],
        ["M", "That would make the year less tidy."],
        ["W", "And far more likely to be finished at all."],
      ],
      choices: [
        "한 해 읽을 책을 미리 다 정해야 한다",
        "책은 읽어 나가면서 골라야 한다",
        "책을 읽고 기록을 남겨야 한다",
        "어려운 책부터 읽어야 한다",
        "책은 여러 권을 함께 읽어야 한다",
      ],
      answer: 2,
      clue: "Each one chosen because of the last one you finished.",
      explanation:
        "여자는 목록을 미리 다 정하지 말고 읽어 나가면서 다음 책을 고르라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 수연아, 한 해 독서 계획을 다 세웠어.",
        "W: 쉰두 권, 일주일에 한 권?",
        "M: 그래. 9월에 제목을 다 골라 놨어.",
        "W: 그럼 6월에 집어 드는 책은 다른 사람이 고른 거네.",
        "M: 같은 나잖아.",
        "W: 꼭 그렇진 않아. 6월의 너는 지금 모르는 걸 알고 있을 거야.",
        "M: 그래도 목록이 있어야 안 흔들려.",
        "W: 권수는 남기고 제목은 놓아 줘.",
        "M: 그럼 쉰두 권을 읽되 가면서 고르라는 거야?",
        "W: 방금 끝낸 책 때문에 다음 책을 고르는 거지.",
        "M: 한 해가 덜 정돈돼 보이겠네.",
        "W: 대신 끝까지 갈 가능성은 훨씬 커져.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When we look back at a decision that went badly, " +
            "we judge it by what happened afterwards. " +
            "That is the one thing the decision could not have known. " +
            "A careful choice can end badly and a careless one can end well, " +
            "and if you grade yourself on results alone " +
            "you will learn the wrong lesson from both. " +
            "Ask instead what you knew at the time and what you could have found out. " +
            "That question improves the next decision. " +
            "The result only tells you how the world happened to turn.",
        ],
      ],
      choices: [
        "결과를 보고 판단해야 한다",
        "결정은 그때의 정보로 평가해야 한다",
        "실패는 빨리 잊어야 한다",
        "결정은 여러 사람과 해야 한다",
        "결정을 기록해 두어야 한다",
      ],
      answer: 2,
      clue: "Ask instead what you knew at the time and what you could have found out.",
      explanation:
        "남자는 결과가 아니라 그때 알던 것과 알아낼 수 있던 것으로 결정을 평가하라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 잘못된 결정을 돌아볼 때 우리는 그 뒤에 일어난 일로 그것을 판단합니다. 그런데 그것이야말로 결정하던 순간에는 알 수 없었던 하나입니다. 신중한 선택이 나쁘게 끝날 수 있고 무심한 선택이 좋게 끝날 수도 있습니다. 결과만으로 자신을 채점하면 둘 다에서 잘못된 교훈을 배우게 됩니다. 대신 그때 무엇을 알고 있었는지, 무엇을 더 알아낼 수 있었는지 물으세요. 그 질문이 다음 결정을 낫게 합니다. 결과는 세상이 어느 쪽으로 돌았는지를 알려 줄 뿐입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junho, is this the club room you moved into?"],
        ["M", "Yes, we finished carrying things in on Friday."],
        ["W", "A round table stands in the middle of the room."],
        ["M", "Six of us can sit round it comfortably."],
        ["W", "There's a striped rug under the table."],
        ["M", "It came from the drama club when they left."],
        ["W", "A tall bookcase stands against the right wall."],
        ["M", "All the club records are on the middle shelf."],
        ["W", "Two framed pictures hang on the left wall."],
        ["M", "Three, actually. The smallest one is behind the door."],
        ["W", "And a square wall clock hangs above the window."],
        ["M", "It keeps very good time, for something so old."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Three, actually. The smallest one is behind the door.",
      explanation:
        "여자가 액자가 두 개라고 하자 남자가 세 개라고 바로잡는다. 그림에는 두 개가 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.5],
          [0.5, 0.84],
          [0.88, 0.42],
          [0.12, 0.2],
          [0.62, 0.08],
        ],
        scene:
          "A school club room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A ROUND TABLE stands in the MIDDLE of the room with chairs around it. " +
          "A STRIPED RUG lies on the floor underneath the round table. " +
          "A TALL BOOKCASE filled with folders stands against the RIGHT wall. " +
          "EXACTLY TWO FRAMED PICTURES hang side by side on the LEFT wall, " +
          "clearly separated with a gap between them so both can be counted. " +
          "A SQUARE WALL CLOCK hangs on the BACK wall above a window.",
      },
      translation: [
        "W: 준호야, 여기가 너희가 옮겨 온 동아리방이야?",
        "M: 응, 금요일에 짐을 다 들여놨어.",
        "W: 방 한가운데에 둥근 탁자가 있네.",
        "M: 여섯 명이 편하게 둘러앉을 수 있어.",
        "W: 탁자 아래에는 줄무늬 깔개가 있고.",
        "M: 연극 동아리가 나가면서 준 거야.",
        "W: 오른쪽 벽에는 키 큰 책장이 있네.",
        "M: 동아리 기록은 다 가운데 칸에 있어.",
        "W: 왼쪽 벽에는 액자가 두 개 걸려 있어.",
        "M: 사실 세 개야. 제일 작은 건 문 뒤에 있어.",
        "W: 그리고 창문 위에 네모난 벽시계가 걸려 있네.",
        "M: 오래된 것치고는 시간이 아주 정확해.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaewon, the charity run is on Saturday morning."],
        ["W", "Have all the runners paid the entry fee?"],
        ["M", "Eighty-two of the ninety. The rest pay on the day."],
        ["W", "What about the route and the marshals?"],
        ["M", "The route is marked and twelve marshals have volunteered."],
        ["W", "Then the big pieces are in place."],
        ["M", "Except the water. Nobody has ordered any."],
        ["W", "How much do ninety runners need?"],
        ["M", "Two tables' worth, at the halfway point and the finish."],
        ["W", "The shop needs a day's notice for that quantity."],
        ["M", "And today is Thursday already."],
        ["W", "I'll order the water this afternoon."],
      ],
      choices: [
        "참가비를 걷기",
        "경로를 표시하기",
        "물을 주문하기",
        "자원봉사자를 모으기",
        "안내문을 붙이기",
      ],
      answer: 3,
      clue: "I'll order the water this afternoon.",
      explanation:
        "여자는 오늘 오후에 물을 주문하겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 채원아, 자선 달리기가 토요일 아침이야.",
        "W: 참가자들 참가비는 다 냈어?",
        "M: 아흔 명 중 여든두 명. 나머지는 당일에 내.",
        "W: 경로랑 진행 요원은?",
        "M: 경로는 표시했고 열두 명이 진행을 맡겠다고 했어.",
        "W: 그럼 큰 건 다 됐네.",
        "M: 물만 빼고. 아무도 주문을 안 했어.",
        "W: 아흔 명이면 얼마나 필요해?",
        "M: 탁자 두 개 분량. 중간 지점이랑 결승선에.",
        "W: 그 양이면 가게에 하루 전에 말해야 해.",
        "M: 그런데 벌써 목요일이야.",
        "W: 오늘 오후에 물 주문할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good morning. Are you here about the study room?"],
        ["M", "Yes, for a group meeting on Sunday afternoon."],
        ["W", "The six person room is fifteen dollars for two hours."],
        ["M", "We'll be ten, so we need the large one."],
        ["W", "The twelve person room is twenty-four dollars for two hours."],
        ["M", "We need three hours, not two."],
        ["W", "Each extra hour is nine dollars."],
        ["M", "Three hours in the large room, then."],
        ["W", "Would you like the projector for an extra five?"],
        ["M", "Yes, please. We have slides to show."],
        ["W", "And students get ten percent off the room charge."],
        ["M", "Here are our student cards, then."],
      ],
      choices: ["$34.70", "$38", "$35.70", "$29.70", "$40"],
      answer: 1,
      clue: "The twelve person room is twenty-four dollars for two hours.",
      explanation:
        "12인실 세 시간은 33달러이고 10퍼센트를 빼면 29달러 70센트이며, 영사기 5달러를 더하면 34달러 70센트이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 스터디룸 때문에 오셨나요?",
        "M: 네, 일요일 오후에 모임이 있어서요.",
        "W: 6인실은 두 시간에 15달러입니다.",
        "M: 저희는 열 명이라 큰 방이 필요해요.",
        "W: 12인실은 두 시간에 24달러입니다.",
        "M: 두 시간 말고 세 시간이 필요해요.",
        "W: 한 시간 더 쓸 때마다 9달러입니다.",
        "M: 그럼 큰 방으로 세 시간이요.",
        "W: 영사기는 5달러 더 내시면 쓰실 수 있습니다.",
        "M: 네, 보여 줄 자료가 있어요.",
        "W: 그리고 학생은 방값에서 10퍼센트를 빼 드립니다.",
        "M: 그럼 여기 학생증이요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 동아리 모임 장소를 바꾼 이유를 고르시오.",
      lines: [
        ["M", "Hayoon, why did the meeting move to the library?"],
        ["W", "I changed it on Monday and told everyone."],
        ["M", "Is the club room being repainted again?"],
        ["W", "The painting finished in September."],
        ["M", "Then did somebody else book it before us?"],
        ["W", "No, the heating in that room broke last week."],
        ["M", "I did notice it was cold on Friday."],
        ["W", "Nine degrees, and nobody could hold a pen."],
        ["M", "When are they fixing it?"],
        ["W", "Some time in November, they said, which means December."],
      ],
      choices: [
        "동아리방을 칠하고 있어서",
        "다른 사람이 먼저 예약해서",
        "난방이 고장 나서",
        "인원이 늘어나서",
        "도서관이 더 가까워서",
      ],
      answer: 3,
      clue: "No, the heating in that room broke last week.",
      explanation:
        "여자는 동아리방 난방이 고장 나서 장소를 옮겼다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 하윤아, 모임이 왜 도서관으로 옮겨졌어?",
        "W: 월요일에 내가 바꾸고 다들한테 알렸어.",
        "M: 동아리방을 또 칠해?",
        "W: 칠은 9월에 끝났어.",
        "M: 그럼 누가 먼저 예약했어?",
        "W: 아니, 지난주에 그 방 난방이 고장 났어.",
        "M: 금요일에 춥긴 했어.",
        "W: 9도였어. 아무도 펜을 못 잡았어.",
        "M: 언제 고친대?",
        "W: 11월 언젠가라고 했는데 그 말은 12월이라는 뜻이지.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 봉사 동아리 모집에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Seoyun, is the volunteer club taking new members?"],
        ["W", "They are, and I saw the notice this morning."],
        ["M", "When does the application close?"],
        ["W", "On the fourteenth, at five in the afternoon."],
        ["M", "That's a week away. How many do they take?"],
        ["W", "Twelve, and thirty applied last year."],
        ["M", "Do we have to write anything?"],
        ["W", "A short paragraph about why you want to join."],
        ["M", "Is there an interview after that?"],
        ["W", "A ten minute one, in the week after the deadline."],
        ["M", "Where do I hand the paragraph in?"],
        ["W", "In the box outside the career room, before five."],
      ],
      choices: ["신청 마감일", "뽑는 인원", "제출해야 하는 글", "면접 여부", "동아리 모임 요일"],
      answer: 5,
      clue: "On the fourteenth, at five in the afternoon.",
      explanation:
        "마감일, 인원, 제출물, 면접은 말했지만 모임 요일은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 서윤아, 봉사 동아리에서 새로 사람 뽑아?",
        "W: 뽑아. 오늘 아침에 공고 봤어.",
        "M: 신청은 언제 마감이야?",
        "W: 14일 오후 다섯 시에.",
        "M: 일주일 남았네. 몇 명 뽑아?",
        "W: 열두 명. 작년에는 서른 명이 지원했어.",
        "M: 뭘 써서 내야 해?",
        "W: 왜 들어오고 싶은지 짧은 문단 하나.",
        "M: 그다음에 면접이 있어?",
        "W: 10분짜리. 마감 다음 주에 봐.",
        "M: 그 글은 어디에 내?",
        "W: 다섯 시 전에 진로실 앞 상자에.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Silverbrook Nature Trail에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Silverbrook Nature Trail, which opened three years ago. " +
            "The trail begins at the car park behind the old mill and ends at the lake. " +
            "It is six kilometres long and takes about two hours at a steady pace. " +
            "Twelve information boards along the way describe the plants and birds. " +
            "The path is flat enough for a wheelchair for the first three kilometres. " +
            "Bicycles are not allowed at any point on the trail. " +
            "There is a small car park at the lake end, with room for twenty cars. " +
            "The trail is open all year, and dogs must be kept on a lead.",
        ],
      ],
      choices: [
        "옛 방앗간 뒤 주차장에서 시작한다",
        "길이가 6킬로미터이다",
        "안내판이 열두 개 있다",
        "자전거를 타고 지날 수 있다",
        "일 년 내내 개방한다",
      ],
      answer: 4,
      clue: "Bicycles are not allowed at any point on the trail.",
      explanation:
        "자전거는 어느 구간에서도 탈 수 없다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 3년 전에 문을 연 실버브룩 자연 산책로에 대해 알려 드립니다. 이 길은 옛 방앗간 뒤 주차장에서 시작해 호수에서 끝납니다. 길이는 6킬로미터이고 꾸준히 걸으면 두 시간쯤 걸립니다. 길을 따라 안내판 열두 개가 식물과 새를 설명합니다. 앞 3킬로미터는 휠체어가 다닐 만큼 평평합니다. 산책로 어느 구간에서도 자전거는 탈 수 없습니다. 호수 쪽 끝에는 차 스무 대를 댈 수 있는 작은 주차장이 있습니다. 산책로는 일 년 내내 열려 있고 개는 목줄을 채워야 합니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 여행 숙소를 고르시오.",
      lines: [
        ["M", "Dain, these five places still have rooms for our club trip."],
        ["W", "We've been putting this off for two weeks."],
        ["M", "Then let's decide now. How many of us are going?"],
        ["W", "Fourteen, so we need a room for at least fourteen."],
        ["M", "Two of these hold only ten."],
        ["W", "Then they're out. What about breakfast?"],
        ["M", "Only two of the three left include it."],
        ["W", "Breakfast matters, because we leave early on the Sunday."],
        ["M", "And the price? We agreed on under twenty thousand each."],
        ["W", "One of the last two works out at twenty-five thousand."],
        ["M", "So there's only one place for us."],
        ["W", "I'll book it as soon as I get home."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Fourteen, so we need a room for at least fourteen.",
      explanation:
        "14명 이상, 아침 포함, 1인당 2만 원 미만인 곳을 고른다. 세 조건을 모두 채우는 것은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Capacity: 10 / Breakfast: Yes / Per person: 18,000 won" },
          { no: 2, label: "②", value: "Capacity: 10 / Breakfast: No / Per person: 15,000 won" },
          { no: 3, label: "③", value: "Capacity: 16 / Breakfast: Yes / Per person: 19,000 won" },
          { no: 4, label: "④", value: "Capacity: 16 / Breakfast: Yes / Per person: 25,000 won" },
          { no: 5, label: "⑤", value: "Capacity: 20 / Breakfast: No / Per person: 17,000 won" },
        ],
      },
      translation: [
        "M: 다인아, 동아리 여행에 아직 방이 있는 데가 이 다섯 곳이야.",
        "W: 두 주째 미뤘잖아.",
        "M: 그럼 지금 정하자. 몇 명 가?",
        "W: 열네 명. 적어도 열네 명이 들어가는 방이 필요해.",
        "M: 두 곳은 열 명까지야.",
        "W: 그럼 빠지네. 아침은?",
        "M: 남은 셋 중 둘만 아침이 포함돼.",
        "W: 일요일에 일찍 나가니까 아침이 중요해.",
        "M: 값은? 한 사람당 2만 원 아래로 하기로 했잖아.",
        "W: 남은 둘 중 하나는 2만 5천 원이야.",
        "M: 그럼 우리한테 맞는 건 한 곳뿐이네.",
        "W: 집에 가자마자 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nayeon, did you get the key for the display case?"],
        ["W", "The teacher has it, and she left at three."],
        ["M", "We have to put the trophies in before tomorrow."],
        ["W", "There's a spare key in the office, I think."],
        ["M", "Shall I go and ask for it?"],
      ],
      choices: [
        "The case is already open.",
        "Yes, please, I'll wait here.",
        "I don't need the key.",
        "The office has no keys.",
        "You should ask the teacher.",
      ],
      answer: 2,
      clue: "Shall I go and ask for it?",
      explanation:
        "여벌 열쇠를 받으러 갈지 물었으므로, 여기서 기다리겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나연아, 진열장 열쇠 받았어?",
        "W: 선생님이 가지고 계신데 세 시에 나가셨어.",
        "M: 내일 전에 상패를 넣어야 하는데.",
        "W: 행정실에 여벌 열쇠가 있을 거야.",
        "M: 내가 가서 달라고 할까?",
        "W: 응, 부탁해. 나는 여기서 기다릴게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangmin, are you going to the stationery shop?"],
        ["M", "After school, around four thirty."],
        ["W", "Our group needs a roll of poster paper."],
        ["M", "What width do you need?"],
        ["W", "The wide one, about a metre across."],
      ],
      choices: [
        "I'm not going out today.",
        "All right, I'll pick one up.",
        "The shop sells no paper.",
        "You should buy it yourself.",
        "A metre is far too wide.",
      ],
      answer: 2,
      clue: "The wide one, about a metre across.",
      explanation:
        "필요한 종이의 폭을 말해 주었으므로, 사 오겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 상민아, 문구점 가?",
        "M: 방과 후에, 4시 30분쯤.",
        "W: 우리 조가 포스터 종이 한 롤이 필요해.",
        "M: 폭이 얼마짜리가 필요해?",
        "W: 넓은 거. 1미터쯤 되는 걸로.",
        "M: 알겠어, 하나 사 올게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, how is your English speaking club going?"],
        ["M", "Eight people come, but only three of them ever speak."],
        ["W", "How do you run the hour?"],
        ["M", "I ask a question and wait for somebody to answer."],
        ["W", "And the same three always get there first."],
        ["M", "Within two seconds, every single time."],
        ["W", "So the other five never get a gap to step into."],
        ["M", "I hadn't thought of it as a race."],
        ["W", "It is one, and the quick always win a race."],
        ["M", "Then how do I give the other five a chance?"],
        ["W", "Go round the circle in order instead of asking the room."],
      ],
      choices: [
        "Nobody comes to the club.",
        "That would change everything, I'll try it.",
        "Three speakers is enough.",
        "I don't ask any questions.",
        "You should lead the club.",
      ],
      answer: 2,
      clue: "Go round the circle in order instead of asking the room.",
      explanation:
        "전체에 묻지 말고 차례대로 돌라는 제안이므로, 해 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태민아, 영어 회화 동아리는 어때?",
        "M: 여덟 명이 오는데 말하는 사람은 셋뿐이야.",
        "W: 한 시간을 어떻게 진행해?",
        "M: 질문을 던지고 누가 답하기를 기다려.",
        "W: 그럼 늘 같은 셋이 먼저 답하겠네.",
        "M: 매번 2초 안에.",
        "W: 나머지 다섯은 들어갈 틈을 못 얻는 거지.",
        "M: 경주라고는 생각 못 했어.",
        "W: 경주 맞아. 경주는 늘 빠른 쪽이 이겨.",
        "M: 그럼 나머지 다섯한테 어떻게 기회를 줘?",
        "W: 전체에 묻지 말고 둘러앉은 순서대로 돌아.",
        "M: 그러면 다 달라지겠다, 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaeyeon, you've been writing to a pen pal abroad."],
        ["W", "Since last winter. She lives in a small town in Canada."],
        ["M", "Do you write by hand or by email?"],
        ["W", "By hand, and the letter takes twelve days each way."],
        ["M", "Isn't that frustrating in the age of messages?"],
        ["W", "It was at first, and then it became the good part."],
        ["M", "How can waiting be the good part?"],
        ["W", "You write differently when the reply is three weeks away."],
        ["M", "More carefully, I suppose."],
        ["W", "And about things that will still matter when it arrives."],
        ["M", "Could you show me one of her letters?"],
      ],
      choices: [
        "Sure, I'll bring one tomorrow.",
        "I stopped writing in March.",
        "She never writes back.",
        "I only send emails now.",
        "You can't read her writing.",
      ],
      answer: 1,
      clue: "Could you show me one of her letters?",
      explanation:
        "남자가 편지를 보여 달라고 했으므로, 내일 가져오겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 채연아, 외국에 있는 펜팔이랑 편지 주고받는다며.",
        "W: 지난겨울부터. 캐나다 작은 마을에 살아.",
        "M: 손으로 써, 전자우편으로 써?",
        "W: 손으로. 편지가 편도로 열이틀 걸려.",
        "M: 메시지 시대에 답답하지 않아?",
        "W: 처음엔 그랬는데 나중엔 그게 좋은 점이 됐어.",
        "M: 기다리는 게 어떻게 좋은 점이야?",
        "W: 답장이 삼 주 뒤에 온다고 생각하면 다르게 쓰게 돼.",
        "M: 더 조심스럽게 쓰겠지.",
        "W: 그리고 도착할 때도 여전히 중요할 이야기를 쓰게 돼.",
        "M: 그 친구 편지 하나만 보여 줄래?",
        "W: 그럼, 내일 한 통 가져올게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Minjae가 Hayoon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Minjae : ________________",
      lines: [
        [
          "M",
          "Minjae and Hayoon are organising the school's used uniform sale. " +
            "Families bring in uniforms their children have grown out of. " +
            "Hayoon has arranged everything on the tables by colour, " +
            "because she thinks it looks tidy and welcoming that way. " +
            "The sale opened half an hour ago and the hall is already busy. " +
            "Minjae watches three parents leave without buying anything, " +
            "after holding up jackets one by one to guess the size. " +
            "None of the jackets has its size showing from the front. " +
            "He thinks the clothes should be sorted by size instead of colour. " +
            "In this situation, what would Minjae most likely say to Hayoon?",
        ],
      ],
      choices: [
        "Let's close the sale an hour early.",
        "We should lower all the prices.",
        "Sort them by size, not by colour.",
        "I'll fold the jackets again.",
        "Nobody wants a used uniform.",
      ],
      answer: 3,
      clue: "He thinks the clothes should be sorted by size instead of colour.",
      explanation:
        "치수를 짐작하다 그냥 가는 사람이 많으므로 색이 아니라 치수별로 놓자는 ③이 가장 적절하다.",
      translation: [
        "M: 민재와 하윤이는 학교 교복 나눔 판매를 준비하고 있습니다. 아이들이 자라서 못 입게 된 교복을 가정에서 가져옵니다. 하윤이는 그렇게 해야 깔끔하고 보기 좋다고 생각해 탁자 위에 색깔별로 늘어놓았습니다. 판매를 시작한 지 30분이 지났고 강당은 벌써 붐빕니다. 민재는 학부모 세 분이 웃옷을 하나씩 들어 치수를 짐작해 보다가 그냥 가는 것을 봅니다. 앞에서 보아 치수가 드러나는 옷은 하나도 없습니다. 민재는 색이 아니라 치수별로 정리해야 한다고 생각합니다. 이런 상황에서 민재가 하윤이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to explain why a paper cut hurts so much " +
            "when a far deeper cut sometimes does not. " +
            "The first reason is where it happens. " +
            "Fingertips carry more pain receptors per square centimetre " +
            "than almost any other part of the body, " +
            "because they are the tools we use to explore the world. " +
            "The second reason is the shape of the wound. " +
            "Paper is not a blade. Its torn edge drags through the skin, " +
            "leaving a ragged tear rather than a clean line. " +
            "The cut is also shallow, so it does not bleed enough to close itself, " +
            "and the exposed nerve endings are reopened every time the finger bends.",
        ],
      ],
      choices: [
        "how paper is made from wood",
        "why a paper cut hurts more than it should",
        "how wounds heal over time",
        "why fingers are sensitive to cold",
        "how the brain locates a source of pain",
      ],
      answer: 2,
      clue: "Fingertips carry more pain receptors per square centimetre than almost any other part of the body.",
      explanation:
        "여자는 손끝의 감각 수용체와 상처의 모양 때문에 종이에 벤 상처가 유난히 아프다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 훨씬 깊은 상처는 덜 아플 때도 있는데 종이에 벤 상처는 왜 그렇게 아픈지 설명하려 합니다. 첫째 이유는 그 일이 어디에서 일어나는가입니다. 손끝은 몸의 거의 어느 곳보다 1제곱센티미터당 통증 수용체가 많습니다. 우리가 세상을 더듬는 도구이기 때문입니다. 둘째 이유는 상처의 모양입니다. 종이는 칼날이 아닙니다. 찢어진 가장자리가 살갗을 끌고 지나가 깔끔한 선이 아니라 너덜너덜한 자국을 남깁니다. 게다가 얕아서 스스로 아물 만큼 피가 나지도 않고, 손가락을 굽힐 때마다 드러난 신경 끝이 다시 벌어집니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to explain why a paper cut hurts so much."],
        ["W", "Fingertips carry more pain receptors than almost any other part of the body."],
        ["W", "Paper is not a blade. Its torn edge drags through the skin."],
        ["W", "The cut is shallow, so it does not bleed enough to close itself."],
        ["W", "The exposed nerve endings are reopened every time the finger bends."],
      ],
      choices: [
        "fingertips carrying many pain receptors",
        "a torn paper edge dragging through the skin",
        "a shallow cut not bleeding enough to close",
        "nerve endings reopened when the finger bends",
        "the thickness of different kinds of paper",
      ],
      answer: 5,
      clue: "Fingertips carry more pain receptors than almost any other part of the body.",
      explanation:
        "손끝의 통증 수용체, 살갗을 끄는 종이의 찢긴 가장자리, 아물 만큼 피가 나지 않는 얕은 상처, 손가락을 굽힐 때 벌어지는 신경 끝은 언급되지만 종이 종류별 두께는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
