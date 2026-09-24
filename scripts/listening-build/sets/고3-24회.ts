/** 고3 듣기 24회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고3 24회",
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
          "Good afternoon, third-year students. This is Ms. Han from the study support office. " +
            "I want to say something about the self-study rooms on the fourth floor. " +
            "Since October, students have been reserving a desk for the whole evening " +
            "and then leaving for two or three hours at a time. " +
            "The bag stays on the desk, so the seat looks taken, " +
            "and twenty students a night are turned away from a room that is half empty. " +
            "Starting next Monday, the reservation system will ask you to tap your card again " +
            "every two hours at the door. " +
            "If you do not tap, the seat is released and someone else can take it. " +
            "You can still leave for dinner. Just tap on your way back in. " +
            "This is not about counting hours. It is about the seats actually being used. Thank you.",
        ],
      ],
      choices: [
        "자습실 좌석 재확인 제도를 알리려고",
        "자습실 이용 시간 연장을 알리려고",
        "자습실 공사를 안내하려고",
        "분실물 관리 규정을 알리려고",
        "자습실 신청 방법을 안내하려고",
      ],
      answer: 1,
      clue: "Starting next Monday, the reservation system will ask you to tap your card again every two hours at the door.",
      explanation:
        "여자는 자리만 맡고 비워 두는 일 때문에 다음 주 월요일부터 두 시간마다 카드를 다시 찍게 한다고 알린다. 따라서 답은 ①이다.",
      translation: [
        "W: 3학년 학생 여러분, 안녕하세요. 학습지원실 한입니다. 4층 자습실에 대해 말씀드리려 합니다. 10월부터 학생들이 저녁 내내 자리를 맡아 두고는 두세 시간씩 자리를 비우고 있습니다. 가방이 책상에 있어서 자리가 찬 것처럼 보이고, 반쯤 빈 자습실에서 하룻밤에 스무 명이 돌아갑니다. 다음 주 월요일부터 예약 체계가 두 시간마다 문에서 카드를 다시 찍도록 안내합니다. 찍지 않으면 자리가 풀려 다른 학생이 쓸 수 있습니다. 저녁을 먹으러 나가셔도 됩니다. 돌아오면서 찍기만 하세요. 이것은 시간을 재려는 것이 아닙니다. 자리가 실제로 쓰이게 하려는 것입니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Minjun, I've been highlighting every textbook in three colors."],
        ["M", "Three? What does each color mean?"],
        ["W", "Yellow for important, pink for very important, blue for terms."],
        ["M", "How do you decide between yellow and pink while reading?"],
        ["W", "I usually decide afterward and go back over it."],
        ["M", "So the colors are added after you already understood the page."],
        ["W", "Is that a problem? The page looks organized."],
        ["M", "It looks organized. The organizing happened in your hand, not your head."],
        ["W", "Then what should I do with the second pass?"],
        ["M", "Close the book and write the page from memory. Then check."],
        ["W", "That takes three times as long."],
        ["M", "It takes longer and it tells you what you don't know. Colors never do."],
      ],
      choices: [
        "형광펜은 한 가지 색만 써야 한다",
        "교과서는 여러 번 읽어야 한다",
        "용어 정리를 따로 해야 한다",
        "다시 볼 때는 덮고 써 본 뒤 확인해야 한다",
        "필기는 수업 중에 끝내야 한다",
      ],
      answer: 4,
      clue: "Close the book and write the page from memory. Then check.",
      explanation:
        "남자는 색칠은 손에서 일어난 정리일 뿐이라며, 책을 덮고 기억으로 써 본 뒤 확인하라고 말한다. 따라서 답은 ④이다.",
      translation: [
        "W: 민준아, 나 교과서마다 형광펜 세 가지 색으로 칠하고 있어.",
        "M: 세 가지? 색마다 무슨 뜻인데?",
        "W: 노랑은 중요, 분홍은 아주 중요, 파랑은 용어.",
        "M: 읽으면서 노랑이냐 분홍이냐를 어떻게 정해?",
        "W: 보통 나중에 정해서 다시 훑어.",
        "M: 그럼 색은 이미 그 쪽을 이해한 다음에 붙는 거네.",
        "W: 그게 문제야? 쪽이 정리돼 보이는데.",
        "M: 정리돼 보이지. 정리는 네 손에서 일어났지 머리에서 일어난 게 아니야.",
        "W: 그럼 두 번째로 볼 때 뭘 해야 해?",
        "M: 책을 덮고 그 쪽을 기억으로 써 봐. 그다음에 확인하고.",
        "W: 그럼 세 배는 걸려.",
        "M: 더 걸리지. 그리고 네가 모르는 걸 알려 줘. 색은 절대 못 해.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "We talk about advice as though the difficulty were finding good advice. " +
            "It is not. Good advice is everywhere, and most of it contradicts other good advice. " +
            "Write every day. Wait until you have something to say. " +
            "Both are given by people who succeeded, and both are true reports. " +
            "The missing piece is that every piece of advice was extracted from a situation, " +
            "and the situation was thrown away when the advice was written down. " +
            "Someone who tells you to quit your job and take the risk " +
            "is usually someone whose risk worked, speaking to a room " +
            "that does not contain the people whose risk did not. " +
            "So the useful question is never whether the advice is good. " +
            "It is what conditions made it work for them, " +
            "and whether those conditions are anywhere near your own.",
        ],
      ],
      choices: [
        "좋은 조언을 많이 들어야 한다",
        "조언은 그것이 통했던 조건까지 따져야 한다",
        "성공한 사람의 말을 믿어야 한다",
        "조언보다 경험이 중요하다",
        "위험을 감수해야 성공한다",
      ],
      answer: 2,
      clue: "It is what conditions made it work for them, and whether those conditions are anywhere near your own.",
      explanation:
        "여자는 조언에서 상황이 버려진다며, 그 조언이 통했던 조건과 내 조건이 비슷한지를 물어야 한다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "W: 우리는 마치 어려움이 좋은 조언을 찾는 데 있는 것처럼 조언을 이야기합니다. 그렇지 않습니다. 좋은 조언은 어디에나 있고, 그 대부분은 다른 좋은 조언과 어긋납니다. 매일 써라. 할 말이 생길 때까지 기다려라. 둘 다 성공한 사람들이 하는 말이고, 둘 다 진실한 보고입니다. 빠진 조각은 모든 조언이 어떤 상황에서 뽑혀 나왔고, 조언이 적히는 순간 그 상황은 버려졌다는 사실입니다. 일을 그만두고 위험을 감수하라고 말하는 사람은 대개 그 위험이 통했던 사람이고, 통하지 않았던 사람들이 없는 방에서 말하고 있습니다. 그러니 쓸모 있는 질문은 그 조언이 좋으냐가 아닙니다. 어떤 조건이 그들에게 그것을 통하게 했는지, 그리고 그 조건이 내 조건과 조금이라도 비슷한지입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Seoa, is this the corner you turned into a plant shelf?"],
        ["W", "Yes, I put it together over the weekend."],
        ["M", "There's a watering can standing on the floor."],
        ["W", "I keep it there so I don't forget."],
        ["M", "And a round mirror hangs on the wall above the shelf."],
        ["W", "It bounces the morning light onto the leaves."],
        ["M", "I count four pots on the middle shelf."],
        ["W", "There are five. One is hidden behind the tall one."],
        ["M", "The striped rug under the shelf ties it together."],
        ["W", "That came from my grandmother's house."],
        ["M", "And a small basket of tools sits on the bottom shelf."],
        ["W", "Gloves, scissors and a trowel, all in one place."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are five. One is hidden behind the tall one.",
      explanation:
        "남자가 가운데 칸에 화분이 네 개라고 하자 여자가 다섯 개라고 바로잡는다. 그림에는 네 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A plant shelf in a room corner drawn as one wide picture, clean black line art on white, no writing or letters anywhere. " +
          "A WATERING CAN stands on the floor beside the shelf. " +
          "A ROUND MIRROR hangs on the wall above the shelf. " +
          "The MIDDLE SHELF holds exactly FOUR POTTED PLANTS, clearly countable and evenly spaced. " +
          "A RUG WITH BOLD STRIPES lies on the floor under the shelf. " +
          "A SMALL BASKET OF GARDEN TOOLS sits on the bottom shelf.",
      },
      translation: [
        "M: 서아야, 이게 화분 선반으로 꾸민 그 구석이야?",
        "W: 응, 주말에 짜 맞췄어.",
        "M: 바닥에 물뿌리개가 서 있네.",
        "W: 잊어버리지 않으려고 거기 둬.",
        "M: 그리고 선반 위 벽에 둥근 거울이 걸려 있어.",
        "W: 아침 빛을 잎으로 반사해 줘.",
        "M: 가운데 칸에 화분이 네 개 보여.",
        "W: 다섯 개야. 하나는 큰 것 뒤에 가려졌어.",
        "M: 선반 밑 줄무늬 깔개가 잘 어울린다.",
        "W: 할머니 댁에서 가져온 거야.",
        "M: 그리고 맨 아래 칸에 도구 바구니가 있네.",
        "W: 장갑, 가위, 모종삽. 한곳에 다 모아 뒀어.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Minjun, the alumni talk starts at four in the auditorium."],
        ["M", "I know. Did the speakers confirm?"],
        ["W", "All three. The last one replied this morning."],
        ["M", "Good. And the question cards for the audience?"],
        ["W", "Printed and cut. They're in the box by the stage."],
        ["M", "Then what's still open?"],
        ["W", "Nobody has set up the microphones. There are two and neither is tested."],
        ["M", "Do we know where the receiver is?"],
        ["W", "In the media room, but you need the teacher's key."],
        ["M", "I have it. I borrowed it this morning for the projector."],
        ["W", "I'd go, but I'm meeting the speakers at the front gate."],
        ["M", "Then I'll set up both microphones and test them."],
      ],
      choices: [
        "연사에게 연락하기",
        "질문 카드 인쇄하기",
        "마이크 설치하고 시험하기",
        "연사 맞이하기",
        "프로젝터 빌리기",
      ],
      answer: 3,
      clue: "Then I'll set up both microphones and test them.",
      explanation:
        "연사 확인과 질문 카드는 끝났고 여자는 연사를 맞으러 가야 하므로, 남자가 마이크 두 개를 설치하고 시험하기로 한다. 따라서 답은 ③이다.",
      translation: [
        "W: 민준아, 동문 강연이 4시에 강당에서 시작해.",
        "M: 알아. 연사분들 확답 왔어?",
        "W: 세 분 다. 마지막 분이 오늘 아침에 답 주셨어.",
        "M: 좋아. 관객용 질문 카드는?",
        "W: 인쇄해서 잘랐어. 무대 옆 상자에 있어.",
        "M: 그럼 아직 남은 게 뭐야?",
        "W: 마이크를 아무도 설치하지 않았어. 두 개인데 둘 다 시험도 안 했어.",
        "M: 수신기가 어디 있는지는 알아?",
        "W: 매체실에. 그런데 선생님 열쇠가 있어야 해.",
        "M: 나한테 있어. 오늘 아침에 프로젝터 때문에 빌렸어.",
        "W: 내가 가고 싶은데, 정문에서 연사분들을 맞아야 해.",
        "M: 그럼 내가 마이크 두 개 설치하고 시험할게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Lakeside Bookbinding. How can I help you?"],
        ["W", "I'd like eight copies of my thesis bound, please."],
        ["M", "Hardcover binding is twenty-five dollars per copy."],
        ["W", "So two hundred dollars for the eight."],
        ["M", "That's right. Would you like gold lettering on the spine?"],
        ["W", "How much does the lettering add?"],
        ["M", "Six dollars a copy, so forty-eight more."],
        ["W", "The department doesn't require it. I'll skip the lettering."],
        ["M", "Understood. Are you a student at the university?"],
        ["W", "Yes, here's my card."],
        ["M", "Then I can take fifteen percent off the binding."],
        ["W", "Thank you. I'll pay now and collect them Thursday."],
      ],
      choices: ["$170.00", "$180.00", "$200.00", "$210.80", "$248.00"],
      answer: 1,
      clue: "Then I can take fifteen percent off the binding.",
      explanation:
        "여덟 부 제본비 200달러에서 금박은 빼고, 학생 할인 15퍼센트를 빼면 170달러이다. 따라서 답은 ①이다.",
      translation: [
        "M: 레이크사이드 제본소입니다. 무엇을 도와드릴까요?",
        "W: 논문 여덟 부를 제본하고 싶어요.",
        "M: 양장 제본은 한 부에 25달러입니다.",
        "W: 그럼 여덟 부에 200달러네요.",
        "M: 맞습니다. 책등에 금박 글씨도 넣으시겠어요?",
        "W: 그건 얼마가 더 붙나요?",
        "M: 한 부에 6달러라서 48달러가 더 붙습니다.",
        "W: 학과에서 요구하지 않아요. 금박은 뺄게요.",
        "M: 알겠습니다. 이 대학 학생이신가요?",
        "W: 네, 여기 학생증이요.",
        "M: 그럼 제본비에서 15퍼센트를 빼 드릴게요.",
        "W: 감사합니다. 지금 결제하고 목요일에 찾아갈게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 교환 학생 지원을 포기한 이유를 고르시오.",
      lines: [
        ["W", "Minjun, you withdrew your exchange programme application?"],
        ["M", "Last Friday, yes."],
        ["W", "Was your language score below the cutoff?"],
        ["M", "No, I passed that in September with room to spare."],
        ["W", "Then is it the cost? The tuition there is high."],
        ["M", "The scholarship would have covered almost all of it."],
        ["W", "So what happened?"],
        ["M", "The semester there overlaps with my final exams here."],
        ["W", "By how much?"],
        ["M", "Three weeks. I'd have to miss the exams entirely, and they can't be retaken."],
      ],
      choices: [
        "어학 점수가 모자라서",
        "학비가 부담스러워서",
        "학기가 기말시험과 겹쳐서",
        "가족이 반대해서",
        "건강이 좋지 않아서",
      ],
      answer: 3,
      clue: "The semester there overlaps with my final exams here.",
      explanation:
        "어학 점수도 넘겼고 장학금으로 학비도 해결되지만, 그곳 학기가 이곳 기말시험과 3주 겹쳐 시험을 아예 못 보기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "W: 민준아, 교환 학생 지원을 취소했다며?",
        "M: 응, 지난 금요일에.",
        "W: 어학 점수가 기준에 못 미쳤어?",
        "M: 아니, 9월에 여유 있게 넘겼어.",
        "W: 그럼 비용 때문이야? 거기 학비가 비싸잖아.",
        "M: 장학금으로 거의 다 해결됐을 거야.",
        "W: 그럼 무슨 일인데?",
        "M: 거기 학기가 여기 기말시험이랑 겹쳐.",
        "W: 얼마나?",
        "M: 3주. 시험을 통째로 못 보는데, 재응시도 안 돼.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Winter Coding Camp에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Minjun, have you looked at the Winter Coding Camp?"],
        ["M", "I opened the page but didn't read it. When is it?"],
        ["W", "Five days, from the twenty-second to the twenty-sixth of January."],
        ["M", "Five days straight. Where does it run?"],
        ["W", "At the science high school's computer lab, two stops from here."],
        ["M", "That's close. What do they actually teach?"],
        ["W", "Two days on databases, then three building a small web service."],
        ["M", "That's more useful than I expected. What does it cost?"],
        ["W", "Eighty thousand won, and a laptop is lent to you."],
        ["M", "I don't have to bring my own? That helps."],
        ["W", "Mine is too slow for this anyway."],
        ["M", "Then let's apply together this week."],
      ],
      choices: ["운영 기간", "장소", "수업 내용", "참가비", "지원 자격"],
      answer: 5,
      clue: "지원 자격은 대화에서 언급되지 않았다.",
      explanation:
        "기간(1월 22일부터 26일까지 닷새), 장소(과학고 컴퓨터실), 수업 내용(데이터베이스와 웹 서비스), 참가비(8만 원)는 언급되지만 지원 자격은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 민준아, 겨울 코딩 캠프 봤어?",
        "M: 페이지는 열었는데 안 읽었어. 언제야?",
        "W: 1월 22일부터 26일까지 닷새.",
        "M: 닷새 연달아서. 어디서 해?",
        "W: 과학고 컴퓨터실에서. 여기서 두 정거장이야.",
        "M: 가깝네. 뭘 가르치는데?",
        "W: 이틀은 데이터베이스, 사흘은 작은 웹 서비스 만들기.",
        "M: 생각보다 쓸모 있네. 참가비는?",
        "W: 8만 원. 노트북은 빌려줘.",
        "M: 내 걸 안 가져가도 돼? 다행이다.",
        "W: 내 것도 이런 건 너무 느려.",
        "M: 그럼 이번 주에 같이 신청하자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Granite Ridge Ski Center에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Let me tell you about the Granite Ridge Ski Center. " +
            "It has eleven slopes, three of which are open for night skiing until ten. " +
            "The season usually runs from the middle of December to the end of February. " +
            "Lift tickets can be bought at the gate or online, and online is two thousand won cheaper. " +
            "Ski and boot rental is available on site, but helmets must be brought from home. " +
            "There is a free shuttle from the train station every hour on the half hour. " +
            "Beginners' lessons are held twice a day and must be booked the day before.",
        ],
      ],
      choices: [
        "슬로프가 열한 개이다",
        "12월 중순부터 2월 말까지 운영한다",
        "온라인 표가 더 싸다",
        "헬멧도 현장에서 빌릴 수 있다",
        "역에서 무료 셔틀이 다닌다",
      ],
      answer: 4,
      clue: "Ski and boot rental is available on site, but helmets must be brought from home.",
      explanation:
        "스키와 부츠는 빌릴 수 있지만 헬멧은 집에서 가져와야 한다고 했으므로 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "M: 그래닛리지 스키장을 소개해 드리겠습니다. 슬로프가 열한 개 있고, 그중 세 개는 10시까지 야간 스키를 위해 엽니다. 시즌은 보통 12월 중순부터 2월 말까지입니다. 리프트 표는 매표소나 온라인에서 살 수 있고, 온라인이 2천 원 쌉니다. 스키와 부츠는 현장에서 빌릴 수 있지만 헬멧은 집에서 가져오셔야 합니다. 기차역에서 매시 30분에 무료 셔틀이 출발합니다. 초보자 강습은 하루 두 번 있고 하루 전에 예약해야 합니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 모의 면접 프로그램을 고르시오.",
      lines: [
        ["W", "Minjun, let's sign up for a mock interview programme."],
        ["M", "Five are listed. In person or online?"],
        ["W", "In person. I need to practise walking into a room."],
        ["M", "Fair enough. Do we want recorded feedback?"],
        ["W", "Yes. I want to see what my hands do while I'm talking."],
        ["M", "Agreed. And the fee? I have forty thousand won left."],
        ["W", "Mine's about the same, so forty thousand is the limit."],
        ["M", "Then only one programme fits all three."],
        ["W", "Sessions start the week after next."],
        ["M", "Let's register before the list fills."],
        ["W", "I'll do it tonight and send you the confirmation."],
        ["M", "Thanks. I'll prepare my answers before the first session."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "In person. I need to practise walking into a room.",
      explanation:
        "대면이고, 녹화 피드백이 있으며, 참가비가 4만 원 이하인 것을 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Format: Online / Recorded feedback: Yes / Fee: 25,000 won" },
          { no: 2, label: "②", value: "Format: In person / Recorded feedback: Yes / Fee: 38,000 won" },
          { no: 3, label: "③", value: "Format: In person / Recorded feedback: No / Fee: 20,000 won" },
          { no: 4, label: "④", value: "Format: In person / Recorded feedback: Yes / Fee: 55,000 won" },
          { no: 5, label: "⑤", value: "Format: Online / Recorded feedback: No / Fee: 15,000 won" },
        ],
      },
      translation: [
        "W: 민준아, 모의 면접 프로그램 신청하자.",
        "M: 다섯 개 있네. 대면이야, 온라인이야?",
        "W: 대면. 방에 들어가는 것부터 연습해야 해.",
        "M: 그럴 만해. 녹화 피드백은 있는 걸로 할까?",
        "W: 응. 말할 때 내 손이 뭘 하는지 보고 싶어.",
        "M: 동의해. 참가비는? 나는 4만 원 남았어.",
        "W: 나도 비슷해. 그럼 4만 원이 한계네.",
        "M: 그럼 세 조건 다 맞는 건 하나뿐이야.",
        "W: 다다음 주부터 시작이래.",
        "M: 명단 차기 전에 등록하자.",
        "W: 오늘 밤에 하고 확인 보낼게.",
        "M: 고마워. 첫 회 전에 답변 준비해 둘게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Seoa, is the career office open during the exam period?"],
        ["W", "It is, but appointments only. No walk-ins."],
        ["M", "I went yesterday and they turned me away."],
        ["W", "Book a slot on the school app. It takes a minute."],
      ],
      choices: [
        "The office has closed for good.",
        "I'll book a slot tonight.",
        "I don't need any advice.",
        "I'll walk in again tomorrow.",
        "There is no school app.",
      ],
      answer: 2,
      clue: "Book a slot on the school app. It takes a minute.",
      explanation:
        "여자가 학교 앱으로 예약하라고 했으므로, 오늘 밤 예약하겠다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 서아야, 시험 기간에 진로실 열어?",
        "W: 열어. 그런데 예약만 받아. 그냥 가면 안 돼.",
        "M: 어제 갔다가 돌려보내졌어.",
        "W: 학교 앱으로 예약해. 1분이면 돼.",
        "M: 오늘 밤에 예약할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Minjun, my recommendation letter hasn't arrived at the university."],
        ["M", "When did the teacher say she sent it?"],
        ["W", "Two weeks ago, through the portal."],
        ["M", "The portal shows the status. Log in and check whether it says submitted."],
      ],
      choices: [
        "I never asked for a letter.",
        "The portal has no status page.",
        "I'll log in and check now.",
        "I'll ask for a second letter.",
        "It arrived last week.",
      ],
      answer: 3,
      clue: "The portal shows the status. Log in and check whether it says submitted.",
      explanation:
        "남자가 포털에서 상태를 확인하라고 했으므로, 지금 들어가 확인해 보겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 민준아, 내 추천서가 대학에 도착하지 않았어.",
        "M: 선생님이 언제 보내셨다고 하셨는데?",
        "W: 2주 전에, 포털로.",
        "M: 포털에 상태가 나와. 들어가서 제출됨이라고 돼 있는지 봐.",
        "W: 지금 들어가서 확인해 볼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Minjun, you've asked me to check the same paragraph five times."],
        ["M", "I keep thinking there's something wrong with it."],
        ["W", "I've told you four times that it reads well."],
        ["M", "I know. It still doesn't feel finished."],
        ["W", "Would any answer from me make it feel finished?"],
        ["M", "Probably not. That's the uncomfortable part."],
        ["W", "Then the problem isn't the paragraph."],
        ["M", "It's that I can't tell when to stop."],
        ["W", "Everyone who writes has that. Some decide in advance."],
        ["M", "Decide what, exactly?"],
        ["W", "Set a number of passes before you start, and send it when you hit it."],
      ],
      choices: [
        "I'll set three passes and send it.",
        "I'll rewrite the paragraph again.",
        "I never revise anything.",
        "The paragraph is finished already.",
        "I'll ask someone else to read it.",
      ],
      answer: 1,
      clue: "Set a number of passes before you start, and send it when you hit it.",
      explanation:
        "여자가 시작하기 전에 고쳐 볼 횟수를 정하고 그 횟수가 되면 보내라고 했으므로, 세 번으로 정하고 보내겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 민준아, 같은 문단을 나한테 다섯 번이나 봐 달라고 했어.",
        "M: 자꾸 뭔가 잘못된 것 같아서.",
        "W: 잘 읽힌다고 네 번이나 말했잖아.",
        "M: 알아. 그래도 끝난 것 같지 않아.",
        "W: 내가 무슨 말을 하면 끝난 것 같아질까?",
        "M: 아마 아닐 거야. 그게 불편한 부분이야.",
        "W: 그럼 문제는 그 문단이 아니네.",
        "M: 언제 멈춰야 할지를 모르겠다는 거지.",
        "W: 글 쓰는 사람은 다 그래. 어떤 사람은 미리 정해.",
        "M: 정확히 뭘 정하는데?",
        "W: 시작하기 전에 몇 번 고칠지 정하고, 그 횟수가 되면 보내.",
        "M: 세 번으로 정하고 보낼게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoa, you've been doing the club's accounts alone for two years."],
        ["W", "It's faster than teaching someone the spreadsheet."],
        ["M", "And when you graduate in March?"],
        ["W", "Someone will pick it up, I suppose."],
        ["M", "From what? There's no note anywhere about how it works."],
        ["W", "It's all in my head, honestly."],
        ["M", "Then the club loses two years of work the day you leave."],
        ["W", "I hadn't thought of it as something that could be lost."],
        ["M", "Anything that lives in one person's head can be."],
        ["W", "So what would you do with three months left?"],
        ["M", "Write down how one month's accounts get done, and have someone follow it."],
      ],
      choices: [
        "I'll keep doing it after I graduate.",
        "The club doesn't keep accounts.",
        "Everything is already written down.",
        "I'll delete the spreadsheet instead.",
        "I'll write the steps out this month.",
      ],
      answer: 5,
      clue: "Write down how one month's accounts get done, and have someone follow it.",
      explanation:
        "남자가 한 달 치 회계 처리 절차를 적어 두고 누군가 따라 하게 하라고 했으므로, 이번 달에 적어 두겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 서아야, 동아리 회계를 2년째 혼자 하고 있네.",
        "W: 표 계산을 누구한테 가르치는 것보다 빨라서.",
        "M: 3월에 졸업하면?",
        "W: 누군가 이어받겠지.",
        "M: 뭘 보고? 어떻게 하는지 적힌 게 어디에도 없어.",
        "W: 솔직히 다 내 머릿속에 있어.",
        "M: 그럼 네가 나가는 날 동아리는 2년 치 일을 잃는 거야.",
        "W: 잃을 수 있는 거라고는 생각 못 했어.",
        "M: 한 사람 머릿속에만 있는 건 다 그래.",
        "W: 그럼 석 달 남은 지금 너라면 뭘 하겠어?",
        "M: 한 달 치 회계를 어떻게 하는지 적어 두고, 누군가 그대로 따라 하게 해.",
        "W: 이번 달에 절차를 적어 둘게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Taegeon이 Sehui에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Taegeon : ________________",
      lines: [
        [
          "M",
          "Taegeon and Sehui are preparing the year-end report for their volunteer group. " +
            "Sehui has written a careful summary of everything the group did this year, " +
            "and the numbers in it are all correct. " +
            "The report will be read by the city office that decides next year's funding. " +
            "Taegeon notices that Sehui has put the group's biggest achievement, " +
            "a tutoring programme that reached two hundred children, " +
            "on the last page, after four pages of meeting attendance and equipment lists. " +
            "He knows from a friend at the city office that these reports are often skimmed, " +
            "and that reviewers rarely reach the final page of a five-page document. " +
            "The tutoring programme is the one thing that would justify the funding, " +
            "and Sehui has buried it where it is least likely to be read. " +
            "He wants to tell her to move the tutoring programme to the first page. " +
            "In this situation, what would Taegeon most likely say to Sehui?",
        ],
      ],
      choices: [
        "We should make the report much longer.",
        "Let's remove the attendance lists entirely.",
        "We should send the report next month instead.",
        "Let's move the tutoring programme to the first page.",
        "Let's ask the city office for more funding.",
      ],
      answer: 4,
      clue: "He wants to tell her to move the tutoring programme to the first page.",
      explanation:
        "태건이는 과외 활동을 첫 쪽으로 옮기자고 말하려 하므로 ④가 가장 적절하다.",
      translation: [
        "M: 태건이와 세희는 봉사 모임의 연말 보고서를 준비하고 있습니다. 세희는 올해 모임이 한 일을 꼼꼼히 정리했고, 그 안의 숫자는 모두 정확합니다. 이 보고서는 내년 지원금을 결정하는 시청에서 읽습니다. 태건이는 세희가 모임의 가장 큰 성과, 곧 아이 이백 명에게 닿은 학습 지원 활동을 마지막 쪽에, 회의 출석과 비품 목록 네 쪽 뒤에 두었다는 것을 알아챕니다. 태건이는 시청에 있는 친구에게서 이런 보고서가 대개 훑어 읽히고, 다섯 쪽짜리 문서의 마지막 쪽까지 가는 검토자는 드물다는 것을 들었습니다. 학습 지원 활동은 지원금을 정당화할 유일한 것인데, 세희는 그것을 가장 읽히지 않을 자리에 묻어 두었습니다. 태건이는 학습 지원 활동을 첫 쪽으로 옮기자고 말하고 싶습니다. 이런 상황에서 태건이가 세희에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why some trees drop their leaves " +
            "while others keep them through the winter. " +
            "A leaf is a factory. It makes food, but it also loses water through tiny pores. " +
            "In summer that trade is worth it. In winter it is not, " +
            "because the ground freezes and the roots cannot replace what the leaves give away. " +
            "A broad-leaved tree solves this by shutting the factory down. " +
            "It pulls the useful chemicals back into the branches and lets the leaves fall. " +
            "A pine takes the opposite route. " +
            "Its needles have almost no surface area and are coated in wax, " +
            "so they lose very little water and can keep working slowly all winter. " +
            "Two completely different shapes, both answering the same question: " +
            "what do you do when water stops arriving.",
        ],
      ],
      choices: [
        "how trees handle winter water loss in two different ways",
        "why leaves change color in autumn",
        "how pine trees survive in high mountains",
        "why broad leaves make more food than needles",
        "how roots absorb water from frozen ground",
      ],
      answer: 1,
      clue: "Two completely different shapes, both answering the same question: what do you do when water stops arriving.",
      explanation:
        "여자는 활엽수는 잎을 떨구고 소나무는 바늘잎으로 물을 아끼는, 겨울 물 부족에 대한 두 가지 해법을 설명한다. 따라서 답은 ①이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 어떤 나무는 잎을 떨구고 어떤 나무는 겨울 내내 잎을 달고 있는 이유를 이야기하려 합니다. 잎은 공장입니다. 양분을 만들지만 작은 구멍으로 물도 잃습니다. 여름에는 그 거래가 남습니다. 겨울에는 그렇지 않습니다. 땅이 얼어 뿌리가 잎이 내보낸 물을 채워 줄 수 없기 때문입니다. 넓은 잎을 가진 나무는 공장을 닫아 이 문제를 풉니다. 쓸모 있는 물질을 가지로 거둬들이고 잎을 떨어뜨립니다. 소나무는 반대 길을 갑니다. 바늘잎은 겉넓이가 거의 없고 밀랍으로 덮여 있어서 물을 아주 조금만 잃고, 겨울 내내 천천히 일할 수 있습니다. 완전히 다른 두 모양이 같은 질문에 답하고 있습니다. 물이 오지 않을 때 무엇을 할 것인가.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Hello, everyone. Today I want to talk about why some trees drop their leaves while others keep them through the winter."],
        ["W", "A leaf is a factory. It makes food, but it also loses water through tiny pores."],
        ["W", "In winter that trade is not worth it, because the ground freezes and the roots cannot replace what the leaves give away."],
        ["W", "A broad-leaved tree pulls the useful chemicals back into the branches and lets the leaves fall."],
        ["W", "Its needles have almost no surface area and are coated in wax, so they lose very little water."],
        ["W", "and can keep working slowly all winter."],
      ],
      choices: [
        "a leaf losing water through tiny pores",
        "the ground freezing in winter",
        "chemicals being pulled back into the branches",
        "needles being coated in wax",
        "leaves being eaten by winter insects",
      ],
      answer: 5,
      clue: "A leaf is a factory. It makes food, but it also loses water through tiny pores.",
      explanation:
        "잎이 작은 구멍으로 물을 잃는 것, 겨울에 땅이 어는 것, 물질을 가지로 거둬들이는 것, 바늘잎이 밀랍으로 덮인 것은 언급되지만 겨울 곤충이 잎을 먹는 것은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
