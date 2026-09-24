/** 고3 듣기 26회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 26회",
  gradeLevel: "high3",
  speechSpeed: 0.8,
  folder: "고3 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Good afternoon, third-year students. This is Ms. Ok from the college counseling office. " +
            "I want to say something about the sample essays we lend out. " +
            "We keep a folder of successful essays from past graduates, " +
            "and every year it is the most borrowed thing in this office. " +
            "That is fine, but this month we have read twelve drafts " +
            "that follow the same opening line as one of those samples. " +
            "Admissions readers see thousands of essays, " +
            "and a borrowed opening is the first thing they recognise. " +
            "So please read the samples for structure, not for sentences. " +
            "Notice how long the writer spends on one example, where they stop explaining. " +
            "Then close the folder and write about your own week. Thank you.",
        ],
      ],
      choices: [
        "예시 글은 구조만 참고하라고 당부하려고",
        "예시 글 대여를 중단한다고 알리려고",
        "자기소개서 마감일을 알리려고",
        "상담 신청 방법을 안내하려고",
        "졸업생 강연을 알리려고",
      ],
      answer: 1,
      clue: "So please read the samples for structure, not for sentences.",
      explanation:
        "여자는 예시 글의 문장을 빌려 쓰지 말고 구조만 참고한 뒤 자기 이야기를 쓰라고 당부한다. 따라서 답은 ①이다.",
      translation: [
        "W: 3학년 학생 여러분, 안녕하세요. 진학 상담실 옥입니다. 저희가 빌려주는 예시 글에 대해 말씀드리려 합니다. 졸업생들의 합격 자기소개서를 모은 철을 두고 있는데, 해마다 이 방에서 가장 많이 빌려 가는 자료입니다. 그건 괜찮습니다. 그런데 이번 달에 그 예시 중 하나와 첫 문장이 똑같은 초안을 열두 편 읽었습니다. 입학 사정관은 수천 편을 읽고, 빌려 온 첫 문장은 그들이 가장 먼저 알아보는 것입니다. 그러니 예시 글은 문장이 아니라 구조를 보려고 읽으세요. 글쓴이가 한 사례에 얼마나 오래 머무는지, 어디서 설명을 멈추는지를 보세요. 그러고 나서 철을 덮고 여러분 자신의 한 주를 쓰세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Hyunwoo, I've been keeping a list of every task I finish."],
        ["M", "Finished tasks? Not the ones you still have to do?"],
        ["W", "Both, but the finished list is longer and it feels good."],
        ["M", "How long is the unfinished one?"],
        ["W", "Forty-one items. I haven't looked at it since Sunday."],
        ["M", "So the list that feels good is the one you read."],
        ["W", "Is that a bad thing? It keeps me going."],
        ["M", "It does, until the forty-one become sixty."],
        ["W", "You think I'm avoiding the real list."],
        ["M", "I think you've built a comfortable one to stand in front of it."],
        ["W", "Then what should I do with the finished list?"],
        ["M", "Keep it, but read it after the other one, never instead."],
      ],
      choices: [
        "할 일 목록은 짧게 써야 한다",
        "끝낸 목록은 남은 목록을 본 뒤에 봐야 한다",
        "성취를 기록하면 동기가 생긴다",
        "계획은 매일 새로 세워야 한다",
        "일은 어려운 것부터 해야 한다",
      ],
      answer: 2,
      clue: "Keep it, but read it after the other one, never instead.",
      explanation:
        "남자는 끝낸 목록이 남은 목록을 가리는 편한 목록이 되었다며, 남은 목록을 본 뒤에 읽으라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 현우야, 나 끝낸 일을 하나씩 적어 두고 있어.",
        "M: 끝낸 일? 아직 해야 할 일 말고?",
        "W: 둘 다. 그런데 끝낸 목록이 더 길고 기분이 좋아.",
        "M: 안 끝낸 목록은 얼마나 길어?",
        "W: 마흔한 개. 일요일 이후로는 안 봤어.",
        "M: 그럼 기분 좋은 목록이 네가 읽는 목록이구나.",
        "W: 그게 나빠? 덕분에 계속 하게 되는데.",
        "M: 그렇지. 마흔한 개가 예순 개가 되기 전까지는.",
        "W: 내가 진짜 목록을 피하고 있다는 거야?",
        "M: 그 앞에 세워 둘 편한 목록을 하나 만든 것 같아.",
        "W: 그럼 끝낸 목록은 어떻게 해?",
        "M: 남겨 둬. 대신 다른 목록을 본 뒤에 읽어. 대신 읽지 말고.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We tend to treat a plan and a prediction as the same document. " +
            "They are not, and mixing them is why so many plans collapse. " +
            "A plan says what you intend to do. " +
            "A prediction says what you think will actually happen, " +
            "including the parts you do not control. " +
            "When a team writes a schedule, they almost always write the plan " +
            "and then read it back as if it were the prediction. " +
            "Nobody wrote down the two weeks of illness that happen every winter, " +
            "or the approval that has taken a month every previous time. " +
            "Those are not risks. They are the normal weather of that work. " +
            "So write the plan, then write beside it what has actually happened " +
            "the last three times you did something like this. " +
            "The gap between those two columns is the real schedule.",
        ],
      ],
      choices: [
        "계획은 여유 있게 세워야 한다",
        "예측은 전문가에게 맡겨야 한다",
        "일정은 자주 고쳐야 한다",
        "계획 옆에 지난 경험을 적어 함께 봐야 한다",
        "위험 요소를 미리 없애야 한다",
      ],
      answer: 4,
      clue: "So write the plan, then write beside it what has actually happened the last three times you did something like this.",
      explanation:
        "여자는 계획과 예측이 다르다며, 계획 옆에 지난 세 번 실제로 일어난 일을 적어 두 열의 차이를 봐야 한다고 말한다. 따라서 답은 ④이다.",
      translation: [
        "W: 우리는 계획과 예측을 같은 문서처럼 다루는 경향이 있습니다. 둘은 다르고, 그것을 섞는 것이 그렇게 많은 계획이 무너지는 이유입니다. 계획은 내가 무엇을 하려는지를 말합니다. 예측은 실제로 무슨 일이 일어날 것 같은지를, 내가 통제하지 못하는 부분까지 포함해 말합니다. 어떤 팀이 일정을 쓸 때, 그들은 거의 언제나 계획을 써 놓고 그것을 예측인 양 다시 읽습니다. 겨울마다 생기는 2주의 병가를 적어 둔 사람은 없고, 지난번마다 한 달이 걸렸던 승인을 적어 둔 사람도 없습니다. 그것들은 위험 요소가 아닙니다. 그 일의 평범한 날씨입니다. 그러니 계획을 쓰고, 그 옆에 비슷한 일을 했던 지난 세 번에 실제로 무슨 일이 있었는지를 쓰세요. 그 두 열 사이의 간격이 진짜 일정입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Suhyeon, is this the reading room you rearranged?"],
        ["W", "Yes, we moved everything over the holiday."],
        ["M", "There's a long bench along the left wall."],
        ["W", "It's the warmest seat in the afternoon."],
        ["M", "And a round clock hangs on the wall near the door."],
        ["W", "It's set two minutes fast on purpose."],
        ["M", "I count three desk lamps on the long table."],
        ["W", "There are four. One is behind the plant."],
        ["M", "The tall plant in the corner is doing well."],
        ["W", "It gets watered every Monday, whether it needs it or not."],
        ["M", "And a rug with wide stripes covers the middle of the floor."],
        ["W", "It keeps the chairs from scraping."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is behind the plant.",
      explanation:
        "남자가 스탠드가 세 개라고 하자 여자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A school reading room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A LONG BENCH stands along the left wall. " +
          "A ROUND CLOCK hangs on the wall near a closed door. " +
          "EXACTLY THREE DESK LAMPS stand on a long table, spaced well apart so all three are easy to count and none overlap. " +
          "A TALL POTTED PLANT stands in the corner. " +
          "A RUG WITH WIDE STRIPES covers the middle of the floor.",
      },
      translation: [
        "M: 수현아, 이게 네가 다시 배치한 열람실이야?",
        "W: 응, 연휴 동안 다 옮겼어.",
        "M: 왼쪽 벽을 따라 긴 벤치가 있네.",
        "W: 오후엔 거기가 제일 따뜻해.",
        "M: 그리고 문 옆 벽에 둥근 시계가 걸려 있어.",
        "W: 일부러 2분 빠르게 맞춰 놨어.",
        "M: 긴 탁자에 스탠드가 세 개 보여.",
        "W: 네 개야. 하나는 화분 뒤에 있어.",
        "M: 구석에 있는 큰 화분이 잘 자라네.",
        "W: 필요하든 아니든 월요일마다 물을 줘.",
        "M: 그리고 바닥 가운데를 넓은 줄무늬 깔개가 덮고 있어.",
        "W: 의자가 긁히지 않게 해 줘.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Hyunwoo, the university fair opens at one in the gym."],
        ["M", "I know. Are the booth tables numbered?"],
        ["W", "All twenty-two. I taped the numbers on this morning."],
        ["M", "Good. And the campus maps for the visitors?"],
        ["W", "Folded and stacked at the entrance desk."],
        ["M", "Then what's still open?"],
        ["W", "Nobody has printed the session schedule for the noticeboard."],
        ["M", "How big does it need to be?"],
        ["W", "A0, and only the media room printer does that size."],
        ["M", "Is the media room open now?"],
        ["W", "Until twelve thirty. But I'm meeting the university staff at the gate."],
        ["M", "Then I'll print the A0 schedule and put it up."],
      ],
      choices: [
        "탁자 번호 붙이기",
        "지도 접기",
        "일정표 인쇄해 붙이기",
        "대학 관계자 맞이하기",
        "체육관 정리하기",
      ],
      answer: 3,
      clue: "Then I'll print the A0 schedule and put it up.",
      explanation:
        "번호와 지도는 끝났고 여자는 대학 관계자를 맞아야 하므로, 남자가 A0 일정표를 인쇄해 붙이기로 한다. 따라서 답은 ③이다.",
      translation: [
        "W: 현우야, 대학 박람회가 1시에 체육관에서 열려.",
        "M: 알아. 부스 탁자에 번호는 붙였어?",
        "W: 스물두 개 다. 오늘 아침에 붙였어.",
        "M: 좋아. 방문객용 교내 지도는?",
        "W: 접어서 입구 데스크에 쌓아 뒀어.",
        "M: 그럼 아직 남은 게 뭐야?",
        "W: 게시판에 붙일 일정표를 아무도 인쇄하지 않았어.",
        "M: 얼마나 커야 하는데?",
        "W: A0. 그 크기는 매체실 인쇄기만 돼.",
        "M: 매체실 지금 열어?",
        "W: 12시 30분까지. 그런데 나는 정문에서 대학 관계자분들을 맞아야 해.",
        "M: 그럼 내가 A0 일정표 인쇄해서 붙일게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Northpoint Copy Center. What can I do for you?"],
        ["W", "I need twelve copies of my study guide, forty pages each."],
        ["M", "Printing is twenty-five cents a page, so ten dollars a copy."],
        ["W", "So one hundred and twenty dollars for the twelve."],
        ["M", "That's right. Would you like plastic covers on each one?"],
        ["W", "How much are the covers?"],
        ["M", "Three dollars each, so thirty-six more."],
        ["W", "We'll skip the covers. They go in folders anyway."],
        ["M", "Understood. Are you with a school study group?"],
        ["W", "We are. Here's the group card."],
        ["M", "Then I can take fifteen percent off the printing."],
        ["W", "Thank you. I'll pay now."],
      ],
      choices: ["$102.00", "$108.00", "$120.00", "$132.60", "$156.00"],
      answer: 1,
      clue: "Then I can take fifteen percent off the printing.",
      explanation:
        "열두 부 인쇄비 120달러에서 표지는 빼고, 15퍼센트를 빼면 102달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 노스포인트 복사 센터입니다. 무엇을 도와드릴까요?",
        "W: 제 학습 자료를 열두 부, 한 부에 마흔 쪽씩 뽑으려고요.",
        "M: 인쇄는 한 쪽에 25센트라서 한 부에 10달러입니다.",
        "W: 그럼 열두 부에 120달러네요.",
        "M: 맞습니다. 한 부씩 비닐 표지도 하시겠어요?",
        "W: 표지는 얼마예요?",
        "M: 하나에 3달러라서 36달러가 더 붙습니다.",
        "W: 표지는 뺄게요. 어차피 파일에 넣을 거예요.",
        "M: 알겠습니다. 학교 스터디 모임이신가요?",
        "W: 네. 여기 모임 카드요.",
        "M: 그럼 인쇄비에서 15퍼센트를 빼 드릴게요.",
        "W: 감사합니다. 지금 결제할게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 오케스트라 연주회에 서지 않는 이유를 고르시오.",
      lines: [
        ["W", "Hyunwoo, your name isn't in the concert programme."],
        ["M", "I asked to sit this one out."],
        ["W", "Is your wrist still giving you trouble?"],
        ["M", "That healed back in August."],
        ["W", "Then is it the rehearsal load? It's four nights a week now."],
        ["M", "Four nights I could manage."],
        ["W", "So what is it?"],
        ["M", "The concert is the night before my first university exam."],
        ["W", "Oh. And it finishes late."],
        ["M", "Half past ten, and I'd be home at midnight. I can't do that this year."],
      ],
      choices: [
        "손목을 다쳐서",
        "연습이 너무 많아서",
        "다음 날 시험이 있어서",
        "악기가 고장 나서",
        "지휘자와 다퉈서",
      ],
      answer: 3,
      clue: "The concert is the night before my first university exam.",
      explanation:
        "손목도 나았고 연습량도 감당할 수 있지만, 연주회가 첫 대학 시험 전날 밤이고 늦게 끝나기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "W: 현우야, 연주회 순서에 네 이름이 없네.",
        "M: 이번엔 빼 달라고 했어.",
        "W: 손목이 아직 안 좋아?",
        "M: 그건 8월에 나았어.",
        "W: 그럼 연습량 때문이야? 이제 일주일에 네 번이잖아.",
        "M: 네 번은 할 수 있었어.",
        "W: 그럼 뭔데?",
        "M: 연주회가 내 첫 대학 시험 전날 밤이야.",
        "W: 아. 게다가 늦게 끝나지.",
        "M: 10시 반. 집에 가면 자정이야. 올해는 그럴 수 없어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Winter Volunteer Week에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Hyunwoo, have you signed up for Winter Volunteer Week?"],
        ["M", "Not yet. When exactly is it?"],
        ["W", "The third week of January, Monday to Friday."],
        ["M", "Five days in a row. Where do we go?"],
        ["W", "The community kitchen on Maple Street, near the market."],
        ["M", "I've walked past it. What do volunteers do there?"],
        ["W", "Morning prep, serving at lunch, and cleaning afterward."],
        ["M", "That's a full day. How many hours a day?"],
        ["W", "Nine to three, with a break in the middle."],
        ["M", "Do we need anything special?"],
        ["W", "Closed shoes and an apron. They provide everything else."],
        ["M", "Then I'll sign up before the list fills."],
      ],
      choices: ["운영 기간", "장소", "하는 일", "준비물", "인솔 교사"],
      answer: 5,
      clue: "인솔 교사는 대화에서 언급되지 않았다.",
      explanation:
        "기간(1월 셋째 주 월~금), 장소(메이플가 마을 주방), 하는 일(준비·배식·청소), 준비물(막힌 신발과 앞치마)은 언급되지만 인솔 교사는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 현우야, 겨울 봉사 주간 신청했어?",
        "M: 아직. 정확히 언제야?",
        "W: 1월 셋째 주, 월요일부터 금요일까지.",
        "M: 닷새 연달아서. 어디로 가는데?",
        "W: 메이플가 마을 주방. 시장 근처야.",
        "M: 지나가 본 적 있어. 거기서 자원봉사자는 뭘 해?",
        "W: 아침 준비, 점심 배식, 그리고 뒷정리.",
        "M: 하루 종일이네. 하루에 몇 시간이야?",
        "W: 9시부터 3시까지. 중간에 쉬는 시간 있고.",
        "M: 따로 필요한 거 있어?",
        "W: 막힌 신발이랑 앞치마. 나머지는 다 준대.",
        "M: 그럼 명단 차기 전에 신청할게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Fairweather Public Observatory에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Let me tell you about the Fairweather Public Observatory. " +
            "It stands on the hill above the town and has been open to the public since 1987. " +
            "Viewing nights are held on Friday and Saturday, from eight until eleven. " +
            "Entry costs three thousand won, and children under seven get in free. " +
            "The main dome holds forty people, so tickets are sold in timed groups. " +
            "There is no parking on the hill, and visitors walk up from the lower car park. " +
            "The observatory closes entirely for two weeks each August for maintenance.",
        ],
      ],
      choices: [
        "1987년부터 일반에 개방했다",
        "금요일과 토요일 밤에 관측한다",
        "일곱 살 미만은 무료이다",
        "언덕 위에 주차할 수 있다",
        "8월에 2주간 문을 닫는다",
      ],
      answer: 4,
      clue: "There is no parking on the hill, and visitors walk up from the lower car park.",
      explanation:
        "언덕 위에는 주차할 수 없고 아래 주차장에서 걸어 올라온다고 했으므로 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "M: 페어웨더 시민 천문대를 소개해 드리겠습니다. 마을 위 언덕에 있으며 1987년부터 일반에 개방해 왔습니다. 관측은 금요일과 토요일 밤 8시부터 11시까지 합니다. 입장료는 3천 원이고 일곱 살 미만은 무료입니다. 주 돔에는 마흔 명이 들어가서 시간대별로 표를 나눠 팝니다. 언덕 위에는 주차장이 없어서 방문객은 아래 주차장에서 걸어 올라옵니다. 천문대는 해마다 8월에 2주 동안 정비를 위해 완전히 닫습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 온라인 강좌를 고르시오.",
      lines: [
        ["W", "Hyunwoo, let's take one online course over the break."],
        ["M", "I looked at the list yesterday. There are five of them."],
        ["W", "Let's rule them out one at a time. Live sessions or recorded?"],
        ["M", "Which do you prefer?"],
        ["W", "Live. I never finish the recorded ones."],
        ["M", "Same here. I get three weeks behind and give up."],
        ["W", "Should it have graded assignments, do you think?"],
        ["M", "Yes. Without a grade I stop after week two."],
        ["W", "That's honest, and it's true of me as well."],
        ["M", "And the fee? I have eighty thousand won saved."],
        ["W", "Mine's the same, so eighty thousand is the limit."],
        ["M", "That takes the most expensive one off the list."],
        ["W", "Then only one course clears all three."],
        ["M", "Enrolment closes on the fifteenth, so we shouldn't wait."],
        ["W", "Let's register tonight, then."],
        ["M", "I'll send the link after dinner."],
        ["W", "I'll pay my half tomorrow morning."],
        ["M", "Then we're set. I'll put the first session in my calendar."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Live. I never finish the recorded ones.",
      explanation:
        "실시간 수업이고, 채점되는 과제가 있으며, 수강료가 8만 원 이하인 강좌를 고른다. 세 조건을 모두 채우는 것은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Format: Recorded / Graded work: Yes / Fee: 50,000 won" },
          { no: 2, label: "②", value: "Format: Live / Graded work: No / Fee: 45,000 won" },
          { no: 3, label: "③", value: "Format: Live / Graded work: Yes / Fee: 75,000 won" },
          { no: 4, label: "④", value: "Format: Live / Graded work: Yes / Fee: 120,000 won" },
          { no: 5, label: "⑤", value: "Format: Recorded / Graded work: No / Fee: 30,000 won" },
        ],
      },
      translation: [
        "W: 현우야, 방학 동안 온라인 강좌 하나 듣자.",
        "M: 어제 목록 봤어. 다섯 개 있더라.",
        "W: 하나씩 걸러 보자. 실시간이야, 녹화본이야?",
        "M: 너는 뭐가 더 좋아?",
        "W: 실시간. 녹화본은 끝까지 본 적이 없어.",
        "M: 나도. 3주쯤 밀리면 포기해 버려.",
        "W: 채점되는 과제가 있어야 할까?",
        "M: 응. 점수가 없으면 둘째 주에 그만둬.",
        "W: 솔직하다. 나도 그래.",
        "M: 수강료는? 나는 8만 원 모아 뒀어.",
        "W: 나도 같아. 그럼 8만 원이 한계네.",
        "M: 그럼 제일 비싼 건 빠지네.",
        "W: 그럼 세 조건 다 맞는 건 하나뿐이야.",
        "M: 수강 신청이 15일에 닫히니까 미루면 안 돼.",
        "W: 그럼 오늘 밤에 등록하자.",
        "M: 저녁 먹고 링크 보낼게.",
        "W: 내 몫은 내일 아침에 낼게.",
        "M: 그럼 됐다. 나는 첫 수업을 달력에 적어 둘게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Suhyeon, is the study room open on the holiday Monday?"],
        ["W", "It is, but you have to book it a day ahead."],
        ["M", "I didn't know that. Where do I book?"],
        ["W", "On the library app, under room reservations."],
      ],
      choices: [
        "The library has no app.",
        "I'll book it on the app today.",
        "I don't need a study room.",
        "It's not a holiday Monday.",
        "I'll just walk in on the day.",
      ],
      answer: 2,
      clue: "On the library app, under room reservations.",
      explanation:
        "여자가 도서관 앱에서 예약하라고 알려 주었으므로, 오늘 앱으로 예약하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 수현아, 월요일 공휴일에 스터디룸 열어?",
        "W: 열어. 그런데 하루 전에 예약해야 해.",
        "M: 몰랐네. 어디서 예약해?",
        "W: 도서관 앱, 공간 예약 메뉴에서.",
        "M: 오늘 앱으로 예약할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Hyunwoo, my exam admission ticket won't print properly."],
        ["M", "Is the photo missing, or the whole page?"],
        ["W", "The photo. There's a grey box where it should be."],
        ["M", "Upload the photo again from a computer, not a phone."],
      ],
      choices: [
        "My ticket printed perfectly.",
        "I'll upload it from a computer.",
        "There is no photo needed.",
        "I'll print it at school instead.",
        "The grey box is normal.",
      ],
      answer: 2,
      clue: "Upload the photo again from a computer, not a phone.",
      explanation:
        "남자가 휴대폰 말고 컴퓨터에서 사진을 다시 올리라고 했으므로, 컴퓨터에서 올리겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 현우야, 내 수험표가 제대로 인쇄가 안 돼.",
        "M: 사진이 빠진 거야, 아니면 쪽 전체가?",
        "W: 사진. 그 자리에 회색 네모만 나와.",
        "M: 휴대폰 말고 컴퓨터에서 사진을 다시 올려 봐.",
        "W: 컴퓨터에서 올릴게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Suhyeon, you've cancelled three meetings with the career counselor."],
        ["W", "I keep thinking I should go in with a clearer idea."],
        ["M", "Clearer than what you have now?"],
        ["W", "I only have a vague direction. It feels embarrassing to say out loud."],
        ["M", "Do you think she expects a finished plan?"],
        ["W", "I assumed so. Everyone else seems to have one."],
        ["M", "They seem to. That's different from having one."],
        ["W", "So I've been waiting to be ready for a conversation about not being ready."],
        ["M", "That's exactly it, and the waiting is costing you the term."],
        ["W", "What would I even open with?"],
        ["M", "Book the next slot and say the vague direction out loud."],
      ],
      choices: [
        "I'll wait until I have a plan.",
        "I already know exactly what I want.",
        "The counselor never has time.",
        "I'll cancel the next one too.",
        "I'll book a slot for this week.",
      ],
      answer: 5,
      clue: "Book the next slot and say the vague direction out loud.",
      explanation:
        "남자가 다음 시간을 예약해 막연한 방향이라도 말해 보라고 했으므로, 이번 주로 예약하겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 수현아, 진로 상담을 세 번이나 취소했네.",
        "W: 좀 더 분명한 생각을 갖고 가야 할 것 같아서.",
        "M: 지금 가진 것보다 분명하게?",
        "W: 나는 막연한 방향뿐이야. 입 밖으로 내기가 부끄러워.",
        "M: 선생님이 완성된 계획을 기대하신다고 생각해?",
        "W: 그럴 거라고 여겼어. 다른 애들은 다 있는 것 같고.",
        "M: 있어 보이는 거지. 있는 것과는 달라.",
        "W: 그럼 나는 준비가 안 됐다는 이야기를 할 준비를 기다리고 있었네.",
        "M: 바로 그거야. 그 기다림이 한 학기를 쓰고 있고.",
        "W: 무슨 말로 시작해야 할까?",
        "M: 다음 시간을 예약하고 그 막연한 방향을 소리 내어 말해.",
        "W: 이번 주로 예약할게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Hyunwoo, you've been solving the hardest problems first every night."],
        ["M", "Get the worst out of the way. That's the advice, isn't it?"],
        ["W", "How far do you usually get into the first one?"],
        ["M", "Twenty minutes, then I'm stuck and the night feels over."],
        ["W", "And the easier ones afterwards?"],
        ["M", "I rarely reach them. I'm already discouraged."],
        ["W", "So the rule is costing you the problems you could have solved."],
        ["M", "I thought pushing through was the point."],
        ["W", "Pushing through works once you're moving. It's a bad way to start."],
        ["M", "Then what should the first twenty minutes be?"],
        ["W", "Two easy ones, then the hard one while you're already going."],
      ],
      choices: [
        "I'll start with two easy ones tonight.",
        "I'll keep starting with the hardest.",
        "I never solve easy problems.",
        "Twenty minutes is plenty.",
        "I'll stop doing problems altogether.",
      ],
      answer: 1,
      clue: "Two easy ones, then the hard one while you're already going.",
      explanation:
        "여자가 쉬운 두 문제를 먼저 풀고 흐름이 붙은 뒤 어려운 문제로 가라고 했으므로, 오늘 밤 쉬운 두 문제로 시작하겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 현우야, 너 매일 밤 제일 어려운 문제부터 풀더라.",
        "M: 제일 힘든 걸 먼저 치우라는 게 흔한 조언이잖아.",
        "W: 첫 문제는 보통 어디까지 가?",
        "M: 20분쯤. 그러다 막히면 그날 밤은 끝난 기분이야.",
        "W: 그다음 쉬운 문제들은?",
        "M: 거의 못 가. 이미 기가 꺾여서.",
        "W: 그럼 그 규칙이 네가 풀 수 있었을 문제들을 쓰고 있는 거네.",
        "M: 밀어붙이는 게 핵심인 줄 알았어.",
        "W: 밀어붙이기는 이미 움직이고 있을 때 통해. 시작하는 방법으로는 나빠.",
        "M: 그럼 첫 20분은 뭐여야 해?",
        "W: 쉬운 두 문제. 그러고 흐름이 붙었을 때 어려운 걸로 가.",
        "M: 오늘 밤엔 쉬운 두 문제로 시작할게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Jina가 Kyubin에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Jina : ________________",
      lines: [
        [
          "M",
          "Jina and Kyubin are preparing the class's entry for the science poster competition. " +
            "Kyubin has drawn every chart by hand and the lettering is careful and even. " +
            "On Thursday Jina reads the poster from the back of the room, " +
            "which is where the judges stand when they score, " +
            "and finds that the axis labels and the conclusion are too small to read from there. " +
            "The title is large, but the two things that carry the argument are not. " +
            "She checks the rules and sees that judging is done from two meters away. " +
            "Kyubin has a spare sheet and there are still two days before submission. " +
            "She does not want him to redraw the whole poster, " +
            "only the labels and the conclusion at a larger size. " +
            "She wants to tell him to redo those parts bigger. " +
            "In this situation, what would Jina most likely say to Kyubin?",
        ],
      ],
      choices: [
        "We should draw the charts on a computer instead.",
        "Let's redo the labels and conclusion much larger.",
        "Let's submit the poster as it is.",
        "We should add three more charts.",
        "Let's ask the judges to stand closer.",
      ],
      answer: 2,
      clue: "She wants to tell him to redo those parts bigger.",
      explanation:
        "지나는 축 이름과 결론만 더 크게 다시 쓰자고 말하려 하므로 ②가 가장 적절하다.",
      translation: [
        "M: 지나와 규빈이는 과학 포스터 대회에 낼 학급 작품을 준비하고 있습니다. 규빈이는 모든 도표를 손으로 그렸고 글씨도 반듯하고 고릅니다. 목요일에 지나는 교실 뒤쪽에서 포스터를 읽어 봅니다. 심사위원이 점수를 매길 때 서는 자리가 거기입니다. 그런데 축 이름과 결론이 거기서는 너무 작아 읽히지 않습니다. 제목은 크지만, 주장을 떠받치는 두 가지는 그렇지 않습니다. 규정을 보니 심사는 2미터 떨어져서 한다고 되어 있습니다. 규빈이에게는 여분의 종이가 있고 제출까지 이틀이 남았습니다. 지나는 포스터를 통째로 다시 그리기를 바라지는 않고, 축 이름과 결론만 더 크게 다시 쓰기를 바랍니다. 지나는 그 부분만 크게 다시 하자고 말하고 싶습니다. 이런 상황에서 지나가 규빈이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why a cut lemon browns " +
            "and how a squeeze of its own juice stops it. " +
            "Cutting a fruit breaks open its cells, " +
            "and an enzyme that was safely stored inside meets the oxygen in the air. " +
            "The enzyme pushes a reaction that turns pale flesh brown within minutes. " +
            "Heat destroys the enzyme, which is why cooked apple does not brown, " +
            "but you cannot cook a salad garnish. " +
            "Acid works instead. " +
            "The enzyme only functions within a narrow range of acidity, " +
            "and lemon juice pushes the surface outside that range. " +
            "This is why the same trick works with vinegar, " +
            "and why it is the surface, not the inside, that has to be covered.",
        ],
      ],
      choices: [
        "how acid stops cut fruit from browning",
        "why lemons taste sour when they are fresh",
        "how cooking changes the color of vegetables",
        "why fruit should be stored in the cold",
        "how enzymes are used to make bread",
      ],
      answer: 1,
      clue: "The enzyme only functions within a narrow range of acidity, and lemon juice pushes the surface outside that range.",
      explanation:
        "여자는 자른 과일이 갈변하는 이유와, 산이 효소가 작동하는 산도 범위를 벗어나게 해 이를 막는다고 설명한다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 자른 레몬이 왜 갈색이 되는지, 그리고 제 즙을 조금 짜 넣으면 왜 그것이 멈추는지 이야기하려 합니다. 과일을 자르면 세포가 터지고, 안에 안전하게 담겨 있던 효소가 공기 중 산소를 만납니다. 그 효소는 몇 분 만에 연한 속살을 갈색으로 바꾸는 반응을 밀어붙입니다. 열은 효소를 망가뜨립니다. 그래서 익힌 사과는 갈변하지 않지요. 그런데 샐러드 장식을 익힐 수는 없습니다. 대신 산이 일합니다. 그 효소는 좁은 산도 범위 안에서만 작동하는데, 레몬즙이 표면을 그 범위 밖으로 밀어냅니다. 그래서 식초로도 같은 방법이 통하고, 속이 아니라 표면을 덮어야 하는 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Hello, everyone. Today I want to talk about why a cut lemon browns and how a squeeze of its own juice stops it."],
        ["W", "Cutting a fruit breaks open its cells, and an enzyme that was safely stored inside meets the oxygen in the air."],
        ["W", "The enzyme pushes a reaction that turns pale flesh brown within minutes."],
        ["W", "Heat destroys the enzyme, which is why cooked apple does not brown."],
        ["W", "The enzyme only functions within a narrow range of acidity, and lemon juice pushes the surface outside that range."],
        ["W", "This is why the same trick works with vinegar."],
      ],
      choices: [
        "cutting a fruit breaking open its cells",
        "an enzyme meeting oxygen in the air",
        "heat destroying the enzyme",
        "vinegar working the same way as lemon juice",
        "sugar slowing the browning reaction",
      ],
      answer: 5,
      clue: "Cutting a fruit breaks open its cells, and an enzyme that was safely stored inside meets the oxygen in the air.",
      explanation:
        "과일을 자르면 세포가 터지는 것, 효소가 산소를 만나는 것, 열이 효소를 망가뜨리는 것, 식초도 같은 방법으로 통하는 것은 언급되지만 설탕이 갈변을 늦춘다는 것은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
