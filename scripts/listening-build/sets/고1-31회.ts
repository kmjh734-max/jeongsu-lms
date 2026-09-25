/** 고1 듣기 31회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 31회",
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
          "Good morning, everyone. This is Mr. Wi from the school office. " +
            "I want to talk about the bicycle shed by the back gate. " +
            "It holds sixty bikes, and at the moment forty of them have not moved since April. " +
            "Some belong to students who have left, and some are simply forgotten. " +
            "Students who cycle in now have nowhere to lock up. " +
            "So this Friday we will tie a yellow tag to every bike in the shed. " +
            "If your bike is yours and you use it, take the tag off. " +
            "Anything still tagged at the end of next month will be moved to the storeroom. " +
            "Nothing will be thrown away. Please check on Friday. Thank you.",
        ],
      ],
      choices: [
        "자전거 등록 방법을 안내하려고",
        "후문 출입을 통제한다고 알리려고",
        "자전거 도난 사고를 알리려고",
        "보관대 공사를 안내하려고",
        "자전거 보관대의 방치 자전거를 정리한다고 알리려고",
      ],
      answer: 5,
      clue: "So this Friday we will tie a yellow tag to every bike in the shed.",
      explanation:
        "남자는 자리가 없다며 금요일에 모든 자전거에 표를 달고, 다음 달 말까지 남아 있는 것은 창고로 옮긴다고 알린다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 여러분, 안녕하세요. 학교 행정실 위입니다. 후문 옆 자전거 보관대 이야기를 하려고 합니다. 예순 대가 들어가는데, 지금 그중 마흔 대가 4월부터 움직이지 않았습니다. 일부는 이미 떠난 학생 것이고, 일부는 그냥 잊힌 것입니다. 요즘 자전거를 타고 오는 학생들은 세워 둘 자리가 없습니다. 그래서 이번 주 금요일에 보관대의 모든 자전거에 노란 표를 답니다. 본인 자전거이고 쓰고 있다면 그 표를 떼어 주세요. 다음 달 말까지 표가 그대로 붙어 있는 것은 창고로 옮깁니다. 버리지는 않습니다. 금요일에 확인해 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaerin, I've been sleeping four hours to get more studying in."],
        ["W", "Four? How long have you kept that up?"],
        ["M", "Two weeks. I've added three hours a day."],
        ["W", "Added on paper. How many of those three are useful?"],
        ["M", "Honestly, I reread a lot. Things don't stick."],
        ["W", "Sleep is when the day's work gets filed."],
        ["M", "So I'm studying more and keeping less."],
        ["W", "You're doing both halves badly instead of one half well."],
        ["M", "But six hours feels like giving up three."],
        ["W", "Three hours of tired reading isn't three hours of anything."],
        ["M", "Then how much should I sleep?"],
        ["W", "Seven, and measure what you remember at the end of the week."],
      ],
      choices: [
        "공부는 아침에 해야 한다",
        "낮잠을 자야 한다",
        "잠을 줄여 공부 시간을 늘리면 오히려 남는 것이 적다",
        "공부 시간을 정해 두어야 한다",
        "복습은 그날 안에 해야 한다",
      ],
      answer: 3,
      clue: "Three hours of tired reading isn't three hours of anything.",
      explanation:
        "여자는 잠자는 동안 그날 공부가 정리된다며, 피곤한 세 시간은 세 시간이 아니라고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 채린아, 나 공부 시간을 늘리려고 네 시간만 자.",
        "W: 네 시간? 얼마나 그러고 있어?",
        "M: 2주. 하루에 세 시간을 더 벌었어.",
        "W: 종이 위에서는 늘었지. 그 세 시간 중 쓸모 있는 건 얼마야?",
        "M: 솔직히 다시 읽는 게 많아. 잘 안 남아.",
        "W: 잠은 그날 한 걸 정리해 넣는 시간이야.",
        "M: 그럼 더 공부하고 덜 남기는 거네.",
        "W: 한쪽을 잘하는 대신 양쪽을 다 못하는 거지.",
        "M: 그런데 여섯 시간 자면 세 시간을 포기하는 기분이야.",
        "W: 피곤하게 읽는 세 시간은 어떤 세 시간도 아니야.",
        "M: 그럼 몇 시간 자야 해?",
        "W: 일곱 시간. 그리고 주말에 뭐가 기억나는지 재 봐.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Every skill has a stage where progress stops being visible, " +
            "and almost everyone quits there. " +
            "At the beginning, each week looks different from the last. " +
            "Later, three months of work produce a change you can barely name, " +
            "even though it is real. " +
            "The mistake is to read the flat stretch as a message about ability. " +
            "It is not. It is what improvement looks like " +
            "once the easy gains have already been collected. " +
            "The people who get good are not the ones who never plateau. " +
            "They are the ones who keep going while nothing seems to be happening, " +
            "because they were warned that this part comes.",
        ],
      ],
      choices: [
        "실력이 느는 것이 안 보이는 구간을 견뎌야 한다",
        "재능이 있어야 실력이 는다",
        "연습은 매일 해야 한다",
        "목표를 낮게 잡아야 한다",
        "여러 가지를 함께 배워야 한다",
      ],
      answer: 1,
      clue: "They are the ones who keep going while nothing seems to be happening.",
      explanation:
        "여자는 평평한 구간이 능력에 대한 신호가 아니라 향상의 모습이라며, 그때 계속하는 사람이 잘하게 된다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 모든 기술에는 늘고 있는 것이 눈에 보이지 않게 되는 단계가 있고, 거의 모두가 거기서 그만둡니다. 처음에는 한 주가 지난주와 달라 보입니다. 나중에는 석 달을 해도 이름 붙이기 어려운 변화만 남습니다. 실제로는 있는 변화인데도요. 실수는 그 평평한 구간을 능력에 대한 전갈로 읽는 것입니다. 그렇지 않습니다. 쉬운 몫을 이미 거둬들인 뒤의 향상은 그렇게 생겼습니다. 잘하게 되는 사람은 정체를 겪지 않는 사람이 아닙니다. 아무 일도 일어나지 않는 것처럼 보이는 동안에도 계속하는 사람입니다. 이 구간이 온다는 것을 미리 들었기 때문입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Sora, is this the corner you set up for the tea club?"],
        ["W", "Yes, we finished it at the start of the term."],
        ["M", "There's an electric kettle at the left end of the counter."],
        ["W", "It's the only one that boils in under two minutes."],
        ["M", "And a shelf of tea tins runs along the wall."],
        ["W", "Eight kinds, and we rotate them every month."],
        ["M", "I count three teapots on the counter."],
        ["W", "There are four. One is behind the kettle."],
        ["M", "The wooden tray in the middle looks new."],
        ["W", "A member's father made it for us."],
        ["M", "And a round wall clock hangs above the shelf."],
        ["W", "Green tea is ruined if you go a minute over."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is behind the kettle.",
      explanation:
        "남자가 찻주전자가 세 개라고 하자 여자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A tea club counter drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "An ELECTRIC KETTLE stands at the left end of the counter. " +
          "A WALL SHELF holding tea tins runs along the wall above the counter. " +
          "EXACTLY THREE TEAPOTS stand on the counter, spaced well apart so all three are easy to count and none overlap. " +
          "A WOODEN TRAY sits in the middle of the counter. " +
          "A ROUND WALL CLOCK hangs on the wall above the shelf.",
      },
      translation: [
        "M: 소라야, 이게 차 동아리로 꾸민 구석이야?",
        "W: 응, 학기 초에 다 끝냈어.",
        "M: 조리대 왼쪽 끝에 전기 주전자가 있네.",
        "W: 2분 안에 끓는 건 그것뿐이야.",
        "M: 그리고 벽을 따라 차 통 선반이 있어.",
        "W: 여덟 종류. 달마다 바꿔 놔.",
        "M: 조리대에 찻주전자가 세 개 보여.",
        "W: 네 개야. 하나는 주전자 뒤에 있어.",
        "M: 가운데 나무 쟁반은 새것 같네.",
        "W: 부원 아버님이 만들어 주셨어.",
        "M: 그리고 선반 위에 둥근 벽시계가 걸려 있어.",
        "W: 녹차는 1분만 넘겨도 망쳐.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Sangmin, the science fair opens at eleven in the gym."],
        ["M", "I know. Are the poster boards up?"],
        ["W", "All fourteen, along the side wall. I did them this morning."],
        ["M", "Good. And the judging forms?"],
        ["W", "Printed and clipped to boards, one for each judge."],
        ["M", "Then what's still open?"],
        ["W", "The extension lead for the three experiments hasn't been found."],
        ["M", "Is there one in the science storeroom?"],
        ["W", "Two, but the teacher has to unlock it."],
        ["M", "Which teacher is on duty?"],
        ["W", "Ms. Hyun, until ten thirty. But I'm briefing the judges at ten."],
        ["M", "Then I'll get the extension lead from the storeroom."],
      ],
      choices: [
        "게시판 설치하기",
        "연장선 받아 오기",
        "심사표 인쇄하기",
        "심사위원에게 설명하기",
        "체육관 청소하기",
      ],
      answer: 2,
      clue: "Then I'll get the extension lead from the storeroom.",
      explanation:
        "게시판과 심사표는 끝났고 여자는 심사위원에게 설명해야 하므로, 남자가 창고에서 연장선을 받아 오기로 한다. 따라서 답은 ②이다.",
      translation: [
        "W: 상민아, 과학 전시회가 11시에 체육관에서 열려.",
        "M: 알아. 게시판은 세웠어?",
        "W: 열네 개 다, 옆벽을 따라. 오늘 아침에 했어.",
        "M: 좋아. 심사표는?",
        "W: 인쇄해서 판에 끼웠어. 심사위원마다 한 장씩.",
        "M: 그럼 아직 남은 게 뭐야?",
        "W: 실험 세 개에 쓸 연장선을 못 찾았어.",
        "M: 과학 창고에 있어?",
        "W: 두 개 있어. 그런데 선생님이 열어 주셔야 해.",
        "M: 어느 선생님이 당번이야?",
        "W: 현 선생님이 10시 30분까지. 그런데 나는 10시에 심사위원께 설명해야 해.",
        "M: 그럼 내가 창고에서 연장선 받아 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Brightside Bookshop. What can I get you?"],
        ["W", "Six workbooks and three dictionaries, please."],
        ["M", "Workbooks are fifteen dollars each and dictionaries are twenty."],
        ["W", "So ninety dollars plus sixty."],
        ["M", "One hundred and fifty in total. Would you like book covers?"],
        ["W", "How much are the covers?"],
        ["M", "Two dollars each, and you'd want nine."],
        ["W", "We'll skip the covers. The school gives them out."],
        ["M", "No problem. Are you buying for a class?"],
        ["W", "Yes, here's the school card."],
        ["M", "Then I can take twenty percent off the workbooks, but not the dictionaries."],
        ["W", "Thank you. I'll pay by card."],
      ],
      choices: ["$120.00", "$138.00", "$150.00", "$168.00", "$132.00"],
      answer: 5,
      clue: "Then I can take twenty percent off the workbooks, but not the dictionaries.",
      explanation:
        "문제집 6권 90달러에서 20퍼센트를 빼면 72달러이고, 할인이 안 되는 사전 3권 60달러를 더하면 132달러이다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 브라이트사이드 서점입니다. 무엇을 드릴까요?",
        "W: 문제집 여섯 권이랑 사전 세 권 주세요.",
        "M: 문제집은 한 권에 15달러, 사전은 20달러입니다.",
        "W: 그럼 90달러에 60달러네요.",
        "M: 모두 150달러입니다. 책 커버도 하시겠어요?",
        "W: 커버는 얼마예요?",
        "M: 하나에 2달러인데, 아홉 개는 필요하실 거예요.",
        "W: 커버는 뺄게요. 학교에서 나눠 줘요.",
        "M: 괜찮습니다. 학급에서 쓰시는 건가요?",
        "W: 네, 여기 학교 카드요.",
        "M: 그럼 문제집에서 20퍼센트를 빼 드립니다. 사전은 안 돼요.",
        "W: 감사합니다. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 미술 대회에 나가지 않는 이유를 고르시오.",
      lines: [
        ["M", "Chaerin, your name isn't on the art contest list."],
        ["W", "I took it off on Tuesday."],
        ["M", "Did the painting not turn out?"],
        ["W", "It's the best thing I've done this year."],
        ["M", "Then is it the entry fee? It went up again."],
        ["W", "The club covers it for members."],
        ["M", "So what stopped you?"],
        ["W", "The contest is the same day as the school orchestra concert."],
        ["M", "And you're playing in that?"],
        ["W", "First violin. They'd have to find someone in three days."],
      ],
      choices: [
        "그림이 마음에 들지 않아서",
        "출품비가 올라서",
        "같은 날 연주회가 있어서",
        "손을 다쳐서",
        "가족 여행을 가서",
      ],
      answer: 3,
      clue: "The contest is the same day as the school orchestra concert.",
      explanation:
        "그림도 잘 나왔고 출품비도 동아리가 내 주지만, 대회 날에 학교 오케스트라 연주회가 있고 제1바이올린을 맡고 있기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "M: 채린아, 미술 대회 명단에 네 이름이 없네.",
        "W: 화요일에 뺐어.",
        "M: 그림이 잘 안 나왔어?",
        "W: 올해 그린 것 중에 제일 잘 나왔어.",
        "M: 그럼 출품비 때문이야? 또 올랐잖아.",
        "W: 회원은 동아리에서 내 줘.",
        "M: 그럼 뭐가 걸렸는데?",
        "W: 대회 날이 학교 오케스트라 연주회랑 같아.",
        "M: 너 거기서 연주해?",
        "W: 제1바이올린. 사흘 만에 대신할 사람을 찾아야 할 거야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Pinewood Winter Camp에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Chaerin, have you looked at the Pinewood Winter Camp?"],
        ["W", "I saw the leaflet. When is it?"],
        ["M", "Three days, the ninth to the eleventh of January."],
        ["W", "Three days. Where is it held?"],
        ["M", "At the youth centre up by the reservoir."],
        ["W", "I've been there once. What do they do?"],
        ["M", "Team games in the morning, workshops in the afternoon."],
        ["W", "That's a good balance. Do we need to bring anything?"],
        ["M", "A sleeping bag and indoor shoes. They provide the rest."],
        ["W", "How much does it cost?"],
        ["M", "Fifty thousand won, with all meals included."],
        ["W", "Then let's apply this week."],
      ],
      choices: ["정원", "운영 기간", "장소", "활동 내용", "준비물"],
      answer: 1,
      clue: "정원은 대화에서 언급되지 않았다.",
      explanation:
        "기간(1월 9일부터 11일까지), 장소(저수지 위 청소년 수련관), 활동(오전 팀 게임과 오후 워크숍), 준비물(침낭과 실내화)은 언급되지만 정원은 언급되지 않았다. 따라서 답은 ①이다.",
      translation: [
        "M: 채린아, 파인우드 겨울 캠프 봤어?",
        "W: 안내지 봤어. 언제야?",
        "M: 사흘, 1월 9일부터 11일까지.",
        "W: 사흘이구나. 어디서 해?",
        "M: 저수지 위 청소년 수련관에서.",
        "W: 거기 한 번 가 봤어. 뭘 하는데?",
        "M: 오전엔 팀 게임, 오후엔 워크숍.",
        "W: 균형이 좋네. 뭘 가져가야 해?",
        "M: 침낭이랑 실내화. 나머지는 다 준대.",
        "W: 비용은 얼마야?",
        "M: 5만 원. 식사 전부 포함이야.",
        "W: 그럼 이번 주에 신청하자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Clearbrook Skate Rink에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Clearbrook Skate Rink. " +
            "It opened in 2011 and is the only outdoor rink in the district. " +
            "The rink runs from the first of December to the end of February. " +
            "Sessions are two hours long, starting on the hour from ten until eight. " +
            "Skates are rented at the booth for five thousand won a session. " +
            "Helmets are required for skaters under fourteen and are lent free of charge. " +
            "The rink closes whenever the temperature rises above eight degrees.",
        ],
      ],
      choices: [
        "2011년에 문을 열었다",
        "12월부터 2월까지 운영한다",
        "한 회차가 두 시간이다",
        "헬멧을 돈을 내고 빌린다",
        "기온이 높으면 문을 닫는다",
      ],
      answer: 4,
      clue: "Helmets are required for skaters under fourteen and are lent free of charge.",
      explanation:
        "헬멧은 무료로 빌려준다고 했으므로 돈을 내고 빌린다는 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "W: 클리어브룩 야외 빙상장을 소개해 드리겠습니다. 2011년에 문을 열었고 이 구에서 유일한 야외 빙상장입니다. 12월 1일부터 2월 말까지 운영합니다. 한 회차는 두 시간이고 10시부터 8시까지 매시 정각에 시작합니다. 스케이트는 매표소에서 한 회차에 5천 원에 빌립니다. 열네 살 미만은 헬멧을 써야 하며 무료로 빌려줍니다. 기온이 8도를 넘으면 문을 닫습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 구입할 블루투스 스피커를 고르시오.",
      lines: [
        ["M", "Chaerin, let's buy a speaker for the club room."],
        ["W", "Five models here. How long should the battery last?"],
        ["M", "At least eight hours. Our sessions run all afternoon."],
        ["W", "That rules out the short ones. Does it need to be waterproof?"],
        ["M", "Yes. We take it to the field on sports day."],
        ["W", "Agreed. And the price? The fund left us eighty thousand won."],
        ["M", "So eighty thousand is the ceiling."],
        ["W", "Then only one model clears all three."],
        ["M", "Let's order before the fund closes on Friday."],
        ["W", "I'll place it tonight and forward the receipt."],
        ["M", "Thanks. I'll clear a shelf for it."],
        ["W", "It should arrive by Wednesday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "At least eight hours. Our sessions run all afternoon.",
      explanation:
        "배터리가 8시간 이상이고, 방수가 되며, 8만 원 이하인 것을 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Battery: 5 hours / Waterproof: Yes / Price: 45,000 won" },
          { no: 2, label: "②", value: "Battery: 9 hours / Waterproof: Yes / Price: 72,000 won" },
          { no: 3, label: "③", value: "Battery: 12 hours / Waterproof: No / Price: 55,000 won" },
          { no: 4, label: "④", value: "Battery: 10 hours / Waterproof: Yes / Price: 120,000 won" },
          { no: 5, label: "⑤", value: "Battery: 6 hours / Waterproof: No / Price: 30,000 won" },
        ],
      },
      translation: [
        "M: 채린아, 동아리방에 둘 스피커 사자.",
        "W: 다섯 종류 있네. 배터리가 얼마나 가야 해?",
        "M: 적어도 8시간. 우리 모임은 오후 내내 하잖아.",
        "W: 그럼 짧은 건 빠지네. 방수가 돼야 해?",
        "M: 응. 체육대회 때 운동장에 들고 가잖아.",
        "W: 동의해. 값은? 예산에서 8만 원 남았어.",
        "M: 그럼 8만 원이 한계네.",
        "W: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "M: 금요일에 예산 마감이니까 그전에 주문하자.",
        "W: 오늘 밤에 주문하고 영수증 보낼게.",
        "M: 고마워. 나는 선반 자리 치워 둘게.",
        "W: 수요일까지는 올 거야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Sangmin, is the gym open before school tomorrow?"],
        ["M", "It is, from seven, but you need to sign in at the office first."],
        ["W", "The office doesn't open until eight, does it?"],
        ["M", "The side window is open from seven. Sign in there."],
      ],
      choices: [
        "The gym opens at eight.",
        "I don't go to the gym.",
        "The office is closed all day.",
        "I'll come after school instead.",
        "I'll sign in at the side window.",
      ],
      answer: 5,
      clue: "The side window is open from seven. Sign in there.",
      explanation:
        "남자가 7시부터 열리는 옆 창구에서 등록하라고 했으므로, 거기서 하겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "W: 상민아, 내일 등교 전에 체육관 열어?",
        "M: 열어. 7시부터. 그런데 먼저 사무실에서 등록해야 해.",
        "W: 사무실은 8시에 열지 않아?",
        "M: 옆 창구는 7시부터 열어. 거기서 등록해.",
        "W: 옆 창구에서 등록할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Sora, my school email won't let me attach anything."],
        ["W", "How big is the file you're attaching?"],
        ["M", "Forty megabytes. It's a video of the experiment."],
        ["W", "Email caps at twenty. Upload it to the shared drive and send the link."],
      ],
      choices: [
        "My attachment worked fine.",
        "I don't have a school email.",
        "I'll upload it and send a link.",
        "The file is only two megabytes.",
        "I'll record the video again.",
      ],
      answer: 3,
      clue: "Email caps at twenty. Upload it to the shared drive and send the link.",
      explanation:
        "여자가 공유 드라이브에 올리고 링크를 보내라고 했으므로, 그렇게 하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 소라야, 학교 메일에 파일이 안 붙어.",
        "W: 붙이는 파일이 얼마나 커?",
        "M: 40메가바이트. 실험 영상이야.",
        "W: 메일은 20까지야. 공유 드라이브에 올리고 링크를 보내.",
        "M: 올리고 링크 보낼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangmin, you've been sitting out of the club discussions."],
        ["M", "Everyone there speaks so quickly."],
        ["W", "Do you have things you want to say?"],
        ["M", "Usually. By the time I've made the sentence, the topic has moved."],
        ["W", "So the problem is the timing, not the thinking."],
        ["M", "I'd never separated those two."],
        ["W", "Most people would just hold the point and use it later."],
        ["M", "Even if we're already on the next thing?"],
        ["W", "Especially then. Say, going back to the earlier point."],
        ["M", "That's a whole sentence I never knew I could use."],
        ["W", "Use it once on Thursday and see what happens."],
      ],
      choices: [
        "I'll try it on Thursday.",
        "I'll keep quiet from now on.",
        "I never have anything to say.",
        "The discussions are too slow.",
        "I'd rather leave the club.",
      ],
      answer: 1,
      clue: "Use it once on Thursday and see what happens.",
      explanation:
        "여자가 목요일에 한 번 써 보라고 했으므로, 목요일에 해 보겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 상민아, 너 동아리 토론에서 빠져 있더라.",
        "M: 다들 말이 너무 빨라서.",
        "W: 하고 싶은 말은 있어?",
        "M: 보통 있어. 문장을 다 만들고 나면 화제가 넘어가 있어.",
        "W: 그럼 문제는 생각이 아니라 타이밍이네.",
        "M: 그 둘을 나눠 본 적이 없어.",
        "W: 대부분은 그 말을 쥐고 있다가 나중에 써.",
        "M: 이미 다음 이야기로 넘어갔는데도?",
        "W: 그때 특히. '아까 이야기로 돌아가면'이라고 하면 돼.",
        "M: 쓸 수 있는 줄도 몰랐던 문장이네.",
        "W: 목요일에 한 번 써 보고 어떻게 되는지 봐.",
        "M: 목요일에 해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaerin, you've been reading the same page of notes all week."],
        ["W", "I want to have it completely memorized."],
        ["M", "How do you check whether you have?"],
        ["W", "I read it and it feels familiar."],
        ["M", "Familiar is what reading produces. It isn't the same as memorized."],
        ["W", "Then what would actually test it?"],
        ["M", "Cover the page and say it out loud."],
        ["W", "That would be embarrassing, even alone."],
        ["M", "Only for the first thirty seconds."],
        ["W", "And after that?"],
        ["M", "After that you know exactly which three lines are missing."],
      ],
      choices: [
        "I'll read it twice more.",
        "The page is already memorized.",
        "I never read my notes.",
        "I'll cover it and say it tonight.",
        "I'd rather skip that page.",
      ],
      answer: 4,
      clue: "After that you know exactly which three lines are missing.",
      explanation:
        "남자가 쪽을 덮고 소리 내어 말해 보라고 했으므로, 오늘 밤 덮고 말해 보겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 채린아, 일주일 내내 같은 필기 한 쪽을 읽고 있네.",
        "W: 완전히 외우고 싶어서.",
        "M: 외웠는지는 어떻게 확인해?",
        "W: 읽어 보면 익숙해.",
        "M: 익숙함은 읽기가 만들어 내는 거야. 외운 것과는 달라.",
        "W: 그럼 뭐가 진짜 시험이 돼?",
        "M: 쪽을 덮고 소리 내어 말해 봐.",
        "W: 혼자여도 부끄러울 것 같은데.",
        "M: 처음 30초만 그래.",
        "W: 그다음엔?",
        "M: 그다음엔 어느 세 줄이 빠졌는지 정확히 알게 돼.",
        "W: 오늘 밤에 덮고 말해 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Seoyeon이 Junhyuk에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Seoyeon : ________________",
      lines: [
        [
          "W",
          "Seoyeon and Junhyuk are running the school's lost property day on Friday. " +
            "Junhyuk has laid out four hundred items on tables in the front hall " +
            "and grouped them by the month they were handed in, " +
            "which took him two afternoons and is neatly done. " +
            "On Wednesday Seoyeon watches a few students look for things " +
            "and sees that nobody knows which month they lost something in, " +
            "so each one walks the whole length of every table. " +
            "Grouping by kind instead, one table for bottles, one for clothing, one for keys, " +
            "would take about an hour and the tables are already in place. " +
            "She does not want him to think the sorting was wasted. " +
            "She wants to tell him to regroup the items by kind instead of by month. " +
            "In this situation, what would Seoyeon most likely say to Junhyuk?",
        ],
      ],
      choices: [
        "We should throw away the oldest items.",
        "Let's regroup everything by kind instead of month.",
        "Let's hold the lost property day next week.",
        "We should add two more tables.",
        "Let's ask students which month they lost things.",
      ],
      answer: 2,
      clue: "She wants to tell him to regroup the items by kind instead of by month.",
      explanation:
        "서연이는 물건을 달별이 아니라 종류별로 다시 묶자고 말하려 하므로 ②가 가장 적절하다.",
      translation: [
        "W: 서연이와 준혁이는 금요일에 여는 학교 분실물의 날을 맡고 있습니다. 준혁이는 물건 사백 개를 중앙 현관 탁자에 늘어놓고 들어온 달별로 묶었는데, 오후 이틀이 걸렸고 정리도 깔끔합니다. 수요일에 서연이는 학생 몇 명이 물건을 찾는 것을 보다가, 자기가 몇 월에 잃어버렸는지 아는 사람이 아무도 없어서 저마다 탁자를 처음부터 끝까지 훑고 있다는 것을 알게 됩니다. 대신 종류별로, 물병 탁자 하나, 옷 탁자 하나, 열쇠 탁자 하나로 묶으면 한 시간쯤이면 되고 탁자는 이미 놓여 있습니다. 서연이는 준혁이의 정리가 헛되었다고 여기게 하고 싶지 않습니다. 서연이는 물건을 달별이 아니라 종류별로 다시 묶자고 말하고 싶습니다. 이런 상황에서 서연이가 준혁이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why a pot of water " +
            "stays at the same temperature no matter how high you turn the heat. " +
            "Once water reaches a hundred degrees, extra energy does not raise the temperature. " +
            "It goes into breaking the bonds that hold the liquid together, " +
            "turning water into steam. " +
            "The thermometer sits still while the pot empties faster. " +
            "This is why food does not cook any quicker on a furious boil than on a gentle one, " +
            "and why the only thing a high flame buys you is a kitchen full of steam. " +
            "It also explains why a sealed pressure cooker is different. " +
            "Trapping the steam raises the pressure, " +
            "and under higher pressure water can climb past a hundred before it boils.",
        ],
      ],
      choices: [
        "how steam is used to drive a turbine",
        "why metal pots heat faster than glass ones",
        "how thermometers are made accurate",
        "why food tastes better when boiled slowly",
        "why boiling water stays at the same temperature",
      ],
      answer: 5,
      clue: "Once water reaches a hundred degrees, extra energy does not raise the temperature.",
      explanation:
        "여자는 끓는 물에 들어간 여분의 에너지가 온도를 올리지 않고 증기로 바꾸는 데 쓰인다고 설명한다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 냄비의 물이 불을 아무리 세게 올려도 왜 같은 온도에 머무는지 이야기하려 합니다. 물이 100도에 닿고 나면, 더 들어가는 에너지는 온도를 올리지 않습니다. 액체를 붙들고 있는 결합을 끊는 데 쓰여 물을 증기로 바꿉니다. 온도계는 가만히 있고 냄비만 더 빨리 비어 갑니다. 그래서 펄펄 끓여도 잔잔히 끓일 때보다 음식이 빨리 익지 않고, 센 불이 사 주는 것은 증기로 가득한 부엌뿐입니다. 이것은 밀폐된 압력솥이 왜 다른지도 설명해 줍니다. 증기를 가두면 압력이 올라가고, 높은 압력에서는 물이 끓기 전에 100도를 넘어설 수 있습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Hello, everyone. Today I want to talk about why a pot of water stays at the same temperature no matter how high you turn the heat."],
        ["W", "Once water reaches a hundred degrees, extra energy does not raise the temperature."],
        ["W", "It goes into breaking the bonds that hold the liquid together, turning water into steam."],
        ["W", "This is why food does not cook any quicker on a furious boil than on a gentle one."],
        ["W", "It also explains why a sealed pressure cooker is different."],
        ["W", "Trapping the steam raises the pressure, and under higher pressure water can climb past a hundred before it boils."],
      ],
      choices: [
        "extra energy not raising the temperature",
        "energy breaking the bonds in the liquid",
        "salt raising the boiling point of water",
        "food not cooking faster on a furious boil",
        "a pressure cooker trapping the steam",
      ],
      answer: 3,
      clue: "Once water reaches a hundred degrees, extra energy does not raise the temperature.",
      explanation:
        "여분의 에너지가 온도를 올리지 않는다는 것, 그 에너지가 결합을 끊는다는 것, 센 불에서도 음식이 빨리 익지 않는다는 것, 압력솥이 증기를 가둔다는 것은 언급되지만 소금이 끓는점을 올린다는 것은 언급되지 않았다. 따라서 답은 ③이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
