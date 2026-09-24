/** 고2 듣기 24회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고2 24회",
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
          "Good evening, members of the Northgate Community Center. This is Junho Lim from the front desk. " +
            "I am calling about the lockers in the changing rooms. " +
            "Since the center opened, members have been leaving belongings in lockers overnight, " +
            "and by now more than forty lockers have not been opened in months. " +
            "Because of this, members arriving in the evening often find no free locker at all. " +
            "So beginning on the first of next month, every locker will be emptied at closing time. " +
            "Anything left inside will be kept at the front desk for two weeks. " +
            "If you need a locker for longer, we do rent monthly lockers on the second floor. " +
            "Please take your things home with you each evening. Thank you for understanding.",
        ],
      ],
      choices: [
        "사물함을 매일 비워 달라고 알리려고",
        "사물함 사용료 인상을 알리려고",
        "탈의실 공사를 안내하려고",
        "분실물 보관 기간을 알리려고",
        "월 사물함 신청을 받으려고",
      ],
      answer: 1,
      clue: "So beginning on the first of next month, every locker will be emptied at closing time.",
      explanation:
        "남자는 다음 달 1일부터 문 닫을 때 모든 사물함을 비운다며 저녁마다 물건을 가져가 달라고 알린다. 따라서 답은 ①이다.",
      translation: [
        "M: 노스게이트 주민 센터 회원 여러분, 안녕하세요. 안내 데스크 임준호입니다. 탈의실 사물함 때문에 연락드립니다. 센터가 문을 연 이래 회원들이 물건을 밤새 사물함에 두고 가셔서, 지금은 몇 달째 열리지 않은 사물함이 마흔 개가 넘습니다. 그래서 저녁에 오시는 회원들이 빈 사물함을 아예 찾지 못하는 일이 잦습니다. 그래서 다음 달 1일부터는 문 닫는 시각에 모든 사물함을 비우겠습니다. 안에 남은 물건은 안내 데스크에서 2주 동안 보관합니다. 더 오래 사물함이 필요하시면 2층에 월 단위로 빌려 드리는 사물함이 있습니다. 저녁마다 물건을 가져가 주시기 바랍니다. 이해해 주셔서 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Hyerin, I've been reading four books at the same time."],
        ["W", "Four? How far into each one are you?"],
        ["M", "Between forty and sixty pages, more or less."],
        ["W", "And when did you start the first one?"],
        ["M", "Early September. None of them are finished yet."],
        ["W", "So in two months you've finished nothing."],
        ["M", "But I've read two hundred pages altogether."],
        ["W", "Pages, yes. A book isn't the sum of its pages."],
        ["M", "What difference does finishing make?"],
        ["W", "The last third is where the parts connect. You've never reached it."],
        ["M", "So I've read four beginnings four times over."],
        ["W", "Finish one before you open the next, even a short one."],
      ],
      choices: [
        "책은 여러 권을 함께 읽어야 한다",
        "책은 한 권씩 끝까지 읽어야 한다",
        "독서량은 쪽수로 재야 한다",
        "어려운 책부터 읽어야 한다",
        "독서 기록을 남겨야 한다",
      ],
      answer: 2,
      clue: "Finish one before you open the next, even a short one.",
      explanation:
        "여자는 마지막 3분의 1에서 부분들이 이어진다며, 짧은 책이라도 한 권을 끝내고 다음 책을 펴라고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 혜린아, 나 요즘 책 네 권을 동시에 읽고 있어.",
        "W: 네 권? 각각 어디까지 읽었는데?",
        "M: 대충 40쪽에서 60쪽 사이.",
        "W: 첫 권은 언제 시작했어?",
        "M: 9월 초에. 아직 하나도 안 끝냈어.",
        "W: 그럼 두 달 동안 끝낸 게 없네.",
        "M: 그래도 다 합치면 200쪽은 읽었어.",
        "W: 쪽수는 그렇지. 책은 쪽수의 합이 아니야.",
        "M: 끝내는 게 뭐가 다른데?",
        "W: 마지막 3분의 1에서 부분들이 이어져. 너는 거기까지 간 적이 없어.",
        "M: 그럼 시작 부분만 네 번 읽은 셈이네.",
        "W: 짧은 책이라도 한 권 끝내고 다음 걸 펴.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Almost everyone believes they work better under pressure. " +
            "The evidence usually offered is a night before a deadline " +
            "when the work finally moved and the thing got done. " +
            "But notice what that night is being compared to. " +
            "It is compared to the three weeks before it, " +
            "when the same person opened the file, felt uneasy, and closed it again. " +
            "Pressure did not make them better. It removed the option of avoiding. " +
            "That is a real effect, but it is not the one people think they are describing. " +
            "And it comes with a bill. " +
            "Work done in that state is finished, not revised, " +
            "because there was never a second pass. " +
            "If deadlines are the only thing that starts you, " +
            "the fix is not more pressure. It is an earlier, smaller deadline " +
            "that leaves room for the pass you never get to.",
        ],
      ],
      choices: [
        "마감이 있어야 일이 된다",
        "압박은 건강에 해롭다",
        "일은 미리 시작해야 한다",
        "압박은 능력을 높이는 것이 아니라 회피를 막을 뿐이다",
        "고쳐 쓰기가 가장 중요하다",
      ],
      answer: 4,
      clue: "Pressure did not make them better. It removed the option of avoiding.",
      explanation:
        "여자는 압박이 실력을 높인 것이 아니라 회피할 선택지를 없앴을 뿐이며, 그 대가로 고쳐 쓰는 과정이 사라진다고 말한다. 따라서 답은 ④이다.",
      translation: [
        "W: 거의 모든 사람이 자기는 압박을 받을 때 더 잘한다고 믿습니다. 흔히 드는 근거는 마감 전날 밤, 드디어 일이 굴러가 결국 해냈던 그 밤입니다. 그런데 그 밤이 무엇과 견주어지고 있는지 보세요. 그 앞의 3주와 견주어지고 있습니다. 같은 사람이 파일을 열고, 불안해하고, 다시 닫았던 3주 말입니다. 압박이 그 사람을 더 잘하게 만든 것이 아닙니다. 회피라는 선택지를 없앤 것입니다. 그것은 실제로 있는 효과이지만, 사람들이 말하고 있다고 여기는 그 효과는 아닙니다. 그리고 청구서가 따라옵니다. 그런 상태에서 한 일은 끝난 것이지 고쳐진 것이 아닙니다. 두 번째로 볼 기회가 아예 없었으니까요. 마감만이 여러분을 시작하게 한다면, 해법은 더 큰 압박이 아닙니다. 끝내 못 하던 그 두 번째 과정을 위한 자리를 남겨 두는, 더 이르고 더 작은 마감입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["M", "Hyerin, is this the corner you set up for the school radio club?"],
        ["W", "Yes, we finished it two weeks ago."],
        ["M", "There's a microphone on a boom arm over the desk."],
        ["W", "It swings out of the way when we're not using it."],
        ["M", "And a wall clock with square numbers hangs above."],
        ["W", "We need it to time the segments exactly."],
        ["M", "I count two pairs of headphones on the desk."],
        ["W", "There are three now. One is under the monitor."],
        ["M", "The tall stool behind the desk looks comfortable."],
        ["W", "It's the only chair that fits under there."],
        ["M", "And a panel of foam squares covers the back wall."],
        ["W", "That's what keeps the echo out of the recording."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are three now. One is under the monitor.",
      explanation:
        "남자가 헤드폰이 두 개라고 하자 여자가 세 개라고 바로잡는다. 그림에는 두 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A school radio studio corner drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A MICROPHONE hangs from a BOOM ARM over a desk. " +
          "A SQUARE WALL CLOCK hangs on the wall above the desk. " +
          "Exactly TWO PAIRS OF HEADPHONES lie on the desk, clearly countable and separated. " +
          "A TALL STOOL stands behind the desk. " +
          "A PANEL OF FOAM SQUARES covers the back wall.",
      },
      translation: [
        "M: 혜린아, 이게 교내 방송 동아리로 꾸민 자리야?",
        "W: 응, 2주 전에 다 만들었어.",
        "M: 책상 위로 붐 암에 마이크가 달려 있네.",
        "W: 안 쓸 때는 옆으로 젖혀 둬.",
        "M: 그리고 위에 네모난 숫자 벽시계가 걸려 있어.",
        "W: 코너 시간을 정확히 재야 해서 필요해.",
        "M: 책상에 헤드폰이 두 개 보여.",
        "W: 지금은 세 개야. 하나는 모니터 밑에 있어.",
        "M: 책상 뒤 높은 의자가 편해 보인다.",
        "W: 거기 들어가는 의자는 그것뿐이야.",
        "M: 그리고 뒷벽을 네모난 방음재가 덮고 있네.",
        "W: 그게 녹음에 울림이 안 들어가게 해 줘.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Hyerin, the charity concert starts at seven tonight."],
        ["W", "I know. Is the stage set up in the auditorium?"],
        ["M", "Done this morning. Twelve chairs and two stands."],
        ["W", "Good. And the programs for the audience?"],
        ["M", "Printed and folded. They're stacked by the door."],
        ["W", "Then what's still open?"],
        ["M", "Nobody has tuned the school piano since August."],
        ["W", "The first piece is a piano solo. It has to be tuned."],
        ["M", "The tuner is waiting for someone to let him into the hall."],
        ["W", "Can't you go? You have the hall key."],
        ["M", "I'm picking up the guest singer from the station at five."],
        ["W", "Then I'll take the key and let the tuner in."],
      ],
      choices: [
        "무대 설치하기",
        "안내지 인쇄하기",
        "조율사를 강당에 들여보내기",
        "초청 가수 데려오기",
        "피아노 옮기기",
      ],
      answer: 3,
      clue: "Then I'll take the key and let the tuner in.",
      explanation:
        "무대와 안내지는 끝났고 남자는 가수를 데리러 가야 하므로, 여자가 열쇠를 받아 조율사를 강당에 들여보내기로 한다. 따라서 답은 ③이다.",
      translation: [
        "M: 혜린아, 자선 음악회가 오늘 저녁 7시에 시작해.",
        "W: 알아. 강당 무대는 설치됐어?",
        "M: 오늘 아침에 끝냈어. 의자 열두 개랑 보면대 두 개.",
        "W: 좋아. 관객용 안내지는?",
        "M: 인쇄해서 접었어. 문 옆에 쌓아 뒀어.",
        "W: 그럼 아직 남은 게 뭐야?",
        "M: 8월 이후로 아무도 학교 피아노를 조율하지 않았어.",
        "W: 첫 곡이 피아노 독주인데. 조율해야지.",
        "M: 조율사분이 강당에 들여보내 줄 사람을 기다리고 계셔.",
        "W: 네가 못 가? 강당 열쇠 네가 갖고 있잖아.",
        "M: 5시에 역에서 초청 가수를 모셔 와야 해.",
        "W: 그럼 내가 열쇠 받아서 조율사분을 들여보낼게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Welcome to Green Hill Garden Shop. What can I help you with?"],
        ["M", "I'd like six small pots and four bags of soil, please."],
        ["W", "Pots are five dollars each and soil is seven a bag."],
        ["M", "So thirty dollars plus twenty-eight."],
        ["W", "Fifty-eight in total. Would you like the plant food as well?"],
        ["M", "How much is that?"],
        ["W", "Twelve dollars a bottle."],
        ["M", "I'll skip the plant food for now."],
        ["W", "No problem. Are you a member of our garden club?"],
        ["M", "I am. Here's my card."],
        ["W", "Then you get fifty percent off the soil."],
        ["M", "That's a good deal. I'll pay in cash."],
      ],
      choices: ["$44.00", "$51.00", "$58.00", "$64.00", "$70.00"],
      answer: 1,
      clue: "Then you get fifty percent off the soil.",
      explanation:
        "화분 6개 30달러와 흙 4포대 28달러를 더하면 58달러이고, 흙값 28달러의 절반인 14달러를 빼면 44달러이다. 따라서 답은 ①이다.",
      translation: [
        "W: 그린힐 원예점입니다. 무엇을 도와드릴까요?",
        "M: 작은 화분 여섯 개랑 흙 네 포대 주세요.",
        "W: 화분은 하나에 5달러, 흙은 한 포대에 7달러입니다.",
        "M: 그럼 30달러에 28달러네요.",
        "W: 모두 58달러입니다. 영양제도 하시겠어요?",
        "M: 그건 얼마예요?",
        "W: 한 병에 12달러입니다.",
        "M: 영양제는 이번엔 뺄게요.",
        "W: 괜찮습니다. 저희 원예 모임 회원이세요?",
        "M: 네. 여기 카드요.",
        "W: 그럼 흙값을 절반 깎아 드립니다.",
        "M: 좋네요. 현금으로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 미술 전시회에 작품을 내지 않는 이유를 고르시오.",
      lines: [
        ["M", "Hyerin, your name isn't on the exhibition list."],
        ["W", "I decided not to submit this year."],
        ["M", "Did you not finish the painting?"],
        ["W", "It's been finished since October."],
        ["M", "Is it the entry fee, then?"],
        ["W", "No, the art club covers that for members."],
        ["M", "Then what's stopping you?"],
        ["W", "The rules say the work has to be under one meter wide."],
        ["M", "And yours is bigger?"],
        ["W", "One meter forty. I'd have to cut it to fit, and I won't do that."],
      ],
      choices: [
        "그림을 끝내지 못해서",
        "출품비가 부담스러워서",
        "작품이 규격보다 커서",
        "다른 전시와 겹쳐서",
        "작품이 마음에 들지 않아서",
      ],
      answer: 3,
      clue: "The rules say the work has to be under one meter wide.",
      explanation:
        "그림은 10월에 다 그렸고 출품비도 동아리가 내 주지만, 작품이 규정 폭인 1미터를 넘어 1미터 40이기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "M: 혜린아, 전시 목록에 네 이름이 없네.",
        "W: 올해는 안 내기로 했어.",
        "M: 그림을 못 끝냈어?",
        "W: 10월에 이미 다 그렸어.",
        "M: 그럼 출품비 때문이야?",
        "W: 아니, 회원은 동아리에서 내 줘.",
        "M: 그럼 뭐가 걸리는데?",
        "W: 규정에 작품 폭이 1미터 미만이어야 한대.",
        "M: 네 건 더 커?",
        "W: 1미터 40이야. 맞추려면 잘라야 하는데 그건 안 할 거야.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Riverside Night Run에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Hyerin, are you signing up for the Riverside Night Run?"],
        ["W", "I saw the poster. When is it?"],
        ["M", "The second Friday of June, starting at eight in the evening."],
        ["W", "An evening race. How long is the course?"],
        ["M", "Ten kilometers, along the river and back."],
        ["W", "That's manageable. Where does it start?"],
        ["M", "At the plaza beside the old railway bridge."],
        ["W", "I know that plaza. Is there an entry fee?"],
        ["M", "Twenty-five thousand won, and that includes a shirt."],
        ["W", "A shirt is nice. Do they give out water along the way?"],
        ["M", "Three stations, at three, six and nine kilometers."],
        ["W", "Then let's sign up this week."],
      ],
      choices: ["열리는 날", "코스 길이", "출발 장소", "참가비", "제한 시간"],
      answer: 5,
      clue: "제한 시간은 대화에서 언급되지 않았다.",
      explanation:
        "날짜(6월 둘째 주 금요일 저녁 8시), 코스 길이(10킬로미터), 출발 장소(옛 철교 옆 광장), 참가비(2만 5천 원)는 언급되지만 제한 시간은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 혜린아, 리버사이드 야간 달리기 신청할 거야?",
        "W: 포스터는 봤어. 언제야?",
        "M: 6월 둘째 주 금요일, 저녁 8시에 출발해.",
        "W: 저녁 경기구나. 코스는 얼마나 길어?",
        "M: 10킬로미터. 강을 따라 갔다가 돌아와.",
        "W: 할 만하네. 어디서 출발해?",
        "M: 옛 철교 옆 광장에서.",
        "W: 그 광장 알아. 참가비 있어?",
        "M: 2만 5천 원. 티셔츠가 포함돼 있어.",
        "W: 티셔츠 좋네. 중간에 물은 줘?",
        "M: 급수대가 세 군데. 3, 6, 9킬로미터 지점에.",
        "W: 그럼 이번 주에 신청하자.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Old Mill Bakery Tour에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "W",
          "Let me tell you about the Old Mill Bakery Tour. " +
            "The bakery has been running in the same stone building since 1912. " +
            "Tours are offered on Tuesday and Thursday mornings only, at ten o'clock. " +
            "Each tour lasts about ninety minutes and takes up to twelve people. " +
            "Booking is required, and you can book by phone or on their website. " +
            "The tour ends in the shop, where every visitor is given a loaf to take home. " +
            "Children under seven are not allowed inside the mill room for safety reasons.",
        ],
      ],
      choices: [
        "1912년부터 같은 건물에서 운영되었다",
        "화요일과 목요일 오전에만 한다",
        "한 번에 열두 명까지 참여한다",
        "예약 없이 갈 수 있다",
        "방문객에게 빵 한 덩이를 준다",
      ],
      answer: 4,
      clue: "Booking is required, and you can book by phone or on their website.",
      explanation:
        "예약이 필요하다고 했으므로 예약 없이 갈 수 있다는 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "W: 올드밀 제과점 견학을 소개해 드리겠습니다. 이 제과점은 1912년부터 같은 돌 건물에서 운영되어 왔습니다. 견학은 화요일과 목요일 오전 10시에만 합니다. 한 번에 90분쯤 걸리고 열두 명까지 참여할 수 있습니다. 예약이 필요하며, 전화나 누리집으로 예약할 수 있습니다. 견학은 가게에서 끝나는데, 방문객마다 집에 가져갈 빵 한 덩이를 받습니다. 안전상의 이유로 일곱 살 미만 어린이는 제분실에 들어갈 수 없습니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 봉사 활동을 고르시오.",
      lines: [
        ["M", "Hyerin, let's pick a volunteer activity for next term."],
        ["W", "Five are listed. Weekday or weekend?"],
        ["M", "Weekend only. My weekday evenings are all taken."],
        ["W", "Same here. Do we want one that needs training first?"],
        ["M", "No training, please. We'd lose two Saturdays to it."],
        ["W", "Agreed. And how far can we travel?"],
        ["M", "Within thirty minutes. Anything further and we'd give up the morning."],
        ["W", "Then only one fits all three."],
        ["M", "Applications close on Friday."],
        ["W", "Let's fill in the form during lunch tomorrow."],
        ["M", "I'll bring my student card for the ID number."],
        ["W", "Good idea. I always forget mine."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "Weekend only. My weekday evenings are all taken.",
      explanation:
        "주말이고, 사전 교육이 없으며, 30분 이내 거리인 활동을 고른다. 세 조건을 모두 채우는 것은 ③이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "When: Weekday / Training: No / Travel: 20 minutes" },
          { no: 2, label: "②", value: "When: Weekend / Training: Yes / Travel: 15 minutes" },
          { no: 3, label: "③", value: "When: Weekend / Training: No / Travel: 25 minutes" },
          { no: 4, label: "④", value: "When: Weekend / Training: No / Travel: 50 minutes" },
          { no: 5, label: "⑤", value: "When: Weekday / Training: Yes / Travel: 10 minutes" },
        ],
      },
      translation: [
        "M: 혜린아, 다음 학기 봉사 활동 하나 고르자.",
        "W: 다섯 개 있네. 평일이야, 주말이야?",
        "M: 주말만. 평일 저녁은 다 찼어.",
        "W: 나도. 사전 교육이 필요한 걸로 할까?",
        "M: 교육은 없었으면 해. 토요일 두 번을 거기 쓰게 돼.",
        "W: 동의해. 이동은 얼마나 할 수 있어?",
        "M: 30분 이내. 더 멀면 오전을 통째로 버리게 돼.",
        "W: 그럼 세 조건 다 맞는 건 하나뿐이야.",
        "M: 신청은 금요일에 닫혀.",
        "W: 내일 점심시간에 신청서 쓰자.",
        "M: 학생증 번호 때문에 학생증 가져올게.",
        "W: 좋은 생각이야. 나는 늘 깜빡해.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Junho, is the school shuttle running during the holiday?"],
        ["M", "Only in the morning, not in the afternoon."],
        ["W", "Then how do I get home after the study session?"],
        ["M", "The city bus number twelve stops right at the back gate."],
      ],
      choices: [
        "I always ride the shuttle home.",
        "I'll take the twelve, then.",
        "There is no back gate.",
        "The study session was cancelled.",
        "I'll walk the whole way.",
      ],
      answer: 2,
      clue: "The city bus number twelve stops right at the back gate.",
      explanation:
        "남자가 12번 시내버스가 후문에 선다고 알려 주었으므로, 그 버스를 타겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 준호야, 연휴에 학교 셔틀 운행해?",
        "M: 오전에만. 오후에는 안 해.",
        "W: 그럼 자습 끝나고 집에 어떻게 가?",
        "M: 12번 시내버스가 후문 바로 앞에 서.",
        "W: 그럼 12번 탈게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Hyerin, my science report is due Friday and I've lost the rubric."],
        ["W", "Did you check the class page?"],
        ["M", "I looked under notices and it wasn't there."],
        ["W", "It's under materials, not notices. That's where she puts them."],
      ],
      choices: [
        "My report is already finished.",
        "There is no class page.",
        "I'll ask for an extension.",
        "I'll look under materials.",
        "The rubric was in the notices.",
      ],
      answer: 4,
      clue: "It's under materials, not notices. That's where she puts them.",
      explanation:
        "여자가 자료 게시판에 있다고 알려 주었으므로, 자료 쪽을 보겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 혜린아, 과학 보고서가 금요일까지인데 채점 기준표를 잃어버렸어.",
        "W: 학급 페이지는 봤어?",
        "M: 공지 쪽을 봤는데 없었어.",
        "W: 공지 말고 자료 쪽에 있어. 선생님은 거기에 올리셔.",
        "M: 자료 쪽을 볼게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Hyerin, you've turned down three invitations to the study group."],
        ["W", "I work better alone. I always have."],
        ["M", "How did the last chemistry unit go, working alone?"],
        ["W", "Badly. I misread the same formula for three weeks."],
        ["M", "And nobody was there to say, that's not what that means."],
        ["W", "I suppose that's what a group is for."],
        ["M", "Not to teach you. Just to catch a wrong turn early."],
        ["W", "But I'm slower than everyone in that group."],
        ["M", "They meet to check each other, not to race."],
        ["W", "I've been picturing it as a competition."],
        ["M", "Go once and bring the unit you're least sure about."],
      ],
      choices: [
        "I'll keep studying by myself.",
        "There is no study group this term.",
        "I'm sure about every unit already.",
        "I'd rather teach the group myself.",
        "I'll go on Thursday with the chemistry unit.",
      ],
      answer: 5,
      clue: "Go once and bring the unit you're least sure about.",
      explanation:
        "남자가 한 번 가 보고 가장 자신 없는 단원을 가져가라고 했으므로, 목요일에 화학 단원을 갖고 가겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 혜린아, 스터디 모임 초대를 세 번이나 거절했더라.",
        "W: 나는 혼자 하는 게 나아. 늘 그랬어.",
        "M: 혼자 한 지난번 화학 단원은 어땠어?",
        "W: 망했어. 같은 식을 3주 동안 잘못 읽었어.",
        "M: 그게 그런 뜻이 아니라고 말해 줄 사람이 없었던 거지.",
        "W: 모임이 그런 데구나.",
        "M: 가르쳐 주려는 게 아니야. 잘못 든 길을 일찍 잡아 주는 거지.",
        "W: 그런데 나는 그 모임에서 제일 느려.",
        "M: 서로 확인하려고 모이는 거지 경주하려고 모이는 게 아니야.",
        "W: 나는 그걸 경쟁으로 그려 왔네.",
        "M: 한 번 가 보고, 제일 자신 없는 단원을 가져가.",
        "W: 목요일에 화학 단원 갖고 갈게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Junho, you've rewritten the club budget four times this week."],
        ["M", "The numbers keep coming out different."],
        ["W", "Different from what? Did anything change?"],
        ["M", "No, I just don't trust the total."],
        ["W", "Are you doing it in your head each time?"],
        ["M", "On paper, but I start again from the top every round."],
        ["W", "So you never find out where the mistake was."],
        ["M", "I just redo it until two rounds agree."],
        ["W", "Then you'll never know whether they agree because they're right."],
        ["M", "That's a very uncomfortable thought."],
        ["W", "Put it in a spreadsheet and let it add the column for you."],
      ],
      choices: [
        "I'll set up a spreadsheet tonight.",
        "I'll do it once more by hand.",
        "The club has no budget.",
        "My totals are always correct.",
        "I'll ask someone else to do it.",
      ],
      answer: 1,
      clue: "Put it in a spreadsheet and let it add the column for you.",
      explanation:
        "여자가 표 계산 프로그램에 넣어 합계를 맡기라고 했으므로, 오늘 밤 만들겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 준호야, 이번 주에 동아리 예산을 네 번이나 다시 썼네.",
        "M: 숫자가 자꾸 다르게 나와.",
        "W: 뭐랑 다른데? 뭔가 바뀌었어?",
        "M: 아니, 그냥 합계가 못 미더워서.",
        "W: 매번 암산으로 해?",
        "M: 종이에 해. 그런데 매번 맨 위부터 다시 시작해.",
        "W: 그럼 실수가 어디 있었는지 영영 모르잖아.",
        "M: 두 번이 같아질 때까지 다시 할 뿐이야.",
        "W: 그럼 그게 맞아서 같은 건지는 끝내 모르지.",
        "M: 아주 불편한 생각이네.",
        "W: 표 계산 프로그램에 넣고 열 합계를 맡겨.",
        "M: 오늘 밤에 만들어 볼게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Bora가 Hanjun에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Bora : ________________",
      lines: [
        [
          "W",
          "Bora and Hanjun are running the sound desk for the school play, which opens on Friday. " +
            "Hanjun has built the whole cue list himself and knows it by heart. " +
            "During Wednesday's rehearsal, Bora notices that the cue list exists only on his laptop, " +
            "with no printed copy and no file shared with anyone else. " +
            "Hanjun has a dentist appointment on Friday afternoon " +
            "and has said he might arrive only ten minutes before the curtain. " +
            "If his laptop fails or he is late, nobody in the room would know when any sound should play. " +
            "Bora does not think he has been careless with the work itself, " +
            "only with the single copy of it. " +
            "She wants to tell him to print the cue list and share the file with the crew before Friday. " +
            "In this situation, what would Bora most likely say to Hanjun?",
        ],
      ],
      choices: [
        "Let's cancel the sound for this play.",
        "Print the cue list and share the file with us.",
        "You should memorize the list more carefully.",
        "Let's move the play to next week.",
        "You should skip your dentist appointment.",
      ],
      answer: 2,
      clue: "She wants to tell him to print the cue list and share the file with the crew before Friday.",
      explanation:
        "보라는 금요일 전에 큐 목록을 인쇄하고 파일을 다른 사람들과 나누라고 말하려 하므로 ②가 가장 적절하다.",
      translation: [
        "W: 보라와 한준이는 금요일에 막을 올리는 학교 연극의 음향석을 맡고 있습니다. 한준이는 큐 목록을 혼자 다 만들었고 통째로 외우고 있습니다. 수요일 연습 때 보라는 그 큐 목록이 한준이 노트북에만 있고, 인쇄본도 없고 다른 사람과 나눈 파일도 없다는 것을 알아챕니다. 한준이는 금요일 오후에 치과 예약이 있어서 막이 오르기 10분 전에야 올지도 모른다고 말했습니다. 노트북이 말을 듣지 않거나 한준이가 늦으면, 그 자리의 누구도 어떤 소리를 언제 틀어야 하는지 알지 못합니다. 보라는 한준이가 일 자체를 대충 한 것이 아니라 그것이 한 벌뿐이라는 점에만 무심했다고 생각합니다. 보라는 금요일 전에 큐 목록을 인쇄하고 파일을 팀원들과 나누라고 말하고 싶습니다. 이런 상황에서 보라가 한준이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why deserts get so cold at night. " +
            "People are often surprised by this. " +
            "A place that reaches forty-five degrees at noon can fall near freezing before dawn, " +
            "a swing of forty degrees in a single day. " +
            "The reason is not the sand. It is the air above it. " +
            "Water vapour in the atmosphere traps heat radiating up from the ground, " +
            "holding it near the surface like a blanket. " +
            "Desert air carries almost no water vapour, " +
            "so once the sun sets, the heat the ground absorbed all day escapes straight upward " +
            "with nothing to slow it down. " +
            "A humid coastal town at the same latitude barely cools at all overnight. " +
            "The difference between them is not how much heat arrives. " +
            "It is how long the air can hold on to it.",
        ],
      ],
      choices: [
        "why deserts cool so sharply after sunset",
        "how sand stores heat during the day",
        "why coastal towns are warmer than inland ones",
        "how deserts were formed over time",
        "why water vapour rises into the atmosphere",
      ],
      answer: 1,
      clue: "The difference between them is not how much heat arrives. It is how long the air can hold on to it.",
      explanation:
        "남자는 사막 공기에 수증기가 거의 없어 낮에 흡수한 열이 밤에 곧장 빠져나가기 때문이라고 설명한다. 따라서 답은 ①이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 사막이 왜 밤에 그렇게 추워지는지 이야기하려 합니다. 사람들이 이 사실에 자주 놀랍니다. 한낮에 45도까지 오르는 곳이 새벽 전에 영하 가까이 떨어집니다. 하루 만에 40도가 오르내리는 것이지요. 이유는 모래가 아닙니다. 그 위의 공기입니다. 대기 중 수증기는 땅에서 올라오는 열을 붙잡아 담요처럼 지표 가까이에 가둡니다. 사막 공기에는 수증기가 거의 없습니다. 그래서 해가 지면 땅이 하루 종일 빨아들인 열이 아무것도 막지 않는 채로 곧장 위로 빠져나갑니다. 같은 위도의 습한 해안 마을은 밤새 거의 식지 않습니다. 둘의 차이는 열이 얼마나 오느냐가 아닙니다. 공기가 그것을 얼마나 오래 붙들 수 있느냐입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about why deserts get so cold at night."],
        ["M", "A place that reaches forty-five degrees at noon can fall near freezing before dawn, a swing of forty degrees in a single day."],
        ["M", "The reason is not the sand. It is the air above it."],
        ["M", "Water vapour in the atmosphere traps heat radiating up from the ground, holding it near the surface like a blanket."],
        ["M", "Desert air carries almost no water vapour, so once the sun sets, the heat the ground absorbed all day escapes straight upward."],
        ["M", "A humid coastal town at the same latitude barely cools at all overnight."],
      ],
      choices: [
        "a forty-degree swing within one day",
        "water vapour trapping heat like a blanket",
        "desert air carrying almost no water vapour",
        "a humid coastal town staying warm overnight",
        "strong winds carrying heat away from the sand",
      ],
      answer: 5,
      clue: "Desert air carries almost no water vapour, so once the sun sets, the heat the ground absorbed all day escapes straight upward.",
      explanation:
        "하루 40도 차이, 수증기가 담요처럼 열을 가둔다는 것, 사막 공기에 수증기가 거의 없다는 것, 습한 해안 마을이 밤에 식지 않는다는 것은 언급되지만 강한 바람이 열을 실어 간다는 것은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
