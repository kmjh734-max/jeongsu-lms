/** 고1 듣기 46회 — 사람이 직접 쓴 회차 (2026-09-29) */
import type { SetSpec } from "../spec.ts";

export const spec: SetSpec = {
  title: "고1 46회",
  gradeLevel: "high1",
  speechSpeed: 0.8,
  folder: "고1 듣기",
  questions: [
    {
      order: 1,
      type: "목적 파악",
      instruction: "다음을 듣고, 남자가 하는 말의 목적으로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "M",
          "Good morning, students. This is the school library speaking. " +
            "Over the past month we have counted the books returned late, " +
            "and the number has grown to almost two hundred. " +
            "Rather than charging a fee, we are trying something different. " +
            "From next Monday until the end of the month, " +
            "any overdue book may be returned with no penalty at all. " +
            "We will not ask where it has been or why it is late. " +
            "Just place it in the box beside the library door. " +
            "Many of these books have been requested by other students, " +
            "some of whom have been waiting since the summer. " +
            "Please look in your locker, your bag and under your bed.",
        ],
      ],
      choices: [
        "연체 도서를 벌 없이 반납하는 기간을 알리려고",
        "도서관 이용 시간 변경을 알리려고",
        "새로 들어온 책을 소개하려고",
        "독서 행사 참가를 권하려고",
        "도서 구입 희망 신청을 받으려고",
      ],
      answer: 1,
      clue: "any overdue book may be returned with no penalty at all",
      explanation:
        "연체된 책을 벌 없이 반납할 수 있는 기간을 알리고 있다. 따라서 답은 ①이다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 학교 도서관입니다. 지난 한 달 동안 늦게 돌아온 책을 세어 보니 거의 200권에 이르렀습니다. 연체료를 매기는 대신 저희는 다른 방법을 써 보려 합니다. 다음 주 월요일부터 이번 달 말까지, 연체된 책은 어떤 벌도 없이 반납하실 수 있습니다. 어디에 있었는지, 왜 늦었는지 묻지 않겠습니다. 도서관 문 옆 상자에 넣어 주시기만 하면 됩니다. 이 책들 가운데 여러 권은 다른 학생들이 신청해 둔 것이고, 그중에는 여름부터 기다린 학생도 있습니다. 사물함과 가방, 침대 밑을 한번 살펴봐 주세요.",
      ].join("\n"),
    },
    {
      order: 2,
      type: "의견 파악",
      instruction: "대화를 듣고, 여자의 의견으로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Seoyul, you rewrote the whole group report by yourself."],
        ["W", "I rewrote it once, then sent it back to everyone."],
        ["M", "Wasn't it faster to just hand in your version?"],
        ["W", "Faster for me, useless for the other three."],
        ["M", "They'd still get the same grade either way."],
        ["W", "They'd get the grade without knowing what changed."],
        ["M", "Do they actually read your comments?"],
        ["W", "Two of them rewrote their own parts after reading."],
        ["M", "That's more work for you, though."],
        ["W", "An hour now saves them from the same mistake all year."],
        ["M", "Most people would just fix it and move on."],
        ["W", "Fixing someone's work teaches nothing; showing them does."],
        ["M", "I'll send mine back with notes next time."],
      ],
      choices: [
        "고쳐 주기보다 무엇을 고쳤는지 보여 주어야 한다",
        "조별 과제는 혼자 맡는 것이 빠르다",
        "보고서는 여러 번 고쳐 써야 한다",
        "성적보다 협동이 중요하다",
        "의견은 글로 남겨야 한다",
      ],
      answer: 1,
      clue: "Fixing someone's work teaches nothing; showing them does.",
      explanation:
        "여자는 고쳐 주는 것보다 무엇을 고쳤는지 보여 주는 것이 배움이 된다고 말한다. 따라서 답은 ①이다.",
      translation: [
        "M: 서율아, 조별 보고서를 너 혼자 다시 썼다며.",
        "W: 한 번 고쳐 쓰고 나서 다들한테 돌려보냈어.",
        "M: 그냥 네 것을 내는 게 빠르지 않았어?",
        "W: 나한테는 빠르지만 나머지 셋한테는 아무 소용이 없어.",
        "M: 어차피 성적은 똑같이 받잖아.",
        "W: 뭐가 바뀌었는지 모른 채 성적만 받는 거지.",
        "M: 네가 단 의견을 정말 읽어?",
        "W: 둘은 읽고 나서 자기 부분을 다시 썼어.",
        "M: 그래도 너한테는 일이 더 늘잖아.",
        "W: 지금 한 시간이면 1년 내내 같은 실수를 안 하게 돼.",
        "M: 대부분은 그냥 고치고 넘어갈 텐데.",
        "W: 남의 글을 고쳐 주면 아무것도 안 남아. 보여 줘야 남아.",
        "M: 다음엔 나도 의견을 달아서 돌려보낼게.",
      ].join("\n"),
    },
    {
      order: 3,
      type: "요지 파악",
      instruction: "다음을 듣고, 여자가 하는 말의 요지로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Students often ask me how to remember what they read. " +
            "The usual answer is to read it again, and again after that. " +
            "But rereading gives a feeling of familiarity, not of knowing. " +
            "The page looks recognizable, so the brain reports success. " +
            "Then the test arrives and nothing comes back. " +
            "The stronger method is uncomfortable: close the book " +
            "and write down everything you can remember, badly and incompletely. " +
            "What you fail to write is exactly what you have not learned, " +
            "and now you know where to look. " +
            "Reading feels like studying; recalling actually is.",
        ],
      ],
      choices: [
        "다시 읽기보다 책을 덮고 떠올려 봐야 남는다",
        "읽기 전에 목차를 훑어봐야 한다",
        "필기는 자기 말로 바꿔 써야 한다",
        "시험 직전 복습이 가장 효과적이다",
        "어려운 책부터 읽는 것이 좋다",
      ],
      answer: 1,
      clue: "Reading feels like studying; recalling actually is.",
      explanation:
        "다시 읽기보다 덮고 떠올려 적는 것이 실제 공부라고 말한다. 따라서 답은 ①이다.",
      translation: [
        "W: 학생들이 읽은 것을 어떻게 기억하느냐고 자주 묻습니다. 흔한 답은 다시 읽고, 그다음에 또 읽으라는 것입니다. 그러나 다시 읽기는 아는 느낌이 아니라 익숙한 느낌을 줍니다. 쪽이 낯익어 보이니 뇌는 잘되고 있다고 알립니다. 그러다 시험이 오면 아무것도 떠오르지 않습니다. 더 센 방법은 불편합니다. 책을 덮고 기억나는 것을 전부, 엉성하고 모자라게라도 적어 보는 것입니다. 적지 못한 것이 바로 익히지 못한 것이고, 이제 어디를 봐야 할지 알게 됩니다. 읽기는 공부처럼 느껴지고, 떠올리기는 실제로 공부입니다.",
      ].join("\n"),
    },
    {
      order: 4,
      type: "그림 불일치",
      instruction: "대화를 듣고, 그림에서 대화의 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        ["W", "Junho, is this the photo of the club room after you cleaned it?"],
        ["M", "Yes, the four of us worked on it all Saturday."],
        ["W", "There's a wide bulletin board on the back wall."],
        ["M", "We put up everyone's photos on it."],
        ["W", "And a square table stands in the middle."],
        ["M", "Actually it's a round table. The square one broke."],
        ["W", "I see two chairs pushed under the table."],
        ["M", "We keep the rest stacked in the corner."],
        ["W", "There's a tall plant beside the door."],
        ["M", "Minji waters it every Friday afternoon."],
        ["W", "And a small speaker sits on the shelf."],
        ["M", "That's for the music we play while we work."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 2,
      clue: "Actually it's a round table. The square one broke.",
      explanation:
        "가운데 탁자가 네모라고 했지만 둥근 탁자라고 했다. 따라서 답은 ②이다.",
      figure: {
        kind: "figure5",
        scene:
          "A small school club room, clean black line art on a plain white background, no writing or letters anywhere. " +
          "A WIDE BULLETIN BOARD covered with small photos hangs on the back wall. " +
          "A SQUARE TABLE stands in the middle of the room. " +
          "TWO CHAIRS are pushed under the table. " +
          "A TALL POTTED PLANT stands beside the door on the left. " +
          "A SMALL SPEAKER sits on a shelf at the right.",
        spots: [
          [0.5, 0.18],
          [0.48, 0.58],
          [0.36, 0.8],
          [0.12, 0.6],
          [0.88, 0.38],
        ],
      },
      translation: [
        "W: 준호야, 이게 청소 끝낸 동아리방 사진이야?",
        "M: 응, 넷이서 토요일 내내 했어.",
        "W: 뒷벽에 넓은 게시판이 있네.",
        "M: 거기에 다들 사진을 붙였어.",
        "W: 그리고 가운데에 네모난 탁자가 있고.",
        "M: 사실 둥근 탁자야. 네모난 건 망가졌어.",
        "W: 탁자 밑에 의자 두 개가 들어가 있네.",
        "M: 나머지는 구석에 쌓아 둬.",
        "W: 문 옆에는 키 큰 화분이 있고.",
        "M: 민지가 금요일 오후마다 물을 줘.",
        "W: 선반에는 작은 스피커가 있네.",
        "M: 일할 때 트는 음악용이야.",
      ].join("\n"),
    },
    {
      order: 5,
      type: "할 일",
      instruction: "대화를 듣고, 여자가 할 일로 가장 적절한 것을 고르시오.",
      lines: [
        ["M", "Dain, the school broadcast goes out in half an hour."],
        ["W", "The script is written and the microphone is tested."],
        ["M", "Did anyone find the recording of last week's interview?"],
        ["W", "It should be on the studio computer."],
        ["M", "I looked there twice and found nothing."],
        ["W", "Then it may still be on the recorder itself."],
        ["M", "The recorder went back to the equipment room on Friday."],
        ["W", "That room opens until four today."],
        ["M", "It's ten past three now."],
        ["W", "Then there's just enough time to go down."],
        ["M", "I'll keep reading through the script here."],
        ["W", "I'll go and get the recorder from the equipment room."],
      ],
      choices: [
        "대본을 읽어 보기",
        "마이크를 점검하기",
        "기자재실에서 녹음기를 가져오기",
        "면담을 다시 하기",
        "컴퓨터를 고치기",
      ],
      answer: 3,
      clue: "I'll go and get the recorder from the equipment room.",
      explanation:
        "여자는 기자재실에서 녹음기를 가져오겠다고 했다. 따라서 답은 ③이다.",
      translation: [
        "M: 다인아, 학교 방송이 30분 뒤에 나가.",
        "W: 대본은 다 썼고 마이크도 확인했어.",
        "M: 지난주 면담 녹음은 누가 찾았어?",
        "W: 방송실 컴퓨터에 있을 텐데.",
        "M: 거기 두 번 봤는데 없었어.",
        "W: 그럼 아직 녹음기 안에 있을지도 몰라.",
        "M: 녹음기는 금요일에 기자재실로 갔어.",
        "W: 그 방은 오늘 네 시까지 열어.",
        "M: 지금 세 시 10분이야.",
        "W: 그럼 내려갔다 올 시간은 딱 돼.",
        "M: 나는 여기서 대본을 계속 읽고 있을게.",
        "W: 내가 기자재실에서 녹음기를 가져올게.",
      ].join("\n"),
    },
    {
      order: 6,
      type: "금액 계산",
      instruction: "대화를 듣고, 남자가 지불할 금액을 고르시오.",
      lines: [
        ["W", "Good afternoon. Are you booking the study room?"],
        ["M", "Yes, for three hours on Saturday morning."],
        ["W", "The small room costs six dollars an hour."],
        ["M", "How many people fit in the small one?"],
        ["W", "Four, and the large one takes eight for ten dollars."],
        ["M", "There are five of us coming."],
        ["W", "Then you need the large room."],
        ["M", "Three hours in the large room, please."],
        ["W", "Members of the center get ten percent off."],
        ["M", "I joined in March. Here's my card."],
        ["W", "Then the discount applies to the whole booking."],
        ["M", "Good, I'll pay now."],
      ],
      choices: ["$16.20", "$24.30", "$27.00", "$30.00", "$32.40"],
      answer: 3,
      clue: "the large one takes eight for ten dollars",
      explanation:
        "큰 방 세 시간이면 30달러인데, 10퍼센트를 빼면 27달러이다. 따라서 답은 ③이다.",
      translation: [
        "W: 안녕하세요. 학습실 예약하시나요?",
        "M: 네, 토요일 오전에 세 시간이요.",
        "W: 작은 방은 한 시간에 6달러입니다.",
        "M: 작은 방에는 몇 명이 들어가나요?",
        "W: 네 명이요. 큰 방은 여덟 명에 10달러입니다.",
        "M: 저희는 다섯 명이 가요.",
        "W: 그럼 큰 방이 필요하시겠네요.",
        "M: 큰 방으로 세 시간 부탁드려요.",
        "W: 센터 회원은 10퍼센트 할인됩니다.",
        "M: 3월에 가입했어요. 여기 카드요.",
        "W: 그럼 예약 전체에 할인이 들어갑니다.",
        "M: 좋네요, 지금 낼게요.",
      ].join("\n"),
    },
    {
      order: 7,
      type: "이유 파악",
      instruction: "대화를 듣고, 남자가 봉사 활동을 그만둔 이유를 고르시오.",
      lines: [
        ["W", "Kiyoung, I heard you stopped going to the community kitchen."],
        ["W", "You went every other Saturday for almost a year."],
        ["M", "I finished my last shift two weeks ago."],
        ["W", "Was the work too hard in the end?"],
        ["M", "The work was fine. I liked the people there."],
        ["W", "Then did your parents ask you to stop?"],
        ["M", "They never said a word about it."],
        ["W", "So what changed?"],
        ["M", "They moved the shift to Saturday afternoons."],
        ["W", "And that's when your math class is."],
        ["M", "Right, and I can't move the class."],
        ["W", "That's a shame. Maybe it will move back."],
      ],
      choices: [
        "봉사 시간이 수업과 겹쳐서",
        "일이 너무 힘들어서",
        "부모님이 반대해서",
        "몸이 아파서",
        "다른 봉사를 시작해서",
      ],
      answer: 1,
      clue: "They moved the shift to Saturday afternoons.",
      explanation:
        "봉사 시간이 토요일 오후로 옮겨져 수업과 겹쳤다. 따라서 답은 ①이다.",
      translation: [
        "W: 기영아, 지역 급식소에 안 나간다며.",
        "W: 거의 1년을 격주 토요일마다 갔잖아.",
        "M: 두 주 전에 마지막 차례를 마쳤어.",
        "W: 결국 일이 너무 힘들었어?",
        "M: 일은 괜찮았어. 거기 사람들도 좋았고.",
        "W: 그럼 부모님이 그만두라고 하셨어?",
        "M: 그런 말씀은 한 번도 없으셨어.",
        "W: 그럼 뭐가 바뀐 거야?",
        "M: 봉사 시간을 토요일 오후로 옮겼어.",
        "W: 그때 네 수학 수업이 있잖아.",
        "M: 맞아, 수업은 못 옮겨.",
        "W: 아쉽다. 다시 돌아올지도 모르지.",
      ].join("\n"),
    },
    {
      order: 8,
      type: "미언급",
      instruction: "대화를 듣고, 교내 요리 대회에 관해 언급되지 않은 것을 고르시오.",
      lines: [
        ["M", "Bora, are you entering the school cooking contest?"],
        ["M", "I heard the sign-up sheet went up this morning."],
        ["W", "I saw it. When is the contest held?"],
        ["M", "On the second Friday of next month, after school."],
        ["W", "Where do they hold it?"],
        ["M", "In the cooking room on the first floor."],
        ["W", "How many can be on one team?"],
        ["M", "Two students, and you bring your own ingredients."],
        ["W", "Is there a theme this year?"],
        ["M", "A dish that uses no more than five ingredients."],
        ["W", "That sounds harder than it looks."],
        ["M", "You also have only forty minutes to finish."],
        ["W", "Then I need a partner who works fast."],
      ],
      choices: ["열리는 날", "열리는 곳", "한 팀의 인원", "올해 주제", "심사 위원"],
      answer: 5,
      clue: "On the second Friday of next month, after school.",
      explanation:
        "날짜, 장소, 인원, 주제는 말했지만 심사 위원은 말하지 않았다. 따라서 답은 ⑤이다.",
      translation: [
        "M: 보라야, 교내 요리 대회에 나갈 거야?",
        "M: 오늘 아침에 신청서가 붙었대.",
        "W: 봤어. 대회가 언제야?",
        "M: 다음 달 둘째 주 금요일, 방과 후에.",
        "W: 어디서 해?",
        "M: 1층 조리실에서.",
        "W: 한 팀에 몇 명이야?",
        "M: 두 명이고 재료는 각자 가져와.",
        "W: 올해 주제가 있어?",
        "M: 재료를 다섯 가지 넘게 쓰지 않는 요리.",
        "W: 보기보다 어렵겠다.",
        "M: 게다가 끝내는 데 40분밖에 안 줘.",
        "W: 그럼 손이 빠른 짝이 필요하겠네.",
      ].join("\n"),
    },
    {
      order: 9,
      type: "내용 불일치",
      instruction: "다음을 듣고, 겨울 방학 영어 캠프에 관한 내용과 일치하지 않는 것을 고르시오.",
      lines: [
        [
          "M",
          "Hello, students. Here is the plan for the winter English camp. " +
            "The camp runs for five days, from January twelfth to sixteenth. " +
            "It takes place in the language classrooms on the fourth floor. " +
            "Twenty-four students may join, twelve from each grade. " +
            "Mornings are for speaking practice in small groups. " +
            "Afternoons are for preparing a short play in English. " +
            "On the last day each group performs in the main hall. " +
            "There is no fee, but you should bring your own lunch. " +
            "Apply at the English office by the end of this week.",
        ],
      ],
      choices: [
        "1월 12일부터 16일까지 닷새 동안 진행된다",
        "4층 어학 교실에서 열린다",
        "학년마다 열두 명씩 참여할 수 있다",
        "오후에는 영어 연극을 준비한다",
        "참가비를 내야 한다",
      ],
      answer: 5,
      clue: "There is no fee, but you should bring your own lunch.",
      explanation:
        "참가비는 없다고 했으므로 ⑤가 일치하지 않는다.",
      translation: [
        "M: 학생 여러분, 안녕하세요. 겨울 영어 캠프 계획을 알려 드립니다. 캠프는 1월 12일부터 16일까지 닷새 동안 진행됩니다. 4층 어학 교실에서 열립니다. 학년마다 열두 명씩, 모두 스물네 명이 참여할 수 있습니다. 오전에는 작은 모둠으로 말하기 연습을 합니다. 오후에는 영어로 하는 짧은 연극을 준비합니다. 마지막 날에는 모둠마다 대강당에서 공연합니다. 참가비는 없고, 점심은 각자 가져오셔야 합니다. 이번 주말까지 영어과 교무실에서 신청하세요.",
      ].join("\n"),
    },
    {
      order: 10,
      type: "표 선택",
      instruction: "다음 표를 보면서 대화를 듣고, 여자가 신청할 강좌를 고르시오.",
      lines: [
        ["M", "Hyejin, which online course are you taking this winter?"],
        ["W", "Five came up when I searched the center's page."],
        ["M", "How many weeks can you give it?"],
        ["W", "Six at most, before the new term starts."],
        ["M", "One of them runs for twelve weeks."],
        ["W", "That's too long for me this time."],
        ["M", "What about the fee?"],
        ["W", "Under seventy thousand won, my parents said."],
        ["M", "Two of these are above that amount."],
        ["W", "And it has to have a live class, not only videos."],
        ["M", "Then only one course fits everything."],
        ["W", "I'll register before the seats fill up."],
      ],
      choices: ["①", "②", "③", "④", "⑤"],
      answer: 4,
      clue: "Six at most, before the new term starts.",
      explanation:
        "6주 이내, 7만 원 미만, 실시간 수업이 있는 강좌는 ④이다. 따라서 답은 ④이다.",
      table: {
        rows: [
          { no: 1, label: "①", value: "Weeks: 12 / Fee: 60,000 won / Type: Live" },
          { no: 2, label: "②", value: "Weeks: 5 / Fee: 80,000 won / Type: Live" },
          { no: 3, label: "③", value: "Weeks: 4 / Fee: 55,000 won / Type: Video" },
          { no: 4, label: "④", value: "Weeks: 6 / Fee: 68,000 won / Type: Live" },
          { no: 5, label: "⑤", value: "Weeks: 6 / Fee: 75,000 won / Type: Video" },
        ],
      },
      translation: [
        "M: 혜진아, 이번 겨울에 어떤 인터넷 강좌 들을 거야?",
        "W: 센터 누리집에서 찾아보니 다섯 개가 나왔어.",
        "M: 몇 주나 쓸 수 있어?",
        "W: 새 학기 시작 전까지 길어야 6주.",
        "M: 하나는 12주짜리네.",
        "W: 이번엔 나한테 너무 길어.",
        "M: 수강료는?",
        "W: 부모님이 7만 원 미만이라고 하셨어.",
        "M: 이 중 두 개는 그보다 비싸.",
        "W: 그리고 영상만 말고 실시간 수업이 있어야 해.",
        "M: 그럼 다 맞는 건 하나뿐이야.",
        "W: 자리 차기 전에 신청할게.",
      ].join("\n"),
    },
    {
      order: 11,
      type: "짧은 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Are you going to the writing workshop on Friday?"],
        ["M", "I signed up but I haven't written anything yet."],
        ["W", "They ask you to bring one page."],
        ["M", "One page by Friday is doable."],
        ["W", "Shall we write ours in the library tomorrow?"],
      ],
      choices: [
        "Sure, right after school.",
        "The workshop was cancelled.",
        "I don't like writing.",
        "I already wrote ten pages.",
        "The library is closed all week.",
      ],
      answer: 1,
      clue: "Shall we write ours in the library tomorrow?",
      explanation:
        "내일 도서관에서 같이 쓰자는 제안이므로, 방과 후에 하자는 ①이 가장 자연스럽다.",
      translation: [
        "W: 금요일 글쓰기 모임에 갈 거야?",
        "M: 신청은 했는데 아직 아무것도 안 썼어.",
        "W: 한 쪽을 가져오라고 했어.",
        "M: 금요일까지 한 쪽이면 할 만해.",
        "W: 내일 도서관에서 같이 쓸까?",
        "M: 좋아, 방과 후에 바로.",
      ].join("\n"),
    },
    {
      order: 12,
      type: "짧은 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Excuse me, is the science lab open after school?"],
        ["W", "Only when a teacher is inside."],
        ["M", "Do you know who is there on Thursdays?"],
        ["W", "Mr. Kang usually stays until five."],
        ["M", "Should I ask him first before I go?"],
      ],
      choices: [
        "The lab moved upstairs.",
        "Yes, he prefers that.",
        "I never go there.",
        "There are no teachers.",
        "You can't use the lab.",
      ],
      answer: 2,
      clue: "Should I ask him first before I go?",
      explanation:
        "먼저 여쭤봐야 하는지 물었으므로, 그편을 좋아하신다는 ②가 가장 자연스럽다.",
      translation: [
        "M: 실례합니다, 과학실이 방과 후에 여나요?",
        "W: 선생님이 안에 계실 때만요.",
        "M: 목요일에는 누가 계시는지 아세요?",
        "W: 보통 강 선생님이 다섯 시까지 계세요.",
        "M: 가기 전에 먼저 여쭤보는 게 나을까요?",
        "W: 네, 그편을 좋아하세요.",
      ].join("\n"),
    },
    {
      order: 13,
      type: "긴 응답",
      instruction: "대화를 듣고, 남자의 마지막 말에 대한 여자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Woman : ________________",
      lines: [
        ["M", "Chaerin, how is the class newspaper going this term?"],
        ["W", "We print two hundred copies and half come back."],
        ["M", "Do people say why they don't read it?"],
        ["W", "One said the articles were too long for a break."],
        ["M", "How long is a typical article?"],
        ["W", "About eight hundred letters, sometimes more."],
        ["M", "That's a lot to finish standing in a hallway."],
        ["W", "But short articles feel thin to us."],
        ["M", "Thin and unread are not the same problem."],
        ["W", "I suppose an unread article is thinner still."],
        ["M", "What length would a student finish in one break?"],
      ],
      choices: [
        "Nobody reads anything.",
        "Maybe three hundred letters.",
        "We'll print a thousand copies.",
        "I'll write longer articles.",
        "The newspaper is closing.",
      ],
      answer: 2,
      clue: "What length would a student finish in one break?",
      explanation:
        "쉬는 시간에 다 읽을 분량을 물었으므로, 300자쯤이라는 ②가 가장 자연스럽다.",
      translation: [
        "M: 채린아, 이번 학기 학급 신문은 잘돼 가?",
        "W: 200부를 찍는데 절반이 돌아와.",
        "M: 왜 안 읽는지 말하는 사람이 있어?",
        "W: 한 명은 쉬는 시간에 읽기엔 기사가 길다고 했어.",
        "M: 기사 하나가 보통 얼마나 길어?",
        "W: 800자쯤, 더 길 때도 있어.",
        "M: 복도에 서서 다 읽기엔 많다.",
        "W: 그런데 짧으면 우리한테는 빈약해 보여.",
        "M: 빈약한 것과 안 읽히는 것은 다른 문제야.",
        "W: 안 읽히는 기사가 더 빈약하긴 하겠다.",
        "M: 쉬는 시간 한 번에 다 읽을 분량은 얼마쯤일까?",
        "W: 300자쯤 되려나.",
      ].join("\n"),
    },
    {
      order: 14,
      type: "긴 응답",
      instruction: "대화를 듣고, 여자의 마지막 말에 대한 남자의 응답으로 가장 적절한 것을 고르시오.",
      questionText: "▶ Man : ________________",
      lines: [
        ["W", "Seongho, you said you wanted to fix your sleep."],
        ["M", "I go to bed at one and get up at six thirty."],
        ["W", "That's five and a half hours on a school night."],
        ["M", "I know, and I fall asleep in fifth period."],
        ["W", "What keeps you up until one?"],
        ["M", "I start my homework around eleven."],
        ["W", "What happens between dinner and eleven?"],
        ["M", "I lie down for a minute and it turns into two hours."],
        ["W", "So the problem is the evening, not the night."],
        ["M", "I never thought of it that way."],
        ["W", "What time could you realistically start homework?"],
      ],
      choices: [
        "I'll start at midnight.",
        "Around eight, probably.",
        "I don't have homework.",
        "I'll stop sleeping.",
        "Homework is useless.",
      ],
      answer: 2,
      clue: "What time could you realistically start homework?",
      explanation:
        "현실적으로 몇 시에 숙제를 시작할 수 있는지 물었으므로, 여덟 시쯤이라는 ②가 가장 자연스럽다.",
      translation: [
        "W: 성호야, 잠을 고치고 싶다고 했잖아.",
        "M: 한 시에 자고 여섯 시 반에 일어나.",
        "W: 학교 가는 날에 다섯 시간 반이네.",
        "M: 알아. 그래서 5교시에 졸아.",
        "W: 한 시까지 뭐 하느라 안 자?",
        "M: 열한 시쯤 숙제를 시작해.",
        "W: 저녁 먹고 열한 시까지는 뭘 해?",
        "M: 잠깐 눕는다는 게 두 시간이 돼.",
        "W: 그럼 문제는 밤이 아니라 저녁이네.",
        "M: 그렇게 생각해 본 적이 없어.",
        "W: 현실적으로 몇 시에 숙제를 시작할 수 있어?",
        "M: 아마 여덟 시쯤.",
      ].join("\n"),
    },
    {
      order: 15,
      type: "상황 발화",
      instruction: "다음 상황 설명을 듣고, Wonbin이 Jiyoon에게 할 말로 가장 적절한 것을 고르시오.",
      questionText: "▶ Wonbin : ________________",
      lines: [
        [
          "M",
          "Wonbin and Jiyoon are preparing the club booth for the school festival. " +
            "Jiyoon has made a beautiful poster with careful drawings, " +
            "but every word on it is written in very small letters. " +
            "The booth will stand at the far end of the playground, " +
            "and visitors will read the poster from several steps away. " +
            "Wonbin stood back this morning and could not read a single word. " +
            "He knows the drawings are fine but the writing will be invisible. " +
            "He wants to tell her to write the letters much larger. " +
            "In this situation, what would Wonbin most likely say to Jiyoon?",
        ],
      ],
      choices: [
        "Add more drawings to the poster.",
        "The festival is next month.",
        "The letters need to be much bigger.",
        "Let's take the poster down.",
        "Nobody comes to the playground.",
      ],
      answer: 3,
      clue: "He wants to tell her to write the letters much larger.",
      explanation:
        "멀리서 글씨가 안 보이므로, 글씨를 훨씬 크게 하라는 ③이 가장 적절하다.",
      translation: [
        "M: 원빈이와 지윤이는 학교 축제에 쓸 동아리 부스를 준비하고 있습니다. 지윤이는 정성 들인 그림으로 아름다운 안내판을 만들었지만, 거기 적힌 글씨가 모두 아주 작습니다. 부스는 운동장 맨 끝에 설 예정이고, 관람객은 몇 걸음 떨어져서 안내판을 읽게 됩니다. 원빈이는 오늘 아침에 물러서서 봤는데 한 글자도 읽을 수 없었습니다. 그는 그림은 좋지만 글씨는 보이지 않으리라는 것을 압니다. 그는 글씨를 훨씬 크게 쓰라고 말하고 싶습니다. 이런 상황에서 원빈이가 지윤이에게 할 말로 가장 적절한 것은 무엇일까요?",
      ].join("\n"),
    },
    {
      order: 16,
      type: "주제",
      instruction: "다음을 듣고, 여자가 하는 말의 주제로 가장 적절한 것을 고르시오.",
      lines: [
        [
          "W",
          "Hello, everyone. Today I want to talk about the ways plants move " +
            "even though they cannot walk away from where they grow. " +
            "The sunflower turns its young head through the day to follow the light, " +
            "and returns to face east again during the night. " +
            "The Venus flytrap counts: a single touch on its hairs does nothing, " +
            "but two touches within twenty seconds snap the trap shut. " +
            "Climbing vines swing their growing tips in slow circles " +
            "until they strike something solid, then wind around it. " +
            "The seed pod of the squirting cucumber builds up pressure for weeks " +
            "and then throws its seeds several meters in a single burst. " +
            "Movement, it turns out, is not the property of animals alone. " +
            "It is simply slower, and easier to miss, in the plants around us.",
        ],
      ],
      choices: [
        "how plants move in their own ways",
        "why sunlight is necessary for growth",
        "how seeds travel to new places",
        "why some plants catch insects",
        "how vines damage old buildings",
      ],
      answer: 1,
      clue: "Movement, it turns out, is not the property of animals alone.",
      explanation:
        "식물이 저마다의 방식으로 움직인다는 것이 중심 내용이다. 따라서 답은 ①이다.",
      translation: [
        "W: 여러분, 안녕하세요. 오늘은 식물이 자란 자리를 떠나 걸어갈 수 없는데도 어떻게 움직이는지 이야기하려 합니다. 해바라기는 어린 머리를 하루 동안 돌려 빛을 따라가고, 밤사이에 다시 동쪽을 향합니다. 파리지옥은 셈을 합니다. 털을 한 번 건드리면 아무 일도 없지만, 20초 안에 두 번 건드리면 덫이 닫힙니다. 덩굴은 자라는 끝을 느린 원을 그리며 휘둘러 단단한 것에 닿으면 그것을 감습니다. 오이 종류인 스쿼팅 큐컴버의 씨주머니는 몇 주 동안 압력을 쌓았다가 한 번에 씨를 몇 미터 밖으로 쏘아 보냅니다. 움직임은 동물만의 것이 아닙니다. 다만 우리 주변 식물에서는 더 느리고, 그래서 놓치기 쉬울 뿐입니다.",
      ].join("\n"),
    },
    {
      order: 17,
      type: "언급 여부",
      instruction: "다음을 듣고, 언급된 식물이 아닌 것을 고르시오.",
      lines: [
        ["W", "The sunflower turns its young head through the day to follow the light."],
        ["W", "The Venus flytrap counts the touches on its hairs."],
        ["W", "Climbing vines swing their growing tips in slow circles."],
        ["W", "The seed pod of the squirting cucumber builds up pressure for weeks."],
        ["W", "Movement is not the property of animals alone."],
      ],
      choices: ["sunflowers", "Venus flytraps", "climbing vines", "squirting cucumbers", "bamboo"],
      answer: 5,
      clue: "The seed pod of the squirting cucumber builds up pressure for weeks.",
      explanation:
        "해바라기, 파리지옥, 덩굴, 스쿼팅 큐컴버는 언급되지만 대나무는 나오지 않았다. 따라서 답은 ⑤이다.",
      translation: "16번과 같은 담화입니다.",
    },
  ],
};
