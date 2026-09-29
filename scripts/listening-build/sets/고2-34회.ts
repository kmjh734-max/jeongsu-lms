/** 고2 듣기 34회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 34회",
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
          "Good morning, everyone. This is the head of the student council. " +
            "I want to tell you how the council spent the budget this term, " +
            "because the money came from every one of you and nobody has seen the figures. " +
            "From next week a single sheet will hang beside the main noticeboard, " +
            "listing every item we bought and what it cost. " +
            "The sheet will be replaced at the end of each month, " +
            "and the old ones will be kept in a folder in the council room. " +
            "If a number on that sheet looks wrong to you, come and ask us about it. " +
            "We would rather explain it once than have people guessing all year. Thank you.",
        ],
      ],
      choices: [
        "학생회 선거를 알리려고",
        "예산 사용 내역 공개를 안내하려고",
        "회비 납부를 독촉하려고",
        "학생회 가입을 권하려고",
        "게시판 이전을 알리려고",
      ],
      answer: 2,
      clue: "From next week a single sheet will hang beside the main noticeboard.",
      explanation:
        "여자는 다음 주부터 예산을 어디에 썼는지 적은 표를 게시판 옆에 붙인다고 안내한다. 따라서 답은 ②이다.",
      translation: [
        "W: 여러분, 안녕하세요. 학생회장입니다. 이번 학기에 학생회가 예산을 어떻게 썼는지 알려 드리려 합니다. 그 돈은 여러분 모두에게서 나온 것인데 아무도 숫자를 본 적이 없기 때문입니다. 다음 주부터 중앙 게시판 옆에 종이 한 장을 붙여, 우리가 산 모든 것과 그 값을 적어 두겠습니다. 그 종이는 매달 말에 새것으로 바꾸고, 지난 것들은 학생회실 서류철에 보관합니다. 그 종이의 숫자가 이상해 보이면 와서 물어 주세요. 한 해 내내 사람들이 짐작하게 두느니 한 번 설명하는 편이 낫습니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Chaewon, I've been doing past papers for three weeks straight."],
        ["W", "How many have you finished?"],
        ["M", "Eleven, and my score hasn't moved at all."],
        ["W", "What do you do with a paper once you've marked it?"],
        ["M", "I write the score at the top and start the next one."],
        ["W", "Then you've done one paper eleven times."],
        ["M", "They were completely different papers."],
        ["W", "And you brought the same weaknesses into every one of them."],
        ["M", "I thought more practice was the answer."],
        ["W", "Practice shows you the gap. It doesn't close it."],
        ["M", "So I should stop after each paper and go back."],
        ["W", "One paper studied properly beats four papers just finished."],
      ],
      choices: [
        "기출 문제를 많이 풀어야 한다",
        "푼 문제를 제대로 되짚어야 한다",
        "시간을 재고 풀어야 한다",
        "쉬운 문제부터 풀어야 한다",
        "문제집을 자주 바꿔야 한다",
      ],
      answer: 2,
      clue: "One paper studied properly beats four papers just finished.",
      explanation:
        "여자는 많이 푸는 것이 아니라 푼 것을 제대로 되짚어야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 채원아, 삼 주 내내 기출 문제를 풀었어.",
        "W: 몇 회분이나 끝냈는데?",
        "M: 열한 회분. 점수는 전혀 안 움직였어.",
        "W: 채점하고 나서 그 시험지로 뭘 해?",
        "M: 위에 점수를 적고 다음 회분을 시작해.",
        "W: 그럼 한 회분을 열한 번 푼 거야.",
        "M: 전혀 다른 시험지였는데.",
        "W: 그런데 같은 약점을 매번 그대로 들고 갔잖아.",
        "M: 더 많이 푸는 게 답인 줄 알았어.",
        "W: 푸는 건 빈틈을 보여 줄 뿐이야. 메워 주지는 않아.",
        "M: 그럼 한 회분 끝날 때마다 멈추고 되짚어야겠네.",
        "W: 제대로 본 한 회분이 그냥 끝낸 네 회분보다 나아.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "You are told to read widely, and the advice is sound, " +
            "but nobody tells you what to do when a book stops working. " +
            "Two hundred pages in, you find you have read the same paragraph four times. " +
            "Most people push on, out of a feeling that stopping is a failure. " +
            "It is not. A book you resent is teaching you nothing at all, " +
            "and every evening you spend with it is an evening taken from a book that would. " +
            "Put it down and take the next one. " +
            "The shelf is long, your years are not, and no book is owed your attention.",
        ],
      ],
      choices: [
        "책은 끝까지 읽어야 한다",
        "어려운 책을 골라야 한다",
        "책은 두 번 읽어야 한다",
        "맞지 않는 책은 덮고 다음 책으로 가야 한다",
        "책을 읽고 기록해야 한다",
      ],
      answer: 4,
      clue: "Put it down and take the next one.",
      explanation:
        "남자는 읽히지 않는 책을 붙들고 있지 말고 다음 책으로 넘어가라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "M: 사람들은 책을 널리 읽으라고 말하고, 그 조언은 옳습니다. 그런데 책이 더는 읽히지 않을 때 어떻게 해야 하는지는 아무도 말해 주지 않습니다. 이백 쪽쯤에서 같은 문단을 네 번 읽고 있는 자신을 발견합니다. 대부분은 멈추는 것이 실패라는 느낌 때문에 밀고 나갑니다. 그렇지 않습니다. 미운 책은 아무것도 가르쳐 주지 않고, 그 책과 보낸 저녁은 가르쳐 줄 책에게서 빼앗은 저녁입니다. 내려놓고 다음 책을 드세요. 책장은 길고 여러분의 세월은 그렇지 않으며, 어떤 책도 여러분의 시간을 받을 권리를 갖고 있지 않습니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Dain, is this the school shop you helped redesign?"],
        ["W", "Yes, we finished it during the autumn holiday."],
        ["M", "A curved counter stands near the entrance."],
        ["W", "The curve keeps the queue away from the door."],
        ["M", "There's a wide notice frame on the left wall."],
        ["W", "We change the week's prices in it every Monday."],
        ["M", "Three baskets are stacked beside the counter."],
        ["W", "Four, actually. One is under the bottom shelf."],
        ["M", "A tall drinks fridge stands on the right."],
        ["W", "It hums a little, but everyone forgives that."],
        ["M", "And a round wall clock hangs above the shelves."],
        ["W", "It came from the old staff room."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Four, actually. One is under the bottom shelf.",
      explanation:
        "남자가 바구니가 세 개라고 하자 여자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.45, 0.6],
          [0.08, 0.3],
          [0.85, 0.5],
          [0.24, 0.78],
          [0.6, 0.1],
        ],
        scene:
          "A small school shop drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A CURVED COUNTER with a gentle bend stands near the entrance in the MIDDLE of the picture. " +
          "A WIDE EMPTY NOTICE FRAME hangs on the LEFT wall. " +
          "A TALL DRINKS FRIDGE with glass doors and shelves of bottles stands on the RIGHT. " +
          "EXACTLY THREE SHOPPING BASKETS are stacked one on top of another on the floor beside the counter, " +
          "drawn clearly so all three can be counted. " +
          "A ROUND WALL CLOCK hangs on the BACK wall above a shelf unit.",
      },
      translation: [
        "M: 다인아, 여기가 네가 새로 꾸미는 걸 도운 학교 매점이야?",
        "W: 응, 가을 연휴 동안 끝냈어.",
        "M: 입구 근처에 둥글게 휜 계산대가 있네.",
        "W: 휜 모양이라 줄이 문을 안 막아.",
        "M: 왼쪽 벽에는 넓은 안내 틀이 있고.",
        "W: 월요일마다 그 주 가격을 바꿔 끼워.",
        "M: 계산대 옆에 바구니가 세 개 쌓여 있네.",
        "W: 사실 네 개야. 하나는 맨 아래 선반 밑에 있어.",
        "M: 오른쪽에는 키 큰 음료 냉장고가 있어.",
        "W: 소리가 좀 나는데 다들 봐 줘.",
        "M: 그리고 선반 위에 둥근 벽시계가 걸려 있네.",
        "W: 예전 교무실에서 가져온 거야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junhyuk, the science fair is on Friday morning."],
        ["M", "Are the display boards all in the hall already?"],
        ["W", "Eleven of the twelve. The last team brings theirs tomorrow."],
        ["M", "That's better than last year at this stage."],
        ["W", "They started in September this time."],
        ["M", "And what about the judges?"],
        ["W", "Four teachers, and they know which rooms to visit."],
        ["M", "Then most of it seems to be done."],
        ["W", "Except the labels. Every board needs a number card."],
        ["M", "Didn't the office print those last week?"],
        ["W", "They printed them using last year's numbering."],
        ["M", "So every one of them is wrong for this year."],
        ["W", "Completely, and the judges follow the numbers."],
        ["M", "I'll print the new number cards this afternoon."],
      ],
      choices: [
        "심사위원에게 연락하기",
        "전시판을 옮기기",
        "번호 카드를 새로 인쇄하기",
        "강당을 정리하기",
        "발표 순서를 정하기",
      ],
      answer: 3,
      clue: "I'll print the new number cards this afternoon.",
      explanation:
        "남자는 오늘 오후에 새 번호 카드를 인쇄하겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 준혁아, 과학전이 금요일 아침이야.",
        "M: 전시판은 다 강당에 들어왔어?",
        "W: 열둘 중 열하나. 마지막 조는 내일 가져와.",
        "M: 작년 이맘때보다 낫네.",
        "W: 이번엔 9월에 시작했거든.",
        "M: 심사위원은?",
        "W: 선생님 네 분. 어느 방을 도는지도 알고 계셔.",
        "M: 그럼 거의 다 된 것 같은데.",
        "W: 이름표만 빼고. 전시판마다 번호 카드가 필요해.",
        "M: 지난주에 행정실에서 인쇄하지 않았어?",
        "W: 작년 번호 기준으로 인쇄했어.",
        "M: 그럼 올해 것은 하나도 안 맞겠네.",
        "W: 완전히. 심사위원은 번호를 보고 다녀.",
        "M: 오늘 오후에 새 번호 카드를 인쇄할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Good afternoon. How can I help you today?"],
        ["W", "I'd like to have some posters printed for our club."],
        ["M", "What size are you thinking of?"],
        ["W", "The large size, the one you have on the wall."],
        ["M", "Those are seven dollars each."],
        ["W", "We need eight of them, please."],
        ["M", "Would you like them laminated?"],
        ["W", "How much does that add?"],
        ["M", "Two dollars per poster for the plastic coating."],
        ["W", "Laminate four of them and leave the rest plain."],
        ["M", "And school clubs get ten percent off the printing."],
        ["W", "Here is the club card, then."],
      ],
      choices: ["$58.40", "$64", "$56", "$60.40", "$62"],
      answer: 1,
      clue: "Those are seven dollars each.",
      explanation:
        "포스터 여덟 장은 56달러이고 10퍼센트를 빼면 50달러 40센트이며, 코팅 네 장분 8달러를 더하면 58달러 40센트이다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요. 무엇을 도와드릴까요?",
        "W: 동아리에서 쓸 포스터를 인쇄하려고요.",
        "M: 어느 크기로 생각하세요?",
        "W: 큰 크기요. 벽에 걸려 있는 그거요.",
        "M: 그건 한 장에 7달러입니다.",
        "W: 여덟 장 주세요.",
        "M: 코팅도 해 드릴까요?",
        "W: 그러면 얼마가 더 붙나요?",
        "M: 비닐 코팅은 한 장에 2달러입니다.",
        "W: 네 장만 코팅하고 나머지는 그대로 두세요.",
        "M: 그리고 학교 동아리는 인쇄비에서 10퍼센트를 빼 드립니다.",
        "W: 그럼 여기 동아리 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 오늘 일찍 집에 가는 이유를 고르시오.",
      lines: [
        ["M", "Hyerin, you're packing up already?"],
        ["W", "I have to leave right after this period."],
        ["M", "Is it the dentist appointment you moved?"],
        ["W", "That was last Thursday, so it isn't that."],
        ["M", "Then are you feeling unwell again?"],
        ["W", "I'm fine. My grandmother arrives at four."],
        ["M", "Is she staying with your family this time?"],
        ["W", "For two weeks, and nobody else is home to meet her."],
        ["M", "So somebody has to open the door."],
        ["W", "And carry her bags up three floors, apparently."],
      ],
      choices: [
        "치과 예약이 있어서",
        "몸이 아파서",
        "할머니를 맞이해야 해서",
        "학원에 가야 해서",
        "가족 여행을 가서",
      ],
      answer: 3,
      clue: "I'm fine. My grandmother arrives at four.",
      explanation:
        "여자는 네 시에 도착하는 할머니를 맞이해야 해서 일찍 간다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 혜린아, 벌써 짐 싸?",
        "W: 이번 시간 끝나고 바로 가야 해.",
        "M: 옮긴 치과 예약 때문이야?",
        "W: 그건 지난 목요일이라 아니야.",
        "M: 그럼 또 몸이 안 좋아?",
        "W: 괜찮아. 네 시에 할머니가 오셔.",
        "M: 이번엔 너희 집에 머무셔?",
        "W: 두 주 동안. 맞이할 사람이 나밖에 없어.",
        "M: 누가 문은 열어 드려야 하니까.",
        "W: 그리고 짐도 3층까지 들어야 해.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 모의 유엔 행사에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Sangwoo, are you taking part in the model UN event?"],
        ["M", "I'd like to, but I only know that it exists."],
        ["W", "It runs on the twenty-fifth, from nine until four."],
        ["M", "A whole day, then. Where is it held?"],
        ["W", "In the big hall, with the tables arranged in a square."],
        ["M", "How are the countries decided?"],
        ["W", "You write three you'd like and they assign one."],
        ["M", "What language do we speak during the sessions?"],
        ["W", "English only, except in the short breaks."],
        ["M", "Is there anything to prepare beforehand?"],
        ["W", "A one page position paper, due three days before."],
      ],
      choices: ["행사 날짜와 시간", "행사가 열리는 곳", "맡을 나라를 정하는 방법", "미리 준비할 것", "참가 인원"],
      answer: 5,
      clue: "It runs on the twenty-fifth, from nine until four.",
      explanation:
        "날짜와 시간, 장소, 나라 배정, 준비물은 말했지만 참가 인원은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 상우야, 모의 유엔 행사에 참가할 거야?",
        "M: 하고 싶은데 그런 게 있다는 것만 알아.",
        "W: 25일 아홉 시부터 네 시까지 해.",
        "M: 하루 종일이네. 어디서 해?",
        "W: 대강당에서. 탁자를 네모로 둘러 놔.",
        "M: 맡을 나라는 어떻게 정해?",
        "W: 하고 싶은 나라 세 개를 적으면 하나를 배정해 줘.",
        "M: 회의 때는 무슨 말로 해?",
        "W: 짧은 쉬는 시간 빼고는 영어로만.",
        "M: 미리 준비할 게 있어?",
        "W: 한 쪽짜리 입장문. 사흘 전까지 내야 해.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Riverside Weekend Market에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Here is some information about the Riverside Weekend Market, which began last spring. " +
            "The market is held on Saturday and Sunday, from nine in the morning until four. " +
            "It stretches along the path between the old bridge and the boat house. " +
            "Around seventy sellers come each weekend, and about half of them sell food. " +
            "There is no entrance fee, and dogs on a lead are welcome. " +
            "A small stage near the boat house hosts local musicians every afternoon. " +
            "Sellers must bring their own tables, and the market lends no equipment. " +
            "The market runs in light rain but closes completely in a storm.",
        ],
      ],
      choices: [
        "토요일과 일요일에 열린다",
        "옛 다리와 보트 창고 사이에 선다",
        "판매자가 일흔 명쯤 나온다",
        "입장료를 내야 한다",
        "폭풍이 오면 열지 않는다",
      ],
      answer: 4,
      clue: "There is no entrance fee, and dogs on a lead are welcome.",
      explanation:
        "입장료가 없다고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "M: 지난봄에 시작한 리버사이드 주말 장터에 대해 알려 드립니다. 장터는 토요일과 일요일 아침 아홉 시부터 네 시까지 열립니다. 옛 다리와 보트 창고 사이 길을 따라 이어집니다. 주말마다 판매자가 일흔 명쯤 나오고 그중 절반쯤이 음식을 팝니다. 입장료는 없고 목줄을 한 개도 데려올 수 있습니다. 보트 창고 근처 작은 무대에서는 오후마다 동네 음악가들이 연주합니다. 판매자는 탁자를 직접 가져와야 하며 장터에서는 장비를 빌려주지 않습니다. 가랑비에는 열지만 폭풍이 오면 완전히 닫습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 방과 후 강좌를 고르시오.",
      lines: [
        ["W", "Minjae, five after-school courses open next month."],
        ["M", "We've been waiting for this list all term."],
        ["W", "Let's narrow it down. Which days can you come?"],
        ["M", "Only Tuesday and Thursday, because of my tutoring."],
        ["W", "Then the two Monday ones are out."],
        ["M", "How many weeks does each one run?"],
        ["W", "They go from six weeks to twelve."],
        ["M", "Twelve weeks would run past the exams."],
        ["W", "One of the three left is twelve."],
        ["M", "And the fee should stay under forty thousand won."],
        ["W", "One of the last two is fifty-two thousand."],
        ["M", "So there's only one course we can take."],
        ["W", "I'll sign us both up tomorrow morning."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 5,
      clue: "Only Tuesday and Thursday, because of my tutoring.",
      explanation:
        "화·목, 12주 미만, 4만 원 미만인 강좌를 고른다. 세 조건을 모두 채우는 것은 ⑤이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Monday / Weeks: 8 / Fee: 30,000 won" },
          { no: 2, label: "②", value: "Day: Monday / Weeks: 6 / Fee: 35,000 won" },
          { no: 3, label: "③", value: "Day: Tuesday / Weeks: 12 / Fee: 28,000 won" },
          { no: 4, label: "④", value: "Day: Thursday / Weeks: 8 / Fee: 52,000 won" },
          { no: 5, label: "⑤", value: "Day: Thursday / Weeks: 6 / Fee: 38,000 won" },
        ],
      },
      translation: [
        "W: 민재야, 다음 달에 방과 후 강좌 다섯 개가 열려.",
        "M: 학기 내내 이 목록 기다렸어.",
        "W: 줄여 보자. 너는 무슨 요일에 올 수 있어?",
        "M: 과외 때문에 화요일이랑 목요일만.",
        "W: 그럼 월요일 두 개는 빠지네.",
        "M: 각각 몇 주 동안 해?",
        "W: 6주부터 12주까지 있어.",
        "M: 12주면 시험을 넘겨.",
        "W: 남은 셋 중 하나가 12주야.",
        "M: 그리고 수강료는 4만 원 아래여야 해.",
        "W: 남은 둘 중 하나는 5만 2천 원이야.",
        "M: 그럼 우리가 들을 수 있는 건 하나뿐이네.",
        "W: 내일 아침에 둘 다 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Dohyun, did you send the club photos to the yearbook team?"],
        ["M", "I picked fifteen, but I haven't sent them yet."],
        ["W", "They close the folder at six today."],
        ["M", "The files are large, so it takes a while."],
        ["W", "Do you want to start it now?"],
      ],
      choices: [
        "Yes, I'll upload them right away.",
        "The yearbook is finished.",
        "I have no photos at all.",
        "The folder opens tomorrow.",
        "You should pick the photos.",
      ],
      answer: 1,
      clue: "Do you want to start it now?",
      explanation:
        "지금 시작할지 물었으므로, 바로 올리겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 도현아, 졸업 앨범 팀에 동아리 사진 보냈어?",
        "M: 열다섯 장 골랐는데 아직 안 보냈어.",
        "W: 오늘 여섯 시에 폴더 닫아.",
        "M: 파일이 커서 시간이 좀 걸려.",
        "W: 지금 시작할래?",
        "M: 응, 바로 올릴게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Naeun, is the library open during the exam week?"],
        ["W", "Until nine, I think, but I'm not certain."],
        ["M", "I need a seat on Tuesday evening."],
        ["W", "Seats have to be booked from Monday."],
        ["M", "Where do I book one?"],
      ],
      choices: [
        "The library is closed all week.",
        "On the tablet by the entrance.",
        "I don't use the library.",
        "You should study at home.",
        "Tuesday is a holiday.",
      ],
      answer: 2,
      clue: "Where do I book one?",
      explanation:
        "예약하는 곳을 물었으므로, 입구 옆 태블릿에서 하라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 나은아, 시험 주간에 도서관 열어?",
        "W: 아홉 시까지일 텐데 확실하진 않아.",
        "M: 화요일 저녁에 자리가 필요해.",
        "W: 자리는 월요일부터 예약해야 해.",
        "M: 어디서 예약해?",
        "W: 입구 옆 태블릿에서.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyeon, how is the class newspaper doing this term?"],
        ["W", "We print two hundred copies and half come back unread."],
        ["M", "Where do you put them on the day?"],
        ["W", "In a pile on the table by the main entrance."],
        ["M", "And when does everybody pass that table?"],
        ["W", "At eight in the morning, in a hurry."],
        ["M", "So they pass it at the one moment nobody stops."],
        ["W", "I never thought about the timing at all."],
        ["M", "What happens at lunch, when people do stop?"],
        ["W", "The pile is still there, but nobody looks by then."],
        ["M", "Try handing them out at the cafeteria door instead."],
      ],
      choices: [
        "Nobody eats in the cafeteria.",
        "That's worth trying, I'll suggest it.",
        "We stopped printing the newspaper.",
        "The entrance is the best place.",
        "I don't read it either.",
      ],
      answer: 2,
      clue: "Try handing them out at the cafeteria door instead.",
      explanation:
        "급식실 문에서 나눠 주라는 제안이므로, 해 볼 만하다며 제안하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 서연아, 이번 학기 학급 신문은 어때?",
        "W: 200부를 찍는데 절반이 안 읽힌 채로 돌아와.",
        "M: 그날 신문을 어디에 둬?",
        "W: 정문 옆 탁자에 쌓아 둬.",
        "M: 다들 그 탁자를 언제 지나가?",
        "W: 아침 여덟 시에. 바쁘게.",
        "M: 그럼 아무도 멈추지 않는 딱 그 순간에 지나가는 거네.",
        "W: 시간에 대해서는 생각해 본 적이 없어.",
        "M: 사람들이 멈추는 점심때는 어때?",
        "W: 신문은 그대로 있는데 그때는 아무도 안 봐.",
        "M: 대신 급식실 문에서 나눠 줘 봐.",
        "W: 해 볼 만하다, 제안해 볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Kiyoung, you've been walking your neighbour's dog every evening."],
        ["M", "Since August. She broke her ankle in the summer."],
        ["W", "How long does the walk take?"],
        ["M", "Forty minutes around the park and back."],
        ["W", "Doesn't that eat into your study time?"],
        ["M", "It did at first, until I noticed something."],
        ["W", "What did you notice?"],
        ["M", "I think about problems better while I'm walking than at my desk."],
        ["W", "So the walk is study time now."],
        ["M", "Some of it, and the dog doesn't interrupt."],
        ["W", "Could I come along one evening?"],
      ],
      choices: [
        "Sure, we leave at seven.",
        "The dog is gone now.",
        "I stopped walking in August.",
        "You can't walk that far.",
        "My neighbour never asks me.",
      ],
      answer: 1,
      clue: "Could I come along one evening?",
      explanation:
        "여자가 같이 가도 되는지 물었으므로, 일곱 시에 나간다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 기영아, 저녁마다 이웃집 개를 산책시킨다며.",
        "M: 8월부터. 그분이 여름에 발목을 다치셨어.",
        "W: 산책이 얼마나 걸려?",
        "M: 공원을 돌아오는 데 40분.",
        "W: 공부 시간을 잡아먹지 않아?",
        "M: 처음엔 그랬는데 뭔가를 알게 됐어.",
        "W: 뭘 알았는데?",
        "M: 책상 앞보다 걸을 때 문제를 더 잘 생각하게 돼.",
        "W: 그럼 산책이 이제 공부 시간이네.",
        "M: 일부는 그래. 개는 말을 끊지도 않고.",
        "W: 나도 저녁에 한 번 따라가도 돼?",
        "M: 그럼, 우리는 일곱 시에 나가.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Hayoon이 Taemin에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Hayoon : ________________",
      lines: [
        [
          "W",
          "Hayoon and Taemin are running the school's charity book sale together. " +
            "They have agreed to sell every book at one thousand won. " +
            "This morning Taemin found four old books that are worth far more, " +
            "and he wants to put them out on the table at the same price. " +
            "Hayoon knows those four could raise as much as fifty books would. " +
            "She thinks they should be sold separately, with a note about their value. " +
            "She wants to ask him to keep those four aside for now. " +
            "In this situation, what would Hayoon most likely say to Taemin?",
        ],
      ],
      choices: [
        "Let's raise the price of every book.",
        "We should cancel the book sale.",
        "Set those four aside and sell them separately.",
        "I'll buy the four books myself.",
        "One thousand won is far too much.",
      ],
      answer: 3,
      clue: "She wants to ask him to keep those four aside for now.",
      explanation:
        "값이 훨씬 나가는 네 권은 따로 두고 따로 팔자는 뜻이므로 ③이 가장 적절하다.",
      translation: [
        "W: 하윤이와 태민이는 학교 자선 헌책 판매를 함께 맡고 있습니다. 두 사람은 모든 책을 천 원에 팔기로 했습니다. 오늘 아침 태민이는 값이 훨씬 나가는 오래된 책 네 권을 발견했고, 그것도 같은 값에 내놓으려 합니다. 하윤이는 그 네 권이 책 쉰 권만큼의 돈이 될 수 있다는 것을 압니다. 하윤이는 그 책들은 값을 알리는 쪽지와 함께 따로 팔아야 한다고 생각합니다. 하윤이는 그 네 권을 지금은 따로 빼 두자고 말하고 싶습니다. 이런 상황에서 하윤이가 태민이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to explain why a photograph of a spinning wheel " +
            "sometimes shows the spokes turning backwards. " +
            "A film camera does not record movement. It records a series of still pictures, " +
            "usually twenty-four of them every second. " +
            "Between one picture and the next, a spoke moves round by some fraction of a turn. " +
            "If it moves almost a whole gap between spokes, but not quite, " +
            "your eye matches each spoke to the nearest one in the previous frame, " +
            "and the nearest one is slightly behind where it started. " +
            "The wheel therefore appears to creep backwards while the car races forwards. " +
            "Your own eye never does this, because it does not take frames at all.",
        ],
      ],
      choices: [
        "how a camera lens focuses light",
        "why wheels seem to turn backwards on film",
        "how car wheels are balanced",
        "why films are shown at a fixed speed",
        "how the eye adjusts to bright light",
      ],
      answer: 2,
      clue: "A film camera does not record movement. It records a series of still pictures.",
      explanation:
        "여자는 영화가 정지 사진의 연속이라 바퀴살이 뒤로 도는 것처럼 보인다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 돌아가는 바퀴를 찍은 영상에서 바퀴살이 왜 가끔 거꾸로 도는 것처럼 보이는지 설명하려 합니다. 영화 카메라는 움직임을 담지 않습니다. 정지된 사진을 잇달아 담는데, 보통 1초에 스물네 장입니다. 한 장과 다음 장 사이에 바퀴살은 한 바퀴의 얼마만큼을 돌아갑니다. 바퀴살 사이 간격만큼 거의 다 돌았지만 조금 모자란다면, 여러분의 눈은 각 바퀴살을 앞 장에서 가장 가까운 바퀴살과 짝지어 보고, 그 가장 가까운 것은 출발점보다 살짝 뒤에 있습니다. 그래서 차는 앞으로 달리는데 바퀴는 뒤로 기어가는 것처럼 보입니다. 우리 눈은 결코 이렇게 보지 않습니다. 애초에 장면을 한 장씩 찍지 않기 때문입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to explain why a photograph of a spinning wheel shows the spokes turning backwards."],
        ["W", "A film camera records a series of still pictures, usually twenty-four every second."],
        ["W", "Between one picture and the next, a spoke moves round by some fraction of a turn."],
        ["W", "Your eye matches each spoke to the nearest one in the previous frame."],
        ["W", "Your own eye never does this, because it does not take frames at all."],
      ],
      choices: [
        "a camera recording still pictures each second",
        "a spoke moving by a fraction of a turn",
        "matching a spoke to the nearest one in the last frame",
        "the eye not taking frames at all",
        "the price of a film camera today",
      ],
      answer: 5,
      clue: "A film camera records a series of still pictures, usually twenty-four every second.",
      explanation:
        "초당 정지 사진, 조금씩 도는 바퀴살, 앞 장의 가장 가까운 살과 짝짓는 눈, 장면을 찍지 않는 눈은 언급되지만 카메라의 값은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
