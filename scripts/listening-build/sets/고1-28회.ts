/** 고1 듣기 28회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 28회",
  gradeLevel: "high1",
  speechSpeed: 0.8,
  folder: "고1 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Good afternoon, everyone. This is Ms. Pyo from the school library. " +
            "I want to talk about the group study rooms on the second floor. " +
            "We have four of them, and they are booked solid every afternoon. " +
            "Last week, though, two of the four sat empty for over an hour " +
            "while six students waited outside for a room. " +
            "The booking had been made and simply not used. " +
            "From Monday, a room that is still empty fifteen minutes after its start time " +
            "will be given to whoever is waiting. " +
            "Nothing else changes, and you can still book two weeks ahead. " +
            "If your plan falls through, just cancel on the app. Thank you.",
        ],
      ],
      choices: [
        "스터디룸 예약 방법을 안내하려고",
        "도서관 개방 시간 변경을 알리려고",
        "스터디룸 증설을 알리려고",
        "예약하고 오지 않는 스터디룸 운영 규칙을 알리려고",
        "도서 반납을 독촉하려고",
      ],
      answer: 4,
      clue: "From Monday, a room that is still empty fifteen minutes after its start time will be given to whoever is waiting.",
      explanation:
        "여자는 예약해 놓고 쓰지 않는 방 때문에 월요일부터 15분이 지나면 기다리는 사람에게 넘긴다고 알린다. 따라서 답은 ④이다.",
      translation: [
        "W: 여러분, 안녕하세요. 학교 도서관 표입니다. 2층 모둠 스터디룸에 대해 말씀드리려 합니다. 방이 네 개 있는데 오후마다 예약이 꽉 찹니다. 그런데 지난주에는 그중 두 방이 한 시간 넘게 비어 있었고, 그동안 학생 여섯 명이 방을 기다리며 밖에 서 있었습니다. 예약은 되어 있었고 그저 쓰이지 않았습니다. 월요일부터는 시작 시각에서 15분이 지나도 비어 있는 방은 기다리는 사람에게 드립니다. 그 밖에 달라지는 것은 없고, 2주 전부터 예약하는 것도 그대로입니다. 계획이 틀어지면 앱에서 취소만 해 주세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Dongjin, I've been rewriting my notes neatly every evening."],
        ["M", "The whole day's notes? How long does that take?"],
        ["W", "About an hour and a half. They look much better afterward."],
        ["M", "Better to look at, or better to use?"],
        ["W", "To look at, I suppose. The content is the same."],
        ["M", "So you spend ninety minutes copying what you already wrote."],
        ["W", "But neat notes are easier to review later."],
        ["M", "How many times have you opened last month's neat notes?"],
        ["W", "Honestly, not once."],
        ["M", "Then the neatness served the copying, not the reviewing."],
        ["W", "What should I do with the ninety minutes instead?"],
        ["M", "Close the notes and write what you remember. Then check."],
      ],
      choices: [
        "필기는 깔끔하게 해야 한다",
        "노트를 옮겨 쓰기보다 기억해 써 봐야 한다",
        "복습은 그날 안에 해야 한다",
        "노트는 과목별로 나눠야 한다",
        "필기는 수업 중에 끝내야 한다",
      ],
      answer: 2,
      clue: "Close the notes and write what you remember. Then check.",
      explanation:
        "남자는 옮겨 쓰기가 복습이 아니라 베끼기였다며, 노트를 덮고 기억나는 것을 써 본 뒤 확인하라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 동진아, 나 저녁마다 노트를 깔끔하게 옮겨 쓰고 있어.",
        "M: 하루 치 전부? 얼마나 걸려?",
        "W: 한 시간 반쯤. 하고 나면 훨씬 보기 좋아.",
        "M: 보기 좋은 거야, 쓰기 좋은 거야?",
        "W: 보기 좋은 거겠지. 내용은 같으니까.",
        "M: 그럼 이미 쓴 걸 베끼는 데 90분을 쓰는 거네.",
        "W: 그래도 깔끔한 노트가 나중에 보기 편하잖아.",
        "M: 지난달 깔끔한 노트를 몇 번이나 펴 봤어?",
        "W: 솔직히 한 번도 안 봤어.",
        "M: 그럼 그 깔끔함은 복습이 아니라 베끼기를 위한 거였네.",
        "W: 그 90분에 뭘 해야 해?",
        "M: 노트를 덮고 기억나는 걸 써. 그다음에 확인하고.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "There is a particular kind of advice that sounds generous and is not. " +
            "It is the advice given when someone tells you about a plan " +
            "they have already decided on. " +
            "They describe it, and you begin listing what could go wrong. " +
            "Everything you say may be true. " +
            "But the decision has been made, and what they came for was " +
            "someone to carry a little of the risk with them. " +
            "Your list does not remove any risk. It only moves it back onto them. " +
            "This is why people stop telling you things. " +
            "Not because you were wrong, but because being right at that moment " +
            "was not what the conversation was for. " +
            "Ask first whether they want your worries or your company.",
        ],
      ],
      choices: [
        "조언은 솔직하게 해야 한다",
        "계획은 미리 검토해야 한다",
        "위험은 미리 알려 주어야 한다",
        "남의 일에 참견하지 말아야 한다",
        "이미 정한 일에는 조언보다 곁을 내주어야 한다",
      ],
      answer: 5,
      clue: "Ask first whether they want your worries or your company.",
      explanation:
        "여자는 이미 정한 일을 말할 때 필요한 것은 위험 목록이 아니라 함께 있어 주는 것이라며, 무엇을 원하는지 먼저 물으라고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 너그러워 보이지만 그렇지 않은 종류의 조언이 있습니다. 상대가 이미 정해 놓은 계획을 이야기할 때 나오는 조언입니다. 그 사람이 계획을 말하면 여러분은 무엇이 잘못될 수 있는지 꼽기 시작합니다. 여러분이 하는 말은 전부 사실일 수 있습니다. 그런데 결정은 이미 내려졌고, 그 사람이 온 이유는 위험을 조금이나마 함께 져 줄 사람을 찾아서입니다. 여러분의 목록은 위험을 하나도 없애지 못합니다. 그것을 그 사람에게 도로 옮겨 놓을 뿐입니다. 그래서 사람들이 여러분에게 이야기를 하지 않게 됩니다. 여러분이 틀려서가 아니라, 그 순간 옳은 것이 그 대화의 목적이 아니었기 때문입니다. 걱정을 원하는지 곁에 있어 주기를 원하는지 먼저 물으세요.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Sora, is this the corner you made into a music practice room?"],
        ["W", "Yes, we finished it two weeks ago."],
        ["M", "There's an upright piano against the back wall."],
        ["W", "It came from the old auditorium."],
        ["M", "And a metronome sits on top of the piano."],
        ["W", "That one has been in the school longer than any of us."],
        ["M", "I count three music stands on the floor."],
        ["W", "There are four. One is folded behind the piano."],
        ["M", "The tall stool by the window looks new."],
        ["W", "We bought it with the club fund in March."],
        ["M", "And a wall mirror covers the left wall."],
        ["W", "You have to see your own posture while you play."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is folded behind the piano.",
      explanation:
        "남자가 보면대가 세 개라고 하자 여자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A music practice room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "An UPRIGHT PIANO stands against the back wall. " +
          "A METRONOME sits on top of the piano. " +
          "EXACTLY THREE MUSIC STANDS stand on the floor in front of the piano, spaced well apart so all three are easy to count and none overlap. " +
          "A TALL STOOL stands beside a window. " +
          "A LARGE WALL MIRROR covers most of the left wall.",
      },
      translation: [
        "M: 소라야, 이게 음악 연습실로 만든 구석이야?",
        "W: 응, 2주 전에 다 끝냈어.",
        "M: 뒷벽에 업라이트 피아노가 있네.",
        "W: 예전 강당에서 가져온 거야.",
        "M: 그리고 피아노 위에 메트로놈이 있어.",
        "W: 그건 우리 중 누구보다 학교에 오래 있었어.",
        "M: 바닥에 보면대가 세 개 보여.",
        "W: 네 개야. 하나는 피아노 뒤에 접혀 있어.",
        "M: 창가에 있는 높은 의자는 새것 같네.",
        "W: 3월에 동아리비로 샀어.",
        "M: 그리고 왼쪽 벽을 거울이 덮고 있어.",
        "W: 연주할 때 자기 자세를 봐야 하거든.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Dongjin, the school fair opens at ten tomorrow."],
        ["M", "I know. Are the booth signs finished?"],
        ["W", "All twelve, painted and dry. They're in the art room."],
        ["M", "Good. And the float for the parade?"],
        ["W", "Decorated last night. It's parked behind the gym."],
        ["M", "Then what's still open?"],
        ["W", "The extension cords for the outdoor booths are missing."],
        ["M", "How many do we need?"],
        ["W", "Six long ones, and the caretaker keeps them in the shed."],
        ["M", "Is the shed open this evening?"],
        ["W", "Until six. But I have to meet the food stall people at five."],
        ["M", "Then I'll get the six cords from the shed."],
      ],
      choices: [
        "전선 받아 오기",
        "간판 칠하기",
        "수레 꾸미기",
        "먹거리 상인 만나기",
        "체육관 정리하기",
      ],
      answer: 1,
      clue: "Then I'll get the six cords from the shed.",
      explanation:
        "간판과 수레는 끝났고 여자는 상인들을 만나야 하므로, 남자가 창고에서 연장선 여섯 개를 받아 오기로 한다. 따라서 답은 ①이다.",
      translation: [
        "W: 동진아, 학교 축제가 내일 10시에 열려.",
        "M: 알아. 부스 간판은 다 됐어?",
        "W: 열두 개 다 칠하고 말렸어. 미술실에 있어.",
        "M: 좋아. 행진에 쓸 수레는?",
        "W: 어젯밤에 꾸몄어. 체육관 뒤에 세워 뒀어.",
        "M: 그럼 아직 남은 게 뭐야?",
        "W: 야외 부스에 쓸 연장선이 없어.",
        "M: 몇 개 필요한데?",
        "W: 긴 거 여섯 개. 관리 선생님이 창고에 두셔.",
        "M: 창고 오늘 저녁에 열어?",
        "W: 6시까지. 그런데 나는 5시에 먹거리 상인분들을 만나야 해.",
        "M: 그럼 내가 창고에서 연장선 여섯 개 받아 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Harbor Outdoor. What can I help you with?"],
        ["W", "Four sleeping bags and two camping lanterns, please."],
        ["M", "Sleeping bags are thirty dollars each and lanterns are twenty."],
        ["W", "So a hundred and twenty plus forty."],
        ["M", "One hundred and sixty in total. Would you like the ground sheets too?"],
        ["W", "How much are those?"],
        ["M", "Eight dollars each, and you'd want four."],
        ["W", "We'll skip the ground sheets. The site has wooden decks."],
        ["M", "No problem. Are you with a school club?"],
        ["W", "Yes, here's our card."],
        ["M", "Then I can take twenty percent off the sleeping bags, but not the lanterns."],
        ["W", "Thank you. I'll pay by card."],
      ],
      choices: ["$128.00", "$144.00", "$160.00", "$136.00", "$192.00"],
      answer: 4,
      clue: "Then I can take twenty percent off the sleeping bags, but not the lanterns.",
      explanation:
        "침낭 4개 120달러에서 20퍼센트를 빼면 96달러이고, 할인이 안 되는 랜턴 2개 40달러를 더하면 136달러이다. 따라서 답은 ④이다.",
      translation: [
        "M: 하버 아웃도어입니다. 무엇을 도와드릴까요?",
        "W: 침낭 네 개랑 캠핑 랜턴 두 개 주세요.",
        "M: 침낭은 하나에 30달러, 랜턴은 20달러입니다.",
        "W: 그럼 120달러에 40달러네요.",
        "M: 모두 160달러입니다. 바닥 깔개도 하시겠어요?",
        "W: 그건 얼마예요?",
        "M: 하나에 8달러인데, 네 개는 필요하실 거예요.",
        "W: 깔개는 뺄게요. 그 야영장은 나무 데크예요.",
        "M: 괜찮습니다. 학교 동아리세요?",
        "W: 네, 여기 카드요.",
        "M: 그럼 침낭에서 20퍼센트를 빼 드립니다. 랜턴은 안 돼요.",
        "W: 감사합니다. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 봉사 모임에 나가지 못하는 이유를 고르시오.",
      lines: [
        ["W", "Dongjin, you're not on the volunteer list for Sunday."],
        ["M", "I had to pull out on Tuesday."],
        ["W", "Is your shoulder still bothering you?"],
        ["M", "That was fine after two weeks of rest."],
        ["W", "Then is it the distance? It's an hour by bus."],
        ["M", "An hour is fine. I read on the way."],
        ["W", "So what happened?"],
        ["M", "My sister's recital is that afternoon and I promised in August."],
        ["W", "Can't you do the morning shift instead?"],
        ["M", "The morning shift is full, and I'd get there late anyway."],
      ],
      choices: [
        "어깨를 다쳐서",
        "동생 발표회에 가야 해서",
        "거리가 멀어서",
        "시험 준비를 해야 해서",
        "아르바이트가 있어서",
      ],
      answer: 2,
      clue: "My sister's recital is that afternoon and I promised in August.",
      explanation:
        "어깨도 나았고 거리도 문제가 아니며, 그날 오후에 동생 발표회가 있고 8월에 약속했기 때문이다. 따라서 답은 ②이다.",
      translation: [
        "W: 동진아, 일요일 봉사 명단에 네가 없네.",
        "M: 화요일에 빠지기로 했어.",
        "W: 어깨가 아직 아파?",
        "M: 2주 쉬니까 괜찮아졌어.",
        "W: 그럼 거리 때문이야? 버스로 한 시간이잖아.",
        "M: 한 시간은 괜찮아. 가면서 책 읽어.",
        "W: 그럼 무슨 일인데?",
        "M: 그날 오후에 동생 발표회가 있어. 8월에 약속했어.",
        "W: 오전 근무로 바꾸면 안 돼?",
        "M: 오전은 다 찼고, 어차피 늦게 도착해.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Sunset Rooftop Cinema에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Dongjin, have you heard about the Sunset Rooftop Cinema?"],
        ["M", "I saw a photo of it. When is it on?"],
        ["W", "Every Friday in July and August, starting at eight."],
        ["M", "Evenings only. Where exactly is it?"],
        ["W", "On the roof of the old department store by the crossing."],
        ["M", "I've never been up there. What do they show?"],
        ["W", "One film a week, mostly older ones people voted for."],
        ["M", "That sounds good. Do you have to bring anything?"],
        ["W", "A cushion, if you want one. The chairs are plastic."],
        ["M", "How much is a ticket?"],
        ["W", "Eight thousand won, and it sells out by Wednesday."],
        ["M", "Then let's book for this Friday tonight."],
      ],
      choices: ["열리는 요일", "열리는 장소", "상영 작품", "준비물", "주차 안내"],
      answer: 5,
      clue: "주차 안내는 대화에서 언급되지 않았다.",
      explanation:
        "요일(7·8월 매주 금요일), 장소(옛 백화점 옥상), 상영 작품(투표로 뽑은 옛 영화), 준비물(방석)은 언급되지만 주차 안내는 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 동진아, 선셋 옥상 극장 들어 봤어?",
        "M: 사진은 봤어. 언제 해?",
        "W: 7월이랑 8월 매주 금요일, 8시에 시작해.",
        "M: 저녁에만 하는구나. 정확히 어디야?",
        "W: 건널목 옆 옛 백화점 옥상에서.",
        "M: 거기 올라가 본 적 없어. 뭘 상영해?",
        "W: 일주일에 한 편. 대부분 사람들이 투표로 뽑은 옛 영화야.",
        "M: 좋은데. 뭘 가져가야 해?",
        "W: 원하면 방석. 의자가 플라스틱이야.",
        "M: 표는 얼마야?",
        "W: 8천 원. 수요일이면 매진돼.",
        "M: 그럼 오늘 밤에 이번 주 금요일로 예약하자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Larkfield Community Garden에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Let me tell you about the Larkfield Community Garden. " +
            "It was opened in 2010 on a plot of land the city no longer needed. " +
            "There are sixty plots, and each one is rented for a year at a time. " +
            "The waiting list is usually about two years long. " +
            "Tools are kept in a shared shed and anyone with a plot may use them. " +
            "Water is available from four taps, but hoses are not permitted. " +
            "The garden is locked at night, and each renter is given a key.",
        ],
      ],
      choices: [
        "2010년에 문을 열었다",
        "밭이 예순 개 있다",
        "호스를 쓸 수 있다",
        "대기자 명단이 2년쯤 된다",
        "빌린 사람에게 열쇠를 준다",
      ],
      answer: 3,
      clue: "Water is available from four taps, but hoses are not permitted.",
      explanation:
        "수도는 네 곳에서 쓸 수 있지만 호스는 안 된다고 했으므로 ③은 내용과 다르다. 따라서 답은 ③이다.",
      translation: [
        "M: 라크필드 공동 텃밭을 소개해 드리겠습니다. 2010년에 시에서 더는 쓰지 않던 땅에 문을 열었습니다. 밭이 예순 개 있고, 각각 1년 단위로 빌립니다. 대기자 명단은 보통 2년쯤 됩니다. 도구는 공동 창고에 있고 밭을 빌린 사람은 누구나 쓸 수 있습니다. 물은 수도 네 곳에서 쓸 수 있지만 호스는 쓸 수 없습니다. 텃밭은 밤에 잠그고, 빌린 사람에게는 열쇠를 드립니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 주말 강좌를 고르시오.",
      lines: [
        ["W", "Dongjin, let's take a weekend class together next term."],
        ["M", "Five listed. Saturday or Sunday?"],
        ["W", "Saturday. Sunday is family day at my house."],
        ["M", "Agreed. Should it have a final showcase?"],
        ["W", "Yes. I work harder when something is at the end of it."],
        ["M", "Right. And the fee? I've saved fifty thousand won."],
        ["W", "Same here, so fifty thousand is the ceiling."],
        ["M", "Then only one class clears all three."],
        ["W", "Registration closes on Thursday."],
        ["M", "Let's do it during lunch tomorrow."],
        ["W", "I'll bring the form and a pen."],
        ["M", "And I'll bring my student card this time."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 1,
      clue: "Saturday. Sunday is family day at my house.",
      explanation:
        "토요일이고, 마지막에 발표회가 있으며, 수강료가 5만 원 이하인 강좌를 고른다. 세 조건을 모두 채우는 것은 ①이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Saturday / Showcase: Yes / Fee: 45,000 won" },
          { no: 2, label: "②", value: "Day: Sunday / Showcase: Yes / Fee: 30,000 won" },
          { no: 3, label: "③", value: "Day: Saturday / Showcase: No / Fee: 25,000 won" },
          { no: 4, label: "④", value: "Day: Saturday / Showcase: Yes / Fee: 70,000 won" },
          { no: 5, label: "⑤", value: "Day: Sunday / Showcase: No / Fee: 20,000 won" },
        ],
      },
      translation: [
        "W: 동진아, 다음 학기에 주말 강좌 같이 듣자.",
        "M: 다섯 개 있네. 토요일이야, 일요일이야?",
        "W: 토요일. 일요일은 우리 집 가족의 날이야.",
        "M: 동의해. 마지막에 발표회가 있어야 할까?",
        "W: 응. 끝에 뭔가 있으면 더 열심히 해.",
        "M: 맞아. 수강료는? 나는 5만 원 모았어.",
        "W: 나도. 그럼 5만 원이 한계네.",
        "M: 그럼 세 조건 다 맞는 건 하나뿐이야.",
        "W: 신청은 목요일에 닫혀.",
        "M: 내일 점심시간에 하자.",
        "W: 내가 신청서랑 펜 가져올게.",
        "M: 나는 이번엔 학생증 가져올게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Sora, is the cafeteria open during the sports day?"],
        ["W", "Only for an hour, from twelve to one."],
        ["M", "My event finishes at half past twelve."],
        ["W", "Then go straight there. You'll have half an hour."],
      ],
      choices: [
        "The cafeteria is closed all day.",
        "My event is in the morning.",
        "I don't eat lunch at school.",
        "I'll go straight there after my event.",
        "An hour is far too long.",
      ],
      answer: 4,
      clue: "Then go straight there. You'll have half an hour.",
      explanation:
        "여자가 끝나고 바로 가면 30분이 있다고 했으므로, 경기 끝나고 바로 가겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 소라야, 체육대회 때 급식실 열어?",
        "W: 한 시간만. 12시부터 1시까지.",
        "M: 내 경기가 12시 30분에 끝나는데.",
        "W: 그럼 바로 가. 30분 있어.",
        "M: 경기 끝나고 바로 갈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Dongjin, my essay file opens with all the spacing wrong."],
        ["M", "Did you write it on a phone and open it on a computer?"],
        ["W", "Yes, exactly. How did you know?"],
        ["M", "It's the font. Save it as a PDF before you send it."],
      ],
      choices: [
        "My file has no spacing problem.",
        "I'll save it as a PDF.",
        "I never use a phone.",
        "I'll rewrite the whole essay.",
        "The font is not the problem.",
      ],
      answer: 2,
      clue: "It's the font. Save it as a PDF before you send it.",
      explanation:
        "남자가 보내기 전에 PDF로 저장하라고 했으므로, PDF로 저장하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 동진아, 내 글 파일이 줄 간격이 다 틀어진 채로 열려.",
        "M: 휴대폰에서 쓰고 컴퓨터에서 열었어?",
        "W: 응, 맞아. 어떻게 알았어?",
        "M: 글꼴 때문이야. 보내기 전에 PDF로 저장해.",
        "W: PDF로 저장할게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Sora, you've stopped putting your hand up in class."],
        ["W", "I got an answer wrong in September and everyone turned around."],
        ["M", "Do you remember what anyone said afterward?"],
        ["W", "Nobody said anything, actually."],
        ["M", "So the turning around was the whole of it."],
        ["W", "It felt much bigger than that at the time."],
        ["M", "It always does. Then it's gone by lunch for everyone but you."],
        ["W", "And I've been carrying it since September."],
        ["M", "Which has cost you three months of asking things."],
        ["W", "So how do I start again?"],
        ["M", "Ask one question tomorrow, and make it a small one."],
      ],
      choices: [
        "I'll keep quiet for the rest of the year.",
        "Everyone laughed at me that day.",
        "I ask questions all the time.",
        "I'd rather change classes.",
        "I'll ask one small question tomorrow.",
      ],
      answer: 5,
      clue: "Ask one question tomorrow, and make it a small one.",
      explanation:
        "남자가 내일 작은 질문 하나만 해 보라고 했으므로, 내일 작은 질문을 하나 하겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 소라야, 너 수업에서 손을 안 들더라.",
        "W: 9월에 답을 틀렸는데 다들 돌아봤어.",
        "M: 그 뒤에 누가 무슨 말 했는지 기억나?",
        "W: 사실 아무도 아무 말 안 했어.",
        "M: 그럼 돌아본 게 전부였네.",
        "W: 그때는 그보다 훨씬 크게 느껴졌어.",
        "M: 늘 그래. 그러고는 너 빼고 모두에게 점심때면 사라져.",
        "W: 나는 9월부터 계속 지고 있었고.",
        "M: 그게 석 달 치 질문을 앗아 간 거지.",
        "W: 그럼 어떻게 다시 시작해?",
        "M: 내일 질문 하나만 해. 작은 걸로.",
        "W: 내일 작은 질문 하나 할게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Dongjin, you've been buying a new pen every week."],
        ["M", "I'm looking for one that makes writing feel right."],
        ["W", "How many have you bought since September?"],
        ["M", "Eleven, I think. Maybe twelve."],
        ["W", "And how many pages have you written with any of them?"],
        ["M", "Not many, now that you ask."],
        ["W", "So the searching has replaced the writing."],
        ["M", "That's an uncomfortable way to put it."],
        ["W", "It's a comfortable way to avoid starting, which is the real thing."],
        ["M", "Then what do I do with the twelve pens?"],
        ["W", "Pick one, put the rest in a drawer, and write a page tonight."],
      ],
      choices: [
        "I'll buy a better pen tomorrow.",
        "I write ten pages every day.",
        "I'll pick one and write tonight.",
        "None of the pens work at all.",
        "I'll give all the pens away.",
      ],
      answer: 3,
      clue: "Pick one, put the rest in a drawer, and write a page tonight.",
      explanation:
        "여자가 하나만 고르고 나머지는 넣어 둔 뒤 오늘 밤 한 쪽을 쓰라고 했으므로, 그렇게 하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 동진아, 너 매주 새 펜을 사더라.",
        "M: 쓰는 느낌이 딱 맞는 걸 찾고 있어.",
        "W: 9월부터 몇 개 샀어?",
        "M: 열한 개쯤. 열두 개일 수도.",
        "W: 그중 아무거나로 몇 쪽이나 썼어?",
        "M: 묻고 보니 별로 안 썼네.",
        "W: 그럼 찾는 일이 쓰는 일을 대신한 거네.",
        "M: 불편하게 말하네.",
        "W: 시작을 피하기에 편한 방법이지. 그게 진짜 문제고.",
        "M: 그럼 펜 열두 개는 어떻게 해?",
        "W: 하나만 골라. 나머지는 서랍에 넣고, 오늘 밤에 한 쪽 써.",
        "M: 하나 골라서 오늘 밤에 쓸게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Nayoon이 Taemin에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Nayoon : ________________",
      lines: [
        [
          "M",
          "Nayoon and Taemin are preparing the class's entry for the school video contest. " +
            "Taemin has filmed and edited a ten-minute video and the picture is sharp and well cut. " +
            "On Thursday Nayoon watches it on the classroom speakers rather than headphones " +
            "and finds that the interview voices are far too quiet to follow, " +
            "while the background music sits at a comfortable level. " +
            "The contest is judged in a hall through a large sound system. " +
            "Taemin edited the whole thing on headphones, where the balance sounded fine. " +
            "The music track can be turned down in a few minutes without touching the picture, " +
            "and submission is not until Monday. " +
            "She wants to tell him to lower the music so the voices come through. " +
            "In this situation, what would Nayoon most likely say to Taemin?",
        ],
      ],
      choices: [
        "Turn the music down so the voices can be heard.",
        "We should film all the interviews again.",
        "Let's remove the interviews from the video.",
        "We should submit it on Tuesday instead.",
        "Let's make the video twice as long.",
      ],
      answer: 1,
      clue: "She wants to tell him to lower the music so the voices come through.",
      explanation:
        "나윤이는 목소리가 들리도록 음악을 줄이자고 말하려 하므로 ①이 가장 적절하다.",
      translation: [
        "M: 나윤이와 태민이는 학교 영상 대회에 낼 학급 작품을 준비하고 있습니다. 태민이는 10분짜리 영상을 찍고 편집했는데, 화면은 또렷하고 잘 잘려 있습니다. 목요일에 나윤이는 헤드폰이 아니라 교실 스피커로 그것을 봅니다. 그러자 인터뷰 목소리는 너무 작아 알아듣기 어렵고, 배경 음악만 편안한 크기로 들립니다. 대회 심사는 강당에서 큰 음향 장비로 합니다. 태민이는 전체를 헤드폰으로 편집했는데, 거기서는 균형이 괜찮게 들렸습니다. 음악 소리는 화면을 건드리지 않고 몇 분이면 줄일 수 있고, 제출은 월요일입니다. 나윤이는 목소리가 들리도록 음악을 줄이자고 말하고 싶습니다. 이런 상황에서 나윤이가 태민이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why a full kettle boils " +
            "so much more slowly than a half-full one, " +
            "and what that tells us about heat. " +
            "The burner delivers the same amount of energy every second either way. " +
            "What changes is how much water that energy has to be shared among. " +
            "Water is unusually hard to heat. " +
            "It takes about four times as much energy to raise a kilogram of water by one degree " +
            "as it does for the same weight of air. " +
            "This is also why the sea warms slowly in spring and cools slowly in autumn, " +
            "while the sand beside it does both within hours. " +
            "The same property that makes a kettle slow " +
            "makes a coastal town milder than an inland one all year round.",
        ],
      ],
      choices: [
        "why kettles use more electricity than ovens",
        "how the sea produces waves in spring",
        "why sand is warmer than water at night",
        "how water's resistance to heating shapes kettles and coastlines",
        "how to boil water faster with a lid",
      ],
      answer: 4,
      clue: "The same property that makes a kettle slow makes a coastal town milder than an inland one all year round.",
      explanation:
        "남자는 물이 데우기 어려운 성질 때문에 주전자가 느리고 바닷가 마을이 온화하다고 설명한다. 따라서 답은 ④이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 물을 가득 채운 주전자가 왜 절반만 채운 것보다 훨씬 느리게 끓는지, 그리고 그것이 열에 대해 무엇을 알려 주는지 이야기하려 합니다. 불은 어느 쪽이든 1초에 같은 양의 에너지를 줍니다. 달라지는 것은 그 에너지를 얼마나 많은 물이 나눠 갖느냐입니다. 물은 유난히 데우기 어렵습니다. 물 1킬로그램을 1도 올리는 데는 같은 무게의 공기를 올릴 때보다 네 배쯤 되는 에너지가 듭니다. 그래서 바다는 봄에 천천히 데워지고 가을에 천천히 식습니다. 그 옆의 모래는 둘 다 몇 시간 만에 해내는데도요. 주전자를 느리게 만드는 바로 그 성질이, 바닷가 마을을 내륙 마을보다 일 년 내내 온화하게 만듭니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about why a full kettle boils so much more slowly than a half-full one."],
        ["M", "The burner delivers the same amount of energy every second either way."],
        ["M", "What changes is how much water that energy has to be shared among."],
        ["M", "It takes about four times as much energy to raise a kilogram of water by one degree as it does for the same weight of air."],
        ["M", "This is also why the sea warms slowly in spring and cools slowly in autumn."],
        ["M", "while the sand beside it does both within hours."],
      ],
      choices: [
        "the burner giving the same energy either way",
        "a lid making water boil faster",
        "energy being shared among more water",
        "water needing four times the energy of air",
        "sand warming and cooling within hours",
      ],
      answer: 2,
      clue: "The burner delivers the same amount of energy every second either way.",
      explanation:
        "불이 어느 쪽이든 같은 에너지를 준다는 것, 에너지를 더 많은 물이 나눠 갖는다는 것, 물이 공기보다 네 배의 에너지를 요구한다는 것, 모래가 몇 시간 만에 데워지고 식는다는 것은 언급되지만 뚜껑이 물을 빨리 끓게 한다는 것은 언급되지 않았다. 따라서 답은 ②이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
