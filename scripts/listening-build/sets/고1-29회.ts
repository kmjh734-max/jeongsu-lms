/** 고1 듣기 29회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 29회",
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
          "Good morning, everyone. This is Mr. Ha from the science department. " +
            "I want to talk about the lab coats in the preparation room. " +
            "We have forty of them, washed at the start of every term. " +
            "By October we usually have about fifteen left on the rail, " +
            "because coats go home in bags and never come back. " +
            "Nobody is taking them on purpose. They just end up in a locker and stay there. " +
            "So this Friday we will put a basket outside the lab door. " +
            "Bring back any coat you have, with no questions and no names taken. " +
            "After Friday we will start charging for the missing ones. " +
            "Please check your locker tonight. Thank you.",
        ],
      ],
      choices: [
        "실험복을 금요일까지 돌려 달라고 부탁하려고",
        "실험복 구입 방법을 안내하려고",
        "실험실 사용 규칙을 알리려고",
        "실험복 세탁 일정을 알리려고",
        "사물함 점검을 알리려고",
      ],
      answer: 1,
      clue: "Bring back any coat you have, with no questions and no names taken.",
      explanation:
        "남자는 실험복이 돌아오지 않는다며 금요일에 바구니를 둘 테니 가져온 것을 돌려 달라고 부탁한다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 과학부 하입니다. 준비실에 있는 실험복 이야기를 하려고 합니다. 실험복이 마흔 벌 있고 학기 초마다 세탁합니다. 그런데 10월쯤 되면 걸이에 열다섯 벌쯤 남습니다. 실험복이 가방에 담겨 집으로 가고 돌아오지 않기 때문입니다. 일부러 가져가는 사람은 없습니다. 그저 사물함에 들어갔다가 거기 머무는 것이지요. 그래서 이번 주 금요일에 실험실 문 밖에 바구니를 두겠습니다. 갖고 있는 실험복을 아무것도 묻지 않고 이름도 적지 않은 채로 돌려주세요. 금요일이 지나면 없어진 것에 대해 값을 받기 시작합니다. 오늘 밤 사물함을 확인해 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Yerin, I've been studying with six tabs of notes open at once."],
        ["W", "Six? How do you move between them?"],
        ["M", "I click across whenever something reminds me of another subject."],
        ["W", "And how long do you stay in one tab?"],
        ["M", "A few minutes, maybe less."],
        ["W", "So you never get past the surface of anything."],
        ["M", "But the subjects connect. That's why I jump."],
        ["W", "Connecting happens after you've gone deep, not instead of it."],
        ["M", "I thought I was making links."],
        ["W", "You were making visits. A link needs two things you actually know."],
        ["M", "So I should close five of the six."],
        ["W", "Close five. Stay in one until it gets uncomfortable, then stay longer."],
      ],
      choices: [
        "여러 과목을 번갈아 봐야 한다",
        "필기는 한곳에 모아야 한다",
        "공부는 종이로 해야 한다",
        "한 과목에 오래 머물러야 깊이 배운다",
        "쉬는 시간을 자주 가져야 한다",
      ],
      answer: 4,
      clue: "Close five. Stay in one until it gets uncomfortable, then stay longer.",
      explanation:
        "여자는 오가는 것은 연결이 아니라 방문일 뿐이라며, 하나에 불편해질 때까지 머물라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "M: 예린아, 나 필기 창을 여섯 개 열어 놓고 공부해.",
        "W: 여섯 개? 어떻게 오가는데?",
        "M: 뭔가 다른 과목이 떠오르면 그쪽으로 눌러.",
        "W: 한 창에 얼마나 머물러?",
        "M: 몇 분. 더 짧을 수도.",
        "W: 그럼 아무것도 표면을 넘어가지 못하겠네.",
        "M: 그런데 과목들이 이어져 있잖아. 그래서 옮기는 거야.",
        "W: 연결은 깊이 들어간 다음에 생겨. 그걸 대신하는 게 아니라.",
        "M: 나는 연결을 만들고 있다고 생각했어.",
        "W: 방문을 하고 있었던 거지. 연결은 네가 실제로 아는 두 가지가 있어야 생겨.",
        "M: 그럼 여섯 개 중 다섯 개를 닫아야겠네.",
        "W: 다섯 개 닫아. 하나에 불편해질 때까지 머물고, 그다음에 더 머물러.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Think about what happens when you ask someone for feedback on your work. " +
            "You hand it over and say, what do you think. " +
            "That question puts the reader in the position of a judge, " +
            "and a polite judge says it was good. " +
            "You learn nothing, and both of you feel the conversation went fine. " +
            "Now change the question. " +
            "Ask where they got confused, or which part they would cut if they had to cut one. " +
            "Neither of those can be answered with praise. " +
            "They require the reader to point at a place, " +
            "and a place is something you can work on. " +
            "The quality of feedback you get is mostly decided " +
            "before the other person has read a single line.",
        ],
      ],
      choices: [
        "비판은 솔직하게 해야 한다",
        "글은 여러 사람에게 보여야 한다",
        "칭찬도 도움이 된다",
        "피드백은 질문을 구체적으로 해야 얻는다",
        "피드백은 빨리 받아야 한다",
      ],
      answer: 4,
      clue: "The quality of feedback you get is mostly decided before the other person has read a single line.",
      explanation:
        "여자는 '어때?'라는 물음은 칭찬만 부른다며, 어디서 막혔는지처럼 자리를 가리키게 하는 질문을 하라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "W: 자기 작업에 대해 누군가에게 의견을 구할 때 무슨 일이 일어나는지 생각해 보세요. 그것을 건네며 어떠냐고 묻습니다. 그 질문은 읽는 사람을 심사자 자리에 앉히고, 예의 바른 심사자는 좋았다고 말합니다. 여러분은 아무것도 얻지 못하고, 둘 다 대화가 잘 끝났다고 느낍니다. 이제 질문을 바꿔 보세요. 어디서 헷갈렸는지, 하나를 꼭 덜어내야 한다면 어느 부분을 덜겠는지 물어보세요. 둘 다 칭찬으로는 답할 수 없습니다. 읽는 사람이 어떤 자리를 가리켜야 하고, 자리는 손볼 수 있는 것입니다. 여러분이 받는 의견의 질은 상대가 한 줄도 읽기 전에 대부분 정해집니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Minhyuk, is this the stall your class ran at the flea market?"],
        ["M", "Yes, we sold second-hand clothes all morning."],
        ["W", "There's a clothes rail standing behind the table."],
        ["M", "We borrowed it from the drama club."],
        ["W", "And a mirror leans against the left end of the table."],
        ["M", "People wouldn't buy anything without one."],
        ["W", "I count three cardboard boxes under the table."],
        ["M", "There are four. One is behind the chair."],
        ["W", "The folding chair looks like the ones from the gym."],
        ["M", "It is. I carried it across myself."],
        ["W", "And a money tin sits at the right end of the table."],
        ["M", "We counted it twice before we packed up."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is behind the chair.",
      explanation:
        "여자가 상자가 세 개라고 하자 남자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A flea market clothes stall drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A CLOTHES RAIL hung with shirts stands behind a long table. " +
          "A TALL MIRROR leans against the left end of the table. " +
          "EXACTLY THREE CARDBOARD BOXES sit on the ground under the table, spaced well apart so all three are easy to count and none overlap. " +
          "A FOLDING CHAIR stands behind the table. " +
          "A MONEY TIN sits at the right end of the table.",
      },
      translation: [
        "W: 민혁아, 이게 너희 반이 벼룩시장에서 한 가게야?",
        "M: 응, 오전 내내 헌 옷을 팔았어.",
        "W: 탁자 뒤에 옷걸이 봉이 서 있네.",
        "M: 연극 동아리에서 빌렸어.",
        "W: 그리고 탁자 왼쪽 끝에 거울이 기대어 있어.",
        "M: 거울 없으면 아무도 안 사.",
        "W: 탁자 밑에 종이 상자가 세 개 보여.",
        "M: 네 개야. 하나는 의자 뒤에 있어.",
        "W: 접이의자는 체육관에 있는 것 같네.",
        "M: 맞아. 내가 직접 들고 왔어.",
        "W: 그리고 탁자 오른쪽 끝에 돈통이 있어.",
        "M: 정리하기 전에 두 번 세어 봤어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Yerin, the reading festival opens at two in the library."],
        ["W", "I know. Are the display tables laid out?"],
        ["M", "All eight, and the books are sorted by theme."],
        ["W", "Good. And the bookmarks we're giving away?"],
        ["M", "Cut and boxed. Three hundred of them."],
        ["W", "Then what's still open?"],
        ["M", "The author who's coming at three has no water or chair on the stage."],
        ["W", "Where's the good chair kept?"],
        ["M", "In the teachers' lounge, and it needs carrying down one floor."],
        ["W", "Can't you take it? It's only one flight."],
        ["M", "I have to open the doors and count people in at two."],
        ["W", "Then I'll bring the chair and water to the stage."],
      ],
      choices: [
        "책 분류하기",
        "책갈피 자르기",
        "의자와 물 가져오기",
        "입장 인원 세기",
        "작가 맞이하기",
      ],
      answer: 3,
      clue: "Then I'll bring the chair and water to the stage.",
      explanation:
        "탁자와 책갈피는 끝났고 남자는 입장 인원을 세야 하므로, 여자가 무대에 의자와 물을 가져오기로 한다. 따라서 답은 ③이다.",
      translation: [
        "M: 예린아, 독서 축제가 2시에 도서관에서 열려.",
        "W: 알아. 전시 탁자는 놓았어?",
        "M: 여덟 개 다. 책도 주제별로 나눴어.",
        "W: 좋아. 나눠 줄 책갈피는?",
        "M: 잘라서 상자에 담았어. 삼백 장.",
        "W: 그럼 아직 남은 게 뭐야?",
        "M: 3시에 오시는 작가님 자리에 물도 의자도 없어.",
        "W: 좋은 의자는 어디 있어?",
        "M: 교사 휴게실에. 한 층 들고 내려와야 해.",
        "W: 네가 가져오면 안 돼? 한 층인데.",
        "M: 나는 2시에 문 열고 들어오는 사람을 세야 해.",
        "W: 그럼 내가 무대에 의자랑 물 가져다 놓을게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to Cedar Craft Shop. What can I get you?"],
        ["M", "Five sketch pads and four sets of brushes, please."],
        ["W", "Sketch pads are nine dollars each and brush sets are fourteen."],
        ["M", "So forty-five dollars plus fifty-six."],
        ["W", "One hundred and one in total. Would you like the palettes as well?"],
        ["M", "How much are the palettes?"],
        ["W", "Seven dollars each, and you'd want four."],
        ["M", "We'll skip the palettes. We use old plates."],
        ["W", "No problem. Are you with a school club?"],
        ["M", "We are. Here's our card."],
        ["W", "Then I can take twenty-five percent off the brush sets, but not the pads."],
        ["M", "Thank you. I'll pay by card."],
      ],
      choices: ["$75.75", "$87.00", "$93.00", "$101.00", "$129.00"],
      answer: 2,
      clue: "Then I can take twenty-five percent off the brush sets, but not the pads.",
      explanation:
        "붓 4세트 56달러에서 25퍼센트를 빼면 42달러이고, 할인이 안 되는 스케치북 5권 45달러를 더하면 87달러이다. 따라서 답은 ②이다.",
      translation: [
        "W: 시더 공예점입니다. 무엇을 드릴까요?",
        "M: 스케치북 다섯 권이랑 붓 네 세트 주세요.",
        "W: 스케치북은 한 권에 9달러, 붓 세트는 14달러입니다.",
        "M: 그럼 45달러에 56달러네요.",
        "W: 모두 101달러입니다. 팔레트도 하시겠어요?",
        "M: 팔레트는 얼마예요?",
        "W: 하나에 7달러인데, 네 개는 필요하실 거예요.",
        "M: 팔레트는 뺄게요. 오래된 접시를 써요.",
        "W: 괜찮습니다. 학교 동아리세요?",
        "M: 네. 여기 카드요.",
        "W: 그럼 붓 세트에서 25퍼센트를 빼 드립니다. 스케치북은 안 돼요.",
        "M: 감사합니다. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 연극 연습에 못 가는 이유를 고르시오.",
      lines: [
        ["M", "Yerin, you missed rehearsal again on Thursday."],
        ["W", "I had to skip it, and I'll miss next Thursday too."],
        ["M", "Is your throat still bad from the cold?"],
        ["W", "That cleared up in October."],
        ["M", "Then is it the late finish? We go until seven now."],
        ["W", "Seven is fine. It's the maths supplementary class."],
        ["M", "They put that on Thursdays?"],
        ["W", "From this month, five to seven, and attendance is checked."],
        ["M", "Can't you switch to the Tuesday group?"],
        ["W", "The Tuesday group is full. I asked on the first day."],
      ],
      choices: [
        "목이 아파서",
        "연습이 늦게 끝나서",
        "보충 수업과 겹쳐서",
        "가족 행사가 있어서",
        "아르바이트를 해서",
      ],
      answer: 3,
      clue: "Seven is fine. It's the maths supplementary class.",
      explanation:
        "목도 나았고 늦게 끝나는 것도 괜찮지만, 목요일 5시부터 7시까지 수학 보충 수업이 있고 출석을 확인하기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "M: 예린아, 목요일 연습에 또 안 왔더라.",
        "W: 빠질 수밖에 없었어. 다음 주 목요일도 못 가.",
        "M: 감기 때문에 목이 아직 안 좋아?",
        "W: 그건 10월에 나았어.",
        "M: 그럼 늦게 끝나서 그래? 이제 7시까지 하잖아.",
        "W: 7시는 괜찮아. 수학 보충 수업 때문이야.",
        "M: 그걸 목요일에 넣었어?",
        "W: 이달부터 5시에서 7시까지. 출석도 확인해.",
        "M: 화요일 반으로 못 바꿔?",
        "W: 화요일 반은 다 찼어. 첫날에 물어봤어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Orchard Lane Bakery Class에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Yerin, have you seen the notice for the Orchard Lane Bakery Class?"],
        ["W", "I saw it at the community board. When does it run?"],
        ["M", "Four Saturdays, starting on the sixth of April."],
        ["W", "Four weeks. Where is it held?"],
        ["M", "At the bakery itself, the one beside the post office."],
        ["W", "I know that shop. What do they teach?"],
        ["M", "Two weeks on bread, then two on pastry."],
        ["W", "That's a good split. Do we bring anything?"],
        ["M", "An apron and a container to take things home in."],
        ["W", "How much is it?"],
        ["M", "Forty thousand won, ingredients included."],
        ["W", "Then let's sign up this weekend."],
      ],
      choices: ["운영 기간", "장소", "수업 내용", "준비물", "정원"],
      answer: 5,
      clue: "정원은 대화에서 언급되지 않았다.",
      explanation:
        "기간(4월 6일부터 네 번의 토요일), 장소(우체국 옆 빵집), 수업 내용(빵과 페이스트리), 준비물(앞치마와 통)은 언급되지만 정원은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 예린아, 오처드레인 제과 수업 안내문 봤어?",
        "W: 마을 게시판에서 봤어. 언제 해?",
        "M: 4월 6일부터 네 번의 토요일.",
        "W: 4주네. 어디서 해?",
        "M: 그 빵집에서. 우체국 옆에 있는 곳.",
        "W: 그 가게 알아. 뭘 가르쳐?",
        "M: 2주는 빵, 2주는 페이스트리.",
        "W: 잘 나눴네. 뭘 가져가야 해?",
        "M: 앞치마랑 가져올 통.",
        "W: 얼마야?",
        "M: 4만 원. 재료 포함이야.",
        "W: 그럼 이번 주말에 신청하자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Oakside Public Pool에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Oakside Public Pool. " +
            "It opened in 2008 and has six lanes, each twenty-five meters long. " +
            "Public swimming runs from six in the morning until nine at night on weekdays. " +
            "On weekends the pool closes at six because of the cleaning schedule. " +
            "Swimming caps are required for everyone, and they are sold at the front desk. " +
            "Lockers take a returnable coin, so bring one with you. " +
            "Children under eight must be within arm's reach of an adult at all times.",
        ],
      ],
      choices: [
        "2008년에 문을 열었다",
        "레인이 여섯 개이다",
        "주말에는 6시에 닫는다",
        "수영모는 쓰지 않아도 된다",
        "사물함에 동전이 필요하다",
      ],
      answer: 4,
      clue: "Swimming caps are required for everyone, and they are sold at the front desk.",
      explanation:
        "수영모는 모두가 써야 한다고 했으므로 쓰지 않아도 된다는 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "W: 오크사이드 시민 수영장을 소개해 드리겠습니다. 2008년에 문을 열었고 25미터 레인이 여섯 개 있습니다. 평일에는 아침 6시부터 밤 9시까지 일반 수영을 합니다. 주말에는 청소 일정 때문에 6시에 닫습니다. 수영모는 모두 써야 하고 안내 데스크에서 팝니다. 사물함은 돌려받는 동전을 넣어야 하니 하나 챙겨 오세요. 여덟 살 미만 어린이는 언제나 어른이 팔 닿는 거리에 있어야 합니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 구입할 보조 배터리를 고르시오.",
      lines: [
        ["M", "Yerin, let's buy a power bank for the club trips."],
        ["W", "Five models here. How big should the capacity be?"],
        ["M", "At least 20,000, so it can charge four phones."],
        ["W", "That rules out the small ones. Do we need fast charging?"],
        ["M", "Yes. An hour on a bus is all we get."],
        ["W", "Agreed. And the price? The fund left us forty thousand won."],
        ["M", "So forty thousand is the ceiling."],
        ["W", "Then only one model clears all three."],
        ["M", "Let's order before the trip next month."],
        ["W", "I'll place it tonight and send the receipt."],
        ["M", "Thanks. I'll pack it with the first aid kit."],
        ["W", "It should arrive by Friday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "At least 20,000, so it can charge four phones.",
      explanation:
        "용량이 2만 이상이고, 고속 충전이 되며, 4만 원 이하인 것을 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Capacity: 10,000 / Fast charging: Yes / Price: 25,000 won" },
          { no: 2, label: "②", value: "Capacity: 20,000 / Fast charging: Yes / Price: 38,000 won" },
          { no: 3, label: "③", value: "Capacity: 25,000 / Fast charging: No / Price: 30,000 won" },
          { no: 4, label: "④", value: "Capacity: 30,000 / Fast charging: Yes / Price: 62,000 won" },
          { no: 5, label: "⑤", value: "Capacity: 15,000 / Fast charging: No / Price: 18,000 won" },
        ],
      },
      translation: [
        "M: 예린아, 동아리 여행에 쓸 보조 배터리 사자.",
        "W: 다섯 종류 있네. 용량은 얼마나 돼야 해?",
        "M: 적어도 2만. 그래야 휴대폰 네 대를 충전해.",
        "W: 그럼 작은 건 빠지네. 고속 충전은 필요해?",
        "M: 응. 버스에서 한 시간이 전부잖아.",
        "W: 동의해. 값은? 예산에서 4만 원 남았어.",
        "M: 그럼 4만 원이 한계네.",
        "W: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "M: 다음 달 여행 전에 주문하자.",
        "W: 오늘 밤에 주문하고 영수증 보낼게.",
        "M: 고마워. 나는 구급함이랑 같이 챙길게.",
        "W: 금요일까지는 올 거야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Minhyuk, is the music room free on Friday afternoon?"],
        ["M", "It is, but the band has it from four."],
        ["W", "I only need about forty minutes."],
        ["M", "Then take three to four. Nobody has it booked before the band."],
      ],
      choices: [
        "The music room is never free.",
        "I'll take three to four, then.",
        "I don't need the room at all.",
        "The band plays on Thursdays.",
        "Forty minutes is too short.",
      ],
      answer: 2,
      clue: "Then take three to four. Nobody has it booked before the band.",
      explanation:
        "남자가 3시부터 4시까지 비어 있다고 알려 주었으므로, 그 시간을 쓰겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 민혁아, 금요일 오후에 음악실 비어?",
        "M: 비어. 그런데 4시부터는 밴드가 써.",
        "W: 나는 40분쯤만 필요해.",
        "M: 그럼 3시부터 4시까지 해. 밴드 전에는 예약이 없어.",
        "W: 그럼 3시부터 4시까지 할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Yerin, my club fee payment didn't go through."],
        ["W", "Did you use the account number on the old notice?"],
        ["M", "I did. Was it changed?"],
        ["W", "In September. The new number is on the club chat, pinned at the top."],
      ],
      choices: [
        "My payment went through fine.",
        "I'll get the number from the chat.",
        "There is no club fee.",
        "The old number still works.",
        "I'll pay in cash instead.",
      ],
      answer: 2,
      clue: "In September. The new number is on the club chat, pinned at the top.",
      explanation:
        "여자가 새 계좌번호가 대화방 맨 위에 고정돼 있다고 했으므로, 거기서 번호를 확인하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 예린아, 동아리비 송금이 안 됐어.",
        "W: 예전 공지에 있던 계좌번호 썼어?",
        "M: 응. 바뀌었어?",
        "W: 9월에. 새 번호는 동아리 대화방 맨 위에 고정돼 있어.",
        "M: 대화방에서 번호 확인할게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Minhyuk, you've stopped coming to the running club."],
        ["M", "I'm the slowest one there by a long way."],
        ["W", "How long had the others been running before you joined?"],
        ["M", "Years, most of them."],
        ["W", "And you started in September."],
        ["M", "Two months ago, yes."],
        ["W", "So you're comparing two months with years."],
        ["M", "When you say it like that it sounds unreasonable."],
        ["W", "Is your own time better than it was in September?"],
        ["M", "Four minutes better over five kilometers."],
        ["W", "Then come back and race the person you were in September."],
      ],
      choices: [
        "I'll come back on Wednesday.",
        "I'll wait until I'm faster.",
        "I've never run five kilometers.",
        "I'm the fastest in the club.",
        "I'd rather run alone forever.",
      ],
      answer: 1,
      clue: "Then come back and race the person you were in September.",
      explanation:
        "여자가 9월의 자신과 겨루러 돌아오라고 했으므로, 수요일에 돌아가겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 민혁아, 너 달리기 동아리에 안 나오더라.",
        "M: 거기서 내가 제일 느려. 한참 느려.",
        "W: 다른 사람들은 네가 들어가기 전에 얼마나 달렸는데?",
        "M: 대부분 몇 년.",
        "W: 그리고 너는 9월에 시작했고.",
        "M: 두 달 전에, 응.",
        "W: 그럼 두 달을 몇 년과 견주는 거네.",
        "M: 그렇게 말하니까 말이 안 되게 들린다.",
        "W: 네 기록은 9월보다 나아졌어?",
        "M: 5킬로미터에 4분.",
        "W: 그럼 돌아와서 9월의 너와 겨뤄.",
        "M: 수요일에 돌아갈게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Yerin, you've been redoing your timetable every Sunday."],
        ["W", "The last one never quite worked, so I make a better one."],
        ["M", "How many Sundays has that been?"],
        ["W", "Seven, I think. Since the term started."],
        ["M", "And how many of the seven timetables survived past Tuesday?"],
        ["W", "None of them, honestly."],
        ["M", "So the problem isn't the design."],
        ["W", "You think I'm planning instead of studying."],
        ["M", "Planning feels like progress and costs you a morning."],
        ["W", "Then what do I do this Sunday?"],
        ["M", "Use last week's timetable again and spend the morning on chemistry."],
      ],
      choices: [
        "I'll reuse last week's and study instead.",
        "I'll make an eighth timetable.",
        "My timetables always work.",
        "I never plan anything.",
        "I'll skip chemistry this week.",
      ],
      answer: 1,
      clue: "Use last week's timetable again and spend the morning on chemistry.",
      explanation:
        "남자가 지난주 시간표를 그대로 쓰고 그 시간에 화학을 하라고 했으므로, 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 예린아, 너 일요일마다 시간표를 다시 짜더라.",
        "W: 지난 것이 잘 안 맞아서 더 나은 걸 만드는 거야.",
        "M: 그게 몇 번째 일요일이야?",
        "W: 일곱 번쯤. 학기 시작하고부터.",
        "M: 그 일곱 개 중에 화요일을 넘긴 건 몇 개야?",
        "W: 솔직히 하나도 없어.",
        "M: 그럼 문제는 설계가 아니네.",
        "W: 내가 공부 대신 계획을 세우고 있다는 거야?",
        "M: 계획은 진도처럼 느껴지면서 오전을 가져가지.",
        "W: 그럼 이번 일요일엔 뭘 해?",
        "M: 지난주 시간표를 그대로 쓰고 오전은 화학에 써.",
        "W: 지난주 걸 그대로 쓰고 공부할게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Chaewon이 Sungjae에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Chaewon : ________________",
      lines: [
        [
          "W",
          "Chaewon and Sungjae are running the school's used book sale on Friday. " +
            "Sungjae has priced every one of the six hundred books by hand " +
            "and written each price on a small sticker, which took him two afternoons. " +
            "On Wednesday Chaewon notices that he has put the stickers on the front covers, " +
            "right over the titles and the cover pictures. " +
            "Buyers pick up a book by its cover, and half the covers are now hidden. " +
            "Moving the stickers to the back would take an hour with two people, " +
            "and the stickers peel off cleanly because they are the removable kind. " +
            "She does not want him to think the pricing was wasted, " +
            "since the prices themselves are exactly right. " +
            "She wants to tell him to move the stickers to the back covers. " +
            "In this situation, what would Chaewon most likely say to Sungjae?",
        ],
      ],
      choices: [
        "We should lower every price by half.",
        "Let's take the stickers off and use a list.",
        "We should hold the sale next month.",
        "Let's price another hundred books today.",
        "Let's move the stickers to the back covers.",
      ],
      answer: 5,
      clue: "She wants to tell him to move the stickers to the back covers.",
      explanation:
        "채원이는 가격표를 뒤표지로 옮기자고 말하려 하므로 ⑤가 가장 적절하다.",
      translation: [
        "W: 채원이와 성재는 금요일에 여는 학교 헌책 판매를 맡고 있습니다. 성재는 책 육백 권을 하나하나 손으로 값 매기고 작은 스티커에 값을 적었는데, 오후 이틀이 걸렸습니다. 수요일에 채원이는 성재가 그 스티커를 앞표지에, 제목과 표지 그림 바로 위에 붙였다는 것을 알아챕니다. 사는 사람은 표지를 보고 책을 집는데, 이제 표지의 절반이 가려져 있습니다. 스티커를 뒤로 옮기는 데는 두 사람이 한 시간이면 되고, 떼어지는 종류라서 깨끗하게 떨어집니다. 채원이는 값 자체는 정확하기 때문에 성재의 수고가 헛되었다고 여기게 하고 싶지 않습니다. 채원이는 스티커를 뒤표지로 옮기자고 말하고 싶습니다. 이런 상황에서 채원이가 성재에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why a stack of paper " +
            "is so much harder to tear than a single sheet. " +
            "One sheet gives way almost at once, " +
            "and you might expect ten sheets to need ten times the force. " +
            "In practice they need far more than that. " +
            "Tearing works by concentrating force at one tiny point, " +
            "the tip of the tear, where the paper fails and the tear runs onward. " +
            "In a stack, the sheets slide against one another, " +
            "so your hands can never line up all ten tips at the same place. " +
            "The force spreads instead of concentrating. " +
            "This is the same reason a rope of many thin fibers " +
            "outlasts a single thick strand of the same weight.",
        ],
      ],
      choices: [
        "why many thin layers resist tearing better than one",
        "how paper is made from wood fibers",
        "why ropes are twisted rather than braided",
        "how much force a single sheet can take",
        "why thick paper costs more to produce",
      ],
      answer: 1,
      clue: "The force spreads instead of concentrating.",
      explanation:
        "여자는 찢기가 한 점에 힘을 모아 일어나는데 여러 겹은 그 점을 맞출 수 없어 힘이 흩어진다고 설명한다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 종이 한 장보다 여러 장 겹친 것이 왜 그렇게 훨씬 찢기 어려운지 이야기하려 합니다. 한 장은 거의 곧바로 찢어지고, 열 장이면 열 배의 힘이 들 거라고 짐작하기 쉽습니다. 실제로는 그보다 훨씬 많이 듭니다. 찢기는 아주 작은 한 점, 곧 찢어진 자리의 끝에 힘을 모아서 일어납니다. 거기서 종이가 버티지 못하고 찢김이 앞으로 달려갑니다. 겹쳐 놓으면 종이들이 서로 미끄러져서, 손으로는 열 개의 끝을 같은 자리에 맞출 수가 없습니다. 힘이 모이는 대신 흩어지는 것이지요. 가는 섬유를 여러 가닥 꼰 밧줄이 같은 무게의 굵은 한 가닥보다 오래 버티는 것도 같은 이유입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Hello, everyone. Today I want to talk about why a stack of paper is so much harder to tear than a single sheet."],
        ["W", "One sheet gives way almost at once, and you might expect ten sheets to need ten times the force."],
        ["W", "Tearing works by concentrating force at one tiny point, the tip of the tear."],
        ["W", "In a stack, the sheets slide against one another, so your hands can never line up all ten tips at the same place."],
        ["W", "The force spreads instead of concentrating."],
        ["W", "This is the same reason a rope of many thin fibers outlasts a single thick strand of the same weight."],
      ],
      choices: [
        "one sheet giving way almost at once",
        "tearing concentrating force at one point",
        "sheets sliding against one another",
        "a rope of thin fibers outlasting one strand",
        "wet paper tearing more easily",
      ],
      answer: 5,
      clue: "One sheet gives way almost at once, and you might expect ten sheets to need ten times the force.",
      explanation:
        "한 장이 곧바로 찢어진다는 것, 찢기가 한 점에 힘을 모은다는 것, 종이들이 서로 미끄러진다는 것, 가는 섬유 밧줄이 더 오래 버틴다는 것은 언급되지만 젖은 종이가 더 잘 찢어진다는 것은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
