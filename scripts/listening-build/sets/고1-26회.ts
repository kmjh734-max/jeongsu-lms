/** 고1 듣기 26회 — 사람이 직접 쓴 회차 (2026-09-25) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 26회",
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
          "Good afternoon, everyone. This is Ms. Ryu, the school nurse. " +
            "I want to talk about the way students are using the health room. " +
            "Since September, about fifteen students a day come in to lie down, " +
            "and almost half of them come during the same two periods, right after lunch. " +
            "We only have four beds, so students who are genuinely unwell " +
            "are sometimes told to come back later. " +
            "From next week, please come to the health room " +
            "only if you cannot stay in class, not simply because you are tired. " +
            "If you are tired, the reading corner in the library is open all day " +
            "and nobody will ask you to leave. " +
            "The beds have to stay for the students who need them. Thank you.",
        ],
      ],
      choices: [
        "보건실 운영 시간 변경을 알리려고",
        "건강 검진 일정을 안내하려고",
        "도서관 휴게 공간 신설을 알리려고",
        "점심시간 변경을 알리려고",
        "보건실은 꼭 필요한 경우에만 이용해 달라고 하려고",
      ],
      answer: 5,
      clue: "From next week, please come to the health room only if you cannot stay in class, not simply because you are tired.",
      explanation:
        "여자는 침대가 넷뿐이라며 수업에 있을 수 없는 경우에만 보건실에 와 달라고 부탁한다. 따라서 답은 ⑤이다.",
      translation: [
        "W: 여러분, 안녕하세요. 보건 교사 류입니다. 학생들이 보건실을 쓰는 방식에 대해 말씀드리려 합니다. 9월부터 하루에 열다섯 명쯤이 누우러 오고, 그중 절반 가까이가 점심 직후 같은 두 교시에 몰립니다. 침대는 넷뿐이라서, 정말 아픈 학생이 나중에 다시 오라는 말을 듣는 일이 생깁니다. 다음 주부터는 그저 피곤해서가 아니라 수업에 있을 수 없을 때만 보건실에 와 주세요. 피곤하다면 도서관 독서 코너가 하루 종일 열려 있고 아무도 나가라고 하지 않습니다. 침대는 그것이 필요한 학생들에게 남겨 두어야 합니다. 감사합니다.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 남자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Jinho, I've been studying in the café near the station every day."],
        ["M", "Every day? How long do you stay?"],
        ["W", "Four hours, usually. It's never boring there."],
        ["M", "How much of those four hours do you actually work?"],
        ["W", "Hard to say. I look up whenever the door opens."],
        ["M", "And the door opens how often?"],
        ["W", "Constantly. It's a busy place."],
        ["M", "So you're paying for a room that interrupts you."],
        ["W", "But the library is too quiet. I fall asleep there."],
        ["M", "That's a different problem. Fix it with the hour, not the room."],
        ["W", "You mean go earlier?"],
        ["M", "Go at ten, not at three. A quiet room is only boring when you're tired."],
      ],
      choices: [
        "공부는 조용한 곳에서 해야 한다",
        "카페에서 공부하면 안 된다",
        "졸리는 것은 장소가 아니라 시간을 바꿔 풀어야 한다",
        "공부 시간은 길수록 좋다",
        "집중은 훈련으로 늘어난다",
      ],
      answer: 3,
      clue: "Go at ten, not at three. A quiet room is only boring when you're tired.",
      explanation:
        "남자는 조용한 방이 지루한 것은 피곤할 때뿐이라며, 장소가 아니라 가는 시간을 바꾸라고 말한다. 따라서 답은 ③이다.",
      translation: [
        "W: 진호야, 나 요즘 매일 역 근처 카페에서 공부해.",
        "M: 매일? 얼마나 있어?",
        "W: 보통 네 시간. 거기선 지루하지가 않아.",
        "M: 그 네 시간 중에 실제로 몇 시간이나 해?",
        "W: 말하기 어려워. 문이 열릴 때마다 고개를 들어.",
        "M: 문이 얼마나 자주 열리는데?",
        "W: 계속. 사람이 많은 곳이야.",
        "M: 그럼 너를 끊어 놓는 방에 돈을 내고 있는 거네.",
        "W: 그런데 도서관은 너무 조용해. 거기선 졸아.",
        "M: 그건 다른 문제야. 방이 아니라 시간으로 풀어.",
        "W: 더 일찍 가라는 말이야?",
        "M: 3시 말고 10시에 가. 조용한 방은 피곤할 때만 지루해.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "When people argue about a decision, they usually argue about the answer. " +
            "Should we take this route or that one. Should the deadline be Friday or Monday. " +
            "What almost never gets said out loud is what each person is trying to protect. " +
            "One person is protecting the schedule. " +
            "Another is protecting the quality of the work. " +
            "A third is protecting a promise they made to someone outside the room. " +
            "Every one of those is reasonable, " +
            "and none of them is visible in a sentence about Friday or Monday. " +
            "So the argument goes in circles, " +
            "because the people in it are not actually disagreeing about dates. " +
            "The fastest way out is almost never a better argument for your date. " +
            "It is asking what the other person is afraid of losing.",
        ],
      ],
      choices: [
        "의견이 갈릴 때는 서로 무엇을 지키려는지 물어야 한다",
        "결정은 빨리 내려야 한다",
        "회의는 짧게 해야 한다",
        "일정은 여유 있게 잡아야 한다",
        "약속은 반드시 지켜야 한다",
      ],
      answer: 1,
      clue: "It is asking what the other person is afraid of losing.",
      explanation:
        "여자는 사람들이 날짜가 아니라 각자 지키려는 것 때문에 부딪힌다며, 상대가 무엇을 잃을까 두려워하는지 물으라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 사람들이 어떤 결정을 두고 다툴 때는 보통 답을 두고 다툽니다. 이 길로 갈까 저 길로 갈까. 마감을 금요일로 할까 월요일로 할까. 거의 입 밖으로 나오지 않는 것은 각자가 무엇을 지키려 하는가입니다. 한 사람은 일정을 지키고 있습니다. 다른 사람은 일의 완성도를 지키고 있습니다. 또 한 사람은 이 방 밖의 누군가에게 한 약속을 지키고 있습니다. 그 어느 것도 이상하지 않고, 금요일이냐 월요일이냐라는 문장 안에서는 어느 것도 보이지 않습니다. 그래서 논쟁은 제자리를 돕니다. 그 안의 사람들이 실은 날짜를 두고 어긋나 있는 것이 아니기 때문입니다. 가장 빨리 빠져나오는 길은 거의 언제나 내 날짜에 대한 더 좋은 논거가 아닙니다. 상대가 무엇을 잃을까 두려워하는지 묻는 것입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Jinho, is this the corner you set up for the board game club?"],
        ["M", "Yes, we finished it just before the term started."],
        ["W", "There's a round table in the middle of the room."],
        ["M", "Round is better. Nobody sits at the head of it."],
        ["W", "And a tall shelf of boxes stands against the wall."],
        ["M", "Forty games, all donated by the members."],
        ["W", "I count four stools around the table."],
        ["M", "There are five. One is pushed under the table."],
        ["W", "The paper lamp hanging above looks warm."],
        ["M", "It's the only light we turn on in the evening."],
        ["W", "And a whiteboard leans against the shelf."],
        ["M", "We keep the scores on it between sessions."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 3,
      clue: "There are five. One is pushed under the table.",
      explanation:
        "여자가 의자가 네 개라고 하자 남자가 다섯 개라고 바로잡는다. 그림에는 네 개가 그려져 있으므로 답은 ③이다.",
      figure: {
        kind: "scene",
        scene:
          "A board game club corner drawn as one wide picture, clean black line art on white, no writing or letters or numbers anywhere. " +
          "A ROUND TABLE stands in the middle of the room. " +
          "A TALL SHELF packed with stacked game boxes stands against the back wall. " +
          "EXACTLY FOUR ROUND STOOLS stand around the table, spaced well apart so all four are easy to count. " +
          "A PAPER LANTERN LAMP hangs from the ceiling above the table. " +
          "A blank WHITEBOARD leans against the side of the shelf.",
      },
      translation: [
        "W: 진호야, 이게 보드게임 동아리로 꾸민 자리야?",
        "M: 응, 학기 시작 직전에 다 끝냈어.",
        "W: 방 가운데 둥근 탁자가 있네.",
        "M: 둥근 게 나아. 아무도 상석에 앉지 않으니까.",
        "W: 그리고 벽에 상자가 가득한 높은 선반이 있어.",
        "M: 마흔 개야. 부원들이 다 기증한 거고.",
        "W: 탁자 둘레에 의자가 네 개 보여.",
        "M: 다섯 개야. 하나는 탁자 밑으로 밀어 넣었어.",
        "W: 위에 걸린 종이 등이 따뜻해 보인다.",
        "M: 저녁엔 그 불만 켜.",
        "W: 그리고 선반에 화이트보드가 기대어 있네.",
        "M: 모임 사이사이 점수를 거기에 적어 둬.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 남자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["W", "Jinho, the parents' open class is at ten tomorrow."],
        ["M", "I know. Are the name cards on the desks?"],
        ["W", "All thirty. I laid them out after school."],
        ["M", "Good. And the handouts for the parents?"],
        ["W", "Copied and stapled. They're in the box by the door."],
        ["M", "Then what's still open?"],
        ["W", "The classroom projector shows everything in green."],
        ["M", "Is the cable loose again?"],
        ["W", "Probably. It did this in March and the office fixed it in five minutes."],
        ["M", "Is the office still open tonight?"],
        ["W", "Until six. But I'm meeting the homeroom teacher about the seating."],
        ["M", "Then I'll take the projector to the office before six."],
      ],
      choices: [
        "이름표 놓기",
        "프로젝터 맡기기",
        "유인물 복사하기",
        "자리 배치 정하기",
        "교실 청소하기",
      ],
      answer: 2,
      clue: "Then I'll take the projector to the office before six.",
      explanation:
        "이름표와 유인물은 끝났고 여자는 담임 선생님을 만나야 하므로, 남자가 6시 전에 프로젝터를 행정실에 맡기기로 한다. 따라서 답은 ②이다.",
      translation: [
        "W: 진호야, 학부모 공개 수업이 내일 10시야.",
        "M: 알아. 책상에 이름표는 놨어?",
        "W: 서른 개 다. 방과 후에 놓아 뒀어.",
        "M: 좋아. 학부모님께 드릴 유인물은?",
        "W: 복사해서 철했어. 문 옆 상자에 있어.",
        "M: 그럼 아직 남은 게 뭐야?",
        "W: 교실 프로젝터가 화면을 전부 초록색으로 띄워.",
        "M: 또 선이 헐거워졌어?",
        "W: 아마도. 3월에도 그랬는데 행정실에서 5분 만에 고쳐 주셨어.",
        "M: 행정실 오늘 밤에도 열어?",
        "W: 6시까지. 그런데 나는 자리 배치 때문에 담임 선생님을 만나야 해.",
        "M: 그럼 내가 6시 전에 프로젝터를 행정실에 갖다 줄게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 여자가 지불할 금액을 고르시오.",
      lines: [
        ["M", "Welcome to Woodrow Music Shop. What can I help you with?"],
        ["W", "Five sets of guitar strings and two capos, please."],
        ["M", "String sets are twelve dollars each and capos are fifteen."],
        ["W", "So sixty dollars plus thirty."],
        ["M", "Ninety in total. Would you like a case for each capo?"],
        ["W", "How much are the cases?"],
        ["M", "Six dollars each, so twelve for two."],
        ["W", "We'll leave the cases. They're not necessary."],
        ["M", "No problem. Are you buying for a school club?"],
        ["W", "Yes, here's our club card."],
        ["M", "Then I can take thirty percent off the strings, but not the capos."],
        ["W", "Perfect. I'll pay by card."],
      ],
      choices: ["$63.00", "$78.00", "$84.00", "$90.00", "$72.00"],
      answer: 5,
      clue: "Then I can take thirty percent off the strings, but not the capos.",
      explanation:
        "줄 5세트 60달러에서 30퍼센트를 빼면 42달러이고, 할인이 안 되는 카포 2개 30달러를 더하면 72달러이다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 우드로 악기점입니다. 무엇을 도와드릴까요?",
        "W: 기타 줄 다섯 세트랑 카포 두 개 주세요.",
        "M: 줄 세트는 하나에 12달러, 카포는 15달러입니다.",
        "W: 그럼 60달러에 30달러네요.",
        "M: 모두 90달러입니다. 카포 케이스도 하시겠어요?",
        "W: 케이스는 얼마예요?",
        "M: 하나에 6달러라서 두 개면 12달러입니다.",
        "W: 케이스는 뺄게요. 꼭 필요하진 않아요.",
        "M: 괜찮습니다. 학교 동아리에서 쓰시는 건가요?",
        "W: 네, 여기 동아리 카드요.",
        "M: 그럼 줄값에서 30퍼센트를 빼 드립니다. 카포는 빼 드릴 수 없어요.",
        "W: 좋네요. 카드로 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 교내 마라톤에 참가하지 않는 이유를 고르시오.",
      lines: [
        ["W", "Jinho, you're not on the sign-up sheet for the school marathon."],
        ["M", "I decided not to run this year."],
        ["W", "Is your knee bothering you again?"],
        ["M", "The knee's been fine since the summer."],
        ["W", "Then is it the distance? They made it ten kilometers."],
        ["M", "Ten is fine. I run that on Sundays anyway."],
        ["W", "So what is it?"],
        ["M", "I'm one of the timekeepers at the finish line."],
        ["W", "You volunteered for that?"],
        ["M", "Mr. Baek asked, and nobody else could do the whole three hours."],
      ],
      choices: [
        "무릎이 아파서",
        "거리가 너무 길어서",
        "기록 담당을 맡아서",
        "가족 행사가 있어서",
        "시험 준비를 해야 해서",
      ],
      answer: 3,
      clue: "I'm one of the timekeepers at the finish line.",
      explanation:
        "무릎도 괜찮고 거리도 문제가 아니며, 결승선에서 기록을 재는 일을 맡았기 때문이다. 따라서 답은 ③이다.",
      translation: [
        "W: 진호야, 교내 마라톤 신청서에 네 이름이 없네.",
        "M: 올해는 안 뛰기로 했어.",
        "W: 무릎이 또 아파?",
        "M: 무릎은 여름부터 괜찮아.",
        "W: 그럼 거리 때문이야? 10킬로미터로 늘렸잖아.",
        "M: 10킬로는 괜찮아. 어차피 일요일마다 그만큼 뛰어.",
        "W: 그럼 뭔데?",
        "M: 내가 결승선 기록 담당 중 한 명이야.",
        "W: 자원한 거야?",
        "M: 백 선생님이 부탁하셨는데, 세 시간을 통째로 맡을 사람이 나밖에 없었어.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, Lakeside Art Class에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["W", "Jinho, have you seen the notice for the Lakeside Art Class?"],
        ["M", "I saw the poster in the hallway. When does it run?"],
        ["W", "Six Saturdays, starting on the fourth of March."],
        ["M", "Six weeks is a decent commitment. Where is it held?"],
        ["W", "At the community center by the lake, the one with the glass roof."],
        ["M", "I know that building. What do they actually teach?"],
        ["W", "Watercolor for the first three weeks, then ink drawing."],
        ["M", "I've never used ink. Is that a problem?"],
        ["W", "No, it's for beginners. They say no experience is needed."],
        ["M", "Do we have to bring our own materials?"],
        ["W", "Paper and brushes are provided. You only bring an apron."],
        ["M", "Then I'll sign up this week."],
      ],
      choices: ["수강료", "운영 기간", "장소", "수업 내용", "준비물"],
      answer: 1,
      clue: "수강료는 대화에서 언급되지 않았다.",
      explanation:
        "기간(3월 4일부터 여섯 번의 토요일), 장소(호숫가 주민 센터), 수업 내용(수채화와 잉크 드로잉), 준비물(앞치마)은 언급되지만 수강료는 언급되지 않았다. 따라서 답은 ①이다.",
      translation: [
        "W: 진호야, 레이크사이드 미술 수업 안내문 봤어?",
        "M: 복도에서 포스터 봤어. 언제 해?",
        "W: 3월 4일부터 여섯 번의 토요일.",
        "M: 6주면 꽤 긴데. 어디서 해?",
        "W: 호숫가 주민 센터에서. 유리 지붕 있는 그 건물.",
        "M: 그 건물 알아. 뭘 가르치는데?",
        "W: 처음 3주는 수채화, 그다음엔 잉크 드로잉.",
        "M: 잉크는 안 써 봤는데. 괜찮을까?",
        "W: 응, 초보자용이야. 경험 없어도 된대.",
        "M: 재료는 직접 가져가야 해?",
        "W: 종이랑 붓은 준대. 앞치마만 가져가면 돼.",
        "M: 그럼 이번 주에 신청할게.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "Mill Street Skate Park에 관한 다음 내용을 듣고, 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Let me tell you about the Mill Street Skate Park. " +
            "It opened in 2018 on the site of an old parking lot beside the river. " +
            "The park is open from eight in the morning until nine at night, every day of the year. " +
            "There is no entrance fee, and no booking is needed at any time. " +
            "Helmets are required for everyone under eighteen, and the park lends them out for free. " +
            "Beginners' sessions run on Sunday mornings, led by volunteers from the local club. " +
            "Bicycles are not allowed inside the bowl area, only skateboards and scooters.",
        ],
      ],
      choices: [
        "옛 주차장 자리에 지어졌다",
        "일 년 내내 매일 연다",
        "입장료가 없다",
        "헬멧을 직접 가져가야 한다",
        "일요일 아침에 초보자 강습이 있다",
      ],
      answer: 4,
      clue: "Helmets are required for everyone under eighteen, and the park lends them out for free.",
      explanation:
        "헬멧은 공원에서 무료로 빌려준다고 했으므로 직접 가져가야 한다는 ④는 내용과 다르다. 따라서 답은 ④이다.",
      translation: [
        "M: 밀스트리트 스케이트 공원을 소개해 드리겠습니다. 2018년에 강가 옛 주차장 자리에 문을 열었습니다. 공원은 일 년 내내 매일 아침 8시부터 밤 9시까지 엽니다. 입장료는 없고 언제든 예약도 필요 없습니다. 열여덟 살 미만은 모두 헬멧을 써야 하는데, 공원에서 무료로 빌려줍니다. 초보자 강습은 일요일 아침에 있고, 지역 동아리 자원봉사자들이 이끕니다. 보울 구역에는 자전거가 들어갈 수 없고 스케이트보드와 킥보드만 됩니다.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 두 사람이 구입할 헤드폰을 고르시오.",
      lines: [
        ["W", "Jinho, let's choose headphones for the club's recording work."],
        ["M", "Five models listed. Wired or wireless?"],
        ["W", "Wired. Wireless adds a delay when we monitor."],
        ["M", "Good point. Do we need the closed-back type?"],
        ["W", "Yes. Open-back leaks sound into the microphone."],
        ["M", "Agreed. And the price? The club left us a hundred thousand won."],
        ["W", "So a hundred thousand is the ceiling."],
        ["M", "Then only one model clears all three."],
        ["W", "Let's order it before the club budget closes."],
        ["M", "I'll place the order after dinner."],
        ["W", "Send me the receipt so I can log it."],
        ["M", "Will do. It should arrive by Thursday."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "Wired. Wireless adds a delay when we monitor.",
      explanation:
        "유선이고, 밀폐형이며, 10만 원 이하인 것을 고른다. 세 조건을 모두 채우는 것은 ②이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Type: Wireless / Back: Closed / Price: 85,000 won" },
          { no: 2, label: "②", value: "Type: Wired / Back: Closed / Price: 95,000 won" },
          { no: 3, label: "③", value: "Type: Wired / Back: Open / Price: 60,000 won" },
          { no: 4, label: "④", value: "Type: Wired / Back: Closed / Price: 145,000 won" },
          { no: 5, label: "⑤", value: "Type: Wireless / Back: Open / Price: 70,000 won" },
        ],
      },
      translation: [
        "W: 진호야, 동아리 녹음 작업에 쓸 헤드폰 고르자.",
        "M: 다섯 종류 있네. 유선이야, 무선이야?",
        "W: 유선. 무선은 모니터할 때 지연이 생겨.",
        "M: 맞는 말이야. 밀폐형이어야 할까?",
        "W: 응. 개방형은 소리가 새서 마이크에 들어가.",
        "M: 동의해. 값은? 동아리에서 10만 원 남겨 줬어.",
        "W: 그럼 10만 원이 한계네.",
        "M: 그럼 세 조건 다 넘는 건 하나뿐이야.",
        "W: 동아리 예산 마감 전에 주문하자.",
        "M: 저녁 먹고 주문할게.",
        "W: 기록해야 하니까 영수증 보내 줘.",
        "M: 그럴게. 목요일까지는 올 거야.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["M", "Sujin, is the computer lab open during the club fair?"],
        ["W", "It's closed, because the fair uses that hallway."],
        ["M", "I need to print my club poster this afternoon."],
        ["W", "Use the library printer. It takes the same student card."],
      ],
      choices: [
        "The library has no printer.",
        "I already printed the poster.",
        "My student card expired.",
        "I don't need to print anything.",
        "I'll print it in the library, then.",
      ],
      answer: 5,
      clue: "Use the library printer. It takes the same student card.",
      explanation:
        "여자가 도서관 인쇄기를 쓰라고 했으므로, 거기서 인쇄하겠다는 ⑤가 가장 자연스럽다.",
      translation: [
        "M: 수진아, 동아리 박람회 때 컴퓨터실 열어?",
        "W: 닫아. 박람회가 그 복도를 써.",
        "M: 오늘 오후에 동아리 포스터를 뽑아야 하는데.",
        "W: 도서관 인쇄기를 써. 같은 학생증으로 돼.",
        "M: 그럼 도서관에서 뽑을게.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["W", "Jinho, my gym locker won't lock properly anymore."],
        ["M", "Is it the dial, or the door itself?"],
        ["W", "The dial turns fine. The door won't line up."],
        ["M", "Then it's bent. Report it at the gym office and they'll reassign you."],
      ],
      choices: [
        "My locker locks fine.",
        "I don't use the gym at all.",
        "I'll report it at the office.",
        "The dial is completely broken.",
        "I'll buy my own lock.",
      ],
      answer: 3,
      clue: "Then it's bent. Report it at the gym office and they'll reassign you.",
      explanation:
        "남자가 체육관 사무실에 알리면 자리를 바꿔 준다고 했으므로, 사무실에 알리겠다는 ③이 가장 자연스럽다.",
      translation: [
        "W: 진호야, 체육관 사물함이 제대로 안 잠겨.",
        "M: 다이얼 문제야, 문 자체 문제야?",
        "W: 다이얼은 잘 돌아. 문이 안 맞아.",
        "M: 그럼 휘었네. 체육관 사무실에 알리면 다른 자리로 바꿔 줘.",
        "W: 사무실에 알릴게.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Jinho, you've dropped out of the swimming class twice now."],
        ["M", "I always start well and then stop after two weeks."],
        ["W", "What happens in week three?"],
        ["M", "Everyone else moves up a lane and I stay where I am."],
        ["W", "So you leave rather than be the slowest."],
        ["M", "That's about right, though I'd never have said it."],
        ["W", "How long had the others been swimming before that class?"],
        ["M", "Some of them since primary school."],
        ["W", "So you're measuring two weeks against eight years."],
        ["M", "That does sound unfair when you say it aloud."],
        ["W", "Go back and compare yourself to your own first week instead."],
      ],
      choices: [
        "I'll go back next Tuesday.",
        "I'll wait until I'm faster.",
        "I've never taken a swimming class.",
        "I'm the fastest in the lane.",
        "I'd rather learn on my own.",
      ],
      answer: 1,
      clue: "Go back and compare yourself to your own first week instead.",
      explanation:
        "여자가 다시 가서 자신의 첫 주와 견주어 보라고 했으므로, 다음 주 화요일에 돌아가겠다는 ①이 가장 자연스럽다.",
      translation: [
        "W: 진호야, 수영 강습을 벌써 두 번이나 그만뒀네.",
        "M: 시작은 늘 좋은데 2주쯤 되면 멈춰.",
        "W: 3주째에 무슨 일이 있는데?",
        "M: 다들 한 레인씩 올라가는데 나만 그대로야.",
        "W: 그럼 제일 느린 사람이 되느니 나가는 거구나.",
        "M: 대충 맞아. 내 입으로는 말 안 했겠지만.",
        "W: 다른 사람들은 그 강습 전에 얼마나 수영했는데?",
        "M: 어떤 애들은 초등학교 때부터.",
        "W: 그럼 2주를 8년과 견주고 있는 거네.",
        "M: 소리 내어 말하니까 불공평하게 들린다.",
        "W: 돌아가서 네 첫 주와 견줘 봐.",
        "M: 다음 주 화요일에 돌아갈게.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Sujin, you've been saying yes to every tutoring request."],
        ["W", "They only ask because they're stuck. I can't refuse that."],
        ["M", "How many hours went to tutoring last week?"],
        ["W", "Eleven, I think. Maybe twelve."],
        ["M", "And how many to your own subjects?"],
        ["W", "Fewer than that, which I know is backwards."],
        ["M", "Do they ask because you're the only one who can help?"],
        ["W", "No. They ask because I always say yes."],
        ["M", "Then the asking will keep growing until you set a shape."],
        ["W", "What kind of shape?"],
        ["M", "Pick two afternoons, tell everyone, and keep the rest for yourself."],
      ],
      choices: [
        "I'll keep helping whenever asked.",
        "Nobody ever asks me for help.",
        "I'll stop tutoring completely.",
        "I'll set two afternoons and say so.",
        "Eleven hours is not very many.",
      ],
      answer: 4,
      clue: "Pick two afternoons, tell everyone, and keep the rest for yourself.",
      explanation:
        "남자가 오후 두 번을 정해 알리고 나머지는 자기 몫으로 두라고 했으므로, 두 오후를 정해 알리겠다는 ④가 가장 자연스럽다.",
      translation: [
        "M: 수진아, 너 과외 부탁을 다 들어주더라.",
        "W: 막혔으니까 묻는 거잖아. 그걸 어떻게 거절해.",
        "M: 지난주에 과외에 몇 시간 썼어?",
        "W: 열한 시간쯤. 열두 시간일 수도.",
        "M: 네 과목에는 몇 시간 썼는데?",
        "W: 그보다 적어. 거꾸로 된 거 알아.",
        "M: 너만 도울 수 있어서 묻는 거야?",
        "W: 아니. 내가 늘 그러겠다고 하니까 묻는 거지.",
        "M: 그럼 네가 형태를 정하기 전까지 부탁은 계속 늘어날 거야.",
        "W: 어떤 형태?",
        "M: 오후 두 번을 정해서 모두에게 알리고, 나머지는 네 몫으로 둬.",
        "W: 오후 두 번을 정해서 알릴게.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Yerin이 Sungmin에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Yerin : ________________",
      lines: [
        [
          "W",
          "Yerin and Sungmin are running the water station at the school sports day. " +
            "Sungmin has filled three hundred paper cups and lined them up on the table, " +
            "which took him the whole first hour and looks impressive. " +
            "Yerin notices that the table sits about twenty meters past the finish line, " +
            "around a corner where runners cannot see it. " +
            "Last year the same thing happened and half the cups were still full at the end. " +
            "The table is light and two people can carry it in a minute, " +
            "and there is an empty spot right at the finish line where everyone passes. " +
            "She does not want him to think the filling was wasted, " +
            "since the cups are exactly what is needed once the table can be seen. " +
            "She wants to tell him to move the table to the finish line. " +
            "In this situation, what would Yerin most likely say to Sungmin?",
        ],
      ],
      choices: [
        "We should fill another hundred cups.",
        "Let's move the table to the finish line.",
        "Let's pour the water back into the bottles.",
        "We should ask the runners to come here.",
        "Let's close the water station early.",
      ],
      answer: 2,
      clue: "She wants to tell him to move the table to the finish line.",
      explanation:
        "예린이는 탁자를 결승선으로 옮기자고 말하려 하므로 ②가 가장 적절하다.",
      translation: [
        "W: 예린이와 성민이는 학교 체육대회 급수대를 맡고 있습니다. 성민이는 종이컵 삼백 개에 물을 채워 탁자에 늘어놓았는데, 첫 한 시간을 꼬박 썼고 보기에도 훌륭합니다. 예린이는 그 탁자가 결승선에서 20미터쯤 지나, 달리는 사람들이 볼 수 없는 모퉁이 뒤에 있다는 것을 알아챕니다. 작년에도 같은 일이 있었고 끝날 때까지 컵 절반이 그대로 남았습니다. 탁자는 가벼워서 두 사람이면 1분이면 옮길 수 있고, 모두가 지나가는 결승선 바로 옆에 빈자리가 있습니다. 예린이는 성민이의 수고가 헛되었다고 여기게 하고 싶지 않습니다. 탁자가 보이기만 하면 그 컵들이야말로 꼭 필요한 것이기 때문입니다. 예린이는 탁자를 결승선으로 옮기자고 말하고 싶습니다. 이런 상황에서 예린이가 성민이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 남자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, everyone. Today I want to talk about why ice floats. " +
            "This sounds like a small fact, but almost nothing else behaves this way. " +
            "For nearly every substance, the solid form is denser than the liquid, " +
            "because cooling packs the particles closer together. " +
            "Water does that too, right down to four degrees. " +
            "Below four, something unusual takes over. " +
            "Each water molecule starts locking to its neighbours at fixed angles, " +
            "building an open structure with empty space inside it. " +
            "The same number of molecules now takes up more room, " +
            "so ice is lighter than the water it came from. " +
            "This is why lakes freeze from the top down. " +
            "If ice sank, every lake would freeze solid from the bottom each winter, " +
            "and nothing living in it would survive.",
        ],
      ],
      choices: [
        "how lakes are formed in cold regions",
        "why water boils at a fixed temperature",
        "how fish survive in warm water",
        "why metals expand when heated",
        "why ice is less dense than liquid water",
      ],
      answer: 5,
      clue: "The same number of molecules now takes up more room, so ice is lighter than the water it came from.",
      explanation:
        "남자는 4도 아래에서 물 분자가 빈 공간이 있는 구조로 묶여 얼음이 더 가벼워진다고 설명한다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 안녕하세요, 여러분. 오늘은 얼음이 왜 뜨는지 이야기하려 합니다. 작은 사실처럼 들리지만, 이렇게 행동하는 것은 거의 없습니다. 거의 모든 물질은 고체가 액체보다 밀도가 높습니다. 식으면 알갱이들이 더 촘촘히 모이기 때문이지요. 물도 4도까지는 그렇게 합니다. 4도 아래에서는 특이한 일이 일어납니다. 물 분자 하나하나가 이웃과 정해진 각도로 맞물리기 시작해, 안에 빈 공간이 있는 열린 구조를 짓습니다. 같은 수의 분자가 이제 더 많은 자리를 차지하고, 그래서 얼음은 그것이 나온 물보다 가볍습니다. 그래서 호수는 위에서부터 업니다. 얼음이 가라앉는다면 모든 호수가 겨울마다 바닥부터 통째로 얼어붙고, 그 안에 사는 어떤 것도 살아남지 못할 것입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "언급된 내용이 아닌 것은?",
      lines: [
        ["M", "Hello, everyone. Today I want to talk about why ice floats."],
        ["M", "For nearly every substance, the solid form is denser than the liquid, because cooling packs the particles closer together."],
        ["M", "Water does that too, right down to four degrees."],
        ["M", "Each water molecule starts locking to its neighbours at fixed angles, building an open structure with empty space inside it."],
        ["M", "The same number of molecules now takes up more room, so ice is lighter than the water it came from."],
        ["M", "This is why lakes freeze from the top down."],
      ],
      choices: [
        "most solids being denser than their liquids",
        "water behaving normally down to four degrees",
        "salt lowering the freezing point of water",
        "molecules locking at fixed angles",
        "lakes freezing from the top down",
      ],
      answer: 3,
      clue: "For nearly every substance, the solid form is denser than the liquid, because cooling packs the particles closer together.",
      explanation:
        "대부분의 고체가 액체보다 밀도가 높다는 것, 물이 4도까지는 보통처럼 행동한다는 것, 분자가 정해진 각도로 맞물린다는 것, 호수가 위에서부터 언다는 것은 언급되지만 소금이 어는점을 낮춘다는 것은 언급되지 않았다. 따라서 답은 ③이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
