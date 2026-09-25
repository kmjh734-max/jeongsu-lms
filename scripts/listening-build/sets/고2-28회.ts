/** 고2 듣기 28회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 28회",
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
          "Good morning, everyone. This is Sehun Gil from the school council. " +
            "I want to say something about the suggestion box outside the main office. " +
            "Since March we have received one hundred and forty notes, " +
            "and about ninety of them had no name and no class on them. " +
            "That is fine for a complaint, but most of these were proposals, " +
            "and a proposal needs someone we can ask a question. " +
            "Nine good ideas died this term because we could not find out " +
            "which floor or which club the writer meant. " +
            "So please put your class number on the note from now on. " +
            "We will not print your name anywhere. " +
            "We just need to be able to come back to you once. Thank you.",
        ],
      ],
      choices: [
        "건의함 쪽지에 학급을 적어 달라고 부탁하려고",
        "건의함 위치 변경을 알리려고",
        "학생회 선거를 안내하려고",
        "건의 처리 결과를 알리려고",
        "건의함 운영 중단을 알리려고",
      ],
      answer: 1,
      clue: "So please put your class number on the note from now on.",
      explanation:
        "남자는 제안 쪽지에 되물을 방법이 없어 아이디어가 사라졌다며 학급 번호를 적어 달라고 부탁한다. 따라서 답은 ①이다.",
      translation: [
        "M: 여러분, 안녕하세요. 학생회 길세훈입니다. 교무실 밖 건의함에 대해 말씀드리려 합니다. 3월부터 쪽지를 백사십 장 받았는데, 그중 아흔 장쯤에는 이름도 학급도 적혀 있지 않았습니다. 불만 사항이라면 괜찮습니다. 그런데 대부분은 제안이었고, 제안은 되물을 사람이 있어야 합니다. 글쓴이가 어느 층을 말하는지, 어느 동아리를 말하는지 알 수 없어서 이번 학기에 좋은 아이디어 아홉 개가 사라졌습니다. 그러니 앞으로는 쪽지에 학급 번호를 적어 주세요. 이름은 어디에도 싣지 않습니다. 한 번 되물을 수 있으면 됩니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Nari, I've been saving every article I want to read."],
        ["W", "Saving where? A folder, or an app?"],
        ["M", "An app. There are about four hundred in there now."],
        ["W", "How many have you read since you started saving?"],
        ["M", "Maybe fifteen. The list only grows."],
        ["W", "So saving has become the thing you do instead of reading."],
        ["M", "It feels productive, though. I'm collecting good material."],
        ["W", "Collecting isn't reading, and the pile makes starting harder."],
        ["M", "Because four hundred is too many to choose from."],
        ["W", "Exactly. Delete the list and save only what you'll read today."],
        ["M", "Delete four hundred articles? That feels wasteful."],
        ["W", "They were already wasted. You just hadn't noticed yet."],
      ],
      choices: [
        "좋은 글은 저장해 두어야 한다",
        "글은 종이로 읽어야 한다",
        "독서 시간을 정해 두어야 한다",
        "읽을 것은 모으지 말고 오늘 읽을 것만 남겨야 한다",
        "기사보다 책을 읽어야 한다",
      ],
      answer: 4,
      clue: "Exactly. Delete the list and save only what you'll read today.",
      explanation:
        "여자는 모으는 일이 읽는 일을 대신했다며, 목록을 지우고 오늘 읽을 것만 저장하라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "M: 나리야, 나 읽고 싶은 기사를 전부 저장해 두고 있어.",
        "W: 어디에? 폴더에, 앱에?",
        "M: 앱에. 지금 사백 개쯤 들어 있어.",
        "W: 저장하기 시작한 뒤로 몇 개나 읽었어?",
        "M: 열다섯 개쯤? 목록만 늘어.",
        "W: 그럼 저장이 읽기를 대신하는 일이 된 거네.",
        "M: 그래도 뭔가 하는 것 같아. 좋은 자료를 모으고 있잖아.",
        "W: 모으는 건 읽는 게 아니고, 쌓일수록 시작하기가 어려워져.",
        "M: 사백 개 중에서 고르기가 힘들어서 그렇지.",
        "W: 그래. 목록을 지우고 오늘 읽을 것만 저장해.",
        "M: 사백 개를 지워? 아깝게 느껴지는데.",
        "W: 이미 버려진 거야. 네가 아직 못 알아챘을 뿐이지.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When something goes wrong in a group, the first instinct is to find who did it. " +
            "This feels like accountability, and sometimes it is. " +
            "But watch what it does to the next report. " +
            "The person who notices a small problem early " +
            "now has to weigh telling you against being the one who brought it up. " +
            "In a group that hunts for blame, that calculation almost always ends in silence, " +
            "and the small problem gets a few more weeks to grow. " +
            "By the time it surfaces, it is expensive, " +
            "and now there really is someone to blame. " +
            "The cheapest thing an organization can buy is early news, " +
            "and the price of early news is not punishing the person who brings it.",
        ],
      ],
      choices: [
        "책임 소재를 분명히 해야 한다",
        "문제를 일찍 알리려면 알린 사람을 탓하지 말아야 한다",
        "보고는 문서로 남겨야 한다",
        "작은 문제는 넘어가야 한다",
        "조직은 규칙이 있어야 한다",
      ],
      answer: 2,
      clue: "The cheapest thing an organization can buy is early news, and the price of early news is not punishing the person who brings it.",
      explanation:
        "남자는 책임자를 찾는 조직에서는 작은 문제가 묻힌다며, 일찍 알리는 사람을 벌하지 않는 것이 값싼 해법이라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 어떤 모임에서 일이 잘못되면 처음 드는 충동은 누가 그랬는지 찾는 것입니다. 그것은 책임을 묻는 일처럼 느껴지고, 때로는 실제로 그렇습니다. 그런데 그것이 다음 보고에 무엇을 하는지 보세요. 작은 문제를 일찍 알아챈 사람은 이제 그것을 말하는 일과 그것을 꺼낸 사람이 되는 일을 저울질해야 합니다. 잘못을 사냥하는 모임에서 그 계산은 거의 언제나 침묵으로 끝나고, 작은 문제는 자랄 시간을 몇 주 더 얻습니다. 드러날 무렵이면 그 문제는 비싸져 있고, 이제 정말로 탓할 사람이 생깁니다. 조직이 살 수 있는 가장 값싼 것은 이른 소식이고, 그 값은 그것을 가져온 사람을 벌하지 않는 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Sehun, is this the corner you made into a photo studio?"],
        ["M", "Yes, the club room finally has one."],
        ["W", "There's a paper backdrop rolled down behind the stool."],
        ["M", "We pull it down only for portraits."],
        ["W", "And a camera on a tripod stands in front of it."],
        ["M", "That tripod is older than the camera."],
        ["W", "I count three softbox lights around the set."],
        ["M", "There are four. One is folded behind the backdrop."],
        ["W", "The round reflector leaning on the wall looks new."],
        ["M", "We bought it with what was left of the club fund."],
        ["W", "And a shelf of lenses runs above the door."],
        ["M", "Four lenses, and every one of them is borrowed."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is folded behind the backdrop.",
      explanation:
        "여자가 조명이 세 개라고 하자 남자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A small photo studio corner drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A PAPER BACKDROP is rolled down behind a stool. " +
          "A CAMERA ON A TRIPOD stands in front of the backdrop. " +
          "EXACTLY THREE SOFTBOX LIGHTS on stands surround the set, spaced well apart so all three are easy to count and none overlap. " +
          "A ROUND REFLECTOR DISC leans against the wall. " +
          "A SHELF holding four camera lenses runs along the wall above a closed door.",
      },
      translation: [
        "W: 세훈아, 이게 사진 스튜디오로 만든 구석이야?",
        "M: 응, 동아리방에 드디어 하나 생겼어.",
        "W: 의자 뒤에 종이 배경이 내려와 있네.",
        "M: 인물 사진 찍을 때만 내려.",
        "W: 그리고 그 앞에 삼각대에 올린 카메라가 있어.",
        "M: 그 삼각대는 카메라보다 오래됐어.",
        "W: 세트 둘레에 소프트박스 조명이 세 개 보여.",
        "M: 네 개야. 하나는 배경 뒤에 접혀 있어.",
        "W: 벽에 기대 놓은 둥근 반사판은 새것 같네.",
        "M: 동아리비 남은 걸로 샀어.",
        "W: 그리고 문 위에 렌즈 선반이 있어.",
        "M: 렌즈 네 개. 전부 빌린 거야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Nari, the club recruitment talk is at four in room 105."],
        ["W", "I know. Are the leaflets printed?"],
        ["M", "Two hundred, folded and boxed by the door."],
        ["W", "Good. And the sign-up forms?"],
        ["M", "Printed as well, on the blue paper so they stand out."],
        ["W", "Then what's still open?"],
        ["M", "The room has thirty chairs and we're expecting fifty people."],
        ["W", "Where can we get twenty more?"],
        ["M", "The empty classroom next door, but they have to be carried across."],
        ["W", "That's two trips at least."],
        ["M", "I'd go, but I have to brief the three speakers at three thirty."],
        ["W", "Then I'll bring the twenty chairs across."],
      ],
      choices: [
        "안내지 인쇄하기",
        "신청서 만들기",
        "의자 옮겨 오기",
        "발표자 안내하기",
        "교실 청소하기",
      ],
      answer: 3,
      clue: "Then I'll bring the twenty chairs across.",
      explanation:
        "안내지와 신청서는 끝났고 남자는 발표자들을 안내해야 하므로, 여자가 옆 교실에서 의자 스무 개를 옮겨 오기로 한다. 따라서 답은 ③이다.",
      translation: [
        "M: 나리야, 동아리 모집 설명회가 4시에 105호에서 있어.",
        "W: 알아. 안내지는 인쇄했어?",
        "M: 이백 장, 접어서 문 옆 상자에 뒀어.",
        "W: 좋아. 신청서는?",
        "M: 그것도 인쇄했어. 눈에 띄게 파란 종이로.",
        "W: 그럼 아직 남은 게 뭐야?",
        "M: 방에 의자가 서른 개인데 쉰 명이 올 것 같아.",
        "W: 스무 개를 어디서 가져와?",
        "M: 옆 빈 교실에. 그런데 들고 와야 해.",
        "W: 적어도 두 번은 왔다 갔다 해야겠네.",
        "M: 내가 가고 싶은데, 3시 30분에 발표자 세 분께 설명해야 해.",
        "W: 그럼 내가 의자 스무 개 옮겨 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to Pinecrest Sports. How can I help you?"],
        ["M", "Six jump ropes and three yoga mats, please."],
        ["W", "Jump ropes are eight dollars each and mats are twenty-five."],
        ["M", "So forty-eight dollars plus seventy-five."],
        ["W", "One hundred and twenty-three in total. Would you like the mat bags?"],
        ["M", "How much are the bags?"],
        ["W", "Ten dollars each, and you'd want three."],
        ["M", "We'll skip the bags. They're stored in the club room."],
        ["W", "No problem. Are you with a school club?"],
        ["M", "We are. Here's the card."],
        ["W", "Then I can take twenty percent off the mats, but not the ropes."],
        ["M", "Thank you. I'll pay in cash."],
      ],
      choices: ["$108.00", "$98.40", "$113.00", "$123.00", "$153.00"],
      answer: 1,
      clue: "Then I can take twenty percent off the mats, but not the ropes.",
      explanation:
        "매트 3개 75달러에서 20퍼센트를 빼면 60달러이고, 할인이 안 되는 줄넘기 6개 48달러를 더하면 108달러이다. 따라서 답은 ①이다.",
      translation: [
        "W: 파인크레스트 스포츠입니다. 무엇을 도와드릴까요?",
        "M: 줄넘기 여섯 개랑 요가 매트 세 개 주세요.",
        "W: 줄넘기는 하나에 8달러, 매트는 25달러입니다.",
        "M: 그럼 48달러에 75달러네요.",
        "W: 모두 123달러입니다. 매트 가방도 하시겠어요?",
        "M: 가방은 얼마예요?",
        "W: 하나에 10달러인데, 세 개는 필요하실 거예요.",
        "M: 가방은 뺄게요. 동아리방에 보관해요.",
        "W: 괜찮습니다. 학교 동아리세요?",
        "M: 네. 여기 카드요.",
        "W: 그럼 매트에서 20퍼센트를 빼 드립니다. 줄넘기는 안 돼요.",
        "M: 감사합니다. 현금으로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 사진 대회에 출품하지 않는 이유를 고르시오.",
      lines: [
        ["M", "Nari, your photo isn't in the contest list."],
        ["W", "I decided not to enter this year."],
        ["M", "Did the print come out badly?"],
        ["W", "The print is the best one I've made."],
        ["M", "Then is it the entry fee? It doubled this year."],
        ["W", "The club covers that for members."],
        ["M", "So what stopped you?"],
        ["W", "The rules say the photo must have been taken this year."],
        ["M", "And yours wasn't?"],
        ["W", "I took it in November last year. I'd rather not bend that."],
      ],
      choices: [
        "인화가 잘못돼서",
        "출품비가 올라서",
        "주제가 맞지 않아서",
        "촬영 시기가 규정에 맞지 않아서",
        "마감을 놓쳐서",
      ],
      answer: 4,
      clue: "The rules say the photo must have been taken this year.",
      explanation:
        "인화도 잘되었고 출품비도 동아리가 내 주지만, 사진을 작년 11월에 찍어 올해 촬영이라는 규정에 맞지 않기 때문이다. 따라서 답은 ④이다.",
      translation: [
        "M: 나리야, 대회 목록에 네 사진이 없네.",
        "W: 올해는 안 내기로 했어.",
        "M: 인화가 잘못 나왔어?",
        "W: 인화는 내가 만든 것 중에 제일 잘 나왔어.",
        "M: 그럼 출품비 때문이야? 올해 두 배가 됐잖아.",
        "W: 회원은 동아리에서 내 줘.",
        "M: 그럼 뭐가 걸렸는데?",
        "W: 규정에 사진을 올해 찍은 것이어야 한대.",
        "M: 네 건 아니야?",
        "W: 작년 11월에 찍었어. 그걸 구부리고 싶진 않아.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Summer Coding Lab에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Nari, have you looked at the Summer Coding Lab?"],
        ["W", "I opened the page but stopped reading. When is it?"],
        ["M", "Four weeks, every Tuesday and Thursday evening in July."],
        ["W", "Evenings work for me. Where does it run?"],
        ["M", "In the computer room at the city youth center."],
        ["W", "That's near the library. What do they teach?"],
        ["M", "Two weeks on data handling, then two weeks on building a small app."],
        ["W", "That's more practical than I expected. What does it cost?"],
        ["M", "Sixty thousand won for the whole thing."],
        ["W", "Do we bring our own laptops?"],
        ["M", "They lend you one for each session."],
        ["W", "Then let's apply this week."],
      ],
      choices: ["운영 기간", "정원", "장소", "수업 내용", "참가비"],
      answer: 2,
      clue: "정원은 대화에서 언급되지 않았다.",
      explanation:
        "기간(7월 화·목 저녁 4주), 장소(시 청소년센터 컴퓨터실), 수업 내용(자료 다루기와 앱 만들기), 참가비(6만 원)는 언급되지만 정원은 언급되지 않았다. 따라서 답은 ②이다.",
      translation: [
        "M: 나리야, 여름 코딩 랩 봤어?",
        "W: 페이지는 열었는데 읽다 말았어. 언제야?",
        "M: 7월에 4주 동안, 매주 화요일과 목요일 저녁.",
        "W: 저녁이면 나는 괜찮아. 어디서 해?",
        "M: 시 청소년센터 컴퓨터실에서.",
        "W: 도서관 근처네. 뭘 가르쳐?",
        "M: 2주는 자료 다루기, 2주는 작은 앱 만들기.",
        "W: 생각보다 실용적이네. 참가비는?",
        "M: 전체에 6만 원.",
        "W: 노트북은 가져가?",
        "M: 수업마다 한 대씩 빌려줘.",
        "W: 그럼 이번 주에 신청하자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Brightwater Aquarium에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Brightwater Aquarium. " +
            "It opened in 2003 and holds about two hundred species. " +
            "The aquarium is open from ten until six, and closed on the first Monday of each month. " +
            "Feeding demonstrations take place three times a day at the main tank. " +
            "Photography is allowed everywhere, but flash is not, because it startles the fish. " +
            "The touch pool is open to anyone, and a staff member is present the whole time. " +
            "Tickets bought online are two thousand won cheaper than at the gate.",
        ],
      ],
      choices: [
        "2003년에 문을 열었다",
        "매달 첫째 월요일에 쉰다",
        "하루 세 번 먹이 주기를 보여 준다",
        "온라인 표가 더 싸다",
        "플래시를 써서 사진을 찍을 수 있다",
      ],
      answer: 5,
      clue: "Photography is allowed everywhere, but flash is not, because it startles the fish.",
      explanation:
        "사진은 찍을 수 있지만 플래시는 안 된다고 했으므로 ⑤는 내용과 다르다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 브라이트워터 수족관을 소개해 드리겠습니다. 2003년에 문을 열었고 이백 종쯤을 기릅니다. 수족관은 10시부터 6시까지 열고 매달 첫째 월요일에 쉽니다. 먹이 주기 시연은 큰 수조에서 하루 세 번 합니다. 사진은 어디서든 찍을 수 있지만 플래시는 안 됩니다. 물고기가 놀라기 때문입니다. 만지는 수조는 누구나 이용할 수 있고 직원이 내내 함께 있습니다. 온라인으로 산 표는 매표소보다 2천 원 쌉니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 구입할 전기 주전자를 고르시오.",
      lines: [
        ["M", "Nari, let's pick a kettle for the club room."],
        ["W", "Five models. How big should it be?"],
        ["M", "At least 1.5 liters. We often have seven people."],
        ["W", "That rules out the small ones. Do we need a keep-warm function?"],
        ["M", "Yes. The water sits for an hour between meetings."],
        ["W", "Agreed. And the price? The fund left us fifty thousand won."],
        ["M", "So fifty thousand is the ceiling."],
        ["W", "Then only one model clears all three."],
        ["M", "Let's order before the fund closes on Friday."],
        ["W", "I'll place it tonight and send you the receipt."],
        ["M", "Thanks. I'll clear a space on the side table."],
        ["W", "It should arrive by Wednesday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "At least 1.5 liters. We often have seven people.",
      explanation:
        "1.5리터 이상이고, 보온 기능이 있으며, 5만 원 이하인 것을 고른다. 세 조건을 모두 채우는 것은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Size: 1.0 L / Keep-warm: Yes / Price: 30,000 won" },
          { no: 2, label: "②", value: "Size: 1.8 L / Keep-warm: No / Price: 35,000 won" },
          { no: 3, label: "③", value: "Size: 1.5 L / Keep-warm: Yes / Price: 47,000 won" },
          { no: 4, label: "④", value: "Size: 1.7 L / Keep-warm: Yes / Price: 68,000 won" },
          { no: 5, label: "⑤", value: "Size: 1.2 L / Keep-warm: No / Price: 22,000 won" },
        ],
      },
      translation: [
        "M: 나리야, 동아리방에 둘 주전자 고르자.",
        "W: 다섯 종류네. 크기는 얼마나 돼야 해?",
        "M: 적어도 1.5리터. 우리 자주 일곱 명이잖아.",
        "W: 그럼 작은 건 빠지네. 보온 기능은 필요해?",
        "M: 응. 모임 사이에 물이 한 시간씩 놓여 있어.",
        "W: 동의해. 값은? 예산에서 5만 원 남았어.",
        "M: 그럼 5만 원이 한계네.",
        "W: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "M: 금요일에 예산 마감이니까 그전에 주문하자.",
        "W: 오늘 밤에 주문하고 영수증 보낼게.",
        "M: 고마워. 나는 옆 탁자에 자리 치워 둘게.",
        "W: 수요일까지는 올 거야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Sehun, is the science lab open after school on Wednesday?"],
        ["M", "It is, but only if a teacher signs you in."],
        ["W", "I don't know who's on duty that day."],
        ["M", "The duty list is on the lab door. Check it when you pass."],
      ],
      choices: [
        "I'll check it when I pass.",
        "The lab has no duty list.",
        "I finished the experiment already.",
        "No teacher ever signs anyone in.",
        "I'll go on Thursday instead.",
      ],
      answer: 1,
      clue: "The duty list is on the lab door. Check it when you pass.",
      explanation:
        "남자가 실험실 문에 붙은 당번표를 지나갈 때 보라고 했으므로, 그렇게 하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 세훈아, 수요일 방과 후에 실험실 열어?",
        "M: 열어. 그런데 선생님이 이름을 써 주셔야 해.",
        "W: 그날 누가 당번인지 모르겠어.",
        "M: 당번표가 실험실 문에 있어. 지나갈 때 봐.",
        "W: 지나갈 때 확인할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Nari, the club account won't let me log in."],
        ["W", "Are you using the new address or the old one?"],
        ["M", "The old one. I didn't know it changed."],
        ["W", "It changed in March. Use the address ending in dot org."],
      ],
      choices: [
        "My login works perfectly.",
        "The club has no account.",
        "Nothing changed in March.",
        "I'll try the dot org address.",
        "I'll make a new account.",
      ],
      answer: 4,
      clue: "It changed in March. Use the address ending in dot org.",
      explanation:
        "여자가 dot org로 끝나는 주소를 쓰라고 했으므로, 그 주소로 해 보겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 나리야, 동아리 계정에 로그인이 안 돼.",
        "W: 새 주소로 하는 거야, 예전 주소로 하는 거야?",
        "M: 예전 거. 바뀐 줄 몰랐어.",
        "W: 3월에 바뀌었어. dot org로 끝나는 주소를 써.",
        "M: dot org 주소로 해 볼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nari, you've been redoing the club poster all week."],
        ["W", "The colors still aren't right."],
        ["M", "How many versions have you made?"],
        ["W", "Twelve. I keep coming back to the fourth one."],
        ["M", "Has anyone else seen the fourth one?"],
        ["W", "No. I'll show it when the colors work."],
        ["M", "But the poster isn't for you. You already know what it says."],
        ["W", "So I can't tell whether it reads from across a hallway."],
        ["M", "Not from where you're sitting, no."],
        ["W", "I've been polishing instead of testing."],
        ["M", "Print the fourth one and tape it up in the corridor tonight."],
      ],
      choices: [
        "I'll make a thirteenth version.",
        "I'll tape it up tonight and watch.",
        "Nobody looks at posters anyway.",
        "The colors are perfect now.",
        "I'd rather not put one up at all.",
      ],
      answer: 2,
      clue: "Print the fourth one and tape it up in the corridor tonight.",
      explanation:
        "남자가 네 번째 판본을 인쇄해 복도에 붙여 보라고 했으므로, 오늘 밤 붙여 보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나리야, 일주일 내내 동아리 포스터를 다시 만들고 있네.",
        "W: 색이 아직 맞지 않아.",
        "M: 판본을 몇 개나 만들었어?",
        "W: 열두 개. 자꾸 네 번째로 돌아가.",
        "M: 그 네 번째를 다른 사람이 본 적 있어?",
        "W: 아니. 색이 맞으면 보여 주려고.",
        "M: 그런데 포스터는 너를 위한 게 아니잖아. 너는 이미 내용을 알고.",
        "W: 그럼 복도 건너편에서 읽히는지는 내가 알 수 없겠네.",
        "M: 네가 앉은 자리에서는 못 알아.",
        "W: 확인 대신 다듬기만 했구나.",
        "M: 네 번째를 인쇄해서 오늘 밤 복도에 붙여 봐.",
        "W: 오늘 밤에 붙여 놓고 지켜볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sehun, you've been skipping breakfast since the term started."],
        ["M", "I'd rather have the extra twenty minutes of sleep."],
        ["W", "How do the first two periods go?"],
        ["M", "Badly. I can't hold anything until after lunch."],
        ["W", "So the twenty minutes cost you two hours of class."],
        ["M", "I hadn't put those two things next to each other."],
        ["W", "Most people don't. The cost shows up somewhere else."],
        ["M", "But I'm genuinely not hungry at seven."],
        ["W", "Then it doesn't have to be a meal. It has to be something."],
        ["M", "Like what, exactly?"],
        ["W", "Keep bananas by the door and eat one on the way out."],
      ],
      choices: [
        "I'll keep sleeping the extra twenty minutes.",
        "I eat a full breakfast every day.",
        "My first two periods are fine.",
        "I'll skip lunch instead.",
        "I'll take one on the way out tomorrow.",
      ],
      answer: 5,
      clue: "Keep bananas by the door and eat one on the way out.",
      explanation:
        "여자가 문 옆에 바나나를 두고 나가면서 하나 먹으라고 했으므로, 내일 나가면서 하나 챙기겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "W: 세훈아, 너 학기 시작하고 계속 아침을 거르더라.",
        "M: 20분 더 자는 게 나아서.",
        "W: 1·2교시는 어때?",
        "M: 엉망이야. 점심 전까지는 아무것도 못 붙잡아.",
        "W: 그럼 그 20분이 수업 두 시간을 쓰게 한 거네.",
        "M: 그 둘을 나란히 놓고 본 적이 없었어.",
        "W: 대부분 그래. 대가는 다른 데서 드러나거든.",
        "M: 그런데 7시에는 정말 배가 안 고파.",
        "W: 그럼 끼니일 필요는 없어. 뭐라도 있으면 돼.",
        "M: 예를 들면?",
        "W: 문 옆에 바나나를 두고 나가면서 하나 먹어.",
        "M: 내일 나가면서 하나 챙길게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Yebin이 Junho에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Yebin : ________________",
      lines: [
        [
          "W",
          "Yebin and Junho are preparing the class exhibit for the school open day. " +
            "Junho has built a tall model of the water cycle and it stands almost two meters high. " +
            "The model is sturdy and the labels on it are clear. " +
            "On Thursday Yebin looks at the room they have been given " +
            "and finds that its ceiling is one and a half meters at the back where the roof slopes. " +
            "The model would not stand upright there at all. " +
            "The room next door has a flat ceiling and is still unassigned, " +
            "and the teacher in charge said rooms could be swapped until Friday. " +
            "She does not want him to cut the model down, since the height is part of the point. " +
            "She wants to tell him to ask for the room next door instead. " +
            "In this situation, what would Yebin most likely say to Junho?",
        ],
      ],
      choices: [
        "We should cut the model down to size.",
        "Let's lay the model on its side.",
        "Let's ask for the room next door instead.",
        "We should skip the open day this year.",
        "Let's build a second model as well.",
      ],
      answer: 3,
      clue: "She wants to tell him to ask for the room next door instead.",
      explanation:
        "예빈이는 천장이 평평한 옆 교실을 달라고 하자고 말하려 하므로 ③이 가장 적절하다.",
      translation: [
        "W: 예빈이와 준호는 학교 공개의 날에 낼 학급 전시를 준비하고 있습니다. 준호는 물의 순환을 보여 주는 키 큰 모형을 만들었는데, 높이가 거의 2미터입니다. 모형은 튼튼하고 붙인 설명도 또렷합니다. 목요일에 예빈이는 배정받은 교실을 살펴보다가, 지붕이 기울어지는 뒤쪽 천장이 1.5미터밖에 안 된다는 것을 알게 됩니다. 거기서는 모형을 똑바로 세울 수조차 없습니다. 옆 교실은 천장이 평평하고 아직 배정되지 않았으며, 담당 선생님은 금요일까지는 교실을 바꿀 수 있다고 하셨습니다. 예빈이는 높이가 핵심의 일부이기 때문에 모형을 잘라 내기를 바라지 않습니다. 예빈이는 옆 교실을 달라고 하자고 말하고 싶습니다. 이런 상황에서 예빈이가 준호에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why a mountain road " +
            "climbs in long zigzags instead of going straight up. " +
            "A straight road up a steep slope would be shorter, " +
            "but a vehicle can only climb a slope up to a certain steepness " +
            "before its wheels slip or its engine stalls. " +
            "For most roads that limit is around ten percent, " +
            "meaning one meter of rise for every ten meters forward. " +
            "A zigzag does not reduce the height that has to be climbed. " +
            "It stretches the distance over which that height is gained, " +
            "which lowers the angle at every point. " +
            "The same trick appears in a wheelchair ramp, a spiral staircase " +
            "and the threads on a screw. " +
            "All of them trade length for gentleness.",
        ],
      ],
      choices: [
        "how zigzag roads trade distance for a gentler slope",
        "why mountain roads are dangerous in winter",
        "how engines are designed for steep climbing",
        "why straight roads are cheaper to build",
        "how a spiral staircase saves floor space",
      ],
      answer: 1,
      clue: "All of them trade length for gentleness.",
      explanation:
        "남자는 지그재그 길이 높이를 줄이는 것이 아니라 거리를 늘려 기울기를 낮춘다고 설명한다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 산길이 왜 곧장 올라가지 않고 긴 지그재그로 오르는지 이야기하려 합니다. 가파른 비탈을 곧장 오르는 길이 더 짧겠지요. 그런데 차는 일정 가파르기까지만 오를 수 있습니다. 그 이상이면 바퀴가 미끄러지거나 엔진이 멈춥니다. 대부분의 도로에서 그 한계는 10퍼센트쯤입니다. 앞으로 10미터 갈 때 1미터 오르는 정도지요. 지그재그는 올라야 할 높이를 줄이지 않습니다. 그 높이를 얻는 거리를 늘려서 모든 지점의 각도를 낮춥니다. 같은 방법이 휠체어 경사로에도, 나선 계단에도, 나사의 골에도 나타납니다. 전부 길이를 내주고 완만함을 얻는 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about why a mountain road climbs in long zigzags instead of going straight up."],
        ["M", "A vehicle can only climb a slope up to a certain steepness before its wheels slip or its engine stalls."],
        ["M", "For most roads that limit is around ten percent, meaning one meter of rise for every ten meters forward."],
        ["M", "A zigzag does not reduce the height that has to be climbed. It stretches the distance over which that height is gained."],
        ["M", "The same trick appears in a wheelchair ramp, a spiral staircase and the threads on a screw."],
        ["M", "All of them trade length for gentleness."],
      ],
      choices: [
        "wheels slipping on too steep a slope",
        "a limit of around ten percent",
        "a zigzag stretching the distance",
        "snow chains helping in winter",
        "the same trick in a wheelchair ramp",
      ],
      answer: 4,
      clue: "A vehicle can only climb a slope up to a certain steepness before its wheels slip or its engine stalls.",
      explanation:
        "너무 가파르면 바퀴가 미끄러진다는 것, 한계가 10퍼센트쯤이라는 것, 지그재그가 거리를 늘린다는 것, 휠체어 경사로에도 같은 방법이 쓰인다는 것은 언급되지만 겨울에 체인이 도움이 된다는 것은 언급되지 않았다. 따라서 답은 ④이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
