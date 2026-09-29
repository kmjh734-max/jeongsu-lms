/** 고2 듣기 41회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 41회",
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
          "Good morning, students. This is the head of the library committee. " +
            "I am speaking about the reading room during the examination weeks. " +
            "Last term the room filled by seven in the morning, " +
            "and students who arrived at eight found every seat taken by a bag. " +
            "From the first week of December the reading room will open at six, " +
            "two hours earlier than usual, and stay open until eleven at night. " +
            "In exchange we ask one thing of you. " +
            "If you leave your seat for more than thirty minutes, take your things with you. " +
            "A seat held by a bag helps nobody, including the person who left it. Thank you.",
        ],
      ],
      choices: [
        "시험 기간 열람실 운영 변경을 안내하려고",
        "도서 반납을 독촉하려고",
        "열람실 공사를 알리려고",
        "독서 행사를 소개하려고",
        "도서관 봉사자를 모으려고",
      ],
      answer: 1,
      clue: "From the first week of December the reading room will open at six.",
      explanation:
        "남자는 시험 기간에 열람실을 더 일찍 열고 늦게까지 여는 변경 사항을 안내한다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 도서관 운영 위원장입니다. 시험 기간 열람실에 대해 말씀드립니다. 지난 학기에는 아침 일곱 시면 자리가 다 찼고, 여덟 시에 온 학생은 모든 자리가 가방으로 맡아져 있는 것을 보았습니다. 12월 첫 주부터 열람실은 평소보다 두 시간 이른 여섯 시에 열고 밤 열한 시까지 엽니다. 대신 한 가지만 부탁드립니다. 자리를 30분 넘게 비울 때는 짐을 가지고 나가 주세요. 가방으로 맡아 둔 자리는 두고 간 사람을 포함해 누구에게도 도움이 되지 않습니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Hyerin, I've been reading the same chapter for four days."],
        ["W", "The same one? What happens each time you open it?"],
        ["M", "I start at the first page and read until I get tired."],
        ["W", "So you read the beginning four times and the end never."],
        ["M", "That is roughly what has happened, yes."],
        ["W", "Start from where you stopped, even if you remember nothing."],
        ["M", "But then I've lost the thread of the earlier part."],
        ["W", "You haven't. It comes back within a page."],
        ["M", "It feels wrong to go on without being sure."],
        ["W", "Being sure of page one is not the same as knowing the chapter."],
        ["M", "And the last pages are the ones I'll be examined on."],
        ["W", "Finish it once badly. Then read it again knowing where it goes."],
      ],
      choices: [
        "책은 처음부터 다시 읽어야 한다",
        "멈춘 자리에서 이어 읽고 끝내야 한다",
        "책은 소리 내어 읽어야 한다",
        "어려운 부분은 건너뛰어야 한다",
        "읽은 내용을 요약해야 한다",
      ],
      answer: 2,
      clue: "Start from where you stopped, even if you remember nothing.",
      explanation:
        "여자는 처음으로 돌아가지 말고 멈춘 자리에서 이어 읽어 끝내라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 혜린아, 나흘째 같은 단원을 읽고 있어.",
        "W: 같은 단원을? 펼칠 때마다 어떻게 해?",
        "M: 첫 쪽부터 시작해서 지칠 때까지 읽어.",
        "W: 그럼 앞부분은 네 번 읽고 뒷부분은 한 번도 안 읽은 거네.",
        "M: 대충 그렇게 됐어.",
        "W: 아무것도 기억 안 나도 멈춘 자리에서 시작해.",
        "M: 그러면 앞부분 흐름을 놓치잖아.",
        "W: 안 놓쳐. 한 쪽이면 돌아와.",
        "M: 확실하지 않은 채로 넘어가는 게 찜찜해.",
        "W: 첫 쪽을 확실히 아는 것과 단원을 아는 건 달라.",
        "M: 시험에 나오는 건 뒤쪽인데.",
        "W: 한 번은 엉성하게라도 끝내. 그다음에 어디로 가는지 알고 다시 읽어.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When you disagree with someone, the temptation is to answer at once. " +
            "Try something slower. " +
            "Say their position back to them until they agree that you have it right. " +
            "Two things happen. The other person stops defending " +
            "and starts listening, because they no longer have to prove they were heard. " +
            "And you discover, surprisingly often, that the position you were about to attack " +
            "is not the one they actually hold. " +
            "The argument that follows is then about the real difference between you, " +
            "which is the only argument worth having.",
        ],
      ],
      choices: [
        "논쟁은 피해야 한다",
        "반박하기 전에 상대의 주장을 되짚어 말해야 한다",
        "의견은 글로 정리해야 한다",
        "다수의 의견을 따라야 한다",
        "감정을 드러내지 말아야 한다",
      ],
      answer: 2,
      clue: "Say their position back to them until they agree that you have it right.",
      explanation:
        "남자는 곧바로 반박하지 말고 상대의 주장을 되짚어 확인하라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 누군가와 의견이 다를 때는 곧바로 되받고 싶어집니다. 더 느린 방법을 써 보세요. 상대의 주장을 다시 말해 주고, 제대로 이해했다고 상대가 인정할 때까지 그렇게 하세요. 두 가지 일이 일어납니다. 상대는 방어를 멈추고 듣기 시작합니다. 자기 말이 전해졌다는 것을 더 증명하지 않아도 되기 때문입니다. 그리고 여러분은 공격하려던 그 주장이 사실 상대가 가진 주장이 아니었다는 것을 꽤 자주 알게 됩니다. 그러면 이어지는 논쟁은 두 사람 사이의 진짜 차이에 관한 것이 되고, 그것만이 할 만한 논쟁입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Sangwoo, is this the workshop the technology club uses?"],
        ["M", "Yes, we were given it at the start of the year."],
        ["W", "A long workbench runs along the back wall."],
        ["M", "Four of us can work at it without getting in the way."],
        ["W", "There's a tall tool cabinet on the left."],
        ["M", "Everything has its own outline drawn inside."],
        ["W", "Three stools stand in front of the bench."],
        ["M", "Two, actually. The third one went to the art room."],
        ["W", "A round wall clock hangs above the door."],
        ["M", "We stop ten minutes before the bell to tidy up."],
        ["W", "And a wide window fills the right wall."],
        ["M", "It opens fully, which matters when we use glue."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Two, actually. The third one went to the art room.",
      explanation:
        "여자가 의자가 세 개라고 하자 남자가 두 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.5, 0.42],
          [0.08, 0.36],
          [0.45, 0.8],
          [0.58, 0.08],
          [0.9, 0.42],
        ],
        scene:
          "A school technology workshop drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A LONG WORKBENCH runs along the BACK wall across the middle of the picture. " +
          "A TALL TOOL CABINET with open shelves of tools stands against the LEFT wall. " +
          "EXACTLY THREE ROUND STOOLS stand on the floor in front of the workbench, " +
          "evenly spaced with clear gaps so all three are easy to count. " +
          "A ROUND WALL CLOCK hangs on the BACK wall above a door. " +
          "A WIDE WINDOW fills the RIGHT wall.",
      },
      translation: [
        "W: 상우야, 여기가 기술 동아리가 쓰는 작업실이야?",
        "M: 응, 올해 초에 받았어.",
        "W: 뒷벽을 따라 긴 작업대가 있네.",
        "M: 넷이 서로 방해 안 하고 일할 수 있어.",
        "W: 왼쪽에는 키 큰 공구장이 있고.",
        "M: 안에 물건마다 자리 모양이 그려져 있어.",
        "W: 작업대 앞에는 의자가 세 개 있네.",
        "M: 사실 두 개야. 세 번째는 미술실로 갔어.",
        "W: 문 위에는 둥근 벽시계가 걸려 있어.",
        "M: 종 치기 10분 전에 멈추고 정리해.",
        "W: 그리고 오른쪽 벽은 넓은 창문이 차지하고 있네.",
        "M: 완전히 열려. 접착제 쓸 때 중요해.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Naeun, the school art exhibition opens on Tuesday."],
        ["W", "Are all the works in the hall already?"],
        ["M", "Forty of the forty-two. Two arrive tomorrow morning."],
        ["W", "What about the lighting along the walls?"],
        ["M", "The caretaker adjusted every lamp on Friday."],
        ["W", "Then the big pieces are ready."],
        ["M", "Except the labels. Each work needs a card beside it."],
        ["W", "Didn't the design team print those last week?"],
        ["M", "They printed them before six students changed their titles."],
        ["W", "So six of the cards are wrong."],
        ["M", "And visitors read the card before the picture."],
        ["W", "I'll print the six new labels this afternoon."],
      ],
      choices: [
        "작품을 걸기",
        "조명을 맞추기",
        "이름표를 새로 인쇄하기",
        "관리인에게 연락하기",
        "제목을 다시 정하기",
      ],
      answer: 3,
      clue: "I'll print the six new labels this afternoon.",
      explanation:
        "여자는 오늘 오후에 새 이름표 여섯 장을 인쇄하겠다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 나은아, 학교 미술 전시가 화요일에 열려.",
        "W: 작품은 다 강당에 들어왔어?",
        "M: 마흔둘 중 마흔. 두 점은 내일 아침에 와.",
        "W: 벽 조명은?",
        "M: 관리인 아저씨가 금요일에 등을 다 맞춰 주셨어.",
        "W: 그럼 큰 건 다 됐네.",
        "M: 이름표만 빼고. 작품마다 옆에 카드가 필요해.",
        "W: 지난주에 디자인 팀이 인쇄하지 않았어?",
        "M: 여섯 명이 제목을 바꾸기 전에 인쇄했어.",
        "W: 그럼 카드 여섯 장이 틀렸겠네.",
        "M: 관람객은 그림보다 카드를 먼저 읽는데.",
        "W: 오늘 오후에 새 이름표 여섯 장을 인쇄할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good morning. Are you here about the trophy engraving?"],
        ["M", "Yes, we need some for the school sports day."],
        ["W", "When is the sports day being held this year?"],
        ["M", "On the twentieth, so we have about ten days."],
        ["W", "That is plenty of time for a small order."],
        ["M", "Good. What sizes do you have in stock?"],
        ["W", "A small trophy is fourteen dollars each."],
        ["M", "We'd like five of those, please."],
        ["W", "Engraving a name is three dollars per trophy."],
        ["M", "Engrave all five, then."],
        ["W", "Would you like a wooden base as well?"],
        ["M", "How much does the base add?"],
        ["W", "Five dollars each, but they are optional."],
        ["M", "We'll leave the bases this year."],
        ["W", "And school orders over eighty dollars get ten percent off."],
        ["M", "Here is the school card, then."],
      ],
      choices: ["$76.50", "$85", "$78.50", "$70", "$90"],
      answer: 1,
      clue: "A small trophy is fourteen dollars each.",
      explanation:
        "상패 다섯 개 70달러와 새김 15달러를 더하면 85달러이고, 10퍼센트를 빼면 76달러 50센트이다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요. 상패 새김 때문에 오셨나요?",
        "M: 네, 학교 체육 대회에 쓸 게 몇 개 필요해요.",
        "W: 올해 체육 대회가 언제인가요?",
        "M: 20일이요. 열흘쯤 남았어요.",
        "W: 적은 수량이면 시간은 넉넉합니다.",
        "M: 다행이네요. 어떤 크기가 있나요?",
        "W: 작은 상패는 하나에 14달러입니다.",
        "M: 다섯 개 주세요.",
        "W: 이름 새김은 상패 하나에 3달러입니다.",
        "M: 다섯 개 다 새겨 주세요.",
        "W: 나무 받침도 하시겠어요?",
        "M: 받침은 얼마가 더 붙나요?",
        "W: 하나에 5달러인데 선택 사항입니다.",
        "M: 올해는 받침은 빼겠습니다.",
        "W: 그리고 80달러가 넘는 학교 주문은 10퍼센트 할인됩니다.",
        "M: 그럼 여기 학교 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 발표 순서를 뒤로 미룬 이유를 고르시오.",
      lines: [
        ["M", "Chaeyeon, you swapped to the last presentation slot?"],
        ["W", "I asked on Monday and the teacher agreed."],
        ["M", "Were the slides not ready?"],
        ["W", "They were finished over the weekend, all twenty-two."],
        ["M", "Then were you nervous about going first?"],
        ["W", "No, my part depends on the group before us."],
        ["M", "The one presenting the survey results?"],
        ["W", "Exactly. My whole section compares their numbers with mine."],
        ["M", "So going first would have made no sense at all."],
        ["W", "The audience would have heard my answer before the question."],
      ],
      choices: [
        "자료가 안 끝나서",
        "긴장돼서",
        "앞 조의 내용을 들어야 해서",
        "몸이 아파서",
        "다른 수업이 있어서",
      ],
      answer: 3,
      clue: "No, my part depends on the group before us.",
      explanation:
        "여자는 앞 조의 발표 내용과 비교해야 해서 순서를 뒤로 옮겼다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 채연아, 발표 순서를 마지막으로 바꿨어?",
        "W: 월요일에 여쭤봤더니 선생님이 그러라고 하셨어.",
        "M: 자료가 안 됐어?",
        "W: 주말에 스물두 장 다 끝냈어.",
        "M: 그럼 첫 번째가 긴장돼서?",
        "W: 아니, 내 부분이 우리 앞 조에 달려 있어.",
        "M: 설문 결과 발표하는 그 조?",
        "W: 맞아. 내 부분 전체가 그 조 숫자랑 내 숫자를 견줘.",
        "M: 그럼 첫 번째로 하면 말이 안 됐겠네.",
        "W: 청중이 질문보다 답을 먼저 듣는 셈이지.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 독서 마라톤에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Seoyun, what exactly is the reading marathon?"],
        ["W", "It runs for six weeks, from the first of November."],
        ["M", "Do we read whatever we like?"],
        ["W", "Anything from the library, but not comics."],
        ["M", "How do they count what we've read?"],
        ["W", "You write the title and the page count in a small booklet."],
        ["M", "Where do we get the booklet?"],
        ["W", "At the library desk, from Monday onwards."],
        ["M", "Is there a target we're supposed to reach?"],
        ["W", "Two thousand pages over the six weeks."],
        ["M", "That's about fifty pages a day."],
        ["W", "Less, if you count the weekends properly."],
      ],
      choices: ["행사 기간", "읽을 수 있는 책", "기록하는 방법", "목표 분량", "상을 주는 방법"],
      answer: 5,
      clue: "It runs for six weeks, from the first of November.",
      explanation:
        "기간, 읽을 책, 기록 방법, 목표는 말했지만 상에 대해서는 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 서윤아, 독서 마라톤이 정확히 뭐야?",
        "W: 11월 1일부터 여섯 주 동안 해.",
        "M: 아무 책이나 읽어도 돼?",
        "W: 도서관 책이면 되는데 만화는 안 돼.",
        "M: 읽은 걸 어떻게 세?",
        "W: 작은 수첩에 제목이랑 쪽수를 적어.",
        "M: 수첩은 어디서 받아?",
        "W: 월요일부터 도서관 접수대에서.",
        "M: 채워야 하는 목표가 있어?",
        "W: 여섯 주 동안 이천 쪽.",
        "M: 하루에 쉰 쪽쯤이네.",
        "W: 주말을 제대로 세면 그보다 적어.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Fernside Winter Market에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Here is some information about the Fernside Winter Market, which returns in December. " +
            "The market runs for twelve days, from the tenth to the twenty-first. " +
            "It opens at four in the afternoon and closes at ten each evening. " +
            "The stalls fill the square in front of the old town hall. " +
            "Around fifty sellers take part, and most of them are from this region. " +
            "Entry is free, and there is a small ice rink at the far end. " +
            "Skating costs three thousand won for forty minutes, skates included. " +
            "The market goes ahead in snow, but the rink closes if it rains.",
        ],
      ],
      choices: [
        "열이틀 동안 열린다",
        "오후 네 시에 문을 연다",
        "옛 시청 앞 광장에 선다",
        "입장료를 내야 한다",
        "비가 오면 빙상장은 닫는다",
      ],
      answer: 4,
      clue: "Entry is free, and there is a small ice rink at the far end.",
      explanation:
        "입장은 무료라고 했으므로 ④가 일치하지 않는다.",
      translation: [
        "W: 12월에 다시 열리는 펀사이드 겨울 장터에 대해 알려 드립니다. 장터는 10일부터 21일까지 열이틀 동안 이어집니다. 매일 오후 네 시에 열고 밤 열 시에 닫습니다. 가게들은 옛 시청 앞 광장을 가득 채웁니다. 판매자는 쉰 명쯤이고 대부분 이 지역 사람들입니다. 입장은 무료이고 한쪽 끝에는 작은 빙상장이 있습니다. 스케이트는 40분에 3천 원이며 대여료가 포함되어 있습니다. 눈이 와도 장터는 열지만 비가 오면 빙상장은 닫습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 구입할 독서대를 고르시오.",
      lines: [
        ["M", "Hayoon, these five book stands are all in stock."],
        ["W", "I've been reading with a pile of books under mine."],
        ["M", "Then let's fix that. What's your limit?"],
        ["W", "Forty thousand won at the most."],
        ["M", "That takes out the most expensive one."],
        ["W", "And it has to fold flat for my bag."],
        ["M", "One of the four left doesn't fold at all."],
        ["W", "I also want the angle to be adjustable."],
        ["M", "Two of the remaining three have a fixed angle."],
        ["W", "So there's only one stand left for me."],
        ["M", "I'd order it tonight, before the sale ends."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Forty thousand won at the most.",
      explanation:
        "4만 원 이하, 접히는 것, 각도 조절이 되는 것을 고른다. 세 조건을 모두 채우는 것은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Price: 52,000 won / Folds: Yes / Angle: Adjustable" },
          { no: 2, label: "②", value: "Price: 30,000 won / Folds: No / Angle: Adjustable" },
          { no: 3, label: "③", value: "Price: 38,000 won / Folds: Yes / Angle: Adjustable" },
          { no: 4, label: "④", value: "Price: 25,000 won / Folds: Yes / Angle: Fixed" },
          { no: 5, label: "⑤", value: "Price: 35,000 won / Folds: Yes / Angle: Fixed" },
        ],
      },
      translation: [
        "M: 하윤아, 이 다섯 개가 다 재고가 있어.",
        "W: 나는 독서대 밑에 책을 쌓아 놓고 읽고 있어.",
        "M: 그럼 해결하자. 얼마까지 쓸 수 있어?",
        "W: 많아야 4만 원.",
        "M: 그럼 제일 비싼 건 빠지네.",
        "W: 그리고 가방에 넣게 납작하게 접혀야 해.",
        "M: 남은 넷 중 하나는 아예 안 접혀.",
        "W: 각도도 조절되면 좋겠어.",
        "M: 남은 셋 중 둘은 각도가 고정이야.",
        "W: 그럼 나한테 남는 건 하나뿐이네.",
        "M: 할인 끝나기 전에 오늘 밤에 주문하는 게 좋겠어.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Dain, did you print the programme for the concert?"],
        ["W", "Sixty copies, but the ink ran out at the end."],
        ["M", "How many came out properly?"],
        ["W", "About forty. The rest are too pale to read."],
        ["M", "Shall I bring a new cartridge from the office?"],
      ],
      choices: [
        "No, sixty is enough.",
        "The concert is cancelled.",
        "Yes, please, and I'll reprint them.",
        "I never printed anything.",
        "You should read them yourself.",
      ],
      answer: 3,
      clue: "Shall I bring a new cartridge from the office?",
      explanation:
        "잉크를 가져올지 물었으므로, 가져다주면 다시 인쇄하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 다인아, 음악회 안내지 인쇄했어?",
        "W: 예순 장 했는데 끝에서 잉크가 떨어졌어.",
        "M: 제대로 나온 건 몇 장이야?",
        "W: 마흔 장쯤. 나머지는 너무 흐려서 못 읽어.",
        "M: 행정실에서 새 잉크 가져올까?",
        "W: 응, 부탁해. 내가 다시 인쇄할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junho, are you free right after school?"],
        ["M", "Until about five, yes."],
        ["W", "The club needs two people to carry the boxes."],
        ["M", "Where are they going?"],
        ["W", "From the club room down to the front gate."],
      ],
      choices: [
        "I'm busy until seven.",
        "All right, I'll come at four.",
        "The boxes are empty.",
        "You should ask the teacher.",
        "The club room is closed.",
      ],
      answer: 2,
      clue: "From the club room down to the front gate.",
      explanation:
        "방과 후에 시간이 있다고 했고 옮길 곳을 들었으므로, 네 시에 가겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준호야, 방과 후 바로 시간 돼?",
        "M: 다섯 시쯤까지는 돼.",
        "W: 동아리에서 상자 옮길 사람 두 명이 필요해.",
        "M: 어디로 옮기는데?",
        "W: 동아리방에서 정문까지.",
        "M: 알겠어, 네 시에 갈게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, how is the school garden club doing this term?"],
        ["M", "The plants are fine, but the members have stopped coming."],
        ["W", "When do you hold the sessions?"],
        ["M", "Saturday mornings, at nine."],
        ["W", "Nine on a Saturday is early for a school week."],
        ["M", "It's the coolest part of the day, though."],
        ["W", "Cool for the plants, and impossible for the people."],
        ["M", "We do water them in the evening in summer."],
        ["W", "Then why not meet in the evening all year?"],
        ["M", "I suppose there's no real reason not to."],
        ["W", "Try one Friday evening and see who comes."],
      ],
      choices: [
        "Nobody joined the club.",
        "That's worth a try, I'll ask them.",
        "The plants would die.",
        "Saturday is the only day.",
        "You should water them.",
      ],
      answer: 2,
      clue: "Try one Friday evening and see who comes.",
      explanation:
        "금요일 저녁에 한 번 해 보라는 제안이므로, 해 볼 만하다며 물어보겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태민아, 이번 학기 텃밭 동아리는 어때?",
        "M: 식물은 잘 있는데 부원들이 안 와.",
        "W: 모임을 언제 해?",
        "M: 토요일 아침 아홉 시에.",
        "W: 한 주 학교 다니고 토요일 아홉 시는 이르지.",
        "M: 그래도 하루 중 제일 선선한 때야.",
        "W: 식물한테는 선선하고 사람한테는 무리지.",
        "M: 여름엔 저녁에 물 주긴 해.",
        "W: 그럼 일 년 내내 저녁에 모이면 안 돼?",
        "M: 안 될 이유는 딱히 없네.",
        "W: 금요일 저녁에 한 번 해 보고 누가 오는지 봐.",
        "M: 해 볼 만하다, 물어볼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Suyeon, you've been baking bread at home on Sundays."],
        ["W", "Since the summer. One loaf a week."],
        ["M", "Is it not a lot of work for one loaf?"],
        ["W", "Twenty minutes of work and eight hours of waiting."],
        ["M", "So the oven does most of it."],
        ["W", "The time does most of it. The oven only finishes it."],
        ["M", "Did it go well from the beginning?"],
        ["W", "The first four were flat enough to use as plates."],
        ["M", "What changed after the fourth one?"],
        ["W", "I started weighing the water instead of guessing."],
        ["M", "Could you show me how you start a loaf?"],
      ],
      choices: [
        "Sure, come over on Sunday.",
        "I stopped baking in August.",
        "I don't have an oven.",
        "You can't bake bread.",
        "The bread is always flat.",
      ],
      answer: 1,
      clue: "Could you show me how you start a loaf?",
      explanation:
        "남자가 빵 만드는 법을 보여 달라고 했으므로, 일요일에 오라는 ①이 가장 자연스럽다.",
      translation: [
        "M: 수연아, 일요일마다 집에서 빵을 굽는다며.",
        "W: 여름부터. 일주일에 한 덩이.",
        "M: 한 덩이치고는 일이 많지 않아?",
        "W: 일하는 건 20분이고 기다리는 게 여덟 시간이야.",
        "M: 그럼 오븐이 대부분 하는 거네.",
        "W: 시간이 대부분 해. 오븐은 마무리만 해.",
        "M: 처음부터 잘됐어?",
        "W: 처음 네 번은 접시로 써도 될 만큼 납작했어.",
        "M: 네 번째 뒤에 뭐가 달라졌어?",
        "W: 물을 짐작하지 않고 저울로 재기 시작했어.",
        "M: 빵 만들기 시작하는 걸 보여 줄래?",
        "W: 그럼, 일요일에 와.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Hyunwoo가 Nayeon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Hyunwoo : ________________",
      lines: [
        [
          "M",
          "Hyunwoo and Nayeon are preparing the class presentation for tomorrow. " +
            "They have twelve minutes in total and two speakers. " +
            "Nayeon has rehearsed her half and it lasts eleven minutes on its own. " +
            "That would leave Hyunwoo about sixty seconds for everything he prepared. " +
            "Her section repeats the background three times in different words. " +
            "The teacher stops any group that goes over the time limit. " +
            "Hyunwoo wants her to cut the repeated background down to one version. " +
            "In this situation, what would Hyunwoo most likely say to Nayeon?",
        ],
      ],
      choices: [
        "Let's present on our own next time.",
        "You should speak much faster.",
        "Cut the background down to one version.",
        "I'll drop my part completely.",
        "Twelve minutes is far too long.",
      ],
      answer: 3,
      clue: "Hyunwoo wants her to cut the repeated background down to one version.",
      explanation:
        "배경 설명이 세 번 되풀이되므로 하나로 줄이자는 ③이 가장 적절하다.",
      translation: [
        "M: 현우와 나연이는 내일 있을 학급 발표를 준비하고 있습니다. 두 사람에게 주어진 시간은 모두 12분이고 발표자는 둘입니다. 나연이는 자기 몫을 연습해 보았는데 그것만으로 11분이 걸립니다. 그러면 현우가 준비한 모든 것에 쓸 시간은 1분쯤뿐입니다. 나연이의 부분은 배경 설명을 말만 바꾸어 세 번 되풀이합니다. 선생님은 시간을 넘긴 조를 도중에 끊습니다. 현우는 되풀이되는 배경 설명을 하나로 줄이기를 바랍니다. 이런 상황에서 현우가 나연이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to explain why a photograph of the moon " +
            "so rarely looks the way the moon looked to you. " +
            "Your eye is not a camera. " +
            "It adjusts continuously, treating the bright disc and the dark sky as two separate problems, " +
            "and it hands the brain a combined picture that no single exposure could capture. " +
            "A camera must choose. " +
            "Expose for the sky and the moon becomes a white blur with no features at all. " +
            "Expose for the moon and everything around it falls into black. " +
            "The moon is also much smaller than memory insists. " +
            "It covers about half a degree of sky, " +
            "so an ordinary lens records a grain of light where you remember a lantern.",
        ],
      ],
      choices: [
        "how telescopes magnify distant objects",
        "why photographs of the moon disappoint us",
        "how the moon causes the tides",
        "why the moon appears at different times",
        "how cameras measure the speed of light",
      ],
      answer: 2,
      clue: "A camera must choose.",
      explanation:
        "여자는 눈과 달리 카메라는 한쪽만 택해야 하고 달이 실제로 작아 사진이 기억과 다르다고 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 달 사진이 왜 우리가 본 달과 좀처럼 같지 않은지 설명하려 합니다. 우리 눈은 카메라가 아닙니다. 눈은 끊임없이 조절하며 밝은 원반과 어두운 하늘을 서로 다른 문제로 다루고, 한 번의 노출로는 담을 수 없는 그림을 합쳐서 뇌에 건넵니다. 카메라는 골라야 합니다. 하늘에 맞추면 달은 아무 무늬도 없는 흰 덩어리가 됩니다. 달에 맞추면 그 둘레는 모두 검게 내려앉습니다. 게다가 달은 기억이 우기는 것보다 훨씬 작습니다. 하늘에서 반 도쯤을 차지하니, 보통 렌즈는 우리가 등불로 기억하는 자리에 빛 알갱이 하나를 담게 됩니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to explain why a photograph of the moon rarely looks the way the moon looked to you."],
        ["W", "Your eye adjusts continuously, treating the bright disc and the dark sky as two separate problems."],
        ["W", "Expose for the sky and the moon becomes a white blur."],
        ["W", "The moon covers about half a degree of sky."],
        ["W", "An ordinary lens records a grain of light where you remember a lantern."],
      ],
      choices: [
        "the eye treating the disc and the sky separately",
        "the moon becoming a white blur in a photograph",
        "the moon covering about half a degree of sky",
        "an ordinary lens recording a grain of light",
        "the distance from the earth to the moon",
      ],
      answer: 5,
      clue: "Expose for the sky and the moon becomes a white blur.",
      explanation:
        "원반과 하늘을 따로 다루는 눈, 흰 덩어리가 되는 달, 반 도쯤 되는 크기, 빛 알갱이로 담기는 렌즈는 언급되지만 지구와 달 사이의 거리는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
