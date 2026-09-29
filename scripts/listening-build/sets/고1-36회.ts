/** 고1 듣기 36회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 36회",
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
          "Good morning, everyone. This is Mr. Baek from the student council office. " +
            "I am speaking about the lost property box beside the main stairs. " +
            "At the moment the box holds more than two hundred items, " +
            "and about half of them have been there since the spring term. " +
            "Next Friday afternoon everything will be laid out on tables in the front hall, " +
            "so that you can walk past and look instead of digging through a box. " +
            "Come and take your own things between one and five. " +
            "Anything still on the tables at five will be given to a charity shop. " +
            "Please do not take an item that is not yours, even by mistake. Thank you.",
        ],
      ],
      choices: [
        "분실물을 찾아가라고 하려고",
        "기부 행사를 안내하려고",
        "계단 공사를 알리려고",
        "학생회 선거를 알리려고",
        "사물함 정리를 부탁하려고",
      ],
      answer: 1,
      clue: "Come and take your own things between one and five.",
      explanation:
        "남자는 분실물을 앞 현관 탁자에 늘어놓을 테니 와서 찾아가라고 안내한다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 학생회실의 백 선생님입니다. 중앙 계단 옆 분실물함에 대해 말씀드립니다. 지금 그 함에는 이백 점이 넘는 물건이 있고, 그중 절반쯤은 봄 학기부터 그대로 있습니다. 다음 주 금요일 오후에 모든 물건을 앞 현관 탁자에 늘어놓겠습니다. 함을 뒤지지 않고 지나가며 볼 수 있게 하기 위해서입니다. 한 시부터 다섯 시 사이에 와서 자기 물건을 가져가세요. 다섯 시에 탁자에 남은 것은 나눔 가게로 보냅니다. 실수로라도 자기 것이 아닌 물건은 가져가지 말아 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junho, I've written the whole report but I haven't read it back."],
        ["M", "Are you planning to hand it in like that?"],
        ["W", "I read every sentence while I was writing it."],
        ["M", "That's the one time you can't judge it."],
        ["W", "Why not? I was paying close attention."],
        ["M", "Because your head fills in whatever the page is missing."],
        ["W", "So I should read it again tomorrow?"],
        ["M", "Tomorrow, and out loud if you can."],
        ["W", "Out loud seems like a strange extra step."],
        ["M", "Your ear catches the sentences your eye already forgave."],
        ["W", "That would add another half hour to the work."],
        ["M", "Half an hour now or a lower mark later. Pick one."],
      ],
      choices: [
        "보고서는 길게 써야 한다",
        "보고서는 다음 날 소리 내어 다시 읽어야 한다",
        "보고서는 친구와 함께 써야 한다",
        "보고서는 미리 계획을 세워야 한다",
        "보고서에는 그림을 넣어야 한다",
      ],
      answer: 2,
      clue: "Tomorrow, and out loud if you can.",
      explanation:
        "남자는 쓰는 동안에는 글을 제대로 볼 수 없다며 다음 날 소리 내어 다시 읽으라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 준호야, 보고서를 다 썼는데 다시 읽어 보진 않았어.",
        "M: 그대로 낼 생각이야?",
        "W: 쓰면서 문장마다 읽었잖아.",
        "M: 그때가 바로 판단할 수 없는 때야.",
        "W: 왜? 집중해서 봤는데.",
        "M: 종이에 빠진 걸 네 머리가 알아서 채워 넣거든.",
        "W: 그럼 내일 다시 읽으라는 거야?",
        "M: 내일, 그리고 가능하면 소리 내서.",
        "W: 소리 내어 읽는 건 괜히 한 단계 더 같은데.",
        "M: 눈이 이미 봐준 문장을 귀가 잡아내.",
        "W: 그러면 30분이 더 드는데.",
        "M: 지금의 30분이냐, 나중의 낮은 점수냐. 골라.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Almost every student says they will start once they feel ready. " +
            "Ready is not a feeling that arrives on its own. " +
            "It is what you feel after ten minutes of work, never before. " +
            "If you wait for it at your desk, you will wait all evening, " +
            "and the waiting is far more tiring than the work would have been. " +
            "So make the first step small enough that it needs no feeling at all. " +
            "Open the book. Write the date. Copy the first question. " +
            "The mind follows the hand much more easily than the hand follows the mind.",
        ],
      ],
      choices: [
        "계획을 자세히 세워야 한다",
        "목표를 크게 잡아야 한다",
        "준비된 기분을 기다리지 말고 작게 시작해야 한다",
        "공부는 아침에 해야 한다",
        "쉬는 시간을 충분히 가져야 한다",
      ],
      answer: 3,
      clue: "So make the first step small enough that it needs no feeling at all.",
      explanation:
        "여자는 준비된 기분은 일을 시작한 뒤에야 온다며 아주 작은 첫걸음부터 떼라고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 거의 모든 학생이 준비되면 시작하겠다고 말합니다. 준비된 느낌은 저절로 찾아오지 않습니다. 그것은 10분쯤 일한 뒤에 드는 느낌이지 그 전에 드는 느낌이 아닙니다. 책상에 앉아 그것을 기다리면 저녁 내내 기다리게 되고, 그 기다림이 일보다 훨씬 더 지치게 합니다. 그러니 첫걸음을 아무 느낌도 필요 없을 만큼 작게 만드세요. 책을 펴세요. 날짜를 적으세요. 첫 문제를 옮겨 적으세요. 마음이 손을 따라가는 것이, 손이 마음을 따라가는 것보다 훨씬 쉽습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Sujin, is this the school shop after the repairs?"],
        ["W", "Yes, it reopened on the first day of this term."],
        ["M", "There's a long counter across the middle of the room."],
        ["W", "We serve from behind it during every break."],
        ["M", "A round wall clock hangs above the counter."],
        ["W", "It was the only thing we kept from before."],
        ["M", "The shelf on the left holds rows of drink bottles."],
        ["W", "Those sell out first on a hot afternoon."],
        ["M", "There's a striped umbrella stand by the door on the right."],
        ["W", "It's a plain one now. The striped stand went to the office."],
        ["M", "And two stools stand in front of the counter."],
        ["W", "People sit there while they wait for change."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "It's a plain one now. The striped stand went to the office.",
      explanation:
        "남자가 줄무늬 우산꽂이가 있다고 하자 여자가 지금은 무늬 없는 것이라고 바로잡는다. 그림에는 줄무늬가 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.52],
          [0.5, 0.1],
          [0.1, 0.36],
          [0.88, 0.5],
          [0.38, 0.8],
        ],
        scene:
          "A small school shop drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A LONG COUNTER runs across the MIDDLE of the room from left to right. " +
          "A ROUND WALL CLOCK hangs on the back wall directly above the counter. " +
          "A SHELF on the LEFT wall holds two rows of DRINK BOTTLES. " +
          "A TALL UMBRELLA STAND covered in bold VERTICAL STRIPES stands beside the door on the far RIGHT. " +
          "EXACTLY TWO ROUND STOOLS stand on the floor in front of the counter, apart from each other.",
      },
      translation: [
        "M: 수진아, 여기가 고치고 난 학교 매점이야?",
        "W: 응, 이번 학기 첫날에 다시 열었어.",
        "M: 가운데를 가로질러 긴 계산대가 있네.",
        "W: 쉬는 시간마다 그 뒤에서 팔아.",
        "M: 계산대 위에는 둥근 벽시계가 걸려 있고.",
        "W: 예전에서 남긴 건 그것 하나뿐이야.",
        "M: 왼쪽 선반에는 음료수 병이 줄지어 있어.",
        "W: 더운 오후엔 그게 제일 먼저 나가.",
        "M: 오른쪽 문 옆에는 줄무늬 우산꽂이가 있네.",
        "W: 지금은 무늬 없는 거야. 줄무늬는 교무실로 갔어.",
        "M: 그리고 계산대 앞에 둥근 의자 두 개가 있어.",
        "W: 거스름돈 기다리면서 거기 앉아.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Dain, the class sports day is the day after tomorrow."],
        ["W", "Has everyone chosen an event yet?"],
        ["M", "All but two people, and they'll decide tonight."],
        ["W", "What about the shirts we ordered?"],
        ["M", "They arrived this morning, thirty of them."],
        ["W", "Then the last thing is the running order."],
        ["M", "The teacher wants it posted on the class board."],
        ["W", "Does she need the times as well?"],
        ["M", "Just the order of events and who runs in each."],
        ["W", "That's about twenty lines, then."],
        ["M", "She's collecting the boards at four o'clock."],
        ["W", "I'll write the running order and put it up now."],
      ],
      choices: [
        "티셔츠를 나눠 주기",
        "종목을 정하기",
        "경기 순서를 적어 붙이기",
        "선생님께 전화하기",
        "운동장을 정리하기",
      ],
      answer: 3,
      clue: "I'll write the running order and put it up now.",
      explanation:
        "여자는 지금 경기 순서를 적어 게시판에 붙이겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 다인아, 학급 체육 대회가 모레야.",
        "W: 다들 종목은 정했어?",
        "M: 두 명 빼고 다. 그 둘은 오늘 밤에 정한대.",
        "W: 주문한 티셔츠는?",
        "M: 오늘 아침에 서른 장 왔어.",
        "W: 그럼 남은 건 경기 순서네.",
        "M: 선생님이 학급 게시판에 붙이라고 하셨어.",
        "W: 시간도 필요하셔?",
        "M: 종목 순서랑 누가 뛰는지만.",
        "W: 그럼 스무 줄쯤 되겠다.",
        "M: 네 시에 게시판을 걷으신대.",
        "W: 지금 경기 순서 적어서 붙일게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good afternoon. Are you renting bicycles today?"],
        ["M", "Yes, three bicycles for the afternoon."],
        ["W", "A city bicycle is nine dollars for three hours."],
        ["M", "Do you have mountain bikes as well?"],
        ["W", "We do, and those are twelve dollars for the same time."],
        ["M", "Two city bicycles and one mountain bike, then."],
        ["W", "Helmets come free with every bicycle."],
        ["M", "Is there a charge for the lock?"],
        ["W", "A lock is two dollars, and one lock covers all three."],
        ["M", "We'll take one lock, please."],
        ["W", "And students get four dollars off the total."],
        ["M", "Here are our student cards, then."],
      ],
      choices: ["$28", "$30", "$32", "$26", "$34"],
      answer: 1,
      clue: "A city bicycle is nine dollars for three hours.",
      explanation:
        "시내용 두 대 18달러와 산악용 한 대 12달러에 자물쇠 2달러를 더하면 32달러이고, 학생 할인 4달러를 빼면 28달러이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 오늘 자전거 빌리시나요?",
        "M: 네, 오후에 쓸 자전거 세 대요.",
        "W: 시내용 자전거는 세 시간에 9달러입니다.",
        "M: 산악용도 있나요?",
        "W: 있습니다. 같은 시간에 12달러입니다.",
        "M: 그럼 시내용 두 대랑 산악용 한 대요.",
        "W: 헬멧은 자전거마다 무료로 드립니다.",
        "M: 자물쇠는 돈을 내야 하나요?",
        "W: 자물쇠는 2달러이고 하나면 세 대를 다 묶을 수 있습니다.",
        "M: 그럼 자물쇠 하나만요.",
        "W: 그리고 학생은 전체에서 4달러를 빼 드립니다.",
        "M: 그럼 여기 학생증이요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 발표 순서를 바꾸려는 이유를 고르시오.",
      lines: [
        ["W", "Minjae, you asked to present last instead of first."],
        ["M", "I did, and the teacher said it was fine."],
        ["W", "Is it because you haven't finished the slides?"],
        ["M", "They were done on Sunday, actually."],
        ["W", "Then are you too nervous to go first?"],
        ["M", "My throat is still bad, and it's better in the afternoon."],
        ["W", "You have been coughing all week."],
        ["M", "The doctor said it would clear by the weekend."],
      ],
      choices: [
        "자료를 아직 못 만들어서",
        "긴장을 덜 하려고",
        "목 상태가 좋지 않아서",
        "다른 수업이 있어서",
        "친구와 순서를 바꾸려고",
      ],
      answer: 3,
      clue: "My throat is still bad, and it's better in the afternoon.",
      explanation:
        "남자는 목 상태가 좋지 않고 오후에 낫기 때문에 순서를 뒤로 바꾸었다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 민재야, 첫 번째 말고 마지막에 발표하겠다고 했다며.",
        "M: 응, 선생님도 괜찮다고 하셨어.",
        "W: 자료를 아직 못 끝내서 그래?",
        "M: 사실 일요일에 다 끝냈어.",
        "W: 그럼 첫 번째가 너무 긴장돼서?",
        "M: 목이 아직 안 좋은데 오후에는 좀 나아.",
        "W: 일주일 내내 기침했잖아.",
        "M: 의사 선생님이 주말쯤엔 나을 거라고 하셨어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 독서 토론 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Yerin, are you entering the reading debate contest this term?"],
        ["W", "I want to, but I still don't know the details."],
        ["M", "It takes place on the last Friday of this month, after school."],
        ["W", "That's sooner than I expected. Do we debate alone or in teams?"],
        ["M", "Teams of two, and you may choose your own partner."],
        ["W", "Then I'll ask Sohee, since we read the same things."],
        ["M", "Good choice. She entered last year as well."],
        ["W", "Is the book for this year decided already?"],
        ["M", "The library chose one novel, and copies are on the front desk."],
        ["W", "I'll borrow one today. How long does each debate run?"],
        ["M", "Twenty minutes in all, with three minutes for each opening speech."],
        ["W", "And where is the contest held this year?"],
        ["M", "In the library itself, around the big table by the window."],
      ],
      choices: ["대회 날짜", "팀 구성 방법", "읽어야 할 책", "토론 시간", "심사 기준"],
      answer: 5,
      clue: "On the last Friday of this month, after school.",
      explanation:
        "날짜, 팀 구성, 책, 토론 시간은 말했지만 심사 기준은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 예린아, 이번 학기 독서 토론 대회 나갈 거야?",
        "W: 나가고 싶은데 아직 자세한 걸 몰라.",
        "M: 이번 달 마지막 금요일 방과 후에 해.",
        "W: 생각보다 빠르네. 혼자 해? 팀으로 해?",
        "M: 두 명이 한 팀이고 짝은 직접 고를 수 있어.",
        "W: 그럼 소희한테 물어볼래. 읽는 게 비슷하거든.",
        "M: 좋은 선택이야. 작년에도 나갔어.",
        "W: 올해 책은 벌써 정해졌어?",
        "M: 도서관에서 소설 한 권을 골랐고 접수대에 여러 권 있어.",
        "W: 오늘 한 권 빌려야겠다. 토론은 얼마나 해?",
        "M: 다 합쳐 20분. 첫 발언은 각각 3분씩이야.",
        "W: 올해는 어디서 해?",
        "M: 도서관 안 창가 큰 탁자에 둘러앉아서.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Old Mill Museum에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Old Mill Museum, which reopened last month. " +
            "The museum stands beside the stream at the eastern edge of the town. " +
            "It opens from ten until six every day except Monday. " +
            "The building itself was a working flour mill until nineteen sixty-two. " +
            "The great water wheel still turns, and it is started on the hour. " +
            "Admission is free for students, and three thousand won for adults. " +
            "A guided tour in English leaves the entrance at eleven and at three. " +
            "Photographs are welcome anywhere in the building, but the upper floor is closed to bags.",
        ],
      ],
      choices: [
        "마을 동쪽 개울 옆에 있다",
        "월요일에는 문을 열지 않는다",
        "물레방아는 정시마다 돌린다",
        "학생은 입장료가 없다",
        "건물 안에서는 사진을 찍을 수 없다",
      ],
      answer: 5,
      clue: "Photographs are welcome anywhere in the building.",
      explanation:
        "건물 어디에서나 사진을 찍어도 된다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "W: 지난달에 다시 문을 연 올드 밀 박물관에 대해 알려 드립니다. 박물관은 마을 동쪽 끝 개울 옆에 있습니다. 월요일을 빼고 매일 열 시부터 여섯 시까지 엽니다. 건물 자체가 1962년까지 실제로 돌아가던 밀가루 방앗간이었습니다. 큰 물레방아는 아직도 돌아가며 정시마다 돌립니다. 입장료는 학생은 무료, 어른은 3천 원입니다. 영어 해설은 열한 시와 세 시에 입구에서 출발합니다. 건물 어디에서나 사진을 찍어도 되지만 위층에는 가방을 들고 올라갈 수 없습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 야영장을 고르시오.",
      lines: [
        ["M", "Hyerin, these are the five campsites still open in October."],
        ["W", "How far is each one from the station?"],
        ["M", "Some are close, some are more than an hour away."],
        ["W", "Anything over an hour is too far for us."],
        ["M", "That removes two of them right away."],
        ["W", "And we need a site that lends tents."],
        ["M", "One of the remaining three doesn't lend anything."],
        ["W", "Then the price. Under fifty thousand won a night."],
        ["M", "One of the last two is sixty-five thousand."],
        ["W", "So only one campsite is left for us."],
        ["M", "I'll book it before the weekend."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Anything over an hour is too far for us.",
      explanation:
        "역에서 한 시간 이내, 천막을 빌려주는 곳, 5만 원 미만인 곳을 고른다. 세 조건을 모두 채우는 것은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "From station: 90 min / Tent rental: Yes / Price: 40,000 won" },
          { no: 2, label: "②", value: "From station: 40 min / Tent rental: No / Price: 35,000 won" },
          { no: 3, label: "③", value: "From station: 50 min / Tent rental: Yes / Price: 48,000 won" },
          { no: 4, label: "④", value: "From station: 30 min / Tent rental: Yes / Price: 65,000 won" },
          { no: 5, label: "⑤", value: "From station: 80 min / Tent rental: No / Price: 30,000 won" },
        ],
      },
      translation: [
        "M: 혜린아, 10월에 아직 자리가 있는 야영장이 이 다섯 곳이야.",
        "W: 역에서 각각 얼마나 멀어?",
        "M: 가까운 데도 있고 한 시간 넘는 데도 있어.",
        "W: 한 시간 넘는 건 우리한테 너무 멀어.",
        "M: 그럼 두 곳은 바로 빠지네.",
        "W: 그리고 천막을 빌려주는 데여야 해.",
        "M: 남은 셋 중 하나는 아무것도 안 빌려줘.",
        "W: 그다음은 값. 하룻밤 5만 원 아래로.",
        "M: 남은 둘 중 하나는 6만 5천 원이야.",
        "W: 그럼 우리한테 남는 건 한 곳뿐이네.",
        "M: 주말 전에 예약할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Dohyun, is the projector working in room three?"],
        ["M", "It was fine during the second period."],
        ["W", "Our club needs it at five this evening."],
        ["M", "Someone may have taken the cable, though."],
        ["W", "Could you check before you go home?"],
      ],
      choices: [
        "The projector is broken forever.",
        "Sure, I'll look at four thirty.",
        "I don't know where room three is.",
        "We don't need a projector.",
        "The club meeting was cancelled.",
      ],
      answer: 2,
      clue: "Could you check before you go home?",
      explanation:
        "집에 가기 전에 확인해 달라고 했으므로, 4시 30분에 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 도현아, 3번 교실 영사기 잘 돼?",
        "M: 2교시에는 괜찮았어.",
        "W: 우리 동아리가 오늘 저녁 다섯 시에 써야 해.",
        "M: 근데 누가 선을 가져갔을 수도 있어.",
        "W: 집에 가기 전에 확인해 줄래?",
        "M: 그래, 4시 30분에 볼게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaewon, did you sign up for the volunteer day?"],
        ["W", "Not yet. Is the list still open?"],
        ["M", "It closes at four today, I think."],
        ["W", "Where do I put my name down?"],
        ["M", "On the sheet outside the career room."],
      ],
      choices: [
        "I already volunteered last year.",
        "The career room is locked.",
        "Thanks, I'll go there now.",
        "You should sign up instead.",
        "There is no volunteer day.",
      ],
      answer: 3,
      clue: "On the sheet outside the career room.",
      explanation:
        "이름 적는 곳을 알려 주었으므로, 지금 가겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 채원아, 봉사의 날 신청했어?",
        "W: 아직. 명단 아직 열려 있어?",
        "M: 오늘 네 시에 닫는 걸로 알아.",
        "W: 어디에 이름 적어?",
        "M: 진로실 앞 종이에.",
        "W: 고마워, 지금 갈게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nayoung, how is your part of the science fair going?"],
        ["W", "I've collected the data, but the poster is still blank."],
        ["M", "What's holding you back?"],
        ["W", "I can't decide which graph to draw first."],
        ["M", "How many graphs do you actually have?"],
        ["W", "Six, and all of them show something."],
        ["M", "Six graphs on one poster is five too many."],
        ["W", "But each one took me two evenings."],
        ["M", "The judges will look at your poster for ninety seconds."],
        ["W", "So they'll only really see the first one."],
        ["M", "Choose the graph that answers your question and build around it."],
      ],
      choices: [
        "I have no data at all.",
        "That makes sense, I'll pick one.",
        "I'll put all six on the poster.",
        "The science fair is over.",
        "You should draw the graphs.",
      ],
      answer: 2,
      clue: "Choose the graph that answers your question and build around it.",
      explanation:
        "질문에 답하는 그래프 하나를 골라 그 둘레를 채우라는 조언이므로, 하나를 고르겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나영아, 과학전 네 부분은 어떻게 돼 가?",
        "W: 자료는 모았는데 포스터가 아직 비어 있어.",
        "M: 뭐가 막혔는데?",
        "W: 어떤 그래프를 먼저 그릴지 못 정하겠어.",
        "M: 그래프가 몇 개나 있는데?",
        "W: 여섯 개. 다 뭔가를 보여 줘.",
        "M: 포스터 한 장에 여섯 개면 다섯 개가 많은 거야.",
        "W: 근데 하나에 저녁 두 번씩 걸렸어.",
        "M: 심사위원은 네 포스터를 90초 볼 거야.",
        "W: 그럼 사실상 첫 번째만 보는 거네.",
        "M: 네 질문에 답하는 그래프를 하나 골라서 그 둘레를 채워.",
        "W: 말 되네, 하나 고를게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taeho, you've been recording your own voice lately."],
        ["M", "Every evening, one minute of speaking in English."],
        ["W", "Isn't it uncomfortable to listen to yourself afterwards?"],
        ["M", "The first week was awful. Now I barely notice it."],
        ["W", "What do you actually listen for when you play it back?"],
        ["M", "The places where I stop in the middle and start again."],
        ["W", "Has that number gone down since you started in March?"],
        ["M", "From about nine times a minute down to three."],
        ["W", "That's a real change in only a few months."],
        ["M", "And I never once studied a grammar rule for it."],
        ["W", "Could you send me one of your recordings?"],
      ],
      choices: [
        "Sure, I'll send tonight's one.",
        "I deleted all of them.",
        "I don't record anything.",
        "You should stop recording.",
        "My voice is not in English.",
      ],
      answer: 1,
      clue: "Could you send me one of your recordings?",
      explanation:
        "여자가 녹음 하나를 보내 달라고 했으므로, 오늘 밤 것을 보내겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 태호야, 요즘 네 목소리를 녹음하더라.",
        "M: 저녁마다 영어로 1분씩 말해.",
        "W: 나중에 자기 목소리 듣는 게 어색하지 않아?",
        "M: 첫 주는 끔찍했어. 이제는 거의 신경 안 써.",
        "W: 다시 들을 때 정확히 뭘 들어?",
        "M: 중간에 멈췄다가 다시 시작하는 자리들.",
        "W: 3월에 시작할 때보다 그 횟수가 줄었어?",
        "M: 1분에 아홉 번쯤에서 세 번으로.",
        "W: 몇 달 만에 진짜 달라졌네.",
        "M: 그러면서 문법 규칙은 한 번도 안 외웠어.",
        "W: 네 녹음 하나만 보내 줄래?",
        "M: 그럼, 오늘 밤 것 보낼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Yuna가 Seongmin에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Yuna : ________________",
      lines: [
        [
          "W",
          "Yuna and Seongmin are in the same group for a history presentation. " +
            "They have divided the work so that each of them covers one century. " +
            "Seongmin sends Yuna his slides on the evening before the presentation. " +
            "Reading them, she finds that half of his part repeats what she already covers. " +
            "If both of them present the same material, the group will run over time. " +
            "She wants to ask him to cut the part that overlaps with hers. " +
            "In this situation, what would Yuna most likely say to Seongmin?",
        ],
      ],
      choices: [
        "Let's present tomorrow instead.",
        "Your slides look very beautiful.",
        "I'll add more slides to my part.",
        "We should choose a new topic.",
        "Cut the part that repeats mine.",
      ],
      answer: 5,
      clue: "She wants to ask him to cut the part that overlaps with hers.",
      explanation:
        "겹치는 부분을 덜어 내야 시간이 맞으므로 ⑤가 가장 적절하다.",
      translation: [
        "W: 유나와 성민이는 역사 발표에서 같은 조입니다. 두 사람은 각자 한 세기씩 맡기로 일을 나누었습니다. 성민이는 발표 전날 저녁에 자기 발표 자료를 유나에게 보냅니다. 읽어 보니 성민이 부분의 절반이 유나가 이미 다루는 내용과 겹칩니다. 둘 다 같은 내용을 발표하면 조 전체가 시간을 넘기게 됩니다. 유나는 자기 부분과 겹치는 대목을 덜어 내 달라고 말하고 싶습니다. 이런 상황에서 유나가 성민이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to explain why ice floats on water. " +
            "Almost every liquid becomes denser as it cools, " +
            "and the solid form sinks in the liquid it came from. " +
            "Water does this too, but only down to four degrees. " +
            "Below that it does something unusual and starts to expand again, " +
            "because the molecules lock into a six-sided pattern " +
            "that holds them further apart than they were while moving freely. " +
            "Ice is therefore about nine percent less dense than the water beneath it. " +
            "That single strange habit is why a frozen lake keeps a roof of ice " +
            "with liquid water underneath, and why fish survive a winter at all.",
        ],
      ],
      choices: [
        "how lakes are formed in cold regions",
        "why ice is less dense than liquid water",
        "how fish breathe under the surface",
        "why snow falls in six-sided shapes",
        "how temperature is measured in water",
      ],
      answer: 2,
      clue: "Ice is therefore about nine percent less dense than the water beneath it.",
      explanation:
        "남자는 물이 4도 아래에서 다시 팽창해 얼음이 물보다 밀도가 낮아지는 까닭을 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 얼음이 왜 물에 뜨는지 설명하려 합니다. 거의 모든 액체는 식을수록 밀도가 높아지고, 굳은 형태는 자기가 나온 액체 속으로 가라앉습니다. 물도 그렇게 하지만 4도까지만 그렇습니다. 그 아래에서는 특이하게도 다시 팽창하기 시작합니다. 분자들이 육각형 모양으로 맞물리면서 자유롭게 움직일 때보다 더 멀리 떨어져 고정되기 때문입니다. 그래서 얼음은 그 아래 물보다 밀도가 9퍼센트쯤 낮습니다. 그 한 가지 이상한 성질 덕분에 언 호수는 얼음 지붕 아래 물을 그대로 두고, 물고기도 겨울을 날 수 있습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Today I want to explain why ice floats on water."],
        ["M", "Almost every liquid becomes denser as it cools."],
        ["M", "Water expands again below four degrees."],
        ["M", "The molecules lock into a six-sided pattern."],
        ["M", "A frozen lake keeps a roof of ice with liquid water underneath."],
      ],
      choices: [
        "liquids becoming denser as they cool",
        "water expanding below four degrees",
        "molecules locking into a six-sided pattern",
        "a frozen lake with water under the ice",
        "the depth of the deepest lake in the world",
      ],
      answer: 5,
      clue: "Almost every liquid becomes denser as it cools.",
      explanation:
        "액체가 식으며 밀도가 높아진다는 것, 4도 아래에서 팽창한다는 것, 육각형 구조, 얼음 아래의 물은 언급되지만 가장 깊은 호수의 깊이는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
