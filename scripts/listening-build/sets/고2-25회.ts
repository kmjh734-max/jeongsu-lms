/** 고2 듣기 25회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 25회",
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
          "Good morning, everyone. This is Sujin Bae, the school librarian. " +
            "I want to talk about the way books are being returned. " +
            "Since September we have had a drop box outside the library door, " +
            "and it has made returning books much easier, which is exactly what we wanted. " +
            "But about thirty books a month are coming back damaged, " +
            "because people are dropping in books that were already wet from the rain. " +
            "A wet book in a closed box takes the shape of the books around it and never recovers. " +
            "So from Monday, please do not use the drop box on rainy days. " +
            "Bring the book to the desk instead, even if you have to wait a minute. " +
            "The box will stay open on every dry day. Thank you.",
        ],
      ],
      choices: [
        "도서 대출 기간 변경을 알리려고",
        "반납함 위치 변경을 알리려고",
        "훼손 도서 변상 규정을 알리려고",
        "도서관 휴관을 안내하려고",
        "비 오는 날 반납함 사용을 자제해 달라고 하려고",
      ],
      answer: 5,
      clue: "So from Monday, please do not use the drop box on rainy days.",
      explanation:
        "여자는 비에 젖은 책이 반납함 안에서 망가진다며 비 오는 날에는 반납함 대신 데스크로 가져와 달라고 부탁한다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 여러분, 안녕하세요. 학교 사서 배수진입니다. 책을 반납하는 방식에 대해 말씀드리려 합니다. 9월부터 도서관 문 밖에 반납함을 두었고, 덕분에 반납이 훨씬 쉬워졌습니다. 저희가 바라던 바로 그것입니다. 그런데 한 달에 서른 권쯤이 상한 채로 돌아옵니다. 비에 이미 젖은 책을 그대로 넣기 때문입니다. 닫힌 상자 안의 젖은 책은 주변 책들의 모양을 따라 굳어 다시는 돌아오지 않습니다. 그래서 월요일부터는 비 오는 날에 반납함을 쓰지 말아 주세요. 잠시 기다리시더라도 데스크로 가져와 주시기 바랍니다. 비가 오지 않는 날에는 반납함을 계속 열어 두겠습니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Dohee, I've been doing practice tests every single evening."],
        ["M", "Every evening? How do you go over the ones you got wrong?"],
        ["W", "I check the answers and move on to the next test."],
        ["M", "So the mistakes go straight into the recycling bin."],
        ["W", "I remember them well enough. I don't need to write them down."],
        ["M", "How many did you get wrong last Tuesday?"],
        ["W", "I couldn't tell you. Somewhere around fifteen."],
        ["M", "And how many of those fifteen did you get wrong again since?"],
        ["W", "I have no way of knowing that."],
        ["M", "That's the number that tells you whether the evenings are working."],
        ["W", "So the tests aren't the practice. The going back is."],
        ["M", "Right. One test plus a real review beats three tests and none."],
      ],
      choices: [
        "문제는 매일 풀어야 한다",
        "오답 노트는 손으로 써야 한다",
        "문제를 많이 푸는 것보다 오답을 되짚는 것이 낫다",
        "시험은 시간을 재고 풀어야 한다",
        "쉬운 문제부터 풀어야 한다",
      ],
      answer: 3,
      clue: "One test plus a real review beats three tests and none.",
      explanation:
        "남자는 다시 틀린 문제의 수가 저녁 공부의 성과를 말해 준다며, 한 세트에 제대로 된 복습을 더한 쪽이 낫다고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 도희야, 나 매일 저녁 모의 문제를 풀고 있어.",
        "M: 매일 저녁? 틀린 건 어떻게 다시 봐?",
        "W: 답만 확인하고 다음 세트로 넘어가.",
        "M: 그럼 실수는 곧장 쓰레기통으로 가는 거네.",
        "W: 충분히 기억해. 적어 둘 필요는 없어.",
        "M: 지난 화요일에 몇 개 틀렸는데?",
        "W: 말 못 하겠어. 열다섯 개쯤?",
        "M: 그 열다섯 개 중에 그 뒤로 또 틀린 건 몇 개야?",
        "W: 그건 알 방법이 없어.",
        "M: 그 숫자가 네 저녁 공부가 되고 있는지 알려 주는 거야.",
        "W: 그럼 문제 푸는 게 연습이 아니라 되짚는 게 연습이구나.",
        "M: 그래. 한 세트에 제대로 된 복습이, 세 세트에 복습 없는 것보다 나아.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "There is a move that good teachers make and the rest of us rarely copy. " +
            "When a student gives a wrong answer, they do not correct it immediately. " +
            "They ask how the student got there. " +
            "This looks like patience, and it is partly that, " +
            "but the real reason is more practical. " +
            "A wrong answer is the visible end of an invisible chain, " +
            "and correcting the end leaves the chain untouched. " +
            "The student walks away with the right answer to that one question " +
            "and the same faulty step waiting for the next one. " +
            "Asking how they got there brings the step into the open, " +
            "where it can actually be changed. " +
            "It costs a minute, and it is the difference " +
            "between fixing an answer and fixing a method.",
        ],
      ],
      choices: [
        "틀린 답은 고치기보다 어떻게 나왔는지 물어야 한다",
        "교사는 인내심이 있어야 한다",
        "정답은 바로 알려 주어야 한다",
        "학생은 질문을 많이 해야 한다",
        "수업은 학생 중심이어야 한다",
      ],
      answer: 1,
      clue: "Asking how they got there brings the step into the open, where it can actually be changed.",
      explanation:
        "여자는 틀린 답을 고치면 그 답만 고쳐질 뿐이라며, 어떻게 나왔는지를 물어야 잘못된 단계를 바꿀 수 있다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 좋은 교사들이 하는, 그런데 나머지 우리는 좀처럼 따라 하지 않는 동작이 하나 있습니다. 학생이 틀린 답을 말했을 때 바로 고쳐 주지 않는 것입니다. 어떻게 그 답에 이르렀는지 묻습니다. 이것은 인내심처럼 보이고, 어느 정도는 그렇지만, 진짜 이유는 더 실용적입니다. 틀린 답은 보이지 않는 사슬의 보이는 끝이고, 그 끝을 고치면 사슬은 그대로 남습니다. 학생은 그 한 문제의 정답을 들고 가고, 똑같이 잘못된 단계는 다음 문제를 기다립니다. 어떻게 거기에 이르렀는지 묻는 것은 그 단계를 드러내 놓고, 그제야 실제로 바꿀 수 있게 합니다. 1분이 들고, 그것이 답을 고치는 일과 방법을 고치는 일의 차이입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Sangwoo, is this the photo of the bike repair corner you set up?"],
        ["M", "Yes, it's been there since the start of the term."],
        ["W", "There's a pegboard of tools on the wall."],
        ["M", "Every tool has its own outline drawn behind it."],
        ["W", "And a floor pump stands beside the bench."],
        ["M", "That one gets used more than anything else."],
        ["W", "I count three bikes leaning against the rack."],
        ["M", "There are four. One is behind the tall one."],
        ["W", "The wooden bench in the middle looks sturdy."],
        ["M", "We built it from the old gym benches."],
        ["W", "And a first aid kit hangs by the door."],
        ["M", "Chains bite, so we keep it within reach."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is behind the tall one.",
      explanation:
        "여자가 자전거가 세 대라고 하자 남자가 네 대라고 바로잡는다. 그림에는 세 대가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A bike repair corner drawn as one wide picture, clean black line art on white, no writing or letters anywhere. " +
          "A PEGBOARD covered with hanging hand tools is fixed on the back wall. " +
          "A tall FLOOR PUMP stands beside a workbench. " +
          "Exactly THREE BICYCLES lean side by side against a rack, clearly countable and separated. " +
          "A sturdy WOODEN WORKBENCH stands in the middle of the picture. " +
          "A FIRST AID KIT with a cross on it hangs on the wall beside a door.",
      },
      translation: [
        "W: 상우야, 이게 네가 만든 자전거 수리 자리 사진이야?",
        "M: 응, 학기 초부터 거기 있었어.",
        "W: 벽에 공구 걸이판이 있네.",
        "M: 공구마다 뒤에 윤곽선을 그려 놨어.",
        "W: 그리고 작업대 옆에 바닥 펌프가 서 있어.",
        "M: 그게 제일 많이 쓰여.",
        "W: 거치대에 자전거가 세 대 기대어 있는 게 보여.",
        "M: 네 대야. 하나는 큰 것 뒤에 있어.",
        "W: 가운데 나무 작업대는 튼튼해 보인다.",
        "M: 옛날 체육관 벤치로 만들었어.",
        "W: 그리고 문 옆에 구급함이 걸려 있네.",
        "M: 체인에 물리니까 손 닿는 데 둬.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Sangwoo, the school newspaper goes to print at six."],
        ["M", "I know. Are all six pages laid out?"],
        ["W", "They are. I finished the last column this morning."],
        ["M", "Good. Did anyone check the photo captions?"],
        ["W", "I read them twice. Two names were spelled wrong and I fixed them."],
        ["M", "Then what's still open?"],
        ["W", "The printer needs the file in a different format than we saved."],
        ["M", "Can't we just send what we have?"],
        ["W", "They'd send it straight back. It has to be converted first."],
        ["M", "Do you know how to convert it?"],
        ["W", "I do, but I'm about to sit the English listening test."],
        ["M", "Then show me quickly and I'll convert it and send it."],
      ],
      choices: [
        "지면 배치하기",
        "파일 변환해 보내기",
        "사진 설명 고치기",
        "영어 시험 보기",
        "인쇄소에 전화하기",
      ],
      answer: 2,
      clue: "Then show me quickly and I'll convert it and send it.",
      explanation:
        "지면과 사진 설명은 끝났고 여자는 시험을 봐야 하므로, 남자가 파일을 변환해 보내기로 한다. 따라서 답은 ②이다.",
      translation: [
        "W: 상우야, 학교 신문이 6시에 인쇄에 들어가.",
        "M: 알아. 여섯 쪽 다 앉혔어?",
        "W: 다 됐어. 오늘 아침에 마지막 칼럼을 끝냈어.",
        "M: 좋아. 사진 설명은 누가 확인했어?",
        "W: 내가 두 번 읽었어. 이름 두 개가 틀려서 고쳤어.",
        "M: 그럼 아직 남은 게 뭐야?",
        "W: 인쇄소에서 우리가 저장한 것과 다른 형식으로 달래.",
        "M: 그냥 있는 대로 보내면 안 돼?",
        "W: 바로 돌려보낼걸. 먼저 변환해야 해.",
        "M: 변환하는 법 알아?",
        "W: 알아. 그런데 이제 영어 듣기 시험을 봐야 해.",
        "M: 그럼 빨리 알려 줘. 내가 변환해서 보낼게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Clearwater Kayak Rental. How can I help you?"],
        ["W", "I'd like three kayaks for the afternoon, please."],
        ["M", "A half-day kayak rental is thirty dollars each."],
        ["W", "So ninety dollars for the three."],
        ["M", "That's right. Would you like a dry bag with each one?"],
        ["W", "How much are the dry bags?"],
        ["M", "Four dollars each, so twelve for three."],
        ["W", "We'll take the dry bags. They're worth it."],
        ["M", "One hundred and two, then. Do you have a club membership?"],
        ["W", "Yes, our school paddling club."],
        ["M", "Then I can take ten percent off the whole amount."],
        ["W", "Perfect. I'll pay by card."],
      ],
      choices: ["$81.00", "$102.00", "$110.00", "$113.00", "$91.80"],
      answer: 5,
      clue: "Then I can take ten percent off the whole amount.",
      explanation:
        "카약 3대 90달러와 방수 가방 3개 12달러를 더하면 102달러이고, 10퍼센트를 빼면 91.80달러이다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 클리어워터 카약 대여점입니다. 무엇을 도와드릴까요?",
        "W: 오후 동안 카약 세 대 빌리고 싶어요.",
        "M: 반나절 카약 대여는 한 대에 30달러입니다.",
        "W: 그럼 세 대에 90달러네요.",
        "M: 맞습니다. 방수 가방도 하나씩 하시겠어요?",
        "W: 방수 가방은 얼마예요?",
        "M: 하나에 4달러라서 세 개면 12달러입니다.",
        "W: 방수 가방도 할게요. 그만한 값은 해요.",
        "M: 그럼 102달러입니다. 동아리 회원이세요?",
        "W: 네, 저희 학교 카약 동아리요.",
        "M: 그럼 전체 금액에서 10퍼센트를 빼 드릴게요.",
        "W: 좋네요. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 과학 동아리 발표를 맡지 않는 이유를 고르시오.",
      lines: [
        ["W", "Sangwoo, you're not presenting at the science club showcase?"],
        ["M", "I passed it to Jiho last week."],
        ["W", "Was your experiment not finished?"],
        ["M", "It's been finished since October."],
        ["W", "Then are you nervous about speaking? You did fine last year."],
        ["M", "Speaking is fine. It's the date."],
        ["W", "What's on that day?"],
        ["M", "My university interview, in the same afternoon slot."],
        ["W", "You can't move the interview?"],
        ["M", "The times are assigned, not chosen. Jiho knows the work well anyway."],
      ],
      choices: [
        "실험을 끝내지 못해서",
        "발표가 긴장돼서",
        "대학 면접과 겹쳐서",
        "다른 동아리로 옮겨서",
        "몸이 아파서",
      ],
      answer: 3,
      clue: "My university interview, in the same afternoon slot.",
      explanation:
        "실험은 10월에 끝냈고 발표도 부담되지 않지만, 같은 시간대에 배정된 대학 면접이 있기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "W: 상우야, 과학 동아리 발표회에서 발표 안 해?",
        "M: 지난주에 지호한테 넘겼어.",
        "W: 실험을 못 끝냈어?",
        "M: 10월에 이미 끝냈어.",
        "W: 그럼 발표가 떨려서? 작년엔 잘했잖아.",
        "M: 말하는 건 괜찮아. 날짜 때문이야.",
        "W: 그날 뭐가 있는데?",
        "M: 대학 면접이. 같은 오후 시간대야.",
        "W: 면접을 옮길 수 없어?",
        "M: 시간이 배정되는 거라 못 골라. 어차피 지호도 내용을 잘 알아.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Spring Pottery Market에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Sangwoo, have you heard about the Spring Pottery Market?"],
        ["M", "I saw the sign at the station. When does it run?"],
        ["W", "Three days, from the tenth to the twelfth of April."],
        ["M", "Where is it held?"],
        ["W", "In the courtyard of the old school building, near the park."],
        ["M", "I know that courtyard. Who sells there?"],
        ["W", "About twenty local potters, and a few from the next province."],
        ["M", "Is there anything to do besides buying?"],
        ["W", "There's a wheel you can try, and a kiln demonstration each afternoon."],
        ["M", "A kiln demonstration sounds good. Is entry free?"],
        ["W", "Free to walk in. The wheel session costs five thousand won."],
        ["M", "Then let's go on the Saturday."],
      ],
      choices: ["주차 안내", "열리는 기간", "열리는 장소", "참여 작가", "체험 활동"],
      answer: 1,
      clue: "주차 안내는 대화에서 언급되지 않았다.",
      explanation:
        "기간(4월 10일부터 12일까지), 장소(옛 학교 건물 안뜰), 참여 작가(지역 도예가 스무 명 남짓), 체험 활동(물레 체험과 가마 시연)은 언급되지만 주차 안내는 언급되지 않았다. 따라서 답은 ①이다.",
      translation: [
        "W: 상우야, 봄 도자기 장터 들어 봤어?",
        "M: 역에서 안내판 봤어. 언제 해?",
        "W: 사흘 동안, 4월 10일부터 12일까지.",
        "M: 어디서 열려?",
        "W: 옛 학교 건물 안뜰에서. 공원 근처야.",
        "M: 그 안뜰 알아. 누가 파는데?",
        "W: 지역 도예가 스무 명쯤, 옆 도에서 오는 분도 몇 분.",
        "M: 사는 것 말고 할 것도 있어?",
        "W: 직접 돌려 볼 수 있는 물레가 있고, 오후마다 가마 시연을 해.",
        "M: 가마 시연 좋다. 입장은 무료야?",
        "W: 들어가는 건 무료. 물레 체험은 5천 원이야.",
        "M: 그럼 토요일에 가자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Northfield Star Camp에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Let me tell you about the Northfield Star Camp. " +
            "It is held for four nights every August on the plateau behind the weather station. " +
            "Participants sleep in tents, and the camp provides the tents and sleeping mats. " +
            "Each group of six shares one telescope, and there are ten groups in total. " +
            "The camp is open to anyone over fourteen, with no experience required. " +
            "Meals are not included, so each group cooks for itself at the shared kitchen. " +
            "Applications open in June and usually fill within a week.",
        ],
      ],
      choices: [
        "8월에 나흘간 열린다",
        "천막과 매트를 제공한다",
        "여섯 명이 망원경 하나를 함께 쓴다",
        "식사가 포함되어 있다",
        "신청은 6월에 시작한다",
      ],
      answer: 4,
      clue: "Meals are not included, so each group cooks for itself at the shared kitchen.",
      explanation:
        "식사가 포함되지 않아 모둠마다 직접 해 먹는다고 했으므로 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "M: 노스필드 별 캠프를 소개해 드리겠습니다. 매년 8월, 기상대 뒤 고원에서 나흘 밤 동안 열립니다. 참가자는 천막에서 자고, 캠프에서 천막과 잠자리 매트를 제공합니다. 여섯 명씩 한 모둠이 망원경 하나를 함께 쓰며, 모둠은 모두 열 개입니다. 열네 살이 넘으면 누구나 올 수 있고 경험은 필요 없습니다. 식사는 포함되지 않아서 모둠마다 공동 주방에서 직접 해 먹습니다. 신청은 6월에 시작하고 보통 일주일 안에 찹니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 구입할 프린터를 고르시오.",
      lines: [
        ["W", "Sangwoo, let's pick a printer for the club room."],
        ["M", "Five models here. Do we need color printing?"],
        ["W", "Yes. The posters have to come out in color."],
        ["M", "Agreed. Should it print on both sides by itself?"],
        ["W", "Definitely. We waste half our paper flipping pages."],
        ["M", "Then the single-sided ones are out."],
        ["W", "And the budget? The club fund left us two hundred thousand won."],
        ["M", "So two hundred thousand is the ceiling."],
        ["W", "Then only one model clears all three."],
        ["M", "Let's order before the fund closes on Friday."],
        ["W", "I'll place it tonight and forward the receipt."],
        ["M", "Thanks. I'll clear a space on the side table."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "Yes. The posters have to come out in color.",
      explanation:
        "컬러 인쇄가 되고, 양면 인쇄가 자동이며, 20만 원 이하인 것을 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Color: No / Double-sided: Yes / Price: 110,000 won" },
          { no: 2, label: "②", value: "Color: Yes / Double-sided: Yes / Price: 175,000 won" },
          { no: 3, label: "③", value: "Color: Yes / Double-sided: No / Price: 130,000 won" },
          { no: 4, label: "④", value: "Color: Yes / Double-sided: Yes / Price: 260,000 won" },
          { no: 5, label: "⑤", value: "Color: No / Double-sided: No / Price: 80,000 won" },
        ],
      },
      translation: [
        "W: 상우야, 동아리방에 둘 인쇄기 고르자.",
        "M: 다섯 종류 있네. 컬러 인쇄 필요해?",
        "W: 응. 포스터는 컬러로 나와야 해.",
        "M: 동의해. 양면 인쇄가 자동으로 돼야 할까?",
        "W: 당연하지. 종이 뒤집느라 절반을 버리잖아.",
        "M: 그럼 단면짜리는 빠지네.",
        "W: 예산은? 동아리비에서 20만 원 남았어.",
        "M: 그럼 20만 원이 한계네.",
        "W: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "M: 금요일에 동아리비 마감이니까 그전에 주문하자.",
        "W: 오늘 밤에 주문하고 영수증 보낼게.",
        "M: 고마워. 나는 옆 탁자에 자리 치워 둘게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Dohee, is the art room open after school this week?"],
        ["W", "Only on Tuesday and Thursday, because of the exams."],
        ["M", "I need it tomorrow, and tomorrow is Wednesday."],
        ["W", "Ask Ms. Ko. She opens it on request if you go before lunch."],
      ],
      choices: [
        "The art room closed last term.",
        "I don't need the art room.",
        "Tomorrow is Thursday.",
        "I'll wait until next month.",
        "I'll ask her before lunch tomorrow.",
      ],
      answer: 5,
      clue: "Ask Ms. Ko. She opens it on request if you go before lunch.",
      explanation:
        "여자가 점심 전에 고 선생님께 부탁하라고 했으므로, 내일 점심 전에 여쭤보겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 도희야, 이번 주에 미술실 방과 후에 열어?",
        "W: 시험 때문에 화요일이랑 목요일만.",
        "M: 나는 내일 써야 하는데, 내일이 수요일이야.",
        "W: 고 선생님께 여쭤봐. 점심 전에 가면 부탁해서 열어 주셔.",
        "M: 내일 점심 전에 여쭤볼게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Sangwoo, my bus card stopped working at the gate this morning."],
        ["M", "Did you check the balance?"],
        ["W", "It has twelve thousand won left, so that's not it."],
        ["M", "Then the chip is probably worn. Swap it at any convenience store."],
      ],
      choices: [
        "My card has no balance left.",
        "I never use a bus card.",
        "I'll swap it on the way home.",
        "The gate was working fine.",
        "I'll charge it again tonight.",
      ],
      answer: 3,
      clue: "Then the chip is probably worn. Swap it at any convenience store.",
      explanation:
        "남자가 편의점에서 카드를 바꾸라고 했으므로, 집에 가는 길에 바꾸겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 상우야, 오늘 아침에 개찰구에서 교통 카드가 안 됐어.",
        "M: 잔액은 확인했어?",
        "W: 1만 2천 원 남아 있어. 그건 아니야.",
        "M: 그럼 칩이 닳았을 거야. 아무 편의점에서나 바꿔.",
        "W: 집에 가는 길에 바꿀게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Sangwoo, you've been turning in every assignment at the last minute."],
        ["M", "They're all finished on time, though."],
        ["W", "Finished at eleven fifty-nine, with no room for anything going wrong."],
        ["M", "Nothing has gone wrong yet."],
        ["W", "Last month the upload site was down for an hour."],
        ["M", "That was luck. I'd already sent it."],
        ["W", "So you know what the risk is."],
        ["M", "I do. I just can't start any earlier."],
        ["W", "Can't start, or don't have a reason to?"],
        ["M", "Probably the second one."],
        ["W", "Then set your own deadline a day early and treat it as the real one."],
      ],
      choices: [
        "I'll move my deadline a day forward.",
        "I'll keep submitting at midnight.",
        "The site never goes down.",
        "I've never missed a deadline.",
        "I'll ask for extensions instead.",
      ],
      answer: 1,
      clue: "Then set your own deadline a day early and treat it as the real one.",
      explanation:
        "여자가 하루 앞당긴 마감을 스스로 정하고 그것을 진짜 마감으로 여기라고 했으므로, 마감을 하루 앞당기겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 상우야, 너 과제를 매번 마지막 순간에 내더라.",
        "M: 그래도 제시간에 다 끝내잖아.",
        "W: 11시 59분에 끝내지. 뭔가 잘못될 여유가 하나도 없이.",
        "M: 아직 잘못된 적은 없어.",
        "W: 지난달에 제출 사이트가 한 시간 멈췄어.",
        "M: 그건 운이 좋았지. 나는 이미 보냈으니까.",
        "W: 그럼 위험이 뭔지는 아는 거네.",
        "M: 알아. 그냥 더 일찍 시작을 못 하겠어.",
        "W: 못 하는 거야, 아니면 그럴 이유가 없는 거야?",
        "M: 아마 두 번째겠지.",
        "W: 그럼 하루 앞당긴 마감을 네가 정하고 그걸 진짜 마감으로 여겨.",
        "M: 마감을 하루 앞당길게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Dohee, you've been answering for Yuna in every group meeting."],
        ["W", "She takes so long to get the sentence out."],
        ["M", "And you finish it for her to save time."],
        ["W", "I thought I was helping. She never seems annoyed."],
        ["M", "Has she said anything at all in the last two meetings?"],
        ["W", "Now that you ask, almost nothing."],
        ["M", "She stopped starting sentences, because they weren't hers to finish."],
        ["W", "That's not what I wanted at all."],
        ["M", "I know. It rarely is."],
        ["W", "So what do I do, just sit there through the pauses?"],
        ["M", "Yes. Count to five before you say anything after she starts."],
      ],
      choices: [
        "I'll answer for her again tomorrow.",
        "Yuna never speaks at all.",
        "I'll ask her to leave the group.",
        "I'll wait five seconds next time.",
        "The pauses don't bother me.",
      ],
      answer: 4,
      clue: "Yes. Count to five before you say anything after she starts.",
      explanation:
        "남자가 유나가 말을 시작하면 다섯을 세고 나서 말하라고 했으므로, 다음엔 5초 기다리겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 도희야, 너 모둠 회의마다 유나 대신 답하더라.",
        "W: 문장을 꺼내는 데 너무 오래 걸려서.",
        "M: 그래서 시간을 아끼려고 네가 대신 끝내 주는구나.",
        "W: 돕는 거라고 생각했어. 싫어하는 것 같지도 않고.",
        "M: 지난 두 번 회의에서 유나가 뭐라도 말한 적 있어?",
        "W: 듣고 보니 거의 없었어.",
        "M: 문장을 시작하기를 그만둔 거야. 끝내는 게 자기 몫이 아니니까.",
        "W: 내가 바란 건 전혀 그게 아니야.",
        "M: 알아. 대개 그렇지.",
        "W: 그럼 어떻게 해, 그 멈춤을 그냥 앉아서 견뎌?",
        "M: 응. 유나가 말을 시작하면 다섯을 세고 나서 말해.",
        "W: 다음엔 5초 기다릴게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Nari가 Jungwoo에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Nari : ________________",
      lines: [
        [
          "M",
          "Nari and Jungwoo are organizing the school's used uniform exchange, which opens on Monday. " +
            "Jungwoo has sorted every donated uniform by school year, " +
            "which took him two full afternoons and is neatly done. " +
            "Nari notices that within each year the items are not sorted by size, " +
            "so a student looking for a medium shirt has to go through forty hangers. " +
            "The exchange runs for only one lunch hour, " +
            "and last year students gave up and left when the queue stopped moving. " +
            "There are two days left and the hangers can be regrouped in an hour. " +
            "She does not want him to think his sorting was wasted, " +
            "since sorting by size on top of year is what makes the racks usable. " +
            "She wants to tell him to sort each year's rack by size as well. " +
            "In this situation, what would Nari most likely say to Jungwoo?",
        ],
      ],
      choices: [
        "We should cancel the exchange this year.",
        "Let's sort each year's rack by size too.",
        "Let's collect more uniforms this weekend.",
        "We should run it for a whole day instead.",
        "Let's put every uniform in one big pile.",
      ],
      answer: 2,
      clue: "She wants to tell him to sort each year's rack by size as well.",
      explanation:
        "나리는 학년별로 나눈 옷걸이를 크기별로도 나누자고 말하려 하므로 ②가 가장 적절하다.",
      translation: [
        "M: 나리와 정우는 월요일에 여는 교복 물려주기 행사를 준비하고 있습니다. 정우는 기증받은 교복을 학년별로 모두 나눠 두었고, 오후 이틀을 꼬박 써서 깔끔하게 해냈습니다. 나리는 학년 안에서는 크기별로 나뉘어 있지 않아서, 중간 크기 셔츠를 찾는 학생이 옷걸이 마흔 개를 다 뒤져야 한다는 것을 알아챕니다. 행사는 점심시간 한 번뿐이고, 작년에는 줄이 멈추자 학생들이 포기하고 돌아갔습니다. 이틀이 남았고 옷걸이는 한 시간이면 다시 묶을 수 있습니다. 나리는 정우의 정리가 헛되었다고 여기게 하고 싶지 않습니다. 학년에 더해 크기까지 나누어야 옷걸이가 쓸모 있어지기 때문입니다. 나리는 학년별 옷걸이를 크기별로도 나누자고 말하고 싶습니다. 이런 상황에서 나리가 정우에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about why bread rises. " +
            "Most people say it is the yeast, which is true but not the whole story. " +
            "Yeast eats the sugars in flour and gives off carbon dioxide, " +
            "the same gas that makes fizzy drinks fizz. " +
            "But gas alone would simply escape into the air. " +
            "What holds it is gluten, a network of proteins that forms when flour meets water " +
            "and gets stretched by kneading. " +
            "Think of it as thousands of tiny elastic balloons. " +
            "The yeast fills them and the gluten keeps them from bursting. " +
            "This is why bread made without kneading is dense, " +
            "and why cake, which has almost no gluten, " +
            "relies on beaten eggs to trap air instead. " +
            "Rising is never one ingredient. It is a gas and something strong enough to hold it.",
        ],
      ],
      choices: [
        "why yeast is used in fizzy drinks",
        "how flour is milled from wheat",
        "why cakes taste sweeter than bread",
        "how kneading changes the flavor of bread",
        "how gas and gluten together make bread rise",
      ],
      answer: 5,
      clue: "Rising is never one ingredient. It is a gas and something strong enough to hold it.",
      explanation:
        "여자는 효모가 내는 기체와 그것을 붙잡는 글루텐이 함께 있어야 빵이 부푼다고 설명한다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 빵이 왜 부푸는지 이야기하려 합니다. 대부분은 효모 때문이라고 말하는데, 맞지만 이야기의 전부는 아닙니다. 효모는 밀가루의 당을 먹고 이산화탄소를 내놓습니다. 탄산음료를 톡 쏘게 하는 바로 그 기체지요. 그런데 기체만 있으면 그냥 공기 중으로 달아납니다. 그것을 붙잡는 것이 글루텐입니다. 밀가루가 물을 만나고 반죽으로 늘어날 때 생기는 단백질 그물이지요. 수천 개의 작은 고무풍선이라고 생각해 보세요. 효모가 그것을 채우고 글루텐이 터지지 않게 붙잡습니다. 그래서 반죽하지 않고 만든 빵은 촘촘하고, 글루텐이 거의 없는 케이크는 대신 거품 낸 달걀로 공기를 가둡니다. 부푸는 일은 결코 한 가지 재료가 아닙니다. 기체와, 그것을 붙잡을 만큼 튼튼한 무언가입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Hello, everyone. Today I want to talk about why bread rises."],
        ["W", "Yeast eats the sugars in flour and gives off carbon dioxide, the same gas that makes fizzy drinks fizz."],
        ["W", "But gas alone would simply escape into the air."],
        ["W", "What holds it is gluten, a network of proteins that forms when flour meets water and gets stretched by kneading."],
        ["W", "This is why bread made without kneading is dense."],
        ["W", "and why cake, which has almost no gluten, relies on beaten eggs to trap air instead."],
      ],
      choices: [
        "yeast giving off carbon dioxide",
        "gluten forming when flour meets water",
        "salt slowing down the yeast",
        "bread without kneading being dense",
        "cake using beaten eggs to trap air",
      ],
      answer: 3,
      clue: "Yeast eats the sugars in flour and gives off carbon dioxide, the same gas that makes fizzy drinks fizz.",
      explanation:
        "효모가 이산화탄소를 내놓는 것, 글루텐이 물과 만나 생기는 것, 반죽하지 않은 빵이 촘촘한 것, 케이크가 거품 낸 달걀을 쓰는 것은 언급되지만 소금이 효모를 늦춘다는 것은 언급되지 않았다. 따라서 답은 ③이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
