/** 고2 듣기 31회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 31회",
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
          "Good morning, everyone. This is Junho from the student council. " +
            "Next Thursday we are holding a uniform sharing day in the front hall. " +
            "Every year about two hundred of you grow out of a blazer " +
            "that is still in good condition, " +
            "and every year the first-year students buy those same blazers new. " +
            "So bring in anything that no longer fits, " +
            "washed and with the buttons on, " +
            "and leave it at the table by the notice board any morning this week. " +
            "On Thursday you may take whatever you need from the tables, free of charge, " +
            "whether or not you brought something in. " +
            "Nothing is counted and nothing is recorded. " +
            "Please look in your wardrobe tonight. Thank you.",
        ],
      ],
      choices: [
        "교복 값 인상을 알리려고",
        "분실물 보관 기간을 안내하려고",
        "교복 나눔 행사 참여를 권유하려고",
        "복장 규정 변경을 알리려고",
        "학생회 선거 일정을 안내하려고",
      ],
      answer: 3,
      clue: "Next Thursday we are holding a uniform sharing day in the front hall.",
      explanation:
        "남자는 목요일에 교복 나눔 행사를 연다며 작아진 교복을 가져오고 필요한 것을 가져가라고 권한다. 따라서 답은 ③이다.",
      translation: [
        "M: 여러분, 안녕하세요. 학생회 준호입니다. 다음 주 목요일에 중앙 현관에서 교복 나눔의 날을 엽니다. 해마다 이백 명쯤이 아직 멀쩡한 재킷을 입지 못할 만큼 자라고, 해마다 1학년 학생들이 바로 그 재킷을 새로 삽니다. 그러니 이제 맞지 않는 옷이 있으면 빨아서 단추를 달아, 이번 주 아침 아무 때나 게시판 옆 탁자에 두고 가세요. 목요일에는 가져온 것이 있든 없든 필요한 것을 탁자에서 무료로 가져가시면 됩니다. 세지도 않고 적지도 않습니다. 오늘 밤에 옷장을 한 번 봐 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Sora, I've been stuck on the same physics problem since Monday."],
        ["W", "Four days. Did you ask Mr. Ryu?"],
        ["M", "I keep meaning to. It feels like admitting I wasn't listening."],
        ["W", "How long would the question have taken him?"],
        ["M", "Two minutes, probably."],
        ["W", "So you've spent four days protecting yourself from two minutes."],
        ["M", "When you put it that way."],
        ["W", "And the chapter after it builds on this one."],
        ["M", "Which is why nothing since Monday has made sense."],
        ["W", "A question you postpone gets more expensive every day."],
        ["M", "I'll go after lunch, then."],
        ["W", "Take the page with you and point at the line."],
      ],
      choices: [
        "질문을 미루면 나중에 더 큰 시간을 쓴다",
        "혼자 오래 붙잡고 있어야 실력이 는다",
        "문제집을 여러 권 풀어야 한다",
        "수업 전에 예습을 해야 한다",
        "친구에게 먼저 물어봐야 한다",
      ],
      answer: 1,
      clue: "A question you postpone gets more expensive every day.",
      explanation:
        "여자는 2분이면 될 질문을 나흘 동안 미뤘다며, 미룬 질문은 날마다 값이 올라간다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 소라야, 나 월요일부터 같은 물리 문제에 막혀 있어.",
        "W: 나흘이네. 류 선생님께 여쭤봤어?",
        "M: 계속 그러려고는 해. 안 듣고 있었다고 실토하는 것 같아서.",
        "W: 그 질문에 선생님이 몇 분 쓰셨을까?",
        "M: 2분쯤이겠지.",
        "W: 그럼 2분으로부터 너를 지키려고 나흘을 쓴 거네.",
        "M: 그렇게 말하니까 그러네.",
        "W: 그리고 다음 단원은 이 단원 위에 쌓이잖아.",
        "M: 그래서 월요일 이후로 아무것도 이해가 안 됐구나.",
        "W: 미룬 질문은 날마다 값이 올라가.",
        "M: 그럼 점심 먹고 갈게.",
        "W: 그 쪽을 들고 가서 줄을 짚어.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Almost everyone reviews what they got right " +
            "and almost nobody keeps a record of what they got wrong. " +
            "That is backwards. " +
            "A mistake you merely correct in red pen disappears the moment the page is closed, " +
            "and three weeks later you make it again " +
            "without ever knowing it is the same mistake. " +
            "Keep one notebook for errors alone. " +
            "Write the question, write what you did, " +
            "and in one line write why it seemed right at the time. " +
            "That last line is the whole point, " +
            "because the reasoning is what repeats, not the question. " +
            "After two months you will find that your hundred mistakes were really six, " +
            "and six is a number you can do something about.",
        ],
      ],
      choices: [
        "매일 같은 시간에 공부해야 한다",
        "문제를 많이 풀어야 한다",
        "맞힌 문제를 다시 봐야 한다",
        "공부 계획을 주 단위로 세워야 한다",
        "틀린 것을 기록해 두어야 같은 실수를 줄인다",
      ],
      answer: 5,
      clue: "Keep one notebook for errors alone.",
      explanation:
        "여자는 오답만 따로 적고 그때 왜 맞다고 생각했는지까지 쓰면 반복되는 실수의 정체를 알 수 있다고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 거의 모두가 맞힌 것을 다시 보고, 틀린 것을 기록해 두는 사람은 거의 없습니다. 거꾸로 된 일입니다. 빨간 펜으로 고치기만 한 실수는 그 쪽을 덮는 순간 사라지고, 3주 뒤에 같은 실수인 줄도 모른 채 다시 합니다. 오답만 적는 공책을 한 권 두세요. 문제를 쓰고, 내가 한 것을 쓰고, 그때 왜 그것이 맞아 보였는지를 한 줄로 쓰세요. 그 마지막 줄이 핵심입니다. 반복되는 것은 문제가 아니라 그 생각이기 때문입니다. 두 달이 지나면 백 개의 실수가 사실은 여섯 개였다는 것을 알게 되고, 여섯은 손을 쓸 수 있는 숫자입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Chaerin, is this the greenhouse the gardening club uses?"],
        ["W", "Yes, the school let us have it back in March."],
        ["M", "There's a watering can on the floor at the left end."],
        ["W", "It's heavy when it's full, so we leave it down there."],
        ["M", "And a long potting bench runs along the back wall."],
        ["W", "Two of us can work at it at the same time."],
        ["M", "A coiled hose hangs on the wall beside the bench."],
        ["W", "It reaches every corner if you pull it all the way out."],
        ["M", "I count four plant pots standing in a row on the bench."],
        ["W", "There are five. One is round the far side of the bench."],
        ["M", "And a hanging basket of trailing leaves is above the bench."],
        ["W", "That one has been there longer than the club has."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "There are five. One is round the far side of the bench.",
      explanation:
        "남자가 화분이 네 개라고 하자 여자가 다섯 개라고 바로잡는다. 그림에는 네 개가 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "scene",
        scene:
          "A school greenhouse corner drawn as one wide picture, clean black line art on white, " +
          "no writing or letters or numbers anywhere. " +
          "A WATERING CAN stands on the floor at the left end. " +
          "A LONG POTTING BENCH runs along the back wall. " +
          "A COILED HOSE hangs on the wall beside the bench. " +
          "EXACTLY FOUR PLANT POTS stand in a row on top of the bench, " +
          "with a wide clear gap between each pot so that no pot overlaps another and all four are easy to count. " +
          "A HANGING BASKET of trailing leaves hangs from above, over the bench.",
      },
      translation: [
        "M: 채린아, 여기가 원예 동아리가 쓰는 온실이야?",
        "W: 응, 3월에 학교에서 다시 내줬어.",
        "M: 왼쪽 끝 바닥에 물뿌리개가 있네.",
        "W: 가득 차면 무거워서 거기 내려 둬.",
        "M: 그리고 뒷벽을 따라 긴 작업대가 있어.",
        "W: 둘이 동시에 작업할 수 있어.",
        "M: 작업대 옆 벽에 둘둘 감은 호스가 걸려 있네.",
        "W: 끝까지 당기면 구석구석 다 닿아.",
        "M: 작업대 위에 화분이 네 개 줄지어 있어.",
        "W: 다섯 개야. 하나는 작업대 저쪽 편에 있어.",
        "M: 그리고 작업대 위에 늘어진 잎이 있는 걸이 화분이 있네.",
        "W: 그건 동아리보다 오래 거기 있었어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Sora, our festival booth opens at one on Friday."],
        ["W", "I know. Is the banner finished?"],
        ["M", "Hung this morning, above the front of the booth."],
        ["W", "Good. And the supplies?"],
        ["M", "All in the two boxes under the stairs."],
        ["W", "Then what's still missing?"],
        ["M", "We're running two hot plates and nobody has applied for power."],
        ["W", "Do we apply at the office?"],
        ["M", "Yes, and the form has to be in by Wednesday."],
        ["W", "Who's free before Wednesday?"],
        ["M", "Not me. I'm rehearsing with the band every afternoon."],
        ["W", "Then I'll go to the office and apply for the power."],
      ],
      choices: [
        "현수막 달기",
        "행정실에 전기 사용 신청하기",
        "물품 사 오기",
        "밴드와 연습하기",
        "부스 자리 정하기",
      ],
      answer: 2,
      clue: "Then I'll go to the office and apply for the power.",
      explanation:
        "현수막과 물품은 끝났고 남자는 매일 오후 밴드 연습이 있으므로, 여자가 행정실에 전기 사용을 신청하기로 한다. 따라서 답은 ②이다.",
      translation: [
        "M: 소라야, 우리 축제 부스가 금요일 1시에 열어.",
        "W: 알아. 현수막은 다 했어?",
        "M: 오늘 아침에 부스 앞쪽 위에 달았어.",
        "W: 좋아. 물품은?",
        "M: 계단 밑 상자 두 개에 다 있어.",
        "W: 그럼 아직 빠진 게 뭐야?",
        "M: 전기 조리기를 두 대 쓰는데 전기 신청을 아무도 안 했어.",
        "W: 행정실에 신청하는 거야?",
        "M: 응, 수요일까지 서류를 내야 해.",
        "W: 수요일 전에 누가 시간이 돼?",
        "M: 나는 안 돼. 오후마다 밴드 연습이야.",
        "W: 그럼 내가 행정실에 가서 전기 신청할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Corner Stationery. What can I get for you?"],
        ["W", "Four notebooks and three folders, please."],
        ["M", "Notebooks are six dollars each and folders are eight."],
        ["W", "So twenty-four dollars for each kind."],
        ["M", "Forty-eight altogether. Would you like a pen set as well?"],
        ["W", "How much is the pen set?"],
        ["M", "Nine dollars, and it comes with a case."],
        ["W", "We'll leave the pens. The club already has plenty."],
        ["M", "That's fine. Is this for a school club?"],
        ["W", "Yes, here's the club card."],
        ["M", "Then I can take twenty-five percent off the notebooks, but not the folders."],
        ["W", "Thank you. I'll pay by card."],
      ],
      choices: ["$36.00", "$40.00", "$42.00", "$45.00", "$48.00"],
      answer: 3,
      clue: "Then I can take twenty-five percent off the notebooks, but not the folders.",
      explanation:
        "공책 4권 24달러에서 25퍼센트를 빼면 18달러이고, 할인이 안 되는 서류철 3개 24달러를 더하면 42달러이다. 따라서 답은 ③이다.",
      translation: [
        "M: 코너 문구점입니다. 무엇을 드릴까요?",
        "W: 공책 네 권이랑 서류철 세 개 주세요.",
        "M: 공책은 한 권에 6달러, 서류철은 8달러입니다.",
        "W: 그럼 종류마다 24달러네요.",
        "M: 모두 48달러입니다. 펜 세트도 하시겠어요?",
        "W: 펜 세트는 얼마예요?",
        "M: 9달러인데, 케이스가 같이 옵니다.",
        "W: 펜은 뺄게요. 동아리에 이미 많아요.",
        "M: 괜찮습니다. 학교 동아리에서 쓰시는 건가요?",
        "W: 네, 여기 동아리 카드요.",
        "M: 그럼 공책에서 25퍼센트를 빼 드립니다. 서류철은 안 돼요.",
        "W: 감사합니다. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 주말 봉사 활동에 가지 못하는 이유를 고르시오.",
      lines: [
        ["W", "Sangmin, you're not on the weekend volunteering list."],
        ["M", "I signed off it on Monday."],
        ["W", "Is it the early start? It's seven at the station."],
        ["M", "Seven is fine. I'm up at six anyway."],
        ["W", "Then is your family away?"],
        ["M", "No, they're all at home this weekend."],
        ["W", "So what happened?"],
        ["M", "Our club presentation moved to Monday morning."],
        ["W", "The whole thing? You've only made half the slides."],
        ["M", "Which is why my Saturday and Sunday are gone."],
      ],
      choices: [
        "동아리 발표 준비를 해야 해서",
        "아침에 일찍 일어나기 힘들어서",
        "가족 여행을 가서",
        "몸이 아파서",
        "교통편이 없어서",
      ],
      answer: 1,
      clue: "Our club presentation moved to Monday morning.",
      explanation:
        "이른 시간도 괜찮고 가족도 집에 있지만, 동아리 발표가 월요일 아침으로 옮겨져 주말 내내 준비해야 하기 때문이다. 따라서 답은 ①이다.",
      translation: [
        "W: 상민아, 주말 봉사 명단에 네가 없네.",
        "M: 월요일에 뺐어.",
        "W: 이른 시간 때문이야? 역에서 7시잖아.",
        "M: 7시는 괜찮아. 어차피 6시에 일어나.",
        "W: 그럼 가족이 어디 가?",
        "M: 아니, 이번 주말엔 다 집에 있어.",
        "W: 그럼 무슨 일인데?",
        "M: 동아리 발표가 월요일 아침으로 옮겨졌어.",
        "W: 전체가? 너 자료 반밖에 안 만들었잖아.",
        "M: 그래서 토요일 일요일이 다 날아간 거야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Riverbank Coding Camp에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Sangmin, have you read about the Riverbank Coding Camp?"],
        ["M", "I saw the poster. How long does it run?"],
        ["W", "Five days, the second week of the winter break."],
        ["M", "Five days. Where is it held?"],
        ["W", "In the media lab at the city youth centre."],
        ["M", "I can walk there. Do we bring anything?"],
        ["W", "A laptop if you have one, and a power cable."],
        ["M", "I have both. What does it cost?"],
        ["W", "Thirty thousand won, and lunch is included."],
        ["M", "That's reasonable. Let's apply together."],
        ["W", "The form closes at the end of this month."],
        ["M", "Then let's fill it in tomorrow."],
      ],
      choices: ["운영 기간", "장소", "준비물", "참가비", "수료증 발급"],
      answer: 5,
      clue: "수료증 발급은 대화에서 언급되지 않았다.",
      explanation:
        "기간(겨울 방학 둘째 주 닷새), 장소(시 청소년센터 미디어실), 준비물(노트북과 전원선), 참가비(3만 원)는 언급되지만 수료증 발급은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 상민아, 리버뱅크 코딩 캠프 봤어?",
        "M: 포스터 봤어. 며칠 해?",
        "W: 닷새, 겨울 방학 둘째 주에.",
        "M: 닷새구나. 어디서 해?",
        "W: 시 청소년센터 미디어실에서.",
        "M: 거긴 걸어갈 수 있어. 뭘 가져가?",
        "W: 노트북 있으면 노트북, 그리고 전원선.",
        "M: 둘 다 있어. 참가비는 얼마야?",
        "W: 3만 원. 점심 포함이야.",
        "M: 괜찮네. 같이 신청하자.",
        "W: 신청은 이번 달 말에 닫혀.",
        "M: 그럼 내일 쓰자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Stonefield Community Pool에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is some information about the Stonefield Community Pool. " +
            "It opened in 2005 and has six lanes and a separate shallow pool. " +
            "The pool is open all year and closes for two weeks in September for cleaning. " +
            "Lane swimming runs from six in the morning until nine at night. " +
            "Swimming caps must be worn by everyone in the water. " +
            "Lockers are free, but you need a coin to release the key. " +
            "Lessons for beginners are held on Saturday mornings only.",
        ],
      ],
      choices: [
        "2005년에 문을 열었다",
        "여름에만 운영한다",
        "수영모를 반드시 써야 한다",
        "사물함은 무료이다",
        "초보 강습은 토요일 오전에만 있다",
      ],
      answer: 2,
      clue: "The pool is open all year and closes for two weeks in September for cleaning.",
      explanation:
        "수영장은 일 년 내내 열고 9월에 2주만 닫는다고 했으므로 여름에만 운영한다는 ②는 내용과 다르다. 따라서 답은 ②이다.",
      translation: [
        "M: 스톤필드 주민 수영장을 안내해 드리겠습니다. 2005년에 문을 열었고 여섯 개 레인과 별도의 얕은 수영장이 있습니다. 일 년 내내 열고 청소를 위해 9월에 2주 동안 닫습니다. 레인 수영은 아침 6시부터 밤 9시까지 합니다. 물에 들어가는 사람은 모두 수영모를 써야 합니다. 사물함은 무료이지만 열쇠를 빼려면 동전이 필요합니다. 초보자 강습은 토요일 오전에만 있습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 구입할 녹음기를 고르시오.",
      lines: [
        ["W", "Sangmin, the broadcasting club needs a new recorder."],
        ["M", "Five models here. How long should it record for?"],
        ["W", "At least ten hours. We record the whole sports day."],
        ["M", "That rules out the short ones. What about weight?"],
        ["W", "Under two hundred grams. Someone carries it all afternoon."],
        ["M", "Agreed. And we were given ninety thousand won."],
        ["W", "So anything above ninety thousand is out."],
        ["M", "Then only one model clears all three."],
        ["W", "Let's order it before the club account closes."],
        ["M", "I'll order it tonight and print the receipt."],
        ["W", "Thanks. I'll book the charger from the office."],
        ["M", "It should be here by Thursday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "At least ten hours. We record the whole sports day.",
      explanation:
        "녹음 시간이 10시간 이상이고, 무게가 200그램 미만이며, 9만 원 이하인 것을 고른다. 세 조건을 모두 채우는 것은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Recording: 6 hours / Weight: 150 g / Price: 50,000 won" },
          { no: 2, label: "②", value: "Recording: 12 hours / Weight: 300 g / Price: 70,000 won" },
          { no: 3, label: "③", value: "Recording: 15 hours / Weight: 180 g / Price: 85,000 won" },
          { no: 4, label: "④", value: "Recording: 20 hours / Weight: 160 g / Price: 130,000 won" },
          { no: 5, label: "⑤", value: "Recording: 8 hours / Weight: 120 g / Price: 40,000 won" },
        ],
      },
      translation: [
        "W: 상민아, 방송 동아리에 녹음기가 새로 필요해.",
        "M: 다섯 종류 있네. 몇 시간 녹음돼야 해?",
        "W: 적어도 10시간. 체육대회를 통째로 녹음하잖아.",
        "M: 그럼 짧은 건 빠지네. 무게는?",
        "W: 200그램 미만. 누군가 오후 내내 들고 다녀.",
        "M: 동의해. 그리고 9만 원을 받았어.",
        "W: 그럼 9만 원 넘는 건 빠져.",
        "M: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "W: 동아리 계정이 닫히기 전에 주문하자.",
        "M: 오늘 밤에 주문하고 영수증 뽑을게.",
        "W: 고마워. 나는 행정실에서 충전기 빌려 둘게.",
        "M: 목요일까지는 올 거야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Minjun, does the museum bus leave from the front gate?"],
        ["M", "It used to, but they moved it to the side gate this year."],
        ["W", "What time does it leave?"],
        ["M", "Eight sharp. Be at the side gate by ten to."],
      ],
      choices: [
        "I'll wait at the front gate.",
        "The bus leaves at nine.",
        "I'm not going to the museum.",
        "I'll be at the side gate by ten to eight.",
        "There is no bus this year.",
      ],
      answer: 4,
      clue: "Eight sharp. Be at the side gate by ten to.",
      explanation:
        "남자가 8시 정각 출발이니 10분 전까지 옆문에 오라고 했으므로, 그렇게 하겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 민준아, 박물관 버스가 정문에서 출발해?",
        "M: 예전엔 그랬는데 올해는 옆문으로 옮겼어.",
        "W: 몇 시에 출발해?",
        "M: 8시 정각. 10분 전까지 옆문으로 와.",
        "W: 8시 10분 전까지 옆문으로 갈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Chaerin, my library book is three days overdue."],
        ["W", "Did you renew it online?"],
        ["M", "I didn't know you could do that."],
        ["W", "You can, twice. Renew it tonight before the fine grows."],
      ],
      choices: [
        "I'll renew it online tonight.",
        "I'll pay the fine next month.",
        "The book isn't overdue at all.",
        "I never borrow library books.",
        "I'll return it after the exams.",
      ],
      answer: 1,
      clue: "You can, twice. Renew it tonight before the fine grows.",
      explanation:
        "여자가 오늘 밤에 온라인으로 연장하라고 했으므로, 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 채린아, 도서관 책이 사흘 연체됐어.",
        "W: 온라인으로 연장했어?",
        "M: 그게 되는 줄 몰랐어.",
        "W: 두 번까지 돼. 연체료 불어나기 전에 오늘 밤에 연장해.",
        "M: 오늘 밤에 온라인으로 연장할게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangmin, you write a plan every morning, don't you?"],
        ["M", "Ten things. I finish about four."],
        ["W", "And how do you feel at eleven at night?"],
        ["M", "Like I failed, even on the days I worked hard."],
        ["W", "So the list is a machine for making you feel behind."],
        ["M", "I'd never thought of it as doing anything to me."],
        ["W", "How many of the ten actually mattered?"],
        ["M", "Three, usually. The rest are there to look thorough."],
        ["W", "Then write those three and stop."],
        ["M", "And if I finish early?"],
        ["W", "Then you finish early, which you haven't done all year."],
      ],
      choices: [
        "I'll write twelve items tomorrow.",
        "I'll write only three tomorrow.",
        "I'll stop planning altogether.",
        "I always finish my whole list.",
        "I'd rather keep a paper diary.",
      ],
      answer: 2,
      clue: "Then write those three and stop.",
      explanation:
        "여자가 정말 중요한 세 가지만 적고 멈추라고 했으므로, 내일은 세 개만 쓰겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 상민아, 너 아침마다 계획 쓰지?",
        "M: 열 개. 네 개쯤 끝내.",
        "W: 밤 11시엔 기분이 어때?",
        "M: 열심히 한 날에도 실패한 것 같아.",
        "W: 그럼 그 목록은 너를 뒤처진 기분으로 만드는 기계네.",
        "M: 그게 나한테 뭘 한다고는 생각 못 했어.",
        "W: 열 개 중에 진짜 중요한 건 몇 개야?",
        "M: 보통 세 개. 나머지는 꼼꼼해 보이려고 있어.",
        "W: 그럼 그 세 개만 쓰고 멈춰.",
        "M: 일찍 끝나면?",
        "W: 그럼 일찍 끝나는 거지. 올해 한 번도 못 해 본 일이잖아.",
        "M: 내일은 세 개만 쓸게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Sora, you've been on that one English article for half an hour."],
        ["W", "I'm only halfway down the first page."],
        ["M", "What's taking the time?"],
        ["W", "Every word I don't know, I stop and look up."],
        ["M", "How many have you looked up so far?"],
        ["W", "Twenty-two. I wrote them all down."],
        ["M", "And do you remember what the article is about?"],
        ["W", "Something about a harbour. I've lost the thread."],
        ["M", "That's the cost. Each stop throws away the sentence before it."],
        ["W", "But I can't read past a word I don't know."],
        ["M", "Read to the end of the paragraph first, then look up what still matters."],
      ],
      choices: [
        "I'll look up every word as before.",
        "I'll stop reading English articles.",
        "I already finish a page in five minutes.",
        "I'll finish the paragraph before looking anything up.",
        "I'll read it in Korean instead.",
      ],
      answer: 4,
      clue: "Read to the end of the paragraph first, then look up what still matters.",
      explanation:
        "남자가 문단 끝까지 읽고 나서 찾아보라고 했으므로, 문단을 끝내고 찾겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 소라야, 그 영어 기사 하나를 30분째 보고 있네.",
        "W: 첫 쪽 절반까지밖에 못 왔어.",
        "M: 뭐가 시간을 잡아먹는데?",
        "W: 모르는 단어마다 멈춰서 찾아.",
        "M: 지금까지 몇 개 찾았어?",
        "W: 스물두 개. 다 적어 뒀어.",
        "M: 그래서 기사가 무슨 내용인지는 기억나?",
        "W: 항구에 대한 뭔가. 흐름을 놓쳤어.",
        "M: 그게 값이야. 한 번 멈출 때마다 앞 문장이 버려져.",
        "W: 그런데 모르는 단어를 넘기고는 못 읽겠어.",
        "M: 문단 끝까지 먼저 읽고, 그다음에 그래도 중요한 것만 찾아.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Sea가 Minjae에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Sea : ________________",
      lines: [
        [
          "W",
          "Sea and Minjae lead the morning stretching session in the school gym. " +
            "Minjae stands at the front facing the students and shows each movement, " +
            "and Sea walks between the rows to help anyone who is lost. " +
            "This week she notices the same thing every morning. " +
            "When Minjae says to raise the right arm and raises his own, " +
            "he is facing the students, " +
            "so the arm they see going up is on their left, " +
            "and half the gym lifts the wrong arm and then looks around to check. " +
            "If he simply turned round and faced the same way as the students, " +
            "everything they copied would match. " +
            "She wants to tell him to face the same way as the students. " +
            "In this situation, what would Sea most likely say to Minjae?",
        ],
      ],
      choices: [
        "We should stop the stretching session.",
        "Let's move the session to the playground.",
        "We should hand out a printed sheet.",
        "Let's use a different set of stretches.",
        "Let's face the same way as the students.",
      ],
      answer: 5,
      clue: "She wants to tell him to face the same way as the students.",
      explanation:
        "세아는 학생들과 같은 쪽을 보고 동작을 보여 주자고 말하려 하므로 ⑤가 가장 적절하다.",
      translation: [
        "W: 세아와 민재는 학교 체육관에서 아침 스트레칭 시간을 이끕니다. 민재는 앞에서 학생들을 마주 보고 서서 동작을 하나씩 보여 주고, 세아는 줄 사이를 다니며 헤매는 학생을 도와줍니다. 이번 주에 세아는 아침마다 같은 것을 봅니다. 민재가 오른팔을 들라고 말하면서 자기 오른팔을 드는데, 학생들을 마주 보고 있으니 학생들 눈에는 그 팔이 왼쪽에서 올라갑니다. 그래서 체육관의 절반이 반대 팔을 들고는 주위를 둘러봅니다. 민재가 그냥 돌아서서 학생들과 같은 쪽을 보면, 학생들이 따라 하는 것이 그대로 맞아떨어집니다. 세아는 학생들과 같은 쪽을 보자고 말하고 싶습니다. 이런 상황에서 세아가 민재에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why your own voice " +
            "sounds wrong to you on a recording. " +
            "When you speak, the sound reaches your ears by two roads at once. " +
            "Part of it travels out through the air and back in, " +
            "and part of it travels straight through the bones of your skull. " +
            "Bone carries the low tones far better than air does, " +
            "so the voice you have listened to all your life is deeper and rounder " +
            "than the one anyone else hears. " +
            "A recording keeps only the road through the air. " +
            "That is why the playback sounds thin and unfamiliar, " +
            "and why almost everyone dislikes it at first. " +
            "The recording is not the odd one. It is the version the room has always heard.",
        ],
      ],
      choices: [
        "how microphones turn sound into electricity",
        "why your own voice sounds different on a recording",
        "why some rooms echo more than others",
        "how the ear protects itself from loud noise",
        "why people speak more loudly on the phone",
      ],
      answer: 2,
      clue: "When you speak, the sound reaches your ears by two roads at once.",
      explanation:
        "남자는 말할 때 소리가 공기와 두개골 두 길로 들어오는데 녹음은 공기 쪽만 남기기 때문이라고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 녹음된 자기 목소리가 왜 낯설게 들리는지 이야기하려 합니다. 말을 할 때 소리는 두 길로 한꺼번에 귀에 닿습니다. 일부는 공기를 타고 나갔다가 들어오고, 일부는 두개골 뼈를 타고 곧장 들어옵니다. 뼈는 낮은 음을 공기보다 훨씬 잘 전달합니다. 그래서 평생 들어 온 자기 목소리는 남들이 듣는 목소리보다 더 낮고 둥급니다. 녹음은 공기로 간 길만 남깁니다. 그래서 다시 들으면 얇고 낯설게 들리고, 거의 모두가 처음에는 싫어합니다. 이상한 쪽은 녹음이 아닙니다. 그것이 이 방이 늘 들어 온 판본입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about why your own voice sounds wrong to you on a recording."],
        ["M", "Part of it travels out through the air and back in, and part of it travels straight through the bones of your skull."],
        ["M", "Bone carries the low tones far better than air does."],
        ["M", "A recording keeps only the road through the air."],
        ["M", "That is why the playback sounds thin and unfamiliar, and why almost everyone dislikes it at first."],
      ],
      choices: [
        "sound reaching your ear through the bones of the skull",
        "bone carrying low tones better than air",
        "a recording keeping only the sound that travelled through air",
        "singers losing their voice after a long concert",
        "people disliking their own recorded voice at first",
      ],
      answer: 4,
      clue: "Bone carries the low tones far better than air does.",
      explanation:
        "두개골을 통해 소리가 들어온다는 것, 뼈가 낮은 음을 더 잘 전달한다는 것, 녹음이 공기로 간 길만 남긴다는 것, 처음에는 싫어한다는 것은 언급되지만 가수가 공연 뒤 목이 쉰다는 것은 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
