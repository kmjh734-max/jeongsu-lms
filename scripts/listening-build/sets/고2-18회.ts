/** 고2 듣기 18회 — 사람이 직접 쓴 회차 (2026-09-21) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 18회",
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
          "Good morning, students. This is Ms. Gu from the counselling office. " +
            "I want to explain a change to the way you book a talk with a counsellor. " +
            "Until now you knocked on the door and waited in the corridor, sometimes for a whole lunch break. " +
            "Many of you gave up and went back to class, and we only found that out this term. " +
            "From next week there will be a small box outside the office with slips of paper in it. " +
            "You write your name, your class, and three times when you are free, and drop the slip in. " +
            "We read the box twice a day and send you a message with a time. " +
            "Nobody sees what you write except the two of us in this office. " +
            "The box goes up on Monday morning. Thank you for listening.",
        ],
      ],
      choices: [
        "상담실 위치가 바뀐 것을 알리려고",
        "상담 교사를 새로 뽑는다고 알리려고",
        "점심시간에 복도에서 기다리지 말라고 하려고",
        "상담 신청 방법이 바뀐 것을 안내하려고",
        "학생 도우미를 모집하려고",
      ],
      answer: 4,
      clue: "From next week there will be a small box outside the office with slips of paper in it.",
      explanation:
        "다음 주부터 쪽지를 상자에 넣어 상담을 신청하는 방식으로 바뀐다는 것을 알리고 있다. 따라서 말의 목적은 ④이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 상담실 구 선생님입니다. " +
          "상담 신청 방법이 어떻게 달라지는지 말씀드리려 합니다. " +
          "지금까지는 문을 두드리고 복도에서 기다렸고, 점심시간을 통째로 기다린 학생도 있었습니다. " +
          "그러다 포기하고 교실로 돌아간 학생이 많았다는 것을 이번 학기에야 알았습니다. " +
          "다음 주부터는 상담실 앞에 쪽지가 든 작은 상자를 둡니다. " +
          "이름과 반, 시간이 되는 때 세 개를 적어 상자에 넣으면 됩니다. " +
          "상자는 하루 두 번 확인하고, 시간을 정해 문자로 알려 드립니다. " +
          "여러분이 적은 내용은 이 방에 있는 저희 둘 말고는 아무도 보지 않습니다. " +
          "상자는 월요일 아침에 놓입니다. 들어 주셔서 고맙습니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Taeyang, you've started doing your homework in the kitchen. Isn't it noisy?"],
        ["M", "Much noisier. My sister is usually making something at the table."],
        ["W", "Then why leave your own desk? You have a quiet room."],
        ["M", "I had a quiet room and three hours of nothing in it."],
        ["W", "Three hours of nothing?"],
        ["M", "I'd sit down at seven and stand up at ten with one page done."],
        ["W", "Doing what in between?"],
        ["M", "Lying on the bed, mostly. The bed is two steps from the desk."],
        ["W", "And in the kitchen there's no bed."],
        ["M", "There's no bed, no door, and somebody walking past every few minutes."],
        ["W", "Doesn't that break your concentration?"],
        ["M", "It breaks the hiding. Concentration was never the problem."],
        ["W", "How much do you actually finish now?"],
        ["M", "The same page takes forty minutes. The other two hours are mine again."],
        ["W", "Then I'll try the living room table tonight."],
      ],
      choices: [
        "공부는 조용한 곳에서 해야 한다",
        "숙제는 미리 해 두는 것이 좋다",
        "가족과 함께 시간을 보내야 한다",
        "공부 시간을 정해 두어야 한다",
        "혼자 있는 방보다 사람이 지나다니는 곳이 공부가 잘될 수 있다",
      ],
      answer: 5,
      clue: "It breaks the hiding. Concentration was never the problem.",
      explanation:
        "남자는 혼자 있는 방에서는 숨어 버리게 되지만 사람이 지나다니는 부엌에서는 그러지 못한다고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 태양아, 부엌에서 숙제하기 시작했더라. 시끄럽지 않아?",
        "M: 훨씬 시끄럽지. 보통 누나가 식탁에서 뭘 만들고 있어.",
        "W: 그런데 왜 네 책상을 두고? 조용한 방이 있잖아.",
        "M: 조용한 방이 있었고, 거기서 아무것도 안 한 세 시간이 있었지.",
        "W: 아무것도 안 한 세 시간?",
        "M: 7시에 앉아서 10시에 일어나는데 한 쪽 끝나 있어.",
        "W: 그 사이에는 뭘 하고?",
        "M: 주로 침대에 누워 있어. 침대가 책상에서 두 걸음이야.",
        "W: 부엌에는 침대가 없고.",
        "M: 침대도 없고 문도 없고, 몇 분마다 누가 지나가.",
        "W: 그러면 집중이 깨지지 않아?",
        "M: 숨는 게 깨지는 거야. 집중이 문제였던 적은 없어.",
        "W: 지금은 얼마나 끝내는데?",
        "M: 같은 한 쪽이 40분이면 돼. 나머지 두 시간이 다시 내 거야.",
        "W: 그럼 나도 오늘 밤엔 거실 탁자에서 해 봐야겠다.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "A map is useful because of what it leaves out, not because of what it shows. " +
            "A map that recorded every tree, every kerb, every puddle would be the size of the city and would tell you nothing. " +
            "The mapmaker's real work is deciding what may be thrown away, and that decision depends entirely on what you came to do. " +
            "A walking map and a sewer map of the same street share almost no lines. " +
            "This is why there is no such thing as a neutral map, and why asking for a complete one is asking for a useless one. " +
            "Every good summary works the same way: it is judged by what it dares to omit.",
        ],
      ],
      choices: [
        "지도는 정확할수록 좋다",
        "무엇을 덜어 낼지 정하는 것이 지도와 요약의 핵심이다",
        "길을 찾을 때는 지도를 믿어야 한다",
        "도시는 계획에 따라 만들어야 한다",
        "기록은 자세할수록 가치가 있다",
      ],
      answer: 2,
      clue: "Every good summary works the same way: it is judged by what it dares to omit.",
      explanation:
        "지도의 쓸모는 무엇을 담느냐가 아니라 무엇을 덜어 내느냐에 달려 있고, 좋은 요약도 마찬가지라는 내용이다. 따라서 요지는 ②이다.",
      translation: [
        "M: 지도가 쓸모 있는 것은 무엇을 보여 주기 때문이 아니라 무엇을 빼기 때문입니다. " +
          "나무 하나, 연석 하나, 물웅덩이 하나까지 기록한 지도는 도시만큼 커지고 아무것도 알려 주지 못합니다. " +
          "지도 만드는 사람의 진짜 일은 무엇을 버려도 되는지 정하는 것이고, 그 결정은 전적으로 무엇을 하러 왔는지에 달려 있습니다. " +
          "같은 거리의 도보 지도와 하수도 지도는 선이 거의 겹치지 않습니다. " +
          "그래서 중립적인 지도란 없고, 완전한 지도를 달라는 말은 쓸모없는 지도를 달라는 말입니다. " +
          "좋은 요약도 똑같습니다. 무엇을 과감히 빼느냐로 평가받습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Sohyun, the reading corner in the library looks much better now."],
        ["W", "We finished it last Friday. What do you see?"],
        ["M", "On the back wall there's a long shelf with five plants on it."],
        ["W", "One at each end and three in the middle. They need the window light."],
        ["M", "On the left there's a round rug on the floor."],
        ["W", "The first years sit on that during story hour."],
        ["M", "By the window on the right, is that a standing lamp?"],
        ["W", "No, it's a coat stand. The lamp is on the small table."],
        ["M", "I see. In the middle there are two armchairs."],
        ["W", "They came from the staff room. Nobody used them there."],
        ["M", "And beside the door there's a square cushion box."],
        ["W", "We keep the spare cushions inside it."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "No, it's a coat stand. The lamp is on the small table.",
      explanation:
        "여자는 창가에 있는 것이 스탠드 조명이 아니라 옷걸이라고 바로잡는다. 그림에는 스탠드 조명이 그려져 있으므로 ③이 대화와 일치하지 않는다.",
      figure: {
        kind: "labeled",
        scene:
          "A library reading corner seen from the front, five things clearly separated and none overlapping, clean black line art, no writing anywhere. " +
          "Along the back wall: a LONG SHELF holding exactly FIVE potted plants in a row. " +
          "Left side of the floor: one ROUND RUG lying flat. " +
          "By the window on the right: a tall STANDING LAMP with a cone shade on a thin pole and a round base. " +
          "Centre of the room: exactly TWO ARMCHAIRS side by side. " +
          "Beside the door on the far right: a SQUARE BOX with a flat lid, holding cushions.",
      },
      translation: [
        "M: 소현아, 도서관 독서 코너가 훨씬 나아졌네.",
        "W: 지난주 금요일에 끝냈어. 뭐가 보여?",
        "M: 뒷벽에 긴 선반이 있고 화분이 다섯 개 있네.",
        "W: 양 끝에 하나씩, 가운데 세 개. 창가 빛이 필요하거든.",
        "M: 왼쪽 바닥에는 둥근 깔개가 있고.",
        "W: 이야기 시간에 1학년들이 거기 앉아.",
        "M: 오른쪽 창가에 있는 건 스탠드 조명이야?",
        "W: 아니, 옷걸이야. 조명은 작은 탁자 위에 있어.",
        "M: 그렇구나. 가운데에는 안락의자가 두 개 있고.",
        "W: 교무실에서 가져왔어. 거기서는 아무도 안 썼거든.",
        "M: 그리고 문 옆에는 네모난 방석 상자가 있고.",
        "W: 여분 방석을 그 안에 넣어 둬.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Nayoung, there's a problem with the concert programme."],
        ["W", "I sent it to the printer this morning. What's wrong?"],
        ["M", "The third and fourth pieces are the wrong way round."],
        ["W", "So the audience will expect the wrong song after the interval."],
        ["M", "And the choir will stand up at the wrong moment."],
        ["W", "Can we print an insert to go inside?"],
        ["M", "Two hundred inserts, by Friday? The machine can't do it."],
        ["W", "Then I'll call the printer and stop the job before it runs."],
        ["M", "Do it now. They start printing at four."],
        ["W", "I'll call from the office and send the corrected file straight after."],
        ["M", "Thanks. I'll warn the choir in case it's too late."],
      ],
      choices: [
        "인쇄소에 전화해 인쇄를 멈추기",
        "안내지를 따로 인쇄하기",
        "합창단에 알리기",
        "곡 순서를 바꾸기",
        "공연 날짜를 미루기",
      ],
      answer: 1,
      clue: "Then I'll call the printer and stop the job before it runs.",
      explanation:
        "여자는 인쇄가 시작되기 전에 인쇄소에 전화해 멈추기로 한다. 합창단에 알리는 일은 남자가 맡았다. 따라서 답은 ①이다.",
      translation: [
        "M: 나영아, 연주회 안내지에 문제가 있어.",
        "W: 오늘 아침에 인쇄소에 보냈는데. 뭐가 잘못됐어?",
        "M: 세 번째 곡과 네 번째 곡이 바뀌어 있어.",
        "W: 그럼 관객이 휴식 뒤에 엉뚱한 곡을 기다리겠네.",
        "M: 합창단도 엉뚱한 때 일어설 거고.",
        "W: 안에 끼울 종이를 따로 인쇄할까?",
        "M: 200장을 금요일까지? 기계로 안 돼.",
        "W: 그럼 인쇄가 돌기 전에 인쇄소에 전화해서 멈출게.",
        "M: 지금 해. 4시에 인쇄 시작한대.",
        "W: 행정실에서 전화하고 바로 고친 파일 보낼게.",
        "M: 고마워. 나는 혹시 늦었을 때를 대비해 합창단에 말해 둘게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to the camping shop. What are you looking for?"],
        ["M", "A sleeping bag and a couple of lanterns for a school trip."],
        ["W", "The light sleeping bags are forty dollars."],
        ["M", "One of those, please."],
        ["W", "And the small lanterns are eleven dollars each."],
        ["M", "Two, then."],
        ["W", "Forty and twenty-two. That's sixty-two dollars."],
        ["M", "Do you take the school group card?"],
        ["W", "We do. That's five dollars off the total."],
        ["M", "Here it is."],
        ["W", "Would you like a mat as well? They're fifteen dollars."],
        ["M", "No, thank you. The school lends those out."],
      ],
      choices: ["$52", "$55", "$57", "$62", "$72"],
      answer: 3,
      clue: "We do. That's five dollars off the total.",
      explanation:
        "침낭 40달러와 랜턴 11달러짜리 두 개 22달러를 더하면 62달러이다. 단체 카드 할인 5달러를 빼면 57달러이고 매트는 사지 않았으므로 답은 ③이다.",
      translation: [
        "W: 캠핑 용품점입니다. 무엇을 찾으세요?",
        "M: 수학여행에 쓸 침낭 하나랑 랜턴 두 개요.",
        "W: 가벼운 침낭은 40달러입니다.",
        "M: 그걸로 하나 주세요.",
        "W: 작은 랜턴은 하나에 11달러입니다.",
        "M: 그럼 두 개요.",
        "W: 40달러에 22달러면 62달러입니다.",
        "M: 학교 단체 카드 되나요?",
        "W: 됩니다. 전체 금액에서 5달러 할인됩니다.",
        "M: 여기 있습니다.",
        "W: 매트도 하시겠어요? 15달러입니다.",
        "M: 아니요, 괜찮아요. 학교에서 빌려줘요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 밴드부 공연에 나가지 못하는 이유를 고르시오.",
      lines: [
        ["W", "Minjun, aren't you playing at the autumn show?"],
        ["M", "Not this time. I told the band last night."],
        ["W", "Is it your hand? You hurt it in September."],
        ["M", "It healed weeks ago. That's not it."],
        ["W", "Then what? You've played at every show since first year."],
        ["M", "The show is on the twenty-second."],
        ["W", "And?"],
        ["M", "That's the day of the regional science fair. My project is entered."],
        ["W", "Both on the same day. Can't you do the show in the evening?"],
        ["M", "The fair runs until eight and it's two hours away."],
      ],
      choices: [
        "손을 다쳐서",
        "밴드부를 그만두어서",
        "악기가 고장 나서",
        "연습을 못 해서",
        "같은 날 다른 대회가 있어서",
      ],
      answer: 5,
      clue: "That's the day of the regional science fair. My project is entered.",
      explanation:
        "공연 날짜인 22일이 지역 과학 전람회와 겹치고, 전람회는 8시까지 이어지며 거리도 멀다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 민준아, 가을 공연에서 연주 안 해?",
        "M: 이번엔 안 해. 어젯밤에 밴드부에 말했어.",
        "W: 손 때문이야? 9월에 다쳤잖아.",
        "M: 몇 주 전에 나았어. 그건 아니야.",
        "W: 그럼 왜? 1학년 때부터 공연마다 나갔잖아.",
        "M: 공연이 22일이야.",
        "W: 그런데?",
        "M: 그날이 지역 과학 전람회야. 내 작품이 나가 있어.",
        "W: 같은 날이네. 공연은 저녁에 못 해?",
        "M: 전람회가 8시까지고 거기가 두 시간 거리야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 요리 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Hayoon, have you read the notice about the cooking contest?"],
        ["W", "Only the first line. I stopped when I saw how long it was."],
        ["M", "It is long, but the whole thing is quite simple once you read it."],
        ["W", "Go on, then. What do we actually have to do?"],
        ["M", "Each team gets a box on the day and makes one dish from five ingredients inside it."],
        ["W", "We don't know what's in the box beforehand?"],
        ["M", "Not a thing. That's the whole point of it."],
        ["W", "So there's no way to practise the dish in advance."],
        ["M", "None. You practise the cooking, not the recipe."],
        ["W", "All right, when is it held?"],
        ["M", "The second Friday of next month, in the home economics room, straight after the sixth period."],
        ["W", "That's a long afternoon. How many people are in a team?"],
        ["M", "Two, and both of them have to be from the same year."],
        ["W", "And who decides the winner?"],
        ["M", "Two teachers and the cook from the school kitchen. Three judges in all."],
        ["W", "The cook as well? Then it will be judged on taste, not on looks."],
        ["M", "That's what everybody says. Last year the neatest plate came third."],
        ["W", "Then I'll ask Yerin to do it with me. She's in my year."],
        ["M", "Ask her today. Entries close on Thursday afternoon."],
      ],
      choices: ["진행 방식", "열리는 날", "팀 구성", "심사 위원", "준비물"],
      answer: 5,
      clue: "Two teachers and the cook from the school kitchen.",
      explanation:
        "진행 방식(상자 속 재료 다섯 가지로 한 요리), 날짜(다음 달 둘째 금요일), 팀 구성(같은 학년 두 명), 심사 위원(교사 둘과 조리사)은 언급되지만 준비물은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 하윤아, 요리 대회 공지 읽었어?",
        "W: 첫 줄만. 길어 보여서 그만뒀어.",
        "M: 길긴 한데, 읽어 보면 내용은 아주 간단해.",
        "W: 그럼 말해 봐. 뭘 해야 하는데?",
        "M: 팀마다 그날 상자를 하나 받고, 그 안에 든 재료 다섯 가지로 요리 하나를 만들어.",
        "W: 상자에 뭐가 들었는지 미리 몰라?",
        "M: 전혀. 그게 핵심이야.",
        "W: 그럼 요리를 미리 연습할 방법이 없네.",
        "M: 없지. 조리법이 아니라 요리를 연습하는 거야.",
        "W: 알겠어, 언제 하는데?",
        "M: 다음 달 둘째 금요일, 가정실에서, 6교시 끝나고 바로.",
        "W: 오후가 길겠다. 한 팀에 몇 명이야?",
        "M: 두 명, 둘 다 같은 학년이어야 해.",
        "W: 그리고 누가 우승을 정해?",
        "M: 선생님 두 분이랑 급식실 조리사님. 모두 세 분이야.",
        "W: 조리사님까지? 그럼 모양보다 맛으로 보겠네.",
        "M: 다들 그렇게 말해. 작년에는 제일 예쁜 접시가 3등이었어.",
        "W: 그럼 예린이한테 같이하자고 해야겠다. 같은 학년이잖아.",
        "M: 오늘 물어봐. 접수는 목요일 오후에 닫혀.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Sorae Forest Library에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is what you should know about Sorae Forest Library, which opened at the foot of the hill six years ago. " +
            "It is open from ten in the morning until seven, and it closes on the first Monday of each month. " +
            "Anyone living in the city may borrow up to five books for two weeks. " +
            "The whole ground floor is a single quiet room, so no talking is allowed there at all. " +
            "Children's programmes run upstairs on Saturday mornings, and those do not need booking. " +
            "The building has no car park, but the number twelve bus stops fifty metres from the door.",
        ],
      ],
      choices: [
        "6년 전에 문을 열었다",
        "매달 첫째 월요일에 문을 닫는다",
        "책은 한 번에 다섯 권까지 빌릴 수 있다",
        "어린이 프로그램은 예약해야 한다",
        "주차장이 없다",
      ],
      answer: 4,
      clue: "Children's programmes run upstairs on Saturday mornings, and those do not need booking.",
      explanation:
        "어린이 프로그램은 예약이 필요 없다고 했다. 따라서 ④가 내용과 일치하지 않는다.",
      translation: [
        "M: 6년 전 언덕 아래에 문을 연 Sorae Forest Library를 소개합니다. " +
          "아침 10시부터 저녁 7시까지 열고, 매달 첫째 월요일에 쉽니다. " +
          "시에 사는 사람은 누구나 2주 동안 다섯 권까지 빌릴 수 있습니다. " +
          "1층 전체가 하나의 조용한 방이어서 그곳에서는 이야기를 나눌 수 없습니다. " +
          "어린이 프로그램은 토요일 오전에 2층에서 열리며 예약은 필요 없습니다. " +
          "건물에는 주차장이 없지만 12번 버스가 문에서 50미터 거리에 섭니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 예약할 공연을 고르시오.",
      lines: [
        ["W", "Dohyun, these are the five plays still showing this month."],
        ["M", "Let's pick one. I can't go on a weekday because of my evening class."],
        ["W", "Right, that takes out one of them."],
        ["M", "Next, how long are they? Over two hours is too much for me."],
        ["W", "Then one more is gone. Three are left."],
        ["M", "What are the seats?"],
        ["W", "We said thirty thousand won at the most."],
        ["M", "Then one more drops out. Two left."],
        ["W", "Is there a talk with the actors after either of them?"],
        ["M", "Only one has it, and that's the part you wanted."],
        ["W", "Then that's the one. I'll book two seats tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Then that's the one. I'll book two seats tonight.",
      explanation:
        "평일인 ②, 150분인 ①, 35,000원인 ③을 뺀다. 남은 ④와 ⑤ 중 배우와의 대화가 있는 것은 ⑤이므로 답은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "토요일 / 150분 / 28,000원 / 배우와의 대화 있음" },
          { no: 2, label: "②", value: "수요일 / 110분 / 25,000원 / 배우와의 대화 있음" },
          { no: 3, label: "③", value: "토요일 / 110분 / 35,000원 / 배우와의 대화 있음" },
          { no: 4, label: "④", value: "일요일 / 100분 / 30,000원 / 배우와의 대화 없음" },
          { no: 5, label: "⑤", value: "일요일 / 120분 / 30,000원 / 배우와의 대화 있음" },
        ],
      },
      translation: [
        "W: 도현아, 이번 달에 아직 하는 연극이 이 다섯 개야.",
        "M: 하나 고르자. 저녁 수업 때문에 평일은 안 돼.",
        "W: 맞다, 그럼 하나가 빠지네.",
        "M: 다음으로 몇 분짜리야? 두 시간 넘으면 나한테는 길어.",
        "W: 그럼 하나 더 빠진다. 세 개 남았어.",
        "M: 자리는 얼마야?",
        "W: 3만 원까지로 정했잖아.",
        "M: 그럼 하나 더 빠지고 둘 남았다.",
        "W: 둘 중에 배우와의 대화가 있는 게 있어?",
        "M: 하나만 있어, 네가 보고 싶다던 그거.",
        "W: 그럼 그걸로 하자. 오늘 밤에 두 자리 예매할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Have you handed in the club activity report?"],
        ["M", "Not yet. I couldn't find the form anywhere."],
        ["W", "Did you look in the shared folder?"],
        ["M", "I thought the teacher handed those out on paper."],
        ["W", "Not since last year. It's the first file in the folder."],
      ],
      choices: [
        "The report is two pages long.",
        "Our club meets on Wednesdays.",
        "Then I'll download it right now.",
        "I handed in mine last month.",
        "You should write yours as well.",
      ],
      answer: 3,
      clue: "Not since last year. It's the first file in the folder.",
      explanation:
        "공유 폴더 첫 파일에 양식이 있다는 말을 들었으므로, 지금 바로 내려받겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 동아리 활동 보고서 냈어?",
        "M: 아직. 양식을 어디서도 못 찾겠더라.",
        "W: 공유 폴더는 봤어?",
        "M: 선생님이 종이로 나눠 주시는 줄 알았어.",
        "W: 작년부터는 아니야. 폴더 맨 앞 파일이야.",
        "M: 그럼 지금 바로 내려받을게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "You've been eating lunch at your desk all week."],
        ["W", "The queue in the cafeteria takes twenty minutes."],
        ["M", "Have you tried going in the second half of the break?"],
        ["W", "Isn't everything gone by then?"],
        ["M", "They refill at half past twelve, and there's no queue at all."],
      ],
      choices: [
        "Then I'll go at half past twelve tomorrow.",
        "My desk is next to the window.",
        "I usually bring a sandwich.",
        "The cafeteria closes at one.",
        "You should eat earlier as well.",
      ],
      answer: 1,
      clue: "They refill at half past twelve, and there's no queue at all.",
      explanation:
        "12시 30분에 음식을 채우고 줄도 없다는 말을 들었으므로, 내일 그때 가겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 일주일 내내 자리에서 점심을 먹네.",
        "W: 급식실 줄이 20분 걸려.",
        "M: 쉬는 시간 후반에 가 봤어?",
        "W: 그때면 다 없어지지 않아?",
        "M: 12시 30분에 다시 채워. 그때는 줄도 없어.",
        "W: 그럼 내일 12시 30분에 가 볼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyeon, how is the class recycling project going?"],
        ["W", "Badly. The bins are full of the wrong things again."],
        ["M", "What have you tried?"],
        ["W", "I put a list of rules on the wall above the bins."],
        ["M", "How long is the list?"],
        ["W", "Eleven lines. It covers everything."],
        ["M", "Eleven lines, read by someone holding a lunch tray?"],
        ["W", "I suppose nobody stops long enough to read it."],
        ["M", "People sort at the moment they let go. That moment lasts one second."],
        ["W", "So the rules have to be at the bin, not above it."],
        ["M", "Put one picture on each lid. One picture, nothing else."],
      ],
      choices: [
        "The bins are emptied every Friday.",
        "I wrote the rules myself.",
        "Our class has twenty-eight students.",
        "Then I'll put a picture on each lid tomorrow.",
        "I'd rather remove the bins altogether.",
      ],
      answer: 4,
      clue: "Put one picture on each lid. One picture, nothing else.",
      explanation:
        "뚜껑마다 그림 하나씩만 붙이라는 조언을 들었으므로, 내일 뚜껑마다 그림을 붙이겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 서연아, 학급 분리수거는 잘돼 가?",
        "W: 잘 안돼. 통마다 엉뚱한 게 또 들어 있어.",
        "M: 뭘 해 봤는데?",
        "W: 통 위쪽 벽에 규칙 목록을 붙였어.",
        "M: 몇 줄짜리인데?",
        "W: 열한 줄. 다 들어 있어.",
        "M: 열한 줄을, 식판 들고 있는 사람이 읽어?",
        "W: 그걸 읽을 만큼 오래 서 있는 사람은 없겠네.",
        "M: 사람들은 손을 놓는 순간에 분류해. 그 순간은 1초야.",
        "W: 그럼 규칙이 통 위가 아니라 통에 있어야 하네.",
        "M: 뚜껑마다 그림 하나씩 붙여. 그림 하나만.",
        "W: 그럼 내일 뚜껑마다 그림을 붙일게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junseo, you've been recording yourself reading English aloud."],
        ["M", "Every night for six weeks. I still sound the same."],
        ["W", "Do you listen to the recordings?"],
        ["M", "I listen to the whole thing once, right after I make it."],
        ["W", "And what do you notice?"],
        ["M", "That I don't like my voice. That's about it."],
        ["W", "Of course. A whole passage at once gives you a feeling, not a fault."],
        ["M", "So what should I be doing?"],
        ["W", "Take thirty seconds of it. Play the same thirty seconds four times."],
        ["M", "Four times? That sounds slow."],
        ["W", "The fourth time you stop hearing your voice and start hearing the words."],
      ],
      choices: [
        "My recordings are about ten minutes long.",
        "Then I'll replay thirty seconds tonight.",
        "I've been studying English for six years.",
        "The microphone is on my desk.",
        "You should record yourself too.",
      ],
      answer: 2,
      clue: "Take thirty seconds of it. Play the same thirty seconds four times.",
      explanation:
        "30초만 골라 네 번 다시 들으라는 조언을 들었으므로, 오늘 밤에 30초를 다시 듣겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준서야, 영어 소리 내어 읽는 걸 녹음하고 있더라.",
        "M: 6주째 매일 밤. 그런데 소리가 그대로야.",
        "W: 녹음을 듣긴 해?",
        "M: 녹음하고 바로 전체를 한 번 들어.",
        "W: 그래서 뭐가 보이는데?",
        "M: 내 목소리가 마음에 안 든다는 것. 그 정도.",
        "W: 그렇겠지. 한 번에 전체를 들으면 느낌만 남지 잘못은 안 보여.",
        "M: 그럼 어떻게 해야 해?",
        "W: 30초만 잘라. 같은 30초를 네 번 틀어.",
        "M: 네 번? 느릴 것 같은데.",
        "W: 네 번째쯤 되면 네 목소리가 아니라 말이 들리기 시작해.",
        "M: 그럼 오늘 밤에 30초를 다시 들어 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Ms. Yang이 Doyun에게 할 말로 가장 적절한 것을 고르시오. [3점]",
      questionText: "▶ Ms. Yang : ________________",
      lines: [
        [
          "W",
          "Ms. Yang teaches the school art class, and Doyun is one of her most careful students. " +
            "Doyun works on a single drawing for weeks, fixing one small area at a time until it is perfect. " +
            "Because of that care, every finished corner of her work is better than anyone else's. " +
            "The difficulty is that she starts at the top left and finishes each part before moving on. " +
            "When the deadline comes, half the paper is beautiful and half is empty. " +
            "Ms. Yang does not want her to work less carefully; that patience is what makes the drawing hers. " +
            "The trouble is that a judge sees a whole picture, not a perfect corner. " +
            "The city exhibition closes in two weeks, and she wants to tell Doyun to sketch the entire picture lightly first and only then go back and finish parts. " +
            "In this situation, what would Ms. Yang most likely say to Doyun?",
        ],
      ],
      choices: [
        "Sketch the whole picture lightly first, then finish the parts.",
        "Try to draw something simpler this time.",
        "I think you should use darker pencils.",
        "Let's enter your drawing next year instead.",
        "You should work on two drawings at once.",
      ],
      answer: 1,
      clue: "she wants to tell Doyun to sketch the entire picture lightly first and only then go back and finish parts",
      explanation:
        "양 선생님은 도윤이의 꼼꼼함을 문제 삼지 않으면서, 전체를 먼저 옅게 스케치한 뒤 부분을 완성하라고 말하려 한다. 따라서 ①이 가장 적절하다.",
      translation: [
        "W: 양 선생님은 학교 미술 수업을 맡고 있고, 도윤이는 가장 꼼꼼한 학생 중 하나입니다. " +
          "도윤이는 그림 한 장을 몇 주에 걸쳐 작은 부분씩 다듬어 완벽하게 만듭니다. " +
          "그 정성 덕분에 완성된 구석 하나하나는 누구보다 낫습니다. " +
          "문제는 왼쪽 위에서 시작해 한 부분을 끝내고서야 다음으로 넘어간다는 점입니다. " +
          "마감이 오면 종이의 절반은 아름답고 절반은 비어 있습니다. " +
          "양 선생님은 도윤이가 덜 꼼꼼해지기를 바라지 않습니다. 그 끈기가 그 그림을 도윤이의 것으로 만듭니다. " +
          "문제는 심사위원이 보는 것은 완벽한 한 구석이 아니라 그림 전체라는 점입니다. " +
          "시 전시회는 2주 뒤이고, 선생님은 전체를 먼저 옅게 잡아 놓고 그다음에 부분을 완성하라고 말하고 싶습니다. " +
          "이런 상황에서 양 선생님이 도윤이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "남자가 하는 말의 주제로 가장 적절한 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about animals that store food for later."],
        ["M", "Storing is a gamble: you spend energy now on a meal you may never come back to."],
        ["M", "The Clark's nutcracker buries tens of thousands of seeds across a mountainside and finds most of them months later under snow."],
        ["M", "The red squirrel does the opposite and piles everything into one larder it can guard by sitting on top of it."],
        ["M", "The honeybee turns the problem inside out by changing the food itself into something that will not spoil."],
        ["M", "The mole keeps earthworms alive but unable to leave, bitten in a way that stops them crawling off."],
        ["M", "Each animal is answering the same question: how do you keep food from time, from weather, and from neighbours?"],
        ["M", "The answers differ because each species can only defend what it is already good at."],
      ],
      choices: [
        "how animals find food in winter",
        "why some animals live alone",
        "animals that store food for later",
        "how seeds travel to new places",
        "why bees make more honey than they need",
      ],
      answer: 3,
      clue: "Each animal is answering the same question: how do you keep food from time, from weather, and from neighbours?",
      explanation:
        "남자는 잣까마귀, 붉은다람쥐, 꿀벌, 두더지가 먹이를 저장하는 방식을 설명한다. 따라서 주제는 ③이다.",
      translation: [
        "M: 안녕하세요. 오늘은 먹이를 나중을 위해 저장하는 동물에 대해 이야기하려 합니다.",
        "M: 저장은 도박입니다. 다시 돌아오지 못할지도 모르는 한 끼에 지금 힘을 쓰는 것이니까요.",
        "M: 클라크잣까마귀는 산비탈 곳곳에 씨앗 수만 개를 묻고, 몇 달 뒤 눈 아래에서 대부분을 찾아냅니다.",
        "M: 붉은다람쥐는 반대로 모든 것을 한 곳간에 쌓고 그 위에 앉아 지킵니다.",
        "M: 꿀벌은 문제를 뒤집어, 먹이 자체를 상하지 않는 것으로 바꿔 버립니다.",
        "M: 두더지는 지렁이를 산 채로 두되 기어 나가지 못하게 물어 둡니다.",
        "M: 어느 동물이든 같은 질문에 답하고 있습니다. 시간과 날씨와 이웃으로부터 먹이를 어떻게 지킬 것인가.",
        "M: 답이 다른 것은 저마다 이미 잘하는 것만 지킬 수 있기 때문입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 동물이 아닌 것은?",
      lines: [
        ["M", "Good afternoon. Today I want to talk about animals that store food for later."],
        ["M", "Storing is a gamble: you spend energy now on a meal you may never come back to."],
        ["M", "The Clark's nutcracker buries tens of thousands of seeds across a mountainside and finds most of them months later under snow."],
        ["M", "The red squirrel does the opposite and piles everything into one larder it can guard by sitting on top of it."],
        ["M", "The honeybee turns the problem inside out by changing the food itself into something that will not spoil."],
        ["M", "The mole keeps earthworms alive but unable to leave, bitten in a way that stops them crawling off."],
        ["M", "Each animal is answering the same question: how do you keep food from time, from weather, and from neighbours?"],
        ["M", "The answers differ because each species can only defend what it is already good at."],
      ],
      choices: ["Clark's nutcracker", "red squirrel", "honeybee", "brown bear", "mole"],
      answer: 4,
      clue: "The mole keeps earthworms alive but unable to leave, bitten in a way that stops them crawling off.",
      explanation:
        "클라크잣까마귀, 붉은다람쥐, 꿀벌, 두더지는 언급되지만 불곰은 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
