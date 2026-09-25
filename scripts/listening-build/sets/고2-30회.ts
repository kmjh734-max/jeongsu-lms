/** 고2 듣기 30회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 30회",
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
          "Good evening, everyone. This is Woojin Seol from the student council. " +
            "I want to talk about the club room booking sheet in the corridor. " +
            "It works well, and almost every slot gets used. " +
            "The problem is that names are written in pencil and rubbed out by whoever comes next. " +
            "Three clubs lost their time last month that way, " +
            "and nobody could prove who had booked first. " +
            "So from Monday the sheet will be replaced by a board with a pen on a string. " +
            "Write in pen, and if your plan changes, draw one line through your name " +
            "so the next person can still see it was booked. " +
            "The rule is the same. Only the pencil goes. Thank you.",
        ],
      ],
      choices: [
        "동아리방 배정을 다시 한다고 알리려고",
        "예약 시간을 줄인다고 알리려고",
        "동아리 등록을 받으려고",
        "복도 공사를 안내하려고",
        "예약표를 연필 대신 펜으로 쓰라고 알리려고",
      ],
      answer: 5,
      clue: "So from Monday the sheet will be replaced by a board with a pen on a string.",
      explanation:
        "남자는 연필로 쓴 이름이 지워져 문제가 생긴다며 월요일부터 펜으로 쓰는 판으로 바꾼다고 알린다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 여러분, 안녕하세요. 학생회 설우진입니다. 복도에 있는 동아리방 예약표 이야기를 하려고 합니다. 잘 굴러가고 있고 거의 모든 시간이 쓰입니다. 문제는 이름을 연필로 쓰다 보니 다음에 오는 사람이 지워 버린다는 것입니다. 지난달에 그렇게 세 동아리가 시간을 잃었고, 누가 먼저 예약했는지 아무도 증명하지 못했습니다. 그래서 월요일부터 예약표를 끈 달린 펜이 있는 판으로 바꿉니다. 펜으로 쓰시고, 계획이 바뀌면 이름 위에 줄 하나만 그어 주세요. 그래야 다음 사람이 예약이 있었다는 걸 볼 수 있습니다. 규칙은 그대로입니다. 연필만 사라집니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Minseo, I've been studying with the television on in the background."],
        ["W", "On, but not watched?"],
        ["M", "Exactly. It just stops the room from being silent."],
        ["W", "How often do you look up at it?"],
        ["M", "Whenever something loud happens. Maybe twice a minute."],
        ["W", "So it isn't background. It's a thing you keep checking."],
        ["M", "But silence makes me uneasy."],
        ["W", "Then use sound that has nothing to look at."],
        ["M", "Like what, music?"],
        ["W", "Rain, or a fan. Something your eyes have no reason to follow."],
        ["M", "So the problem is the picture, not the noise."],
        ["W", "The picture. Sound alone never pulled anyone's eyes away from a page."],
      ],
      choices: [
        "공부는 완전히 조용한 곳에서 해야 한다",
        "음악은 집중에 도움이 된다",
        "공부할 때 소리보다 화면이 방해가 된다",
        "텔레비전은 보지 말아야 한다",
        "휴식 시간을 정해 두어야 한다",
      ],
      answer: 3,
      clue: "The picture. Sound alone never pulled anyone's eyes away from a page.",
      explanation:
        "여자는 소리만으로는 눈이 책에서 떨어지지 않는다며, 문제는 소음이 아니라 화면이라고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 민서야, 나 텔레비전을 틀어 놓고 공부해.",
        "W: 켜 놓고 보지는 않는 거야?",
        "M: 그렇지. 방이 조용하지 않게만 해 두는 거야.",
        "W: 얼마나 자주 올려다봐?",
        "M: 큰 소리가 날 때마다. 1분에 두 번쯤?",
        "W: 그럼 배경이 아니네. 네가 계속 확인하는 무언가지.",
        "M: 그런데 조용하면 불안해.",
        "W: 그럼 볼 게 없는 소리를 써.",
        "M: 어떤 거, 음악?",
        "W: 빗소리나 선풍기 소리. 눈이 따라갈 이유가 없는 것.",
        "M: 그럼 문제는 소리가 아니라 화면이구나.",
        "W: 화면이지. 소리만으로 책에서 눈을 떼게 한 적은 없어.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "When someone makes a decision we disagree with, " +
            "we usually explain it by what they wanted. " +
            "They were being lazy, or careless, or trying to look good. " +
            "Almost always there is a duller explanation available, " +
            "and almost always it is the right one. " +
            "They did not have the information we have. " +
            "They were working to a deadline we did not see. " +
            "The option that looks obvious to us was not on the list they were given. " +
            "Reaching for motive feels like insight, " +
            "but it closes the only door that leads anywhere useful. " +
            "Ask what they knew and what they were allowed to choose from, " +
            "and most puzzling decisions stop being puzzling.",
        ],
      ],
      choices: [
        "이해 안 되는 결정은 동기보다 상황을 물어야 한다",
        "결정은 빨리 내려야 한다",
        "사람의 성격은 잘 바뀌지 않는다",
        "정보는 공유해야 한다",
        "마감을 지키는 것이 중요하다",
      ],
      answer: 1,
      clue: "Ask what they knew and what they were allowed to choose from, and most puzzling decisions stop being puzzling.",
      explanation:
        "남자는 동기를 찾는 것이 통찰처럼 느껴지지만 쓸모 있는 문을 닫는다며, 무엇을 알았고 무엇 중에서 골랐는지 물으라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 누군가 우리가 동의하지 않는 결정을 내리면, 우리는 보통 그 사람이 무엇을 원했는가로 설명합니다. 게을렀다, 부주의했다, 잘 보이려 했다. 거의 언제나 더 밋밋한 설명이 있고, 거의 언제나 그것이 맞습니다. 그 사람에게는 우리가 가진 정보가 없었습니다. 우리가 보지 못한 마감에 맞춰 일하고 있었습니다. 우리에게 당연해 보이는 선택지가 그 사람이 받은 목록에는 없었습니다. 동기를 집어 드는 것은 통찰처럼 느껴지지만, 쓸모 있는 곳으로 이어지는 유일한 문을 닫아 버립니다. 그 사람이 무엇을 알았고 무엇 중에서 고를 수 있었는지 물어보세요. 그러면 알 수 없던 결정 대부분이 알 수 없는 일이기를 그칩니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Woojin, is this the corner you set up for the radio club?"],
        ["M", "Yes, we finished it over the holiday."],
        ["W", "There's a boom arm clamped to the left of the desk."],
        ["M", "It swings away when we're not recording."],
        ["W", "And a foam panel covers the wall behind it."],
        ["M", "That's what keeps the echo out."],
        ["W", "I count three headphone hooks under the shelf."],
        ["M", "There are four. One is behind the monitor."],
        ["W", "The tall stool by the desk looks comfortable."],
        ["M", "It's the only one that goes high enough."],
        ["W", "And a wall clock hangs above the door."],
        ["M", "We time every segment to the second."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are four. One is behind the monitor.",
      explanation:
        "여자가 헤드폰 고리가 세 개라고 하자 남자가 네 개라고 바로잡는다. 그림에는 세 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A radio studio corner drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A MICROPHONE ON A BOOM ARM is clamped to the left edge of a desk. " +
          "A PANEL OF FOAM SQUARES covers the wall behind the desk. " +
          "EXACTLY THREE HEADPHONE HOOKS with headphones hanging on them are fixed under a shelf, spaced well apart so all three are easy to count and none overlap. " +
          "A TALL STOOL stands beside the desk. " +
          "A ROUND WALL CLOCK hangs on the wall above a closed door.",
      },
      translation: [
        "W: 우진아, 이게 방송 동아리로 꾸민 구석이야?",
        "M: 응, 연휴 동안 다 끝냈어.",
        "W: 책상 왼쪽에 붐 암이 물려 있네.",
        "M: 녹음 안 할 땐 옆으로 젖혀 둬.",
        "W: 그리고 그 뒤 벽을 방음재가 덮고 있어.",
        "M: 그게 울림을 막아 줘.",
        "W: 선반 밑에 헤드폰 고리가 세 개 보여.",
        "M: 네 개야. 하나는 모니터 뒤에 있어.",
        "W: 책상 옆 높은 의자가 편해 보인다.",
        "M: 충분히 높이 올라가는 건 그것뿐이야.",
        "W: 그리고 문 위에 벽시계가 걸려 있어.",
        "M: 코너마다 초 단위로 재.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Minseo, the club showcase starts at four in the small hall."],
        ["W", "I know. Are the display boards up?"],
        ["M", "All six, along the back wall. I did them at lunch."],
        ["W", "Good. And the programme sheets?"],
        ["M", "Printed and folded, in the box by the door."],
        ["W", "Then what's still open?"],
        ["M", "Nobody has collected the microphone from the drama club."],
        ["W", "Do we need theirs? Ours broke last week."],
        ["M", "Ours did, and they said we could borrow one until five."],
        ["W", "Who's in their room now?"],
        ["M", "Their president, but I have to test the projector before four."],
        ["W", "Then I'll go and borrow the microphone."],
      ],
      choices: [
        "게시판 설치하기",
        "마이크 빌려 오기",
        "안내지 접기",
        "프로젝터 점검하기",
        "소강당 청소하기",
      ],
      answer: 2,
      clue: "Then I'll go and borrow the microphone.",
      explanation:
        "게시판과 안내지는 끝났고 남자는 프로젝터를 점검해야 하므로, 여자가 연극 동아리에서 마이크를 빌려 오기로 한다. 따라서 답은 ②이다.",
      translation: [
        "M: 민서야, 동아리 발표회가 4시에 소강당에서 시작해.",
        "W: 알아. 게시판은 세웠어?",
        "M: 여섯 개 다, 뒷벽을 따라. 점심때 했어.",
        "W: 좋아. 안내지는?",
        "M: 인쇄해서 접었어. 문 옆 상자에 있어.",
        "W: 그럼 아직 남은 게 뭐야?",
        "M: 연극 동아리에서 마이크를 아무도 안 가져왔어.",
        "W: 그쪽 걸 써야 해? 우리 건 지난주에 고장 났잖아.",
        "M: 고장 났지. 5시까지 하나 빌려준다고 했어.",
        "W: 지금 그 방에 누가 있어?",
        "M: 회장이. 그런데 나는 4시 전에 프로젝터를 시험해야 해.",
        "W: 그럼 내가 가서 마이크 빌려 올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to Hollow Lane Music. What can I get you?"],
        ["M", "Three ukuleles and four sets of strings, please."],
        ["W", "Ukuleles are fifty dollars each and string sets are eight."],
        ["M", "So one hundred and fifty plus thirty-two."],
        ["W", "One hundred and eighty-two in total. Would you like soft cases?"],
        ["M", "How much are the cases?"],
        ["W", "Twelve dollars each, and you'd want three."],
        ["M", "We'll skip the cases. They stay in the club room."],
        ["W", "No problem. Are you with a school club?"],
        ["M", "We are. Here's the card."],
        ["W", "Then I can take twenty percent off the ukuleles, but not the strings."],
        ["M", "Thank you. I'll pay by card."],
      ],
      choices: ["$120.00", "$145.60", "$182.00", "$218.00", "$152.00"],
      answer: 5,
      clue: "Then I can take twenty percent off the ukuleles, but not the strings.",
      explanation:
        "우쿨렐레 3대 150달러에서 20퍼센트를 빼면 120달러이고, 할인이 안 되는 줄 4세트 32달러를 더하면 152달러이다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 할로레인 악기점입니다. 무엇을 드릴까요?",
        "M: 우쿨렐레 세 대랑 줄 네 세트 주세요.",
        "W: 우쿨렐레는 한 대에 50달러, 줄 세트는 8달러입니다.",
        "M: 그럼 150달러에 32달러네요.",
        "W: 모두 182달러입니다. 부드러운 가방도 하시겠어요?",
        "M: 가방은 얼마예요?",
        "W: 하나에 12달러인데, 세 개는 필요하실 거예요.",
        "M: 가방은 뺄게요. 동아리방에 두고 써요.",
        "W: 괜찮습니다. 학교 동아리세요?",
        "M: 네. 여기 카드요.",
        "W: 그럼 우쿨렐레에서 20퍼센트를 빼 드립니다. 줄은 안 돼요.",
        "M: 감사합니다. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 토론 대회에 나가지 않는 이유를 고르시오.",
      lines: [
        ["M", "Minseo, your name isn't on the debate team list."],
        ["W", "I withdrew at the end of last week."],
        ["M", "Did you not get through the tryout?"],
        ["W", "I came second out of fourteen."],
        ["M", "Then is it the travel? The finals are in another city."],
        ["W", "Travel is fine. My mother would drive me."],
        ["M", "So what happened?"],
        ["W", "The finals are the same day as my college interview."],
        ["M", "Can the interview be moved?"],
        ["W", "No. The times are assigned by the university, not chosen."],
      ],
      choices: [
        "선발에서 떨어져서",
        "이동이 어려워서",
        "대학 면접과 겹쳐서",
        "몸이 아파서",
        "다른 팀으로 옮겨서",
      ],
      answer: 3,
      clue: "The finals are the same day as my college interview.",
      explanation:
        "선발도 통과했고 이동도 문제가 아니지만, 결승 날이 대학 면접과 같고 면접 시간은 고를 수 없기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "M: 민서야, 토론 팀 명단에 네 이름이 없네.",
        "W: 지난주 말에 빠졌어.",
        "M: 선발에서 떨어졌어?",
        "W: 열네 명 중에 2등이었어.",
        "M: 그럼 이동 때문이야? 결승이 다른 도시잖아.",
        "W: 이동은 괜찮아. 엄마가 태워다 주셔.",
        "M: 그럼 무슨 일인데?",
        "W: 결승 날이 대학 면접이랑 같은 날이야.",
        "M: 면접을 옮길 수 없어?",
        "W: 못 해. 시간은 대학이 배정하는 거라 고를 수 없어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Fernbrook Craft Fair에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Minseo, have you heard about the Fernbrook Craft Fair?"],
        ["W", "I saw the flyer. When is it?"],
        ["M", "Two days, the seventh and eighth of December."],
        ["W", "A weekend. Where is it held?"],
        ["M", "In the old station building, the one they restored."],
        ["W", "I've never been inside. What's there?"],
        ["M", "About fifty makers, mostly wood, ceramics and knitting."],
        ["W", "Is there anything to do, or just to buy?"],
        ["M", "Three workshops a day, and you can join one for free."],
        ["W", "That's good. Is there an entrance fee?"],
        ["M", "Three thousand won, and children get in free."],
        ["W", "Then let's go on the Sunday."],
      ],
      choices: ["주차 안내", "열리는 날", "열리는 장소", "참여 작가", "체험 활동"],
      answer: 1,
      clue: "주차 안내는 대화에서 언급되지 않았다.",
      explanation:
        "날짜(12월 7·8일), 장소(복원한 옛 역사), 참여 작가(목공·도예·뜨개 오십 명쯤), 체험 활동(하루 세 번 워크숍)은 언급되지만 주차 안내는 언급되지 않았다. 따라서 답은 ①이다.",
      translation: [
        "M: 민서야, 펀브룩 공예 장터 들어 봤어?",
        "W: 전단 봤어. 언제야?",
        "M: 이틀 동안, 12월 7일이랑 8일.",
        "W: 주말이구나. 어디서 열려?",
        "M: 옛 역사 건물에서. 복원한 그 건물.",
        "W: 안에는 들어가 본 적 없어. 뭐가 있는데?",
        "M: 만드는 분들이 쉰 명쯤. 주로 목공, 도예, 뜨개.",
        "W: 사는 것 말고 할 것도 있어?",
        "M: 하루에 워크숍이 세 번 있고, 하나는 무료로 참여할 수 있어.",
        "W: 좋네. 입장료는 있어?",
        "M: 3천 원. 어린이는 무료야.",
        "W: 그럼 일요일에 가자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Westbury Town Library에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Westbury Town Library. " +
            "It moved into the old bank building in 2014 and holds about ninety thousand books. " +
            "The library opens at nine on weekdays and at ten on Saturdays, closing at seven. " +
            "It is closed all day on Sunday. " +
            "Anyone living or studying in the town may join, and membership costs nothing. " +
            "Members may borrow up to ten items for three weeks at a time. " +
            "The study rooms on the second floor must be booked, but the reading hall is open to all.",
        ],
      ],
      choices: [
        "2014년에 옛 은행 건물로 옮겼다",
        "토요일에는 10시에 연다",
        "일요일에는 문을 닫는다",
        "가입할 때 돈을 내야 한다",
        "한 번에 열 권까지 빌릴 수 있다",
      ],
      answer: 4,
      clue: "Anyone living or studying in the town may join, and membership costs nothing.",
      explanation:
        "가입은 무료라고 했으므로 돈을 내야 한다는 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "W: 웨스트버리 시립 도서관을 소개해 드리겠습니다. 2014년에 옛 은행 건물로 옮겼고 책을 구만 권쯤 갖고 있습니다. 평일에는 9시에, 토요일에는 10시에 열고 7시에 닫습니다. 일요일에는 하루 종일 닫습니다. 이 도시에 살거나 공부하는 사람은 누구나 가입할 수 있고 가입비는 없습니다. 회원은 한 번에 열 권까지 3주 동안 빌릴 수 있습니다. 2층 스터디룸은 예약해야 하지만 열람실은 누구나 쓸 수 있습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 구입할 탁상 스탠드를 고르시오.",
      lines: [
        ["M", "Minseo, let's buy a desk lamp for the study room."],
        ["W", "Five models here. Should the brightness be adjustable?"],
        ["M", "Yes. Everyone wants it different."],
        ["W", "Agreed. Do we need a clamp rather than a base?"],
        ["M", "A clamp. The desks are already full of books."],
        ["W", "Right. And the price? The fund left us forty thousand won."],
        ["M", "So forty thousand is the ceiling."],
        ["W", "Then only one model clears all three."],
        ["M", "Let's order before the fund closes on Friday."],
        ["W", "I'll place it tonight and send the receipt."],
        ["M", "Thanks. I'll clear the edge of the desk."],
        ["W", "It should arrive by Thursday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "A clamp. The desks are already full of books.",
      explanation:
        "밝기 조절이 되고, 집게식이며, 4만 원 이하인 것을 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Brightness: Fixed / Mount: Clamp / Price: 22,000 won" },
          { no: 2, label: "②", value: "Brightness: Adjustable / Mount: Clamp / Price: 36,000 won" },
          { no: 3, label: "③", value: "Brightness: Adjustable / Mount: Base / Price: 28,000 won" },
          { no: 4, label: "④", value: "Brightness: Adjustable / Mount: Clamp / Price: 65,000 won" },
          { no: 5, label: "⑤", value: "Brightness: Fixed / Mount: Base / Price: 14,000 won" },
        ],
      },
      translation: [
        "M: 민서야, 자습실에 둘 탁상 스탠드 사자.",
        "W: 다섯 종류 있네. 밝기 조절이 돼야 할까?",
        "M: 응. 다들 원하는 밝기가 달라.",
        "W: 동의해. 받침 말고 집게식이어야 해?",
        "M: 집게식. 책상은 이미 책으로 가득해.",
        "W: 맞아. 값은? 예산에서 4만 원 남았어.",
        "M: 그럼 4만 원이 한계네.",
        "W: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "M: 금요일에 예산 마감이니까 그전에 주문하자.",
        "W: 오늘 밤에 주문하고 영수증 보낼게.",
        "M: 고마워. 나는 책상 가장자리를 치워 둘게.",
        "W: 목요일까지는 올 거야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Woojin, is the computer room open after school today?"],
        ["M", "It is, but the printer is out of toner."],
        ["W", "I only need to print two pages."],
        ["M", "Then use the library printer. It's working and it's free today."],
      ],
      choices: [
        "The computer room is closed.",
        "I don't need to print anything.",
        "The printer has plenty of toner.",
        "I'll print it at home tonight.",
        "I'll use the library printer.",
      ],
      answer: 5,
      clue: "Then use the library printer. It's working and it's free today.",
      explanation:
        "남자가 도서관 인쇄기를 쓰라고 했으므로, 그 인쇄기를 쓰겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "W: 우진아, 오늘 방과 후에 컴퓨터실 열어?",
        "M: 열어. 그런데 인쇄기에 토너가 없어.",
        "W: 나는 두 쪽만 뽑으면 돼.",
        "M: 그럼 도서관 인쇄기를 써. 되고 오늘은 무료야.",
        "W: 도서관 인쇄기 쓸게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Minseo, my club application hasn't been approved yet."],
        ["W", "How long ago did you send it?"],
        ["M", "Nine days. Everyone else heard back in two."],
        ["W", "Then it's stuck. Message the club president directly today."],
      ],
      choices: [
        "My application was approved.",
        "There is no club president.",
        "I'll message the president today.",
        "Nine days is normal.",
        "I'll apply to a different club.",
      ],
      answer: 3,
      clue: "Then it's stuck. Message the club president directly today.",
      explanation:
        "여자가 오늘 회장에게 직접 연락하라고 했으므로, 오늘 연락하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 민서야, 내 동아리 신청이 아직 승인이 안 됐어.",
        "W: 보낸 지 얼마나 됐어?",
        "M: 9일. 다른 애들은 이틀 만에 답 받았어.",
        "W: 그럼 어디 걸린 거야. 오늘 회장한테 직접 연락해.",
        "M: 오늘 회장한테 연락할게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Minseo, you've been sitting at the back of the classroom all term."],
        ["W", "I can see the board fine from there."],
        ["M", "Can you hear the questions other people ask?"],
        ["W", "Not always. I catch the teacher's answer and guess the question."],
        ["M", "So you're reconstructing half of every lesson."],
        ["W", "I hadn't thought of it as a loss."],
        ["M", "It costs you the part where someone else was confused."],
        ["W", "Which is usually where I'm confused too."],
        ["M", "Exactly. The back row hides that from you."],
        ["W", "But the front feels exposed."],
        ["M", "Take a middle seat tomorrow and see what you hear."],
      ],
      choices: [
        "I'll sit in the middle tomorrow.",
        "I'll stay at the back this term.",
        "I hear every question clearly.",
        "The front row is my favourite.",
        "I'll stop attending that class.",
      ],
      answer: 1,
      clue: "Take a middle seat tomorrow and see what you hear.",
      explanation:
        "남자가 내일 가운데 자리에 앉아 보라고 했으므로, 내일 가운데에 앉겠다는 ①이 가장 자연스럽다.",
      translation: [
        "M: 민서야, 너 한 학기 내내 교실 맨 뒤에 앉더라.",
        "W: 거기서도 칠판은 잘 보여.",
        "M: 다른 사람들이 하는 질문은 들려?",
        "W: 늘은 아니야. 선생님 답을 듣고 질문을 짐작해.",
        "M: 그럼 수업의 절반을 되짚어 만들고 있는 거네.",
        "W: 잃는 거라고 생각해 본 적은 없어.",
        "M: 다른 사람이 막혔던 그 부분을 잃는 거야.",
        "W: 보통 나도 막히는 데지.",
        "M: 그렇지. 맨 뒷줄이 그걸 가려 버려.",
        "W: 그런데 앞은 드러나는 기분이야.",
        "M: 내일 가운데 자리에 앉아 보고 뭐가 들리는지 봐.",
        "W: 내일 가운데에 앉을게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Woojin, you've been handing in every assignment on the last night."],
        ["M", "They're all finished on time, though."],
        ["W", "Finished, but never read back."],
        ["M", "There's no time for that at midnight."],
        ["W", "And the marks?"],
        ["M", "The comments are always about small things. Wrong word, missing line."],
        ["W", "Every one of those would be caught in a five-minute reread."],
        ["M", "Which I never have at midnight."],
        ["W", "So the last night is costing you the easy marks."],
        ["M", "Then when would the reread happen?"],
        ["W", "Finish the night before and read it over in the morning."],
      ],
      choices: [
        "I'll keep working until midnight.",
        "My work has no small mistakes.",
        "I reread everything twice already.",
        "I'll finish a night early and reread it.",
        "I'll hand it in late instead.",
      ],
      answer: 4,
      clue: "Finish the night before and read it over in the morning.",
      explanation:
        "여자가 전날 밤에 끝내고 아침에 다시 읽으라고 했으므로, 하루 일찍 끝내고 다시 읽겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 우진아, 너 과제를 매번 마지막 날 밤에 내더라.",
        "M: 그래도 다 제때 끝내잖아.",
        "W: 끝내긴 하지. 다시 읽어 보진 않고.",
        "M: 자정엔 그럴 시간이 없어.",
        "W: 점수는 어때?",
        "M: 지적이 늘 사소한 것들이야. 낱말 잘못 쓴 거, 줄 빠진 거.",
        "W: 그건 전부 5분만 다시 읽으면 잡히는 것들이야.",
        "M: 자정엔 그 5분이 없지.",
        "W: 그럼 그 마지막 밤이 쉬운 점수를 쓰게 하는 거네.",
        "M: 그럼 다시 읽기는 언제 하는데?",
        "W: 전날 밤에 끝내고 아침에 훑어봐.",
        "M: 하루 일찍 끝내고 다시 읽을게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Yuna가 Seokjin에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Yuna : ________________",
      lines: [
        [
          "W",
          "Yuna and Seokjin are preparing the class's stall for the school market day. " +
            "Seokjin has baked two hundred cookies and packed them into paper bags, " +
            "and the bags are folded neatly and tied with string. " +
            "On Thursday Yuna notices that the bags are completely closed, " +
            "so a buyer cannot see what is inside without untying one. " +
            "Last year the stalls that sold out were the ones where the food was visible. " +
            "There is a roll of clear bags in the storeroom, " +
            "and moving the cookies across would take about half an hour with two people. " +
            "She does not want the baking to have been wasted, " +
            "since the cookies themselves look very good. " +
            "She wants to tell him to move the cookies into the clear bags. " +
            "In this situation, what would Yuna most likely say to Seokjin?",
        ],
      ],
      choices: [
        "We should bake another two hundred.",
        "Let's move the cookies into clear bags.",
        "Let's lower the price of every bag.",
        "We should open the stall an hour later.",
        "Let's untie the bags for each buyer.",
      ],
      answer: 2,
      clue: "She wants to tell him to move the cookies into the clear bags.",
      explanation:
        "유나는 과자를 속이 보이는 봉투로 옮기자고 말하려 하므로 ②가 가장 적절하다.",
      translation: [
        "W: 유나와 석진이는 학교 장터의 날에 낼 학급 가게를 준비하고 있습니다. 석진이는 쿠키 이백 개를 구워 종이봉투에 담았고, 봉투는 반듯하게 접혀 끈으로 묶여 있습니다. 목요일에 유나는 봉투가 완전히 닫혀 있어서, 사는 사람이 하나를 풀어 보지 않으면 안에 무엇이 있는지 알 수 없다는 것을 알아챕니다. 작년에 다 팔린 가게는 음식이 보이는 가게들이었습니다. 창고에는 속이 보이는 봉투가 한 통 있고, 두 사람이면 30분쯤이면 옮길 수 있습니다. 유나는 쿠키 자체가 아주 잘 나왔기 때문에 그 수고가 헛되기를 바라지 않습니다. 유나는 쿠키를 속이 보이는 봉투로 옮기자고 말하고 싶습니다. 이런 상황에서 유나가 석진이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why a heavy ship floats " +
            "while a small stone sinks. " +
            "The usual answer is that the ship is made of metal but full of air, " +
            "which is true but skips the part that matters. " +
            "What decides whether something floats is not its weight " +
            "but how much water it has to push aside to fit in. " +
            "A ship's hull is shaped to displace an enormous volume of water, " +
            "and the water it pushes aside weighs more than the ship does. " +
            "A stone of the same weight pushes aside almost nothing " +
            "because it takes up so little room. " +
            "Change the shape and nothing else, " +
            "and the same piece of steel can either sink or carry a thousand tonnes.",
        ],
      ],
      choices: [
        "how ships are built from steel plates",
        "why stones are heavier than they look",
        "how water pressure increases with depth",
        "why metal rusts faster in seawater",
        "how shape rather than weight decides whether something floats",
      ],
      answer: 5,
      clue: "Change the shape and nothing else, and the same piece of steel can either sink or carry a thousand tonnes.",
      explanation:
        "남자는 뜨느냐를 정하는 것이 무게가 아니라 밀어내는 물의 양, 곧 모양이라고 설명한다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 무거운 배는 뜨는데 작은 돌은 왜 가라앉는지 이야기하려 합니다. 흔한 답은 배가 쇠로 만들어졌지만 안에 공기가 가득하다는 것입니다. 맞는 말이지만 정작 중요한 부분을 건너뜁니다. 무언가가 뜨느냐를 정하는 것은 그 무게가 아니라, 그것이 들어가려고 얼마나 많은 물을 밀어내야 하느냐입니다. 배의 선체는 엄청난 부피의 물을 밀어내도록 만들어졌고, 밀려난 물의 무게가 배보다 무겁습니다. 같은 무게의 돌은 차지하는 자리가 아주 작아서 밀어내는 물이 거의 없습니다. 모양만 바꾸고 다른 것은 그대로 두면, 같은 쇳덩이가 가라앉을 수도 있고 천 톤을 실어 나를 수도 있습니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about why a heavy ship floats while a small stone sinks."],
        ["M", "The usual answer is that the ship is made of metal but full of air."],
        ["M", "What decides whether something floats is not its weight but how much water it has to push aside to fit in."],
        ["M", "A ship's hull is shaped to displace an enormous volume of water, and the water it pushes aside weighs more than the ship does."],
        ["M", "A stone of the same weight pushes aside almost nothing because it takes up so little room."],
        ["M", "Change the shape and nothing else, and the same piece of steel can either sink or carry a thousand tonnes."],
      ],
      choices: [
        "the usual answer about metal full of air",
        "how much water something pushes aside",
        "salt water being denser than fresh water",
        "the displaced water weighing more than the ship",
        "a stone pushing aside almost nothing",
      ],
      answer: 3,
      clue: "The usual answer is that the ship is made of metal but full of air.",
      explanation:
        "쇠지만 공기가 가득하다는 흔한 답, 얼마나 많은 물을 밀어내는가, 밀려난 물이 배보다 무겁다는 것, 돌은 거의 밀어내지 않는다는 것은 언급되지만 바닷물이 민물보다 밀도가 높다는 것은 언급되지 않았다. 따라서 답은 ③이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
