/** 고1 듣기 33회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 33회",
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
          "Good morning, students. This is Ms. Han from the student affairs office. " +
            "I need to tell you about a change to the bicycle shed behind the gym. " +
            "Until now anyone could push a bicycle in and leave it wherever there was space, " +
            "and by eight thirty the aisle is blocked so badly that nobody can reach the back row. " +
            "From this Thursday every bicycle must be parked inside a numbered slot, " +
            "and the number is the one printed on the sticker you receive at the office. " +
            "Come and collect your sticker during lunch this week. " +
            "Bicycles left outside a slot will be moved to the far wall, " +
            "which is not locked at night. " +
            "Nothing else about the shed is changing, and the side gate stays open until seven. " +
            "Please pick up your sticker before Thursday. Thank you.",
        ],
      ],
      choices: [
        "체육관 공사 일정을 알리려고",
        "자전거 보관소 이용 방법 변경을 안내하려고",
        "분실된 자전거를 찾아 주려고",
        "등교 시간 변경을 알리려고",
        "자전거 안전 교육을 권하려고",
      ],
      answer: 2,
      clue: "From this Thursday every bicycle must be parked inside a numbered slot.",
      explanation:
        "여자는 이번 목요일부터 번호가 붙은 자리에만 자전거를 세워야 한다며 스티커를 받아 가라고 안내한다. 따라서 답은 ②이다.",
      translation: [
        "W: 학생 여러분, 안녕하세요. 학생부 한 선생님입니다. 체육관 뒤 자전거 보관소가 달라지는 점을 알려 드립니다. 지금까지는 누구나 자전거를 밀고 들어와 빈자리 아무 데나 세웠고, 여덟 시 반이면 통로가 막혀 뒷줄까지 갈 수 없었습니다. 이번 목요일부터는 번호가 매겨진 자리 안에 세워야 하며, 그 번호는 학생부에서 받는 스티커에 찍혀 있습니다. 이번 주 점심시간에 와서 스티커를 받아 가세요. 자리 밖에 세운 자전거는 먼 쪽 벽으로 옮기는데, 그곳은 밤에 잠기지 않습니다. 보관소의 다른 점은 달라지지 않고, 옆문은 일곱 시까지 열어 둡니다. 목요일 전에 스티커를 꼭 받아 가세요. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Jiwon, I finished going over the whole math test."],
        ["W", "How long did that take you?"],
        ["M", "Twenty minutes. I marked every wrong number in red."],
        ["W", "And what did you write next to the red marks?"],
        ["M", "Nothing. The correct answer, that's all."],
        ["W", "Then in two weeks you'll miss the same question again."],
        ["M", "Why would I? I know the answer now."],
        ["W", "You know that answer. You don't know why your hand went the other way."],
        ["M", "It was probably just a careless slip."],
        ["W", "Careless means nothing. Write whether you misread it, forgot a rule, or ran out of time."],
        ["M", "That would take much longer than twenty minutes."],
        ["W", "It would, and it's the only part that changes the next test."],
      ],
      choices: [
        "시험 직후에 바로 채점해야 한다",
        "틀린 문제는 여러 번 다시 풀어야 한다",
        "시험 범위를 미리 나누어 공부해야 한다",
        "친구와 함께 오답을 검토해야 한다",
        "오답은 틀린 이유를 적어 두어야 한다",
      ],
      answer: 5,
      clue: "Write whether you misread it, forgot a rule, or ran out of time.",
      explanation:
        "여자는 정답만 적어 두면 같은 문제를 또 틀린다며, 잘못 읽었는지 규칙을 잊었는지 시간이 모자랐는지 이유를 적으라고 말한다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 지원아, 수학 시험 전체를 다 검토했어.",
        "W: 얼마나 걸렸는데?",
        "M: 20분. 틀린 번호마다 빨간색으로 표시했어.",
        "W: 빨간 표시 옆에는 뭘 썼어?",
        "M: 아무것도. 정답만 적었어.",
        "W: 그러면 2주 뒤에 같은 문제를 또 틀려.",
        "M: 왜? 이제 답을 아는데.",
        "W: 그 답을 아는 거지. 왜 네 손이 다른 쪽으로 갔는지는 모르잖아.",
        "M: 그냥 실수였을 거야.",
        "W: 실수라는 말은 아무것도 아니야. 잘못 읽었는지, 규칙을 잊었는지, 시간이 모자랐는지 적어.",
        "M: 그러면 20분보다 훨씬 오래 걸려.",
        "W: 그렇지. 그런데 다음 시험을 바꾸는 건 그 부분뿐이야.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Many of you cut your sleep to four or five hours before an exam, " +
            "and you believe those extra hours are pure profit. " +
            "They are not. What you learn in the evening is not stored while you read it. " +
            "It is stored while you sleep, in the hours you decided to spend at the desk. " +
            "A student who studies eight hours and sleeps seven " +
            "walks into the room holding more than a student who studies eleven and sleeps four. " +
            "The second student has more pages behind them and less of it inside their head. " +
            "Add to that a slower hand and eyes that read the same line twice. " +
            "Sleep is not the reward you get after studying. It is the last step of studying.",
        ],
      ],
      choices: [
        "공부 시간을 정확히 재야 한다",
        "시험 전날에는 새 내용을 보지 말아야 한다",
        "잠을 줄여 공부하면 오히려 손해다",
        "아침에 공부하는 것이 효율적이다",
        "과목을 번갈아 공부해야 한다",
      ],
      answer: 3,
      clue: "Sleep is not the reward you get after studying. It is the last step of studying.",
      explanation:
        "남자는 배운 것이 잠자는 동안 저장되므로 잠을 줄여 얻은 시간이 이득이 아니라고 말한다. 따라서 답은 ③이다.",
      translation: [
        "M: 여러분 중 많은 사람이 시험 전에 잠을 네다섯 시간으로 줄이고, 그 시간을 온전한 이득이라고 믿습니다. 그렇지 않습니다. 저녁에 배운 것은 읽는 동안 저장되지 않습니다. 여러분이 책상에서 보내기로 한 그 시간, 곧 잠자는 동안 저장됩니다. 여덟 시간 공부하고 일곱 시간 자는 학생이 열한 시간 공부하고 네 시간 자는 학생보다 더 많은 것을 들고 시험장에 들어갑니다. 두 번째 학생은 넘긴 쪽수는 많지만 머릿속에 남은 것은 적습니다. 거기에 느려진 손과 같은 줄을 두 번 읽는 눈까지 더해집니다. 잠은 공부한 뒤에 받는 상이 아닙니다. 공부의 마지막 단계입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Minho, is this the club room your group moved into?"],
        ["M", "Yes, we carried everything across last Friday."],
        ["W", "There's a round clock high on the back wall."],
        ["M", "It runs about two minutes fast, so we trust our phones."],
        ["W", "And a tall bookshelf stands against the left wall."],
        ["M", "The bottom shelf holds the club record books."],
        ["W", "A guitar is leaning against the wall on the right."],
        ["M", "Whoever arrives first usually plays something."],
        ["W", "I count three cushions on the floor in the middle."],
        ["M", "There are only two. The third one went to the drama club."],
        ["W", "And a framed photo hangs on the right wall."],
        ["M", "That's our club on the day the room opened."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "There are only two. The third one went to the drama club.",
      explanation:
        "여자가 방석이 셋이라고 하자 남자가 둘뿐이라고 바로잡는다. 그림에는 셋이 그려져 있으므로 답은 ④이다.",
      figure: {
        kind: "figure5",
        spots: [
          [0.31, 0.09],
          [0.06, 0.5],
          [0.73, 0.38],
          [0.5, 0.62],
          [0.88, 0.1],
        ],
        scene:
          "A school club room drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A ROUND WALL CLOCK hangs high on the back wall, a little left of the centre. " +
          "A TALL BOOKSHELF filled with books stands against the LEFT wall. " +
          "A GUITAR leans against the wall on the RIGHT side of the room. " +
          "EXACTLY THREE ROUND FLOOR CUSHIONS lie on the floor in the MIDDLE of the room, " +
          "spaced apart with clear gaps so that all three are easy to count. " +
          "A FRAMED GROUP PHOTO hangs on the wall at the far RIGHT, above the guitar.",
      },
      translation: [
        "W: 민호야, 여기가 너희 동아리가 옮겨 온 방이야?",
        "M: 응, 지난 금요일에 다 옮겼어.",
        "W: 뒷벽 높은 곳에 둥근 시계가 있네.",
        "M: 2분쯤 빨라서 우리는 휴대폰을 봐.",
        "W: 왼쪽 벽에는 키 큰 책장이 있고.",
        "M: 맨 아래 칸에는 동아리 기록장이 있어.",
        "W: 오른쪽 벽에는 기타가 기대 있네.",
        "M: 먼저 오는 사람이 보통 한 곡 쳐.",
        "W: 가운데 바닥에 방석이 세 개 보여.",
        "M: 두 개뿐이야. 세 번째는 연극 동아리로 갔어.",
        "W: 그리고 오른쪽 벽에 사진 액자가 걸려 있어.",
        "M: 방을 연 날 찍은 우리 동아리 사진이야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Junho, the class exhibition opens tomorrow at ten."],
        ["M", "Are all the panels hung already?"],
        ["W", "Twelve of them are up. The last three came back from printing this morning."],
        ["M", "Do we have enough hooks for those three?"],
        ["W", "We do. I counted them twice after lunch."],
        ["M", "Then what's still missing?"],
        ["W", "The title card. Nobody has written the heading for the whole wall."],
        ["M", "Isn't that the design team's part?"],
        ["W", "They finished the layout, but the lettering was left to us."],
        ["M", "How large does it have to be?"],
        ["W", "Big enough to read from the far door, so about half a metre wide."],
        ["M", "All right, I'll write the title card this evening."],
      ],
      choices: [
        "전시 제목 카드를 쓰기",
        "패널을 인쇄소에서 찾아오기",
        "고리를 더 사 오기",
        "전시장을 청소하기",
        "설계도를 다시 그리기",
      ],
      answer: 1,
      clue: "All right, I'll write the title card this evening.",
      explanation:
        "남자는 오늘 저녁에 전시 제목 카드를 쓰겠다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 준호야, 학급 전시가 내일 열 시에 열려.",
        "M: 판은 다 걸었어?",
        "W: 열두 개는 걸었어. 나머지 세 개가 오늘 아침에 인쇄소에서 왔어.",
        "M: 그 세 개 걸 고리는 충분해?",
        "W: 충분해. 점심 먹고 두 번 세어 봤어.",
        "M: 그럼 뭐가 남았어?",
        "W: 제목 카드. 벽 전체 제목을 아무도 안 썼어.",
        "M: 그건 디자인 팀 몫 아니야?",
        "W: 배치는 끝냈는데 글씨는 우리한테 넘겼어.",
        "M: 얼마나 커야 해?",
        "W: 저쪽 문에서 읽힐 만큼. 폭이 50센티미터쯤.",
        "M: 알겠어, 오늘 저녁에 제목 카드 쓸게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Good afternoon. Are you booking the practice room?"],
        ["W", "Yes, for our school band this Saturday."],
        ["M", "The large room is thirty dollars for two hours."],
        ["W", "We need three hours, not two."],
        ["M", "Every extra hour after the first two is ten dollars."],
        ["W", "So three hours in the large room, then."],
        ["M", "Will you need us to lend you a drum set?"],
        ["W", "Yes, please. Ours is still at the school."],
        ["M", "The drum set is fifteen dollars for the day."],
        ["W", "I have a member card from last year."],
        ["M", "That card takes ten percent off the room charge only."],
        ["W", "Then let's do that. Here is my card."],
      ],
      choices: ["$51", "$52", "$51.50", "$55", "$56"],
      answer: 3,
      clue: "Every extra hour after the first two is ten dollars.",
      explanation:
        "큰 방 세 시간은 40달러이고 회원 할인 10퍼센트를 빼면 36달러이며, 드럼 대여 15달러를 더하면 51달러 50센트이다. 따라서 답은 ③이다.",
      translation: [
        "M: 안녕하세요. 연습실 예약하시나요?",
        "W: 네, 이번 토요일에 저희 학교 밴드가 쓸 거예요.",
        "M: 큰 방은 두 시간에 30달러입니다.",
        "W: 두 시간 말고 세 시간이 필요해요.",
        "M: 처음 두 시간 뒤로는 한 시간마다 10달러입니다.",
        "W: 그럼 큰 방으로 세 시간이요.",
        "M: 드럼 세트도 빌려 드릴까요?",
        "W: 네, 부탁드려요. 저희 건 아직 학교에 있어요.",
        "M: 드럼 세트는 하루에 15달러입니다.",
        "W: 작년에 만든 회원 카드가 있어요.",
        "M: 그 카드는 방값에서만 10퍼센트를 빼 드립니다.",
        "W: 그럼 그렇게 할게요. 여기 카드요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 여자가 동아리 모임에 가지 못하는 이유를 고르시오.",
      lines: [
        ["M", "Hayeon, you're not coming to the club meeting on Friday?"],
        ["W", "I can't, and I already told the club leader."],
        ["M", "Is it the family trip you mentioned last month?"],
        ["W", "That was moved to October, so it isn't that."],
        ["M", "Then are you sick again?"],
        ["W", "I'm fine now. My brother's graduation ceremony is that afternoon."],
        ["M", "I didn't know he was finishing this term."],
        ["W", "He is, and my parents want all of us there."],
      ],
      choices: [
        "가족 여행을 가야 해서",
        "동생의 졸업식에 가야 해서",
        "몸이 아파서",
        "시험공부를 해야 해서",
        "아르바이트를 해야 해서",
      ],
      answer: 2,
      clue: "My brother's graduation ceremony is that afternoon.",
      explanation:
        "여자는 그날 오후에 동생의 졸업식이 있어서 모임에 갈 수 없다고 말한다. 따라서 답은 ②이다.",
      translation: [
        "M: 하연아, 금요일 동아리 모임에 안 와?",
        "W: 못 가. 동아리 부장한테는 벌써 말했어.",
        "M: 지난달에 말한 가족 여행 때문이야?",
        "W: 그건 10월로 미뤄서 그건 아니야.",
        "M: 그럼 또 아픈 거야?",
        "W: 이제 괜찮아. 그날 오후에 동생 졸업식이 있어.",
        "M: 이번 학기에 졸업하는 줄 몰랐네.",
        "W: 맞아. 부모님이 우리 다 같이 가길 바라셔.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 사진 전시회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Dohyun, are you taking part in the school photo exhibition?"],
        ["M", "I'd like to. When does it open?"],
        ["W", "It runs for five days, from the eleventh to the fifteenth."],
        ["M", "And where do they hang the pictures?"],
        ["W", "Along the corridor on the second floor, both walls."],
        ["M", "How many photographs may one student send in?"],
        ["W", "Three at most, and they must be printed, not files."],
        ["M", "Does the school pay for the printing?"],
        ["W", "The art department covers it if you submit by the fifth."],
        ["M", "That's good to know. Is there a theme this year?"],
        ["W", "Anything about our town, indoors or outdoors."],
      ],
      choices: ["전시 기간", "전시 장소", "제출할 수 있는 작품 수", "관람하는 방법", "올해의 주제"],
      answer: 4,
      clue: "It runs for five days, from the eleventh to the fifteenth.",
      explanation:
        "기간, 장소, 제출 작품 수, 주제는 말했지만 관람하는 방법은 말하지 않았다. 따라서 답은 ④이다.",
      translation: [
        "W: 도현아, 교내 사진 전시회 참가할 거야?",
        "M: 하고 싶어. 언제 열려?",
        "W: 11일부터 15일까지 닷새 동안 해.",
        "M: 사진은 어디에 걸어?",
        "W: 2층 복도 양쪽 벽에.",
        "M: 한 사람이 몇 점까지 낼 수 있어?",
        "W: 최대 세 점. 파일 말고 인화한 것이어야 해.",
        "M: 인화비는 학교에서 내 줘?",
        "W: 5일까지 내면 미술부에서 대 줘.",
        "M: 알아 두면 좋겠다. 올해 주제는 있어?",
        "W: 우리 동네에 관한 거면 실내든 실외든 괜찮아.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Riverside Night Market에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Let me tell you about the Riverside Night Market, which opens next weekend. " +
            "It runs on Friday and Saturday evenings, from six until eleven. " +
            "The market sits along the walking path on the south bank of the river. " +
            "About sixty stalls will sell food, handmade goods and second-hand books. " +
            "A small stage near the bridge holds live music every hour on the hour. " +
            "Entry is free for everyone, and the stalls take both cards and cash. " +
            "There is no parking beside the market, " +
            "so visitors are asked to use the public lot behind the library and walk five minutes.",
        ],
      ],
      choices: [
        "금요일과 토요일 저녁에 열린다",
        "강 남쪽 산책로를 따라 선다",
        "예순 개쯤의 가게가 들어선다",
        "입장료는 없다",
        "시장 옆에 주차장이 있다",
      ],
      answer: 5,
      clue: "There is no parking beside the market.",
      explanation:
        "시장 옆에는 주차장이 없어 도서관 뒤 공영 주차장을 쓰라고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "M: 다음 주말에 문을 여는 리버사이드 야시장에 대해 말씀드리겠습니다. 금요일과 토요일 저녁 여섯 시부터 열한 시까지 엽니다. 시장은 강 남쪽 둑의 산책로를 따라 섭니다. 예순 개쯤 되는 가게가 음식, 손으로 만든 물건, 헌책을 팝니다. 다리 근처 작은 무대에서는 매시 정각에 공연이 있습니다. 입장은 누구나 무료이고, 가게에서는 카드와 현금을 모두 받습니다. 시장 옆에는 주차장이 없으니 도서관 뒤 공영 주차장을 이용해 5분 걸어오시기 바랍니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 신청할 주말 강좌를 고르시오.",
      lines: [
        ["M", "Subin, here are the five weekend courses at the youth centre."],
        ["W", "We agreed on Saturday, didn't we?"],
        ["M", "We did, so the two Sunday ones are out."],
        ["W", "How long does each course run?"],
        ["M", "Some are four weeks and some are eight."],
        ["W", "Eight weeks would run past the exam period."],
        ["M", "Then four weeks it is. What about the fee?"],
        ["W", "Anything under sixty thousand won is fine for me."],
        ["M", "One of the remaining ones is seventy-five thousand."],
        ["W", "So only one course is left for us."],
        ["M", "I'll put both our names down tonight."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 1,
      clue: "We agreed on Saturday, didn't we?",
      explanation:
        "토요일, 4주, 6만 원 미만인 강좌를 고른다. 세 조건을 모두 채우는 것은 ①이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Day: Saturday / Weeks: 4 / Fee: 55,000 won" },
          { no: 2, label: "②", value: "Day: Saturday / Weeks: 4 / Fee: 75,000 won" },
          { no: 3, label: "③", value: "Day: Saturday / Weeks: 8 / Fee: 50,000 won" },
          { no: 4, label: "④", value: "Day: Sunday / Weeks: 4 / Fee: 45,000 won" },
          { no: 5, label: "⑤", value: "Day: Sunday / Weeks: 8 / Fee: 58,000 won" },
        ],
      },
      translation: [
        "M: 수빈아, 청소년 센터 주말 강좌 다섯 개야.",
        "W: 우리 토요일로 정했지?",
        "M: 맞아. 그럼 일요일 두 개는 빠져.",
        "W: 각각 몇 주야?",
        "M: 4주짜리도 있고 8주짜리도 있어.",
        "W: 8주면 시험 기간을 넘겨.",
        "M: 그럼 4주로. 수강료는?",
        "W: 6만 원 아래면 괜찮아.",
        "M: 남은 것 중 하나는 7만 5천 원이야.",
        "W: 그럼 우리한테 남는 건 하나뿐이네.",
        "M: 오늘 밤에 둘 다 이름 적을게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Seoyeon, did you print the survey sheets?"],
        ["W", "Forty copies, and they're in the blue folder."],
        ["M", "We need ten more for the other class."],
        ["W", "The printer ran out of paper this morning."],
        ["M", "Should I bring a pack from the office?"],
      ],
      choices: [
        "No, the survey is finished.",
        "I don't know where the folder is.",
        "Yes, please, and I'll print them.",
        "The other class already left.",
        "Forty copies were too many.",
      ],
      answer: 3,
      clue: "Should I bring a pack from the office?",
      explanation:
        "종이가 떨어졌다고 했으므로 종이를 가져다주면 인쇄하겠다는 ③이 가장 자연스럽다.",
      translation: [
        "M: 서연아, 설문지 인쇄했어?",
        "W: 마흔 장. 파란 폴더에 있어.",
        "M: 다른 반 것 열 장이 더 필요해.",
        "W: 오늘 아침에 인쇄기에 종이가 떨어졌어.",
        "M: 행정실에서 한 묶음 가져올까?",
        "W: 응, 부탁해. 내가 인쇄할게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Taemin, are you going to the library after school?"],
        ["M", "I was planning to, around four."],
        ["W", "Could you return this book for me?"],
        ["M", "Is it due today or tomorrow?"],
        ["W", "Today, and they close at six."],
      ],
      choices: [
        "I already returned it.",
        "No problem, I'll be there by four.",
        "The library is closed all week.",
        "You should keep it longer.",
        "I don't have a library card.",
      ],
      answer: 2,
      clue: "Today, and they close at six.",
      explanation:
        "오늘이 반납일이고 여섯 시에 닫는다고 했으므로, 네 시까지 가겠다는 ②가 가장 자연스럽다.",
      translation: [
        "W: 태민아, 방과 후에 도서관 가?",
        "M: 네 시쯤 가려고 했어.",
        "W: 이 책 좀 반납해 줄래?",
        "M: 오늘까지야, 내일까지야?",
        "W: 오늘까지. 여섯 시에 닫아.",
        "M: 그럼 문제없어. 네 시까지 갈게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Hyunwoo, how is the school newspaper coming along?"],
        ["M", "Three articles are written, but the front page is empty."],
        ["W", "Isn't the front page usually the easiest?"],
        ["M", "It should be, except nobody wants to write it."],
        ["W", "Why does everyone avoid that one?"],
        ["M", "The whole school reads it, so people are afraid of mistakes."],
        ["W", "Have you told them that you check everything before printing?"],
        ["M", "I mention it, but they still hesitate."],
        ["W", "Perhaps they don't know what a front page article looks like."],
        ["M", "That may be closer to the truth than fear."],
        ["W", "Why don't you show them last year's front pages at the next meeting?"],
      ],
      choices: [
        "We stopped printing the newspaper.",
        "Nobody reads the front page.",
        "I'll write all the articles myself.",
        "Good idea, I'll bring them on Tuesday.",
        "The mistakes are not important.",
      ],
      answer: 4,
      clue: "Why don't you show them last year's front pages at the next meeting?",
      explanation:
        "여자가 지난해 1면을 보여 주라고 제안했으므로, 화요일에 가져오겠다는 ④가 가장 자연스럽다.",
      translation: [
        "W: 현우야, 학교 신문은 어떻게 돼 가?",
        "M: 기사 세 개는 썼는데 1면이 비어 있어.",
        "W: 보통 1면이 제일 쉽지 않아?",
        "M: 그래야 하는데 아무도 쓰려고 안 해.",
        "W: 왜 다들 그걸 피해?",
        "M: 학교 전체가 읽으니까 틀릴까 봐 무서운 거지.",
        "W: 인쇄 전에 네가 다 확인한다고 말해 줬어?",
        "M: 말은 하는데 여전히 망설여.",
        "W: 어쩌면 1면 기사가 어떤 건지 몰라서일 수도 있어.",
        "M: 두려움보다 그게 더 맞는 말 같아.",
        "W: 다음 모임 때 작년 1면들을 보여 주는 건 어때?",
        "M: 좋은 생각이야, 화요일에 가져올게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Nayoung, you've been carrying that thick notebook all week."],
        ["W", "It's my reading log. Every book gets one page."],
        ["M", "What do you write on that page?"],
        ["W", "Three sentences about what stayed with me."],
        ["M", "Only three? I would want to write much more."],
        ["W", "I tried that at first and stopped after two books."],
        ["M", "So the short form is what keeps you going."],
        ["W", "Exactly. A page I can finish is a page I will finish."],
        ["M", "Could you show me one of those pages?"],
      ],
      choices: [
        "Sure, open it to the last one.",
        "I don't keep a notebook.",
        "You should write ten pages.",
        "I stopped reading books.",
        "The notebook is not mine.",
      ],
      answer: 1,
      clue: "Could you show me one of those pages?",
      explanation:
        "남자가 한 쪽 보여 달라고 했으므로, 마지막 쪽을 펼쳐 보라는 ①이 가장 자연스럽다.",
      translation: [
        "M: 나영아, 일주일 내내 그 두꺼운 공책을 들고 다니네.",
        "W: 독서 기록장이야. 책 한 권에 한 쪽씩 써.",
        "M: 그 쪽에는 뭘 써?",
        "W: 마음에 남은 것에 대해 세 문장.",
        "M: 세 문장만? 나라면 훨씬 더 쓰고 싶을 텐데.",
        "W: 처음엔 그렇게 했다가 두 권 만에 그만뒀어.",
        "M: 그러니까 짧게 쓰는 게 계속하게 만드는 거구나.",
        "W: 맞아. 끝낼 수 있는 한 쪽이 결국 끝내는 한 쪽이야.",
        "M: 그 쪽 하나만 보여 줄래?",
        "W: 그럼, 마지막 쪽을 펼쳐 봐.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Jisu가 Minjae에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Jisu : ________________",
      lines: [
        [
          "W",
          "Jisu and Minjae are members of the same debate team. " +
            "They are preparing for a match that takes place next Monday afternoon. " +
            "Minjae has written a long opening speech and reads it out to Jisu. " +
            "The argument is clear, but he reads for almost six minutes. " +
            "The rules of the match allow only three minutes for an opening speech, " +
            "and a speaker who goes over time is stopped in the middle of a sentence. " +
            "Jisu wants to tell him that the speech has to be cut down to half its length. " +
            "In this situation, what would Jisu most likely say to Minjae?",
        ],
      ],
      choices: [
        "Your argument is hard to follow.",
        "Let's change the topic completely.",
        "You should speak much more slowly.",
        "The match was moved to Tuesday.",
        "It's strong, but you need to cut it in half.",
      ],
      answer: 5,
      clue: "Jisu wants to tell him that the speech has to be cut down to half its length.",
      explanation:
        "내용은 좋지만 3분 규정에 맞게 절반으로 줄여야 한다는 뜻이므로 ⑤가 가장 적절하다.",
      translation: [
        "W: 지수와 민재는 같은 토론 팀입니다. 두 사람은 다음 주 월요일 오후에 있을 경기를 준비하고 있습니다. 민재는 긴 첫 발언문을 써서 지수에게 읽어 줍니다. 주장은 분명하지만 읽는 데 거의 6분이 걸립니다. 경기 규칙은 첫 발언에 3분만 허용하고, 시간을 넘긴 사람은 문장 도중에 제지당합니다. 지수는 발언문을 절반 길이로 줄여야 한다고 말하고 싶습니다. 이런 상황에서 지수가 민재에게 할 말로 가장 적절한 것은 무엇일까요?",
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
            "The work is done by yeast, a living thing far too small to see. " +
            "When you mix flour and water, the yeast finds sugar in the dough and begins to feed. " +
            "As it feeds it gives off carbon dioxide, the same gas you breathe out. " +
            "That gas cannot escape, because the dough has been kneaded " +
            "until long ribbons of protein form a stretchy net through it. " +
            "The bubbles push against that net, and the whole lump slowly swells. " +
            "In the oven the heat makes the trapped gas expand once more, " +
            "and then the heat kills the yeast and hardens the net around every bubble. " +
            "What you finally cut into is a fixed picture of gas that was moving an hour ago.",
        ],
      ],
      choices: [
        "how wheat is grown and milled into flour",
        "why yeast makes bread dough rise and set",
        "how ovens keep an even temperature",
        "why some breads taste sweeter than others",
        "how bakers decide on the shape of a loaf",
      ],
      answer: 2,
      clue: "As it feeds it gives off carbon dioxide, the same gas you breathe out.",
      explanation:
        "여자는 효모가 당분을 먹고 이산화탄소를 내며 반죽의 그물이 그 기포를 가두어 빵이 부풀고 굳는 과정을 설명한다. 따라서 답은 ②이다.",
      translation: [
        "W: 안녕하세요, 여러분. 오늘은 빵이 왜 부푸는지 이야기하려 합니다. 그 일은 눈으로 보기에 너무 작은 생물인 효모가 합니다. 밀가루와 물을 섞으면 효모가 반죽 속 당분을 찾아 먹기 시작합니다. 먹으면서 이산화탄소를 내는데, 이것은 우리가 내쉬는 것과 같은 기체입니다. 그 기체는 빠져나가지 못합니다. 반죽을 치대는 동안 긴 단백질 가닥이 잘 늘어나는 그물을 이루기 때문입니다. 기포가 그 그물을 밀면서 덩어리 전체가 천천히 부풉니다. 오븐 안에서는 열이 갇힌 기체를 한 번 더 팽창시키고, 이어 열이 효모를 죽이고 기포마다 그물을 굳힙니다. 우리가 자르는 빵은 한 시간 전에 움직이던 기체가 그대로 멈춘 그림입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["W", "Today I want to talk about why bread rises."],
        ["W", "The work is done by yeast, a living thing far too small to see."],
        ["W", "As it feeds it gives off carbon dioxide, the same gas you breathe out."],
        ["W", "Long ribbons of protein form a stretchy net through the dough."],
        ["W", "In the oven the heat kills the yeast and hardens the net around every bubble."],
      ],
      choices: [
        "yeast being too small to see",
        "carbon dioxide given off by yeast",
        "a stretchy net of protein in the dough",
        "the heat of the oven killing the yeast",
        "the price of flour in different seasons",
      ],
      answer: 5,
      clue: "The work is done by yeast, a living thing far too small to see.",
      explanation:
        "효모가 눈에 보이지 않을 만큼 작다는 것, 효모가 내는 이산화탄소, 단백질 그물, 오븐의 열이 효모를 죽인다는 것은 언급되지만 밀가루 값은 언급되지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
